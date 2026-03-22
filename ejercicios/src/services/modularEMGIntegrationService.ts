// 🚀 SERVICIO DE INTEGRACIÓN MODULAR EMG
// =======================================
// Conecta el nuevo analizador modular con el sistema existente
// Implementa la arquitectura mejorada propuesta

import { EnhancedEMGAnalyzer, EMGReportContainer, ModularAnalysisConfig } from './enhancedEMGAnalyzer';
import { ConversionResult, MedicalReportData } from './enhanced-file-converter';
import { EMGNerveRecord } from './jsonReportGenerator';
import { NCSTestResult } from '../types/ncs';
import { Patient } from '../types/patient';

// ========== INTERFACES DE INTEGRACIÓN ==========

export interface ModularIntegrationResult {
  success: boolean;
  originalResult: ConversionResult;
  enhancedResult: EMGReportContainer;
  integrationMetrics: {
    improvementScore: number;
    newDataExtracted: number;
    confidenceIncrease: number;
    processingTime: number;
  };
  recommendations: string[];
  warnings: string[];
}

export interface IntegrationConfig {
  enableModularAnalysis: boolean;
  enableFallbackToOriginal: boolean;
  enableQualityComparison: boolean;
  enableDetailedLogging: boolean;
  modularConfig: Partial<ModularAnalysisConfig>;
}

// ========== CLASE PRINCIPAL DE INTEGRACIÓN ==========

export class ModularEMGIntegrationService {
  private static instance: ModularEMGIntegrationService;
  private config: IntegrationConfig;
  private analyzer: EnhancedEMGAnalyzer;

  private constructor(config?: Partial<IntegrationConfig>) {
    this.config = {
      enableModularAnalysis: true,
      enableFallbackToOriginal: true,
      enableQualityComparison: true,
      enableDetailedLogging: false,
      modularConfig: {
        enableStrictValidation: true,
        enableFuzzyMatching: true,
        enableCrossValidation: true,
        minConfidenceThreshold: 0.6,
        debugMode: false
      },
      ...config
    };

    this.analyzer = EnhancedEMGAnalyzer.getInstance(this.config.modularConfig);
  }

  public static getInstance(config?: Partial<IntegrationConfig>): ModularEMGIntegrationService {
    if (!this.instance) {
      this.instance = new ModularEMGIntegrationService(config);
    }
    return this.instance;
  }

  // ========== MÉTODO PRINCIPAL DE INTEGRACIÓN ==========

