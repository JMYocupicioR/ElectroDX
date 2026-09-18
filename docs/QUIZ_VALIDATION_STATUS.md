# Cobertura de evaluaciones (pendiente de validación clínica)

## Flujo de validación por lotes

1. Aplicar migraciones locales (`npx supabase db reset` o `migration up`).
2. Generar el SQL de importación: `npm run import:pending-quizzes` → `supabase/seeds/import_pending_quizzes.sql`.
3. Ejecutar ese SQL en la base local. **No pisa** `published_quizzes` ya existentes por `topic_id`.
4. Abrir `/admin/revisiones` → pestaña **Validación clínica**. El sistema sugiere el módulo 01 y sigue 02…13.
5. Revisar reactivos (respuesta correcta, explicación, duplicados). Corregir en `/admin/quizzes/:topicId` si están mal clasificados.
6. Aprobar o rechazar por cuestionario o por lote de módulo (doble confirmación).
7. El alumno solo puede acreditar quizzes con `clinical_validation_status = approved`. El resto se muestra como «En validación académica».

RPCs: `admin_list_quizzes_for_validation`, `admin_set_quiz_validation_status`, `admin_import_pending_quizzes`.

- Hojas evaluables detectadas en TEMARIO: **359**

- Hojas evaluables detectadas en TEMARIO: **359**
- Reactivos por hoja: **4** (básico, intermedio, avanzado, múltiple)
- Estado: `pending_review` — no acreditar hasta aprobación del responsable académico
- Semilla: `supabase/seeds/topic_quizzes_pending_validation.json`
- Lecciones cortas ampliadas: **71** IDs únicos + **2** desambiguadas por título (`fiber-types`, `stimulus-artifact`)
- Tras aplicar expansiones, TEMARIO reporta **0** hojas < 60 palabras (pendiente de validación clínica)

## IDs ampliados
- `axonal-membrane` — Membrana axonal y canales iónicos
- `myelin-sheath` — Vaina de mielina y células de Schwann
- `nodes-saltatory` — Nódulos de Ranvier y conducción saltatoria
- `wallerian-degeneration` — Degeneración Walleriana y regeneración axonal
- `fiber-types` — Fibras Aα, Aβ, Aδ, B y C
- `endo-peri-epineurium` — Endoneuro, perineuro, epineuro
- `motor-unit-composition` — Composición: motoneurona + axón + UNM + fibras musculares
- `innervation-ratio` — Ratio de inervación
- `motor-unit-territory` — Territorio de la unidad motora
- `action-potential-generation` — Generación y propagación del potencial de acción
- `neuromuscular-transmission` — Transmisión neuromuscular: acetilcolina y receptores nicotínicos
- `excitation-contraction` — Acoplamiento excitación-contracción
- `facial-motor` — Nervio Facial (VII)
- `trigeminal-motor` — Nervio Trigémino motor (V)
- `accessory-motor` — Nervio Espinal Accesorio (XI)
- `hypoglossal-motor` — Nervio Hipogloso (XII)
- `glossopharyngeal-motor` — Nervio Glosofaríngeo motor (IX)
- `vagus-motor` — Nervio Vago motor (X)
- `motor-interpretation` — Interpretación: normal vs. axonal vs. desmielinizante
- `snap-morphology` — El PANS (SNAP): morfología y medición
- `onset-peak-latency` — Latencia de inicio y latencia pico
- `snap-amplitude` — Amplitud del SNAP
- `sensory-cv` — Velocidad de conducción sensitiva (VCS)
- `antidromic-orthodromic` — Técnica antidrómica vs. ortodrómica
- `pre-post-ganglionic` — Significado clínico: lesiones pre vs. postganglionares
- `age-height` — Efecto de la edad y estatura
- `stimulus-artifact` — Artefacto de estímulo
- `martin-gruber` — Anomalías anatómicas: Martin-Gruber y Riche-Cannieu
- `early-recruitment` — Reclutamiento precoz (miopático)
- `reduced-recruitment` — Reclutamiento disminuido (neurogénico)
- `fdi` — Primer interóseo dorsal
- `apb` — Abductor corto del pulgar
- `biceps` — Bíceps braquial
- `triceps` — Tríceps braquial
- `deltoid` — Deltoides
- `forearm-extensors` — Extensores del antebrazo
- `cervical-paraspinals` — Paraespinales cervicales
- `tibialis-anterior` — Tibial anterior
- `medial-gastrocnemius` — Gastrocnemio medial
- `vastus-lateralis` — Vasto lateral
- `gluteus-medius` — Glúteo medio
- `ehl` — Extensor largo del hallux
- `lumbar-paraspinals` — Paraespinales lumbares
- `f-wave-utility` — Utilidad Clínica
- `h-reflex-physiology` — Fisiología
- `h-reflex-values-utilty` — Valores Normales y Utilidad
- `a-wave-pathophysiology` — Fisiopatología
- `blink-technique` — Técnica de Registro
- `uremic-neuropathy` — Neuropatía Urémica
- `block-vs-dispersion` — Bloqueo Quirúrgico vs Dispersión Temporal
- `f-wave-tables` — Latencias de Onda F y Criterios
- `h-reflex-tables` — Reflejo H (S1 / Tibial-Sóleo)
- `ssep-vep-tables` — PESS y Valores Centrales PEV
- `segmental-table` — Miotomas Segmentarios Clínicos
- `dermatome-table` — Dermatomas y Referencia Táctil
- `emg-muscle-table` — Protocolos Musculares Needle EMG
- `aanem-guidelines` — Guías de la AANEM
- `atlases-videos` — Atlas fotográficos y videos de técnica
- `online-resources` — Recursos en línea y calculadoras
- `clinical-impact` — Impacto Clínico del Frío
- `standard-requirements` — Requisitos Estándar
- `60hz-noise` — Interferencia de línea (60Hz)
- `co-stimulation` — Co-estimulación (Efecto de Volumen)
- `distance-errors` — Errores de Medición de Distancia
- `pacemakers-icd` — Marcapasos y Desfibriladores (DAI)
- `bleeding-risk` — Riesgo de Sangrado (Anticoagulantes)
- `infection-risk` — Riesgo de Infección y Daño Cutáneo
- `pneumothorax` — Riesgo Crítico de Neumotórax
- `supramaximal` — Estímulo Supramáximo Riguroso
- `sweep-gain` — Configuración Sensitiva vs Motora
- `reproducibility` — Reproducibilidad Mínima
