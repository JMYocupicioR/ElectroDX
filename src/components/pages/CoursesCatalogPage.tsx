import { useState } from 'react';
import { Link } from 'react-router-dom';
import { GraduationCap, Lock, Check, ArrowRight, BookOpen, Clock, AlertCircle, Sparkles } from 'lucide-react';
import { useAuth } from '../../contexts/AuthProvider';
import { useSyllabusCatalog } from '../../hooks/useSyllabusCatalog';
import { SELLABLE_COURSE_IDS, NEXT_COURSE_RECOMMENDATION, recommendedNextCourse } from '../../content/courseCatalog';
import CourseEnrollmentRequestModal from '../course/CourseEnrollmentRequestModal';
import type { Course, CourseId } from '../../types/database';

export default function CoursesCatalogPage() {
  const { hasCourseAccess, isCoursePending, courseIds, user } = useAuth();
  const { grouped, reload } = useSyllabusCatalog();
  const nextSuggested = recommendedNextCourse(courseIds);
  const [selectedCourseForModal, setSelectedCourseForModal] = useState<Course | null>(null);

  return (
    <main id="contenido-principal" className="max-w-6xl mx-auto px-4 sm:px-6 pt-24 pb-20">
      <div className="text-center max-w-3xl mx-auto mb-12">
        <p className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-cyan-400 mb-2">
          Oferta académica
        </p>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white mb-3">
          Tres cursos independientes
        </h1>
        <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
          Cada curso opera como una suscripción individual sujeta a revisión y admisión por el profesor titular.
          Al solicitar un curso ingresarás a la lista de espera oficial para ser admitido.
        </p>
      </div>

      {nextSuggested && user && (
        <div className="mb-8 p-4 rounded-2xl border border-blue-200 dark:border-blue-800 bg-blue-50/70 dark:bg-blue-950/30 text-sm text-blue-900 dark:text-blue-100 flex items-center gap-3 shadow-2xs">
          <Sparkles className="w-5 h-5 text-blue-600 dark:text-cyan-400 shrink-0" />
          <div>
            Siguiente curso sugerido pedagógicamente:{' '}
            <strong>{grouped.find((g) => g.course.id === nextSuggested)?.course.title ?? nextSuggested}</strong>
          </div>
        </div>
      )}

      <div className="grid md:grid-cols-3 gap-6 mb-12">
        {grouped
          .filter((g) => SELLABLE_COURSE_IDS.includes(g.course.id))
          .map(({ course, modules }) => {
            const owned = hasCourseAccess(course.id);
            const isPending = isCoursePending(course.id);
            const recommended = NEXT_COURSE_RECOMMENDATION;
            const prevId = (Object.entries(recommended).find(([, next]) => next === course.id)?.[0] ?? null) as CourseId | null;

            return (
              <article
                key={course.id}
                className="flex flex-col p-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 shadow-sm transition hover:shadow-md"
              >
                <div className="flex items-center justify-between mb-3">
                  <GraduationCap className="w-8 h-8 text-blue-600 dark:text-cyan-400" />
                  {owned ? (
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 px-2.5 py-1 rounded-full">
                      <Check className="w-3.5 h-3.5" /> Activo
                    </span>
                  ) : isPending ? (
                    <span className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 px-2.5 py-1 rounded-full animate-pulse">
                      <Clock className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" /> En lista de espera
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-full">
                      <Lock className="w-3 h-3 text-slate-500" /> Requiere admisión
                    </span>
                  )}
                </div>

                <h2 className="text-xl font-extrabold text-slate-900 dark:text-white mb-2">{course.title}</h2>
                <p className="text-sm text-slate-600 dark:text-slate-300 mb-4 flex-1">{course.description}</p>

                {/* Dynamic Price Display */}
                <div className="mb-4 py-2 px-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60 flex items-center justify-between">
                  <span className="text-xs text-slate-500 font-medium">Inversión del curso:</span>
                  <span className="text-base font-extrabold text-slate-900 dark:text-cyan-300">
                    {course.price_display || 'Consultar'}
                  </span>
                </div>

                {prevId && (
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
                    Recomendación: cursar antes {grouped.find((g) => g.course.id === prevId)?.course.title}.
                  </p>
                )}

                <ul className="space-y-1.5 mb-6">
                  {modules.map((mod) => (
                    <li key={mod.id} className="flex items-start gap-2 text-sm text-slate-700 dark:text-slate-300">
                      <Check className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                      <span>
                        {mod.emoji} {mod.title}
                      </span>
                    </li>
                  ))}
                </ul>

                {owned ? (
                  <Link
                    to="/portal?tab=modules"
                    className="inline-flex items-center justify-center gap-2 min-h-[44px] rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition shadow-sm"
                  >
                    <span>Ir al curso</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                ) : isPending ? (
                  <div className="space-y-2">
                    <button
                      type="button"
                      onClick={() => setSelectedCourseForModal(course)}
                      className="w-full inline-flex items-center justify-center gap-2 min-h-[44px] rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold transition shadow-sm"
                    >
                      <Clock className="w-4 h-4" />
                      <span>En lista de espera (Ver estado)</span>
                    </button>
                    <p className="text-[11px] text-center text-amber-700 dark:text-amber-300">
                      Tu solicitud está registrada. El profesor te admitirá en breve.
                    </p>
                  </div>
                ) : user ? (
                  <button
                    type="button"
                    onClick={() => setSelectedCourseForModal(course)}
                    className="inline-flex items-center justify-center gap-2 min-h-[44px] rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold transition shadow-md shadow-blue-600/20"
                  >
                    <span>Solicitar admisión / Entrar a lista de espera</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                ) : (
                  <Link
                    to={`/auth/login?redirect=${encodeURIComponent('/cursos')}`}
                    className="inline-flex items-center justify-center gap-2 min-h-[44px] rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold transition shadow-md shadow-blue-600/20"
                  >
                    <span>Iniciar sesión para solicitar</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                )}
              </article>
            );
          })}
      </div>

      <div className="p-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/50">
        <h2 className="font-bold text-slate-900 dark:text-white mb-2 inline-flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-blue-600 dark:text-cyan-400" /> Referencia compartida
        </h2>
        <p className="text-sm text-slate-600 dark:text-slate-300">
          Las tablas de referencia rápida y la bibliografía se desbloquean con cualquier curso activo.
        </p>
      </div>

      {/* Modal de Solicitud de Admisión */}
      {selectedCourseForModal && (
        <CourseEnrollmentRequestModal
          course={selectedCourseForModal}
          isOpen={Boolean(selectedCourseForModal)}
          onClose={() => setSelectedCourseForModal(null)}
          onSuccess={async () => {
            await reload();
          }}
        />
      )}
    </main>
  );
}
