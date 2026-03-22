// src/data/emgClinicalCriteria.ts

export interface AgeAdjustedThresholds {
  young: { min: number; max: number }; // 18-39 años
  middle: { min: number; max: number }; // 40-59 años
  older: { min: number; max: number }; // 60+ años
}

export interface EMGThresholds {
  duration: {
    normal: number;
    severe: number;
    ageAdjusted?: AgeAdjustedThresholds;
  };
  amplitude: {
    normal: number;
    severe: number;
    ageAdjusted?: AgeAdjustedThresholds;
  };
  polyphasia: {
    normal: number;
    severe: number;
  };
}

export interface CorrectionFactors {
  temperature: {
    duration: number;    // ms/°C
    amplitude: number;   // mV/°C
    velocity: number;    // m/s/°C
  };
  height: {
    duration: number;    // ms/cm
    velocity: number;    // m/s/cm
  };
  age: {
    velocityPerYear: number;     // % reduction per year after 60
    amplitudePerYear: number;    // % reduction per year after 60
    durationPerYear: number;     // ms increase per year after 60
  };
}

export interface NCSThresholds {
  axonal: {
    cMAPAmplitude: number;
    sNAPAmplitude: number;
    conductionVelocity: number;
  };
  demyelinating: {
    velocityReduction: number;
    latencyProlongation: number;
    conductionBlock: number; // % amplitude drop
    temporalDispersion: number;
  };
}

export interface CriterionDefinition {
  id: string;
  description: string;
  weight: number;
  specificity: number;
  evaluationFunction: string; // Nombre de la función que evalúa este criterio
  severityLevels?: {
    mild: any;
    moderate: any;
    severe: any;
  };
}

export interface PatternCriteria {
  neuropathic: CriterionDefinition[];
  axonal: CriterionDefinition[];
  demyelinating: CriterionDefinition[];
  myopathic: CriterionDefinition[];
  motor_neuron_disease: CriterionDefinition[]; // 🔥 NUEVO - PRIORIDAD 4
}

// Umbrales clínicos actualizados con correcciones por edad
export const CLINICAL_THRESHOLDS = {
  // Umbrales neuropáticos con ajustes por edad
  NEUROPATHIC: {
    duration: {
      normal: 15,
      severe: 20,
      ageAdjusted: {
        young: { min: 8, max: 15 },
        middle: { min: 8, max: 17 },
        older: { min: 8, max: 20 }
      }
    },
    amplitude: {
      normal: 5,
      severe: 7,
      ageAdjusted: {
        young: { min: 3, max: 20 },
        middle: { min: 2.5, max: 18 },
        older: { min: 2, max: 15 }
      }
    },
    polyphasia: {
      normal: 25,
      severe: 35
    }
  } as EMGThresholds,

  // Umbrales miopáticos
  MYOPATHIC: {
    duration: {
      normal: 8,
      severe: 5
    },
    amplitude: {
      normal: 2,
      severe: 1
    },
    polyphasia: {
      normal: 30,
      severe: 40
    }
  } as EMGThresholds,

  // Umbrales para NCS
  NCS: {
    axonal: {
      cMAPAmplitude: 80, // % del límite inferior normal
      sNAPAmplitude: 50, // % del límite inferior normal
      conductionVelocity: 80 // % del límite inferior normal
    },
    demyelinating: {
      velocityReduction: 70, // % del límite inferior normal
      latencyProlongation: 130, // % del límite superior normal
      conductionBlock: 50, // % de caída de amplitud
      temporalDispersion: 30 // % aumento de duración
    }
  } as NCSThresholds
};

// 🔥 FACTORES DE CORRECCIÓN CORREGIDOS - PRIORIDAD 2
export const CORRECTION_FACTORS: CorrectionFactors = {
  temperature: {
    duration: 0.13,    // ms/°C - AUMENTA con frío (correcto)
    amplitude: 0.04,   // %/°C - DISMINUYE con frío (corregido de -0.04 a +0.04)
    velocity: 1.5      // m/s/°C - DISMINUYE con frío (correcto)
  },
  height: {
    duration: 0.01,    // ms/cm
    velocity: 0.03     // m/s/cm
  },
  age: {
    velocityPerYear: 0.4,      // 0.4% reduction per year after 60
    amplitudePerYear: 1.0,     // 1% reduction per year after 60
    durationPerYear: 0.05      // 0.05 ms increase per year after 60
  }
};

