import { describe, expect, it } from 'vitest';
import type { Module, Topic } from '../types/content';
import { listTopicsMissingQuiz, topTopicsMissingQuiz } from './topicsMissingQuiz';

function topic(partial: Pick<Topic, 'id' | 'title'> & Partial<Topic>): Topic {
  return partial;
}

function mod(partial: Pick<Module, 'id' | 'number' | 'title' | 'topics'>): Module {
  return {
    titleEn: '',
    emoji: '',
    description: '',
    descriptionEn: '',
    color: '',
    icon: '',
    ...partial,
  };
}

describe('listTopicsMissingQuiz', () => {
  const modules = [
    mod({
      id: 'late-module',
      number: 2,
      title: 'Segundo',
      topics: [topic({ id: 'late', title: 'Tardío', content: 'texto' })],
    }),
    mod({
      id: 'first-module',
      number: 1,
      title: 'Primero',
      topics: [
        topic({
          id: 'parent',
          title: 'Carpeta',
          content: 'no es lección',
          children: [
            topic({ id: 'with-quiz', title: 'Ya tiene quiz', content: 'a' }),
            topic({ id: 'gap', title: 'Primer hueco', description: 'b' }),
          ],
        }),
        topic({ id: 'empty', title: 'Sin texto' }),
        topic({ id: 'next', title: 'Segundo hueco', content: 'c' }),
      ],
    }),
  ];

  it('walks from topic 1 and skips lessons that already have a quiz', () => {
    const missing = listTopicsMissingQuiz(modules, new Set(['with-quiz']));

    expect(missing.map((item) => [item.curriculumIndex, item.topicId, item.moduleNumber])).toEqual([
      [2, 'gap', 1],
      [3, 'next', 1],
      [4, 'late', 2],
    ]);
  });

  it('returns the first five gaps in syllabus order', () => {
    const many = mod({
      id: 'solo',
      number: 1,
      title: 'Único',
      topics: Array.from({ length: 7 }, (_, index) =>
        topic({ id: `t-${index + 1}`, title: `Tema ${index + 1}`, content: 'x' }),
      ),
    });

    const result = topTopicsMissingQuiz([many], new Set(['t-1']));

    expect(result.total).toBe(6);
    expect(result.topics.map((item) => item.curriculumIndex)).toEqual([2, 3, 4, 5, 6]);
    expect(result.topics[0]?.title).toBe('Tema 2');
  });
});
