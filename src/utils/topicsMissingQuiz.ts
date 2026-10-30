import type { Module, Topic } from '../types/content';
import { getAllFlatTopics } from '../services/contentMerge';

/** Same leaf rule as the topic-quiz catalog: a lesson with text, not a folder. */
export function isQuizEligibleLeaf(topic: Topic): boolean {
  return !topic.children?.length && Boolean(topic.content?.trim() || topic.description?.trim());
}

export type TopicMissingQuiz = {
  topicId: string;
  title: string;
  moduleId: string;
  moduleNumber: number;
  moduleTitle: string;
  /** 1-based place among quiz-eligible lessons, walking the syllabus from topic 1. */
  curriculumIndex: number;
};

export const TOP_TOPICS_MISSING_QUIZ = 5;

/**
 * Lessons that still have no quiz, in syllabus order.
 * Topics that already have questions keep their index so the gaps stay numbered from topic 1.
 */
export function listTopicsMissingQuiz(
  modules: Module[],
  quizTopicIds: ReadonlySet<string>,
): TopicMissingQuiz[] {
  const ordered = [...modules].sort((a, b) => a.number - b.number);
  const missing: TopicMissingQuiz[] = [];
  let curriculumIndex = 0;

  for (const mod of ordered) {
    for (const { topic } of getAllFlatTopics(mod.topics)) {
      if (!isQuizEligibleLeaf(topic)) continue;
      curriculumIndex += 1;
      if (quizTopicIds.has(topic.id)) continue;
      missing.push({
        topicId: topic.id,
        title: topic.title,
        moduleId: mod.id,
        moduleNumber: mod.number,
        moduleTitle: mod.title,
        curriculumIndex,
      });
    }
  }

  return missing;
}

export function topTopicsMissingQuiz(
  modules: Module[],
  quizTopicIds: ReadonlySet<string>,
  limit = TOP_TOPICS_MISSING_QUIZ,
): { topics: TopicMissingQuiz[]; total: number } {
  const all = listTopicsMissingQuiz(modules, quizTopicIds);
  return { topics: all.slice(0, limit), total: all.length };
}
