import { describe, expect, it } from 'vitest';
import type { Topic } from '../types/content';
import {
  areRequiredQuizzesPassed,
  collectQuizTopicIdsInTree,
  topicHasEvaluation,
} from './quizCompletionGate';
import { isCurriculumNodeCompleted } from './studentResume';

const lesson: Topic = {
  id: 'functional-neuroanatomy',
  title: 'Neuroanatomía Funcional',
  children: [
    { id: 'motor-neuron-architecture', title: 'Arquitectura de la neurona motora' },
    {
      id: 'nerve-fiber-classification',
      title: 'Clasificación de fibras nerviosas',
      children: [{ id: 'fiber-types', title: 'Fibras Aα, Aβ, Aδ, B y C' }],
    },
  ],
};

const quizIds = new Set(['nerve-fiber-classification']);

describe('quiz completion gate', () => {
  it('finds quizzes nested under a parent lesson', () => {
    expect(collectQuizTopicIdsInTree(lesson, quizIds)).toEqual(['nerve-fiber-classification']);
    expect(topicHasEvaluation(lesson, { quizTopicIds: quizIds, passedQuizTopicIds: new Set() })).toBe(true);
  });

  it('blocks completion until the lesson evaluation is passed', () => {
    const completed = new Set([
      'functional-neuroanatomy',
      'motor-neuron-architecture',
      'nerve-fiber-classification',
      'fiber-types',
    ]);
    const gate = { quizTopicIds: quizIds, passedQuizTopicIds: new Set<string>() };

    expect(areRequiredQuizzesPassed(lesson, gate)).toBe(false);
    expect(isCurriculumNodeCompleted(lesson, completed, gate)).toBe(false);
  });

  it('allows completion after the evaluation is passed', () => {
    const completed = new Set([
      'functional-neuroanatomy',
      'motor-neuron-architecture',
      'nerve-fiber-classification',
      'fiber-types',
    ]);
    const gate = {
      quizTopicIds: quizIds,
      passedQuizTopicIds: new Set(['nerve-fiber-classification']),
    };

    expect(areRequiredQuizzesPassed(lesson, gate)).toBe(true);
    expect(isCurriculumNodeCompleted(lesson, completed, gate)).toBe(true);
  });
});
