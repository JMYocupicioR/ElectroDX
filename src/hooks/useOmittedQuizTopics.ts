import { useCallback, useEffect, useState } from 'react';
import {
  QUIZ_OMITTED_EVENT,
  omitQuizTopic,
  readOmittedQuizTopicIds,
  restoreOmittedQuizTopic,
} from '../utils/quizOmittedTopics';

export function useOmittedQuizTopics() {
  const [ids, setIds] = useState<Set<string>>(() => readOmittedQuizTopicIds());

  useEffect(() => {
    const sync = () => setIds(readOmittedQuizTopicIds());
    window.addEventListener(QUIZ_OMITTED_EVENT, sync);
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener(QUIZ_OMITTED_EVENT, sync);
      window.removeEventListener('storage', sync);
    };
  }, []);

  const omit = useCallback((topicId: string) => {
    omitQuizTopic(topicId);
    setIds(readOmittedQuizTopicIds());
  }, []);

  const restore = useCallback((topicId: string) => {
    restoreOmittedQuizTopic(topicId);
    setIds(readOmittedQuizTopicIds());
  }, []);

  return { ids, omit, restore };
}
