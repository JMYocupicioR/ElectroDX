// src/content/modules/module-09-pathologies-part2.ts
// Sections 2-3: Neuropatías Inflamatorias, Mononeuropatías
import { Topic } from '../../types/content';

// ═══════════════════════════════════════════════════════════════
// SECTION 2: NEUROPATÍAS INFLAMATORIAS
// ═══════════════════════════════════════════════════════════════
export const inflammatoryNeuropathies: Topic = {
  id: 'inflammatory-neuropathies',
  title: 'Neuropatías Inflamatorias',
  content: 'Grupo de neuropatías mediadas inmunológicamente que representan las causas TRATABLES más importantes en electrodiagnóstico. Su reconocimiento temprano cambia radicalmente el pronóstico. Incluyen formas agudas (GBS) y crónicas (CIDP, NMM).',
  clinicalPearls: [
    'Las neuropatías inflamatorias son las más importantes de diagnosticar porque son TRATABLES con inmunoterapia (IVIg, plasmaféresis, corticoides, rituximab). Un diagnóstico erróneo de \"neuropatía diabética\" o \"idiopática\" priva al paciente de tratamiento efectivo.',
  ],
  children: [
    {
      id: 'gbs',
      title: 'Síndrome de Guillain-Barré (SGB)',
      content: 'Polirradiculoneuropatía inflamatoria aguda. Causa más frecuente de parálisis flácida aguda en adultos. Incidencia: 1-2/100,000/año. Precedida por infección respiratoria o GI (Campylobacter, CMV, EBV, Zika) en 60-70% de casos.',
      clinicalPearls: [
        'El SGB es un ESPECTRO con múltiples variantes electrofisiológicas. No todos los GBS son desmielinizantes. Las NCS en la primera semana pueden ser normales o mostrar solo ausencia de ondas F. El estudio debe repetirse a las 2-3 semanas para clasificación definitiva.',
      ],
      children: [
        {
          id: 'aidp',
          title: 'AIDP (Polirradiculoneuropatía Desmielinizante Inflamatoria Aguda)',
          content: `Forma predominante en Norteamérica y Europa (85-90%).

**\"Sural Sparing Pattern\" (Patrón de Preservación Sural):**
Hallazgo temprano ALTAMENTE característico (presente en 50% de AIDP en la primera semana):
• SNAPs de mediano y/o ulnar ausentes o reducidos.
• SNAP sural NORMAL (paradójicamente preservado).
• Sensibilidad: 50%. Especificidad: >90% para GBS desmielinizante.

**Evolución temporal de hallazgos NCS:**

| Período | Hallazgos esperados |
|---|---|
| Día 1-3 | NCS pueden ser NORMALES. Solo ondas F ausentes/prolongadas en 50%. |
| Día 4-7 | Sural sparing. LMD prolongadas incipientes. Ondas F ausentes en >80%. |
| Semana 2-3 | Criterios desmielinizantes completos: LMD >150% LSN, VCM <70% LIN, bloqueos de conducción en 30-50%, dispersión temporal. |
| Semana 4+ | Si hay daño axonal secundario: CMAPs reducidos, fibrilaciones en EMG (mal pronóstico). |

**Criterios electrodiagnósticos de desmielinización en GBS (Hadden/Ho):**
≥1 nervio con cualquiera de:
• VCM < 90% LIN (si CMAP > 80% LIN) o < 85% LIN (si CMAP < 80% LIN).
• LMD > 110% LSN (si CMAP > 100% LIN) o > 120% LSN (si CMAP < 100% LIN).
• Onda F > 120% LSN.
• Bloqueo de conducción parcial: caída proximal/distal > 50% de amplitud (nervio motor, segmento largo).`,
          clinicalPearls: [
            'PRIMERA SEMANA: si las NCS son \"normales\" pero el paciente tiene debilidad ascendente aguda + arreflexia, NO descarta GBS. Las ondas F ausentes pueden ser el ÚNICO hallazgo temprano. Repetir NCS a los 10-14 días.',
            'El CMAP del nervio motor distal compuesto (dCMAP) en la primera semana predice pronóstico: dCMAP peroneo < 20% del LIN a los 3-7 días = alta probabilidad de daño axonal irreversible y recuperación incompleta.',
            'Sural sparing pattern: se explica porque en AIDP la desmielinización afecta preferentemente las raíces nerviosas (donde la barrera hemato-nerviosa es más permeable), y las raíces sensitivas dorsales son menos vulnerables que las ventrales motoras.',
          ],
          keyPoints: [
            'Forma más frecuente (85-90% en occidente). Desmielinizante.',
            'Sural sparing: SNAPs MS ausentes con sural normal — altamente específico.',
            'Ondas F ausentes: hallazgo más temprano (puede ser el único en día 1-3).',
            'CMAP distal < 20% LIN a la primera semana = mal pronóstico.',
          ],
        },
        {
          id: 'aman-amsan',
          title: 'AMAN y AMSAN (Variantes Axonales) y RCF',
          content: `**AMAN (Neuropatía Motora Axonal Aguda):**
Forma predominante en Asia y Latinoamérica. Asociada a anticuerpos IgG anti-GM1 y anti-GD1a.
• NCS: CMAPs reducidos o ausentes con velocidades normales y sin bloqueos. SNAPs NORMALES.
• EMG: Fibrilaciones profusas a las 2-3 semanas (daño axonal verdadero).
• Asociación muy fuerte con infección previa por Campylobacter jejuni.

**Falla de Conducción Reversible (RCF - Reversible Conduction Failure):**
Concepto fisiopatológico clave que representa una fase de transición en el espectro de neuropatías axonales agudas (AMAN).
• **Patogenia en el Nodo de Ranvier:** Los anticuerpos IgG anti-GM1/GD1a se unen al axolema del nodo de Ranvier (nodopatía). Esto activa la vía del complemento, disrumpiendo los grupos de canales de sodio (Nav) y despegando la mielina paranodal sin degeneración axonal distal.
• **Manifestación EDX inicial:** Al perderse el aislamiento y los canales de sodio, se interrumpe la corriente saltatoria. Esto simula perfectamente un **bloqueo de conducción desmielinizante** en las primeras dos semanas.
• **Recuperación Ultrarrápida:** Si la agresión se detiene antes del colapso del citoesqueleto, el axolema se repara en 2-5 semanas. El bloqueo desaparece, resultando en recuperación clínica rápida sin necesidad de una lenta remielinización (sin dispersión temporal prolongada).

**AMSAN (Neuropatía Axonal Sensitivo-Motora Aguda):**
La más severa. Daño axonal motor Y sensitivo.
• CMAPs y SNAPs ausentes o muy reducidos. Velocidades normales.
• Pronóstico muy pobre; recuperación extremadamente lenta.`,
          clinicalPearls: [
            'RCF (Falla de Conducción Reversible): Si en la semana 1 documentas un "bloqueo de conducción motor" que simula AIDP, pero al repetir el estudio en la semana 3 el bloqueo ha desaparecido completamente y el CMAP subió, NO era AIDP. Era una AMAN con RCF (nodopatía). La remielinización genuina tarda meses.',
            'Los estudios seriados (repetir NCS a las 2-4 semanas) son obligatorios para diferenciar entre AIDP (bloqueos persisten), RCF (bloqueos desaparecen rápido) y degeneración axonal (las amplitudes caen a su nadir).'
          ],
        },
        {
          id: 'fisher',
          title: 'Síndrome de Miller Fisher (MFS)',
          content: `Variante inmunomediada del SGB (80% presentan la tríada clásica).
Precedido comúnmente por infección respiratoria o GI.

**Tríada Clínica Clásica:**
• **Oftalmoplejía:** Parálisis extraocular bilateral/simétrica. Síntoma inicial suele ser diplopía. Puede haber oftalmoplejía interna aislada con pupilas tónicas.
• **Ataxia:** Grave, alteración severa de la marcha con fuerza motora conservada en extremidades.
• **Arreflexia:** Pérdida difusa de reflejos osteotendinosos.

**Biomarcador patogénico:**
• **Anticuerpos IgG anti-GQ1b:** Presentes en >85% (especificidad 100%).
• El gangliósido GQ1b se concentra en la mielina paranodal de nervios oculomotores (III, IV, VI), ganglios de la raíz dorsal (DRG) y terminales de los husos neuromusculares.

**Hallazgos EDX Claves:**
A diferencia del SGB clásico, las velocidades de conducción motora suelen ser NORMALES.
• **Ausencia temprana del Reflejo H:** Es el hallazgo más consistente en extremidades. Se pierde tempranamente por daño selectivo proximal a las fibras aferentes Ia mielinizadas (que expresan abundante GQ1b) que inervan el huso neuromuscular.
• **Afectación sensitiva selectiva:** SNAPs reducidos o ausentes (por ganglionopatía o daño axonal cerca del DRG) de forma desproporcionada a las VC distales.
• **Reflejo de parpadeo (Blink Reflex):** Latencias R1 y R2 prolongadas bilateralmente (disfunción de pares craneales).`,
          clinicalPearls: [
            'Anti-GQ1b es el biomarcador absoluto de MFS. Su diana fisiológica explica perfectamente por qué el paciente tiene arreflexia pero fuerza normal: ataca selectivamente a los husos neuromusculares y fibras aferentes Ia, no a las motoneuronas eferentes.',
            'La ausencia del reflejo H puede ser la única anomalía electrofisiológica detectable en las extremidades durante los primeros días del MFS.'
          ],
          keyPoints: [
            'Tríada: Oftalmoplejía + Ataxia + Arreflexia.',
            'Biomarcador: IgG Anti-GQ1b (100% específico).',
            'EDX Cardinal: Ausencia temprana del reflejo H con conducción motora y ondas F normales.'
          ],
        },
        {
          id: 'gbs-temporal',
          title: 'Evolución Temporal EDX y Algoritmo Diagnóstico',
          content: `**Protocolo EDX recomendado en sospecha de GBS:**

**Estudio inicial (día 1-7):**
• NCS motoras: mediano, ulnar, peroneo, tibial bilateral. Registrar LMD, VCM, amplitud CMAP, ondas F.
• NCS sensitivas: mediano, ulnar, sural bilateral.
• Buscar: sural sparing, ondas F ausentes, LMD prolongadas incipientes.

**Estudio de seguimiento (día 14-21):**
• Repetir protocolo completo.
• Clasificar: AIDP vs AMAN vs AMSAN vs inclasificable.
• Evaluar daño axonal secundario: CMAPs reducidos respecto al basal.

**Pronóstico por NCS:**
| Factor EDX | Pronóstico |
|---|---|
| CMAP peroneo distal > 20% LIN | Buena recuperación probable |
| CMAP peroneo distal < 20% LIN | Daño axonal severo, recuperación lenta |
| Fibrilaciones a las 3-4 semanas | Denervación axonal — meses de recuperación |
| Bloqueos sin pérdida axonal | Buen pronóstico (neuropraxia/desmielinización reversible) |`,
          keyPoints: [
            'Día 1-7: ondas F ausentes + sural sparing pueden ser los ÚNICOS hallazgos.',
            'Día 14-21: clasificación definitiva (AIDP vs AMAN vs AMSAN).',
            'CMAP peroneo distal < 20% LIN = predictor de mala recuperación.',
          ],
        },
      ],
    },
    {
      id: 'cidp',
      title: 'PDIC (CIDP — Polineuropatía Desmielinizante Inflamatoria Crónica)',
      content: 'Neuropatía desmielinizante crónica adquirida más importante. Curso >8 semanas (diferencia con GBS <4 semanas). TRATABLE con IVIg, corticoides, plasmaféresis.',
      children: [
        {
          id: 'ean-pns-criteria',
          title: 'Criterios Electrodiagnósticos EAN/PNS 2021',
          content: `Los criterios EAN/PNS 2021 han reemplazado a EFNS/PNS 2010. Son más restrictivos para evitar sobrediagnóstico.

**Criterios de desmielinización (en nervios MOTORES):**
Se requieren anomalías en ≥2 nervios motores (uno puede ser onda F):
• LMD ≥ 50% sobre LSN (≥ 30% si CMAP < 80% LIN).
• VCM ≤ 70% LIN.
• Latencia onda F ≥ 30% sobre LSN (≥ 50% si CMAP < 80% LIN).
• Bloqueo de conducción motor: ≥ 50% caída de amplitud proximal/distal (excluyendo sitios de atrapamiento habitual).
• Dispersión temporal: duración proximal ≥ 30% mayor que distal.

**Clasificación de certeza:**
• **CIDP Definitiva:** Criterios EDX en ≥2 nervios + cuadro clínico compatible + duración >8 semanas.
• **CIDP Probable:** Criterios EDX en 1 nervio + criterios de soporte.
• **CIDP Posible:** Solo criterios clínicos sin EDX definitivos.

**Diferencias clave con EFNS 2010:**
• Los nuevos criterios ponen mayor énfasis en excluir atrapamientos (no contar bloqueos en sitios habituales como codo o túnel carpiano).
• Se requiere evaluación sensitiva: en CIDP típico, los SNAPs DEBEN estar anormales en al menos un nervio.`,
          clinicalPearls: [
            'TRAMPA: no diagnosticar CIDP basándose solo en bloqueo de conducción en sitios de atrapamiento habitual (codo ulnar, túnel carpiano). Los criterios EAN/PNS 2021 explícitamente excluyen estos sitios. Los bloqueos deben estar en sitios NO habituales.',
            'Si cumple criterios EDX pero la clínica no encaja (por ejemplo, debilidad puramente distal), considerar variantes de CIDP (DADS, MADSAM) o diagnósticos alternativos.',
          ],
          keyPoints: [
            'EAN/PNS 2021 reemplaza EFNS 2010 — más restrictivos, excluyen atrapamientos.',
            'Requiere anomalías desmielinizantes en ≥2 nervios motores para definitivo.',
            'Duración >8 semanas distingue CIDP de GBS.',
          ],
        },
        {
          id: 'cidp-variants',
          title: 'Variantes Clínicas de CIDP',
          content: `**CIDP Típica (sensorimotor simétrica):**
60-70% de casos. Debilidad proximal Y distal simétrica + pérdida sensitiva + arreflexia. El patrón más fácil de reconocer.

**Lewis-Sumner / MADSAM (Multifocal Acquired Demyelinating Sensory and Motor):**
• Asimétrica, multifocal. Simula mononeuropatía múltiple.
• CLAVE: a diferencia de NMM, MADSAM tiene SNAPs ANORMALES en nervios afectados (componente sensitivo).
• Tratamiento: IVIg (NO responde bien a corticoides).

**DADS (Distal Acquired Demyelinating Symmetric):**
• Debilidad y ataxia predominantemente DISTALES y simétricas.
• Frecuentemente asociada a gammapatía monoclonal IgM con anti-MAG.
• NCS: LMD desproporcionadamente prolongadas (\"patrón distal predominante\").
• Poca respuesta a IVIg estándar. Considerar rituximab.

**CIDP Sensitiva Pura:**
• Solo síntomas/signos sensitivos sin debilidad motor clínica.
• NCS: anomalías desmielinizantes en nervios MOTORES a pesar de la falta de debilidad.
• Diagnóstico difícil. Puede evolucionar a CIDP típica.

**CIDP Motora Pura:**
• Debilidad sin componente sensitivo. Diagnóstico diferencial con NMM.`,
          clinicalPearls: [
            'MADSAM vs NMM: ambas son asimétricas con bloqueos de conducción. LA DIFERENCIA CLAVE: en MADSAM los SNAPs están ANORMALES, en NMM los SNAPs son NORMALES. Esta distinción es la más importante porque el tratamiento difiere.',
            'DADS con anti-MAG IgM: la LMD desproporcionadamente prolongada (\"terminal latency index\" < 0.25) es la pista EDX. Medir el TLI: LMD/(distancia/VCM). Si es < 0.25, sospechar anti-MAG.',
          ],
        },
        {
          id: 'autoimmune-nodopathies',
          title: 'Nodopatías Autoinmunes (Entidad Emergente)',
          content: `Condiciones recientemente separadas de CIDP. Causadas por anticuerpos IgG4 contra proteínas del Nodo de Ranvier.

**Anticuerpos y dianas:**
• **Anti-NF155 (Neurofascina 155):** Ataxia sensitiva prominente + tremor. Jóvenes. Pobre respuesta a IVIg.
• **Anti-CNTN1 (Contactina 1):** Neuropatía agresiva con daño axonal temprano. Refractaria a IVIg.
• **Anti-Caspr1 (Contactin-Associated Protein 1):** Dolor neuropático prominente + ataxia.

**Patrón EDX:**
• Inicialmente parece CIDP: bloqueos de conducción, enlentecimiento.
• PERO: daño axonal desproporcionadamente temprano y severo (caída rápida de CMAPs) — inusual para CIDP típica.
• Evolución agresiva que NO responde a IVIg convencional.

**Tratamiento:** Rituximab es el tratamiento de primera línea (elimina células B productoras de IgG4). NO IVIg.`,
          clinicalPearls: [
            '¿CIDP refractaria a IVIg? Solicitar anticuerpos nodales/paranodales (NF155, CNTN1, Caspr1). Si son positivos, cambiar a rituximab — es una nodopatía autoinmune, no CIDP clásica.',
            'Los anticuerpos IgG4 no activan complemento (a diferencia de IgG1/IgG3), por eso la IVIg (que actúa bloqueando receptores Fc) no funciona. El mecanismo es directo (destrucción de la arquitectura nodal).',
          ],
        },
      ],
    },
    {
      id: 'mmn',
      title: 'Neuropatía Motora Multifocal (NMM)',
      content: 'Neuropatía autoinmune crónica motora pura (2.7:1 predomina en varones, inicio ~40 años). CRÍTICO diferenciarla de ELA porque la NMM es tratable con IVIg.',
      children: [
        {
          id: 'mmn-block',
          title: 'Bloqueo de Conducción Motor como Criterio Diagnóstico',
          content: `**Definición de bloqueo de conducción definido:**
Caída de amplitud (o área) del CMAP ≥ 50% entre estimulación proximal y distal, a lo largo de un segmento largo de nervio motor.

**Localización atípica indispensable:**
• Los bloqueos en NMM ocurren en áreas que **no corresponden a sitios de atrapamiento anatómico** (ej., mitad del antebrazo, tercio medio del brazo).
• Si el bloqueo está en codo (ulnar), túnel carpiano (mediano) o cabeza del peroné (peroneo), es probable que sea una mononeuropatía compresiva o susceptibilidad hereditaria a la parálisis por presión (HNPP).

**Integridad Sensorial (Criterio Estricto):**
Los estudios de conducción sensitiva deben ser **completamente normales** a través de los mismos segmentos nerviosos donde se detectó el bloqueo motor.

**Protocolo de búsqueda (Inching):**
Estimulación incremental cada 3-4 cm buscando caídas focales de CMAP a lo largo de múltiples trayectos nerviosos.`,
          clinicalPearls: [
            'Los bloqueos en NMM son MOTORES PUROS. Este hallazgo (bloqueo motor puro en sitio atípico con sensitivo perfectamente normal) es PATOGNOMÓNICO de NMM y demuestra la afectación selectiva de fibras motoras.',
            'Si no encuentras bloqueos con estimulación estándar pero la sospecha es alta, haz inching detallado en todo el trayecto. Algunos bloqueos focales cortos se "diluyen" con estimulación a distancias largas.'
          ],
          keyPoints: [
            'Requiere bloqueo motor (caída >50% amplitud) en sitio atípico (sin atrapamiento).',
            'Conducción sensitiva debe ser estricta y completamente normal en el mismo nervio.'
          ]
        },
        {
          id: 'anti-gm1',
          title: 'Anti-GM1 y Diferencial con ELA',
          content: `**Anticuerpos Anti-GM1 IgM:**
Presentes en 20-85% (promedio 50%) de pacientes con NMM.
• **Mecanismo:** El GM1 se concentra masivamente en los nodos de Ranvier de terminales motoras. El anticuerpo interfiere con los canales Na+/K+ nodales, causando el bloqueo de conducción saltatoria sin destrucción axonal primaria.

**NMM vs ELA — El \"Mimetizador\" más engañoso:**
La NMM frecuentemente causa calambres, fasciculaciones (40% de casos) y atrofia asimétrica distal en MS (como caída de muñeca o \"mano prensil\" débil), simulando a la perfección una variante pura de neurona motora inferior de la ELA (Atrofia Muscular Progresiva).

**Diferenciador Electrofisiológico y Clínico:**
| Criterio | Neuropatía Motora Multifocal (NMM) | Esclerosis Lateral Amiotrófica (ELA) |
|---|---|---|
| **Signos de NMS (Espasticidad, Babinski)** | **NUNCA** | **Frecuentes** |
| **Afectación Bulbar** | **Ausente** | Frecuente (~25% inicio) |
| **Distribución de debilidad** | **Patrón de nervio periférico asimétrico** | Patrón miotómico |
| **Bloqueos de Conducción Motor** | **Presentes** (multifocales persistentes) | **Ausentes** |
| **SNAPs sensitivos** | Normales | Normales |
| **EMG de Aguja** | Denervación limitada al territorio del nervio | Denervación generalizada (≥3 regiones) |
| **Ecografía Neuromuscular** | Engrosamiento focal/parcheado de nervios/plexo | Atrofia difusa, sin engrosamiento focal |
| **Tratamiento** | **IVIg (excelente respuesta)** | Fatal, neurodegenerativa |`,
          clinicalPearls: [
            'El error más devastador en neurofisiología clínica es diagnosticar ELA en un paciente que realmente tiene NMM. La NMM se trata con éxito; la ELA es una sentencia letal.',
            'Cualquier "ELA" que no tenga signos de motoneurona superior (NMS), que sea asimétrica de extremidades superiores y que progrese muy lento, OBLIGA a descartar NMM exhaustivamente buscando bloqueos de conducción proximales.'
          ],
        },
      ],
    },
    {
      id: 'poems',
      title: 'Síndrome POEMS',
      content: `Polineuropathy, Organomegaly, Endocrinopathy, M-protein, Skin changes.
Asociado a mieloma osteoesclerótico o enfermedad de Castleman.

**Patrón NCS:**
• Desmielinizante pero con componente axonal significativo (\"mixto\").
• LMD desproporcionadamente prolongadas (similar a anti-MAG/DADS).
• Velocidades intermedias de enlentecimiento.
• CMAPs reducidos por pérdida axonal significativa.
• SNAPs reducidos o ausentes.

**Diferencial con CIDP:**
• POEMS tiene componente axonal más prominente que CIDP típica.
• Edema papilar, ascitis, policitemia son pistas extraneurológicas.
• La proteína monoclonal es SIEMPRE lambda (λ), nunca kappa (κ).
• El VEGF sérico está marcadamente elevado (mejor biomarcador).

**Tratamiento:** No es IVIg (no funciona). Requiere tratamiento de la discrasia: melfalán/dexametasona, trasplante autólogo, lenalidomida, radioterapia si lesión ósea solitaria.`,
      clinicalPearls: [
        'CIDP que no responde a IVIg + proteína monoclonal lambda + lesiones óseas escleróticas = POEMS. Solicitar VEGF sérico (marcador diagnóstico y de respuesta). NO dar IVIg — no funciona.',
        'Pista EDX: la combinación de LMD desproporcionadamente prolongadas (como DADS) PERO con pérdida axonal significativa (CMAPs bajos) + SNAPs bajos sugiere POEMS más que CIDP pura.',
      ],
    },
  ],
};

