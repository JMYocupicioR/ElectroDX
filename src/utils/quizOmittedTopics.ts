const STORAGE_KEY = 'neurosafe.quiz-omitted-topic-ids';
export const QUIZ_OMITTED_EVENT = 'neurosafe-quiz-omitted';

function storage(): Storage | null {
  try {
    return typeof localStorage === 'undefined' ? null : localStorage;
  } catch {
    return null;
  }
}

export function readOmittedQuizTopicIds(source: Storage | null = storage()): Set<string> {
  if (!source) return new Set();
  try {
    const raw = source.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(parsed)) return new Set();
    return new Set(parsed.filter((id): id is string => typeof id === 'string' && id.length > 0));
  } catch {
    return new Set();
  }
}

export function writeOmittedQuizTopicIds(ids: ReadonlySet<string>, target: Storage | null = storage()) {
  if (!target) return;
  target.setItem(STORAGE_KEY, JSON.stringify([...ids]));
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event(QUIZ_OMITTED_EVENT));
  }
}

export function omitQuizTopic(topicId: string) {
  const next = readOmittedQuizTopicIds();
  next.add(topicId);
  writeOmittedQuizTopicIds(next);
}

export function restoreOmittedQuizTopic(topicId: string) {
  const next = readOmittedQuizTopicIds();
  next.delete(topicId);
  writeOmittedQuizTopicIds(next);
}
