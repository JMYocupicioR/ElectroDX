import { useMemo, useState } from 'react';
import { ChevronDown, ChevronUp, Eye, EyeOff, ListTree, ArrowUp, ArrowDown } from 'lucide-react';
import { AdminLayout } from './AdminLayout';
import { useSyllabusCatalog } from '../../hooks/useSyllabusCatalog';
import { allModules } from '../../content/modules';
import {
  assignModuleToCourse,
  reorderCourseModules,
  setCourseModuleVisible,
  setSyllabusTopicOverrides,
  updateCourseMetadata,
} from '../../services/courseService';
import { COURSE_IDS } from '../../content/courseCatalog';
import type { CourseId } from '../../types/database';
import type { Module } from '../../types/content';

const COURSE_OPTIONS: { id: CourseId | ''; label: string }[] = [
  { id: 'principiante', label: 'Principiante' },
  { id: 'intermedio', label: 'Intermedio' },
  { id: 'avanzado', label: 'Avanzado' },
  { id: 'referencia', label: 'Referencia' },
  { id: '', label: 'Sin asignar' },
];

export default function AdminSyllabusPage() {
  const { assignments, grouped, unassigned, overrides, reload } = useSyllabusCatalog();
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [preview, setPreview] = useState(false);

  const moduleById = useMemo(() => new Map(allModules.map((m) => [m.id, m])), []);

  const run = async (key: string, fn: () => Promise<void>) => {
    setBusy(key);
    setError(null);
    try {
      await fn();
      await reload();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo guardar el temario');
    } finally {
      setBusy(null);
    }
  };

  /**
   * Filas de módulos de un curso, en el MISMO orden en que se renderizan y se
   * reordenan (visibles y ocultos mezclados por sort_order). Antes el render
   * agrupaba ocultos al final pero el swap usaba el orden crudo, por lo que las
   * flechas movían un vecino distinto al que se veía en pantalla.
   */
  const rowsForCourse = (courseId: CourseId) =>
    assignments
      .filter((a) => a.course_id === courseId && moduleById.has(a.module_id))
      .sort((a, b) => a.sort_order - b.sort_order || a.module_id.localeCompare(b.module_id))
      .map((a) => ({ assignment: a, mod: moduleById.get(a.module_id)! }));

  /**
   * Temas de primer nivel en su orden efectivo, INCLUYENDO los ocultos.
   * Antes se listaban los temas ya filtrados por overrides, así que un tema
   * oculto desaparecía de la pantalla y no había forma de volver a mostrarlo.
   */
  const topicRowsForModule = (mod: Module) =>
    mod.topics
      .map((topic, index) => {
        const ov = overrides.find((o) => o.module_id === mod.id && o.topic_id === topic.id);
        return { topic, index, order: ov?.sort_order ?? index, visible: ov?.is_visible ?? true };
      })
      .sort((a, b) => a.order - b.order || a.index - b.index);

  /** Siguiente sort_order libre del curso destino (evita colisiones al mover módulos). */
  const nextSortOrder = (courseId: CourseId) =>
    assignments
      .filter((a) => a.course_id === courseId)
      .reduce((max, a) => Math.max(max, a.sort_order), 0) + 1;

  const moveModule = (moduleId: string, direction: -1 | 1, courseId: CourseId) => {
    const ids = rowsForCourse(courseId).map((r) => r.assignment.module_id);
    const idx = ids.indexOf(moduleId);
    const next = idx + direction;
    if (idx < 0 || next < 0 || next >= ids.length) return;
    const swapped = [...ids];
    [swapped[idx], swapped[next]] = [swapped[next], swapped[idx]];
    void run(`reorder-${moduleId}`, () => reorderCourseModules(courseId, swapped));
  };

  const moveTopic = (moduleId: string, topicId: string, direction: -1 | 1) => {
    const mod = moduleById.get(moduleId);
    if (!mod) return;
    const rows = topicRowsForModule(mod);
    const idx = rows.findIndex((r) => r.topic.id === topicId);
    const next = idx + direction;
    if (idx < 0 || next < 0 || next >= rows.length) return;
    const swapped = [...rows];
    [swapped[idx], swapped[next]] = [swapped[next], swapped[idx]];
    void run(`topic-${topicId}`, () =>
      setSyllabusTopicOverrides(
        moduleId,
        swapped.map((r, i) => ({ topic_id: r.topic.id, sort_order: i, is_visible: r.visible }))
      )
    );
  };

  const toggleTopicVisible = (moduleId: string, topicId: string, currentlyVisible: boolean, sortOrder: number) => {
    void run(`hide-${topicId}`, () =>
      setSyllabusTopicOverrides(moduleId, [
        { topic_id: topicId, sort_order: sortOrder, is_visible: !currentlyVisible },
      ])
    );
  };

  return (
    <AdminLayout
      title="Organizador del temario"
      subtitle="Asigna módulos a cada curso, reordena, oculta temas y edita la ficha comercial. Los cambios se guardan de inmediato."
    >
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <button
          type="button"
          onClick={() => setPreview((v) => !v)}
          className="inline-flex items-center gap-2 min-h-[44px] px-4 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-semibold"
        >
          <ListTree className="w-4 h-4" />
          {preview ? 'Salir de vista previa' : 'Vista previa del alumno'}
        </button>
        {busy && <span className="text-xs text-slate-500">Guardando…</span>}
        {error && <p className="text-sm text-red-600">{error}</p>}
      </div>

      {preview && (
        <div className="mb-8 p-5 rounded-2xl border border-blue-200 dark:border-blue-800 bg-blue-50/40 dark:bg-blue-950/20">
          <p className="text-sm font-bold mb-3">Así verá el alumno el temario (módulos visibles)</p>
          {grouped.map(({ course, modules }) => (
            <div key={course.id} className="mb-4">
              <p className="text-xs uppercase tracking-wider text-slate-500 font-bold">{course.title}</p>
              <ul className="mt-1 space-y-1">
                {modules.map((mod) => (
                  <li key={mod.id} className="text-sm">
                    {mod.emoji} {mod.title}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}

      {grouped.map(({ course }) => (
        <section key={course.id} className="mb-8 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <CourseMetaForm
            courseId={course.id}
            title={course.title}
            description={course.description}
            price={course.price_display ?? ''}
            active={course.is_active}
            sellable={course.is_sellable}
            busy={busy === `meta-${course.id}`}
            onSave={(payload) => run(`meta-${course.id}`, () => updateCourseMetadata(course.id, payload))}
          />

          {rowsForCourse(course.id).map(({ assignment, mod }, index, arr) => {
            const visible = assignment.is_visible;
            const isOpen = expanded.has(mod.id);
            return (
              <div key={mod.id} className="mt-3 p-3 rounded-xl border border-slate-200/80 dark:border-slate-800">
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`text-lg ${visible ? '' : 'opacity-50'}`}>{mod.emoji}</span>
                  <span className={`font-semibold text-sm flex-1 ${visible ? '' : 'opacity-50'}`}>
                    {mod.title}
                    {!visible && (
                      <span className="ml-2 align-middle text-[10px] uppercase tracking-wide font-bold text-slate-400 border border-slate-300 dark:border-slate-600 rounded px-1.5 py-0.5">
                        Oculto
                      </span>
                    )}
                  </span>
                  <label className="text-xs">
                    Curso
                    <select
                      className="ml-2 text-xs border rounded-lg px-2 py-1 bg-white dark:bg-slate-800"
                      value={assignment.course_id}
                      disabled={busy !== null}
                      onChange={(e) => {
                        const next = e.target.value as CourseId | '';
                        if (next === assignment.course_id) return;
                        if (!next) {
                          const ok = window.confirm(
                            `¿Quitar "${mod.title}" del curso? Pasará a "Sin asignar" y perderá su orden y visibilidad.`
                          );
                          if (!ok) return;
                        }
                        void run(`move-${mod.id}`, () =>
                          assignModuleToCourse(mod.id, next || null, next ? nextSortOrder(next) : 0, visible)
                        );
                      }}
                    >
                      {COURSE_OPTIONS.map((opt) => (
                        <option key={opt.id || 'none'} value={opt.id}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </label>
                  <button
                    type="button"
                    className="p-2 rounded-lg border min-h-[40px] disabled:opacity-40"
                    aria-label="Subir módulo"
                    disabled={busy !== null || index === 0}
                    onClick={() => moveModule(mod.id, -1, course.id)}
                  >
                    <ArrowUp className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    className="p-2 rounded-lg border min-h-[40px] disabled:opacity-40"
                    aria-label="Bajar módulo"
                    disabled={busy !== null || index === arr.length - 1}
                    onClick={() => moveModule(mod.id, 1, course.id)}
                  >
                    <ArrowDown className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    className="p-2 rounded-lg border min-h-[40px] disabled:opacity-40"
                    aria-label={visible ? 'Ocultar módulo' : 'Mostrar módulo'}
                    disabled={busy !== null}
                    onClick={() => run(`vis-${mod.id}`, () => setCourseModuleVisible(mod.id, !visible))}
                  >
                    {visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4 text-slate-400" />}
                  </button>
                  <button
                    type="button"
                    className="p-2 rounded-lg border min-h-[40px]"
                    aria-label="Temas de primer nivel"
                    onClick={() =>
                      setExpanded((prev) => {
                        const next = new Set(prev);
                        if (next.has(mod.id)) next.delete(mod.id);
                        else next.add(mod.id);
                        return next;
                      })
                    }
                  >
                    {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                </div>
                {isOpen && (
                  <ul className="mt-3 space-y-1 pl-2">
                    {topicRowsForModule(mod).map(({ topic, order, visible: topicVisible }, tIndex, tArr) => (
                      <li key={topic.id} className="flex items-center gap-2 text-sm py-1">
                        <span className={`flex-1 ${topicVisible ? '' : 'opacity-50'}`}>
                          {topic.title}
                          {!topicVisible && (
                            <span className="ml-2 align-middle text-[10px] uppercase tracking-wide font-bold text-slate-400 border border-slate-300 dark:border-slate-600 rounded px-1.5 py-0.5">
                              Oculto
                            </span>
                          )}
                        </span>
                        <button
                          type="button"
                          className="p-1.5 rounded border disabled:opacity-40"
                          aria-label="Subir tema"
                          disabled={busy !== null || tIndex === 0}
                          onClick={() => moveTopic(mod.id, topic.id, -1)}
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          className="p-1.5 rounded border disabled:opacity-40"
                          aria-label="Bajar tema"
                          disabled={busy !== null || tIndex === tArr.length - 1}
                          onClick={() => moveTopic(mod.id, topic.id, 1)}
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          className="p-1.5 rounded border disabled:opacity-40"
                          aria-label={topicVisible ? 'Ocultar tema' : 'Mostrar tema'}
                          disabled={busy !== null}
                          onClick={() => toggleTopicVisible(mod.id, topic.id, topicVisible, order)}
                        >
                          {topicVisible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            );
          })}
        </section>
      ))}

      <section className="p-5 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700">
        <h2 className="font-bold mb-3">Sin asignar</h2>
        {unassigned.length === 0 && <p className="text-sm text-slate-500">Todos los módulos tienen curso.</p>}
        {unassigned.map((mod) => (
          <div key={mod.id} className="flex items-center gap-2 py-2">
            <span>
              {mod.emoji} {mod.title}
            </span>
            <select
              className="text-xs border rounded-lg px-2 py-1 bg-white dark:bg-slate-800"
              defaultValue=""
              disabled={busy !== null}
              onChange={(e) => {
                const next = e.target.value as CourseId | '';
                if (!next) return;
                void run(`assign-${mod.id}`, () => assignModuleToCourse(mod.id, next, nextSortOrder(next), true));
              }}
            >
              <option value="">Asignar a…</option>
              {COURSE_IDS.map((id) => (
                <option key={id} value={id}>
                  {id}
                </option>
              ))}
            </select>
          </div>
        ))}
      </section>
    </AdminLayout>
  );
}

function CourseMetaForm({
  courseId,
  title,
  description,
  price,
  active,
  sellable,
  busy,
  onSave,
}: {
  courseId: CourseId;
  title: string;
  description: string;
  price: string;
  active: boolean;
  sellable: boolean;
  busy: boolean;
  onSave: (payload: { title: string; description: string; price_display: string | null; is_active: boolean }) => void;
}) {
  const [localTitle, setLocalTitle] = useState(title);
  const [localDesc, setLocalDesc] = useState(description);
  const [localPrice, setLocalPrice] = useState(price);
  const [localActive, setLocalActive] = useState(active);

  return (
    <div className="space-y-3 mb-4">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-extrabold">{localTitle}</h2>
        {!sellable && <span className="text-xs text-slate-500">No se vende por separado</span>}
      </div>
      <label className="block text-xs font-semibold">
        Título
        <input
          className="mt-1 w-full border rounded-xl px-3 py-2 text-sm bg-white dark:bg-slate-800"
          value={localTitle}
          onChange={(e) => setLocalTitle(e.target.value)}
        />
      </label>
      <label className="block text-xs font-semibold">
        Descripción
        <textarea
          className="mt-1 w-full border rounded-xl px-3 py-2 text-sm bg-white dark:bg-slate-800"
          rows={3}
          value={localDesc}
          onChange={(e) => setLocalDesc(e.target.value)}
        />
      </label>
      {sellable && (
        <label className="block text-xs font-semibold">
          Precio mostrado
          <input
            className="mt-1 w-full border rounded-xl px-3 py-2 text-sm bg-white dark:bg-slate-800"
            value={localPrice}
            onChange={(e) => setLocalPrice(e.target.value)}
          />
        </label>
      )}
      <label className="inline-flex items-center gap-2 text-sm">
        <input type="checkbox" checked={localActive} onChange={(e) => setLocalActive(e.target.checked)} />
        Curso activo
      </label>
      <button
        type="button"
        disabled={busy}
        className="min-h-[44px] px-4 rounded-xl bg-indigo-600 text-white text-sm font-semibold"
        onClick={() =>
          onSave({
            title: localTitle,
            description: localDesc,
            price_display: localPrice.trim() || null,
            is_active: localActive,
          })
        }
      >
        Guardar ficha de {courseId}
      </button>
    </div>
  );
}
