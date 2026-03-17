// src/content/modules/module-09-pathologies-part1.ts
// Sections 1-4: Neuropatías Periféricas, Inflamatorias, Mononeuropatías, Radiculopatías
import { Topic } from '../../types/content';

// ═══════════════════════════════════════════════════════════════
// SECTION 1: NEUROPATÍAS PERIFÉRICAS
// ═══════════════════════════════════════════════════════════════
export const peripheralNeuropathies: Topic = {
  id: 'peripheral-neuropathies',
  title: 'Neuropatías Periféricas',
  content: 'Las neuropatías periféricas constituyen el grupo más amplio de patologías evaluadas en el laboratorio de electrodiagnóstico. Su clasificación electrodiagnóstica se basa en tres ejes fundamentales: **tipo de fibra afectada** (motora, sensitiva, mixta, autonómica), **mecanismo fisiopatológico** (axonal vs. desmielinizante vs. mixto) y **distribución** (longitud-dependiente, multifocal, no longitud-dependiente).',
  clinicalPearls: [
    'REGLA DE ORO: La clasificación EDX como axonal vs desmielinizante guía directamente el diferencial etiológico. Las neuropatías desmielinizantes adquiridas (CIDP, GBS, NMM) son TRATABLES con inmunoterapia. Las axonales requieren identificar y tratar la causa subyacente.',
    'En toda polineuropatía, el SNAP sural es el primer nervio sensitivo en afectarse (longitud-dependiente). Si el sural está normal pero los SNAPs de MS están ausentes, sospechar ganglioneuropatía (patrón NO longitud-dependiente).',
  ],
  keyPoints: [
    'Axonal: amplitudes reducidas con velocidades conservadas (>75% LIN).',
    'Desmielinizante: velocidades lentas (<70% LIN), latencias distales prolongadas, bloqueos de conducción, dispersión temporal.',
    'Mixto: elementos de ambos — frecuente en neuropatías crónicas donde la desmielinización secundaria acompaña pérdida axonal.',
  ],
  children: [
    {
      id: 'axonal-vs-demyelinating',
      title: 'Clasificación Electrodiagnóstica: Axonal vs. Desmielinizante',
      content: `La diferenciación electrodiagnóstica entre neuropatía axonal y desmielinizante es el paso diagnóstico más importante en la evaluación de polineuropatías.

**Criterios de Desmielinización (cualquiera de los siguientes en ≥2 nervios motores):**
• VCM < 70% del límite inferior normal (LIN).
• Latencia motora distal (LMD) > 150% del límite superior normal (LSN).
• Latencia de onda F > 120% del LSN (o > 150% si amplitud CMAP < 80% LIN).
• Bloqueo de conducción: caída de amplitud/área CMAP > 50% entre estimulación proximal y distal.
• Dispersión temporal anormal: duración del CMAP proximal > 130% del distal.

**Criterios de Axonopatía:**
• Amplitudes de CMAP y/o SNAP reducidas (< LIN) con velocidades de conducción normales o solo levemente reducidas (> 75-80% LIN).
• Latencias distales normales o mínimamente prolongadas.
• Sin bloqueos de conducción ni dispersión temporal.
• EMG de aguja: fibrilaciones/PSW (denervación activa) + PUMs de morfología neurogénica crónica (amplitud aumentada, duración prolongada, polifásicos).

**Patrón Mixto:**
Amplitudes reducidas CON enlentecimiento significativo de velocidades. Frecuente en:
• Neuropatías axonales crónicas severas donde la pérdida selectiva de fibras gruesas mielinizadas causa enlentecimiento secundario.
• CMT2 avanzado.
• Neuropatías desmielinizantes con daño axonal secundario (CIDP crónica).`,
      clinicalPearls: [
        'ERROR FRECUENTE: Interpretar velocidad levemente lenta (75-80% LIN) como \"desmielinizante\". En axonopatía severa, la pérdida selectiva de fibras gruesas (más rápidas) causa enlentecimiento SECUNDARIO. No es desmielinización primaria. Clave: las velocidades en axonopatía NUNCA bajan a < 70% LIN.',
        'Bloqueo de conducción: debe medirse en nervio motor, NO sensitivo. Un \"bloqueo\" aparente en SNAP suele ser error técnico o dispersión temporal fisiológica.',
        'La dispersión temporal patológica vs fisiológica: proximal > 130% del distal es anormal. Pero en nervios largos (tibial, peroneo), hasta 15-20% de dispersión puede ser normal.',
      ],
      keyPoints: [
        'Desmielinización primaria: velocidades < 70% LIN, LMD > 150% LSN, bloqueos, dispersión.',
        'Axonopatía: amplitudes bajas, velocidades > 75% LIN, EMG con denervación.',
        'Enlentecimiento secundario en axonopatía NO es desmielinización — las velocidades nunca bajan a < 70% LIN.',
      ],
    },
    {
      id: 'diabetic-neuropathy',
      title: 'Polineuropatía Diabética',
      content: `La causa más frecuente de polineuropatía en el mundo. Afecta al 50% de diabéticos tras 25 años de enfermedad.

**Polineuropatía Sensitivo-Motora Distal Simétrica (DSPN) — forma clásica:**
Patrón axonal sensitivo-motor longitud-dependiente (stocking-glove). Progresión típica:
1. SNAP sural reducido → 2. SNAP peroneo superficial reducido → 3. SNAP mediano/ulnar reducidos → 4. CMAP peroneo reducido → 5. CMAP tibial reducido.

**Otros patrones diabéticos:**
• **Neuropatía autonómica:** No detectable por NCS convencionales. Requiere pruebas autonómicas (QSART, Valsalva, tilt test).
• **Mononeuropatía diabética:** Usualmente isquémica. Craneal III (con preservación pupilar), femoral, mediano (STC — 2-4x más frecuente en diabéticos).
• **Radiculoplexoneuropatía lumbosacra (amiotrofia diabética):** Entidad autoinmune separada (ver sección Plexopatías).
• **Neuropatía de fibra fina diabética:** NCS normales con dolor quemante severo.

**Estadificación EDX de DSPN:**
| Estadio | Hallazgo NCS | SNAP Sural | CMAP Peroneo | EMG |
|---|---|---|---|---|
| 0 (subclínico) | Normal | Normal | Normal | Normal |
| 1 (sensitivo leve) | SNAP sural ↓ | < LIN | Normal | Normal |
| 2 (sensitivo-motor) | SNAP + CMAP ↓ | Ausente o ↓↓ | < LIN | Fibrilaciones EDB |
| 3 (severo) | Ausencias múltiples | Ausente | Ausente o ↓↓↓ | Denervación difusa |`,
      clinicalPearls: [
        'SCREENING: El SNAP sural bilateral es el estudio más sensible para detectar DSPN temprana. Si es normal, la probabilidad de DSPN clínicamente significativa es muy baja.',
        'TRAMPA DIAGNÓSTICA: No todo paciente diabético con neuropatía tiene neuropatía diabética. Descartar CIDP (tratable), deficiencia B12 (corregible), amiloidosis, hipotiroidismo. Si el patrón es desmielinizante, NO es diabética típica.',
        'La mononeuropatía craneal III diabética PRESERVA la pupila (isquemia del core del nervio, respetando fibras parasimpáticas periféricas). Si la pupila está dilatada fija → descartar compresión (aneurisma de comunicante posterior) — EMERGENCIA.',
      ],
      keyPoints: [
        'Causa #1 mundial de polineuropatía. Patrón axonal sensitivo-motor longitud-dependiente.',
        'Progresión: SNAP sural → SNAP peroneo superficial → SNAPs MS → CMAPs MI.',
        'Si el patrón es desmielinizante en un diabético, buscar CIDP sobreimpuesta.',
      ],
    },
    {
      id: 'alcoholic-toxic',
      title: 'Neuropatías Tóxicas y Alcohólica',
      content: `**Neuropatía alcohólica:**
Resulta de toxicidad directa del etanol Y deficiencia nutricional concurrente (tiamina/B1, B12, folato). Patrón axonal sensitivo-motor longitud-dependiente, clínicamente indistinguible de la diabética. SNAPs surales reducidos primero. EMG muestra fibrilaciones distales.

**Tabla de Neuropatías Tóxicas por Agente:**

| Agente | Tipo de fibra | Patrón NCS | Característica especial |
|---|---|---|---|
| Cisplatino | Sensitiva pura | SNAPs ausentes, CMAPs normales | Ganglioneuropatía (no longitud-dep.) |
| Taxanos (paclitaxel) | Sensitivo-motora | Axonal distal | Dolor neuropático severo |
| Vincristina | Sensitivo-motora | Axonal | Pérdida temprana reflejo aquíleo |
| Metronidazol | Sensitiva | SNAPs reducidos | Reversible si se suspende temprano |
| Isoniazida | Sensitivo-motora | Axonal | Prevenible con piridoxina (B6) |
| Plomo | Motora pura | CMAPs reducidos MS > MI | Muñeca caída (simula radial) |
| Arsénico | Sensitivo-motora | Axonal aguda | Líneas de Mees en uñas |
| Talio | Sensitivo-motora | Axonal dolorosa | Alopecia + neuropatía = envenenamiento |
| Litio | Sensitivo-motora | Axonal leve | Generalmente subclínica |
| Amiodarona | Sensitivo-motora | Desmielinizante | ¡Puede simular CIDP! |`,
      clinicalPearls: [
        'Amiodarona es la única neurotoxina común que produce patrón DESMIELINIZANTE (por acumulación lisosomal). Si un paciente con \"CIDP\" está tomando amiodarona, suspenderla antes de iniciar IVIg.',
        'Plomo causa neuropatía MOTORA PURA con predilección por extensores de MS (muñeca caída bilateral). Los SNAPs son normales. Simula patología radial bilateral. Pista: anemia microcítica + línea gingival azul.',
        'Neuropatía por cisplatino: el daño es al ADN del cuerpo celular del GRD (ganglioneuropatía), por eso los SNAPs se afectan GLOBALMENTE (no longitud-dependiente) y los CMAPs permanecen normales.',
      ],
    },
    {
      id: 'small-fiber',
      title: 'Neuropatía de Fibra Fina',
      content: `Las NCS de rutina evalúan exclusivamente fibras mielinizadas gruesas (Aα y Aβ). Las fibras finas (Aδ mielinizadas delgadas y C amielínicas) transmiten dolor, temperatura y función autonómica y NO son detectables por NCS convencionales.

**Presentación clínica:**
• Dolor quemante, punzante, alodinia, hiperalgesia en distribución stocking-glove.
• Disautonomía: anhidrosis/hiperhidrosis focal, hipotensión ortostática, disfunción GI/GU.
• EXAMEN NEUROLÓGICO: pérdida de sensibilidad termoalgésica con propiocepción y vibración NORMALES.

**Algoritmo diagnóstico (NCS son NORMALES):**
1. **Biopsia de piel (punch 3mm):** Gold standard. Densidad de fibras nerviosas intraepidérmicas (IENFD) < percentil 5 por edad/sexo = confirmación.
2. **QSART (Quantitative Sudomotor Axon Reflex Test):** Evalúa función sudomotora (fibras C simpáticas). Anormal en 50-80%.
3. **QST (Quantitative Sensory Testing):** Umbrales de frío y calor-dolor elevados.
4. **Pruebas autonómicas cardiovagales:** Variabilidad RR, Valsalva, tilt test.

**Causas principales:**
Diabetes (causa #1), pre-diabetes/síndrome metabólico, Sjögren, sarcoidosis, amiloidosis (TTR/AL), Fabry, HIV, celíaca, idiopática (30-50%).`,
      clinicalPearls: [
        'NCS NORMALES + dolor neuropático severo = neuropatía de fibra fina hasta probar lo contrario. NO descartar neuropatía solo porque las NCS son normales — estas solo evalúan fibras gruesas.',
        'La pre-diabetes (intolerancia a glucosa) es una causa subdiagnosticada. Solicitar curva de tolerancia a glucosa oral (CTGO), no solo HbA1c, si la glucosa en ayuno es normal.',
        'Enfermedad de Fabry (deficiencia de α-galactosidasa A, ligada a X): causa dolor neuropático severo desde la infancia/adolescencia. Tratable con terapia de reemplazo enzimático. Buscar en varones jóvenes con dolor acral + angioqueratomas.',
      ],
      keyPoints: [
        'NCS de rutina NORMALES — no evalúan fibras finas Aδ/C.',
        'Gold standard diagnóstico: biopsia de piel con IENFD reducida.',
        'Causas: diabetes, pre-diabetes, Sjögren, amiloidosis, Fabry, idiopática.',
      ],
    },
    {
      id: 'chemo-neuropathy',
      title: 'Neuropatía Inducida por Quimioterapia (CIPN)',
      content: `Complicación más limitante del tratamiento oncológico. Afecta al 30-70% de pacientes tratados con agentes neurotóxicos.

**Platinos (cisplatino, oxaliplatino, carboplatino):**
• Cisplatino: ganglioneuropatía dorsal sensitiva pura. SNAPs ausentes GLOBALMENTE con CMAPs normales. Distribución NO longitud-dependiente. Dosis-dependiente (>300 mg/m²). IRREVERSIBLE.
• Oxaliplatino: neurotoxicidad aguda (disestesias frío-inducidas, espasmos laríngeos) + neuropatía crónica sensitiva acumulativa. La aguda es por canalopía de Na+ (no axonal).

**Taxanos (paclitaxel, docetaxel):**
Axonopatía sensitivo-motora distal. Predomina dolor neuropático. SNAPs reducidos longitud-dependiente. Puede progresar incluso tras suspender el fármaco (\"coasting\").

**Alcaloides de la vinca (vincristina):**
Axonopatía sensitivo-motora. Pérdida temprana del reflejo aquíleo (signo centinela). Debilidad de extensión de dedos y dorsiflexión. Dosis-dependiente y parcialmente reversible.

**Bortezomib (inhibidor de proteosoma):**
Axonopatía sensitiva dolorosa. Predominio de fibra fina. NCS pueden ser normales inicialmente.`,
      clinicalPearls: [
        'COASTING: la neuropatía por platinos y taxanos puede EMPEORAR durante semanas-meses DESPUÉS de suspender el fármaco. No interpretar como falla terapéutica.',
        'Monitorización EDX durante quimioterapia: SNAPs surales seriados cada 2-3 ciclos detectan neuropatía subclínica temprana y permiten ajuste de dosis antes de daño irreversible.',
      ],
    },
    {
      id: 'amyloidosis',
      title: 'Neuropatía Amiloidótica',
      content: `El depósito de amiloide en nervios periféricos causa una neuropatía progresiva con componente de fibra fina prominente y disautonomía severa.

**Tipos:**
• **AL (cadenas ligeras):** Asociada a mieloma/gammapatía monoclonal. Neuropatía mixta (fibra fina + gruesa). STC bilateral severo refractario a cirugía es señal temprana.
• **TTR (transtiretina):** Hereditaria (Val30Met más común) o senil (wild-type). Neuropatía sensitivo-motora axonal progresiva + cardiomiopatía. Tratable con tafamidis, patisirán, inotersén.
• **AA (amiloide sérico A):** Rara afectación neurológica.

**Patrón EDX:**
• Fase temprana: NCS normales (afecta fibra fina primero — dolor, disautonomía).
• Fase intermedia: SNAPs reducidos (axonopatía longitud-dependiente).
• Fase avanzada: SNAPs ausentes + CMAPs reducidos + EMG con denervación difusa.
• STC bilateral es frecuente (depósito amiloide en retináculo flexor).

**Red flags para amiloidosis:**
STC bilateral severo + neuropatía de fibra fina + disautonomía + insuficiencia cardíaca con fracción de eyección preservada + macroglosia + proteinuria.`,
      clinicalPearls: [
        'STC bilateral refractario a liberación quirúrgica en paciente >50 años = descartar amiloidosis AL/TTR con electroforesis sérica, cadenas ligeras libres y biopsia de grasa abdominal.',
        'La amiloidosis TTR hereditaria ahora tiene tratamientos que MODIFICAN la enfermedad (silenciadores de ARN: patisirán, inotersén; estabilizadores: tafamidis). El diagnóstico temprano es crítico para iniciar tratamiento antes de daño irreversible.',
      ],
    },
    {
      id: 'cmt',
      title: 'Heredopatías: Charcot-Marie-Tooth (CMT)',
      content: 'Grupo de neuropatías hereditarias más frecuentes (1:2,500). La clasificación se basa en el patrón EDX y la genética.',
      clinicalPearls: [
        'Clave diferencial CMT vs CIDP: en CMT la desmielinización es UNIFORME en todos los nervios (congénita, homogénea). En CIDP es HETEROGÉNEA con bloqueos focales y dispersión. Si hay bloqueos de conducción, NO es CMT — es adquirida.',
      ],
      children: [
        {
          id: 'cmt1',
          title: 'CMT Tipo 1 (Desmielinizante)',
          content: `**CMT1A (PMP22 duplicación — 70% de todos los CMT):**
VCM uniformemente enlentecidas en TODOS los nervios motores. Mediano típicamente 15-25 m/s (normal >50 m/s). No hay bloqueos focales ni dispersión temporal anormal.

**CMT1B (mutación P0/MPZ):**
Similar a CMT1A pero puede tener velocidades más variables. Fenotipos desde leve hasta severo (Dejerine-Sottas-like).

**Criterios NCS de CMT1:**
• VCM mediano < 38 m/s (umbral clásico que separa CMT1 de CMT2).
• Enlentecimiento UNIFORME (sin diferencias focales entre segmentos).
• Ausencia de bloqueo de conducción y dispersión temporal.
• SNAPs frecuentemente ausentes o muy reducidos.
• CMAPs reducidos por pérdida axonal secundaria crónica.`,
          clinicalPearls: [
            'VCM mediano < 38 m/s UNIFORME + sin bloqueos = CMT1. Solicitar estudio genético PMP22 como primer paso.',
            'Si un \"CMT1\" tiene bloqueos de conducción, reconsiderar CIDP sobreimpuesta — puede ocurrir y es tratable.',
          ],
        },
        {
          id: 'cmt2',
          title: 'CMT Tipo 2 (Axonal)',
          content: `**Patrón NCS:**
• VCM > 38 m/s (normal o levemente reducida).
• Amplitudes de CMAP y SNAP MUY reducidas o ausentes.
• EMG: PUMs neurogénicos crónicos con reclutamiento reducido.

**CMT2A (mutación MFN2):** La forma axonal más frecuente. Inicio temprano, severa. Atrofia distal marcada.
**CMT2E (mutación NEFL):** Puede tener velocidades intermedias (25-45 m/s).

La distinción CMT1 vs CMT2 se hace por VCM del mediano: < 38 m/s = CMT1, > 38 m/s = CMT2.`,
          keyPoints: [
            'VCM mediano > 38 m/s con amplitudes muy bajas = CMT2 (axonal).',
            'CMT2A (MFN2) es la forma axonal más común.',
          ],
        },
        {
          id: 'cmt-others',
          title: 'CMT Tipos Intermedios, X-linked y Severos',
          content: `**CMTX1 (Conexina 32, ligada al X):**
VCM intermedias (25-45 m/s). Varones más severamente afectados que mujeres. Puede tener enlentecimiento DESIGUAL entre nervios, simulando proceso adquirido. Episodios transitorios de déficit central (stroke-like).

**CMT3 (Dejerine-Sottas):**
Forma severa infantil. VCM extremadamente lentas (< 10 m/s). Nervios palpablemente engrosados. Inicio en primeros 2 años de vida.

**CMT4 (autosómica recesiva):**
Múltiples subtipos. Inicio temprano, severo. Frecuente en poblaciones consanguíneas.`,
          clinicalPearls: [
            'CMTX1 es el gran imitador de CIDP: velocidades intermedias, enlentecimiento no uniforme, varón joven. La clave: no responde a IVIg/corticoides. Si un \"CIDP\" no responde a tratamiento, considerar CMTX1.',
          ],
        },
      ],
    },
    {
      id: 'hnpp',
      title: 'HNPP (Neuropatía Hereditaria con Predisposición a Parálisis por Presión)',
      content: `Deleción recíproca de PMP22 (la duplicación causa CMT1A). Prevalencia: 2-5/100,000.

**Presentación:**
Episodios recurrentes de mononeuropatías focales transitorias en sitios de compresión habitual:
• Peroneo en cabeza de peroné (pie caído transitorio).
• Ulnar en codo (adormecimiento dedo meñique).
• Mediano en muñeca (STC recurrente).
• Radial en canal espiral.

**Patrón NCS característico (\"neuropatía tomacular\"):**
• Enlentecimiento focal en sitios de compresión SUPERPUESTO sobre una polineuropatía sensitiva desmielinizante difusa de base.
• VCS difusamente enlentecidas (no solo en sitios de atrapamiento).
• Latencias distales motoras prolongadas en múltiples nervios.
• El patrón de fondo es la clave: no es solo un STC bilateral — es una polineuropatía generalizada.`,
      clinicalPearls: [
        'STC bilateral + neuropatía ulnar bilateral + neuropatía peronea en paciente joven = HNPP hasta probar lo contrario. Solicitar deleción PMP22.',
        'HNPP vs atrapamientos múltiples coincidentes: en HNPP las NCS muestran polineuropatía sensitiva DIFUSA además de los atrapamientos focales. En atrapamientos coincidentes, los nervios no atrapados son normales.',
      ],
    },
    {
      id: 'uremic-neuropathy',
      title: 'Neuropatía Urémica',
      content: `Polineuropatía axonal sensitivo-motora longitud-dependiente en insuficiencia renal crónica avanzada (GFR < 12 ml/min).

**Patrón NCS:**
• SNAPs surales reducidos → ausentes. CMAPs peroneos reducidos.
• Velocidades normales o levemente lentas (axonal, no desmielinizante).
• Mejora parcial post-diálisis adecuada o trasplante renal.

**Particularidad:** El STC es 10-30x más frecuente en pacientes en hemodiálisis (amiloidosis β2-microglobulina en retináculo + fístula AV).`,
      clinicalPearls: [
        'En paciente en hemodiálisis: polineuropatía de fondo (urémica) + STC (amiloidosis β2M) + neuropatía isquémica por robo de fístula AV = tres patologías simultáneas. Evaluar cada una independientemente.',
      ],
    },
    {
      id: 'vasculitic-neuropathy',
      title: 'Neuropatía Vasculítica',
      content: `Vasculitis de vasa nervorum causa isquemia nerviosa aguda. Patrón: mononeuropatía múltiple asimétrica (mononeuritis múltiplex).

**Patrón NCS:**
• Pérdida AGUDA de amplitud en nervios individuales, distribución asimétrica y no longitud-dependiente.
• Nervios clásicamente afectados: peroneo, ulnar, radial, mediano (en ese orden de frecuencia).
• Velocidades normales (daño axonal isquémico, no desmielinizante).
• EMG: denervación aguda profusa en territorio del nervio afectado.

**Causas:** PAN, granulomatosis con poliangitis (Wegener), vasculitis crioglobulinémica, vasculitis no-sistémica (NSVN — limitada al nervio periférico).

**Diagnóstico:** Biopsia de nervio sural + músculo gastrocnemio (vasculitis necrotizante de arterias epineurales).`,
      clinicalPearls: [
        'Mononeuropatía múltiple AGUDA + dolor + VSG/PCR elevados = vasculitis hasta probar lo contrario. Es una EMERGENCIA que requiere inmunosupresión urgente.',
        'La NSVN (vasculitis no sistémica del nervio) es la forma más frecuente. Solo afecta nervios periféricos sin compromiso sistémico. Se diagnostica SOLO por biopsia.',
      ],
    },
    {
      id: 'cip-cin',
      title: 'Polineuropatía y Miopatía del Paciente Crítico (CIP/CIM)',
      content: `Complicación frecuente de la estancia prolongada en UCI (25-50% de pacientes con sepsis/SDOM).

**CIP (Critical Illness Polyneuropathy):**
• Axonopatía sensitivo-motora difusa aguda.
• CMAPs y SNAPs difusamente reducidos, velocidades normales.
• EMG: fibrilaciones profusas difusas.
• Causa: neurotoxicidad de la inflamación sistémica, hiperglicemia, falla multiorgánica.

**CIM (Critical Illness Myopathy):**
• NCS: CMAPs reducidos pero SNAPs NORMALES (diferencia clave con CIP).
• EMG: PUMs miopáticos (cortos, polifásicos) + fibrilaciones.
• Test diagnóstico: estimulación muscular directa (dmCMAP) — normal en CIP, anormal en CIM.
• Asociación fuerte con corticoides IV + bloqueantes neuromusculares.

**CIP vs CIM:**
| | CIP | CIM |
|---|---|---|
| SNAPs | Reducidos | Normales |
| Mecanismo | Axonopatía | Miopatía |
| EMG MUAPs | Neurogénicos | Miopáticos |
| dmCMAP | Normal | Reducido |
| Pronóstico | Peor (meses-años) | Mejor (semanas-meses) |`,
      clinicalPearls: [
        'Paciente en UCI que no puede ser destetado del ventilador + debilidad generalizada: CIP/CIM es la causa más frecuente. Los SNAPs son la clave para diferenciar CIP (reducidos) vs CIM (normales).',
        'En la práctica, la mayoría de pacientes tienen CIPNM (combinación de ambos). El pronóstico depende de la proporción de cada componente.',
      ],
    },
  ],
};
