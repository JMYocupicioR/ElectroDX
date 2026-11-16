import type { LessonExpansion } from './lessonExpansions';
import { BIBLIO_BASE, BIBLIO_NCS, IMG, pack } from './lessonExpansionsModules1to3';

/** Clave: topicId::título exacto. Para ids repetidos con títulos distintos. */
export const DUPLICATE_BY_TITLE: Record<string, LessonExpansion> = {
  'sfemg::EMG de Fibra Única (SFEMG)': pack({
    img: IMG.emg,
    biblio: BIBLIO_BASE,
    objetivos: [
      'Situar la SFEMG del módulo de aguja: jitter y densidad de fibra en la lección de EMG, no como capítulo de estudios especiales.',
      'Elegir electrodo de fibra única o concéntrica filtrada a 500 Hz con su propia tabla.',
    ],
    clinica:
      'En el curso de aguja, la SFEMG es la modalidad más selectiva: 1–3 fibras, radio ~300 µm. Aquí se aprende el electrodo y los filtros antes de los protocolos de UNM del módulo 7.',
    tecnica: [
      'Filtro pasa-altos 500 Hz, ganancia 200 µV/div, barrido 1 ms/div.',
      'Si no hay electrodo de fibra única, use concéntrica + 500 Hz y las normas de ese electrodo.',
    ],
    interpretacion:
      'Esta hoja introduce la herramienta. El jitter diagnóstico de MG se detalla en estudios especiales.',
    errores: [
      'Usar normas de electrodo de fibra única en una concéntrica.',
      'Hacer SFEMG como primer pinchazo de un curso de aguja básica.',
    ],
    perlas: [
      'Primero filtros y radio; después jitter.',
      'La concéntrica filtrada es válida si cambia la tabla.',
    ],
    puntos: [
      'Módulo de aguja: instrumento.',
      'Módulo 7: protocolo de UNM.',
    ],
    objetivosEn: [
      'Treat needle-module SFEMG as the electrode and filter lesson, not the MG protocol.',
    ],
    clinicaEn:
      'Single-fiber electrode, ~300 µm, 1–3 fibers. Jitter criteria live in special studies.',
    tecnicaEn:
      '500 Hz high-pass, 200 µV/div, 1 ms/div. Concentric + 500 Hz needs its own norms.',
    perlasEn: [
      'Filters first, jitter later.',
      'Wrong electrode, wrong table.',
    ],
    puntosEn: [
      'Needle module = instrument.',
      'Module 7 = NMJ protocol.',
    ],
  }),

  'sfemg::Electromiografía de Fibra Única (SFEMG)': pack({
    img: IMG.emg,
    biblio: BIBLIO_BASE,
    objetivos: [
      'Usar la SFEMG del módulo de estudios especiales como prueba de UNM (jitter), no como introducción al electrodo.',
      'Indicarla cuando la RNS es negativa y la sospecha de MG ocular es alta.',
    ],
    clinica:
      'En estudios especiales, SFEMG es el estudio más sensible de transmisión neuromuscular. Un jitter aumentado con bloqueo en un músculo débil apoya UNM. Aquí no se está enseñando a pinchar el FDI por primera vez.',
    tecnica: [
      'Músculo débil o frontal/orbicular en MG ocular. 20 pares. Compare con normas del electrodo usado.',
      'Si hay denervación grosera, el jitter neurogénico imita UNM: elija un músculo no denervado.',
    ],
    interpretacion:
      'Jitter alto + bloqueo en músculo no denervado = UNM. Jitter alto en un músculo lleno de PUM gigantes = reinnervación.',
    errores: [
      'SFEMG en un músculo con fibrilaciones 3+ como prueba de MG.',
      'Informar “SFEMG anormal” sin número de pares ni electrodo.',
    ],
    perlas: [
      'RNS negativa no cierra MG ocular: esta es la hoja que lo dice.',
      'El jitter de un músculo reinnervado no es miastenia.',
    ],
    puntos: [
      'Protocolo de UNM.',
      '20 pares, normas del electrodo.',
    ],
    objetivosEn: [
      'Use special-studies SFEMG as the NMJ jitter test after negative RNS.',
    ],
    clinicaEn:
      'Most sensitive NMJ test. Do not needle a densely denervated muscle to “prove” MG.',
    tecnicaEn:
      'Weak or ocular muscle, 20 pairs, electrode-specific norms.',
    perlasEn: [
      'Negative RNS does not close ocular MG.',
      'Reinnervation jitter is not myasthenia.',
    ],
    puntosEn: [
      'NMJ protocol.',
      'Name the electrode in the report.',
    ],
  }),

  'sfemg-principles::Principios y electrodos': pack({
    img: IMG.emg,
    biblio: BIBLIO_BASE,
    objetivos: [
      'Describir superficie de 25 µm, radio de 300 µm y filtros de 500 Hz en la lección de aguja.',
      'Presentar concentric-SFEMG como alternativa de laboratorio docente.',
    ],
    clinica:
      'Principios de electrodo: selectividad espacial. El pasa-altos de 500 Hz rechaza fibras lejanas. Sin trigger no hay jitter medible.',
    tecnica: [
      'Monte trigger. No recorte el potencial de la fibra de referencia.',
      'Archive el electrodo usado (SF vs concéntrica).',
    ],
    interpretacion:
      'Mal filtro = “fibras” que son ruido lejano.',
    errores: [
      'Filtro de EMG convencional (10 Hz) en un estudio llamado SFEMG.',
    ],
    perlas: [
      '500 Hz es el electrodo, no un adorno.',
    ],
    puntos: [
      'Radio ~300 µm.',
      'Declare el electrodo.',
    ],
    objetivosEn: [
      'Teach the 25 µm electrode and 500 Hz filter in the needle module.',
    ],
    clinicaEn:
      'Selectivity is filter plus electrode surface. Trigger is required for jitter.',
    tecnicaEn:
      '500 Hz high-pass. Name SF vs concentric on the trace.',
    perlasEn: [
      '10 Hz is not single-fiber.',
    ],
    puntosEn: [
      '~300 µm territory.',
      'Name the electrode.',
    ],
  }),

  'sfemg-principles::Principios y Técnica': pack({
    img: IMG.emg,
    biblio: BIBLIO_BASE,
    objetivos: [
      'Aplicar la técnica de pares y jitter del módulo de estudios especiales.',
      'Contar 20 pares y reportar jitter medio y bloqueos.',
    ],
    clinica:
      'Técnica de estudio especial: identifique dos fibras de la misma unidad, mida variabilidad de intervalo. Bloqueo = fallo de transmisión.',
    tecnica: [
      '20 pares mínimo. Evite movimiento. Músculo poco denervado.',
      'Informe jitter medio, % de pares anormales y bloqueos.',
    ],
    interpretacion:
      'Un par inestable no es un estudio. Veinte pares sí.',
    errores: [
      'Cinco pares “porque ya se veía”.',
      'Frontal en un paciente que no deja de parpadear.',
    ],
    perlas: [
      'El número de pares es parte del criterio.',
    ],
    puntos: [
      '20 pares.',
      'Jitter + bloqueo.',
    ],
    objetivosEn: [
      'Collect 20 fiber pairs and report mean jitter plus blocking in the special-studies protocol.',
    ],
    clinicaEn:
      'Jitter is IPI variability. Blocking is transmission failure. Denervated muscle confounds both.',
    tecnicaEn:
      'Twenty pairs, still muscle, report mean jitter and blocking percentage.',
    perlasEn: [
      'Five pairs are not a study.',
    ],
    puntosEn: [
      '20 pairs.',
      'Jitter and block.',
    ],
  }),

  'fiber-density::Densidad de fibra': pack({
    img: IMG.emg,
    biblio: BIBLIO_BASE,
    objetivos: [
      'Definir densidad de fibra como número de potenciales de la misma UM en ~300 µm (lección de aguja).',
      'Relacionarla con reinnervación colateral, no con jitter de MG.',
    ],
    clinica:
      'DF alta = más fibras de la misma unidad cerca del electrodo = sprouting. En el módulo de aguja es anatomía de la unidad motora crónica, no un test de UNM.',
    tecnica: [
      'Cuente picos de la misma UM que superen el umbral del laboratorio.',
      'No la mezcle con el jitter del mismo inserto si está enseñando reclutamiento.',
    ],
    interpretacion:
      'DF alta apoya reinnervación crónica. DF baja no diagnostica miopatía por sí sola.',
    errores: [
      'Llamar miastenia a una DF alta.',
    ],
    perlas: [
      'DF cuenta vecinos; jitter cuenta reloj.',
    ],
    puntos: [
      'Sprouting = DF alta.',
      'No es el test de MG.',
    ],
    objetivosEn: [
      'Read fiber density as chronic sprouting in the needle module, not as an MG test.',
    ],
    clinicaEn:
      'High FD means more same-unit fibers in 300 µm: collateral reinnervation.',
    tecnicaEn:
      'Count same-unit spikes. Do not equate FD with jitter.',
    perlasEn: [
      'FD counts neighbors; jitter counts time.',
    ],
    puntosEn: [
      'High FD = sprouting.',
      'Not myasthenia.',
    ],
  }),

  'fiber-density::Densidad de Fibra (FD)': pack({
    img: IMG.emg,
    biblio: BIBLIO_BASE,
    objetivos: [
      'Usar FD del módulo de estudios especiales como parámetro cuantitativo de arquitectura de UM.',
      'Reportarla junto a jitter solo cuando el protocolo de UNM/reinnervación lo pide.',
    ],
    clinica:
      'En QEMG/SFEMG avanzado, FD documenta reinnervación colateral. Sube en neurogeno crónico y puede subir un poco en UNM inestable. El informe de estudios especiales debe separar FD de jitter.',
    tecnica: [
      'Mismo electrodo que el jitter. Normas propias.',
      'No use FD para “confirmar MG” si el jitter es el dato.',
    ],
    interpretacion:
      'FD alta + PUM grandes = crónica neurogénica. FD alta + jitter alto en músculo débil sin denervación = piense UNM, pero el jitter manda.',
    errores: [
      'Un solo número de FD como diagnóstico.',
    ],
    perlas: [
      'FD es arquitectura; jitter es transmisión.',
    ],
    puntos: [
      'Parámetro cuantitativo de UM.',
      'Normas del electrodo.',
    ],
    objetivosEn: [
      'Report FD as motor-unit architecture in special studies, separate from jitter.',
    ],
    clinicaEn:
      'FD rises with sprouting. Jitter answers NMJ. Do not merge them into one sentence.',
    tecnicaEn:
      'Same electrode as jitter. Use FD norms. Do not diagnose MG from FD alone.',
    perlasEn: [
      'FD is architecture; jitter is transmission.',
    ],
    puntosEn: [
      'Quantitative MU parameter.',
      'Electrode-specific norms.',
    ],
  }),

  'turns-amplitude::Análisis cuantitativo turns/amplitud': pack({
    img: IMG.emg,
    biblio: BIBLIO_BASE,
    objetivos: [
      'Leer turns/amplitud en el módulo de aguja como Willison del patrón de interferencia.',
      'Miopático: muchos giros, baja amplitud; neurogénico: pocos giros, alta amplitud.',
    ],
    clinica:
      'En la lección de esfuerzo máximo, T/A objetiva lo que el oído ya oye. No sustituye reclutamiento visual en un curso básico, lo cuantifica.',
    tecnica: [
      'Esfuerzo graduado. Ganancia estable.',
      'No lo use como único dato si el paciente no empuja.',
    ],
    interpretacion:
      'Muchos giros/baja amplitud = miopático. Pocos giros/alta amplitud = neurogénico.',
    errores: [
      'Esfuerzo incompleto leído como miopatía (pocos giros, pero lentos).',
    ],
    perlas: [
      'El oído primero; T/A confirma.',
    ],
    puntos: [
      'Willison en la lección de PI.',
      'Esfuerzo honesto.',
    ],
    objetivosEn: [
      'Use needle-module turns/amplitude as Willison of the interference pattern.',
    ],
    clinicaEn:
      'Many turns + low amplitude = myopathic. Few turns + high amplitude = neurogenic. Poor effort mimics neither cleanly.',
    tecnicaEn:
      'Graded effort, stable gain. Do not T/A a patient who is not pushing.',
    perlasEn: [
      'Ear first, T/A second.',
    ],
    puntosEn: [
      'Interference-pattern lesson.',
      'Honest effort.',
    ],
  }),

  'turns-amplitude::Análisis de Vueltas/Amplitud (Turns/Amplitude)': pack({
    img: IMG.emg,
    biblio: BIBLIO_BASE,
    objetivos: [
      'Aplicar T/A del módulo de QEMG: 20 sitios, umbral de vuelta ≥100 µV, 2+ puntos fuera de límites.',
      'Usarlo en pediatría cuando el esfuerzo máximo prolongado no es posible.',
    ],
    clinica:
      'En estudios especiales, T/A es un protocolo de 20 puntos. Neuropático: puntos por encima; miopático: por debajo. Un 10% fuera de límites importa.',
    tecnica: [
      'Veinte sitios a lo largo del músculo. Vuelta ≥100 µV.',
      '2 o más puntos fuera de la nube normal = significativo.',
    ],
    interpretacion:
      'Protocolo QEMG, no una ojeada al PI de un solo sitio.',
    errores: [
      'Tres sitios y un adjetivo.',
      'Olvidar que los niños no mantienen el máximo.',
    ],
    perlas: [
      'Veinte puntos o no es el método de Stålberg/Willison que cita esta hoja.',
    ],
    puntos: [
      '20 sitios, ≥100 µV.',
      'Útil en pediatría.',
    ],
    objetivosEn: [
      'Run special-studies T/A as a 20-site QEMG protocol with a 100 µV turn.',
    ],
    clinicaEn:
      'Neuropathic points above the cloud; myopathic below. Two of 20 outside is significant. Good when children cannot sustain max effort.',
    tecnicaEn:
      'Twenty sites, turn ≥100 µV, plot vs amplitude.',
    perlasEn: [
      'Three sites are not this method.',
    ],
    puntosEn: [
      '20 sites.',
      'Pediatric-friendly.',
    ],
  }),

  'multi-mup::Multi-MUP analysis (MMA)': pack({
    img: IMG.emg,
    biblio: BIBLIO_BASE,
    objetivos: [
      'Presentar MMA en el módulo de aguja como forma de recoger más PUM en menos tiempo.',
      'No tratarlo como diagnóstico automático.',
    ],
    clinica:
      'MMA descompone el trazado a esfuerzo submáximo. En la lección de aguja sirve para medir duración y amplitud de muchos PUM sin 40 minutos de captura manual.',
    tecnica: [
      'Esfuerzo submáximo estable. Revise a ojo los PUM que el software aceptó.',
      'Descarte artefactos y superposiciones.',
    ],
    interpretacion:
      'La media de duración la firma el médico, no el algoritmo.',
    errores: [
      'Aceptar todos los templates sin mirar.',
    ],
    perlas: [
      'El software propone; usted dispone.',
    ],
    puntos: [
      'Más PUM, menos tiempo.',
      'Revisión visual obligatoria.',
    ],
    objetivosEn: [
      'Use needle-module MMA to collect MUPs faster, then review every template.',
    ],
    clinicaEn:
      'Decomposition at submaximal effort. The physician still owns duration and amplitude.',
    tecnicaEn:
      'Stable submaximal effort. Reject stacked or noisy templates.',
    perlasEn: [
      'Software proposes; you sign.',
    ],
    puntosEn: [
      'Faster MUP capture.',
      'Visual review required.',
    ],
  }),

  'multi-mup::Análisis Multi-MUP (ADEMG)': pack({
    img: IMG.emg,
    biblio: BIBLIO_BASE,
    objetivos: [
      'Usar ADEMG/multi-MUP del módulo de estudios especiales como QEMG formal.',
      'Informar medias y desviaciones contra normas del músculo.',
    ],
    clinica:
      'En QEMG avanzado, ADEMG extrae múltiples PUM del patrón. El informe de estudios especiales debe citar normas de ese músculo y esa edad, no un “parece miopático”.',
    tecnica: [
      'Número mínimo de PUM según el laboratorio (a menudo ≥20).',
      'Compare duración media con la tabla del músculo.',
    ],
    interpretacion:
      'Duración media baja + reclutamiento precoz = miopático cuantificado. Duración alta + reclutamiento reducido = neurogénico cuantificado.',
    errores: [
      'Menos de 10 PUM como “QEMG completo”.',
    ],
    perlas: [
      'Sin normas del músculo, ADEMG es un dibujo.',
    ],
    puntos: [
      'QEMG formal.',
      '≥20 PUM y tabla del músculo.',
    ],
    objetivosEn: [
      'Report ADEMG against muscle-specific norms in the special-studies QEMG chapter.',
    ],
    clinicaEn:
      'Quantified duration and amplitude, not a vibe. Need enough MUPs and a table.',
    tecnicaEn:
      'Aim for ≥20 MUPs. Compare mean duration with that muscle’s reference.',
    perlasEn: [
      'No muscle table, no QEMG.',
    ],
    puntosEn: [
      'Formal QEMG.',
      'Enough MUPs to average.',
    ],
  }),

  'lems-protocol::Protocolo LEMS Clásico (Estimulación a 20-50 Hz)': pack({
    img: IMG.ncs,
    biblio: BIBLIO_BASE,
    objetivos: [
      'Enseñar el tren de 20–50 Hz del módulo de ENR y por qué duele.',
      'Reservarlo a quien no puede hacer ejercicio de 10 s.',
    ],
    clinica:
      'En la lección de RNS, el protocolo clásico de alta frecuencia fuerza calcio presináptico. Incremento >100% confirma. Las guías actuales prefieren ejercicio de 10 s; 50 Hz queda para sedados o UCI.',
    tecnica: [
      'CMAP basal bajo. Luego 20–50 Hz 5–10 s si no hay alternativa.',
      'Calcule ((máximo − basal) / basal) × 100.',
    ],
    interpretacion:
      '>100% = presináptico. 3 Hz solo no distingue MG de LEMS.',
    errores: [
      '50 Hz como primer test en un adulto colaborador.',
      'Diagnosticar LEMS solo con decremento a 3 Hz.',
    ],
    perlas: [
      'El ejercicio de 10 s es el gold estándar; esta hoja es el plan B doloroso.',
    ],
    puntos: [
      '20–50 Hz = reserva.',
      'Incremento >100%.',
    ],
    objetivosEn: [
      'Teach 20–50 Hz RNS as the painful backup when a 10 s exercise test is impossible.',
    ],
    clinicaEn:
      'High-frequency trains raise presynaptic calcium. >100% increment confirms LEMS. Prefer brief exercise in awake adults.',
    tecnicaEn:
      'Low baseline CMAP, then 20–50 Hz only if needed. Report percent increment.',
    perlasEn: [
      '3 Hz decrement is not LEMS.',
      '50 Hz is not first-line in a cooperative adult.',
    ],
    puntosEn: [
      'Backup protocol.',
      '>100% facilitation.',
    ],
  }),

  'lems-protocol::Lambert-Eaton: Diagnóstico y Patrón de Facilitación': pack({
    img: IMG.ncs,
    biblio: BIBLIO_BASE,
    objetivos: [
      'Cerrar el diagnóstico de LEMS en la hoja de criterios: tríada CMAP bajo, decremento 3 Hz, facilitación >100%.',
      'Obligar screening oncológico en el informe.',
    ],
    clinica:
      'En criterios diagnósticos, LEMS no es “un tren de 50 Hz”. Es CMAP bajo difuso, decremento lento y facilitación post-ejercicio >100%, anti-VGCC y TAC de tórax. El 50–60% se asocia a cáncer de células pequeñas.',
    tecnica: [
      'Ejercicio 10–15 s como primera facilitación. 50 Hz solo si no colabora.',
      'Escriba en el informe la necesidad de imagen torácica.',
    ],
    interpretacion:
      '<100% no cierra LEMS. >100% casi lo hace si el CMAP basal era bajo.',
    errores: [
      'Olvidar el cáncer en el plan.',
      'Tratarlo como MG porque hubo decremento a 3 Hz.',
    ],
    perlas: [
      'LEMS es MG al revés: el CMAP basal ya está bajo y mejora.',
      'El informe sin TAC es un informe a medias.',
    ],
    puntos: [
      'Tríada + VGCC + tórax.',
      'Facilitación >100%.',
    ],
    objetivosEn: [
      'Use the criteria-module LEMS triad and mandate chest imaging, not a 50 Hz-first protocol.',
    ],
    clinicaEn:
      'Low CMAPs, 3 Hz decrement, >100% post-exercise facilitation, VGCC antibodies, small-cell screen.',
    tecnicaEn:
      '10–15 s exercise first. Write the oncology plan in the report.',
    perlasEn: [
      'LEMS is MG backwards.',
      'No chest imaging, incomplete report.',
    ],
    puntosEn: [
      'Triad + VGCC + chest.',
      '>100% facilitation.',
    ],
  }),

  'axonal-vs-demyelinating::Patrón axonal vs. desmielinizante': pack({
    img: IMG.ncs,
    biblio: BIBLIO_NCS,
    objetivos: [
      'En conducción, leer axonal vs desmielinizante como patrón de un nervio: amplitud vs tiempo/bloqueo.',
      'Exigir temperatura y meseta antes del adjetivo.',
    ],
    clinica:
      'En el módulo 2 el contraste es técnico: CMAP bajo con VCM conservada vs latencia/VCM/dispersión/bloqueo. Un nervio, una mesa, un error de frío lo echa a perder.',
    tecnica: [
      'Tabule latencia, amplitud, duración y velocidad distal y proximal.',
      'Caliente. Alcance meseta. Descarte Martin-Gruber antes de bloqueo cubital.',
    ],
    interpretacion:
      'Un parámetro no es un mecanismo. El patrón del nervio sí.',
    errores: [
      'Desmielinizante a 28 °C.',
      'Axonal con estímulo submáximo.',
    ],
    perlas: [
      'Amplitud cuenta axones; el reloj cuenta mielina.',
    ],
    puntos: [
      'Patrón por nervio.',
      'Técnica antes que adjetivo.',
    ],
    objetivosEn: [
      'Read axonal vs demyelinating as an NCS pattern on one nerve, after temperature and plateau.',
    ],
    clinicaEn:
      'Low amplitude, spared CV = axonal. Latency, slowing, dispersion, block = demyelinating. Cold fakes the latter.',
    tecnicaEn:
      'Table distal and proximal values. Warm. Plateau. Martin-Gruber before ulnar block.',
    perlasEn: [
      'Amplitude counts axons; timing counts myelin.',
    ],
    puntosEn: [
      'One-nerve pattern.',
      'Setup before the adjective.',
    ],
  }),

  'axonal-vs-demyelinating::Clasificación Electrodiagnóstica: Axonal vs. Desmielinizante': pack({
    img: IMG.ncs,
    biblio: BIBLIO_NCS,
    objetivos: [
      'Clasificar la polineuropatía entera (módulo de patologías), no un solo mediano.',
      'Pedir varios nervios y tiempo de evolución.',
    ],
    clinica:
      'En patologías, axonal vs desmielinizante decide CIDP vs axonopatía tóxica vs CMT. Hace falta un mapa de nervios, no un cubital en codo. El bloqueo y la dispersión en varios nervios empujan a adquirido; la simetría de décadas, a hereditario.',
    tecnica: [
      'Al menos dos motores y dos sensitivos en dos extremidades.',
      'Aplique criterios de desmielinización al conjunto (EAN/PNS), no a un atrapamiento.',
    ],
    interpretacion:
      'Un STC no clasifica la polineuropatía. Un nervio lento en un sitio de túnel tampoco.',
    errores: [
      'CIDP por un mediano de muñeca.',
      'Axonal “simétrico” sin haber estudiado el otro lado.',
    ],
    perlas: [
      'La clasificación es del enfermo, no del nervio huérfano.',
    ],
    puntos: [
      'Varios nervios + tiempo.',
      'Túneles no cuentan como CIDP.',
    ],
    objetivosEn: [
      'Classify the whole polyneuropathy in the pathology module, not a single entrapment.',
    ],
    clinicaEn:
      'Need a nerve map and a timeline. Multifocal block/dispersion = acquired. Decade-long symmetry = hereditary until proven otherwise.',
    tecnicaEn:
      'Two motor and two sensory nerves, two limbs. Apply EAN/PNS to the set, not to a wrist.',
    perlasEn: [
      'Classify the patient, not the orphan nerve.',
    ],
    puntosEn: [
      'Several nerves plus time.',
      'CTS is not CIDP.',
    ],
  }),

  'cidp-variants::Variantes Clínicas de CIDP': pack({
    img: IMG.ncs,
    biblio: BIBLIO_NCS,
    objetivos: [
      'Describir las variantes clínicas del módulo de patologías (típica, multifocal, distal, motora, sensitiva).',
      'No exigir aún el checklist formal de la guía 2021 (eso es el módulo 10).',
    ],
    clinica:
      'En patologías se reconocen fenotipos: simétrica sensorimotora, MADSAM/Lewis-Sumner, distal, motora pura, sensitiva. El laboratorio muestra desmielinización adquirida en el mapa que toca. MAG, POEMS y CMT se mencionan como imitadores clínicos.',
    tecnica: [
      'Extienda NCS al territorio de la variante (radial/musculocutáneo en multifocal).',
      'Busque bloqueo y dispersión, no un único túnel.',
    ],
    interpretacion:
      'El fenotipo guía el mapa de nervios. El sello formal EAN/PNS se detalla en criterios.',
    errores: [
      'Llamar CIDP típica a un Lewis-Sumner y tratarlo igual sin más.',
    ],
    perlas: [
      'La variante cambia el mapa, no solo el nombre.',
    ],
    puntos: [
      'Fenotipos clínicos.',
      'Mapa según la variante.',
    ],
    objetivosEn: [
      'Name clinical CIDP phenotypes in the pathology module; leave the 2021 checklist to criteria.',
    ],
    clinicaEn:
      'Typical, multifocal, distal, motor, sensory. Map nerves to the phenotype. MAG/POEMS/CMT are mimics.',
    tecnicaEn:
      'Add radial/musculocutaneous in multifocal forms. Look for acquired demyelination, not a single tunnel.',
    perlasEn: [
      'The variant changes the map.',
    ],
    puntosEn: [
      'Clinical phenotypes.',
      'Nerve map follows the variant.',
    ],
  }),

  'cidp-variants::Variantes de CIDP Formalmente Definidas': pack({
    img: IMG.ncs,
    biblio: BIBLIO_NCS,
    objetivos: [
      'Aplicar las 5 variantes atípicas de EAN/PNS 2021 en el módulo de criterios.',
      'Decir qué se cumple y qué falta, sin forzar CIDP.',
    ],
    clinica:
      'La guía 2021 define variantes con requisitos electrodiagnósticos y terapéuticos propios. El informe de criterios lista ítems, no adjetivos. MAG, POEMS y CMT quedan fuera si los biomarcadores lo dicen.',
    tecnica: [
      'Use el checklist de la guía vigente al enseñar.',
      'Documente número de nervios con desmielinización y si hay bloqueo.',
    ],
    interpretacion:
      '“CIDP probable” sin ítems es una frase vacía. Liste criterios.',
    errores: [
      'Forzar típica cuando la guía pide variante.',
      'IVIG por un imitador MAG.',
    ],
    perlas: [
      'Si no puede marcar la casilla, no la invente.',
    ],
    puntos: [
      'EAN/PNS 2021.',
      'Ítems, no adjetivos.',
    ],
    objetivosEn: [
      'Apply EAN/PNS 2021 atypical CIDP variants as a checklist, not a vibe.',
    ],
    clinicaEn:
      'Five defined variants. Report which items are met. MAG/POEMS/CMT out if biomarkers say so.',
    tecnicaEn:
      'Count nerves with demyelination and block. Cite the guideline year.',
    perlasEn: [
      'No checkbox, no diagnosis.',
    ],
    puntosEn: [
      'EAN/PNS 2021.',
      'Items, not adjectives.',
    ],
  }),
};

