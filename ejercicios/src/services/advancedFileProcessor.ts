// 🚀 PROCESADOR AVANZADO DE ARCHIVOS EMG
// =====================================
// Nuevas funcionalidades y mejoras para el sistema de conversión

import { createConverter, ConversionResult, MedicalReportData } from './enhanced-file-converter';
import { getEMGAnalysis } from './emgAIAnalysisService';
import { FileConverterUtils } from '../utils/fileConverterUtils';

// ========== INTERFACES MEJORADAS ==========

export interface AdvancedProcessingOptions {
  enableBatchProcessing: boolean;
  enableProgressiveAnalysis: boolean;
  enableQualityOptimization: boolean;
  enableCrossValidation: boolean;
  maxConcurrentFiles: number;
  customValidators?: Array<(data: MedicalReportData) => ValidationResult>;
}

export interface ValidationResult {
  isValid: boolean;
  score: number;
  issues: Array<{
    type: 'warning' | 'error' | 'info';
    message: string;
    suggestion?: string;
  }>;
}

export interface ProcessingMetrics {
  totalFilesProcessed: number;
  successRate: number;
  averageConfidenceScore: number;
  averageProcessingTime: number;
  qualityDistribution: {
    excellent: number; // >90%
    good: number;      // 70-90%
    fair: number;      // 50-70%
    poor: number;      // <50%
  };
  commonIssues: Array<{
    issue: string;
    frequency: number;
    impact: 'low' | 'medium' | 'high';
  }>;
}

export interface BatchProcessingResult {
  results: ConversionResult[];
  metrics: ProcessingMetrics;
  consolidatedData: {
    patientsProcessed: number;
    totalNCSTests: number;
    totalEMGTests: number;
    diagnosticPatterns: Array<{
      pattern: string;
      frequency: number;
      confidence: number;
    }>;
  };
  recommendations: string[];
}

// ========== CLASE PRINCIPAL ==========

export class AdvancedFileProcessor {
  private converter = createConverter({
    enableValidation: true,
    enableAIEnhancement: true,
    minConfidenceThreshold: 0.7,
    debugMode: false
  });

  private cache = new FileConverterUtils.Cache();
  private processingHistory: ConversionResult[] = [];

  constructor(private options: AdvancedProcessingOptions) {}

  // 📁 PROCESAMIENTO INTELIGENTE DE ARCHIVO ÚNICO
  public async processFileIntelligent(file: File): Promise<{
    result: ConversionResult;
    analysis: string | null;
    qualityReport: any;
    recommendations: string[];
  }> {
    console.log(`🔄 Procesando archivo inteligente: ${file.name}`);

    // Verificar cache primero
    const cachedResult = await this.cache.get(file);
    if (cachedResult) {
      console.log('✅ Resultado obtenido desde cache');
      return {
        result: cachedResult,
        analysis: null,
        qualityReport: null,
        recommendations: ['Resultado obtenido desde cache']
      };
    }

    // Procesamiento normal
    const result = await this.converter.convert(file);
    
    if (!result.success) {
      return {
        result,
        analysis: null,
        qualityReport: null,
        recommendations: this.generateErrorRecommendations(result.errors)
      };
    }

    // Guardar en cache
    await this.cache.set(file, result);
    this.processingHistory.push(result);

    // Análisis con IA
    let analysis = null;
    if (result.data?.emgResults && result.data.emgResults.length > 0) {
      try {
        analysis = await this.performEnhancedAIAnalysis(result.data, file.name);
      } catch (error) {
        console.warn('Error en análisis IA:', error);
      }
    }

    // Reporte de calidad
    const qualityReport = this.generateAdvancedQualityReport(result);

    // Recomendaciones inteligentes
    const recommendations = this.generateIntelligentRecommendations(result, qualityReport);

    return {
      result,
      analysis,
      qualityReport,
      recommendations
    };
  }

