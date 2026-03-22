// ========== TIPOS PARA EL SISTEMA MEJORADO DE PROCESAMIENTO ==========
// Tipos unificados para compatibilidad entre todos los componentes

import { Patient } from './patient';
import { ClinicalSymptomsData } from '../components/ClinicalSymptomsForm';
import { NCSTestResult } from './ncs';
import { EMGNerveRecord } from '../components/EMGNeedleAnalysis';

// ========== TIPOS BASE PARA EXTRACCIÓN DE DATOS ==========

export interface ExtractedFileData {
  patient?: {
    name: string;
    id: string;
    age: number | null;
    sex: 'male' | 'female';
  };
  ncsResults?: Array<{
    nerve: string;
    side: 'left' | 'right';
    latency: number;
    amplitude: number;
    velocity: number;
    status: 'normal' | 'abnormal';
    findings?: string[];
  }>;
  emgResults?: Array<{
    muscle: string;
    side: 'left' | 'right';
    insertionalActivity: string;
    spontaneousActivity: any;
    motorUnitPotentials: any;
    recruitmentPattern: string;
  }>;
  symptoms?: {
    weakness?: { present: boolean; severity: string };
    paresthesias?: { present: boolean; severity: string };
    pain?: { present: boolean };
    [key: string]: any;
  };
  specialStudies?: Array<{
    id: string;
    name: string;
    type: string;
    side: 'left' | 'right' | 'bilateral';
    values: any;
    status: 'normal' | 'abnormal';
    findings: string[];
    notes: string;
  }>;
  warnings?: string[];
  quality?: {
    confidence: number;
    sectionsFound: number | string[];
    processingTime: number;
    textLength: number;
    recommendations?: string[];
  };
}

// ========== TIPOS PARA RESULTADOS DE MAPEO ==========

export interface MappingResult<T> {
  data: T;
  success: boolean;
  warnings: string[];
  errors: string[];
  mappingStats: {
    fieldsProcessed: number;
    fieldsMapped: number;
    fieldsSkipped: number;
    confidence: number;
  };
}

export interface SafeExtractionMetadata {
  fieldsProcessed: number;
  fieldsExtracted: number;
  fieldsSkipped: number;
  processingNotes: string[];
  fallbacksUsed: string[];
}

export interface SafeExtractionResult<T> {
  data: T;
  success: boolean;
  confidence: number;
  warnings: string[];
  errors: string[];
  metadata: SafeExtractionMetadata;
}

// ========== TIPOS PARA CONFIGURACIÓN DEL SISTEMA ==========

export interface EnhancedProcessingConfig {
  // Configuración de terminología
  useCustomTerminology?: boolean;
  customTerminologyPath?: string;
  
  // Configuración de regex parser
  enableAdvancedTableParsing?: boolean;
  bilateralTableDetection?: boolean;
  
  // Configuración de detección de secciones
  explicitSectionValidation?: boolean;
  minimumSectionConfidence?: number;
  
  // Configuración de mappers seguros
  allowPartialData?: boolean;
  useDefaultValues?: boolean;
  strictValidation?: boolean;
  
  // Configuración de logging
  enableDetailedLogging?: boolean;
  logLevel?: 'DEBUG' | 'INFO' | 'WARN' | 'ERROR';
  exportLogsOnCompletion?: boolean;
}

// ========== TIPOS PARA RESULTADOS DE PROCESAMIENTO ==========

export interface ProcessingStatistics {
  totalSectionsDetected: number;
  totalTablesProcessed: number;
  totalFieldsExtracted: number;
  averageConfidence: number;
}

export interface ProcessingMetadata {
  fileSize: number;
  processingSteps: string[];
  fallbacksUsed: string[];
  validationResults: any;
}

export interface ProcessingResult {
  success: boolean;
  confidence: number;
  processingTime: number;
  
  // Datos extraídos
  patientData: SafeExtractionResult<any>;
  ncsData: SafeExtractionResult<any[]>;
  emgData: SafeExtractionResult<any[]>;
  specialStudiesData: SafeExtractionResult<any>;
  conclusionsData: SafeExtractionResult<any>;
  
  // Análisis del documento
  documentAnalysis: any;
  sectionAnalysis: any;
  tableAnalysis: any;
  
  // Métricas y estadísticas
  processingStats: ProcessingStatistics;
  
  // Problemas y advertencias
  errors: string[];
  warnings: string[];
  recommendations: string[];
  
  // Metadata
  metadata: ProcessingMetadata;
}

// ========== TIPOS PARA AUTO-FILL ==========

