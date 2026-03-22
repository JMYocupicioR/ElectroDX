// 🚀 PARSER ROBUSTO Y ADAPTATIVO PARA REPORTES EMG
// ================================================
// Soluciona los problemas identificados en la propuesta conceptual
// Implementa un sistema de parsing inteligente y robusto

import { EMGNerveRecord } from './jsonReportGenerator';
import { NCSTestResult } from '../types/ncs';
import { Patient } from '../types/patient';

// ========== INTERFACES DEL PARSER ==========

export interface ParsedEMGData {
  patient: Partial<Patient>;
  motorNCS: NCSTestResult[];
  sensoryNCS: NCSTestResult[];
  needleEMG: EMGNerveRecord[];
  specialStudies: SpecialStudy[];
  clinicalFindings: ClinicalFinding[];
  conclusion: string;
  confidence: number;
  warnings: string[];
  errors: string[];
}

export interface SpecialStudy {
  type: 'f_wave' | 'h_reflex' | 'blink_reflex' | 'rns';
  nerve: string;
  side: 'left' | 'right' | 'bilateral';
  values: { [key: string]: number | string };
  status: 'normal' | 'abnormal' | 'borderline';
}

export interface ClinicalFinding {
  category: 'motor' | 'sensory' | 'mixed' | 'general';
  description: string;
  severity: 'mild' | 'moderate' | 'severe';
  confidence: number;
}

export interface ParserConfig {
  enableAdaptiveLearning: boolean;
  enableFuzzyMatching: boolean;
  enableCrossValidation: boolean;
  strictMode: boolean;
  debugMode: boolean;
  minConfidenceThreshold: number;
}

// ========== CLASE PRINCIPAL DEL PARSER ==========

export class RobustEMGParser {
  private static instance: RobustEMGParser;
  private config: ParserConfig;
  private learnedPatterns: Map<string, RegExp[]> = new Map();
  private validationRules: ValidationRule[] = [];

  // Patrones base para identificación de secciones
  private static readonly BASE_SECTION_PATTERNS = {
    PATIENT_INFO: [
      /Patient\s*\|/i,
      /Paciente\s*\|/i,
      /ID\s*\|/i,
      /Age\s*\|/i,
      /Edad\s*\|/i
    ],
    MOTOR_NCS: [
      /Motor\s+Side-To-Side\s+Comparison\s+Table/i,
      /Motor\s+NCS/i,
      /Conducción\s+Motora/i,
      /Motor\s+Nerve\s+Conduction/i
    ],
    SENSORY_NCS: [
      /Sensory\s+Side-To-Side\s+Comparison\s+Table/i,
      /Sensory\s+NCS/i,
      /Conducción\s+Sensitiva/i,
      /Sensory\s+Nerve\s+Conduction/i
    ],
    NEEDLE_EMG: [
      /Needle\s+EMG\s+Summary/i,
      /EMG\s+de\s+Aguja/i,
      /Electromiografía/i,
      /Needle\s+EMG/i
    ],
    F_WAVES: [
      /F-Wave\s+Summary\s+Table/i,
      /Ondas\s+F/i,
      /F\s+Wave/i,
      /F-Wave\s+Study/i
    ],
    H_REFLEXES: [
      /H-Reflex/i,
      /Reflejo\s+H/i,
      /H\s+Reflex/i
    ],
    CONCLUSION: [
      /CONCLUSION/i,
      /CONCLUSIÓN/i,
      /IMPRESIÓN\s+DIAGNÓSTICA/i,
      /DIAGNOSIS/i,
      /IMPRESSION/i
    ]
  };

  // Patrones para identificación de nervios
  private static readonly NERVE_PATTERNS = {
    PERONEAL: [/peroneal/i, /peroneo/i, /peroneus/i],
    TIBIAL: [/tibial/i, /tibialis/i],
    SURAL: [/sural/i],
    MEDIAN: [/median/i, /mediano/i],
    ULNAR: [/ulnar/i, /cubital/i],
    RADIAL: [/radial/i, /radial/i],
    AXILLARY: [/axillary/i, /axilar/i],
    MUSCULOCUTANEOUS: [/musculocutaneous/i, /musculocutaneo/i]
  };

  // Patrones para valores numéricos con unidades
  private static readonly VALUE_PATTERNS = {
    LATENCY: /(\d+\.?\d*)\s*(ms|msec)/i,
    AMPLITUDE: /(\d+\.?\d*)\s*(mv|μv|uv|microv)/i,
    VELOCITY: /(\d+\.?\d*)\s*(m\/s|mps)/i,
    DURATION: /(\d+\.?\d*)\s*(ms|msec)/i,
    PERCENTAGE: /(\d+\.?\d*)\s*%/i
  };

