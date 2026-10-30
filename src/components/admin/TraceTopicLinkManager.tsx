import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  findTopicOccurrencesForTrace,
  attachTraceToTopic,
  detachTraceFromTopic,
  type TraceTopicOccurrence,
} from '../../services/traceTopicLinkService';
import { allModules } from '../../content/modules';
import { useAuth } from '../../contexts/AuthProvider';
import {
  BookOpen,
  ExternalLink,
  Plus,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Layers,
  Sparkles,
  Link2,
} from 'lucide-react';

interface TraceTopicLinkManagerProps {
  presetId: string;
  presetTitle: string;
}

export function TraceTopicLinkManager({ presetId, presetTitle }: TraceTopicLinkManagerProps) {
  const { user, profile, isAdmin, isEditor } = useAuth();
  const canEdit = isAdmin || isEditor;

  const [occurrences, setOccurrences] = useState<TraceTopicOccurrence[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Estados para vincular a un nuevo tema
  const [isAdding, setIsAdding] = useState(false);
  const [selectedModuleId, setSelectedModuleId] = useState<string>(allModules[0]?.id || '');
  const [selectedTopicId, setSelectedTopicId] = useState<string>('');
  const [traceMode, setTraceMode] = useState<'comparison' | 'static' | 'interactive'>('comparison');
  const [saving, setSaving] = useState(false);

  const loadOccurrences = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await findTopicOccurrencesForTrace(presetId);
      setOccurrences(data);
    } catch (err: any) {
      setError(err?.message || 'Error al buscar los temas asociados');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadOccurrences();
  }, [presetId]);

  // Obtener los subtemas del módulo seleccionado
  const currentModule = allModules.find((m) => m.id === selectedModuleId);
  const moduleTopics = currentModule ? currentModule.topics : [];

  // Al cambiar módulo, seleccionar el primer tema por defecto
  useEffect(() => {
    if (moduleTopics.length > 0 && !selectedTopicId) {
      // Buscar el primer subtema hoja si existe
      const first = moduleTopics[0]?.children?.[0]?.id || moduleTopics[0]?.id || '';
      setSelectedTopicId(first);
    }
  }, [selectedModuleId, moduleTopics, selectedTopicId]);

  const handleAttach = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!selectedModuleId || !selectedTopicId) {
      setError('Por favor selecciona un módulo y tema válido.');
      return;
    }

    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      await attachTraceToTopic({
        presetId,
        moduleId: selectedModuleId,
        topicId: selectedTopicId,
        authorId: user.id,
        authorName: profile?.display_name || 'Profesor Docente',
        mode: traceMode,
      });

      setSuccess('¡Trazo vinculado e incrustado con éxito en el tema!');
      setIsAdding(false);
      await loadOccurrences();
      setTimeout(() => setSuccess(null), 4000);
    } catch (err: any) {
      setError(err?.message || 'No se pudo vincular el trazo al tema.');
    } finally {
      setSaving(false);
    }
  };

  const handleDetach = async (occ: TraceTopicOccurrence) => {
    if (!user) return;
    if (!confirm(`¿Deseas desvincular este trazo de «${occ.topicTitle}»?`)) return;

    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      await detachTraceFromTopic({
        presetId,
        moduleId: occ.moduleId,
        topicId: occ.topicId,
        authorId: user.id,
        authorName: profile?.display_name || 'Profesor Docente',
      });

      setSuccess('Trazo retirado del tema correctamente.');
      await loadOccurrences();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err?.message || 'No se pudo desvincular el trazo.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="rounded-2xl border border-indigo-100 dark:border-indigo-950/80 bg-white dark:bg-slate-900/90 p-4 sm:p-5 shadow-xs space-y-4">
      {/* Cabecera */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 shrink-0 shadow-2xs">
            <BookOpen className="w-5 h-5" />
          </span>
          <div>
            <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span>Temas del Curso donde aparece este Trazo</span>
              <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                {occurrences.length} {occurrences.length === 1 ? 'ubicación' : 'ubicaciones'}
              </span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Identifica en qué lecciones del temario está incrustado el ejercicio, ábrelas directamente o vincúlalo a un nuevo tema.
            </p>
          </div>
        </div>

        {canEdit && (
          <button
            type="button"
            onClick={() => {
              setIsAdding((v) => !v);
              setError(null);
            }}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-2xs transition cursor-pointer self-start sm:self-auto"
          >
            {isAdding ? (
              <span>Cancelar</span>
            ) : (
              <>
                <Plus className="w-3.5 h-3.5" />
                <span>Incrustar en otro Tema</span>
              </>
            )}
          </button>
        )}
      </div>

      {/* Alertas */}
      {error && (
        <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}
      {success && (
        <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 text-xs text-emerald-700 dark:text-emerald-300 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {/* Formulario para incrustar en otro tema */}
      {isAdding && (
        <form
          onSubmit={handleAttach}
          className="p-4 rounded-2xl border border-indigo-200 dark:border-indigo-900/60 bg-indigo-50/40 dark:bg-indigo-950/20 space-y-3"
        >
          <div className="flex items-center gap-2 text-xs font-bold text-indigo-900 dark:text-indigo-200">
            <Sparkles className="w-4 h-4 text-indigo-500" />
            <span>Seleccionar Tema de Destino para «{presetTitle}»:</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Selector de Módulo */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                Módulo del diplomado:
              </label>
              <select
                value={selectedModuleId}
                onChange={(e) => {
                  setSelectedModuleId(e.target.value);
                  setSelectedTopicId('');
                }}
                className="w-full px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-200 outline-none"
              >
                {allModules.map((m) => (
                  <option key={m.id} value={m.id}>
                    M{m.number}: {m.title.split(':')[0]}
                  </option>
                ))}
              </select>
            </div>

            {/* Selector de Tema */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                Tema / Lección:
              </label>
              <select
                value={selectedTopicId}
                onChange={(e) => setSelectedTopicId(e.target.value)}
                className="w-full px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-200 outline-none"
              >
                {moduleTopics.flatMap((t) => {
                  if (t.children && t.children.length > 0) {
                    return t.children.map((sub) => (
                      <option key={sub.id} value={sub.id}>
                        {t.title} / {sub.title}
                      </option>
                    ));
                  }
                  return (
                    <option key={t.id} value={t.id}>
                      {t.title}
                    </option>
                  );
                })}
              </select>
            </div>

            {/* Modo de interacción */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                Modo en el tema:
              </label>
              <select
                value={traceMode}
                onChange={(e) => setTraceMode(e.target.value as any)}
                className="w-full px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-200 outline-none"
              >
                <option value="comparison">Comparativo (Normal vs Patológico)</option>
                <option value="interactive">Interactivo completo con calibradores</option>
                <option value="static">Estático ilustrativo</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-200/50 dark:hover:bg-slate-800"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-1.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <Link2 className="w-3.5 h-3.5" />
              <span>{saving ? 'Incrustando…' : 'Incrustar en este Tema'}</span>
            </button>
          </div>
        </form>
      )}

      {/* Lista de temas actuales */}
      {loading ? (
        <div className="p-4 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 text-center text-xs text-slate-400">
          Escaneando temario del diplomado…
        </div>
      ) : occurrences.length === 0 ? (
        <div className="p-4 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 text-center space-y-1">
          <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">
            Este ejercicio aún no está incrustado en ningún tema del curso.
          </p>
          <p className="text-[11px] text-slate-400">
            Haz clic en <strong>«Incrustar en otro Tema»</strong> arriba para agregarlo al contenido de cualquier lección.
          </p>
        </div>
      ) : (
        <div className="divide-y divide-slate-100 dark:divide-slate-800/80 rounded-xl border border-slate-200/80 dark:border-slate-800 overflow-hidden">
          {occurrences.map((occ, idx) => (
            <div
              key={`${occ.moduleId}-${occ.topicId}-${idx}`}
              className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition"
            >
              <div className="space-y-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                    Módulo {occ.moduleNumber}
                  </span>
                  <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                    {occ.topicTitle}
                  </span>
                  {occ.source === 'published' && (
                    <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-cyan-50 dark:bg-cyan-950 text-cyan-700 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-800">
                      Editorial Supabase
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate flex items-center gap-1.5">
                  <Layers className="w-3 h-3 text-slate-400" />
                  <span>{occ.moduleTitle}</span>
                </p>
              </div>

              {/* Acciones */}
              <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
                <Link
                  to={occ.publicUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-indigo-200 dark:border-indigo-800/80 bg-indigo-50/70 hover:bg-indigo-100 dark:bg-indigo-950/40 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 text-xs font-bold transition shadow-2xs"
                  title="Abrir este tema en una nueva pestaña para ver el ejercicio como lo ve el alumno"
                >
                  <span>Abrir Tema</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>

                {canEdit && (
                  <button
                    type="button"
                    disabled={saving}
                    onClick={() => handleDetach(occ)}
                    className="p-1.5 rounded-xl border border-rose-200 dark:border-rose-900/60 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition cursor-pointer disabled:opacity-50"
                    title="Retirar este trazo de este tema"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

