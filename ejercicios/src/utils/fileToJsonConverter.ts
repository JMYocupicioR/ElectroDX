import { Patient } from '../types/patient';
import { NCSTestResult } from '../types/ncs';
import { EMGNerveRecord } from './jsonReportGenerator';
import { ClinicalSymptomsData } from '../components/ClinicalSymptomsForm';
import mammoth from 'mammoth';
import * as pdfjsLib from 'pdfjs-dist';

// ========== INTERFACES Y TIPOS ==========

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

// ========== ESTRATEGIAS DE CONVERSIÓN ==========

abstract class FileConversionStrategy {
  abstract readonly supportedExtensions: string[];
  abstract readonly name: string;
  
  abstract extractText(file: File): Promise<string>;
  
  canHandle(extension: string): boolean {
    return this.supportedExtensions.includes(extension.toLowerCase());
  }
}

class DocxConversionStrategy extends FileConversionStrategy {
  readonly supportedExtensions = ['docx', 'doc'];
  readonly name = 'Microsoft Word Converter';

  async extractText(file: File): Promise<string> {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const result = await mammoth.extractRawText({ arrayBuffer });
      
      if (result.messages.length > 0) {
        console.warn('DOCX conversion warnings:', result.messages);
      }
      
      return result.value;
    } catch (error) {
      throw new Error(`Error extracting text from DOCX: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

class PDFConversionStrategy extends FileConversionStrategy {
  readonly supportedExtensions = ['pdf'];
  readonly name = 'PDF Text Extractor';

  async extractText(file: File): Promise<string> {
    try {
      const arrayBuffer = await file.arrayBuffer();
      
      // Configurar worker de PDF.js
      if (typeof window !== 'undefined') {
        pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.js`;
      }
      
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      let fullText = '';
      
      for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        const page = await pdf.getPage(pageNum);
        const textContent = await page.getTextContent();
        
        const pageText = textContent.items
          .filter((item: any) => item.str && item.str.trim().length > 0)
          .map((item: any) => item.str)
          .join(' ');
        
        fullText += pageText + '\n\n';
      }
      
