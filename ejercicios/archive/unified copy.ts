import { StudyType } from './index';
import { EMGResults } from './emg';
import { NCSTestResult } from './ncs';

export interface Contact {
  phone: string;
  email?: string;
  address?: string;
}

export interface MedicalHistory {
  previousDiseases: string[];
  surgeries: string[];
  currentMedications: string[];
  allergies: string[];
  familyHistory?: string;
}

export interface EMGResults {
  muscle: string;
  insertionalActivity: string;
  spontaneousActivity: string;
  motorUnitActionPotentials: string;
  recruitmentPattern: string;
  interferencePattern: string;
  observations?: string;
}

export interface NCSResults {
  nerve: string;
  side: 'left' | 'right';
  latency: number;
  amplitude: number;
  velocity: number;
  fWave?: {
    latency: number;
    persistence: number;
  };
  hReflex?: {
    latency: number;
    amplitude: number;
  };
  observations?: string;
}

export interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  age: number;
  sex: 'male' | 'female' | 'other';
  weight: number;
  height: number;
  handDominance: 'left' | 'right' | 'ambidextrous';
  occupation: string;
  medicalHistory?: {
    diabetes: boolean;
    hypothyroidism: boolean;
    renalFailure: boolean;
    previousSurgeries: string[];
    medications: string[];
    allergies: string[];
  };
}

export interface Study {
  id: string;
  type: 'emg' | 'ncs' | 'emg_ncs';
  date: string;
  patientId: string;
  results: {
    emg?: EMGResults[];
    ncs?: NCSTestResult[];
  };
  observations?: string;
  conclusion?: string;
  aiAnalysis?: {
    findings: string[];
    recommendations: string[];
    confidence: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface AIAnalysis {
  emgAnalysis?: {
    id: string;
    studyId: string;
    content: string;
    timestamp: string;
    modelVersion: string;
  };
}

export interface PatientStudy {
  id: string;
  patientId: string;
  patientName: string;
  studyType: StudyType;
  studyData: Study;
  timestamp: string;
  observations?: string;
  conclusion?: string;
  aiAnalysis?: AIAnalysis;
}

// Estado vacío para inicializar el formulario
export const emptyPatientStudy: PatientStudy = {
  id: '',
  patientId: '',
  patientName: '',
  studyType: 'emg',
  studyData: {
    id: '',
    type: 'emg',
    date: new Date().toISOString(),
    patientId: '',
    results: {
      emg: [],
      ncs: []
    },
    observations: '',
    conclusion: '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  timestamp: new Date().toISOString(),
  observations: '',
  conclusion: ''
}; 