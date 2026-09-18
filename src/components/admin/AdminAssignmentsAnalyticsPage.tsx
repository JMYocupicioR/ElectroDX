import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Search } from 'lucide-react';
import { AdminLayout } from './AdminLayout';
import {
  AdminAnalyticsScopeBar,
  AnalyticsField,
  AnalyticsFilterGrid,
  AnalyticsKpi,
  analyticsControlClass,
} from './analytics/AdminAnalyticsChrome';
import TeacherQuickGradeModal from './TeacherQuickGradeModal';
import {
  loadGradeableStudents,
  getCohortAssignmentAnalytics,
} from '../../services/academicAnalyticsService';
import { filterAssignments, average } from '../../utils/academicAnalytics';
import { useAuth } from '../../contexts/AuthProvider';
import type { AdminProfileRow } from '../../types/admin';
import type { AssignmentAnalyticsFilters, AssignmentAnalyticsRow } from '../../types/academicAnalytics';
import type { AssignmentStatus, AssignmentType, TeacherPendingReviewItem } from '../../types/studentPlan';

const TYPE_LABELS: Record<AssignmentType, string> = {
  exam: 'Examen asignado',
  clinical_case: 'Caso clínico',
  reading: 'Lectura',
  emg_report: 'Reporte EMG',
  practical_task: 'Tarea práctica',
};

const STATUS_LABELS: Record<AssignmentStatus, string> = {
  pending: 'Pendiente',
  submitted: 'Enviada',
  approved: 'Aprobada',
  needs_revision: 'Requiere revisión',
  overdue: 'Vencida',
};

const EMPTY_FILTERS: Omit<AssignmentAnalyticsFilters, 'studentId'> = {
  type: 'all',
  status: 'all',
  search: '',
  from: '',
  to: '',
};

