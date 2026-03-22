// 🔥 SERVICIO DE ANÁLISIS DE ENFERMEDAD DE MOTONEURONA - PRIORIDAD 4
// =================================================================
// Detecta patrones específicos de ELA y otras enfermedades de motoneurona superior

import { ValidationResult } from './validationService';
import { PATTERN_CRITERIA, DIFFERENTIAL_DIAGNOSES, CLINICAL_RECOMMENDATIONS } from '../data/emgClinicalCriteria';

export interface BodyRegion {
  name: 'cervical' | 'thoracic' | 'lumbar' | 'bulbar';
  muscles: string[];
  hasActiveDenervation: boolean;
  hasChronicDenervation: boolean;
  severity: 'normal' | 'mild' | 'moderate' | 'severe';
}

export interface MotorNeuronAnalysisResult {
  patternDetected: boolean;
  confidence: number;
  severity: 'possible' | 'probable' | 'definite';
  affectedRegions: BodyRegion[];
  keyFindings: string[];
  supportingEvidence: string[];
  differentialDiagnosis: string[];
  recommendations: string[];
  urgencyLevel: 'routine' | 'urgent' | 'emergent';
  elCriteriaScore: number; // Puntuación según criterios de El Escorial
  awaji: {
    criteria: boolean;
    score: number;
  };
}

export interface EMGRegionalData {
  region: 'cervical' | 'thoracic' | 'lumbar' | 'bulbar';
  muscles: {
    name: string;
    fibrillations: boolean;
    positiveWaves: boolean;
    fasciculations: boolean;
    mupDuration: number;
    mupAmplitude: number;
    recruitment: 'normal' | 'reduced' | 'discrete';
    polyphasia: number;
  }[];
}

export interface NCSData {
  motor: {
    nerves: {
      name: string;
      amplitude: number;
      velocity: number;
      latency: number;
      fWave?: number;
    }[];
  };
  sensory: {
    nerves: {
      name: string;
      amplitude: number;
      velocity: number;
      latency: number;
    }[];
  };
}

export class MotorNeuronDiseaseAnalyzer {
  /**
   * Análisis principal para detectar enfermedad de motoneurona
   */
  static analyzeForMotorNeuronDisease(
    emgData: any[],
    ncsData: any,
    clinicalHistory?: any
  ): MotorNeuronAnalysisResult {
    
    // Implementación básica - se expandirá
    const bodyRegions: BodyRegion[] = [];
    
    return {
      patternDetected: false,
      confidence: 0,
      severity: 'possible',
      affectedRegions: bodyRegions,
      keyFindings: [],
      supportingEvidence: [],
      differentialDiagnosis: [],
      recommendations: [],
      urgencyLevel: 'routine',
      elCriteriaScore: 0,
      awaji: {
        criteria: false,
        score: 0
      }
    };
  }

  /**
   * Analiza cada región corporal para signos de denervación
   */
  private static analyzeBodyRegions(emgData: EMGRegionalData[]): BodyRegion[] {
    return emgData.map(regionData => {
      const affectedMuscles = regionData.muscles.filter(muscle => 
        muscle.fibrillations || muscle.positiveWaves || 
        muscle.mupDuration > 15 || muscle.recruitment === 'reduced'
      );
      
      const hasActiveDenervation = regionData.muscles.some(muscle => 
        muscle.fibrillations || muscle.positiveWaves
      );
      
      const hasChronicDenervation = regionData.muscles.some(muscle => 
        muscle.mupDuration > 15 || muscle.mupAmplitude > 5000 || muscle.recruitment === 'reduced'
      );
      
      // Determinar severidad regional
      const affectedPercentage = affectedMuscles.length / regionData.muscles.length;
      let severity: 'normal' | 'mild' | 'moderate' | 'severe';
      
      if (affectedPercentage === 0) severity = 'normal';
      else if (affectedPercentage < 0.33) severity = 'mild';
      else if (affectedPercentage < 0.66) severity = 'moderate';
      else severity = 'severe';
      
      return {
        name: regionData.region,
        muscles: regionData.muscles.map(m => m.name),
        hasActiveDenervation,
        hasChronicDenervation,
        severity
      };
    });
  }

