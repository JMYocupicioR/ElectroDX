import { ConversionResult, MedicalReportData, ConversionError } from '../services/enhanced-file-converter';
import { NCSTestResult } from '../types/ncs';
import { EMGNerveRecord } from '../services/jsonReportGenerator';

// ========== CACHE SYSTEM ==========

export interface CacheEntry {
  fileHash: string;
  result: ConversionResult;
  timestamp: number;
  accessCount: number;
}

export class FileConversionCache {
  private cache = new Map<string, CacheEntry>();
  private maxSize = 100;
  private maxAge = 24 * 60 * 60 * 1000; // 24 hours

  async generateFileHash(file: File): Promise<string> {
    const buffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => {
      const hex = b.toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    }).join('');
  }

  async get(file: File): Promise<ConversionResult | null> {
    const hash = await this.generateFileHash(file);
    const entry = this.cache.get(hash);

    if (!entry) return null;

    // Check if entry is expired
    if (Date.now() - entry.timestamp > this.maxAge) {
      this.cache.delete(hash);
      return null;
    }

    // Update access count
    entry.accessCount++;
    return entry.result;
  }

  async set(file: File, result: ConversionResult): Promise<void> {
    const hash = await this.generateFileHash(file);

    // Clean cache if needed
    if (this.cache.size >= this.maxSize) {
      this.cleanOldEntries();
    }

    this.cache.set(hash, {
      fileHash: hash,
      result,
      timestamp: Date.now(),
      accessCount: 1
    });
  }

  private cleanOldEntries(): void {
    const entries = Array.from(this.cache.entries());
    
    // Sort by access count and age, remove least used/oldest
    entries.sort((a, b) => {
      const scoreA = a[1].accessCount - (Date.now() - a[1].timestamp) / 1000000;
      const scoreB = b[1].accessCount - (Date.now() - b[1].timestamp) / 1000000;
      return scoreA - scoreB;
    });

    // Remove bottom 25%
    const toRemove = Math.floor(entries.length * 0.25);
    for (let i = 0; i < toRemove; i++) {
      this.cache.delete(entries[i][0]);
    }
  }

  clear(): void {
    this.cache.clear();
  }

  getStats(): { size: number; hitRate: number; averageAge: number } {
    const entries = Array.from(this.cache.values());
    const totalAccess = entries.reduce((sum, entry) => sum + entry.accessCount, 0);
    const totalEntries = entries.length;
    const avgAge = totalEntries > 0 
      ? entries.reduce((sum, entry) => sum + (Date.now() - entry.timestamp), 0) / totalEntries
      : 0;

    return {
      size: totalEntries,
      hitRate: totalAccess > 0 ? totalEntries / totalAccess : 0,
      averageAge: avgAge
    };
  }
}

// ========== ADVANCED VALIDATORS MEJORADOS ==========

export class MedicalDataValidators {
  // Validate NCS values are within realistic ranges
  static validateNCSValues(ncsResult: NCSTestResult): ConversionError[] {
    const errors: ConversionError[] = [];

    // Latency validation (realistic medical ranges)
    if (ncsResult.latency < 1 || ncsResult.latency > 50) {
      errors.push({
        code: 'UNREALISTIC_LATENCY',
        message: `Latencia fuera de rango esperado: ${ncsResult.latency}ms`,
        severity: 'medium',
        section: 'ncs',
        suggestion: 'Verificar que la latencia esté en milisegundos y sea realista (1-50ms)'
      });
    }

    // Amplitude validation
    const isMotor = ncsResult.type === 'motor';
    const minAmp = isMotor ? 0.1 : 1;
    const maxAmp = isMotor ? 50 : 200;

    if (ncsResult.amplitude < minAmp || ncsResult.amplitude > maxAmp) {
      errors.push({
        code: 'UNREALISTIC_AMPLITUDE',
        message: `Amplitud ${isMotor ? 'motora' : 'sensitiva'} fuera de rango: ${ncsResult.amplitude}${isMotor ? 'mV' : 'μV'}`,
        severity: 'medium',
        section: 'ncs',
        suggestion: `Amplitud ${isMotor ? 'motora' : 'sensitiva'} esperada: ${minAmp}-${maxAmp}${isMotor ? 'mV' : 'μV'}`
      });
    }

    // Velocity validation
    if (ncsResult.velocity < 20 || ncsResult.velocity > 120) {
      errors.push({
        code: 'UNREALISTIC_VELOCITY',
        message: `Velocidad de conducción fuera de rango: ${ncsResult.velocity}m/s`,
        severity: 'medium',
        section: 'ncs',
        suggestion: 'Velocidad de conducción esperada: 20-120 m/s'
      });
    }

    return errors;
  }

