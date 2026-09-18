import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ClipboardList, Search, Trash2, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { AdminLayout } from './AdminLayout';
import {
  AdminAnalyticsScopeBar,
  AnalyticsField,
  AnalyticsFilterGrid,
  AnalyticsKpi,
  analyticsControlClass,
} from './analytics/AdminAnalyticsChrome';
import { loadGradeableStudents, getCohortExamAttempts } from '../../services/academicAnalyticsService';
import { deleteQuizAttempt } from '../../services/quizService';
import { filterExamAttempts, summarizeExamsByTopic, average } from '../../utils/academicAnalytics';
import { getTopicPublicUrl } from '../../utils/adminUtils';
import { useAuth } from '../../contexts/AuthProvider';
import { allModules } from '../../content/modules';
import type { AdminProfileRow } from '../../types/admin';
import type { ExamAttemptAnalyticsRow, ExamAnalyticsFilters } from '../../types/academicAnalytics';

const EMPTY_FILTERS: Omit<ExamAnalyticsFilters, 'studentId'> = {
  moduleId: '',
  topicId: '',
  result: 'all',
  minScore: '',
  search: '',
  from: '',
  to: '',
};

export default function AdminExamAnalyticsPage() {
  const { user } = useAuth();
  const [params, setParams] = useSearchParams();
  const studentId = params.get('alumno') || '';

  const [profiles, setProfiles] = useState<AdminProfileRow[]>([]);
  const [attempts, setAttempts] = useState<ExamAttemptAnalyticsRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState(EMPTY_FILTERS);

  // Estado para confirmación de eliminación de intentos
  const [attemptToDelete, setAttemptToDelete] = useState<ExamAttemptAnalyticsRow | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const students = await loadGradeableStudents(user?.id);
      setProfiles(students);
      setAttempts(await getCohortExamAttempts(students));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [user?.id]);

  const scopedStudent = profiles.find((p) => p.id === studentId) || null;
  const filtered = useMemo(
    () => filterExamAttempts(attempts, { ...filters, studentId }),
    [attempts, filters, studentId]
  );

  const topicSummary = useMemo(() => summarizeExamsByTopic(filtered), [filtered]);

  const scores = filtered.map((a) => a.score);
  const passCount = filtered.filter((a) => a.passed).length;
  const passRate = filtered.length ? Math.round((passCount / filtered.length) * 100) : 0;
  const avgScore = average(scores);

  const topicsForModule = useMemo(() => {
    if (!filters.moduleId) {
      return allModules.flatMap((m) => m.topics.map((t) => [t.id, t.title] as const));
    }
    const target = allModules.find((m) => m.id === filters.moduleId);
    return (target?.topics ?? []).map((t) => [t.id, t.title] as const);
  }, [filters.moduleId]);

  const setStudentId = (id: string) => {
    const next = new URLSearchParams(params);
    if (id) next.set('alumno', id);
    else next.delete('alumno');
    setParams(next, { replace: true });
  };

  const handleConfirmDeleteAttempt = async () => {
    if (!attemptToDelete) return;
    setIsDeleting(true);
    try {
      await deleteQuizAttempt(attemptToDelete.id, attemptToDelete.userId);
      setAttemptToDelete(null);
      setToastMessage('Intento de examen eliminado del historial.');
      await load();
      setTimeout(() => setToastMessage(null), 4000);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error al eliminar el intento de examen.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AdminLayout
      title="Exámenes de la cohorte"
      subtitle="Intentos de quizzes temáticos y evaluaciones. Filtra por alumno, módulo, tema, puntaje y fecha"
    >
      <div className="space-y-5 pb-16">
        <AdminAnalyticsScopeBar
          student={scopedStudent}
          cohortHref="/admin/alumnos/examenes"
          studentLabel="Exámenes del alumno"
        />

        {toastMessage && (
          <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs font-bold flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{toastMessage}</span>
          </div>
        )}

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <AnalyticsKpi label="Intentos" value={filtered.length} hint="Total en la selección actual" />
          <AnalyticsKpi label="Promedio" value={filtered.length ? `${avgScore}%` : '—'} hint="Calificación media" />
          <AnalyticsKpi label="Aprobación" value={`${passRate}%`} hint={`${passCount} de ${filtered.length} aprobados`} />
          <AnalyticsKpi label="Temas evaluados" value={topicSummary.length} hint="Con al menos 1 intento" />
        </div>

        <AnalyticsFilterGrid>
          <AnalyticsField label="Buscar">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                value={filters.search}
                onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
                placeholder="Alumno, correo o tema..."
                className={analyticsControlClass('pl-9')}
              />
            </div>
          </AnalyticsField>
          <AnalyticsField label="Alumno">
            <select
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
              className={analyticsControlClass()}
            >
              <option value="">Todos los alumnos</option>
              {profiles.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.display_name}
                </option>
              ))}
            </select>
          </AnalyticsField>
          <AnalyticsField label="Módulo">
            <select
              value={filters.moduleId}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, moduleId: e.target.value, topicId: '' }))
              }
              className={analyticsControlClass()}
            >
              <option value="">Todos los módulos</option>
              {allModules.map((mod) => (
                <option key={mod.id} value={mod.id}>
                  {mod.number}. {mod.title}
                </option>
              ))}
            </select>
          </AnalyticsField>
          <AnalyticsField label="Tema">
            <select
              value={filters.topicId}
              onChange={(e) => setFilters((prev) => ({ ...prev, topicId: e.target.value }))}
              className={analyticsControlClass()}
            >
              <option value="">Todos los temas</option>
              {topicsForModule.map(([id, title]) => (
                <option key={id} value={id}>
                  {title}
                </option>
              ))}
            </select>
          </AnalyticsField>
          <AnalyticsField label="Resultado">
            <select
              value={filters.result}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, result: e.target.value as ExamAnalyticsFilters['result'] }))
              }
              className={analyticsControlClass()}
            >
              <option value="all">Aprobados y reprobados</option>
              <option value="passed">Solo aprobados</option>
              <option value="failed">Solo reprobados</option>
            </select>
          </AnalyticsField>
          <AnalyticsField label="Calificación mínima">
            <input
              type="number"
              min={0}
              max={100}
              value={filters.minScore}
              onChange={(e) => setFilters((prev) => ({ ...prev, minScore: e.target.value }))}
              placeholder="0-100"
              className={analyticsControlClass()}
            />
          </AnalyticsField>
          <AnalyticsField label="Desde">
            <input
              type="date"
              value={filters.from}
              onChange={(e) => setFilters((prev) => ({ ...prev, from: e.target.value }))}
              className={analyticsControlClass()}
            />
          </AnalyticsField>
          <AnalyticsField label="Hasta">
            <input
              type="date"
              value={filters.to}
              onChange={(e) => setFilters((prev) => ({ ...prev, to: e.target.value }))}
              className={analyticsControlClass()}
            />
          </AnalyticsField>
        </AnalyticsFilterGrid>

        {loading ? (
          <p className="text-sm text-slate-500 py-10 text-center">Cargando exámenes de la cohorte...</p>
        ) : (
          <>
            <section className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white/80 dark:bg-slate-900/70 overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800">
                <h2 className="text-sm font-black text-slate-900 dark:text-white">
                  Resumen general por tema
                </h2>
                <p className="text-xs text-slate-500">
                  Promedio, tasa de aprobación e intentos de cada evaluación aplicada
                </p>
              </div>
              {topicSummary.length === 0 ? (
                <p className="px-5 py-10 text-sm text-slate-400 text-center">
                  No hay exámenes con los filtros seleccionados.
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <caption className="sr-only">Resumen de exámenes por tema</caption>
                    <thead className="bg-slate-50 dark:bg-slate-800/60 text-left text-[10px] uppercase tracking-wider text-slate-500">
                      <tr>
                        <th className="px-4 py-3">Tema</th>
                        <th className="px-4 py-3">Módulo</th>
                        <th className="px-4 py-3">Intentos</th>
                        <th className="px-4 py-3">Alumnos</th>
                        <th className="px-4 py-3">Promedio</th>
                        <th className="px-4 py-3">Aprobación</th>
                        <th className="px-4 py-3">Rango</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {topicSummary.map((topic) => (
                        <tr key={`${topic.moduleId}-${topic.topicId}`} className="bg-white/70 dark:bg-slate-900/40">
                          <td className="px-4 py-3 font-semibold text-slate-800 dark:text-slate-100">
                            {topic.topicTitle}
                          </td>
                          <td className="px-4 py-3 text-xs text-slate-500">{topic.moduleLabel}</td>
                          <td className="px-4 py-3">{topic.attempts}</td>
                          <td className="px-4 py-3">{topic.uniqueStudents}</td>
                          <td className="px-4 py-3 font-bold">{topic.avgScore}%</td>
                          <td className="px-4 py-3">{topic.passRate}%</td>
                          <td className="px-4 py-3 text-xs text-slate-400">
                            {topic.worstScore}% – {topic.bestScore}%
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>

            <section className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white/80 dark:bg-slate-900/70 overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800">
                <h2 className="text-sm font-black text-slate-900 dark:text-white">
                  Intentos realizados
                </h2>
                <p className="text-xs text-slate-500">Detalle de cada examen aplicado y su calificación</p>
              </div>
              {filtered.length === 0 ? (
                <p className="px-5 py-10 text-sm text-slate-400 text-center">
                  El alumno o la cohorte aún no tienen intentos con estos filtros.
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <caption className="sr-only">Listado de intentos de examen</caption>
                    <thead className="bg-slate-50 dark:bg-slate-800/60 text-left text-[10px] uppercase tracking-wider text-slate-500">
                      <tr>
                        <th className="px-4 py-3">Alumno</th>
                        <th className="px-4 py-3">Tema</th>
                        <th className="px-4 py-3">Calificación</th>
                        <th className="px-4 py-3">Fecha</th>
                        <th className="px-4 py-3">Tema del temario</th>
                        <th className="px-4 py-3 text-right">Acción</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {filtered.map((row) => {
                        const topicUrl = getTopicPublicUrl(row.moduleId, row.topicId);
                        return (
                          <tr key={row.id} className="bg-white/70 dark:bg-slate-900/40 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition">
                            <td className="px-4 py-3">
                              <p className="font-semibold text-slate-800 dark:text-slate-100">{row.studentName}</p>
                              <p className="text-xs text-slate-400">{row.studentEmail}</p>
                            </td>
                            <td className="px-4 py-3">
                              <p className="font-medium">{row.topicTitle}</p>
                              <p className="text-xs text-slate-400">{row.moduleLabel}</p>
                            </td>
                            <td className="px-4 py-3">
                              <span
                                className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-black ${
                                  row.passed
                                    ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                                    : 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300'
                                }`}
                              >
                                {row.score}%
                              </span>
                            </td>
                            <td className="px-4 py-3 text-xs text-slate-500 whitespace-nowrap">
                              {new Date(row.completedAt).toLocaleString('es-MX')}
                              {row.durationSeconds != null ? ` · ${row.durationSeconds}s` : ''}
                            </td>
                            <td className="px-4 py-3">
                              {topicUrl ? (
                                <Link
                                  to={topicUrl}
                                  className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 hover:underline"
                                >
                                  <ClipboardList className="w-3.5 h-3.5" />
                                  Abrir tema
                                </Link>
                              ) : (
                                <span className="text-xs text-slate-400">{row.topicId}</span>
                              )}
                            </td>
                            <td className="px-4 py-3 text-right">
                              <button
                                type="button"
                                onClick={() => setAttemptToDelete(row)}
                                className="inline-flex items-center gap-1 p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition cursor-pointer"
                                title="Eliminar este intento del historial"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                <span className="text-xs font-bold">Eliminar</span>
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          </>
        )}
      </div>

      {/* Modal de Confirmación para Eliminar Intento de Examen */}
      {attemptToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs animate-in fade-in">
          <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 flex items-center justify-center text-rose-600 dark:text-rose-400 shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900 dark:text-white">
                  ¿Eliminar intento de examen?
                </h3>
                <p className="text-xs text-slate-500">Confirmación docente requerida</p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700 text-xs space-y-1.5">
              <p className="font-bold text-slate-900 dark:text-white">
                {attemptToDelete.topicTitle}
              </p>
              <p className="text-slate-600 dark:text-slate-300">
                <span className="font-semibold">Alumno:</span> {attemptToDelete.studentName} ({attemptToDelete.studentEmail})
              </p>
              <p className="text-slate-600 dark:text-slate-300">
                <span className="font-semibold">Calificación obtenida:</span>{' '}
                <span className={`font-black ${attemptToDelete.passed ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {attemptToDelete.score}% ({attemptToDelete.passed ? 'Aprobado' : 'Reprobado'})
                </span>
              </p>
              <p className="text-slate-500 text-[11px]">
                Fecha de realización: {new Date(attemptToDelete.completedAt).toLocaleString('es-MX')}
              </p>
            </div>

            <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-amber-800 dark:text-amber-200 text-xs">
              <p className="font-bold mb-1">⚠️ Efecto en el Kardex:</p>
              <p>
                Al eliminar este intento del historial, se recalculará automáticamente la calificación más alta y el promedio general del estudiante en el Kardex. Usa esta opción si el alumno repitió el examen y deseas retirar los intentos fallidos.
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setAttemptToDelete(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white transition"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleConfirmDeleteAttempt}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-sm transition cursor-pointer disabled:opacity-50"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{isDeleting ? 'Eliminando...' : 'Sí, eliminar intento'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
