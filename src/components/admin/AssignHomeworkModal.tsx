import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { Calendar, CheckCircle2, ClipboardList, Search, Sparkles, Users, X } from 'lucide-react';
import { createBatchAssignments } from '../../services/studentPlanService';
import { getAdminProfiles } from '../../services/editorialService';
import { filterGradeableStudents } from '../../utils/adminUtils';
import { useAuth } from '../../contexts/AuthProvider';
import type { AdminProfileRow } from '../../types/admin';
import type { AssignmentPriority } from '../../types/studentPlan';

interface AssignHomeworkModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAssigned?: () => void | boolean | Promise<void | boolean>;
  initialStudentId?: string;
  initialStudentName?: string;
  initialDueDate?: string;
  profiles?: AdminProfileRow[];
}

export default function AssignHomeworkModal({
  isOpen,
  onClose,
  onAssigned,
  initialStudentId,
  initialStudentName,
  initialDueDate,
  profiles: initialProfiles,
}: AssignHomeworkModalProps) {
  const { user } = useAuth();
  const [profiles, setProfiles] = useState<AdminProfileRow[]>(initialProfiles || []);
  const [loadingProfiles, setLoadingProfiles] = useState(false);
  const [targetScope, setTargetScope] = useState<'single' | 'selected' | 'cohort'>(
    initialStudentId ? 'single' : 'cohort'
  );
  const [selectedStudentIds, setSelectedStudentIds] = useState<Set<string>>(
    initialStudentId ? new Set([initialStudentId]) : new Set()
  );
  const [studentSearch, setStudentSearch] = useState('');
  const [studentResidencyFilter, setStudentResidencyFilter] = useState('all');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<AssignmentPriority>('normal');
  const [dueDate, setDueDate] = useState(() => {
    const d = new Date(Date.now() + 7 * 86400000);
    return d.toISOString().slice(0, 16);
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    setError(null);
    if (!initialProfiles || initialProfiles.length === 0) {
      setLoadingProfiles(true);
      getAdminProfiles(false, 'all')
        .then((data) => setProfiles(filterGradeableStudents(data)))
        .catch((err) => console.error(err))
        .finally(() => setLoadingProfiles(false));
    } else {
      setProfiles(filterGradeableStudents(initialProfiles));
    }
    if (initialStudentId) {
      setSelectedStudentIds(new Set([initialStudentId]));
      setTargetScope('single');
    } else {
      setTargetScope('cohort');
    }
    if (initialDueDate) setDueDate(initialDueDate);
  }, [isOpen, initialProfiles, initialStudentId, initialDueDate]);

  const filteredProfiles = useMemo(() => {
    return profiles.filter((profile) => {
      const q = studentSearch.toLowerCase();
      const matchSearch =
        profile.display_name.toLowerCase().includes(q) ||
        profile.email.toLowerCase().includes(q) ||
        (profile.institution && profile.institution.toLowerCase().includes(q)) ||
        (profile.cedula_profesional && profile.cedula_profesional.includes(q));
      const matchRes =
        studentResidencyFilter === 'all' ||
        (profile.residency_year || '').toLowerCase().includes(studentResidencyFilter.toLowerCase());
      return matchSearch && matchRes;
    });
  }, [profiles, studentSearch, studentResidencyFilter]);

  const finalRecipientIds = useMemo(() => {
    if (targetScope === 'single') return initialStudentId ? [initialStudentId] : [];
    if (targetScope === 'cohort') return profiles.map((profile) => profile.id);
    return Array.from(selectedStudentIds);
  }, [targetScope, initialStudentId, profiles, selectedStudentIds]);

  const toggleStudentSelected = (id: string) => {
    setSelectedStudentIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleSelectAllStudents = () => {
    if (selectedStudentIds.size === filteredProfiles.length) {
      setSelectedStudentIds(new Set());
    } else {
      setSelectedStudentIds(new Set(filteredProfiles.map((profile) => profile.id)));
    }
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (finalRecipientIds.length === 0) {
      setError('Elige al menos un alumno.');
      return;
    }
    if (!title.trim()) {
      setError('Escribe un título para la tarea.');
      return;
    }
    if (!dueDate) {
      setError('Indica la fecha límite.');
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      const created = await createBatchAssignments(finalRecipientIds, {
        title: title.trim(),
        type: 'practical_task',
        description:
          description.trim() ||
          'Entrega un archivo (PDF o imagen) o un enlace de Drive, OneDrive o Dropbox.',
        due_date: new Date(dueDate).toISOString(),
        status: 'pending',
        priority,
        assigned_by: user?.id ?? null,
      });
      if (created.length === 0) {
        throw new Error('No se pudo asignar la tarea. Revisa la conexión e inténtalo de nuevo.');
      }
      const reloaded = await onAssigned?.();
      if (reloaded === false) {
        setError('La tarea se asignó, pero la lista no se pudo recargar. Usa Reintentar.');
        return;
      }
      setTitle('');
      setDescription('');
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo enviar la tarea.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col max-h-[92vh] overflow-hidden my-auto">
        <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center">
              <ClipboardList className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Nueva tarea</h2>
              <p className="text-xs text-slate-500">
                La misma entrega para toda la cohorte o para los alumnos que elijas
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            aria-label="Cerrar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5 text-xs">
          <div className="p-4 rounded-2xl bg-slate-50/80 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/60 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-amber-600" />
                <span className="font-bold text-slate-800 dark:text-slate-200 text-sm">Destinatarios</span>
              </div>
              <div className="flex items-center gap-1 bg-white dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
                {initialStudentId && (
                  <button
                    type="button"
                    onClick={() => setTargetScope('single')}
                    className={`px-2.5 py-1 rounded-lg font-semibold transition ${
                      targetScope === 'single' ? 'bg-amber-500 text-white' : 'text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    Este alumno
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setTargetScope('selected')}
                  className={`px-2.5 py-1 rounded-lg font-semibold transition ${
                    targetScope === 'selected' ? 'bg-amber-500 text-white' : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  Elegir ({selectedStudentIds.size})
                </button>
                <button
                  type="button"
                  onClick={() => setTargetScope('cohort')}
                  className={`px-2.5 py-1 rounded-lg font-semibold transition ${
                    targetScope === 'cohort' ? 'bg-amber-500 text-white' : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  Toda la cohorte ({profiles.length})
                </button>
              </div>
            </div>

            {targetScope === 'single' ? (
              <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700">
                <p className="font-bold text-slate-800 dark:text-slate-200">
                  {initialStudentName || 'Alumno actual'}
                </p>
                <p className="text-[11px] text-slate-500">La tarea queda solo en este expediente.</p>
              </div>
            ) : targetScope === 'cohort' ? (
              <div className="p-3 bg-amber-50 dark:bg-amber-950/40 rounded-xl border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-100 flex items-center gap-2">
                <Sparkles className="w-4 h-4 shrink-0" />
                <span>
                  Se crea la misma tarea para los <strong>{profiles.length} médicos cursistas</strong>.
                </span>
              </div>
            ) : (
              <div className="space-y-2 bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
                <div className="flex flex-col sm:flex-row gap-2">
                  <div className="relative flex-1">
                    <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Buscar por nombre, correo o cédula..."
                      value={studentSearch}
                      onChange={(event) => setStudentSearch(event.target.value)}
                      className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                    />
                  </div>
                  <select
                    value={studentResidencyFilter}
                    onChange={(event) => setStudentResidencyFilter(event.target.value)}
                    className="py-1.5 px-2.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                  >
                    <option value="all">Todos los grados</option>
                    <option value="R1">Solo R1</option>
                    <option value="R2">Solo R2</option>
                    <option value="R3">Solo R3</option>
                    <option value="R4">Solo R4</option>
                  </select>
                  <button
                    type="button"
                    onClick={handleSelectAllStudents}
                    className="px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 font-semibold whitespace-nowrap"
                  >
                    {selectedStudentIds.size === filteredProfiles.length ? 'Quitar todos' : 'Marcar todos'}
                  </button>
                </div>
                <div className="max-h-40 overflow-y-auto space-y-1">
                  {loadingProfiles ? (
                    <p className="text-center py-3 text-slate-400">Cargando alumnos…</p>
                  ) : filteredProfiles.length === 0 ? (
                    <p className="text-center py-3 text-slate-400">No hay cursistas con este filtro.</p>
                  ) : (
                    filteredProfiles.map((profile) => (
                      <label
                        key={profile.id}
                        className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer"
                      >
                        <span className="flex items-center gap-2.5">
                          <input
                            type="checkbox"
                            checked={selectedStudentIds.has(profile.id)}
                            onChange={() => toggleStudentSelected(profile.id)}
                            className="rounded text-amber-600"
                          />
                          <span>
                            <span className="font-bold text-slate-800 dark:text-slate-200 block">
                              {profile.display_name}
                            </span>
                            <span className="text-[10px] text-slate-400">{profile.email}</span>
                          </span>
                        </span>
                        {profile.residency_year && (
                          <span className="text-[10px] font-bold text-amber-700 dark:text-amber-300">
                            {profile.residency_year}
                          </span>
                        )}
                      </label>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="space-y-3">
            <label className="block space-y-1">
              <span className="font-bold text-slate-700 dark:text-slate-300">Título</span>
              <input
                required
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="Ej. Reporte de latencias del mediano"
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
              />
            </label>
            <label className="block space-y-1">
              <span className="font-bold text-slate-700 dark:text-slate-300">Instrucciones</span>
              <textarea
                rows={4}
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="Qué debe entregar el alumno. Puede subir PDF/imagen o un enlace de Drive."
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
              />
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label className="block space-y-1">
                <span className="font-bold text-slate-700 dark:text-slate-300 inline-flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" /> Fecha límite
                </span>
                <input
                  type="datetime-local"
                  required
                  value={dueDate}
                  onChange={(event) => setDueDate(event.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                />
              </label>
              <label className="block space-y-1">
                <span className="font-bold text-slate-700 dark:text-slate-300">Prioridad</span>
                <select
                  value={priority}
                  onChange={(event) => setPriority(event.target.value as AssignmentPriority)}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                >
                  <option value="normal">Normal</option>
                  <option value="high">Alta</option>
                  <option value="urgent">Urgente</option>
                </select>
              </label>
            </div>
          </div>

          {error && <p className="text-rose-600 dark:text-rose-300 font-semibold">{error}</p>}

          <div className="flex items-center justify-between gap-3 pt-2 border-t border-slate-200 dark:border-slate-800">
            <p className="text-slate-500">
              Se enviará a <strong className="text-slate-800 dark:text-slate-200">{finalRecipientIds.length}</strong>{' '}
              alumno{finalRecipientIds.length === 1 ? '' : 's'}
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                disabled={submitting}
                className="px-4 py-2.5 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={submitting || finalRecipientIds.length === 0}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold disabled:opacity-50"
              >
                <CheckCircle2 className="w-4 h-4" />
                {submitting ? 'Enviando…' : 'Publicar tarea'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
