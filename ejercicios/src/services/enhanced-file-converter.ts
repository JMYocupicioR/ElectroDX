import { Patient } from '../types/patient';
import { EMGNerveRecord } from './jsonReportGenerator';
import { ClinicalSymptomsData } from '../components/ClinicalSymptomsForm';
import * as mammoth from 'mammoth';
import * as pdfjsLib from 'pdfjs-dist';
import { TableParser } from './table-parser';
import { FormDataMapper } from './formDataMapper';

// ========== INTERFACES Y TIPOS ==========

// Interface para resultados NCS
interface NCSTestResult {
  id: string;
  nerve: string;
  type: 'motor' | 'sensory';
  side: 'left' | 'right';
  latency: number;
  amplitude: number;
  velocity: number;
  status: 'normal' | 'abnormal';
  findings: string[];
}

export interface ConversionResult {
  success: boolean;
  data?: MedicalReportData;
  errors: ConversionError[];
  warnings: string[];
  confidence: number;
  metadata: ConversionMetadata;
}

export interface MedicalReportData {
  patient: Partial<Patient>;
  ncsResults?: NCSTestResult[];
  emgResults?: EMGNerveRecord[];
  clinicalSymptoms?: Partial<ClinicalSymptomsData>;
  specialStudies?: any[]; // 🔥 NUEVO - Estudios especiales extraídos del documento
  diagnosis?: string;
  conclusion?: string;
  recommendations?: string[];
  notes?: string;
}

export interface ConversionError {
  code: string;
  message: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  section?: string;
  suggestion?: string;
}

export interface ConversionMetadata {
  originalFileName: string;
  fileSize: number;
  fileType: string;
  processedAt: string;
  processingTimeMs: number;
  extractedTextLength: number;
  sectionsFound: string[];
  aiEnhanced: boolean;
  version: string;
}

export interface FileConverterConfig {
  enableOCR: boolean;
  enableAIEnhancement: boolean;
  enableValidation: boolean;
  minConfidenceThreshold: number;
  supportedFormats: string[];
  languageDetection: boolean;
  debugMode: boolean;
}

// ========== DICCIONARIO DE SECCIONES MÉDICAS ==========

export class EnhancedFileConverter {
  private static instance: EnhancedFileConverter;
  private strategies: FileConversionStrategy[] = [];
  private config: FileConverterConfig;

  /**
   * Palabras clave mejoradas para identificar secciones de manera flexible
   */
  public static readonly SECTION_KEYWORDS = {
    MOTOR_NCS: ["Motor Side-To-Side", "Motor NCS", "Estudio de Conducción Motora", "Conducción Motora", "Motor Nerve Conduction"],
    SENSORY_NCS: ["Sensory Side-To-Side", "Sensory NCS", "Estudio de Conducción Sensitiva", "Conducción Sensitiva", "Sensory Nerve Conduction"],
    EMG: ["Needle EMG Summary", "Electromiografía de Aguja", "EMG de Aguja", "Needle EMG", "EMG Summary"],
    FWAVE: ["FWave Summary Table", "Ondas F", "F-Wave", "F Wave Summary", "F-Wave Study"],
    HREFLEX: ["H-Reflex", "Reflejo H", "H-Reflex Side-To-Side", "H Reflex Summary", "H-Reflex Study"],
    BLINK_REFLEX: ["Blink Reflex", "Reflejo de Parpadeo", "Reflejo Palpebral", "Blink Response"],
    RNS: ["Repetitive Nerve Stimulation", "Estimulación Repetitiva", "RNS", "Repetitive Stimulation"],
    CONCLUSION: ["CONCLUSION", "IMPRESIÓN DIAGNÓSTICA", "CONCLUSIONES", "Interpretación", "IMPRESSION", "DIAGNOSIS"]
  };

  private constructor(config?: Partial<FileConverterConfig>) {
    this.config = {
      enableOCR: false,
      enableAIEnhancement: false,
      enableValidation: true,
      minConfidenceThreshold: 0.6,
      supportedFormats: ['pdf', 'docx', 'doc', 'rtf', 'txt'],
      languageDetection: false,
      debugMode: false,
      ...config
    };

    this.initializeStrategies();
  }

  public static getInstance(config?: Partial<FileConverterConfig>): EnhancedFileConverter {
    if (!this.instance) {
      this.instance = new EnhancedFileConverter(config);
    }
    return this.instance;
  }

  private initializeStrategies(): void {
    this.strategies = [
      new DocxConversionStrategy(),
      new PDFConversionStrategy(),
      new RTFConversionStrategy(),
      new PlainTextConversionStrategy()
    ];
  }

  public async convert(file: File): Promise<ConversionResult> {
    const startTime = Date.now();
    const errors: ConversionError[] = [];
    const warnings: string[] = [];

    try {
      // Validar archivo
      const validationResult = await this.validateFile(file);
      if (!validationResult.valid) {
        return {
          success: false,
          errors: validationResult.errors,
          warnings,
          confidence: 0,
          metadata: this.createMetadata(file, startTime, 0, [])
        };
      }

      // Extraer texto
      const extractedText = await this.extractTextFromFile(file);
      
      if (!extractedText || extractedText.trim().length < 50) {
        errors.push({
          code: 'INSUFFICIENT_TEXT',
          message: 'No se pudo extraer suficiente texto del archivo',
          severity: 'critical',
          suggestion: 'Verificar que el archivo no esté corrupto o protegido'
        });
        
        return {
          success: false,
          errors,
          warnings,
          confidence: 0,
          metadata: this.createMetadata(file, startTime, extractedText.length, [])
        };
      }

      // Procesar datos
      const data = await this.processTextToMedicalData(extractedText);
      
      // Validar datos extraídos
      if (this.config.enableValidation) {
        const validationErrors = this.validateExtractedData(data);
        errors.push(...validationErrors);
      }

      // Calcular confianza
      const confidence = this.calculateConfidence(data, errors);
      
      // Verificar umbral mínimo de confianza
      if (confidence < this.config.minConfidenceThreshold) {
        warnings.push(`Confianza de conversión baja: ${(confidence * 100).toFixed(1)}%`);
      }

      // Determinar secciones encontradas
      const sectionsFound = this.determineSectionsFound(data);

      const result: ConversionResult = {
        success: true,
        data,
        errors,
        warnings,
        confidence,
        metadata: this.createMetadata(file, startTime, extractedText.length, sectionsFound)
      };

      if (this.config.debugMode) {
        console.log('Conversion Result:', result);
      }

      return result;

    } catch (error) {
      errors.push({
        code: 'CONVERSION_ERROR',
        message: `Error durante la conversión: ${error instanceof Error ? error.message : 'Error desconocido'}`,
        severity: 'critical'
      });

      return {
        success: false,
        errors,
        warnings,
        confidence: 0,
        metadata: this.createMetadata(file, startTime, 0, [])
      };
    }
  }

  private async validateFile(file: File): Promise<{ valid: boolean; errors: ConversionError[] }> {
    const errors: ConversionError[] = [];

    // ========== VALIDACIÓN BÁSICA ==========
    
    // Validar tamaño
    if (file.size === 0) {
      errors.push({
        code: 'EMPTY_FILE',
        message: 'El archivo está vacío',
        severity: 'critical',
        suggestion: 'Seleccione un archivo que contenga datos'
      });
    }

    if (file.size > 50 * 1024 * 1024) { // 50 MB
      errors.push({
        code: 'FILE_TOO_LARGE',
        message: 'El archivo es demasiado grande (máximo 50MB)',
        severity: 'critical',
        suggestion: 'Comprima el archivo o divídalo en partes más pequeñas'
      });
    }

    // Validar extensión
    const extension = file.name.split('.').pop()?.toLowerCase() || '';
    if (this.config.supportedFormats.indexOf(extension) === -1) {
      errors.push({
        code: 'UNSUPPORTED_FORMAT',
        message: `Formato no soportado: ${extension}`,
        severity: 'critical',
        suggestion: `Formatos soportados: ${this.config.supportedFormats.join(', ')}`
      });
    }

    // ========== VALIDACIÓN AVANZADA DE ESTRUCTURA INTERNA ==========
    
    // Validar estructura específica por tipo de archivo
    await this.validateFileStructure(file, extension, errors);

    // ========== VALIDACIÓN DE CONTENIDO MÉDICO ==========
    
    // Validar nombre de archivo para contenido médico
    this.validateMedicalFileName(file.name, errors);

    return {
      valid: errors.filter(e => e.severity === 'critical').length === 0,
      errors
    };
  }

  /**
   * 🔍 NUEVO: Validación de estructura interna del archivo
   */
  private async validateFileStructure(file: File, extension: string, errors: ConversionError[]): Promise<void> {
    try {
      const fileHeader = await this.readFileHeader(file, 1024); // Leer primeros 1KB
      
      switch (extension) {
        case 'pdf':
          this.validatePDFStructure(fileHeader, errors);
          break;
        case 'rtf':
          this.validateRTFStructure(fileHeader, errors);
          break;
        case 'docx':
          this.validateDOCXStructure(fileHeader, errors);
          break;
        case 'doc':
          this.validateDOCStructure(fileHeader, errors);
          break;
        default:
          // Para otros formatos, validación básica
          this.validateGenericStructure(fileHeader, errors);
      }
    } catch (error) {
      errors.push({
        code: 'STRUCTURE_VALIDATION_ERROR',
        message: `No se pudo validar la estructura del archivo: ${error instanceof Error ? error.message : 'Error desconocido'}`,
        severity: 'medium',
        suggestion: 'El archivo puede estar corrupto, pero se intentará procesar'
      });
    }
  }

  /**
   * 📄 Leer cabecera del archivo para validación
   */
  private async readFileHeader(file: File, bytes: number): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = () => {
        if (reader.result) {
          resolve(reader.result as string);
        } else {
          reject(new Error('No se pudo leer el archivo'));
        }
      };
      
      reader.onerror = () => reject(new Error('Error al leer el archivo'));
      
