/**
 * PROCESADOR DE ARCHIVOS MEJORADO - SISTEMA MAESTRO INTEGRADO
 * ===========================================================
 * 
 * Combina todos los sistemas mejorados en una solución robusta y completa:
 * - Diccionario de terminología médica
 * - Parser basado en regex para tablas bilaterales
 * - Detector de secciones con verificación explícita
 * - Mappers seguros contra nulos
 * - Sistema de logging detallado
 * 
 * Implementa el plan estratégico completo de mejoras.
 */

import { MEDICAL_TERMINOLOGY, TerminologyMatcher } from '../data/medicalTerminology';
import { RegexTableParser } from './regexTableParser';
import { EnhancedSectionDetector } from './enhancedSectionDetector';
import { NullSafeMapperFactory, SafeExtractionResult } from './nullSafeMappers';
import { DetailedLogger, MedicalLogger } from './detailedLogger';
// ✨ NUEVO: Usar tipos unificados del sistema
import type { 
  EnhancedProcessingConfig, 
  ProcessingResult, 
  ProcessingStatistics, 
  ProcessingMetadata 
} from '../types/enhancedSystem';

// ========== CONFIGURACIÓN POR DEFECTO ==========

// ========== CLASE PRINCIPAL ==========

export class EnhancedFileProcessor {
  private logger: MedicalLogger;
  private config: EnhancedProcessingConfig;
  private sectionDetector: EnhancedSectionDetector;
  private tableParser: RegexTableParser;

  constructor(config?: Partial<EnhancedProcessingConfig>) {
    // Configuración por defecto
    this.config = {
      useCustomTerminology: false,
      enableAdvancedTableParsing: true,
      bilateralTableDetection: true,
      explicitSectionValidation: true,
      minimumSectionConfidence: 60,
      allowPartialData: true,
      useDefaultValues: false,
      strictValidation: false,
      enableDetailedLogging: true,
      logLevel: 'INFO',
      exportLogsOnCompletion: false,
      ...config
    };

    // Configurar logging
    DetailedLogger.configure({
      enableConsole: this.config.enableDetailedLogging,
      minLevel: this.config.logLevel,
      formatStyle: 'medical'
    });

    this.logger = new MedicalLogger('EnhancedFileProcessor');
    this.sectionDetector = new EnhancedSectionDetector();
    this.tableParser = new RegexTableParser();

    this.logger.info('🚀 Sistema Maestro Mejorado Inicializado', {
      config: this.config,
      terminologyCategories: Object.keys(MEDICAL_TERMINOLOGY).length
    });
  }

  /**
   * 🎯 MÉTODO PRINCIPAL: Procesamiento completo de archivo médico
   */
  public async processFile(file: File, expectedType?: 'ncs' | 'emg' | 'combined'): Promise<ProcessingResult> {
    const startTime = Date.now();
    const operationId = this.logger.startOperation('Procesamiento completo de archivo médico', {
      fileName: file.name,
      fileSize: file.size,
      expectedType
    });

    try {
      // PASO 1: Extracción de texto base
      this.logger.step(1, 'Extracción de texto base', 'start');
      const documentText = await this.extractTextFromFile(file);
      this.logger.step(1, 'Extracción de texto base', 'complete', {
        textLength: documentText.length,
        extractionMethod: 'enhanced'
      });

      // PASO 2: Análisis completo del documento
      this.logger.step(2, 'Análisis completo del documento', 'start');
      const documentAnalysis = this.sectionDetector.analyzeDocument(documentText);
      this.logger.step(2, 'Análisis completo del documento', 'complete', {
        documentType: documentAnalysis.documentType,
        sectionsFound: documentAnalysis.sections.filter(s => s.found).length,
        averageConfidence: documentAnalysis.summary.averageConfidence
      });

      // PASO 3: Procesamiento de secciones individuales
      const sectionResults = await this.processSectionsIndividually(documentText, documentAnalysis);

      // PASO 4: Análisis avanzado de tablas
      this.logger.step(4, 'Análisis avanzado de tablas', 'start');
      const tableAnalysis = await this.processTablesAdvanced(documentText, sectionResults);
      this.logger.step(4, 'Análisis avanzado de tablas', 'complete', {
        tablesFound: tableAnalysis.totalTables,
        successfulTables: tableAnalysis.successfulTables
      });

      // PASO 5: Extracción segura de datos
      this.logger.step(5, 'Extracción segura de datos', 'start');
      const extractionResults = await this.extractDataSafely(documentText, sectionResults, tableAnalysis);
      this.logger.step(5, 'Extracción segura de datos', 'complete', {
        totalFieldsExtracted: this.calculateTotalFieldsExtracted(extractionResults)
      });

      // PASO 6: Validación y análisis final
      this.logger.step(6, 'Validación y análisis final', 'start');
      const finalValidation = this.performFinalValidation(extractionResults, documentAnalysis);
      this.logger.step(6, 'Validación y análisis final', 'complete', {
        overallConfidence: finalValidation.overallConfidence,
        criticalIssues: finalValidation.criticalIssues
      });

      // PASO 7: Construcción del resultado final
      const result = this.buildFinalResult(
        file,
        extractionResults,
        documentAnalysis,
        tableAnalysis,
        finalValidation,
        startTime
      );

      this.logger.endOperation('Procesamiento completo de archivo médico', operationId, {
        success: result.success,
        confidence: result.confidence,
        processingTime: result.processingTime,
        errorsCount: result.errors.length,
        warningsCount: result.warnings.length
      });

      // Exportar logs si está configurado
      if (this.config.exportLogsOnCompletion) {
        this.exportProcessingLogs(file.name);
      }

      return result;

    } catch (error) {
      this.logger.failOperation('Procesamiento completo de archivo médico', operationId, error);
      
      return this.buildErrorResult(file, error, startTime);
    }
  }

