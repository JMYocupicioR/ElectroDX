// ============================================================
// ClinicalCase.ts — Tipos unificados para el sistema de ejercicios
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
  | 'neuromuscular_junction';

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
  latency: number;       // ms
  amplitude: number;     // mV (motor) o μV (sensory)
  velocity: number;      // m/s
  fWaveLatency?: number; // ms
  /** Valores normales de referencia para este nervio */
  normalRanges: {
    latency: { min: number; max: number };
    amplitude: { min: number; max: number };
    velocity: { min: number; max: number };
  };
  /** Estado calculado */
  status: 'normal' | 'abnormal' | 'borderline';
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
}

// ─── Caso clínico completo ────────────────────────────────────

export interface ClinicalCase {
  id: string;
  difficulty: Difficulty;
  patient: ExercisePatient;
  ncsResults: NCSExerciseResult[];
  emgResults: EMGExerciseResult[];
  specialStudies?: SpecialStudyResult[];
  correctDiagnosis: CorrectDiagnosis;
  source: 'template' | 'ai_generated';
  createdAt: string;
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
