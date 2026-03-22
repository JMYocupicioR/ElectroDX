// 🧠 SERVICIO DE MAPEO DE DATOS PARA AUTO-LLENADO
// ================================================
// Convierte datos extraídos del archivo a formatos de formularios EMG

import { ClinicalSymptomsData } from '../components/ClinicalSymptomsForm';
import { NCSTestResult } from '../types/ncs';
import { EMGNerveRecord } from '../components/EMGNeedleAnalysis';
import { Patient } from '../types/patient';

// Interfaces para datos extraídos
export interface ExtractedFileData {
  patient?: {
    name: string;
    id: string;
    age: number;
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
  // 🔥 NUEVO - Estudios especiales extraídos del documento (SOLO DATOS REALES)
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
}

// Resultado del mapeo con logs
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

// Logger para el mapeo
class FormDataLogger {
  private logs: Array<{
    timestamp: string;
    level: 'info' | 'warn' | 'error';
    source: string;
    message: string;
    data?: any;
  }> = [];

  log(level: 'info' | 'warn' | 'error', source: string, message: string, data?: any) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      level,
      source,
      message,
      data
    };
    
    this.logs.push(logEntry);
    
    console.log(`[FormMapper:${source}] ${message}`, data || '');
  }

  getLogs() {
    return [...this.logs];
  }

  clearLogs() {
    this.logs = [];
  }
}

export const formLogger = new FormDataLogger();

// 🧠 CLASE PRINCIPAL DE MAPEO MEJORADA
export class FormDataMapper {
  
  // ========================================
  // 0. MAPEO PRINCIPAL INTEGRADO
  // ========================================
  static mapAllFormData(extractedData: ExtractedFileData): {
    symptoms: MappingResult<ClinicalSymptomsData>;
    ncs: MappingResult<NCSTestResult[]>;
    emg: MappingResult<EMGNerveRecord[]>;
    specialStudies: MappingResult<any>; // 🔥 AGREGAR ESTUDIOS ESPECIALES
    patient: Partial<Patient>;
    overall: {
      success: boolean;
      totalFieldsMapped: number;
      overallConfidence: number;
      warnings: string[];
      errors: string[];
    };
  } {
    formLogger.log('info', 'FormDataMapper', '🚀 Iniciando mapeo completo de datos extraídos', {
      hasPatient: !!extractedData.patient,
      hasNCS: !!extractedData.ncsResults,
      hasEMG: !!extractedData.emgResults,
      hasSymptoms: !!extractedData.symptoms
    });

    // Mapear cada sección por separado
    const symptomsResult = this.mapSymptomsData(extractedData);
    const ncsResult = this.mapNCSData(extractedData);
    const emgResult = this.mapEMGData(extractedData);
    const specialStudiesResult = this.mapSpecialStudiesData(extractedData); // 🔥 MAPEAR ESTUDIOS ESPECIALES
    const patientData = this.mapPatientData(extractedData);

    // Calcular estadísticas generales
    const totalFieldsMapped = symptomsResult.mappingStats.fieldsMapped +
                             ncsResult.mappingStats.fieldsMapped +
                             emgResult.mappingStats.fieldsMapped +
                             specialStudiesResult.mappingStats.fieldsMapped; // 🔥 INCLUIR ESTUDIOS ESPECIALES

    const overallConfidence = (
      symptomsResult.mappingStats.confidence +
      ncsResult.mappingStats.confidence +
      emgResult.mappingStats.confidence +
      specialStudiesResult.mappingStats.confidence // 🔥 INCLUIR ESTUDIOS ESPECIALES
    ) / 4;

    const allWarnings = [
      ...symptomsResult.warnings,
      ...ncsResult.warnings,
      ...emgResult.warnings,
      ...specialStudiesResult.warnings, // 🔥 INCLUIR ADVERTENCIAS DE ESTUDIOS ESPECIALES
      ...(extractedData.warnings || [])
    ];

    const allErrors = [
      ...symptomsResult.errors,
      ...ncsResult.errors,
      ...emgResult.errors,
      ...specialStudiesResult.errors // 🔥 INCLUIR ERRORES DE ESTUDIOS ESPECIALES
    ];

    const overallSuccess = symptomsResult.success && ncsResult.success && emgResult.success && specialStudiesResult.success;

    formLogger.log('info', 'FormDataMapper', '🎯 Mapeo completo finalizado', {
      totalFieldsMapped,
      overallConfidence: `${(overallConfidence * 100).toFixed(1)}%`,
      overallSuccess,
      warnings: allWarnings.length,
      errors: allErrors.length
    });

    return {
      symptoms: symptomsResult,
      ncs: ncsResult,
      emg: emgResult,
      specialStudies: specialStudiesResult, // 🔥 INCLUIR ESTUDIOS ESPECIALES EN RETORNO
      patient: patientData,
      overall: {
        success: overallSuccess,
        totalFieldsMapped,
        overallConfidence,
        warnings: allWarnings,
        errors: allErrors
      }
    };
  }

