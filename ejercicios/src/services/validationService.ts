import { Patient, Study, PatientStudy } from '../types';
import { emptyPatient } from '../types/patient';
import { 
  PHYSIOLOGICAL_RANGES, 
  ValidationResult as ImportedValidationResult, 
  ValidationSeverity,
  calculateSeverityLevel,
  SEVERITY_THRESHOLDS,
  getAgeCategory,
  AGE_STRATIFIED_REFERENCES
} from '../data/emgClinicalCriteria';

// Re-exportar ValidationResult para uso externo
export type ValidationResult = ImportedValidationResult;

export class ValidationError extends Error {
  constructor(message: string, public readonly field?: string, public readonly severity?: ValidationSeverity) {
    super(message);
    this.name = 'ValidationError';
  }
}

// 🔥 NUEVA CLASE PARA VALIDACIONES FISIOLÓGICAS
export class PhysiologicalValidator {
  /**
   * Valida un valor contra rangos fisiológicos y retorna resultado detallado
   */
  static validateRange(
    value: number, 
    range: { min: number; max: number; unit: string }, 
    fieldName: string,
    context?: { patientAge?: number; testType?: string }
  ): ValidationResult {
    const isValid = value >= range.min && value <= range.max;
    
    if (isValid) {
      return {
        isValid: true,
        severity: 'info',
        message: `${fieldName} dentro del rango normal`,
        expectedRange: `${range.min}-${range.max} ${range.unit}`,
        actualValue: value,
        field: fieldName
      };
    }

    // Calcular severidad basada en desviación del rango
    const severityLevel = calculateSeverityLevel(value, range);
    const severity: ValidationSeverity = severityLevel === 'critical' ? 'critical' : 
                                       severityLevel === 'severe' ? 'error' : 
                                       severityLevel === 'moderate' ? 'warning' : 'info';

    // Generar mensaje específico
    const deviation = value < range.min ? 'por debajo' : 'por encima';
    const message = `${fieldName} ${deviation} del rango fisiológico normal (${value} ${range.unit})`;

    // Sugerencias específicas
    const suggestions = this.generateSuggestions(fieldName, value, range, context);

    return {
      isValid: false,
      severity,
      message,
      expectedRange: `${range.min}-${range.max} ${range.unit}`,
      actualValue: value,
      field: fieldName,
      suggestions
    };
  }

  /**
   * Genera sugerencias específicas basadas en el tipo de error
   */
  private static generateSuggestions(
    fieldName: string, 
    value: number, 
    range: { min: number; max: number; unit: string },
    context?: { patientAge?: number; testType?: string }
  ): string[] {
    const suggestions: string[] = [];
    
    if (fieldName.toLowerCase().includes('latencia')) {
      if (value > range.max) {
        suggestions.push('Verificar la colocación de electrodos y distancia de estimulación');
        suggestions.push('Considerar neuropatía desmielinizante si el valor es muy alto');
        suggestions.push('Revisar temperatura de la extremidad (< 32°C puede prolongar latencias)');
      } else if (value < range.min) {
        suggestions.push('Verificar calibración del equipo');
        suggestions.push('Confirmar identificación correcta del potencial');
      }
    } else if (fieldName.toLowerCase().includes('amplitud')) {
      if (value < range.min) {
        suggestions.push('Considerar pérdida axonal si la amplitud está muy reducida');
        suggestions.push('Verificar impedancia de electrodos');
        suggestions.push('Evaluar posible bloqueo de conducción');
      } else if (value > range.max) {
        suggestions.push('Verificar calibración del amplificador');
        suggestions.push('Revisar artefactos de estimulación');
      }
    } else if (fieldName.toLowerCase().includes('velocidad')) {
      if (value < range.min) {
        suggestions.push('Considerar desmielinización si la velocidad está muy reducida');
        suggestions.push('Verificar temperatura de la extremidad');
        suggestions.push('Revisar distancia de medición entre puntos de estimulación');
      }
    }

    // Sugerencias generales
    if (context?.patientAge && context.patientAge > 60) {
      suggestions.push('Considerar corrección por edad para pacientes > 60 años');
    }

    return suggestions;
  }

  /**
   * Valida datos NCS con rangos específicos por tipo de nervio
   */
  static validateNCSValues(results: any, patientAge?: number): ValidationResult[] {
    const validationResults: ValidationResult[] = [];
    const ranges = PHYSIOLOGICAL_RANGES.ncs;

    if (results.latency !== undefined) {
      const range = results.type === 'motor' ? ranges.motor.latency : ranges.sensory.latency;
      validationResults.push(
        this.validateRange(results.latency, range, 'Latencia', { patientAge, testType: results.type })
      );
    }

    if (results.amplitude !== undefined) {
      const range = results.type === 'motor' ? ranges.motor.amplitude : ranges.sensory.amplitude;
      validationResults.push(
        this.validateRange(results.amplitude, range, 'Amplitud', { patientAge, testType: results.type })
      );
    }

    if (results.velocity !== undefined) {
      const range = results.type === 'motor' ? ranges.motor.velocity : ranges.sensory.velocity;
      validationResults.push(
        this.validateRange(results.velocity, range, 'Velocidad', { patientAge, testType: results.type })
      );
    }

    return validationResults;
  }

