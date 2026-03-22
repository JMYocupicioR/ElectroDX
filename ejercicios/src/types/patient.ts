export interface MedicalHistory {
  previousDiseases: string[];
  surgeries: string[];
  currentMedications: string[];
  allergies: string[];
  familyHistory?: string;
}

export interface ContactInfo {
  phone: string;
  email?: string;
  address?: string;
}

export type Sex = 'male' | 'female' | 'other';

export interface Patient {
  id: string;
  patientId?: string; // ID externo del hospital o clínica
  firstName: string;
  lastName: string;
  dateOfBirth: string; // Formato ISO: YYYY-MM-DD
  sex: Sex;
  contact: ContactInfo;
  medicalHistory: MedicalHistory;
  mainDiagnosis?: string;
  consultReason?: string;
  additionalNotes?: string;
  createdAt: string; // Fecha de creación del registro
  updatedAt: string; // Fecha de última actualización
}

// Estado vacío para inicializar el formulario
export const emptyPatient: Patient = {
  id: '',
  firstName: '',
  lastName: '',
  dateOfBirth: '',
  sex: 'male',
  contact: {
    phone: '',
    email: '',
    address: '',
  },
  medicalHistory: {
    previousDiseases: [],
    surgeries: [],
    currentMedications: [],
    allergies: [],
    familyHistory: '',
  },
  mainDiagnosis: '',
  consultReason: '',
  additionalNotes: '',
  createdAt: '',
  updatedAt: '',
};

// Lista de enfermedades neuromusculares comunes para autocompletado
export const commonNeuromusculardiseases: string[] = [
  // Neuropatías periféricas
  'Neuropatía diabética',
  'Neuropatía alcohólica',
  'Neuropatía por deficiencia de vitamina B12',
  'Polineuropatía desmielinizante inflamatoria crónica (CIDP)',
  'Síndrome de Guillain-Barré',
  'Neuropatía hereditaria sensitivo-motora (Charcot-Marie-Tooth)',
  'Neuropatía por quimioterapia',
  'Neuropatía urémica',
  'Neuropatía tiroidea',
  'Neuropatía paraneoplásica',
  
  // Síndromes de atrapamiento
  'Síndrome del túnel carpiano',
  'Síndrome del túnel cubital',
  'Síndrome del túnel tarsiano',
  'Síndrome del desfiladero torácico',
  'Parálisis del nervio radial',
  'Parálisis del nervio peroneo',
  'Meralgia parestésica',
  
  // Radiculopatías
  'Radiculopatía cervical C5-C6',
  'Radiculopatía cervical C6-C7',
  'Radiculopatía lumbar L4-L5',
  'Radiculopatía lumbar L5-S1',
  'Estenosis espinal',
  'Hernia discal cervical',
  'Hernia discal lumbar',
  
  // Miopatías
  'Distrofia muscular de Duchenne',
  'Distrofia muscular de Becker',
  'Distrofia muscular facioescapulohumeral',
  'Miopatía inflamatoria (polimiositis)',
  'Dermatomiositis',
  'Miositis por cuerpos de inclusión',
  'Miopatía mitocondrial',
  'Miopatía metabólica',
  'Miopatía por estatinas',
  'Miopatía tiroidea',
  'Miopatía alcohólica',
  
  // Enfermedades de la unión neuromuscular
  'Miastenia gravis',
  'Síndrome miasténico de Lambert-Eaton',
  'Botulismo',
  'Miastenia congénita',
  
  // Enfermedades de motoneurona
  'Esclerosis lateral amiotrófica (ELA)',
  'Atrofia muscular espinal',
  'Parálisis bulbar progresiva',
  'Esclerosis lateral primaria',
  'Atrofia muscular progresiva',
  
  // Plexopatías
  'Plexopatía braquial',
  'Plexopatía lumbosacra',
  'Síndrome de Parsonage-Turner',
  'Plexopatía diabética',
  'Plexopatía post-radiación',
  
  // Enfermedades sistémicas con compromiso neuromuscular
  'Diabetes mellitus',
  'Hipotiroidismo',
  'Hipertiroidismo',
  'Insuficiencia renal crónica',
  'Enfermedad hepática crónica',
  'Artritis reumatoide',
  'Lupus eritematoso sistémico',
  'Síndrome de Sjögren',
  'Sarcoidosis',
  'Amiloidosis',
  
  // Trastornos del movimiento con componente neuromuscular
  'Enfermedad de Parkinson',
  'Temblor esencial',
  'Distonía',
  'Corea de Huntington',
  
  // Otros
  'Fibromialgia',
  'Síndrome de fatiga crónica',
  'Calambres musculares benignos',
  'Fasciculaciones benignas',
  'Síndrome de piernas inquietas',
  'Síndrome del túnel del carpo',
  'Lesión del plexo braquial',
  'Mononeuropatía múltiple',
  'Neuropatía de fibras pequeñas'
]; 