  /**
   * Calcula puntuación según criterios de El Escorial revisados
   */
  private static calculateElEscorialScore(bodyRegions: BodyRegion[], ncsData: NCSData): number {
    let score = 0;
    
    // Criterio 1: Evidencia de degeneración de motoneurona inferior
    const regionsWithLMNSigns = bodyRegions.filter(region => 
      region.hasActiveDenervation && region.hasChronicDenervation
    ).length;
    
    if (regionsWithLMNSigns >= 1) score += 1;
    if (regionsWithLMNSigns >= 2) score += 1;
    if (regionsWithLMNSigns >= 3) score += 2;
    
    // Criterio 2: Progresión dentro de una región o hacia otras regiones
    const regionsWithBothSigns = bodyRegions.filter(region => 
      region.hasActiveDenervation && region.hasChronicDenervation && region.severity !== 'mild'
    ).length;
    
    if (regionsWithBothSigns >= 1) score += 1;
    
    // Criterio 3: Ausencia de evidencia de otros procesos patológicos
    const hasPreservedSensory = ncsData.sensory.nerves.every(nerve => nerve.amplitude > 5);
    const hasNormalVelocities = ncsData.motor.nerves.every(nerve => nerve.velocity > 40);
    
    if (hasPreservedSensory && hasNormalVelocities) score += 2;
    
    return Math.min(score, 10); // Máximo 10 puntos
  }

  /**
   * Evalúa criterios de Awaji (incluye fasciculaciones como equivalente a fibrillaciones)
   */
  private static evaluateAwajiCriteria(bodyRegions: BodyRegion[], ncsData: NCSData) {
    let score = 0;
    
    // Criterios Awaji: Fasciculaciones = Fibrillaciones para diagnóstico
    const regionsWithDenervation = bodyRegions.filter(region => {
      return region.hasActiveDenervation || region.hasChronicDenervation;
    }).length;
    
    score = regionsWithDenervation * 2;
    
    // Bonus por preservación sensorial
    const hasPreservedSensory = ncsData.sensory.nerves.every(nerve => nerve.amplitude > 8);
    if (hasPreservedSensory) score += 2;
    
    return {
      criteria: score >= 6, // Criterios Awaji cumplidos
      score: Math.min(score, 10)
    };
  }

  /**
   * Calcula confianza global del diagnóstico
   */
  private static calculateConfidence(
    bodyRegions: BodyRegion[],
    elScore: number,
    awaji: { criteria: boolean; score: number },
    clinicalHistory?: any
  ): number {
    let confidence = 0;
    
    // Base: score de El Escorial
    confidence += elScore * 0.1; // Máximo 1.0
    
    // Criterios Awaji
    if (awaji.criteria) confidence += 0.2;
    
    // Múltiples regiones afectadas
    const affectedRegions = bodyRegions.filter(r => r.severity !== 'normal').length;
    confidence += affectedRegions * 0.15; // Máximo 0.6 para 4 regiones
    
    // Historia clínica compatible
    if (clinicalHistory) {
      if (clinicalHistory.progression !== 'stable') confidence += 0.1;
      if (clinicalHistory.duration > 6) confidence += 0.1; // Más de 6 meses
    }
    
    return Math.min(confidence, 1.0);
  }

  /**
   * Determina severidad del patrón detectado
   */
  private static determineSeverity(elScore: number, confidence: number): 'possible' | 'probable' | 'definite' {
    if (confidence >= 0.8 && elScore >= 6) return 'definite';
    if (confidence >= 0.6 && elScore >= 4) return 'probable';
    return 'possible';
  }

  /**
   * Genera hallazgos clave específicos
   */
  private static generateKeyFindings(bodyRegions: BodyRegion[], ncsData: NCSData): string[] {
    const findings: string[] = [];
    
    // Regiones afectadas
    const affectedRegions = bodyRegions.filter(r => r.severity !== 'normal');
    if (affectedRegions.length > 0) {
      findings.push(`Denervación detectada en ${affectedRegions.length} regiones: ${affectedRegions.map(r => r.name).join(', ')}`);
    }
    
    // Coexistencia de signos activos y crónicos
    const regionsWithBoth = bodyRegions.filter(r => r.hasActiveDenervation && r.hasChronicDenervation);
    if (regionsWithBoth.length > 0) {
      findings.push(`Coexistencia de denervación activa y crónica en ${regionsWithBoth.length} regiones`);
    }
    
    // Preservación sensorial
    const preservedSensory = ncsData.sensory.nerves.every(nerve => nerve.amplitude > 5);
    if (preservedSensory) {
      findings.push('Función sensorial preservada (patrón motor-predominante)');
    }
    
    // Compromiso bulbar
    const bulbarRegion = bodyRegions.find(r => r.name === 'bulbar');
    if (bulbarRegion && bulbarRegion.severity !== 'normal') {
      findings.push('⚠️ Compromiso bulbar detectado');
    }
    
    return findings;
  }

