import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthProvider';
import { LoadingSpinner } from '../LoadingSpinner';
import { PremiumGate } from '../PremiumGate';

type GuardMode = 'auth' | 'verified' | 'admin' | 'editor' | 'enrolled' | 'contributor';

export function ProtectedRoute({
  children,
  mode = 'auth',
}: {
  children: React.ReactNode;
  mode?: GuardMode;
}) {
  const {
    user,
    isLoading,
    isVerifiedContributor,
    isAdmin,
    isEditor,
    roles,
    isEnrolledPhysician,
    hasPremiumAccess,
  } = useAuth();
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

  // Rutas exclusivas del equipo editorial / colaboradores
  if (mode === 'contributor' && !isAdmin && !isEditor && !roles.includes('contributor')) {
    return <Navigate to="/dashboard" replace />;
  }

  if (mode === 'verified') {
    if (!isAdmin && !isEditor && !roles.includes('contributor')) {
      return <Navigate to="/dashboard" replace />;
    }
    if (!isVerifiedContributor) {
      return <Navigate to="/perfil" replace />;
    }
  }

  const canAccessEnrolled = isEnrolledPhysician || hasPremiumAccess;
  if (mode === 'enrolled' && !canAccessEnrolled) {
    return <PremiumGate />;
  }

  if (mode === 'editor' && !isAdmin && !isEditor) {
    return <Navigate to="/dashboard" replace />;
  }

  if (mode === 'admin' && !isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}

