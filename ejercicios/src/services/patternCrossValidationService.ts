// 🔥 SERVICIO DE VALIDACIÓN CRUZADA DE PATRONES - PRIORIDAD 3
// ================================================================
// Detecta inconsistencias y patrones mixtos en diagnósticos EMG/NCS

import { ValidationResult } from './validationService';
import { ValidationSeverity } from '../data/emgClinicalCriteria';
import { CLINICAL_THRESHOLDS } from '../data/emgClinicalCriteria';

export interface PatternAnalysisResult {
  patternType: 'neuropathic' | 'axonal' | 'demyelinating' | 'myopathic' | 'motor_neuron_disease';
  score: number;
  confidence: number;
  supportingEvidence: string[];
}

export interface CrossValidationResult {
  isConsistent: boolean;
  detectedPatterns: PatternAnalysisResult[];
  conflicts: PatternConflict[];
  finalDiagnosis: FinalDiagnosisResult;
  recommendations: string[];
  warnings: ValidationResult[];
}

export interface PatternConflict {
  pattern1: string;
  pattern2: string;
  conflictType: 'incompatible' | 'suspicious' | 'requires_clarification';
  severity: ValidationSeverity;
  description: string;
  possibleExplanations: string[];
  recommendedActions: string[];
}

export interface FinalDiagnosisResult {
  primaryPattern: string;
  secondaryPatterns: string[];
  diagnosisType: 'single' | 'mixed' | 'indeterminate' | 'conflicting';
  confidence: number;
  clinicalCorrelation: string;
}

// 🔥 CRITERIOS DE INCOMPATIBILIDAD ENTRE PATRONES
const PATTERN_INCOMPATIBILITIES: Record<string, {
  incompatibleWith: string[];
  conflictType: 'incompatible' | 'suspicious';
  explanation: string;
}> = {
  'pure_axonal': {
    incompatibleWith: ['pure_demyelinating'],
    conflictType: 'incompatible',
    explanation: 'Un patrón puramente axonal no puede coexistir con uno puramente desmielinizante'
  },
  'pure_demyelinating': {
    incompatibleWith: ['pure_axonal'],
    conflictType: 'incompatible', 
    explanation: 'Un patrón puramente desmielinizante no puede coexistir con uno puramente axonal'
  },
  'severe_myopathic': {
    incompatibleWith: ['severe_neuropathic'],
    conflictType: 'suspicious',
    explanation: 'Es inusual tener patrones miopáticos y neuropáticos severos simultáneamente'
  },
  'normal_ncs': {
    incompatibleWith: ['severe_denervation'],
    conflictType: 'suspicious',
    explanation: 'NCS normal con denervación severa sugiere lesión muy proximal o metodología inadecuada'
  }
};

// 🔥 UMBRALES PARA DETECCIÓN DE PATRONES
const PATTERN_THRESHOLDS = {
  axonal: {
    severe: { cmapAmplitude: 20, snapAmplitude: 30 }, // % del normal
    moderate: { cmapAmplitude: 50, snapAmplitude: 60 },
    mild: { cmapAmplitude: 80, snapAmplitude: 80 }
  },
  demyelinating: {
    severe: { velocity: 60, latencyIncrease: 200 }, // % del normal
    moderate: { velocity: 70, latencyIncrease: 150 },
    mild: { velocity: 80, latencyIncrease: 130 }
  },
  neuropathic: {
    severe: { mupDuration: 20, mupAmplitude: 10 }, // ms y mV
    moderate: { mupDuration: 17, mupAmplitude: 7 },
    mild: { mupDuration: 15, mupAmplitude: 5 }
  },
  myopathic: {
    severe: { mupDuration: 5, mupAmplitude: 1 }, // ms y mV
    moderate: { mupDuration: 6, mupAmplitude: 1.5 },
    mild: { mupDuration: 8, mupAmplitude: 2 }
  }
};

/**
 * NUEVO: Servicio de validación cruzada de patrones
 * Analiza la consistencia entre patrones detectados y evita diagnósticos conflictivos
 */
export class PatternCrossValidationService {
  
  /**
   * PRINCIPAL: Validar consistencia entre patrones detectados
   */
  public static validatePatterns(detectedPatterns: any[]): {
    isConsistent: boolean;
    conflicts: any[];
    recommendations: string[];
    confidence: number;
    primaryPattern: any;
    secondaryPatterns: any[];
  } {
    const result = {
      isConsistent: true,
      conflicts: [] as any[],
      recommendations: [] as string[],
      confidence: 0,
      primaryPattern: null as any,
      secondaryPatterns: [] as any[]
    };

    // 🔥 PASO 1: Detectar conflictos entre patrones
    result.conflicts = this.detectConflicts(detectedPatterns);
    result.isConsistent = result.conflicts.length === 0;

    // 🔥 PASO 2: Determinar patrón primario
    result.primaryPattern = this.determinePrimaryPattern(detectedPatterns);

    // 🔥 PASO 3: Identificar patrones secundarios
    result.secondaryPatterns = this.identifySecondaryPatterns(detectedPatterns, result.primaryPattern);

    // 🔥 PASO 4: Calcular confianza
    result.confidence = this.calculateConfidence(detectedPatterns, result.conflicts);

    // 🔥 PASO 5: Generar recomendaciones
    result.recommendations = this.generateRecommendations(result);

    console.log('🔍 Validación cruzada completada:', {
      patternsAnalyzed: detectedPatterns.length,
      conflictsFound: result.conflicts.length,
      confidence: result.confidence,
      isConsistent: result.isConsistent
    });

    return result;
  }

