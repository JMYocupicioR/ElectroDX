import { getApprovedRevisionCredits, getProfilesByIds } from '../../services/editorialService';
import type { Module } from '../../types/content';
import type { PublishedTopic } from '../../types/database';
import {
  buildTextbookContributors,
  collectTopicEditedAt,
  seedsFromPublishedTopics,
  seedsFromRevisionCredits,
  seedsFromTopicTree,
  type TextbookContributor,
} from './textbookCredits';

export async function loadTextbookContributors(
  publishedTopics: PublishedTopic[],
  modules: Module[],
  showCredentials = true
): Promise<{ contributors: TextbookContributor[]; topicEditedAt: Record<string, string> }> {
  const revisionCredits = await getApprovedRevisionCredits().catch(() => []);
  const topicModule = new Map(publishedTopics.map((topic) => [topic.id, topic.module_id]));
  const seeds = [
    ...seedsFromPublishedTopics(publishedTopics),
    ...seedsFromRevisionCredits(revisionCredits, topicModule),
    ...seedsFromTopicTree(modules),
  ];
  const ids = [...new Set(seeds.map((seed) => seed.userId).filter(Boolean))];
  const profiles = await getProfilesByIds(ids).catch(() => new Map());
  return {
    contributors: buildTextbookContributors(seeds, profiles, showCredentials),
    topicEditedAt: collectTopicEditedAt(publishedTopics, modules),
  };
}