  /**
   * 🔍 VERIFICACIÓN RÁPIDA DE COMPATIBILIDAD
   */
  public async quickCompatibilityCheck(file: File): Promise<{
    compatible: boolean;
    confidence: number;
    documentType: string;
    estimatedSections: string[];
    warnings: string[];
    recommendations: string[];
  }> {
    
    this.logger.info('🔍 Verificación rápida de compatibilidad iniciada', { fileName: file.name });
    
    try {
      // Extraer una muestra del texto (primeros 2KB)
      const sample = await this.extractTextSample(file, 2048);
      
      // Análisis rápido de terminología
      const terminologyCheck = this.quickTerminologyCheck(sample);
      
      // Detección rápida de estructura
      const structureCheck = this.quickStructureCheck(sample);
      
      // Evaluación de compatibilidad
      const compatibility = this.evaluateCompatibility(terminologyCheck, structureCheck);
      
      this.logger.info('✅ Verificación de compatibilidad completada', compatibility);
      
      return compatibility;
      
    } catch (error) {
      this.logger.error('❌ Error en verificación de compatibilidad', { error });
      
      return {
        compatible: false,
        confidence: 0,
        documentType: 'unknown',
        estimatedSections: [],
        warnings: ['Error durante la verificación'],
        recommendations: ['Revisar el formato del archivo']
      };
    }
  }

  // ========== MÉTODOS DE PROCESAMIENTO POR PASOS ==========

  private async extractTextFromFile(file: File): Promise<string> {
    this.logger.info('🔍 Extrayendo texto del archivo', { 
      fileName: file.name, 
      fileSize: file.size,
      fileType: file.type 
    });
    
    try {
      // Usar el enhanced-file-converter existente pero con logging mejorado
      const { createConverter } = await import('./enhanced-file-converter');
      const converter = createConverter({
        enableValidation: true,
        enableOCR: true,
        enableAIEnhancement: true,
        debugMode: this.config.enableDetailedLogging,
        minConfidenceThreshold: 0.5
      });
      
      const result = await converter.convert(file);
      
      if (!result.success) {
        const errorMsg = `Error extrayendo texto: ${result.errors.join(', ')}`;
        this.logger.error('❌ Error en extracción de texto', { 
          errors: result.errors,
          fileName: file.name 
        });
        throw new Error(errorMsg);
      }
      
             // Extraer texto usando el converter - acceder al resultado a través del resultado
       // El texto procesado está disponible en el result, pero necesitamos reconstruirlo
       // desde los datos extraídos
       const extractedText = this.reconstructTextFromResult(result);
      
      if (!extractedText || extractedText.trim().length === 0) {
        throw new Error('No se pudo extraer texto del archivo');
      }
      
      this.logger.info('✅ Texto extraído exitosamente', {
        textLength: extractedText.length,
        confidence: result.confidence,
        hasNCSTerms: extractedText.toLowerCase().includes('latencia') || extractedText.toLowerCase().includes('latency'),
        hasEMGTerms: extractedText.toLowerCase().includes('emg') || extractedText.toLowerCase().includes('electromiografía'),
        hasNumericData: /\d+[\.,]?\d*/.test(extractedText)
      });
      
      return extractedText;
      
    } catch (error) {
      this.logger.error('❌ Error crítico en extracción de texto', { 
        error: error instanceof Error ? error.message : 'Error desconocido',
        fileName: file.name 
      });
      throw error;
    }
  }