  // ========================================
  // 0.1 MAPEO DE DATOS DEL PACIENTE
  // ========================================
  static mapPatientData(extractedData: ExtractedFileData): Partial<Patient> {
    const patientData = extractedData.patient;
    if (!patientData) {
      formLogger.log('warn', 'PatientMapper', '⚠️ No hay datos de paciente para mapear');
      return {};
    }

    const mappedPatient: Partial<Patient> = {
      id: patientData.id || '',
      firstName: patientData.name ? patientData.name.split(' ')[0] : '',
      lastName: patientData.name ? patientData.name.split(' ').slice(1).join(' ') : '',
      sex: patientData.sex || 'male'
    };

    // Calcular fecha de nacimiento basada en edad
    if (patientData.age && patientData.age > 0) {
      const currentYear = new Date().getFullYear();
      mappedPatient.dateOfBirth = `${currentYear - patientData.age}-01-01`;
    }

    formLogger.log('info', 'PatientMapper', '✅ Datos del paciente mapeados', {
      id: mappedPatient.id,
      name: `${mappedPatient.firstName} ${mappedPatient.lastName}`,
      age: patientData.age,
      sex: mappedPatient.sex
    });

    return mappedPatient;
  }

  // ========================================
  // 1. MAPEAR SÍNTOMAS CLÍNICOS (MEJORADO)
  // ========================================
  static mapSymptomsData(extractedData: ExtractedFileData): MappingResult<ClinicalSymptomsData> {
    formLogger.log('info', 'SymptomsMapper', '🔄 Iniciando mapeo de síntomas mejorado', { 
      hasSymptoms: !!extractedData.symptoms,
      symptomsKeys: extractedData.symptoms ? Object.keys(extractedData.symptoms) : []
    });

    const warnings: string[] = [];
    const errors: string[] = [];
    let fieldsProcessed = 0;
    let fieldsMapped = 0;

    // Plantilla base de síntomas mejorada
    const createEmptySymptom = (id: string, name: string) => ({
      id,
      name,
      present: false,
      severity: 'mild' as const,
      duration: '',
      onset: 'gradual' as const,
      progression: 'stable' as const,
      location: [],
      characteristics: [],
      triggers: [],
      alleviatingFactors: [],
      associatedSymptoms: [],
      notes: ''
    });

    const symptomsData: ClinicalSymptomsData = {
      motor: {
        weakness: createEmptySymptom('weakness', 'Debilidad muscular'),
        fatigue: createEmptySymptom('fatigue', 'Fatiga'),
        cramps: createEmptySymptom('cramps', 'Calambres'),
        stiffness: createEmptySymptom('stiffness', 'Rigidez'),
        tremor: createEmptySymptom('tremor', 'Temblor'),
        fasciculations: createEmptySymptom('fasciculations', 'Fasciculaciones')
      },
      sensory: {
        numbness: createEmptySymptom('numbness', 'Entumecimiento'),
        tingling: createEmptySymptom('tingling', 'Hormigueo'),
        burning: createEmptySymptom('burning', 'Ardor'),
        pain: createEmptySymptom('pain', 'Dolor'),
        hyperalgesia: createEmptySymptom('hyperalgesia', 'Hiperalgesia'),
        allodynia: createEmptySymptom('allodynia', 'Alodinia')
      },
      autonomic: {
        sweating: createEmptySymptom('sweating', 'Alteraciones sudoración'),
        temperature: createEmptySymptom('temperature', 'Disregulación térmica'),
        skinChanges: createEmptySymptom('skinChanges', 'Cambios en la piel'),
        vasomotor: createEmptySymptom('vasomotor', 'Síntomas vasomotores')
      },
      functional: {
        walkingDifficulty: createEmptySymptom('walkingDifficulty', 'Dificultad para caminar'),
        handFunction: createEmptySymptom('handFunction', 'Disfunción manual'),
        balance: createEmptySymptom('balance', 'Alteraciones del equilibrio'),
        coordination: createEmptySymptom('coordination', 'Problemas de coordinación')
      },
      constitutional: {
        weightLoss: createEmptySymptom('weightLoss', 'Pérdida de peso'),
        sleep: createEmptySymptom('sleep', 'Alteraciones del sueño'),
        mood: createEmptySymptom('mood', 'Cambios del estado de ánimo')
      }
    };

    // Mapear datos extraídos con lógica mejorada
    if (extractedData.symptoms) {
      try {
        // Mapear debilidad con más contexto
        if (extractedData.symptoms.weakness) {
          fieldsProcessed++;
          symptomsData.motor.weakness.present = extractedData.symptoms.weakness.present;
          symptomsData.motor.weakness.severity = this.mapSeverity(extractedData.symptoms.weakness.severity);
          symptomsData.motor.weakness.notes = 'Auto-llenado desde archivo procesado';
          
          // Mapear ubicación si está disponible
          if ((extractedData.symptoms.weakness as any).location) {
            symptomsData.motor.weakness.location = Array.isArray((extractedData.symptoms.weakness as any).location) 
              ? (extractedData.symptoms.weakness as any).location 
              : [(extractedData.symptoms.weakness as any).location];
          }
          
          fieldsMapped++;
          formLogger.log('info', 'SymptomsMapper', '✅ Mapeó debilidad avanzada', extractedData.symptoms.weakness);
        }

        // Mapear parestesias/hormigueos con detalles
        if (extractedData.symptoms.paresthesias) {
          fieldsProcessed++;
          symptomsData.sensory.tingling.present = extractedData.symptoms.paresthesias.present;
          symptomsData.sensory.tingling.severity = this.mapSeverity(extractedData.symptoms.paresthesias.severity);
          symptomsData.sensory.tingling.notes = 'Auto-llenado desde archivo procesado';
          
          // También activar entumecimiento si hay parestesias
          symptomsData.sensory.numbness.present = true;
          symptomsData.sensory.numbness.severity = symptomsData.sensory.tingling.severity;
          
          fieldsMapped++;
          formLogger.log('info', 'SymptomsMapper', '✅ Mapeó parestesias avanzadas', extractedData.symptoms.paresthesias);
        }

        // Mapear dolor con contexto
        if (extractedData.symptoms.pain) {
          fieldsProcessed++;
          symptomsData.sensory.pain.present = extractedData.symptoms.pain.present;
          if (extractedData.symptoms.pain.present) {
            symptomsData.sensory.pain.severity = 'moderate';
            // Inferir tipo de dolor basado en contexto
            if ((extractedData.symptoms.pain as any).type) {
              if ((extractedData.symptoms.pain as any).type.includes('burning') || (extractedData.symptoms.pain as any).type.includes('ardor')) {
                symptomsData.sensory.burning.present = true;
              }
            }
            fieldsMapped++;
          }
          formLogger.log('info', 'SymptomsMapper', '✅ Mapeó dolor avanzado', extractedData.symptoms.pain);
        }

        // Inferir síntomas adicionales basados en contexto clínico
        this.inferAdditionalSymptoms(extractedData, symptomsData);

        // Mapear otros síntomas detectados automáticamente
        Object.keys(extractedData.symptoms).forEach(key => {
          if (['weakness', 'paresthesias', 'pain'].indexOf(key) === -1) {
            fieldsProcessed++;
            this.mapOtherSymptom(key, extractedData.symptoms![key], symptomsData);
            formLogger.log('warn', 'SymptomsMapper', `⚠️ Síntoma adicional mapeado: ${key}`, extractedData.symptoms![key]);
          }
        });

      } catch (error) {
        const errorMsg = `Error mapeando síntomas: ${error instanceof Error ? error.message : 'Error desconocido'}`;
        formLogger.log('error', 'SymptomsMapper', errorMsg, error);
        errors.push(errorMsg);
      }
    } else {
      formLogger.log('warn', 'SymptomsMapper', '⚠️ No se encontraron datos de síntomas para mapear');
      warnings.push('No se encontraron datos de síntomas en el archivo');
    }

    const confidence = fieldsProcessed > 0 ? (fieldsMapped / fieldsProcessed) * 100 : 0;

    formLogger.log('info', 'SymptomsMapper', '🎯 Mapeo de síntomas completado', {
      fieldsProcessed,
      fieldsMapped,
      confidence: `${confidence.toFixed(1)}%`,
      warnings: warnings.length,
      errors: errors.length
    });

    return {
      data: symptomsData,
      success: errors.length === 0,
      warnings,
      errors,
      mappingStats: {
        fieldsProcessed,
        fieldsMapped,
        fieldsSkipped: fieldsProcessed - fieldsMapped,
        confidence: confidence / 100
      }
    };
  }

