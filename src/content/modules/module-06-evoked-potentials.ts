// src/content/modules/module-06-evoked-potentials.ts
import { Module } from '../../types/content';

export const module06: Module = {
  id: 'evoked-potentials',
  number: 6,
  title: 'Potenciales Evocados',
  titleEn: 'Evoked Potentials',
  emoji: '🧠',
  description: 'PEV, PEATC, PESS, PEM, potenciales cognitivos y electroretinografía con detalle clínico profundo',
  descriptionEn: 'VEP, BAEP, SSEP, MEP, cognitive potentials, and electroretinography with deep clinical detail',
  color: 'from-indigo-500 to-indigo-800',
  icon: 'Brain',
  topics: [
    {
      id: 'ep-fundamentals',
      title: 'Fundamentos de Potenciales Evocados',
      children: [
        {
          id: 'averaging-principle',
          title: 'Principio de la Promediación de Señales',
          content: `Los potenciales evocados (PE) son respuestas eléctricas del sistema nervioso generadas tras un estímulo sensorial específico (visual, auditivo o somatosensorial). Su amplitud es extremadamente pequeña: entre 0.1 y 20 µV, mientras que la actividad de fondo del EEG es de 50-100 µV. Es decir, la señal que nos interesa está "enterrada" en el ruido.

**La Promediación (Averaging):**
Es la técnica que hace posible extraer esta señal del ruido. Funciona así:
* Se aplica el mismo estímulo cientos o miles de veces.
* La respuesta evocada ocurre SIEMPRE en el mismo momento después del estímulo (está "sincronizada"), por lo que se suma constructivamente con cada repetición.
* El ruido del EEG es aleatorio, por lo que se va cancelando con cada repetición.
* La mejora de la relación señal/ruido es proporcional a la raíz cuadrada del número de repeticiones (√N). Por ejemplo, promediar 100 estímulos mejora la señal 10 veces.

**Amplificación:**
Las señales bioeléctricas son tan pequeñas que el equipo debe amplificarlas entre 50,000 y 250,000 veces para que los microprocesadores puedan analizarlas.

**Filtros:**
Son esenciales para eliminar el ruido eléctrico conservando las frecuencias de interés:
* **Filtro de alta frecuencia (low-pass):** Elimina ruido de alta frecuencia (artefacto muscular, interferencia eléctrica).
* **Filtro de baja frecuencia (high-pass):** Elimina la deriva lenta de la línea base.
* Los filtros deben usarse con precaución: modificar los cortes sin entenderlos puede distorsionar las ondas, simulando una patología inexistente.`,
          clinicalPearls: [
            'Subir el filtro de baja frecuencia (high-pass) disminuye la amplitud y la duración de las ondas. Bajar el filtro de alta frecuencia (low-pass) prolonga las latencias y reduce las amplitudes. Ambos efectos pueden simular patología.',
            'La piel y el tejido subcutáneo actúan como un filtro natural de alta frecuencia. Si los electrodos no están bien adheridos a la piel, las amplitudes caen artificialmente.',
          ],
          keyPoints: [
            'Amplitud de PE: 0.1-20 µV (vs. EEG 50-100 µV).',
            'La promediación extrae la señal sincronizada y cancela el ruido aleatorio.',
            'Mejora de señal/ruido = √N (100 promedios = 10x mejor señal).',
            'Amplificación necesaria: 50,000-250,000x.',
            'Los filtros incorrectos pueden crear artefactos que simulan patología.',
          ]
        },
        {
          id: 'wave-nomenclature',
          title: 'Nomenclatura de Ondas y Parámetros de Análisis',
          content: `Las ondas de los potenciales evocados se nombran siguiendo convenciones específicas:

**Por Polaridad y Latencia:**
* **N** = Onda Negativa (hacia arriba en la convención clínica). **P** = Onda Positiva (hacia abajo).
* El número indica la latencia aproximada en milisegundos. Ejemplo: **N20** = onda negativa a ~20 ms; **P100** = onda positiva a ~100 ms.

**Por Números Romanos (PEATC):**
* En los PEATC se usan números romanos (I, II, III, IV, V) que corresponden a generadores anatómicos específicos del tallo cerebral.

**Parámetros que se analizan:**
* **Latencia Absoluta:** Tiempo desde el estímulo hasta el pico de la onda. El parámetro más importante en PE.
* **Latencia Interpico (IPL):** Diferencia de latencia entre dos picos. Refleja la conducción entre dos puntos del SNC (ej. intervalo I-V en PEATC).
* **Amplitud:** Menos confiable que la latencia por su alta variabilidad. Más útil como ratio (ej. amplitud V/I en PEATC).
* **Asimetría Interocular o Interaural:** Comparar los dos lados es más sensible que usar valores absolutos. Diferencias significativas sugieren lesión unilateral.`,
          keyPoints: [
            'Latencia absoluta = parámetro más confiable.',
            'Latencia interpico = conducción entre dos puntos del SNC.',
            'Amplitud = alta variabilidad, útil solo como ratio o comparación bilateral.',
            'Asimetría entre lados es más sensible que valores absolutos.',
          ]
        },
        {
          id: 'ep-equipment',
          title: 'Equipo y Configuración Técnica',
          content: `El equipo para potenciales evocados consta de los siguientes elementos:

**Componentes básicos:**
* **Generador de estímulos:** Pantalla de damero (PEV), auriculares (PEATC), estimulador eléctrico (PESS), o bobina magnética (PEM).
* **Electrodos de registro:** De superficie (copa de oro o disco de Ag/AgCl), colocados según el sistema 10-20 internacional.
* **Amplificador diferencial:** Amplifica la diferencia entre el electrodo activo y la referencia, cancela el ruido común (modo común).
* **Convertidor analógico-digital (ADC):** Digitaliza la señal para procesamiento.
* **Promediador (Averager):** Software que acumula y promedia las respuestas.

**Impedancia de electrodos:**
* Debe ser menor de 5 kΩ (idealmente menor de 2 kΩ).
* Impedancia alta = más ruido = se necesitan más promediaciones = estudio más largo.
* Impedancia desigual entre electrodos reduce el rechazo de modo común del amplificador.

**Rechazo de artefactos:**
Los sistemas modernos detectan y descartan automáticamente los "barridos" (sweeps) contaminados por artefactos musculares, parpadeo o movimiento ocular, asegurando que solo se promedien respuestas limpias.`,
          clinicalPearls: [
            'Si la impedancia está alta, NO subas la ganancia del amplificador para compensar; esto solo amplificará más ruido. Mejor reprepara la piel y reaplica los electrodos.',
          ],
          keyPoints: [
            'Impedancia ideal: menor de 5 kΩ (mejor menor de 2 kΩ).',
            'Sistema 10-20 para colocación estandarizada de electrodos.',
            'El rechazo automático de artefactos mejora la calidad de la promediación.',
          ]
        },
      ]
    },
    {
      id: 'vep',
      title: 'Potenciales Evocados Visuales (PEV)',
      children: [
        {
          id: 'pattern-reversal',
          title: 'Técnica de Patrón Reverso (Damero)',
          content: `El PEV por patrón reverso es la técnica estándar por su alta reproducibilidad.

**Estímulo:**
* Un tablero de ajedrez (damero) blanco y negro que alterna ("reversa") los cuadros a una frecuencia de ~2 Hz (2 reversiones/segundo).
* El paciente fija la vista en un punto central rojo.
* El tamaño de los cuadros afecta el resultado: cuadros pequeños (15') evalúan la mácula (visión central); cuadros grandes (60') evalúan visión periférica.

**Registro:**
* Electrodo activo en **Oz** (corteza occipital, línea media).
* Referencia en **Fz** (frente).
* Tierra en vertex o mastoides.
* Se promediaban típicamente 100-200 respuestas.

**Estimulación monocular:**
* Cada ojo se estimula por separado (el otro cubierto) para detectar lesiones unilaterales del nervio óptico.
* La estimulación binocular solo se usa como screening; una anormalidad binocular requiere confirmación monocular.

**PEV por Flash:**
Alternativa cuando el paciente no puede fijar la vista (coma, neonatos, opacidad de medios). Es menos reproducible y menos específico que el patrón reverso.`,
          clinicalPearls: [
            'El PEV por patrón reverso requiere que el paciente fije la vista. Si el paciente parpadea mucho o no fija, la P100 puede ser irreproducible o de baja amplitud. NO confundir esto con patología.',
            'Verifica siempre la agudeza visual ANTES del estudio. Una mala agudeza visual no corregida puede prolongar la P100 sin que signifique desmielinización.',
          ],
          keyPoints: [
            'Damero con reversión a ~2 Hz. Fijación en punto central obligatoria.',
            'Registro en Oz (corteza occipital).',
            'Estimulación monocular para detectar lesiones unilaterales.',
            'Cuadros pequeños evalúan mácula; cuadros grandes evalúan periferia.',
          ]
        },
        {
          id: 'p100',
          title: 'Componente P100',
          content: `La onda **P100** es el componente más importante y reproducible del PEV.

**Características normales:**
* **Polaridad:** Positiva (por eso "P").
* **Latencia:** Aproximadamente 100 ms (±10 ms). El valor exacto varía por laboratorio.
* **Generador:** La corteza visual primaria (área 17 de Brodmann) y las áreas visuales de asociación.
* **Amplitud:** Típicamente 5-15 µV. Aunque variable, una amplitud muy asimétrica entre ojos (ratio mayor de 2:1) sugiere patología.

**Vía evaluada:**
El PEV evalúa toda la vía visual retino-cortical: Retina → Nervio Óptico → Quiasma Óptico → Tracto Óptico → Cuerpo Geniculado Lateral (Tálamo) → Radiaciones Ópticas → Corteza Visual (V1).

**Interpretación de anomalías:**
* **Latencia prolongada con amplitud conservada:** Desmielinización. Hallazgo clásico de neuritis óptica/esclerosis múltiple.
* **Amplitud reducida con latencia normal:** Lesión axonal o compresiva (tumor, glaucoma avanzado).
* **Ausencia de P100:** Lesión severa del nervio óptico o ceguera cortical.`,
          keyPoints: [
            'P100: Onda positiva a ~100 ms, registrada en Oz.',
            'Latencia prolongada + Amplitud normal = Desmielinización (EM).',
            'Amplitud reducida + Latencia normal = Lesión axonal/compresiva.',
            'Diferencia interocular de latencia mayor de 8 ms = significativa.',
          ]
        },
        {
          id: 'vep-clinical',
          title: 'Aplicaciones Clínicas del PEV',
          content: `El PEV es la herramienta más sensible para detectar desmielinización subclínica del nervio óptico.

**Esclerosis Múltiple (EM):**
* En pacientes con neuritis óptica previa, la P100 está prolongada en el 85-100% de los casos.
* En EM sin antecedente de neuritis óptica, la sensibilidad es del 30-60%.
* Los Criterios de McDonald incluyen el PEV como evidencia de diseminación en espacio (una lesión clínica + PEV anormal puede cumplir criterios diagnósticos).
* El PEV puede estar anormal durante AÑOS después de un episodio de neuritis óptica, incluso con recuperación visual completa.

**Otras aplicaciones:**
* **Neuritis óptica no desmielinizante:** Neuropatía óptica isquémica, tóxica (metanol, etambutol), compresiva (tumores de la vía visual).
* **Leucodistrofias:** La prolongación de la P100 ocurre en enfermedades desmielinizantes como la adrenoleucodistrofia.
* **Pronóstico en coma:** PEV anormal en coma post-hipóxico indica mal pronóstico visual.
* **Monitorización intraoperatoria:** Durante cirugía de tumores cerca de la vía visual.
* **Evaluación funcional en neonatos y pacientes no colaboradores:** Usando PEV por flash.`,
          clinicalPearls: [
            'Un PEV normal NO descarta EM. Solo evalúa una vía (la visual). Un paciente puede tener desmielinización en médula sin afectar el nervio óptico.',
            'La P100 puede permanecer prolongada indefinidamente después de una neuritis óptica, incluso con visión 20/20. No la uses para monitorizar la mejoría clínica.',
          ],
          keyPoints: [
            'PEV: sensibilidad del 85-100% en EM con neuritis óptica previa.',
            'Los Criterios de McDonald aceptan el PEV como evidencia de diseminación en espacio.',
            'La P100 puede quedar prolongada para siempre tras una neuritis, sin implicar enfermedad activa.',
          ]
        },
        {
          id: 'flash-multifocal',
          title: 'PEV por Flash y PEV Multifocal',
          content: `Variantes del PEV estándar para situaciones especiales.

**PEV por Flash:**
* Usa un estroboscopio o LEDs rojos que emiten destellos de luz.
* **Indicaciones:** Pacientes que no pueden fijar la vista (neonatos, coma, opacidad de medios oculares como cataratas).
* **Limitaciones:** Alta variabilidad inter-sujeto, menor reproducibilidad que el patrón reverso. Los componentes principales (N2, P2) tienen latencias más variables.
* Es un estudio de screening: un PEV por flash normal confirma que la vía visual retino-cortical conduce, pero uno anormal NO localiza la lesión.

**PEV Multifocal (mfVEP):**
* Técnica moderna que estimula múltiples regiones del campo visual simultáneamente usando un patrón pseudoaleatorio.
* Permite crear un "mapa topográfico" de la función visual cortical.
* Puede detectar defectos campimétricos (escotomas) que el PEV convencional no detecta.
* Más sensible para glaucoma y neuropatía óptica que el PEV convencional.`,
          keyPoints: [
            'PEV Flash: Para pacientes no colaboradores (neonatos, coma).',
            'PEV Flash: Menor reproducibilidad que patrón reverso.',
            'PEV Multifocal: Crea mapa topográfico de la función visual.',
          ]
        },
      ]
    },
    {
      id: 'baep',
      title: 'PEATC (Potenciales Evocados Auditivos de Tallo Cerebral)',
      children: [
        {
          id: 'waves-i-v',
          title: 'Ondas I-V: Generadores Anatómicos',
          content: `Los PEATC evalúan objetivamente la vía auditiva desde los receptores cocleares hasta el colículo inferior del mesencéfalo. Se generan en los primeros 10 ms después del estímulo (son potenciales de "latencia corta").

**Estímulo:**
* Clicks producidos por auriculares a 70-90 dB por encima del umbral auditivo.
* Frecuencia de estimulación: 10-20 clicks por segundo.
* Se enmascara el oído contralateral con ruido blanco para evitar conducción cruzada.

**Las 5 ondas y sus generadores anatómicos:**
* **Onda I:** Porción distal del nervio auditivo (VIII par craneal en su segmento coclear).
* **Onda II:** Porción proximal del nervio auditivo y/o núcleo coclear.
* **Onda III:** Complejo olivar superior (puente bajo).
* **Onda IV:** Lemnisco lateral (puente alto).
* **Onda V:** Colículo inferior (unión ponto-mesencefálica). Es la onda más prominente y constante. Se identifica como un pico positivo seguido de una gran deflexión negativa.

**Importante:** Cada onda no proviene de un único generador; refleja la activación sincrónica de varios grupos neuronales en la vecindad de esas estructuras.`,
          clinicalPearls: [
            'La Onda V es la más robusta y la última en desaparecer cuando se baja la intensidad del estímulo. Es la onda que se busca para el screening auditivo neonatal.',
            'Las ondas II y IV son frecuentemente difíciles de identificar y no siempre están presentes en estudios normales. No interpretes su ausencia como patología.',
          ],
          keyPoints: [
            'Onda I: Nervio auditivo. Onda II: Núcleo coclear.',
            'Onda III: Complejo olivar superior (puente bajo).',
            'Onda IV: Lemnisco lateral. Onda V: Colículo inferior (la más constante).',
            'Todo ocurre en los primeros 10 ms post-estímulo.',
          ]
        },
        {
          id: 'interpeak-intervals',
          title: 'Intervalos Interpico (I-III, III-V, I-V)',
          content: `Los intervalos entre picos son los parámetros más valiosos de los PEATC porque reflejan la conducción en el tallo cerebral y son menos afectados por factores periféricos como la audición.

**Intervalo I-III:** Refleja la conducción desde el nervio auditivo hasta el puente bajo.
* Prolongación sugiere lesión a nivel del nervio VIII o puente bajo.
* Normal: ~2.1 ms.

**Intervalo III-V:** Refleja la conducción desde el puente bajo hasta el mesencéfalo.
* Prolongación sugiere lesión en puente alto o mesencéfalo.
* Normal: ~1.9 ms.

**Intervalo I-V:** El intervalo más utilizado. Refleja toda la conducción central auditiva.
* Normal: ~4.0 ms (variabilidad por laboratorio).
* Prolongación mayor de 4.4 ms es significativa.

**Comparación interaural:**
* Se comparan los intervalos I-V del oído derecho vs. izquierdo.
* Una diferencia mayor de 0.3-0.4 ms entre lados es significativa y sugiere lesión unilateral.

**Ratio de amplitud V/I:**
* Normal: mayor de 0.5 (la onda V es al menos la mitad de la onda I).
* Ratio menor de 0.5 sugiere patología retrococlear.`,
          keyPoints: [
            'I-III (~2.1 ms): Nervio VIII → Puente bajo.',
            'III-V (~1.9 ms): Puente bajo → Mesencéfalo.',
            'I-V (~4.0 ms): Toda la conducción central auditiva.',
            'Diferencia interaural mayor de 0.3 ms = significativa.',
            'Ratio V/I menor de 0.5 = sospecha de lesión retrococlear.',
          ]
        },
        {
          id: 'baep-applications',
          title: 'Aplicaciones Clínicas de los PEATC',
          content: `Los PEATC tienen aplicaciones que abarcan desde la neonatología hasta la determinación de muerte cerebral.

**Schwannoma Vestibular (Neurinoma del Acústico):**
* Es la indicación "clásica" de los PEATC.
* El tumor comprime el nervio VIII, prolongando la Onda I y el intervalo I-III.
* En tumores grandes, la Onda I puede desaparecer.
* Sensibilidad: 90-95% para tumores mayores de 1 cm; menor para tumores pequeños (la RM con gadolinio es más sensible para tumores menores de 1 cm).

**Esclerosis Múltiple:**
* Las placas desmielinizantes en el tallo cerebral prolongan los intervalos interpico.
* Sensibilidad: 50-70% en EM definida. Complementa al PEV y PESS.

**Muerte Cerebral:**
* Criterio: Ausencia de ondas II a V con preservación de la Onda I.
* La Onda I se genera en el nervio periférico (fuera del cerebro) por lo que se preserva. La ausencia de las ondas centrales confirma la cesación de la función del tallo.
* Criterio legal en muchos países como evidencia paraclínica de muerte cerebral.

**Screening Auditivo Neonatal:**
* Se busca la presencia de la Onda V a intensidades bajas (30-35 dB).
* Si la Onda V está presente a baja intensidad, la audición es funcional.
* Permite detección precoz de sordera congénita antes de los 3 meses de vida.

**Monitorización Intraoperatoria:**
* En cirugías de fosa posterior (resistención de tumores cerebellopontinos), los PEATC se monitorizan en tiempo real para detectar lesión del nervio VIII o del tallo cerebral durante la intervención.`,
          clinicalPearls: [
            'Para tumores menores de 1 cm del ángulo cerebellopontino, la RM con gadolinio es más sensible que los PEATC. Sin embargo, los PEATC siguen siendo útiles como estudio funcional complementario.',
            'En muerte cerebral, la Onda I DEBE estar presente para que el estudio sea interpretable. Si no hay Onda I (ej. por otitis o sordera preexistente), el estudio no es válido para este fin.',
          ],
          keyPoints: [
            'Neurinoma: Prolongación de Onda I y/o intervalo I-III.',
            'Muerte cerebral: Ondas II-V ausentes + Onda I preservada.',
            'Screening neonatal: Presencia de Onda V a 30-35 dB = audición funcional.',
          ]
        },
        {
          id: 'auditory-audiometry',
          title: 'Audiometría de Potenciales Evocados',
          content: `Los PEATC pueden usarse para estimar el umbral auditivo de forma objetiva, sin requerir la colaboración del paciente.

**Técnica:**
* Se repiten los PEATC a intensidades progresivamente más bajas (80, 60, 40, 30, 20 dB).
* El "umbral electrofisiológico" es la mínima intensidad a la que se identifica la Onda V.
* Este umbral electrofisiológico se correlaciona con el umbral audiométrico conductual, con una diferencia de ~5-10 dB.

**Indicaciones:**
* Neonatos y lactantes (no pueden colaborar con audiometría convencional).
* Pacientes con discapacidad intelectual.
* Simulación de sordera (mediciones medicolegales).
* Confirmación de umbrales en candidatos a implante coclear.

**Limitaciones:**
* Los PEATC evalúan principalmente las frecuencias altas (2000-4000 Hz, que es donde el click tiene más energía). No evalúan adecuadamente las frecuencias bajas (500-1000 Hz). Para esto se utilizan los PEATC con tono burst o los potenciales de estado estable (ASSR).`,
          keyPoints: [
            'El umbral electrofisiológico se correlaciona con el audiométrico ±5-10 dB.',
            'Evalúa principalmente frecuencias altas (2-4 kHz).',
            'ASSR (Auditory Steady-State Response) complementa para frecuencias bajas.',
          ]
        },
      ]
    },
    {
      id: 'ssep',
      title: 'Potenciales Evocados Somatosensoriales (PESS)',
      children: [
        {
          id: 'median-ssep',
          title: 'PESS del Nervio Mediano',
          children: [
            {
              id: 'erb-n13-n14-n20',
              title: 'Componentes: Erb, N13, N14, N20',
              content: `El PESS del nervio mediano evalúa toda la vía somatosensorial desde la muñeca hasta la corteza.

**Estímulo:**
* Estimulación eléctrica del nervio mediano en la muñeca.
* Intensidad suficiente para producir un movimiento mínimo del pulgar (estimulación motora umbral) o justo por encima del umbral sensitivo.
* Frecuencia de estimulación: 3-5 Hz.
* Se promedian 500-2000 respuestas.

**Componentes y generadores:**
* **N9 (Punto de Erb):** Se registra en la fosa supraclavicular. Refleja el potencial de acción compuesto del plexo braquial. Es el marcador del segmento periférico.
* **N13 (Cervical):** Se registra en la columna cervical (C5-C7). Su generador principal es el cuerno dorsal de la médula cervical (circuito segmentario). Refleja la llegada del impulso al primer relevo espinal.
* **N14 (Subcortical):** Generado en el lemnisco medial a nivel del tallo cerebral (unión bulbomedular/cervicomedular). Refleja la conducción ascendente por las columnas posteriores.
* **N20 (Cortical):** Se registra sobre la corteza somatosensorial primaria (C3' o C4', contralateral al estímulo). Generado en el área 3b de la corteza S1. Es el primer componente cortical.

**Intervalos clave:**
* **Erb → N13:** Conducción periférica (brazo-médula). Normal: ~4.0 ms.
* **N13 → N20: Tiempo de Conducción Central (TCC).** Éste es el valor más importante. Refleja la conducción desde la médula cervical hasta la corteza. Normal: menor de 6.0 ms en adultos.
* Una prolongación del TCC indica lesión entre la médula cervical y la corteza (mielopatía, lesión de columnas posteriores, lesión del tallo cerebral, o lesión talamocortical).`,
              clinicalPearls: [
                'Si el N13 está ausente pero el N20 está presente, puede haber una mielopatía cervical que destruyó el generador segmentario sin interrumpir completamente la vía ascendente.',
                'Para calcular el TCC, NECESITAS el N13. Sin él, no puedes separar la conducción periférica de la central.',
              ],
              keyPoints: [
                'N9 (Erb): Plexo braquial. N13: Médula cervical.',
                'N14: Lemnisco medial/tallo cerebral. N20: Corteza S1.',
                'TCC (N13→N20): menor de 6.0 ms. Prolongación = mielopatía u otra lesión central.',
              ]
            },
            {
              id: 'central-conduction-time',
              title: 'Tiempo de Conducción Central (TCC)',
              content: `El TCC es el parámetro más valioso de los PESS, porque aísla la conducción del sistema nervioso central eliminando el componente periférico.

**Cálculo:**
* TCC del nervio mediano = Latencia N20 − Latencia N13.
* TCC del nervio tibial = Latencia P37 − Latencia N22.

**Valores normales:**
* TCC Mediano: menor de 6.0 ms (típicamente 5.5-5.7 ms).
* TCC Tibial: menor de 21-22 ms.

**Factores que prolongan el TCC:**
* Desmielinización de columnas posteriores (Esclerosis Múltiple, Deficiencia de B12).
* Mielopatía cervical espondilótica (compresión medular crónica).
* Lesiones del tallo cerebral.
* Lesiones talámicas.

**Diferencia entre TCC central y periférico:**
* Si TANTO el TCC como la latencia periférica (N9→N13) están prolongados, la lesión puede ser periférica (neuropatía) y no necesariamente central.
* Si SOLO el TCC está prolongado con conducción periférica normal, la lesión es definitivamente central.`,
              keyPoints: [
                'TCC = Latencia cortical − Latencia espinal.',
                'TCC Mediano normal: menor de 6.0 ms.',
                'TCC Tibial normal: menor de 21-22 ms.',
                'TCC prolongado con conducción periférica normal = Lesión central confirmada.',
              ]
            },
          ]
        },
        {
          id: 'tibial-ssep',
          title: 'PESS del Nervio Tibial',
          children: [
            {
              id: 'popliteal-l1-p37',
              title: 'Componentes: Poplíteo, L1/T12, P37',
              content: `El PESS del nervio tibial evalúa la vía somatosensorial desde el tobillo hasta la corteza, cubriendo las regiones lumbar, torácica y cervical de la médula.

**Estímulo:**
* Estimulación del nervio tibial posterior en el tobillo (detrás del maléolo medial).
* Frecuencia: 3-5 Hz. Se promedian 1000-2000 respuestas (más que el mediano porque la señal cortical es más pequeña).

**Componentes y generadores:**
* **N7 (Hueco Poplíteo):** Potencial de acción del nervio tibial al pasar por la fosa poplítea. Marcador periférico.
* **N22 (L1/T12):** Se registra con electrodos de superficie sobre las espinosas L1 o T12. Refleja la actividad de la cauda equina y el cono medular al entrar el impulso a la médula.
* **P37 (Cortical):** Componente cortical positivo registrado en Cz (vertex). Generado en la corteza somatosensorial del lóbulo parasagital (representación de la pierna en el homúnculo sensitivo, localizada en la cisura interhemisférica).
* **N45:** Componente negativo que sigue al P37.

**TCC Tibial:**
* TCC = P37 − N22.
* Normal: menor de 21-22 ms.
* Prolongación indica lesión en la médula torácica, lumbar o en el tallo cerebral.

**Ventaja sobre el mediano:**
El PESS tibial es más sensible para detectar mielopatía TORÁCICA (la porción más larga de la médula). El PESS mediano solo cubre desde la cervical.`,
              clinicalPearls: [
                'En la mielopatía cervical, tanto el PESS mediano como el tibial estarán alterados. Si solo el tibial está anormal con un mediano normal, la lesión probablemente está en la médula torácica.',
                'El P37 se registra en Cz (vertex) porque la representación cortical de la pierna está en la parte medial/superior del hemisferio, dentro de la cisura interhemisférica.',
              ],
              keyPoints: [
                'N22 (L1/T12): Cauda equina/cono medular.',
                'P37 (Cz, vertex): Corteza somatosensorial (pierna).',
                'TCC Tibial: P37 − N22. Normal: menor de 21-22 ms.',
                'Más sensible que el mediano para mielopatía torácica.',
              ]
            },
          ]
        },
        {
          id: 'dermatomal-ssep',
          title: 'PESS Dermatomales',
          content: `Los PESS dermatomales estimulan un dermatoma específico en lugar de un tronco nervioso mixto, lo que los hace más específicos para evaluar raíces nerviosas individuales.

**Técnica:**
* Se estimulan superficies cutáneas correspondientes a dermatomas específicos: L4 (cara medial de la pierna), L5 (dorso del pie), S1 (cara lateral del pie).
* La estimulación es puramente sensitiva (no hay componente motor).

**Ventajas sobre PESS de tronco nervioso:**
* El PESS del nervio tibial mezcla información de varias raíces (L4-S2). Una radiculopatía de una sola raíz puede quedar "diluida" en el potencial compuesto y pasar inadvertida.
* Los PESS dermatomales evalúan una raíz específica.

**Limitaciones:**
* Mayor variabilidad inter-sujeto (la distribución de los dermatomas varía entre personas).
* Amplitudes cortilcales más pequeñas, requiriendo más promediaciones.
* No están tan estandarizados como los PESS de tronco.

**Indicaciones principales:**
* Radiculopatía lumbosacra cuando la electromiografía de aguja es negativa o equívoca.
* Evaluación de múltiples niveles radiculares en estenosis espinal.`,
          keyPoints: [
            'Estimulan un dermatoma específico (L4, L5, S1), no un tronco nervioso.',
            'Más específicos para radiculopatía individual.',
            'Mayor variabilidad, menor estandarización que los PESS de tronco.',
          ]
        },
        {
          id: 'ssep-clinical',
          title: 'Aplicaciones Clínicas de los PESS',
          content: `Los PESS evalúan la integridad funcional de las columnas posteriores (fascículo grácil y cuneado), que transmiten tacto fino, vibración y propiocepción.

**Indicaciones principales:**

* **Mielopatía cervical espondilótica:** TCC mediano prolongado. Puede detectar compromiso medular subclínico antes de que se desarrolle el cuadro clínico completo.
* **Esclerosis Múltiple:** Los PESS contribuyen como evidencia de diseminación en espacio. Sensibilidad del 50-70% en EM definida. Son más sensibles para lesiones de la médula que los PEV (que solo evalúan la vía visual).
* **Lesión medular traumática:** Evalúan la función residual de las columnas posteriores. Útil en clasificación ASIA del trauma medular.
* **Degeneración combinada subaguda (Deficiencia de B12):** Desmielinización selectiva de las columnas posteriores. TCC prolongado.
* **Monitorización intraoperatoria de columna:** Es una de las indicaciones MÁS importantes de los PESS. Se monitorizan en tiempo real durante cirugía de escoliosis, tumores medulares y cirugía de aorta torácica. Una caída del 50% en la amplitud o un aumento del 10% en la latencia es una alerta de riesgo medular.
* **Pronóstico en coma post paro cardíaco:** La **ausencia bilateral de N20** en las primeras 24-72 horas post-paro tiene un valor predictivo positivo del 99-100% para mal pronóstico neurológico. Es uno de los predictores más confiables.`,
          clinicalPearls: [
            'La ausencia bilateral de N20 en coma post-hipóxico es el predictor INDIVIDUAL más confiable de mal pronóstico. Ningún otro test aislado tiene un valor predictivo positivo tan alto.',
            'Los PESS evalúan columnas posteriores (sensibilidad). NO evalúan la vía corticoespinal (motora). Para evaluar la vía motora se necesitan PEM (Potenciales Evocados Motores).',
          ],
          keyPoints: [
            'PESS = columnas posteriores (tacto fino, vibración, propiocepción).',
            'Monitorización intraoperatoria: Caída de 50% amplitud o aumento de 10% latencia = alerta.',
            'Coma post-paro: Ausencia bilateral de N20 = mal pronóstico (VPP ~100%).',
            'EM: Sensibilidad 50-70%. Evidencia de diseminación en espacio.',
          ]
        },
      ]
    },
    {
      id: 'mep',
      title: 'Potenciales Evocados Motores (PEM)',
      children: [
        {
          id: 'tms',
          title: 'Estimulación Magnética Transcraneal (EMT)',
          content: `La EMT es la técnica estándar para evaluar la vía motora corticoespinal de forma no invasiva.

**Principio:**
* Una bobina colocada sobre el cráneo genera un pulso magnético potente (hasta 1-2 Tesla, similar a una RM).
* El campo magnético induce una corriente eléctrica en el tejido cerebral que activa las neuronas corticomotoras.
* La respuesta se registra como un Potencial Evocado Motor (MEP) en un músculo blanco contralateral.

**Equipo:**
* Estimulador magnético (ej. Magstim 200) con bobina circular (para estudios básicos) o bobina en forma de 8 (para estimulación focal).
* Se coloca la bobina sobre la corteza motora primaria (C3/C4 del sistema 10-20, correspondiente al homúnculo motor de Penfield).
* Para determinar el umbral motor, se aplican estímulos progresivos desde el 70-90% de la intensidad máxima, con incrementos del 10%, hasta obtener un MEP reproducible.

**Registro:**
* **Miembro superior:** Se registra sobre el Abductor Pollicis Brevis (APB) o Primer Interóseo Dorsal.
* **Miembro inferior:** Se registra sobre el Tibial Anterior.
* El paciente debe realizar una contracción voluntaria leve del músculo blanco ("facilitación") para reducir el umbral.

**Ventajas de la EMT:**
* No invasiva e indolora (a diferencia de la estimulación eléctrica).
* Bien tolerada por la mayoría de los pacientes.

**Contraindicaciones:**
* Implantes metálicos intracraneales (clips quirúrgicos, electrodos).
* Marcapasos cardíaco.
* Epilepsia no controlada (la EMT puede precipitar crisis en pacientes predispuestos).
* Embarazo (precaución, no contraindicación absoluta).`,
          clinicalPearls: [
            'La facilitación voluntaria (el paciente contrae levemente el músculo) es ESENCIAL para obtener MEPs reproducibles en miembros inferiores. Sin facilitación, los MEPs de pierna pueden ser irreproducibles y falsamente anormales.',
            'La bobina en forma de 8 proporciona estimulación más focal que la circular, permitiendo mejor localización cortical.',
          ],
          keyPoints: [
            'La EMT genera un campo magnético que induce corriente eléctrica en el cerebro.',
            'Registro en APB (miembro superior) o Tibial Anterior (miembro inferior).',
            'Contraindicado: implantes metálicos intracraneales, marcapasos, epilepsia no controlada.',
            'Facilitación voluntaria reduce el umbral y mejora la reproducibilidad.',
          ]
        },
        {
          id: 'electrical-stimulation',
          title: 'Estimulación Eléctrica Transcraneal (EET)',
          content: `La estimulación eléctrica transcraneal es la alternativa a la EMT, utilizada principalmente en monitorización intraoperatoria.

**Principio:**
* Electrodos de aguja se insertan en el cuero cabelludo sobre la corteza motora.
* Se aplican pulsos eléctricos de alta intensidad (200-800 V, duración ~50 µs).
* La corriente activa directamente los axones de la vía corticoespinal (ondas D, directas) y los interneurones corticales (ondas I, indirectas).

**Ventajas sobre la EMT:**
* Funciona bajo anestesia general (la EMT requiere facilitación voluntaria, imposible bajo anestesia).
* Más consistente estímulo a estímulo.

**Desventajas:**
* Dolorosa (requiere sedación o anestesia general).
* Riesgo teórico de quemaduras en el cuero cabelludo.

**Aplicación principal:**
Monitorización intraoperatoria de la vía motora durante cirugías de columna, tumores cerebrales o procedimientos vasculares cerebrales.`,
          keyPoints: [
            'Usada principalmente en monitorización intraoperatoria (bajo anestesia).',
            'Ondas D (directas) + Ondas I (indirectas) = Activación corticoespinal.',
            'Más dolorosa que la EMT pero funciona sin colaboración del paciente.',
          ]
        },
        {
          id: 'cmct',
          title: 'Tiempo de Conducción Motora Central (TCMC)',
          content: `El TCMC es el equivalente motor del TCC sensitivo. Aísla la conducción de la vía corticoespinal, eliminando el componente periférico.

**Cálculo:**
* TCMC = Latencia del MEP cortical − Latencia del MEP al estimular la raíz espinal.
* Para estimar la latencia radicular, se puede: 1) Estimular magnéticamente sobre la columna cervical (C7) o lumbar (L4); o 2) Calcularla a partir de la onda F.

**Valores normales:**
* TCMC Miembro Superior (APB): menor de 8.0-9.0 ms.
* TCMC Miembro Inferior (Tibial Anterior): menor de 16-17 ms.

**Interpretación:**
* **TCMC prolongado:** Desmielinización de la vía corticoespinal. Hallazgo clásico en EM, mielopatía cervical espondilótica, y degeneración combinada subaguda.
* **Amplitud reducida del MEP:** Pérdida axonal corticoespinal. Hallazgo en ELA (aunque el TCMC puede estar normal o solo ligeramente prolongado en ELA).
* **Ausencia completa del MEP:** Bloqueo severo de la conducción corticoespinal o lesión axonal masiva.

**Diferencia respecto a los PESS:**
Los PEM evalúan la vía MOTORA (haz corticoespinal, columnas laterales), mientras que los PESS evalúan la vía SENSITIVA (columnas posteriores). Son COMPLEMENTARIOS. Una mielopatía cervical puede afectar ambas vías o selectivamente una sola.`,
          clinicalPearls: [
            'En la ELA, los PEM pueden ser normales en fases tempranas. La ausencia de MEPs o la reducción marcada de amplitud sugiere afectación de motoneurona superior, un hallazgo que complementa la EMG de aguja (que evalúa la motoneurona inferior).',
            'En la EM, el TCMC prolongado complementa al PEV prolongado y al PESS prolongado como triple evidencia de desmielinización en múltiples sitios.',
          ],
          keyPoints: [
            'TCMC = Latencia cortical − Latencia raíz espinal.',
            'TCMC MS normal: menor de 8-9 ms. MI normal: menor de 16-17 ms.',
            'TCMC prolongado = Desmielinización corticoespinal (EM, mielopatía).',
            'MEP ausente o reducido = Pérdida axonal corticoespinal (ELA, lesión medular severa).',
          ]
        },
        {
          id: 'mep-clinical',
          title: 'Aplicaciones Clínicas de los PEM',
          content: `Los PEM evalúan la integridad de la vía motora desde la corteza hasta el músculo.

**Esclerosis Múltiple:**
* TCMC prolongado por desmielinización de los haces corticoespinales.
* Complementa al PEV (vía visual) y PESS (vía sensitiva) para documentar diseminación en espacio.
* Los tres estudios juntos proporcionan la evaluación multimodal más completa.

**Esclerosis Lateral Amiotrófica (ELA):**
* Los PEM revelan afectación de la motoneurona superior, que puede ser difícil de demostrar clínicamente en fases tempranas.
* Hallazgos típicos: Amplitudes reducidas, TCMC normal o levemente prolongado, períodos silentes prolongados.
* Un MEP normal NO descarta ELA.

**Mielopatía cervical espondilótica:**
* TCMC prolongado que se correlaciona con la severidad de la estenosis.
* Útil para determinar si una estenosis radiológica tiene significancia funcional (no toda estenosis radiológica produce mielopatía).

**Monitorización intraoperatoria:**
* Complementa a los PESS.
* Los PESS monitorizan las columnas posteriores (irrigadas por las arterias espinales posteriores).
* Los PEM monitorizan las columnas laterales (irrigadas por la arteria espinal anterior).
* Un cambio mayor del 50% en amplitud o mayor del 10% en latencia del MEP intraoperatorio es criterio de alerta para riesgo medular.`,
          clinicalPearls: [
            'En monitorización intraoperatoria, la combinación de PESS + PEM da la cobertura más completa: columnas posteriores + columnas laterales = toda la médula espinal.',
          ],
          keyPoints: [
            'EM: TCMC prolongado. Complementa PEV y PESS.',
            'ELA: Amplitudes reducidas con TCMC casi normal. Evidencia de motoneurona superior.',
            'Monitorización: Caída mayor del 50% en amplitud = alerta de riesgo medular.',
            'PESS = columnas posteriores (art. espinales posteriores). PEM = columnas laterales (art. espinal anterior).',
          ]
        },
      ]
    },
    {
      id: 'cognitive-ep',
      title: 'Potenciales Evocados Cognitivos',
      children: [
        {
          id: 'p300',
          title: 'P300: Paradigma Oddball',
          content: `La P300 es un potencial evocado endógeno (depende de la atención del sujeto, no solo del estímulo físico). Refleja procesos cognitivos superiores.

**Paradigma Oddball:**
* Se presentan dos tipos de estímulos auditivos: uno FRECUENTE (80% de los estímulos, ej. tono de 1000 Hz) y uno INFRECUENTE ("target", 20%, ej. tono de 2000 Hz).
* El paciente debe contar o presionar un botón cuando escucha el estímulo infrecuente.
* La onda P300 aparece aproximadamente a 300 ms (rango 250-600 ms) solo cuando el sujeto detecta el estímulo infrecuente.

**Generadores:**
* No hay un generador único. Involucra hipocampo, corteza cingulada, corteza prefrontal y corteza temporal. Refleja un circuito amplio de atención, memoria de trabajo y actualización del contexto.

**Parámetros:**
* **Latencia:** Se prolonga normalmente con la edad (~1 ms por año después de los 20). También se prolonga con deterioro cognitivo, demencia, delirium y fatiga.
* **Amplitud:** Disminuye con la distracción y las demencias. Menos confiable que la latencia.

**Limitaciones:**
* Alta variabilidad inter e intraindividual.
* No es específica para ninguna enfermedad.
* Uso clínico complementario, no diagnóstico por sí sola.`,
          clinicalPearls: [
            'La P300 se prolonga ~1 ms por año de vida. Si un paciente de 60 años tiene una P300 de 350 ms, podría estar dentro de límites normales ajustados por edad.',
            'La P300 requiere atención activa. Si el paciente no entiende la tarea o no presta atención, la onda no se genera. Esto no indica deterioro cognitivo.',
          ],
          keyPoints: [
            'Paradigma Oddball: Estímulo frecuente (80%) + infrecuente "target" (20%).',
            'P300 aparece a ~300 ms cuando el sujeto detecta el target.',
            'Se prolonga con la edad (~1 ms/año) y con deterioro cognitivo.',
            'Alta variabilidad. Uso complementario, no diagnóstico definitivo.',
          ]
        },
        {
          id: 'cnv',
          title: 'Variación Negativa Contingente (CNV)',
          content: `La CNV es un potencial lento que refleja la preparación motora y la expectativa.

**Técnica:**
* Se presentan dos estímulos separados por un intervalo fijo (ej. 1.5 segundos).
* El primer estímulo (S1, advertencia) anuncia que el segundo estímulo (S2, imperativo) va a llegar.
* El paciente debe responder al S2 (ej. presionar un botón).
* Durante el intervalo S1-S2, aparece una lenta negatividad (la CNV) que refleja la preparación del cerebro para responder.

**Componentes:**
* **CNV temprana:** Refleja la orientación de la atención hacia el S1.
* **CNV tardía:** Refleja la preparación motora y la expectativa del S2.

**Aplicaciones (limitadas y de investigación):**
* Evaluación de funciones frontales (planificación, anticipación).
* Parkinson (CNV reducida por disfunción frontal).
* TDAH (alteraciones en la CNV reflejan déficits de atención sostenida).`,
          keyPoints: [
            'Refleja preparación motora y expectativa.',
            'Dos componentes: orientación (temprana) y preparación motora (tardía).',
            'Uso principalmente de investigación.',
          ]
        },
        {
          id: 'cognitive-application',
          title: 'Aplicaciones en Deterioro Cognitivo',
          content: `Los potenciales evocados cognitivos ofrecen una ventana electrofisiológica objetiva a las funciones mentales superiores.

**Demencias:**
* La P300 prolongada puede apoyar el diagnóstico temprano de deterioro cognitivo antes de que las pruebas neuropsicológicas sean claramente anormales.
* Sin embargo, NO distingue entre tipos de demencia (Alzheimer vs. vascular vs. frontotemporal).

**Monitorización de tratamiento:**
* Puede usarse para evaluar la respuesta a inhibidores de colinesterasa en Alzheimer (acortamiento de la P300 si el tratamiento es efectivo).

**Simulación:**
* Un paciente que simula deterioro cognitivo pero tiene una P300 normal probablemente tiene cognición intacta. Útil en contexto medicolegal.

**MMN (Mismatch Negativity):**
* Potencial más moderno que la P300. Aparece a los ~150-250 ms cuando el cerebro detecta automáticamente un cambio en una secuencia auditiva.
* NO requiere atención del sujeto (es preconsciente).
* Potencialmente más útil en pacientes que no pueden colaborar (coma, neonatos).`,
          keyPoints: [
            'P300 prolongada puede ser indicador temprano de deterioro cognitivo.',
            'No distingue tipos de demencia.',
            'MMN (Mismatch Negativity): No requiere atención, útil en no colaboradores.',
          ]
        },
      ]
    },
    {
      id: 'erg-eog',
      title: 'Electroretinografía (ERG) y Electrooculografía (EOG)',
      content: `Estas técnicas evalúan la función retiniana y no la vía visual central.

**Electroretinografía (ERG):**
* Registra la actividad eléctrica de la retina en respuesta a estímulos luminosos.
* Se usa un electrodo de contacto corneal (lente de Burian-Allen) o un electrodo de hilo de oro colocado en el fondo de saco conjuntival.
* **Componentes principales:** Onda A (fotorreceptores: conos y bastones), Onda B (células bipolares y de Müller).
* **Aplicaciones:** Retinitis pigmentosa, distrofias retinianas, retinopatía diabética, toxicidad por cloroquina/hidroxicloroquina, evaluación prequirúrgica de cataratas.

**ERG Multifocal (mfERG):**
* Registra simultáneamente la actividad de múltiples puntos de la retina.
* Genera un "mapa topográfico" de la función retiniana.
* Más sensible que el ERG convencional para detectar lesiones focales (ej. maculopatía por hidroxicloroquina).

**Electrooculografía (EOG):**
* Mide el potencial de reposo entre la córnea (positiva) y la retina (negativa).
* Se calcula el ratio de Arden (potencial en luz / potencial en oscuridad). Normal: mayor de 1.80.
* Ratio de Arden menor de 1.65 es anormal.
* **Aplicación principal:** Enfermedad de Best (distrofia viteliforme), donde el ERG es normal pero el EOG es anormal.`,
      clinicalPearls: [
        'En la enfermedad de Best, el ERG es NORMAL pero el EOG es ANORMAL (ratio de Arden bajo). Esta disociación ERG normal/EOG anormal es prácticamente diagnóstica.',
        'La toxicidad retiniana por hidroxicloroquina (usada en lupus y artritis reumatoide) puede detectarse con mfERG antes de que aparezcan cambios en el fondo de ojo. Se recomienda screening anual después de 5 años de uso.',
      ],
      keyPoints: [
        'ERG: Onda A = Fotorreceptores. Onda B = Células bipolares.',
        'mfERG: Mapa topográfico de función retiniana (screening de toxicidad por cloroquina).',
        'EOG: Ratio de Arden menor de 1.65 = anormal. Diagnóstico: Enfermedad de Best.',
        'Best: ERG normal + EOG anormal = diagnóstico.',
      ]
    },
  ]
};
