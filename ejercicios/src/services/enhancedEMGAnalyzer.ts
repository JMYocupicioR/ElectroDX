// 🚀 ANALIZADOR EMG MODULAR Y ROBUSTO
// ====================================
// Implementación mejorada basada en la propuesta de análisis modular
// Adaptado para TypeScript y arquitectura React existente

import { EMGNerveRecord } from './jsonReportGenerator';
import { NCSTestResult } from '../types/ncs';
import { Patient } from '../types/patient';

// ========== INTERFACES PRINCIPALES ==========

/**
 * Contenedor principal para reportes EMG - El "Contenedor de Diagnóstico"
 * Basado en la propuesta de ReporteEMG de Python
 */
export interface EMGReportContainer {
  // Metadatos del archivo
  fileName: string;
  processedAt: Date;
  confidence: number;
  
  // Datos del paciente
  patientInfo: Partial<Patient>;
  
  // Secciones del reporte
  clinicalHistory: string;
  motorNCS: NCSTestResult[];
  sensoryNCS: NCSTestResult[];
  fWaves: any[];
  hReflexes: any[];
  needleEMG: EMGNerveRecord[];
  narrativeReport: string;
  conclusion: string;
  
  // Análisis de calidad
  qualityMetrics: {
    dataCompleteness: number;
    sectionCoverage: number;
    validationScore: number;
    issues: string[];
  };
}

/**
 * Resultado del análisis de secciones
 */
export interface SectionAnalysisResult {
  success: boolean;
  data: any;
  confidence: number;
  warnings: string[];
  errors: string[];
}

/**
 * Configuración para el análisis modular
 */
export interface ModularAnalysisConfig {
  enableStrictValidation: boolean;
  enableFuzzyMatching: boolean;
  enableCrossValidation: boolean;
  minConfidenceThreshold: number;
  maxProcessingTime: number;
  debugMode: boolean;
}

// ========== CLASE PRINCIPAL DEL ANALIZADOR ==========

export class EnhancedEMGAnalyzer {
  private static instance: EnhancedEMGAnalyzer;
  private config: ModularAnalysisConfig;

  // Palabras clave mejoradas para identificación de secciones
  private static readonly SECTION_PATTERNS = {
    PATIENT_INFO: [
      /Patient\s*\|/i,
      /Paciente\s*\|/i,
      /ID\s*\|/i,
      /Age\s*\|/i,
      /Edad\s*\|/i
    ],
    CLINICAL_HISTORY: [
      /Patient History/i,
      /Historia Clínica/i,
      /Clinical History/i,
      /Antecedentes/i
    ],
    MOTOR_NCS: [
      /Motor Side-To-Side Comparison Table/i,
      /Motor NCS/i,
      /Conducción Motora/i,
      /Motor Nerve Conduction/i
    ],
    SENSORY_NCS: [
      /Sensory Side-To-Side Comparison Table/i,
      /Sensory NCS/i,
      /Conducción Sensitiva/i,
      /Sensory Nerve Conduction/i
    ],
    NEEDLE_EMG: [
      /Needle EMG Summary/i,
      /EMG de Aguja/i,
      /Electromiografía/i,
      /Needle EMG/i
    ],
    F_WAVES: [
      /F-Wave Summary Table/i,
      /Ondas F/i,
      /F Wave/i,
      /F-Wave Study/i
    ],
    H_REFLEXES: [
      /H-Reflex/i,
      /Reflejo H/i,
      /H Reflex/i
    ],
    CONCLUSION: [
      /CONCLUSION/i,
      /CONCLUSIÓN/i,
      /IMPRESIÓN DIAGNÓSTICA/i,
      /DIAGNOSIS/i,
      /IMPRESSION/i
    ]
  };

  private constructor(config?: Partial<ModularAnalysisConfig>) {
    this.config = {
      enableStrictValidation: true,
      enableFuzzyMatching: true,
      enableCrossValidation: true,
      minConfidenceThreshold: 0.6,
      maxProcessingTime: 30000, // 30 segundos
      debugMode: false,
      ...config
    };
  }

  public static getInstance(config?: Partial<ModularAnalysisConfig>): EnhancedEMGAnalyzer {
    if (!this.instance) {
      this.instance = new EnhancedEMGAnalyzer(config);
    }
    return this.instance;
  }