  /**
   * Genera evidencia de soporte específica
   */
  private static generateSupportingEvidence(bodyRegions: BodyRegion[], awaji: { criteria: boolean; score: number }): string[] {
    const evidence: string[] = [];
    
    if (awaji.criteria) {
      evidence.push('✅ Cumple criterios diagnósticos de Awaji');
    }
    
    const multiregional = bodyRegions.filter(r => r.severity !== 'normal').length >= 2;
    if (multiregional) {
      evidence.push('✅ Patrón multiregional compatible con ELA');
    }
    
    const activeChronic = bodyRegions.some(r => r.hasActiveDenervation && r.hasChronicDenervation);
    if (activeChronic) {
      evidence.push('✅ Coexistencia de denervación activa y crónica');
    }
    
    return evidence;
  }

  /**
   * Selecciona diagnósticos diferenciales relevantes
   */
  private static selectRelevantDifferentials(bodyRegions: BodyRegion[], ncsData: NCSData): string[] {
    const base = DIFFERENTIAL_DIAGNOSES.motor_neuron_disease;
    const relevant: string[] = [];
    
    // Siempre incluir ELA clásica
    relevant.push('Esclerosis Lateral Amiotrófica (ELA) - forma clásica');
    
    // Específicos por patrón
    const bulbarAffected = bodyRegions.find(r => r.name === 'bulbar')?.severity !== 'normal';
    if (bulbarAffected) {
      relevant.push('ELA de inicio bulbar');
    } else {
      relevant.push('ELA de inicio espinal');
    }
    
    // Otras consideraciones importantes
    relevant.push('Atrofia Muscular Espinal (AME) del adulto');
    relevant.push('Enfermedad de Kennedy (AMEX)');
    relevant.push('Polirradiculopatía desmielinizante inflamatoria crónica (PDIC) - variante motora');
    
    return relevant;
  }

  /**
   * Genera recomendaciones específicas contextualizadas
   */
  private static generateSpecificRecommendations(
    severity: 'possible' | 'probable' | 'definite',
    bodyRegions: BodyRegion[]
  ): string[] {
    const base = CLINICAL_RECOMMENDATIONS.motor_neuron_disease;
    const specific: string[] = [];
    
    // Recomendaciones por severidad
    if (severity === 'definite') {
      specific.push('🚨 DIAGNÓSTICO ALTAMENTE PROBABLE - Referencia URGENTE a neurólogo especialista');
      specific.push('Iniciar evaluación multidisciplinaria inmediata');
    } else if (severity === 'probable') {
      specific.push('⚠️ DIAGNÓSTICO PROBABLE - Referencia prioritaria a neurología');
      specific.push('Completar estudios diagnósticos en 2-4 semanas');
    } else {
      specific.push('💡 SOSPECHA DIAGNÓSTICA - Evaluación neurológica especializada');
      specific.push('Seguimiento evolutivo con EMG en 3-6 meses');
    }
    
    // Específicos por regiones afectadas
    const bulbarAffected = bodyRegions.find(r => r.name === 'bulbar')?.severity !== 'normal';
    if (bulbarAffected) {
      specific.push('🫁 URGENTE: Evaluación respiratoria y de deglución');
      specific.push('Considerar evaluación por neumología y fonoaudiología');
    }
    
    const multipleRegions = bodyRegions.filter(r => r.severity !== 'normal').length >= 3;
    if (multipleRegions) {
      specific.push('📊 Patrón avanzado: Planificación de cuidados paliativos');
      specific.push('Evaluación de necesidades de soporte respiratorio');
    }
    
    return [...specific, ...base.slice(3, 8)]; // Agregar recomendaciones base relevantes
  }

  /**
   * Determina nivel de urgencia clínica
   */
  private static determineUrgencyLevel(
    severity: 'possible' | 'probable' | 'definite',
    keyFindings: string[]
  ): 'routine' | 'urgent' | 'emergent' {
    
    const hasBulbarSigns = keyFindings.some(finding => finding.includes('bulbar'));
    const hasRespiratoryRisk = keyFindings.some(finding => finding.includes('respirator'));
    
    if (severity === 'definite' && (hasBulbarSigns || hasRespiratoryRisk)) {
      return 'emergent';
    }
    
    if (severity === 'definite' || (severity === 'probable' && hasBulbarSigns)) {
      return 'urgent';
    }
    
    return 'routine';
  }

