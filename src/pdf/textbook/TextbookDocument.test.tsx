import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import type { Module } from '../../types/content';
import { buildTextbookModel } from './buildTextbookModel';
import { TextbookDocument } from './TextbookDocument';

const sample: Module = {
  id: 'fundamentals',
  number: 1,
  title: 'Fundamentos',
  titleEn: 'Fundamentals',
  emoji: '📘',
  description: 'Bases',
  descriptionEn: 'Bases',
  color: 'from-blue-500 to-blue-700',
  icon: 'BookOpen',
  topics: [
    {
      id: 'intro-neurodiagnostics',
      title: 'Introducción',
      content: 'Texto de lección con **negrita**.',
      clinicalPearls: ['Perla.'],
      keyPoints: ['Punto.'],
      youtubeUrls: [{ title: 'Video', videoId: 'abc123xyz' }],
      imageUrls: [{ src: 'https://example.com/fig.png', alt: 'Figura', caption: 'Pie' }],
    },
  ],
};

describe('TextbookDocument', () => {
  it('renders cover, lesson body and bibliography without video ids', () => {
    const model = buildTextbookModel({
      modules: [sample],
      cover: { title: 'Libro de prueba', subtitle: 'EMG', authors: 'Dra. Prueba', institution: 'ElectroDx' },
      generatedAt: new Date('2026-09-25T12:00:00Z'),
    });
    const html = renderToStaticMarkup(<TextbookDocument model={model} />);
    expect(html).toContain('--book-font');
    expect(html).toContain('Libro de prueba');
    expect(html).toContain('Dra. Prueba');
    expect(html).toContain('Introducción');
    expect(html).toContain('Perla');
    expect(html).toContain('Punto');
    expect(html).toContain('Figura');
    expect(html).toContain('Bibliografía');
    expect(html).not.toContain('abc123xyz');
    expect(html).not.toContain('dark:');
  });

  it('renders chapter editors and hides disabled names', () => {
    const model = buildTextbookModel({
      modules: [sample],
      cover: { title: 'Libro', authors: 'Portada' },
      contributors: [
        {
          id: 'u1',
          name: 'Ana López',
          credentials: 'M.N.',
          label: 'Ana López, M.N.',
          role: 'editor',
          topicIds: ['intro-neurodiagnostics'],
          moduleIds: ['fundamentals'],
        },
      ],
      creditOptions: { showCoverCredits: true, showChapterCredits: true },
    });
    const html = renderToStaticMarkup(<TextbookDocument model={model} />);
    expect(html).toContain('Edición y revisión');
    expect(html).toContain('Ana López, M.N.');
    expect(html).toContain('Edición del capítulo');
  });
});