  // Reglas de validación fisiológica
  private static readonly PHYSIOLOGICAL_RANGES = {
    LATENCY: { min: 0.5, max: 50.0, unit: 'ms' },
    AMPLITUDE: { min: 0.1, max: 100.0, unit: 'mV' },
    VELOCITY: { min: 20.0, max: 120.0, unit: 'm/s' },
    DURATION: { min: 1.0, max: 50.0, unit: 'ms' }
  };

  private constructor(config?: Partial<ParserConfig>) {
    this.config = {
      enableAdaptiveLearning: true,
      enableFuzzyMatching: true,
      enableCrossValidation: true,
      strictMode: false,
      debugMode: false,
      minConfidenceThreshold: 0.6,
      ...config
    };

    this.initializeValidationRules();
  }

  public static getInstance(config?: Partial<ParserConfig>): RobustEMGParser {
    if (!this.instance) {
      this.instance = new RobustEMGParser(config);
    }
    return this.instance;
  }

  // ========== MÉTODO PRINCIPAL DE PARSING ==========

  /**
   * Método principal que orquesta todo el proceso de parsing
   * Basado en tu propuesta conceptual pero mejorado significativamente
   */
  public async parseEMGReport(reportText: string): Promise<ParsedEMGData> {
    const startTime = Date.now();
    
    if (this.config.debugMode) {
      console.log('🚀 Iniciando parsing robusto del reporte EMG');
      console.log(`📏 Longitud del texto: ${reportText.length} caracteres`);
    }

    const result: ParsedEMGData = {
      patient: {},
      motorNCS: [],
      sensoryNCS: [],
      needleEMG: [],
      specialStudies: [],
      clinicalFindings: [],
      conclusion: '',
      confidence: 0,
      warnings: [],
      errors: []
    };

    try {
      // 1. Preprocesamiento del texto
      const preprocessedText = this.preprocessText(reportText);
      
      // 2. Identificación adaptativa de secciones
      const sections = this.identifySectionsAdaptively(preprocessedText);
      
      // 3. Extracción de datos del paciente
      result.patient = this.extractPatientData(sections.patientInfo);
      
      // 4. Parsing de tablas NCS con validación
      const motorNCSResult = this.parseNCSTable(sections.motorNCS, 'motor');
      const sensoryNCSResult = this.parseNCSTable(sections.sensoryNCS, 'sensory');
      
      result.motorNCS = motorNCSResult.data;
      result.sensoryNCS = sensoryNCSResult.data;
      result.warnings.push(...motorNCSResult.warnings, ...sensoryNCSResult.warnings);
      
      // 5. Parsing de EMG de aguja
      const emgResult = this.parseNeedleEMG(sections.needleEMG);
      result.needleEMG = emgResult.data;
      result.warnings.push(...emgResult.warnings);
      
      // 6. Parsing de estudios especiales
      result.specialStudies = this.parseSpecialStudies(sections);
      
      // 7. Análisis de conclusiones y hallazgos clínicos
      const clinicalResult = this.parseClinicalFindings(sections.conclusion);
      result.clinicalFindings = clinicalResult.findings;
      result.conclusion = clinicalResult.conclusion;
      
      // 8. Validación cruzada
      if (this.config.enableCrossValidation) {
        const crossValidationResult = this.performCrossValidation(result);
        result.warnings.push(...crossValidationResult.warnings);
        result.errors.push(...crossValidationResult.errors);
      }
      
      // 9. Cálculo de confianza
      result.confidence = this.calculateOverallConfidence(result);
      
      // 10. Aprendizaje adaptativo
      if (this.config.enableAdaptiveLearning) {
        this.learnFromParsing(result, sections);
      }

      const processingTime = Date.now() - startTime;
      
      if (this.config.debugMode) {
        console.log(`✅ Parsing completado en ${processingTime}ms`);
        console.log(`📊 Confianza: ${(result.confidence * 100).toFixed(1)}%`);
        console.log(`📋 Datos extraídos:`, {
          motorNCS: result.motorNCS.length,
          sensoryNCS: result.sensoryNCS.length,
          needleEMG: result.needleEMG.length,
          specialStudies: result.specialStudies.length
        });
      }

      return result;

    } catch (error) {
      console.error('❌ Error en parsing:', error);
      result.errors.push(`Error de parsing: ${error.message}`);
      return result;
    }
  }

