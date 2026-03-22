/**
 * MAPPERS SEGUROS CONTRA NULOS - MANEJO ROBUSTO DE DATOS AUSENTES
 * ==============================================================
 * 
 * Sistema de mappers que nunca fallan por datos faltantes.
 * La ausencia de información es tratada como un dato válido.
 * 
 * Implementa verificaciones exhaustivas de nulos en todos los procesos.
 */

import { DetailedLogger, MedicalLogger } from './detailedLogger';
import { MEDICAL_TERMINOLOGY, TerminologyMatcher } from '../data/medicalTerminology';
import { Patient } from '../types/patient';

// ========== INTERFACES PARA MANEJO SEGURO ==========

export interface SafeExtractionResult<T> {
  data: T;
  success: boolean;
  confidence: number;
  warnings: string[];
  errors: string[];
  metadata: {
    fieldsProcessed: number;
    fieldsExtracted: number;
    fieldsSkipped: number;
    processingNotes: string[];
    fallbacksUsed: string[];
  };
}

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

// ========== CLASE BASE PARA MAPPERS SEGUROS ==========

export abstract class NullSafeMapper {
  protected logger: MedicalLogger;
  protected validationContext: ValidationContext;
  protected defaultValueConfig: DefaultValueConfig;

  constructor(mapperName: string, context?: Partial<ValidationContext>) {
    this.logger = new MedicalLogger(`NullSafe_${mapperName}`);
    
    this.validationContext = {
      allowPartialData: true,
      requireMinimumFields: false,
      minimumFieldCount: 1,
      strictValidation: false,
      logMissingFields: true,
      ...context
    };

    this.defaultValueConfig = {
      useDefaults: false,
      defaultPatient: {},
      defaultStudyType: 'motor',
      defaultSide: 'bilateral',
      defaultStatus: 'unknown'
    };
  }

  /**
   * 🛡️ EXTRACCIÓN SEGURA DE VALOR
   */
  protected safeExtract<T>(
    extractor: () => T | null | undefined,
    fieldName: string,
    defaultValue?: T,
    validator?: (value: T) => boolean
  ): {
    value: T | null;
    extracted: boolean;
    warning?: string;
  } {
    
    try {
      const extracted = extractor();
      
      // Verificar si el valor es nulo o indefinido
      if (extracted === null || extracted === undefined) {
        this.logMissingField(fieldName, 'Valor nulo o indefinido');
        return {
          value: defaultValue ?? null,
          extracted: false,
          warning: `Campo ${fieldName}: valor faltante`
        };
      }

      // Verificar si el valor es una cadena vacía
      if (typeof extracted === 'string' && extracted.trim() === '') {
        this.logMissingField(fieldName, 'Cadena vacía');
        return {
          value: defaultValue ?? null,
          extracted: false,
          warning: `Campo ${fieldName}: cadena vacía`
        };
      }

      // Validar valor si se proporciona validador
      if (validator && !validator(extracted)) {
        this.logMissingField(fieldName, 'Validación fallida');
        return {
          value: defaultValue ?? null,
          extracted: false,
          warning: `Campo ${fieldName}: validación fallida`
        };
      }

      // Valor extraído exitosamente
      this.logger.debug(`✅ Campo extraído: ${fieldName}`, { value: extracted });
      return {
        value: extracted,
        extracted: true
      };

    } catch (error) {
      const errorMsg = `Error extrayendo ${fieldName}: ${error instanceof Error ? error.message : 'Error desconocido'}`;
      this.logger.warn(`⚠️ ${errorMsg}`, { error });
      
      return {
        value: defaultValue ?? null,
        extracted: false,
        warning: errorMsg
      };
    }
  }