      const blob = file.slice(0, bytes);
      reader.readAsText(blob);
    });
  }

  /**
   * 📄 VALIDACIÓN ESPECÍFICA PDF
   */
  private validatePDFStructure(header: string, errors: ConversionError[]): void {
    // Verificar firma PDF
    if (!header.startsWith('%PDF-')) {
      errors.push({
        code: 'INVALID_PDF_SIGNATURE',
        message: 'Archivo PDF inválido: falta la firma PDF estándar',
        severity: 'critical',
        suggestion: 'Verificar que el archivo sea un PDF válido y no esté corrupto'
      });
      return;
    }

    // Extraer versión PDF
    const versionMatch = header.match(/%PDF-(\d\.\d)/);
    if (versionMatch) {
      const version = parseFloat(versionMatch[1]);
      if (version < 1.0 || version > 2.0) {
        errors.push({
          code: 'UNSUPPORTED_PDF_VERSION',
          message: `Versión PDF ${version} puede no ser compatible`,
          severity: 'medium',
          suggestion: 'Considere convertir el PDF a una versión más estándar (1.4-1.7)'
        });
      }
    }

    // Detectar PDF encriptado
    if (header.includes('/Encrypt') || header.includes('/Security')) {
      errors.push({
        code: 'ENCRYPTED_PDF',
        message: 'PDF protegido con contraseña detectado',
        severity: 'critical',
        suggestion: 'Remover la protección del PDF antes de procesarlo'
      });
    }

    // Detectar PDF escaneado (metadata específica)
    if (header.includes('/Subtype/Image') || header.includes('/Filter/DCTDecode')) {
      errors.push({
        code: 'SCANNED_PDF_DETECTED',
        message: 'PDF posiblemente escaneado detectado',
        severity: 'medium',
        suggestion: 'Este tipo de PDF puede requerir OCR para extracción óptima de texto'
      });
    }
  }

  /**
   * 📝 VALIDACIÓN ESPECÍFICA RTF
   */
  private validateRTFStructure(header: string, errors: ConversionError[]): void {
    // Verificar formato RTF válido
    if (!header.trim().startsWith('{\\rtf')) {
      errors.push({
        code: 'INVALID_RTF_FORMAT',
        message: 'Archivo RTF inválido: debe comenzar con {\\rtf',
        severity: 'critical',
        suggestion: 'Verificar que el archivo sea un RTF válido generado por un procesador de texto'
      });
      return;
    }

    // Extraer versión RTF
    const versionMatch = header.match(/\{\\rtf(\d+)/);
    if (versionMatch) {
      const version = parseInt(versionMatch[1]);
      if (version > 1) {
        errors.push({
          code: 'UNSUPPORTED_RTF_VERSION',
          message: `Versión RTF ${version} puede tener características no soportadas`,
          severity: 'medium',
          suggestion: 'Guardar el archivo como RTF versión 1.0 para mejor compatibilidad'
        });
      }
    }

    // Detectar codificación problemática
    if (header.includes('\\ansicpg') && !header.includes('\\ansicpg1252')) {
      errors.push({
        code: 'NON_STANDARD_ENCODING',
        message: 'Codificación de caracteres no estándar detectada',
        severity: 'medium',
        suggestion: 'Puede haber problemas con caracteres especiales'
      });
    }

    // Detectar tablas complejas
    if (header.includes('\\trowd') && header.includes('\\nestcell')) {
      errors.push({
        code: 'COMPLEX_TABLE_STRUCTURE',
        message: 'Tablas anidadas o complejas detectadas',
        severity: 'medium',
        suggestion: 'La extracción de tablas complejas puede requerir revisión manual'
      });
    }
  }

  /**
   * 📄 VALIDACIÓN ESPECÍFICA DOCX
   */
  private validateDOCXStructure(header: string, errors: ConversionError[]): void {
    // DOCX es un archivo ZIP, verificar firma ZIP
    const zipSignatures = ['PK\\x03\\x04', 'PK\\x05\\x06', 'PK\\x07\\x08'];
    const hasZipSignature = zipSignatures.some(sig => 
      header.includes(sig.replace(/\\x/g, ''))
    );

    if (!hasZipSignature) {
      errors.push({
        code: 'INVALID_DOCX_STRUCTURE',
        message: 'Archivo DOCX inválido: no es un archivo ZIP válido',
        severity: 'critical',
        suggestion: 'Verificar que el archivo DOCX no esté corrupto'
      });
    }

    // Detectar contenido Word específico
    if (!header.includes('word/') && !header.includes('document.xml')) {
      errors.push({
        code: 'NOT_WORD_DOCUMENT',
        message: 'El archivo no parece ser un documento Word válido',
        severity: 'high',
        suggestion: 'Verificar que el archivo sea realmente un documento Word (.docx)'
      });
    }
  }

  /**
   * 📄 VALIDACIÓN ESPECÍFICA DOC
   */
  private validateDOCStructure(header: string, errors: ConversionError[]): void {
    // Verificar firma de documento Word binario
    const wordSignatures = ['\\xD0\\xCF\\x11\\xE0', '\\xDB\\xA5\\x2D\\x00'];
    const hasWordSignature = wordSignatures.some(sig => 
      header.includes(sig.replace(/\\x/g, ''))
    );

    if (!hasWordSignature) {
      errors.push({
        code: 'INVALID_DOC_STRUCTURE',
        message: 'Archivo DOC inválido: no tiene la firma de documento Word',
        severity: 'critical',
        suggestion: 'Verificar que el archivo sea un documento Word (.doc) válido'
      });
    }
  }

  /**
   * 📄 VALIDACIÓN GENÉRICA
   */
  private validateGenericStructure(header: string, errors: ConversionError[]): void {
    // Verificar que no sea un archivo binario sin formato reconocido
    const binaryIndicators = ['\x00', '\xFF', '\xFE'];
    const isBinary = binaryIndicators.some(indicator => header.includes(indicator));

    if (isBinary) {
      errors.push({
        code: 'UNKNOWN_BINARY_FORMAT',
        message: 'Archivo binario de formato desconocido',
        severity: 'high',
        suggestion: 'Verificar que el archivo tenga la extensión correcta'
      });
    }

    // Verificar longitud mínima
    if (header.length < 50) {
      errors.push({
        code: 'INSUFFICIENT_CONTENT',
        message: 'Archivo parece tener contenido insuficiente',
        severity: 'medium',
        suggestion: 'Verificar que el archivo contenga datos médicos válidos'
      });
    }
  }

  /**
   * 🏥 VALIDACIÓN DE NOMBRE DE ARCHIVO MÉDICO
   */
  private validateMedicalFileName(fileName: string, errors: ConversionError[]): void {
    const name = fileName.toLowerCase();
    
    // Detectar términos médicos comunes
    const medicalTerms = [
      'emg', 'electroneurografia', 'neurografia', 'neuro', 'conduccion',
      'electromyography', 'nerve', 'muscle', 'ncs', 'motor', 'sensory',
      'latencia', 'amplitud', 'velocidad', 'latency', 'amplitude', 'velocity'
    ];

    const hasMedicalTerms = medicalTerms.some(term => name.includes(term));

    if (!hasMedicalTerms) {
      errors.push({
        code: 'NON_MEDICAL_FILENAME',
        message: 'El nombre del archivo no contiene términos médicos reconocibles',
        severity: 'low',
        suggestion: 'Verificar que el archivo contenga datos de estudios neurofisiológicos'
      });
    }

    // Detectar patrones de fecha en el nombre
    const datePatterns = [
      /\d{4}-\d{2}-\d{2}/, // YYYY-MM-DD
      /\d{2}-\d{2}-\d{4}/, // DD-MM-YYYY
      /\d{8}/               // YYYYMMDD
    ];

    const hasDatePattern = datePatterns.some(pattern => pattern.test(name));

    if (!hasDatePattern) {
      errors.push({
        code: 'NO_DATE_IN_FILENAME',
        message: 'No se detectó fecha en el nombre del archivo',
        severity: 'low',
        suggestion: 'Considerar incluir la fecha del estudio en el nombre del archivo'
      });
    }

    // Detectar caracteres problemáticos
    const problematicChars = /[<>:"|?*\\]/;
    if (problematicChars.test(fileName)) {
      errors.push({
        code: 'PROBLEMATIC_FILENAME_CHARS',
        message: 'El nombre del archivo contiene caracteres especiales que pueden causar problemas',
        severity: 'medium',
        suggestion: 'Renombrar el archivo usando solo letras, números, guiones y guiones bajos'
      });
    }
  }

  private async extractTextFromFile(file: File): Promise<string> {
    const extension = file.name.split('.').pop()?.toLowerCase() || '';
    
    const strategy = this.strategies.find(s => s.canHandle(extension));
    if (!strategy) {
      throw new Error(`No se encontró estrategia para el formato: ${extension}`);
    }

    if (this.config.debugMode) {
      console.log(`Using strategy: ${strategy.name} for ${extension}`);
    }

    return await strategy.extractText(file);
  }

  /**
   * Procesa el texto extraído del documento para generar datos médicos estructurados.
   * Utiliza el nuevo sistema de TableParser y SectionExtractor.
   */
  private async processTextToMedicalData(text: string): Promise<MedicalReportData> {
    console.log('🚀 Iniciando procesamiento de texto a datos médicos con nuevo sistema...');
    
    // Paso 1: Extraer todas las secciones usando el nuevo sistema
    const sections = SectionExtractor.extractAllSections(text, EnhancedFileConverter.SECTION_KEYWORDS);
    
    // Paso 2: Procesar cada sección con el TableParser especializado
    console.log('🔄 Procesando secciones con TableParser...');
    
    // Procesar NCS Motor - SOLO DATOS REALES
    const motorNCSText = sections.MOTOR_NCS;
    const motorResults: NCSTestResult[] = [];
    
    if (motorNCSText && motorNCSText.trim().length > 0) {
      const parsedMotorData = TableParser.parse(motorNCSText, 'ncs_motor');
      console.log('📊 Datos NCS Motor parseados:', parsedMotorData);
      
      for (const result of parsedMotorData) {
        // ✅ SOLO PROCESAR SI HAY DATOS REALES
        if (this.hasValidNCSData(result)) {
          motorResults.push({
            id: `motor_${Date.now()}_${Math.random()}`,
            nerve: result.nerve,
            type: 'motor' as const,
            side: result.side,
            latency: result.latency,
            amplitude: result.amplitude,
            velocity: result.velocity,
            status: this.determineNCSStatus(result),
            findings: this.generateNCSFindings(result)
          });
        } else {
          console.warn('⚠️ Datos NCS Motor insuficientes, saltando:', result);
        }
      }
    }
    
    // Procesar NCS Sensitivo - SOLO DATOS REALES
    const sensoryNCSText = sections.SENSORY_NCS;
    const sensoryResults: NCSTestResult[] = [];
    
    if (sensoryNCSText && sensoryNCSText.trim().length > 0) {
      const parsedSensoryData = TableParser.parse(sensoryNCSText, 'ncs_sensory');
      console.log('📊 Datos NCS Sensitivo parseados:', parsedSensoryData);
      
      for (const result of parsedSensoryData) {
        // ✅ SOLO PROCESAR SI HAY DATOS REALES
        if (this.hasValidNCSData(result)) {
          sensoryResults.push({
            id: `sensory_${Date.now()}_${Math.random()}`,
            nerve: result.nerve,
            type: 'sensory' as const,
            side: result.side,
            latency: result.latency,
            amplitude: result.amplitude,
            velocity: result.velocity,
            status: this.determineNCSStatus(result),
            findings: this.generateNCSFindings(result)
          });
        } else {
          console.warn('⚠️ Datos NCS Sensitivo insuficientes, saltando:', result);
        }
      }
    }
    
    // Procesar EMG - SOLO DATOS REALES
    const emgText = sections.EMG;
    const emgResults: EMGNerveRecord[] = [];
    
    if (emgText && emgText.trim().length > 0) {
      const parsedEMGData = TableParser.parse(emgText, 'emg');
      console.log('📊 Datos EMG parseados:', parsedEMGData);
      
      for (const result of parsedEMGData) {
        // ✅ SOLO PROCESAR SI HAY DATOS REALES
        if (this.hasValidEMGData(result)) {
          emgResults.push({
            id: `emg_${Date.now()}_${Math.random()}`,
            muscleOrNerveName: result.muscle || result.nerve,
            side: result.side,
            insertionalActivity: result.insertionalActivity,
            spontaneousActivity: this.mapSpontaneousActivity(result),
            motorUnitPotentials: this.mapMotorUnitPotentials(result),
            recruitmentPattern: result.recruitmentPattern,
            interpretationNotes: 'Extraído del documento'
          });
        } else {
          console.warn('⚠️ Datos EMG insuficientes, saltando:', result);
        }
      }
    }
    
    // Procesar Estudios Especiales - SOLO DATOS REALES
    const specialStudies: any[] = [];
    
    // Ondas F
    const fWaveText = sections.FWAVE;
    if (fWaveText && fWaveText.trim().length > 0) {
      const fWaveResults = TableParser.parse(fWaveText, 'fwave');
      for (const result of fWaveResults) {
        if (this.hasValidSpecialStudyData(result)) {
          specialStudies.push({
            id: `fwave_${Date.now()}_${Math.random()}`,
            name: 'Onda F',
            type: 'f_wave',
            nerve: result.nerve,
            side: result.side,
            values: {
              latency: result.fLatency || result.latency,
              amplitude: result.fAmplitude || result.amplitude
            },
            status: this.determineSpecialStudyStatus(result),
            findings: [`Onda F registrada en nervio ${result.nerve}`]
          });
        }
      }
    }
    
    // Reflejo H
    const hReflexText = sections.HREFLEX;
    if (hReflexText && hReflexText.trim().length > 0) {
      const hReflexResults = TableParser.parse(hReflexText, 'hreflex');
      for (const result of hReflexResults) {
        if (this.hasValidSpecialStudyData(result)) {
          specialStudies.push({
            id: `hreflex_${Date.now()}_${Math.random()}`,
            name: 'Reflejo H',
            type: 'h_reflex',
            nerve: result.nerve,
            side: result.side,
            values: {
              latency: result.hLatency || result.latency,
              amplitude: result.hAmplitude || result.amplitude
            },
            status: this.determineSpecialStudyStatus(result),
            findings: [`Reflejo H registrado`]
          });
        }
      }
    }
    
    // Reflejo de Parpadeo
    const blinkReflexText = sections.BLINK_REFLEX;
    if (blinkReflexText && blinkReflexText.trim().length > 0) {
      const blinkResults = TableParser.parse(blinkReflexText, 'blink');
      for (const result of blinkResults) {
        if (this.hasValidSpecialStudyData(result)) {
          specialStudies.push({
            id: `blink_${Date.now()}_${Math.random()}`,
            name: 'Reflejo de Parpadeo',
            type: 'blink_reflex',
            side: result.side,
            values: {
              r1Latency: result.r1Latency,
              r2Latency: result.r2Latency
            },
            status: this.determineSpecialStudyStatus(result),
            findings: [`Reflejo de parpadeo registrado`]
          });
        }
      }
    }
    
    // Estimulación Repetitiva
    const rnsText = sections.RNS;
    if (rnsText && rnsText.trim().length > 0) {
      const rnsResults = TableParser.parse(rnsText, 'rns');
      for (const result of rnsResults) {
        if (this.hasValidSpecialStudyData(result)) {
          specialStudies.push({
            id: `rns_${Date.now()}_${Math.random()}`,
            name: 'Estimulación Repetitiva',
            type: 'rns',
            nerve: result.nerve,
            muscle: result.muscle,
            side: result.side,
            values: {
              decrementPercentage: result.decrement,
              frequency: result.frequency
            },
            status: this.determineSpecialStudyStatus(result),
            findings: [`Estimulación repetitiva realizada`]
          });
        }
      }
    }
    
    // Paso 3: Extraer datos del paciente y clínicos
    const patientData = this.extractPatientData(text);
    const clinicalData = this.extractClinicalData(sections.CONCLUSION || text);
    
    // Paso 4: Construir el objeto de datos médicos
    const data: MedicalReportData = {
      patient: patientData,
      ncsResults: [...motorResults, ...sensoryResults],
      emgResults: emgResults,
      specialStudies: specialStudies,
      ...clinicalData
    };
    
    console.log('📊 Procesamiento completado:');
    console.log(`  - NCS Motor: ${motorResults.length} resultados`);
    console.log(`  - NCS Sensitivo: ${sensoryResults.length} resultados`);
    console.log(`  - EMG: ${emgResults.length} resultados`);
    console.log(`  - Estudios Especiales: ${specialStudies.length} resultados`);
    
    // Paso 5: Validación y puntuación de confianza
    console.log('🔍 Iniciando validación y puntuación de confianza...');
    const validationResults = ValidationService.validateAndScore(data);
    
    console.log('📈 Resultados de validación:');
    console.log(`  - Confianza general: ${validationResults.overallConfidence}%`);
    console.log(`  - Calidad NCS: ${validationResults.ncsValidation.dataQuality}`);
    console.log(`  - Calidad EMG: ${validationResults.emgValidation.dataQuality}`);
    console.log(`  - Calidad Estudios Especiales: ${validationResults.specialStudiesValidation.dataQuality}`);
    console.log(`  - Calidad Paciente: ${validationResults.patientValidation.dataQuality}`);
    
    if (validationResults.overallConfidence < 75) {
      console.warn('⚠️ Confianza baja detectada. Recomendaciones:');
      validationResults.recommendations.forEach(rec => console.warn(`  - ${rec}`));
    }
    
    // Agregar resultados de validación a los datos
    (data as any).validationResults = validationResults;
    
    return data;
  }

  private extractPatientData(text: string): Partial<Patient> {
    const patterns = {
      id: [
        /(?:ID|Identificador|Patient\s+ID|No\.?\s*Paciente|Patient\s+No\.?|Registro|Record|Historia|HC)[:\s]+([A-Za-z0-9\-_]+)/i,
        /(?:Expediente|File|Número)[:\s]+([A-Za-z0-9\-_]+)/i,
        /\b([A-Z]{2,3}[-\s]?\d{4,8})\b/g
      ],
      name: [
        /(?:Nombre|Name|Patient|Paciente)[:\s]+([A-Za-z\s]+?)(?:\n|ID|Edad|Age|$)/i,
        /(?:Sr\.|Sra\.|Mr\.|Mrs\.)\s+([A-Za-z\s]+?)(?:\n|,|ID|Edad|Age|$)/i,
        /^([A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,3})$/m
      ],
      age: [
        /(?:Edad|Age)[:\s]+(\d+)/i,
        /(\d+)\s*(?:años|years?\s+old|a\.|año)/i,
        /\b(\d{1,3})\s*(?:y|yr|años)\b/i
      ],
      sex: [
        /(?:Sexo|Gender|Sex)[:\s]+(Masculino|Femenino|Male|Female|M|F|Hombre|Mujer)/i,
        /(?:Género)[:\s]+(Masculino|Femenino|Hombre|Mujer|Male|Female)/i,
        /\b(Masculino|Femenino|Male|Female)\b/i
      ],
      dateOfBirth: [
        /(?:Fecha\s+de\s+Nacimiento|Date\s+of\s+Birth|DOB|Nacimiento|Birth)[:\s]+(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4})/i,
        /(?:F\.?\s*Nac\.?|Born)[:\s]+(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4})/i
      ]
    };

    const patient: Partial<Patient> = {};

    // Extraer datos usando los patrones mejorados
    const patternKeys = ['id', 'name', 'age', 'sex', 'dateOfBirth'];
    
    for (const key of patternKeys) {
      const regexList = patterns[key as keyof typeof patterns];
      for (const regex of regexList) {
        const match = text.match(regex);
        if (match) {
          switch (key) {
            case 'id':
              patient.id = match[1].trim();
              break;
            case 'name':
              const fullName = match[1].trim().replace(/\s+/g, ' ');
              const nameParts = fullName.split(' ');
              patient.firstName = nameParts[0] || '';
              patient.lastName = nameParts.slice(1).join(' ') || '';
              break;
            case 'age':
              const age = parseInt(match[1], 10);
              if (age > 0 && age < 120) {
                const currentYear = new Date().getFullYear();
                patient.dateOfBirth = `${currentYear - age}-01-01`;
              }
              break;
            case 'sex':
              const sexValue = match[1].toLowerCase();
              if (sexValue.startsWith('m') || sexValue.indexOf('masculino') !== -1 || sexValue.indexOf('hombre') !== -1) {
                patient.sex = 'male';
              } else if (sexValue.startsWith('f') || sexValue.indexOf('femenino') !== -1 || sexValue.indexOf('mujer') !== -1) {
                patient.sex = 'female';
              }
              break;
            case 'dateOfBirth':
              try {
                const dateStr = match[1];
                const normalizedDate = dateStr.replace(/[\.]/g, '/');
                const date = new Date(normalizedDate);
                if (!isNaN(date.getTime())) {
                  patient.dateOfBirth = date.toISOString().split('T')[0];
                }
              } catch (error) {
                // Ignorar errores de fecha inválida
              }
              break;
          }
          break;
        }
      }
    }

    return patient;
  }

  private extractClinicalData(text: string): { diagnosis?: string; conclusion?: string; recommendations?: string[]; notes?: string } {
    const result: any = {};

    // 🚀 PATRONES MEJORADOS PARA SECCIONES CLÍNICAS
    const patterns = {
      diagnosis: [
        /(?:DIAGNÓSTICO|DIAGNOSIS|IMPRESIÓN\s+DIAGNÓSTICA|DIAGNOSTIC\s+IMPRESSION)[:\s]*([\s\S]*?)(?=CONCLUSIÓN|CONCLUSION|RECOMENDACIONES|RECOMMENDATIONS|TRATAMIENTO|TREATMENT|$)/i,
        /(?:Dx|DX)[:\s]+(.*?)(?:\n|$)/i
      ],
      conclusion: [
        /(?:CONCLUSIÓN|CONCLUSION|RESUMEN|SUMMARY|INTERPRETACIÓN|INTERPRETATION)[:\s]*([\s\S]*?)(?=RECOMENDACIONES|RECOMMENDATIONS|TRATAMIENTO|TREATMENT|$)/i,
        /(?:Conclusión|Summary)[:\s]+([\s\S]*?)(?=\n\n|$)/i
      ],
      recommendations: [
        /(?:RECOMENDACIONES|RECOMMENDATIONS|SUGERENCIAS|SUGGESTIONS|TRATAMIENTO|TREATMENT)[:\s]*([\s\S]*?)(?=$)/i,
        /(?:Recomendaciones|Treatment)[:\s]+([\s\S]*?)(?=\n\n|$)/i
      ],
      notes: [
        /(?:NOTAS|NOTES|OBSERVACIONES|OBSERVATIONS|HISTORIA\s+CLÍNICA|CLINICAL\s+HISTORY)[:\s]*([\s\S]*?)(?=DIAGNÓSTICO|DIAGNOSIS|CONCLUSIÓN|CONCLUSION|$)/i,
        /(?:Comentarios|Comments)[:\s]+([\s\S]*?)(?=\n\n|$)/i
      ]
    };

    // Extraer cada sección
    const patternKeys = ['diagnosis', 'conclusion', 'recommendations', 'notes'];
    
    for (const key of patternKeys) {
      const regexList = patterns[key as keyof typeof patterns];
      for (const regex of regexList) {
        const match = text.match(regex);
        if (match) {
          let content = match[1].trim();
          
          // Limpiar el contenido
          content = content
            .replace(/^\s*[-•*]\s*/gm, '') // Remover bullets
            .replace(/\s+/g, ' ') // Normalizar espacios
            .trim();

          if (key === 'recommendations') {
            // Convertir a array de recomendaciones
            result[key] = content
              .split(/\n|\r\n/)
              .map(line => line.trim())
              .filter(line => line.length > 0)
              .map(line => line.replace(/^[-•*]\s*/, ''));
          } else {
            result[key] = content;
          }
          break;
        }
      }
    }

    return result;
  }

  // Funciones auxiliares de normalización
  private normalizeNerveName(nerve: string): string {
    const nerveMap: { [key: string]: string } = {
      'mediano': 'mediano',
      'median': 'mediano',
      'ulnar': 'ulnar',
      'cubital': 'ulnar',
      'radial': 'radial',
      'peroneal': 'peroneo',
      'peroneo': 'peroneo',
      'tibial': 'tibial'
    };
    
    const normalized = nerve.toLowerCase().trim();
    return nerveMap[normalized] || nerve.toLowerCase();
  }

  private normalizeMuscleName(muscle: string): string {
    const muscleMap: { [key: string]: string } = {
      'pronator teres': 'Pronator Teres',
      'flexor carpi radialis': 'Flexor Carpi Radialis',
      'abductor pollicis brevis': 'Abductor Pollicis Brevis',
      'first dorsal interosseous': '1er Interóseo Dorsal',
      'deltoid': 'Deltoides',
      'deltoide': 'Deltoides',
      'bicep': 'Bíceps',
      'bíceps': 'Bíceps',
      'tricep': 'Tríceps',
      'tríceps': 'Tríceps'
    };
    
    const normalized = muscle.toLowerCase().trim();
    return muscleMap[normalized] || muscle;
  }

  private inferTestType(nerve: string, site?: string): 'motor' | 'sensory' {
    const motorSites = ['wrist', 'elbow', 'forearm', 'muñeca', 'codo', 'antebrazo'];
    const sensorySites = ['digit', 'finger', 'palm', 'dedo', 'palma'];
    
    if (site) {
      const siteLower = site.toLowerCase();
      for (const ms of motorSites) {
        if (siteLower.indexOf(ms) !== -1) return 'motor';
      }
      for (const ss of sensorySites) {
        if (siteLower.indexOf(ss) !== -1) return 'sensory';
      }
    }
    
    // Default basado en el nervio
    return 'motor';
  }

  private validateExtractedData(data: MedicalReportData): ConversionError[] {
    const errors: ConversionError[] = [];

    if (!data.patient?.id) {
      errors.push({
        code: 'MISSING_PATIENT_ID',
        message: 'No se encontró ID del paciente',
        severity: 'high',
        section: 'patient'
      });
    }

    if (!data.ncsResults || data.ncsResults.length === 0) {
      errors.push({
        code: 'NO_NCS_DATA',
        message: 'No se encontraron datos de neuroconducción',
        severity: 'high',
        section: 'ncs'
      });
    }

    return errors;
  }

  private calculateConfidence(data: MedicalReportData, errors: ConversionError[]): number {
    let confidence = 1.0;

    const criticalErrors = errors.filter(e => e.severity === 'critical').length;
    const highErrors = errors.filter(e => e.severity === 'high').length;
    const mediumErrors = errors.filter(e => e.severity === 'medium').length;

    confidence -= criticalErrors * 0.3;
    confidence -= highErrors * 0.2;
    confidence -= mediumErrors * 0.1;

    if (data.patient?.id) confidence += 0.1;
    if (data.patient?.firstName || data.patient?.lastName) confidence += 0.1;
    if (data.ncsResults && data.ncsResults.length > 0) confidence += 0.2;
    if (data.emgResults && data.emgResults.length > 0) confidence += 0.2;
    if (data.diagnosis) confidence += 0.15;
    if (data.conclusion) confidence += 0.15;

    return Math.max(0, Math.min(1, confidence));
  }

  private determineSectionsFound(data: MedicalReportData): string[] {
    const sections: string[] = [];

    if (data.patient?.id) sections.push('patient_demographics');
    if (data.ncsResults && data.ncsResults.length > 0) sections.push('ncs_data');
    if (data.emgResults && data.emgResults.length > 0) sections.push('emg_data');
    if (data.diagnosis) sections.push('diagnosis');
    if (data.conclusion) sections.push('conclusion');
    if (data.recommendations && data.recommendations.length > 0) sections.push('recommendations');
    if (data.notes) sections.push('clinical_notes');

    return sections;
  }

  private createMetadata(
    file: File, 
    startTime: number, 
    textLength: number, 
    sectionsFound: string[]
  ): ConversionMetadata {
    return {
      originalFileName: file.name,
      fileSize: file.size,
      fileType: file.type || 'unknown',
      processedAt: new Date().toISOString(),
      processingTimeMs: Date.now() - startTime,
      extractedTextLength: textLength,
      sectionsFound,
      aiEnhanced: this.config.enableAIEnhancement,
      version: '2.0.0'
    };
  }

  // Métodos públicos adicionales
  public getSupportedFormats(): string[] {
    return [...this.config.supportedFormats];
  }

  public updateConfig(newConfig: Partial<FileConverterConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  public getConfig(): FileConverterConfig {
    return { ...this.config };
  }

  /**
   * Extrae una sección del texto basado en un conjunto de palabras clave.
   * @param text - El texto completo del documento.
   * @param keywords - Array de palabras clave que identifican el inicio de la sección.
   * @returns El texto de la sección encontrada o un string vacío.
   */
  private extractSectionByKeywords(text: string, keywords: string[]): string {
    console.log(`🔍 Buscando sección con palabras clave:`, keywords);
    
    // Crear regex que busque cualquiera de las palabras clave
    const keywordRegex = new RegExp(`(?:${keywords.join('|')})`, 'i');
    const startMatch = text.match(keywordRegex);
    
    if (!startMatch || typeof startMatch.index === 'undefined') {
      console.log(`❌ No se encontró sección con palabras clave:`, keywords);
      return '';
    }
    
    const startIndex = startMatch.index;
    console.log(`✅ Sección encontrada en índice ${startIndex}: "${startMatch[0]}"`);
    
    // Buscar el final de la sección (el inicio de la siguiente sección conocida)
    let endIndex = text.length;
    const allKeywords = Object.values(EnhancedFileConverter.SECTION_KEYWORDS).reduce((acc, arr) => acc.concat(arr), []);
    
    allKeywords.forEach(nextKeyword => {
      if (!keywords.includes(nextKeyword)) {
        const nextMatchIndex = text.indexOf(nextKeyword, startIndex + startMatch[0].length);
        if (nextMatchIndex !== -1 && nextMatchIndex < endIndex) {
          endIndex = nextMatchIndex;
        }
      }
    });

    const sectionText = text.substring(startIndex, endIndex);
    console.log(`📄 Sección extraída (${sectionText.length} caracteres):`, sectionText.substring(0, 200) + '...');
    
    return sectionText;
  }

  // ========== MÉTODOS DE VALIDACIÓN DE DATOS REALES ==========

  /**
   * Verifica si los datos NCS son válidos y completos
   */
  private hasValidNCSData(result: any): boolean {
    return !!(
      result &&
      result.nerve &&
      result.nerve.trim() !== '' &&
      result.nerve !== 'No especificado' &&
      result.side &&
      (result.latency !== undefined && result.latency !== null && result.latency > 0) &&
      (result.amplitude !== undefined && result.amplitude !== null && result.amplitude > 0) &&
      (result.velocity !== undefined && result.velocity !== null && result.velocity > 0)
    );
  }

  /**
   * Verifica si los datos EMG son válidos y completos
   */
  private hasValidEMGData(result: any): boolean {
    return !!(
      result &&
      (result.muscle || result.nerve) &&
      result.side &&
      (result.insertionalActivity || result.recruitmentPattern || result.spontaneousActivity)
    );
  }

  /**
   * Verifica si los datos de estudios especiales son válidos
   */
  private hasValidSpecialStudyData(result: any): boolean {
    return !!(
      result &&
      result.nerve &&
      result.side &&
      (result.latency !== undefined && result.latency !== null && result.latency > 0)
    );
  }

  /**
   * Determina el estado NCS basado en valores reales
   */
  private determineNCSStatus(result: any): 'normal' | 'abnormal' {
    // Rangos normales simplificados
    const normalRanges = {
      motor: {
        latency: { min: 2, max: 6 },
        amplitude: { min: 5, max: 50 },
        velocity: { min: 45, max: 70 }
      },
      sensory: {
        latency: { min: 1, max: 4 },
        amplitude: { min: 10, max: 100 },
        velocity: { min: 50, max: 70 }
      }
    };

    const type = result.type || 'motor';
    const ranges = normalRanges[type as keyof typeof normalRanges];

    if (
      result.latency < ranges.latency.min || result.latency > ranges.latency.max ||
      result.amplitude < ranges.amplitude.min || result.amplitude > ranges.amplitude.max ||
      result.velocity < ranges.velocity.min || result.velocity > ranges.velocity.max
    ) {
      return 'abnormal';
    }

    return 'normal';
  }

  /**
   * Genera hallazgos NCS basados en datos reales
   */
  private generateNCSFindings(result: any): string[] {
    const findings: string[] = [];
    
    if (result.latency > 6) {
      findings.push('Latencia prolongada');
    }
    if (result.amplitude < 5) {
      findings.push('Amplitud reducida');
    }
    if (result.velocity < 45) {
      findings.push('Velocidad de conducción lenta');
    }
    
    if (findings.length === 0) {
      findings.push('Valores dentro de rangos normales');
    }
    
    return findings;
  }

  /**
   * Determina el estado de estudios especiales
   */
  private determineSpecialStudyStatus(result: any): 'normal' | 'abnormal' {
    // Lógica básica para determinar normalidad
    if (result.latency && result.latency > 50) {
      return 'abnormal';
    }
    return 'normal';
  }

  /**
   * Mapea actividad espontánea solo con datos reales
   */
  private mapSpontaneousActivity(result: any): any {
    if (!result.spontaneousActivity) {
      return null; // No inventar datos
    }
    
    return {
      fibrillations: result.spontaneousActivity.fibrillations || false,
      positiveWaves: result.spontaneousActivity.positiveWaves || false,
      fasciculations: result.spontaneousActivity.fasciculations || false
    };
  }

  /**
   * Mapea potenciales de unidad motora solo con datos reales
   */
  private mapMotorUnitPotentials(result: any): any {
    if (!result.motorUnitPotentials) {
      return null; // No inventar datos
    }
    
    return {
      amplitude: result.motorUnitPotentials.amplitude,
      duration: result.motorUnitPotentials.duration,
      polyphasia: result.motorUnitPotentials.polyphasia
    };
  }
}

