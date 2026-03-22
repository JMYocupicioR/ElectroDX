export interface NerveData {
  latency: number;
  amplitude: number;
  velocity: number;
  temperature: number;
}

export interface FWaveData {
  latency: number;
  persistence: number;
}

export interface MuscleEvaluation {
  muscle: string;
  side: 'left' | 'right';
  mrcGrade: number;
  notes?: string;
}

export interface ClinicalFindings {
  muscleTone: {
    status: 'normal' | 'increased' | 'decreased';
    description: string;
  };
  muscleStrength: {
    affectedMuscles: MuscleEvaluation[];
  };
  reflexes: {
    biceps: 'normal' | 'increased' | 'decreased' | 'absent';
    triceps: 'normal' | 'increased' | 'decreased' | 'absent';
    patellar: 'normal' | 'increased' | 'decreased' | 'absent';
    achilles: 'normal' | 'increased' | 'decreased' | 'absent';
  };
  coordination: {
    fingerToNose: 'normal' | 'abnormal';
    heelToShin: 'normal' | 'abnormal';
    rapidAlternatingMovements: 'normal' | 'abnormal';
  };
  gait: {
    pattern: 'normal' | 'abnormal';
    description: string;
  };
}

export interface ReasonForStudy {
  weakness: {
    present: boolean;
    distribution: string[];
    severity: 'mild' | 'moderate' | 'severe';
    progression: string;
    onset: string;
    evolution: string;
    associatedSymptoms: string[];
  };
  paresthesias: {
    present: boolean;
    distribution: string[];
    characteristics: string[];
    duration: string;
    frequency: string;
    triggers: string[];
    alleviatingFactors: string[];
  };
  pain: {
    present: boolean;
    type: string[];
    distribution: string[];
    intensity: number;
    onset: string;
    evolution: string;
    triggers: string[];
    alleviatingFactors: string[];
  };
}

export interface PatientData {
  id: string;
  firstName: string;
  lastName: string;
  age: number;
  sex: 'male' | 'female' | 'other';
  weight: number;
  height: number;
  handDominance: 'right' | 'left' | 'ambidextrous';
  occupation: string;
  medicalHistory: {
    diabetes: boolean;
    hypothyroidism: boolean;
    renalFailure: boolean;
    previousSurgeries: string[];
    medications: string[];
    allergies: string[];
  };
}

export interface NCSData {
  motor: {
    [key: string]: NerveData;
  };
  sensory: {
    [key: string]: NerveData;
  };
  fWaves: {
    [key: string]: FWaveData;
  };
  hReflex: {
    latency: number;
    amplitude: number;
  };
  blinkReflex: {
    r1: number;
    r2: number;
  };
}

export interface MuscleEMGData {
  selected: boolean;
  strength: number;
  insertionalActivity: 'normal' | 'increased' | 'decreased';
  spontaneousActivity: {
    fibrillations: 'absent' | 'present' | 'increased';
    positiveWaves: 'absent' | 'present' | 'increased';
    fasciculations: 'absent' | 'present' | 'increased';
  };
  motorUnitAnalysis: {
    duration: number;
    amplitude: number;
    polyphasia: 'normal' | 'increased';
    recruitment: 'normal' | 'reduced' | 'early';
  };
  interference: 'normal' | 'reduced' | 'full';
}

export interface MuscleSideData {
  left?: MuscleEMGData;
  right?: MuscleEMGData;
}

export interface EMGData {
  [muscleName: string]: MuscleSideData;
}

export interface Muscle {
  id: string;
  name: string;
  type: 'proximal' | 'distal' | 'axial' | 'cranial';
}

export const availableMuscles: Muscle[] = [
  // Miembros Superiores
  { id: 'deltoides', name: 'Deltoides', type: 'proximal' },
  { id: 'biceps', name: 'Bíceps Braquial', type: 'proximal' },
  { id: 'triceps', name: 'Tríceps Braquial', type: 'proximal' },
  { id: 'firstDorsal', name: 'Primer Interóseo Dorsal', type: 'distal' },
  { id: 'abductorPollicis', name: 'Abductor del Pulgar', type: 'distal' },
  { id: 'flexorCarpiRadialis', name: 'Flexor Carpo Radial', type: 'distal' },
  { id: 'extensorDigitorum', name: 'Extensor Común de los Dedos', type: 'distal' },
  
  // Miembros Inferiores
  { id: 'iliopsoas', name: 'Iliopsoas', type: 'proximal' },
  { id: 'quadriceps', name: 'Cuádriceps', type: 'proximal' },
  { id: 'tibialisAnterior', name: 'Tibial Anterior', type: 'distal' },
  { id: 'gastrocnemius', name: 'Gastrocnemio', type: 'distal' },
  { id: 'extensorHallucis', name: 'Extensor del Hallux', type: 'distal' },
  { id: 'peroneusLongus', name: 'Peroneo Largo', type: 'distal' },
  
  // Tronco
  { id: 'paraspinal', name: 'Paraespinales', type: 'axial' },
  { id: 'rectusAbdominis', name: 'Recto Abdominal', type: 'axial' },
  
  // Cara
  { id: 'frontalis', name: 'Frontal', type: 'cranial' },
  { id: 'orbicularisOculi', name: 'Orbicular del Ojo', type: 'cranial' },
  { id: 'masseter', name: 'Masetero', type: 'cranial' },
  { id: 'trapezius', name: 'Trapecio', type: 'cranial' }
];

