// src/content/modules/module-10-diagnostic-criteria.ts
import { Module } from '../../types/content';

export const module10: Module = {
  id: 'diagnostic-criteria',
  number: 10,
  title: 'Criterios Diagnósticos y Algoritmos Clínicos',
  titleEn: 'Diagnostic Criteria and Clinical Algorithms',
  emoji: '📋',
  description: 'Criterios de desmielinización, ELA, NMM, UNM y algoritmos diagnósticos',
  descriptionEn: 'Demyelination criteria, ALS, MMN, NMJ and diagnostic algorithms',
  color: 'from-slate-500 to-slate-800',
  icon: 'ClipboardList',
  topics: [
    // ═══════════════════════════════════════════════════════════════
    // 1. CRITERIOS DE DESMIELINIZACIÓN
    // ═══════════════════════════════════════════════════════════════
    {
      id: 'demyelination-criteria',
      title: 'Criterios Electrofisiológicos de Desmielinización',
      description: 'Parámetros cuantitativos que distinguen procesos desmielinizantes de axonales en NCS',
      content: 'La diferenciación entre desmielinización y axonopatía es la piedra angular de la interpretación electrodiagnóstica. Los criterios electrofisiológicos de desmielinización exigen alteraciones específicas y cuantificables que reflejan la pérdida de mielina segmentaria, a diferencia de la pérdida axonal primaria que reduce amplitudes sin alterar significativamente latencias o velocidades.',
      clinicalPearls: [
        'REGLA DE ORO: un solo nervio con criterios de desmielinización en un sitio de atrapamiento clásico (túnel carpiano, codo, cabeza del peroné) NO cuenta como evidencia de polineuropatía desmielinizante — es simplemente un atrapamiento focal.',
        'La temperatura fría (<32°C) puede simular desmielinización: enlentece la VCM 1.5-2 m/s por cada °C bajo 33°C y prolonga latencias distales. Siempre verificar temperatura antes de diagnosticar desmielinización.',
      ],
      keyPoints: [
        'VCM ≤70% del límite inferior normal (LIN) = desmielinización definitiva.',
        'LMD ≥150% del límite superior normal (LSN) = prolongación desmielinizante.',
        'Bloqueo de conducción: caída de CMAP >50% en amplitud/área entre sitios.',
        'Dispersión temporal anormal: ensanchamiento de duración >30% proximal vs distal.',
        'Onda F: ausencia o latencia >120% del LSN con CMAP distal presente.',
      ],
      children: [
        {
          id: 'quantitative-parameters',
          title: 'Parámetros Cuantitativos Definitivos',
          content: `Cada parámetro de desmielinización refleja un mecanismo fisiopatológico diferente de la lesión mielínica.

**Velocidad de Conducción Motora (VCM) ≤70% LIN:**
Refleja desmielinización internodal difusa. La pérdida de mielina obliga al impulso a propagarse de forma continua (no saltatoria), reduciendo dramáticamente la velocidad. VCM <70% LIN es prácticamente diagnóstica de desmielinización primaria.

**Latencia Motora Distal (LMD) ≥150% LSN:**
La desmielinización afecta preferentemente los segmentos distales ricos en ramificaciones terminales. Una LMD >150% indica pérdida de mielina distal significativa.

**Bloqueo de Conducción Motor:**
Caída de amplitud y/o área del CMAP >50% entre estimulación distal and proximal, con ensanchamiento de duración <30%. Refleja desmielinización segmentaria focal que impide la propagación del potencial en algunos axones.

**Dispersión Temporal Anormal:**
Ensanchamiento de duración del CMAP proximal >30% respecto al distal. Refleja desmielinización segmentaria heterogénea: diferentes axones conducen a velocidades muy distintas, desincronizando la llegada.`,
          clinicalPearls: [
            'PERLA CLAVE: Bloqueo de conducción VERDADERO = caída de amplitud >50% CON duración <30% de ensanchamiento. Si la duración se ensancha >30%, es dispersión temporal, NO bloqueo puro — la distinción importa porque el bloqueo verdadero sugiere NMM o CIDP multifocal.',
            'Un CMAP proximal con deflexión positiva inicial puede simular un falso bloqueo por co-estimulación de un nervio adyacente o por anastomosis de Martin-Gruber. Siempre verificar.',
          ],
          keyPoints: [
            'VCM ≤70% LIN → desmielinización internodal difusa.',
            'LMD ≥150% LSN → desmielinización terminal distal.',
            'Bloqueo: caída CMAP >50% + duración <30% ensanchamiento.',
            'Dispersión: caída amplitud + duración >30% ensanchamiento.',
          ],
        },
        {
          id: 'uniform-vs-segmental',
          title: 'Desmielinización Uniforme vs. Segmentaria',
          content: `Esta distinción tiene enormes implicaciones etiológicas y terapéuticas.

**Desmielinización UNIFORME (hereditaria — CMT1):**
• Enlentecimiento simétrico y homogéneo en TODOS los nervios.
• VCM mediano típicamente 15-25 m/s (CMT1A con duplicación PMP22).
• Sin bloqueos de conducción focales.
• Sin dispersión temporal anormal.
• Todos los nervios igualmente afectados bilateralmente.
• NO tratable con inmunoterapia.

**Desmielinización SEGMENTARIA (adquirida — CIDP, GBS, NMM):**
• Enlentecimiento asimétrico y heterogéneo entre nervios.
• Presencia de bloqueos focales y dispersión temporal.
• Diferentes nervios con diferentes grados de afectación.
• Puede haber nervios normales junto a nervios severamente afectados.
• TRATABLE con IVIg, plasmaféresis, corticoides.`,
          clinicalPearls: [
            'REGLA PRÁCTICA: Si VCM del mediano es <25 m/s y TODOS los nervios son igualmente lentos sin bloqueos → piensa CMT1 (hereditaria). Si hay asimetría marcada con bloqueos focales → piensa CIDP (adquirida, tratable).',
            'Trampa diagnóstica: la CMT1X (ligada al X) puede mostrar enlentecimiento "desigual" entre nervios que simula un patrón adquirido. Siempre considerar en varones jóvenes con NCS desmielinizantes atípicas.',
            'En CMT1, la amplitud del CMAP se preserva relativamente al inicio porque no hay pérdida axonal primaria. Cuando la amplitud cae significativamente, indica daño axonal secundario superpuesto — signo de mal pronóstico funcional.',
          ],
          keyPoints: [
            'Uniforme (CMT1): VCM igualmente lenta en todos los nervios, sin bloqueos.',
            'Segmentaria (CIDP/NMM): asimétrica, con bloqueos y dispersión.',
            'Uniforme = hereditaria = NO responde a inmunoterapia.',
            'Segmentaria = adquirida = POTENCIALMENTE tratable.',
          ],
        },
        {
          id: 'axonal-vs-demyelinating-table',
          title: 'Tabla Comparativa: Axonopatía vs. Desmielinización',
          content: `**Comparación Sistemática de Patrones NCS:**

| Parámetro | Axonopatía | Desmielinización |
|---|---|---|
| Amplitud CMAP | ↓↓ Reducida | Normal o ↓ leve (excepto con bloqueo) |
| Amplitud SNAP | ↓↓ Reducida | Normal o ↓ variable |
| VCM | Normal o ↓ leve (>75% LIN) | ↓↓ Marcadamente lenta (≤70% LIN) |
| LMD | Normal o ↑ leve | ↑↑ Prolongada (≥150% LSN) |
| Onda F | Normal o ausente | Prolongada o ausente |
| Bloqueo de conducción | Ausente* | Presente |
| Dispersión temporal | Ausente | Presente |
| EMG de aguja | Fibrilaciones, PSW, PUM neurogénicos | Puede ser normal si no hay daño axonal secundario |

*Excepción: la axonopatía aguda severa puede mostrar pseudobloqueo transitorio por degeneración walleriana incompleta en los primeros 7-10 días.`,
          clinicalPearls: [
            'TRAMPA TEMPORAL: en los primeros 7-10 días post-lesión aguda, el CMAP distal aún no ha degenerado (la degeneración walleriana tarda). Un CMAP proximal bajo con distal normal puede simular bloqueo de conducción. Repetir el estudio a las 2-3 semanas para diferenciar.',
            'La polineuropatía diabética, la causa más común de polineuropatía, es predominantemente AXONAL. Un paciente diabético con patrón claramente desmielinizante (VCM <70% LIN + bloqueos) tiene CIDP-on-diabetes hasta probar lo contrario — y es tratable.',
          ],
        },
      ],
    },

    // ═══════════════════════════════════════════════════════════════
    // 2. CIDP (EAN/PNS 2021)
    // ═══════════════════════════════════════════════════════════════
    {
      id: 'cidp-criteria',
      title: 'Criterios de CIDP (EAN/PNS 2021)',
      description: 'Polineuropatía desmielinizante inflamatoria crónica — diagnóstico, variantes y trampas',
      content: 'Las guías EAN/PNS 2021 representan la actualización más importante en el diagnóstico de CIDP en una década, reemplazando las EFNS/PNS 2010. Los cambios fundamentales incluyen la eliminación de la categoría "CIDP probable" (ahora solo "CIDP" y "CIDP posible"), la exigencia de anomalías sensitivas en la neuroconducción para el diagnóstico de CIDP típica, y la definición formal de variantes atípicas.',
      clinicalPearls: [
        'CAMBIO CRÍTICO 2021: ya no basta con criterios motores aislados para diagnosticar CIDP típica. Se REQUIERE evidencia de desmielinización en nervios sensitivos (VCS lenta o SNAP anormal en distribución no longitud-dependiente). Sin esto, se clasifica como variante motora o CIDP posible.',
        'El sobrediagnóstico de CIDP es un problema real: estudios muestran que hasta 18% de los pacientes referidos como "CIDP" tienen otro diagnóstico. Las consecuencias: tratamiento inmunosupresor innecesario y costoso.',
      ],
      keyPoints: [
        'EAN/PNS 2021 eliminan "CIDP probable" — solo "CIDP" o "CIDP posible".',
        'Requiere desmielinización en ≥2 nervios motores (VCM ≤70% LIN, LMD ≥50% LSN, bloqueo >50%, dispersión >30%, onda F ausente/prolongada).',
        'CIDP típica EXIGE anomalías sensitivas en NCS.',
        'Criterios de soporte: LCR (proteínas >0.45 g/L), RM (engrosamiento/realce de raíces), respuesta a tratamiento.',
      ],
      children: [
        {
          id: 'cidp-electrophysiology',
          title: 'Criterios Electrofisiológicos Detallados',
          content: `Se requieren anomalías desmielinizantes en AL MENOS 2 nervios motores. Los criterios individuales son:

**1. VCM ≤70% del LIN** en 2 nervios (excluir túnel carpiano para mediano)
**2. LMD ≥50% sobre el LSN** en 2 nervios (excluir STC)
**3. Latencia de onda F ≥20% sobre el LSN** en 2 nervios
**4. Ausencia de onda F** en 2 nervios (si CMAP distal ≥1 mV)
**5. Bloqueo de conducción motor parcial:** caída de CMAP >50% proximal vs distal en 2 nervios, o caída >30% en 1 nervio + otro criterio
**6. Dispersión temporal anormal** en ≥2 nervios

IMPORTANTE: Se permite combinar diferentes criterios en diferentes nervios (ej., VCM lenta en mediano + bloqueo en ulnar = cuenta como 2 nervios afectados).`,
          clinicalPearls: [
            'PERLA: Los criterios son más estrictos que los viejos EFNS 2010. Si un paciente cumplía CIDP "probable" con los viejos criterios, puede NO cumplir con los nuevos 2021. Reclasificar cuidadosamente.',
            'El nervio mediano distal (LMD) debe EXCLUIRSE del conteo si el paciente tiene STC conocido. Usar ulnar, peroneo o tibial para los criterios distales.',
            'Perla práctica: si faltan 1-2 criterios, el LCR con proteínas elevadas (>0.45 g/L) sin pleocitosis sube la categoría de "posible" a "CIDP" con criterios de soporte.',
          ],
        },
        {
          id: 'cidp-variants',
          title: 'Variantes de CIDP Formalmente Definidas',
          content: `Las guías 2021 definen explícitamente 5 variantes atípicas, cada una con sus particularidades electrodiagnósticas y terapéuticas:

**1. MADSAM (Lewis-Sumner):**
Multifocal Acquired Demyelinating Sensory And Motor neuropathy. Distribución asimétrica y multifocal. A diferencia de NMM, los SNAPs están anormales en los nervios afectados. Puede ser unilateral al inicio, lo que confunde con mononeuropatía.

**2. DADS (Distal Acquired Demyelinating Symmetric):**
Predominantemente distal y simétrica. Fuertemente asociada con gammapatía monoclonal IgM anti-MAG. LMD desproporcionadamente prolongadas vs VCM. Responde peor a IVIg que la CIDP típica — considerar Rituximab.

**3. Variante Motora Pura:**
Sin afectación sensitiva clínica ni electrofisiológica. Diferencial principal: NMM. Clave: en la variante motora de CIDP, la desmielinización es más difusa y simétrica, mientras que en NMM es estrictamente focal con bloqueos aislados.

**4. Variante Sensitiva Pura:**
Solo síntomas y hallazgos sensitivos. Puede progresar a CIDP típica con el tiempo. La biopsia del nervio sural puede mostrar desmielinización a pesar de NCS motoras normales.

**5. Variante Focal:**
Afecta un solo nervio o plexo. Muy rara. Diagnóstico de exclusión.`,
          clinicalPearls: [
            'DADS + IgM anti-MAG = entidad específica con pronóstico y tratamiento diferente. NO tratar como CIDP típica con IVIg — la respuesta es pobre. Rituximab es primera línea.',
            'Lewis-Sumner (MADSAM) es la variante que más confunde con NMM. La clave diferencial: en MADSAM los SNAPs están afectados; en NMM los SNAPs son NORMALES.',
            'La variante sensitiva pura puede tener NCS motoras completamente normales. Si la sospecha clínica es alta (ataxia sensitiva, Romberg+, distribución no longitud-dependiente), considerar biopsia de nervio sural o trial terapéutico.',
          ],
        },
        {
          id: 'autoimmune-nodopathies-detail',
          title: 'Nodopatías Autoinmunes: La Frontera Emergente',
          content: `Las nodopatías autoinmunes son entidades DISTINTAS de la CIDP clásica, mediadas por anticuerpos IgG4 contra proteínas del nodo de Ranvier. Su reconocimiento es crítico porque NO responden al tratamiento convencional de CIDP.

**Targets antigénicos:**
• **Neurofascin-155 (NF155):** Proteínas paranodales. Presentación: temblor severo de acción, ataxia cerebelosa, inicio joven, CIDP-like con componente axonal precoz.
• **Contactin-1 (CNTN1):** Paranodal. Inicio agudo/subagudo simulando GBS, pero con curso crónico. Nefropatía membranosa asociada (síndrome nefrótico).
• **Caspr1:** Paranodal. Dolor neuropático severo, patrón sensitivo-motor con componente axonal temprano.
• **Neurofascin-186 (NF186):** Nodal. Patrón más similar a CIDP clásica.

**Hallazgos NCS característicos:**
• Bloqueos de conducción prominentes (ataque al nodo = bloqueo nodal directo).
• Pero con caída de amplitudes que sugiere daño axonal primario precoz.
• Progresión rápida a pérdida axonal irreversible si no se trata.

**TRATAMIENTO:**
• IVIg y plasmaféresis: INEFICACES o respuesta parcial transitoria.
• Rituximab: PRIMERA LÍNEA. Depleciona las células B que producen IgG4.
• Diagnóstico precoz = preservación axonal = mejor pronóstico.`,
          clinicalPearls: [
            'PERLA VITAL: Si un paciente con "CIDP" no responde a 2 ciclos de IVIg Y tiene un componente axonal temprano inusual, solicitar panel de anticuerpos anti-nodales/paranodales (NF155, CNTN1, Caspr1). El tratamiento cambia completamente a Rituximab.',
            'Anti-NF155 se asocia con temblor de acción severo distal — un hallazgo muy inusual en CIDP clásica. Si ves temblor + CIDP en paciente joven, piensa nodopatía.',
            'Anti-CNTN1 puede presentarse como GBS-like de inicio agudo pero que no mejora como un GBS típico y evoluciona a cronicidad. La pista: síndrome nefrótico concurrente.',
          ],
          keyPoints: [
            'Targets: NF155, CNTN1, Caspr1, NF186 — todos mediados por IgG4.',
            'NO responden a IVIg/plasmaféresis convencional.',
            'Rituximab es primera línea en nodopatías autoinmunes.',
            'Anti-NF155: temblor + CIDP joven. Anti-CNTN1: GBS-like + nefropatía.',
          ],
        },
        {
          id: 'cidp-differential',
          title: 'Diagnóstico Diferencial Crítico de CIDP',
          content: `El sobrediagnóstico de CIDP es un problema clínico real. Estas son las condiciones que más frecuentemente se confunden con CIDP:

**1. CMT1 (Charcot-Marie-Tooth tipo 1):**
• Desmielinización uniforme sin bloqueos (vs CIDP segmentaria con bloqueos).
• Historia familiar positiva, pies cavos, inicio infantil/juvenil.
• VCM mediano <38 m/s uniformemente.

**2. POEMS (Polineuropatía, Organomegalia, Endocrinopatía, proteína M, cambios en piel):**
• Patrón desmielinizante que puede cumplir criterios de CIDP.
• Pista: componente axonal precoz desproporcionado + síntomas sistémicos.
• Siempre buscar proteína M (SPEP/IFE) + VEGF elevado.

**3. Polineuropatía diabética severa:**
• Puede tener componente desmielinizante leve superpuesto.
• Pero patrón predominantemente axonal y longitud-dependiente.

**4. Neuropatía por quimioterapia:**
• Axonal, pero puede tener enlentecimiento desmielinizante secundario.

**5. NMM (Neuropatía Motora Multifocal):**
• Bloqueos motores puros SIN afectación sensitiva.`,
          clinicalPearls: [
            'REGLA: ante todo diagnóstico nuevo de CIDP, SIEMPRE solicitar SPEP/IFE (inmunofijación sérica) para descartar POEMS y gammapatía monoclonal. El POEMS es letal si no se trata, pero curable con transplante de células madre.',
            'Si un paciente con "CIDP" tiene una VCM del mediano <25 m/s uniformemente en todos los nervios bilateralmente Y sin bloqueos → reconsiderar CMT1 y solicitar genética de PMP22 antes de iniciar IVIg.',
          ],
        },
      ],
    },

    // ═══════════════════════════════════════════════════════════════
    // 3. ELA (GOLD COAST 2019)
    // ═══════════════════════════════════════════════════════════════
    {
      id: 'als-criteria',
      title: 'Criterios de ELA (Gold Coast 2019)',
      description: 'Esclerosis Lateral Amiotrófica — criterios simplificados, protocolo EMG y trampas diagnósticas',
      content: 'Los criterios Gold Coast 2019 representan una simplificación radical respecto a los previos El Escorial (1994) y Awaji-Shima (2008). Eliminan las confusas categorías de "definitivo", "probable", "probable con soporte de laboratorio" y "posible", reemplazándolas con una clasificación binaria: ELA o no ELA. Esto aumenta la sensibilidad diagnóstica sin sacrificar especificidad, permitiendo diagnósticos más tempranos e ingreso más rápido a ensayos clínicos.',
      clinicalPearls: [
        'CAMBIO FUNDAMENTAL: Gold Coast 2019 otorga a las fasciculaciones complejas/inestables el MISMO valor diagnóstico que las fibrilaciones y PSW para documentar denervación activa. Esto fue incorporado originalmente en Awaji 2008 pero ahora se consolida definitivamente.',
        'Gold Coast permite diagnosticar ELA con LMN pura en ≥2 regiones (sin signos de UMN demostrados). Esto captura las variantes PMA (Atrofia Muscular Progresiva) que antes quedaban en limbo diagnóstico.',
        'PERLA PRONÓSTICA: la velocidad de progresión del ALSFRS-R (escala funcional) al momento del diagnóstico es el mejor predictor individual de supervivencia, más que cualquier hallazgo EMG aislado.',
      ],
      keyPoints: [
        'Criterios Gold Coast = binario: ELA o no-ELA (eliminan categorías intermedias).',
        'Requiere: 1) deterioro motor progresivo, 2) UMN+LMN en ≥1 región O LMN en ≥2 regiones, 3) exclusión de otras causas.',
        'Fasciculaciones complejas = equivalente a fibrilaciones para denervación activa.',
        '4 regiones EMG: bulbar, cervical, torácica, lumbosacra.',
      ],
      children: [
        {
          id: 'gold-coast-details',
          title: 'Criterios Gold Coast Detallados',
          content: `Los tres pilares diagnósticos son:

**1. Deterioro motor progresivo:**
Historia clínica de debilidad progresiva documentada. El deterioro debe ser claramente progresivo (no estático ni fluctuante — esto excluye NMM y miastenia).

**2. Evidencia de disfunción UMN y LMN:**
• **Opción A:** UMN + LMN en ≥1 región corporal (clásico).
• **Opción B:** LMN en ≥2 regiones (para PMA = atrofia muscular progresiva).

**Signos de UMN:** hiperreflexia, espasticidad, Babinski, clonus, reflejos primitivos.
**Signos de LMN:** debilidad, atrofia, fasciculaciones clínicas, EMG con denervación.

**3. Exclusión razonable de otras causas:**
NCS motoras y sensitivas normales (o cambios mínimos atribuibles a atrapamiento). LMD, VCM y amplitudes SNAP deben ser normales. Neuroimagen apropiada (RM cervical para descartar mielopatía espondilótica).

**Las 4 regiones EMG:**
• **Bulbar:** lengua (geniogloso), masetero, orbicular de labios.
• **Cervical:** deltoides, bíceps, tríceps, FDI, APB + paraespinales cervicales.
• **Torácica:** paraespinales torácicos, recto abdominal.
• **Lumbosacra:** vasto lateral, tibial anterior, gastrocnemio medial, EHL + paraespinales lumbares.`,
          clinicalPearls: [
            'PROTOCOLO EMG MÍNIMO EN SOSPECHA DE ELA: explorar al menos 1 músculo de cada una de las 4 regiones. Si encuentras denervación activa (fibrilaciones/PSW o fasciculaciones complejas) en 2+ regiones con NCS normales → Gold Coast positivo.',
            'La región torácica es la más infraexplorada pero la más ESPECÍFICA para ELA: fibrilaciones en paraespinales torácicos o recto abdominal en un paciente con debilidad progresiva prácticamente sella el diagnóstico.',
            'Error frecuente: no explorar la lengua. Las fibrilaciones en geniogloso + extremidades = evidencia de 2 regiones (bulbar + cervical/lumbosacra) y es suficiente para Gold Coast.',
          ],
        },
        {
          id: 'als-emg-features',
          title: 'Hallazgos EMG Característicos en ELA',
          content: `La tríada EMG en ELA combina signos de denervación ACTIVA con signos de reinervación CRÓNICA, reflejando el proceso continuo de muerte y compensación de motoneuronas.

**Denervación activa (muerte de motoneuronas en curso):**
• Fibrilaciones y PSW en múltiples músculos de múltiples regiones.
• Fasciculaciones: las complejas/inestables (morfología polifásica, amplitud variable) son diagnósticas. Las simples/estables pueden ser benignas.

**Reinervación crónica (compensación por motoneuronas sobrevivientes):**
• PUM gigantes: duración >20 ms, amplitud >5-10 mV. Resultado de reinervación colateral masiva.
• PUM polifásicos de larga duración.
• Reclutamiento reducido con frecuencia de disparo elevada (>20 Hz).

**Split Hand Sign (signo de la mano dividida):**
Atrofia preferencial de APB (abductor del pulgar) y FDI (primer interóseo dorsal) con preservación relativa de ADM (abductor del meñique). Es un patrón de denervación cortical, no periférica — refleja la vulnerabilidad selectiva de las motoneuronas corticales que inervan los músculos tenares. Muy específico de ELA vs otras neuropatías.

**Split Leg Sign:**
Análogo en miembro inferior: debilidad desproporcionada de tibial anterior (dorsiflexión, L5) vs gastrocnemio (S1). Refleja también un patrón cortical.`,
          clinicalPearls: [
            'SPLIT HAND: Si un paciente tiene atrofia de APB+FDI >> ADM, piensa ELA antes que neuropatía ulnar. En neuropatía ulnar, el FDI y ADM se afectan juntos (ambos son ulnares). En ELA, el APB (mediano) y FDI (ulnar) se afectan juntos por patrón cortical.',
            'Las fasciculaciones en ELA tienen un patrón de disparo con intervalos irregulares y morfología compleja/inestable. Las fasciculaciones benignas (por estrés, cafeína) son regulares y con morfología estable. El audio ayuda: "pop-pop-pop" irregular = sospechoso.',
            'En ELA temprana, los PUM pueden ser nacientes (pequeños, inestables) antes de volverse gigantes. No descartes ELA solo porque no veas gigantes — en fases iniciales predomina la denervación activa sobre la reinervación.',
          ],
          keyPoints: [
            'Tríada EMG: fibrilaciones/PSW + fasciculaciones complejas + PUM gigantes con reclutamiento reducido.',
            'Split Hand: APB+FDI atrofiados > ADM → patrón cortical = ELA.',
            'Fasciculaciones complejas = equivalente a fibrilaciones (Gold Coast/Awaji).',
            'NCS motoras y sensitivas DEBEN ser normales en ELA (sin desmielinización, SNAP normal).',
          ],
        },
        {
          id: 'als-mimics',
          title: 'Diagnósticos Diferenciales y Trampas de ELA',
          content: `El diagnóstico erróneo de ELA tiene consecuencias devastadoras para el paciente. Estas son las condiciones que más frecuentemente simulan ELA:

**1. Neuropatía Motora Multifocal (NMM):**
Simula ELA-LMN. Debilidad asimétrica progresiva sin afectación sensitiva. CLAVE: bloqueos de conducción motor focales + SNAP normales + Anti-GM1 IgM. TRATABLE con IVIg.

**2. Mielopatía cervical espondilótica:**
Compresión medular que causa UMN en piernas + LMN en manos por radiculopatía cervical. RM cervical diferencia. Hallazgos EMG limitados a C5-T1 (no 4 regiones).

**3. Radiculopatía cervical multiradicular:**
Denervación en múltiples miotomas cervicales. SNAP normales (como en ELA). Clave: limitado a 1 región (cervical), paraespinales afectados focalmente, dolor radicular presente.

**4. Enfermedad de Kennedy:**
Atrofia muscular bulboespinal ligada al X. Varones con debilidad LMN progresiva + atrofia lingual + ginecomastia. Diagnóstico: expansión CAG en gen del receptor de andrógenos. CLAVE definitiva: SNAPs ANORMALES (a diferencia de ELA donde son normales).

**5. Síndrome post-polio:**
Debilidad progresiva tardía décadas después de poliomielitis. PUM gigantes y fasciculaciones en territorios previamente afectados. No hay signos de UMN. Historia de polio infantil.

**6. Miopatía por cuerpos de inclusión (IBM):**
Patrón mixto miopático+neurogénico que puede simular ELA. Debilidad de cuádriceps + flexores de dedos. CK moderadamente elevada. EMG con PUM gigantes en algunos músculos.`,
          clinicalPearls: [
            'REGLA DE ORO ante sospecha de ELA: SIEMPRE descartar NMM antes de dar el diagnóstico. Solicitar NCS completas buscando bloqueos de conducción + anti-GM1. La NMM es tratable y su confusión con ELA es un error inaceptable.',
            'Kennedy vs ELA: los SNAPs claramente reducidos o ausentes en Kennedy son la diferencia salvadora. En ELA los SNAPs son SIEMPRE normales. SNAPs anormales + debilidad progresiva LMN + bulbar = Kennedy (solicitar genética).',
            'Si las fasciculaciones son el hallazgo dominante sin debilidad clara ni denervación activa, considerar Síndrome de Fasciculaciones Benignas o Síndrome de Calambres-Fasciculaciones. NO diagnosticar ELA solo por fasciculaciones — REQUIERE evidencia de denervación activa.',
          ],
          keyPoints: [
            'NMM: bloqueos motor + SNAP normal + anti-GM1 → TRATABLE (¡no confundir con ELA!).',
            'Kennedy: SNAPs ANORMALES + LMN + ginecomastia → genética CAG.',
            'Mielopatía cervical: UMN piernas + LMN manos, solo 1 región → RM.',
            'Fasciculaciones aisladas SIN denervación activa ≠ ELA.',
          ],
        },
      ],
    },

    // ═══════════════════════════════════════════════════════════════
    // 4. SGB Y SUBTIPOS
    // ═══════════════════════════════════════════════════════════════
    {
      id: 'gbs-subtypes',
      title: 'Criterios de SGB y Subtipos',
      description: 'Clasificación electrodiagnóstica del Síndrome de Guillain-Barré y sus variantes',
      content: 'El SGB es la causa más frecuente de parálisis flácida aguda adquirida. La clasificación electrodiagnóstica diferencia subtipos con pronósticos y mecanismos fisiopatológicos distintos. Los criterios de Hadden (1998), Ho (1995) y Rajabally (2015) son los sistemas más utilizados, pero TODOS requieren estudios seriados para una clasificación precisa — el estudio inicial puede ser equívoco o clasificar erróneamente.',
      clinicalPearls: [
        'PERLA TEMPORAL: las anomalías NCS aparecen en secuencia predecible. Semana 1: ondas F ausentes/prolongadas y reflejo H ausente (hallazgo MÁS TEMPRANO). Semanas 2-3: bloqueos de conducción y enlentecimiento franco (criterios Hadden completos). Semana >3: EMG de aguja revela fibrilaciones si hubo daño axonal.',
        'El CMAP distal del nervio peroneo es el mejor marcador pronóstico individual. CMAP peroneo <1 mV en la primera semana predice mala recuperación con alta especificidad. Este dato solo debe comunicarse al equipo tratante para guiar la decisión de plasmaféresis vs IVIg.',
        'Un estudio NCS "normal" en la primera semana NO descarta SGB. Las ondas F y el reflejo H pueden ser los únicos hallazgos anormales. Si la sospecha es alta y el estudio inicial es normal, REPETIR a las 2-3 semanas.',
      ],
      keyPoints: [
        'Subtipos: AIDP (desmielinizante, ~60-80% en occidente), AMAN (axonal motor), AMSAN (axonal sensitivo-motor), MFS.',
        'Hallazgo más temprano: ausencia de ondas F y reflejo H (semana 1).',
        'Criterios completos: estudios seriados a semanas 2-3.',
        'CMAP distal bajo (<1 mV) = mau pronóstico.',
      ],
      children: [
        {
          id: 'aidp-criteria',
          title: 'AIDP — Polineuropatía Desmielinizante Inflamatoria Aguda',
          content: `Forma predominante en países occidentales (60-80%). Mecanismo: ataque inmunomediado a la mielina de los nervios periféricos.

**Criterios electrofisiológicos de Hadden para AIDP:**
• VCM <90% LIN (o <85% si CMAP <50% del LIN) en ≥2 nervios.
• LMD >110% LSN (o >120% si CMAP <100% del LIN) en ≥2 nervios.
• Latencia de onda F >120% LSN en ≥2 nervios.
• Bloqueo de conducción parcial o dispersión temporal en ≥1 nervio.

**Sural Sparing Pattern (Patrón de Preservación Sural):**
Hallazgo altamente ESPECÍFICO de AIDP temprana. Los SNAPs de mediano y ulnar están ausentes o reducidos, pero el SNAP sural es paradójicamente NORMAL. Esto ocurre porque las raíces dorsales lumbosacras (que alimentan al sural) se afectan más tardíamente que las cervicales.

Sensibilidad del Sural Sparing para AIDP: ~50%. Especificidad: >90%. Si lo encuentras, es prácticamente diagnóstico.`,
          clinicalPearls: [
            'SURAL SPARING = AIDP hasta probar lo contrario. En toda polineuropatía aguda, compara el SNAP sural con el SNAP mediano/ulnar. Si el sural está normal pero los de extremidad superior están bajos → AIDP.',
            'El "SGB inexcitable" (nervios completamente no excitables) en la primera semana tiene dos posibilidades: AIDP severísima o AMAN. Repetir a las 3-4 semanas diferencia: si los CMAPs reaparecen rápidamente = RCF por AMAN; si persisten bajos = AIDP axonal secundaria de mal pronóstico.',
          ],
        },
        {
          id: 'aman-rcf',
          title: 'AMAN y Fallo de Conducción Reversible (RCF)',
          content: `La variante AMAN (Neuropatía Axonal Motora Aguda) es predominante en Asia, Latinoamérica y Centroamérica. Mediada por anticuerpos anti-gangliósido (GM1, GD1a) que atacan los nodos de Ranvier.

**Criterios NCS para AMAN:**
• Amplitudes de CMAP reducidas sin criterios de desmielinización.
• VCM, LMD y ondas F normales o con anomalías mínimas.
• SNAPs NORMALES (diferencia clave vs AMSAN).

**Fallo de Conducción Reversible (RCF):**
Concepto crítico. Los anticuerpos anti-nodales bloquean la conducción en los nodos de Ranvier SIN destruir el axón. Esto produce CMAPs muy bajos o bloqueos de conducción en fase aguda que simulan desmielinización, pero se resuelven en días-semanas (mucho más rápido que la regeneración axonal o remielinización).

**Implicaciones del RCF:**
• Estudio inicial: puede clasificarse erróneamente como AIDP por los bloqueos.
• Estudio de seguimiento (2-4 semanas): los CMAPs se recuperan dramáticamente → confirma RCF/AMAN.
• Pronóstico del RCF: MUCHO mejor que la AMAN con degeneración axonal verdadera.

**AMSAN (Axonal Sensitivo-Motora Aguda):**
Peor pronóstico del espectro GBS. CMAPs Y SNAPs reducidos. Denervación masiva en EMG. Recuperación lenta e incompleta.`,
          clinicalPearls: [
            'RCF es la trampa #1 en la clasificación del GBS. Un paciente con CMAPs muy bajos y "bloqueos" en semana 1 que se recupera espectacularmente en semana 3 NO tenía AIDP — tenía AMAN con RCF. Los estudios seriados son OBLIGATORIOS para la clasificación correcta.',
            'En Latinoamérica, la proporción de AMAN es significativamente mayor que en Europa/EEUU. Siempre considerar AMAN/RCF ante un GBS con CMAPs bajos pero SNAPs normales, especialmente post-diarrea por Campylobacter (asociación fuerte con anti-GM1).',
          ],
        },
        {
          id: 'mfs-criteria-detail',
          title: 'Síndrome de Miller Fisher (MFS)',
          content: `Variante craneal del SGB que constituye ~5% de los casos.

**Tríada clínica:** Oftalmoplejía + Ataxia + Arreflexia.

**Biomarcador:** Anticuerpos anti-GQ1b IgG positivos en >90% de los casos. Altamente específicos.

**Hallazgos electrodiagnósticos:**
• SNAPs: reducidos o ausentes tempranamente (hallazgo MÁS característico). La neuropatía sensitiva es profunda y precoz.
• CMAPs: generalmente preservados (la afectación motora de extremidades es mínima).
• Ondas F: ausentes o prolongadas frecuentemente.
• Reflejo H: ausente.
• **Blink Reflex:** Alteración de R1 y/o R2. R1 prolongada = lesión aferente trigeminal o del arco pontino. R2 ausente o prolongada bilateralmente = lesión bulbar/pontina. El blink reflex puede ser el primer estudio anormal y su normalización precede a la recuperación clínica.

**Variantes superpuestas:** MFS con afectación de extremidades (overlap MFS-GBS), Encefalitis de Bickerstaff (MFS + alteración de conciencia), forma faringeo-cervico-braquial.`,
          clinicalPearls: [
            'Ante oftalmoplejía aguda + arreflexia: solicitar anti-GQ1b ANTES del estudio electrodiagnóstico. El anticuerpo es casi patognomónico y puede estar positivo antes de que aparezcan anomalías NCS.',
            'El Blink Reflex es la prueba electrodiagnóstica más sensible en MFS temprano. Si las NCS de extremidades son normales pero sospechas MFS, haz el blink reflex — puede ser el único hallazgo anormal.',
          ],
        },
      ],
    },

    // ═══════════════════════════════════════════════════════════════
    // 5. NMM — BLOQUEO DE CONDUCCIÓN
    // ═══════════════════════════════════════════════════════════════
    {
      id: 'mmn-criteria',
      title: 'Neuropatía Motora Multifocal (NMM)',
      description: 'Criterios de bloqueo de conducción, anti-GM1 y diferenciación de ELA',
      content: 'La NMM es una neuropatía motora pura inmunomediada caracterizada por bloqueos de conducción motor focales con preservación completa de la función sensitiva. Su reconocimiento es CRÍTICO porque simula ELA pero es TRATABLE con IVIg.',
      clinicalPearls: [
        'REGLA CLÍNICA #1: Todo paciente con debilidad progresiva de LMN asimétrica, predominio en extremidad superior, sin afectación sensitiva y sin signos de UMN → descartar NMM ANTES de considerar ELA. El coste de este error es altísimo.',
        'La NMM tiene predilección extrema por los nervios del miembro superior: radial (muñeca caída), mediano (debilidad de pinza), ulnar (atrofia interóseos). Afecta nervios individuales en distribución no radicular.',
        'Hasta 50% de los pacientes con NMM pueden tener anti-GM1 NEGATIVOS. Un anti-GM1 negativo NO descarta NMM si los bloqueos de conducción están presentes.',
      ],
      keyPoints: [
        'Bloqueo motor definitivo: caída CMAP >50% fuera de sitios de atrapamiento + SNAP normal.',
        'Anti-GM1 IgM: positivo en 50-80% (diagnóstico de soporte, no excluyente).',
        'Diferencia vs CIDP: SNAPs normales en NMM, anormales en CIDP.',
        'Diferencia vs ELA: bloqueos de conducción en NMM, ausentes en ELA.',
        'Tratamiento: IVIg (primera línea). NO usar corticoides (pueden empeorar).',
      ],
      children: [
        {
          id: 'mmn-block-criteria',
          title: 'Criterios de Bloqueo de Conducción AANEM',
          content: `**Bloqueo de conducción motor DEFINITIVO:**
• Caída de área o amplitud del CMAP >50% entre estimulación proximal y distal.
• Duración del CMAP proximal: aumento <30% (para excluir dispersión temporal como causa del pseudobloqueo).
• CMAP distal >1 mV (amplitudes muy bajas pueden dar falsos bloqueos por ruido).
• El segmento del bloqueo NO debe corresponder a un sitio de atrapamiento clásico.

**Bloqueo de conducción motor PROBABLE:**
• Caída de CMAP >30% en segmentos largos (brazo completo) o >50% en segmentos cortos.

**Técnica de INCHING para localización precisa:**
Estimular en incrementos de 2 cm a lo largo del nervio para localizar exactamente el sitio del bloqueo. Un salto de latencia >0.4 ms o caída de amplitud >20% en un segmento de 2 cm localiza la lesión focal.

**Nervios a explorar (orden de rendimiento):**
1. Ulnar (brazo a codo a muñeca)
2. Mediano (axila a codo a muñeca)
3. Radial (axila a supinador)
4. Peroneo (cabeza de peroné a tobillo — excluir atrapamiento en cuello peroné)
5. Tibial (poplíteo a tobillo)`,
          clinicalPearls: [
            'TRAMPA TÉCNICA: un bloqueo a nivel de codo de nervio ulnar probablemente es atrapamiento cubital, NO NMM. Los bloqueos de NMM típicamente están en sitios NO convencionales: mitad del brazo, antebrazo proximal, axila.',
            'Inching es la técnica definitiva para NMM. Si sospechas NMM y las NCS estándar son normales, realiza inching del nervio más débil clínicamente — puedes encontrar un bloqueo focal en un segmento corto que el estudio estándar "promedió" y no detectó.',
          ],
        },
        {
          id: 'mmn-vs-cidp-vs-als',
          title: 'Triple Diferencial: NMM vs CIDP vs ELA',
          content: `| Característica | NMM | CIDP | ELA |
|---|---|---|---|
| Distribución | Asimétrica, focal | Simétrica, difusa | Difusa, progresiva |
| Sensitivo | Normal | Anormal | Normal |
| UMN | Ausente | Ausente | PRESENTE |
| Bloqueo motor | Sí (focal) | Sí (difuso) | No |
| SNAP | Normal | Anormal | Normal |
| VCM | Normal (fuera del bloqueo) | Lenta difusamente | Normal |
| Anti-GM1 | 50-80% positivo | Negativo | Negativo |
| CK sérica | Normal/leve ↑ | Normal | Normal/leve ↑ |
| LCR proteínas | Normal | Elevadas | Normal |
| Corticoides | EMPEORAN | Mejoran | Sin efecto |
| IVIg | Mejora | Mejora | Sin efecto |
| Rituximab | Puede ayudar | Útil en nodopatías | Sin efecto |`,
          clinicalPearls: [
            'Los corticoides EMPEORAN la NMM. Si un paciente con "CIDP motora pura" empeora con corticoides, reconsidera NMM y cambia a IVIg exclusivo.',
            'En la práctica: SNAP anormal → NO es NMM (probablemente CIDP/Lewis-Sumner). SNAP normal + bloqueo → NMM. SNAP normal + sin bloqueo → ELA o Kennedy.',
          ],
        },
      ],
    },

    // ═══════════════════════════════════════════════════════════════
    // 6. CRITERIOS DE UNIÓN NEUROMUSCULAR
    // ═══════════════════════════════════════════════════════════════
    {
      id: 'nmj-criteria',
      title: 'Criterios de la Unión Neuromuscular',
      description: 'Miastenia Gravis, Lambert-Eaton y botulismo — protocolos diagnósticos completos',
      content: 'Los trastornos de la unión neuromuscular (UNM) se diagnostican mediante una cascada electrodiagnóstica sistemática: ENR (Estimulación Nerviosa Repetitiva) → ejercicio breve → SFEMG. Cada paso tiene sensibilidad y especificidad crecientes.',
      children: [
        {
          id: 'mg-protocol',
          title: 'Miastenia Gravis: Protocolo ENR Detallado',
          content: `**Protocolo estándar de ENR para MG:**

**1. Preparación:**
• Temperatura cutánea >32°C (el frío reduce el decremento).
• Suspender anticolinesterásicos (piridostigmina) 12-24 horas antes si es posible.
• Paciente relajado, extremidad inmovilizada.

**2. Estimulación lenta a 2-3 Hz (6-10 estímulos):**
• Evaluar decremento entre el 1er y 4to/5to potencial.
• Decremento >10% = ANORMAL (patrón en "U" o "silla de montar").
• El máximo decremento ocurre entre el 3er y 5to estímulo.

**3. Músculos a evaluar (orden de rendimiento diagnóstico):**
• Trapecio/espinal accesorio (mayor rendimiento en MG generalizada).
• Nasalis/facial (rendimiento en MG ocular).
• Deltoides/axilar.
• ADM/ulnar (menor rendimiento pero más cómodo).

**4. Ejercicio breve (10 segundos de contracción máxima):**
• Post-ejercicio inmediato: facilitación (reparación del decremento por movilización de Ca²⁺).
• Post-ejercicio 2-4 min: agotamiento post-tetánico (decremento se exacerba).

**5. Sensibilidad del ENR en MG:**
• MG generalizada: 75-80%.
• MG ocular pura: 30-50% (muy baja — SFEMG es necesario).`,
          clinicalPearls: [
            'SI el ENR es NORMAL pero la sospecha clínica es ALTA → SFEMG. La sensibilidad del SFEMG es >95% vs 75-80% del ENR. No descartes MG con un ENR normal.',
            'El trapecio (nervio accesorio) tiene MAYOR rendimiento que el ADM (ulnar) para ENR en MG generalizada. Si solo puedes evaluar un músculo, elige el trapecio.',
            'TRAMPA: el ejercicio PREVIO al ENR (incluso caminar al laboratorio o apretar la mano repetidamente) puede causar facilitación que ENMASCARA el decremento. Asegura reposo de 1-2 minutos antes del ENR.',
            'Evalúa el decremento entre el 1er y 4to estímulo, NO entre el 1er y 2do. La comparación 1-4 tiene mejor reproducibilidad.',
          ],
          keyPoints: [
            'Decremento >10% a 2-3 Hz = anormal para MG.',
            'Máximo decremento: entre 3er y 5to estímulo (patrón en U).',
            'Mejor músculo: trapecio (generalizada), nasalis (ocular).',
            'Sensibilidad ENR: ~80% generalizada, ~40% ocular.',
            'ENR normal + sospecha alta → SFEMG (sensibilidad >95%).',
          ],
        },
        {
          id: 'lems-protocol',
          title: 'Lambert-Eaton: Diagnóstico y Patrón de Facilitación',
          content: `**Tríada electrodiagnóstica del LEMS:**

**1. CMAPs basales con amplitudes MUY BAJAS:**
Amplitudes reducidas difusamente (frecuentemente <50% del LIN) en TODOS los nervios motores. A diferencia de MG donde los CMAPs basales suelen ser normales.

**2. Decremento a estimulación lenta (2-3 Hz):**
Presente como en MG, pero causado por deficiencia presináptica de Ca²⁺ (no postsináptica de AChR).

**3. Facilitación post-ejercicio MASIVA (>100%):**
Tras 10-15 segundos de contracción máxima, la amplitud del CMAP aumenta >100% (frecuentemente 200-400%). Este es el hallazgo PATOGNOMÓNICO de LEMS.

**Mecanismo:** El ejercicio intenso abre canales de Ca²⁺ dependientes de voltaje masivamente, superando temporalmente el bloqueo autoinmune de los canales P/Q presinápticos.

**Alternativa:** ENR a alta frecuencia (20-50 Hz) produce incremento equivalente, pero es MUY doloroso. El test de ejercicio es preferido.

**Asociación oncológica:**
• 50-60% de los LEMS tienen cáncer subyacente (carcinoma de células pequeñas pulmonar es el más frecuente).
• Anticuerpos anti-VGCC (canales de calcio voltaje-dependientes tipo P/Q) positivos en >85%.
• Todo diagnóstico de LEMS → TAC de tórax + seguimiento oncológico obligatorio.`,
          clinicalPearls: [
            'LEMS = "MG al revés": CMAPs basales bajos que MEJORAN con ejercicio (en MG los CMAPs basales son normales y EMPEORAN con uso). Si los CMAPs están difusamente bajos en un paciente debilitado, haz test de ejercicio antes de asumir polineuropatía.',
            'Regla del 100%: incremento post-ejercicio <100% = puede ser MG con facilitación leve. Incremento >100% = prácticamente diagnóstico de LEMS.',
            'TODO paciente con LEMS confirmado necesita screening oncológico exhaustivo (TAC tórax, PET si TAC negativo) Y repetir cada 6 meses por 2 años — el cáncer puede aparecer hasta 5 años después del diagnóstico neuromuscular.',
          ],
          keyPoints: [
            'CMAPs basales difusamente bajos (a diferencia de MG donde son normales).',
            'Facilitación post-ejercicio >100% = patognomónico de LEMS.',
            'Anti-VGCC P/Q positivos en >85%.',
            '50-60% asociado con carcinoma de células pequeñas de pulmón.',
          ],
        },
        {
          id: 'botulism-edx',
          title: 'Botulismo: Patrón Electrodiagnóstico',
          content: `El botulismo es una emergencia neuromuscular presináptica que comparte hallazgos con LEMS pero con diferencias clave.

**Hallazgos NCS/ENR:**
• CMAPs basales BAJOS difusamente (similar a LEMS).
• Decremento a 2-3 Hz presente.
• Facilitación post-ejercicio variable (50-100%, menor que LEMS).
• SNAPs generalmente normales (la toxina afecta solo la transmisión motora presináptica).

**EMG de aguja:**
• PUM cortos, de baja amplitud, polifásicos (patrón "miopático-like" por bloqueo incompleto de muchas fibras de cada UM).
• Fibrilaciones y PSW pueden aparecer en casos severos (denervación funcional prolongada).
• PUM inestables (variación entre disparos) — reflejo de la inestabilidad de la transmisión.

**Diferenciación LEMS vs Botulismo:**
| | LEMS | Botulismo |
|---|---|---|
| Inicio | Subagudo/crónico | Agudo (horas-días) |
| Pupilas | Normales | Midriasis fija |
| Facilitación | >100% | <100% (variable) |
| Anticuerpos | Anti-VGCC | Toxina botulínica |
| Curso | Crónico | Agudo, recuperación lenta |`,
          clinicalPearls: [
            'Botulismo infantil: EMG puede mostrar BISAP (Brief, Small, Abundant Potentials) — PUM cortos, pequeños y abundantes. Este patrón "pseudo-miopático" es muy característico pero confuso si no se conoce.',
            'La facilitación en botulismo suele ser menor (50-100%) que en LEMS (>100%). Si los CMAPs basales están muy bajos con facilitación <100% y el inicio fue agudo → piensa botulismo o intoxicación, no LEMS.',
          ],
        },
      ],
    },

    // ═══════════════════════════════════════════════════════════════
    // 7. ALGORITMOS DIAGNÓSTICOS
    // ═══════════════════════════════════════════════════════════════
    {
      id: 'diagnostic-algorithms',
      title: 'Algoritmos Diagnósticos',
      description: 'Flujogramas clínicos para debilidad, polineuropatía, fatigabilidad y patrón proximal/distal',
      children: [
        {
          id: 'upper-limb-weakness',
          title: 'Flujograma: Debilidad de Miembro Superior',
          content: `**Paso 1: NCS motoras y sensitivas** (mediano, ulnar, radial)

**→ NCS anormales FOCALMENTE:**
• LMD prolongada mediano aislada → STC (comparar con ulnar al 4to dedo)
• Enlentecimiento ulnar en codo → Neuropatía ulnar en codo (inching)
• Caída radial focal → Neuropatía radial (canal espiral o PIN)

**→ NCS anormales DIFUSAMENTE:**
• Axonal (amplitudes bajas, VCM normal) → Polineuropatía axonal (DM, tóxica, CMT2)
• Desmielinizante (VCM lenta, bloqueos) → CIDP vs CMT1 (segmentaria vs uniforme)
• Bloqueo motor focal + SNAP normal → NMM (solicitar anti-GM1)

**→ NCS NORMALES + EMG ANORMAL:**
• SNAP normal + fibrilaciones en distribución radicular + paraespinales (+) → Radiculopatía cervical
• SNAP normal + denervación en >1 raíz + sin paraespinales → sospecha ELA
• SNAP normal + denervación difusa multirregional → ELA (Gold Coast si progresivo + UMN)
• Patrón miopático (PUM cortos, reclutamiento precoz) → Miopatía (CK, biopsia)

**→ NCS y EMG NORMALES:**
• Sospecha UNM → ENR/SFEMG
• Debilidad funcional/no orgánica → evaluación psiquiátrica`,
          clinicalPearls: [
            'La pregunta clave en MS: ¿las NCS sensitivas son normales o anormales? SNAP normal + debilidad → lesión preganglionar (radiculopatía) o motoneurona (ELA). SNAP anormal → lesión postganglionar (plexopatía, polineuropatía).',
          ],
        },
        {
          id: 'lower-limb-weakness',
          title: 'Flujograma: Debilidad de Miembro Inferior',
          content: `**Paso 1: NCS motoras y sensitivas** (peroneo, tibial, sural, peroneo superficial)

**→ Pie caído agudo unilateral:**
• Enlentecimiento/bloqueo peroneo en cabeza de peroné → Neuropatía peronea (compresiva, posicional)
• NCS peroneo normal + denervación tibial anterior y glúteo medio → Radiculopatía L5 (confirmar con paraespinales)
• NCS normal + denervación peroneo + tibial posterior aislado → Lesión del nervio ciático (división peronea)

**→ Debilidad proximal bilateral:**
• NCS normales + PUM miopáticos en cuádriceps/iliopsoas → Miopatía (inflamatoria, metabólica, distrofia)
• NCS normales + PUM neurogénicos proximales → Radiculopatía lumbar alta (L2-L4) o plexopatía lumbar
• SNAP safeno anormal + debilidad cuádriceps → Neuropatía femoral o plexopatía lumbar

**→ Polineuropatía longitud-dependiente:**
• SNAP sural ausente + CMAP peroneo bajo → Polineuropatía axonal (DM, alcohol, tóxica)
• VCM tibial/peroneo <70% LIN → Polineuropatía desmielinizante → ¿uniforme (CMT1) o segmentaria (CIDP)?

**→ Amiotrofia diabética:**
• Debilidad proximal unilateral + dolor severo muslo + SNAP safeno ↓ + denervación femoral/obturador multirradicular → Radiculoplexoneuropatía lumbosacra diabética (Bruns-Garland)`,
          clinicalPearls: [
            'Pie caído agudo: la pista para diferenciar L5 vs peroneo es el tibial posterior (inversión del pie, L5 pero nervio tibial). Si el tibial posterior está débil, la lesión es L5 (no peroneo). Si el tibial posterior está normal, la lesión es del nervio peroneo.',
            'Amiotrofia diabética (Bruns-Garland): NO es "simplemente neuropatía diabética progresada". Es una vasculitis autoinmune que puede responder a inmunoterapia. Diagnosticarla correctamente cambia el tratamiento.',
          ],
        },
        {
          id: 'sensorimotor-poly',
          title: 'Flujograma: Polineuropatía Sensitivo-Motora',
          content: `**Paso 1: ¿Distribución longitud-dependiente?**
• Sí (stocking-glove) → Paso 2
• No (no longitud-dependiente, asimétrico) → CIDP variante, vasculitis, sarcoidosis, multifocal

**Paso 2: ¿Patrón axonal o desmielinizante?**

**→ AXONAL (amplitudes ↓, VCM >75% LIN):**
• Simétrica sensitivo-motora → DM, alcohol, deficiencia B12, tóxica, amiloidosis
• Sensitiva pura → Cisplatino (ganglioneuropatía), Sjögren, paraneoplásica
• Con dolor neuropático severo → Fibra fina (NCS normales, biopsia piel), amiloidosis

**→ DESMIELINIZANTE (VCM <70% LIN):**
• ¿Uniforme (todos los nervios igualmente lentos, sin bloqueos)?
  → CMT1 (hereditaria). Solicitar genética PMP22.
• ¿Segmentaria (asimétrica, con bloqueos y dispersión)?
  → CIDP (adquirida, tratable). Confirmar EAN/PNS 2021.
  → Si LMD desproporcionadamente prolongada + IgM → DADS/anti-MAG
  → Si motor puro con bloqueos + SNAP normal → NMM

**Paso 3: Velocidad <70% LIN en >1 nervio + bloqueos → CIDP**
→ Tratable con IVIg, plasmaféresis o corticoides.`,
          clinicalPearls: [
            'La "regla del 70%": VCM <70% del LIN = desmielinización primaria. VCM entre 70-80% = zona gris (puede ser axonal severa con pérdida de fibras rápidas). VCM >80% = axonal pura.',
            'Si identificas CIDP en un paciente diabético: es CIDP-on-diabetes, una entidad tratable. NO asumir que "la neuropatía empeoró por la diabetes".',
          ],
        },
        {
          id: 'fatigability',
          title: 'Flujograma: Fatigabilidad',
          content: `**Debilidad fluctuante/fatigabilidad** → Sospecha de trastorno de UNM

**Paso 1: ENR a 2-3 Hz en músculo proximal/facial**
• Decremento >10% → Paso 2
• Decremento <10% → Paso 3

**Paso 2: ¿MG o LEMS?**
• CMAPs basales NORMALES + decremento proximal/facial → MG
  → Solicitar anti-AChR (80% sensibilidad) → si negativo: anti-MuSK (5-8%)
  → Si seronegativa: anti-LRP4 → SFEMG para confirmación
• CMAPs basales MUY BAJOS difusamente + decremento → Ejercicio 10s
  → Incremento >100% → LEMS (solicitar anti-VGCC + TAC tórax)
  → Incremento <100% + inicio agudo → Botulismo

**Paso 3: ENR normal + alta sospecha clínica**
→ SFEMG (sensibilidad >95% en MG generalizada)
• Jitter aumentado + bloqueo → Trastorno de UNM confirmado
• Jitter normal → Prácticamente descarta MG (buscar otras causas de fatigabilidad: miopatía mitocondrial, depresión, desacondicionamiento)

**Paso 4: Clasificación de MG si confirmada**
• Ocular pura (Grado I): ENR muchas veces normal → SFEMG en orbicular oculi
• Generalizada (Grado II-V): ENR trapecio + SFEMG si ENR normal`,
          clinicalPearls: [
            'Cascada de anticuerpos en MG: Anti-AChR (80%) → Anti-MuSK (5-8%) → Anti-LRP4 (2-5%) → Seronegativa (<10%). La MG anti-MuSK tiene fenotipo distinto: atrofia facial/bulbar prominente, crisis respiratorias frecuentes, respuesta pobre a anticolinesterásicos.',
            'CMAPs difusamente bajos SIN desmielinización y SIN polineuropatía = siempre haz ejercicio 10s. Un LEMS puede "esconderse" como polineuropatía axonal motora si no buscas la facilitación.',
          ],
        },
        {
          id: 'proximal-vs-distal',
          title: 'Flujograma: Debilidad Proximal vs. Distal',
          content: `**DEBILIDAD PREDOMINANTEMENTE PROXIMAL:**

**Con NCS normales:**
• EMG patrón miopático (PUM cortos, reclutamiento precoz) → Miopatía
  → CK elevada → Inflamatoria (PM/DM), distrofia muscular, miopatía necrotizante
  → CK normal → Miopatía endocrina (hipotiroidismo, Cushing), miopatía por estatinas, miopatía mitocondrial
• EMG patrón neurogénico → Radiculopatía (L2-L4 para MI proximal, C5-C6 para MS proximal)
• ENR decremento → MG (distribución proximal/ocular/bulbar)

**Con NCS anormales:**
• SNAP anormal + debilidad proximal → Plexopatía (braquial o lumbosacra)
• Patrón desmielinizante → CIDP (puede tener debilidad proximal prominente)

**DEBILIDAD PREDOMINANTEMENTE DISTAL:**

**Con NCS anormales:**
• Axonal longitud-dependiente → Polineuropatía (DM, tóxica, hereditaria CMT2)
• Desmielinizante distal con LMD prolongada → DADS / anti-MAG
• Bloqueos focales → NMM

**Con NCS normales:**
• EMG neurogénico multirregional sin dolor → ELA (si progresivo)
• EMG miopático distal → Distrofia miotónica (descargas miotónicas), miopatía distal (Welander, Miyoshi)
• PUM miopático + neurogénico mixto en cuádriceps + flexores dedos → IBM

**PATRÓN MIXTO (proximal + distal simultáneo):**
→ IBM, ELA avanzada, CIDP severa, distrofia miotónica`,
          clinicalPearls: [
            'IBM es el gran simulador: debilidad de cuádriceps (proximal) + flexores profundos de dedos (distal) + patrón EMG mixto. Si un paciente >50 años tiene esta combinación, piensa IBM ANTES que polimiositis — IBM no responde a inmunosupresión.',
            'La miopatía por estatinas puede presentarse con CK normal o ligeramente elevada. Si hay debilidad proximal con estatinas y CK es normal, la EMG sigue siendo valiosa: puede mostrar PUM miopáticos sutiles que confirman miopatía subclínica.',
          ],
        },
      ],
    },

    // ═══════════════════════════════════════════════════════════════
    // 8. DIFERENCIACIÓN DE PATRONES EMG
    // ═══════════════════════════════════════════════════════════════
    {
      id: 'emg-pattern-differentiation',
      title: 'Diferenciación de Patrones EMG',
      description: 'Patrones neurogénico, miopático, UNM y mixto — consolidación diagnóstica',
      content: 'La interpretación correcta del patrón EMG integra tres pilares: 1) actividad espontánea, 2) morfología del PUM, y 3) patrón de reclutamiento. Ningún hallazgo aislado es diagnóstico — la combinación de los tres es lo que define el patrón.',
      children: [
        {
          id: 'neurogenic-acute-chronic',
          title: 'Patrón Neurogénico: Agudo vs. Crónico',
          content: `**Neurogénico AGUDO (denervación activa, <3-6 meses):**
• Actividad espontánea: fibrilaciones y PSW abundantes (2+ a 4+).
• PUM: pueden ser normales inicialmente (si la lesión es <2-3 semanas), luego nacientes (pequeños, inestables, polifásicos) por reinervación precoz.
• Reclutamiento: reducido (pocas UM disponibles, cada una dispara rápido).
• Ejemplo: radiculopatía aguda, trauma nervioso, GBS.

**Neurogénico CRÓNICO (reinervación establecida, >6 meses):**
• Actividad espontánea: escasa o ausente (fibrilaciones solo si hay denervación activa superpuesta = "crónico activo").
• PUM: gigantes (duración >20 ms, amplitud >5 mV), polifásicos de larga duración. Resultado de reinervación colateral masiva.
• Reclutamiento: reducido pero con UM gigantes que generan más fuerza individual.
• Ejemplo: polineuropatía crónica, ELA en fase de reinervación, radiculopatía antigua.

**"Crónico ACTIVO" (el más comúno en ELA):**
• Combina ambos: PUM gigantes (reinervación antigua) + fibrilaciones (denervación activa simultánea). Este patrón dual es muy característico de ELA donde la muerte de motoneuronas es continua mientras las sobrevivientes siguen reinervando.`,
          clinicalPearls: [
            'PUM nacientes en denervación aguda son INDISTINGUIBLES morfológicamente de PUM miopáticos. La CLAVE es el reclutamiento: nacientes = reducido (neurogénico). Miopáticos = precoz (muchas UM para compensar fuerza perdida).',
            'No busques PUM gigantes en las primeras 4-6 semanas post-lesión. La reinervación colateral tarda 2-6 meses en madurar. En fase aguda solo verás fibrilaciones + reclutamiento reducido.',
          ],
        },
        {
          id: 'myopathic-pattern',
          title: 'Patrón Miopático y Variantes',
          content: `**Miopático clásico:**
• Actividad espontánea: generalmente ausente en miopatías crónicas no inflamatorias. PRESENTE (fibrilaciones/PSW) en miopatías inflamatorias (PM/DM), miopatías necrotizantes, y distrofia miotónica.
• PUM: cortos (<8 ms), baja amplitud (<300 µV), polifásicos.
• Reclutamiento: PRECOZ (muchas UM activadas para un esfuerzo mínimo).

**Miopatía inflamatoria (Polimiositis/Dermatomiositis):**
Tríada miopática agresiva: PUM cortos + fibrilaciones abundantes + reclutamiento precoz. Las fibrilaciones reflejan necrosis activa de fibras musculares individuales.

**IBM (Miositis por Cuerpos de Inclusión) — Patrón MIXTO:**
El gran confusor. Combina PUM miopáticos (cortos, polifásicos) CON PUM neurogénicos (gigantes, de larga duración) en el MISMO músculo. Este patrón mixto puede confundirse con ELA si no se reconoce. Distribución: cuádriceps + flexores profundos de dedos.

**Descargas miotónicas:**
Waxing-waning (bombardero en picada). Indican miotonía: DM1, DM2, miotonía congénita, paramiotonía. NO son sinónimo de miopatía inflamatoria — las descargas miotónicas sugieren canalopatía o distrofia miotónica.`,
          clinicalPearls: [
            'Fibrilaciones en músculo + NCS normales + CK alta: la combinación apunta a miopatía inflamatoria activa. La CK sola puede ser normal en IBM y miopatías crónicas — la EMG es más sensible que la CK para detectar actividad de enfermedad.',
            'Descargas miotónicas clínicas (dificultad para soltar objetos, rigidez al frío) + descargas miotónicas en EMG = buscar distrofia miotónica tipo 1 (DM1) con genética de expansión CTG en DMPK. La DM1 es MULTISISTÉMICA (cataratas, arritmias, diabetes, hipogonadismo).',
          ],
        },
        {
          id: 'nmj-pattern',
          title: 'Patrón de UNM en EMG Convencional',
          content: `**PUM inestables (variabilidad momento-a-momento):**
El hallazgo EMG convencional más evocador de trastorno de UNM. El PUM varía en amplitud, duración y número de fases entre disparos consecutivos porque algunas fibras de la UM fallan intermitentemente en la transmisión neuromuscular.

**¿Cómo reconocerlo?**
• Superponer 10+ trazados del mismo PUM. Si la forma varía significativamente entre disparos (componentes aparecen y desaparecen), el PUM es inestable.
• El AUDIO ayuda: el PUM suena "tembloroso" o "titubéante", como si tartamudeara.

**Causas de PUM inestable:**
1. Miastenia Gravis
2. Lambert-Eaton
3. Botulismo
4. Reinervación inmadura (UNM nuevas, pequeñas)

**Diferenciación:**
• UNM primaria (MG/LEMS): PUM inestable + morfología base NORMAL + NCS normales
• Reinervación: PUM inestable + morfología base ANORMAL (naciente o polifásico largo) + NCS con signos de neuropatía`,
          clinicalPearls: [
            'Si en EMG convencional ves un PUM inestable con morfología normal y las NCS son normales → piensa AUTOMÁTICAMENTE en MG o trastorno de UNM. Es la señal más "sutil" pero más evocadora en el estudio convencional.',
          ],
        },
        {
          id: 'recruitment-key',
          title: 'El Reclutamiento como Piedra Rosetta',
          content: `El patrón de reclutamiento es frecuentemente el dato más CONFIABLE para el diagnóstico diferencial porque es difícil de confundir:

**Normal:** el primer PUM aparece a ~5 Hz; un segundo PUM se recluta cuando el primero alcanza ~10 Hz. Ratio normal ≈ 5:1.

**Reducido (neurogénico):** pocas UM disponibles. Cada una dispara "sola" a alta frecuencia (>15-20 Hz). El trazado tiene "huecos" entre potenciales distinguibles.
• Una sola UM disparando a >20 Hz sin poder generar más fuerza = pérdida axonal grave.

**Precoz (miopático):** muchas UM reclutadas para un esfuerzo mínimo. El trazado parece "lleno" con un apretón suave. PUM son pequeños pero hay muchos.

**¿Cómo diferenciar CERTEZA?**
• Naciente (denervación aguda): PUM corto + reclutamiento REDUCIDO = neurogénico.
• Miopático: PUM corto + reclutamiento PRECOZ = miopático.

Ambos tienen PUM cortos y polifásicos. El reclutamiento es lo que los separa.`,
          clinicalPearls: [
            'TRUCO PRÁCTICO: pide al paciente un esfuerzo del "10%" — un apretón muy suave. Si con ese esfuerzo mínimo ya se activan 4-5 PUM simultáneamente, el reclutamiento es PRECOZ (miopático). Si solo 1 PUM dispara a alta frecuencia, es REDUCIDO (neurogénico).',
            'Nunca evalúes reclutamiento con contracción dolorosa o máxima forzada: el dolor inhibe voluntariamente creando un falso patrón reducido. Si el paciente no puede apretar bien, evalúa un músculo no doloroso.',
          ],
        },
      ],
    },

    // ═══════════════════════════════════════════════════════════════
    // 9. RED FLAGS Y TRAMPAS ELECTRODIAGNÓSTICAS
    // ═══════════════════════════════════════════════════════════════
    {
      id: 'edx-traps',
      title: 'Red Flags y Trampas Electrodiagnósticas',
      description: 'Errores frecuentes, falsos positivos/negativos y parámetros confusores',
      content: 'Incluso el electromiografista experimentado puede caer en trampas diagnósticas. Reconocer las fuentes de error más comunes previene diagnósticos erróneos con consecuencias graves.',
      children: [
        {
          id: 'false-block',
          title: 'Falsos Bloqueos de Conducción',
          content: `**1. Pseudobloqueo por degeneración walleriana incompleta:**
En los primeros 7-10 días post-axonotmesis, el segmento distal del axón aún conduce normalmente. El CMAP distal es normal pero el proximal (proximal al sitio de lesión) está ausente o bajo. Esto simula un bloqueo de conducción. Repetir a las 2-3 semanas: si el CMAP distal cae igualándose al proximal, era degeneración axonal, no bloqueo.

**2. Anastomosis de Martin-Gruber:**
Fibras motoras del mediano cruzan al ulnar en el antebrazo (15-30% de la población). El CMAP del mediano puede tener una deflexión positiva inicial en muñeca y el CMAP del ulnar puede parecer mayor con estimulación en codo que en muñeca, simulando un falso bloqueo inverso.

**3. Co-estimulación de nervio adyacente:**
Con estímulo excesivo, se activa accidentalmente un nervio vecino. El CMAP proximal incluye contribución del nervio adyacente, pareciendo mayor que el distal — o la morfología cambia, confundiendo el análisis.

**4. Dispersión temporal fisiológica:**
En nervios largos (peroneo, tibial), hay dispersión temporal fisiológica normal que puede reducir la amplitud proximal hasta 20-25%. Esto NO es bloqueo patológico.`,
          clinicalPearls: [
            'REGLA DE 7-10 DÍAS: cualquier "bloqueo" encontrado <10 días post-lesión aguda debe confirmarse con seguimiento a las 2-3 semanas. Es la trampa temporal más frecuente y la más peligrosa diagnosticamente.',
            'Martin-Gruber: si el CMAP del mediano en muñeca tiene una deflexión positiva inicial → sospecha anastomosis. Confirma estimulando el ulnar y comparando área/amplitud en codo vs muñeca.',
          ],
        },
        {
          id: 'temperature-trap',
          title: 'La Trampa de la Temperatura',
          content: `El frío modifica TODOS los parámetros NCS de maneras que simulan patología:

**Efectos del frío (<32°C) en NCS:**
• **VCM:** ↓ 1.5-2 m/s por cada °C bajo 33°C → simula desmielinización.
• **LMD:** ↑ prolongada → simula STC o desmielinización distal.
• **Amplitud CMAP/SNAP:** ↑ paradójicamente (los canales de Na⁺ permanecen abiertos más tiempo).
• **Duración CMAP:** ↑ ensanchada → simula dispersión temporal.

**Consecuencias diagnósticas:**
• Puede crear falsos diagnósticos de STC (LMD mediano prolongada).
• Puede simular criterios de desmielinización de CIDP (VCM lenta + LMD prolongada).
• Puede enmascarar un bloqueo de conducción real (el CMAP distal se agranda por el frío, reduciendo la diferencia proximal-distal).
• Puede "normalizar" un SNAP que debería estar bajo (amplitud artificialmente elevada por frío).

**SOLUCIÓN OBLIGATORIA:**
Medir temperatura cutánea ANTES de iniciar el estudio. Si <32°C en MS o <30°C en MI → calentar (agua tibia, lámparas infrarrojas, guantes calientes) y repetir la medición.`,
          clinicalPearls: [
            'Un paciente con manos frías (<31°C) y LMD mediano prolongada NO tiene necesariamente STC. Calentar la mano a >33°C y repetir. Si la LMD se normaliza, era efecto del frío.',
            'En invierno, siempre calentar las extremidades 10-15 minutos antes del estudio. Un estudio NCS confiable REQUIERE temperatura cutánea documentada.',
          ],
        },
        {
          id: 'pattern-pitfalls',
          title: 'Errores de Reconocimiento de Patrones',
          content: `**1. "No todo lo lento es desmielinización":**
La pérdida selectiva de fibras nerviosas rápidas (gruesas) en axonopatía severa puede enlentecer la VCM hasta 70-80% del LIN. Esto NO es desmielinización primaria — es pérdida axonal selectiva.

**2. "No toda fibrilación es denervación":**
Fibrilaciones aparecen en miopatías inflamatorias (necrosis de fibras individuales), rabdomiólisis, y ocasionalmente en miopatías metabólicas. Fibrilaciones + NCS normales + CK alta = sospecha miopatía inflamatoria, no neuropatía.

**3. "No todo PUM gigante es ELA":**
PUM gigantes aparecen en CUALQUIER proceso neurogénico crónico con reinervación colateral: polineuropatía crónica, radiculopatía antigua, síndrome post-polio, AME. El contexto clínico es esencial.

**4. "Un EMG normal no descarta todas las enfermedades neuromusculares":**
Normal en: neuropatía de fibra fina propioceptiva, miopatías leves sin actividad de enfermedad, MG ocular (ENR normal en 50-70%), canalopatías entre crisis.

**5. "No toda fasciculación es ELA":**
Fasciculaciones benignas (estrés, cafeína, ejercicio) son EXTREMADAMENTE comunes en personas sanas. Solo son significativas cuando se acompañan de denervación activa (fibrilaciones/PSW) en el mismo músculo o territorio.`,
          clinicalPearls: [
            'PERLA TRANQUILIZADORA: las fasciculaciones benignas son la causa más frecuente de consulta "aterrorizada" al EMG. Si las NCS son normales, no hay debilidad objetiva, no hay atrofia, y la EMG no muestra fibrilaciones → tranquilizar al paciente enfáticamente.',
            'Ante la duda entre axonopatía severa vs desmielinización leve: busca BLOQUEOS DE CONDUCCIÓN. Los bloqueos son exclusivos de la desmielinización. La axonopatía pura NUNCA produce bloqueos verdaderos (excepto el pseudobloqueo walleriano de los primeros 10 días).',
          ],
        },
      ],
    },
  ],
};