  // Validate EMG data consistency
  static validateEMGData(emgRecord: EMGNerveRecord): ConversionError[] {
    const errors: ConversionError[] = [];

    // Check for contradictory findings
    if (emgRecord.insertionalActivity === 'absent' && 
        (emgRecord.spontaneousActivity.fibrillations || emgRecord.spontaneousActivity.positiveWaves)) {
      errors.push({
        code: 'CONTRADICTORY_EMG_FINDINGS',
        message: 'Actividad de inserción ausente pero con actividad espontánea presente',
        severity: 'high',
        section: 'emg',
        suggestion: 'Verificar consistencia entre actividad de inserción y espontánea'
      });
    }

    // Validate MUP values
    if (emgRecord.motorUnitPotentials.amplitude > 10000) {
      errors.push({
        code: 'UNREALISTIC_MUP_AMPLITUDE',
        message: `Amplitud de PUM demasiado alta: ${emgRecord.motorUnitPotentials.amplitude}μV`,
        severity: 'medium',
        section: 'emg',
        suggestion: 'Amplitud de PUM típicamente < 10000μV'
      });
    }

    if (emgRecord.motorUnitPotentials.duration > 50) {
      errors.push({
        code: 'UNREALISTIC_MUP_DURATION',
        message: `Duración de PUM demasiado larga: ${emgRecord.motorUnitPotentials.duration}ms`,
        severity: 'medium',
        section: 'emg',
        suggestion: 'Duración de PUM típicamente < 50ms'
      });
    }

    return errors;
  }

  // Cross-validate NCS and EMG consistency
  static validateNCSEMGConsistency(ncsResults: NCSTestResult[], emgResults: EMGNerveRecord[]): ConversionError[] {
    const errors: ConversionError[] = [];

    // Check if severe NCS abnormalities correlate with EMG findings
    const severeNCSAbnormalities = ncsResults.filter(ncs => 
      ncs.amplitude < (ncs.type === 'motor' ? 2 : 5) || ncs.velocity < 30
    );

    if (severeNCSAbnormalities.length > 0) {
      const hasEMGAbnormalities = emgResults.some(emg =>
        emg.spontaneousActivity.fibrillations || 
        emg.spontaneousActivity.positiveWaves ||
        emg.recruitmentPattern !== 'normal'
      );

      if (!hasEMGAbnormalities) {
        errors.push({
          code: 'NCS_EMG_MISMATCH',
          message: 'Severas alteraciones en NCS pero EMG normal',
          severity: 'medium',
          section: 'consistency',
          suggestion: 'Verificar que los estudios NCS y EMG correspondan al mismo paciente/área'
        });
      }
    }

    return errors;
  }
}

// ========== PATTERN MATCHING UTILITIES ==========

export class PatternMatchingUtils {
  // Enhanced regex patterns for medical documents
  static readonly PATTERNS = {
    // Table detection patterns
    ncsTableHeaders: /(?:Nervio|Nerve|Lado|Side|Latencia|Latency|Amplitud|Amplitude|Velocidad|Velocity)/gi,
    emgTableHeaders: /(?:Músculo|Muscle|Actividad|Activity|Reclutamiento|Recruitment|Fibrilaciones|Fibrillations)/gi,
    
    // Value extraction patterns
    medicalValues: /(\d+(?:\.\d+)?)\s*(?:ms|mV|μV|uV|m\/s|Hz|%)/gi,
    percentageValues: /(\d+(?:\.\d+)?)\s*%/gi,
    
    // Section delimiters
    sectionBreaks: /(?:^|\n)(?:[A-Z\s]{3,}:?|_{3,}|-{3,}|={3,})\s*$/gm,
    
    // Medical terminology
    anatomicalTerms: /(?:ulnar|median|radial|peroneal|tibial|femoral|sciatic|axillary|musculocutaneous)/gi,
    pathologyTerms: /(?:neuropathy|myopathy|radiculopathy|plexopathy|entrapment|compression)/gi
  };

  static extractTabularData(text: string, headerPattern: RegExp): string[][] {
    const lines = text.split('\n');
    const tables: string[][] = [];
    let currentTable: string[] = [];
    let inTable = false;

    for (const line of lines) {
      const trimmedLine = line.trim();
      
      if (headerPattern.test(trimmedLine)) {
        if (currentTable.length > 0) {
          tables.push([...currentTable]);
        }
        currentTable = [trimmedLine];
        inTable = true;
      } else if (inTable && trimmedLine.length > 0) {
        // Check if line contains medical values (likely data row)
        if (this.PATTERNS.medicalValues.test(trimmedLine)) {
          currentTable.push(trimmedLine);
        } else if (this.PATTERNS.sectionBreaks.test(trimmedLine)) {
          inTable = false;
          if (currentTable.length > 1) {
            tables.push([...currentTable]);
          }
          currentTable = [];
        }
      }
    }

    if (currentTable.length > 1) {
      tables.push(currentTable);
    }

    return tables;
  }

