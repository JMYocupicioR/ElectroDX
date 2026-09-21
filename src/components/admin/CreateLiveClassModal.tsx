import React, { useState, useEffect } from 'react';
import {
  X,
  Video,
  Calendar,
  Clock,
  BookOpen,
  Link as LinkIcon,
  CheckCircle2,
  AlertCircle,
  FileVideo,
  Radio,
  Sliders,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthProvider';
import { createWorkshop, getWorkshops, updateWorkshop } from '../../services/courseService';
import { allModules } from '../../content/modules';
import type { LiveWorkshop } from '../../types/database';

interface CreateLiveClassModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void | boolean | Promise<void | boolean>;
  initialWorkshop?: LiveWorkshop | null;
  initialScheduledAt?: string;
  initialModuleId?: string;
  initialTopicId?: string | null;
}

export function CreateLiveClassModal({
  isOpen,
  onClose,
  onSuccess,
  initialWorkshop,
  initialScheduledAt,
  initialModuleId,
  initialTopicId,
}: CreateLiveClassModalProps) {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'create' | 'update_recording'>(
    initialWorkshop ? 'update_recording' : 'create'
  );

  // Form state for creating a live class
  const [title, setTitle] = useState('');
  const [moduleId, setModuleId] = useState(allModules[0]?.id || 'module-01');
  const [topicId, setTopicId] = useState<string | null>(null);
  const [scheduledAt, setScheduledAt] = useState('');
  const [durationMinutes, setDurationMinutes] = useState(90);
  const [sessionModality, setSessionModality] = useState<'online' | 'in_person'>('online');
  const [streamUrl, setStreamUrl] = useState('');
  const [recordingUrl, setRecordingUrl] = useState('');
  const [countsForKardex, setCountsForKardex] = useState(true);
  const [description, setDescription] = useState('');

  // Form state for updating existing recordings
  const [existingWorkshops, setExistingWorkshops] = useState<LiveWorkshop[]>([]);
  const [selectedWorkshopId, setSelectedWorkshopId] = useState('');
  const [targetRecordingUrl, setTargetRecordingUrl] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Initialize defaults
  useEffect(() => {
    if (isOpen) {
      setError(null);
      setSuccess(null);

      if (initialModuleId) {
        setModuleId(initialModuleId);
      }
      setTopicId(initialTopicId ?? null);

      if (initialScheduledAt) {
        setScheduledAt(initialScheduledAt);
      } else {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(19, 0, 0, 0);
        const tzOffset = tomorrow.getTimezoneOffset() * 60000;
        const localISOTime = new Date(tomorrow.getTime() - tzOffset).toISOString().slice(0, 16);
        setScheduledAt(localISOTime);
      }

      getWorkshops()
        .then((ws) => {
          setExistingWorkshops(ws);
          if (initialWorkshop) {
            setSelectedWorkshopId(initialWorkshop.id);
            setTargetRecordingUrl(initialWorkshop.recording_url || '');
            setActiveTab('update_recording');
          } else if (ws.length > 0) {
            setSelectedWorkshopId(ws[0].id);
            setTargetRecordingUrl(ws[0].recording_url || '');
          }
        })
        .catch((err: unknown) => {
          const message = err instanceof Error ? err.message : 'No se pudieron cargar los talleres.';
          setError(message);
        });
    }
  }, [isOpen, initialWorkshop, initialScheduledAt, initialModuleId, initialTopicId]);

  // When selected workshop changes in update tab
  const handleSelectExisting = (wId: string) => {
    setSelectedWorkshopId(wId);
    const target = existingWorkshops.find((w) => w.id === wId);
    if (target) {
      setTargetRecordingUrl(target.recording_url || '');
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !scheduledAt || !moduleId) {
      setError('Por favor completa todos los campos requeridos.');
      return;
    }

    if (!user?.id) {
      setError('Debes iniciar sesión para programar una clase.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await createWorkshop({
        title: title.trim(),
        module_id: moduleId,
        topic_id: topicId,
        description: description.trim() || null,
        scheduled_at: new Date(scheduledAt).toISOString(),
        duration_minutes: durationMinutes,
        stream_url: streamUrl.trim() || null,
        recording_url: recordingUrl.trim() || null,
        max_capacity: 100,
        clinical_case_revision_id: null,
        clinical_case_json: null,
        status: 'scheduled',
        session_modality: sessionModality,
        session_type: sessionModality === 'online' ? 'masterclass' : 'hands_on_presencial',
        counts_for_kardex: countsForKardex,
        created_by: user.id,
      });

      setSuccess('¡Clase programada exitosamente con enlaces asignados!');
      const reloaded = await onSuccess?.();
      if (reloaded === false) {
        setSuccess('La clase se guardó, pero el calendario no pudo recargar los talleres. Usa Reintentar.');
        return;
      }
      setTimeout(() => {
        onClose();
      }, 1200);
    } catch (err: any) {
      setError(err?.message || 'Error al programar la clase en vivo.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateRecording = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedWorkshopId) {
      setError('Selecciona una clase de la lista.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await updateWorkshop(selectedWorkshopId, {
        recording_url: targetRecordingUrl.trim() || null,
        status: targetRecordingUrl.trim() ? 'completed' : undefined,
      });

      setSuccess('¡Enlace de grabación guardado y disponible para los alumnos!');
      const reloaded = await onSuccess?.();
      if (reloaded === false) {
        setSuccess('La grabación se guardó, pero el calendario no pudo recargar los talleres. Usa Reintentar.');
        return;
      }
      setTimeout(() => {
        onClose();
      }, 1200);
    } catch (err: any) {
      setError(err?.message || 'Error al actualizar la grabación.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden z-10 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 bg-gradient-to-r from-rose-500/10 via-indigo-500/5 to-transparent flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-rose-600 to-red-600 text-white flex items-center justify-center shadow-md shadow-rose-500/20">
              <Video className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black text-slate-900 dark:text-white">
                Gestor de Clases en Vivo y Grabaciones
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Programa sesiones en tiempo real o añade enlaces de clases grabadas (Drive / YouTube).
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

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 p-1.5 gap-1.5 text-xs font-bold">
          <button
            type="button"
            onClick={() => {
              setActiveTab('create');
              setError(null);
            }}
            className={`flex-1 py-2 px-3 rounded-xl transition flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'create'
                ? 'bg-white dark:bg-slate-800 text-rose-600 dark:text-rose-400 shadow-xs'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Radio className="w-3.5 h-3.5" />
            <span>Programar Nueva Clase en Vivo</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('update_recording');
              setError(null);
            }}
            className={`flex-1 py-2 px-3 rounded-xl transition flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'update_recording'
                ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-xs'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <FileVideo className="w-3.5 h-3.5" />
            <span>Agregar / Cambiar Grabación de Clase</span>
          </button>
        </div>

        {/* Content Area */}
        <div className="p-6 overflow-y-auto space-y-4">
          {error && (
            <div className="p-3.5 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 text-red-700 dark:text-red-300 text-xs font-medium flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 text-emerald-700 dark:text-emerald-300 text-xs font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{success}</span>
            </div>
          )}

          {activeTab === 'create' ? (
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Título de la Clase / Sesión *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ej: Masterclass de Radiculopatías Cervicales y Plexo Braquial"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-semibold focus:ring-2 focus:ring-rose-500/20 outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Módulo Académico *
                  </label>
                  <select
                    value={moduleId}
                    onChange={(e) => setModuleId(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-semibold outline-none"
                  >
                    {allModules.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Modalidad
                  </label>
                  <select
                    value={sessionModality}
                    onChange={(e) => setSessionModality(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-semibold outline-none"
                  >
                    <option value="online">En línea (Zoom / Streaming)</option>
                    <option value="in_person">Presencial (Aula / Laboratorio EMG)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Fecha y Hora Programada *
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={scheduledAt}
                    onChange={(e) => setScheduledAt(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-semibold outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Duración Estimada (minutos)
                  </label>
                  <input
                    type="number"
                    min={15}
                    max={360}
                    step={15}
                    value={durationMinutes}
                    onChange={(e) => setDurationMinutes(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-semibold outline-none"
                  />
                </div>
              </div>

              {/* Enlaces: En Vivo y Grabado */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700 space-y-3">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                  <LinkIcon className="w-3.5 h-3.5 text-rose-500" />
                  Enlaces de Transmisión y Grabación
                </h4>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Link de la Clase en Vivo (Zoom, Google Meet, Teams, etc.)
                  </label>
                  <input
                    type="url"
                    value={streamUrl}
                    onChange={(e) => setStreamUrl(e.target.value)}
                    placeholder="https://zoom.us/j/... o https://meet.google.com/..."
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs outline-none"
                  />
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    Los alumnos verán el botón para unirse directamente a la sesión en vivo.
                  </p>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Link de la Clase Grabada (Google Drive, YouTube, Vimeo, etc.)
                  </label>
                  <input
                    type="url"
                    value={recordingUrl}
                    onChange={(e) => setRecordingUrl(e.target.value)}
                    placeholder="https://drive.google.com/... o https://youtube.com/watch?v=..."
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs outline-none"
                  />
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    Opcional por ahora: puedes dejarlo en blanco y añadir el enlace cuando la grabación esté lista.
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Descripción o Temario del Taller
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Temas clínicos a revisar, casos de estudio y objetivos de la clase..."
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs outline-none"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="countsForKardex"
                  checked={countsForKardex}
                  onChange={(e) => setCountsForKardex(e.target.checked)}
                  className="rounded-sm text-rose-600 focus:ring-rose-500 w-4 h-4 cursor-pointer"
                />
                <label
                  htmlFor="countsForKardex"
                  className="text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer"
                >
                  Computa oficialmente para el 20% de asistencia del Kardex
                </label>
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white text-xs font-bold shadow-md shadow-rose-500/20 transition cursor-pointer disabled:opacity-50"
                >
                  {loading ? 'Guardando...' : 'Guardar y Programar Clase'}
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleUpdateRecording} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Selecciona la Clase / Taller Clínico *
                </label>
                <select
                  value={selectedWorkshopId}
                  onChange={(e) => handleSelectExisting(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-semibold outline-none"
                >
                  {existingWorkshops.length === 0 && <option value="">No hay clases creadas aún</option>}
                  {existingWorkshops.map((w) => {
                    const date = new Date(w.scheduled_at).toLocaleDateString('es-MX', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    });
                    const hasRec = Boolean(w.recording_url);
                    return (
                      <option key={w.id} value={w.id}>
                        {date} — {w.title} {hasRec ? '✓ (Tiene grabación)' : '⚠️ (Sin grabación)'}
                      </option>
                    );
                  })}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Enlace de la Clase Grabada (YouTube, Google Drive, Vimeo, etc.) *
                </label>
                <input
                  type="url"
                  required
                  value={targetRecordingUrl}
                  onChange={(e) => setTargetRecordingUrl(e.target.value)}
                  placeholder="https://drive.google.com/file/d/... o https://youtube.com/watch?v=..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-semibold outline-none"
                />
                <p className="text-[11px] text-slate-400 mt-1.5 leading-relaxed">
                  Al ingresar este enlace, la clase quedará disponible de inmediato en la biblioteca de grabaciones para que los alumnos cursistas puedan verla las veces que necesiten.
                </p>
              </div>

              <div className="flex justify-end gap-2.5 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading || !selectedWorkshopId}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white text-xs font-bold shadow-md shadow-indigo-500/20 transition cursor-pointer disabled:opacity-50"
                >
                  {loading ? 'Actualizando...' : 'Guardar Enlace de Grabación'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
