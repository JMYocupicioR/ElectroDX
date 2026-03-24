// Datos para la calculadora diagnóstica del plexo braquial
// Basado en el HTML de plexopatía braquial v2

export interface MusculoClave {
  nombre: string;
  peso: number;
}

export interface SeveridadLesion {
  grado: 1 | 2 | 3 | 4 | 5; // Clasificación de Sunderland
  descripcion: string;
  pronostico: 'excelente' | 'bueno' | 'reservado' | 'malo';
  tiempoRecuperacion: string;
  tratamientoRecomendado: string;
}

export interface AnalisisTemporal {
  faseEvolutiva: 'hiperaguda' | 'aguda' | 'subaguda' | 'cronica';
  tiempoEvolucion?: number; // días desde inicio
  patronEvolucion?: 'mejorando' | 'estable' | 'deteriorando';
  factoresPronostico: string[];
}

export interface IndicadoresConfianza {
  nivelConfianza: number; // 0-100%
  factoresPositivos: string[];
  factoresNegativos: string[];
  recomendacionesAdicionales: string[];
  necesidadEstudios: boolean;
  estudiosRecomendados?: string[];
}

export interface Lesion {
  nombre: string;
  musculosClave: MusculoClave[];
  nerviosPerifericos: string[];
  areasSensibilidad: string[];
  sintomasClave: string[];
  reflejosClave: {
    bicipital: 'normal' | 'disminuido' | 'ausente';
    braquiorradial: 'normal' | 'disminuido' | 'ausente';
    tricipital: 'normal' | 'disminuido' | 'ausente';
  };
  exclusivos: boolean;
  umbralMinimo?: number;
  categoria: 'radicular' | 'tronco' | 'fasciculo' | 'nervio_periferico' | 'combinada' | 'obstetrica' | 'traumatica' | 'iatrogena';
  severidadEsperada?: SeveridadLesion;
  contextoClinico?: {
    mecanismoFrecuente: string[];
    edadTipica: string;
    factoresRiesgo: string[];
  };
}

export interface ConfiguracionDiagnostica {
  PESO_MUSCULOS: number;
  PESO_SENSIBILIDAD: number;
  PESO_SINTOMAS: number;
  PESO_REFLEJOS: number;
  PESO_HORNER: number;
  UMBRAL_COINCIDENCIA_GENERAL: number;
  UMBRAL_MINIMO_EXCLUSIVO: number;
  PENALIZACION_MUSCULO_NORMAL: number;
}

export const CONFIG: ConfiguracionDiagnostica = {
  PESO_MUSCULOS: 4,
  PESO_SENSIBILIDAD: 1.5,
  PESO_SINTOMAS: 0.5,
  PESO_REFLEJOS: 1.5,
  PESO_HORNER: 2,
  UMBRAL_COINCIDENCIA_GENERAL: 0.3,
  UMBRAL_MINIMO_EXCLUSIVO: 0.7,
  PENALIZACION_MUSCULO_NORMAL: 0.8
};

// Configuraciones adaptativas por contexto clínico
export const CONFIG_CONTEXTUAL = {
  traumatico: {
    PESO_MUSCULOS: 4.5,
    PESO_SENSIBILIDAD: 1.2,
    PESO_SINTOMAS: 0.8,
    PESO_REFLEJOS: 1.8,
    PESO_HORNER: 2.5,
    UMBRAL_COINCIDENCIA_GENERAL: 0.25,
    UMBRAL_MINIMO_EXCLUSIVO: 0.6,
    PENALIZACION_MUSCULO_NORMAL: 0.7
  },
  obstetrico: {
    PESO_MUSCULOS: 4.2,
    PESO_SENSIBILIDAD: 1.0,
    PESO_SINTOMAS: 0.3,
    PESO_REFLEJOS: 2.0,
    PESO_HORNER: 3.0,
    UMBRAL_COINCIDENCIA_GENERAL: 0.35,
    UMBRAL_MINIMO_EXCLUSIVO: 0.75,
    PENALIZACION_MUSCULO_NORMAL: 0.9
  },
  iatrogeno: {
    PESO_MUSCULOS: 3.8,
    PESO_SENSIBILIDAD: 1.8,
    PESO_SINTOMAS: 0.4,
    PESO_REFLEJOS: 1.3,
    PESO_HORNER: 1.5,
    UMBRAL_COINCIDENCIA_GENERAL: 0.4,
    UMBRAL_MINIMO_EXCLUSIVO: 0.8,
    PENALIZACION_MUSCULO_NORMAL: 0.85
  },
  idiopatico: {
    PESO_MUSCULOS: 3.5,
    PESO_SENSIBILIDAD: 2.0,
    PESO_SINTOMAS: 0.7,
    PESO_REFLEJOS: 1.2,
    PESO_HORNER: 1.8,
    UMBRAL_COINCIDENCIA_GENERAL: 0.45,
    UMBRAL_MINIMO_EXCLUSIVO: 0.85,
    PENALIZACION_MUSCULO_NORMAL: 0.9
  }
};

// Ajustes por tiempo de evolución
export const AJUSTES_TEMPORALES = {
  hiperaguda: { // < 24 horas
    multiplicadorMuscular: 0.8, // Los músculos pueden no mostrar debilidad aún
    multiplicadorSensorial: 1.2, // Los síntomas sensoriales son más prominentes
    umbralAjuste: -0.1
  },
  aguda: { // 1-7 días
    multiplicadorMuscular: 1.0,
    multiplicadorSensorial: 1.0,
    umbralAjuste: 0
  },
  subaguda: { // 1-12 semanas
    multiplicadorMuscular: 1.2, // Patrón muscular más definido
    multiplicadorSensorial: 0.9,
    umbralAjuste: 0.05
  },
  cronica: { // > 12 semanas
    multiplicadorMuscular: 1.3, // Patrón bien establecido
    multiplicadorSensorial: 0.7, // Síntomas sensoriales pueden mejorar
    umbralAjuste: 0.1
  }
};

export const MUSCULOS_EVALUACION = [
  'Deltoides',
  'Supraespinoso',
  'Infraespinoso',
  'Redondo Menor',
  'Bíceps Braquial',
  'Tríceps Braquial',
  'Braquial',
  'Braquiorradial',
  'Extensor Carpi Radialis',
  'Extensor de los Dedos',
  'Extensor Carpi Ulnaris',
  'Extensor Largo del Pulgar',
  'Flexor Carpi Radialis',
  'Flexor Carpi Ulnaris',
  'Flexor Profundo de los Dedos',
  'Flexor Largo del Pulgar',
  'Pronador Redondo',
  'Pronador Cuadrado',
  'Supinador',
  'Interóseos Dorsales',
  'Interóseos Palmares',
  'Lumbricales 1 y 2',
  'Lumbricales 3 y 4',
  'Abductor del Meñique',
  'Oponente del Meñique',
  'Flexor Corto del Meñique',
  'Abductor Corto del Pulgar',
  'Aductor del Pulgar',
  'Flexor Corto del Pulgar',
  'Subclavio',
  'Romboides',
  'Elevador Escápula',
  'Serrato Anterior',
  'Pectoral Mayor (Porción Clavicular)',
  'Dorsal Ancho',
  'Trapecio Superior'
];

// Agrupación de músculos por región anatómica para mejor UX
export const MUSCULOS_POR_REGION = {
  'Hombro y Escápula': [
    'Deltoides',
    'Supraespinoso',
    'Infraespinoso',
    'Redondo Menor',
    'Trapecio Superior',
    'Romboides',
    'Elevador Escápula',
    'Serrato Anterior',
    'Pectoral Mayor (Porción Clavicular)',
    'Dorsal Ancho',
    'Subclavio'
  ],
  'Brazo': [
    'Bíceps Braquial',
    'Tríceps Braquial',
    'Braquial'
  ],
  'Antebrazo': [
    'Braquiorradial',
    'Extensor Carpi Radialis',
    'Extensor de los Dedos',
    'Extensor Carpi Ulnaris',
    'Extensor Largo del Pulgar',
    'Flexor Carpi Radialis',
    'Flexor Carpi Ulnaris',
    'Flexor Profundo de los Dedos',
    'Flexor Largo del Pulgar',
    'Pronador Redondo',
    'Pronador Cuadrado',
    'Supinador'
  ],
  'Mano': [
    'Interóseos Dorsales',
    'Interóseos Palmares',
    'Lumbricales 1 y 2',
    'Lumbricales 3 y 4',
    'Abductor del Meñique',
    'Oponente del Meñique',
    'Flexor Corto del Meñique',
    'Abductor Corto del Pulgar',
    'Aductor del Pulgar',
    'Flexor Corto del Pulgar'
  ]
};

// Músculos esenciales para evaluación rápida
export const MUSCULOS_ESENCIALES = [
  'Deltoides',
  'Supraespinoso',
  'Bíceps Braquial',
  'Tríceps Braquial',
  'Braquiorradial',
  'Extensor de los Dedos',
  'Flexor Carpi Radialis',
  'Flexor Carpi Ulnaris',
  'Interóseos Dorsales',
  'Abductor del Meñique'
];

export const SINTOMAS_CLINICOS = [
  'Dolor Neurítico',
  'Parestesias',
  'Signo de Horner',
  'Escápula Alada',
  'Atrofia Muscular',
  'Signo de Tinel',
  'Fasciculaciones',
  'Mano en Garra',
  'Mano en Predicador',
  'Muñeca Caída',
  'Disautonomía Locorregional'
];

export const AREAS_SENSIBILIDAD = [
  'Zona Lateral Hombro (Axilar)',
  'Zona Lateral Antebrazo (Musculocutáneo)',
  'Zona Posterior Brazo/Antebrazo (Radial)',
  'Mano Lateral (Mediano)',
  'Mano Medial (Cubital)',
  'Zona Medial Antebrazo (Cut. Med. Antebrazo)',
  'Zona Medial Brazo (Cut. Med. Brazo)',
  'Dermatoma C5',
  'Dermatoma C6',
  'Dermatoma C7',
  'Dermatoma C8',
  'Dermatoma T1',
  'Dermatoma C4',
  'Dermatoma T2'
];

