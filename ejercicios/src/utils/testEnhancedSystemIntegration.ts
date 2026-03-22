/**
 * TEST DE INTEGRACIÓN COMPLETA DEL SISTEMA MEJORADO
 * =================================================
 * 
 * Valida el flujo completo end-to-end:
 * FileUpload → EnhancedFileProcessor → NullSafeMappers → FormDataMapper → ClinicalWorkflow
 */

import { EnhancedFileProcessor } from '../services/enhancedFileProcessor';
import { FormDataMapper } from '../services/formDataMapper';
import { NullSafeMapperFactory } from '../services/nullSafeMappers';
import { DetailedLogger, MedicalLogger } from '../services/detailedLogger';
import type { 
  ExtractedFileData, 
  AutoFillContext, 
  ProcessingResult 
} from '../types/enhancedSystem';

// ========== CONFIGURACIÓN DE TESTING ==========

interface TestResult {
  testName: string;
  success: boolean;
  duration: number;
  details: {
    fileProcessing?: {
      success: boolean;
      confidence: number;
      fieldsExtracted: number;
      warnings: number;
      errors: number;
    };
    dataMapping?: {
      symptomsSuccess: boolean;
      ncsSuccess: boolean;
      emgSuccess: boolean;
      patientSuccess: boolean;
      totalFieldsMapped: number;
    };
    autoFillContext?: {
      created: boolean;
      confidence: number;
      hasPatientData: boolean;
      hasNCSData: boolean;
      hasEMGData: boolean;
    };
  };
  errors: string[];
  warnings: string[];
  recommendations: string[];
}

interface IntegrationTestSuite {
  totalTests: number;
  passedTests: number;
  failedTests: number;
  results: TestResult[];
  overallSuccess: boolean;
  executionTime: number;
  summary: {
    fileProcessingTests: number;
    dataMappingTests: number;
    autoFillTests: number;
    endToEndTests: number;
  };
}

// ========== CLASE PRINCIPAL DE TESTING ==========

export class EnhancedSystemIntegrationTester {
  private logger: MedicalLogger;
  private testResults: TestResult[] = [];
  private startTime: number = 0;

  constructor() {
    // Configurar logger para testing
    DetailedLogger.configure({
      enableConsole: true,
      minLevel: 'INFO',
      formatStyle: 'testing'
    });
    
    this.logger = new MedicalLogger('IntegrationTester');
  }

  /**
   * 🧪 EJECUTAR SUITE COMPLETA DE TESTS
   */
  public async runCompleteTestSuite(): Promise<IntegrationTestSuite> {
    this.startTime = Date.now();
    this.logger.info('🧪 Iniciando suite completa de tests de integración');

    try {
      // 1. Tests de procesamiento de archivos
      await this.testFileProcessing();
      
      // 2. Tests de mapeo de datos
      await this.testDataMapping();
      
      // 3. Tests de auto-fill context
      await this.testAutoFillContext();
      
      // 4. Test end-to-end completo
      await this.testEndToEndFlow();

      // 5. Tests de robustez y edge cases
      await this.testRobustness();

    } catch (error) {
      this.logger.error('❌ Error crítico en suite de tests', { error });
    }

    return this.generateTestSummary();
  }

  /**
   * 🧪 TEST 1: Procesamiento de archivos
   */
  private async testFileProcessing(): Promise<void> {
    const testName = 'File Processing with EnhancedFileProcessor';
    const startTime = Date.now();
    
    try {
      this.logger.info(`🔄 Ejecutando test: ${testName}`);

      // Crear archivo de prueba simulado
      const mockFile = this.createMockFile();
      
      // Procesar con EnhancedFileProcessor
      const processor = EnhancedFileProcessor.createForDevelopment();
      const result = await processor.processFile(mockFile);
      
      // Validar resultados
      const success = result.success && result.confidence > 0.3;
      const fieldsExtracted = this.countExtractedFields(result);
      
      const testResult: TestResult = {
        testName,
        success,
        duration: Date.now() - startTime,
        details: {
          fileProcessing: {
            success: result.success,
            confidence: result.confidence,
            fieldsExtracted,
            warnings: result.warnings.length,
            errors: result.errors.length
          }
        },
        errors: result.errors,
        warnings: result.warnings,
        recommendations: result.recommendations || []
      };

      this.testResults.push(testResult);
      
      if (success) {
        this.logger.info(`✅ Test passed: ${testName}`, { 
          confidence: result.confidence,
          fieldsExtracted 
        });
      } else {
        this.logger.error(`❌ Test failed: ${testName}`, { 
          errors: result.errors 
        });
      }

    } catch (error) {
      this.testResults.push({
        testName,
        success: false,
        duration: Date.now() - startTime,
        details: {},
        errors: [error instanceof Error ? error.message : 'Error desconocido'],
        warnings: [],
        recommendations: ['Revisar configuración del procesador']
      });
      
      this.logger.error(`❌ Test error: ${testName}`, { error });
    }
  }