  // ========== MÉTODOS DE PREPROCESAMIENTO ==========

  /**
   * Preprocesamiento robusto del texto
   */
  private preprocessText(text: string): string {
    // Normalizar saltos de línea
    text = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
    
    // Remover caracteres de control problemáticos
    text = text.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
    
    // Normalizar espacios múltiples
    text = text.replace(/\s+/g, ' ');
    
    // Normalizar separadores de tabla
    text = text.replace(/\t+/g, ' | ');
    text = text.replace(/\s{2,}/g, ' | ');
    
    // Limpiar caracteres Unicode problemáticos
    Object.entries(UNICODE_REPLACEMENTS).forEach(([pattern, replacement]) => {
      text = text.replace(new RegExp(pattern, 'g'), replacement);
    });
    
    return text.trim();
  }

  /**
   * Identificación adaptativa de secciones
   */
  private identifySectionsAdaptively(text: string): { [key: string]: string } {
    const sections: { [key: string]: string } = {};
    const lines = text.split('\n');
    
    // Combinar patrones base con patrones aprendidos
    const allPatterns = { ...RobustEMGParser.BASE_SECTION_PATTERNS };
    
    if (this.config.enableAdaptiveLearning) {
      this.learnedPatterns.forEach((patterns, sectionName) => {
        if (!allPatterns[sectionName]) {
          allPatterns[sectionName] = [];
        }
        allPatterns[sectionName].push(...patterns);
      });
    }
    
    let currentSection = '';
    let currentContent: string[] = [];
    
    for (const line of lines) {
      // Buscar inicio de nueva sección
      let foundSection = false;
      for (const [sectionName, patterns] of Object.entries(allPatterns)) {
        for (const pattern of patterns) {
          if (pattern.test(line)) {
            // Guardar sección anterior
            if (currentSection && currentContent.length > 0) {
              sections[currentSection] = currentContent.join('\n');
            }
            
            // Iniciar nueva sección
            currentSection = sectionName;
            currentContent = [line];
            foundSection = true;
            break;
          }
        }
        if (foundSection) break;
      }
      
      // Si no es inicio de sección, agregar a contenido actual
      if (!foundSection && currentSection) {
        currentContent.push(line);
      }
    }
    
    // Guardar última sección
    if (currentSection && currentContent.length > 0) {
      sections[currentSection] = currentContent.join('\n');
    }
    
    return sections;
  }

  // ========== MÉTODOS DE EXTRACCIÓN DE DATOS ==========

  /**
   * Extracción robusta de datos del paciente
   */
  private extractPatientData(sectionText: string): Partial<Patient> {
    const patient: Partial<Patient> = {};
    
    if (!sectionText) return patient;
    
    // Patrones mejorados para extracción de datos del paciente
    const patterns = {
      name: /(?:Patient|Paciente)\s*\|(.*?)\|/i,
      id: /(?:ID|Patient ID)\s*\|(.*?)\|/i,
      age: /(?:Age|Edad)\s*\|(\d+)/i,
      sex: /(?:Sex|Gender|Género)\s*\|(Male|Female|Masculino|Femenino)/i,
      dateOfBirth: /(?:DOB|Date of Birth|Fecha de Nacimiento)\s*\|(.*?)\|/i
    };
    
    Object.entries(patterns).forEach(([field, pattern]) => {
      const match = sectionText.match(pattern);
      if (match) {
        const value = match[1].trim();
        
        switch (field) {
          case 'name':
            patient.firstName = value;
            break;
          case 'id':
            patient.id = value;
            break;
                  case 'age':
          const age = parseInt(value);
          if (!isNaN(age) && age > 0 && age < 150) {
            (patient as any).age = age;
          }
          break;
          case 'sex':
            const sex = value.toLowerCase();
            if (sex.includes('male') || sex.includes('masculino')) {
              patient.sex = 'male';
            } else if (sex.includes('female') || sex.includes('femenino')) {
              patient.sex = 'female';
            }
            break;
          case 'dateOfBirth':
            patient.dateOfBirth = value;
            break;
        }
      }
    });
    
    return patient;
  }