  // ========================================
  // 2. MAPEAR DATOS NCS (MEJORADO)
  // ========================================
  static mapNCSData(extractedData: ExtractedFileData): MappingResult<NCSTestResult[]> {
    formLogger.log('info', 'NCSMapper', '🔄 Iniciando mapeo de datos NCS mejorado', {
      hasNCSResults: !!extractedData.ncsResults,
      ncsCount: extractedData.ncsResults?.length || 0
    });

    const warnings: string[] = [];
    const errors: string[] = [];
    let fieldsProcessed = 0;
    let fieldsMapped = 0;

    const ncsResults: NCSTestResult[] = [];

    if (extractedData.ncsResults && extractedData.ncsResults.length > 0) {
      extractedData.ncsResults.forEach((ncs, index) => {
        try {
          fieldsProcessed++;
          
          // ✅ VALIDAR DATOS REALES - NO INVENTAR
          if (!ncs.nerve || !ncs.side || ncs.latency <= 0 || ncs.amplitude <= 0 || ncs.velocity <= 0) {
            const error = `NCS ${index}: Datos insuficientes (nerve: ${ncs.nerve}, side: ${ncs.side}, latency: ${ncs.latency}, amplitude: ${ncs.amplitude}, velocity: ${ncs.velocity})`;
            formLogger.log('error', 'NCSMapper', error, ncs);
            errors.push(error);
            return;
          }

          // Validar rangos clínicos con más precisión
          const validationResult = this.validateNCSRanges(ncs);
          if (validationResult.warnings.length > 0) {
            warnings.push(...validationResult.warnings);
          }

          // Determinar tipo de test más inteligentemente
          const testType = this.inferTestTypeAdvanced(ncs.nerve, ncs);

          // Determinar estado basado en valores
          const status = this.determineNCSStatus(ncs, testType);

          const mappedNCS: NCSTestResult = {
            id: crypto.randomUUID(),
            nerve: this.mapNerveName(ncs.nerve),
            side: ncs.side,
            type: testType,
            latency: ncs.latency,
            amplitude: ncs.amplitude,
            velocity: ncs.velocity,
            status: status,
            findings: ncs.findings || this.generateNCSFindings(ncs, status)
          };

          ncsResults.push(mappedNCS);
          fieldsMapped++;

          formLogger.log('info', 'NCSMapper', `✅ Mapeó NCS ${index + 1}: ${ncs.nerve}`, {
            nerve: mappedNCS.nerve,
            type: mappedNCS.type,
            latency: mappedNCS.latency,
            amplitude: mappedNCS.amplitude,
            velocity: mappedNCS.velocity,
            status: mappedNCS.status
          });

        } catch (error) {
          const errorMsg = `Error mapeando NCS ${index}: ${error instanceof Error ? error.message : 'Error desconocido'}`;
          formLogger.log('error', 'NCSMapper', errorMsg, { ncs, error });
          errors.push(errorMsg);
        }
      });
    } else {
      formLogger.log('warn', 'NCSMapper', '⚠️ No se encontraron datos NCS para mapear');
      warnings.push('No se encontraron datos de neuroconducción en el archivo');
    }

    const confidence = fieldsProcessed > 0 ? (fieldsMapped / fieldsProcessed) * 100 : 0;

    formLogger.log('info', 'NCSMapper', '🎯 Mapeo NCS completado', {
      fieldsProcessed,
      fieldsMapped,
      confidence: `${confidence.toFixed(1)}%`,
      warnings: warnings.length,
      errors: errors.length
    });

    return {
      data: ncsResults,
      success: errors.length === 0,
      warnings,
      errors,
      mappingStats: {
        fieldsProcessed,
        fieldsMapped,
        fieldsSkipped: fieldsProcessed - fieldsMapped,
        confidence: confidence / 100
      }
    };
  }

