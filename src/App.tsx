import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import { useSettingsStore } from './stores/settingsStore';
import { Header } from './Header';
import { LoadingSpinner } from './components/LoadingSpinner';

const LandingPage = lazy(() => import('./components/pages/LandingPage'));
const ModulePage = lazy(() => import('./components/pages/ModulePage'));
const TopicPage = lazy(() => import('./components/pages/TopicPage'));
const PlexoCalculatorPage = lazy(() => import('./components/Plexo/PlexoCalculatorPage'));
const ExerciseMode = lazy(() => import('../ejercicios/src/components/ExerciseMode'));

function App() {
  const { isDarkMode } = useSettingsStore();

  return (
    <div className={isDarkMode ? 'dark' : ''}>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950 text-slate-900 dark:text-slate-100 transition-colors duration-300">
        <Router>
          <Header />
          <Suspense fallback={<LoadingSpinner />}>
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/ejercicios" element={<ExerciseMode />} />
              <Route path="/herramientas/plexo-braquial" element={<PlexoCalculatorPage />} />
              <Route path="/modulo/:moduleId" element={<ModulePage />} />
              <Route path="/modulo/:moduleId/*" element={<TopicPage />} />
            </Routes>
          </Suspense>
        </Router>
      </div>
    </div>
  );
}

export default App;