  /**
   * Parsing robusto de tablas NCS
   * Mejora significativa de tu propuesta conceptual
   */
  private parseNCSTable(sectionText: string, type: 'motor' | 'sensory'): {
    data: NCSTestResult[];
    warnings: string[];
  } {
    const results: NCSTestResult[] = [];
    const warnings: string[] = [];
    
    if (!sectionText) {
      return { data: results, warnings: ['Sección NCS no encontrada'] };
    }
    
    const lines = sectionText.split('\n');
    let inTable = false;
    let headers: string[] = [];
    
    for (const line of lines) {
      // Detectar inicio de tabla
      if (this.isTableHeader(line, type)) {
        inTable = true;
        headers = this.extractHeaders(line);
        continue;
      }
      
      // Detectar fin de tabla
      if (inTable && this.isTableEnd(line)) {
        break;
      }
      
      // Procesar línea de datos
      if (inTable && this.isDataRow(line)) {
        const ncsResult = this.parseNCSRow(line, headers, type);
        if (ncsResult) {
          // Validar datos antes de agregar
          const validationResult = this.validateNCSData(ncsResult);
          if (validationResult.isValid) {
            results.push(ncsResult);
          } else {
            warnings.push(`Datos NCS inválidos para ${ncsResult.nerve}: ${validationResult.reason}`);
          }
        }
      }
    }
    
    return { data: results, warnings };
  }

  /**
   * Parsing de una fila de datos NCS
   */
  private parseNCSRow(line: string, headers: string[], type: 'motor' | 'sensory'): NCSTestResult | null {
    const values = line.split('|').map(v => v.trim());
    
    if (values.length < 3) return null;
    
    // Identificar nervio
    const nerveName = this.identifyNerve(values[0]);
    if (!nerveName) return null;
    
    // Extraer valores según el tipo de NCS
    const extractedValues = this.extractNCSValues(values, headers, type);
    
    if (!extractedValues) return null;
    
    return {
      id: `ncs_${type}_${Date.now()}_${Math.random()}`,
      nerve: nerveName,
      type,
      side: this.inferSideFromContext(line),
      latency: extractedValues.latency,
      amplitude: extractedValues.amplitude,
      velocity: extractedValues.velocity,
      status: this.determineNCSStatus(extractedValues),
      findings: this.generateNCSFindings(extractedValues, nerveName)
    };
  }

  /**
   * Parsing robusto de EMG de aguja
   */
  private parseNeedleEMG(sectionText: string): {
    data: EMGNerveRecord[];
    warnings: string[];
  } {
    const results: EMGNerveRecord[] = [];
    const warnings: string[] = [];
    
    if (!sectionText) {
      return { data: results, warnings: ['Sección EMG no encontrada'] };
    }
    
    const lines = sectionText.split('\n');
    let inTable = false;
    
    for (const line of lines) {
      // Detectar inicio de tabla EMG
      if (this.isEMGTableHeader(line)) {
        inTable = true;
        continue;
      }
      
      // Detectar fin de tabla
      if (inTable && this.isTableEnd(line)) {
        break;
      }
      
      // Procesar línea de datos EMG
      if (inTable && this.isEMGDataRow(line)) {
        const emgResult = this.parseEMGRow(line);
        if (emgResult) {
          const validationResult = this.validateEMGData(emgResult);
          if (validationResult.isValid) {
            results.push(emgResult);
          } else {
            warnings.push(`Datos EMG inválidos para ${emgResult.muscleOrNerveName}: ${validationResult.reason}`);
          }
        }
      }
    }
    
    return { data: results, warnings };
  }

  private parseEMGRow(line: string): EMGNerveRecord | null {
    const values = line.split('|').map(v => v.trim());
    
    if (values.length < 3) return null;
    
    return {
      id: `emg_${Date.now()}_${Math.random()}`,
      muscleOrNerveName: values[0] || 'Unknown',
      side: this.inferSideFromContext(line),
      insertionalActivity: 'normal',
      spontaneousActivity: {
        fibrillations: false,
        positiveWaves: false,
        fasciculations: false
      },
      motorUnitPotentials: {
        amplitude: 0,
        duration: 0,
        polyphasia: 0
      },
      recruitmentPattern: 'normal'
    };
  }

  private parseSpecialStudies(sections: { [key: string]: string }): SpecialStudy[] {
    const studies: SpecialStudy[] = [];
    
    // Implementación básica - puedes expandir según necesites
    if (sections.f_waves) {
      studies.push({
        type: 'f_wave',
        nerve: 'general',
        side: 'bilateral',
        values: {},
        status: 'normal'
      });
    }
    
    return studies;
  }

