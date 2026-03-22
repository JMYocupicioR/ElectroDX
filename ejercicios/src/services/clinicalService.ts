import { ClinicalEvaluation, NCSResults, EMGResults, DiagnosticCriteria, IntegratedDiagnosis } from '../types/clinical';
import { clinicalEvaluationSchema, ncsResultsSchema, emgResultsSchema, diagnosticCriteriaSchema, integratedDiagnosisSchema } from '../schemas/clinical';
import { 
  PhysiologicalValidator, 
  ValidationResult, 
  ValidationError,
  validationService 
} from './validationService';
import { PHYSIOLOGICAL_RANGES } from '../data/emgClinicalCriteria';

export class ClinicalService {
  static validateClinicalEvaluation(data: ClinicalEvaluation) {
    // Validar datos básicos
    if (!data.preliminaryDiagnosis) {
      throw new Error('El diagnóstico preliminar es requerido');
    }

    // Validar datos del examen físico
    if (data.clinicalFindings) {
      const { muscleTone, muscleStrength, reflexes, coordination, gait } = data.clinicalFindings;

      // Validar tono muscular
      if (!muscleTone || !['normal', 'increased', 'decreased'].includes(muscleTone.status)) {
        throw new Error('Estado del tono muscular inválido');
      }

      // Validar fuerza muscular
      if (muscleStrength && muscleStrength.affectedMuscles) {
        for (const muscle of muscleStrength.affectedMuscles) {
          if (muscle.mrcGrade < 0 || muscle.mrcGrade > 5) {
            throw new Error(`Grado MRC inválido para el músculo ${muscle.muscle}`);
          }
        }
      }

      // Validar reflejos
      if (reflexes) {
        const validReflexValues = ['normal', 'increased', 'decreased', 'absent'];
        for (const [reflex, value] of Object.entries(reflexes)) {
          if (!validReflexValues.includes(value)) {
            throw new Error(`Valor inválido para el reflejo ${reflex}`);
          }
        }
      }

      // Validar coordinación
      if (coordination) {
        const validCoordinationValues = ['normal', 'abnormal'];
        for (const [test, value] of Object.entries(coordination)) {
          if (!validCoordinationValues.includes(value)) {
            throw new Error(`Valor inválido para la prueba de coordinación ${test}`);
          }
        }
      }

      // Validar marcha
      if (gait) {
        if (!['normal', 'abnormal'].includes(gait.pattern)) {
          throw new Error('Patrón de marcha inválido');
        }
      }
    }
  }

  // 🔥 VALIDACIÓN NCS MEJORADA
  static validateNCSResults(data: NCSResults, patientAge?: number): ValidationResult[] {
    const validationResults: ValidationResult[] = [];

    try {
      // Validación de esquema básico
      ncsResultsSchema.parse(data);
    } catch (error) {
      validationResults.push({
        isValid: false,
        severity: 'error',
        message: `Error de esquema NCS: ${error instanceof Error ? error.message : 'Error desconocido'}`,
        expectedRange: 'esquema válido',
        actualValue: 0,
        field: 'schema'
      });
    }

    // Validaciones fisiológicas para datos motores
    if (data.motor) {
      const motorValidations = PhysiologicalValidator.validateNCSValues({
        type: 'motor',
        latency: data.motor.latency,
        amplitude: data.motor.amplitude,
        velocity: data.motor.conductionVelocity
      }, patientAge);
      validationResults.push(...motorValidations);
    }

    // Validaciones fisiológicas para datos sensitivos
    if (data.sensory) {
      const sensoryValidations = PhysiologicalValidator.validateNCSValues({
        type: 'sensory',
        latency: data.sensory.latency,
        amplitude: data.sensory.amplitude,
        velocity: data.sensory.conductionVelocity
      }, patientAge);
      validationResults.push(...sensoryValidations);
    }

    return validationResults;
  }

