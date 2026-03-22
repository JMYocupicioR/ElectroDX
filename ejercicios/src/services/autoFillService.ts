// 🚀 SERVICIO DE AUTO-LLENADO INTEGRADO
// ====================================
// Conecta la conversión de archivos RTF con el mapeo automático de formularios EMG

import { ConversionResult, MedicalReportData, createConverter } from './enhanced-file-converter';
import { FormDataMapper, ExtractedFileData, MappingResult } from './formDataMapper';
import { ClinicalSymptomsData } from '../components/ClinicalSymptomsForm';
import { NCSTestResult } from '../types/ncs';
import { EMGNerveRecord } from '../components/EMGNeedleAnalysis';
import { Patient } from '../types/patient';

// ========== INTERFACES ==========

export interface AutoFillResult {
  success: boolean;
  confidence: number;
  data: {
    patient: Partial<Patient>;
    symptoms: ClinicalSymptomsData;
    ncsResults: NCSTestResult[];
    emgResults: EMGNerveRecord[];
  };
  conversion: {
    success: boolean;
    extractedText: string;
    processingTime: number;
    metadata: any;
  };
  mapping: {
    totalFieldsMapped: number;
    overallConfidence: number;
    symptomsConfidence: number;
    ncsConfidence: number;
    emgConfidence: number;
  };
  warnings: string[];
  errors: string[];
  logs: string[];
}

export interface AutoFillOptions {
  enableAdvancedPatterns?: boolean;
  enableAIEnhancement?: boolean;
  enableValidation?: boolean;
  minConfidenceThreshold?: number;
  debugMode?: boolean;
}

// ========== CLASE PRINCIPAL ==========

export class AutoFillService {
  private static instance: AutoFillService;
  private logs: string[] = [];

  private constructor() {}

  public static getInstance(): AutoFillService {
    if (!this.instance) {
      this.instance = new AutoFillService();
    }
    return this.instance;
  }

