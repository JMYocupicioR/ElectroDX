import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ClipboardList, Search } from 'lucide-react';
import { AdminLayout } from './AdminLayout';
import {
  AdminAnalyticsScopeBar,
  AnalyticsField,
  AnalyticsFilterGrid,
  AnalyticsKpi,
  analyticsControlClass,
} from './analytics/AdminAnalyticsChrome';
import { loadGradeableStudents, getCohortExamAttempts } from '../../services/academicAnalyticsService';
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
  const [rows, setRows] = useState<ExamAttemptAnalyticsRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState(EMPTY_FILTERS);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    loadGradeableStudents(user?.id)
      .then(async (students) => {
        if (cancelled) return;
        setProfiles(students);
        const attempts = await getCohortExamAttempts(students);
        if (!cancelled) setRows(attempts);
      })
      .catch(console.error)
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  const scopedStudent = profiles.find((p) => p.id === studentId) || null;

  const appliedFilters: ExamAnalyticsFilters = {
    ...filters,
    studentId,
  };

  const filtered = useMemo(
    () => filterExamAttempts(rows, appliedFilters),
    [rows, studentId, filters]
  );
  const topicSummary = useMemo(() => summarizeExamsByTopic(filtered), [filtered]);

  const topicsForModule = useMemo(() => {
    const source = filters.moduleId
      ? rows.filter((row) => row.moduleId === filters.moduleId)
      : rows;
    const unique = new Map<string, string>();
    source.forEach((row) => unique.set(row.topicId, row.topicTitle));
    return [...unique.entries()].sort((a, b) => a[1].localeCompare(b[1], 'es'));
  }, [rows, filters.moduleId]);

  const avgScore = average(filtered.map((row) => row.score));
  const passRate =
    filtered.length === 0 ? 0 : Math.round((filtered.filter((row) => row.passed).length / filtered.length) * 100);

  const setStudentId = (id: string) => {
    const next = new URLSearchParams(params);
    if (id) next.set('alumno', id);
    else next.delete('alumno');
    setParams(next, { replace: true });
  };

  return (
    <AdminLayout
      title="Análisis de exámenes"
      subtitle="Calificaciones por tema, intentos realizados y filtros de cohorte para auditoría académica"
    >
      <div className="space-y-5 pb-16">
        <AdminAnalyticsScopeBar
          student={scopedStudent}
          cohortHref="/admin/alumnos/examenes"
          studentLabel="Exámenes del alumno"
        />

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <AnalyticsKpi label="Intentos" value={filtered.length} hint={`${topicSummary.length} temas evaluados`} />
          <AnalyticsKpi label="Promedio" value={`${avgScore}%`} hint="Sobre los intentos filtrados" />
          <AnalyticsKpi label="Aprobación" value={`${passRate}%`} hint="Porcentaje de intentos aprobados" />
          <AnalyticsKpi
            label="Alumnos"
            value={new Set(filtered.map((row) => row.userId)).size}
            hint={scopedStudent ? scopedStudent.display_name : 'En la selección actual'}
          />
        </div>

        <AnalyticsFilterGrid>
          <AnalyticsField label="Buscar">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                value={filters.search}
                onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
                placeholder="Nombre, correo o tema..."
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
              onChange={(e) => setFilters((prev) => ({ ...prev, moduleId: e.target.value, topicId: '' }))}
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
                          <td className="px-4 py-3 font-black text-indigo-600 dark:text-indigo-400">
                            {topic.avgScore}%
                          </td>
                          <td className="px-4 py-3">{topic.passRate}%</td>
                          <td className="px-4 py-3 text-xs text-slate-500">
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
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {filtered.map((row) => {
                        const topicUrl = getTopicPublicUrl(row.moduleId, row.topicId);
                        return (
                          <tr key={row.id} className="bg-white/70 dark:bg-slate-900/40">
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
    </AdminLayout>
  );
}
