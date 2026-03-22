import { ClinicalReport, SymptomPatternScore, DiagnosticScore } from './jsonReportGenerator';
import { diagnosticPatterns } from '../data/diagnosticPatterns';

// Definir algoritmos específicos de análisis diagnóstico
interface DiagnosticPattern {
  id: string;
  name: string;
  confidence: number;
  supportingEvidence: Evidence[];
  contradictingEvidence: Evidence[];
  clinicalRelevance: number;
  urgencyLevel: 'low' | 'medium' | 'high' | 'urgent';
}

interface Evidence {
  source: 'symptoms' | 'emg' | 'ncs' | 'clinical';
  parameter: string;
  value: any;
  expectedValue: any;
  weight: number;
  description: string;
}

interface DiagnosticRecommendation {
  diagnosisId: string;
  diagnosisName: string;
  overallConfidence: number;
  clinicalScore: number;
  electrophysiologyScore: number;
  symptomCompatibility: number;
  nextSteps: string[];
  timeframe: string;
  specialists: string[];
}

export class DiagnosticPatternAnalyzer {
  /**
   * Analiza un reporte JSON completo y genera patrones diagnósticos
   */
  static analyzeReport(report: ClinicalReport): {
    patterns: DiagnosticPattern[];
    recommendations: DiagnosticRecommendation[];
    summary: AnalysisSummary;
  } {
    const patterns = this.identifyDiagnosticPatterns(report);
    const recommendations = this.generateRecommendations(patterns, report);
    const summary = this.generateAnalysisSummary(patterns, recommendations, report);

    return {
      patterns,
      recommendations,
      summary
    };
  }

  /**
   * Identifica patrones diagnósticos específicos
   */
  private static identifyDiagnosticPatterns(report: ClinicalReport): DiagnosticPattern[] {
    const patterns: DiagnosticPattern[] = [];

    // Analizar para cada patrón diagnóstico conocido
    const patternAnalyzers = [
      this.analyzeCarpalTunnelSyndrome,
      this.analyzePolyneuropathy,
      this.analyzeRadiculopathy,
      this.analyzeMyopathy,
      this.analyzePlexopathy,
      this.analyzeMotorNeuronDisease,
      this.analyzeMononeuropathy,
      this.analyzeMyastheniaGravis
    ];

    patternAnalyzers.forEach(analyzer => {
      const pattern = analyzer.call(DiagnosticPatternAnalyzer, report);
      if (pattern && pattern.confidence > 0.3) {
        patterns.push(pattern);
      }
    });

    // Ordenar por confianza
    return patterns.sort((a, b) => b.confidence - a.confidence);
  }

  /**
   * Análisis específico para Síndrome del Túnel Carpiano
   */
  private static analyzeCarpalTunnelSyndrome(report: ClinicalReport): DiagnosticPattern | null {
    const evidence: Evidence[] = [];
    let confidence = 0;

    // Síntomas característicos
    const tingling = report.clinicalSymptoms?.sensory?.symptoms?.find(s => s.name.includes('Hormigueo'));
    if (tingling?.present && tingling.locations) {
      const handLocation = tingling.locations.some(loc => 
        loc.toLowerCase().includes('mano') || 
        loc.toLowerCase().includes('dedos') ||
        loc.toLowerCase().includes('pulgar')
      );
      if (handLocation) {
        evidence.push({
          source: 'symptoms',
          parameter: 'tingling_hands',
          value: true,
          expectedValue: true,
          weight: 3,
          description: 'Hormigueo en distribución del nervio mediano'
        });
        confidence += 0.3;
      }
    }

    // Patrón nocturno
    const pain = report.clinicalSymptoms?.sensory?.symptoms?.find(s => s.name.includes('Dolor'));
    if (pain?.present && pain.characteristics && pain.characteristics.some(c => c.toLowerCase().includes('nocturno'))) {
      evidence.push({
        source: 'symptoms',
        parameter: 'nocturnal_symptoms',
        value: true,
        expectedValue: true,
        weight: 2,
        description: 'Síntomas nocturnos característicos'
      });
      confidence += 0.2;
    }

    // Datos electrofisiológicos
    if (report.electrophysiologicalData.ncs) {
      const medianResults = report.electrophysiologicalData.ncs.results.filter(r => 
        r.nerve?.toLowerCase().includes('median')
      );
      
      medianResults.forEach(result => {
        if (result.latency && result.latency > 4.0) {
          evidence.push({
            source: 'ncs',
            parameter: 'median_latency',
            value: result.latency,
            expectedValue: '>4.0',
            weight: 4,
            description: 'Latencia distal del nervio mediano prolongada'
          });
          confidence += 0.4;
        }
      });
    }

    // Determinar severidad y urgencia
    let urgencyLevel: 'low' | 'medium' | 'high' | 'urgent' = 'low';
    if (confidence > 0.8) urgencyLevel = 'medium';
    if (confidence > 0.9) urgencyLevel = 'high';

    return confidence > 0.3 ? {
      id: 'carpal_tunnel_syndrome',
      name: 'Síndrome del Túnel Carpiano',
      confidence,
      supportingEvidence: evidence,
      contradictingEvidence: [],
      clinicalRelevance: this.calculateClinicalRelevance(evidence),
      urgencyLevel
    } : null;
  }

