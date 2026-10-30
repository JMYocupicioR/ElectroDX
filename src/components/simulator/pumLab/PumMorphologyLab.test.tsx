import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { PumMorphologyLab } from './PumMorphologyLab';

describe('PumMorphologyLab', () => {
  it('renders the guided lab with clinical polarity and live metrics', () => {
    const markup = renderToStaticMarkup(<PumMorphologyLab caseId="biceps-normal" mode="guided" />);
    expect(markup).toContain('Laboratorio de morfología del PUM');
    expect(markup).toContain('negativo arriba');
    expect(markup).toContain('Confirmar medición');
    expect(markup).toContain('Descartar: aguja lejos');
    expect(markup).toContain('Ficha del alumno');
  });
});
