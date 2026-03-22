import { Patient } from '../types/patient';
import { storageService } from './unifiedStorageService';

/**
 * Almacena temporalmente un paciente en localStorage
 */
export const saveTemporaryPatient = (patient: Partial<Patient>): void => {
  storageService.saveTemporaryPatient(patient);
};

/**
 * Obtiene el paciente temporal
 */
export const getTemporaryPatient = (): Partial<Patient> | null => {
  return storageService.getTemporaryPatient();
};

/**
 * Limpia el paciente temporal
 */
export const clearTemporaryPatient = (): void => {
  storageService.clearTemporaryPatient();
};

/**
 * Guarda un paciente de forma permanente
 */
export const savePatient = async (patient: Patient): Promise<Patient> => {
  return storageService.savePatient(patient);
};

/**
 * Obtiene todos los pacientes
 */
export const getAllPatients = (): Patient[] => {
  return storageService.getAllPatients();
};

// Mock data for demonstration
const mockPatients: Patient[] = [
  {
    id: '1',
    firstName: 'Juan',
    lastName: 'Pérez',
    dateOfBirth: '1978-01-01',
    sex: 'male',
    contact: {
      phone: '1234567890',
      email: 'juan.perez@example.com',
      address: 'Calle Principal 123'
    },
    medicalHistory: {
      previousDiseases: [],
      surgeries: [],
      currentMedications: [],
      allergies: [],
      familyHistory: ''
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

export const getPatientById = (id: string): Patient | undefined => {
  return mockPatients.find(patient => patient.id === id);
}; 