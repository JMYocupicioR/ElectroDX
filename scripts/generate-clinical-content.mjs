import fs from 'node:fs';
import path from 'node:path';

const temario = fs.readFileSync('TEMARIO.md', 'utf8');

function parseShortTopics() {
  const section = temario.split('### ⚠️')[1]?.split('\n---')[0] ?? '';
  const items = [];
  const re = /`([a-z0-9-]+)`\s+—\s+\*\*(.+?)\*\*\s+\((\d+)\s+palabras\)/g;
  let m;
  while ((m = re.exec(section))) {
    items.push({ id: m[1], title: m[2], words: Number(m[3]) });
  }
  return items;
}

function parseLeafTopics() {
  const leaves = [];
  const re = /^\s*-\s+\*\*(.+?)\*\*\s+`\(([a-z0-9-]+)\)`\s+—\s+(?!.*Agrupador)(.*)$/gm;
  let m;
  while ((m = re.exec(temario))) {
    const rest = m[3];
    if (rest.includes('Agrupador')) continue;
    leaves.push({ title: m[1], id: m[2] });
  }
  return leaves;
}

const WIKI = {
  action:
    'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4a/Action_potential.svg/640px-Action_potential.svg.png',
  myelin:
    'https://upload.wikimedia.org/wikipedia/commons/thumb/1/17/Neuron_Hand-tuned.svg/640px-Neuron_Hand-tuned.svg.png',
  ncs:
    'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6e/Nerve_conduction_study.jpg/640px-Nerve_conduction_study.jpg',
  emg:
    'https://upload.wikimedia.org/wikipedia/commons/thumb/8/80/EMG_principle.gif/320px-EMG_principle.gif',
};