  /**
   * 🔍 BÚSQUEDA SEGURA CON REGEX
   */
  protected safeRegexExtract(
    text: string | null | undefined,
    pattern: RegExp,
    fieldName: string,
    groupIndex: number = 1,
    transformer?: (value: string) => any
  ): {
    value: any;
    found: boolean;
    warning?: string;
  } {
    
    // Verificar entrada
    if (!text || typeof text !== 'string') {
      this.logMissingField(fieldName, 'Texto de entrada inválido');
      return {
        value: null,
        found: false,
        warning: `${fieldName}: texto de entrada inválido o faltante`
      };
    }

    try {
      const match = text.match(pattern);
      
      if (!match || !match[groupIndex]) {
        this.logMissingField(fieldName, 'Patrón no encontrado');
        return {
          value: null,
          found: false,
          warning: `${fieldName}: patrón no encontrado en el texto`
        };
      }

      let value = match[groupIndex].trim();
      
      // Aplicar transformación si se proporciona
      if (transformer) {
        try {
          value = transformer(value);
        } catch (transformError) {
          this.logger.warn(`⚠️ Error en transformación de ${fieldName}`, { 
            originalValue: value, 
            error: transformError 
          });
          return {
            value: null,
            found: false,
            warning: `${fieldName}: error en transformación de valor`
          };
        }
      }

      this.logger.debug(`✅ Regex exitoso: ${fieldName}`, { 
        pattern: pattern.source, 
        value 
      });

      return {
        value,
        found: true
      };

    } catch (error) {
      const errorMsg = `Error en regex para ${fieldName}: ${error instanceof Error ? error.message : 'Error desconocido'}`;
      this.logger.warn(`⚠️ ${errorMsg}`, { pattern: pattern.source, error });
      
      return {
        value: null,
        found: false,
        warning: errorMsg
      };
    }
  }

  /**
   * 🔢 EXTRACCIÓN SEGURA DE NÚMEROS
   */
  protected safeNumericExtract(
    text: string | null | undefined,
    fieldName: string,
    options: {
      allowNegative?: boolean;
      minValue?: number;
      maxValue?: number;
      defaultValue?: number;
    } = {}
  ): {
    value: number | null;
    extracted: boolean;
    warning?: string;
  } {
    
    if (!text || typeof text !== 'string') {
      return {
        value: options.defaultValue ?? null,
        extracted: false,
        warning: `${fieldName}: texto inválido para extracción numérica`
      };
    }

    try {
      // Limpiar texto - remover todo excepto números, puntos y guiones
      const cleaned = text.replace(/[^\d.-]/g, '');
      
      if (cleaned === '' || cleaned === '-' || cleaned === '.') {
        this.logMissingField(fieldName, 'Sin número válido en el texto');
        return {
          value: options.defaultValue ?? null,
          extracted: false,
          warning: `${fieldName}: no contiene número válido`
        };
      }

      const number = parseFloat(cleaned);
      
      // Verificar si es un número válido
      if (isNaN(number) || !isFinite(number)) {
        this.logMissingField(fieldName, 'Número inválido después de parsing');
        return {
          value: options.defaultValue ?? null,
          extracted: false,
          warning: `${fieldName}: número inválido después del parsing`
        };
      }

      // Validar negativos
      if (!options.allowNegative && number < 0) {
        return {
          value: options.defaultValue ?? null,
          extracted: false,
          warning: `${fieldName}: valor negativo no permitido`
        };
      }

      // Validar rango
      if (options.minValue !== undefined && number < options.minValue) {
        return {
          value: options.defaultValue ?? null,
          extracted: false,
          warning: `${fieldName}: valor por debajo del mínimo (${options.minValue})`
        };
      }

      if (options.maxValue !== undefined && number > options.maxValue) {
        return {
          value: options.defaultValue ?? null,
          extracted: false,
          warning: `${fieldName}: valor por encima del máximo (${options.maxValue})`
        };
      }

      this.logger.debug(`✅ Número extraído: ${fieldName}`, { 
        originalText: text, 
        cleanedText: cleaned, 
        value: number 
      });

      return {
        value: number,
        extracted: true
      };

    } catch (error) {
      const errorMsg = `Error numérico en ${fieldName}: ${error instanceof Error ? error.message : 'Error desconocido'}`;
      this.logger.warn(`⚠️ ${errorMsg}`, { text, error });
      
      return {
        value: options.defaultValue ?? null,
        extracted: false,
        warning: errorMsg
      };
    }
  }

