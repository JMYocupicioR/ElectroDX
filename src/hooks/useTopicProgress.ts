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

/**
 * Extract all leaf topic IDs (topics that contain actual study content and no children)
 */
export function getLeafTopicIds(topic: Topic): string[] {
  if (!topic.children || topic.children.length === 0) {
    return [topic.id];
  }
  return topic.children.flatMap(getLeafTopicIds);
}

/**
 * Extract all leaf topic IDs across a list of topics
 */
export function getAllLeafTopicIds(topics: Topic[]): string[] {
  return topics.flatMap(getLeafTopicIds);
}

export function useTopicProgress(overrideUserId?: string) {
  const { user } = useAuth();
  const activeUserId = overrideUserId || user?.id || 'anonymous_student';

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
      if (completedTopicIds.has(topicId)) return true;
      if (childTopicIds && childTopicIds.length > 0) {
        return childTopicIds.every((cid) => completedTopicIds.has(cid));
      }
      return false;
    },
    [completedTopicIds]
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
      if (topic.children && topic.children.length > 0) {
        const leafIds = getLeafTopicIds(topic);
        const completedCount = leafIds.filter((id) => completedTopicIds.has(id)).length;
        if (completedCount === leafIds.length) return 'completed';
        if (completedCount > 0) return 'in_progress';
        return 'pending';
      }

      if (completedTopicIds.has(topic.id)) return 'completed';
      if (visitedTopicIds.has(topic.id)) return 'in_progress';
      return 'pending';
    },
    [completedTopicIds, visitedTopicIds]
  );

  /**
   * Get completion statistics for a parent topic and its subtopics
   */
  const getParentTopicStats = useCallback(
    (topic: Topic): ParentTopicStats => {
      const leafIds = getLeafTopicIds(topic);
      const total = leafIds.length;
      const completed = leafIds.filter((id) => completedTopicIds.has(id)).length;
      const pending = Math.max(0, total - completed);
      const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
      let status: TopicProgressStatus = 'pending';
      if (completed === total && total > 0) {
        status = 'completed';
      } else if (completed > 0) {
        status = 'in_progress';
      }

      return { total, completed, pending, percent, status };
    },
    [completedTopicIds]
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

        markMultipleTopics(activeUserId, allDescendantIds, shouldComplete);
        return shouldComplete;
      }

      // Single leaf topic
      const nextState = toggleTopicCompleted(activeUserId, topic.id);
      return nextState;
    },
    [activeUserId, completedTopicIds]
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
      const allIds = getAllTopicIds(topics);
      markMultipleTopics(activeUserId, allIds, completed);
    },
    [activeUserId]
  );

  /**
   * Calculate overall module completion metrics
   */
  const getModuleStats = useCallback(
    (moduleTopics: Topic[]): ModuleProgressStats => {
      const leafIds = getAllLeafTopicIds(moduleTopics);
      const total = leafIds.length;
      const completed = leafIds.filter((id) => completedTopicIds.has(id)).length;
      const pending = Math.max(0, total - completed);
      const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
      const isFullyCompleted = total > 0 && completed === total;

      return {
        total,
        completed,
        pending,
        percent,
        isFullyCompleted,
      };
    },
    [completedTopicIds]
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
    reload,
  };
}
