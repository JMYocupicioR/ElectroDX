// 🔗 INTEGRACIÓN DEL PARSER ROBUSTO CON EL SISTEMA EXISTENTE
// =========================================================
// Conecta el nuevo parser robusto con los servicios existentes
// Proporciona una interfaz unificada para el parsing de reportes EMG

import { RobustEMGParser, ParsedEMGData, ParserConfig } from './robustEMGParser';
import { EnhancedFileConverter } from './enhanced-file-converter';
import { TableParser } from './table-parser';
import { EMGNerveRecord } from './jsonReportGenerator';
import { NCSTestResult } from '../types/ncs';
import { Patient } from '../types/patient';

// ========== INTERFACES DE INTEGRACIÓN ==========

export interface IntegrationResult {
  success: boolean;
  data: ParsedEMGData | null;
  originalResult?: any;
  robustResult?: ParsedEMGData;
  comparison?: ComparisonMetrics;
  recommendations: string[];
  errors: string[];
  warnings: string[];
}

export interface ComparisonMetrics {
  dataCompleteness: number;
  confidenceImprovement: number;
  validationScore: number;
  processingTime: number;
  overallScore: number;
}

export interface IntegrationConfig {
  useRobustParser: boolean;
  fallbackToOriginal: boolean;
  enableComparison: boolean;
  enableValidation: boolean;
  parserConfig?: Partial<ParserConfig>;
}

// ========== CLASE DE INTEGRACIÓN ==========

export class RobustParserIntegration {
  private static instance: RobustParserIntegration;
  private config: IntegrationConfig;
  private robustParser: RobustEMGParser;
  private processingHistory: Map<string, IntegrationResult> = new Map();

  private constructor(config?: Partial<IntegrationConfig>) {
    this.config = {
      useRobustParser: true,
      fallbackToOriginal: true,
      enableComparison: true,
      enableValidation: true,
      ...config
    };

    this.robustParser = RobustEMGParser.getInstance(this.config.parserConfig);
  }

  public static getInstance(config?: Partial<IntegrationConfig>): RobustParserIntegration {
    if (!this.instance) {
      this.instance = new RobustParserIntegration(config);
    }
    return this.instance;
  }

  // ========== MÉTODO PRINCIPAL DE INTEGRACIÓN ==========

  /**
   * Método principal que integra el parser robusto con el sistema existente
   * Proporciona fallback y comparación automática
   */
  public async processEMGReport(
    reportText: string,
    fileName?: string
  ): Promise<IntegrationResult> {
    const startTime = Date.now();
    const result: IntegrationResult = {
      success: false,
      data: null,
      recommendations: [],
      errors: [],
      warnings: []
    };

    try {
      console.log('🔗 Iniciando integración de parser robusto');

      // 1. Procesar con parser robusto
      let robustResult: ParsedEMGData | null = null;
      if (this.config.useRobustParser) {
        try {
          robustResult = await this.robustParser.parseEMGReport(reportText);
          console.log('✅ Parser robusto completado');
        } catch (error) {
          console.error('❌ Error en parser robusto:', error);
          result.errors.push(`Error en parser robusto: ${error.message}`);
        }
      }

      // 2. Procesar con sistema original (si es necesario)
      let originalResult: any = null;
      if (this.config.fallbackToOriginal || this.config.enableComparison) {
        try {
          originalResult = await this.processWithOriginalSystem(reportText);
          console.log('✅ Sistema original completado');
        } catch (error) {
          console.error('❌ Error en sistema original:', error);
          result.errors.push(`Error en sistema original: ${error.message}`);
        }
      }

      // 3. Determinar resultado final
      if (robustResult && robustResult.confidence >= 0.7) {
        result.success = true;
        result.data = robustResult;
        result.robustResult = robustResult;
        result.recommendations.push('Usando parser robusto (alta confianza)');
      } else if (originalResult && this.config.fallbackToOriginal) {
        result.success = true;
        result.data = this.convertOriginalToParsedData(originalResult);
        result.originalResult = originalResult;
        result.recommendations.push('Usando sistema original (fallback)');
      } else {
        result.success = false;
        result.errors.push('No se pudo procesar el reporte con ningún método');
      }

      // 4. Comparar resultados si es necesario
      if (this.config.enableComparison && robustResult && originalResult) {
        result.comparison = this.compareResults(robustResult, originalResult);
        result.recommendations.push(...this.generateComparisonRecommendations(result.comparison));
      }

      // 5. Validar resultado final
      if (this.config.enableValidation && result.data) {
        const validationResult = this.validateFinalResult(result.data);
        result.warnings.push(...validationResult.warnings);
        result.errors.push(...validationResult.errors);
      }

      // 6. Guardar en historial
      const processingTime = Date.now() - startTime;
      if (fileName) {
        this.processingHistory.set(fileName, {
          ...result,
          comparison: result.comparison ? {
            ...result.comparison,
            processingTime
          } : undefined
        });
      }

      console.log(`✅ Integración completada en ${processingTime}ms`);
      return result;

    } catch (error) {
      console.error('❌ Error en integración:', error);
      result.errors.push(`Error de integración: ${error.message}`);
      return result;
    }
  }

