// src/content/modules/module-09-pathologies-part3.ts
// Sections 4-5: Radiculopatías, Plexopatías
import { Topic } from '../../types/content';

// ═══════════════════════════════════════════════════════════════
// SECTION 4: RADICULOPATÍAS
// ═══════════════════════════════════════════════════════════════
export const radiculopathies: Topic = {
  id: 'radiculopathies',
  title: 'Radiculopatías',
  content: 'La evaluación electrodiagnóstica de radiculopatías es una de las indicaciones más frecuentes en el laboratorio. El hallazgo cardinal es un patrón de denervación que sigue un MIOTOMA (no un nervio) con SNAPs NORMALES (lesión preganglionar) y paraespinales afectados.',
  clinicalPearls: [
    'REGLA FUNDAMENTAL: En radiculopatía los SNAPs son SIEMPRE normales (preganglionar). Si el SNAP está reducido, la lesión es postganglionar (plexo o nervio periférico) o hay patología coexistente.',
    'El EMG de aguja es más sensible que las NCS para radiculopatía. Las NCS de rutina suelen ser normales (excepto ondas H/F). El diagnóstico depende del EMG.',
  ],
  keyPoints: [
    'SNAPs normales (preganglionar) + paraespinales denervados = radiculopatía.',
    'Demostrar denervación en ≥2 músculos de misma raíz, DIFERENTES nervios.',
    'La EMG de aguja es la prueba cardinal. Las NCS sirven para excluir neuropatía.',
  ],
  children: [
    {
      id: 'cervical-radic',
      title: 'Radiculopatía Cervical (C5-T1)',
      content: `Causas: hernia discal (más frecuente en jóvenes), espondilosis/estenosis foraminal (más frecuente en >50 años).

**Protocolo EMG mínimo por raíz sospechada:**

**C5:** Deltoides (axilar) + infraespinoso (supraescapular) ± bíceps (musculocutáneo).
**C6:** Bíceps (musculocutáneo) + pronador teres (mediano) ± braquiorradial (radial).
**C7:** Tríceps (radial) + pronador teres (mediano) + FCR (mediano) ± extensor de dedos (PIN).
**C8:** EIP (PIN) + FDP índice (NIA/mediano) + FDI (ulnar).
**T1:** APB (mediano) + FDI (ulnar) + ADM (ulnar).

**Siempre incluir:** Paraespinales cervicales del nivel correspondiente.

**Timing del EMG:**
• Paraespinales: fibrilaciones aparecen a los 7-10 días post-lesión (cercanía al sitio de compresión).
• Músculos proximales (deltoides, bíceps): 2-3 semanas.
• Músculos distales (intrínsecos mano): 3-5 semanas.
• El EMG es ÓPTIMO entre 3-6 semanas post-inicio de síntomas.`,
      clinicalPearls: [
        'C7 es la raíz más frecuentemente afectada en hernia discal cervical. Tríada clásica: debilidad de tríceps + extensores de dedos + reflejo tricipital abolido. Pero el pronador teres (mediano) Y el tríceps (radial) deben estar afectados para confirmar C7 (diferentes nervios, misma raíz).',
        'EMG DEMASIADO TEMPRANA (<7-10 días): puede ser falsamente normal. EMG DEMASIADO TARDÍA (>6 meses): la reinervación puede haber normalizado los hallazgos. El timing óptimo es 3-6 semanas post-inicio.',
        'Si se encuentran fibrilaciones SOLO en paraespinales sin denervación en extremidades, considerar radiculopatía leve/incipiente o en resolución.',
      ],
    },
    {
      id: 'lumbosacral-radic',
      title: 'Radiculopatía Lumbosacra (L4, L5, S1)',
      content: `**L4:**
• Motor: cuádriceps (femoral), tibial anterior (peroneo profundo).
• Reflejo: patelar reducido/ausente.
• EMG: vasto medial/lateral (femoral) + tibial anterior (peroneo profundo). Ambos L4 pero diferentes nervios.
• Diferencial: neuropatía femoral (si solo músculos femorales afectados → neuropatía, no L4).

**L5 (la más frecuente):**
• Motor: tibial anterior, EHL, peroneos, tibial posterior, glúteo medio.
• Reflejo: ninguno confiable (reflejo aquíleo es S1).
• EMG mínimo: tibial anterior (peroneo profundo) + tibial posterior (tibial) ± glúteo medio (glúteo superior). Tres nervios diferentes, misma raíz.
• El tibial posterior es la CLAVE diferencial con neuropatía peronea.

**S1:**
• Motor: gastrocnemio, sóleo, bíceps femoral (largo), glúteo mayor.
• Reflejo: aquíleo — su ausencia UNILATERAL es el signo más sensible de radiculopatía S1.
• NCS: Reflejo H del sóleo ausente o prolongado ipsilateralmente (sensibilidad ~80-90%).
• EMG: gastrocnemio medial (tibial) + bíceps femoral cabeza larga (ciático).

**Siempre incluir:** Paraespinales lumbares del nivel correspondiente + nervio sural bilateral (normal en radiculopatía, anormal en plexopatía).`,
      clinicalPearls: [
        'El Reflejo H del sóleo es el equivalente electrofisiológico del reflejo aquíleo. Es el estudio NCS MÁS sensible para radiculopatía S1 (ausente unilateralmente en >80%). Si es normal bilateralmente, S1 es poco probable.',
        'L5 vs peroneo: el tibial posterior (nervio tibial, L5) es el músculo diferencial. Peroneo común NO inerva tibial posterior. Si tibial posterior está denervado → L5, no peroneo.',
        'Cauda equina: debilidad bilateral + retención urinaria + anestesia perianal \"en silla de montar\". EMG del esfínter anal externo muestra denervación. Es EMERGENCIA QUIRÚRGICA — derivar inmediatamente.',
      ],
      keyPoints: [
        'L5 es la raíz lumbosacra más frecuente. Clave: tibial posterior diferencia de peroneo.',
        'S1: reflejo aquíleo ausente unilateral + Reflejo H ausente = altamente sugestivo.',
        'Sural normal + paraespinales denervados = radiculopatía, no plexopatía.',
      ],
    },
    {
      id: 'paraspinal-role',
      title: 'El Examen de Paraespinales: Técnica y Significado',
      content: `Los músculos paraespinales son fundamentales para localización topográfica porque están inervados por las ramas dorsales ANTES de la formación del plexo.

**Técnica:**
• Aguja insertada 2-3 cm lateral a las apófisis espinosas del nivel correspondiente, con angulación hacia medial.
• Profundidad: 3-4 cm (multífidos profundos son más específicos que erectores superficiales).
• Evaluar a reposo: fibrilaciones/PSW = denervación activa.

**Interpretación:**
• Fibrilaciones en paraespinales = lesión PROXIMAL al plexo (radiculopatía o enfermedad de motoneurona).
• NO se espera denervación en paraespinales en plexopatía (el plexo se forma DESPUÉS de la ramificación dorsal).
• Fibrilaciones en paraespinales + extremidades en múltiples miotomas/nervios = considerar ELA.

**Limitaciones:**
• Falsos positivos: cirugía espinal previa destruye paraespinales (denervación quirúrgica). Preguntar antecedente quirúrgico.
• Dolor lumbar crónico: puede causar fibrilaciones inespecíficas por daño muscular local.
• En >60 años, pueden haber PSW aislados inespecíficos (variante normal del envejecimiento).`,
      clinicalPearls: [
        'Post-cirugía espinal: NO interpretar fibrilaciones en paraespinales como radiculopatía activa. El propio procedimiento quirúrgico denerva los paraespinales. Base el diagnóstico en músculos de extremidades.',
        'Técnica: los multífidos (profundos, mediales) son más específicos para radiculopatía que los erectores espinales (superficiales, polisegmentarios). Insertar la aguja con angulación medial para alcanzarlos.',
      ],
    },
    {
      id: 'radic-vs-plexopathy',
      title: 'Diagnóstico Diferencial: Radiculopatía vs Plexopatía',
      content: `**Tabla de diferenciación definitiva:**

| Parámetro | Radiculopatía | Plexopatía | Neuropatía Focal |
|---|---|---|---|
| Distribución EMG | Miotómica (raíz) | Por tronco/fascículo | Por nervio |
| SNAPs | NORMALES | REDUCIDOS | REDUCIDOS |
| Paraespinales | AFECTADOS | NORMALES | NORMALES |
| Dolor radicular | Frecuente | Variable | Raro |
| Reflejo H/F | Anormales | Variables | Variables |
| MRI correlación | Hernia/estenosis | Masa/infiltración/inflamación | Compresión focal |

**Algoritmo diagnóstico:**
1. ¿SNAPs normales? → SÍ: considerar radiculopatía. NO: considerar plexo/nervio.
2. ¿Paraespinales denervados? → SÍ: confirma radiculopatía. NO: plexo/nervio.
3. ¿Distribución por nervio individual? → SÍ: mononeuropatía. NO: plexopatía.
4. ¿Múltiples nervios pero mismo tronco/fascículo? → SÍ: plexopatía.`,
      keyPoints: [
        'SNAP + paraespinales = la combinación diagnóstica definitiva.',
        'SNAP normal + paraespinales denervados = RADICULOPATÍA.',
        'SNAP reducido + paraespinales normales = PLEXOPATÍA o neuropatía.',
      ],
    },
    {
      id: 'cauda-equina',
      title: 'Síndrome de Cauda Equina',
      content: `Compresión de las raíces de la cola de caballo (L2-S5) por hernia discal masiva, tumor, fractura vertebral o estenosis central severa. EMERGENCIA NEUROQUIRÚRGICA.

**Presentación:** Debilidad bilateral de MI + retención/incontinencia urinaria + anestesia en silla de montar (periné S2-S5) + arreflexia aquílea bilateral.

**Hallazgos EDX:**
• SNAPs: pueden estar normales tempranamente (preganglionar) o reducidos si hay afectación del GRD (raíces S1-S3 tienen GRD en el canal).
• CMAPs: reducidos bilateralmente en peroneo y tibial.
• EMG: denervación bilateral profusa en MI + denervación del esfínter anal externo (S2-S4).
• Reflejo H: ausente bilateralmente.
• Reflejo bulbocavernoso: ausente.

**EMG de esfínter anal:**
Técnica: aguja concéntrica insertada lateral al esfínter anal. Evaluar a reposo y con contracción voluntaria.
Fibrilaciones en esfínter = denervación de raíces sacras pudendas (S2-S4).`,
      clinicalPearls: [
        'Cauda equina es EMERGENCIA QUIRÚRGICA — derivar ANTES de completar EMG si la clínica es clara. El EMG confirma y documenta extensión pero NO debe retrasar la cirugía.',
        'La EMG de esfínter anal es fundamental para confirmar y documentar denervación sacra. Se usa también en evaluación de incontinencia urinaria neurogénica, prolapso, y post-prostatectomía.',
      ],
    },
  ],
};

