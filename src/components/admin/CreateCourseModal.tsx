import { useEffect, useMemo, useState } from 'react';
import { GraduationCap, Loader2, X } from 'lucide-react';
import { slugify } from '../../utils/slugify';
import { assertCreateableCourseId, nextCourseSortOrder } from '../../content/courseCatalog';
import { createCourse } from '../../services/courseService';
import type { Course } from '../../types/database';

const PRICE_PRESETS = ['$4,500 MXN', '$3,500 MXN', '$2,500 MXN', 'Consultar', 'Beca 100%'];

interface CreateCourseModalProps {
  isOpen: boolean;
  onClose: () => void;
  courses: Course[];
  onSuccess: (course: Course) => void;
}

export function CreateCourseModal({ isOpen, onClose, courses, onSuccess }: CreateCourseModalProps) {
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [customSlug, setCustomSlug] = useState(false);
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('Consultar');
  const [isActive, setIsActive] = useState(true);
  const [isSellable, setIsSellable] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const existingIds = useMemo(() => courses.map((course) => course.id), [courses]);

  useEffect(() => {
    if (!customSlug && title) {
      setSlug(slugify(title));
    }
  }, [title, customSlug]);

  useEffect(() => {
    if (!isOpen) return;
    setTitle('');
    setSlug('');
    setCustomSlug(false);
    setDescription('');
    setPrice('Consultar');
    setIsActive(true);
    setIsSellable(true);
    setLoading(false);
    setError(null);
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!title.trim()) {
      setError('El título del curso es obligatorio.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const id = assertCreateableCourseId(slug.trim() || slugify(title), existingIds);
      const created = await createCourse({
        id,
        title: title.trim(),
        description: description.trim(),
        price_display: isSellable ? price.trim() || 'Consultar' : null,
        is_active: isActive,
        is_sellable: isSellable,
        sort_order: nextCourseSortOrder(courses),
      });
      onSuccess(created);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo crear el curso');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[80] bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="create-course-title"
    >
      <div className="max-w-xl w-full rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden my-8">
        <div className="flex items-center justify-between p-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-100 dark:bg-blue-950/70 text-blue-600 dark:text-cyan-400">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-cyan-400">
                Nuevo curso
              </span>
              <h2 id="create-course-title" className="text-base font-extrabold text-slate-900 dark:text-white">
                Agregar curso al catálogo
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

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 text-xs text-red-600 dark:text-red-300 font-semibold">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Título oficial <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              autoFocus
              className="w-full border rounded-xl px-3 py-2 text-sm bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-hidden font-medium"
              placeholder="Ej. Curso de Actualización 2027"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Identificador (slug) <span className="text-red-500">*</span>
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
              placeholder="curso-de-actualizacion-2027"
              value={slug}
              onChange={(e) => {
                setCustomSlug(true);
                setSlug(slugify(e.target.value));
              }}
            />
            <p className="text-[11px] text-slate-400 mt-1">Se usa en admisiones, constancias y URLs internas.</p>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Descripción pedagógica pública
            </label>
            <textarea
              rows={3}
              className="w-full border rounded-xl px-3 py-2 text-sm bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-hidden"
              placeholder="Qué aprenderá el médico y para quién está pensado..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <label className="inline-flex items-start gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer p-3 rounded-xl border border-slate-200 dark:border-slate-700">
              <input
                type="checkbox"
                checked={isSellable}
                onChange={(e) => setIsSellable(e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded-md border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              <span>
                Se vende por separado
                <span className="block text-[11px] font-normal text-slate-500 mt-0.5">
                  Desactiva para material incluido con cualquier curso.
                </span>
              </span>
            </label>
            <label className="inline-flex items-start gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer p-3 rounded-xl border border-slate-200 dark:border-slate-700">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded-md border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              <span>
                Curso activo
                <span className="block text-[11px] font-normal text-slate-500 mt-0.5">
                  Visible para aspirantes en la web pública.
                </span>
              </span>
            </label>
          </div>

          {isSellable && (
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Precio mostrado en la web
              </label>
              <input
                className="w-full border rounded-xl px-3 py-2 text-sm bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="Ej. $4,500 MXN o Consultar"
              />
              <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                <span className="text-[10px] text-slate-400 font-medium">Sugerencias:</span>
                {PRICE_PRESETS.map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setPrice(preset)}
                    className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-600 transition cursor-pointer"
                  >
                    {preset}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-2">
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
              disabled={loading}
              className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition shadow-xs disabled:opacity-50 cursor-pointer inline-flex items-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Creando curso…</span>
                </>
              ) : (
                <span>Crear curso</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