  // ========================================
  // MÉTODO PRINCIPAL DE AUTO-LLENADO
  // ========================================
  public async processFileAndFillForms(
    file: File, 
    options: AutoFillOptions = {}
  ): Promise<AutoFillResult> {
    this.clearLogs();
    this.log('🚀 Iniciando proceso completo de auto-llenado');
    this.log(`📄 Archivo: ${file.name} (${(file.size / 1024).toFixed(1)} KB)`);

    const startTime = Date.now();
    const defaultOptions: AutoFillOptions = {
      enableAdvancedPatterns: true,
      enableAIEnhancement: false,
      enableValidation: true,
      minConfidenceThreshold: 0.6,
      debugMode: false,
      ...options
    };

    try {
      // ========== PASO 1: CONVERSIÓN DE ARCHIVO ==========
      this.log('📖 PASO 1: Convirtiendo archivo RTF...');
      const conversionResult = await this.convertFile(file, defaultOptions);
      
      if (!conversionResult.success) {
        throw new Error(`Error en conversión: ${conversionResult.errors.map(e => e.message).join(', ')}`);
      }

      this.log(`✅ Conversión exitosa. Texto extraído: ${conversionResult.metadata.extractedTextLength} caracteres`);

      // ========== PASO 2: TRANSFORMACIÓN DE DATOS ==========
      this.log('🔄 PASO 2: Transformando datos extraídos...');
      const extractedData = this.transformMedicalDataToExtracted(conversionResult.data!);
      
      this.log(`📊 Datos transformados:`, {
        patient: !!extractedData.patient,
        ncsResults: extractedData.ncsResults?.length || 0,
        emgResults: extractedData.emgResults?.length || 0,
        symptoms: !!extractedData.symptoms
      });

      // ========== PASO 3: MAPEO A FORMULARIOS ==========
      this.log('🎯 PASO 3: Mapeando datos a formularios...');
      const mappingResult = FormDataMapper.mapAllFormData(extractedData);

      this.log(`✅ Mapeo completado:`, {
        success: mappingResult.overall.success,
        totalFieldsMapped: mappingResult.overall.totalFieldsMapped,
        confidence: `${(mappingResult.overall.overallConfidence * 100).toFixed(1)}%`
      });

      // ========== PASO 4: VALIDACIÓN FINAL ==========
      this.log('🔍 PASO 4: Validación final...');
      const finalValidation = this.validateFinalResults(mappingResult, defaultOptions);

      const processingTime = Date.now() - startTime;
      this.log(`🎉 Proceso completado en ${processingTime}ms`);

      // ========== RESULTADO FINAL ==========
      const result: AutoFillResult = {
        success: finalValidation.success,
        confidence: mappingResult.overall.overallConfidence,
        data: {
          patient: mappingResult.patient,
          symptoms: mappingResult.symptoms.data,
          ncsResults: mappingResult.ncs.data,
          emgResults: mappingResult.emg.data
        },
        conversion: {
          success: conversionResult.success,
          extractedText: conversionResult.metadata.extractedTextLength > 0 ? 'Texto extraído exitosamente' : 'Sin texto extraído',
          processingTime: conversionResult.metadata.processingTimeMs,
          metadata: conversionResult.metadata
        },
        mapping: {
          totalFieldsMapped: mappingResult.overall.totalFieldsMapped,
          overallConfidence: mappingResult.overall.overallConfidence,
          symptomsConfidence: mappingResult.symptoms.mappingStats.confidence,
          ncsConfidence: mappingResult.ncs.mappingStats.confidence,
          emgConfidence: mappingResult.emg.mappingStats.confidence
        },
        warnings: [
          ...conversionResult.warnings,
          ...mappingResult.overall.warnings,
          ...finalValidation.warnings
        ],
        errors: [
          ...conversionResult.errors.map(e => e.message),
          ...mappingResult.overall.errors,
          ...finalValidation.errors
        ],
        logs: [...this.logs]
      };

      this.log(`📋 Resultado final:`, {
        success: result.success,
        confidence: `${(result.confidence * 100).toFixed(1)}%`,
        warnings: result.warnings.length,
        errors: result.errors.length
      });

      return result;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      this.log(`❌ Error crítico: ${errorMessage}`);

      return {
        success: false,
        confidence: 0,
        data: {
          patient: {},
          symptoms: this.getEmptySymptoms(),
          ncsResults: [],
          emgResults: []
        },
        conversion: {
          success: false,
          extractedText: '',
          processingTime: Date.now() - startTime,
          metadata: {}
        },
        mapping: {
          totalFieldsMapped: 0,
          overallConfidence: 0,
          symptomsConfidence: 0,
          ncsConfidence: 0,
          emgConfidence: 0
        },
        warnings: [],
        errors: [errorMessage],
        logs: [...this.logs]
      };
    }
  }

  // ========================================
  // MÉTODOS AUXILIARES
  // ========================================

  private async convertFile(file: File, options: AutoFillOptions): Promise<ConversionResult> {
    const converter = createConverter({
      enableValidation: options.enableValidation,
      enableAIEnhancement: options.enableAIEnhancement,
      minConfidenceThreshold: options.minConfidenceThreshold || 0.6,
      debugMode: options.debugMode || false
    });

    return await converter.convert(file);
  }

  private transformMedicalDataToExtracted(data: MedicalReportData): ExtractedFileData {
    // Transformar datos del paciente
    const patient = data.patient ? {
      id: data.patient.id || '',
      name: `${data.patient.firstName || ''} ${data.patient.lastName || ''}`.trim(),
      age: data.patient.dateOfBirth ? this.calculateAge(data.patient.dateOfBirth) : 0,
      sex: (data.patient.sex === 'other' ? 'male' : data.patient.sex) || 'male'
    } : undefined;

    // Transformar resultados NCS
    const ncsResults = data.ncsResults?.map(ncs => ({
      nerve: ncs.nerve,
      side: ncs.side,
      latency: ncs.latency,
      amplitude: ncs.amplitude,
      velocity: ncs.velocity,
      status: ncs.status === 'undetermined' ? 'normal' : ncs.status,
      findings: ncs.findings
    }));

    // Transformar resultados EMG
    const emgResults = data.emgResults?.map(emg => ({
      muscle: emg.muscleOrNerveName,
      side: emg.side,
      insertionalActivity: emg.insertionalActivity,
      spontaneousActivity: emg.spontaneousActivity,
      motorUnitPotentials: emg.motorUnitPotentials,
      recruitmentPattern: emg.recruitmentPattern
    }));

    // Inferir síntomas basados en datos clínicos
    const symptoms = this.inferSymptomsFromClinicalData(data);

    return {
      patient,
      ncsResults,
      emgResults,
      symptoms,
      warnings: []
    };
  }

