import { useState, useEffect, type ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useSettingsStore } from './stores/settingsStore';
import { useOfflineStore } from './stores/offlineStore';
import {
  BookOpen,
  Sun,
  Moon,
  Globe,
  Menu,
  X,
  Users,
  LogIn,
  Scale,
  GraduationCap,
  Shield,
  ChevronRight,
  Wrench,
  Lock,
  ClipboardList,
  PanelLeft,
} from 'lucide-react';
import { BrandLogo } from './components/brand/BrandLogo';
import { CourseSidebar } from './components/CourseSidebar';
import { BRAND } from './config/brand';
import { OfflineIndicator } from './components/OfflineButton';
import { UserMenu } from './components/user/UserMenu';
import { useAuth } from './contexts/AuthProvider';
import { useAdminPendingCounts } from './hooks/useAdminPendingCounts';
import { useStudentPendingAssignments } from './hooks/useStudentPendingAssignments';
import { isSupabaseConfigured } from './lib/supabase';

function navClass(active: boolean) {
  return `flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-all ${
    active
      ? 'text-blue-600 bg-blue-50 dark:bg-blue-950/50 dark:text-cyan-400 font-semibold'
      : 'text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-cyan-400 hover:bg-slate-100 dark:hover:bg-slate-800/60'
  }`;
}

function MobileNavRow({
  to,
  icon,
  label,
  onClick,
  trailing,
}: {
  to: string;
  icon: ReactNode;
  label: string;
  onClick: () => void;
  trailing?: ReactNode;
}) {
  return (
    <Link
      to={to}
      onClick={onClick}
      className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/80 text-slate-800 dark:text-slate-200 font-medium text-sm transition"
    >
      <div className="flex items-center gap-3">
        {icon}
        <span>{label}</span>
      </div>
      <div className="flex items-center gap-1.5">
        {trailing}
        <ChevronRight className="w-4 h-4 text-slate-400" />
      </div>
    </Link>
  );
}