// 🔥 NUEVAS FUNCIONES PARA CORRECCIÓN FISIOLÓGICA CORRECTA
export interface TemperatureCorrectionResult {
  correctedValue: number;
  originalValue: number;
  correctionApplied: number;
  temperatureDifference: number;
  correctionType: 'duration' | 'amplitude' | 'velocity';
}

/**
 * Aplica corrección por temperatura de forma fisiológicamente correcta
 * Temperatura de referencia: 32°C (temperatura normal de la piel)
 */
export function applyTemperatureCorrection(
  value: number,
  currentTemperature: number,
  parameter: 'duration' | 'amplitude' | 'velocity'
): TemperatureCorrectionResult {
  const referenceTemperature = 32; // °C
  const temperatureDifference = referenceTemperature - currentTemperature;
  
  let correctedValue = value;
  let correctionApplied = 0;
  
  if (Math.abs(temperatureDifference) > 0.5) { // Solo corregir si diferencia > 0.5°C
    switch (parameter) {
      case 'duration':
        // Duración AUMENTA cuando temperatura DISMINUYE
        correctionApplied = temperatureDifference * CORRECTION_FACTORS.temperature.duration;
        correctedValue = value + correctionApplied;
        break;
        
      case 'amplitude':
        // Amplitud DISMINUYE cuando temperatura DISMINUYE (ahora correctamente implementado)
        const amplitudeReductionPercent = temperatureDifference * CORRECTION_FACTORS.temperature.amplitude;
        correctionApplied = value * (amplitudeReductionPercent / 100);
        correctedValue = value + correctionApplied; // Corrección aditiva
        break;
        
      case 'velocity':
        // Velocidad DISMINUYE cuando temperatura DISMINUYE
        correctionApplied = temperatureDifference * CORRECTION_FACTORS.temperature.velocity;
        correctedValue = value + correctionApplied;
        break;
    }
  }
  
  return {
    correctedValue: Math.max(0, correctedValue), // No valores negativos
    originalValue: value,
    correctionApplied,
    temperatureDifference,
    correctionType: parameter
  };
}

