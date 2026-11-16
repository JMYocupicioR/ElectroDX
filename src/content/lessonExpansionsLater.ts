import type { LessonExpansion } from './lessonExpansions';
import { BIBLIO_BASE, BIBLIO_NCS, IMG, pack } from './lessonExpansionsModules1to3';

const BIBLIO_EP = `${BIBLIO_BASE}
- Aminoff MJ. Electrodiagnosis in Clinical Neurology. Churchill Livingstone; 2012.`;

/** Ampliaciones de módulos 4–13 y hojas cortas de 6–10. No incluye ids compartidos (van por título). */
export const LATER_EXPANSIONS: Record<string, LessonExpansion> = {
  'f-wave-utility': pack({
    img: IMG.ncs,
    biblio: BIBLIO_NCS,
    objetivos: [
      'Usar la onda F como marcador proximal en SGB/CIDP, no como diagnóstico único.',
      'Integrarla con CMAP distal, persistencia y clínica antes de llamar radiculoplexopatía.',
    ],
    clinica:
      'La F recorre todo el axón motor hasta el asta anterior. En Guillain-Barré precoz puede alargarse o ausentarse cuando el CMAP distal aún es nítido. En CIDP aporta cronodispersión y latencia mínima. Una F ausente aislada, con CMAP distal muy bajo, es esperable y no prueba bloqueo proximal.',
    tecnica: [
      'Estímulo supramáximo, cátodo proximal, 10–20 trazos en cascada a ≤0.5 Hz.',
      'Ganancia 200 µV/div. Compare lado a lado y ajuste por talla.',
      'Si no aparecen, pruebe Jendrassik antes de declarar ausencia.',
    ],
    interpretacion:
      'F tardías o ausentes en varios nervios con CMAP conservado empujan a desmielinización proximal. Una sola F de peroneo ausente en un sano no es patología.',
    errores: [
      'Diagnosticar SGB por una F de peroneo sola.',
      'Llamar bloqueo proximal a F ausente cuando el CMAP distal ya es mínimo.',
    ],
    perlas: [
      'La F ve el camino entero; no nombra el kilómetro lesionado.',
      'En SGB mire las F el día 1, no solo la latencia distal.',
    ],
    puntos: [
      'Marcador proximal sensible, no patognomónico.',
      'Ausencia aislada no diagnostica.',
    ],
    objetivosEn: [
      'Use F waves as a proximal marker in GBS/CIDP, never as a standalone diagnosis.',
    ],
    clinicaEn:
      'F waves sample the entire motor axon. Early GBS may show late or absent F waves with a still-normal distal CMAP. Isolated absence with a tiny CMAP is expected, not proximal block.',
    tecnicaEn:
      'Supramaximal, cathode proximal, 10–20 traces. Height-adjust. Jendrassik before calling absent.',
    perlasEn: [
      'The F wave names the road, not the mile marker.',
      'Look at F waves on day 1 of GBS.',
    ],
    puntosEn: [
      'Sensitive proximal marker.',
      'Isolated absence is not a diagnosis.',
    ],
  }),

  'f-wave-physiology': pack({
    img: IMG.action,
    biblio: BIBLIO_NCS,
    objetivos: [
      'Explicar por qué la F no es un reflejo: circuito motor puro, 1–5% de fibras.',
      'Relacionar la descarga recurrente del asta anterior con la variabilidad de cada trazo.',
    ],
    clinica:
      'Un estímulo antidrómico llega a la motoneurona y una fracción dispara de vuelta. No hay sinapsis sensitiva. Por eso cada F cambia de forma: recluta otro 1–5% del pool. Eso la distingue del H (Ia–motoneurona) y de la A (reflejo axónico).',
    tecnica: [
      'No busque un “reflejo” con estímulo submáximo: la F pide supramáximo.',
      'Si todas las F son idénticas, no está viendo fisiología normal: son repeaters.',
    ],
    interpretacion:
      'Variabilidad de latencia y morfología es normal. Estereotipia es pérdida de pool.',
    errores: [
      'Llamar reflejo a la F en el informe.',
      'Promediar F como si fuera un CMAP.',
    ],
    perlas: [
      'Si no varía, el pool se acabó.',
      'No hay sinapsis: no hay “arco”.',
    ],
    puntos: [
      'Circuito motor puro.',
      '1–5% de fibras por estímulo.',
    ],
    objetivosEn: [
      'Treat the F wave as recurrent motor discharge, not a reflex.',
    ],
    clinicaEn:
      'Antidromic motor volley, anterior-horn backfiring, 1–5% of fibers. No sensory synapse. Variability is physiology.',
    tecnicaEn:
      'Supramaximal, not H-reflex intensity. Identical F waves are repeaters, not “pretty traces”.',
    perlasEn: [
      'If it never changes, the pool is small.',
      'No synapse, no reflex.',
    ],
    puntosEn: [
      'Pure motor loop.',
      'Do not average F waves like CMAPs.',
    ],
  }),

  'f-wave-technique': pack({
    img: IMG.ncs,
    biblio: BIBLIO_NCS,
    objetivos: [
      'Configurar supramáximo, cátodo proximal, ganancia 200 µV/div y 10–20 trazos.',
      'Usar Jendrassik antes de declarar F ausente.',
    ],
    clinica:
      'La técnica de F es la inversa del H: quiere todas las motoras, no las Ia. Cátodo proximal evita bloqueo anódico. Frecuencia ≤0.5 Hz reduce habituación y dolor.',
    tecnica: [
      'Gire el estimulador: cátodo hacia la médula.',
      'Barrido 5–10 ms/div en brazo, más amplio en pierna.',
      'Si el CMAP distal es diminuto, no persiga F: no habrá señal.',
    ],
    interpretacion:
      'Persistencia se calcula sobre el número de estímulos dados, no sobre los “bonitos”.',
    errores: [
      'Estímulo submáximo (obtiene A u H, no F).',
      'Cátodo distal y llamar latencia larga a un bloqueo anódico.',
    ],
    perlas: [
      'Puño contralateral antes que “F ausente”.',
      'El peroneo sano puede no dar F.',
    ],
    puntos: [
      'Supramáximo, cátodo proximal.',
      '10–20 trazos, no tres.',
    ],
    objetivosEn: [
      'Record F waves with cathode proximal, supramaximal shocks, and 10–20 traces.',
    ],
    clinicaEn:
      'F technique is the opposite of H: all motor axons, not Ia. Slow rate, high gain, proximal cathode.',
    tecnicaEn:
      '200 µV/div, ≤0.5 Hz, Jendrassik before absent. Skip the hunt if distal CMAP is already gone.',
    perlasEn: [
      'Healthy peroneal F waves may be absent.',
      'Submaximal shocks yield A or H, not F.',
    ],
    puntosEn: [
      'Cathode proximal.',
      'Count persistence over all stimuli.',
    ],
  }),

  'f-latencies': pack({
    img: IMG.ncs,
    biblio: BIBLIO_NCS,
    objetivos: [
      'Priorizar latencia mínima y ajustarla a la talla.',
      'Medir persistencia y cronodispersión sobre 10–20 trazos.',
    ],
    clinica:
      'La latencia mínima refleja las fibras más rápidas (brazo ~≤31–32 ms, pierna ~≤56 ms, según talla). Persistencia normal 80–100% en mediano/cubital/tibial. Cronodispersión <4 ms en miembro superior y <6 ms en inferior. El peroneo es la excepción.',
    tecnica: [
      'Mida talla. No use un corte único de 32 ms en alguien de 1.90 m.',
      'Marque el primer despegue reproducible, no el artefacto.',
      'Cronodispersión = F máxima − F mínima del mismo nervio.',
    ],
    interpretacion:
      'Una mínima tardía en varios nervios pinta desmielinización. Persistencia baja con repeaters pinta pool reducido.',
    errores: [
      'Norma de adulto joven en un alto o un octogenario.',
      'Cronodispersión con solo 4 trazos.',
    ],
    perlas: [
      'La talla entra al informe de las F.',
      'Mínima > persistencia > cronodispersión, en ese orden de fiabilidad.',
    ],
    puntos: [
      'Mínima ajustada a talla.',
      'Peroneo puede faltar en sanos.',
    ],
    objetivosEn: [
      'Height-adjust minimal F latency; measure persistence and chronodispersion on 10–20 traces.',
    ],
    clinicaEn:
      'Minimal latency tracks the fastest axons. Persistence and chronodispersion need a real cascade, not four sweeps.',
    tecnicaEn:
      'Record height. Mark true takeoff. Chronodispersion is max minus min on the same nerve.',
    perlasEn: [
      'Height belongs in the F report.',
      'Minimal latency is the most reliable F number.',
    ],
    puntosEn: [
      'Do not use one 32 ms cutoff for every height.',
      'Peroneal F may be absent in health.',
    ],
  }),

  'h-reflex-physiology': pack({
    img: IMG.ncs,
    biblio: BIBLIO_NCS,
    objetivos: [
      'Tratar el H como el análogo eléctrico del Aquiles: Ia, S1, estímulo submáximo.',
      'No confundirlo con una F tardía.',
    ],
    clinica:
      'El H es un reflejo verdadero: Ia del tibial a motoneurona de sóleo/S1. Se obtiene con estímulo submáximo; al subir intensidad aparece la M y el H se colisiona. Por eso la técnica es la inversa de la F.',
    tecnica: [
      'Paciente prono, rodilla semiflexionada, cátodo proximal en poplíteo.',
      'Suba mA hasta el H máximo y párese antes de que la M lo coma.',
      'Compare lados, no un valor absoluto aislado.',
    ],
    interpretacion:
      'H ausente unilateral con M nítida apoya S1 o tibial proximal. H ausente bilateral en un alto puede ser norma, no dos radiculopatías.',
    errores: [
      'Estímulo supramáximo “para que salga mejor”.',
      'Llamar H a una F de sóleo.',
    ],
    perlas: [
      'El H se busca con poco, no con mucho.',
      'La colisión con M es fisiología, no fallo del aparato.',
    ],
    puntos: [
      'Ia–S1, submáximo.',
      'Lateralidad > número absoluto.',
    ],
    objetivosEn: [
      'Record the H reflex as a true Ia–S1 reflex at submaximal intensity.',
    ],
    clinicaEn:
      'H is Achilles in electrical form. Submaximal. When M grows, H collides and vanishes. That is not an F wave.',
    tecnicaEn:
      'Prone, cathode proximal in the popliteal fossa, stop at maximal H before M eats it. Compare sides.',
    perlasEn: [
      'Hunt H with less current, not more.',
      'M-collision is physiology.',
    ],
    puntosEn: [
      'True reflex, unlike F.',
      'Side-to-side beats a single cutoff.',
    ],
  }),

  'h-reflex-technique-collision': pack({
    img: IMG.ncs,
    biblio: BIBLIO_NCS,
    objetivos: [
      'Demostrar la colisión H–M y no informar un H “bloqueado” por exceso de intensidad.',
      'Mantener cátodo proximal y reposo muscular.',
    ],
    clinica:
      'Al crecer la M, el volley ortodrómico choca con el H que baja. El H desaparece. Un técnico que “sube un poco más” mata el reflejo y finge S1.',
    tecnica: [
      'Curva reclutamiento: H aparece primero, crece, luego cae cuando M crece.',
      'Relaje el sóleo; la contracción facilita o desordena el H.',
      'Misma distancia y ángulo de rodilla en ambos lados.',
    ],
    interpretacion:
      'Si el H desapareció al mismo tiempo que la M se hizo supramáxima, era colisión, no radiculopatía.',
    errores: [
      'Informar ausencia de H sin mostrar la curva de reclutamiento.',
      'Comparar un lado relajado con el otro en punta de pie.',
    ],
    perlas: [
      'La curva H–M es el trazado, no un clic.',
      'Rodilla y reposo son parte de la medida.',
    ],
    puntos: [
      'Colisión ≠ S1.',
      'Submáximo a propósito.',
    ],
    objetivosEn: [
      'Show the H–M collision curve so missing H is not just overstimulation.',
    ],
    clinicaEn:
      'As M grows, it collides with the descending H. That looks like an absent reflex if you only store the last sweep.',
    tecnicaEn:
      'Recruitment curve, relaxed soleus, matched knee angle. Do not report absent H from a supramaximal frame.',
    perlasEn: [
      'The H–M curve is the study.',
      'Rest and knee angle are data.',
    ],
    puntosEn: [
      'Collision is not S1.',
      'Save the submaximal frame.',
    ],
  }),

  'h-reflex-values-utilty': pack({
    img: IMG.ncs,
    biblio: BIBLIO_NCS,
    objetivos: [
      'Usar asimetría >1.5 ms o ausencia unilateral, no un corte único.',
      'No sustituir la aguja de S1 por un H.',
    ],
    clinica:
      'H tibial-sóleo: compare lados. Asimetría de latencia >1.5 ms o ausencia unilateral con M presente apoya S1. El H no ve paraespinales ni distingue S1 crónica reinnervada de una técnica pobre.',
    tecnica: [
      'Documente talla, temperatura y lado.',
      'Si el H falta al lado sintomático y vive al sano, priorice aguja en sóleo, gastrocnemio y paraespinales S1.',
      'No use H de flexores del carpo como equivalente de S1.',
    ],
    interpretacion:
      'H útil al inicio de S1, cuando la aguja aún está callada. H simétrico no cierra una lumbociática.',
    errores: [
      'H ausente bilateral = “S1 bilateral” en un paciente alto.',
      'Omitir la aguja porque el H “ya dijo”.',
    ],
    perlas: [
      'El H es un voto, no el veredicto de S1.',
      'Unilateral importa; bilateral pide talla y edad.',
    ],
    puntos: [
      'Asimetría >1.5 ms o ausencia unilateral.',
      'La EMG de S1 sigue siendo necesaria.',
    ],
    objetivosEn: [
      'Prefer side-to-side H latency (>1.5 ms or unilateral absence) over a single cutoff, and still needle S1.',
    ],
    clinicaEn:
      'Soleus H is an S1 vote. It does not replace paraspinals. Bilateral absence in a tall adult is not two roots.',
    tecnicaEn:
      'Record height and temperature. Pair an asymmetric H with soleus, gastrocnemius, and S1 paraspinals.',
    perlasEn: [
      'H is a vote, not the S1 verdict.',
      'Unilateral matters more than bilateral.',
    ],
    puntosEn: [
      '>1.5 ms side difference or unilateral absence.',
      'Still do the needle.',
    ],
  }),

  'a-wave-pathophysiology': pack({
    img: IMG.ncs,
    biblio: BIBLIO_NCS,
    objetivos: [
      'Separar onda A (reflejo axónico / ephapse) de F y de H.',
      'Usarla como pista de desmielinización o regeneración, no como latencia F.',
    ],
    clinica:
      'La A es estereotipada, de latencia intermedia entre M y F, y suele aparecer a intensidad menor que la F. Traduce ephapse o un ramal axónico. Es frecuente en CIDP, SGB y regeneración; no es una F “bonita”.',
    tecnica: [
      'Observe si la onda es idéntica trazo a trazo y si aparece antes de la F mínima.',
      'Baje un poco la intensidad: la A a menudo sobrevive cuando la F aún no.',
      'No la incluya en la cronodispersión de F.',
    ],
    interpretacion:
      'A frecuentes en varios nervios apoyan desmielinización adquirida. Una A aislada en un nervio entrapment no es CIDP.',
    errores: [
      'Medir la A como F mínima.',
      'Llamar repeater de F a una A (la A es más temprana y constante).',
    ],
    perlas: [
      'Si no cambia nunca y llega antes que la F, es A.',
      'Ephapse es anatomía herida, no un artefactito.',
    ],
    puntos: [
      'Estereotipada, entre M y F.',
      'No entra al cálculo de F.',
    ],
    objetivosEn: [
      'Keep A waves out of F-latency math; they mark ephapse or axonal sprouting.',
    ],
    clinicaEn:
      'A waves are stereotyped, between M and F, often at lower intensity. Common in acquired demyelination and regeneration.',
    tecnicaEn:
      'Identical trace to trace, earlier than Fmin, survives at lower intensity. Do not add them to F chronodispersion.',
    perlasEn: [
      'If it never changes and beats Fmin, it is A.',
      'Do not call it a pretty F wave.',
    ],
    puntosEn: [
      'Stereotyped, mid-latency.',
      'Not an F-wave parameter.',
    ],
  }),

  'blink-technique': pack({
    img: IMG.ncs,
    biblio: BIBLIO_BASE,
    objetivos: [
      'Montar estímulo supraorbitario y registro en orbicularis oculi.',
      'Obtener R1 ipsilateral y R2 bilateral.',
    ],
    clinica:
      'R1 (oligosináptico, ~10–13 ms) viaja V1 → núcleo → VII ipsilateral. R2 (polisináptico, ~30–40 ms) es bilateral y pasa por puente/bulbo. Sirve para V1, VII y tegmento, no para un “facial de nasalis”.',
    tecnica: [
      'G1 en orbicular inferior, tierra en mentón, estímulo en supraorbitario.',
      'Estímulo breve; compare lados. Relaje la frente.',
      'Si R1 falta de un lado y R2 ipsilateral también, piense VII o V1 de ese lado; si R2 contralateral falta, piense vía cruzada de puente.',
    ],
    interpretacion:
      'Patrones: atraso de R1 unilateral (VII o V1), R2 bilateral tardío (tronco), R1 nítido con R2 ausente (vía polisináptica).',
    errores: [
      'Co-estimular VII directo y llamarlo R1.',
      'Informar blink como CMAP de masetero.',
    ],
    perlas: [
      'R1 es el cable corto; R2 es el mapa del tronco.',
      'El paciente debe dejar de apretar los ojos.',
    ],
    puntos: [
      'R1 ipsi, R2 bilateral.',
      'No es el estudio motor del VII de nasalis.',
    ],
    objetivosEn: [
      'Record ipsilateral R1 and bilateral R2 from supraorbital stimulation.',
    ],
    clinicaEn:
      'R1 is oligosynaptic V1–VII. R2 is bilateral and brainstem-rich. Direct VII co-stimulation is not R1.',
    tecnicaEn:
      'Infraorbital orbicularis pickup, supraorbital cathode, relaxed face, side-to-side.',
    perlasEn: [
      'R1 is the short cable; R2 is the brainstem map.',
      'Do not co-stimulate facial nerve and call it R1.',
    ],
    puntosEn: [
      'R1 ipsi, R2 both sides.',
      'Not a nasalis facial CMAP.',
    ],
  }),

  'trigeminal-facial-pathway': pack({
    img: IMG.ncs,
    biblio: BIBLIO_BASE,
    objetivos: [
      'Dibujar V1 aferente, núcleos del trigémino y VII eferente.',
      'Usar el blink para tronco, no para plexo braquial.',
    ],
    clinica:
      'La vía del parpadeo no baja al plexo. Un plexo enfermo con blink nítido es coherente. Un R1 tardío con masetero nítido apunta a VII distal o a V1, no a C5.',
    tecnica: [
      'Si la pregunta es plexo, no pierda el tiempo en blink salvo que haya cara o córnea.',
      'Si la pregunta es tronco o Guillain-Barré facial, el blink sí entra.',
    ],
    interpretacion:
      'Blink normal no localiza miembro superior. Blink anormal no explica un FDI.',
    errores: [
      'Meter blink en un protocolo de túnel carpiano.',
      'Olvidarlo en una parálisis facial + disestesias V1.',
    ],
    perlas: [
      'El blink no viaja por el plexo.',
      'Cara y mano son mapas distintos.',
    ],
    puntos: [
      'V1–tronco–VII.',
      'No es un estudio de C5–T1.',
    ],
    objetivosEn: [
      'Keep the blink pathway in the face and brainstem, off the brachial plexus.',
    ],
    clinicaEn:
      'Blink does not travel through the plexus. A delayed R1 with a healthy masseter is VII or V1, not C5.',
    tecnicaEn:
      'Add blink for face, cornea, or brainstem questions—not for carpal tunnel.',
    perlasEn: [
      'Blink is not a plexus test.',
      'Face and hand are different maps.',
    ],
    puntosEn: [
      'V1–brainstem–VII.',
      'Normal blink does not clear a hand.',
    ],
  }),

  'uremic-neuropathy': pack({
    img: IMG.ncs,
    biblio: BIBLIO_NCS,
    objetivos: [
      'Reconocer el patrón axonal distal-simétrico con SNAP primero.',
      'No esperar milagro electrofisiológico solo con diálisis.',
    ],
    clinica:
      'La neuropatía urémica es axonal, distal y simétrica: sural y mediano sensitivo caen antes que los CMAP. La diálisis puede estabilizar; el trasplante mejora más. Un bloqueo o una cronodispersión grosera pide otro diagnóstico (CIDP, amiloide).',
    tecnica: [
      'Dos nervios sensitivos y dos motores en dos extremidades, temperatura incluida.',
      'Compare con estudios previos post-diálisis, no con un único corte.',
      'Aguja en distal si hay CMAP bajo: denervación crónica es la regla.',
    ],
    interpretacion:
      'Axonal simétrico en un dializado es urémica hasta que un nervio demuestre desmielinización adquirida.',
    errores: [
      'Llamar CIDP a latencias un poco largas en un urémico frío.',
      'Omitir SNAP de pies porque “ya se sabe”.',
    ],
    perlas: [
      'SNAP primero, CMAP después, bloqueo casi nunca.',
      'El trasplante es la terapéutica neurofisiológica, no un mA más.',
    ],
    puntos: [
      'Axonal distal-simétrica.',
      'Trasplante > diálisis para el nervio.',
    ],
    objetivosEn: [
      'Read uremic neuropathy as length-dependent axonal disease, SNAP first, not as CIDP.',
    ],
    clinicaEn:
      'Uremia is axonal and symmetric. Dialysis may stabilize; transplant helps more. Frank block or dispersion is another disease.',
    tecnicaEn:
      'Two sensory and two motor nerves, two limbs, warm. Compare with prior post-dialysis studies.',
    perlasEn: [
      'SNAP first, CMAP later, block almost never.',
      'Do not call CIDP on a cold dialysis patient.',
    ],
    puntosEn: [
      'Length-dependent axonal.',
      'Transplant beats dialysis for the nerve.',
    ],
  }),

  'block-vs-dispersion': pack({
    img: IMG.ncs,
    biblio: BIBLIO_NCS,
    objetivos: [
      'Aplicar el criterio estricto: bloqueo = caída de amplitud/área >50% con duración proximal <30% extra.',
      'Llamar dispersión cuando la duración crece >30% y el área se sostiene mejor que la amplitud.',
    ],
    clinica:
      'El bloqueo verdadero es desincronización insuficiente: las fibras no llegan. La dispersión temporal es desincronización grosera de velocidades (CIDP adquirida). Martin-Gruber, frío y distancia imitan ambos.',
    tecnica: [
      'Mida amplitud, área y duración del negativo en distal y proximal.',
      'Descarte anastomosis y co-estimulación antes del adjetivo.',
      'En cubital a través del codo, busque Martin-Gruber.',
    ],
    interpretacion:
      'Bloqueo focal fuera de atrapamiento empuja a CIDP/MMN/GBS. Dispersión marcada sin bloqueo sigue siendo desmielinización adquirida.',
    errores: [
      'Usar solo amplitud pico-pico sin duración.',
      'Operar un codo por un “bloqueo” que era Martin-Gruber.',
    ],
    perlas: [
      'Área y duración salvan a la amplitud de mentir.',
      'AANEM pide los tres números, no un adjetivo.',
    ],
    puntos: [
      'Bloqueo: amplitud/área ↓, duración ~estable.',
      'Dispersión: duración ↑.',
    ],
    objetivosEn: [
      'Separate true conduction block from temporal dispersion with amplitude, area, and duration.',
    ],
    clinicaEn:
      'Block: >50% amplitude/area drop with <30% duration increase. Dispersion: duration up, area better preserved. Martin-Gruber first at the elbow.',
    tecnicaEn:
      'Measure negative-peak duration both sites. Exclude anastomosis and co-stimulation.',
    perlasEn: [
      'Area and duration keep amplitude honest.',
      'Do not operate a Martin-Gruber.',
    ],
    puntosEn: [
      'Three numbers, one adjective.',
      'Acquired demyelination loves dispersion.',
    ],
  }),

  'cmt-others': pack({
    img: IMG.ncs,
    biblio: BIBLIO_NCS,
    objetivos: [
      'No forzar CMT1 o CMT2 cuando el patrón es intermedio, X-linked o hipomiélinico grave.',
      'Pedir genética con el patrón, no con un solo nervio.',
    ],
    clinica:
      'CMT intermedio (CMT-DI), CMTX (GJB1) y formas severas infantiles no caben en “desmielinizante vs axonal” de un mediano. CMTX puede ser asimétrica y más dura en hombres. No hay bloqueo típico de CIDP.',
    tecnica: [
      'Cuatro extremidades, SNAP y CMAP, y un nervio que no sea solo mediano entrapment.',
      'Busque simetría de larga data y pies cavos; no inching de CIDP como primer paso.',
    ],
    interpretacion:
      'Velocidades intermedias (25–45 m/s) + cronicidad infantil = espectro CMT, no CIDP reciente.',
    errores: [
      'Inmunoglobulina por un CMTX llamado CIDP.',
      'Un solo mediano lento en muñeca como “CMT”.',
    ],
    perlas: [
      'Intermedio no es indecisión: es un gen.',
      'Sin bloqueo, piense hereditario antes que adquirido.',
    ],
    puntos: [
      'CMTX, intermedias y severas tienen mapa propio.',
      'Genética después del patrón, no al revés.',
    ],
    objetivosEn: [
      'Keep intermediate, X-linked, and severe CMT off the CIDP protocol.',
    ],
    clinicaEn:
      'CMT-DI, CMTX, and severe infantile forms are not “median-only CIDP”. CMTX may be asymmetric in men. True block is uncommon.',
    tecnicaEn:
      'Four limbs, long-standing symmetry, skip CIDP inching as the first move.',
    perlasEn: [
      'Intermediate velocity is a gene, not indecision.',
      'No block: think hereditary.',
    ],
    puntosEn: [
      'Do not IVIG a CMTX.',
      'One slow median is not CMT.',
    ],
  }),

  cmt2: pack({
    img: IMG.ncs,
    biblio: BIBLIO_NCS,
    objetivos: [
      'Leer CMT2 como axonal crónico simétrico, velocidades conservadas.',
      'Separarlo de axonopatía tóxica aguda y de neuronopatía.',
    ],
    clinica:
      'CMT tipo 2: amplitudes bajas, VCM relativamente conservada, pies cavos de años, historia familiar a menudo. No hay bloqueo. La aguja muestra unidades grandes crónicas distales, no un brote de fibrilaciones de tres semanas.',
    tecnica: [
      'SNAP sural y mediano, CMAP tibial y peroneo, bilaterales.',
      'Si hay fibrilaciones floridas agudas, no cierre CMT2 el día 1.',
    ],
    interpretacion:
      'Axonal largo + familia o pies cavos = CMT2 hasta genética. Axonal agudo doloroso = otra cosa.',
    errores: [
      'Llamar CMT2 a una vasculitis de tres meses.',
      'Esperar velocidades de CMT1.',
    ],
    perlas: [
      'CMT2 es cantidad de axón, no reloj de mielina.',
      'La crónica se ve en los pies, no solo en el trazo.',
    ],
    puntos: [
      'Amplitud ↓, velocidad ~ok.',
      'Sin bloqueo.',
    ],
    objetivosEn: [
      'Read CMT2 as chronic axonal disease with relatively preserved CV.',
    ],
    clinicaEn:
      'Low amplitudes, spared velocities, years of foot deformity, rare block. Florid acute fibrillations argue against a first-day CMT2 call.',
    tecnicaEn:
      'Bilateral foot and hand SNAPs/CMAPs. Do not expect CMT1 slowing.',
    perlasEn: [
      'CMT2 is axon count, not myelin timing.',
      'Acute painful axonal is not CMT2.',
    ],
    puntosEn: [
      'Amplitude down, CV relatively kept.',
      'No conduction block.',
    ],
  }),

  hna: pack({
    img: IMG.emg,
    biblio: BIBLIO_BASE,
    objetivos: [
      'Distinguir neuralgia amiotrófica hereditaria (HNA) de Parsonage-Turner esporádico.',
      'Mapear plexo superior y nervios sensitivos que cruzan el tronco.',
    ],
    clinica:
      'HNA (SEPT9) da ataques de plexopatía dolorosa, a menudo recurrentes y familiares. El laboratorio muestra SNAPs bajos del tronco afectado y denervación parcheada (supraescapular, axilar, interóseo anterior). No es una C5 “limpia”.',
    tecnica: [
      'SNAP de radial superficial, mediano lateral y cubital; aguja en supraespinoso, deltoides, serrato si hay ala, AIN.',
      'Pregunte por partos, cirugías y familiares con hombro caído.',
    ],
    interpretacion:
      'Ataques recurrentes + familia + plexo parcheado = HNA. Un solo ataque = Parsonage-Turner hasta genética.',
    errores: [
      'Radiculopatía C5 porque duele el cuello (el cuello duele menos que el hombro en HNA).',
      'Omitir nervios largos (torácico largo, AIN).',
    ],
    perlas: [
      'El dolor es de hombro, no de dermatoma de libro.',
      'Parcheado es el sello del plexo inflamatorio.',
    ],
    puntos: [
      'Plexo parcheado, SNAPs bajos.',
      'Recurrencia y familia definen HNA.',
    ],
    objetivosEn: [
      'Map patchy upper-trunk/plexus attacks and use recurrence plus family to separate HNA from sporadic neuralgic amyotrophy.',
    ],
    clinicaEn:
      'HNA (SEPT9) is recurrent painful patchy plexopathy. SNAPs fall. Long thoracic and AIN are fair game. It is not a tidy C5 root.',
    tecnicaEn:
      'Sensory SNAPs of the trunk, spinati, deltoid, serratus, AIN. Ask about family and prior attacks.',
    perlasEn: [
      'Shoulder pain, not a textbook dermatome.',
      'Patchy is the point.',
    ],
    puntosEn: [
      'Recurrent + family = HNA.',
      'One attack is still NA until proven otherwise.',
    ],
  }),

  'suprascapular-neuropathy': pack({
    img: IMG.emg,
    biblio: BIBLIO_BASE,
    objetivos: [
      'Separar supraescapular (escotadura vs espinoglenoidea) de C5 y de axilar.',
      'Aguja en supraespinoso e infraespinoso.',
    ],
    clinica:
      'La neuropatía supraescapular en la escotadura lleva supra e infra; en el receso espinoglenoideo (quiste) suele llevar solo infraespinoso. El deltoides (axilar) y el bíceps (C5–C6) desempatan raíz y plexo.',
    tecnica: [
      'Aguja en ambos espinosos; compare deltoides y bíceps.',
      'NCS de supraescapular si el laboratorio lo tiene; si no, la aguja localiza.',
      'Resonancia o US si sospecha quiste.',
    ],
    interpretacion:
      'Infraespinoso solo = distal a la espina. Ambos espinosos + deltoides sano = supraescapular, no axilar.',
    errores: [
      'Llamar C5 a unos espinosos con deltoides nítido.',
      'Pinchar solo supraespinoso.',
    ],
    perlas: [
      'El quiste de la muesca espinoglenoidea respeta el supraespinoso a menudo.',
      'El deltoides es el hermano axilar.',
    ],
    puntos: [
      'Escotadura: supra + infra.',
      'Espinoglenoidea: infra.',
    ],
    objetivosEn: [
      'Split suprascapular notch vs spinoglenoid notch with supra- and infraspinatus, and spare deltoid.',
    ],
    clinicaEn:
      'Notch: both spinati. Spinoglenoid cyst: often infraspinatus only. Healthy deltoid argues against axillary and against a full C5 root.',
    tecnicaEn:
      'Needle both spinati plus deltoid and biceps. Imaging if a cyst is likely.',
    perlasEn: [
      'Do not call C5 if deltoid is clean.',
      'One spinatus is not enough.',
    ],
    puntosEn: [
      'Notch vs spinoglenoid is two muscles.',
      'Axillary is deltoid.',
    ],
  }),

  wavelet: pack({
    img: IMG.emg,
    biblio: BIBLIO_BASE,
    objetivos: [
      'Situar la transformada wavelet como herramienta de investigación de señales EMG, no como botón clínico cotidiano.',
      'No sustituir reclutamiento y morfología de PUM por un espectrograma.',
    ],
    clinica:
      'Wavelet descompone la EMG en tiempo-frecuencia. Puede ayudar a separar ruido, MUAP y transitorios en investigación o prótesis. En el informe clínico de radiculopatía no aporta un criterio AANEM. El laboratorio docente debe saber que existe y que no reemplaza al oído ni a la aguja.',
    tecnica: [
      'Si el equipo ofrece análisis wavelet, úselo como complemento cuantitativo, con las mismas reglas de reposo y esfuerzo.',
      'Archive el trazo crudo; un mapa de color no se reinterpreta dentro de un año.',
    ],
    interpretacion:
      'Un “wavelet anormal” sin PUM ni reclutamiento no se informa como diagnóstico.',
    errores: [
      'Cerrar miopatía por un espectrograma.',
      'Olvidar ganancia y reposo porque el software “ya filtra”.',
    ],
    perlas: [
      'La wavelet no pincha el músculo.',
      'Tiempo-frecuencia es investigación; el PUM es clínica.',
    ],
    puntos: [
      'Complemento, no criterio.',
      'El trazo crudo manda.',
    ],
    objetivosEn: [
      'Treat wavelet EMG as a research/signal tool, not an AANEM diagnosis button.',
    ],
    clinicaEn:
      'Wavelets map EMG in time–frequency. They do not replace MUP morphology or recruitment in a radiculopathy report.',
    tecnicaEn:
      'Keep rest and effort rules. Archive the raw trace. Do not diagnose from a colormap alone.',
    perlasEn: [
      'Wavelets do not needle the muscle.',
      'Raw trace still wins.',
    ],
    puntosEn: [
      'Adjunct, not a criterion.',
      'No colormap-only reports.',
    ],
  }),

  'f-wave-tables': pack({
    img: IMG.ncs,
    biblio: BIBLIO_NCS,
    objetivos: [
      'Usar cortes de F mínima por nervio y talla, no de memoria.',
      'Recordar persistencia y cronodispersión como criterios asociados.',
    ],
    clinica:
      'Mediano <31 ms, cubital <32 ms, tibial <56 ms son órdenes de magnitud para adultos de talla media. >170 cm desplaza el corte. Persistencia <50% en brazo o cronodispersión >10 ms es anormal si el CMAP existe.',
    tecnica: [
      'Anote talla al lado de la tabla.',
      'No compare un tibial de 1.55 m con el corte de 1.90 m.',
    ],
    interpretacion:
      'La tabla no gana a un CMAP distal ausente: sin M no hay F interpretable.',
    errores: [
      'Aplicar el corte de mediano al tibial.',
      'Declarar radiculopatía por una F de peroneo ausente.',
    ],
    perlas: [
      'La tabla entra con la talla o no entra.',
      'Peroneo es el nervio más tramposo de la F.',
    ],
    puntos: [
      'Cortes por nervio y talla.',
      'Sin M, no interprete F.',
    ],
    objetivosEn: [
      'Use nerve- and height-specific F-wave cutoffs from the table, not memory.',
    ],
    clinicaEn:
      'Median ~<31 ms, ulnar ~<32 ms, tibial ~<56 ms for average height. Shift for >170 cm. No M, no F.',
    tecnicaEn:
      'Write height next to the table. Do not use median cutoffs on tibial.',
    perlasEn: [
      'Peroneal F is the trickster.',
      'The table travels with height.',
    ],
    puntosEn: [
      'Nerve-specific cuts.',
      'Absent M voids F.',
    ],
  }),

  'h-reflex-tables': pack({
    img: IMG.ncs,
    biblio: BIBLIO_NCS,
    objetivos: [
      'Leer H de sóleo con talla, edad y lado a lado (>1.5 ms).',
      'Usar H/M 0.3–0.7 como contexto, no como diagnóstico.',
    ],
    clinica:
      'Latencia H de sóleo suele <34 ms en talla media y es estrictamente estatura-dependiente. Asimetría >1.5 ms pesa más que un absoluto. H/M baja en neuropatía; alta puede verse en spasticidad, no en el informe de túnel tarsiano.',
    tecnica: [
      'Misma talla, misma temperatura, ambos lados.',
      'No copie un valor de libro si no midió la talla.',
    ],
    interpretacion:
      'Tabla + asimetría + aguja S1. La tabla sola no opera a nadie.',
    errores: [
      'H/M como prueba de radiculopatía.',
      'Un corte de 34 ms en un jugador de básquet.',
    ],
    perlas: [
      '1.5 ms entre lados vale más que 34 ms absolutos.',
      'H/M es excitabilidad, no un túnel.',
    ],
    puntos: [
      'Talla y lateralidad.',
      'H/M es contexto.',
    ],
    objetivosEn: [
      'Read soleus H with height, age, and >1.5 ms side difference; treat H/M as excitability, not diagnosis.',
    ],
    clinicaEn:
      'Soleus H latency is height-locked. Side-to-side >1.5 ms outranks a 34 ms memory. H/M is not tarsal tunnel.',
    tecnicaEn:
      'Match temperature and height both sides. Do not paste a textbook 34 ms on a tall adult.',
    perlasEn: [
      '1.5 ms beats 34 ms.',
      'H/M is excitability.',
    ],
    puntosEn: [
      'Height and side.',
      'H/M is not a root criterion.',
    ],
  }),

  'ssep-vep-tables': pack({
    img: IMG.action,
    biblio: BIBLIO_EP,
    objetivos: [
      'Comparar interpicos (N9–N13–N20, I–V, P100) más que un pico aislado.',
      'Declarar el montaje y las normas del laboratorio.',
    ],
    clinica:
      'PESS: N9 plexo, N13 cervical, N20 cortical. PEATC: I-V tronco. PEV: P100 vía visual. Un P100 tardío unilateral no es un túnel carpiano; un N20 tardío con N13 nítido es supra-cervical.',
    tecnica: [
      'Use las normas de su equipo y talla/sexo cuando existan.',
      'Asimetría interocular o interaural suele ser más sensible que el absoluto.',
    ],
    interpretacion:
      'La tabla de PE no sustituye la NCS de nervio periférico. Si N9 ya está mal, no culpe al córtex.',
    errores: [
      'Informar “PESS anormal” sin decir qué pico.',
      'Mezclar normas de Oz-Fz con otro montaje.',
    ],
    perlas: [
      'El interpico localiza; el pico suelto acusa.',
      'N9 malo es plexo o nervio, no “SNC”.',
    ],
    puntos: [
      'Interpicos > pico único.',
      'Nombre el generador en el informe.',
    ],
    objetivosEn: [
      'Read VEP/BAEP/SSEP tables as interpeaks, with the lab montage named.',
    ],
    clinicaEn:
      'N9 plexus, N13 cervical, N20 cortex, I–V brainstem, P100 visual. A bad N9 is not a cortical lesion.',
    tecnicaEn:
      'Use your machine’s montage norms. Side-to-side often beats absolute cutoffs.',
    perlasEn: [
      'Interpeak localizes; a lone peak accuses.',
      'Name the generator.',
    ],
    puntosEn: [
      'Do not report “abnormal SSEP” without the peak.',
      'Peripheral N9 first.',
    ],
  }),

  'segmental-table': pack({
    img: IMG.emg,
    biblio: BIBLIO_BASE,
    objetivos: [
      'Usar la tabla miotomal como mapa, no como un músculo por raíz.',
      'Elegir al menos dos músculos y un paraespinal por pregunta radicular.',
    ],
    clinica:
      'C5 hombro, C6 bíceps/BR, C7 tríceps, C8 intrínsecos, L4 cuádriceps, L5 TA/EHL, S1 gastrocnemio. Ningún músculo es exclusivo. El protocolo mínimo es 2 músculos de la raíz + 1 de raíz vecina + paraespinal.',
    tecnica: [
      'No cierre C7 con solo tríceps.',
      'En L5 sume EHL o TP, no solo TA (que también es peroneo).',
    ],
    interpretacion:
      'La tabla orienta el pinchazo; la combinación localiza.',
    errores: [
      'Un músculo = una raíz.',
      'Olvidar el paraespinal “porque la tabla no lo lista como miotoma de extremidad”.',
    ],
    perlas: [
      'Dos músculos o no es un miotoma.',
      'TA no es L5 en exclusiva.',
    ],
    puntos: [
      'Mapa, no dogma.',
      'Mínimo: dos músculos + paraespinal.',
    ],
    objetivosEn: [
      'Use the myotomal table as a map: two muscles plus paraspinal, never one muscle per root.',
    ],
    clinicaEn:
      'No muscle is exclusive. L5 needs more than TA. C7 needs more than triceps.',
    tecnicaEn:
      'Two muscles of the root, one neighbor, paraspinals. Do not stop at a single famous muscle.',
    perlasEn: [
      'Two muscles or it is not a myotome.',
      'TA is also peroneal.',
    ],
    puntosEn: [
      'Map, not dogma.',
      'Paraspinals still count.',
    ],
  }),

  'dermatome-table': pack({
    img: IMG.ncs,
    biblio: BIBLIO_BASE,
    objetivos: [
      'No equivaler dermatoma con SNAP.',
      'Recordar que el SNAP es postganglionar.',
    ],
    clinica:
      'El dermatoma es piel y raíz. El SNAP es axón distal al GRD. Un C6 dormido con SNAP de mediano lateral nítido es coherente con raíz. Un SNAP ausente no “es el dermatoma”: es plexo o nervio.',
    tecnica: [
      'Elija el SNAP del nervio, no del dibujo de Keegan.',
      'En radiculopatía el SNAP suele vivir; no lo use para “confirmar C6”.',
    ],
    interpretacion:
      'Tabla de dermatomas para la historia; SNAP para el ganglio.',
    errores: [
      'Pedir SNAP de C7 como si existiera un nervio C7 cutáneo único.',
      'Cerrar raíz porque el SNAP bajó.',
    ],
    perlas: [
      'El dermatoma no tiene conector BNC.',
      'GRD: aduana del SNAP.',
    ],
    puntos: [
      'Dermatoma ≠ SNAP.',
      'SNAP ausente aleja de raíz.',
    ],
    objetivosEn: [
      'Keep dermatomes in the history and SNAPs on the postganglionic side of the DRG.',
    ],
    clinicaEn:
      'A numb C6 with a healthy lateral median SNAP is a root story. An absent SNAP is plexus or nerve, not “the dermatome”.',
    tecnicaEn:
      'Pick a named-nerve SNAP. Do not order a “C7 SNAP”.',
    perlasEn: [
      'Dermatomes have no BNC connector.',
      'DRG is SNAP customs.',
    ],
    puntosEn: [
      'Dermatome ≠ SNAP.',
      'Absent SNAP argues against root.',
    ],
  }),

  'emg-muscle-table': pack({
    img: IMG.emg,
    biblio: BIBLIO_BASE,
    objetivos: [
      'Armar un protocolo radicular con dos músculos, un distal y un paraespinal.',
      'Evitar “un músculo famoso por raíz”.',
    ],
    clinica:
      'La tabla de músculos existe para no pinchar de memoria. Un protocolo L5 que solo tiene TA está incompleto. Un protocolo C8 que solo tiene APB no distingue mediano de raíz.',
    tecnica: [
      'Marque en la hoja: raíz, nervio, plexo de cada músculo.',
      'Añada el músculo divisorio (TP vs peroneo, FDI vs APB) antes del décimo pinchazo inútil.',
    ],
    interpretacion:
      'La tabla no es el informe; la combinación sí.',
    errores: [
      'Diez músculos de un solo nervio.',
      'Cero paraespinales “para no molestar”.',
    ],
    perlas: [
      'El músculo divisorio ahorra pinchazos.',
      'Paraespinal duele menos que un diagnóstico de plexo falso.',
    ],
    puntos: [
      'Dos músculos + distal + paraespinal.',
      'Nombre raíz y nervio de cada uno.',
    ],
    objetivosEn: [
      'Build radicular needle tables with two muscles, a distal, and a paraspinal—not one celebrity muscle.',
    ],
    clinicaEn:
      'TA-only is not L5. APB-only is not C8. Put the dividing muscle in before the tenth extra poke.',
    tecnicaEn:
      'Write root, nerve, and plexus on the worksheet. Add paraspinals.',
    perlasEn: [
      'Dividing muscles save insertions.',
      'Skipping paraspinals creates false plexus.',
    ],
    puntosEn: [
      'Two + distal + paraspinal.',
      'Name nerve and root for each.',
    ],
  }),

  'aanem-guidelines': pack({
    img: IMG.ncs,
    biblio: `${BIBLIO_NCS}
- AANEM practice guidelines. https://www.aanem.org/`,
    objetivos: [
      'Apoyar valores de referencia, bloqueo y consentimiento en documentos AANEM, no en anécdotas.',
      'Documentar temperatura y distancias como exige el task force de normas.',
    ],
    clinica:
      'Chen y Dillingham (Muscle Nerve 2016) definen qué es una norma de calidad. El bloqueo y la dispersión tienen umbrales publicados. El consentimiento y los riesgos de aguja también. El laboratorio docente cita, no inventa.',
    tecnica: [
      'Tenga las tablas del laboratorio a la vista, trazables a AANEM o a su propia norma.',
      'Si usa un umbral de bloqueo, escríbalo en el informe.',
    ],
    interpretacion:
      'Una latencia “un poco larga” sin norma citada no es un criterio.',
    errores: [
      'DOI inventado o guía de memoria.',
      'Mezclar normas de otro aparato y otra talla.',
    ],
    perlas: [
      'La guía no sustituye el trazo; el trazo sin guía no se defiende.',
      '2016 es el año de las normas de NCS de adultos, no un adorno.',
    ],
    puntos: [
      'Cite AANEM cuando use umbrales.',
      'Temperatura y distancia son datos de calidad.',
    ],
    objetivosEn: [
      'Ground reference values, block, and consent in AANEM documents, including Chen 2016.',
    ],
    clinicaEn:
      'Quality reference values are a methods problem (Chen/Dillingham 2016). Block and dispersion have published thresholds. Cite them.',
    tecnicaEn:
      'Keep lab tables traceable. Write the block threshold you used.',
    perlasEn: [
      'Guidelines do not replace the trace; the trace without a threshold is hard to defend.',
      'Do not invent a DOI.',
    ],
    puntosEn: [
      'Cite when you use a cutoff.',
      'Temperature and distance are quality data.',
    ],
  }),

  'atlases-videos': pack({
    img: IMG.emg,
    biblio: BIBLIO_BASE,
    objetivos: [
      'Usar atlas (Preston, Leis) y videos con licencia como apoyo, no como sustituto de supervisión.',
      'No pinchar un músculo nuevo solo porque un video lo muestra.',
    ],
    clinica:
      'El atlas enseña inserción y activación. El paciente real tiene temblor, cicatriz y anatomía distinta. Los videos del curso no reemplazan al tutor al lado de la aguja.',
    tecnica: [
      'Vea el video, luego localice referencias óseas en la camilla.',
      'Si el músculo es de riesgo (supraespinoso, serrato), pida supervisión aunque el video dure 40 s.',
    ],
    interpretacion:
      'Un atlas no es un informe. No cite YouTube como referencia de un criterio.',
    errores: [
      'Copiar un punto de inserción de un video de otro país sin palpar.',
      'Usar material sin licencia en clase.',
    ],
    perlas: [
      'El video no palpa el pulso.',
      'Supervisión > resolución 4K.',
    ],
    puntos: [
      'Atlas para técnica, libros para criterios.',
      'Riesgo = supervisión.',
    ],
    objetivosEn: [
      'Use licensed atlases and videos as technique aids, never as unsupervised insertion or as a citation for criteria.',
    ],
    clinicaEn:
      'Atlases teach landmarks. Real patients have scars. High-risk muscles still need a supervisor.',
    tecnicaEn:
      'Watch, then palpate bony landmarks. Do not quote YouTube for a block threshold.',
    perlasEn: [
      'The video cannot feel a pulse.',
      'Supervision beats 4K.',
    ],
    puntosEn: [
      'Atlas for technique, papers for criteria.',
      'Risk means a supervisor.',
    ],
  }),

  'online-resources': pack({
    img: IMG.ncs,
    biblio: BIBLIO_NCS,
    objetivos: [
      'Tratar calculadoras de F y nomogramas como auxiliares.',
      'No dejar que una app firme el informe.',
    ],
    clinica:
      'Un nomograma de F por talla ayuda. Una calculadora no conoce el artefacto, el frío ni Martin-Gruber. La interpretación clínica prevalece.',
    tecnica: [
      'Si usa una calculadora, anote la fórmula o la cita.',
      'Contraste el resultado con el lado contralateral.',
    ],
    interpretacion:
      'App anormal + trazo nítido = revise la app. Trazo sucio + app normal = revise el trazo.',
    errores: [
      'Pegar el output de una web en el informe sin contexto.',
      'Usar calculadoras sin referencia.',
    ],
    perlas: [
      'La app no calienta la mano.',
      'Si no puede citarla, no la use.',
    ],
    puntos: [
      'Auxiliar, no autor.',
      'Cite la herramienta.',
    ],
    objetivosEn: [
      'Keep F-wave calculators and nomograms as helpers, not as the author of the report.',
    ],
    clinicaEn:
      'A height nomogram helps. It cannot see artifact, cold, or Martin-Gruber.',
    tecnicaEn:
      'Name the formula. Still compare sides. Dirty trace beats a clean app.',
    perlasEn: [
      'The app does not warm the hand.',
      'If you cannot cite it, skip it.',
    ],
    puntosEn: [
      'Helper, not author.',
      'Cite the tool.',
    ],
  }),

  'clinical-impact': pack({
    img: IMG.ncs,
    biblio: BIBLIO_NCS,
    objetivos: [
      'Cuantificar el efecto del frío sobre latencia, amplitud y velocidad.',
      'Calentar antes de diagnosticar desmielinización.',
    ],
    clinica:
      'El frío prolonga latencias, puede aumentar amplitudes y baja VCM (~1.5–2.4 m/s por °C en muchos laboratorios). Una mano a 28 °C “cumple” criterios de desmielinización que se evaporan a 33 °C. En control de calidad esto es un error sistemático, no un hallazgo.',
    tecnica: [
      'Mida temperatura cutánea en dorso de mano/pie y anótela.',
      'Caliente a 32–34 °C antes de tablas de desmielinización.',
      'Si no se pudo calentar, declare la limitación y no opere.',
    ],
    interpretacion:
      'Sin temperatura, la velocidad no es un criterio.',
    errores: [
      'Corregir de memoria con un factor inventado.',
      'Comparar un lado caliente con el otro recién llegado de la calle.',
    ],
    perlas: [
      'El termómetro es un electrodo más.',
      'Frío imita CIDP barata.',
    ],
    puntos: [
      '32–34 °C en mano/pie.',
      'Sin temperatura no hay desmielinización acreditable.',
    ],
    objetivosEn: [
      'Treat limb temperature as a quality variable that can fake demyelination.',
    ],
    clinicaEn:
      'Cold prolongs latency, may raise amplitude, and drops CV. A 28 °C hand is not a CIDP criterion.',
    tecnicaEn:
      'Measure skin temperature. Warm to 32–34 °C. If you cannot, write the limitation.',
    perlasEn: [
      'The thermometer is another electrode.',
      'Cold is cheap CIDP.',
    ],
    puntosEn: [
      '32–34 °C.',
      'No temperature, no demyelinating call.',
    ],
  }),

  'standard-requirements': pack({
    img: IMG.ncs,
    biblio: `${BIBLIO_NCS}
- AANEM practice guidelines. https://www.aanem.org/`,
    objetivos: [
      'Listar lo mínimo de un laboratorio defendible: tierra, calibración, consentimiento, temperatura, distancias, archivo de trazos.',
      'No emitir amplitudes sin meseta ni velocidades sin cinta.',
    ],
    clinica:
      'Un estudio sin temperatura, sin distancias medidas y sin consentimiento no es “un poco informal”: no es acreditable. El control de calidad es el suelo del informe, no un anexo.',
    tecnica: [
      'Checklist pre-estudio: consentimiento, dispositivos, anticoagulantes, termómetro, cinta.',
      'Archive el trazo, no solo la tabla numérica.',
    ],
    interpretacion:
      'Si faltan requisitos, el informe habla de limitaciones primero.',
    errores: [
      'Distancias a ojo.',
      'Trazos borrados “para ahorrar espacio”.',
    ],
    perlas: [
      'Lo que no se archivó no se defendió.',
      'La cinta es más barata que un juicio.',
    ],
    puntos: [
      'Checklist mínimo no es opcional.',
      'Limitación explícita si falta un ítem.',
    ],
    objetivosEn: [
      'Require consent, calibration, temperature, measured distance, and archived traces before calling numbers diagnostic.',
    ],
    clinicaEn:
      'Missing temperature, tape, or consent is not informal—it is not defensible.',
    tecnicaEn:
      'Pre-study checklist. Archive waveforms, not just a spreadsheet.',
    perlasEn: [
      'Unarchived traces cannot be defended.',
      'The tape is cheaper than a lawsuit.',
    ],
    puntosEn: [
      'Minimum checklist.',
      'Lead with limitations if an item is missing.',
    ],
  }),

  '60hz-noise': pack({
    img: IMG.ncs,
    biblio: BIBLIO_NCS,
    objetivos: [
      'Quitar 60 Hz con geometría y tierra, no con un notch que deforme el CMAP.',
      'Reconocer el peine a 16.6 ms.',
    ],
    clinica:
      'El 60 Hz (o 50 Hz) entra por bucles de tierra, luces y cables paralelos al estimulador. El notch puede aplastar un CMAP real. Primero geometría, después filtros.',
    tecnica: [
      'Aleje cables de red, trence estímulo y registro, mejore tierra, apague fluorescentes.',
      'Si usa notch, compare el CMAP con y sin él antes de medir latencia.',
    ],
    interpretacion:
      'Un CMAP “bonito” post-notch puede ser una latencia inventada.',
    errores: [
      'Notch por defecto en todos los canales.',
      'Subir ganancia sobre el ruido en vez de apagar la lámpara.',
    ],
    perlas: [
      'El peine de 60 Hz se oye y se ve.',
      'La lámpara es más culpable que el nervio.',
    ],
    puntos: [
      'Geometría > notch.',
      'No mida un CMAP filtrado a ciegas.',
    ],
    objetivosEn: [
      'Kill 60 Hz with grounding and cable geometry; do not let notch invent a latency.',
    ],
    clinicaEn:
      'Mains hum is a loop, a lamp, and a cable. Notch can crush a real CMAP. Fix the room first.',
    tecnicaEn:
      'Braid leads, move the ground, kill fluorescents. If notch is on, compare with it off before measuring.',
    perlasEn: [
      'The 60 Hz comb is visible.',
      'The lamp is guiltier than the nerve.',
    ],
    puntosEn: [
      'Geometry before notch.',
      'Do not cursor a notched CMAP blindly.',
    ],
  }),

  'co-stimulation': pack({
    img: IMG.ncs,
    biblio: BIBLIO_NCS,
    objetivos: [
      'Palpar el músculo equivocado cuando la amplitud “mejora” de golpe.',
      'Bajar intensidad y reposicionar antes de llamar bloqueo o super-CMAP.',
    ],
    clinica:
      'Co-estimular cubital mientras se busca mediano infla el CMAP o finge un positivo inicial. En el codo finge bloqueo o lo oculta. Palpe ADM cuando estimula mediano: si ADM salta, no es mediano puro.',
    tecnica: [
      'Palpe el territorio vecino en cada meseta.',
      'Reduzca duración de pulso e intensidad; mueva el cátodo.',
      'En duda, registre el músculo vecino.',
    ],
    interpretacion:
      'Un salto súbito de amplitud al subir 2 mA es vecino, no axón milagroso.',
    errores: [
      'Aceptar un CMAP con positivo inicial sin preguntar por cubital.',
      'Subir mA contra el dolor en vez de reposicionar.',
    ],
    perlas: [
      'La palpa dice más que el microvoltio extra.',
      'El músculo vecino no firma el informe, pero lo tuerce.',
    ],
    puntos: [
      'Palpe el vecino.',
      'Salto súbito = co-estimulación.',
    ],
    objetivosEn: [
      'Palpate the neighboring muscle whenever amplitude jumps; co-stimulation fakes block and CMAP size.',
    ],
    clinicaEn:
      'Ulnar co-stimulation during median studies inflates CMAP or adds an initial positivity. At the elbow it fakes or hides block.',
    tecnicaEn:
      'Palpate ADM when stimulating median. Shorten pulse, move the cathode, record the neighbor if unsure.',
    perlasEn: [
      'A 2 mA miracle is a neighbor.',
      'Palpate before you believe.',
    ],
    puntosEn: [
      'Feel the wrong muscle.',
      'Sudden jump = co-stimulation.',
    ],
  }),

  'distance-errors': pack({
    img: IMG.ncs,
    biblio: BIBLIO_NCS,
    objetivos: [
      'Medir con cinta sobre puntos óseos, extremidad en la postura del estímulo.',
      'Recordar que 2 cm en 10 cm son 20% de error en VCM.',
    ],
    clinica:
      'La velocidad es distancia/tiempo. La distancia es el error más barato. Un codo flexionado medido en extensión inventa un cubital lento. AANEM pide medición, no estimación.',
    tecnica: [
      'Cinta métrica, mismos puntos que el estímulo, misma flexión de codo (70–90° si es el protocolo cubital).',
      'Repita la cinta si la velocidad es la que va a cambiar una cirugía.',
    ],
    interpretacion:
      'Una VCM “desmielinizante” con distancia dudosa se repite, no se opera.',
    errores: [
      'Distancias de memoria (“siempre 8 cm”).',
      'Medir por el aire, no sobre la piel.',
    ],
    perlas: [
      'La cinta es un canal más.',
      '2 cm mienten más que 2 mA.',
    ],
    puntos: [
      'Mida, no recuerde.',
      'Postura del estímulo = postura de la cinta.',
    ],
    objetivosEn: [
      'Measure distance on bone landmarks in the stimulation posture; 2 cm in 10 cm is 20% CV error.',
    ],
    clinicaEn:
      'Velocity is distance over time. Elbow extension tape on a flexed-elbow study invents ulnar slowing.',
    tecnicaEn:
      'Tape the skin, same flexion as the stimulus. Remeasure before a surgical call.',
    perlasEn: [
      'The tape is another channel.',
      '2 cm lies harder than 2 mA.',
    ],
    puntosEn: [
      'Measure, do not remember.',
      'Same posture for shock and tape.',
    ],
  }),

  'pacemakers-icd': pack({
    img: IMG.ncs,
    biblio: `${BIBLIO_BASE}
- AANEM practice guidelines. https://www.aanem.org/`,
    objetivos: [
      'Hacer NCS distal de rutina con pulsos cortos, lejos del generador.',
      'Avisar al paciente y no contraindicarlo todo de oficio.',
    ],
    clinica:
      'Marcapasos y DAI no prohíben un mediano en muñeca. Evite estímulos de alta energía cerca del bolsillo y trenes de RNS sobre el generador. La aguja en el brazo del implante es un juicio de riesgo, no un veto universal.',
    tecnica: [
      'Identifique lado del generador. Empiece distal y contralateral si hay duda.',
      'Pulsos 0.1–0.2 ms. No haga RNS de 50 Hz sobre el bolsillo.',
      'En DAI, coordine si el protocolo exige estímulos proximales de cuello.',
    ],
    interpretacion:
      'Un estudio distal nítido en un portador de DAI es un estudio válido, no un atajo peligroso si se respetó el bolsillo.',
    errores: [
      'Cancelar todo EMG por un marcapasos.',
      'Estimular el plexo a 1 cm del generador.',
    ],
    perlas: [
      'El bolsillo es la zona roja, no el paciente entero.',
      'Documente el dispositivo en el consentimiento.',
    ],
    puntos: [
      'NCS distal habitualmente segura.',
      'Nada de trenes sobre el generador.',
    ],
    objetivosEn: [
      'Perform routine distal NCS with short pulses away from the generator; do not cancel the whole study by default.',
    ],
    clinicaEn:
      'Pacemakers/ICDs are not a ban on wrist median studies. Avoid high-energy trains over the pocket. Needle on the implant side is a risk judgment.',
    tecnicaEn:
      'Identify the pocket. Start distal. 0.1–0.2 ms pulses. No 50 Hz RNS over the generator.',
    perlasEn: [
      'The pocket is the red zone, not the whole patient.',
      'Write the device on the consent.',
    ],
    puntosEn: [
      'Distal NCS usually fine.',
      'No trains on the can.',
    ],
  }),

  'bleeding-risk': pack({
    img: IMG.emg,
    biblio: BIBLIO_BASE,
    objetivos: [
      'Evitar músculos profundos incompresibles si el sangrado no se puede taponar.',
      'No cancelar todo el EMG por un INR elevado sin matices.',
    ],
    clinica:
      'Anticoagulación: el riesgo es hematoma en iliopsoas, paracervical profundo, flexor profundo, tibial posterior profundo. FDI, deltoides superficial y TA suelen ser comprimibles. El consentimiento debe decirlo.',
    tecnica: [
      'Liste anticoagulante y, si existe, INR/anti-Xa.',
      'Elija músculos superficiales que contesten la pregunta.',
      'Presión local tras cada inserción.',
    ],
    interpretacion:
      'Un estudio limitado y declarado es mejor que un estudio “completo” con hematoma de psoas.',
    errores: [
      'Aguja en iliopsoas porque “es L3”.',
      'Cancelar APB y FDI que sí se comprimen.',
    ],
    perlas: [
      'Comprimible vs profundo es la bifurcación.',
      'La pregunta clínica cabe en músculos seguros casi siempre.',
    ],
    puntos: [
      'No veto universal.',
      'Nada de profundos incompresibles.',
    ],
    objetivosEn: [
      'Skip deep incompressible muscles when bleeding risk is high; do not cancel every compressible muscle.',
    ],
    clinicaEn:
      'Iliopsoas, deep cervical, deep posterior compartment are the problem. FDI and TA usually are not. Consent must say so.',
    tecnicaEn:
      'Name the anticoagulant. Choose superficial muscles that still answer the question. Hold pressure.',
    perlasEn: [
      'Compressible vs deep is the split.',
      'The question usually fits on safe muscles.',
    ],
    puntosEn: [
      'No universal veto.',
      'No deep incompressible needles.',
    ],
  }),

  'infection-risk': pack({
    img: IMG.emg,
    biblio: BIBLIO_BASE,
    objetivos: [
      'No puncionar piel infectada, celulitis ni úlceras.',
      'Elegir otro músculo del mismo miotoma.',
    ],
    clinica:
      'La contraindicación es local: no se atraviesa celulitis hacia un bíceps. El otro brazo, otro músculo C6 o un estudio al día siguiente tras valoración de piel siguen siendo opciones.',
    tecnica: [
      'Inspeccione el sitio. Si está caliente, no pinche.',
      'Agujas de un uso. Guantes. No reintroduzca una aguja que tocó una úlcera.',
    ],
    interpretacion:
      'Un músculo no explorado por infección se declara; no se inventa el hallazgo.',
    errores: [
      'Pinchar al borde de una úlcera “un poco más arriba”.',
      'Usar la misma aguja en otro sitio.',
    ],
    perlas: [
      'La piel manda sobre el miotoma.',
      'Hay otro músculo C6.',
    ],
    puntos: [
      'Contraindicación local.',
      'Declare el músculo omitido.',
    ],
    objetivosEn: [
      'Do not needle through cellulitis or ulcers; pick another muscle in the same myotome.',
    ],
    clinicaEn:
      'Infection is a local veto, not a ban on the whole myotome. The other arm still exists.',
    tecnicaEn:
      'Inspect skin. Single-use needles. Never reuse a needle that touched an ulcer.',
    perlasEn: [
      'Skin outranks the myotome.',
      'There is another C6 muscle.',
    ],
    puntosEn: [
      'Local contraindication.',
      'Document the skipped muscle.',
    ],
  }),

  pneumothorax: pack({
    img: IMG.emg,
    biblio: BIBLIO_BASE,
    objetivos: [
      'Tratar serrato, supraespinoso y cervicales anteriores como músculos de neumotórax.',
      'Técnica tangencial, experiencia, y no son el primer pinchazo de un curso.',
    ],
    clinica:
      'El vértice pulmonar está cerca del supraespinoso y del serrato. Un neumotórax iatrogénico es raro y grave. Si el músculo no cambia la conducta, no lo pinche en un alumno del primer mes.',
    tecnica: [
      'Dirija al hueso (escápula, costilla) con trayecto tangencial, nunca hacia el tórax.',
      'Aguja corta. Paciente informado de disnea post-estudio.',
      'Si aparece disnea, no “espere a ver”: evalúe.',
    ],
    interpretacion:
      'Un serrato omitido por seguridad se declara. Un serrato pinzado sin indicación no se celebra.',
    errores: [
      'Aguja larga hacia el tórax en un delgado.',
      'Serrato “porque el atlas lo trae” en un STC.',
    ],
    perlas: [
      'Hacia el hueso, nunca hacia el pulmón.',
      'El primer mes no es el mes del serrato.',
    ],
    puntos: [
      'Riesgo real, indicación estricta.',
      'Trayecto tangencial a hueso.',
    ],
    objetivosEn: [
      'Treat serratus, supraspinatus, and anterior cervicals as pneumothorax-risk muscles: tangential, to bone, only when they change management.',
    ],
    clinicaEn:
      'The lung apex is near supraspinatus and serratus. Skip them when they do not change the question, especially for novices.',
    tecnicaEn:
      'Short needle, tangential to scapula/rib, never toward thorax. Warn about dyspnea.',
    perlasEn: [
      'Toward bone, never toward lung.',
      'Serratus is not a carpal-tunnel muscle.',
    ],
    puntosEn: [
      'Strict indication.',
      'Tangential to bone.',
    ],
  }),

  'sweep-gain': pack({
    img: IMG.ncs,
    biblio: BIBLIO_NCS,
    objetivos: [
      'Elegir barrido y ganancia para no recortar picos ni esconder onsets.',
      'Separar motor (ms y mV) de sensitivo (ms y µV).',
    ],
    clinica:
      'Motor típico: 2–5 ms/div, 2–5 mV/div. Sensitivo: 1–2 ms/div, 10–20 µV/div. F: 5–10 ms/div, 200 µV/div. Una ganancia de CMAP en un SNAP lo hace “ausente”. Un barrido corto recorta una F tibial.',
    tecnica: [
      'Si el pico toca el techo, baje ganancia y repita la meseta.',
      'Si no ve el onset, suba ganancia o ensanche el barrido, no invente el cursor.',
    ],
    interpretacion:
      'Un SNAP “ausente” a 5 mV/div no está ausente.',
    errores: [
      'Dejar 5 mV/div en un estudio de dedo.',
      'Medir F de tibial en un barrido de 5 ms total.',
    ],
    perlas: [
      'La ganancia es un diagnóstico.',
      'Si recorta, miente la amplitud.',
    ],
    puntos: [
      'mV para CMAP, µV para SNAP.',
      'El barrido debe caber el potencial entero.',
    ],
    objetivosEn: [
      'Set sweep and gain so peaks are not clipped and onsets are visible; mV for CMAP, µV for SNAP.',
    ],
    clinicaEn:
      'Motor 2–5 ms/div and mV; sensory 1–2 ms/div and µV; F waves 200 µV/div. CMAP gain makes SNAPs vanish.',
    tecnicaEn:
      'If the peak clips, drop gain and restimulate. If onset is missing, raise gain or widen sweep—do not guess the cursor.',
    perlasEn: [
      'Gain is a diagnosis.',
      'Clipping lies about amplitude.',
    ],
    puntosEn: [
      'mV vs µV is not a preference.',
      'The whole potential must fit.',
    ],
  }),

  reproducibility: pack({
    img: IMG.ncs,
    biblio: BIBLIO_NCS,
    objetivos: [
      'Repetir CMAP/SNAP al menos dos veces; variación >10–15% obliga a revisar técnica.',
      'No informar un único trazo heroico.',
    ],
    clinica:
      'Un potencial reproducible es un dato. Un potencial único que no se puede repetir es un artefacto con buena prensa. AANEM de calidad pide repetición, no un screenshot.',
    tecnica: [
      'Superponga dos CMAP de meseta. Si divergen, mueva cátodo, cinta y temperatura.',
      'En SNAP chicos, promedie con criterio, no una sola barrida ruidosa.',
    ],
    interpretacion:
      'La cifra que entra al informe es la reproducible, no la más patológica.',
    errores: [
      'Guardar el trazo más bajo “porque confirma la hipótesis”.',
      'No repetir cuando el paciente se movió.',
    ],
    perlas: [
      'Lo que no se repite no se informa.',
      'La hipótesis no elige el trazo.',
    ],
    puntos: [
      'Dos veces mínimo.',
      '>10–15% de diferencia: técnica, no enfermedad.',
    ],
    objetivosEn: [
      'Repeat CMAP/SNAP at least twice; >10–15% drift is technique until proven otherwise.',
    ],
    clinicaEn:
      'A reproducible potential is data. A one-off hero sweep is artifact. Do not pick the most pathologic frame to match the hypothesis.',
    tecnicaEn:
      'Overlay two plateau CMAPs. If they diverge, fix cathode, tape, and temperature before you diagnose.',
    perlasEn: [
      'If it will not repeat, it does not report.',
      'The hypothesis does not choose the trace.',
    ],
    puntosEn: [
      'Twice minimum.',
      '>10–15% is setup, not disease.',
    ],
  }),
};
