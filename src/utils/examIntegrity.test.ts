import { describe, expect, it } from 'vitest';
import {
  applyExamReveal,
  parseExamAnswerReveal,
  parseExamAnswerRevealMap,
  questionsHaveAnswerKeys,
  stripExamAnswerKeys,
} from './examIntegrity';
import type { ExamQuestion } from '../types/exam';

const keyed: ExamQuestion = {
  id: 'q1',
  island_name: 'EMG',
  module_id: 'nerve-conduction',
  topic_name: 'Reflejo H',
  stem: 'Viñeta',
  findings: [],
  options: [
    { text: 'A', is_correct: true, feedback: 'clave A' },
    { text: 'B', is_correct: false, feedback: 'no es B' },
  ],
  difficulty: 2,
  is_critical: true,
  pearl: 'Perla secreta',
  source_reference: 'Preston',
  tags: [],
  status: 'PUBLISHED',
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-01-01T00:00:00Z',
};

describe('stripExamAnswerKeys', () => {
  it('elimina is_correct, feedback, perla y referencia', () => {
    const stripped = stripExamAnswerKeys(keyed);
    expect(stripped.options.every(o => o.is_correct === false)).toBe(true);
    expect(stripped.options.every(o => o.feedback === '')).toBe(true);
    expect(stripped.pearl).toBeUndefined();
    expect(stripped.source_reference).toBeUndefined();
    expect(stripped.options.map(o => o.text)).toEqual(['A', 'B']);
    expect(questionsHaveAnswerKeys([stripped])).toBe(false);
    expect(questionsHaveAnswerKeys([keyed])).toBe(true);
  });

  it('es idempotente', () => {
    const once = stripExamAnswerKeys(keyed);
    expect(stripExamAnswerKeys(once)).toEqual(once);
  });
});

describe('exam answer reveals', () => {
  it('parsea snake_case y camelCase', () => {
    const reveal = parseExamAnswerReveal({
      question_id: 'q1',
      is_correct: true,
      selected_index: 0,
      correct_index: 0,
      correct_feedback: 'clave A',
    });
    expect(reveal).toMatchObject({
      questionId: 'q1',
      isCorrect: true,
      selectedIndex: 0,
      correctIndex: 0,
      correctFeedback: 'clave A',
    });
  });

  it('reconstruye is_correct en la opción revelada, no en las demás', () => {
    const stripped = stripExamAnswerKeys(keyed);
    const applied = applyExamReveal(stripped, {
      questionId: 'q1',
      isCorrect: false,
      selectedIndex: 1,
      correctIndex: 0,
      selectedFeedback: 'no es B',
      correctFeedback: 'clave A',
      pearl: 'Perla secreta',
    });
    expect(applied.options[0].is_correct).toBe(true);
    expect(applied.options[1].is_correct).toBe(false);
    expect(applied.options[0].feedback).toBe('clave A');
    expect(applied.pearl).toBe('Perla secreta');
  });

  it('arma un mapa desde el objeto que devuelve get_exam_attempt_reveals', () => {
    const map = parseExamAnswerRevealMap({
      q1: { isCorrect: true, selectedIndex: 0, correctIndex: 0 },
    });
    expect(map.q1.isCorrect).toBe(true);
    expect(map.q1.questionId).toBe('q1');
  });
});
