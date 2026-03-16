import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useSettingsStore } from './stores/settingsStore';
import { useOfflineStore } from './stores/offlineStore';
import { BookOpen, Home, Sun, Moon, Globe, Menu } from 'lucide-react';
import { CourseSidebar } from './components/CourseSidebar';
import { OfflineIndicator } from './components/OfflineButton';

export function Header() {
  const { isDarkMode, toggleDarkMode, language, setLanguage } = useSettingsStore();
  const initializeOffline = useOfflineStore(s => s.initialize);
  const location = useLocation();
  const isHome = location.pathname === '/';
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Initialize offline store (online/offline listeners)
  useEffect(() => { initializeOffline(); }, [initializeOffline]);

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200/60 dark:border-slate-800/60">
        <div className="max-w-7xl mx-auto px-4 h-14 sm:h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Sidebar Toggle */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 -ml-1 rounded-lg text-slate-500 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all"
              aria-label="Abrir temario"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 sm:gap-3 group">
              <div className="flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-md group-hover:shadow-lg group-hover:scale-105 transition-all">
                <BookOpen className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div className="hidden sm:block">
                <span className="font-bold text-slate-800 dark:text-white text-lg tracking-tight">ENMG</span>
                <span className="text-slate-400 dark:text-slate-500 text-sm ml-1.5 font-light">DeepLuxMed</span>
              </div>
            </Link>
          </div>

          <div className="flex items-center gap-1 sm:gap-2">
            <OfflineIndicator />
            {!isHome && (
              <Link to="/" className="flex items-center gap-1.5 px-2.5 sm:px-3 py-2 rounded-lg text-sm text-slate-500 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all">
                <Home className="w-4 h-4" />
                <span className="hidden sm:inline">Módulos</span>
              </Link>
            )}
            <button
              onClick={() => setLanguage(language === 'es' ? 'en' : 'es')}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-2 rounded-lg text-sm text-slate-500 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all"
            >
              <Globe className="w-4 h-4" /> {language === 'es' ? 'ES' : 'EN'}
            </button>
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-lg text-slate-500 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all"
            >
              {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </header>

      {/* Course Sidebar */}
      <CourseSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
    </>
  );
}