export const LESIONES: Lesion[] = [
  // Lesiones Radiculares
  {
    nombre: "Lesión de Raíz C5",
    musculosClave: [
      { nombre: "Deltoides", peso: 1.5 },
      { nombre: "Supraespinoso", peso: 1.2 },
      { nombre: "Infraespinoso", peso: 1.2 },
      { nombre: "Bíceps Braquial", peso: 1.0 },
      { nombre: "Braquial", peso: 0.8 },
      { nombre: "Subclavio", peso: 0.5 },
      { nombre: "Romboides", peso: 1.0 },
      { nombre: "Elevador Escápula", peso: 0.8 }
    ],
    nerviosPerifericos: ["N. Axilar", "N. Musculocutáneo (parcial)", "N. Supraescapular", "N. Dorsal Escápula"],
    areasSensibilidad: ["Zona Lateral Hombro (Axilar)", "Dermatoma C5"],
    sintomasClave: ["Dolor Neurítico"],
    reflejosClave: { bicipital: "disminuido", braquiorradial: "normal", tricipital: "normal" },
    exclusivos: false,
    categoria: 'radicular',
    severidadEsperada: {
      grado: 2,
      descripcion: "Lesión axonal con potencial de recuperación",
      pronostico: 'bueno',
      tiempoRecuperacion: "3-6 meses",
      tratamientoRecomendado: "Fisioterapia, manejo del dolor"
    },
    contextoClinico: {
      mecanismoFrecuente: ["Tracción del plexo", "Compresión radicular", "Hernia discal"],
      edadTipica: "Adulto joven-medio",
      factoresRiesgo: ["Deportes de contacto", "Accidentes de tráfico", "Patología cervical"]
    }
  },
  {
    nombre: "Lesión de Raíz C6",
    musculosClave: [
      { nombre: "Bíceps Braquial", peso: 1.2 },
      { nombre: "Braquiorradial", peso: 1.2 },
      { nombre: "Extensor Carpi Radialis", peso: 1.0 },
      { nombre: "Supinador", peso: 0.8 },
      { nombre: "Pronador Redondo", peso: 0.8 },
      { nombre: "Pectoral Mayor (Porción Clavicular)", peso: 0.5 }
    ],
    nerviosPerifericos: ["N. Musculocutáneo", "N. Radial (parcial)", "Raíz Lat. N. Mediano"],
    areasSensibilidad: ["Zona Lateral Antebrazo (Musculocutáneo)", "Mano Lateral (Mediano)", "Dermatoma C6"],
    sintomasClave: ["Parestesias"],
    reflejosClave: { bicipital: "disminuido", braquiorradial: "disminuido", tricipital: "normal" },
    exclusivos: false,
    categoria: 'radicular'
  },
  {
    nombre: "Lesión de Raíz C7",
    musculosClave: [
      { nombre: "Tríceps Braquial", peso: 1.5 },
      { nombre: "Extensor de los Dedos", peso: 1.2 },
      { nombre: "Extensor Carpi Radialis", peso: 1.0 },
      { nombre: "Extensor Carpi Ulnaris", peso: 1.0 },
      { nombre: "Flexor Carpi Radialis", peso: 0.8 },
      { nombre: "Pronador Redondo", peso: 0.5 },
      { nombre: "Dorsal Ancho", peso: 0.5 }
    ],
    nerviosPerifericos: ["N. Radial", "N. Mediano (parcial)"],
    areasSensibilidad: ["Zona Posterior Brazo/Antebrazo (Radial)", "Dermatoma C7"],
    sintomasClave: ["Dolor Neurítico"],
    reflejosClave: { bicipital: "normal", braquiorradial: "normal", tricipital: "disminuido" },
    exclusivos: false,
    categoria: 'radicular'
  },
  {
    nombre: "Lesión de Raíz C8",
    musculosClave: [
      { nombre: "Flexor Profundo de los Dedos", peso: 1.2 },
      { nombre: "Flexor Largo del Pulgar", peso: 1.0 },
      { nombre: "Flexor Carpi Ulnaris", peso: 1.0 },
      { nombre: "Interóseos Dorsales", peso: 0.8 },
      { nombre: "Interóseos Palmares", peso: 0.8 },
      { nombre: "Lumbricales 3 y 4", peso: 0.8 },
      { nombre: "Abductor del Meñique", peso: 0.5 },
      { nombre: "Oponente del Meñique", peso: 0.5 }
    ],
    nerviosPerifericos: ["N. Ulnar", "N. Mediano (parcial)"],
    areasSensibilidad: ["Mano Medial (Cubital)", "Zona Medial Antebrazo (Cut. Med. Antebrazo)", "Dermatoma C8"],
    sintomasClave: ["Parestesias"],
    reflejosClave: { bicipital: "normal", braquiorradial: "normal", tricipital: "normal" },
    exclusivos: false,
    categoria: 'radicular'
  },
  {
    nombre: "Lesión de Raíz T1",
    musculosClave: [
      { nombre: "Interóseos Dorsales", peso: 1.5 },
      { nombre: "Interóseos Palmares", peso: 1.5 },
      { nombre: "Lumbricales 3 y 4", peso: 1.0 },
      { nombre: "Aductor del Pulgar", peso: 1.0 },
      { nombre: "Abductor del Meñique", peso: 1.2 },
      { nombre: "Oponente del Meñique", peso: 1.2 },
      { nombre: "Flexor Corto del Meñique", peso: 1.2 }
    ],
    nerviosPerifericos: ["N. Ulnar", "Raíz Med. N. Mediano"],
    areasSensibilidad: ["Zona Medial Brazo (Cut. Med. Brazo)", "Dermatoma T1"],
    sintomasClave: ["Dolor Neurítico", "Signo de Horner"],
    reflejosClave: { bicipital: "normal", braquiorradial: "normal", tricipital: "normal" },
    exclusivos: false,
    categoria: 'radicular'
  },
  
  // Lesiones de Troncos
  {
    nombre: "Lesión de Tronco Superior (C5-C6) - Erb-Duchenne",
    musculosClave: [
      { nombre: "Deltoides", peso: 1.5 },
      { nombre: "Supraespinoso", peso: 1.2 },
      { nombre: "Infraespinoso", peso: 1.2 },
      { nombre: "Bíceps Braquial", peso: 1.5 },
      { nombre: "Braquiorradial", peso: 1.2 },
      { nombre: "Extensor Carpi Radialis", peso: 1.0 },
      { nombre: "Braquial", peso: 0.8 },
      { nombre: "Romboides", peso: 1.0 },
      { nombre: "Elevador Escápula", peso: 0.8 }
    ],
    nerviosPerifericos: ["N. Axilar", "N. Musculocutáneo", "N. Supraescapular", "N. Dorsal Escápula"],
    areasSensibilidad: ["Zona Lateral Hombro (Axilar)", "Zona Lateral Antebrazo (Musculocutáneo)", "Dermatoma C5", "Dermatoma C6"],
    sintomasClave: ["Dolor Neurítico", "Parestesias"],
    reflejosClave: { bicipital: "disminuido", braquiorradial: "disminuido", tricipital: "normal" },
    exclusivos: false,
    categoria: 'tronco',
    severidadEsperada: {
      grado: 3,
      descripcion: "Lesión del tronco superior con compromiso múltiple",
      pronostico: 'reservado',
      tiempoRecuperacion: "6-12 meses",
      tratamientoRecomendado: "Fisioterapia intensiva, considerar cirugía si no hay recuperación en 3-6 meses"
    },
    contextoClinico: {
      mecanismoFrecuente: ["Tracción del cuello", "Accidente de motocicleta", "Trauma obstétrico"],
      edadTipica: "Adulto joven o recién nacido",
      factoresRiesgo: ["Deportes de contacto", "Accidentes de tráfico", "Parto complicado"]
    }
  },
  {
    nombre: "Lesión de Tronco Inferior (C8-T1) - Klumpke",
    musculosClave: [
      { nombre: "Flexor Profundo de los Dedos", peso: 1.2 },
      { nombre: "Flexor Largo del Pulgar", peso: 1.0 },
      { nombre: "Flexor Carpi Ulnaris", peso: 1.0 },
      { nombre: "Interóseos Dorsales", peso: 1.5 },
      { nombre: "Interóseos Palmares", peso: 1.5 },
      { nombre: "Lumbricales 3 y 4", peso: 1.0 },
      { nombre: "Abductor del Meñique", peso: 1.2 },
      { nombre: "Oponente del Meñique", peso: 1.2 },
      { nombre: "Aductor del Pulgar", peso: 1.0 }
    ],
    nerviosPerifericos: ["N. Ulnar", "N. Mediano (parcial)"],
    areasSensibilidad: ["Mano Medial (Cubital)", "Zona Medial Antebrazo (Cut. Med. Antebrazo)", "Zona Medial Brazo (Cut. Med. Brazo)", "Dermatoma C8", "Dermatoma T1"],
    sintomasClave: ["Dolor Neurítico", "Parestesias", "Signo de Horner"],
    reflejosClave: { bicipital: "normal", braquiorradial: "normal", tricipital: "normal" },
    exclusivos: false,
    categoria: 'tronco',
    severidadEsperada: {
      grado: 4,
      descripcion: "Lesión del tronco inferior con compromiso simpático",
      pronostico: 'reservado',
      tiempoRecuperacion: "12-18 meses",
      tratamientoRecomendado: "Cirugía reconstructiva, transferencias nerviosas"
    },
    contextoClinico: {
      mecanismoFrecuente: ["Tracción del brazo", "Tumor de Pancoast", "Trauma de alta energía"],
      edadTipica: "Adulto",
      factoresRiesgo: ["Neoplasias apicales", "Accidentes laborales", "Violencia"]
    }
  },

  // Lesiones de Fascículos
  {
    nombre: "Lesión de Fascículo Lateral",
    musculosClave: [
      { nombre: "Bíceps Braquial", peso: 1.5 },
      { nombre: "Braquial", peso: 1.2 },
      { nombre: "Flexor Carpi Radialis", peso: 1.0 },
      { nombre: "Pronador Redondo", peso: 1.0 },
      { nombre: "Flexor Largo del Pulgar", peso: 0.8 },
      { nombre: "Flexor Profundo de los Dedos", peso: 0.5 },
      { nombre: "Pectoral Mayor (Porción Clavicular)", peso: 1.2 }
    ],
    nerviosPerifericos: ["N. Musculocutáneo", "Raíz Lateral N. Mediano", "N. Pectoral Lateral"],
    areasSensibilidad: ["Zona Lateral Antebrazo (Musculocutáneo)", "Mano Lateral (Mediano)"],
    sintomasClave: ["Parestesias"],
    reflejosClave: { bicipital: "disminuido", braquiorradial: "normal", tricipital: "normal" },
    exclusivos: false,
    categoria: 'fasciculo'
  },
  {
    nombre: "Lesión de Fascículo Medial",
    musculosClave: [
      { nombre: "Flexor Carpi Ulnaris", peso: 1.5 },
      { nombre: "Flexor Profundo de los Dedos", peso: 1.2 },
      { nombre: "Interóseos Dorsales", peso: 1.5 },
      { nombre: "Interóseos Palmares", peso: 1.5 },
      { nombre: "Lumbricales 3 y 4", peso: 1.0 },
      { nombre: "Abductor del Meñique", peso: 1.2 },
      { nombre: "Aductor del Pulgar", peso: 1.0 }
    ],
    nerviosPerifericos: ["N. Ulnar", "Raíz Medial N. Mediano"],
    areasSensibilidad: ["Mano Medial (Cubital)", "Zona Medial Antebrazo (Cut. Med. Antebrazo)", "Zona Medial Brazo (Cut. Med. Brazo)"],
    sintomasClave: ["Parestesias"],
    reflejosClave: { bicipital: "normal", braquiorradial: "normal", tricipital: "normal" },
    exclusivos: false,
    categoria: 'fasciculo'
  },
  {
    nombre: "Lesión de Fascículo Posterior",
    musculosClave: [
      { nombre: "Deltoides", peso: 1.5 },
      { nombre: "Tríceps Braquial", peso: 1.5 },
      { nombre: "Extensor de los Dedos", peso: 1.2 },
      { nombre: "Extensor Carpi Radialis", peso: 1.0 },
      { nombre: "Extensor Carpi Ulnaris", peso: 1.0 },
      { nombre: "Braquiorradial", peso: 1.0 },
      { nombre: "Supinador", peso: 0.8 },
      { nombre: "Dorsal Ancho", peso: 1.0 }
    ],
    nerviosPerifericos: ["N. Axilar", "N. Radial", "N. Toracodorsal"],
    areasSensibilidad: ["Zona Lateral Hombro (Axilar)", "Zona Posterior Brazo/Antebrazo (Radial)"],
    sintomasClave: ["Dolor Neurítico"],
    reflejosClave: { bicipital: "normal", braquiorradial: "disminuido", tricipital: "disminuido" },
    exclusivos: false,
    categoria: 'fasciculo'
  },

  // Mononeuropatías
  {
    nombre: "Neuropatía del Nervio Axilar",
    musculosClave: [
      { nombre: "Deltoides", peso: 2.0 }
    ],
    nerviosPerifericos: ["N. Axilar"],
    areasSensibilidad: ["Zona Lateral Hombro (Axilar)"],
    sintomasClave: ["Dolor Neurítico"],
    reflejosClave: { bicipital: "normal", braquiorradial: "normal", tricipital: "normal" },
    exclusivos: true,
    umbralMinimo: 0.8,
    categoria: 'nervio_periferico'
  },
  {
    nombre: "Neuropatía del Nervio Musculocutáneo",
    musculosClave: [
      { nombre: "Bíceps Braquial", peso: 2.0 },
      { nombre: "Braquial", peso: 1.5 }
    ],
    nerviosPerifericos: ["N. Musculocutáneo"],
    areasSensibilidad: ["Zona Lateral Antebrazo (Musculocutáneo)"],
    sintomasClave: ["Parestesias"],
    reflejosClave: { bicipital: "disminuido", braquiorradial: "normal", tricipital: "normal" },
    exclusivos: true,
    umbralMinimo: 0.8,
    categoria: 'nervio_periferico'
  },
  {
    nombre: "Neuropatía del Nervio Radial (Proximal)",
    musculosClave: [
      { nombre: "Tríceps Braquial", peso: 2.0 },
      { nombre: "Extensor de los Dedos", peso: 1.5 },
      { nombre: "Extensor Carpi Radialis", peso: 1.2 },
      { nombre: "Extensor Carpi Ulnaris", peso: 1.2 },
      { nombre: "Braquiorradial", peso: 1.0 },
      { nombre: "Supinador", peso: 1.0 }
    ],
    nerviosPerifericos: ["N. Radial"],
    areasSensibilidad: ["Zona Posterior Brazo/Antebrazo (Radial)"],
    sintomasClave: ["Dolor Neurítico"],
    reflejosClave: { bicipital: "normal", braquiorradial: "disminuido", tricipital: "disminuido" },
    exclusivos: true,
    umbralMinimo: 0.7,
    categoria: 'nervio_periferico'
  },
  {
    nombre: "Neuropatía del Nervio Mediano (Proximal)",
    musculosClave: [
      { nombre: "Flexor Carpi Radialis", peso: 1.5 },
      { nombre: "Pronador Redondo", peso: 1.5 },
      { nombre: "Flexor Largo del Pulgar", peso: 1.2 },
      { nombre: "Flexor Profundo de los Dedos", peso: 1.0 }
    ],
    nerviosPerifericos: ["N. Mediano"],
    areasSensibilidad: ["Mano Lateral (Mediano)"],
    sintomasClave: ["Parestesias"],
    reflejosClave: { bicipital: "normal", braquiorradial: "normal", tricipital: "normal" },
    exclusivos: true,
    umbralMinimo: 0.7,
    categoria: 'nervio_periferico'
  },
  {
    nombre: "Neuropatía del Nervio Ulnar (Proximal)",
    musculosClave: [
      { nombre: "Flexor Carpi Ulnaris", peso: 2.0 },
      { nombre: "Flexor Profundo de los Dedos", peso: 1.5 },
      { nombre: "Interóseos Dorsales", peso: 1.5 },
      { nombre: "Interóseos Palmares", peso: 1.5 },
      { nombre: "Abductor del Meñique", peso: 1.2 },
      { nombre: "Aductor del Pulgar", peso: 1.0 }
    ],
    nerviosPerifericos: ["N. Ulnar"],
    areasSensibilidad: ["Mano Medial (Cubital)", "Zona Medial Antebrazo (Cut. Med. Antebrazo)"],
    sintomasClave: ["Parestesias"],
    reflejosClave: { bicipital: "normal", braquiorradial: "normal", tricipital: "normal" },
    exclusivos: true,
    umbralMinimo: 0.7,
    categoria: 'nervio_periferico'
  },

  // LESIONES COMBINADAS Y COMPLEJAS
  {
    nombre: "Avulsión Total del Plexo Braquial (C5-T1)",
    musculosClave: [
      { nombre: "Deltoides", peso: 2.0 },
      { nombre: "Supraespinoso", peso: 1.8 },
      { nombre: "Infraespinoso", peso: 1.8 },
      { nombre: "Bíceps Braquial", peso: 2.0 },
      { nombre: "Tríceps Braquial", peso: 2.0 },
      { nombre: "Braquiorradial", peso: 1.5 },
      { nombre: "Extensor de los Dedos", peso: 1.5 },
      { nombre: "Flexor Carpi Radialis", peso: 1.5 },
      { nombre: "Flexor Carpi Ulnaris", peso: 1.5 },
      { nombre: "Interóseos Dorsales", peso: 2.0 },
      { nombre: "Interóseos Palmares", peso: 2.0 },
      { nombre: "Abductor del Meñique", peso: 1.8 },
      { nombre: "Romboides", peso: 1.2 },
      { nombre: "Elevador Escápula", peso: 1.2 }
    ],
    nerviosPerifericos: ["Todos los nervios del plexo braquial"],
    areasSensibilidad: ["Zona Lateral Hombro (Axilar)", "Zona Lateral Antebrazo (Musculocutáneo)", "Zona Posterior Brazo/Antebrazo (Radial)", "Mano Lateral (Mediano)", "Mano Medial (Cubital)", "Zona Medial Antebrazo (Cut. Med. Antebrazo)", "Zona Medial Brazo (Cut. Med. Brazo)", "Dermatoma C5", "Dermatoma C6", "Dermatoma C7", "Dermatoma C8", "Dermatoma T1"],
    sintomasClave: ["Dolor Neurítico", "Parestesias", "Signo de Horner"],
    reflejosClave: { bicipital: "ausente", braquiorradial: "ausente", tricipital: "ausente" },
    exclusivos: false,
    categoria: 'traumatica',
    severidadEsperada: {
      grado: 5,
      descripcion: "Neurotmesis completa - sin recuperación espontánea",
      pronostico: 'malo',
      tiempoRecuperacion: "Sin recuperación espontánea",
      tratamientoRecomendado: "Cirugía reconstructiva urgente, transferencias nerviosas"
    },
    contextoClinico: {
      mecanismoFrecuente: ["Accidente de motocicleta", "Trauma de alta energía", "Tracción severa"],
      edadTipica: "Adulto joven",
      factoresRiesgo: ["Accidentes de tráfico", "Deportes extremos", "Caídas de altura"]
    }
  },
  {
    nombre: "Lesión Obstétrica Erb-Duchenne + Axilar",
    musculosClave: [
      { nombre: "Deltoides", peso: 2.5 },
      { nombre: "Supraespinoso", peso: 2.0 },
      { nombre: "Infraespinoso", peso: 2.0 },
      { nombre: "Bíceps Braquial", peso: 2.0 },
      { nombre: "Braquiorradial", peso: 1.5 },
      { nombre: "Extensor Carpi Radialis", peso: 1.2 },
      { nombre: "Braquial", peso: 1.0 },
      { nombre: "Romboides", peso: 1.5 },
      { nombre: "Elevador Escápula", peso: 1.2 }
    ],
    nerviosPerifericos: ["N. Axilar", "N. Musculocutáneo", "N. Supraescapular", "N. Dorsal Escápula"],
    areasSensibilidad: ["Zona Lateral Hombro (Axilar)", "Zona Lateral Antebrazo (Musculocutáneo)", "Dermatoma C5", "Dermatoma C6"],
    sintomasClave: ["Dolor Neurítico"],
    reflejosClave: { bicipital: "ausente", braquiorradial: "disminuido", tricipital: "normal" },
    exclusivos: false,
    categoria: 'obstetrica',
    severidadEsperada: {
      grado: 3,
      descripcion: "Lesión combinada con compromiso axonal significativo",
      pronostico: 'reservado',
      tiempoRecuperacion: "6-18 meses",
      tratamientoRecomendado: "Fisioterapia precoz, considerar cirugía a los 3-6 meses"
    },
    contextoClinico: {
      mecanismoFrecuente: ["Distocia de hombros", "Parto instrumentado", "Macrosomía fetal"],
      edadTipica: "Recién nacido",
      factoresRiesgo: ["Peso fetal >4kg", "Diabetes materna", "Parto prolongado"]
    }
  },
  {
    nombre: "Lesión Traumática C8-T1 con Horner",
    musculosClave: [
      { nombre: "Flexor Profundo de los Dedos", peso: 2.0 },
      { nombre: "Flexor Largo del Pulgar", peso: 1.5 },
      { nombre: "Flexor Carpi Ulnaris", peso: 1.8 },
      { nombre: "Interóseos Dorsales", peso: 2.5 },
      { nombre: "Interóseos Palmares", peso: 2.5 },
      { nombre: "Lumbricales 3 y 4", peso: 1.5 },
      { nombre: "Abductor del Meñique", peso: 2.0 },
      { nombre: "Oponente del Meñique", peso: 2.0 },
      { nombre: "Aductor del Pulgar", peso: 1.8 }
    ],
    nerviosPerifericos: ["N. Ulnar", "N. Mediano (parcial)", "Fibras simpáticas"],
    areasSensibilidad: ["Mano Medial (Cubital)", "Zona Medial Antebrazo (Cut. Med. Antebrazo)", "Zona Medial Brazo (Cut. Med. Brazo)", "Dermatoma C8", "Dermatoma T1"],
    sintomasClave: ["Dolor Neurítico", "Parestesias", "Signo de Horner"],
    reflejosClave: { bicipital: "normal", braquiorradial: "normal", tricipital: "normal" },
    exclusivos: false,
    categoria: 'traumatica',
    severidadEsperada: {
      grado: 4,
      descripcion: "Lesión severa con compromiso de fibras simpáticas",
      pronostico: 'reservado',
      tiempoRecuperacion: "12-24 meses",
      tratamientoRecomendado: "Cirugía reconstructiva, transferencias nerviosas, manejo del dolor"
    },
    contextoClinico: {
      mecanismoFrecuente: ["Tracción del brazo", "Herida penetrante", "Tumor apical pulmonar"],
      edadTipica: "Adulto",
      factoresRiesgo: ["Accidentes laborales", "Violencia", "Neoplasias"]
    }
  },
  {
    nombre: "Lesión Iatrogénica Post-Cirugía de Hombro",
    musculosClave: [
      { nombre: "Deltoides", peso: 2.5 },
      { nombre: "Supraespinoso", peso: 1.8 },
      { nombre: "Infraespinoso", peso: 1.5 },
      { nombre: "Bíceps Braquial", peso: 1.2 },
      { nombre: "Braquial", peso: 1.0 }
    ],
    nerviosPerifericos: ["N. Axilar", "N. Musculocutáneo (parcial)", "N. Supraescapular"],
    areasSensibilidad: ["Zona Lateral Hombro (Axilar)", "Zona Lateral Antebrazo (Musculocutáneo)"],
    sintomasClave: ["Dolor Neurítico", "Parestesias"],
    reflejosClave: { bicipital: "disminuido", braquiorradial: "normal", tricipital: "normal" },
    exclusivos: false,
    categoria: 'iatrogena',
    severidadEsperada: {
      grado: 2,
      descripcion: "Lesión axonal por trauma quirúrgico",
      pronostico: 'bueno',
      tiempoRecuperacion: "3-9 meses",
      tratamientoRecomendado: "Fisioterapia, manejo del dolor, seguimiento estrecho"
    },
    contextoClinico: {
      mecanismoFrecuente: ["Artroscopia de hombro", "Cirugía de manguito rotador", "Reemplazo articular"],
      edadTipica: "Adulto medio-mayor",
      factoresRiesgo: ["Cirugía prolongada", "Posicionamiento inadecuado", "Anatomía variante"]
    }
  },
  {
    nombre: "Síndrome del Desfiladero Torácico Neurogénico",
    musculosClave: [
      { nombre: "Interóseos Dorsales", peso: 2.0 },
      { nombre: "Interóseos Palmares", peso: 2.0 },
      { nombre: "Abductor del Meñique", peso: 1.8 },
      { nombre: "Aductor del Pulgar", peso: 1.5 },
      { nombre: "Flexor Carpi Ulnaris", peso: 1.2 }
    ],
    nerviosPerifericos: ["N. Ulnar (fibras T1)", "Tronco inferior"],
    areasSensibilidad: ["Mano Medial (Cubital)", "Zona Medial Antebrazo (Cut. Med. Antebrazo)", "Dermatoma T1"],
    sintomasClave: ["Parestesias", "Dolor Neurítico"],
    reflejosClave: { bicipital: "normal", braquiorradial: "normal", tricipital: "normal" },
    exclusivos: false,
    categoria: 'combinada',
    severidadEsperada: {
      grado: 2,
      descripcion: "Compresión crónica con desmielinización",
      pronostico: 'bueno',
      tiempoRecuperacion: "2-6 meses con tratamiento",
      tratamientoRecomendado: "Fisioterapia, cirugía descompresiva si falla tratamiento conservador"
    },
    contextoClinico: {
      mecanismoFrecuente: ["Costilla cervical", "Banda fibrosa", "Hipertrofia muscular"],
      edadTipica: "Adulto joven",
      factoresRiesgo: ["Actividades repetitivas", "Deportes overhead", "Anatomía variante"]
    }
  },
  {
    nombre: "Lesión por Radiación (Plexopatía Actínica)",
    musculosClave: [
      { nombre: "Deltoides", peso: 1.5 },
      { nombre: "Bíceps Braquial", peso: 1.5 },
      { nombre: "Tríceps Braquial", peso: 1.8 },
      { nombre: "Extensor de los Dedos", peso: 1.5 },
      { nombre: "Flexor Carpi Radialis", peso: 1.2 },
      { nombre: "Interóseos Dorsales", peso: 1.8 }
    ],
    nerviosPerifericos: ["Múltiples nervios del plexo"],
    areasSensibilidad: ["Variable según nervios afectados"],
    sintomasClave: ["Parestesias", "Dolor Neurítico"],
    reflejosClave: { bicipital: "disminuido", braquiorradial: "disminuido", tricipital: "disminuido" },
    exclusivos: false,
    categoria: 'iatrogena',
    severidadEsperada: {
      grado: 3,
      descripcion: "Fibrosis progresiva post-radiación",
      pronostico: 'reservado',
      tiempoRecuperacion: "Progresivo, sin recuperación",
      tratamientoRecomendado: "Manejo sintomático, fisioterapia, manejo del dolor"
    },
    contextoClinico: {
      mecanismoFrecuente: ["Radioterapia para cáncer de mama", "Linfoma", "Sarcoma"],
      edadTipica: "Adulto medio-mayor",
      factoresRiesgo: ["Dosis alta de radiación", "Campos amplios", "Quimioterapia concomitante"]
    }
  },
  {
    nombre: "Parálisis Braquial Obstétrica Total (C5-T1)",
    musculosClave: [
      { nombre: "Deltoides", peso: 2.0 },
      { nombre: "Supraespinoso", peso: 1.8 },
      { nombre: "Bíceps Braquial", peso: 2.0 },
      { nombre: "Tríceps Braquial", peso: 2.0 },
      { nombre: "Braquiorradial", peso: 1.5 },
      { nombre: "Extensor de los Dedos", peso: 1.5 },
      { nombre: "Flexor Carpi Radialis", peso: 1.5 },
      { nombre: "Flexor Carpi Ulnaris", peso: 1.5 },
      { nombre: "Interóseos Dorsales", peso: 2.0 },
      { nombre: "Abductor del Meñique", peso: 2.0 }
    ],
    nerviosPerifericos: ["Todo el plexo braquial"],
    areasSensibilidad: ["Toda la extremidad superior"],
    sintomasClave: ["Signo de Horner"],
    reflejosClave: { bicipital: "ausente", braquiorradial: "ausente", tricipital: "ausente" },
    exclusivos: false,
    categoria: 'obstetrica',
    severidadEsperada: {
      grado: 4,
      descripcion: "Lesión severa con avulsiones múltiples",
      pronostico: 'malo',
      tiempoRecuperacion: "Limitada, requiere cirugía",
      tratamientoRecomendado: "Cirugía reconstructiva temprana, transferencias nerviosas múltiples"
    },
    contextoClinico: {
      mecanismoFrecuente: ["Distocia severa", "Parto traumático", "Maniobras obstétricas"],
      edadTipica: "Recién nacido",
      factoresRiesgo: ["Macrosomía severa", "Presentación anómala", "Trabajo de parto prolongado"]
    }
  },

  // =============================================
  // NUEVAS LESIONES AÑADIDAS - PAQUETE COMPLETO
  // =============================================

  // TRONCO MEDIO
  {
    nombre: "Lesión de Tronco Medio (C7)",
    musculosClave: [
      { nombre: "Tríceps Braquial", peso: 1.5 },
      { nombre: "Extensor de los Dedos", peso: 1.2 },
      { nombre: "Extensor Carpi Radialis", peso: 1.0 },
      { nombre: "Extensor Carpi Ulnaris", peso: 1.0 },
      { nombre: "Extensor Largo del Pulgar", peso: 1.0 },
      { nombre: "Flexor Carpi Radialis", peso: 0.8 },
      { nombre: "Pronador Redondo", peso: 0.5 },
      { nombre: "Dorsal Ancho", peso: 0.5 }
    ],
    nerviosPerifericos: ["N. Radial (parcial)", "N. Mediano (parcial)", "N. Pectoral Medial"],
    areasSensibilidad: ["Zona Posterior Brazo/Antebrazo (Radial)", "Dermatoma C7"],
    sintomasClave: ["Dolor Neurítico", "Muñeca Caída"],
    reflejosClave: { bicipital: "normal", braquiorradial: "normal", tricipital: "disminuido" },
    exclusivos: false,
    categoria: 'tronco',
    severidadEsperada: {
      grado: 2,
      descripcion: "Lesión del tronco medio con patrón de extensión comprometida",
      pronostico: 'bueno',
      tiempoRecuperacion: "3-9 meses",
      tratamientoRecomendado: "Fisioterapia, férula de muñeca, seguimiento electrofisiológico"
    },
    contextoClinico: {
      mecanismoFrecuente: ["Tracción del plexo", "Compresión directa", "Cirugía mediastinal"],
      edadTipica: "Adulto",
      factoresRiesgo: ["Trauma cerrado", "Cirugía torácica", "Posicionamiento quirúrgico"]
    }
  },

  // MONONEUROPATÍAS NUEVAS

  {
    nombre: "Neuropatía del Nervio Supraescapular",
    musculosClave: [
      { nombre: "Supraespinoso", peso: 2.0 },
      { nombre: "Infraespinoso", peso: 2.0 }
    ],
    nerviosPerifericos: ["N. Supraescapular"],
    areasSensibilidad: ["Zona Lateral Hombro (Axilar)"],
    sintomasClave: ["Dolor Neurítico", "Atrofia Muscular"],
    reflejosClave: { bicipital: "normal", braquiorradial: "normal", tricipital: "normal" },
    exclusivos: true,
    umbralMinimo: 0.75,
    categoria: 'nervio_periferico',
    severidadEsperada: {
      grado: 2,
      descripcion: "Lesión del nervio supraescapular con debilidad de rotadores",
      pronostico: 'bueno',
      tiempoRecuperacion: "3-6 meses",
      tratamientoRecomendado: "Fisioterapia, descompresión si quiste ganglionar"
    },
    contextoClinico: {
      mecanismoFrecuente: ["Quiste ganglionar en escotadura escapular", "Fractura de escápula", "Tracción repetitiva overhead"],
      edadTipica: "Adulto joven-medio",
      factoresRiesgo: ["Deportes overhead (voley, natación)", "Fractura de escápula", "Compresión por quiste"]
    }
  },
  {
    nombre: "Neuropatía del Nervio Torácico Largo",
    musculosClave: [
      { nombre: "Serrato Anterior", peso: 2.5 }
    ],
    nerviosPerifericos: ["N. Torácico Largo"],
    areasSensibilidad: [],
    sintomasClave: ["Escápula Alada", "Dolor Neurítico"],
    reflejosClave: { bicipital: "normal", braquiorradial: "normal", tricipital: "normal" },
    exclusivos: true,
    umbralMinimo: 0.7,
    categoria: 'nervio_periferico',
    severidadEsperada: {
      grado: 2,
      descripcion: "Parálisis del serrato anterior con escápula alada",
      pronostico: 'bueno',
      tiempoRecuperacion: "6-12 meses",
      tratamientoRecomendado: "Fisioterapia, observación, considerar transferencia muscular si >12 meses"
    },
    contextoClinico: {
      mecanismoFrecuente: ["Síndrome de Parsonage-Turner", "Cirugía torácica", "Esfuerzo físico intenso"],
      edadTipica: "Adulto joven",
      factoresRiesgo: ["Actividades con carga pesada", "Cirugía axilar/torácica", "Infección viral previa"]
    }
  },
  {
    nombre: "Neuropatía del Nervio Interóseo Anterior (Kiloh-Nevin)",
    musculosClave: [
      { nombre: "Flexor Largo del Pulgar", peso: 2.0 },
      { nombre: "Flexor Profundo de los Dedos", peso: 1.8 },
      { nombre: "Pronador Cuadrado", peso: 2.0 }
    ],
    nerviosPerifericos: ["N. Interóseo Anterior (rama del Mediano)"],
    areasSensibilidad: [],
    sintomasClave: ["Mano en Predicador"],
    reflejosClave: { bicipital: "normal", braquiorradial: "normal", tricipital: "normal" },
    exclusivos: true,
    umbralMinimo: 0.7,
    categoria: 'nervio_periferico',
    severidadEsperada: {
      grado: 2,
      descripcion: "Síndrome puramente motor del interóseo anterior",
      pronostico: 'bueno',
      tiempoRecuperacion: "3-6 meses",
      tratamientoRecomendado: "Observación, descompresión quirúrgica si no mejora en 3 meses"
    },
    contextoClinico: {
      mecanismoFrecuente: ["Compresión por bandas fibrosas", "Parsonage-Turner", "Fractura supracondílea"],
      edadTipica: "Adulto medio",
      factoresRiesgo: ["Variantes anatómicas", "Fractura de antebrazo proximal", "Infección viral previa"]
    }
  },
  {
    nombre: "Neuropatía del Nervio Interóseo Posterior (PIN)",
    musculosClave: [
      { nombre: "Extensor de los Dedos", peso: 2.0 },
      { nombre: "Extensor Carpi Ulnaris", peso: 1.8 },
      { nombre: "Extensor Largo del Pulgar", peso: 2.0 },
      { nombre: "Supinador", peso: 1.5 }
    ],
    nerviosPerifericos: ["N. Interóseo Posterior (rama del Radial)"],
    areasSensibilidad: [],
    sintomasClave: ["Muñeca Caída"],
    reflejosClave: { bicipital: "normal", braquiorradial: "normal", tricipital: "normal" },
    exclusivos: true,
    umbralMinimo: 0.7,
    categoria: 'nervio_periferico',
    severidadEsperada: {
      grado: 2,
      descripcion: "Lesión puramente motora del interóseo posterior",
      pronostico: 'bueno',
      tiempoRecuperacion: "3-6 meses",
      tratamientoRecomendado: "Férula de muñeca, descompresión de arcada de Fröhse si persiste"
    },
    contextoClinico: {
      mecanismoFrecuente: ["Compresión en arcada de Fröhse", "Fractura de cabeza radial", "Lipoma"],
      edadTipica: "Adulto medio",
      factoresRiesgo: ["Movimientos repetitivos de supinación", "Fractura proximal de radio", "Tumores blandos"]
    }
  },
  {
    nombre: "Neuropatía del Nervio Radial (Distal / Surco Espiral)",
    musculosClave: [
      { nombre: "Extensor de los Dedos", peso: 1.8 },
      { nombre: "Extensor Carpi Radialis", peso: 1.5 },
      { nombre: "Extensor Carpi Ulnaris", peso: 1.5 },
      { nombre: "Extensor Largo del Pulgar", peso: 1.5 },
      { nombre: "Braquiorradial", peso: 1.2 },
      { nombre: "Supinador", peso: 1.0 }
    ],
    nerviosPerifericos: ["N. Radial (distal al tríceps)"],
    areasSensibilidad: ["Zona Posterior Brazo/Antebrazo (Radial)"],
    sintomasClave: ["Muñeca Caída"],
    reflejosClave: { bicipital: "normal", braquiorradial: "disminuido", tricipital: "normal" },
    exclusivos: true,
    umbralMinimo: 0.7,
    categoria: 'nervio_periferico',
    severidadEsperada: {
      grado: 2,
      descripcion: "Lesión del radial distal con preservación del tríceps",
      pronostico: 'bueno',
      tiempoRecuperacion: "2-4 meses",
      tratamientoRecomendado: "Férula de muñeca en extensión, fisioterapia"
    },
    contextoClinico: {
      mecanismoFrecuente: ["Fractura del húmero medio", "Compresión por 'Saturday night palsy'", "Torniquete"],
      edadTipica: "Adulto",
      factoresRiesgo: ["Fractura humeral", "Intoxicación con compresión prolongada", "Posicionamiento quirúrgico"]
    }
  },
  {
    nombre: "Neuropatía del Nervio Mediano Distal (STC)",
    musculosClave: [
      { nombre: "Abductor Corto del Pulgar", peso: 2.5 },
      { nombre: "Flexor Corto del Pulgar", peso: 1.5 },
      { nombre: "Lumbricales 1 y 2", peso: 1.0 }
    ],
    nerviosPerifericos: ["N. Mediano (distal al túnel carpiano)"],
    areasSensibilidad: ["Mano Lateral (Mediano)"],
    sintomasClave: ["Parestesias", "Signo de Tinel", "Atrofia Muscular"],
    reflejosClave: { bicipital: "normal", braquiorradial: "normal", tricipital: "normal" },
    exclusivos: true,
    umbralMinimo: 0.65,
    categoria: 'nervio_periferico',
    severidadEsperada: {
      grado: 2,
      descripcion: "Compresión del mediano a nivel del túnel carpiano",
      pronostico: 'excelente',
      tiempoRecuperacion: "1-3 meses post-cirugía",
      tratamientoRecomendado: "Férula nocturna, infiltración, liberación quirúrgica"
    },
    contextoClinico: {
      mecanismoFrecuente: ["Compresión crónica", "Embarazo", "Hipotiroidismo"],
      edadTipica: "Adulto medio-mayor",
      factoresRiesgo: ["Trabajo manual repetitivo", "Diabetes", "Artritis reumatoide", "Embarazo"]
    }
  },
  {
    nombre: "Neuropatía del Nervio Ulnar a Nivel del Codo",
    musculosClave: [
      { nombre: "Flexor Carpi Ulnaris", peso: 1.8 },
      { nombre: "Flexor Profundo de los Dedos", peso: 1.5 },
      { nombre: "Interóseos Dorsales", peso: 2.0 },
      { nombre: "Interóseos Palmares", peso: 2.0 },
      { nombre: "Lumbricales 3 y 4", peso: 1.2 },
      { nombre: "Abductor del Meñique", peso: 1.8 },
      { nombre: "Aductor del Pulgar", peso: 1.5 }
    ],
    nerviosPerifericos: ["N. Ulnar (a nivel del codo)"],
    areasSensibilidad: ["Mano Medial (Cubital)", "Zona Medial Antebrazo (Cut. Med. Antebrazo)"],
    sintomasClave: ["Parestesias", "Mano en Garra", "Signo de Tinel", "Atrofia Muscular"],
    reflejosClave: { bicipital: "normal", braquiorradial: "normal", tricipital: "normal" },
    exclusivos: true,
    umbralMinimo: 0.65,
    categoria: 'nervio_periferico',
    severidadEsperada: {
      grado: 2,
      descripcion: "Neuropatía ulnar en el canal cubital",
      pronostico: 'bueno',
      tiempoRecuperacion: "3-6 meses con tratamiento",
      tratamientoRecomendado: "Protección del codo, transposición quirúrgica si severo"
    },
    contextoClinico: {
      mecanismoFrecuente: ["Compresión en canal cubital", "Subluxación del nervio", "Fractura de codo"],
      edadTipica: "Adulto",
      factoresRiesgo: ["Apoyo prolongado del codo", "Cubitus valgus", "Fractura epicondílea previa"]
    }
  },
  {
    nombre: "Neuropatía del Nervio Ulnar a Nivel de la Muñeca (Guyon)",
    musculosClave: [
      { nombre: "Interóseos Dorsales", peso: 2.0 },
      { nombre: "Interóseos Palmares", peso: 2.0 },
      { nombre: "Lumbricales 3 y 4", peso: 1.2 },
      { nombre: "Abductor del Meñique", peso: 1.8 },
      { nombre: "Aductor del Pulgar", peso: 1.5 }
    ],
    nerviosPerifericos: ["N. Ulnar (canal de Guyon)"],
    areasSensibilidad: ["Mano Medial (Cubital)"],
    sintomasClave: ["Parestesias", "Mano en Garra", "Atrofia Muscular"],
    reflejosClave: { bicipital: "normal", braquiorradial: "normal", tricipital: "normal" },
    exclusivos: true,
    umbralMinimo: 0.7,
    categoria: 'nervio_periferico',
    severidadEsperada: {
      grado: 2,
      descripcion: "Neuropatía ulnar distal en canal de Guyon",
      pronostico: 'bueno',
      tiempoRecuperacion: "2-4 meses",
      tratamientoRecomendado: "Evitar compresión, descompresión quirúrgica"
    },
    contextoClinico: {
      mecanismoFrecuente: ["Ciclismo prolongado ('handlebar palsy')", "Quiste ganglionar", "Fractura del ganchoso"],
      edadTipica: "Adulto joven-medio",
      factoresRiesgo: ["Ciclismo", "Uso de herramientas vibratorias", "Fractura de muñeca"]
    }
  },

  // COMBINACIONES FASCICULARES

  {
    nombre: "Lesión de Fascículo Lateral + Medial",
    musculosClave: [
      { nombre: "Bíceps Braquial", peso: 1.5 },
      { nombre: "Braquial", peso: 1.2 },
      { nombre: "Flexor Carpi Radialis", peso: 1.2 },
      { nombre: "Pronador Redondo", peso: 1.0 },
      { nombre: "Flexor Largo del Pulgar", peso: 1.0 },
      { nombre: "Flexor Profundo de los Dedos", peso: 1.2 },
      { nombre: "Flexor Carpi Ulnaris", peso: 1.5 },
      { nombre: "Interóseos Dorsales", peso: 1.5 },
      { nombre: "Interóseos Palmares", peso: 1.5 },
      { nombre: "Lumbricales 3 y 4", peso: 1.0 },
      { nombre: "Abductor del Meñique", peso: 1.2 },
      { nombre: "Aductor del Pulgar", peso: 1.0 },
      { nombre: "Abductor Corto del Pulgar", peso: 1.2 },
      { nombre: "Pectoral Mayor (Porción Clavicular)", peso: 1.0 }
    ],
    nerviosPerifericos: ["N. Musculocutáneo", "N. Mediano (completo)", "N. Ulnar", "N. Pectoral Lateral"],
    areasSensibilidad: ["Zona Lateral Antebrazo (Musculocutáneo)", "Mano Lateral (Mediano)", "Mano Medial (Cubital)", "Zona Medial Antebrazo (Cut. Med. Antebrazo)", "Zona Medial Brazo (Cut. Med. Brazo)"],
    sintomasClave: ["Parestesias", "Mano en Garra"],
    reflejosClave: { bicipital: "disminuido", braquiorradial: "normal", tricipital: "normal" },
    exclusivos: false,
    categoria: 'fasciculo',
    severidadEsperada: {
      grado: 3,
      descripcion: "Lesión bifascicular con compromiso mediano y ulnar completos",
      pronostico: 'reservado',
      tiempoRecuperacion: "6-12 meses",
      tratamientoRecomendado: "Cirugía reconstructiva, transferencias tendinosas"
    },
    contextoClinico: {
      mecanismoFrecuente: ["Trauma axilar penetrante", "Luxación anterior de hombro severa", "Herida por arma"],
      edadTipica: "Adulto",
      factoresRiesgo: ["Trauma penetrante", "Luxación de hombro", "Cirugía axilar"]
    }
  },
  {
    nombre: "Lesión de Fascículo Lateral + Posterior",
    musculosClave: [
      { nombre: "Deltoides", peso: 1.5 },
      { nombre: "Bíceps Braquial", peso: 1.5 },
      { nombre: "Braquial", peso: 1.2 },
      { nombre: "Tríceps Braquial", peso: 1.5 },
      { nombre: "Extensor de los Dedos", peso: 1.2 },
      { nombre: "Extensor Carpi Radialis", peso: 1.0 },
      { nombre: "Braquiorradial", peso: 1.0 },
      { nombre: "Flexor Carpi Radialis", peso: 1.0 },
      { nombre: "Pronador Redondo", peso: 1.0 },
      { nombre: "Pectoral Mayor (Porción Clavicular)", peso: 1.0 },
      { nombre: "Dorsal Ancho", peso: 0.8 }
    ],
    nerviosPerifericos: ["N. Axilar", "N. Radial", "N. Musculocutáneo", "Raíz Lateral N. Mediano", "N. Toracodorsal"],
    areasSensibilidad: ["Zona Lateral Hombro (Axilar)", "Zona Lateral Antebrazo (Musculocutáneo)", "Zona Posterior Brazo/Antebrazo (Radial)", "Mano Lateral (Mediano)"],
    sintomasClave: ["Dolor Neurítico", "Muñeca Caída"],
    reflejosClave: { bicipital: "disminuido", braquiorradial: "disminuido", tricipital: "disminuido" },
    exclusivos: false,
    categoria: 'fasciculo',
    severidadEsperada: {
      grado: 3,
      descripcion: "Lesión bifascicular con compromiso extenso proximal y extensión",
      pronostico: 'reservado',
      tiempoRecuperacion: "6-12 meses",
      tratamientoRecomendado: "Cirugía reconstructiva, transferencias nerviosas"
    },
    contextoClinico: {
      mecanismoFrecuente: ["Luxación anterior de hombro", "Trauma infraclavicular", "Fractura de clavícula"],
      edadTipica: "Adulto joven",
      factoresRiesgo: ["Trauma de alta energía", "Luxación recurrente", "Fractura clavicular"]
    }
  },

  // TRONCO COMBINADO

  {
    nombre: "Lesión de Tronco Superior + Medio (C5-C7)",
    musculosClave: [
      { nombre: "Deltoides", peso: 1.5 },
      { nombre: "Supraespinoso", peso: 1.2 },
      { nombre: "Infraespinoso", peso: 1.2 },
      { nombre: "Bíceps Braquial", peso: 1.5 },
      { nombre: "Tríceps Braquial", peso: 1.5 },
      { nombre: "Braquiorradial", peso: 1.2 },
      { nombre: "Extensor Carpi Radialis", peso: 1.0 },
      { nombre: "Extensor de los Dedos", peso: 1.2 },
      { nombre: "Extensor Carpi Ulnaris", peso: 1.0 },
      { nombre: "Braquial", peso: 0.8 },
      { nombre: "Romboides", peso: 1.0 },
      { nombre: "Elevador Escápula", peso: 0.8 },
      { nombre: "Pronador Redondo", peso: 0.5 },
      { nombre: "Flexor Carpi Radialis", peso: 0.5 }
    ],
    nerviosPerifericos: ["N. Axilar", "N. Musculocutáneo", "N. Supraescapular", "N. Radial (parcial)", "N. Mediano (parcial)"],
    areasSensibilidad: ["Zona Lateral Hombro (Axilar)", "Zona Lateral Antebrazo (Musculocutáneo)", "Zona Posterior Brazo/Antebrazo (Radial)", "Dermatoma C5", "Dermatoma C6", "Dermatoma C7"],
    sintomasClave: ["Dolor Neurítico", "Parestesias", "Muñeca Caída"],
    reflejosClave: { bicipital: "disminuido", braquiorradial: "disminuido", tricipital: "disminuido" },
    exclusivos: false,
    categoria: 'tronco',
    severidadEsperada: {
      grado: 3,
      descripcion: "Lesión extensa de tronco superior y medio - 'Erb-Duchenne extendido'",
      pronostico: 'reservado',
      tiempoRecuperacion: "6-18 meses",
      tratamientoRecomendado: "Cirugía reconstructiva, considerar transferencias nerviosas múltiples"
    },
    contextoClinico: {
      mecanismoFrecuente: ["Accidente de motocicleta severo", "Caída de altura", "Tracción cervical severa"],
      edadTipica: "Adulto joven",
      factoresRiesgo: ["Accidentes de alta energía", "Deportes de contacto", "Caída con brazo traccionado"]
    }
  },

  // PATRONES ETIOLÓGICOS ESPECIALES

  {
    nombre: "Síndrome de Parsonage-Turner (Neuralgia Amiotrófica)",
    musculosClave: [
      { nombre: "Serrato Anterior", peso: 1.8 },
      { nombre: "Deltoides", peso: 1.2 },
      { nombre: "Supraespinoso", peso: 1.5 },
      { nombre: "Infraespinoso", peso: 1.5 },
      { nombre: "Bíceps Braquial", peso: 1.0 },
      { nombre: "Tríceps Braquial", peso: 0.8 },
      { nombre: "Extensor de los Dedos", peso: 0.8 },
      { nombre: "Flexor Largo del Pulgar", peso: 1.0 },
      { nombre: "Pronador Cuadrado", peso: 1.0 }
    ],
    nerviosPerifericos: ["Múltiples nervios (distribución parchada)", "N. Torácico Largo", "N. Supraescapular", "N. Interóseo Anterior"],
    areasSensibilidad: ["Zona Lateral Hombro (Axilar)", "Dermatoma C5", "Dermatoma C6"],
    sintomasClave: ["Dolor Neurítico", "Escápula Alada", "Atrofia Muscular"],
    reflejosClave: { bicipital: "normal", braquiorradial: "normal", tricipital: "normal" },
    exclusivos: false,
    categoria: 'combinada',
    severidadEsperada: {
      grado: 3,
      descripcion: "Neuralgia amiotrófica con distribución multifocal",
      pronostico: 'bueno',
      tiempoRecuperacion: "6-24 meses (recuperación gradual)",
      tratamientoRecomendado: "Manejo del dolor, fisioterapia, considerar corticoides en fase aguda"
    },
    contextoClinico: {
      mecanismoFrecuente: ["Post-infeccioso", "Post-quirúrgico", "Post-vacunación", "Idiopático"],
      edadTipica: "Adulto joven-medio",
      factoresRiesgo: ["Infección viral previa", "Cirugía reciente", "Vacunación reciente", "Estrés físico intenso"]
    }
  },
  {
    nombre: "Plexopatía Neoplásica (Infiltración Tumoral)",
    musculosClave: [
      { nombre: "Flexor Profundo de los Dedos", peso: 1.5 },
      { nombre: "Flexor Largo del Pulgar", peso: 1.2 },
      { nombre: "Flexor Carpi Ulnaris", peso: 1.5 },
      { nombre: "Interóseos Dorsales", peso: 2.0 },
      { nombre: "Interóseos Palmares", peso: 2.0 },
      { nombre: "Abductor del Meñique", peso: 1.8 },
      { nombre: "Aductor del Pulgar", peso: 1.5 },
      { nombre: "Tríceps Braquial", peso: 0.8 },
      { nombre: "Extensor de los Dedos", peso: 0.8 }
    ],
    nerviosPerifericos: ["N. Ulnar", "N. Mediano (parcial)", "Tronco inferior", "Fibras simpáticas"],
    areasSensibilidad: ["Mano Medial (Cubital)", "Zona Medial Antebrazo (Cut. Med. Antebrazo)", "Zona Medial Brazo (Cut. Med. Brazo)", "Dermatoma C8", "Dermatoma T1"],
    sintomasClave: ["Dolor Neurítico", "Parestesias", "Signo de Horner", "Atrofia Muscular"],
    reflejosClave: { bicipital: "normal", braquiorradial: "normal", tricipital: "normal" },
    exclusivos: false,
    categoria: 'combinada',
    severidadEsperada: {
      grado: 4,
      descripcion: "Infiltración tumoral del plexo braquial inferior",
      pronostico: 'malo',
      tiempoRecuperacion: "Depende del tratamiento oncológico",
      tratamientoRecomendado: "Tratamiento oncológico, manejo del dolor, neuromodulación"
    },
    contextoClinico: {
      mecanismoFrecuente: ["Tumor de Pancoast", "Cáncer de mama", "Linfoma"],
      edadTipica: "Adulto medio-mayor",
      factoresRiesgo: ["Tabaquismo (Pancoast)", "Antecedente de cáncer", "Pérdida de peso inexplicada"]
    }
  }
];

