import { createBrowserRouter, createRoutesFromElements, RouterProvider, Route, Navigate, Outlet } from 'react-router-dom';
import { Login } from './pages/Login';
import { SignUp } from './pages/SignUp';

// Admin Pages
import { Dashboard } from './pages/Dashboard';
import { QuestionEditor } from './pages/QuestionEditor';
import { BulkUpload } from './pages/BulkUpload';
import { Analytics } from './pages/Analytics';
import { IslandDetail } from './pages/IslandDetail';
import { TopicDetail } from './pages/TopicDetail';
import { IslandEditor } from './pages/IslandEditor';
import { TopicEditor } from './pages/TopicEditor';
import { QuestionsList } from './pages/QuestionsList';
import { EmptyTopicsPage } from './pages/EmptyTopicsPage';
import { ContentGapsPage } from './pages/ContentGapsPage';

// User Pages
import { UserDashboard } from './pages/user/UserDashboard';
import { UserIslandConfig } from './pages/user/UserIslandConfig';
import { UserIslandQuiz } from './pages/user/UserIslandQuiz';
import { UserAnalytics } from './pages/user/UserAnalytics';
import { UserProfile } from './pages/user/UserProfile';
import { UserExamIntro } from './pages/user/UserExamIntro';
import { UserExamSession } from './pages/user/UserExamSession';
import { ExamResults } from './pages/user/ExamResults';
import { UserPearls } from './pages/user/UserPearls';

// Admin Profile & Students
import { AdminProfile } from './pages/admin/AdminProfile';
import { StudentsList } from './pages/admin/StudentsList';
import { StudentDetail } from './pages/admin/StudentDetail';
import { AdminExamResults } from './pages/admin/AdminExamResults';

import { ErrorBoundary } from './components/ErrorBoundary';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Toaster } from 'sonner';

// --- Auth Guard Components ---

const RequireAuth = () => {
    const { session, loading } = useAuth();
    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            </div>
        );
    }
    if (!session) return <Navigate to="/login" replace />;
    return <Outlet />;
};

const RequireGuest = ({ children }: { children: React.ReactNode }) => {
    const { session, loading } = useAuth();
    if (loading) return null;
    if (session) return <RoleBasedRedirect />;
    return <>{children}</>;
};

const RoleBasedRedirect = () => {
    const { isAdmin, loading } = useAuth();

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Verificando permisos...</p>
                </div>
            </div>
        );
    }

    return <Navigate to={isAdmin ? '/admin/dashboard' : '/user/dashboard'} replace />;
};

const AdminRoute = ({ children }: { children: React.ReactNode }) => {
    const { isAdmin, loading } = useAuth();

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            </div>
        );
    }

    if (!isAdmin) {
        return <Navigate to="/user/dashboard" replace />;
    }

    return <>{children}</>;
};

const RequireNonAdmin = ({ children }: { children: React.ReactNode }) => {
    const { isAdmin, loading } = useAuth();

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            </div>
        );
    }

    if (isAdmin) {
        return <Navigate to="/admin/dashboard" replace />;
    }

    return <>{children}</>;
};

// --- Router Definition ---

const router = createBrowserRouter(
    createRoutesFromElements(
      <Route path="/">
          {/* Public Routes */}
          <Route path="login" element={
              <RequireGuest>
                  <Login />
              </RequireGuest>
          } />
          <Route path="signup" element={
              <RequireGuest>
                  <SignUp />
              </RequireGuest>
          } />
          
          {/* Protected Routes Group */}
          <Route element={<RequireAuth />}>
              
              {/* Admin Routes */}
              <Route path="admin/dashboard" element={<AdminRoute><Dashboard /></AdminRoute>} />
              <Route path="admin/islands/:id" element={<AdminRoute><IslandDetail /></AdminRoute>} />
              <Route path="admin/islands/new" element={<AdminRoute><IslandEditor /></AdminRoute>} />
              <Route path="admin/islands/edit/:id" element={<AdminRoute><IslandEditor /></AdminRoute>} />
              <Route path="admin/topics/:id" element={<AdminRoute><TopicDetail /></AdminRoute>} />
              <Route path="admin/topics/new" element={<AdminRoute><TopicEditor /></AdminRoute>} />
              <Route path="admin/topics/edit/:id" element={<AdminRoute><TopicEditor /></AdminRoute>} />
              <Route path="admin/questions/new" element={<AdminRoute><QuestionEditor /></AdminRoute>} />
              <Route path="admin/questions/edit/:id" element={<AdminRoute><QuestionEditor /></AdminRoute>} />
              <Route path="admin/questions" element={<AdminRoute><QuestionsList /></AdminRoute>} />
              <Route path="admin/questions/import" element={<AdminRoute><BulkUpload /></AdminRoute>} />
              <Route path="admin/analytics" element={<AdminRoute><Analytics /></AdminRoute>} />
              <Route path="admin/analytics/empty-topics" element={<AdminRoute><EmptyTopicsPage /></AdminRoute>} />
              <Route path="admin/analytics/content-gaps" element={<AdminRoute><ContentGapsPage /></AdminRoute>} />
              <Route path="admin/students" element={<AdminRoute><StudentsList /></AdminRoute>} />
              <Route path="admin/students/:id" element={<AdminRoute><StudentDetail /></AdminRoute>} />
              <Route path="admin/exam-results/:sessionId" element={<AdminRoute><AdminExamResults /></AdminRoute>} />
              <Route path="admin/profile" element={<AdminRoute><AdminProfile /></AdminRoute>} />

              {/* User Routes */}
              <Route path="user/dashboard" element={<RequireNonAdmin><UserDashboard /></RequireNonAdmin>} />
              <Route path="user/islands/:id" element={<RequireNonAdmin><UserIslandConfig /></RequireNonAdmin>} />
              <Route path="user/islands/:id/take" element={<RequireNonAdmin><UserIslandQuiz /></RequireNonAdmin>} />
              <Route path="user/pearls" element={<RequireNonAdmin><UserPearls /></RequireNonAdmin>} />
              <Route path="user/analytics" element={<RequireNonAdmin><UserAnalytics /></RequireNonAdmin>} />
              <Route path="user/exam" element={<RequireNonAdmin><UserExamIntro /></RequireNonAdmin>} />
              <Route path="user/exam/session" element={<RequireNonAdmin><UserExamSession /></RequireNonAdmin>} />
              <Route path="user/exam/results/:sessionId" element={<RequireNonAdmin><ExamResults /></RequireNonAdmin>} />
              <Route path="user/profile" element={<RequireNonAdmin><UserProfile /></RequireNonAdmin>} />
              
              {/* Default / Legacy Redirects */}
              <Route path="dashboard" element={<RoleBasedRedirect />} />
              <Route path="islands/:id" element={<RoleBasedRedirect />} />
              <Route path="topics/:id" element={<RoleBasedRedirect />} />
              <Route path="questions/*" element={<RoleBasedRedirect />} />
              <Route path="analytics" element={<RoleBasedRedirect />} />
              <Route index element={<RoleBasedRedirect />} />
              <Route path="*" element={<RoleBasedRedirect />} />

          </Route>
      </Route>
    )
);

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <Toaster 
          position="top-right" 
          richColors 
          closeButton
          toastOptions={{
            duration: 4000,
            style: {
              fontFamily: 'Inter, system-ui, sans-serif',
            },
          }}
        />
        <RouterProvider router={router} />
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
