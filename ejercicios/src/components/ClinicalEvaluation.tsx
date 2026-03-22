import React from 'react';
import type { 
  ClinicalEvaluation as ClinicalEvaluationType, 
  NerveData, 
  FWaveData,
  PatientData,
  ReasonForStudy,
  ClinicalFindings,
  NCSData,
  MuscleEvaluation
} from '../types/clinical';
import { ClinicalService } from '../services/clinicalService';
import { muscleDatabase } from '../data/muscleData';
import { diagnosticCategories } from '../data/diagnosticCategories';
import { nerveDatabase } from '../data/nerveData';
import SpecialStudiesForm from './SpecialStudiesForm';
import PhysicalExamForm from './PhysicalExamForm';
import ReportGenerator from './ReportGenerator';
import * as LucideIcons from 'lucide-react';
import { ClinicalEvaluationFormData, ValidationErrors } from '../types/clinicalEvaluation';
import EMGNeedleAnalysis from './EMGNeedleAnalysis';
import InfoLog from './InfoLog';
import { EMGResults, EMGMuscleData, EMGResultsBase, EMGMuscleEvaluation } from '../types/emg';
import { NCSTestResult } from '../types/ncs';
import { LogEntry } from '../types/log';
import PatientDataForm from './PatientDataForm';
import { useNavigate } from 'react-router-dom';
import EvaluationComplete from './EvaluationComplete';
import { Patient, Study } from '../types/unified';
import { storageService } from '../services/unifiedStorageService';
import { getEMGAnalysis, AIAnalysisError } from '../services/emgAIAnalysisService';
import FeedbackMessage from './FeedbackMessage';
import { availableMuscles } from '../types/clinical';
import ResultAnalyzer from './ResultAnalyzer';

interface SelectedNerves {
  motor: string[];
  sensory: string[];
}

interface SelectedSides {
  [key: string]: 'left' | 'right';
}

interface SelectedMuscles {
  [muscleName: string]: {
    left: boolean;
    right: boolean;
  };
}

interface ClinicalEvaluationProps {
  patient: Patient;
  study: Study;
  onComplete: (data: ClinicalEvaluationType) => void;
}

interface ExtendedReasonForStudy extends ReasonForStudy {
  sensory: {
    type: string[];
    distribution: string[];
    severity: 'mild' | 'moderate' | 'severe';
  };
}

interface ExtendedClinicalFindings extends Omit<ClinicalFindings, 'muscleStrength'> {
  muscleStrength: {
    affectedMuscles: Array<Required<MuscleEvaluation>>;
  };
}

interface FormData extends ClinicalEvaluationFormData {
  patientData: PatientData;
  reasonForStudy: ExtendedReasonForStudy;
  clinicalFindings: ExtendedClinicalFindings;
  ncsData: NCSData;
  emgData: Record<string, EMGMuscleEvaluation>;
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
}

