import { useEffect, useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Calendar,
  Video,
  Plus,
  Users,
  XCircle,
  Bell,
  UserCheck,
  Lock,
  Unlock,
  BookOpen,
  Trash2,
  Search,
  Filter,
  X,
  RotateCcw,
  Pencil,
  CheckCircle2,
} from 'lucide-react';
import { AdminLayout } from './AdminLayout';
import {
  getWorkshops,
  updateWorkshop,
  deleteWorkshop,
  setWorkshopAttendanceClosed,
} from '../../services/courseService';
import { sendAcademicPush } from '../../services/studentToolsService';
import { loadGradeableStudents } from '../../services/academicAnalyticsService';
import {
  getCohortAttendance,
  computeWorkshopAttendanceSummary,
} from '../../services/attendanceService';
import { allModules } from '../../content/modules';
import { useAuth } from '../../contexts/AuthProvider';
import { isWorkshopCompleted } from '../../utils/liveSessionUtils';
import type { LiveWorkshop, WorkshopStatus } from '../../types/database';
import type { Module } from '../../types/content';
import type { AdminProfileRow } from '../../types/admin';
import type { ClassAttendanceRecord } from '../../types/academicGradebook';
import { CreateLiveClassModal } from './CreateLiveClassModal';

export type StatusFilter = 'active' | 'all' | 'completed' | 'draft_cancelled' | WorkshopStatus;
export type ModalityFilter = 'all' | 'online' | 'in_person';
export type RollCallFilter = 'all' | 'not_started' | 'incomplete' | 'completed';
export type SortOrder = 'date_asc' | 'date_desc';

