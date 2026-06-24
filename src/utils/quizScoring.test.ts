import { describe, expect, it } from 'vitest';
import {
  isQuestionCorrect,
  scoreQuiz,
  shuffleOptions,
  shuffleQuestions,
  withPassResult,
} from './quizScoring';
import type { QuizQuestion } from '../types/quiz';

const baseQuestion = (overrides: Partial<QuizQuestion>): QuizQuestion => ({
  id: 'q1',
  quiz_id: 'quiz1',
  sort_order: 0,
  type: 'single',
  stem: 'Pregunta',
  stem_en: null,
  image_url: null,
  image_alt: null,
  options: [
    { id: 'a', text: 'Correcta', isCorrect: true },
    { id: 'b', text: 'Incorrecta', isCorrect: false },
  ],
  explanation: null,
  explanation_en: null,
  difficulty: null,
  ...overrides,
});

describe('isQuestionCorrect', () => {
  it('validates single choice', () => {
    const q = baseQuestion({ type: 'single' });
    expect(isQuestionCorrect(q, ['a'])).toBe(true);
    expect(isQuestionCorrect(q, ['b'])).toBe(false);
  });

  it('validates multiple choice', () => {
    const q = baseQuestion({
      type: 'multiple',
      options: [
        { id: 'a', text: 'A', isCorrect: true },
        { id: 'b', text: 'B', isCorrect: true },
        { id: 'c', text: 'C', isCorrect: false },
      ],
    });
    expect(isQuestionCorrect(q, ['a', 'b'])).toBe(true);
    expect(isQuestionCorrect(q, ['a'])).toBe(false);
    expect(isQuestionCorrect(q, ['a', 'b', 'c'])).toBe(false);
  });
});

describe('scoreQuiz', () => {
  it('computes percentage score', () => {
    const questions = [
      baseQuestion({ id: 'q1' }),
      baseQuestion({
        id: 'q2',
        options: [
          { id: 'x', text: 'X', isCorrect: true },
          { id: 'y', text: 'Y', isCorrect: false },
        ],
      }),
    ];
    const result = scoreQuiz(questions, { q1: ['a'], q2: ['y'] });
    expect(result.score).toBe(50);
    expect(result.answers).toHaveLength(2);
    expect(result.answers[0]?.correct).toBe(true);
    expect(result.answers[1]?.correct).toBe(false);
  });
});

describe('withPassResult', () => {
  it('marks pass when score meets threshold', () => {
    const result = withPassResult(70, 70, []);
    expect(result.passed).toBe(true);
    expect(withPassResult(69, 70, []).passed).toBe(false);
  });
});

describe('shuffle helpers', () => {
  it('preserves order when shuffle disabled', () => {
    const questions = [
      baseQuestion({ id: 'q2', sort_order: 2 }),
      baseQuestion({ id: 'q1', sort_order: 1 }),
    ];
    const ordered = shuffleQuestions(questions, false);
    expect(ordered.map((q) => q.id)).toEqual(['q1', 'q2']);
  });

  it('returns same options when shuffle disabled', () => {
    const options = baseQuestion({}).options;
    expect(shuffleOptions(options, false)).toEqual(options);
  });
});