  /**
   * MEJORADO: Inferir síntomas desde datos clínicos con análisis de contexto
   * Evita falsos positivos analizando negaciones y calificadores
   */
  private inferSymptomsFromClinicalData(data: MedicalReportData): any {
    const symptoms: any = {};
    const clinicalText = `${data.diagnosis || ''} ${data.conclusion || ''} ${data.notes || ''}`.toLowerCase();
    
    // 🔥 ANÁLISIS DE CONTEXTO PARA DOLOR
    if (/\b(dolor|pain)\s+(agudo|severo|intenso|grave|fuerte)\b/i.test(clinicalText)) {
      symptoms.pain = { present: true, severity: 'severe', location: this.extractPainLocation(clinicalText) };
    } else if (/\b(dolor|pain)\s+(leve|moderado|ligero)\b/i.test(clinicalText)) {
      symptoms.pain = { present: true, severity: 'moderate', location: this.extractPainLocation(clinicalText) };
    } else if (/\b(sin|no hay|niega|ausencia de|no refiere|no presenta)\s+(dolor|pain)\b/i.test(clinicalText)) {
      symptoms.pain = { present: false, severity: 'none' };
    } else if (/\b(dolor|pain)\b/i.test(clinicalText) && !/\b(sin|no|niega|ausencia)\b/i.test(clinicalText)) {
      symptoms.pain = { present: true, severity: 'mild', location: this.extractPainLocation(clinicalText) };
    }

    // 🔥 ANÁLISIS DE CONTEXTO PARA DEBILIDAD
    if (/\b(debilidad|weakness)\s+(severa|grave|marcada|importante)\b/i.test(clinicalText)) {
      symptoms.weakness = { present: true, severity: 'severe', distribution: this.extractWeaknessDistribution(clinicalText) };
    } else if (/\b(debilidad|weakness)\s+(leve|moderada|ligera)\b/i.test(clinicalText)) {
      symptoms.weakness = { present: true, severity: 'moderate', distribution: this.extractWeaknessDistribution(clinicalText) };
    } else if (/\b(sin|no hay|niega|ausencia de|no refiere|no presenta)\s+(debilidad|weakness)\b/i.test(clinicalText)) {
      symptoms.weakness = { present: false, severity: 'none' };
    } else if (/\b(debilidad|weakness|paresia|parálisis)\b/i.test(clinicalText) && !/\b(sin|no|niega|ausencia)\b/i.test(clinicalText)) {
      symptoms.weakness = { present: true, severity: 'mild', distribution: this.extractWeaknessDistribution(clinicalText) };
    }

    // 🔥 ANÁLISIS DE CONTEXTO PARA PARESTESIAS
    if (/\b(parestesias|paresthesias|hormigueo|tingling)\s+(severas|graves|marcadas|importantes)\b/i.test(clinicalText)) {
      symptoms.paresthesias = { present: true, severity: 'severe', distribution: this.extractParesthesiaDistribution(clinicalText) };
    } else if (/\b(parestesias|paresthesias|hormigueo|tingling)\s+(leves|moderadas|ligeras)\b/i.test(clinicalText)) {
      symptoms.paresthesias = { present: true, severity: 'moderate', distribution: this.extractParesthesiaDistribution(clinicalText) };
    } else if (/\b(sin|no hay|niega|ausencia de|no refiere|no presenta)\s+(parestesias|paresthesias|hormigueo|tingling)\b/i.test(clinicalText)) {
      symptoms.paresthesias = { present: false, severity: 'none' };
    } else if (/\b(parestesias|paresthesias|hormigueo|tingling|adormecimiento|numbness)\b/i.test(clinicalText) && !/\b(sin|no|niega|ausencia)\b/i.test(clinicalText)) {
      symptoms.paresthesias = { present: true, severity: 'mild', distribution: this.extractParesthesiaDistribution(clinicalText) };
    }

    // 🔥 ANÁLISIS DE CONTEXTO PARA FASCICULACIONES
    if (/\b(fasciculaciones|fasciculations|contracciones|twitching)\s+(generalizadas|difusas|múltiples)\b/i.test(clinicalText)) {
      symptoms.fasciculations = { present: true, severity: 'severe', distribution: 'generalized' };
    } else if (/\b(sin|no hay|niega|ausencia de|no refiere|no presenta)\s+(fasciculaciones|fasciculations|contracciones|twitching)\b/i.test(clinicalText)) {
      symptoms.fasciculations = { present: false, severity: 'none' };
    } else if (/\b(fasciculaciones|fasciculations|contracciones|twitching)\b/i.test(clinicalText) && !/\b(sin|no|niega|ausencia)\b/i.test(clinicalText)) {
      symptoms.fasciculations = { present: true, severity: 'mild', distribution: this.extractFasciculationDistribution(clinicalText) };
    }

    // 🔥 ANÁLISIS DE CONTEXTO PARA CALAMBRES
    if (/\b(calambres|cramps|espasmos|spasms)\s+(severos|graves|frecuentes|nocturnos)\b/i.test(clinicalText)) {
      symptoms.cramps = { present: true, severity: 'severe', frequency: this.extractCrampFrequency(clinicalText) };
    } else if (/\b(sin|no hay|niega|ausencia de|no refiere|no presenta)\s+(calambres|cramps|espasmos|spasms)\b/i.test(clinicalText)) {
      symptoms.cramps = { present: false, severity: 'none' };
    } else if (/\b(calambres|cramps|espasmos|spasms)\b/i.test(clinicalText) && !/\b(sin|no|niega|ausencia)\b/i.test(clinicalText)) {
      symptoms.cramps = { present: true, severity: 'mild', frequency: this.extractCrampFrequency(clinicalText) };
    }

    // 🔥 ANÁLISIS DE CONTEXTO PARA ATROFIA
    if (/\b(atrofia|atrophy)\s+(severa|grave|marcada|importante)\b/i.test(clinicalText)) {
      symptoms.atrophy = { present: true, severity: 'severe', distribution: this.extractAtrophyDistribution(clinicalText) };
    } else if (/\b(atrofia|atrophy)\s+(leve|moderada|ligera)\b/i.test(clinicalText)) {
      symptoms.atrophy = { present: true, severity: 'moderate', distribution: this.extractAtrophyDistribution(clinicalText) };
    } else if (/\b(sin|no hay|niega|ausencia de|no refiere|no presenta)\s+(atrofia|atrophy)\b/i.test(clinicalText)) {
      symptoms.atrophy = { present: false, severity: 'none' };
    } else if (/\b(atrofia|atrophy|adelgazamiento|wasting)\b/i.test(clinicalText) && !/\b(sin|no|niega|ausencia)\b/i.test(clinicalText)) {
      symptoms.atrophy = { present: true, severity: 'mild', distribution: this.extractAtrophyDistribution(clinicalText) };
    }

    // 🔥 ANÁLISIS DE CONTEXTO PARA DIFICULTAD PARA CAMINAR
    if (/\b(dificultad para caminar|walking difficulty|marcha|gait)\s+(severa|grave|marcada|importante)\b/i.test(clinicalText)) {
      symptoms.walkingDifficulty = { present: true, severity: 'severe', pattern: this.extractGaitPattern(clinicalText) };
    } else if (/\b(sin|no hay|niega|ausencia de|no refiere|no presenta)\s+(dificultad para caminar|walking difficulty|marcha|gait)\b/i.test(clinicalText)) {
      symptoms.walkingDifficulty = { present: false, severity: 'none' };
    } else if (/\b(dificultad para caminar|walking difficulty|claudicación|limping|cojera)\b/i.test(clinicalText) && !/\b(sin|no|niega|ausencia)\b/i.test(clinicalText)) {
      symptoms.walkingDifficulty = { present: true, severity: 'mild', pattern: this.extractGaitPattern(clinicalText) };
    }

    console.log('🔍 Síntomas inferidos con análisis de contexto:', symptoms);
    return Object.keys(symptoms).length > 0 ? symptoms : undefined;
  }

