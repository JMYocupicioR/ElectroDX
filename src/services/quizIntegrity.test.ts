import { describe, expect, it } from 'vitest';
import { LOCAL_PUBLISHED_QUIZZES, getLocalQuizForTopic } from '../services/localQuizzesFallback';

describe('quiz academic integrity', () => {
  it('does not ship published quiz answers in the client fallback', () => {
    expect(Object.keys(LOCAL_PUBLISHED_QUIZZES)).toHaveLength(0);
    expect(getLocalQuizForTopic('voltage-current')).toBeNull();
  });
});
