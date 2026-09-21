import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CheckCircle2,
  Clock,
  UserCheck,
  UserX,
  ShieldCheck,
  X,
  Save,
  Users,
  ExternalLink,
  CheckCheck,
} from 'lucide-react';
import {
  saveCohortAttendanceBatch,
  getWorkshopAttendance,
  normalizeSessionModality,
} from '../../services/attendanceService';
import { getWorkshops } from '../../services/courseService';
import { filterGradeableStudents } from '../../utils/adminUtils';
import { useAuth } from '../../contexts/AuthProvider';
import type { AdminProfileRow } from '../../types/admin';
import type { LiveWorkshop } from '../../types/database';
import type { AttendanceStatus, ClassAttendanceRecord, SessionModality } from '../../types/academicGradebook';

interface AttendanceTrackerModalProps {
  isOpen: boolean;
  onClose: () => void;
  profiles: AdminProfileRow[];
  onSaved: () => void;
  initialWorkshopId?: string;
}

export default function AttendanceTrackerModal({
  isOpen,
  onClose,
  profiles,
  onSaved,
  initialWorkshopId,
}: AttendanceTrackerModalProps) {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [workshops, setWorkshops] = useState<LiveWorkshop[]>([]);
  const [selectedWorkshopId, setSelectedWorkshopId] = useState('');
  const [sessionTitle, setSessionTitle] = useState('');
  const [sessionDate, setSessionDate] = useState('');
  const [sessionModality, setSessionModality] = useState<SessionModality>('online');
  const [attendances, setAttendances] = useState<
    Record<string, { status: AttendanceStatus | null; notes: string; excuseReason: string }>
  >({});
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const studentProfiles = useMemo(() => filterGradeableStudents(profiles), [profiles]);

  // Cargar lista de talleres reales
  useEffect(() => {
    if (isOpen) {
      getWorkshops().then((ws) => {
        setWorkshops(ws);
        if (ws.length > 0) {
          const first =
            (initialWorkshopId ? ws.find((w) => w.id === initialWorkshopId) : undefined) ||
            (!selectedWorkshopId
              ? ws.find((w) => w.status === 'live') || ws.find((w) => w.status === 'scheduled') || ws[0]
              : ws.find((w) => w.id === selectedWorkshopId));
          if (first) {
            setSelectedWorkshopId(first.id);
            setSessionTitle(first.title);
            setSessionDate(first.scheduled_at ? first.scheduled_at.split('T')[0] : '');
            setSessionModality(normalizeSessionModality(first.session_modality));
          }
        }
      });
    }
  }, [isOpen, initialWorkshopId]);

  // Sincronizar datos del taller seleccionado
  useEffect(() => {
    if (!isOpen) return;

    const ws = workshops.find((w) => w.id === selectedWorkshopId);
    if (ws) {
      setSessionTitle(ws.title);
      setSessionDate(ws.scheduled_at ? ws.scheduled_at.split('T')[0] : '');
      setSessionModality(normalizeSessionModality(ws.session_modality));
    }

    setSuccess(false);
    setErrorMsg(null);

    if (selectedWorkshopId) {
      getWorkshopAttendance(selectedWorkshopId).then((existingRecords) => {
        const initial: Record<
          string,
          { status: AttendanceStatus | null; notes: string; excuseReason: string }
        > = {};

        studentProfiles.forEach((p) => {
          const rec = existingRecords.find((r) => r.student_id === p.id);
          initial[p.id] = {
            status: rec ? rec.status : null,
            notes: rec?.notes || '',
            excuseReason: rec?.excuse_reason || '',
          };
        });

        setAttendances(initial);
      });
    }
  }, [isOpen, selectedWorkshopId, workshops, studentProfiles]);

  if (!isOpen) return null;

  const handleStatusChange = (studentId: string, status: AttendanceStatus) => {
    setAttendances((prev) => {
      const current = prev[studentId];
      const nextStatus = current?.status === status ? null : status;
      return {
        ...prev,
        [studentId]: {
          status: nextStatus,
          notes: current?.notes || '',
          excuseReason:
            nextStatus === 'excused' && !current?.excuseReason
              ? 'Guardia hospitalaria en sede'
              : current?.excuseReason || '',
        },
      };
    });
  };

  const handleBulkMarkPresent = () => {
    setAttendances((prev) => {
      const next = { ...prev };
      studentProfiles.forEach((p) => {
        next[p.id] = {
          status: 'present',
          notes: next[p.id]?.notes || '',
          excuseReason: next[p.id]?.excuseReason || '',
        };
      });
      return next;
    });
  };

  const handleBulkFillAbsent = () => {
    setAttendances((prev) => {
      const next = { ...prev };
      studentProfiles.forEach((p) => {
        if (!next[p.id] || next[p.id].status === null) {
          next[p.id] = {
            status: 'absent',
            notes: '',
            excuseReason: '',
          };
        }
      });
      return next;
    });
  };

  const handleSave = async () => {
    if (!sessionTitle || !sessionDate) {
      setErrorMsg('Selecciona una sesión válida con fecha para guardar.');
      return;
    }

    setSaving(true);
    setErrorMsg(null);

    try {
      const recordsToSave: ClassAttendanceRecord[] = [];

      for (const p of studentProfiles) {
        const item = attendances[p.id];
        if (item && item.status) {
          if (item.status === 'excused' && !item.excuseReason && !item.notes) {
            setErrorMsg(`El alumno ${p.display_name} tiene falta justificada sin motivo.`);
            setSaving(false);
            return;
          }

          recordsToSave.push({
            id: `att_${p.id}_${selectedWorkshopId || Date.now()}`,
            workshop_id: selectedWorkshopId || null,
            session_title: sessionTitle,
            session_date: sessionDate,
            student_id: p.id,
            status: item.status,
            session_modality: sessionModality,
            notes: item.notes || null,
            excuse_reason: item.excuseReason || null,
            recorded_by: user?.id || null,
            created_at: new Date().toISOString(),
          });
        }
      }

      await saveCohortAttendanceBatch(recordsToSave);
      setSuccess(true);
      setTimeout(() => {
        onSaved();
        onClose();
      }, 800);
    } catch (e) {
      console.error(e);
      setErrorMsg(e instanceof Error ? e.message : 'Error al guardar asistencias.');
    } finally {
      setSaving(false);
    }
  };

  const handleOpenFullCockpit = () => {
    onClose();
    navigate(`/admin/alumnos/asistencias?tab=pase&workshopId=${selectedWorkshopId}`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs">
      <div className="relative w-full max-w-3xl bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/40 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black text-slate-900 dark:text-white">
                Pase de Lista Rápido
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Registra la asistencia a talleres clínicos para el Kardex oficial
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleOpenFullCockpit}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 transition cursor-pointer"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Abrir Hub Completo</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Session Selector */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-800/20 grid grid-cols-1 sm:grid-cols-3 gap-4 shrink-0">
          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
              Taller o Sesión Canónica
            </label>
            <select
              value={selectedWorkshopId}
              onChange={(e) => setSelectedWorkshopId(e.target.value)}
              className="w-full p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold"
            >
              {workshops.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.title}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
              Fecha
            </label>
            <input
              type="date"
              value={sessionDate}
              onChange={(e) => setSessionDate(e.target.value)}
              className="w-full p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
              Modalidad
            </label>
            <select
              value={sessionModality}
              onChange={(e) => setSessionModality(e.target.value as SessionModality)}
              className="w-full p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold"
            >
              <option value="online">En línea (Zoom)</option>
              <option value="in_person">Presencial</option>
            </select>
          </div>
        </div>

        {/* Acciones Rápidas */}
        <div className="px-6 py-2.5 bg-slate-50/50 dark:bg-slate-800/30 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2 shrink-0">
          <span className="text-xs font-bold text-slate-500">
            {studentProfiles.length} cursistas en cohorte
          </span>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleBulkMarkPresent}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 transition cursor-pointer"
            >
              <CheckCheck className="w-3 h-3" />
              Todos Presentes
            </button>
            <button
              type="button"
              onClick={handleBulkFillAbsent}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 hover:bg-rose-100 transition cursor-pointer"
            >
              <UserX className="w-3 h-3" />
              Restantes Falta
            </button>
          </div>
        </div>

        {/* Alerta de Error */}
        {errorMsg && (
          <div className="p-3 bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 text-xs font-bold px-6 border-b border-rose-100 dark:border-rose-900">
            {errorMsg}
          </div>
        )}

        {/* Students Roll Call Table */}
        <div className="p-6 overflow-y-auto flex-1 space-y-2">
          {studentProfiles.map((student) => {
            const item = attendances[student.id] || {
              status: null,
              notes: '',
              excuseReason: '',
            };

            return (
              <div
                key={student.id}
                className="p-3 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 hover:border-slate-300 transition"
              >
                <div className="space-y-0.5">
                  <p className="text-xs font-bold text-slate-900 dark:text-white">
                    {student.display_name}
                  </p>
                  <p className="text-[11px] text-slate-500">
                    {student.institution || 'Sede'} · {student.residency_year || 'Residente'}
                  </p>
                </div>

                <div className="flex items-center gap-1.5 flex-wrap">
                  <button
                    type="button"
                    onClick={() => handleStatusChange(student.id, 'present')}
                    className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                      item.status === 'present'
                        ? 'bg-emerald-600 text-white shadow-2xs'
                        : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 hover:bg-slate-200'
                    }`}
                  >
                    <UserCheck className="w-3.5 h-3.5" />
                    <span>Presente</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleStatusChange(student.id, 'late')}
                    className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                      item.status === 'late'
                        ? 'bg-amber-600 text-white shadow-2xs'
                        : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 hover:bg-slate-200'
                    }`}
                  >
                    <Clock className="w-3.5 h-3.5" />
                    <span>Retardo</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleStatusChange(student.id, 'excused')}
                    className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                      item.status === 'excused'
                        ? 'bg-blue-600 text-white shadow-2xs'
                        : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 hover:bg-slate-200'
                    }`}
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Justificada</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleStatusChange(student.id, 'absent')}
                    className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                      item.status === 'absent'
                        ? 'bg-rose-600 text-white shadow-2xs'
                        : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 hover:bg-slate-200'
                    }`}
                  >
                    <UserX className="w-3.5 h-3.5" />
                    <span>Falta</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/40 shrink-0">
          <div className="text-xs text-slate-500">
            {success && (
              <span className="text-emerald-600 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" /> Asistencia guardada en Kardex
              </span>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 transition"
            >
              Cerrar
            </button>
            <button
              type="button"
              disabled={saving}
              onClick={handleSave}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Guardando...' : 'Asentar Asistencia'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
