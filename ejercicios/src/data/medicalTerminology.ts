/**
 * DICCIONARIO DE TERMINOLOGÍA MÉDICA PARA ELECTRODIAGNÓSTICO
 * ==========================================================
 * 
 * Sistema centralizado de sinónimos para reconocimiento inteligente
 * de secciones y parámetros en informes de EMG y neuroconducción.
 * 
 * Basado en terminología estándar de electrodiagnóstico clínico.
 */

export interface MedicalTerminology {
  // Secciones principales del informe
  sectionNCS: string[];
  sectionEMG: string[];
  sectionPatient: string[];
  sectionConclusions: string[];
  sectionSpecialStudies: string[];
  
  // Parámetros de neuroconducción
  parameterLatency: string[];
  parameterAmplitude: string[];
  parameterVelocity: string[];
  parameterDistance: string[];
  parameterDuration: string[];
  
  // Tipos de estudios
  motorStudy: string[];
  sensoryStudy: string[];
  mixedStudy: string[];
  
  // Estudios especiales
  fWave: string[];
  hReflex: string[];
  blinkReflex: string[];
  rns: string[];
  
  // Nervios principales
  nerveNames: string[];
  
  // Músculos principales
  muscleNames: string[];
  
  // Actividad EMG
  insertionalActivity: string[];
  spontaneousActivity: string[];
  recruitmentPattern: string[];
  
  // Lados del cuerpo
  bodySides: string[];
  
  // Estados/resultados
  normalResults: string[];
  abnormalResults: string[];
  
  // Indicadores de tablas
  tableIndicators: string[];
}

