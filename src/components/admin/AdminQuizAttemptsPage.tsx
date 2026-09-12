import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ClipboardList, CheckCircle, XCircle, GraduationCap } from 'lucide-react';
import { AdminLayout } from './AdminLayout';
import { getAdminQuizAttempts } from '../../services/editorialService';
import { getModuleLabel, getTopicPublicUrl } from '../../utils/adminUtils';
import type { AdminQuizAttemptRow } from '../../types/admin';

export default function AdminQuizAttemptsPage() {
  const [attempts, setAttempts] = useState<AdminQuizAttemptRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getAdminQuizAttempts(200)
      .then(setAttempts)
      .catch((e) => setError(e instanceof Error ? e.message : 'Error al cargar'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <AdminLayout title="Intentos de evaluación">
      <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/50">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">Auditoría de Evaluaciones COMEFYR</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Registro de calificaciones y duración de exámenes respondidos por los alumnos.
          </p>
        </div>
        <Link
          to="/admin/quizzes"
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition shrink-0"
        >
          <GraduationCap className="w-4 h-4" />
          <span>Editor de Quizzes</span>
        </Link>
      </div>
      {loading && <p className="text-sm text-slate-500">Cargando intentos…</p>}
      {error && <p className="text-sm text-red-600">{error}</p>}

      {!loading && !error && attempts.length === 0 && (
        <p className="text-sm text-slate-500">Aún no hay intentos registrados.</p>
      )}

      {!loading && attempts.length > 0 && (
        <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-700">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-left text-xs uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3">Usuario</th>
                <th className="px-4 py-3">Módulo / Tema</th>
                <th className="px-4 py-3">Puntaje</th>
                <th className="px-4 py-3">Fecha</th>
                <th className="px-4 py-3">Tema</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {attempts.map((row) => {
                const topicUrl = getTopicPublicUrl(row.module_id, row.topic_id);
                return (
                  <tr key={row.id} className="bg-white/70 dark:bg-slate-900/40">
                    <td className="px-4 py-3">
                      <p className="font-medium text-slate-800 dark:text-slate-100">{row.display_name}</p>
                      <p className="text-xs text-slate-400">{row.user_email}</p>
                    </td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                      {getModuleLabel(row.module_id)}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center gap-1 font-bold ${
                          row.passed ? 'text-emerald-600' : 'text-amber-600'
                        }`}
                      >
                        {row.passed ? (
                          <CheckCircle className="w-4 h-4" />
                        ) : (
                          <XCircle className="w-4 h-4" />
                        )}
                        {row.score}%
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-500 whitespace-nowrap">
                      {new Date(row.completed_at).toLocaleString('es-MX')}
                      {row.duration_seconds != null && ` · ${row.duration_seconds}s`}
                    </td>
                    <td className="px-4 py-3">
                      {topicUrl ? (
                        <Link
                          to={topicUrl}
                          className="inline-flex items-center gap-1 text-indigo-600 hover:underline"
                        >
                          <ClipboardList className="w-3.5 h-3.5" /> Ver tema
                        </Link>
                      ) : (
                        <span className="text-slate-400">{row.topic_id}</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </AdminLayout>
  );
}
