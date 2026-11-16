import { describe, expect, it, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { TopicsMissingQuizQueue } from './TopicsMissingQuizQueue';

describe('TopicsMissingQuizQueue', () => {
  it('names the next lessons without a quiz, numbered from topic 1', () => {
    const html = renderToStaticMarkup(
      <MemoryRouter>
        <TopicsMissingQuizQueue
          total={8}
          onAddQuiz={vi.fn()}
          onOmit={vi.fn()}
          topics={[
            {
              topicId: 'gap',
              title: 'Primer hueco',
              moduleId: 'fundamentals',
              moduleNumber: 1,
              moduleTitle: 'Fundamentos',
              curriculumIndex: 2,
            },
          ]}
        />
      </MemoryRouter>,
    );

    expect(html).toContain('Siguientes 1 sin cuestionario');
    expect(html).toContain('Orden del temario, desde el tema 1.');
    expect(html).toContain('Primer hueco');
    expect(html).toContain('Tema 2');
    expect(html).toContain('Módulo 1: Fundamentos');
    expect(html).toContain('8 temas siguen sin cuestionario');
    expect(html).toContain('Agregar cuestionario');
    expect(html).toContain('Omitir');
    expect(html).toContain('/admin/quizzes?estado=no_quiz&amp;tab=topics');
  });

  it('renders nothing when every lesson already has a quiz', () => {
    const html = renderToStaticMarkup(
      <MemoryRouter>
        <TopicsMissingQuizQueue topics={[]} total={0} onAddQuiz={vi.fn()} />
      </MemoryRouter>,
    );
    expect(html).toBe('');
  });

  it('preserves selectedModuleId in the view-all catalog link', () => {
    const html = renderToStaticMarkup(
      <MemoryRouter>
        <TopicsMissingQuizQueue
          total={3}
          selectedModuleId="safety-qc"
          onAddQuiz={vi.fn()}
          topics={[
            {
              topicId: 'gap-1',
              title: 'Hueco de seguridad',
              moduleId: 'safety-qc',
              moduleNumber: 2,
              moduleTitle: 'Seguridad',
              curriculumIndex: 1,
            },
          ]}
        />
      </MemoryRouter>,
    );

    expect(html).toContain('modulo=safety-qc');
  });
});
