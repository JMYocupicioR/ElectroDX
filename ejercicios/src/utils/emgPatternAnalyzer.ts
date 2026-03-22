import { EMGResults, EMGInterpretation } from '../types/clinical';
import { diagnosticPatterns } from '../data/diagnosticPatterns';
import { UnifiedEMGResults } from '../types/emg';
import {
  CLINICAL_THRESHOLDS,
  CORRECTION_FACTORS,
  PATTERN_CRITERIA,
  DIFFERENTIAL_DIAGNOSES,
  CLINICAL_RECOMMENDATIONS,
  AGE_STRATIFIED_REFERENCES,
  CriterionDefinition,
  PatternCriteria,
  applyTemperatureCorrection,
  TemperatureCorrectionResult
} from '../data/emgClinicalCriteria';

interface PatternScore {
  id: string;
  score: number;
  matchingCriteria: string[];
}

interface Criterion {
  description: string;
  matched: boolean;
  weight: number;
  severity?: 'mild' | 'moderate' | 'severe';
  specificity?: number;
  confidence?: number;
}

export interface EMGPattern {
  name: string;
  score: number;
  confidence: 'Low' | 'Moderate' | 'High';
  subtype?: string;
  criteria: Criterion[];
  statisticalSignificance: number;
  recommendations?: string[];
  differentials?: string[];
  severity: 'normal' | 'minimal' | 'mild' | 'moderate' | 'severe' | 'very_severe';
  clinicalContext?: string;
}

interface PhysicalFactors {
  temperature?: number;
  height?: number;
  age?: number;
  gender?: 'male' | 'female';
}

interface CriterionEvaluationResult {
  matched: boolean;
  severity?: 'mild' | 'moderate' | 'severe';
  confidence?: number;
  rawValue?: number;
  adjustedValue?: number;
}

export class EMGPatternAnalyzer {

  /**
   * Método principal para analizar patrones EMG con mejoras clínicas
   */
  static analyzeForSpecificPatterns(emgData: UnifiedEMGResults, physicalFactors?: PhysicalFactors): EMGPattern[] {
    // Aplicar correcciones por factores físicos (incluyendo edad)
    const correctedData = physicalFactors ? 
      this.applyCorrectionFactors(emgData, physicalFactors.temperature || 32, physicalFactors.height || 170, physicalFactors.age || 30) : 
      emgData;

    const patterns: EMGPattern[] = [];

    // Analizar todos los patrones usando la configuración externalizada
    patterns.push(this.analyzePatternFromCriteria('neuropathic', correctedData, physicalFactors));
    patterns.push(this.analyzePatternFromCriteria('axonal', correctedData, physicalFactors));
    patterns.push(this.analyzePatternFromCriteria('demyelinating', correctedData, physicalFactors));
    patterns.push(this.analyzePatternFromCriteria('myopathic', correctedData, physicalFactors));

    // Filtrar y ordenar patrones mejorado
    return patterns
      .filter(p => p.score > 0.2) // Umbral más bajo para capturar más patrones sutiles
      .sort((a, b) => {
        // Priorizar primero por significancia estadística, luego por score
        const significanceDiff = b.statisticalSignificance - a.statisticalSignificance;
        if (Math.abs(significanceDiff) > 0.15) return significanceDiff;
        
        const scoreDiff = b.score - a.score;
        if (Math.abs(scoreDiff) > 0.1) return scoreDiff;
        
        // Como desempate, priorizar patrones con mayor número de criterios positivos
        const criteriaCountDiff = b.criteria.filter(c => c.matched).length - a.criteria.filter(c => c.matched).length;
        return criteriaCountDiff;
      });
  }

