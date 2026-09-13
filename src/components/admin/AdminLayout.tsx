import { Link, useLocation } from 'react-router-dom';
import {
  Shield,
  LayoutDashboard,
  Users,
  FileCheck,
  ScrollText,
  ClipboardList,
  Video,
  Lock,
  ArrowLeft,
  CheckCircle2,
  GraduationCap,
  Activity,
  Stethoscope,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthProvider';
import { useAdminPendingCounts } from '../../hooks/useAdminPendingCounts';

function NavBadge({ count }: { count: number }) {
  if (count <= 0) return null;
  return (
    <span className="ml-auto min-w-[1.25rem] px-1.5 py-0.5 rounded-full bg-red-500 text-white text-[0.65rem] font-bold leading-none flex items-center justify-center shadow-sm">
      {count > 99 ? '99+' : count}
    </span>
  );
}

export function AdminLayout({
  title,
  subtitle,
  children,
}: {
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  const location = useLocation();
  const { isAdmin, user } = useAuth();
  const { pendingUsers, pendingRevisions } = useAdminPendingCounts();

  const tabs = [
    { to: '/admin', label: 'Inicio', icon: LayoutDashboard, exact: true, badge: 0 },
    {
      to: '/admin/usuarios',
      label: 'Usuarios y Médicos',
      icon: Users,
      exact: false,
      badge: pendingUsers,
      adminOnly: true,
    },
    {
      to: '/admin/alumnos',
      label: 'Progreso de Alumnos',
      icon: Activity,
      exact: false,
      badge: 0,
      adminOnly: false,
    },
    {
      to: '/admin/ejercicios',
      label: 'Casos y Simulador',
      icon: Stethoscope,
      exact: false,
      badge: 0,
    },
    {
      to: '/admin/revisiones',
      label: 'Cola Editorial',
      icon: FileCheck,
      exact: false,
      badge: pendingRevisions,
    },
    {
      to: '/admin/quizzes',
      label: 'Editor de Quizzes',
      icon: GraduationCap,
      exact: false,
      badge: 0,
    },
    {
      to: '/admin/talleres',
      label: 'Talleres en Vivo',
      icon: Video,
      exact: false,
      badge: 0,
      adminOnly: true,
    },
    {
      to: '/admin/acceso',
      label: 'Control de Acceso',
      icon: Lock,
      exact: false,
      badge: 0,
      adminOnly: true,
    },
    {
      to: '/admin/auditoria',
      label: 'Auditoría del Sistema',
      icon: ScrollText,
      exact: false,
      badge: 0,
      adminOnly: true,
    },
  ].filter((t) => !t.adminOnly || isAdmin);

  const isActive = (to: string, exact: boolean) =>
    exact ? location.pathname === to : location.pathname.startsWith(to);

  const currentTab = tabs.find((t) => isActive(t.to, t.exact)) ?? tabs[0];

  return (
    <div className="pt-18 sm:pt-22 pb-20 px-4 sm:px-6 max-w-7xl mx-auto">
      {/* Top Breadcrumb & Status Bar */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-200/80 dark:border-slate-800/80">
        <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-500">
          <Link to="/" className="hover:text-blue-600 transition">NeuroSAFE</Link>
          <span>/</span>
          <Link to="/admin" className="hover:text-indigo-600 font-medium">Administración</Link>
          {location.pathname !== '/admin' && (
            <>
              <span>/</span>
              <span className="text-slate-900 dark:text-white font-semibold">{currentTab.label}</span>
            </>
          )}
        </div>

        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/60 shadow-xs">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            <span>SuperAdmin Activo</span>
          </span>
          <Link
            to="/temario"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-cyan-400 transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Volver a vista Alumno</span>
          </Link>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
        {/* Navigation Sidebar */}
        <aside className="lg:w-64 flex-shrink-0">
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-sm sticky top-24">
            <div className="flex items-center gap-2.5 mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center shadow-md shadow-indigo-500/20">
                <Shield className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <p className="font-bold text-slate-900 dark:text-white text-sm truncate">Panel de Control</p>
                <p className="text-[11px] text-slate-400 truncate">Dirección NeuroSAFE</p>
              </div>
            </div>

            <nav className="flex lg:flex-col gap-1 overflow-x-auto pb-1 lg:pb-0 scrollbar-none">
              {tabs.map(({ to, label, icon: Icon, exact, badge }) => {
                const active = isActive(to, exact);
                return (
                  <Link
                    key={to}
                    to={to}
                    className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs sm:text-sm font-medium whitespace-nowrap transition-all ${
                      active
                        ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-500/25 font-semibold'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/80 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <Icon className={`w-4 h-4 flex-shrink-0 ${active ? 'text-white' : 'text-slate-400'}`} />
                    <span className="flex-1 truncate">{label}</span>
                    <NavBadge count={badge} />
                  </Link>
                );
              })}
            </nav>

            <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 hidden lg:block text-[11px] text-slate-400">
              <p className="font-medium text-slate-600 dark:text-slate-300">Sesión Directiva</p>
              <p className="truncate text-slate-500 mt-0.5">{user?.email}</p>
              <div className="mt-2 text-[10px] text-slate-400">
                COMEFYR Ed. Médica Continua v2.4
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 min-w-0">
          {title && (
            <div className="mb-6">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                {title}
              </h1>
              {subtitle && (
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                  {subtitle}
                </p>
              )}
            </div>
          )}
          {children}
        </main>
      </div>
    </div>
  );
}