  /**
   * NUEVO: Detectar conflictos entre patrones
   */
  private static detectConflicts(patterns: any[]): any[] {
    const conflicts = [];

    // Verificar conflictos específicos
    for (let i = 0; i < patterns.length; i++) {
      for (let j = i + 1; j < patterns.length; j++) {
        const conflict = this.checkPatternConflict(patterns[i], patterns[j]);
        if (conflict) {
          conflicts.push(conflict);
        }
      }
    }

    return conflicts;
  }

  /**
   * NUEVO: Verificar conflicto entre dos patrones
   */
  private static checkPatternConflict(pattern1: any, pattern2: any): any | null {
    const type1 = pattern1.type || pattern1.name;
    const type2 = pattern2.type || pattern2.name;

    // 🔥 CONFLICTOS MUTUAMENTE EXCLUYENTES
    const exclusiveConflicts = [
      ['axonal', 'demyelinating'],
      ['neuropathic', 'myopathic'],
      ['upper_motor_neuron', 'lower_motor_neuron_only'],
      ['acute', 'chronic'],
      ['sensory', 'motor_only'],
      ['focal', 'generalized']
    ];

    for (const [type_a, type_b] of exclusiveConflicts) {
      if ((type1 === type_a && type2 === type_b) || (type1 === type_b && type2 === type_a)) {
        return {
          type: 'mutually_exclusive',
          pattern1: pattern1,
          pattern2: pattern2,
          severity: 'high',
          description: `${type1} y ${type2} son mutuamente excluyentes`,
          resolution: 'Revisar criterios diagnósticos y evidencia'
        };
      }
    }

    // 🔥 CONFLICTOS DE SEVERIDAD
    if (this.hasSeverityConflict(pattern1, pattern2)) {
      return {
        type: 'severity_conflict',
        pattern1: pattern1,
        pattern2: pattern2,
        severity: 'medium',
        description: 'Conflicto en la severidad entre patrones',
        resolution: 'Revisar criterios de severidad'
      };
    }

    // 🔥 CONFLICTOS DE DISTRIBUCIÓN
    if (this.hasDistributionConflict(pattern1, pattern2)) {
      return {
        type: 'distribution_conflict',
        pattern1: pattern1,
        pattern2: pattern2,
        severity: 'medium',
        description: 'Conflicto en la distribución anatómica',
        resolution: 'Verificar mapeo anatómico'
      };
    }

    // 🔥 CONFLICTOS TEMPORALES
    if (this.hasTemporalConflict(pattern1, pattern2)) {
      return {
        type: 'temporal_conflict',
        pattern1: pattern1,
        pattern2: pattern2,
        severity: 'low',
        description: 'Conflicto en el curso temporal',
        resolution: 'Revisar cronología de síntomas'
      };
    }

    return null;
  }

  /**
   * NUEVO: Verificar conflicto de severidad
   */
  private static hasSeverityConflict(pattern1: any, pattern2: any): boolean {
    const severity1 = pattern1.severity || pattern1.confidence;
    const severity2 = pattern2.severity || pattern2.confidence;

    if (typeof severity1 === 'string' && typeof severity2 === 'string') {
      const severityOrder = ['mild', 'moderate', 'severe'];
      const index1 = severityOrder.indexOf(severity1);
      const index2 = severityOrder.indexOf(severity2);
      
      // Conflicto si hay más de 2 niveles de diferencia
      return Math.abs(index1 - index2) > 2;
    }

    if (typeof severity1 === 'number' && typeof severity2 === 'number') {
      // Conflicto si hay más del 50% de diferencia
      return Math.abs(severity1 - severity2) / Math.max(severity1, severity2) > 0.5;
    }

    return false;
  }

  /**
   * NUEVO: Verificar conflicto de distribución
   */
  private static hasDistributionConflict(pattern1: any, pattern2: any): boolean {
    const dist1 = pattern1.distribution || pattern1.location;
    const dist2 = pattern2.distribution || pattern2.location;

    if (typeof dist1 === 'string' && typeof dist2 === 'string') {
      const conflictingDistributions = [
        ['proximal', 'distal'],
        ['focal', 'diffuse'],
        ['unilateral', 'bilateral'],
        ['upper_limb', 'lower_limb_only']
      ];

      for (const [type_a, type_b] of conflictingDistributions) {
        if ((dist1 === type_a && dist2 === type_b) || (dist1 === type_b && dist2 === type_a)) {
          return true;
        }
      }
    }

    return false;
  }

  /**
   * NUEVO: Verificar conflicto temporal
   */
  private static hasTemporalConflict(pattern1: any, pattern2: any): boolean {
    const onset1 = pattern1.onset || pattern1.timeline;
    const onset2 = pattern2.onset || pattern2.timeline;

    if (typeof onset1 === 'string' && typeof onset2 === 'string') {
      const conflictingOnsets = [
        ['acute', 'chronic'],
        ['sudden', 'gradual'],
        ['rapid', 'slow']
      ];

      for (const [type_a, type_b] of conflictingOnsets) {
        if ((onset1 === type_a && onset2 === type_b) || (onset1 === type_b && onset2 === type_a)) {
          return true;
        }
      }
    }

    return false;
  }

