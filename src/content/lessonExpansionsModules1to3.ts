import type { LessonExpansion } from './lessonExpansions';

export const IMG = {
  myelin: {
    src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/17/Neuron_Hand-tuned.svg/640px-Neuron_Hand-tuned.svg.png',
    alt: 'Neurona y vaina de mielina (Wikimedia Commons)',
    caption: 'Arquitectura neuronal. Fuente: Wikimedia Commons.',
  },
  action: {
    src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4a/Action_potential.svg/640px-Action_potential.svg.png',
    alt: 'Potencial de acción (Wikimedia Commons)',
    caption: 'Potencial de acción. Fuente: Wikimedia Commons.',
  },
  ncs: {
    src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6e/Nerve_conduction_study.jpg/640px-Nerve_conduction_study.jpg',
    alt: 'Estudio de neuroconducción (Wikimedia Commons)',
    caption: 'Montaje de neuroconducción. Fuente: Wikimedia Commons.',
  },
  emg: {
    src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/80/EMG_principle.gif/320px-EMG_principle.gif',
    alt: 'Principio de registro EMG (Wikimedia Commons)',
    caption: 'Registro EMG. Fuente: Wikimedia Commons.',
  },
};

export const BIBLIO_BASE = `- Preston DC, Shapiro BE. Electromyography and Neuromuscular Disorders. Elsevier; 2021.
- Kimura J. Electrodiagnosis in Diseases of Nerve and Muscle. Oxford University Press; 2013.`;

export const BIBLIO_NCS = `${BIBLIO_BASE}
- Chen S et al. Electrodiagnostic reference values for upper and lower limb nerve conduction studies. Muscle Nerve. 2016. https://doi.org/10.1002/mus.25203`;

export function pack(args: {
  objetivos: string[];
  clinica: string;
  tecnica: string[];
  interpretacion: string;
  errores: string[];
  perlas: string[];
  puntos: string[];
  objetivosEn: string[];
  clinicaEn: string;
  tecnicaEn: string;
  perlasEn: string[];
  puntosEn: string[];
  img: (typeof IMG)[keyof typeof IMG];
  biblio?: string;
}): LessonExpansion {
  const biblio = args.biblio ?? BIBLIO_BASE;
  return {
    content: `## Objetivos
${args.objetivos.map((o) => `- ${o}`).join('\n')}

## Explicación clínica
${args.clinica}

## Técnica
${args.tecnica.map((t, i) => `${i + 1}. ${t}`).join('\n')}

## Interpretación
${args.interpretacion}

## Errores frecuentes
${args.errores.map((e) => `- ${e}`).join('\n')}

## Perlas
${args.perlas.map((p) => `- ${p}`).join('\n')}

## Puntos clave
${args.puntos.map((p) => `- ${p}`).join('\n')}

## Bibliografía
${biblio}`,
    contentEn: `## Objectives
${args.objetivosEn.map((o) => `- ${o}`).join('\n')}

## Clinical explanation
${args.clinicaEn}

## Technique
${args.tecnicaEn}

## Key points
${args.puntosEn.map((p) => `- ${p}`).join('\n')}`,
    clinicalPearls: args.perlas,
    clinicalPearlsEn: args.perlasEn,
    keyPoints: args.puntos,
    keyPointsEn: args.puntosEn,
    imageUrls: [args.img],
  };
}