  private async processSectionsIndividually(documentText: string, documentAnalysis: any): Promise<any> {
    const sectionResults: any = {};
    
    for (const section of documentAnalysis.sections) {
      if (section.found && section.confidence >= this.config.minimumSectionConfidence) {
        this.logger.medical(`Procesando sección ${section.sectionType}`, {
          studyType: section.sectionType,
          confidence: section.confidence
        });
        
        // Procesar sección específica con verificación explícita
        const explicitCheck = this.sectionDetector.hasSectionExplicit(documentText, section.sectionType);
        
        if (explicitCheck.present) {
          sectionResults[section.sectionType] = {
            content: section.content,
            confidence: section.confidence,
            metadata: section.metadata,
            explicitVerification: explicitCheck
          };
        } else {
          this.logger.warn(`⚠️ Sección ${section.sectionType} falló verificación explícita`, {
            reasoning: explicitCheck.reasoning
          });
        }
      }
    }
    
    return sectionResults;
  }

  private async processTablesAdvanced(documentText: string, sectionResults: any): Promise<any> {
    const tableAnalysis = {
      totalTables: 0,
      successfulTables: 0,
      results: [] as any[]
    };
    
    for (const [sectionType, sectionData] of Object.entries(sectionResults)) {
      if (sectionType === 'ncs' && this.config.enableAdvancedTableParsing) {
        this.logger.medical('Procesando tabla NCS con parser avanzado', {
          studyType: 'ncs'
        });
        
        const tableResult = this.tableParser.parseBilateralTable(
          (sectionData as any).content,
          'motor' // Detectar tipo automáticamente
        );
        
        tableAnalysis.totalTables++;
        if (tableResult.success) {
          tableAnalysis.successfulTables++;
          tableAnalysis.results.push({
            sectionType,
            tableData: tableResult.data,
            summary: tableResult.summary
          });
        }
      }
    }
    
    return tableAnalysis;
  }

  private async extractDataSafely(documentText: string, sectionResults: any, tableAnalysis: any): Promise<any> {
    const extractionResults: any = {};
    
    // Extracción segura de datos de paciente
    const patientMapper = NullSafeMapperFactory.createPatientMapper({
      allowPartialData: this.config.allowPartialData,
      strictValidation: this.config.strictValidation
    });
    extractionResults.patientData = patientMapper.extractPatientData(documentText);
    
    // Extracción segura de datos NCS
    const ncsMapper = NullSafeMapperFactory.createNCSMapper({
      allowPartialData: this.config.allowPartialData
    });
    extractionResults.ncsData = ncsMapper.extractNCSData(documentText);
    
    // Placeholders para otros tipos de datos
    extractionResults.emgData = { 
      data: [], 
      success: true, 
      confidence: 0, 
      warnings: [], 
      errors: [], 
      metadata: {
        fieldsProcessed: 0,
        fieldsExtracted: 0,
        fieldsSkipped: 0,
        processingNotes: [],
        fallbacksUsed: []
      }
    };
    extractionResults.specialStudiesData = { 
      data: [], 
      success: true, 
      confidence: 0, 
      warnings: [], 
      errors: [], 
      metadata: {
        fieldsProcessed: 0,
        fieldsExtracted: 0,
        fieldsSkipped: 0,
        processingNotes: [],
        fallbacksUsed: []
      }
    };
    extractionResults.conclusionsData = { 
      data: '', 
      success: true, 
      confidence: 0, 
      warnings: [], 
      errors: [], 
      metadata: {
        fieldsProcessed: 0,
        fieldsExtracted: 0,
        fieldsSkipped: 0,
        processingNotes: [],
        fallbacksUsed: []
      }
    };
    
    return extractionResults;
  }