  // ========== MÉTODOS DE PROCESAMIENTO ==========

  /**
   * Procesa el reporte con el sistema original
   */
  private async processWithOriginalSystem(reportText: string): Promise<any> {
          // Usar el sistema existente
      const converter = EnhancedFileConverter.getInstance();
      const result = await converter.convert(new File([reportText], 'report.txt', { type: 'text/plain' }));
    return result;
  }

  /**
   * Convierte resultado del sistema original al formato del parser robusto
   */
  private convertOriginalToParsedData(originalResult: any): ParsedEMGData {
    const converted: ParsedEMGData = {
      patient: this.extractPatientFromOriginal(originalResult),
      motorNCS: this.extractMotorNCSFromOriginal(originalResult),
      sensoryNCS: this.extractSensoryNCSFromOriginal(originalResult),
      needleEMG: this.extractNeedleEMGFromOriginal(originalResult),
      specialStudies: [],
      clinicalFindings: [],
      conclusion: this.extractConclusionFromOriginal(originalResult),
      confidence: 0.5, // Confianza media para conversión
      warnings: [],
      errors: []
    };

    return converted;
  }

  // ========== MÉTODOS DE EXTRACCIÓN ==========

  private extractPatientFromOriginal(result: any): Partial<Patient> {
    const patient: Partial<Patient> = {};
    
    if (result.patient) {
      patient.id = result.patient.id || result.patient.patientId;
      patient.firstName = result.patient.name || result.patient.firstName;
      (patient as any).age = (result.patient as any).age;
      patient.sex = result.patient.sex || result.patient.gender;
    }
    
    return patient;
  }

  private extractMotorNCSFromOriginal(result: any): NCSTestResult[] {
    const motorNCS: NCSTestResult[] = [];
    
    if (result.motorNCS && Array.isArray(result.motorNCS)) {
      result.motorNCS.forEach((ncs: any) => {
        motorNCS.push({
          id: ncs.id || `motor_${Date.now()}_${Math.random()}`,
          nerve: ncs.nerve || ncs.nerveName,
          type: 'motor',
          side: ncs.side || 'left',
          latency: ncs.latency || 0,
          amplitude: ncs.amplitude || 0,
          velocity: ncs.velocity || 0,
          status: ncs.status || 'normal',
          findings: ncs.findings || []
        });
      });
    }
    
    return motorNCS;
  }

  private extractSensoryNCSFromOriginal(result: any): NCSTestResult[] {
    const sensoryNCS: NCSTestResult[] = [];
    
    if (result.sensoryNCS && Array.isArray(result.sensoryNCS)) {
      result.sensoryNCS.forEach((ncs: any) => {
        sensoryNCS.push({
          id: ncs.id || `sensory_${Date.now()}_${Math.random()}`,
          nerve: ncs.nerve || ncs.nerveName,
          type: 'sensory',
          side: ncs.side || 'left',
          latency: ncs.latency || 0,
          amplitude: ncs.amplitude || 0,
          velocity: ncs.velocity || 0,
          status: ncs.status || 'normal',
          findings: ncs.findings || []
        });
      });
    }
    
    return sensoryNCS;
  }

