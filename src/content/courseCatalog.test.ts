import { describe, expect, it } from 'vitest';
import {
  applySyllabusTopicOverrides,
  DEFAULT_COURSE_MODULES,
  DEFAULT_COURSES,
  getCourseIdForModule,
  groupModulesByCourse,
  moduleIdsForCourse,
  recommendedNextCourse,
} from './courseCatalog';
import type { Module } from '../types/content';

const sampleModules: Module[] = [
  { id: 'fundamentals', number: 1, title: 'A', titleEn: 'A', emoji: '', description: '', descriptionEn: '', color: '', icon: 'BookOpen', topics: [{ id: 't2', title: 'Two' }, { id: 't1', title: 'One' }] },
  { id: 'orphan', number: 99, title: 'Orphan', titleEn: 'O', emoji: '', description: '', descriptionEn: '', color: '', icon: 'BookOpen', topics: [] },
];

describe('courseCatalog', () => {
  it('maps beginner modules to principiante', () => {
    expect(getCourseIdForModule(DEFAULT_COURSE_MODULES, 'pathologies')).toBe('principiante');
    expect(getCourseIdForModule(DEFAULT_COURSE_MODULES, 'diagnostic-criteria')).toBe('intermedio');
    expect(getCourseIdForModule(DEFAULT_COURSE_MODULES, 'special-studies')).toBe('avanzado');
    expect(moduleIdsForCourse(DEFAULT_COURSE_MODULES, 'referencia')).toEqual([]);
  });

  it('groups modules and lists unassigned', () => {
    const { grouped, unassigned } = groupModulesByCourse(sampleModules, DEFAULT_COURSES, DEFAULT_COURSE_MODULES);
    expect(unassigned.map((m) => m.id)).toEqual(['orphan']);
    const beginner = grouped.find((g) => g.course.id === 'principiante');
    expect(beginner?.modules.map((m) => m.id)).toContain('fundamentals');
  });

  it('hides and reorders first-level topics', () => {
    const result = applySyllabusTopicOverrides(sampleModules[0], [
      { module_id: 'fundamentals', topic_id: 't1', sort_order: 0, is_visible: true },
      { module_id: 'fundamentals', topic_id: 't2', sort_order: 1, is_visible: false },
    ]);
    expect(result.topics.map((t) => t.id)).toEqual(['t1']);
  });

  it('recommends the next unpaid sellable course', () => {
    expect(recommendedNextCourse([])).toBe('principiante');
    expect(recommendedNextCourse(['principiante'])).toBe('intermedio');
    expect(recommendedNextCourse(['principiante', 'intermedio', 'avanzado'])).toBeNull();
  });

  it('verifies that deleting a course gracefully leaves its modules unassigned', () => {
    // Simulate courses list without 'referencia'
    const activeCourses = DEFAULT_COURSES.filter((c) => c.id !== 'referencia');
    // Module assignments where 'quick-reference' was previously mapped to 'referencia'
    const assignmentsWithOrphans = [
      ...DEFAULT_COURSE_MODULES,
      { module_id: 'quick-reference', course_id: 'referencia' as any, sort_order: 1, is_visible: true },
    ];
    const testModules: Module[] = [
      ...sampleModules,
      { id: 'quick-reference', number: 11, title: 'QR', titleEn: 'QR', emoji: '', description: '', descriptionEn: '', color: '', icon: 'BookOpen', topics: [] },
    ];
    const { grouped, unassigned } = groupModulesByCourse(testModules, activeCourses, assignmentsWithOrphans);
    // The module whose course does not exist in activeCourses should land in unassigned
    expect(unassigned.map((m) => m.id)).toContain('quick-reference');
    // And no group should exist for 'referencia'
    expect(grouped.find((g) => (g.course.id as string) === 'referencia')).toBeUndefined();
  });
});