// Criterios específicos para cada patrón
export const PATTERN_CRITERIA: PatternCriteria = {
  neuropathic: [
    {
      id: 'neuropathic_duration',
      description: 'Increased duration of motor unit potentials (>15ms)',
      weight: 3.0,
      specificity: 0.85,
      evaluationFunction: 'evaluateNeuropathicDuration',
      severityLevels: {
        mild: 15,
        moderate: 17,
        severe: 20
      }
    },
    {
      id: 'neuropathic_amplitude',
      description: 'Increased amplitude of motor unit potentials (>5mV)',
      weight: 2.5,
      specificity: 0.80,
      evaluationFunction: 'evaluateNeuropathicAmplitude',
      severityLevels: {
        mild: 5,
        moderate: 6,
        severe: 7
      }
    },
    {
      id: 'reduced_recruitment',
      description: 'Reduced recruitment pattern',
      weight: 2.0,
      specificity: 0.75,
      evaluationFunction: 'evaluateReducedRecruitment'
    },
    {
      id: 'fibrillations',
      description: 'Presence of fibrillations',
      weight: 1.5,
      specificity: 0.70,
      evaluationFunction: 'evaluateFibrillations'
    },
    {
      id: 'positive_waves',
      description: 'Presence of positive sharp waves',
      weight: 1.5,
      specificity: 0.70,
      evaluationFunction: 'evaluatePositiveWaves'
    },
    {
      id: 'complex_mups',
      description: 'Long duration, high amplitude polyphasic potentials',
      weight: 3.5,
      specificity: 0.90,
      evaluationFunction: 'evaluateComplexMUPs'
    }
  ],

  axonal: [
    {
      id: 'reduced_cmap_amplitude',
      description: 'Reduced amplitude of compound muscle action potential',
      weight: 3.0,
      specificity: 0.85,
      evaluationFunction: 'evaluateReducedCMAPAmplitude'
    },
    {
      id: 'preserved_velocity',
      description: 'Normal or slightly reduced conduction velocity',
      weight: 2.0,
      specificity: 0.75,
      evaluationFunction: 'evaluatePreservedVelocity'
    },
    {
      id: 'active_denervation',
      description: 'Fibrillations and positive waves in affected muscles',
      weight: 2.5,
      specificity: 0.80,
      evaluationFunction: 'evaluateActiveDenervation'
    },
    {
      id: 'reduced_snap_amplitude',
      description: 'Reduced sensory nerve action potential amplitude',
      weight: 2.8,
      specificity: 0.82,
      evaluationFunction: 'evaluateReducedSNAPAmplitude'
    }
  ],

  demyelinating: [
    {
      id: 'reduced_velocity',
      description: 'Markedly reduced conduction velocity',
      weight: 3.0,
      specificity: 0.90,
      evaluationFunction: 'evaluateReducedVelocity'
    },
    {
      id: 'prolonged_latency',
      description: 'Prolonged distal latency',
      weight: 2.5,
      specificity: 0.85,
      evaluationFunction: 'evaluateProlongedLatency'
    },
    {
      id: 'conduction_block',
      description: 'Conduction block',
      weight: 4.0,
      specificity: 0.95,
      evaluationFunction: 'evaluateConductionBlock'
    },
    {
      id: 'temporal_dispersion',
      description: 'Temporal dispersion',
      weight: 2.8,
      specificity: 0.88,
      evaluationFunction: 'evaluateTemporalDispersion'
    },
    {
      id: 'prolonged_f_waves',
      description: 'Prolonged or absent F-wave responses',
      weight: 2.2,
      specificity: 0.75,
      evaluationFunction: 'evaluateFWaveAbnormalities'
    }
  ],

  myopathic: [
    {
      id: 'decreased_duration',
      description: 'Decreased duration of motor unit potentials',
      weight: 2.5,
      specificity: 0.80,
      evaluationFunction: 'evaluateDecreasedDuration',
      severityLevels: {
        mild: 8,
        moderate: 6,
        severe: 5
      }
    },
    {
      id: 'decreased_amplitude',
      description: 'Decreased amplitude of motor unit potentials',
      weight: 2.0,
      specificity: 0.75,
      evaluationFunction: 'evaluateDecreasedAmplitude',
      severityLevels: {
        mild: 2,
        moderate: 1.5,
        severe: 1
      }
    },
    {
      id: 'early_recruitment',
      description: 'Early recruitment pattern',
      weight: 2.0,
      specificity: 0.70,
      evaluationFunction: 'evaluateEarlyRecruitment'
    },
    {
      id: 'increased_polyphasia',
      description: 'Increased polyphasia',
      weight: 1.5,
      specificity: 0.90,
      evaluationFunction: 'evaluateIncreasedPolyphasia'
    },
    {
      id: 'myopathic_recruitment',
      description: 'Rapid recruitment with reduced effort',
      weight: 2.3,
      specificity: 0.85,
      evaluationFunction: 'evaluateMyopathicRecruitment'
    }
  ],

  // 🔥 NUEVO PATRÓN - PRIORIDAD 4: Enfermedad de Motoneurona Superior
  motor_neuron_disease: [
    {
      id: 'widespread_denervation',
      description: 'Widespread denervation across multiple body regions',
      weight: 4.0,
      specificity: 0.92,
      evaluationFunction: 'evaluateWidespreadDenervation',
      severityLevels: {
        mild: 2,    // 2 regiones afectadas
        moderate: 3, // 3 regiones afectadas
        severe: 4   // 4+ regiones afectadas (cervical, torácica, lumbosacra, bulbar)
      }
    },
    {
      id: 'active_chronic_denervation_coexistence',
      description: 'Coexistence of active and chronic denervation signs',
      weight: 3.8,
      specificity: 0.95,
      evaluationFunction: 'evaluateActiveChronicDenervation',
      severityLevels: {
        mild: 'limited_regions',
        moderate: 'multiple_regions', 
        severe: 'all_regions'
      }
    },
    {
      id: 'preserved_sensory_function',
      description: 'Preserved sensory nerve function (motor-predominant pattern)',
      weight: 3.0,
      specificity: 0.88,
      evaluationFunction: 'evaluatePreservedSensoryFunction'
    },
    {
      id: 'fasciculations_presence',
      description: 'Presence of fasciculations (spontaneous motor unit firing)',
      weight: 2.5,
      specificity: 0.75,
      evaluationFunction: 'evaluateFasciculations'
    },
    {
      id: 'progressive_pattern',
      description: 'Progressive pattern with increasing severity over time',
      weight: 2.0,
      specificity: 0.70,
      evaluationFunction: 'evaluateProgressivePattern'
    },
    {
      id: 'large_neurogenic_mups',
      description: 'Large neurogenic motor unit potentials (>30ms duration, >15mV amplitude)',
      weight: 3.2,
      specificity: 0.90,
      evaluationFunction: 'evaluateLargeNeurogenicMUPs',
      severityLevels: {
        mild: { duration: 20, amplitude: 8000 },
        moderate: { duration: 25, amplitude: 12000 },
        severe: { duration: 30, amplitude: 15000 }
      }
    },
    {
      id: 'bulbar_involvement',
      description: 'Evidence of bulbar muscle involvement',
      weight: 3.5,
      specificity: 0.93,
      evaluationFunction: 'evaluateBulbarInvolvement'
    },
    {
      id: 'respiratory_muscle_involvement',
      description: 'Evidence of respiratory muscle involvement',
      weight: 3.0,
      specificity: 0.85,
      evaluationFunction: 'evaluateRespiratoryInvolvement'
    },
    {
      id: 'absence_conduction_block',
      description: 'Absence of significant conduction blocks or slowing',
      weight: 2.2,
      specificity: 0.80,
      evaluationFunction: 'evaluateAbsenceConductionBlock'
    },
    {
      id: 'motor_unit_instability',
      description: 'Motor unit instability and variability in morphology',
      weight: 2.8,
      specificity: 0.82,
      evaluationFunction: 'evaluateMotorUnitInstability'
    }
  ]
};