// ═══════════════════════════════════════════════════════════════
// SECTION 5: PLEXOPATÍAS
// ═══════════════════════════════════════════════════════════════
export const plexopathies: Topic = {
  id: 'plexopathies',
  title: 'Plexopatías',
  content: 'Las plexopatías afectan al plexo braquial o lumbosacro en un punto DISTAL al GRD (postganglionar), por lo que los SNAPs están REDUCIDOS — a diferencia de las radiculopatías donde son normales. Los paraespinales están NORMALES (la lesión es distal a la ramificación dorsal).',
  clinicalPearls: [
    'La regla de oro de plexopatía: SNAPs REDUCIDOS + paraespinales NORMALES + distribución que cruza múltiples nervios pero sigue un patrón de tronco/fascículo. Los SNAPs son la diferencia crítica con radiculopatía.',
  ],
  keyPoints: [
    'Postganglionar: SNAPs reducidos (a diferencia de radiculopatía).',
    'Paraespinales normales (a diferencia de radiculopatía).',
    'Distribución por tronco/fascículo, no por nervio individual.',
  ],
  children: [
    {
      id: 'traumatic-bp',
      title: 'Plexopatía Braquial Traumática',
      content: `**Tipos de lesión:**
• **Avulsión radicular (preganglionar):** Arrancamiento de la raíz de la médula. SNAPs PARADÓJICAMENTE NORMALES (el GRD y su rama periférica están intactos). IRRECUPERABLE — no hay regeneración posible. Solo transferencia nerviosa.
• **Ruptura del plexo (postganglionar):** Desgarro de troncos/fascículos. SNAPs REDUCIDOS. Potencialmente recuperable con injerto nervioso.
• **Neuropraxia/Axonotmesis:** Lesión in continuity. Pronóstico variable según severidad.

**Protocolo EDX completo:**
NCS motoras y sensitivas de los 5 nervios principales (mediano, ulnar, radial, musculocutáneo, axilar) + EMG de músculos clave de cada raíz/tronco/fascículo.

**Músculos clave para localización:**
• Romboides (n. dorsal escapular, C5): sale ANTES del plexo → si denervado = lesión muy proximal o avulsión.
• Serratos (n. torácico largo, C5-C7): sale ANTES del plexo.
• Supraespinoso/infraespinoso (supraescapular): sale del tronco superior.
• Deltoides (axilar, fascículo posterior).
• APB (mediano, fascículo lateral+medial).
• FDI (ulnar, fascículo medial).

**Timing:** EMG óptimo a las 3-4 semanas post-trauma (permite completar degeneración walleriana). Repetir a los 3-6 meses para evaluar reinervación.`,
      clinicalPearls: [
        'AVULSIÓN vs RUPTURA: si el SNAP está NORMAL con anestesia clínica y denervación EMG masiva → avulsión radicular preganglionar. Pronóstico devastador. Si el SNAP está REDUCIDO → ruptura postganglionar. Mejor pronóstico.',
        'Romboides y serratos: sus nervios salen ANTES del plexo (directamente de las raíces). Si están denervados, la lesión es a nivel radicular (posible avulsión). Si están normales, la lesión es en el plexo propiamente.',
      ],
    },
    {
      id: 'radiation-bp',
      title: 'Plexopatía por Radiación vs Infiltración Tumoral',
      content: `**Plexopatía por radiación:**
• Latencia: meses a años post-radioterapia (típicamente 6 meses - 20 años).
• Distribución: tronco SUPERIOR predominante (campo de irradiación axilar/supraclavicular).
• Dolor: variable, frecuentemente menos severo que tumoral.
• EMG: hallazgo PATOGNOMÓNICO = **MIOQUIMIAS** (descargas grupadas rítmicas de PUMs). Presentes en >60%.
• NCS: axonopatía progresiva con SNAPs reducidos.

**Plexopatía por infiltración tumoral:**
• Distribución: tronco INFERIOR predominante (tumor de Pancoast, mama, linfoma).
• Dolor: SEVERO, progresivo, típicamente el síntoma presentante.
• EMG: denervación activa SIN mioquimias.
• NCS: axonopatía progresiva.

| | Radiación | Tumor |
|---|---|---|
| Tronco preferente | Superior | Inferior |
| Dolor | Variable | Severo |
| Mioquimias EMG | PRESENTES (60%+) | AUSENTES |
| Horner | Raro | Frecuente (inferior) |
| Curso | Lento, años | Rápido, semanas-meses |`,
      clinicalPearls: [
        'MIOQUIMIAS en EMG de un paciente con antecedente de radioterapia: diagnóstico de plexopatía actínica (por radiación). Las mioquimias SON el hallazgo clave que diferencia radiación de recurrencia tumoral. Si no hay mioquimias, no descarta radiación pero SÍ obliga a descartar recurrencia con imagen.',
        'Tronco inferior + Horner + dolor severo en paciente oncológico = infiltración tumoral directa. Imagen URGENTE (MRI con gadolinio o PET-CT).',
      ],
    },
    {
      id: 'parsonage-turner',
      title: 'Síndrome de Parsonage-Turner (Neuralgia Amiotrófica)',
      content: `Plexopatía braquial inflamatoria idiopática. Incidencia: 1-3/100,000/año. Causa: autoinmune (post-infección, post-cirugía, post-vacunación o idiopática).

**Evolución clínica en 3 fases:**

**Fase 1 — Dolor agudo (días 1-14):**
Dolor INTENSÍSIMO en hombro/brazo (el paciente lo describe como \"el peor dolor de su vida\"). Constante, peor de noche. Puede simular cardiopatía o abdomen agudo.

**Fase 2 — Debilidad + atrofia (semanas 2-12):**
A medida que el dolor mejora, emerge debilidad SELECTIVA y ATÍPICA. Clásicamente afecta supraespinoso, infraespinoso, serratos, deltoides (nervios supraescapular, torácico largo, axilar). La distribución es \"parcheada\" — afecta fascículos individuales dentro de nervios, no nervios completos.

**Fase 3 — Recuperación (meses 6-36):**
Recuperación gradual en >80% pero puede ser incompleta. Algunos pacientes tienen dolor neuropático residual crónico.

**Hallazgos EDX:**
• SNAPs: ausentes o reducidos en nervios afectados (LACN si musculocutáneo, radial superficial si radial). Confirma lesión postganglionar.
• CMAPs: reducidos en nervios afectados.
• EMG: denervación profusa (fibrilaciones) en músculos afectados con distribución parcheada (algunos fascículos de un músculo afectados, otros no).
• Los paraespinales cervicales pueden tener fibrilaciones leves (la inflamación puede extenderse proximalmente).

**Nervios más frecuentemente afectados (en orden):**
1. Supraescapular (infraespinoso > supraespinoso)
2. Torácico largo (serratos → escápula alada)
3. Axilar (deltoides)
4. Nervio interóseo anterior (NIA — FPL, FDP índice)
5. Nervio frénico (parálisis diafragmática — puede causar disnea)`,
      clinicalPearls: [
        'El NIA (nervio interóseo anterior) es frecuentemente afectado en Parsonage-Turner. Si un paciente joven presenta inicio súbito de incapacidad de flexión del pulgar y del índice (no puede hacer pinza \"OK\") precedido por dolor, considera Parsonage-Turner — no solo \"compresión del NIA\".',
        'Parálisis diafragmática bilateral (nervio frénico bilateral): complicación rara pero potencialmente fatal. Si hay disnea en un paciente con Parsonage-Turner, solicitar fluoroscopía diafragmática o sniff test.',
        'La distribución parcheada INTRANERVIOSA (algunos fascículos afectados, otros no) es característica y distingue Parsonage-Turner de compresión o tracción del plexo.',
      ],
    },
    {
      id: 'lumbosacral-plexopathy',
      title: 'Plexopatía Lumbosacra',
      content: `**Amiotrofia Diabética (Bruns-Garland) — ver también sección de Neuropatías Periféricas:**
La causa no traumática más frecuente. Vasculitis autoinmune de vasa nervorum del plexo lumbosacro.
• Dolor proximal INTENSO + debilidad cuádriceps/iliopsoas + pérdida ponderal.
• SNAPs safeno y LFCN REDUCIDOS (postganglionar).
• EMG: denervación en cuádriceps + iliopsoas + aductores + paraespinales lumbares (radiculoplexopatía).

**Plexopatía lumbosacra neoplásica:**
• Tumores retroperitoneales (colon, recto, cérvix, próstata, linfoma) infiltran plexo lumbosacro.
• Dolor progresivo + debilidad + edema de pierna (compresión linfática/venosa).
• SNAPs reducidos. EMG: denervación progresiva sin mioquimias (a diferencia de radiación).

**Plexopatía lumbosacra post-radiación:**
• Similar a su análogo braquial: latencia larga, tronco afectado dentro del campo, mioquimias en EMG.

**Plexopatía idiopática lumbosacra:**
Análogo lumbosacro de Parsonage-Turner braquial. Dolor + debilidad proximal aguda. Autolimitada pero recuperación lenta.`,
      clinicalPearls: [
        'Pista para amiotrofia diabética vs neuropatía diabética distal: la amiotrofia causa dolor y debilidad PROXIMALES (muslo), no distales (pies). Y es AGUDA, no gradual. Son entidades completamente diferentes.',
        'Plexopatía lumbosacra neoplásica: si hay edema unilateral de pierna + dolor progresivo + debilidad + pérdida de peso → imagen pélvica URGENTE (CT/MRI) para descartar masa retroperitoneal.',
      ],
    },
    {
      id: 'hna',
      title: 'Neuralgia Amiotrófica Hereditaria (HNA)',
      content: `Forma hereditaria de la neuralgia amiotrófica (Parsonage-Turner). Autosómica dominante, gen SEPT9 (septina 9).

**Diferencias con forma esporádica:**
• Ataques recurrentes (el esporádico es usualmente único).
• Inicio más temprano (infancia/adolescencia).
• Rasgos dismórficos asociados: hipotelorismo, pliegues cutáneos, paladar hendido, estatura baja.
• Afectación del nervio frénico más frecuente.
• Historia familiar de episodios similares.

**EDX:** Idéntico a la forma esporádica durante los ataques. Entre ataques puede mostrar denervación crónica residual de episodios previos.`,
      clinicalPearls: [
        'Parsonage-Turner recurrente (>1 episodio) + rasgos dismórficos + historia familiar → sospechar HNA. Solicitar análisis genético de SEPT9.',
      ],
    },
  ],
};
