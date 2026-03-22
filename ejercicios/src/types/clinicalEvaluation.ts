import { Patient } from './patient';

export interface ValidationErrors {
  [key: string]: string;
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

export interface ClinicalFindings {
  muscleTone: {
    status: 'normal' | 'increased' | 'decreased';
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

export interface NCSData {
  motor: {
    [nerveId: string]: {
      left?: {
        selected: boolean;
        latency: number;
        amplitude: number;
        velocity: number;
      };
      right?: {
        selected: boolean;
        latency: number;
        amplitude: number;
        velocity: number;
      };
    };
  };
  sensory: {
    [nerveId: string]: {
      left?: {
        selected: boolean;
        latency: number;
        amplitude: number;
        velocity: number;
      };
      right?: {
        selected: boolean;
        latency: number;
        amplitude: number;
        velocity: number;
      };
    };
  };
  fWaves: {
    [nerveId: string]: {
      selected: boolean;
      latency: number;
      persistence: number;
    };
  };
  hReflex: {
    selected: boolean;
    latency: number;
    amplitude: number;
  };
}

export interface EMGData {
  [muscleId: string]: {
    left?: {
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
    };
    right?: {
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
    };
  };
}

export interface Interpretation {
  pattern: string;
  severity: 'mild' | 'moderate' | 'severe';
  chronicity: 'acute' | 'subacute' | 'chronic';
  location: string;
  diagnosis: string;
}

export interface Recommendations {
  additionalStudies: string[];
  followUp: string;
  treatment: string;
}

export interface TechnicalDetails {
  electrodes: string;
  patientPosition: string;
  roomTemperature: number;
  notes: string;
}

export interface ClinicalEvaluationFormData {
  patientData: PatientData;
  reasonForStudy: ReasonForStudy;
  clinicalFindings: ClinicalFindings;
  ncsData: NCSData;
  emgData: EMGData;
  interpretation: Interpretation;
  recommendations: Recommendations;
  technicalDetails: TechnicalDetails;
}

export interface ClinicalEvaluation {
  patientInfo: {
    name: string;
    age: number;
    id: string;
    date: string;
  };
  reasonsForStudy: string;
  clinicalFindings: string;
  ncsFindings: {
    motor: {
      [nerveName: string]: {
        side: 'left' | 'right';
        distalLatency: number;
        amplitude: number;
        velocity: number;
      };
    };
    sensory: {
      [nerveName: string]: {
        side: 'left' | 'right';
        amplitude: number;
        velocity: number;
      };
    };
  };
  emgFindings: {
    muscles: {
      [muscleName: string]: {
        side: 'left' | 'right';
        insertionalActivity: string;
        spontaneousActivity: {
          fibrillations: string;
          positiveWaves: string;
          fasciculations: string;
        };
        mupAnalysis: {
          duration: number;
          amplitude: number;
          polyphasia: string;
          recruitment: string;
        };
        associatedNerves?: string[];
        associatedRoots?: string[];
      };
    };
  };
  diagnosis: string;
}

export interface Patient {
  id: string;
  name: string;
  age: number;
  gender: 'male' | 'female' | 'other';
  medicalHistory: string;
  medications: string[];
  allergies: string[];
} 