// Tipos para los resultados del diagnóstico
export interface ResultadoDiagnostico {
  nombreLesion: string;
  score: number;
  normalizedScore: number;
  umbral: number;
  categoria: string;
  severidadEsperada?: SeveridadLesion;
  contextoClinico?: {
    mecanismoFrecuente: string[];
    edadTipica: string;
    factoresRiesgo: string[];
  };
  indicadoresConfianza?: IndicadoresConfianza;
  analisisTemporal?: AnalisisTemporal;
  detalles: {
    musculos: { nombre: string; mrc: number; esperado: boolean; peso: number }[];
    musculosInesperados?: { nombre: string; mrc: number }[];
    sensibilidad: string[];
    sintomas: string[];
    reflejos: { nombre: string; esperado: string; encontrado: string; match: boolean }[];
    nerviosPerifericos: string[];
  };
}

export interface DatosEvaluacion {
  fuerzasMuscular: { [musculo: string]: number };
  sintomasSeleccionados: string[];
  areasSeleccionadas: string[];
  reflejos: {
    bicipital: 'normal' | 'disminuido' | 'ausente';
    braquiorradial: 'normal' | 'disminuido' | 'ausente';
    tricipital: 'normal' | 'disminuido' | 'ausente';
  };
  informacionAdicional: {
    mecanismo: string;
    evolucion: string;
    tipoPlexo: 'normal' | 'prefijado' | 'postfijado';
    contextoClinico?: 'traumatico' | 'obstetrico' | 'iatrogeno' | 'idiopatico';
    tiempoEvolucion?: number; // días desde inicio
    faseEvolutiva?: 'hiperaguda' | 'aguda' | 'subaguda' | 'cronica';
    patronEvolucion?: 'mejorando' | 'estable' | 'deteriorando';
  };
}

