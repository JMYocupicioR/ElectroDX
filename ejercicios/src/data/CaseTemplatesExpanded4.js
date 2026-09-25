const NR = {
    medianMotor: { latency: [2.5, 4.2], amplitude: [4, 12], velocity: [49, 65] },
    medianSensory: { latency: [2.0, 3.5], amplitude: [15, 50], velocity: [50, 65] },
    ulnarMotor: { latency: [2.0, 3.5], amplitude: [6, 14], velocity: [49, 65] },
    peronealMotor: { latency: [3.0, 5.5], amplitude: [2, 10], velocity: [41, 55] },
    suralSensory: { latency: [2.5, 4.0], amplitude: [6, 30], velocity: [40, 55] },
    tibialMotor: { latency: [3.0, 5.8], amplitude: [4, 15], velocity: [41, 55] },
};
export const EXPANDED_TEMPLATES_4 = [
    // ═══════════ 31. SÍNDROME DEL TÚNEL DEL TARSO ═══════════
    {
        patternId: 'tarsal_tunnel_syndrome', patternName: 'Síndrome del Túnel del Tarso', category: 'entrapment',
        patient: {
            ageRange: [35, 65], occupations: ['Corredor maratonista', 'Cartero', 'Vendedor ambulante'],
            complaints: ['Ardor y hormigueo en la planta del pie', 'Dolor que empeora al caminar largo rato'],
            histories: ['Mujer de 48 años con dolor tipo quemazón en planta del pie derecho de 6 meses. Empeora al final del día y con caminatas prolongadas. Hormigueo en ortejos. Antecedente de fractura de tobillo consolidada hace 2 años. Sin síntomas en muslo o pantorrilla.'],
            physicalExams: ['Tinel positivo sobre retináculo flexor del tobillo derecho. Hipoestesia plantar lateral y medial. Fza 4/5 flexores de ortejos. Abductor hallucis leve atrofia. Dorsiflex y eversion normales. Sural normal. Lado contralateral normal.']
        },
        ncs: [
            { nerve: 'Tibial (plantar medial)', type: 'motor', latency: [5.5, 8.0], amplitude: [1.5, 5], velocity: [35, 45], normalRanges: { latency: [3.0, 4.5], amplitude: [5, 15], velocity: [41, 55] } },
            { nerve: 'Tibial (plantar lateral)', type: 'motor', latency: [5.5, 8.0], amplitude: [1, 4], velocity: [35, 45], normalRanges: { latency: [3.0, 5.0], amplitude: [4, 12], velocity: [41, 55] } },
            { nerve: 'Tibial (proximal)', type: 'motor', latency: [3.5, 5.5], amplitude: [5, 13], velocity: [42, 52], normalRanges: NR.tibialMotor },
            { nerve: 'Sural', type: 'sensory', latency: [2.8, 3.8], amplitude: [10, 28], velocity: [42, 52], normalRanges: NR.suralSensory },
            { nerve: 'Peroneo', type: 'motor', latency: [3.5, 5.0], amplitude: [3, 9], velocity: [42, 52], normalRanges: NR.peronealMotor },
            { nerve: 'Plantar medial mixto', type: 'sensory', latency: [4.0, 6.0], amplitude: [0.5, 3], velocity: [30, 42], normalRanges: { latency: [2.0, 3.5], amplitude: [3, 12], velocity: [40, 55] } },
        ],
        emg: [
            { muscle: 'Abductor Hallucis', nerve: 'Tibial (plantar medial)', root: 'S1-S2', insertionalActivity: ['increased'], fibrillations: ['1+', '2+'], positiveWaves: ['1+', '2+'], fasciculations: ['absent'], duration: [8, 14], amplitude: [200, 4000], polyphasia: [15, 30], recruitment: ['reduced'] },
            { muscle: 'Abductor Digiti Quinti Pedis', nerve: 'Tibial (plantar lateral)', root: 'S1-S2', insertionalActivity: ['increased'], fibrillations: ['1+', '2+'], positiveWaves: ['1+'], fasciculations: ['absent'], duration: [8, 14], amplitude: [200, 4000], polyphasia: [15, 30], recruitment: ['reduced'] },
            { muscle: 'Gastrocnemius medial', nerve: 'Tibial', root: 'S1-S2', insertionalActivity: ['normal'], fibrillations: ['absent'], positiveWaves: ['absent'], fasciculations: ['absent'], duration: [8, 13], amplitude: [300, 3500], polyphasia: [5, 15], recruitment: ['normal'] },
            { muscle: 'Tibialis Anterior', nerve: 'Peroneo profundo', root: 'L4-L5', insertionalActivity: ['normal'], fibrillations: ['absent'], positiveWaves: ['absent'], fasciculations: ['absent'], duration: [8, 13], amplitude: [300, 3500], polyphasia: [5, 15], recruitment: ['normal'] },
        ],
        explanation: 'Síndrome del Túnel del Tarso: compresión del nervio tibial DISTAL al tobillo (retináculo flexor). CLAVE: las latencias terminales plantares (medial y lateral) están PROLONGADAS, pero el tibial proximal es NORMAL → la lesión es FOCAL en el tobillo. El sural es NORMAL (rama que se separa PROXIMAL al túnel del tarso). El gastrocnemio es NORMAL (inervado por ramas tibiales proximales). La denervación se limita a la musculatura intrínseca del pie (abductor hallucis, ADQP).',
        differentials: [
            { id: 's1_radiculopathy', name: 'Radiculopatía S1', whyNot: 'En S1 el gastrocnemio estaría afectado y el H-reflex prolongado. Aquí el gastrocnemio es NORMAL → la lesión es DISTAL al tobillo.' },
            { id: 'diabetic_polyneuropathy', name: 'Polineuropatía Diabética', whyNot: 'En neuropatía diabética el sural estaría anormal y habría un patrón longitud-dependiente bilateral. Aquí es unilateral y el sural normal.' },
        ],
        recommendations: ['Plantillas ortopédicas.', 'Infiltración de esteroides guiada por US.', 'Liberación quirúrgica si no hay respuesta en 3-6 meses.']
    },
    // ═══════════ 32. RADICULOPATÍA C7 ═══════════
    {
        patternId: 'c7_radiculopathy', patternName: 'Radiculopatía C7', category: 'radiculopathy',
        patient: {
            ageRange: [35, 60], occupations: ['Albañil', 'Ingeniero', 'Obrero'],
            complaints: ['Dolor cervical irradiado al brazo y dedo medio', 'Debilidad para extender el codo'],
            histories: ['Hombre de 50 años con dolor cervical progresivo de 2 meses que irradia al brazo izquierdo y al dedo medio. Debilidad para extender el codo y extender la muñeca. RMN muestra hernia discal C6-C7 izquierda con compresión radicular.'],
            physicalExams: ['Fza 4/5 tríceps izq, 4/5 extensores de muñeca izq, 4/5 pronador redondo izq. 5/5 deltoides y bíceps. Hiporreflexia tricipital izq (1+ vs 2+ contralateral). Hipoestesia dedo medio izq. Spurling positivo izq.']
        },
        ncs: [
            { nerve: 'Mediano', type: 'motor', latency: [2.8, 3.8], amplitude: [5, 11], velocity: [50, 62], normalRanges: { latency: [2.5, 4.2], amplitude: [4, 12], velocity: [49, 65] } },
            { nerve: 'Cubital', type: 'motor', latency: [2.2, 3.2], amplitude: [7, 13], velocity: [50, 62], normalRanges: { latency: [2.0, 3.5], amplitude: [6, 14], velocity: [49, 65] } },
            { nerve: 'Mediano', type: 'sensory', latency: [2.2, 3.2], amplitude: [18, 42], velocity: [52, 62], normalRanges: { latency: [2.0, 3.5], amplitude: [15, 50], velocity: [50, 65] } },
            { nerve: 'Radial', type: 'sensory', latency: [1.8, 2.8], amplitude: [16, 38], velocity: [52, 60], normalRanges: { latency: [1.5, 2.9], amplitude: [15, 40], velocity: [50, 65] } },
        ],
        emg: [
            { muscle: 'Triceps', nerve: 'Radial', root: 'C7', insertionalActivity: ['increased'], fibrillations: ['2+', '3+'], positiveWaves: ['2+'], fasciculations: ['absent'], duration: [10, 16], amplitude: [2000, 6000], polyphasia: [15, 30], recruitment: ['reduced'] },
            { muscle: 'Pronator Teres', nerve: 'Mediano', root: 'C6-C7', insertionalActivity: ['increased'], fibrillations: ['1+', '2+'], positiveWaves: ['1+'], fasciculations: ['absent'], duration: [10, 16], amplitude: [2000, 5000], polyphasia: [15, 30], recruitment: ['reduced'] },
            { muscle: 'Extensor Carpi Radialis', nerve: 'Radial', root: 'C6-C7', insertionalActivity: ['increased'], fibrillations: ['1+', '2+'], positiveWaves: ['1+'], fasciculations: ['absent'], duration: [10, 16], amplitude: [2000, 5000], polyphasia: [15, 30], recruitment: ['reduced'] },
            { muscle: 'Flexor Carpi Radialis', nerve: 'Mediano', root: 'C6-C7', insertionalActivity: ['normal', 'increased'], fibrillations: ['absent', '1+'], positiveWaves: ['absent'], fasciculations: ['absent'], duration: [8, 14], amplitude: [300, 4000], polyphasia: [10, 25], recruitment: ['normal', 'reduced'] },
            { muscle: 'Biceps Brachii', nerve: 'Musculocutáneo', root: 'C5-C6', insertionalActivity: ['normal'], fibrillations: ['absent'], positiveWaves: ['absent'], fasciculations: ['absent'], duration: [8, 13], amplitude: [300, 3500], polyphasia: [5, 15], recruitment: ['normal'] },
            { muscle: 'Cervical Paraspinals C7', nerve: 'Ramo dorsal', root: 'C7', insertionalActivity: ['increased'], fibrillations: ['1+', '2+'], positiveWaves: ['1+'], fasciculations: ['absent'], duration: [8, 12], amplitude: [300, 3000], polyphasia: [10, 20], recruitment: ['normal'] },
        ],
        lateResponses: [
            { type: 'f_wave', nerve: 'Mediano', minLatency: [26, 32], persistence: [40, 80], normalRange: [24, 32], status: ['normal', 'abnormal'] },
        ],
        explanation: 'Radiculopatía C7: NCS NORMALES (lesión proximal al ganglio → los SNAP se preservan). EMG muestra denervación en músculos inervados por C7 que CRUZAN MÚLTIPLES nervios periféricos: tríceps (radial), pronador redondo (mediano), extensor carpi radialis (radial). El bíceps (C5-C6) es NORMAL. Los paraespinales cervicales con denervación CONFIRMAN radiculopatía (excluye plexopatía donde paraespinales serían normales). C7 es la radiculopatía cervical MÁS FRECUENTE.',
        differentials: [
            { id: 'radial_neuropathy_spiral_groove', name: 'Neuropatía Radial', whyNot: 'En neuropatía radial, SOLO músculos del radial estarían afectados. Aquí el pronador redondo (mediano) también está afectado → no puede ser un nervio periférico único. Además, SNAP radial reducido en neuropatía vs NORMAL aquí.' },
            { id: 'upper_brachial_plexopathy', name: 'Plexopatía', whyNot: 'Los paraespinales cervicales son anormales → localiza la lesión en la raíz, no el plexo. En plexopatía los paraespinales serían NORMALES.' },
        ],
        recommendations: ['Manejo conservador inicial (fisioterapia, AINES, gabapentina).', 'RMN cervical para evaluar compresión.', 'Infiltración epidural si falla manejo conservador.', 'Cirugía si debilidad progresiva o datos de mielopatía.']
    },
    // ═══════════ 33. NERVIO PERONEO ACCESORIO (VARIANTE ANATÓMICA) — TRAMPA ═══════════
    {
        patternId: 'accessory_peroneal_nerve', patternName: 'Nervio Peroneo Accesorio (Variante Anatómica)', category: 'pitfall',
        patient: {
            ageRange: [20, 50], occupations: ['Deportista', 'Oficinista', 'Estudiante de medicina'],
            complaints: ['Estudio rutinario de pérdida de fuerza leve en pie', 'Asimetría en estudio bilateral de neuroconducción'],
            histories: ['Hombre de 30 años referido por debilidad leve del dorsiflexor del pie izquierdo post-traumatismo menor. Examen clínico casi normal. Se solicita estudio bilateral para comparación.'],
            physicalExams: ['Fza 5-/5 dorsiflexión tobillo izq (vs 5/5 derecho). Sin atrofia. Sensibilidad normal bilateral. Reflejos simétricos normales. Sin signo de Tinel en cabeza de peroné.']
        },
        ncs: [
            { nerve: 'Peroneo (tobillo)', type: 'motor', latency: [3.5, 5.0], amplitude: [2.5, 5.5], velocity: [42, 52], normalRanges: NR.peronealMotor, stimulationSite: 'distal' },
            { nerve: 'Peroneo (cabeza peroné)', type: 'motor', latency: [9.0, 12.0], amplitude: [4.5, 9.0], velocity: [42, 52], normalRanges: NR.peronealMotor, stimulationSite: 'proximal' },
            { nerve: 'Tibial', type: 'motor', latency: [3.5, 5.0], amplitude: [6, 13], velocity: [42, 52], normalRanges: NR.tibialMotor },
            { nerve: 'Sural', type: 'sensory', latency: [2.8, 3.8], amplitude: [12, 28], velocity: [42, 52], normalRanges: NR.suralSensory },
            { nerve: 'Peroneo superficial', type: 'sensory', latency: [2.5, 3.5], amplitude: [8, 22], velocity: [42, 52], normalRanges: { latency: [2.5, 3.8], amplitude: [5, 20], velocity: [40, 55] } },
        ],
        emg: [
            { muscle: 'Extensor Digitorum Brevis', nerve: 'Peroneo profundo', root: 'L5-S1', insertionalActivity: ['normal'], fibrillations: ['absent'], positiveWaves: ['absent'], fasciculations: ['absent'], duration: [8, 13], amplitude: [300, 3500], polyphasia: [5, 15], recruitment: ['normal'] },
            { muscle: 'Tibialis Anterior', nerve: 'Peroneo profundo', root: 'L4-L5', insertionalActivity: ['normal'], fibrillations: ['absent'], positiveWaves: ['absent'], fasciculations: ['absent'], duration: [8, 13], amplitude: [300, 3500], polyphasia: [5, 15], recruitment: ['normal'] },
            { muscle: 'Peroneus Longus', nerve: 'Peroneo superficial', root: 'L5-S1', insertionalActivity: ['normal'], fibrillations: ['absent'], positiveWaves: ['absent'], fasciculations: ['absent'], duration: [8, 13], amplitude: [300, 3500], polyphasia: [5, 15], recruitment: ['normal'] },
        ],
        isPitfall: true,
        pitfallExplanation: '⚠️ TRAMPA: El CMAP peroneo al estimular desde tobillo es MENOR que al estimular desde la cabeza del peroné. ¡Esto parece bloqueo de conducción INVERSO! En realidad, es una variante anatómica NORMAL: el nervio peroneo accesorio (presente en ~20-28% de la población) inerva parte del EDB viajando por detrás del maléolo lateral (rama del peroneo superficial). Al estimular en tobillo (anterior), esta rama no se activa. Al estimular en la cabeza del peroné (proximal a la bifurcación), se reclutan TODAS las fibras incluyendo la accesoria. CLAVE: (1) Amplitud proximal > distal (imposible en patología real). (2) EMG completamente NORMAL. (3) Estimular detrás del maléolo lateral produce un CMAP adicional. (4) La suma de CMAP distal + CMAP retromaléolar = CMAP proximal.',
        explanation: 'Nervio peroneo accesorio: variante anatómica donde una rama del peroneo superficial viaja retromaléolarmente para inervar parte del EDB. Esto produce un CMAP aparentemente mayor con estimulación proximal vs distal, simulando un "bloqueo de conducción inverso". NO es patológico. La EMG completamente normal confirma que no hay lesión nerviosa. Prevalencia: 20-28% de la población. Bilateral en 80% de los casos con la variante.',
        differentials: [
            { id: 'peroneal_neuropathy', name: 'Neuropatía Peroneal', whyNot: 'En neuropatía peroneal el CMAP PROXIMAL sería MENOR que distal (bloqueo real). Aquí es AL REVÉS. Además la EMG es completamente normal — no hay denervación.' },
            { id: 'martin_gruber', name: 'Anastomosis Martin-Gruber', whyNot: 'Martin-Gruber es la variante análoga en MMSS (mediano → cubital). Ambos son anastomosis no patológicos, pero en diferentes extremidades.' },
        ],
        recommendations: ['Reconocimiento de variante anatómica (NO patología).', 'Documentar el hallazgo como variante normal.', 'Estimulación retromaléolar para confirmar.', 'No se requiere tratamiento.']
    },
];
