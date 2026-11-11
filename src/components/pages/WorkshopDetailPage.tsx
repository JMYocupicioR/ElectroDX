import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Calendar, CalendarPlus, CheckCircle, Clock, Play, Video, VideoOff } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthProvider';
import { BackButton } from '../common/BackButton';
import { LiveClassCountdown } from '../course/LiveClassCountdown';
import {
  LiveSessionMetaBadges,
  LiveSessionRoster,
  downloadWorkshopIcs,
} from '../course/LiveSessionRoster';
import {
  TrackedLiveClassPlayer,
  type TrackedAttendanceLockState,
} from '../course/TrackedLiveClassPlayer';
import { WorkshopDiscussion } from '../course/WorkshopDiscussion';
import { fetchSessionBriefs } from '../../services/liveSessionBriefService';
import type { SessionBrief } from '../../utils/liveSessionBrief';
import { getWorkshopAccessTiming, type WorkshopAccessTiming } from '../../utils/liveSessionUtils';
import { extractValidUuid } from '../../utils/uuidUtils';
import type { LiveWorkshop } from '../../types/database';

export default function WorkshopDetailPage() {
  const { workshopId } = useParams();
  const cleanWorkshopId = extractValidUuid(workshopId);

  const { user, isEnrolledPhysician } = useAuth();
  const [workshop, setWorkshop] = useState<LiveWorkshop | null>(null);
  const [brief, setBrief] = useState<SessionBrief | null>(null);
  const [isRegistered, setIsRegistered] = useState(false);
  const [loadingReg, setLoadingReg] = useState(false);
  const [timing, setTiming] = useState<WorkshopAccessTiming | null>(null);
  const [rosterLock, setRosterLock] = useState<TrackedAttendanceLockState | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  // Auto-corrección resiliente: si el URL vino con caracteres adicionales o concatenados, normalizar la barra de direcciones
  useEffect(() => {
    if (cleanWorkshopId && workshopId && cleanWorkshopId !== workshopId) {
      window.history.replaceState(null, '', `/taller/${cleanWorkshopId}`);
    }
  }, [cleanWorkshopId, workshopId]);

  useEffect(() => {
    if (!cleanWorkshopId) {
      setIsLoading(false);
      setNotFound(true);
      return;
    }
    const targetId = cleanWorkshopId;
    let cancelled = false;
    setIsLoading(true);
    setNotFound(false);

    async function loadWorkshop() {
      try {
        const { data, error } = await supabase
          .from('live_workshops')
          .select('*')
          .eq('id', targetId)
          .maybeSingle();

        if (cancelled) return;
        setIsLoading(false);
        if (error) {
          console.error('[WorkshopDetailPage] Error cargando taller:', error);
          setNotFound(true);
          return;
        }
        if (data) {
          setWorkshop(data as unknown as LiveWorkshop);
        } else {
          setNotFound(true);
        }
      } catch (err: unknown) {
        if (cancelled) return;
        console.error('[WorkshopDetailPage] Error inesperado:', err);
        setIsLoading(false);
        setNotFound(true);
      }
    }

    void loadWorkshop();

    return () => {
      cancelled = true;
    };
  }, [cleanWorkshopId]);

  useEffect(() => {
    if (!cleanWorkshopId) return;
    const targetId = cleanWorkshopId;
    let cancelled = false;
    fetchSessionBriefs([targetId]).then((map) => {
      if (!cancelled) setBrief(map.get(targetId) ?? null);
    });
    return () => {
      cancelled = true;
    };
  }, [cleanWorkshopId]);

  useEffect(() => {
    if (!cleanWorkshopId || !user) return;
    const targetId = cleanWorkshopId;
    supabase
      .from('workshop_registrations')
      .select('id')
      .eq('workshop_id', targetId)
      .eq('user_id', user.id)
      .maybeSingle()
      .then(({ data }) => setIsRegistered(!!data));
  }, [cleanWorkshopId, user]);

  useEffect(() => {
    setRosterLock(null);
  }, [cleanWorkshopId]);

  useEffect(() => {
    if (!workshop) return;
    const update = () => setTiming(getWorkshopAccessTiming(workshop, new Date()));
    update();
    const id = window.setInterval(update, 5000);
    return () => window.clearInterval(id);
  }, [workshop]);

  if (isLoading) {
    return (
      <div className="pt-32 pb-20 text-center text-sm text-slate-500 flex flex-col items-center justify-center gap-3">
        <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        <span className="font-medium text-slate-600 dark:text-slate-300">Cargando clase en vivo...</span>
      </div>
    );
  }

  if (notFound || !workshop) {
    return (
      <div className="max-w-2xl mx-auto px-4 pt-24 pb-16">
        <div className="mb-6">
          <BackButton label="Volver a clases en vivo" fallback="/talleres" />
        </div>
        <div className="p-8 sm:p-10 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-center shadow-xs">
          <div className="w-16 h-16 rounded-2xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto mb-4 border border-amber-200/70 dark:border-amber-800/70">
            <VideoOff className="w-8 h-8" />
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mb-2">
            Clase o taller no encontrado
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-md mx-auto mb-6 leading-relaxed">
            El enlace o identificador de la sesión no corresponde a una clase activa, o la sesión fue reprogramada.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link
              to="/talleres"
              className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-bold shadow-sm transition"
            >
              Explorar cartelera de clases en vivo
            </Link>
            <Link
              to="/portal"
              className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs sm:text-sm font-bold transition"
            >
              Ir a mi portal
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const currentTiming = timing ?? getWorkshopAccessTiming(workshop, new Date());
  const date = new Date(workshop.scheduled_at);
  const formattedDate = date.toLocaleDateString('es-MX', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const formattedTime = date.toLocaleTimeString('es-MX', {
    hour: '2-digit',
    minute: '2-digit',
  });
  const shortFinishedDate = date.toLocaleDateString('es-MX', {
    day: 'numeric',
    month: 'short',
  });

  const handleRegister = async () => {
    if (!user || !workshopId) return;
    setLoadingReg(true);
    try {
      const { error } = await supabase.from('workshop_registrations').insert({
        workshop_id: workshopId,
        user_id: user.id,
      } as any);
      if (error) throw error;
      setIsRegistered(true);
    } catch (err: any) {
      alert('Error al registrar: ' + err.message);
    } finally {
      setLoadingReg(false);
    }
  };

  const scrollToPlayerOrAction = () => {
    const playerEl =
      document.getElementById('tracked-live-player') ||
      document.getElementById('workshop-action-panel');
    if (playerEl) {
      playerEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const hasRecording = Boolean(workshop.recording_url?.trim());
  const recordingAttendanceEnabled = workshop.allow_recording_attendance !== false;
  /** Player a ancho completo: sesión pasada con grabación, o grabación lista para acreditar y ya registrado. */
  const showTheaterPlayer =
    isEnrolledPhysician &&
    Boolean(user?.id) &&
    hasRecording &&
    (currentTiming.isPast || (recordingAttendanceEnabled && isRegistered));
  /** Aside sticky solo cuando no hay teatro, o cuando aún hace falta CTA (registro / stream) junto al player. */
  const showActionAside =
    !isEnrolledPhysician || !showTheaterPlayer || !currentTiming.isPast;
  /** Sin barra sticky si el pase de lista ya acreditó: no empuja a “ver 55%”. */
  const showStickyMobileBar =
    rosterLock?.rosterLocked !== true &&
    (!isEnrolledPhysician || !currentTiming.isPast || hasRecording);

  return (
    <div
      className={`pt-16 sm:pt-20 lg:pt-24 ${
        showStickyMobileBar ? 'pb-40' : 'pb-28'
      } lg:pb-16 px-3.5 sm:px-6 lg:px-8 max-w-7xl mx-auto`}
    >
      <BackButton
        fallback="/talleres"
        className="inline-flex items-center gap-2 min-h-11 px-2.5 -ml-2.5 rounded-xl text-sm font-medium text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-slate-800/50 transition-colors mb-2 sm:mb-4 cursor-pointer"
      />

      <div
        className={`grid grid-cols-1 gap-4 sm:gap-5 lg:gap-x-8 lg:gap-y-6 items-start ${
          showTheaterPlayer
            ? 'lg:grid-cols-12'
            : 'lg:grid-cols-12 lg:grid-rows-[max-content_max-content_max-content_1fr]'
        }`}
      >
        {/* ─── HEADER ─── */}
        <header
          className={
            showTheaterPlayer
              ? 'order-1 lg:col-span-12 rounded-2xl bg-white dark:bg-slate-900/70 border border-slate-200/90 dark:border-slate-800 px-4 sm:px-6 lg:px-7 py-4 sm:py-5'
              : 'order-1 lg:col-span-7 lg:col-start-1 lg:bg-white lg:dark:bg-slate-900/70 lg:border lg:border-slate-200/90 lg:dark:border-slate-800 lg:rounded-t-2xl lg:border-b-0 lg:px-7 lg:pt-6 lg:pb-2'
          }
        >
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight leading-snug text-slate-900 dark:text-white mb-2">
            {workshop.title}
          </h1>

          <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-300 mb-3">
            <span className="inline-flex items-center gap-1.5 text-blue-700 dark:text-blue-300 font-semibold">
              <Calendar className="w-3.5 h-3.5 shrink-0" />
              <span className="capitalize">{formattedDate}</span>
            </span>
            <span className="text-slate-300 dark:text-slate-600" aria-hidden="true">
              ·
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span>
                {formattedTime} ({workshop.duration_minutes} min)
              </span>
            </span>
          </div>

          <LiveSessionMetaBadges workshop={workshop} isPast={currentTiming.isPast} />
        </header>

        {/* ─── PLAYER TEATRO (ancho completo) ─── */}
        {showTheaterPlayer && user?.id && (
          <section
            aria-label="Reproductor de la clase grabada"
            className="order-2 lg:col-span-12 w-full min-w-0"
          >
            <div className="mb-2.5 flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-wrap items-center gap-2 min-w-0">
                {currentTiming.isPast ? (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold border border-slate-200/80 dark:border-slate-700">
                    <Clock className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                    Sesión concluida · {shortFinishedDate}
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-purple-100 dark:bg-purple-950/60 text-purple-800 dark:text-purple-200 text-xs font-bold border border-purple-200/70 dark:border-purple-800/50">
                    <Play className="w-3 h-3 fill-current" /> Clase grabada lista
                  </span>
                )}
                <span className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400">
                  {rosterLock?.rosterLocked
                    ? `Asistencia ya asentada${rosterLock.statusLabel ? ` (${rosterLock.statusLabel})` : ''} · grabación opcional`
                    : `Acredita con mín. ${workshop.min_watch_percent ?? 85}% visto`}
                </span>
              </div>
            </div>
            <TrackedLiveClassPlayer
              workshop={workshop}
              userId={user.id}
              compact
              className="w-full"
              onRosterAttendanceResolved={setRosterLock}
            />
          </section>
        )}

        {/* ─── PANEL DE ACCIÓN (sin player embebido en modo teatro) ─── */}
        {showActionAside && (
          <aside
            id="workshop-action-panel"
            aria-label="Estado y acceso a la clase"
            className={
              showTheaterPlayer
                ? 'order-3 lg:col-span-5 lg:col-start-8 lg:row-start-3 w-full'
                : 'order-2 lg:col-span-5 lg:col-start-8 lg:row-start-1 lg:row-end-5 lg:sticky lg:top-24 w-full'
            }
          >
            {isEnrolledPhysician ? (
              <LiveClassCountdown
                workshop={workshop}
                isRegistered={isRegistered}
                onRegister={handleRegister}
                loadingReg={loadingReg}
                userId={user?.id}
                hidePlayer={showTheaterPlayer}
                rosterAttendanceLocked={rosterLock?.rosterLocked === true}
                rosterStatusLabel={rosterLock?.statusLabel}
                onRosterAttendanceResolved={setRosterLock}
              />
            ) : (
              <div className="p-5 rounded-2xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700/50 text-center">
                <h3 className="text-base font-bold text-amber-900 dark:text-amber-100 mb-1.5">
                  Acceso Premium Requerido
                </h3>
                <p className="text-amber-800/80 dark:text-amber-200/80 text-xs sm:text-sm mb-4">
                  Debes tener acceso premium activo para registrarte o ver este taller.
                </p>
                <Link
                  to="/auth/login"
                  className="inline-flex items-center justify-center gap-2 w-full sm:w-auto min-h-11 px-6 py-2.5 rounded-xl bg-amber-600 text-white font-semibold hover:bg-amber-500 text-sm transition-colors"
                >
                  Inscribirme ahora
                </Link>
              </div>
            )}
          </aside>
        )}

        {/* ─── DOCENTES / TEMAS ─── */}
        <div
          className={
            showTheaterPlayer
              ? showActionAside
                ? 'order-4 lg:col-span-7 lg:col-start-1 lg:row-start-3 rounded-2xl bg-white dark:bg-slate-900/70 border border-slate-200/90 dark:border-slate-800 px-4 sm:px-6 lg:px-7 py-4 sm:py-5'
                : 'order-3 lg:col-span-12 rounded-2xl bg-white dark:bg-slate-900/70 border border-slate-200/90 dark:border-slate-800 px-4 sm:px-6 lg:px-7 py-4 sm:py-5'
              : 'order-3 lg:col-span-7 lg:col-start-1 lg:-mt-6 lg:bg-white lg:dark:bg-slate-900/70 lg:border lg:border-slate-200/90 lg:dark:border-slate-800 lg:border-t-0 lg:rounded-b-2xl lg:px-7 lg:pb-6 lg:pt-2'
          }
        >
          <LiveSessionRoster workshop={workshop} brief={brief} hideBadges />
        </div>

        {/* ─── DISCUSIÓN ─── */}
        {isEnrolledPhysician && (
          <div
            className={
              showTheaterPlayer && !showActionAside
                ? 'order-5 lg:col-span-12 w-full'
                : 'order-5 lg:col-span-7 lg:col-start-1 w-full'
            }
          >
            <WorkshopDiscussion workshop={workshop} />
          </div>
        )}
      </div>

      {/* ─── BARRA CTA STICKY EN MÓVIL ─── */}
      {showStickyMobileBar && (
        <div
          className="fixed left-0 right-0 z-40 lg:hidden border-t border-slate-200/90 dark:border-slate-800 bg-white/95 dark:bg-slate-950/95 backdrop-blur-md px-3.5 py-2.5 shadow-[0_-4px_20px_rgba(0,0,0,0.2)]"
          style={{ bottom: 'calc(3.5rem + env(safe-area-inset-bottom, 0px))' }}
        >
          <div className="max-w-lg mx-auto flex items-center justify-between gap-3">
            {!isEnrolledPhysician ? (
              <>
                <span className="text-xs font-semibold text-amber-800 dark:text-amber-300 truncate">
                  Requiere cuenta inscrita
                </span>
                <Link
                  to="/auth/login"
                  className="inline-flex items-center justify-center min-h-11 px-4 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold shrink-0"
                >
                  Inscribirme ahora
                </Link>
              </>
            ) : currentTiming.isPast ? (
              hasRecording ? (
                <>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                      Grabación disponible
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                      Mín. {workshop.min_watch_percent ?? 85}% para acreditar
                    </p>
                  </div>
                  {user?.id ? (
                    <button
                      type="button"
                      onClick={scrollToPlayerOrAction}
                      className="inline-flex items-center justify-center gap-1.5 min-h-11 px-4 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-sm cursor-pointer shrink-0"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      Ver grabación
                    </button>
                  ) : (
                    <a
                      href={workshop.recording_url!}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center justify-center gap-1.5 min-h-11 px-4 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-sm shrink-0"
                    >
                      <Video className="w-3.5 h-3.5" />
                      Ver grabación
                    </a>
                  )}
                </>
              ) : null
            ) : !isRegistered ? (
              <>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                    {currentTiming.canAccess ? '¡Sala abierta ahora!' : 'Aparta tu lugar'}
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                    {formattedTime} · {workshop.duration_minutes} min
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleRegister}
                  disabled={loadingReg}
                  className="inline-flex items-center justify-center gap-1.5 min-h-11 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-bold shadow-sm cursor-pointer shrink-0"
                >
                  <CheckCircle className="w-3.5 h-3.5" />
                  {loadingReg ? 'Registrando...' : 'Registrarme'}
                </button>
              </>
            ) : currentTiming.canAccess && workshop.stream_url && !showTheaterPlayer ? (
              <>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-red-600 dark:text-red-400 truncate">
                    {currentTiming.isLiveNow ? '🔴 En vivo ahora' : '🔴 Sala abierta'}
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                    Transmisión lista para ingresar
                  </p>
                </div>
                <a
                  href={workshop.stream_url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center gap-1.5 min-h-11 px-4 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 text-white text-xs font-black shadow-md shadow-red-600/25 shrink-0"
                >
                  <Video className="w-3.5 h-3.5" />
                  Entrar al stream
                </a>
              </>
            ) : showTheaterPlayer ? (
              <>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                    Clase grabada lista
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                    Reproduce para acreditar asistencia
                  </p>
                </div>
                <button
                  type="button"
                  onClick={scrollToPlayerOrAction}
                  className="inline-flex items-center justify-center gap-1.5 min-h-11 px-4 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-sm cursor-pointer shrink-0"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  Ver grabación
                </button>
              </>
            ) : hasRecording && recordingAttendanceEnabled ? (
              <>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                    Clase grabada lista
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                    Reproduce para acreditar asistencia
                  </p>
                </div>
                <button
                  type="button"
                  onClick={scrollToPlayerOrAction}
                  className="inline-flex items-center justify-center gap-1.5 min-h-11 px-4 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-sm cursor-pointer shrink-0"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  Ver grabación
                </button>
              </>
            ) : (
              <>
                <div className="min-w-0 flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                      Registrado para asistir
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                      El acceso abre 5 min antes ({formattedTime})
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => downloadWorkshopIcs(workshop)}
                  className="inline-flex items-center justify-center gap-1.5 min-h-11 px-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold cursor-pointer shrink-0"
                >
                  <CalendarPlus className="w-3.5 h-3.5 text-blue-500" />
                  Calendario
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
