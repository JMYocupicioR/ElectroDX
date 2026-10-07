import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../contexts/AuthProvider';
import { getAllQuizFlags } from '../services/quizService';
import { getPassedQuizTopicIdsSync, type QuizCompletionGate } from '../services/quizCompletionGate';
import { fetchPassedQuizTopicIds } from '../services/quizPassedAttempts';
import { TOPIC_PROGRESS_EVENT } from '../services/studentService';
import type { QuizTopicFlag } from '../types/quiz';

export function useQuizTopicFlags() {
  const { user } = useAuth();
  const [flags, setFlags] = useState<QuizTopicFlag[]>([]);
  const [passedTopicIds, setPassedTopicIds] = useState<Set<string>>(
    () => (user?.id ? getPassedQuizTopicIdsSync(user.id) : new Set())
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    getAllQuizFlags()
      .then((data) => {
        if (!cancelled) setFlags(data);
      })
      .catch(() => {
        if (!cancelled) setFlags([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!user?.id) {
      setPassedTopicIds(new Set());
      return;
    }

    let cancelled = false;
    fetchPassedQuizTopicIds(user.id)
      .then((ids) => {
        if (!cancelled) {
          setPassedTopicIds((prev) => {
            if (prev.size === ids.size && [...prev].every((id) => ids.has(id))) {
              return prev;
            }
            return ids;
          });
        }
      })
      .catch(() => {
        if (!cancelled) {
          const fallback = getPassedQuizTopicIdsSync(user.id);
          setPassedTopicIds((prev) => {
            if (prev.size === fallback.size && [...prev].every((id) => fallback.has(id))) {
              return prev;
            }
            return fallback;
          });
        }
      });

    const reloadPassed = (event?: Event) => {
      const customEvt = event as CustomEvent<{ userId?: string }>;
      if (customEvt?.detail?.userId && customEvt.detail.userId !== user.id) {
        return;
      }
      const next = getPassedQuizTopicIdsSync(user.id);
      setPassedTopicIds((prev) => {
        if (prev.size === next.size && [...prev].every((id) => next.has(id))) {
          return prev;
        }
        return next;
      });
    };
    window.addEventListener(TOPIC_PROGRESS_EVENT, reloadPassed);
    return () => {
      cancelled = true;
      window.removeEventListener(TOPIC_PROGRESS_EVENT, reloadPassed);
    };
  }, [user?.id]);

  const allByTopicId = useMemo(() => {
    const map = new Map<string, QuizTopicFlag>();
    for (const flag of flags) {
      if (flag.question_count > 0) map.set(flag.topic_id, flag);
    }
    return map;
  }, [flags]);

  const byTopicId = useMemo(() => {
    const map = new Map<string, QuizTopicFlag>();
    for (const flag of flags) {
      if (
        flag.question_count > 0 &&
        (flag.clinical_validation_status ?? 'pending_review') === 'approved'
      ) {
        map.set(flag.topic_id, flag);
      }
    }
    return map;
  }, [flags]);

  const byModuleId = useMemo(() => {
    const map = new Map<string, QuizTopicFlag[]>();
    for (const flag of flags) {
      if (
        flag.question_count <= 0 ||
        (flag.clinical_validation_status ?? 'pending_review') !== 'approved'
      ) {
        continue;
      }
      const list = map.get(flag.module_id) ?? [];
      list.push(flag);
      map.set(flag.module_id, list);
    }
    return map;
  }, [flags]);

  const quizTopicIds = useMemo(() => new Set(byTopicId.keys()), [byTopicId]);

  const quizGate: QuizCompletionGate = useMemo(
    () => ({
      quizTopicIds,
      passedQuizTopicIds: passedTopicIds,
    }),
    [quizTopicIds, passedTopicIds]
  );

  const hasQuiz = (topicId: string) => byTopicId.has(topicId);
  const hasAnyQuiz = (topicId: string) => allByTopicId.has(topicId);
  const hasPassedQuiz = (topicId: string) => passedTopicIds.has(topicId);
  const moduleQuizCount = (moduleId: string) => byModuleId.get(moduleId)?.length ?? 0;

  return {
    flags,
    byTopicId,
    allByTopicId,
    byModuleId,
    hasQuiz,
    hasAnyQuiz,
    hasPassedQuiz,
    passedTopicIds,
    quizGate,
    moduleQuizCount,
    loading,
  };
}
