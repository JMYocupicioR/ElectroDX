/**
 * MEJORADO: Análisis completo de enfermedades de motoneurona
 * Implementa criterios diagnósticos de El Escorial revisados y criterios de Awaji
 */
export class EnhancedMotorNeuronDiseaseAnalyzer {
  
  /**
   * MEJORADO: Análisis completo de ALS con criterios de El Escorial revisados
   */
  public static analyzeALS(data: any): {
    diagnosis: string;
    certainty: 'definite' | 'probable' | 'possible' | 'unlikely';
    criteria: any;
    recommendations: string[];
    regions: any;
    progression: any;
  } {
    const result = {
      diagnosis: 'ALS',
      certainty: 'unlikely' as const,
      criteria: {
        upperMotorNeuron: { present: false, regions: [], evidence: [] },
        lowerMotorNeuron: { present: false, regions: [], evidence: [] },
        progression: { present: false, rate: 'unknown', pattern: 'unknown' },
        exclusion: { satisfied: true, excluded: [] }
      },
      recommendations: [] as string[],
      regions: {
        bulbar: { umn: false, lmn: false, clinical: false, electrophysiological: false },
        cervical: { umn: false, lmn: false, clinical: false, electrophysiological: false },
        thoracic: { umn: false, lmn: false, clinical: false, electrophysiological: false },
        lumbosacral: { umn: false, lmn: false, clinical: false, electrophysiological: false }
      },
      progression: {
        rate: 'unknown',
        pattern: 'unknown',
        duration: 'unknown',
        functional: 'unknown'
      }
    };

    // 🔥 ANÁLISIS DE SIGNOS DE MOTONEURONA SUPERIOR
    this.analyzeUpperMotorNeuronSigns(data, result);
    
    // 🔥 ANÁLISIS DE SIGNOS DE MOTONEURONA INFERIOR
    this.analyzeLowerMotorNeuronSigns(data, result);
    
    // 🔥 ANÁLISIS DE PROGRESIÓN
    this.analyzeProgression(data, result);
    
    // 🔥 ANÁLISIS DE CRITERIOS DE EXCLUSIÓN
    this.analyzeExclusionCriteria(data, result);
    
    // 🔥 DETERMINACIÓN DE CERTEZA DIAGNÓSTICA
    this.determineDiagnosticCertainty(result);
    
    // 🔥 GENERACIÓN DE RECOMENDACIONES
    this.generateRecommendations(result);

    return result;
  }

  /**
   * NUEVO: Análisis de signos de motoneurona superior
   */
  private static analyzeUpperMotorNeuronSigns(data: any, result: any): void {
    const umnSigns = [];
    const regions = result.regions;

    // Análisis clínico de UMN
    if (data.clinicalExam) {
      // Hiperreflexia
      if (data.clinicalExam.reflexes?.hyperreflexia) {
        umnSigns.push('Hiperreflexia');
        this.markUMNRegions(data.clinicalExam.reflexes.hyperreflexia, regions, 'clinical');
      }
      
      // Signo de Babinski
      if (data.clinicalExam.reflexes?.babinski) {
        umnSigns.push('Signo de Babinski');
        regions.lumbosacral.umn = true;
        regions.lumbosacral.clinical = true;
      }
      
      // Espasticidad
      if (data.clinicalExam.tone?.spasticity) {
        umnSigns.push('Espasticidad');
        this.markUMNRegions(data.clinicalExam.tone.spasticity, regions, 'clinical');
      }
      
      // Clonus
      if (data.clinicalExam.reflexes?.clonus) {
        umnSigns.push('Clonus');
        this.markUMNRegions(data.clinicalExam.reflexes.clonus, regions, 'clinical');
      }
      
      // Reflejos patológicos
      if (data.clinicalExam.reflexes?.pathological) {
        umnSigns.push('Reflejos patológicos');
        this.markUMNRegions(data.clinicalExam.reflexes.pathological, regions, 'clinical');
      }
    }

    // Análisis EMG de UMN (reclutamiento reducido)
    if (data.emgResults) {
      for (const emg of data.emgResults) {
        if (emg.recruitment?.pattern === 'reduced' || emg.recruitment?.type === 'reduced') {
          umnSigns.push(`Reclutamiento reducido en ${emg.muscle}`);
          this.markUMNRegionByMuscle(emg.muscle, regions, 'electrophysiological');
        }
      }
    }

    result.criteria.upperMotorNeuron.present = umnSigns.length > 0;
    result.criteria.upperMotorNeuron.evidence = umnSigns;
    result.criteria.upperMotorNeuron.regions = this.getActiveUMNRegions(regions);
  }

