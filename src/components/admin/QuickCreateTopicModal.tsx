import { useState, useEffect } from 'react';
import { X, BookOpen, Plus, Sparkles, FileText, Lightbulb, Loader2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthProvider';
import { createTopicDirectly } from '../../services/editorialService';
import { slugify } from '../../utils/slugify';

interface QuickCreateTopicModalProps {
  isOpen: boolean;
  onClose: () => void;
  moduleId: string;
  moduleTitle?: string;
  parentId?: string | null;
  parentTitle?: string | null;
  onSuccess: (newTopicId: string) => void;
}

export function QuickCreateTopicModal({
  isOpen,
  onClose,
  moduleId,
  moduleTitle,
  parentId,
  parentTitle,
  onSuccess,
}: QuickCreateTopicModalProps) {
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [customSlug, setCustomSlug] = useState(false);
  const [description, setDescription] = useState('');
  const [content, setContent] = useState('');
  const [clinicalPearl, setClinicalPearl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isSubtopic = Boolean(parentId);

  // Auto-generate slug when title changes unless custom slug is explicitly edited
  useEffect(() => {
    if (!customSlug && title) {
      setSlug(slugify(title));
    }
  }, [title, customSlug]);

  // Reset form on open
  useEffect(() => {
    if (isOpen) {
      setTitle('');
      setSlug('');
      setCustomSlug(false);
      setDescription('');
      setContent('');
      setClinicalPearl('');
      setError(null);
      setLoading(false);
    }
  }, [isOpen, moduleId, parentId]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Por favor escribe un título para el tema.');
      return;
    }
    if (!user) {
      setError('Debes iniciar sesión con rol de administrador o editor.');
      return;
    }

    const finalSlug = (slug.trim() || slugify(title)).trim();
    if (!finalSlug) {
      setError('El identificador (slug) no puede estar vacío.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await createTopicDirectly({
        moduleId,
        parentId: parentId || null,
        topicId: finalSlug,
        title: title.trim(),
        description: description.trim() || undefined,
        content: content.trim() || undefined,
        clinicalPearls: clinicalPearl.trim() ? [clinicalPearl.trim()] : [],
        authorId: user.id,
      });

      onSuccess(res.id);
      onClose();
    } catch (err) {
      console.error('[QuickCreateTopicModal] error:', err);
      setError(err instanceof Error ? err.message : 'No se pudo crear el tema');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="quick-create-topic-title"
    >
      <div className="max-w-xl w-full rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden my-8">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-100 dark:bg-blue-950/70 text-blue-600 dark:text-cyan-400">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-cyan-400">
                {isSubtopic ? 'Nuevo Subtema' : 'Nuevo Tema'}
              </span>
              <h2 id="quick-create-topic-title" className="text-base font-extrabold text-slate-900 dark:text-white">
                {isSubtopic ? `Agregar Subtema a "${parentTitle ?? parentId}"` : `Agregar Tema en "${moduleTitle ?? moduleId}"`}
              </h2>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 text-xs text-red-600 dark:text-red-300 font-semibold">
              {error}
            </div>
          )}

          {/* Module & Parent Path Breadcrumb */}
          <div className="flex flex-wrap items-center gap-1.5 text-xs text-slate-500 bg-slate-50 dark:bg-slate-800/40 px-3 py-2 rounded-xl border border-slate-200/60 dark:border-slate-800">
            <span className="font-semibold text-slate-700 dark:text-slate-300">Ubicación:</span>
            <span className="font-medium text-blue-600 dark:text-cyan-400">{moduleTitle || moduleId}</span>
            {isSubtopic && (
              <>
                <span>›</span>
                <span className="font-medium text-slate-700 dark:text-slate-300">📁 {parentTitle || parentId}</span>
              </>
            )}
          </div>

          {/* Título */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Título oficial del {isSubtopic ? 'subtema' : 'tema'} <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              autoFocus
              className="w-full border rounded-xl px-3 py-2 text-sm bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-hidden font-medium"
              placeholder={isSubtopic ? 'Ej. Criterios de Bloqueo de Conducción Motora' : 'Ej. Bloqueos de Conducción y Dispersión'}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          {/* Slug / ID */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Identificador URL (Slug / ID técnico) <span className="text-red-500">*</span>
              </label>
              {!customSlug ? (
                <button
                  type="button"
                  onClick={() => setCustomSlug(true)}
                  className="text-[10px] text-blue-600 dark:text-cyan-400 hover:underline font-semibold"
                >
                  Personalizar slug
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setCustomSlug(false);
                    setSlug(slugify(title));
                  }}
                  className="text-[10px] text-slate-400 hover:underline"
                >
                  Restaurar automático
                </button>
              )}
            </div>
            <input
              type="text"
              required
              className="w-full border rounded-xl px-3 py-1.5 text-xs font-mono bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 focus:ring-2 focus:ring-blue-500 outline-hidden"
              placeholder="identificador-del-tema"
              value={slug}
              onChange={(e) => {
                setCustomSlug(true);
                setSlug(slugify(e.target.value));
              }}
            />
          </div>

          {/* Descripción / Resumen */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Descripción pedagógica breve u objetivo
            </label>
            <textarea
              rows={2}
              className="w-full border rounded-xl px-3 py-2 text-xs bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-hidden"
              placeholder="Resumen del tema o habilidades clínicas que aprenderá el médico..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {/* Contenido Markdown Inicial */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-blue-600 dark:text-cyan-400" />
                <span>Contenido clínico inicial (Markdown opcional)</span>
              </label>
              <button
                type="button"
                onClick={() => {
                  setContent(
                    `## Objetivos Clínicos\n- Describir la fisiología y la técnica diagnóstica adecuada.\n- Reconocer patrones electrodiagnósticos característicos.\n\n## Técnica y Parámetros\n1. Preparación del paciente y control de temperatura.\n2. Colocación de electrodos activos y de referencia.\n\n## Interpretación\nIntegrar latencia, amplitud y velocidad con el cuadro clínico.`
                  );
                }}
                className="text-[10px] text-blue-600 dark:text-cyan-400 hover:underline font-semibold flex items-center gap-1"
              >
                <Sparkles className="w-3 h-3" />
                Plantilla base
              </button>
            </div>
            <textarea
              rows={5}
              className="w-full border rounded-xl px-3 py-2 text-xs font-mono bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-hidden"
              placeholder="Puedes escribir o pegar texto en formato Markdown..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
          </div>

          {/* Perla clínica opcional */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
              <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
              <span>Perla clínica destacada (opcional)</span>
            </label>
            <input
              type="text"
              className="w-full border rounded-xl px-3 py-2 text-xs bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-hidden"
              placeholder="Ej. Asegurar calentamiento cutáneo adecuado antes de clasificar desmielinización..."
              value={clinicalPearl}
              onChange={(e) => setClinicalPearl(e.target.value)}
            />
          </div>

          {/* Botones de acción */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              disabled={loading}
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading || !title.trim()}
              className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition flex items-center gap-2 cursor-pointer disabled:opacity-50 shadow-xs"
            >
              {loading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Publicando {isSubtopic ? 'subtema' : 'tema'}…</span>
                </>
              ) : (
                <>
                  <Plus className="w-3.5 h-3.5" />
                  <span>Crear y Publicar {isSubtopic ? 'Subtema' : 'Tema'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