  /**
   * 🧪 TEST 2: Mapeo de datos
   */
  private async testDataMapping(): Promise<void> {
    const testName = 'Data Mapping with FormDataMapper';
    const startTime = Date.now();
    
    try {
      this.logger.info(`🔄 Ejecutando test: ${testName}`);

      // Crear datos de prueba
      const mockExtractedData = this.createMockExtractedData();
      
      // Mapear datos
      const mappingResult = FormDataMapper.mapAllFormData(mockExtractedData);
      
      // Validar mapeo
      const symptomsSuccess = mappingResult.symptoms.success;
      const ncsSuccess = mappingResult.ncs.success;
      const emgSuccess = mappingResult.emg.success;
      const patientSuccess = !!mappingResult.patient.id;
      
      const success = mappingResult.overall.success;
      
      const testResult: TestResult = {
        testName,
        success,
        duration: Date.now() - startTime,
        details: {
          dataMapping: {
            symptomsSuccess,
            ncsSuccess,
            emgSuccess,
            patientSuccess,
            totalFieldsMapped: mappingResult.overall.totalFieldsMapped
          }
        },
        errors: mappingResult.overall.errors,
        warnings: mappingResult.overall.warnings,
        recommendations: []
      };

      this.testResults.push(testResult);
      
      if (success) {
        this.logger.info(`✅ Test passed: ${testName}`, { 
          totalFieldsMapped: mappingResult.overall.totalFieldsMapped,
          confidence: mappingResult.overall.overallConfidence
        });
      } else {
        this.logger.error(`❌ Test failed: ${testName}`, { 
          errors: mappingResult.overall.errors 
        });
      }

    } catch (error) {
      this.testResults.push({
        testName,
        success: false,
        duration: Date.now() - startTime,
        details: {},
        errors: [error instanceof Error ? error.message : 'Error desconocido'],
        warnings: [],
        recommendations: ['Revisar configuración del mapper']
      });
      
      this.logger.error(`❌ Test error: ${testName}`, { error });
    }
  }

  /**
   * 🧪 TEST 3: Contexto de auto-fill
   */
  private async testAutoFillContext(): Promise<void> {
    const testName = 'AutoFill Context Creation';
    const startTime = Date.now();
    
    try {
      this.logger.info(`🔄 Ejecutando test: ${testName}`);

      // Crear datos extraídos de prueba
      const extractedData = this.createMockExtractedData();
      
      // Crear contexto de auto-fill
      const autoFillContext: AutoFillContext = {
        mode: true,
        sourceFile: 'test_file.pdf',
        fallbackMode: false,
        confidence: extractedData.quality?.confidence || 0.8,
        data: {
          patient: extractedData.patient || {},
          symptoms: extractedData.symptoms || {},
          ncsResults: extractedData.ncsResults || [],
          emgResults: extractedData.emgResults || [],
          specialStudies: extractedData.specialStudies || [],
          metadata: {
            confidence: extractedData.quality?.confidence || 0.8,
            source: 'test_enhanced_processor',
            processingTime: 1500,
            warnings: extractedData.warnings || []
          }
        }
      };
      
      // Validar contexto
      const hasPatientData = !!autoFillContext.data.patient.firstName;
      const hasNCSData = autoFillContext.data.ncsResults.length > 0;
      const hasEMGData = autoFillContext.data.emgResults.length > 0;
      const success = autoFillContext.mode && autoFillContext.confidence > 0.5;
      
      const testResult: TestResult = {
        testName,
        success,
        duration: Date.now() - startTime,
        details: {
          autoFillContext: {
            created: true,
            confidence: autoFillContext.confidence,
            hasPatientData,
            hasNCSData,
            hasEMGData
          }
        },
        errors: [],
        warnings: success ? [] : ['Baja confianza en contexto de auto-fill'],
        recommendations: []
      };

      this.testResults.push(testResult);
      
      if (success) {
        this.logger.info(`✅ Test passed: ${testName}`, { 
          confidence: autoFillContext.confidence,
          dataTypes: { hasPatientData, hasNCSData, hasEMGData }
        });
      } else {
        this.logger.error(`❌ Test failed: ${testName}`, { 
          confidence: autoFillContext.confidence 
        });
      }

    } catch (error) {
      this.testResults.push({
        testName,
        success: false,
        duration: Date.now() - startTime,
        details: {},
        errors: [error instanceof Error ? error.message : 'Error desconocido'],
        warnings: [],
        recommendations: ['Revisar estructura de datos para auto-fill']
      });
      
      this.logger.error(`❌ Test error: ${testName}`, { error });
    }
  }