  // ========================================
  // 3. MAPEAR DATOS EMG (MEJORADO)
  // ========================================
  static mapEMGData(extractedData: ExtractedFileData): MappingResult<EMGNerveRecord[]> {
    formLogger.log('info', 'EMGMapper', '🔄 Iniciando mapeo de datos EMG mejorado', {
      hasEMGResults: !!extractedData.emgResults,
      emgCount: extractedData.emgResults?.length || 0
    });

    const warnings: string[] = [];
    const errors: string[] = [];
    let fieldsProcessed = 0;
    let fieldsMapped = 0;

    const emgResults: EMGNerveRecord[] = [];

    if (extractedData.emgResults && extractedData.emgResults.length > 0) {
      extractedData.emgResults.forEach((emg, index) => {
        try {
          fieldsProcessed++;

          // ✅ VALIDAR DATOS REALES - NO INVENTAR
          if (!emg.muscle || !emg.side) {
            const error = `EMG ${index}: Datos insuficientes (muscle: ${emg.muscle}, side: ${emg.side})`;
            formLogger.log('error', 'EMGMapper', error, emg);
            errors.push(error);
            return;
          }

          // Validar rangos EMG
          const validationResult = this.validateEMGRanges(emg);
          if (validationResult.warnings.length > 0) {
            warnings.push(...validationResult.warnings);
          }

          // ✅ MAPEAR SOLO DATOS REALES
          const mappedEMG: EMGNerveRecord = {
            id: `emg_${index}_${Date.now()}`,
            muscleOrNerveName: this.mapMuscleName(emg.muscle),
            side: emg.side,
            insertionalActivity: this.mapInsertionalActivity(emg.insertionalActivity),
            spontaneousActivity: this.mapSpontaneousActivityReal(emg),
            motorUnitPotentials: this.mapMotorUnitPotentialsReal(emg),
            recruitmentPattern: this.mapRecruitmentPattern(emg.recruitmentPattern),
            interpretationNotes: 'Auto-llenado desde archivo procesado'
          };

          emgResults.push(mappedEMG);
          fieldsMapped++;

          formLogger.log('info', 'EMGMapper', `✅ Mapeó EMG ${index + 1}: ${emg.muscle}`, {
            muscle: mappedEMG.muscleOrNerveName,
            insertionalActivity: mappedEMG.insertionalActivity,
            recruitmentPattern: mappedEMG.recruitmentPattern,
            spontaneousActivity: mappedEMG.spontaneousActivity
          });

        } catch (error) {
          const errorMsg = `Error mapeando EMG ${index}: ${error instanceof Error ? error.message : 'Error desconocido'}`;
          formLogger.log('error', 'EMGMapper', errorMsg, { emg, error });
          errors.push(errorMsg);
        }
      });
    } else {
      formLogger.log('warn', 'EMGMapper', '⚠️ No se encontraron datos EMG para mapear');
      warnings.push('No se encontraron datos de electromiografía en el archivo');
    }

    const confidence = fieldsProcessed > 0 ? (fieldsMapped / fieldsProcessed) * 100 : 0;

    formLogger.log('info', 'EMGMapper', '🎯 Mapeo EMG completado', {
      fieldsProcessed,
      fieldsMapped,
      confidence: `${confidence.toFixed(1)}%`,
      warnings: warnings.length,
      errors: errors.length
    });

    return {
      data: emgResults,
      success: errors.length === 0,
      warnings,
      errors,
      mappingStats: {
        fieldsProcessed,
        fieldsMapped,
        fieldsSkipped: fieldsProcessed - fieldsMapped,
        confidence: confidence / 100
      }
    };
  }