/** Reescrituras de módulos 1–3. Las claves coinciden con topic.id existentes. */
export const MODULES_1_TO_3_EXPANSIONS: Record<string, LessonExpansion> = {
  'axonal-membrane': pack({
    img: IMG.myelin,
    objetivos: [
      'Localizar canales de Na+ nodales y de K+ yuxtaparanodales en la membrana axonal.',
      'Relacionar el umbral de despolarización con la generación del CMAP en NCS.',
    ],
    clinica:
      'La membrana axonal depende de canales de Na+ voltaje-dependientes agrupados en el nódulo y de K+ yuxtaparanodales. El potencial de reposo (−70 a −90 mV) lo mantiene la bomba Na+/K+-ATPasa. En NCS, la despolarización catódica abre Na+ y genera el potencial de acción compuesto.',
    tecnica: [
      'Oriente el cátodo hacia el registro; el ánodo proximal evita bloqueo anódico.',
      'Alcance meseta supramáxima para reclutar todos los axones excitables, no solo los de umbral bajo.',
      'Si la amplitud es inesperadamente baja, revise polaridad e impedancia antes de concluir pérdida axonal.',
    ],
    interpretacion:
      'Un CMAP reducido con velocidades conservadas apunta a menos axones excitables, no a mielina. Un único parámetro no cierra la topografía.',
    errores: [
      'Atribuir un CMAP bajo a axonopatía sin confirmar estímulo supramáximo.',
      'Invertir cátodo/ánodo y llamar “bloqueo” a un CMAP pequeño.',
    ],
    perlas: [
      'El cátodo abre Na+; el ánodo los cierra. Polaridad primero, diagnóstico después.',
      'Los canales nodales explican por qué un estímulo breve recluta fibras mielínicas.',
    ],
    puntos: [
      'Na+ nodal inicia el potencial; K+ yuxtaparanodal repolariza.',
      'El CMAP suma axones despolarizados, no “la mielina”.',
    ],
    objetivosEn: [
      'Map nodal Na+ and juxtaparanodal K+ channels to CMAP generation.',
      'Treat polarity and supramaximal stimulation as membrane physiology, not extras.',
    ],
    clinicaEn:
      'Nodal voltage-gated Na+ channels start the compound action potential; juxtaparanodal K+ channels repolarize. Submaximal stimulation samples only low-threshold axons and mimics axonal loss.',
    tecnicaEn:
      'Cathode toward the recording electrodes, anode proximal, and a true supramaximal plateau before calling low amplitude axonal.',
    perlasEn: [
      'Cathode opens Na+ channels; anode can block them.',
      'A small CMAP is technical until the membrane has been fully depolarized.',
    ],
    puntosEn: [
      'CMAP amplitude counts depolarized axons.',
      'Polarity errors mimic axonal loss.',
    ],
  }),

  'myelin-sheath': pack({
    img: IMG.myelin,
    objetivos: [
      'Explicar cómo la mielina internodal reduce capacitancia y permite conducción saltatoria.',
      'Distinguir desmielinización focal (latencia, bloqueo, dispersión) de pérdida axonal.',
    ],
    clinica:
      'Cada célula de Schwann mieliniza un internodo. La mielina reduce capacitancia y aumenta resistencia transmembrana, de modo que la corriente salta de nódulo a nódulo. La desmielinización focal prolonga latencia y puede bloquear el CMAP sin denervación inmediata.',
    tecnica: [
      'Mida distancia con cinta, no a ojo: un error de 1 cm cambia la velocidad ~5%.',
      'Compare segmento distal y proximal del mismo nervio; el bloqueo es una caída de amplitud proximal con duración relativamente conservada.',
      'Caliente la extremidad a 32–34 °C: el frío imita desmielinización.',
    ],
    interpretacion:
      'Velocidad <70% del límite inferior, latencia distal >130% o bloqueo de conducción apoyan desmielinización. Las fibrilaciones no aparecen por mielina sola.',
    errores: [
      'Diagnosticar desmielinización en una mano fría.',
      'Llamar bloqueo a una caída de amplitud por co-estimulación o medición de distancia incorrecta.',
    ],
    perlas: [
      'La mielina cambia tiempo (latencia/velocidad); el axón cambia cantidad (amplitud).',
      'Un CMAP distal normal con proximal pequeño pide bloqueo, no “neuropatía axonal”.',
    ],
    puntos: [
      'Un internodo = una Schwann.',
      'Desmielinización: latencia, velocidad, dispersión o bloqueo, no fibrilaciones inmediatas.',
    ],
    objetivosEn: [
      'Link internodal myelin to saltatory conduction and NCS timing.',
      'Separate demyelinating from axonal signatures.',
    ],
    clinicaEn:
      'Schwann cells form internodal myelin that enables saltatory conduction. Focal demyelination prolongs latency and may block the CMAP without immediate denervation.',
    tecnicaEn:
      'Measure distance accurately, compare distal vs proximal amplitude, and warm the limb before calling demyelination.',
    perlasEn: [
      'Myelin changes timing; axon changes quantity.',
      'Cold limbs mimic demyelination.',
    ],
    puntosEn: [
      'Block is a proximal amplitude drop with relatively preserved duration.',
      'Fibrillations are not an acute myelin finding.',
    ],
    biblio: BIBLIO_NCS,
  }),

  'nodes-saltatory': pack({
    img: IMG.myelin,
    objetivos: [
      'Relacionar Nav1.6 nodal con la conducción saltatoria y las velocidades mielínicas.',
      'Reconocer el bloqueo nodal (p. ej. anti-GM1) frente a desmielinización internodal.',
    ],
    clinica:
      'El nódulo de Ranvier concentra Nav1.6. La conducción saltatoria explica VCM > 40 m/s en fibras mielínicas. El bloqueo nodal (anti-GM1) cae amplitud proximal con duración relativamente conservada, distinto de la dispersión temporal internodal.',
    tecnica: [
      'En sospecha de MMN o GBS motor, compare CMAP distal y proximal en el mismo nervio.',
      'Mida duración del negativo: bloqueo nodal suele conservar duración; la desmielinización internodal la alarga.',
      'No use un solo sitio de estímulo para afirmar bloqueo.',
    ],
    interpretacion:
      'Caída de amplitud proximal >50% con duración <130% sugiere bloqueo de conducción. Dispersión marcada apunta a internodo, no solo a nódulo.',
    errores: [
      'Llamar bloqueo a Martin-Gruber en cubital a través del codo.',
      'Olvidar que el frío y la distancia errónea también caen “velocidad”.',
    ],
    perlas: [
      'El nódulo es el interruptor de Na+; el internodo es el cable aislado.',
      'Anti-GM1 lesiona nódulo: amplitud cae, duración se sostiene.',
    ],
    puntos: [
      'Nav1.6 nodal inicia cada salto.',
      'Bloqueo vs dispersión se lee en amplitud y duración, no solo en velocidad.',
    ],
    objetivosEn: [
      'Tie Nav1.6 clustering to saltatory conduction.',
      'Contrast nodal block with internodal dispersion.',
    ],
    clinicaEn:
      'Nodes concentrate Nav1.6. Nodal block drops proximal amplitude with relatively preserved duration; internodal demyelination adds temporal dispersion.',
    tecnicaEn:
      'Compare distal and proximal CMAP amplitude and negative-peak duration on the same nerve before labeling block.',
    perlasEn: [
      'The node is the Na+ switch; the internodal myelin is insulation.',
      'Anti-GM1 is a nodal story.',
    ],
    puntosEn: [
      'Saltatory conduction explains myelinated CV > 40 m/s.',
      'Duration separates block from dispersion.',
    ],
    biblio: BIBLIO_NCS,
  }),

  'wallerian-degeneration': pack({
    img: IMG.myelin,
    objetivos: [
      'Ubicar en el tiempo la caída del CMAP distal y las fibrilaciones tras axonotmesis.',
      'Evitar llamar “nervio indemne” a un estudio de las primeras 72 h.',
    ],
    clinica:
      'Tras axonotmesis, la degeneración walleriana distal se completa en 7–10 días. El CMAP distal cae entonces; las fibrilaciones aparecen hacia el día 14–21. En las primeras 72 h el segmento distal aún conduce y el estudio puede parecer normal.',
    tecnica: [
      'Fecha el momento de la lesión en la historia: el reloj electrofisiológico parte de ahí.',
      'En lesión aguda, estimule distal y proximal al sitio sospechoso en serie (días 1, 7–10, 21).',
      'Reserve la aguja para cuando espere actividad espontánea (semana 2–3), no el día 1.',
    ],
    interpretacion:
      'CMAP distal presente el día 2 no excluye neurotmesis. CMAP distal ausente a los 10 días indica que el axón distal ya degeneró.',
    errores: [
      'Dar pronóstico de continuidad axonal con un único estudio de las primeras 48 h.',
      'Buscar fibrilaciones el día 3 y concluir que no hay denervación.',
    ],
    perlas: [
      'El reloj walleriano es de días, no de horas.',
      'La aguja llega tarde a propósito: las fibrilaciones necesitan membrana muscular inestable.',
    ],
    puntos: [
      'CMAP distal cae hacia el día 7–10.',
      'Fibrilaciones: día 14–21, más tarde en músculos proximales.',
    ],
    objetivosEn: [
      'Time Wallerian CMAP loss and fibrillation onset after axonotmesis.',
      'Do not call a nerve intact in the first 72 hours.',
    ],
    clinicaEn:
      'Distal Wallerian degeneration completes in 7–10 days. Distal CMAP then falls; fibrillations appear around days 14–21. The first 72 hours can look normal.',
    tecnicaEn:
      'Date the injury, stimulate distal and proximal in series, and delay needle EMG until week 2–3 if the question is denervation.',
    perlasEn: [
      'The Wallerian clock is days, not hours.',
      'Absent fibrillations on day 3 prove nothing.',
    ],
    puntosEn: [
      'Distal CMAP falls by days 7–10.',
      'Fibrillations follow in weeks 2–3.',
    ],
  }),

  'fiber-types': pack({
    img: IMG.myelin,
    objetivos: [
      'Asignar Aα/Aβ al CMAP y SNAP convencionales, y Aδ/C a lo que la NCS no registra.',
      'Indicar cuándo pedir umbrales térmicos o QST en vez de repetir NCS.',
    ],
    clinica:
      'Aα (motoras/propioceptivas) y Aβ (tacto) dominan CMAP/SNAP. Aδ y C no se registran en NCS de superficie. La neuropatía de fibra pequeña duele y quema con SNAP normal; requiere umbrales térmicos, QST o biopsia de piel, no “otra velocidad”.',
    tecnica: [
      'Si el SNAP sural y mediano es normal y el síntoma es quemante, no persiga más nervios sensitivos gruesos.',
      'Documente que el estudio evalúa fibras mielínicas gruesas.',
      'Reserve NCS autonómica o QST para fibra pequeña, no el protocolo de túnel carpiano.',
    ],
    interpretacion:
      'NCS normal no contradice neuropatía de fibra pequeña. NCS anormal habla de Aα/Aβ, no de dolor nociceptivo.',
    errores: [
      'Repetir NCS “hasta que salga” en disestesias con SNAP nítido.',
      'Atribuir dolor quemante a un túnel carpiano con latencias normales.',
    ],
    perlas: [
      'Lo que no mieliniza grueso, no lo ve la NCS de rutina.',
      'El informe debe decir qué fibras estudió.',
    ],
    puntos: [
      'CMAP/SNAP = Aα y Aβ.',
      'Fibra pequeña: otro laboratorio, no más estímulos.',
    ],
    objetivosEn: [
      'Map Aα/Aβ to routine NCS and Aδ/C to what NCS cannot see.',
      'Stop repeating NCS for small-fiber pain.',
    ],
    clinicaEn:
      'Routine CMAP/SNAP sample large myelinated Aα/Aβ fibers. Small-fiber neuropathy needs QST or skin biopsy, not another SNAP.',
    tecnicaEn:
      'If large-fiber SNAPs are normal and pain is burning, document the fiber class studied and do not chase more sensory nerves.',
    perlasEn: [
      'Routine NCS does not see unmyelinated nociceptors.',
      'The report should name the fiber classes tested.',
    ],
    puntosEn: [
      'Aα/Aβ = CMAP/SNAP.',
      'Small fiber is a different test.',
    ],
  }),

  'endo-peri-epineurium': pack({
    img: IMG.myelin,
    objetivos: [
      'Relacionar endoneuro, perineuro y epineuro con los grados de Sunderland.',
      'Explicar por qué un CMAP de superficie puede pasar por alto un fascículo crítico.',
    ],
    clinica:
      'El perineuro es la barrera hemato-neural. Sunderland I–II respetan el tubo endoneural; III–V implican discontinuidad fascicular. El registro de superficie promedia fascículos: un fascículo motor crítico puede estar seccionado con CMAP aún presente.',
    tecnica: [
      'En trauma, no use un único CMAP de superficie como “continuidad completa”.',
      'Correlacione con exploración motora de músculos de un solo fascículo cuando exista.',
      'La aguja en un músculo distal dice más de un fascículo que un electrodo de superficie amplio.',
    ],
    interpretacion:
      'CMAP presente ≠ todos los fascículos intactos. CMAP ausente a las 10 días sí habla de pérdida axonal masiva distal.',
    errores: [
      'Equivaler neuropraxia (Sunderland I) con neurotmesis porque el paciente no mueve el día 1.',
      'Olvidar que el epineuro puede estar continuo y el fascículo no.',
    ],
    perlas: [
      'El perineuro es la barrera; el endoneuro es el riel de regeneración.',
      'Superficie promedia; la aguja muestrea un territorio pequeño.',
    ],
    puntos: [
      'Sunderland se lee en capas, no en un solo CMAP.',
      'Un fascículo crítico puede desaparecer dentro de un potencial compuesto.',
    ],
    objetivosEn: [
      'Map nerve coats to Sunderland grades.',
      'Treat surface CMAP as a fascicle average.',
    ],
    clinicaEn:
      'Perineurium is the blood–nerve barrier. Sunderland III–V disrupt fascicles. Surface recording averages fascicles and can miss a critical motor bundle.',
    tecnicaEn:
      'In trauma, combine CMAP with muscle-specific needle sampling; do not call full continuity from one surface potential.',
    perlasEn: [
      'Perineurium is the barrier; endoneurial tubes guide regeneration.',
      'Surface averages; the needle samples a small territory.',
    ],
    puntosEn: [
      'Present CMAP ≠ every fascicle intact.',
      'Sunderland is anatomy of layers.',
    ],
  }),

  'motor-unit-composition': pack({
    img: IMG.emg,
    objetivos: [
      'Definir la unidad motora como motoneurona α + axón + UNM + fibras musculares.',
      'Relacionar esa anatomía con lo que registra la aguja concéntrica.',
    ],
    clinica:
      'La unidad motora es la unidad que la EMG estudia: una motoneurona del asta anterior, su axón, la unión neuromuscular y las fibras que inerva. Lesión en cualquier eslabón cambia el PUM o el reclutamiento, pero no del mismo modo.',
    tecnica: [
      'Muestre varios sitios: un inserto ve ~15–20 fibras, no toda la unidad.',
      'Separe actividad de inserción, reposo y esfuerzo voluntario; cada fase pregunta por un eslabón distinto.',
      'No concluya “miopatía” o “neurogeno” con un solo PUM.',
    ],
    interpretacion:
      'PUM grande y reclutamiento reducido: menos axones, unidades reinnervadas. PUM breve y reclutamiento precoz: menos fibras por unidad (miopatía o UNM grave).',
    errores: [
      'Tratar la unidad motora como “el músculo entero”.',
      'Diagnosticar con un solo sitio de aguja.',
    ],
    perlas: [
      'La EMG no ve la motoneurona; ve el territorio que aún dispara.',
      'Cuatro eslabones, cuatro formas de romper el PUM.',
    ],
    puntos: [
      'Unidad motora = cuatro eslabones en serie.',
      'Un inserto es una muestra, no el censo.',
    ],
    objetivosEn: [
      'Define the motor unit as neuron, axon, NMJ, and muscle fibers.',
      'Sample several sites before labeling the unit.',
    ],
    clinicaEn:
      'EMG studies the motor unit. Injury at neuron, axon, NMJ, or muscle changes the MUP or recruitment in different ways.',
    tecnicaEn:
      'Insert, rest, and voluntary effort are separate questions. Several sites beat one giant MUP.',
    perlasEn: [
      'EMG sees the firing territory, not the cell body.',
      'Four links, four ways to break the MUP.',
    ],
    puntosEn: [
      'One insertion samples ~15–20 fibers.',
      'Do not diagnose from a single MUP.',
    ],
  }),

  'innervation-ratio': pack({
    img: IMG.emg,
    objetivos: [
      'Contrastar ratios bajos (oculares, intrínsecos) con ratios altos (gastrocnemio).',
      'Explicar por qué la reinnervación colateral agranda el PUM crónico.',
    ],
    clinica:
      'El ratio (fibras/motoneurona) es bajo en músculos de control fino y alto en músculos de fuerza. La reinnervación colateral aumenta el territorio y la amplitud del PUM crónico; un intrínseco de la mano “gigante” pesa distinto que un sóleo grande.',
    tecnica: [
      'Compare amplitud de PUM con el músculo esperado: APB y FDI no deberían verse como gastrocnemio.',
      'En crónico, busque PUM altos y reclutamiento reducido, no solo “amplitud alta”.',
      'No use un umbral único de µV para todos los músculos.',
    ],
    interpretacion:
      'PUM de 8 mV en FDI es reinnervación grosera; el mismo número en gastrocnemio es menos extremo. El ratio basal cambia la escala.',
    errores: [
      'Aplicar normas de PUM de bíceps a un músculo ocular o a un intrínseco.',
      'Llamar miopatía a un músculo de ratio bajo con PUM naturalmente pequeños.',
    ],
    perlas: [
      'El tamaño del PUM se lee contra el ratio de ese músculo.',
      'La reinnervación compra fuerza y vende finura.',
    ],
    puntos: [
      'Ratio bajo = control fino, PUM más pequeños.',
      'Reinnervación colateral agranda el territorio.',
    ],
    objetivosEn: [
      'Scale MUP amplitude to the muscle’s innervation ratio.',
      'Read chronic reinnervation as a larger territory, not a bigger neuron.',
    ],
    clinicaEn:
      'Fine-control muscles have low innervation ratios; power muscles have high ratios. Collateral reinnervation enlarges territory and chronic MUP amplitude.',
    tecnicaEn:
      'Do not use one µV cutoff for APB and gastrocnemius. Combine high amplitude with reduced recruitment before calling chronic neurogenic change.',
    perlasEn: [
      'MUP size is relative to that muscle’s ratio.',
      'Reinnervation buys force and sells finesse.',
    ],
    puntosEn: [
      'Low ratio: small MUPs.',
      'Collateral sprouting enlarges the MUP.',
    ],
  }),

  'motor-unit-territory': pack({
    img: IMG.emg,
    objetivos: [
      'Recordar que la aguja concéntrica registra un radio de ~0.5–2.5 mm.',
      'Muestrear varios sitios antes de concluir sobre un músculo.',
    ],
    clinica:
      'Las fibras de una unidad se entremezclan con otras. El electrodo concéntrico ve un territorio pequeño; un solo inserto no “muestrea el músculo”. Un sitio silente junto a otro con fibrilaciones es compatible con denervación parcheada.',
    tecnica: [
      'Explore al menos 4–6 sitios en un músculo grande antes de llamar reposo normal.',
      'Reoriente el bisel; no se limite a empujar más hondo.',
      'En músculos pequeños (APB, FDI) reduzca sitios pero no se quede en uno.',
    ],
    interpretacion:
      'Actividad espontánea focal no exige un segundo músculo “para confirmar” si el territorio y la clínica coinciden; sí exige más sitios en el mismo músculo si el hallazgo es único y dudoso.',
    errores: [
      'Un inserto, una conclusión.',
      'Atravesar FDI y registrar aductor del pulgar sin saberlo.',
    ],
    perlas: [
      'La aguja es un microscopio, no un censo.',
      'Parcheado es el patrón de muchas radiculopatías y de algunas miopatías.',
    ],
    puntos: [
      'Radio de captación milimétrico.',
      'Varios sitios por músculo, siempre.',
    ],
    objetivosEn: [
      'Treat concentric EMG as a millimetre-scale sample.',
      'Require several sites before clearing a muscle.',
    ],
    clinicaEn:
      'Motor-unit fibers intermingle. A concentric needle sees a small radius. Patchy fibrillations are easy to miss with one insertion.',
    tecnicaEn:
      'Four to six sites in a large muscle; reposition the bevel rather than only going deeper.',
    perlasEn: [
      'The needle is a microscope, not a census.',
      'Patchy denervation is common.',
    ],
    puntosEn: [
      'Capture radius is millimetres.',
      'One site is not a muscle.',
    ],
  }),

  'action-potential-generation': pack({
    img: IMG.action,
    objetivos: [
      'Secuenciar umbral, apertura de Na+, inactivación y apertura de K+.',
      'Aplicar el período refractario a la orientación del estímulo en NCS.',
    ],
    clinica:
      'El potencial de acción nace cuando Na+ supera el umbral. El período refractario absoluto impide que el impulso “vuelva atrás”. En el laboratorio, el cátodo de estímulo debe orientarse hacia el registro; el ánodo proximal puede hiperpolarizar y bloquear.',
    tecnica: [
      'Verifique polaridad del estimulador antes de subir intensidad.',
      'Use pulsos de 0.1–0.2 ms en nervios superficiales; alargue solo si el nervio es profundo.',
      'Si el CMAP cae al invertir electrodos, era polaridad, no enfermedad.',
    ],
    interpretacion:
      'Un estímulo bien orientado recluta por umbral; uno invertido finge latencia larga o amplitud baja.',
    errores: [
      'Subir mA con el ánodo mirando al registro.',
      'Olvidar que el refractario explica por qué no hay conducción antidrómica fisiológica en el axón motor.',
    ],
    perlas: [
      'Umbral es membrana, no “el botón del aparato”.',
      'El ánodo puede apagar el nervio que el cátodo acaba de encender.',
    ],
    puntos: [
      'Na+ abre, K+ cierra.',
      'Cátodo hacia G1.',
    ],
    objetivosEn: [
      'Sequence threshold, Na+ opening, and K+ repolarization.',
      'Keep the cathode toward the recording site.',
    ],
    clinicaEn:
      'The action potential starts when Na+ current exceeds threshold. Anodal block from reversed stimulator polarity mimics disease.',
    tecnicaEn:
      'Check polarity first. Short pulses for superficial nerves; do not raise milliamps on a reversed stimulator.',
    perlasEn: [
      'Threshold is membrane, not the stimulator knob.',
      'The anode can silence the nerve the cathode just fired.',
    ],
    puntosEn: [
      'Na+ upstroke, K+ downstroke.',
      'Cathode toward G1.',
    ],
  }),

  'neuromuscular-transmission': pack({
    img: IMG.emg,
    objetivos: [
      'Ordenar Ca2+ presináptico, liberación de ACh y receptores nicotínicos.',
      'Elegir RNS o SFEMG según la pregunta (MG ocular vs LEMS).',
    ],
    clinica:
      'El PA terminal abre Ca2+; la ACh genera el potencial de placa. Jitter/SFEMG es más sensible que RNS en MG ocular. El frío mejora la transmisión (efecto de Lambert) y puede enmascarar decremento.',
    tecnica: [
      'En sospecha de MG, no caliente en exceso el músculo de RNS; documente temperatura.',
      'RNS a 3 Hz en un músculo débil; si es ocular y RNS es normal, plantee SFEMG.',
      'En LEMS, busque CMAP basal bajo y facilitación post-ejercicio, no solo decremento.',
    ],
    interpretacion:
      'Decremento >10% a 3 Hz en un músculo débil apoya UNM postsináptica. CMAP bajo que triplica tras 10 s de ejercicio apoya presináptica.',
    errores: [
      'Hacer RNS solo en ADM cuando la debilidad es ocular.',
      'Llamar MG a un decremento por movimiento del electrodo.',
    ],
    perlas: [
      'La UNM se estudia donde el paciente está débil.',
      'El frío es amigo del miasténico y enemigo del electrodiagnóstico.',
    ],
    puntos: [
      'ACh + nicotínico = placa.',
      'SFEMG > RNS en MG ocular.',
    ],
    objetivosEn: [
      'Sequence calcium, ACh release, and nicotinic receptors.',
      'Match RNS vs SFEMG to the clinical question.',
    ],
    clinicaEn:
      'Terminal Ca2+ releases ACh onto nicotinic receptors. SFEMG is more sensitive than RNS in ocular MG. Cooling can mask decrement.',
    tecnicaEn:
      'Test a weak muscle at 3 Hz. If ocular MG and RNS is normal, plan SFEMG. For LEMS, look for low CMAP and post-exercise facilitation.',
    perlasEn: [
      'Study the weak muscle.',
      'Cold helps the myasthenic patient and hides decrement.',
    ],
    puntosEn: [
      'Postsynaptic MG vs presynaptic LEMS are different RNS stories.',
      'Movement artifact is not decrement.',
    ],
  }),

  'excitation-contraction': pack({
    img: IMG.emg,
    objetivos: [
      'Conectar túbulo T, DHPR, rianodina y Ca2+ del retículo sarcoplásmico.',
      'Separar miopatía del sarcolema de un NCS motor normal.',
    ],
    clinica:
      'El PA del sarcolema viaja por túbulos T y libera Ca2+ del retículo. La miopatía puede mostrar PUM breves y reclutamiento precoz con NCS motora normal: el axón está, las fibras no contráen como debieran.',
    tecnica: [
      'Si CK está alta y NCS es normal, vaya a la aguja: inserción, reposo y reclutamiento.',
      'No espere latencias largas: el problema no es el nervio.',
      'Muestre músculos proximales débiles, no solo intrínsecos de la mano.',
    ],
    interpretacion:
      'NCS normal + PUM breves + reclutamiento precoz = miopatía o, menos a menudo, UNM. La clínica y las enzimas dirigen, no un solo PUM.',
    errores: [
      'Buscar “neuropatía” porque hay debilidad proximal y NCS de mano normal.',
      'Equivaler PUM breve con tipo de fibra histológico.',
    ],
    perlas: [
      'El acoplamiento es músculo, no nervio.',
      'La mano puede estar electrofisiológicamente aburrida en una miopatía proximal.',
    ],
    puntos: [
      'T-túbulo → Ca2+ → actina-miosina.',
      'NCS motora normal no excluye miopatía.',
    ],
    objetivosEn: [
      'Link T-tubules and sarcoplasmic Ca2+ to the myopathic EMG pattern.',
      'Do not expect abnormal NCS in myopathy.',
    ],
    clinicaEn:
      'T-tubule depolarization releases sarcoplasmic Ca2+. Myopathy can show short MUPs and early recruitment with normal motor NCS.',
    tecnicaEn:
      'Needle the weak proximal muscles. Do not hunt for long latencies when the axon is not the problem.',
    perlasEn: [
      'Excitation–contraction is muscle, not nerve.',
      'Hand NCS can be dull in proximal myopathy.',
    ],
    puntosEn: [
      'Normal motor NCS does not exclude myopathy.',
      'Early recruitment plus short MUPs is the EMG signature.',
    ],
  }),

  'muscle-fiber-types': pack({
    img: IMG.emg,
    objetivos: [
      'Distinguir fibras tipo I (tónicas) y tipo II (fásicas) sin inferir biopsia desde un PUM.',
      'Usar el principio de Henneman para leer el reclutamiento.',
    ],
    clinica:
      'Tipo I: umbral bajo, oxidativas, se reclutan primero. Tipo II: fásicas, más fuerza, se reclutan con más esfuerzo. La EMG describe reclutamiento y morfología, no el color de la ATPasa. Un PUM breve no es “tipo II”.',
    tecnica: [
      'Empiece con esfuerzo mínimo: está mirando unidades de umbral bajo (tipo I).',
      'Incremente fuerza para reclutar unidades mayores.',
      'Muestre varios sitios; no concluya histología.',
    ],
    interpretacion:
      'Reclutamiento precoz con PUM breves sugiere miopatía de unidades de umbral bajo, no un tipo de fibra. La biopsia la piden clínica y serología.',
    errores: [
      'Equivaler PUM breve con fibra tipo II.',
      'Diagnosticar miopatía por esfuerzo incompleto.',
    ],
    perlas: [
      'Henneman primero: las pequeñas disparan antes.',
      'La histología no vive en un canal de 200 µV/div.',
    ],
    puntos: [
      'Tipo I vs II es fisiología; la EMG describe reclutamiento.',
      'Varios sitios antes de concluir miopatía.',
    ],
    objetivosEn: [
      'Use Henneman’s size principle; do not infer fiber-type histology from one MUP.',
    ],
    clinicaEn:
      'Type I fibers are recruited first; type II later. EMG describes recruitment and MUP morphology, not ATPase staining.',
    tecnicaEn:
      'Start at minimal effort (low-threshold units), then increase force. Sample several sites.',
    perlasEn: [
      'Small units fire first.',
      'A short MUP is not “type II”.',
    ],
    puntosEn: [
      'Fiber type is physiology.',
      'Incomplete effort mimics myopathy.',
    ],
  }),

  'facial-motor': pack({
    img: IMG.ncs,
    biblio: BIBLIO_NCS,
    objetivos: [
      'Montar el VII en nasalis u orbicularis oculi y estimular preauricular.',
      'Usar la asimetría de amplitud lado a lado para pronóstico en parálisis de Bell.',
    ],
    clinica:
      'Facial (VII): registro en nasalis u orbicularis oculi, estímulo delante del trago. Compare lado a lado; asimetría de amplitud >50% a los 7–10 días sugiere axonotmesis y peor pronóstico. El lado sano es la norma del paciente.',
    tecnica: [
      'G1 en vientre del nasal; G2 en dorso nasal; cátodo preauricular mirando a G1.',
      'Mida ambos lados con la misma distancia e intensidad relativa a la meseta.',
      'No interprete el día 1: el segmento distal aún no ha degenerado.',
    ],
    interpretacion:
      'Amplitud del lado afectado ≥50% del sano a los 10 días sugiere neurapraxia. Caída mayor pide seguimiento y, a veces, aguja en músculos faciales.',
    errores: [
      'Comparar con normas de libro y no con el lado contralateral.',
      'Estimular tan fuerte que co-estimule masetero.',
    ],
    perlas: [
      'El contralateral es el valor de referencia del VII.',
      'El reloj walleriano también aplica a Bell.',
    ],
    puntos: [
      'Nasalis es estable.',
      'Asimetría de amplitud >50% a la semana 2 pesa más que la latencia.',
    ],
    objetivosEn: [
      'Record VII side-to-side and time the study after Bell’s palsy.',
    ],
    clinicaEn:
      'Stimulate preauricular, record nasalis. Amplitude <50% of the healthy side at days 7–10 suggests axonotmesis.',
    tecnicaEn:
      'Same distance both sides. Do not prognosticate on day 1. Avoid masseter co-stimulation.',
    perlasEn: [
      'The opposite face is the reference.',
      'Wallerian timing applies to Bell’s palsy.',
    ],
    puntosEn: [
      'Amplitude asymmetry outranks latency here.',
      'Nasalis is a stable pickup.',
    ],
  }),

  'trigeminal-motor': pack({
    img: IMG.ncs,
    biblio: BIBLIO_NCS,
    objetivos: [
      'Registrar V motor en masetero o temporal.',
      'Separar plexopatía de lesión de V y recordar el arco del blink (V1–VII).',
    ],
    clinica:
      'Trigémino motor (V): masetero o temporal. Útil cuando la pregunta es plexo vs V. El blink usa V1 aferente y VII eferente: no es el mismo estudio que el CMAP de masetero.',
    tecnica: [
      'G1 sobre masetero; estímulo sobre la escotadura mandibular o preauricular según laboratorio.',
      'Compare lados. Co-estimular VII ensucia el trazo.',
      'Si el problema es reflejo corneal, haga blink, no solo CMAP de masetero.',
    ],
    interpretacion:
      'CMAP de masetero habla de V motor. Blink R1/R2 habla de V1 y VII. No los intercambie en el informe.',
    errores: [
      'Llamar “trigémino” a un blink sin registrar masetero cuando la queja es masticación.',
      'Co-estimular facial y leerlo como V.',
    ],
    perlas: [
      'Masticación = V motor; córnea = V1 + VII.',
      'El plexo no lleva el masetero: si el plexo está mal y el masetero bien, no es C5–T1.',
    ],
    puntos: [
      'Masetero o temporal para V motor.',
      'Blink es otro protocolo.',
    ],
    objetivosEn: [
      'Record masseter/temporalis for motor V; keep blink as a separate V1–VII pathway.',
    ],
    clinicaEn:
      'Motor V is masseter or temporalis. Blink reflex is V1 afferent and VII efferent, not a masseter CMAP.',
    tecnicaEn:
      'Avoid co-stimulating VII. Use blink when the question is corneal, masseter CMAP when the question is mastication.',
    perlasEn: [
      'Plexus lesions spare masseter.',
      'Do not report blink as motor V.',
    ],
    puntosEn: [
      'Motor V ≠ blink.',
      'Side-to-side masseter amplitude is the comparison.',
    ],
  }),

  'accessory-motor': pack({
    img: IMG.ncs,
    biblio: BIBLIO_NCS,
    objetivos: [
      'Registrar XI en trapecio o ECM y estimular en el triángulo posterior.',
      'Separar lesión de XI de C3–C4.',
    ],
    clinica:
      'Espinal accesorio (XI): trapecio. Estímulo en triángulo posterior. Una lesión de XI deja trapecio débil con CMAP de deltoides y paraespinales C3–C4 distintos; la raíz cervical no es el XI.',
    tecnica: [
      'G1 en trapecio superior; cátodo en triángulo posterior, ánodo hacia atrás.',
      'No estimule tan alto que contraiga el facial.',
      'Compare con el lado sano; el XI es corto y las normas absolutas ayudan menos que la asimetría.',
    ],
    interpretacion:
      'CMAP de trapecio bajo + aguja neurogénica en trapecio y ECM, con deltoides sano, localiza XI. Deltoides y supraespinoso malos con trapecio sano no son XI.',
    errores: [
      'Confundir hombro caído post-biopsia de ganglio con radiculopatía C5.',
      'Estimular plexo y creer que es XI.',
    ],
    perlas: [
      'El triángulo posterior es el quirófano del XI.',
      'C3–C4 no salvan un trapecio denervado por XI.',
    ],
    puntos: [
      'Registro: trapecio o ECM.',
      'Pregunta clínica: biopsia, cirugía de cuello, mochila.',
    ],
    objetivosEn: [
      'Record trapezius, stimulate in the posterior triangle, and separate XI from C3–C4.',
    ],
    clinicaEn:
      'Accessory nerve lesions drop trapezius CMAP. Cervical roots and deltoid tell a different story.',
    tecnicaEn:
      'G1 on upper trapezius, cathode in the posterior triangle, side-to-side comparison.',
    perlasEn: [
      'Posterior triangle surgery is a classic XI injury.',
      'C3–C4 is not XI.',
    ],
    puntosEn: [
      'Trapezius CMAP is the XI number.',
      'Asymmetry beats textbook latencies.',
    ],
  }),

  'hypoglossal-motor': pack({
    img: IMG.ncs,
    biblio: BIBLIO_NCS,
    objetivos: [
      'Registrar XII en geniogloso y reconocer su papel en ELA bulbar.',
      'Evitar artefactos de movimiento lingual.',
    ],
    clinica:
      'Hipogloso (XII): geniogloso. Lateralización de la lengua y CMAP lingual importan en ELA bulbar y en lesiones de base de cráneo. El SNAP no aplica: es motor puro para el laboratorio práctico.',
    tecnica: [
      'Aguja o superficie sobre vientre lingual según protocolo local; pida a la persona que empuje la lengua contra el diente.',
      'Compare lados: la lengua se desvía hacia el lado débil.',
      'No confunda fasciculaciones linguales clínicas con ruido de movimiento.',
    ],
    interpretacion:
      'Denervación lingual con V y VII relativamente conservados empuja hacia XII o motoneurona bulbar, no hacia plexo.',
    errores: [
      'Llamar artefactos de lengua “fibrilaciones” sin reposo verdadero.',
      'Omitir la lengua en un protocolo de ELA bulbar.',
    ],
    perlas: [
      'La lengua es un músculo de motoneurona, no de plexo.',
      'Mire la lengua antes de pincharla.',
    ],
    puntos: [
      'Geniogloso = XII.',
      'ELA bulbar: aguja lingual con criterio, no por rutina dolorosa.',
    ],
    objetivosEn: [
      'Sample genioglossus for XII and for bulbar MND, without mistaking movement for fibrillations.',
    ],
    clinicaEn:
      'Tongue deviation and genioglossus EMG matter in bulbar ALS and skull-base lesions. This is a motor nerve in the lab.',
    tecnicaEn:
      'Compare sides. Demand true rest before calling lingual fibrillations.',
    perlasEn: [
      'The tongue is not plexus.',
      'Look before you needle.',
    ],
    puntosEn: [
      'Genioglossus = XII.',
      'Movement noise is not spontaneous activity.',
    ],
  }),

  'glossopharyngeal-motor': pack({
    img: IMG.ncs,
    biblio: BIBLIO_NCS,
    objetivos: [
      'Limitar el papel del IX motor en el laboratorio y no forzar un CMAP faríngeo rutinario.',
      'Usar clínica del náuseo y paladar (X) para no sobreinterpretar.',
    ],
    clinica:
      'IX motor se explora poco; el arco del náuseo y el reflejo faríngeo son clínicos. El paladar lo inerva X. Un CMAP faríngeo técnico rara vez cambia la conducta si la clínica de IX/X está clara.',
    tecnica: [
      'No pinche faringe “porque está en el temario” si la pregunta es un túnel carpiano.',
      'Si hay disfagia, priorice clínica, laringe (X) y, en ELA, lengua (XII).',
      'Documente que IX no tiene NCS de rutina reproducible en todos los laboratorios.',
    ],
    interpretacion:
      'La ausencia de un número de IX no es un estudio incompleto en un protocolo de miembro superior.',
    errores: [
      'Atribuir paladar al IX.',
      'Forzar estímulos en cuello que bradicardizan por X.',
    ],
    perlas: [
      'IX es más clínica que trazo.',
      'El paladar es X.',
    ],
    puntos: [
      'Náuseo es arco IX–X clínico.',
      'No hay norma AANEM cotidiana para CMAP de IX.',
    ],
    objetivosEn: [
      'Keep motor IX clinical; do not force a pharyngeal CMAP into every protocol.',
    ],
    clinicaEn:
      'IX motor is rarely a routine NCS. Palate is X. Gag is a clinical IX–X arc.',
    tecnicaEn:
      'For dysphagia, think X and XII before inventing an IX number.',
    perlasEn: [
      'IX is more bedside than trace.',
      'Palate is X.',
    ],
    puntosEn: [
      'No routine AANEM IX CMAP.',
      'Do not bradycardia the patient chasing IX.',
    ],
  }),

  'vagus-motor': pack({
    img: IMG.ncs,
    biblio: BIBLIO_NCS,
    objetivos: [
      'Registrar X en músculos laríngeos cuando la pregunta es disfonía o ELA.',
      'Vigilar bradicardia al estimular cuello.',
    ],
    clinica:
      'X: laringe (cricoaritenoideo o cricotiroideo según montaje). Útil en disfonía y ELA. El estímulo en cuello puede causar bradicardia: intensidad justa y monitor clínico.',
    tecnica: [
      'Acuerde el montaje con el laboratorio (superficie vs aguja laríngea).',
      'Estimule con pulsos cortos; pare si hay malestar autonómico.',
      'Correlacione con clínica de paladar y tos, no solo con un CMAP pequeño.',
    ],
    interpretacion:
      'Denervación laríngea aislada no es plexo braquial. En ELA, súmela a lengua y miembros, no la lea sola.',
    errores: [
      'Estímulo excesivo en cuello.',
      'Llamar “vago” a un artefacto de deglución.',
    ],
    perlas: [
      'El vago se respeta: menos miliamperios, más atención al pulso.',
      'Disfonía + lengua + mano es un patrón, no tres rarezas.',
    ],
    puntos: [
      'Laringe = X.',
      'Riesgo autonómico real.',
    ],
    objetivosEn: [
      'Study laryngeal muscles for X; watch for bradycardia during neck stimulation.',
    ],
    clinicaEn:
      'Vagus motor is larynx. Useful in dysphonia and ALS. Neck stimulation can bradycardia the patient.',
    tecnicaEn:
      'Short pulses, stop for autonomic symptoms, correlate with palate and cough.',
    perlasEn: [
      'Respect the vagus.',
      'Dysphonia plus tongue plus hand is a pattern.',
    ],
    puntosEn: [
      'Larynx = X.',
      'Swallow artifact is not a CMAP.',
    ],
  }),

  'motor-interpretation': pack({
    img: IMG.ncs,
    biblio: BIBLIO_NCS,
    objetivos: [
      'Separar patrón axonal (amplitud) de desmielinizante (tiempo y bloqueo).',
      'Exigir tiempo de evolución antes de cerrar el diagnóstico.',
    ],
    clinica:
      'Axonal: amplitud baja, VCM conservada. Desmielinizante: latencia, VCM, dispersión o bloqueo. Mixto: combine criterios AANEM y el reloj clínico. Un CMAP bajo el día 2 de un trauma no es aún axonopatía walleriana completa.',
    tecnica: [
      'Tabule latencia distal, amplitud, duración y velocidad en distal y proximal.',
      'Aplique criterios de desmielinización al nervio, no a un solo número aislado.',
      'Si hay bloqueo, descarta Martin-Gruber, frío y distancia.',
    ],
    interpretacion:
      'Un parámetro fuera de norma no certifica el mecanismo. El patrón a lo largo del nervio y de varios nervios sí.',
    errores: [
      'Llamar desmielinizante a una mano a 28 °C.',
      'Llamar axonal a un CMAP bajo por estímulo submáximo.',
    ],
    perlas: [
      'Amplitud cuenta axones; el reloj cuenta si ya degeneraron.',
      'La velocidad cuenta mielina, si la temperatura es honesta.',
    ],
    puntos: [
      'Axonal vs desmielinizante es un patrón, no una celda.',
      'Normas de laboratorio o AANEM, no de memoria.',
    ],
    objetivosEn: [
      'Read axonal vs demyelinating as a pattern across latency, amplitude, duration, and time from onset.',
    ],
    clinicaEn:
      'Axonal: low amplitude, relatively preserved CV. Demyelinating: latency, CV, dispersion, or block. Mix in clinical timing.',
    tecnicaEn:
      'Table distal and proximal values. Apply AANEM demyelination criteria to the nerve, after excluding cold and Martin-Gruber.',
    perlasEn: [
      'Amplitude counts axons; the clock counts Wallerian loss.',
      'Velocity counts myelin if the limb is warm.',
    ],
    puntosEn: [
      'One abnormal cell is not a mechanism.',
      'Use lab or AANEM reference values.',
    ],
  }),

  'snap-morphology': pack({
    img: IMG.ncs,
    biblio: BIBLIO_NCS,
    objetivos: [
      'Medir el SNAP en µV con la misma convención (pico-pico o inicial-negativa) que las normas.',
      'Reconocer un SNAP trifásico frente a ruido o CMAP contaminante.',
    ],
    clinica:
      'El SNAP es trifásico y mil veces más pequeño que el CMAP. Mida pico-pico o inicial-negativa según su laboratorio; mezclar métodos inventa neuropatía o la oculta.',
    tecnica: [
      'Ganancia en µV/div; promedie si hace falta, sin alisar el onset.',
      'Separe el SNAP de un CMAP de músculo intrínseco en estudios antidrómicos de dedos.',
      'Fije la convención de medición en el informe.',
    ],
    interpretacion:
      'Un SNAP ausente en un nervio y presente en el vecino localiza. Un SNAP “bajo” medido con otra convención no localiza nada.',
    errores: [
      'Comparar amplitud antidrómica con normas ortodrómicas.',
      'Medir el artefacto como pico.',
    ],
    perlas: [
      'El SNAP es un susurro; el CMAP es un grito. No use la misma ganancia.',
      'Una convención por laboratorio, siempre.',
    ],
    puntos: [
      'µV, no mV.',
      'Misma medición que la tabla de normas.',
    ],
    objetivosEn: [
      'Measure SNAP in µV with the same convention as the reference table.',
    ],
    clinicaEn:
      'SNAP is triphasic and tiny. Mixing peak-peak with onset-to-peak invents or hides sensory loss.',
    tecnicaEn:
      'Use µV gain. Do not let a finger CMAP masquerade as SNAP on antidromic studies.',
    perlasEn: [
      'SNAP is a whisper.',
      'One measurement convention per lab.',
    ],
    puntosEn: [
      'µV, not mV.',
      'Match the normative method.',
    ],
  }),

  'onset-peak-latency': pack({
    img: IMG.ncs,
    biblio: BIBLIO_NCS,
    objetivos: [
      'Usar onset para las fibras más rápidas y pico cuando el SNAP es pequeño.',
      'No mezclar onset y pico en la misma comparación.',
    ],
    clinica:
      'Onset estima las fibras más rápidas; pico es más reproducible en SNAP de baja amplitud. La velocidad calculada con uno no se compara con normas del otro.',
    tecnica: [
      'Marque onset en la salida de la línea de base, no en el artefacto.',
      'Si el SNAP es <5 µV, el pico suele ser más honesto que un onset imaginado.',
      'Declare en el informe si usó onset o pico.',
    ],
    interpretacion:
      'Una “latencia larga” medida en pico contra normas de onset es un error de método, no un túnel carpiano.',
    errores: [
      'Cambiar de onset a pico a mitad de estudio porque “se veía mejor”.',
      'Poner el cursor en el artefacto.',
    ],
    perlas: [
      'El cursor es un acto diagnóstico.',
      'Pico no es más lento: es otra magnitud.',
    ],
    puntos: [
      'Onset = fibras más rápidas.',
      'Pico = reproducibilidad en SNAP chicos.',
    ],
    objetivosEn: [
      'Keep onset and peak latency as different quantities.',
    ],
    clinicaEn:
      'Onset tracks the fastest fibers; peak is more reproducible on tiny SNAPs. Do not mix them.',
    tecnicaEn:
      'Place onset after the artifact. If SNAP is tiny, prefer peak and say so in the report.',
    perlasEn: [
      'Cursor placement is a diagnostic act.',
      'Peak is not “slower onset”; it is another metric.',
    ],
    puntosEn: [
      'One method per comparison.',
      'Do not cursor the artifact.',
    ],
  }),

  'snap-amplitude': pack({
    img: IMG.ncs,
    biblio: BIBLIO_NCS,
    objetivos: [
      'Leer la amplitud del SNAP como número de fibras postganglionares excitables.',
      'Usarla para separar radiculopatía (SNAP presente) de plexo/nervio (SNAP bajo o ausente).',
    ],
    clinica:
      'La amplitud SNAP cae en lesión postganglionar. En radiculopatía (preganglionar) el SNAP suele conservarse aunque el paciente esté dormido el dermatoma.',
    tecnica: [
      'Compare con el lado contralateral y con nervios vecinos del mismo ganglio.',
      'En radiculopatía C8, el SNAP cubital y el mediano digital pueden estar presentes; la aguja en paraespinales y intrínsecos cierra el caso.',
      'No declare SNAP ausente a ganancia de CMAP.',
    ],
    interpretacion:
      'SNAP ausente + denervación en un miotoma = plexo o nervio. SNAP presente + denervación miotomal = raíz.',
    errores: [
      'Llamar radiculopatía a un SNAP sural ausente bilateral en un diabético.',
      'Olvidar el envejecimiento: los SNAP de pies se pierden con la edad.',
    ],
    perlas: [
      'El ganglio es la aduana del SNAP.',
      'Un pie de 80 años sin sural no es automáticamente ciático.',
    ],
    puntos: [
      'SNAP bajo = postganglionar hasta demostrar lo contrario.',
      'Edad y temperatura primero.',
    ],
    objetivosEn: [
      'Use SNAP amplitude to separate preganglionic from postganglionic lesions.',
    ],
    clinicaEn:
      'SNAP falls after the DRG. Radiculopathy usually preserves SNAP. Plexus and nerve do not.',
    tecnicaEn:
      'Compare side-to-side and with neighboring nerves. Use µV gain. Age-adjust the feet.',
    perlasEn: [
      'The DRG is the SNAP customs gate.',
      'Absent sural at 80 is not automatically sciatic.',
    ],
    puntosEn: [
      'Present SNAP + myotomal fibrillations = root.',
      'Absent SNAP + denervation = plexus or nerve.',
    ],
  }),

  'sensory-cv': pack({
    img: IMG.ncs,
    biblio: BIBLIO_NCS,
    objetivos: [
      'Calcular VCS = distancia / latencia de inicio (o la convención del laboratorio).',
      'Exigir 32–34 °C en la mano antes de llamar enlentecimiento.',
    ],
    clinica:
      'VCS = distancia / latencia. Use la misma convención (onset vs pico) que la norma. Temperatura 32–34 °C en la mano: cada grado bajo resta ~1.5–2.4 m/s en muchos laboratorios.',
    tecnica: [
      'Mida la distancia con la extremidad en la misma postura que el estímulo.',
      'Caliente; no “corrija de memoria” una mano a 28 °C.',
      'No compare VCS antidrómica con tabla ortodrómica.',
    ],
    interpretacion:
      'Una VCS baja en un solo dedo con amplitud conservada pide técnica o atrapamiento focal, no polineuropatía.',
    errores: [
      'Cinta floja o recortada entre estímulo y G1.',
      'Velocidad calculada con pico y normas de onset.',
    ],
    perlas: [
      'La velocidad es un cociente: basura en distancia, basura en m/s.',
      'Calor antes que criterio de desmielinización.',
    ],
    puntos: [
      'Misma convención que la tabla.',
      '32–34 °C en mano.',
    ],
    objetivosEn: [
      'Compute sensory CV with measured distance and the lab’s latency convention, on a warm limb.',
    ],
    clinicaEn:
      'CV = distance / latency. Cold hands fake demyelination. Mix-and-match onset vs peak fakes everything.',
    tecnicaEn:
      'Measure distance in the stimulator posture. Warm to 32–34 °C. Match antidromic/orthodromic tables.',
    perlasEn: [
      'Garbage distance, garbage CV.',
      'Warm before you demyelinate.',
    ],
    puntosEn: [
      'Same convention as the table.',
      'One slow finger is not polyneuropathy.',
    ],
  }),

  'antidromic-orthodromic': pack({
    img: IMG.ncs,
    biblio: BIBLIO_NCS,
    objetivos: [
      'Elegir antidrómica (más amplitud) u ortodrómica (menos artefacto de CMAP) a propósito.',
      'No comparar amplitudes entre técnicas.',
    ],
    clinica:
      'Antidrómica: estimulación proximal, registro distal; mayor amplitud, más riesgo de CMAP contaminante. Ortodrómica: más nítida, menor amplitud. Son estudios distintos, no “el mismo SNAP más bonito”.',
    tecnica: [
      'Si el SNAP antidrómico de dedo se ensucia con CMAP, reduzca intensidad o pase a ortodrómica.',
      'Use normas de la técnica que está aplicando.',
      'No mezcle un lado antidrómico con el otro ortodrómico.',
    ],
    interpretacion:
      'Una amplitud “baja” ortodrómica puede ser normal para esa técnica y patológica si se lee con tabla antidrómica.',
    errores: [
      'Subir el estímulo antidrómico hasta invadir el SNAP con CMAP.',
      'Informar “asimetría” entre técnicas distintas.',
    ],
    perlas: [
      'Más amplitud no es más verdad.',
      'La técnica se declara en el informe.',
    ],
    puntos: [
      'Antidrómica: amplitud.',
      'Ortodrómica: limpieza.',
    ],
    objetivosEn: [
      'Choose antidromic vs orthodromic on purpose and never mix their amplitude tables.',
    ],
    clinicaEn:
      'Antidromic SNAPs are larger and more contaminated by CMAP. Orthodromic SNAPs are cleaner and smaller.',
    tecnicaEn:
      'If a finger SNAP is swamped by CMAP, drop intensity or switch to orthodromic. Use matching norms.',
    perlasEn: [
      'Bigger is not truer.',
      'Name the technique in the report.',
    ],
    puntosEn: [
      'Do not compare amplitudes across techniques.',
      'Same technique both sides.',
    ],
  }),

  'pre-post-ganglionic': pack({
    img: IMG.ncs,
    biblio: BIBLIO_NCS,
    objetivos: [
      'Usar el SNAP como frontera del ganglio de la raíz dorsal.',
      'Combinar SNAP, aguja miotomal y paraespinales.',
    ],
    clinica:
      'SNAP ausente + EMG de denervación = postganglionar (plexo/nervio). SNAP presente + denervación miotomal = raíz. El cuerpo celular en el GRD explica por qué el dermatoma puede estar dormido y el SNAP vivo.',
    tecnica: [
      'Elija un SNAP del mismo miotoma/dermatoma que la aguja (p. ej. cubital digital con C8).',
      'Incluya paraespinales cuando la pregunta sea raíz.',
      'En plexo inferior, el SNAP cubital suele caer; en C8 radicular, suele vivir.',
    ],
    interpretacion:
      'La tríada SNAP + miotoma + paraespinales localiza. Dos de tres discordantes piden más músculos, no un adjetivo.',
    errores: [
      'Llamar plexo porque duele el hombro, con SNAP nítidos y paraespinales activos.',
      'Olvidar que una polineuropatía borra SNAP y confunde la regla.',
    ],
    perlas: [
      'El GRD es la aduana: raíz adentro, plexo afuera.',
      'Paraespinales no mienten a favor del plexo.',
    ],
    puntos: [
      'SNAP presente favorece raíz.',
      'SNAP ausente favorece plexo o nervio, si no hay polineuropatía.',
    ],
    objetivosEn: [
      'Use SNAP plus myotomal needle plus paraspinals to place the lesion relative to the DRG.',
    ],
    clinicaEn:
      'Preserved SNAP with myotomal fibrillations = root. Absent SNAP with denervation = plexus or nerve.',
    tecnicaEn:
      'Pair a SNAP with the same myotome. Add paraspinals when the question is radiculopathy.',
    perlasEn: [
      'DRG is the customs gate.',
      'Paraspinals do not support plexus.',
    ],
    puntosEn: [
      'Polyneuropathy erases the rule—say so.',
      'Need the triad, not an adjective.',
    ],
  }),

  'age-height': pack({
    img: IMG.ncs,
    biblio: BIBLIO_NCS,
    objetivos: [
      'Ajustar VCM ~0.5–1 m/s por década y latencias F por estatura.',
      'No usar normas de adulto joven en octogenarios ni en pies.',
    ],
    clinica:
      'La VCM cae ~0.5–1 m/s por década; la altura alarga latencias F. Los SNAP de pies pueden ausentarse con la edad sin ciático. Chen y el task force de AANEM (2016) piden normas de calidad, no recuerdos de residencia.',
    tecnica: [
      'Anote edad, talla y temperatura en cada estudio.',
      'Use la tabla de su laboratorio o AANEM ajustada; no mezcle percentiles.',
      'En F, compare con talla o con el lado contralateral antes de “radiculopatía”.',
    ],
    interpretacion:
      'Una F de 36 ms en alguien de 1.90 m no es la misma F de 36 ms en alguien de 1.55 m.',
    errores: [
      'Normas de 25 años aplicadas a 80.',
      'Declarar sural ausente patológico en un pie añosos sin el otro lado ni el peroneo superficial.',
    ],
    perlas: [
      'La talla entra al informe de las F.',
      'Envejecer no es desmielinizar.',
    ],
    puntos: [
      'Edad baja velocidad y amplitud.',
      'Talla alarga F.',
    ],
    objetivosEn: [
      'Age-adjust CV and amplitude; height-adjust F waves; use AANEM-quality reference values.',
    ],
    clinicaEn:
      'CV falls ~0.5–1 m/s per decade. Height lengthens F waves. Foot SNAPs may vanish with age.',
    tecnicaEn:
      'Record age, height, and temperature. Do not apply a 25-year-old table to an 80-year-old foot.',
    perlasEn: [
      'Height belongs in the F-wave report.',
      'Aging is not demyelination.',
    ],
    puntosEn: [
      'Chen et al., Muscle Nerve 2016, for reference-value quality.',
      'Side-to-side still helps in the elderly.',
    ],
  }),

  'stimulus-artifact': pack({
    img: IMG.ncs,
    biblio: BIBLIO_NCS,
    objetivos: [
      'Reconocer el artefacto de estímulo en NCS y no medir el onset sobre él.',
      'Mitigar con impedancia, polaridad, tierra entre estímulo y registro, y pulsos cortos.',
    ],
    clinica:
      'El acoplamiento entre estimulador y amplificador ensancha el artefacto y oculta el onset del CMAP o SNAP. Medir sobre el artefacto finge latencias cortas. En el módulo de conducción el problema es un número falso; no es aún el capítulo de control de calidad, pero se resuelve con la misma física.',
    tecnica: [
      'Baje impedancia (<5 kΩ), separe cables y ponga tierra entre estímulo y G1.',
      'Gire el ánodo, acorte el pulso y evite gel que una los electrodos.',
      'Alcance meseta supramáxima sin empujar el artefacto sobre el potencial.',
    ],
    interpretacion:
      'Si el cursor de onset está dentro del artefacto, esa latencia no se informa: se repite el montaje.',
    errores: [
      'Subir mA hasta saturar el canal.',
      'Notch agresivo que deforma el CMAP.',
    ],
    perlas: [
      'Un onset dentro del artefacto no existe.',
      'Más intensidad no limpia el artefacto; suele empeorarlo.',
    ],
    puntos: [
      'Tierra entre estímulo y registro.',
      'No reporte latencias medidas sobre el artefacto.',
    ],
    objetivosEn: [
      'Keep the NCS onset off the stimulus artifact by fixing impedance, ground, and pulse width.',
    ],
    clinicaEn:
      'Stimulus–amplifier coupling hides onset and fakes short latencies. Do not cursor the artifact.',
    tecnicaEn:
      'Ground between stimulator and G1, rotate the anode, shorten the pulse, and stop at a clean supramaximal plateau.',
    perlasEn: [
      'Onset inside the artifact is not a latency.',
      'More milliamps rarely shrink artifact.',
    ],
    puntosEn: [
      'Fix the setup, then measure.',
      'Notch is not a substitute for geometry.',
    ],
  }),

  'martin-gruber': pack({
    img: IMG.ncs,
    biblio: BIBLIO_NCS,
    objetivos: [
      'Reconocer Martin-Gruber (mediano → cubital en antebrazo) como imitador de bloqueo cubital.',
      'Buscar Riche-Cannieu cuando el APB “no es mediano”.',
    ],
    clinica:
      'Martin-Gruber (15–30%) lleva fibras motoras del mediano al cubital en el antebrazo. Simula bloqueo cubital en el codo (CMAP de muñeca > codo en cubital) y puede dar un positivo inicial en el CMAP mediano de muñeca. Riche-Cannieu explica un APB cubitalizado.',
    tecnica: [
      'Si el cubital “bloquea” en el codo, estimule mediano en codo y registre ADM.',
      'Busque CMAP cubital mayor en codo que en muñeca, el inverso del bloqueo verdadero.',
      'Ante APB nulo con cubital nítido, piense Riche-Cannieu antes de motoneurona.',
    ],
    interpretacion:
      'Un “bloqueo” cubital sin debilidad cubital ni aguja en FDI es Martin-Gruber hasta que se demuestre lo contrario.',
    errores: [
      'Operar un codo por un bloqueo que era anastomosis.',
      'Llamar ELA a un APB silente con FDI normal sin buscar Riche-Cannieu.',
    ],
    perlas: [
      'La anatomía miente primero; la enfermedad, después.',
      'ADM registrado desde mediano en codo desenmascara Martin-Gruber.',
    ],
    puntos: [
      'Martin-Gruber imita bloqueo cubital.',
      'Riche-Cannieu imita APB denervado mediano.',
    ],
    objetivosEn: [
      'Unmask Martin-Gruber as a fake ulnar elbow block and Riche-Cannieu as a fake median APB lesion.',
    ],
    clinicaEn:
      'Median-to-ulnar forearm fibers mimic ulnar conduction block. Riche-Cannieu can ulnarize APB.',
    tecnicaEn:
      'If ulnar “blocks” at the elbow, stimulate median at the elbow and record ADM. Incongruous APB vs FDI prompts Riche-Cannieu.',
    perlasEn: [
      'Anatomy lies first.',
      'ADM from median stimulation is the tell.',
    ],
    puntosEn: [
      'Do not operate a Martin-Gruber.',
      'Silent APB with spared FDI is not automatically MND.',
    ],
  }),

  'supramaximal': pack({
    img: IMG.ncs,
    biblio: BIBLIO_NCS,
    objetivos: [
      'Alcanzar meseta de amplitud y sumar 20–25% de intensidad en NCS.',
      'Evitar CMAP/SNAP submáximos que fingen pérdida axonal.',
    ],
    clinica:
      'La estimulación supramáxima recluta todas las fibras excitables. La meseta es el punto en que la amplitud deja de crecer; el 20–25% extra cubre movimiento del estimulador. Un estímulo submáximo deja fuera axones de umbral alto y finge axonopatía.',
    tecnica: [
      'Suba de 5–10 mA hasta que la amplitud no crezca; entonces sume 20–25%.',
      'Si el paciente no tolera, documente “posiblemente submáximo” en vez de informar amplitud baja como hecho.',
      'No confunda dolor con meseta: mire el trazo, no la cara.',
    ],
    interpretacion:
      'Amplitud estable en tres estímulos seguidos a intensidad creciente es meseta. Amplitud que aún crece no se informa como CMAP final.',
    errores: [
      'Un solo estímulo “fuerte” sin meseta.',
      'Comparar un lado supramáximo con el otro submáximo.',
    ],
    perlas: [
      'La meseta se ve en la pantalla, no se adivina en los mA.',
      'Submáximo es el imitador más barato de la axonopatía.',
    ],
    puntos: [
      'Meseta + 20–25%.',
      'Misma regla en CMAP y SNAP.',
    ],
    objetivosEn: [
      'Find the amplitude plateau, then add 20–25% current.',
    ],
    clinicaEn:
      'Submaximal stimulation recruits only low-threshold axons and mimics axonal loss. Supramaximal means plateau plus a margin.',
    tecnicaEn:
      'Watch the trace while raising milliamps. Document if pain prevented a true plateau. Match both sides.',
    perlasEn: [
      'Plateau is on the screen.',
      'Submaximal is the cheapest mimic of axon loss.',
    ],
    puntosEn: [
      'Plateau + 20–25%.',
      'Do not report a still-rising CMAP.',
    ],
  }),

  'early-recruitment': pack({
    img: IMG.emg,
    objetivos: [
      'Reconocer interferencia completa a baja fuerza con PUM breves y de baja amplitud.',
      'Separarlo de esfuerzo incompleto y de UNM.',
    ],
    clinica:
      'En miopatía cada unidad genera poca fuerza, así que el sistema recluta muchas unidades pronto: el patrón se llena con poco esfuerzo y los PUM son cortos y pequeños. El esfuerzo incompleto también “llena poco”, pero al revés: pocas unidades, frecuencias bajas, PUM de tamaño normal.',
    tecnica: [
      'Pida fuerza graduada: 10%, 30%, máximo. El precoz se llena ya al 10–30%.',
      'Mida duración de PUM a esfuerzo mínimo, no en el caos del máximo.',
      'Confirme que el paciente realmente empuja (tendón, movimiento).',
    ],
    interpretacion:
      'Lleno temprano + PUM breves = miopático. Lleno tardío + PUM grandes = reinnervación. Vacío con frecuencias bajas = esfuerzo.',
    errores: [
      'Llamar miopatía a un bíceps que no se activa por dolor.',
      'Usar ganancia de 2 mV/div y no ver PUM pequeños.',
    ],
    perlas: [
      'El reclutamiento precoz es mucha gente para poco trabajo.',
      'Mire el tendón, no solo el altavoz.',
    ],
    puntos: [
      'Interferencia temprana + PUM cortos.',
      'Esfuerzo incompleto no es miopatía.',
    ],
    objetivosEn: [
      'Recognize early full interference with short, small MUPs, and separate it from poor effort.',
    ],
    clinicaEn:
      'Myopathic units produce little force, so many are recruited early. Poor effort shows few units firing slowly with normal MUP size.',
    tecnicaEn:
      'Grade force. Measure MUP duration at low effort. Confirm the tendon actually moves.',
    perlasEn: [
      'Early recruitment is many people for little work.',
      'Watch the tendon.',
    ],
    puntosEn: [
      'Full pattern at low force + short MUPs = myopathic.',
      'Low firing rates = effort, not myopathy.',
    ],
  }),

  'reduced-recruitment': pack({
    img: IMG.emg,
    objetivos: [
      'Reconocer pocas unidades disparando rápido (>20 Hz) a fuerza submáxima.',
      'Oír el “clack-clack” neurogénico frente al rugido normal.',
    ],
    clinica:
      'Con pérdida de axones quedan pocas unidades; para generar fuerza disparan rápido. El patrón de interferencia queda incompleto y, en crónico, los PUM pueden ser gigantes. No es “el paciente no empuja”: las frecuencias son altas.',
    tecnica: [
      'Cuente frecuencias de una unidad visible: >20 Hz con fuerza incompleta es neurogénico.',
      'Use 1–2 mV/div para ver si el patrón se llena.',
      'Correlacione con NCS de amplitud del mismo nervio.',
    ],
    interpretacion:
      'Reclutamiento reducido + CMAP bajo = pérdida axonal. Reclutamiento reducido + CMAP normal puede ser central, dolor o mala activación: mire frecuencias.',
    errores: [
      'Llamar neurogénico a un esfuerzo pobre con frecuencias de 8 Hz.',
      'Ganancia de 200 µV/div que “llena” la pantalla con una sola unidad grande.',
    ],
    perlas: [
      'Rápido y solo es neurogénico; lento y solo es esfuerzo.',
      'El oído oye el reclutamiento antes que el cursor.',
    ],
    puntos: [
      'Pocas UM, alta frecuencia.',
      'Ganancia de interferencia en mV, no en µV.',
    ],
    objetivosEn: [
      'Spot few motor units firing fast at submaximal force as the neurogenic recruitment signature.',
    ],
    clinicaEn:
      'Lost axons leave few units firing rapidly. Poor effort leaves few units firing slowly. Chronic reinnervation may add giant MUPs.',
    tecnicaEn:
      'Measure firing rate. Use 1–2 mV/div for the interference pattern. Correlate with CMAP amplitude.',
    perlasEn: [
      'Fast and lonely is neurogenic; slow and lonely is effort.',
      'The speaker hears recruitment before the cursor does.',
    ],
    puntosEn: [
      'Reduced recruitment is a rate story.',
      'Do not read interference at 200 µV/div.',
    ],
  }),

  fdi: pack({
    img: IMG.emg,
    objetivos: [
      'Insertar FDI a mitad del primer espacio interóseo y activar con abducción del índice.',
      'Usarlo en cubital, tronco inferior, C8–T1 y Guyon.',
    ],
    clinica:
      'FDI: cubital, cordón medial, tronco inferior, C8–T1. Es el intrínseco más dócil y el testigo del cubital distal. Compare con APB (mediano) y con paraespinales C8 cuando la pregunta sea raíz vs plexo vs nervio.',
    tecnica: [
      'Inserte en el dorso, a medio camino entre MCF del pulgar e índice; no atraviese hacia el aductor.',
      'Activación: separar el índice. Si no hay movimiento, no hay esfuerzo.',
      'En cubital de codo, FDI y ADM; en Guyon, FDI puede caer más que hipoténar según el ramo.',
    ],
    interpretacion:
      'FDI y ADM malos + APB bueno = cubital. FDI y APB malos + paraespinales = C8/T1 o plexo inferior (el SNAP decide).',
    errores: [
      'Aguja demasiado profunda (aductor del pulgar).',
      'Olvidar FDI en un “cubital de codo” que solo miró ADM.',
    ],
    perlas: [
      'FDI suele doler menos que APB.',
      'Un FDI sano con ADM enfermo pide ramo y no un cubital completo.',
    ],
    puntos: [
      'Cubital, C8–T1.',
      'No profundizar al aductor.',
    ],
    objetivosEn: [
      'Needle FDI for ulnar, lower trunk, and C8–T1 questions without crossing into adductor pollicis.',
    ],
    clinicaEn:
      'FDI is ulnar, C8–T1. Pair it with APB and C8 paraspinals to place the lesion.',
    tecnicaEn:
      'Midway in the first web. Abduct the index. Do not go deep into adductor pollicis.',
    perlasEn: [
      'FDI is usually the kindest intrinsic.',
      'FDI vs ADM splits Guyon branches.',
    ],
    puntosEn: [
      'Ulnar, C8–T1.',
      'Shallow insertion.',
    ],
  }),

  apb: pack({
    img: IMG.emg,
    objetivos: [
      'Localizar APB como mediano, C8–T1, testigo de túnel carpiano vs raíz vs plexo.',
      'Comparar siempre con FDI y pronador cuadrado.',
    ],
    clinica:
      'El abductor corto del pulgar (APB) es mediano, C8–T1. Túnel carpiano, raíz C8 y plexo inferior se pelean este músculo. El SNAP mediano y el FDI (cubital) desempata. Riche-Cannieu puede silenciar APB con cubital indemne.',
    tecnica: [
      'Inserte en el tercio medio de la eminencia tenar, lejos del pliegue, evitando el oponente profundo si no es el objetivo.',
      'Activación: abducción palmar del pulgar, no flexión (FPL es interóseo anterior).',
      'Si APB está silente y FDI brilla, piense mediano distal o anastomosis, no ELA de entrada.',
    ],
    interpretacion:
      'APB + PQ + FPL = mediano proximal/AIN. Solo APB + SNAP mediano lento = muñeca. APB + FDI + paraespinales = C8.',
    errores: [
      'Pedir oposición y registrar oponente pensando que es APB.',
      'No comparar con FDI.',
    ],
    perlas: [
      'Abducción palmar, no “apriete el pulgar”.',
      'APB solo no es un diagnóstico.',
    ],
    puntos: [
      'Mediano, C8–T1.',
      'Pareja obligatoria: FDI.',
    ],
    objetivosEn: [
      'Use APB as the median C8–T1 witness and always pair it with FDI.',
    ],
    clinicaEn:
      'Abductor pollicis brevis (APB) is median, C8–T1. CTS, C8 root, lower trunk, and Riche-Cannieu all visit this muscle.',
    tecnicaEn:
      'Palmar abduction, not FPL flexion. Compare with FDI and PQ.',
    perlasEn: [
      'APB alone is not a diagnosis.',
      'Silent APB plus lively FDI is median or anastomosis, not automatically MND.',
    ],
    puntosEn: [
      'Median, C8–T1.',
      'Pair with FDI.',
    ],
  }),

  biceps: pack({
    img: IMG.emg,
    objetivos: [
      'Explorar bíceps como musculocutáneo, C5–C6, plexo superior.',
      'Separar C6 de nervio musculocutáneo con braquiorradial y deltoides.',
    ],
    clinica:
      'Bíceps: musculocutáneo, C5–C6. Plexo superior, C6 y musculocutáneo se parecen en el pliegue del codo. El braquiorradial es radial/C6; el deltoides es axilar/C5–C6.',
    tecnica: [
      'Inserte en el vientre, lejos de la arteria braquial.',
      'Activación: flexión de codo en supinación. Pronación recluta braquial y confunde.',
      'Sume braquiorradial y deltoides antes de decir “C6”.',
    ],
    interpretacion:
      'Bíceps y braquiorradial malos, deltoides bueno: más C6/C7 radial que axilar. Bíceps malo aislado: musculocutáneo.',
    errores: [
      'Pinchar el tendón distal y llamar inserción “fibrosa” a anatomía.',
      'No explorar un músculo radial C6.',
    ],
    perlas: [
      'Supinación distingue bíceps de braquial.',
      'Un C5–C6 se arma con tres músculos, no con uno.',
    ],
    puntos: [
      'Musculocutáneo, C5–C6.',
      'Flexión en supinación.',
    ],
    objetivosEn: [
      'Needle biceps for musculocutaneous and upper-trunk/C5–C6 questions, with brachioradialis and deltoid as neighbors.',
    ],
    clinicaEn:
      'Biceps is musculocutaneous, C5–C6. Deltoid and brachioradialis split plexus, root, and nerve.',
    tecnicaEn:
      'Elbow flexion in supination. Stay out of the brachial artery. Add neighboring C5–C6 muscles.',
    perlasEn: [
      'Supination is biceps.',
      'One muscle is not C6.',
    ],
    puntosEn: [
      'Musculocutaneous, C5–C6.',
      'Three-muscle montage for upper trunk.',
    ],
  }),

  triceps: pack({
    img: IMG.emg,
    objetivos: [
      'Usar cabeza lateral del tríceps como radial, C6–C8.',
      'Comparar con ancóneo y extensores para radial vs raíz vs PIN.',
    ],
    clinica:
      'Tríceps: radial, C6–C8. La cabeza lateral es práctica. El PIN (interóseo posterior) deja tríceps indemne y cae extensores; una C7 puede llevarse tríceps y flexor radial del carpo.',
    tecnica: [
      'Cabeza lateral, posterior al deltoides, lejos del nervio radial en el canal de Holstein-Lewis si va muy alto.',
      'Activación: extensión de codo contra gravedad o resistencia.',
      'Si hay caída de muñeca, añada extensor común y ancóneo.',
    ],
    interpretacion:
      'Tríceps malo + extensores malos + ancóneo malo = radial o C7. Tríceps bueno + extensores malos = PIN.',
    errores: [
      'Llamar PIN a un tríceps denervado.',
      'Confundir cabeza larga (axilar cercano) con lateral.',
    ],
    perlas: [
      'El PIN respeta tríceps.',
      'C7 no es solo “extensores”.',
    ],
    puntos: [
      'Radial, C6–C8.',
      'Tríceps indemne apunta a PIN, no a radial completo.',
    ],
    objetivosEn: [
      'Use lateral triceps to separate radial nerve, C7, and PIN.',
    ],
    clinicaEn:
      'Triceps is radial, C6–C8. PIN spares triceps. C7 may take triceps and FCR.',
    tecnicaEn:
      'Lateral head, elbow extension. Add ECR/EDC and anconeus for wrist drop.',
    perlasEn: [
      'PIN spares triceps.',
      'C7 is not only extensors.',
    ],
    puntosEn: [
      'Radial, C6–C8.',
      'Triceps in the wrist-drop protocol.',
    ],
  }),

  deltoid: pack({
    img: IMG.emg,
    objetivos: [
      'Explorar deltoides medio como axilar, C5–C6, plexo superior y luxación.',
      'No pinchar el pulmón ni el nervio axilar en el cuello quirúrgico.',
    ],
    clinica:
      'Deltoides: axilar, C5–C6. Luxación glenohumeral, plexo superior y C5 se pelean este músculo. El supraespinoso (supraescapular) desempata plexo vs axilar.',
    tecnica: [
      'Cabeza media, 3–4 cm bajo el acromion, dirigido al hueso, no hacia la axila ni el vértice pulmonar.',
      'Activación: abducción en el plano escapular.',
      'Sume supraespinoso e infraespinoso en hombro.',
    ],
    interpretacion:
      'Deltoides malo + supraespinoso bueno = axilar. Ambos malos = plexo superior o C5.',
    errores: [
      'Aguja demasiado baja hacia el radial o demasiado medial hacia pulmón.',
      'Olvidar el supraespinoso.',
    ],
    perlas: [
      'La luxación es la historia clásica del axilar.',
      'El supraespinoso es el hermano que localiza.',
    ],
    puntos: [
      'Axilar, C5–C6.',
      'Lejos del vértice pulmonar.',
    ],
    objetivosEn: [
      'Needle middle deltoid for axillary nerve and upper trunk, safely below the acromion.',
    ],
    clinicaEn:
      'Deltoid is axillary, C5–C6. Dislocation vs upper trunk vs C5 is the usual differential. Supraspinatus splits the question.',
    tecnicaEn:
      '3–4 cm below acromion, toward bone. Abduct in the scapular plane. Add spinati.',
    perlasEn: [
      'Dislocation is the axillary story.',
      'Supraspinatus localizes.',
    ],
    puntosEn: [
      'Axillary, C5–C6.',
      'Stay off the lung apex.',
    ],
  }),

  'forearm-extensors': pack({
    img: IMG.emg,
    objetivos: [
      'Usar extensores del antebrazo (radial/PIN, C7) en caída de muñeca.',
      'Separar C7, radial y PIN con tríceps y supinador.',
    ],
    clinica:
      'Extensor común: radial posterior/PIN, C7. Caída de muñeca vs C7 vs PIN (el supinador puede quedar indemne en PIN distal al arcade de Frohse según el sitio).',
    tecnica: [
      'Vientre dorsal del antebrazo, tercio proximal a medio, activación: extensión de dedos o muñeca.',
      'No cruce al cubital (flexor profundo) por una aguja demasiado medial.',
      'Protocolo de caída de muñeca: tríceps, ancóneo, ECR, EDC, PIN muscles.',
    ],
    interpretacion:
      'Extensores malos + tríceps bueno = PIN. Extensores + tríceps + FCR = piense C7.',
    errores: [
      'Un solo extensor como “radial completo”.',
      'Pinchar el cúbito y creer que es EDC.',
    ],
    perlas: [
      'La caída de muñeca es un protocolo, no un músculo.',
      'C7 incluye flexores radiales; el PIN no.',
    ],
    puntos: [
      'PIN/radial, C7.',
      'Siempre con tríceps.',
    ],
    objetivosEn: [
      'Put forearm extensors in a wrist-drop protocol with triceps to separate PIN, radial, and C7.',
    ],
    clinicaEn:
      'EDC is PIN/radial, C7. PIN spares triceps. C7 may take FCR as well.',
    tecnicaEn:
      'Dorsal proximal-middle forearm, finger/wrist extension. Stay off ulnar deep flexors.',
    perlasEn: [
      'Wrist drop is a protocol.',
      'C7 includes radial wrist flexors; PIN does not.',
    ],
    puntosEn: [
      'PIN/radial, C7.',
      'Always add triceps.',
    ],
  }),

  'cervical-paraspinals': pack({
    img: IMG.emg,
    objetivos: [
      'Usar paraespinales cervicales como testigo preganglionar.',
      'Explorar varios niveles y evitar C2 superficial.',
    ],
    clinica:
      'Denervación paraespinal cervical apoya radiculopatía (preganglionar). El plexo no denerva paraespinales. Explore varios niveles; la inervación posterior es parcheada y un solo sitio miente.',
    tecnica: [
      '2–3 cm lateral a la apófisis, dirigido a lámina, no a canal ni a pulmón en niveles bajos.',
      'Reposo verdadero: la cabeza apoyada. El tono postural finge actividad persistente.',
      'Varios niveles; no declare C6 con un pinchazo en C5.',
    ],
    interpretacion:
      'Fibrilaciones paraespinales + miotoma + SNAP presente = raíz. Paraespinales limpios no excluyen raíz lejana o antigua reinnervada.',
    errores: [
      'Llamar plexo con paraespinales activos.',
      'Actividad de inserción larga por mal reposo.',
    ],
    perlas: [
      'Paraespinales votan por raíz, no por plexo.',
      'El cuello que no descansa no se lee.',
    ],
    puntos: [
      'Preganglionar.',
      'Varios niveles, cabeza apoyada.',
    ],
    objetivosEn: [
      'Treat cervical paraspinals as a preganglionic vote for root, sampled at several levels at true rest.',
    ],
    clinicaEn:
      'Paraspinal fibrillations support radiculopathy and argue against plexus. Patchy posterior rami require several levels.',
    tecnicaEn:
      'Aim to lamina, 2–3 cm off midline. Rest the head. Do not needle toward lung at low cervical levels.',
    perlasEn: [
      'Paraspinals vote for root.',
      'A tense neck is unreadable.',
    ],
    puntosEn: [
      'Preganglionic.',
      'Several levels.',
    ],
  }),

  'tibialis-anterior': pack({
    img: IMG.emg,
    objetivos: [
      'Explorar TA como peroneo profundo, L4–L5, en el protocolo de pie caído.',
      'Separar peroneo, L5, ciático y plexo.',
    ],
    clinica:
      'TA: peroneo profundo, L4–L5. Pie caído: peroneo vs L5 vs ciático vs plexo. El peroneo superficial, el tibial posterior y el glúteo medio desempata.',
    tecnica: [
      'Cuatro dedos bajo la tuberosidad tibial, lateral a la cresta; activación: dorsiflexión.',
      'No atraviese al peroneo largo si busca TA puro.',
      'Protocolo: TA, EHL, peroneos, TP, gastrocnemio, paraespinales L5, SNAP peroneo superficial.',
    ],
    interpretacion:
      'TA + EHL + TP malos, peroneos buenos = L5 más que peroneo. TA + peroneos malos, TP bueno = peroneo.',
    errores: [
      'Cerrar “peroneo” con solo TA.',
      'Olvidar el SNAP peroneo superficial.',
    ],
    perlas: [
      'El tibial posterior es el aliado L5 que el peroneo no lleva.',
      'Pie caído es un protocolo.',
    ],
    puntos: [
      'Peroneo profundo, L4–L5.',
      'Siempre con un músculo tibial L5.',
    ],
    objetivosEn: [
      'Put TA in a foot-drop protocol with an L5 tibial muscle and a superficial peroneal SNAP.',
    ],
    clinicaEn:
      'TA is deep peroneal, L4–L5. TP and gluteus medius pull toward L5; peroneal muscles pull toward nerve.',
    tecnicaEn:
      'Lateral to the tibial crest, dorsiflexion. Add EHL, peronei, TP, L5 paraspinals, and SNAP.',
    perlasEn: [
      'Tibialis posterior is the L5 ally the peroneal nerve does not carry.',
      'Foot drop is a protocol.',
    ],
    puntosEn: [
      'Deep peroneal, L4–L5.',
      'Never TA alone.',
    ],
  }),

  'medial-gastrocnemius': pack({
    img: IMG.emg,
    objetivos: [
      'Usar gastrocnemio medial como tibial, S1–S2, junto al sóleo y el H-reflex.',
      'No pinchar la vena o el tibial en la fosa poplítea.',
    ],
    clinica:
      'Gastrocnemio medial: tibial, S1–S2. Complementa sóleo y H-reflex. Una S1 puede llevarse H, sóleo y gastrocnemio; un tibial de tobillo no.',
    tecnica: [
      'Vientre medial, tercio medio, lejos de la línea media vascular.',
      'Activación: flexión plantar. El paciente en decúbito prono o de lado descansa mejor.',
      'Si la pregunta es S1, añada sóleo, abductor del hallux y H-reflex.',
    ],
    interpretacion:
      'Gastrocnemio y sóleo malos + H ausente + paraespinales S1 = raíz. Solo abductor del hallux = tibial distal o plantar.',
    errores: [
      'Aguja demasiado proximal hacia paquetes vasculares.',
      'Llamar S1 a un H ausente bilateral en un alto.',
    ],
    perlas: [
      'S1 se arma con H + sóleo + paraespinal, no con un gastrocnemio solitario.',
      'El H tiene talla; el gastrocnemio tiene aguja.',
    ],
    puntos: [
      'Tibial, S1–S2.',
      'Pareja: sóleo y H-reflex.',
    ],
    objetivosEn: [
      'Needle medial gastrocnemius as tibial S1–S2 together with soleus and the H-reflex.',
    ],
    clinicaEn:
      'Medial gastrocnemius is tibial, S1–S2. Distal tibial lesions spare the H-reflex circuit more than S1 does.',
    tecnicaEn:
      'Mid medial belly, plantar flexion, off the midline vessels. Add soleus and H-reflex for S1.',
    perlasEn: [
      'S1 is a trio, not one calf muscle.',
      'Height explains some absent H reflexes.',
    ],
    puntosEn: [
      'Tibial, S1–S2.',
      'Pair with soleus and H.',
    ],
  }),

  'vastus-lateralis': pack({
    img: IMG.emg,
    objetivos: [
      'Explorar vasto lateral como femoral, L2–L4.',
      'Separar L3–L4 de neuropatía femoral y de plexo lumbar.',
    ],
    clinica:
      'Vasto lateral: femoral, L2–L4. Radiculopatía lumbar alta vs femoral vs plexo lumbar. El aductor largo es obturador (mismo plexo, otro nervio); el iliopsoas añade raíz alta.',
    tecnica: [
      'Cara anterolateral del muslo, tercio medio, lejos de la arteria femoral medial.',
      'Activación: extensión de rodilla.',
      'Protocolo: VL, recto femoral, aductores, iliopsoas, paraespinales L3–L4, SNAP safeno si aplica.',
    ],
    interpretacion:
      'Cuádriceps malo + aductores buenos = femoral. Cuádriceps + aductores + paraespinales = raíz o plexo (SNAP safeno y clínica de cadera desempata).',
    errores: [
      'Pinchar demasiado medial (paquetes).',
      'Cerrar femoral sin un obturador.',
    ],
    perlas: [
      'El obturador es el testigo que el femoral no lleva.',
      'Rodilla que no extiende pide más que un vasto.',
    ],
    puntos: [
      'Femoral, L2–L4.',
      'Siempre un aductor en el protocolo.',
    ],
    objetivosEn: [
      'Use vastus lateralis in an L3–L4/femoral protocol that includes an obturator muscle.',
    ],
    clinicaEn:
      'Vastus lateralis is femoral, L2–L4. Adductors split femoral nerve from lumbar plexus/root.',
    tecnicaEn:
      'Anterolateral mid-thigh, knee extension, off the femoral bundle. Add adductors and paraspinals.',
    perlasEn: [
      'Obturator is the witness femoral does not carry.',
      'One vastus is not a femoral diagnosis.',
    ],
    puntosEn: [
      'Femoral, L2–L4.',
      'Add an adductor.',
    ],
  }),

  'gluteus-medius': pack({
    img: IMG.emg,
    objetivos: [
      'Explorar glúteo medio como glúteo superior, L4–S1, en plexopatía y L5.',
      'Mantener la aguja lejos de la ciática y del abdomen.',
    ],
    clinica:
      'Glúteo medio: glúteo superior (L4–S1). Pie caído L5 vs peroneo: el glúteo medio no lo lleva el peroneo. Plexopatía lumbosacra y cirugía de cadera también viven aquí.',
    tecnica: [
      'Punto medio entre cresta ilíaca y trocánter, dirigido al hueso, no caudal hacia ciático.',
      'Activación: abducción de cadera. Decúbito lateral ayuda.',
      'En pie caído, TA + EHL + glúteo medio + TP.',
    ],
    interpretacion:
      'Glúteo medio denervado saca la lesión de peroneo y la pone en L5, plexo o glúteo superior.',
    errores: [
      'Aguja demasiado baja (ciático) o demasiado anterior (cavo abdominal en delgados).',
      'Omitirlo en un pie caído “obvio”.',
    ],
    perlas: [
      'El glúteo medio es el L5 que camina en la cadera.',
      'El peroneo no abduce la cadera.',
    ],
    puntos: [
      'Glúteo superior, L4–S1.',
      'Obligatorio en pie caído no trivial.',
    ],
    objetivosEn: [
      'Needle gluteus medius as an L5/superior-gluteal witness that the peroneal nerve does not innervate.',
    ],
    clinicaEn:
      'Gluteus medius is superior gluteal, L4–S1. It pulls foot drop toward L5 or plexus, away from peroneal nerve.',
    tecnicaEn:
      'Between iliac crest and trochanter, toward bone, hip abduction. Stay off sciatic and abdomen.',
    perlasEn: [
      'Peroneal nerve does not abduct the hip.',
      'Gluteus medius is the L5 at the pelvis.',
    ],
    puntosEn: [
      'Superior gluteal, L4–S1.',
      'Include it in non-trivial foot drop.',
    ],
  }),

  ehl: pack({
    img: IMG.emg,
    objetivos: [
      'Usar EHL como peroneo profundo, L5, muy específico del miotoma L5.',
      'Incluirlo en todo pie caído y en toda L5 dudosa.',
    ],
    clinica:
      'Extensor largo del hallux: peroneo profundo, L5. Es de los músculos más específicos de L5. Un EHL denervado con peroneos indemnes empuja a raíz o plexo más que a peroneo común.',
    tecnica: [
      'Dorso del tercio distal de la pierna, lateral a TA, activación: extensión del hallux.',
      'Aguja corta: es un músculo delgado.',
      'Pareja: TA, TP, glúteo medio, paraespinales L5.',
    ],
    interpretacion:
      'EHL + TP + glúteo medio = L5. EHL + TA + peroneos, TP sano = peroneo profundo/común.',
    errores: [
      'Confundir EHL con TA por inserción demasiado proximal.',
      'Dejarlo fuera porque “ya tiene TA”.',
    ],
    perlas: [
      'El hallux es el L5 que se ve en la camilla.',
      'TA no sustituye a EHL.',
    ],
    puntos: [
      'Peroneo profundo, L5.',
      'Músculo delgado: no atraviese.',
    ],
    objetivosEn: [
      'Treat EHL as a high-yield L5 muscle in every foot-drop and L5 protocol.',
    ],
    clinicaEn:
      'EHL is deep peroneal, L5, and among the most myotome-specific L5 muscles.',
    tecnicaEn:
      'Distal lateral dorsum of the leg, hallux extension, short needle. Pair with TA, TP, and gluteus medius.',
    perlasEn: [
      'TA does not replace EHL.',
      'The hallux is bedside L5.',
    ],
    puntosEn: [
      'Deep peroneal, L5.',
      'Thin muscle, shallow needle.',
    ],
  }),

  'lumbar-paraspinals': pack({
    img: IMG.emg,
    objetivos: [
      'Usar paraespinales lumbares como voto preganglionar en L5/S1.',
      'Explorar varios niveles con reposo verdadero, lejos de peritoneo.',
    ],
    clinica:
      'Paraespinales lumbares denervados apoyan radiculopatía. Cirugía de columna previa los vuelve inespecíficos. Un plexo lumbosacro no debería denervar paraespinales.',
    tecnica: [
      '2–3 cm de la línea media, hacia lámina, nunca hacia abdomen. Niveles según la raíz sospechada y uno vecino.',
      'Prone o decúbito lateral con almohada: el lumbar en guardia finge tono.',
      'Si hay cicatriz quirúrgica, infórmelo y no sobreinterprete.',
    ],
    interpretacion:
      'Paraespinales + miotoma + SNAP presente = raíz. Paraespinales sucios aislados tras cirugía no cierran nada.',
    errores: [
      'Un sitio, un nivel, un diagnóstico de L5.',
      'Dirigir la aguja hacia cavidad abdominal.',
    ],
    perlas: [
      'La cirugía previa apaga el valor localizador de los paraespinales.',
      'El plexo no vive en la lámina.',
    ],
    puntos: [
      'Preganglionar lumbar.',
      'Varios niveles, reposo, respeto al peritoneo.',
    ],
    objetivosEn: [
      'Use lumbar paraspinals as a preganglionic root vote, sampled at several levels at rest, and discount them after surgery.',
    ],
    clinicaEn:
      'Lumbar paraspinal fibrillations support radiculopathy. Prior laminectomy makes them nonspecific. Plexus should spare them.',
    tecnicaEn:
      '2–3 cm off midline toward lamina, never toward peritoneum. True rest. Report prior surgery.',
    perlasEn: [
      'Surgery blinds paraspinals.',
      'Plexus is not on the lamina.',
    ],
    puntosEn: [
      'Preganglionic.',
      'Several levels.',
    ],
  }),
};

