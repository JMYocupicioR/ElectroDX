import { useEffect, useRef, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { resolveNotificationTone, type StudentNotification } from '../../services/studentService';
import type { StudentAssignment } from '../../types/studentPlan';

interface StudentAlertCodeLegendProps {
  notifications: StudentNotification[];
  assignments: StudentAssignment[];
  onSelectNotifications: () => void;
}

export function StudentAlertCodeLegend({
  notifications,
  assignments,
  onSelectNotifications,
}: StudentAlertCodeLegendProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const nowMs = Date.now();
  const unreadUrgentCount = notifications.filter(
    (n) => !n.isRead && resolveNotificationTone(n, nowMs) === 'urgent'
  ).length;
  const unreadWarningCount = notifications.filter(
    (n) => !n.isRead && resolveNotificationTone(n, nowMs) === 'warning'
  ).length;
  const unreadInfoCount = notifications.filter(
    (n) => !n.isRead && resolveNotificationTone(n, nowMs) === 'info'
  ).length;
  const pendingAlertCount = unreadUrgentCount + unreadWarningCount + unreadInfoCount;
  const actionRequiredCount = assignments.filter(
    (a) => a.status === 'pending' || a.status === 'needs_revision'
  ).length;

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    const onPointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('mousedown', onPointerDown);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('mousedown', onPointerDown);
    };
  }, [open]);

  const goToNotifications = () => {
    onSelectNotifications();
    setOpen(false);
  };

  return (
    <div ref={rootRef} className="relative shrink-0">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-controls="student-alert-code-legend"
        aria-label={
          open
            ? 'Ocultar código de alertas'
            : pendingAlertCount > 0
              ? `Mostrar código de alertas, ${pendingAlertCount} por atender`
              : 'Mostrar código de alertas'
        }
        className="relative inline-flex items-center justify-center gap-1 sm:gap-2 min-h-11 min-w-11 sm:min-w-0 px-1.5 sm:px-3 rounded-lg sm:rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-700 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-slate-950"
      >
        <span className="flex items-center -space-x-0.5 sm:space-x-1" aria-hidden="true">
          <span className={`h-2 w-2 sm:h-2.5 sm:w-2.5 rounded-full ring-1 ring-white dark:ring-slate-900 ${unreadUrgentCount > 0 ? 'bg-rose-600' : 'bg-rose-500'}`} />
          <span className="h-2 w-2 sm:h-2.5 sm:w-2.5 rounded-full ring-1 ring-white dark:ring-slate-900 bg-amber-500" />
          <span className="h-2 w-2 sm:h-2.5 sm:w-2.5 rounded-full ring-1 ring-white dark:ring-slate-900 bg-sky-500" />
          <span className="h-2 w-2 sm:h-2.5 sm:w-2.5 rounded-full ring-1 ring-white dark:ring-slate-900 bg-emerald-600" />
          <span className="h-2 w-2 sm:h-2.5 sm:w-2.5 rounded-full ring-1 ring-white dark:ring-slate-900 bg-slate-400" />
        </span>
        <span className="hidden sm:inline text-xs font-semibold">Código de alertas</span>
        {pendingAlertCount > 0 && (
          <span className="sm:hidden absolute -top-1 -right-1 min-w-4 h-4 px-0.5 rounded-full bg-slate-800 dark:bg-slate-100 text-white dark:text-slate-900 text-[10px] font-mono tabular-nums leading-4 text-center">
            {pendingAlertCount}
          </span>
        )}
        {pendingAlertCount > 0 && (
          <span className="hidden sm:inline-flex min-w-5 px-1 rounded-md bg-slate-800 dark:bg-slate-100 text-white dark:text-slate-900 text-[11px] font-mono tabular-nums text-center">
            {pendingAlertCount}
          </span>
        )}
        <ChevronDown
          className={`hidden sm:block w-4 h-4 text-slate-500 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
          aria-hidden="true"
        />
      </button>

      <div
        id="student-alert-code-legend"
        role="region"
        aria-label="Leyenda del código de alertas"
        className={
          open
            ? 'absolute right-0 top-full z-20 mt-2 w-[min(calc(100vw-2rem),40rem)] flex flex-wrap items-center justify-end gap-2 text-xs p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-md'
            : 'hidden'
        }
      >
        <button
          type="button"
          onClick={goToNotifications}
          className={`inline-flex items-center gap-1.5 min-h-11 px-2.5 py-1 rounded-md font-semibold border transition cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-700 ${
            unreadUrgentCount > 0
              ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-200 border-rose-300 dark:border-rose-700'
              : 'bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
          }`}
        >
          <span
            className={`w-2 h-2 rounded-full ${
              unreadUrgentCount > 0 ? 'bg-rose-600 animate-pulse' : 'bg-rose-500'
            }`}
          />
          <span>Rojo: Exámenes, Tareas (&lt;24h) y Clase (≤5 min)</span>
          {unreadUrgentCount > 0 && (
            <span className="px-1.5 py-0.5 rounded bg-rose-600 text-white text-[11px] font-mono tabular-nums">
              {unreadUrgentCount}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={goToNotifications}
          className="inline-flex items-center gap-1.5 min-h-11 px-2.5 py-1 rounded-md font-semibold bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-200 border border-amber-300/80 dark:border-amber-800/70 transition cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-700"
        >
          <span className="w-2 h-2 rounded-full bg-amber-500" />
          <span>Amarillo: Clase futura (&gt;5 min) y Entregas en tiempo</span>
          {(unreadWarningCount > 0 || actionRequiredCount > 0) && (
            <span className="px-1.5 py-0.5 rounded bg-amber-500 text-white text-[11px] font-mono tabular-nums">
              {unreadWarningCount || actionRequiredCount}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={goToNotifications}
          className="inline-flex items-center gap-1.5 min-h-11 px-2.5 py-1 rounded-md font-semibold bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-200 border border-sky-200 dark:border-sky-800/70 transition cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-700"
        >
          <span className="w-2 h-2 rounded-full bg-sky-500" />
          <span>Azul claro: Recordatorios y Sistema</span>
          {unreadInfoCount > 0 && (
            <span className="px-1.5 py-0.5 rounded bg-sky-600 text-white text-[11px] font-mono tabular-nums">
              {unreadInfoCount}
            </span>
          )}
        </button>

        <span className="inline-flex items-center gap-1.5 min-h-11 px-2.5 py-1 rounded-md font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-200 border border-emerald-200 dark:border-emerald-800/70">
          <span className="w-2 h-2 rounded-full bg-emerald-600" />
          <span>Verde: Acreditado</span>
        </span>

        <span className="inline-flex items-center gap-1.5 min-h-11 px-2.5 py-1 rounded-md font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
          <span className="w-2 h-2 rounded-full bg-slate-400" />
          <span>Gris: Atendido</span>
        </span>
      </div>
    </div>
  );
}