  // ========== MÉTODO PRINCIPAL DE ANÁLISIS ==========

  /**
   * Función principal que orquesta todo el proceso de análisis
   * Basado en analizar_reporte_completo de Python
   */
  public async analyzeCompleteReport(
    fileContent: string, 
    fileName: string
  ): Promise<EMGReportContainer> {
    const startTime = Date.now();
    
    if (this.config.debugMode) {
      console.log('🚀 Iniciando análisis completo del reporte EMG');
      console.log(`📄 Archivo: ${fileName}`);
      console.log(`📏 Longitud del contenido: ${fileContent.length} caracteres`);
    }

    // 1. Crear el contenedor principal
    const reportContainer: EMGReportContainer = {
      fileName,
      processedAt: new Date(),
      confidence: 0,
      patientInfo: {},
      clinicalHistory: '',
      motorNCS: [],
      sensoryNCS: [],
      fWaves: [],
      hReflexes: [],
      needleEMG: [],
      narrativeReport: '',
      conclusion: '',
      qualityMetrics: {
        dataCompleteness: 0,
        sectionCoverage: 0,
        validationScore: 0,
        issues: []
      }
    };

    try {
      // 2. Dividir en secciones lógicas
      const sections = this.divideIntoLogicalSections(fileContent);
      
      if (this.config.debugMode) {
        console.log('📋 Secciones identificadas:', Object.keys(sections));
      }

      // 3. Analizar cada sección y poblar el contenedor
      const analysisPromises = [
        this.analyzePatientInfo(sections.patientInfo).then(result => {
          if (result.success) {
            reportContainer.patientInfo = result.data;
          }
          return result;
        }),
        
        this.analyzeClinicalHistory(sections.clinicalHistory).then(result => {
          if (result.success) {
            reportContainer.clinicalHistory = result.data;
          }
          return result;
        }),
        
        this.analyzeMotorNCS(sections.motorNCS).then(result => {
          if (result.success) {
            reportContainer.motorNCS = result.data;
          }
          return result;
        }),
        
        this.analyzeSensoryNCS(sections.sensoryNCS).then(result => {
          if (result.success) {
            reportContainer.sensoryNCS = result.data;
          }
          return result;
        }),
        
        this.analyzeNeedleEMG(sections.needleEMG).then(result => {
          if (result.success) {
            reportContainer.needleEMG = result.data;
          }
          return result;
        }),
        
        this.analyzeConclusion(sections.conclusion).then(result => {
          if (result.success) {
            reportContainer.conclusion = result.data;
          }
          return result;
        })
      ];

      // Ejecutar análisis en paralelo
      const results = await Promise.all(analysisPromises);
      
      // 4. Calcular métricas de calidad y confianza
      reportContainer.qualityMetrics = this.calculateQualityMetrics(reportContainer, results);
      reportContainer.confidence = this.calculateOverallConfidence(results);

      // 5. Validación cruzada si está habilitada
      if (this.config.enableCrossValidation) {
        const crossValidationResult = this.performCrossValidation(reportContainer);
        reportContainer.qualityMetrics.issues.push(...crossValidationResult.issues);
      }

      const processingTime = Date.now() - startTime;
      
      if (this.config.debugMode) {
        console.log(`✅ Análisis completado en ${processingTime}ms`);
        console.log(`📊 Confianza general: ${(reportContainer.confidence * 100).toFixed(1)}%`);
        console.log(`🔍 Métricas de calidad:`, reportContainer.qualityMetrics);
      }

      return reportContainer;

    } catch (error) {
      console.error('❌ Error en análisis completo:', error);
      reportContainer.qualityMetrics.issues.push(`Error de procesamiento: ${error.message}`);
      return reportContainer;
    }
  }

  // ========== MÓDULO DE DIVISIÓN POR SECCIONES ==========