// ========== FUNCIONES DE UTILIDAD ==========

export function createConverter(config?: Partial<FileConverterConfig>): EnhancedFileConverter {
  return EnhancedFileConverter.getInstance(config);
}

export async function convertFile(file: File, config?: Partial<FileConverterConfig>): Promise<ConversionResult> {
  const converter = createConverter(config);
  return await converter.convert(file);
}

export function isConversionSuccessful(result: ConversionResult): boolean {
  return result.success && result.confidence >= 0.6;
}

// ========== SERVICIO DE ANÁLISIS DE TABLAS MÉDICAS ==========

interface TableColumn {
  name: string;
  index: number;
  type: 'nerve' | 'muscle' | 'latency' | 'amplitude' | 'velocity' | 'side' | 'other';
  unit?: string;
  side?: 'left' | 'right' | 'bilateral';
}

interface TableRow {
  nerve?: string;
  muscle?: string;
  side?: 'left' | 'right' | 'bilateral';
  data: { [key: string]: number | string | null };
}

// Tipos extendidos para el TableParserService
type TableType = 'ncs' | 'emg' | 'fwave' | 'hreflex' | 'blink_reflex' | 'rns';

// Extensión de la interfaz NCSTestResult para incluir testType
interface ExtendedNCSTestResult extends Omit<NCSTestResult, 'side'> {
  testType?: 'motor' | 'sensory';
  side: 'left' | 'right' | 'bilateral';
}