  // ========================================
  // 4. MAPEAR ESTUDIOS ESPECIALES (MEJORADO - Solo datos reales)
  // ========================================
  static mapSpecialStudiesData(extractedData: ExtractedFileData): MappingResult<any> {
    formLogger.log('info', 'SpecialStudiesMapper', '🔄 Iniciando mapeo de estudios especiales REALES', {
      hasSpecialStudies: !!(extractedData as any).specialStudies,
      extractedKeys: Object.keys(extractedData)
    });

    const warnings: string[] = [];
    const errors: string[] = [];
    let fieldsProcessed = 0;
    let fieldsMapped = 0;

    // Estructura por defecto para estudios especiales
    const specialStudiesData = {
      notPerformed: true,
      tests: [] as any[]
    };

    // 🔍 SOLO BUSCAR ESTUDIOS ESPECIALES REALES EN LOS DATOS EXTRAÍDOS
    const specialStudiesFromFile = (extractedData as any).specialStudies;
    
    if (specialStudiesFromFile && Array.isArray(specialStudiesFromFile) && specialStudiesFromFile.length > 0) {
      try {
        fieldsProcessed++;
        
        // Mapear solo los estudios especiales que realmente aparecen en el documento
        specialStudiesData.notPerformed = false;
        specialStudiesData.tests = specialStudiesFromFile.map((study: any, index: number) => {
          const mappedStudy = {
            id: study.id || `special_study_${index}`,
            name: study.name || 'Estudio Especial',
            type: study.type || 'other',
            side: study.side || 'bilateral',
            values: study.values || {},
            status: study.status || 'normal',
            findings: study.findings || [],
            notes: study.notes || 'Extraído del documento original'
          };
          
          formLogger.log('info', 'SpecialStudiesMapper', `✅ Mapeando estudio real: ${mappedStudy.name}`, {
            type: mappedStudy.type,
            values: mappedStudy.values,
            status: mappedStudy.status
          });
          
          return mappedStudy;
        });
        
        fieldsMapped++;
        
        formLogger.log('info', 'SpecialStudiesMapper', `✅ Mapeó ${specialStudiesData.tests.length} estudios especiales REALES del documento`, specialStudiesData.tests);
        
      } catch (error) {
        const errorMsg = `Error mapeando estudios especiales: ${error instanceof Error ? error.message : 'Error desconocido'}`;
        formLogger.log('error', 'SpecialStudiesMapper', errorMsg, error);
        errors.push(errorMsg);
      }
    } else {
      // 🚫 NO INVENTAR ESTUDIOS - Solo reportar que no se encontraron
      formLogger.log('warn', 'SpecialStudiesMapper', '⚠️ No se encontraron estudios especiales en el documento');
      warnings.push('No se encontraron estudios especiales en el archivo. Los estudios especiales se dejarán como "No realizados".');
    }

    const confidence = fieldsProcessed > 0 ? (fieldsMapped / fieldsProcessed) * 100 : 0;

    formLogger.log('info', 'SpecialStudiesMapper', '🎯 Mapeo de estudios especiales completado', {
      fieldsProcessed,
      fieldsMapped,
      confidence: `${confidence.toFixed(1)}%`,
      warnings: warnings.length,
      errors: errors.length,
      notPerformed: specialStudiesData.notPerformed,
      testsCount: specialStudiesData.tests.length,
      policy: 'SOLO_DATOS_REALES_NO_INVENTAR'
    });

    return {
      data: specialStudiesData,
      success: errors.length === 0,
      warnings,
      errors,
      mappingStats: {
        fieldsProcessed,
        fieldsMapped,
        fieldsSkipped: fieldsProcessed - fieldsMapped,
        confidence: confidence / 100
      }
    };
  }