  /**
   * NUEVO: Análisis de signos de motoneurona inferior
   */
  private static analyzeLowerMotorNeuronSigns(data: any, result: any): void {
    const lmnSigns = [];
    const regions = result.regions;

    // Análisis clínico de LMN
    if (data.clinicalExam) {
      // Fasciculaciones
      if (data.clinicalExam.fasciculations) {
        lmnSigns.push('Fasciculaciones clínicas');
        this.markLMNRegions(data.clinicalExam.fasciculations, regions, 'clinical');
      }
      
      // Atrofia muscular
      if (data.clinicalExam.atrophy) {
        lmnSigns.push('Atrofia muscular');
        this.markLMNRegions(data.clinicalExam.atrophy, regions, 'clinical');
      }
      
      // Debilidad
      if (data.clinicalExam.weakness) {
        lmnSigns.push('Debilidad muscular');
        this.markLMNRegions(data.clinicalExam.weakness, regions, 'clinical');
      }
      
      // Hiporreflexia
      if (data.clinicalExam.reflexes?.hyporeflexia) {
        lmnSigns.push('Hiporreflexia');
        this.markLMNRegions(data.clinicalExam.reflexes.hyporeflexia, regions, 'clinical');
      }
    }

    // Análisis EMG de LMN
    if (data.emgResults) {
      for (const emg of data.emgResults) {
        // Denervación aguda
        if (emg.spontaneousActivity?.fibrillations || emg.spontaneousActivity?.positiveWaves) {
          lmnSigns.push(`Denervación aguda en ${emg.muscle}`);
          this.markLMNRegionByMuscle(emg.muscle, regions, 'electrophysiological');
        }
        
        // Fasciculaciones EMG
        if (emg.spontaneousActivity?.fasciculations) {
          lmnSigns.push(`Fasciculaciones EMG en ${emg.muscle}`);
          this.markLMNRegionByMuscle(emg.muscle, regions, 'electrophysiological');
        }
        
        // Reinervación crónica
        if (emg.motorUnitPotentials?.increased || emg.motorUnitPotentials?.polyphasic) {
          lmnSigns.push(`Reinervación crónica en ${emg.muscle}`);
          this.markLMNRegionByMuscle(emg.muscle, regions, 'electrophysiological');
        }
      }
    }

    // Análisis NCS de LMN
    if (data.ncsResults) {
      for (const ncs of data.ncsResults) {
        if (ncs.amplitude && ncs.amplitude < this.getNormalAmplitude(ncs.nerve)) {
          lmnSigns.push(`Amplitud reducida en ${ncs.nerve}`);
          this.markLMNRegionByNerve(ncs.nerve, regions, 'electrophysiological');
        }
      }
    }

    result.criteria.lowerMotorNeuron.present = lmnSigns.length > 0;
    result.criteria.lowerMotorNeuron.evidence = lmnSigns;
    result.criteria.lowerMotorNeuron.regions = this.getActiveLMNRegions(regions);
  }

  /**
   * NUEVO: Análisis de progresión
   */
  private static analyzeProgression(data: any, result: any): void {
    let progressionPresent = false;
    let rate = 'unknown';
    let pattern = 'unknown';
    let duration = 'unknown';

    if (data.history) {
      // Duración de síntomas
      if (data.history.symptomDuration) {
        duration = data.history.symptomDuration;
        progressionPresent = true;
      }
      
      // Patrón de progresión
      if (data.history.progressionPattern) {
        pattern = data.history.progressionPattern;
        progressionPresent = true;
      }
      
      // Velocidad de progresión
      if (data.history.progressionRate) {
        rate = data.history.progressionRate;
        progressionPresent = true;
      }
      
      // Progresión funcional
      if (data.history.functionalDecline) {
        progressionPresent = true;
      }
    }

    result.criteria.progression.present = progressionPresent;
    result.progression.rate = rate;
    result.progression.pattern = pattern;
    result.progression.duration = duration;
  }

  /**
   * NUEVO: Análisis de criterios de exclusión
   */
  private static analyzeExclusionCriteria(data: any, result: any): void {
    const excluded = [];
    let satisfied = true;

    // Verificar condiciones que excluyen ALS
    if (data.imaging?.spinalCord?.abnormal) {
      excluded.push('Patología de médula espinal');
      satisfied = false;
    }
    
    if (data.labResults?.vitaminB12 && data.labResults.vitaminB12 < 200) {
      excluded.push('Deficiencia de vitamina B12');
      satisfied = false;
    }
    
    if (data.labResults?.thyroid?.abnormal) {
      excluded.push('Disfunción tiroidea');
      satisfied = false;
    }
    
    if (data.history?.familyHistory?.huntingtonDisease) {
      excluded.push('Enfermedad de Huntington familiar');
      satisfied = false;
    }
    
    if (data.clinicalExam?.sensoryDeficits?.significant) {
      excluded.push('Déficits sensoriales significativos');
      satisfied = false;
    }

    result.criteria.exclusion.satisfied = satisfied;
    result.criteria.exclusion.excluded = excluded;
  }