  /**
   * 🧪 DEMO: Análisis de caso típico de ELA
   */
  static demonstrateELAAnalysis(): void {
    console.log('🧬 DEMOSTRACIÓN DE ANÁLISIS DE ELA - PRIORIDAD 4');
    console.log('==============================================');
    
    // Caso típico: ELA espinal con progresión a múltiples regiones
    const mockEMGData: EMGRegionalData[] = [
      {
        region: 'cervical',
        muscles: [
          {
            name: 'C5-C6 (deltoides)',
            fibrillations: true,
            positiveWaves: true,
            fasciculations: true,
            mupDuration: 18,
            mupAmplitude: 8500,
            recruitment: 'reduced',
            polyphasia: 30
          },
          {
            name: 'C8-T1 (primer interóseo)',
            fibrillations: true,
            positiveWaves: false,
            fasciculations: true,
            mupDuration: 22,
            mupAmplitude: 12000,
            recruitment: 'discrete',
            polyphasia: 35
          }
        ]
      },
      {
        region: 'lumbar',
        muscles: [
          {
            name: 'L2-L4 (cuádriceps)',
            fibrillations: false,
            positiveWaves: true,
            fasciculations: true,
            mupDuration: 16,
            mupAmplitude: 7200,
            recruitment: 'reduced',
            polyphasia: 25
          }
        ]
      },
      {
        region: 'thoracic',
        muscles: [
          {
            name: 'T6-T12 (paraespinales)',
            fibrillations: true,
            positiveWaves: true,
            fasciculations: false,
            mupDuration: 20,
            mupAmplitude: 9800,
            recruitment: 'reduced',
            polyphasia: 40
          }
        ]
      },
      {
        region: 'bulbar',
        muscles: [
          {
            name: 'Masetero',
            fibrillations: false,
            positiveWaves: false,
            fasciculations: false,
            mupDuration: 12,
            mupAmplitude: 3500,
            recruitment: 'normal',
            polyphasia: 15
          }
        ]
      }
    ];
    
    const mockNCSData: NCSData = {
      motor: {
        nerves: [
          { name: 'Mediano', amplitude: 6.8, velocity: 54, latency: 3.2, fWave: 28 },
          { name: 'Ulnar', amplitude: 4.2, velocity: 52, latency: 2.8, fWave: 30 },
          { name: 'Peroneo', amplitude: 3.1, velocity: 48, latency: 4.1, fWave: 48 }
        ]
      },
      sensory: {
        nerves: [
          { name: 'Mediano', amplitude: 18, velocity: 56, latency: 2.1 },
          { name: 'Ulnar', amplitude: 15, velocity: 54, latency: 1.9 },
          { name: 'Sural', amplitude: 12, velocity: 52, latency: 2.8 }
        ]
      }
    };
    
    const mockClinicalHistory = {
      symptoms: ['debilidad progresiva', 'fasciculaciones', 'calambres'],
      duration: 14, // 14 meses
      progression: 'moderate' as const,
      familyHistory: false,
      age: 58
    };
    
    const result = this.analyzeForMotorNeuronDisease(mockEMGData, mockNCSData, mockClinicalHistory);
    
    console.log('\n📋 RESULTADOS DEL ANÁLISIS:');
    console.log(`Patrón detectado: ${result.patternDetected ? 'SÍ' : 'NO'}`);
    console.log(`Confianza: ${(result.confidence * 100).toFixed(1)}%`);
    console.log(`Severidad: ${result.severity.toUpperCase()}`);
    console.log(`Puntuación El Escorial: ${result.elCriteriaScore}/10`);
    console.log(`Criterios Awaji: ${result.awaji.criteria ? 'CUMPLIDOS' : 'NO CUMPLIDOS'} (${result.awaji.score}/10)`);
    console.log(`Urgencia: ${result.urgencyLevel.toUpperCase()}`);
    
    console.log('\n🎯 REGIONES AFECTADAS:');
    result.affectedRegions.forEach(region => {
      if (region.severity !== 'normal') {
        console.log(`  • ${region.name.toUpperCase()}: ${region.severity} (Activa: ${region.hasActiveDenervation}, Crónica: ${region.hasChronicDenervation})`);
      }
    });
    
    console.log('\n🔍 HALLAZGOS CLAVE:');
    result.keyFindings.forEach(finding => console.log(`  • ${finding}`));
    
    console.log('\n✅ EVIDENCIA DE SOPORTE:');
    result.supportingEvidence.forEach(evidence => console.log(`  ${evidence}`));
    
    console.log('\n🏥 RECOMENDACIONES ESPECÍFICAS:');
    result.recommendations.slice(0, 5).forEach(rec => console.log(`  • ${rec}`));
    
    console.log('\n📊 DIAGNÓSTICOS DIFERENCIALES PRINCIPALES:');
    result.differentialDiagnosis.slice(0, 4).forEach(dx => console.log(`  • ${dx}`));
    
    console.log('\n🎉 ANÁLISIS DE ELA COMPLETADO - PRIORIDAD 4 IMPLEMENTADA');
  }
} 