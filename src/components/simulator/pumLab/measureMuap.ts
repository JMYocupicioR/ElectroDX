import {
  PUM_PHASE_TURN_UV,
  PUM_SAMPLING_RATE_HZ,
  type MuapMetrics,
  type StudentMeasurement,
} from './types';

export function indexToMs(index: number, samplingRate = PUM_SAMPLING_RATE_HZ): number {
  return (index / samplingRate) * 1000;
}

export function msToIndex(ms: number, samplingRate = PUM_SAMPLING_RATE_HZ): number {
  return Math.round((ms / 1000) * samplingRate);
}

export function clampIndex(index: number, length: number): number {
  if (length <= 0) return 0;
  return Math.max(0, Math.min(length - 1, Math.round(index)));
}

export function peakToPeakAmplitudeUv(signal: number[], negIndex: number, posIndex: number): number {
  const iNeg = clampIndex(negIndex, signal.length);
  const iPos = clampIndex(posIndex, signal.length);
  return Math.abs(signal[iNeg] - signal[iPos]);
}

export function riseTimeUs(
  negIndex: number,
  posIndex: number,
  samplingRate = PUM_SAMPLING_RATE_HZ,
): number {
  return Math.max(0, (negIndex - posIndex) / samplingRate) * 1_000_000;
}

export function rectifiedAreaUvMs(
  signal: number[],
  startIndex: number,
  endIndex: number,
  samplingRate = PUM_SAMPLING_RATE_HZ,
): number {
  const start = clampIndex(Math.min(startIndex, endIndex), signal.length);
  const end = clampIndex(Math.max(startIndex, endIndex), signal.length);
  if (end <= start) return 0;
  const dtMs = 1000 / samplingRate;
  let area = 0;
  for (let i = start; i < end; i++) {
    area += (Math.abs(signal[i]) + Math.abs(signal[i + 1])) * 0.5 * dtMs;
  }
  return area;
}

export function countPhases(
  signal: number[],
  startIndex: number,
  endIndex: number,
  thresholdUv = PUM_PHASE_TURN_UV,
): number {
  const start = clampIndex(Math.min(startIndex, endIndex), signal.length);
  const end = clampIndex(Math.max(startIndex, endIndex), signal.length);
  if (end - start < 2) return 1;

  const region = (v: number): -1 | 0 | 1 => {
    if (v > thresholdUv) return 1;
    if (v < -thresholdUv) return -1;
    return 0;
  };

  let lastSide: -1 | 1 | 0 = 0;
  let crossings = 0;
  for (let i = start; i <= end; i++) {
    const side = region(signal[i]);
    if (side === 0) continue;
    if (lastSide !== 0 && side !== lastSide) crossings += 1;
    lastSide = side;
  }
  return crossings + 1;
}

export function countTurns(
  signal: number[],
  startIndex: number,
  endIndex: number,
  thresholdUv = PUM_PHASE_TURN_UV,
): number {
  const start = clampIndex(Math.min(startIndex, endIndex), signal.length);
  const end = clampIndex(Math.max(startIndex, endIndex), signal.length);
  if (end - start < 4) return 0;

  const extrema: number[] = [];
  for (let i = start + 1; i < end; i++) {
    const prev = signal[i - 1];
    const cur = signal[i];
    const next = signal[i + 1];
    const isMax = cur >= prev && cur > next;
    const isMin = cur <= prev && cur < next;
    if (isMax || isMin) extrema.push(i);
  }

  if (extrema.length === 0) return 0;

  let turns = 0;
  let last = extrema[0];
  for (let k = 1; k < extrema.length; k++) {
    const idx = extrema[k];
    if (Math.abs(signal[idx] - signal[last]) >= thresholdUv) {
      turns += 1;
      last = idx;
    }
  }
  return turns;
}

export function detectOnsetOffset(
  signal: number[],
  samplingRate = PUM_SAMPLING_RATE_HZ,
  baselineEndIndex?: number,
): { startIndex: number; endIndex: number; thresholdUv: number } {
  const n = signal.length;
  const baselineN = Math.max(8, Math.min(n, baselineEndIndex ?? Math.floor(n * 0.25)));
  let sum = 0;
  let sumSq = 0;
  for (let i = 0; i < baselineN; i++) {
    sum += signal[i];
    sumSq += signal[i] * signal[i];
  }
  const mean = sum / baselineN;
  const variance = Math.max(0, sumSq / baselineN - mean * mean);
  const sigma = Math.sqrt(variance);
  const thresholdUv = Math.max(5, 2 * sigma);
  const staySamples = Math.max(2, msToIndex(1.5, samplingRate));

  let startIndex = 0;
  for (let i = 0; i < n; i++) {
    if (Math.abs(signal[i] - mean) > thresholdUv) {
      let staysOut = true;
      const look = Math.min(n - 1, i + Math.max(2, msToIndex(0.4, samplingRate)));
      for (let j = i; j <= look; j++) {
        if (Math.abs(signal[j] - mean) <= thresholdUv * 0.6) {
          staysOut = false;
          break;
        }
      }
      if (staysOut) {
        startIndex = i;
        break;
      }
    }
  }

  let endIndex = n - 1;
  for (let i = startIndex; i < n; i++) {
    if (Math.abs(signal[i] - mean) <= thresholdUv) {
      let stays = true;
      const look = Math.min(n - 1, i + staySamples);
      for (let j = i; j <= look; j++) {
        if (Math.abs(signal[j] - mean) > thresholdUv) {
          stays = false;
          break;
        }
      }
      if (stays && i > startIndex + msToIndex(1, samplingRate)) {
        endIndex = i;
        break;
      }
    }
  }

  return { startIndex, endIndex, thresholdUv };
}

export function measureMuap(
  signal: number[],
  measurement: Pick<StudentMeasurement, 'startIndex' | 'endIndex' | 'negativePeakIndex' | 'positivePeakIndex'>,
  samplingRate = PUM_SAMPLING_RATE_HZ,
): MuapMetrics {
  const start = clampIndex(measurement.startIndex, signal.length);
  const end = clampIndex(measurement.endIndex, signal.length);
  const neg = clampIndex(measurement.negativePeakIndex, signal.length);
  const pos = clampIndex(measurement.positivePeakIndex, signal.length);

  return {
    durationMs: Math.abs(indexToMs(end, samplingRate) - indexToMs(start, samplingRate)),
    amplitudeUv: peakToPeakAmplitudeUv(signal, neg, pos),
    riseTimeUs: riseTimeUs(neg, pos, samplingRate),
    phases: countPhases(signal, start, end),
    turns: countTurns(signal, start, end),
    rectifiedArea: rectifiedAreaUvMs(signal, start, end, samplingRate),
  };
}

export function snapToLocalExtremum(
  signal: number[],
  index: number,
  prefer: 'min' | 'max',
  windowMs = 0.3,
  samplingRate = PUM_SAMPLING_RATE_HZ,
): number {
  const radius = Math.max(1, msToIndex(windowMs, samplingRate));
  const center = clampIndex(index, signal.length);
  const from = Math.max(0, center - radius);
  const to = Math.min(signal.length - 1, center + radius);
  let best = center;
  for (let i = from; i <= to; i++) {
    if (prefer === 'min' && signal[i] < signal[best]) best = i;
    if (prefer === 'max' && signal[i] > signal[best]) best = i;
  }
  return best;
}