  static extractMedicalValues(text: string): Array<{ value: number; unit: string; context: string }> {
    const values: Array<{ value: number; unit: string; context: string }> = [];
    const regex = /(\d+(?:\.\d+)?)\s*(ms|mV|μV|uV|m\/s|Hz|%)/gi;
    let match;

    while ((match = regex.exec(text)) !== null) {
      const startPos = Math.max(0, match.index - 50);
      const endPos = Math.min(text.length, match.index + match[0].length + 50);
      const context = text.substring(startPos, endPos).trim();

      values.push({
        value: parseFloat(match[1]),
        unit: match[2],
        context
      });
    }

    return values;
  }

  static detectLanguage(text: string): 'es' | 'en' | 'unknown' {
    const spanishWords = /(?:paciente|edad|sexo|diagnóstico|conclusión|estudio|nervio|músculo|latencia|amplitud|velocidad)/gi;
    const englishWords = /(?:patient|age|sex|diagnosis|conclusion|study|nerve|muscle|latency|amplitude|velocity)/gi;

    const spanishMatches = (text.match(spanishWords) || []).length;
    const englishMatches = (text.match(englishWords) || []).length;

    if (spanishMatches > englishMatches) return 'es';
    if (englishMatches > spanishMatches) return 'en';
    return 'unknown';
  }
}

// ========== QUALITY METRICS ==========

export class QualityMetrics {
  static calculateDataCompleteness(data: MedicalReportData): number {
    let score = 0;
    let maxScore = 0;

    // Patient data (20% of total score)
    maxScore += 20;
    if (data.patient?.id) score += 5;
    if (data.patient?.name) score += 5;
    if (data.patient?.dateOfBirth) score += 5;
    if (data.patient?.sex) score += 5;

    // NCS data (40% of total score)
    maxScore += 40;
    if (data.ncsResults && data.ncsResults.length > 0) {
      score += 20; // Base score for having NCS data
      
      const completeTests = data.ncsResults.filter(test => 
        test.latency > 0 && test.amplitude > 0 && test.velocity > 0
      );
      
      const completenessRatio = completeTests.length / data.ncsResults.length;
      score += 20 * completenessRatio;
    }

    // EMG data (30% of total score)
    maxScore += 30;
    if (data.emgResults && data.emgResults.length > 0) {
      score += 15; // Base score for having EMG data
      
      const completeEMG = data.emgResults.filter(emg =>
        emg.insertionalActivity !== '' && 
        emg.recruitmentPattern !== ''
      );
      
      const emgCompletenessRatio = completeEMG.length / data.emgResults.length;
      score += 15 * emgCompletenessRatio;
    }

    // Clinical data (10% of total score)
    maxScore += 10;
    if (data.diagnosis) score += 5;
    if (data.conclusion) score += 5;

    return maxScore > 0 ? score / maxScore : 0;
  }

  static calculateExtraccionAccuracy(data: MedicalReportData, originalText: string): number {
    let accuracyScore = 1.0;

    // Check for impossible values
    if (data.ncsResults) {
      for (const ncs of data.ncsResults) {
        if (ncs.latency > 100 || ncs.latency < 0.1) accuracyScore -= 0.1;
        if (ncs.amplitude > 100 || ncs.amplitude < 0) accuracyScore -= 0.1;
        if (ncs.velocity > 200 || ncs.velocity < 10) accuracyScore -= 0.1;
      }
    }

    // Check for text extraction artifacts
    const suspiciousPatterns = [
      /[^\w\s\.\,\:\;\!\?\-\(\)]/g, // Non-standard characters
      /\d{10,}/g, // Very long numbers
      /[A-Z]{10,}/g // Very long uppercase sequences
    ];

    for (const pattern of suspiciousPatterns) {
      const matches = originalText.match(pattern);
      if (matches && matches.length > 5) {
        accuracyScore -= 0.05;
      }
    }

    return Math.max(0, accuracyScore);
  }

  static generateQualityReport(data: MedicalReportData, originalText: string): {
    overallScore: number;
    completeness: number;
    accuracy: number;
    recommendations: string[];
  } {
    const completeness = this.calculateDataCompleteness(data);
    const accuracy = this.calculateExtraccionAccuracy(data, originalText);
    const overallScore = (completeness + accuracy) / 2;

    const recommendations: string[] = [];

    if (completeness < 0.7) {
      recommendations.push('Revisar el documento original para datos faltantes');
    }

    if (accuracy < 0.8) {
      recommendations.push('Verificar manualmente los valores extraídos');
    }

    if (!data.patient?.id) {
      recommendations.push('Añadir identificador único del paciente');
    }

    if (!data.ncsResults || data.ncsResults.length === 0) {
      recommendations.push('Verificar que el documento contenga datos de neuroconducción');
    }

    return {
      overallScore,
      completeness,
      accuracy,
      recommendations
    };
  }
}

// ========== EXPORT UTILITIES ==========

export const FileConverterUtils = {
  Cache: FileConversionCache,
  Validators: MedicalDataValidators,
  Patterns: PatternMatchingUtils,
  Quality: QualityMetrics
};

export default FileConverterUtils; 