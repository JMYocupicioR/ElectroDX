import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useSettingsStore } from './stores/settingsStore';
import { useOfflineStore } from './stores/offlineStore';
import { BookOpen, Home, Sun, Moon, Globe, Menu, Users, LogIn, Scale, GraduationCap, Shield } from 'lucide-react';
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
  const isHome = location.pathname === '/';
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => { initializeOffline(); }, [initializeOffline]);

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200/60 dark:border-slate-800/60">
        <div className="max-w-7xl mx-auto px-4 h-14 sm:h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 -ml-1 rounded-lg text-slate-500 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all"
              aria-label="Abrir temario"
            >
              <Menu className="w-5 h-5" />
            </button>

            <Link to="/" className="flex items-center gap-2.5 sm:gap-3 group">
              <div className="flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-br from-blue-600 via-indigo-600 to-cyan-600 text-white shadow-md group-hover:shadow-lg group-hover:scale-105 transition-all">
                <BookOpen className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div className="flex items-center gap-2">
                <div>
                  <span className="font-bold text-slate-900 dark:text-white text-lg tracking-tight">NeuroSAFE</span>
                  <span className="text-blue-600 dark:text-cyan-400 text-sm font-semibold ml-0.5">MX</span>
                </div>
                <span className="hidden lg:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-blue-50 text-blue-700 border border-blue-200/80 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800/60">
                  Avalado COMEFYR
                </span>
              </div>
            </Link>
          </div>

          <div className="flex items-center gap-1 sm:gap-2">
            <OfflineIndicator />
            <Link
              to="/temario"
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all"
            >
              <BookOpen className="w-4 h-4 text-blue-600 dark:text-cyan-400" />
              <span>Temario</span>
            </Link>
            {isSupabaseConfigured && (
              <>
                <Link
                  to="/especialistas"
                  className="hidden sm:flex items-center gap-1.5 px-2.5 py-2 rounded-lg text-sm text-slate-500 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all"
                >
                  <Users className="w-4 h-4" />
                  <span>Especialistas</span>
                </Link>
                <Link
                  to="/comite-editorial"
                  className="hidden md:flex items-center gap-1.5 px-2.5 py-2 rounded-lg text-sm text-slate-500 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all"
                >
                  <Scale className="w-4 h-4" />
                  <span>Comité</span>
                </Link>
              </>
            )}
            {isSupabaseConfigured && user && isAdmin && (
              <Link
                to="/admin"
                className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-blue-500/10 dark:from-indigo-950/60 dark:to-purple-950/60 text-indigo-600 dark:text-indigo-300 border border-indigo-200/80 dark:border-indigo-800/80 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 hover:border-indigo-400 transition-all shadow-sm"
                title="Ir al Panel de Administración"
              >
                <Shield className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 shrink-0" />
                <span className="hidden sm:inline">Panel Admin</span>
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
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-cyan-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Ingresar</span>
                </Link>
                <Link
                  to="/auth/registro"
                  className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 text-white hover:opacity-95 shadow-sm shadow-blue-500/20 transition"
                >
                  <GraduationCap className="w-3.5 h-3.5" />
                  <span>Registro Estudiante</span>
                </Link>
              </div>
            ) : null}
            {!isHome && (
              <Link to="/" className="flex items-center gap-1.5 px-2.5 sm:px-3 py-2 rounded-lg text-sm text-slate-500 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all">
                <Home className="w-4 h-4" />
                <span className="hidden sm:inline">Módulos</span>
              </Link>
            )}
            <button
              onClick={() => setLanguage(language === 'es' ? 'en' : 'es')}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-2 rounded-lg text-sm text-slate-500 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all"
              aria-label="Cambiar idioma"
            >
              <Globe className="w-4 h-4" /> {language === 'es' ? 'ES' : 'EN'}
            </button>
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-lg text-slate-500 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all"
              aria-label={isDarkMode ? 'Modo claro' : 'Modo oscuro'}
            >
              {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </header>

      <CourseSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
    </>
  );
}
