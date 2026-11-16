import type { CourseId, SyllabusTopicOverride } from '../types/database';
import type { SyllabusTopicOverrideInput } from '../services/courseService';
import { moveItem, siblingOverrideInputs } from './syllabusTree';

export type ReorderEntityType = 'modulo' | 'tema' | 'subtema';

export type ReorderTriggerSource =
  | 'temario-flechas'
  | 'temario-drag'
  | 'temario-salto'
  | 'drawer-flechas'
  | 'sidebar-drag';

export interface ReorderImpactWarnings {
  isHidden?: boolean;
  hasScheduledDate?: boolean;
  scheduledDateLabel?: string;
  isOpenToRegistration?: boolean;
  openTopicsInModuleCount?: number;
}

export interface PendingSyllabusReorder {
  entityType: ReorderEntityType;
  source: ReorderTriggerSource;
  courseId?: CourseId;
  moduleId: string;
  containerTitle: string;
  itemId: string;
  itemTitle: string;
  fromIndex: number;
  toIndex: number;
  oldPosition: number;
  newPosition: number;
  totalItems: number;
  placementDescription: string;
  impacts: ReorderImpactWarnings;
  orderedModuleIds?: string[];
  topicOverrideInputs?: SyllabusTopicOverrideInput[];
  previousTopicOverrideInputs?: SyllabusTopicOverrideInput[];
  previousModuleIds?: string[];
  successMessage: string;
}

export function describePlacement<T>(
  reordered: T[],
  fromIndex: number,
  toIndex: number,
  getTitle: (item: T) => string
): string {
  if (reordered.length <= 1) return '';
  if (toIndex === 0 && reordered[1]) {
    return `al inicio, antes de «${getTitle(reordered[1])}»`;
  }
  if (toIndex === reordered.length - 1 && reordered[toIndex - 1]) {
    return `al final, después de «${getTitle(reordered[toIndex - 1])}»`;
  }
  if (toIndex < fromIndex && reordered[toIndex + 1]) {
    return `antes de «${getTitle(reordered[toIndex + 1])}»`;
  }
  if (reordered[toIndex - 1]) {
    return `después de «${getTitle(reordered[toIndex - 1])}»`;
  }
  return '';
}

export function buildModuleReorderProposal(params: {
  courseId: CourseId;
  courseTitle: string;
  modules: Array<{ id: string; title: string }>;
  fromIndex: number;
  toIndex: number;
  source: ReorderTriggerSource;
  impacts?: ReorderImpactWarnings;
}): PendingSyllabusReorder | null {
  const { courseId, courseTitle, modules, fromIndex, toIndex, source, impacts = {} } = params;
  if (
    fromIndex === toIndex ||
    fromIndex < 0 ||
    toIndex < 0 ||
    fromIndex >= modules.length ||
    toIndex >= modules.length
  ) {
    return null;
  }
  const item = modules[fromIndex];
  const reordered = moveItem(modules, fromIndex, toIndex);
  return {
    entityType: 'modulo',
    source,
    courseId,
    moduleId: item.id,
    containerTitle: courseTitle,
    itemId: item.id,
    itemTitle: item.title,
    fromIndex,
    toIndex,
    oldPosition: fromIndex + 1,
    newPosition: toIndex + 1,
    totalItems: modules.length,
    placementDescription: describePlacement(reordered, fromIndex, toIndex, (m) => m.title),
    impacts,
    orderedModuleIds: reordered.map((m) => m.id),
    previousModuleIds: modules.map((m) => m.id),
    successMessage: 'Orden de módulos actualizado.',
  };
}

export function buildTopicReorderProposal(params: {
  moduleId: string;
  containerTitle: string;
  siblings: Array<{ id: string; title: string }>;
  overrides: SyllabusTopicOverride[];
  fromIndex: number;
  toIndex: number;
  entityType: 'tema' | 'subtema';
  source: ReorderTriggerSource;
  impacts?: ReorderImpactWarnings;
}): PendingSyllabusReorder | null {
  const {
    moduleId,
    containerTitle,
    siblings,
    overrides,
    fromIndex,
    toIndex,
    entityType,
    source,
    impacts = {},
  } = params;
  if (
    fromIndex === toIndex ||
    fromIndex < 0 ||
    toIndex < 0 ||
    fromIndex >= siblings.length ||
    toIndex >= siblings.length
  ) {
    return null;
  }
  const item = siblings[fromIndex];
  const reordered = moveItem(siblings, fromIndex, toIndex);
  const nextInputs = siblingOverrideInputs(
    reordered.map((t) => t.id),
    moduleId,
    overrides
  );
  const previousInputs = siblingOverrideInputs(
    siblings.map((t) => t.id),
    moduleId,
    overrides
  );

  return {
    entityType,
    source,
    moduleId,
    containerTitle,
    itemId: item.id,
    itemTitle: item.title,
    fromIndex,
    toIndex,
    oldPosition: fromIndex + 1,
    newPosition: toIndex + 1,
    totalItems: siblings.length,
    placementDescription: describePlacement(reordered, fromIndex, toIndex, (t) => t.title),
    impacts,
    topicOverrideInputs: nextInputs,
    previousTopicOverrideInputs: previousInputs,
    successMessage:
      entityType === 'subtema' ? 'Orden de subtemas actualizado.' : 'Orden de temas actualizado.',
  };
}
