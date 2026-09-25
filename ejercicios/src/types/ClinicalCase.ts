// ============================================================
// ClinicalCase.ts — Tipos unificados para el sistema de ejercicios
// v3: +RNS, +Late Responses, +Severity, +Temperature, +ConductionBlock
// ============================================================

/** Nivel de dificultad del ejercicio */
export type Difficulty = 'easy' | 'medium' | 'hard';

/** Categoría diagnóstica principal */
export type DiagnosticCategory =
  | 'normal'
  | 'neuropathic'
  | 'axonal'
  | 'demyelinating'
  | 'myopathic'
  | 'radiculopathy'
  | 'plexopathy'
  | 'entrapment'
  | 'motor_neuron_disease'
  | 'neuromuscular_junction'
  | 'pitfall';

/** Grado de severidad estandarizado (AANEM) */
export type SeverityGrade = 'mild' | 'moderate' | 'severe' | 'very_severe';

// ─── Datos del paciente ───────────────────────────────────────

export interface ExercisePatient {
  age: number;
  sex: 'male' | 'female';
  occupation: string;
  chiefComplaint: string;
  clinicalHistory: string;
  physicalExam: string;
  relevantHistory?: string[];
}

// ─── Resultados NCS ───────────────────────────────────────────

export interface NCSExerciseResult {
  nerve: string;
  side: 'left' | 'right' | 'bilateral';
  type: 'motor' | 'sensory';
  /** Sitio de estimulación (para estudio proximal/distal) */
  stimulationSite?: 'distal' | 'proximal' | 'across_elbow' | 'above_fibular_head' | 'below_fibular_head';
  latency: number;       // ms
  amplitude: number;     // mV (motor) o μV (sensory)
  velocity: number;      // m/s
  fWaveLatency?: number; // ms — latencia mínima de onda F
  /** Amplitud proximal para cálculo de bloqueo de conducción */
  proximalAmplitude?: number;
  /** Bloqueo de conducción: caída >50% CMAP proximal vs distal */
  conductionBlock?: boolean;
  /** Dispersión temporal: duración CMAP proximal >30% mayor que distal */
  temporalDispersion?: boolean;
  /** Valores normales de referencia para este nervio */
  normalRanges: {
    latency: { min: number; max: number };
    amplitude: { min: number; max: number };
    velocity: { min: number; max: number };
  };
  /** Estado calculado */
  status: 'normal' | 'abnormal' | 'borderline';
}

// ─── Resultados de Respuestas Tardías ─────────────────────────

export interface LateResponseResult {
  type: 'f_wave' | 'h_reflex';
  nerve: string;
  side: 'left' | 'right';
  /** Latencia mínima (ms) — para F-wave */
  minLatency?: number;
  /** Persistencia (%) — para F-wave */
  persistence?: number;
  /** Cronodispersión (ms) — para F-wave */
  chronodispersion?: number;
  /** Latencia (ms) — para H-reflex */
  latency?: number;
  /** Rango normal según talla/edad */
  normalRange: { min: number; max: number };
  /** Estado */
  status: 'normal' | 'abnormal' | 'absent';
}

// ─── Resultados ENR (Estimulación Nerviosa Repetitiva) ────────

export interface RNSResult {
  nerve: string;
  muscle: string;
  side: 'left' | 'right';
  /** Frecuencia de estimulación */
  frequency: '2Hz' | '3Hz' | '5Hz' | '20Hz' | '50Hz';
  /** CMAP basal (mV) */
  baselineCMAP: number;
  /** Decremento/incremento (%) — negativo = decremento */
  decrementPercent: number;
  /** Facilitación post-ejercicio (% incremento tras 10s ejercicio máximo) */
  postExerciseFacilitation?: number;
  /** Agotamiento post-ejercicio (% decremento a 2-4 min post-ejercicio) */
  postExerciseExhaustion?: number;
  /** Estado */
  status: 'normal' | 'decremental' | 'incremental';
}

// ─── Resultados EMG ───────────────────────────────────────────

