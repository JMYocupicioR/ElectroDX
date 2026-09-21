import { describe, expect, it } from 'vitest';
import { computeKardexMath, meanScore, type KardexBucketInput } from './academicKardex';

const DEFAULT = {
  exams: { key: 'exams' as const, name: 'Exámenes', weight: 30, enabled: true, itemCount: 0, summary: '' },
  assignments: { key: 'assignments' as const, name: 'Tareas', weight: 30, enabled: true, itemCount: 0, summary: '' },
  attendance: { key: 'attendance' as const, name: 'Asistencia', weight: 20, enabled: true, itemCount: 0, summary: '' },
  curriculum: { key: 'curriculum' as const, name: 'Temario', weight: 20, enabled: true, itemCount: 0, summary: '' },
};

function buckets(overrides: Partial<Record<KardexBucketInput['key'], Partial<KardexBucketInput>>>): KardexBucketInput[] {
  return (['exams', 'assignments', 'attendance', 'curriculum'] as const).map((key) => ({
    ...DEFAULT[key],
    rawScore: null,
    ...overrides[key],
  }));
}

describe('meanScore', () => {
  it('returns null for an empty list', () => {
    expect(meanScore([])).toBeNull();
  });

  it('rounds a simple average', () => {
    expect(meanScore([80, 90])).toBe(85);
  });
});

describe('computeKardexMath', () => {
  it('does not invent official or running grades when only empty buckets exist besides curriculum 0', () => {
    const result = computeKardexMath(
      buckets({
        curriculum: { rawScore: 0, itemCount: 0, summary: '0/100 temas' },
      }),
      80
    );

    expect(result.isOfficial).toBe(false);
    expect(result.isPassing).toBe(false);
    expect(result.officialGrade).toBeNull();
    expect(result.runningGrade).toBe(0);
    expect(result.missingBuckets).toEqual(['exams', 'assignments', 'attendance']);
    expect(result.status).toBe('in_progress');
    expect(result.rubricBreakdown.find((b) => b.rubricId === 'exams')?.hasEvidence).toBe(false);
  });

  it('does not treat 85 or 90 as implicit scores', () => {
    const result = computeKardexMath(buckets({}), 80);
    expect(result.runningGrade).toBeNull();
    expect(result.officialGrade).toBeNull();
    expect(result.displayedGrade).toBeNull();
    expect(result.pointsToPass).toBeNull();
  });

  it('renormalizes the running average over scored buckets', () => {
    const partial = computeKardexMath(
      buckets({
        exams: { rawScore: 100, itemCount: 1 },
        attendance: { rawScore: 100, itemCount: 2 },
        curriculum: { rawScore: 0, itemCount: 0 },
      }),
      80
    );
    expect(partial.isOfficial).toBe(false);
    expect(partial.officialGrade).toBeNull();
    expect(partial.runningGrade).toBe(71.4);
    expect(partial.pointsToPass).toBe(8.6);

    const withoutCurriculum = computeKardexMath(
      buckets({
        exams: { rawScore: 100, itemCount: 1 },
        assignments: { rawScore: 100, itemCount: 1 },
        attendance: { rawScore: 100, itemCount: 1 },
      }),
      80
    );
    expect(withoutCurriculum.isOfficial).toBe(false);
    expect(withoutCurriculum.runningGrade).toBe(100);
    expect(withoutCurriculum.pointsToPass).toBe(0);
  });

  it('computes official 80 when three perfect buckets meet empty curriculum at 20%', () => {
    const result = computeKardexMath(
      buckets({
        exams: { rawScore: 100, itemCount: 2 },
        assignments: { rawScore: 100, itemCount: 1 },
        attendance: { rawScore: 100, itemCount: 3 },
        curriculum: { rawScore: 0, itemCount: 0 },
      }),
      80
    );

    expect(result.isOfficial).toBe(true);
    expect(result.officialGrade).toBe(80);
    expect(result.runningGrade).toBe(80);
    expect(result.isPassing).toBe(true);
    expect(result.pointsToPass).toBe(0);
    expect(result.status).toBe('accredited');
    expect(result.rubricBreakdown.find((b) => b.rubricId === 'exams')?.weightedScore).toBe(30);
    expect(result.rubricBreakdown.find((b) => b.rubricId === 'curriculum')?.weightedScore).toBe(0);
  });

  it('awards honors at 95 and reports points still needed below 80', () => {
    const honors = computeKardexMath(
      buckets({
        exams: { rawScore: 100, itemCount: 1 },
        assignments: { rawScore: 100, itemCount: 1 },
        attendance: { rawScore: 100, itemCount: 1 },
        curriculum: { rawScore: 75, itemCount: 10 },
      }),
      80
    );
    expect(honors.officialGrade).toBe(95);
    expect(honors.status).toBe('accredited_honors');

    const short = computeKardexMath(
      buckets({
        exams: { rawScore: 70, itemCount: 1 },
        assignments: { rawScore: 70, itemCount: 1 },
        attendance: { rawScore: 70, itemCount: 1 },
        curriculum: { rawScore: 70, itemCount: 10 },
      }),
      80
    );
    expect(short.officialGrade).toBe(70);
    expect(short.isPassing).toBe(false);
    expect(short.pointsToPass).toBe(10);
    expect(short.status).toBe('not_accredited');
  });
});