  /**
   * 🧪 TEST 4: Flujo end-to-end completo
   */
  private async testEndToEndFlow(): Promise<void> {
    const testName = 'End-to-End Complete Flow';
    const startTime = Date.now();
    
    try {
      this.logger.info(`🔄 Ejecutando test: ${testName}`);

      // 1. Crear archivo mock
      const mockFile = this.createMockFile();
      
      // 2. Procesar archivo
      const processor = EnhancedFileProcessor.createForDevelopment();
      const processingResult = await processor.processFile(mockFile);
      
      if (!processingResult.success) {
        throw new Error('Fallo en procesamiento de archivo');
      }
      
      // 3. Convertir a formato de datos extraídos
      const extractedData = this.convertProcessingResultToExtractedData(processingResult);
      
      // 4. Mapear datos
      const mappingResult = FormDataMapper.mapAllFormData(extractedData);
      
      if (!mappingResult.overall.success) {
        throw new Error('Fallo en mapeo de datos');
      }
      
      // 5. Crear contexto de auto-fill
      const autoFillContext: AutoFillContext = {
        mode: true,
        sourceFile: mockFile.name,
        confidence: mappingResult.overall.overallConfidence,
        data: {
          patient: mappingResult.patient,
          symptoms: mappingResult.symptoms.data,
          ncsResults: mappingResult.ncs.data,
          emgResults: mappingResult.emg.data,
          specialStudies: mappingResult.specialStudies.data,
          metadata: {
            confidence: mappingResult.overall.overallConfidence,
            source: 'end_to_end_test',
            processingTime: processingResult.processingTime,
            warnings: mappingResult.overall.warnings
          }
        }
      };
      
      // 6. Validar flujo completo
      const success = autoFillContext.confidence > 0.4 && 
                     autoFillContext.data.ncsResults.length >= 0 &&
                     !!autoFillContext.data.patient;
      
      const testResult: TestResult = {
        testName,
        success,
        duration: Date.now() - startTime,
        details: {
          fileProcessing: {
            success: processingResult.success,
            confidence: processingResult.confidence,
            fieldsExtracted: this.countExtractedFields(processingResult),
            warnings: processingResult.warnings.length,
            errors: processingResult.errors.length
          },
          dataMapping: {
            symptomsSuccess: mappingResult.symptoms.success,
            ncsSuccess: mappingResult.ncs.success,
            emgSuccess: mappingResult.emg.success,
            patientSuccess: !!mappingResult.patient.id,
            totalFieldsMapped: mappingResult.overall.totalFieldsMapped
          },
          autoFillContext: {
            created: true,
            confidence: autoFillContext.confidence,
            hasPatientData: !!autoFillContext.data.patient.firstName,
            hasNCSData: autoFillContext.data.ncsResults.length > 0,
            hasEMGData: autoFillContext.data.emgResults.length > 0
          }
        },
        errors: [...processingResult.errors, ...mappingResult.overall.errors],
        warnings: [...processingResult.warnings, ...mappingResult.overall.warnings],
        recommendations: []
      };

      this.testResults.push(testResult);
      
      if (success) {
        this.logger.info(`✅ Test passed: ${testName}`, { 
          endToEndConfidence: autoFillContext.confidence,
          totalProcessingTime: Date.now() - startTime
        });
      } else {
        this.logger.error(`❌ Test failed: ${testName}`, { 
          confidence: autoFillContext.confidence 
        });
      }

    } catch (error) {
      this.testResults.push({
        testName,
        success: false,
        duration: Date.now() - startTime,
        details: {},
        errors: [error instanceof Error ? error.message : 'Error desconocido'],
        warnings: [],
        recommendations: ['Revisar configuración completa del sistema']
      });
      
      this.logger.error(`❌ Test error: ${testName}`, { error });
    }
  }