// Diagnósticos diferenciales enriquecidos
export const DIFFERENTIAL_DIAGNOSES = {
  neuropathic: {
    acute_denervation: [
      'Trauma agudo de nervio periférico',
      'Síndrome de Guillain-Barré (variante axonal)',
      'Radiculopatía aguda',
      'Mononeuropatía aguda',
      'Plexopatía traumática'
    ],
    chronic_reinnervation: [
      'Compresión nerviosa crónica',
      'Enfermedad de motoneurona',
      'Neuropatía hereditaria',
      'Radiculopatía crónica',
      'Secuelas de poliomielitis'
    ],
    general: [
      'Neuropatía periférica',
      'Radiculopatía',
      'Plexopatía',
      'Mononeuropatía múltiple'
    ]
  },
  axonal: [
    'Neuropatía diabética',
    'Neuropatía alcohólica',
    'Neuropatía tóxica',
    'Neuropatía nutricional',
    'Síndrome de Guillain-Barré (variante axonal)',
    'Neuropatía crítica del paciente',
    'Vasculitis con afectación nerviosa'
  ],
  demyelinating: [
    'Síndrome de Guillain-Barré (variante desmielinizante)',
    'Polineuropatía desmielinizante inflamatoria crónica (PDIC)',
    'Neuropatía hereditaria con predisposición a parálisis por presión',
    'Síndrome de túnel carpiano severo',
    'Neuropatía desmielinizante hereditaria (CMT tipo 1)',
    'Gammapatía monoclonal con neuropatía',
    'Neuropatía multifocal motora'
  ],
  myopathic: [
    'Miopatía inflamatoria (polimiositis, dermatomiositis)',
    'Distrofia muscular',
    'Miopatía metabólica',
    'Miopatía mitocondrial',
    'Miopatía inducida por fármacos/tóxicos',
    'Miopatía endocrina (hipertiroidismo, hipotiroidismo)',
    'Miopatía por depósito (amiloidosis)',
    'Miastenia gravis (en casos selectos)'
  ],
  
  // 🔥 NUEVO - PRIORIDAD 4: Diagnósticos diferenciales para enfermedad de motoneurona
  motor_neuron_disease: [
    'Esclerosis Lateral Amiotrófica (ELA) - forma clásica',
    'ELA de inicio bulbar',
    'ELA de inicio espinal',
    'Atrofia Muscular Espinal (AME) del adulto',
    'Enfermedad de Kennedy (AMEX)',
    'Atrofia muscular progresiva',
    'Esclerosis lateral primaria',
    'Parálisis bulbar progresiva',
    'Enfermedad de motoneurona multifocal',
    'Síndrome post-polio',
    'Mielopatía cervical espondilótica con radiculopatía múltiple',
    'Polirradiculopatía desmielinizante inflamatoria crónica (PDIC) - variante motora',
    'Neuropatía motora multifocal con bloqueos de conducción'
  ]
};