  /**
   * 📋 EXTRACCIÓN SEGURA DE LISTAS
   */
  protected safeListExtract<T>(
    extractor: () => T[],
    fieldName: string,
    validator?: (item: T) => boolean,
    minimumItems: number = 0
  ): {
    items: T[];
    count: number;
    allValid: boolean;
    warnings: string[];
  } {
    
    const warnings: string[] = [];
    
    try {
      const extracted = extractor();
      
      if (!Array.isArray(extracted)) {
        this.logMissingField(fieldName, 'No es un array');
        return {
          items: [],
          count: 0,
          allValid: false,
          warnings: [`${fieldName}: no es un array válido`]
        };
      }

      // Filtrar elementos válidos si se proporciona validador
      let validItems = extracted;
      let invalidCount = 0;
      
      if (validator) {
        validItems = extracted.filter((item, index) => {
          const isValid = validator(item);
          if (!isValid) {
            invalidCount++;
            warnings.push(`${fieldName}[${index}]: elemento inválido`);
          }
          return isValid;
        });
      }

      // Verificar mínimo de elementos
      if (validItems.length < minimumItems) {
        warnings.push(`${fieldName}: insuficientes elementos válidos (${validItems.length}/${minimumItems})`);
      }

      this.logger.debug(`✅ Lista extraída: ${fieldName}`, { 
        totalItems: extracted.length,
        validItems: validItems.length,
        invalidItems: invalidCount
      });

      return {
        items: validItems,
        count: validItems.length,
        allValid: invalidCount === 0,
        warnings
      };

    } catch (error) {
      const errorMsg = `Error extrayendo lista ${fieldName}: ${error instanceof Error ? error.message : 'Error desconocido'}`;
      this.logger.warn(`⚠️ ${errorMsg}`, { error });
      
      return {
        items: [],
        count: 0,
        allValid: false,
        warnings: [errorMsg]
      };
    }
  }

  /**
   * 🏥 EXTRACCIÓN SEGURA DE TÉRMINOS MÉDICOS
   */
  protected safeMedicalTermExtract(
    text: string | null | undefined,
    category: keyof typeof MEDICAL_TERMINOLOGY,
    fieldName: string
  ): {
    terms: string[];
    bestMatch: string | null;
    confidence: number;
    warning?: string;
  } {
    
    if (!text || typeof text !== 'string') {
      return {
        terms: [],
        bestMatch: null,
        confidence: 0,
        warning: `${fieldName}: texto inválido para extracción médica`
      };
    }

    try {
      const foundTerms = TerminologyMatcher.findAllInCategory(text, category);
      
      if (foundTerms.length === 0) {
        this.logMissingField(fieldName, 'Sin términos médicos encontrados');
        return {
          terms: [],
          bestMatch: null,
          confidence: 0,
          warning: `${fieldName}: sin términos médicos encontrados en categoría ${category}`
        };
      }

      // Calcular confianza basada en número de términos encontrados
      const confidence = Math.min(100, foundTerms.length * 25);
      const bestMatch = foundTerms[0]; // Primer término encontrado

      this.logger.debug(`✅ Términos médicos extraídos: ${fieldName}`, { 
        category,
        termsFound: foundTerms.length,
        terms: foundTerms,
        confidence
      });

      return {
        terms: foundTerms,
        bestMatch,
        confidence
      };

    } catch (error) {
      const errorMsg = `Error en extracción médica ${fieldName}: ${error instanceof Error ? error.message : 'Error desconocido'}`;
      this.logger.warn(`⚠️ ${errorMsg}`, { category, error });
      
      return {
        terms: [],
        bestMatch: null,
        confidence: 0,
        warning: errorMsg
      };
    }
  }

  /**
   * 📊 CREACIÓN SEGURA DE RESULTADO
   */
  protected createSafeResult<T>(
    data: T,
    metadata: {
      fieldsProcessed: number;
      fieldsExtracted: number;
      warnings: string[];
      errors: string[];
      processingNotes: string[];
      fallbacksUsed: string[];
    }
  ): SafeExtractionResult<T> {
    
    const fieldsSkipped = metadata.fieldsProcessed - metadata.fieldsExtracted;
    const confidence = metadata.fieldsProcessed > 0 
      ? (metadata.fieldsExtracted / metadata.fieldsProcessed) * 100 
      : 0;
    
    const success = metadata.errors.length === 0 && (
      !this.validationContext.requireMinimumFields ||
      metadata.fieldsExtracted >= this.validationContext.minimumFieldCount
    );

    this.logger.metrics('Resultado de extracción', {
      fieldsProcessed: metadata.fieldsProcessed,
      fieldsExtracted: metadata.fieldsExtracted,
      fieldsSkipped,
      confidence: Math.round(confidence),
      success: success ? 1 : 0,
      warnings: metadata.warnings.length,
      errors: metadata.errors.length
    });

    return {
      data,
      success,
      confidence,
      warnings: metadata.warnings,
      errors: metadata.errors,
      metadata: {
        fieldsProcessed: metadata.fieldsProcessed,
        fieldsExtracted: metadata.fieldsExtracted,
        fieldsSkipped,
        processingNotes: metadata.processingNotes,
        fallbacksUsed: metadata.fallbacksUsed
      }
    };
  }

