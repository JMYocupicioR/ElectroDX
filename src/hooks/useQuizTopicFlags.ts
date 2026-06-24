import { useEffect, useMemo, useState } from 'react';
import { isSupabaseConfigured } from '../lib/supabase';
import { getAllQuizFlags } from '../services/quizService';
import type { QuizTopicFlag } from '../types/quiz';

export function useQuizTopicFlags() {
  const [flags, setFlags] = useState<QuizTopicFlag[]>([]);
  const [loading, setLoading] = useState(isSupabaseConfigured);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setFlags([]);
      setLoading(false);
      return;
    }

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

  const byTopicId = useMemo(() => {
    const map = new Map<string, QuizTopicFlag>();
    for (const flag of flags) {
      if (flag.question_count > 0) map.set(flag.topic_id, flag);
    }
    return map;
  }, [flags]);

  const byModuleId = useMemo(() => {
    const map = new Map<string, QuizTopicFlag[]>();
    for (const flag of flags) {
      if (flag.question_count <= 0) continue;
      const list = map.get(flag.module_id) ?? [];
      list.push(flag);
      map.set(flag.module_id, list);
    }
    return map;
  }, [flags]);

  const hasQuiz = (topicId: string) => byTopicId.has(topicId);

  const moduleQuizCount = (moduleId: string) => byModuleId.get(moduleId)?.length ?? 0;

  return { flags, byTopicId, byModuleId, hasQuiz, moduleQuizCount, loading };
}