  /**
   * NUEVO: Determinar patrón primario
   */
  private static determinePrimaryPattern(patterns: any[]): any {
    if (patterns.length === 0) return null;

    // Ordenar por confianza/severidad
    const sortedPatterns = patterns.sort((a, b) => {
      const scoreA = this.calculatePatternScore(a);
      const scoreB = this.calculatePatternScore(b);
      return scoreB - scoreA;
    });

    return sortedPatterns[0];
  }

  /**
   * NUEVO: Calcular puntuación de patrón
   */
  private static calculatePatternScore(pattern: any): number {
    let score = 0;

    // Confianza/certeza
    if (pattern.confidence) {
      score += typeof pattern.confidence === 'number' ? pattern.confidence : 0.5;
    }

    // Severidad
    if (pattern.severity) {
      const severityScores = { mild: 0.3, moderate: 0.6, severe: 1.0 };
      score += severityScores[pattern.severity] || 0.5;
    }

    // Número de criterios cumplidos
    if (pattern.criteria) {
      const criteriaCount = Array.isArray(pattern.criteria) ? pattern.criteria.length : Object.keys(pattern.criteria).length;
      score += criteriaCount * 0.1;
    }

    // Evidencia electrodiagnóstica
    if (pattern.electrodiagnosticEvidence) {
      score += 0.3;
    }

    // Evidencia clínica
    if (pattern.clinicalEvidence) {
      score += 0.2;
    }

    return score;
  }

  /**
   * NUEVO: Identificar patrones secundarios
   */
  private static identifySecondaryPatterns(patterns: any[], primaryPattern: any): any[] {
    if (!primaryPattern) return patterns;

    return patterns.filter(pattern => 
      pattern !== primaryPattern && 
      this.isCompatiblePattern(pattern, primaryPattern)
    );
  }

  /**
   * NUEVO: Verificar compatibilidad de patrones
   */
  private static isCompatiblePattern(pattern: any, primaryPattern: any): boolean {
    // Verificar si no hay conflictos directos
    const conflict = this.checkPatternConflict(pattern, primaryPattern);
    if (conflict && conflict.severity === 'high') {
      return false;
    }

    // Verificar compatibilidad específica
    const type = pattern.type || pattern.name;
    const primaryType = primaryPattern.type || primaryPattern.name;

    // Patrones que pueden coexistir
    const compatibleCombinations = [
      ['neuropathic', 'axonal'],
      ['neuropathic', 'demyelinating'],
      ['motor_neuron_disease', 'upper_motor_neuron'],
      ['motor_neuron_disease', 'lower_motor_neuron'],
      ['chronic', 'progressive'],
      ['sensorimotor', 'sensory'],
      ['sensorimotor', 'motor']
    ];

    for (const [type_a, type_b] of compatibleCombinations) {
      if ((type === type_a && primaryType === type_b) || (type === type_b && primaryType === type_a)) {
        return true;
      }
    }

    return false;
  }

  /**
   * NUEVO: Calcular confianza global
   */
  private static calculateConfidence(patterns: any[], conflicts: any[]): number {
    if (patterns.length === 0) return 0;

    // Confianza base promedio
    const baseConfidence = patterns.reduce((sum, pattern) => {
      const confidence = pattern.confidence || 0.5;
      return sum + (typeof confidence === 'number' ? confidence : 0.5);
    }, 0) / patterns.length;

    // Penalización por conflictos
    const conflictPenalty = conflicts.reduce((penalty, conflict) => {
      const severityPenalties = { high: 0.3, medium: 0.2, low: 0.1 };
      return penalty + (severityPenalties[conflict.severity] || 0.1);
    }, 0);

    // Bonificación por consistencia
    const consistencyBonus = conflicts.length === 0 ? 0.1 : 0;

    return Math.max(0, Math.min(1, baseConfidence - conflictPenalty + consistencyBonus));
  }

  /**
   * NUEVO: Generar recomendaciones
   */
  private static generateRecommendations(result: any): string[] {
    const recommendations = [];

    // Recomendaciones por conflictos
    if (result.conflicts.length > 0) {
      recommendations.push('Se detectaron conflictos entre patrones - revisar criterios diagnósticos');
      
      for (const conflict of result.conflicts) {
        recommendations.push(conflict.resolution);
      }
    }

    // Recomendaciones por baja confianza
    if (result.confidence < 0.6) {
      recommendations.push('Baja confianza en el diagnóstico - considerar estudios adicionales');
    }

    // Recomendaciones por patrón primario
    if (result.primaryPattern) {
      const type = result.primaryPattern.type || result.primaryPattern.name;
      
      switch (type) {
        case 'neuropathic':
          recommendations.push('Confirmar con estudios de conducción nerviosa adicionales');
          break;
        case 'myopathic':
          recommendations.push('Considerar biopsia muscular si está indicada');
          break;
        case 'motor_neuron_disease':
          recommendations.push('Referir a especialista en enfermedades de motoneurona');
          break;
        case 'demyelinating':
          recommendations.push('Evaluar para neuropatías desmielinizantes específicas');
          break;
        case 'axonal':
          recommendations.push('Investigar causas de neuropatía axonal');
          break;
      }
    }

    // Recomendaciones por patrones secundarios
    if (result.secondaryPatterns.length > 0) {
      recommendations.push('Considerar patrones secundarios en el diagnóstico diferencial');
    }

    // Recomendaciones generales
    if (result.isConsistent) {
      recommendations.push('Los patrones son consistentes - proceder con el diagnóstico');
    } else {
      recommendations.push('Inconsistencias detectadas - revisar datos y criterios');
    }

    return recommendations;
  }

