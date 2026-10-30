import { countPhases, countTurns, msToIndex, peakToPeakAmplitudeUv, rectifiedAreaUvMs, riseTimeUs } from './measureMuap';
import {
  PUM_RISE_TIME_LIMIT_US,
  PUM_SAMPLING_RATE_HZ,
  PUM_WINDOW_MS,
  type PumCaseDefinition,
  type PumGroundTruth,
  type PumMarkers,
  type PumTemplatePoint,
  type PumTrace,
} from './types';

type TemplatePoint = PumTemplatePoint;

function sampleCount(samplingRate = PUM_SAMPLING_RATE_HZ): number {
  return msToIndex(PUM_WINDOW_MS, samplingRate);
}

function interpolate(points: TemplatePoint[], n: number, samplingRate: number): number[] {
  const sorted = [...points].sort((a, b) => a.ms - b.ms);
  const signal = new Array(n).fill(0);
  for (let i = 0; i < n; i++) {
    const t = (i / samplingRate) * 1000;
    if (t <= sorted[0].ms) {
      signal[i] = sorted[0].uv;
      continue;
    }
    if (t >= sorted[sorted.length - 1].ms) {
      signal[i] = sorted[sorted.length - 1].uv;
      continue;
    }
    let k = 0;
    while (k < sorted.length - 1 && sorted[k + 1].ms < t) k += 1;
    const a = sorted[k];
    const b = sorted[k + 1];
    const span = Math.max(0.0001, b.ms - a.ms);
    const u = (t - a.ms) / span;
    const s = u * u * (3 - 2 * u);
    signal[i] = a.uv + s * (b.uv - a.uv);
  }
  return signal;
}

function seededNoise(n: number, sigma: number, seed: number): number[] {
  let s = seed >>> 0;
  const out = new Array(n);
  for (let i = 0; i < n; i++) {
    s = (1664525 * s + 1013904223) >>> 0;
    const u1 = Math.max(1e-9, s / 0x100000000);
    s = (1664525 * s + 1013904223) >>> 0;
    const u2 = s / 0x100000000;
    const gauss = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
    out[i] = gauss * sigma;
  }
  return out;
}

function nearestIndex(signal: number[], ms: number, samplingRate: number): number {
  return Math.max(0, Math.min(signal.length - 1, msToIndex(ms, samplingRate)));
}

function extremumNear(
  signal: number[],
  aroundMs: number,
  prefer: 'min' | 'max',
  windowMs: number,
  samplingRate: number,
): number {
  const center = nearestIndex(signal, aroundMs, samplingRate);
  const radius = Math.max(1, msToIndex(windowMs, samplingRate));
  const from = Math.max(0, center - radius);
  const to = Math.min(signal.length - 1, center + radius);
  let best = center;
  for (let i = from; i <= to; i++) {
    if (prefer === 'min' && signal[i] < signal[best]) best = i;
    if (prefer === 'max' && signal[i] > signal[best]) best = i;
  }
  return best;
}

export const CASE_TEMPLATES: Record<string, TemplatePoint[]> = {
  'biceps-normal': [
    { ms: 0, uv: 0 },
    { ms: 32, uv: 0 },
    { ms: 32.6, uv: 95 },
    { ms: 32.9, uv: -760 },
    { ms: 36.5, uv: 110 },
    { ms: 42, uv: 0 },
    { ms: 100, uv: 0 },
  ],
  'biceps-distant': [
    { ms: 0, uv: 0 },
    { ms: 30, uv: 0 },
    { ms: 31.2, uv: 70 },
    { ms: 32.05, uv: -310 },
    { ms: 38, uv: 55 },
    { ms: 46, uv: 0 },
    { ms: 100, uv: 0 },
  ],
  neurogenic: [
    { ms: 0, uv: 0 },
    { ms: 28, uv: 0 },
    { ms: 28.7, uv: 280 },
    { ms: 29.05, uv: -3100 },
    { ms: 36, uv: 420 },
    { ms: 46, uv: 0 },
    { ms: 100, uv: 0 },
  ],
  myopathic: [
    { ms: 0, uv: 0 },
    { ms: 38, uv: 0 },
    { ms: 38.25, uv: 40 },
    { ms: 38.45, uv: -210 },
    { ms: 41.2, uv: 35 },
    { ms: 43.5, uv: 0 },
    { ms: 100, uv: 0 },
  ],
  polyphasic: [
    { ms: 0, uv: 0 },
    { ms: 30, uv: 0 },
    { ms: 30.5, uv: 90 },
    { ms: 31.0, uv: -420 },
    { ms: 32.2, uv: 160 },
    { ms: 33.4, uv: -280 },
    { ms: 34.6, uv: 140 },
    { ms: 36.2, uv: -90 },
    { ms: 39, uv: 0 },
    { ms: 100, uv: 0 },
  ],
  satellite: [
    { ms: 0, uv: 0 },
    { ms: 31, uv: 0 },
    { ms: 31.5, uv: 85 },
    { ms: 31.8, uv: -690 },
    { ms: 36, uv: 80 },
    { ms: 39, uv: 8 },
    { ms: 40.4, uv: -160 },
    { ms: 42.5, uv: 20 },
    { ms: 45, uv: 0 },
    { ms: 100, uv: 0 },
  ],
  'false-turn': [
    { ms: 0, uv: 0 },
    { ms: 31, uv: 0 },
    { ms: 31.5, uv: 100 },
    { ms: 31.75, uv: -240 },
    { ms: 31.95, uv: -90 },
    { ms: 32.2, uv: -820 },
    { ms: 36.5, uv: 95 },
    { ms: 43, uv: 0 },
    { ms: 100, uv: 0 },
  ],
  'slow-onset': [
    { ms: 0, uv: 0 },
    { ms: 27, uv: 0 },
    { ms: 30.8, uv: 55 },
    { ms: 31.15, uv: -640 },
    { ms: 36, uv: 90 },
    { ms: 44, uv: 0 },
    { ms: 100, uv: 0 },
  ],
};

