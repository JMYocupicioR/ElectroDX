import { describe, expect, it } from 'vitest';
import {
  countPhases,
  countTurns,
  detectOnsetOffset,
  measureMuap,
  msToIndex,
  peakToPeakAmplitudeUv,
  riseTimeUs,
} from './measureMuap';
import { PUM_SAMPLING_RATE_HZ } from './types';

function sample(ms: number): number {
  return msToIndex(ms, PUM_SAMPLING_RATE_HZ);
}

function buildTriphasic(): number[] {
  const n = sample(100);
  const signal = new Array(n).fill(0);
  const start = sample(30);
  const pos = sample(30.8);
  const neg = sample(31.1);
  const after = sample(34);
  const end = sample(40);

  for (let i = start; i <= pos; i++) {
    const u = (i - start) / Math.max(1, pos - start);
    signal[i] = 80 * u;
  }
  for (let i = pos + 1; i <= neg; i++) {
    const u = (i - pos) / Math.max(1, neg - pos);
    signal[i] = 80 + (-720 - 80) * u;
  }
  for (let i = neg + 1; i <= after; i++) {
    const u = (i - neg) / Math.max(1, after - neg);
    signal[i] = -720 + (90 - -720) * u;
  }
  for (let i = after + 1; i <= end; i++) {
    const u = (i - after) / Math.max(1, end - after);
    signal[i] = 90 * (1 - u);
  }
  return signal;
}

describe('measureMuap', () => {
  it('computes peak-to-peak amplitude from algebraic voltages', () => {
    const signal = [0, 200, -800, 0];
    expect(peakToPeakAmplitudeUv(signal, 2, 1)).toBe(1000);
  });

  it('computes rise time between preceding positive peak and negative spike', () => {
    expect(riseTimeUs(sample(31.1), sample(30.8))).toBeCloseTo(300, 0);
  });

  it('counts phases as valid baseline crossings plus one', () => {
    const signal = buildTriphasic();
    const phases = countPhases(signal, sample(30), sample(40));
    expect(phases).toBeGreaterThanOrEqual(2);
    expect(phases).toBeLessThanOrEqual(4);
  });

  it('does not treat a shallow wiggle as a turn', () => {
    const n = 400;
    const signal = new Array(n).fill(0).map((_, i) => Math.sin(i / 8) * 8);
    expect(countTurns(signal, 10, n - 10)).toBe(0);
  });

  it('counts a 40 µV reversal as a turn', () => {
    const signal = new Array(80).fill(0);
    signal[20] = 80;
    signal[30] = 10;
    signal[40] = 70;
    expect(countTurns(signal, 10, 70)).toBeGreaterThanOrEqual(1);
  });

  it('detects onset after quiet baseline, not in thermal noise', () => {
    const signal = buildTriphasic();
    for (let i = 0; i < sample(28); i++) signal[i] = ((i % 5) - 2) * 0.4;
    const detected = detectOnsetOffset(signal, PUM_SAMPLING_RATE_HZ, sample(25));
    const startMs = (detected.startIndex / PUM_SAMPLING_RATE_HZ) * 1000;
    expect(startMs).toBeGreaterThan(28);
    expect(startMs).toBeLessThan(32);
  });

  it('returns live metrics from student cursors', () => {
    const signal = buildTriphasic();
    const metrics = measureMuap(signal, {
      startIndex: sample(30),
      endIndex: sample(40),
      negativePeakIndex: sample(31.1),
      positivePeakIndex: sample(30.8),
    });
    expect(metrics.durationMs).toBeCloseTo(10, 1);
    expect(metrics.amplitudeUv).toBeGreaterThan(700);
    expect(metrics.riseTimeUs).toBeGreaterThan(200);
    expect(metrics.riseTimeUs).toBeLessThan(500);
    expect(metrics.rectifiedArea).toBeGreaterThan(0);
  });
});