  /**
   * Estrategia de "División por Secciones" y Pre-procesamiento
   * Basado en dividir_en_secciones de Python
   */
  private divideIntoLogicalSections(text: string): { [key: string]: string } {
    const sections: { [key: string]: string } = {};
    
    // Patrones mejorados para identificar secciones
    const sectionPatterns = {
      patientInfo: /(?s)Patient\s*\|.*?(?=Patient History|Motor Side-To-Side|Needle EMG|CONCLUSION)/i,
      clinicalHistory: /(?s)Patient History(.*?)(?=Motor Side-To-Side|Needle EMG|CONCLUSION)/i,
      motorNCS: /(?s)Motor Side-To-Side Comparison Table(.*?)(?=Sensory Side-To-Side|Needle EMG|CONCLUSION)/i,
      sensoryNCS: /(?s)Sensory Side-To-Side Comparison Table(.*?)(?=Needle EMG|CONCLUSION)/i,
      needleEMG: /(?s)Needle EMG Summary(.*?)(?=CONCLUSION|F-Wave|H-Reflex)/i,
      fWaves: /(?s)F-Wave Summary Table(.*?)(?=H-Reflex|CONCLUSION)/i,
      hReflexes: /(?s)H-Reflex(.*?)(?=CONCLUSION)/i,
      conclusion: /(?s)CONCLUSION(.*?)(?=Dr\.|Waveform Images|$)/i
    };

    for (const [sectionName, pattern] of Object.entries(sectionPatterns)) {
      const match = text.match(pattern);
      if (match) {
        sections[sectionName] = match[1] ? match[1].trim() : match[0].trim();
      } else {
        sections[sectionName] = '';
      }
    }

    return sections;
  }

  // ========== MÓDULOS DE ANÁLISIS ESPECÍFICOS ==========

  /**
   * Módulo de Extracción de Información del Paciente (Flexible y Robusto)
   * Basado en analizar_info_paciente de Python
   */
  private async analyzePatientInfo(sectionText: string): Promise<SectionAnalysisResult> {
    if (!sectionText.trim()) {
      return {
        success: false,
        data: {},
        confidence: 0,
        warnings: ['Sección de información del paciente no encontrada'],
        errors: []
      };
    }

    const patientInfo: Partial<Patient> = {};
    const warnings: string[] = [];
    const errors: string[] = [];

    try {
      // Patrón mejorado para clave-valor
      const keyValuePattern = /([A-Za-z\s]+)\s*\|(.*?)\|/g;
      let match;

      while ((match = keyValuePattern.exec(sectionText)) !== null) {
        const key = match[1].trim();
        const value = match[2].trim();

        if (!value || value === 'N/A' || value === '--') {
          warnings.push(`Campo vacío para: ${key}`);
          continue;
        }

        // Mapeo de campos con validación específica
        switch (key.toLowerCase()) {
          case 'patient':
          case 'name':
          case 'nombre':
            patientInfo.firstName = value;
            break;
          
          case 'id':
          case 'patient id':
            patientInfo.id = value;
            break;
          
          case 'age':
          case 'edad':
            const age = parseInt(value);
            if (!isNaN(age) && age > 0 && age < 150) {
              patientInfo.age = age;
            } else {
              warnings.push(`Edad inválida: ${value}`);
            }
            break;
          
          case 'sex':
          case 'gender':
          case 'género':
            const gender = value.toLowerCase();
            if (gender.includes('male') || gender.includes('masculino')) {
              patientInfo.sex = 'male';
            } else if (gender.includes('female') || gender.includes('femenino')) {
              patientInfo.sex = 'female';
            } else {
              warnings.push(`Género no reconocido: ${value}`);
            }
            break;
          
          default:
            // Campos adicionales se almacenan en metadata
            if (!patientInfo.metadata) patientInfo.metadata = {};
            patientInfo.metadata[key] = value;
        }
      }

      const confidence = this.calculateSectionConfidence(patientInfo, warnings.length);
      
      return {
        success: Object.keys(patientInfo).length > 0,
        data: patientInfo,
        confidence,
        warnings,
        errors
      };

    } catch (error) {
      return {
        success: false,
        data: {},
        confidence: 0,
        warnings,
        errors: [`Error procesando información del paciente: ${error.message}`]
      };
    }
  }

  /**
   * Módulo Genérico para Tablas de Neuroconducción (NCS)
   * Basado en analizar_tabla_ncs de Python
   */
  private async analyzeMotorNCS(sectionText: string): Promise<SectionAnalysisResult> {
    return this.analyzeNCSTable(sectionText, 'motor');
  }

  private async analyzeSensoryNCS(sectionText: string): Promise<SectionAnalysisResult> {
    return this.analyzeNCSTable(sectionText, 'sensory');
  }