/** Módulo 13: mismo topic.id que conducción, título distinto. */
export const SAFETY_SHARED_BY_TITLE: Record<string, LessonExpansion> = {
  'supramaximal::Estímulo Supramáximo Riguroso': pack({
    img: IMG.ncs,
    biblio: BIBLIO_NCS,
    objetivos: [
      'Exigir meseta más 20–30% como control de calidad, no como “truco de amplitud”.',
      'Documentar cuando el dolor impide un estímulo honesto.',
    ],
    clinica:
      'En control de calidad, el estímulo supramáximo no es opcional: si no hay meseta, el número de amplitud no es defendible. El margen del 20–30% cubre desplazamiento del cátodo y cambios de impedancia durante el estudio.',
    tecnica: [
      'Registre intensidad de meseta e intensidad final en el protocolo.',
      'Si no hay meseta, no informe “pérdida axonal”; informe limitación técnica.',
      'Repita la meseta si mueve el estimulador o cambia de segmento.',
    ],
    interpretacion:
      'Un CMAP que aún crece es un dato incompleto. El informe de calidad dice “submáximo” o no dice amplitud patológica.',
    errores: [
      'Copiar mA del lado sano sin mirar la meseta del lado enfermo.',
      'Informar amplitud baja sin constancia de meseta.',
    ],
    perlas: [
      'La calidad se demuestra con la meseta, no con un mA alto aislado.',
      'Dolor sin meseta es una limitación, no un diagnóstico.',
    ],
    puntos: [
      'Meseta + 20–30% como norma de laboratorio.',
      'Sin meseta no hay amplitud acreditable.',
    ],
    objetivosEn: [
      'Treat supramaximal plateau as a quality rule: no plateau, no axonal-loss claim.',
    ],
    clinicaEn:
      'Quality control requires a documented plateau plus 20–30%. Pain without plateau is a limitation, not a low CMAP.',
    tecnicaEn:
      'Record plateau current. Repeat after moving the stimulator. Do not report pathologic amplitude without a plateau.',
    perlasEn: [
      'Quality is the plateau.',
      'Unwitnessed milliamps are not supramaximal.',
    ],
    puntosEn: [
      'Plateau + 20–30%.',
      'No plateau, no axonal number.',
    ],
  }),
};
