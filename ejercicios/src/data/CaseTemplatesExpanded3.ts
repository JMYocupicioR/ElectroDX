// CaseTemplatesExpanded3.ts — Batch 3: Diabética, Radial, Miotónica, Miopatía Inflamatoria, AMAN, Critical Illness
import type { CaseTemplate } from './CaseTemplates';

const NR = {
  medianMotor:   { latency: [2.5, 4.2] as [number,number], amplitude: [4, 12] as [number,number], velocity: [49, 65] as [number,number] },
  medianSensory: { latency: [2.0, 3.5] as [number,number], amplitude: [15, 50] as [number,number], velocity: [50, 65] as [number,number] },
  ulnarMotor:    { latency: [2.0, 3.5] as [number,number], amplitude: [6, 14] as [number,number], velocity: [49, 65] as [number,number] },
  ulnarSensory:  { latency: [2.0, 3.2] as [number,number], amplitude: [10, 40] as [number,number], velocity: [50, 65] as [number,number] },
  peronealMotor: { latency: [3.0, 5.5] as [number,number], amplitude: [2, 10] as [number,number], velocity: [41, 55] as [number,number] },
  suralSensory:  { latency: [2.5, 4.0] as [number,number], amplitude: [6, 30] as [number,number], velocity: [40, 55] as [number,number] },
  tibialMotor:   { latency: [3.0, 5.8] as [number,number], amplitude: [4, 15] as [number,number], velocity: [41, 55] as [number,number] },
  radialSensory: { latency: [1.5, 2.9] as [number,number], amplitude: [15, 40] as [number,number], velocity: [50, 65] as [number,number] },
  radialMotor:   { latency: [2.0, 3.5] as [number,number], amplitude: [3, 10] as [number,number], velocity: [50, 65] as [number,number] },
};