  private extractNeedleEMGFromOriginal(result: any): EMGNerveRecord[] {
    const needleEMG: EMGNerveRecord[] = [];
    
    if (result.needleEMG && Array.isArray(result.needleEMG)) {
      result.needleEMG.forEach((emg: any) => {
        needleEMG.push({
          id: emg.id || `emg_${Date.now()}_${Math.random()}`,
          muscleOrNerveName: emg.muscle || emg.nerve || 'Unknown',
          side: emg.side || 'left',
          insertionalActivity: emg.insertionalActivity || 'normal',
          spontaneousActivity: {
            fibrillations: emg.fibrillations || false,
            positiveWaves: emg.positiveWaves || false,
            fasciculations: emg.fasciculations || false
          },
          motorUnitPotentials: {
            amplitude: emg.amplitude || 0,
            duration: emg.duration || 0,
            polyphasia: emg.polyphasic || false
          }
        } as EMGNerveRecord);
      });
    }
    
    return needleEMG;
  }

  private extractConclusionFromOriginal(result: any): string {
    return result.conclusion || result.diagnosis || result.impression || '';
  }

  // ========== MÉTODOS DE COMPARACIÓN ==========

  /**
   * Compara resultados del parser robusto vs sistema original
   */
  private compareResults(robustResult: ParsedEMGData, originalResult: any): ComparisonMetrics {
    const metrics: ComparisonMetrics = {
      dataCompleteness: 0,
      confidenceImprovement: 0,
      validationScore: 0,
      processingTime: 0,
      overallScore: 0
    };

    // Calcular completitud de datos
    const robustCompleteness = this.calculateDataCompleteness(robustResult);
    const originalCompleteness = this.calculateOriginalCompleteness(originalResult);
    metrics.dataCompleteness = robustCompleteness - originalCompleteness;

    // Calcular mejora de confianza
    metrics.confidenceImprovement = robustResult.confidence - 0.5; // Asumiendo confianza media del original

    // Calcular score de validación
    metrics.validationScore = this.calculateValidationScore(robustResult);

    // Calcular score general
    metrics.overallScore = (
      metrics.dataCompleteness * 0.3 +
      metrics.confidenceImprovement * 0.4 +
      metrics.validationScore * 0.3
    );

    return metrics;
  }

  private calculateDataCompleteness(data: ParsedEMGData): number {
    let completeness = 0;
    let totalChecks = 0;

    // Verificar datos del paciente
    if (Object.keys(data.patient).length > 0) completeness += 1;
    totalChecks++;

    // Verificar NCS motor
    if (data.motorNCS.length > 0) completeness += 1;
    totalChecks++;

    // Verificar NCS sensitivo
    if (data.sensoryNCS.length > 0) completeness += 1;
    totalChecks++;

    // Verificar EMG de aguja
    if (data.needleEMG.length > 0) completeness += 1;
    totalChecks++;

    // Verificar conclusión
    if (data.conclusion) completeness += 1;
    totalChecks++;

    return completeness / totalChecks;
  }

  private calculateOriginalCompleteness(originalResult: any): number {
    let completeness = 0;
    let totalChecks = 0;

    // Verificar datos del paciente
    if (originalResult.patient && Object.keys(originalResult.patient).length > 0) completeness += 1;
    totalChecks++;

    // Verificar NCS motor
    if (originalResult.motorNCS && originalResult.motorNCS.length > 0) completeness += 1;
    totalChecks++;

    // Verificar NCS sensitivo
    if (originalResult.sensoryNCS && originalResult.sensoryNCS.length > 0) completeness += 1;
    totalChecks++;

    // Verificar EMG de aguja
    if (originalResult.needleEMG && originalResult.needleEMG.length > 0) completeness += 1;
    totalChecks++;

    // Verificar conclusión
    if (originalResult.conclusion || originalResult.diagnosis) completeness += 1;
    totalChecks++;

    return completeness / totalChecks;
  }

  private calculateValidationScore(data: ParsedEMGData): number {
    let score = 0;
    let totalChecks = 0;

    // Verificar que no hay errores críticos
    if (data.errors.length === 0) score += 1;
    totalChecks++;

    // Verificar que la confianza es alta
    if (data.confidence >= 0.7) score += 1;
    totalChecks++;

    // Verificar que hay datos suficientes
    if (data.motorNCS.length > 0 || data.sensoryNCS.length > 0) score += 1;
    totalChecks++;

    return score / totalChecks;
  }

  // ========== MÉTODOS DE RECOMENDACIONES ==========

