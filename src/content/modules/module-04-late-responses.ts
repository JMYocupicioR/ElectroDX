// src/content/modules/module-04-late-responses.ts
import { Module } from '../../types/content';

export const module04: Module = {
  id: 'late-responses',
  number: 4,
  title: 'Respuestas Tardías y Reflejos',
  titleEn: 'Late Responses and Reflexes',
  emoji: '🔄',
  description: 'Onda F, Reflejo H, reflejo axónico y reflejo de parpadeo',
  descriptionEn: 'F wave, H reflex, axon reflex and blink reflex',
  color: 'from-purple-500 to-purple-800',
  icon: 'RefreshCw',
  topics: [
    { id: 'f-wave', title: 'Onda F',
      children: [
        { id: 'f-wave-physiology', title: 'Fisiología de la Onda F', 
          content: `La Onda F es una respuesta motora tardía que aparece después del potencial de acción muscular compuesto (PAMC o respuesta M). **No es un verdadero reflejo**, ya que carece de sinapsis en la médula espinal; su circuito es puramente motor.

Se genera cuando un estímulo eléctrico viaja de forma *antidrómica* (hacia la médula espinal) por el axón motor hasta la motoneurona en el asta anterior, provocando una descarga recurrente. Esta motoneurona dispara un nuevo potencial de acción que viaja de forma *ortodrómica* (hacia el músculo) generando un pequeño potencial. Representa la activación de solo un 1% a 5% de las fibras musculares.`,
          keyPoints: [
            'No es un verdadero reflejo (puramente motor, sin sinapsis).',
            'Viaje antidrómico → asta anterior → viaje ortodrómico.',
            'Activa solo 1% a 5% de las fibras musculares.'
          ]
        },
        { id: 'f-wave-technique', title: 'Configuración y Técnica', 
          content: `Para obtener una onda F adecuada, el equipo debe configurarse cuidadosamente:

*   **Intensidad del estímulo:** Debe ser **supramáxima**. Asegura que todos los axones motores se despolaricen, evitando reflejos axónicos.
*   **Posición del estimulador:** El cátodo (electrodo negativo) debe colocarse en posición proximal para evitar un posible bloqueo anódico.
*   **Frecuencia:** No mayor a 0.5 Hz (1 pulso cada 2 segundos) para evitar dolor y habituación.
*   **Ganancia:** 200 µV/división (amplitud muy baja).
*   **Barrido:** 5-10 ms/división.
*   **Adquisición:** Registrar de 10 a 20 estímulos en cascada.`,
          clinicalPearls: [
            'Maniobra de Jendrassik: Si las Ondas F no aparecen, pide al paciente que apriete el puño contralateral o los dientes. Esto aumenta la excitabilidad del asta anterior facilitando la respuesta.',
            'Si la amplitud distal del PAMC es muy baja por daño axonal grave, la ausencia de Ondas F es esperada y no indica bloqueo proximal patológico.'
          ],
          keyPoints: [
            'Estímulo SUPRAMÁXIMO con cátodo proximal.',
            'Ganancia 200 µV/div; barrido 5-10 ms/div.',
            'Adquisición de 10-20 estímulos para análisis.'
          ]
        },
        { id: 'f-latencies', title: 'Valores Normales y Parámetros', 
          content: `El análisis de la Onda F considera múltiples mediciones a través de los trazos superpuestos:

*   **Latencia mínima:** Es el parámetro MÁS fiable, reflejando las fibras más rápidas. Normal: ≤31-32 ms (MS: mediano/cubital) y ≤56 ms (MI: tibial/peroneo). Debe ajustarse a la altura (Onda F estimada).
*   **Persistencia:** Porcentaje de estímulos que generan Onda F. Normal: **80% a 100%**. *Nota: en el nervio peroneo puede estar ausente en sanos.*
*   **Cronodispersión:** Diferencia entre latencia máxima y mínima. Normal: <4 ms en MS, <6 ms en MI.`,
          clinicalPearls: [
            'Variabilidad: A diferencia de otras respuestas, la Onda F varía en latencia y morfología con CADA estímulo, porque cada choque descarga una población diferente de motoneuronas.'
          ]
        },
        { id: 'f-wave-utility', title: 'Utilidad Clínica', 
          content: `Es un marcador altamente sensible para detectar **polirradiculoneuropatías desmielinizantes agudas y crónicas** (SGB, CIDP).

En el Síndrome de Guillain-Barré, las ondas F prolongadas o ausentes suelen ser el hallazgo anormal más temprano. También ayuda a evaluar radiculopatías (C8-T1 o L5-S1), aunque tiene limitación topográfica ya que evalúa toda la longitud del nervio.`,
          keyPoints: [
            'Marcador muy sensible para SGB y CIDP temprano.',
            'Evalúa segmentos proximales inaccesibles rutinariamente.'
          ]
        },
        { id: 'f-wave-repeaters', title: 'Repeaters (Ondas F Repetidas)', 
          content: `Los *repeaters* son un fenómeno patológico donde se obtienen Ondas F con **morfología y latencia idénticas** en trazos sucesivos. 

En un sujeto normal, la gran cantidad de motoneuronas hace que cada estímulo supramáximo active un grupo diferente al azar, resultando en ondas F que siempre varían. Sin embargo, cuando existe una **pérdida masiva e irreversible de motoneuronas del asta anterior** (ej. Esclerosis Lateral Amiotrófica - ELA), el equipo se ve obligado a reclutar iterativamente las mismas pocas unidades motoras sobrevivientes.

**Utilidad diagnóstica (ELA y reinervación):**
* Es un signo fisiopatológico de un "pool" de motoneuronas críticamente reducido con reinervación compensatoria en curso.
* Se asocia típicamente a una disminución drástica de la persistencia de la onda F (< 50%).
* Es invaluable para la detección temprana de daño de motoneurona inferior, incluso antes de que la EMG de aguja convencional muestre cambios crónicos definitivos (Criterios Awaji).`,
          clinicalPearls: [
            'Si ves la misma morfología exacta de la onda F aparecer una y otra vez (Repeaters) con una persistencia baja, debes sospechar fuertemente un proceso de pérdida neuronal progresiva tipo enfermedad de motoneurona o radiculopatía muy severa.'
          ],
          keyPoints: [
            'Repeaters = Ondas F idénticas en latencia y morfología.',
            'Indican pérdida masiva de motoneuronas (pool drásticamente reducido).',
            'Marcador temprano y crítico en Esclerosis Lateral Amiotrófica (ELA).'
          ]
        },
      ]
    },
    { id: 'h-reflex', title: 'Reflejo H (Hoffmann)',
      children: [
        { id: 'h-reflex-physiology', title: 'Fisiología', 
          content: `A diferencia de la Onda F, el Reflejo H **ES un verdadero reflejo espinal monosináptico**. Es el equivalente eléctrico del reflejo miotático (reflejo aquíleo).

La vía aferente (sensitiva) está mediada por las fibras gruesas mielinizadas Ia provenientes de los husos musculares, que tienen bajo umbral. Hacen sinapsis en la médula y la respuesta eferente baja por las motoneuronas alfa.`,
          keyPoints: [
            'Verdadero reflejo monosináptico.',
            'Vía aferente sensitiva Ia → sinapsis → vía eferente motora alfa.',
            'Equivalente eléctrico del reflejo aquíleo.'
          ]
        },
        { id: 'h-reflex-technique-collision', title: 'Técnica y Fenómeno de Colisión', 
          content: `Técnica de obtención:
*   **Intensidad:** Estímulo **submáximo**.
*   **Pulso:** Larga duración (1 ms / 1000 µs) para activar selectivamente las fibras Ia.
*   **Frecuencia:** <0.5 Hz.
*   **Registro clásico:** Estímulo en nervio tibial (hueco poplíteo), registro en sóleo/gastrocnemio.

**Fenómeno de Colisión:**
A intensidades bajas, aparece la respuesta H sin respuesta M. Al subir el estímulo progresivamente, aparece la onda M. Si la intensidad es *supramáxima*, la onda M crece y **el Reflejo H disminuye hasta desaparecer** por colisión antidrómica de los potenciales motores.`,
          clinicalPearls: [
            'Estabilidad: A diferencia de la Onda F, el Reflejo H tiene latencia y forma (usualmente trifásica) muy constantes ante un estímulo fijo.'
          ],
          keyPoints: [
            'Estímulo SUBMÁXIMO con pulso largo (1 ms).',
            'Sube el estímulo → H aparece. Sube a supramáximo → H desaparece por colisión.'
          ]
        },
        { id: 'h-reflex-values-utilty', title: 'Valores Normales y Utilidad', 
          content: `Valores Normales:
*   **Latencia:** Típicamente entre 25-34 ms (evaluado con nomogramas por estatura).
*   **Diferencia interlado:** Cualquier diferencia **>1.5 ms** (lado enfermo vs. sano) es patológica.

Utilidad principal:
*   Es la prueba más sensible y específica para **radiculopatía S1**.
*   Detecta polineuropatías tempranas y plexopatías lumbosacras.`,
          clinicalPearls: [
            'La ausencia bilateral del Reflejo H en mayores de 60 años puede ser un hallazgo fisiológico correlacionado con la pérdida natural de los reflejos aquíleos.'
          ],
          keyPoints: [
            'Diferencia de latencia H >1.5 ms interlado = Patológico.',
            'Prueba de oro para Radiculopatía S1.'
          ]
        },
        { id: 'h-reflex-hm-ratio', title: 'Relación H/M (Excitabilidad del Asta Anterior)', 
          content: `La relación H/M ($H_{max}/M_{max}$) es el cociente entre la amplitud máxima del reflejo H y la amplitud máxima del potencial motor (onda M). Evalúa cuantitativamente la fracción del total de la piscina de motoneuronas del asta anterior que puede ser descargada por activación refleja aferente.

**Fisiopatología en el Síndrome de Motoneurona Superior (Piramidal):**
Normalmente, el reflejo H está confinado al nervio tibial (sóleo) en adultos sanos debido a la constante inhibición descendente de las vías corticoespinales sobre la médula espinal.
Cuando ocurre un daño en la motoneurona superior (ACV, TEC, lesión medular, ELA), se pierde esta inhibición presináptica. El resultado es una **hiperexcitabilidad patológica del asta anterior** (espasticidad e hiperreflexia).

**Aplicaciones diagnósticas:**
*   **Relación H/M anormalmente alta:** (Normal usualmente < 50%). Un ratio elevado traduce espasticidad e hiperreflexia eléctrica.
*   **Reflejo H ectópico:** El hallazgo de un reflejo H que se puede obtener fácilmente en territorios donde normalmente está suprimido en el adulto (ej. miembro superior en el flexor carpo radialis, o en el cuádriceps) es diagnóstico inequívoco de daño de motoneurona superior.`,
          keyPoints: [
            'Relación H/M mide excitabilidad del asta anterior.',
            'Daño de motoneurona superior = pérdida de inhibición descendente = aumento masivo de H/M.',
            'Aparición de Reflejo H en MS o cuádriceps confirma síndrome piramidal/espasticidad.'
          ]
        },
      ]
    },
    { id: 'axon-reflex', title: 'Reflejo Axónico (Onda A)',
      children: [
        { id: 'a-wave-pathophysiology', title: 'Fisiopatología y Utilidad Clínica', 
          content: `La Onda A (reflejo axónico) es un potencial motor tardío constante que aparece típicamente entre la onda M y la onda F. Posee morfología y latencia **absolutamente idénticas** en cada estímulo sucesivo.

**Mecanismo 1: Reinervación colateral (Brotes axonales)**
En patologías axonales crónicas (ej. radiculopatías crónicas o polineuropatías en recuperación), los axones sanos generan brotes ("sprouting") para reinervar fibras huérfanas. Al estimular el nervio, el potencial antidrómico retrocede hasta el punto de bifurcación del brote colateral, y allí se desvía bajando de forma ortodrómica hacia el músculo. Esto confirma neurofisiológicamente una **reinervación colateral exitosa**.

**Mecanismo 2: Transmisión Efáptica (SGB)**
En procesos desmielinizantes agudos inflamatorios, la Onda A no se da por brotes, sino por un "cortocircuito". El potencial de acción alcanza el área de desmielinización activa y salta lateralmente (transmisión efáptica) hacia un axón adyacente sano, descendiendo por él hasta el músculo.

**Implicaciones clínicas (Guillain-Barré):**
La presencia de múltiples Ondas A dispersas es un hallazgo clásico y sumamente sensible en los primeros días del Síndrome de Guillain-Barré (fase AIDP), permitiendo el diagnóstico temprano cuando las conducciones distales estándar pueden ser engañosamente normales.

**Prueba de colisión:** Si la onda A aparece de forma constante subiendo el estímulo submáximo, al alcanzar intensidad **supramáxima**, desaparecerá por colisión (ya que todas las ramas motoras estarán bloqueadas por su propia activación antidrómica).`,
          clinicalPearls: [
            'Inmutabilidad: A diferencia de la Onda F, la Onda A se superpone de manera perfecta sobre sí misma al utilizar el modo en cascada.',
            'Ojo diagnóstico: Busca múltiples Ondas A (patrón "en enjambre") como el marcador electrofisiológico más precoz de radiculoneuritis aguda (SGB) en los primeros 3 a 5 días.'
          ],
          keyPoints: [
            'Onda A constante = brote axonal crónico (regeneración).',
            'Onda A dispersa aguda = transmisión efáptica (desmielinización).',
            'Hallazgo crítico y temprano en el diagnóstico del Guillain-Barré.'
          ]
        },
      ]
    },
    { id: 'blink-reflex', title: 'Reflejo de Parpadeo (Blink Reflex)',
      children: [
        { id: 'trigeminal-facial-pathway', title: 'Vía Trigémino-Facial', 
          content: `El Blink Reflex es el análogo electrofisiológico del reflejo corneal. Evalúa la integridad de los pares craneales V y VII, y del tronco cerebral (puente y bulbo).

*   **Vía aferente:** Nervio supraorbitario (V1 - Trigémino).
*   **Vía eferente:** Nervio facial (VII) bilateral.

Componentes:
*   **R1 (Temprana ipsilateral):** Vía bisináptica a la protuberancia media. Reacción solo del lado estimulado.
*   **R2 (Tardía bilateral):** Vía polisináptica que desciende hasta el núcleo espinal del V en el bulbo y cruza a la vía motora bilateral.`
        },
        { id: 'blink-technique', title: 'Técnica de Registro', 
          content: `Técnica obligatoria de 2 canales:
*   **Activos (G1):** Porción inferior del orbicular de los ojos (justo debajo de la pupila), de forma bilateral.
*   **Referencia (G2):** Canto lateral externo del ojo.
*   **Estímulo:** Escotadura supraorbitaria en la ceja medial. ¡Importante! El cátodo (-) debe apuntar directamente a la escotadura, y el ánodo (+) debe quedar lateral o superior, nunca apuntando al lado contralateral para evitar co-estimulación.

**Parámetros:**
*   Sensibilidad alta: 100-200 µV/div (respuestas de baja amplitud).
*   Barrido: 10 ms/div (ventana amplia para atrapar R2c).
*   Filtros: 10 Hz a 10 kHz.
*   Pausa obligatoria: Se deben estimular y registrar de 4 a 6 barridos superpuestos esperando **al menos 15 segundos entre cada estímulo** para evitar la habituación central de la respuesta R2.`,
          clinicalPearls: [
            'Nunca usar choque automático repetitivo: la respuesta R2 tiene una vía interneuronal polisináptica que se habitúa y desaparece si no dejas descansar el cerebro.',
            'Biofeedback: Si el paciente está tenso y genera artefacto basal grueso, sube el altavoz. Al escuchar su propio ruido, los pacientes aprenden a relajar la cara.',
            'Sincinesias: En sospecha de reinervación aberrante tras parálisis de Bell, coloca G1 en el músculo mentoniano. Si aparece un reflejo R1/R2 en el mentón al parpadear, confirmas sinquinesis.'
          ]
        },
        { id: 'blink-patterns', title: 'Patrones Patológicos y Correlación Lesional', 
          content: `**Valores normales referenciales:** R1 ≤13 ms, R2 ipsi ≤41 ms, R2 contra ≤44 ms.

**Patrones lesionales clásicos:**
*   **Lesión Aferente Unilateral (V par - Trigémino):** Al estimular el lado afectado (ej. derecho), TODOS los potenciales se afectan (no hay entrada). R1, R2i y R2c caen. Al estimular el lado izquierdo (sano), todas las respuestas son normales en ambos ojos.
*   **Lesión Eferente Unilateral (VII par - Facial - Parálisis de Bell):** Al estimular el lado afectado (derecho), la información entra normal (R2c en el lado sano aparece) pero no puede salir por la derecha (R1 y R2i derechas ausentes/retrasadas). Al estimular el lado sano (izquierdo), R1 y R2i están bien, pero R2c derecha (la cruzada hacia la cara paralizada) está ausente. En resumen: *todo registro del lado enfermo es anormal, independientemente de dónde estimules*.
*   **Esclerosis Múltiple (EM):** La EM afecta primariamente vías centrales. Produce una **afectación selectiva de R1** (vía bisináptica pontina), estando marcadamente retrasada o ausente, con conservación relativa de R2.
*   **Síndrome de Wallenberg (Lesión bulbar lateral):** Destrucción selectiva del tracto espinal del V en el bulbo o interneuronas ipsilaterales. Al estimular el lado de la lesión (derecho), **R1 es normal** (porque pasa por puente, más arriba) pero R2i derecha está retrasada/ausente. La R2c cruzada está intacta.`,
          keyPoints: [
            'Lesión V par = Falla toda la respuesta cuando se estimula ese lado.',
            'Lesión VII par = Falla el músculo de ese lado sin importar dónde estimules.',
            'Falla aislada de R1 = Daño central en puente medio (típico de Esclerosis Múltiple).',
            'Falla aislada de R2 ipsilateral = Síndrome de Wallenberg (bulbo).'
          ]
        },
      ]
    },
  ]
};
