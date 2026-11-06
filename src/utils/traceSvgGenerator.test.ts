import { describe, expect, it } from 'vitest';
import {
  buildDefaultTraceAltText,
  renderCalibratedTraceSvg,
} from './traceSvgGenerator';

describe('traceSvgGenerator', () => {
  it('renders a calibrated SVG for a clinical preset without leaking diagnosis by default', () => {
    const res = renderCalibratedTraceSvg({
      tracePresetId: 'median-cts',
      variant: 'pathologic',
    });

    expect(res.svg).toContain('<svg');
    expect(res.svg).toContain('Barrido:');
    expect(res.svg).toContain('Ganancia:');
    expect(res.svg).toContain('Registro Electrodiagnóstico');
    expect(res.svg).not.toContain('Túnel del Carpo');
    expect(res.summaryMeta.studyType).toBe('motor');
    expect(res.summaryMeta.latencyMs).toBeGreaterThan(0);
  });

  it('renders dual-channel comparison trace when variant is comparison', () => {
    const res = renderCalibratedTraceSvg({
      tracePresetId: 'median-cts',
      variant: 'comparison',
    });

    expect(res.svg).toContain('CH1 (Control / Distal)');
    expect(res.svg).toContain('CH2 (Estudio)');
  });

  it('renders needle EMG patterns cleanly', () => {
    const res = renderCalibratedTraceSvg({
      studyType: 'needle',
      needlePattern: 'fibrillations',
    });

    expect(res.svg).toContain('EMG Aguja');
    const alt = buildDefaultTraceAltText(res.summaryMeta);
    expect(alt).toContain('EMG de aguja');
  });
});

