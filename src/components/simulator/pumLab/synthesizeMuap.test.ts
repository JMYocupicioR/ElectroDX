import { describe, expect, it } from 'vitest';
import { buildTrace } from './cases';
import { PUM_RISE_TIME_LIMIT_US } from './types';

describe('synthesizeMuap', () => {
  it('keeps a normal biceps MUAP sharp', () => {
    const trace = buildTrace('biceps-normal');
    expect(trace.groundTruth.riseTimeUs).toBeLessThan(PUM_RISE_TIME_LIMIT_US);
    expect(trace.groundTruth.isDistant).toBe(false);
    expect(trace.groundTruth.amplitudeUv).toBeGreaterThan(600);
  });

  it('marks the distant biceps MUAP by rise time', () => {
    const trace = buildTrace('biceps-distant');
    expect(trace.groundTruth.riseTimeUs).toBeGreaterThan(PUM_RISE_TIME_LIMIT_US);
    expect(trace.groundTruth.isDistant).toBe(true);
  });

  it('builds a polyphasic MUAP with at least five phases', () => {
    const trace = buildTrace('polyphasic');
    expect(trace.groundTruth.phases).toBeGreaterThanOrEqual(5);
  });

  it('does not move ground-truth onset when noise is added', () => {
    const a = buildTrace('slow-onset', 1);
    const b = buildTrace('slow-onset', 99);
    expect(a.groundTruth.startIndex).toBe(b.groundTruth.startIndex);
    expect(a.groundTruth.negativePeakIndex).toBe(b.groundTruth.negativePeakIndex);
    expect(a.noisy).not.toEqual(b.noisy);
  });
});
