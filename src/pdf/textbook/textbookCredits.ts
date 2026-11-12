import type { Module, Topic } from '../../types/content';
import type { Profile, PublishedTopic } from '../../types/database';

export type ContributorRole = 'editor' | 'publisher' | 'contributor';

export interface TopicCreditSeed {
  topicId: string;
  moduleId: string;
  userId: string;
  role: ContributorRole;
  at?: string;
  survivingWords?: number;
  authorSharePct?: number;
  isPrincipalAuthor?: boolean;
  authorRank?: number;
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
  wordsByTopic?: Record<string, number>;
  principalTopicIds?: string[];
  totalSurvivingWords?: number;
}

export interface RevisionCreditRow {
  topicId: string;
  moduleId?: string;
  authorId: string;
  at?: string;
  survivingWords?: number;
  authorSharePct?: number;
  isPrincipalAuthor?: boolean;
  authorRank?: number;
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
    .filter((row) => row.topicId && row.authorId && (row.survivingWords === undefined || row.survivingWords > 0))
    .map((row) => ({
      topicId: row.topicId,
      moduleId: row.moduleId || topicModule.get(row.topicId) || '',
      userId: row.authorId,
      role: row.isPrincipalAuthor ? ('editor' as const) : ('contributor' as const),
      at: row.at,
      survivingWords: row.survivingWords,
      authorSharePct: row.authorSharePct,
      isPrincipalAuthor: row.isPrincipalAuthor,
      authorRank: row.authorRank,
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
      const wordsByTopic: Record<string, number> = {};
      if (typeof seed.survivingWords === 'number' && seed.survivingWords > 0) {
        wordsByTopic[seed.topicId] = seed.survivingWords;
      }
      byId.set(seed.userId, {
        id: seed.userId,
        name,
        credentials,
        label: formatContributorLabel(name, credentials, showCredentials),
        role: seed.role,
        topicIds: [seed.topicId],
        moduleIds: seed.moduleId ? [seed.moduleId] : [],
        lastAt: seed.at,
        wordsByTopic,
        principalTopicIds: seed.isPrincipalAuthor ? [seed.topicId] : [],
        totalSurvivingWords: seed.survivingWords ?? 0,
      });
      continue;
    }
    if (!existing.topicIds.includes(seed.topicId)) existing.topicIds.push(seed.topicId);
    if (seed.moduleId && !existing.moduleIds.includes(seed.moduleId)) existing.moduleIds.push(seed.moduleId);
    if (ROLE_RANK[seed.role] > ROLE_RANK[existing.role]) existing.role = seed.role;
    if (seed.at && (!existing.lastAt || seed.at > existing.lastAt)) existing.lastAt = seed.at;
    if (typeof seed.survivingWords === 'number' && seed.survivingWords > 0) {
      existing.wordsByTopic = existing.wordsByTopic ?? {};
      existing.wordsByTopic[seed.topicId] = Math.max(
        existing.wordsByTopic[seed.topicId] ?? 0,
        seed.survivingWords
      );
      existing.totalSurvivingWords = Object.values(existing.wordsByTopic).reduce((a, b) => a + b, 0);
    }
    if (seed.isPrincipalAuthor) {
      existing.principalTopicIds = existing.principalTopicIds ?? [];
      if (!existing.principalTopicIds.includes(seed.topicId)) {
        existing.principalTopicIds.push(seed.topicId);
      }
    }
    if (profile?.display_name) {
      existing.name = profile.display_name;
      existing.credentials = profile.credentials ?? existing.credentials;
      existing.label = formatContributorLabel(existing.name, existing.credentials, showCredentials);
    }
  }

  return [...byId.values()].sort(
    (a, b) =>
      (b.totalSurvivingWords ?? 0) - (a.totalSurvivingWords ?? 0) ||
      ROLE_RANK[b.role] - ROLE_RANK[a.role] ||
      a.name.localeCompare(b.name, 'es')
  );
}

export function contributorsForTopics(
  all: TextbookContributor[],
  topicIds: Iterable<string>,
  disabledAuthorIds: Iterable<string> = []
): TextbookContributor[] {
  const wanted = new Set(topicIds);
  const disabled = new Set(disabledAuthorIds);
  const filtered = all.filter(
    (person) => !disabled.has(person.id) && person.topicIds.some((id) => wanted.has(id))
  );

  // Reglamento Editorial Art. 8: aparece primero como Autor Principal quien supere >50% de las palabras del tema,
  // seguido de los coautores según el aporte de palabras de cada quien.
  return filtered.sort((a, b) => {
    const aPrincipal = (a.principalTopicIds ?? []).some((id) => wanted.has(id)) ? 1 : 0;
    const bPrincipal = (b.principalTopicIds ?? []).some((id) => wanted.has(id)) ? 1 : 0;
    if (aPrincipal !== bPrincipal) return bPrincipal - aPrincipal;

    let aWords = 0;
    let bWords = 0;
    for (const tid of wanted) {
      aWords += a.wordsByTopic?.[tid] ?? 0;
      bWords += b.wordsByTopic?.[tid] ?? 0;
    }
    if (aWords !== bWords) return bWords - aWords;
    if (ROLE_RANK[a.role] !== ROLE_RANK[b.role]) return ROLE_RANK[b.role] - ROLE_RANK[a.role];
    return a.name.localeCompare(b.name, 'es');
  });
}

export function contributorsForModule(
  all: TextbookContributor[],
  moduleId: string,
  disabledAuthorIds: Iterable<string> = []
): TextbookContributor[] {
  const disabled = new Set(disabledAuthorIds);
  return all
    .filter((person) => !disabled.has(person.id) && person.moduleIds.includes(moduleId))
    .sort(
      (a, b) =>
        (b.totalSurvivingWords ?? 0) - (a.totalSurvivingWords ?? 0) ||
        (b.principalTopicIds?.length ?? 0) - (a.principalTopicIds?.length ?? 0) ||
        ROLE_RANK[b.role] - ROLE_RANK[a.role] ||
        a.name.localeCompare(b.name, 'es')
    );
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
