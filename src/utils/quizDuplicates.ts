export interface DuplicateHit {
  key: string;
  similar: boolean;
  quizIds: string[];
  topicIds: string[];
}

export function normalizeQuizStem(stem: string): string {
  return stem
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .trim();
}

export function findDuplicateStems(
  questions: { quizId: string; topicId: string; stem: string }[]
): Map<string, DuplicateHit> {
  const exact = new Map<string, { quizIds: Set<string>; topicIds: Set<string>; questionKeys: string[] }>();
  const prefix = new Map<string, { quizIds: Set<string>; topicIds: Set<string>; questionKeys: string[] }>();

  for (const q of questions) {
    const normalized = normalizeQuizStem(q.stem);
    if (!normalized) continue;
    const bucket = exact.get(normalized) ?? { quizIds: new Set(), topicIds: new Set(), questionKeys: [] };
    bucket.quizIds.add(q.quizId);
    bucket.topicIds.add(q.topicId);
    bucket.questionKeys.push(`${q.quizId}:${normalized}`);
    exact.set(normalized, bucket);

    const pre = normalized.slice(0, 60);
    if (pre.length >= 40) {
      const preBucket = prefix.get(pre) ?? { quizIds: new Set(), topicIds: new Set(), questionKeys: [] };
      preBucket.quizIds.add(q.quizId);
      preBucket.topicIds.add(q.topicId);
      preBucket.questionKeys.push(`${q.quizId}:${normalized}`);
      prefix.set(pre, preBucket);
    }
  }

  const hits = new Map<string, DuplicateHit>();
  for (const [key, bucket] of exact) {
    if (bucket.quizIds.size < 2) continue;
    hits.set(key, {
      key,
      similar: false,
      quizIds: [...bucket.quizIds],
      topicIds: [...bucket.topicIds],
    });
  }
  for (const [key, bucket] of prefix) {
    if (bucket.quizIds.size < 2) continue;
    if (hits.has(key)) continue;
    const alreadyExact = [...bucket.quizIds].every((id) =>
      [...hits.values()].some((hit) => hit.quizIds.includes(id) && !hit.similar)
    );
    if (alreadyExact) continue;
    hits.set(`~${key}`, {
      key,
      similar: true,
      quizIds: [...bucket.quizIds],
      topicIds: [...bucket.topicIds],
    });
  }
  return hits;
}