  private async analyzeNCSTable(sectionText: string, type: 'motor' | 'sensory'): Promise<SectionAnalysisResult> {
    if (!sectionText.trim()) {
      return {
        success: false,
        data: [],
        confidence: 0,
        warnings: [`Sección de NCS ${type} no encontrada`],
        errors: []
      };
    }

    const results: NCSTestResult[] = [];
    const warnings: string[] = [];
    const errors: string[] = [];

    try {
      // Definir encabezados según el tipo
      const headers = type === 'motor' 
        ? ['Nerve', 'Stimulus', 'Recording', 'Dist_L', 'Dist_R', 'LatOn_L', 'LatOn_R', 'CV_L', 'CV_R', 'BPAmp_L', 'BPAmp_R']
        : ['Nerve', 'Stimulus', 'Recording', 'Dist_L', 'Dist_R', 'LatOn_L', 'LatOn_R', 'BPAmp_L', 'BPAmp_R', 'CV_L', 'CV_R', 'LatNPk_L', 'LatNPk_R'];

      const lines = sectionText.split('\n');
      
      for (const line of lines) {
        // Heurística: saltar líneas que no contienen nervios conocidos
        if (!this.containsKnownNerve(line)) {
          continue;
        }

        const values = line.split('|').map(v => v.trim());
        
        if (values.length < 3) {
          warnings.push(`Línea con datos insuficientes: ${line.substring(0, 50)}...`);
          continue;
        }

        // Crear registro NCS
        const ncsRecord: NCSTestResult = {
          id: `ncs_${type}_${Date.now()}_${Math.random()}`,
          nerve: this.normalizeNerveName(values[0]),
          type,
          side: this.inferSideFromContext(line),
          latency: this.parseNumericValue(values[5] || values[6] || '0'),
          amplitude: this.parseNumericValue(values[9] || values[10] || '0'),
          velocity: this.parseNumericValue(values[7] || values[8] || '0'),
          status: this.determineNCSStatus(values),
          findings: this.generateNCSFindings(values, type)
        };

        // Validar datos antes de agregar
        if (this.isValidNCSRecord(ncsRecord)) {
          results.push(ncsRecord);
        } else {
          warnings.push(`Registro NCS inválido para nervio: ${ncsRecord.nerve}`);
        }
      }

      const confidence = this.calculateSectionConfidence(results, warnings.length);
      
      return {
        success: results.length > 0,
        data: results,
        confidence,
        warnings,
        errors
      };

    } catch (error) {
      return {
        success: false,
        data: [],
        confidence: 0,
        warnings,
        errors: [`Error procesando NCS ${type}: ${error.message}`]
      };
    }
  }

  /**
   * Módulo Específico para la Tabla de Miografía (Needle EMG)
   * Basado en analizar_tabla_emg de Python
   */
  private async analyzeNeedleEMG(sectionText: string): Promise<SectionAnalysisResult> {
    if (!sectionText.trim()) {
      return {
        success: false,
        data: [],
        confidence: 0,
        warnings: ['Sección de EMG de aguja no encontrada'],
        errors: []
      };
    }

    const results: EMGNerveRecord[] = [];
    const warnings: string[] = [];
    const errors: string[] = [];

    try {
      const emgHeaders = [
        'Side', 'Muscle', 'Root', 'Ins. Act.', 'Fibs.', 'PSW', 
        'Fascics.', 'Polyph.', 'MU Amp.', 'MU Dur.', 'Pattern', 'Recruit', 'Comments'
      ];

      const lines = sectionText.split('\n');

      for (const line of lines) {
        // Omitir línea de encabezado
        if (line.includes('Side|Muscle|Root')) {
          continue;
        }

        // Verificar que sea una fila válida con suficientes separadores
        if (line.split('|').length < 5) {
          continue;
        }

        const values = line.split('|').map(v => v.trim());
        
        const emgRecord: EMGNerveRecord = {
          id: `emg_${Date.now()}_${Math.random()}`,
          muscleOrNerveName: values[1] || 'Unknown',
          side: this.parseSide(values[0]),
          insertionalActivity: this.parseInsertionalActivity(values[3]),
          spontaneousActivity: {
            fibrillations: this.parseBooleanValue(values[4]),
            positiveWaves: this.parseBooleanValue(values[5]),
            fasciculations: this.parseBooleanValue(values[6])
          },
          motorUnitPotentials: {
            amplitude: this.parseNumericValue(values[8] || '0'),
            duration: this.parseNumericValue(values[9] || '0'),
            polyphasia: this.parseNumericValue(values[7] || '0')
          },
          recruitmentPattern: this.parseRecruitmentPattern(values[11] || values[12] || 'normal'),
          interpretationNotes: values[12] || ''
        };

        // Validar registro antes de agregar
        if (this.isValidEMGRecord(emgRecord)) {
          results.push(emgRecord);
        } else {
          warnings.push(`Registro EMG inválido para músculo: ${emgRecord.muscleOrNerveName}`);
        }
      }

      const confidence = this.calculateSectionConfidence(results, warnings.length);
      
      return {
        success: results.length > 0,
        data: results,
        confidence,
        warnings,
        errors
      };

    } catch (error) {
      return {
        success: false,
        data: [],
        confidence: 0,
        warnings,
        errors: [`Error procesando EMG: ${error.message}`]
      };
    }
  }

