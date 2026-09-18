import type { Module } from '../types/content';
import type { Course, CourseId, CourseModuleRow, SyllabusTopicOverride } from '../types/database';

export const COURSE_IDS = ['principiante', 'intermedio', 'avanzado', 'referencia'] as const;
export const SELLABLE_COURSE_IDS: CourseId[] = ['principiante', 'intermedio', 'avanzado'];

export const DEFAULT_COURSES: Course[] = [
  {
    id: 'principiante',
    title: 'Curso Principiante',
    description:
      'Fundamentos de neurofisiología clínica, técnicas de neuroconducción y EMG de aguja, anatomía topográfica, patologías neuromusculares frecuentes y control de calidad. Pensado para quien inicia en electrodiagnóstico.',
    sort_order: 1,
    price_display: 'Consultar',
    is_active: true,
    is_sellable: true,
    updated_at: '',
    updated_by: null,
  },
  {
    id: 'intermedio',
    title: 'Curso Intermedio',
    description:
      'De la técnica a la práctica real: criterios diagnósticos, algoritmos, diagnóstico diferencial por síndrome y planificación del estudio con informe EMG.',
    sort_order: 2,
    price_display: 'Consultar',
    is_active: true,
    is_sellable: true,
    updated_at: '',
    updated_by: null,
  },
  {
    id: 'avanzado',
    title: 'Curso Avanzado',
    description:
      'Técnicas especiales, casos clínicos de alta complejidad y actualizaciones por patología para el electrodiagnóstico de referencia.',
    sort_order: 3,
    price_display: 'Consultar',
    is_active: true,
    is_sellable: true,
    updated_at: '',
    updated_by: null,
  },
  {
    id: 'referencia',
    title: 'Referencia rápida y bibliografía',
    description: 'Tablas clínicas y fuentes bibliográficas. Se desbloquea con cualquier curso activo.',
    sort_order: 4,
    price_display: null,
    is_active: true,
    is_sellable: false,
    updated_at: '',
    updated_by: null,
  },
];

/** Default module → course assignment (mirrors the SQL seed). */
export const DEFAULT_COURSE_MODULES: CourseModuleRow[] = [
  { module_id: 'fundamentals', course_id: 'principiante', sort_order: 1, is_visible: true },
  { module_id: 'nerve-conduction', course_id: 'principiante', sort_order: 2, is_visible: true },
  { module_id: 'emg-needle', course_id: 'principiante', sort_order: 3, is_visible: true },
  { module_id: 'late-responses', course_id: 'principiante', sort_order: 4, is_visible: true },
  { module_id: 'repetitive-stimulation', course_id: 'principiante', sort_order: 5, is_visible: true },
  { module_id: 'evoked-potentials', course_id: 'principiante', sort_order: 6, is_visible: true },
  { module_id: 'topographic-anatomy', course_id: 'principiante', sort_order: 7, is_visible: true },
  { module_id: 'pathologies', course_id: 'principiante', sort_order: 8, is_visible: true },
  { module_id: 'safety-qc', course_id: 'principiante', sort_order: 9, is_visible: true },
  { module_id: 'diagnostic-criteria', course_id: 'intermedio', sort_order: 1, is_visible: true },
  { module_id: 'syndrome-differential', course_id: 'intermedio', sort_order: 2, is_visible: true },
  { module_id: 'emg-report-planning', course_id: 'intermedio', sort_order: 3, is_visible: true },
  { module_id: 'special-studies', course_id: 'avanzado', sort_order: 1, is_visible: true },
  { module_id: 'complex-clinical-cases', course_id: 'avanzado', sort_order: 2, is_visible: true },
  { module_id: 'pathology-updates', course_id: 'avanzado', sort_order: 3, is_visible: true },
  { module_id: 'quick-reference', course_id: 'referencia', sort_order: 1, is_visible: true },
  { module_id: 'bibliography', course_id: 'referencia', sort_order: 2, is_visible: true },
];

export const NEXT_COURSE_RECOMMENDATION: Partial<Record<CourseId, CourseId>> = {
  principiante: 'intermedio',
  intermedio: 'avanzado',
};

export function isCourseId(value: string | null | undefined): value is CourseId {
  return !!value && (COURSE_IDS as readonly string[]).includes(value);
}

export function getCourseById(courses: Course[], courseId: string): Course | undefined {
  return courses.find((c) => c.id === courseId);
}

export function getAssignmentForModule(
  assignments: CourseModuleRow[],
  moduleId: string
): CourseModuleRow | undefined {
  return assignments.find((row) => row.module_id === moduleId);
}

export function getCourseIdForModule(assignments: CourseModuleRow[], moduleId: string): CourseId | null {
  const row = getAssignmentForModule(assignments, moduleId);
  return row ? row.course_id : null;
}

export function moduleIdsForCourse(assignments: CourseModuleRow[], courseId: CourseId, visibleOnly = true): string[] {
  return assignments
    .filter((row) => row.course_id === courseId && (!visibleOnly || row.is_visible))
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((row) => row.module_id);
}

export interface GroupedSyllabusCourse {
  course: Course;
  modules: Module[];
  hiddenModules: Module[];
}

export function groupModulesByCourse(
  modules: Module[],
  courses: Course[],
  assignments: CourseModuleRow[]
): { grouped: GroupedSyllabusCourse[]; unassigned: Module[] } {
  const byId = new Map(modules.map((m) => [m.id, m]));
  const assignedIds = new Set(assignments.map((a) => a.module_id));
  const sortedCourses = [...courses].sort((a, b) => a.sort_order - b.sort_order);

  const grouped = sortedCourses.map((course) => {
    const rows = assignments
      .filter((a) => a.course_id === course.id)
      .sort((a, b) => a.sort_order - b.sort_order);
    const visible: Module[] = [];
    const hidden: Module[] = [];
    for (const row of rows) {
      const mod = byId.get(row.module_id);
      if (!mod) continue;
      if (row.is_visible) visible.push(mod);
      else hidden.push(mod);
    }
    return { course, modules: visible, hiddenModules: hidden };
  });

  const unassigned = modules.filter((m) => !assignedIds.has(m.id));
  return { grouped, unassigned };
}

export function applySyllabusTopicOverrides(mod: Module, overrides: SyllabusTopicOverride[]): Module {
  const forMod = overrides.filter((o) => o.module_id === mod.id);
  if (forMod.length === 0) return mod;

  const hidden = new Set(forMod.filter((o) => !o.is_visible).map((o) => o.topic_id));
  const order = new Map(forMod.map((o) => [o.topic_id, o.sort_order]));

  const remaining = mod.topics
    .map((topic, index) => ({ topic, index, order: order.get(topic.id) ?? index }))
    .filter((entry) => !hidden.has(entry.topic.id))
    .sort((a, b) => a.order - b.order || a.index - b.index)
    .map((entry) => entry.topic);

  return { ...mod, topics: remaining };
}

export function applyOverridesToModules(modules: Module[], overrides: SyllabusTopicOverride[]): Module[] {
  if (!overrides.length) return modules;
  return modules.map((mod) => applySyllabusTopicOverrides(mod, overrides));
}

export function recommendedNextCourse(owned: CourseId[]): CourseId | null {
  const ownedSet = new Set(owned);
  for (const id of SELLABLE_COURSE_IDS) {
    if (!ownedSet.has(id)) return id;
  }
  return null;
}