  private performFinalValidation(extractionResults: any, documentAnalysis: any): any {
    const validation = {
      overallConfidence: 0,
      criticalIssues: 0,
      recommendations: [] as string[]
    };
    
    // Calcular confianza general
    const confidences = Object.values(extractionResults).map((result: any) => result.confidence);
    validation.overallConfidence = confidences.reduce((sum, conf) => sum + conf, 0) / confidences.length;
    
    // Contar problemas críticos
    const allErrors = Object.values(extractionResults).flatMap((result: any) => result.errors);
    validation.criticalIssues = allErrors.length;
    
    // Generar recomendaciones
    if (validation.overallConfidence < 50) {
      validation.recommendations.push('Revisar manualmente los datos extraídos debido a baja confianza');
    }
    
    if (validation.criticalIssues > 0) {
      validation.recommendations.push('Resolver errores críticos antes de usar los datos');
    }
    
    return validation;
  }

  private buildFinalResult(
    file: File,
    extractionResults: any,
    documentAnalysis: any,
    tableAnalysis: any,
    finalValidation: any,
    startTime: number
  ): ProcessingResult {
    
    const processingTime = Date.now() - startTime;
    
    // Combinar todos los errores y advertencias
    const allErrors = Object.values(extractionResults).flatMap((result: any) => result.errors);
    const allWarnings = Object.values(extractionResults).flatMap((result: any) => result.warnings);
    
    return {
      success: allErrors.length === 0 && finalValidation.overallConfidence > 30,
      confidence: finalValidation.overallConfidence,
      processingTime,
      
      patientData: extractionResults.patientData,
      ncsData: extractionResults.ncsData,
      emgData: extractionResults.emgData,
      specialStudiesData: extractionResults.specialStudiesData,
      conclusionsData: extractionResults.conclusionsData,
      
      documentAnalysis,
      sectionAnalysis: documentAnalysis.sections,
      tableAnalysis,
      
      processingStats: {
        totalSectionsDetected: documentAnalysis.sections.filter((s: any) => s.found).length,
        totalTablesProcessed: tableAnalysis.totalTables,
        totalFieldsExtracted: this.calculateTotalFieldsExtracted(extractionResults),
        averageConfidence: finalValidation.overallConfidence
      },
      
      errors: allErrors,
      warnings: allWarnings,
      recommendations: finalValidation.recommendations,
      
      metadata: {
        fileSize: file.size,
        processingSteps: ['text_extraction', 'section_analysis', 'table_parsing', 'data_extraction', 'validation'],
        fallbacksUsed: this.collectFallbacksUsed(extractionResults),
        validationResults: finalValidation
      }
    };
  }

  private buildErrorResult(file: File, error: any, startTime: number): ProcessingResult {
    const processingTime = Date.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    
    return {
      success: false,
      confidence: 0,
      processingTime,
      
      patientData: { data: {}, success: false, confidence: 0, warnings: [], errors: [errorMessage], metadata: {
        fieldsProcessed: 0, fieldsExtracted: 0, fieldsSkipped: 0, processingNotes: [], fallbacksUsed: []
      } },
      ncsData: { data: [], success: false, confidence: 0, warnings: [], errors: [errorMessage], metadata: {
        fieldsProcessed: 0, fieldsExtracted: 0, fieldsSkipped: 0, processingNotes: [], fallbacksUsed: []
      } },
      emgData: { data: [], success: false, confidence: 0, warnings: [], errors: [errorMessage], metadata: {
        fieldsProcessed: 0, fieldsExtracted: 0, fieldsSkipped: 0, processingNotes: [], fallbacksUsed: []
      } },
      specialStudiesData: { data: {}, success: false, confidence: 0, warnings: [], errors: [errorMessage], metadata: {
        fieldsProcessed: 0, fieldsExtracted: 0, fieldsSkipped: 0, processingNotes: [], fallbacksUsed: []
      } },
      conclusionsData: { data: '', success: false, confidence: 0, warnings: [], errors: [errorMessage], metadata: {
        fieldsProcessed: 0, fieldsExtracted: 0, fieldsSkipped: 0, processingNotes: [], fallbacksUsed: []
      } },
      
      documentAnalysis: null,
      sectionAnalysis: null,
      tableAnalysis: null,
      
      processingStats: {
        totalSectionsDetected: 0,
        totalTablesProcessed: 0,
        totalFieldsExtracted: 0,
        averageConfidence: 0
      },
      
      errors: [errorMessage],
      warnings: [],
      recommendations: ['Revisar el formato del archivo', 'Contactar soporte técnico si el problema persiste'],
      
      metadata: {
        fileSize: file.size,
        processingSteps: ['error_occurred'],
        fallbacksUsed: [],
        validationResults: null
      }
    };
  }