  /**
   * Integra el análisis modular con el sistema existente
   * Combina lo mejor de ambos enfoques
   */
  public async integrateAnalysis(
    originalResult: ConversionResult,
    fileContent: string,
    fileName: string
  ): Promise<ModularIntegrationResult> {
    const startTime = Date.now();
    const warnings: string[] = [];
    const recommendations: string[] = [];

    try {
      if (this.config.enableDetailedLogging) {
        console.log('🔄 Iniciando integración de análisis modular');
        console.log(`📊 Resultado original - Confianza: ${(originalResult.confidence * 100).toFixed(1)}%`);
      }

      // 1. Ejecutar análisis modular
      let enhancedResult: EMGReportContainer;
      
      if (this.config.enableModularAnalysis) {
        enhancedResult = await this.analyzer.analyzeCompleteReport(fileContent, fileName);
        
        if (this.config.enableDetailedLogging) {
          console.log(`📈 Análisis modular - Confianza: ${(enhancedResult.confidence * 100).toFixed(1)}%`);
        }
      } else {
        // Fallback: crear contenedor vacío
        enhancedResult = this.createEmptyContainer(fileName);
      }

      // 2. Fusionar resultados si ambos están disponibles
      if (originalResult.success && enhancedResult.confidence > 0) {
        const fusionResult = this.fuseResults(originalResult, enhancedResult);
        enhancedResult = fusionResult.enhancedResult;
        warnings.push(...fusionResult.warnings);
        recommendations.push(...fusionResult.recommendations);
      }

      // 3. Calcular métricas de integración
      const integrationMetrics = this.calculateIntegrationMetrics(
        originalResult,
        enhancedResult,
        startTime
      );

      // 4. Generar recomendaciones
      const additionalRecommendations = this.generateRecommendations(
        originalResult,
        enhancedResult,
        integrationMetrics
      );
      recommendations.push(...additionalRecommendations);

      // 5. Validar resultado final
      if (enhancedResult.confidence < this.config.modularConfig.minConfidenceThreshold) {
        warnings.push(`Confianza final baja: ${(enhancedResult.confidence * 100).toFixed(1)}%`);
        
        if (this.config.enableFallbackToOriginal && originalResult.success) {
          enhancedResult = this.convertOriginalToContainer(originalResult, fileName);
          warnings.push('Usando resultado original como fallback');
        }
      }

      const result: ModularIntegrationResult = {
        success: enhancedResult.confidence > 0,
        originalResult,
        enhancedResult,
        integrationMetrics,
        recommendations,
        warnings
      };

      if (this.config.enableDetailedLogging) {
        console.log('✅ Integración completada:', result);
      }

      return result;

    } catch (error) {
      console.error('❌ Error en integración modular:', error);
      
      // Fallback al resultado original
      const fallbackContainer = this.convertOriginalToContainer(originalResult, fileName);
      
      return {
        success: originalResult.success,
        originalResult,
        enhancedResult: fallbackContainer,
        integrationMetrics: {
          improvementScore: 0,
          newDataExtracted: 0,
          confidenceIncrease: 0,
          processingTime: Date.now() - startTime
        },
        recommendations: ['Usar resultado original debido a error en análisis modular'],
        warnings: [`Error de integración: ${error.message}`]
      };
    }
  }

  // ========== MÉTODOS DE FUSIÓN DE RESULTADOS ==========

  /**
   * Fusiona los resultados del sistema original con el análisis modular
   */
  private fuseResults(
    original: ConversionResult,
    enhanced: EMGReportContainer
  ): { enhancedResult: EMGReportContainer; warnings: string[]; recommendations: string[] } {
    const warnings: string[] = [];
    const recommendations: string[] = [];
    const fusedResult = { ...enhanced };

    if (!original.data) {
      return { enhancedResult: fusedResult, warnings, recommendations };
    }

    // Fusionar datos del paciente
    if (original.data.patient && Object.keys(original.data.patient).length > 0) {
      fusedResult.patientInfo = {
        ...fusedResult.patientInfo,
        ...original.data.patient
      };
      recommendations.push('Datos del paciente fusionados de ambas fuentes');
    }

    // Fusionar resultados NCS
    if (original.data.ncsResults && original.data.ncsResults.length > 0) {
      const originalNCS = original.data.ncsResults;
      const enhancedNCS = [...fusedResult.motorNCS, ...fusedResult.sensoryNCS];
      
      // Combinar y deduplicar
      const combinedNCS = this.mergeNCSResults(originalNCS, enhancedNCS);
      
      // Separar por tipo
      fusedResult.motorNCS = combinedNCS.filter(ncs => ncs.type === 'motor');
      fusedResult.sensoryNCS = combinedNCS.filter(ncs => ncs.type === 'sensory');
      
      recommendations.push(`NCS fusionados: ${combinedNCS.length} registros totales`);
    }

    // Fusionar resultados EMG
    if (original.data.emgResults && original.data.emgResults.length > 0) {
      const combinedEMG = this.mergeEMGResults(original.data.emgResults, fusedResult.needleEMG);
      fusedResult.needleEMG = combinedEMG;
      recommendations.push(`EMG fusionados: ${combinedEMG.length} registros totales`);
    }

    // Fusionar estudios especiales
    if (original.data.specialStudies && original.data.specialStudies.length > 0) {
      fusedResult.fWaves = original.data.specialStudies.filter(study => 
        study.type === 'f_wave' || study.name?.toLowerCase().includes('f wave')
      );
      fusedResult.hReflexes = original.data.specialStudies.filter(study => 
        study.type === 'h_reflex' || study.name?.toLowerCase().includes('h reflex')
      );
      recommendations.push('Estudios especiales integrados del sistema original');
    }

    // Fusionar conclusiones
    if (original.data.conclusion && !fusedResult.conclusion) {
      fusedResult.conclusion = original.data.conclusion;
    } else if (original.data.conclusion && fusedResult.conclusion) {
      // Combinar conclusiones si ambas están disponibles
      fusedResult.conclusion = `${fusedResult.conclusion}\n\n${original.data.conclusion}`;
      warnings.push('Conclusiones combinadas de ambas fuentes');
    }

    // Recalcular confianza
    fusedResult.confidence = Math.min(1, enhanced.confidence + 0.1);

    return { enhancedResult: fusedResult, warnings, recommendations };
  }