  /**
   * Aplica factores de corrección basados en temperatura, altura y edad
   */
  private static applyCorrectionFactors(mup: any, temperature: number, height: number, age: number): any {
    let correctedMup = { ...mup };
    
    // 🔥 CORRECCIÓN POR TEMPERATURA - PRINCIPIOS NEUROFISIOLÓGICOS CORRECTOS
    // Cada grado por debajo de 32°C aumenta la latencia en ~2.4ms/°C para nervios motores
    // Cada grado por debajo de 32°C aumenta la latencia en ~1.8ms/°C para nervios sensitivos
    const standardTemperature = 32; // Temperatura estándar en °C
    
    if (temperature < standardTemperature) {
      const tempDifference = standardTemperature - temperature;
      
      // Corrección para latencia distal (motor)
      if (correctedMup.distalLatency) {
        const correctionFactor = 2.4 * tempDifference / 100; // 2.4% por grado
        correctedMup.distalLatency = correctedMup.distalLatency * (1 - correctionFactor);
        correctedMup.distalLatency = Math.max(0.1, correctedMup.distalLatency); // Evitar valores negativos
      }
      
      // Corrección para latencia sensitiva
      if (correctedMup.sensoryLatency) {
        const correctionFactor = 1.8 * tempDifference / 100; // 1.8% por grado
        correctedMup.sensoryLatency = correctedMup.sensoryLatency * (1 - correctionFactor);
        correctedMup.sensoryLatency = Math.max(0.1, correctedMup.sensoryLatency);
      }
      
      // Corrección para velocidad de conducción
      // La velocidad AUMENTA con la temperatura más baja (inverso a la latencia)
      if (correctedMup.conductionVelocity) {
        const velocityCorrectionFactor = 5.0 * tempDifference / 100; // 5% por grado
        correctedMup.conductionVelocity = correctedMup.conductionVelocity * (1 + velocityCorrectionFactor);
      }
      
      // Corrección para ondas F
      if (correctedMup.fWaveLatency) {
        const fWaveCorrectionFactor = 3.2 * tempDifference / 100; // 3.2% por grado para ondas F
        correctedMup.fWaveLatency = correctedMup.fWaveLatency * (1 - fWaveCorrectionFactor);
        correctedMup.fWaveLatency = Math.max(0.1, correctedMup.fWaveLatency);
      }
      
      console.log(`🌡️ Corrección por temperatura aplicada: ${tempDifference}°C por debajo del estándar`);
    }
    
    // 🔥 CORRECCIÓN POR ALTURA - PRINCIPIOS NEUROFISIOLÓGICOS
    // Altura estándar: 170 cm
    // Corrección de 0.5 ms por cada 10 cm de diferencia en altura
    const standardHeight = 170; // cm
    
    if (Math.abs(height - standardHeight) > 5) { // Solo aplicar si la diferencia es significativa
      const heightDifference = height - standardHeight;
      const heightCorrectionMs = (heightDifference / 10) * 0.5; // 0.5ms por cada 10cm
      
      // Aplicar corrección a latencias
      if (correctedMup.distalLatency) {
        correctedMup.distalLatency = correctedMup.distalLatency - heightCorrectionMs;
        correctedMup.distalLatency = Math.max(0.1, correctedMup.distalLatency);
      }
      
      if (correctedMup.sensoryLatency) {
        correctedMup.sensoryLatency = correctedMup.sensoryLatency - heightCorrectionMs;
        correctedMup.sensoryLatency = Math.max(0.1, correctedMup.sensoryLatency);
      }
      
      if (correctedMup.fWaveLatency) {
        correctedMup.fWaveLatency = correctedMup.fWaveLatency - (heightCorrectionMs * 2); // Doble corrección para ondas F
        correctedMup.fWaveLatency = Math.max(0.1, correctedMup.fWaveLatency);
      }
      
      console.log(`📏 Corrección por altura aplicada: ${heightDifference}cm (${heightCorrectionMs}ms)`);
    }
    
    // 🔥 CORRECCIÓN POR EDAD - PRINCIPIOS NEUROFISIOLÓGICOS
    // Edad estándar: 30 años
    // Incremento de 0.2ms por cada 10 años después de los 30
    const standardAge = 30;
    
    if (age > standardAge) {
      const ageDifference = age - standardAge;
      const ageCorrectionMs = (ageDifference / 10) * 0.2; // 0.2ms por cada 10 años
      
      // Aplicar corrección a latencias (aumentan con la edad)
      if (correctedMup.distalLatency) {
        correctedMup.distalLatency = correctedMup.distalLatency - ageCorrectionMs;
        correctedMup.distalLatency = Math.max(0.1, correctedMup.distalLatency);
      }
      
      if (correctedMup.sensoryLatency) {
        correctedMup.sensoryLatency = correctedMup.sensoryLatency - ageCorrectionMs;
        correctedMup.sensoryLatency = Math.max(0.1, correctedMup.sensoryLatency);
      }
      
      // Corrección para velocidad de conducción (disminuye con la edad)
      if (correctedMup.conductionVelocity) {
        const velocityAgeCorrectionFactor = (ageDifference / 10) * 0.02; // 2% por cada 10 años
        correctedMup.conductionVelocity = correctedMup.conductionVelocity * (1 + velocityAgeCorrectionFactor);
      }
      
      console.log(`👴 Corrección por edad aplicada: ${ageDifference} años (${ageCorrectionMs}ms)`);
    }
    
    // Agregar metadatos de corrección
    correctedMup.correctionMetadata = {
      originalTemperature: temperature,
      standardTemperature,
      originalHeight: height,
      standardHeight,
      originalAge: age,
      standardAge,
      correctionApplied: true,
      correctionTimestamp: new Date().toISOString()
    };
    
    return correctedMup;
  }