  // ========================================
  // FUNCIONES AUXILIARES MEJORADAS
  // ========================================

  private static mapSeverity(severity: string): 'mild' | 'moderate' | 'severe' {
    const normalizedSeverity = severity?.toLowerCase() || 'mild';
    if (normalizedSeverity.includes('severe') || normalizedSeverity.includes('severo') || normalizedSeverity.includes('grave')) return 'severe';
    if (normalizedSeverity.includes('moderate') || normalizedSeverity.includes('moderado')) return 'moderate';
    return 'mild';
  }

  private static inferAdditionalSymptoms(extractedData: ExtractedFileData, symptomsData: ClinicalSymptomsData) {
    // Inferir síntomas basados en datos NCS/EMG
    if (extractedData.ncsResults) {
      const hasAbnormalNCS = extractedData.ncsResults.some(ncs => ncs.status === 'abnormal');
      if (hasAbnormalNCS) {
        symptomsData.sensory.numbness.present = true;
        symptomsData.sensory.numbness.notes = 'Inferido por alteraciones en neuroconducción';
      }
    }

    if (extractedData.emgResults) {
      const hasAbnormalEMG = extractedData.emgResults.some(emg => 
        emg.spontaneousActivity?.fibrillations || emg.spontaneousActivity?.positiveWaves
      );
      if (hasAbnormalEMG) {
        symptomsData.motor.weakness.present = true;
        symptomsData.motor.weakness.notes = 'Inferido por alteraciones en electromiografía';
      }
    }
  }

  private static mapOtherSymptom(key: string, value: any, symptomsData: ClinicalSymptomsData) {
    // Mapear síntomas adicionales basados en palabras clave
    const symptomMap: { [key: string]: string } = {
      'fatigue': 'motor.fatigue',
      'cramps': 'motor.cramps',
      'tremor': 'motor.tremor',
      'burning': 'sensory.burning',
      'stiffness': 'motor.stiffness'
    };

    const mappedPath = symptomMap[key.toLowerCase()];
    if (mappedPath) {
      const [category, symptom] = mappedPath.split('.');
      if (symptomsData[category as keyof ClinicalSymptomsData][symptom]) {
        symptomsData[category as keyof ClinicalSymptomsData][symptom].present = value.present || true;
      }
    }
  }

  private static inferTestTypeAdvanced(nerve: string, ncs: any): 'motor' | 'sensory' {
    // Lógica avanzada para determinar tipo de test
    if (ncs.type) return ncs.type;
    
    // Basado en amplitud (motores típicamente > sensitivos)
    if (ncs.amplitude > 5) return 'motor';
    if (ncs.amplitude < 2) return 'sensory';
    
    // Basado en nervio
    const motorNerves = ['mediano motor', 'ulnar motor', 'radial motor'];
    const normalized = nerve.toLowerCase();
    return motorNerves.some(mn => normalized.includes(mn.split(' ')[0])) ? 'motor' : 'sensory';
  }

  private static determineNCSStatus(ncs: any, type: 'motor' | 'sensory'): 'normal' | 'abnormal' {
    // Determinar estado basado en rangos normativos
    const isMotor = type === 'motor';
    
    // Rangos normativos simplificados
    const normalRanges = {
      motor: { latency: [1, 4], amplitude: [5, 50], velocity: [50, 70] },
      sensory: { latency: [1, 3], amplitude: [10, 100], velocity: [50, 70] }
    };
    
    const ranges = normalRanges[type];
    
    if (ncs.latency > ranges.latency[1] || 
        ncs.amplitude < ranges.amplitude[0] || 
        ncs.velocity < ranges.velocity[0]) {
      return 'abnormal';
    }
    
    return 'normal';
  }

  private static generateNCSFindings(ncs: any, status: 'normal' | 'abnormal'): string[] {
    const findings: string[] = [];
    
    if (status === 'abnormal') {
      if (ncs.latency > 4) findings.push('Latencia prolongada');
      if (ncs.amplitude < 5) findings.push('Amplitud reducida');
      if (ncs.velocity < 50) findings.push('Velocidad de conducción lenta');
    }
    
    return findings;
  }

  private static mapSpontaneousActivityReal(emg: any): any {
    if (!emg.spontaneousActivity) {
      return {
        fibrillations: false,
        positiveWaves: false,
        fasciculations: false
      };
    }
    
    return {
      fibrillations: emg.spontaneousActivity.fibrillations || false,
      positiveWaves: emg.spontaneousActivity.positiveWaves || false,
      fasciculations: emg.spontaneousActivity.fasciculations || false
    };
  }