// Recomendaciones específicas y accionables
export const CLINICAL_RECOMMENDATIONS = {
  neuropathic: {
    acute_denervation: [
      'Considerar estudio de seguimiento en 3-4 semanas para evaluar signos de reinervación',
      'Evaluación neurológica urgente si sospecha de síndrome de Guillain-Barré',
      'Investigar historia de trauma reciente o procedimientos invasivos',
      'Considerar resonancia magnética si se sospecha radiculopatía',
      'Evaluar función respiratoria si afectación es generalizada'
    ],
    chronic_reinnervation: [
      'Considerar estudio de neuroconducción comparativo con extremidad contralateral',
      'Evaluación de enfermedad de motoneurona si patrón es generalizado',
      'Investigar compresión crónica y considerar liberación quirúrgica',
      'Seguimiento electromiográfico en 6-12 meses',
      'Evaluación genética si historia familiar positiva'
    ],
    general: [
      'Correlacionar con estudios de conducción nerviosa',
      'Evaluación clínica neurológica completa',
      'Considerar estudios de imagen según distribución'
    ]
  },
  axonal: [
    'Investigar causas metabólicas: diabetes, deficiencias vitamínicas',
    'Historia detallada de exposición a tóxicos y medicamentos',
    'Evaluación de función renal y hepática',
    'Considerar biopsia de nervio si etiología unclear',
    'Seguimiento de progresión con estudios seriados',
    'Optimización del control glucémico si diabético'
  ],
  demyelinating: [
    'Considerar punción lumbar para análisis de LCR',
    'Evaluación inmunológica completa',
    'Descartar gammapatía monoclonal',
    'Considerar tratamiento inmunosupresor si PDIC',
    'Vigilar función respiratoria si síndrome de Guillain-Barré',
    'Evaluación genética si sospecha de neuropatía hereditaria'
  ],
  myopathic: [
    'Medición de enzimas musculares (CK, LDH, aldolasa)',
    'Evaluación de función tiroidea',
    'Considerar biopsia muscular si diagnóstico unclear',
    'Revisión de medicamentos potencialmente miotóxicos',
    'Evaluación cardiológica si sospecha de miopatía sistémica',
    'Estudios metabólicos si sospecha de miopatía metabólica'
  ],
  
  // 🔥 NUEVO - PRIORIDAD 4: Recomendaciones para enfermedad de motoneurona
  motor_neuron_disease: [
    '🚨 URGENTE: Referencia inmediata a neurólogo especialista en enfermedades de motoneurona',
    'Evaluación respiratoria completa (espirometría, gasometría arterial)',
    'Evaluación de función bulbar (disfagia, disartria)',
    'Resonancia magnética cerebral y medular para descartar causas estructurales',
    'Punción lumbar si sospecha de proceso inflamatorio',
    'Estudios genéticos si historia familiar positiva o sospecha de AME/Kennedy',
    'Evaluación multidisciplinaria: neumología, nutrición, fisioterapia',
    'Planificación temprana de cuidados paliativos y directivas avanzadas',
    'Seguimiento electromiográfico cada 3-6 meses para documentar progresión',
    'Evaluación de necesidad de ventilación asistida',
    'Considerar participación en ensayos clínicos',
    'Descartar miméticos tratables: PDIC motora, neuropatía multifocal motora',
    'Evaluación de función cognitiva (ELA-DFT)',
    'Soporte psicosocial para paciente y familia'
  ]
};