export interface AutoFillData {
  patient: Partial<Patient>;
  symptoms: Partial<ClinicalSymptomsData>;
  ncsResults: NCSTestResult[];
  emgResults: EMGNerveRecord[];
  specialStudies: any[];
  metadata: {
    confidence: number;
    source: string;
    processingTime: number;
    warnings: string[];
  };
}

export interface AutoFillContext {
  mode: boolean;
  sourceFile: string;
  fallbackMode?: boolean;
  confidence: number;
  data: AutoFillData;
}

// ========== TIPOS PARA VALIDACIÓN ==========

export interface ValidationContext {
  allowPartialData: boolean;
  requireMinimumFields: boolean;
  minimumFieldCount: number;
  strictValidation: boolean;
  logMissingFields: boolean;
}

export interface DefaultValueConfig {
  useDefaults: boolean;
  defaultPatient: Partial<Patient>;
  defaultStudyType: 'motor' | 'sensory' | 'mixed';
  defaultSide: 'left' | 'right' | 'bilateral';
  defaultStatus: 'normal' | 'abnormal' | 'unknown';
}

// ========== TIPOS PARA COMPATIBILIDAD CON FileUpload ==========

export interface ExtendedFileConversionResult {
  success: boolean;
  report: any;
  errors: string[];
  warnings: string[];
  processingTime: number;
  extractedData?: ExtractedFileData;
}

// ========== TIPOS PARA LOGGING MÉDICO ==========

export interface MedicalLogEntry {
  timestamp: string;
  level: 'DEBUG' | 'INFO' | 'WARN' | 'ERROR' | 'CRITICAL';
  source: string;
  message: string;
  medicalContext?: {
    studyType?: 'ncs' | 'emg' | 'combined';
    nerveName?: string;
    muscleName?: string;
    parameter?: string;
    side?: 'left' | 'right' | 'bilateral';
  };
  data?: any;
}

export interface OperationMetrics {
  operationId: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  success?: boolean;
  error?: any;
}

// ========== TIPOS PARA TERMINOLOGÍA MÉDICA ==========

export interface TerminologyMatch {
  term: string;
  category: string;
  confidence: number;
  position: number;
  context: string;
}

export interface TerminologyResult {
  matches: TerminologyMatch[];
  bestMatch: TerminologyMatch | null;
  confidence: number;
  categories: string[];
}

// ========== TIPOS PARA ANÁLISIS DE SECCIONES ==========

export interface SectionAnalysis {
  sectionType: string;
  found: boolean;
  confidence: number;
  content: string;
  metadata: {
    startPosition: number;
    endPosition: number;
    keywords: string[];
    explicitMarkers: string[];
  };
}

export interface DocumentAnalysis {
  documentType: 'ncs' | 'emg' | 'combined' | 'unknown';
  sections: SectionAnalysis[];
  summary: {
    totalSections: number;
    sectionsFound: number;
    averageConfidence: number;
    primaryLanguage: 'es' | 'en' | 'mixed';
  };
}

// ========== TIPOS PARA ANÁLISIS DE TABLAS ==========

export interface TableColumn {
  name: string;
  index: number;
  type: 'nerve' | 'muscle' | 'latency' | 'amplitude' | 'velocity' | 'side' | 'other';
  unit?: string;
  side?: 'left' | 'right' | 'bilateral';
}

export interface TableRow {
  nerve?: string;
  muscle?: string;
  side?: 'left' | 'right' | 'bilateral';
  data: { [key: string]: number | string | null };
}

export interface TableParsingResult {
  success: boolean;
  data: TableRow[];
  confidence: number;
  summary: {
    totalRows: number;
    validRows: number;
    columns: TableColumn[];
    tableType: 'bilateral' | 'unilateral' | 'mixed';
  };
  warnings: string[];
  errors: string[];
}

// ========== EXPORTS PARA COMPATIBILIDAD ==========

export type { Patient } from './patient';
export type { ClinicalSymptomsData } from '../components/ClinicalSymptomsForm';
export type { NCSTestResult } from './ncs';
export type { EMGNerveRecord } from '../components/EMGNeedleAnalysis';

// ========== TIPOS PARA WORKFLOWS ==========

export interface WorkflowState {
  currentStep: number;
  totalSteps: number;
  completedSteps: string[];
  data: {
    patient?: Partial<Patient>;
    symptoms?: Partial<ClinicalSymptomsData>;
    ncs?: NCSTestResult[];
    emg?: EMGNerveRecord[];
    specialStudies?: any[];
  };
  autoFillContext?: AutoFillContext;
} 