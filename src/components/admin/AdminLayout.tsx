import { Link, useLocation } from 'react-router-dom';
import { Shield, LayoutDashboard, Users, FileCheck, ScrollText, ClipboardList } from 'lucide-react';
import { useAuth } from '../../contexts/AuthProvider';
import { useAdminPendingCounts } from '../../hooks/useAdminPendingCounts';

function NavBadge({ count }: { count: number }) {
  if (count <= 0) return null;
  return (
    <span className="ml-1.5 min-w-[1.25rem] px-1.5 py-0.5 rounded-full bg-red-500 text-white text-[0.65rem] font-bold leading-none">
      {count > 99 ? '99+' : count}
    </span>
  );
}

export function AdminLayout({
  title,
  children,
}: {
  title?: string;
  children: React.ReactNode;
}) {
  const location = useLocation();
  const { isAdmin } = useAuth();
  const { pendingUsers, pendingRevisions } = useAdminPendingCounts();

  const tabs = [
    { to: '/admin', label: 'Inicio', icon: LayoutDashboard, exact: true, badge: 0 },
    {
      to: '/admin/usuarios',
      label: 'Usuarios',
      icon: Users,
      exact: false,
      badge: pendingUsers,
      adminOnly: true,
    },
    {
      to: '/admin/revisiones',
      label: 'Revisiones',
      icon: FileCheck,
      exact: false,
      badge: pendingRevisions,
    },
    {
      to: '/admin/evaluaciones',
      label: 'Evaluaciones',
      icon: ClipboardList,
      exact: false,
      badge: 0,
    },
    {
      to: '/admin/auditoria',
      label: 'Auditoría',
      icon: ScrollText,
      exact: false,
      badge: 0,
      adminOnly: true,
    },
  ].filter((t) => !t.adminOnly || isAdmin);

  const isActive = (to: string, exact: boolean) =>
    exact ? location.pathname === to : location.pathname.startsWith(to);

  return (
    <div className="pt-20 sm:pt-24 pb-16 px-4 max-w-6xl mx-auto">
      <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
        <aside className="lg:w-56 flex-shrink-0">
          <div className="flex items-center gap-2 mb-4 px-1">
            <Shield className="w-5 h-5 text-indigo-500" />
            <span className="font-bold text-slate-800 dark:text-white">Administración</span>
          </div>
          <nav className="flex lg:flex-col gap-1 overflow-x-auto pb-2 lg:pb-0">
            {tabs.map(({ to, label, icon: Icon, exact, badge }) => (
              <Link
                key={to}
                to={to}
                className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition ${
                  isActive(to, exact)
                    ? 'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                {label}
                <NavBadge count={badge} />
              </Link>
            ))}
          </nav>
        </aside>

        <main className="flex-1 min-w-0">
          {title && (
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">{title}</h1>
          )}
          {children}
        </main>
      </div>
    </div>
  );
}
