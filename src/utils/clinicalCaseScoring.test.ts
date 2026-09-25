import { describe, expect, it } from 'vitest';
import { isBlankClinicalAnswer, scoreClinicalDiagnosis } from './clinicalCaseScoring';

describe('scoreClinicalDiagnosis', () => {
  const base = {
    correctPatternId: 'carpal_tunnel_syndrome_moderate',
    correctCategory: 'entrapment',
  };

  it('da 100 al diagnóstico exacto', () => {
    expect(
      scoreClinicalDiagnosis({
        ...base,
        selectedPatternId: 'carpal_tunnel_syndrome_moderate',
        selectedCategory: 'entrapment',
      })
    ).toEqual({ isCorrect: true, score: 100, blank: false, sameCategory: false });
  });

  it('da 25 si coincide la categoría y no el patrón', () => {
    expect(
      scoreClinicalDiagnosis({
        ...base,
        selectedPatternId: 'ulnar_neuropathy_elbow',
        selectedCategory: 'entrapment',
      }).score
    ).toBe(25);
  });

  it('da 0 si la categoría es distinta o no hay respuesta', () => {
    expect(
      scoreClinicalDiagnosis({
        ...base,
        selectedPatternId: 'myopathy',
        selectedCategory: 'myopathic',
      }).score
    ).toBe(0);
    expect(scoreClinicalDiagnosis({ ...base, selectedPatternId: null }).score).toBe(0);
    expect(scoreClinicalDiagnosis({ ...base, selectedPatternId: '__sin_respuesta__' }).score).toBe(0);
  });

  it('resta 5 por pista en modo estudio, con tope en las pistas del caso', () => {
    expect(
      scoreClinicalDiagnosis({
        ...base,
        selectedPatternId: 'carpal_tunnel_syndrome_moderate',
        applyHintPenalty: true,
        hintsUsed: 2,
        maxHints: 2,
      }).score
    ).toBe(90);

    expect(
      scoreClinicalDiagnosis({
        ...base,
        selectedPatternId: 'ulnar_neuropathy_elbow',
        selectedCategory: 'entrapment',
        applyHintPenalty: true,
        hintsUsed: 4,
        maxHints: 2,
      }).score
    ).toBe(15);
  });

  it('no resta pistas en modo examen', () => {
    expect(
      scoreClinicalDiagnosis({
        ...base,
        selectedPatternId: 'carpal_tunnel_syndrome_moderate',
        applyHintPenalty: false,
        hintsUsed: 3,
        maxHints: 3,
      }).score
    ).toBe(100);
  });
});

describe('isBlankClinicalAnswer', () => {
  it('reconoce respuestas vacías del simulador', () => {
    expect(isBlankClinicalAnswer(null)).toBe(true);
    expect(isBlankClinicalAnswer('Sin respuesta (tiempo agotado)')).toBe(true);
    expect(isBlankClinicalAnswer('carpal_tunnel')).toBe(false);
  });
});