  /**
   * NUEVO: Determinación de certeza diagnóstica
   */
  private static determineDiagnosticCertainty(result: any): void {
    const umnRegions = result.criteria.upperMotorNeuron.regions.length;
    const lmnRegions = result.criteria.lowerMotorNeuron.regions.length;
    const umnPresent = result.criteria.upperMotorNeuron.present;
    const lmnPresent = result.criteria.lowerMotorNeuron.present;
    const progressionPresent = result.criteria.progression.present;
    const exclusionSatisfied = result.criteria.exclusion.satisfied;

    if (!exclusionSatisfied) {
      result.certainty = 'unlikely';
      return;
    }

    // Criterios de El Escorial revisados
    if (umnPresent && lmnPresent && progressionPresent) {
      if (umnRegions >= 3 && lmnRegions >= 3) {
        result.certainty = 'definite';
      } else if (umnRegions >= 2 && lmnRegions >= 2) {
        result.certainty = 'probable';
      } else if (umnRegions >= 1 && lmnRegions >= 1) {
        result.certainty = 'possible';
      } else {
        result.certainty = 'unlikely';
      }
    } else {
      result.certainty = 'unlikely';
    }
  }

  /**
   * NUEVO: Generación de recomendaciones
   */
  private static generateRecommendations(result: any): void {
    const recommendations = [];

    if (result.certainty === 'unlikely') {
      recommendations.push('Considerar otros diagnósticos diferenciales');
      recommendations.push('Repetir evaluación en 3-6 meses si persisten síntomas');
    }

    if (result.certainty === 'possible') {
      recommendations.push('Seguimiento estrecho con evaluaciones seriadas');
      recommendations.push('Considerar estudios genéticos si hay historia familiar');
      recommendations.push('Evaluar criterios de exclusión adicionales');
    }

    if (result.certainty === 'probable' || result.certainty === 'definite') {
      recommendations.push('Referir a especialista en enfermedades de motoneurona');
      recommendations.push('Considerar terapia con riluzol');
      recommendations.push('Evaluación multidisciplinaria');
      recommendations.push('Planificación de cuidados paliativos');
    }

    if (!result.criteria.upperMotorNeuron.present) {
      recommendations.push('Buscar signos de motoneurona superior adicionales');
      recommendations.push('Considerar resonancia magnética de cerebro y médula');
    }

    if (!result.criteria.lowerMotorNeuron.present) {
      recommendations.push('Completar estudio neurofisiológico');
      recommendations.push('Evaluar músculos adicionales con EMG');
    }

    result.recommendations = recommendations;
  }

  /**
   * NUEVO: Marcar regiones UMN
   */
  private static markUMNRegions(distribution: any, regions: any, type: string): void {
    if (typeof distribution === 'string') {
      const region = this.mapDistributionToRegion(distribution);
      if (region && regions[region]) {
        regions[region].umn = true;
        regions[region][type] = true;
      }
    } else if (Array.isArray(distribution)) {
      for (const dist of distribution) {
        const region = this.mapDistributionToRegion(dist);
        if (region && regions[region]) {
          regions[region].umn = true;
          regions[region][type] = true;
        }
      }
    }
  }

  /**
   * NUEVO: Marcar regiones LMN
   */
  private static markLMNRegions(distribution: any, regions: any, type: string): void {
    if (typeof distribution === 'string') {
      const region = this.mapDistributionToRegion(distribution);
      if (region && regions[region]) {
        regions[region].lmn = true;
        regions[region][type] = true;
      }
    } else if (Array.isArray(distribution)) {
      for (const dist of distribution) {
        const region = this.mapDistributionToRegion(dist);
        if (region && regions[region]) {
          regions[region].lmn = true;
          regions[region][type] = true;
        }
      }
    }
  }

  /**
   * NUEVO: Marcar región UMN por músculo
   */
  private static markUMNRegionByMuscle(muscle: string, regions: any, type: string): void {
    const region = this.mapMuscleToRegion(muscle);
    if (region && regions[region]) {
      regions[region].umn = true;
      regions[region][type] = true;
    }
  }