  /**
   * 📝 LOG DE CAMPO FALTANTE
   */
  private logMissingField(fieldName: string, reason: string): void {
    if (this.validationContext.logMissingFields) {
      this.logger.debug(`🔍 Campo faltante: ${fieldName}`, { reason });
    }
  }

  /**
   * 🔧 CONFIGURAR CONTEXTO DE VALIDACIÓN
   */
  public configureValidation(context: Partial<ValidationContext>): void {
    this.validationContext = { ...this.validationContext, ...context };
    this.logger.debug('⚙️ Contexto de validación actualizado', this.validationContext);
  }

  /**
   * 🎯 CONFIGURAR VALORES POR DEFECTO
   */
  public configureDefaults(config: Partial<DefaultValueConfig>): void {
    this.defaultValueConfig = { ...this.defaultValueConfig, ...config };
    this.logger.debug('🎯 Configuración de defaults actualizada', this.defaultValueConfig);
  }
}

// ========== MAPPER ESPECÍFICO PARA DATOS DE PACIENTE ==========

export class NullSafePatientMapper extends NullSafeMapper {
  
  constructor() {
    super('PatientMapper', {
      allowPartialData: true,
      requireMinimumFields: true,
      minimumFieldCount: 1,
      logMissingFields: true
    });
  }

  public extractPatientData(documentText: string): SafeExtractionResult<Partial<Patient>> {
    const operationId = this.logger.startOperation('Extracción segura de datos de paciente');
    
    const warnings: string[] = [];
    const errors: string[] = [];
    const processingNotes: string[] = [];
    const fallbacksUsed: string[] = [];
    
    let fieldsProcessed = 0;
    let fieldsExtracted = 0;

    const patient: Partial<Patient> = {};

    try {
      // CAMPO: ID del paciente
      fieldsProcessed++;
      const idResult = this.safeRegexExtract(
        documentText,
        /(?:ID|Identificador|Patient\s+ID|Historia|HC)[:\s]+([A-Za-z0-9\-_]+)/i,
        'ID del paciente'
      );
      if (idResult.found) {
        patient.id = idResult.value;
        fieldsExtracted++;
      } else if (idResult.warning) {
        warnings.push(idResult.warning);
      }

      // CAMPO: Nombre completo
      fieldsProcessed++;
      const nameResult = this.safeRegexExtract(
        documentText,
        /(?:Nombre|Name|Patient|Paciente)[:\s]+([A-Za-z\s]+?)(?:\n|ID|Edad|Age|$)/i,
        'Nombre del paciente',
        1,
        (name: string) => name.trim().replace(/\s+/g, ' ')
      );
      if (nameResult.found) {
        const fullName = nameResult.value;
        const nameParts = fullName.split(' ');
        patient.firstName = nameParts[0] || '';
        patient.lastName = nameParts.slice(1).join(' ') || '';
        fieldsExtracted++;
        processingNotes.push('Nombre dividido en firstName y lastName');
      } else if (nameResult.warning) {
        warnings.push(nameResult.warning);
      }

      // CAMPO: Edad
      fieldsProcessed++;
      const ageResult = this.safeNumericExtract(
        documentText.match(/(?:Edad|Age)[:\s]+(\d+)/i)?.[1],
        'Edad',
        { minValue: 0, maxValue: 120 }
      );
      if (ageResult.extracted && ageResult.value !== null) {
        // Calcular fecha de nacimiento aproximada basada en edad
        const currentYear = new Date().getFullYear();
        patient.dateOfBirth = `${currentYear - ageResult.value}-01-01`;
        fieldsExtracted++;
        processingNotes.push('Fecha de nacimiento calculada a partir de la edad');
      } else if (ageResult.warning) {
        warnings.push(ageResult.warning);
      }

      // CAMPO: Sexo
      fieldsProcessed++;
      const sexResult = this.safeRegexExtract(
        documentText,
        /(?:Sexo|Gender|Sex)[:\s]+(Masculino|Femenino|Male|Female|M|F|Hombre|Mujer)/i,
        'Sexo del paciente',
        1,
        (sex: string) => {
          const normalized = sex.toLowerCase();
          if (normalized.startsWith('m') || normalized.includes('masculino') || normalized.includes('male')) {
            return 'male';
          } else if (normalized.startsWith('f') || normalized.includes('femenino') || normalized.includes('female')) {
            return 'female';
          }
          return sex; // Mantener original si no se puede normalizar
        }
      );
      if (sexResult.found) {
        patient.sex = sexResult.value as 'male' | 'female';
        fieldsExtracted++;
      } else if (sexResult.warning) {
        warnings.push(sexResult.warning);
      }

      // CAMPO: Fecha de nacimiento directa
      if (!patient.dateOfBirth) {
        fieldsProcessed++;
        const dobResult = this.safeRegexExtract(
          documentText,
          /(?:Fecha\s+de\s+Nacimiento|Date\s+of\s+Birth|DOB)[:\s]+(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4})/i,
          'Fecha de nacimiento'
        );
        if (dobResult.found) {
          // Normalizar formato de fecha
          try {
            const normalizedDate = dobResult.value.replace(/[\.]/g, '/');
            const date = new Date(normalizedDate);
            if (!isNaN(date.getTime())) {
              patient.dateOfBirth = date.toISOString().split('T')[0];
              fieldsExtracted++;
              processingNotes.push('Fecha de nacimiento extraída directamente');
            } else {
              warnings.push('Fecha de nacimiento en formato inválido');
            }
          } catch (dateError) {
            warnings.push('Error procesando fecha de nacimiento');
          }
        } else if (dobResult.warning) {
          warnings.push(dobResult.warning);
        }
      }

      // Verificar si se necesita usar fallbacks
      if (fieldsExtracted === 0 && this.defaultValueConfig.useDefaults) {
        Object.assign(patient, this.defaultValueConfig.defaultPatient);
        fallbacksUsed.push('Valores por defecto aplicados');
        processingNotes.push('Se aplicaron valores por defecto debido a falta de datos');
      }

      this.logger.endOperation('Extracción segura de datos de paciente', operationId, {
        fieldsProcessed,
        fieldsExtracted,
        patientFields: Object.keys(patient)
      });

    } catch (error) {
      const errorMsg = `Error crítico en extracción de paciente: ${error instanceof Error ? error.message : 'Error desconocido'}`;
      errors.push(errorMsg);
      this.logger.failOperation('Extracción segura de datos de paciente', operationId, error);
    }

