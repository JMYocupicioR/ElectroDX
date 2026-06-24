import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  BarChart3,
  ChevronDown,
  ClipboardList,
  LogOut,
  PenLine,
  Settings,
  Shield,
  User,
  UserCircle,
  Crown,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthProvider';
import { useAdminPendingCounts } from '../../hooks/useAdminPendingCounts';
import {
  ENROLLMENT_META,
  getPermissionSummary,
  ROLE_META,
} from '../../utils/roleLabels';

export function UserMenu() {
  const {
    user,
    profile,
    roles,
    isAdmin,
    canProposeContent,
    isEnrolledPhysician,
    enrollmentStatus,
    bootstrapAvailable,
    claimBootstrapAdmin,
    signOut,
  } = useAuth();
  const { totalPending } = useAdminPendingCounts();
  const [open, setOpen] = useState(false);
  const [claiming, setClaiming] = useState(false);
  const [claimError, setClaimError] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  if (!user) return null;

  const displayName = profile?.display_name ?? user.email?.split('@')[0] ?? 'Usuario';
  const initials = displayName.charAt(0).toUpperCase();
  const permissions = getPermissionSummary({
    roles,
    verifiedAt: profile?.verified_at ?? null,
    enrollmentStatus,
    canProposeContent,
    isEnrolledPhysician,
    isAdmin,
  });

  const handleClaimAdmin = async () => {
    setClaiming(true);
    setClaimError(null);
    const result = await claimBootstrapAdmin();
    setClaiming(false);
    if (result.error) setClaimError(result.error);
    else setOpen(false);
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label="Menú de usuario"
      >
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 overflow-hidden flex items-center justify-center text-white text-sm font-semibold shadow-sm">
          {profile?.avatar_url ? (
            <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
          ) : (
            initials
          )}
        </div>
        <span className="hidden md:inline text-sm font-medium text-slate-700 dark:text-slate-200 max-w-[8rem] truncate">
          {displayName}
        </span>
        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 mt-2 w-80 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-xl shadow-slate-200/50 dark:shadow-black/30 overflow-hidden z-[60]"
        >
          <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-gradient-to-br from-slate-50 to-blue-50/50 dark:from-slate-900 dark:to-indigo-950/30">
            <p className="font-semibold text-slate-900 dark:text-white truncate">{displayName}</p>
            <p className="text-xs text-slate-500 truncate mt-0.5">{user.email}</p>

            <div className="flex flex-wrap gap-1.5 mt-3">
              {roles.length ? (
                roles.map((role) => (
                  <span
                    key={role}
                    className={`px-2 py-0.5 rounded-md text-xs font-medium ${ROLE_META[role].badgeClass}`}
                  >
                    {ROLE_META[role].label}
                  </span>
                ))
              ) : (
                <span className="px-2 py-0.5 rounded-md text-xs bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                  Sin rol asignado
                </span>
              )}
              <span
                className={`px-2 py-0.5 rounded-md text-xs font-medium ${ENROLLMENT_META[enrollmentStatus].badgeClass}`}
              >
                {ENROLLMENT_META[enrollmentStatus].label}
              </span>
            </div>

            <div className="mt-3">
              <p className="text-[0.65rem] uppercase tracking-wide text-slate-400 font-semibold mb-1.5">
                Permisos activos
              </p>
              <ul className="space-y-1">
                {permissions.map((p) => (
                  <li key={p} className="text-xs text-slate-600 dark:text-slate-300 flex items-start gap-1.5">
                    <span className="text-emerald-500 mt-0.5">•</span>
                    {p}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {bootstrapAvailable && !isAdmin && (
            <div className="px-4 py-3 border-b border-amber-200/60 dark:border-amber-900/40 bg-amber-50/80 dark:bg-amber-950/20">
              <p className="text-xs text-amber-800 dark:text-amber-200 mb-2">
                No hay administrador. Como CEO puedes activar el acceso completo.
              </p>
              {claimError && <p className="text-xs text-red-600 mb-2">{claimError}</p>}
              <button
                type="button"
                disabled={claiming}
                onClick={handleClaimAdmin}
                className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-sm font-medium disabled:opacity-50"
              >
                <Crown className="w-4 h-4" />
                {claiming ? 'Activando…' : 'Activar administrador'}
              </button>
            </div>
          )}

          <div className="py-1">
            <MenuLink to="/cuenta" icon={UserCircle} onClick={() => setOpen(false)}>
              Mi cuenta
            </MenuLink>
            <MenuLink to="/colaborador/perfil" icon={User} onClick={() => setOpen(false)}>
              Editar perfil
            </MenuLink>
            {isEnrolledPhysician && (
              <MenuLink to="/mi-progreso" icon={BarChart3} onClick={() => setOpen(false)}>
                Mi progreso
              </MenuLink>
            )}
            <MenuLink to="/colaborador" icon={PenLine} onClick={() => setOpen(false)}>
              Colaborar
            </MenuLink>
            {canProposeContent && (
              <MenuLink to="/colaborador/cuestionario" icon={ClipboardList} onClick={() => setOpen(false)}>
                Cuestionarios
              </MenuLink>
            )}
            {isAdmin && (
              <MenuLink
                to="/admin"
                icon={Shield}
                onClick={() => setOpen(false)}
                badge={totalPending > 0 ? (totalPending > 9 ? '9+' : String(totalPending)) : undefined}
              >
                Administración
              </MenuLink>
            )}
            <MenuLink to="/cuenta/ajustes" icon={Settings} onClick={() => setOpen(false)}>
              Ajustes
            </MenuLink>
          </div>

          <div className="border-t border-slate-100 dark:border-slate-800 p-1">
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                setOpen(false);
                signOut();
              }}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Cerrar sesión
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function MenuLink({
  to,
  icon: Icon,
  children,
  onClick,
  badge,
}: {
  to: string;
  icon: typeof User;
  children: React.ReactNode;
  onClick?: () => void;
  badge?: string;
}) {
  return (
    <Link
      to={to}
      role="menuitem"
      onClick={onClick}
      className="flex items-center gap-3 px-3 py-2.5 mx-1 rounded-xl text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
    >
      <Icon className="w-4 h-4 text-slate-400" />
      <span className="flex-1">{children}</span>
      {badge && (
        <span className="min-w-[1.1rem] h-[1.1rem] px-1 rounded-full bg-red-500 text-white text-[0.6rem] font-bold flex items-center justify-center">
          {badge}
        </span>
      )}
    </Link>
  );
}