  /**
   * Combina y deduplica resultados NCS
   */
  private mergeNCSResults(original: NCSTestResult[], enhanced: NCSTestResult[]): NCSTestResult[] {
    const merged = new Map<string, NCSTestResult>();
    
    // Agregar resultados originales
    original.forEach(ncs => {
      const key = `${ncs.nerve}_${ncs.type}_${ncs.side}`;
      merged.set(key, ncs);
    });
    
    // Agregar resultados mejorados (sobrescriben si tienen mejor calidad)
    enhanced.forEach(ncs => {
      const key = `${ncs.nerve}_${ncs.type}_${ncs.side}`;
      const existing = merged.get(key);
      
      if (!existing || this.isBetterNCSRecord(ncs, existing)) {
        merged.set(key, ncs);
      }
    });
    
    return Array.from(merged.values());
  }

  /**
   * Combina y deduplica resultados EMG
   */
  private mergeEMGResults(original: EMGNerveRecord[], enhanced: EMGNerveRecord[]): EMGNerveRecord[] {
    const merged = new Map<string, EMGNerveRecord>();
    
    // Agregar resultados originales
    original.forEach(emg => {
      const key = `${emg.muscleOrNerveName}_${emg.side}`;
      merged.set(key, emg);
    });
    
    // Agregar resultados mejorados
    enhanced.forEach(emg => {
      const key = `${emg.muscleOrNerveName}_${emg.side}`;
      const existing = merged.get(key);
      
      if (!existing || this.isBetterEMGRecord(emg, existing)) {
        merged.set(key, emg);
      }
    });
    
    return Array.from(merged.values());
  }

  // ========== MÉTODOS DE EVALUACIÓN DE CALIDAD ==========

  /**
   * Determina si un registro NCS es mejor que otro
   */
  private isBetterNCSRecord(newRecord: NCSTestResult, existingRecord: NCSTestResult): boolean {
    // Lógica simple: preferir registros con más datos válidos
    const newScore = this.calculateNCSQualityScore(newRecord);
    const existingScore = this.calculateNCSQualityScore(existingRecord);
    return newScore > existingScore;
  }

  /**
   * Determina si un registro EMG es mejor que otro
   */
  private isBetterEMGRecord(newRecord: EMGNerveRecord, existingRecord: EMGNerveRecord): boolean {
    const newScore = this.calculateEMGQualityScore(newRecord);
    const existingScore = this.calculateEMGQualityScore(existingRecord);
    return newScore > existingScore;
  }

  /**
   * Calcula puntuación de calidad para registro NCS
   */
  private calculateNCSQualityScore(record: NCSTestResult): number {
    let score = 0;
    if (record.latency > 0) score += 0.3;
    if (record.amplitude > 0) score += 0.3;
    if (record.velocity > 0) score += 0.2;
    if (record.findings && record.findings.length > 0) score += 0.2;
    return score;
  }

