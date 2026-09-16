import type { Topic } from '../types/content';
import { getMyAttempts } from './quizService';
import { TOPIC_PROGRESS_EVENT } from './studentService';

const KEY_PASSED_QUIZZES = 'neurosafe_student_passed_quizzes_';

export interface QuizCompletionGate {
  quizTopicIds: Set<string>;
  passedQuizTopicIds: Set<string>;
}

export function collectQuizTopicIdsInTree(topic: Topic, quizTopicIds: Set<string>): string[] {
  const found: string[] = [];
  const walk = (node: Topic) => {
    if (quizTopicIds.has(node.id)) found.push(node.id);
    node.children?.forEach(walk);
  };
  walk(topic);
  return found;
}

export function areRequiredQuizzesPassed(
  topic: Topic,
  quizGate?: QuizCompletionGate | null
): boolean {
  if (!quizGate || quizGate.quizTopicIds.size === 0) return true;
  const required = collectQuizTopicIdsInTree(topic, quizGate.quizTopicIds);
  if (required.length === 0) return true;
  return required.every((id) => quizGate.passedQuizTopicIds.has(id));
}

export function topicHasEvaluation(
  topic: Topic,
  quizGate?: QuizCompletionGate | null
): boolean {
  if (!quizGate) return false;
  return collectQuizTopicIdsInTree(topic, quizGate.quizTopicIds).length > 0;
}

export function isQuizTopicPassed(topicId: string, quizGate?: QuizCompletionGate | null): boolean {
  if (!quizGate?.quizTopicIds.has(topicId)) return true;
  return quizGate.passedQuizTopicIds.has(topicId);
}

function persistPassedQuizTopicIds(userId: string, ids: Set<string>) {
  if (!userId) return;
  try {
    localStorage.setItem(`${KEY_PASSED_QUIZZES}${userId}`, JSON.stringify(Array.from(ids)));
  } catch {
    // ignore quota / private mode
  }
}

export function getPassedQuizTopicIdsSync(userId: string): Set<string> {
  if (!userId) return new Set();
  try {
    const raw = localStorage.getItem(`${KEY_PASSED_QUIZZES}${userId}`);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw);
    return new Set(Array.isArray(parsed) ? parsed : []);
  } catch {
    return new Set();
  }
}

export function recordQuizPassed(userId: string, topicId: string): void {
  if (!userId || !topicId) return;
  const current = getPassedQuizTopicIdsSync(userId);
  current.add(topicId);
  persistPassedQuizTopicIds(userId, current);

  if (typeof window === 'undefined') return;
  try {
    window.dispatchEvent(
      new CustomEvent(TOPIC_PROGRESS_EVENT, {
        detail: { userId, timestamp: Date.now() },
      })
    );
  } catch {
    // ignore
  }
}

export async function fetchPassedQuizTopicIds(userId: string): Promise<Set<string>> {
  const merged = getPassedQuizTopicIdsSync(userId);
  if (!userId || userId === 'anonymous_student') return merged;

  try {
    const attempts = await getMyAttempts(userId);
    for (const attempt of attempts) {
      if (attempt.passed && attempt.topic_id) merged.add(attempt.topic_id);
    }
  } catch {
    // keep local cache if cloud attempts are unavailable
  }

  persistPassedQuizTopicIds(userId, merged);
  return merged;
}

export function buildQuizCompletionGate(
  quizTopicIds: Iterable<string>,
  passedQuizTopicIds: Iterable<string>
): QuizCompletionGate {
  return {
    quizTopicIds: quizTopicIds instanceof Set ? quizTopicIds : new Set(quizTopicIds),
    passedQuizTopicIds:
      passedQuizTopicIds instanceof Set ? passedQuizTopicIds : new Set(passedQuizTopicIds),
  };
}