export interface EMGExerciseResult {
  muscle: string;
  side: 'left' | 'right';
  nerve: string;
  root: string;
  /** Actividad de inserción */
  insertionalActivity: 'normal' | 'increased' | 'decreased' | 'absent';
  /** Actividad espontánea */
  spontaneousActivity: {
    fibrillations: 'absent' | '1+' | '2+' | '3+' | '4+';
    positiveWaves: 'absent' | '1+' | '2+' | '3+' | '4+';
    fasciculations: 'absent' | 'present' | 'frequent';
    complexRepetitiveDischarges: 'absent' | 'present';
    myotonicDischarges?: 'absent' | 'present';
  };
  /** Potenciales de unidad motora (PUMs) */
  motorUnitPotentials: {
    duration: number;     // ms
    amplitude: number;    // μV
    polyphasia: number;   // %
    phases: number;       // número de fases
  };
  /** Patrón de reclutamiento */
  recruitmentPattern: 'normal' | 'reduced' | 'early' | 'discrete' | 'absent';
  /** Patrón de interferencia */
  interferencePattern: 'full' | 'reduced' | 'discrete' | 'absent';
  /** Estado general */
  status: 'normal' | 'abnormal';
}

// ─── Hallazgo clave ───────────────────────────────────────────

export interface KeyFinding {
  parameter: string;
  location: string;
  value: string;
  normalValue: string;
  significance: string;
  importance: 'critical' | 'major' | 'supporting';
}

// ─── Resultado de estudio especial ────────────────────────────

export interface SpecialStudyResult {
  type: string;
  description: string;
  result: string;
  interpretation: string;
}

// ─── Diagnóstico correcto (oculto al alumno) ─────────────────

export interface CorrectDiagnosis {
  patternId: string;
  patternName: string;
  category: DiagnosticCategory;
  explanation: string;
  keyFindings: KeyFinding[];
  differentials: {
    patternId: string;
    patternName: string;
    whyNot: string;
  }[];
  recommendations: string[];
  /** Grado de severidad del caso */
  severityGrade?: SeverityGrade;
  severityExplanation?: string;
}

// ─── Caso clínico completo ────────────────────────────────────

export interface ClinicalCase {
  id: string;
  difficulty: Difficulty;
  patient: ExercisePatient;
  ncsResults: NCSExerciseResult[];
  emgResults: EMGExerciseResult[];
  /** Respuestas tardías (F-wave, H-reflex) */
  lateResponses?: LateResponseResult[];
  /** Estimulación nerviosa repetitiva (para NMJ) */
  rnsResults?: RNSResult[];
  specialStudies?: SpecialStudyResult[];
  correctDiagnosis: CorrectDiagnosis;
  source: 'template' | 'ai_generated';
  createdAt: string;
  /** Temperatura cutánea al momento del estudio (°C) */
  skinTemperature?: number;
  /** Notas técnicas visibles al alumno */
  technicalNotes?: string;
  /** ¿Es un caso trampa/pitfall? */
  isPitfall?: boolean;
  pitfallExplanation?: string;
  /** Pistas del caso (modo estudio) */
  hints?: string[];
}

// ─── Opción de diagnóstico (lo que se muestra al alumno) ──────

export interface DiagnosisOption {
  patternId: string;
  patternName: string;
  category: DiagnosticCategory;
  description: string;
}

// ─── Resultado de evaluación ──────────────────────────────────

export interface EvaluationResult {
  isCorrect: boolean;
  score: number;                  // 0-100
  selectedAnswer: string;
  correctAnswer: string;
  correctPatternName: string;
  explanation: string;
  keyFindingsHighlighted: KeyFinding[];
  differentialExplanations: {
    patternName: string;
    whyNot: string;
  }[];
  timeSpent?: number;             // seconds
  severityGrade?: SeverityGrade;
  severityExplanation?: string;
}

// ─── Intento de ejercicio (historial) ─────────────────────────

export interface ExerciseAttempt {
  id: string;
  caseId: string;
  patternId: string;
  patternName: string;
  difficulty: Difficulty;
  selectedAnswer: string;
  isCorrect: boolean;
  score: number;
  timeSpent: number;
  timestamp: string;
}