function normalizeSearchText(str: string): string {
  return (str || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

export default function AdminWorkshopsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [workshops, setWorkshops] = useState<LiveWorkshop[]>([]);
  const [modules, setModules] = useState<Module[]>([]);
  const [students, setStudents] = useState<AdminProfileRow[]>([]);
  const [cohortRecords, setCohortRecords] = useState<ClassAttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [editingWorkshop, setEditingWorkshop] = useState<LiveWorkshop | null>(null);
  const [pushTitle, setPushTitle] = useState('Aviso académico ElectroDx');
  const [pushBody, setPushBody] = useState('');
  const [pushStatus, setPushStatus] = useState<string | null>(null);
  const [isSendingPush, setIsSendingPush] = useState(false);

  // Estados de Filtros
  const [q, setQ] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('active');
  const [modalityFilter, setModalityFilter] = useState<ModalityFilter>('all');
  const [moduleId, setModuleId] = useState('');
  const [rollCallFilter, setRollCallFilter] = useState<RollCallFilter>('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [sortOrder, setSortOrder] = useState<SortOrder>('date_asc');

  const load = async () => {
    setLoading(true);
    try {
      const [ws, stud] = await Promise.all([
        getWorkshops(),
        loadGradeableStudents(user?.id),
      ]);
      setWorkshops(ws);
      setModules(allModules);
      setStudents(stud);

      const records = await getCohortAttendance(stud.map((s) => s.id));
      setCohortRecords(records);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [user?.id]);

  const studentIds = useMemo(() => students.map((s) => s.id), [students]);

  const summaries = useMemo(() => {
    const map = new Map<string, ReturnType<typeof computeWorkshopAttendanceSummary>>();
    for (const w of workshops) {
      map.set(w.id, computeWorkshopAttendanceSummary(w, studentIds, cohortRecords));
    }
    return map;
  }, [workshops, studentIds, cohortRecords]);

  const topicTitleMap = useMemo(() => {
    const map = new Map<string, string>();
    for (const m of allModules) {
      for (const t of m.topics) {
        map.set(t.id, t.title);
        if (t.children) {
          for (const c of t.children) {
            map.set(c.id, c.title);
          }
        }
      }
    }
    return map;
  }, []);

  const counts = useMemo(() => {
    let active = 0;
    let completed = 0;
    let draftOrCancelled = 0;
    for (const w of workshops) {
      if (w.status === 'draft' || w.status === 'cancelled') {
        draftOrCancelled++;
      } else if (isWorkshopCompleted(w)) {
        completed++;
      } else {
        active++;
      }
    }
    return {
      all: workshops.length,
      active,
      completed,
      draftOrCancelled,
    };
  }, [workshops]);

  const pendingSyncWorkshops = useMemo(() => {
    return workshops.filter((w) => w.status === 'scheduled' && isWorkshopCompleted(w));
  }, [workshops]);

  const [isSyncingCompleted, setIsSyncingCompleted] = useState(false);

  const handleSyncCompletedWorkshops = async () => {
    if (pendingSyncWorkshops.length === 0) return;
    const proceed = window.confirm(
      `Se actualizarán ${pendingSyncWorkshops.length} clases que ya concluyeron o tienen video subido al estado oficial "Finalizada" en la base de datos.\n\nPodrás seguir consultando los talleres y pasando lista en cualquier momento.\n\n¿Deseas continuar?`
    );
    if (!proceed) return;

    setIsSyncingCompleted(true);
    try {
      await Promise.all(
        pendingSyncWorkshops.map((w) => updateWorkshop(w.id, { status: 'completed' }))
      );
      await load();
    } catch (err) {
      console.error(err);
      alert('Error al sincronizar algunas clases. Intenta nuevamente.');
    } finally {
      setIsSyncingCompleted(false);
    }
  };

  const filteredWorkshops = useMemo(() => {
    const needle = normalizeSearchText(q);

    return workshops
      .filter((w) => {
        // Filtro por Estado
        if (statusFilter === 'active') {
          if (w.status === 'draft' || w.status === 'cancelled' || isWorkshopCompleted(w)) return false;
        } else if (statusFilter === 'completed') {
          if (!isWorkshopCompleted(w)) return false;
        } else if (statusFilter === 'draft_cancelled') {
          if (w.status !== 'draft' && w.status !== 'cancelled') return false;
        } else if (statusFilter !== 'all') {
          if (w.status !== statusFilter) return false;
        }

        // Filtro por Modalidad
        if (modalityFilter !== 'all' && (w.session_modality ?? 'online') !== modalityFilter) {
          return false;
        }

        // Filtro por Módulo
        if (moduleId && w.module_id !== moduleId) {
          return false;
        }

        // Filtro por Pase de lista
        if (rollCallFilter !== 'all') {
          const sum = summaries.get(w.id);
          const rollCallStatus = sum ? sum.rollCallStatus : 'not_started';
          if (rollCallStatus !== rollCallFilter) return false;
        }

        // Filtro por Fechas
        const at = new Date(w.scheduled_at).getTime();
        if (dateFrom && at < new Date(dateFrom).getTime()) return false;
        if (dateTo && at > new Date(`${dateTo}T23:59:59`).getTime()) return false;

        // Búsqueda textual insensible a acentos en título, módulo, tema y descripción
        if (needle) {
          const modTitle = modules.find((m) => m.id === w.module_id)?.title ?? '';
          const topic = w.topic_id ? topicTitleMap.get(w.topic_id) ?? '' : '';
          const hay = normalizeSearchText(`${w.title} ${modTitle} ${topic} ${w.description ?? ''}`);
          if (!hay.includes(needle)) return false;
        }

        return true;
      })
      .sort((a, b) => {
        const timeA = new Date(a.scheduled_at).getTime();
        const timeB = new Date(b.scheduled_at).getTime();
        return sortOrder === 'date_asc' ? timeA - timeB : timeB - timeA;
      });
  }, [
    workshops,
    q,
    statusFilter,
    modalityFilter,
    moduleId,
    rollCallFilter,
    dateFrom,
    dateTo,
    sortOrder,
    modules,
    topicTitleMap,
    summaries,
  ]);

  const hasActiveFilters = Boolean(
    q.trim() ||
      statusFilter !== 'active' ||
      modalityFilter !== 'all' ||
      moduleId ||
      rollCallFilter !== 'all' ||
      dateFrom ||
      dateTo ||
      sortOrder !== 'date_asc'
  );

  const activeFiltersCount = [
    Boolean(q.trim()),
    statusFilter !== 'active',
    modalityFilter !== 'all',
    Boolean(moduleId),
    rollCallFilter !== 'all',
    Boolean(dateFrom),
    Boolean(dateTo),
    sortOrder !== 'date_asc',
  ].filter(Boolean).length;

  const resetFilters = (defaultToActive = true) => {
    setQ('');
    setStatusFilter(defaultToActive ? 'active' : 'all');
    setModalityFilter('all');
    setModuleId('');
    setRollCallFilter('all');
    setDateFrom('');
    setDateTo('');
    setSortOrder('date_asc');
  };

  const setStatus = async (id: string, status: WorkshopStatus) => {
    // Si intenta finalizar, advertir si el pase de lista está incompleto
    if (status === 'completed') {
      const sum = summaries.get(id);
      if (sum && sum.rollCallStatus !== 'completed') {
        const proceed = window.confirm(
          `Aviso de Control Escolar:\n\nLa lista de asistencia para esta sesión está ${
            sum.rollCallStatus === 'not_started' ? 'PENDIENTE (0 marcados)' : `INCOMPLETA (${sum.pendingCount} cursistas sin marcar)`
          }.\n\n¿Deseas finalizar el taller de todos modos? Presiona "Cancelar" si deseas pasar lista primero.`
        );
        if (!proceed) {
          navigate(`/admin/alumnos/asistencias?tab=pase&workshopId=${id}`);
          return;
        }
      }
    }

    try {
      await updateWorkshop(id, { status });
      load();
    } catch (e) {
      alert('Error al actualizar estado');
    }
  };

  const toggleAttendanceClosed = async (id: string, current: boolean) => {
    try {
      await setWorkshopAttendanceClosed(id, !current);
      load();
    } catch (e) {
      alert('Error al cambiar cierre de lista');
    }
  };

  const handleDeleteWorkshop = async (id: string) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar esta clase/taller? Se removerá permanentemente de la plataforma.')) {
      return;
    }
    try {
      await deleteWorkshop(id);
      load();
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Error al eliminar la clase');
    }
  };

  return (
    <AdminLayout
      title="Clases en vivo"
      subtitle="Sesiones programadas, enlaces de transmisión y grabaciones de la cohorte"
    >
      {/* Aviso Push */}
      <div className="mb-6 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
        <h3 className="font-bold text-sm flex items-center gap-2 mb-3 text-slate-900 dark:text-white">
          <Bell className="w-4 h-4 text-indigo-600" /> Aviso push a cursistas
        </h3>
        <form
          className="space-y-3"
          onSubmit={async (e) => {
            e.preventDefault();
            setPushStatus(null);
            setIsSendingPush(true);
            try {
              const result = await sendAcademicPush({
                title: pushTitle,
                body: pushBody,
                url: '/talleres',
              });
              if (result.queued === 0) {
                setPushStatus('No hay alumnos con notificaciones push activadas en este momento.');
              } else {
                setPushStatus(
                  `Enviados ${result.sent} de ${result.queued}. Fallidos: ${result.failed}.`
                );
              }
              setPushBody('');
            } catch (err) {
              setPushStatus(err instanceof Error ? err.message : 'No se pudo enviar');
            } finally {
              setIsSendingPush(false);
            }
          }}
        >
          <input
            className="w-full min-h-[42px] rounded-xl border border-slate-200 dark:border-slate-700 px-3.5 text-xs font-semibold dark:bg-slate-800"
            value={pushTitle}
            onChange={(e) => setPushTitle(e.target.value)}
            required
            disabled={isSendingPush}
          />
          <textarea
            className="w-full rounded-xl border border-slate-200 dark:border-slate-700 px-3.5 py-2.5 text-xs font-normal dark:bg-slate-800"
            rows={2}
            placeholder="Mensaje del aviso (taller, recordatorio, cambio de horario)"
            value={pushBody}
            onChange={(e) => setPushBody(e.target.value)}
            required
            disabled={isSendingPush}
          />
          <button
            type="submit"
            disabled={isSendingPush}
            className="min-h-[40px] px-5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-bold transition shadow-xs cursor-pointer disabled:cursor-not-allowed"
          >
            {isSendingPush ? 'Enviando aviso...' : 'Enviar aviso'}
          </button>
          {pushStatus && <p className="text-xs font-bold text-slate-500">{pushStatus}</p>}
        </form>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h3 className="text-base font-black text-slate-900 dark:text-white">
            Programación y Asistencia de Talleres
          </h3>
          <p className="text-xs text-slate-500">
            Programa sesiones híbridas y gestiona el pase de lista oficial para el Kardex.
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            setEditingWorkshop(null);
            setCreateOpen(true);
          }}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-bold shadow-xs transition cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" /> Programar Taller
        </button>
      </div>

      {/* Barra de Filtros y Búsqueda */}
      {!loading && workshops.length > 0 && (
        <div className="mb-6 p-4 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-3.5">
          {/* Fila superior: Búsqueda rápida + Pestañas de estado + Contador */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
            {/* Input de búsqueda */}
            <div className="relative flex-1 min-w-[240px] max-w-lg">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Buscar por clase, módulo, tema o descripción..."
                className="w-full pl-9 pr-8 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
              />
              {q && (
                <button
                  type="button"
                  onClick={() => setQ('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-md transition"
                  title="Borrar búsqueda"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Quick Status Tabs (Pills) */}
            <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-2xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 text-xs">
              <button
                type="button"
                onClick={() => setStatusFilter('active')}
                className={`px-3 py-1.5 rounded-xl font-bold transition flex items-center gap-1.5 ${
                  statusFilter === 'active'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <span>Próximas y En Vivo</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${
                    statusFilter === 'active'
                      ? 'bg-indigo-700/70 text-indigo-100'
                      : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  {counts.active}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setStatusFilter('all')}
                className={`px-3 py-1.5 rounded-xl font-bold transition flex items-center gap-1.5 ${
                  statusFilter === 'all'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <span>Todas</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${
                    statusFilter === 'all'
                      ? 'bg-indigo-700/70 text-indigo-100'
                      : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  {counts.all}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setStatusFilter('completed')}
                className={`px-3 py-1.5 rounded-xl font-bold transition flex items-center gap-1.5 ${
                  statusFilter === 'completed'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <span>Finalizadas</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${
                    statusFilter === 'completed'
                      ? 'bg-emerald-700/70 text-emerald-100'
                      : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  {counts.completed}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setStatusFilter('draft_cancelled')}
                className={`px-3 py-1.5 rounded-xl font-bold transition flex items-center gap-1.5 ${
                  statusFilter === 'draft_cancelled'
                    ? 'bg-slate-700 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <span>Borradores / Canceladas</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${
                    statusFilter === 'draft_cancelled'
                      ? 'bg-slate-800 text-slate-200'
                      : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  {counts.draftOrCancelled}
                </span>
              </button>
            </div>

            {/* Contador de resultados */}
            <div className="text-xs text-slate-500 font-medium shrink-0 self-start lg:self-center">
              Mostrando <strong className="text-slate-800 dark:text-slate-200">{filteredWorkshops.length}</strong> de {workshops.length} clases
            </div>
          </div>

          {/* Fila inferior: Controles secundarios (Módulo, Modalidad, Pase de lista, Rango de fechas, Orden, Limpiar) */}
          <div className="flex flex-wrap items-center gap-2.5 pt-2.5 border-t border-slate-100 dark:border-slate-800/80 text-xs">
            {/* Filtro Módulo */}
            <div className="flex items-center gap-1.5 min-w-[170px] max-w-xs">
              <select
                value={moduleId}
                onChange={(e) => setModuleId(e.target.value)}
                className="w-full py-1.5 px-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-medium focus:outline-none focus:border-indigo-500"
              >
                <option value="">Todos los módulos</option>
                {modules.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.number ? `M${m.number}: ` : ''}{m.title}
                  </option>
                ))}
              </select>
            </div>

            {/* Filtro Modalidad */}
            <div className="flex items-center gap-1.5">
              <select
                value={modalityFilter}
                onChange={(e) => setModalityFilter(e.target.value as ModalityFilter)}
                className="py-1.5 px-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-medium focus:outline-none focus:border-indigo-500"
              >
                <option value="all">Modalidad: Todas</option>
                <option value="online">🌐 En línea</option>
                <option value="in_person">🏛️ Presencial</option>
              </select>
            </div>

            {/* Filtro Pase de lista (Control escolar) */}
            <div className="flex items-center gap-1.5">
              <select
                value={rollCallFilter}
                onChange={(e) => setRollCallFilter(e.target.value as RollCallFilter)}
                className="py-1.5 px-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-medium focus:outline-none focus:border-indigo-500"
              >
                <option value="all">Pase de lista: Todos</option>
                <option value="not_started">⚠️ Sin pase de lista</option>
                <option value="incomplete">⏳ Lista incompleta</option>
                <option value="completed">✅ Lista completada</option>
              </select>
            </div>

            {/* Rango de Fechas */}
            <div className="flex items-center gap-1 text-slate-500 bg-slate-50 dark:bg-slate-800/60 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
              <span className="text-[11px] font-semibold px-1">Fecha:</span>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="py-0.5 px-1.5 bg-transparent border-0 text-xs text-slate-700 dark:text-slate-200 focus:outline-none font-medium"
                title="Fecha inicio"
              />
              <span className="text-[11px] text-slate-400">–</span>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="py-0.5 px-1.5 bg-transparent border-0 text-xs text-slate-700 dark:text-slate-200 focus:outline-none font-medium"
                title="Fecha fin"
              />
            </div>

            {/* Orden Cronológico */}
            <div className="flex items-center gap-1.5">
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value as SortOrder)}
                className="py-1.5 px-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-medium focus:outline-none focus:border-indigo-500"
              >
                <option value="date_asc">📅 Próximas primero</option>
                <option value="date_desc">📅 Más lejanas primero</option>
              </select>
            </div>

            {/* Botón Limpiar Filtros */}
            {hasActiveFilters && (
              <button
                type="button"
                onClick={() => resetFilters(false)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/40 dark:hover:text-rose-400 font-bold transition ml-auto"
                title="Restablecer todos los filtros"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Limpiar</span>
                <span className="px-1.5 py-0.2 text-[10px] rounded-full bg-slate-200 dark:bg-slate-700 font-black">
                  {activeFiltersCount}
                </span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Alerta de Sincronización de Clases Concluidas */}
      {!loading && pendingSyncWorkshops.length > 0 && (
        <div className="mb-5 p-3.5 sm:p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex flex-wrap items-center justify-between gap-3 text-xs text-emerald-800 dark:text-emerald-200">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <div>
              <p className="font-bold">
                {pendingSyncWorkshops.length === 1
                  ? '1 clase ya concluyó o tiene video subido'
                  : `${pendingSyncWorkshops.length} clases ya concluyeron o tienen video subido`}
              </p>
              <p className="text-[11px] text-emerald-700/80 dark:text-emerald-300/80">
                Se muestran clasificadas en «Finalizadas». Puedes actualizar su estado oficial en la base de datos con un clic.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleSyncCompletedWorkshops}
            disabled={isSyncingCompleted}
            className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition shadow-xs flex items-center gap-1.5 shrink-0"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            {isSyncingCompleted
              ? 'Actualizando base de datos...'
              : `Guardar ${pendingSyncWorkshops.length} como Finalizadas en BD`}
          </button>
        </div>
      )}

      {loading ? (
        <p className="text-sm text-slate-500 text-center py-12">Cargando talleres...</p>
      ) : workshops.length === 0 ? (
        <div className="text-center py-12 rounded-3xl border border-dashed border-slate-200 dark:border-slate-700">
          <Calendar className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <p className="text-sm text-slate-500 font-semibold mb-3">No hay talleres programados en la plataforma.</p>
          <button
            type="button"
            onClick={() => {
              setEditingWorkshop(null);
              setCreateOpen(true);
            }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition"
          >
            <Plus className="w-4 h-4" /> Programar Primer Taller
          </button>
        </div>
      ) : filteredWorkshops.length === 0 ? (
        <div className="text-center py-12 rounded-3xl border border-dashed border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-900/40 p-8">
          <Filter className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
          <p className="text-base font-bold text-slate-800 dark:text-slate-200 mb-1">
            Ninguna clase coincide con los filtros aplicados
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto mb-4">
            Prueba ajustando el término de búsqueda, seleccionando la pestaña "Todas" o limpiando los criterios secundarios.
          </p>
          <button
            type="button"
            onClick={() => resetFilters(false)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Restablecer filtros y ver todas las clases
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredWorkshops.map((w) => {
            const mod = modules.find((m) => m.id === w.module_id);
            const date = new Date(w.scheduled_at);
            const summary = summaries.get(w.id);
            const isClosed = !!w.attendance_closed;
            const isFinished = isWorkshopCompleted(w);

            return (
              <div
                key={w.id}
                className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-5 shadow-xs flex flex-col justify-between hover:border-indigo-300 dark:hover:border-indigo-700 transition"
              >
                <div>
                  <div className="flex justify-between items-start mb-2.5 gap-2">
                    <h4 className="font-bold text-slate-900 dark:text-white leading-tight line-clamp-2">
                      {w.title}
                    </h4>
                    <span
                      className={`px-2 py-0.5 text-[10px] uppercase font-black rounded-md shrink-0 ${
                        w.status === 'live'
                          ? 'bg-red-100 text-red-600 animate-pulse'
                          : isFinished
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                          : w.status === 'scheduled'
                          ? 'bg-orange-100 text-orange-600'
                          : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      {w.status === 'live'
                        ? 'En Vivo'
                        : isFinished
                        ? (w.recording_url ? 'Finalizada · Grabada' : 'Finalizada')
                        : w.status === 'scheduled'
                        ? 'Programada'
                        : w.status}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs text-indigo-600 dark:text-indigo-400 line-clamp-1 font-medium">
                      {mod?.title || 'Módulo académico'}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.2 rounded-sm ${
                        w.session_modality === 'in_person'
                          ? 'bg-amber-50 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                          : 'bg-sky-50 text-sky-800 dark:bg-sky-950/60 dark:text-sky-300'
                      }`}
                    >
                      {w.session_modality === 'in_person' ? 'Presencial' : 'En línea'}
                    </span>
                  </div>

                  {w.topic_id && (
                    <div className="mb-3 flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-50/90 dark:bg-indigo-950/60 border border-indigo-200/80 dark:border-indigo-800/60 text-indigo-700 dark:text-indigo-300 text-xs font-medium">
                      <BookOpen className="w-3.5 h-3.5 shrink-0 text-indigo-600 dark:text-indigo-400" />
                      <span className="truncate">Tema: {topicTitleMap.get(w.topic_id) || w.topic_id}</span>
                    </div>
                  )}

                  <div className="space-y-2 mb-4 text-xs text-slate-600 dark:text-slate-300">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>
                        {date.toLocaleDateString('es-MX', {
                          weekday: 'short',
                          day: 'numeric',
                          month: 'short',
                        })}{' '}
                        {date.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    {w.stream_url && (
                      <div className="flex items-center gap-2 truncate">
                        <Video className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <a
                          href={w.stream_url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-indigo-600 dark:text-indigo-400 hover:underline truncate"
                        >
                          Enlace de acceso
                        </a>
                      </div>
                    )}

                    {w.recording_url && (
                      <div className="flex items-center gap-2 truncate text-emerald-600 dark:text-emerald-400 font-bold">
                        <Video className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                        <Link
                          to={`/taller/${w.id}`}
                          className="hover:underline truncate"
                          title="Abrir en aula virtual con tracking"
                        >
                          Grabación ({w.min_watch_percent || 85}% req)
                        </Link>
                      </div>
                    )}

                    {/* Estadísticas reales de asistencia */}
                    <div className="flex items-center gap-2 pt-1 border-t border-slate-100 dark:border-slate-800">
                      <Users className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      {summary ? (
                        summary.rollCallStatus === 'completed' ? (
                          <span className="font-bold text-emerald-600 dark:text-emerald-400">
                            {summary.presentCount + summary.lateCount} / {summary.totalExpected} presentes ({summary.attendancePct}%)
                          </span>
                        ) : summary.rollCallStatus === 'incomplete' ? (
                          <span className="font-bold text-amber-600 dark:text-amber-400">
                            {summary.totalExpected - summary.pendingCount} / {summary.totalExpected} asentados ({summary.pendingCount} pendientes)
                          </span>
                        ) : (
                          <span className="font-bold text-slate-400">
                            {summary.totalExpected} cursistas (Sin pase de lista)
                          </span>
                        )
                      ) : (
                        <span>Cohorte activa</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Acciones del Taller */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <Link
                      to={`/admin/alumnos/asistencias?tab=pase&workshopId=${w.id}`}
                      className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/60 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 rounded-xl text-xs font-bold transition"
                    >
                      <UserCheck className="w-3.5 h-3.5" />
                      <span>{isClosed ? 'Ver / Editar Lista' : 'Pasar Lista'}</span>
                    </Link>

                    <button
                      type="button"
                      onClick={() => {
                        setCreateOpen(false);
                        setEditingWorkshop(w);
                      }}
                      className="py-2 px-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                      title="Editar clase, horarios y enlaces"
                    >
                      <Pencil className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
                      <span className="hidden sm:inline">Editar</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => toggleAttendanceClosed(w.id, isClosed)}
                      className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition cursor-pointer"
                      title={isClosed ? 'Reabrir lista para edición' : 'Cerrar lista oficialmente'}
                    >
                      {isClosed ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDeleteWorkshop(w.id)}
                      className="p-2 rounded-xl border border-rose-200 dark:border-rose-900/60 hover:bg-rose-50 dark:hover:bg-rose-950/50 text-rose-500 transition cursor-pointer"
                      title="Eliminar clase definitivamente"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Estado de Transmisión */}
                  <div className="flex items-center gap-1.5 pt-1">
                    {w.status === 'draft' && (
                      <button
                        onClick={() => setStatus(w.id, 'scheduled')}
                        className="flex-1 py-1.5 bg-orange-100 text-orange-700 rounded-lg text-xs font-bold hover:bg-orange-200 transition"
                      >
                        Programar
                      </button>
                    )}
                    {w.status === 'scheduled' && !isFinished && (
                      <button
                        onClick={() => setStatus(w.id, 'live')}
                        className="flex-1 py-1.5 bg-red-100 text-red-700 rounded-lg text-xs font-bold hover:bg-red-200 transition"
                      >
                        Iniciar En Vivo
                      </button>
                    )}
                    {w.status === 'scheduled' && isFinished && (
                      <button
                        onClick={() => setStatus(w.id, 'completed')}
                        className="flex-1 py-1.5 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1"
                        title="Guardar como Finalizada oficialmente en la base de datos"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Guardar como Finalizada
                      </button>
                    )}
                    {w.status === 'live' && (
                      <button
                        onClick={() => setStatus(w.id, 'completed')}
                        className="flex-1 py-1.5 bg-emerald-100 text-emerald-700 rounded-lg text-xs font-bold hover:bg-emerald-200 transition"
                      >
                        Finalizar Taller
                      </button>
                    )}
                    {w.status === 'completed' && (
                      <div className="flex-1 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                        <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Taller Concluido
                        </span>
                        <button
                          onClick={() => setStatus(w.id, 'scheduled')}
                          className="px-2 py-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded text-[11px] font-medium text-slate-500 transition"
                          title="Reabrir taller a programado"
                        >
                          Reabrir
                        </button>
                      </div>
                    )}
                    {['draft', 'scheduled'].includes(w.status) && (
                      <button
                        onClick={() => setStatus(w.id, 'cancelled')}
                        className="p-1.5 text-slate-400 hover:text-red-500 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 transition"
                        title="Cancelar sesión"
                      >
                        <XCircle className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Crear / editar clase en vivo */}
      <CreateLiveClassModal
        isOpen={createOpen || Boolean(editingWorkshop)}
        onClose={() => {
          setCreateOpen(false);
          setEditingWorkshop(null);
        }}
        initialWorkshop={editingWorkshop}
        onSuccess={async () => {
          setCreateOpen(false);
          setEditingWorkshop(null);
          await load();
        }}
      />
    </AdminLayout>
  );
}