const ClinicalEvaluation: React.FC<ClinicalEvaluationProps> = ({ 
  patient, 
  study, 
  onComplete 
}: ClinicalEvaluationProps) => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = React.useState(1);
  const totalSteps = 7;
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState<string | null>(null);
  const [formData, setFormData] = React.useState<FormData>(() => {
    // Inicialización de formData (mantener la lógica original aquí)
    // Este es un placeholder, asegúrate de que la inicialización sea la correcta
    const initialPatientData: PatientData = patient || {
      id: '', firstName: '', lastName: '', age: 0, sex: 'male', weight: 0, height: 0, handDominance: 'right', occupation: '',
      medicalHistory: { diabetes: false, hypothyroidism: false, renalFailure: false, previousSurgeries: [], medications: [], allergies: [] }
    };
    const initialReasonForStudy: ExtendedReasonForStudy = {
        weakness: { present: false, distribution: [], severity: 'mild', progression: '', onset: '', evolution: '', associatedSymptoms: [] },
        paresthesias: { present: false, distribution: [], characteristics: [], duration: '', frequency: '', triggers: [], alleviatingFactors: [] },
        pain: { present: false, type: [], distribution: [], intensity: 0, onset: '', evolution: '', triggers: [], alleviatingFactors: [] },
        sensory: { type: [], distribution: [], severity: 'mild' }
    };
    const initialClinicalFindings: ExtendedClinicalFindings = {
        muscleTone: { status: 'normal', description: '' },
        muscleStrength: { affectedMuscles: [] },
        reflexes: { biceps: 'normal', triceps: 'normal', patellar: 'normal', achilles: 'normal' },
        coordination: { fingerToNose: 'normal', heelToShin: 'normal', rapidAlternatingMovements: 'normal' },
        gait: { pattern: 'normal', description: '' }
    };
    return {
        patientData: initialPatientData,
        reasonForStudy: initialReasonForStudy,
        clinicalFindings: initialClinicalFindings,
        ncsData: { motor: {}, sensory: {}, fWaves: {}, hReflex: { latency: 0, amplitude: 0 }, blinkReflex: { r1: 0, r2: 0 } },
        emgData: {},
        interpretation: { pattern: '', severity: 'mild', chronicity: 'acute', location: '', diagnosis: '' },
        recommendations: { additionalStudies: [], followUp: '', treatment: '' },
        technicalDetails: { electrodes: '', patientPosition: '', roomTemperature: 0, notes: '' },
        // Asegúrate de que todos los campos de ClinicalEvaluationFormData estén aquí
        patientId: patient?.id || '',
        studyId: study?.id || '',
        date: study?.date || new Date().toISOString(),
        examiner: '', // O algún valor inicial
        clinicalHistory: '', // O algún valor inicial
        physicalExamination: '', // O algún valor inicial
        ncsFindings: '', // O algún valor inicial
        emgFindings: '', // O algún valor inicial
        specialStudies: '', // O algún valor inicial
        preliminaryDiagnosis: '', // O algún valor inicial
        emgPattern: '', // O algún valor inicial
        results: { emg: [], ncs: [] } // Asegúrate de que esto coincide con el tipo StudyResults
    };
  });
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [logEntries, setLogEntries] = React.useState<LogEntry[]>([]);
  const [showReport, setShowReport] = React.useState(false); // Asegurarse de que showReport está definido

  // handleChange, saveFormData, addLogEntry, handlePrevStep, handleNextStep, handleSubmit, validateForm, renderStep, etc.
  // Deben mantenerse como en la versión original del archivo, a menos que se especifique un cambio.
  // Placeholder para funciones importantes (asegúrate de que la lógica original se mantenga):
  const handleChange = (e: any) => { /* ... */ };
  const saveFormData = (data: any) => { /* ... */ };
  const addLogEntry = (message: string, type?: string) => { /* ... */ };
  const validateForm = (): boolean => { return true; /* ... */ };
  const renderStep = () => {
    switch (currentStep) {
      case 1: // Datos del Paciente
        return (
          <div className="form-card animate-fadeIn">
            <h3 className="text-lg font-medium text-gray-200 mb-6 flex items-center">
              <LucideIcons.User className="h-5 w-5 text-blue-400 mr-2" />
              Datos del Paciente
            </h3>
            <div className="space-y-6">
              {/* Sección principal de datos del paciente */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-x-6 lg:gap-x-8 gap-y-4">
                <div>
                  <label className="form-label">ID del Paciente</label>
                  <input type="text" name="patientData.id" value={formData.patientData.id} onChange={handleChange} className="form-input" required placeholder="Ej: HC-12345"/>
                </div>
                <div>
                  <label className="form-label">Nombre</label>
                  <input type="text" name="patientData.firstName" value={formData.patientData.firstName} onChange={handleChange} className="form-input" required/>
                </div>
                <div>
                  <label className="form-label">Apellido</label>
                  <input type="text" name="patientData.lastName" value={formData.patientData.lastName} onChange={handleChange} className="form-input" required/>
                </div>
                <div>
                  <label className="form-label">Edad</label>
                  <input type="number" name="patientData.age" value={formData.patientData.age} onChange={handleChange} className="form-input" required/>
                </div>
                <div>
                  <label className="form-label">Sexo</label>
                  <select name="patientData.sex" value={formData.patientData.sex} onChange={handleChange} className="form-select" required>
                    <option value="male">Masculino</option>
                    <option value="female">Femenino</option>
                    <option value="other">Otro</option>
                  </select>
                </div>
                <div>
                  <label className="form-label">Peso (kg)</label>
                  <input type="number" name="patientData.weight" value={formData.patientData.weight} onChange={handleChange} className="form-input" required/>
                </div>
                <div>
                  <label className="form-label">Estatura (cm)</label>
                  <input type="number" name="patientData.height" value={formData.patientData.height} onChange={handleChange} className="form-input" required/>
                </div>
                <div className="sm:col-span-2 lg:col-span-1 xl:col-span-1 2xl:col-span-1">
                  <label className="form-label">Dominancia Manual</label>
                  <select name="patientData.handDominance" value={formData.patientData.handDominance} onChange={handleChange} className="form-select" required>
                    <option value="right">Diestro</option>
                    <option value="left">Zurdo</option>
                    <option value="ambidextrous">Ambidextro</option>
                  </select>
                </div>
                <div className="sm:col-span-2 lg:col-span-2 xl:col-span-3 2xl:col-span-4">
                  <label className="form-label">Ocupación</label>
                  <input type="text" name="patientData.occupation" value={formData.patientData.occupation} onChange={handleChange} className="form-input" required/>
                </div>
              </div>

              {/* Antecedentes Médicos */}
              <div>
                <h4 className="text-md font-medium text-gray-300 mt-6 mb-3">Antecedentes Médicos</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-x-6 lg:gap-x-8 gap-y-3">
                  <label className="flex items-center space-x-2 py-1">
                    <input type="checkbox" name="patientData.medicalHistory.diabetes" checked={formData.patientData.medicalHistory.diabetes} onChange={handleChange} className="form-checkbox"/>
                    <span className="text-gray-200">Diabetes</span>
                  </label>
                  <label className="flex items-center space-x-2 py-1">
                    <input type="checkbox" name="patientData.medicalHistory.hypothyroidism" checked={formData.patientData.medicalHistory.hypothyroidism} onChange={handleChange} className="form-checkbox"/>
                    <span className="text-gray-200">Hipotiroidismo</span>
                  </label>
                  <label className="flex items-center space-x-2 py-1">
                    <input type="checkbox" name="patientData.medicalHistory.renalFailure" checked={formData.patientData.medicalHistory.renalFailure} onChange={handleChange} className="form-checkbox"/>
                    <span className="text-gray-200">Insuf. Renal</span>
                  </label>
                  {/* Añadir más antecedentes aquí si es necesario */}
                </div>
              </div>
            </div>
          </div>
        );

      case 2: // Datos del Estudio
        return (
          <div className="form-card animate-fadeIn">
            <h3 className="text-lg font-medium text-gray-200 mb-6 flex items-center">
              <LucideIcons.Brain className="h-5 w-5 text-blue-400 mr-2" />
              Datos del Estudio
            </h3>
            <div className="space-y-8">
              {/* Sección principal de datos del estudio */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-4">
                <div>
                  <label className="form-label">Tipo de Estudio</label>
                  <select name="reasonForStudy.type" value={formData.reasonForStudy.type} onChange={handleChange} className="form-select" required>
                    <option value="EMG">EMG</option>
                    <option value="NCV">NCV</option>
                    <option value="Electrodiagnóstico">Electrodiagnóstico</option>
                  </select>
                </div>
                <div>
                  <label className="form-label">Motivo del Estudio</label>
                  <input type="text" name="reasonForStudy.motivo" value={formData.reasonForStudy.motivo} onChange={handleChange} className="form-input" required/>
                </div>
                <div>
                  <label className="form-label">Fecha del Estudio</label>
                  <input type="date" name="date" value={formData.date} onChange={handleChange} className="form-input" required/>
                </div>
                <div>
                  <label className="form-label">Examinador</label>
                  <input type="text" name="examiner" value={formData.examiner} onChange={handleChange} className="form-input" required/>
                </div>
                <div>
                  <label className="form-label">Historia Clínica</label>
                  <textarea name="clinicalHistory" value={formData.clinicalHistory} onChange={handleChange} className="form-input" rows={2} placeholder="Describa la historia clínica del paciente..."/>
                </div>
                <div>
                  <label className="form-label">Examen Físico</label>
                  <textarea name="physicalExamination" value={formData.physicalExamination} onChange={handleChange} className="form-input" rows={2} placeholder="Describa el examen físico realizado..."/>
                </div>
              </div>

              {/* Sección de datos del estudio */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-4">
                <div>
                  <label className="form-label">NCS</label>
                  <input type="text" name="ncsData.motor" value={formData.ncsData.motor} onChange={handleChange} className="form-input" required/>
                </div>
                <div>
                  <label className="form-label">Sensory</label>
                  <input type="text" name="ncsData.sensory" value={formData.ncsData.sensory} onChange={handleChange} className="form-input" required/>
                </div>
                <div>
                  <label className="form-label">FWaves</label>
                  <input type="text" name="ncsData.fWaves" value={formData.ncsData.fWaves} onChange={handleChange} className="form-input" required/>
                </div>
                <div>
                  <label className="form-label">hReflex</label>
                  <input type="text" name="ncsData.hReflex" value={formData.ncsData.hReflex} onChange={handleChange} className="form-input" required/>
                </div>
                <div>
                  <label className="form-label">BlinkReflex</label>
                  <input type="text" name="ncsData.blinkReflex" value={formData.ncsData.blinkReflex} onChange={handleChange} className="form-input" required/>
                </div>
              </div>
            </div>
          </div>
        );

      case 3: // Examen Físico
        return (
          <div className="form-card animate-fadeIn">
            <h3 className="text-lg font-medium text-gray-200 mb-6 flex items-center">
              <LucideIcons.Brain className="h-5 w-5 text-blue-400 mr-2" />
              Examen Físico
            </h3>
            <div className="space-y-8">
              {/* Tono Muscular */}
              <div className="form-section">
                <h4 className="text-md font-medium text-gray-300 mb-3">Tono Muscular</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-x-6 gap-y-4">
                  <div>
                    <label className="form-label">Estado</label>
                    <select name="clinicalFindings.muscleTone.status" value={formData.clinicalFindings.muscleTone.status} onChange={handleChange} className="form-select">
                      <option value="normal">Normal</option>
                      <option value="increased">Aumentado</option>
                      <option value="decreased">Disminuido</option>
                    </select>
                  </div>
                  <div className="md:col-span-1 xl:col-span-2"> {/* Permitir que la descripción tome más espacio */}
                    <label className="form-label">Descripción (Tono Muscular)</label>
                    <textarea name="clinicalFindings.muscleTone.description" value={formData.clinicalFindings.muscleTone.description} onChange={handleChange} className="form-input" rows={2} placeholder="Describa características del tono muscular..."/>
                  </div>
                </div>
              </div>

              {/* Fuerza Muscular (Esta sección es más compleja y podría necesitar su propio componente o un manejo cuidadoso del grid) */}
              <div className="form-section">
                <h4 className="text-md font-medium text-gray-300 mb-3">Fuerza Muscular (MRC)</h4>
                {/* Aquí la lógica para añadir/editar músculos afectados. El grid dependerá de cómo se listen */}
                {/* Ejemplo: <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4"> ... </div> */}
                <p className="text-sm text-gray-400">A definir cómo se mostrarán los músculos afectados y sus grados MRC. Podría ser una tabla o tarjetas individuales.</p>
              </div>

              {/* Reflejos */}
              <div className="form-section">
                <h4 className="text-md font-medium text-gray-300 mb-3">Reflejos</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 gap-x-6 gap-y-4">
                  {/* Ejemplo para un reflejo */}
                  <div>
                    <label className="form-label">Bicipital</label>
                    <select name="clinicalFindings.reflexes.biceps" value={formData.clinicalFindings.reflexes.biceps} onChange={handleChange} className="form-select">
                      <option value="normal">Normal</option>
                      <option value="increased">Aumentado</option>
                      <option value="decreased">Disminuido</option>
                      <option value="absent">Ausente</option>
                    </select>
                  </div>
                  {/* Repetir para otros reflejos: Tricipital, Patelar, Aquíleo */}
                  <div><label className="form-label">Tricipital</label><select name="clinicalFindings.reflexes.triceps" value={formData.clinicalFindings.reflexes.triceps} onChange={handleChange} className="form-select"><option value="normal">Normal</option><option value="increased">Aumentado</option><option value="decreased">Disminuido</option><option value="absent">Ausente</option></select></div>
                  <div><label className="form-label">Patelar</label><select name="clinicalFindings.reflexes.patellar" value={formData.clinicalFindings.reflexes.patellar} onChange={handleChange} className="form-select"><option value="normal">Normal</option><option value="increased">Aumentado</option><option value="decreased">Disminuido</option><option value="absent">Ausente</option></select></div>
                  <div><label className="form-label">Aquíleo</label><select name="clinicalFindings.reflexes.achilles" value={formData.clinicalFindings.reflexes.achilles} onChange={handleChange} className="form-select"><option value="normal">Normal</option><option value="increased">Aumentado</option><option value="decreased">Disminuido</option><option value="absent">Ausente</option></select></div>
                </div>
              </div>

              {/* Coordinación */}
              <div className="form-section">
                <h4 className="text-md font-medium text-gray-300 mb-3">Coordinación</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4">
                  <div>
                    <label className="form-label">Dedo-Nariz</label>
                    <select name="clinicalFindings.coordination.fingerToNose" value={formData.clinicalFindings.coordination.fingerToNose} onChange={handleChange} className="form-select">
                      <option value="normal">Normal</option><option value="abnormal">Anormal</option></select>
                  </div>
                  <div>
                    <label className="form-label">Talón-Rodilla</label>
                    <select name="clinicalFindings.coordination.heelToShin" value={formData.clinicalFindings.coordination.heelToShin} onChange={handleChange} className="form-select">
                      <option value="normal">Normal</option><option value="abnormal">Anormal</option></select>
                  </div>
                  <div className="sm:col-span-2 lg:col-span-1"> {/* Ajuste para que ocupe el espacio restante o se alinee bien en 3 columnas */}
                    <label className="form-label">Mov. Alternantes Rápidos</label>
                    <select name="clinicalFindings.coordination.rapidAlternatingMovements" value={formData.clinicalFindings.coordination.rapidAlternatingMovements} onChange={handleChange} className="form-select">
                      <option value="normal">Normal</option><option value="abnormal">Anormal</option></select>
                  </div>
                </div>
              </div>

              {/* Marcha */}
              <div className="form-section">
                <h4 className="text-md font-medium text-gray-300 mb-3">Marcha</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-x-6 gap-y-4">
                  <div>
                    <label className="form-label">Patrón</label>
                    <select name="clinicalFindings.gait.pattern" value={formData.clinicalFindings.gait.pattern} onChange={handleChange} className="form-select">
                      <option value="normal">Normal</option><option value="abnormal">Anormal</option></select>
                  </div>
                  <div className="md:col-span-1 xl:col-span-2"> {/* Permitir que la descripción tome más espacio */}
                    <label className="form-label">Descripción (Marcha)</label>
                    <textarea name="clinicalFindings.gait.description" value={formData.clinicalFindings.gait.description} onChange={handleChange} className="form-input" rows={2} placeholder="Describa características de la marcha..."/>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 4: // Electromiografía
        return (
          <div className="form-card animate-fadeIn">
            <h3 className="text-lg font-medium text-gray-200 mb-6 flex items-center">
              <LucideIcons.Brain className="h-5 w-5 text-blue-400 mr-2" />
              Electromiografía
            </h3>
            <div className="space-y-8">
              {/* Sección principal de datos de la EMG */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-4">
                <div>
                  <label className="form-label">Electrodos</label>
                  <input type="text" name="technicalDetails.electrodes" value={formData.technicalDetails.electrodes} onChange={handleChange} className="form-input" required/>
                </div>
                <div>
                  <label className="form-label">Posición del Paciente</label>
                  <input type="text" name="technicalDetails.patientPosition" value={formData.technicalDetails.patientPosition} onChange={handleChange} className="form-input" required/>
                </div>
                <div>
                  <label className="form-label">Temperatura del Ambiente</label>
                  <input type="number" name="technicalDetails.roomTemperature" value={formData.technicalDetails.roomTemperature} onChange={handleChange} className="form-input" required/>
                </div>
                <div>
                  <label className="form-label">Notas</label>
                  <textarea name="technicalDetails.notes" value={formData.technicalDetails.notes} onChange={handleChange} className="form-input" rows={2} placeholder="Describa notas adicionales..."/>
                </div>
              </div>

              {/* Sección de datos de la EMG */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-4">
                <div>
                  <label className="form-label">Músculos Explorados</label>
                  <select 
                    name="emgData.selectedMuscles"
                    value={formData.emgData.selectedMuscles || []}
                    onChange={handleChange} 
                    className="form-select" 
                    required 
                    multiple
                  >
                    {availableMuscles.map((muscle) => (
                      <option key={muscle.id} value={muscle.id}>{muscle.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="form-label">Resultados EMG</label>
                  <input type="text" name="emgData" value={formData.emgData} onChange={handleChange} className="form-input" required/>
                </div>
                <div>
                  <label className="form-label">Interpretación</label>
                  <input type="text" name="interpretation.pattern" value={formData.interpretation.pattern} onChange={handleChange} className="form-input" required/>
                </div>
                <div>
                  <label className="form-label">Severidad</label>
                  <select name="interpretation.severity" value={formData.interpretation.severity} onChange={handleChange} className="form-select" required>
                    <option value="mild">Leve</option>
                    <option value="moderate">Moderada</option>
                    <option value="severe">Severa</option>
                  </select>
                </div>
                <div>
                  <label className="form-label">Crónica</label>
                  <select name="interpretation.chronicity" value={formData.interpretation.chronicity} onChange={handleChange} className="form-select" required>
                    <option value="acute">Aguda</option>
                    <option value="subacute">Subaguda</option>
                    <option value="chronic">Crónica</option>
                  </select>
                </div>
                <div>
                  <label className="form-label">Localización</label>
                  <input type="text" name="interpretation.location" value={formData.interpretation.location} onChange={handleChange} className="form-input" required/>
                </div>
                <div>
                  <label className="form-label">Diagnóstico</label>
                  <input type="text" name="interpretation.diagnosis" value={formData.interpretation.diagnosis} onChange={handleChange} className="form-input" required/>
                </div>
              </div>
            </div>
          </div>
        );

      case 5: // Neuroconducción
        return (
          <div className="form-card animate-fadeIn">
            <h3 className="text-lg font-medium text-gray-200 mb-6 flex items-center">
              <LucideIcons.Thermometer className="h-5 w-5 text-blue-400 mr-2" />
              Neuroconducción
            </h3>
            <div className="space-y-8">
              {/* Sección principal de datos de la Neuroconducción */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-4">
                <div>
                  <label className="form-label">Latencia</label>
                  <input type="text" name="ncsData.hReflex.latency" value={formData.ncsData.hReflex.latency} onChange={handleChange} className="form-input" required/>
                </div>
                <div>
                  <label className="form-label">Amplitud</label>
                  <input type="text" name="ncsData.hReflex.amplitude" value={formData.ncsData.hReflex.amplitude} onChange={handleChange} className="form-input" required/>
                </div>
                <div>
                  <label className="form-label">Velocidad</label>
                  <input type="text" name="ncsData.hReflex.velocity" value={formData.ncsData.hReflex.velocity} onChange={handleChange} className="form-input" required/>
                </div>
                <div>
                  <label className="form-label">Resultados NCS</label>
                  <input type="text" name="results.ncs" value={formData.results.ncs} onChange={handleChange} className="form-input" required/>
                </div>
              </div>

              {/* Sección de datos de la Neuroconducción */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-4">
                <div>
                  <label className="form-label">Sensory</label>
                  <input type="text" name="ncsData.sensory" value={formData.ncsData.sensory} onChange={handleChange} className="form-input" required/>
                </div>
                <div>
                  <label className="form-label">FWaves</label>
                  <input type="text" name="ncsData.fWaves" value={formData.ncsData.fWaves} onChange={handleChange} className="form-input" required/>
                </div>
                <div>
                  <label className="form-label">BlinkReflex</label>
                  <input type="text" name="ncsData.blinkReflex" value={formData.ncsData.blinkReflex} onChange={handleChange} className="form-input" required/>
                </div>
                <div>
                  <label className="form-label">Resultados EMG</label>
                  <input type="text" name="results.emg" value={formData.results.emg} onChange={handleChange} className="form-input" required/>
                </div>
              </div>
            </div>
          </div>
        );

      case 6: // Resultados
        return (
          <div className="form-card animate-fadeIn">
            <h3 className="text-lg font-medium text-gray-200 mb-6 flex items-center">
              <LucideIcons.ClipboardList className="h-5 w-5 text-blue-400 mr-2" />
              Resultados
            </h3>
            <div className="space-y-8">
              {/* Sección principal de resultados */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-4">
                <div>
                  <label className="form-label">Diagnóstico Preliminar</label>
                  <input type="text" name="preliminaryDiagnosis" value={formData.preliminaryDiagnosis} onChange={handleChange} className="form-input" required/>
                </div>
                <div>
                  <label className="form-label">EMG Pattern</label>
                  <input type="text" name="emgPattern" value={formData.emgPattern} onChange={handleChange} className="form-input" required/>
                </div>
                <div>
                  <label className="form-label">Resultados EMG</label>
                  <input type="text" name="results.emg" value={formData.results.emg} onChange={handleChange} className="form-input" required/>
                </div>
                <div>
                  <label className="form-label">Resultados NCS</label>
                  <input type="text" name="results.ncs" value={formData.results.ncs} onChange={handleChange} className="form-input" required/>
                </div>
              </div>

              {/* Sección de recomendaciones */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-4">
                <div>
                  <label className="form-label">Estudios Adicionales</label>
                  <input type="text" name="recommendations.additionalStudies" value={formData.recommendations.additionalStudies} onChange={handleChange} className="form-input" required/>
                </div>
                <div>
                  <label className="form-label">Seguimiento</label>
                  <input type="text" name="recommendations.followUp" value={formData.recommendations.followUp} onChange={handleChange} className="form-input" required/>
                </div>
                <div>
                  <label className="form-label">Tratamiento</label>
                  <input type="text" name="recommendations.treatment" value={formData.recommendations.treatment} onChange={handleChange} className="form-input" required/>
                </div>
              </div>
            </div>
          </div>
        );

      case 7: // Evaluación Completa
        return (
          <div className="form-card animate-fadeIn">
            <h3 className="text-lg font-medium text-gray-200 mb-6 flex items-center">
              <LucideIcons.Save className="h-5 w-5 text-blue-400 mr-2" />
              Evaluación Completa
            </h3>
            <div className="space-y-8">
              {/* Sección principal de evaluación completa */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-4">
                <div>
                  <label className="form-label">Diagnóstico Final</label>
                  <input type="text" name="preliminaryDiagnosis" value={formData.preliminaryDiagnosis} onChange={handleChange} className="form-input" required/>
                </div>
                <div>
                  <label className="form-label">EMG Pattern</label>
                  <input type="text" name="emgPattern" value={formData.emgPattern} onChange={handleChange} className="form-input" required/>
                </div>
                <div>
                  <label className="form-label">Resultados EMG</label>
                  <input type="text" name="results.emg" value={formData.results.emg} onChange={handleChange} className="form-input" required/>
                </div>
                <div>
                  <label className="form-label">Resultados NCS</label>
                  <input type="text" name="results.ncs" value={formData.results.ncs} onChange={handleChange} className="form-input" required/>
                </div>
              </div>

              {/* Sección de recomendaciones */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-4">
                <div>
                  <label className="form-label">Estudios Adicionales</label>
                  <input type="text" name="recommendations.additionalStudies" value={formData.recommendations.additionalStudies} onChange={handleChange} className="form-input" required/>
                </div>
                <div>
                  <label className="form-label">Seguimiento</label>
                  <input type="text" name="recommendations.followUp" value={formData.recommendations.followUp} onChange={handleChange} className="form-input" required/>
                </div>
                <div>
                  <label className="form-label">Tratamiento</label>
                  <input type="text" name="recommendations.treatment" value={formData.recommendations.treatment} onChange={handleChange} className="form-input" required/>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => { e.preventDefault(); setIsSubmitting(true); /* ... */ setIsSubmitting(false); }; 
  const handlePrevStep = () => { if (currentStep > 1) setCurrentStep(currentStep - 1); };
  const handleNextStep = () => { if (currentStep < totalSteps) setCurrentStep(currentStep + 1); };

  // useEffect para addLogEntry y saveFormData
  React.useEffect(() => {
    addLogEntry('Inicio de evaluación clínica', 'info');
  }, []);

  React.useEffect(() => {
    saveFormData(formData);
  }, [formData]);
  
  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-100">Evaluación Clínica</h2>
          <div className="text-gray-400">
            <p>Paciente: {formData.patientData.firstName} {formData.patientData.lastName}</p>
            <p className="text-sm">ID: {formData.patientData.id || 'N/A'}</p>
          </div>
        </div>

        <div className="mt-4 flex space-x-1">
          {[1, 2, 3, 4, 5, 6, 7].map((step) => (
            <div
              key={step}
              className={`flex-1 h-1 rounded-full ${
                step <= currentStep ? 'bg-blue-500' : 'bg-gray-700'
              }`}
            />
          ))}
        </div>
      </div>

      {error && (
        <FeedbackMessage type="error" message={error} onClose={() => setError(null)} className="mb-6" />
      )}
      {success && (
        <FeedbackMessage type="success" message={success} onClose={() => setSuccess(null)} className="mb-6" />
      )}

      <form onSubmit={handleSubmit}>
        {renderStep()}

        <div className="mt-8 flex justify-between">
          {currentStep > 1 && (
            <button
              type="button"
              onClick={handlePrevStep}
              disabled={isSubmitting}
              className="btn btn-secondary"
            >
              Anterior
            </button>
          )}
          {currentStep < totalSteps ? (
            <button
              type="button"
              onClick={handleNextStep}
              disabled={isSubmitting}
              className="btn btn-primary"
            >
              Siguiente
            </button>
          ) : (
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn btn-primary bg-green-600 hover:bg-green-500 focus:ring-green-400"
            >
              {isSubmitting ? 'Enviando...' : 'Finalizar y Guardar Evaluación'}
            </button>
          )}
        </div>
      </form>
      
      {showReport && formData && (
        <div className="mt-8">
          <ReportGenerator data={formData} />
        </div>
      )}
      
      <InfoLog entries={logEntries} />
    </div>
  );
};

export default ClinicalEvaluation;