// ═══════════════════════════════════════════════════════════════
// SECTION 3: MONONEUROPATÍAS Y ATRAPAMIENTOS
// ═══════════════════════════════════════════════════════════════
export const mononeuropathies: Topic = {
  id: 'mononeuropathies',
  title: 'Mononeuropatías y Atrapamientos',
  content: 'Los síndromes de atrapamiento nervioso son la indicación más frecuente de estudios electrodiagnósticos (~40% de todas las consultas). La evaluación EDX define la localización precisa, la severidad (neuropraxia vs axonotmesis vs neurotmesis) y guía la decisión terapéutica (conservador vs quirúrgico).',
  clinicalPearls: [
    'Siempre evaluar la temperatura de la extremidad antes de interpretar NCS en atrapamientos. Una temperatura < 32°C en MS o < 30°C en MI prolonga latencias y enlentece velocidades, simulando atrapamientos falsos positivos.',
  ],
  children: [
    {
      id: 'carpal-tunnel',
      title: 'Síndrome del Túnel Carpiano (STC)',
      content: 'Es el atrapamiento más frecuente. Compresión del nervio mediano bajo el retináculo flexor. Prevalencia: 3-5% de la población general.',
      children: [
        {
          id: 'cts-comparison',
          title: 'Estudios Comparativos de Alta Sensibilidad',
          content: `**1. Mediano-Ulnar al 4to dedo (Robinson — sensibilidad >95%):**
Estimular mediano y ulnar en muñeca, registrar con anillo en 4to dedo. Diferencia de latencia pico > 0.4-0.5 ms = anormal. Es el test más sensible porque ambos nervios recorren la misma distancia al mismo dedo.

**2. Mediano-Radial al 1er dedo (sensibilidad ~93%):**
Útil cuando el ulnar también está afectado. Diferencia > 0.5 ms = anormal.

**3. Lumbrical-Interóseo (sensibilidad ~95%):**
Registrar CMAPs en 2do lumbrical (mediano) y 2do interóseo (ulnar) con estimulación en muñeca. Diferencia de LMD > 0.4 ms = anormal. Especialmente útil en STC severo donde los SNAPs están ausentes.

**4. Técnica palmar segmentaria (Inching de Kimura):**
Estimular mediano cada 1 cm a través del túnel carpiano. Un salto de latencia > 0.5 ms en cualquier segmento de 1 cm localiza la compresión exacta.`,
          clinicalPearls: [
            'Cuando el SNAP mediano está AUSENTE (STC severo), usa el comparativo lumbrical-interóseo motor — no requiere SNAP intacto y mantiene alta sensibilidad.',
            'Si mediano Y ulnar están anormales (doble atrapamiento o polineuropatía), usa el comparativo mediano-RADIAL al pulgar como alternativa.',
          ],
        },
        {
          id: 'cts-severity',
          title: 'Clasificación de Severidad EDX (Escala de Bland)',
          content: `| Grado | Hallazgos NCS | Significado clínico |
|---|---|---|
| 0 (Normal) | Todos los parámetros normales | Descartar STC |
| 1 (Mínimo) | Solo comparativos anormales | STC muy temprano |
| 2 (Leve) | VCS mediano al dedo lenta, LMD normal | Desmielinización sensitiva focal |
| 3 (Moderado) | VCS lenta + LMD prolongada | Desmielinización sensitiva + motora |
| 4 (Severo) | SNAP ausente + LMD prolongada | Pérdida axonal sensitiva + desmielinización motora |
| 5 (Muy severo) | SNAP ausente + CMAP reducido + LMD prolongada | Axonopatía sensitiva + motora |
| 6 (Extremo) | SNAP y CMAP ausentes | Inexcitabilidad — peor pronóstico quirúrgico |

**Implicancia pronóstica:**
• Grados 1-3: excelente pronóstico quirúrgico (>95% recuperación completa).
• Grado 4: buen pronóstico motor, recuperación sensitiva variable.
• Grados 5-6: indicación quirúrgica URGENTE para prevenir daño mayor, pero la recuperación es lenta e incompleta.`,
          clinicalPearls: [
            'STC grado 6 (inexcitable) NO significa que la cirugía sea inútil. Si la EMG en APB muestra PUMs voluntarios residuales, hay fibras sobrevivientes que pueden mejorar tras descompresión. La ausencia de PUMs voluntarios en APB es el verdadero indicador de daño irreversible.',
          ],
        },
        {
          id: 'cts-emg',
          title: 'Rol de la EMG de Aguja en STC',
          content: `**Músculo principal: Abductor Pollicis Brevis (APB).**
• Fibrilaciones/PSW en APB = daño axonal motor (STC moderado-severo). Guía pronóstico quirúrgico.
• Reclutamiento reducido en APB = pérdida de unidades motoras funcionales.

**Músculos para diagnóstico diferencial:**
• Pronador teres (mediano, C6-C7): si está denervado → lesión del mediano PROXIMAL al túnel (no STC).
• FPL/FDP índice (NIA): si están denervados → síndrome del nervio interóseo anterior o compresión alta del mediano.
• Extensores/músculos radiculares C6-C7: para descartar radiculopatía cervical coexistente.

**Protocolo EMG mínimo en sospecha de STC:**
APB + pronador teres + ≥1 músculo C6-C7 de nervio diferente (ej. tríceps por radial) + paraespinales cervicales si se sospecha radiculopatía.`,
        },
      ],
    },
    {
      id: 'ulnar-elbow',
      title: 'Neuropatía Cubital en el Codo (UNE)',
      content: 'Segundo atrapamiento más frecuente (~20% de todos los atrapamientos). Compresión del nervio ulnar en el túnel cubital o bajo la aponeurosis del FCU.',
      children: [
        {
          id: 'inching-elbow',
          title: 'Técnica de Inching a Través del Codo',
          content: `Estimulación incremental cada 2 cm cruzando el codo (desde 6 cm distal hasta 6-8 cm proximal al epicóndilo medial), registrando en ADM o FDI.

**Interpretación:**
• Salto de latencia > 0.7 ms en un segmento de 2 cm = localización de la compresión.
• Caída de amplitud > 20% en un segmento = bloqueo focal.
• Si el máximo cambio está a nivel del epicóndilo medial → síndrome del túnel cubital (retináculo de Osborne).
• Si está 2-4 cm proximal al epicóndilo → compresión en arcada de Struthers.
• Si está 2-4 cm distal → compresión bajo aponeurosis del FCU.

**Técnica:**
• Codo en 70-90° de flexión (estandarizado).
• Marcar puntos con rotulador cada 2 cm sobre el nervio palpable.
• Estimulación supramáxima en cada punto.
• Medir latencia y amplitud en cada segmento.`,
          clinicalPearls: [
            'El codo DEBE estar flexionado a 70-90° durante TODO el estudio. Error más frecuente: medir con codo extendido, lo que relaja el nervio y puede normalizar hallazgos.',
            'Medir la distancia SOBRE el codo siguiendo el curso del nervio (curvilíneo), no en línea recta. La medición en línea recta subestima la distancia real y sobreestima la VCM.',
          ],
        },
        {
          id: 'guyon-canal',
          title: 'Diagnóstico Diferencial: Canal de Guyon',
          content: `**Zonas del canal de Guyon (Gross & Gelberman):**

| Zona | Estructuras afectadas | Hallazgos NCS/EMG |
|---|---|---|
| I (proximal) | Motor + sensitivo | CMAP ADM reducido + SNAP 5to dedo reducido |
| II (motor profunda) | Solo rama motora profunda | CMAP FDI reducido, ADM puede ser normal, SNAP normal |
| III (sensitiva superficial) | Solo rama sensitiva | SNAP 5to dedo reducido, CMAPs normales |

**CLAVE DIFERENCIAL con UNE (codo):**
El SNAP del nervio cutáneo dorsal del ulnar (DCU) es la prueba diferencial definitiva:
• Sale del nervio ulnar 5-8 cm PROXIMAL a la muñeca (antes de Guyon).
• DCU ANORMAL → lesión en CODO (o más proximal).
• DCU NORMAL → lesión en GUYON (distal a la ramificación).`,
          clinicalPearls: [
            'Guyon zona II (motor puro): causa debilidad aislada de interóseos/aductor del pulgar SIN síntomas sensitivos. Puede simular ELA o radiculopatía T1. Buscar masas en la palma (ganglión, aneurisma de arteria ulnar en ciclistas).',
          ],
        },
      ],
    },
    {
      id: 'peroneal-neuropathy',
      title: 'Neuropatía del Nervio Peroneo Común',
      content: `Causa más frecuente de pie caído unilateral agudo. Compresión en la cabeza del peroné.

**Hallazgos NCS:**
• CMAP peroneo (EDB): reducido o ausente con estimulación distal (tobillo). Bloqueo de conducción > 50% cruzando cabeza de peroné.
• VCM enlentecida a través de cabeza de peroné.
• SNAP peroneo superficial: reducido (axonopatía) o normal (neuropraxia pura).
• CMAP tibial y SNAP sural: NORMALES (claves para excluir ciático o L5).

**Diferencial con radiculopatía L5:**
| | Peroneo común | Radiculopatía L5 |
|---|---|---|
| SNAP peroneo superficial | Reducido | NORMAL (preganglionar) |
| Tibial posterior | Normal | DÉBIL (L5, tibial) |
| Glúteo medio | Normal | DÉBIL (L5, glúteo sup.) |
| Reflejo aquíleo | Normal | Normal |
| Paraespinales L5 | Normales | Fibrilaciones |

**Factores de riesgo:** Pérdida de peso rápida (piernas cruzadas), postura en cirugía, yeso sobre peroné, fractura de cuello de peroné.`,
      clinicalPearls: [
        'CLAVE: el tibial posterior (L5, nervio tibial) es el músculo diferencial. Si está débil → NO es peroneo, es L5 o ciático. Si está normal → peroneo.',
        'Neuropraxia (SNAP peroneo superficial normal + bloqueo puro) tiene excelente pronóstico — recuperación en 2-3 meses. Axonopatía (SNAP reducido + denervación) recupera en 6-12 meses.',
      ],
    },
    {
      id: 'radial-neuropathy',
      title: 'Neuropatía Radial: Canal Espiral y PIN',
      content: `**Canal Espiral (Saturday Night Palsy):**
• Muñeca caída (wrist drop) + extensión dedos débil.
• Tríceps PRESERVADO (su rama sale ANTES del canal espiral).
• NCS: CMAP radial (EIP) con bloqueo proximal vs distal. SNAP radial superficial variable.

**Nervio Interóseo Posterior (PIN):**
• Compresión en arcada de Frohse (supinador).
• Debilidad de extensión de dedos SIN muñeca caída (el ECRL conserva extensión radial de muñeca).
• SIN pérdida sensitiva (PIN es puramente motor).
• SNAP radial superficial NORMAL.

**Síndrome de Wartenberg:**
• Compresión del nervio radial sensitivo superficial en antebrazo distal.
• Solo dolor/parestesias en dorso radial de mano. Sin debilidad.
• SNAP radial reducido comparado con contralateral.`,
      clinicalPearls: [
        'Si el tríceps está DÉBIL con muñeca caída → la lesión es PROXIMAL al canal espiral (axilar, fascículo posterior, o C7). Saturday Night Palsy NO afecta tríceps.',
        'PIN vs canal espiral: ¿puede hacer extensión de MUÑECA? Sí → PIN (ECRL preservado). No → canal espiral.',
      ],
    },
    {
      id: 'tarsal-tunnel',
      title: 'Síndrome del Túnel Tarsiano',
      content: `Compresión del nervio tibial posterior y/o sus ramas (plantar medial, plantar lateral) bajo el retináculo flexor del tobillo medial.

**NCS:**
• CMAP plantar medial (registrando abductor hallucis): LMD > 4.4 ms o amplitud < 50% del contralateral.
• CMAP plantar lateral (registrando abductor digiti minimi pedis): LMD > 5.0 ms.
• SNAP plantar medial/lateral: comparativos lado a lado. Diferencia > 50% = anormal.

**TRAMPAS DIAGNÓSTICAS:**
• Temperatura del pie: DEBE ser > 30°C. Pies fríos causan falsos positivos.
• Polineuropatía distal: puede simular túnel tarsiano bilateral. Evaluar nervios de MS y sural para descartar polineuropatía de fondo.
• Neuropatía de fibra fina: dolor plantar quemante con NCS normales = no es túnel tarsiano.`,
      clinicalPearls: [
        'El diagnóstico EDX de túnel tarsiano es DIFÍCIL y tiene alta tasa de falsos positivos (temperatura, polineuropatía distal). Siempre calentar el pie a >30°C y descartar polineuropatía antes de diagnosticar.',
      ],
    },
    {
      id: 'bells-palsy',
      title: 'Parálisis de Bell y Evaluación del Nervio Facial',
      content: `**Electroneurografía Facial (ENoG):**
• Realizada a día 7-10 post-inicio (antes puede ser falsamente normal porque la degeneración walleriana no se ha completado).
• Estimulación en ángulo mandibular, registro en músculo nasolabial.
• Comparar amplitud CMAP lado afectado vs sano.
• Degeneración < 90% = buen pronóstico (>90% recuperación).
• Degeneración > 90% = mal pronóstico — considerar descompresión quirúrgica.

**Reflejo de Parpadeo (Blink Reflex):**
• Estimulación del nervio supraorbitario (V1), registro en orbicular de los párpados.
• R1: respuesta ipsilateral oligosináptica (latencia normal ~10-12 ms).
• R2: respuesta bilateral polisináptica (latencia normal ~30-34 ms).

**Patrones de Blink Reflex:**
| Lesión | R1 ipsilateral | R2 ipsilateral | R2 contralateral |
|---|---|---|---|
| N. trigémino (aferente) | Prolongado | Prolongado | Normal |
| N. facial (eferente) | Prolongado | Prolongado | Normal (vía eferente contralateral intacta) |
| Tronco cerebral | Prolongado | Prolongado | Prolongado |`,
      clinicalPearls: [
        'NO hacer ENoG antes del día 7 — la degeneración walleriana tarda ~7 días en completarse. Un estudio al día 3 puede mostrar CMAP normal (aún no degeneró) dando falsa tranquilidad.',
        'ENoG con degeneración > 90% a los 10-14 días: discutir descompresión quirúrgica del canal de Falopio. Es la única indicación quirúrgica basada en EDX en Bell palsy.',
      ],
    },
    {
      id: 'suprascapular-neuropathy',
      title: 'Neuropatía Supraescapular',
      content: `Compresión del nervio supraescapular en la escotadura supraescapular (supraespinoso + infraespinoso) o en la escotadura espinoescapular (solo infraespinoso).

**Hallazgos EDX:**
• NCS motora: CMAP registrando infraespinoso con estimulación en punto de Erb. Comparar latencia bilateral (> 20% diferencia = anormal).
• EMG: denervación en supraespinoso e infraespinoso = escotadura supraescapular. Denervación SOLO en infraespinoso = escotadura espinoescapular.

**Diferencial:** Radiculopatía C5 (pero en C5 el deltoides y bíceps también estarían afectados), rotura de manguito rotador (EMG normal, MRI anormal).`,
      clinicalPearls: [
        'Causa frecuente en deportistas con movimientos repetitivos sobre la cabeza (voleibol, tenis, natación). Si un deportista tiene debilidad de rotación externa y abducción sin dolor significativo, evaluar supraescapular.',
      ],
    },
    {
      id: 'ain-pronator',
      title: 'Síndrome del Nervio Interóseo Anterior (NIA) y Síndrome del Pronador',
      content: `**Síndrome del NIA (Kiloh-Nevin):**
• Rama puramente MOTORA del mediano. SIN pérdida sensitiva.
• Debilidad de FPL (pulgar), FDP índice/medio, pronador cuadrado.
• Incapacidad de hacer el signo \"OK\" (pinza circular pulgar-índice — se hace cuadrada).
• NCS de rutina: NORMALES (el NIA no tiene componente sensitivo medible). EMG confirma: denervación en FPL, FDP índice, pronador cuadrado con pronador teres y mediano distal normales.

**Síndrome del Pronador:**
• Compresión del mediano en antebrazo proximal (entre cabezas del pronador teres, arco del FDS, ligamento de Struthers o lacertus fibrosus).
• Diferencia con STC: pérdida sensitiva de la palma (rama cutánea palmar sale ANTES del túnel carpiano).
• LMD mediano normal (la compresión es proximal al túnel carpiano).
• EMG: denervación en pronador teres + FCR + FDS (proximal al túnel carpiano).`,
      clinicalPearls: [
        'STC vs Pronador: la sensibilidad de la palma es la clave. En STC la palma es NORMAL (la rama cutánea palmar viaja por fuera del túnel). En síndrome del pronador, la palma está ADORMECIDA. También, el signo de Tinel es en la muñeca (STC) vs en el codo/antebrazo proximal (pronador).',
      ],
    },
  ],
};