  /**
   * NUEVO: Validar patrón específico
   */
  public static validateSpecificPattern(pattern: any, allPatterns: any[]): {
    isValid: boolean;
    issues: string[];
    suggestions: string[];
  } {
    const result = {
      isValid: true,
      issues: [] as string[],
      suggestions: [] as string[]
    };

    // Validar completitud del patrón
    if (!pattern.type && !pattern.name) {
      result.isValid = false;
      result.issues.push('Patrón sin tipo definido');
      result.suggestions.push('Definir tipo de patrón');
    }

    // Validar confianza
    if (!pattern.confidence) {
      result.issues.push('Patrón sin nivel de confianza');
      result.suggestions.push('Asignar nivel de confianza');
    }

    // Validar criterios
    if (!pattern.criteria || (Array.isArray(pattern.criteria) && pattern.criteria.length === 0)) {
      result.issues.push('Patrón sin criterios definidos');
      result.suggestions.push('Definir criterios diagnósticos');
    }

    // Validar consistencia con otros patrones
    for (const otherPattern of allPatterns) {
      if (otherPattern !== pattern) {
        const conflict = this.checkPatternConflict(pattern, otherPattern);
        if (conflict && conflict.severity === 'high') {
          result.isValid = false;
          result.issues.push(`Conflicto con patrón ${otherPattern.type || otherPattern.name}`);
          result.suggestions.push(conflict.resolution);
        }
      }
    }

    return result;
  }

  /**
   * NUEVO: Generar resumen de validación
   */
  public static generateValidationSummary(validationResult: any): string {
    let summary = `Validación de Patrones:\n`;
    summary += `- Consistencia: ${validationResult.isConsistent ? 'Sí' : 'No'}\n`;
    summary += `- Confianza: ${(validationResult.confidence * 100).toFixed(1)}%\n`;
    summary += `- Conflictos: ${validationResult.conflicts.length}\n`;
    
    if (validationResult.primaryPattern) {
      summary += `- Patrón Primario: ${validationResult.primaryPattern.type || validationResult.primaryPattern.name}\n`;
    }
    
    if (validationResult.secondaryPatterns.length > 0) {
      summary += `- Patrones Secundarios: ${validationResult.secondaryPatterns.length}\n`;
    }
    
    if (validationResult.recommendations.length > 0) {
      summary += `\nRecomendaciones:\n`;
      for (const rec of validationResult.recommendations) {
        summary += `- ${rec}\n`;
      }
    }

    return summary;
  }

  /**
   * Realiza validación cruzada completa de patrones diagnósticos
   */
  static validatePatternConsistency(
    ncsData: any,
    emgData: any,
    patientAge?: number
  ): CrossValidationResult {
    // 1. Analizar cada patrón individualmente
    const detectedPatterns = this.analyzeIndividualPatterns(ncsData, emgData, patientAge);
    
    // 2. Detectar conflictos entre patrones
    const conflicts = this.detectPatternConflicts(detectedPatterns);
    
    // 3. Generar diagnóstico final integrado
    const finalDiagnosis = this.generateIntegratedDiagnosis(detectedPatterns, conflicts);
    
    // 4. Generar recomendaciones específicas
    const recommendations = this.generateCrossValidationRecommendations(conflicts, finalDiagnosis);
    
    // 5. Generar advertencias de validación
    const warnings = this.generateValidationWarnings(conflicts, detectedPatterns);
    
    const isConsistent = conflicts.filter(c => c.conflictType === 'incompatible').length === 0;
    
    return {
      isConsistent,
      detectedPatterns,
      conflicts,
      finalDiagnosis,
      recommendations,
      warnings
    };
  }

  /**
   * Analiza patrones individuales con scoring específico
   */
  private static analyzeIndividualPatterns(
    ncsData: any,
    emgData: any,
    patientAge?: number
  ): PatternAnalysisResult[] {
    const patterns: PatternAnalysisResult[] = [];
    
    // Analizar patrón axonal
    const axonalPattern = this.analyzeAxonalPattern(ncsData, emgData);
    if (axonalPattern.score > 0.3) patterns.push(axonalPattern);
    
    // Analizar patrón desmielinizante
    const demyelinatingPattern = this.analyzeDemyelinatingPattern(ncsData);
    if (demyelinatingPattern.score > 0.3) patterns.push(demyelinatingPattern);
    
    // Analizar patrón neuropático
    const neuropathicPattern = this.analyzeNeuropathicPattern(emgData, patientAge);
    if (neuropathicPattern.score > 0.3) patterns.push(neuropathicPattern);
    
    // Analizar patrón miopático
    const myopathicPattern = this.analyzeMyopathicPattern(emgData, patientAge);
    if (myopathicPattern.score > 0.3) patterns.push(myopathicPattern);
    
    // 🔥 NUEVO - PRIORIDAD 4: Analizar enfermedad de motoneurona
    const motorNeuronPattern = this.analyzeMotorNeuronDiseasePattern(emgData, ncsData, patientAge);
    if (motorNeuronPattern.score > 0.3) patterns.push(motorNeuronPattern);
    
    return patterns.sort((a, b) => b.score - a.score);
  }