  /**
   * Análisis de Historia Clínica
   */
  private async analyzeClinicalHistory(sectionText: string): Promise<SectionAnalysisResult> {
    if (!sectionText.trim()) {
      return {
        success: false,
        data: '',
        confidence: 0,
        warnings: ['Historia clínica no encontrada'],
        errors: []
      };
    }

    // Limpiar y normalizar el texto
    const cleanedText = sectionText
      .replace(/\s+/g, ' ')
      .replace(/\n\s*\n/g, '\n')
      .trim();

    const confidence = cleanedText.length > 50 ? 0.8 : 0.3;

    return {
      success: true,
      data: cleanedText,
      confidence,
      warnings: [],
      errors: []
    };
  }

  /**
   * Análisis de Conclusión
   */
  private async analyzeConclusion(sectionText: string): Promise<SectionAnalysisResult> {
    if (!sectionText.trim()) {
      return {
        success: false,
        data: '',
        confidence: 0,
        warnings: ['Conclusión no encontrada'],
        errors: []
      };
    }

    const cleanedText = sectionText
      .replace(/\s+/g, ' ')
      .replace(/\n\s*\n/g, '\n')
      .trim();

    const confidence = cleanedText.length > 20 ? 0.9 : 0.4;

    return {
      success: true,
      data: cleanedText,
      confidence,
      warnings: [],
      errors: []
    };
  }

  // ========== FUNCIONES AUXILIARES ==========

  private containsKnownNerve(line: string): boolean {
    const knownNerves = ['Ulnar', 'Median', 'Tibial', 'Peroneal', 'Sural', 'Radial'];
    return knownNerves.some(nerve => line.includes(nerve));
  }

  private normalizeNerveName(nerve: string): string {
    return nerve.trim().toLowerCase();
  }

  private inferSideFromContext(line: string): 'left' | 'right' {
    const lowerLine = line.toLowerCase();
    if (lowerLine.includes('left') || lowerLine.includes('izquierdo')) {
      return 'left';
    }
    return 'right';
  }

  private parseNumericValue(value: string): number {
    const num = parseFloat(value.replace(/[^\d.-]/g, ''));
    return isNaN(num) ? 0 : num;
  }

  private parseBooleanValue(value: string): boolean {
    const lowerValue = value.toLowerCase();
    return lowerValue.includes('+') || lowerValue.includes('yes') || lowerValue.includes('present');
  }

  private parseSide(value: string): 'left' | 'right' {
    const lowerValue = value.toLowerCase();
    return lowerValue.includes('left') || lowerValue.includes('izquierdo') ? 'left' : 'right';
  }

  private parseInsertionalActivity(value: string): any {
    const lowerValue = value.toLowerCase();
    if (lowerValue.includes('normal')) return 'normal';
    if (lowerValue.includes('increased')) return 'increased';
    if (lowerValue.includes('decreased')) return 'decreased';
    if (lowerValue.includes('absent')) return 'absent';
    return 'normal';
  }

  private parseRecruitmentPattern(value: string): any {
    const lowerValue = value.toLowerCase();
    if (lowerValue.includes('normal')) return 'normal';
    if (lowerValue.includes('reduced')) return 'reduced';
    if (lowerValue.includes('early')) return 'early';
    return 'normal';
  }

