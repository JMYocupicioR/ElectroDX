// src/content/modules/module-03-emg-needle.ts
import { Module } from '../../types/content';

export const module03: Module = {
  id: 'emg-needle',
  number: 3,
  title: 'Electromiografía de Aguja',
  titleEn: 'Needle Electromyography',
  emoji: '🔬',
  description: 'Tipos de electrodos, fases de exploración, actividad espontánea y análisis de PUM',
  descriptionEn: 'Electrode types, exploration phases, spontaneous activity and MUP analysis',
  color: 'from-green-500 to-emerald-700',
  icon: 'Crosshair',
  topics: [
    {
      id: 'emg-principles', title: 'Principios de la EMG de Aguja',
      titleEn: 'Principles of Needle EMG',
      children: [
        { id: 'electrode-types', title: 'Tipos de electrodos',
          titleEn: 'Electrode Types',
          children: [
            { id: 'concentric-needle', title: 'Aguja concéntrica',
              titleEn: 'Concentric Needle',
              content: `La aguja concéntrica es el electrodo más utilizado mundialmente en EMG de aguja. Su diseño integra activo y referencia dentro de la misma aguja, otorgando excelente rechazo de modo común y baseline estable.

**Estructura:**
• Cánula de acero inoxidable (referencia). Alambre interior de platino-iridio expuesto en la punta biselada (activo).
• Superficie de captación: ~150 × 600 µm.

**Radio de captación efectivo:** ~2.5 mm → registra ~15-20 fibras de la UM más cercana.

**Ventajas:** Excelente SNR y baseline estable. No requiere referencia externa. La mayoría de tablas normativas están validadas con concéntrica.

**Desventajas:** Mayor costo. Amplitud de PUM ligeramente menor que monopolar.`,
              contentEn: `The concentric needle is the most widely used electrode in needle EMG worldwide. Its design integrates the active and reference within the same needle, providing excellent common mode rejection and a stable baseline.

**Structure:**
• Stainless steel cannula (reference). Inner platinum-iridium wire exposed at the beveled tip (active).
• Recording surface: ~150 × 600 µm.

**Effective pickup radius:** ~2.5 mm → records ~15-20 fibers of the nearest MU.

**Advantages:** Excellent SNR and stable baseline. No external reference needed. Most normative tables are validated with concentric.

**Disadvantages:** Higher cost. MUP amplitude slightly lower than monopolar.`,
              clinicalPearls: [
                'La aguja concéntrica es la elección cuando necesitas comparar con tablas normativas publicadas — casi todas están validadas con este tipo.',
                'Baseline ruidoso: antes de cambiar la aguja, verifica el cable de conexión. Un conector flojo es la causa más frecuente.',
              ],
              clinicalPearlsEn: [
                'The concentric needle is the choice when you need to compare with published normative tables — almost all are validated with this type.',
                'Noisy baseline: before changing the needle, check the connection cable. A loose connector is the most common cause.',
              ],
              keyPoints: [
                'Activo: alambre interior. Referencia: cánula metálica.',
                'Radio de captación ~2.5 mm → registra 15-20 fibras de la UM.',
                'Mejor rechazo de ruido → baseline más estable que monopolar.',
                'Tablas normativas de referencia: validadas con concéntrica.',
              ],
              keyPointsEn: [
                'Active: inner wire. Reference: metal cannula.',
                'Pickup radius ~2.5 mm → records 15-20 fibers of the MU.',
                'Better noise rejection → more stable baseline than monopolar.',
                'Normative reference tables: validated with concentric.',
              ],
            },
            { id: 'monopolar-needle', title: 'Aguja monopolar',
              titleEn: 'Monopolar Needle',
              content: `La aguja monopolar es una alternativa a la concéntrica, preferida cuando se busca menor dolor de inserción o mayor amplitud de PUM.

**Estructura:** Aguja sólida recubierta de teflón, con la punta metálica expuesta (activo). Requiere electrodo de referencia de superficie separado.

**Diferencias clave vs. concéntrica:**
• **Mayor área de captación:** registra más fibras → PUM con amplitudes 20-30% más altas.
• **Mayor susceptibilidad al ruido:** peor rechazo de modo común → más interferencia de 60 Hz.
• **Menor diámetro:** menos dolor en la inserción.

**Importante:** Los valores normales de amplitud y duración de PUM difieren entre concéntrica y monopolar. No intercambies las tablas normativas entre tipos de electrodo.`,
              contentEn: `The monopolar needle is an alternative to the concentric, preferred when lower insertion pain or higher MUP amplitude is desired.

**Structure:** Solid Teflon-coated needle, with the exposed metallic tip (active). Requires a separate surface reference electrode.

**Key differences vs. concentric:**
• **Larger pickup area:** records more fibers → MUPs with 20-30% higher amplitudes.
• **Greater noise susceptibility:** poorer common mode rejection → more 60 Hz interference.
• **Smaller diameter:** less insertion pain.

**Important:** Normal values for MUP amplitude and duration differ between concentric and monopolar. Do not interchange normative tables between electrode types.`,
              clinicalPearls: [
                'Si hay mucho ruido con la monopolar, reubica el electrodo de referencia de superficie. Un cambio de posición de 2 cm puede eliminar gran parte del ruido.',
                'Preferida en niños y pacientes muy sensibles al dolor: el menor calibre reduce el dolor de inserción significativamente.',
              ],
              clinicalPearlsEn: [
                'If there is too much noise with the monopolar, reposition the surface reference electrode. A 2 cm position change can eliminate most of the noise.',
                'Preferred in children and very pain-sensitive patients: the smaller gauge significantly reduces insertion pain.',
              ],
              keyPoints: [
                'Aguja sólida recubierta de teflón; punta expuesta = activo.',
                'Requiere referencia de superficie externa.',
                'Mayor amplitud de PUM pero más susceptible a ruido ambiental.',
                'Tablas normativas propias: no intercambiables con concéntrica.',
              ],
              keyPointsEn: [
                'Solid Teflon-coated needle; exposed tip = active.',
                'Requires external surface reference.',
                'Higher MUP amplitude but more susceptible to ambient noise.',
                'Own normative tables: not interchangeable with concentric.',
              ],
            },
            { id: 'single-fiber-needle', title: 'Aguja de fibra única (SFEMG)',
              titleEn: 'Single Fiber Needle (SFEMG)',
              content: `El electrodo de fibra única es el más selectivo en electrodiagnóstico. Permite registrar potenciales de fibras musculares individuales dentro de la misma UM.

**Estructura:**
• Superficie de registro lateral: 25 µm de diámetro.
• Radio de captación: ~300 µm → capta solo 1-3 fibras de la misma UM.
• Filtros especiales: pasa-altos 500 Hz (rechaza fibras lejanas).

**Aplicaciones:**
• **Jitter neuromuscular:** variabilidad del intervalo entre dos fibras de la misma UM. Refleja estabilidad de la transmisión neuromuscular. Aumentado en MG, Lambert-Eaton, botulismo, reinervación.
• **Densidad de fibra:** número de fibras de la misma UM en el radio de captación (normal: ~1.5). Aumenta en reinervación colateral.

**Valores normales de jitter (MCD):**
• Orbicular oculi: <40 µs. Extensor digitorum communis: <50 µs.`,
              clinicalPearls: [
                'SFEMG es el estudio más sensible para miastenia gravis: sensibilidad >95% en MG generalizada. Si el ENR es normal pero persiste la sospecha clínica, el SFEMG es el siguiente paso.',
                'El jitter aumentado sin bloqueo = inestabilidad de UNM (puede ser normal en reinervación temprana). Jitter aumentado CON bloqueo = diagnóstico de trastorno de UNM.',
              ],
              clinicalPearlsEn: [
                'SFEMG is the most sensitive test for myasthenia gravis: sensitivity >95% in generalized MG. If RNS is normal but clinical suspicion persists, SFEMG is the next step.',
                'Increased jitter without blocking = NMJ instability (may be normal in early reinnervation). Increased jitter WITH blocking = diagnosis of NMJ disorder.',
              ],
              keyPoints: [
                'Superficie 25 µm → capta solo 1-3 fibras de la misma UM.',
                'Filtros: pasa-altos 500 Hz (vs. 10-20 Hz del EMG convencional).',
                'Jitter aumentado = inestabilidad de UNM (MG, Lambert-Eaton, botulismo).',
                'Sensibilidad >95% para miastenia gravis generalizada.',
              ],
              keyPointsEn: [
                'Surface 25 µm → captures only 1-3 fibers of the same MU.',
                'Filters: high-pass 500 Hz (vs. 10-20 Hz in conventional EMG).',
                'Increased jitter = NMJ instability (MG, Lambert-Eaton, botulism).',
                'Sensitivity >95% for generalized myasthenia gravis.',
              ],
            },
            { id: 'macro-electrode', title: 'Macro-electrodo',
              titleEn: 'Macro-Electrode',
              content: `El macro-electrodo registra la actividad agregada de toda la unidad motora completa — no solo las fibras cercanas al electrodo. Es una herramienta de investigación y casos especializados.

**Principio:** La cánula completa del electrodo (~15 mm de largo) actúa como electrodo activo. Con un radio de captación de ~30-40 mm, capta fibras distribuidas por todo el territorio de la UM. Se promedia la señal activada por un potencial de fibra única como disparador (trigger).

**Macro-MUP:** Refleja el tamaño total de la unidad motora.
• **Normal:** 0.05 – 2.0 mV (varía por músculo).
• **Reinervación crónica (ELA, polineuropatías):** Macro-MUP gigante (UM con miles de fibras).
• **Miopatía:** Macro-MUP reducido (UM pequeñas).`,
              keyPoints: [
                'Cánula completa como activo → capta toda la UM (radio ~40 mm).',
                'Macro-MUP aumentado → reinervación crónica (UM gigantes).',
                'Macro-MUP reducido → miopatía.',
                'Principalmente herramienta de investigación y casos especializados.',
              ],
              keyPointsEn: [
                'Full cannula as active → captures entire MU (radius ~40 mm).',
                'Increased macro-MUP → chronic reinnervation (giant MUs).',
                'Reduced macro-MUP → myopathy.',
                'Primarily a research tool and for specialized cases.',
              ],
            },
          ],
        },
        { id: 'equipment-settings', title: 'Configuración del equipo: filtros, ganancia, barrido',
          content: `La correcta configuración del equipo define la calidad del registro. Ajustes incorrectos producen artefactos que pueden confundirse con hallazgos patológicos.

**Filtros recomendados:**
• **Pasa-altos (low-cut):** 10-20 Hz para EMG convencional. Si se eleva >20 Hz, se distorsiona la duración de los PUM y pueden desaparecer las PSW de baja frecuencia.
• **Pasa-bajos (high-cut):** 10,000-20,000 Hz. Reducirlo suaviza el potencial y reduce artificialmente la amplitud.
• **SFEMG:** pasa-altos 500 Hz para rechazar fibras lejanas.

**Ganancia (sensibilidad):**
| Fase | Ganancia recomendada |
|---|---|
| Actividad espontánea en reposo | 50-100 µV/div |
| Análisis de PUM individuales | 200-500 µV/div |
| Patrón de interferencia | 1-2 mV/div |

**Velocidad de barrido:**
• Reposo/actividad espontánea: 10 ms/div
• Análisis morfológico de PUM: 5-10 ms/div
• SFEMG: 1 ms/div (máxima resolución temporal)`,
          clinicalPearls: [
            'Si el filtro pasa-altos está en >100 Hz, las fibrilaciones de baja amplitud se vuelven invisibles. Siempre usa 10-20 Hz para no perder actividad espontánea.',
            'Error clásico: evaluar el patrón de interferencia con ganancia de 200 µV/div. El trazado se satura y parece "lleno" aunque haya reclutamiento muy reducido. Bajar la ganancia a 1-2 mV/div para el patrón de interferencia.',
          ],
          keyPoints: [
            'Filtros EMG: pasa-altos 10-20 Hz, pasa-bajos 10-20 kHz.',
            'Ganancia variable: 50-100 µV/div (reposo) → 200 µV/div (PUM) → 1-2 mV/div (interferencia).',
            'Barrido: 10 ms/div en reposo; 5 ms/div para análisis de PUM.',
            'SFEMG: filtros 500 Hz - 10 kHz, barrido 1 ms/div.',
          ],
          videoUrls: [{ title: 'Interferencia a 60 Hz', driveId: '1WxSGYJRL-KbEV1u8rdyuW4FJk1mC5zrO' }, { title: 'Interferencia EKG', driveId: '1gAoqj5yQAZX6ef--xGX1l3tnm-Dc2xn7' }, { title: 'Marcapasos', driveId: '1-YZZZ3TyRbZrhuaSCcYCXxcGqd6GdDzV' }],
        },
        { id: 'exploration-technique', title: 'Técnica de exploración: cuadrantes y profundidad',
          content: `Una exploración sistemática garantiza no perder hallazgos focales y obtener una muestra representativa de todo el músculo.

**Orden de la exploración completa:**
1. **NCS primero** — los resultados guían qué músculos explorar con aguja.
2. Insertar con el paciente completamente relajado (más cómodo, menos dolor).
3. Evaluar actividad de inserción al avanzar la aguja.
4. Esperar 2-3 s en reposo completo en cada posición.
5. Pedir contracción mínima para PUM individuales.
6. Pedir contracción máxima para patrón de interferencia.
7. Repetir en múltiples sitios.

**Los 4 Cuadrantes:** desde cada inserción cutánea, avanzar en 4 direcciones (anterior, posterior, medial, lateral).

**Profundidades:** superficial (1-2 cm), media (3-4 cm) y profunda según el músculo.

**Número total de sitios:** 2-3 inserciones cutáneas × 4 cuadrantes × 3 niveles = 24+ sitios de evaluación. Para EMG cuantitativa: mínimo 20 PUM bien aislados.

**Señal de calidad para análisis de PUM:** tiempo de ascenso <500 µs indica que el electrodo está muy cerca de la fibra. PUM con tiempo de ascenso largo provienen de fibras lejanas y NO deben usarse para mediciones de amplitud.`,
          clinicalPearls: [
            'Nunca evalúes el reclutamiento durante contracción máxima dolorosa: el paciente puede inhibir voluntariamente, simulando un falso patrón reducido. Pide esfuerzo submáximo controlado.',
            'El AUDIO es tan importante como la pantalla: entrena el oído para reconocer el "ruido de lluvia" (fibrilaciones), el "motor diesel" (CRD), y el "bombardero en picada" (miotonía).',
          ],
          keyPoints: [
            'NCS siempre primero: sus resultados guían la selección de músculos.',
            'Insertar en músculo completamente relajado.',
            '2-3 inserciones cutáneas × 4 cuadrantes × 3 profundidades = cobertura completa.',
            'Tiempo de ascenso del PUM <500 µs = señal de calidad aceptable.',
          ],
        },
        { id: 'biosafety', title: 'Bioseguridad y complicaciones',
          content: `La seguridad del paciente y del operador depende del cumplimiento estricto de las precauciones universales y del conocimiento de los músculos de riesgo.

**Precauciones universales:**
• Guantes de nitrilo en toda la exploración.
• Agujas desechables estériles — NUNCA reutilizar.
• Contenedor de punzocortantes al alcance antes de iniciar.
• Desinfección de la piel con alcohol isopropílico.
• Verificar alergias al látex y al níquel.

**Tabla de complicaciones:**
| Complicación | Factores de riesgo | Prevención |
|---|---|---|
| Hematoma | Anticoagulantes, trombocitopenia | Comprimir 5 min, aguja 25G |
| Neumotórax | Músculos torácicos | Inserción tangencial, guía ecográfica |
| Infección | Inmunosupresión | No explorar sobre piel infectada |
| Ruptura de aguja | Agujas defectuosas | Inspección previa, no doblar |

**Músculos de alto riesgo de neumotórax:** diafragma, serrato anterior, romboides, paraespinales torácicos, pectoral mayor.

**Manejo con anticoagulantes:**
• INR < 3.5 generalmente seguro.
• Usar calibre 25G, mínimas inserciones.
• Evitar músculos profundos no compresibles: psoas ilíaco, tibial posterior.`,
          clinicalPearls: [
            'En anticoagulados: INFORMA el riesgo de hematoma antes de la exploración. Evita el psoas ilíaco, tibial posterior y glúteo profundo — un hematoma en estos sitios puede comprimir estructuras nerviosas.',
            'Para el diafragma: técnica en apnea espiratoria, inserción TANGENCIAL al margen costal inferior. Nunca apuntes perpendicularmente al tórax.',
          ],
          keyPoints: [
            'Agujas desechables SIEMPRE. Contenedor de punzocortantes al alcance.',
            'Neumotórax: diafragma, serrato, romboides, paraespinales torácicos.',
            'Anticoagulados: 25G, comprimir, evitar músculos profundos no compresibles.',
            'Neumotórax = inserción tangencial + guía ecográfica en zonas de riesgo.',
          ],
        },
      ]
    },
    {
      id: 'emg-phases', title: 'Fases de la Exploración EMG',
      titleEn: 'EMG Exploration Phases',
      description: 'Las cuatro fases sistemáticas de la exploración EMG: inserción, reposo, contracción mínima y contracción máxima',
      descriptionEn: 'The four systematic phases of EMG exploration: insertion, rest, minimal contraction, and maximal contraction',
      content: `La exploración EMG de aguja sigue una secuencia rigurosa de cuatro fases que se repiten en cada sitio de inserción. Cada fase revela información diferente sobre el estado del músculo y su inervación. Dominar estas fases es la base de todo electrodiagnóstico.

**Las 4 fases secuenciales:**

| Fase | Qué se evalúa | Qué se pide al paciente | Ganancia |
|---|---|---|---|
| 1. Actividad de inserción | Respuesta mecánica de la membrana | Relajación total | 50-100 µV/div |
| 2. Reposo completo | Presencia de actividad espontánea | Relajación total | 50-100 µV/div |
| 3. Contracción mínima | Morfología individual de cada PUM | Contracción suave | 200-500 µV/div |
| 4. Contracción máxima | Patrón de reclutamiento e interferencia | Fuerza máxima | 1-2 mV/div |

**Regla de oro:** SIEMPRE realizar las fases en este orden. Si se pide contracción antes de evaluar el reposo, la actividad voluntaria residual puede confundirse con actividad espontánea patológica.

**El AUDIO es tu aliado:** Cada hallazgo tiene una firma sonora única. Entrena tu oído tanto como tus ojos — en la práctica clínica, muchos electromiografistas expertos detectan los hallazgos primero por el oído y luego confirman visualmente.`,
      contentEn: `Needle EMG exploration follows a rigorous four-phase sequence repeated at each insertion site. Each phase reveals different information about the muscle and its innervation. Mastering these phases is the foundation of all electrodiagnosis.

**The 4 sequential phases:**

| Phase | What is assessed | Patient instruction | Gain |
|---|---|---|---|
| 1. Insertion activity | Mechanical membrane response | Full relaxation | 50-100 µV/div |
| 2. Complete rest | Presence of spontaneous activity | Full relaxation | 50-100 µV/div |
| 3. Minimal contraction | Individual MUP morphology | Gentle contraction | 200-500 µV/div |
| 4. Maximal contraction | Recruitment and interference pattern | Maximum force | 1-2 mV/div |

**Golden rule:** ALWAYS perform phases in this order. If contraction is requested before evaluating rest, residual voluntary activity can be confused with pathological spontaneous activity.

**AUDIO is your ally:** Each finding has a unique sound signature. Train your ear as much as your eyes — in clinical practice, many expert electromyographers detect findings first by ear and then confirm visually.`,
      children: [
        { id: 'insertion-activity', title: '① Actividad de inserción',
          titleEn: '① Insertion Activity',
          description: 'Primera fase: evaluación de la respuesta eléctrica al movimiento de la aguja',
          descriptionEn: 'First phase: evaluation of electrical response to needle movement',
          content: `La actividad de inserción es la primera información que obtienes al explorar un músculo. Al avanzar, retroceder o redirigir la aguja, las fibras musculares se deforman mecánicamente y se despolarizan brevemente, generando un estallido eléctrico transitorio.

**Fisiopatología:** La membrana de la fibra muscular tiene canales iónicos mecanosensibles. La deformación física abre transitoriamente canales de Na+ → despolarización breve → potencial de acción local. En músculo sano, esta actividad se autolimita porque la membrana se repolariza rápidamente.

**Técnica correcta:**
• Avanzar la aguja ~1-2 mm con movimiento BREVE y controlado.
• Escuchar el "crujido" eléctrico al mover la aguja.
• Dejar de mover y esperar 2-3 segundos para evaluar si la actividad cesa.
• Repetir en varias direcciones (4 cuadrantes).

**¿Qué indica cada patrón?**
| Hallazgo | Duración | Significado |
|---|---|---|
| Normal | <300 ms post-movimiento | Membrana sana, polarización normal |
| Aumentada | >300 ms, persiste al parar | Membrana irritable: denervación, miopatía inflamatoria |
| Disminuida | Mínima o ausente | Tejido no viable: fibrosis, atrofia severa |`,
          contentEn: `Insertion activity is the first piece of information you obtain when exploring a muscle. When advancing, withdrawing, or redirecting the needle, muscle fibers are mechanically deformed and briefly depolarize, generating a transient electrical burst.

**Pathophysiology:** The muscle fiber membrane has mechanosensitive ion channels. Physical deformation transiently opens Na+ channels → brief depolarization → local action potential. In healthy muscle, this activity is self-limiting because the membrane repolarizes quickly.

**Correct technique:**
• Advance the needle ~1-2 mm with a BRIEF, controlled movement.
• Listen for the electrical "crackle" when moving the needle.
• Stop moving and wait 2-3 seconds to assess whether activity ceases.
• Repeat in multiple directions (4 quadrants).

**What does each pattern indicate?**
| Finding | Duration | Significance |
|---|---|---|
| Normal | <300 ms post-movement | Healthy membrane, normal polarization |
| Increased | >300 ms, persists after stopping | Irritable membrane: denervation, inflammatory myopathy |
| Decreased | Minimal or absent | Non-viable tissue: fibrosis, severe atrophy |`,
          clinicalPearls: [
            'Siempre detén el movimiento de la aguja COMPLETAMENTE antes de interpretar la actividad de inserción. Si la aguja sigue moviéndose, cualquier actividad puede parecer "aumentada".',
            'La actividad de inserción es la primera pista diagnóstica: si está claramente aumentada, prepárate mentalmente para buscar fibrilaciones y PSW en el reposo.',
          ],
          clinicalPearlsEn: [
            'Always stop needle movement COMPLETELY before interpreting insertion activity. If the needle is still moving, any activity can appear "increased".',
            'Insertion activity is the first diagnostic clue: if clearly increased, mentally prepare to look for fibrillations and PSWs at rest.',
          ],
          keyPoints: [
            'La actividad de inserción refleja la excitabilidad de la membrana muscular.',
            'Normal: estallido eléctrico breve (<300 ms) que cesa al detener la aguja.',
            'Aumentada: membrana irritable → denervación, miopatía inflamatoria, miotonía.',
            'Disminuida: tejido muscular no funcional → fibrosis, atrofia terminal.',
          ],
          keyPointsEn: [
            'Insertion activity reflects muscle membrane excitability.',
            'Normal: brief electrical burst (<300 ms) that ceases when needle stops.',
            'Increased: irritable membrane → denervation, inflammatory myopathy, myotonia.',
            'Decreased: non-functional muscle tissue → fibrosis, terminal atrophy.',
          ],
          children: [
            { id: 'normal-insertion', title: 'Normal',
              titleEn: 'Normal',
              content: `La actividad de inserción normal es un breve estallido eléctrico (<300 ms) que aparece SOLO mientras la aguja se mueve y cesa inmediatamente al detenerla. Es la respuesta fisiológica esperada de un músculo sano.

**Fisiopatología detallada:**
• Los canales de Na+ mecanosensibles se abren por la deformación de la membrana sarcolémica.
• Se genera una despolarización transitoria que NO se propaga más allá de las fibras directamente contactadas.
• La bomba Na+/K+-ATPasa y los canales de K+ de repolarización restablecen rápidamente el potencial de reposo (-70 a -90 mV).

**Correlato auditivo:** Se escucha como un breve "crujido" o "chasquido" eléctrico — similar al sonido de arrugar papel rápidamente. Dura lo que dura el movimiento de la aguja.

**Factores que afectan la actividad de inserción normal:**
• **Temperatura muscular:** músculo frío → inserción puede parecer ligeramente prolongada (los canales se cierran más lentamente).
• **Velocidad de inserción:** movimientos rápidos generan mayor actividad que los lentos.
• **Dirección:** avanzar o redirigir la aguja genera más actividad que retrocederla.

**Qué se ve en la pantalla:** Ráfagas breves de potenciales de baja amplitud (50-200 µV) con morfología irregular, que desaparecen en <300 ms dejando una línea base plana y silenciosa.`,
              contentEn: `Normal insertion activity is a brief electrical burst (<300 ms) that appears ONLY while the needle is moving and ceases immediately when stopped. It is the expected physiological response of a healthy muscle.

**Detailed pathophysiology:**
• Mechanosensitive Na+ channels open due to sarcolemmal membrane deformation.
• A transient depolarization is generated that does NOT propagate beyond the directly contacted fibers.
• The Na+/K+-ATPase pump and repolarization K+ channels rapidly restore the resting potential (-70 to -90 mV).

**Audio correlate:** Sounds like a brief electrical "crackle" or "snap" — similar to quickly crumpling paper. Duration matches the needle movement.

**Factors affecting normal insertion activity:**
• **Muscle temperature:** cold muscle → insertion may appear slightly prolonged (channels close more slowly).
• **Insertion speed:** rapid movements generate more activity than slow ones.
• **Direction:** advancing or redirecting generates more activity than withdrawing.

**What you see on screen:** Brief bursts of low-amplitude potentials (50-200 µV) with irregular morphology, disappearing in <300 ms leaving a flat, silent baseline.`,
              clinicalPearls: [
                'Si al explorar un músculo y mover la aguja no obtienes NINGUNA actividad de inserción, verifica que el electrodo esté correctamente conectado antes de asumir que hay silencio eléctrico patológico.',
                'Un truco práctico: la actividad de inserción normal suena como "pssst" — corta y seca. Si suena como "pssssssssst" prolongado, ya es patológica.',
              ],
              clinicalPearlsEn: [
                'If you move the needle in a muscle and get NO insertion activity, verify the electrode is properly connected before assuming pathological electrical silence.',
                'A practical trick: normal insertion activity sounds like "pssst" — short and dry. If it sounds like a prolonged "pssssssssst", it is already pathological.',
              ],
              keyPoints: [
                'Duración normal: <300 ms desde que la aguja deja de moverse.',
                'Mecanismo: despolarización mecánica de canales de Na+ mecanosensibles.',
                'Sonido: "crujido" breve que dura lo que dura el movimiento.',
                'Amplitud típica: 50-200 µV, morfología irregular.',
              ],
              keyPointsEn: [
                'Normal duration: <300 ms after needle stops moving.',
                'Mechanism: mechanical depolarization of mechanosensitive Na+ channels.',
                'Sound: brief "crackle" lasting as long as the movement.',
                'Typical amplitude: 50-200 µV, irregular morphology.',
              ],
              videoUrls: [{ title: 'Inserción normal', driveId: '1mIO7Oq-mwzE_C2OIHsELS38nczAC81Ay' }],
            },
            { id: 'increased-insertion', title: 'Aumentada (patológica)',
              titleEn: 'Increased (Pathological)',
              content: `La actividad de inserción aumentada persiste >300 ms después de detener el movimiento de la aguja. Indica que la membrana muscular está hiperexcitable — se despolariza con facilidad y tarda en repolarizarse.

**Fisiopatología — ¿Por qué la membrana se irrita?**
• **Denervación:** al perder su inervación (2-3 semanas después), la fibra muscular expresa canales de Na+ adicionales a lo largo de TODA la membrana (no solo en la placa motora). Esto la hace extremadamente sensible a cualquier estímulo mecánico.
• **Miopatía inflamatoria:** la infiltración inflamatoria (linfocitos, macrófagos) daña directamente la membrana, haciéndola "porosa" e inestable eléctricamente.
• **Miotonía temprana:** los canales de Na+ o Cl- mutados permanecen abiertos más tiempo del normal, prolongando la despolarización.

**Cronología post-denervación:**
| Tiempo post-lesión | Hallazgo esperado |
|---|---|
| 0-7 días | Inserción puede ser aún normal |
| 7-14 días | Inserción aumentada (primer signo) |
| 14-21 días | Aparecen fibrilaciones y PSW |
| >21 días | Fibrilaciones plenamente establecidas |

**Diagnóstico diferencial completo de inserción aumentada:**
• Denervación aguda/subaguda (la causa más frecuente)
• Miopatías inflamatorias (dermatomiositis, polimiositis)
• Miopatías necrotizantes autoinmunes
• Miotonía (DM1, DM2, miotonía congénita)
• Fase hiperaguda de rabdomiólisis
• Denervación crónica activa (ELA progresiva)

**Correlato auditivo:** El "crujido" normal se transforma en un "chisporroteo" prolongado que no se detiene al parar la aguja — como aceite caliente en una sartén.

**Gradación semicuantitativa:**
• **Leve:** persiste 300-500 ms (fibras aisladas irritables).
• **Moderada:** persiste 500 ms-2 s (membrana claramente alterada).
• **Severa:** persiste >2 s o se desencadenan trenes de potenciales completos.`,
              contentEn: `Increased insertion activity persists >300 ms after stopping needle movement. It indicates that the muscle membrane is hyperexcitable — it depolarizes easily and takes longer to repolarize.

**Pathophysiology — Why does the membrane become irritable?**
• **Denervation:** After losing its innervation (2-3 weeks later), the muscle fiber expresses additional Na+ channels along the ENTIRE membrane (not just at the motor endplate). This makes it extremely sensitive to any mechanical stimulus.
• **Inflammatory myopathy:** Inflammatory infiltration (lymphocytes, macrophages) directly damages the membrane, making it electrically "porous" and unstable.
• **Early myotonia:** Mutated Na+ or Cl- channels remain open longer than normal, prolonging depolarization.

**Post-denervation chronology:**
| Time post-injury | Expected finding |
|---|---|
| 0-7 days | Insertion may still be normal |
| 7-14 days | Increased insertion (first sign) |
| 14-21 days | Fibrillations and PSWs appear |
| >21 days | Fibrillations fully established |

**Complete differential diagnosis of increased insertion:**
• Acute/subacute denervation (most frequent cause)
• Inflammatory myopathies (dermatomyositis, polymyositis)
• Autoimmune necrotizing myopathies
• Myotonia (DM1, DM2, congenital myotonia)
• Hyperacute phase of rhabdomyolysis
• Active chronic denervation (progressive ALS)

**Audio correlate:** The normal "crackle" transforms into a prolonged "sizzle" that doesn't stop when the needle stops — like hot oil in a frying pan.

**Semi-quantitative grading:**
• **Mild:** persists 300-500 ms (isolated irritable fibers).
• **Moderate:** persists 500 ms-2 s (clearly altered membrane).
• **Severe:** persists >2 s or triggers complete runs of potentials.`,
              clinicalPearls: [
                'La actividad de inserción aumentada es el PRIMER signo electrodiagnóstico de denervación — aparece antes que las fibrilaciones (7-14 días vs. 14-21 días). Si la encuentras en un paciente con paresia aguda reciente, el diagnóstico de denervación es inminente.',
                'Error clásico: confundir actividad de inserción aumentada con fibrilaciones. Diferencia clave: la inserción aumentada SOLO aparece al mover la aguja. Las fibrilaciones ocurren con la aguja quieta y el músculo en reposo.',
                'En miotonía: la actividad de inserción aumentada puede transformarse directamente en descargas miotónicas (waxing/waning) — si escuchas el "bombardero en picada" al insertar, piensa en canalopatía.',
              ],
              clinicalPearlsEn: [
                'Increased insertion activity is the FIRST electrodiagnostic sign of denervation — appears before fibrillations (7-14 days vs. 14-21 days). If you find it in a patient with recent acute paresis, denervation diagnosis is imminent.',
                'Classic error: confusing increased insertion activity with fibrillations. Key difference: increased insertion ONLY appears when moving the needle. Fibrillations occur with the needle still and muscle at rest.',
                'In myotonia: increased insertion activity can directly transform into myotonic discharges (waxing/waning) — if you hear the "dive bomber" upon insertion, think channelopathy.',
              ],
              keyPoints: [
                'Definición: actividad que persiste >300 ms después de detener el movimiento de la aguja.',
                'La membrana denervada expresa canales de Na+ extra → hiperexcitabilidad.',
                'Es el PRIMER signo de denervación (7-14 días), antes que fibrilaciones.',
                'DD: denervación aguda, miopatía inflamatoria, miotonía, rabdomiólisis.',
              ],
              keyPointsEn: [
                'Definition: activity persisting >300 ms after stopping needle movement.',
                'Denervated membrane expresses extra Na+ channels → hyperexcitability.',
                'FIRST sign of denervation (7-14 days), before fibrillations.',
                'DD: acute denervation, inflammatory myopathy, myotonia, rhabdomyolysis.',
              ],
              videoUrls: [{ title: 'Inserción aumentada', driveId: '1TuIOyoFWt_70jT4b5nn9vZKbIZ1c4Fk5' }],
            },
            { id: 'decreased-insertion', title: 'Disminuida / silencio eléctrico',
              titleEn: 'Decreased / Electrical Silence',
              content: `La actividad de inserción disminuida o ausente indica que las fibras musculares no son capaces de generar potenciales eléctricos adecuados al ser estimuladas mecánicamente. Es un signo de pérdida de tejido muscular funcional.

**Fisiopatología — ¿Por qué el músculo calla?**
• **Reemplazo fibroso/graso:** En la atrofia crónica severa, las fibras musculares son reemplazadas progresivamente por tejido fibroso y grasa. Este tejido NO tiene canales iónicos → no genera potenciales eléctricos.
• **Miopatía terminal:** Pérdida masiva de fibras → quedan muy pocas fibras viables.
• **Parálisis periódica (durante el ataque):** Los canales de Na+ están inactivados por la hipopotasemia o la hiperpotasemia → la membrana es temporalmente inexcitable. FUERA del ataque, la inserción se normaliza.

**Diagnóstico diferencial de inserción disminuida:**
| Causa | Mecanismo | ¿Es reversible? |
|---|---|---|
| Atrofia de larga evolución | Reemplazo fibroso | No |
| Distrofia muscular avanzada | Reemplazo graso severo | No |
| Parálisis periódica (ataque) | Canales Na+ inactivados | Sí (post-ataque) |
| Miopatía terminal (fases finales) | Pérdida masiva de fibras | No |
| Aguja en tejido fibroso/grasa subcutánea | No hay fibras en el trayecto | Redirigir aguja |

**Correlato auditivo:** Silencio — al mover la aguja no se escucha prácticamente nada, solo un ruido de fondo mínimo. Es como intentar escuchar una emisora de radio en una zona sin señal.

**Importante:** Antes de concluir "silencio eléctrico", descarta estas causas técnicas:
• Aguja insertada en tejido subcutáneo (no en músculo).
• Electrodo desconectado o cable defectuoso.
• Ganancia demasiado baja para detectar señales mínimas.`,
              contentEn: `Decreased or absent insertion activity indicates that muscle fibers cannot generate adequate electrical potentials when mechanically stimulated. It is a sign of loss of functional muscle tissue.

**Pathophysiology — Why does the muscle go silent?**
• **Fibrotic/fatty replacement:** In severe chronic atrophy, muscle fibers are progressively replaced by fibrous tissue and fat. This tissue has NO ion channels → generates no electrical potentials.
• **Terminal myopathy:** Massive fiber loss → very few viable fibers remain.
• **Periodic paralysis (during attack):** Na+ channels are inactivated by hypokalemia or hyperkalemia → the membrane is temporarily inexcitable. OUTSIDE the attack, insertion normalizes.

**Differential diagnosis of decreased insertion:**
| Cause | Mechanism | Reversible? |
|---|---|---|
| Long-standing atrophy | Fibrotic replacement | No |
| Advanced muscular dystrophy | Severe fatty replacement | No |
| Periodic paralysis (attack) | Inactivated Na+ channels | Yes (post-attack) |
| Terminal myopathy (final stages) | Massive fiber loss | No |
| Needle in fibrotic tissue/subcutaneous fat | No fibers in the path | Redirect needle |

**Audio correlate:** Silence — when moving the needle you hear practically nothing, just minimal background noise. It's like trying to tune into a radio station in an area with no signal.

**Important:** Before concluding "electrical silence," rule out these technical causes:
• Needle inserted into subcutaneous tissue (not muscle).
• Disconnected electrode or faulty cable.
• Gain too low to detect minimal signals.`,
              clinicalPearls: [
                'El silencio eléctrico durante la inserción es un hallazgo GRAVE: significa que el músculo ya no tiene fibras funcionales que estimular. En un contexto de denervación crónica, implica que la ventana de reinervación probablemente se cerró.',
                'TRAMPA: si la aguja está en grasa subcutánea en lugar de músculo, tendrás silencio eléctrico "falso". Confirma la posición pidiendo al paciente una contracción suave — si no aparece ningún PUM, redirige la aguja más profundo.',
              ],
              clinicalPearlsEn: [
                'Electrical silence during insertion is a SEVERE finding: it means the muscle no longer has functional fibers to stimulate. In the reinnervation context of chronic denervation, it implies the reinnervation window has likely closed.',
                'TRAP: if the needle is in subcutaneous fat instead of muscle, you will have "false" electrical silence. Confirm position by asking the patient for a gentle contraction — if no MUP appears, redirect the needle deeper.',
              ],
              keyPoints: [
                'Inserción disminuida = pérdida de tejido muscular funcional.',
                'Causas principales: fibrosis, atrofia terminal, distrofia avanzada.',
                'Parálisis periódica: silencio DURANTE el ataque, inserción normal FUERA.',
                'Siempre descartar causas técnicas: aguja en grasa, cable roto, ganancia baja.',
              ],
              keyPointsEn: [
                'Decreased insertion = loss of functional muscle tissue.',
                'Main causes: fibrosis, terminal atrophy, advanced dystrophy.',
                'Periodic paralysis: silence DURING attack, normal insertion OUTSIDE.',
                'Always rule out technical causes: needle in fat, broken cable, low gain.',
              ],
              videoUrls: [{ title: 'Inserción disminuida', driveId: '1eJ0j6Jnef2WApEJJ2gypK1HKBmwuWs-m' }],
            },
          ]
        },
        { id: 'rest-activity', title: '② Actividad en reposo',
          titleEn: '② Rest Activity',
          description: 'Segunda fase: búsqueda de actividad eléctrica con el músculo completamente relajado',
          descriptionEn: 'Second phase: searching for electrical activity with the muscle completely relaxed',
          content: `Después de evaluar la actividad de inserción, detén la aguja completamente y pide al paciente que se relaje por 2-3 segundos. En esta fase buscas si el músculo genera actividad eléctrica de forma espontánea (sin movimiento de aguja ni contracción voluntaria).

**Regla fundamental:** Un músculo sano y relajado FUERA de la zona de placa motora es ELÉCTRICAMENTE SILENCIOSO. Cualquier actividad sostenida en reposo (fibrilaciones, PSW, CRD, etc.) es patológica.

**Actividad normal en reposo (zona de placa motora):**
Cuando la aguja se posiciona accidentalmente cerca de la unión neuromuscular, se pueden registrar:
• **Ruido de placa motora** (potenciales en miniatura): monofásicos negativos, 10-50 µV.
• **Espículas de placa terminal:** bifásicas con deflexión negativa inicial, 100-200 µV.

**Actividad anormal en reposo:**
Toda actividad que aparezca con la aguja quieta FUERA de la zona de placa es patológica y se clasifica en la siguiente sección (Actividad espontánea anormal).

**Técnica para asegurar relajación:**
• Posicionar al paciente cómodamente (extremidad apoyada, sin esfuerzo).
• Monitorear el altavoz — si escuchas PUM, el paciente no está relajado.
• Pedir que "deje caer" la extremidad completamente.
• En pacientes ansiosos: técnicas de distracción verbal.`,
          contentEn: `After evaluating insertion activity, stop the needle completely and ask the patient to relax for 2-3 seconds. In this phase, you are looking for whether the muscle generates electrical activity spontaneously (without needle movement or voluntary contraction).

**Fundamental rule:** A healthy, relaxed muscle OUTSIDE the motor endplate zone is ELECTRICALLY SILENT. Any sustained activity at rest (fibrillations, PSWs, CRDs, etc.) is pathological.

**Normal activity at rest (endplate zone):**
When the needle is accidentally positioned near the neuromuscular junction, you may record:
• **Endplate noise** (miniature potentials): monophasic negative, 10-50 µV.
• **Endplate spikes:** biphasic with initial negative deflection, 100-200 µV.

**Abnormal activity at rest:**
Any activity appearing with the needle still OUTSIDE the endplate zone is pathological and is classified in the next section (Abnormal spontaneous activity).

**Technique to ensure relaxation:**
• Position the patient comfortably (limb supported, no effort).
• Monitor the speaker — if you hear MUPs, the patient is not relaxed.
• Ask them to "let the limb drop" completely.
• In anxious patients: verbal distraction techniques.`,
          clinicalPearls: [
            'El ERROR más común en esta fase: el paciente no está completamente relajado y sus PUM voluntarios se confunden con actividad espontánea. Si escuchas PUM regulares en reposo, PRIMERO verifica que el paciente esté realmente relajado antes de reportar "fasciculaciones".',
            'Consejo práctico: en pacientes que no logran relajarse, explora músculos distales primero (FDI, tibial anterior) — son más fáciles de relajar que los proximales.',
          ],
          clinicalPearlsEn: [
            'The most common ERROR in this phase: the patient is not fully relaxed and their voluntary MUPs are mistaken for spontaneous activity. If you hear regular MUPs at rest, FIRST verify the patient is truly relaxed before reporting "fasciculations".',
            'Practical tip: in patients who cannot relax, explore distal muscles first (FDI, tibialis anterior) — they are easier to relax than proximal ones.',
          ],
          keyPoints: [
            'Músculo sano + relajado + fuera de placa = silencio eléctrico.',
            'Actividad normal en zona de placa: ruido de placa y espículas (NO son patológicas).',
            'Cualquier actividad sostenida fuera de la placa = patológica.',
            'Verificar siempre que el paciente esté completamente relajado antes de interpretar.',
          ],
          keyPointsEn: [
            'Healthy muscle + relaxed + outside endplate = electrical silence.',
            'Normal activity in endplate zone: endplate noise and spikes (NOT pathological).',
            'Any sustained activity outside endplate = pathological.',
            'Always verify patient is completely relaxed before interpreting.',
          ],
          children: [
            { id: 'endplate-noise', title: 'Ruido de placa motora (potenciales en miniatura)',
              titleEn: 'Endplate Noise (Miniature Potentials)',
              content: `El ruido de placa motora es una actividad eléctrica NORMAL que se registra cuando la punta de la aguja se posiciona muy cerca de la zona de unión neuromuscular (placa terminal). NO es un hallazgo patológico, pero puede confundirse con fibrilaciones si no se conoce bien.

**Fisiopatología:**
En reposo, las vesículas sinápticas liberan espontáneamente pequeñas cantidades de acetilcolina (ACh) sin que exista un potencial de acción nervioso. Cada vesícula contiene ~10,000 moléculas de ACh que generan un potencial miniatura de placa terminal (MEPP). Estos MEPPs son subumbrales: NO disparan un potencial de acción completo de la fibra muscular.

**Características electrofisiológicas:**
| Parámetro | Ruido de placa | Fibrilaciones |
|---|---|---|
| Morfología | Monofásico NEGATIVO | Bifásico (+ inicial) |
| Amplitud | 10-50 µV | 20-200 µV |
| Patrón | Irregular, continuo | Regular, rítmico |
| Sonido | "Soplido de viento" / "concha marina" | "Lluvia en el techo" |
| Significado | NORMAL (zona de placa) | PATOLÓGICO (denervación) |
| Duración del potencial | <1 ms | 1-5 ms |

**Correlato auditivo:** Se escucha como un susurro continuo, similar a poner una concha marina en el oído o al "shhhhh" del viento. NO tiene la regularidad rítmica de las fibrilaciones.

**¿Cómo confirmar que es ruido de placa?**
• El paciente puede referir dolor leve al estar en la zona de placa.
• Al mover la aguja 1-2 mm, el ruido desaparece (te alejaste de la placa).
• La deflexión inicial es NEGATIVA (a diferencia de las fibrilaciones que tienen deflexión positiva inicial).`,
              contentEn: `Endplate noise is NORMAL electrical activity recorded when the needle tip is positioned very close to the neuromuscular junction zone (motor endplate). It is NOT a pathological finding, but can be confused with fibrillations if not well understood.

**Pathophysiology:**
At rest, synaptic vesicles spontaneously release small amounts of acetylcholine (ACh) without a nerve action potential. Each vesicle contains ~10,000 ACh molecules that generate a miniature endplate potential (MEPP). These MEPPs are subthreshold: they do NOT trigger a complete muscle fiber action potential.

**Electrophysiological characteristics:**
| Parameter | Endplate noise | Fibrillations |
|---|---|---|
| Morphology | Monophasic NEGATIVE | Biphasic (+ initial) |
| Amplitude | 10-50 µV | 20-200 µV |
| Pattern | Irregular, continuous | Regular, rhythmic |
| Sound | "Wind blowing" / "seashell" | "Rain on the roof" |
| Significance | NORMAL (endplate zone) | PATHOLOGICAL (denervation) |
| Potential duration | <1 ms | 1-5 ms |

**Audio correlate:** Sounds like a continuous whisper, similar to putting a seashell to your ear or the "shhhhh" of wind. It does NOT have the rhythmic regularity of fibrillations.

**How to confirm it is endplate noise?**
• The patient may report mild pain when in the endplate zone.
• When moving the needle 1-2 mm, the noise disappears (you moved away from the endplate).
• The initial deflection is NEGATIVE (unlike fibrillations which have initial positive deflection).`,
              clinicalPearls: [
                'La clave para diferenciar ruido de placa vs. fibrilaciones: DEFLEXIÓN INICIAL. Ruido de placa = negativo-primero. Fibrilaciones = positivo-primero. Memoriza: "Placa → Negativo, Patológico → Positivo".',
                'Si el paciente dice "me duele un poco ahí" durante el reposo y escuchas un susurro eléctrico, probablemente estás en la zona de placa. Mueve la aguja 1-2 mm y el dolor y el ruido desaparecerán.',
              ],
              clinicalPearlsEn: [
                'The key to differentiating endplate noise vs. fibrillations: INITIAL DEFLECTION. Endplate noise = negative-first. Fibrillations = positive-first. Memorize: "Plate → Negative, Pathological → Positive".',
                'If the patient says "it hurts a bit there" during rest and you hear an electrical whisper, you are probably in the endplate zone. Move the needle 1-2 mm and both pain and noise will disappear.',
              ],
              keyPoints: [
                'Actividad NORMAL de la zona de placa: NO reportar como patológica.',
                'Morfología: monofásico negativo, 10-50 µV, irregular.',
                'Sonido: "soplido de viento" o "concha marina" (vs. "lluvia" de fibrilaciones).',
                'Diferencia clave: deflexión negativa inicial (vs. positiva en fibrilaciones).',
              ],
              keyPointsEn: [
                'NORMAL activity from the endplate zone: do NOT report as pathological.',
                'Morphology: monophasic negative, 10-50 µV, irregular.',
                'Sound: "wind blowing" or "seashell" (vs. "rain" of fibrillations).',
                'Key difference: initial negative deflection (vs. positive in fibrillations).',
              ],
              videoUrls: [{ title: 'Potencial de placa terminal miniatura', driveId: '1oGLifGxCY-iBMDZv39NTOtc3TwjYChpF' }],
            },
            { id: 'endplate-spikes', title: 'Espículas de placa terminal',
              titleEn: 'Endplate Spikes',
              content: `Las espículas de placa terminal son potenciales de acción NORMALES que se generan cuando una sola fibra muscular se activa espontáneamente en la zona de la unión neuromuscular. A diferencia del ruido de placa (subumbral), las espículas superan el umbral y generan un potencial de acción completo.

**Fisiopatología:**
Ocasionalmente, los MEPPs (potenciales miniatura) se suman temporalmente y alcanzan el umbral de disparo de una fibra muscular individual. Esto es especialmente frecuente cuando la punta de la aguja estimula mecánicamente las terminaciones nerviosas en la zona de placa, liberando más ACh de lo habitual.

**Características electrofisiológicas:**
| Parámetro | Valor |
|---|---|
| Morfología | Bifásica con deflexión NEGATIVA inicial |
| Amplitud | 100-200 µV (mayor que ruido de placa) |
| Frecuencia de descarga | Irregular (a diferencia de fibrilaciones) |
| Duración | 3-4 ms |
| Sonido | "Sputtering" o "chisporroteo" irregular |

**¿Por qué duelen?**
La aguja está directamente sobre las terminaciones nerviosas sensitivas de la zona de placa. El dolor es un indicador clínico confiable de que estás en la zona de placa — si el paciente refiere dolor punzante intermitente, probablemente estás registrando espículas de placa.

**Manejo clínico:**
• Reconocer que son NORMALES (no reportarlas como patológicas).
• Mover la aguja 1-2 mm para salir de la zona de placa → alivio del dolor.
• Si persistente, redirigir la aguja hacia un cuadrante diferente.

**Diferencial con fibrilaciones:**
| Característica | Espículas de placa | Fibrilaciones |
|---|---|---|
| Deflexión inicial | NEGATIVA | POSITIVA |
| Patrón | Irregular | Regular/rítmico |
| Localización | Solo en zona de placa | En todo el músculo |
| Dolor | Sí (frecuente) | No |
| Significado | Normal | Patológico |`,
              contentEn: `Endplate spikes are NORMAL action potentials generated when a single muscle fiber fires spontaneously in the neuromuscular junction zone. Unlike endplate noise (subthreshold), spikes exceed the threshold and generate a complete action potential.

**Pathophysiology:**
Occasionally, MEPPs (miniature potentials) temporally summate and reach the firing threshold of an individual muscle fiber. This is especially frequent when the needle tip mechanically stimulates nerve terminals in the endplate zone, releasing more ACh than usual.

**Electrophysiological characteristics:**
| Parameter | Value |
|---|---|
| Morphology | Biphasic with initial NEGATIVE deflection |
| Amplitude | 100-200 µV (higher than endplate noise) |
| Discharge frequency | Irregular (unlike fibrillations) |
| Duration | 3-4 ms |
| Sound | "Sputtering" or irregular "crackling" |

**Why do they hurt?**
The needle is directly over the sensory nerve endings of the endplate zone. Pain is a reliable clinical indicator that you are in the endplate zone — if the patient reports intermittent stabbing pain, you are probably recording endplate spikes.

**Clinical management:**
• Recognize they are NORMAL (do not report as pathological).
• Move the needle 1-2 mm to exit the endplate zone → pain relief.
• If persistent, redirect the needle to a different quadrant.

**Differential with fibrillations:**
| Feature | Endplate spikes | Fibrillations |
|---|---|---|
| Initial deflection | NEGATIVE | POSITIVE |
| Pattern | Irregular | Regular/rhythmic |
| Location | Only in endplate zone | Throughout muscle |
| Pain | Yes (frequent) | No |
| Significance | Normal | Patological |`,
              clinicalPearls: [
                'La regla mnemotécnica para espículas de placa: "Negativo + Irregular + Dolor = Placa". Fibrilaciones: "Positivo + Regular + Sin dolor = Denervación".',
                'NUNCA reportes espículas de placa como "fibrilaciones" en tu informe. Este error puede llevar a un diagnóstico falso de denervación y cambiar por completo el manejo del paciente.',
              ],
              clinicalPearlsEn: [
                'Mnemonic rule for endplate spikes: "Negative + Irregular + Pain = Endplate". Fibrillations: "Positive + Regular + No pain = Denervation".',
                'NEVER report endplate spikes as "fibrillations" in your report. This error can lead to a false denervation diagnosis and completely change patient management.',
              ],
              keyPoints: [
                'Espículas de placa: bifásicas con deflexión negativa inicial, 100-200 µV.',
                'Son NORMALES: se producen por estimulación mecánica de la placa motora.',
                'Causan dolor al paciente: mover la aguja 1-2 mm alivia.',
                'NO confundir con fibrilaciones: deflexión negativa vs. positiva, irregular vs. regular.',
              ],
              keyPointsEn: [
                'Endplate spikes: biphasic with initial negative deflection, 100-200 µV.',
                'They are NORMAL: produced by mechanical stimulation of the motor endplate.',
                'They cause patient pain: moving the needle 1-2 mm provides relief.',
                'Do NOT confuse with fibrillations: negative vs. positive deflection, irregular vs. regular.',
              ],
              videoUrls: [{ title: 'Espículas de placa terminal', driveId: '1zLA6JYR_BnDAfU28jcA3rH1HHNYSlr66' }, { title: 'Espículas de placa terminal (2)', driveId: '17zBInoX6SZiX0-L4v34Gf_B5ha7tygwL' }, { title: 'Espículas de placa terminal atípicas', driveId: '16ftESXOlyuKHTvfbbQKdjtM3bPSbr-o9' }],
            },
            { id: 'normal-silence', title: 'Silencio eléctrico normal',
              titleEn: 'Normal Electrical Silence',
              content: `Un músculo completamente relajado, con la aguja posicionada FUERA de la zona de placa motora, no muestra ninguna actividad eléctrica. La pantalla muestra una línea base plana y el altavoz está en silencio. Este es el hallazgo ESPERADO en un músculo sano.

**¿Por qué el músculo sano calla en reposo?**
• La membrana de la fibra muscular sana tiene un potencial de reposo estable (-70 a -90 mV), mantenido por la bomba Na+/K+-ATPasa.
• Los canales de Na+ voltaje-dependientes están cerrados e inactivados → no hay despolarización espontánea.
• La fibra muscular solo se activa cuando recibe un potencial de acción del nervio motor a través de la unión neuromuscular.

**¿Cuándo el silencio es significativo?**
• **Silencio completo + inserción normal** = músculo sano (hallazgo esperado).
• **Silencio completo + inserción disminuida** = posible fibrosis/atrofia severa.
• **Silencio ROTO por actividad espontánea** = PATOLÓGICO (buscar fibrilaciones, PSW, CRD).

**Tiempo de evaluación:**
Mantener la aguja inmóvil por al menos 2-3 segundos en cada posición. Las fibrilaciones pueden ser intermitentes — un reposo insuficiente puede hacerlas pasar desapercibidas.

**Cuántos sitios evaluar en reposo:**
Evaluar el reposo en CADA una de las posiciones de inserción (4 cuadrantes × 3 profundidades). Las fibrilaciones pueden estar presentes en un sector del músculo y ausentes en otro.`,
              contentEn: `A completely relaxed muscle, with the needle positioned OUTSIDE the motor endplate zone, shows no electrical activity. The screen shows a flat baseline and the speaker is silent. This is the EXPECTED finding in a healthy muscle.

**Why does the healthy muscle go silent at rest?**
• The healthy muscle fiber membrane has a stable resting potential (-70 to -90 mV), maintained by the Na+/K+-ATPase pump.
• Voltage-dependent Na+ channels are closed and inactivated → no spontaneous depolarization.
• The muscle fiber only fires when it receives an action potential from the motor nerve through the neuromuscular junction.

**When is silence significant?**
• **Complete silence + normal insertion** = healthy muscle (expected finding).
• **Complete silence + decreased insertion** = possible fibrosis/severe atrophy.
• **Silence BROKEN by spontaneous activity** = PATHOLOGICAL (look for fibrillations, PSWs, CRDs).

**Evaluation time:**
Keep the needle motionless for at least 2-3 seconds at each position. Fibrillations may be intermittent — insufficient rest time can cause them to be missed.

**How many sites to evaluate at rest:**
Evaluate rest at EACH insertion position (4 quadrants × 3 depths). Fibrillations may be present in one sector of the muscle and absent in another.`,
              clinicalPearls: [
                'El silencio en reposo es tan importante como encontrar actividad espontánea. Un reporte que dice "sin actividad espontánea en reposo en los músculos explorados" es extremadamente valioso para descartar denervación activa.',
                'Trampa del principiante: evaluar el reposo por solo 1 segundo y seguir adelante. Las fibrilaciones leves (1+) pueden pasar desapercibidas. Recomendación: mínimo 2-3 s de reposo en CADA posición.',
              ],
              clinicalPearlsEn: [
                'Silence at rest is as important as finding spontaneous activity. A report stating "no spontaneous activity at rest in explored muscles" is extremely valuable for ruling out active denervation.',
                'Beginner trap: evaluating rest for only 1 second and moving on. Mild fibrillations (1+) can be missed. Recommendation: minimum 2-3 s of rest at EACH position.',
              ],
              keyPoints: [
                'Músculo sano + relajado + fuera de placa = línea base plana (silencio eléctrico).',
                'Mantenido por potencial de reposo estable (-70 a -90 mV) y canales Na+ cerrados.',
                'Evaluar reposo por mínimo 2-3 s en cada posición — no apresurarse.',
                'Cualquier actividad fuera de placa con aguja quieta = anormal.',
              ],
              keyPointsEn: [
                'Healthy muscle + relaxed + outside endplate = flat baseline (electrical silence).',
                'Maintained by stable resting potential (-70 to -90 mV) and closed Na+ channels.',
                'Evaluate rest for minimum 2-3 s at each position — don\'t rush.',
                'Any activity outside endplate with needle still = abnormal.',
              ],
            },
          ]
        },
        { id: 'spontaneous-activity', title: '③ Actividad espontánea anormal',
          titleEn: '③ Abnormal Spontaneous Activity',
          description: 'Hallazgos patológicos que aparecen con el músculo en reposo y la aguja inmóvil',
          descriptionEn: 'Pathological findings appearing with the muscle at rest and the needle still',
          content: `La actividad espontánea anormal es cualquier actividad eléctrica que se produce con la aguja inmóvil y el músculo completamente relajado, FUERA de la zona de placa motora. Su presencia siempre indica un proceso patológico.

**Clasificación por mecanismo:**
| Tipo | Origen | Mecanismo | Sonido |
|---|---|---|---|
| Fibrilaciones | Fibra muscular individual | Denervación → hiperexcitabilidad | "Lluvia en el techo" |
| PSW (Ondas agudas positivas) | Fibra muscular individual | Denervación → despolarización espontánea | "Golpe sordo" |
| Fasciculaciones | Unidad motora completa | Hiperexcitabilidad axonal | PUM irregular aislado |
| CRD | Circuito efáptico | Transmisión entre fibras adyacentes | "Máquina de coser" |
| Descargas miotónicas | Fibra muscular | Canalopatía (Na+/Cl-) | "Bombardero en picada" |
| Mioquimias | Grupo de UM | Hiperexcitabilidad periférica | "Soldados marchando" |
| Neuromiotonía | Fibras musculares | Anticuerpos anti-canal K+ | "Motor eléctrico" |

**Importancia clínica:** La identificación correcta del tipo de actividad espontánea orienta el diagnóstico diferencial. Cada tipo tiene un patrón sonoro y visual característico que, una vez aprendido, se reconoce inmediatamente.`,
          contentEn: `Abnormal spontaneous activity is any electrical activity occurring with the needle still and the muscle completely relaxed, OUTSIDE the motor endplate zone. Its presence always indicates a pathological process.

**Classification by mechanism:**
| Type | Origin | Mechanism | Sound |
|---|---|---|---|
| Fibrillations | Individual muscle fiber | Denervation → hyperexcitability | "Rain on the roof" |
| PSW (Positive sharp waves) | Individual muscle fiber | Denervation → spontaneous depolarization | "Dull thud" |
| Fasciculations | Complete motor unit | Axonal hyperexcitability | Isolated irregular MUP |
| CRD | Ephaptic circuit | Transmission between adjacent fibers | "Sewing machine" |
| Myotonic discharges | Muscle fiber | Channelopathy (Na+/Cl-) | "Dive bomber" |
| Myokymia | MU group | Peripheral hyperexcitability | "Marching soldiers" |
| Neuromyotonia | Muscle fibers | Anti-K+ channel antibodies | "Electric motor" |

**Clinical importance:** Correct identification of the type of spontaneous activity guides the differential diagnosis. Each type has a characteristic sound and visual pattern that, once learned, is immediately recognized.`,
          videoUrls: [{ title: 'Calambre', driveId: '19TAx27BvBDeMefLtu2ZW_SsvW76Nm_pW' }, { title: 'Calambre 2', driveId: '1AgwXJWo-VMzu5wb4OoZhpoVaR4lB95Un' }],
          children: [
            { id: 'fibrillations', title: 'Fibrilaciones: fisiopatología y significado',
              titleEn: 'Fibrillations: Pathophysiology and Significance',
              content: `Las fibrilaciones son potenciales de acción espontáneos de una SOLA FIBRA MUSCULAR que ha perdido su inervación. Son el sello electrodiagnóstico de la denervación activa y uno de los hallazgos más importantes en EMG.

**Fisiopatología detallada:**
Cuando una fibra muscular pierde su nervio motor:
• Días 1-7: La fibra aún tiene receptores de ACh concentrados en la placa. Sin actividad, comienza la degradación de la unión neuromuscular.
• Días 7-14: La membrana expresa receptores de ACh en TODA su superficie (up-regulation) y nuevos canales de Na+ voltaje-dependientes. La fibra se vuelve hiperexcitable.
• Días 14-21: La combinación de hiperexcitabilidad + inestabilidad del potencial de reposo genera despolarizaciones espontáneas rítmicas → FIBRILACIONES.

**Morfología:**
• Bifásicas con deflexión POSITIVA inicial (la clave para diferenciar de espículas de placa).
• Duración: 1-5 ms.
• Amplitud: 20-200 µV (inicialmente grandes, se reducen con la atrofia).
• Frecuencia de descarga: regular, rítmica, 0.5-10 Hz.

**Gradación semicuantitativa (escala AANEM):**
| Grado | Descripción | Significado clínico |
|---|---|---|
| 1+ | Fibrilaciones persistentes en al menos 2 sitios | Denervación leve/focal |
| 2+ | Cantidad moderada en ≥3 sitios | Denervación moderada |
| 3+ | Abundantes en todos los sitios explorados | Denervación severa difusa |
| 4+ | Se escuchan al máximo volumen, llenan la pantalla | Denervación masiva activa |

**Correlato auditivo:** "Lluvia en el techo" — potenciales pequeños, regulares, rítmicos, como gotas de lluvia cayendo sobre un techo de lámina. Una vez que entrenas tu oído para reconocerlas, las detectas antes de verlas en la pantalla.

**Causas (más allá de denervación):**
• Denervación (radiculopatía, neuropatía, ELA) — la causa más frecuente
• Miopatías inflamatorias (dermatomiositis, polimiositis)
• Miopatías necrotizantes autoinmunes (anti-SRP, anti-HMGCR)
• Distrofias musculares (especialmente fases activas)
• Rabdomiólisis aguda

**Cronología post-denervación:**
Las fibrilaciones aparecen a las 2-3 semanas post-lesión en músculos proximales al sitio de lesión (más cercanos al lugar de la denervación) y pueden tardar 3-5 semanas en músculos distales (el nervio debe degenerar distalmente primero — degeneración Walleriana).`,
              contentEn: `Fibrillations are spontaneous action potentials from a SINGLE MUSCLE FIBER that has lost its innervation. They are the electrodiagnostic hallmark of active denervation and one of the most important EMG findings.

**Detailed pathophysiology:**
When a muscle fiber loses its motor nerve:
• Days 1-7: The fiber still has ACh receptors concentrated at the endplate. Without activity, neuromuscular junction degradation begins.
• Days 7-14: The membrane expresses ACh receptors across its ENTIRE surface (up-regulation) and new voltage-dependent Na+ channels. The fiber becomes hyperexcitable.
• Days 14-21: The combination of hyperexcitability + resting potential instability generates spontaneous rhythmic depolarizations → FIBRILLATIONS.

**Morphology:**
• Biphasic with initial POSITIVE deflection (key to differentiate from endplate spikes).
• Duration: 1-5 ms.
• Amplitude: 20-200 µV (initially large, decrease with atrophy).
• Discharge frequency: regular, rhythmic, 0.5-10 Hz.

**Semi-quantitative grading (AANEM scale):**
| Grade | Description | Clinical significance |
|---|---|---|
| 1+ | Persistent fibrillations in at least 2 sites | Mild/focal denervation |
| 2+ | Moderate amount in ≥3 sites | Moderate denervation |
| 3+ | Abundant in all explored sites | Severe diffuse denervation |
| 4+ | Heard at maximum volume, fill the screen | Massive active denervation |

**Audio correlate:** "Rain on the roof" — small, regular, rhythmic potentials, like raindrops falling on a tin roof. Once you train your ear to recognize them, you detect them before seeing them on screen.

**Causes (beyond denervation):**
• Denervation (radiculopathy, neuropathy, ALS) — most frequent cause
• Inflammatory myopathies (dermatomyositis, polymyositis)
• Autoimmune necrotizing myopathies (anti-SRP, anti-HMGCR)
• Muscular dystrophies (especially active phases)
• Acute rhabdomyolysis

**Post-denervation chronology:**
Fibrillations appear at 2-3 weeks post-injury in muscles proximal to the injury site and may take 3-5 weeks in distal muscles (the nerve must degenerate distally first — Wallerian degeneration).`,
              clinicalPearls: [
                'La deflexión POSITIVA inicial es la firma de las fibrilaciones. Si ves potenciales pequeños con deflexión NEGATIVA inicial → probablemente estás en la zona de placa (espículas de placa), no fibrilaciones patológicas.',
                'Las fibrilaciones en miopatía inflamatoria pueden ser indistinguibles de las de denervación. La clave: en miopatía, los PUM son cortos y el reclutamiento es precoz. En denervación, los PUM son largos y el reclutamiento reducido.',
                'En ELA: fibrilaciones en 3+ regiones corporales (bulbar, cervical, torácica, lumbar) son un criterio diagnóstico clave según Gold Coast 2019.',
              ],
              clinicalPearlsEn: [
                'The initial POSITIVE deflection is the fibrillation signature. If you see small potentials with initial NEGATIVE deflection → you are probably in the endplate zone (endplate spikes), not pathological fibrillations.',
                'Fibrillations in inflammatory myopathy can be indistinguishable from denervation. The key: in myopathy, MUPs are short and recruitment is early. In denervation, MUPs are long and recruitment is reduced.',
                'In ALS: fibrillations in 3+ body regions (bulbar, cervical, thoracic, lumbar) are a key diagnostic criterion per Gold Coast 2019.',
              ],
              keyPoints: [
                'Fibrilaciones: potencial de fibra individual denervada, bifásico con deflexión positiva inicial.',
                'Aparecen 2-3 semanas post-denervación (proximales antes que distales).',
                'Gradación: 1+ (leve/focal) a 4+ (masiva/difusa).',
                'Sonido: "lluvia en el techo" — regular, rítmico, 0.5-10 Hz.',
              ],
              keyPointsEn: [
                'Fibrillations: individual denervated fiber potential, biphasic with initial positive deflection.',
                'Appear 2-3 weeks post-denervation (proximal before distal).',
                'Grading: 1+ (mild/focal) to 4+ (massive/diffuse).',
                'Sound: "rain on the roof" — regular, rhythmic, 0.5-10 Hz.',
              ],
              videoUrls: [{ title: 'Fibrilaciones', driveId: '1K9oy18ok-gK3NTKP1ZxLmbBwRci9Ui90' }],
            },
            { id: 'positive-sharp-waves', title: 'Ondas agudas positivas (PSW)',
              titleEn: 'Positive Sharp Waves (PSW)',
              content: `Las ondas agudas positivas (PSW) tienen el MISMO significado clínico que las fibrilaciones — indican denervación activa. Sin embargo, tienen una morfología y cronología distintas que las hacen complementarias en el diagnóstico.

**Fisiopatología:**
La PSW se genera cuando la aguja EMG está directamente adyacente a la fibra muscular denervada que se despolariza espontáneamente. La punta de la aguja actúa como un "cortocircuito" local, registrando una gran deflexión positiva inicial seguida de un lento retorno negativo. Esencialmente, son fibrilaciones registradas desde una perspectiva geométrica diferente (junto a la fibra vs. a distancia).

**Morfología:**
• Deflexión POSITIVA inicial abrupta y de gran amplitud.
• Seguida de un retorno lento y gradual hacia la línea base (fase negativa lenta).
• Duración: más larga que las fibrilaciones (5-100 ms).
• Amplitud: 20-1000 µV (más variable que fibrilaciones).
• Frecuencia: regular, 0.5-10 Hz (similar a fibrilaciones).

**Cronología comparada con fibrilaciones:**
| Evento | PSW | Fibrilaciones |
|---|---|---|
| Aparición post-lesión | 10-14 días (ligeramente antes) | 14-21 días |
| Desaparición post-reinervación | Persisten más tiempo | Desaparecen primero |
| Significado pronóstico | Igual que fibrilaciones | Igual que PSW |

**Correlato auditivo:** "Golpe sordo" o "toc-toc" — sonido más grave y contundente que las fibrilaciones. Cada PSW suena como un pequeño golpe aislado, similar a un tambor lejano.

**Gradación:** Se usa la misma escala 1+ a 4+ que para fibrilaciones. Típicamente, fibrilaciones y PSW coexisten en el mismo músculo denervado.`,
              contentEn: `Positive sharp waves (PSW) have the SAME clinical significance as fibrillations — they indicate active denervation. However, they have a different morphology and chronology that makes them complementary in diagnosis.

**Pathophysiology:**
The PSW is generated when the EMG needle is directly adjacent to the denervated muscle fiber that is spontaneously depolarizing. The needle tip acts as a local "short circuit," recording a large initial positive deflection followed by a slow negative return. Essentially, they are fibrillations recorded from a different geometric perspective (next to the fiber vs. at a distance).

**Morphology:**
• Abrupt initial POSITIVE deflection of large amplitude.
• Followed by a slow, gradual return toward baseline (slow negative phase).
• Duration: longer than fibrillations (5-100 ms).
• Amplitude: 20-1000 µV (more variable than fibrillations).
• Frequency: regular, 0.5-10 Hz (similar to fibrillations).

**Chronology compared with fibrillations:**
| Event | PSW | Fibrillations |
|---|---|---|
| Onset post-injury | 10-14 days (slightly earlier) | 14-21 days |
| Disappearance post-reinnervation | Persist longer | Disappear first |
| Prognostic significance | Same as fibrillations | Same as PSW |

**Audio correlate:** "Dull thud" or "knock-knock" — a deeper, more blunt sound than fibrillations. Each PSW sounds like a small isolated knock, similar to a distant drum.

**Grading:** The same 1+ to 4+ scale as for fibrillations is used. Typically, fibrillations and PSWs coexist in the same denervated muscle.`,
              clinicalPearls: [
                'Las PSW a menudo aparecen ANTES que las fibrilaciones y PERSISTEN más tiempo después de la reinervación. Si encuentras PSW sin fibrilaciones, puede indicar: denervación muy reciente (aún no han aparecido las fibs) o reinervación en progreso (las fibs ya desaparecieron pero las PSW persisten).',
                'En un reporte EMG, documenta fibrilaciones y PSW por separado con su gradación. Esto proporciona una "línea de tiempo" del proceso de denervación.',
              ],
              clinicalPearlsEn: [
                'PSWs often appear BEFORE fibrillations and PERSIST longer after reinnervation. If you find PSWs without fibrillations, it may indicate: very recent denervation (fibs haven\'t appeared yet) or ongoing reinnervation (fibs already disappeared but PSWs persist).',
                'In an EMG report, document fibrillations and PSWs separately with their grading. This provides a "timeline" of the denervation process.',
              ],
              keyPoints: [
                'PSW: mismo significado que fibrilaciones (denervación activa).',
                'Morfología: deflexión positiva inicial abrupta + retorno lento negativo.',
                'Aparecen ligeramente ANTES que las fibrilaciones y persisten MÁS TIEMPO.',
                'Sonido: "golpe sordo" o "toc-toc" (más grave que fibrilaciones).',
              ],
              keyPointsEn: [
                'PSW: same significance as fibrillations (active denervation).',
                'Morphology: abrupt initial positive deflection + slow negative return.',
                'Appear slightly BEFORE fibrillations and persist LONGER.',
                'Sound: "dull thud" or "knock-knock" (deeper than fibrillations).',
              ],
              videoUrls: [{ title: 'Ondas positivas', driveId: '1E2kLgERe2t0uNjx-brGCrlja6GduTG0I' }, { title: 'Ondas positivas + fibrilaciones', driveId: '1rIl096UwPW5aNyeLY9DKAtFtt72A2SGb' }],
            },
            { id: 'fasciculaciones', title: 'Fasciculaciones: benignas vs. malignas',
              titleEn: 'Fasciculations: Benign vs. Malignant',
              content: `Las fasciculaciones son descargas espontáneas de una UNIDAD MOTORA COMPLETA (no de una sola fibra como las fibrilaciones). Clínicamente se ven como contracciones breves y visibles de un fascículo muscular bajo la piel.

**Fisiopatología:**
El origen puede ser en cualquier punto del eje axonal: desde la motoneurona en la médula hasta las ramas terminales del nervio. Un foco de hiperexcitabilidad genera un disparo espontáneo que activa todas las fibras musculares de la UM.

**En EMG: ¿Qué se ve?**
Un PUM de morfología y amplitud normal que aparece de forma aislada e IRREGULAR durante el reposo. A diferencia de la contracción voluntaria, no hay control del disparo (el paciente no está contrayendo).

**Diferenciación CRÍTICA: benignas vs. malignas**
| Característica | Benignas | Malignas (patológicas) |
|---|---|---|
| Contexto clínico | Persona sana, estrés, cafeína, ejercicio | Debilidad progresiva, atrofia muscular |
| Morfología del PUM | Normal, estable | Compleja, polifasética, inestable |
| Actividad espontánea acompañante | Ausente | Fibrilaciones y PSW presentes |
| PUM en contracción | Normales | Neurogénicos (largos, grandes) |
| Reclutamiento | Normal | Reducido |
| Localización | Focal (ej: pantorrilla) | Difusa (múltiples regiones) |

**Criterios de Awaji (Gold Coast 2019):**
En el contexto de ELA, las fasciculaciones en un músculo con evidencia de disfunción de motoneurona inferior (LMN) tienen el MISMO VALOR DIAGNÓSTICO que las fibrilaciones. Esto revolucionó el diagnóstico temprano de ELA.

**Fasciculaciones benignas (Síndrome de Fasciculaciones Benignas — BFS):**
• Muy comunes en la población general (70% de personas las experimenta).
• Localización clásica: pantorrilla, párpado, pulgar.
• Desencadenantes: estrés, cafeína, falta de sueño, ejercicio intenso.
• EMG: PUM de morfología NORMAL, sin fibrilaciones ni PSW, reclutamiento normal.
• Pronóstico: excelente. Se autoresuelven.

**Correlato auditivo:** Se escucha un PUM aislado que "rompe" el silencio del reposo de forma irregular e impredecible — como un disparo de rifle aislado en un paisaje silencioso.`,
              contentEn: `Fasciculations are spontaneous discharges of a COMPLETE MOTOR UNIT (not a single fiber like fibrillations). Clinically, they are seen as brief, visible contractions of a muscle fascicle under the skin.

**Pathophysiology:**
The origin can be at any point along the axonal axis: from the spinal motor neuron to the terminal nerve branches. A focus of hyperexcitability generates a spontaneous discharge that activates all muscle fibers of the MU.

**On EMG: What do you see?**
A MUP of normal morphology and amplitude appearing isolated and IRREGULAR during rest. Unlike voluntary contraction, there is no control of firing (the patient is not contracting).

**CRITICAL differentiation: benign vs. malignant**
| Feature | Benign | Malignant (pathological) |
|---|---|---|
| Clinical context | Healthy person, stress, caffeine, exercise | Progressive weakness, muscle atrophy |
| MUP morphology | Normal, stable | Complex, polyphasic, unstable |
| Accompanying spontaneous activity | Absent | Fibrillations and PSWs present |
| PUMs during contraction | Normal | Neurogenic (long, large) |
| Recruitment | Normal | Reduced |
| Location | Focal (e.g., calf) | Diffuse (multiple regions) |

**Awaji Criteria (Gold Coast 2019):**
In the context of ALS, fasciculations in a muscle with evidence of lower motor neuron (LMN) dysfunction have the SAME DIAGNOSTIC VALUE as fibrillations. This revolutionized early ALS diagnosis.

**Benign fasciculations (Benign Fasciculation Syndrome — BFS):**
• Very common in the general population (70% of people experience them).
• Classic location: calf, eyelid, thumb.
• Triggers: stress, caffeine, sleep deprivation, intense exercise.
• EMG: NORMAL morphology MUPs, no fibrillations or PSWs, normal recruitment.
• Prognosis: excellent. Self-resolving.

**Audio correlate:** You hear an isolated MUP that "breaks" the silence of rest in an irregular, unpredictable manner — like an isolated rifle shot in a silent landscape.`,
              clinicalPearls: [
                'La pregunta más frecuente del paciente ansioso: "Doctor, ¿mis fasciculaciones son ELA?" La respuesta EMG es clara: si NO hay fibrilaciones, PSW, ni PUM neurogénicos → es BENIGNO. Tranquilizar con datos.',
                'En ELA: las fasciculaciones aparecen en músculos que AÚN no tienen debilidad clínica. Son a menudo el PRIMER síntoma. Si un paciente tiene fasciculaciones difusas + EMG con fibrilaciones en 2+ regiones, refiere URGENTE a neurología.',
                'Criterios Gold Coast 2019: fasciculaciones + evidencia de disfunción LMN = suficiente para el diagnóstico. Ya no se requiere la combinación clásica de fibrilaciones + PSW.',
              ],
              clinicalPearlsEn: [
                'The most frequent question from the anxious patient: "Doctor, are my fasciculations ALS?" The EMG answer is clear: if there are NO fibrillations, PSWs, or neurogenic MUPs → it is BENIGN. Reassure with data.',
                'In ALS: fasciculations appear in muscles that do NOT yet have clinical weakness. They are often the FIRST symptom. If a patient has diffuse fasciculations + EMG with fibrillations in 2+ regions, refer URGENTLY to neurology.',
                'Gold Coast 2019 criteria: fasciculations + evidence of LMN dysfunction = sufficient for diagnosis. The classic combination of fibrillations + PSW is no longer required.',
              ],
              keyPoints: [
                'Fasciculaciones: descarga espontánea de una UM COMPLETA (no fibra individual).',
                'Benignas: PUM normal + sin fibs/PSW + reclutamiento normal = excelente pronóstico.',
                'Malignas: PUM complejo + fibs/PSW + reclutamiento reducido = investigar ELA.',
                'Gold Coast 2019: fasciculaciones = mismo valor diagnóstico que fibrilaciones en contexto ELA.',
              ],
              keyPointsEn: [
                'Fasciculations: spontaneous discharge of a COMPLETE MU (not individual fiber).',
                'Benign: normal MUP + no fibs/PSW + normal recruitment = excellent prognosis.',
                'Malignant: complex MUP + fibs/PSW + reduced recruitment = investigate ALS.',
                'Gold Coast 2019: fasciculations = same diagnostic value as fibrillations in ALS context.',
              ],
              videoUrls: [{ title: 'Fasciculaciones', driveId: '1vp09_FsBATj5VBTriGGw3FdyTfDU_9Vd' }, { title: 'Tremor Parkinsoniano', driveId: '17EwHc-8pg83JF1No6EKyTkiCTkpWPhm4' }, { title: 'Registro de un px con ALS', driveId: '1hWzkmC5KVuVLUI71QiBxMXRIso8-M1Eg' }],
            },
            { id: 'crd', title: 'Descargas repetitivas complejas (CRD)',
              titleEn: 'Complex Repetitive Discharges (CRD)',
              content: `Las descargas repetitivas complejas (CRD) son trenes de potenciales polifásicos que comienzan y terminan ABRUPTAMENTE, con regularidad mecánica perfecta. Son el equivalente eléctrico de un "circuito cerrado" entre fibras musculares adyacentes.

**Fisiopatología — El circuito efáptico:**
• Una fibra muscular se despolariza (la "marcapasos" del circuito).
• La corriente se transmite directamente a fibras adyacentes a través de las membranas (transmisión efáptica — SIN intermediación sináptica ni nerviosa).
• Estas fibras a su vez estimulan a las siguientes, creando un circuito cerrado que se autor-repite con precisión mecánica.
• El circuito se mantiene hasta que una de las fibras falla o se repositiona la aguja.

**Características electrofisiológicas:**
| Parámetro | CRD |
|---|---|
| Morfología | Polifásica compleja (5-100 componentes) |
| Frecuencia | 5-100 Hz (constante dentro de cada tren) |
| Inicio | ABRUPTO (como encender un motor) |
| Fin | ABRUPTO (como apagar un motor) |
| Variación amplitud/frecuencia | NINGUNA (constante — sin waxing/waning) |
| Sonido | "Máquina de coser" o "motor diesel" |

**Diferencia clave con descargas miotónicas:**
| Característica | CRD | Descarga miotónica |
|---|---|---|
| Frecuencia/amplitud | CONSTANTE | Waxing and waning |
| Inicio/fin | Abrupto | Gradual |
| Sonido | "Máquina de coser" | "Bombardero en picada" |
| Significado | Cronicidad (inespecífico) | Canalopatía específica |

**Causas — Indican CRONICIDAD:**
• Denervación crónica (meses-años de evolución)
• Miopatías crónicas (distrofias, miopatías inflamatorias de larga evolución)
• Polimiositis/dermatomiositis crónica
• Lesiones antiguas de nervio periférico
• Radiculopatías crónicas
• Schwannomas y otras lesiones compresivas de larga evolución

**Correlato auditivo:** "Máquina de coser" o "motor diesel al ralentí" — un sonido perfectamente regular, repetitivo, mecánico. Se distinguen de las fibrilaciones (irregulares) y de las miotónicas (cambiantes) por su ABSOLUTA REGULARIDAD.`,
              contentEn: `Complex repetitive discharges (CRDs) are trains of polyphasic potentials that begin and end ABRUPTLY, with perfect mechanical regularity. They are the electrical equivalent of a "closed circuit" between adjacent muscle fibers.

**Pathophysiology — The ephaptic circuit:**
• One muscle fiber depolarizes (the circuit "pacemaker").
• Current is transmitted directly to adjacent fibers through membranes (ephaptic transmission — WITHOUT synaptic or neural intermediation).
• These fibers in turn stimulate the next ones, creating a closed circuit that self-repeats with mechanical precision.
• The circuit is maintained until one fiber fails or the needle is repositioned.

**Electrophysiological characteristics:**
| Parameter | CRD |
|---|---|
| Morphology | Complex polyphasic (5-100 components) |
| Frequency | 5-100 Hz (constant within each train) |
| Onset | ABRUPT (like turning on a motor) |
| End | ABRUPT (like turning off a motor) |
| Amplitude/frequency variation | NONE (constant — no waxing/waning) |
| Sound | "Sewing machine" or "diesel engine" |

**Key difference with myotonic discharges:**
| Feature | CRD | Myotonic discharge |
|---|---|---|
| Frequency/amplitude | CONSTANT | Waxing and waning |
| Inicio/fin | Abrupt | Gradual |
| Sound | "Sewing machine" | "Dive bomber" |
| Significance | Chronicity (nonspecific) | Specific channelopathy |

**Causes — Indicate CHRONICITY:**
• Chronic denervation (months-years of evolution)
• Chronic myopathies (dystrophies, long-standing inflammatory myopathies)
• Chronic polymyositis/dermatomyositis
• Old peripheral nerve injuries
• Chronic radiculopathies
• Schwannomas and other long-standing compressive lesions

**Audio correlate:** "Sewing machine" or "diesel engine idling" — a perfectly regular, repetitive, mechanical sound. Distinguished from fibrillations (irregular) and myotonics (changing) by their ABSOLUTE REGULARITY.`,
              clinicalPearls: [
                'Las CRD NO son específicas de ninguna enfermedad — solo indican que el proceso es CRÓNICO. Si encuentras CRD + fibrilaciones en el mismo músculo, significa: proceso crónico con denervación activa superpuesta (ej: ELA progresiva, radiculopatía crónica con nuevo compromiso).',
                'Si escuchas un sonido "mecánico perfecto" que empieza y para abruptamente, son CRD. Si el sonido CAMBIA en frecuencia o amplitud (sube y baja), son descargas miotónicas. Esta diferencia auditiva es diagnóstica.',
              ],
              clinicalPearlsEn: [
                'CRDs are NOT specific to any disease — they only indicate the process is CHRONIC. If you find CRDs + fibrillations in the same muscle, it means: chronic process with superimposed active denervation (e.g., progressive ALS, chronic radiculopathy with new involvement).',
                'If you hear a "perfectly mechanical" sound that starts and stops abruptly, those are CRDs. If the sound CHANGES in frequency or amplitude (rises and falls), those are myotonic discharges. This auditory difference is diagnostic.',
              ],
              keyPoints: [
                'CRD: circuito efáptico cerrado entre fibras adyacentes (transmisión directa, no sináptica).',
                'Frecuencia y amplitud CONSTANTES (sin waxing/waning).',
                'Inicio y fin ABRUPTOS (como encender/apagar un motor).',
                'Significado: CRONICIDAD (no específico de enfermedad).',
              ],
              keyPointsEn: [
                'CRD: closed ephaptic circuit between adjacent fibers (direct transmission, not synaptic).',
                'CONSTANT frequency and amplitude (no waxing/waning).',
                'ABRUPT onset and end (like turning a motor on/off).',
                'Significance: CHRONICITY (not disease-specific).',
              ],
              videoUrls: [{ title: 'Descargas repetitivas complejas', driveId: '1DgUYo0lSJdlxb0seMq7c9sLYb6vQuF4c' }, { title: 'Descargas repetitivas complejas 2', driveId: '1690RuQIeJU4I-vmBI-Q6Z5g5WBbxU6TX' }],
            },
            { id: 'myotonic-discharges', title: 'Descargas miotónicas',
              titleEn: 'Myotonic Discharges',
              content: `Las descargas miotónicas son ráfagas de potenciales que oscilan en frecuencia y amplitud — el famoso patrón "waxing and waning" (crescendo-decrescendo). Producen el sonido más reconocible de toda la EMG: el "bombardero en picada".

**Fisiopatología — Canalopatía de membrana:**
La causa es una alteración de los canales iónicos de la membrana muscular (Na+ o Cl-) que impide la repolarización normal después de la contracción:
• **Canalopatías de Na+** (ganancia de función): el canal permanece abierto más tiempo → despolarizaciones repetidas. Ejemplo: paramiotonía congénita (SCN4A).
• **Canalopatías de Cl-** (pérdida de función): la conductancia de Cl- normalmente estabiliza el potencial de membrana. Sin ella, la membrana se vuelve hiperexcitable. Ejemplo: miotonía congénita (CLCN1).

**Características electrofisiológicas:**
| Parámetro | Valor |
|---|---|
| Morfología | Potenciales de fibra muscular individual (no PUM) |
| Amplitud | Variable: 10 µV - 1 mV (waxing and waning) |
| Frecuencia | Variable: 20-100 Hz (waxing and waning) |
| Patrón | Crescendo-decrescendo cíclico |
| Provocación | Movimiento de aguja, percusión, contracción voluntaria |
| Sonido | "Bombardero en picada" / "motocicleta acelerando y desacelerando" |

**Causas principales:**
| Enfermedad | Gen/Mecanismo | Miotonía clínica | Otros hallazgos EMG |
|---|---|---|---|
| Distrofia miotónica tipo 1 (DM1) | DMPK (CTG repeats) | Sí (manos, jaw) | PUM miopáticos, fibrilaciones |
| Distrofia miotónica tipo 2 (DM2) | CNBP (CCTG repeats) | Sí (proximal) | PUM miopáticos |
| Miotonía congénita (Thomsen/Becker) | CLCN1 (Cl- canal) | Sí (warm-up phenomenon) | PUM normales |
| Paramiotonía congénita | SCN4A (Na+ canal) | Sí (empeora con frío) | PUM normales |
| Hipotiroidismo severo | Metabólico | Posible | Pueden verse CRD |
| Fármacos (colchicina, estatinas) | Tóxico | Raro | Puede haber fibrilaciones |

**Correlato auditivo:** El "bombardero en picada" (dive bomber) — un sonido que sube de tono y volumen, luego baja, como un avión de la Segunda Guerra Mundial en picada. Es el sonido más dramático y memorable de la EMG. Variación: "motocicleta acelerando y frenando".

**Diferencia con MIOTONÍA CLÍNICA:**
Las descargas miotónicas en EMG (hallazgo eléctrico) no siempre se correlacionan con miotonía clínica (rigidez al soltar la mano). La DM2 puede tener miotonía EMG prominente con poca miotonía clínica.`,
              contentEn: `Myotonic discharges are bursts of potentials that oscillate in frequency and amplitude — the famous "waxing and waning" pattern (crescendo-decrescendo). They produce the most recognizable sound in all of EMG: the "dive bomber."

**Pathophysiology — Membrane channelopathy:**
The cause is an alteration of muscle membrane ion channels (Na+ or Cl-) that prevents normal repolarization after contraction:
• **Na+ channelopathies** (gain of function): the channel stays open longer → repeated depolarizations. Example: paramyotonia congenita (SCN4A).
• **Cl- channelopathies** (loss of function): Cl- conductance normally stabilizes membrane potential. Without it, the membrane becomes hyperexcitable. Example: myotonia congenita (CLCN1).

**Electrophysiological characteristics:**
| Parameter | Value |
|---|---|
| Morphology | Individual muscle fiber potentials (not MUPs) |
| Amplitude | Variable: 10 µV - 1 mV (waxing and waning) |
| Frequency | Variable: 20-100 Hz (waxing and waning) |
| Pattern | Cyclic crescendo-decrescendo |
| Provocation | Needle movement, percussion, voluntary contraction |
| Sound | "Dive bomber" / "motorcycle accelerating and decelerating" |

**Main causes:**
| Disease | Gene/Mechanism | Clinical myotonia | Other EMG findings |
|---|---|---|---|
| Myotonic dystrophy type 1 (DM1) | DMPK (CTG repeats) | Yes (hands, jaw) | Myopathic MUPs, fibrillations |
| Myotonic dystrophy type 2 (DM2) | CNBP (CCTG repeats) | Yes (proximal) | Myopathic MUPs |
| Myotonia congenita (Thomsen/Becker) | CLCN1 (Cl- channel) | Yes (warm-up phenomenon) | PUM normales |
| Paramyotonia congenita | SCN4A (Na+ channel) | Yes (worsens with cold) | Normal MUPs |
| Severe hypothyroidism | Metabolic | Possible | CRDs may be seen |
| Drugs (colchicine, statins) | Toxic | Rare | Fibrillations may be present |

**Audio correlate:** The "dive bomber" — a sound that rises in pitch and volume, then falls, like a WWII airplane diving. It is the most dramatic and memorable sound in EMG. Variation: "motorcycle accelerating and braking."

**Difference with CLINICAL MYOTONIA:**
Myotonic discharges on EMG (electrical finding) do not always correlate with clinical myotonia (inability to release grip). DM2 may have prominent EMG myotonia with little clinical myotonia.`,
              clinicalPearls: [
                'Si escuchas el sonido del "bombardero en picada", DETENTE y piensa: ¿tiene el paciente miotonía clínica? Si sí, evalúa DM1, DM2, miotonía congénita. Si no hay miotonía clínica, investiga hipotiroidismo y fármacos.',
                'Truco diagnóstico: en DM1 las descargas miotónicas son más prominentes en músculos DISTALES (manos, antebrazo). En DM2 son más prominentes en músculos PROXIMALES (cuádriceps, bíceps). Esta distribución es diagnóstica.',
              ],
              clinicalPearlsEn: [
                'If you hear the "dive bomber" sound, STOP and think: does the patient have clinical myotonia? If yes, evaluate DM1, DM2, myotonia congenita. If no clinical myotonia, investigate hypothyroidism and medications.',
                'Diagnostic trick: in DM1, myotonic discharges are more prominent in DISTAL muscles (hands, forearm). In DM2, they are more prominent in PROXIMAL muscles (quadriceps, biceps). This distribution is diagnostic.',
              ],
              keyPoints: [
                'Descargas miotónicas: waxing and waning en frecuencia Y amplitud.',
                'Sonido: "bombardero en picada" — el más reconocible de la EMG.',
                'Causa: canalopatía de Na+ (ganancia de función) o Cl- (pérdida de función).',
                'Diagnóstico diferencial: DM1 (distal), DM2 (proximal), miotonía congénita, paramiotonía.',
              ],
              keyPointsEn: [
                'Myotonic discharges: waxing and waning in frequency AND amplitude.',
                'Sound: "dive bomber" — the most recognizable in EMG.',
                'Cause: Na+ channelopathy (gain of function) or Cl- (loss of function).',
                'Differential diagnosis: DM1 (distal), DM2 (proximal), myotonia congenita, paramyotonia.',
              ],
              videoUrls: [{ title: 'Descargas miotónicas', driveId: '1oZ1eWZMq46MWtY1TTLM4ctYwPYqys0IA' }, { title: 'Descargas miotónicas 2', driveId: '1JU0SGnXzBKbjCJNsA6UnS0Lr3HUaeRUv' }],
            },
            { id: 'myokymia', title: 'Mioquimias',
              titleEn: 'Myokymia',
              content: `Las mioquimias son descargas agrupadas (bursts) de PUM que se repiten de forma semirrítmica. Clínicamente se observan como movimientos ondulantes serpenteantes bajo la piel, como "gusanos arrastrándose" bajo la superficie.

**Fisiopatología:**
La hiperexcitabilidad de las fibras nerviosas motoras genera descargas espontáneas agrupadas. Los grupos de potenciales (dobletes, tripletes) se repiten a intervalos regulares de 0.1-10 segundos.

**Características electrofisiológicas:**
| Parámetro | Valor |
|---|---|
| Composición | Grupos de 2-10 PUM (dobletes, tripletes) |
| Frecuencia intra-burst | 30-60 Hz dentro del grupo |
| Frecuencia inter-burst | 0.1-10 Hz (semirrítmico entre grupos) |
| Patrón | Burst → pausa → burst → pausa (ritmo de marcha) |
| Sonido | "Soldados marchando" o "ritmo de tambor" |

**Causas y diagnóstico diferencial:**
| Etiología | Localización | Contexto clínico |
|---|---|---|
| Radiculopatía post-radiación | Plexo braquial/lumbar | Antecedente de radioterapia (meses-años antes) |
| Esclerosis múltiple | Músculo facial | Mioquimia facial unilateral + lesiones desmielinizantes |
| Guillain-Barré | Generalizada | Fase aguda o de recuperación |
| Organofosforados | Generalizada | Intoxicación aguda |
| Neuropatía compresiva crónica | Distribución del nervio | Compresión prolongada |

**Mioquimia facial:**
La mioquimia facial unilateral persistente es un hallazgo clásico de esclerosis múltiple (lesión pontina del núcleo del facial). Es uno de los pocos signos clínicos PATOGNOMÓNICOS cuando es unilateral y persistente.

**Correlato auditivo:** "Soldados marchando" — grupos rítmicos de potenciales separados por pausas regulares, como una compañía de soldados marchando al unísono.`,
              contentEn: `Myokymia consists of grouped (burst) MUP discharges that repeat in a semi-rhythmic pattern. Clinically, they appear as undulating serpentine movements under the skin, like "worms crawling" beneath the surface.

**Pathophysiology:**
Motor nerve fiber hyperexcitability generates spontaneous grouped discharges. Groups of potentials (doublets, triplets) repeat at regular intervals of 0.1-10 seconds.

**Electrophysiological characteristics:**
| Parameter | Value |
|---|---|
| Composition | Groups of 2-10 MUPs (doublets, triplets) |
| Intra-burst frequency | 30-60 Hz within the group |
| Inter-burst frequency | 0.1-10 Hz (semi-rhythmic between groups) |
| Pattern | Burst → pause → burst → pause (marching rhythm) |
| Sound | "Marching soldiers" or "drum rhythm" |

**Causes and differential diagnosis:**
| Etiology | Location | Clinical context |
|---|---|---|
| Post-radiation radiculopathy | Brachial/lumbar plexus | History of radiotherapy (months-years before) |
| Multiple sclerosis | Facial muscle | Unilateral facial myokymia + demyelinating lesions |
| Guillain-Barré | Generalized | Acute or recovery phase |
| Organophosphates | Generalized | Acute intoxication |
| Chronic compressive neuropathy | Nerve distribution | Prolonged compression |

**Facial myokymia:**
Persistent unilateral facial myokymia is a classic finding of multiple sclerosis (pontine lesion of the facial nucleus). It is one of the few PATHOGNOMONIC clinical signs when unilateral and persistent.

**Audio correlate:** "Marching soldiers" — rhythmic groups of potentials separated by regular pauses, like a company of soldiers marching in unison.`,
              clinicalPearls: [
                'Si un paciente con antecedente de radioterapia para cáncer de mama presenta dolor, debilidad y rigidez del brazo ipsilateral + mioquimias en EMG → plexopatía braquial por radiación. Las mioquimias son el sello EMG de esta condición y la diferencian de la recurrencia tumoral (que NO produce mioquimias).',
                'Mioquimia facial persistente unilateral en un joven = BUSCAR esclerosis múltiple hasta demostrar lo contrario. Solicita RMN cerebral con contraste.',
              ],
              clinicalPearlsEn: [
                'If a patient with history of radiotherapy for breast cancer presents with ipsilateral arm pain, weakness, and stiffness + myokymia on EMG → radiation brachial plexopathy. Myokymias are the EMG hallmark of this condition and differentiate it from tumor recurrence (which does NOT produce myokymia).',
                'Persistent unilateral facial myokymia in a young person = LOOK FOR multiple sclerosis until proven otherwise. Order brain MRI with contrast.',
              ],
              keyPoints: [
                'Mioquimias: descargas AGRUPADAS de PUM con patrón burst-pausa-burst semirrítmico.',
                'Sonido: "soldados marchando" (rítmico, agrupado).',
                'Causa clásica: radioterapia previa (plexopatía por radiación).',
                'Mioquimia facial unilateral persistente es casi patognomónica de EM.',
              ],
              keyPointsEn: [
                'Myokymia: GROUPED MUP discharges with semi-rhythmic burst-pause-burst pattern.',
                'Sound: "marching soldiers" (rhythmic, grouped).',
                'Classic cause: prior radiotherapy (radiation plexopathy).',
                'Persistent unilateral facial myokymia is nearly pathognomonic of MS.',
              ],
              videoUrls: [{ title: 'Descargas mioquímicas', driveId: '1AErD_0PSEDmtjHYDZBrAiQgIwxw_UFN8' }, { title: 'Descargas mioquímicas y multipletes', driveId: '1YDkEp9-EK4kytvQY9IP0N0Uus1pa2Hnh' }],
            },
            { id: 'neuromyotonia', title: 'Descargas neuromiotónicas',
              titleEn: 'Neuromyotonic Discharges',
              content: `Las descargas neuromiotónicas son ráfagas de altísima frecuencia que DECREMENTAN progresivamente. Son el correlato EMG de la neuromiotonía clínica (rigidez muscular continua, calambres, miotonía de acción).

**Fisiopatología — Autoinmunidad contra canales de K+:**
La causa más frecuente es la presencia de anticuerpos contra proteínas del complejo VGKC (canales de potasio voltaje-dependientes) en la membrana del nervio periférico. Al bloquear los canales de K+, la repolarización del nervio es lenta e incompleta, generando descargas repetidas a muy alta frecuencia.
• Anticuerpos anti-CASPR2: asociados a neuromiotonía (síndrome de Isaac).
• Anticuerpos anti-LGI1: asociados a encefalitis límbica ± neuromiotonía (síndrome de Morvan).

**Características electrofisiológicas:**
| Parámetro | Valor |
|---|---|
| Frecuencia | 150-300 Hz (MUY alta) |
| Patrón | DECREMENTANTE (empieza alto, baja de frecuencia) |
| Duración del burst | 0.5-2 segundos |
| Amplitud | Decrece progresivamente dentro del burst |
| Sonido | "Motor eléctrico desacelerando" o "ping" agudo |

**Síndrome de Isaac (Neuromiotonía adquirida):**
• Rigidez muscular continua (no desaparece con el sueño).
• Calambres y fasciculaciones difusas.
• Sudoración excesiva (disautonomía).
• Anticuerpos anti-CASPR2 positivos.
• EMG: descargas neuromiotónicas prominentes.

**Correlato auditivo:** Un sonido agudo que decrece rápidamente, como un motor eléctrico apagándose o un "ping" que se desvanece. Se distingue de las miotónicas por la frecuencia MUCHO mayor y el patrón decrementante (vs. waxing-waning).`,
              contentEn: `Neuromyotonic discharges are very high-frequency bursts that DECREMENT progressively. They are the EMG correlate of clinical neuromyotonia (continuous muscle stiffness, cramps, action myotonia).

**Pathophysiology — Autoimmunity against K+ channels:**
The most frequent cause is the presence of antibodies against proteins of the VGKC complex (voltage-gated potassium channels) on the peripheral nerve membrane. By blocking K+ channels, nerve repolarization is slow and incomplete, generating repeated discharges at very high frequency.
• Anti-CASPR2 antibodies: associated with neuromyotonia (Isaac syndrome).
• Anti-LGI1 antibodies: associated with limbic encephalitis ± neuromyotonia (Morvan syndrome).

**Electrophysiological characteristics:**
| Parameter | Value |
|---|---|
| Frequency | 150-300 Hz (VERY high) |
| Pattern | DECREMENTING (starts high, decreases in frequency) |
| Burst duration | 0.5-2 seconds |
| Amplitude | Progressively decreases within the burst |
| Sound | "Electric motor decelerating" or sharp "ping" |

**Isaac Syndrome (Acquired Neuromyotonia):**
• Continuous muscle stiffness (does not disappear with sleep).
• Diffuse cramps and fasciculations.
• Excessive sweating (dysautonomia).
• Positive anti-CASPR2 antibodies.
• EMG: prominent neuromyotonic discharges.

**Audio correlate:** A sharp sound that rapidly decreases, like an electric motor turning off or a "ping" that fades. Distinguished from myotonics by the MUCH higher frequency and decrementing pattern (vs. waxing-waning).`,
              clinicalPearls: [
                'Si un paciente joven presenta rigidez muscular continua + calambres + sudoración excesiva + descargas de alta frecuencia decrementantes en EMG → solicita anticuerpos anti-CASPR2 y anti-LGI1. El síndrome de Isaac es tratable con inmunoterapia.',
                'Diferencia clave con miotonía: la neuromiotonía persiste durante el sueño (origen periférico, no depende de activación central), mientras que la miotonía desaparece.',
              ],
              clinicalPearlsEn: [
                'If a young patient presents with continuous muscle stiffness + cramps + excessive sweating + high-frequency decrementing discharges on EMG → request anti-CASPR2 and anti-LGI1 antibodies. Isaac syndrome is treatable with immunotherapy.',
                'Key difference with myotonia: neuromyotonia persists during sleep (peripheral origin, not dependent on central activation), while myotonia disappears.',
              ],
              keyPoints: [
                'Neuromiotonía: bursts de altísima frecuencia (150-300 Hz) DECREMENTANTES.',
                'Causa: anticuerpos anti-CASPR2 (Isaac) o anti-LGI1 (Morvan).',
                'Síndrome de Isaac: rigidez continua + calambres + sudoración + anti-CASPR2.',
                'Tratable con inmunoterapia: diagnóstico temprano es clave.',
              ],
              keyPointsEn: [
                'Neuromyotonia: very high-frequency bursts (150-300 Hz) DECREMENTING.',
                'Cause: anti-CASPR2 antibodies (Isaac) or anti-LGI1 (Morvan).',
                'Isaac syndrome: continuous stiffness + cramps + sweating + anti-CASPR2.',
                'Treatable with immunotherapy: early diagnosis is key.',
              ],
            },
            { id: 'doublets-multiplets', title: 'Dobletes, tripletes, multipletes',
              titleEn: 'Doublets, Triplets, Multiplets',
              content: `Los dobletes, tripletes y multipletes son descargas repetidas de la MISMA unidad motora a intervalos inter-descarga muy cortos (5-15 ms). A diferencia de otras formas de actividad espontánea, pueden ser un hallazgo normal ocasional.

**Fisiopatología:**
• El axón motor genera un potencial de acción principal.
• Inmediatamente después (~5-15 ms), un potencial "eco" se genera por re-excitación del segmento proximal del axón (transmisión antidrómica que rebota).
• Si el rebote ocurre una vez → doblete. Dos veces → triplete. Múltiples → multiplete.

**Clasificación:**
| Tipo | Definición | Intervalo inter-descarga |
|---|---|---|
| Doblete | 2 descargas consecutivas de misma UM | 5-15 ms |
| Triplete | 3 descargas consecutivas de misma UM | 5-15 ms |
| Multiplete | ≥4 descargas consecutivas de misma UM | 5-15 ms |

**Significado clínico:**
• **Hallazgo normal aislado:** Dobletes ocasionales durante contracción voluntaria pueden ocurrir en personas sanas, especialmente con fatiga.
• **Hallazgo patológico cuando:**
  - Son frecuentes y consistentes.
  - Aparecen en múltiples músculos.
  - Se asocian con hiperexcitabilidad nerviosa (tétanos, hipocalcemia, hipomagnesemia).
  - Acompañan a fasciculaciones patológicas (contexto ELA).

**Causas de dobletes/multipletes patológicos:**
• Tétanos (el clásico — hiperexcitabilidad generalizada).
• Síndrome de hiperexcitabilidad nerviosa periférica.
• Hipocalcemia / hipomagnesemia severas.
• Después de administración de neostigmina o anticolinesterásicos.
• En contexto de ELA (junto con fasciculaciones y fibrilaciones).

**Correlato auditivo:** Se escucha un "ta-ta" rápido (doblete) o "ta-ta-ta" (triplete) como una ráfaga muy breve de disparos de la misma unidad motora. El intervalo entre los componentes (5-15 ms) es demasiado corto para ser contracción voluntaria normal.`,
              contentEn: `Doublets, triplets, and multiplets are repeated discharges from the SAME motor unit at very short inter-discharge intervals (5-15 ms). Unlike other forms of spontaneous activity, they can be an occasional normal finding.

**Pathophysiology:**
• The motor axon generates a primary action potential.
• Immediately after (~5-15 ms), an "echo" potential is generated by re-excitation of the proximal axon segment (antidromic transmission that rebounds).
• If the rebound occurs once → doublet. Twice → triplet. Multiple times → multiplet.

**Classification:**
| Type | Definition | Inter-discharge interval |
|---|---|---|
| Doublet | 2 consecutive discharges from same MU | 5-15 ms |
| Triplet | 3 consecutive discharges from same MU | 5-15 ms |
| Multiplet | ≥4 consecutive discharges from same MU | 5-15 ms |

**Clinical significance:**
• **Isolated normal finding:** Occasional doublets during voluntary contraction can occur in healthy people, especially with fatigue.
• **Pathological finding when:**
  - Frequent and consistent.
  - Appear in multiple muscles.
  - Associated with nerve hyperexcitability (tetanus, hypocalcemia, hypomagnesemia).
  - Accompany pathological fasciculations (ALS context).

**Causes of pathological doublets/multiplets:**
• Tetanus (the classic — generalized hyperexcitability).
• Peripheral nerve hyperexcitability syndrome.
• Severe hypocalcemia / hypomagnesemia.
• After administration of neostigmine or anticholinesterases.
• In ALS context (alongside fasciculations and fibrillations).

**Audio correlate:** You hear a rapid "ta-ta" (doublet) or "ta-ta-ta" (triplet) like a very brief burst of shots from the same motor unit. The interval between components (5-15 ms) is too short to be normal voluntary contraction.`,
              clinicalPearls: [
                'Dobletes aislados durante la contracción voluntaria son NORMALES y no deben preocupar. Solo son significativos cuando son frecuentes, difusos y se acompañan de otros signos de hiperexcitabilidad nerviosa.',
                'En el contexto de tétanos: los multipletes son prominentes y generalizados. Si un paciente no vacunado presenta rigidez + multipletes generalizados en EMG → considerar tétanos como emergencia.',
              ],
              clinicalPearlsEn: [
                'Isolated doublets during voluntary contraction are NORMAL and should not cause concern. They are only significant when frequent, diffuse, and accompanied by other signs of nerve hyperexcitability.',
                'In tetanus context: multiplets are prominent and generalized. If an unvaccinated patient presents with stiffness + generalized multiplets on EMG → consider tetanus as an emergency.',
              ],
              keyPoints: [
                'Dobletes/multipletes: misma UM dispara 2+ veces consecutivas con intervalo 5-15 ms.',
                'Hallazgo normal OCASIONAL durante contracción voluntaria con fatiga.',
                'Patológico cuando: frecuente, difuso, asociado a hiperexcitabilidad nerviosa.',
                'Causas patológicas: tétanos, hipocalcemia, hipomagnesemia, síndrome de Isaac.',
              ],
              keyPointsEn: [
                'Doublets/multiplets: same MU fires 2+ times consecutively with 5-15 ms interval.',
                'OCCASIONAL normal finding during voluntary contraction with fatigue.',
                'Pathological when: frequent, diffuse, associated with nerve hyperexcitability.',
                'Pathological causes: tetanus, hypocalcemia, hypomagnesemia, Isaac syndrome.',
              ],
              videoUrls: [{ title: 'Dobletes', driveId: '1rWovq9O5tvA_FEwsZk0GQ2b84R_xDtA_' }, { title: 'Dobletes y múltipletes', driveId: '1p-zDNVIoQ5j32WPWr3G2oaSyNTOKxdKX' }],
            },
          ]
        },
        { id: 'voluntary-minimal', title: 'Contracción voluntaria mínima',
          children: [
            { id: 'mup-analysis', title: 'Análisis del PUM individual',
              content: `El análisis de la morfología individual del potencial de acción de unidad motora (PUM) es el núcleo de la EMG de aguja. Permite clasificar el proceso primário como neurogénico o miopático.

**Técnica:**
Pedir al paciente una contracción mínima controlada ("apriete suavemente") para activar solo 1-3 PUM. Ajustar la ganancia a 200-500 µV/div y el barrido a 5-10 ms/div. Aislar un PUM que dispare regularmente con tiempo de ascenso <500 µs y analizar su morfología.

**Parámetros de análisis de cada PUM:**
| Parámetro | Cómo se mide | Qué refleja |
|---|---|---|
| Duración | Inicio al final del potencial | Número total de fibras de la UM y su distribución temporal |
| Amplitud | Pico a pico | Fibras musculares MÁS CERCANAS al electrodo |
| Fases | Cruces de la línea base + 1 | Sincronía de activación de las fibras |
| Giros | Cambios de dirección sin cruzar la línea base | Dispersion de vel. de conducción |
| Estabilidad | Variación entre disparos sucesivos | Estabilidad de la transmisión neuromuscular |

**Patrón identificador de la causa:**
• **PUM normales:** duración 5-15 ms, amplitud 100 µV - 2 mV, bifas/trifásicos, <4 fases, estables.
• **Patrón neurogénico (crónico):** duración aumentada, amplitud alta (UM gigantes), polifasia. Causado por reinervación colateral.
• **Patrón miopático:** duración corta, baja amplitud, polifasia. Causado por pérdida de fibras musculares individuales.`,
              clinicalPearls: [
                'La DURACIÓN es el parámetro más confiable para clasificar el proceso (neurogénico vs. miopático). La amplitud es muy variable según la distancia al electrodo.',
                'PUM nacientes (pequeños, polifasícos, inestables) en denervación aguda son indistinguibles de PUM miopáticos por morfología sola. La clave: el reclutamiento es MUY reducido en los nacientes, normal o precoz en miopáticos.',
              ],
              keyPoints: [
                'Duración normal: 5-15 ms (varía por músculo y edad).',
                'Amplitud normal: 100 µV - 2 mV (depende de distancia al electrodo).',
                'Normal: 2-4 fases (bifasético a tetrafásico).',
                'Tiempo de ascenso <500 µs = señal de calidad para análisis.',
              ],
              videoUrls: [{ title: 'Potencial de acción de unidad motora', driveId: '1QWxlCUVjEhG3vvqMhAy-W8CiyEd_kiSB' }, { title: 'PAUM en Lambert-Eaton', driveId: '1_CSLekaV929-SkXtzvYGI6NnOS3_BSaa' }],
            },
            { id: 'mup-amplitude-duration', title: 'Amplitud, duración, fases, giros',
              content: `Estos cuatro parámetros definen la morfología del PUM y son la base del diagnóstico diferencial neurogénico vs. miopático.

**Amplitud:**
• Se mide de pico negativo a pico positivo (o base al pico negativo).
• Refleja las fibras más cercanas al electrodo (SOLO las fibras dentro de ~500 µm).
• Normal: 100 µV - 2 mV. Muy dependiente de la distancia al electrodo.
• Alta: reinervación crónica (UM gigantes). Baja: miopatía (fibras pérdidas).

**Duración:**
• Desde el inicio hasta el final del potencial completo.
• Refleja el número TOTAL de fibras de la UM y su dispersión temporal.
• Normal: 5-15 ms (varía por músculo y edad).
• Aumentada: reinervación (más fibras, mayor dispersión). Reducida: miopatía.

**Fases:**
• Dígito del número de veces que el potencial cruza la línea base + 1.
• Normal: 2-4 fases (bifasético, trifásico, tetrafásico). >4 = polifasético.
• Hasta 5-15% de PUM polifaséticos es normal en todo músculo.

**Giros:**
• Cambios de dirección del potencial que NO cruzan la línea base.
• Indican asincronía entre fibras de la UM.`,
              clinicalPearls: [
                'La duración es el parámetro más útil para determinar si el proceso es neurogénico (larga) o miopático (corta). La amplitud sola es menos confiable.',
              ],
              keyPoints: [
                'Amplitud: refleja fibras más próximas (<500 µm). Normal 100µV-2mV.',
                'Duración: refleja fibras totales y dispersión temporal. Normal 5-15 ms.',
                'Fases >4 = polifasético (normal hasta 5-15% del músculo).',
                'Giros = cambios de dirección sin cruzar la línea base.',
              ],
            },
            { id: 'polyphasic', title: 'Potenciales polifaséticos',
              content: `Un PUM es polifasético cuando tiene más de 4 fases. La polifasia indica desincronización en la generación o propagación de los potenciales de las fibras musculares dentro de la UM.

**Causas de aumento de polifasia:**
• **Reinervación colateral:** las nuevas fibras nerviosas (axones colaterales inmaduros) conducen lentamente, haciendo llegar el estímulo en tiempos diferentes a cada fibra muscular. PUM con muchas fases y de larga duración.
• **Miopatía:** pérdida de fibras dentro de la UM que crea asincronía. PUM polifaséticos con duración CORTA.
• **Normal:** hasta 5-15% de los PUM de cualquier músculo son polifaséticos.

**Diferencia clave:**
| Característica | Neurogénico (reinervación) | Miopático |
|---|---|---|
| Polifasia | Sí | Sí |
| Duración del PUM | Larga | Corta |
| Amplitud | Alta | Baja |
| Reclutamiento | Reducido | Precoz |

Conclusión: la polifasia POR SÍ SOLA no diferencia neurogénico de miopático. Se necesita la duración y el patrón de reclutamiento.`,
              clinicalPearls: [
                'Polifasia no es específica: puede verse en denervación/reinervación, miopatías, e incluso como variante normal. SIEMPRE correlaciona con duración y patrón de reclutamiento antes de concluir.',
              ],
              keyPoints: [
                'Polifasético: >4 fases.',
                'Normal: hasta 5-15% del músculo puede ser polifasético.',
                'Neurogénico: polifasético + duración LARGA + amplitud alta.',
                'Miopático: polifasético + duración CORTA + amplitud baja.',
              ],
            },
            { id: 'satellite-nascent', title: 'Potenciales satélites y nacientes',
              content: `Estos dos tipos de PUM atípicos proporcionan información sobre el ESTADO de la reinervación.

**Potenciales satélite:**
• Componente tardío, separado del PUM principal por más de 5 ms, que dispara consistentemente vinculado al PUM principal.
• Causados por fibras reinervedas por axones colaterales inmaduros, que conducen lentamente (por eso llegan tarde).
• Significado: reinervación en progreso (estado intermedio). Con el tiempo, al madurar el axon, el satélite se integra al PUM principal.
• También llamados "linked potentials" o potenciales vinculados.

**Potenciales nacientes (nascent MUPs):**
• PUM muy pequeños, cortos, polifaséticos, e inestables. Se ven en denervación grave donde no hay axones vecinos para reinervación colateral.
• El axon debe regresar desde el muñón proximal (reinervación axonal), conectando inicialmente con muy pocas fibras.
• Morfología: similar a la miopática (pequeños y cortos). DIFERENCIA CLAVE: el reclutamiento es muy REDUCIDO (neurogénico), no precoz (miopático).`,
              clinicalPearls: [
                'Los potenciales nacientes son la "luz al final del túnal": indican que el nervio está volviendo a conectar con el músculo. Son una señal pronóstica POSITIVA de recuperación.',
                'Diferencia satélite vs. naciente: satélite = disparo tardío ligado al PUM principal. Naciente = PUM independiente, muy pequeño e inestable.',
              ],
              keyPoints: [
                'Satélite: componente tardío vinculado al PUM → reinervación en progreso.',
                'Naciente: PUM muy pequeño, polifasético, inestable → reinervación axonal precoz.',
                'CLAVE: naciente = morfología miopática + reclutamiento neurogénico (reducido).',
                'Ambos = señales pronósticas positivas de recuperación nerviosa.',
              ],
              videoUrls: [{ title: 'Potenciales satélite', driveId: '1wJI_1rsXjSa2H2NJBjBpDbs0rxQOL2m5' }, { title: 'PAUM en fibras sin reinervación', driveId: '1vB2OX_mZkHFJXz9KSIx5XWfXF2UyLNOs' }],
            },
            { id: 'mup-stability', title: 'Estabilidad del PUM',
              content: `La estabilidad del PUM se refiere a la consistencia de su morfología entre disparos sucesivos. Un PUM que varía en forma, amplitud o número de fases entre disparos es considerado inestable.

**Causas de inestabilidad:**
1. **Trastornos primarios de la UNM:** en miastenia gravis, Lambert-Eaton o botulismo, la transmisión neuromuscular es deficiente. En algunos disparos, la placa terminal no genera un potencial suficiente para despolarizar la fibra muscular, causando que el componente correspondiente desaparezca del PUM.
2. **Reinervación incompleta:** los axones colaterales inmaduros tienen UNM nuevas, pequeñas, con poca reserva de transmisión. En algunos ciclos, la transmisión falla.

**Cómo evaluarla:**
Se evalúa visualmente observando la variación entre trazados superpuestos. Con SFEMG, se cuantifica como jitter (variabilidad del intervalo interpotencial) y bloqueo (fallo completo de la fibra).

**Relevancia clínica:** La inestabilidad del PUM es la manifestación clásica de los trastornos de la unión neuromuscular. En SFEMG, jitter >55 µs (músculo EDC) = anormal.`,
              clinicalPearls: [
                'La inestabilidad del PUM en EMG convencional debe hacerte pensar automáticamente en miastenia gravis o sospecha de trastorno de UNM. Es la señal clínica más evocadora de patología de la UNM en el estudio convencional.',
              ],
              keyPoints: [
                'PUM inestable: varía en morfología/amplitud entre disparos sucesivos.',
                'Causas: trastorno de UNM (MG, LE, botulismo) o reinervación incompleta.',
                'SFEMG: cuantifica la inestabilidad como jitter.',
                'Jitter alto con bloqueo = diagnóstico de disfunción de UNM.',
              ],
            },
          ]
        },
        { id: 'voluntary-maximal', title: 'Contracción voluntaria máxima',
          children: [
            { id: 'recruitment-pattern', title: 'Patrón de reclutamiento',
              content: `El patrón de reclutamiento describe cómo aumenta la fuerza muscular al activar más unidades motoras (reclutamiento) y al aumentar su frecuencia de disparo (suma temporal).

**Reclutamiento normal:**
• Principio de Henneman: las UM se activan en orden de tamaño (primero las pequeñas, resistentes a la fatiga).
• Ratio de reclutamiento: cuando la primera UM dispara a ~10 Hz, debe aparecer una segunda. Si la primera dispara a >15 Hz sin una segunda = reclutamiento reducido.

**Patrón miopático (reclutamiento precoz):** cada UM produce menos fuerza (menos fibras). El músculo recluta más UM de lo habitual para generar una fuerza pequeña. El patrón aparece "lleno" con esfuerzo mínimo, pero la fuerza generada es escasa.

**Patrón neurogénico (reclutamiento reducido):** hay menos UM disponibles (axones perdidos). Las sobrevivientes disparan más rápido (>20 Hz). El patrón es "incompleto" incluso con esfuerzo máximo.`,
              clinicalPearls: [
                'El dato más confiable de reclutamiento reducido: una sola UM disparando a >20 Hz en un músculo que no puede generar más fuerza. Es el equivalente eléctrico de la paresia.',
                'No evaluar reclutamiento con contracción dolorosa: el paciente inhibe voluntariamente y simula un falso patrón reducido. Pide esfuerzo submáximo controlado.',
              ],
              keyPoints: [
                'Ratio normal de reclutamiento: ~5:1 (Hz de la primera UM / número de UM activas).',
                'Reducido (neurogénico): pocas UM, frecuencia de disparo alta (>15-20 Hz).',
                'Precoz (miopático): muchas UM, frecuencia normal, esfuerzo mínimo.',
                'Principio de Henneman: UM pequeñas se reclutan primero.',
              ],
              videoUrls: [{ title: 'Reclutamiento de unidad motora', driveId: '19zRgbM4Qwnr_Dtyb5C-NyPcP2_idl3F2' }],
            },
            { id: 'full-interference', title: 'Patrón de interferencia completo',
              content: `El patrón de interferencia (PI) describe la apariencia global del trazado EMG durante la contracción voluntaria máxima.

**Clasificación por grado:**
| Grado | Descripción | Significado |
|---|---|---|
| Completo | Línea base invisible, relleno total | Normal |
| Denso | Línea base visible ocasionalmente | Leve reducción |
| Intermedio | 2-3 UM identificables | Moderado (neurogénico) |
| Discreto | 1-2 UM aisladas | Grave (neurogénico) |
| Simple | Una sola UM disparando | Severa pérdida axonal |

**PI en miopatía:** completo a esfuerzo mínimo (patrón precoz). Amplitud baja porque los PUM son pequeños.

**PI en neuropatía:** reducido a incompleto. Amplitud alta (UM gigantes).

**Evaluación cuantitativa:** Análisis de giros/amplitud: miopático = muchos giros + baja amplitud. Neurogénico = pocos giros + alta amplitud.`,
              keyPoints: [
                'PI completo: línea base invisible = reclutamiento normal.',
                'PI reducido: UM individuales visibles durante esfuerzo máximo.',
                'PI simple: una sola UM a alta frecuencia = pérdida axonal grave.',
                'Ganancia para PI: usar 1-2 mV/div (no 200 µV/div).',
              ],
            },
            { id: 'early-recruitment', title: 'Reclutamiento precoz (miopático)',
              content: `Muchas unidades motoras reclutadas tempranamente, cada una generando poca fuerza.

**Características:**
• El patrón está "lleno" (interferencia completa) con esfuerzo mínimo.
• Los PUM son pequeños y cortos.
• Dado que cada UM tiene menos fibras funcionales (por la miopatía), el sistema nervioso debe reclutar muchas más UM de lo normal para mover la extremidad.`,
            },
            { id: 'reduced-recruitment', title: 'Reclutamiento disminuido (neurogénico)',
              content: `Pocas unidades motoras disponibles, cada una disparando rápidamente (>20 Hz).

**Características:**
• Patrón de interferencia incompleto o reducido incluso con esfuerzo máximo.
• Las UM sobrevivientes pueden ser de gran amplitud (gigantes) por la reinervación colateral persistente.
• Se escucha como disparos rápidos e individuales ("clack-clack-clack") en lugar del rugido del patrón normal.`,
              videoUrls: [{ title: 'Reclutamiento en px con denervación', driveId: '1wT1Gu1XKJBh3NChmlAFl9CEaIk-tMlGE' }],
            },
            { id: 'turns-amplitude', title: 'Análisis cuantitativo turns/amplitud',
              content: `Método objetivo de evaluación del patrón de interferencia (Willison analysis). Relaciona la frecuencia de cambios de dirección (giros) vs. la amplitud media de la señal.

**Patrones típicos:**
• **Normal:** Equilibrio entre número de giros y amplitud según la fuerza.
• **Pattern Miopático:** MUCHOS GIROS (por la fragmentación de la UM) con BAJA AMPLITUD.
• **Pattern Neurogénico:** POCOS GIROS (menos UM) con ALTA AMPLITUD (UM gigantes).`,
            },
          ]
        },
      ]
    },
    {
      id: 'quantitative-emg', title: 'EMG Cuantitativa',
      children: [
        { id: 'automatic-mup', title: 'Análisis automático de PUM',
          content: `El análisis automático de PUM utiliza software del equipo para detectar, aislar y medir automáticamente los PUM durante la contracción voluntaria, eliminando la variabilidad interobservador del análisis manual.

**Principio:** El sistema detecta cada PUM individual, lo separa del ruido y calcula sus parámetros morfológicos (amplitud, duración, fases) automáticamente.

**Ventajas:**
• Elimina la variabilidad interobservador del análisis manual.
• Permite medir >20 PUM en pocos minutos.
• Genera tablas para comparar con bases de datos normativas por músculo, edad y sexo.

**Limitaciones:**
• Requiere contracción estable (difícil en debilidad grave o mal tolerada).
• El software puede confundir PUM superpuestos.`,
          keyPoints: [
            'Detecta y mide PUM automáticamente → elimina variabilidad interobservador.',
            'Permite análisis de >20 PUM rápidamente.',
            'Compara con bases de datos normativas (por músculo, edad, sexo).',
            'Limitación: requiere contracción estable del paciente.',
          ],
        },
        { id: 'multi-mup', title: 'Multi-MUP analysis (MMA)',
          content: `El Multi-MUP Analysis (MMA) descompone el trazado EMG en PUM individuales durante contracción submaximal, permitiendo recolectar más PUM en menos tiempo que el análisis manual estándar.

**Principio:** Con varios PUM activos simultáneamente, el sistema identifica cada uno por su firma temporal y espacial, agrupa disparos del mismo PUM y calcula una plantilla (template) para cada unidad.

**Ventajas vs. análisis manual:**
• Se recolectan más PUM en menor tiempo.
• No requiere contracción ultra-mínima (más cómodo).
• Puede medir PUM difícilmente aislables de forma manual.

**Aplicación:** Seguimiento cuantitativo en procesos de reinervación (ELA, Guillain-Barré en recuperación) donde la evolución de los PUM es clínicamente relevante.`,
          keyPoints: [
            'Descompone el trazado EMG en PUM individuales durante contracción submaximal.',
            'Más PUM en menos tiempo vs. análisis manual.',
            'Útil para seguimiento cuantitativo de procesos neurogénicos.',
          ],
        },
        { id: 'signal-decomposition', title: 'Descomposición de señales',
          content: `La descomposición de señales EMG es la técnica matemática que separa el trazado EMG complejo en las contribuciones individuales de cada unidad motora. Es la base del EMG cuantitativo moderno.

**Principio:** La señal EMG registrada es la suma de todos los PUM activos simultáneamente con sus formas superpuestas. El algoritmo identifica patrones repetitivos y los asigna a UM específicas.

**Aplicaciones:**
• Permite estudiar la dinámica de disparo de cada UM individualmente.
• Calcula frecuencias de disparo, coeficientes de variación y sincronización entre UM.
• HD-EMG (64-256 canales) permite descomponer trazados con decenas de UM simultáneas.
• Base para sistemas de control de prótesis mioeléctricas de alta precisión.`,
          keyPoints: [
            'Separa el trazado EMG en contribuciones individuales de cada UM.',
            'Permite estudiar dinámica de disparo de cada UM por separado.',
            'HD-EMG: 64-256 canales → descomposición de decenas de UM simultáneas.',
            'Aplicación: control de prótesis mioeléctricas avanzadas.',
          ],
        },
      ]
    },
    {
      id: 'sfemg', title: 'EMG de Fibra Única (SFEMG)',
      children: [
        { id: 'sfemg-principles', title: 'Principios y electrodos',
          content: `La SFEMG es la modalidad EMG más selectiva. El electrodo de fibra única (superficie 25 µm) capta solo 1-3 fibras musculares de la misma UM, en un radio de ~300 µm.

**Configuración del equipo:**
• Filtros: pasa-altos 500 Hz (rechaza potenciales de fibras lejanas).
• Ganancia: 200 µV/div.
• Barrido: 1 ms/div (máxima resolución temporal).
• Trigger: para sincronizar la adquisición.

**Alternativa:** Concentric-SFEMG — aguja concéntrica estándar con filtros de 500 Hz. Menos costosa y más accesible. Valores normales ligeramente distintos a la aguja oficial de fibra única.`,
          clinicalPearls: [
            'Si el laboratorio no tiene el electrodo oficial de fibra única, la concéntrica con filtros 500 Hz es una alternativa válida. Usa las tablas normativas correspondientes a ese electrodo.',
          ],
          keyPoints: [
            'Electrodo: superficie 25 µm → radio de captación ~300 µm.',
            'Filtros: pasa-altos 500 Hz (vs. 10-20 Hz EMG convencional).',
            'Barrido: 1 ms/div → máxima resolución temporal.',
            'Alternativa: concéntrica con filtros 500 Hz (Concentric-SFEMG).',
          ],
        },
        { id: 'jitter', title: 'Jitter neuromuscular',
          content: `El jitter mide la variabilidad del intervalo de tiempo entre los potenciales de dos fibras de la misma UM en disparos consecutivos. Refleja la estabilidad de la transmisión neuromuscular.

**Cuantificación:** MCD (Mean Consecutive Difference): promedio de las diferencias consecutivas del intervalo interpotencial.

**Valores normales:**
| Músculo | MCD normal |
|---|---|
| Orbicular del ojo | <40 µs |
| Extensor digitorum communis (EDC) | <55 µs |
| Deltoides | <55 µs |

**Bloqueo:** cuando el jitter es tan grande que un potencial falla completamente en un ciclo. El bloqueo indica fallo de transmisión neuromuscular.`,
          clinicalPearls: [
            'MCD >55 µs en EDC = jitter anormal. Bloqueo >20% de pares = MG activa muy probable.',
            'Jitter aumentado también aparece en reinervación incompleta. Correlaciona siempre con la clínica.',
          ],
          keyPoints: [
            'Jitter: variabilidad del intervalo interpotencial entre 2 fibras de la misma UM.',
            'Métrica: MCD (Mean Consecutive Difference).',
            'Normal EDC: MCD <55 µs.',
            'Bloqueo: fallo completo de un potencial en un ciclo = disfunción de UNM.',
          ],
        },
        { id: 'fiber-density', title: 'Densidad de fibra',
          content: `La densidad de fibra (DF) es el número promedio de potenciales de fibra individual de la misma UM captados por el electrodo en el radio de ~300 µm.

**Valor normal:** DF ~1.5 fibras/sitio (varía por músculo y edad).

**Significado clínico:**
• **DF normal:** distribución anatómica normal de las fibras de la UM.
• **DF aumentada:** reinervación colateral → más fibras de la misma UM en el territorio de captación. Indica remodelación crónica (polineuropatías, ELA).

**Combinación diagnóstica:**
• DF alta + jitter alto → reinervación inmadura (reciente).
• DF alta + jitter normal → reinervación madura (completada).`,
          keyPoints: [
            'Densidad de fibra normal: ~1.5 (varía por músculo y edad).',
            'DF aumentada: reinervación colateral (más fibras de la misma UM en radio de captación).',
            'DF alta + jitter alto: reinervación inmadura.',
            'DF alta + jitter normal: reinervación madura.',
          ],
        },
        { id: 'sfemg-myasthenia', title: 'Aplicación en miastenia gravis',
          content: `La SFEMG es el test electrodiagnóstico más sensible para los trastornos de la unión neuromuscular.

**Sensibilidad en MG:**
| Tipo de MG | Sensibilidad |
|---|---|
| MG generalizada | >95% |
| MG ocular pura | 85-95% (músculo orbicular) |
| MG seronegativa | >85% |

**Protocolo:**
• Músculo: EDC (MG generalizada) u orbicular (MG ocular).
• Recoger 20 pares de fibras.
• Criterio anormal: >10% de pares con MCD >55 µs, o cualquier bloqueo.

**SFEMG normal → prácticamente descarta MG generalizada.**`,
          clinicalPearls: [
            'SFEMG normal en EDC + orbicular prácticamente descarta MG. Es el mejor test de "descarte" cuando la sospecha es alta pero los demás tests son negativos.',
          ],
          keyPoints: [
            'Sensibilidad: >95% en MG generalizada.',
            'Músculo de elección: EDC (general) y orbicular (ocular).',
            'Criterio anormal: >10% de pares con MCD >55 µs, o cualquier bloqueo.',
            'SFEMG normal → prácticamente descarta MG generalizada.',
          ],
        },
      ]
    },
    {
      id: 'surface-hd-emg', title: 'EMG de Superficie y de Alta Densidad (HD-EMG)',
      children: [
        { id: 'spatiotemporal', title: 'Activación temporo-espacial',
          content: `La EMG de superficie de alta densidad (HD-EMG) utiliza arreglos de múltiples electrodos (64-256 canales) sobre la piel para capturar la actividad EMG en dos dimensiones: tiempo y espacio.

**Principio:** Cada punto del arreglo registra las contribuciones de todas las UM cercanas. Al combinar la información de todos los canales, se puede reconstruir el mapa de activación: dónde y cuándo se activa cada región del músculo.

**Aplicaciones:**
• Mapeo de las zonas de inervación (zonas de placa motora) dentro del músculo.
• Estudio de la propagación de los potenciales a lo largo de las fibras musculares.
• Detección de heterogeneidad de activación (espasticidad, lesiones parciales).
• Guía para inyecciones de toxina botulínica basadas en el mapa de activación.`,
          keyPoints: [
            'HD-EMG: arreglos de 64-256 electrodos de superficie sobre el músculo.',
            'Genera mapas de activación muscular (quién, cuándo y dónde se activa).',
            'Identifica zonas de placa motora sin necesidad de aguja.',
            'Aplicación: guía para inyección de toxina botulínica.',
          ],
        },
        { id: 'dimensionality', title: 'Dimensionalidad de la señal',
          content: `La "dimensionalidad" de la señal EMG se refiere al número de unidades motoras independientes que pueden identificarse simultáneamente en un registro HD-EMG.

**Concepto:** Con arreglos de alta densidad y algoritmos avanzados, es posible identificar decenas de UM individuales simultáneamente durante la contracción voluntaria. Cada UM tiene una "huella digital" espacial única en el arreglo.

**Relevancia clínica:**
• En músculo sano: múltiples UM con distribución espacial dispersa.
• En reinervación: menor número de UM pero territorios expandidos (mayor tamaño en el mapa).
• Permite estimar el número total de UM activas (MUNE no invasivo).
• Base para interfaces cerebro-máquina (BCI) basadas en EMG.`,
          keyPoints: [
            'Dimensionalidad: número de UM independientes identificables en un registro.',
            'HD-EMG puede identificar decenas de UM simultáneamente.',
            'Permite MUNE (estimación de UM) no invasivo.',
            'Base para interfaces cerebro-máquina (BCI) basadas en EMG.',
          ],
        },
        { id: 'fatigue-assessment', title: 'Evaluación de fatiga muscular',
          content: `La HD-EMG y la EMG de superficie cuantifican la fatiga muscular durante tareas repetitivas o sostenidas de forma no invasiva.

**Indicadores de fatiga en la señal EMG:**
• **Compresión espectral:** durante la fatiga, la velocidad de conducción de las fibras disminuye → la frecuencia mediana del espectro se desplaza hacia valores bajos (MDF o MNF).
• **Aumento de amplitud RMS:** al fatigar las UM rápidas, se reclutan más UM y aumenta la amplitud RMS.
• **Sincronización de UM:** en fatiga avanzada, las UM se sincronizan más → potenciales de mayor amplitud.

**Aplicaciones clínicas:**
• Evaluación de fatiga en DMD, miopatías mitocondriales, miastenia gravis.
• Monitoreo de esfuerzo en rehabilitación y medicina deportiva.
• Guía para programas de ejercicio en enfermedades neuromusculares.`,
          keyPoints: [
            'Fatiga → disminución de la frecuencia mediana del espectro EMG.',
            'Fatiga → aumento de amplitud RMS (más UM reclutadas).',
            'EMG de superficie cuantifica fatiga de forma no invasiva.',
            'Aplicación: DMD, miopatías mitocondriales, rehabilitación.',
          ],
        },
      ]
    },
    {
      id: 'muscles-explored', title: 'Músculos Explorados en EMG',
      children: [
        { id: 'upper-limb-muscles', title: 'Miembro superior',
          children: [
            { id: 'fdi', title: 'Primer interóseo dorsal (FDI / PID)',
              content: `**Inervación:** Nervio cubital, cordón medial, tronco inferior, raíces C8-T1.

**Punto de inserción anatómico:**
Dorso de la mano, exactamente a medio camino entre la primera y la segunda articulación metacarpofalángica.

**Maniobra de activación:**
Abducción del dedo índice (separar el índice lateralmente).

**Aplicación clínica:**
Músculo de gran relevancia, frecuentemente afectado en neuropatías cubitales en codo o canal de Guyon, plexopatías de tronco inferior y radiculopatías C8-T1.`,
              clinicalPearls: [
                'De todos los músculos intrínsecos de la mano, el primer interóseo dorsal es típicamente el menos doloroso de explorar.',
                'Cuidado con la profundidad: si la aguja se introduce demasiado profundo, puede atravesar el músculo y registrar actividad del aductor del pulgar (también inervado por el cubital).'
              ],
              keyPoints: [
                'Cubital, C8-T1.',
                'Activación: abducir dedo índice.',
                'Generalmente el menos doloroso de la mano.',
                'No profundizar demasiado para evitar el aductor del pulgar.'
              ]
            },
            { id: 'apb', title: 'Abductor corto del pulgar (APB)',
              content: `**Inervación:** Nervio mediano, cordón medial, tronco inferior, raíces C8-T1.

**Punto de inserción anatómico:**
Con el antebrazo y mano en supinación, inserción tangencial en la eminencia tenar lateral, justo en el punto medio del primer metacarpiano.

**Maniobra de activación:**
Abducción del pulgar (elevar el pulgar hacia el techo manteniendo la mano en supinación).

**Aplicación clínica:**
Crucial para diagnóstico de Síndrome del Túnel Carpiano severo y diferenciación de lesiones C8-T1 o tronco inferior.`,
              clinicalPearls: [
                'El APB es percibido como mucho más doloroso que otros músculos de la mano. Se aconseja entrenar al paciente y NO comenzar la exploración con este músculo si hay ansiedad.',
                'Desviación medial: Si la aguja se inserta muy medial, puede registrar el flexor corto del pulgar (inervación dual mediano/cubital), confundiendo el diagnóstico.',
                'Desviación profunda: Si se profundiza demasiado, registra el oponente del pulgar.',
                'A diferencia del STC, este músculo se preserva intacto en las lesiones puras del nervio interóseo anterior.'
              ],
              keyPoints: [
                'Mediano, C8-T1.',
                'Músculo muy doloroso a la punción.',
                'Insertar superficial y lateral para no registrar flexor u oponente.',
                'Anormal en STC severo, normal en lesión de interóseo anterior.'
              ]
            },
            { id: 'biceps', title: 'Bíceps braquial',
              content: `**Inervación:** Nervio musculocutáneo, cordón lateral, tronco superior, raíces C5-C6.

**Punto de inserción anatómico:**
Con antebrazo en supinación, en el punto medio entre el tendón distal del bíceps (fosa antecubital) y la parte anterior del hombro.

**Maniobra de activación:**
Flexión del codo con el antebrazo en supinación. Contracción isométrica aplicando resistencia.

**Aplicación clínica:**
Músculo proximal clave para evaluar raíces C5-C6, tronco superior y cordón lateral del plexo braquial.`,
              clinicalPearls: [
                '¡SEGURIDAD CRÍTICA! La aguja debe insertarse estrictamente desde un abordaje ANTERIOR. El abordaje medial está absolutamente contraindicado por el altísimo riesgo de pinchar la arteria braquial o el nervio mediano.',
                'Para minimizar el dolor por desplazamiento muscular ("muscle roll"), estabiliza el codo del paciente y pide una contracción puramente isométrica contra tu mano.'
              ],
              keyPoints: [
                'Musculocutáneo, C5-C6.',
                'Abordaje estrictamente ANTERIOR.',
                'Peligro de abordaje medial: paquete neurovascular braquial.',
                'Usar contracción isométrica para reducir dolor.'
              ]
            },
            { id: 'triceps', title: 'Tríceps braquial (Cabeza lateral)',
              content: `**Inervación:** Nervio radial, cordón posterior, troncos superior/medio/inferior, raíces C6-C7-C8 (predominantemente C7).

**Punto de inserción anatómico:**
Con el brazo en pronación y codo flexionado, la aguja se inserta justo por debajo del punto medio entre el epicóndilo lateral del húmero y el hombro, apuntando a la cabeza lateral del tríceps.

**Maniobra de activación:**
Extensión del codo contra resistencia.

**Aplicación clínica:**
Es el músculo que se afecta con mayor consistencia en presencia de una radiculopatía C7. También útil para evaluar nervio radial proximal a la espiral humeral.`,
              clinicalPearls: [
                'La cabeza lateral es técnicamente la más accesible y fácil de estudiar de las tres porciones del tríceps.',
                'Evite inserciones demasiado distales (cerca del codo), ya que el tejido se vuelve tendinoso y significativamente más doloroso para el paciente.',
                'Un abordaje estrictamente lateral hace que la exploración sea muy segura, libre de riesgo vascular o nervioso principal.'
              ],
              keyPoints: [
                'Radial, C6-C8 (principalmente C7).',
                'Explorar preferentemente la cabeza lateral.',
                'Abordaje lateral muy seguro.',
                'No insertar cerca del codo (tendón = mucho dolor).'
              ]
            },
            { id: 'deltoid', title: 'Deltoides (Cabeza media)',
              content: `**Inervación:** Nervio axilar, cordón posterior, tronco superior, raíces C5-C6.

**Punto de inserción anatómico:**
En la cara lateral del hombro, en el vientre muscular de la cabeza media del deltoides.

**Maniobra de activación:**
Abducción del hombro (elevar el brazo lateralmente) a 90 grados.

**Aplicación clínica:**
Evaluación de radiculopatía C5-C6, plexopatía de tronco superior, y lesión del nervio axilar post-luxación de hombro.`,
              clinicalPearls: [
                'La cabeza media es la más fácil de localizar y estudiar de las tres porciones deltoideas.',
                'Atención a la morfología normal: En sujetos sanos, los PUM registrados en el deltoides pueden presentar de forma natural y fisiológica una polifasia aumentada. No sobreinterprete esto como patología.',
                'El abordaje lateral es seguro, sin grandes vasos ni nervios en la vecindad inmediata.'
              ],
              keyPoints: [
                'Axilar, C5-C6.',
                'Cabeza media es de elección.',
                'Polifasia aumentada puede ser fisiológica aquí.',
                'Seguro de puncionar (cara lateral).'
              ]
            },
            { id: 'forearm-extensors', title: 'Extensores del antebrazo', content: 'Inervados por nervio radial (rama interósea posterior). Evalúa radiculopatía C7 y síndrome del interóseo posterior.' },
            { id: 'cervical-paraspinals', title: 'Paraespinales cervicales',
              videoUrls: [{ title: 'Actividad motora de paraespinales', driveId: '19pO6_gBt72i80aSm-m9DSicNY6MMhrNZ' }],
              content: `**Inervación:** Ramas primarias dorsales de los nervios espinales cervicales correspondientes.

**Punto de inserción anatómico (Capa profunda - Multifidus):**
Paciente en decúbito lateral (en "posición fetal", con cuello flexionado para relajar musculatura). Se inserta la aguja a dos traveses de dedo de la línea media vertebral, con leve inclinación medial, hasta tocar la lámina vertebral ósea, retirando sutilmente.

**Maniobra de activación:**
Extensión leve del cuello (elevar la cabeza ligeramente).

**Aplicación clínica:**
Cruciales para confirmar una radiculopatía (presencia de denervación aquí indica lesión proximal al plexo) y diferenciarla de plexopatía (paraespinales normales).`,
              clinicalPearls: [
                '¡RIESGO DE NEUMOTÓRAX! En C6-C7, si la aguja se inserta demasiado lateral, puede pinchar el ápex pulmonar (que puede estar a solo 3.3 cm de profundidad en personas delgadas con cuello largo). Mantenga la aguja SIEMPRE cerca de la línea media y con leve dirección medial.',
                'Mapeo segmentario impreciso: Por el gran solapamiento de la capa superficial, una fibrilación aquí confirma lesión proximal, pero no define el nivel exacto de la raíz con precisión (se define con los músculos de extremidades).',
                'Si inserta muy superficialmente, registrará trapecio superior, no paraespinales.',
                'En pacientes post-cirugía de columna, las fibrilaciones pueden persistir años por cicatrización quirúrgica, restándole valor diagnóstico para lesiones nuevas.'
              ],
              keyPoints: [
                'Inervados por ramas dorsales posteriores.',
                'Confirma radiculopatía vs. plexopatía.',
                'Riesgo altísimo de neumotórax si la inserción C6-C7 es muy lateral.',
                'No tienen valor diagnóstico si hubo cirugía de columna previa a ese nivel.'
              ]
            },
          ]
        },
        { id: 'lower-limb-muscles', title: 'Miembro inferior',
          children: [
            { id: 'tibialis-anterior', title: 'Tibial anterior',
              content: `**Inervación:** Nervio peroneo profundo, división peroneal del ciático, raíces L4-L5 (predominantemente L5).

**Punto de inserción anatómico:**
Inmediatamente lateral a la cresta tibial ósea, aproximadamente a dos tercios de la distancia hacia arriba (medido desde el tobillo hacia la rodilla).

**Maniobra de activación:**
Flexión dorsal del tobillo.

**Aplicación clínica:**
Es el músculo clave y de referencia obligatoria en pacientes con "pie caído" (déficit de dorsiflexión), permitiendo evaluar neuropatías del peroneo común, ciático o radiculopatías L5.`,
              clinicalPearls: [
                'Abordaje seguro: Mientras la aguja se mantenga estrictamente anterolateral (adyacente a la tibia), el procedimiento es libre de riesgo vascular importante.',
                'Es el músculo inervado por el peroneo profundo más sencillo de localizar y aislar clínicamente en el EMG.',
                'En un paciente con pie caído, combinar el Tibial Anterior (anormal) con el Tibial Posterior (normal en lesión peronea, anormal en radiculopatía L5) es la clave diagnóstica.'
              ],
              keyPoints: [
                'Peroneo profundo, L4-L5.',
                'Insertar lateral a la cresta tibial en el tercio superior.',
                'Estudio obligatorio en el síndrome de "pie caído".',
                'Abordaje anterolateral muy seguro.'
              ]
            },
            { id: 'medial-gastrocnemius', title: 'Gastrocnemio medial',
              content: `**Inervación:** Nervio tibial (división tibial del nervio ciático mayor), raíces S1-S2.

**Punto de inserción anatómico:**
Parte rostral, medial y posterior de la pantorrilla.

**Maniobra de activación:**
Flexión plantar del tobillo.

**Aplicación clínica:**
Músculo de elección para evaluar radiculopatías S1.`,
              clinicalPearls: [
                'Suele ser un músculo difícil de activar voluntariamente para algunos pacientes. Un truco es flexionar primero la rodilla del paciente pasivamente y luego pedirle la flexión plantar, lo que facilita enormemente la activación.'
              ],
              keyPoints: [
                'Tibial, S1-S2.',
                'Clave en radiculopatía S1.',
                'Activación: flexión plantar.',
                'Si cuesta activarlo, flexionar rodilla pasivamente primero.'
              ]
            },
            { id: 'biceps-femoris-short', title: 'Bíceps femoral (Cabeza corta)',
              content: `**Inervación:** División peroneal del nervio ciático mayor, raíces L5-S1.

**Punto de inserción anatómico:**
Tres o cuatro traveses de dedo proximales a la cara lateral de la rodilla, justo medial al tendón prominente de la cabeza larga del bíceps femoral.

**Maniobra de activación:**
Flexión de la rodilla. Para ubicar el tendón de la cabeza larga previamente, pedir leve flexión que lo hace resaltar.

**Aplicación clínica:**
Es el músculo clave definitivo para el diagnóstico diferencial entre una lesión del ciático proximal vs. lesión del peroneo común en la rodilla (pie caído).`,
              clinicalPearls: [
                '¡DIFERENCIAL CLAVE!: Es el ÚNICO músculo inervado por la división peroneal por ENCIMA de la cabeza del peroné. En una neuropatía del peroneo común en rodilla estará NORMAL. En una lesión del ciático (que suele simular pie caído) estará ANORMAL.',
                'Riesgo: Si la aguja se introduce con dirección demasiado medial y profunda, existe un riesgo severo de lesionar de forma directa el tronco principal del nervio ciático.'
              ],
              keyPoints: [
                'Ciático (división peroneal), L5-S1.',
                'Normal en neuropatía del peroneo común.',
                'Anormal en lesión ciática o radiculopatía L5-S1.',
                'Riesgo de lesionar nervio ciático si se inserta muy profundo/medial.'
              ]
            },
            { id: 'vastus-lateralis', title: 'Vasto lateral', content: 'Inervado por nervio femoral (L2-L4). Músculo proxi para evaluar L3-L4 y neuropatía femoral.' },
            { id: 'gluteus-medius', title: 'Glúteo medio', content: 'Inervado por nervio glúteo superior (L4-S1). Evalúa plexopatía y radiculopatía lumbar alta.' },
            { id: 'ehl', title: 'Extensor largo del hallux', content: 'Inervado por nervio peroneo profundo (L5). Muy específico para evaluación de raíz L5.' },
            { id: 'lumbar-paraspinals', title: 'Paraespinales lumbares',
              content: `**Inervación:** Ramas primarias dorsales de los nervios raquídeos correspondientes.

**Punto de inserción anatómico:**
Paciente en decúbito lateral (posición fetal). Aguja a dos traveses de dedo (aprox 2.5 cm) lateral a la apófisis espinosa, con orientación levemente medial. Avanzar hasta tocar la lámina ósea y retirar 1-2 mm para quedar en la capa profunda (multifidus).

**Maniobra de activación:**
Extensión de cadera con pierna estirada.

**Aplicación clínica:**
Confirman que una lesión radicular es verdaderamente proximal (afecta rama dorsal), excluyendo plexopatías.`,
              clinicalPearls: [
                'Falta de relajación: El paciente suele tensarse. La posición fetal (decúbito lateral con columna flexionada) es obligatoria para relajar la musculatura y valorar la actividad de reposo.',
                'Mapeo segmentario impreciso: Por el solapamiento de inervación en las capas superficiales, confirman nivel radicular pero NO definen el segmento exacto con precisión absoluta.',
                'Falsos positivos por cirugía: Evitar explorar o concluir cerca de cicatrices de laminectomía previa (el trauma operatorio denerva).',
                'Falsos positivos por envejecimiento: 40% de mayores de 40 años pueden tener descargas breves (PSW/fibrilaciones) benignas en niveles lumbosacros bajos.'
              ],
              keyPoints: [
                'Ramos dorsales, confirman radiculopatía.',
                'Posición fetal clave para lograr relajación.',
                'Inútil diagnosticar lesión nueva si hay cirugía de columna previa en ese nivel.',
                'Mapeo segmentario orientativo, no absoluto.'
              ]
            },
          ]
        },
        { id: 'cranial-muscles', title: 'Cráneo y cuello',
          children: [
            { id: 'orbicularis-oculi', title: 'Orbicular de los ojos',
              content: `Inervado por el nervio facial (VII par). Es el músculo de elección para SFEMG en miastenia gravis ocular y para el estudio del nervio facial.

**Indicaciones clínicas:**
• Parálisis facial (Bell, tumoral, traumática).
• Miastenia gravis ocular (SFEMG: MCD normal <40 µs).
• Blefaroespasmo (guía para toxina botulínica).
• Evaluación post-schwannoma vestibular (regeneración del VII par).

**Técnica:**
• Aguja muy fina (calibre 30-37G).
• Inserción en el segmento inferior del orbicular, zona palpebral inferior.
• Paciente con mirada frontal fija durante la exploración.
• EVITAR siempre la zona cercana al globo ocular.`,
              keyPoints: [
                'Inervación: nervio facial (VII par craneal).',
                'SFEMG: músculo de elección para MG ocular (MCD normal <40 µs).',
                'Indicado en: parálisis facial, blefaroespasmo, MG ocular.',
                'Técnica: aguja muy fina (30G), inserción palpebral inferior.',
              ],
            },
            { id: 'masseter', title: 'Masetero',
              content: `Inervado por el nervio maseterino (rama del madibular, V par). Clave para evaluar la afectación del V par craneal y lesiones del tronco encefálico.

**Indicaciones clínicas:**
• Neuropatía trigeminal (entumecimiento facial, atrofia del masetero).
• ELA (evaluación bulbar): afectación de músculos masticadores.
• Esclerosis múltiple (lesión de tronco).
• Trismo patológico.

**Técnica:**
• Palpación del arco cigomático.
• Inserción 1 cm inferior al arco, en el vientre muscular.
• Pedir al paciente que apriete los dientes para localizar el vientre.
• Cuidado con la arteria facial (anterior al músculo).

**Valores normales:** PUM duración 8-12 ms (mayor que músculos distales por ser un músculo grande).`,
              keyPoints: [
                'Inervación: ramo maseterino del n. mandibular (V par).',
                'Indicado en: neuropatía trigeminal, ELA bulbar, EM.',
                'PUM más largos que músculos distales: duración normal 8-12 ms.',
                'Técnica: inserción 1 cm bajo arco cigomático, cuidado con arteria facial.',
              ],
            },
            { id: 'genioglossus', title: 'Geniogloso (lengua)',
              content: `Inervado por el nervio hipogloso (XII par). Su exploración es fundamental en el diagnóstico de ELA para confirmar afectación bulbar.

**Indicaciones clínicas:**
• ELA: detección de fibrilaciones en región bulbar (criterio El Escorial/Awaji).
• Parálisis del XII par (tumores de base de cráneo, compresión extrínseca).
• Lesiones bulbares del tronco encefálico.

**Técnica:**
• Aguja corta (25 mm).
• Inserción submentoniana medial, dirección superior.
• Pedir al paciente que protruya y retraiga la lengua para localizar el vientre muscular.
• Precaución con el piso de la boca y glándula sublingual.

**CLAVE EN ELA:** fibrilaciones en la lengua + afectación de miembros = criterio de región bulbar.`,
              clinicalPearls: [
                'Fibrilaciones en geniogloso son CLAVE para el diagnóstico de ELA. En El Escorial/Awaji, la región bulbar + extremidades = diagnóstico de ELA probable o definitivo.',
              ],
              keyPoints: [
                'Inervación: nervio hipogloso (XII par).',
                'CLAVE en ELA: fibrilaciones en lengua = región bulbar afectada.',
                'Técnica: inserción submentoniana, paciente protruye la lengua.',
                'También en: parálisis del XII par, lesiones bulbares.',
              ],
            },
            { id: 'scm', title: 'Esternocleidomastoideo (ECM)',
              content: `Inervado por el nervio accesorio espinal (XI par) y ramos de C2-C3. Relevante para evaluar el XI par y distinguir radiculopatías cervicales altas de plexopatías cervicales.

**Indicaciones clínicas:**
• Neuropatía del XI par (post-disección radical del cuello, lesión en punto de Erb).
• ELA (región bulbar/cervical): afectación de músculos del cuello.
• Radiculopatía C2-C3 (muy rara, diferenciación de cefalea cervicogénica).
• Distrofia miotónica (afectación de músculos faciales y cuello).

**Técnica:**
• Con el paciente rotado hacia el lado contrario.
• Palpación del vientre muscular anteromedial del cuello.
• Inserción cuidadosa, evitando la vena yugular interna y la arteria carótida.
• Solicitar al paciente que rote la cabeza contra resistencia para identificar el músculo.`,
              keyPoints: [
                'Inervación: nervio espinal accesorio (XI par) + C2-C3.',
                'Indicado en: neuropatía del XI par, ELA, distrofia miotónica.',
                'Técnica: paciente rotado, inserción en vientre anterior del ECM.',
                'Cuidado: yugular interna y arteria carótida en posición medial.',
              ],
            },
            { id: 'trapezius', title: 'Trapecio',
              content: `Inervado por el nervio accesorio espinal (XI par) y ramos de C3-C4. Segundo músculo de elección para el XI par, complementario al ECM.

**Indicaciones clínicas:**
• Neuropatía del XI par: parálisis del XI (escápula alada tipo trapecio).
• Plexopatía braquial (afectación del tronco superior, C5-C6).
• ELA (región cervical): evaluación de músculos del cinturón escapular.
• Miopatías inflamatorias: músculo accesible y representativo del cinturón escapular.

**Valores normales:** PUM duración 8-12 ms. Es un músculo grande con PUM de mayor duración que los distales.

**Técnica:**
• Inserción en el vientre del trapecio superior o medio, lejos de las vértebras.
• Bajo riesgo de neumotórax si la inserción es lateral (EVITAR inserción con trayectoria hacia las costillas en la zona medial).`,
              keyPoints: [
                'Inervación: nervio espinal accesorio (XI par) + C3-C4.',
                'Indicado en: neuropatía del XI par, plexopatía braquial (C5-C6), ELA.',
                'Músculo superficial: bajo riesgo, fácil acceso.',
                'Técnica: inserción lateral al músculo, evitar trayectoria hacia costillas.',
              ],
            },
          ]
        },
        { id: 'risky-muscles', title: 'Músculos de riesgo: diafragma, serrato, romboides',
          content: `El diafragma, el serrato anterior y los romboides tienen una cercanía crítica al pulmón y la pleura. Su punción requiere técnica depurada para evitar el neumotórax.

**Medidas de seguridad:**
1. **Inserción tangencial:** Nunca insertar la aguja perpendicularmente al tórax.
2. **Guía ecográfica:** Altamente recomendada para el diafragma y el serrato anterior.
3. **Mínima penetración:** Usar la aguja más corta y fina posible.
4. **Apnea espiratoria:** Para el diafragma, insertar durante la espiración profunda cuando el pulmón está más alejado.

**Localización segura:**
• **Diafragma:** Espacio intercostal 8vo o 9no, línea axilar anterior.
• **Serrato anterior:** Línea axilar media, sobre una costilla (no en el espacio intercostal).
• **Romboides:** Medial a la escápula, palpar la costilla subyacente primero.`,
        },
      ]
    },
  ]
};
