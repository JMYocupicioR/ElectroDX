export interface PatientDemographics {
  id: string;
  age: number;
  gender: 'M' | 'F' | 'O';
  height: number;
  weight: number;
  bmi: number;
}

export interface NerveConductionTest {
  testId: string;
  date: string;
  nerve: string;
  side: 'left' | 'right' | 'bilateral';
  latency: number;
  amplitude: number;
  velocity: number;
  distance: number;
  temperature: number;
  referenceRange: {
    min: number;
    max: number;
  };
}

export interface MedicalReport {
  patient: PatientDemographics;
  tests: NerveConductionTest[];
  diagnosis: string;
  notes: string;
  metadata: {
    originalFormat: string;
    conversionDate: string;
    confidenceScore: number;
    processingErrors: string[];
  };
}

export type SupportedFileFormat = 'rtf' | 'docx' | 'pdf' | 'xml';

export interface FileConversionResult {
  success: boolean;
  report: MedicalReport | null;
  errors: string[];
  warnings: string[];
  processingTime: number;
} 