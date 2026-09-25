import { describe, expect, it } from 'vitest';
import type { Module } from '../../types/content';
import { buildTextbookModel } from './buildTextbookModel';
import { buildTextbookDocx } from './downloadTextbookDocx';
import { DEFAULT_TEXTBOOK_THEME } from './textbookTheme';

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
      content: '## Objetivos\n- Uno\n\nTexto de lección.',
      clinicalPearls: ['Perla.'],
      youtubeUrls: [{ title: 'Video', videoId: 'abc123xyz' }],
    },
  ],
};

describe('buildTextbookDocx', () => {
  it('builds a Word file from a printable model', async () => {
    const model = buildTextbookModel({
      modules: [sample],
      cover: { title: 'Libro Word', subtitle: 'EMG', authors: 'Dra. Prueba', institution: 'ElectroDx' },
    });
    const blob = await buildTextbookDocx(model, DEFAULT_TEXTBOOK_THEME);
    expect(blob.size).toBeGreaterThan(2000);
    const header = new Uint8Array(await blob.slice(0, 2).arrayBuffer());
    expect(String.fromCharCode(header[0], header[1])).toBe('PK');
  });
});
