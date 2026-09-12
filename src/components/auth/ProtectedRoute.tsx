import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthProvider';
import { LoadingSpinner } from '../LoadingSpinner';
import { PremiumGate } from '../PremiumGate';
import { PendingApprovalGate } from './PendingApprovalGate';

type GuardMode = 'auth' | 'verified' | 'admin' | 'editor' | 'enrolled' | 'contributor' | 'student';

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
    isPendingApproval,
    isRejected,
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

  // Si es un médico en espera de admisión o rechazado intentando entrar al curso o portal
  if (!isAdmin && !isEditor && (isPendingApproval || isRejected)) {
    if (mode === 'enrolled' || mode === 'student' || location.pathname.startsWith('/dashboard') || location.pathname.startsWith('/modulo') || location.pathname.startsWith('/ejercicios') || location.pathname.startsWith('/examenes')) {
      return <PendingApprovalGate />;
    }
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
  if ((mode === 'enrolled' || mode === 'student') && !canAccessEnrolled) {
    if (isPendingApproval || isRejected) {
      return <PendingApprovalGate />;
    }
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