  /**
   * NUEVO: Extraer ubicación del dolor
   */
  private extractPainLocation(text: string): string {
    if (/\b(cervical|cuello|neck)\b/i.test(text)) return 'cervical';
    if (/\b(lumbar|espalda baja|lower back)\b/i.test(text)) return 'lumbar';
    if (/\b(torácico|dorsal|chest)\b/i.test(text)) return 'thoracic';
    if (/\b(brazo|arm|upper limb|mmss)\b/i.test(text)) return 'upper_limb';
    if (/\b(pierna|leg|lower limb|mmii)\b/i.test(text)) return 'lower_limb';
    return 'unspecified';
  }

  /**
   * NUEVO: Extraer distribución de la debilidad
   */
  private extractWeaknessDistribution(text: string): string {
    if (/\b(generalizada|generalized|difusa|widespread)\b/i.test(text)) return 'generalized';
    if (/\b(proximal|shoulder|cadera|hip)\b/i.test(text)) return 'proximal';
    if (/\b(distal|manos|hands|pies|feet)\b/i.test(text)) return 'distal';
    if (/\b(unilateral|hemiplejia|hemiparesia)\b/i.test(text)) return 'unilateral';
    if (/\b(bilateral|both sides)\b/i.test(text)) return 'bilateral';
    return 'focal';
  }

