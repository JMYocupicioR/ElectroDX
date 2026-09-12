import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthProvider';
import { LoadingSpinner } from '../LoadingSpinner';
import { isEnrollmentProfileComplete } from '../../utils/adminUtils';

type GuardMode = 'auth' | 'verified' | 'admin' | 'editor' | 'enrolled';

export function ProtectedRoute({
  children,
  mode = 'auth',
}: {
  children: React.ReactNode;
  mode?: GuardMode;
}) {
  const { user, profile, isLoading, isVerifiedContributor, isAdmin, isEditor, isEnrolledPhysician } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center pt-20">
        <LoadingSpinner />
      </div>
    );
  }

  if (!user) {
    const next = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`/auth/login?next=${next}`} replace />;
  }

  if (mode === 'verified' && !isVerifiedContributor) {
    return <Navigate to="/colaborador/perfil" replace />;
  }

  if (mode === 'enrolled' && !isEnrolledPhysician) {
    if (!profile || !isEnrollmentProfileComplete(profile)) {
      return <Navigate to="/colaborador/perfil" replace />;
    }
    return <Navigate to="/colaborador/perfil" replace />;
  }

  if (mode === 'editor' && !isAdmin && !isEditor) {
    return <Navigate to="/dashboard" replace />;
  }

  if (mode === 'admin' && !isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}
