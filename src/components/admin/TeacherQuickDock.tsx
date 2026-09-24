import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Calendar,
  Video,
  FileQuestion,
  Activity,
  UserCheck,
  SlidersHorizontal,
  BookOpen,
  type LucideIcon,
} from 'lucide-react';
import { getAdminProfiles } from '../../services/editorialService';
import { filterGradeableStudents } from '../../utils/adminUtils';
import { useAuth } from '../../contexts/AuthProvider';
import type { AdminProfileRow } from '../../types/admin';
import AssignExamModal from './AssignExamModal';
import { AssignClinicalCaseModal } from './AssignClinicalCaseModal';
import AttendanceTrackerModal from './AttendanceTrackerModal';
import GradebookConfigModal from './GradebookConfigModal';
import { CreateLiveClassModal } from './CreateLiveClassModal';

type ActionId = 'live' | 'exam' | 'case' | 'attendance' | 'rubrics';

type DockItem = {
  id: string;
  label: string;
  icon: LucideIcon;
  well: string;
  activeWell: string;
  iconColor: string;
  to?: string;
  action?: ActionId;
  match?: (pathname: string) => boolean;
};

const ITEMS: DockItem[] = [
  {
    id: 'calendar',
    label: 'Agenda',
    icon: Calendar,
    well: 'bg-indigo-500/15',
    activeWell: 'bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-md shadow-indigo-500/30',
    iconColor: 'text-indigo-300',
    to: '/admin/calendario',
    match: (path) => path.startsWith('/admin/calendario'),
  },
  {
    id: 'live',
    label: 'En vivo',
    icon: Video,
    well: 'bg-rose-500/15',
    activeWell: 'bg-gradient-to-br from-rose-500 to-red-600 text-white shadow-md shadow-rose-500/30',
    iconColor: 'text-rose-300',
    action: 'live',
  },
  {
    id: 'exam',
    label: 'Examen',
    icon: FileQuestion,
    well: 'bg-blue-500/15',
    activeWell: 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-md shadow-blue-500/30',
    iconColor: 'text-blue-300',
    action: 'exam',
  },
  {
    id: 'case',
    label: 'Caso',
    icon: Activity,
    well: 'bg-teal-500/15',
    activeWell: 'bg-gradient-to-br from-teal-500 to-emerald-600 text-white shadow-md shadow-teal-500/30',
    iconColor: 'text-teal-300',
    action: 'case',
  },
  {
    id: 'attendance',
    label: 'Lista',
    icon: UserCheck,
    well: 'bg-violet-500/15',
    activeWell: 'bg-gradient-to-br from-violet-500 to-purple-600 text-white shadow-md shadow-violet-500/30',
    iconColor: 'text-violet-300',
    action: 'attendance',
  },
  {
    id: 'rubrics',
    label: 'Rúbrica',
    icon: SlidersHorizontal,
    well: 'bg-fuchsia-500/15',
    activeWell: 'bg-gradient-to-br from-fuchsia-500 to-purple-600 text-white shadow-md shadow-fuchsia-500/30',
    iconColor: 'text-fuchsia-300',
    action: 'rubrics',
  },
  {
    id: 'grades',
    label: 'Notas',
    icon: BookOpen,
    well: 'bg-amber-500/15',
    activeWell: 'bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-md shadow-amber-500/30',
    iconColor: 'text-amber-300',
    to: '/admin/alumnos',
    match: (path) => path === '/admin/alumnos' || path.startsWith('/admin/alumnos/'),
  },
];

export function TeacherQuickDock() {
  const location = useLocation();
  const { user } = useAuth();
  const [action, setAction] = useState<ActionId | null>(null);
  const [profiles, setProfiles] = useState<AdminProfileRow[]>([]);
  const [loadingProfiles, setLoadingProfiles] = useState(false);

  const openAction = async (next: ActionId) => {
    if (next === 'attendance' && profiles.length === 0) {
      setLoadingProfiles(true);
      try {
        const rows = await getAdminProfiles(false, 'all');
        setProfiles(filterGradeableStudents(rows, user?.id));
      } catch (err) {
        console.error('[TeacherQuickDock] No se pudo cargar la cohorte', err);
      } finally {
        setLoadingProfiles(false);
      }
    }
    setAction(next);
  };

  return (
    <>
      <nav
        aria-label="Acciones rápidas del profesor"
        className="fixed bottom-0 left-0 right-0 z-40 lg:hidden border-t border-white/10 bg-slate-950/95 backdrop-blur-xl shadow-[0_-8px_30px_rgba(0,0,0,0.35)]"
        style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
      >
        <div className="flex items-stretch justify-between gap-0.5 px-1.5 pt-1.5 pb-1 max-w-lg mx-auto">
          {ITEMS.map((item) => {
            const Icon = item.icon;
            const active = item.match?.(location.pathname) ?? false;
            const className =
              'flex flex-1 min-w-0 flex-col items-center justify-center gap-1 rounded-2xl py-1 active:scale-95 transition-transform';
            const iconWell = `w-8 h-8 rounded-xl flex items-center justify-center ${
              active ? item.activeWell : item.well
            }`;
            const icon = (
              <Icon className={`w-[18px] h-[18px] ${active ? 'text-white' : item.iconColor}`} strokeWidth={2.25} />
            );
            const label = (
              <span
                className={`text-[9px] font-semibold leading-none tracking-tight truncate max-w-full ${
                  active ? 'text-white' : 'text-slate-400'
                }`}
              >
                {item.label}
              </span>
            );

            if (item.to) {
              return (
                <Link key={item.id} to={item.to} className={className} aria-current={active ? 'page' : undefined}>
                  <span className={iconWell}>{icon}</span>
                  {label}
                </Link>
              );
            }

            return (
              <button
                key={item.id}
                type="button"
                className={className}
                onClick={() => item.action && void openAction(item.action)}
                disabled={loadingProfiles && item.action === 'attendance'}
              >
                <span className={iconWell}>{icon}</span>
                {label}
              </button>
            );
          })}
        </div>
      </nav>

      <CreateLiveClassModal isOpen={action === 'live'} onClose={() => setAction(null)} />
      <AssignExamModal isOpen={action === 'exam'} onClose={() => setAction(null)} />
      <AssignClinicalCaseModal isOpen={action === 'case'} onClose={() => setAction(null)} />
      <AttendanceTrackerModal
        isOpen={action === 'attendance'}
        onClose={() => setAction(null)}
        profiles={profiles}
        onSaved={() => setAction(null)}
      />
      <GradebookConfigModal
        isOpen={action === 'rubrics'}
        onClose={() => setAction(null)}
        onSaved={() => setAction(null)}
      />
    </>
  );
}