export interface ClinicalEvaluation {
  patientData: PatientData;
  ncsData: NCSData;
  emgData: EMGData;
  interpretation: {
    pattern: string;
    severity: 'mild' | 'moderate' | 'severe';
    chronicity: 'acute' | 'subacute' | 'chronic';
    location: string;
    diagnosis: string;
  };
  recommendations: {
    additionalStudies: string[];
    followUp: string;
    treatment: string;
  };
  technicalDetails: {
    electrodes: string;
    patientPosition: string;
    roomTemperature: number;
    notes: string;
  };
  reasonForStudy: {
    weakness: {
      present: boolean;
      distribution: string[];
      severity: 'mild' | 'moderate' | 'severe';
      progression: string;
      onset: string;
      evolution: string;
      associatedSymptoms: string[];
    };
    paresthesias: {
      present: boolean;
      distribution: string[];
      characteristics: string[];
      duration: string;
      frequency: string;
      triggers: string[];
      alleviatingFactors: string[];
    };
    pain: {
      present: boolean;
      type: string[];
      distribution: string[];
      intensity: number;
      onset: string;
      evolution: string;
      triggers: string[];
      alleviatingFactors: string[];
    };
  };
  clinicalFindings: {
    muscleTone: {
      status: string;
      description: string;
    };
    muscleStrength: {
      affectedMuscles: Array<{
        muscle: string;
        side: 'left' | 'right';
        mrcGrade: number;
        notes: string;
      }>;
    };
    reflexes: {
      biceps: string;
      triceps: string;
      patellar: string;
      achilles: string;
    };
    coordination: {
      fingerToNose: string;
      heelToShin: string;
      rapidAlternatingMovements: string;
    };
    gait: {
      pattern: string;
      description: string;
    };
  };
  preliminaryDiagnosis: string;
  ncsFindings: {
    motorNerves: { [key: string]: NerveData };
    sensoryNerves: { [key: string]: NerveData };
    fWaves: { [key: string]: FWaveData };
  };
  emgFindings: {
    muscles: { [key: string]: any }; // TODO: Definir tipo específico
  };
  specialStudies: string[];
  studyIndications: string[];
  recommendedProtocol: string;
  patientId: string;
  date: string;
  examiner: string;
  clinicalHistory: string;
  physicalExamination: string;
  finalRecommendations: string;
}

export interface NCSResults {
  motor: {
    latency: number;
    amplitude: number;
    conductionVelocity: number;
    fWave: {
      latency: number;
      persistence: number;
    };
  };
  sensory: {
    latency: number;
    amplitude: number;
    conductionVelocity: number;
  };
}

export interface NerveConductionData {
  latency: number;
  amplitude: number;
  conductionVelocity?: number;
  notes?: string;
}

export interface EMGResults {
  muscles: Record<string, MuscleEMGData>;
  ncsResults?: Record<string, NerveConductionData>;
  interpretation?: EMGInterpretation;
  analysisDate: string;
  reviewedBy: string;
  recommendedFollowUp?: string;
  rawWaveData?: RawEMGData[];
}

export interface EMGInterpretation {
  patternType: 'normal' | 'neuropathic' | 'myopathic' | 'mixed' | 'non-specific';
  patternSubtype?: string;
  distribution: 'focal' | 'multifocal' | 'diffuse' | 'proximal' | 'distal' | 'generalized';
  laterality: 'unilateral' | 'bilateral' | 'asymmetric bilateral';
  chronicity: 'acute' | 'subacute' | 'chronic' | 'acute on chronic';
  severity: 'minimal' | 'mild' | 'moderate' | 'severe';
  suggestedDiagnoses: {
    diagnosisId: string;
    confidence: number;
    matchingCriteria: string[];
  }[];
  abnormalMuscles: string[];
  normalMuscles: string[];
  notes: string;
}

export interface RawEMGData {
  muscleId: string;
  timePoints: number[];
  amplitudePoints: number[];
  samplingRate: number;
  duration: number;
  triggerPoints?: number[];
}

export interface DiagnosticCriteria {
  canSkipEMG: boolean;
  reasons: string[];
  requiresEMG: boolean;
  emgReasons: string[];
}

export interface IntegratedDiagnosis {
  clinicalCorrelation: string;
  lesionType: 'axonal' | 'demyelinating' | 'mixed';
  pathologyType: 'neuropathic' | 'myopathic' | 'mixed';
  severity: 'mild' | 'moderate' | 'severe';
  chronicity: 'acute' | 'subacute' | 'chronic';
  distribution: string[];
  finalDiagnosis: string;
  recommendations: string[];
  emgPattern?: {
    type: 'normal' | 'neuropathic' | 'myopathic' | 'mixed' | 'non-specific';
    distribution: string;
    chronicity: string;
    severity: string;
    suggestedDiagnoses: string[];
  };
  ncsPattern?: {
    type: 'normal' | 'axonal' | 'demyelinating' | 'mixed';
    distribution: string;
    severity: string;
    suggestedDiagnoses: string[];
  };
  prognosis?: string;
  followUpRecommendations?: string;
  referringPhysicianNotes?: string;
} 