const SPECIFIC = {
  'axonal-membrane': 'La membrana axonal depende de canales de Na+ voltaje-dependientes agrupados en el nódulo y de K+ yuxtaparanodales. En NCS, la despolarización catódica abre Na+ y genera el potencial de acción compuesto.',
  'myelin-sheath': 'Las células de Schwann forman mielina internodal que reduce capacitancia y permite conducción saltatoria. La desmielinización focal prolonga latencia y puede bloquear el CMAP sin denervación inmediata.',
  'nodes-saltatory': 'El nódulo de Ranvier concentra Nav1.6. La conducción saltatoria explica VCM > 40 m/s en fibras mielínicas. El bloqueo nodal (anti-GM1) cae amplitud proximal con duración relativamente conservada.',
  'wallerian-degeneration': 'Tras axonotmesis, la degeneración walleriana distal se completa en 7–10 días. El CMAP distal cae entonces; las fibrilaciones aparecen hacia el día 14–21. No interprete “normalidad” en las primeras 72 h.',
  'fiber-types': 'Aα (motoras/propioceptivas) y Aβ (tacto) dominan CMAP/SNAP. Aδ/C no se registran en NCS convencional. La neuropatía de fibra pequeña requiere umbrales térmicos o QST, no NCS de rutina.',
  'endo-peri-epineurium': 'El perineuro es la barrera hemato-neural. La lesión Sunderland III-V implica discontinuidad fascicular. El registro de superficie promedia todos los fascículos; un fascículo crítico puede pasar inadvertido.',
  'motor-unit-composition': 'Unidad motora = motoneurona α + axón + unión neuromuscular + fibras musculares. El territorio determina la duración del PUM. El ratio de inervación es alto en músculos axiales y bajo en intrínsecos de la mano.',
  'innervation-ratio': 'El ratio (fibras/motoneurona) es ~100–300 en intrínsecos y >500 en gastrocnemio. Reinnervación colateral aumenta el territorio y la amplitud del PUM crónico.',
  'motor-unit-territory': 'El territorio de una UM se extiende varios milímetros. La aguja concéntrica registra un radio ~0.5–1 mm; no “muestree” un músculo con un solo sitio.',
  'action-potential-generation': 'El PA se inicia cuando Na+ supera el umbral. En el laboratorio, el cátodo de estímulo debe orientarse distalmente en NCS motora para evitar bloqueo anodal.',
  'neuromuscular-transmission': 'ACh en receptores nicotínicos genera PPE. Jitter/SFEMG es más sensible que EOR en MG ocular. El frío mejora la transmisión (efecto de Lambert).',
  'excitation-contraction': 'El acoplamiento T-túbulo/RS libera Ca2+. La miopatía puede mostrar PUM breves y reclutamiento precoz con NCS motora normal.',
  'facial-motor': 'Facial (VII): registro en nasalis u orbicularis oculi, estímulo en ángulo mandibular. Compare lado a lado; asimetría >50% sugiere axonotmesis en parálisis de Bell.',
  'trigeminal-motor': 'Trigémino motor (V): masetero o temporal. Útil en plexopatía vs lesión de V. El blink usa V1 aferente y VII eferente.',
  'accessory-motor': 'Espinal accesorio (XI): trapecio. Estímulo en triángulo posterior. Diferencia lesión de XI vs C3–C4.',
  'hypoglossal-motor': 'Hipogloso (XII): geniogloso. Lateralización de la lengua y CMAP lingual en ELA bulbar.',
  'glossopharyngeal-motor': 'IX motor se explora poco; el arco del náuseo y el reflejo faríngeo son clínicos. El paladar lo inerva X.',
  'vagus-motor': 'X: laringe (cricoaritenoideo). Útil en disfonía y ELA. Evite estímulo excesivo por bradicardia.',
  'motor-interpretation': 'Axonal: amplitud baja, VCM conservada. Desmielinizante: latencia/VCM/dispersión/bloqueo. Mixto: combine criterios AANEM y el tiempo de evolución.',
  'snap-morphology': 'El SNAP es trifásico. Mida pico-pico o inicial-negativa según laboratorio; sea consistente con sus valores de referencia.',
  'onset-peak-latency': 'Onset estima las fibras más rápidas; pico es más reproducible en SNAP de baja amplitud. No mezcle métodos.',
  'snap-amplitude': 'La amplitud SNAP cae en lesión postganglionar. En radiculopatía (preganglionar) el SNAP suele conservarse.',
  'sensory-cv': 'VCS = distancia / latencia. Use la misma convención (onset vs pico) que la norma. Temperatura 32–34 °C en la mano.',
  'antidromic-orthodromic': 'Antidrómica: mayor amplitud, más artefacto. Ortodrómica: más nítida, menor amplitud. No compare amplitudes entre técnicas.',
  'pre-post-ganglionic': 'SNAP ausente + EMG de denervación = postganglionar (plexo/nervio). SNAP presente + denervación miotomal = raíz.',
  'age-height': 'La VCM cae ~0.5–1 m/s por década; la altura alarga latencias F. Use normas ajustadas, no valores de adulto joven en octogenarios.',
  'stimulus-artifact': 'Artefacto amplio: reduzca impedancia, gire ánodo, use supresión y separe cables. No “mida” sobre el artefacto.',
  'martin-gruber': 'Martin-Gruber (mediano→cubital) simula bloqueo cubital en codo. Riche-Cannieu explica APB “cubitalizado”. Siempre busque anastomosis ante hallazgos incongruentes.',
  'early-recruitment': 'Reclutamiento precoz: muchas UM a baja fuerza, PUM breves/bajos. Típico miopático. No lo confunda con esfuerzo incompleto.',
  'reduced-recruitment': 'Pocas UM disparando rápido a fuerza submáxima = pérdida de axones. Es el sello neurogénico crónico o agudo.',
  'fdi': 'FDI: cubital, C8-T1. Sitio clave para radiculopatía C8, plexo inferior y cubital. Inserción en el vientre, 1er espacio interóseo.',
  'apb': 'APB: mediano, C8-T1. Túnel carpiano vs raíz C8 vs plexo. Compare con FDI y PQ.',
  'biceps': 'Bíceps: musculocutáneo, C5-C6. Diferencia plexo superior vs C6 vs nervio.',
  'triceps': 'Tríceps: radial, C6-C8. Compare cabeza lateral vs ancóneo para radial vs raíz.',
  'deltoid': 'Deltoides: axilar, C5-C6. Incluya en plexo superior y neuropatía axilar post-luxación.',
  'forearm-extensors': 'Extensor común: radial posterior/PIN, C7. Caída de muñeca vs C7 vs PIN (supinador spared).',
  'cervical-paraspinals': 'Paraespinales cervicales: denervación apoya radiculopatía (preganglionar). Explore varios niveles; evite C2 superficial.',
  'tibialis-anterior': 'TA: peroneo profundo, L4-L5. Pie caído: peroneo vs L5 vs ciático vs plexo.',
  'medial-gastrocnemius': 'Gastrocnemio medial: tibial, S1-S2. Complementa sóleo/H-reflex.',
  'vastus-lateralis': 'Vasto lateral: femoral, L3-L4. Radiculopatía lumbar alta vs femoral.',
  'gluteus-medius': 'Glúteo medio: glúteo superior, L4-L5-S1. Útil en L5 vs peroneo (el TA y GM se afectan en L5; el peroneo no denerva glúteos).',
  'ehl': 'EHL: peroneo profundo, L5. Muy sensible para L5.',
  'lumbar-paraspinals': 'Paraespinales lumbares confirman radiculopatía. No los omita en lumbociática con NCS normal.',
  'f-wave-utility': 'Onda F: motoneurona más proximal. Útil en CIDP, Guillain-Barré precoz y radiculoplexopatía. Ausencia aislada no diagnostica.',
  'h-reflex-physiology': 'H es el análogo del Aquiles (S1, Ia). Estímulo submáximo. Lateralidad y cronodispersion importan más que un valor absoluto.',
  'h-reflex-values-utilty': 'H tibial-sóleo: compare lados (>1.5 ms o ausencia unilateral). No sustituye la EMG de S1.',
  'a-wave-pathophysiology': 'Ondas A: axon reflex o efornización. Aparecen en neuropatía desmielinizante o regeneración; no son F tardías.',
  'blink-technique': 'Blink: estímulo supraorbitario, registro orbicularis oculi. R1 ipsilateral, R2 bilateral. Útil en V1, VII y puente.',
  'uremic-neuropathy': 'Neuropatía urémica: axonal distalo-simétrica, SNAP primero. Mejora tras trasplante más que con diálisis sola.',
  'block-vs-dispersion': 'Bloqueo: caída de amplitud/área proximal sin dispersión excesiva. Dispersión: duración ↑, área relativamente conservada. Use criterios AANEM.',
  'f-wave-tables': 'Latencia F mínima depende de talla. Persistencia baja en NCS normales no es patológica por sí sola.',
  'h-reflex-tables': 'Normas H-sóleo varían por talla y edad. Documente temperatura y lado.',
  'ssep-vep-tables': 'PESS: N9/N13/N20 o lumbares. PEV: P100. Compare interlatencias, no solo un pico.',
  'segmental-table': 'Miotomas: C5 hombro, C6 bíceps/BR, C7 triceps, C8 intrínsecos, L4 cuádriceps, L5 TA/EHL, S1 gastrocnemio.',
  'dermatome-table': 'Dermatomas no coinciden 1:1 con SNAP. El SNAP evalúa nervio, no raíz.',
  'emg-muscle-table': 'Protocolo mínimo radicular: 2 músculos de raíz distinta + paraespinal + 1 distal. Evite “un músculo por raíz”.',
  'aanem-guidelines': 'Siga guías AANEM de valores de referencia, bloqueo y consentimiento. Documente temperatura y distancias.',
  'atlases-videos': 'Use atlas de Preston/Leis y videos de técnica con licencia. No sustituyen la supervisión en el laboratorio.',
  'online-resources': 'Calculadoras de F y nomogramas son auxiliares. La interpretación clínica prevalece.',
  'clinical-impact': 'El frío prolonga latencias y aumenta amplitudes. Caliente la extremidad antes de diagnosticar desmielinización.',
  'standard-requirements': 'Laboratorio: tierra, calibración, consentimiento, temperatura, distancias medidas, trazos archivados.',
  '60hz-noise': '60 Hz: notch, aleje cables, mejore tierra, apague luces fluorescentes. No “filtre” un CMAP real.',
  'co-stimulation': 'Co-estimulación activa un nervio vecino y finge amplitud. Palpe el músculo equivocado y reduzca intensidad.',
  'distance-errors': '2 cm de error en 10 cm = 20% de error en VCM. Use cinta y puntos óseos.',
  'pacemakers-icd': 'Evite estímulo cerca del generador; use pulsos cortos y avise al paciente. No contraindica NCS distal de rutina.',
  'bleeding-risk': 'INR elevado: evite músculos profundos (flexor radial del carpo, paracervical profundo, iliopsoas). Documente consentimiento.',
  'infection-risk': 'Piel infectada: no puncione. Celulitis y úlceras son contraindicación local.',
  'pneumothorax': 'Serrato, supraespinoso, cervicales anteriores: riesgo de neumotórax. Técnica tangencial y experiencia.',
  'supramaximal': 'Supramáximo = 20–30% sobre la meseta del CMAP. Infraestimular finge bloqueo.',
  'sweep-gain': 'Motor: 5 ms/div, 5 mV/div típico. Sensitivo: 1–2 ms/div, 10–20 µV. Ajuste para no recortar picos.',
  'reproducibility': 'Repita el CMAP/SNAP al menos 2 veces. Variación >10–15% obliga a revisar técnica.',
};

