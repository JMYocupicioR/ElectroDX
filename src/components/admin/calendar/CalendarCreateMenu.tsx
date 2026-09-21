import { useEffect, useRef } from 'react';
import { Activity, Calendar, FileQuestion, Video, X } from 'lucide-react';

export type CalendarCreateAction = 'session' | 'exam' | 'clinical_case' | 'milestone';

export function CalendarCreateMenu({
  dateLabel,
  onSelect,
  onClose,
}: {
  dateLabel: string;
  onSelect: (action: CalendarCreateAction) => void;
  onClose: () => void;
}) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const options: { id: CalendarCreateAction; label: string; hint: string; icon: typeof Video }[] = [
    { id: 'session', label: 'Clase en vivo', hint: 'Taller o sesión que cuenta a asistencia', icon: Video },
    { id: 'exam', label: 'Examen', hint: 'Asignar evaluación a la cohorte', icon: FileQuestion },
    { id: 'clinical_case', label: 'Caso EMG', hint: 'Tarea clínica del simulador', icon: Activity },
    { id: 'milestone', label: 'Corte académico', hint: 'Checklist de temas y fecha de corte', icon: Calendar },
  ];

  useEffect(() => {
    const previous = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const frame = window.requestAnimationFrame(() => closeRef.current?.focus());
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.stopPropagation();
        onClose();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => {
      window.cancelAnimationFrame(frame);
      document.removeEventListener('keydown', onKey);
      previous?.focus();
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-xs">
      <button type="button" className="absolute inset-0" aria-label="Cerrar menú de creación" onClick={onClose} />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="calendar-create-title"
        className="relative w-full max-w-md rounded-t-3xl sm:rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden"
      >
        <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-black uppercase tracking-wider text-indigo-500">Nuevo evento</p>
            <h2 id="calendar-create-title" className="text-sm font-black text-slate-900 dark:text-white">
              Planear el {dateLabel}
            </h2>
          </div>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400"
            aria-label="Cerrar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="p-3 space-y-1.5 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
          {options.map(({ id, label, hint, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => onSelect(id)}
              className="w-full flex items-center gap-3 px-3.5 py-3 rounded-2xl text-left hover:bg-slate-50 dark:hover:bg-slate-800/80 transition"
            >
              <span className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-300 flex items-center justify-center">
                <Icon className="w-4 h-4" />
              </span>
              <span>
                <span className="block text-sm font-bold text-slate-900 dark:text-white">{label}</span>
                <span className="block text-[11px] text-slate-500 dark:text-slate-400">{hint}</span>
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