// Rangos de referencia estratificados por edad para PUMs
export const AGE_STRATIFIED_REFERENCES = {
  motorUnitPotentials: {
    duration: {
      '18-39': { mean: 10.5, std: 2.3, upperLimit: 15 },
      '40-59': { mean: 11.8, std: 2.8, upperLimit: 17 },
      '60-79': { mean: 13.2, std: 3.2, upperLimit: 19 },
      '80+': { mean: 14.5, std: 3.5, upperLimit: 21 }
    },
    amplitude: {
      '18-39': { mean: 8.5, std: 4.2, lowerLimit: 2.0 },
      '40-59': { mean: 7.8, std: 4.0, lowerLimit: 1.8 },
      '60-79': { mean: 6.9, std: 3.5, lowerLimit: 1.5 },
      '80+': { mean: 5.8, std: 3.0, lowerLimit: 1.2 }
    }
  }
};

// 🔥 NUEVOS RANGOS FISIOLÓGICOS PARA VALIDACIÓN
export interface PhysiologicalRanges {
  ncs: {
    motor: {
      latency: { min: number; max: number; unit: string };
      amplitude: { min: number; max: number; unit: string };
      velocity: { min: number; max: number; unit: string };
    };
    sensory: {
      latency: { min: number; max: number; unit: string };
      amplitude: { min: number; max: number; unit: string };
      velocity: { min: number; max: number; unit: string };
    };
  };
  emg: {
    motorUnitPotentials: {
      duration: { min: number; max: number; unit: string };
      amplitude: { min: number; max: number; unit: string };
      polyphasia: { min: number; max: number; unit: string };
    };
    temperature: { min: number; max: number; unit: string };
  };
  general: {
    age: { min: number; max: number; unit: string };
    height: { min: number; max: number; unit: string };
    weight: { min: number; max: number; unit: string };
  };
}

// Rangos fisiológicos basados en literatura médica y práctica clínica
export const PHYSIOLOGICAL_RANGES: PhysiologicalRanges = {
  ncs: {
    motor: {
      // Latencias distales motoras típicas
      latency: { min: 1.0, max: 15.0, unit: 'ms' },
      // Amplitudes CMAP (Compound Muscle Action Potential)
      amplitude: { min: 0.1, max: 50.0, unit: 'mV' },
      // Velocidades de conducción motora
      velocity: { min: 25.0, max: 80.0, unit: 'm/s' }
    },
    sensory: {
      // Latencias distales sensitivas típicas
      latency: { min: 1.0, max: 10.0, unit: 'ms' },
      // Amplitudes SNAP (Sensory Nerve Action Potential)
      amplitude: { min: 1.0, max: 200.0, unit: 'μV' },
      // Velocidades de conducción sensitiva
      velocity: { min: 25.0, max: 80.0, unit: 'm/s' }
    }
  },
  emg: {
    motorUnitPotentials: {
      // Duración de potenciales de unidad motora
      duration: { min: 2.0, max: 50.0, unit: 'ms' },
      // Amplitud de potenciales de unidad motora
      amplitude: { min: 50.0, max: 15000.0, unit: 'μV' },
      // Porcentaje de polifasia
      polyphasia: { min: 0.0, max: 100.0, unit: '%' }
    },
    // Temperatura corporal durante el estudio
    temperature: { min: 30.0, max: 40.0, unit: '°C' }
  },
  general: {
    // Edad del paciente
    age: { min: 0, max: 120, unit: 'años' },
    // Altura del paciente
    height: { min: 30, max: 250, unit: 'cm' },
    // Peso del paciente
    weight: { min: 1, max: 300, unit: 'kg' }
  }
};

// Validación de severidad basada en desviaciones de rangos normales
export interface SeverityThresholds {
  mild: { factor: number; description: string };
  moderate: { factor: number; description: string };
  severe: { factor: number; description: string };
  critical: { factor: number; description: string };
}

export const SEVERITY_THRESHOLDS: SeverityThresholds = {
  mild: { factor: 1.5, description: '1.5x fuera del rango normal' },
  moderate: { factor: 2.0, description: '2x fuera del rango normal' },
  severe: { factor: 3.0, description: '3x fuera del rango normal' },
  critical: { factor: 5.0, description: '5x fuera del rango normal o más' }
};

// Tipos de errores de validación fisiológica
export type ValidationSeverity = 'info' | 'warning' | 'error' | 'critical';

export interface ValidationResult {
  isValid: boolean;
  severity: ValidationSeverity;
  message: string;
  expectedRange: string;
  actualValue: number;
  field: string;
  suggestions?: string[];
}