export const MEDICAL_TERMINOLOGY: MedicalTerminology = {
  // ========== SECCIONES PRINCIPALES ==========
  
  sectionNCS: [
    // Español
    'Estudio de Conducción Nerviosa',
    'Estudios de Neuroconducción',
    'Neuroconducción',
    'VCN',
    'Conducción Nerviosa',
    'Electroconducción',
    'Estudios Electrofisiológicos',
    'Conducción Motora',
    'Conducción Sensitiva',
    'Motor Side-To-Side',
    'Sensory Side-To-Side',
    'Comparativa Bilateral',
    'Tabla Comparativa',
    
    // Inglés
    'Nerve Conduction Studies',
    'NCS',
    'NCV',
    'Nerve Conduction Velocity',
    'Motor NCS',
    'Sensory NCS',
    'Conduction Studies',
    'Neurophysiology',
    'Electrodiagnostic Studies',
    'Motor Side-To-Side Comparison',
    'Sensory Side-To-Side Comparison',
    'Bilateral Comparison Table',
    'Motor Nerve Conduction',
    'Sensory Nerve Conduction'
  ],

  sectionEMG: [
    // Español
    'Electromiografía',
    'EMG',
    'EMG con Aguja',
    'Electromiografía de Aguja',
    'Needle EMG',
    'Actividad Espontánea',
    'Análisis de PUM',
    'Potenciales de Unidad Motora',
    'Reclutamiento',
    'Actividad Insertiva',
    'EMG Summary',
    'Resumen EMG',
    
    // Inglés
    'Electromyography',
    'Needle EMG Exam',
    'Needle Examination',
    'EMG Examination',
    'Spontaneous Activity',
    'Motor Unit Potentials',
    'MUP Analysis',
    'Recruitment Pattern',
    'Insertional Activity',
    'EMG Findings',
    'Needle EMG Summary'
  ],

  sectionPatient: [
    // Español
    'Datos del Paciente',
    'Información del Paciente',
    'Paciente',
    'Demografía',
    'Historia Clínica',
    'Antecedentes',
    'Información Personal',
    
    // Inglés
    'Patient Information',
    'Patient Data',
    'Demographics',
    'Patient Demographics',
    'Clinical History',
    'Medical History',
    'Personal Information'
  ],

  sectionConclusions: [
    // Español
    'Impresión Diagnóstica',
    'Conclusión',
    'Conclusiones',
    'Interpretación',
    'Resumen',
    'Diagnóstico',
    'Impresión',
    'Resultados',
    'Hallazgos',
    'Interpretación Clínica',
    
    // Inglés
    'Diagnostic Impression',
    'Conclusion',
    'Conclusions',
    'Interpretation',
    'Summary',
    'Clinical Impression',
    'Findings',
    'Results',
    'Clinical Interpretation',
    'Final Impression'
  ],

  sectionSpecialStudies: [
    // Español
    'Estudios Especiales',
    'Estudios Complementarios',
    'Pruebas Especiales',
    'Estudios Adicionales',
    
    // Inglés
    'Special Studies',
    'Additional Studies',
    'Specialized Testing',
    'Supplementary Studies'
  ],

  // ========== PARÁMETROS DE NEUROCONDUCCIÓN ==========

  parameterLatency: [
    // Español
    'Latencia',
    'Latencia Distal',
    'Latencia Pico',
    'Latencia de Inicio',
    'Lat',
    'LMD',
    'LSD',
    'LatOn',
    'Lat.',
    
    // Inglés
    'Latency',
    'Distal Latency',
    'Peak Latency',
    'Onset Latency',
    'DL',
    'Lat',
    'LatOn',
    'ms',
    'milliseconds'
  ],

  parameterAmplitude: [
    // Español
    'Amplitud',
    'Amplitud Pico',
    'Amplitud Basal',
    'Amp',
    'CMAP',
    'PAMC',
    'SNAP',
    'PANS',
    'B-PAmp',
    'Amp.',
    
    // Inglés
    'Amplitude',
    'Peak Amplitude',
    'Baseline Amplitude',
    'B-PAmp',
    'CMAP',
    'SNAP',
    'mV',
    'µV',
    'microvolts',
    'millivolts'
  ],

  parameterVelocity: [
    // Español
    'Velocidad',
    'Velocidad de Conducción',
    'VC',
    'VCN',
    'VCM',
    'VCS',
    'Veloc',
    'Vel',
    
    // Inglés
    'Velocity',
    'Conduction Velocity',
    'CV',
    'NCV',
    'MCV',
    'SCV',
    'm/s',
    'meters per second'
  ],

  parameterDistance: [
    // Español
    'Distancia',
    'Dist',
    'Longitud',
    'Segmento',
    
    // Inglés
    'Distance',
    'Dist',
    'Length',
    'Segment',
    'mm',
    'cm',
    'millimeters',
    'centimeters'
  ],

  parameterDuration: [
    // Español
    'Duración',
    'Dur',
    'Ancho',
    'Anchura',
    
    // Inglés
    'Duration',
    'Width',
    'Dur',
    'ms',
    'milliseconds'
  ],

  // ========== TIPOS DE ESTUDIOS ==========

  motorStudy: [
    // Español
    'Motor',
    'Motora',
    'Conducción Motora',
    'Estudio Motor',
    'NCS Motor',
    'VCN Motor',
    
    // Inglés
    'Motor',
    'Motor Conduction',
    'Motor Study',
    'Motor NCS',
    'Motor Nerve Conduction'
  ],

  sensoryStudy: [
    // Español
    'Sensitivo',
    'Sensitiva',
    'Sensorial',
    'Conducción Sensitiva',
    'Estudio Sensitivo',
    'NCS Sensitivo',
    'VCN Sensitivo',
    
    // Inglés
    'Sensory',
    'Sensory Conduction',
    'Sensory Study',
    'Sensory NCS',
    'Sensory Nerve Conduction'
  ],

  mixedStudy: [
    // Español
    'Mixto',
    'Mixta',
    'Nervio Mixto',
    
    // Inglés
    'Mixed',
    'Mixed Nerve'
  ],

  // ========== ESTUDIOS ESPECIALES ==========

  fWave: [
    // Español
    'Onda F',
    'Ondas F',
    'F-Wave',
    'Estudio de Onda F',
    'Reflejo F',
    
    // Inglés
    'F-Wave',
    'F Wave',
    'F-Response',
    'F Wave Study',
    'F-Wave Study'
  ],

  hReflex: [
    // Español
    'Reflejo H',
    'H-Reflex',
    'Onda H',
    'Respuesta H',
    
    // Inglés
    'H-Reflex',
    'H Reflex',
    'H-Response',
    'H Wave'
  ],

  blinkReflex: [
    // Español
    'Reflejo de Parpadeo',
    'Reflejo Palpebral',
    'Blink Reflex',
    'Reflejo del Parpadeo',
    
    // Inglés
    'Blink Reflex',
    'Blink Response',
    'Eyelid Reflex'
  ],

  rns: [
    // Español
    'Estimulación Repetitiva',
    'ENR',
    'Estimulación Nerviosa Repetitiva',
    'RNS',
    'Prueba de Estimulación Repetitiva',
    
    // Inglés
    'Repetitive Nerve Stimulation',
    'RNS',
    'Repetitive Stimulation',
    'Repetitive Testing'
  ],

  // ========== NERVIOS PRINCIPALES ==========

  nerveNames: [
    // Español
    'Mediano', 'Nervio Mediano', 'N. Mediano',
    'Ulnar', 'Cubital', 'Nervio Ulnar', 'N. Ulnar', 'N. Cubital',
    'Radial', 'Nervio Radial', 'N. Radial',
    'Peroneo', 'Peroneal', 'Nervio Peroneo', 'N. Peroneo',
    'Tibial', 'Nervio Tibial', 'N. Tibial',
    'Sural', 'Nervio Sural', 'N. Sural',
    'Femoral', 'Nervio Femoral', 'N. Femoral',
    'Ciático', 'Nervio Ciático', 'N. Ciático',
    'Safeno', 'Nervio Safeno', 'N. Safeno',
    
    // Inglés
    'Median', 'Median Nerve',
    'Ulnar', 'Ulnar Nerve',
    'Radial', 'Radial Nerve',
    'Peroneal', 'Fibular', 'Peroneal Nerve', 'Fibular Nerve',
    'Tibial', 'Tibial Nerve',
    'Sural', 'Sural Nerve',
    'Femoral', 'Femoral Nerve',
    'Sciatic', 'Sciatic Nerve',
    'Saphenous', 'Saphenous Nerve'
  ],

  // ========== MÚSCULOS PRINCIPALES ==========

  muscleNames: [
    // Español - Músculos del brazo
    'Abductor Corto del Pulgar', 'ACP', 'Abd Poll Br',
    'Primer Interóseo Dorsal', '1er Interóseo', 'PID',
    'Flexor Carpi Radialis', 'FCR',
    'Pronador Redondo', 'Pron Teres',
    'Deltoides', 'Deltoid',
    'Bíceps', 'Bíceps Braquial',
    'Tríceps', 'Tríceps Braquial',
    
    // Inglés - Músculos del brazo
    'Abductor Pollicis Brevis', 'APB',
    'First Dorsal Interosseous', 'FDI',
    'Flexor Carpi Radialis', 'FCR',
    'Pronator Teres', 'PT',
    'Deltoid',
    'Biceps', 'Biceps Brachii',
    'Triceps', 'Triceps Brachii',
    
    // Español - Músculos de la pierna
    'Tibial Anterior', 'TA',
    'Gastrocnemio', 'Gastrocnemius',
    'Abductor del Dedo Gordo', 'AH',
    'Tensor de la Fascia Lata', 'TFL',
    
    // Inglés - Músculos de la pierna
    'Tibialis Anterior', 'TA',
    'Gastrocnemius',
    'Abductor Hallucis', 'AH',
    'Tensor Fasciae Latae', 'TFL'
  ],

  // ========== ACTIVIDAD EMG ==========

  insertionalActivity: [
    // Español
    'Actividad Insertiva',
    'Act. Insertiva',
    'Insertiva',
    'Normal',
    'Aumentada',
    'Prolongada',
    'Disminuida',
    'Ausente',
    
    // Inglés
    'Insertional Activity',
    'Insertional',
    'Normal',
    'Increased',
    'Prolonged',
    'Decreased',
    'Absent'
  ],

  spontaneousActivity: [
    // Español
    'Actividad Espontánea',
    'Act. Espontánea',
    'Espontánea',
    'Fibrilaciones',
    'Ondas Positivas',
    'Fasciculaciones',
    'Descargas Complejas',
    
    // Inglés
    'Spontaneous Activity',
    'Spontaneous',
    'Fibrillations',
    'Positive Waves',
    'Fasciculations',
    'Complex Discharges'
  ],

  recruitmentPattern: [
    // Español
    'Patrón de Reclutamiento',
    'Reclutamiento',
    'Normal',
    'Reducido',
    'Incompleto',
    'Completo',
    'Temprano',
    'Discreto',
    'Pobre',
    
    // Inglés
    'Recruitment Pattern',
    'Recruitment',
    'Normal',
    'Reduced',
    'Incomplete',
    'Complete',
    'Early',
    'Discrete',
    'Poor'
  ],

  // ========== LADOS DEL CUERPO ==========

  bodySides: [
    // Español
    'Izquierdo', 'Izq', 'I', 'L',
    'Derecho', 'Der', 'D', 'R',
    'Bilateral', 'Ambos', 'B',
    'Left', 'Right',
    
    // Inglés
    'Left', 'L',
    'Right', 'R',
    'Bilateral', 'Both', 'B'
  ],

  // ========== ESTADOS/RESULTADOS ==========

  normalResults: [
    // Español
    'Normal',
    'Dentro de límites normales',
    'Sin alteraciones',
    'Preservado',
    'Conservado',
    'Adecuado',
    'WNL',
    
    // Inglés
    'Normal',
    'Within Normal Limits',
    'WNL',
    'Preserved',
    'Adequate',
    'Unremarkable'
  ],

  abnormalResults: [
    // Español
    'Anormal',
    'Alterado',
    'Patológico',
    'Disminuido',
    'Aumentado',
    'Prolongado',
    'Reducido',
    'Ausente',
    'Severo',
    'Moderado',
    'Leve',
    
    // Inglés
    'Abnormal',
    'Altered',
    'Pathological',
    'Decreased',
    'Increased',
    'Prolonged',
    'Reduced',
    'Absent',
    'Severe',
    'Moderate',
    'Mild'
  ],

  // ========== INDICADORES DE TABLAS ==========

  tableIndicators: [
    // Español
    'Tabla',
    'Cuadro',
    'Comparativa',
    'Resumen',
    'Valores',
    'Resultados',
    'Datos',
    'Mediciones',
    
    // Inglés
    'Table',
    'Summary',
    'Comparison',
    'Values',
    'Results',
    'Data',
    'Measurements',
    'Findings'
  ]
};