  /**
   * NUEVO: Método genérico para analizar patrones usando configuración externalizada
   */
  private static analyzePatternFromCriteria(
    patternType: keyof PatternCriteria, 
    emgData: UnifiedEMGResults, 
    physicalFactors?: PhysicalFactors
  ): EMGPattern {
    const criteriaDefinitions = PATTERN_CRITERIA[patternType];
    const evaluatedCriteria: Criterion[] = [];

    // Evaluar cada criterio
    for (const criterionDef of criteriaDefinitions) {
      const evaluation = this.evaluateCriterion(criterionDef, emgData, physicalFactors);
      
      evaluatedCriteria.push({
        description: criterionDef.description,
        matched: evaluation.matched,
        weight: criterionDef.weight,
        severity: evaluation.severity,
        specificity: criterionDef.specificity,
        confidence: evaluation.confidence
      });
    }

    // Calcular score ponderado mejorado
    const weightedScore = this.calculateEnhancedWeightedScore(evaluatedCriteria);
    
    // Calcular significancia estadística mejorada
    const statisticalSignificance = this.calculateEnhancedStatisticalSignificance(evaluatedCriteria);
    
    // Determinar subtipo específico
    const subtype = this.determineSubtype(patternType, evaluatedCriteria, emgData);
    
    // Determinar severidad basada en criterios clínicos
    const severity = this.determineEnhancedSeverity(evaluatedCriteria, patternType);
    
    // Generar recomendaciones específicas y accionables
    const recommendations = this.generateEnhancedRecommendations(patternType, subtype, severity);
    
    // Generar diagnósticos diferenciales enriquecidos
    const differentials = this.generateEnhancedDifferentials(patternType, subtype);
    
    // Generar contexto clínico
    const clinicalContext = this.generateClinicalContext(patternType, evaluatedCriteria, physicalFactors);

    return {
      name: this.formatPatternName(patternType, subtype),
      score: weightedScore,
      confidence: this.determineConfidenceLevel(weightedScore, statisticalSignificance),
      subtype,
      criteria: evaluatedCriteria,
      statisticalSignificance,
      recommendations,
      differentials,
      severity,
      clinicalContext
    };
  }

  /**
   * NUEVO: Sistema de evaluación de criterios modulares
   */
  private static evaluateCriterion(
    criterionDef: CriterionDefinition, 
    emgData: UnifiedEMGResults, 
    physicalFactors?: PhysicalFactors
  ): CriterionEvaluationResult {
    
    switch (criterionDef.evaluationFunction) {
      case 'evaluateNeuropathicDuration':
        return this.evaluateNeuropathicDuration(emgData, criterionDef, physicalFactors);
      case 'evaluateNeuropathicAmplitude':
        return this.evaluateNeuropathicAmplitude(emgData, criterionDef, physicalFactors);
      case 'evaluateReducedRecruitment':
        return this.evaluateReducedRecruitment(emgData, criterionDef);
      case 'evaluateFibrillations':
        return this.evaluateFibrillations(emgData, criterionDef);
      case 'evaluatePositiveWaves':
        return this.evaluatePositiveWaves(emgData, criterionDef);
      case 'evaluateComplexMUPs':
        return this.evaluateComplexMUPs(emgData, criterionDef);
      case 'evaluateReducedCMAPAmplitude':
        return this.evaluateReducedCMAPAmplitude(emgData, criterionDef);
      case 'evaluatePreservedVelocity':
        return this.evaluatePreservedVelocity(emgData, criterionDef);
      case 'evaluateActiveDenervation':
        return this.evaluateActiveDenervation(emgData, criterionDef);
      case 'evaluateReducedSNAPAmplitude':
        return this.evaluateReducedSNAPAmplitude(emgData, criterionDef);
      case 'evaluateReducedVelocity':
        return this.evaluateReducedVelocity(emgData, criterionDef);
      case 'evaluateProlongedLatency':
        return this.evaluateProlongedLatency(emgData, criterionDef);
      case 'evaluateConductionBlock':
        return this.evaluateConductionBlock(emgData, criterionDef);
      case 'evaluateTemporalDispersion':
        return this.evaluateTemporalDispersion(emgData, criterionDef);
      case 'evaluateFWaveAbnormalities':
        return this.evaluateFWaveAbnormalities(emgData, criterionDef);
      case 'evaluateDecreasedDuration':
        return this.evaluateDecreasedDuration(emgData, criterionDef, physicalFactors);
      case 'evaluateDecreasedAmplitude':
        return this.evaluateDecreasedAmplitude(emgData, criterionDef, physicalFactors);
      case 'evaluateEarlyRecruitment':
        return this.evaluateEarlyRecruitment(emgData, criterionDef);
      case 'evaluateIncreasedPolyphasia':
        return this.evaluateIncreasedPolyphasia(emgData, criterionDef);
      case 'evaluateMyopathicRecruitment':
        return this.evaluateMyopathicRecruitment(emgData, criterionDef);
      default:
        console.warn(`Función de evaluación no encontrada: ${criterionDef.evaluationFunction}`);
        return { matched: false };
    }
  }

  // ============ FUNCIONES DE EVALUACIÓN ESPECÍFICAS ============