  /**
   * Análisis específico para Polineuropatía
   */
  private static analyzePolyneuropathy(report: ClinicalReport): DiagnosticPattern | null {
    const evidence: Evidence[] = [];
    let confidence = 0;

    // Patrón simétrico distal
    const numbness = report.clinicalSymptoms?.sensory?.symptoms?.find(s => s.name.includes('Entumecimiento'));
    const weakness = report.clinicalSymptoms?.motor?.symptoms?.find(s => s.name.includes('Debilidad'));

    if (numbness?.present && numbness.locations && numbness.locations.length >= 2) {
      const bilateralPattern = numbness.locations.some(loc => 
        loc.toLowerCase().includes('bilateral') || 
        loc.toLowerCase().includes('ambos')
      );
      if (bilateralPattern) {
        evidence.push({
          source: 'symptoms',
          parameter: 'bilateral_sensory_loss',
          value: true,
          expectedValue: true,
          weight: 3,
          description: 'Pérdida sensorial bilateral simétrica'
        });
        confidence += 0.3;
      }
    }

    // Patrón de "guante y calcetín"
    if (numbness?.locations && numbness.locations.some(loc => 
      loc.toLowerCase().includes('pie') || loc.toLowerCase().includes('mano')
    )) {
      evidence.push({
        source: 'symptoms',
        parameter: 'stocking_glove_pattern',
        value: true,
        expectedValue: true,
        weight: 4,
        description: 'Patrón de guante y calcetín'
      });
      confidence += 0.4;
    }

    // Datos electrofisiológicos - patrón generalizado
    if (report.electrophysiologicalData.ncs?.globalFindings.distribution === 'generalized') {
      evidence.push({
        source: 'ncs',
        parameter: 'generalized_ncs_abnormalities',
        value: 'generalized',
        expectedValue: 'generalized',
        weight: 4,
        description: 'Alteraciones generalizadas en neuroconducción'
      });
      confidence += 0.4;
    }

    // Factores de riesgo (diabetes, alcohol, etc.)
    const diabetesHistory = report.patient.medicalHistory?.previousDiseases?.some(disease =>
      disease.toLowerCase().includes('diabetes')
    ) || false;
    if (diabetesHistory) {
      evidence.push({
        source: 'clinical',
        parameter: 'diabetes_risk_factor',
        value: true,
        expectedValue: true,
        weight: 2,
        description: 'Historia de diabetes mellitus'
      });
      confidence += 0.2;
    }

    return confidence > 0.3 ? {
      id: 'polyneuropathy',
      name: 'Polineuropatía',
      confidence,
      supportingEvidence: evidence,
      contradictingEvidence: [],
      clinicalRelevance: this.calculateClinicalRelevance(evidence),
      urgencyLevel: this.determineUrgency(confidence, evidence)
    } : null;
  }

