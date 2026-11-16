import type { LessonExpansion } from './lessonExpansions';
import { BIBLIO_BASE, BIBLIO_NCS, IMG, pack } from './lessonExpansionsModules1to3';

const US = `${BIBLIO_BASE}
- Walker F, Cartwright MS. Neuromuscular Ultrasound. Saunders; 2011.`;

/** Hojas cortas de atlas y estudios especiales. Se pegan al texto original; no cambian el id. */
export const CATALOG_EXPANSIONS: Record<string, LessonExpansion> = {
  'superficial-peroneal-sensory-step': pack({
    img: IMG.ncs,
    biblio: BIBLIO_NCS,
    objetivos: [
      'Usar el SNAP peroneo superficial para separar peroneo (postganglionar) de L5.',
      'No declarar ausente un SNAP de pie frío o de un adulto mayor sin el contralateral.',
    ],
    clinica:
      'El peroneo superficial nace distal al GRD. Si el pie cae y este SNAP vive, la lesión es preganglionar (L5) o el fascículo motor se lesionó con el sensitivo aún a salvo. Si el SNAP cae y el sural vive, el foco es peroneo.',
    tecnica: [
      'Antidrómico, 10–14 cm, dorso entre 1.º y 2.º metatarsiano. Promedie.',
      'Compare el otro pie y el sural antes de “ausente”.',
      'Añada aguja en tibial posterior: si está denervado, no es peroneo puro.',
    ],
    interpretacion:
      'SNAP bajo + TA/peroneos malos + tibial posterior sano = peroneo. SNAP nítido + tibial posterior denervado = L5.',
    errores: [
      'Pie caído cerrado con un solo CMAP de EDB y sin este SNAP.',
      'Ganancia de CMAP que hace “desaparecer” un SNAP de 8 µV.',
    ],
    perlas: [
      'Este SNAP es el aduanero del peroneo.',
      'L5 no lo mata.',
    ],
    puntos: [
      'Postganglionar vs L5.',
      'Siempre con tibial posterior.',
    ],
    objetivosEn: [
      'Use the superficial peroneal SNAP to separate peroneal nerve from L5.',
    ],
    clinicaEn:
      'A living SNAP with denervated tibialis posterior is L5. A dead SNAP with spared tibialis posterior is peroneal nerve.',
    tecnicaEn:
      'Antidromic, 10–14 cm, average, compare the other foot and the sural. Add tibialis posterior needle.',
    perlasEn: [
      'L5 does not kill this SNAP.',
      'Do not close foot drop on EDB CMAP alone.',
    ],
    puntosEn: [
      'Postganglionic vs root.',
      'Pair with tibialis posterior.',
    ],
  }),

  'femoral-motor-step': pack({
    img: IMG.ncs,
    biblio: BIBLIO_NCS,
    objetivos: [
      'Estimular el femoral lateral a la arteria, no encima de ella.',
      'Comparar lados: >50% de caída de amplitud importa más que un corte absoluto.',
    ],
    clinica:
      'El femoral en el pliegue inguinal es profundo. Un CMAP bajo unilateral con cuádriceps débil puede ser hematoma de psoas, plexo lumbar o femoral iatrogénico. El aductor (obturador) desempata plexo de nervio.',
    tecnica: [
      'G1 en vasto medial, estímulo 1–2 cm lateral a la femoral (NAVEL). Pulso 0.5–1 ms.',
      'Palpe el pulso y no lo atraviese con el cátodo.',
      'Haga el otro lado. Añada aductores si la pregunta es plexo.',
    ],
    interpretacion:
      'Cuádriceps malo + aductores buenos = femoral. Ambos malos = plexo o raíz L3–L4.',
    errores: [
      'Estimular sobre la arteria y llamar “ausente” a un dolor sin meseta.',
      'Un solo lado en un hematoma.',
    ],
    perlas: [
      'Lateral al pulso, no sobre el pulso.',
      'Hematoma de psoas + cuádriceps es urgencia, no un túnel.',
    ],
    puntos: [
      'NAVEL: nervio lateral a la arteria.',
      'Asimetría >50%.',
    ],
    objetivosEn: [
      'Stimulate femoral nerve lateral to the artery and compare sides.',
    ],
    clinicaEn:
      'Quadriceps down and adductors spared is femoral nerve. Both down is plexus or L3–L4. Iliopsoas hematoma is an emergency.',
    tecnicaEn:
      'Vastus medialis pickup, cathode 1–2 cm lateral to the pulse, 0.5–1 ms, other side mandatory.',
    perlasEn: [
      'Lateral to the pulse, not on it.',
      'Psoas hematoma is not an entrapment.',
    ],
    puntosEn: [
      'NAVEL.',
      '>50% side difference.',
    ],
  }),

  'ulnar-sensory-step': pack({
    img: IMG.ncs,
    biblio: BIBLIO_NCS,
    objetivos: [
      'Usar el SNAP del 5.º dedo como control del STC y como localizador cubital.',
      'Añadir la rama dorsal para separar codo de Guyon.',
    ],
    clinica:
      'En STC el cubital sensitivo suele vivir y el mediano no. En Guyon el SNAP del 5.º puede caer y la rama dorsal (que sale en el antebrazo) vive. En el codo ambas pueden caer.',
    tecnica: [
      'Antidrómico, anillo en la base del 5.º, 14 cm en la muñeca, lateral al FCU.',
      'Si el 5.º está ausente, haga la rama dorsal a 10 cm.',
      'No compare un lado antidrómico con el otro ortodrómico.',
    ],
    interpretacion:
      'Dorsal viva + 5.º muerto = Guyon. Dorsal y 5.º muertos = codo, plexo o axonopatía.',
    errores: [
      'Cerrar cubital de codo sin la rama dorsal.',
      'Usar este SNAP “normal” para descartar C8 (el SNAP no ve la raíz).',
    ],
    perlas: [
      'La rama dorsal es el reloj del antebrazo.',
      'Control interno del STC.',
    ],
    puntos: [
      '5.º dedo = cubital sensitivo.',
      'Dorsal separa Guyon de codo.',
    ],
    objetivosEn: [
      'Use digit-5 SNAP as the CTS control and the dorsal ulnar branch to split Guyon from the elbow.',
    ],
    clinicaEn:
      'Dorsal branch spared with absent digit-5 SNAP is Guyon. Both absent is elbow, plexus, or axon loss. A healthy ulnar SNAP does not clear C8.',
    tecnicaEn:
      'Antidromic ring on digit 5 at 14 cm. Add dorsal branch at 10 cm if digit 5 is gone.',
    perlasEn: [
      'Dorsal branch is the forearm clock.',
      'Ulnar SNAP is the CTS internal control.',
    ],
    puntosEn: [
      'Digit 5 localizes ulnar sensory.',
      'Dorsal branch splits Guyon from elbow.',
    ],
  }),

  'radial-sensory-step': pack({
    img: IMG.ncs,
    biblio: BIBLIO_NCS,
    objetivos: [
      'Registrar la rama superficial en la tabaquera a 10–12 cm.',
      'Usarla en queiralgia (Wartenberg) y como control de un STC.',
    ],
    clinica:
      'El SNAP radial superficial se preserva en el túnel carpiano y en el PIN (motor puro). Cae en queiralgia por reloj o pulsera, en el canal espiral si el fascículo sensitivo va incluido, y en plexo posterior.',
    tecnica: [
      'G1 en tabaquera, estímulo en el borde radial del radio, 10–12 cm.',
      'Compare el otro lado: la queiralgia es asimétrica.',
      'Si hay muñeca caída, no cierre el caso con este SNAP solo: haga CMAP a EIP.',
    ],
    interpretacion:
      'SNAP radial bajo + sin debilidad = Wartenberg. SNAP radial nítido + dedos que no extienden = PIN.',
    errores: [
      'Llamar STC a un dorso de mano dormido (eso es radial, no mediano).',
      'Coestimular mediano y leer un SNAP “gigante”.',
    ],
    perlas: [
      'El dorso de la mano no es el túnel carpiano.',
      'PIN respeta este SNAP.',
    ],
    puntos: [
      'Tabaquera, 10–12 cm.',
      'Control del STC y testigo de Wartenberg.',
    ],
    objetivosEn: [
      'Record the superficial radial SNAP at the snuffbox and use it for Wartenberg, not for CTS.',
    ],
    clinicaEn:
      'CTS and PIN spare this SNAP. A watch compressing the superficial radial nerve does not.',
    tecnicaEn:
      'Snuffbox pickup, 10–12 cm along the radius, compare sides. Add EIP CMAP if the wrist drops.',
    perlasEn: [
      'The dorsum of the hand is not carpal tunnel.',
      'PIN spares this SNAP.',
    ],
    puntosEn: [
      'Snuffbox at 10–12 cm.',
      'Wartenberg vs PIN.',
    ],
  }),

  'median-sensory-step': pack({
    img: IMG.ncs,
    biblio: BIBLIO_NCS,
    objetivos: [
      'Medir el SNAP mediano antidrómico a 14 cm en el 2.º o 3.º dedo.',
      'Pasar al anillo del 4.º si el absoluto es normal y la clínica es de STC leve.',
    ],
    clinica:
      'Una latencia pico >3.6 ms a 14 cm o una amplitud <15 µV apoya STC, si la mano está a ≥32 °C. El estudio absoluto es menos sensible que la diferencia mediano–cubital en el 4.º dedo (>0.4 ms).',
    tecnica: [
      'Anillos, tierra entre estímulo y G1, cátodo entre palmar largo y FCR.',
      'Si el 2.º dedo es normal, haga el 4.º antes de dar de alta.',
      'No mezcle latencia pico con normas de onset.',
    ],
    interpretacion:
      'SNAP mediano lento + cubital del 5.º normal = muñeca. Ambos lentos = polineuropatía o dos túneles.',
    errores: [
      'STC a 28 °C.',
      'Alta con un solo dedo normal en un paciente con parestesias nocturnas.',
    ],
    perlas: [
      'El 4.º dedo gana al absoluto.',
      'Declare onset o pico.',
    ],
    puntos: [
      '14 cm, 2.º o 3.º.',
      'Comparativo si el absoluto es fronterizo.',
    ],
    objetivosEn: [
      'Measure antidromic median SNAP at 14 cm, then add digit-4 comparison if the absolute value is normal.',
    ],
    clinicaEn:
      'Peak latency >3.6 ms at 14 cm supports CTS on a warm hand. Digit-4 difference >0.4 ms is more sensitive.',
    tecnicaEn:
      'Ring electrodes, ground between stim and G1. Do not mix peak and onset norms.',
    perlasEn: [
      'Digit 4 beats the absolute latency.',
      'A cold hand is not CTS.',
    ],
    puntosEn: [
      '14 cm to digit 2 or 3.',
      'Comparison study if borderline.',
    ],
  }),

  'tibial-motor-step': pack({
    img: IMG.ncs,
    biblio: BIBLIO_NCS,
    objetivos: [
      'Registrar en abductor del hallux y estimular detrás del maléolo medial y en el hueco poplíteo.',
      'No llamar túnel tarsiano a un CMAP bajo de una axonopatía larga.',
    ],
    clinica:
      'El tibial motor es el CMAP del pie y la puerta de la onda F y del H. Un CMAP bajo bilateral con sural ausente es polineuropatía. Un CMAP bajo unilateral con plantares asimétricos y sóleo sano puede ser túnel tarsiano.',
    tecnica: [
      'G1 bajo el maléolo medial. Estímulo retromaleolar, luego poplíteo en la línea media (más mA).',
      'Meseta real: el poplíteo es profundo y el submáximo finge bloqueo.',
      'Para la F, gire el cátodo proximal en el tobillo.',
    ],
    interpretacion:
      'Caída poplíteo–tobillo sin dispersión pide técnica (profundidad, coestimulación del peroneo) antes que bloqueo.',
    errores: [
      'Poplíteo submáximo informado como bloqueo ciático.',
      'AH atrófico en un anciano leído como túnel sin el otro lado.',
    ],
    perlas: [
      'El hueco poplíteo miente si no hay meseta.',
      'F y H salen de este mismo nervio, con reglas distintas.',
    ],
    puntos: [
      'AH, maléolo medial, poplíteo.',
      'Meseta antes de bloqueo.',
    ],
    objetivosEn: [
      'Record tibial CMAP at abductor hallucis and demand a popliteal plateau before calling block.',
    ],
    clinicaEn:
      'Bilateral low tibial CMAP plus absent sural is polyneuropathy. Unilateral focal plantar findings may be tarsal tunnel.',
    tecnicaEn:
      'Medial malleolus, then midline popliteal fossa with a true plateau. Cathode proximal for F waves.',
    perlasEn: [
      'A submaximal popliteal shock fakes sciatic block.',
      'F and H use this nerve with different rules.',
    ],
    puntosEn: [
      'AH, malleolus, popliteal fossa.',
      'Plateau before block.',
    ],
  }),

  'sural-sensory-step': pack({
    img: IMG.ncs,
    biblio: BIBLIO_NCS,
    objetivos: [
      'Medir el sural antidrómico a 14 cm detrás del maléolo lateral.',
      'Ajustar por edad y por el otro lado antes de diagnosticar polineuropatía.',
    ],
    clinica:
      'El sural es el SNAP de la polineuropatía longitud-dependiente. En mayores de 70 años, 4 µV puede ser normal. Ausencia unilateral con el otro lado nítido no es “polineuropatía”: es sural, ciático o técnica.',
    tecnica: [
      '14 cm, lateral a la línea media de la pantorrilla. Promedie 10–20.',
      'Si no sale, acorte a 10 cm o mueva el cátodo.',
      'Temperatura del pie. Compare contralateral.',
    ],
    interpretacion:
      'Sural bilateral bajo + tibial bajo = axonopatía larga. Sural nítido + pie caído = no cierre polineuropatía.',
    errores: [
      'Un sural ausente a los 80 años como ciático.',
      'No promediar y declarar ausencia.',
    ],
    perlas: [
      'Edad y el otro pie antes que el adjetivo.',
      'El sural no ve L5.',
    ],
    puntos: [
      '14 cm, maléolo lateral.',
      'Bilateral y por edad.',
    ],
    objetivosEn: [
      'Record the sural SNAP at 14 cm and age-adjust before calling polyneuropathy.',
    ],
    clinicaEn:
      'Length-dependent axon loss kills the sural. Age and the other side come first. A healthy sural does not see L5.',
    tecnicaEn:
      '14 cm, average 10–20, shorten to 10 cm if absent, compare sides, warm the foot.',
    perlasEn: [
      '4 µV at age 70 can be normal.',
      'Unilateral absence is not polyneuropathy.',
    ],
    puntosEn: [
      '14 cm behind the lateral malleolus.',
      'Bilateral and age-adjusted.',
    ],
  }),

  'radial-motor-step': pack({
    img: IMG.ncs,
    biblio: BIBLIO_NCS,
    objetivos: [
      'Registrar en EIP y estimular antebrazo, codo, canal espiral y, si hace falta, axila.',
      'Separar Saturday-night (tríceps sano) de PIN (sin caída de muñeca, SNAP radial vivo).',
    ],
    clinica:
      'La caída de muñeca con tríceps preservado es canal espiral. La extensión de muñeca conservada (ECRL) con dedos que no extienden es PIN en la arcada de Frohse, y el SNAP radial superficial debe vivir.',
    tecnica: [
      'G1 en EIP, cadena de estímulos de distal a proximal. Mida caída de amplitud en el canal espiral.',
      'Palpe para no coestimular mediano en la axila.',
      'Añada SNAP radial superficial en el mismo estudio.',
    ],
    interpretacion:
      'Caída >50% en el canal espiral con tríceps sano = neuropraxia de sábado por la noche. Sin caída y sin déficit sensitivo = PIN.',
    errores: [
      'Llamar PIN a un tríceps denervado.',
      'Un solo sitio distal en una muñeca caída.',
    ],
    perlas: [
      '¿Extiende la muñeca? Sí = PIN. No, con tríceps sano = espiral.',
      'El SNAP radial cuenta en la misma visita.',
    ],
    puntos: [
      'EIP y cuatro sitios.',
      'Tríceps separa proximal de espiral.',
    ],
    objetivosEn: [
      'Map radial CMAP at EIP across the spiral groove and separate it from PIN.',
    ],
    clinicaEn:
      'Spiral groove: wrist drop, triceps spared. PIN: finger drop, wrist extension spared, sensory SNAP spared.',
    tecnicaEn:
      'EIP pickup, forearm to axilla. Palpate against median co-stimulation. Add the superficial radial SNAP.',
    perlasEn: [
      'Can they extend the wrist? Yes = PIN.',
      'Weak triceps is proximal to the spiral groove.',
    ],
    puntosEn: [
      'EIP and four sites.',
      'Triceps splits the lesion.',
    ],
  }),

  'peroneal-motor-step': pack({
    img: IMG.ncs,
    biblio: BIBLIO_NCS,
    objetivos: [
      'Estimular peroneo en tobillo, cabeza del peroné y hueco poplíteo, registro en EDB.',
      'Si EDB está atrófico, repetir en tibial anterior y buscar el peroneo accesorio.',
    ],
    clinica:
      'El pie caído se localiza en esta cadena. CMAP mayor en la rodilla que en el tobillo sugiere peroneo accesorio, no “conducción al revés”. EDB bajo con tibial anterior nítido puede ser atrofia distal, no una cabeza de peroné.',
    tecnica: [
      '8 cm al EDB, luego cabeza del peroné (distal y posterior), luego poplíteo lateral al bíceps femoral.',
      'Si EDB <1 mV, registre tibial anterior.',
      'Detrás del maléolo lateral si sospecha accesorio.',
    ],
    interpretacion:
      'Bloqueo en la cabeza del peroné + SNAP superficial bajo = peroneo. Mismo bloqueo con SNAP nítido puede ser neuropraxia reciente, antes de la degeneración walleriana.',
    errores: [
      'Un solo tobillo en un pie caído.',
      'Accesorio leído como error de montaje y borrado.',
    ],
    perlas: [
      'EDB miente en el anciano; el tibial anterior habla.',
      'Tres sitios o no es un pie caído.',
    ],
    puntos: [
      'Tobillo, cabeza, poplíteo.',
      'Accesorio y TA de rescate.',
    ],
    objetivosEn: [
      'Stimulate peroneal nerve at the ankle, fibular head, and popliteal fossa; rescue with tibialis anterior.',
    ],
    clinicaEn:
      'Three sites. Larger knee than ankle CMAP suggests an accessory peroneal. Atrophic EDB is not automatically the fibular head.',
    tecnicaEn:
      '8 cm to EDB, fibular head, lateral popliteal fossa. Add TA if EDB is tiny. Check behind the lateral malleolus.',
    perlasEn: [
      'EDB lies in the elderly.',
      'Three sites or it is not a foot-drop study.',
    ],
    puntosEn: [
      'Ankle, fibular head, popliteal fossa.',
      'Accessory peroneal and TA rescue.',
    ],
  }),

  'ncs-config-table': pack({
    img: IMG.ncs,
    biblio: BIBLIO_NCS,
    objetivos: [
      'No usar la ganancia de un CMAP para buscar un SNAP.',
      'Subir el filtro bajo con cuidado: recorta amplitud y puede fingir patología.',
    ],
    clinica:
      'Motor: 2–10 Hz a 10 kHz, 2–5 mV/div. Sensitivo: 10–20 Hz a 2–3 kHz, 10–20 µV/div. Onda F: 200–500 µV/div. Un SNAP “ausente” a 5 mV/div no está ausente.',
    tecnica: [
      'Si el pico toca el borde, baje ganancia y repita la meseta.',
      'No deje el notch de 60 Hz encendido por defecto en el CMAP.',
      'Anote filtros si el laboratorio no usa los de la tabla.',
    ],
    interpretacion:
      'La configuración es un dato del informe cuando el potencial es limítrofe.',
    errores: [
      'HFF de SNAP en un CMAP (recorta el pico).',
      'LFF alto que aplana la amplitud y alarga la latencia aparente.',
    ],
    perlas: [
      'µV para el susurro, mV para el grito.',
      'El filtro equivocado simula enfermedad.',
    ],
    puntos: [
      'Ganancia distinta para motor, sensitivo y F.',
      'Los filtros se declaran si se salen de la tabla.',
    ],
    objetivosEn: [
      'Keep CMAP, SNAP, and F-wave gains apart; filters can fake disease.',
    ],
    clinicaEn:
      'Sensory at µV, motor at mV, F waves at 200–500 µV. A SNAP does not vanish; the gain hides it.',
    tecnicaEn:
      'Drop gain if the peak clips. Do not leave 60 Hz notch on by default.',
    perlasEn: [
      'µV for the whisper, mV for the shout.',
      'Wrong filters mimic disease.',
    ],
    puntosEn: [
      'Separate gains.',
      'Declare nonstandard filters.',
    ],
  }),

  'anomaly-diagnostic-impact': pack({
    img: IMG.ncs,
    biblio: BIBLIO_NCS,
    objetivos: [
      'Buscar Martin-Gruber antes de operar un codo por “bloqueo”.',
      'Buscar peroneo accesorio cuando el CMAP de rodilla supera al de tobillo.',
    ],
    clinica:
      'Una anastomosis cambia el número sin cambiar la enfermedad. Martin-Gruber (mediano→cubital en antebrazo) finge bloqueo cubital. El peroneo accesorio finge que la conducción “mejora” en la rodilla. Riche-Cannieu calla un APB con cubital vivo.',
    tecnica: [
      'Si el cubital cae en el codo, estimule el mediano en el codo y registre ADM.',
      'Si el peroneo de rodilla > tobillo, estimule detrás del maléolo lateral.',
      'Escriba la anastomosis en el informe para que no se opere.',
    ],
    interpretacion:
      'Bloqueo sin debilidad ni aguja concordante es anatomía hasta que se demuestre lo contrario.',
    errores: [
      'Cirugía de codo por Martin-Gruber.',
      'Borrar un CMAP “invertido” en vez de buscar el accesorio.',
    ],
    perlas: [
      'La anatomía miente antes que la enfermedad.',
      'El informe debe nombrar la anastomosis.',
    ],
    puntos: [
      'Martin-Gruber, accesorio, Riche-Cannieu.',
      'Sin debilidad, dude del bloqueo.',
    ],
    objetivosEn: [
      'Hunt Martin-Gruber and accessory peroneal before calling conduction block.',
    ],
    clinicaEn:
      'Anastomoses change the number without changing the disease. Name them in the report.',
    tecnicaEn:
      'Median stimulation at the elbow recording ADM unmasks Martin-Gruber. Behind the lateral malleolus unmasks accessory peroneal.',
    perlasEn: [
      'Anatomy lies first.',
      'Do not operate a Martin-Gruber.',
    ],
    puntosEn: [
      'Three classic anastomoses.',
      'Block without weakness is anatomy.',
    ],
  }),

  fourier: pack({
    img: IMG.emg,
    biblio: BIBLIO_BASE,
    objetivos: [
      'Leer la FFT como espectro de frecuencia de una EMG estacionaria, no como diagnóstico.',
      'Reconocer el corrimiento a la izquierda en fatiga.',
    ],
    clinica:
      'La FFT pasa la EMG del tiempo a la frecuencia. En fatiga, las fibras rápidas caen primero y el espectro se corre a frecuencias bajas. La EMG de esfuerzo variable no es estacionaria: la FFT inventa picos.',
    tecnica: [
      'Use un esfuerzo constante si va a mostrar un espectro.',
      'No informe “miopatía” por un corrimiento sin PUM ni reclutamiento.',
      'Para señales que cambian, la wavelet es la herramienta de tiempo-frecuencia.',
    ],
    interpretacion:
      'El espectro es investigación o fatiga de superficie. El informe clínico de radiculopatía no cita una FFT.',
    errores: [
      'FFT de un esfuerzo que sube y baja.',
      'Sustituir la aguja por un gráfico de colores.',
    ],
    perlas: [
      'Estacionaria o no es FFT.',
      'Izquierda = más lento, a menudo fatiga.',
    ],
    puntos: [
      'Tiempo → frecuencia.',
      'No es un criterio AANEM.',
    ],
    objetivosEn: [
      'Treat FFT as a stationary-signal spectrum, not a diagnosis.',
    ],
    clinicaEn:
      'Fatigue shifts the EMG spectrum left as fast fibers drop out. A changing effort violates the stationary assumption.',
    tecnicaEn:
      'Constant effort only. Do not call myopathy from a spectrum. Use wavelets when the signal changes.',
    perlasEn: [
      'Stationary or it is not an FFT.',
      'Left shift often means fatigue.',
    ],
    puntosEn: [
      'Time to frequency.',
      'Not an AANEM criterion.',
    ],
  }),

  'in-out-plane': pack({
    img: IMG.emg,
    biblio: US,
    objetivos: [
      'Preferir in-plane cuando hay que ver la punta en un músculo profundo.',
      'No fingir que out-of-plane muestra el trayecto.',
    ],
    clinica:
      'In-plane: la aguja viaja en el plano del transductor y se ve entera. Out-of-plane: solo un punto brillante, y la punta puede estar más allá de ese punto. Diafragma, psoas y tibial posterior piden in-plane.',
    tecnica: [
      'Alinee la aguja con el haz. Si pierde la punta, pare.',
      'Out-of-plane solo en superficiales donde el hueso detiene la aguja.',
      'No es el primer pinchazo de un alumno en el diafragma.',
    ],
    interpretacion:
      'Ver un punto no es ver la punta.',
    errores: [
      'Out-of-plane en diafragma.',
      'Avanzar cuando el eco de la aguja desapareció.',
    ],
    perlas: [
      'In-plane ve el camino. Out-of-plane ve un instante.',
      'Perder la punta es parar.',
    ],
    puntos: [
      'Profundos = in-plane.',
      'El punto brillante no es la punta segura.',
    ],
    objetivosEn: [
      'Use in-plane ultrasound when you must see the needle tip in a deep muscle.',
    ],
    clinicaEn:
      'In-plane shows the whole needle. Out-of-plane shows a dot that may not be the tip. Diaphragm and psoas are in-plane.',
    tecnicaEn:
      'Stop if the needle echo disappears. Out-of-plane only for shallow muscles stopped by bone.',
    perlasEn: [
      'A dot is not the tip.',
      'Losing the tip means stop.',
    ],
    puntosEn: [
      'Deep muscles = in-plane.',
      'Not a first student diaphragm.',
    ],
  }),

  'cross-sectional-area': pack({
    img: IMG.ncs,
    biblio: US,
    objetivos: [
      'Medir el área de sección en el borde interno del nervio, en el sitio de la pregunta.',
      'Separar aumento focal (túnel) de aumento difuso (CIDP) y de área normal (axonal).',
    ],
    clinica:
      'Mediano en muñeca: >10–12 mm² sugiere STC crónico. Cubital en codo: >10 mm² sugiere atrapamiento. CIDP engorda varios nervios; la axonopatía no. El número no sustituye la latencia.',
    tecnica: [
      'Transductor perpendicular, sin comprimir el nervio (la compresión baja el área).',
      'Trace el perineuro interno. Mida el sitio y un segmento sano (índice de hinchazón).',
      'No diagnostique STC solo con mm² si las latencias son normales y la clínica no cierra.',
    ],
    interpretacion:
      'Focal = túnel. Difuso = desmielinizante hipertrófica o hereditaria. Normal con CMAP bajo = axonal.',
    errores: [
      'Sonda oblicua que infla el área.',
      'Operar por 11 mm² sin clínica ni NCS.',
    ],
    perlas: [
      'La compresión del transductor miente hacia abajo.',
      'El CSA complementa; no reemplaza el SNAP.',
    ],
    puntos: [
      'Muñeca >10–12 mm², codo >10 mm², con clínica.',
      'Focal vs difuso vs normal.',
    ],
    objetivosEn: [
      'Measure CSA inside the epineurium and separate focal, diffuse, and normal-size nerves.',
    ],
    clinicaEn:
      'Median wrist >10–12 mm² and ulnar elbow >10 mm² suggest entrapment. CIDP enlarges many nerves. Axonal loss does not. CSA does not replace latency.',
    tecnicaEn:
      'Perpendicular probe, no compression, inner epineurium, compare with a healthy segment.',
    perlasEn: [
      'Probe pressure shrinks CSA.',
      'CSA complements the SNAP.',
    ],
    puntosEn: [
      'Focal vs diffuse vs normal.',
      'Do not operate on millimeters alone.',
    ],
  }),

  'us-principles': pack({
    img: IMG.ncs,
    biblio: US,
    objetivos: [
      'Reconocer el panal sano y el nervio hipoecoico agrandado.',
      'Elegir 12–18 MHz en superficie y 5–8 MHz en plexo o muslo.',
    ],
    clinica:
      'El fascículo sano es oscuro con perineuro brillante. El nervio comprimido o inflamado pierde el panal, se oscurece y crece. Eso no dice axonal vs desmielinizante por sí solo: el EDX lo dice y el US dice dónde está gordo.',
    tecnica: [
      'Corte transversal para el área, longitudinal para seguir el nervio.',
      'Gel bastante, sonda quieta, paciente quieto.',
      'No llame “neuroma” a un artefacto de anisotropía: gire la sonda.',
    ],
    interpretacion:
      'US localiza. NCS cuantifica conducción. Los dos juntos, no uno en lugar del otro.',
    errores: [
      'Sonda de abdomen en un mediano de muñeca.',
      'Diagnosticar sin el electrodiagnóstico.',
    ],
    perlas: [
      'Panal = sano. Mancha oscura grande = enfermo o mal ángulo.',
      'El US no mide milisegundos.',
    ],
    puntos: [
      '12–18 MHz superficial.',
      'Complemento del EDX, no sustituto.',
    ],
    objetivosEn: [
      'Recognize the normal honeycomb and choose probe frequency by depth.',
    ],
    clinicaEn:
      'Healthy fascicles are dark with bright perineurium. Entrapment and inflammation enlarge and darken the nerve. EDX still measures conduction.',
    tecnicaEn:
      '12–18 MHz superficial, 5–8 MHz deep. Transverse for area, longitudinal to follow. Rock the probe before calling a neuroma.',
    perlasEn: [
      'Honeycomb is healthy.',
      'Ultrasound does not measure milliseconds.',
    ],
    puntosEn: [
      'Frequency by depth.',
      'Complement, not a replacement.',
    ],
  }),

  ssr: pack({
    img: IMG.ncs,
    biblio: `${BIBLIO_BASE}
- Low PA. Testing the autonomic nervous system. Seminars in Neurology. 2003. https://doi.org/10.1055/s-2004-817725`,
    objetivos: [
      'Registrar la respuesta simpática de piel en palmas y plantas como screening de fibras C.',
      'Espaciar los estímulos: la habituación apaga una vía que está sana.',
    ],
    clinica:
      'La SSR (o PASP) es sudomotora, amielínica. Presente de los dos lados: vía simpática groseramente intacta. Ausente de los dos lados: piense diabetes, amiloide, Parkinson o atrofia multisistémica, no un túnel. Ausente de un lado: lesión simpática de ese lado. No es cuantitativa.',
    tecnica: [
      'Estímulo impredecible (ruido, inspiración, pulso eléctrico). Espere a que la respuesta vuelva antes de repetir.',
      'Palmas y plantas. Piel seca y quieta.',
      'No la use para graduar severidad ni para operar.',
    ],
    interpretacion:
      'Screening. Una SSR presente no excluye fibra fina leve. Una ausente con NCS normal cabe en fibra pequeña o autonómica.',
    errores: [
      'Repetir cada 5 s y llamar neuropatía a la habituación.',
      'Informar “autonómica severa” por una sola ausencia.',
    ],
    perlas: [
      'Si el paciente se acostumbra, la SSR se va.',
      'Es un sí/no, no una escala.',
    ],
    puntos: [
      'Fibras C sudomotoras.',
      'Habituación es la trampa.',
    ],
    objetivosEn: [
      'Use the sympathetic skin response as a yes/no sudomotor screen and space the stimuli.',
    ],
    clinicaEn:
      'Bilateral absence suggests autonomic neuropathy. Unilateral absence is a lateralized sympathetic lesion. Habituation mimics absence.',
    tecnicaEn:
      'Palms and soles, unpredictable stimuli, wait between trials. Do not grade severity from one trace.',
    perlasEn: [
      'If the patient gets used to it, the SSR leaves.',
      'Yes/no, not a scale.',
    ],
    puntosEn: [
      'Sudomotor C fibers.',
      'Habituation is the trap.',
    ],
  }),

  'deep-muscles': pack({
    img: IMG.emg,
    biblio: US,
    objetivos: [
      'No pinchar diafragma ni psoas a ciegas.',
      'Reservar la guía a músculos cuya complicación cambia la vida.',
    ],
    clinica:
      'El diafragma está junto a la pleura: a ciegas, el riesgo es neumotórax. El psoas está junto a vasos e intestino. El tibial posterior y el pronador cuadrado se benefician de la guía, pero un error duele menos que un pulmón.',
    tecnica: [
      'In-plane, punta visible, pare si la pierde.',
      'Diafragma: identifique la línea pleural antes de entrar.',
      'Si la pregunta se contesta con un músculo superficial, no baje al psoas.',
    ],
    interpretacion:
      'Un diafragma no explorado por seguridad se declara. Un diafragma pinzado sin indicación no se celebra.',
    errores: [
      'Aguja larga hacia el tórax en un delgado.',
      'Psoas “porque es L3” en un anticoagulado.',
    ],
    perlas: [
      'Pleura primero, aguja después.',
      'Hay otro músculo L3.',
    ],
    puntos: [
      'Diafragma y psoas = guía.',
      'Indicación estricta.',
    ],
    objetivosEn: [
      'Do not needle diaphragm or psoas blindly.',
    ],
    clinicaEn:
      'Diaphragm risks pneumothorax. Psoas risks vessels and bowel. See the tip in-plane or do not enter.',
    tecnicaEn:
      'Identify pleura first. Stop if the tip disappears. Skip psoas if a safer L3 muscle answers the question.',
    perlasEn: [
      'Pleura first, needle second.',
      'There is another L3 muscle.',
    ],
    puntosEn: [
      'Diaphragm and psoas need guidance.',
      'Strict indication.',
    ],
  }),
};