  /**
   * Detecta conflictos específicos entre patrones
   */
  private static detectPatternConflicts(patterns: PatternAnalysisResult[]): PatternConflict[] {
    const conflicts: PatternConflict[] = [];
    
    // Verificar incompatibilidades conocidas
    for (let i = 0; i < patterns.length; i++) {
      for (let j = i + 1; j < patterns.length; j++) {
        const pattern1 = patterns[i];
        const pattern2 = patterns[j];
        
        const conflict = this.checkPatternIncompatibility(pattern1, pattern2);
        if (conflict) {
          conflicts.push(conflict);
        }
      }
    }
    
    // Verificar conflictos específicos adicionales
    conflicts.push(...this.detectSpecificConflicts(patterns));
    
    return conflicts;
  }

  /**
   * Verifica incompatibilidad específica entre dos patrones
   */
  private static checkPatternIncompatibility(
    pattern1: PatternAnalysisResult,
    pattern2: PatternAnalysisResult
  ): PatternConflict | null {
    
    // 🔥 CONFLICTO CRÍTICO: Axonal vs Desmielinizante con alta confianza
    if ((pattern1.patternType === 'axonal' && pattern2.patternType === 'demyelinating') ||
        (pattern1.patternType === 'demyelinating' && pattern2.patternType === 'axonal')) {
      
      if (pattern1.confidence > 0.8 && pattern2.confidence > 0.8) {
        return {
          pattern1: pattern1.patternType,
          pattern2: pattern2.patternType,
          conflictType: 'suspicious',
          severity: 'warning',
          description: 'Coexistencia de patrones axonal y desmielinizante con alta confianza',
          possibleExplanations: [
            'Neuropatía mixta (axonal + desmielinizante)',
            'Diferentes estadios de la misma enfermedad',
            'Múltiples procesos patológicos',
            'Error metodológico en uno de los estudios'
          ],
          recommendedActions: [
            'Revisar técnica de ambos estudios',
            'Considerar neuropatía mixta en diagnóstico',
            'Correlacionar con evolución temporal',
            'Evaluar estudios seriados'
          ]
        };
      }
    }
    
    // 🔥 CONFLICTO SOSPECHOSO: Neuropático severo vs Miopático severo
    if ((pattern1.patternType === 'neuropathic' && pattern2.patternType === 'myopathic') ||
        (pattern1.patternType === 'myopathic' && pattern2.patternType === 'neuropathic')) {
      
      if (pattern1.score > 0.8 && pattern2.score > 0.8) {
        return {
          pattern1: pattern1.patternType,
          pattern2: pattern2.patternType,
          conflictType: 'requires_clarification',
          severity: 'info',
          description: 'Coexistencia de patrones neuropático y miopático severos',
          possibleExplanations: [
            'Enfermedad neuromuscular compleja',
            'Múltiples diagnósticos',
            'Proceso inflamatorio sistémico',
            'Enfermedad de motoneurona con miopatía secundaria'
          ],
          recommendedActions: [
            'Evaluación neurológica completa',
            'Considerar biopsia muscular',
            'Estudios de laboratorio especializados',
            'Evaluación multidisciplinaria'
          ]
        };
      }
    }
    
    // 🔥 NUEVO - PRIORIDAD 4: Conflicto ELA vs otros patrones
    if (pattern1.patternType === 'motor_neuron_disease' || pattern2.patternType === 'motor_neuron_disease') {
      const mndPattern = pattern1.patternType === 'motor_neuron_disease' ? pattern1 : pattern2;
      const otherPattern = pattern1.patternType === 'motor_neuron_disease' ? pattern2 : pattern1;
      
      // ELA vs Miopático es incompatible
      if (otherPattern.patternType === 'myopathic' && mndPattern.confidence > 0.7) {
        return {
          pattern1: 'motor_neuron_disease',
          pattern2: 'myopathic',
          conflictType: 'incompatible',
          severity: 'error',
          description: 'Enfermedad de motoneurona y patrón miopático son incompatibles',
          possibleExplanations: [
            'Error en la interpretación de los PUMs',
            'Artefactos técnicos',
            'Estadio muy temprano vs tardío de la enfermedad',
            'Enfermedad neuromuscular atípica'
          ],
          recommendedActions: [
            'Revisar cuidadosamente la técnica EMG',
            'Repetir estudio con protocolo específico para ELA',
            'Consulta con neurofisiólogo clínico especialista',
            'Consideración de biopsia muscular'
          ]
        };
      }
      
      // ELA vs Desmielinizante requiere aclaración
      if (otherPattern.patternType === 'demyelinating' && mndPattern.confidence > 0.6) {
        return {
          pattern1: 'motor_neuron_disease',
          pattern2: 'demyelinating',
          conflictType: 'requires_clarification',
          severity: 'warning',
          description: 'Patrón de ELA con hallazgos desmielinizantes requiere aclaración',
          possibleExplanations: [
            'Neuropatía multifocal motora (NMM) mimética de ELA',
            'PDIC variante motora',
            'ELA con neuropatía periférica concomitante',
            'Enfermedad de Kennedy con neuropatía'
          ],
          recommendedActions: [
            'Buscar bloqueos de conducción específicamente',
            'Anticuerpos anti-GM1 y anti-MAG',
            'Estudios de conducción nerviosa exhaustivos',
            'Considerar tratamiento inmunosupresor de prueba'
          ]
        };
      }
    }
    
    return null;
  }