/**
 * UTILIDADES PARA BÚSQUEDA DE TÉRMINOS
 */

export class TerminologyMatcher {
  
  /**
   * Busca si algún término de una categoría está presente en el texto
   */
  static findInCategory(text: string, category: keyof MedicalTerminology): boolean {
    const terms = MEDICAL_TERMINOLOGY[category];
    return terms.some(term => 
      new RegExp(`\\b${this.escapeRegex(term)}\\b`, 'i').test(text)
    );
  }

  /**
   * Encuentra todos los términos de una categoría presentes en el texto
   */
  static findAllInCategory(text: string, category: keyof MedicalTerminology): string[] {
    const terms = MEDICAL_TERMINOLOGY[category];
    return terms.filter(term => 
      new RegExp(`\\b${this.escapeRegex(term)}\\b`, 'i').test(text)
    );
  }

  /**
   * Busca la posición de la primera ocurrencia de términos de una categoría
   */
  static findPositionInCategory(text: string, category: keyof MedicalTerminology): {
    term: string;
    position: number;
    lineNumber: number;
  } | null {
    const terms = MEDICAL_TERMINOLOGY[category];
    
    for (const term of terms) {
      const regex = new RegExp(`\\b${this.escapeRegex(term)}\\b`, 'i');
      const match = text.match(regex);
      
      if (match && typeof match.index !== 'undefined') {
        const position = match.index;
        const lineNumber = text.substring(0, position).split('\n').length;
        
        return {
          term,
          position,
          lineNumber
        };
      }
    }
    
    return null;
  }