  private static evaluateNeuropathicDuration(
    emgData: UnifiedEMGResults, 
    criterionDef: CriterionDefinition, 
    physicalFactors?: PhysicalFactors
  ): CriterionEvaluationResult {
    const duration = emgData.motorUnitActionPotentials.duration;
    const threshold = this.getAgeAdjustedThreshold('neuropathic', 'duration', physicalFactors?.age);
    
    if (duration > threshold.severe) {
      return { matched: true, severity: 'severe', confidence: 0.9, rawValue: duration, adjustedValue: threshold.severe };
    } else if (duration > threshold.normal) {
      return { matched: true, severity: 'moderate', confidence: 0.7, rawValue: duration, adjustedValue: threshold.normal };
    }
    
    return { matched: false, rawValue: duration };
  }

  private static evaluateNeuropathicAmplitude(
    emgData: UnifiedEMGResults, 
    criterionDef: CriterionDefinition, 
    physicalFactors?: PhysicalFactors
  ): CriterionEvaluationResult {
    const amplitude = emgData.motorUnitActionPotentials.amplitude;
    const threshold = this.getAgeAdjustedThreshold('neuropathic', 'amplitude', physicalFactors?.age);
    
    if (amplitude > threshold.severe) {
      return { matched: true, severity: 'severe', confidence: 0.85, rawValue: amplitude };
    } else if (amplitude > threshold.normal) {
      return { matched: true, severity: 'moderate', confidence: 0.7, rawValue: amplitude };
    }
    
    return { matched: false, rawValue: amplitude };
  }

  private static evaluateReducedRecruitment(emgData: UnifiedEMGResults, criterionDef: CriterionDefinition): CriterionEvaluationResult {
    const recruitment = emgData.recruitment;
    const matched = recruitment === 'reduced' || recruitment === 'normal'; // Corregir tipos
    const severity = recruitment === 'reduced' ? 'severe' : 'moderate';
    
    return { 
      matched, 
      severity: matched ? severity : undefined, 
      confidence: matched ? 0.8 : 0 
    };
  }

  private static evaluateFibrillations(emgData: UnifiedEMGResults, criterionDef: CriterionDefinition): CriterionEvaluationResult {
    const hasFibrillations = emgData.spontaneousActivity.includes('Fibrillations') || 
                            emgData.spontaneousActivity.includes('fibrillations') ||
                            emgData.spontaneousActivity.includes('Fibrilaciones');
    
    return { 
      matched: hasFibrillations, 
      confidence: hasFibrillations ? 0.75 : 0 
    };
  }

  private static evaluatePositiveWaves(emgData: UnifiedEMGResults, criterionDef: CriterionDefinition): CriterionEvaluationResult {
    const hasPositiveWaves = emgData.spontaneousActivity.includes('Positive Waves') || 
                            emgData.spontaneousActivity.includes('positive waves') ||
                            emgData.spontaneousActivity.includes('Ondas Positivas');
    
    return { 
      matched: hasPositiveWaves, 
      confidence: hasPositiveWaves ? 0.75 : 0 
    };
  }

  private static evaluateComplexMUPs(emgData: UnifiedEMGResults, criterionDef: CriterionDefinition): CriterionEvaluationResult {
    const duration = emgData.motorUnitActionPotentials.duration;
    const amplitude = emgData.motorUnitActionPotentials.amplitude;
    const polyphasia = emgData.motorUnitActionPotentials.polyphasia;
    
    const isComplex = duration > 12 && amplitude > 4 && polyphasia > 25;
    const severity = (duration > 15 && amplitude > 6 && polyphasia > 35) ? 'severe' : 'moderate';
    
    return { 
      matched: isComplex, 
      severity: isComplex ? severity : undefined, 
      confidence: isComplex ? 0.9 : 0 
    };
  }

  private static evaluateReducedCMAPAmplitude(emgData: UnifiedEMGResults, criterionDef: CriterionDefinition): CriterionEvaluationResult {
    // Buscar datos de NCS en la estructura de datos
    const ncsData = (emgData as any).ncsResults || (emgData as any).conductionStudy;
    if (!ncsData?.amplitude) return { matched: false };
    
    const amplitude = ncsData.amplitude;
    const threshold = CLINICAL_THRESHOLDS.NCS.axonal.cMAPAmplitude;
    
    const matched = amplitude < threshold;
    const severity = amplitude < threshold * 0.5 ? 'severe' : 'moderate';
    
    return { 
      matched, 
      severity: matched ? severity : undefined, 
      confidence: matched ? 0.85 : 0,
      rawValue: amplitude 
    };
  }

  private static evaluatePreservedVelocity(emgData: UnifiedEMGResults, criterionDef: CriterionDefinition): CriterionEvaluationResult {
    const ncsData = (emgData as any).ncsResults || (emgData as any).conductionStudy;
    if (!ncsData?.velocity) return { matched: false };
    
    const velocity = ncsData.velocity;
    const threshold = CLINICAL_THRESHOLDS.NCS.axonal.conductionVelocity;
    
    const matched = velocity >= threshold;
    
    return { 
      matched, 
      confidence: matched ? 0.75 : 0,
      rawValue: velocity 
    };
  }