  /**
   * Detecta conflictos específicos basados en combinaciones problemáticas
   */
  private static detectSpecificConflicts(patterns: PatternAnalysisResult[]): PatternConflict[] {
    const conflicts: PatternConflict[] = [];
    
    // 🔥 CONFLICTO: Múltiples patrones con alta confianza
    const highConfidencePatterns = patterns.filter(p => p.confidence > 0.8);
    if (highConfidencePatterns.length > 2) {
      conflicts.push({
        pattern1: 'multiple_patterns',
        pattern2: 'high_confidence',
        conflictType: 'requires_clarification',
        severity: 'warning',
        description: `Se detectaron ${highConfidencePatterns.length} patrones con alta confianza simultáneamente`,
        possibleExplanations: [
          'Enfermedad compleja multisistémica',
          'Múltiples procesos patológicos independientes',
          'Diferentes estadios evolutivos de la misma enfermedad',
          'Necesidad de refinamiento diagnóstico'
        ],
        recommendedActions: [
          'Revisión exhaustiva de la técnica empleada',
          'Correlación clínico-electrofisiológica detallada',
          'Considerar estudios adicionales',
          'Consulta con especialista en neurofisiología'
        ]
      });
    }
    
    return conflicts;
  }

  /**
   * Genera diagnóstico final integrado considerando conflictos
   */
  private static generateIntegratedDiagnosis(
    patterns: PatternAnalysisResult[],
    conflicts: PatternConflict[]
  ): FinalDiagnosisResult {
    
    if (patterns.length === 0) {
      return {
        primaryPattern: 'normal',
        secondaryPatterns: [],
        diagnosisType: 'single',
        confidence: 0.9,
        clinicalCorrelation: 'Estudio neurofisiológico dentro de límites normales'
      };
    }
    
    if (patterns.length === 1) {
      return {
        primaryPattern: patterns[0].patternType,
        secondaryPatterns: [],
        diagnosisType: 'single',
        confidence: patterns[0].confidence,
        clinicalCorrelation: `Patrón ${patterns[0].patternType} aislado`
      };
    }
    
    // Múltiples patrones - determinar si es mixto o conflictivo
    const hasIncompatibleConflicts = conflicts.some(c => c.conflictType === 'incompatible');
    const hasSuspiciousConflicts = conflicts.some(c => c.conflictType === 'suspicious');
    
    if (hasIncompatibleConflicts) {
      return {
        primaryPattern: patterns[0].patternType,
        secondaryPatterns: patterns.slice(1).map(p => p.patternType),
        diagnosisType: 'conflicting',
        confidence: 0.3,
        clinicalCorrelation: 'Patrones conflictivos detectados - requiere revisión'
      };
    }
    
    if (hasSuspiciousConflicts) {
      return {
        primaryPattern: patterns[0].patternType,
        secondaryPatterns: patterns.slice(1).map(p => p.patternType),
        diagnosisType: 'mixed',
        confidence: Math.min(0.7, patterns[0].confidence),
        clinicalCorrelation: 'Patrón mixto - múltiples mecanismos fisiopatológicos'
      };
    }
    
    return {
      primaryPattern: patterns[0].patternType,
      secondaryPatterns: patterns.slice(1).map(p => p.patternType),
      diagnosisType: 'mixed',
      confidence: patterns[0].confidence * 0.9,
      clinicalCorrelation: 'Múltiples patrones compatibles detectados'
    };
  }

  /**
   * Genera recomendaciones específicas basadas en conflictos
   */
  private static generateCrossValidationRecommendations(
    conflicts: PatternConflict[],
    finalDiagnosis: FinalDiagnosisResult
  ): string[] {
    const recommendations: string[] = [];
    
    if (finalDiagnosis.diagnosisType === 'conflicting') {
      recommendations.push('🚨 REVISIÓN URGENTE: Se detectaron patrones incompatibles');
      recommendations.push('Verificar metodología y técnica empleada en ambos estudios');
      recommendations.push('Considerar repetir estudios con protocolo estandarizado');
    }
    
    if (finalDiagnosis.diagnosisType === 'mixed') {
      recommendations.push('📊 PATRÓN MIXTO: Considerar múltiples mecanismos fisiopatológicos');
      recommendations.push('Correlacionar con evolución clínica y temporal');
      recommendations.push('Evaluar necesidad de estudios complementarios');
    }
    
    if (conflicts.length > 0) {
      recommendations.push(`⚠️ Se detectaron ${conflicts.length} conflictos que requieren atención`);
      
      // Agregar acciones específicas de cada conflicto
      conflicts.forEach(conflict => {
        recommendations.push(...conflict.recommendedActions.map(action => `  • ${action}`));
      });
    }
    
    if (finalDiagnosis.confidence < 0.5) {
      recommendations.push('🔍 BAJA CONFIANZA: Considerar estudios adicionales o segunda opinión');
    }
    
    return recommendations;
  }

  /**
   * Genera advertencias de validación específicas
   */
  private static generateValidationWarnings(
    conflicts: PatternConflict[],
    patterns: PatternAnalysisResult[]
  ): ValidationResult[] {
    const warnings: ValidationResult[] = [];
    
    conflicts.forEach(conflict => {
      warnings.push({
        isValid: false,
        severity: conflict.severity,
        message: conflict.description,
        expectedRange: 'consistencia entre patrones',
        actualValue: 0,
        field: 'pattern_consistency',
        suggestions: conflict.possibleExplanations
      });
    });
    
    // Advertencias adicionales
    if (patterns.length > 3) {
      warnings.push({
        isValid: false,
        severity: 'warning',
        message: `Se detectaron ${patterns.length} patrones simultáneamente - inusualmente complejo`,
        expectedRange: '1-2 patrones principales',
        actualValue: patterns.length,
        field: 'pattern_complexity',
        suggestions: ['Revisar criterios diagnósticos', 'Considerar simplificación', 'Consulta especializada']
      });
    }
    
    return warnings;
  }

