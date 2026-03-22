import { ReferenceValueRange } from '../types/ncs';

export interface SpecialStudyDefinition {
  id: string;
  name: string;
  category: 'late_responses' | 'repetitive_stimulation' | 'conduction_block' | 'reflex_studies' | 'single_fiber' | 'specialized';
  type: 'h_reflex' | 'f_wave' | 'blink_reflex' | 'rns' | 'sfemg' | 'jitter' | 'blocking' | 'collision' | 'other';
  description: string;
  clinicalIndications: string[];
  parameters: string[];
  referenceValues: Record<string, ReferenceValueRange>;
  units: Record<string, string>;
  sideOptions: ('left' | 'right' | 'bilateral')[];
  diagnosticValue: 'high' | 'medium' | 'low';
  technicalComplexity: 'basic' | 'intermediate' | 'advanced';
}

// Base de datos expandida de estudios especiales para neurofisiología
export const specialStudiesDatabase: SpecialStudyDefinition[] = [
  // ==================== RESPUESTAS TARDÍAS ====================
  {
    id: 'h_reflex_soleus',
    name: 'Reflejo H - Sóleo',
    category: 'late_responses',
    type: 'h_reflex',
    description: 'Evalúa la integridad del arco reflejo monosináptico S1',
    clinicalIndications: [
      'Sospecha de radiculopatía S1',
      'Polineuropatía simétrica distal',
      'Evaluación de neuropatía diabética'
    ],
    parameters: ['latency', 'amplitude', 'bilateralDelay', 'hmaxMmax'],
    referenceValues: {
      latency: { min: 28, max: 35 },
      amplitude: { min: 0.3, max: 5.0 },
      bilateralDelay: { min: 0, max: 1.5 },
      hmaxMmax: { min: 0.15, max: 0.80 }
    },
    units: { 
      latency: 'ms', 
      amplitude: 'mV', 
      bilateralDelay: 'ms',
      hmaxMmax: 'ratio'
    },
    sideOptions: ['left', 'right'],
    diagnosticValue: 'high',
    technicalComplexity: 'intermediate'
  },
  {
    id: 'h_reflex_tibial',
    name: 'Reflejo H - Tibial Posterior',
    category: 'late_responses',
    type: 'h_reflex',
    description: 'Evaluación alternativa del reflejo H usando estimulación del tibial posterior',
    clinicalIndications: [
      'Cuando el reflejo H del sóleo no es obtenible',
      'Radiculopatía L5-S1',
      'Síndrome de cauda equina'
    ],
    parameters: ['latency', 'amplitude', 'bilateralDelay'],
    referenceValues: {
      latency: { min: 30, max: 37 },
      amplitude: { min: 0.2, max: 4.0 },
      bilateralDelay: { min: 0, max: 2.0 }
    },
    units: { latency: 'ms', amplitude: 'mV', bilateralDelay: 'ms' },
    sideOptions: ['left', 'right'],
    diagnosticValue: 'medium',
    technicalComplexity: 'intermediate'
  },
  {
    id: 'blink_reflex_r1_r2',
    name: 'Reflejo de Parpadeo (R1/R2)',
    category: 'reflex_studies',
    type: 'blink_reflex',
    description: 'Evalúa la función del trigémino y facial mediante estimulación supraorbitaria',
    clinicalIndications: [
      'Parálisis facial periférica vs central',
      'Lesiones del tronco cerebral',
      'Neuropatía del trigémino',
      'Síndrome del ángulo pontocerebeloso'
    ],
    parameters: ['r1Latency', 'r2IpsilateralLatency', 'r2ContralateralLatency', 'r1R2Difference'],
    referenceValues: {
      r1Latency: { min: 9, max: 14 },
      r2IpsilateralLatency: { min: 28, max: 45 },
      r2ContralateralLatency: { min: 28, max: 45 },
      r1R2Difference: { min: 0, max: 1.2 }
    },
    units: { 
      r1Latency: 'ms', 
      r2IpsilateralLatency: 'ms', 
      r2ContralateralLatency: 'ms',
      r1R2Difference: 'ms'
    },
    sideOptions: ['left', 'right'],
    diagnosticValue: 'high',
    technicalComplexity: 'advanced'
  },
  {
    id: 'f_wave_median',
    name: 'Onda F - Nervio Mediano',
    category: 'late_responses',
    type: 'f_wave',
    description: 'Evalúa la conducción proximal del nervio mediano',
    clinicalIndications: [
      'Síndrome del túnel carpiano severo',
      'Radiculopatía cervical C6-C8',
      'Plexopatía braquial',
      'Polineuropatía desmielinizante'
    ],
    parameters: ['minLatency', 'meanLatency', 'chronodispersion', 'persistence'],
    referenceValues: {
      minLatency: { min: 24, max: 31 },
      meanLatency: { min: 26, max: 33 },
      chronodispersion: { min: 0, max: 4.0 },
      persistence: { min: 80, max: 100 }
    },
    units: { 
      minLatency: 'ms', 
      meanLatency: 'ms', 
      chronodispersion: 'ms',
      persistence: '%'
    },
    sideOptions: ['left', 'right'],
    diagnosticValue: 'high',
    technicalComplexity: 'basic'
  },
  {
    id: 'f_wave_ulnar',
    name: 'Onda F - Nervio Cubital',
    category: 'late_responses',
    type: 'f_wave',
    description: 'Evalúa la conducción proximal del nervio cubital',
    clinicalIndications: [
      'Neuropatía cubital en túnel del cúbito',
      'Radiculopatía cervical C8-T1',
      'Síndrome de salida torácica',
      'Lesión del plexo braquial inferior'
    ],
    parameters: ['minLatency', 'meanLatency', 'chronodispersion', 'persistence'],
    referenceValues: {
      minLatency: { min: 24, max: 32 },
      meanLatency: { min: 26, max: 34 },
      chronodispersion: { min: 0, max: 4.0 },
      persistence: { min: 80, max: 100 }
    },
    units: { 
      minLatency: 'ms', 
      meanLatency: 'ms', 
      chronodispersion: 'ms',
      persistence: '%'
    },
    sideOptions: ['left', 'right'],
    diagnosticValue: 'high',
    technicalComplexity: 'basic'
  },
  {
    id: 'f_wave_peroneal',
    name: 'Onda F - Nervio Peroneo',
    category: 'late_responses',
    type: 'f_wave',
    description: 'Evalúa la conducción proximal del nervio peroneo común',
    clinicalIndications: [
      'Radiculopatía L4-L5',
      'Lesión del nervio peroneo en cabeza del peroné',
      'Plexopatía lumbosacra',
      'Polineuropatía con afectación motora'
    ],
    parameters: ['minLatency', 'meanLatency', 'chronodispersion', 'persistence'],
    referenceValues: {
      minLatency: { min: 44, max: 56 },
      meanLatency: { min: 46, max: 58 },
      chronodispersion: { min: 0, max: 5.0 },
      persistence: { min: 80, max: 100 }
    },
    units: { 
      minLatency: 'ms', 
      meanLatency: 'ms', 
      chronodispersion: 'ms',
      persistence: '%'
    },
    sideOptions: ['left', 'right'],
    diagnosticValue: 'medium',
    technicalComplexity: 'basic'
  },

  // ==================== ESTIMULACIÓN REPETITIVA ====================
  {
    id: 'rns_trapezius_3hz',
    name: 'Estimulación Repetitiva 3Hz - Trapecio',
    category: 'repetitive_stimulation',
    type: 'rns',
    description: 'Test de fatiga muscular para detectar trastornos de la unión neuromuscular',
    clinicalIndications: [
      'Sospecha de miastenia gravis',
      'Síndrome miasténico de Lambert-Eaton',
      'Botulismo',
      'Miastenia congénita'
    ],
    parameters: ['baselineAmplitude', 'decrementPercentage', 'postExerciseAmplitude', 'facilitation'],
    referenceValues: {
      baselineAmplitude: { min: 2.0, max: 15.0 },
      decrementPercentage: { min: 0, max: 8 },
      postExerciseAmplitude: { min: 1.0, max: 20.0 },
      facilitation: { min: 0, max: 40 }
    },
    units: { 
      baselineAmplitude: 'mV', 
      decrementPercentage: '%', 
      postExerciseAmplitude: 'mV',
      facilitation: '%'
    },
    sideOptions: ['left', 'right'],
    diagnosticValue: 'high',
    technicalComplexity: 'intermediate'
  },
  {
    id: 'rns_anconeus_50hz',
    name: 'Estimulación Repetitiva 50Hz - Ancóneo',
    category: 'repetitive_stimulation',
    type: 'rns',
    description: 'Test de alta frecuencia para síndrome de Lambert-Eaton',
    clinicalIndications: [
      'Síndrome miasténico de Lambert-Eaton',
      'Síndromes paraneoplásicos',
      'Botulismo',
      'Intoxicación por aminoglucósidos'
    ],
    parameters: ['baselineAmplitude', 'incrementPercentage', 'maxIncrement', 'plateauTime'],
    referenceValues: {
      baselineAmplitude: { min: 1.0, max: 8.0 },
      incrementPercentage: { min: 0, max: 40 },
      maxIncrement: { min: 0, max: 300 },
      plateauTime: { min: 2, max: 8 }
    },
    units: { 
      baselineAmplitude: 'mV', 
      incrementPercentage: '%', 
      maxIncrement: '%',
      plateauTime: 's'
    },
    sideOptions: ['left', 'right'],
    diagnosticValue: 'high',
    technicalComplexity: 'advanced'
  },

  // ==================== ESTUDIOS DE BLOQUEO DE CONDUCCIÓN ====================
  {
    id: 'conduction_block_ulnar',
    name: 'Bloqueo de Conducción - Nervio Cubital',
    category: 'conduction_block',
    type: 'blocking',
    description: 'Evaluación detallada de bloqueo de conducción en segmentos específicos',
    clinicalIndications: [
      'Neuropatía multifocal motora',
      'CIDP (polineuropatía desmielinizante inflamatoria crónica)',
      'Neuropatía por compresión severa',
      'Vasculitis con afectación nerviosa'
    ],
    parameters: ['proximalAmplitude', 'distalAmplitude', 'blockPercentage', 'temporalDispersion'],
    referenceValues: {
      proximalAmplitude: { min: 4.0, max: 25.0 },
      distalAmplitude: { min: 4.0, max: 25.0 },
      blockPercentage: { min: 0, max: 15 },
      temporalDispersion: { min: 0, max: 15 }
    },
    units: { 
      proximalAmplitude: 'mV', 
      distalAmplitude: 'mV', 
      blockPercentage: '%',
      temporalDispersion: '%'
    },
    sideOptions: ['left', 'right'],
    diagnosticValue: 'high',
    technicalComplexity: 'advanced'
  },

  // ==================== ELECTROMIOGRAFÍA DE FIBRA ÚNICA ====================
  {
    id: 'sfemg_edc',
    name: 'EMG Fibra Única - Extensor Común de Dedos',
    category: 'single_fiber',
    type: 'sfemg',
    description: 'Medición del jitter neuromuscular para detectar trastornos de la unión',
    clinicalIndications: [
      'Miastenia gravis con RNS normal',
      'Formas oculares de miastenia',
      'Seguimiento del tratamiento miasténico',
      'Diagnóstico diferencial de debilidad fluctuante'
    ],
    parameters: ['meanJitter', 'individualJitter', 'blockingPercentage', 'fiberDensity'],
    referenceValues: {
      meanJitter: { min: 0, max: 34 },
      individualJitter: { min: 0, max: 55 },
      blockingPercentage: { min: 0, max: 5 },
      fiberDensity: { min: 1.0, max: 1.6 }
    },
    units: { 
      meanJitter: 'μs', 
      individualJitter: 'μs', 
      blockingPercentage: '%',
      fiberDensity: 'ratio'
    },
    sideOptions: ['left', 'right'],
    diagnosticValue: 'high',
    technicalComplexity: 'advanced'
  },

  // ==================== ESTUDIOS ESPECIALIZADOS ====================
  {
    id: 'collision_study',
    name: 'Estudio de Colisión',
    category: 'specialized',
    type: 'collision',
    description: 'Evalúa la conducción anterógrada vs retrógrada en casos de bloqueo parcial',
    clinicalIndications: [
      'Diferenciación entre bloqueo de conducción y pérdida axonal',
      'Neuropatía multifocal motora',
      'Lesiones nerviosas traumáticas',
      'Evaluación post-quirúrgica de reparación nerviosa'
    ],
    parameters: ['antegradeLatency', 'retrogradeLatency', 'collisionPoint', 'conductionVelocity'],
    referenceValues: {
      antegradeLatency: { min: 2.0, max: 15.0 },
      retrogradeLatency: { min: 2.0, max: 15.0 },
      collisionPoint: { min: 10, max: 90 },
      conductionVelocity: { min: 40, max: 70 }
    },
    units: { 
      antegradeLatency: 'ms', 
      retrogradeLatency: 'ms', 
      collisionPoint: '%',
      conductionVelocity: 'm/s'
    },
    sideOptions: ['left', 'right'],
    diagnosticValue: 'medium',
    technicalComplexity: 'advanced'
  },
  {
    id: 'sympathetic_skin_response',
    name: 'Respuesta Simpática de la Piel',
    category: 'specialized',
    type: 'other',
    description: 'Evalúa la función del sistema nervioso autónomo periférico',
    clinicalIndications: [
      'Neuropatía autonómica diabética',
      'Síndrome de Guillain-Barré con disautonomía',
      'Neuropatía de fibras pequeñas',
      'Evaluación post-trasplante'
    ],
    parameters: ['latency', 'amplitude', 'duration', 'bilateralDelay'],
    referenceValues: {
      latency: { min: 1.2, max: 2.5 },
      amplitude: { min: 0.1, max: 5.0 },
      duration: { min: 1.0, max: 5.0 },
      bilateralDelay: { min: 0, max: 0.3 }
    },
    units: { 
      latency: 's', 
      amplitude: 'mV', 
      duration: 's',
      bilateralDelay: 's'
    },
    sideOptions: ['left', 'right', 'bilateral'],
    diagnosticValue: 'medium',
    technicalComplexity: 'intermediate'
  }
];

