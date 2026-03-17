// src/content/modules/module-07-special-studies.ts
import { Module } from '../../types/content';

export const module07: Module = {
  id: 'special-studies',
  number: 7,
  title: 'Estudios Especiales y Técnicas Avanzadas',
  titleEn: 'Special Studies and Advanced Techniques',
  emoji: '🔧',
  description: 'SFEMG, QEMG, inching, colisión, ecografía neuromuscular, MIO, sistema nervioso autónomo y EMG pediátrica',
  descriptionEn: 'SFEMG, QEMG, inching, collision, neuromuscular ultrasound, IOM, autonomic testing and pediatric EMG',
  color: 'from-teal-500 to-cyan-700',
  icon: 'Wrench',
  topics: [
    {
      id: 'sfemg',
      title: 'Electromiografía de Fibra Única (SFEMG)',
      children: [
        {
          id: 'sfemg-principles',
          title: 'Principios y Técnica',
          content: `La SFEMG es la técnica electrodiagnóstica más sensible para evaluar la transmisión neuromuscular. Registra la actividad de fibras musculares individuales pertenecientes a la misma unidad motora.

**Electrodos:**
* Tradicionalmente se usaba una aguja especial de SFEMG con una superficie de registro de solo 25 micrómetros de diámetro, capaz de detectar una o dos fibras dentro de un radio de ~300 µm.
* Actualmente, las agujas concéntricas desechables estándar se usan con frecuencia con sensibilidad y especificidad comparables, evitando los costos de esterilización.

**Filtros:**
* Filtro de baja frecuencia (high-pass): 500 Hz.
* Filtro de alta frecuencia (low-pass): 10 kHz.
* Estos filtros eliminan los potenciales de fibras lejanas, aislando solo la actividad de fibras cercanas al electrodo.

**Dos modalidades:**
* **SFEMG Voluntaria:** El paciente contrae levemente el músculo. Es la técnica más usada pero requiere cooperación extrema.
* **SFEMG por Estimulación:** Se estimula eléctricamente el nervio motor a baja frecuencia. No requiere cooperación del paciente, lo que la hace ideal para niños, pacientes sedados o poco colaboradores.`,
          keyPoints: [
            'Electrodo de 25 µm (o aguja concéntrica desechable moderna).',
            'Filtros: 500 Hz - 10 kHz.',
            'Voluntaria: Requiere cooperación extrema.',
            'Por Estimulación: Ideal para niños y no colaboradores.',
          ]
        },
        {
          id: 'jitter-blocking',
          title: 'Jitter y Bloqueo',
          content: `El **Jitter** y el **Bloqueo** son los dos parámetros fundamentales de la SFEMG.

**Jitter (Inestabilidad):**
* Es la variabilidad en el tiempo de transmisión neuromuscular entre dos fibras del mismo motor unitario.
* Se mide como la **Diferencia Consecutiva Media (MCD)** de los intervalos interpotencial a lo largo de 50-100 descargas consecutivas.
* Un jitter aumentado refleja inestabilidad en la placa terminal (retardo variable en la transmisión sináptica).

**Valores normales de MCD (con aguja concéntrica, activación voluntaria):**
* Frontal: media 20.6 µs, límite superior 28 µs.
* Extensor Común de los Dedos: media 23.4 µs, límite superior 30 µs.
* Orbicular del Ojo: media 22.9 µs, límite superior 31 µs.
* Un estudio se considera anormal si más del 10% de los pares evaluados (típicamente 20 pares) muestran un jitter mayor que el límite superior normal.

**Bloqueo:**
* Cuando la inestabilidad de la placa es tan severa que el EPP no alcanza el umbral, la fibra muscular deja de disparar intermitentemente. Esto se llama bloqueo.
* El bloqueo es el correlato electrofisiológico de la debilidad clínica.
* El jitter aumentado SIN bloqueo se correlaciona con fatiga pero sin debilidad evidente.
* El jitter aumentado CON bloqueo indica transmisión neuromuscular severamente comprometida.`,
          clinicalPearls: [
            'Un jitter anormal NO es específico de Miastenia Gravis. También ocurre en LEMS, botulismo, ELA, polimiositis y neuropatías. Siempre interpreta en contexto clínico.',
            'Si más del 10% de los pares tienen jitter aumentado, el estudio es anormal. Si hay bloqueo en cualquier par, es aún más significativo.',
          ],
          keyPoints: [
            'Jitter = Variabilidad temporal de la transmisión NM (MCD).',
            'MCD normal: ~20-23 µs según el músculo.',
            'Bloqueo = Fallo intermitente de la fibra. Correlato de debilidad.',
            'Jitter sin bloqueo = Fatiga. Con bloqueo = Debilidad.',
          ]
        },
        {
          id: 'fiber-density',
          title: 'Densidad de Fibra (FD)',
          content: `La Densidad de Fibra es un parámetro que evalúa la arquitectura de la unidad motora y la reinervación colateral.

**Definición:**
* Es el número medio de potenciales de acción de fibras musculares pertenecientes a la misma unidad motora que se detectan en cada inserción del electrodo.
* Se mide en 20 sitios de inserción diferentes dentro del músculo.

**Valores normales:**
* Normal: 1.4-1.7 (es decir, se detectan 1-2 fibras por inserción en promedio).
* Aumenta fisiológicamente con la edad (especialmente después de los 60 años).

**Interpretación:**
* **FD aumentada:** Indica reinervación colateral. Las unidades motoras sobrevivientes han "adoptado" fibras musculares de unidades motoras que se han perdido. Es un indicador muy sensible de procesos neuropáticos (ELA, neuropatía crónica) o de remodelación crónica de la unidad motora.
* **FD normal:** No descarta patología; solo indica que no hay evidencia de reinervación colateral significativa.`,
          clinicalPearls: [
            'En la ELA, la FD aumentada puede aparecer antes de que haya evidencia clínica de denervación, reflejando el proceso activo de reinervación compensatoria que ocurre en las fases iniciales.',
          ],
          keyPoints: [
            'FD normal: 1.4-1.7 (20 inserciones).',
            'FD aumentada = Reinervación colateral (neuropatía, ELA).',
            'Aumenta fisiológicamente después de los 60 años.',
          ]
        },
        {
          id: 'sfemg-applications',
          title: 'Aplicaciones Clínicas de la SFEMG',
          content: `La SFEMG es el estudio más sensible para trastornos de la unión neuromuscular.

**Miastenia Gravis (MG):**
* Sensibilidad mayor del 95% para MG generalizada Y ocular.
* Es el estudio de elección cuando la ENR es normal pero la sospecha clínica de MG es alta.
* El músculo recomendado para MG ocular es el Orbicular del Ojo o el Frontal.
* Para MG generalizada: Extensor Común de los Dedos.

**Lambert-Eaton (LEMS):**
* Jitter marcadamente aumentado con bloqueo frecuente.
* A diferencia de la MG, el jitter puede MEJORAR con frecuencias de estimulación altas (reflejo de la facilitación presináptica).

**ELA:**
* El jitter aumentado en ELA refleja reinervación inmadura con transmisión neuromuscular inestable en las nuevas placas terminales.
* La FD está aumentada por la reinervación colateral activa.

**Neuropatías:**
* En neuropatía axonal, el jitter medio es significativamente más alto (~36.4 µs) que en neuropatía desmielinizante (~23.2 µs), reflejando la inestabilidad de las placas reinervadas.

**Limitaciones:**
* Alta sensibilidad pero BAJA especificidad. Un jitter anormal no dice la causa.
* Requiere experiencia técnica significativa.
* La SFEMG voluntaria requiere cooperación extrema del paciente.`,
          clinicalPearls: [
            'La SFEMG es la mejor herramienta para MG seronegativa (anticuerpos anti-AChR negativos). En estos pacientes, la ENR puede ser normal pero la SFEMG mostrará jitter aumentado.',
            'En neuropatía axonal el jitter es mucho mayor (~36 µs) que en desmielinizante (~23 µs). Esto se debe a que en la axonal hay reinervación colateral con placas inmaduras e inestables.',
          ],
          keyPoints: [
            'SFEMG: Sensibilidad mayor del 95% para MG (generalizada y ocular).',
            'Mejor músculo para MG ocular: Orbicular/Frontal.',
            'Jitter anormal NO es específico de MG.',
            'En neuropatía axonal, jitter más alto que en desmielinizante.',
          ]
        },
      ]
    },
    {
      id: 'qemg',
      title: 'EMG Cuantitativa (QEMG)',
      children: [
        {
          id: 'turns-amplitude',
          title: 'Análisis de Vueltas/Amplitud (Turns/Amplitude)',
          content: `Es un método automatizado y rápido para cuantificar objetivamente el patrón de interferencia del EMG.

**Definición de "Vuelta" (Turn):**
* Cualquier cambio en la dirección de la señal EMG que sea igual o mayor a 100 µV.

**Técnica:**
* Se registra la actividad EMG durante esfuerzo leve a máximo.
* El sistema analiza automáticamente 20 puntos a lo largo del músculo, correlacionando el número de vueltas con la amplitud media de vueltas consecutivas.

**Interpretación:**
* **Patrón Neuropático:** Si 2 o más puntos (de 20) caen POR ENCIMA de los límites normales, sugiere un patrón neuropático (pocas unidades motoras grandes = menos vueltas pero de alta amplitud).
* **Patrón Miopático:** Si 2 o más puntos caen POR DEBAJO de los límites, sugiere patrón miopático (muchas unidades motoras pequeñas = muchas vueltas de baja amplitud).
* Un 10% de anormalidad o más es significativo.

**Ventajas:**
* Rápido, objetivo y reproducible.
* Es especialmente útil en EMG pediátrica porque no requiere esfuerzo máximo prolongado.
* Reduce la subjetividad del análisis visual del patrón de interferencia.`,
          keyPoints: [
            'Vuelta = Cambio de dirección mayor o igual a 100 µV.',
            '2+ puntos fuera de límites (de 20) = Significativo.',
            'Neuropático: Puntos por encima del límite. Miopático: Puntos por debajo.',
            'Rápido y objetivo. Ideal para niños.',
          ]
        },
        {
          id: 'multi-mup',
          title: 'Análisis Multi-MUP (ADEMG)',
          content: `Es una técnica de descomposición automatizada del patrón de interferencia que extrae múltiples PUMs (Potenciales de Unidad Motora) individuales.

**Técnica:**
* Se graba una contracción de 5-10 segundos al 5-30% del esfuerzo máximo.
* Algoritmos informáticos identifican y aíslan 4-5 PUMs distintos de la señal compuesta, usándolos como "plantillas" (templates).
* Se acumulan ~30 PUMs promediados para obtener datos altamente reproducibles.

**Parámetros medidos automáticamente:**
* Duración, amplitud, fases, vueltas, área, índice de tamaño.
* Frecuencia de disparo y patrón de reclutamiento.

**Ventajas sobre el análisis visual:**
* Independiente de la ganancia del amplificador.
* Resultados objetivos y comparables entre laboratorios.
* Permite estudiar la morfología individual de cada PUM dentro de un patrón de interferencia complejo.`,
          keyPoints: [
            'Registra 5-10 segundos al 5-30% del esfuerzo máximo.',
            'Aísla 4-5 PUMs individuales automáticamente.',
            '~30 PUMs promediados = Datos altamente reproducibles.',
          ]
        },
      ]
    },
    {
      id: 'inching',
      title: 'Técnicas de Inching (Avance Lento)',
      children: [
        {
          id: 'incremental-assessment',
          title: 'Evaluación Milimétrica del Nervio',
          content: `La técnica de inching consiste en estimular el nervio a intervalos muy cortos (cada 1-2 cm) a lo largo de su trayecto, buscando el punto exacto de lesión.

**Principio:**
* En un nervio sano, la latencia aumenta de forma uniforme y predecible con cada centímetro de distancia (proporcional a la velocidad de conducción).
* En el punto de atrapamiento o desmielinización focal, hay un salto abrupto e inesperado de latencia que no corresponde a la distancia recorrida.

**Criterio de anormalidad:**
* Un cambio de latencia mayor de 0.4-0.5 ms en un segmento de 1 cm es significativo y localiza el punto de compresión.

**Ventajas:**
* Es la técnica de localización MÁS precisa disponible.
* Permite calcular la velocidad de conducción en segmentos ultra-cortos.`,
          clinicalPearls: [
            'La técnica de inching requiere un estimulador cuidadosamente calibrado y marcas de piel muy precisas a intervalos regulares. Errores de medición de 0.5 cm pueden crear falsos positivos.',
          ],
          keyPoints: [
            'Estimulación cada 1-2 cm a lo largo del nervio.',
            'Salto de latencia mayor de 0.4-0.5 ms/cm = Punto de compresión.',
            'La técnica de localización más precisa disponible.',
          ]
        },
        {
          id: 'entrapment-application',
          title: 'Aplicaciones en Atrapamientos',
          content: `La técnica de inching tiene aplicaciones clásicas en los síndromes de atrapamiento más comunes.

**Nervio Cubital en el Codo:**
* Se estimula a intervalos de 2 cm desde 4 cm distal al epicóndilo medial hasta 6 cm proximal.
* Se segmentan: sobre el epicóndilo medial, en el surco epitroclear, bajo el arco del flexor carpi ulnaris.
* Un salto de latencia en uno de estos segmentos localiza la compresión con precisión milimétrica.

**Nervio Mediano en la Muñeca (Túnel Carpiano):**
* Se estimula a intervalos de 1 cm desde la palma hasta 4-6 cm proximal al pliegue de la muñeca.
* El salto de latencia típicamente ocurre en el segmento que cruza el ligamento transverso del carpo.
* Complementa las técnicas estándar de latencia motora distal y sensitiva palmar.

**Nervio Peroneo en la Cabeza del Peroné:**
* Segmentos de 2 cm alrededor de la cabeza del peroné permiten separar la compresión en el cuello del peroné de la lesión en el túnel fibular.`,
          keyPoints: [
            'Cubital: Segmentar epicóndilo → surco → FCU.',
            'Mediano: Segmentar palma → ligamento transverso.',
            'Peroneo: Segmentar alrededor de la cabeza del peroné.',
          ]
        },
      ]
    },
    {
      id: 'collision-techniques',
      title: 'Técnicas de Colisión',
      children: [
        {
          id: 'costimulation-elimination',
          title: 'Eliminación de Coestimulación',
          content: `Cuando dos nervios corren en proximidad anatómica, la estimulación de uno puede activar accidentalmente al otro (coestimulación). La técnica de colisión resuelve este problema.

**Principio:**
* Se aplica un estímulo de "bloqueo" al nervio no deseado en un punto DISTAL.
* Este impulso antidrómico viaja hacia proximal y choca (colisiona) con el impulso ortodrómico no deseado, cancelándolo.
* Solo el impulso del nervio deseado llega al electrodo de registro.

**Aplicación clásica:**
* **Separación mediano-cubital en el punto de Erb:** Al estimular el punto de Erb (plexo braquial), se activan todos los troncos. Si solo quieres la respuesta del nervio cubital, estimulas simultáneamente el nervio mediano en la muñeca. El impulso antidrómico del mediano viaja hacia arriba y cancela el impulso ortodrómico del mediano que venía de Erb. Solo la respuesta del cubital llega pura al registro.

**Otras aplicaciones:**
* Estudios de la onda F cuando hay coestimulación.
* Separación de ramos del nervio facial.`,
          keyPoints: [
            'Estímulo "bloqueador" distal cancela el impulso no deseado por colisión antidrómica.',
            'Clásico: Aislar el cubital de la respuesta del Erb bloqueando el mediano distalmente.',
          ]
        },
      ]
    },
    {
      id: 'neuromuscular-us',
      title: 'Ecografía Neuromuscular (NMUS)',
      children: [
        {
          id: 'us-principles',
          title: 'Principios del Ultrasonido Neuromuscular',
          content: `La ecografía neuromuscular se ha convertido en una extensión fundamental del laboratorio de electrodiagnóstico.

**Equipo:**
* Sondas lineales de alta frecuencia: 12-18 MHz para nervios superficiales y músculos.
* Sondas de menor frecuencia (5-8 MHz) para estructuras profundas (plexo braquial, nervios del muslo).

**Patrón Normal del Nervio:**
* En corte transversal, el nervio sano tiene un patrón "en panal de abejas": fascículos nerviosos hipoecoicos (oscuros) rodeados por perineuro hiperecoico (brillante).
* En corte longitudinal, los fascículos se ven como bandas paralelas hipoecoicas separadas por líneas brillantes.

**Patrón Patológico:**
* El nervio pierde su arquitectura fascicular.
* Se vuelve hipoecoico y agrandado.
* El Área de Sección Transversal (AST) aumenta en el punto de compresión o inflamación.`,
          keyPoints: [
            'Sonda lineal 12-18 MHz para nervios superficiales.',
            'Nervio sano = "Panal de abejas" (fascículos oscuros + perineuro brillante).',
            'Nervio patológico = Hipoecoico, agrandado, pierde arquitectura fascicular.',
          ]
        },
        {
          id: 'cross-sectional-area',
          title: 'Área de Sección Transversal (AST)',
          content: `El AST es la medición cardinal en ecografía neuromuscular. Se mide trazando el contorno del nervio en corte transversal.

**Valores de referencia:**
* Nervio mediano en muñeca: Normal menor de 10 mm². Mayor de 10-12 mm² sugiere Síndrome del Túnel Carpiano crónico.
* Nervio cubital en codo: Normal menor de 8-10 mm². Mayor de 10 mm² sugiere atrapamiento cubital.

**Patrones de AST según patología:**
* **Neuropatía por atrapamiento:** AST aumentada focalmente en el punto de compresión, con ratios de hinchazón (swelling ratio) significativos.
* **CIDP (neuropatía desmielinizante inflamatoria):** AST aumentada DIFUSAMENTE en múltiples nervios y segmentos.
* **Neuropatía axonal:** AST normal o incluso reducida (los axones se pierden sin que el nervio "hinche").`,
          clinicalPearls: [
            'La ecografía puede distinguir entre neuropatías desmielinizantes hipertróficas (AST aumentada difusamente) y axonales (AST normal), complementando los hallazgos electrofisiológicos.',
          ],
          keyPoints: [
            'Mediano en muñeca: Normal menor de 10 mm². Mayor de 10-12 mm² = STC.',
            'Cubital en codo: Normal menor de 8-10 mm².',
            'CIDP: AST aumentada difusamente. Axonal: AST normal o reducida.',
          ]
        },
        {
          id: 'bochum-heckmatt',
          title: 'Scores de Bochum y Heckmatt',
          content: `Dos escalas ecográficas estandarizadas de gran valor clínico.

**Score de Bochum (BUS):**
* Cuantifica el aumento de AST en sitios específicos para diferenciar patología inflamatoria crónica (CIDP) de GBS agudo o neuropatía axonal.
* Sitios evaluados: Mediano en antebrazo, cubital en brazo, radial en espiral húmeral, sural en pantorrilla.
* Un score mayor de 2 puntos sugiere CIDP.
* Ayuda a diferenciar CIDP (engrosamiento crónico de nervios) de GBS (generalmente nervios normales en ecografía en fase aguda).

**Escala de Heckmatt (Ecogenicidad Muscular):**
* Evalúa visualmente la ecogenicidad del músculo para cuantificar la infiltración grasa y la atrofia.
* **Grado I:** Normal. Músculo hipoecoico con ecogenicidad ósea visible debajo.
* **Grado II:** Ligeramente aumentada con ecogenicidad ósea aún visible.
* **Grado III:** Marcadamente aumentada. Ecogenicidad ósea difícilmente visible.
* **Grado IV:** Muy aumentada. Ecogenicidad ósea completamente borrada.
* Útil en miopatías y distrofias musculares para cuantificar la severidad de la afectación muscular.`,
          keyPoints: [
            'Bochum Score mayor de 2 = Sospecha de CIDP.',
            'Heckmatt I-IV: De músculo normal a infiltración grasa severa.',
            'Heckmatt IV: El hueso ya no se visualiza por debajo del músculo.',
          ]
        },
        {
          id: 'fasciculation-detection',
          title: 'Detección Ecográfica de Fasciculaciones',
          content: `La ecografía puede visualizar fasciculaciones como contracciones focales breves del músculo en tiempo real.

**Ventajas sobre la EMG de aguja:**
* Puede detectar fasciculaciones en músculos profundos o extensos donde la aguja solo muestrea una fracción pequeña.
* No invasiva (el paciente no siente ninguna molestia).
* Puede examinar múltiples músculos rápidamente.

**Aplicación en ELA:**
* La detección ecográfica de fasciculaciones difusas complementa los hallazgos de EMG de aguja.
* El protocolo de "fasciculation score" evalúa fasciculaciones en múltiples regiones corporales.
* Puede detectar fasciculaciones subclínicas en músculos que parecen normales a la exploración física.

**Limitación:**
* Las fasciculaciones benignas también son visibles por ecografía. El hallazgo debe interpretarse siempre en el contexto clínico y electrodiagnóstico completo.`,
          keyPoints: [
            'Fasciculaciones visibles como contracciones focales en tiempo real.',
            'No invasiva, evalúa músculos profundos.',
            'Complementa la EMG de aguja en el diagnóstico de ELA.',
          ]
        },
      ]
    },
    {
      id: 'us-guided-emg',
      title: 'EMG Guiada por Ecografía',
      children: [
        {
          id: 'in-out-plane',
          title: 'Técnicas "In-Plane" y "Out-of-Plane"',
          content: `La ecografía permite guiar la aguja de EMG hacia músculos profundos con seguridad y precisión.

**Técnica In-Plane:**
* La aguja se inserta en el MISMO plano del transductor.
* Se visualiza todo el trayecto de la aguja en tiempo real.
* Es la técnica PREFERIDA para músculos profundos porque permite ver exactamente dónde está la punta de la aguja en todo momento.

**Técnica Out-of-Plane:**
* La aguja se inserta PERPENDICULAR al plano del transductor.
* Solo se ve un punto brillante (la sección transversal de la aguja).
* Menos control sobre la profundidad de la punta.`,
          keyPoints: [
            'In-Plane: Visualización completa del trayecto. Preferida para músculos profundos.',
            'Out-of-Plane: Solo se ve un punto brillante. Menor control de profundidad.',
          ]
        },
        {
          id: 'deep-muscles',
          title: 'Músculos Profundos Críticos',
          content: `La guía ecográfica es esencial (y en algunos casos obligatoria) para explorar músculos profundos con riesgo de complicaciones.

**Músculos que REQUIEREN guía ecográfica:**
* **Diafragma:** Riesgo altísimo de neumotórax si se hace a ciegas. La ecografía identifica la línea pleural y permite inserción segura. Es obligatorio en laboratorios modernos para la evaluación hemidiafragmática en ELA.
* **Psoas Ilíaco:** Músculo profundo retroperitoneal. Riesgo de punción de vasos ilíacos o intestino.

**Músculos donde mejora significativamente la precisión:**
* **Tibial Posterior:** Profundo en la pantorrilla, difícil de aislar de los gastrocnemios.
* **Pronador Cuadrado:** Muy pequeño y profundo en el antebrazo.
* **Romboides:** Detrás de la escápula, difícil de alcanzar sin guía.

**Seguridad:**
* La guía ecográfica previene la punción de pleura, arterias, venas, nervios y otros órganos.
* Es el estándar de cuidado en laboratorios neurofisiológicos modernos.`,
          clinicalPearls: [
            'La EMG del diafragma SIN ecografía es un riesgo inaceptable de neumotórax. Con guía ecográfica, la tasa de complicaciones es cercana a cero.',
          ],
          keyPoints: [
            'Diafragma y Psoas: Guía ecográfica OBLIGATORIA.',
            'Tibial Posterior, Pronador Cuadrado, Romboides: Guía recomendada.',
            'Previene complicaciones graves (neumotórax, punción vascular).',
          ]
        },
      ]
    },
    {
      id: 'iom',
      title: 'Monitorización Intraoperatoria (MIO)',
      children: [
        {
          id: 'dynamic-static-emg',
          title: 'EMG Libre (Free-Run) y EMG Evocada (Triggered)',
          content: `Las dos modalidades complementarias de EMG intraoperatoria protegen las raíces nerviosas durante la cirugía de columna.

**EMG Libre (Free-Run):**
* Monitorización pasiva continua de la actividad eléctrica de miotomas en riesgo.
* En reposo, no debe haber actividad. Las **descargas neurotónicas** (ráfagas de potenciales de acción de alta frecuencia) indican irritación mecánica o tracción de una raíz nerviosa.
* El cirujano debe detenerse inmediatamente al escuchar descargas neurotónicas.

**EMG Evocada (Triggered EMG):**
* Se aplica estimulación eléctrica directa al orificio pedicular o al tornillo transpedicular ya colocado.
* Se busca la respuesta EMG en el miotoma correspondiente.
* **Criterio de alerta:** Un umbral de estimulación menor de 20 V sugiere que el tornillo ha perforado la corteza del pedículo y puede estar en contacto con la raíz nerviosa.
* Rango de monitorización habitual: 0-40 V.
* Un umbral alto (mayor de 20 V) indica que la corteza pedicular está intacta y el tornillo es seguro.`,
          clinicalPearls: [
            'Las descargas neurotónicas sostenidas son una EMERGENCIA intraoperatoria. Si no se detiene la manipulación, puede producirse daño radicular permanente.',
            'Un umbral de triggered EMG menor de 6-8 V es una alerta CRÍTICA y generalmente requiere reposicionamiento del tornillo.',
          ],
          keyPoints: [
            'Free-Run: Descargas neurotónicas = Irritación radicular. Detener cirugía.',
            'Triggered EMG: Umbral menor de 20 V = Brecha cortical del pedículo.',
            'Umbral menor de 6-8 V = Alerta crítica, reposicionar tornillo.',
          ]
        },
        {
          id: 'ssep-mep-iom',
          title: 'PESS y PEM Intraoperatorios',
          content: `Los PESS y PEM se complementan para proteger toda la médula espinal durante la cirugía.

**PESS Intraoperatorios:**
* Monitorizan las columnas dorsales (posteriores) de la médula espinal.
* Irrigadas por las arterias espinales posterioRes.
* Detectan isquemia medular por compresión o distracción.
* **Criterios de alarma:** Caída de amplitud mayor del 50% O aumento de latencia mayor del 10% respecto al registro basal.

**PEM Intraoperatorios:**
* Monitorizan los tractos corticoespinales (columnas laterales).
* Irrigados por la arteria espinal anterior.
* Son los primeros en perderse ante hipoperfusión medular (isquemia de la arteria espinal anterior), que es la complicación vascular más temida en cirugía de columna y aorta.
* **Criterios de alarma:** Pérdida completa o caída mayor del 60% de la amplitud con prolongación mayor del 10% de latencia.

**Cirugías donde es indispensable la MIO:**
* Cirugía de escoliosis (corrección con barras/tornillos).
* Cirugía de aneurismas aórticos complejos.
* Resección de tumores medulares intradurales.
* Tumores del ángulo pontocerebeloso (con monitorización de nervio facial adicional).
* Tiroidectomías (monitorización del nervio laríngeo recurrente).`,
          clinicalPearls: [
            'Los PESS vigilan columnas POSTERIORES y los PEM vigilan columnas LATERALES. Es esencial tener AMBOS para cobertura medular completa. Un paciente puede tener isquemia de la arteria espinal anterior con PESS normales.',
          ],
          keyPoints: [
            'PESS: Columnas dorsales. Alarma: Amplitud menor del 50% o latencia mayor del 10%.',
            'PEM: Columnas laterales. Los primeros en perderse ante isquemia de arteria espinal anterior.',
            'AMBOS necesarios para cobertura completa de la médula.',
          ]
        },
      ]
    },
    {
      id: 'autonomic-studies',
      title: 'Estudios del Sistema Nervioso Autónomo',
      children: [
        {
          id: 'ssr',
          title: 'Respuesta Cutánea Simpática (SSR)',
          content: `La SSR (también llamada PASP: Potenciales Autonómicos de Piel Periféricos) evalúa las fibras simpáticas sudomotoras amielínicas (fibras C).

**Técnica:**
* Se aplica un estímulo eléctrico al nervio mediano o tibial.
* Se registra la respuesta en palmas y plantas (cambios de potencial eléctrico por activación de glándulas sudoríparas).
* También puede evocarse con estímulos inesperados (inspiración profunda, ruido fuerte, estímulo doloroso).

**Interpretación:**
* **Presencia bilateral:** Vía simpática intacta.
* **Ausencia bilateral:** Neuropatía autonómica (diabetes, amiloidosis, Parkinson, atrofia multisistémica).
* **Ausencia unilateral:** Lesión simpática lateralizada.

**Limitaciones:**
* Alta habituación: La respuesta disminuye con la repetición. Los estímulos deben ser impredecibles y espaciados.
* Alta variabilidad inter e intraindividual.
* Es un test de screening, no cuantitativo.`,
          keyPoints: [
            'Evalúa fibras C simpáticas sudomotoras.',
            'Registro en palmas y plantas.',
            'Ausencia bilateral = Neuropatía autonómica.',
            'Limitación: Alta habituación y variabilidad.',
          ]
        },
        {
          id: 'rr-variability',
          title: 'Variabilidad del Intervalo RR',
          content: `Es el marcador parasimpático cardiovagal más reproducible y clínicamente útil.

**Principio:**
* Normalmente, la frecuencia cardíaca varía con la respiración: se acelera durante la inspiración y se enlentece durante la espiración (arritmia sinusal respiratoria).
* Esta variación está mediada por el nervio vago (parasimpático).

**Técnica:**
* Se registra un ECG continuo durante respiración profunda estandarizada (6 respiraciones/minuto durante 1 minuto).
* Se mide la diferencia entre el intervalo RR más largo (espiración) y el más corto (inspiración).

**Maniobras complementarias:**
* **Ratio de Valsalva:** Se divide el RR más largo (post-maniobra) entre el más corto (durante la maniobra). Normal: mayor de 1.21.
* **Ratio 30:15:** Se mide al ponerse de pie. Es el cociente entre el RR del latido 30 y el del latido 15. Normal: mayor de 1.04.

**Aplicación principal:**
* La pérdida de variabilidad RR es patognomónica de disfunción autonómica cardíaca temprana, especialmente en neuropatía diabética.
* Es una de las primeras funciones autonómicas en afectarse en diabetes.`,
          clinicalPearls: [
            'La variabilidad RR por respiración profunda es el TEST MÁS SENSIBLE para detectar neuropatía autonómica diabética cardiovagal temprana. Debe realizarse como parte del screening anual en diabéticos.',
          ],
          keyPoints: [
            'Evalúa el parasimpático cardiovagal (nervio vago).',
            'Ratio de Valsalva normal: mayor de 1.21.',
            'Ratio 30:15 normal: mayor de 1.04.',
            'Pérdida de variabilidad = Neuropatía autonómica temprana (diabetes).',
          ]
        },
        {
          id: 'qsart',
          title: 'QSART y QST',
          content: `Dos técnicas complementarias para evaluar las fibras finas (grupos A-delta y C).

**QSART (Quantitative Sudomotor Axon Reflex Test):**
* Test no invasivo que mide la integridad de las fibras simpáticas posganglionares distales.
* Se aplica acetilcolina por iontoforesis en la piel. Esto estimula las terminales sudomotoras, provocando un reflejo axonal local que activa las glándulas sudoríparas cercanas.
* La cantidad de sudor producida se mide con un sudorómetro.
* Se evalúa en 4 sitios estandarizados: 1 en antebrazo + 3 en miembro inferior.
* Disminución de la respuesta indica neuropatía de fibras finas.

**QST (Quantitative Sensory Testing):**
* Mide los umbrales de percepción de diferentes modalidades sensitivas.
* **Umbral térmico frío:** Evalúa fibras A-delta (mielinizadas finas).
* **Umbral térmico cálido y doloroso:** Evalúa fibras C (amielínicas).
* **Umbral vibratorio:** Evalúa fibras A-beta (gruesas).
* Es un test psicofísico (depende de la cooperación del paciente).
* La elevación de umbrales térmicos con umbrales vibratorios normales sugiere neuropatía selectiva de fibras finas.`,
          clinicalPearls: [
            'En la neuropatía de fibras finas "pura", las conducciones nerviosas y la EMG de aguja son NORMALES. El diagnóstico depende del QST, QSART y/o biopsia de piel para densidad de fibras intraepidérmicas.',
          ],
          keyPoints: [
            'QSART: Mide sudor tras estimulación con acetilcolina. Evalúa fibras C simpáticas.',
            'QST: Umbrales térmicos (fibras finas A-delta y C) y vibratorios (fibras gruesas A-beta).',
            'Neuropatía de fibras finas: Conducciones nerviosas normales + QST/QSART anormales.',
          ]
        },
      ]
    },
    {
      id: 'signal-processing',
      title: 'Procesamiento Avanzado de Señales',
      children: [
        {
          id: 'fourier',
          title: 'Transformada Rápida de Fourier (FFT)',
          content: `La FFT descompone la señal EMG (que está en el dominio del tiempo) en sus frecuencias constituyentes (dominio de frecuencia).

**Aplicación clínica:**
* En la fatiga muscular, el espectro de frecuencias se desplaza hacia la izquierda (shift-to-left) porque las fibras rápidas (de alta frecuencia) se fatigan primero.
* En miopatías severas, la pérdida de fibras musculares grandes produce un cambio similar del espectro.

**Limitación:**
* La FFT asume que la señal es estacionaria (no cambia en el tiempo). La señal EMG durante esfuerzo variable NO es estacionaria, lo que puede producir artefactos.`,
          keyPoints: [
            'FFT: Descompone la señal EMG en frecuencias.',
            'Fatiga muscular: El espectro se desplaza a la izquierda.',
            'Asume señal estacionaria; limitada para EMG dinámico.',
          ]
        },
        {
          id: 'wavelet',
          title: 'Transformada Wavelet',
          content: `La transformada Wavelet es más avanzada que la FFT porque mantiene información simultánea de TIEMPO y FRECUENCIA.

**Ventaja clave:**
* Permite analizar señales no estacionarias (que cambian con el tiempo), como la actividad EMG durante esfuerzo variable.

**Aplicación principal:**
* Sustracción de artefactos complejos, como los latidos cardíacos (ECG) que se montan sobre la señal EMG frágil durante el estudio de músculos torácicos (paravertebrales, intercostales).
* Es la técnica de elección para procesamiento de señales en investigación neurofisiológica avanzada.`,
          keyPoints: [
            'Wavelet: Mantiene tiempo + frecuencia (superior a FFT para señales variables).',
            'Sustracción de artefactos ECG en EMG torácico.',
          ]
        },
        {
          id: 'coherence',
          title: 'Análisis de Coherencia Corticomuscular',
          content: `La coherencia corticomuscular mide la sincronización entre la actividad eléctrica del cerebro (EEG sobre corteza motora) y la actividad muscular (EMG).

**Principio:**
* En condiciones normales, la corteza motora genera oscilaciones en frecuencias beta (15-30 Hz) y gamma (30-60 Hz) que se transmiten por la vía corticoespinal y se reflejan en el patrón de reclutamiento del EMG.
* La coherencia mide qué tan "sincronizadas" están ambas señales.

**Aplicaciones:**
* **ELA:** La pérdida de coherencia beta/gamma puede aparecer tempranamente, reflejando la degeneración de la vía corticomotoneuronal antes de que haya déficit clínico evidente.
* **ACV:** La pérdida de coherencia en la corteza motora afectada puede predecir la recuperación funcional motora.

**Limitaciones:**
* Es una técnica de investigación. No está estandarizada para uso clínico rutinario.
* Requiere equipo de EEG y EMG simultáneo de alta calidad.`,
          keyPoints: [
            'Mide sincronización entre EEG cortical y EMG muscular.',
            'Frecuencias beta (15-30 Hz) y gamma (30-60 Hz).',
            'Potencial uso temprano en ELA y pronóstico en ACV.',
            'Actualmente es técnica de investigación.',
          ]
        },
      ]
    },
    {
      id: 'pediatric-emg',
      title: 'EMG Pediátrica',
      children: [
        {
          id: 'pediatric-considerations',
          title: 'Consideraciones Especiales en Niños',
          content: `La EMG pediátrica requiere adaptaciones técnicas y clínicas específicas.

**Valores normativos ajustados por edad:**
* Los parámetros neurofisiológicos cambian drásticamente con la maduración del sistema nervioso periférico durante la infancia.
* Las velocidades de conducción son más lentas en neonatos (~50% del adulto) y alcanzan valores adultos alrededor de los 3-5 años con la mielinización completa.
* Las latencias distales son proporcionalmente más cortas por la longitud reducida de las extremidades.
* Es CRÍTICO usar tablas normativas pediátricas ajustadas por edad y talla.

**Técnicas preferidas en niños:**
* **SFEMG por Estimulación:** No requiere cooperación voluntaria. Ideal para niños que no pueden contraer músculos voluntariamente de forma sostenida.
* **QEMG Turns/Amplitude:** Rápido y fácil. No requiere esfuerzo máximo prolongado. Puede completarse en segundos durante una contracción breve.
* **Estimulación de nervio frénico:** Puede realizarse de forma segura en la cabecera del paciente pediátrico para evaluar la función diafragmática en sospecha de AME (Atrofia Muscular Espinal) o lesiones del nervio frénico.

**Consideraciones sobre sedación:**
* La sedación afecta la interpretación de los PUM y el patrón de reclutamiento voluntario.
* Los estudios de conducción nerviosa (NCS) son menos afectados por la sedación que la EMG de aguja.
* Si es necesaria la sedación, los estudios de conducción deben hacerse PRIMERO.
* La estimulación SFEMG y los estudios de ENR no requieren cooperación y pueden realizarse bajo sedación.`,
          clinicalPearls: [
            'En neonatos, las velocidades de conducción son ~50% de las del adulto. No interpretes un valor de 25 m/s en un recién nacido como anormal; puede ser completamente normal.',
            'La evaluación del nervio frénico es fundamental en la AME tipo 1 y 2. Un CMAP frénico bajo sugiere compromiso diafragmático severo.',
          ],
          keyPoints: [
            'Velocidades de conducción neonatales: ~50% del adulto.',
            'Valores adultos se alcanzan a los 3-5 años.',
            'SFEMG por Estimulación y QEMG: No requieren cooperación.',
            'Sedación: Hacer conducción nerviosa ANTES de la EMG de aguja.',
            'Tablas normativas pediátricas ajustadas por edad y talla son obligatorias.',
          ]
        },
      ]
    },
  ]
};