// Opciones para los dropdowns
export const OPCIONES_REFLEJOS = [
  { label: 'Normal', value: 'normal' },
  { label: 'Disminuido', value: 'disminuido' },
  { label: 'Ausente', value: 'ausente' }
];

export const OPCIONES_MRC = [
  { label: '0 - Sin contracción', value: 0 },
  { label: '1 - Contracción visible sin movimiento', value: 1 },
  { label: '2 - Movimiento sin gravedad', value: 2 },
  { label: '3 - Movimiento contra gravedad', value: 3 },
  { label: '4 - Movimiento contra resistencia', value: 4 },
  { label: '5 - Fuerza normal', value: 5 }
];

export const OPCIONES_TIPO_PLEXO = [
  { label: 'Normal', value: 'normal' },
  { label: 'Prefijado', value: 'prefijado' },
  { label: 'Postfijado', value: 'postfijado' }
];

export const OPCIONES_CONTEXTO_CLINICO = [
  { label: 'Traumático', value: 'traumatico' },
  { label: 'Obstétrico', value: 'obstetrico' },
  { label: 'Iatrogénico', value: 'iatrogeno' },
  { label: 'Idiopático', value: 'idiopatico' }
];

export const OPCIONES_FASE_EVOLUTIVA = [
  { label: 'Hiperaguda (< 24h)', value: 'hiperaguda' },
  { label: 'Aguda (1-7 días)', value: 'aguda' },
  { label: 'Subaguda (1-12 semanas)', value: 'subaguda' },
  { label: 'Crónica (> 12 semanas)', value: 'cronica' }
];

