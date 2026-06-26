// src/content/modules/module-09-pathologies-part4.ts
// Sections 6-8: Enfermedades de Motoneurona, Trastornos UNM, Miopatías
import { Topic } from '../../types/content';

// ═══════════════════════════════════════════════════════════════
// SECTION 6: ENFERMEDADES DE LA MOTONEURONA
// ═══════════════════════════════════════════════════════════════
export const motorNeuronDiseases: Topic = {
  id: 'motor-neuron-diseases',
  title: 'Enfermedades de la Motoneurona',
  content: 'Grupo de enfermedades que afectan selectivamente las motoneuronas superiores (UMN) y/o inferiores (LMN). La ELA es la más frecuente e importante. El electrodiagnóstico es fundamental para confirmar la extensión de la afectación LMN y el diagnóstico diferencial.',
  clinicalPearls: [
    'En todas las enfermedades de motoneurona, las NCS sensitivas son NORMALES. Si los SNAPs están reducidos, el diagnóstico no es enfermedad de motoneurona pura — buscar otra explicación (neuropatía coexistente, Kennedy, CIDP).',
  ],
  children: [
    {
      id: 'als',
      title: 'Esclerosis Lateral Amiotrófica (ELA)',
      children: [
        {
          id: 'gold-coast',
          title: 'Criterios Gold Coast 2019',
          content: `Los criterios Gold Coast simplifican significativamente el diagnóstico eliminando las categorías \"posible\" y \"probable\" de El Escorial/Awaji.

**Criterios Gold Coast 2019:**
Se requiere:
1. **Disfunción progresiva de UMN O LMN** documentada por historia clínica o examen repetido.
2. **Evidencia de afectación de UMN y LMN en al menos 1 región corporal** (bulbar, cervical, torácica, lumbosacra) O **evidencia de LMN en al menos 2 regiones** (sin requerir UMN).
3. **Exclusión de diagnósticos alternativos** (investigaciones apropiadas: NCS, imagen, laboratorio).

**Contribución del EMG al criterio LMN:**
Equivalentes electrodiagnósticos de denervación activa:
• Fibrilaciones y ondas positivas agudas (PSW).
• Fasciculaciones COMPLEJAS (polifásicas, inestables) = equivalentes a fibrilaciones según Awaji y Gold Coast.
• PUMs neurogénicos crónicos (amplitud y duración aumentadas, polifásicos) con reclutamiento reducido.

**Las 4 regiones corporales (para distribución LMN):**
1. Bulbar: lengua, músculos faciales, masetero.
2. Cervical: músculos del brazo/mano (C5-T1).
3. Torácica: paraespinales torácicos, abdominales, diafragma.
4. Lumbosacra: músculos de la pierna/pie (L2-S2).`,
          clinicalPearls: [
            'CAMBIO CLAVE de Gold Coast: ya no se requiere demostrar UMN + LMN simultáneamente. LMN en 2+ regiones es suficiente si los diagnósticos alternativos están excluidos. Esto permite diagnóstico más temprano.',
            'Las fasciculaciones COMPLEJAS (largas duración, polifásicas, inestables) son equivalentes a fibrilaciones para el diagnóstico de ELA. No todas las fasciculaciones son iguales — las fasciculaciones benignas son simples, estables y monofásicas.',
          ],
          keyPoints: [
            'Gold Coast 2019: simplifica a UMN+LMN en ≥1 región O LMN en ≥2 regiones.',
            'Fasciculaciones complejas = equivalentes a fibrilaciones.',
            'Las NCS sensitivas DEBEN ser normales.',
          ],
        },
        {
          id: 'als-emg-role',
          title: 'Tríada EMG Diagnóstica y Split Hand',
          content: `**Tríada EMG en ELA:**
1. **Denervación activa:** Fibrilaciones, PSW, fasciculaciones complejas.
2. **PUMs neurogénicos crónicos:** Amplitud aumentada (>5-8 mV), duración prolongada (>15-20 ms), polifásicos. Resultado de reinervación colateral (las motoneuronas sobrevivientes adoptan fibras huérfanas).
3. **Reclutamiento reducido con firing rate alto:** Menos unidades motoras disponibles, pero las restantes disparan a alta frecuencia (>15-20 Hz) para compensar. \"Reduced recruitment with rapid firing.\"

**Concepto de Split Hand (mano dividida):**
Atrofia preferente del APB (mediano) y FDI (ulnar) con preservación relativa del ADM (ulnar). El índice de Split Hand (APBcmap/ADMcmap) está reducido. Este patrón es relativamente específico de ELA y no se ve en neuropatía ulnar o STC.

**Split Leg (pierna dividida):**
Debilidad preferente del tibial anterior (dorsiflexión) comparado con gastrocnemio medial (plantiflexión). CMAP peroneo desproporcionadamente reducido comparado con tibial.

**Protocolo EMG para ELA:**
Evaluar ≥3 de las 4 regiones. Mínimo: lengua (bulbar) + deltoides/bíceps/FDI (cervical) + paraespinales torácicos (torácica) + tibial anterior/gastrocnemio (lumbosacra).`,
          clinicalPearls: [
            'Split Hand: APB atrofiado + FDI atrofiado con ADM preservado = patrón sugestivo de ELA. En neuropatía ulnar pura, el ADM estaría afectado junto con FDI.',
            'La LENGUA es un músculo clave para confirmar afectación bulbar. Las fibrilaciones en lengua son difíciles de evaluar por los artefactos de movimiento, pero las fasciculaciones son fácilmente visibles (además del ultrasonido lingual que las puede cuantificar).',
          ],
        },
        {
          id: 'als-differential',
          title: 'Diagnósticos Diferenciales Críticos (Mimics)',
          content: `**Tabla de ALS Mimics:**

| Diagnóstico | Pista diferencial clave | Estudio confirmatorio |
|---|---|---|
| NMM | Bloqueos de conducción motores + anti-GM1 | NCS con estimulación proximal |
| Kennedy | SNAPs REDUCIDOS + ginecomastia | Expansión trinucleotide CAG AR |
| CIDP | Desmielinización + proteínas LCR elevadas | Criterios EAN/PNS + LCR |
| Mielopatía cervical | Solo UMN sin LMN distal | MRI cervical |
| IBM | Patrón mixto pero debilidad selectiva cuádriceps/flexores dedos | Biopsia muscular |
| Atrofia muscular espinal | Solo LMN sin UMN + genética | Deleción SMN1 |
| Mononeuritis múltiplex | Distribución por nervios individuales + dolor | SNAPs anormales + biopsia |
| Fasciculaciones benignas | Sin denervación activa, sin debilidad, SIN progresión | EMG normal excepto fasciculaciones |

**SIEMPRE antes de diagnosticar ELA:**
1. NCS motoras completas con estimulación proximal (descartar NMM).
2. NCS sensitivas completas (deben ser normales; si no → no es ELA pura).
3. MRI de columna cervical/lumbar (descartar mielopatía/poliradiculopatía).
4. Anti-GM1 IgM (descartar NMM).
5. Considerar Kennedy si SNAPs reducidos + varón + ginecomastia.`,
          clinicalPearls: [
            'El error más devastador: diagnosticar ELA cuando es NMM. NMM es tratable con IVIg con excelente respuesta. SIEMPRE buscar bloqueos de conducción antes de diagnosticar ELA.',
            'Síndrome de fasciculaciones benignas: fasciculaciones difusas SIN debilidad, SIN atrofia, SIN fibrilaciones en EMG, SIN progresión en ≥12 meses. Es benigno pero causa ansiedad extrema. Tranquilizar al paciente.',
          ],
        },
      ],
    },
    {
      id: 'kennedy',
      title: 'Enfermedad de Kennedy (Atrofia Muscular Bulboespinal)',
      content: `Enfermedad de motoneurona X-linked recesiva por expansión de repeticiones CAG en el gen del receptor de andrógenos. Solo afecta varones.

**Tríada clínica:** Debilidad proximal + atrofia muscular + ginecomastia + fasciculaciones periorales.

**Hallazgo EDX diferencial con ELA:**
• SNAPs DIFUSAMENTE REDUCIDOS o AUSENTES — esto NO ocurre en ELA. Es la pista diagnóstica electrodiagnóstica más importante.
• CMAPs reducidos (componente LMN).
• EMG: denervación crónica neurógena + fasciculaciones.
• NCS: VCM normales.

**¿Por qué SNAPs reducidos en enfermedad de motoneurona?**
Porque la expansión de poliglutamina daña también los cuerpos celulares del GRD (ganglioneuropatía sensitiva asociada), además de las motoneuronas del asta anterior.

**Curso:** Lentamente progresiva (décadas). La expectativa de vida es MUCHO mejor que ELA (supervivencia normal o solo levemente reducida).`,
      clinicalPearls: [
        'Varón con debilidad proximal + fasciculaciones + ginecomastia + SNAPs REDUCIDOS = Kennedy, no ELA. Solicitar expansión CAG del receptor de andrógenos (>36 repeticiones es diagnóstico).',
        'Kennedy progresa MUY lentamente comparado con ELA. Si un paciente ha tenido debilidad muscular progresiva por >4-5 años con SNAPs reducidos y sigue ambulatorio, Kennedy es mucho más probable que ELA.',
      ],
    },
    {
      id: 'sma',
      title: 'Atrofia Muscular Espinal (AME)',
      content: `Degeneración selectiva de motoneuronas del asta anterior por deleción homocigota del gen SMN1 (autosómica recesiva). Ahora TRATABLE con nusinersén (Spinraza), onasemnogene (Zolgensma) y risdiplam.

**Tipos y hallazgos EDX:**

| Tipo | Edad inicio | Mejor hito motor | EMG |
|---|---|---|---|
| I (Werdnig-Hoffmann) | 0-6 meses | Nunca se sienta | Denervación severa difusa, PUMs gigantes |
| II | 6-18 meses | Se sienta, no camina | Denervación moderada, reclutamiento reducido |
| III (Kugelberg-Welander) | >18 meses | Camina (puede perder) | Denervación crónica, PUMs neurogénicos |
| IV | Adulto | Camina | Denervación leve, PUMs neurogénicos |

**Hallazgos EDX constantes:**
• SNAPs NORMALES (enfermedad de motoneurona pura).
• CMAPs pueden estar reducidos (pérdida de motoneuronas).
• EMG: PUMs gigantes hiper-neurogénicos por reinervación colateral masiva. Reclutamiento marcadamente reducido.
• VCM normales.`,
      clinicalPearls: [
        'Con la era de las terapias génicas (Zolgensma) y antisentido (Spinraza), el diagnóstico temprano de AME por screening neonatal ha cambiado el pronóstico radicalmente. Los bebés tratados antes de los síntomas pueden alcanzar hitos motores normales.',
        'AME tipo IV (adulto): puede simular una miopatía proximal leve. La EMG con PUMs gigantes neurogénicos la diferencia de miopatías.',
      ],
    },
    {
      id: 'hirayama',
      title: 'Enfermedad de Hirayama (Amiotrofia Monomélica)',
      content: `Mielopatía cervical flexional benigna que afecta a varones jóvenes (15-25 años), predominantemente asiáticos.

**Presentación:** Atrofia y debilidad UNILATERAL de músculos intrínsecos de la mano y antebrazo (C7-T1). Se estabiliza espontáneamente en 2-5 años.

**Hallazgos EDX:**
• SNAPs: NORMALES (la lesión es en asta anterior/mielopática, preganglionar).
• CMAPs: reducidos en nervios mediano (APB) y ulnar (FDI, ADM) ipsilaterales.
• EMG: denervación activa en músculos C7-T1 ipsilaterales. Los músculos C5-C6 (deltoides, bíceps) están respetados.
• Importante: la denervación está LIMITADA a una extremidad y NO progresa a otras regiones (a diferencia de ELA).

**Diagnóstico:** MRI cervical con flexión del cuello muestra desplazamiento anterior de la duramadre posterior con compresión del asta anterior.`,
      clinicalPearls: [
        'Varón joven con atrofia unilateral de mano sin progresión a otra extremidad tras 2-3 años de seguimiento = Hirayama, no ELA. La clave: autolimitación y distribución estrictamente unilateral C7-T1.',
        'MRI EN FLEXIÓN CERVICAL es el estudio diagnóstico clave. La MRI en posición neutral puede ser normal. Solicitar específicamente MRI con el cuello en flexión.',
      ],
    },
    {
      id: 'post-polio',
      title: 'Síndrome Post-Polio',
      content: `Nueva debilidad, fatiga y atrofia que aparece 15-40 años después de poliomielitis aguda en músculos previamente afectados y/o contiguos.

**Hallazgos EDX:**
• SNAPs: normales (la polio afecta solo motoneuronas del asta anterior).
• CMAPs: reducidos en músculos afectados.
• EMG crónico residual: PUMs gigantes (reinervación colateral de décadas). Polifásicos inestables.
• EMG de nueva denervación: fibrilaciones/PSW en músculos afectados que indican pérdida continua de motoneuronas sobrecargadas.
• Contraste: los PUMs son ENORMES (por la reinervación previa masiva) pero el reclutamiento está marcadamente reducido.

**Fisiopatología:** Las motoneuronas sobrevivientes adoptaron enormes territorios de fibras musculares durante la reinervación post-polio. Décadas después, estas motoneuronas sobrecargadas comienzan a fallar por estrés metabólico.`,
      clinicalPearls: [
        'PUM gigantes (10-20 mV, 30+ ms de duración) con fibrilaciones nuevas en paciente con antecedente de polio = síndrome post-polio. Los PUMs son los más grandes que verás en electromiografía.',
      ],
    },
  ],
};

