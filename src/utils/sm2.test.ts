import { describe, expect, it } from 'vitest';
import { reviewSm2 } from './sm2';
import { findDuplicateStems, normalizeQuizStem } from './quizDuplicates';

describe('reviewSm2', () => {
  it('resets interval on again and still updates ease', () => {
    const next = reviewSm2({ intervalDays: 12, ease: 2.5, repetitions: 4 }, 1, 0);
    expect(next.intervalDays).toBe(1);
    expect(next.repetitions).toBe(0);
    expect(next.ease).toBeLessThan(2.5);
    expect(next.dueAt).toBe(new Date(86400000).toISOString());
  });

  it('uses 1 then 6 day intervals on first successful reviews', () => {
    const first = reviewSm2({ intervalDays: 1, ease: 2.5, repetitions: 0 }, 4, 0);
    expect(first.intervalDays).toBe(1);
    expect(first.repetitions).toBe(1);
    const second = reviewSm2(first, 4, 0);
    expect(second.intervalDays).toBe(6);
  });

  it('has no 30-day cap', () => {
    const next = reviewSm2({ intervalDays: 40, ease: 2.5, repetitions: 5 }, 4, 0);
    expect(next.intervalDays).toBe(100);
  });
});

describe('quizDuplicates', () => {
  it('normalizes accents and punctuation', () => {
    expect(normalizeQuizStem('¿Latencia Distál?')).toBe('latencia distal');
  });

  it('flags identical stems across quizzes', () => {
    const hits = findDuplicateStems([
      { quizId: 'a', topicId: 't1', stem: 'Verificar temperatura e impedancia' },
      { quizId: 'b', topicId: 't2', stem: 'verificar TEMPERATURA e impedancia!' },
    ]);
    expect([...hits.values()].some((hit) => !hit.similar && hit.quizIds.includes('a'))).toBe(true);
  });
});
