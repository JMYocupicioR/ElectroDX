import { Link } from 'react-router-dom';
import { GraduationCap, Lock, Check, ArrowRight, BookOpen } from 'lucide-react';
import { useAuth } from '../../contexts/AuthProvider';
import { useSyllabusCatalog } from '../../hooks/useSyllabusCatalog';
import { SELLABLE_COURSE_IDS, NEXT_COURSE_RECOMMENDATION, recommendedNextCourse } from '../../content/courseCatalog';
import type { CourseId } from '../../types/database';

export default function CoursesCatalogPage() {
  const { hasCourseAccess, courseIds, user } = useAuth();
  const { grouped } = useSyllabusCatalog();
  const nextSuggested = recommendedNextCourse(courseIds);

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
          Cada nivel se cobra por separado. No es obligatorio cursarlos en secuencia, aunque recomendamos
          Principiante → Intermedio → Avanzado. Tras el pago externo, un administrador activa el acceso en tu cuenta.
        </p>
      </div>

      {nextSuggested && user && (
        <div className="mb-8 p-4 rounded-2xl border border-blue-200 dark:border-blue-800 bg-blue-50/70 dark:bg-blue-950/30 text-sm text-blue-900 dark:text-blue-100">
          Siguiente curso sugerido pedagógicamente:{' '}
          <strong>{grouped.find((g) => g.course.id === nextSuggested)?.course.title ?? nextSuggested}</strong>
        </div>
      )}

      <div className="grid md:grid-cols-3 gap-6 mb-12">
        {grouped
          .filter((g) => SELLABLE_COURSE_IDS.includes(g.course.id))
          .map(({ course, modules }) => {
            const owned = hasCourseAccess(course.id);
            const recommended = NEXT_COURSE_RECOMMENDATION;
            const prevId = (Object.entries(recommended).find(([, next]) => next === course.id)?.[0] ?? null) as CourseId | null;
            return (
              <article
                key={course.id}
                className="flex flex-col p-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 shadow-sm"
              >
                <div className="flex items-center justify-between mb-3">
                  <GraduationCap className="w-8 h-8 text-blue-600" />
                  {owned ? (
                    <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-1 rounded-full">Activo</span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-700 bg-amber-50 px-2 py-1 rounded-full">
                      <Lock className="w-3 h-3" /> Sin acceso
                    </span>
                  )}
                </div>
                <h2 className="text-xl font-extrabold text-slate-900 dark:text-white mb-2">{course.title}</h2>
                <p className="text-sm text-slate-600 dark:text-slate-300 mb-4 flex-1">{course.description}</p>
                {course.price_display && (
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 mb-3">
                    Precio: {course.price_display}
                  </p>
                )}
                {prevId && (
                  <p className="text-xs text-slate-500 mb-3">
                    Recomendación: cursar antes {grouped.find((g) => g.course.id === prevId)?.course.title}.
                  </p>
                )}
                <ul className="space-y-1.5 mb-5">
                  {modules.map((mod) => (
                    <li key={mod.id} className="flex items-start gap-2 text-sm text-slate-700 dark:text-slate-300">
                      <Check className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                      <span>
                        {mod.emoji} {mod.title}
                      </span>
                    </li>
                  ))}
                </ul>
                <Link
                  to={owned ? `/temario` : user ? '/portal' : '/auth/registro'}
                  className="inline-flex items-center justify-center gap-2 min-h-[44px] rounded-xl bg-blue-600 text-white font-semibold"
                >
                  {owned ? 'Ir al temario' : 'Solicitar este curso'}
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </article>
            );
          })}
      </div>

      <div className="p-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/50">
        <h2 className="font-bold text-slate-900 dark:text-white mb-2 inline-flex items-center gap-2">
          <BookOpen className="w-4 h-4" /> Referencia compartida
        </h2>
        <p className="text-sm text-slate-600 dark:text-slate-300">
          Las tablas de referencia rápida y la bibliografía se desbloquean con cualquier curso activo.
        </p>
      </div>
    </main>
  );
}