  private static evaluateActiveDenervation(emgData: UnifiedEMGResults, criterionDef: CriterionDefinition): CriterionEvaluationResult {
    const hasFibrillations = emgData.spontaneousActivity.includes('Fibrillations') || 
                            emgData.spontaneousActivity.includes('fibrillations');
    const hasPositiveWaves = emgData.spontaneousActivity.includes('Positive Waves') || 
                            emgData.spontaneousActivity.includes('positive waves');
    
    const matched = hasFibrillations && hasPositiveWaves;
    
    return { 
      matched, 
      confidence: matched ? 0.8 : 0 
    };
  }

  private static evaluateReducedSNAPAmplitude(emgData: UnifiedEMGResults, criterionDef: CriterionDefinition): CriterionEvaluationResult {
    const ncsData = (emgData as any).ncsResults || (emgData as any).conductionStudy;
    if (!ncsData?.sensorAmplitude) return { matched: false };
    
    const amplitude = ncsData.sensorAmplitude;
    const threshold = CLINICAL_THRESHOLDS.NCS.axonal.sNAPAmplitude;
    
    const matched = amplitude < threshold;
    const severity = amplitude < threshold * 0.3 ? 'severe' : 'moderate';
    
    return { 
      matched, 
      severity: matched ? severity : undefined, 
      confidence: matched ? 0.82 : 0,
      rawValue: amplitude 
    };
  }

  private static evaluateReducedVelocity(emgData: UnifiedEMGResults, criterionDef: CriterionDefinition): CriterionEvaluationResult {
    const ncsData = (emgData as any).ncsResults || (emgData as any).conductionStudy;
    if (!ncsData?.velocity) return { matched: false };
    
    const velocity = ncsData.velocity;
    const threshold = CLINICAL_THRESHOLDS.NCS.demyelinating.velocityReduction;
    
    const matched = velocity < threshold;
    const severity = velocity < threshold * 0.8 ? 'severe' : 'moderate';
    
    return { 
      matched, 
      severity: matched ? severity : undefined, 
      confidence: matched ? 0.9 : 0,
      rawValue: velocity 
    };
  }

  private static evaluateProlongedLatency(emgData: UnifiedEMGResults, criterionDef: CriterionDefinition): CriterionEvaluationResult {
    const ncsData = (emgData as any).ncsResults || (emgData as any).conductionStudy;
    if (!ncsData?.latency) return { matched: false };
    
    const latency = ncsData.latency;
    const threshold = CLINICAL_THRESHOLDS.NCS.demyelinating.latencyProlongation;
    
    const matched = latency > threshold;
    const severity = latency > threshold * 1.5 ? 'severe' : 'moderate';
    
    return { 
      matched, 
      severity: matched ? severity : undefined, 
      confidence: matched ? 0.85 : 0,
      rawValue: latency 
    };
  }

  private static evaluateConductionBlock(emgData: UnifiedEMGResults, criterionDef: CriterionDefinition): CriterionEvaluationResult {
    const ncsData = (emgData as any).ncsResults || (emgData as any).conductionStudy;
    if (!ncsData?.conductionBlock) return { matched: false };
    
    const blockPercentage = ncsData.conductionBlock;
    const threshold = CLINICAL_THRESHOLDS.NCS.demyelinating.conductionBlock;
    
    const matched = blockPercentage >= threshold;
    const severity = blockPercentage >= threshold * 1.5 ? 'severe' : 'moderate';
    
    return { 
      matched, 
      severity: matched ? severity : undefined, 
      confidence: matched ? 0.95 : 0, // Mayor confianza - muy específico
      rawValue: blockPercentage 
    };
  }

  private static evaluateTemporalDispersion(emgData: UnifiedEMGResults, criterionDef: CriterionDefinition): CriterionEvaluationResult {
    const ncsData = (emgData as any).ncsResults || (emgData as any).conductionStudy;
    if (!ncsData?.temporalDispersion) return { matched: false };
    
    const dispersion = ncsData.temporalDispersion;
    const threshold = CLINICAL_THRESHOLDS.NCS.demyelinating.temporalDispersion;
    
    const matched = dispersion >= threshold;
    
    return { 
      matched, 
      confidence: matched ? 0.88 : 0,
      rawValue: dispersion 
    };
  }

  private static evaluateFWaveAbnormalities(emgData: UnifiedEMGResults, criterionDef: CriterionDefinition): CriterionEvaluationResult {
    const ncsData = (emgData as any).ncsResults || (emgData as any).conductionStudy;
    if (!ncsData?.fWaveLatency) return { matched: false };
    
    const fWaveLatency = ncsData.fWaveLatency;
    const isAbnormal = fWaveLatency > 32 || fWaveLatency === 0; // Prolongada o ausente
    
    return { 
      matched: isAbnormal, 
      confidence: isAbnormal ? 0.75 : 0,
      rawValue: fWaveLatency 
    };
  }