const HEADER_MAP = {
  latency: ['laton', 'latencia', 'lat', 'lat (ms)', 'latency', 'distal latency', 'onset latency'],
  amplitude: ['b-pamp', 'amplitude', 'amp (mv)', 'amp (µv)', 'amp', 'amplitud', 'peak amplitude'],
  velocity: ['cv', 'vcn', 'vel', 'vcm', '(m/s)', 'velocity', 'velocidad', 'conduction velocity'],
  nerve: ['nerve', 'nervio', 'nerv', 'neural'],
  muscle: ['muscle', 'músculo', 'musc', 'muscular'],
  side: ['side', 'lado', 'l', 'r', 'left', 'right', 'izq', 'der']
};

class TableParserService {
  /**
   * Parsea una tabla médica y extrae datos estructurados
   */
  static parseTable(tableText: string, tableType: 'ncs' | 'emg' | 'fwave' | 'hreflex'): TableRow[] {
    console.log(`🔍 Parseando tabla ${tableType}...`);
    
    if (!tableText || tableText.trim().length === 0) {
      console.log('⚠️ Texto de tabla vacío');
      return [];
    }
    
    const lines = tableText.split('\n').filter(line => line.trim().length > 0);
    if (lines.length < 2) {
      console.log('⚠️ Tabla insuficiente (menos de 2 líneas)');
      return [];
    }
    
    // Paso 1: Identificar cabeceras
    const headerInfo = this.identifyHeaders(lines);
    if (headerInfo.columns.length === 0) {
      console.log('⚠️ No se pudieron identificar cabeceras');
      return [];
    }
    
    console.log(`📊 Cabeceras identificadas: ${headerInfo.columns.length}`);
    console.log('🏷️ Columnas:', headerInfo.columns.map(c => `${c.name}(${c.type})`));
    
    // Paso 2: Procesar filas de datos
    const dataRows = lines.slice(headerInfo.headerRowCount);
    const parsedRows: TableRow[] = [];
    
    for (let i = 0; i < dataRows.length; i++) {
      const row = this.parseDataRow(dataRows[i], headerInfo.columns, tableType);
      if (row && this.isValidDataRow(row)) {
        parsedRows.push(row);
      }
    }
    
    console.log(`✅ Filas parseadas: ${parsedRows.length}/${dataRows.length}`);
    return parsedRows;
  }
  
