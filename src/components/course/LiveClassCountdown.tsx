import { useEffect, useState, useRef } from 'react';
import { Video, Lock, Clock, Bell, CheckCircle, AlertCircle, Play } from 'lucide-react';
import type { LiveWorkshop } from '../../types/database';
import {
  TrackedLiveClassPlayer,
  type TrackedAttendanceLockState,
} from './TrackedLiveClassPlayer';
import {
  getWorkshopAccessTiming,
  triggerLiveClassFiveMinuteAlert,
  type WorkshopAccessTiming,
} from '../../utils/liveSessionUtils';

interface LiveClassCountdownProps {
  workshop: LiveWorkshop;
  isRegistered: boolean;
  onRegister?: () => void;
  loadingReg?: boolean;
  className?: string;
  userId?: string;
  /** Cuando el page monta el player en modo teatro (full width). */
  hidePlayer?: boolean;
  rosterAttendanceLocked?: boolean;
  rosterStatusLabel?: string | null;
  onRosterAttendanceResolved?: (state: TrackedAttendanceLockState) => void;
}

function recordingPlayerBlock(
  workshop: LiveWorkshop,
  userId: string,
  options?: {
    rosterLocked?: boolean;
    rosterStatusLabel?: string | null;
    onRosterAttendanceResolved?: (state: TrackedAttendanceLockState) => void;
  },
) {
  return (
    <div className="mt-4 text-left">
      <div className="mb-2.5 flex flex-wrap items-center justify-between gap-2">
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-purple-100 dark:bg-purple-950/60 text-purple-800 dark:text-purple-200 text-[11px] font-bold uppercase tracking-wide border border-purple-200/70 dark:border-purple-800/50">
          <Play className="w-3 h-3 fill-current" /> Clase grabada lista
        </span>
        <span className="text-[11px] text-slate-500 dark:text-slate-400">
          {options?.rosterLocked
            ? `Asistencia ya asentada${options.rosterStatusLabel ? ` (${options.rosterStatusLabel})` : ''} · grabación opcional`
            : `Acredita con mín. ${workshop.min_watch_percent ?? 85}% visto`}
        </span>
      </div>
      <div className="-mx-4 -mb-4 sm:mx-0 sm:mb-0">
        <TrackedLiveClassPlayer
          workshop={workshop}
          userId={userId}
          className="rounded-b-2xl rounded-t-xl sm:rounded-2xl"
          onRosterAttendanceResolved={options?.onRosterAttendanceResolved}
        />
      </div>
    </div>
  );
}

