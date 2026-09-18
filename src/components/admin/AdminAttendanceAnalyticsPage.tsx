import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, UserCheck } from 'lucide-react';
import { AdminLayout } from './AdminLayout';
import {
  AdminAnalyticsScopeBar,
  AnalyticsField,
  AnalyticsFilterGrid,
  AnalyticsKpi,
  analyticsControlClass,
} from './analytics/AdminAnalyticsChrome';
import AttendanceTrackerModal from './AttendanceTrackerModal';
import {
  loadGradeableStudents,
  getCohortAttendanceAnalytics,
} from '../../services/academicAnalyticsService';
import { filterAttendance } from '../../utils/academicAnalytics';
import { useAuth } from '../../contexts/AuthProvider';
import type { AdminProfileRow } from '../../types/admin';
import type { AttendanceAnalyticsFilters, AttendanceAnalyticsRow } from '../../types/academicAnalytics';
import type { AttendanceStatus, SessionModality } from '../../types/academicGradebook';

const STATUS_LABELS: Record<AttendanceStatus, string> = {
  present: 'Presente',
  late: 'Retardo',
  excused: 'Justificada',
  absent: 'Falta',
};

const MODALITY_LABELS: Record<SessionModality, string> = {
  in_person: 'Presencial',
  online: 'En línea',
};

const EMPTY_FILTERS: Omit<AttendanceAnalyticsFilters, 'studentId'> = {
  status: 'all',
  modality: 'all',
  sessionTitle: '',
  search: '',
  from: '',
  to: '',
};

export default function AdminAttendanceAnalyticsPage() {
  const { user } = useAuth();
  const [params, setParams] = useSearchParams();
  const studentId = params.get('alumno') || '';

  const [profiles, setProfiles] = useState<AdminProfileRow[]>([]);
  const [rows, setRows] = useState<AttendanceAnalyticsRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [showTracker, setShowTracker] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const students = await loadGradeableStudents(user?.id);
      setProfiles(students);
      setRows(await getCohortAttendanceAnalytics(students));
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
    () => filterAttendance(rows, { ...filters, studentId }),
    [rows, filters, studentId]
  );

  const sessions = useMemo(() => {
    return [...new Set(rows.map((row) => row.sessionTitle).filter(Boolean))].sort((a, b) =>
      a.localeCompare(b, 'es')
    );
  }, [rows]);

  const presentPts = filtered.reduce((sum, row) => {
    if (row.status === 'present' || row.status === 'excused') return sum + 1;
    if (row.status === 'late') return sum + 0.8;
    return sum;
  }, 0);
  const attendancePct = filtered.length === 0 ? 100 : Math.round((presentPts / filtered.length) * 100);

  const setStudentId = (id: string) => {
    const next = new URLSearchParams(params);
    if (id) next.set('alumno', id);
    else next.delete('alumno');
    setParams(next, { replace: true });
  };

  return (
    <AdminLayout
      title="Asistencias a cursos"
      subtitle="Filtra por alumno, modalidad (presencial o en línea), sesión y estatus de asistencia"
    >
      <div className="space-y-5 pb-16">
        <AdminAnalyticsScopeBar
          student={scopedStudent}
          cohortHref="/admin/alumnos/asistencias"
          studentLabel="Asistencias del alumno"
          actions={
            <button
              type="button"
              onClick={() => setShowTracker(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-xs cursor-pointer shrink-0"
            >
              <UserCheck className="w-3.5 h-3.5" />
              Pase de lista
            </button>
          }
        />

        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
          <AnalyticsKpi label="Registros" value={filtered.length} />
          <AnalyticsKpi
            label="Presentes"
            value={filtered.filter((row) => row.status === 'present').length}
          />
          <AnalyticsKpi label="Retardos" value={filtered.filter((row) => row.status === 'late').length} />
          <AnalyticsKpi label="Faltas" value={filtered.filter((row) => row.status === 'absent').length} />
          <AnalyticsKpi label="Asistencia" value={`${attendancePct}%`} hint="Ponderada (retardo = 80%)" />
        </div>

        <AnalyticsFilterGrid>
          <AnalyticsField label="Buscar">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                value={filters.search}
                onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
                placeholder="Alumno, sesión o notas..."
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
          <AnalyticsField label="Modalidad del curso">
            <select
              value={filters.modality}
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  modality: e.target.value as AttendanceAnalyticsFilters['modality'],
                }))
              }
              className={analyticsControlClass()}
            >
              <option value="all">Presencial y en línea</option>
              <option value="in_person">Presencial</option>
              <option value="online">En línea</option>
            </select>
          </AnalyticsField>
          <AnalyticsField label="Estatus">
            <select
              value={filters.status}
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  status: e.target.value as AttendanceAnalyticsFilters['status'],
                }))
              }
              className={analyticsControlClass()}
            >
              <option value="all">Todos los estatus</option>
              {(Object.keys(STATUS_LABELS) as AttendanceStatus[]).map((status) => (
                <option key={status} value={status}>
                  {STATUS_LABELS[status]}
                </option>
              ))}
            </select>
          </AnalyticsField>
          <AnalyticsField label="Sesión o curso">
            <select
              value={filters.sessionTitle}
              onChange={(e) => setFilters((prev) => ({ ...prev, sessionTitle: e.target.value }))}
              className={analyticsControlClass()}
            >
              <option value="">Todas las sesiones</option>
              {sessions.map((title) => (
                <option key={title} value={title}>
                  {title}
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
            <p className="px-5 py-10 text-sm text-slate-500 text-center">Cargando asistencias...</p>
          ) : filtered.length === 0 ? (
            <p className="px-5 py-10 text-sm text-slate-400 text-center">
              No hay asistencias con los filtros seleccionados. Usa «Pase de lista» para registrar una sesión.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <caption className="sr-only">Asistencias de la cohorte</caption>
                <thead className="bg-slate-50 dark:bg-slate-800/60 text-left text-[10px] uppercase tracking-wider text-slate-500">
                  <tr>
                    <th className="px-4 py-3">Alumno</th>
                    <th className="px-4 py-3">Sesión</th>
                    <th className="px-4 py-3">Fecha</th>
                    <th className="px-4 py-3">Modalidad</th>
                    <th className="px-4 py-3">Estatus</th>
                    <th className="px-4 py-3">Notas</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filtered.map((row) => (
                    <tr key={row.id} className="bg-white/70 dark:bg-slate-900/40">
                      <td className="px-4 py-3">
                        <p className="font-semibold text-slate-800 dark:text-slate-100">{row.studentName}</p>
                        <p className="text-xs text-slate-400">{row.studentEmail}</p>
                      </td>
                      <td className="px-4 py-3 font-medium">{row.sessionTitle}</td>
                      <td className="px-4 py-3 text-xs text-slate-500 whitespace-nowrap">
                        {row.sessionDate
                          ? new Date(`${row.sessionDate}T00:00:00`).toLocaleDateString('es-MX')
                          : '—'}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex px-2 py-0.5 rounded-md text-[11px] font-black ${
                            row.modality === 'in_person'
                              ? 'bg-amber-50 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300'
                              : 'bg-sky-50 text-sky-800 dark:bg-sky-950/50 dark:text-sky-300'
                          }`}
                        >
                          {MODALITY_LABELS[row.modality]}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs font-bold">{STATUS_LABELS[row.status]}</td>
                      <td className="px-4 py-3 text-xs text-slate-500">{row.notes || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>

      <AttendanceTrackerModal
        isOpen={showTracker}
        onClose={() => setShowTracker(false)}
        profiles={profiles}
        onSaved={load}
      />
    </AdminLayout>
  );
}
