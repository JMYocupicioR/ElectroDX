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
import type { LiveWorkshop, WorkshopStatus } from '../../types/database';
import type { Module } from '../../types/content';
import type { AdminProfileRow } from '../../types/admin';
import type { ClassAttendanceRecord } from '../../types/academicGradebook';
import { CreateLiveClassModal } from './CreateLiveClassModal';

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
            try {
              const result = await sendAcademicPush({
                title: pushTitle,
                body: pushBody,
                url: '/talleres',
              });
              setPushStatus(
                `Enviados ${result.sent} de ${result.queued}. Fallidos: ${result.failed}.`
              );
              setPushBody('');
            } catch (err) {
              setPushStatus(err instanceof Error ? err.message : 'No se pudo enviar');
            }
          }}
        >
          <input
            className="w-full min-h-[42px] rounded-xl border border-slate-200 dark:border-slate-700 px-3.5 text-xs font-semibold dark:bg-slate-800"
            value={pushTitle}
            onChange={(e) => setPushTitle(e.target.value)}
            required
          />
          <textarea
            className="w-full rounded-xl border border-slate-200 dark:border-slate-700 px-3.5 py-2.5 text-xs font-normal dark:bg-slate-800"
            rows={2}
            placeholder="Mensaje del aviso (taller, recordatorio, cambio de horario)"
            value={pushBody}
            onChange={(e) => setPushBody(e.target.value)}
            required
          />
          <button
            type="submit"
            className="min-h-[40px] px-5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition shadow-xs cursor-pointer"
          >
            Enviar aviso
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

      {loading ? (
        <p className="text-sm text-slate-500 text-center py-12">Cargando talleres...</p>
      ) : workshops.length === 0 ? (
        <div className="text-center py-12 rounded-3xl border border-dashed border-slate-200 dark:border-slate-700">
          <Calendar className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <p className="text-sm text-slate-500 font-semibold">No hay talleres programados.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {workshops.map((w) => {
            const mod = modules.find((m) => m.id === w.module_id);
            const date = new Date(w.scheduled_at);
            const summary = summaries.get(w.id);
            const isClosed = !!w.attendance_closed;

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
                          : w.status === 'scheduled'
                          ? 'bg-orange-100 text-orange-600'
                          : w.status === 'completed'
                          ? 'bg-emerald-100 text-emerald-600'
                          : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      {w.status}
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
                        <a
                          href={w.recording_url}
                          target="_blank"
                          rel="noreferrer"
                          className="hover:underline truncate"
                        >
                          Grabación disponible
                        </a>
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
                      onClick={() => setEditingWorkshop(w)}
                      className="py-2 px-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                      title="Actualizar enlaces de transmisión o grabación"
                    >
                      <Video className="w-3.5 h-3.5 text-rose-500" />
                      <span className="hidden sm:inline">Enlaces</span>
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
                    {w.status === 'scheduled' && (
                      <button
                        onClick={() => setStatus(w.id, 'live')}
                        className="flex-1 py-1.5 bg-red-100 text-red-700 rounded-lg text-xs font-bold hover:bg-red-200 transition"
                      >
                        Iniciar En Vivo
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

      {/* Modal de Enlaces y Grabaciones */}
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
