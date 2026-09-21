import { Link, useLocation } from 'react-router-dom';
import {
  Home,
  BookOpen,
  Wrench,
  ClipboardList,
  User,
  Shield,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthProvider';
import { useStudentPendingAssignments } from '../../hooks/useStudentPendingAssignments';

export function MobileBottomNav() {
  const location = useLocation();
  const { user, isAdmin, isEditor } = useAuth();
  const isStaff = isAdmin || isEditor;
  const { pendingCount } = useStudentPendingAssignments();

  // Hide on exam session or full-screen immersive tools to prevent clutter
  if (location.pathname.startsWith('/examenes/sesion')) {
    return null;
  }

  const navItems = [
    {
      to: '/',
      label: 'Inicio',
      icon: Home,
      isActive: location.pathname === '/',
    },
    {
      to: '/temario',
      label: 'Curso',
      icon: BookOpen,
      isActive:
        location.pathname.startsWith('/modulo') ||
        location.pathname === '/temario' ||
        location.pathname === '/programa',
    },
    {
      to: '/simuladores',
      label: 'Simuladores',
      icon: Wrench,
      isActive:
        location.pathname.startsWith('/simuladores') ||
        location.pathname.startsWith('/ejercicios') ||
        location.pathname.startsWith('/herramientas'),
    },
    {
      to: '/examenes',
      label: 'Exámenes',
      icon: ClipboardList,
      badge: pendingCount > 0 ? (pendingCount > 9 ? '9+' : pendingCount) : undefined,
      isActive: location.pathname.startsWith('/examenes'),
    },
    {
      to: isStaff ? '/admin' : user ? '/portal' : '/auth/login',
      label: isStaff ? (isAdmin ? 'Admin' : 'Profesor') : user ? 'Mi Portal' : 'Ingresar',
      icon: isStaff ? Shield : User,
      isActive:
        (isStaff && location.pathname.startsWith('/admin')) ||
        (!isStaff && location.pathname.startsWith('/portal')),
    },
  ];

  return (
    <nav
      aria-label="Navegación móvil inferior"
      className="fixed bottom-0 left-0 right-0 z-40 lg:hidden bg-white/95 dark:bg-slate-950/95 backdrop-blur-xl border-t border-slate-200/80 dark:border-slate-800/80 shadow-lg shadow-black/10 transition-colors"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      <div className="flex items-center justify-around px-2 py-1.5 max-w-md mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = item.isActive;
          return (
            <Link
              key={item.to}
              to={item.to}
              className={`flex flex-col items-center justify-center py-1 px-3 rounded-2xl transition-all relative group ${
                active
                  ? 'text-blue-600 dark:text-cyan-400 font-bold'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <div className="relative">
                <Icon
                  className={`w-5 h-5 transition-transform group-active:scale-90 ${
                    active ? 'stroke-[2.5px]' : 'stroke-[1.8px]'
                  }`}
                />
                {item.badge && (
                  <span className="absolute -top-1 -right-2 px-1 py-0.2 rounded-full bg-red-500 text-white text-[9px] font-black leading-none flex items-center justify-center shadow-xs animate-pulse">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] mt-0.5 tracking-tight font-medium truncate max-w-[64px]">
                {item.label}
              </span>
              {active && (
                <span className="w-1 h-1 rounded-full bg-blue-600 dark:bg-cyan-400 mt-0.5 shadow-sm" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
