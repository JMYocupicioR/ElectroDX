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
*   **Relación H/M:** Amplitud normal ≤50%.

Utilidad:
*   Es la prueba más sensible y específica para **radiculopatía S1**.
*   Detecta polineuropatías tempranas y plexopatías lumbosacras.
*   Ratio H/M muy elevado sugiere hiperexcitabilidad de motoneurona superior.`,
          clinicalPearls: [
            'La ausencia bilateral del Reflejo H en mayores de 60 años puede ser un hallazgo fisiológico correlacionado con la pérdida natural de los reflejos aquíleos.'
          ],
          keyPoints: [
            'Diferencia de latencia H >1.5 ms interlado = Patológico.',
            'Prueba de oro para Radiculopatía S1.',
            'Relación H/M alta → disfunción de vía piramidal.'
          ]
        },
      ]
    },
    { id: 'axon-reflex', title: 'Reflejo Axónico (Onda A)',
      children: [
        { id: 'a-wave-pathophysiology', title: 'Fisiopatología', 
          content: `La Onda A es un potencial motor tardío que se visualiza durante la obtención de las Ondas F.

Un axón motor se ramifica típicamente de forma proximal. Cuando un estímulo submáximo viaja de forma antidrómica, al llegar a una ramificación, el impulso da la vuelta ("U-turn") y desciende ortodrómico por otra rama intacta, contrayendo el músculo.`,
          clinicalPearls: [
            'Inmutabilidad: A diferencia de la Onda F, la Onda A cae EXACTAMENTE en la misma latencia y tiene la MISMA morfología en todos los trazos sucesivos.'
          ]
        },
        { id: 'a-vs-f-wave', title: 'Identificación y Utilidad Clínica', 
          content: `Aparece usualmente *entre* la respuesta M y la Onda F. 

**Prueba de colisión:** Si aparece de forma constante subiendo el estímulo, hay que subirlo a **supramáximo**. Si desaparece, se confirma que es un reflejo axónico (porque al haber estímulo máximo, todas las ramas discurren antidrómicamente, induciendo colisión).

**Utilidad:**
*   Signo clásico de **reinervación crónica** por brotes colaterales tras pérdida axonal.
*   Se observa tempranamente en el Guillain-Barré por transmisión "efáptica" (salto de corriente) en sitios de desmielinización focal.`
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
          content: `Técnica de 2 canales:
1.  **Electrodos G1 (Activos):** Orbicular de los ojos, bajo el ojo.
2.  **Electrodos G2 (Ref):** Canto externo del ojo.
3.  **Estímulo:** Nervio supraorbitario.

*   Pulso de estimulación: de muy baja intensidad pero suficiente, 0.1 ms.
*   Sensibilidad: 100-200 µV/div.
*   Barrido: 5-10 ms/div.

Se superponen de 4 a 6 trazos separados por varios segundos.`,
          clinicalPearls: [
            'Nunca usar choque automático repetitivo: la respuesta R2 tiende a desaparecer velozmente por habituación.',
            'Biofeedback: Si el paciente está tenso y genera artefacto basal, subir el altavoz del equipo para que escuche su tensión ayuda a relajar los músculos faciales inmediatamente.',
            'Sincinesias: En sospecha de reinervación aberrante post-parálisis facial, coloca electrodos en el músculo mentoniano. Normalmente no se contrae al parpadear; si muestra R1/R2, hay reinervación aberrante.'
          ]
        },
        { id: 'blink-patterns', title: 'Patrones Patológicos y Correlación Lesional', 
          content: `Valores normales: R1 ≤13 ms, R2 ipsi ≤41 ms, R2 contra ≤44 ms.

Patrones lesionales:
1.  **Lesión del V par (Trigémino):** Al estimular el lado afectado, TODOS se afectan (R1, R2 ipsi y R2 contra). Lado sano normal.
2.  **Lesión del VII par (Facial):** Ej. Parálisis de Bell. Al estimular el lado malo: R1 ausente, R2 ipsi ausente, R2 contra normal. Al estimular el lado sano: R2 hacia la cara paralizada anormal.
3.  **Lesión pontina focal:** Afección selectiva de R1.
4.  **Lesión bulbar:** R2 bilaterales prolongadas, R1 intacta.`,
          keyPoints: [
            'V par: Aferente "de entrada", si falla, nada sale al estimular el lado malo.',
            'VII par: Eferente "de salida", falla la contracción del lado dañado independiente de dónde se estimule.'
          ]
        },
      ]
    },
  ]
};