  /**
   * NUEVO: Extraer distribución de parestesias
   */
  private extractParesthesiaDistribution(text: string): string {
    if (/\b(manos|hands|dedos|fingers)\b/i.test(text)) return 'hands';
    if (/\b(pies|feet|dedos de los pies|toes)\b/i.test(text)) return 'feet';
    if (/\b(bilateral|both sides|ambos lados)\b/i.test(text)) return 'bilateral';
    if (/\b(unilateral|one side|un lado)\b/i.test(text)) return 'unilateral';
    return 'focal';
  }

  /**
   * NUEVO: Extraer distribución de fasciculaciones
   */
  private extractFasciculationDistribution(text: string): string {
    if (/\b(generalizadas|generalized|difusas|widespread)\b/i.test(text)) return 'generalized';
    if (/\b(lengua|tongue|bulbar)\b/i.test(text)) return 'bulbar';
    if (/\b(brazo|arm|upper limb)\b/i.test(text)) return 'upper_limb';
    if (/\b(pierna|leg|lower limb)\b/i.test(text)) return 'lower_limb';
    return 'focal';
  }

  /**
   * NUEVO: Extraer frecuencia de calambres
   */
  private extractCrampFrequency(text: string): string {
    if (/\b(nocturnos|nocturnal|night)\b/i.test(text)) return 'nocturnal';
    if (/\b(frecuentes|frequent|daily|diarios)\b/i.test(text)) return 'frequent';
    if (/\b(ocasionales|occasional|sporadic)\b/i.test(text)) return 'occasional';
    return 'unspecified';
  }

  /**
   * NUEVO: Extraer distribución de atrofia
   */
  private extractAtrophyDistribution(text: string): string {
    if (/\b(manos|hands|thenar|hypothenar)\b/i.test(text)) return 'hands';
    if (/\b(proximal|shoulder|cadera|hip)\b/i.test(text)) return 'proximal';
    if (/\b(distal|extremidades distales)\b/i.test(text)) return 'distal';
    if (/\b(generalizada|generalized|difusa)\b/i.test(text)) return 'generalized';
    return 'focal';
  }

  /**
   * NUEVO: Extraer patrón de marcha
   */
  private extractGaitPattern(text: string): string {
    if (/\b(espástica|spastic)\b/i.test(text)) return 'spastic';
    if (/\b(atáxica|ataxic|inestable)\b/i.test(text)) return 'ataxic';
    if (/\b(steppage|pie caído|foot drop)\b/i.test(text)) return 'steppage';
    if (/\b(miopática|myopathic|waddle)\b/i.test(text)) return 'myopathic';
    return 'unspecified';
  }