  /**
   * Calcula puntuación de calidad para registro EMG
   */
  private calculateEMGQualityScore(record: EMGNerveRecord): number {
    let score = 0;
    if (record.muscleOrNerveName && record.muscleOrNerveName !== 'Unknown') score += 0.3;
    if (record.insertionalActivity) score += 0.2;
    if (record.motorUnitPotentials.amplitude > 0) score += 0.2;
    if (record.motorUnitPotentials.duration > 0) score += 0.2;
    if (record.interpretationNotes) score += 0.1;
    return score;
  }

  // ========== MÉTODOS DE CÁLCULO DE MÉTRICAS ==========

  /**
   * Calcula métricas de integración
   */
  private calculateIntegrationMetrics(
    original: ConversionResult,
    enhanced: EMGReportContainer,
    startTime: number
  ): ModularIntegrationResult['integrationMetrics'] {
    const processingTime = Date.now() - startTime;
    
    // Calcular mejora en confianza
    const confidenceIncrease = enhanced.confidence - (original.confidence || 0);
    
    // Calcular nuevos datos extraídos
    const newDataExtracted = this.countNewDataExtracted(original, enhanced);
    
    // Calcular puntuación de mejora general
    const improvementScore = this.calculateImprovementScore(original, enhanced);

    return {
      improvementScore,
      newDataExtracted,
      confidenceIncrease,
      processingTime
    };
  }

  /**
   * Cuenta nuevos datos extraídos por el análisis modular
   */
  private countNewDataExtracted(original: ConversionResult, enhanced: EMGReportContainer): number {
    let count = 0;
    
    // Contar nuevos registros NCS
    const originalNCS = original.data?.ncsResults?.length || 0;
    const enhancedNCS = enhanced.motorNCS.length + enhanced.sensoryNCS.length;
    count += Math.max(0, enhancedNCS - originalNCS);
    
    // Contar nuevos registros EMG
    const originalEMG = original.data?.emgResults?.length || 0;
    const enhancedEMG = enhanced.needleEMG.length;
    count += Math.max(0, enhancedEMG - originalEMG);
    
    // Contar nuevos estudios especiales
    const originalSpecial = original.data?.specialStudies?.length || 0;
    const enhancedSpecial = enhanced.fWaves.length + enhanced.hReflexes.length;
    count += Math.max(0, enhancedSpecial - originalSpecial);
    
    return count;
  }

  /**
   * Calcula puntuación de mejora general
   */
  private calculateImprovementScore(original: ConversionResult, enhanced: EMGReportContainer): number {
    let score = 0;
    
    // Mejora en confianza
    const confidenceImprovement = enhanced.confidence - (original.confidence || 0);
    score += confidenceImprovement * 0.4;
    
    // Mejora en cobertura de datos
    const originalDataCount = this.countOriginalData(original);
    const enhancedDataCount = this.countEnhancedData(enhanced);
    const coverageImprovement = enhancedDataCount / Math.max(originalDataCount, 1);
    score += Math.min(coverageImprovement - 1, 0.3);
    
    // Mejora en calidad de datos
    const qualityImprovement = enhanced.qualityMetrics.validationScore - 0.5;
    score += Math.max(qualityImprovement * 0.3, 0);
    
    return Math.max(0, Math.min(1, score));
  }

  private countOriginalData(original: ConversionResult): number {
    return (
      (original.data?.ncsResults?.length || 0) +
      (original.data?.emgResults?.length || 0) +
      (original.data?.specialStudies?.length || 0)
    );
  }

  private countEnhancedData(enhanced: EMGReportContainer): number {
    return (
      enhanced.motorNCS.length +
      enhanced.sensoryNCS.length +
      enhanced.needleEMG.length +
      enhanced.fWaves.length +
      enhanced.hReflexes.length
    );
  }

  // ========== MÉTODOS DE RECOMENDACIONES ==========

