// src/components/ResultAnalyzer.tsx
import React from 'react';
import { 
  Activity, 
  FileText, 
  Brain, 
  RefreshCw, 
  Download, 
  Save, 
  AlertTriangle,
  ArrowLeft,
  Check,
  Edit2,
  Eye,
  CheckCircle,
  TrendingUp,
  Shield
} from 'lucide-react';
import { Study, PatientStudy } from '../types/unified';
import { Patient } from '../types/patient';
import { analyzeNerveConduction } from '../utils/analysis';
import { getPatientById } from '../services/patientService';
import { savePatientStudy, getPatientStudyById, updatePatientStudy } from '../services/patientStudyService';
import { ClinicalEvaluationFormData } from '../types/clinicalEvaluation';
import { 
  EMGResults, 
  EMGResultsBase, 
  EMGDisplayData, 
  EMGMuscleData, 
  isEMGDisplayData, 
  isEMGResultsBase,
  convertToUnifiedEMGResults,
  UnifiedEMGResults 
} from '../types/emg';
import { EMGResults as EMGResultsClinical } from '../types/clinical';
import { NCSTestResult } from '../types/ncs';
import { diagnosticPatterns } from '../data/diagnosticPatterns';
import { diagnosticCategories } from '../data/diagnosticCategories';
import { EMGPatternAnalyzer } from '../utils/emgPatternAnalyzer';
import { NCSTest } from '../types/diagnostic';
import { Study as StudyBase } from '../types/study';
import DiagnosticSelector from './DiagnosticSelector';
import NerveValuesTable from './NerveValuesTable';
import { nerveDatabase } from '../data/nerveData';
import { PatternCrossValidationService, PatternConflict, CrossValidationResult } from '../services/patternCrossValidationService';

// 🔥 INTERFACES MEJORADAS - Incluye evidencia detallada
interface DiagnosticPattern {
  id: string;
  name: string;
  description: string;
  score: number;
  confidence: number;
  matchingCriteria: Array<{
    description: string;
    value?: string | number; // Para mostrar valores específicos como "2.1 mV"
    isMet: boolean;
    category?: 'ncs' | 'emg' | 'clinical'; // Categoriza la evidencia
  }>;
  supportingEvidence: string[];
}

interface EMGPattern {
  name: string;
  score: number;
  confidence?: number; // Añadido para compatibilidad
  criteria: Array<{
    description: string;
    matched: boolean;
  }>;
}

interface ResultAnalyzerProps {
  formData: ClinicalEvaluationFormData;
  emgResults: EMGResultsBase | null;
  ncsResults: NCSTestResult[];
  studyData: Study;
  initialDiagnosis: string;
  patientInfo: Patient;
  patientId?: string;
  studyId?: string;
  onSaveComplete?: () => void;
  onBack?: () => void;
  onStudyDataLoaded?: (studyData: Study) => void;
}