  /**
   * Valida datos EMG con ajustes por edad
   */
  static validateEMGValues(results: any, patientAge?: number): ValidationResult[] {
    const validationResults: ValidationResult[] = [];
    const ranges = PHYSIOLOGICAL_RANGES.emg.motorUnitPotentials;

    // Obtener rangos ajustados por edad si se proporciona la edad
    let adjustedRanges = ranges;
    if (patientAge) {
      const ageCategory = getAgeCategory(patientAge);
      const ageRefs = AGE_STRATIFIED_REFERENCES.motorUnitPotentials;
      
      adjustedRanges = {
        duration: { 
          min: ranges.duration.min, 
          max: ageRefs.duration[ageCategory].upperLimit, 
          unit: ranges.duration.unit 
        },
        amplitude: { 
          min: ageRefs.amplitude[ageCategory].lowerLimit, 
          max: ranges.amplitude.max, 
          unit: ranges.amplitude.unit 
        },
        polyphasia: ranges.polyphasia
      };
    }

    if (results.motorUnitPotentials?.duration !== undefined) {
      validationResults.push(
        this.validateRange(
          results.motorUnitPotentials.duration, 
          adjustedRanges.duration, 
          'Duración PUM', 
          { patientAge }
        )
      );
    }

    if (results.motorUnitPotentials?.amplitude !== undefined) {
      validationResults.push(
        this.validateRange(
          results.motorUnitPotentials.amplitude, 
          adjustedRanges.amplitude, 
          'Amplitud PUM', 
          { patientAge }
        )
      );
    }

    if (results.motorUnitPotentials?.polyphasia !== undefined) {
      validationResults.push(
        this.validateRange(
          results.motorUnitPotentials.polyphasia, 
          adjustedRanges.polyphasia, 
          'Polifasia PUM', 
          { patientAge }
        )
      );
    }

    return validationResults;
  }
}

class ValidationService {
  private static instance: ValidationService;

  private constructor() {}

  public static getInstance(): ValidationService {
    if (!ValidationService.instance) {
      ValidationService.instance = new ValidationService();
    }
    return ValidationService.instance;
  }

  public validatePatient(patient: Partial<Patient>): void {
    if (!patient.firstName?.trim()) {
      throw new ValidationError('El nombre es requerido', 'firstName');
    }
    if (!patient.lastName?.trim()) {
      throw new ValidationError('El apellido es requerido', 'lastName');
    }
    if (!patient.dateOfBirth) {
      throw new ValidationError('La fecha de nacimiento es requerida', 'dateOfBirth');
    }
    if (patient.dateOfBirth && new Date(patient.dateOfBirth) > new Date()) {
      throw new ValidationError('La fecha de nacimiento no puede ser futura', 'dateOfBirth');
    }
    if (!patient.contact?.phone?.trim()) {
      throw new ValidationError('El teléfono es requerido', 'contact.phone');
    }

    // 🔥 NUEVA VALIDACIÓN: Edad fisiológica
    if (patient.dateOfBirth) {
      const age = this.calculateAge(patient.dateOfBirth);
      const ageValidation = PhysiologicalValidator.validateRange(
        age, 
        PHYSIOLOGICAL_RANGES.general.age, 
        'Edad del paciente'
      );
      if (!ageValidation.isValid && ageValidation.severity === 'critical') {
        throw new ValidationError(ageValidation.message, 'dateOfBirth', ageValidation.severity);
      }
    }
  }

  public validateStudy(study: Partial<Study>): void {
    if (!study.type) {
      throw new ValidationError('El tipo de estudio es requerido', 'type');
    }
    if (!study.date) {
      throw new ValidationError('La fecha del estudio es requerida', 'date');
    }
    if (study.date && new Date(study.date) > new Date()) {
      throw new ValidationError('La fecha del estudio no puede ser futura', 'date');
    }
    if (!study.patientId) {
      throw new ValidationError('El ID del paciente es requerido', 'patientId');
    }
  }

  public validatePatientStudy(patientStudy: Partial<PatientStudy>): void {
    if (!patientStudy.patientId) {
      throw new ValidationError('El ID del paciente es requerido', 'patientId');
    }
    if (!patientStudy.studyType) {
      throw new ValidationError('El tipo de estudio es requerido', 'studyType');
    }
    if (!patientStudy.studyData) {
      throw new ValidationError('Los datos del estudio son requeridos', 'studyData');
    }
    this.validateStudy(patientStudy.studyData);
  }