export function LiveClassCountdown({
  workshop,
  isRegistered,
  onRegister,
  loadingReg = false,
  className = '',
  userId,
  hidePlayer = false,
  rosterAttendanceLocked = false,
  rosterStatusLabel = null,
  onRosterAttendanceResolved,
}: LiveClassCountdownProps) {
  const [timing, setTiming] = useState<WorkshopAccessTiming>(() =>
    getWorkshopAccessTiming(workshop, new Date())
  );
  const [alertDismissed, setAlertDismissed] = useState(false);
  const previousCanAccessRef = useRef<boolean>(timing.canAccess);

  const hasRecording = Boolean(workshop.recording_url?.trim());
  const recordingAttendanceEnabled = workshop.allow_recording_attendance !== false;
  const canOfferTrackedRecording = hasRecording && recordingAttendanceEnabled;
  /** Grabación con acreditación: el alumno puede verla ya, sin esperar a que “termine” el horario en vivo. */
  const showTrackedRecordingNow =
    canOfferTrackedRecording && Boolean(userId) && (timing.isPast || isRegistered);
  /** Si la asistencia va por grabación, no empujar la UX de “transmitiéndose en vivo”. */
  const preferRecordingOverLive = canOfferTrackedRecording && hasRecording;

  useEffect(() => {
    const checkTiming = () => {
      const nextTiming = getWorkshopAccessTiming(workshop, new Date());
      setTiming(nextTiming);

      if (
        !preferRecordingOverLive &&
        !previousCanAccessRef.current &&
        nextTiming.canAccess &&
        !nextTiming.isPast
      ) {
        triggerLiveClassFiveMinuteAlert(workshop);
      }
      previousCanAccessRef.current = nextTiming.canAccess;
    };

    checkTiming();
    const interval = setInterval(checkTiming, 1000);
    return () => clearInterval(interval);
  }, [workshop, preferRecordingOverLive]);

  useEffect(() => {
    if (preferRecordingOverLive) return;
    if (isRegistered && timing.canAccess && !timing.isPast) {
      triggerLiveClassFiveMinuteAlert(workshop);
    }
  }, [isRegistered, timing.canAccess, timing.isPast, workshop, preferRecordingOverLive]);

  const { isPast, isLiveNow, canAccess, timeRemaining, accessOpensAt, scheduledAt } = timing;

  const formattedStartTime = scheduledAt.toLocaleTimeString('es-MX', {
    hour: '2-digit',
    minute: '2-digit',
  });
  const formattedOpenTime = accessOpensAt.toLocaleTimeString('es-MX', {
    hour: '2-digit',
    minute: '2-digit',
  });
  const shortFinishedDate = scheduledAt.toLocaleDateString('es-MX', {
    day: 'numeric',
    month: 'short',
  });

  return (
    <div
      className={`rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900/80 p-4 sm:p-5 shadow-sm transition-all ${className}`}
      aria-live="polite"
    >
      {/* ─── CASO 1: LA CLASE YA FINALIZÓ (Banner horizontal compacto + Player a ancho completo) ─── */}
      {isPast ? (
        <div>
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-200/80 dark:border-slate-800">
            <div className="flex flex-wrap items-center gap-2 min-w-0">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold border border-slate-200/80 dark:border-slate-700">
                <Clock className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                <span>Sesión Concluida · {shortFinishedDate}</span>
              </span>
              <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                Este taller ya finalizó
              </h3>
            </div>

            {workshop.recording_url && !userId && (
              <a
                href={workshop.recording_url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center gap-2 w-full sm:w-auto min-h-11 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs sm:text-sm font-bold shadow-sm transition-all cursor-pointer"
              >
                <Video className="w-4 h-4" /> Ver grabación de la clase
              </a>
            )}
          </div>

          {workshop.recording_url ? (
            userId && !hidePlayer ? (
              recordingPlayerBlock(workshop, userId, {
                rosterLocked: rosterAttendanceLocked,
                rosterStatusLabel,
                onRosterAttendanceResolved,
              })
            ) : userId && hidePlayer ? (
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 pt-3">
                {rosterAttendanceLocked
                  ? `Asistencia ya asentada${rosterStatusLabel ? ` (${rosterStatusLabel})` : ''}. La grabación arriba es solo para repaso.`
                  : 'La grabación se reproduce arriba, a pantalla completa.'}
              </p>
            ) : null
          ) : (
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 pt-3 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-slate-400 shrink-0" />
              <span>La grabación aún no está disponible en la biblioteca.</span>
            </p>
          )}
        </div>
      ) : preferRecordingOverLive ? (
        <>
          {/* ─── CASO 2: CLASE CON GRABACIÓN LISTA PARA VER / ACREDITAR ─── */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pb-4 border-b border-slate-200/80 dark:border-slate-800">
            <div className="min-w-0">
              <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                Clase grabada disponible
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {rosterAttendanceLocked
                  ? `El profesor ya asentó tu asistencia${rosterStatusLabel ? ` (${rosterStatusLabel})` : ''}. Puedes ver la grabación solo para repasar.`
                  : isRegistered
                    ? hidePlayer
                      ? 'Reproduce la clase en el visualizador de arriba para acreditar tu asistencia en el kárdex.'
                      : 'Reproduce la clase en este visualizador para acreditar tu asistencia en el kárdex.'
                    : 'Regístrate para desbloquear el visualizador de la clase grabada y acreditar asistencia.'}
              </p>
            </div>

            {rosterAttendanceLocked ? (
              <div className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-100/80 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 font-semibold text-xs border border-emerald-200 dark:border-emerald-800/60 shrink-0">
                <CheckCircle className="w-4 h-4" />
                Asistencia asentada
                {rosterStatusLabel ? ` · ${rosterStatusLabel}` : ''}
              </div>
            ) : isRegistered ? (
              <div className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-100/80 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 font-semibold text-xs border border-emerald-200 dark:border-emerald-800/60 shrink-0">
                <CheckCircle className="w-4 h-4" /> Registrado para asistir
              </div>
            ) : (
              <button
                type="button"
                onClick={onRegister}
                disabled={loadingReg}
                className="inline-flex items-center justify-center gap-2 min-h-11 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold text-xs sm:text-sm shadow-md shadow-blue-500/20 transition-all cursor-pointer shrink-0"
              >
                <CheckCircle className="w-4 h-4" />
                {loadingReg ? 'Registrando...' : 'Registrarme a esta clase'}
              </button>
            )}
          </div>

          {showTrackedRecordingNow && userId && !hidePlayer ? (
            recordingPlayerBlock(workshop, userId, {
              rosterLocked: rosterAttendanceLocked,
              rosterStatusLabel,
              onRosterAttendanceResolved,
            })
          ) : showTrackedRecordingNow && hidePlayer ? null : (
            <div className="mt-4 p-3.5 rounded-xl bg-purple-50/80 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-900/50 text-center">
              <p className="text-xs sm:text-sm font-semibold text-purple-900 dark:text-purple-100">
                El visualizador de clase grabada se activará al registrarte.
              </p>
            </div>
          )}

          {workshop.stream_url && canAccess && isRegistered && (
            <div className="mt-4 pt-3.5 border-t border-slate-200/80 dark:border-slate-800 flex items-center justify-between gap-2">
              <span className="text-xs text-slate-500 dark:text-slate-400">
                Enlace de transmisión en vivo (opcional):
              </span>
              <a
                href={workshop.stream_url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                <Video className="w-3.5 h-3.5" />
                Abrir stream en vivo
              </a>
            </div>
          )}
        </>
      ) : canAccess ? (
        /* ─── CASO 3A: EN VIVO / SALA ABIERTA (≤ 5 MIN) — ACCIÓN PRIMERO ─── */
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-100 dark:bg-red-950/80 text-red-700 dark:text-red-300 text-xs font-black uppercase tracking-wider border border-red-300 dark:border-red-800">
              <span className="w-2 h-2 rounded-full bg-red-600 animate-ping inline-block" />
              {isLiveNow
                ? '🔴 EN VIVO AHORA'
                : `🔴 SALA ABIERTA (Inicia en ${timing.startsInMinutes} min)`}
            </div>

            {!isLiveNow && timeRemaining.totalSeconds > 0 && (
              <span className="text-xs font-mono font-bold text-slate-600 dark:text-slate-300">
                Inicia en{' '}
                <span className="text-red-600 dark:text-red-400 tabular-nums">
                  {timeRemaining.minutes.toString().padStart(2, '0')}:
                  {timeRemaining.seconds.toString().padStart(2, '0')}
                </span>
              </span>
            )}
          </div>

          {workshop.stream_url ? (
            <div>
              <a
                href={workshop.stream_url}
                target="_blank"
                rel="noreferrer"
                className="w-full inline-flex items-center justify-center gap-2.5 min-h-12 px-6 py-3.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-black text-sm sm:text-base shadow-lg shadow-red-600/25 hover:shadow-red-600/35 active:scale-[0.99] transition-all cursor-pointer ring-2 ring-red-500/20"
              >
                <Video className="w-5 h-5 animate-pulse" />
                <span>Entrar al Stream en Vivo</span>
                <Play className="w-4 h-4 fill-white" />
              </a>
            </div>
          ) : (
            <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 text-amber-800 dark:text-amber-200 text-xs font-medium flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>
                El docente está por conectar el enlace de transmisión en vivo a esta sala. Mantente
                en esta página.
              </span>
            </div>
          )}

          {isRegistered && !alertDismissed && (
            <div className="p-3 rounded-xl bg-gradient-to-r from-red-500/10 via-rose-500/10 to-amber-500/10 border border-red-300/80 dark:border-red-800/70 text-slate-900 dark:text-white flex items-start justify-between gap-2">
              <div className="flex items-start gap-2.5 min-w-0">
                <div className="w-7 h-7 rounded-lg bg-red-600 text-white flex items-center justify-center shrink-0">
                  <Bell className="w-3.5 h-3.5 animate-bounce" />
                </div>
                <div className="min-w-0">
                  <span className="text-[11px] font-black uppercase tracking-wider text-red-600 dark:text-red-400 block">
                    🔴 Alerta de Clase en Vivo
                  </span>
                  <p className="text-xs font-semibold mt-0.5">
                    {isLiveNow
                      ? '¡La clase está transmitiéndose en vivo ahora mismo!'
                      : `¡La sala ya está abierta! Faltan ${Math.max(1, timing.startsInMinutes)} min para iniciar a las ${formattedStartTime}.`}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setAlertDismissed(true)}
                className="min-w-8 min-h-8 flex items-center justify-center rounded-lg text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition cursor-pointer shrink-0"
                title="Ocultar aviso"
                aria-label="Ocultar aviso"
              >
                ✕
              </button>
            </div>
          )}

          <div className="pt-3 border-t border-slate-200/80 dark:border-slate-800 flex items-center justify-between gap-3">
            <span className="text-xs text-slate-500 dark:text-slate-400">
              {isRegistered ? 'Tu lugar está confirmado' : 'Regístrate para registrar tu asistencia'}
            </span>
            {isRegistered ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-100/80 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 font-semibold text-xs border border-emerald-200 dark:border-emerald-800/60 shrink-0">
                <CheckCircle className="w-3.5 h-3.5" /> Registrado para asistir
              </span>
            ) : (
              <button
                type="button"
                onClick={onRegister}
                disabled={loadingReg}
                className="inline-flex items-center justify-center gap-1.5 min-h-10 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold text-xs shadow-sm transition-all cursor-pointer shrink-0"
              >
                <CheckCircle className="w-3.5 h-3.5" />
                {loadingReg ? 'Registrando...' : 'Registrarme a esta clase'}
              </button>
            )}
          </div>
        </div>
      ) : (
        /* ─── CASO 3B: PRÓXIMA SESIÓN EN VIVO (> 5 MIN) — REGISTRO + COUNTDOWN COMPACTO ─── */
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row lg:flex-col xl:flex-row items-stretch sm:items-center lg:items-stretch xl:items-center justify-between gap-3 pb-4 border-b border-slate-200/80 dark:border-slate-800">
            <div className="min-w-0">
              <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                Registro al taller
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {isRegistered
                  ? 'Estás registrado(a). El acceso se activará 5 minutos antes del inicio.'
                  : 'Regístrate para asegurar tu lugar en la sesión en vivo.'}
              </p>
            </div>

            {isRegistered ? (
              <div className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-100/80 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 font-semibold text-xs border border-emerald-200 dark:border-emerald-800/60 shrink-0">
                <CheckCircle className="w-4 h-4" /> Registrado para asistir
              </div>
            ) : (
              <button
                type="button"
                onClick={onRegister}
                disabled={loadingReg}
                className="inline-flex items-center justify-center gap-2 min-h-11 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold text-xs sm:text-sm shadow-md shadow-blue-500/20 transition-all cursor-pointer shrink-0"
              >
                <CheckCircle className="w-4 h-4" />
                {loadingReg ? 'Registrando...' : 'Registrarme a esta clase'}
              </button>
            )}
          </div>

          <div className="text-center space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-[11px] uppercase tracking-wider font-bold text-slate-500 dark:text-slate-400">
                Tiempo restante para el inicio de la clase
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-100/80 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 text-[11px] font-semibold border border-amber-300/80 dark:border-amber-800/80">
                <Clock className="w-3 h-3 text-amber-600 dark:text-amber-400 animate-pulse" />
                <span>
                  {scheduledAt.toLocaleDateString('es-MX', {
                    weekday: 'short',
                    day: 'numeric',
                    month: 'short',
                  })}{' '}
                  · {formattedStartTime}
                </span>
              </span>
            </div>

            <div className="grid grid-cols-4 gap-2">
              <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/80">
                <span className="block text-xl sm:text-2xl font-black font-mono text-slate-900 dark:text-white tabular-nums leading-tight">
                  {timeRemaining.days.toString().padStart(2, '0')}
                </span>
                <span className="text-[10px] uppercase font-semibold text-slate-500 dark:text-slate-400">
                  Días
                </span>
              </div>

              <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/80">
                <span className="block text-xl sm:text-2xl font-black font-mono text-slate-900 dark:text-white tabular-nums leading-tight">
                  {timeRemaining.hours.toString().padStart(2, '0')}
                </span>
                <span className="text-[10px] uppercase font-semibold text-slate-500 dark:text-slate-400">
                  Horas
                </span>
              </div>

              <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/80">
                <span className="block text-xl sm:text-2xl font-black font-mono text-slate-900 dark:text-white tabular-nums leading-tight">
                  {timeRemaining.minutes.toString().padStart(2, '0')}
                </span>
                <span className="text-[10px] uppercase font-semibold text-slate-500 dark:text-slate-400">
                  Min
                </span>
              </div>

              <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/80">
                <span className="block text-xl sm:text-2xl font-black font-mono text-blue-600 dark:text-blue-400 tabular-nums leading-tight">
                  {timeRemaining.seconds.toString().padStart(2, '0')}
                </span>
                <span className="text-[10px] uppercase font-semibold text-slate-500 dark:text-slate-400">
                  Seg
                </span>
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200/70 dark:border-blue-900/50 text-xs text-blue-900 dark:text-blue-200 flex items-center justify-center gap-2 text-left">
              <Lock className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
              <span>
                Acceso activo a las <strong>{formattedOpenTime}</strong> (5 minutos antes de la clase).
              </span>
            </div>

            <div>
              <button
                type="button"
                disabled
                aria-disabled="true"
                title="El acceso estará disponible 5 minutos antes de que empiece la clase"
                className="w-full inline-flex items-center justify-center gap-2 min-h-11 px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 text-slate-400 dark:text-slate-500 font-bold text-xs sm:text-sm border border-slate-200 dark:border-slate-700/80 cursor-not-allowed select-none"
              >
                <Lock className="w-3.5 h-3.5 shrink-0" />
                <span>Entrar al Stream en Vivo (Disponible 5 min antes)</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