const ResultAnalyzer: React.FC<ResultAnalyzerProps> = ({
  formData,
  emgResults,
  ncsResults,
  studyData,
  initialDiagnosis = '',
  patientInfo,
  patientId,
  studyId,
  onSaveComplete,
  onBack,
  onStudyDataLoaded,
}: ResultAnalyzerProps) => {
  console.log('Props recibidos:', {
    formData,
    emgResults,
    ncsResults,
    studyData,
    initialDiagnosis,
    patientInfo,
    patientId,
    studyId
  });

  // Estados del componente
  const [patient, setPatient] = React.useState<Patient | null>(null);
  const [diagnosticResults, setDiagnosticResults] = React.useState<any>(null);
  const [reportContent, setReportContent] = React.useState<string>('');
  const [observations, setObservations] = React.useState<string>('');
  const [conclusion, setConclusion] = React.useState<string>('');
  const [aiAnalysis, setAiAnalysis] = React.useState<string>('');
  const [showAiPanel, setShowAiPanel] = React.useState<boolean>(false);
  const [isSaving, setIsSaving] = React.useState<boolean>(false);
  const [saveSuccess, setSaveSuccess] = React.useState<boolean>(false);
  const [saveError, setSaveError] = React.useState<string | null>(null);
  const [existingStudy, setExistingStudy] = React.useState<PatientStudy | null>(null);
  const [reportMode, setReportMode] = React.useState<'edit' | 'view'>('view');
  const [emgAnalysis, setEmgAnalysis] = React.useState<any>(null);
  const [localStudyData, setLocalStudyData] = React.useState<Study | null>(null);
  const [isLoading, setIsLoading] = React.useState<boolean>(true);
  const [error, setError] = React.useState<string | null>(null);
  const [emgDisplayData, setEmgDisplayData] = React.useState<Record<string, EMGDisplayData>>({});
  const [emgPatterns, setEmgPatterns] = React.useState<EMGPattern[]>([]);
  const [topPatterns, setTopPatterns] = React.useState<DiagnosticPattern[]>([]);
  const [selectedDiagnosis, setSelectedDiagnosis] = React.useState<string>('');
  
  // 🔥 NUEVO ESTADO - Para validación cruzada de patrones
  const [consistencyConflicts, setConsistencyConflicts] = React.useState<PatternConflict[]>([]);
  const [crossValidationResult, setCrossValidationResult] = React.useState<CrossValidationResult | null>(null);

  // Cargar datos del paciente y estudio existente si se proporcionan IDs
  React.useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      setError(null);
      console.log('=== INICIO DE CARGA DE DATOS ===');
      console.log('Datos de entrada:', { patientId, studyId, studyData });
      
      try {
        let studyDataLoaded = false;
        let loadedStudyData: Study | null = null;

        // Cargar datos del paciente
        if (patientId) {
          console.log('Cargando datos del paciente con ID:', patientId);
          const patientData = getPatientById(patientId);
          console.log('Datos del paciente cargados:', patientData);
          if (patientData) {
            setPatient(patientData);
          } else {
            console.warn('No se encontraron datos del paciente para el ID:', patientId);
          }
        }

        // Cargar estudio existente
        if (studyId) {
          console.log('Cargando estudio con ID:', studyId);
          const study = getPatientStudyById(studyId);
          console.log('Datos del estudio cargados:', study);
          if (study) {
            setExistingStudy(study);
            setObservations(study.observations || '');
            setConclusion(study.conclusion || '');
            if (study.studyData) {
              console.log('Estableciendo datos del estudio:', study.studyData);
              loadedStudyData = study.studyData;
              studyDataLoaded = true;
            } else {
              console.warn('El estudio no contiene datos:', study);
            }
          } else {
            console.warn('No se encontró el estudio con ID:', studyId);
          }
        }

        // Si hay datos del estudio en los props, usarlos
        if (studyData) {
          console.log('Usando datos del estudio de los props:', studyData);
          loadedStudyData = studyData;
          studyDataLoaded = true;
        }

        // Verificar si se cargaron datos del estudio
        if (!studyDataLoaded) {
          const errorMsg = 'No hay datos del estudio disponibles. Por favor, proporcione un ID de estudio válido o datos del estudio.';
          console.error(errorMsg);
          setError(errorMsg);
        } else if (loadedStudyData) {
          setLocalStudyData(loadedStudyData);
          if (onStudyDataLoaded) {
            onStudyDataLoaded(loadedStudyData);
          }
          console.log('Datos del estudio cargados exitosamente:', loadedStudyData);
        }
      } catch (error) {
        const errorMsg = 'Error al cargar los datos del estudio. Por favor, intente nuevamente.';
        console.error(errorMsg, error);
        setError(errorMsg);
      } finally {
        setIsLoading(false);
        console.log('=== FIN DE CARGA DE DATOS ===');
      }
    };

    loadData();
  }, [patientId, studyId, studyData, onStudyDataLoaded]);

  // Analizar datos para diagnóstico cuando cambien los datos del estudio
  React.useEffect(() => {
    if (isLoading || error) {
      console.log('Análisis omitido:', { isLoading, error });
      return;
    }

    console.log('=== INICIO DE ANÁLISIS ===');
    console.log('Estado actual:', {
      localStudyData,
      initialDiagnosis,
      ncsResults,
      emgResults,
      error
    });

    if (!localStudyData) {
      console.warn('No hay datos del estudio disponibles - esperando datos...');
      return;
    }

    if (!initialDiagnosis) {
      console.warn('Diagnóstico inicial no disponible - esperando diagnóstico...');
      return;
    }

    // Verificar que los valores necesarios estén presentes
    const ncsData = localStudyData.results?.ncs?.[0];
    console.log('Datos NCS procesados:', ncsData);
    
    if (!ncsData) {
      console.warn('No hay datos de NCS disponibles - esperando datos...');
      return;
    }

    if (!ncsData.latency || !ncsData.amplitude || !ncsData.velocity) {
      console.warn('Datos de NCS incompletos - esperando datos completos...', {
        latency: ncsData.latency,
        amplitude: ncsData.amplitude,
        velocity: ncsData.velocity
      });
      return;
    }

    try {
      // Create NCSTest object from study data
      const ncsTest: NCSTest = {
        id: localStudyData.id || crypto.randomUUID(),
        date: localStudyData.date || new Date().toISOString(),
        type: 'motor',
        nerve: initialDiagnosis,
        side: 'right',
        measurements: {
          latency: ncsData.latency,
          amplitude: ncsData.amplitude,
          velocity: ncsData.velocity
        }
      };

      console.log('Objeto NCSTest creado:', ncsTest);
      
      const results = analyzeNerveConduction(ncsTest.nerve, ncsTest);
      console.log('Resultados del análisis:', results);
      
      if (!results) {
        console.warn('No se pudieron analizar los resultados - usando diagnóstico inicial');
        setDiagnosticResults({
          diagnosis: initialDiagnosis,
          confidence: 0.5,
          patterns: []
        });
      } else {
        setDiagnosticResults(results);
      }

      // Generar conclusión automática
      const autoConclusion = generateAutoConclusion(results);
      console.log('Conclusión automática generada:', autoConclusion);
      
      if (!conclusion) {
        setConclusion(autoConclusion);
      }

      // Analizar datos de EMG si están presentes
      if (localStudyData.results?.emg?.[0]) {
        console.log('Analizando datos EMG:', localStudyData.results.emg[0]);
        const emgData = localStudyData.results.emg[0];
        const emgAnalysisResult = analyzeEMGData(emgData);
        console.log('Resultados del análisis EMG:', emgAnalysisResult);
        setEmgAnalysis(emgAnalysisResult);
      }

      // Transform EMG data
      if (emgResults && isEMGResultsBase(emgResults)) {
        console.log('Transforming EMG data:', emgResults);
        const transformedEMGData = transformEMGDataForAnalysis(emgResults);
        const displayData = transformEMGDataForDisplay(emgResults);
        setEmgDisplayData(displayData);
        
        if (transformedEMGData.length > 0) {
          const emgAnalysisResults = transformedEMGData.map(analyzeEMGData);
          setEmgAnalysis(emgAnalysisResults);
          console.log('EMG analysis results:', emgAnalysisResults);

          // Analyze patterns
          const patternScores = EMGPatternAnalyzer.analyzeForSpecificPatterns(transformedEMGData[0]);
          setEmgPatterns(patternScores);

                    // 🔥 NUEVA LÓGICA - Validación cruzada de patrones
          try {
            console.log('🔍 Iniciando validación cruzada de patrones...');
            
            // Siempre intentar validación cruzada, incluso con un solo patrón
            const crossValidation = PatternCrossValidationService.validatePatternConsistency(
              ncsData, // Datos de NCS
              transformedEMGData[0], // Datos de EMG
              patient ? calculateAge(patient.dateOfBirth) : patientInfo ? calculateAge(patientInfo.dateOfBirth) : undefined
            );
            
            console.log('Resultados de validación cruzada:', crossValidation);
            setCrossValidationResult(crossValidation);
            setConsistencyConflicts(crossValidation.conflicts);
            
            // Actualizar patrones con información de conflictos si hay múltiples patrones
            if (patternScores.length > 1 && crossValidation.detectedPatterns.length > 0) {
              const enhancedPatterns = enhancePatternWithEvidence(patternScores, crossValidation);
              setTopPatterns(enhancedPatterns);
            } else {
              // Crear patrones básicos mejorados
              const basicPatterns = createBasicPatterns(patternScores);
              setTopPatterns(basicPatterns);
            }
          } catch (error) {
            console.error('Error en validación cruzada:', error);
            setConsistencyConflicts([]);
            setCrossValidationResult(null);
            
            // Fallback a patrones básicos
            const basicPatterns = createBasicPatterns(patternScores);
            setTopPatterns(basicPatterns);
          }
        } else {
          console.warn('No EMG data to analyze after transformation');
        }
      }

      console.log('=== ANÁLISIS COMPLETADO CON ÉXITO ===');
    } catch (error) {
      console.error('Error in analysis effect:', error);
      setError('Error analyzing EMG data');
    }
  }, [localStudyData, initialDiagnosis, ncsResults, emgResults, error, isLoading]);

  // Modificar la función generateReport para manejar mejor los casos sin datos
  const generateReport = () => {
    const sections: string[] = [];

    // Encabezado del Reporte
    sections.push('# Reporte de Electroneuromiografía');
    sections.push(`Fecha: ${new Date().toLocaleDateString()}`);
    sections.push('');

    // Información del Paciente
    sections.push('## Información del Paciente');
    if (patient) {
      sections.push(`- ID: ${patient.id || 'No especificado'}`);
      sections.push(`- Nombre: ${patient.name || 'No especificado'}`);
      sections.push(`- Edad: ${patient.dateOfBirth ? calculateAge(patient.dateOfBirth) : 'No especificado'} años`);
      sections.push(`- Sexo: ${patient.sex || 'No especificado'}`);
      sections.push(`- Fecha de Nacimiento: ${patient.dateOfBirth ? new Date(patient.dateOfBirth).toLocaleDateString() : 'No especificado'}`);
      if (patient.medicalHistory) {
        sections.push('- Antecedentes Médicos:');
        if (patient.medicalHistory.previousDiseases?.length) {
          sections.push(`  - Enfermedades Previas: ${patient.medicalHistory.previousDiseases.join(', ')}`);
        }
        if (patient.medicalHistory.medications?.length) {
          sections.push(`  - Medicamentos: ${patient.medicalHistory.medications.join(', ')}`);
        }
        if (patient.medicalHistory.allergies?.length) {
          sections.push(`  - Alergias: ${patient.medicalHistory.allergies.join(', ')}`);
        }
      }
    } else {
      sections.push('- No se encontró información del paciente');
    }
    sections.push('');

    // Motivo de Consulta y Exploración
    sections.push('## Motivo de Consulta y Exploración');
    if (formData) {
      // Usar la estructura correcta de ClinicalEvaluationFormData
      if (formData.reasonForStudy) {
        sections.push('- Motivo de Estudio:');
        
        if (formData.reasonForStudy.weakness?.present) {
          sections.push(`  - Debilidad: ${formData.reasonForStudy.weakness.severity || 'No especificado'}`);
          if (formData.reasonForStudy.weakness.distribution?.length) {
            sections.push(`    - Distribución: ${formData.reasonForStudy.weakness.distribution.join(', ')}`);
          }
        }
        
        if (formData.reasonForStudy.paresthesias?.present) {
          sections.push('  - Parestesias presentes');
          if (formData.reasonForStudy.paresthesias.distribution?.length) {
            sections.push(`    - Distribución: ${formData.reasonForStudy.paresthesias.distribution.join(', ')}`);
          }
        }
        
        if (formData.reasonForStudy.pain?.present) {
          sections.push(`  - Dolor: intensidad ${formData.reasonForStudy.pain.intensity || 'No especificado'}/10`);
          if (formData.reasonForStudy.pain.type?.length) {
            sections.push(`    - Tipo: ${formData.reasonForStudy.pain.type.join(', ')}`);
          }
        }
      }
      
      // Hallazgos clínicos
      if (formData.clinicalFindings) {
        sections.push('- Exploración Física:');
        
        if (formData.clinicalFindings.muscleStrength?.affectedMuscles?.length) {
          sections.push('  - Fuerza Muscular:');
          formData.clinicalFindings.muscleStrength.affectedMuscles.forEach(muscle => {
            sections.push(`    - ${muscle.muscle} (${muscle.side}): ${muscle.mrcGrade}/5`);
          });
        }
        
        if (formData.clinicalFindings.reflexes) {
          sections.push('  - Reflejos:');
          Object.entries(formData.clinicalFindings.reflexes).forEach(([reflex, value]) => {
            sections.push(`    - ${reflex}: ${value}`);
          });
        }
        
        if (formData.clinicalFindings.gait) {
          sections.push(`  - Marcha: ${formData.clinicalFindings.gait.pattern}`);
          if (formData.clinicalFindings.gait.description) {
            sections.push(`    - Descripción: ${formData.clinicalFindings.gait.description}`);
          }
        }
      }
    } else {
      sections.push('- No se encontró información de la exploración');
    }
    sections.push('');

    // Resultados de Neuroconducción
    sections.push('## Resultados de Neuroconducción');
    if (ncsResults && ncsResults.length > 0) {
      ncsResults.forEach(result => {
        const nerveId = `${result.nerve?.toLowerCase()}_${result.type?.toLowerCase()}`;
        const nerveData = nerveDatabase.find(n => n.id === nerveId);
        const nerveName = nerveData?.name || result.nerve || 'Nervio no especificado';
        
        sections.push(`### ${nerveName} (${result.side || 'Lado no especificado'})`);
        
        // Interpretación de la latencia
        const latencyInterpretation = result.latency 
          ? interpretValue(result.latency, nerveId, 'latency')
          : 'sin información';
        sections.push(`- Latencia: ${result.latency || 'sin información'} ms (${latencyInterpretation})`);
        
        // Interpretación de la amplitud
        const amplitudeInterpretation = result.amplitude 
          ? interpretValue(result.amplitude, nerveId, 'amplitude')
          : 'sin información';
        sections.push(`- Amplitud: ${result.amplitude || 'sin información'} mV (${amplitudeInterpretation})`);
        
        // Interpretación de la velocidad
        const velocityInterpretation = result.velocity 
          ? interpretValue(result.velocity, nerveId, 'velocity')
          : 'sin información';
        sections.push(`- Velocidad: ${result.velocity || 'sin información'} m/s (${velocityInterpretation})`);
        
        sections.push(`- Estado: ${result.status === 'normal' ? 'Normal' : 'Anormal'}`);
        
        if (result.findings && result.findings.length > 0) {
          sections.push('- Hallazgos:');
          result.findings.forEach((finding: string) => {
            sections.push(`  - ${finding}`);
          });
        }
        sections.push('');
      });
    } else {
      sections.push('No se realizaron estudios de neuroconducción.');
      sections.push('');
    }

    // Resultados de EMG
    sections.push('## Resultados de Electromiografía');
    if (emgResults) {
      const displayData = transformEMGDataForDisplay(emgResults);
      if (Object.keys(displayData).length > 0) {
        Object.entries(displayData).forEach(([muscle, data]) => {
          if (isEMGDisplayData(data)) {
            sections.push(`### ${muscle} (${data.side || 'Lado no especificado'})`);
            sections.push(`- Actividad de inserción: ${data.insertionalActivity || 'sin información'}`);
            sections.push(`- Actividad espontánea: ${data.spontaneousActivity?.fibrillations ? 'Presente' : 'Ausente'}`);
            sections.push(`- Duración: ${data.motorUnitPotentials?.duration || 'sin información'} ms`);
            sections.push(`- Amplitud: ${data.motorUnitPotentials?.amplitude || 'sin información'} µV`);
            sections.push(`- Patrón de reclutamiento: ${data.recruitmentPattern || 'sin información'}`);
            sections.push('');
          }
        });
      } else {
        sections.push('No se encontraron datos de EMG para mostrar.');
      }
    } else {
      sections.push('No se realizaron estudios de electromiografía.');
    }
    sections.push('');

    // Interpretación
    sections.push('## Interpretación');
    if (ncsResults && ncsResults.length > 0) {
      const abnormalResults = ncsResults.filter(r => r.status === 'abnormal');
      if (abnormalResults.length > 0) {
        sections.push('Se observan alteraciones en los siguientes nervios:');
        abnormalResults.forEach(result => {
          const nerveId = `${result.nerve?.toLowerCase()}_${result.type?.toLowerCase()}`;
          const nerveData = nerveDatabase.find(n => n.id === nerveId);
          const nerveName = nerveData?.name || result.nerve || 'Nervio no especificado';
          sections.push(`- ${nerveName} (${result.side || 'Lado no especificado'}): ${result.findings?.join(', ') || 'sin información'}`);
        });
      } else {
        sections.push('No se observan alteraciones significativas en los nervios estudiados.');
      }
    } else {
      sections.push('No se cuenta con suficiente información para realizar una interpretación completa.');
    }
    sections.push('');

    // Conclusión
    sections.push('## Conclusión');
    if (selectedDiagnosis) {
      const [categoryId, subcategoryId] = selectedDiagnosis.split('_');
      const category = diagnosticCategories.find((c: { id: string }) => c.id === categoryId);
      const subcategory = category?.subcategories.find((s: { id: string }) => s.id === subcategoryId);
      
      if (category && subcategory) {
        sections.push(`El estudio sugiere un patrón compatible con ${category.name.toLowerCase()} - ${subcategory.name.toLowerCase()}.`);
        sections.push(category.description);
      } else {
        sections.push('El estudio es NO CONCLUYENTE debido a la limitada información disponible.');
        sections.push('Se recomienda completar el estudio con la evaluación de nervios adicionales para obtener una conclusión más precisa.');
      }
    } else {
      sections.push('El estudio es INCOMPLETO. No se cuenta con información suficiente para establecer un diagnóstico.');
      sections.push('Se recomienda completar el estudio con la evaluación de nervios periféricos y electromiografía para obtener una conclusión precisa.');
    }

    return sections.join('\n');
  };

  // Modificar el useEffect que genera el reporte
  React.useEffect(() => {
    if (isLoading) {
      console.log('Generación de reporte omitida: Cargando datos...');
      return;
    }

    console.log('=== INICIO DE GENERACIÓN DE REPORTE ===');
    console.log('Estado actual:', {
      patient,
      ncsResults,
      emgResults,
      selectedDiagnosis,
      error
    });

    try {
      const reportText = generateReport();
      console.log('Reporte generado:', reportText);
      setReportContent(reportText);
      setError(null);
      console.log('=== REPORTE GENERADO CON ÉXITO ===');
    } catch (error) {
      const errorMsg = 'Error al generar el reporte';
      console.error(errorMsg, error);
      setError(errorMsg);
    }
  }, [patient, ncsResults, emgResults, selectedDiagnosis, isLoading]);

  // Transform EMG data for pattern analysis
  const transformEMGData = (emgData: EMGResultsBase | null): EMGResultsClinical | null => {
    if (!emgData) {
      console.warn('No EMG data available for transformation');
      return null;
    }
    return {
      muscles: {
        default: {
          selected: true,
          strength: 5,
          insertionalActivity: emgData.insertionalActivity,
          spontaneousActivity: {
            fibrillations: emgData.spontaneousActivity.fibrillations ? 'present' : 'absent',
            positiveWaves: emgData.spontaneousActivity.positiveWaves ? 'present' : 'absent',
            fasciculations: emgData.spontaneousActivity.fasciculations ? 'present' : 'absent'
          },
          motorUnitAnalysis: {
            duration: emgData.motorUnitPotentials.duration,
            amplitude: emgData.motorUnitPotentials.amplitude,
            polyphasia: emgData.motorUnitPotentials.polyphasia > 20 ? 'increased' : 'normal',
            recruitment: emgData.recruitmentPattern
          },
          interference: 'normal'
        }
      },
      analysisDate: new Date().toISOString(),
      reviewedBy: 'System'
    };
  };

  // Transform and analyze EMG data
  const transformEMGDataForAnalysis = (emgData: EMGResultsBase | null): UnifiedEMGResults[] => {
    if (!emgData) {
      console.warn('No EMG data available for analysis');
      return [];
    }
    try {
      return [convertToUnifiedEMGResults(emgData)];
    } catch (error) {
      console.error('Error transforming EMG data:', error);
      return [];
    }
  };

  // Transform EMG data for display
  const transformEMGDataForDisplay = (emgData: EMGResultsBase | null): Record<string, EMGDisplayData> => {
    if (!emgData) {
      console.warn('No EMG data available for display');
      return {};
    }
    try {
      return {
        default: {
          insertionalActivity: emgData.insertionalActivity,
          spontaneousActivity: emgData.spontaneousActivity,
          motorUnitPotentials: {
            duration: emgData.motorUnitPotentials.duration,
            amplitude: emgData.motorUnitPotentials.amplitude,
            polyphasia: emgData.motorUnitPotentials.polyphasia
          },
          recruitmentPattern: emgData.recruitmentPattern,
          status: 'normal',
          findings: []
        }
      };
    } catch (error) {
      console.error('Error transforming EMG data for display:', error);
      return {};
    }
  };

  // Analizar datos de EMG
  const analyzeEMGData = (emgData: UnifiedEMGResults): string => {
    const findings: string[] = [];

    findings.push(interpretInsertionalActivity(emgData.insertionalActivity));
    findings.push(interpretSpontaneousActivity(emgData.spontaneousActivity));
    
    const mup = emgData.motorUnitActionPotentials;
    if (mup) {
      findings.push(interpretAmplitude(mup.amplitude));
      findings.push(interpretDuration(mup.duration));
      findings.push(interpretPolyphasia(mup.polyphasia));
    }
    findings.push(interpretRecruitmentPattern(emgData.recruitment));

    return findings.filter(f => f).join('\n');
  };

  // Generar una conclusión automática basada en los resultados del análisis
  const generateAutoConclusion = (results: any): string => {
    if (!results) return '';

    const findings: string[] = [];
    
    if (results.abnormalities?.length > 0) {
      findings.push('Abnormal findings:');
      findings.push(...results.abnormalities.map((a: string) => `- ${a}`));
    }

    if (results.recommendations?.length > 0) {
      findings.push('\nRecommendations:');
      findings.push(...results.recommendations.map((r: string) => `- ${r}`));
    }

    return findings.join('\n');
  };

  // Funciones auxiliares para interpretación de EMG
  const interpretInsertionalActivity = (value: string): string => {
    switch (value) {
      case 'normal': return 'Actividad de inserción normal';
      case 'aumentada': return 'Actividad de inserción aumentada, sugestivo de irritabilidad muscular';
      case 'disminuida': return 'Actividad de inserción disminuida, sugestivo de atrofia muscular';
      case 'ausente': return 'Actividad de inserción ausente, sugestivo de fibrosis muscular';
      default: return 'No especificado';
    }
  };

  const interpretSpontaneousActivity = (activity: any): string => {
    const findings = [];
    if (activity.fibrillations) findings.push('fibrilaciones');
    if (activity.positiveWaves) findings.push('ondas positivas');
    if (activity.fasciculations) findings.push('fasciculaciones');

    if (findings.length === 0) {
      return 'No se observa actividad espontánea anormal';
    }

    return `Se observa actividad espontánea anormal con ${findings.join(', ')}`;
  };

  const interpretAmplitude = (value: number): string => {
    if (value > 5000) return 'Amplitud aumentada, sugestivo de reinervación';
    if (value < 200) return 'Amplitud disminuida, sugestivo de pérdida de unidades motoras';
    return 'Amplitud normal';
  };

  const interpretDuration = (value: number): string => {
    if (value > 15) return 'Duración aumentada, sugestivo de reinervación';
    if (value < 5) return 'Duración disminuida, sugestivo de pérdida de unidades motoras';
    return 'Duración normal';
  };

  const interpretPolyphasia = (value: number): string => {
    if (value > 20) return 'Polifasia aumentada, sugestivo de reinervación';
    return 'Polifasia normal';
  };

  const interpretRecruitmentPattern = (value: string): string => {
    switch (value) {
      case 'normal': return 'Patrón de reclutamiento normal';
      case 'reducido': return 'Patrón de reclutamiento reducido, sugestivo de pérdida de unidades motoras';
      case 'aumentado': return 'Patrón de reclutamiento aumentado, sugestivo de debilidad muscular';
      case 'precoz': return 'Patrón de reclutamiento precoz, sugestivo de miopatía';
      default: return 'No especificado';
    }
  };

  // Guardar el análisis de IA cuando se reciba del panel de IA
  const handleAiAnalysisSave = (analysisText: string) => {
    setAiAnalysis(analysisText);
  };

  // Guardar el estudio completo
  const handleSaveStudy = async () => {
    if (!patientId && !patient) {
      setSaveError('No se puede guardar el estudio sin datos del paciente.');
      return;
    }

    setIsSaving(true);
    setSaveError(null);

    try {
      const patientToUse = patient || await getPatientById(patientId!);
      
      if (!patientToUse) {
        throw new Error('No se encontró información del paciente.');
      }

      // Crear objeto para el estudio
      const studyToSave: Study = {
        id: existingStudy?.id || crypto.randomUUID(),
        type: 'emg',
        date: new Date().toISOString(),
        patientId: patientToUse.id,
        results: {
          emg: emgResults ? transformEMGDataForAnalysis(emgResults) : [],
          ncs: ncsResults
        },
        observations,
        conclusion,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      // Si ya existe un estudio, actualizarlo
      if (existingStudy) {
        await updatePatientStudy({
          ...existingStudy,
          studyData: studyToSave,
          observations,
          conclusion,
          aiAnalysis: aiAnalysis ? {
            emgAnalysis: {
              id: existingStudy.aiAnalysis?.emgAnalysis?.id || crypto.randomUUID(),
              studyId: existingStudy.id,
              content: aiAnalysis,
              timestamp: new Date().toISOString(),
              modelVersion: 'ai-model-v1'
            }
          } : undefined
        });
      } else {
        // Si es un nuevo estudio, guardarlo
        await savePatientStudy({
          id: crypto.randomUUID(),
          patientId: patientToUse.id,
          patientName: `${patientToUse.firstName} ${patientToUse.lastName}`,
          studyType: 'emg',
          studyData: studyToSave,
          timestamp: new Date().toISOString(),
          observations,
          conclusion,
          aiAnalysis: aiAnalysis ? {
            emgAnalysis: {
              id: crypto.randomUUID(),
              studyId: studyToSave.id,
              content: aiAnalysis,
              timestamp: new Date().toISOString(),
              modelVersion: 'ai-model-v1'
            }
          } : undefined
        });
      }

      setSaveSuccess(true);

      // Notificar al componente padre
      if (onSaveComplete) {
        setTimeout(() => {
          onSaveComplete();
        }, 1500);
      }
    } catch (error) {
      console.error('Error al guardar el estudio:', error);
      setSaveError(`Error al guardar: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    } finally {
      setIsSaving(false);
    }
  };

  // Manejar la impresión del reporte
  const handlePrintReport = () => {
    const printWindow = window.open('', '_blank');
    
    if (printWindow) {
      printWindow.document.write(`
        <html>
        <head>
          <title>Reporte de Electroneuromiografía</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; padding: 20px; }
            h1 { text-align: center; }
            h2 { margin-top: 20px; border-bottom: 1px solid #ddd; padding-bottom: 5px; }
            h3 { margin-top: 15px; }
            pre { white-space: pre-wrap; }
          </style>
        </head>
        <body>
          <div id="report">
            ${reportContent.replace(/\n/g, '<br>').replace(/#{1,3}\s(.*?)$/gm, (match: string, group: string) => 
              match.startsWith('### ') 
                ? `<h3>${group}</h3>` 
                : match.startsWith('## ') 
                  ? `<h2>${group}</h2>` 
                  : `<h1>${group}</h1>`
            )}
          </div>
          <script>
            window.onload = function() {
              window.print();
              setTimeout(function() { window.close(); }, 500);
            };
          </script>
        </body>
        </html>
      `);
      printWindow.document.close();
    }
  };

  // Descargar el reporte como un archivo de texto
  const handleDownloadReport = () => {
    const blob = new Blob([reportContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `reporte-enmg-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Render EMG AI Analysis Panel
  const renderEMGAIAnalysisPanel = () => {
    if (!showAiPanel) {
      return aiAnalysis ? (
        <div className="border rounded-md p-4">
          <div className="max-h-[200px] overflow-y-auto whitespace-pre-wrap text-sm">
            {aiAnalysis}
          </div>
          <button
            onClick={() => setShowAiPanel(true)}
            className="mt-3 text-sm text-purple-600 hover:text-purple-800"
          >
            Editar análisis de IA
          </button>
        </div>
      ) : (
        <div className="p-4 border rounded-md bg-gray-50 text-center">
          <p className="text-gray-500">Haga clic en "Mostrar panel de IA" para generar un análisis especializado de electromiografía utilizando inteligencia artificial.</p>
        </div>
      );
    }

    return (
      <EMGAIAnalysisPanel
        emgData={studyData}
        patientData={{
          age: patient ? calculateAge(patient.dateOfBirth) : undefined,
          gender: patient?.sex,
          medicalHistory: patient?.medicalHistory?.previousDiseases?.join(', ') || undefined
        }}
        studyId={existingStudy?.id || 'temp-' + crypto.randomUUID()}
        onSave={handleAiAnalysisSave}
      />
    );
  };

  // Renderizar estado de carga o error
  const renderLoadingOrError = () => {
    if (isLoading) {
      return (
        <div className="flex flex-col items-center justify-center h-64 space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          <p className="text-gray-600">Cargando datos del estudio...</p>
          <p className="text-sm text-gray-500">Por favor espere mientras se cargan los datos.</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex flex-col items-center justify-center h-64 space-y-4 p-4 bg-red-50 rounded-lg">
          <AlertTriangle className="h-12 w-12 text-red-500" />
          <p className="text-red-600 font-medium">{error}</p>
          <div className="text-sm text-gray-600 text-center">
            <p>Por favor, verifica que:</p>
            <ul className="list-disc list-inside mt-2">
              <li>Se haya proporcionado un ID de estudio válido</li>
              <li>Los datos del estudio estén disponibles</li>
              <li>La conexión con el servidor esté funcionando</li>
            </ul>
          </div>
          {onBack && (
            <button
              onClick={onBack}
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 flex items-center"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver
            </button>
          )}
        </div>
      );
    }

    return null;
  };

  // Move renderEMGResultsTable inside the component
  const renderEMGResultsTable = () => {
    if (!emgResults) {
      return (
        <div className="text-gray-500 italic text-center py-4">
          Sin información de EMG
        </div>
      );
    }
    
    const displayData = transformEMGDataForDisplay(emgResults);
    
    return (
      <table className="min-w-full">
        <thead>
          <tr>
            <th className="px-4 py-2">Músculo</th>
            <th className="px-4 py-2">Actividad Espontánea</th>
            <th className="px-4 py-2">Duración (ms)</th>
            <th className="px-4 py-2">Amplitud (µV)</th>
            <th className="px-4 py-2">Reclutamiento</th>
            <th className="px-4 py-2">Estado</th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(displayData).map(([muscle, data]) => {
            if (!isEMGDisplayData(data)) return null;
            return (
              <tr key={muscle} className="border-t">
                <td className="px-4 py-2">{muscle}</td>
                <td className="px-4 py-2">
                  {data.spontaneousActivity?.fibrillations ? 'Fibrilaciones' : 'Normal'}
                </td>
                <td className="px-4 py-2">{data.motorUnitPotentials?.duration || 'sin información'}</td>
                <td className="px-4 py-2">{data.motorUnitPotentials?.amplitude || 'sin información'}</td>
                <td className="px-4 py-2">{data.recruitmentPattern || 'sin información'}</td>
                <td className="px-4 py-2">
                  <span className={`px-2 py-1 rounded ${
                    data.status === 'normal' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {data.status || 'sin información'}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    );
  };

  // 🔥 VERSIÓN MEJORADA - Patrones diagnósticos con evidencia detallada
  const renderDiagnosticPatterns = () => {
    if (!topPatterns || topPatterns.length === 0) {
      return (
        <div className="text-gray-400 italic text-center py-4">
          No hay patrones diagnósticos sugeridos para los datos actuales.
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {topPatterns.map((pattern) => {
          // Usar el patrón directamente ya que ahora contiene toda la información
          return (
            <div key={pattern.id} className="bg-gray-800/50 p-4 rounded-lg shadow-md border border-gray-700">
              <h4 className="font-semibold text-lg text-blue-300 mb-2">
                {pattern.name} (Confianza: {(pattern.confidence * 100).toFixed(1)}%)
              </h4>
              <p className="text-sm text-gray-300 mb-3">{pattern.description}</p>
              
              {/* Barra de Confianza Visual */}
              <div className="flex items-center mb-4">
                <span className="text-sm font-medium text-gray-400 mr-2">Confianza:</span>
                <div className="w-full bg-gray-700 rounded-full h-2.5">
                  <div 
                    className={`h-2.5 rounded-full ${
                      pattern.confidence > 0.8 ? 'bg-green-500' : 
                      pattern.confidence > 0.6 ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${(pattern.confidence * 100).toFixed(1)}%` }}
                  ></div>
                </div>
                <span className="text-sm font-bold text-gray-200 ml-2">
                  {(pattern.confidence * 100).toFixed(1)}%
                </span>
              </div>

              {/* 🔥 EVIDENCIA DE APOYO MEJORADA */}
              <div>
                <h5 className="font-medium text-gray-300 mb-2 flex items-center">
                  <TrendingUp className="h-4 w-4 mr-1" />
                  Evidencia de Apoyo:
                </h5>
                <ul className="list-disc pl-5 space-y-1 text-gray-400 text-sm">
                  {pattern.matchingCriteria?.map((criteria, index) => (
                    <li key={index} className={criteria.isMet ? 'text-green-400' : 'text-red-400'}>
                      <span className="font-medium">{criteria.description}</span>
                      {/* Muestra el valor específico si está disponible */}
                      {criteria.value && (
                        <span className="ml-1 text-gray-300 font-mono">
                          ({criteria.value})
                        </span>
                      )}
                      {/* Indicador visual de si se cumple */}
                      <span className="ml-2 text-xs">
                        {criteria.isMet ? '✓' : '✗'}
                      </span>
                    </li>
                  ))}
                </ul>
                
                {/* Evidencia adicional */}
                {pattern.supportingEvidence && pattern.supportingEvidence.length > 0 && (
                  <div className="mt-3">
                    <h6 className="text-xs font-bold text-gray-400 uppercase mb-1">Evidencia Adicional:</h6>
                    <ul className="list-disc pl-5 space-y-1">
                      {pattern.supportingEvidence.map((evidence, index) => (
                        <li key={index} className="text-xs text-gray-500">{evidence}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  // Modificar la sección de análisis de patrones EMG
  const renderEMGPatternAnalysis = () => {
    return (
      <div className="mt-4">
        <h3 className="text-lg font-semibold mb-2 text-black">Análisis de Patrones</h3>
        {emgPatterns.slice(0, 3).map((pattern: EMGPattern, index: number) => (
          <div key={index} className="mb-4">
            <h4 className="font-medium text-black">{pattern.name} (Score: {pattern.score.toFixed(2)})</h4>
            <ul className="list-disc pl-5 mt-2">
              {pattern.criteria.map((criteria: { description: string; matched: boolean }, criteriaIndex: number) => (
                <li
                  key={criteriaIndex}
                  className={criteria.matched ? 'text-green-800' : 'text-red-800'}
                >
                  {criteria.description}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    );
  };

  // Modificar la sección de resultados EMG
  const renderEMGResults = () => {
    if (!emgResults) {
      return (
        <li className="text-black italic">Sin información de EMG</li>
      );
    }

    const entries = Object.entries(emgResults as Record<string, any>);
    if (entries.length === 0) {
      return (
        <li className="text-black italic">Sin información de EMG</li>
      );
    }

    return (
      <>
        {entries
          .filter(([_, data]) => data.status === 'abnormal')
          .map(([muscle, data], index) => (
            <li key={index} className="text-black">
              Alteraciones en {muscle}: {data.findings?.join(', ') || 'sin información'}
            </li>
          ))}
      </>
    );
  };

  // 🔥 FUNCIONES AUXILIARES PARA VALIDACIÓN CRUZADA
  const enhancePatternWithEvidence = (patterns: EMGPattern[], crossValidation: CrossValidationResult): DiagnosticPattern[] => {
    return patterns.map((pattern, index) => ({
      id: `pattern_${index}`,
      name: pattern.name,
      description: `Patrón detectado con score ${pattern.score.toFixed(2)}`,
      score: pattern.score,
      confidence: pattern.confidence || 0.5,
      matchingCriteria: pattern.criteria.map(criteria => ({
        description: criteria.description,
        isMet: criteria.matched,
        category: 'emg' as const
      })),
      supportingEvidence: crossValidation.detectedPatterns.find(p => p.patternType === pattern.name.toLowerCase())?.supportingEvidence || []
    }));
  };

  const createBasicPatterns = (patterns: EMGPattern[]): DiagnosticPattern[] => {
    return patterns.slice(0, 3).map((pattern, index) => ({
      id: `basic_${index}`,
      name: pattern.name,
      description: `Patrón detectado con score ${pattern.score.toFixed(2)}`,
      score: pattern.score,
      confidence: pattern.confidence || 0.5,
      matchingCriteria: pattern.criteria.map(criteria => ({
        description: criteria.description,
        isMet: criteria.matched,
        category: 'emg' as const
      })),
      supportingEvidence: [`Score de confianza: ${(pattern.score * 100).toFixed(1)}%`]
    }));
  };

  // 🔥 NUEVO - Panel de Consistencia Diagnóstica
  const renderConsistencyPanel = () => {
    if (consistencyConflicts.length === 0) {
      return (
        <div className="bg-green-900/30 border border-green-700/50 p-4 rounded-lg flex items-center">
          <CheckCircle className="h-5 w-5 text-green-400 mr-3" />
          <p className="text-green-300 text-sm">Los patrones diagnósticos detectados son consistentes entre sí.</p>
        </div>
      );
    }

    return (
      <div className="space-y-3">
        {consistencyConflicts.map((conflict, index) => (
          <div key={index} className="bg-red-900/30 border border-red-700/50 p-4 rounded-lg">
            <div className="flex items-start">
              <AlertTriangle className="h-5 w-5 text-red-400 mr-3 mt-1 flex-shrink-0" />
              <div>
                <h5 className="font-semibold text-red-300">
                  Conflicto Detectado: {conflict.conflictType === 'incompatible' ? 'Incompatibilidad' : 'Aclaración Requerida'}
                </h5>
                <p className="text-sm text-red-200 mt-1">{conflict.description}</p>
                
                <div className="mt-3">
                  <h6 className="text-xs font-bold text-gray-300 uppercase">Posibles Explicaciones</h6>
                  <ul className="list-disc pl-5 mt-1 text-xs text-gray-400 space-y-1">
                    {conflict.possibleExplanations.map((explanation, i) => (
                      <li key={i}>{explanation}</li>
                    ))}
                  </ul>
                </div>

                <div className="mt-3">
                  <h6 className="text-xs font-bold text-gray-300 uppercase">Acciones Recomendadas</h6>
                  <ul className="list-disc pl-5 mt-1 text-xs text-gray-400 space-y-1">
                    {conflict.recommendedActions.map((action, i) => (
                      <li key={i}>{action}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  // Función auxiliar para interpretar valores
  const interpretValue = (value: number, nerveId: string, type: 'latency' | 'amplitude' | 'velocity'): string => {
    const nerveData = nerveDatabase.find(n => n.id === nerveId);
    if (!nerveData) {
      return 'sin referencia';
    }

    const { min, max } = nerveData.referenceValues[type];
    
    if (value < min) {
      return 'disminuido';
    } else if (value > max) {
      return 'aumentado';
    } else {
      return 'normal';
    }
  };

  // Si estamos cargando o hay un error, mostrar el estado correspondiente
  if (isLoading || error) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <h2 className="text-2xl font-bold mb-6">Análisis de Resultados</h2>
        {renderLoadingOrError()}
      </div>
    );
  }

  return (
    <div className="space-y-6 bg-gray-50 p-6 rounded-lg">
      {/* Sección de Valores por Nervio */}
      <div className="mb-8">
        <h3 className="text-xl font-semibold mb-4 text-black">Valores por Nervio</h3>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          {ncsResults && ncsResults.length > 0 ? (
            <table className="min-w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-4 py-3 text-left text-sm font-semibold text-black">Nervio</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-black">Lado</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-black">Latencia (ms)</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-black">Amplitud (mV)</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-black">Velocidad (m/s)</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-black">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {ncsResults.map((result, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-black">{result.nerve}</td>
                    <td className="px-4 py-3 text-sm text-black">{result.side || 'No especificado'}</td>
                    <td className="px-4 py-3 text-sm text-black">{result.latency || '-'}</td>
                    <td className="px-4 py-3 text-sm text-black">{result.amplitude || '-'}</td>
                    <td className="px-4 py-3 text-sm text-black">{result.velocity || '-'}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded text-sm font-medium ${
                        result.status === 'normal' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {result.status === 'normal' ? 'Normal' : 'Anormal'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="text-black italic text-center py-4">
              Sin información de conducción nerviosa
            </div>
          )}
        </div>
      </div>

      {/* Sección de Selección de Diagnóstico */}
      <div className="mb-8">
        <h3 className="text-xl font-semibold mb-4 text-black">Selección de Diagnóstico</h3>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <DiagnosticSelector 
            onSelect={(diagnosisId: string) => {
              setSelectedDiagnosis(diagnosisId);
              console.log('Diagnóstico seleccionado:', diagnosisId);
            }}
            selectedDiagnosis={selectedDiagnosis}
          />
        </div>
      </div>

      {/* 🔥 NUEVO - Panel de Consistencia Diagnóstica */}
      <div className="mb-8">
        <h3 className="text-xl font-semibold mb-4 text-gray-100 flex items-center">
          <Shield className="h-6 w-6 mr-2 text-blue-400" />
          Panel de Consistencia Diagnóstica
        </h3>
        <div className="bg-gray-800/50 p-4 sm:p-6 rounded-lg shadow-sm border border-gray-700">
          {renderConsistencyPanel()}
        </div>
      </div>

      {/* Sección de Patrones Diagnósticos Mejorada */}
      <div className="mb-8">
        <h3 className="text-xl font-semibold mb-4 text-gray-100 flex items-center">
          <Brain className="h-6 w-6 mr-2 text-purple-400" />
          Patrones Diagnósticos Sugeridos
        </h3>
        <div className="bg-gray-900/50 p-4 sm:p-6 rounded-lg shadow-sm border border-gray-700">
          {renderDiagnosticPatterns()}
          
          {/* Información educativa sobre la evidencia */}
          {topPatterns && topPatterns.length > 0 && (
            <div className="mt-6 p-4 bg-blue-900/20 border border-blue-700/30 rounded-lg">
              <div className="flex items-start">
                <Brain className="h-5 w-5 text-blue-400 mr-3 mt-1 flex-shrink-0" />
                <div className="text-sm">
                  <h6 className="font-semibold text-blue-300 mb-2">Interpretación de la Evidencia:</h6>
                  <ul className="space-y-1 text-blue-200">
                    <li>• <span className="text-green-400">✓</span> Criterios cumplidos respaldan el diagnóstico</li>
                    <li>• <span className="text-red-400">✗</span> Criterios no cumplidos sugieren otras posibilidades</li>
                    <li>• Los valores específicos ayudan a correlacionar con rangos normales</li>
                    <li>• Múltiples criterios aumentan la confianza diagnóstica</li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Interpretación Final */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
        <h3 className="text-xl font-semibold mb-4 text-black">Interpretación Final</h3>
        <div className="prose max-w-none text-black">
          <p className="text-black">
            Basado en los resultados obtenidos, se observa un patrón electrodiagnóstico que sugiere{' '}
            {topPatterns && topPatterns[0] ? diagnosticPatterns[topPatterns[0].id].name.toLowerCase() : 'un patrón no específico'}.
          </p>
          <p className="text-black">
            Los hallazgos principales incluyen:
          </p>
          <ul className="list-disc pl-4 text-black">
            {ncsResults && ncsResults.length > 0 ? (
              ncsResults.filter(r => r.status === 'abnormal').map((result, index) => (
                <li key={index} className="text-black">
                  Alteraciones en el nervio {result.nerve} ({result.side || 'lado no especificado'}): {result.findings?.join(', ') || 'sin información'}
                </li>
              ))
            ) : (
              <li className="text-black italic">Sin información de conducción nerviosa</li>
            )}
            {renderEMGResults()}
          </ul>
        </div>
      </div>

      <div className="mt-6 flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-900">Análisis de Resultados</h2>
        
        <div className="flex space-x-3">
          <button
            onClick={handlePrintReport}
            className="px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-800 flex items-center transition-colors duration-200"
          >
            <FileText className="mr-2 h-4 w-4" />
            Imprimir
          </button>
          
          <button
            onClick={handleDownloadReport}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 flex items-center transition-colors duration-200"
          >
            <Download className="mr-2 h-4 w-4" />
            Descargar
          </button>
          
          {(patientId || patient) && (
            <button
              onClick={handleSaveStudy}
              disabled={isSaving}
              className={`px-4 py-2 rounded-md flex items-center transition-colors duration-200 ${
                isSaving ? 'bg-gray-400 text-gray-200' : 'bg-green-600 text-white hover:bg-green-700'
              }`}
            >
              {isSaving ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Guardar Estudio
                </>
              )}
            </button>
          )}
        </div>
      </div>

      <div className="mt-6 bg-white p-6 rounded-lg shadow-sm border border-gray-100">
        {reportMode === 'view' ? (
          <div className="prose max-w-none text-gray-700">
            <div dangerouslySetInnerHTML={{ __html: reportContent.replace(/\n/g, '<br>') }} />
          </div>
        ) : (
          <textarea
            value={reportContent}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setReportContent(e.target.value)}
            className="w-full h-96 p-4 border border-gray-200 rounded-md font-mono text-sm text-gray-700 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        )}
      </div>

      <div className="mt-6 flex justify-end space-x-3">
        <button
          onClick={() => setReportMode(reportMode === 'view' ? 'edit' : 'view')}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center transition-colors duration-200"
        >
          {reportMode === 'view' ? (
            <>
              <Edit2 className="mr-2 h-4 w-4" />
              Editar Reporte
            </>
          ) : (
            <>
              <Eye className="mr-2 h-4 w-4" />
              Ver Reporte
            </>
          )}
        </button>
      </div>

      <div className="mt-6 bg-white p-6 rounded-lg shadow-sm border border-gray-100">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-lg font-medium flex items-center text-gray-800">
            <Brain className="h-5 w-5 text-indigo-600 mr-2" />
            Análisis Especializado por IA
          </h3>
          
          <button
            onClick={() => setShowAiPanel(!showAiPanel)}
            className="text-sm text-indigo-600 hover:text-indigo-800 transition-colors duration-200"
          >
            {showAiPanel ? 'Ocultar panel de IA' : 'Mostrar panel de IA'}
          </button>
        </div>
        
        {renderEMGAIAnalysisPanel()}
      </div>

      {renderEMGPatternAnalysis()}
    </div>
  );
};

// Función auxiliar para calcular la edad a partir de la fecha de nacimiento
const calculateAge = (dateOfBirth: string): number => {
  const today = new Date();
  const birthDate = new Date(dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
};

// Reemplazar el componente EMGAIAnalysisPanel con un componente temporal
const EMGAIAnalysisPanel = () => {
  return (
    <div className="p-4 border rounded-md bg-gray-50">
      <h3 className="text-lg font-medium mb-4">Análisis de IA (Temporal)</h3>
      <p className="text-gray-600">El análisis de IA estará disponible próximamente.</p>
    </div>
  );
};

export default ResultAnalyzer;