// Funciones auxiliares para validación
export function getAgeCategory(age: number): keyof typeof AGE_STRATIFIED_REFERENCES.motorUnitPotentials.duration {
  if (age < 40) return '18-39';
  if (age < 60) return '40-59';
  if (age < 80) return '60-79';
  return '80+';
}

export function calculateSeverityLevel(value: number, range: { min: number; max: number }): keyof SeverityThresholds | null {
  const isOutsideRange = value < range.min || value > range.max;
  if (!isOutsideRange) return null;

  const deviation = Math.max(
    range.min > 0 ? Math.abs(value - range.min) / range.min : Math.abs(value - range.min),
    range.max > 0 ? Math.abs(value - range.max) / range.max : Math.abs(value - range.max)
  );

  if (deviation >= SEVERITY_THRESHOLDS.critical.factor) return 'critical';
  if (deviation >= SEVERITY_THRESHOLDS.severe.factor) return 'severe';
  if (deviation >= SEVERITY_THRESHOLDS.moderate.factor) return 'moderate';
  return 'mild';
}

// ========== NUEVOS CRITERIOS: ENFERMEDAD DE NEURONA MOTORA SUPERIOR ==========
export const upper_motor_neuron_disease = {
  name: 'Enfermedad de Neurona Motora Superior',
  description: 'Patrones característicos de afectación de la neurona motora superior',
  criteria: [
    {
      id: 'spasticity',
      description: 'Espasticidad significativa (escala Ashworth modificada > 2)',
      weight: 0.25,
      specificity: 0.85,
      evaluationFunction: 'evaluateSpasticity'
    },
    {
      id: 'hyperreflexia',
      description: 'Hiperreflexia presente',
      weight: 0.20,
      specificity: 0.80,
      evaluationFunction: 'evaluateHyperreflexia'
    },
    {
      id: 'babinski_sign',
      description: 'Signo de Babinski positivo',
      weight: 0.15,
      specificity: 0.90,
      evaluationFunction: 'evaluateBabinskiSign'
    },
    {
      id: 'clonus',
      description: 'Clonus presente',
      weight: 0.15,
      specificity: 0.85,
      evaluationFunction: 'evaluateClonus'
    },
    {
      id: 'weakness_pattern',
      description: 'Patrón de debilidad piramidal',
      weight: 0.15,
      specificity: 0.75,
      evaluationFunction: 'evaluateWeaknessPattern'
    },
    {
      id: 'muscle_tone',
      description: 'Tono muscular aumentado',
      weight: 0.10,
      specificity: 0.70,
      evaluationFunction: 'evaluateMuscleTone'
    }
  ],
  severity: {
    mild: { minScore: 0.4, maxScore: 0.6 },
    moderate: { minScore: 0.6, maxScore: 0.8 },
    severe: { minScore: 0.8, maxScore: 1.0 }
  },
  clinicalCorrelation: {
    symptoms: [
      'Debilidad muscular progresiva',
      'Espasticidad',
      'Hiperreflexia',
      'Signo de Babinski positivo',
      'Clonus',
      'Dificultad para caminar'
    ],
    distribution: [
      'Afectación bilateral',
      'Predominio en músculos extensores de brazos',
      'Predominio en músculos flexores de piernas',
      'Patrón descendente'
    ],
    emgFindings: [
      'Actividad EMG normal en reposo',
      'Patrón de reclutamiento reducido',
      'Unidades motoras normales o ligeramente aumentadas',
      'Velocidades de conducción normales'
    ]
  }
};