// Categorías organizadas para mejor UX
export const specialStudiesCategories = {
  late_responses: {
    name: 'Respuestas Tardías',
    description: 'Ondas F, reflejos H y respuestas tardías',
    icon: 'Activity',
    color: 'blue'
  },
  reflex_studies: {
    name: 'Estudios de Reflejos',
    description: 'Reflejos polisináticos y monosináticos',
    icon: 'Zap',
    color: 'yellow'
  },
  repetitive_stimulation: {
    name: 'Estimulación Repetitiva',
    description: 'Tests para trastornos de la unión neuromuscular',
    icon: 'RotateCcw',
    color: 'green'
  },
  conduction_block: {
    name: 'Bloqueo de Conducción',
    description: 'Evaluación de bloqueos focales y dispersión temporal',
    icon: 'AlertTriangle',
    color: 'red'
  },
  single_fiber: {
    name: 'Fibra Única',
    description: 'EMG de fibra única y análisis de jitter',
    icon: 'Target',
    color: 'purple'
  },
  specialized: {
    name: 'Estudios Especializados',
    description: 'Técnicas avanzadas y especializadas',
    icon: 'Settings',
    color: 'gray'
  }
};

// Función de utilidad para obtener estudios por categoría
export const getStudiesByCategory = (category: keyof typeof specialStudiesCategories) => {
  return specialStudiesDatabase.filter(study => study.category === category);
};

// Función para obtener estudios recomendados según indicaciones clínicas
export const getRecommendedStudies = (clinicalIndication: string) => {
  return specialStudiesDatabase.filter(study => 
    study.clinicalIndications.some(indication => 
      indication.toLowerCase().includes(clinicalIndication.toLowerCase())
    )
  );
}; 