import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import { useSettingsStore } from './stores/settingsStore';
import { Header } from './Header';
import { LoadingSpinner } from './components/LoadingSpinner';
import IOSInstallBanner from './components/IOSInstallBanner';
import { ProtectedRoute } from './components/auth/ProtectedRoute';

const LandingPage = lazy(() => import('./components/pages/LandingPage'));
const ModulePage = lazy(() => import('./components/pages/ModulePage'));
const TopicPage = lazy(() => import('./components/pages/TopicPage'));
const PlexoCalculatorPage = lazy(() => import('./components/Plexo/PlexoCalculatorPage'));
const ExerciseMode = lazy(() => import('../ejercicios/src/components/ExerciseMode'));
const WorkshopsListPage = lazy(() => import('./components/pages/WorkshopsListPage'));
const WorkshopDetailPage = lazy(() => import('./components/pages/WorkshopDetailPage'));
const LoginPage = lazy(() => import('./components/auth/LoginPage'));
const AuthCallbackPage = lazy(() => import('./components/auth/AuthCallbackPage'));
const ContributorDashboard = lazy(() => import('./components/editorial/ContributorDashboard'));
const ProfileSetupPage = lazy(() => import('./components/editorial/ProfileSetupPage'));
const ModuleEditorPage = lazy(() => import('./components/editorial/ModuleEditorPage'));
const RevisionEditorPage = lazy(() => import('./components/editorial/RevisionEditorPage'));
const SpecialistsPage = lazy(() => import('./components/editorial/SpecialistsPage'));
const PublicProfilePage = lazy(() => import('./components/editorial/PublicProfilePage'));
const QuizEditorPage = lazy(() => import('./components/quiz/QuizEditorPage'));
const ClinicalCaseEditorPage = lazy(() => import('./components/editorial/ClinicalCaseEditorPage'));
const MyProgressPage = lazy(() => import('./components/quiz/MyProgressPage'));
const EditorialCommitteePage = lazy(() => import('./components/editorial/EditorialCommitteePage'));
const AdminDashboard = lazy(() => import('./components/admin/AdminDashboard'));
const AdminReviewQueue = lazy(() => import('./components/admin/AdminReviewQueue'));
const AdminUsersPage = lazy(() => import('./components/admin/AdminUsersPage'));
const AdminAuditPage = lazy(() => import('./components/admin/AdminAuditPage'));
const AdminQuizAttemptsPage = lazy(() => import('./components/admin/AdminQuizAttemptsPage'));
const AdminWorkshopsPage = lazy(() => import('./components/admin/AdminWorkshopsPage'));
const AdminModuleAccessPage = lazy(() => import('./components/admin/AdminModuleAccessPage'));
const AccountPage = lazy(() => import('./components/user/AccountPage'));
const SettingsPage = lazy(() => import('./components/user/SettingsPage'));

function App() {
  const { isDarkMode } = useSettingsStore();

  return (
    <div className={isDarkMode ? 'dark' : ''}>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950 text-slate-900 dark:text-slate-100 transition-colors duration-300">
        <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <Header />
          <Suspense fallback={<LoadingSpinner />}>
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/ejercicios" element={<ExerciseMode />} />
              <Route path="/herramientas/plexo-braquial" element={<PlexoCalculatorPage />} />
              <Route path="/talleres" element={<WorkshopsListPage />} />
              <Route path="/taller/:workshopId" element={<WorkshopDetailPage />} />
              <Route path="/modulo/:moduleId" element={<ModulePage />} />
              <Route path="/modulo/:moduleId/*" element={<TopicPage />} />

              {/* Público */}
              <Route path="/especialistas" element={<SpecialistsPage />} />
              <Route path="/especialistas/:userId" element={<PublicProfilePage />} />
              <Route path="/comite-editorial" element={<EditorialCommitteePage />} />

              {/* Auth */}
              <Route path="/auth/login" element={<LoginPage />} />
              <Route path="/auth/callback" element={<AuthCallbackPage />} />

              {/* Colaboradores */}
              <Route path="/colaborador" element={<ProtectedRoute><ContributorDashboard /></ProtectedRoute>} />
              <Route path="/colaborador/perfil" element={<ProtectedRoute><ProfileSetupPage /></ProtectedRoute>} />
              <Route path="/colaborador/nueva-revision" element={<ProtectedRoute mode="verified"><RevisionEditorPage /></ProtectedRoute>} />
              <Route path="/colaborador/nuevo-modulo" element={<ProtectedRoute mode="verified"><ModuleEditorPage /></ProtectedRoute>} />
              <Route path="/colaborador/cuestionario" element={<ProtectedRoute mode="verified"><QuizEditorPage /></ProtectedRoute>} />
              <Route path="/colaborador/cuestionario/:revisionId" element={<ProtectedRoute mode="verified"><QuizEditorPage /></ProtectedRoute>} />
              <Route path="/colaborador/nuevo-caso" element={<ProtectedRoute mode="verified"><ClinicalCaseEditorPage /></ProtectedRoute>} />
              <Route path="/colaborador/caso-clinico/:revisionId" element={<ProtectedRoute mode="verified"><ClinicalCaseEditorPage /></ProtectedRoute>} />
              <Route path="/colaborador/revision/:revisionId" element={<ProtectedRoute mode="verified"><RevisionEditorPage /></ProtectedRoute>} />
              <Route path="/mi-progreso" element={<ProtectedRoute mode="enrolled"><MyProgressPage /></ProtectedRoute>} />

              {/* Cuenta */}
              <Route path="/cuenta" element={<ProtectedRoute><AccountPage /></ProtectedRoute>} />
              <Route path="/cuenta/ajustes" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />

              {/* Admin */}
              <Route path="/admin" element={<ProtectedRoute mode="admin"><AdminDashboard /></ProtectedRoute>} />
              <Route path="/admin/revisiones" element={<ProtectedRoute mode="editor"><AdminReviewQueue /></ProtectedRoute>} />
              <Route path="/admin/usuarios" element={<ProtectedRoute mode="admin"><AdminUsersPage /></ProtectedRoute>} />
              <Route path="/admin/evaluaciones" element={<ProtectedRoute mode="editor"><AdminQuizAttemptsPage /></ProtectedRoute>} />
              <Route path="/admin/auditoria" element={<ProtectedRoute mode="admin"><AdminAuditPage /></ProtectedRoute>} />
              <Route path="/admin/talleres" element={<ProtectedRoute mode="admin"><AdminWorkshopsPage /></ProtectedRoute>} />
              <Route path="/admin/acceso" element={<ProtectedRoute mode="admin"><AdminModuleAccessPage /></ProtectedRoute>} />
            </Routes>
          </Suspense>
        </Router>
        <IOSInstallBanner />
      </div>
    </div>
  );
}

export default App;
