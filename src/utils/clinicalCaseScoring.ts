export const CLINICAL_CASE_BLANK_ANSWERS = new Set([
  '',
  '__sin_respuesta__',
  'Sin respuesta',
  'Sin respuesta (tiempo agotado)',
]);

export interface ClinicalCaseScoreInput {
  selectedPatternId: string | null | undefined;
  correctPatternId: string;
  correctCategory: string;
  selectedCategory?: string | null;
  hintsUsed?: number;
  maxHints?: number;
  applyHintPenalty?: boolean;
}

export interface ClinicalCaseScoreResult {
  isCorrect: boolean;
  score: number;
  blank: boolean;
  sameCategory: boolean;
}

export function isBlankClinicalAnswer(selectedPatternId: string | null | undefined): boolean {
  if (selectedPatternId == null) return true;
  return CLINICAL_CASE_BLANK_ANSWERS.has(selectedPatternId.trim());
}

/** Misma fórmula que complete_my_clinical_case: 100 / 25 / 0, pistas solo en modo estudio. */
export function scoreClinicalDiagnosis(input: ClinicalCaseScoreInput): ClinicalCaseScoreResult {
  const blank = isBlankClinicalAnswer(input.selectedPatternId);
  const isCorrect = !blank && input.selectedPatternId === input.correctPatternId;
  const sameCategory =
    !blank &&
    !isCorrect &&
    Boolean(input.selectedCategory) &&
    input.selectedCategory === input.correctCategory;

  let score = 0;
  if (isCorrect) score = 100;
  else if (sameCategory) score = 25;

  if (input.applyHintPenalty) {
    const used = Math.max(0, input.hintsUsed ?? 0);
    const cap = Math.max(0, input.maxHints ?? used);
    score = Math.max(0, score - Math.min(used, cap) * 5);
  }

  return { isCorrect, score, blank, sameCategory };
}
