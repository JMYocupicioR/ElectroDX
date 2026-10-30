import { inflateSync } from 'node:zlib';
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { parseAgreementMarkdown } from '../src/content/legal/agreements';
import { stampStudentAgreement } from './stampStudentAgreement';

const MIN_PNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
  'base64'
);

describe('stampStudentAgreement', () => {
  it('builds a pdf with spanish punctuation without throwing', async () => {
    const { pdf, sha256 } = await stampStudentAgreement({
      agreement: {
        type: 'contrato',
        title: 'Contrato de prestación de servicios educativos',
        version: '1.0',
        checkboxText: 'Acepto',
        sections: [
          {
            title: 'Partes',
            content: 'El “Prestador” declara —según el artículo 89— que opera ElectroDx.',
          },
        ],
      },
      signaturePng: MIN_PNG,
      signerName: 'Dra. María Pérez',
      professionalLicense: '1234567',
      signedAtIso: '2026-10-29T12:00:00.000Z',
      ipAddress: '127.0.0.1',
      userAgent: 'Mozilla/5.0',
      verificationFolio: 'AGR-CON-TEST01',
      appBaseUrl: 'http://localhost:5173',
    });

    expect(pdf.subarray(0, 4).toString()).toBe('%PDF');
    expect(sha256).toMatch(/^[a-f0-9]{64}$/);
  });

  it('draws markdown tables as cells instead of pipe-separated lines', async () => {
    const markdown = readFileSync('docs/legal/alumnos/reglamento-academico.md', 'utf8');
    const agreement = parseAgreementMarkdown('reglamento', markdown);
    const { pdf } = await stampStudentAgreement({
      agreement,
      signaturePng: MIN_PNG,
      signerName: 'Dra. María Pérez',
      signedAtIso: '2026-10-29T12:00:00.000Z',
      ipAddress: '127.0.0.1',
      userAgent: 'Mozilla/5.0',
      verificationFolio: 'AGR-REG-TEST01',
      appBaseUrl: 'http://localhost:5173',
    });

    const placed = extractPdfPlacedText(pdf);
    const text = placed.map((item) => item.text).join('\n');
    const cubeta = placed.find((item) => item.text === 'Cubeta');
    const mide = placed.find((item) => item.text.startsWith('Qué mide'));
    const puntos = placed.find((item) => item.text === 'Puntos');
    expect(cubeta).toBeTruthy();
    expect(mide).toBeTruthy();
    expect(puntos).toBeTruthy();
    expect(mide!.x).toBeGreaterThan(cubeta!.x + 20);
    expect(puntos!.x).toBeGreaterThan(mide!.x + 20);
    expect(text).toContain('Artículo 3');
    expect(text).toContain('Exámenes y quizzes');
    expect(text).toContain('30');
    expect(text).not.toContain('Cubeta | Qué mide');
    expect(text).not.toContain('| --- |');
  });
});

function extractPdfPlacedText(pdf: Buffer): Array<{ x: number; text: string }> {
  const latin = pdf.toString('latin1');
  const parts: Array<{ x: number; text: string }> = [];
  for (const stream of latin.matchAll(/stream\r?\n([\s\S]*?)\r?\nendstream/g)) {
    let content: string;
    try {
      content = inflateSync(Buffer.from(stream[1], 'latin1')).toString('latin1');
    } catch {
      continue;
    }
    for (const match of content.matchAll(/1 0 0 1 ([0-9.]+) [0-9.]+ Tm\s*<([0-9A-Fa-f]+)> Tj/g)) {
      const text = Buffer.from(match[2], 'hex').toString('latin1');
      if (/[A-Za-zÁÉÍÓÚáéíóúÑñ0-9]/.test(text)) parts.push({ x: Number(match[1]), text });
    }
  }
  return parts;
}
