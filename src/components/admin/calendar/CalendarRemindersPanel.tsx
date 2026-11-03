import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Bell, CalendarClock, CheckCircle2, ClipboardCheck, GraduationCap, UserCheck } from 'lucide-react';
import type { TeacherCalendarReminders, TeacherReminderRow } from '../../../utils/teacherCalendarReminders';
import { TEACHER_REMINDER_ROW_LIMIT } from '../../../utils/teacherCalendarReminders';
import { parseLocalDateKey } from '../../../utils/academicCalendar';

function dateLabel(dateKey: string): string {
  if (!dateKey) return '';
  return parseLocalDateKey(dateKey).toLocaleDateString('es-MX', { day: 'numeric', month: 'short' });
}

function actionLabel(row: TeacherReminderRow): string {
  if (row.action === 'grade') return 'Calificar';
  if (row.action === 'attendance') return 'Pase de lista';
  return 'Ver';
}

function ReminderBlock({
  title,
  emptyLabel,
  href,
  hrefLabel,
  icon,
  rows,
  onOpen,
}: {
  title: string;
  emptyLabel: string;
  href?: string;
  hrefLabel?: string;
  icon: ReactNode;
  rows: TeacherReminderRow[];
  onOpen: (row: TeacherReminderRow) => void;
}) {
  const visible = rows.slice(0, TEACHER_REMINDER_ROW_LIMIT);
  const extra = rows.length - visible.length;

  return (
    <section className="min-w-0 p-3 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900">
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="min-w-0 flex items-center gap-2">
          <span className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center shrink-0">
            {icon}
          </span>
          <div className="min-w-0">
            <h3 className="text-xs font-black text-slate-900 dark:text-white leading-tight">{title}</h3>
            <p className="text-[11px] text-slate-500">
              {rows.length > 0 ? `${rows.length} ${rows.length === 1 ? 'pendiente' : 'pendientes'}` : 'Al día'}
            </p>
          </div>
        </div>
        {href && hrefLabel ? (
          <Link
            to={href}
            className="shrink-0 text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
          >
            {hrefLabel}
          </Link>
        ) : null}
      </div>

      {rows.length === 0 ? (
        <p className="text-[11px] text-slate-500 flex items-center gap-1.5 py-1.5">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
          {emptyLabel}
        </p>
      ) : (
        <ul className="divide-y divide-slate-100 dark:divide-slate-800">
          {visible.map((row) => (
            <li key={row.id}>
              <button
                type="button"
                onClick={() => onOpen(row)}
                className="w-full text-left py-2 flex items-start gap-2 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-lg px-1 -mx-1"
              >
                <span className="text-[11px] font-bold text-slate-400 w-12 shrink-0 pt-0.5">{dateLabel(row.dateKey)}</span>
                <span className="min-w-0 flex-1">
                  <span className="block text-xs font-bold text-slate-800 dark:text-slate-100 truncate">{row.title}</span>
                  <span className="block text-[11px] text-slate-500 truncate">{row.detail}</span>
                </span>
                <span className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 shrink-0 pt-0.5">
                  {actionLabel(row)}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
      {extra > 0 ? <p className="mt-1 text-[11px] text-slate-400">+{extra} más en el área correspondiente</p> : null}
    </section>
  );
}

export function CalendarRemindersPanel({
  reminders,
  loading,
  onOpen,
}: {
  reminders: TeacherCalendarReminders;
  loading?: boolean;
  onOpen: (row: TeacherReminderRow) => void;
}) {
  return (
    <section className="p-3 sm:p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
      <div className="flex items-center gap-2 mb-3">
        <Bell className="w-4 h-4 text-slate-500" />
        <div>
          <h2 className="text-sm font-black text-slate-900 dark:text-white leading-tight">Recordatorios</h2>
          <p className="text-[11px] text-slate-500">Lo que te toca hacer, con acceso a calificar, pasar lista y cortes.</p>
        </div>
      </div>

      {loading ? (
        <p className="text-xs text-slate-400 py-2">Cargando pendientes…</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-2.5">
          <ReminderBlock
            title="Próximo"
            emptyLabel="Al día: nada en los próximos 14 días."
            icon={<CalendarClock className="w-3.5 h-3.5" />}
            rows={reminders.upcoming}
            onOpen={onOpen}
          />
          <ReminderBlock
            title="Por calificar"
            emptyLabel="Al día: no hay entregas ni retomas en cola."
            href="/admin/alumnos/tareas"
            hrefLabel="Tareas"
            icon={<ClipboardCheck className="w-3.5 h-3.5" />}
            rows={reminders.toGrade}
            onOpen={onOpen}
          />
          <ReminderBlock
            title="Clases pendientes"
            emptyLabel="Al día: las listas están completas."
            href="/admin/alumnos/asistencias"
            hrefLabel="Asistencias"
            icon={<UserCheck className="w-3.5 h-3.5" />}
            rows={reminders.classes}
            onOpen={onOpen}
          />
          <ReminderBlock
            title="Cortes"
            emptyLabel="Al día: no hay cortes con trabajo pendiente."
            href="/admin/alumnos"
            hrefLabel="Kardex"
            icon={<GraduationCap className="w-3.5 h-3.5" />}
            rows={reminders.cortes}
            onOpen={onOpen}
          />
        </div>
      )}
    </section>
  );
}