export const OPCIONES_PATRON_EVOLUCION = [
  { label: 'Mejorando', value: 'mejorando' },
  { label: 'Estable', value: 'estable' },
  { label: 'Deteriorando', value: 'deteriorando' }
];

// Información sobre músculos con inervación dual
export interface InervacionDual {
  principal: string;
  secundario: string;
  implicacion: string;
  relevanciaClinica: string;
}

export const INERVACION_DUAL: { [musculo: string]: InervacionDual } = {
  "Braquial": {
    principal: "N. Musculocutáneo",
    secundario: "N. Radial (porción lateral)",
    implicacion: "Lesión aislada del musculocutáneo puede no paralizar completamente el músculo",
    relevanciaClinica: "En lesiones del fascículo lateral, el braquial puede mantener función parcial gracias a su inervación radial"
  },
  "Pectoral Mayor": {
    principal: "N. Pectoral Lateral (C5-C7)",
    secundario: "N. Pectoral Medial (C8-T1)",
    implicacion: "Lesión de un solo nervio pectoral puede preservar función parcial",
    relevanciaClinica: "La porción clavicular (pectoral lateral) y esternocostal (pectoral medial) pueden afectarse independientemente"
  },
  "Flexor Corto del Pulgar": {
    principal: "N. Mediano (cabeza superficial)",
    secundario: "N. Ulnar (cabeza profunda)",
    implicacion: "Doble inervación crucial para función del pulgar",
    relevanciaClinica: "En síndrome del túnel carpiano, solo se afecta la porción mediana, preservando parte de la función"
  },
  "Aductor del Pulgar": {
    principal: "N. Ulnar (rama profunda)",
    secundario: "N. Mediano (ocasionalmente)",
    implicacion: "Inervación mediana variable puede preservar función parcial",
    relevanciaClinica: "Explica por qué algunos pacientes con lesión ulnar mantienen cierta adducción del pulgar"
  },
  "Flexor Profundo de los Dedos": {
    principal: "N. Mediano (dedos 2-3)",
    secundario: "N. Ulnar (dedos 4-5)",
    implicacion: "Lesiones selectivas afectan solo algunos dedos",
    relevanciaClinica: "Patrón característico: flexión preservada en índice-medio (mediano) vs anular-meñique (ulnar)"
  },
  "Lumbricales": {
    principal: "N. Mediano (1º y 2º)",
    secundario: "N. Ulnar (3º y 4º)",
    implicacion: "Inervación dividida entre mediano y ulnar",
    relevanciaClinica: "En lesiones del mediano, se preserva la función de los lumbricales 3 y 4 (ulnar)"
  }
};

// Hallazgos de inervación dual
export interface HallazgoInervacionDual {
  musculo: string;
  mrc: number;
  info: InervacionDual;
  relevancia: 'Alta' | 'Moderada' | 'Baja';
  interpretacion: string;
}

// Explicaciones anatómicas detalladas por diagnóstico
export interface ExplicacionAnatomica {
  estructurasPrimarias: string[];
  estructurasSecundarias: string[];
  nerviosAfectados: string[];
  recorrido: {
    estructura: string;
    explicacion: string;
    icono: string;
  }[];
  explicacionMuscular: { [musculo: string]: string };
  correlacionClinica: string;
  signosCaracteristicos: string[];
  diagnosticoDiferencial: string[];
}

