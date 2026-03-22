import { Patient } from '../types/patient';
import { StudyType } from '../types';
import { PatientStudy, AIAnalysis } from '../types/patientStudy';
import { storageService } from './unifiedStorageService';

/**
 * Guarda un estudio asociado a un paciente
 */
export const savePatientStudy = async (study: PatientStudy): Promise<PatientStudy> => {
  // In a real application, this would save to a database
  mockStudies.push(study);
  return study;
};

/**
 * Obtiene todos los estudios de pacientes
 */
export const getAllPatientStudies = (): PatientStudy[] => {
  return storageService.getAllPatientStudies();
};

/**
 * Actualiza un estudio existente
 */
export const updatePatientStudy = async (study: PatientStudy): Promise<PatientStudy> => {
  const index = mockStudies.findIndex(s => s.id === study.id);
  if (index !== -1) {
    mockStudies[index] = study;
  }
  return study;
};

/**
 * Elimina un estudio
 */
export const deletePatientStudy = (studyId: string): boolean => {
  const allStudies = storageService.getAllPatientStudies();
  const filteredStudies = allStudies.filter(study => study.id !== studyId);
  
  if (filteredStudies.length === allStudies.length) {
    return false;
  }
  
  // Actualizar los estudios usando el servicio unificado
  filteredStudies.forEach(study => {
    storageService.savePatientStudy(
      { id: study.patientId } as Patient,
      study.studyType,
      study.studyData,
      study.observations,
      study.conclusion,
      study.aiAnalysis?.emgAnalysis?.content
    );
  });
  
  return true;
};

/**
 * Añade o actualiza análisis de IA para un estudio existente
 */
export const addAIAnalysisToStudy = async (
  studyId: string, 
  emgAnalysis: string, 
  modelVersion: string = 'gpt-4'
): Promise<PatientStudy | null> => {
  const allStudies = storageService.getAllPatientStudies();
  const studyIndex = allStudies.findIndex(study => study.id === studyId);
  
  if (studyIndex === -1) {
    return null;
  }
  
  const study = allStudies[studyIndex];
  
  return updatePatientStudy(
    {
      ...study,
      aiAnalysis: {
        emgAnalysis: {
          id: crypto.randomUUID(),
          studyId: studyId,
          content: emgAnalysis,
          timestamp: new Date().toISOString(),
          modelVersion: modelVersion
        }
      }
    }
  );
};

// Mock data for demonstration
const mockStudies: PatientStudy[] = [
  {
    id: '1',
    patientId: '1',
    patientName: 'Juan Pérez',
    studyType: 'emg',
    studyData: {
      id: '1',
      type: 'emg',
      date: new Date().toISOString(),
      patientId: '1',
      results: {
        emg: [],
        ncs: []
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    timestamp: new Date().toISOString(),
    observations: '',
    conclusion: '',
    aiAnalysis: undefined
  }
];

export const getPatientStudyById = (id: string): PatientStudy | undefined => {
  return mockStudies.find(study => study.id === id);
}; 