  private static mapMotorUnitPotentialsReal(emg: any): any {
    if (!emg.motorUnitPotentials) {
      return {
        amplitude: 0,
        duration: 0,
        polyphasia: 0
      };
    }
    
    return {
      amplitude: emg.motorUnitPotentials.amplitude || 0,
      duration: emg.motorUnitPotentials.duration || 0,
      polyphasia: emg.motorUnitPotentials.polyphasia || 0
    };
  }

  private static mapInsertionalActivity(activity: string): "" | "normal" | "increased" | "decreased" | "absent" {
    if (!activity) return "";
    
    const normalized = activity.toLowerCase();
    if (normalized.includes('normal')) return "normal";
    if (normalized.includes('aumentad') || normalized.includes('increased')) return "increased";
    if (normalized.includes('disminuid') || normalized.includes('decreased')) return "decreased";
    if (normalized.includes('ausente') || normalized.includes('absent')) return "absent";
    
    return "";
  }

  private static mapRecruitmentPattern(pattern: string): "" | "normal" | "reduced_incomplete" | "reduced_complete" | "early" | "discrete" {
    if (!pattern) return "";
    
    const normalized = pattern.toLowerCase();
    if (normalized.includes('normal')) return "normal";
    if (normalized.includes('reducido incompleto') || normalized.includes('reduced_incomplete')) return "reduced_incomplete";
    if (normalized.includes('reducido completo') || normalized.includes('reduced_complete')) return "reduced_complete";
    if (normalized.includes('temprano') || normalized.includes('early')) return "early";
    if (normalized.includes('discreto') || normalized.includes('discrete')) return "discrete";
    
    return "";
  }

  // ========================================
  // FUNCIONES AUXILIARES
  // ========================================

  private static mapNerveName(nerve: string): string {
    // 🎯 MAPEO EXPANDIDO DE NERVIOS PARA ARCHIVOS RTF
    const nerveMap: { [key: string]: string } = {
      // Nervios principales del brazo
      'median': 'Mediano',
      'mediano': 'Mediano',
      'median motor': 'Mediano',
      'median sensory': 'Mediano',
      'median-wrist': 'Mediano',
      'median-elbow': 'Mediano',
      
      'ulnar': 'Ulnar',
      'cubital': 'Ulnar',
      'ulnar motor': 'Ulnar',
      'ulnar sensory': 'Ulnar',
      'ulnar-wrist': 'Ulnar',
      'ulnar-elbow': 'Ulnar',
      
      'radial': 'Radial',
      'radial motor': 'Radial',
      'radial sensory': 'Radial',
      'radial-spiral groove': 'Radial',
      
      // Nervios menos comunes que aparecen en RTF
      'musculocutaneous': 'Musculocutáneo',
      'musculocutaneo': 'Musculocutáneo',
      'musculocutaneous sensory': 'Musculocutáneo',
      
      'axillary': 'Axilar',
      'axilar': 'Axilar',
      
      'suprascapular': 'Supraescapular',
      'supraescapular': 'Supraescapular',
      
      // Nervios de la pierna
      'peroneal': 'Peroneo',
      'peroneo': 'Peroneo',
      'peroneal deep': 'Peroneo Profundo',
      'peroneal superficial': 'Peroneo Superficial',
      
      'tibial': 'Tibial',
      'tibial motor': 'Tibial',
      'tibial sensory': 'Tibial',
      
      'sural': 'Sural',
      'sural sensory': 'Sural',
      
      'femoral': 'Femoral'
    };
    
    const normalized = nerve.toLowerCase().trim()
      .replace(/\s+/g, ' ') // Normalizar espacios
      .replace(/[-_]/g, ' '); // Convertir guiones y guiones bajos a espacios
    
    // Buscar coincidencia exacta primero
    if (nerveMap[normalized]) {
      return nerveMap[normalized];
    }
    
    // Buscar coincidencia parcial para nervios con especificaciones
    for (const [key, value] of Object.entries(nerveMap)) {
      if (normalized.includes(key.split(' ')[0]) && key.includes(' ')) {
        // Si encontramos el nervio base, pero con especificación (motor/sensory)
        return value;
      }
    }
    
    // Buscar por palabra clave principal
    const keywords = ['median', 'ulnar', 'radial', 'musculocutaneous', 'tibial', 'peroneal', 'sural'];
    for (const keyword of keywords) {
      if (normalized.includes(keyword)) {
        const mapped = nerveMap[keyword];
        if (mapped) return mapped;
      }
    }
    
    // 🔧 LIMPIEZA Y CAPITALIZACIÓN INTELIGENTE
    // Si no se encuentra en el mapeo, limpiar y capitalizar
    const cleaned = nerve.trim()
      .replace(/[-_]/g, ' ')
      .replace(/\s+/g, ' ')
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
      
    return cleaned;
  }

