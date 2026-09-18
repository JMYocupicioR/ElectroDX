import { getMyAttempts } from './quizService';
import { getPassedQuizTopicIdsSync, persistPassedQuizTopicIds } from './quizCompletionGate';

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
