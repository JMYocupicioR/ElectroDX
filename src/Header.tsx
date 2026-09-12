import { useState, useEffect } from 'react';
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
  Stethoscope,
  ChevronRight,
  BrainCircuit,
  Wrench
} from 'lucide-react';
import { CourseSidebar } from './components/CourseSidebar';
import { OfflineIndicator } from './components/OfflineButton';
import { UserMenu } from './components/user/UserMenu';
import { useAuth } from './contexts/AuthProvider';
import { useAdminPendingCounts } from './hooks/useAdminPendingCounts';
import { isSupabaseConfigured } from './lib/supabase';

export function Header() {
  const { isDarkMode, toggleDarkMode, language, setLanguage } = useSettingsStore();
  const initializeOffline = useOfflineStore(s => s.initialize);
  const { user, isAdmin } = useAuth();
  const { totalPending } = useAdminPendingCounts();
  const location = useLocation();

  const [courseSidebarOpen, setCourseSidebarOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    initializeOffline();
  }, [initializeOffline]);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/85 dark:bg-slate-900/85 backdrop-blur-xl border-b border-slate-200/70 dark:border-slate-800/70 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-15 sm:h-16 flex items-center justify-between">
          {/* Brand Logo (Desktop & Mobile: Clean, NO hamburger icon on Desktop) */}
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-2.5 sm:gap-3 group">
              <div className="flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-br from-blue-600 via-indigo-600 to-cyan-600 text-white shadow-md shadow-blue-500/20 group-hover:shadow-lg group-hover:scale-105 transition-all">
                <BrainCircuit className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-baseline">
                  <span className="font-extrabold text-slate-900 dark:text-white text-lg tracking-tight">NeuroSAFE</span>
                  <span className="text-blue-600 dark:text-cyan-400 text-sm font-bold ml-0.5">MX</span>
                </div>
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-200/80 dark:bg-blue-950/70 dark:text-blue-300 dark:border-blue-800/60">
                  Aval COMEFYR
                </span>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation (Visible on lg: and up) */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
            <Link
              to="/temario"
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                location.pathname === '/temario'
                  ? 'text-blue-600 bg-blue-50 dark:bg-blue-950/50 dark:text-cyan-400 font-semibold'
                  : 'text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-cyan-400 hover:bg-slate-100 dark:hover:bg-slate-800/60'
              }`}
            >
              <BookOpen className="w-4 h-4 text-blue-600 dark:text-cyan-400" />
              <span>Temario</span>
            </Link>

            <Link
              to="/herramientas/plexo-braquial"
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                location.pathname.startsWith('/herramientas') || location.pathname === '/ejercicios'
                  ? 'text-blue-600 bg-blue-50 dark:bg-blue-950/50 dark:text-cyan-400 font-semibold'
                  : 'text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-cyan-400 hover:bg-slate-100 dark:hover:bg-slate-800/60'
              }`}
            >
              <Wrench className="w-4 h-4" />
              <span>Simuladores</span>
            </Link>

            {isSupabaseConfigured && (
              <>
                <Link
                  to="/especialistas"
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                    location.pathname === '/especialistas'
                      ? 'text-blue-600 bg-blue-50 dark:bg-blue-950/50 dark:text-cyan-400 font-semibold'
                      : 'text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-cyan-400 hover:bg-slate-100 dark:hover:bg-slate-800/60'
                  }`}
                >
                  <Users className="w-4 h-4" />
                  <span>Especialistas</span>
                </Link>

                <Link
                  to="/comite-editorial"
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                    location.pathname === '/comite-editorial'
                      ? 'text-blue-600 bg-blue-50 dark:bg-blue-950/50 dark:text-cyan-400 font-semibold'
                      : 'text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-cyan-400 hover:bg-slate-100 dark:hover:bg-slate-800/60'
                  }`}
                >
                  <Scale className="w-4 h-4" />
                  <span>Comité</span>
                </Link>
              </>
            )}
          </nav>

          {/* Desktop Right Actions (Auth, Theme, Language) */}
          <div className="hidden lg:flex items-center gap-2">
            <OfflineIndicator />

            {/* Role & Auth Badges / Buttons */}
            {isSupabaseConfigured && user && isAdmin && (
              <Link
                to="/admin"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-blue-500/10 dark:from-indigo-950/60 dark:to-purple-950/60 text-indigo-600 dark:text-indigo-300 border border-indigo-200/80 dark:border-indigo-800/80 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-all shadow-xs"
                title="Panel de Administración"
              >
                <Shield className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 shrink-0" />
                <span>Panel Admin</span>
                {totalPending > 0 && (
                  <span className="px-1.5 py-0.5 rounded-full bg-red-500 text-white text-[10px] font-bold leading-none">
                    {totalPending > 9 ? '9+' : totalPending}
                  </span>
                )}
              </Link>
            )}

            {isSupabaseConfigured && user && !isAdmin && (
              <Link
                to="/dashboard"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-gradient-to-r from-blue-600/10 via-indigo-600/10 to-cyan-500/10 dark:from-blue-950/60 dark:to-indigo-950/60 text-blue-600 dark:text-cyan-300 border border-blue-200/80 dark:border-blue-800/80 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-all shadow-xs"
                title="Ir a Mi Portal de Estudiante"
              >
                <GraduationCap className="w-3.5 h-3.5 text-blue-600 dark:text-cyan-400 shrink-0" />
                <span>Mi Portal</span>
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
                  <span>Registro Estudiante</span>
                </Link>
              </div>
            ) : null}

            <div className="h-4 w-[1px] bg-slate-200 dark:bg-slate-800 mx-1" />

            {/* Language & Dark Mode controls */}
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

          {/* Mobile Right Controls: Ultra Clean (Only Menu Toggle & Avatar if user) */}
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

      {/* Mobile Drawer / Slide-Over Navigation (Neatly containing all links & controls) */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          {/* Backdrop */}
          <div
            onClick={() => setMobileMenuOpen(false)}
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity"
          />

          {/* Drawer Panel */}
          <div className="fixed top-15 sm:top-16 right-0 bottom-0 w-full max-w-sm bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shadow-2xl p-6 overflow-y-auto flex flex-col justify-between">
            <div className="space-y-6">
              {/* User Session Banner or Guest Sign-in */}
              {isSupabaseConfigured && user ? (
                <div className="p-4 rounded-2xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200/80 dark:border-blue-800/60">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm">
                      {user.email?.substring(0, 2).toUpperCase()}
                    </div>
                    <div className="overflow-hidden">
                      <div className="text-sm font-bold text-slate-900 dark:text-white truncate">{user.email}</div>
                      <div className="text-xs text-blue-600 dark:text-cyan-400 font-medium">
                        {isAdmin ? 'Administrador COMEFYR' : 'Médico Registrado'}
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
                        Ir a Panel de Administración
                      </Link>
                    ) : (
                      <Link
                        to="/dashboard"
                        onClick={() => setMobileMenuOpen(false)}
                        className="w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-blue-600 text-white text-xs font-semibold"
                      >
                        <GraduationCap className="w-3.5 h-3.5" />
                        Ir a Mi Portal de Estudiante
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
                    <span>Registro Estudiante (COMEFYR)</span>
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

              {/* Navigation Links */}
              <div>
                <span className="text-[11px] font-mono uppercase tracking-wider font-bold text-slate-400 block mb-3">
                  Navegación del Programa
                </span>
                <div className="space-y-1">
                  <Link
                    to="/temario"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/80 text-slate-800 dark:text-slate-200 font-medium text-sm transition"
                  >
                    <div className="flex items-center gap-3">
                      <BookOpen className="w-4 h-4 text-blue-600 dark:text-cyan-400" />
                      <span>Temario y 13 Módulos</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </Link>

                  <Link
                    to="/herramientas/plexo-braquial"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/80 text-slate-800 dark:text-slate-200 font-medium text-sm transition"
                  >
                    <div className="flex items-center gap-3">
                      <Wrench className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      <span>Calculadora de Plexo Braquial</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </Link>

                  <Link
                    to="/ejercicios"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/80 text-slate-800 dark:text-slate-200 font-medium text-sm transition"
                  >
                    <div className="flex items-center gap-3">
                      <Stethoscope className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                      <span>Modo Ejercicio & Trazos EMG</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </Link>

                  {isSupabaseConfigured && (
                    <>
                      <Link
                        to="/especialistas"
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/80 text-slate-800 dark:text-slate-200 font-medium text-sm transition"
                      >
                        <div className="flex items-center gap-3">
                          <Users className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                          <span>Directorio de Especialistas</span>
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-400" />
                      </Link>

                      <Link
                        to="/comite-editorial"
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/80 text-slate-800 dark:text-slate-200 font-medium text-sm transition"
                      >
                        <div className="flex items-center gap-3">
                          <Scale className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                          <span>Comité Editorial y Aval</span>
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-400" />
                      </Link>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Mobile Footer: Theme, Language & Accreditation info */}
            <div className="pt-6 border-t border-slate-200 dark:border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Idioma de la plataforma</span>
                <button
                  onClick={() => setLanguage(language === 'es' ? 'en' : 'es')}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200"
                >
                  <Globe className="w-3.5 h-3.5" />
                  <span>{language === 'es' ? 'Español (ES)' : 'English (EN)'}</span>
                </button>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Tema visual</span>
                <button
                  onClick={toggleDarkMode}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200"
                >
                  {isDarkMode ? (
                    <>
                      <Sun className="w-3.5 h-3.5 text-amber-400" />
                      <span>Modo Claro</span>
                    </>
                  ) : (
                    <>
                      <Moon className="w-3.5 h-3.5 text-slate-700" />
                      <span>Modo Oscuro</span>
                    </>
                  )}
                </button>
              </div>

              <div className="text-center pt-2">
                <span className="text-[10px] text-slate-400">
                  Avalado por el Colegio Mexicano de Medicina de Rehabilitación A.C.
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Course sidebar if opened explicitly from anywhere */}
      <CourseSidebar isOpen={courseSidebarOpen} onClose={() => setCourseSidebarOpen(false)} />
    </>
  );
}
