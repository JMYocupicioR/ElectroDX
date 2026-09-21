import { AlertTriangle, CheckCircle2, Sliders } from 'lucide-react';
import type { CalendarRubricSnapshot } from '../../../types/academicCalendar';
import { RUBRIC_BAR, RUBRIC_TONE } from './calendarTheme';

function bucketHint(key: CalendarRubricSnapshot['buckets'][number]['key'], eventCount: number): string {
  if (eventCount > 0) return `${eventCount} evento${eventCount === 1 ? '' : 's'}`;
  if (key === 'attendance') return '0 clases';
  if (key === 'exams') return '0 exámenes';
  if (key === 'assignments') return '0 tareas';
  return '0 cortes';
}

export function CalendarRubricRail({
  rubric,
  onEdit,
}: {
  rubric: CalendarRubricSnapshot | null;
  onEdit: () => void;
}) {
  if (!rubric) {
    return (
      <div className="p-3 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 text-xs text-slate-400">
        Cargando rúbrica...
      </div>
    );
  }

  const balanced = rubric.totalWeight === 100;

  return (
    <section className="p-3 sm:p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
      <div className="flex flex-wrap items-center gap-2 sm:gap-3">
        <div className="min-w-0">
          <p className="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Rúbrica Capa A
          </p>
          <h2 className="text-sm font-black text-slate-900 dark:text-white leading-tight">
            Cómo se evalúa el curso
          </h2>
        </div>
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[11px] font-bold ${
            balanced
              ? 'bg-emerald-50/80 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200'
              : 'bg-amber-50/80 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-200'
          }`}
        >
          {balanced ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertTriangle className="w-3.5 h-3.5" />}
          {balanced ? '100%' : `${rubric.totalWeight}%`}
          <span className="font-semibold opacity-80">· mín {rubric.minPassingGrade} pts</span>
        </span>
        <button
          type="button"
          onClick={onEdit}
          className="ml-auto inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-[11px] font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
        >
          <Sliders className="w-3.5 h-3.5" />
          Editar
        </button>
      </div>

      <ul className="mt-3 grid grid-cols-2 xl:grid-cols-4 gap-2">
        {rubric.buckets.map((bucket) => (
          <li
            key={bucket.key}
            className={`min-w-0 p-2 rounded-xl border border-slate-100 dark:border-slate-800 ${
              bucket.enabled ? '' : 'opacity-40'
            }`}
          >
            <div className="flex items-baseline justify-between gap-2 text-xs">
              <span className={`font-bold truncate ${RUBRIC_TONE[bucket.key]}`}>{bucket.name}</span>
              <span className="font-black text-slate-900 dark:text-white shrink-0">{bucket.weight}%</span>
            </div>
            <div className="mt-1.5 h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
              <div
                className={`h-full rounded-full ${RUBRIC_BAR[bucket.key]}`}
                style={{ width: `${Math.min(100, bucket.weight)}%` }}
              />
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 truncate">
              {bucketHint(bucket.key, bucket.eventCount)}
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}
