import { synthesizeMuap } from './synthesizeMuap';
import { PUM_SAMPLING_RATE_HZ, type PumCaseDefinition, type PumTrace } from './types';

export const PUM_CASE_DEFINITIONS: PumCaseDefinition[] = [
  {
    id: 'biceps-normal',
    muscleName: 'Bíceps braquial',
    samplingRate: PUM_SAMPLING_RATE_HZ,
    uvPerDiv: 200,
    msPerDiv: 10,
    docentBand: {
      durationRange: [8, 13],
      amplitudeRange: [400, 2000],
      maxTurns: 2,
      patternType: 'normal',
    },
  },
  {
    id: 'biceps-distant',
    muscleName: 'Bíceps braquial (aguja lejos)',
    samplingRate: PUM_SAMPLING_RATE_HZ,
    uvPerDiv: 200,
    msPerDiv: 10,
    docentBand: {
      durationRange: [8, 16],
      amplitudeRange: [200, 800],
      maxTurns: 2,
      patternType: 'normal',
    },
  },
  {
    id: 'neurogenic',
    muscleName: 'Primer interóseo dorsal',
    samplingRate: PUM_SAMPLING_RATE_HZ,
    uvPerDiv: 1000,
    msPerDiv: 10,
    docentBand: {
      durationRange: [12, 22],
      amplitudeRange: [2500, 6000],
      maxTurns: 4,
      patternType: 'chronic_neurogenic',
    },
  },
  {
    id: 'myopathic',
    muscleName: 'Deltoides',
    samplingRate: PUM_SAMPLING_RATE_HZ,
    uvPerDiv: 100,
    msPerDiv: 10,
    docentBand: {
      durationRange: [3, 7],
      amplitudeRange: [80, 400],
      maxTurns: 3,
      patternType: 'myopathic',
    },
  },
  {
    id: 'polyphasic',
    muscleName: 'Tibial anterior',
    samplingRate: PUM_SAMPLING_RATE_HZ,
    uvPerDiv: 200,
    msPerDiv: 10,
    docentBand: {
      durationRange: [8, 16],
      amplitudeRange: [300, 1500],
      maxTurns: 8,
      patternType: 'polyphasic',
    },
  },
  {
    id: 'satellite',
    muscleName: 'Vasto lateral',
    samplingRate: PUM_SAMPLING_RATE_HZ,
    uvPerDiv: 200,
    msPerDiv: 10,
    docentBand: {
      durationRange: [10, 18],
      amplitudeRange: [400, 1800],
      maxTurns: 4,
      patternType: 'chronic_neurogenic',
    },
  },
  {
    id: 'false-turn',
    muscleName: 'Bíceps braquial',
    samplingRate: PUM_SAMPLING_RATE_HZ,
    uvPerDiv: 200,
    msPerDiv: 10,
    docentBand: {
      durationRange: [8, 14],
      amplitudeRange: [500, 2000],
      maxTurns: 3,
      patternType: 'normal',
    },
  },
  {
    id: 'slow-onset',
    muscleName: 'Gastrocnemio medial',
    samplingRate: PUM_SAMPLING_RATE_HZ,
    uvPerDiv: 200,
    msPerDiv: 10,
    docentBand: {
      durationRange: [10, 18],
      amplitudeRange: [400, 1600],
      maxTurns: 2,
      patternType: 'normal',
    },
  },
];

export const CHALLENGE_CASE_IDS = [
  'biceps-normal',
  'biceps-distant',
  'neurogenic',
  'myopathic',
  'polyphasic',
  'satellite',
  'false-turn',
  'slow-onset',
  'biceps-normal',
  'neurogenic',
] as const;

/**
 * Ajustes docentes guardados desde el panel admin (/admin/simulador-pum).
 * Se fusionan sobre la definición de fábrica; nunca la reemplazan por completo.
 */
export type PumCaseOverride = Partial<Omit<PumCaseDefinition, 'id' | 'samplingRate'>>;

let caseOverrides: Record<string, PumCaseOverride> = {};
let overridesVersion = 0;
const overrideListeners = new Set<() => void>();

export function setPumCaseOverrides(next: Record<string, PumCaseOverride>): void {
  caseOverrides = { ...next };
  overridesVersion += 1;
  overrideListeners.forEach((fn) => fn());
}

export function getPumCaseOverrides(): Record<string, PumCaseOverride> {
  return caseOverrides;
}

export function getPumOverridesVersion(): number {
  return overridesVersion;
}

export function subscribePumOverrides(listener: () => void): () => void {
  overrideListeners.add(listener);
  return () => {
    overrideListeners.delete(listener);
  };
}

/** Definición de fábrica, sin ajustes docentes. */
export function getFactoryCaseDefinition(id: string): PumCaseDefinition | undefined {
  return PUM_CASE_DEFINITIONS.find((c) => c.id === id);
}

export function mergeCaseOverride(
  base: PumCaseDefinition,
  override: PumCaseOverride | undefined
): PumCaseDefinition {
  if (!override) return base;
  return {
    ...base,
    ...override,
    id: base.id,
    samplingRate: base.samplingRate,
    docentBand: { ...base.docentBand, ...(override.docentBand ?? {}) },
  };
}

export function getCaseDefinition(id: string): PumCaseDefinition | undefined {
  const base = getFactoryCaseDefinition(id);
  if (!base) return undefined;
  return mergeCaseOverride(base, caseOverrides[id]);
}

export function buildTrace(id: string, seed = 1): PumTrace {
  const def = getCaseDefinition(id);
  if (!def) throw new Error(`Caso PUM desconocido: ${id}`);
  return synthesizeMuap(def, seed);
}

export function buildChallengeTraces(seed = 7): PumTrace[] {
  return CHALLENGE_CASE_IDS.map((id, i) => buildTrace(id, seed + i * 13));
}
