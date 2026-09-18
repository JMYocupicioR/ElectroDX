import {
  Activity,
  Award,
  Bell,
  BookOpen,
  CheckCircle2,
  ClipboardList,
  FileText,
} from 'lucide-react';

export type StudentPortalTab =
  | 'summary'
  | 'modules'
  | 'quizzes'
  | 'assignments'
  | 'notifications'
  | 'certificate'
  | 'study';

interface TabSpec {
  id: StudentPortalTab;
  label: string;
  icon: typeof Activity;
}

const TABS: TabSpec[] = [
  { id: 'summary', label: 'Resumen General', icon: Activity },
  { id: 'modules', label: 'Mis Clases y Módulos', icon: BookOpen },
  { id: 'quizzes', label: 'Quizzes del Curso', icon: CheckCircle2 },
  { id: 'assignments', label: 'Tareas', icon: ClipboardList },
  { id: 'notifications', label: 'Avisos', icon: Bell },
  { id: 'certificate', label: 'Constancia', icon: Award },
  { id: 'study', label: 'Estudio y reportes', icon: FileText },
];

export function StudentPortalTabBar({
  activeTab,
  onSelect,
  counts,
}: {
  activeTab: StudentPortalTab;
  onSelect: (tab: StudentPortalTab) => void;
  counts: Partial<Record<StudentPortalTab, number>>;
}) {
  return (
    <div
      role="tablist"
      aria-label="Portal del alumno"
      className="flex items-center gap-2 overflow-x-auto border-b border-slate-200 dark:border-slate-800 pb-2 mb-8"
    >
      {TABS.map((tab) => {
        const Icon = tab.icon;
        const count = counts[tab.id];
        const selected = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            id={`tab-${tab.id}`}
            aria-selected={selected}
            aria-controls={`panel-${tab.id}`}
            onClick={() => onSelect(tab.id)}
            className={`relative flex items-center gap-2 px-4 py-2.5 min-h-[44px] rounded-xl text-sm font-semibold transition-all whitespace-nowrap ${
              selected
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Icon className="w-4 h-4" />
            {tab.label}
            {typeof count === 'number' && count > 0 ? ` (${count})` : ''}
          </button>
        );
      })}
    </div>
  );
}
