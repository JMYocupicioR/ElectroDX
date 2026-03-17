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
      children: [
        { id: 'insertion-activity', title: 'Actividad de inserción',
          children: [
            { id: 'normal-insertion', title: 'Normal', content: 'Breve estallido de actividad eléctrica (<300 ms) al mover la aguja. Causada por la despolarización mecánica de las fibras musculares.', videoUrls: [{ title: 'Inserción normal', driveId: '1mIO7Oq-mwzE_C2OIHsELS38nczAC81Ay' }] },
            { id: 'increased-insertion', title: 'Aumentada (patológica)', content: 'Actividad de inserción que persiste >300 ms. Indica membrana muscular irritable: denervación aguda/subaguda, miopatías inflamatorias, miotonía temprana.', videoUrls: [{ title: 'Inserción aumentada', driveId: '1TuIOyoFWt_70jT4b5nn9vZKbIZ1c4Fk5' }] },
            { id: 'decreased-insertion', title: 'Disminuida / silencio eléctrico', content: 'Indica tejido muscular no viable: reemplazo fibroso/graso severo, atrofia de larga evolución, miopatía terminal. También en parálisis periódica durante el ataque.', videoUrls: [{ title: 'Inserción disminuida', driveId: '1eJ0j6Jnef2WApEJJ2gypK1HKBmwuWs-m' }] },
          ]
        },
        { id: 'rest-activity', title: 'Actividad en reposo',
          children: [
            { id: 'endplate-noise', title: 'Ruido de placa motora (potenciales en miniatura)', content: 'Actividad normal: ruido monofásico negativo de baja amplitud (10-50 µV), como "soplido de viento". Causado por la liberación espontánea de vesículas de ACh (potenciales miniatura de placa terminal). NO es patológico pero puede confundirse con fibrilaciones.', videoUrls: [{ title: 'Potencial de placa terminal miniatura', driveId: '1oGLifGxCY-iBMDZv39NTOtc3TwjYChpF' }] },
            { id: 'endplate-spikes', title: 'Espículas de placa terminal', content: 'Potenciales irregulares, bifásicos con deflexión negativa inicial, 100-200 µV. Causados por la activación de una sola fibra muscular en la zona de la placa. Son normales pero dolorosos para el paciente — mover la aguja ligeramente para salir de la zona de placa.', videoUrls: [{ title: 'Espículas de placa terminal', driveId: '1zLA6JYR_BnDAfU28jcA3rH1HHNYSlr66' }, { title: 'Espículas de placa terminal (2)', driveId: '17zBInoX6SZiX0-L4v34Gf_B5ha7tygwL' }, { title: 'Espículas de placa terminal atípicas', driveId: '16ftESXOlyuKHTvfbbQKdjtM3bPSbr-o9' }] },
            { id: 'normal-silence', title: 'Silencio eléctrico normal', content: 'Un músculo completamente relajado no muestra actividad eléctrica fuera de la zona de placa. La presencia de cualquier actividad en reposo (fuera de la placa) es anormal.' },
          ]
        },
        { id: 'spontaneous-activity', title: 'Actividad espontánea anormal', videoUrls: [{ title: 'Calambre', driveId: '19TAx27BvBDeMefLtu2ZW_SsvW76Nm_pW' }, { title: 'Calambre 2', driveId: '1AgwXJWo-VMzu5wb4OoZhpoVaR4lB95Un' }],
          children: [
            { id: 'fibrillations', title: 'Fibrilaciones: fisiopatología y significado', content: 'Potenciales de fibra muscular individual que se despolariza espontáneamente por pérdida de inervación. Morfología: bifásicas (deflexión positiva inicial), 1-5 ms duración, 20-200 µV. Sonido: "lluvia en el techo". Aparecen 2-3 semanas post-denervación. Se gradúan de 1+ a 4+. Causas: denervación (la más común), miopatías inflamatorias, miopatías necrotizantes.', videoUrls: [{ title: 'Fibrilaciones', driveId: '1K9oy18ok-gK3NTKP1ZxLmbBwRci9Ui90' }] },
            { id: 'positive-sharp-waves', title: 'Ondas agudas positivas (PSW)', content: 'Mismo significado que las fibrilaciones (denervación). Morfología: deflexión positiva inicial abrupta seguida de retorno lento a la línea base. Duración más larga que las fibrilaciones. Sonido: "golpe sordo". A menudo aparecen antes que las fibrilaciones y persisten más tiempo.', videoUrls: [{ title: 'Ondas positivas', driveId: '1E2kLgERe2t0uNjx-brGCrlja6GduTG0I' }, { title: 'Ondas positivas + fibrilaciones', driveId: '1rIl096UwPW5aNyeLY9DKAtFtt72A2SGb' }] },
            { id: 'fasciculaciones', title: 'Fasciculaciones: benignas vs. malignas', content: 'Contracción visible de un fascículo muscular. En EMG: PUM de morfología normal que descarga irregularmente. Fasciculaciones benignas: morfología normal, persona sana, estresada, cafeína. Fasciculaciones malignas (criterios de Awaji): morfología compleja/inestable, en contexto de denervación activa (fibrilaciones, PSW). En ELA, las fasciculaciones tienen el mismo valor diagnóstico que las fibrilaciones.', videoUrls: [{ title: 'Fasciculaciones', driveId: '1vp09_FsBATj5VBTriGGw3FdyTfDU_9Vd' }, { title: 'Tremor Parkinsoniano', driveId: '17EwHc-8pg83JF1No6EKyTkiCTkpWPhm4' }, { title: 'Registro de un px con ALS', driveId: '1hWzkmC5KVuVLUI71QiBxMXRIso8-M1Eg' }] },
            { id: 'crd', title: 'Descargas repetitivas complejas (CRD)', content: 'Descargas polifásicas (5-100 componentes) que inician y terminan abruptamente, regulares como "máquina de coser". No tienen componente miotónico. Indican cronicidad: denervación crónica, miopatías crónicas, lesiones antiguas. No son específicas de ninguna etiología.', videoUrls: [{ title: 'Descargas repetitivas complejas', driveId: '1DgUYo0lSJdlxb0seMq7c9sLYb6vQuF4c' }, { title: 'Descargas repetitivas complejas 2', driveId: '1690RuQIeJU4I-vmBI-Q6Z5g5WBbxU6TX' }] },
            { id: 'myotonic-discharges', title: 'Descargas miotónicas', content: 'Ráfagas de potenciales que aumentan y disminuyen en frecuencia y amplitud (waxing and waning). Sonido característico: "bombardero en picada" o "motocicleta acelerando". Causas: distrofia miotónica (DM1, DM2), miotonía congénita, paramiotonía congénita, hipotiroidismo severo, fármacos (estatinas, colchicina).', videoUrls: [{ title: 'Descargas miotónicas', driveId: '1oZ1eWZMq46MWtY1TTLM4ctYwPYqys0IA' }, { title: 'Descargas miotónicas 2', driveId: '1JU0SGnXzBKbjCJNsA6UnS0Lr3HUaeRUv' }] },
            { id: 'myokymia', title: 'Mioquimias', content: 'Descargas agrupadas de PUM (dobletes o tripletes) con patrón semirrítmico. Sonido: "soldados marchando". Causas: radiación (plexopatía braquial post-radiación), esclerosis múltiple (facial), Guillain-Barré, intoxicación por organofosforados.', videoUrls: [{ title: 'Descargas mioquímicas', driveId: '1AErD_0PSEDmtjHYDZBrAiQgIwxw_UFN8' }, { title: 'Descargas mioquímicas y multipletes', driveId: '1YDkEp9-EK4kytvQY9IP0N0Uus1pa2Hnh' }] },
            { id: 'neuromyotonia', title: 'Descargas neuromiotónicas', content: 'Ráfagas de alta frecuencia (150-300 Hz) que decrementan. Causas: síndrome de Isaac (neuromiotonía adquirida), anticuerpos anti-CASPR2/LGI1.' },
            { id: 'doublets-multiplets', title: 'Dobletes, tripletes, multipletes', content: 'Descarga repetida de la misma unidad motora en intervalos fijos cortos (5-15 ms). Pueden verse en tétanos, hiperexcitabilidad nerviosa, y como hallazgo normal ocasional.', videoUrls: [{ title: 'Dobletes', driveId: '1rWovq9O5tvA_FEwsZk0GQ2b84R_xDtA_' }, { title: 'Dobletes y múltipletes', driveId: '1p-zDNVIoQ5j32WPWr3G2oaSyNTOKxdKX' }] },
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
            { id: 'fdi', title: 'Primer interóseo dorsal', content: 'Inervado por nervio ulnar (C8-T1). Fácilmente accesible, útil para evaluar C8-T1, tronco inferior, cordón medial, nervio ulnar.' },
            { id: 'apb', title: 'Abductor corto del pulgar', content: 'Inervado por nervio mediano (C8-T1). Músculo estándar para registro en NCS del mediano motor. Evaluación de túnel carpiano y lesión C8-T1.' },
            { id: 'biceps', title: 'Bíceps braquial', content: 'Inervado por nervio musculocutáneo (C5-C6). Músculo proxi del MS para evaluar raíces C5-C6, tronco superior, cordón lateral.' },
            { id: 'triceps', title: 'Tríceps braquial', content: 'Inervado por nervio radial (C6-C8). Evalúa raíz C7, tronco medio, cordón posterior, nervio radial.' },
            { id: 'deltoid', title: 'Deltoides', content: 'Inervado por nervio axilar (C5-C6). Músculo proxi para evaluar C5-C6 y nervio axilar post-luxación de hombro.' },
            { id: 'forearm-extensors', title: 'Extensores del antebrazo', content: 'Inervados por nervio radial (rama interósea posterior). Evalúa radiculopatía C7 y síndrome del interóseo posterior.' },
            { id: 'cervical-paraspinals', title: 'Paraespinales cervicales', content: 'Inervados por ramos dorsales. Cruciales para confirmar radiculopatía (fibrilaciones en paraespinales) vs. plexopatía (paraespinales normales).', videoUrls: [{ title: 'Actividad motora de paraespinales', driveId: '19pO6_gBt72i80aSm-m9DSicNY6MMhrNZ' }] },
          ]
        },
        { id: 'lower-limb-muscles', title: 'Miembro inferior',
          children: [
            { id: 'tibialis-anterior', title: 'Tibial anterior', content: 'Inervado por nervio peroneo profundo (L4-L5). Músculo clave para evaluar L5 y neuropatía peronea.' },
            { id: 'medial-gastrocnemius', title: 'Gastrocnemio medial', content: 'Inervado por nervio tibial (S1-S2). Evalúa radiculopatía S1.' },
            { id: 'vastus-lateralis', title: 'Vasto lateral', content: 'Inervado por nervio femoral (L2-L4). Músculo proxi para evaluar L3-L4 y neuropatía femoral.' },
            { id: 'gluteus-medius', title: 'Glúteo medio', content: 'Inervado por nervio glúteo superior (L4-S1). Evalúa plexopatía y radiculopatía lumbar alta.' },
            { id: 'ehl', title: 'Extensor largo del hallux', content: 'Inervado por nervio peroneo profundo (L5). Muy específico para evaluación de raíz L5.' },
            { id: 'lumbar-paraspinals', title: 'Paraespinales lumbares', content: 'Ramos dorsales (L3-S1). Confirman radiculopatía. Explorar a 2-3 cm lateral a la apófisis espinosa.' },
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