  public validateAIAnalysis(analysis: any): void {
    if (!analysis.content?.trim()) {
      throw new ValidationError('El contenido del análisis es requerido', 'content');
    }
    if (!analysis.timestamp) {
      throw new ValidationError('La fecha del análisis es requerida', 'timestamp');
    }
    if (analysis.timestamp && new Date(analysis.timestamp) > new Date()) {
      throw new ValidationError('La fecha del análisis no puede ser futura', 'timestamp');
    }
  }

  // 🔥 VALIDACIÓN EMG MEJORADA CON RANGOS FISIOLÓGICOS
  public validateEMGResults(results: any, patientAge?: number): ValidationResult[] {
    const errors: ValidationResult[] = [];

    // Validaciones de existencia (mantener compatibilidad)
    if (!results.muscle) {
      errors.push({
        isValid: false,
        severity: 'error',
        message: 'El músculo es requerido',
        expectedRange: 'campo requerido',
        actualValue: 0,
        field: 'muscle'
      });
    }
    if (!results.side) {
      errors.push({
        isValid: false,
        severity: 'error',
        message: 'El lado es requerido',
        expectedRange: 'campo requerido',
        actualValue: 0,
        field: 'side'
      });
    }
    if (!results.insertionalActivity) {
      errors.push({
        isValid: false,
        severity: 'error',
        message: 'La actividad insertional es requerida',
        expectedRange: 'campo requerido',
        actualValue: 0,
        field: 'insertionalActivity'
      });
    }
    if (!results.spontaneousActivity) {
      errors.push({
        isValid: false,
        severity: 'error',
        message: 'La actividad espontánea es requerida',
        expectedRange: 'campo requerido',
        actualValue: 0,
        field: 'spontaneousActivity'
      });
    }

    // 🔥 NUEVAS VALIDACIONES FISIOLÓGICAS
    const physiologicalValidations = PhysiologicalValidator.validateEMGValues(results, patientAge);
    errors.push(...physiologicalValidations);

    // Validación de consistencia interna
    if (results.insertionalActivity === 'absent' && 
        (results.spontaneousActivity?.fibrillations || results.spontaneousActivity?.positiveWaves)) {
      errors.push({
        isValid: false,
        severity: 'warning',
        message: 'Inconsistencia: actividad insertional ausente pero actividad espontánea presente',
        expectedRange: 'consistencia lógica',
        actualValue: 0,
        field: 'consistency',
        suggestions: ['Verificar la técnica de inserción de aguja', 'Revisar los hallazgos de actividad espontánea']
      });
    }

    return errors;
  }

  // 🔥 VALIDACIÓN NCS MEJORADA CON RANGOS FISIOLÓGICOS
  public validateNCSResults(results: any, patientAge?: number): ValidationResult[] {
    const errors: ValidationResult[] = [];

    // Validaciones de existencia (mantener compatibilidad)
    if (!results.nerve) {
      errors.push({
        isValid: false,
        severity: 'error',
        message: 'El nervio es requerido',
        expectedRange: 'campo requerido',
        actualValue: 0,
        field: 'nerve'
      });
    }
    if (!results.side) {
      errors.push({
        isValid: false,
        severity: 'error',
        message: 'El lado es requerido',
        expectedRange: 'campo requerido',
        actualValue: 0,
        field: 'side'
      });
    }
    if (results.latency === undefined) {
      errors.push({
        isValid: false,
        severity: 'error',
        message: 'La latencia es requerida',
        expectedRange: 'campo requerido',
        actualValue: 0,
        field: 'latency'
      });
    }
    if (results.amplitude === undefined) {
      errors.push({
        isValid: false,
        severity: 'error',
        message: 'La amplitud es requerida',
        expectedRange: 'campo requerido',
        actualValue: 0,
        field: 'amplitude'
      });
    }
    if (results.velocity === undefined) {
      errors.push({
        isValid: false,
        severity: 'error',
        message: 'La velocidad es requerida',
        expectedRange: 'campo requerido',
        actualValue: 0,
        field: 'velocity'
      });
    }

    // 🔥 NUEVAS VALIDACIONES FISIOLÓGICAS
    const physiologicalValidations = PhysiologicalValidator.validateNCSValues(results, patientAge);
    errors.push(...physiologicalValidations);

    return errors;
  }

  // 🔥 MÉTODO AUXILIAR PARA LANZAR ERRORES CRÍTICOS
  public validateAndThrowCritical(validationResults: ValidationResult[]): void {
    const criticalErrors = validationResults.filter(result => 
      result.severity === 'critical' || result.severity === 'error'
    );

    if (criticalErrors.length > 0) {
      const errorMessages = criticalErrors.map(error => error.message).join('; ');
      throw new ValidationError(errorMessages, criticalErrors[0].field, 'error');
    }
  }

  private calculateAge(dateOfBirth: string): number {
    const today = new Date();
    const birth = new Date(dateOfBirth);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    
    return age;
  }
}

export const validationService = ValidationService.getInstance(); 