  private static mapMuscleName(muscle: string): string {
    // 🎯 MAPEO EXPANDIDO DE MÚSCULOS PARA ARCHIVOS RTF
    const muscleMap: { [key: string]: string } = {
      // Músculos del hombro y brazo
      'deltoid': 'Deltoid',
      'supraspinatus': 'Supraspinatus',
      'biceps brachi.': 'Biceps Brachii',
      'biceps': 'Biceps Brachii',
      'triceps': 'Triceps',
      
      // Músculos del antebrazo
      'pronator teres': 'Pronator Teres',
      'pronator ter.': 'Pronator Teres',
      'flexor carpi radialis': 'Flexor Carpi Radialis',
      'flexor carpi ulnaris': 'Flexor Carpi Ulnaris',
      'flx.car.uln': 'Flexor Carpi Ulnaris',
      'extensor indicis proprius': 'Extensor Indicis Proprius',
      'ext.ind.pro.': 'Extensor Indicis Proprius',
      'extensor indicis': 'Extensor Indicis Proprius',
      
      // Músculos de la mano
      'abductor pollicis brevis': 'Abductor Pollicis Brevis',
      'abd.pol.br.': 'Abductor Pollicis Brevis',
      'first dorsal interosseous': '1er Interóseo Dorsal',
      'dors.int.1': '1er Interóseo Dorsal',
      '1st dors int': '1er Interóseo Dorsal',
      
      // Músculos paraespinales
      'paraspinals': 'Paraspinals',
      'parasp': 'Paraspinals',
      'paraspinals c6': 'Paraspinals C6',
      'paraspinals c7': 'Paraspinals C7',
      'paraspinals c8': 'Paraspinals C8',
      
      // Músculos de la pierna (para casos futuros)
      'tibialis anterior': 'Tibialis Anterior',
      'gastrocnemius': 'Gastrocnemius',
      'vastus lateralis': 'Vastus Lateralis',
      'vastus lat.': 'Vastus Lateralis',
      
      // Variaciones comunes en RTF
      'bicep': 'Biceps Brachii',
      'tricep': 'Triceps'
    };
    
    const normalized = muscle.toLowerCase().trim();
    
    // Buscar coincidencia exacta primero
    if (muscleMap[normalized]) {
      return muscleMap[normalized];
    }
    
    // Buscar coincidencia parcial (útil para abreviaciones)
    for (const [key, value] of Object.entries(muscleMap)) {
      if (normalized.includes(key) || key.includes(normalized)) {
        return value;
      }
    }
    
    // 🔧 LIMPIEZA Y CAPITALIZACIÓN INTELIGENTE
    // Si no se encuentra en el mapeo, limpiar y capitalizar
    const cleaned = muscle.trim()
      .replace(/\.$/, '') // Remover punto final
      .replace(/\s+/g, ' ') // Normalizar espacios
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
      
    return cleaned;
  }

  private static validateNCSRanges(ncs: any): { warnings: string[] } {
    const warnings: string[] = [];
    
    // Validar latencia (1-50ms normal)
    if (ncs.latency && (ncs.latency < 1 || ncs.latency > 50)) {
      warnings.push(`Latencia fuera de rango normal: ${ncs.latency}ms (rango: 1-50ms)`);
    }
    
    // Validar amplitud motor (0.1-50mV normal)
    if (ncs.amplitude && (ncs.amplitude < 0.1 || ncs.amplitude > 50)) {
      warnings.push(`Amplitud fuera de rango normal: ${ncs.amplitude}mV (rango: 0.1-50mV)`);
    }
    
    // Validar velocidad (20-120m/s normal)
    if (ncs.velocity && (ncs.velocity < 20 || ncs.velocity > 120)) {
      warnings.push(`Velocidad fuera de rango normal: ${ncs.velocity}m/s (rango: 20-120m/s)`);
    }
    
    return { warnings };
  }

  private static validateEMGRanges(emg: any): { warnings: string[] } {
    const warnings: string[] = [];
    
    // Validar amplitud PUM (500-5000µV normal)
    if (emg.motorUnitPotentials?.amplitude) {
      const amp = emg.motorUnitPotentials.amplitude;
      if (amp < 500 || amp > 5000) {
        warnings.push(`Amplitud PUM fuera de rango: ${amp}µV (rango: 500-5000µV)`);
      }
    }
    
    // Validar duración PUM (5-25ms normal)
    if (emg.motorUnitPotentials?.duration) {
      const dur = emg.motorUnitPotentials.duration;
      if (dur < 5 || dur > 25) {
        warnings.push(`Duración PUM fuera de rango: ${dur}ms (rango: 5-25ms)`);
      }
    }
    
    return { warnings };
  }

  // ========================================
  // FUNCIÓN ELIMINADA - NO INVENTAR ESTUDIOS ESPECIALES
  // ========================================
  // La función inferSpecialStudiesFromData ha sido eliminada porque 
  // el usuario requiere que SOLO se extraigan estudios especiales 
  // que realmente aparecen en el documento, no que se inventen automáticamente.
  //
  // Política: SOLO_DATOS_REALES_NO_INVENTAR
} 