      return fullText.trim();
    } catch (error) {
      throw new Error(`Error extracting text from PDF: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

class RTFConversionStrategy extends FileConversionStrategy {
  readonly supportedExtensions = ['rtf'];
  readonly name = 'RTF Text Extractor';

  async extractText(file: File): Promise<string> {
    try {
      const rtfContent = await file.text();
      return this.parseRTF(rtfContent);
    } catch (error) {
      throw new Error(`Error extracting text from RTF: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private parseRTF(rtfString: string): string {
    // Remover controles RTF básicos
    let text = rtfString
      .replace(/\{\*\\[^}]*\}/g, '') // Remover grupos de control
      .replace(/\{\\[^}]*\}/g, '') // Remover comandos de formato
      .replace(/\\[a-z]+\d*/g, '') // Remover comandos RTF
      .replace(/\\\\/g, '\\') // Escapar barras invertidas
      .replace(/\\\{/g, '{') // Escapar llaves
      .replace(/\\\}/g, '}') // Escapar llaves
      .replace(/\\'/g, "'") // Escapar comillas
      .replace(/[{}]/g, '') // Remover llaves restantes
      .replace(/\s+/g, ' ') // Normalizar espacios
      .trim();
    
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

// ========== PROCESADORES DE DATOS ==========

class PatientDataProcessor {
  static extract(text: string): Partial<Patient> {
    const patterns = {
      id: [
        /(?:ID|Identificador|Patient\s+ID)[:\s]+([A-Za-z0-9\-_]+)/i,
        /(?:No\.?\s*Paciente|Patient\s+No\.?)[:\s]+([A-Za-z0-9\-_]+)/i,
        /(?:Registro|Record)[:\s]+([A-Za-z0-9\-_]+)/i
      ],
      name: [
        /(?:Nombre|Name|Patient)[:\s]+([A-Za-z\s]+)(?:\n|$)/i,
        /(?:Paciente|Patient)[:\s]+([A-Za-z\s]+)(?:\n|$)/i
      ],
      age: [
        /(?:Edad|Age)[:\s]+(\d+)/i,
        /(\d+)\s*(?:años|years?\s+old|a\.)/i
      ],
      sex: [
        /(?:Sexo|Gender|Sex)[:\s]+(Masculino|Femenino|Male|Female|M|F)/i,
        /(?:Género)[:\s]+(Masculino|Femenino|Hombre|Mujer)/i
      ],
      dateOfBirth: [
        /(?:Fecha\s+de\s+Nacimiento|Date\s+of\s+Birth|DOB)[:\s]+(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/i,
        /(?:Nacimiento|Birth)[:\s]+(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/i
      ],
      height: [
        /(?:Estatura|Height|Altura)[:\s]+(\d+(?:\.\d+)?)\s*(?:cm|metros?|m)/i,
        /(\d+(?:\.\d+)?)\s*(?:cm|metros?)\s*(?:de\s+)?(?:estatura|altura)/i
      ],
      weight: [
        /(?:Peso|Weight)[:\s]+(\d+(?:\.\d+)?)\s*(?:kg|kilos?)/i,
        /(\d+(?:\.\d+)?)\s*(?:kg|kilos?)\s*(?:de\s+)?peso/i
      ]
    };

    const patient: Partial<Patient> = {};

    // Extraer ID
    for (const pattern of patterns.id) {
      const match = text.match(pattern);
      if (match) {
        patient.id = match[1].trim();
        break;
      }
    }

    // Extraer nombre
    for (const pattern of patterns.name) {
      const match = text.match(pattern);
      if (match) {
        patient.name = match[1].trim();
        break;
      }
    }

    // Extraer edad
    for (const pattern of patterns.age) {
      const match = text.match(pattern);
      if (match) {
        const age = parseInt(match[1], 10);
        if (age > 0 && age < 120) {
          // Calcular fecha de nacimiento aproximada
          const currentYear = new Date().getFullYear();
          patient.dateOfBirth = `${currentYear - age}-01-01`;
        }
        break;
      }
    }

    // Extraer sexo
    for (const pattern of patterns.sex) {
      const match = text.match(pattern);
      if (match) {
        const sexValue = match[1].toLowerCase();
        if (sexValue.startsWith('m') || sexValue.includes('masculino')) {
          patient.sex = 'male';
        } else if (sexValue.startsWith('f') || sexValue.includes('femenino')) {
          patient.sex = 'female';
        }
        break;
      }
    }

    // Extraer fecha de nacimiento
    for (const pattern of patterns.dateOfBirth) {
      const match = text.match(pattern);
      if (match) {
        try {
          const dateStr = match[1];
          const date = new Date(dateStr);
          if (!isNaN(date.getTime())) {
            patient.dateOfBirth = date.toISOString().split('T')[0];
          }
        } catch (error) {
          // Ignorar errores de fecha inválida
        }
        break;
      }
    }

    return patient;
  }
}

class NCSDataProcessor {
  static extract(text: string): NCSTestResult[] {
    const results: NCSTestResult[] = [];
    
    // Patrones para diferentes formatos de tablas de NCS
    const patterns = [
      // Formato: Nervio   Sitio   Músculo   Latencia   Amplitud   Velocidad
      /(\w+)\s+(\w+)\s+(\w+)\s+([\d.]+)\s*ms\s+([\d.]+)\s*(?:mV|μV)\s+([\d.]+)\s*m\/s/gi,
      
      // Formato más específico con lados
      /(Ulnar|Median|Radial|Peroneal|Tibial)\s+(Left|Right|Izquierdo|Derecho)\s+(\w+)\s+([\d.]+)\s+([\d.]+)\s+([\d.]+)/gi,
      
      // Formato tabular con separadores
      /(Ulnar|Median|Radial|Peroneal|Tibial)[\s\|]+(Wrist|Elbow|Forearm|Muñeca|Codo|Antebrazo)[\s\|]+(\w+)[\s\|]+([\d.]+)[\s\|]+([\d.]+)[\s\|]+([\d.]+)/gi
    ];

    for (const pattern of patterns) {
      let match;
      while ((match = pattern.exec(text)) !== null) {
        const nerve = match[1];
        const site = match[2] || 'unknown';
        const muscle = match[3] || '';
        const latency = parseFloat(match[4]) || 0;
        const amplitude = parseFloat(match[5]) || 0;
        const velocity = parseFloat(match[6]) || 0;

        // Determinar lado
        let side: 'left' | 'right' = 'right';
        if (site.toLowerCase().includes('left') || site.toLowerCase().includes('izquierdo')) {
          side = 'left';
        }

        // Determinar tipo de prueba
        let type: 'motor' | 'sensory' = 'motor';
        if (muscle.toLowerCase().includes('sens') || amplitude < 50) {
          type = 'sensory';
        }

        const result: NCSTestResult = {
          id: crypto.randomUUID(),
          nerve: nerve.toLowerCase(),
          side,
          type,
          site: site.toLowerCase(),
          muscle,
          latency,
          amplitude,
          velocity,
          distance: 0, // Se podría extraer si está disponible
          temperature: 32, // Valor por defecto
          date: new Date().toISOString(),
          status: 'normal', // Se determinará en validación posterior
          findings: [],
          referenceRange: {
            latency: { min: 0, max: 0 },
            amplitude: { min: 0, max: 0 },
            velocity: { min: 0, max: 0 }
          }
        };

        results.push(result);
      }
    }

    return results;
  }
}

class EMGDataProcessor {
  static extract(text: string): EMGNerveRecord[] {
    const results: EMGNerveRecord[] = [];
    
    // Buscar secciones de EMG
    const emgSections = text.match(/EMG[^]*?(?=NCS|CONCLUSION|$)/gi);
    
    if (!emgSections) return results;

    for (const section of emgSections) {
      // Patrones para datos de EMG
      const musclePattern = /([\w\s]+)\s+(Left|Right|Izquierdo|Derecho)?\s*:?\s*(Normal|Increased|Decreased|Absent)?\s*(Fibrillations?|Positive\s+Waves?|Fasciculations?)?\s*([\d.]+)?\s*(?:ms|mV|μV)?/gi;
      
      let match;
      while ((match = musclePattern.exec(section)) !== null) {
        const muscleName = match[1].trim();
        const sideStr = match[2] || 'right';
        const insertionalActivity = match[3] || 'normal';
        const spontaneousType = match[4] || '';
        const value = parseFloat(match[5]) || 0;

        const side: 'left' | 'right' = sideStr.toLowerCase().includes('left') || sideStr.toLowerCase().includes('izquierdo') ? 'left' : 'right';

        const emgRecord: EMGNerveRecord = {
          id: crypto.randomUUID(),
          muscleOrNerveName: muscleName,
          side,
          insertionalActivity: insertionalActivity.toLowerCase() as any,
          spontaneousActivity: {
            fibrillations: spontaneousType.toLowerCase().includes('fibrillation'),
            positiveWaves: spontaneousType.toLowerCase().includes('positive'),
            fasciculations: spontaneousType.toLowerCase().includes('fasciculation')
          },
          motorUnitPotentials: {
            amplitude: value || 0,
            duration: 0, // Se extraería con más patrones específicos
            polyphasia: 0
          },
          recruitmentPattern: 'normal',
          interpretationNotes: ''
        };

        results.push(emgRecord);
      }
    }

    return results;
  }
}

class ClinicalDataProcessor {
  static extract(text: string): { diagnosis?: string; conclusion?: string; recommendations?: string[]; notes?: string } {
    const result: any = {};

    // Extraer diagnóstico
    const diagnosisPatterns = [
      /(?:DIAGNÓSTICO|DIAGNOSIS)[:\s]*([\s\S]*?)(?=CONCLUSIÓN|CONCLUSION|RECOMENDACIONES|$)/i,
      /(?:IMPRESIÓN\s+DIAGNÓSTICA|DIAGNOSTIC\s+IMPRESSION)[:\s]*([\s\S]*?)(?=CONCLUSIÓN|CONCLUSION|$)/i
    ];

    for (const pattern of diagnosisPatterns) {
      const match = text.match(pattern);
      if (match) {
        result.diagnosis = match[1].trim();
        break;
      }
    }

    // Extraer conclusión
    const conclusionPatterns = [
      /(?:CONCLUSIÓN|CONCLUSION)[:\s]*([\s\S]*?)(?=RECOMENDACIONES|RECOMMENDATIONS|$)/i,
      /(?:RESUMEN|SUMMARY)[:\s]*([\s\S]*?)(?=RECOMENDACIONES|RECOMMENDATIONS|$)/i
    ];

    for (const pattern of conclusionPatterns) {
      const match = text.match(pattern);
      if (match) {
        result.conclusion = match[1].trim();
        break;
      }
    }

    // Extraer recomendaciones
    const recommendationsPatterns = [
      /(?:RECOMENDACIONES|RECOMMENDATIONS)[:\s]*([\s\S]*?)(?=$)/i,
      /(?:SUGERENCIAS|SUGGESTIONS)[:\s]*([\s\S]*?)(?=$)/i
    ];

    for (const pattern of recommendationsPatterns) {
      const match = text.match(pattern);
      if (match) {
        const recommendationsText = match[1].trim();
        result.recommendations = recommendationsText
          .split(/\n|\r\n/)
          .map(line => line.trim())
          .filter(line => line.length > 0 && line.includes('-'))
          .map(line => line.replace(/^[-•*]\s*/, ''));
        break;
      }
    }

    // Extraer notas adicionales
    const notesPatterns = [
      /(?:NOTAS|NOTES|OBSERVACIONES)[:\s]*([\s\S]*?)(?=DIAGNÓSTICO|DIAGNOSIS|$)/i,
      /(?:HISTORIA\s+CLÍNICA|CLINICAL\s+HISTORY)[:\s]*([\s\S]*?)(?=DIAGNÓSTICO|DIAGNOSIS|$)/i
    ];

    for (const pattern of notesPatterns) {
      const match = text.match(pattern);
      if (match) {
        result.notes = match[1].trim();
        break;
      }
    }

    return result;
  }
}

// ========== VALIDADORES ==========

class DataValidator {
  static validatePatient(patient: Partial<Patient>): ConversionError[] {
    const errors: ConversionError[] = [];

    if (!patient.id) {
      errors.push({
        code: 'MISSING_PATIENT_ID',
        message: 'No se encontró ID del paciente',
        severity: 'high',
        section: 'patient',
        suggestion: 'Verificar que el documento contenga un identificador del paciente'
      });
    }

    if (!patient.name) {
      errors.push({
        code: 'MISSING_PATIENT_NAME',
        message: 'No se encontró nombre del paciente',
        severity: 'medium',
        section: 'patient',
        suggestion: 'Verificar formato del nombre en el documento'
      });
    }

    if (!patient.dateOfBirth && !patient.age) {
      errors.push({
        code: 'MISSING_PATIENT_AGE',
        message: 'No se encontró edad ni fecha de nacimiento',
        severity: 'medium',
        section: 'patient',
        suggestion: 'Verificar que el documento incluya información de edad'
      });
    }

    return errors;
  }

  static validateNCS(ncsResults: NCSTestResult[]): ConversionError[] {
    const errors: ConversionError[] = [];

    if (ncsResults.length === 0) {
      errors.push({
        code: 'NO_NCS_DATA',
        message: 'No se encontraron datos de neuroconducción',
        severity: 'high',
        section: 'ncs',
        suggestion: 'Verificar que el documento contenga tablas de NCS'
      });
      return errors;
    }

    for (const result of ncsResults) {
      if (result.latency <= 0 || result.latency > 20) {
        errors.push({
          code: 'INVALID_LATENCY',
          message: `Latencia inválida para ${result.nerve}: ${result.latency}ms`,
          severity: 'medium',
          section: 'ncs'
        });
      }

      if (result.amplitude <= 0 || result.amplitude > 50) {
        errors.push({
          code: 'INVALID_AMPLITUDE',
          message: `Amplitud inválida para ${result.nerve}: ${result.amplitude}mV`,
          severity: 'medium',
          section: 'ncs'
        });
      }

      if (result.velocity <= 0 || result.velocity > 100) {
        errors.push({
          code: 'INVALID_VELOCITY',
          message: `Velocidad inválida para ${result.nerve}: ${result.velocity}m/s`,
          severity: 'medium',
          section: 'ncs'
        });
      }
    }

    return errors;
  }

  static calculateConfidence(data: MedicalReportData, errors: ConversionError[]): number {
    let confidence = 1.0;

    // Reducir confianza por errores críticos
    const criticalErrors = errors.filter(e => e.severity === 'critical').length;
    const highErrors = errors.filter(e => e.severity === 'high').length;
    const mediumErrors = errors.filter(e => e.severity === 'medium').length;

    confidence -= criticalErrors * 0.3;
    confidence -= highErrors * 0.2;
    confidence -= mediumErrors * 0.1;

    // Aumentar confianza por datos encontrados
    if (data.patient?.id) confidence += 0.1;
    if (data.patient?.name) confidence += 0.1;
    if (data.ncsResults && data.ncsResults.length > 0) confidence += 0.2;
    if (data.emgResults && data.emgResults.length > 0) confidence += 0.2;
    if (data.diagnosis) confidence += 0.15;
    if (data.conclusion) confidence += 0.15;

    return Math.max(0, Math.min(1, confidence));
  }
}

// ========== CLASE PRINCIPAL ==========

export class FileToJsonConverter {
  private static instance: FileToJsonConverter;
  private strategies: FileConversionStrategy[] = [];
  private config: FileConverterConfig;

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

  public static getInstance(config?: Partial<FileConverterConfig>): FileToJsonConverter {
    if (!this.instance) {
      this.instance = new FileToJsonConverter(config);
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
      const validationResult = this.validateFile(file);
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
      const confidence = DataValidator.calculateConfidence(data, errors);
      
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

  private validateFile(file: File): { valid: boolean; errors: ConversionError[] } {
    const errors: ConversionError[] = [];

    // Validar tamaño
    if (file.size === 0) {
      errors.push({
        code: 'EMPTY_FILE',
        message: 'El archivo está vacío',
        severity: 'critical'
      });
    }

    if (file.size > 50 * 1024 * 1024) { // 50 MB
      errors.push({
        code: 'FILE_TOO_LARGE',
        message: 'El archivo es demasiado grande (máximo 50MB)',
        severity: 'critical'
      });
    }

    // Validar extensión
    const extension = file.name.split('.').pop()?.toLowerCase() || '';
    if (!this.config.supportedFormats.includes(extension)) {
      errors.push({
        code: 'UNSUPPORTED_FORMAT',
        message: `Formato no soportado: ${extension}`,
        severity: 'critical',
        suggestion: `Formatos soportados: ${this.config.supportedFormats.join(', ')}`
      });
    }

    return {
      valid: errors.length === 0,
      errors
    };
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

  private async processTextToMedicalData(text: string): Promise<MedicalReportData> {
    const data: MedicalReportData = {};

    // Procesar en paralelo para mejor rendimiento
    const [
      patientData,
      ncsResults,
      emgResults,
      clinicalData
    ] = await Promise.all([
      Promise.resolve(PatientDataProcessor.extract(text)),
      Promise.resolve(NCSDataProcessor.extract(text)),
      Promise.resolve(EMGDataProcessor.extract(text)),
      Promise.resolve(ClinicalDataProcessor.extract(text))
    ]);

    data.patient = patientData;
    data.ncsResults = ncsResults;
    data.emgResults = emgResults;
    data.diagnosis = clinicalData.diagnosis;
    data.conclusion = clinicalData.conclusion;
    data.recommendations = clinicalData.recommendations;
    data.notes = clinicalData.notes;

    return data;
  }

  private validateExtractedData(data: MedicalReportData): ConversionError[] {
    const errors: ConversionError[] = [];

    if (data.patient) {
      errors.push(...DataValidator.validatePatient(data.patient));
    }

    if (data.ncsResults) {
      errors.push(...DataValidator.validateNCS(data.ncsResults));
    }

    return errors;
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
}

// ========== FUNCIONES DE UTILIDAD ==========

export function createConverter(config?: Partial<FileConverterConfig>): FileToJsonConverter {
  return FileToJsonConverter.getInstance(config);
}

export async function convertFile(file: File, config?: Partial<FileConverterConfig>): Promise<ConversionResult> {
  const converter = createConverter(config);
  return await converter.convert(file);
}

export function isConversionSuccessful(result: ConversionResult): boolean {
  return result.success && result.confidence >= 0.6;
} 