  /**
   * Identifica las cabeceras de la tabla
   */
  private static identifyHeaders(lines: string[]): { columns: TableColumn[]; headerRowCount: number } {
    const columns: TableColumn[] = [];
    let headerRowCount = 1;
    
    // Buscar en las primeras 3 líneas para cabeceras
    for (let lineIndex = 0; lineIndex < Math.min(3, lines.length); lineIndex++) {
      const line = lines[lineIndex];
      const cells = this.splitTableRow(line);
      
      if (cells.length < 2) continue;
      
      // Verificar si esta línea contiene cabeceras
      const headerScore = this.calculateHeaderScore(cells);
      if (headerScore > 0.5) {
        headerRowCount = lineIndex + 1;
        
        // Mapear cada celda a una columna
        for (let cellIndex = 0; cellIndex < cells.length; cellIndex++) {
          const cell = cells[cellIndex].toLowerCase().trim();
          const columnType = this.identifyColumnType(cell);
          
          if (columnType !== 'other') {
            columns.push({
              name: cells[cellIndex].trim(),
              index: cellIndex,
              type: columnType,
              unit: this.extractUnit(cell),
              side: this.identifySide(cell)
            });
          }
        }
        break;
      }
    }
    
    // Si no se encontraron cabeceras, inferir de la primera fila de datos
    if (columns.length === 0) {
      console.log('🔍 Infiriendo estructura de tabla sin cabeceras...');
      const firstDataLine = lines[0];
      const cells = this.splitTableRow(firstDataLine);
      
      // Estructura típica: Nervio/Músculo | Latencia | Amplitud | Velocidad
      for (let i = 0; i < cells.length; i++) {
        let columnType: TableColumn['type'] = 'other';
        
        if (i === 0) {
          columnType = this.containsNerveOrMuscle(cells[i]) ? 'nerve' : 'muscle';
        } else if (this.isNumeric(cells[i])) {
          // Inferir tipo basado en valor numérico
          const value = parseFloat(cells[i]);
          if (value < 10) columnType = 'latency';
          else if (value < 100) columnType = 'amplitude';
          else columnType = 'velocity';
        }
        
        columns.push({
          name: `Column_${i}`,
          index: i,
          type: columnType
        });
      }
      headerRowCount = 0;
    }
    
    return { columns, headerRowCount };
  }
  
  /**
   * Parsea una fila de datos
   */
  private static parseDataRow(line: string, columns: TableColumn[], tableType: string): TableRow | null {
    const cells = this.splitTableRow(line);
    
    if (cells.length < 2) return null;
    
    // Ignorar filas que no contienen datos válidos
    if (this.shouldIgnoreRow(line)) {
      return null;
    }
    
    const row: TableRow = {
      data: {}
    };
    
    // Procesar cada celda según su columna
    for (const column of columns) {
      if (column.index < cells.length) {
        const cellValue = cells[column.index].trim();
        
        if (column.type === 'nerve' || column.type === 'muscle') {
          row[column.type] = cellValue;
        } else if (column.type === 'side') {
          row.side = this.parseSide(cellValue);
        } else {
          // Procesar valores numéricos
          const numericValue = this.parseNumericValue(cellValue);
          const columnKey = `${column.type}${column.side ? '_' + column.side : ''}`;
          row.data[columnKey] = numericValue;
        }
      }
    }
    
    // Inferir lado si no se especificó
    if (!row.side) {
      row.side = this.inferSideFromContext(line);
    }
    
    return row;
  }
  
  /**
   * Divide una fila de tabla en celdas
   */
  private static splitTableRow(line: string): string[] {
    // Primero intentar con tabs
    if (line.includes('\t')) {
      return line.split('\t').map(cell => cell.trim());
    }
    
    // Luego intentar con múltiples espacios
    return line.split(/\s{2,}/).map(cell => cell.trim()).filter(cell => cell.length > 0);
  }
  
  /**
   * Calcula la puntuación de probabilidad de que una línea sea cabecera
   */
  private static calculateHeaderScore(cells: string[]): number {
    let score = 0;
    
    for (const cell of cells) {
      const cellLower = cell.toLowerCase();
      
      // Buscar palabras clave médicas
      const medicalKeywords = Object.values(HEADER_MAP).reduce((acc, arr) => acc.concat(arr), []);
      for (const keyword of medicalKeywords) {
        if (cellLower.includes(keyword)) {
          score += 1;
          break;
        }
      }
      
      // Penalizar si contiene muchos números
      if (this.isNumeric(cell)) {
        score -= 0.5;
      }
      
      // Bonus por unidades
      if (cellLower.includes('ms') || cellLower.includes('mv') || cellLower.includes('µv') || cellLower.includes('m/s')) {
        score += 0.5;
      }
    }
    
    return score / cells.length;
  }
  
  /**
   * Identifica el tipo de columna basado en el texto
   */
  private static identifyColumnType(text: string): TableColumn['type'] {
    const textLower = text.toLowerCase();
    
    for (const [type, keywords] of Object.entries(HEADER_MAP)) {
      for (const keyword of keywords) {
        if (textLower.includes(keyword)) {
          return type as TableColumn['type'];
        }
      }
    }
    
    return 'other';
  }
  
