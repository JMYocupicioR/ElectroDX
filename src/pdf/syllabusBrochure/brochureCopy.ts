export interface BrochurePillar {
  id: string;
  number: string;
  title: string;
  modules: string;
  badge: string;
  accent: string;
  summary: string;
  keyPoints: string[];
  outcome: string;
}

export const BROCHURE_PILLARS: BrochurePillar[] = [
  {
    id: 'biofisica',
    number: '01',
    title: 'Fundamentos Bioeléctricos e Instrumentación',
    modules: 'Módulos 01 y 13',
    badge: 'Base Fisiológica',
    accent: '#2563eb',
    summary:
      'Comprensión rigurosa de cómo se originan los biopotenciales de membrana y cómo se configuran adecuadamente los filtros, la ganancia, el barrido y la tierra del electromiógrafo.',
    keyPoints: [
      'Configuración de filtros pasa-altas y pasa-bajas para evitar distorsión de latencia y fase.',
      'Eliminación de interferencia a 60 Hz y reducción de impedancia piel-electrodo.',
      'Prevención de artefactos por volumen conductor y sobreestimulación.',
      'Normas de bioseguridad eléctrica en pacientes con marcapasos o DAI.',
    ],
    outcome:
      'Dominarás la calibración del equipo para obtener registros fidedignos sin artefactos que simulen patología.',
  },
  {
    id: 'ncs',
    number: '02',
    title: 'Estudios de Neuroconducción Periférica (NCS)',
    modules: 'Módulos 02 y 04',
    badge: 'Conducción Nerviosa',
    accent: '#059669',
    summary:
      'Protocolos estandarizados de neuroconducción motora y sensitiva en extremidades superiores e inferiores, incluyendo técnicas segmentarias de alta resolución.',
    keyPoints: [
      'Parámetros normativos: latencia distal, amplitud CMAP / SNAP y velocidad de conducción.',
      'Diferenciación cuantitativa: pérdida axonal vs desmielinización vs bloqueo de conducción.',
      'Respuestas tardías: análisis de persistencia y cronodispersión de Onda F, y Reflejo H.',
      'Técnicas comparativas de segmento corto (Inching) para atrapamientos focales.',
    ],
    outcome:
      'Podrás localizar con precisión milimétrica el sitio de lesión y categorizar el mecanismo fisiopatológico primario.',
  },
  {
    id: 'emg',
    number: '03',
    title: 'Electromiografía de Aguja y Mapeo Miopático/Neuropático',
    modules: 'Módulos 03 y 05',
    badge: 'Mapeo Muscular',
    accent: '#d97706',
    summary:
      'Exploración muscular sistemática con aguja concéntrica en las 4 fases clásicas: inserción, reposo, activación voluntaria mínima y esfuerzo máximo.',
    keyPoints: [
      'Reconocimiento de actividad espontánea anormal: fibrilaciones, ondas agudas positivas y CRDs.',
      'Identificación de descargas miotónicas, fasciculaciones y mioquimias.',
      'Análisis morfométrico del PUM: duración, fases y amplitud.',
      'Graduación del patrón de reclutamiento e interferencia.',
    ],
    outcome:
      'Distinguirás con seguridad afecciones neuropáticas (denervación activa vs reinervación) de procesos miopáticos primarios.',
  },
  {
    id: 'unm',
    number: '04',
    title: 'Unión Neuromuscular y Respuestas Especiales',
    modules: 'Módulos 05 y 07',
    badge: 'Transmisión Sináptica',
    accent: '#7c3aed',
    summary:
      'Evaluación neurofisiológica de trastornos postsinápticos y presinápticos mediante estimulación nerviosa repetitiva y pruebas dinámicas.',
    keyPoints: [
      'Estimulación repetitiva a baja frecuencia (3 Hz): detección de decremento mayor al 10%.',
      'Prueba de ejercicio breve (10 s) para agotamiento pos-ejercicio vs facilitación.',
      'Estimulación a alta frecuencia (20-50 Hz) o post-ejercicio prolongado en síndromes presinápticos.',
      'Protocolos diferenciales para Miastenia Gravis, Lambert-Eaton y Botulismo.',
    ],
    outcome:
      'Aprenderás a ejecutar e interpretar las pruebas diagnósticas con sensibilidad óptima evitando falsos negativos.',
  },
  {
    id: 'patologias',
    number: '05',
    title: 'Diagnóstico Topográfico de Patologías Frecuentes',
    modules: 'Módulos 08, 09 y 10',
    badge: 'Casos Clínicos y Criterios',
    accent: '#e11d48',
    summary:
      'Algoritmos de decisión para las principales neuropatías focales, radiculopatías, plexopatías y enfermedades de motoneurona bajo directrices internacionales.',
    keyPoints: [
      'Síndrome del Túnel Carpiano: criterios de severidad AANEM y pruebas de sensibilidad cruzada.',
      'Neuropatía ulnar en codo y nervio radial.',
      'Radiculopatías cervicales y lumbosacras: muestreo miotomal y exclusión de plexopatía.',
      'Criterios Gold Coast (2019) para ELA y EAN/PNS (2021) para CIDP.',
    ],
    outcome:
      'Desarrollarás criterio clínico resolutivo para fundamentar diagnósticos certeros con impacto directo en el pronóstico del paciente.',
  },
  {
    id: 'avanzados',
    number: '06',
    title: 'Potenciales Evocados, Ultrasonido y Control de Calidad',
    modules: 'Módulos 06, 07 y 13',
    badge: 'Técnicas Multimodales',
    accent: '#0891b2',
    summary:
      'Integración de vías sensoriales centrales (PESS, PEV, PEATC) con ecografía neuromuscular de alta resolución para correlación morfológica.',
    keyPoints: [
      'Potenciales Evocados Somatosensoriales (PESS): latencias N9, N13, N20 y P37.',
      'Ultrasonido neuromuscular: área de sección transversal (CSA) y ecoestructura nerviosa.',
      'Escala Heckmatt para miopatías y protocolos combinados EMG-ecografía.',
      'Checklist de control de calidad para reportes médicos de validez académica.',
    ],
    outcome:
      'Complementarás el estudio electrofisiológico funcional con imagen anatómica en tiempo real.',
  },
];

export const BROCHURE_BENEFITS = [
  {
    title: 'Acreditación de posgrado',
    desc: 'Programa estructurado con seguimiento curricular y evaluación formativa continua en neurofisiología clínica.',
  },
  {
    title: 'Evaluaciones y certificación',
    desc: 'Exámenes clínicos interactivos al final de cada tema para constatar el aprovechamiento del médico.',
  },
  {
    title: 'Comité editorial de expertos',
    desc: 'Contenidos revisados y validados continuamente por especialistas activos en neurofisiología clínica.',
  },
] as const;

export const BROCHURE_STEPS = [
  {
    step: '01',
    title: 'Registro profesional',
    desc: 'Completa tu registro con correo, institución hospitalaria y cédula profesional.',
  },
  {
    step: '02',
    title: 'Verificación académica',
    desc: 'El comité valida tu perfil médico como residente o especialista en formación electrodiagnóstica.',
  },
  {
    step: '03',
    title: 'Acceso total al curso',
    desc: 'Desbloquea módulos, evaluaciones por tema, simuladores diagnósticos y registro de progreso.',
  },
] as const;