  /**
   * Análisis específico para Radiculopatía
   */
  private static analyzeRadiculopathy(report: ClinicalReport): DiagnosticPattern | null {
    const evidence: Evidence[] = [];
    let confidence = 0;

    // Dolor radicular
    const pain = report.clinicalSymptoms.sensory.symptoms.find(s => s.name.includes('Dolor'));
    if (pain?.present) {
      const radiculaCharacteristics = pain.characteristics.some(char =>
        char.toLowerCase().includes('irradiado') ||
        char.toLowerCase().includes('punzante') ||
        char.toLowerCase().includes('eléctrico')
      );
      if (radiculaCharacteristics) {
        evidence.push({
          source: 'symptoms',
          parameter: 'radicular_pain',
          value: true,
          expectedValue: true,
          weight: 4,
          description: 'Dolor con características radiculares'
        });
        confidence += 0.4;
      }
    }

    // Patrón dermatomal
    const radiculopathyNumbness = report.clinicalSymptoms?.sensory?.symptoms?.find(s => s.name.includes('Entumecimiento'));
    if (radiculopathyNumbness?.present && radiculopathyNumbness.locations) {
      const dermatomalPattern = radiculopathyNumbness.locations.some(loc =>
        loc.toLowerCase().includes('l4') ||
        loc.toLowerCase().includes('l5') ||
        loc.toLowerCase().includes('s1') ||
        loc.toLowerCase().includes('c6') ||
        loc.toLowerCase().includes('c7')
      );
      if (dermatomalPattern) {
        evidence.push({
          source: 'symptoms',
          parameter: 'dermatomal_pattern',
          value: true,
          expectedValue: true,
          weight: 3,
          description: 'Patrón de distribución dermatomal'
        });
        confidence += 0.3;
      }
    }

    // Datos EMG - denervación aguda
    if (report.electrophysiologicalData.emg?.globalFindings.chronicity === 'acute') {
      evidence.push({
        source: 'emg',
        parameter: 'acute_denervation',
        value: 'acute',
        expectedValue: 'acute',
        weight: 3,
        description: 'Signos de denervación aguda en EMG'
      });
      confidence += 0.3;
    }

    return confidence > 0.3 ? {
      id: 'radiculopathy',
      name: 'Radiculopatía',
      confidence,
      supportingEvidence: evidence,
      contradictingEvidence: [],
      clinicalRelevance: this.calculateClinicalRelevance(evidence),
      urgencyLevel: this.determineUrgency(confidence, evidence)
    } : null;
  }

  /**
   * Análisis específico para Miopatía
   */
  private static analyzeMyopathy(report: ClinicalReport): DiagnosticPattern | null {
    const evidence: Evidence[] = [];
    let confidence = 0;

    // Debilidad proximal
    const weakness = report.clinicalSymptoms?.motor?.symptoms?.find(s => s.name.includes('Debilidad'));
    if (weakness?.present && weakness.locations) {
      const proximalLocations = weakness.locations.some(loc =>
        loc.toLowerCase().includes('hombro') ||
        loc.toLowerCase().includes('cadera') ||
        loc.toLowerCase().includes('proximal')
      );
      if (proximalLocations) {
        evidence.push({
          source: 'symptoms',
          parameter: 'proximal_weakness',
          value: true,
          expectedValue: true,
          weight: 4,
          description: 'Debilidad muscular proximal'
        });
        confidence += 0.4;
      }
    }

    // Fatiga muscular
    const fatigue = report.clinicalSymptoms?.motor?.symptoms?.find(s => s.name.includes('Fatiga'));
    if (fatigue?.present && fatigue.severity === 'severe') {
      evidence.push({
        source: 'symptoms',
        parameter: 'muscle_fatigue',
        value: 'severe',
        expectedValue: 'present',
        weight: 2,
        description: 'Fatiga muscular significativa'
      });
      confidence += 0.2;
    }

    // Patrón EMG miopático
    if (report.electrophysiologicalData.emg?.globalFindings.overallPattern === 'myopathic') {
      evidence.push({
        source: 'emg',
        parameter: 'myopathic_pattern',
        value: 'myopathic',
        expectedValue: 'myopathic',
        weight: 5,
        description: 'Patrón miopático en electromiografía'
      });
      confidence += 0.5;
    }

    return confidence > 0.3 ? {
      id: 'myopathy',
      name: 'Miopatía',
      confidence,
      supportingEvidence: evidence,
      contradictingEvidence: [],
      clinicalRelevance: this.calculateClinicalRelevance(evidence),
      urgencyLevel: this.determineUrgency(confidence, evidence)
    } : null;
  }