// ═══════════════════════════════════════════════════════════════
// SECTION 7: TRASTORNOS DE LA UNIÓN NEUROMUSCULAR
// ═══════════════════════════════════════════════════════════════
export const nmjDisorders: Topic = {
  id: 'nmj-disorders',
  title: 'Trastornos de la Unión Neuromuscular (UNM)',
  content: 'Los trastornos de la UNM afectan la transmisión entre el terminal nervioso presináptico y la placa motora muscular postsináptica. Las NCS de rutina son generalmente normales. Se requieren técnicas especializadas: Estimulación Nerviosa Repetitiva (ENR/RNS) y Electromiografía de Fibra Única (SFEMG).',
  children: [
    {
      id: 'myasthenia',
      title: 'Miastenia Gravis (MG)',
      children: [
        {
          id: 'mg-rns',
          title: 'Estimulación Nerviosa Repetitiva (ENR/RNS)',
          content: `**Protocolo estándar:**
1. Temperatura de la extremidad > 32°C (35°C ideal). El frío MEJORA la transmisión y puede causar FALSOS NEGATIVOS.
2. Seleccionar nervio/músculo: nasalis (facial — mayor sensibilidad en MG ocular), trapecio (accesorio espinal), ADM (ulnar — menor sensibilidad pero más reproducible).
3. Estimulación supramáxima a 2-3 Hz, series de 10 estímulos.
4. Medir decremento entre el 1er y el 4to/5to CMAP.

**Decremento significativo: > 10% entre el 1er y el 4-5to potencial.**
Patrón de \"silla de montar\" (U-shape): caída progresiva del 1ero al 4to-5to, luego leve recuperación al 9no-10mo (por movilización de calcio).

**Sensibilidad por músculo (MG generalizada):**
• Nasalis (facial): ~70-80%
• Trapecio (accesorio): ~60-70%
• ADM (ulnar): ~50-60%
• Hipotenar combinado: ~40%

**Posible potenciación post-ejercicio:**
Tras 10 segundos de contracción máxima voluntaria → repetir ENR inmediatamente. El CMAP puede AUMENTAR (facilitación post-activación) seguido de fatiga post-ejercicio a los 2-5 minutos (reparación/agotamiento).

**Efecto de medicamentos:**
Suspender inhibidores de AChE (piridostigmina) 12-24 horas antes del estudio si es posible (pueden enmascarar el decremento).`,
          clinicalPearls: [
            'EMG nasalis: SIEMPRE incluirlo si sospechas MG ocular. Los músculos distales de extremidades (ADM, APB) suelen estar normales en MG puramente ocular. El nasalis tiene la mayor sensibilidad para formas oculares.',
            'TEMPERATURA: el ERROR más común. Si el músculo está frío (<32°C), la transmisión neuromuscular MEJORA y puede no haber decremento. Calentar SIEMPRE antes del estudio.',
            'Decremento en RNS a 2-3 Hz: el patrón es postsináptico (MG). Si hay INCREMENTO a alta frecuencia (20-50 Hz) es presináptico (LEMS). NUNCA inicies con estimulación rápida — puede causar dolor innecesario.',
          ],
        },
        {
          id: 'mg-sfemg',
          title: 'SFEMG — Electromiografía de Fibra Única',
          content: `**Principio:** Mide la variabilidad temporal (jitter) de la transmisión neuromuscular en pares de fibras musculares de la misma unidad motora.

**Jitter:** Variación en el intervalo interpotencial entre disparos consecutivos. Normal: 20-50 μs (varía por músculo y edad). Jitter aumentado (>55 μs en extensor común de dedos) = transmisión neuromuscular defectuosa.

**Blocking:** Cuando el jitter es tan severo que un potencial de fibra NO aparece intermitentemente. Es el grado máximo de disfunción de la UNM.

**Sensibilidad:**
• MG generalizada: >95% (la prueba MÁS sensible para MG).
• MG ocular: >90% si se evalúa orbicular oculi o frontal.
• RNS positivo: ~60-70% en MG generalizada.
→ SFEMG es significativamente más sensible que RNS.

**Técnica:**
• Aguja de fibra única (25 μm de diámetro) o aguja concéntrica con filtro de pasa-altos.
• Evaluar ≥20 pares de fibras en cada músculo.
• Jitter aumentado en >10% de los pares (≥2/20) = anormal.

**Especificidad:** Moderada. El jitter aumentado ocurre en cualquier trastorno que afecte la UNM, incluyendo denervación (reinervación reciente tiene UNM inmaduras). Por esto, primero descartar neuropatía/miopatía con NCS/EMG convencionales ANTES de interpretar SFEMG.`,
          clinicalPearls: [
            'SFEMG es la prueba MÁS SENSIBLE para MG (>95%). Si el SFEMG es NORMAL en un músculo clínicamente débil, se puede descartar MG en ese músculo con alta confianza.',
            'SFEMG NO es específica de MG. El jitter aumentado también ocurre en ELA, miopatía, neuropatía (por reinervación colateral). Siempre hacer NCS/EMG convencionales PRIMERO para excluir estas causas.',
          ],
        },
        {
          id: 'mg-subtypes',
          title: 'Subtipos de MG: AChR vs MuSK',
          content: `**MG con anticuerpos anti-AChR (85%):**
• Típica: debilidad fluctuante, predominio ocular → generalizada.
• RNS: decremento postsináptico clásico a 2-3 Hz.
• SFEMG: jitter aumentado.
• Tratamiento: piridostigmina, IVIg, corticoides, inmunosupresores, timectomía.

**MG con anticuerpos anti-MuSK (5-8%):**
• Predominio bulbar y facial (disartria, disfagia, debilidad facial). Puede haber atrofia muscular.
• RNS: puede ser normal en extremidades distales; probar músculos FACIALES y trapecio.
• EMG: puede mostrar patrón MIOPÁTICO (atrofia muscular por MuSK) — confunde con miopatía.
• SFEMG: jitter marcadamente aumentado.
• Tratamiento: NO responde bien a piridostigmina (puede empeorar). Rituximab es primera línea.

**MG seronegativa (anti-LRP4 u otros):**
• 5-10%. Clínica similar a anti-AChR pero anticuerpos convencionales negativos.
• EDX idéntico a anti-AChR.

| | Anti-AChR | Anti-MuSK |
|---|---|---|
| Predominio | Ocular → generalizado | Bulbar/facial |
| Atrofia | Rara | FRECUENTE (facial, lingual) |
| RNS en extremidades | Frecuentemente positivo | Puede ser negativo |
| Piridostigmina | Buena respuesta | Pobre/empeora |
| Timectomía | Beneficiosa | NO indicada |
| Tratamiento inmunosupresor | Corticoides/AZA | RITUXIMAB |`,
          clinicalPearls: [
            'MG anti-MuSK: cara atrófica + debilidad bulbar + RNS normal en manos + no responde a piridostigmina = solicitar anti-MuSK. EL tratamiento es RITUXIMAB, no timectomía.',
            'Si la RNS es negativa en manos pero la sospecha clínica es alta: evaluar nasalis (facial) y trapecio (accesorio). Los músculos proximales y craneales son más sensibles.',
          ],
        },
      ],
    },
    {
      id: 'lems',
      title: 'Síndrome de Lambert-Eaton (LEMS)',
      content: 'Trastorno presináptico autoinmune contra canales de calcio voltaje-dependientes (VGCC) del terminal nervioso. 60% paraneoplásico (carcinoma pulmonar de células pequeñas).',
      children: [
        {
          id: 'lems-rns',
          title: 'Protocolo EDX: Facilitación Post-Ejercicio',
          content: `**Hallazgos NCS basales:**
• CMAPs con amplitudes BASE muy reducidas en TODOS los nervios (típicamente <50% LIN difusamente). Esto es la pista: CMAPs difusamente bajos SIN proporción con la debilidad clínica.
• SNAPs: normales.
• VCM: normales.

**RNS a baja frecuencia (2-3 Hz):**
Decremento > 10% (similar a MG) — NO diferencia LEMS de MG.

**Facilitación post-ejercicio (la prueba diagnóstica clave):**
1. Registrar CMAP basal (bajo).
2. Paciente realiza contracción voluntaria máxima del músculo durante 10-15 segundos.
3. Inmediatamente después, registrar CMAP.
4. **INCREMENTO > 100% (frecuentemente 200-400%)** del CMAP basal = DIAGNÓSTICO de trastorno presináptico.

**RNS a alta frecuencia (20-50 Hz):**
Incremento progresivo del CMAP (opuesto a MG). Pero es MUY doloroso — la facilitación post-ejercicio es preferida.

**Mecanismo:** En LEMS, los canales de calcio del terminal nervioso están bloqueados por anticuerpos. Durante el ejercicio intenso, el calcio residual se acumula progresivamente, restaurando transitoriamente la liberación de acetilcolina.`,
          clinicalPearls: [
            'CMAPs difusamente BAJOS en todos los nervios + facilitación post-ejercicio >100% = LEMS. Es la combinación diagnóstica patognomónica.',
            'LEMS + cáncer: SIEMPRE buscar carcinoma pulmonar de células pequeñas (TC tórax, PET-CT). El 60% de LEMS es paraneoplásico. El diagnóstico de LEMS puede PRECEDER al diagnóstico del cáncer por meses.',
            'Anticuerpos anti-VGCC (P/Q tipo): positivos en >95% de LEMS paraneoplásico y ~85% de LEMS autoinmune.',
          ],
        },
      ],
    },
    {
      id: 'botulism',
      title: 'Botulismo',
      content: `Bloqueo presináptico de la liberación de acetilcolina por toxina botulínica (C. botulinum). Afecta canales SNARE del terminal nervioso.

**Hallazgos EDX (similares a LEMS):**
• CMAPs basales MUY reducidos difusamente.
• RNS a 2-3 Hz: decremento (similar a MG/LEMS).
• Facilitación post-ejercicio: incremento presente pero generalmente MENOR que en LEMS (20-100%, rara vez >200%).
• SFEMG: jitter aumentado + blocking.
• EMG: fibrilaciones difusas (\"denervación química\" por desconexión funcional de la UNM).

**Diferencias con LEMS:**
| | Botulismo | LEMS |
|---|---|---|
| Inicio | Agudo (horas-días) | Subagudo-crónico |
| Pupilas | Dilatadas fijas (parasimpático) | Normales o levemente reactivas |
| Facilitación | Menor (20-100%) | Mayor (>100-400%) |
| BSAPs | Presentes | Ausentes |
| Curso | Resolución en semanas | Crónico |

**BSAPs (Brief Small Abundant Potentials):**
PUMs diminutos, de duración breve y alta frecuencia de disparo, vistos en botulismo y toxicidad por organofosforados. Representan fibras musculares individuales disparando asincrónicamente.`,
      clinicalPearls: [
        'Cuadro agudo de debilidad descendente (craneal → extremidades) + pupilas dilatadas fijas + disfagia/disartria + CMAPs bajos difusos = BOTULISMO hasta probar lo contrario. EMERGENCIA — avisar a toxicología y salud pública.',
        'Botulismo infantil (\"floppy baby\"): hipotonía aguda + constipación + debilidad + pobre succión en lactante. Fuente habitual: miel contaminada.',
      ],
    },
    {
      id: 'congenital-myasthenic',
      title: 'Síndromes Miasténicos Congénitos (SMC)',
      content: `Grupo de trastornos genéticos de la UNM — NO autoinmunes (anticuerpos negativos).

**Tipos principales:**
• **Presinápticos (CHAT, etc.):** Defecto en síntesis/liberación de ACh. RNS con decremento. Pueden empeorar con anticolinesterásicos.
• **Sinápticos (deficiencia de AChE):** Defecto en la enzima. Los CMAPs tienen respuesta repetitiva (CMAP doble — \"repetitive CMAP\") con estímulo único. Piridostigmina contraindicada.
• **Postsinápticos (CHRNE, RAPSN, DOK7):** Los más frecuentes. Defecto en subunidades del receptor AChR o proteínas de agrupamiento. RNS con decremento similar a MG autoinmune.

**Hallazgo EDX clave — CMAP repetitivo:**
Un SOLO estímulo nervioso produce 2 CMAPs (el segundo 5-10 ms después). Esto es PATOGNOMÓNICO de deficiencia de AChE sináptica o síndrome de canal lento.

**Sospecha clínica:** Debilidad fluctuante desde la infancia + anticuerpos AChR/MuSK NEGATIVOS + historia familiar positiva.`,
      clinicalPearls: [
        'CMAP repetitivo (doble respuesta con estímulo único): este hallazgo es PATOGNOMÓNICO de SMC por deficiencia de AChE o síndrome de canal lento. Si lo ves en un paciente joven con debilidad fluctuante y anticuerpos negativos, es SMC.',
        'En SMC por deficiencia de AChE: la piridostigmina está CONTRAINDICADA (empeora la enfermedad). El tratamiento es efedrino/salbutamol.',
      ],
    },
  ],
};

