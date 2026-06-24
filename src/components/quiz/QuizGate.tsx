import { Link, useLocation } from 'react-router-dom';
import { Lock, LogIn, Clock, XCircle, ClipboardList } from 'lucide-react';
import { useAuth } from '../../contexts/AuthProvider';
import { isEnrollmentProfileComplete } from '../../utils/adminUtils';
import type { QuizTopicFlag } from '../../types/quiz';
import { QuizPlayer } from './QuizPlayer';

export function QuizGate({
  topicId,
  moduleId,
  quizFlag,
}: {
  topicId: string;
  moduleId: string;
  quizFlag: QuizTopicFlag | null;
}) {
  const location = useLocation();
  const {
    user,
    profile,
    isEnrolledPhysician,
    enrollmentStatus,
    isLoading,
  } = useAuth();

  if (!quizFlag || quizFlag.question_count === 0) return null;

  const loginUrl = `/auth/login?next=${encodeURIComponent(location.pathname)}`;

  if (isLoading) {
    return (
      <section className="mt-10 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white/70 dark:bg-slate-900/40">
        <p className="text-sm text-slate-500">Cargando evaluación…</p>
      </section>
    );
  }

  if (!user) {
    return (
      <LockedCard
        icon={<Lock className="w-6 h-6 text-indigo-500" />}
        title="Evaluación del tema"
        description={`Este tema incluye ${quizFlag.question_count} pregunta(s). Acceso reservado para médicos inscritos y verificados.`}
        action={
          <Link
            to={loginUrl}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-medium"
          >
            <LogIn className="w-4 h-4" /> Iniciar sesión como médico
          </Link>
        }
      />
    );
  }

  if (!profile || !isEnrollmentProfileComplete(profile)) {
    return (
      <LockedCard
        icon={<ClipboardList className="w-6 h-6 text-amber-500" />}
        title="Completa tu perfil profesional"
        description="Para acceder a las evaluaciones necesitas registrar tu cédula profesional y datos clínicos."
        action={
          <Link
            to="/colaborador/perfil"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-600 text-white text-sm font-medium"
          >
            Completar perfil
          </Link>
        }
      />
    );
  }

  if (enrollmentStatus === 'pending') {
    return (
      <LockedCard
        icon={<Clock className="w-6 h-6 text-amber-500" />}
        title="Solicitud en revisión"
        description="Tu inscripción médica está pendiente de aprobación por un administrador. Podrás acceder a la evaluación cuando sea aprobada."
      />
    );
  }

  if (enrollmentStatus === 'rejected') {
    return (
      <LockedCard
        icon={<XCircle className="w-6 h-6 text-red-500" />}
        title="Inscripción no aprobada"
        description="Tu solicitud de inscripción fue rechazada. Actualiza tu perfil o contacta al administrador."
        action={
          <Link
            to="/colaborador/perfil"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-300 text-sm font-medium"
          >
            Revisar perfil
          </Link>
        }
      />
    );
  }

  if (!isEnrolledPhysician) {
    return (
      <LockedCard
        icon={<Lock className="w-6 h-6 text-indigo-500" />}
        title="Acceso restringido"
        description="Las evaluaciones están disponibles solo para médicos inscritos verificados."
      />
    );
  }

  return (
    <QuizPlayer
      topicId={topicId}
      moduleId={moduleId}
      quizFlag={quizFlag}
    />
  );
}

function LockedCard({
  icon,
  title,
  description,
  action,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <section className="mt-10 p-6 sm:p-8 rounded-2xl border border-indigo-200/60 dark:border-indigo-800/40 bg-gradient-to-br from-indigo-50/80 to-white dark:from-indigo-950/30 dark:to-slate-900/40">
      <div className="flex items-start gap-4">
        <div className="p-3 rounded-xl bg-white dark:bg-slate-800 shadow-sm">{icon}</div>
        <div className="flex-1 min-w-0">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-1">{title}</h2>
          <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">{description}</p>
          {action}
        </div>
      </div>
    </section>
  );
}
