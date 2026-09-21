import type { RubricKey } from '../types/academicGradebook';

export interface KardexBucketInput {
  key: RubricKey;
  name: string;
  weight: number;
  enabled: boolean;
  rawScore: number | null;
  itemCount: number;
  summary: string;
}

export interface KardexBucketResult {
  rubricId: RubricKey;
  name: string;
  weight: number;
  rawScore: number | null;
  weightedScore: number;
  runningShare: number;
  hasEvidence: boolean;
  itemCount: number;
  summary: string;
}

export type KardexAcademicStatus = 'in_progress' | 'accredited_honors' | 'accredited' | 'not_accredited';

export interface KardexMathResult {
  runningGrade: number | null;
  officialGrade: number | null;
  runningGradeScale10: number | null;
  officialGradeScale10: number | null;
  displayedGrade: number | null;
  displayedGradeScale10: number | null;
  isOfficial: boolean;
  isPassing: boolean;
  pointsToPass: number | null;
  status: KardexAcademicStatus;
  statusLabel: string;
  missingBuckets: RubricKey[];
  rubricBreakdown: KardexBucketResult[];
}

export function round1(value: number): number {
  return Math.round(value * 10) / 10;
}

export function scale10(value: number | null): number | null {
  if (value == null) return null;
  return round1(value / 10);
}

export function meanScore(values: number[]): number | null {
  if (values.length === 0) return null;
  return Math.round(values.reduce((sum, value) => sum + value, 0) / values.length);
}

export function computeKardexMath(
  buckets: KardexBucketInput[],
  minPassingGrade: number
): KardexMathResult {
  const enabled = buckets.filter((bucket) => bucket.enabled && bucket.weight > 0);
  const scored = enabled.filter((bucket) => bucket.rawScore != null);
  const missingBuckets = enabled.filter((bucket) => bucket.rawScore == null).map((bucket) => bucket.key);
  const isOfficial = enabled.length > 0 && missingBuckets.length === 0;
  const evidenceWeight = scored.reduce((sum, bucket) => sum + bucket.weight, 0);

  const officialGrade = isOfficial
    ? Math.min(
        100,
        round1(enabled.reduce((sum, bucket) => sum + ((bucket.rawScore ?? 0) * bucket.weight) / 100, 0))
      )
    : null;

  const runningGrade =
    scored.length > 0 && evidenceWeight > 0
      ? Math.min(
          100,
          round1(scored.reduce((sum, bucket) => sum + ((bucket.rawScore ?? 0) * bucket.weight) / evidenceWeight, 0))
        )
      : null;

  const displayedGrade = isOfficial ? officialGrade : runningGrade;
  const pointsToPass = displayedGrade == null ? null : Math.max(0, round1(minPassingGrade - displayedGrade));
  const isPassing = officialGrade != null && officialGrade >= minPassingGrade;

  let status: KardexAcademicStatus = 'in_progress';
  let statusLabel = 'EN FORMACIÓN (DICTAMEN PENDIENTE)';
  if (isOfficial) {
    if (officialGrade != null && officialGrade >= 95) {
      status = 'accredited_honors';
      statusLabel = 'ACREDITADO CON MENCIÓN HONORÍFICA';
    } else if (isPassing) {
      status = 'accredited';
      statusLabel = 'ACREDITADO SATISFACTORIAMENTE';
    } else {
      status = 'not_accredited';
      statusLabel = 'NO ACREDITADO (EN REGULARIZACIÓN)';
    }
  }

  const rubricBreakdown: KardexBucketResult[] = buckets.map((bucket) => {
    const hasEvidence = bucket.rawScore != null;
    const weightedScore = hasEvidence ? round1((bucket.rawScore! * bucket.weight) / 100) : 0;
    const runningShare =
      hasEvidence && evidenceWeight > 0 ? round1((bucket.rawScore! * bucket.weight) / evidenceWeight) : 0;
    return {
      rubricId: bucket.key,
      name: bucket.name,
      weight: bucket.weight,
      rawScore: bucket.rawScore,
      weightedScore,
      runningShare,
      hasEvidence,
      itemCount: bucket.itemCount,
      summary: bucket.summary,
    };
  });

  return {
    runningGrade,
    officialGrade,
    runningGradeScale10: scale10(runningGrade),
    officialGradeScale10: scale10(officialGrade),
    displayedGrade,
    displayedGradeScale10: scale10(displayedGrade),
    isOfficial,
    isPassing,
    pointsToPass,
    status,
    statusLabel,
    missingBuckets,
    rubricBreakdown,
  };
}

export function kardexStatusFromMath(
  math: KardexMathResult
): 'accredited_honors' | 'accredited' | 'not_accredited' {
  if (math.status === 'accredited_honors') return 'accredited_honors';
  if (math.status === 'accredited') return 'accredited';
  return 'not_accredited';
}
