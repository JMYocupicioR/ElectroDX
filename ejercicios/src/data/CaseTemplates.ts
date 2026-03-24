// CaseTemplates.ts — Plantillas de casos clínicos para cada patrón diagnóstico
// v3: +RNS, +LateResponses, +Temperature, +ConductionBlock, +Pitfall, +Severity
import type { DiagnosticCategory, SeverityGrade } from '../types/ClinicalCase';

export interface NCSTemplate {
  nerve: string; type: 'motor' | 'sensory'; latency: [number, number];
  amplitude: [number, number]; velocity: [number, number];
  normalRanges: { latency: [number, number]; amplitude: [number, number]; velocity: [number, number] };
  /** Sitio de estimulación para estudio proximal/distal */
  stimulationSite?: 'distal' | 'proximal' | 'across_elbow' | 'above_fibular_head' | 'below_fibular_head';
  /** Amplitud proximal para BC */
  proximalAmplitude?: [number, number];
  conductionBlock?: boolean;
  temporalDispersion?: boolean;
}

export interface EMGTemplate {
  muscle: string; nerve: string; root: string;
  insertionalActivity: string[];
  fibrillations: string[]; positiveWaves: string[]; fasciculations: string[];
  duration: [number, number]; amplitude: [number, number];
  polyphasia: [number, number]; recruitment: string[];
  myotonicDischarges?: string[];
}

export interface RNSTemplate {
  nerve: string; muscle: string;
  frequency: '2Hz' | '3Hz' | '5Hz' | '20Hz' | '50Hz';
  baselineCMAP: [number, number];
  decrementPercent: [number, number];
  postExerciseFacilitation?: [number, number];
  postExerciseExhaustion?: [number, number];
}

export interface LateResponseTemplate {
  type: 'f_wave' | 'h_reflex';
  nerve: string;
  side?: 'left' | 'right';
  minLatency?: [number, number];
  persistence?: [number, number];
  chronodispersion?: [number, number];
  latency?: [number, number];
  normalRange: [number, number];
  status: ('normal' | 'abnormal' | 'absent')[];
}

export interface PatientTemplate {
  ageRange: [number, number]; sexBias?: 'male' | 'female';
  occupations: string[]; complaints: string[];
  histories: string[]; physicalExams: string[];
}

export interface CaseTemplate {
  patternId: string; patternName: string; category: DiagnosticCategory;
  patient: PatientTemplate;
  ncs: NCSTemplate[];
  emg: EMGTemplate[];
  /** ENR data — only for NMJ disorders */
  rns?: RNSTemplate[];
  /** Late responses — F-wave, H-reflex */
  lateResponses?: LateResponseTemplate[];
  explanation: string;
  differentials: { id: string; name: string; whyNot: string }[];
  recommendations: string[];
  /** Skin temperature (°C) — for pitfall cases */
  skinTemperature?: [number, number];
  /** Technical notes shown to student */
  technicalNotes?: string[];
  /** Is this a pitfall/trap case? */
  isPitfall?: boolean;
  pitfallExplanation?: string;
  /** Severity calculation rule */
  severityGrade?: SeverityGrade;
  severityExplanation?: string;
}

// Helper: normal NCS ranges
const NR = {
  medianMotor:   { latency: [2.5, 4.2] as [number,number], amplitude: [4, 12] as [number,number], velocity: [49, 65] as [number,number] },
  medianSensory: { latency: [2.0, 3.5] as [number,number], amplitude: [15, 50] as [number,number], velocity: [50, 65] as [number,number] },
  ulnarMotor:    { latency: [2.0, 3.5] as [number,number], amplitude: [6, 14] as [number,number], velocity: [49, 65] as [number,number] },
  ulnarSensory:  { latency: [2.0, 3.2] as [number,number], amplitude: [10, 40] as [number,number], velocity: [50, 65] as [number,number] },
  peronealMotor: { latency: [3.0, 5.5] as [number,number], amplitude: [2, 10] as [number,number], velocity: [41, 55] as [number,number] },
  suralSensory:  { latency: [2.5, 4.0] as [number,number], amplitude: [6, 30] as [number,number], velocity: [40, 55] as [number,number] },
  tibialMotor:   { latency: [3.0, 5.8] as [number,number], amplitude: [4, 15] as [number,number], velocity: [41, 55] as [number,number] },
  radialSensory: { latency: [1.5, 2.9] as [number,number], amplitude: [15, 40] as [number,number], velocity: [50, 65] as [number,number] },
};