function imageFor(id) {
  if (/emg|mup|recruit|needle|fdi|apb|biceps|triceps|deltoid|paraspinal|gastroc|vastus|gluteus|tibialis/.test(id)) {
    return { src: WIKI.emg, alt: 'Principio de registro EMG (Wikimedia Commons, dominio público/CC)', caption: 'Registro de potenciales de unidad motora. Fuente: Wikimedia Commons.' };
  }
  if (/snap|cmap|ncs|conduction|latency|artifact|supramaximal|martin|facial|trigeminal/.test(id)) {
    return { src: WIKI.ncs, alt: 'Estudio de neuroconducción (Wikimedia Commons)', caption: 'Montaje de neuroconducción. Fuente: Wikimedia Commons.' };
  }
  if (/myelin|node|saltatory|wallerian|axonal|fiber/.test(id)) {
    return { src: WIKI.myelin, alt: 'Neurona y vaina de mielina (Wikimedia Commons)', caption: 'Arquitectura neuronal. Fuente: Wikimedia Commons.' };
  }
  return { src: WIKI.action, alt: 'Potencial de acción (Wikimedia Commons)', caption: 'Potencial de acción. Fuente: Wikimedia Commons.' };
}

function expansionFor(item) {
  const focus = SPECIFIC[item.id] ?? `El tema «${item.title}» debe interpretarse en el contexto del estudio electrodiagnóstico completo (clínica + NCS + EMG), nunca como un hallazgo aislado.`;
  const img = imageFor(item.id);
  const content = `## Objetivos
- Describir el fundamento fisiológico de ${item.title.toLowerCase()}.
- Aplicar la técnica de registro o el razonamiento diagnóstico correspondiente en el laboratorio de EMG/NCS.
- Reconocer errores técnicos que simulan patología.

## Explicación clínica
${focus}

Este contenido amplía la hoja original (menos de 60 palabras) para uso docente. Pendiente de validación clínica institucional antes de usarse como material acreditable exclusivo.

## Técnica
1. Verifique temperatura cutánea (32–34 °C en mano/pie) y consentimiento.
2. Optimice impedancia (<5 kΩ) y orientación cátodo/ánodo.
3. Obtenga respuestas supramáximas reproducibles y compare con el lado contralateral y normas del laboratorio.
4. Si el hallazgo es discordante, repita medición de distancia y descarte anastomosis o co-estimulación.

## Interpretación
Integre latencia, amplitud, duración, velocidad, ondas tardías y EMG de aguja. Un único parámetro alterado rara vez cierra el diagnóstico topográfico.

## Errores frecuentes
- Diagnosticar desmielinización en extremidad fría.
- Infraestimulación que imita bloqueo de conducción.
- Omitir paraespinales en la radiculopatía.
- Comparar técnicas antidrómica y ortodrómica como si fueran equivalentes.

## Perlas
- La clínica dirige el protocolo; el protocolo no sustituye a la clínica.
- Documente calibración, distancias y temperatura en cada estudio.

## Puntos clave
- ${item.title} se interpreta siempre en un protocolo sistematizado.
- La reproducibilidad técnica precede a cualquier conclusión patológica.
- Las normas deben ser las de su laboratorio o de AANEM ajustadas por edad/talla.

## Bibliografía
- Preston DC, Shapiro BE. Electromyography and Neuromuscular Disorders. Elsevier; 2021.
- Kimura J. Electrodiagnosis in Diseases of Nerve and Muscle. Oxford University Press; 2013.
- Chen S et al. Electrodiagnostic reference values. Muscle Nerve. 2016.
- AANEM practice guidelines. https://www.aanem.org/`;

  const contentEn = `## Objectives
- Explain the physiological basis of ${item.title}.
- Apply the corresponding EMG/NCS technique and avoid technical mimics of disease.

## Clinical explanation
${focus}

Expanded from a short stub (<60 words). Pending institutional clinical validation before exclusive accredited use.

## Technique
Warm the limb, check impedance, obtain reproducible supramaximal responses, and compare side-to-side.

## Key points
- Interpret ${item.title} inside a complete EDX protocol.
- Technical reproducibility comes before diagnosis.
- Use lab-specific or AANEM reference values.`;

  return {
    content,
    contentEn,
    clinicalPearls: [
      `${item.title}: confirme temperatura y reproducibilidad antes de etiquetar patología.`,
      'Un hallazgo técnico no es un síndrome clínico.',
    ],
    clinicalPearlsEn: [
      `${item.title}: confirm temperature and reproducibility before calling pathology.`,
      'A technical finding is not a clinical syndrome.',
    ],
    keyPoints: [
      `Fundamento y técnica de ${item.title} en el laboratorio de EDX.`,
      'Errores de medición y temperatura son la primera hipótesis ante un valor extremo.',
      'Correlacione siempre con la topografía clínica (raíz, plexo, nervio, músculo, UNM).',
    ],
    keyPointsEn: [
      `EDX basis and technique for ${item.title}.`,
      'Measurement and temperature error first, disease second.',
      'Correlate with clinical localization.',
    ],
    imageUrls: [img],
  };
}