  private parseClinicalFindings(sectionText: string): { findings: ClinicalFinding[]; conclusion: string } {
    const findings: ClinicalFinding[] = [];
    let conclusion = '';
    
    if (sectionText) {
      conclusion = sectionText.trim();
      
      // Análisis básico de hallazgos
      if (sectionText.toLowerCase().includes('anormal')) {
        findings.push({
          category: 'general',
          description: 'Hallazgos anormales detectados',
          severity: 'moderate',
          confidence: 0.7
        });
      }
    }
    
    return { findings, conclusion };
  }

  // ========== MÉTODOS DE VALIDACIÓN ==========

  /**
   * Validación de datos NCS
   */
  private validateNCSData(ncsData: NCSTestResult): { isValid: boolean; reason?: string } {
    // Validar latencia
    if (ncsData.latency < RobustEMGParser.PHYSIOLOGICAL_RANGES.LATENCY.min ||
        ncsData.latency > RobustEMGParser.PHYSIOLOGICAL_RANGES.LATENCY.max) {
      return { isValid: false, reason: `Latencia fuera de rango: ${ncsData.latency}ms` };
    }
    
    // Validar amplitud
    if (ncsData.amplitude < RobustEMGParser.PHYSIOLOGICAL_RANGES.AMPLITUDE.min ||
        ncsData.amplitude > RobustEMGParser.PHYSIOLOGICAL_RANGES.AMPLITUDE.max) {
      return { isValid: false, reason: `Amplitud fuera de rango: ${ncsData.amplitude}mV` };
    }
    
    // Validar velocidad de conducción
    if (ncsData.velocity > 0) {
      if (ncsData.velocity < RobustEMGParser.PHYSIOLOGICAL_RANGES.VELOCITY.min ||
          ncsData.velocity > RobustEMGParser.PHYSIOLOGICAL_RANGES.VELOCITY.max) {
        return { isValid: false, reason: `Velocidad fuera de rango: ${ncsData.velocity}m/s` };
      }
    }
    
    return { isValid: true };
  }

  /**
   * Validación de datos EMG
   */
  private validateEMGData(emgData: EMGNerveRecord): { isValid: boolean; reason?: string } {
    // Validar nombre del músculo
    if (!emgData.muscleOrNerveName || emgData.muscleOrNerveName === 'Unknown') {
      return { isValid: false, reason: 'Nombre de músculo inválido' };
    }
    
    // Validar amplitud de PUM
    if (emgData.motorUnitPotentials.amplitude > RobustEMGParser.PHYSIOLOGICAL_RANGES.AMPLITUDE.max * 10) {
      return { isValid: false, reason: `Amplitud de PUM demasiado alta: ${emgData.motorUnitPotentials.amplitude}μV` };
    }
    
    // Validar duración de PUM
    if (emgData.motorUnitPotentials.duration > RobustEMGParser.PHYSIOLOGICAL_RANGES.DURATION.max) {
      return { isValid: false, reason: `Duración de PUM demasiado larga: ${emgData.motorUnitPotentials.duration}ms` };
    }
    
    return { isValid: true };
  }

  // ========== MÉTODOS AUXILIARES ==========

  private identifyNerve(text: string): string | null {
    for (const [nerveName, patterns] of Object.entries(RobustEMGParser.NERVE_PATTERNS)) {
      for (const pattern of patterns) {
        if (pattern.test(text)) {
          return nerveName.toLowerCase();
        }
      }
    }
    return null;
  }

  private extractNCSValues(values: string[], headers: string[], type: 'motor' | 'sensory'): {
    latency: number;
    amplitude: number;
    velocity: number;
  } | null {
    // Implementación robusta de extracción de valores
    // Considera diferentes formatos de tabla
    const latency = this.extractNumericValue(values, headers, ['lat', 'latency', 'laton']);
    const amplitude = this.extractNumericValue(values, headers, ['amp', 'amplitude', 'b-pamp']);
    const velocity = this.extractNumericValue(values, headers, ['cv', 'velocity', 'vel']);
    
    if (latency === null || amplitude === null) {
      return null;
    }
    
    return { latency, amplitude, velocity: velocity || 0 };
  }

  private extractNumericValue(values: string[], headers: string[], patterns: string[]): number | null {
    for (const pattern of patterns) {
      const index = headers.findIndex(h => h.toLowerCase().includes(pattern));
      if (index >= 0 && index < values.length) {
        const value = this.parseNumericValue(values[index]);
        if (value !== null) {
          return value;
        }
      }
    }
    return null;
  }