/**
 * Mismo título en dos módulos (STC y túnel tarsiano).
 * Clave: moduleId::topicId — no se toca el slug.
 */
export const DUPLICATE_BY_MODULE: Record<string, LessonExpansion> = {
  'topographic-anatomy::carpal-tunnel': pack({
    img: IMG.ncs,
    biblio: BIBLIO_NCS,
    objetivos: [
      'En anatomía: montajes comparativos (anillo 4, palma-muñeca) y puntos de 8 cm.',
      'Clasificar severidad EDX para decidir si el nervio aún conduce a través del retináculo.',
    ],
    clinica:
      'Esta hoja es el mapa del mediano en muñeca: distancias, anillo 4 (>0.4 ms), palma, LMD de APB. El módulo de patologías cuenta prevalencia y decisión quirúrgica; aquí se mide.',
    tecnica: [
      '8 cm a APB. Anillo 4 mediano vs cubital. Palma si el SNAP de dedo faltó.',
      'Temperatura ≥32 °C. No opere una mano fría.',
    ],
    interpretacion:
      'Leve = solo sensitivo. Moderado = motora + sensitiva. Severo = SNAP ausente ± denervación en APB.',
    errores: [
      'STC por LMD sola a 28 °C.',
      'No hacer palma cuando el SNAP digital está ausente.',
    ],
    perlas: [
      'El anillo 4 cancela distancia y temperatura entre nervios.',
      'Palma salva un SNAP “ausente”.',
    ],
    puntos: [
      'Montajes y cortes.',
      'Severidad por SNAP, LMD y aguja de APB.',
    ],
    objetivosEn: [
      'Teach CTS as median-at-the-wrist montages and cutoffs in the anatomy atlas.',
    ],
    clinicaEn:
      'Ring-finger comparison >0.4 ms, palm, 8 cm motor to APB. Pathology module covers prevalence; this page measures.',
    tecnicaEn:
      'Warm hand. Ring 4. Palm if digit SNAP is gone. 8 cm to APB.',
    perlasEn: [
      'Ring 4 cancels distance and temperature.',
      'Palm can resurrect an “absent” SNAP.',
    ],
    puntosEn: [
      'Montages and cutoffs.',
      'Severity = SNAP + DL + APB needle.',
    ],
  }),

  'pathologies::carpal-tunnel': pack({
    img: IMG.ncs,
    biblio: BIBLIO_NCS,
    objetivos: [
      'En patologías: enmarcar el STC como el atrapamiento más frecuente (3–5%) y cómo cambia la conducta.',
      'No repetir aquí todo el atlas de montajes; usarlos para decidir conservador vs cirugía.',
    ],
    clinica:
      'Prevalencia 3–5%. El EDX localiza el retináculo, estima axonotmesis (APB) y evita operar un C6 o un cubital. Los hijos de esta hoja (comparativos, lumbrical-interóseo) son el detalle; el padre es la decisión clínica.',
    tecnica: [
      'Protocolo mínimo: mediano y cubital, un comparativo, APB si hay duda de severidad.',
      'Si el 5.º dedo entra en la historia, el cubital de codo es obligatorio.',
    ],
    interpretacion:
      'STC electrodiagnóstico + clínica nocturna de mediano = tratar. SNAP ausente + fibrilaciones en APB = informar axonotmesis al cirujano.',
    errores: [
      'Operar por una latencia aislada sin clínica.',
      'Ignorar el cubital porque “ya salió el mediano”.',
    ],
    perlas: [
      'El más frecuente no es el único.',
      'El cirujano quiere saber si el axón sigue vivo.',
    ],
    puntos: [
      'Epidemiología y conducta.',
      'Comparativos viven en los subtemas.',
    ],
    objetivosEn: [
      'Frame CTS as the common entrapment that changes management in the pathology module.',
    ],
    clinicaEn:
      '3–5% prevalence. EDX localizes the retinaculum and tells the surgeon if axons remain. Child topics hold the comparison tests.',
    tecnicaEn:
      'Median plus ulnar, one comparison, APB if severity is the question. Add elbow ulnar if digit 5 is in the history.',
    perlasEn: [
      'Most common is not the only one.',
      'Surgeons want axon viability.',
    ],
    puntosEn: [
      'Epidemiology and action.',
      'Details sit in child topics.',
    ],
  }),

  'topographic-anatomy::tarsal-tunnel': pack({
    img: IMG.ncs,
    biblio: BIBLIO_NCS,
    objetivos: [
      'Mapear tibial posterior bajo el retináculo medial: plantares y calcáneo.',
      'Medir latencias a abductor del hallux y abductor del quinto, lado a lado.',
    ],
    clinica:
      'En anatomía el túnel tarsiano es un trayecto: maléolo medial, retináculo, ramas. Es raro frente al STC. Un SNAP plantar técnicamente difícil no equivale a un anillo 4 de mano.',
    tecnica: [
      'Estimule proximal al retináculo; registre AH y ADQ si el laboratorio los tiene.',
      'Compare el lado sano. Temperatura del pie. No confunda con S1 (H-reflex, sóleo).',
    ],
    interpretacion:
      'Asimetría de latencia plantar + aguja en AH/ADQ con sóleo sano apunta a túnel, no a S1.',
    errores: [
      'Llamar túnel tarsiano a un H ausente.',
      'Un pie frío con latencias largas.',
    ],
    perlas: [
      'El sóleo no pasa por el túnel tarsiano.',
      'Lado a lado, no un corte de libro de mano.',
    ],
    puntos: [
      'Anatomía del retináculo medial.',
      'Plantares vs S1.',
    ],
    objetivosEn: [
      'Map tibial nerve under the flexor retinaculum and compare plantar latencies side to side.',
    ],
    clinicaEn:
      'Rare vs CTS. Plantar SNAPs are hard. Soleus and H-reflex are S1, not tarsal tunnel.',
    tecnicaEn:
      'Stimulate proximal to the retinaculum, record AH/ADQ, warm the foot, compare sides.',
    perlasEn: [
      'Soleus does not travel through tarsal tunnel.',
      'Side-to-side, not a hand cutoff.',
    ],
    puntosEn: [
      'Medial retinaculum anatomy.',
      'Plantars vs S1.',
    ],
  }),

  'pathologies::tarsal-tunnel': pack({
    img: IMG.ncs,
    biblio: BIBLIO_NCS,
    objetivos: [
      'Tratar el túnel tarsiano patológico como diagnóstico de exclusión: más imitadores que casos.',
      'Separarlo de polineuropatía, S1 y fascículos plantares distales.',
    ],
    clinica:
      'En patologías, el túnel tarsiano se pide de más y se confirma de menos. Dolor medial de tobillo + asimetría plantar + aguja focal, con sural y H conservados, es el núcleo. Un diabético con dos plantares ausentes no es un túnel.',
    tecnica: [
      'Sural, peroneo superficial, H, plantares, AH/ADQ y paraespinales S1 si hay duda.',
      'Si todo el pie está axonal, no cierre túnel.',
    ],
    interpretacion:
      'Focal al retináculo = túnel. Simétrico y distal = polineuropatía. Sóleo y paraespinales = S1.',
    errores: [
      'Operar un tobillo por dos plantares ausentes en una axonopatía larga.',
    ],
    perlas: [
      'El diagnóstico más frecuente de “túnel tarsiano” es otro.',
    ],
    puntos: [
      'Exclusión de S1 y de polineuropatía.',
      'Focal o no es túnel.',
    ],
    objetivosEn: [
      'Treat pathologic tarsal tunnel as an exclusion diagnosis against S1 and polyneuropathy.',
    ],
    clinicaEn:
      'Over-requested, under-confirmed. Need focal medial-ankle findings. Bilateral absent plantars in diabetes are not a tunnel.',
    tecnicaEn:
      'Sural, H-reflex, plantars, AH/ADQ, S1 paraspinals if needed. If the whole foot is axonal, stop.',
    perlasEn: [
      'The most common “tarsal tunnel” is something else.',
    ],
    puntosEn: [
      'Exclude S1 and polyneuropathy.',
      'Focal or it is not a tunnel.',
    ],
  }),
};
