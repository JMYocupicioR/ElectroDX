import type { Module, Topic } from '../../types/content';
import type { Profile, PublishedTopic } from '../../types/database';

export type ContributorRole = 'editor' | 'publisher' | 'contributor';

export interface TopicCreditSeed {
  topicId: string;
  moduleId: string;
  userId: string;
  role: ContributorRole;
  at?: string;
}

export interface TextbookContributor {
  id: string;
  name: string;
  credentials: string | null;
  label: string;
  role: ContributorRole;
  topicIds: string[];
  moduleIds: string[];
  lastAt?: string;
}

export interface RevisionCreditRow {
  topicId: string;
  moduleId?: string;
  authorId: string;
  at?: string;
}

const ROLE_RANK: Record<ContributorRole, number> = {
  editor: 3,
  publisher: 2,
  contributor: 1,
};

export function formatContributorLabel(name: string, credentials: string | null, showCredentials: boolean): string {
  const cleanName = name.trim() || 'Colaborador';
  if (showCredentials && credentials?.trim()) return `${cleanName}, ${credentials.trim()}`;
  return cleanName;
}

export function seedsFromPublishedTopics(topics: PublishedTopic[]): TopicCreditSeed[] {
  const seeds: TopicCreditSeed[] = [];
  for (const topic of topics) {
    if (topic.last_edited_by) {
      seeds.push({
        topicId: topic.id,
        moduleId: topic.module_id,
        userId: topic.last_edited_by,
        role: 'editor',
        at: topic.published_at,
      });
    }
    if (topic.published_by && topic.published_by !== topic.last_edited_by) {
      seeds.push({
        topicId: topic.id,
        moduleId: topic.module_id,
        userId: topic.published_by,
        role: 'publisher',
        at: topic.published_at,
      });
    }
  }
  return seeds;
}

export function seedsFromRevisionCredits(
  rows: RevisionCreditRow[],
  topicModule: Map<string, string>
): TopicCreditSeed[] {
  return rows
    .filter((row) => row.topicId && row.authorId)
    .map((row) => ({
      topicId: row.topicId,
      moduleId: row.moduleId || topicModule.get(row.topicId) || '',
      userId: row.authorId,
      role: 'contributor' as const,
      at: row.at,
    }));
}

export function buildTextbookContributors(
  seeds: TopicCreditSeed[],
  profiles: Map<string, Profile>,
  showCredentials = true
): TextbookContributor[] {
  const byId = new Map<string, TextbookContributor>();

  for (const seed of seeds) {
    if (!seed.userId) continue;
    const profile = profiles.get(seed.userId);
    const name = profile?.display_name?.trim() || 'Colaborador editorial';
    const credentials = profile?.credentials ?? null;
    const existing = byId.get(seed.userId);
    if (!existing) {
      byId.set(seed.userId, {
        id: seed.userId,
        name,
        credentials,
        label: formatContributorLabel(name, credentials, showCredentials),
        role: seed.role,
        topicIds: [seed.topicId],
        moduleIds: seed.moduleId ? [seed.moduleId] : [],
        lastAt: seed.at,
      });
      continue;
    }
    if (!existing.topicIds.includes(seed.topicId)) existing.topicIds.push(seed.topicId);
    if (seed.moduleId && !existing.moduleIds.includes(seed.moduleId)) existing.moduleIds.push(seed.moduleId);
    if (ROLE_RANK[seed.role] > ROLE_RANK[existing.role]) existing.role = seed.role;
    if (seed.at && (!existing.lastAt || seed.at > existing.lastAt)) existing.lastAt = seed.at;
    if (profile?.display_name) {
      existing.name = profile.display_name;
      existing.credentials = profile.credentials ?? existing.credentials;
      existing.label = formatContributorLabel(existing.name, existing.credentials, showCredentials);
    }
  }

  return [...byId.values()].sort((a, b) => a.name.localeCompare(b.name, 'es'));
}

export function contributorsForTopics(
  all: TextbookContributor[],
  topicIds: Iterable<string>,
  disabledAuthorIds: Iterable<string> = []
): TextbookContributor[] {
  const wanted = new Set(topicIds);
  const disabled = new Set(disabledAuthorIds);
  return all.filter((person) => !disabled.has(person.id) && person.topicIds.some((id) => wanted.has(id)));
}

export function contributorsForModule(
  all: TextbookContributor[],
  moduleId: string,
  disabledAuthorIds: Iterable<string> = []
): TextbookContributor[] {
  const disabled = new Set(disabledAuthorIds);
  return all.filter((person) => !disabled.has(person.id) && person.moduleIds.includes(moduleId));
}

export function formatEditedDate(iso: string | undefined, lang: 'es' | 'en'): string | undefined {
  if (!iso) return undefined;
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return undefined;
  return new Intl.DateTimeFormat(lang === 'en' ? 'en-US' : 'es-MX', { dateStyle: 'medium' }).format(date);
}

export function seedsFromTopicTree(modules: Module[]): TopicCreditSeed[] {
  const seeds: TopicCreditSeed[] = [];
  const walk = (topics: Topic[], moduleId: string) => {
    for (const topic of topics) {
      if (topic.contributionMeta?.lastEditedBy) {
        seeds.push({
          topicId: topic.id,
          moduleId,
          userId: topic.contributionMeta.lastEditedBy,
          role: 'editor',
          at: topic.contributionMeta.publishedAt,
        });
      }
      if (topic.children?.length) walk(topic.children, moduleId);
    }
  };
  for (const mod of modules) walk(mod.topics, mod.id);
  return seeds;
}

export function collectTopicEditedAt(
  publishedTopics: PublishedTopic[],
  modules: Module[]
): Record<string, string> {
  const out: Record<string, string> = {};
  for (const topic of publishedTopics) {
    if (topic.published_at) out[topic.id] = topic.published_at;
  }
  const walk = (topics: Topic[]) => {
    for (const topic of topics) {
      if (topic.contributionMeta?.publishedAt && !out[topic.id]) {
        out[topic.id] = topic.contributionMeta.publishedAt;
      }
      if (topic.children?.length) walk(topic.children);
    }
  };
  for (const mod of modules) walk(mod.topics);
  return out;
}

export function contributorRoleLabel(role: ContributorRole, lang: 'es' | 'en'): string {
  if (lang === 'en') {
    return { editor: 'Editor', publisher: 'Publisher', contributor: 'Reviewer' }[role];
  }
  return { editor: 'Edición', publisher: 'Publicación', contributor: 'Revisión' }[role];
}