  // 📚 PROCESAMIENTO POR LOTES OPTIMIZADO
  public async processBatchOptimized(files: File[]): Promise<BatchProcessingResult> {
    console.log(`🗂️ Iniciando procesamiento por lotes de ${files.length} archivos`);

    const results: ConversionResult[] = [];
    const startTime = Date.now();
    const maxConcurrent = Math.min(this.options.maxConcurrentFiles, 3);

    // Procesar archivos en chunks concurrentes
    for (let i = 0; i < files.length; i += maxConcurrent) {
      const chunk = files.slice(i, i + maxConcurrent);
      
      // Procesar cada archivo del chunk secuencialmente para compatibilidad
      for (let j = 0; j < chunk.length; j++) {
        try {
          const result = await this.processFileWithRetry(chunk[j]);
          results.push(result);
        } catch (error) {
          console.error(`Error procesando ${chunk[j].name}:`, error);
          results.push(this.createErrorResult(chunk[j], error));
        }
      }

      // Progreso
      console.log(`📊 Progreso: ${Math.min(i + maxConcurrent, files.length)}/${files.length}`);
    }

    // Generar métricas
    const metrics = this.calculateProcessingMetrics(results);
    
    // Datos consolidados
    const consolidatedData = this.consolidateData(results);
    
    // Recomendaciones del lote
    const recommendations = this.generateBatchRecommendations(results, metrics);

    const totalTime = Date.now() - startTime;
    console.log(`✅ Lote completado en ${totalTime}ms`);

    return {
      results,
      metrics,
      consolidatedData,
      recommendations
    };
  }

  // 🔍 ANÁLISIS DE PATRONES DIAGNÓSTICOS
  public async analyzePattern(results: ConversionResult[]): Promise<{
    patterns: Array<{
      name: string;
      frequency: number;
      confidence: number;
      description: string;
    }>;
    insights: string[];
    recommendations: string[];
  }> {
    const validResults = results.filter(r => r.success && r.data);
    
    if (validResults.length === 0) {
      return { patterns: [], insights: [], recommendations: [] };
    }

    // Analizar patrones de diagnóstico
    const diagnosisMap = new Map<string, number>();
    const ncsPatterns = new Map<string, number>();
    const emgPatterns = new Map<string, number>();

    validResults.forEach(result => {
      const data = result.data!;
      
      // Patrones de diagnóstico
      if (data.diagnosis) {
        const normalizedDiagnosis = this.normalizeDiagnosis(data.diagnosis);
        diagnosisMap.set(normalizedDiagnosis, (diagnosisMap.get(normalizedDiagnosis) || 0) + 1);
      }

      // Patrones NCS
      if (data.ncsResults) {
        data.ncsResults.forEach(ncs => {
          const pattern = `${ncs.nerve}_${ncs.type}_${ncs.status}`;
          ncsPatterns.set(pattern, (ncsPatterns.get(pattern) || 0) + 1);
        });
      }

      // Patrones EMG
      if (data.emgResults) {
        data.emgResults.forEach(emg => {
          const pattern = `${emg.muscleOrNerveName}_${emg.insertionalActivity}`;
          emgPatterns.set(pattern, (emgPatterns.get(pattern) || 0) + 1);
        });
      }
    });

    // Crear patrones consolidados
    const patterns: Array<{
      name: string;
      frequency: number;
      confidence: number;
      description: string;
    }> = [];

    // Agregar patrones de diagnóstico
    diagnosisMap.forEach((count, diagnosis) => {
      const frequency = count / validResults.length;
      if (frequency > 0.1) { // Solo patrones con >10% frecuencia
        patterns.push({
          name: `Diagnóstico: ${diagnosis}`,
          frequency,
          confidence: this.calculatePatternConfidence(count, validResults.length),
          description: `Patrón diagnóstico encontrado en ${count} de ${validResults.length} casos`
        });
      }
    });

    // Insights automáticos
    const insights = this.generatePatternInsights(patterns, validResults);
    
    // Recomendaciones basadas en patrones
    const recommendations = this.generatePatternRecommendations(patterns);

    return { patterns, insights, recommendations };
  }

  // 📊 MÉTRICAS AVANZADAS
  public getAdvancedMetrics(): ProcessingMetrics & {
    cacheEfficiency: number;
    errorPatterns: Array<{ error: string; frequency: number }>;
    processingTrends: Array<{ date: string; avgConfidence: number; avgTime: number }>;
  } {
    const baseMetrics = this.calculateProcessingMetrics(this.processingHistory);
    
    // Eficiencia de cache
    const cacheStats = this.cache.getStats();
    const cacheEfficiency = cacheStats.hitRate;

    // Patrones de error
    const errorMap = new Map<string, number>();
    this.processingHistory.forEach(result => {
      result.errors.forEach(error => {
        errorMap.set(error.code, (errorMap.get(error.code) || 0) + 1);
      });
    });

    const errorPatterns = Array.from(errorMap.entries()).map(([error, frequency]) => ({
      error,
      frequency
    }));

    // Tendencias de procesamiento (últimos 7 días)
    const processingTrends = this.calculateProcessingTrends();

    return {
      ...baseMetrics,
      cacheEfficiency,
      errorPatterns,
      processingTrends
    };
  }