// ═══════════════════════════════════════════════════════════════
// SECTION 8: MIOPATÍAS
// ═══════════════════════════════════════════════════════════════
export const myopathies: Topic = {
  id: 'myopathies',
  title: 'Miopatías',
  content: 'Las miopatías afectan primariamente las fibras musculares. El patrón electrodiagnóstico clásico es: NCS motoras y sensitivas NORMALES + EMG con PUMs miopáticos (cortos, polifásicos, de baja amplitud) con reclutamiento temprano. Las miopatías inflamatorias son las más frecuentemente evaluadas en el laboratorio EDX.',
  clinicalPearls: [
    'TRÍADA MIOPÁTICA en EMG: 1) PUMs cortos, polifásicos, baja amplitud. 2) Reclutamiento temprano (muchas unidades para poca fuerza). 3) Fibrilaciones/PSW SI hay necrosis muscular activa (miopatías inflamatorias, distrofias avanzadas).',
    'Las NCS (motoras y sensitivas) son NORMALES en miopatías puras. Si los SNAPs están reducidos, buscar neuropatía coexistente.',
  ],
  children: [
    {
      id: 'inflammatory-myopathies',
      title: 'Miopatías Inflamatorias (PM, DM, NAM/IMNM)',
      content: `**Polimiositis (PM):**
• Debilidad proximal simétrica subaguda + CK elevada (5-50x).
• EMG: fibrilaciones/PSW profusas (necrosis activa) + PUMs miopáticos + reclutamiento temprano. La \"irritabilidad\" eléctrica es prominente.
• NCS: normales.

**Dermatomiositis (DM):**
• Similar a PM pero con rash heliotropo y pápulas de Gottron.
• EMG: idéntica a PM. No diferencia DM de PM.
• Asociación paraneoplásica en adultos >40 años (buscar neoplasia).

**Miopatía Necrotizante Autoinmune (NAM/IMNM):**
• Anti-SRP o anti-HMGCR (asociada a estatinas).
• CK muy elevada (10-100x).
• EMG: necrosis severa (fibrilaciones profusas) con PUMs miopáticos. Puede tener componente neurogénico en estadios avanzados.
• Pistas: debilidad severa rápidamente progresiva + CK muy alta + asociación a estatinas (anti-HMGCR).
• Tratamiento: inmunosupresión agresiva (IVIg + corticoides + rituximab).

**EMG en miopatía inflamatoria — qué buscar:**
| Hallazgo | Significado |
|---|---|
| Fibrilaciones/PSW | Necrosis muscular ACTIVA (inflamación activa) |
| PUMs miopáticos | Daño muscular crónico |
| Reclutamiento temprano | Patrón miopático clásico |
| Distribución proximal | Típica de miopatía inflamatoria |`,
      clinicalPearls: [
        'Las fibrilaciones en miopatía NO significan denervación (no hay daño nervioso). Significan NECROSIS muscular — las fibras musculares necróticas se desconectan eléctricamente y generan potenciales espontáneos.',
        'NAM por estatinas (anti-HMGCR): el CK no mejora al suspender la estatina (a diferencia de la miotoxicidad por estatinas simple). Requiere inmunosupresión porque es autoinmune, no tóxica.',
        'La distribución proximal (deltoides, cuádriceps, iliopsoas) es clave. Si la debilidad es distal, considerar IBM o distrofia miotónica, no PM/DM.',
      ],
    },
    {
      id: 'ibm',
      title: 'Miositis por Cuerpos de Inclusión (IBM)',
      content: `La miopatía inflamatoria más frecuente en >50 años. Patrón clínico ÚNICO: debilidad selectiva de cuádriceps y flexores de dedos.

**Patrón EMG \"MIXTO\" — el gran confusor:**
• PUMs miopáticos (cortos, polifásicos) coexisten con PUMs neurogénicos gigantes (largos, alta amplitud).
• Fibrilaciones presentes (necrosis activa).
• El patrón mixto simula ELA o neuropatía + miopatía coexistentes.

**¿Por qué patrón mixto?**
La IBM combina inflamación muscular (→ PUMs miopáticos) con inclusiones proteicas que causan remodelamiento de la unidad motora (→ PUMs grandes). NO es denervación verdadera por daño nervioso.

**Criterios diagnósticos (ENMC 2011):**
• Clínico: debilidad de cuádriceps ≥ flexores de cadera + debilidad de flexores de dedos > extensores.
• Laboratorio: CK moderadamente elevada (1-15x).
• Biopsia: invasión de fibras no necróticas por linfocitos CD8+ + vacuolas ribeteadas + inclusiones amiloides.
• Anti-cN1A (anti-Mup44): anticuerpo específico de IBM (sensibilidad ~50%).

**Tratamiento:** NO hay tratamiento efectivo. Refractaria a corticoides e IVIg (a diferencia de PM/DM). Fisioterapia y manejo de caídas.`,
      clinicalPearls: [
        'Debilidad de cuádriceps + debilidad de flexores de dedos en >50 años + patrón EMG mixto + refractario a inmunosupresión = IBM. Es la ÚNICA miopatía inflamatoria que no responde a tratamiento.',
        'La pista clínica: preguntar si el paciente tiene dificultad para abrocharse botones (flexores de dedos) y subir escaleras (cuádriceps). Esta combinación es casi patognomónica de IBM.',
      ],
    },
    {
      id: 'muscular-dystrophies',
      title: 'Distrofias Musculares',
      content: `**Duchenne/Becker (distrofinopatías):**
• Duchenne: ausencia de distrofina. Inicio 2-5 años. CK masivamente elevada (50-200x). EMG: patrón miopático con fibrilaciones (necrosis temprana).
• Becker: distrofina reducida/anormal. Inicio más tardío, curso más lento.

**Distrofia Miotónica tipo 1 (DM1 — Enfermedad de Steinert):**
• Expansión CTG del gen DMPK. El trastorno miotónico más frecuente.
• **Fenómeno miotónico en EMG:** Descargas miotónicas — salvas de potenciales que AUMENTAN y DISMINUYEN en frecuencia y amplitud, produciendo el sonido característico de \"bombardero en picada\" o \"motocicleta acelerando/desacelerando\".' Las descargas miotónicas son PATOGNOMÓNICAS.
• PUMs miopáticos concomitantes (debilidad real + miotonía).
• Distribución: debilidad temporal/facial (ptosis, cara miopática) + distal de MS.

**DM2 (PROMM — Ricker):**
• Expansión CCTG del gen CNBP.
• Similar a DM1 pero predominio PROXIMAL (no distal).
• Miotonía más leve y menos consistente en EMG.

**Distrofia Facioescapulohumeral (FSHD):**
• Debilidad facial + escapular (escápula alada) + humeral.
• EMG: patrón miopático en distribución facial/escapular.
• Asimetría frecuente.

**Distrofias de Cinturas (LGMD):**
• Múltiples subtipos (>30). Debilidad proximal simétrica.
• EMG: miopático inespecífico. Diagnóstico por genética/biopsia.`,
      clinicalPearls: [
        'Descargas miotónicas en EMG (\"bombardero en picada\") = miotonía eléctrica. Se ve en DM1, DM2, miotonía congénita, paramiotonía. Si NO hay descargas miotónicas pero hay miotonía clínica (dificultad para soltar la mano), considerar miotonía de canales de sodio (las descargas pueden ser sutiles).',
        'DM1 vs DM2: DM1 es DISTAL (manos, pies) + facial. DM2 es PROXIMAL (caderas, muslos). Si la debilidad es proximal con miotonía, piensa en DM2.',
      ],
    },
    {
      id: 'channelopathies',
      title: 'Canalopatías Musculares y Parálisis Periódicas',
      content: `**Tests de ejercicio electrofisiológicos:**

**1. Short Exercise Test (SET):**
• Contracción isométrica máxima 10 s → registrar CMAP inmediato + cada minuto × 5 min. Repetir 3 veces.
• Variante con enfriamiento para paramiotonía.
• Patrón paramiotónico/miotónico de Na+: caída transitoria inmediata post-ejercicio que se recupera.
• Patrón miotónico de Cl−: caída progresiva con ejercicio repetido.

**2. Long Exercise Test (McManis):**
• Contracción isométrica máxima 5 min con registro de CMAP cada 1 min durante ejercicio + cada 2 min × 45 min post-ejercicio.
• Patrón de parálisis periódica: caída progresiva del CMAP > 40% a los 20-40 min post-ejercicio (por inexcitabilidad muscular durante ataque subclínico inducido).

**Parálisis Periódica Hipopotasémica (HypoPP):**
• Canal Ca2+ (CACNA1S) o Na+ (SCN4A).
• Ataques de debilidad con K+ sérico bajo.
• McManis: decremento tardío >40%.

**Parálisis Periódica Hiperpotasémica (HyperPP):**
• Canal Na+ (SCN4A).
• Ataques de debilidad con K+ sérico alto/normal + miotonía.
• SET: caída inmediata post-ejercicio típica.
• McManis: decremento menos pronunciado que HypoPP.`,
      clinicalPearls: [
        'El Long Exercise Test (McManis) es la prueba EDX gold standard para parálisis periódicas. Un decremento tardío del CMAP >40% a los 20-45 min post-ejercicio es diagnóstico. Se realiza ENTRE ataques (el paciente no necesita estar paralítico).',
        'Miotonía clínica que EMPEORA con el frío = paramiotonía congénita (canal Na+). Miotonía que MEJORA con ejercicio repetido (\"warm-up\") = miotonía congénita de Cl− (Thomsen/Becker).',
      ],
    },
    {
      id: 'toxic-myopathies',
      title: 'Miopatías Tóxicas y Farmacológicas',
      content: `**Miopatía por estatinas:**
• Espectro: mialgias (30-40% de pacientes, CK normal) → miopatía (CK 3-10x con debilidad) → rabdomiólisis (raro, CK > 50x).
• EMG: en miopatía verdadera, patrón miopático + fibrilaciones si hay necrosis.
• Reversible al suspender el fármaco (a diferencia de NAM anti-HMGCR que no mejora al suspender).

**Miopatía esteroidea:**
• Debilidad proximal subaguda sin dolor, sin elevación de CK.
• EMG: puede ser NORMAL o mostrar PUMs miopáticos leves SIN fibrilaciones (no hay necrosis, hay atrofia de fibras tipo II).
• La EMG normal es una PISTA: CK normal + EMG normal en paciente con debilidad bajo corticoides = miopatía esteroidea.

**Miopatía por cloroquina/hidroxicloroquina:**
• Miopatía vacuolar. CK moderadamente elevada.
• EMG: PUMs miopáticos + fibrilaciones + descargas miotónicas (hallazgo inusual que sugiere miopatía vacuolar).
• Reversible al suspender.

**Miopatía por colchicina:**
• Rara, asociada a insuficiencia renal (acumulación).
• Patrón miopático con componente neuropático (puede causar neuropatía coexistente).`,
      clinicalPearls: [
        'Miopatía por estatinas vs NAM anti-HMGCR: la CLAVE es que la simple miotoxicidad por estatinas MEJORA al suspender el fármaco (CK normaliza en semanas). Si el CK NO mejora al suspender → solicitar anti-HMGCR, es autoinmune y requiere inmunosupresión.',
        'Miopatía esteroidea: CK NORMAL + EMG NORMAL o cuasi-normal + debilidad proximal bajo corticoides. La respuesta es REDUCIR la dosis, no agregar IVIg. Diferencia crucial con miopatía inflamatoria en exacerbación.',
      ],
    },
    {
      id: 'metabolic-myopathies',
      title: 'Miopatías Metabólicas',
      content: `**Enfermedad de McArdle (glucogenosis tipo V — miofosforilasa):**
• Intolerancia al ejercicio + mialgias + contracturas + rabdomiólisis recurrente.
• EMG en reposo: puede ser NORMAL o mostrar fibrilaciones (si hubo necrosis reciente por rabdomiólisis).
• Hallazgo clave: SILENCIO eléctrico durante las contracturas de McArdle (no son calambres — los calambres tienen actividad EMG; las contracturas de McArdle NO).
• Diagnóstico: test de isquemia del antebrazo (sin elevación de lactato con elevación normal de amoniaco).

**Enfermedad de Pompe (glucogenosis tipo II — maltasa ácida):**
• Forma infantil: hipotonía severa + cardiomiopatía.
• Forma tardía (adulto): debilidad proximal + insuficiencia respiratoria por debilidad diafragmática.
• EMG: miopático con fibrilaciones + descargas miotónicas en paraespinales y MI. Las descargas miotónicas en paraespinales de un paciente con debilidad proximal y respiratoria son la pista para Pompe.
• CK: moderadamente elevada (2-10x).
• Diagnóstico: actividad de maltasa ácida en sangre (DBS).

**Miopatías mitocondriales:**
• Heterogéneas clínicamente (PEO, MELAS, MERRF).
• EMG: miopático inespecífico.
• Biopsia muscular: fibras \"ragged red\" con tricrómico de Gomori.`,
      clinicalPearls: [
        'Descargas miotónicas en paraespinales + debilidad proximal + insuficiencia respiratoria desproporcionada = POMPE tardío. Solicitar ensayo de maltasa ácida (GAA) en sangre seca (DBS). ES TRATABLE con terapia de reemplazo enzimático (alglucosidasa alfa).',
        'Contractura de McArdle = silencio eléctrico. Calambre ordinario = actividad EMG intensa. Esta distinción es diagnóstica.',
      ],
    },
    {
      id: 'critical-illness',
      title: 'Polineuropatía y Miopatía del Paciente Crítico (CIP/CIM)',
      content: `La debilidad adquirida en la UCI se debe a Neuropatía del Paciente Crítico (CIP), Miopatía (CIM), o la superposición de ambas (Neuromiopatía NMEC). Típicamente ocurre tras sepsis severa, fallo multiorgánico o uso prolongado de corticoides + relajantes musculares.

El signo cardinal es la **falla persistente en el destete ventilatorio** por debilidad de musculatura respiratoria y extremidades (tetraparesia flácida y arreflexia).

**Diferenciación Neurofisiológica (CIP vs CIM):**

**1. Polineuropatía del Paciente Crítico (CIP)**
Es una axonopatía sensitivo-motora distal.
• **NCS:** CMAPs y SNAPs muy reducidos. Velocidades normales o poco lentas (axonal).
• **EMG:** Fibrilaciones/PSW abundantes distales + PUMs neurogénicos (grandes/polifásicos si es crónico) con reclutamiento disminuido.

**2. Miopatía del Paciente Crítico (CIM / MEC)**
Es un proceso miopático agudo (pérdida selectiva de filamentos de miosina).
• **NCS:** CMAPs disminuidos. **SNAPs NORMALES** (clave para diferenciar de CIP). Duración del CMAP muy prolongada (>8 ms distal).
• **EMG:** Fibrilaciones y PSW (por necrosis/segmentación de fibras). PUMs miopáticos (cortos, pequeños, muy polifásicos) con **reclutamiento precoz**.
• **Laboratorio:** CK sérica puede estar elevada.

**¿Por qué es importante diferenciarlas?**
Aunque la recuperación de ambas puede ser lenta, la CIM pura suele tener un pronóstico de recuperación más favorable a mediano plazo que la CIP severa, ya que el músculo se regenera más rápido que el largo proceso de reinervación axonal.`,
      clinicalPearls: [
        'En un paciente en la UCI con tetraparesia, el estudio de conducción SENSITIVO es tu mejor amigo. Si los SNAPs están abolidos, hay polineuropatía (CIP). Si los SNAPs están preservados pero el paciente no se mueve y el CMAP es bajo, es una miopatía (CIM) o un bloqueo neuromuscular residual.',
        'La duración del CMAP es marcadamente prolongada en CIM porque el potencial de acción se propaga lentamente por el sarcolema enfermo (pérdida de miosina). Este enlentecimiento intrínseco del músculo es una pista diagnóstica.'
      ],
    },
    {
      id: 'myopathic-vs-neurogenic',
      title: 'Resumen: PUM Miopático vs Neurogénico',
      content: `**Tabla comparativa completa:**

| Parámetro | PUM Miopático | PUM Neurogénico |
|---|---|---|
| Duración | CORTA (<8-10 ms) | LARGA (>15-20 ms) |
| Amplitud | BAJA (<0.3-0.5 mV) | ALTA (>5-8 mV) |
| Fases | Polifásico (>4 fases) | Polifásico (reinervación) o simple (crónico) |
| Reclutamiento | TEMPRANO (muchas unidades para poca fuerza) | REDUCIDO (pocas unidades con alta frecuencia) |
| Estabilidad | Inestable (neoformación de UNM) | Estable (reinervación madura) |
| Fibrilaciones | Solo si hay necrosis (PM, DM) | Denervación activa |
| Patrón de interferencia | LLENO pero de amplitud baja | Reducido pero de amplitud alta |

**¿Por qué el PUM es corto y bajo en miopatía?**
Porque las fibras musculares DENTRO de cada unidad motora están dañadas/destruidas. La unidad motora tiene menos fibras generadoras → menor amplitud y duración.

**¿Por qué el PUM es largo y alto en neuropatía?**
Porque la motoneurona vecina adopta (reinervación colateral) las fibras huérfanas de la unidad muerta, creando una \"super-unidad motora\" con muchas más fibras → mayor amplitud y duración.

**¿Por qué reclutamiento diferente?**
• Miopatía: cada unidad motora genera poca fuerza (pocas fibras funcionales) → el sistema nervioso recluta MUCHAS unidades para compensar = reclutamiento temprano.
• Neuropatía: hay POCAS unidades disponibles → las restantes disparan a alta frecuencia pero NO se pueden reclutar más = reclutamiento reducido.`,
      keyPoints: [
        'Miopático: PUM corto, bajo, polifásico + reclutamiento temprano.',
        'Neurogénico: PUM largo, alto, polifásico + reclutamiento reducido con rapid firing.',
        'IBM: patrón MIXTO (miopático + neurogénico) — el gran confusor.',
        'CIM (miopatía del enfermo crítico): PUMs miopáticos + fibrilaciones + CMAPs bajos con SNAPs normales.',
      ],
    },
  ],
};
