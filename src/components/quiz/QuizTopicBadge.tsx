import { ClipboardList } from 'lucide-react';

export function QuizTopicBadge({
  compact = false,
  label,
}: {
  compact?: boolean;
  label?: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-md font-medium bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300 ${
        compact ? 'px-1.5 py-0.5 text-[0.6rem]' : 'px-2 py-0.5 text-xs'
      }`}
      title={label ?? 'Evaluación disponible'}
    >
      <ClipboardList className={compact ? 'w-3 h-3' : 'w-3.5 h-3.5'} />
      {!compact && (label ?? 'Evaluación')}
    </span>
  );
}
