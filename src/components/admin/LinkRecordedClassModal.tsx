import { useEffect, useMemo, useState } from 'react';
import { CheckCircle2, Loader2, Search, Video, X } from 'lucide-react';
import { useAuth } from '../../contexts/AuthProvider';
import { getWorkshops } from '../../services/courseService';
import { linkRecordedWorkshopToTopic } from '../../services/linkRecordedClassService';
import type { LiveWorkshop } from '../../types/database';
import { isRecordedWorkshop } from '../../utils/recordedWorkshopTopics';

export interface LinkRecordedClassTopicOption {
  id: string;
  title: string;
  depth?: number;
}

interface LinkRecordedClassModalProps {
  isOpen: boolean;
  onClose: () => void;
  moduleId: string;
  topicId: string;
  topicTitle?: string;
  currentWorkshopId?: string | null;
  topicOptions?: LinkRecordedClassTopicOption[];
  onSuccess: (workshop: LiveWorkshop) => void | Promise<void>;
}

function formatDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Sin fecha';
  return date.toLocaleDateString('es-MX', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export function LinkRecordedClassModal({
  isOpen,
  onClose,
  moduleId,
  topicId,
  topicTitle,
  currentWorkshopId,
  topicOptions,
  onSuccess,
}: LinkRecordedClassModalProps) {
  const { user } = useAuth();
  const [workshops, setWorkshops] = useState<LiveWorkshop[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(currentWorkshopId ?? null);
  const [targetId, setTargetId] = useState(topicId);

  useEffect(() => {
    if (!isOpen) return;
    setQuery('');
    setError(null);
    setSelectedId(currentWorkshopId ?? null);
    setTargetId(topicId);
    setLoading(true);
    void getWorkshops()
      .then((rows) => setWorkshops(rows.filter(isRecordedWorkshop)))
      .catch((err) => {
        console.error('[LinkRecordedClassModal]', err);
        setError(err instanceof Error ? err.message : 'No se pudieron cargar las clases grabadas.');
      })
      .finally(() => setLoading(false));
  }, [isOpen, currentWorkshopId, topicId]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return workshops;
    return workshops.filter((w) => {
      const hay = `${w.title} ${w.description ?? ''} ${w.module_id}`.toLowerCase();
      return hay.includes(q);
    });
  }, [workshops, query]);

  if (!isOpen) return null;

  const hasTargetOptions = Boolean(topicOptions && topicOptions.length > 1);
  const selectedTargetTitle =
    topicOptions?.find((option) => option.id === targetId)?.title ?? topicTitle;

  const handleSave = async () => {
    if (!user?.id) {
      setError('Debes iniciar sesión para vincular la clase.');
      return;
    }
    const workshop = workshops.find((w) => w.id === selectedId);
    if (!workshop) {
      setError('Selecciona una clase grabada de la lista.');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const updated = await linkRecordedWorkshopToTopic({
        workshop,
        topicId: targetId,
        moduleId,
        userId: user.id,
      });
      await onSuccess(updated);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo vincular la clase.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4">
      <button
        type="button"
        aria-label="Cerrar"
        className="absolute inset-0 bg-slate-950/60 backdrop-blur-[2px]"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="link-recorded-class-title"
        className="relative w-full sm:max-w-lg max-h-[88vh] flex flex-col rounded-t-2xl sm:rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-2xl"
      >
        <div className="flex items-start gap-3 px-4 py-3 border-b border-slate-100 dark:border-slate-800">
          <div className="mt-0.5 p-2 rounded-xl bg-violet-50 dark:bg-violet-950/40 text-violet-600 dark:text-violet-300">
            <Video className="w-4 h-4" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 id="link-recorded-class-title" className="text-sm font-bold text-slate-900 dark:text-slate-100">
              Vincular clase grabada
            </h2>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              Reutiliza un taller existente. No se duplica en la biblioteca.
              {selectedTargetTitle ? (
                <>
                  {' '}
                  Tema: <span className="font-semibold text-slate-700 dark:text-slate-200">{selectedTargetTitle}</span>
                </>
              ) : null}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            aria-label="Cerrar diálogo"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {hasTargetOptions ? (
          <div className="px-4 pt-3">
            <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">
              ¿A qué tema o subtema se vincula?
            </label>
            <select
              value={targetId}
              onChange={(e) => setTargetId(e.target.value)}
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-violet-500/40"
            >
              {topicOptions?.map((option) => (
                <option key={option.id} value={option.id}>
                  {`${'— '.repeat(option.depth ?? 0)}${option.title}`}
                </option>
              ))}
            </select>
          </div>
        ) : null}

        <div className="px-4 pt-3">
          <label className="relative block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar clase grabada..."
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-sm text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500/40"
            />
          </label>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-1.5 min-h-[220px]">
          {loading ? (
            <div className="flex items-center justify-center gap-2 py-10 text-sm text-slate-500">
              <Loader2 className="w-4 h-4 animate-spin" />
              Cargando grabaciones...
            </div>
          ) : filtered.length === 0 ? (
            <p className="text-sm text-slate-500 text-center py-10">
              No hay clases con grabación{query.trim() ? ' que coincidan' : ''}.
            </p>
          ) : (
            filtered.map((workshop) => {
              const selected = selectedId === workshop.id;
              return (
                <button
                  key={workshop.id}
                  type="button"
                  onClick={() => setSelectedId(workshop.id)}
                  className={`w-full text-left px-3 py-2.5 rounded-xl border transition-colors ${
                    selected
                      ? 'border-violet-500 bg-violet-50 dark:bg-violet-950/30'
                      : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                  }`}
                >
                  <div className="flex items-start gap-2">
                    <Video
                      className={`w-4 h-4 mt-0.5 flex-shrink-0 ${
                        selected ? 'text-violet-600 dark:text-violet-300' : 'text-slate-400'
                      }`}
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 truncate">
                        {workshop.title}
                      </p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        {formatDate(workshop.scheduled_at)}
                        {workshop.duration_minutes ? ` · ${workshop.duration_minutes} min` : ''}
                      </p>
                    </div>
                    {selected && <CheckCircle2 className="w-4 h-4 text-violet-600 dark:text-violet-300 flex-shrink-0" />}
                  </div>
                </button>
              );
            })
          )}
        </div>

        {error && (
          <p className="px-4 pb-2 text-xs font-medium text-rose-600 dark:text-rose-400">{error}</p>
        )}

        <div className="flex items-center justify-end gap-2 px-4 py-3 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            Cancelar
          </button>
          <button
            type="button"
            disabled={saving || !selectedId}
            onClick={() => void handleSave()}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-violet-600 hover:bg-violet-700 disabled:opacity-50 disabled:pointer-events-none"
          >
            {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Video className="w-3.5 h-3.5" />}
            Vincular al tema
          </button>
        </div>
      </div>
    </div>
  );
}

export default LinkRecordedClassModal;