  // 🔥 VALIDACIÓN EMG MEJORADA CON RANGOS FISIOLÓGICOS
  static validateEMGResults(data: EMGResults, patientAge?: number): ValidationResult[] {
    const validationResults: ValidationResult[] = [];

    // Validar que existan músculos evaluados
    if (!data.muscles || Object.keys(data.muscles).length === 0) {
      validationResults.push({
        isValid: false,
        severity: 'error',
        message: 'Se requiere al menos un músculo evaluado',
        expectedRange: 'al menos 1 músculo',
        actualValue: 0,
        field: 'muscles'
      });
      return validationResults;
    }

    // Validar cada músculo evaluado
    Object.entries(data.muscles).forEach(([muscleName, muscleData]) => {
      // Validaciones básicas de existencia
      if (!muscleData.insertionalActivity) {
        validationResults.push({
          isValid: false,
          severity: 'error',
          message: `La actividad de inserción es requerida para ${muscleName}`,
          expectedRange: 'campo requerido',
          actualValue: 0,
          field: `${muscleName}.insertionalActivity`
        });
      }

      if (!muscleData.motorUnitAnalysis?.recruitment) {
        validationResults.push({
          isValid: false,
          severity: 'error',
          message: `El patrón de reclutamiento es requerido para ${muscleName}`,
          expectedRange: 'campo requerido',
          actualValue: 0,
          field: `${muscleName}.recruitment`
        });
      }

      // 🔥 VALIDACIONES FISIOLÓGICAS MEJORADAS
      if (muscleData.motorUnitAnalysis) {
        const emgValidations = PhysiologicalValidator.validateEMGValues({
          motorUnitPotentials: {
            duration: muscleData.motorUnitAnalysis.duration,
            amplitude: muscleData.motorUnitAnalysis.amplitude,
            polyphasia: muscleData.motorUnitAnalysis.polyphasia === 'increased' ? 50 : 15 // Estimación
          },
          insertionalActivity: muscleData.insertionalActivity,
          spontaneousActivity: muscleData.spontaneousActivity
        }, patientAge);
        
        // Prefijo con nombre del músculo
        emgValidations.forEach(validation => {
          validation.field = `${muscleName}.${validation.field}`;
        });
        
        validationResults.push(...emgValidations);

        // Validaciones específicas adicionales
        if (muscleData.motorUnitAnalysis.amplitude < 0) {
          validationResults.push({
            isValid: false,
            severity: 'error',
            message: `La amplitud no puede ser negativa en ${muscleName}`,
            expectedRange: '≥ 0 μV',
            actualValue: muscleData.motorUnitAnalysis.amplitude,
            field: `${muscleName}.amplitude`,
            suggestions: ['Verificar calibración del equipo', 'Revisar conexiones de electrodos']
          });
        }

        if (muscleData.motorUnitAnalysis.duration < 0) {
          validationResults.push({
            isValid: false,
            severity: 'error',
            message: `La duración no puede ser negativa en ${muscleName}`,
            expectedRange: '≥ 0 ms',
            actualValue: muscleData.motorUnitAnalysis.duration,
            field: `${muscleName}.duration`,
            suggestions: ['Verificar calibración del equipo', 'Revisar configuración de tiempo']
          });
        }
      }

      // 🔥 VALIDACIÓN DE CONSISTENCIA INTERNA
      if (muscleData.insertionalActivity === 'normal' && 
          muscleData.spontaneousActivity && 
          (muscleData.spontaneousActivity.fibrillations === 'present' || 
           muscleData.spontaneousActivity.positiveWaves === 'present')) {
        validationResults.push({
          isValid: false,
          severity: 'warning',
          message: `Posible inconsistencia en ${muscleName}: actividad insertional normal pero actividad espontánea anormal`,
          expectedRange: 'consistencia lógica',
          actualValue: 0,
          field: `${muscleName}.consistency`,
          suggestions: [
            'Verificar técnica de inserción de aguja',
            'Revisar identificación de potenciales espontáneos',
            'Considerar re-evaluar la actividad insertional'
          ]
        });
      }
    });

    return validationResults;
  }

  // 🔥 MÉTODO AUXILIAR PARA VALIDAR CONSISTENCIA NCS-EMG
  static validateNCSEMGConsistency(
    ncsData: NCSResults, 
    emgData: EMGResults,
    patientAge?: number
  ): ValidationResult[] {
    const validationResults: ValidationResult[] = [];

    // Validar que EMG anormal correlacione con NCS severamente anormal
    const hasAbnormalNCS = (ncsData.motor?.amplitude && ncsData.motor.amplitude < 2) ||
                          (ncsData.sensory?.amplitude && ncsData.sensory.amplitude < 5) ||
                          (ncsData.motor?.conductionVelocity && ncsData.motor.conductionVelocity < 30);

    // Verificar si el EMG es normal evaluando todos los músculos
    const muscleEntries = Object.values(emgData.muscles);
    const hasNormalEMG = muscleEntries.every(muscle => 
      muscle.insertionalActivity === 'normal' &&
      muscle.motorUnitAnalysis?.recruitment === 'normal' &&
      muscle.spontaneousActivity?.fibrillations === 'absent' &&
      muscle.spontaneousActivity?.positiveWaves === 'absent'
    );

    if (hasAbnormalNCS && hasNormalEMG) {
      validationResults.push({
        isValid: false,
        severity: 'warning',
        message: 'Posible inconsistencia: NCS severamente anormal pero EMG normal',
        expectedRange: 'consistencia clínica',
        actualValue: 0,
        field: 'ncs_emg_consistency',
        suggestions: [
          'Verificar que ambos estudios correspondan al mismo paciente/región',
          'Considerar si el EMG fue realizado en músculos apropiados',
          'Evaluar si hay bloqueo de conducción proximal',
          'Revisar la técnica de ambos estudios'
        ]
      });
    }

    // Validar correlación de severidad
    const ncsAmplitudeReduction = ncsData.motor?.amplitude ? 
      ((10 - ncsData.motor.amplitude) / 10) * 100 : 0; // Asumiendo 10mV como normal
    
    const emgSeverity = emgData.motorUnitPotentials?.amplitude > 5000 ? 'severe' :
                       emgData.motorUnitPotentials?.amplitude > 2000 ? 'moderate' : 'mild';

    if (ncsAmplitudeReduction > 70 && emgSeverity === 'mild') {
      validationResults.push({
        isValid: false,
        severity: 'info',
        message: 'NCS sugiere lesión severa pero EMG sugiere cambios leves',
        expectedRange: 'correlación de severidad',
        actualValue: ncsAmplitudeReduction,
        field: 'severity_correlation',
        suggestions: [
          'Considerar cronología de la lesión',
          'Evaluar si hay reinervación en curso',
          'Verificar técnica de ambos estudios'
        ]
      });
    }

    return validationResults;
  }