  /**
   * Análisis específico para Plexopatía
   */
  private static analyzePlexopathy(report: ClinicalReport): DiagnosticPattern | null {
    const evidence: Evidence[] = [];
    let confidence = 0;

    // Patrón multifocal
    if (report.electrophysiologicalData.ncs?.globalFindings.distribution === 'multifocal') {
      evidence.push({
        source: 'ncs',
        parameter: 'multifocal_distribution',
        value: 'multifocal',
        expectedValue: 'multifocal',
        weight: 3,
        description: 'Distribución multifocal en neuroconducción'
      });
      confidence += 0.3;
    }

    // Síntomas sensoriales y motores combinados
    const hasMotor = report.clinicalSymptoms?.motor?.present || false;
    const hasSensory = report.clinicalSymptoms?.sensory?.present || false;
    if (hasMotor && hasSensory) {
      evidence.push({
        source: 'symptoms',
        parameter: 'mixed_sensorimotor',
        value: true,
        expectedValue: true,
        weight: 3,
        description: 'Compromiso sensitivo-motor combinado'
      });
      confidence += 0.3;
    }

    return confidence > 0.3 ? {
      id: 'plexopathy',
      name: 'Plexopatía',
      confidence,
      supportingEvidence: evidence,
      contradictingEvidence: [],
      clinicalRelevance: this.calculateClinicalRelevance(evidence),
      urgencyLevel: this.determineUrgency(confidence, evidence)
    } : null;
  }

  /**
   * Análisis específico para Enfermedad de Motoneurona
   */
  private static analyzeMotorNeuronDisease(report: ClinicalReport): DiagnosticPattern | null {
    const evidence: Evidence[] = [];
    let confidence = 0;

    // Fasciculaciones
    const fasciculations = report.clinicalSymptoms?.motor?.symptoms?.find(s => s.name.includes('Fasciculaciones'));
    if (fasciculations?.present) {
      evidence.push({
        source: 'symptoms',
        parameter: 'fasciculations',
        value: true,
        expectedValue: true,
        weight: 3,
        description: 'Presencia de fasciculaciones'
      });
      confidence += 0.3;
    }

    // Debilidad progresiva
    const progressiveWeakness = report.clinicalSymptoms?.motor?.symptoms?.find(s => s.name.includes('Debilidad'));
    if (progressiveWeakness?.present && progressiveWeakness.progression === 'worsening') {
      evidence.push({
        source: 'symptoms',
        parameter: 'progressive_weakness',
        value: 'worsening',
        expectedValue: 'worsening',
        weight: 4,
        description: 'Debilidad muscular progresiva'
      });
      confidence += 0.4;
    }

    // Ausencia de síntomas sensoriales
    if (!report.clinicalSymptoms?.sensory?.present) {
      evidence.push({
        source: 'symptoms',
        parameter: 'no_sensory_symptoms',
        value: false,
        expectedValue: false,
        weight: 2,
        description: 'Ausencia de síntomas sensoriales'
      });
      confidence += 0.2;
    }

    // Alta urgencia si se detecta
    return confidence > 0.5 ? {
      id: 'motor_neuron_disease',
      name: 'Enfermedad de Motoneurona',
      confidence,
      supportingEvidence: evidence,
      contradictingEvidence: [],
      clinicalRelevance: this.calculateClinicalRelevance(evidence),
      urgencyLevel: 'urgent'
    } : null;
  }

  /**
   * Análisis específico para Mononeuropatía
   */
  private static analyzeMononeuropathy(report: ClinicalReport): DiagnosticPattern | null {
    const evidence: Evidence[] = [];
    let confidence = 0;

    // Distribución focal
    if (report.electrophysiologicalData.ncs?.globalFindings.distribution === 'focal') {
      evidence.push({
        source: 'ncs',
        parameter: 'focal_distribution',
        value: 'focal',
        expectedValue: 'focal',
        weight: 4,
        description: 'Distribución focal en neuroconducción'
      });
      confidence += 0.4;
    }

    // Síntomas unilaterales
    const motorSymptoms = report.clinicalSymptoms?.motor?.symptoms || [];
    const sensorySymptoms = report.clinicalSymptoms?.sensory?.symptoms || [];
    const symptoms = [...motorSymptoms, ...sensorySymptoms];
    
    const unilateralSymptoms = symptoms.some(s => 
      s.locations && s.locations.some(loc => 
        loc.toLowerCase().includes('derecho') || 
        loc.toLowerCase().includes('izquierdo') ||
        loc.toLowerCase().includes('unilateral')
      )
    );

    if (unilateralSymptoms) {
      evidence.push({
        source: 'symptoms',
        parameter: 'unilateral_symptoms',
        value: true,
        expectedValue: true,
        weight: 3,
        description: 'Síntomas unilaterales'
      });
      confidence += 0.3;
    }

    return confidence > 0.3 ? {
      id: 'mononeuropathy',
      name: 'Mononeuropatía',
      confidence,
      supportingEvidence: evidence,
      contradictingEvidence: [],
      clinicalRelevance: this.calculateClinicalRelevance(evidence),
      urgencyLevel: this.determineUrgency(confidence, evidence)
    } : null;
  }