export const CASE_TEMPLATES: CaseTemplate[] = [
  // ═══════════ 1. NORMAL ═══════════
  {
    patternId: 'normal', patternName: 'Estudio Normal', category: 'normal',
    patient: {
      ageRange: [25, 55], occupations: ['Oficinista', 'Profesor', 'Ingeniero'],
      complaints: ['Dolor cervical inespecífico', 'Parestesias ocasionales en manos al despertar', 'Dolor lumbar mecánico sin irradiación'],
      histories: ['Sin antecedentes neurológicos relevantes. Dolor cervical de 2 meses de evolución sin déficit motor ni sensitivo objetivo.'],
      physicalExams: ['Fuerza 5/5 en 4 extremidades. ROTs simétricos ++/++++. Sensibilidad conservada. Marcha normal. Signos de Tinel y Phalen negativos.']
    },
    ncs: [
      { nerve: 'Mediano', type: 'motor', latency: [2.8, 3.8], amplitude: [5, 10], velocity: [52, 62], normalRanges: NR.medianMotor },
      { nerve: 'Mediano', type: 'sensory', latency: [2.2, 3.2], amplitude: [20, 45], velocity: [52, 62], normalRanges: NR.medianSensory },
      { nerve: 'Cubital', type: 'motor', latency: [2.2, 3.2], amplitude: [7, 12], velocity: [52, 62], normalRanges: NR.ulnarMotor },
      { nerve: 'Cubital', type: 'sensory', latency: [2.1, 3.0], amplitude: [15, 35], velocity: [52, 60], normalRanges: NR.ulnarSensory },
    ],
    emg: [
      { muscle: 'Abductor Pollicis Brevis', nerve: 'Mediano', root: 'C8-T1', insertionalActivity: ['normal'], fibrillations: ['absent'], positiveWaves: ['absent'], fasciculations: ['absent'], duration: [8, 13], amplitude: [300, 3000], polyphasia: [5, 15], recruitment: ['normal'] },
      { muscle: 'First Dorsal Interosseous', nerve: 'Cubital', root: 'C8-T1', insertionalActivity: ['normal'], fibrillations: ['absent'], positiveWaves: ['absent'], fasciculations: ['absent'], duration: [8, 13], amplitude: [300, 3000], polyphasia: [5, 15], recruitment: ['normal'] },
      { muscle: 'Biceps Brachii', nerve: 'Musculocutáneo', root: 'C5-C6', insertionalActivity: ['normal'], fibrillations: ['absent'], positiveWaves: ['absent'], fasciculations: ['absent'], duration: [8, 14], amplitude: [300, 4000], polyphasia: [5, 15], recruitment: ['normal'] },
    ],
    explanation: 'Estudio electrodiagnóstico dentro de límites normales. Las velocidades de conducción, latencias y amplitudes se encuentran en rangos normales. La EMG de aguja no muestra actividad espontánea anormal ni cambios en los potenciales de unidad motora.',
    differentials: [
      { id: 'carpal_tunnel_syndrome_mild', name: 'STC Leve', whyNot: 'Las latencias distales del mediano son normales y no hay diferencia mediano-cubital significativa.' },
      { id: 'c5_c6_radiculopathy', name: 'Radiculopatía C5-C6', whyNot: 'No hay denervación activa ni crónica en músculos del miotoma C5-C6.' }
    ],
    recommendations: ['Correlación clínica. Considerar otras etiologías no neurofisiológicas para los síntomas.']
  },

  // ═══════════ 2. NEUROPATÍA AXONAL AGUDA ═══════════
  {
    patternId: 'acute_axonal_neuropathy', patternName: 'Neuropatía Axonal Aguda', category: 'axonal',
    patient: {
      ageRange: [45, 75], occupations: ['Jubilado', 'Agricultor', 'Obrero'],
      complaints: ['Debilidad y entumecimiento progresivo en pies de 3 semanas', 'Dificultad para caminar con tropiezos frecuentes', 'Hormigueo en manos y pies de inicio reciente'],
      histories: ['Diabetes mellitus tipo 2 de 15 años. HbA1c 9.2%. Inicio agudo de debilidad distal en miembros inferiores hace 3 semanas tras episodio infeccioso gastrointestinal.'],
      physicalExams: ['Fuerza 3/5 dorsiflexores de tobillo bilateral. Hiporreflexia generalizada. Hipoestesia en guante y calcetín. Marcha en steppage bilateral.']
    },
    ncs: [
      { nerve: 'Peroneo', type: 'motor', latency: [4.0, 5.5], amplitude: [0.5, 2.5], velocity: [35, 44], normalRanges: NR.peronealMotor },
      { nerve: 'Tibial', type: 'motor', latency: [4.5, 6.5], amplitude: [1.0, 3.5], velocity: [35, 44], normalRanges: NR.tibialMotor },
      { nerve: 'Sural', type: 'sensory', latency: [3.0, 4.5], amplitude: [2, 8], velocity: [35, 44], normalRanges: NR.suralSensory },
      { nerve: 'Mediano', type: 'motor', latency: [3.0, 4.2], amplitude: [3, 6], velocity: [45, 55], normalRanges: NR.medianMotor },
    ],
    emg: [
      { muscle: 'Tibialis Anterior', nerve: 'Peroneo profundo', root: 'L4-L5', insertionalActivity: ['increased'], fibrillations: ['2+', '3+'], positiveWaves: ['2+', '3+'], fasciculations: ['absent'], duration: [10, 14], amplitude: [2000, 5000], polyphasia: [20, 35], recruitment: ['reduced'] },
      { muscle: 'Gastrocnemius', nerve: 'Tibial', root: 'S1-S2', insertionalActivity: ['increased'], fibrillations: ['2+', '3+'], positiveWaves: ['1+', '2+'], fasciculations: ['absent'], duration: [10, 14], amplitude: [2000, 5000], polyphasia: [15, 30], recruitment: ['reduced'] },
      { muscle: 'First Dorsal Interosseous', nerve: 'Cubital', root: 'C8-T1', insertionalActivity: ['normal', 'increased'], fibrillations: ['1+', '2+'], positiveWaves: ['1+'], fasciculations: ['absent'], duration: [9, 13], amplitude: [1500, 4000], polyphasia: [10, 25], recruitment: ['reduced', 'normal'] },
    ],
    explanation: 'Patrón de neuropatía axonal aguda: amplitudes CMAP/SNAP reducidas con velocidades relativamente preservadas (>70% del límite inferior normal). Denervación activa (fibrilaciones, ondas positivas) en músculos distales indica pérdida axonal reciente. Las velocidades ligeramente reducidas son secundarias a la pérdida de fibras rápidas.',
    differentials: [
      { id: 'demyelinating_neuropathy', name: 'Neuropatía Desmielinizante', whyNot: 'Las velocidades de conducción no están reducidas a <70% del límite normal, y no hay bloqueos de conducción ni dispersión temporal significativa.' },
      { id: 'als', name: 'ELA', whyNot: 'Las conducciones sensitivas están afectadas (SNAP reducidos), lo cual descarta enfermedad de motoneurona pura.' },
      { id: 'myopathy', name: 'Miopatía', whyNot: 'Los PUM muestran duración aumentada (no disminuida) y el reclutamiento es reducido (no precoz).' }
    ],
    recommendations: ['Investigar causas metabólicas: HbA1c, perfil tiroideo, B12, folato.', 'Considerar variante axonal de Guillain-Barré dado inicio agudo post-infeccioso.', 'Seguimiento con EMG en 3-4 semanas para evaluar progresión.']
  },

  // ═══════════ 3. NEUROPATÍA AXONAL CRÓNICA ═══════════
  {
    patternId: 'chronic_axonal_neuropathy', patternName: 'Neuropatía Axonal Crónica', category: 'axonal',
    patient: {
      ageRange: [50, 80], occupations: ['Jubilado', 'Ama de casa', 'Comerciante'],
      complaints: ['Adormecimiento en pies de más de 1 año', 'Sensación de caminar sobre algodón', 'Calambres nocturnos en pantorrillas'],
      histories: ['DM2 de 20 años, neuropatía diabética conocida. HbA1c 8.5%. Hipertensión arterial controlada. Evolución insidiosa de parestesias distales.'],
      physicalExams: ['Fuerza 4+/5 dorsiflexores de tobillo. Arreflexia aquílea bilateral. Hipoestesia en calcetín hasta tercio medio de piernas. Romberg positivo.']
    },
    ncs: [
      { nerve: 'Peroneo', type: 'motor', latency: [4.0, 5.5], amplitude: [1.5, 3.5], velocity: [36, 44], normalRanges: NR.peronealMotor },
      { nerve: 'Sural', type: 'sensory', latency: [3.5, 5.0], amplitude: [1, 5], velocity: [34, 42], normalRanges: NR.suralSensory },
      { nerve: 'Tibial', type: 'motor', latency: [4.5, 6.0], amplitude: [2.0, 4.5], velocity: [37, 45], normalRanges: NR.tibialMotor },
      { nerve: 'Mediano', type: 'sensory', latency: [2.5, 3.5], amplitude: [12, 25], velocity: [48, 58], normalRanges: NR.medianSensory },
    ],
    emg: [
      { muscle: 'Tibialis Anterior', nerve: 'Peroneo profundo', root: 'L4-L5', insertionalActivity: ['normal'], fibrillations: ['absent', '1+'], positiveWaves: ['absent', '1+'], fasciculations: ['absent'], duration: [13, 18], amplitude: [4000, 8000], polyphasia: [25, 40], recruitment: ['reduced'] },
      { muscle: 'Gastrocnemius', nerve: 'Tibial', root: 'S1-S2', insertionalActivity: ['normal'], fibrillations: ['absent'], positiveWaves: ['absent'], fasciculations: ['absent'], duration: [13, 18], amplitude: [4000, 8000], polyphasia: [20, 35], recruitment: ['reduced'] },
      { muscle: 'Abductor Pollicis Brevis', nerve: 'Mediano', root: 'C8-T1', insertionalActivity: ['normal'], fibrillations: ['absent'], positiveWaves: ['absent'], fasciculations: ['absent'], duration: [9, 14], amplitude: [300, 3500], polyphasia: [5, 20], recruitment: ['normal'] },
    ],
    explanation: 'Neuropatía axonal crónica con reinervación: amplitudes reducidas con escasa actividad espontánea (la denervación activa ya cesó). Los PUM son de larga duración y alta amplitud por reinervación colateral crónica. Patrón longitud-dependiente (peor distalmente).',
    differentials: [
      { id: 'acute_axonal_neuropathy', name: 'Neuropatía Axonal Aguda', whyNot: 'La ausencia de actividad espontánea abundante y presencia de PUM gigantes de reinervación indica cronicidad.' },
      { id: 'l5_s1_radiculopathy', name: 'Radiculopatía L5-S1', whyNot: 'La distribución es longitud-dependiente simétrica, no sigue un patrón radicular. Las conducciones sensitivas están afectadas.' }
    ],
    recommendations: ['Optimización del control glucémico.', 'Evaluación con estudios seriados en 6-12 meses.', 'Manejo multidisciplinario: neurología, endocrinología, rehabilitación.']
  },

  // ═══════════ 4. NEUROPATÍA DESMIELINIZANTE ═══════════
  {
    patternId: 'demyelinating_neuropathy', patternName: 'Neuropatía Desmielinizante', category: 'demyelinating',
    patient: {
      ageRange: [30, 65], occupations: ['Empleado', 'Profesor', 'Abogado'],
      complaints: ['Debilidad progresiva en piernas y brazos de 6 semanas', 'Dificultad para subir escaleras y abrir frascos', 'Hormigueo difuso en manos y pies'],
      histories: ['Previamente sano. Inicio subagudo de debilidad simétrica ascendente. Antecedente de infección respiratoria hace 4 semanas. Arreflexia generalizada.'],
      physicalExams: ['Fuerza 3/5 proximal y 4/5 distal en 4 extremidades. Arreflexia global. Sensibilidad vibratoria disminuida en pies. Marcha inestable con base amplia.']
    },
    ncs: [
      { nerve: 'Mediano', type: 'motor', latency: [5.5, 8.0], amplitude: [3, 8], velocity: [28, 38], normalRanges: NR.medianMotor },
      { nerve: 'Cubital', type: 'motor', latency: [4.5, 7.0], amplitude: [4, 9], velocity: [30, 40], normalRanges: NR.ulnarMotor },
      { nerve: 'Peroneo', type: 'motor', latency: [6.0, 9.0], amplitude: [1.5, 5], velocity: [22, 35], normalRanges: NR.peronealMotor },
      { nerve: 'Mediano', type: 'sensory', latency: [3.8, 5.5], amplitude: [8, 25], velocity: [30, 42], normalRanges: NR.medianSensory },
    ],
    emg: [
      { muscle: 'Tibialis Anterior', nerve: 'Peroneo profundo', root: 'L4-L5', insertionalActivity: ['normal'], fibrillations: ['absent', '1+'], positiveWaves: ['absent'], fasciculations: ['absent'], duration: [9, 14], amplitude: [300, 3500], polyphasia: [10, 20], recruitment: ['reduced', 'normal'] },
      { muscle: 'First Dorsal Interosseous', nerve: 'Cubital', root: 'C8-T1', insertionalActivity: ['normal'], fibrillations: ['absent'], positiveWaves: ['absent'], fasciculations: ['absent'], duration: [8, 13], amplitude: [300, 3000], polyphasia: [5, 18], recruitment: ['normal'] },
    ],
    explanation: 'Patrón desmielinizante: velocidades de conducción marcadamente reducidas (<70% del límite inferior normal), latencias distales prolongadas (>130% del límite superior normal), con amplitudes relativamente preservadas. La EMG puede ser relativamente normal o mostrar cambios mínimos ya que la desmielinización no causa denervación directa.',
    differentials: [
      { id: 'acute_axonal_neuropathy', name: 'Neuropatía Axonal', whyNot: 'En la neuropatía axonal las velocidades están relativamente preservadas y las amplitudes están marcadamente reducidas; aquí es lo opuesto.' },
      { id: 'carpal_tunnel_syndrome_severe', name: 'STC Severo', whyNot: 'La desmielinización es generalizada, no focal. Múltiples nervios están afectados, no solo el mediano.' }
    ],
    recommendations: ['Punción lumbar para análisis de LCR (disociación albuminocitológica).', 'Considerar CIDP vs Guillain-Barré según temporalidad.', 'Evaluación inmunológica. Considerar tratamiento con IgIV o plasmaféresis.']
  },

  // ═══════════ 5. MIOPATÍA ═══════════
  {
    patternId: 'myopathy', patternName: 'Miopatía', category: 'myopathic',
    patient: {
      ageRange: [30, 60], sexBias: 'female',
      occupations: ['Maestra', 'Contadora', 'Enfermera'],
      complaints: ['Dificultad para levantar los brazos al peinarse', 'Debilidad para subir escaleras de 2 meses', 'Dificultad para levantarse de una silla sin usar las manos'],
      histories: ['Debilidad proximal simétrica progresiva. CK elevada (1200 UI/L). Rash heliotropo en párpados. Sospecha de dermatomiositis.'],
      physicalExams: ['Fuerza 3/5 proximal (deltoides, iliopsoas) y 5/5 distal. ROTs normales. Sin déficit sensitivo. Signo de Gowers positivo. Rash en región periorbital.']
    },
    ncs: [
      { nerve: 'Mediano', type: 'motor', latency: [2.8, 3.8], amplitude: [5, 10], velocity: [50, 62], normalRanges: NR.medianMotor },
      { nerve: 'Cubital', type: 'motor', latency: [2.2, 3.2], amplitude: [6, 12], velocity: [50, 62], normalRanges: NR.ulnarMotor },
      { nerve: 'Peroneo', type: 'motor', latency: [3.5, 5.2], amplitude: [2.5, 8], velocity: [42, 52], normalRanges: NR.peronealMotor },
      { nerve: 'Sural', type: 'sensory', latency: [2.8, 3.8], amplitude: [10, 28], velocity: [42, 52], normalRanges: NR.suralSensory },
    ],
    emg: [
      { muscle: 'Deltoides', nerve: 'Axilar', root: 'C5-C6', insertionalActivity: ['increased'], fibrillations: ['1+', '2+'], positiveWaves: ['1+', '2+'], fasciculations: ['absent'], duration: [4, 7], amplitude: [100, 500], polyphasia: [30, 50], recruitment: ['early'] },
      { muscle: 'Iliopsoas', nerve: 'Femoral', root: 'L2-L4', insertionalActivity: ['increased'], fibrillations: ['1+', '2+'], positiveWaves: ['1+'], fasciculations: ['absent'], duration: [4, 7], amplitude: [100, 500], polyphasia: [25, 45], recruitment: ['early'] },
      { muscle: 'Biceps Brachii', nerve: 'Musculocutáneo', root: 'C5-C6', insertionalActivity: ['increased'], fibrillations: ['1+'], positiveWaves: ['absent', '1+'], fasciculations: ['absent'], duration: [5, 8], amplitude: [150, 600], polyphasia: [20, 40], recruitment: ['early'] },
      { muscle: 'Tibialis Anterior', nerve: 'Peroneo profundo', root: 'L4-L5', insertionalActivity: ['normal'], fibrillations: ['absent'], positiveWaves: ['absent'], fasciculations: ['absent'], duration: [8, 13], amplitude: [300, 3000], polyphasia: [5, 15], recruitment: ['normal'] },
    ],
    explanation: 'Patrón miopático: PUM de corta duración, baja amplitud y polifásicos en músculos proximales. Reclutamiento precoz (muchas unidades motoras se activan con poco esfuerzo). Las conducciones nerviosas son normales ya que el problema es muscular, no neural. La fibrilación en miopatías inflamatorias indica necrosis de fibras musculares activa.',
    differentials: [
      { id: 'acute_axonal_neuropathy', name: 'Neuropatía Axonal', whyNot: 'En neuropatía los PUM son de larga duración y alta amplitud (reinervación); aquí son cortos y pequeños. El reclutamiento es precoz, no reducido.' },
      { id: 'als', name: 'ELA', whyNot: 'La distribución es proximal simétrica, no multisegmentaria. No hay fasciculaciones y el reclutamiento es precoz, no reducido.' },
      { id: 'myasthenia_gravis', name: 'Miastenia Gravis', whyNot: 'En MG los PUM son normales morfológicamente pero inestables (variabilidad). Aquí los PUM tienen morfología miopática clásica.' }
    ],
    recommendations: ['CK sérica, perfil tiroideo, anticuerpos miositis-específicos.', 'Biopsia muscular para confirmación diagnóstica.', 'RMN muscular para evaluar edema/inflamación activa.', 'Considerar tratamiento inmunosupresor si se confirma miopatía inflamatoria.']
  },

  // ═══════════ 6. STC MODERADO ═══════════
  {
    patternId: 'carpal_tunnel_syndrome_moderate', patternName: 'Síndrome del Túnel Carpiano Moderado', category: 'entrapment',
    patient: {
      ageRange: [35, 65], sexBias: 'female',
      occupations: ['Costurera', 'Secretaria', 'Cajera de supermercado'],
      complaints: ['Adormecimiento nocturno en dedos 1-3 de mano derecha', 'Dolor y hormigueo que despierta por la noche', 'Torpeza para abrochar botones y dificultad para sostener objetos'],
      histories: ['Parestesias en territorio del mediano de 8 meses de evolución, predominio nocturno. Hipotiroidismo en tratamiento. La paciente mueve las manos para aliviar los síntomas (flick sign positivo).'],
      physicalExams: ['Fuerza 4/5 abductor pollicis brevis derecho, 5/5 izquierdo. Tinel positivo en muñeca derecha. Phalen positivo bilateral (derecha en 15 seg, izquierda en 45 seg). Hipoestesia en pulpejo de dedos 1-3 derechos.']
    },
    ncs: [
      { nerve: 'Mediano', type: 'motor', latency: [4.8, 6.0], amplitude: [3, 6], velocity: [50, 60], normalRanges: NR.medianMotor },
      { nerve: 'Mediano', type: 'sensory', latency: [4.2, 5.5], amplitude: [5, 15], velocity: [32, 42], normalRanges: NR.medianSensory },
      { nerve: 'Cubital', type: 'motor', latency: [2.2, 3.2], amplitude: [7, 12], velocity: [52, 62], normalRanges: NR.ulnarMotor },
      { nerve: 'Cubital', type: 'sensory', latency: [2.1, 3.0], amplitude: [15, 35], velocity: [52, 62], normalRanges: NR.ulnarSensory },
    ],
    emg: [
      { muscle: 'Abductor Pollicis Brevis', nerve: 'Mediano', root: 'C8-T1', insertionalActivity: ['normal', 'increased'], fibrillations: ['1+', '2+'], positiveWaves: ['1+'], fasciculations: ['absent'], duration: [11, 16], amplitude: [3000, 6000], polyphasia: [20, 35], recruitment: ['reduced'] },
      { muscle: 'First Dorsal Interosseous', nerve: 'Cubital', root: 'C8-T1', insertionalActivity: ['normal'], fibrillations: ['absent'], positiveWaves: ['absent'], fasciculations: ['absent'], duration: [8, 13], amplitude: [300, 3000], polyphasia: [5, 15], recruitment: ['normal'] },
      { muscle: 'Pronator Teres', nerve: 'Mediano', root: 'C6-C7', insertionalActivity: ['normal'], fibrillations: ['absent'], positiveWaves: ['absent'], fasciculations: ['absent'], duration: [8, 13], amplitude: [300, 3500], polyphasia: [5, 15], recruitment: ['normal'] },
    ],
    explanation: 'STC moderado: latencia distal del mediano prolongada (sensitiva y motora) con amplitudes reducidas. El cubital es normal, lo que confirma que la lesión es focal en la muñeca. La EMG muestra denervación leve en APB (territorio del mediano distal) con pronador redondo normal (territorio proximal al túnel = lesión distal al carpo).',
    differentials: [
      { id: 'c6_c7_radiculopathy', name: 'Radiculopatía C6-C7', whyNot: 'En radiculopatía cervical el mediano sensitivo sería normal (lesión proximal al ganglio). Aquí el sensitivo está claramente afectado.' },
      { id: 'demyelinating_neuropathy', name: 'Neuropatía Desmielinizante', whyNot: 'Solo el mediano está afectado a nivel de la muñeca. Los demás nervios son normales; no es un proceso generalizado.' },
      { id: 'acute_axonal_neuropathy', name: 'Neuropatía Axonal', whyNot: 'La afectación es focal del mediano, no difusa. La velocidad está reducida focalmente (desmielinización focal), no las amplitudes de forma generalizada.' }
    ],
    recommendations: ['Férula nocturna en posición neutra de muñeca.', 'Infiltración con corticoesteroide si síntomas moderados-severos.', 'Considerar liberación quirúrgica si no mejora con tratamiento conservador en 3 meses.', 'Control de hipotiroidismo como factor contribuyente.']
  },

  // ═══════════ 7. RADICULOPATÍA C5-C6 ═══════════
  {
    patternId: 'c5_c6_radiculopathy', patternName: 'Radiculopatía C5-C6', category: 'radiculopathy',
    patient: {
      ageRange: [40, 70], occupations: ['Mecánico', 'Albañil', 'Conductor'],
      complaints: ['Dolor cervical irradiado al brazo derecho de 6 semanas', 'Debilidad para flexionar el codo', 'Adormecimiento en cara lateral del antebrazo y pulgar'],
      histories: ['Cervicobraquialgia derecha de inicio agudo tras esfuerzo físico. Dolor sigue distribución C5-C6. RMN cervical: hernia discal C5-C6 con compresión radicular derecha.'],
      physicalExams: ['Fuerza 4/5 bíceps y braquiorradial derechos. Reflejo bicipital disminuido derecho (+/++++). Hipoestesia cara lateral antebrazo y pulgar derecho. Spurling positivo a la derecha.']
    },
    ncs: [
      { nerve: 'Mediano', type: 'motor', latency: [2.8, 3.8], amplitude: [5, 10], velocity: [50, 60], normalRanges: NR.medianMotor },
      { nerve: 'Mediano', type: 'sensory', latency: [2.2, 3.2], amplitude: [18, 40], velocity: [50, 60], normalRanges: NR.medianSensory },
      { nerve: 'Cubital', type: 'motor', latency: [2.2, 3.2], amplitude: [7, 12], velocity: [50, 60], normalRanges: NR.ulnarMotor },
      { nerve: 'Radial', type: 'sensory', latency: [1.8, 2.8], amplitude: [15, 35], velocity: [50, 60], normalRanges: NR.radialSensory },
    ],
    emg: [
      { muscle: 'Biceps Brachii', nerve: 'Musculocutáneo', root: 'C5-C6', insertionalActivity: ['increased'], fibrillations: ['2+', '3+'], positiveWaves: ['2+'], fasciculations: ['absent'], duration: [12, 17], amplitude: [3000, 7000], polyphasia: [25, 40], recruitment: ['reduced'] },
      { muscle: 'Deltoides', nerve: 'Axilar', root: 'C5-C6', insertionalActivity: ['increased'], fibrillations: ['1+', '2+'], positiveWaves: ['1+', '2+'], fasciculations: ['absent'], duration: [11, 16], amplitude: [2500, 6000], polyphasia: [20, 35], recruitment: ['reduced'] },
      { muscle: 'Brachioradialis', nerve: 'Radial', root: 'C5-C6', insertionalActivity: ['increased'], fibrillations: ['1+', '2+'], positiveWaves: ['1+'], fasciculations: ['absent'], duration: [11, 16], amplitude: [2500, 6000], polyphasia: [20, 35], recruitment: ['reduced'] },
      { muscle: 'Triceps', nerve: 'Radial', root: 'C7-C8', insertionalActivity: ['normal'], fibrillations: ['absent'], positiveWaves: ['absent'], fasciculations: ['absent'], duration: [8, 13], amplitude: [300, 3500], polyphasia: [5, 15], recruitment: ['normal'] },
      { muscle: 'Cervical Paraspinals C5-C6', nerve: 'Ramo dorsal', root: 'C5-C6', insertionalActivity: ['increased'], fibrillations: ['2+'], positiveWaves: ['1+'], fasciculations: ['absent'], duration: [10, 14], amplitude: [300, 3000], polyphasia: [10, 20], recruitment: ['normal'] },
    ],
    explanation: 'Radiculopatía C5-C6: denervación activa en músculos del miotoma C5-C6 (bíceps, deltoides, braquiorradial) con paraespinales cervicales afectados (confirma nivel radicular). Los músculos del miotoma C7 (tríceps) están normales. Las conducciones nerviosas son normales porque la lesión radicular es proximal al ganglio dorsal (los sensitivos se preservan).',
    differentials: [
      { id: 'brachial_plexopathy', name: 'Plexopatía Braquial', whyNot: 'En plexopatía los paraespinales cervicales serían normales (lesión post-raíz). Aquí están afectados, confirmando el nivel radicular.' },
      { id: 'carpal_tunnel_syndrome_moderate', name: 'STC', whyNot: 'Los nervios sensitivos son normales. El patrón de debilidad sigue un miotoma, no un territorio de nervio periférico.' },
      { id: 'acute_axonal_neuropathy', name: 'Neuropatía Axonal', whyNot: 'La distribución sigue un miotoma (C5-C6), no un patrón longitud-dependiente. Las conducciones son normales.' }
    ],
    recommendations: ['Correlación con RMN cervical.', 'Tratamiento conservador inicial: analgesia, fisioterapia.', 'Si déficit motor progresivo, considerar evaluación neuroquirúrgica.', 'Seguimiento con EMG en 3-6 meses para evaluar reinervación.']
  },

  // ═══════════ 8. ELA ═══════════
  {
    patternId: 'als', patternName: 'Esclerosis Lateral Amiotrófica (ELA)', category: 'motor_neuron_disease',
    patient: {
      ageRange: [50, 75], occupations: ['Jubilado', 'Ingeniero', 'Comerciante'],
      complaints: ['Debilidad progresiva en mano derecha de 6 meses', 'Tropiezos frecuentes y caídas', 'Fasciculaciones visibles en brazos y piernas'],
      histories: ['Hombre de 62 años con debilidad progresiva que inició en mano derecha y se ha extendido a miembro inferior ipsilateral. Pérdida de peso de 8 kg. Sin dolor ni déficit sensitivo. Sin antecedentes familiares.'],
      physicalExams: ['Fuerza: 3/5 interóseos derechos, 4/5 deltoides bilateral, 4-/5 dorsiflexores derecho. Fasciculaciones visibles en deltoides, bíceps y cuádriceps bilateral. Hiperreflexia generalizada con Babinski bilateral. Sensibilidad normal. Atrofia de eminencia tenar derecha. Sin compromiso bulbar evidente.']
    },
    ncs: [
      { nerve: 'Mediano', type: 'motor', latency: [3.0, 4.0], amplitude: [2, 5], velocity: [48, 58], normalRanges: NR.medianMotor },
      { nerve: 'Cubital', type: 'motor', latency: [2.5, 3.5], amplitude: [3, 7], velocity: [48, 58], normalRanges: NR.ulnarMotor },
      { nerve: 'Peroneo', type: 'motor', latency: [3.5, 5.0], amplitude: [1, 4], velocity: [40, 50], normalRanges: NR.peronealMotor },
      { nerve: 'Mediano', type: 'sensory', latency: [2.2, 3.2], amplitude: [18, 45], velocity: [50, 62], normalRanges: NR.medianSensory },
      { nerve: 'Sural', type: 'sensory', latency: [2.8, 3.8], amplitude: [10, 28], velocity: [42, 52], normalRanges: NR.suralSensory },
    ],
    emg: [
      { muscle: 'First Dorsal Interosseous', nerve: 'Cubital', root: 'C8-T1', insertionalActivity: ['increased'], fibrillations: ['3+', '4+'], positiveWaves: ['3+'], fasciculations: ['present', 'frequent'], duration: [16, 25], amplitude: [5000, 12000], polyphasia: [30, 50], recruitment: ['discrete', 'reduced'] },
      { muscle: 'Biceps Brachii', nerve: 'Musculocutáneo', root: 'C5-C6', insertionalActivity: ['increased'], fibrillations: ['2+', '3+'], positiveWaves: ['2+'], fasciculations: ['present'], duration: [14, 22], amplitude: [4000, 10000], polyphasia: [25, 45], recruitment: ['reduced'] },
      { muscle: 'Tibialis Anterior', nerve: 'Peroneo profundo', root: 'L4-L5', insertionalActivity: ['increased'], fibrillations: ['2+', '3+'], positiveWaves: ['2+', '3+'], fasciculations: ['present'], duration: [14, 22], amplitude: [4000, 10000], polyphasia: [25, 40], recruitment: ['reduced'] },
      { muscle: 'Vastus Lateralis', nerve: 'Femoral', root: 'L2-L4', insertionalActivity: ['increased'], fibrillations: ['1+', '2+'], positiveWaves: ['1+'], fasciculations: ['present'], duration: [13, 20], amplitude: [3500, 9000], polyphasia: [20, 35], recruitment: ['reduced'] },
      { muscle: 'Thoracic Paraspinals T6', nerve: 'Ramo dorsal', root: 'T6', insertionalActivity: ['increased'], fibrillations: ['2+'], positiveWaves: ['2+'], fasciculations: ['absent'], duration: [10, 15], amplitude: [300, 3000], polyphasia: [15, 25], recruitment: ['normal'] },
      { muscle: 'Genioglossus', nerve: 'Hipogloso', root: 'Bulbar', insertionalActivity: ['normal'], fibrillations: ['absent'], positiveWaves: ['absent'], fasciculations: ['absent'], duration: [8, 13], amplitude: [300, 3000], polyphasia: [5, 15], recruitment: ['normal'] },
    ],
    explanation: 'Patrón de enfermedad de motoneurona: denervación activa Y crónica (PUM gigantes) en múltiples regiones corporales (cervical, torácica, lumbar). Fasciculaciones difusas. Las conducciones sensitivas son NORMALES (las motoneuronas sensitivas no se afectan en ELA). Las amplitudes motoras están reducidas por pérdida de axones motores. Cumple criterios de Awaji para ELA probable (denervación en 3 regiones).',
    differentials: [
      { id: 'chronic_axonal_neuropathy', name: 'Neuropatía Axonal Crónica', whyNot: 'Las conducciones sensitivas son completamente normales. En neuropatía axonal, los SNAP estarían reducidos. Además, las fasciculaciones difusas son atípicas de neuropatía.' },
      { id: 'c5_c6_radiculopathy', name: 'Radiculopatía Cervical', whyNot: 'La denervación afecta múltiples regiones (cervical, torácica, lumbar); una radiculopatía solo afectaría un nivel segmentario.' },
      { id: 'myopathy', name: 'Miopatía', whyNot: 'Los PUM son de larga duración y alta amplitud (neurogénicos), no cortos y pequeños (miopáticos). Las fasciculaciones son un hallazgo de neurona motora, no de miopatía.' }
    ],
    recommendations: ['🚨 URGENTE: Referencia a neurólogo especialista en enfermedad de motoneurona.', 'RMN cerebral y medular para descartar causas estructurales.', 'Evaluación respiratoria completa (capacidad vital forzada).', 'Descartar miméticos tratables: neuropatía motora multifocal (anti-GM1), CIDP motora.', 'Seguimiento EMG cada 3-6 meses para documentar progresión.']
  },
];

// Import expanded template sets
import { EXPANDED_TEMPLATES } from './CaseTemplatesExpanded';
import { EXPANDED_TEMPLATES_2 } from './CaseTemplatesExpanded2';
import { EXPANDED_TEMPLATES_3 } from './CaseTemplatesExpanded3';
import { EXPANDED_TEMPLATES_4 } from './CaseTemplatesExpanded4';

// Merge all templates into single array
export const ALL_CASE_TEMPLATES: CaseTemplate[] = [
  ...CASE_TEMPLATES,
  ...EXPANDED_TEMPLATES,
  ...EXPANDED_TEMPLATES_2,
  ...EXPANDED_TEMPLATES_3,
  ...EXPANDED_TEMPLATES_4,
];

// Exportar lista de opciones para el selector de diagnóstico (from ALL templates)
export const DIAGNOSIS_OPTIONS = ALL_CASE_TEMPLATES.map(t => ({
  patternId: t.patternId,
  patternName: t.patternName,
  category: t.category,
  description: t.explanation.split('.')[0] + '.',
}));