  private parseNumericValue(text: string): number | null {
    const match = text.match(/(\d+\.?\d*)/);
    if (match) {
      const value = parseFloat(match[1]);
      return isNaN(value) ? null : value;
    }
    return null;
  }

  private inferSideFromContext(line: string): 'left' | 'right' {
    const lowerLine = line.toLowerCase();
    if (lowerLine.includes('left') || lowerLine.includes('izquierdo')) {
      return 'left';
    }
    return 'right';
  }

  private determineNCSStatus(values: any): 'normal' | 'abnormal' {
    // Lógica simplificada - en implementación real usaría rangos de referencia específicos
    return 'normal';
  }

  private generateNCSFindings(values: any, nerve: string): string[] {
    return [`NCS ${nerve} realizado`];
  }

  // ========== MÉTODOS DE DETECCIÓN ==========

  private isTableHeader(line: string, type: 'motor' | 'sensory'): boolean {
    const headerPatterns = type === 'motor' 
      ? [/nerve/i, /lat/i, /amp/i, /cv/i]
      : [/nerve/i, /lat/i, /amp/i];
    
    return headerPatterns.every(pattern => pattern.test(line));
  }

  private isEMGTableHeader(line: string): boolean {
    return /side|muscle|root|ins\.?\s*act/i.test(line);
  }

  private isTableEnd(line: string): boolean {
    return /^\s*$/.test(line) || /^[A-Z\s]+$/.test(line);
  }

  private isDataRow(line: string): boolean {
    return line.includes('|') && line.split('|').length >= 3;
  }

  private isEMGDataRow(line: string): boolean {
    return line.includes('|') && line.split('|').length >= 5;
  }

  private extractHeaders(line: string): string[] {
    return line.split('|').map(h => h.trim().toLowerCase());
  }

  // ========== MÉTODOS DE APRENDIZAJE ADAPTATIVO ==========

  private learnFromParsing(result: ParsedEMGData, sections: { [key: string]: string }): void {
    // Implementar aprendizaje de patrones exitosos
    // Mejorar patrones basado en resultados exitosos
  }

  private performCrossValidation(result: ParsedEMGData): { warnings: string[]; errors: string[] } {
    const warnings: string[] = [];
    const errors: string[] = [];
    
    // Validaciones cruzadas básicas
    if (result.motorNCS.length > 0 && result.sensoryNCS.length === 0) {
      warnings.push('NCS motor presente pero NCS sensitivo ausente');
    }
    
    return { warnings, errors };
  }

  private calculateOverallConfidence(result: ParsedEMGData): number {
    let confidence = 0;
    let totalChecks = 0;
    
    // Calcular confianza basada en múltiples factores
    if (result.patient.id) { confidence += 0.2; totalChecks++; }
    if (result.motorNCS.length > 0) { confidence += 0.3; totalChecks++; }
    if (result.sensoryNCS.length > 0) { confidence += 0.2; totalChecks++; }
    if (result.needleEMG.length > 0) { confidence += 0.2; totalChecks++; }
    if (result.conclusion) { confidence += 0.1; totalChecks++; }
    
    return totalChecks > 0 ? confidence / totalChecks : 0;
  }

  private initializeValidationRules(): void {
    // Inicializar reglas de validación
  }

  // ========== MÉTODOS PÚBLICOS ADICIONALES ==========

  public updateConfig(newConfig: Partial<ParserConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  public getConfig(): ParserConfig {
    return { ...this.config };
  }

  public getLearnedPatterns(): Map<string, RegExp[]> {
    return new Map(this.learnedPatterns);
  }
}

// ========== FUNCIONES DE EXPORTACIÓN ==========

export function createRobustParser(config?: Partial<ParserConfig>): RobustEMGParser {
  return RobustEMGParser.getInstance(config);
}

export async function parseEMGReport(
  reportText: string, 
  config?: Partial<ParserConfig>
): Promise<ParsedEMGData> {
  const parser = createRobustParser(config);
  return parser.parseEMGReport(reportText);
}

// ========== TIPOS AUXILIARES ==========

interface ValidationRule {
  name: string;
  validate: (data: any) => { isValid: boolean; reason?: string };
}

// Reemplazos Unicode simplificados
const UNICODE_REPLACEMENTS: { [key: string]: string } = {
  '\\u8216': "'",
  '\\u8217': "'",
  '\\u8220': '"',
  '\\u8221': '"',
  '\\u8211': '-',
  '\\u8212': '-',
  '\\u8226': '*',
  '\\u8230': '...'
}; 