  private determineNCSStatus(values: string[]): 'normal' | 'abnormal' {
    // Lógica simplificada - en implementación real usaría rangos de referencia
    return 'normal';
  }

  private generateNCSFindings(values: string[], type: 'motor' | 'sensory'): string[] {
    return [`NCS ${type} realizado`];
  }

  private isValidNCSRecord(record: NCSTestResult): boolean {
    return record.nerve && record.latency > 0;
  }

  private isValidEMGRecord(record: EMGNerveRecord): boolean {
    return record.muscleOrNerveName && record.muscleOrNerveName !== 'Unknown';
  }

  private calculateSectionConfidence(data: any, warningCount: number): number {
    let baseConfidence = 0.8;
    
    // Reducir confianza basado en advertencias
    baseConfidence -= warningCount * 0.1;
    
    // Ajustar basado en cantidad de datos
    if (Array.isArray(data)) {
      baseConfidence += Math.min(data.length * 0.05, 0.2);
    }
    
    return Math.max(0, Math.min(1, baseConfidence));
  }

  private calculateOverallConfidence(results: SectionAnalysisResult[]): number {
    const validResults = results.filter(r => r.success);
    if (validResults.length === 0) return 0;
    
    const totalConfidence = validResults.reduce((sum, r) => sum + r.confidence, 0);
    return totalConfidence / validResults.length;
  }

  private calculateQualityMetrics(
    container: EMGReportContainer, 
    results: SectionAnalysisResult[]
  ): EMGReportContainer['qualityMetrics'] {
    const totalSections = results.length;
    const successfulSections = results.filter(r => r.success).length;
    const totalWarnings = results.reduce((sum, r) => sum + r.warnings.length, 0);
    const totalErrors = results.reduce((sum, r) => sum + r.errors.length, 0);

    return {
      dataCompleteness: successfulSections / totalSections,
      sectionCoverage: successfulSections / totalSections,
      validationScore: Math.max(0, 1 - (totalErrors * 0.2 + totalWarnings * 0.1)),
      issues: results.flatMap(r => [...r.warnings, ...r.errors])
    };
  }

  private performCrossValidation(container: EMGReportContainer): { issues: string[] } {
    const issues: string[] = [];

    // Validaciones cruzadas básicas
    if (container.motorNCS.length > 0 && container.sensoryNCS.length === 0) {
      issues.push('NCS motor presente pero NCS sensitivo ausente');
    }

    if (container.needleEMG.length === 0 && container.motorNCS.length > 0) {
      issues.push('NCS presente pero EMG de aguja ausente');
    }

    return { issues };
  }

  // ========== MÉTODOS PÚBLICOS ADICIONALES ==========

  /**
   * Actualizar configuración del analizador
   */
  public updateConfig(newConfig: Partial<ModularAnalysisConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * Obtener configuración actual
   */
  public getConfig(): ModularAnalysisConfig {
    return { ...this.config };
  }

  /**
   * Validar si un archivo es compatible con el analizador
   */
  public isCompatibleFile(fileName: string): boolean {
    const extension = fileName.split('.').pop()?.toLowerCase();
    return ['rtf', 'txt', 'docx', 'pdf'].includes(extension || '');
  }
}

// ========== FUNCIONES DE EXPORTACIÓN ==========

/**
 * Crear instancia del analizador con configuración personalizada
 */
export function createEMGAnalyzer(config?: Partial<ModularAnalysisConfig>): EnhancedEMGAnalyzer {
  return EnhancedEMGAnalyzer.getInstance(config);
}

/**
 * Función de conveniencia para análisis rápido
 */
export async function analyzeEMGReport(
  fileContent: string, 
  fileName: string, 
  config?: Partial<ModularAnalysisConfig>
): Promise<EMGReportContainer> {
  const analyzer = createEMGAnalyzer(config);
  return analyzer.analyzeCompleteReport(fileContent, fileName);
}

/**
 * Validar si el análisis fue exitoso
 */
export function isAnalysisSuccessful(container: EMGReportContainer): boolean {
  return container.confidence >= 0.6 && container.qualityMetrics.validationScore >= 0.5;
} 