  private static evaluateDecreasedDuration(
    emgData: UnifiedEMGResults, 
    criterionDef: CriterionDefinition, 
    physicalFactors?: PhysicalFactors
  ): CriterionEvaluationResult {
    const duration = emgData.motorUnitActionPotentials.duration;
    const threshold = this.getAgeAdjustedThreshold('myopathic', 'duration', physicalFactors?.age);
    
    if (duration < threshold.severe) {
      return { matched: true, severity: 'severe', confidence: 0.8, rawValue: duration };
    } else if (duration < threshold.normal) {
      return { matched: true, severity: 'moderate', confidence: 0.7, rawValue: duration };
    }
    
    return { matched: false, rawValue: duration };
  }

  private static evaluateDecreasedAmplitude(
    emgData: UnifiedEMGResults, 
    criterionDef: CriterionDefinition, 
    physicalFactors?: PhysicalFactors
  ): CriterionEvaluationResult {
    const amplitude = emgData.motorUnitActionPotentials.amplitude;
    const threshold = this.getAgeAdjustedThreshold('myopathic', 'amplitude', physicalFactors?.age);
    
    if (amplitude < threshold.severe) {
      return { matched: true, severity: 'severe', confidence: 0.75, rawValue: amplitude };
    } else if (amplitude < threshold.normal) {
      return { matched: true, severity: 'moderate', confidence: 0.6, rawValue: amplitude };
    }
    
    return { matched: false, rawValue: amplitude };
  }

  private static evaluateEarlyRecruitment(emgData: UnifiedEMGResults, criterionDef: CriterionDefinition): CriterionEvaluationResult {
    const recruitment = emgData.recruitment;
    const matched = recruitment === 'early';
    
    return { 
      matched, 
      confidence: matched ? 0.7 : 0 
    };
  }

  private static evaluateIncreasedPolyphasia(emgData: UnifiedEMGResults, criterionDef: CriterionDefinition): CriterionEvaluationResult {
    const polyphasia = emgData.motorUnitActionPotentials.polyphasia;
    const threshold = CLINICAL_THRESHOLDS.MYOPATHIC.polyphasia.normal;
    
    const matched = polyphasia > threshold;
    const severity = polyphasia > CLINICAL_THRESHOLDS.MYOPATHIC.polyphasia.severe ? 'severe' : 'moderate';
    
    return { 
      matched, 
      severity: matched ? severity : undefined, 
      confidence: matched ? 0.9 : 0,
      rawValue: polyphasia 
    };
  }

  private static evaluateMyopathicRecruitment(emgData: UnifiedEMGResults, criterionDef: CriterionDefinition): CriterionEvaluationResult {
    const recruitment = emgData.recruitment;
    const matched = recruitment === 'early' || recruitment === 'rapid';
    
    return { 
      matched, 
      confidence: matched ? 0.85 : 0 
    };
  }

  // ============ FUNCIONES DE CÁLCULO MEJORADAS ============

  /**
   * MEJORADO: Cálculo de score ponderado con consideración de confianza individual
   */
  private static calculateEnhancedWeightedScore(criteria: Criterion[]): number {
    const totalWeight = criteria.reduce((sum, c) => sum + c.weight, 0);
    if (totalWeight === 0) return 0;

    const weightedScore = criteria.reduce((sum, c) => {
      if (c.matched) {
        // Incorporar la confianza individual del criterio
        const confidenceMultiplier = c.confidence || 1.0;
        return sum + (c.weight * confidenceMultiplier);
      }
      return sum;
    }, 0) / totalWeight;

    return Math.min(1.0, weightedScore); // Límite superior de 1.0
  }

  /**
   * MEJORADO: Cálculo de significancia estadística con mejor modelo bayesiano
   */
  private static calculateEnhancedStatisticalSignificance(criteria: Criterion[]): number {
    const matchedCriteria = criteria.filter(c => c.matched);
    if (matchedCriteria.length === 0) return 0;

    // Cálculo de especificidad promedio ponderada
    const weightedSpecificity = matchedCriteria.reduce((sum, c) => {
      const specificity = c.specificity || 0.5;
      const confidence = c.confidence || 1.0;
      return sum + (specificity * c.weight * confidence);
    }, 0) / matchedCriteria.reduce((sum, c) => sum + c.weight * (c.confidence || 1.0), 0);

    // Modelo bayesiano mejorado
    const priorProbability = 0.25; // Base probability ajustada
    const likelihood = weightedSpecificity;
    
    // Bonus por número de criterios independientes confirmados
    const criteriaCountBonus = Math.min(0.2, matchedCriteria.length * 0.05);
    
    const posteriorProbability = (likelihood * priorProbability) / 
        (likelihood * priorProbability + (1 - likelihood) * (1 - priorProbability));

    return Math.min(1.0, posteriorProbability + criteriaCountBonus);
  }