  // 🔥 ANÁLISIS DE PATRONES ESPECÍFICOS

  private static analyzeAxonalPattern(ncsData: any, emgData: any): PatternAnalysisResult {
    let score = 0;
    const evidence: string[] = [];
    
    // Criterios NCS para patrón axonal
    if (ncsData?.motor?.amplitude && ncsData.motor.amplitude < 5) {
      score += 0.4;
      evidence.push(`Amplitud CMAP reducida: ${ncsData.motor.amplitude}mV`);
    }
    
    if (ncsData?.sensory?.amplitude && ncsData.sensory.amplitude < 10) {
      score += 0.3;
      evidence.push(`Amplitud SNAP reducida: ${ncsData.sensory.amplitude}μV`);
    }
    
    // Velocidades relativamente preservadas
    if (ncsData?.motor?.velocity && ncsData.motor.velocity > 40) {
      score += 0.2;
      evidence.push('Velocidad de conducción relativamente preservada');
    }
    
    // Criterios EMG para patrón axonal
    if (emgData?.spontaneousActivity) {
      if (emgData.spontaneousActivity.fibrillations || emgData.spontaneousActivity.positiveWaves) {
        score += 0.3;
        evidence.push('Actividad espontánea anormal (denervación activa)');
      }
    }
    
    return {
      patternType: 'axonal',
      score: Math.min(1.0, score),
      confidence: score > 0.7 ? 0.9 : score > 0.5 ? 0.7 : 0.5,
      supportingEvidence: evidence
    };
  }

  private static analyzeDemyelinatingPattern(ncsData: any): PatternAnalysisResult {
    let score = 0;
    const evidence: string[] = [];
    
    // Velocidades marcadamente reducidas
    if (ncsData?.motor?.velocity && ncsData.motor.velocity < 35) {
      score += 0.5;
      evidence.push(`Velocidad motora severamente reducida: ${ncsData.motor.velocity}m/s`);
    }
    
    // Latencias prolongadas
    if (ncsData?.motor?.latency && ncsData.motor.latency > 6) {
      score += 0.3;
      evidence.push(`Latencia distal prolongada: ${ncsData.motor.latency}ms`);
    }
    
    // Amplitudes relativamente preservadas
    if (ncsData?.motor?.amplitude && ncsData.motor.amplitude > 3) {
      score += 0.2;
      evidence.push('Amplitudes relativamente preservadas');
    }
    
    return {
      patternType: 'demyelinating',
      score: Math.min(1.0, score),
      confidence: score > 0.7 ? 0.9 : score > 0.5 ? 0.7 : 0.5,
      supportingEvidence: evidence
    };
  }

  private static analyzeNeuropathicPattern(emgData: any, patientAge?: number): PatternAnalysisResult {
    let score = 0;
    const evidence: string[] = [];
    
    // Potenciales de unidad motora agrandados
    if (emgData?.motorUnitPotentials?.duration && emgData.motorUnitPotentials.duration > 15) {
      score += 0.4;
      evidence.push(`PUM de duración aumentada: ${emgData.motorUnitPotentials.duration}ms`);
    }
    
    if (emgData?.motorUnitPotentials?.amplitude && emgData.motorUnitPotentials.amplitude > 5000) {
      score += 0.3;
      evidence.push(`PUM de amplitud aumentada: ${emgData.motorUnitPotentials.amplitude}μV`);
    }
    
    // Patrón de reclutamiento reducido
    if (emgData?.recruitmentPattern === 'reduced') {
      score += 0.3;
      evidence.push('Patrón de reclutamiento reducido');
    }
    
    return {
      patternType: 'neuropathic',
      score: Math.min(1.0, score),
      confidence: score > 0.7 ? 0.9 : score > 0.5 ? 0.7 : 0.5,
      supportingEvidence: evidence
    };
  }

  private static analyzeMyopathicPattern(emgData: any, patientAge?: number): PatternAnalysisResult {
    let score = 0;
    const evidence: string[] = [];
    
    // Potenciales de unidad motora pequeños
    if (emgData?.motorUnitPotentials?.duration && emgData.motorUnitPotentials.duration < 8) {
      score += 0.4;
      evidence.push(`PUM de duración disminuida: ${emgData.motorUnitPotentials.duration}ms`);
    }
    
    if (emgData?.motorUnitPotentials?.amplitude && emgData.motorUnitPotentials.amplitude < 2000) {
      score += 0.3;
      evidence.push(`PUM de amplitud disminuida: ${emgData.motorUnitPotentials.amplitude}μV`);
    }
    
    // Reclutamiento temprano
    if (emgData?.recruitmentPattern === 'early') {
      score += 0.3;
      evidence.push('Reclutamiento temprano');
    }
    
    return {
      patternType: 'myopathic',
      score: Math.min(1.0, score),
      confidence: score > 0.7 ? 0.9 : score > 0.5 ? 0.7 : 0.5,
      supportingEvidence: evidence
    };
  }