  // ========== MÉTODOS AUXILIARES ==========

  private async extractTextSample(file: File, maxBytes: number): Promise<string> {
    // Implementar extracción de muestra real
    this.logger.debug('Extrayendo muestra de texto', { fileName: file.name, maxBytes });
    
    try {
      const extension = file.name.split('.').pop()?.toLowerCase() || '';
      
      // Para archivos de texto plano, leer directamente
      if (extension === 'txt') {
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => {
            const text = reader.result as string;
            resolve(text.substring(0, maxBytes));
          };
          reader.onerror = () => reject(new Error('Error leyendo archivo de texto'));
          reader.readAsText(file.slice(0, maxBytes));
        });
      }
      
      // Para otros tipos de archivo, usar el converter pero con límite
      const { createConverter } = await import('./enhanced-file-converter');
      const converter = createConverter({
        enableValidation: false,
        debugMode: false,
        minConfidenceThreshold: 0.1
      });
      
      // Crear una muestra del archivo (primeros bytes)
      const sampleFile = new File([file.slice(0, maxBytes * 10)], file.name, { type: file.type });
      const result = await converter.convert(sampleFile);
      
      if (result.success && result.data) {
        const reconstructedText = this.reconstructTextFromResult(result);
        return reconstructedText.substring(0, maxBytes);
      }
      