  /**
   * Análisis específico para Miastenia Gravis
   */
  private static analyzeMyastheniaGravis(report: ClinicalReport): DiagnosticPattern | null {
    const evidence: Evidence[] = [];
    let confidence = 0;

    // Fatiga fluctuante
    const myastheniaFatigue = report.clinicalSymptoms?.motor?.symptoms?.find(s => s.name.includes('Fatiga'));
    if (myastheniaFatigue?.present && myastheniaFatigue.characteristics) {
      const fluctuatingCharacteristics = myastheniaFatigue.characteristics.some(char =>
        char.toLowerCase().includes('fluctuante') ||
        char.toLowerCase().includes('empeora con actividad')
      );
      if (fluctuatingCharacteristics) {
        evidence.push({
          source: 'symptoms',
          parameter: 'fluctuating_fatigue',
          value: true,
          expectedValue: true,
          weight: 4,
          description: 'Fatiga fluctuante característica'
        });
        confidence += 0.4;
      }
    }

    // Debilidad ocular/bulbar
    const cranialWeakness = report.clinicalSymptoms?.motor?.symptoms?.find(s => s.name.includes('Debilidad'));
    if (cranialWeakness?.present && cranialWeakness.locations) {
      const cranialInvolvement = cranialWeakness.locations.some(loc =>
        loc.toLowerCase().includes('ocular') ||
        loc.toLowerCase().includes('párpado') ||
        loc.toLowerCase().includes('bulbar')
      );
      if (cranialInvolvement) {
        evidence.push({
          source: 'symptoms',
          parameter: 'cranial_weakness',
          value: true,
          expectedValue: true,
          weight: 4,
          description: 'Debilidad ocular o bulbar'
        });
        confidence += 0.4;
      }
    }

    return confidence > 0.3 ? {
      id: 'myasthenia_gravis',
      name: 'Miastenia Gravis',
      confidence,
      supportingEvidence: evidence,
      contradictingEvidence: [],
      clinicalRelevance: this.calculateClinicalRelevance(evidence),
      urgencyLevel: this.determineUrgency(confidence, evidence)
    } : null;
  }

  /**
   * Genera recomendaciones basadas en los patrones identificados
   */
  private static generateRecommendations(
    patterns: DiagnosticPattern[],
    report: ClinicalReport
  ): DiagnosticRecommendation[] {
    return patterns.map(pattern => {
      const recommendations: DiagnosticRecommendation = {
        diagnosisId: pattern.id,
        diagnosisName: pattern.name,
        overallConfidence: pattern.confidence,
        clinicalScore: this.calculateClinicalScore(pattern, report),
        electrophysiologyScore: this.calculateElectrophysiologyScore(pattern, report),
        symptomCompatibility: this.calculateSymptomCompatibility(pattern, report),
        nextSteps: this.generateNextSteps(pattern, report),
        timeframe: this.getRecommendedTimeframe(pattern),
        specialists: this.getRecommendedSpecialists(pattern)
      };

      return recommendations;
    });
  }

  private static calculateClinicalRelevance(evidence: Evidence[]): number {
    const totalWeight = evidence.reduce((sum, e) => sum + e.weight, 0);
    return Math.min(totalWeight / 10, 1);
  }

  private static determineUrgency(confidence: number, evidence: Evidence[]): 'low' | 'medium' | 'high' | 'urgent' {
    const hasRedFlags = evidence.some(e => e.parameter.includes('progressive') || e.parameter.includes('severe'));
    
    if (hasRedFlags && confidence > 0.8) return 'urgent';
    if (confidence > 0.8) return 'high';
    if (confidence > 0.6) return 'medium';
    return 'low';
  }

  private static calculateClinicalScore(pattern: DiagnosticPattern, report: ClinicalReport): number {
    // Implementar scoring clínico
    return pattern.confidence * 0.8;
  }

