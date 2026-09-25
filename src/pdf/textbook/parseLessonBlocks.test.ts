import { describe, expect, it } from 'vitest';
import { parseLessonBlocks, splitInlineMarks } from './parseLessonBlocks';

describe('parseLessonBlocks', () => {
  it('splits headings, lists and paragraphs', () => {
    const blocks = parseLessonBlocks('## Objetivos\n- Uno\n- Dos\n\nTexto **negrita**.');
    expect(blocks).toEqual([
      { kind: 'heading', text: 'Objetivos', level: 2 },
      { kind: 'bullet', items: ['Uno', 'Dos'] },
      { kind: 'paragraph', text: 'Texto **negrita**.' },
    ]);
    expect(splitInlineMarks('Texto **negrita**.')).toEqual([
      { text: 'Texto ', bold: false },
      { text: 'negrita', bold: true },
      { text: '.', bold: false },
    ]);
  });
});