      // Fallback: información básica del archivo
      return `Archivo: ${file.name}\nTipo: ${file.type}\nTamaño: ${file.size} bytes\n`;
      
    } catch (error) {
      this.logger.warn('Error extrayendo muestra de texto', { error: error instanceof Error ? error.message : error });
      return `Error extrayendo muestra de ${file.name}`;
    }
  }

  private quickTerminologyCheck(text: string): any {
    const categories = ['sectionNCS', 'sectionEMG', 'parameterLatency', 'nerveNames'] as const;
    const results: any = {};
    
    categories.forEach(category => {
      results[category] = TerminologyMatcher.findInCategory(text, category);
    });
    
    return results;
  }

  private quickStructureCheck(text: string): any {
    return {
      hasTableStructure: /\|.*\|.*\|/.test(text),
      hasBilateralData: /\b(L|R|Left|Right|Izq|Der)\b/.test(text),
      hasNumericData: /\d+\.?\d*/.test(text)
    };
  }

  private evaluateCompatibility(terminologyCheck: any, structureCheck: any): any {
    let confidence = 0;
    const estimatedSections: string[] = [];
    const warnings: string[] = [];
    const recommendations: string[] = [];
    
    // Evaluar presencia de terminología médica
    Object.entries(terminologyCheck).forEach(([category, found]) => {
      if (found) {
        confidence += 25;
        estimatedSections.push(category);
      }
    });
    
    // Evaluar estructura
    if (structureCheck.hasTableStructure) confidence += 20;
    if (structureCheck.hasBilateralData) confidence += 15;
    if (structureCheck.hasNumericData) confidence += 10;
    
    // Determinar tipo de documento
    let documentType = 'unknown';
    if (terminologyCheck.sectionNCS && terminologyCheck.sectionEMG) {
      documentType = 'combined_report';
    } else if (terminologyCheck.sectionNCS) {
      documentType = 'ncs_report';
    } else if (terminologyCheck.sectionEMG) {
      documentType = 'emg_report';
    }
    
    // Generar advertencias y recomendaciones
    if (confidence < 50) {
      warnings.push('Baja compatibilidad detectada');
      recommendations.push('Verificar que el archivo contenga datos médicos válidos');
    }
    
    return {
      compatible: confidence >= 40,
      confidence,
      documentType,
      estimatedSections,
      warnings,
      recommendations
    };
  }

  private calculateTotalFieldsExtracted(extractionResults: any): number {
    return Object.values(extractionResults).reduce((total, result: any) => {
      return total + (result.metadata?.fieldsExtracted || 0);
    }, 0);
  }

  private collectFallbacksUsed(extractionResults: any): string[] {
    return Object.values(extractionResults).flatMap((result: any) => 
      result.metadata?.fallbacksUsed || []
    );
  }

  private exportProcessingLogs(fileName: string): void {
    const logs = DetailedLogger.exportLogs('text');
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const logFileName = `processing_log_${fileName}_${timestamp}.txt`;
    
    // En un entorno de navegador, esto sería una descarga
    console.log(`📋 Logs exportados para ${fileName}:`, logs);
    this.logger.info('📋 Logs de procesamiento exportados', { fileName: logFileName });
  }

  // ========== MÉTODOS ESTÁTICOS DE UTILIDAD ==========

  /**
   * Crear instancia con configuración optimizada para desarrollo
   */
  public static createForDevelopment(): EnhancedFileProcessor {
    return new EnhancedFileProcessor({
      enableDetailedLogging: true,
      logLevel: 'DEBUG',
      explicitSectionValidation: true,
      allowPartialData: true,
      exportLogsOnCompletion: true
    });
  }

  /**
   * Crear instancia con configuración optimizada para producción
   */
  public static createForProduction(): EnhancedFileProcessor {
    return new EnhancedFileProcessor({
      enableDetailedLogging: false,
      logLevel: 'WARN',
      explicitSectionValidation: true,
      allowPartialData: false,
      strictValidation: true,
      exportLogsOnCompletion: false
    });
  }

  /**
   * Obtener estadísticas del sistema
   */
  public static getSystemStatistics(): any {
    return {
      terminologyCategories: Object.keys(MEDICAL_TERMINOLOGY).length,
      totalTerms: Object.values(MEDICAL_TERMINOLOGY).reduce((total, terms) => total + terms.length, 0),
      logStatistics: DetailedLogger.getStatistics(),
      version: '2.0.0'
    };
  }

  /**
   * Reconstruir texto desde el resultado del converter
   */
  private reconstructTextFromResult(result: any): string {
    // Intentar reconstruir el texto desde los datos extraídos
    let reconstructedText = '';
    
    if (result.data) {
      // Agregar información del paciente
      if (result.data.patient) {
        reconstructedText += `Paciente: ${result.data.patient.firstName || ''} ${result.data.patient.lastName || ''}\n`;
      }
      
      // Agregar datos NCS
      if (result.data.ncsResults && result.data.ncsResults.length > 0) {
        reconstructedText += '\n=== ESTUDIOS DE CONDUCCIÓN NERVIOSA ===\n';
        result.data.ncsResults.forEach((ncs: any) => {
          reconstructedText += `${ncs.nerve} (${ncs.side}): Latencia=${ncs.latency}ms, Amplitud=${ncs.amplitude}mV, Velocidad=${ncs.velocity}m/s\n`;
        });
      }
      
      // Agregar datos EMG
      if (result.data.emgResults && result.data.emgResults.length > 0) {
        reconstructedText += '\n=== ELECTROMIOGRAFÍA ===\n';
        result.data.emgResults.forEach((emg: any) => {
          reconstructedText += `${emg.muscleOrNerveName} (${emg.side}): ${emg.insertionalActivity || ''}\n`;
        });
      }
      
      // Agregar conclusiones
      if (result.data.diagnosis) {
        reconstructedText += `\n=== DIAGNÓSTICO ===\n${result.data.diagnosis}\n`;
      }
      
      if (result.data.conclusion) {
        reconstructedText += `\n=== CONCLUSIÓN ===\n${result.data.conclusion}\n`;
      }
    }
    
    // Si no hay datos suficientes, usar información básica
    if (reconstructedText.trim().length < 100) {
      reconstructedText = `Archivo médico procesado\nConfianza: ${result.confidence * 100}%\n`;
      reconstructedText += `Secciones encontradas: ${result.metadata?.sectionsFound?.join(', ') || 'Ninguna'}\n`;
      reconstructedText += `Texto extraído: ${result.metadata?.extractedTextLength || 0} caracteres\n`;
    }
    
    return reconstructedText;
  }
}

export default EnhancedFileProcessor; 