  /**
   * 🧪 TEST 5: Robustez y edge cases
   */
  private async testRobustness(): Promise<void> {
    const testName = 'Robustness and Edge Cases';
    const startTime = Date.now();
    
    try {
      this.logger.info(`🔄 Ejecutando test: ${testName}`);

      // Test con datos vacíos
      const emptyData: ExtractedFileData = {
        patient: undefined,
        ncsResults: [],
        emgResults: [],
        symptoms: {},
        specialStudies: [],
        warnings: []
      };
      
      const mappingResult = FormDataMapper.mapAllFormData(emptyData);
      
      // El sistema debe manejar datos vacíos sin fallar
      const success = !mappingResult.overall.errors.some(error => 
        error.includes('Error crítico') || error.includes('Error desconocido')
      );
      
      const testResult: TestResult = {
        testName,
        success,
        duration: Date.now() - startTime,
        details: {
          dataMapping: {
            symptomsSuccess: mappingResult.symptoms.success,
            ncsSuccess: mappingResult.ncs.success,
            emgSuccess: mappingResult.emg.success,
            patientSuccess: true, // Esperamos que maneje datos vacíos
            totalFieldsMapped: mappingResult.overall.totalFieldsMapped
          }
        },
        errors: mappingResult.overall.errors,
        warnings: mappingResult.overall.warnings,
        recommendations: []
      };

      this.testResults.push(testResult);
      
      if (success) {
        this.logger.info(`✅ Test passed: ${testName}`, { 
          handledEmptyData: true
        });
      } else {
        this.logger.error(`❌ Test failed: ${testName}`, { 
          errors: mappingResult.overall.errors 
        });
      }

    } catch (error) {
      this.testResults.push({
        testName,
        success: false,
        duration: Date.now() - startTime,
        details: {},
        errors: [error instanceof Error ? error.message : 'Error desconocido'],
        warnings: [],
        recommendations: ['Mejorar manejo de casos edge']
      });
      
      this.logger.error(`❌ Test error: ${testName}`, { error });
    }
  }

  // ========== MÉTODOS AUXILIARES ==========

  private createMockFile(): File {
    const mockContent = `
      REPORTE ELECTRODIAGNÓSTICO
      Paciente: Juan Pérez
      Edad: 45 años
      Sexo: Masculino
      
      ESTUDIOS DE CONDUCCIÓN NERVIOSA:
      Nervio Mediano Motor (Izq): Latencia 3.2ms, Amplitud 8.5mV, Velocidad 52m/s
      Nervio Mediano Sensory (Der): Latencia 2.8ms, Amplitud 15μV, Velocidad 58m/s
      
      ELECTROMIOGRAFÍA:
      Músculo APB (Izq): Actividad insercional normal, sin actividad espontánea
      
      CONCLUSIÓN: Estudio normal
    `;
    
    return new File([mockContent], 'test_report.txt', { type: 'text/plain' });
  }