export function Header() {
  const { isDarkMode, toggleDarkMode, language, setLanguage } = useSettingsStore();
  const initializeOffline = useOfflineStore((s) => s.initialize);
  const { user, isAdmin, isPendingApproval } = useAuth();
  const { totalPending } = useAdminPendingCounts();
  const { pendingCount } = useStudentPendingAssignments();
  const location = useLocation();

  const [courseSidebarOpen, setCourseSidebarOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isLoggedIn = Boolean(user);
  const showPublicNav = !isLoggedIn;
  const homeHref = isLoggedIn ? (isAdmin ? '/admin' : '/portal') : '/';
  const portalActive = location.pathname === '/portal' || location.pathname === '/dashboard' || location.pathname === '/estudiante';
  const courseActive = location.pathname.startsWith('/modulo');
  const simulatorsActive =
    location.pathname.startsWith('/herramientas') ||
    location.pathname === '/ejercicios' ||
    location.pathname.startsWith('/simuladores');
  const examsActive = location.pathname.startsWith('/examenes');

  const openCourseSidebar = () => {
    setMobileMenuOpen(false);
    setCourseSidebarOpen(true);
  };

  useEffect(() => {
    const handleOpenSidebar = () => setCourseSidebarOpen(true);
    window.addEventListener('open-course-sidebar', handleOpenSidebar);
    return () => window.removeEventListener('open-course-sidebar', handleOpenSidebar);
  }, []);

  useEffect(() => {
    initializeOffline();
  }, [initializeOffline]);

  useEffect(() => {
    setMobileMenuOpen(false);
    setCourseSidebarOpen(false);
  }, [location.pathname]);

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/85 dark:bg-slate-900/85 backdrop-blur-xl border-b border-slate-200/70 dark:border-slate-800/70 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-15 sm:h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to={homeHref} className="flex items-center group transition-transform hover:scale-[1.02]">
              <BrandLogo variant="full" size="md" />
            </Link>
          </div>

          <nav className="hidden lg:flex items-center gap-1 xl:gap-2" aria-label="Principal">
            {showPublicNav && (
              <>
                <Link to="/temario" className={navClass(location.pathname === '/temario' || location.pathname === '/programa')}>
                  <BookOpen className="w-4 h-4 text-blue-600 dark:text-cyan-400" />
                  <span>Temario</span>
                </Link>
                <Link to="/cursos" className={navClass(location.pathname === '/cursos')}>
                  <GraduationCap className="w-4 h-4" />
                  <span>Cursos</span>
                </Link>
              </>
            )}

            {isLoggedIn && !isAdmin && (
              <Link to="/portal" className={navClass(portalActive)}>
                <GraduationCap className="w-4 h-4" />
                <span>Portal</span>
                {pendingCount > 0 && (
                  <span className="px-1.5 py-0.5 rounded-full bg-red-500 text-white text-[10px] font-bold leading-none">
                    {pendingCount > 9 ? '9+' : pendingCount}
                  </span>
                )}
              </Link>
            )}

            {isLoggedIn && (
              <button
                type="button"
                onClick={openCourseSidebar}
                className={navClass(courseActive)}
                aria-label="Abrir contenido del curso"
              >
                <PanelLeft className="w-4 h-4" />
                <span>Curso</span>
              </button>
            )}

            <Link to="/simuladores" className={navClass(simulatorsActive)}>
              <Wrench className="w-4 h-4" />
              <span>Simuladores</span>
              {showPublicNav && (
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30">
                  PRO
                </span>
              )}
            </Link>

            {isLoggedIn && (
              <Link to="/examenes" className={navClass(examsActive)}>
                <ClipboardList className="w-4 h-4" />
                <span>Exámenes</span>
              </Link>
            )}

            {showPublicNav && isSupabaseConfigured && (
              <>
                <Link to="/especialistas" className={navClass(location.pathname.startsWith('/especialistas'))}>
                  <Users className="w-4 h-4" />
                  <span>Especialistas</span>
                </Link>
                <Link to="/comite-editorial" className={navClass(location.pathname === '/comite-editorial')}>
                  <Scale className="w-4 h-4" />
                  <span>Comité</span>
                </Link>
              </>
            )}
          </nav>

          <div className="hidden lg:flex items-center gap-2">
            <OfflineIndicator />

            {isSupabaseConfigured && user && isAdmin && (
              <Link
                to="/admin"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-blue-500/10 dark:from-indigo-950/60 dark:to-purple-950/60 text-indigo-600 dark:text-indigo-300 border border-indigo-200/80 dark:border-indigo-800/80 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-all shadow-xs"
                title="Panel de Administración"
              >
                <Shield className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 shrink-0" />
                <span>Admin</span>
                {totalPending > 0 && (
                  <span className="px-1.5 py-0.5 rounded-full bg-red-500 text-white text-[10px] font-bold leading-none">
                    {totalPending > 9 ? '9+' : totalPending}
                  </span>
                )}
              </Link>
            )}

            {isSupabaseConfigured && user ? (
              <UserMenu />
            ) : isSupabaseConfigured ? (
              <div className="flex items-center gap-1.5">
                <Link
                  to="/auth/login"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-cyan-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Ingresar</span>
                </Link>
                <Link
                  to="/auth/registro"
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600 text-white hover:opacity-95 shadow-sm shadow-blue-500/20 transition"
                >
                  <GraduationCap className="w-3.5 h-3.5" />
                  <span>Registro</span>
                </Link>
              </div>
            ) : null}

            <div className="h-4 w-[1px] bg-slate-200 dark:bg-slate-800 mx-1" />

            <button
              onClick={() => setLanguage(language === 'es' ? 'en' : 'es')}
              className="px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-500 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
              aria-label="Cambiar idioma"
            >
              <span className="flex items-center gap-1">
                <Globe className="w-3.5 h-3.5" />
                {language === 'es' ? 'ES' : 'EN'}
              </span>
            </button>

            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
              aria-label={isDarkMode ? 'Modo claro' : 'Modo oscuro'}
            >
              {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>

          <div className="flex lg:hidden items-center gap-1.5">
            <OfflineIndicator />

            {isSupabaseConfigured && user && (
              <div className="scale-90">
                <UserMenu />
              </div>
            )}

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
              aria-label={mobileMenuOpen ? 'Cerrar menú' : 'Abrir menú'}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </header>

      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div
            onClick={() => setMobileMenuOpen(false)}
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity"
          />

          <div className="fixed top-15 sm:top-16 right-0 bottom-0 w-full max-w-sm bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shadow-2xl p-6 overflow-y-auto flex flex-col justify-between">
            <div className="space-y-6">
              {isSupabaseConfigured && user ? (
                <div className="p-4 rounded-2xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200/80 dark:border-blue-800/60">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm">
                      {user.email?.substring(0, 2).toUpperCase()}
                    </div>
                    <div className="overflow-hidden">
                      <div className="text-sm font-bold text-slate-900 dark:text-white truncate">{user.email}</div>
                      <div className="text-xs text-blue-600 dark:text-cyan-400 font-medium">
                        {isAdmin ? 'Administrador' : 'Médico registrado'}
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 flex flex-col gap-2">
                    {isAdmin ? (
                      <Link
                        to="/admin"
                        onClick={() => setMobileMenuOpen(false)}
                        className="w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold"
                      >
                        <Shield className="w-3.5 h-3.5" />
                        Panel de administración
                      </Link>
                    ) : isPendingApproval ? (
                      <Link
                        to="/portal"
                        onClick={() => setMobileMenuOpen(false)}
                        className="w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-amber-600 text-white text-xs font-semibold shadow-xs"
                      >
                        <Lock className="w-3.5 h-3.5" />
                        Ver estado de admisión
                      </Link>
                    ) : (
                      <Link
                        to="/portal"
                        onClick={() => setMobileMenuOpen(false)}
                        className="w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-blue-600 text-white text-xs font-semibold"
                      >
                        <GraduationCap className="w-3.5 h-3.5" />
                        <span>Ir a mi portal</span>
                        {pendingCount > 0 && (
                          <span className="px-1.5 py-0.5 rounded-full bg-red-500 text-white text-[10px] font-black leading-none">
                            {pendingCount}
                          </span>
                        )}
                      </Link>
                    )}
                  </div>
                </div>
              ) : isSupabaseConfigured ? (
                <div className="space-y-2.5">
                  <Link
                    to="/auth/registro"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600 text-white text-sm font-bold shadow-md shadow-blue-500/20"
                  >
                    <GraduationCap className="w-4 h-4" />
                    <span>Registro estudiante</span>
                  </Link>
                  <Link
                    to="/auth/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-sm font-medium hover:bg-slate-200"
                  >
                    <LogIn className="w-4 h-4" />
                    <span>Ingresar a mi cuenta</span>
                  </Link>
                </div>
              ) : null}

              <div>
                <span className="text-[11px] font-mono uppercase tracking-wider font-bold text-slate-400 block mb-3">
                  {isLoggedIn ? 'Estudiar' : 'Programa'}
                </span>
                <div className="space-y-1">
                  {showPublicNav && (
                    <>
                      <MobileNavRow
                        to="/temario"
                        onClick={() => setMobileMenuOpen(false)}
                        icon={<BookOpen className="w-4 h-4 text-blue-600 dark:text-cyan-400" />}
                        label="Temario"
                      />
                      <MobileNavRow
                        to="/cursos"
                        onClick={() => setMobileMenuOpen(false)}
                        icon={<GraduationCap className="w-4 h-4" />}
                        label="Cursos"
                      />
                    </>
                  )}

                  {isLoggedIn && (
                    <button
                      type="button"
                      onClick={openCourseSidebar}
                      className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/80 text-slate-800 dark:text-slate-200 font-medium text-sm transition"
                    >
                      <div className="flex items-center gap-3">
                        <PanelLeft className="w-4 h-4 text-blue-600 dark:text-cyan-400" />
                        <span>Curso</span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-400" />
                    </button>
                  )}

                  <MobileNavRow
                    to="/simuladores"
                    onClick={() => setMobileMenuOpen(false)}
                    icon={<Wrench className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />}
                    label="Simuladores"
                  />

                  {isLoggedIn && (
                    <MobileNavRow
                      to="/examenes"
                      onClick={() => setMobileMenuOpen(false)}
                      icon={<ClipboardList className="w-4 h-4 text-cyan-600" />}
                      label="Exámenes"
                    />
                  )}

                  {showPublicNav && isSupabaseConfigured && (
                    <>
                      <MobileNavRow
                        to="/especialistas"
                        onClick={() => setMobileMenuOpen(false)}
                        icon={<Users className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />}
                        label="Especialistas"
                      />
                      <MobileNavRow
                        to="/comite-editorial"
                        onClick={() => setMobileMenuOpen(false)}
                        icon={<Scale className="w-4 h-4 text-purple-600 dark:text-purple-400" />}
                        label={BRAND.enableAccreditation ? 'Comité editorial y aval' : 'Comité editorial'}
                      />
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-slate-200 dark:border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Idioma</span>
                <button
                  onClick={() => setLanguage(language === 'es' ? 'en' : 'es')}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200"
                >
                  <Globe className="w-3.5 h-3.5" />
                  <span>{language === 'es' ? 'Español' : 'English'}</span>
                </button>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Tema</span>
                <button
                  onClick={toggleDarkMode}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200"
                >
                  {isDarkMode ? (
                    <>
                      <Sun className="w-3.5 h-3.5 text-amber-400" />
                      <span>Claro</span>
                    </>
                  ) : (
                    <>
                      <Moon className="w-3.5 h-3.5 text-slate-700" />
                      <span>Oscuro</span>
                    </>
                  )}
                </button>
              </div>

              <div className="text-center pt-2">
                <span className="text-[10px] text-slate-400">
                  {BRAND.enableAccreditation
                    ? 'Avalado por el Colegio Mexicano de Medicina de Rehabilitación A.C.'
                    : BRAND.tagline}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      <CourseSidebar isOpen={courseSidebarOpen} onClose={() => setCourseSidebarOpen(false)} />
    </>
  );
}