  /**
   * Genera recomendaciones basadas en los resultados
   */
  private generateRecommendations(
    original: ConversionResult,
    enhanced: EMGReportContainer,
    metrics: ModularIntegrationResult['integrationMetrics']
  ): string[] {
    const recommendations: string[] = [];

    // Recomendaciones basadas en confianza
    if (enhanced.confidence < 0.7) {
      recommendations.push('Considerar revisión manual de datos extraídos');
    }

    // Recomendaciones basadas en mejora
    if (metrics.improvementScore > 0.3) {
      recommendations.push('Análisis modular proporcionó mejoras significativas');
    }

    // Recomendaciones basadas en nuevos datos
    if (metrics.newDataExtracted > 0) {
      recommendations.push(`Se extrajeron ${metrics.newDataExtracted} nuevos registros`);
    }

    // Recomendaciones basadas en calidad
    if (enhanced.qualityMetrics.validationScore < 0.6) {
      recommendations.push('Validar datos extraídos antes de usar en diagnóstico');
    }

    return recommendations;
  }

  // ========== MÉTODOS AUXILIARES ==========

  /**
   * Crea un contenedor vacío
   */
  private createEmptyContainer(fileName: string): EMGReportContainer {
    return {
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
        issues: ['Análisis modular no disponible']
      }
    };
  }

  /**
   * Convierte resultado original a contenedor
   */
  private convertOriginalToContainer(original: ConversionResult, fileName: string): EMGReportContainer {
    const container = this.createEmptyContainer(fileName);
    
    if (original.data) {
      container.patientInfo = original.data.patient || {};
      container.motorNCS = original.data.ncsResults?.filter(ncs => ncs.type === 'motor') || [];
      container.sensoryNCS = original.data.ncsResults?.filter(ncs => ncs.type === 'sensory') || [];
      container.needleEMG = original.data.emgResults || [];
      container.conclusion = original.data.conclusion || '';
      container.confidence = original.confidence;
    }
    
    return container;
  }

  // ========== MÉTODOS PÚBLICOS ADICIONALES ==========

  /**
   * Actualizar configuración
   */
  public updateConfig(newConfig: Partial<IntegrationConfig>): void {
    this.config = { ...this.config, ...newConfig };
    this.analyzer.updateConfig(this.config.modularConfig);
  }

  /**
   * Obtener configuración actual
   */
  public getConfig(): IntegrationConfig {
    return { ...this.config };
  }

  /**
   * Comparar calidad entre resultados original y mejorado
   */
  public compareQuality(original: ConversionResult, enhanced: EMGReportContainer): {
    originalScore: number;
    enhancedScore: number;
    improvement: number;
    details: string[];
  } {
    const originalScore = original.confidence || 0;
    const enhancedScore = enhanced.confidence;
    const improvement = enhancedScore - originalScore;
    
    const details: string[] = [];
    if (improvement > 0) {
      details.push(`Confianza mejorada en ${(improvement * 100).toFixed(1)}%`);
    }
    
    const originalDataCount = this.countOriginalData(original);
    const enhancedDataCount = this.countEnhancedData(enhanced);
    
    if (enhancedDataCount > originalDataCount) {
      details.push(`Se extrajeron ${enhancedDataCount - originalDataCount} registros adicionales`);
    }
    
    return {
      originalScore,
      enhancedScore,
      improvement,
      details
    };
  }
}

// ========== FUNCIONES DE EXPORTACIÓN ==========

/**
 * Crear instancia del servicio de integración
 */
export function createModularIntegrationService(
  config?: Partial<IntegrationConfig>
): ModularEMGIntegrationService {
  return ModularEMGIntegrationService.getInstance(config);
}

/**
 * Función de conveniencia para integración rápida
 */
export async function integrateEMGAnalysis(
  originalResult: ConversionResult,
  fileContent: string,
  fileName: string,
  config?: Partial<IntegrationConfig>
): Promise<ModularIntegrationResult> {
  const service = createModularIntegrationService(config);
  return service.integrateAnalysis(originalResult, fileContent, fileName);
}

/**
 * Validar si la integración fue exitosa
 */
export function isIntegrationSuccessful(result: ModularIntegrationResult): boolean {
  return result.success && result.enhancedResult.confidence >= 0.6;
} 