  /**
   * Escapa caracteres especiales de regex
   */
  private static escapeRegex(string: string): string {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  /**
   * Verifica si un texto contiene indicadores de tabla
   */
  static isTableSection(text: string): boolean {
    return this.findInCategory(text, 'tableIndicators');
  }

  /**
   * Verifica si un texto es una sección de neuroconducción
   */
  static isNCSSection(text: string): boolean {
    return this.findInCategory(text, 'sectionNCS');
  }

  /**
   * Verifica si un texto es una sección de EMG
   */
  static isEMGSection(text: string): boolean {
    return this.findInCategory(text, 'sectionEMG');
  }

  /**
   * Detecta el tipo de estudio (motor/sensitivo)
   */
  static detectStudyType(text: string): 'motor' | 'sensory' | 'mixed' | 'unknown' {
    if (this.findInCategory(text, 'motorStudy')) return 'motor';
    if (this.findInCategory(text, 'sensoryStudy')) return 'sensory';
    if (this.findInCategory(text, 'mixedStudy')) return 'mixed';
    return 'unknown';
  }

  /**
   * Extrae nombres de nervios del texto
   */
  static extractNerveNames(text: string): string[] {
    return this.findAllInCategory(text, 'nerveNames');
  }

  /**
   * Extrae nombres de músculos del texto
   */
  static extractMuscleNames(text: string): string[] {
    return this.findAllInCategory(text, 'muscleNames');
  }
}

export default MEDICAL_TERMINOLOGY; 