export const EXPLICACIONES_ANATOMICAS: { [diagnostico: string]: ExplicacionAnatomica } = {
  "Lesión de Raíz C5": {
    estructurasPrimarias: ["Raíz C5"],
    estructurasSecundarias: ["Tronco Superior", "Fascículo Lateral", "Fascículo Posterior"],
    nerviosAfectados: ["N. Axilar", "N. Musculocutáneo", "N. Supraescapular", "N. Dorsal Escápula"],
    recorrido: [
      { estructura: "Raíz C5", explicacion: "Lesión en la raíz nerviosa C5 a nivel cervical", icono: "🧠" },
      { estructura: "Tronco Superior", explicacion: "C5 contribuye al tronco superior junto con C6", icono: "🔗" },
      { estructura: "Fascículos", explicacion: "El tronco superior se divide en fascículos lateral y posterior", icono: "🌿" },
      { estructura: "Nervios Terminales", explicacion: "Compromete nervios axilar, musculocutáneo y supraescapular", icono: "⚡" }
    ],
    explicacionMuscular: {
      "Deltoides": "Inervado por nervio axilar (C5-C6) que surge del fascículo posterior",
      "Supraespinoso": "Inervado por nervio supraescapular que se origina directamente del tronco superior",
      "Infraespinoso": "También inervado por nervio supraescapular (C5-C6)",
      "Bíceps Braquial": "Inervado por nervio musculocutáneo del fascículo lateral (C5-C7)"
    },
    correlacionClinica: "La lesión de C5 produce el patrón clásico de debilidad en abducción y rotación externa del hombro, con preservación de la función de la mano.",
    signosCaracteristicos: [
      "Imposibilidad de abducción del hombro",
      "Debilidad en rotación externa",
      "Reflejo bicipital disminuido",
      "Sensibilidad alterada en dermatoma C5"
    ],
    diagnosticoDiferencial: [
      "Lesión del tronco superior (más extenso)",
      "Neuropatía axilar aislada (solo deltoides)",
      "Lesión del fascículo posterior"
    ]
  },
  "Lesión de Tronco Superior (C5-C6) - Erb-Duchenne": {
    estructurasPrimarias: ["Raíz C5", "Raíz C6", "Tronco Superior"],
    estructurasSecundarias: ["Fascículo Lateral", "Fascículo Posterior"],
    nerviosAfectados: ["N. Axilar", "N. Musculocutáneo", "N. Supraescapular", "N. Dorsal Escápula"],
    recorrido: [
      { estructura: "Raíces C5-C6", explicacion: "Lesión completa del tronco superior (parálisis Erb-Duchenne)", icono: "🧠" },
      { estructura: "Tronco Superior", explicacion: "Interrupción total del tronco formado por C5-C6", icono: "❌" },
      { estructura: "Fascículos", explicacion: "Ambos fascículos pierden contribución C5-C6", icono: "🌿" },
      { estructura: "Múltiples Nervios", explicacion: "Afectación simultánea de nervios axilar, musculocutáneo y supraescapular", icono: "⚡" }
    ],
    explicacionMuscular: {
      "Deltoides": "Parálisis completa por lesión del nervio axilar (C5-C6)",
      "Bíceps Braquial": "Parálisis por afectación del musculocutáneo (C5-C7)",
      "Braquiorradial": "Debilidad por compromiso de C6 en el nervio radial",
      "Supraespinoso": "Parálisis por lesión del supraescapular"
    },
    correlacionClinica: "Patrón clásico de Erb-Duchenne: brazo colgante, rotación interna, pronación del antebrazo ('posición de propina').",
    signosCaracteristicos: [
      "Posición característica de 'propina'",
      "Brazo en adducción y rotación interna",
      "Antebrazo en pronación",
      "Reflejos bicipital y braquiorradial ausentes"
    ],
    diagnosticoDiferencial: [
      "Lesión radicular C5 aislada (menos extenso)",
      "Lesión radicular C6 aislada (menos extenso)",
      "Lesión del fascículo lateral"
    ]
  },
  "Neuropatía del Nervio Axilar": {
    estructurasPrimarias: ["N. Axilar"],
    estructurasSecundarias: ["Fascículo Posterior"],
    nerviosAfectados: ["N. Axilar"],
    recorrido: [
      { estructura: "Fascículo Posterior", explicacion: "El nervio axilar se origina del fascículo posterior", icono: "🔗" },
      { estructura: "Cuadrilátero de Velpeau", explicacion: "El nervio pasa por el espacio cuadrangular", icono: "🔄" },
      { estructura: "Músculo Deltoides", explicacion: "Inervación exclusiva del deltoides", icono: "💪" },
      { estructura: "Zona Sensitiva", explicacion: "Sensibilidad en la región lateral del hombro", icono: "👋" }
    ],
    explicacionMuscular: {
      "Deltoides": "Único músculo afectado - pérdida completa de abducción del hombro más allá de 15°"
    },
    correlacionClinica: "Lesión típica en luxaciones de hombro o fracturas del cuello quirúrgico del húmero.",
    signosCaracteristicos: [
      "Imposibilidad de abducción del hombro",
      "Atrofia del deltoides",
      "Sensibilidad alterada en región lateral del hombro",
      "Reflejos normales"
    ],
    diagnosticoDiferencial: [
      "Lesión del tronco superior (más extenso)",
      "Lesión radicular C5 (incluye otros músculos)",
      "Ruptura del manguito rotador (supraespinoso preservado)"
    ]
  },
  "Lesión de Raíz C6": {
    estructurasPrimarias: ["Raíz C6"],
    estructurasSecundarias: ["Tronco Superior", "Fascículo Lateral"],
    nerviosAfectados: ["N. Musculocutáneo", "N. Radial (parcial)", "Raíz Lat. N. Mediano"],
    recorrido: [
      { estructura: "Raíz C6", explicacion: "Lesión en la raíz nerviosa C6 a nivel cervical", icono: "🧠" },
      { estructura: "Tronco Superior", explicacion: "C6 contribuye al tronco superior junto con C5", icono: "🔗" },
      { estructura: "Fascículo Lateral", explicacion: "La contribución C6 llega al fascículo lateral", icono: "🌿" },
      { estructura: "Nervios Terminales", explicacion: "Compromete musculocutáneo y componente radial/mediano", icono: "⚡" }
    ],
    explicacionMuscular: {
      "Bíceps Braquial": "Inervado por musculocutáneo (C5-C6) del fascículo lateral",
      "Braquiorradial": "Inervado por nervio radial con contribución C6 prominente",
      "Extensor Carpi Radialis": "Inervado por radial (C6-C7), componente C6 predominante"
    },
    correlacionClinica: "Patrón de debilidad en flexión del codo y extensión de muñeca con pérdida de reflejo bicipital y braquiorradial.",
    signosCaracteristicos: [
      "Debilidad en flexión del codo",
      "Debilidad en extensión radial de muñeca",
      "Reflejo bicipital y braquiorradial disminuidos",
      "Pérdida sensitiva en cara lateral del antebrazo y pulgar"
    ],
    diagnosticoDiferencial: [
      "Lesión del tronco superior (incluye C5)",
      "Neuropatía del musculocutáneo (más focal)",
      "Radiculopatía cervical C6 (puede ser compresiva)"
    ]
  },
  "Lesión de Raíz C7": {
    estructurasPrimarias: ["Raíz C7"],
    estructurasSecundarias: ["Tronco Medio", "Fascículo Lateral (parcial)", "Fascículo Posterior (parcial)"],
    nerviosAfectados: ["N. Radial", "N. Mediano (parcial)"],
    recorrido: [
      { estructura: "Raíz C7", explicacion: "La raíz C7 forma el tronco medio por sí sola", icono: "🧠" },
      { estructura: "Tronco Medio", explicacion: "Tronco medio formado exclusivamente por C7", icono: "🔗" },
      { estructura: "Fascículos", explicacion: "Contribuye a fascículos lateral y posterior", icono: "🌿" },
      { estructura: "Nervios Terminales", explicacion: "Predominio en radial para extensión y mediano para pronación", icono: "⚡" }
    ],
    explicacionMuscular: {
      "Tríceps Braquial": "Principal músculo afectado; inervado por radial (C7-C8)",
      "Extensor de los Dedos": "Inervado por interóseo posterior del radial (C7-C8)",
      "Flexor Carpi Radialis": "Componente mediano con contribución C7"
    },
    correlacionClinica: "Patrón clásico de debilidad en extensión del codo, muñeca y dedos con reflejo tricipital disminuido.",
    signosCaracteristicos: [
      "Debilidad de tríceps",
      "Debilidad de extensores de muñeca y dedos",
      "Reflejo tricipital disminuido",
      "Pérdida sensitiva en dedo medio y dorso de mano"
    ],
    diagnosticoDiferencial: [
      "Neuropatía del radial proximal (tríceps incluido)",
      "Lesión del tronco medio (patrón similar)",
      "Hernia discal cervical C6-C7"
    ]
  },
  "Lesión de Raíz C8": {
    estructurasPrimarias: ["Raíz C8"],
    estructurasSecundarias: ["Tronco Inferior", "Fascículo Medial"],
    nerviosAfectados: ["N. Ulnar", "N. Mediano (parcial)"],
    recorrido: [
      { estructura: "Raíz C8", explicacion: "Lesión a nivel de la raíz C8", icono: "🧠" },
      { estructura: "Tronco Inferior", explicacion: "C8 contribuye al tronco inferior junto con T1", icono: "🔗" },
      { estructura: "Fascículo Medial", explicacion: "El tronco inferior alimenta el fascículo medial", icono: "🌿" },
      { estructura: "Nervios Terminales", explicacion: "Predominio en ulnar y contribución mediana para flexión digital", icono: "⚡" }
    ],
    explicacionMuscular: {
      "Flexor Profundo de los Dedos": "Inervación dual mediano/ulnar con contribución C8 prominente",
      "Interóseos Dorsales": "Inervados por ulnar (C8-T1)",
      "Flexor Largo del Pulgar": "Inervado por interóseo anterior del mediano (C8-T1)"
    },
    correlacionClinica: "Patrón de debilidad en flexión digital profunda e intrínsecos de mano, sin Horner (diferencia con T1).",
    signosCaracteristicos: [
      "Debilidad de flexión digital profunda",
      "Debilidad de intrínsecos de mano",
      "Pérdida sensitiva en cara medial de mano y antebrazo",
      "Sin signo de Horner (a diferencia de T1)"
    ],
    diagnosticoDiferencial: [
      "Lesión del tronco inferior (incluye T1 y posible Horner)",
      "Neuropatía ulnar proximal",
      "Mielopatía cervical C8"
    ]
  },
  "Lesión de Raíz T1": {
    estructurasPrimarias: ["Raíz T1"],
    estructurasSecundarias: ["Tronco Inferior", "Fascículo Medial", "Cadena simpática"],
    nerviosAfectados: ["N. Ulnar", "Raíz Med. N. Mediano", "Fibras simpáticas"],
    recorrido: [
      { estructura: "Raíz T1", explicacion: "La raíz T1 es la más caudal del plexo", icono: "🧠" },
      { estructura: "Cadena Simpática", explicacion: "Las fibras simpáticas pasan cerca de T1", icono: "👁️" },
      { estructura: "Tronco Inferior", explicacion: "T1 contribuye al tronco inferior con C8", icono: "🔗" },
      { estructura: "Nervios Terminales", explicacion: "Predominio en músculos intrínsecos de la mano", icono: "⚡" }
    ],
    explicacionMuscular: {
      "Interóseos Dorsales": "Inervados por ulnar con contribución T1 predominante",
      "Abductor del Meñique": "Inervado por ulnar (C8-T1)",
      "Aductor del Pulgar": "Inervado por rama profunda del ulnar"
    },
    correlacionClinica: "Patrón de debilidad intrínseca de mano con posible Horner por proximidad de fibras simpáticas.",
    signosCaracteristicos: [
      "Debilidad de todos los intrínsecos de mano",
      "Posible síndrome de Horner (miosis, ptosis, anhidrosis)",
      "Pérdida sensitiva en borde medial del brazo",
      "Reflejos preservados"
    ],
    diagnosticoDiferencial: [
      "Tronco inferior (C8+T1, más extenso)",
      "Síndrome del desfiladero torácico neurogénico",
      "Tumor de Pancoast"
    ]
  },
  "Lesión de Tronco Medio (C7)": {
    estructurasPrimarias: ["Raíz C7", "Tronco Medio"],
    estructurasSecundarias: ["Fascículo Lateral (parcial)", "Fascículo Posterior (parcial)"],
    nerviosAfectados: ["N. Radial (parcial)", "N. Mediano (parcial)"],
    recorrido: [
      { estructura: "Raíz C7", explicacion: "Única raíz que forma el tronco medio", icono: "🧠" },
      { estructura: "Tronco Medio", explicacion: "Tronco formado exclusivamente por C7", icono: "🔗" },
      { estructura: "Divisiones", explicacion: "Se divide para contribuir a fascículos lateral y posterior", icono: "🌿" },
      { estructura: "Nervios", explicacion: "Afecta extensores (radial) y pronación (mediano)", icono: "⚡" }
    ],
    explicacionMuscular: {
      "Tríceps Braquial": "Afectado por compromiso del componente C7 del radial",
      "Extensor de los Dedos": "Inervado por PIN con componente C7 prominente",
      "Pronador Redondo": "Componente mediano afectado parcialmente"
    },
    correlacionClinica: "Patrón similar a C7 radicular pero SIN compromiso de músculos escapulares pre-troncales (romboides, elevador). Clave para diferenciar raíz de tronco.",
    signosCaracteristicos: [
      "Patrón C7 con romboides y elevador escapula NORMALES",
      "Debilidad de extensión de codo, muñeca y dedos",
      "Reflejo tricipital disminuido",
      "Músculos escapulares preservados"
    ],
    diagnosticoDiferencial: [
      "Radiculopatía C7 (romboides puede estar afectado)",
      "Neuropatía del radial proximal",
      "Fascículo posterior (deltoides incluido)"
    ]
  },
  "Lesión de Tronco Inferior (C8-T1) - Klumpke": {
    estructurasPrimarias: ["Raíz C8", "Raíz T1", "Tronco Inferior"],
    estructurasSecundarias: ["Fascículo Medial", "Cadena simpática"],
    nerviosAfectados: ["N. Ulnar", "N. Mediano (parcial)", "Fibras simpáticas"],
    recorrido: [
      { estructura: "Raíces C8-T1", explicacion: "Lesión completa del tronco inferior (parálisis Klumpke)", icono: "🧠" },
      { estructura: "Tronco Inferior", explicacion: "Interrupción total del tronco formado por C8-T1", icono: "❌" },
      { estructura: "Cadena Simpática", explicacion: "Fibras simpáticas frecuentemente afectadas (Horner)", icono: "👁️" },
      { estructura: "Nervios", explicacion: "Compromiso de ulnar y mediano parcial", icono: "⚡" }
    ],
    explicacionMuscular: {
      "Interóseos": "Parálisis completa de intrínsecos por compromiso ulnar",
      "Flexor Profundo de los Dedos": "Afectado por componentes C8-T1 de mediano y ulnar",
      "Flexor Carpi Ulnaris": "Compromiso por lesión del componente ulnar"
    },
    correlacionClinica: "Patrón clásico de Klumpke: mano en garra, debilidad intrínseca y flexión digital con posible Horner. Hombro y codo preservados.",
    signosCaracteristicos: [
      "Mano en garra",
      "Debilidad de todos los intrínsecos",
      "Posible síndrome de Horner",
      "Función proximal preservada (hombro, codo)"
    ],
    diagnosticoDiferencial: [
      "Neuropatía ulnar proximal (más focal)",
      "Raíz C8 aislada (sin Horner)",
      "Fascículo medial"
    ]
  },
  "Lesión de Fascículo Lateral": {
    estructurasPrimarias: ["Fascículo Lateral"],
    estructurasSecundarias: ["Tronco Superior (div. anterior)", "Tronco Medio (div. anterior)"],
    nerviosAfectados: ["N. Musculocutáneo", "Raíz Lateral N. Mediano", "N. Pectoral Lateral"],
    recorrido: [
      { estructura: "Fascículo Lateral", explicacion: "Formado por divisiones anteriores de troncos superior y medio", icono: "🔗" },
      { estructura: "Musculocutáneo", explicacion: "Nervio terminal para bíceps y braquial", icono: "💪" },
      { estructura: "Raíz Lat. Mediano", explicacion: "Contribución lateral al nervio mediano", icono: "🌿" }
    ],
    explicacionMuscular: {
      "Bíceps Braquial": "Parálisis por afectación del musculocutáneo",
      "Flexor Carpi Radialis": "Afectado por componente lateral del mediano",
      "Pronador Redondo": "Afectado por componente lateral del mediano"
    },
    correlacionClinica: "Patrón de debilidad de flexión de codo y pronación/flexión radial de muñeca. Clave: músculos escapulares NORMALES (infraclavicular).",
    signosCaracteristicos: [
      "Debilidad de bíceps con deltoides NORMAL",
      "Debilidad de pronación y flexión radial de muñeca",
      "Reflejo bicipital disminuido",
      "Músculos escapulares preservados"
    ],
    diagnosticoDiferencial: [
      "Tronco superior (escápula afectada)",
      "Neuropatía del musculocutáneo",
      "Raíz C5-C6 (romboides afectado)"
    ]
  },
  "Lesión de Fascículo Medial": {
    estructurasPrimarias: ["Fascículo Medial"],
    estructurasSecundarias: ["Tronco Inferior (div. anterior)"],
    nerviosAfectados: ["N. Ulnar", "Raíz Medial N. Mediano", "N. Cut. Med. Antebrazo", "N. Cut. Med. Brazo"],
    recorrido: [
      { estructura: "Fascículo Medial", explicacion: "Formado por la división anterior del tronco inferior", icono: "🔗" },
      { estructura: "N. Ulnar", explicacion: "Nervio terminal principal", icono: "⚡" },
      { estructura: "Raíz Med. Mediano", explicacion: "Contribución medial al mediano", icono: "🌿" }
    ],
    explicacionMuscular: {
      "Interóseos": "Parálisis por compromiso ulnar",
      "Flexor Carpi Ulnaris": "Afectado por lesión ulnar completa",
      "Abductor del Meñique": "Inervado por ulnar"
    },
    correlacionClinica: "Patrón ulnar completo + componente medial del mediano. Clave: sin afectación de nervios sensitivos cutáneos mediales indica neuropatía más distal.",
    signosCaracteristicos: [
      "Mano en garra",
      "Debilidad de intrínsecos y FPD 4-5",
      "Pérdida sensitiva medial de mano, antebrazo y brazo",
      "Nervios cutáneos mediales afectados (diferencia de ulnar puro)"
    ],
    diagnosticoDiferencial: [
      "Tronco inferior (incluye compromiso simpático)",
      "Neuropatía ulnar (sin cutáneos mediales)",
      "C8-T1 radicular"
    ]
  },
  "Lesión de Fascículo Posterior": {
    estructurasPrimarias: ["Fascículo Posterior"],
    estructurasSecundarias: ["Divisiones posteriores de los 3 troncos"],
    nerviosAfectados: ["N. Axilar", "N. Radial", "N. Toracodorsal", "N. Subescapulares"],
    recorrido: [
      { estructura: "Fascículo Posterior", explicacion: "Formado por divisiones posteriores de los 3 troncos", icono: "🔗" },
      { estructura: "N. Axilar", explicacion: "Sale proximalmente del fascículo", icono: "💪" },
      { estructura: "N. Radial", explicacion: "Continuación terminal del fascículo posterior", icono: "⚡" },
      { estructura: "N. Toracodorsal", explicacion: "Inerva dorsal ancho", icono: "🔄" }
    ],
    explicacionMuscular: {
      "Deltoides": "Parálisis por afectación del axilar",
      "Tríceps Braquial": "Afectado por lesión del radial",
      "Extensores": "Todos los extensores de muñeca y dedos afectados",
      "Dorsal Ancho": "Afectado por toracodorsal"
    },
    correlacionClinica: "Patrón de debilidad de hombro (deltoides) + extensión completa (tríceps, muñeca, dedos). CLAVE: flexores y sensitivo ulnar/mediano NORMALES.",
    signosCaracteristicos: [
      "Deltoides Y extensores débiles juntos",
      "Muñeca caída con debilidad del deltoides",
      "Reflejo braquiorradial y tricipital disminuidos",
      "Función ulnar completamente preservada"
    ],
    diagnosticoDiferencial: [
      "Neuropatía radial proximal (deltoides normal)",
      "Tronco superior (sin extensores distales)",
      "Lesión C5-C7 combinada"
    ]
  },
  "Neuropatía del Nervio Supraescapular": {
    estructurasPrimarias: ["N. Supraescapular"],
    estructurasSecundarias: ["Tronco Superior (rama directa)"],
    nerviosAfectados: ["N. Supraescapular"],
    recorrido: [
      { estructura: "Tronco Superior", explicacion: "El supraescapular sale directamente del tronco superior", icono: "🔗" },
      { estructura: "Escotadura Escapular", explicacion: "Pasa bajo el ligamento transverso superior", icono: "🔄" },
      { estructura: "Supraespinoso", explicacion: "Primera rama motora", icono: "💪" },
      { estructura: "Escotadura Espinoglenoidal", explicacion: "Rodea la espina de la escápula", icono: "🔄" },
      { estructura: "Infraespinoso", explicacion: "Segunda rama motora", icono: "💪" }
    ],
    explicacionMuscular: {
      "Supraespinoso": "Inicia abducción 0-15° y estabiliza articulación glenohumeral",
      "Infraespinoso": "Rotación externa principal del hombro"
    },
    correlacionClinica: "Debilidad aislada de rotación externa e inicio de abducción con atrofia de fosa supraespinosa e infraespinosa.",
    signosCaracteristicos: [
      "Atrofia de fosas supra e infraespinosa",
      "Debilidad de rotación externa",
      "Debilidad en inicio de abducción (0-15°)",
      "Deltoides normal (diferencia de lesión axilar)"
    ],
    diagnosticoDiferencial: [
      "Lesión C5 radicular (más extenso)",
      "Ruptura del manguito rotador",
      "Tronco superior (bíceps incluido)"
    ]
  },
  "Neuropatía del Nervio Torácico Largo": {
    estructurasPrimarias: ["N. Torácico Largo"],
    estructurasSecundarias: ["Raíces C5-C7 directas"],
    nerviosAfectados: ["N. Torácico Largo"],
    recorrido: [
      { estructura: "Raíces C5-C7", explicacion: "Nace directamente de las raíces, antes de los troncos", icono: "🧠" },
      { estructura: "Músculo Escaleno Medio", explicacion: "Perfora el escaleno medio (punto de compresión)", icono: "🔄" },
      { estructura: "Pared Torácica", explicacion: "Desciende sobre la pared torácica lateral", icono: "📍" },
      { estructura: "Serrato Anterior", explicacion: "Inerva exclusivamente el serrato anterior", icono: "💪" }
    ],
    explicacionMuscular: {
      "Serrato Anterior": "Estabiliza la escápula contra la pared torácica durante movimientos de empuje y elevación"
    },
    correlacionClinica: "Escápula alada patognomónica al empujar contra la pared. Nervio vulnerable por su largo recorrido.",
    signosCaracteristicos: [
      "Escápula alada al empujar contra pared",
      "Debilidad al levantar brazos por encima de la cabeza",
      "Reflejos completamente normales",
      "Sin pérdida sensitiva"
    ],
    diagnosticoDiferencial: [
      "Escápula alada por trapecio (N. Espinal XI)",
      "Distrofia facioescapulohumeral",
      "Parsonage-Turner (puede coexistir)"
    ]
  },
  "Neuropatía del Nervio Interóseo Anterior (Kiloh-Nevin)": {
    estructurasPrimarias: ["N. Interóseo Anterior"],
    estructurasSecundarias: ["N. Mediano (rama motora pura)"],
    nerviosAfectados: ["N. Interóseo Anterior"],
    recorrido: [
      { estructura: "N. Mediano", explicacion: "El NIA es rama puramente motora del mediano", icono: "🔗" },
      { estructura: "Antebrazo Proximal", explicacion: "Se separa del mediano en el antebrazo proximal", icono: "🔄" },
      { estructura: "Músculos", explicacion: "Inerva FLP, FPD (2-3) y pronador cuadrado", icono: "💪" }
    ],
    explicacionMuscular: {
      "Flexor Largo del Pulgar": "No puede hacer pinza en 'O' entre pulgar e índice",
      "Flexor Profundo de los Dedos": "Afecta flexión de falange distal de dedos 2-3",
      "Pronador Cuadrado": "Debilidad de pronación pura (sin pronador redondo)"
    },
    correlacionClinica: "Síndrome puramente motor: incapacidad de hacer 'pinch' con pulgar e índice (signo de la pinza). SIN pérdida sensitiva.",
    signosCaracteristicos: [
      "Incapacidad de pinza en 'O' (pulgar-índice)",
      "Signo del predicador (falla flexión distal 1-3)",
      "Pronación pura débil",
      "CERO pérdida sensitiva"
    ],
    diagnosticoDiferencial: [
      "Lesión del mediano proximal (incluye sensitivo)",
      "Parsonage-Turner (distribución parchada)",
      "Ruptura tendinosa del FLP"
    ]
  },
  "Neuropatía del Nervio Interóseo Posterior (PIN)": {
    estructurasPrimarias: ["N. Interóseo Posterior"],
    estructurasSecundarias: ["N. Radial (rama motora terminal)"],
    nerviosAfectados: ["N. Interóseo Posterior"],
    recorrido: [
      { estructura: "N. Radial", explicacion: "El PIN es la rama motora terminal del radial", icono: "🔗" },
      { estructura: "Arcada de Fröhse", explicacion: "Punto de compresión frecuente en el supinador", icono: "🔄" },
      { estructura: "Extensores", explicacion: "Inerva extensores de dedos y pulgar, ECU", icono: "💪" }
    ],
    explicacionMuscular: {
      "Extensor de los Dedos": "Extensión de MCF de dedos 2-5",
      "Extensor Largo del Pulgar": "Extensión de falange distal del pulgar",
      "Extensor Carpi Ulnaris": "Extensión ulnar de muñeca"
    },
    correlacionClinica: "Caída de dedos SIN caída de muñeca (ECR preservado, inervado proximal al PIN). SIN pérdida sensitiva.",
    signosCaracteristicos: [
      "Extensión de dedos débil con extensión de muñeca PRESERVADA",
      "Desviación radial al intentar extender muñeca",
      "Sin pérdida sensitiva (diferencia de radial)",
      "Supinación puede estar débil"
    ],
    diagnosticoDiferencial: [
      "Neuropatía radial proximal (tríceps y ECR afectados)",
      "Ruptura de tendones extensores",
      "Radiculopatía C7"
    ]
  }
};

