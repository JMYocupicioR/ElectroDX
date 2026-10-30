export const PUM_SAMPLING_RATE_HZ = 20_000;
export const PUM_WINDOW_MS = 100;
export const PUM_PHASE_TURN_UV = 25;
export const PUM_RISE_TIME_LIMIT_US = 500;
export const PUM_ONSET_ACCEPT_MS = 0.5;
export const PUM_OFFSET_ACCEPT_MS = 0.5;
export const PUM_ONSET_ZERO_MS = 2.0;
export const PUM_OFFSET_ZERO_MS = 2.5;
export const PUM_PEAK_ACCEPT_MS = 0.2;
export const PUM_PEAK_ACCEPT_UV = 10;
export const PUM_PEAK_WRONG_TURN_UV = 50;
export const PUM_DISTANT_CONFIRM_CAP = 40;
export const PUM_PEAK_SNAP_MS = 0.3;

export type PumPatternType = 'normal' | 'chronic_neurogenic' | 'myopathic' | 'polyphasic';

export type PumCursorId = 'start' | 'end' | 'neg' | 'pos';

export interface PumGroundTruth {
  startIndex: number;
  endIndex: number;
  negativePeakIndex: number;
  positivePeakIndex: number;
  durationMs: number;
  amplitudeUv: number;
  riseTimeUs: number;
  phases: number;
  turns: number;
  rectifiedArea: number;
  isDistant: boolean;
}

export interface PumDocentBand {
  durationRange: [number, number];
  amplitudeRange: [number, number];
  maxTurns: number;
  patternType: PumPatternType;
}

/** Vértice de la plantilla del PUM (ms dentro de la ventana, µV; negativo = arriba en pantalla). */
export interface PumTemplatePoint {
  ms: number;
  uv: number;
}

/** Cursores de referencia que definen la medición correcta del caso. */
export interface PumMarkers {
  startMs: number;
  endMs: number;
  posMs: number;
  negMs: number;
}

export interface PumCaseDefinition {
  id: string;
  muscleName: string;
  samplingRate: number;
  uvPerDiv: number;
  msPerDiv: number;
  docentBand: PumDocentBand;
  /** Forma de onda editada por el docente. Si falta, se usa la plantilla de fábrica. */
  templatePoints?: PumTemplatePoint[];
  /** Cursores de referencia editados por el docente. Si faltan, se usan los de fábrica. */
  markers?: PumMarkers;
  /** Ruido de línea de base en µV (desviación estándar). */
  noiseSigma?: number;
}

export interface PumTrace {
  caseId: string;
  muscleName: string;
  samplingRate: number;
  uvPerDiv: number;
  msPerDiv: number;
  clean: number[];
  noisy: number[];
  noiseSigma: number;
  groundTruth: PumGroundTruth;
  docentBand: PumDocentBand;
}

export interface StudentMeasurement {
  startIndex: number;
  endIndex: number;
  negativePeakIndex: number;
  positivePeakIndex: number;
  discardedDistant: boolean;
}

export interface MuapMetrics {
  durationMs: number;
  amplitudeUv: number;
  riseTimeUs: number;
  phases: number;
  turns: number;
  rectifiedArea: number;
}

export interface CursorFeedback {
  startCursor: string;
  endCursor: string;
  peaks: string;
  riseTimeWarning?: string;
  discarded?: string;
}

export interface MetricAnalysisResult extends MuapMetrics {
  score: number;
  cursorScores: {
    start: number;
    end: number;
    neg: number;
    pos: number;
  };
  accepted: {
    start: boolean;
    end: boolean;
    neg: boolean;
    pos: boolean;
  };
  feedback: CursorFeedback;
}
