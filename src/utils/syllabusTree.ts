import type { Topic } from '../types/content';
import type { CourseModuleRow, SyllabusTopicOverride } from '../types/database';
import type { SyllabusTopicOverrideInput } from '../services/courseService';

export function moveItem<T>(items: T[], from: number, to: number): T[] {
  if (from === to || from < 0 || to < 0 || from >= items.length || to >= items.length) {
    return items;
  }
  const next = [...items];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
}

export function isTopicVisible(
  overrides: SyllabusTopicOverride[],
  moduleId: string,
  topicId: string
): boolean {
  return overrides.find((o) => o.module_id === moduleId && o.topic_id === topicId)?.is_visible ?? true;
}

export function siblingOverrideInputs(
  orderedTopicIds: string[],
  moduleId: string,
  overrides: SyllabusTopicOverride[]
): SyllabusTopicOverrideInput[] {
  const vis = new Map(
    overrides.filter((o) => o.module_id === moduleId).map((o) => [o.topic_id, o.is_visible])
  );
  return orderedTopicIds.map((topic_id, sort_order) => ({
    topic_id,
    sort_order,
    is_visible: vis.get(topic_id) ?? true,
  }));
}

export function visibilityOverrideInput(
  topicId: string,
  nextVisible: boolean,
  siblings: { id: string }[],
  moduleId: string,
  overrides: SyllabusTopicOverride[]
): SyllabusTopicOverrideInput {
  const existing = overrides.find((o) => o.module_id === moduleId && o.topic_id === topicId);
  const fallbackIndex = siblings.findIndex((s) => s.id === topicId);
  return {
    topic_id: topicId,
    sort_order: existing?.sort_order ?? (fallbackIndex >= 0 ? fallbackIndex : 0),
    is_visible: nextVisible,
  };
}

export function mergeOverrideInputs(
  moduleId: string,
  current: SyllabusTopicOverride[],
  inputs: SyllabusTopicOverrideInput[]
): SyllabusTopicOverride[] {
  const next = [...current];
  for (const input of inputs) {
    const idx = next.findIndex((o) => o.module_id === moduleId && o.topic_id === input.topic_id);
    const row: SyllabusTopicOverride = {
      module_id: moduleId,
      topic_id: input.topic_id,
      sort_order: input.sort_order,
      is_visible: input.is_visible,
    };
    if (idx >= 0) next[idx] = { ...next[idx], ...row };
    else next.push(row);
  }
  return next;
}

export function assignmentsWithModuleOrder(
  assignments: CourseModuleRow[],
  courseId: string,
  moduleIds: string[]
): CourseModuleRow[] {
  return assignments.map((row) => {
    if (row.course_id !== courseId) return row;
    const idx = moduleIds.indexOf(row.module_id);
    if (idx < 0) return row;
    return { ...row, sort_order: idx };
  });
}

export function assignmentsWithModuleVisibility(
  assignments: CourseModuleRow[],
  moduleId: string,
  isVisible: boolean
): CourseModuleRow[] {
  return assignments.map((row) => (row.module_id === moduleId ? { ...row, is_visible: isVisible } : row));
}

export function findTopicInList(topics: Topic[], topicId: string): Topic | null {
  for (const topic of topics) {
    if (topic.id === topicId) return topic;
    if (topic.children?.length) {
      const found = findTopicInList(topic.children, topicId);
      if (found) return found;
    }
  }
  return null;
}

export function topicHasBody(topic: Topic): boolean {
  return Boolean(
    topic.content?.trim() ||
      topic.clinicalPearls?.length ||
      topic.keyPoints?.length ||
      topic.youtubeUrls?.length ||
      topic.vimeoUrls?.length ||
      topic.videoUrls?.length ||
      topic.embedUrls?.length ||
      topic.imageUrls?.length
  );
}