// Casos clínicos predefinidos para demostración y enseñanza
export interface CasoClinico {
  nombre: string;
  descripcion: string;
  historia: string;
  musculos: { [musculo: string]: number };
  sintomas: string[];
  sensibilidad: string[];
  reflejos: {
    bicipital: 'normal' | 'disminuido' | 'ausente';
    braquiorradial: 'normal' | 'disminuido' | 'ausente';
    tricipital: 'normal' | 'disminuido' | 'ausente';
  };
  informacionAdicional: {
    mecanismo: string;
    evolucion: string;
    tipoPlexo: 'normal' | 'prefijado' | 'postfijado';
  };
  diagnosticoEsperado: string;
  puntosEnsenanza: string[];
}

export const CASOS_CLINICOS_DEMO: { [nombre: string]: CasoClinico } = {
  "Erb-Duchenne Clásico": {
    nombre: "Erb-Duchenne Clásico",
    descripcion: "Accidente de motocicleta con caída sobre hombro derecho",
    historia: "Paciente de 25 años que sufrió accidente de motocicleta. Impacto directo sobre hombro derecho con tracción forzada del cuello hacia el lado contrario. Presenta brazo colgante en posición de 'propina'.",
    musculos: {
      "Deltoides": 0,
      "Supraespinoso": 1,
      "Infraespinoso": 1,
      "Bíceps Braquial": 2,
      "Braquiorradial": 3,
      "Tríceps Braquial": 5,
      "Flexor Carpi Radialis": 5,
      "Interóseos Dorsales": 5
    },
    sintomas: ["Dolor Neurítico"],
    sensibilidad: ["Zona Lateral Hombro (Axilar)", "Zona Lateral Antebrazo (Musculocutáneo)", "Dermatoma C5", "Dermatoma C6"],
    reflejos: { bicipital: "ausente", braquiorradial: "disminuido", tricipital: "normal" },
    informacionAdicional: {
      mecanismo: "Tracción lateral del cuello",
      evolucion: "Aguda (< 1 semana)",
      tipoPlexo: "normal"
    },
    diagnosticoEsperado: "Lesión de Tronco Superior (C5-C6) - Erb-Duchenne",
    puntosEnsenanza: [
      "Mecanismo típico: tracción del cuello con hombro fijo",
      "Posición característica de 'propina'",
      "Preservación de función de la mano",
      "Reflejos C5-C6 afectados, C7-C8 normales"
    ]
  },
  
  "Klumpke Clásico": {
    nombre: "Klumpke Clásico",
    descripcion: "Tracción forzada del brazo hacia arriba durante parto distócico",
    historia: "Recién nacido con parto distócico. Tracción excesiva del brazo durante el parto. Presenta mano en garra y posible síndrome de Horner.",
    musculos: {
      "Deltoides": 5,
      "Bíceps Braquial": 5,
      "Tríceps Braquial": 5,
      "Extensor de los Dedos": 5,
      "Flexor Carpi Ulnaris": 2,
      "Interóseos Dorsales": 0,
      "Interóseos Palmares": 0,
      "Lumbricales 3 y 4": 1,
      "Aductor del Pulgar": 1,
      "Abductor del Meñique": 1
    },
    sintomas: ["Parestesias", "Signo de Horner"],
    sensibilidad: ["Mano Medial (Cubital)", "Zona Medial Antebrazo (Cut. Med. Antebrazo)", "Dermatoma C8", "Dermatoma T1"],
    reflejos: { bicipital: "normal", braquiorradial: "normal", tricipital: "normal" },
    informacionAdicional: {
      mecanismo: "Tracción del brazo hacia arriba",
      evolucion: "Aguda (< 1 semana)",
      tipoPlexo: "normal"
    },
    diagnosticoEsperado: "Lesión de Tronco Inferior (C8-T1) - Klumpke",
    puntosEnsenanza: [
      "Afecta principalmente la función intrínseca de la mano",
      "Síndrome de Horner sugiere lesión preganglionar",
      "Preservación de función proximal del brazo",
      "Mano en garra por parálisis de interóseos"
    ]
  },
  
  "Lesión Axilar Aislada": {
    nombre: "Lesión Axilar Aislada",
    descripcion: "Luxación anterior de hombro con lesión del nervio axilar",
    historia: "Paciente de 30 años con luxación anterior de hombro tras caída. Después de la reducción presenta imposibilidad para abducir el hombro y pérdida sensitiva en la región deltoidea.",
    musculos: {
      "Deltoides": 0,
      "Supraespinoso": 5,
      "Infraespinoso": 5,
      "Bíceps Braquial": 5,
      "Tríceps Braquial": 5,
      "Braquiorradial": 5,
      "Flexor Carpi Radialis": 5,
      "Interóseos Dorsales": 5
    },
    sintomas: [],
    sensibilidad: ["Zona Lateral Hombro (Axilar)"],
    reflejos: { bicipital: "normal", braquiorradial: "normal", tricipital: "normal" },
    informacionAdicional: {
      mecanismo: "Luxación de hombro",
      evolucion: "Aguda (< 1 semana)",
      tipoPlexo: "normal"
    },
    diagnosticoEsperado: "Neuropatía del Nervio Axilar",
    puntosEnsenanza: [
      "Lesión mononeuropática pura",
      "Solo afecta el deltoides",
      "Pérdida sensitiva específica en región deltoidea",
      "Reflejos completamente normales"
    ]
  },
  
  "Muñeca Caída": {
    nombre: "Muñeca Caída",
    descripcion: "Fractura de húmero con lesión del nervio radial en surco radial",
    historia: "Paciente de 45 años con fractura de tercio medio de húmero tras caída. Presenta imposibilidad para extender la muñeca y los dedos, con muñeca caída característica.",
    musculos: {
      "Deltoides": 5,
      "Bíceps Braquial": 5,
      "Tríceps Braquial": 2,
      "Braquiorradial": 3,
      "Extensor Carpi Radialis": 0,
      "Extensor de los Dedos": 1,
      "Extensor Carpi Ulnaris": 0,
      "Flexor Carpi Radialis": 5,
      "Interóseos Dorsales": 5
    },
    sintomas: [],
    sensibilidad: ["Zona Posterior Brazo/Antebrazo (Radial)"],
    reflejos: { bicipital: "normal", braquiorradial: "disminuido", tricipital: "disminuido" },
    informacionAdicional: {
      mecanismo: "Fractura de húmero",
      evolucion: "Aguda (< 1 semana)",
      tipoPlexo: "normal"
    },
    diagnosticoEsperado: "Neuropatía del Nervio Radial (Proximal)",
    puntosEnsenanza: [
      "Lesión del radial en surco radial del húmero",
      "Muñeca caída característica",
      "Tríceps afectado (lesión proximal)",
      "Preservación de función de flexores"
    ]
  },

  "Síndrome del Túnel Carpiano": {
    nombre: "Síndrome del Túnel Carpiano",
    descripcion: "Compresión del nervio mediano a nivel del túnel carpiano",
    historia: "Paciente de 50 años con parestesias nocturnas en dedos pulgar, índice y medio. Trabaja con computadora. Presenta signo de Tinel y Phalen positivos.",
    musculos: {
      "Deltoides": 5,
      "Bíceps Braquial": 5,
      "Tríceps Braquial": 5,
      "Flexor Carpi Radialis": 5,
      "Pronador Redondo": 5,
      "Flexor Largo del Pulgar": 5,
      "Flexor Profundo de los Dedos": 5,
      "Flexor Corto del Pulgar": 3,
      "Interóseos Dorsales": 5
    },
    sintomas: ["Parestesias"],
    sensibilidad: ["Mano Lateral (Mediano)"],
    reflejos: { bicipital: "normal", braquiorradial: "normal", tricipital: "normal" },
    informacionAdicional: {
      mecanismo: "Compresión crónica",
      evolucion: "Crónica (> 6 meses)",
      tipoPlexo: "normal"
    },
    diagnosticoEsperado: "Neuropatía del Nervio Mediano (Proximal)",
    puntosEnsenanza: [
      "Lesión distal del mediano",
      "Afecta solo músculos tenares",
      "Preservación de flexores del antebrazo",
      "Parestesias nocturnas características"
    ]
  },

  "Parsonage-Turner (Neuralgia Amiotrófica)": {
    nombre: "Parsonage-Turner (Neuralgia Amiotrófica)",
    descripcion: "Dolor intenso de hombro seguido de debilidad parchada 2 semanas después de infección viral",
    historia: "Paciente de 38 años con dolor intenso en hombro derecho de inicio súbito tras cuadro viral. A las 2 semanas desarrolla debilidad de hombro y escápula alada. El dolor mejora pero la debilidad persiste. Distribución parchada que no sigue territorio de un solo nervio.",
    musculos: {
      "Serrato Anterior": 1,
      "Infraespinoso": 2,
      "Supraespinoso": 2,
      "Deltoides": 3,
      "Bíceps Braquial": 4,
      "Flexor Largo del Pulgar": 3,
      "Pronador Cuadrado": 3,
      "Tríceps Braquial": 5,
      "Interóseos Dorsales": 5,
      "Flexor Carpi Ulnaris": 5
    },
    sintomas: ["Dolor Neurítico", "Escápula Alada", "Atrofia Muscular"],
    sensibilidad: ["Zona Lateral Hombro (Axilar)", "Dermatoma C5", "Dermatoma C6"],
    reflejos: { bicipital: "normal", braquiorradial: "normal", tricipital: "normal" },
    informacionAdicional: {
      mecanismo: "Post-infeccioso",
      evolucion: "Subaguda (2-12 semanas)",
      tipoPlexo: "normal"
    },
    diagnosticoEsperado: "Síndrome de Parsonage-Turner (Neuralgia Amiotrófica)",
    puntosEnsenanza: [
      "Distribución parchada (serrato + supraescapular + NIA): NO sigue un solo nervio/raíz",
      "Dolor precede a la debilidad (secuencia temporal típica)",
      "Mano intrínseca NORMAL (ulnar preservado)",
      "Reflejos preservados a pesar de debilidad moderada",
      "Considerar corticoides en fase aguda si <2 semanas"
    ]
  },

  "Síndrome del NIA (Kiloh-Nevin)": {
    nombre: "Síndrome del NIA (Kiloh-Nevin)",
    descripcion: "Incapacidad para hacer pinza con pulgar e índice sin pérdida sensitiva",
    historia: "Paciente de 45 años con debilidad progresiva para hacer pinza entre pulgar e índice. No puede flexionar la falange distal del pulgar ni del índice. Sin dolor, sin parestesias. El paciente nota que no puede abrochar botones.",
    musculos: {
      "Flexor Largo del Pulgar": 1,
      "Pronador Cuadrado": 2,
      "Deltoides": 5,
      "Bíceps Braquial": 5,
      "Tríceps Braquial": 5,
      "Pronador Redondo": 5,
      "Abductor Corto del Pulgar": 5,
      "Interóseos Dorsales": 5,
      "Flexor Carpi Radialis": 5
    },
    sintomas: ["Mano en Predicador"],
    sensibilidad: [],
    reflejos: { bicipital: "normal", braquiorradial: "normal", tricipital: "normal" },
    informacionAdicional: {
      mecanismo: "Compresión",
      evolucion: "Subaguda (2-12 semanas)",
      tipoPlexo: "normal"
    },
    diagnosticoEsperado: "Neuropatía del Nervio Interóseo Anterior (Kiloh-Nevin)",
    puntosEnsenanza: [
      "Síndrome PURAMENTE MOTOR: CERO pérdida sensitiva",
      "Prueba patognomónica: no puede hacer 'O' con pulgar e índice",
      "Pronador cuadrado débil confirma NIA (pronador redondo NORMAL)",
      "Conducciones nerviosas convencionales pueden ser normales",
      "Diferenciar de ruptura tendinosa del FLP"
    ]
  },

  "Escápula Alada (N. Torácico Largo)": {
    nombre: "Escápula Alada (N. Torácico Largo)",
    descripcion: "Escápula alada al empujar contra la pared tras carga pesada",
    historia: "Paciente de 30 años, deportista, que tras levantar peso excesivo nota que la escápula 'se despega' al empujar contra la pared. Sin pérdida de fuerza en mano. Sin parestesias.",
    musculos: {
      "Serrato Anterior": 1,
      "Deltoides": 5,
      "Supraespinoso": 5,
      "Infraespinoso": 5,
      "Bíceps Braquial": 5,
      "Tríceps Braquial": 5,
      "Interóseos Dorsales": 5
    },
    sintomas: ["Escápula Alada", "Dolor Neurítico"],
    sensibilidad: [],
    reflejos: { bicipital: "normal", braquiorradial: "normal", tricipital: "normal" },
    informacionAdicional: {
      mecanismo: "Esfuerzo físico",
      evolucion: "Subaguda (2-12 semanas)",
      tipoPlexo: "normal"
    },
    diagnosticoEsperado: "Neuropatía del Nervio Torácico Largo",
    puntosEnsenanza: [
      "Escápula alada en empuje = serrato anterior (N. Torácico Largo)",
      "Diferenciar de trapecio (N. Espinal XI): escápula alada al elevar brazo",
      "Nervio largo y vulnerable: pre-tronco, directo de raíces C5-C7",
      "Pronóstico generalmente bueno: 6-12 meses de recuperación",
      "Sin pérdida sensitiva ni de reflejos"
    ]
  },

  "Neuropatía Ulnar al Codo": {
    nombre: "Neuropatía Ulnar al Codo",
    descripcion: "Mano en garra con atrofia de interóseos tras apoyo prolongado del codo",
    historia: "Paciente de 55 años con parestesias en 4to y 5to dedo y debilidad progresiva de la mano. Trabaja apoyando el codo en escritorio. Nota atrofia del primer espacio interóseo dorsal y dificultad para abrir frascos.",
    musculos: {
      "Flexor Carpi Ulnaris": 3,
      "Flexor Profundo de los Dedos": 3,
      "Interóseos Dorsales": 2,
      "Interóseos Palmares": 2,
      "Lumbricales 3 y 4": 3,
      "Abductor del Meñique": 2,
      "Aductor del Pulgar": 3,
      "Deltoides": 5,
      "Bíceps Braquial": 5,
      "Tríceps Braquial": 5,
      "Abductor Corto del Pulgar": 5
    },
    sintomas: ["Parestesias", "Mano en Garra", "Signo de Tinel", "Atrofia Muscular"],
    sensibilidad: ["Mano Medial (Cubital)", "Zona Medial Antebrazo (Cut. Med. Antebrazo)"],
    reflejos: { bicipital: "normal", braquiorradial: "normal", tricipital: "normal" },
    informacionAdicional: {
      mecanismo: "Compresión",
      evolucion: "Crónica (> 12 semanas)",
      tipoPlexo: "normal"
    },
    diagnosticoEsperado: "Neuropatía del Nervio Ulnar a Nivel del Codo",
    puntosEnsenanza: [
      "FCU débil confirma nivel de CODO (normal en Guyon)",
      "Tinel positivo en canal cubital",
      "Clave: FCU + FPD 4-5 DÉBILES = codo, NORMALES = muñeca (Guyon)",
      "Sin compromiso de N. Cut. Med. Antebrazo = fascículo medial, no ulnar puro",
      "Abductor Corto del Pulgar NORMAL excluye mediano"
    ]
  }
};

