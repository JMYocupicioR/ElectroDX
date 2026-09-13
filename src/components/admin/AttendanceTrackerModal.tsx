import { useState, useEffect } from 'react';
import {
  Calendar,
  CheckCircle2,
  Clock,
  UserCheck,
  UserX,
  ShieldCheck,
  X,
  Save,
  Users,
} from 'lucide-react';
import {
  DEFAULT_COURSE_SESSIONS,
  saveCohortAttendanceBatch,
  getStudentAttendance,
} from '../../services/attendanceService';
import type { AdminProfileRow } from '../../types/admin';
import type { AttendanceStatus, ClassAttendanceRecord } from '../../types/academicGradebook';

interface AttendanceTrackerModalProps {
  isOpen: boolean;
  onClose: () => void;
  profiles: AdminProfileRow[];
  onSaved: () => void;
}

export default function AttendanceTrackerModal({
  isOpen,
  onClose,
  profiles,
  onSaved,
}: AttendanceTrackerModalProps) {
  const [sessionTitle, setSessionTitle] = useState(DEFAULT_COURSE_SESSIONS[0].title);
  const [sessionDate, setSessionDate] = useState(DEFAULT_COURSE_SESSIONS[0].date);
  const [attendances, setAttendances] = useState<
    Record<string, { status: AttendanceStatus; notes: string }>
  >({});
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setSuccess(false);
      // Cargar asistencias existentes o inicializar en 'present'
      const initial: Record<string, { status: AttendanceStatus; notes: string }> = {};
      profiles.forEach((p) => {
        initial[p.id] = { status: 'present', notes: '' };
      });

      // Intentar pre-cargar si ya se guardó para esta sesión
      Promise.all(
        profiles.map(async (p) => {
          const list = await getStudentAttendance(p.id);
          const found = list.find((r) => r.session_title === sessionTitle && r.session_date === sessionDate);
          if (found) {
            initial[p.id] = { status: found.status, notes: found.notes || '' };
          }
        })
      ).then(() => {
        setAttendances({ ...initial });
      });
    }
  }, [isOpen, sessionTitle, sessionDate, profiles]);

  if (!isOpen) return null;

  const handleStatusChange = (studentId: string, status: AttendanceStatus) => {
    setAttendances((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        status,
      },
    }));
  };

  const handleNotesChange = (studentId: string, notes: string) => {
    setAttendances((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        notes,
      },
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const records: ClassAttendanceRecord[] = profiles.map((p) => {
        const item = attendances[p.id] || { status: 'present', notes: '' };
        return {
          id: `att_${p.id}_${Date.now()}`,
          session_title: sessionTitle,
          session_date: sessionDate,
          student_id: p.id,
          status: item.status,
          notes: item.notes || null,
          created_at: new Date().toISOString(),
        };
      });

      await saveCohortAttendanceBatch(records);
      setSuccess(true);
      setTimeout(() => {
        onSaved();
        onClose();
      }, 700);
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs">
      <div className="relative w-full max-w-3xl bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/40 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black text-slate-900 dark:text-white">
                Pase de Lista y Asistencia a Clases
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Registra la asistencia a talleres clínicos en vivo para el Kardex oficial
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Session Selector */}
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-800/20 grid grid-cols-1 sm:grid-cols-2 gap-4 shrink-0">
          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
              Seleccionar Clase o Taller en Vivo
            </label>
            <input
              list="sessions-list"
              value={sessionTitle}
              onChange={(e) => setSessionTitle(e.target.value)}
              className="w-full p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold"
            />
            <datalist id="sessions-list">
              {DEFAULT_COURSE_SESSIONS.map((s) => (
                <option key={s.title} value={s.title} />
              ))}
            </datalist>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
              Fecha de la Sesión
            </label>
            <input
              type="date"
              value={sessionDate}
              onChange={(e) => setSessionDate(e.target.value)}
              className="w-full p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold"
            />
          </div>
        </div>

        {/* Students Roll Call Table */}
        <div className="p-6 overflow-y-auto flex-1 space-y-3">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
            Lista de Médicos Cursistas ({profiles.length})
          </label>

          <div className="divide-y divide-slate-100 dark:divide-slate-800 rounded-2xl border border-slate-200/80 dark:border-slate-800 overflow-hidden">
            {profiles.map((student) => {
              const currentStatus = attendances[student.id]?.status || 'present';
              const currentNotes = attendances[student.id]?.notes || '';

              return (
                <div
                  key={student.id}
                  className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition"
                >
                  <div className="space-y-0.5">
                    <p className="text-xs font-bold text-slate-900 dark:text-white">
                      {student.display_name}
                    </p>
                    <p className="text-[11px] text-slate-500">
                      {student.residency_year || 'Residente'} · {student.institution || 'Sede'}
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5 flex-wrap">
                    <button
                      type="button"
                      onClick={() => handleStatusChange(student.id, 'present')}
                      className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                        currentStatus === 'present'
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
                        currentStatus === 'late'
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
                        currentStatus === 'excused'
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
                        currentStatus === 'absent'
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
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3 bg-slate-50/50 dark:bg-slate-800/40 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs transition disabled:opacity-50 cursor-pointer"
          >
            {saving ? (
              <span>Guardando asistencias...</span>
            ) : success ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                <span>¡Asistencia Guardada!</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Asentar Asistencia</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