export default function AdminAssignmentsAnalyticsPage() {
  const { user } = useAuth();
  const [params, setParams] = useSearchParams();
  const studentId = params.get('alumno') || '';

  const [profiles, setProfiles] = useState<AdminProfileRow[]>([]);
  const [rows, setRows] = useState<AssignmentAnalyticsRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [gradingItem, setGradingItem] = useState<TeacherPendingReviewItem | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const students = await loadGradeableStudents(user?.id);
      setProfiles(students);
      setRows(await getCohortAssignmentAnalytics(students));
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
    () => filterAssignments(rows, { ...filters, studentId }),
    [rows, filters, studentId]
  );

  const submitted = filtered.filter((row) => row.status === 'submitted' || row.status === 'approved' || row.submitted_at);
  const graded = filtered.filter((row) => typeof row.grade === 'number');
  const avgGrade = average(graded.map((row) => row.grade || 0));

  const setStudentId = (id: string) => {
    const next = new URLSearchParams(params);
    if (id) next.set('alumno', id);
    else next.delete('alumno');
    setParams(next, { replace: true });
  };

  return (
    <AdminLayout
      title="Tareas enviadas"
      subtitle="Entregas de casos, reportes y tareas prácticas. Filtra por alumno, tipo, estatus y fecha"
    >
      <div className="space-y-5 pb-16">
        <AdminAnalyticsScopeBar
          student={scopedStudent}
          cohortHref="/admin/alumnos/tareas"
          studentLabel="Tareas del alumno"
        />

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <AnalyticsKpi label="Asignadas" value={filtered.length} hint="En la selección actual" />
          <AnalyticsKpi label="Enviadas" value={submitted.length} hint="Con entrega del alumno" />
          <AnalyticsKpi
            label="Pendientes"
            value={filtered.filter((row) => row.status === 'pending').length}
            hint="Sin entregar"
          />
          <AnalyticsKpi label="Promedio" value={graded.length ? avgGrade : '—'} hint="Solo tareas calificadas" />
        </div>

        <AnalyticsFilterGrid>
          <AnalyticsField label="Buscar">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                value={filters.search}
                onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
                placeholder="Alumno, título o tipo..."
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
          <AnalyticsField label="Tipo">
            <select
              value={filters.type}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, type: e.target.value as AssignmentAnalyticsFilters['type'] }))
              }
              className={analyticsControlClass()}
            >
              <option value="all">Todos los tipos</option>
              {(Object.keys(TYPE_LABELS) as AssignmentType[]).map((type) => (
                <option key={type} value={type}>
                  {TYPE_LABELS[type]}
                </option>
              ))}
            </select>
          </AnalyticsField>
          <AnalyticsField label="Estatus">
            <select
              value={filters.status}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, status: e.target.value as AssignmentAnalyticsFilters['status'] }))
              }
              className={analyticsControlClass()}
            >
              <option value="all">Todos los estatus</option>
              {(Object.keys(STATUS_LABELS) as AssignmentStatus[]).map((status) => (
                <option key={status} value={status}>
                  {STATUS_LABELS[status]}
                </option>
              ))}
            </select>
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

        <section className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white/80 dark:bg-slate-900/70 overflow-hidden">
          {loading ? (
            <p className="px-5 py-10 text-sm text-slate-500 text-center">Cargando tareas de la cohorte...</p>
          ) : filtered.length === 0 ? (
            <p className="px-5 py-10 text-sm text-slate-400 text-center">
              No hay tareas con los filtros seleccionados.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <caption className="sr-only">Tareas enviadas por los alumnos</caption>
                <thead className="bg-slate-50 dark:bg-slate-800/60 text-left text-[10px] uppercase tracking-wider text-slate-500">
                  <tr>
                    <th className="px-4 py-3">Alumno</th>
                    <th className="px-4 py-3">Tarea</th>
                    <th className="px-4 py-3">Tipo</th>
                    <th className="px-4 py-3">Estatus</th>
                    <th className="px-4 py-3">Entrega</th>
                    <th className="px-4 py-3">Nota</th>
                    <th className="px-4 py-3">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filtered.map((row) => (
                    <tr key={row.id} className="bg-white/70 dark:bg-slate-900/40">
                      <td className="px-4 py-3">
                        <p className="font-semibold text-slate-800 dark:text-slate-100">{row.studentName}</p>
                        <p className="text-xs text-slate-400">{row.studentEmail}</p>
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-medium">{row.title}</p>
                        <p className="text-xs text-slate-400">
                          Límite: {row.due_date ? new Date(row.due_date).toLocaleDateString('es-MX') : '—'}
                        </p>
                      </td>
                      <td className="px-4 py-3 text-xs font-bold">{TYPE_LABELS[row.type] || row.type}</td>
                      <td className="px-4 py-3">
                        <span className="text-xs font-bold">{STATUS_LABELS[row.status] || row.status}</span>
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-500 whitespace-nowrap">
                        {row.submitted_at ? new Date(row.submitted_at).toLocaleString('es-MX') : 'Sin entregar'}
                      </td>
                      <td className="px-4 py-3 font-black">
                        {typeof row.grade === 'number' ? row.grade : '—'}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {row.status === 'submitted' && (
                            <button
                              type="button"
                              onClick={() =>
                                setGradingItem({
                                  assignment: row,
                                  studentProfile: {
                                    id: row.student_id,
                                    display_name: row.studentName,
                                    email: row.studentEmail,
                                  },
                                })
                              }
                              className="text-xs font-bold text-indigo-600 hover:underline cursor-pointer"
                            >
                              Calificar
                            </button>
                          )}
                          <Link
                            to={`/admin/alumnos/${row.student_id}`}
                            className="text-xs font-bold text-slate-500 hover:text-indigo-600"
                          >
                            Expediente
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>

      <TeacherQuickGradeModal
        isOpen={Boolean(gradingItem)}
        onClose={() => setGradingItem(null)}
        item={gradingItem}
        onGraded={() => {
          setGradingItem(null);
          load();
        }}
      />
    </AdminLayout>
  );
}
