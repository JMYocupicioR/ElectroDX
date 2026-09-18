import { ReactNode, useEffect } from 'react';
import { Lock, Sparkles, Check, GraduationCap } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthProvider';
import { useCourseStore } from '../stores/courseStore';
import { useSyllabusCatalog } from '../hooks/useSyllabusCatalog';
import { getCourseIdForModule, getCourseById } from '../content/courseCatalog';
import type { CourseId } from '../types/database';

interface CourseGateProps {
  moduleId?: string;
  topicId?: string;
  children?: ReactNode;
}

export function CourseGate({ moduleId, topicId, children }: CourseGateProps) {
  const { user, isAdmin, isEditor, hasPremiumAccess, hasCourseAccess, isEnrolledPhysician } = useAuth();
  const { moduleAccess, load } = useCourseStore();
  const { assignments, courses } = useSyllabusCatalog();

  useEffect(() => {
    void load();
  }, [load]);

  const access = moduleId ? moduleAccess.get(moduleId) : undefined;
  const courseId = moduleId ? getCourseIdForModule(assignments, moduleId) : null;
  const course = courseId ? getCourseById(courses, courseId) : undefined;
  const isFreeModule = access?.required_tier === 'free';
  const isPreviewTopic = Boolean(topicId && access?.preview_topic_ids?.includes(topicId));

  const canAccess =
    isAdmin ||
    isEditor ||
    hasPremiumAccess ||
    isFreeModule ||
    isPreviewTopic ||
    (courseId ? hasCourseAccess(courseId as CourseId) : false);

  if (canAccess && children) {
    return <>{children}</>;
  }

  const lockedTitle = course?.title ?? 'Curso';
  const benefits = course
    ? [
        `Contenido completo de ${course.title}`,
        'Evaluaciones del temario de este nivel con retroalimentación',
        'Constancia académica al completar este curso',
        'Tablas de referencia y bibliografía incluidas con cualquier curso',
      ]
    : [
        'Acceso al temario del nivel correspondiente',
        'Evaluaciones y constancia por curso',
        'Referencia rápida incluida con cualquier curso activo',
      ];

  return (
    <div className="max-w-3xl mx-auto px-4 py-16 sm:py-20 text-center">
      <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-blue-500/20 via-indigo-500/10 to-transparent border border-blue-500/30 text-blue-600 mb-6">
        <Lock className="w-10 h-10" />
      </div>
      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-700 dark:text-blue-300 text-xs font-bold uppercase tracking-wider mb-4">
        <GraduationCap className="w-3.5 h-3.5" />
        <span>{lockedTitle}</span>
      </div>
      <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mb-4 tracking-tight">
        Este módulo forma parte de {lockedTitle}
      </h1>
      <p className="text-base text-slate-600 dark:text-slate-300 mb-8 max-w-2xl mx-auto leading-relaxed">
        {course?.description ||
          'Los tres cursos se adquieren por separado. Tras el pago externo, un administrador activa el acceso en tu cuenta.'}
      </p>

      <div className="bg-white/90 dark:bg-slate-900/90 border border-blue-200/80 dark:border-blue-900/50 rounded-3xl p-6 sm:p-10 text-left max-w-2xl mx-auto shadow-xl">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-5">Qué incluye este curso</h3>
        <ul className="space-y-3 mb-8">
          {benefits.map((benefit) => (
            <li key={benefit} className="flex items-start gap-3">
              <div className="mt-0.5 bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400 p-1 rounded-full shrink-0">
                <Check className="w-3.5 h-3.5" />
              </div>
              <span className="text-sm text-slate-700 dark:text-slate-300">{benefit}</span>
            </li>
          ))}
        </ul>

        {user ? (
          <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
            <p className="text-xs text-center text-slate-500">
              Sesión: <strong className="text-slate-800 dark:text-slate-200">{user.email}</strong>
              {isEnrolledPhysician ? ' · Inscripción médica activa' : ''}
            </p>
            <p className="text-sm text-slate-600 dark:text-slate-300 text-center">
              El cobro es externo. Cuando se confirme el pago, el equipo activa este curso en tu perfil.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                to="/cursos"
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold shadow-md text-center inline-flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                Ver cursos y cómo inscribirme
              </Link>
              <Link
                to="/temario"
                className="px-6 py-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl font-semibold text-center"
              >
                Ver temario
              </Link>
            </div>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4 border-t border-slate-100 dark:border-slate-800">
            <Link
              to="/auth/registro"
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold text-center"
            >
              Registrarme
            </Link>
            <Link
              to={`/auth/login?next=${encodeURIComponent(window.location.pathname)}`}
              className="px-6 py-3 bg-slate-100 dark:bg-slate-800 rounded-xl font-semibold text-center"
            >
              Iniciar sesión
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
