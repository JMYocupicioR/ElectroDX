import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthProvider';
import { Topic } from '../types/content';
import {
  getCompletedTopics,
  getVisitedTopics,
  toggleTopicCompleted,
  markTopicCompleted,
  markTopicPending,
  markMultipleTopics,
  markTopicVisited,
  TOPIC_PROGRESS_EVENT,
  getAllTopicIds,
} from '../services/studentService';
import { getAllLeafTopicIds, getLeafTopicIds, isCurriculumNodeCompleted } from '../services/studentResume';
import { areRequiredQuizzesPassed } from '../services/quizCompletionGate';
import { useQuizTopicFlags } from './useQuizTopicFlags';

export { getLeafTopicIds, getAllLeafTopicIds } from '../services/studentResume';

export type TopicProgressStatus = 'completed' | 'in_progress' | 'pending';

export interface ParentTopicStats {
  total: number;
  completed: number;
  pending: number;
  percent: number;
  status: TopicProgressStatus;
}

export interface ModuleProgressStats {
  total: number;
  completed: number;
  pending: number;
  percent: number;
  isFullyCompleted: boolean;
}

export function useTopicProgress(overrideUserId?: string) {
  const { user } = useAuth();
  const activeUserId = overrideUserId || user?.id || 'anonymous_student';
  const { quizGate } = useQuizTopicFlags();

  const [completedTopicIds, setCompletedTopicIds] = useState<Set<string>>(() =>
    getCompletedTopics(activeUserId)
  );
  const [visitedTopicIds, setVisitedTopicIds] = useState<Set<string>>(() =>
    getVisitedTopics(activeUserId)
  );

  const reload = useCallback(() => {
    setCompletedTopicIds(getCompletedTopics(activeUserId));
    setVisitedTopicIds(getVisitedTopics(activeUserId));
  }, [activeUserId]);

  useEffect(() => {
    reload();

    const handleProgressUpdate = (e: Event) => {
      const customEvent = e as CustomEvent<{ userId?: string }>;
      if (!customEvent.detail?.userId || customEvent.detail.userId === activeUserId) {
        reload();
      }
    };

    const handleStorage = (e: StorageEvent) => {
      if (e.key && e.key.includes(activeUserId)) {
        reload();
      }
    };

    window.addEventListener(TOPIC_PROGRESS_EVENT, handleProgressUpdate);
    window.addEventListener('storage', handleStorage);

    return () => {
      window.removeEventListener(TOPIC_PROGRESS_EVENT, handleProgressUpdate);
      window.removeEventListener('storage', handleStorage);
    };
  }, [activeUserId, reload]);

  /**
   * Check whether a topic is completed.
   * If childTopicIds are provided, checks if either the topic itself or all its children are completed.
   */
  const isCompleted = useCallback(
    (topicId: string, childTopicIds?: string[]): boolean => {
      if (quizGate.quizTopicIds.has(topicId) && !quizGate.passedQuizTopicIds.has(topicId)) {
        return false;
      }
      if (childTopicIds?.some((cid) => quizGate.quizTopicIds.has(cid) && !quizGate.passedQuizTopicIds.has(cid))) {
        return false;
      }
      if (completedTopicIds.has(topicId)) return true;
      if (childTopicIds && childTopicIds.length > 0) {
        return childTopicIds.every((cid) => completedTopicIds.has(cid));
      }
      return false;
    },
    [completedTopicIds, quizGate]
  );

  const isVisited = useCallback(
    (topicId: string): boolean => {
      return visitedTopicIds.has(topicId);
    },
    [visitedTopicIds]
  );

  const isPending = useCallback(
    (topicId: string, childTopicIds?: string[]): boolean => {
      return !isCompleted(topicId, childTopicIds);
    },
    [isCompleted]
  );

  /**
   * Get three-state status for any topic (parent or leaf)
   */
  const getTopicStatus = useCallback(
    (topic: Topic): TopicProgressStatus => {
      if (isCurriculumNodeCompleted(topic, completedTopicIds, quizGate)) return 'completed';

      if (topic.children && topic.children.length > 0) {
        const leafIds = getLeafTopicIds(topic);
        const completedCount = leafIds.filter((id) => {
          if (quizGate.quizTopicIds.has(id) && !quizGate.passedQuizTopicIds.has(id)) return false;
          return completedTopicIds.has(id);
        }).length;
        if (completedCount > 0) return 'in_progress';
        return 'pending';
      }

      if (visitedTopicIds.has(topic.id)) return 'in_progress';
      return 'pending';
    },
    [completedTopicIds, visitedTopicIds, quizGate]
  );

  /**
   * Get completion statistics for a parent topic and its subtopics
   */
  const getParentTopicStats = useCallback(
    (topic: Topic): ParentTopicStats => {
      const leafIds = getLeafTopicIds(topic);
      const total = leafIds.length;
      const completed = leafIds.filter((id) => {
        if (quizGate.quizTopicIds.has(id) && !quizGate.passedQuizTopicIds.has(id)) return false;
        return completedTopicIds.has(id);
      }).length;
      const pending = Math.max(0, total - completed);
      const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
      const quizzesPassed = areRequiredQuizzesPassed(topic, quizGate);
      let status: TopicProgressStatus = 'pending';
      if (completed === total && total > 0 && quizzesPassed) {
        status = 'completed';
      } else if (completed > 0) {
        status = 'in_progress';
      }

      return { total, completed, pending, percent, status };
    },
    [completedTopicIds, quizGate]
  );

  /**
   * Toggle completion for a topic.
   * If it is a parent topic, toggles all its descendant topics and the parent itself.
   */
  const toggleTopic = useCallback(
    (topic: Topic): boolean => {
      if (topic.children && topic.children.length > 0) {
        const leafIds = getLeafTopicIds(topic);
        const allDescendantIds = getAllTopicIds([topic]);
        const allLeavesDone = leafIds.every((id) => completedTopicIds.has(id));
        const shouldComplete = !allLeavesDone;

        if (shouldComplete && !areRequiredQuizzesPassed(topic, quizGate)) {
          return false;
        }

        markMultipleTopics(activeUserId, allDescendantIds, shouldComplete);
        return shouldComplete;
      }

      if (!completedTopicIds.has(topic.id) && !areRequiredQuizzesPassed(topic, quizGate)) {
        return false;
      }

      const nextState = toggleTopicCompleted(activeUserId, topic.id);
      return nextState;
    },
    [activeUserId, completedTopicIds, quizGate]
  );

  const markCompleted = useCallback(
    (topicId: string) => {
      markTopicCompleted(activeUserId, topicId);
    },
    [activeUserId]
  );

  const markPending = useCallback(
    (topicId: string) => {
      markTopicPending(activeUserId, topicId);
    },
    [activeUserId]
  );

  const markVisited = useCallback(
    (topicId: string) => {
      markTopicVisited(activeUserId, topicId);
    },
    [activeUserId]
  );

  const markSection = useCallback(
    (topics: Topic[], completed: boolean) => {
      if (!completed) {
        markMultipleTopics(activeUserId, getAllTopicIds(topics), false);
        return;
      }

      const allowedIds: string[] = [];
      const walk = (node: Topic) => {
        if (areRequiredQuizzesPassed(node, quizGate)) {
          allowedIds.push(node.id);
        }
        node.children?.forEach(walk);
      };
      topics.forEach(walk);
      if (allowedIds.length > 0) {
        markMultipleTopics(activeUserId, allowedIds, true);
      }
    },
    [activeUserId, quizGate]
  );

  /**
   * Calculate overall module completion metrics
   */
  const getModuleStats = useCallback(
    (moduleTopics: Topic[]): ModuleProgressStats => {
      const leafIds = getAllLeafTopicIds(moduleTopics);
      const total = leafIds.length;
      const completed = leafIds.filter((id) => {
        if (quizGate.quizTopicIds.has(id) && !quizGate.passedQuizTopicIds.has(id)) return false;
        return completedTopicIds.has(id);
      }).length;
      const pending = Math.max(0, total - completed);
      const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
      const quizzesOk = moduleTopics.every((topic) => areRequiredQuizzesPassed(topic, quizGate));
      const isFullyCompleted = total > 0 && completed === total && quizzesOk;

      return {
        total,
        completed,
        pending,
        percent,
        isFullyCompleted,
      };
    },
    [completedTopicIds, quizGate]
  );

  return {
    activeUserId,
    completedTopicIds,
    visitedTopicIds,
    isCompleted,
    isVisited,
    isPending,
    getTopicStatus,
    getParentTopicStats,
    toggleTopic,
    markCompleted,
    markPending,
    markVisited,
    markSection,
    getModuleStats,
    quizGate,
    reload,
  };
}