  // 🔧 MÉTODOS PRIVADOS AUXILIARES

  private async processFileWithRetry(file: File, maxRetries = 2): Promise<ConversionResult> {
    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await this.converter.convert(file);
      } catch (error) {
        lastError = error instanceof Error ? error : new Error('Error desconocido');
        console.warn(`Intento ${attempt + 1} falló para ${file.name}:`, lastError.message);
        
        if (attempt < maxRetries) {
          // Esperar antes del siguiente intento
          await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
        }
      }
    }

    // Si todos los intentos fallaron
    throw lastError || new Error('Procesamiento falló después de múltiples intentos');
  }

  private createErrorResult(file: File, error: any): ConversionResult {
    return {
      success: false,
      errors: [{
        code: 'PROCESSING_FAILED',
        message: error instanceof Error ? error.message : 'Error desconocido',
        severity: 'critical'
      }],
      warnings: [],
      confidence: 0,
      metadata: {
        originalFileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        processedAt: new Date().toISOString(),
        processingTimeMs: 0,
        extractedTextLength: 0,
        sectionsFound: [],
        aiEnhanced: false,
        version: '2.0.0'
      }
    };
  }

  private calculateProcessingMetrics(results: ConversionResult[]): ProcessingMetrics {
    const total = results.length;
    const successful = results.filter(r => r.success);
    const successCount = successful.length;
    
    const avgConfidence = successCount > 0 
      ? successful.reduce((sum, r) => sum + r.confidence, 0) / successCount
      : 0;
      
    const avgTime = successCount > 0
      ? successful.reduce((sum, r) => sum + r.metadata.processingTimeMs, 0) / successCount
      : 0;

    // Distribución de calidad
    const excellent = successful.filter(r => r.confidence > 0.9).length;
    const good = successful.filter(r => r.confidence > 0.7 && r.confidence <= 0.9).length;
    const fair = successful.filter(r => r.confidence > 0.5 && r.confidence <= 0.7).length;
    const poor = successful.filter(r => r.confidence <= 0.5).length;

    // Problemas comunes
    const issueMap = new Map<string, number>();
    results.forEach(result => {
      result.errors.forEach(error => {
        issueMap.set(error.message, (issueMap.get(error.message) || 0) + 1);
      });
    });

    const commonIssues = Array.from(issueMap.entries())
      .map(([issue, frequency]) => ({
        issue,
        frequency,
        impact: frequency > total * 0.1 ? 'high' as const : 
                frequency > total * 0.05 ? 'medium' as const : 'low' as const
      }))
      .sort((a, b) => b.frequency - a.frequency)
      .slice(0, 5);

    return {
      totalFilesProcessed: total,
      successRate: total > 0 ? successCount / total : 0,
      averageConfidenceScore: avgConfidence,
      averageProcessingTime: avgTime,
      qualityDistribution: {
        excellent,
        good,
        fair,
        poor
      },
      commonIssues
    };
  }

  private consolidateData(results: ConversionResult[]) {
    const validResults = results.filter(r => r.success && r.data);
    
    const patientsProcessed = validResults.length;
    const totalNCSTests = validResults.reduce((sum, r) => 
      sum + (r.data?.ncsResults?.length || 0), 0);
    const totalEMGTests = validResults.reduce((sum, r) => 
      sum + (r.data?.emgResults?.length || 0), 0);

    // Patrones diagnósticos
    const diagnosisMap = new Map<string, number>();
    validResults.forEach(result => {
      if (result.data?.diagnosis) {
        const normalized = this.normalizeDiagnosis(result.data.diagnosis);
        diagnosisMap.set(normalized, (diagnosisMap.get(normalized) || 0) + 1);
      }
    });

    const diagnosticPatterns = Array.from(diagnosisMap.entries())
      .map(([pattern, frequency]) => ({
        pattern,
        frequency,
        confidence: frequency / validResults.length
      }))
      .sort((a, b) => b.frequency - a.frequency);

    return {
      patientsProcessed,
      totalNCSTests,
      totalEMGTests,
      diagnosticPatterns
    };
  }

  private async performEnhancedAIAnalysis(data: MedicalReportData, fileName: string): Promise<string> {
    const patientData = {
      age: this.calculateAge(data.patient.dateOfBirth),
      gender: data.patient.sex,
      medicalHistory: data.notes
    };

    return await getEMGAnalysis(
      {
        id: crypto.randomUUID(),
        results: data.emgResults || []
      },
      patientData,
      { saveAnalysis: true, patientId: data.patient.id }
    );
  }

  private generateAdvancedQualityReport(result: ConversionResult) {
    if (!result.data) return null;
    
    const baseReport = FileConverterUtils.Quality.generateQualityReport(result.data, '');
    
    // Agregar análisis específicos de EMG
    const emgQuality = this.assessEMGQuality(result.data);
    const ncsQuality = this.assessNCSQuality(result.data);
    
    return {
      ...baseReport,
      emgSpecificQuality: emgQuality,
      ncsSpecificQuality: ncsQuality,
      overallScore: (baseReport.overallScore + emgQuality.score + ncsQuality.score) / 3
    };
  }

  private assessEMGQuality(data: MedicalReportData): { score: number; issues: string[] } {
    const issues: string[] = [];
    let score = 1.0;

    if (!data.emgResults || data.emgResults.length === 0) {
      issues.push('No se encontraron datos EMG');
      score -= 0.5;
    } else {
      // Verificar completitud de datos EMG
      const incompleteEMG = data.emgResults.filter(emg => 
        !emg.insertionalActivity || 
        !emg.spontaneousActivity ||
        !emg.recruitmentPattern
      );
      
      if (incompleteEMG.length > 0) {
        issues.push(`${incompleteEMG.length} registros EMG incompletos`);
        score -= 0.2;
      }
    }

    return { score: Math.max(0, score), issues };
  }

  private assessNCSQuality(data: MedicalReportData): { score: number; issues: string[] } {
    const issues: string[] = [];
    let score = 1.0;

    if (!data.ncsResults || data.ncsResults.length === 0) {
      issues.push('No se encontraron datos NCS');
      score -= 0.5;
    } else {
      // Verificar valores NCS realistas
      const unrealisticNCS = data.ncsResults.filter(ncs => 
        ncs.latency < 1 || ncs.latency > 50 ||
        ncs.amplitude < 0.1 || ncs.amplitude > 200 ||
        ncs.velocity < 20 || ncs.velocity > 120
      );
      
      if (unrealisticNCS.length > 0) {
        issues.push(`${unrealisticNCS.length} valores NCS fuera de rangos normales`);
        score -= 0.3;
      }
    }

    return { score: Math.max(0, score), issues };
  }

  private generateIntelligentRecommendations(result: ConversionResult, qualityReport: any): string[] {
    const recommendations: string[] = [];

    if (result.confidence < 0.8) {
      recommendations.push('Revisar manualmente los datos extraídos debido a baja confianza');
    }

    if (qualityReport?.emgSpecificQuality?.issues?.length > 0) {
      recommendations.push('Verificar completitud de datos EMG');
    }

    if (qualityReport?.ncsSpecificQuality?.issues?.length > 0) {
      recommendations.push('Validar valores NCS extraídos');
    }

    if (result.errors.length > 0) {
      recommendations.push('Corregir errores identificados durante la conversión');
    }

    return recommendations;
  }

  private generateErrorRecommendations(errors: any[]): string[] {
    return errors.map(error => {
      switch (error.code) {
        case 'INSUFFICIENT_TEXT':
          return 'Verificar que el archivo no esté corrupto';
        case 'FILE_TOO_LARGE':
          return 'Comprimir el archivo o dividirlo';
        default:
          return 'Revisar el archivo y volver a intentar';
      }
    });
  }

  private generateBatchRecommendations(results: ConversionResult[], metrics: ProcessingMetrics): string[] {
    const recommendations: string[] = [];

    if (metrics.successRate < 0.8) {
      recommendations.push('Revisar configuración del convertidor - tasa de éxito baja');
    }

    if (metrics.averageConfidenceScore < 0.7) {
      recommendations.push('Mejorar calidad de archivos de entrada');
    }

    if (metrics.commonIssues.length > 0) {
      recommendations.push(`Abordar problema común: ${metrics.commonIssues[0].issue}`);
    }

    return recommendations;
  }

  private normalizeDiagnosis(diagnosis: string): string {
    return diagnosis
      .toLowerCase()
      .replace(/[^\w\s]/g, '')
      .trim();
  }

  private generatePatternInsights(patterns: any[], results: ConversionResult[]): string[] {
    const insights: string[] = [];

    if (patterns.length > 0) {
      const mostCommon = patterns[0];
      insights.push(`Patrón más común: ${mostCommon.name} (${(mostCommon.frequency * 100).toFixed(1)}%)`);
    }

    const avgConfidence = results
      .filter(r => r.success)
      .reduce((sum, r) => sum + r.confidence, 0) / results.length;
    
    insights.push(`Confianza promedio del lote: ${(avgConfidence * 100).toFixed(1)}%`);

    return insights;
  }

  private generatePatternRecommendations(patterns: any[]): string[] {
    const recommendations: string[] = [];

    if (patterns.length > 3) {
      recommendations.push('Considerar crear templates específicos para los patrones más comunes');
    }

    recommendations.push('Revisar y validar los patrones identificados con personal médico');

    return recommendations;
  }

  private calculatePatternConfidence(count: number, total: number): number {
    const frequency = count / total;
    // Confianza basada en frecuencia y tamaño de muestra
    return Math.min(1, frequency * Math.log(total + 1) / Math.log(10));
  }

  private calculateAge(dateOfBirth?: string): number {
    if (!dateOfBirth) return 0;
    
    const birthDate = new Date(dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  }

  private calculateProcessingTrends(): Array<{ date: string; avgConfidence: number; avgTime: number }> {
    const trends: Array<{ date: string; avgConfidence: number; avgTime: number }> = [];
    const today = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      const dayResults = this.processingHistory.filter(r => 
        r.metadata.processedAt.startsWith(dateStr) && r.success
      );
      
      if (dayResults.length > 0) {
        const avgConfidence = dayResults.reduce((sum, r) => sum + r.confidence, 0) / dayResults.length;
        const avgTime = dayResults.reduce((sum, r) => sum + r.metadata.processingTimeMs, 0) / dayResults.length;
        
        trends.push({ date: dateStr, avgConfidence, avgTime });
      }
    }
    
    return trends;
  }
}