    return this.createSafeResult(patient, {
      fieldsProcessed,
      fieldsExtracted,
      warnings,
      errors,
      processingNotes,
      fallbacksUsed
    });
  }
}

// ========== MAPPER ESPECÍFICO PARA DATOS NCS ==========

export class NullSafeNCSMapper extends NullSafeMapper {
  
  constructor() {
    super('NCSMapper', {
      allowPartialData: true,
      requireMinimumFields: false,
      logMissingFields: true
    });
  }

  public extractNCSData(documentText: string): SafeExtractionResult<any[]> {
    const operationId = this.logger.startOperation('Extracción segura de datos NCS');
    
    const warnings: string[] = [];
    const errors: string[] = [];
    const processingNotes: string[] = [];
    const fallbacksUsed: string[] = [];
    
    let fieldsProcessed = 0;
    let fieldsExtracted = 0;
    const ncsResults: any[] = [];

    try {
      // Buscar sección de NCS de manera segura
      const ncsSection = this.safeMedicalTermExtract(documentText, 'sectionNCS', 'Sección NCS');
      
      if (ncsSection.confidence === 0) {
        warnings.push('No se encontró sección de NCS explícita');
        fallbacksUsed.push('Búsqueda de datos NCS en todo el documento');
        processingNotes.push('Intentando extraer datos NCS sin sección explícita');
      }

      // Buscar nervios de manera segura
      const nervesResult = this.safeMedicalTermExtract(documentText, 'nerveNames', 'Nervios detectados');
      fieldsProcessed++;
      
      if (nervesResult.terms.length > 0) {
        fieldsExtracted++;
        processingNotes.push(`${nervesResult.terms.length} nervios detectados: ${nervesResult.terms.join(', ')}`);
        
        // Procesar cada nervio encontrado
        nervesResult.terms.forEach((nerve, index) => {
          const nerveData = this.extractNerveDataSafely(documentText, nerve, index);
          if (nerveData) {
            ncsResults.push(nerveData);
          }
        });
      } else {
        warnings.push(nervesResult.warning || 'No se detectaron nervios en el documento');
      }

      this.logger.endOperation('Extracción segura de datos NCS', operationId, {
        fieldsProcessed,
        fieldsExtracted,
        ncsResultsCount: ncsResults.length
      });

    } catch (error) {
      const errorMsg = `Error crítico en extracción NCS: ${error instanceof Error ? error.message : 'Error desconocido'}`;
      errors.push(errorMsg);
      this.logger.failOperation('Extracción segura de datos NCS', operationId, error);
    }

    return this.createSafeResult(ncsResults, {
      fieldsProcessed,
      fieldsExtracted,
      warnings,
      errors,
      processingNotes,
      fallbacksUsed
    });
  }

