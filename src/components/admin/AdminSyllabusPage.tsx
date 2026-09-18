import { useMemo, useState } from 'react';
import {
  ChevronDown,
  ChevronUp,
  Eye,
  EyeOff,
  ListTree,
  ArrowUp,
  ArrowDown,
  Trash2,
  AlertTriangle,
  Edit3,
  ExternalLink,
  Plus,
} from 'lucide-react';
import { AdminLayout } from './AdminLayout';
import { useSyllabusCatalog } from '../../hooks/useSyllabusCatalog';
import { QuickCreateTopicModal } from './QuickCreateTopicModal';
import {
  assignModuleToCourse,
  deleteCourse,
  reorderCourseModules,
  setCourseModuleVisible,
  setSyllabusTopicOverrides,
  updateCourseMetadata,
} from '../../services/courseService';
import type { Course, CourseId } from '../../types/database';
import type { Module } from '../../types/content';

export default function AdminSyllabusPage() {
  const { courses, assignments, grouped, unassigned, overrides, reload, modulesWithOverrides } = useSyllabusCatalog();
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [preview, setPreview] = useState(false);
  const [courseToDelete, setCourseToDelete] = useState<{
    id: CourseId;
    title: string;
    moduleCount: number;
    moduleTitles: string[];
  } | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Modal para crear tema o subtema rápido
  const [createTopicState, setCreateTopicState] = useState<{
    isOpen: boolean;
    moduleId: string;
    moduleTitle?: string;
    parentId?: string | null;
    parentTitle?: string | null;
  }>({
    isOpen: false,
    moduleId: '',
  });

  const courseOptions = useMemo(() => [
    ...courses.map((c) => ({ id: c.id as CourseId, label: c.title })),
    { id: '' as const, label: 'Sin asignar' },
  ], [courses]);

  const moduleById = useMemo(() => new Map(modulesWithOverrides.map((m) => [m.id, m])), [modulesWithOverrides]);

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

  const handleRequestDelete = (course: Course) => {
    const rows = rowsForCourse(course.id as CourseId);
    setCourseToDelete({
      id: course.id as CourseId,
      title: course.title,
      moduleCount: rows.length,
      moduleTitles: rows.map((r) => `${r.mod.emoji} ${r.mod.title}`),
    });
  };

  const handleConfirmDelete = async () => {
    if (!courseToDelete) return;
    setDeleting(true);
    setError(null);
    setSuccessMsg(null);
    try {
      await deleteCourse(courseToDelete.id);
      const deletedTitle = courseToDelete.title;
      setCourseToDelete(null);
      await reload();
      setSuccessMsg(`El curso "${deletedTitle}" fue eliminado correctamente. Los módulos pasaron a "Sin asignar".`);
      setTimeout(() => setSuccessMsg(null), 6000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo eliminar el curso');
    } finally {
      setDeleting(false);
    }
  };

  const handleOpenCreateModal = (
    moduleId: string,
    moduleTitle?: string,
    parentId?: string | null,
    parentTitle?: string | null
  ) => {
    setCreateTopicState({
      isOpen: true,
      moduleId,
      moduleTitle,
      parentId,
      parentTitle,
    });
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
        {error && <p className="text-sm font-semibold text-red-600 dark:text-red-400">{error}</p>}
        {successMsg && (
          <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 px-3.5 py-1.5 rounded-xl animate-fadeIn">
            ✓ {successMsg}
          </p>
        )}
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
            onDelete={() => handleRequestDelete(course)}
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
                      {courseOptions.map((opt) => (
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
                  <div className="mt-3 space-y-2 pl-2">
                    <ul className="space-y-1.5">
                      {topicRowsForModule(mod).map(({ topic, order, visible: topicVisible }, tIndex, tArr) => (
                        <li key={topic.id} className="text-sm py-1 border-b border-slate-100 dark:border-slate-800/60 last:border-b-0">
                          <div className="flex items-center gap-2">
                            <div className={`flex-1 min-w-0 flex items-center gap-2 ${topicVisible ? '' : 'opacity-50'}`}>
                              <a
                                href={`/modulo/${mod.id}/${topic.id}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="font-semibold text-slate-800 dark:text-slate-200 hover:text-blue-600 dark:hover:text-cyan-400 hover:underline flex items-center gap-1.5 truncate cursor-pointer"
                                title={`Abrir tema "${topic.title}" para ver o estudiar su contenido`}
                              >
                                <span className="truncate">{topic.title}</span>
                                <ExternalLink className="w-3 h-3 text-slate-400 shrink-0" />
                              </a>
                              {!topicVisible && (
                                <span className="align-middle text-[10px] uppercase tracking-wide font-bold text-slate-400 border border-slate-300 dark:border-slate-600 rounded px-1.5 py-0.5 shrink-0">
                                  Oculto
                                </span>
                              )}
                              {topic.children && topic.children.length > 0 && (
                                <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-md shrink-0">
                                  {topic.children.length} subtema{topic.children.length > 1 ? 's' : ''}
                                </span>
                              )}
                            </div>

                            <div className="flex items-center gap-1 shrink-0">
                              <a
                                href={`/colaborador/nueva-revision?moduleId=${mod.id}&topicId=${topic.id}&action=update`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-blue-600 dark:hover:text-cyan-400 transition"
                                title={`Editar contenido de "${topic.title}" en el editor editorial`}
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </a>
                              <button
                                type="button"
                                onClick={() => handleOpenCreateModal(mod.id, mod.title, topic.id, topic.title)}
                                className="px-2 py-1 rounded-lg border border-emerald-200 dark:border-emerald-800/80 bg-emerald-50/70 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 text-xs font-semibold hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition flex items-center gap-1 cursor-pointer"
                                title={`Agregar nuevo subtema dentro de "${topic.title}"`}
                              >
                                <Plus className="w-3 h-3" />
                                <span>Subtema</span>
                              </button>
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
                                {topicVisible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5 text-slate-400" />}
                              </button>
                            </div>
                          </div>

                          {/* Subtemas anidados si existen */}
                          {topic.children && topic.children.length > 0 && (
                            <ul className="mt-1.5 ml-4 pl-3 border-l-2 border-slate-200 dark:border-slate-800 space-y-1">
                              {topic.children.map((sub) => (
                                <li key={sub.id} className="flex items-center justify-between text-xs py-0.5">
                                  <a
                                    href={`/modulo/${mod.id}/${topic.id}/${sub.id}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-cyan-400 hover:underline flex items-center gap-1.5 truncate cursor-pointer"
                                    title={`Abrir subtema "${sub.title}"`}
                                  >
                                    <span className="text-slate-400">↳</span>
                                    <span className="truncate">{sub.title}</span>
                                    <ExternalLink className="w-2.5 h-2.5 text-slate-400 shrink-0" />
                                  </a>
                                  <a
                                    href={`/colaborador/nueva-revision?moduleId=${mod.id}&topicId=${sub.id}&action=update`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-1 rounded text-slate-400 hover:text-blue-600 dark:hover:text-cyan-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                                    title={`Editar contenido de subtema "${sub.title}"`}
                                  >
                                    <Edit3 className="w-3 h-3" />
                                  </a>
                                </li>
                              ))}
                            </ul>
                          )}
                        </li>
                      ))}
                    </ul>

                    {/* Botón para agregar tema nuevo a este módulo */}
                    <div className="pt-2.5 mt-2 border-t border-dashed border-slate-200 dark:border-slate-800 flex items-center justify-between">
                      <button
                        type="button"
                        onClick={() => handleOpenCreateModal(mod.id, mod.title, null, null)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-dashed border-blue-300 dark:border-blue-700 bg-blue-50/60 dark:bg-blue-950/20 text-blue-600 dark:text-cyan-400 text-xs font-bold hover:bg-blue-100 dark:hover:bg-blue-900/40 transition cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Agregar tema nuevo a este módulo</span>
                      </button>
                      <span className="text-[11px] text-slate-400 font-medium">
                        {topicRowsForModule(mod).length} temas en total
                      </span>
                    </div>
                  </div>
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
              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title}
                </option>
              ))}
            </select>
          </div>
        ))}
      </section>

      {/* Modal de confirmación para eliminar curso */}
      {courseToDelete && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn"
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-delete-title"
        >
          <div className="max-w-md w-full rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden p-6 space-y-4">
            <div className="flex items-start gap-3">
              <div className="p-3 rounded-xl bg-red-100 dark:bg-red-950/70 text-red-600 dark:text-red-400 shrink-0">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-[10px] font-black uppercase tracking-wider text-red-600 dark:text-red-400">
                  Confirmación de Eliminación
                </span>
                <h3 id="modal-delete-title" className="text-base font-extrabold text-slate-900 dark:text-white truncate">
                  ¿Eliminar "{courseToDelete.title}"?
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">ID: {courseToDelete.id}</p>
              </div>
            </div>

            <div className="text-xs text-slate-600 dark:text-slate-300 space-y-2.5 bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-800">
              <p>
                Esta acción eliminará el curso permanentemente del catálogo y de la base de datos.
              </p>

              {courseToDelete.moduleCount > 0 ? (
                <div className="space-y-1.5 pt-1">
                  <p className="font-bold text-slate-800 dark:text-slate-200">
                    📦 {courseToDelete.moduleCount} módulo(s) asignado(s):
                  </p>
                  <ul className="pl-2 space-y-1 text-[11px] text-slate-600 dark:text-slate-400 max-h-32 overflow-y-auto">
                    {courseToDelete.moduleTitles.map((title, i) => (
                      <li key={i} className="truncate">• {title}</li>
                    ))}
                  </ul>
                  <p className="text-[11px] text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/50 p-2 rounded-lg mt-2">
                    💡 <strong>Tus módulos están a salvo:</strong> Los módulos no se borrarán de la plataforma; pasarán automáticamente a la sección <strong>"Sin asignar"</strong> al pie del temario para que puedas reubicarlos si lo deseas.
                  </p>
                </div>
              ) : (
                <p className="text-slate-500 italic">
                  Este curso no tiene módulos asignados actualmente.
                </p>
              )}

              <p className="text-[11px] text-amber-700 dark:text-amber-400 font-medium">
                ⚠️ Se limpiarán también las referencias de este curso en constancias y listas de espera.
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                disabled={deleting}
                onClick={() => setCourseToDelete(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={deleting}
                onClick={handleConfirmDelete}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50 shadow-xs"
              >
                {deleting ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Eliminando curso…</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Sí, eliminar curso definitivamente</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de creación rápida de temas y subtemas */}
      <QuickCreateTopicModal
        isOpen={createTopicState.isOpen}
        onClose={() => setCreateTopicState((prev) => ({ ...prev, isOpen: false }))}
        moduleId={createTopicState.moduleId}
        moduleTitle={createTopicState.moduleTitle}
        parentId={createTopicState.parentId}
        parentTitle={createTopicState.parentTitle}
        onSuccess={async (createdTopicId) => {
          await reload();
          setSuccessMsg(`Tema "${createdTopicId}" creado y publicado exitosamente en el temario.`);
          setTimeout(() => setSuccessMsg(null), 5000);
        }}
      />
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
  onDelete,
}: {
  courseId: CourseId;
  title: string;
  description: string;
  price: string;
  active: boolean;
  sellable: boolean;
  busy: boolean;
  onSave: (payload: { title: string; description: string; price_display: string | null; is_active: boolean }) => void;
  onDelete: () => void;
}) {
  const [localTitle, setLocalTitle] = useState(title);
  const [localDesc, setLocalDesc] = useState(description);
  const [localPrice, setLocalPrice] = useState(price);
  const [localActive, setLocalActive] = useState(active);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const pricePresets = ['$4,500 MXN', '$3,500 MXN', '$2,500 MXN', 'Consultar', 'Beca 100%'];

  const handleSave = () => {
    onSave({
      title: localTitle,
      description: localDesc,
      price_display: localPrice.trim() || null,
      is_active: localActive,
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="space-y-4 mb-6 p-5 rounded-2xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800">
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-cyan-400">
            Ficha y Precio del Curso
          </span>
          <h2 className="text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            {localTitle}
            {!localActive && (
              <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-md bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300">
                Inactivo
              </span>
            )}
          </h2>
        </div>
        {!sellable ? (
          <span className="text-xs text-slate-500 font-medium">Incluido con cualquier curso</span>
        ) : (
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500">Precio público:</span>
            <span className="text-xs font-black px-2.5 py-1 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300">
              {localPrice.trim() || 'Consultar'}
            </span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
            Título oficial del curso
          </label>
          <input
            className="w-full border rounded-xl px-3 py-2 text-sm bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
            value={localTitle}
            onChange={(e) => setLocalTitle(e.target.value)}
          />
        </div>

        {sellable ? (
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Precio mostrado a los aspirantes en la web
            </label>
            <input
              className="w-full border rounded-xl px-3 py-2 text-sm bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold"
              value={localPrice}
              onChange={(e) => setLocalPrice(e.target.value)}
              placeholder="Ej. $4,500 MXN o Consultar"
            />
            {/* Quick Presets */}
            <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
              <span className="text-[10px] text-slate-400 font-medium">Sugerencias:</span>
              {pricePresets.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setLocalPrice(preset)}
                  className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-600 transition cursor-pointer"
                >
                  {preset}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex items-center text-xs text-slate-400 italic">
            Este curso es material de referencia compartido y no tiene precio propio.
          </div>
        )}
      </div>

      <div>
        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
          Descripción pedagógica pública
        </label>
        <textarea
          className="w-full border rounded-xl px-3 py-2 text-sm bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
          rows={2}
          value={localDesc}
          onChange={(e) => setLocalDesc(e.target.value)}
        />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
        <label className="inline-flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
          <input
            type="checkbox"
            checked={localActive}
            onChange={(e) => setLocalActive(e.target.checked)}
            className="w-4 h-4 rounded-md border-slate-300 text-blue-600 focus:ring-blue-500"
          />
          <span>Curso activo (visible para que los aspirantes soliciten admisión)</span>
        </label>

        <div className="flex items-center gap-2.5">
          {savedSuccess && (
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 animate-fadeIn">
              ✓ Precio y ficha actualizados
            </span>
          )}
          <button
            type="button"
            disabled={busy}
            onClick={onDelete}
            className="min-h-[40px] px-3.5 rounded-xl border border-red-200 dark:border-red-900/60 bg-red-50/60 dark:bg-red-950/30 hover:bg-red-100 dark:hover:bg-red-900/50 text-red-600 dark:text-red-400 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            title={`Eliminar curso ${localTitle}`}
          >
            <Trash2 className="w-4 h-4" />
            <span>Eliminar curso</span>
          </button>
          <button
            type="button"
            disabled={busy}
            className="min-h-[40px] px-5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition shadow-xs disabled:opacity-50 cursor-pointer"
            onClick={handleSave}
          >
            {busy ? 'Guardando...' : `Guardar precio y ficha de ${courseId}`}
          </button>
        </div>
      </div>
    </div>
  );
}
