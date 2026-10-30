import type { AccessTier } from '../types/database';

export interface TopicOpenAccessRow {
  required_tier: AccessTier;
  preview_topic_ids: string[] | null;
}

/** Tema visible para quien tiene cuenta, sin inscripción al nivel. */
export function isTopicOpenToRegistered(
  access: TopicOpenAccessRow | undefined,
  topicIds: string[],
): boolean {
  if (!access || topicIds.length === 0) return false;
  if (access.required_tier === 'free') return true;
  const open = new Set(access.preview_topic_ids ?? []);
  return topicIds.some((id) => open.has(id));
}

export function moduleHasRegisteredTopics(access: TopicOpenAccessRow | undefined): boolean {
  if (!access) return false;
  if (access.required_tier === 'free') return true;
  return (access.preview_topic_ids?.length ?? 0) > 0;
}

export function currentOpenTopicIds(
  access: TopicOpenAccessRow | undefined,
  allTopicIds: string[],
): string[] {
  if (!access) return [];
  if (access.required_tier === 'free') return [...allTopicIds];
  const known = new Set(allTopicIds);
  return (access.preview_topic_ids ?? []).filter((id) => known.has(id));
}

export function nextOpenTopicIds(
  access: TopicOpenAccessRow | undefined,
  allTopicIds: string[],
  toggleIds: string[],
  open: boolean,
): string[] {
  const next = new Set(currentOpenTopicIds(access, allTopicIds));
  for (const id of toggleIds) {
    if (!allTopicIds.includes(id)) continue;
    if (open) next.add(id);
    else next.delete(id);
  }
  return allTopicIds.filter((id) => next.has(id));
}

export function accessWriteForOpenTopics(
  openIds: string[],
  allTopicIds: string[],
): { tier: AccessTier; previewTopicIds: string[] } {
  if (allTopicIds.length > 0 && openIds.length === allTopicIds.length) {
    return { tier: 'free', previewTopicIds: [] };
  }
  return { tier: 'premium', previewTopicIds: openIds };
}
