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
    expect(moduleIdsForCourse(DEFAULT_COURSE_MODULES, 'referencia')).toEqual(['quick-reference', 'bibliography']);
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
});