export const EXPANDED_TEMPLATES_3: CaseTemplate[] = [
  // ═══════════ 24. POLINEUROPATÍA DIABÉTICA ═══════════
  {
    patternId: 'diabetic_polyneuropathy', patternName: 'Polineuropatía Diabética (Axonal Sensoriomotora)', category: 'axonal',
    patient: {
      ageRange: [50, 75], occupations: ['Jubilado diabético', 'Comerciante', 'Ama de casa'],
      complaints: ['Hormigueo y ardor en pies de 2 años', 'Siente como caminar sobre algodón', 'Dolor tipo quemazón nocturno en plantas'],
      histories: ['Hombre de 62 años, DM2 de 15 años, HbA1c 8.5%. Parestesias progresivas ascendentes en calcetín. Tropiezos frecuentes. Úlcera plantar previa. Nefropatía diabética estadio III.'],
      physicalExams: ['Hipoestesia en distribución calcetín hasta pantorrillas bilateral. Vibración abolida en ortejos. Reflejo aquíleo abolido bilateral, patelar hipoactivo. Fza 4/5 dorsiflexores e inversores bilateral. Pies secos, callosos. Pulsos pedios débiles.']
    },
    ncs: [
      { nerve: 'Sural', type: 'sensory', latency: [3.5, 5.0], amplitude: [1, 5], velocity: [32, 42], normalRanges: NR.suralSensory },
      { nerve: 'Peroneo superficial', type: 'sensory', latency: [3.5, 5.0], amplitude: [1, 6], velocity: [32, 44], normalRanges: { latency: [2.5, 3.8] as [number,number], amplitude: [5, 20] as [number,number], velocity: [40, 55] as [number,number] } },
      { nerve: 'Mediano', type: 'sensory', latency: [2.5, 3.8], amplitude: [8, 22], velocity: [42, 52], normalRanges: NR.medianSensory },
      { nerve: 'Peroneo', type: 'motor', latency: [4.0, 6.0], amplitude: [1, 4], velocity: [35, 44], normalRanges: NR.peronealMotor },
      { nerve: 'Tibial', type: 'motor', latency: [4.5, 6.5], amplitude: [2, 6], velocity: [35, 44], normalRanges: NR.tibialMotor },
      { nerve: 'Mediano', type: 'motor', latency: [3.0, 4.5], amplitude: [4, 10], velocity: [46, 56], normalRanges: NR.medianMotor },
    ],
    lateResponses: [
      { type: 'h_reflex', nerve: 'Tibial', latency: [36, 45], normalRange: [28, 34], status: ['abnormal', 'absent'] },
    ],
    emg: [
      { muscle: 'Tibialis Anterior', nerve: 'Peroneo profundo', root: 'L4-L5', insertionalActivity: ['increased'], fibrillations: ['1+','2+'], positiveWaves: ['1+'], fasciculations: ['absent'], duration: [10, 16], amplitude: [2000, 6000], polyphasia: [15, 30], recruitment: ['reduced'] },
      { muscle: 'Gastrocnemius medial', nerve: 'Tibial', root: 'S1-S2', insertionalActivity: ['increased'], fibrillations: ['1+','2+'], positiveWaves: ['1+','2+'], fasciculations: ['absent'], duration: [10, 16], amplitude: [2000, 5000], polyphasia: [15, 30], recruitment: ['reduced'] },
      { muscle: 'Abductor Hallucis', nerve: 'Tibial', root: 'S1-S2', insertionalActivity: ['increased'], fibrillations: ['2+','3+'], positiveWaves: ['2+'], fasciculations: ['absent'], duration: [10, 16], amplitude: [1500, 5000], polyphasia: [20, 35], recruitment: ['reduced', 'discrete'] },
      { muscle: 'First Dorsal Interosseous', nerve: 'Cubital', root: 'C8-T1', insertionalActivity: ['normal'], fibrillations: ['absent'], positiveWaves: ['absent'], fasciculations: ['absent'], duration: [8, 13], amplitude: [300, 3500], polyphasia: [5, 15], recruitment: ['normal'] },
      { muscle: 'Vastus Lateralis', nerve: 'Femoral', root: 'L2-L4', insertionalActivity: ['normal'], fibrillations: ['absent'], positiveWaves: ['absent'], fasciculations: ['absent'], duration: [8, 13], amplitude: [300, 3500], polyphasia: [5, 15], recruitment: ['normal'] },
    ],
    explanation: 'Polineuropatía diabética: PATRÓN LONGITUD-DEPENDIENTE clásico. Los nervios MÁS DISTALES (sural, peroneo superficial en pie) son los más afectados. Los nervios de MMSS (mediano) están relativamente preservados. Patrón AXONAL (amplitudes bajas, velocidades levemente reducidas — la reducción de velocidad es SECUNDARIA a pérdida de fibras rápidas, no desmielinización primaria). EMG muestra denervación crónica con reinervación en músculos distales de MMII. H-reflex abolido (S1 sensible tempranamente).',
    differentials: [
      { id: 'demyelinating_neuropathy', name: 'Neuropatía Desmielinizante', whyNot: 'Las velocidades están solo LEVEMENTE reducidas (secundario a pérdida axonal). En desmielinización verdadera las velocidades serían <70% del LIN.' },
      { id: 'cidp', name: 'CIDP', whyNot: 'Patrón longitud-dependiente puro. En CIDP hay afectación PROXIMAL y DISTAL simétrica con bloqueos de conducción.' },
    ],
    recommendations: ['Control glucémico estricto (HbA1c <7%).', 'Manejo del dolor neuropático (gabapentina, pregabalina, duloxetina).', 'Cuidado de pies y prevención de úlceras.', 'EMG anual de seguimiento.'],
    severityGrade: 'moderate', severityExplanation: 'Denervación activa distal con reinervación crónica. Sural severamente afectado.'
  },

  // ═══════════ 25. NEUROPATÍA RADIAL (PARÁLISIS DEL SÁBADO POR LA NOCHE) ═══════════
  {
    patternId: 'radial_neuropathy_spiral_groove', patternName: 'Neuropatía Radial en Canal de Torsión', category: 'entrapment',
    patient: {
      ageRange: [25, 55], sexBias: 'male', occupations: ['Fiestero', 'Alcohólico', 'Paciente pos-anestesia'],
      complaints: ['Muñeca caída al despertar', 'No puede extender la muñeca ni los dedos'],
      histories: ['Hombre de 35 años que despertó con muñeca caída derecha tras noche de alcohol intenso, quedó dormido con el brazo sobre el respaldo de una silla. Sin dolor cervical. Sin trauma directo.'],
      physicalExams: ['Caída de muñeca der (wrist drop). Fza 0/5 extensores de muñeca, 1/5 extensores de dedos, 2/5 supinador. 5/5 tríceps (normal). Hipoestesia dorso primer espacio interdigital. Sensibilidad mediana y cubital normales. Reflejo tricipital normal.']
    },
    ncs: [
      { nerve: 'Radial', type: 'motor', latency: [3.0, 4.5], amplitude: [0.5, 3.0], velocity: [40, 52], normalRanges: NR.radialMotor, stimulationSite: 'distal' },
      { nerve: 'Radial (por encima canal torsión)', type: 'motor', latency: [6.0, 9.0], amplitude: [0.3, 1.5], velocity: [25, 38], normalRanges: NR.radialMotor, stimulationSite: 'proximal', proximalAmplitude: [0.3, 1.5], conductionBlock: true },
      { nerve: 'Radial', type: 'sensory', latency: [2.0, 3.0], amplitude: [5, 18], velocity: [42, 55], normalRanges: NR.radialSensory },
      { nerve: 'Mediano', type: 'motor', latency: [2.8, 3.8], amplitude: [6, 12], velocity: [50, 62], normalRanges: NR.medianMotor },
      { nerve: 'Mediano', type: 'sensory', latency: [2.2, 3.2], amplitude: [20, 45], velocity: [52, 62], normalRanges: NR.medianSensory },
      { nerve: 'Cubital', type: 'motor', latency: [2.2, 3.2], amplitude: [7, 13], velocity: [50, 62], normalRanges: NR.ulnarMotor },
    ],
    emg: [
      { muscle: 'Extensor Digitorum Communis', nerve: 'Interóseo posterior', root: 'C7-C8', insertionalActivity: ['increased'], fibrillations: ['2+','3+'], positiveWaves: ['2+'], fasciculations: ['absent'], duration: [8, 12], amplitude: [200, 2000], polyphasia: [10, 20], recruitment: ['discrete', 'absent'] },
      { muscle: 'Extensor Carpi Radialis', nerve: 'Radial', root: 'C6-C7', insertionalActivity: ['increased'], fibrillations: ['2+','3+'], positiveWaves: ['2+'], fasciculations: ['absent'], duration: [8, 12], amplitude: [200, 2000], polyphasia: [10, 20], recruitment: ['discrete'] },
      { muscle: 'Supinator', nerve: 'Interóseo posterior', root: 'C5-C6', insertionalActivity: ['increased'], fibrillations: ['1+','2+'], positiveWaves: ['1+'], fasciculations: ['absent'], duration: [8, 12], amplitude: [200, 2500], polyphasia: [10, 20], recruitment: ['reduced'] },
      { muscle: 'Triceps', nerve: 'Radial', root: 'C7-C8', insertionalActivity: ['normal'], fibrillations: ['absent'], positiveWaves: ['absent'], fasciculations: ['absent'], duration: [8, 13], amplitude: [300, 3500], polyphasia: [5, 15], recruitment: ['normal'] },
      { muscle: 'Brachioradialis', nerve: 'Radial', root: 'C5-C6', insertionalActivity: ['normal', 'increased'], fibrillations: ['absent', '1+'], positiveWaves: ['absent'], fasciculations: ['absent'], duration: [8, 13], amplitude: [300, 3500], polyphasia: [5, 15], recruitment: ['normal', 'reduced'] },
    ],
    explanation: 'Neuropatía radial en canal de torsión (spiral groove): localización CLAVE por el patrón de músculos afectados. El TRÍCEPS está NORMAL (se ramifica PROXIMAL al canal de torsión). Los extensores de muñeca/dedos y supinador están denervados. El braquiorradial puede estar normal o levemente afectado (se ramifica justo a nivel del canal). SNAP radial puede estar normal o reducido. La electrolocalización confirma bloqueo/enlentecimiento en el canal de torsión.',
    differentials: [
      { id: 'c7_radiculopathy', name: 'Radiculopatía C7', whyNot: 'En radiculopatía C7, el tríceps estaría afectado. Aquí está NORMAL → lesión distal a la rama del tríceps. Además, el SNAP radial está reducido (post-ganglionar).' },
      { id: 'posterior_interosseous_syn', name: 'Síndrome Interóseo Posterior', whyNot: 'En SIP el braquiorradial y ECRL estarían normales (se ramifican antes de la arcada de Fröhse). Aquí están afectados → lesión más proximal (canal de torsión).' },
    ],
    recommendations: ['Férula para muñeca caída.', 'Pronóstico generalmente bueno (compresión, no sección).', 'EMG de seguimiento a 6-8 semanas para evaluar reinervación.', 'Evitar compresión recurrente.'],
    severityGrade: 'moderate', severityExplanation: 'Bloqueo de conducción con denervación activa, pero mecanismo compresivo sugiere buen pronóstico.'
  },

  // ═══════════ 26. DISTROFIA MIOTÓNICA ═══════════
  {
    patternId: 'myotonic_dystrophy', patternName: 'Distrofia Miotónica Tipo 1 (Steinert)', category: 'myopathic',
    patient: {
      ageRange: [25, 50], occupations: ['Oficinista', 'Operador', 'Maestro'],
      complaints: ['No puede soltar objetos después de agarrarlos', 'Debilidad progresiva en manos y pies caídos'],
      histories: ['Hombre de 38 años con dificultad para soltar la mano al saludar (miotonía de prensión). Debilidad progresiva distal. Facies alargada, ptosis bilateral, atrofia temporal. Padre con cataratas precoces.'],
      physicalExams: ['Facies miopática con atrofia temporal y maseteros. Ptosis bilateral leve. Miotonía de prensión evidente (3-4 segundos para soltar). Miotonía de percusión en eminencia tenar. Fza 3/5 extensores de muñeca bilateral, 4/5 dorsiflexores pie. Calvicie frontal. Cataratas leves.']
    },
    ncs: [
      { nerve: 'Mediano', type: 'motor', latency: [2.8, 4.0], amplitude: [3, 8], velocity: [48, 58], normalRanges: NR.medianMotor },
      { nerve: 'Cubital', type: 'motor', latency: [2.2, 3.5], amplitude: [4, 10], velocity: [48, 58], normalRanges: NR.ulnarMotor },
      { nerve: 'Peroneo', type: 'motor', latency: [3.5, 5.5], amplitude: [1.5, 5], velocity: [38, 48], normalRanges: NR.peronealMotor },
      { nerve: 'Mediano', type: 'sensory', latency: [2.2, 3.5], amplitude: [10, 30], velocity: [48, 58], normalRanges: NR.medianSensory },
      { nerve: 'Sural', type: 'sensory', latency: [2.8, 4.0], amplitude: [5, 20], velocity: [38, 50], normalRanges: NR.suralSensory },
    ],
    emg: [
      { muscle: 'First Dorsal Interosseous', nerve: 'Cubital', root: 'C8-T1', insertionalActivity: ['increased'], fibrillations: ['1+'], positiveWaves: ['1+'], fasciculations: ['absent'], duration: [5, 9], amplitude: [100, 800], polyphasia: [20, 40], recruitment: ['early', 'normal'], myotonicDischarges: ['present'] },
      { muscle: 'Extensor Digitorum Communis', nerve: 'Interóseo posterior', root: 'C7-C8', insertionalActivity: ['increased'], fibrillations: ['absent', '1+'], positiveWaves: ['absent'], fasciculations: ['absent'], duration: [5, 9], amplitude: [100, 800], polyphasia: [20, 35], recruitment: ['early'], myotonicDischarges: ['present'] },
      { muscle: 'Tibialis Anterior', nerve: 'Peroneo profundo', root: 'L4-L5', insertionalActivity: ['increased'], fibrillations: ['absent', '1+'], positiveWaves: ['absent', '1+'], fasciculations: ['absent'], duration: [5, 9], amplitude: [100, 800], polyphasia: [20, 35], recruitment: ['early'], myotonicDischarges: ['present'] },
      { muscle: 'Temporalis', nerve: 'Trigémino (V3)', root: 'Tronco', insertionalActivity: ['increased'], fibrillations: ['absent'], positiveWaves: ['absent'], fasciculations: ['absent'], duration: [4, 8], amplitude: [100, 600], polyphasia: [25, 40], recruitment: ['early'], myotonicDischarges: ['present'] },
      { muscle: 'Deltoides', nerve: 'Axilar', root: 'C5-C6', insertionalActivity: ['normal'], fibrillations: ['absent'], positiveWaves: ['absent'], fasciculations: ['absent'], duration: [8, 13], amplitude: [300, 3500], polyphasia: [5, 15], recruitment: ['normal'] },
    ],
    explanation: 'Distrofia Miotónica Tipo 1 (Steinert): HALLAZGO PATOGNOMÓNICO = descargas miotónicas difusas ("bombardero en picada" — frecuencia y amplitud waxing-waning). A diferencia de otras miopatías, la debilidad es DISTAL (no proximal), afectando extensores de muñeca y dorsiflexores. MUPs cortos, de baja amplitud, polifásicos con reclutamiento precoz = patrón miopático. NCS pueden mostrar CMAPs levemente reducidos. Es una ENFERMEDAD MULTISISTÉMICA (cataratas, calvicie, cardiomiopatía, resistencia insulínica).',
    differentials: [
      { id: 'myopathy', name: 'Miopatía Proximal', whyNot: 'La debilidad aquí es DISTAL (extensores/dorsiflexores), no proximal. El patrón de atrofia temporal y maseteros es típico de DM1. Las descargas miotónicas no ocurren en miopatías inflamatorias.' },
      { id: 'chronic_axonal_neuropathy', name: 'Neuropatía Axonal Crónica', whyNot: 'Los MUPs son CORTOS y de baja amplitud (miopáticos), no largos/altos (neurogénicos). Las descargas miotónicas son diagnósticas.' },
    ],
    recommendations: ['🫀 Evaluación cardiológica (ECG, ecocardiograma) — riesgo de arritmias.', 'Estudio genético (expansión CTG en DMPK).', 'Evaluación oftalmológica.', 'Mexiletina para miotonía si es sintomática.', 'Consejo genético (herencia AD con anticipación).']
  },

  // ═══════════ 27. MIOPATÍA INFLAMATORIA (POLIMIOSITIS) ═══════════
  {
    patternId: 'inflammatory_myopathy', patternName: 'Miopatía Inflamatoria (Polimiositis)', category: 'myopathic',
    patient: {
      ageRange: [30, 60], sexBias: 'female', occupations: ['Profesora', 'Secretaria', 'Enfermera'],
      complaints: ['No puede subir escaleras ni levantar los brazos', 'Debilidad progresiva de 3 meses'],
      histories: ['Mujer de 45 años con debilidad proximal progresiva de 3 meses. No puede subir escaleras, peinarse ni levantar objetos pesados. Mialgias ocasionales. CPK elevada (3500 U/L). Sin lesiones cutáneas. Sin disfagia.'],
      physicalExams: ['Fza 3/5 proximal MMSS bilateral (deltoides, bíceps), 3/5 proximal MMII (iliopsoas, cuádriceps). 5/5 distal bilateral. Sensibilidad normal. Reflejos normales. Sin contractura muscular. Sin dolor a la palpación significativo.']
    },
    ncs: [
      { nerve: 'Mediano', type: 'motor', latency: [2.8, 3.8], amplitude: [5, 11], velocity: [50, 62], normalRanges: NR.medianMotor },
      { nerve: 'Cubital', type: 'motor', latency: [2.2, 3.2], amplitude: [7, 13], velocity: [50, 62], normalRanges: NR.ulnarMotor },
      { nerve: 'Peroneo', type: 'motor', latency: [3.5, 5.0], amplitude: [3, 9], velocity: [42, 52], normalRanges: NR.peronealMotor },
      { nerve: 'Mediano', type: 'sensory', latency: [2.2, 3.2], amplitude: [20, 45], velocity: [52, 62], normalRanges: NR.medianSensory },
      { nerve: 'Sural', type: 'sensory', latency: [2.8, 3.8], amplitude: [10, 28], velocity: [42, 52], normalRanges: NR.suralSensory },
    ],
    emg: [
      { muscle: 'Deltoides', nerve: 'Axilar', root: 'C5-C6', insertionalActivity: ['increased'], fibrillations: ['2+','3+'], positiveWaves: ['2+','3+'], fasciculations: ['absent'], duration: [4, 8], amplitude: [100, 600], polyphasia: [25, 45], recruitment: ['early'] },
      { muscle: 'Biceps Brachii', nerve: 'Musculocutáneo', root: 'C5-C6', insertionalActivity: ['increased'], fibrillations: ['2+','3+'], positiveWaves: ['2+'], fasciculations: ['absent'], duration: [4, 8], amplitude: [100, 600], polyphasia: [25, 45], recruitment: ['early'] },
      { muscle: 'Iliopsoas', nerve: 'Femoral', root: 'L1-L3', insertionalActivity: ['increased'], fibrillations: ['2+','3+'], positiveWaves: ['2+','3+'], fasciculations: ['absent'], duration: [4, 8], amplitude: [100, 600], polyphasia: [25, 50], recruitment: ['early'] },
      { muscle: 'Vastus Lateralis', nerve: 'Femoral', root: 'L2-L4', insertionalActivity: ['increased'], fibrillations: ['2+','3+'], positiveWaves: ['2+'], fasciculations: ['absent'], duration: [4, 8], amplitude: [100, 600], polyphasia: [25, 40], recruitment: ['early'] },
      { muscle: 'Tibialis Anterior', nerve: 'Peroneo profundo', root: 'L4-L5', insertionalActivity: ['normal'], fibrillations: ['absent'], positiveWaves: ['absent'], fasciculations: ['absent'], duration: [8, 13], amplitude: [300, 3500], polyphasia: [5, 15], recruitment: ['normal'] },
      { muscle: 'Lumbar Paraspinals', nerve: 'Ramo dorsal', root: 'L1-L5', insertionalActivity: ['increased'], fibrillations: ['1+','2+'], positiveWaves: ['1+'], fasciculations: ['absent'], duration: [4, 8], amplitude: [100, 800], polyphasia: [20, 35], recruitment: ['normal'] },
    ],
    explanation: 'Miopatía inflamatoria (Polimiositis): NCS completamente NORMALES (la enfermedad es muscular, no nerviosa). EMG muestra el patrón clásico IRRITABLE + MIOPÁTICO: MUPs cortos, de baja amplitud, polifásicos CON fibrilaciones y PSW abundantes (la actividad espontánea indica NECROSIS muscular activa, no denervación). Distribución PROXIMAL (deltoides, bíceps, iliopsoas, cuádriceps). Músculos distales NORMALES. Los paraespinales también pueden mostrar actividad espontánea. CPK muy elevada apoya el diagnóstico.',
    differentials: [
      { id: 'myopathy', name: 'Miopatía No-Inflamatoria (Distrofia)', whyNot: 'Las MUPs cortas + polifásicas son similares, PERO la actividad espontánea abundante (fibrilaciones/PSW) NO es típica de distrofias. Indica inflamación/necrosis activa → inflamatoria.' },
      { id: 'als', name: 'ELA', whyNot: 'Los MUPs son CORTOS y de baja amplitud (miopáticos), NO largos y de alta amplitud (neurogénicos). El reclutamiento es PRECOZ, no reducido. Las NCS sensitivas son normales en ambos, pero el patrón EMG es completamente diferente.' },
    ],
    recommendations: ['Biopsia muscular (confirma inflamación endomisial).', 'Anticuerpos específicos de miositis (anti-Jo-1, anti-Mi-2, anti-SRP).', 'Corticosteroides como primera línea.', 'Screening de neoplasia (dermatomiositis > polimiositis).', 'CPK seriada para monitorear respuesta.'],
    severityGrade: 'severe', severityExplanation: 'Actividad inflamatoria activa con denervación/necrosis difusa proximal. CPK muy elevada.'
  },

  // ═══════════ 28. GBS AXONAL (AMAN) ═══════════
  {
    patternId: 'gbs_axonal_aman', patternName: 'Guillain-Barré Axonal (AMAN)', category: 'axonal',
    patient: {
      ageRange: [15, 50], occupations: ['Estudiante', 'Trabajador rural', 'Cocinero'],
      complaints: ['Debilidad rápida en brazos y piernas de 3 días', 'No puede mover los pies ni las manos'],
      histories: ['Hombre de 28 años con gastroenteritis por Campylobacter hace 10 días. Debilidad motora pura rápidamente progresiva, simétrica, de predominio distal. Sin parestesias significativas. Arreflexia. Evolución en 72 horas.'],
      physicalExams: ['Fza 2/5 distal MMII, 3/5 proximal MMII, 3/5 distal MMSS, 4/5 proximal MMSS. Arreflexia generalizada. Sensibilidad NORMAL. Sin compromiso respiratorio actual. Pares craneales normales.']
    },
    ncs: [
      { nerve: 'Mediano', type: 'motor', latency: [3.0, 4.5], amplitude: [0.5, 2.5], velocity: [46, 58], normalRanges: NR.medianMotor },
      { nerve: 'Cubital', type: 'motor', latency: [2.5, 3.8], amplitude: [0.5, 3.0], velocity: [46, 58], normalRanges: NR.ulnarMotor },
      { nerve: 'Peroneo', type: 'motor', latency: [3.5, 5.5], amplitude: [0, 1.5], velocity: [38, 50], normalRanges: NR.peronealMotor },
      { nerve: 'Tibial', type: 'motor', latency: [3.5, 5.8], amplitude: [0.5, 2.5], velocity: [38, 50], normalRanges: NR.tibialMotor },
      { nerve: 'Mediano', type: 'sensory', latency: [2.2, 3.2], amplitude: [18, 42], velocity: [52, 62], normalRanges: NR.medianSensory },
      { nerve: 'Sural', type: 'sensory', latency: [2.8, 3.8], amplitude: [10, 28], velocity: [42, 52], normalRanges: NR.suralSensory },
    ],
    lateResponses: [
      { type: 'f_wave', nerve: 'Mediano', minLatency: [28, 35], persistence: [20, 60], normalRange: [24, 32], status: ['normal', 'abnormal'] },
      { type: 'f_wave', nerve: 'Tibial', minLatency: [48, 58], persistence: [10, 40], normalRange: [44, 56], status: ['normal', 'abnormal'] },
    ],
    emg: [
      { muscle: 'Tibialis Anterior', nerve: 'Peroneo profundo', root: 'L4-L5', insertionalActivity: ['increased'], fibrillations: ['2+','3+'], positiveWaves: ['2+','3+'], fasciculations: ['absent'], duration: [8, 13], amplitude: [200, 3000], polyphasia: [10, 25], recruitment: ['reduced', 'discrete'] },
      { muscle: 'First Dorsal Interosseous', nerve: 'Cubital', root: 'C8-T1', insertionalActivity: ['increased'], fibrillations: ['2+','3+'], positiveWaves: ['2+'], fasciculations: ['absent'], duration: [8, 13], amplitude: [200, 2500], polyphasia: [10, 20], recruitment: ['reduced', 'discrete'] },
      { muscle: 'Abductor Pollicis Brevis', nerve: 'Mediano', root: 'C8-T1', insertionalActivity: ['increased'], fibrillations: ['1+','2+'], positiveWaves: ['1+','2+'], fasciculations: ['absent'], duration: [8, 13], amplitude: [200, 3000], polyphasia: [10, 20], recruitment: ['reduced'] },
    ],
    explanation: 'AMAN (Acute Motor Axonal Neuropathy): variante AXONAL del GBS. CMAPs MUY reducidos PERO velocidades relativamente PRESERVADAS (sin desmielinización significativa). SNAPs completamente NORMALES → afecta SOLO axones motores. Ondas F pueden estar normales o levemente prolongadas (a diferencia de AIDP donde son muy anormales). Denervación activa temprana abundante. Asociación fuerte con Campylobacter jejuni y anti-GM1/anti-GD1a. Pronóstico puede ser peor que AIDP por daño axonal directo.',
    differentials: [
      { id: 'gbs_classic', name: 'GBS (AIDP)', whyNot: 'En AIDP las velocidades están MUY reducidas con bloqueos de conducción y dispersión temporal. Aquí las velocidades están relativamente preservadas → patrón axonal, no desmielinizante.' },
      { id: 'als', name: 'ELA', whyNot: 'Curso AGUDO (días) con antecedente infeccioso. ELA es crónica progresiva sin relación infecciosa. Sin signos de motoneurona superior.' },
    ],
    recommendations: ['🚨 Hospitalización y monitoreo respiratorio.', 'IVIg o plasmaféresis.', 'Anticuerpos anti-gangliosido (GM1, GD1a).', 'Pronóstico más reservado que AIDP — recuperación más lenta.'],
    severityGrade: 'severe', severityExplanation: 'Daño axonal motor difuso agudo con CMAPs muy reducidos.'
  },

  // ═══════════ 29. NEUROPATÍA/MIOPATÍA DEL PACIENTE CRÍTICO ═══════════
  {
    patternId: 'critical_illness_polyneuromyopathy', patternName: 'Polineuromiopatía del Paciente Crítico (CIP/CIM)', category: 'axonal',
    patient: {
      ageRange: [40, 75], occupations: ['Paciente UCI', 'Post-sepsis', 'Pos-ventilador'],
      complaints: ['Debilidad generalizada tras estancia en UCI', 'No puede destetarse del ventilador'],
      histories: ['Hombre de 58 años con 3 semanas en UCI por sepsis con falla multiorgánica y ventilación mecánica. Recibió esteroides y bloqueadores neuromusculares. Al mejorar la sedación, se detecta cuadriplejía flácida con incapacidad para destetarse del ventilador. Sin nivel sensitivo.'],
      physicalExams: ['Fza 1-2/5 en las 4 extremidades (proximal y distal). Hiporreflexia generalizada. Atrofia muscular difusa (desuso + denervación). Sensibilidad difícil de evaluar por sedación residual. Sin fasciculaciones. Diafragma débil (excursión reducida en fluoroscopia).']
    },
    ncs: [
      { nerve: 'Mediano', type: 'motor', latency: [3.0, 4.5], amplitude: [0.5, 3.0], velocity: [42, 55], normalRanges: NR.medianMotor },
      { nerve: 'Cubital', type: 'motor', latency: [2.5, 3.8], amplitude: [0.5, 3.5], velocity: [42, 55], normalRanges: NR.ulnarMotor },
      { nerve: 'Peroneo', type: 'motor', latency: [3.5, 5.5], amplitude: [0, 1.5], velocity: [35, 48], normalRanges: NR.peronealMotor },
      { nerve: 'Tibial', type: 'motor', latency: [3.5, 6.0], amplitude: [0.5, 3.0], velocity: [35, 48], normalRanges: NR.tibialMotor },
      { nerve: 'Mediano', type: 'sensory', latency: [2.5, 3.8], amplitude: [3, 15], velocity: [40, 52], normalRanges: NR.medianSensory },
      { nerve: 'Sural', type: 'sensory', latency: [3.0, 4.2], amplitude: [2, 10], velocity: [35, 48], normalRanges: NR.suralSensory },
    ],
    emg: [
      { muscle: 'Tibialis Anterior', nerve: 'Peroneo profundo', root: 'L4-L5', insertionalActivity: ['increased'], fibrillations: ['2+','3+'], positiveWaves: ['2+','3+'], fasciculations: ['absent'], duration: [6, 11], amplitude: [100, 2000], polyphasia: [20, 40], recruitment: ['discrete', 'absent'] },
      { muscle: 'Deltoides', nerve: 'Axilar', root: 'C5-C6', insertionalActivity: ['increased'], fibrillations: ['2+','3+'], positiveWaves: ['2+'], fasciculations: ['absent'], duration: [5, 10], amplitude: [100, 1500], polyphasia: [20, 40], recruitment: ['discrete', 'reduced'] },
      { muscle: 'Vastus Lateralis', nerve: 'Femoral', root: 'L2-L4', insertionalActivity: ['increased'], fibrillations: ['2+','3+'], positiveWaves: ['2+','3+'], fasciculations: ['absent'], duration: [5, 10], amplitude: [100, 1500], polyphasia: [20, 40], recruitment: ['discrete'] },
      { muscle: 'First Dorsal Interosseous', nerve: 'Cubital', root: 'C8-T1', insertionalActivity: ['increased'], fibrillations: ['1+','2+'], positiveWaves: ['1+','2+'], fasciculations: ['absent'], duration: [6, 11], amplitude: [100, 2000], polyphasia: [15, 35], recruitment: ['reduced', 'discrete'] },
      { muscle: 'Diaphragm', nerve: 'Frénico', root: 'C3-C5', insertionalActivity: ['increased'], fibrillations: ['1+','2+'], positiveWaves: ['1+'], fasciculations: ['absent'], duration: [5, 10], amplitude: [100, 1500], polyphasia: [15, 30], recruitment: ['reduced'] },
    ],
    explanation: 'CIP/CIM (Critical Illness Polyneuropathy/Myopathy): patrón MIXTO neuropático + miopático. NCS muestran patrón AXONAL difuso (CMAPs Y SNAPs reducidos con velocidades relativamente preservadas). EMG muestra elementos mixtos: fibrilaciones abundantes (denervación) + MUPs que pueden ser cortos y polifásicos (miopatía) o largos (neurogénicos) dependiendo del componente dominante. La afectación del DIAFRAGMA (nervio frénico) explica la dificultad de destete ventilatorio. Factores de riesgo: sepsis, esteroides, bloqueadores NM, hiperglicemia.',
    differentials: [
      { id: 'gbs_classic', name: 'GBS', whyNot: 'Los SNAPs están reducidos (GBS los preserva más en AIDP). No hay desmielinización. El contexto es de enfermedad crítica prolongada, no post-infeccioso agudo.' },
      { id: 'myopathy', name: 'Miopatía Pura', whyNot: 'Los SNAPs están reducidos → hay componente neuropático además del miopático. Es un proceso MIXTO (CIP + CIM).' },
    ],
    recommendations: ['Rehabilitación intensiva temprana.', 'Control de factores de riesgo (glucemia, reducir esteroides/BNM).', 'EMG de seguimiento a 3-6 meses.', 'Estimulación neuromuscular eléctrica.', 'Pronóstico variable — puede tardar meses en recuperar.'],
    severityGrade: 'very_severe', severityExplanation: 'Daño axonal y miopático difuso con compromiso diafragmático.'
  },

  // ═══════════ 30. MIOSITIS POR CUERPOS DE INCLUSIÓN (IBM) — TRAMPA ═══════════
  {
    patternId: 'inclusion_body_myositis', patternName: 'Miositis por Cuerpos de Inclusión (IBM)', category: 'pitfall',
    patient: {
      ageRange: [55, 75], sexBias: 'male', occupations: ['Jubilado', 'Profesor universitario', 'Ingeniero'],
      complaints: ['Debilidad progresiva de piernas y manos de 3 años', 'Se cae al caminar, dificultad para agarrar objetos'],
      histories: ['Hombre de 65 años con debilidad asimétrica lentamente progresiva de 3 años. Afecta cuádriceps (se cae al bajar escaleras) y flexores de dedos (no puede hacer pinza). No responde a esteroides (probados por 6 meses sin mejoría). CPK levemente elevada (600 U/L). Diagnóstico previo equivocado de "polimiositis refractaria".'],
      physicalExams: ['Fza 3/5 cuádriceps bilateral (más débil que iliopsoas 4/5 — inversión del patrón proximal habitual). Fza 3/5 flexores profundos de dedos bilateral. 4/5 deltoides. Atrofia selectiva de cuádriceps y antebrazo medial. Reflejos conservados. Sensibilidad normal.']
    },
    ncs: [
      { nerve: 'Mediano', type: 'motor', latency: [2.8, 4.0], amplitude: [4, 10], velocity: [48, 58], normalRanges: NR.medianMotor },
      { nerve: 'Cubital', type: 'motor', latency: [2.2, 3.5], amplitude: [5, 12], velocity: [48, 58], normalRanges: NR.ulnarMotor },
      { nerve: 'Peroneo', type: 'motor', latency: [3.5, 5.5], amplitude: [2, 7], velocity: [40, 52], normalRanges: NR.peronealMotor },
      { nerve: 'Mediano', type: 'sensory', latency: [2.2, 3.5], amplitude: [15, 38], velocity: [48, 58], normalRanges: NR.medianSensory },
      { nerve: 'Sural', type: 'sensory', latency: [2.8, 4.0], amplitude: [6, 22], velocity: [40, 52], normalRanges: NR.suralSensory },
    ],
    emg: [
      { muscle: 'Vastus Lateralis', nerve: 'Femoral', root: 'L2-L4', insertionalActivity: ['increased'], fibrillations: ['2+','3+'], positiveWaves: ['2+'], fasciculations: ['absent'], duration: [5, 16], amplitude: [100, 5000], polyphasia: [25, 50], recruitment: ['early', 'reduced'] },
      { muscle: 'Flexor Digitorum Profundus', nerve: 'Mediano/Cubital', root: 'C8-T1', insertionalActivity: ['increased'], fibrillations: ['2+','3+'], positiveWaves: ['2+'], fasciculations: ['absent'], duration: [5, 16], amplitude: [100, 5000], polyphasia: [25, 50], recruitment: ['early', 'reduced'] },
      { muscle: 'Iliopsoas', nerve: 'Femoral', root: 'L1-L3', insertionalActivity: ['normal', 'increased'], fibrillations: ['absent', '1+'], positiveWaves: ['absent'], fasciculations: ['absent'], duration: [6, 12], amplitude: [200, 3000], polyphasia: [15, 30], recruitment: ['normal', 'reduced'] },
      { muscle: 'Deltoides', nerve: 'Axilar', root: 'C5-C6', insertionalActivity: ['normal', 'increased'], fibrillations: ['absent', '1+'], positiveWaves: ['absent'], fasciculations: ['absent'], duration: [6, 12], amplitude: [200, 3000], polyphasia: [15, 30], recruitment: ['normal'] },
    ],
    isPitfall: true,
    pitfallExplanation: '⚠️ TRAMPA: La EMG muestra un patrón MIXTO — hay MUPs tanto cortos (miopáticos) como largos (parecen neurogénicos). Esto puede confundirse con enfermedad de motoneurona o neuropatía. CLAVES para IBM: (1) Debilidad selectiva de cuádriceps y flexores profundos de dedos (patrón MUY específico). (2) Cuádriceps más débil que iliopsoas (INVERSIÓN del patrón proximal habitual de miopatías). (3) Asimetría (atípico para miopatías). (4) No responde a esteroides. (5) La mezcla de MUPs cortos y largos refleja la coexistencia de fibras musculares dañadas y reinervación compensatoria dentro del músculo. (6) CPK solo levemente elevada (vs muy alta en polimiositis). La IBM es la miopatía inflamatoria más común en >50 años.',
    explanation: 'IBM (Miositis por Cuerpos de Inclusión): NCS generalmente normales o levemente anormales. EMG con patrón MIXTO miopático + neurogénico: MUPs cortos y polifásicos (miopáticos) mezclados con MUPs largos y de alta amplitud (neurogénicos) en los MISMOS músculos. Actividad espontánea abundante. Distribución SELECTIVA: cuádriceps + flexores profundos de dedos (patrón patognomónico). Este patrón mixto EMG es una trampa clásica que confunde electromiógrrafos inexpertos.',
    differentials: [
      { id: 'inflammatory_myopathy', name: 'Polimiositis', whyNot: 'La PM tiene patrón miopático PURO (MUPs cortos). La IBM tiene patrón MIXTO. La PM responde a esteroides; la IBM NO. La PM afecta proximal simétrico; la IBM tiene el patrón selectivo cuádriceps/FDP.' },
      { id: 'als', name: 'ELA', whyNot: 'Los MUPs largos pueden confundir con ELA, PERO hay MUPs cortos concomitantes (nunca en ELA). El patrón selectivo cuádriceps + FDP no es de motoneurona.' },
    ],
    recommendations: ['Biopsia muscular (vacuolas marginadas, inclusiones amiloides).', 'NO responde a inmunosupresión — evitar esteroides a largo plazo.', 'Ejercicio de resistencia progresiva.', 'Terapia ocupacional para función manual.']
  },
];