// ========== NUEVOS CRITERIOS: ENFERMEDAD DE NEURONA MOTORA INFERIOR ==========
export const lower_motor_neuron_disease = {
  name: 'Enfermedad de Neurona Motora Inferior',
  description: 'Patrones característicos de afectación de la neurona motora inferior',
  criteria: [
    {
      id: 'fasciculations',
      description: 'Fasciculaciones presentes',
      weight: 0.20,
      specificity: 0.85,
      evaluationFunction: 'evaluateFasciculations'
    },
    {
      id: 'muscle_atrophy',
      description: 'Atrofia muscular significativa',
      weight: 0.20,
      specificity: 0.80,
      evaluationFunction: 'evaluateMuscleAtrophy'
    },
    {
      id: 'hyporeflexia',
      description: 'Hiporreflexia o arreflexia',
      weight: 0.15,
      specificity: 0.75,
      evaluationFunction: 'evaluateHyporeflexia'
    },
    {
      id: 'fibrillations',
      description: 'Fibrilaciones presentes en EMG',
      weight: 0.15,
      specificity: 0.90,
      evaluationFunction: 'evaluateFibrillations'
    },
    {
      id: 'positive_sharp_waves',
      description: 'Ondas agudas positivas en EMG',
      weight: 0.15,
      specificity: 0.85,
      evaluationFunction: 'evaluatePositiveSharpWaves'
    },
    {
      id: 'enlarged_motor_units',
      description: 'Unidades motoras aumentadas de tamaño',
      weight: 0.15,
      specificity: 0.80,
      evaluationFunction: 'evaluateEnlargedMotorUnits'
    }
  ],
  severity: {
    mild: { minScore: 0.4, maxScore: 0.6 },
    moderate: { minScore: 0.6, maxScore: 0.8 },
    severe: { minScore: 0.8, maxScore: 1.0 }
  },
  clinicalCorrelation: {
    symptoms: [
      'Debilidad muscular progresiva',
      'Atrofia muscular',
      'Fasciculaciones',
      'Calambres musculares',
      'Hiporreflexia o arreflexia'
    ],
    distribution: [
      'Afectación focal o multifocal',
      'Progresión asimétrica',
      'Puede ser segmentaria'
    ],
    emgFindings: [
      'Actividad espontánea anormal (fibrilaciones, ondas agudas)',
      'Fasciculaciones',
      'Unidades motoras aumentadas',
      'Patrón de reclutamiento reducido',
      'Velocidades de conducción pueden estar reducidas'
    ]
  }
};

// ========== NUEVOS CRITERIOS: ESCLEROSIS LATERAL AMIOTRÓFICA (ELA) ==========
export const amyotrophic_lateral_sclerosis = {
  name: 'Esclerosis Lateral Amiotrófica (ELA)',
  description: 'Criterios diagnósticos para ELA (combinación de neurona motora superior e inferior)',
  criteria: [
    {
      id: 'upper_motor_neuron_signs',
      description: 'Signos de neurona motora superior en múltiples regiones',
      weight: 0.25,
      specificity: 0.90,
      evaluationFunction: 'evaluateUpperMotorNeuronSigns'
    },
    {
      id: 'lower_motor_neuron_signs',
      description: 'Signos de neurona motora inferior en múltiples regiones',
      weight: 0.25,
      specificity: 0.85,
      evaluationFunction: 'evaluateLowerMotorNeuronSigns'
    },
    {
      id: 'progressive_weakness',
      description: 'Debilidad progresiva documentada',
      weight: 0.20,
      specificity: 0.80,
      evaluationFunction: 'evaluateProgressiveWeakness'
    },
    {
      id: 'bulbar_involvement',
      description: 'Afectación bulbar (disartria, disfagia)',
      weight: 0.15,
      specificity: 0.85,
      evaluationFunction: 'evaluateBulbarInvolvement'
    },
    {
      id: 'respiratory_involvement',
      description: 'Afectación respiratoria',
      weight: 0.15,
      specificity: 0.90,
      evaluationFunction: 'evaluateRespiratoryInvolvement'
    }
  ],
  severity: {
    mild: { minScore: 0.5, maxScore: 0.7 },
    moderate: { minScore: 0.7, maxScore: 0.85 },
    severe: { minScore: 0.85, maxScore: 1.0 }
  },
  clinicalCorrelation: {
    symptoms: [
      'Debilidad progresiva de múltiples grupos musculares',
      'Atrofia muscular',
      'Fasciculaciones generalizadas',
      'Espasticidad',
      'Disartria y disfagia (formas bulbares)',
      'Dificultad respiratoria (etapas avanzadas)'
    ],
    distribution: [
      'Afectación de múltiples regiones corporales',
      'Progresión desde focal a generalizada',
      'Puede iniciar en extremidades o región bulbar'
    ],
    emgFindings: [
      'Denervación aguda y crónica',
      'Fasciculaciones generalizadas',
      'Reinervación (unidades motoras gigantes)',
      'Afectación de múltiples territorios nerviosos',
      'Conducción nerviosa relativamente preservada'
    ]
  }
}; 