  /**
   * NUEVO: Marcar región LMN por músculo
   */
  private static markLMNRegionByMuscle(muscle: string, regions: any, type: string): void {
    const region = this.mapMuscleToRegion(muscle);
    if (region && regions[region]) {
      regions[region].lmn = true;
      regions[region][type] = true;
    }
  }

  /**
   * NUEVO: Marcar región LMN por nervio
   */
  private static markLMNRegionByNerve(nerve: string, regions: any, type: string): void {
    const region = this.mapNerveToRegion(nerve);
    if (region && regions[region]) {
      regions[region].lmn = true;
      regions[region][type] = true;
    }
  }

  /**
   * NUEVO: Mapear distribución a región
   */
  private static mapDistributionToRegion(distribution: string): string | null {
    const dist = distribution.toLowerCase();
    
    if (dist.includes('bulbar') || dist.includes('facial') || dist.includes('tongue')) {
      return 'bulbar';
    }
    if (dist.includes('cervical') || dist.includes('arm') || dist.includes('hand')) {
      return 'cervical';
    }
    if (dist.includes('thoracic') || dist.includes('trunk') || dist.includes('respiratory')) {
      return 'thoracic';
    }
    if (dist.includes('lumbar') || dist.includes('leg') || dist.includes('foot')) {
      return 'lumbosacral';
    }
    
    return null;
  }

  /**
   * NUEVO: Mapear músculo a región
   */
  private static mapMuscleToRegion(muscle: string): string | null {
    const muscleMap: Record<string, string> = {
      // Músculos bulbares
      'masseter': 'bulbar',
      'temporalis': 'bulbar',
      'orbicularis_oculi': 'bulbar',
      'orbicularis_oris': 'bulbar',
      'tongue': 'bulbar',
      'genioglossus': 'bulbar',
      'sternocleidomastoid': 'bulbar',
      
      // Músculos cervicales
      'deltoid': 'cervical',
      'biceps_brachii': 'cervical',
      'triceps_brachii': 'cervical',
      'brachioradialis': 'cervical',
      'first_dorsal_interosseous': 'cervical',
      'abductor_pollicis_brevis': 'cervical',
      'extensor_digitorum': 'cervical',
      'flexor_carpi_radialis': 'cervical',
      
      // Músculos torácicos
      'diaphragm': 'thoracic',
      'intercostal': 'thoracic',
      'erector_spinae': 'thoracic',
      'serratus_anterior': 'thoracic',
      
      // Músculos lumbosacros
      'quadriceps': 'lumbosacral',
      'tibialis_anterior': 'lumbosacral',
      'gastrocnemius': 'lumbosacral',
      'extensor_digitorum_brevis': 'lumbosacral',
      'gluteus_maximus': 'lumbosacral',
      'biceps_femoris': 'lumbosacral'
    };
    
    return muscleMap[muscle.toLowerCase()] || null;
  }

  /**
   * NUEVO: Mapear nervio a región
   */
  private static mapNerveToRegion(nerve: string): string | null {
    const nerveMap: Record<string, string> = {
      'facial': 'bulbar',
      'trigeminal': 'bulbar',
      'hypoglossal': 'bulbar',
      'accessory': 'bulbar',
      'median': 'cervical',
      'ulnar': 'cervical',
      'radial': 'cervical',
      'axillary': 'cervical',
      'musculocutaneous': 'cervical',
      'phrenic': 'thoracic',
      'intercostal': 'thoracic',
      'femoral': 'lumbosacral',
      'sciatic': 'lumbosacral',
      'peroneal': 'lumbosacral',
      'tibial': 'lumbosacral',
      'sural': 'lumbosacral'
    };
    
    return nerveMap[nerve.toLowerCase()] || null;
  }

  /**
   * NUEVO: Obtener regiones UMN activas
   */
  private static getActiveUMNRegions(regions: any): string[] {
    return Object.keys(regions).filter(region => regions[region].umn);
  }

  /**
   * NUEVO: Obtener regiones LMN activas
   */
  private static getActiveLMNRegions(regions: any): string[] {
    return Object.keys(regions).filter(region => regions[region].lmn);
  }

  /**
   * NUEVO: Obtener amplitud normal
   */
  private static getNormalAmplitude(nerve: string): number {
    const normalAmplitudes: Record<string, number> = {
      'median': 4.0,
      'ulnar': 6.0,
      'peroneal': 2.0,
      'tibial': 4.0,
      'femoral': 3.0,
      'radial': 5.0
    };
    
    return normalAmplitudes[nerve.toLowerCase()] || 3.0;
  }
} 