  // 🔥 NUEVO - PRIORIDAD 4: Análisis de enfermedad de motoneurona
  private static analyzeMotorNeuronDiseasePattern(emgData: any, ncsData: any, patientAge?: number): PatternAnalysisResult {
    let score = 0;
    const evidence: string[] = [];
    
    // 1. Potenciales de unidad motora muy agrandados (característico de ELA)
    if (emgData?.motorUnitPotentials?.duration && emgData.motorUnitPotentials.duration > 20) {
      score += 0.4;
      evidence.push(`PUM muy aumentados en duración: ${emgData.motorUnitPotentials.duration}ms (sugestivo ELA)`);
      
      if (emgData.motorUnitPotentials.duration > 25) {
        score += 0.2; // Bonus por valores muy altos
        evidence.push('Duración extremadamente aumentada (>25ms) - altamente sugestivo');
      }
    }
    
    // 2. Amplitudes muy altas + denervación activa (clave para ELA)
    if (emgData?.motorUnitPotentials?.amplitude && emgData.motorUnitPotentials.amplitude > 10000) {
      score += 0.3;
      evidence.push(`Amplitud PUM muy aumentada: ${emgData.motorUnitPotentials.amplitude}μV`);
    }
    
    // 3. Coexistencia de denervación activa Y crónica
    const hasActiveDenervation = emgData?.spontaneousActivity?.fibrillations || emgData?.spontaneousActivity?.positiveWaves;
    const hasChronicDenervation = emgData?.recruitmentPattern === 'reduced' || emgData?.recruitmentPattern === 'discrete';
    
    if (hasActiveDenervation && hasChronicDenervation) {
      score += 0.5; // Muy importante para ELA
      evidence.push('⚠️ Coexistencia de denervación activa y crónica (característico ELA)');
    }
    
    // 4. Fasciculaciones (específico de enfermedad motoneurona)
    if (emgData?.spontaneousActivity?.fasciculations) {
      score += 0.3;
      evidence.push('Fasciculaciones presentes (sugestivo de enfermedad motoneurona)');
    }
    
    // 5. Función sensorial preservada (motor-predominante)
    if (ncsData?.sensory?.amplitude && ncsData.sensory.amplitude > 15) {
      score += 0.2;
      evidence.push('Función sensorial preservada (patrón motor-predominante)');
    }
    
    // 6. Reclutamiento severamente reducido
    if (emgData?.recruitmentPattern === 'discrete') {
      score += 0.3;
      evidence.push('Reclutamiento discreto (severo) - sugestivo motoneurona superior');
    }
    
    // 7. Bonus por edad típica de ELA (50-70 años)
    if (patientAge && patientAge >= 50 && patientAge <= 70) {
      score += 0.1;
      evidence.push(`Edad compatible con ELA típica: ${patientAge} años`);
    }
    
    return {
      patternType: 'motor_neuron_disease',
      score: Math.min(1.0, score),
      confidence: score > 0.8 ? 0.95 : score > 0.6 ? 0.8 : score > 0.4 ? 0.6 : 0.4,
      supportingEvidence: evidence
    };
  }

  /**
   * 🔥 EJEMPLO DE USO COMPLETO
   */
  static demonstratePatternValidation(): void {
    console.log('🔍 DEMOSTRACIÓN DE VALIDACIÓN CRUZADA DE PATRONES');
    console.log('================================================');
    
    // Ejemplo 1: Caso con conflicto axonal vs desmielinizante
    const conflictCase = {
      ncs: {
        motor: { amplitude: 2.0, velocity: 30.0, latency: 8.0 },
        sensory: { amplitude: 5.0, velocity: 25.0 }
      },
      emg: {
        spontaneousActivity: { fibrillations: true, positiveWaves: true },
        motorUnitPotentials: { duration: 12, amplitude: 3000 },
        recruitmentPattern: 'reduced'
      }
    };
    
    const conflictResult = this.validatePatternConsistency(conflictCase.ncs, conflictCase.emg, 55);
    
    console.log('\n📋 CASO 1: Posible conflicto axonal vs desmielinizante');
    console.log(`Patrones detectados: ${conflictResult.detectedPatterns.length}`);
    console.log(`Conflictos encontrados: ${conflictResult.conflicts.length}`);
    console.log(`Diagnóstico final: ${conflictResult.finalDiagnosis.diagnosisType}`);
    
    // Ejemplo 2: Caso normal sin conflictos
    const normalCase = {
      ncs: {
        motor: { amplitude: 8.0, velocity: 55.0, latency: 3.5 },
        sensory: { amplitude: 25.0, velocity: 50.0 }
      },
      emg: {
        spontaneousActivity: { fibrillations: false, positiveWaves: false },
        motorUnitPotentials: { duration: 11, amplitude: 2500 },
        recruitmentPattern: 'normal'
      }
    };
    
    const normalResult = this.validatePatternConsistency(normalCase.ncs, normalCase.emg, 45);
    
    console.log('\n📋 CASO 2: Estudio normal');
    console.log(`Patrones detectados: ${normalResult.detectedPatterns.length}`);
    console.log(`Conflictos encontrados: ${normalResult.conflicts.length}`);
    console.log(`Diagnóstico final: ${normalResult.finalDiagnosis.diagnosisType}`);
    
    console.log('\n✅ Demostración de validación cruzada completada');
  }
} 