  private extractNerveDataSafely(documentText: string, nerve: string, index: number): any | null {
    try {
      // Buscar datos específicos del nervio de manera segura
      const latencyResult = this.safeNumericExtract(
        this.findValueForNerve(documentText, nerve, 'latency'),
        `Latencia ${nerve}`,
        { minValue: 0, maxValue: 50 }
      );

      const amplitudeResult = this.safeNumericExtract(
        this.findValueForNerve(documentText, nerve, 'amplitude'),
        `Amplitud ${nerve}`,
        { minValue: 0, maxValue: 100 }
      );

      const velocityResult = this.safeNumericExtract(
        this.findValueForNerve(documentText, nerve, 'velocity'),
        `Velocidad ${nerve}`,
        { minValue: 0, maxValue: 150 }
      );

      // Solo crear resultado si al menos un valor fue extraído
      if (latencyResult.extracted || amplitudeResult.extracted || velocityResult.extracted) {
        return {
          id: `ncs_${index}_${Date.now()}`,
          nerve: nerve,
          type: this.inferNerveType(nerve),
          side: this.inferNerveSide(documentText, nerve),
          latency: latencyResult.value,
          amplitude: amplitudeResult.value,
          velocity: velocityResult.value,
          status: this.determineStatus(latencyResult.value, amplitudeResult.value, velocityResult.value),
          findings: this.generateFindings(latencyResult, amplitudeResult, velocityResult),
          metadata: {
            extractionMethod: 'null_safe',
            confidence: this.calculateNerveConfidence(latencyResult, amplitudeResult, velocityResult)
          }
        };
      }

      return null;

    } catch (error) {
      this.logger.warn(`⚠️ Error extrayendo datos del nervio ${nerve}`, { error });
      return null;
    }
  }

  // Métodos auxiliares para extracción de datos de nervios
  private findValueForNerve(text: string, nerve: string, parameter: string): string | null {
    // Implementar búsqueda contextual de valores para un nervio específico
    // Esto es un placeholder - implementar lógica real de búsqueda
    return null;
  }

  private inferNerveType(nerve: string): 'motor' | 'sensory' {
    // Lógica simplificada para inferir tipo
    return 'motor'; // Placeholder
  }

  private inferNerveSide(text: string, nerve: string): 'left' | 'right' | 'bilateral' {
    // Buscar indicadores de lado cerca del nervio
    return 'bilateral'; // Placeholder
  }

  private determineStatus(latency: number | null, amplitude: number | null, velocity: number | null): 'normal' | 'abnormal' | 'unknown' {
    if (latency === null && amplitude === null && velocity === null) {
      return 'unknown';
    }
    // Implementar lógica de determinación de estado
    return 'normal'; // Placeholder
  }

  private generateFindings(latencyResult: any, amplitudeResult: any, velocityResult: any): string[] {
    const findings: string[] = [];
    
    if (latencyResult.warning) findings.push(`Latencia: ${latencyResult.warning}`);
    if (amplitudeResult.warning) findings.push(`Amplitud: ${amplitudeResult.warning}`);
    if (velocityResult.warning) findings.push(`Velocidad: ${velocityResult.warning}`);
    
    if (findings.length === 0) {
      findings.push('Datos extraídos sin advertencias');
    }
    
    return findings;
  }

  private calculateNerveConfidence(latencyResult: any, amplitudeResult: any, velocityResult: any): number {
    let confidence = 0;
    
    if (latencyResult.extracted) confidence += 33;
    if (amplitudeResult.extracted) confidence += 33;
    if (velocityResult.extracted) confidence += 34;
    
    return confidence;
  }
}

// ========== FACTORY PARA CREAR MAPPERS SEGUROS ==========

export class NullSafeMapperFactory {
  
  public static createPatientMapper(config?: Partial<ValidationContext>): NullSafePatientMapper {
    const mapper = new NullSafePatientMapper();
    if (config) {
      mapper.configureValidation(config);
    }
    return mapper;
  }

  public static createNCSMapper(config?: Partial<ValidationContext>): NullSafeNCSMapper {
    const mapper = new NullSafeNCSMapper();
    if (config) {
      mapper.configureValidation(config);
    }
    return mapper;
  }

  // Añadir más factories según necesidad para EMG, etc.
}

export default NullSafeMapper; 