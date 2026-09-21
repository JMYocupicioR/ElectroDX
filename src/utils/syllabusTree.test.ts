import { describe, expect, it } from 'vitest';
import type { Topic } from '../types/content';
import type { CourseModuleRow, SyllabusTopicOverride } from '../types/database';
import {
  assignmentsWithModuleOrder,
  assignmentsWithModuleVisibility,
  isTopicVisible,
  mergeOverrideInputs,
  moveItem,
  siblingOverrideInputs,
  visibilityOverrideInput,
} from './syllabusTree';

const topics: Topic[] = [
  { id: 'a', title: 'A' },
  { id: 'b', title: 'B' },
  { id: 'c', title: 'C' },
];

describe('syllabusTree', () => {
  it('reorders siblings without mutating the original list', () => {
    const original = [...topics];
    expect(moveItem(topics, 0, 2).map((t) => t.id)).toEqual(['b', 'c', 'a']);
    expect(topics).toEqual(original);
    expect(moveItem(topics, 2, 0).map((t) => t.id)).toEqual(['c', 'a', 'b']);
    expect(moveItem(topics, 1, 1)).toBe(topics);
  });

  it('writes sibling sort_order and preserves visibility', () => {
    const overrides: SyllabusTopicOverride[] = [
      { module_id: 'fundamentals', topic_id: 'b', sort_order: 0, is_visible: false },
    ];
    const inputs = siblingOverrideInputs(['b', 'a', 'c'], 'fundamentals', overrides);
    expect(inputs).toEqual([
      { topic_id: 'b', sort_order: 0, is_visible: false },
      { topic_id: 'a', sort_order: 1, is_visible: true },
      { topic_id: 'c', sort_order: 2, is_visible: true },
    ]);
  });

  it('toggles visibility without dropping the sibling index', () => {
    const input = visibilityOverrideInput('b', false, topics, 'fundamentals', []);
    expect(input).toEqual({ topic_id: 'b', sort_order: 1, is_visible: false });
  });

  it('merges override upserts for one module', () => {
    const current: SyllabusTopicOverride[] = [
      { module_id: 'fundamentals', topic_id: 'a', sort_order: 0, is_visible: true },
      { module_id: 'other', topic_id: 'z', sort_order: 0, is_visible: true },
    ];
    const merged = mergeOverrideInputs('fundamentals', current, [
      { topic_id: 'a', sort_order: 1, is_visible: false },
      { topic_id: 'b', sort_order: 0, is_visible: true },
    ]);
    expect(merged.find((o) => o.topic_id === 'a')).toMatchObject({ sort_order: 1, is_visible: false });
    expect(merged.find((o) => o.topic_id === 'b')).toMatchObject({ sort_order: 0, is_visible: true });
    expect(merged.find((o) => o.topic_id === 'z')?.module_id).toBe('other');
  });

  it('reorders and hides modules in assignment rows', () => {
    const assignments: CourseModuleRow[] = [
      { module_id: 'fundamentals', course_id: 'principiante', sort_order: 1, is_visible: true },
      { module_id: 'emg-needle', course_id: 'principiante', sort_order: 2, is_visible: true },
      { module_id: 'special-studies', course_id: 'avanzado', sort_order: 1, is_visible: true },
    ];
    const reordered = assignmentsWithModuleOrder(assignments, 'principiante', ['emg-needle', 'fundamentals']);
    expect(reordered.find((a) => a.module_id === 'emg-needle')?.sort_order).toBe(0);
    expect(reordered.find((a) => a.module_id === 'fundamentals')?.sort_order).toBe(1);
    expect(reordered.find((a) => a.module_id === 'special-studies')?.sort_order).toBe(1);

    const hidden = assignmentsWithModuleVisibility(assignments, 'emg-needle', false);
    expect(hidden.find((a) => a.module_id === 'emg-needle')?.is_visible).toBe(false);
    expect(isTopicVisible([], 'fundamentals', 'a')).toBe(true);
  });
});
