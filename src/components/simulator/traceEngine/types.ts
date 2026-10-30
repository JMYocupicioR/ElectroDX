// src/components/simulator/traceEngine/types.ts
// Tipos unificados para el motor de simulación electrodiagnóstica de trazos EMG/NCV

export type TraceStudyType = 'motor' | 'sensory' | 'needle' | 'late_response';

export type NeedlePattern =
  | 'normal_silence'
  | 'normal_mup'
  | 'fibrillations'
  | 'positive_waves'
  | 'fasciculations'
  | 'myotonia'
  | 'neurogenic_mup'
  | 'myopathic_mup';

export type DiagnosticCategory =
  | 'entrapment'
  | 'polyneuropathy'
  | 'radiculopathy'
  | 'myopathy'
  | 'motor_neuron'
  | 'neuromuscular_junction'
  | 'normal';

export type ComplementaryImageType =
  | 'electrode_technique'
  | 'ultrasound'
  | 'clinical'
  | 'mri';

export type PatternScope = 'normal' | 'pathologic' | 'both';

export interface TraceComplementaryImage {
  id: string;
  type: ComplementaryImageType;
  title: string;
  url: string;
  caption: string;
  measurementNote?: string; // ej. "Área de sección transversal: 14.5 mm² (Norma: < 10 mm²)"
  patternScope?: PatternScope; // Asociación clínica: 'normal', 'pathologic' o 'both'
}

export type ControlPointType = 'onset' | 'peak' | 'notch' | 'trough' | 'return';

export interface WaveformControlPoint {
  id: string;
  timeMs: number;       // Posición en el eje temporal en ms
  voltage: number;      // Amplitud fisiológica en mV o µV (deflexión negativa hacia arriba)
  type: ControlPointType;
  label?: string;
}

export interface CustomWaveformGeometry {
  points: WaveformControlPoint[];
  calculatedLatencyMs: number;
  calculatedAmplitude: number;
  calculatedDurationMs: number;
}

export interface TraceParameters {
  label: string;
  latency: number;          // ms (latencia distal o tiempo de inicio)
  amplitude: number;        // mV en motor / µV en sensitivo y aguja
  duration: number;         // ms (duración del potencial)
  velocity?: number;        // m/s
  distanceMm?: number;      // distancia de estimulación en mm (ej. 80mm para muñeca-APB)
  conductionBlock?: boolean;// caída de amplitud proximal > 50%
  temporalDispersion?: boolean; // aumento de duración > 30%
  proximalLatency?: number; // ms para estímulo proximal
  proximalAmplitude?: number;// mV en estímulo proximal
  proximalDuration?: number;// ms en estímulo proximal
  needlePattern?: NeedlePattern;
  polyphasia?: number;      // porcentaje de polifasia (0-100%)
  customWaveform?: CustomWaveformGeometry; // Geometría de puntos manuales personalizados
  images?: TraceComplementaryImage[]; // Imágenes complementarias específicas del trazo
  status: 'normal' | 'abnormal' | 'borderline';
  statusText: string;
  summary: string;
  normative: {
    latencyNorm: string;    // e.g. "< 4.0 ms"
    amplitudeNorm: string;  // e.g. "> 4.5 mV"
    velocityNorm?: string;  // e.g. "> 50 m/s"
    durationNorm?: string;  // e.g. "< 6.0 ms"
  };
}

export interface TraceCaseDefinition {
  id: string;
  title: string;
  category: DiagnosticCategory;
  studyType: TraceStudyType;
  nerveOrMuscle: string;
  technique: string;
  sensitivity: string;      // e.g. "2 mV / div", "10 µV / div", "50 µV / div"
  sweepSpeed: string;       // e.g. "2 ms / div", "1 ms / div", "10 ms / div"
  filterBandwidth?: string; // e.g. "20 Hz a 2 kHz", "20 Hz a 10 kHz"
  normal: TraceParameters;
  pathologic?: TraceParameters;
  images?: TraceComplementaryImage[]; // Galería de imágenes complementarias del caso
  clinicalPearls?: string[];
  tags?: string[];
  isCustomUserCreated?: boolean; // Verdadero si fue creado/editado manualmente por el docente
  createdAt?: string;
  authorName?: string;
}

export interface CaliperMeasurement {
  measuredLatencyMs: number;
  measuredAmplitudeValue: number;
  latencyErrorPercent: number;
  amplitudeErrorPercent: number;
  isAccurate: boolean;
}

export type TraceEmbedMode = 'interactive' | 'comparison' | 'challenge' | 'compact';