  private validateFinalResults(mappingResult: any, options: AutoFillOptions): {
    success: boolean;
    warnings: string[];
    errors: string[];
  } {
    const warnings: string[] = [];
    const errors: string[] = [];

    // Validar umbral de confianza mínimo
    if (mappingResult.overall.overallConfidence < (options.minConfidenceThreshold || 0.6)) {
      warnings.push(`Confianza general baja: ${(mappingResult.overall.overallConfidence * 100).toFixed(1)}%`);
    }

    // Validar datos esenciales
    if (!mappingResult.patient.id && !mappingResult.patient.firstName) {
      warnings.push('No se encontraron datos básicos del paciente');
    }

    if (mappingResult.ncs.data.length === 0 && mappingResult.emg.data.length === 0) {
      warnings.push('No se encontraron datos de estudios electrofisiológicos');
    }

    // El proceso es exitoso si no hay errores críticos
    const success = errors.length === 0;

    return { success, warnings, errors };
  }

  private calculateAge(dateOfBirth: string): number {
    const birthDate = new Date(dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  }

  private getEmptySymptoms(): ClinicalSymptomsData {
    const createEmptySymptom = (id: string, name: string) => ({
      id,
      name,
      present: false,
      severity: 'mild' as const,
      duration: '',
      onset: 'gradual' as const,
      progression: 'stable' as const,
      location: [],
      characteristics: [],
      triggers: [],
      alleviatingFactors: [],
      associatedSymptoms: [],
      notes: ''
    });

    return {
      motor: {
        weakness: createEmptySymptom('weakness', 'Debilidad muscular'),
        fatigue: createEmptySymptom('fatigue', 'Fatiga'),
        cramps: createEmptySymptom('cramps', 'Calambres'),
        stiffness: createEmptySymptom('stiffness', 'Rigidez'),
        tremor: createEmptySymptom('tremor', 'Temblor'),
        fasciculations: createEmptySymptom('fasciculations', 'Fasciculaciones')
      },
      sensory: {
        numbness: createEmptySymptom('numbness', 'Entumecimiento'),
        tingling: createEmptySymptom('tingling', 'Hormigueo'),
        burning: createEmptySymptom('burning', 'Ardor'),
        pain: createEmptySymptom('pain', 'Dolor'),
        hyperalgesia: createEmptySymptom('hyperalgesia', 'Hiperalgesia'),
        allodynia: createEmptySymptom('allodynia', 'Alodinia')
      },
      autonomic: {
        sweating: createEmptySymptom('sweating', 'Alteraciones sudoración'),
        temperature: createEmptySymptom('temperature', 'Disregulación térmica'),
        skinChanges: createEmptySymptom('skinChanges', 'Cambios en la piel'),
        vasomotor: createEmptySymptom('vasomotor', 'Síntomas vasomotores')
      },
      functional: {
        walkingDifficulty: createEmptySymptom('walkingDifficulty', 'Dificultad para caminar'),
        handFunction: createEmptySymptom('handFunction', 'Disfunción manual'),
        balance: createEmptySymptom('balance', 'Alteraciones del equilibrio'),
        coordination: createEmptySymptom('coordination', 'Problemas de coordinación')
      },
      constitutional: {
        weightLoss: createEmptySymptom('weightLoss', 'Pérdida de peso'),
        sleep: createEmptySymptom('sleep', 'Alteraciones del sueño'),
        mood: createEmptySymptom('mood', 'Cambios del estado de ánimo')
      }
    };
  }

  // ========================================
  // MÉTODOS DE LOGGING
  // ========================================

  private log(message: string, data?: any): void {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] ${message}`;
    
    this.logs.push(logMessage);
    
    if (data) {
      console.log(logMessage, data);
    } else {
      console.log(logMessage);
    }
  }

  private clearLogs(): void {
    this.logs = [];
  }

  public getLogs(): string[] {
    return [...this.logs];
  }

  // ========================================
  // MÉTODOS PÚBLICOS ADICIONALES
  // ========================================

  public async processFileOnly(file: File, options: AutoFillOptions = {}): Promise<ConversionResult> {
    return await this.convertFile(file, options);
  }

  public mapDataOnly(data: MedicalReportData): any {
    const extractedData = this.transformMedicalDataToExtracted(data);
    return FormDataMapper.mapAllFormData(extractedData);
  }

}

// ========== FUNCIONES DE UTILIDAD ==========

export function createAutoFillService(): AutoFillService {
  return AutoFillService.getInstance();
}

export async function autoFillFromFile(
  file: File, 
  options: AutoFillOptions = {}
): Promise<AutoFillResult> {
  const service = createAutoFillService();
  return await service.processFileAndFillForms(file, options);
}

export default AutoFillService; 