export const DEFAULT_NOISE_SIGMA_UV: Record<string, number> = { 'biceps-distant': 4 };
export const FALLBACK_NOISE_SIGMA_UV = 2.4;

export const CASE_MARKERS: Record<string, PumMarkers> = {
  'biceps-normal': { startMs: 32, endMs: 42, posMs: 32.6, negMs: 32.9 },
  'biceps-distant': { startMs: 30, endMs: 46, posMs: 31.2, negMs: 32.05 },
  neurogenic: { startMs: 28, endMs: 46, posMs: 28.7, negMs: 29.05 },
  myopathic: { startMs: 38, endMs: 43.5, posMs: 38.25, negMs: 38.45 },
  polyphasic: { startMs: 30, endMs: 39, posMs: 30.5, negMs: 31.0 },
  satellite: { startMs: 31, endMs: 45, posMs: 31.5, negMs: 31.8 },
  'false-turn': { startMs: 31, endMs: 43, posMs: 31.5, negMs: 32.2 },
  'slow-onset': { startMs: 27, endMs: 44, posMs: 30.8, negMs: 31.15 },
};

export function synthesizeMuap(def: PumCaseDefinition, seed = 1): PumTrace {
  const samplingRate = def.samplingRate || PUM_SAMPLING_RATE_HZ;
  const n = sampleCount(samplingRate);
  const points = def.templatePoints?.length ? def.templatePoints : CASE_TEMPLATES[def.id];
  const markers = def.markers ?? CASE_MARKERS[def.id];
  if (!points || points.length < 2 || !markers) {
    throw new Error(`Plantilla PUM desconocida: ${def.id}`);
  }
  const clean = interpolate(points, n, samplingRate);
  const startIndex = nearestIndex(clean, markers.startMs, samplingRate);
  const endIndex = nearestIndex(clean, markers.endMs, samplingRate);
  const positivePeakIndex = extremumNear(clean, markers.posMs, 'max', 0.4, samplingRate);
  const negativePeakIndex = extremumNear(clean, markers.negMs, 'min', 0.4, samplingRate);

  const rise = riseTimeUs(negativePeakIndex, positivePeakIndex, samplingRate);
  const groundTruth: PumGroundTruth = {
    startIndex,
    endIndex,
    negativePeakIndex,
    positivePeakIndex,
    durationMs: ((endIndex - startIndex) / samplingRate) * 1000,
    amplitudeUv: peakToPeakAmplitudeUv(clean, negativePeakIndex, positivePeakIndex),
    riseTimeUs: rise,
    phases: countPhases(clean, startIndex, endIndex),
    turns: countTurns(clean, startIndex, endIndex),
    rectifiedArea: rectifiedAreaUvMs(clean, startIndex, endIndex, samplingRate),
    isDistant: rise > PUM_RISE_TIME_LIMIT_US,
  };

  const noiseSigma = Math.max(
    0,
    def.noiseSigma ?? DEFAULT_NOISE_SIGMA_UV[def.id] ?? FALLBACK_NOISE_SIGMA_UV
  );
  const noise = seededNoise(n, noiseSigma, seed + def.id.length * 17);
  const noisy = clean.map((v, i) => v + noise[i]);

  return {
    caseId: def.id,
    muscleName: def.muscleName,
    samplingRate,
    uvPerDiv: def.uvPerDiv,
    msPerDiv: def.msPerDiv,
    clean,
    noisy,
    noiseSigma,
    groundTruth,
    docentBand: def.docentBand,
  };
}