  static evaluateDiagnosticCriteria(clinicalData: ClinicalEvaluation): DiagnosticCriteria {
    const criteria: DiagnosticCriteria = {
      canSkipEMG: false,
      reasons: [],
      requiresEMG: false,
      emgReasons: []
    };

    // Criterios para saltar EMG
    if (this.isPureSensoryNeuropathy(clinicalData)) {
      criteria.canSkipEMG = true;
      criteria.reasons.push('Neuropatía sensitiva pura sin debilidad');
    }

    if (this.isTypicalBilateralPattern(clinicalData)) {
      criteria.canSkipEMG = true;
      criteria.reasons.push('Patrón típico bilateral de polineuropatía distal simétrica');
    }

    if (this.isMildModerateCTS(clinicalData)) {
      criteria.canSkipEMG = true;
      criteria.reasons.push('Síndrome del túnel del carpo leve/moderado sin datos axonales');
    }

    // Criterios que requieren EMG
    if (this.hasMuscleWeakness(clinicalData)) {
      criteria.requiresEMG = true;
      criteria.emgReasons.push('Presencia de debilidad muscular');
    }

    if (this.suspectedRadiculopathy(clinicalData)) {
      criteria.requiresEMG = true;
      criteria.emgReasons.push('Sospecha de radiculopatía');
    }

    if (this.suspectedPlexopathy(clinicalData)) {
      criteria.requiresEMG = true;
      criteria.emgReasons.push('Sospecha de plexopatía');
    }

    if (this.suspectedMyopathy(clinicalData)) {
      criteria.requiresEMG = true;
      criteria.emgReasons.push('Sospecha de miopatía');
    }

    return criteria;
  }

  private static isPureSensoryNeuropathy(data: ClinicalEvaluation): boolean {
    return (
      data.reasonForStudy.sensory.present &&
      !data.reasonForStudy.weakness.present &&
      data.clinicalFindings.muscleStrength.affectedMuscles.length === 0
    );
  }

  private static isTypicalBilateralPattern(data: ClinicalEvaluation): boolean {
    const { weakness, sensory } = data.reasonForStudy;
    return (
      (weakness.present || sensory.present) &&
      weakness.distribution.every(d => d.includes('distal')) &&
      sensory.distribution.every(d => d.includes('distal'))
    );
  }

  private static isMildModerateCTS(data: ClinicalEvaluation): boolean {
    return (
      data.preliminaryDiagnosis.toLowerCase().includes('síndrome del túnel del carpo') &&
      !data.reasonForStudy.weakness.present &&
      data.clinicalFindings.muscleStrength.affectedMuscles.length === 0
    );
  }

  private static hasMuscleWeakness(data: ClinicalEvaluation): boolean {
    return (
      data.reasonForStudy.weakness.present ||
      data.clinicalFindings.muscleStrength.affectedMuscles.some(m => m.mrcGrade < 5)
    );
  }

  private static suspectedRadiculopathy(data: ClinicalEvaluation): boolean {
    const { muscleStrength, reflexes } = data.clinicalFindings;
    return (
      muscleStrength.affectedMuscles.some(m => m.mrcGrade < 5) &&
      Object.values(reflexes).some(r => r !== 'normal')
    );
  }

  private static suspectedPlexopathy(data: ClinicalEvaluation): boolean {
    const { muscleStrength } = data.clinicalFindings;
    const affectedMuscles = muscleStrength.affectedMuscles;
    
    // Verificar si hay debilidad en músculos inervados por diferentes raíces
    const muscleRoots = new Set();
    affectedMuscles.forEach(m => {
      const muscleData = muscleDatabase.find(md => md.name === m.muscle);
      if (muscleData) {
        muscleData.associatedRoots.forEach(root => muscleRoots.add(root));
      }
    });

    return muscleRoots.size > 1;
  }

