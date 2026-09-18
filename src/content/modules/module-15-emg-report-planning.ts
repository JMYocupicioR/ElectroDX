import { Module } from '../../types/content';

export const module15: Module = {
  id: 'emg-report-planning',
  number: 15,
  title: 'Planificación del Estudio e Informe EMG',
  titleEn: 'Study Planning and EMG Report',
  emoji: '📝',
  description: 'Diseño del protocolo, registro de datos y redacción de un informe electrodiagnóstico útil para el clínico que lo solicita.',
  descriptionEn: 'Protocol design, data capture and writing an electrodiagnostic report the referring clinician can use.',
  color: 'from-amber-500 to-orange-700',
  icon: 'ClipboardList',
  topics: [
    {
      id: 'pretest-planning',
      title: 'Planificación previa: pregunta, consentimiento y riesgos',
      titleEn: 'Pre-test planning: question, consent and risks',
      content: `Antes del estudio se confirma la pregunta clínica, medicamentos (anticoagulantes, inhibidores de colinesterasa), dispositivos implantables y tolerancia del paciente. El consentimiento incluye molestia de la estimulación, riesgo de hematoma con aguja y, en músculos torácicos, el riesgo raro de neumotórax.

La planificación también decide qué se hará si el paciente no tolera el estudio completo: cuáles nervios son imprescindibles y cuáles pueden diferirse. En un paciente con DAI, se coordina con cardiología. En un niño, se prioriza el mínimo de agujas que responda la pregunta.

Documente lateralidad, fecha de inicio, síntomas sensitivos versus motores y estudios de imagen previos. Un protocolo escrito de 4-6 líneas evita estudios incompletos y repeticiones. **Pendiente de validación clínica institucional.**`,
      clinicalPearls: [
        'Si el paciente está anticoagulado, evite músculos profundos incompresibles; no cancele de forma automática todo el EMG.',
        'La pregunta “¿hay radiculopatía lumbar?” no se responde con un mediano y un cubital.',
      ],
      keyPoints: [
        'Consentimiento y riesgos forman parte del protocolo.',
        'Defina el mínimo imprescindible antes de empezar.',
      ],
    },
    {
      id: 'protocol-selection',
      title: 'Selección de nervios y músculos',
      titleEn: 'Nerve and muscle selection',
      content: `Un protocolo eficiente empieza por el territorio sintomático y un nervio de control. Para un síndrome de túnel del carpo se añaden comparaciones y el cubital. Para una plexopatía se cubren SNAPs que localizan por encima o debajo del ganglio. Para una polineuropatía se estudian al menos dos nervios motores y dos sensitivos en dos extremidades, buscando simetría.

La EMG se elige por miotoma y por nervio: un músculo distal, uno intermedio y uno proximal cuando se busca radiculopatía. No se explora “todo el miotoma” si tres músculos bien elegidos ya contestan. Si hay sospecha de miopatía, se privilegian cinturas y se evita concluir con un solo músculo distal.

Registre distancias, temperaturas y si el estímulo fue realmente supramáximo. Sin esos datos, el informe no es defendible. **Pendiente de validación clínica institucional.**`,
      keyPoints: [
        'Sintomático + control + músculos divisorios.',
        'La temperatura y el estímulo supramáximo son datos, no adornos.',
      ],
    },
    {
      id: 'report-structure',
      title: 'Estructura del informe: datos, hallazgos e impresión',
      titleEn: 'Report structure: data, findings and impression',
      content: `El informe tiene tres bloques que no deben mezclarse. 1) Datos técnicos: nervios, distancias, latencias, amplitudes, velocidades, músculos, actividad espontánea y reclutamiento. 2) Hallazgos interpretados: “caída de amplitud del CMAP cubital a través del codo del 60 % con ralentización focal”. 3) Impresión clínica: localización, fisiopatología (axonal, desmielinizante, bloqueo), cronicidad y correlación con la pregunta.

Evite copiar tablas sin frase de impresión. Evite impresiones que el estudio no sostiene (“descarta ELA”). Prefiera: “no hay evidencia electrodiagnóstica de… en los territorios explorados”. Mencione limitaciones (estudio incompleto, temperatura baja, aguja no tolerada).

El clínico que solicita el estudio debe poder actuar: operar, inmunoterapia, observación o ampliar imagen. Si la impresión no cambia conducta, reescriba. **Pendiente de validación clínica institucional.**`,
      clinicalPearls: [
        'Separe “hallazgo” de “impresión”. El hallazgo es medible; la impresión es el juicio.',
        'Nunca use “dentro de límites normales” si faltó el nervio que respondía la pregunta.',
      ],
      keyPoints: [
        'Tres bloques: datos, hallazgos, impresión.',
        'Declare limitaciones y evite descartar enfermedades no exploradas.',
      ],
    },
    {
      id: 'wording-pitfalls',
      title: 'Lenguaje del informe y errores que generan confusión',
      titleEn: 'Report wording and confusing pitfalls',
      content: `Frases que generan daño: “EMG positivo” (¿de qué?), “túnel del carpo grado severo” sin definir si es axonal o desmielinizante, “compatible con ELA” en un estudio de una extremidad. Use términos AANEM cuando sea posible: bloqueo de conducción, dispersión temporal, caída de amplitud, denervación activa, unidades de reinervación crónica.

Si hay criterios publicados (CIDP, ALS, MG), cite si se cumplen o no y por qué faltan datos. No convierta un estudio incompleto en un criterio “casi cumplido”. Cuando recomiende seguimiento, ponga plazo y qué se espera que cambie (p. ej. “repetir EMG en 3-4 semanas si se busca denervación en evolución”).

**Pendiente de validación clínica institucional.**`,
      keyPoints: [
        'Prohibido el “EMG positivo” sin objeto.',
        'Si usa criterios, declare si se cumplen con los datos actuales.',
      ],
    },
  ],
};