  private static calculateElectrophysiologyScore(pattern: DiagnosticPattern, report: ClinicalReport): number {
    // Implementar scoring electrofisiológico
    const electrophysiologyEvidence = pattern.supportingEvidence.filter(e => 
      e.source === 'emg' || e.source === 'ncs'
    );
    return (electrophysiologyEvidence.length / pattern.supportingEvidence.length) * pattern.confidence;
  }

  private static calculateSymptomCompatibility(pattern: DiagnosticPattern, report: ClinicalReport): number {
    // Implementar compatibilidad de síntomas
    const symptomEvidence = pattern.supportingEvidence.filter(e => e.source === 'symptoms');
    return (symptomEvidence.length / pattern.supportingEvidence.length) * pattern.confidence;
  }

  private static generateNextSteps(pattern: DiagnosticPattern, report: ClinicalReport): string[] {
    const steps: string[] = [];
    
    switch (pattern.id) {
      case 'carpal_tunnel_syndrome':
        steps.push('Completar neuroconducción del nervio mediano bilateral');
        steps.push('Evaluar tratamiento conservador vs quirúrgico');
        break;
      case 'polyneuropathy':
        steps.push('Estudios de laboratorio para causas sistémicas');
        steps.push('Considerar biopsia de nervio si etiología no clara');
        break;
      case 'motor_neuron_disease':
        steps.push('Evaluación neurológica urgente');
        steps.push('Estudios de imagen cerebral y medular');
        steps.push('Pruebas genéticas si indicado');
        break;
      default:
        steps.push('Correlación clínica y seguimiento');
    }
    
    return steps;
  }

  private static getRecommendedTimeframe(pattern: DiagnosticPattern): string {
    switch (pattern.urgencyLevel) {
      case 'urgent': return 'Inmediato (24-48 horas)';
      case 'high': return '1-2 semanas';
      case 'medium': return '2-4 semanas';
      default: return '1-3 meses';
    }
  }

  private static getRecommendedSpecialists(pattern: DiagnosticPattern): string[] {
    const specialists: string[] = [];
    
    switch (pattern.id) {
      case 'carpal_tunnel_syndrome':
        specialists.push('Neurólogo', 'Cirujano ortopédico');
        break;
      case 'polyneuropathy':
        specialists.push('Neurólogo', 'Endocrinólogo');
        break;
      case 'motor_neuron_disease':
        specialists.push('Neurólogo especialista en enfermedades neuromusculares');
        break;
      case 'myopathy':
        specialists.push('Neurólogo', 'Reumatólogo');
        break;
      default:
        specialists.push('Neurólogo');
    }
    
    return specialists;
  }

  private static generateAnalysisSummary(
    patterns: DiagnosticPattern[],
    recommendations: DiagnosticRecommendation[],
    report: ClinicalReport
  ): AnalysisSummary {
    return {
      totalPatternsIdentified: patterns.length,
      highConfidencePatterns: patterns.filter(p => p.confidence > 0.8).length,
      urgentFindings: patterns.filter(p => p.urgencyLevel === 'urgent').length,
      primaryDiagnosis: patterns[0]?.name || 'Pendiente de análisis adicional',
      overallComplexity: this.calculateComplexity(patterns, report),
      recommendedActions: this.getPriorityActions(recommendations)
    };
  }

  private static calculateComplexity(patterns: DiagnosticPattern[], report: ClinicalReport): 'simple' | 'moderate' | 'complex' {
    if (patterns.length === 1 && patterns[0].confidence > 0.8) return 'simple';
    if (patterns.length <= 3) return 'moderate';
    return 'complex';
  }

  private static getPriorityActions(recommendations: DiagnosticRecommendation[]): string[] {
    const topRecommendations = recommendations
      .sort((a, b) => b.overallConfidence - a.overallConfidence)
      .slice(0, 3);
    
    const actions: string[] = [];
    topRecommendations.forEach(r => {
      if (r.nextSteps && Array.isArray(r.nextSteps)) {
        actions.push(...r.nextSteps.slice(0, 2));
      }
    });
    
    return actions;
  }
}

interface AnalysisSummary {
  totalPatternsIdentified: number;
  highConfidencePatterns: number;
  urgentFindings: number;
  primaryDiagnosis: string;
  overallComplexity: 'simple' | 'moderate' | 'complex';
  recommendedActions: string[];
}

export type { DiagnosticPattern, DiagnosticRecommendation, Evidence, AnalysisSummary }; 