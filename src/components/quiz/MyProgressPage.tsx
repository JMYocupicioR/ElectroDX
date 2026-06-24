import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BarChart3, CheckCircle, XCircle, ExternalLink } from 'lucide-react';
import { useAuth } from '../../contexts/AuthProvider';
import { getMyAttempts, getMyProgressByModule } from '../../services/quizService';
import { getModuleLabel, getTopicPublicUrl } from '../../utils/adminUtils';
import type { ModuleQuizProgress, QuizAttempt } from '../../types/quiz';

export default function MyProgressPage() {
  const { user } = useAuth();
  const [attempts, setAttempts] = useState<QuizAttempt[]>([]);
  const [moduleProgress, setModuleProgress] = useState<ModuleQuizProgress[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    Promise.all([getMyAttempts(user.id), getMyProgressByModule(user.id)])
      .then(([a, m]) => {
        setAttempts(a);
        setModuleProgress(m.filter((p) => p.quizzesAvailable > 0));
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user]);

  if (loading) {
    return (
      <div className="pt-24 px-4 max-w-4xl mx-auto text-slate-500 text-sm">Cargando progreso…</div>
    );
  }

  return (
    <div className="pt-24 pb-16 px-4 max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <BarChart3 className="w-8 h-8 text-indigo-500" />
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Mi progreso</h1>
          <p className="text-sm text-slate-500">Historial de evaluaciones y avance por módulo.</p>
        </div>
      </div>

      <section className="mb-10">
        <h2 className="text-lg font-semibold mb-4">Progreso por módulo</h2>
        {moduleProgress.length === 0 ? (
          <p className="text-sm text-slate-500">Aún no hay cuestionarios publicados o intentos registrados.</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {moduleProgress.map((mod) => {
              const passedCount = mod.bestScores.filter((s) => s.passed).length;
              const completionPct =
                mod.quizzesAvailable > 0
                  ? Math.round((passedCount / mod.quizzesAvailable) * 100)
                  : 0;

              return (
              <div
                key={mod.moduleId}
                className="p-5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white/70 dark:bg-slate-900/40"
              >
                <p className="font-medium text-slate-900 dark:text-white mb-1">{mod.moduleTitle}</p>
                <p className="text-sm text-slate-500 mb-3">
                  {mod.quizzesAttempted}/{mod.quizzesAvailable} evaluaciones completadas ·{' '}
                  {passedCount} aprobadas
                </p>
                <div className="h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden mb-3">
                  <div
                    className="h-full rounded-full bg-emerald-500 transition-all"
                    style={{ width: `${completionPct}%` }}
                  />
                </div>
                <p className="text-xs text-slate-400 mb-2">{completionPct}% del módulo aprobado</p>
                {mod.averageScore != null && (
                  <p className="text-2xl font-bold text-indigo-600">{mod.averageScore}%</p>
                )}
                <ul className="mt-3 space-y-1">
                  {mod.bestScores.slice(0, 3).map((s) => (
                    <li key={s.topicId} className="text-xs text-slate-500 flex items-center gap-1">
                      {s.passed ? (
                        <CheckCircle className="w-3 h-3 text-emerald-500" />
                      ) : (
                        <XCircle className="w-3 h-3 text-amber-500" />
                      )}
                      {s.topicTitle}: {s.score}%
                    </li>
                  ))}
                </ul>
              </div>
            );
            })}
          </div>
        )}
      </section>

      <section>
        <h2 className="text-lg font-semibold mb-4">Historial de intentos</h2>
        {attempts.length === 0 ? (
          <p className="text-sm text-slate-500">No has completado evaluaciones aún.</p>
        ) : (
          <ul className="space-y-3">
            {attempts.map((attempt) => {
              const topicUrl = getTopicPublicUrl(attempt.module_id, attempt.topic_id);
              return (
                <li
                  key={attempt.id}
                  className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-xl border border-slate-200 dark:border-slate-700"
                >
                  <div>
                    <p className="font-medium text-slate-800 dark:text-slate-100">
                      {getModuleLabel(attempt.module_id)}
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {new Date(attempt.completed_at).toLocaleString('es-MX')}
                      {attempt.duration_seconds != null && ` · ${attempt.duration_seconds}s`}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span
                      className={`text-lg font-bold ${
                        attempt.passed ? 'text-emerald-600' : 'text-amber-600'
                      }`}
                    >
                      {attempt.score}%
                    </span>
                    {topicUrl && (
                      <Link
                        to={topicUrl}
                        className="inline-flex items-center gap-1 text-sm text-indigo-600 hover:underline"
                      >
                        <ExternalLink className="w-3.5 h-3.5" /> Tema
                      </Link>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