  private static suspectedMyopathy(data: ClinicalEvaluation): boolean {
    const { muscleStrength, reflexes } = data.clinicalFindings;
    return (
      muscleStrength.affectedMuscles.some(m => m.mrcGrade < 5) &&
      Object.values(reflexes).every(r => r === 'normal')
    );
  }

  static generateIntegratedDiagnosis(
    clinicalData: ClinicalEvaluation,
    ncsData: NCSResults,
    emgData?: EMGResults,
    patientAge?: number
  ): IntegratedDiagnosis {
    const diagnosis: IntegratedDiagnosis = {
      clinicalCorrelation: '',
      lesionType: 'mixed',
      pathologyType: 'mixed',
      severity: 'moderate',
      chronicity: 'chronic',
      distribution: [],
      finalDiagnosis: '',
      recommendations: []
    };

    // 🔥 VALIDACIÓN PREVIA CON RANGOS FISIOLÓGICOS
    const ncsValidations = this.validateNCSResults(ncsData, patientAge);
    const emgValidations = emgData ? this.validateEMGResults(emgData, patientAge) : [];
    const consistencyValidations = emgData ? 
      this.validateNCSEMGConsistency(ncsData, emgData, patientAge) : [];

    // Agregar advertencias si hay problemas de validación
    const criticalValidations = [...ncsValidations, ...emgValidations, ...consistencyValidations]
      .filter(v => v.severity === 'error' || v.severity === 'critical');

    if (criticalValidations.length > 0) {
      diagnosis.recommendations.push(
        `⚠️ ADVERTENCIA: Se detectaron ${criticalValidations.length} problemas de validación que pueden afectar la interpretación`
      );
    }

    // Análisis de tipo de lesión
    if (this.isAxonalInjury(ncsData)) {
      diagnosis.lesionType = 'axonal';
    } else if (this.isDemyelinatingInjury(ncsData)) {
      diagnosis.lesionType = 'demyelinating';
    }

    // Análisis de tipo de patología
    if (emgData) {
      if (this.isNeuropathicPattern(emgData)) {
        diagnosis.pathologyType = 'neuropathic';
      } else if (this.isMyopathicPattern(emgData)) {
        diagnosis.pathologyType = 'myopathic';
      }
    }

    // Determinar severidad
    diagnosis.severity = this.determineSeverity(clinicalData, ncsData, emgData);

    // Determinar cronicidad
    diagnosis.chronicity = this.determineChronicity(clinicalData);

    // Generar diagnóstico final
    diagnosis.finalDiagnosis = this.generateFinalDiagnosis(diagnosis);

    // Generar recomendaciones
    diagnosis.recommendations.push(...this.generateRecommendations(diagnosis));

    return diagnosis;
  }

  private static isAxonalInjury(ncsData: NCSResults): boolean {
    return (
      ncsData.motor.amplitude < 50 ||
      ncsData.sensory.amplitude < 10
    );
  }

  private static isDemyelinatingInjury(ncsData: NCSResults): boolean {
    return (
      ncsData.motor.conductionVelocity < 40 ||
      ncsData.sensory.conductionVelocity < 40
    );
  }

  private static isNeuropathicPattern(emgData: EMGResults): boolean {
    return (
      emgData.spontaneousActivity.fibrillations ||
      emgData.spontaneousActivity.positiveWaves ||
      emgData.motorUnitPotentials.amplitude > 1000
    );
  }

  private static isMyopathicPattern(emgData: EMGResults): boolean {
    return (
      emgData.motorUnitPotentials.amplitude < 500 &&
      emgData.motorUnitPotentials.duration < 5 &&
      emgData.motorUnitPotentials.polyphasia > 20
    );
  }

  private static determineSeverity(
    clinicalData: ClinicalEvaluation,
    ncsData: NCSResults,
    emgData?: EMGResults
  ): 'mild' | 'moderate' | 'severe' {
    // Implementar lógica de severidad basada en datos clínicos y electrofisiológicos
    return 'moderate';
  }

  private static determineChronicity(
    clinicalData: ClinicalEvaluation
  ): 'acute' | 'subacute' | 'chronic' {
    // Implementar lógica de cronicidad basada en datos clínicos
    return 'chronic';
  }

  private static generateFinalDiagnosis(diagnosis: IntegratedDiagnosis): string {
    // Implementar lógica para generar diagnóstico final
    return 'Diagnóstico pendiente';
  }

  private static generateRecommendations(diagnosis: IntegratedDiagnosis): string[] {
    // Implementar lógica para generar recomendaciones
    return ['Seguimiento clínico', 'Estudios complementarios según evolución'];
  }
} 