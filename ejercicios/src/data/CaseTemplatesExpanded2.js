const NR = {
    medianMotor: { latency: [2.5, 4.2], amplitude: [4, 12], velocity: [49, 65] },
    medianSensory: { latency: [2.0, 3.5], amplitude: [15, 50], velocity: [50, 65] },
    ulnarMotor: { latency: [2.0, 3.5], amplitude: [6, 14], velocity: [49, 65] },
    ulnarSensory: { latency: [2.0, 3.2], amplitude: [10, 40], velocity: [50, 65] },
    peronealMotor: { latency: [3.0, 5.5], amplitude: [2, 10], velocity: [41, 55] },
    suralSensory: { latency: [2.5, 4.0], amplitude: [6, 30], velocity: [40, 55] },
    tibialMotor: { latency: [3.0, 5.8], amplitude: [4, 15], velocity: [41, 55] },
};
export const EXPANDED_TEMPLATES_2 = [
    // ═══════════ 17. STC SEVERO ═══════════
    {
        patternId: 'cts_severe', patternName: 'Síndrome de Túnel del Carpo Severo', category: 'entrapment',
        patient: {
            ageRange: [50, 75], sexBias: 'female', occupations: ['Costurera', 'Diabética jubilada', 'Cocinera'],
            complaints: ['Debilidad para agarrar objetos y atrofia de eminencia tenar', 'Adormecimiento constante en mano derecha'],
            histories: ['Mujer de 65 años, diabética, con 2 años de parestesias en 1er-3er dedo der. que ahora son constantes. Ha notado atrofia en base del pulgar. Se le caen objetos. Sin dolor cervical.'],
            physicalExams: ['Atrofia de eminencia tenar derecha. Fza 2/5 APB, 3/5 oponente. Hipoestesia fija en territorio mediano. Phalen (+) inmediato. Tinel (+). Fza y sensibilidad cubital normales.']
        },
        ncs: [
            { nerve: 'Mediano', type: 'motor', latency: [7.0, 10.0], amplitude: [0.5, 2.5], velocity: [48, 58], normalRanges: NR.medianMotor },
            { nerve: 'Mediano', type: 'sensory', latency: [5.0, 8.0], amplitude: [0, 3], velocity: [25, 38], normalRanges: NR.medianSensory },
            { nerve: 'Cubital', type: 'motor', latency: [2.2, 3.2], amplitude: [7, 13], velocity: [50, 62], normalRanges: NR.ulnarMotor },
            { nerve: 'Cubital', type: 'sensory', latency: [2.1, 3.0], amplitude: [12, 35], velocity: [52, 62], normalRanges: NR.ulnarSensory },
        ],
        emg: [
            { muscle: 'Abductor Pollicis Brevis', nerve: 'Mediano', root: 'C8-T1', insertionalActivity: ['decreased', 'increased'], fibrillations: ['2+', '3+'], positiveWaves: ['2+', '3+'], fasciculations: ['absent'], duration: [6, 10], amplitude: [100, 800], polyphasia: [20, 40], recruitment: ['discrete', 'absent'] },
            { muscle: 'First Dorsal Interosseous', nerve: 'Cubital', root: 'C8-T1', insertionalActivity: ['normal'], fibrillations: ['absent'], positiveWaves: ['absent'], fasciculations: ['absent'], duration: [8, 13], amplitude: [300, 3500], polyphasia: [5, 15], recruitment: ['normal'] },
            { muscle: 'Pronator Teres', nerve: 'Mediano', root: 'C6-C7', insertionalActivity: ['normal'], fibrillations: ['absent'], positiveWaves: ['absent'], fasciculations: ['absent'], duration: [8, 13], amplitude: [300, 3500], polyphasia: [5, 15], recruitment: ['normal'] },
        ],
        explanation: 'STC severo: latencia motora mediano MUY prolongada (>6.5ms), SNAP mediano puede estar AUSENTE o muy reducido. CMAP muy bajo con denervación activa del APB (fibrilaciones/PSW). Músculos proximales del mediano (pronador) normales → lesión en la muñeca. Cubital completamente normal (confirma atrapamiento del mediano, no plexopatía C8-T1).',
        differentials: [
            { id: 'carpal_tunnel_syndrome_moderate', name: 'STC Moderado', whyNot: 'En STC moderado hay prolongación de latencia sin denervación activa. Aquí hay denervación activa del APB con SNAP posiblemente ausente → severo.' },
            { id: 'lower_brachial_plexopathy', name: 'Plexopatía C8-T1', whyNot: 'Solo el mediano está afectado. El cubital es normal. Si fuera plexopatía, ambos estarían comprometidos.' },
        ],
        recommendations: ['Liberación quirúrgica del túnel del carpo.', 'El pronóstico de recuperación es más reservado por la denervación del APB.', 'EMG post-quirúrgico a 6 meses.'],
        severityGrade: 'very_severe', severityExplanation: 'SNAP ausente, CMAP muy bajo, denervación activa del APB con atrofia.'
    },
    // ═══════════ 18. RADICULOPATÍA L5 ═══════════
    {
        patternId: 'l5_radiculopathy', patternName: 'Radiculopatía L5', category: 'radiculopathy',
        patient: {
            ageRange: [35, 65], occupations: ['Albañil', 'Cargador', 'Oficinista sedentario'],
            complaints: ['Dolor lumbar con irradiación a pierna izquierda y pie caído', 'Dificultad para caminar con talones'],
            histories: ['Hombre de 48 años con dolor lumbar de 6 semanas irradiado a cara lateral de pierna y dorso de pie izquierdo. Pie caído progresivo. Inició tras levantar carga pesada.'],
            physicalExams: ['Fza 3/5 dorsiflexores tobillo izq, 4/5 evertores, 5/5 inversores, 5/5 flexores plantares. Hipoestesia dorso del pie. Lasègue (+) a 30°. Reflejo aquíleo bilateral normal. Patelar normal.']
        },
        ncs: [
            { nerve: 'Peroneo', type: 'motor', latency: [3.5, 5.0], amplitude: [2, 8], velocity: [42, 52], normalRanges: NR.peronealMotor },
            { nerve: 'Tibial', type: 'motor', latency: [3.5, 5.5], amplitude: [5, 14], velocity: [42, 52], normalRanges: NR.tibialMotor },
            { nerve: 'Peroneo superficial', type: 'sensory', latency: [2.8, 3.8], amplitude: [8, 22], velocity: [42, 52], normalRanges: { latency: [2.5, 3.8], amplitude: [5, 20], velocity: [40, 55] } },
            { nerve: 'Sural', type: 'sensory', latency: [2.8, 3.8], amplitude: [10, 28], velocity: [42, 52], normalRanges: NR.suralSensory },
        ],
        lateResponses: [
            { type: 'h_reflex', nerve: 'Tibial', latency: [28, 34], normalRange: [28, 34], status: ['normal'] },
        ],
        emg: [
            { muscle: 'Tibialis Anterior', nerve: 'Peroneo profundo', root: 'L4-L5', insertionalActivity: ['increased'], fibrillations: ['2+', '3+'], positiveWaves: ['2+'], fasciculations: ['absent'], duration: [8, 14], amplitude: [300, 4000], polyphasia: [15, 30], recruitment: ['reduced'] },
            { muscle: 'Tibialis Posterior', nerve: 'Tibial', root: 'L5', insertionalActivity: ['increased'], fibrillations: ['1+', '2+'], positiveWaves: ['1+'], fasciculations: ['absent'], duration: [8, 13], amplitude: [300, 3000], polyphasia: [10, 25], recruitment: ['reduced', 'normal'] },
            { muscle: 'Peroneus Longus', nerve: 'Peroneo superficial', root: 'L5-S1', insertionalActivity: ['increased'], fibrillations: ['2+'], positiveWaves: ['1+'], fasciculations: ['absent'], duration: [8, 13], amplitude: [300, 3000], polyphasia: [10, 25], recruitment: ['reduced'] },
            { muscle: 'Gastrocnemius medial', nerve: 'Tibial', root: 'S1-S2', insertionalActivity: ['normal'], fibrillations: ['absent'], positiveWaves: ['absent'], fasciculations: ['absent'], duration: [8, 13], amplitude: [300, 3500], polyphasia: [5, 15], recruitment: ['normal'] },
            { muscle: 'Lumbar Paraspinals L5', nerve: 'Ramo dorsal', root: 'L5', insertionalActivity: ['increased'], fibrillations: ['2+'], positiveWaves: ['1+'], fasciculations: ['absent'], duration: [8, 13], amplitude: [300, 2500], polyphasia: [10, 20], recruitment: ['normal'] },
        ],
        explanation: 'Radiculopatía L5: denervación en músculos del miotoma L5 (tibial anterior, tibial posterior, peroneos) que cruzan MÚLTIPLES nervios periféricos (peroneo Y tibial) → confirma raíz, no nervio. Tibial posterior afectado (diferencia clave vs neuropatía peroneal). Paraespinales L5 afectados → confirma nivel radicular. NCS NORMALES (lesión proximal al ganglio). H-reflex normal (S1).',
        differentials: [
            { id: 'peroneal_neuropathy', name: 'Neuropatía Peroneal', whyNot: 'El tibial posterior (nervio tibial, NO peroneo) está afectado → la lesión no puede ser del nervio peroneo solamente. Los paraespinales confirman nivel radicular.' },
            { id: 'acute_axonal_neuropathy', name: 'Neuropatía Axonal', whyNot: 'Distribución miotómica (L5), no longitud-dependiente. SNAP normales. Un solo nivel afectado.' },
        ],
        recommendations: ['RMN lumbar (hernia discal L4-L5).', 'Tratamiento conservador inicial.', 'Si déficit motor severo o progresivo → cirugía.', 'EMG seguimiento 3-6 meses.']
    },
    // ═══════════ 19. RADICULOPATÍA S1 ═══════════
    {
        patternId: 's1_radiculopathy', patternName: 'Radiculopatía S1', category: 'radiculopathy',
        patient: {
            ageRange: [35, 65], occupations: ['Conductor', 'Oficinista', 'Obrero'],
            complaints: ['Dolor en glúteo y parte posterior de pierna', 'Dificultad para ponerse de puntillas'],
            histories: ['Hombre de 52 años con 2 meses de dolor ciático posterior derecho que irradia hasta planta del pie. Debilidad para pararse de puntillas. Hernia L5-S1 conocida.'],
            physicalExams: ['Fza 4/5 flexores plantares der, 5/5 dorsiflexores. Hipoestesia planta del pie y cara posterior de pierna. Reflejo aquíleo abolido derecho, presente izquierdo. Patelar normal bilateral. Lasègue (+) a 45°.']
        },
        ncs: [
            { nerve: 'Tibial', type: 'motor', latency: [3.5, 5.5], amplitude: [4, 13], velocity: [42, 52], normalRanges: NR.tibialMotor },
            { nerve: 'Peroneo', type: 'motor', latency: [3.5, 5.0], amplitude: [3, 9], velocity: [42, 52], normalRanges: NR.peronealMotor },
            { nerve: 'Sural', type: 'sensory', latency: [2.8, 3.8], amplitude: [8, 25], velocity: [42, 52], normalRanges: NR.suralSensory },
        ],
        lateResponses: [
            { type: 'h_reflex', nerve: 'Tibial', side: 'right', latency: [36, 42], normalRange: [28, 34], status: ['abnormal'] },
            { type: 'h_reflex', nerve: 'Tibial', side: 'left', latency: [28, 32], normalRange: [28, 34], status: ['normal'] },
        ],
        emg: [
            { muscle: 'Gastrocnemius medial', nerve: 'Tibial', root: 'S1-S2', insertionalActivity: ['increased'], fibrillations: ['2+'], positiveWaves: ['1+', '2+'], fasciculations: ['absent'], duration: [10, 16], amplitude: [2000, 5000], polyphasia: [15, 30], recruitment: ['reduced'] },
            { muscle: 'Biceps Femoris (short head)', nerve: 'Peroneo', root: 'S1', insertionalActivity: ['increased'], fibrillations: ['1+', '2+'], positiveWaves: ['1+'], fasciculations: ['absent'], duration: [9, 14], amplitude: [1500, 4000], polyphasia: [10, 25], recruitment: ['reduced', 'normal'] },
            { muscle: 'Gluteus Maximus', nerve: 'Glúteo inferior', root: 'L5-S1', insertionalActivity: ['normal', 'increased'], fibrillations: ['absent', '1+'], positiveWaves: ['absent'], fasciculations: ['absent'], duration: [8, 13], amplitude: [300, 3500], polyphasia: [5, 20], recruitment: ['normal', 'reduced'] },
            { muscle: 'Tibialis Anterior', nerve: 'Peroneo profundo', root: 'L4-L5', insertionalActivity: ['normal'], fibrillations: ['absent'], positiveWaves: ['absent'], fasciculations: ['absent'], duration: [8, 13], amplitude: [300, 3500], polyphasia: [5, 15], recruitment: ['normal'] },
            { muscle: 'Lumbar Paraspinals S1', nerve: 'Ramo dorsal', root: 'S1', insertionalActivity: ['increased'], fibrillations: ['1+', '2+'], positiveWaves: ['1+'], fasciculations: ['absent'], duration: [8, 13], amplitude: [300, 2500], polyphasia: [10, 20], recruitment: ['normal'] },
        ],
        explanation: 'Radiculopatía S1: hallazgo CLAVE es el H-reflex PROLONGADO o AUSENTE unilateralmente (hallazgo más sensible para S1). Denervación en miotoma S1 (gastrocnemio, cabeza corta bíceps femoral) con tibial anterior (L5) normal. Paraespinales S1 afectados. NCS normales (lesión proximal al ganglio). Reflejo aquíleo abolido clínicamente.',
        differentials: [
            { id: 'l5_radiculopathy', name: 'Radiculopatía L5', whyNot: 'En L5 el tibial anterior estaría afectado y el H-reflex sería normal. Aquí el hallazgo es H-reflex anormal + gastrocnemio afectado → S1.' },
            { id: 'peroneal_neuropathy', name: 'Neuropatía Peroneal', whyNot: 'El gastrocnemio (inervado por tibial, no peroneo) está afectado. No es un atrapamiento de nervio peroneo.' },
        ],
        recommendations: ['RMN lumbar (hernia L5-S1).', 'Manejo del dolor e infiltración epidural si indicado.', 'EMG seguimiento para documentar reinervación.']
    },
    // ═══════════ 20. MMN (Neuropatía Motora Multifocal) ═══════════
    {
        patternId: 'mmn', patternName: 'Neuropatía Motora Multifocal (MMN)', category: 'motor_neuron_disease',
        patient: {
            ageRange: [30, 55], sexBias: 'male', occupations: ['Ingeniero', 'Programador', 'Mecánico'],
            complaints: ['Debilidad asimétrica de mano derecha de 6 meses', 'Dificultad para girar llaves y agarrar objetos'],
            histories: ['Hombre de 42 años con debilidad progresiva de mano derecha (territorio cubital) de 6 meses. Sin dolor, sin atrofia significativa (disociación debilidad/atrofia). Fasciculaciones ocasionales. SIN compromiso sensitivo. Sin signos de motoneurona superior.'],
            physicalExams: ['Fza 3/5 interóseos derechos, 4/5 FDP 4-5to dedo. 5/5 todos los demás músculos. Sensibilidad completamente normal. Reflejos normales. Sin Babinski. Sin espasticidad. Fasciculaciones aisladas en 1er interóseo.']
        },
        ncs: [
            { nerve: 'Cubital', type: 'motor', latency: [2.5, 3.5], amplitude: [6, 12], velocity: [48, 58], normalRanges: NR.ulnarMotor, stimulationSite: 'distal' },
            { nerve: 'Cubital (antebrazo)', type: 'motor', latency: [5.0, 7.0], amplitude: [1.5, 4.0], velocity: [48, 58], normalRanges: NR.ulnarMotor, stimulationSite: 'proximal', proximalAmplitude: [1.5, 4.0], conductionBlock: true },
            { nerve: 'Cubital', type: 'sensory', latency: [2.1, 3.0], amplitude: [12, 35], velocity: [52, 62], normalRanges: NR.ulnarSensory },
            { nerve: 'Mediano', type: 'motor', latency: [2.8, 3.8], amplitude: [6, 12], velocity: [50, 62], normalRanges: NR.medianMotor },
            { nerve: 'Mediano', type: 'sensory', latency: [2.2, 3.2], amplitude: [20, 45], velocity: [52, 62], normalRanges: NR.medianSensory },
        ],
        emg: [
            { muscle: 'First Dorsal Interosseous', nerve: 'Cubital', root: 'C8-T1', insertionalActivity: ['normal', 'increased'], fibrillations: ['absent', '1+'], positiveWaves: ['absent'], fasciculations: ['present'], duration: [10, 16], amplitude: [2000, 6000], polyphasia: [15, 30], recruitment: ['reduced'] },
            { muscle: 'Abductor Digiti Minimi', nerve: 'Cubital', root: 'C8-T1', insertionalActivity: ['normal'], fibrillations: ['absent'], positiveWaves: ['absent'], fasciculations: ['absent'], duration: [8, 14], amplitude: [300, 4000], polyphasia: [10, 20], recruitment: ['reduced', 'normal'] },
            { muscle: 'Abductor Pollicis Brevis', nerve: 'Mediano', root: 'C8-T1', insertionalActivity: ['normal'], fibrillations: ['absent'], positiveWaves: ['absent'], fasciculations: ['absent'], duration: [8, 13], amplitude: [300, 3500], polyphasia: [5, 15], recruitment: ['normal'] },
        ],
        explanation: 'MMN: bloqueo de conducción MOTOR focal en cubital fuera de sitios de atrapamiento, CON sensitivos completamente normales. La disociación debilidad/atrofia es CLAVE (hay mucha debilidad pero poca atrofia, a diferencia de ELA). Sin signos de motoneurona superior (descarta ELA). La denervación activa es mínima o ausente. Anti-GM1 positivos en ~50%.',
        differentials: [
            { id: 'als', name: 'ELA', whyNot: 'Sin signos de motoneurona superior (Babinski, espasticidad, hiperreflexia). La debilidad es focal en un territorio nervioso, no difusa por regiones. Sin denervación difusa multirregional.' },
            { id: 'ulnar_neuropathy_elbow', name: 'Neuropatía Cubital en Codo', whyNot: 'El bloqueo de conducción está en el antebrazo, NO en el codo. Los sensitivos son completamente normales (en neuropatía cubital estarían afectados).' },
        ],
        recommendations: ['Anticuerpos anti-GM1.', 'IVIg (tratamiento de elección).', 'NO dar corticosteroides (pueden empeorar MMN).', 'EMG seguimiento cada 6 meses.']
    },
    // ═══════════ 21. TRAMPA: Martin-Gruber Anastomosis ═══════════
    {
        patternId: 'martin_gruber', patternName: 'Anastomosis de Martin-Gruber (Variante Normal)', category: 'pitfall',
        patient: {
            ageRange: [25, 50], occupations: ['Estudiante de medicina', 'Oficinista sano', 'Runner'],
            complaints: ['Paciente referido por "posible neuropatía cubital" en estudio para otra patología', 'Hormigueo intermitente en manos (inespecífico)'],
            histories: ['Mujer de 30 años enviada a EMG por parestesias inespecíficas en manos. Sin debilidad, sin atrofia. Sin antecedentes relevantes. El paciente está sano.'],
            physicalExams: ['Examen neurológico completamente normal. Fuerza 5/5 global. Sensibilidad normal. Reflejos simétricos. Sin signos de atrapamiento.']
        },
        ncs: [
            { nerve: 'Mediano', type: 'motor', latency: [2.8, 3.8], amplitude: [6, 12], velocity: [50, 62], normalRanges: NR.medianMotor, stimulationSite: 'distal' },
            { nerve: 'Mediano (codo)', type: 'motor', latency: [6.0, 8.0], amplitude: [8, 15], velocity: [50, 62], normalRanges: NR.medianMotor, stimulationSite: 'proximal' },
            { nerve: 'Cubital', type: 'motor', latency: [2.2, 3.0], amplitude: [7, 13], velocity: [52, 62], normalRanges: NR.ulnarMotor, stimulationSite: 'distal' },
            { nerve: 'Cubital (codo)', type: 'motor', latency: [5.5, 7.5], amplitude: [5, 9], velocity: [50, 60], normalRanges: NR.ulnarMotor, stimulationSite: 'across_elbow' },
            { nerve: 'Mediano', type: 'sensory', latency: [2.2, 3.2], amplitude: [20, 45], velocity: [52, 62], normalRanges: NR.medianSensory },
            { nerve: 'Cubital', type: 'sensory', latency: [2.1, 3.0], amplitude: [12, 35], velocity: [52, 62], normalRanges: NR.ulnarSensory },
        ],
        emg: [
            { muscle: 'Abductor Pollicis Brevis', nerve: 'Mediano', root: 'C8-T1', insertionalActivity: ['normal'], fibrillations: ['absent'], positiveWaves: ['absent'], fasciculations: ['absent'], duration: [8, 13], amplitude: [300, 3500], polyphasia: [5, 15], recruitment: ['normal'] },
            { muscle: 'First Dorsal Interosseous', nerve: 'Cubital', root: 'C8-T1', insertionalActivity: ['normal'], fibrillations: ['absent'], positiveWaves: ['absent'], fasciculations: ['absent'], duration: [8, 13], amplitude: [300, 3500], polyphasia: [5, 15], recruitment: ['normal'] },
        ],
        isPitfall: true,
        pitfallExplanation: '⚠️ TRAMPA: La amplitud del CMAP mediano PROXIMAL (codo) es MAYOR que la distal (muñeca). Esto parece violar la lógica (la amplitud nunca debería aumentar al alejar el estímulo). En el cubital, la amplitud DISMINUYE al cruzar el codo más de lo esperado. Esto NO es un bloqueo de conducción del cubital ni una lesión del mediano. Es una anastomosis de Martin-Gruber: fibras motoras cruzan del mediano al cubital en el antebrazo. Al estimular el mediano en el codo, esas fibras "extra" aumentan el CMAP. Al estimular el cubital en el codo, esas fibras "faltan" → parece bloqueo. Prevalencia: 15-30% de la población.',
        explanation: 'ESTUDIO NORMAL con variante anatómica (Martin-Gruber). La CMAP mediana proximal > distal NO indica patología. El CMAP cubital que "cae" al cruzar el codo NO es un bloqueo de conducción. Todos los SNAP son normales. EMG completamente normal. Ninguna denervación. No hay patología: es una variante anatómica presente en 15-30% de la población.',
        differentials: [
            { id: 'ulnar_neuropathy_elbow', name: 'Neuropatía Cubital en Codo', whyNot: 'Si fuera neuropatía cubital real, el SNAP cubital estaría anormal y habría denervación EMG en músculos cubitales. Todo es NORMAL.' },
            { id: 'carpal_tunnel_syndrome_moderate', name: 'STC', whyNot: 'Las latencias del mediano son normales. El "aumento" de amplitud proximal es la pista de Martin-Gruber.' },
        ],
        recommendations: ['Documentar la variante para futuros estudios.', 'No requiere tratamiento.', 'El paciente está SANO.']
    },
    // ═══════════ 22. TRAMPA: Fasciculaciones Benignas ═══════════
    {
        patternId: 'benign_fasciculations', patternName: 'Síndrome de Fasciculaciones Benignas', category: 'pitfall',
        patient: {
            ageRange: [25, 45], occupations: ['Médico residente ansioso', 'Programador con mucho café', 'Deportista'],
            complaints: ['Fasciculaciones difusas que el propio paciente nota desde hace meses', '"Creo que tengo ELA" (ansiedad)'],
            histories: ['Hombre de 32 años, médico residente, con fasciculaciones visibles en pantorrillas y bíceps de 4 meses. Buscó en internet y está convencido de tener ELA. Consume 5 cafés/día. Estrés laboral severo. Sin debilidad objetiva. Sin atrofia.'],
            physicalExams: ['Fuerza 5/5 global. Fasciculaciones visibles en gastrocnemio bilateral y bíceps ocasional. Sensibilidad normal. Reflejos simétricos NORMALES. Sin Babinski. Sin atrofia. Sin espasticidad.']
        },
        ncs: [
            { nerve: 'Mediano', type: 'motor', latency: [2.8, 3.8], amplitude: [6, 12], velocity: [50, 62], normalRanges: NR.medianMotor },
            { nerve: 'Cubital', type: 'motor', latency: [2.2, 3.2], amplitude: [7, 13], velocity: [50, 62], normalRanges: NR.ulnarMotor },
            { nerve: 'Peroneo', type: 'motor', latency: [3.5, 5.0], amplitude: [3, 9], velocity: [42, 52], normalRanges: NR.peronealMotor },
            { nerve: 'Mediano', type: 'sensory', latency: [2.2, 3.2], amplitude: [20, 45], velocity: [52, 62], normalRanges: NR.medianSensory },
            { nerve: 'Sural', type: 'sensory', latency: [2.8, 3.8], amplitude: [10, 28], velocity: [42, 52], normalRanges: NR.suralSensory },
        ],
        emg: [
            { muscle: 'Gastrocnemius medial', nerve: 'Tibial', root: 'S1-S2', insertionalActivity: ['normal'], fibrillations: ['absent'], positiveWaves: ['absent'], fasciculations: ['present'], duration: [8, 13], amplitude: [300, 3500], polyphasia: [5, 15], recruitment: ['normal'] },
            { muscle: 'Biceps Brachii', nerve: 'Musculocutáneo', root: 'C5-C6', insertionalActivity: ['normal'], fibrillations: ['absent'], positiveWaves: ['absent'], fasciculations: ['present'], duration: [8, 13], amplitude: [300, 3500], polyphasia: [5, 15], recruitment: ['normal'] },
            { muscle: 'First Dorsal Interosseous', nerve: 'Cubital', root: 'C8-T1', insertionalActivity: ['normal'], fibrillations: ['absent'], positiveWaves: ['absent'], fasciculations: ['absent'], duration: [8, 13], amplitude: [300, 3500], polyphasia: [5, 15], recruitment: ['normal'] },
            { muscle: 'Tibialis Anterior', nerve: 'Peroneo profundo', root: 'L4-L5', insertionalActivity: ['normal'], fibrillations: ['absent'], positiveWaves: ['absent'], fasciculations: ['absent'], duration: [8, 13], amplitude: [300, 3500], polyphasia: [5, 15], recruitment: ['normal'] },
        ],
        isPitfall: true,
        pitfallExplanation: '⚠️ TRAMPA: Las fasciculaciones SIN denervación (sin fibrilaciones, sin PSW) y CON MUPs normales NO son ELA. La clave es: fasciculaciones BENIGNAS = fasciculaciones AISLADAS sin ningún otro hallazgo de denervación. En ELA las fasciculaciones se acompañan de fibrilaciones, PSW, MUPs neurogénicos, y reclutamiento reducido.',
        explanation: 'ESTUDIO NORMAL con fasciculaciones benignas. Fasciculaciones en la EMG SIN denervación activa (ausencia de fibrilaciones y PSW). MUPs de morfología, duración y amplitud NORMALES. Reclutamiento NORMAL. NCS completamente normales. Esto EXCLUYE enfermedad de motoneurona. Las fasciculaciones benignas son extremadamente comunes (estrés, cafeína, ejercicio, falta de sueño) y NO requieren seguimiento.',
        differentials: [
            { id: 'als', name: 'ELA', whyNot: 'En ELA las fasciculaciones se acompañan de fibrilaciones/PSW (denervación activa), MUPs gigantes (reinervación crónica), y reclutamiento reducido. Aquí TODO es normal excepto las fasciculaciones mismas.' },
            { id: 'acute_axonal_neuropathy', name: 'Neuropatía', whyNot: 'Las conducciones son completamente normales. Sin denervación. Sin cambios de MUPs.' },
        ],
        recommendations: ['Tranquilizar al paciente: NO tiene ELA.', 'Reducir cafeína y mejorar higiene del sueño.', 'Manejo de ansiedad si necesario.', 'No requiere seguimiento con EMG.']
    },
    // ═══════════ 23. TRAMPA: Hipotermia ═══════════
    {
        patternId: 'hypothermia_artifact', patternName: 'Falsa Desmielinización por Hipotermia', category: 'pitfall',
        patient: {
            ageRange: [30, 60], occupations: ['Trabajador de cámara frigorífica', 'Paciente de invierno', 'Cartero'],
            complaints: ['Referido para "descartar neuropatía" por parestesias en manos', 'Las manos siempre están frías'],
            histories: ['Mujer de 45 años evaluada en enero por parestesias en manos. Trabaja en cámara frigorífica. Las manos se sienten frías al tacto. Sin debilidad. Sin antecedentes de neuropatía. No es diabética.'],
            physicalExams: ['Fuerza 5/5 global. Sensibilidad normal al examinar cuidadosamente. Reflejos normales. Manos frías y cianóticas al tacto. Temperatura cutánea estimada: 28-30°C.']
        },
        skinTemperature: [28, 30],
        technicalNotes: ['Temperatura cutánea de la mano al momento del estudio: 29°C (normal >32°C). No se realizó calentamiento previo al estudio.'],
        ncs: [
            { nerve: 'Mediano', type: 'motor', latency: [5.0, 6.5], amplitude: [8, 16], velocity: [38, 46], normalRanges: NR.medianMotor },
            { nerve: 'Cubital', type: 'motor', latency: [4.0, 5.5], amplitude: [9, 16], velocity: [38, 48], normalRanges: NR.ulnarMotor },
            { nerve: 'Mediano', type: 'sensory', latency: [4.0, 5.5], amplitude: [25, 60], velocity: [35, 45], normalRanges: NR.medianSensory },
            { nerve: 'Cubital', type: 'sensory', latency: [3.5, 5.0], amplitude: [18, 50], velocity: [38, 48], normalRanges: NR.ulnarSensory },
            { nerve: 'Sural', type: 'sensory', latency: [2.8, 3.8], amplitude: [10, 28], velocity: [42, 52], normalRanges: NR.suralSensory },
        ],
        emg: [
            { muscle: 'Abductor Pollicis Brevis', nerve: 'Mediano', root: 'C8-T1', insertionalActivity: ['normal'], fibrillations: ['absent'], positiveWaves: ['absent'], fasciculations: ['absent'], duration: [8, 13], amplitude: [300, 3500], polyphasia: [5, 15], recruitment: ['normal'] },
            { muscle: 'First Dorsal Interosseous', nerve: 'Cubital', root: 'C8-T1', insertionalActivity: ['normal'], fibrillations: ['absent'], positiveWaves: ['absent'], fasciculations: ['absent'], duration: [8, 13], amplitude: [300, 3500], polyphasia: [5, 15], recruitment: ['normal'] },
        ],
        isPitfall: true,
        pitfallExplanation: '⚠️ TRAMPA: Latencias prolongadas y velocidades reducidas que SIMULAN desmielinización, PERO las amplitudes están AUMENTADAS (no reducidas). Esto es DIAGNÓSTICO de hipotermia. En desmielinización real (GBS/CIDP), las amplitudes están REDUCIDAS. La regla: por cada 1°C ↓ de temperatura → latencia ↑ ~0.2ms, velocidad ↓ ~2m/s, amplitud ↑ ~5%. El sural (pie cubierto con zapato) puede estar normal → otra pista. SIEMPRE calentar las manos antes del estudio.',
        explanation: 'ARTEFACTO POR HIPOTERMIA — NO es neuropatía desmielinizante. Las latencias prolongadas y velocidades reducidas son secundarias a temperatura cutánea baja (29°C vs normal >32°C). La PISTA CLAVE: las amplitudes están AUMENTADAS (en desmielinización real las amplitudes caen). Los nervios de MMII (sural) son normales porque los pies estaban cubiertos con zapatos. EMG completamente normal. Este estudio debe repetirse tras calentar las extremidades.',
        differentials: [
            { id: 'demyelinating_neuropathy', name: 'Neuropatía Desmielinizante', whyNot: 'En desmielinización real las AMPLITUDES están REDUCIDAS. Aquí están AUMENTADAS → efecto de temperatura. Además solo en manos (que están frías), los MMII son normales.' },
            { id: 'carpal_tunnel_syndrome_moderate', name: 'STC', whyNot: 'Tanto mediano como cubital están igualmente afectados. En STC solo el mediano se enlentece en la muñeca. El patrón simétrico bilateral con amplitudes altas = temperatura.' },
        ],
        recommendations: ['⚠️ REPETIR el estudio tras calentar las manos a >32°C.', 'No diagnosticar neuropatía sin corregir temperatura.', 'Usar lámpara de calor o baño de agua caliente antes del estudio.']
    },
];