  /**
   * Extrae la unidad de medida de un texto
   */
  private static extractUnit(text: string): string | undefined {
    const units = ['ms', 'mv', 'µv', 'uv', 'm/s', 'cm/s'];
    for (const unit of units) {
      if (text.toLowerCase().includes(unit)) {
        return unit;
      }
    }
    return undefined;
  }
  
  /**
   * Identifica el lado (izquierdo/derecho) de una columna
   */
  private static identifySide(text: string): 'left' | 'right' | undefined {
    const textLower = text.toLowerCase();
    
    if (textLower.includes('left') || textLower.includes('izq') || textLower.includes('l')) {
      return 'left';
    }
    if (textLower.includes('right') || textLower.includes('der') || textLower.includes('r')) {
      return 'right';
    }
    
    return undefined;
  }
  
  /**
   * Verifica si una fila debe ser ignorada
   */
  private static shouldIgnoreRow(line: string): boolean {
    const lineLower = line.toLowerCase();
    
    // Ignorar filas con palabras clave que indican que no son datos
    const ignoreKeywords = ['default', 'normal', 'reference', 'límite', 'limit', 'header', 'total'];
    
    for (const keyword of ignoreKeywords) {
      if (lineLower.includes(keyword)) {
        return true;
      }
    }
    
    // Ignorar filas que son solo separadores
    if (line.match(/^[\s\-_=]+$/)) {
      return true;
    }
    
    return false;
  }
  
  /**
   * Verifica si una fila contiene datos válidos
   */
  private static isValidDataRow(row: TableRow): boolean {
    // Debe tener al menos un identificador (nervio o músculo)
    if (!row.nerve && !row.muscle) {
      return false;
    }
    
    // Debe tener al menos un valor numérico
    const hasNumericData = Object.values(row.data).some(value => 
      typeof value === 'number' && !isNaN(value)
    );
    
    return hasNumericData;
  }
  
  /**
   * Verifica si un texto contiene nombres de nervios o músculos
   */
  private static containsNerveOrMuscle(text: string): boolean {
    const nerveNames = ['median', 'ulnar', 'radial', 'peroneal', 'tibial', 'sural', 'mediano', 'cubital'];
    const textLower = text.toLowerCase();
    
    return nerveNames.some(name => textLower.includes(name));
  }
  
  /**
   * Verifica si un texto es numérico
   */
  private static isNumeric(text: string): boolean {
    return !isNaN(parseFloat(text)) && isFinite(parseFloat(text));
  }
  
  /**
   * Parsea un valor numérico, retornando null si no es válido
   */
  private static parseNumericValue(text: string): number | null {
    if (!text || text.trim() === '' || text.toLowerCase().includes('n/a') || text.toLowerCase().includes('nr')) {
      return null;
    }
    
    const cleaned = text.replace(/[^\d.-]/g, '');
    const value = parseFloat(cleaned);
    
    return isNaN(value) ? null : value;
  }
  
  /**
   * Parsea el lado de un texto
   */
  private static parseSide(text: string): 'left' | 'right' | 'bilateral' {
    const textLower = text.toLowerCase();
    
    if (textLower.includes('left') || textLower.includes('izq') || textLower === 'l') {
      return 'left';
    }
    if (textLower.includes('right') || textLower.includes('der') || textLower === 'r') {
      return 'right';
    }
    
    return 'bilateral';
  }
  
  /**
   * Infiere el lado basado en el contexto de la fila
   */
  private static inferSideFromContext(line: string): 'left' | 'right' | 'bilateral' {
    const lineLower = line.toLowerCase();
    
    if (lineLower.includes('left') || lineLower.includes('izq')) {
      return 'left';
    }
    if (lineLower.includes('right') || lineLower.includes('der')) {
      return 'right';
    }
    
    return 'bilateral';
  }
}

// ================================
// 🎯 FASE 2: VALIDACIÓN Y PUNTUACIÓN DE CONFIANZA
// ================================

// Interfaces para el sistema de validación
interface ValidationResult {
  overallConfidence: number;
  ncsValidation: DataValidation;
  emgValidation: DataValidation;
  specialStudiesValidation: DataValidation;
  patientValidation: DataValidation;
  recommendations: string[];
}

interface DataValidation {
  score: number;
  issues: ValidationIssue[];
  dataQuality: 'excellent' | 'good' | 'fair' | 'poor';
}

interface ValidationIssue {
  type: 'missing_data' | 'invalid_data' | 'inconsistent_data' | 'out_of_range';
  severity: 'low' | 'medium' | 'high';
  message: string;
  field: string;
}

/**
 * Servicio de validación inteligente y puntuación de confianza
 */
class ValidationService {
  /**
   * Valida y puntúa la confianza de los datos extraídos
   */
  static validateAndScore(data: MedicalReportData): ValidationResult {
    const ncsValidation = this.validateNCSData(data.ncsResults || []);
    const emgValidation = this.validateEMGData(data.emgResults || []);
    const specialStudiesValidation = this.validateSpecialStudies(data.specialStudies || []);
    const patientValidation = this.validatePatientData(data.patient);
    
    const overallScore = this.calculateOverallConfidenceScore([
      ncsValidation,
      emgValidation,
      specialStudiesValidation,
      patientValidation
    ]);

    return {
      overallConfidence: overallScore,
      ncsValidation,
      emgValidation,
      specialStudiesValidation,
      patientValidation,
      recommendations: this.generateRecommendations(overallScore, [
        ncsValidation,
        emgValidation,
        specialStudiesValidation,
        patientValidation
      ])
    };
  }

  /**
   * Valida datos NCS
   */
  static validateNCSData(ncsResults: NCSTestResult[]): DataValidation {
    const issues: ValidationIssue[] = [];
    let confidenceScore = 100;

    if (ncsResults.length === 0) {
      issues.push({
        type: 'missing_data',
        severity: 'medium',
        message: 'No se encontraron datos NCS',
        field: 'ncsResults'
      });
      confidenceScore -= 30;
    } else {
      // Validar cada resultado NCS
      ncsResults.forEach((result, index) => {
        const resultIssues = this.validateNCSResult(result, index);
        issues.push(...resultIssues);
        confidenceScore -= resultIssues.length * 5;
      });

      // Validar rangos de valores normales
      const rangeIssues = this.validateNCSRanges(ncsResults);
      issues.push(...rangeIssues);
      confidenceScore -= rangeIssues.length * 8;
    }

    return {
      score: Math.max(0, Math.min(100, confidenceScore)),
      issues,
      dataQuality: this.categorizeDataQuality(confidenceScore)
    };
  }

  /**
   * Valida un resultado NCS individual
   */
  static validateNCSResult(result: NCSTestResult, index: number): ValidationIssue[] {
    const issues: ValidationIssue[] = [];

    // Validar campos obligatorios
    if (!result.nerve || result.nerve.trim() === '') {
      issues.push({
        type: 'missing_data',
        severity: 'high',
        message: `Nervio no especificado en resultado NCS ${index + 1}`,
        field: `ncsResults[${index}].nerve`
      });
    }

    // Validar valores numéricos
    if (result.latency <= 0 && result.amplitude <= 0 && result.velocity <= 0) {
      issues.push({
        type: 'invalid_data',
        severity: 'high',
        message: `Todos los valores son cero o negativos en resultado NCS ${index + 1}`,
        field: `ncsResults[${index}]`
      });
    }

    return issues;
  }

  /**
   * Valida datos EMG
   */
  static validateEMGData(emgResults: EMGNerveRecord[]): DataValidation {
    const issues: ValidationIssue[] = [];
    let confidenceScore = 100;

    if (emgResults.length === 0) {
      issues.push({
        type: 'missing_data',
        severity: 'medium',
        message: 'No se encontraron datos EMG',
        field: 'emgResults'
      });
      confidenceScore -= 30;
    } else {
      // Validar cada resultado EMG
      emgResults.forEach((result, index) => {
        const resultIssues = this.validateEMGResult(result, index);
        issues.push(...resultIssues);
        confidenceScore -= resultIssues.length * 5;
      });
    }

    return {
      score: Math.max(0, Math.min(100, confidenceScore)),
      issues,
      dataQuality: this.categorizeDataQuality(confidenceScore)
    };
  }

  /**
   * Valida un resultado EMG individual
   */
  static validateEMGResult(result: EMGNerveRecord, index: number): ValidationIssue[] {
    const issues: ValidationIssue[] = [];

    // Validar campos obligatorios
    if (!result.muscleOrNerveName || result.muscleOrNerveName.trim() === '') {
      issues.push({
        type: 'missing_data',
        severity: 'high',
        message: `Músculo no especificado en resultado EMG ${index + 1}`,
        field: `emgResults[${index}].muscleOrNerveName`
      });
    }

    return issues;
  }

  /**
   * Valida estudios especiales
   */
  static validateSpecialStudies(specialStudies: any[]): DataValidation {
    const issues: ValidationIssue[] = [];
    let confidenceScore = 100;

    if (specialStudies.length === 0) {
      confidenceScore -= 10; // Los estudios especiales son opcionales
    }

    return {
      score: Math.max(0, Math.min(100, confidenceScore)),
      issues,
      dataQuality: this.categorizeDataQuality(confidenceScore)
    };
  }

  /**
   * Valida datos del paciente
   */
  static validatePatientData(patient: any): DataValidation {
    const issues: ValidationIssue[] = [];
    let confidenceScore = 100;

    if (!patient) {
      issues.push({
        type: 'missing_data',
        severity: 'high',
        message: 'Datos del paciente no encontrados',
        field: 'patient'
      });
      return {
        score: 0,
        issues,
        dataQuality: 'poor'
      };
    }

    // Validar campos críticos
    if (!patient.id || patient.id.trim() === '') {
      issues.push({
        type: 'missing_data',
        severity: 'high',
        message: 'ID del paciente no especificado',
        field: 'patient.id'
      });
      confidenceScore -= 20;
    }

    return {
      score: Math.max(0, Math.min(100, confidenceScore)),
      issues,
      dataQuality: this.categorizeDataQuality(confidenceScore)
    };
  }