// Mapeo de diagnósticos a estructuras anatómicas para la visualización SVG
export const DIAGNOSTIC_SVG_MAPPING: { [diagnostico: string]: string[] } = {
  "Lesión de Raíz C5": ["c5-path"],
  "Lesión de Raíz C6": ["c6-path"],
  "Lesión de Raíz C7": ["c7-path"],
  "Lesión de Raíz C8": ["c8-path"],
  "Lesión de Raíz T1": ["t1-path"],
  
  "Lesión de Tronco Superior (C5-C6) - Erb-Duchenne": ["c5-path", "c6-path", "superior-trunk", "lateral-cord", "posterior-cord", "axillary", "musculocutaneous", "suprascapular"],
  "Lesión de Tronco Medio (C7)": ["c7-path", "middle-trunk", "lateral-cord", "posterior-cord"],
  "Lesión de Tronco Inferior (C8-T1) - Klumpke": ["c8-path", "t1-path", "inferior-trunk", "medial-cord", "ulnar", "median"],
  "Lesión de Tronco Superior + Medio (C5-C7)": ["c5-path", "c6-path", "c7-path", "superior-trunk", "middle-trunk", "lateral-cord", "posterior-cord", "axillary", "musculocutaneous", "radial", "suprascapular"],
  
  "Lesión de Fascículo Lateral": ["lateral-cord", "musculocutaneous", "median"],
  "Lesión de Fascículo Medial": ["medial-cord", "ulnar", "median"],
  "Lesión de Fascículo Posterior": ["posterior-cord", "axillary", "radial"],
  "Lesión de Fascículo Lateral + Medial": ["lateral-cord", "medial-cord", "musculocutaneous", "median", "ulnar"],
  "Lesión de Fascículo Lateral + Posterior": ["lateral-cord", "posterior-cord", "musculocutaneous", "median", "axillary", "radial"],
  
  "Neuropatía del Nervio Axilar": ["axillary"],
  "Neuropatía del Nervio Musculocutáneo": ["musculocutaneous"],
  "Neuropatía del Nervio Radial (Proximal)": ["radial"],
  "Neuropatía del Nervio Radial (Distal / Surco Espiral)": ["radial"],
  "Neuropatía del Nervio Interóseo Posterior (PIN)": ["radial"],
  "Neuropatía del Nervio Mediano (Proximal)": ["median"],
  "Neuropatía del Nervio Mediano Distal (STC)": ["median"],
  "Neuropatía del Nervio Interóseo Anterior (Kiloh-Nevin)": ["median"],
  "Neuropatía del Nervio Ulnar (Proximal)": ["ulnar"],
  "Neuropatía del Nervio Ulnar a Nivel del Codo": ["ulnar"],
  "Neuropatía del Nervio Ulnar a Nivel de la Muñeca (Guyon)": ["ulnar"],
  "Neuropatía del Nervio Supraescapular": ["suprascapular"],
  "Neuropatía del Nervio Torácico Largo": ["c5-path", "c6-path", "c7-path"],
  
  "Avulsión Total del Plexo Braquial (C5-T1)": ["c5-path", "c6-path", "c7-path", "c8-path", "t1-path", "superior-trunk", "middle-trunk", "inferior-trunk", "lateral-cord", "medial-cord", "posterior-cord", "axillary", "musculocutaneous", "radial", "median", "ulnar"],
  "Lesión Obstétrica Erb-Duchenne + Axilar": ["c5-path", "c6-path", "superior-trunk", "axillary", "musculocutaneous", "suprascapular"],
  "Lesión Traumática C8-T1 con Horner": ["c8-path", "t1-path", "inferior-trunk", "medial-cord", "ulnar"],
  "Lesión Iatrogénica Post-Cirugía de Hombro": ["axillary", "musculocutaneous", "suprascapular"],
  "Síndrome del Desfiladero Torácico Neurogénico": ["t1-path", "inferior-trunk", "medial-cord", "ulnar"],
  "Lesión por Radiación (Plexopatía Actínica)": ["c5-path", "c6-path", "c7-path", "c8-path", "t1-path"],
  "Parálisis Braquial Obstétrica Total (C5-T1)": ["c5-path", "c6-path", "c7-path", "c8-path", "t1-path", "superior-trunk", "middle-trunk", "inferior-trunk"],
  "Síndrome de Parsonage-Turner (Neuralgia Amiotrófica)": ["c5-path", "c6-path", "suprascapular"],
  "Plexopatía Neoplásica (Infiltración Tumoral)": ["c8-path", "t1-path", "inferior-trunk", "medial-cord", "ulnar"]
};
