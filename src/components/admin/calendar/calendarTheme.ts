import type { CalendarItemType } from '../../../types/academicCalendar';
import type { RubricKey } from '../../../types/academicGradebook';

export const TYPE_CHIP: Record<CalendarItemType, string> = {
  session: 'bg-rose-100 text-rose-800 border-rose-200 dark:bg-rose-500/20 dark:text-rose-100 dark:border-rose-400/40',
  exam: 'bg-indigo-100 text-indigo-800 border-indigo-200 dark:bg-indigo-500/20 dark:text-indigo-100 dark:border-indigo-400/40',
  clinical_case: 'bg-teal-100 text-teal-800 border-teal-200 dark:bg-teal-500/20 dark:text-teal-100 dark:border-teal-400/40',
  reading: 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-500/20 dark:text-amber-100 dark:border-amber-400/40',
  emg_report: 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-500/20 dark:text-amber-100 dark:border-amber-400/40',
  practical_task: 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-500/20 dark:text-amber-100 dark:border-amber-400/40',
  milestone: 'bg-violet-100 text-violet-800 border-violet-200 dark:bg-violet-500/20 dark:text-violet-100 dark:border-violet-400/40',
};

export const TYPE_DOT: Record<CalendarItemType, string> = {
  session: 'bg-rose-500',
  exam: 'bg-indigo-500',
  clinical_case: 'bg-teal-500',
  reading: 'bg-amber-500',
  emg_report: 'bg-amber-500',
  practical_task: 'bg-amber-500',
  milestone: 'bg-violet-500',
};

export const TYPE_BAR = TYPE_DOT;

export const TYPE_PREFIX: Record<CalendarItemType, string> = {
  session: 'Cl',
  exam: 'Ex',
  clinical_case: 'Cas',
  reading: 'Lec',
  emg_report: 'Inf',
  practical_task: 'Tar',
  milestone: 'Cor',
};

export const TYPE_FILTER_ACTIVE: Record<CalendarItemType | 'all', string> = {
  all: 'bg-slate-800 text-white border-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:border-slate-100',
  session: 'bg-rose-600 text-white border-rose-600',
  exam: 'bg-indigo-600 text-white border-indigo-600',
  clinical_case: 'bg-teal-600 text-white border-teal-600',
  reading: 'bg-amber-600 text-white border-amber-600',
  emg_report: 'bg-amber-600 text-white border-amber-600',
  practical_task: 'bg-amber-600 text-white border-amber-600',
  milestone: 'bg-violet-600 text-white border-violet-600',
};

export const RUBRIC_TONE: Record<RubricKey, string> = {
  exams: 'text-indigo-600 dark:text-indigo-300',
  assignments: 'text-teal-600 dark:text-teal-300',
  attendance: 'text-rose-600 dark:text-rose-300',
  curriculum: 'text-violet-600 dark:text-violet-300',
};

export const RUBRIC_BAR: Record<RubricKey, string> = {
  exams: 'bg-indigo-500',
  assignments: 'bg-teal-500',
  attendance: 'bg-rose-500',
  curriculum: 'bg-violet-500',
};
