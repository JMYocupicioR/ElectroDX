import { describe, expect, it } from 'vitest';
import {
  applyOptionOrder,
  prepareExamQuestions,
  randomOptionOrder,
  restoreExamQuestions,
  withRandomOptionOrder,
} from './examQuestionOrder';
import type { ExamConfig, ExamQuestion } from '../types/exam';

const question = (overrides: Partial<ExamQuestion> = {}): ExamQuestion => ({
  id: 'q1',
  island_name: 'EMG',
  module_id: 'nerve-conduction',
  topic_name: 'Reflejo H',
  stem: 'Viñeta clínica',
  findings: [],
  options: [
    { text: 'A', is_correct: true, feedback: 'correcta' },
    { text: 'B', is_correct: false, feedback: '' },
    { text: 'C', is_correct: false, feedback: '' },
    { text: 'D', is_correct: false, feedback: '' },
  ],
  difficulty: 2,
  is_critical: false,
  tags: [],
  status: 'PUBLISHED',
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-01-01T00:00:00Z',
  ...overrides,
});

const bank = (count: number, overrides: (i: number) => Partial<ExamQuestion> = () => ({})): ExamQuestion[] =>
  Array.from({ length: count }, (_, i) =>
    question({ id: `q${i}`, topic_name: `Tema ${i % 3}`, ...overrides(i) })
  );

describe('applyOptionOrder', () => {
  it('reordena las opciones según la permutación', () => {
    const q = question();
    const reordered = applyOptionOrder(q, [2, 0, 3, 1]);

    expect(reordered.options.map(o => o.text)).toEqual(['C', 'A', 'D', 'B']);
    expect(reordered.options[1].is_correct).toBe(true);
  });

  it('devuelve la pregunta intacta si la permutación es inválida', () => {
    const q = question();

    expect(applyOptionOrder(q, [0, 1]).options).toEqual(q.options);          // longitud distinta
    expect(applyOptionOrder(q, [0, 0, 1, 2]).options).toEqual(q.options);    // índice repetido
    expect(applyOptionOrder(q, [0, 1, 2, 9]).options).toEqual(q.options);    // fuera de rango
    expect(applyOptionOrder(q, undefined).options).toEqual(q.options);
  });
});

describe('restoreExamQuestions', () => {
  it('reconstruye exactamente el examen mostrado, preservando los índices de respuesta', () => {
    const all = bank(8);
    const config: ExamConfig = { mode: 'FULL_SIMULATION', feedbackMode: 'end', questionCount: 5 };
    const prepared = prepareExamQuestions(all, config);

    // El alumno responde: se guarda el índice de la opción TAL COMO SE MOSTRÓ
    const answers: Record<string, number> = {};
    prepared.questions.forEach((q, i) => { answers[q.id] = i % q.options.length; });

    // Al reanudar, el banco llega en orden de base de datos (no el mostrado)
    const fromDb = [...all].reverse();
    const restored = restoreExamQuestions(
      prepared.questions.map(q => q.id),
      fromDb,
      prepared.optionOrder
    );

    expect(restored.map(q => q.id)).toEqual(prepared.questions.map(q => q.id));
    restored.forEach((q, i) => {
      expect(q.options).toEqual(prepared.questions[i].options);
      // La opción que el alumno eligió sigue siendo la misma tras reanudar
      const selected = answers[q.id];
      expect(q.options[selected].text).toBe(prepared.questions[i].options[selected].text);
      expect(q.options[selected].is_correct).toBe(prepared.questions[i].options[selected].is_correct);
    });
  });

  it('sin permutación guardada no puede garantizar el orden (caso que corrompía respuestas)', () => {
    const all = [question({ id: 'q1' })];
    const prepared = withRandomOptionOrder(all);
    const order = prepared.optionOrder['q1'];

    const restoredSinOrden = restoreExamQuestions(['q1'], all, {});
    const identidad = order.every((originalIdx, displayIdx) => originalIdx === displayIdx);

    // Si la permutación no fue la identidad, reconstruir sin ella cambia la pantalla
    if (!identidad) {
      expect(restoredSinOrden[0].options).not.toEqual(prepared.questions[0].options);
    }
    // Con la permutación siempre coincide
    expect(restoreExamQuestions(['q1'], all, prepared.optionOrder)[0].options)
      .toEqual(prepared.questions[0].options);
  });

  it('omite preguntas que ya no están en el banco', () => {
    const all = bank(3);
    const restored = restoreExamQuestions(['q0', 'inexistente', 'q2'], all, {});
    expect(restored.map(q => q.id)).toEqual(['q0', 'q2']);
  });
});

describe('prepareExamQuestions', () => {
  it('respeta el límite de preguntas y registra una permutación por pregunta', () => {
    const all = bank(20);
    const { questions, optionOrder } = prepareExamQuestions(all, {
      mode: 'CUSTOM',
      feedbackMode: 'immediate',
      questionCount: 7,
    });

    expect(questions).toHaveLength(7);
    expect(Object.keys(optionOrder)).toHaveLength(7);
    questions.forEach(q => {
      expect(optionOrder[q.id]).toHaveLength(q.options.length);
      expect([...optionOrder[q.id]].sort()).toEqual([0, 1, 2, 3]);
    });
  });

  it('devuelve todas las disponibles cuando no hay límite', () => {
    const all = bank(12);
    const { questions } = prepareExamQuestions(all, {
      mode: 'FULL_SIMULATION',
      feedbackMode: 'end',
      questionCount: null,
    });

    expect(questions).toHaveLength(12);
  });

  it('filtra por temas seleccionados y por criticidad', () => {
    const all = bank(9, i => ({ is_critical: i % 2 === 0 }));

    const porTema = prepareExamQuestions(all, {
      mode: 'TOPIC_SPECIFIC',
      feedbackMode: 'end',
      topicNames: ['Tema 1'],
    });
    expect(porTema.questions.every(q => q.topic_name === 'Tema 1')).toBe(true);

    const criticas = prepareExamQuestions(all, {
      mode: 'CRITICAL_ONLY',
      feedbackMode: 'end',
      criticalOnly: true,
    });
    expect(criticas.questions.length).toBeGreaterThan(0);
    expect(criticas.questions.every(q => q.is_critical)).toBe(true);
  });

  it('no pierde ni duplica opciones al mezclar', () => {
    const { questions } = prepareExamQuestions(bank(5), {
      mode: 'FULL_SIMULATION',
      feedbackMode: 'end',
    });

    questions.forEach(q => {
      expect(q.options).toHaveLength(4);
      expect(new Set(q.options.map(o => o.text)).size).toBe(4);
      expect(q.options.filter(o => o.is_correct)).toHaveLength(1);
    });
  });
});

describe('randomOptionOrder', () => {
  it('es una permutación completa de los índices', () => {
    const order = randomOptionOrder(6);
    expect([...order].sort((a, b) => a - b)).toEqual([0, 1, 2, 3, 4, 5]);
  });
});
