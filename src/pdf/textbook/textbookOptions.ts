import type { Topic } from '../../types/content';
import type { TextbookInclusion } from './buildTextbookModel';

export interface TopicPrintOverride {
  included?: boolean;
  outlineOnly?: boolean;
  description?: boolean;
  body?: boolean;
  pearls?: boolean;
  keyPoints?: boolean;
  images?: boolean;
  teachingPdfs?: boolean;
  bibliography?: boolean;
  authors?: boolean;
  editedDate?: boolean;
}

export interface TextbookCreditOptions {
  showCoverCredits: boolean;
  showChapterCredits: boolean;
  showLessonCredits: boolean;
  showCredentials: boolean;
  showEditedDates: boolean;
  disabledAuthorIds: string[];
}

export const DEFAULT_CREDIT_OPTIONS: TextbookCreditOptions = {
  showCoverCredits: true,
  showChapterCredits: true,
  showLessonCredits: false,
  showCredentials: true,
  showEditedDates: true,
  disabledAuthorIds: [],
};

export function resolveCreditOptions(partial?: Partial<TextbookCreditOptions>): TextbookCreditOptions {
  return {
    ...DEFAULT_CREDIT_OPTIONS,
    ...partial,
    disabledAuthorIds: Array.isArray(partial?.disabledAuthorIds) ? partial.disabledAuthorIds : DEFAULT_CREDIT_OPTIONS.disabledAuthorIds,
  };
}

export function resolveTopicOverride(raw?: TopicPrintOverride): TopicPrintOverride {
  return raw ? { ...raw } : {};
}

export function isTopicIncluded(topicId: string, path: string[], overrides: Record<string, TopicPrintOverride>): boolean {
  if (path.some((id) => overrides[id]?.included === false)) return false;
  return overrides[topicId]?.included !== false;
}

export function resolveTopicInclusion(
  global: TextbookInclusion,
  override: TopicPrintOverride | undefined
): TextbookInclusion & { authors: boolean; editedDate: boolean; outlineOnly: boolean } {
  const ov = override ?? {};
  if (ov.outlineOnly) {
    return {
      description: ov.description ?? true,
      body: false,
      pearls: false,
      keyPoints: false,
      images: false,
      bibliography: false,
      teachingPdfs: false,
      authors: ov.authors ?? true,
      editedDate: ov.editedDate ?? true,
      outlineOnly: true,
    };
  }
  return {
    description: ov.description ?? global.description,
    body: ov.body ?? global.body,
    pearls: ov.pearls ?? global.pearls,
    keyPoints: ov.keyPoints ?? global.keyPoints,
    images: ov.images ?? global.images,
    bibliography: ov.bibliography ?? global.bibliography,
    teachingPdfs: ov.teachingPdfs ?? global.teachingPdfs,
    authors: ov.authors ?? true,
    editedDate: ov.editedDate ?? true,
    outlineOnly: false,
  };
}

export function toggleAuthorDisabled(disabled: string[], authorId: string): string[] {
  return disabled.includes(authorId) ? disabled.filter((id) => id !== authorId) : [...disabled, authorId];
}

export function flattenTopics(
  topics: Topic[],
  depth = 0,
  path: string[] = []
): { topic: Topic; depth: number; path: string[] }[] {
  const out: { topic: Topic; depth: number; path: string[] }[] = [];
  for (const topic of topics) {
    const nextPath = [...path, topic.id];
    out.push({ topic, depth, path: nextPath });
    if (topic.children?.length) out.push(...flattenTopics(topic.children, depth + 1, nextPath));
  }
  return out;
}

export function pruneTopicOverride(override: TopicPrintOverride | undefined): TopicPrintOverride | undefined {
  if (!override) return undefined;
  const next: TopicPrintOverride = {};
  (Object.keys(override) as (keyof TopicPrintOverride)[]).forEach((key) => {
    if (override[key] !== undefined) next[key] = override[key];
  });
  return Object.keys(next).length ? next : undefined;
}

export function patchTopicOverride(
  current: Record<string, TopicPrintOverride>,
  topicId: string,
  patch: TopicPrintOverride
): Record<string, TopicPrintOverride> {
  const next = pruneTopicOverride({ ...current[topicId], ...patch });
  const all = { ...current };
  if (!next) delete all[topicId];
  else all[topicId] = next;
  return all;
}