function letter(i) {
  return String.fromCharCode(97 + i);
}

function questionsFor(leaf, index) {
  const topic = leaf.title.replace(/"/g, "'");
  const idBase = `${leaf.id}-q${index}`;
  const difficulties = ['basic', 'intermediate', 'advanced'];
  const templates = [
    {
      type: 'single',
      stem: `En relación con ${topic}, ¿cuál es la primera acción técnica antes de interpretar un valor patológico?`,
      stemEn: `Regarding ${topic}, what is the first technical action before interpreting a pathologic value?`,
      options: [
        'Verificar temperatura, impedancia y reproducibilidad del trazo',
        'Concluir inmediatamente axonotmesis',
        'Aumentar el notch de 60 Hz hasta desaparecer el CMAP',
        'Omitir el lado contralateral para ahorrar tiempo',
      ],
      optionsEn: [
        'Check temperature, impedance, and trace reproducibility',
        'Immediately conclude axonotmesis',
        'Increase the 60 Hz notch until the CMAP disappears',
        'Skip the contralateral side to save time',
      ],
      correct: 0,
      explanation: 'La calidad técnica precede a cualquier conclusión clínica en EDX.',
    },
    {
      type: 'single',
      stem: `¿Qué patrón localiza mejor la lesión cuando se estudia ${topic}?`,
      stemEn: `Which pattern best localizes the lesion when studying ${topic}?`,
      options: [
        'La combinación de NCS, ondas tardías y EMG miotomal/paraspinal',
        'Un único SNAP de baja amplitud',
        'Una latencia F aislada en un paciente alto',
        'Dolor referido sin hallazgos eléctricos',
      ],
      optionsEn: [
        'The combination of NCS, late responses, and myotomal/paraspinal EMG',
        'A single low-amplitude SNAP',
        'An isolated F latency in a tall patient',
        'Referred pain without electrical findings',
      ],
      correct: 0,
      explanation: 'La localización electrodiagnóstica es multimodal.',
    },
    {
      type: 'true_false',
      stem: `Un hallazgo aislado relacionado con ${topic} basta para certificar un diagnóstico sindromático sin correlación clínica.`,
      stemEn: `An isolated finding related to ${topic} is enough to certify a syndromic diagnosis without clinical correlation.`,
      options: ['Verdadero', 'Falso'],
      optionsEn: ['True', 'False'],
      correct: 1,
      explanation: 'El EDX interpreta hipótesis clínicas; no las reemplaza.',
    },
    {
      type: 'multiple',
      stem: `Seleccione errores que pueden simular patología al evaluar ${topic}.`,
      stemEn: `Select errors that can mimic pathology when evaluating ${topic}.`,
      options: [
        'Extremidad fría',
        'Infraestimulación',
        'Medición incorrecta de distancia',
        'Consentimiento informado firmado',
      ],
      optionsEn: [
        'Cold limb',
        'Submaximal stimulation',
        'Incorrect distance measurement',
        'Signed informed consent',
      ],
      correctIds: [0, 1, 2],
      explanation: 'Frío, estímulo submáximo y error de distancia son mímicos clásicos.',
    },
  ];

  return templates.map((t, qi) => {
    const opts = t.options.map((text, oi) => ({
      id: `${idBase}-${letter(oi)}`,
      text,
      textEn: t.optionsEn[oi],
      isCorrect: t.correctIds ? t.correctIds.includes(oi) : oi === t.correct,
    }));
    return {
      id: `${idBase}-${qi + 1}`,
      sort_order: qi + 1,
      type: t.type,
      stem: t.stem,
      stem_en: t.stemEn,
      image_url: null,
      image_alt: null,
      options: opts,
      explanation: t.explanation,
      explanation_en: t.explanation,
      difficulty: difficulties[qi % 3],
    };
  });
}

const shorts = parseShortTopics();
const uniqueShorts = [];
const seenShort = new Set();
for (const s of shorts) {
  if (seenShort.has(s.id)) continue;
  seenShort.add(s.id);
  uniqueShorts.push(s);
}

const expansions = {};
for (const item of uniqueShorts) {
  expansions[item.id] = expansionFor(item);
}

const ts = `import type { Topic } from '../types/content';

export type LessonExpansion = Pick<Topic, 'content' | 'contentEn' | 'clinicalPearls' | 'clinicalPearlsEn' | 'keyPoints' | 'keyPointsEn' | 'imageUrls'>;

/** Ampliaciones de hojas cortas. Pendientes de validación clínica institucional. */
export const LESSON_EXPANSIONS: Record<string, LessonExpansion> = ${JSON.stringify(expansions, null, 2)};

export function getLessonExpansion(topicId: string): LessonExpansion | undefined {
  return LESSON_EXPANSIONS[topicId];
}
`;

if (!fs.existsSync('src/content/lessonExpansions.ts')) {
  fs.mkdirSync('src/content', { recursive: true });
  fs.writeFileSync('src/content/lessonExpansions.ts', ts);
} else {
  console.log('keeping existing src/content/lessonExpansions.ts (source of truth)');
}

const leaves = parseLeafTopics();
const uniqueLeaves = [];
const seenLeaf = new Set();
for (const l of leaves) {
  if (seenLeaf.has(l.id)) continue;
  seenLeaf.add(l.id);
  uniqueLeaves.push(l);
}

const quizzes = uniqueLeaves.map((leaf, idx) => ({
  topic_id: leaf.id,
  title: `Evaluación: ${leaf.title}`,
  pass_score: 70,
  max_attempts: null,
  shuffle_questions: true,
  shuffle_options: true,
  clinical_validation_status: 'pending_review',
  questions: questionsFor(leaf, idx),
}));

fs.mkdirSync('supabase/seeds', { recursive: true });
fs.writeFileSync(
  'supabase/seeds/topic_quizzes_pending_validation.json',
  JSON.stringify(
    {
      meta: {
        generatedAt: new Date().toISOString(),
        note: 'Banco no acreditable hasta revisión clínica humana. No importar al bundle del cliente.',
        quizCount: quizzes.length,
        questionsPerQuiz: 4,
      },
      quizzes,
    },
    null,
    2
  )
);

const report = `# Cobertura de evaluaciones (pendiente de validación clínica)

- Hojas evaluables detectadas en TEMARIO: **${uniqueLeaves.length}**
- Reactivos por hoja: **4** (básico, intermedio, avanzado, múltiple)
- Estado: \`pending_review\` — no acreditar hasta aprobación del responsable académico
- Semilla: \`supabase/seeds/topic_quizzes_pending_validation.json\`
- Lecciones cortas ampliadas: **${uniqueShorts.length}**

## IDs ampliados
${uniqueShorts.map((s) => `- \`${s.id}\` — ${s.title}`).join('\n')}
`;
fs.writeFileSync('docs/QUIZ_VALIDATION_STATUS.md', report);

console.log(`expansions=${uniqueShorts.length} quizzes=${uniqueLeaves.length}`);
