// Re-use normal ranges helper
const NR = {
    medianMotor: { latency: [2.5, 4.2], amplitude: [4, 12], velocity: [49, 65] },
    medianSensory: { latency: [2.0, 3.5], amplitude: [15, 50], velocity: [50, 65] },
    ulnarMotor: { latency: [2.0, 3.5], amplitude: [6, 14], velocity: [49, 65] },
    ulnarSensory: { latency: [2.0, 3.2], amplitude: [10, 40], velocity: [50, 65] },
    peronealMotor: { latency: [3.0, 5.5], amplitude: [2, 10], velocity: [41, 55] },
    suralSensory: { latency: [2.5, 4.0], amplitude: [6, 30], velocity: [40, 55] },
    tibialMotor: { latency: [3.0, 5.8], amplitude: [4, 15], velocity: [41, 55] },
    radialSensory: { latency: [1.5, 2.9], amplitude: [15, 40], velocity: [50, 65] },
    musculocutSensory: { latency: [2.0, 3.0], amplitude: [8, 30], velocity: [50, 65] },
};
export const EXPANDED_TEMPLATES = [
    // ═══════════ 9. PLEXOPATÍA BRAQUIAL SUPERIOR (Erb-Duchenne) ═══════════
    {
        patternId: 'upper_brachial_plexopathy', patternName: 'Plexopatía Braquial Superior (Erb-Duchenne)', category: 'plexopathy',
        patient: {
            ageRange: [25, 55], occupations: ['Motociclista', 'Obrero', 'Deportista'],
            complaints: ['Imposibilidad para levantar el brazo derecho tras caída de moto', 'Dolor y hormigueo en hombro y brazo lateral'],
            histories: ['Hombre de 32 años que sufrió traumatismo en hombro derecho por caída de motocicleta hace 3 semanas. No puede abducir ni flexionar el brazo. Dolor intenso en cara lateral del hombro y brazo.'],
            physicalExams: ['Fza 1/5 deltoides, 2/5 bíceps, 0/5 infraespinoso der. Fza 5/5 tríceps, interóseos, flexores de muñeca. Hipoestesia cara lateral del brazo y antebrazo. Reflejos: bicipital abolido, tricipital normal. Atrofia deltoides incipiente.']
        },
        ncs: [
            { nerve: 'Musculocutáneo', type: 'motor', latency: [3.5, 5.0], amplitude: [0.5, 2.0], velocity: [40, 50], normalRanges: { latency: [2.5, 4.0], amplitude: [3, 10], velocity: [50, 65] } },
            { nerve: 'Axilar', type: 'motor', latency: [3.0, 4.5], amplitude: [0.3, 1.5], velocity: [38, 48], normalRanges: { latency: [2.0, 3.5], amplitude: [3, 12], velocity: [50, 65] } },
            { nerve: 'Mediano', type: 'motor', latency: [2.8, 3.8], amplitude: [5, 11], velocity: [50, 60], normalRanges: NR.medianMotor },
            { nerve: 'Cubital', type: 'motor', latency: [2.2, 3.2], amplitude: [7, 13], velocity: [50, 62], normalRanges: NR.ulnarMotor },
            { nerve: 'Antebraquial cutáneo lateral', type: 'sensory', latency: [2.5, 3.8], amplitude: [2, 8], velocity: [40, 52], normalRanges: NR.musculocutSensory },
            { nerve: 'Mediano', type: 'sensory', latency: [2.2, 3.2], amplitude: [18, 42], velocity: [52, 62], normalRanges: NR.medianSensory },
            { nerve: 'Cubital', type: 'sensory', latency: [2.1, 3.0], amplitude: [12, 35], velocity: [52, 62], normalRanges: NR.ulnarSensory },
        ],
        emg: [
            { muscle: 'Deltoides', nerve: 'Axilar', root: 'C5-C6', insertionalActivity: ['increased'], fibrillations: ['3+', '4+'], positiveWaves: ['3+'], fasciculations: ['absent'], duration: [8, 12], amplitude: [200, 1500], polyphasia: [10, 20], recruitment: ['absent', 'discrete'] },
            { muscle: 'Biceps Brachii', nerve: 'Musculocutáneo', root: 'C5-C6', insertionalActivity: ['increased'], fibrillations: ['3+'], positiveWaves: ['2+'], fasciculations: ['absent'], duration: [8, 12], amplitude: [200, 2000], polyphasia: [10, 20], recruitment: ['discrete'] },
            { muscle: 'Infraspinatus', nerve: 'Supraescapular', root: 'C5-C6', insertionalActivity: ['increased'], fibrillations: ['2+', '3+'], positiveWaves: ['2+'], fasciculations: ['absent'], duration: [8, 12], amplitude: [200, 1500], polyphasia: [10, 20], recruitment: ['discrete', 'absent'] },
            { muscle: 'Triceps', nerve: 'Radial', root: 'C7-C8', insertionalActivity: ['normal'], fibrillations: ['absent'], positiveWaves: ['absent'], fasciculations: ['absent'], duration: [8, 13], amplitude: [300, 3500], polyphasia: [5, 15], recruitment: ['normal'] },
            { muscle: 'First Dorsal Interosseous', nerve: 'Cubital', root: 'C8-T1', insertionalActivity: ['normal'], fibrillations: ['absent'], positiveWaves: ['absent'], fasciculations: ['absent'], duration: [8, 13], amplitude: [300, 3000], polyphasia: [5, 15], recruitment: ['normal'] },
            { muscle: 'Cervical Paraspinals C5-C6', nerve: 'Ramo dorsal', root: 'C5-C6', insertionalActivity: ['normal'], fibrillations: ['absent'], positiveWaves: ['absent'], fasciculations: ['absent'], duration: [8, 12], amplitude: [300, 2500], polyphasia: [5, 15], recruitment: ['normal'] },
        ],
        explanation: 'Plexopatía braquial superior (tronco superior C5-C6): denervación en músculos del tronco superior (deltoides, bíceps, infraespinoso) con SNAP anormales en territorio C5-C6 (diferencia CLAVE vs radiculopatía donde los SNAP son normales). Paraespinales normales confirman lesión post-raíz (plexo). Músculos C8-T1 intactos.',
        differentials: [
            { id: 'c5_c6_radiculopathy', name: 'Radiculopatía C5-C6', whyNot: 'En radiculopatía, los SNAP serían NORMALES (lesión proximal al ganglio). Aquí el SNAP del cutáneo lateral está reducido → lesión post-ganglionar = plexo. Además, paraespinales normales.' },
            { id: 'acute_axonal_neuropathy', name: 'Neuropatía Axonal', whyNot: 'Distribución focal (solo C5-C6), no difusa. Los nervios mediano y cubital son normales.' },
        ],
        recommendations: ['RMN de plexo braquial.', 'EMG de seguimiento a 3-6 meses para evaluar reinervación.', 'Rehabilitación intensiva.']
    },
    // ═══════════ 10. PLEXOPATÍA BRAQUIAL INFERIOR (Klumpke) ═══════════
    {
        patternId: 'lower_brachial_plexopathy', patternName: 'Plexopatía Braquial Inferior (Klumpke)', category: 'plexopathy',
        patient: {
            ageRange: [45, 70], sexBias: 'female', occupations: ['Ama de casa', 'Contadora', 'Profesora'],
            complaints: ['Debilidad y entumecimiento en mano izquierda de 2 meses', 'Dolor en cara medial del antebrazo'],
            histories: ['Mujer de 58 años con antecedente de cáncer de mama tratado hace 2 años. Debilidad progresiva de mano izquierda con adormecimiento en 4to-5to dedo y cara medial del antebrazo. Dolor tipo ardor.'],
            physicalExams: ['Fza 3/5 interóseos, 3/5 FDP 4-5to dedo izq. 5/5 deltoides, bíceps, tríceps. Hipoestesia C8-T1 (4-5to dedos, borde medial antebrazo). Ptosis palpebral ipsilateral leve (Horner). Atrofia hipotenar.']
        },
        ncs: [
            { nerve: 'Cubital', type: 'motor', latency: [2.5, 3.5], amplitude: [1.5, 4.0], velocity: [48, 58], normalRanges: NR.ulnarMotor },
            { nerve: 'Cubital', type: 'sensory', latency: [2.2, 3.2], amplitude: [3, 10], velocity: [48, 58], normalRanges: NR.ulnarSensory },
            { nerve: 'Mediano', type: 'motor', latency: [2.8, 3.8], amplitude: [4, 10], velocity: [50, 60], normalRanges: NR.medianMotor },
            { nerve: 'Mediano', type: 'sensory', latency: [2.2, 3.2], amplitude: [16, 40], velocity: [52, 62], normalRanges: NR.medianSensory },
            { nerve: 'Antebraquial cutáneo medial', type: 'sensory', latency: [2.5, 3.5], amplitude: [1, 5], velocity: [42, 52], normalRanges: { latency: [2.0, 3.0], amplitude: [8, 25], velocity: [50, 65] } },
        ],
        emg: [
            { muscle: 'First Dorsal Interosseous', nerve: 'Cubital', root: 'C8-T1', insertionalActivity: ['increased'], fibrillations: ['2+', '3+'], positiveWaves: ['2+'], fasciculations: ['absent'], duration: [8, 12], amplitude: [200, 2000], polyphasia: [10, 20], recruitment: ['reduced', 'discrete'] },
            { muscle: 'Abductor Pollicis Brevis', nerve: 'Mediano', root: 'C8-T1', insertionalActivity: ['increased'], fibrillations: ['1+', '2+'], positiveWaves: ['1+'], fasciculations: ['absent'], duration: [8, 12], amplitude: [200, 2000], polyphasia: [10, 20], recruitment: ['reduced'] },
            { muscle: 'Flexor Carpi Ulnaris', nerve: 'Cubital', root: 'C8-T1', insertionalActivity: ['increased'], fibrillations: ['1+', '2+'], positiveWaves: ['1+'], fasciculations: ['absent'], duration: [8, 12], amplitude: [200, 2500], polyphasia: [10, 20], recruitment: ['reduced'] },
            { muscle: 'Deltoides', nerve: 'Axilar', root: 'C5-C6', insertionalActivity: ['normal'], fibrillations: ['absent'], positiveWaves: ['absent'], fasciculations: ['absent'], duration: [8, 13], amplitude: [300, 3500], polyphasia: [5, 15], recruitment: ['normal'] },
            { muscle: 'Cervical Paraspinals C8-T1', nerve: 'Ramo dorsal', root: 'C8-T1', insertionalActivity: ['normal'], fibrillations: ['absent'], positiveWaves: ['absent'], fasciculations: ['absent'], duration: [8, 12], amplitude: [300, 2500], polyphasia: [5, 15], recruitment: ['normal'] },
        ],
        explanation: 'Plexopatía braquial inferior (tronco inferior C8-T1): denervación en músculos C8-T1 (interóseos, APB, FCU) con SNAP cubital y cutáneo antebraquial medial anormales (confirma lesión post-ganglionar). Paraespinales normales excluyen radiculopatía. Síndrome de Horner sugiere afección de fibras simpáticas T1 (tumor de Pancoast, radiación).',
        differentials: [
            { id: 'ulnar_neuropathy_elbow', name: 'Neuropatía Cubital en Codo', whyNot: 'El SNAP del cutáneo antebraquial medial (rama del plexo, no del cubital) está anormal → lesión proximal al codo = plexo. En neuropatía cubital, este SNAP sería normal.' },
            { id: 'c8_t1_radiculopathy', name: 'Radiculopatía C8-T1', whyNot: 'Los SNAP están reducidos → lesión post-ganglionar. En radiculopatía los SNAP serían normales.' },
        ],
        recommendations: ['TAC/RMN de ápex pulmonar y plexo braquial.', 'Descartar tumor de Pancoast o infiltración tumoral.', 'Si antecedente de radiación, considerar plexopatía actínica.']
    },
    // ═══════════ 11. MIASTENIA GRAVIS ═══════════
    {
        patternId: 'myasthenia_gravis', patternName: 'Miastenia Gravis', category: 'neuromuscular_junction',
        patient: {
            ageRange: [20, 60], sexBias: 'female', occupations: ['Secretaria', 'Profesora', 'Enfermera'],
            complaints: ['Visión doble y caída del párpado que empeora por la tarde', 'Dificultad para masticar al final de las comidas'],
            histories: ['Mujer de 35 años con 3 meses de diplopía intermitente y ptosis palpebral que empeoran con la fatiga. Dificultad para masticar que progresa durante las comidas. Debilidad proximal fluctuante. Sin déficit sensitivo.'],
            physicalExams: ['Ptosis bilateral que se acentúa con mirada sostenida hacia arriba 1 min. Oftalmoplejía parcial. Fza 4/5 deltoides bilateral que decae a 3/5 con esfuerzo repetido. Sensibilidad normal. Reflejos normales. Prueba de hielo positiva para ptosis.']
        },
        ncs: [
            { nerve: 'Mediano', type: 'motor', latency: [2.8, 3.8], amplitude: [5, 11], velocity: [50, 60], normalRanges: NR.medianMotor },
            { nerve: 'Cubital', type: 'motor', latency: [2.2, 3.2], amplitude: [7, 13], velocity: [50, 62], normalRanges: NR.ulnarMotor },
            { nerve: 'Accesorio espinal', type: 'motor', latency: [2.0, 3.5], amplitude: [4, 10], velocity: [48, 58], normalRanges: { latency: [1.5, 3.5], amplitude: [5, 15], velocity: [45, 60] } },
            { nerve: 'Mediano', type: 'sensory', latency: [2.2, 3.2], amplitude: [18, 45], velocity: [52, 62], normalRanges: NR.medianSensory },
        ],
        rns: [
            { nerve: 'Accesorio espinal', muscle: 'Trapecio', frequency: '3Hz', baselineCMAP: [4, 10], decrementPercent: [-15, -30], postExerciseFacilitation: [5, 15], postExerciseExhaustion: [-20, -40] },
            { nerve: 'Facial', muscle: 'Nasalis', frequency: '3Hz', baselineCMAP: [1, 3], decrementPercent: [-12, -25] },
        ],
        emg: [
            { muscle: 'Deltoides', nerve: 'Axilar', root: 'C5-C6', insertionalActivity: ['normal'], fibrillations: ['absent'], positiveWaves: ['absent'], fasciculations: ['absent'], duration: [8, 13], amplitude: [300, 3500], polyphasia: [5, 15], recruitment: ['normal'] },
            { muscle: 'Orbicularis Oculi', nerve: 'Facial', root: 'Pons', insertionalActivity: ['normal'], fibrillations: ['absent'], positiveWaves: ['absent'], fasciculations: ['absent'], duration: [6, 10], amplitude: [200, 2000], polyphasia: [10, 25], recruitment: ['normal'] },
        ],
        explanation: 'Miastenia Gravis: NCS de rutina normales. El hallazgo diagnóstico es el DECREMENTO >10% en ENR a 3Hz en trapecio y nasalis. Patrón típico: decremento máximo al 4to-5to estímulo, reparación parcial post-ejercicio, y agotamiento post-ejercicio a 2-4 min. EMG de rutina normal (puede haber variación de MUPs con SFEMG). Sin denervación ni alteración sensitiva.',
        differentials: [
            { id: 'lems', name: 'LEMS', whyNot: 'En LEMS los CMAPs basales están MUY reducidos y hay facilitación post-ejercicio >100%. Aquí los CMAPs basales son normales.' },
            { id: 'myopathy', name: 'Miopatía', whyNot: 'No hay patrón miopático en EMG (MUPs normales). La debilidad es fluctuante, no fija.' },
        ],
        recommendations: ['Anticuerpos anti-AChR y anti-MuSK.', 'TAC de tórax (timoma).', 'Si ENR negativa, considerar SFEMG (más sensible).', 'Referencia a neurología para manejo con anticolinesterásicos.'],
        severityGrade: 'moderate', severityExplanation: 'Decremento significativo en musculatura proximal y facial.'
    },
    // ═══════════ 12. LEMS ═══════════
    {
        patternId: 'lems', patternName: 'Síndrome de Lambert-Eaton (LEMS)', category: 'neuromuscular_junction',
        patient: {
            ageRange: [45, 70], sexBias: 'male', occupations: ['Fumador', 'Jubilado', 'Agricultor'],
            complaints: ['Debilidad en piernas de 3 meses, dificultad para levantarse de silla', 'Boca seca y dificultad para orinar'],
            histories: ['Hombre de 60 años, fumador de 40 paquetes/año. Debilidad proximal progresiva predominante en MMII. Boca seca, estreñimiento, disfunción eréctil. Nota que la fuerza mejora brevemente con el ejercicio. Pérdida de peso 5kg.'],
            physicalExams: ['Fza 3/5 proximal MMII, 4/5 proximal MMSS. Hiporreflexia generalizada que MEJORA post-ejercicio (facilitación). Sensibilidad normal. Boca seca. Sin ptosis ni oftalmoplejía.']
        },
        ncs: [
            { nerve: 'Mediano', type: 'motor', latency: [3.0, 4.0], amplitude: [1.5, 3.5], velocity: [50, 60], normalRanges: NR.medianMotor },
            { nerve: 'Cubital', type: 'motor', latency: [2.5, 3.5], amplitude: [1.5, 4.0], velocity: [50, 60], normalRanges: NR.ulnarMotor },
            { nerve: 'Peroneo', type: 'motor', latency: [3.5, 5.0], amplitude: [0.5, 2.0], velocity: [42, 52], normalRanges: NR.peronealMotor },
            { nerve: 'Mediano', type: 'sensory', latency: [2.2, 3.2], amplitude: [18, 42], velocity: [52, 62], normalRanges: NR.medianSensory },
            { nerve: 'Sural', type: 'sensory', latency: [2.8, 3.8], amplitude: [10, 28], velocity: [42, 52], normalRanges: NR.suralSensory },
        ],
        rns: [
            { nerve: 'Cubital', muscle: 'ADM', frequency: '3Hz', baselineCMAP: [1.5, 4.0], decrementPercent: [-10, -20], postExerciseFacilitation: [100, 300] },
            { nerve: 'Accesorio espinal', muscle: 'Trapecio', frequency: '3Hz', baselineCMAP: [2, 5], decrementPercent: [-8, -18], postExerciseFacilitation: [80, 250] },
        ],
        emg: [
            { muscle: 'Vastus Lateralis', nerve: 'Femoral', root: 'L2-L4', insertionalActivity: ['normal'], fibrillations: ['absent'], positiveWaves: ['absent'], fasciculations: ['absent'], duration: [8, 13], amplitude: [300, 3000], polyphasia: [10, 25], recruitment: ['normal', 'reduced'] },
            { muscle: 'Deltoides', nerve: 'Axilar', root: 'C5-C6', insertionalActivity: ['normal'], fibrillations: ['absent'], positiveWaves: ['absent'], fasciculations: ['absent'], duration: [8, 13], amplitude: [300, 3000], polyphasia: [10, 20], recruitment: ['normal'] },
        ],
        explanation: 'LEMS: CMAPs basales DIFUSAMENTE reducidos con SNAP normales. El hallazgo PATOGNOMÓNICO es la facilitación post-ejercicio >100% (los CMAPs más que duplican su amplitud tras 10 segundos de ejercicio máximo). Decremento a baja frecuencia. EMG puede ser normal. Síntomas autonómicos (boca seca, disfunción eréctil) son típicos. 60% asociado a carcinoma pulmonar de células pequeñas.',
        differentials: [
            { id: 'myasthenia_gravis', name: 'Miastenia Gravis', whyNot: 'En MG los CMAPs basales son normales y la facilitación post-ejercicio es mínima (<40%). Aquí hay facilitación >100%.' },
            { id: 'acute_axonal_neuropathy', name: 'Neuropatía Axonal', whyNot: 'Los SNAP son completamente normales, descartando neuropatía. La facilitación post-ejercicio no ocurre en neuropatía.' },
        ],
        recommendations: ['🚨 Búsqueda de neoplasia (TAC tórax, PET-CT).', 'Anticuerpos anti-VGCC.', 'Si paraneoplásico, tratar tumor primero.', 'Considerar 3,4-DAP si es autoinmune.'],
        severityGrade: 'severe', severityExplanation: 'CMAPs basales muy reducidos con facilitación marcada. Síntomas autonómicos significativos.'
    },
    // ═══════════ 13. GBS CLÁSICA ═══════════
    {
        patternId: 'gbs_classic', patternName: 'Guillain-Barré (AIDP)', category: 'demyelinating',
        patient: {
            ageRange: [20, 65], occupations: ['Oficinista', 'Maestro', 'Comerciante'],
            complaints: ['Hormigueo en pies y manos de 5 días seguido de debilidad ascendente', 'Dificultad para caminar y subir escaleras'],
            histories: ['Hombre de 42 años con cuadro diarreico hace 2 semanas, seguido de parestesias distales ascendentes y debilidad progresiva en 5 días. Ahora no puede caminar sin apoyo. Sin antecedentes neurológicos previos.'],
            physicalExams: ['Fza 3/5 proximal y distal MMII, 4/5 MMSS. Arreflexia generalizada. Hipoestesia en guante-calcetín. Sin compromiso respiratorio actual. Pares craneales normales. Signo de Lasègue negativo.']
        },
        ncs: [
            { nerve: 'Mediano', type: 'motor', latency: [6.0, 9.0], amplitude: [2, 6], velocity: [25, 38], normalRanges: NR.medianMotor, conductionBlock: true, temporalDispersion: true },
            { nerve: 'Cubital', type: 'motor', latency: [5.0, 8.0], amplitude: [2, 5], velocity: [28, 40], normalRanges: NR.ulnarMotor, conductionBlock: true, temporalDispersion: true },
            { nerve: 'Peroneo', type: 'motor', latency: [7.0, 12.0], amplitude: [0.5, 3], velocity: [20, 35], normalRanges: NR.peronealMotor, conductionBlock: true },
            { nerve: 'Tibial', type: 'motor', latency: [7.0, 11.0], amplitude: [1, 4], velocity: [22, 36], normalRanges: NR.tibialMotor },
            { nerve: 'Mediano', type: 'sensory', latency: [3.5, 5.5], amplitude: [5, 20], velocity: [32, 45], normalRanges: NR.medianSensory },
            { nerve: 'Sural', type: 'sensory', latency: [3.0, 4.5], amplitude: [4, 18], velocity: [35, 48], normalRanges: NR.suralSensory },
        ],
        lateResponses: [
            { type: 'f_wave', nerve: 'Mediano', minLatency: [38, 50], persistence: [0, 30], chronodispersion: [8, 15], normalRange: [24, 32], status: ['abnormal', 'absent'] },
            { type: 'f_wave', nerve: 'Tibial', minLatency: [60, 80], persistence: [0, 20], normalRange: [44, 56], status: ['abnormal', 'absent'] },
        ],
        emg: [
            { muscle: 'Tibialis Anterior', nerve: 'Peroneo profundo', root: 'L4-L5', insertionalActivity: ['normal', 'increased'], fibrillations: ['absent', '1+'], positiveWaves: ['absent', '1+'], fasciculations: ['absent'], duration: [8, 13], amplitude: [300, 3000], polyphasia: [5, 20], recruitment: ['reduced'] },
            { muscle: 'First Dorsal Interosseous', nerve: 'Cubital', root: 'C8-T1', insertionalActivity: ['normal'], fibrillations: ['absent', '1+'], positiveWaves: ['absent'], fasciculations: ['absent'], duration: [8, 13], amplitude: [300, 3000], polyphasia: [5, 15], recruitment: ['reduced'] },
        ],
        explanation: 'GBS (AIDP): polirradiculoneuropatía desmielinizante aguda. Latencias distales MUY prolongadas, velocidades MUY reducidas, bloqueos de conducción y dispersión temporal DIFUSOS. Ondas F ausentes o muy prolongadas (hallazgo más precoz). SNAP reducidos. La denervación EMG es mínima o ausente en fase aguda. Antecedente infeccioso 1-3 semanas antes es típico.',
        differentials: [
            { id: 'cidp', name: 'CIDP', whyNot: 'La CIDP es crónica (>8 semanas). El GBS es agudo (días a semanas) con antecedente infeccioso y curso monofásico.' },
            { id: 'acute_axonal_neuropathy', name: 'Neuropatía Axonal Aguda', whyNot: 'El patrón es claramente DESMIELINIZANTE (velocidades muy lentas, latencias prolongadas, BC, DT). En axonal las velocidades serían normales/levemente reducidas con amplitudes bajas.' },
        ],
        recommendations: ['🚨 URGENTE: Hospitalización. Monitoreo respiratorio (CVF cada 4h).', 'IVIg o plasmaféresis.', 'Buscar criterios de ventilación mecánica.', 'LCR: disociación albúmino-citológica.', 'EMG control a 2-4 semanas para pronóstico.'],
        severityGrade: 'severe', severityExplanation: 'Desmielinización difusa con bloqueos de conducción múltiples y ondas F ausentes.'
    },
    // ═══════════ 14. CIDP ═══════════
    {
        patternId: 'cidp', patternName: 'CIDP (Polineuropatía Desmielinizante Inflamatoria Crónica)', category: 'demyelinating',
        patient: {
            ageRange: [40, 70], occupations: ['Contador', 'Jubilado', 'Ingeniero'],
            complaints: ['Debilidad progresiva en manos y piernas de 4 meses', 'Dificultad para abotonarse y caminar'],
            histories: ['Hombre de 55 años con debilidad simétrica progresiva de 4 meses, tanto proximal como distal. Parestesias en manos y pies. Sin antecedente infeccioso previo. Curso progresivo sin mejoría espontánea. Pérdida de reflejos.'],
            physicalExams: ['Fza 3/5 proximal y distal MMII, 4/5 MMSS simétrico. Arreflexia generalizada. Hipoestesia en guante-calcetín. Marcha atáxica. Romberg positivo. Nervios engrosados palpables en cubital.']
        },
        ncs: [
            { nerve: 'Mediano', type: 'motor', latency: [7.0, 10.0], amplitude: [2, 6], velocity: [22, 35], normalRanges: NR.medianMotor, stimulationSite: 'distal', proximalAmplitude: [1, 3], conductionBlock: true, temporalDispersion: true },
            { nerve: 'Cubital', type: 'motor', latency: [5.5, 8.5], amplitude: [2, 5], velocity: [25, 38], normalRanges: NR.ulnarMotor, stimulationSite: 'distal', proximalAmplitude: [0.8, 2.5], conductionBlock: true },
            { nerve: 'Peroneo', type: 'motor', latency: [8.0, 13.0], amplitude: [0.5, 3], velocity: [18, 32], normalRanges: NR.peronealMotor, conductionBlock: true },
            { nerve: 'Mediano', type: 'sensory', latency: [4.0, 6.0], amplitude: [3, 12], velocity: [30, 42], normalRanges: NR.medianSensory },
            { nerve: 'Sural', type: 'sensory', latency: [3.5, 5.0], amplitude: [2, 10], velocity: [32, 44], normalRanges: NR.suralSensory },
        ],
        lateResponses: [
            { type: 'f_wave', nerve: 'Mediano', minLatency: [40, 55], persistence: [10, 40], chronodispersion: [10, 18], normalRange: [24, 32], status: ['abnormal'] },
            { type: 'f_wave', nerve: 'Tibial', minLatency: [65, 85], persistence: [5, 30], normalRange: [44, 56], status: ['abnormal'] },
        ],
        emg: [
            { muscle: 'Tibialis Anterior', nerve: 'Peroneo profundo', root: 'L4-L5', insertionalActivity: ['normal', 'increased'], fibrillations: ['absent', '1+'], positiveWaves: ['absent', '1+'], fasciculations: ['absent'], duration: [10, 16], amplitude: [2000, 6000], polyphasia: [15, 30], recruitment: ['reduced'] },
            { muscle: 'First Dorsal Interosseous', nerve: 'Cubital', root: 'C8-T1', insertionalActivity: ['normal'], fibrillations: ['absent', '1+'], positiveWaves: ['absent'], fasciculations: ['absent'], duration: [10, 16], amplitude: [2000, 5000], polyphasia: [15, 30], recruitment: ['reduced'] },
        ],
        explanation: 'CIDP: polineuropatía desmielinizante crónica (>8 semanas) con debilidad PROXIMAL y DISTAL simétrica. Cumple criterios EFNS/PNS: latencias distales >50% del LSN, velocidades <70% del LIN, bloqueos de conducción, dispersión temporal, y F prolongadas en ≥2 nervios. A diferencia del GBS, el curso es crónico progresivo/recurrente.',
        differentials: [
            { id: 'gbs_classic', name: 'GBS (AIDP)', whyNot: 'El GBS es agudo (evolución en días-semanas) y monofásico. La CIDP evoluciona >8 semanas y es crónica progresiva o recurrente.' },
            { id: 'chronic_axonal_neuropathy', name: 'Neuropatía Axonal Crónica', whyNot: 'El patrón es desmielinizante (velocidades muy lentas, BC, DT). La debilidad proximal es atípica de neuropatía axonal.' },
        ],
        recommendations: ['IVIg, corticosteroides, o plasmaféresis.', 'Biopsia de nervio si diagnóstico incierto.', 'Descartar POEMS, gammapatía monoclonal (SPEP, IFE).', 'EMG de seguimiento para evaluar respuesta al tratamiento.'],
        severityGrade: 'severe', severityExplanation: 'Desmielinización difusa crónica con bloqueos de conducción y reinervación parcial.'
    },
    // ═══════════ 15. NEUROPATÍA CUBITAL EN CODO ═══════════
    {
        patternId: 'ulnar_neuropathy_elbow', patternName: 'Neuropatía Cubital en Codo', category: 'entrapment',
        patient: {
            ageRange: [30, 65], occupations: ['Programador', 'Cajero', 'Mecánico'],
            complaints: ['Adormecimiento en 4to-5to dedo de mano derecha', 'Debilidad para agarrar objetos y torpeza de mano'],
            histories: ['Hombre de 45 años, programador, con 3 meses de parestesias en 4to-5to dedo derecho. Debilidad progresiva de mano. Hábito de apoyar codo en escritorio. Sin dolor cervical.'],
            physicalExams: ['Fza 4/5 interóseos derechos, 4/5 aductor del pulgar. 5/5 FDP, flexor cubital. Hipoestesia 5to dedo y mitad medial 4to. Signo de Tinel en codo (+). Sensibilidad normal en antebrazo medial.']
        },
        ncs: [
            { nerve: 'Cubital', type: 'motor', latency: [2.5, 3.5], amplitude: [4, 8], velocity: [50, 60], normalRanges: NR.ulnarMotor, stimulationSite: 'distal' },
            { nerve: 'Cubital (a través codo)', type: 'motor', latency: [6.0, 9.0], amplitude: [2, 5], velocity: [25, 38], normalRanges: NR.ulnarMotor, stimulationSite: 'across_elbow', proximalAmplitude: [2, 5], conductionBlock: true },
            { nerve: 'Cubital', type: 'sensory', latency: [2.2, 3.2], amplitude: [5, 15], velocity: [45, 55], normalRanges: NR.ulnarSensory },
            { nerve: 'Mediano', type: 'motor', latency: [2.8, 3.8], amplitude: [6, 12], velocity: [50, 62], normalRanges: NR.medianMotor },
            { nerve: 'Mediano', type: 'sensory', latency: [2.2, 3.2], amplitude: [20, 45], velocity: [52, 62], normalRanges: NR.medianSensory },
        ],
        emg: [
            { muscle: 'First Dorsal Interosseous', nerve: 'Cubital', root: 'C8-T1', insertionalActivity: ['normal', 'increased'], fibrillations: ['absent', '1+'], positiveWaves: ['absent', '1+'], fasciculations: ['absent'], duration: [10, 15], amplitude: [2000, 5000], polyphasia: [15, 30], recruitment: ['reduced', 'normal'] },
            { muscle: 'Abductor Digiti Minimi', nerve: 'Cubital', root: 'C8-T1', insertionalActivity: ['normal', 'increased'], fibrillations: ['absent', '1+'], positiveWaves: ['absent'], fasciculations: ['absent'], duration: [9, 14], amplitude: [1500, 4000], polyphasia: [10, 25], recruitment: ['normal', 'reduced'] },
            { muscle: 'Flexor Carpi Ulnaris', nerve: 'Cubital', root: 'C8-T1', insertionalActivity: ['normal'], fibrillations: ['absent'], positiveWaves: ['absent'], fasciculations: ['absent'], duration: [8, 13], amplitude: [300, 3500], polyphasia: [5, 15], recruitment: ['normal'] },
            { muscle: 'Abductor Pollicis Brevis', nerve: 'Mediano', root: 'C8-T1', insertionalActivity: ['normal'], fibrillations: ['absent'], positiveWaves: ['absent'], fasciculations: ['absent'], duration: [8, 13], amplitude: [300, 3500], polyphasia: [5, 15], recruitment: ['normal'] },
        ],
        explanation: 'Neuropatía cubital en codo: la velocidad de conducción cae significativamente al cruzar el codo (<50 m/s en ese segmento) con posible bloqueo de conducción. SNAP cubital reducido. Denervación en músculos inervados por cubital DISTALES al codo (interóseos, ADM), pero el FCU (que se ramifica apenas distal al codo) puede estar normal o levemente afectado. Nervio mediano completamente normal.',
        differentials: [
            { id: 'lower_brachial_plexopathy', name: 'Plexopatía Braquial Inferior', whyNot: 'El SNAP del cutáneo antebraquial medial sería anormal en plexopatía. Aquí solo el cubital está afectado. La velocidad cae focalmente en el codo.' },
            { id: 'c8_t1_radiculopathy', name: 'Radiculopatía C8-T1', whyNot: 'El SNAP cubital está reducido → lesión post-ganglionar. Si fuera radiculopatía, el SNAP sería normal.' },
        ],
        recommendations: ['Evitar presión sobre codo (almohadilla, cambio postural).', 'Si moderada-severa, considerar transposición o descompresión quirúrgica.', 'EMG de seguimiento en 3 meses.'],
        severityGrade: 'moderate', severityExplanation: 'Enlentecimiento focal con bloqueo parcial y denervación leve.'
    },
    // ═══════════ 16. NEUROPATÍA PERONEAL EN CABEZA DE PERONÉ ═══════════
    {
        patternId: 'peroneal_neuropathy', patternName: 'Neuropatía Peroneal en Cabeza de Peroné', category: 'entrapment',
        patient: {
            ageRange: [25, 60], occupations: ['Cirujano (largas horas de pie)', 'Paciente postquirúrgico', 'Deportista'],
            complaints: ['Pie caído izquierdo de inicio súbito', 'No puede levantar el pie al caminar, tropieza'],
            histories: ['Hombre de 38 años que nota pie caído izquierdo tras cirugía prolongada (6 horas en cama). Sin dolor lumbar. Hábito de cruzar piernas frecuentemente.'],
            physicalExams: ['Fza 1/5 dorsiflexores de tobillo izq, 2/5 evertores. 5/5 inversores (tibial posterior normal). 5/5 flexores plantares. Hipoestesia dorso del pie. Marcha en steppage.']
        },
        ncs: [
            { nerve: 'Peroneo', type: 'motor', latency: [4.0, 5.5], amplitude: [0.3, 2.0], velocity: [30, 42], normalRanges: NR.peronealMotor, stimulationSite: 'distal' },
            { nerve: 'Peroneo (debajo peroné)', type: 'motor', latency: [8.0, 12.0], amplitude: [0.2, 1.5], velocity: [15, 28], normalRanges: NR.peronealMotor, stimulationSite: 'below_fibular_head' },
            { nerve: 'Peroneo (arriba peroné)', type: 'motor', latency: [10.0, 14.0], amplitude: [0.1, 0.8], velocity: [15, 28], normalRanges: NR.peronealMotor, stimulationSite: 'above_fibular_head', proximalAmplitude: [0.1, 0.8], conductionBlock: true },
            { nerve: 'Peroneo superficial', type: 'sensory', latency: [3.0, 4.5], amplitude: [2, 8], velocity: [35, 48], normalRanges: { latency: [2.5, 3.8], amplitude: [5, 20], velocity: [40, 55] } },
            { nerve: 'Tibial', type: 'motor', latency: [3.5, 5.0], amplitude: [6, 14], velocity: [42, 52], normalRanges: NR.tibialMotor },
            { nerve: 'Sural', type: 'sensory', latency: [2.8, 3.8], amplitude: [10, 28], velocity: [42, 52], normalRanges: NR.suralSensory },
        ],
        emg: [
            { muscle: 'Tibialis Anterior', nerve: 'Peroneo profundo', root: 'L4-L5', insertionalActivity: ['increased'], fibrillations: ['2+', '3+'], positiveWaves: ['2+'], fasciculations: ['absent'], duration: [8, 12], amplitude: [200, 2000], polyphasia: [10, 20], recruitment: ['discrete', 'absent'] },
            { muscle: 'Peroneus Longus', nerve: 'Peroneo superficial', root: 'L5-S1', insertionalActivity: ['increased'], fibrillations: ['2+'], positiveWaves: ['1+'], fasciculations: ['absent'], duration: [8, 12], amplitude: [200, 2000], polyphasia: [10, 20], recruitment: ['reduced'] },
            { muscle: 'Tibialis Posterior', nerve: 'Tibial', root: 'L4-L5', insertionalActivity: ['normal'], fibrillations: ['absent'], positiveWaves: ['absent'], fasciculations: ['absent'], duration: [8, 13], amplitude: [300, 3500], polyphasia: [5, 15], recruitment: ['normal'] },
            { muscle: 'Gastrocnemius', nerve: 'Tibial', root: 'S1-S2', insertionalActivity: ['normal'], fibrillations: ['absent'], positiveWaves: ['absent'], fasciculations: ['absent'], duration: [8, 13], amplitude: [300, 3500], polyphasia: [5, 15], recruitment: ['normal'] },
        ],
        explanation: 'Neuropatía peroneal en cabeza de peroné: caída de CMAP con bloqueo de conducción al cruzar la cabeza del peroné. SNAP peroneal superficial reducido. Denervación en músculos peroneo-dependientes (tibial anterior, peroneos) PERO tibial posterior NORMAL (diferencia CLAVE vs radiculopatía L5 donde tibial posterior estaría afectado). Nervio tibial completamente normal.',
        differentials: [
            { id: 'l5_radiculopathy', name: 'Radiculopatía L5', whyNot: 'En radiculopatía L5, el tibial posterior (L5, nervio tibial) estaría afectado. Aquí es normal → lesión del nervio peroneo, no de la raíz L5. Además, el SNAP peroneal está reducido (post-ganglionar).' },
            { id: 'acute_axonal_neuropathy', name: 'Neuropatía Axonal', whyNot: 'Afectación FOCAL de un solo nervio con localización clara en cabeza de peroné. No es difuso.' },
        ],
        recommendations: ['Evitar compresión en cabeza de peroné.', 'Órtesis para pie caído (AFO).', 'EMG seguimiento en 3 meses.', 'Si no mejora, considerar descompresión quirúrgica.'],
        severityGrade: 'severe', severityExplanation: 'Bloqueo de conducción completo con denervación activa.'
    },
];
