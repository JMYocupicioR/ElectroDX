import { describe, expect, it } from 'vitest';
import { gradeMeasurement } from './gradeMeasurement';
import { msToIndex } from './measureMuap';
import { PUM_SAMPLING_RATE_HZ, type PumGroundTruth } from './types';

function sample(ms: number): number {
  return msToIndex(ms, PUM_SAMPLING_RATE_HZ);
}

function triphasic(): { signal: number[]; truth: PumGroundTruth } {
  const n = sample(100);
  const signal = new Array(n).fill(0);
  const start = sample(30);
  const pos = sample(30.7);
  const turn = sample(30.9);
  const neg = sample(31.0);
  const end = sample(40);
  for (let i = start; i <= pos; i++) signal[i] = 90 * ((i - start) / Math.max(1, pos - start));
  for (let i = pos + 1; i <= turn; i++) signal[i] = 90 - 40 * ((i - pos) / Math.max(1, turn - pos));
  for (let i = turn + 1; i <= neg; i++) signal[i] = 50 + (-800 - 50) * ((i - turn) / Math.max(1, neg - turn));
  for (let i = neg + 1; i <= end; i++) signal[i] = -800 * (1 - (i - neg) / Math.max(1, end - neg));

  const truth: PumGroundTruth = {
    startIndex: start,
    endIndex: end,
    negativePeakIndex: neg,
    positivePeakIndex: pos,
    durationMs: 10,
    amplitudeUv: 890,
    riseTimeUs: 300,
    phases: 3,
    turns: 1,
    rectifiedArea: 2000,
    isDistant: false,
  };
  return { signal, truth };
}

describe('gradeMeasurement', () => {
  it('gives full marks when cursors sit on ground truth', () => {
    const { signal, truth } = triphasic();
    const result = gradeMeasurement(
      signal,
      truth,
      {
        startIndex: truth.startIndex,
        endIndex: truth.endIndex,
        negativePeakIndex: truth.negativePeakIndex,
        positivePeakIndex: truth.positivePeakIndex,
        discardedDistant: false,
      },
      PUM_SAMPLING_RATE_HZ,
    );
    expect(result.score).toBe(100);
    expect(result.accepted.start).toBe(true);
    expect(result.accepted.neg).toBe(true);
  });

  it('penalizes an onset marked in the baseline noise', () => {
    const { signal, truth } = triphasic();
    const result = gradeMeasurement(
      signal,
      truth,
      {
        startIndex: sample(28.5),
        endIndex: truth.endIndex,
        negativePeakIndex: truth.negativePeakIndex,
        positivePeakIndex: truth.positivePeakIndex,
        discardedDistant: false,
      },
      PUM_SAMPLING_RATE_HZ,
    );
    expect(result.score).toBeLessThan(100);
    expect(result.cursorScores.start).toBeLessThan(25);
    expect(result.feedback.startCursor.toLowerCase()).toContain('adelantado');
  });

  it('penalizes a late offset that includes trailing baseline', () => {
    const { signal, truth } = triphasic();
    const result = gradeMeasurement(
      signal,
      truth,
      {
        startIndex: truth.startIndex,
        endIndex: sample(42),
        negativePeakIndex: truth.negativePeakIndex,
        positivePeakIndex: truth.positivePeakIndex,
        discardedDistant: false,
      },
      PUM_SAMPLING_RATE_HZ,
    );
    expect(result.cursorScores.end).toBeLessThan(25);
    expect(result.feedback.endCursor.toLowerCase()).toMatch(/retrasado|posterior/);
  });

  it('scores zero on a peak cursor that landed on a shallower turn', () => {
    const { signal, truth } = triphasic();
    const falseTurn = sample(30.9);
    const result = gradeMeasurement(
      signal,
      truth,
      {
        startIndex: truth.startIndex,
        endIndex: truth.endIndex,
        negativePeakIndex: falseTurn,
        positivePeakIndex: truth.positivePeakIndex,
        discardedDistant: false,
      },
      PUM_SAMPLING_RATE_HZ,
    );
    expect(result.cursorScores.neg).toBe(0);
    expect(result.feedback.peaks.toLowerCase()).toMatch(/giro|espícula|espiga/);
  });

  it('awards 100 when the student discards a distant MUAP', () => {
    const { signal, truth } = triphasic();
    const distant = { ...truth, isDistant: true, riseTimeUs: 720 };
    const result = gradeMeasurement(
      signal,
      distant,
      {
        startIndex: truth.startIndex,
        endIndex: truth.endIndex,
        negativePeakIndex: truth.negativePeakIndex,
        positivePeakIndex: truth.positivePeakIndex,
        discardedDistant: true,
      },
      PUM_SAMPLING_RATE_HZ,
    );
    expect(result.score).toBe(100);
    expect(result.feedback.riseTimeWarning).toBeTruthy();
  });

  it('caps the score at 40 if cursors are confirmed on a distant MUAP', () => {
    const { signal, truth } = triphasic();
    const distant = { ...truth, isDistant: true, riseTimeUs: 720 };
    const result = gradeMeasurement(
      signal,
      distant,
      {
        startIndex: truth.startIndex,
        endIndex: truth.endIndex,
        negativePeakIndex: truth.negativePeakIndex,
        positivePeakIndex: truth.positivePeakIndex,
        discardedDistant: false,
      },
      PUM_SAMPLING_RATE_HZ,
    );
    expect(result.score).toBeLessThanOrEqual(40);
    expect(result.feedback.riseTimeWarning).toMatch(/0\.5 ms/);
  });

  it('scores zero when a crisp MUAP is discarded', () => {
    const { signal, truth } = triphasic();
    const result = gradeMeasurement(
      signal,
      truth,
      {
        startIndex: truth.startIndex,
        endIndex: truth.endIndex,
        negativePeakIndex: truth.negativePeakIndex,
        positivePeakIndex: truth.positivePeakIndex,
        discardedDistant: true,
      },
      PUM_SAMPLING_RATE_HZ,
    );
    expect(result.score).toBe(0);
  });
});