  /**
   * Valida rangos de valores NCS
   */
  static validateNCSRanges(ncsResults: NCSTestResult[]): ValidationIssue[] {
    const issues: ValidationIssue[] = [];

    const ranges = {
      motor: {
        latency: { min: 2, max: 15 },
        amplitude: { min: 0.5, max: 30 },
        velocity: { min: 35, max: 80 }
      },
      sensory: {
        latency: { min: 1, max: 6 },
        amplitude: { min: 5, max: 100 },
        velocity: { min: 40, max: 80 }
      }
    };

    ncsResults.forEach((result, index) => {
      const range = ranges[result.type];
      
      if (result.latency < range.latency.min || result.latency > range.latency.max) {
        issues.push({
          type: 'out_of_range',
          severity: 'medium',
          message: `Latencia fuera de rango normal en ${result.nerve} (${result.latency}ms)`,
          field: `ncsResults[${index}].latency`
        });
      }

      if (result.amplitude < range.amplitude.min || result.amplitude > range.amplitude.max) {
        issues.push({
          type: 'out_of_range',
          severity: 'medium',
          message: `Amplitud fuera de rango normal en ${result.nerve} (${result.amplitude})`,
          field: `ncsResults[${index}].amplitude`
        });
      }

      if (result.velocity < range.velocity.min || result.velocity > range.velocity.max) {
        issues.push({
          type: 'out_of_range',
          severity: 'medium',
          message: `Velocidad fuera de rango normal en ${result.nerve} (${result.velocity}m/s)`,
          field: `ncsResults[${index}].velocity`
        });
      }
    });

    return issues;
  }

  /**
   * Calcula puntuación general de confianza
   */
  static calculateOverallConfidenceScore(validations: DataValidation[]): number {
    const weights = [0.3, 0.3, 0.2, 0.2]; // NCS, EMG, Special Studies, Patient
    let totalScore = 0;
    let totalWeight = 0;

    validations.forEach((validation, index) => {
      if (validation.score > 0) {
        totalScore += validation.score * weights[index];
        totalWeight += weights[index];
      }
    });

    return totalWeight > 0 ? Math.round(totalScore / totalWeight) : 0;
  }

  /**
   * Categoriza la calidad de los datos
   */
  static categorizeDataQuality(score: number): 'excellent' | 'good' | 'fair' | 'poor' {
    if (score >= 90) return 'excellent';
    if (score >= 75) return 'good';
    if (score >= 60) return 'fair';
    return 'poor';
  }

  /**
   * Genera recomendaciones basadas en la validación
   */
  static generateRecommendations(overallScore: number, validations: DataValidation[]): string[] {
    const recommendations: string[] = [];

    if (overallScore < 60) {
      recommendations.push('Se recomienda revisar manualmente los datos extraídos');
    }

    validations.forEach((validation, index) => {
      const sections = ['NCS', 'EMG', 'Estudios Especiales', 'Paciente'];
      if (validation.score < 70) {
        recommendations.push(`Revisar datos de ${sections[index]} - calidad ${validation.dataQuality}`);
      }

      validation.issues.forEach(issue => {
        if (issue.severity === 'high') {
          recommendations.push(`Crítico: ${issue.message}`);
        }
      });
    });

    if (recommendations.length === 0) {
      recommendations.push('Los datos extraídos tienen buena calidad y confiabilidad');
    }

    return recommendations;
  }
}

// ========== ESTRATEGIAS DE CONVERSIÓN ==========

abstract class FileConversionStrategy {
  abstract readonly supportedExtensions: string[];
  abstract readonly name: string;
  
  abstract extractText(file: File): Promise<string>;
  
  canHandle(extension: string): boolean {
    return this.supportedExtensions.indexOf(extension.toLowerCase()) !== -1;
  }
}

class DocxConversionStrategy extends FileConversionStrategy {
  readonly supportedExtensions = ['docx', 'doc'];
  readonly name = 'Microsoft Word Converter';