// ========== FUNCIONES DE UTILIDAD ==========

export function createAdvancedProcessor(options: Partial<AdvancedProcessingOptions> = {}): AdvancedFileProcessor {
  const defaultOptions: AdvancedProcessingOptions = {
    enableBatchProcessing: true,
    enableProgressiveAnalysis: true,
    enableQualityOptimization: true,
    enableCrossValidation: true,
    maxConcurrentFiles: 3,
    customValidators: []
  };

  return new AdvancedFileProcessor({ ...defaultOptions, ...options });
}

export function validateMedicalData(data: MedicalReportData): ValidationResult {
  const issues: ValidationResult['issues'] = [];
  let score = 1.0;

  // Validar datos del paciente
  if (!data.patient.id) {
    issues.push({
      type: 'error',
      message: 'ID del paciente faltante',
      suggestion: 'Verificar que el archivo contenga el ID del paciente'
    });
    score -= 0.2;
  }

  if (!data.patient.firstName && !data.patient.lastName) {
    issues.push({
      type: 'warning',
      message: 'Nombre del paciente no encontrado',
      suggestion: 'Revisar la sección de datos demográficos'
    });
    score -= 0.1;
  }

  // Validar datos médicos
  if (!data.ncsResults || data.ncsResults.length === 0) {
    issues.push({
      type: 'warning',
      message: 'No se encontraron datos NCS',
      suggestion: 'Verificar que el archivo contenga estudios de neuroconducción'
    });
    score -= 0.3;
  }

  if (!data.emgResults || data.emgResults.length === 0) {
    issues.push({
      type: 'warning',
      message: 'No se encontraron datos EMG',
      suggestion: 'Verificar que el archivo contenga estudios electromiográficos'
    });
    score -= 0.3;
  }

  return {
    isValid: score >= 0.5,
    score: Math.max(0, score),
    issues
  };
} 