  /**
   * NUEVO: Obtener umbrales ajustados por edad
   */
  private static getAgeAdjustedThreshold(
    patternType: 'neuropathic' | 'myopathic', 
    parameter: 'duration' | 'amplitude', 
    age?: number
  ): { normal: number; severe: number } {
    const baseThresholds = CLINICAL_THRESHOLDS[patternType.toUpperCase() as 'NEUROPATHIC' | 'MYOPATHIC'][parameter];
    
    if (!age || !baseThresholds.ageAdjusted) {
      return { normal: baseThresholds.normal, severe: baseThresholds.severe };
    }

    // Determinar grupo etario
    let ageGroup: 'young' | 'middle' | 'older';
    if (age < 40) ageGroup = 'young';
    else if (age < 60) ageGroup = 'middle';
    else ageGroup = 'older';

    const ageAdjusted = baseThresholds.ageAdjusted[ageGroup];
    
    return {
      normal: ageAdjusted.max,
      severe: baseThresholds.severe // Mantener el umbral severo base
    };
  }

  /**
   * MEJORADO: Determinación de subtipo con lógica clínica específica
   */
  private static determineSubtype(
    patternType: keyof PatternCriteria, 
    criteria: Criterion[], 
    emgData: UnifiedEMGResults
  ): string {
    const matchedCriteria = criteria.filter(c => c.matched);
    
    switch (patternType) {
      case 'neuropathic':
        const hasDenervation = matchedCriteria.some(c => 
          c.description.includes('fibrillations') || c.description.includes('positive'));
        const hasReinnervation = matchedCriteria.some(c => 
          c.description.includes('duration') || c.description.includes('amplitude'));
        
        if (hasDenervation && hasReinnervation) return 'Acute on chronic denervation';
        if (hasDenervation) return 'Active denervation pattern';
        if (hasReinnervation) return 'Chronic reinnervation pattern';
        return 'General neuropathic pattern';

      case 'axonal':
        const hasMotorAxonal = matchedCriteria.some(c => c.description.includes('CMAP'));
        const hasSensoryAxonal = matchedCriteria.some(c => c.description.includes('SNAP'));
        
        if (hasMotorAxonal && hasSensoryAxonal) return 'Sensorimotor axonal';
        if (hasMotorAxonal) return 'Motor axonal';
        if (hasSensoryAxonal) return 'Sensory axonal';
        return 'Axonal pattern';

      case 'demyelinating':
        const hasConductionBlock = matchedCriteria.some(c => c.description.includes('block'));
        const hasSlowing = matchedCriteria.some(c => c.description.includes('velocity'));
        
        if (hasConductionBlock) return 'With conduction block';
        if (hasSlowing) return 'Primary demyelination';
        return 'Demyelinating pattern';

      case 'myopathic':
        const severity = this.determineEnhancedSeverity(criteria, patternType);
        if (severity === 'severe' || severity === 'very_severe') return 'Severe myopathic';
        return 'Myopathic pattern';

      default:
        return '';
    }
  }

  /**
   * MEJORADO: Determinación de severidad con criterios clínicos específicos
   */
  private static determineEnhancedSeverity(
    criteria: Criterion[], 
    patternType: keyof PatternCriteria
  ): 'normal' | 'minimal' | 'mild' | 'moderate' | 'severe' | 'very_severe' {
    const matchedCriteria = criteria.filter(c => c.matched);
    const severeCriteria = criteria.filter(c => c.severity === 'severe');
    const moderateCriteria = criteria.filter(c => c.severity === 'moderate');

    // Criterios específicos por tipo de patrón
    switch (patternType) {
      case 'neuropathic':
        // Para neuropático, la presencia de bloqueo o denervación aguda es severa
        const hasActiveDenervation = matchedCriteria.some(c => 
          c.description.includes('fibrillations') && c.description.includes('positive'));
        if (hasActiveDenervation && severeCriteria.length >= 1) return 'very_severe';
        if (hasActiveDenervation || severeCriteria.length >= 2) return 'severe';
        break;

      case 'demyelinating':
        // Bloqueo de conducción es criterio de severidad crítico
        const hasConductionBlock = matchedCriteria.some(c => c.description.includes('block'));
        if (hasConductionBlock) return 'severe';
        break;

      case 'axonal':
        // Pérdida severa de amplitud indica severidad alta
        const hasMarkedAmplitudeLoss = severeCriteria.some(c => c.description.includes('amplitude'));
        if (hasMarkedAmplitudeLoss) return 'severe';
        break;

      case 'myopathic':
        // Para miopatía, múltiples criterios positivos indican severidad
        if (severeCriteria.length >= 2) return 'severe';
        break;
    }

    // Lógica general de severidad
    if (severeCriteria.length >= 2) return 'very_severe';
    if (severeCriteria.length === 1) return 'severe';
    if (moderateCriteria.length >= 2) return 'moderate';
    if (moderateCriteria.length === 1) return 'mild';
    if (matchedCriteria.length > 0) return 'minimal';
    return 'normal';
  }

