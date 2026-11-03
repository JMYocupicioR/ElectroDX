import { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import {
  CheckCircle2,
  AlertTriangle,
  Clock,
  RotateCcw,
  Sparkles,
  ExternalLink,
  ShieldAlert,
} from 'lucide-react';
import type { LiveWorkshop } from '../../types/database';
import { parseVideoUrl, getVideoEmbedSrc } from '../../utils/mediaValidation';
import {
  mergeWatchedIntervals,
  calculateWatchedCoverage,
  formatVideoTime,
  hasMeaningfulWatchDelta,
  VIDEO_SYNC_INTERVAL_MS,
  VIDEO_SYNC_INTERVAL_AFTER_ACCREDITED_MS,
  type TimeInterval,
} from '../../utils/videoProgressTracker';
import {
  getWorkshopVideoProgress,
  logVideoWatchHeartbeat,
  logVideoWatchHeartbeatKeepalive,
  type HeartbeatSyncReason,
} from '../../services/videoProgressService';
import { supabase } from '../../lib/supabase';

interface TrackedLiveClassPlayerProps {
  workshop: LiveWorkshop;
  userId: string;
  onAttendanceAccredited?: () => void;
  className?: string;
}

let ytApiPromise: Promise<any> | null = null;

// Cargador único de la IFrame API: si el script ya está en vuelo, reutiliza la promesa.
function loadYouTubeIframeApi(): Promise<any> {
  const w = window as any;
  if (w.YT && w.YT.Player) return Promise.resolve(w.YT);
  if (ytApiPromise) return ytApiPromise;

  ytApiPromise = new Promise((resolve, reject) => {
    let settled = false;
    let pollId = 0;
    let timeoutId = 0;

    const finish = () => {
      if (settled) return;
      settled = true;
      window.clearInterval(pollId);
      window.clearTimeout(timeoutId);
      resolve(w.YT);
    };

    const previousCallback = w.onYouTubeIframeAPIReady;
    w.onYouTubeIframeAPIReady = () => {
      try {
        previousCallback?.();
      } catch {}
      if (w.YT?.Player) finish();
    };

    if (!document.getElementById('youtube-iframe-api')) {
      const tag = document.createElement('script');
      tag.id = 'youtube-iframe-api';
      tag.src = 'https://www.youtube.com/iframe_api';
      tag.async = true;
      document.head.appendChild(tag);
    }

    pollId = window.setInterval(() => {
      if (w.YT?.Player) finish();
    }, 100);

    timeoutId = window.setTimeout(() => {
      if (settled) return;
      settled = true;
      window.clearInterval(pollId);
      ytApiPromise = null;
      reject(new Error('YouTube IFrame API timeout'));
    }, 15000);
  });

  return ytApiPromise;
}

export function TrackedLiveClassPlayer({
  workshop,
  userId,
  onAttendanceAccredited,
  className = '',
}: TrackedLiveClassPlayerProps) {
  const recordingUrl = workshop.recording_url || '';
  const parsedVideo = useMemo(() => parseVideoUrl(recordingUrl), [recordingUrl]);
  const ytVideoId = parsedVideo?.kind === 'youtube' ? parsedVideo.videoId : null;
  const vimeoVideoId = parsedVideo?.kind === 'vimeo' ? parsedVideo.videoId : null;
  const minRequiredPercent = workshop.min_watch_percent ?? 85;

  const [loadingInitial, setLoadingInitial] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [coveragePercent, setCoveragePercent] = useState(0);
  const [isFullyWatched, setIsFullyWatched] = useState(false);
  const [accreditedJustNow, setAccreditedJustNow] = useState(false);
  const [resumePrompt, setResumePrompt] = useState<number | null>(null);
  const [tabIsHidden, setTabIsHidden] = useState(false);
  const [playerStatus, setPlayerStatus] = useState<'idle' | 'loading' | 'ready' | 'error'>('idle');
  const [playerRetryKey, setPlayerRetryKey] = useState(0);

  // Referencias mutables para evitar re-creación de funciones y bucles infinitos en useEffect
  const watchedSegmentsRef = useRef<TimeInterval[]>([]);
  const currentTimeRef = useRef<number>(0);
  const durationRef = useRef<number>(0);
  const isFullyWatchedRef = useRef<boolean>(false);
  const syncInFlightRef = useRef(false);
  const lastSyncedCoverageRef = useRef(0);
  const lastSyncedPositionRef = useRef(0);
  const accessTokenRef = useRef<string | null>(null);
  const thresholdSyncSentRef = useRef(false);

  const ytPlayerRef = useRef<any>(null);
  const ytContainerRef = useRef<HTMLDivElement>(null);
  const vimeoPlayerRef = useRef<any>(null);
  const vimeoIframeRef = useRef<HTMLIFrameElement>(null);
  const trackingIntervalRef = useRef<any>(null);
  const lastSyncTimeRef = useRef<number>(0);
  const lastTickTimeRef = useRef<number | null>(null);

  // 1. Cargar estado previo de la base de datos
  useEffect(() => {
    let cancelled = false;
    getWorkshopVideoProgress(workshop.id, userId).then((progress) => {
      if (cancelled) return;
      if (progress) {
        const segs = (progress.watched_segments || []) as TimeInterval[];
        watchedSegmentsRef.current = segs;
        currentTimeRef.current = progress.last_position_seconds || 0;
        durationRef.current = progress.total_duration_seconds || 0;
        isFullyWatchedRef.current = progress.is_fully_watched || false;
        thresholdSyncSentRef.current = progress.is_fully_watched || false;
        lastSyncedCoverageRef.current = progress.watched_percentage || 0;
        lastSyncedPositionRef.current = progress.last_position_seconds || 0;

        setCoveragePercent(progress.watched_percentage || 0);
        setIsFullyWatched(progress.is_fully_watched || false);
        setCurrentTime(progress.last_position_seconds || 0);
        if (progress.total_duration_seconds > 0) {
          setDuration(progress.total_duration_seconds);
        }
        if (
          progress.last_position_seconds > 15 &&
          (!progress.total_duration_seconds ||
            progress.last_position_seconds < progress.total_duration_seconds - 30)
        ) {
          setResumePrompt(progress.last_position_seconds);
        }
      }
      setLoadingInitial(false);
    });

    return () => {
      cancelled = true;
    };
  }, [workshop.id, userId]);

  // Token fresco para keepalive en pagehide/beforeunload
  useEffect(() => {
    let cancelled = false;
    supabase.auth.getSession().then(({ data }) => {
      if (!cancelled) accessTokenRef.current = data.session?.access_token ?? null;
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      accessTokenRef.current = session?.access_token ?? null;
    });
    return () => {
      cancelled = true;
      sub.subscription.unsubscribe();
    };
  }, []);

  // Sincronizar latido con el servidor (dedupe + skip no-ops + intervalos adaptativos)
  const syncHeartbeat = useCallback(
    async (
      overrideSegments?: TimeInterval[],
      overrideTime?: number,
      overrideDur?: number,
      options?: { force?: boolean; reason?: HeartbeatSyncReason }
    ) => {
      const segs = overrideSegments ?? watchedSegmentsRef.current;
      const cur = overrideTime ?? currentTimeRef.current;
      const dur = overrideDur ?? durationRef.current;
      const force = options?.force === true;

      if (!workshop.id || !userId || dur <= 0) return;
      if (syncInFlightRef.current) return;

      const localCoverage = calculateWatchedCoverage(segs, dur);
      const intervalMs = isFullyWatchedRef.current
        ? VIDEO_SYNC_INTERVAL_AFTER_ACCREDITED_MS
        : VIDEO_SYNC_INTERVAL_MS;

      if (!force) {
        if (Date.now() - lastSyncTimeRef.current < intervalMs) return;
        if (
          !hasMeaningfulWatchDelta({
            coverage: localCoverage,
            position: cur,
            lastCoverage: lastSyncedCoverageRef.current,
            lastPosition: lastSyncedPositionRef.current,
          })
        ) {
          lastSyncTimeRef.current = Date.now();
          return;
        }
      }

      // Marcar ANTES del await para evitar stampede de RPCs concurrentes
      syncInFlightRef.current = true;
      lastSyncTimeRef.current = Date.now();

      try {
        const res = await logVideoWatchHeartbeat({
          workshopId: workshop.id,
          userId,
          currentTime: cur,
          duration: dur,
          segments: segs,
          minWatchPercent: minRequiredPercent,
        });

        lastSyncedCoverageRef.current = Math.max(
          lastSyncedCoverageRef.current,
          localCoverage,
          res.watched_percentage || 0
        );
        lastSyncedPositionRef.current = cur;

        // La cobertura local (segmentos) es la fuente de verdad durante reproducción;
        // el servidor solo confirma acreditación.
        if (res.is_fully_watched && !isFullyWatchedRef.current) {
          isFullyWatchedRef.current = true;
          setIsFullyWatched(true);
          setAccreditedJustNow(true);
          onAttendanceAccredited?.();
        }
      } finally {
        syncInFlightRef.current = false;
      }
    },
    [workshop.id, userId, minRequiredPercent, onAttendanceAccredited]
  );

  const flushKeepalive = useCallback(() => {
    const dur = durationRef.current;
    if (!workshop.id || !userId || dur <= 0) return;

    logVideoWatchHeartbeatKeepalive({
      workshopId: workshop.id,
      userId,
      currentTime: currentTimeRef.current,
      duration: dur,
      segments: watchedSegmentsRef.current,
      minWatchPercent: minRequiredPercent,
      accessToken: accessTokenRef.current,
    });
    lastSyncTimeRef.current = Date.now();
    lastSyncedCoverageRef.current = calculateWatchedCoverage(
      watchedSegmentsRef.current,
      dur
    );
    lastSyncedPositionRef.current = currentTimeRef.current;
  }, [workshop.id, userId, minRequiredPercent]);

  // Registro de un tick de avance en tiempo real (1 segundo) - Función estable
  const recordPlaybackTick = useCallback(
    (nowSec: number, totalDur: number) => {
      if (totalDur > 0 && durationRef.current !== totalDur) {
        durationRef.current = totalDur;
        setDuration(totalDur);
      }
      currentTimeRef.current = nowSec;
      setCurrentTime(nowSec);

      try {
        (window as any).__NEUROSAFE_CURRENT_VIDEO_TIME__ = nowSec;
        window.dispatchEvent(
          new CustomEvent('neurosafe:video-tick', {
            detail: { currentTime: nowSec, duration: totalDur },
          })
        );
      } catch {}

      const prevSec = lastTickTimeRef.current;
      lastTickTimeRef.current = nowSec;

      // Si el salto fue suave (menos de 2.5s entre ticks) contamos el segmento
      if (prevSec !== null && nowSec > prevSec && nowSec - prevSec < 2.5) {
        const updated = mergeWatchedIntervals(watchedSegmentsRef.current, [prevSec, nowSec]);
        watchedSegmentsRef.current = updated;
        const newCov = calculateWatchedCoverage(updated, totalDur);
        setCoveragePercent(newCov);

        const crossedThreshold =
          !isFullyWatchedRef.current &&
          !thresholdSyncSentRef.current &&
          newCov >= minRequiredPercent;

        if (crossedThreshold) {
          thresholdSyncSentRef.current = true;
          void syncHeartbeat(updated, nowSec, totalDur, {
            force: true,
            reason: 'threshold',
          });
        } else {
          const intervalMs = isFullyWatchedRef.current
            ? VIDEO_SYNC_INTERVAL_AFTER_ACCREDITED_MS
            : VIDEO_SYNC_INTERVAL_MS;
          if (Date.now() - lastSyncTimeRef.current >= intervalMs) {
            void syncHeartbeat(updated, nowSec, totalDur, { reason: 'periodic' });
          }
        }
      }
    },
    [syncHeartbeat, minRequiredPercent]
  );

  // Callbacks estables para los listeners de los reproductores (evita recrear el player)
  const callbacksRef = useRef({ recordPlaybackTick, syncHeartbeat });
  useEffect(() => {
    callbacksRef.current = { recordPlaybackTick, syncHeartbeat };
  }, [recordPlaybackTick, syncHeartbeat]);

  const handleReloadPlayer = useCallback(() => {
    setPlayerStatus('loading');
    setPlayerRetryKey((key) => key + 1);
  }, []);

  // 2. Control de visibilidad de pestaña (pausar o marcar aviso)
  useEffect(() => {
    const handleVisibilityChange = () => {
      const hidden = document.hidden;
      setTabIsHidden(hidden);
      if (hidden) {
        if (ytPlayerRef.current?.pauseVideo && typeof ytPlayerRef.current.pauseVideo === 'function') {
          try {
            ytPlayerRef.current.pauseVideo();
          } catch {}
        }
        if (vimeoPlayerRef.current?.pause && typeof vimeoPlayerRef.current.pause === 'function') {
          try {
            vimeoPlayerRef.current.pause().catch(() => {});
          } catch {}
        }
        void syncHeartbeat(undefined, undefined, undefined, {
          force: true,
          reason: 'visibility',
        });
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [syncHeartbeat]);

  // Sincronizar al salir: keepalive (no depende de promesas async)
  useEffect(() => {
    const handlePageHide = () => {
      flushKeepalive();
    };
    window.addEventListener('pagehide', handlePageHide);
    window.addEventListener('beforeunload', handlePageHide);
    return () => {
      window.removeEventListener('pagehide', handlePageHide);
      window.removeEventListener('beforeunload', handlePageHide);
      flushKeepalive();
    };
  }, [flushKeepalive]);

  // 3. Inicializador de YOUTUBE (espera a que el contenedor exista y la API esté lista)
  useEffect(() => {
    if (!ytVideoId || loadingInitial) return;

    const host = ytContainerRef.current;
    if (!host) return;

    let destroyed = false;
    let readyTimeout = 0;

    setPlayerStatus('loading');

    readyTimeout = window.setTimeout(() => {
      if (!destroyed) {
        setPlayerStatus((prev) => (prev === 'ready' ? prev : 'error'));
      }
    }, 6000);

    loadYouTubeIframeApi()
      .then((YT) => {
        if (destroyed || ytPlayerRef.current) return;
        const currentHost = ytContainerRef.current;
        if (!currentHost) return;

        currentHost.innerHTML = '';
        const mount = document.createElement('div');
        mount.className = 'w-full h-full';
        currentHost.appendChild(mount);

        try {
          ytPlayerRef.current = new YT.Player(mount, {
            videoId: ytVideoId,
            playerVars: {
              enablejsapi: 1,
              modestbranding: 1,
              rel: 0,
              playsinline: 1,
              origin: window.location.origin,
            },
            events: {
              onReady: (event: any) => {
                if (destroyed) return;
                window.clearTimeout(readyTimeout);
                setPlayerStatus('ready');
                try {
                  const dur = event.target.getDuration();
                  if (dur > 0) {
                    durationRef.current = dur;
                    setDuration(dur);
                  }
                } catch {}
              },
              onError: () => {
                if (!destroyed) setPlayerStatus('error');
              },
              onStateChange: (event: any) => {
                if (destroyed) return;
                const state = event.data;
                // 1 = PLAYING, 2 = PAUSED, 0 = ENDED
                if (state === 1) {
                  setIsPlaying(true);
                  try {
                    lastTickTimeRef.current = event.target.getCurrentTime();
                  } catch {}

                  clearInterval(trackingIntervalRef.current);
                  trackingIntervalRef.current = setInterval(() => {
                    if (destroyed || !ytPlayerRef.current) return;
                    try {
                      const cur = ytPlayerRef.current.getCurrentTime();
                      const dur = ytPlayerRef.current.getDuration();
                      callbacksRef.current.recordPlaybackTick(cur, dur);
                    } catch {}
                  }, 1000);
                } else {
                  setIsPlaying(false);
                  lastTickTimeRef.current = null;
                  clearInterval(trackingIntervalRef.current);
                  if (state === 2 || state === 0) {
                    try {
                      const cur = event.target.getCurrentTime();
                      const dur = event.target.getDuration();
                      callbacksRef.current.syncHeartbeat(undefined, cur, dur, {
                        force: true,
                        reason: state === 0 ? 'ended' : 'pause',
                      });
                    } catch {}
                  }
                }
              },
            },
          });
        } catch (err) {
          console.warn('[TrackedLiveClassPlayer] Error initializing YouTube player:', err);
          if (!destroyed) setPlayerStatus('error');
        }
      })
      .catch((err) => {
        if (destroyed) return;
        console.warn('[TrackedLiveClassPlayer] No se pudo cargar la API de YouTube:', err);
        setPlayerStatus('error');
      });

    return () => {
      destroyed = true;
      window.clearTimeout(readyTimeout);
      clearInterval(trackingIntervalRef.current);

      const player = ytPlayerRef.current;
      ytPlayerRef.current = null;
      if (player?.destroy && typeof player.destroy === 'function') {
        try {
          player.destroy();
        } catch {}
      } else {
        host.innerHTML = '';
      }
    };
  }, [ytVideoId, loadingInitial, playerRetryKey]);

  // 4. Inicializador de VIMEO
  useEffect(() => {
    if (!vimeoVideoId || loadingInitial) return;

    let destroyed = false;
    let apiPoll = 0;

    const setupVimeo = () => {
      if (destroyed || !vimeoIframeRef.current || !(window as any).Vimeo) return;
      if (vimeoPlayerRef.current) return;

      try {
        const player = new (window as any).Vimeo.Player(vimeoIframeRef.current);
        vimeoPlayerRef.current = player;

        player.getDuration().then((dur: number) => {
          if (!destroyed && dur > 0) {
            durationRef.current = dur;
            setDuration(dur);
          }
        });

        player.on('play', () => {
          if (destroyed) return;
          setIsPlaying(true);
        });

        player.on('pause', (data: any) => {
          if (destroyed) return;
          setIsPlaying(false);
          lastTickTimeRef.current = null;
          callbacksRef.current.syncHeartbeat(undefined, data.seconds, data.duration, {
            force: true,
            reason: 'pause',
          });
        });

        player.on('ended', (data: any) => {
          if (destroyed) return;
          setIsPlaying(false);
          lastTickTimeRef.current = null;
          callbacksRef.current.syncHeartbeat(undefined, data.seconds, data.duration, {
            force: true,
            reason: 'ended',
          });
        });

        player.on('timeupdate', (data: any) => {
          if (destroyed) return;
          callbacksRef.current.recordPlaybackTick(data.seconds, data.duration);
        });
      } catch (err) {
        console.warn('[TrackedLiveClassPlayer] Error initializing Vimeo player:', err);
      }
    };

    if (!(window as any).Vimeo) {
      const existingTag = document.getElementById('vimeo-player-api');
      if (!existingTag) {
        const tag = document.createElement('script');
        tag.id = 'vimeo-player-api';
        tag.src = 'https://player.vimeo.com/api/player.js';
        tag.onload = setupVimeo;
        document.head.appendChild(tag);
      }

      let attempts = 0;
      apiPoll = window.setInterval(() => {
        attempts += 1;
        if (destroyed || (window as any).Vimeo || attempts > 80) {
          window.clearInterval(apiPoll);
          if ((window as any).Vimeo) setupVimeo();
        }
      }, 125);
    } else {
      setupVimeo();
    }

    return () => {
      destroyed = true;
      window.clearInterval(apiPoll);
      if (vimeoPlayerRef.current?.destroy) {
        try {
          vimeoPlayerRef.current.destroy();
        } catch {}
        vimeoPlayerRef.current = null;
      }
    };
  }, [vimeoVideoId, loadingInitial]);

  // Función para reanudar el video en la posición guardada
  const handleResumePlayback = useCallback((seconds: number) => {
    setResumePrompt(null);
    if (ytPlayerRef.current?.seekTo) {
      try {
        ytPlayerRef.current.seekTo(seconds, true);
        ytPlayerRef.current.playVideo();
      } catch {}
    } else if (vimeoPlayerRef.current?.setCurrentTime) {
      try {
        vimeoPlayerRef.current.setCurrentTime(seconds);
        vimeoPlayerRef.current.play();
      } catch {}
    }
  }, []);

  // Escuchar eventos globales de salto (ej. al pulsar un timestamp en las dudas)
  useEffect(() => {
    const handleSeekEvent = (e: Event) => {
      const detail = (e as CustomEvent<{ second: number }>).detail;
      if (typeof detail?.second === 'number' && Number.isFinite(detail.second)) {
        handleResumePlayback(detail.second);
      }
    };
    window.addEventListener('neurosafe:seek-video', handleSeekEvent);
    return () => {
      window.removeEventListener('neurosafe:seek-video', handleSeekEvent);
      try {
        delete (window as any).__NEUROSAFE_CURRENT_VIDEO_TIME__;
      } catch {}
    };
  }, [handleResumePlayback]);

  if (loadingInitial) {
    return (
      <div className={`p-12 rounded-3xl bg-slate-900 border border-slate-800 text-center text-slate-400 ${className}`}>
        <Clock className="w-8 h-8 mx-auto animate-spin text-indigo-400 mb-2" />
        <p className="text-xs font-semibold">Cargando reproductor y progreso...</p>
      </div>
    );
  }

  const isGoogleDrive = parsedVideo?.kind === 'drive';
  const isEmbedSupported = parsedVideo?.kind === 'youtube' || parsedVideo?.kind === 'vimeo';

  if (!recordingUrl) {
    return (
      <div className={`p-8 rounded-3xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-center ${className}`}>
        <Clock className="w-10 h-10 mx-auto text-slate-400 mb-3" />
        <h4 className="text-base font-bold text-slate-800 dark:text-slate-200 mb-1">
          Grabación en procesamiento
        </h4>
        <p className="text-sm text-slate-500 max-w-md mx-auto">
          El profesor aún no ha cargado el enlace de la grabación de esta sesión. Vuelve a consultar en unas horas.
        </p>
      </div>
    );
  }

  return (
    <div
      id="tracked-live-player"
      className={`overflow-hidden rounded-3xl bg-slate-900 border border-slate-800 text-white shadow-2xl flex flex-col ${className}`}
    >
      {/* ─── BANNER SUPERIOR DE ACREDITACIÓN / PROGRESO ─── */}
      <div className="p-4 sm:p-5 border-b border-slate-800/80 bg-slate-900/90 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            {isFullyWatched ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                <CheckCircle2 className="w-4 h-4" /> Asistencia Acreditada
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                <Clock className="w-3.5 h-3.5" /> Requisito: {minRequiredPercent}% visto
              </span>
            )}

            {isPlaying && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 animate-pulse">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> En reproducción
              </span>
            )}

            {isGoogleDrive && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                <AlertTriangle className="w-3 h-3" /> Google Drive (Pase manual)
              </span>
            )}
          </div>

          <h3 className="text-base sm:text-lg font-bold text-white truncate max-w-xl">
            {workshop.title}
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Duración: {formatVideoTime(duration || workshop.duration_minutes * 60)} • Posición: {formatVideoTime(currentTime)}
          </p>
        </div>

        {/* Resumen numérico de porcentaje */}
        {isEmbedSupported && (
          <div className="flex flex-col items-start sm:items-end w-full sm:w-auto">
            <div className="text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1.5 flex-wrap justify-end">
              <span>Visto:</span>
              <span className={`text-sm font-black ${isFullyWatched ? 'text-emerald-400' : 'text-indigo-400'}`}>
                {coveragePercent.toFixed(1)}%
              </span>
              <span className="text-slate-500 text-[11px]">
                · Requisito: {minRequiredPercent}%
                {isFullyWatched ? ' ✓' : ''}
              </span>
            </div>

            {/* Barra de progreso interactiva con marcador del umbral */}
            <div className="relative w-full sm:w-48 h-2.5 rounded-full bg-slate-800 overflow-hidden border border-slate-700/60">
              <div
                className={`h-full transition-all duration-300 ${
                  isFullyWatched
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-400 shadow-sm shadow-emerald-500/50'
                    : 'bg-gradient-to-r from-indigo-500 to-purple-500'
                }`}
                style={{ width: `${Math.min(100, coveragePercent)}%` }}
              />
              {/* Marcador del umbral docente */}
              <div
                className="absolute top-0 bottom-0 w-0.5 bg-amber-400 z-10 opacity-70"
                style={{ left: `${minRequiredPercent}%` }}
                title={`Umbral requerido: ${minRequiredPercent}%`}
              />
            </div>
          </div>
        )}
      </div>

      {/* ─── ALERTA DE REANUDACIÓN DE REPRODUCCIÓN ─── */}
      {resumePrompt !== null && !isGoogleDrive && (
        <div className="bg-indigo-950/80 border-b border-indigo-800/60 px-4 py-2.5 flex items-center justify-between text-xs text-indigo-200">
          <div className="flex items-center gap-2">
            <RotateCcw className="w-3.5 h-3.5 text-indigo-400" />
            <span>Te quedaste en el minuto <strong>{formatVideoTime(resumePrompt)}</strong>.</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleResumePlayback(resumePrompt)}
              className="px-3 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold transition-colors cursor-pointer"
            >
              Reanudar aquí
            </button>
            <button
              onClick={() => setResumePrompt(null)}
              className="text-slate-400 hover:text-white px-2 py-1"
            >
              Descartar
            </button>
          </div>
        </div>
      )}

      {/* ─── MENSAJE SI CAMBIA DE PESTAÑA ─── */}
      {tabIsHidden && (
        <div className="bg-amber-950/90 border-b border-amber-800/80 px-4 py-2 flex items-center gap-2 text-xs text-amber-200">
          <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
          <span>La reproducción se pausó porque cambiaste de ventana o pestaña.</span>
        </div>
      )}

      {/* ─── AVISO DE ACREDITACIÓN RECIENTE ─── */}
      {accreditedJustNow && (
        <div className="bg-emerald-950/90 border-b border-emerald-800/80 px-4 py-3 flex items-center justify-between text-xs text-emerald-200">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <span>
              <strong>¡Felicidades!</strong> Has alcanzado el <strong>{minRequiredPercent}%</strong> obligatorio. Tu asistencia ha sido acreditada en tu Kardex académico.
            </span>
          </div>
          <button
            onClick={() => setAccreditedJustNow(false)}
            className="text-emerald-400 hover:text-white font-bold"
          >
            Entendido
          </button>
        </div>
      )}

      {/* ─── CONTENEDOR DEL REPRODUCTOR ─── */}
      <div className="relative w-full bg-black aspect-video flex items-center justify-center">
        {parsedVideo?.kind === 'youtube' && (
          <div
            ref={ytContainerRef}
            className="w-full h-full"
          />
        )}

        {parsedVideo?.kind === 'youtube' && playerStatus === 'error' && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-slate-950/95 px-6 text-center">
            <AlertTriangle className="w-8 h-8 text-amber-400" />
            <p className="text-sm font-semibold text-white">
              El video no terminó de cargar.
            </p>
            <p className="text-xs text-slate-400 max-w-sm">
              Revisa tu conexión y vuelve a intentarlo. Tu progreso guardado no se pierde.
            </p>
            <button
              onClick={handleReloadPlayer}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Recargar video
            </button>
          </div>
        )}

        {parsedVideo?.kind === 'vimeo' && (
          <iframe
            ref={vimeoIframeRef}
            src={`https://player.vimeo.com/video/${parsedVideo.videoId}?api=1`}
            className="w-full h-full"
            allow="autoplay; fullscreen; picture-in-picture"
            allowFullScreen
            title={workshop.title}
          />
        )}

        {isGoogleDrive && (
          <div className="w-full h-full flex flex-col">
            <div className="bg-amber-900/40 border-b border-amber-700/50 p-3 text-xs text-amber-200 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                Google Drive no expone API de progreso. Tu asistencia será validada manualmente por el docente.
              </span>
              <a
                href={recordingUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 underline hover:text-white shrink-0 ml-2"
              >
                Abrir en Drive <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <iframe
              src={getVideoEmbedSrc(parsedVideo)}
              className="w-full flex-1"
              allow="autoplay; encrypted-media; fullscreen"
              allowFullScreen
              title={workshop.title}
            />
          </div>
        )}

        {!isEmbedSupported && !isGoogleDrive && parsedVideo && (
          <iframe
            src={getVideoEmbedSrc(parsedVideo)}
            className="w-full h-full"
            allow="autoplay; encrypted-media; fullscreen"
            allowFullScreen
            title={workshop.title}
          />
        )}
      </div>

      {/* ─── FOOTER EXPLICATIVO ─── */}
      <div className="p-4 bg-slate-950/80 border-t border-slate-800 text-xs text-slate-400 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-slate-500" />
          <span>
            {isFullyWatched
              ? `Asistencia acreditada. El contador sigue registrando hasta el 100% si continúas viendo (vas en ${coveragePercent.toFixed(1)}%).`
              : `Debes ver al menos el ${minRequiredPercent}% de la sesión para acreditar la asistencia de este taller.`}
          </span>
        </div>
        <div className="text-[11px] text-slate-500">
          Tracking inteligente, reporta cualquier falla de la app al Dr. Yocupicio.
        </div>
      </div>
    </div>
  );
}
