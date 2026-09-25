import { describe, expect, it } from 'vitest';
import { stripLegacyPdfMarkdown, topicPdfList } from './topicPrintables';

describe('topicPrintables', () => {
  it('strips the legacy clinical PDF block from lesson text', () => {
    const text = `Introducción.

> 📄 **Recurso Clínico Docente:** [Guía](https://example.com/a.pdf)
> *Aportado por Ana*
> Nota corta

Cierre.`;
    const cleaned = stripLegacyPdfMarkdown(text);
    expect(cleaned).toContain('Introducción.');
    expect(cleaned).toContain('Cierre.');
    expect(cleaned).not.toContain('Recurso Clínico Docente');
    expect(cleaned).not.toContain('example.com/a.pdf');
  });

  it('collects structured and legacy PDFs without duplicates', () => {
    const list = topicPdfList({
      id: 't',
      title: 'Tema',
      pdfUrls: [{ title: 'Guía', url: 'https://example.com/a.pdf', author: 'Ana' }],
      content: `> 📄 **Recurso Clínico Docente:** [Guía](https://example.com/a.pdf)
> *Aportado por Ana*`,
    });
    expect(list).toHaveLength(1);
    expect(list[0].author).toBe('Ana');
  });
});