  private generateComparisonRecommendations(comparison: ComparisonMetrics): string[] {
    const recommendations: string[] = [];

    if (comparison.overallScore > 0.2) {
      recommendations.push('✅ Parser robusto muestra mejoras significativas');
    } else if (comparison.overallScore < -0.2) {
      recommendations.push('⚠️ Sistema original puede ser más efectivo para este caso');
    } else {
      recommendations.push('📊 Ambos sistemas muestran resultados similares');
    }

    if (comparison.dataCompleteness > 0.1) {
      recommendations.push('📈 Parser robusto extrae más datos completos');
    }

    if (comparison.confidenceImprovement > 0.1) {
      recommendations.push('🎯 Parser robusto proporciona mayor confianza');
    }

    return recommendations;
  }

  // ========== MÉTODOS DE VALIDACIÓN ==========

  private validateFinalResult(data: ParsedEMGData): { warnings: string[]; errors: string[] } {
    const warnings: string[] = [];
    const errors: string[] = [];

    // Validar que hay datos suficientes
    if (data.motorNCS.length === 0 && data.sensoryNCS.length === 0) {
      warnings.push('No se encontraron datos de NCS');
    }

    if (data.needleEMG.length === 0) {
      warnings.push('No se encontraron datos de EMG de aguja');
    }

    if (!data.conclusion) {
      warnings.push('No se encontró conclusión del reporte');
    }

    // Validar confianza
    if (data.confidence < 0.5) {
      warnings.push('Confianza del parsing es baja');
    }

    return { warnings, errors };
  }

  // ========== MÉTODOS PÚBLICOS ==========

  public updateConfig(newConfig: Partial<IntegrationConfig>): void {
    this.config = { ...this.config, ...newConfig };
    
    if (newConfig.parserConfig) {
      this.robustParser.updateConfig(newConfig.parserConfig);
    }
  }

  public getConfig(): IntegrationConfig {
    return { ...this.config };
  }

  public getProcessingHistory(): Map<string, IntegrationResult> {
    return new Map(this.processingHistory);
  }

  public getProcessingStats(): {
    totalProcessed: number;
    successRate: number;
    averageConfidence: number;
    averageProcessingTime: number;
  } {
    const results = Array.from(this.processingHistory.values());
    
    if (results.length === 0) {
      return {
        totalProcessed: 0,
        successRate: 0,
        averageConfidence: 0,
        averageProcessingTime: 0
      };
    }

    const successful = results.filter(r => r.success).length;
    const totalConfidence = results.reduce((sum, r) => sum + (r.data?.confidence || 0), 0);
    const totalTime = results.reduce((sum, r) => sum + (r.comparison?.processingTime || 0), 0);

    return {
      totalProcessed: results.length,
      successRate: successful / results.length,
      averageConfidence: totalConfidence / results.length,
      averageProcessingTime: totalTime / results.length
    };
  }
}

// ========== FUNCIONES DE EXPORTACIÓN ==========

export function createIntegrationService(config?: Partial<IntegrationConfig>): RobustParserIntegration {
  return RobustParserIntegration.getInstance(config);
}

export async function processEMGReportWithIntegration(
  reportText: string,
  fileName?: string,
  config?: Partial<IntegrationConfig>
): Promise<IntegrationResult> {
  const integration = createIntegrationService(config);
  return integration.processEMGReport(reportText, fileName);
}

// ========== FUNCIONES DE UTILIDAD ==========

export function getIntegrationRecommendations(): string[] {
  return [
    '🔗 Usar parser robusto como método principal',
    '🔄 Habilitar fallback al sistema original',
    '📊 Habilitar comparación automática',
    '✅ Habilitar validación de resultados',
    '🎯 Configurar umbral de confianza apropiado',
    '📈 Monitorear métricas de rendimiento'
  ];
}

export function getIntegrationBenefits(): string[] {
  return [
    '🚀 Mayor precisión en extracción de datos',
    '🛡️ Validación fisiológica robusta',
    '🧠 Aprendizaje adaptativo automático',
    '📊 Comparación automática de métodos',
    '⚡ Fallback inteligente',
    '🔍 Debugging detallado',
    '📈 Métricas de rendimiento',
    '🎯 Configuración flexible'
  ];
} 