  async extractText(file: File): Promise<string> {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const result = await mammoth.extractRawText({ arrayBuffer });
      
      return result.value;
    } catch (error) {
      throw new Error(`Error extracting text from DOCX: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

class PDFConversionStrategy extends FileConversionStrategy {
  readonly supportedExtensions = ['pdf'];
  readonly name = 'Enhanced PDF Text Extractor';

  async extractText(file: File): Promise<string> {
    try {
      const arrayBuffer = await file.arrayBuffer();
      
      const pdf = await pdfjsLib.getDocument({ 
        data: arrayBuffer
      });
      
      let fullText = '';
      let totalCharacterCount = 0;
      let pageAnalytics: Array<{
        pageNum: number;
        textLength: number;
        hasImages: boolean;
        isLikelyScanned: boolean;
      }> = [];
      
      console.log(`📄 Procesando PDF con ${pdf.numPages} páginas...`);
      
      for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        const page = await pdf.getPage(pageNum);
        
        // 🔍 ANÁLISIS AVANZADO DE LA PÁGINA
        const pageAnalysis = await this.analyzePage(page);
        pageAnalytics.push({
          pageNum,
          textLength: pageAnalysis.textLength,
          hasImages: pageAnalysis.hasImages,
          isLikelyScanned: pageAnalysis.isLikelyScanned
        });
        
        // 📝 EXTRAER TEXTO CON ANÁLISIS DE CALIDAD
        const textContent = await page.getTextContent();
        
        const pageText = textContent.items
          .filter((item: any) => item.str && item.str.trim().length > 0)
          .map((item: any) => item.str)
          .join(' ');
        
        // 🎯 DETECTAR SI LA PÁGINA ESTÁ ESCANEADA (POCO TEXTO)
        if (pageAnalysis.isLikelyScanned) {
          console.warn(`⚠️ Página ${pageNum} parece estar escaneada (${pageAnalysis.textLength} caracteres)`);
          
          // 🔄 FALLBACK: Intentar OCR básico si está disponible
          const ocrText = await this.attemptBasicOCR(page);
          if (ocrText && ocrText.length > pageText.length) {
            fullText += ocrText + '\n\n';
            console.log(`✅ OCR mejoró extracción en página ${pageNum}: ${ocrText.length} caracteres`);
          } else {
            fullText += pageText + '\n\n';
          }
        } else {
          fullText += pageText + '\n\n';
        }
        
        totalCharacterCount += pageText.length;
        
        // 📊 LOG DE PROGRESO
        if (pageNum % 5 === 0 || pageNum === pdf.numPages) {
          console.log(`📊 Progreso PDF: ${pageNum}/${pdf.numPages} páginas, ${totalCharacterCount} caracteres`);
        }
      }
      
      // 🔍 ANÁLISIS FINAL DEL DOCUMENTO
      const scannedPages = pageAnalytics.filter(p => p.isLikelyScanned).length;
      const avgTextPerPage = totalCharacterCount / pdf.numPages;
      const scannedPercentage = Math.round((scannedPages / pdf.numPages) * 100);
      
      console.log('📊 Análisis PDF completado:', {
        totalPages: pdf.numPages,
        totalCharacters: totalCharacterCount,
        avgTextPerPage: Math.round(avgTextPerPage),
        scannedPages,
        scannedPercentage
      });
      
      // ⚠️ ADVERTIR SI EL DOCUMENTO ESTÁ MAYORMENTE ESCANEADO
      if (scannedPages > pdf.numPages * 0.5) {
        console.warn(`⚠️ ${scannedPages}/${pdf.numPages} páginas parecen escaneadas. Se recomienda OCR completo.`);
        throw new Error(`PDF mayormente escaneado (${scannedPercentage}% de páginas). Requiere OCR para extracción completa. Texto extraído: ${totalCharacterCount} caracteres.`);
      }
      
      // ❌ FALLAR SI NO HAY SUFICIENTE TEXTO
      if (totalCharacterCount < 100) {
        throw new Error(`PDF con texto insuficiente (${totalCharacterCount} caracteres). Posiblemente es un documento escaneado que requiere OCR.`);
      }
      
      return fullText.trim();
      
    } catch (error) {
      // 🔄 ESTRATEGIAS DE FALLBACK MEJORADAS
      if (error instanceof Error) {
        if (error.message.includes('escaneado') || error.message.includes('OCR')) {
          // Error específico de PDF escaneado
          throw new Error(`PDF escaneado detectado: ${error.message}. Para procesar este tipo de archivo, necesita activar el modo OCR.`);
        } else if (error.message.includes('Invalid PDF')) {
          // PDF corrupto o inválido
          throw new Error(`PDF inválido o corrupto: ${error.message}. Verifique que el archivo no esté dañado.`);
        } else if (error.message.includes('encrypted')) {
          // PDF encriptado
          throw new Error(`PDF protegido con contraseña: No se puede extraer texto de documentos encriptados.`);
        }
      }
      
      throw new Error(`Error al extraer texto del PDF: ${error instanceof Error ? error.message : 'Error desconocido'}. Verifique que el archivo no esté corrupto o protegido.`);
    }
  }

  /**
   * 🔍 NUEVO: Analizar página para detectar contenido escaneado
   */
  private async analyzePage(page: any): Promise<{
    textLength: number;
    hasImages: boolean;
    isLikelyScanned: boolean;
  }> {
    try {
      // Obtener contenido de texto
      const textContent = await page.getTextContent();
      const textLength = textContent.items
        .filter((item: any) => item.str && item.str.trim().length > 0)
        .reduce((total: number, item: any) => total + item.str.length, 0);
      
      // Obtener anotaciones (pueden incluir imágenes)
      const annotations = await page.getAnnotations();
      
      // Criterios para detectar página escaneada:
      // 1. Muy poco texto (< 50 caracteres)
      // 2. Presencia de imágenes grandes
      // 3. Ratio texto/área de página muy bajo
      const viewport = page.getViewport({ scale: 1.0 });
      const pageArea = viewport.width * viewport.height;
      const textDensity = textLength / pageArea * 10000; // Normalizar
      
      const hasImages = annotations.some((ann: any) => ann.subtype === 'Image') || textDensity < 0.1;
      const isLikelyScanned = textLength < 50 || (textLength < 200 && hasImages);
      
      return {
        textLength,
        hasImages,
        isLikelyScanned
      };
      
    } catch (error) {
      console.warn('Error analizando página:', error);
      return {
        textLength: 0,
        hasImages: false,
        isLikelyScanned: true
      };
    }
  }

  /**
   * 🔄 NUEVO: Intentar OCR básico (placeholder para futura implementación)
   */
  private async attemptBasicOCR(page: any): Promise<string> {
    // TODO: Implementar OCR con Tesseract.js
    // Por ahora, retorna string vacío como placeholder
    console.log('📷 OCR básico no implementado aún. Continuando con extracción estándar...');
    return '';
  }
}

class RTFConversionStrategy extends FileConversionStrategy {
  readonly supportedExtensions = ['rtf'];
  readonly name = 'Enhanced RTF Text Extractor';

  async extractText(file: File): Promise<string> {
    try {
      const rtfContent = await file.text();
      
      // 🚀 ESTRATEGIA 1: Parser RTF avanzado
      console.log('🔄 Intentando parser RTF avanzado...');
      const advancedResult = await this.parseRTFAdvanced(rtfContent);
      
      if (advancedResult.success && advancedResult.text.length > 100) {
        console.log(`✅ Parser avanzado exitoso: ${advancedResult.text.length} caracteres`);
        return advancedResult.text;
      }
      
      // 🔄 ESTRATEGIA 2: Parser RTF básico (fallback)
      console.log('🔄 Parser avanzado insuficiente, intentando parser básico...');
      const basicResult = await this.parseRTFBasic(rtfContent);
      
      if (basicResult.success && basicResult.text.length > 50) {
        console.log(`✅ Parser básico exitoso: ${basicResult.text.length} caracteres`);
        return basicResult.text;
      }
      
      // 🔄 ESTRATEGIA 3: Extracción de texto crudo (último recurso)
      console.log('🔄 Parsers fallaron, intentando extracción cruda...');
      const rawResult = this.extractRawText(rtfContent);
      
      if (rawResult.length > 20) {
        console.log(`⚠️ Extracción cruda exitosa: ${rawResult.length} caracteres`);
        return rawResult;
      }
      
      throw new Error('Todas las estrategias de parsing RTF fallaron');
      
    } catch (error) {
      throw new Error(`Error al extraer texto del RTF: ${error instanceof Error ? error.message : 'Error desconocido'}. El archivo puede estar corrupto o tener un formato RTF no estándar.`);
    }
  }

  /**
   * 🚀 PARSER RTF AVANZADO con manejo robusto de errores
   */
  private async parseRTFAdvanced(rtfContent: string): Promise<{ success: boolean; text: string; errors: string[] }> {
    const errors: string[] = [];

    // 🚀 NUEVO: Intentar con util basado en librería externa antes del parser regex manual
    try {
      const { extractPlainTextFromRTF } = await import('../utils/rtfUtils');
      const libText = await extractPlainTextFromRTF(rtfContent);
      if (libText && libText.length > 100) {
        return { success: true, text: libText, errors };
      }
      errors.push('rtf-parser devolvió texto insuficiente, continuando con parser interno');
    } catch (libErr: any) {
      errors.push(`rtf-parser falló: ${libErr?.message || libErr}`);
    }

    try {
      // Validar formato RTF
      if (!rtfContent.trim().startsWith('{\\rtf')) {
        errors.push('Formato RTF inválido: debe comenzar con {\\rtf');
        return { success: false, text: '', errors };
      }
      
      let text = rtfContent;
      
      // Paso 1: Limpiar metadata y cabeceras
      text = text.replace(/^\{\\rtf1[^}]*\}/g, '');
      text = text.replace(/\{\\info[^}]*\}/g, '');
      text = text.replace(/\{\*\\generator[^}]*\}/g, '');
      text = text.replace(/\{\\colortbl[^}]*\}/g, '');
      text = text.replace(/\{\\fonttbl[^}]*\}/g, '');
      text = text.replace(/\{\\stylesheet[^}]*\}/g, '');
      
      // Paso 2: Preservar estructura de tablas médicas
      text = text.replace(/\\trowd[^\\]*?\\row/g, (match) => {
        const cellContent = match.replace(/\\cell/g, '\t[CELL_SEP]\t');
        return '\n[TABLE_ROW]' + cellContent + '[/TABLE_ROW]\n';
      });
      
      // Paso 3: Manejar comandos RTF comunes
      text = text.replace(/\\par\s*/g, '\n');
      text = text.replace(/\\line\s*/g, '\n');
      text = text.replace(/\\tab\s*/g, '\t');
      text = text.replace(/\\pard/g, '\n');
      
      // Paso 4: Eliminar grupos de control anidados
      let prevLength = 0;
      let iterations = 0;
      while (text.length !== prevLength && iterations < 10) {
        prevLength = text.length;
        text = text.replace(/\{[^{}]*\}/g, '');
        iterations++;
      }
      
      if (iterations >= 10) {
        errors.push('Advertencia: Posible bucle infinito en eliminación de grupos RTF');
      }
      
      // Paso 5: Eliminar comandos RTF
      text = text.replace(/\\[a-z]+\d*\s*/gi, '');
      text = text.replace(/\\[^a-z\s]/gi, '');
      
      // Paso 6: Normalizar caracteres especiales
      const specialChars: { [key: string]: string } = {
        '\\\\': '\\',
        '\\{': '{',
        '\\}': '}',
        '\\`': '`',
        '\\\'': '\'',
        '\\"': '"',
        '\\-': '-',
        '\\_': '_'
      };
      
      Object.entries(specialChars).forEach(([pattern, replacement]) => {
        text = text.replace(new RegExp(pattern, 'g'), replacement);
      });
      
      // Paso 7: Reconstruir estructura de tablas
      text = text.replace(/\[TABLE_ROW\]/g, '\n');
      text = text.replace(/\[\/TABLE_ROW\]/g, '\n');
      text = text.replace(/\t\[CELL_SEP\]\t/g, '\t');
      text = text.replace(/\[CELL_SEP\]/g, '\t');
      
      // Paso 8: Limpieza final
      text = text.replace(/\n\s*\n\s*\n/g, '\n\n');
      text = text.replace(/^\s+|\s+$/gm, '');
      text = text.replace(/[ ]+/g, ' ');
      text = text.trim();
      
      // Validar resultado
      if (text.length < 50) {
        errors.push(`Texto extraído muy corto: ${text.length} caracteres`);
        return { success: false, text, errors };
      }
      
      // Detectar artefactos RTF restantes
      const rtfArtifacts = text.match(/\{\\|\\[a-z]+\d*|\\\\/g);
      if (rtfArtifacts && rtfArtifacts.length > 5) {
        errors.push(`Advertencia: ${rtfArtifacts.length} artefactos RTF restantes detectados`);
      }
      
      return { success: true, text, errors };
      
    } catch (error) {
      errors.push(`Error en parser avanzado: ${error instanceof Error ? error.message : 'Error desconocido'}`);
      return { success: false, text: '', errors };
    }
  }

  /**
   * 🔧 PARSER RTF BÁSICO (fallback simplificado)
   */
  private async parseRTFBasic(rtfContent: string): Promise<{ success: boolean; text: string; errors: string[] }> {
    const errors: string[] = [];
    
    try {
      let text = rtfContent;
      
      // Eliminación básica de comandos RTF
      text = text.replace(/\{\\rtf1[^}]*\}/g, '');
      text = text.replace(/\{\\[^}]*\}/g, '');
      text = text.replace(/\\[a-zA-Z]+\d*\s?/g, '');
      text = text.replace(/\{|\}/g, '');
      text = text.replace(/\\\'/g, '');
      
      // Limpieza básica
      text = text.replace(/\s+/g, ' ').trim();
      
      if (text.length < 20) {
        errors.push(`Texto extraído insuficiente: ${text.length} caracteres`);
        return { success: false, text, errors };
      }
      
      return { success: true, text, errors };
      
    } catch (error) {
      errors.push(`Error en parser básico: ${error instanceof Error ? error.message : 'Error desconocido'}`);
      return { success: false, text: '', errors };
    }
  }

  /**
   * ⚠️ EXTRACCIÓN DE TEXTO CRUDO (último recurso)
   */
  private extractRawText(rtfContent: string): string {
    // Extraer solo el texto visible, ignorando todos los comandos RTF
    let text = rtfContent;
    
    // Remover todo lo que parece comando RTF
    text = text.replace(/\{[^}]*\}/g, '');
    text = text.replace(/\\[a-zA-Z]+\d*/g, '');
    text = text.replace(/\\./g, '');
    
    // Mantener solo caracteres alfanuméricos, espacios y puntuación básica
    text = text.replace(/[^\w\s.,;:()!?-]/g, ' ');
    
    // Normalizar espacios
    text = text.replace(/\s+/g, ' ').trim();
    
    return text;
  }
}

class PlainTextConversionStrategy extends FileConversionStrategy {
  readonly supportedExtensions = ['txt', 'text'];
  readonly name = 'Plain Text Reader';

  async extractText(file: File): Promise<string> {
    try {
      return await file.text();
    } catch (error) {
      throw new Error(`Error reading plain text file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

// ========== SERVICIO DE EXTRACCIÓN DE SECCIONES ==========

class SectionExtractor {
  /**
   * Extrae todas las secciones relevantes usando el nuevo sistema de palabras clave
   */
  static extractAllSections(text: string, keywords: typeof EnhancedFileConverter.SECTION_KEYWORDS): { [key: string]: string } {
    const sections: { [key: string]: string } = {};
    
    console.log('🔍 Iniciando extracción de secciones con nuevo sistema...');
    
    for (const [sectionType, sectionKeywords] of Object.entries(keywords)) {
      sections[sectionType] = this.extractSectionByKeywords(text, sectionKeywords);
    }
    
    // Estadísticas de extracción
    const foundSections = Object.entries(sections).filter(([_, content]) => content.length > 0);
    console.log(`📊 Secciones encontradas: ${foundSections.length}/${Object.keys(keywords).length}`);
    console.log('✅ Secciones extraídas:', foundSections.map(([name, _]) => name));
    
    return sections;
  }

  /**
   * Extrae una sección usando múltiples palabras clave
   */
  private static extractSectionByKeywords(text: string, keywords: string[]): string {
    console.log(`🔍 Buscando sección con palabras clave:`, keywords);
    
    // Crear regex que busque cualquiera de las palabras clave
    const keywordRegex = new RegExp(`(?:${keywords.join('|')})`, 'i');
    const startMatch = text.match(keywordRegex);
    
    if (!startMatch || typeof startMatch.index === 'undefined') {
      console.log(`❌ No se encontró sección con palabras clave:`, keywords);
      return '';
    }
    
    const startIndex = startMatch.index;
    console.log(`✅ Sección encontrada en índice ${startIndex}: "${startMatch[0]}"`);
    
    // Buscar el final de la sección
    let endIndex = text.length;
    
    // Buscar el inicio de la siguiente sección conocida
    const allKeywords = Object.values(EnhancedFileConverter.SECTION_KEYWORDS).reduce((acc: string[], arr: string[]) => acc.concat(arr), []);
    
    allKeywords.forEach(nextKeyword => {
      if (!keywords.includes(nextKeyword)) {
        const nextMatchIndex = text.indexOf(nextKeyword, startIndex + startMatch[0].length);
        if (nextMatchIndex !== -1 && nextMatchIndex < endIndex) {
          endIndex = nextMatchIndex;
        }
      }
    });

    const sectionText = text.substring(startIndex, endIndex);
    console.log(`📄 Sección extraída (${sectionText.length} caracteres):`, sectionText.substring(0, 200) + '...');
    
    return sectionText;
  }
}