  /**
   * MEJORADO: Generación de recomendaciones específicas y accionables
   */
  private static generateEnhancedRecommendations(
    patternType: keyof PatternCriteria, 
    subtype: string, 
    severity: string
  ): string[] {
    const recommendations: string[] = [];
    
    // Obtener recomendaciones base del archivo de configuración
    const baseRecommendations = CLINICAL_RECOMMENDATIONS[patternType];
    
    if (typeof baseRecommendations === 'object' && !Array.isArray(baseRecommendations)) {
      // Para patrones neuropáticos con subtipos
      if (subtype.includes('Active denervation')) {
        recommendations.push(...baseRecommendations.acute_denervation || []);
      } else if (subtype.includes('Chronic reinnervation')) {
        recommendations.push(...baseRecommendations.chronic_reinnervation || []);
      } else {
        recommendations.push(...baseRecommendations.general || []);
      }
    } else if (Array.isArray(baseRecommendations)) {
      recommendations.push(...baseRecommendations);
    }

    // Agregar recomendaciones específicas por severidad
    if (severity === 'very_severe' || severity === 'severe') {
      recommendations.unshift('URGENTE: Evaluación neurológica inmediata recomendada');
      recommendations.push('Considerar hospitalización para monitoreo si hay compromiso respiratorio');
    }

    // Recomendaciones específicas por subtipo
    if (subtype.includes('conduction block')) {
      recommendations.push('Evaluar para neuropatía multifocal motora o PDIC');
      recommendations.push('Considerar inmunoglobulina IV o plasmaféresis');
    }

    return [...new Set(recommendations)]; // Eliminar duplicados
  }

  /**
   * MEJORADO: Generación de diagnósticos diferenciales enriquecidos
   */
  private static generateEnhancedDifferentials(
    patternType: keyof PatternCriteria, 
    subtype: string
  ): string[] {
    const differentials: string[] = [];
    
    const baseDifferentials = DIFFERENTIAL_DIAGNOSES[patternType];
    
    if (typeof baseDifferentials === 'object' && !Array.isArray(baseDifferentials)) {
      // Para patrones neuropáticos
      if (subtype.includes('Active denervation')) {
        differentials.push(...baseDifferentials.acute_denervation || []);
      } else if (subtype.includes('Chronic reinnervation')) {
        differentials.push(...baseDifferentials.chronic_reinnervation || []);
      } else {
        differentials.push(...baseDifferentials.general || []);
      }
    } else if (Array.isArray(baseDifferentials)) {
      differentials.push(...baseDifferentials);
    }

    return [...new Set(differentials)]; // Eliminar duplicados
  }

  /**
   * NUEVO: Generación de contexto clínico
   */
  private static generateClinicalContext(
    patternType: keyof PatternCriteria, 
    criteria: Criterion[], 
    physicalFactors?: PhysicalFactors
  ): string {
    const matchedCount = criteria.filter(c => c.matched).length;
    const totalCount = criteria.length;
    const percentage = Math.round((matchedCount / totalCount) * 100);

    let context = `Análisis basado en ${matchedCount}/${totalCount} criterios positivos (${percentage}%).`;
    
    if (physicalFactors?.age) {
      context += ` Valores ajustados para edad de ${physicalFactors.age} años.`;
    }
    
    if (physicalFactors?.temperature && physicalFactors.temperature < 32) {
      context += ` Corrección aplicada por temperatura de ${physicalFactors.temperature}°C.`;
    }

    return context;
  }

  /**
   * MEJORADO: Formatear nombre del patrón
   */
  private static formatPatternName(patternType: keyof PatternCriteria, subtype: string): string {
    const baseNames = {
      neuropathic: 'Patrón Neuropático',
      axonal: 'Patrón Axonal',
      demyelinating: 'Patrón Desmielinizante',
      myopathic: 'Patrón Miopático'
    };

    const baseName = baseNames[patternType] || patternType;
    return subtype ? `${baseName} (${subtype})` : baseName;
  }

  /**
   * MEJORADO: Determinación de nivel de confianza
   */
  private static determineConfidenceLevel(score: number, statisticalSignificance: number): 'Low' | 'Moderate' | 'High' {
    // Algoritmo mejorado que considera tanto score como significancia
    const combinedScore = (score * 0.6) + (statisticalSignificance * 0.4);
    
    if (combinedScore > 0.75) return 'High';
    if (combinedScore > 0.45) return 'Moderate';
    return 'Low';
  }

  /**
   * Mantener método legacy para compatibilidad
   */
  static generatePatternDescription(patternId: string, matchingCriteria: string[], severity: string): string {
    const pattern = diagnosticPatterns[patternId];
    if (!pattern) return '';
    
    let description = `Los hallazgos electromiográficos son ${
      matchingCriteria.length > pattern.keyFindings.length / 2 ? 'muy compatibles' : 'sugestivos'
    } con ${pattern.name}, `;
    
    description += `una ${pattern.description}, de ${severity}.`;
    
    return description;
  }
} 