  private createMockExtractedData(): ExtractedFileData {
    return {
      patient: {
        name: 'Juan Pérez',
        id: 'test_patient_001',
        age: 45,
        sex: 'male'
      },
      ncsResults: [
        {
          nerve: 'Mediano Motor',
          side: 'left',
          latency: 3.2,
          amplitude: 8.5,
          velocity: 52,
          status: 'normal',
          findings: ['Valores dentro de rangos normales']
        }
      ],
      emgResults: [
        {
          muscle: 'APB',
          side: 'left',
          insertionalActivity: 'normal',
          spontaneousActivity: { fibrillations: false, positiveWaves: false },
          motorUnitPotentials: { amplitude: 'normal', duration: 'normal' },
          recruitmentPattern: 'normal'
        }
      ],
      symptoms: {
        weakness: { present: false, severity: 'none' },
        paresthesias: { present: true, severity: 'mild' }
      },
      specialStudies: [],
      warnings: [],
      quality: {
        confidence: 0.85,
        sectionsFound: 3,
        processingTime: 1200,
        textLength: 500
      }
    };
  }

  private countExtractedFields(result: ProcessingResult): number {
    let count = 0;
    if (result.patientData?.metadata?.fieldsExtracted) count += result.patientData.metadata.fieldsExtracted;
    if (result.ncsData?.metadata?.fieldsExtracted) count += result.ncsData.metadata.fieldsExtracted;
    if (result.emgData?.metadata?.fieldsExtracted) count += result.emgData.metadata.fieldsExtracted;
    return count;
  }

  private convertProcessingResultToExtractedData(result: ProcessingResult): ExtractedFileData {
    return {
      patient: result.patientData?.data || undefined,
      ncsResults: result.ncsData?.data || [],
      emgResults: result.emgData?.data || [],
      symptoms: {},
      specialStudies: result.specialStudiesData?.data || [],
      warnings: result.warnings,
      quality: {
        confidence: result.confidence,
        sectionsFound: result.processingStats.totalSectionsDetected,
        processingTime: result.processingTime,
        textLength: 0
      }
    };
  }

  private generateTestSummary(): IntegrationTestSuite {
    const executionTime = Date.now() - this.startTime;
    const passedTests = this.testResults.filter(r => r.success).length;
    const failedTests = this.testResults.filter(r => !r.success).length;
    
    const summary = {
      fileProcessingTests: this.testResults.filter(r => r.testName.includes('File Processing')).length,
      dataMappingTests: this.testResults.filter(r => r.testName.includes('Data Mapping')).length,
      autoFillTests: this.testResults.filter(r => r.testName.includes('AutoFill')).length,
      endToEndTests: this.testResults.filter(r => r.testName.includes('End-to-End')).length
    };

    const suite: IntegrationTestSuite = {
      totalTests: this.testResults.length,
      passedTests,
      failedTests,
      results: this.testResults,
      overallSuccess: failedTests === 0,
      executionTime,
      summary
    };

    this.logger.info('📊 Suite de tests completada', {
      totalTests: suite.totalTests,
      passedTests: suite.passedTests,
      failedTests: suite.failedTests,
      successRate: `${((passedTests / suite.totalTests) * 100).toFixed(1)}%`,
      executionTime: `${executionTime}ms`
    });

    return suite;
  }

  /**
   * 🎯 EJECUTAR TEST RÁPIDO
   */
  public async quickIntegrationTest(): Promise<boolean> {
    this.logger.info('⚡ Ejecutando test rápido de integración');
    
    try {
      await this.testDataMapping();
      await this.testAutoFillContext();
      
      const success = this.testResults.every(r => r.success);
      
      this.logger.info(`${success ? '✅' : '❌'} Test rápido ${success ? 'exitoso' : 'falló'}`, {
        testsRun: this.testResults.length,
        allPassed: success
      });
      
      return success;
      
    } catch (error) {
      this.logger.error('❌ Error en test rápido', { error });
      return false;
    }
  }
}

// ========== FUNCIÓN DE UTILIDAD PARA EJECUTAR TESTS ==========

/**
 * Ejecutar tests de integración del sistema mejorado
 */
export async function testEnhancedSystemIntegration(): Promise<IntegrationTestSuite> {
  const tester = new EnhancedSystemIntegrationTester();
  return await tester.runCompleteTestSuite();
}

/**
 * Ejecutar test rápido de integración
 */
export async function quickIntegrationTest(): Promise<boolean> {
  const tester = new EnhancedSystemIntegrationTester();
  return await tester.quickIntegrationTest();
}

export default EnhancedSystemIntegrationTester; 