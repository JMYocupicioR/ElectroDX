/**
 * Respaldo estático de las 85 preguntas EMG de NeuroSAFEMX.
 * Fuente: supabase/isla_EMG.json — COMEFYR / Dr. Yocupicio
 * Generado automáticamente. No editar manualmente.
 * Usado como fallback cuando Supabase no está disponible
 * o cuando las tablas aún no han sido creadas.
 */
import type { ExamQuestion } from '../types/exam';

export const EMG_QUESTIONS_FALLBACK: ExamQuestion[] = [
  {
    "id": "emg-fallback-001",
    "island_name": "EMG",
    "module_id": "nerve-conduction",
    "topic_name": "Técnicas de neuroconducción",
    "stem": "¿Cuál es la raíz nerviosa que media principalmente el Reflejo H (Hoffman) y qué tipo de estímulo se requiere para su activación?",
    "findings": [],
    "options": [
      {
        "text": "Raíz S1, con un estímulo eléctrico submáximo en un nervio mixto.",
        "is_correct": true,
        "feedback": "El Reflejo H se produce con un estímulo submáximo que activa las fibras aferentes Ia, principalmente en la raíz S1."
      },
      {
        "text": "Raíz L5, con un estímulo supramáximo de corta duración.",
        "is_correct": false,
        "feedback": "El estímulo supramáximo se utiliza para generar la Onda F, no el Reflejo H."
      }
    ],
    "difficulty": 2,
    "is_critical": true,
    "pearl": "El Reflejo H es un reflejo espinal monosináptico mediado por la raíz S1, siendo el análogo electrofisiológico del reflejo Aquileo.",
    "source_reference": "EMG.doc",
    "tags": [
      "Técnicas de neuroconducción",
      "EMG",
      "intermedio"
    ],
    "status": "PUBLISHED",
    "created_at": "2026-09-12T00:00:00Z",
    "updated_at": "2026-09-12T00:00:00Z"
  },
  {
    "id": "emg-fallback-002",
    "island_name": "EMG",
    "module_id": "nerve-conduction",
    "topic_name": "Técnicas de neuroconducción",
    "stem": "¿Cómo se comportan los potenciales de acción de nervio sensitivo (SNAP) en una lesión proximal a la raíz del ganglio dorsal (radiculopatía)?",
    "findings": [],
    "options": [
      {
        "text": "Permanecen normales.",
        "is_correct": true,
        "feedback": "En lesiones proximales al ganglio, la raíz dorsal (célula bipolar) mantiene la continuidad con las fibras distales, por lo que el SNAP es normal."
      },
      {
        "text": "Se encuentran disminuidos o ausentes.",
        "is_correct": false,
        "feedback": "Los SNAP disminuidos son característicos de lesiones en el ganglio o distales a él, como en plexopatías o neuropatías."
      }
    ],
    "difficulty": 3,
    "is_critical": false,
    "pearl": "En lesiones proximales al ganglio (radiculopatías), los SNAP permanecen normales debido a la persistencia de la continuidad con las fibras sensitivas distales.",
    "source_reference": "EMG.doc",
    "tags": [
      "Técnicas de neuroconducción",
      "EMG",
      "avanzado"
    ],
    "status": "PUBLISHED",
    "created_at": "2026-09-12T00:00:00Z",
    "updated_at": "2026-09-12T00:00:00Z"
  },
  {
    "id": "emg-fallback-003",
    "island_name": "EMG",
    "module_id": "nerve-conduction",
    "topic_name": "Técnicas de neuroconducción",
    "stem": "¿A qué edad las velocidades de conducción nerviosa de un niño se igualan a las de un adulto y cuáles son los valores mínimos esperados?",
    "findings": [],
    "options": [
      {
        "text": "A los 5 años; >50 m/s en miembros superiores y >40 m/s en inferiores.",
        "is_correct": true,
        "feedback": "A los 5 años se alcanza la madurez. Los valores normales son >50 m/s (MsTs) y >40 m/s (MsPs)."
      },
      {
        "text": "A los 2 años; >60 m/s en miembros superiores y >50 m/s en inferiores.",
        "is_correct": false,
        "feedback": "Aunque la sinaptogénesis termina cerca de los 2 años, la conducción nerviosa madura hasta los 5 años."
      }
    ],
    "difficulty": 2,
    "is_critical": true,
    "pearl": "La maduración de las velocidades de neuroconducción alcanza los niveles del adulto a los 5 años de edad.",
    "source_reference": "EMG.doc",
    "tags": [
      "Técnicas de neuroconducción",
      "EMG",
      "intermedio"
    ],
    "status": "PUBLISHED",
    "created_at": "2026-09-12T00:00:00Z",
    "updated_at": "2026-09-12T00:00:00Z"
  },
  {
    "id": "emg-fallback-004",
    "island_name": "EMG",
    "module_id": "emg-needle",
    "topic_name": "Electromiografía",
    "stem": "En el estudio de estimulación repetitiva a 2-3Hz para Miastenia Gravis, ¿qué hallazgo confirma el diagnóstico?",
    "findings": [],
    "options": [
      {
        "text": "Reducción de más del 10% en la amplitud entre la primera respuesta y la más pequeña de las primeras cinco.",
        "is_correct": true,
        "feedback": "El decremento postsináptico típico de la Miastenia Gravis muestra una caída de amplitud superior al 10% en trenes de estímulos a baja frecuencia."
      },
      {
        "text": "Un incremento progresivo (facilitación) superior al 100% tras el ejercicio.",
        "is_correct": false,
        "feedback": "La facilitación es característica de síndromes presinápticos como el de Lambert-Eaton, no de la Miastenia Gravis."
      }
    ],
    "difficulty": 3,
    "is_critical": true,
    "pearl": "El diagnóstico de Miastenia Gravis requiere demostrar un decremento mayor al 10% en la amplitud de la respuesta motora con estimulación repetitiva.",
    "source_reference": "EMG.doc",
    "tags": [
      "Electromiografía",
      "EMG",
      "avanzado"
    ],
    "status": "PUBLISHED",
    "created_at": "2026-09-12T00:00:00Z",
    "updated_at": "2026-09-12T00:00:00Z"
  },
  {
    "id": "emg-fallback-005",
    "island_name": "EMG",
    "module_id": "fundamentals",
    "topic_name": "Principios básicos",
    "stem": "¿Qué órgano sensorial propioceptivo es responsable de informar al sistema nervioso sobre el grado de tensión muscular instantánea?",
    "findings": [],
    "options": [
      {
        "text": "Aparato tendinoso de Golgi.",
        "is_correct": true,
        "feedback": "El aparato de Golgi, situado cerca de la unión musculotendinosa, transmite información de tensión a través de fibras aferentes Ib."
      },
      {
        "text": "Huso muscular.",
        "is_correct": false,
        "feedback": "El huso muscular responde principalmente a los cambios en la longitud (estiramiento) del músculo, no a la tensión."
      }
    ],
    "difficulty": 2,
    "is_critical": false,
    "pearl": "El aparato tendinoso de Golgi es un receptor de tensión situado en la unión musculotendinosa que utiliza fibras Ib.",
    "source_reference": "EMG.doc",
    "tags": [
      "Principios básicos",
      "EMG",
      "intermedio"
    ],
    "status": "PUBLISHED",
    "created_at": "2026-09-12T00:00:00Z",
    "updated_at": "2026-09-12T00:00:00Z"
  },
  {
    "id": "emg-fallback-006",
    "island_name": "EMG",
    "module_id": "fundamentals",
    "topic_name": "Principios básicos",
    "stem": "En una radiculopatía (lesión preganglionar), ¿qué hallazgo es esperado en los SNAPs?",
    "findings": [],
    "options": [
      {
        "text": "SNAPs normales pese a hipoestesia clínica",
        "is_correct": true,
        "feedback": "Correcto. La lesión es proximal al ganglio de la raíz dorsal y las fibras sensitivas distales conservan continuidad con el soma."
      },
      {
        "text": "SNAPs ausentes en todos los nervios",
        "is_correct": false,
        "feedback": "Incorrecto. La ausencia de SNAPs sugiere lesión posganglionar o neuropatía."
      },
      {
        "text": "SNAPs con incremento de amplitud",
        "is_correct": false,
        "feedback": "Incorrecto. No se espera incremento de amplitud por una radiculopatía."
      },
      {
        "text": "SNAPs con latencias muy prolongadas en todos los nervios",
        "is_correct": false,
        "feedback": "Incorrecto. Latencias difusamente prolongadas sugieren desmielinización generalizada."
      }
    ],
    "difficulty": 2,
    "is_critical": true,
    "pearl": "En lesión preganglionar, los SNAPs suelen ser normales.",
    "source_reference": "AANEM (2023). Recommended Policy for Electrodiagnostic Medicine.",
    "tags": [
      "Principios básicos",
      "EMG",
      "intermedio"
    ],
    "status": "PUBLISHED",
    "created_at": "2026-09-12T00:00:00Z",
    "updated_at": "2026-09-12T00:00:00Z"
  },
  {
    "id": "emg-fallback-007",
    "island_name": "EMG",
    "module_id": "fundamentals",
    "topic_name": "Principios básicos",
    "stem": "¿Qué hallazgo en EMG de aguja ayuda a diferenciar radiculopatía de plexopatía?",
    "findings": [],
    "options": [
      {
        "text": "Denervación en músculos paraspinales",
        "is_correct": true,
        "feedback": "Correcto. Los paraspinales reciben ramas dorsales antes del plexo, por eso se afectan en radiculopatía."
      },
      {
        "text": "SNAPs disminuidos en el nervio sural",
        "is_correct": false,
        "feedback": "Incorrecto. SNAPs disminuidos son más propios de lesión posganglionar."
      },
      {
        "text": "Incremento del CMAP tras ejercicio breve",
        "is_correct": false,
        "feedback": "Incorrecto. Ese patrón corresponde a LEMS."
      },
      {
        "text": "Decremento >10% con RNS baja frecuencia",
        "is_correct": false,
        "feedback": "Incorrecto. Ese hallazgo es típico de miastenia gravis."
      }
    ],
    "difficulty": 2,
    "is_critical": true,
    "pearl": "La denervación paraspinal apoya radiculopatía.",
    "source_reference": "Manual de operaciones de electromiografía (INR, 2020).",
    "tags": [
      "Principios básicos",
      "EMG",
      "intermedio"
    ],
    "status": "PUBLISHED",
    "created_at": "2026-09-12T00:00:00Z",
    "updated_at": "2026-09-12T00:00:00Z"
  },
  {
    "id": "emg-fallback-008",
    "island_name": "EMG",
    "module_id": "emg-needle",
    "topic_name": "Electromiografía",
    "stem": "¿Cuál combinación de hallazgos sugiere patrón neurogénico en EMG de aguja?",
    "findings": [],
    "options": [
      {
        "text": "PAUMs de gran amplitud/duración y reclutamiento disminuido",
        "is_correct": true,
        "feedback": "Correcto. La reinervación colateral genera unidades grandes con reclutamiento reducido."
      },
      {
        "text": "PAUMs pequeños y reclutamiento precoz",
        "is_correct": false,
        "feedback": "Incorrecto. Eso es típico de patrón miopático."
      },
      {
        "text": "Bloqueo de conducción motor con sensibilidad normal",
        "is_correct": false,
        "feedback": "Incorrecto. Eso orienta a neuropatía motora multifocal."
      },
      {
        "text": "Incremento >100% del CMAP post-ejercicio",
        "is_correct": false,
        "feedback": "Incorrecto. Es característico de LEMS."
      }
    ],
    "difficulty": 2,
    "is_critical": true,
    "pearl": "El patrón neurogénico combina PAUMs grandes y reclutamiento reducido.",
    "source_reference": "Jiménez-Domínguez et al. (2016). Abordaje clínico y electrofisiológico del paciente con polineuropatía.",
    "tags": [
      "Electromiografía",
      "EMG",
      "intermedio"
    ],
    "status": "PUBLISHED",
    "created_at": "2026-09-12T00:00:00Z",
    "updated_at": "2026-09-12T00:00:00Z"
  },
  {
    "id": "emg-fallback-009",
    "island_name": "EMG",
    "module_id": "emg-needle",
    "topic_name": "Electromiografía",
    "stem": "En un patrón miopático típico, ¿qué se espera en la EMG de aguja?",
    "findings": [],
    "options": [
      {
        "text": "PAUMs de baja amplitud y duración con reclutamiento precoz",
        "is_correct": true,
        "feedback": "Correcto. Muchas unidades pequeñas se activan para generar poca fuerza."
      },
      {
        "text": "PAUMs de gran amplitud y reclutamiento disminuido",
        "is_correct": false,
        "feedback": "Incorrecto. Eso corresponde a patrón neurogénico."
      },
      {
        "text": "Incremento de amplitud con alta frecuencia de RNS",
        "is_correct": false,
        "feedback": "Incorrecto. Es un hallazgo presináptico como en LEMS."
      },
      {
        "text": "SNAPs normales con hipoestesia clínica",
        "is_correct": false,
        "feedback": "Incorrecto. Ese hallazgo sugiere radiculopatía."
      }
    ],
    "difficulty": 2,
    "is_critical": true,
    "pearl": "El patrón miopático muestra reclutamiento precoz con PAUMs pequeños.",
    "source_reference": "Selva O’Callaghan & Trallero Araguás (2008). Miopatías inflamatorias.",
    "tags": [
      "Electromiografía",
      "EMG",
      "intermedio"
    ],
    "status": "PUBLISHED",
    "created_at": "2026-09-12T00:00:00Z",
    "updated_at": "2026-09-12T00:00:00Z"
  },
  {
    "id": "emg-fallback-010",
    "island_name": "EMG",
    "module_id": "emg-needle",
    "topic_name": "Actividad espontánea",
    "stem": "¿Qué indica la presencia de fibrilaciones y ondas positivas en EMG de aguja?",
    "findings": [],
    "options": [
      {
        "text": "Denervación activa o inestabilidad de membrana",
        "is_correct": true,
        "feedback": "Correcto. Sugiere denervación aguda o miopatías inflamatorias/necrotizantes."
      },
      {
        "text": "Trastorno presináptico de la unión neuromuscular",
        "is_correct": false,
        "feedback": "Incorrecto. Eso se evalúa mejor con RNS alta frecuencia y CMAP."
      },
      {
        "text": "Desmielinización crónica sin denervación",
        "is_correct": false,
        "feedback": "Incorrecto. La denervación activa sí produce fibrilaciones."
      },
      {
        "text": "Normalidad electromiográfica",
        "is_correct": false,
        "feedback": "Incorrecto. Es un hallazgo patológico."
      }
    ],
    "difficulty": 2,
    "is_critical": true,
    "pearl": "Fibrilaciones y ondas positivas indican denervación activa.",
    "source_reference": "Manual de operaciones de electromiografía (INR, 2020).",
    "tags": [
      "Actividad espontánea",
      "EMG",
      "intermedio"
    ],
    "status": "PUBLISHED",
    "created_at": "2026-09-12T00:00:00Z",
    "updated_at": "2026-09-12T00:00:00Z"
  },
  {
    "id": "emg-fallback-011",
    "island_name": "EMG",
    "module_id": "emg-needle",
    "topic_name": "Actividad espontánea",
    "stem": "Las fasciculaciones difusas y complejas en EMG sugieren principalmente:",
    "findings": [],
    "options": [
      {
        "text": "Enfermedad de motoneurona (ELA)",
        "is_correct": true,
        "feedback": "Correcto. En un contexto de reinervación crónica, son un signo relevante de ELA."
      },
      {
        "text": "Miastenia gravis",
        "is_correct": false,
        "feedback": "Incorrecto. En MG predominan hallazgos de decremento y jitter."
      },
      {
        "text": "LEMS",
        "is_correct": false,
        "feedback": "Incorrecto. LEMS se caracteriza por facilitación >100% del CMAP."
      },
      {
        "text": "Radiculopatía pura sin denervación",
        "is_correct": false,
        "feedback": "Incorrecto. Las fasciculaciones difusas suelen implicar patología de motoneurona."
      }
    ],
    "difficulty": 2,
    "is_critical": true,
    "pearl": "Fasciculaciones difusas y complejas sugieren ELA.",
    "source_reference": "Shefner et al. (2020). Gold Coast criteria for ALS.",
    "tags": [
      "Actividad espontánea",
      "EMG",
      "intermedio"
    ],
    "status": "PUBLISHED",
    "created_at": "2026-09-12T00:00:00Z",
    "updated_at": "2026-09-12T00:00:00Z"
  },
  {
    "id": "emg-fallback-012",
    "island_name": "EMG",
    "module_id": "emg-needle",
    "topic_name": "Actividad espontánea",
    "stem": "¿Qué describe mejor a las descargas repetitivas complejas en EMG?",
    "findings": [],
    "options": [
      {
        "text": "Inicio y fin súbito con patrón repetitivo tipo \"máquina\"",
        "is_correct": true,
        "feedback": "Correcto. Se observan en cronicidad neurógena o miopática."
      },
      {
        "text": "Aumento y descenso gradual de frecuencia con sonido de \"avión en picada\"",
        "is_correct": false,
        "feedback": "Incorrecto. Esa descripción corresponde a descargas miotónicas."
      },
      {
        "text": "Decremento >10% en RNS a 3 Hz",
        "is_correct": false,
        "feedback": "Incorrecto. Eso evalúa unión neuromuscular."
      },
      {
        "text": "Bloqueo de conducción motor focal",
        "is_correct": false,
        "feedback": "Incorrecto. Es un hallazgo de NMM."
      }
    ],
    "difficulty": 2,
    "is_critical": false,
    "pearl": "Las descargas repetitivas complejas tienen inicio/fin súbito.",
    "source_reference": "Manual de operaciones de electromiografía (INR, 2020).",
    "tags": [
      "Actividad espontánea",
      "EMG",
      "intermedio"
    ],
    "status": "PUBLISHED",
    "created_at": "2026-09-12T00:00:00Z",
    "updated_at": "2026-09-12T00:00:00Z"
  },
  {
    "id": "emg-fallback-013",
    "island_name": "EMG",
    "module_id": "emg-needle",
    "topic_name": "Actividad espontánea",
    "stem": "Las descargas miotónicas en EMG se caracterizan por:",
    "findings": [],
    "options": [
      {
        "text": "Aumentar y disminuir en frecuencia y amplitud con sonido de \"avión en picada\"",
        "is_correct": true,
        "feedback": "Correcto. Es típico de distrofia miotónica o canalopatías."
      },
      {
        "text": "Inicio y fin súbito con ritmo de \"máquina\"",
        "is_correct": false,
        "feedback": "Incorrecto. Eso describe descargas repetitivas complejas."
      },
      {
        "text": "Ausencia de actividad espontánea",
        "is_correct": false,
        "feedback": "Incorrecto. Sí es una forma de actividad espontánea patológica."
      },
      {
        "text": "Incremento >100% del CMAP con ejercicio",
        "is_correct": false,
        "feedback": "Incorrecto. Ese hallazgo es de LEMS."
      }
    ],
    "difficulty": 2,
    "is_critical": false,
    "pearl": "Las descargas miotónicas tienen patrón de \"avión en picada\".",
    "source_reference": "Selva O’Callaghan & Trallero Araguás (2008). Miopatías inflamatorias.",
    "tags": [
      "Actividad espontánea",
      "EMG",
      "intermedio"
    ],
    "status": "PUBLISHED",
    "created_at": "2026-09-12T00:00:00Z",
    "updated_at": "2026-09-12T00:00:00Z"
  },
  {
    "id": "emg-fallback-014",
    "island_name": "EMG",
    "module_id": "diagnostic-criteria",
    "topic_name": "ELA",
    "stem": "Según Gold Coast 2019, ¿qué combinación diagnóstica es suficiente para ELA?",
    "findings": [],
    "options": [
      {
        "text": "Disfunción de NMS y NMI en al menos 1 región, con progresión y exclusión de otras causas",
        "is_correct": true,
        "feedback": "Correcto. Esa combinación cumple criterios Gold Coast."
      },
      {
        "text": "Sólo signos de NMS en dos regiones",
        "is_correct": false,
        "feedback": "Incorrecto. Se requiere evidencia de NMI."
      },
      {
        "text": "Sólo signos de NMI en una región",
        "is_correct": false,
        "feedback": "Incorrecto. Se necesita NMI en al menos dos regiones si no hay NMS."
      },
      {
        "text": "Cualquier fasciculación aislada sin progresión",
        "is_correct": false,
        "feedback": "Incorrecto. Debe documentarse deterioro motor progresivo."
      }
    ],
    "difficulty": 3,
    "is_critical": true,
    "pearl": "Gold Coast 2019 simplifica el diagnóstico de ELA.",
    "source_reference": "Shefner et al. (2020). Gold Coast criteria for ALS.",
    "tags": [
      "ELA",
      "EMG",
      "avanzado"
    ],
    "status": "PUBLISHED",
    "created_at": "2026-09-12T00:00:00Z",
    "updated_at": "2026-09-12T00:00:00Z"
  },
  {
    "id": "emg-fallback-015",
    "island_name": "EMG",
    "module_id": "diagnostic-criteria",
    "topic_name": "ELA",
    "stem": "Según los criterios de Awaji, ¿qué hallazgo se considera equivalente a denervación activa en un músculo con reinervación crónica?",
    "findings": [],
    "options": [
      {
        "text": "Fasciculaciones",
        "is_correct": true,
        "feedback": "Correcto. Awaji otorga el mismo peso que fibrilaciones/ondas positivas."
      },
      {
        "text": "Potenciales miotónicos",
        "is_correct": false,
        "feedback": "Incorrecto. Los potenciales miotónicos sugieren canalopatías."
      },
      {
        "text": "Decremento en RNS a 3 Hz",
        "is_correct": false,
        "feedback": "Incorrecto. Eso es de unión neuromuscular."
      },
      {
        "text": "SNAPs normales",
        "is_correct": false,
        "feedback": "Incorrecto. Esto no es criterio de denervación activa."
      }
    ],
    "difficulty": 3,
    "is_critical": true,
    "pearl": "Awaji equipara fasciculaciones a denervación activa si hay reinervación crónica.",
    "source_reference": "Martínez (2023). Gold Coast y biomarcadores en ELA.",
    "tags": [
      "ELA",
      "EMG",
      "avanzado"
    ],
    "status": "PUBLISHED",
    "created_at": "2026-09-12T00:00:00Z",
    "updated_at": "2026-09-12T00:00:00Z"
  },
  {
    "id": "emg-fallback-016",
    "island_name": "EMG",
    "module_id": "diagnostic-criteria",
    "topic_name": "ELA",
    "stem": "¿Por qué en el estudio electrodiagnóstico de ELA se debe descartar bloqueo de conducción?",
    "findings": [],
    "options": [
      {
        "text": "Para diferenciarla de neuropatía motora multifocal",
        "is_correct": true,
        "feedback": "Correcto. El bloqueo de conducción sugiere NMM, no ELA."
      },
      {
        "text": "Porque el bloqueo de conducción es criterio de ELA",
        "is_correct": false,
        "feedback": "Incorrecto. No es un criterio de ELA."
      },
      {
        "text": "Porque define la severidad de la miopatía inflamatoria",
        "is_correct": false,
        "feedback": "Incorrecto. No aplica a miopatías."
      },
      {
        "text": "Para descartar túnel del carpo",
        "is_correct": false,
        "feedback": "Incorrecto. Son problemas distintos."
      }
    ],
    "difficulty": 2,
    "is_critical": true,
    "pearl": "En ELA se debe descartar bloqueo de conducción.",
    "source_reference": "AANEM (2023). Recommended Policy for Electrodiagnostic Medicine.",
    "tags": [
      "ELA",
      "EMG",
      "intermedio"
    ],
    "status": "PUBLISHED",
    "created_at": "2026-09-12T00:00:00Z",
    "updated_at": "2026-09-12T00:00:00Z"
  },
  {
    "id": "emg-fallback-017",
    "island_name": "EMG",
    "module_id": "diagnostic-criteria",
    "topic_name": "Guillain-Barré",
    "stem": "¿Cuál es un hallazgo típico en AIDP (SGB desmielinizante)?",
    "findings": [],
    "options": [
      {
        "text": "Latencias distales prolongadas y ondas F prolongadas/ausentes",
        "is_correct": true,
        "feedback": "Correcto. Son datos clásicos de desmielinización adquirida."
      },
      {
        "text": "SNAPs normales en miembros superiores y sural ausente",
        "is_correct": false,
        "feedback": "Incorrecto. En AIDP es clásico el ahorro del sural."
      },
      {
        "text": "Incremento >100% del CMAP tras ejercicio",
        "is_correct": false,
        "feedback": "Incorrecto. Ese hallazgo es de LEMS."
      },
      {
        "text": "PAUMs de gran amplitud con reclutamiento reducido",
        "is_correct": false,
        "feedback": "Incorrecto. Ese patrón es neurogénico crónico."
      }
    ],
    "difficulty": 2,
    "is_critical": true,
    "pearl": "AIDP muestra desmielinización con ondas F prolongadas.",
    "source_reference": "Jiménez-Domínguez et al. (2016). Abordaje clínico y electrofisiológico del paciente con polineuropatía.",
    "tags": [
      "Guillain-Barré",
      "EMG",
      "intermedio"
    ],
    "status": "PUBLISHED",
    "created_at": "2026-09-12T00:00:00Z",
    "updated_at": "2026-09-12T00:00:00Z"
  },
  {
    "id": "emg-fallback-018",
    "island_name": "EMG",
    "module_id": "diagnostic-criteria",
    "topic_name": "Guillain-Barré",
    "stem": "¿En qué consiste el \"sural sparing\" en el SGB?",
    "findings": [],
    "options": [
      {
        "text": "SNAP sural normal con SNAPs anormales en extremidades superiores",
        "is_correct": true,
        "feedback": "Correcto. Es un signo clásico de desmielinización adquirida aguda."
      },
      {
        "text": "SNAP sural ausente con SNAPs normales en miembros superiores",
        "is_correct": false,
        "feedback": "Incorrecto. Eso no corresponde a ahorro del sural."
      },
      {
        "text": "CMAP basal bajo con incremento >100% post-ejercicio",
        "is_correct": false,
        "feedback": "Incorrecto. Ese patrón es de LEMS."
      },
      {
        "text": "Bloqueo de conducción en sitios de atrapamiento",
        "is_correct": false,
        "feedback": "Incorrecto. Eso no define el ahorro del sural."
      }
    ],
    "difficulty": 2,
    "is_critical": true,
    "pearl": "El ahorro del sural es un signo útil en AIDP.",
    "source_reference": "Jiménez-Domínguez et al. (2016). Abordaje clínico y electrofisiológico del paciente con polineuropatía.",
    "tags": [
      "Guillain-Barré",
      "EMG",
      "intermedio"
    ],
    "status": "PUBLISHED",
    "created_at": "2026-09-12T00:00:00Z",
    "updated_at": "2026-09-12T00:00:00Z"
  },
  {
    "id": "emg-fallback-019",
    "island_name": "EMG",
    "module_id": "diagnostic-criteria",
    "topic_name": "Guillain-Barré",
    "stem": "La tríada clásica del síndrome de Miller Fisher incluye:",
    "findings": [],
    "options": [
      {
        "text": "Oftalmoplejía, ataxia y arreflexia",
        "is_correct": true,
        "feedback": "Correcto. Además se asocia a anticuerpos anti-GQ1b."
      },
      {
        "text": "Debilidad proximal, miotonía y ptosis",
        "is_correct": false,
        "feedback": "Incorrecto. Esa combinación no define Miller Fisher."
      },
      {
        "text": "Fasciculaciones, hiperreflexia y espasticidad",
        "is_correct": false,
        "feedback": "Incorrecto. Eso orienta a NMS."
      },
      {
        "text": "Parestesias distales con dolor y debilidad focal",
        "is_correct": false,
        "feedback": "Incorrecto. No es la tríada clásica."
      }
    ],
    "difficulty": 1,
    "is_critical": true,
    "pearl": "Miller Fisher: oftalmoplejía, ataxia y arreflexia.",
    "source_reference": "Jiménez-Domínguez et al. (2016). Abordaje clínico y electrofisiológico del paciente con polineuropatía.",
    "tags": [
      "Guillain-Barré",
      "EMG",
      "basico"
    ],
    "status": "PUBLISHED",
    "created_at": "2026-09-12T00:00:00Z",
    "updated_at": "2026-09-12T00:00:00Z"
  },
  {
    "id": "emg-fallback-020",
    "island_name": "EMG",
    "module_id": "diagnostic-criteria",
    "topic_name": "CIDP",
    "stem": "¿Cuál es el criterio temporal que define CIDP (PDIC) frente a SGB?",
    "findings": [],
    "options": [
      {
        "text": "Progresión o recaídas por más de 8 semanas",
        "is_correct": true,
        "feedback": "Correcto. CIDP se caracteriza por curso crónico o recurrente."
      },
      {
        "text": "Progresión menor de 2 semanas",
        "is_correct": false,
        "feedback": "Incorrecto. Eso es más compatible con SGB."
      },
      {
        "text": "Curso fijo menor a 4 semanas",
        "is_correct": false,
        "feedback": "Incorrecto. CIDP no se define por curso agudo."
      },
      {
        "text": "Solo episodios aislados sin progresión",
        "is_correct": false,
        "feedback": "Incorrecto. CIDP requiere progresión o recaídas."
      }
    ],
    "difficulty": 2,
    "is_critical": true,
    "pearl": "CIDP progresa o recae por más de 8 semanas.",
    "source_reference": "EAN/PNS (2021) guideline on CIDP.",
    "tags": [
      "CIDP",
      "EMG",
      "intermedio"
    ],
    "status": "PUBLISHED",
    "created_at": "2026-09-12T00:00:00Z",
    "updated_at": "2026-09-12T00:00:00Z"
  },
  {
    "id": "emg-fallback-021",
    "island_name": "EMG",
    "module_id": "diagnostic-criteria",
    "topic_name": "CIDP",
    "stem": "Según EAN/PNS 2021, para diagnóstico de CIDP se requiere evidencia de desmielinización en:",
    "findings": [],
    "options": [
      {
        "text": "Al menos dos nervios motores",
        "is_correct": true,
        "feedback": "Correcto. Es un requisito clave en el criterio electrofisiológico."
      },
      {
        "text": "Un nervio sensitivo",
        "is_correct": false,
        "feedback": "Incorrecto. La evidencia principal es en nervios motores."
      },
      {
        "text": "Cualquier nervio con CMAP bajo",
        "is_correct": false,
        "feedback": "Incorrecto. La baja amplitud no demuestra desmielinización."
      },
      {
        "text": "Solo paraspinales",
        "is_correct": false,
        "feedback": "Incorrecto. Paraspinales no definen CIDP."
      }
    ],
    "difficulty": 3,
    "is_critical": true,
    "pearl": "EAN/PNS 2021 requiere desmielinización en al menos dos nervios motores.",
    "source_reference": "EAN/PNS (2021) guideline on CIDP.",
    "tags": [
      "CIDP",
      "EMG",
      "avanzado"
    ],
    "status": "PUBLISHED",
    "created_at": "2026-09-12T00:00:00Z",
    "updated_at": "2026-09-12T00:00:00Z"
  },
  {
    "id": "emg-fallback-022",
    "island_name": "EMG",
    "module_id": "diagnostic-criteria",
    "topic_name": "CIDP",
    "stem": "¿Cuál de las siguientes es una variante reconocida de CIDP según EAN/PNS 2021?",
    "findings": [],
    "options": [
      {
        "text": "MADSAM (multifocal)",
        "is_correct": true,
        "feedback": "Correcto. Es una variante multifocal de CIDP."
      },
      {
        "text": "Neuropatía motora multifocal con bloqueo",
        "is_correct": false,
        "feedback": "Incorrecto. Esa entidad es distinta y tiene conducción sensitiva normal."
      },
      {
        "text": "ELA con predominio bulbar",
        "is_correct": false,
        "feedback": "Incorrecto. No es una variante de CIDP."
      },
      {
        "text": "Miopatía necrotizante",
        "is_correct": false,
        "feedback": "Incorrecto. Es una miopatía inflamatoria."
      }
    ],
    "difficulty": 2,
    "is_critical": false,
    "pearl": "CIDP tiene variantes: distal, MADSAM, focal, motora pura.",
    "source_reference": "EAN/PNS (2021) guideline on CIDP.",
    "tags": [
      "CIDP",
      "EMG",
      "intermedio"
    ],
    "status": "PUBLISHED",
    "created_at": "2026-09-12T00:00:00Z",
    "updated_at": "2026-09-12T00:00:00Z"
  },
  {
    "id": "emg-fallback-023",
    "island_name": "EMG",
    "module_id": "diagnostic-criteria",
    "topic_name": "CIDP",
    "stem": "¿Cuál es tratamiento de primera línea para CIDP?",
    "findings": [],
    "options": [
      {
        "text": "Inmunoglobulina intravenosa o corticosteroides",
        "is_correct": true,
        "feedback": "Correcto. Ambas son opciones de primera línea."
      },
      {
        "text": "Corticosteroides contraindicados",
        "is_correct": false,
        "feedback": "Incorrecto. Son una opción válida en CIDP."
      },
      {
        "text": "Evitar IgIV por falta de respuesta",
        "is_correct": false,
        "feedback": "Incorrecto. IgIV es tratamiento estándar."
      },
      {
        "text": "Solo plasmaféresis en todos los casos",
        "is_correct": false,
        "feedback": "Incorrecto. No es la única primera línea."
      }
    ],
    "difficulty": 2,
    "is_critical": true,
    "pearl": "IgIV o corticosteroides son primera línea en CIDP.",
    "source_reference": "EAN/PNS (2021) guideline on CIDP.",
    "tags": [
      "CIDP",
      "EMG",
      "intermedio"
    ],
    "status": "PUBLISHED",
    "created_at": "2026-09-12T00:00:00Z",
    "updated_at": "2026-09-12T00:00:00Z"
  },
  {
    "id": "emg-fallback-024",
    "island_name": "EMG",
    "module_id": "diagnostic-criteria",
    "topic_name": "Neuropatía motora multifocal",
    "stem": "La presentación clínica típica de neuropatía motora multifocal (NMM) es:",
    "findings": [],
    "options": [
      {
        "text": "Debilidad asimétrica distal, predominio en MS, sin sensibilidad afectada",
        "is_correct": true,
        "feedback": "Correcto. No hay síntomas sensitivos ni signos de NMS."
      },
      {
        "text": "Debilidad simétrica proximal con parestesias difusas",
        "is_correct": false,
        "feedback": "Incorrecto. Eso orienta más a CIDP típica."
      },
      {
        "text": "Debilidad con decremento en RNS a 3 Hz",
        "is_correct": false,
        "feedback": "Incorrecto. Ese hallazgo es de MG."
      },
      {
        "text": "Debilidad con incremento >100% del CMAP",
        "is_correct": false,
        "feedback": "Incorrecto. Eso es LEMS."
      }
    ],
    "difficulty": 2,
    "is_critical": true,
    "pearl": "NMM: debilidad distal asimétrica sin afectación sensitiva.",
    "source_reference": "AANEM (2023). Recommended Policy for Electrodiagnostic Medicine.",
    "tags": [
      "Neuropatía motora multifocal",
      "EMG",
      "intermedio"
    ],
    "status": "PUBLISHED",
    "created_at": "2026-09-12T00:00:00Z",
    "updated_at": "2026-09-12T00:00:00Z"
  },
  {
    "id": "emg-fallback-025",
    "island_name": "EMG",
    "module_id": "diagnostic-criteria",
    "topic_name": "Neuropatía motora multifocal",
    "stem": "¿Cuál es el hallazgo electrofisiológico clave en NMM?",
    "findings": [],
    "options": [
      {
        "text": "Bloqueo de conducción motor fuera de sitios de atrapamiento con conducción sensitiva normal",
        "is_correct": true,
        "feedback": "Correcto. Es el sello electrofisiológico de la NMM."
      },
      {
        "text": "SNAPs abolidos en todos los nervios",
        "is_correct": false,
        "feedback": "Incorrecto. En NMM la sensibilidad se conserva."
      },
      {
        "text": "PAUMs de baja amplitud con reclutamiento precoz",
        "is_correct": false,
        "feedback": "Incorrecto. Eso sugiere miopatía."
      },
      {
        "text": "Decremento >10% en RNS a baja frecuencia",
        "is_correct": false,
        "feedback": "Incorrecto. Es típico de MG."
      }
    ],
    "difficulty": 3,
    "is_critical": true,
    "pearl": "El bloqueo de conducción motor fuera de atrapamiento es clave en NMM.",
    "source_reference": "AANEM (2023). Recommended Policy for Electrodiagnostic Medicine.",
    "tags": [
      "Neuropatía motora multifocal",
      "EMG",
      "avanzado"
    ],
    "status": "PUBLISHED",
    "created_at": "2026-09-12T00:00:00Z",
    "updated_at": "2026-09-12T00:00:00Z"
  },
  {
    "id": "emg-fallback-026",
    "island_name": "EMG",
    "module_id": "diagnostic-criteria",
    "topic_name": "Neuropatía motora multifocal",
    "stem": "¿Qué marcador serológico se asocia a NMM en cerca del 50% de los casos?",
    "findings": [],
    "options": [
      {
        "text": "IgM anti-GM1",
        "is_correct": true,
        "feedback": "Correcto. Es un marcador clásico de NMM."
      },
      {
        "text": "Anti-GQ1b",
        "is_correct": false,
        "feedback": "Incorrecto. Se asocia a Miller Fisher."
      },
      {
        "text": "Anti-AChR",
        "is_correct": false,
        "feedback": "Incorrecto. Se asocia a miastenia gravis."
      },
      {
        "text": "Anti-SRP",
        "is_correct": false,
        "feedback": "Incorrecto. Se asocia a miopatía necrotizante."
      }
    ],
    "difficulty": 2,
    "is_critical": false,
    "pearl": "Anti-GM1 IgM es positivo en ~50% de NMM.",
    "source_reference": "Jiménez-Domínguez et al. (2016). Abordaje clínico y electrofisiológico del paciente con polineuropatía.",
    "tags": [
      "Neuropatía motora multifocal",
      "EMG",
      "intermedio"
    ],
    "status": "PUBLISHED",
    "created_at": "2026-09-12T00:00:00Z",
    "updated_at": "2026-09-12T00:00:00Z"
  },
  {
    "id": "emg-fallback-027",
    "island_name": "EMG",
    "module_id": "diagnostic-criteria",
    "topic_name": "Neuropatía motora multifocal",
    "stem": "El tratamiento recomendado en NMM es:",
    "findings": [],
    "options": [
      {
        "text": "Inmunoglobulina intravenosa; evitar corticosteroides",
        "is_correct": true,
        "feedback": "Correcto. IgIV es eficaz y los esteroides pueden empeorar."
      },
      {
        "text": "Corticosteroides como primera línea",
        "is_correct": false,
        "feedback": "Incorrecto. Pueden empeorar la NMM."
      },
      {
        "text": "No tratar hasta progresión severa",
        "is_correct": false,
        "feedback": "Incorrecto. El tratamiento temprano mejora la función."
      },
      {
        "text": "Solo plasmaféresis",
        "is_correct": false,
        "feedback": "Incorrecto. No es el tratamiento estándar."
      }
    ],
    "difficulty": 2,
    "is_critical": true,
    "pearl": "NMM responde a IgIV; corticoides pueden empeorar.",
    "source_reference": "AANEM (2023). Recommended Policy for Electrodiagnostic Medicine.",
    "tags": [
      "Neuropatía motora multifocal",
      "EMG",
      "intermedio"
    ],
    "status": "PUBLISHED",
    "created_at": "2026-09-12T00:00:00Z",
    "updated_at": "2026-09-12T00:00:00Z"
  },
  {
    "id": "emg-fallback-028",
    "island_name": "EMG",
    "module_id": "repetitive-stimulation",
    "topic_name": "Unión neuromuscular",
    "stem": "En miastenia gravis, la estimulación nerviosa repetitiva (RNS) a baja frecuencia es positiva cuando:",
    "findings": [],
    "options": [
      {
        "text": "Hay decremento >10% en la amplitud del CMAP",
        "is_correct": true,
        "feedback": "Correcto. Se observa típicamente entre el 1° y 4°/5° estímulo."
      },
      {
        "text": "Hay incremento >100% del CMAP",
        "is_correct": false,
        "feedback": "Incorrecto. Ese patrón es de LEMS."
      },
      {
        "text": "SNAPs normales en miembros superiores",
        "is_correct": false,
        "feedback": "Incorrecto. Eso no define MG."
      },
      {
        "text": "Ondas F prolongadas en todos los nervios",
        "is_correct": false,
        "feedback": "Incorrecto. Eso se relaciona con desmielinización."
      }
    ],
    "difficulty": 2,
    "is_critical": true,
    "pearl": "RNS a 2-3 Hz con decremento >10% sugiere MG.",
    "source_reference": "AANEM (2023). Recommended Policy for Electrodiagnostic Medicine.",
    "tags": [
      "Unión neuromuscular",
      "EMG",
      "intermedio"
    ],
    "status": "PUBLISHED",
    "created_at": "2026-09-12T00:00:00Z",
    "updated_at": "2026-09-12T00:00:00Z"
  },
  {
    "id": "emg-fallback-029",
    "island_name": "EMG",
    "module_id": "repetitive-stimulation",
    "topic_name": "Unión neuromuscular",
    "stem": "En miastenia gravis, ¿qué hallazgo en SFEMG es típico?",
    "findings": [],
    "options": [
      {
        "text": "Aumento del jitter o bloqueos",
        "is_correct": true,
        "feedback": "Correcto. Es la prueba más sensible (95-99%)."
      },
      {
        "text": "Descargas miotónicas",
        "is_correct": false,
        "feedback": "Incorrecto. Eso sugiere canalopatías."
      },
      {
        "text": "Fibrilaciones difusas",
        "is_correct": false,
        "feedback": "Incorrecto. Eso sugiere denervación activa."
      },
      {
        "text": "PAUMs de gran amplitud y duración",
        "is_correct": false,
        "feedback": "Incorrecto. Es un hallazgo neurogénico."
      }
    ],
    "difficulty": 2,
    "is_critical": true,
    "pearl": "SFEMG es la prueba más sensible para MG.",
    "source_reference": "AANEM (2023). Recommended Policy for Electrodiagnostic Medicine.",
    "tags": [
      "Unión neuromuscular",
      "EMG",
      "intermedio"
    ],
    "status": "PUBLISHED",
    "created_at": "2026-09-12T00:00:00Z",
    "updated_at": "2026-09-12T00:00:00Z"
  },
  {
    "id": "emg-fallback-030",
    "island_name": "EMG",
    "module_id": "repetitive-stimulation",
    "topic_name": "Unión neuromuscular",
    "stem": "¿Cuál es la implicación de un jitter normal en SFEMG de un músculo clínicamente débil?",
    "findings": [],
    "options": [
      {
        "text": "Prácticamente excluye miastenia gravis",
        "is_correct": true,
        "feedback": "Correcto. Un jitter normal en músculo débil hace improbable MG."
      },
      {
        "text": "Confirma LEMS",
        "is_correct": false,
        "feedback": "Incorrecto. LEMS requiere facilitación del CMAP."
      },
      {
        "text": "Confirma miopatía inflamatoria",
        "is_correct": false,
        "feedback": "Incorrecto. El jitter no confirma miopatías."
      },
      {
        "text": "Es un hallazgo inespecífico sin valor clínico",
        "is_correct": false,
        "feedback": "Incorrecto. Tiene alto valor predictivo negativo."
      }
    ],
    "difficulty": 2,
    "is_critical": true,
    "pearl": "Jitter normal en músculo débil prácticamente excluye MG.",
    "source_reference": "AANEM (2023). Recommended Policy for Electrodiagnostic Medicine.",
    "tags": [
      "Unión neuromuscular",
      "EMG",
      "intermedio"
    ],
    "status": "PUBLISHED",
    "created_at": "2026-09-12T00:00:00Z",
    "updated_at": "2026-09-12T00:00:00Z"
  },
  {
    "id": "emg-fallback-031",
    "island_name": "EMG",
    "module_id": "repetitive-stimulation",
    "topic_name": "Unión neuromuscular",
    "stem": "El hallazgo electrodiagnóstico típico en LEMS es:",
    "findings": [],
    "options": [
      {
        "text": "CMAP basal bajo con incremento >100% post-ejercicio o alta frecuencia",
        "is_correct": true,
        "feedback": "Correcto. Es un defecto presináptico."
      },
      {
        "text": "Decremento >10% a 3 Hz",
        "is_correct": false,
        "feedback": "Incorrecto. Eso es típico de MG."
      },
      {
        "text": "SNAPs normales en radiculopatía",
        "is_correct": false,
        "feedback": "Incorrecto. Eso corresponde a lesión preganglionar."
      },
      {
        "text": "Bloqueo de conducción motor fuera de atrapamiento",
        "is_correct": false,
        "feedback": "Incorrecto. Eso es de NMM."
      }
    ],
    "difficulty": 2,
    "is_critical": true,
    "pearl": "LEMS muestra facilitación >100% del CMAP tras ejercicio.",
    "source_reference": "AANEM (2023). Recommended Policy for Electrodiagnostic Medicine.",
    "tags": [
      "Unión neuromuscular",
      "EMG",
      "intermedio"
    ],
    "status": "PUBLISHED",
    "created_at": "2026-09-12T00:00:00Z",
    "updated_at": "2026-09-12T00:00:00Z"
  },
  {
    "id": "emg-fallback-032",
    "island_name": "EMG",
    "module_id": "pathologies",
    "topic_name": "Miopatías inflamatorias",
    "stem": "En miopatías inflamatorias, la EMG suele mostrar:",
    "findings": [],
    "options": [
      {
        "text": "Actividad espontánea y PAUMs de corta duración y baja amplitud",
        "is_correct": true,
        "feedback": "Correcto. Es el patrón miopático típico con actividad de membrana."
      },
      {
        "text": "PAUMs grandes con reclutamiento disminuido",
        "is_correct": false,
        "feedback": "Incorrecto. Ese patrón es neurogénico."
      },
      {
        "text": "Bloqueo de conducción motor",
        "is_correct": false,
        "feedback": "Incorrecto. Sugiere NMM."
      },
      {
        "text": "Incremento >100% del CMAP post-ejercicio",
        "is_correct": false,
        "feedback": "Incorrecto. Sugiere LEMS."
      }
    ],
    "difficulty": 2,
    "is_critical": true,
    "pearl": "EMG muestra actividad espontánea y PAUMs pequeños en miopatías.",
    "source_reference": "Selva O’Callaghan & Trallero Araguás (2008). Miopatías inflamatorias.",
    "tags": [
      "Miopatías inflamatorias",
      "EMG",
      "intermedio"
    ],
    "status": "PUBLISHED",
    "created_at": "2026-09-12T00:00:00Z",
    "updated_at": "2026-09-12T00:00:00Z"
  },
  {
    "id": "emg-fallback-033",
    "island_name": "EMG",
    "module_id": "pathologies",
    "topic_name": "Miopatías inflamatorias",
    "stem": "¿Cuál es un patrón clínico-electromiográfico característico de la miositis por cuerpos de inclusión (MCI)?",
    "findings": [],
    "options": [
      {
        "text": "Patrón mixto y afectación de cuádriceps y flexores de dedos",
        "is_correct": true,
        "feedback": "Correcto. La MCI puede mostrar unidades largas y cortas."
      },
      {
        "text": "Respuesta excelente a esteroides",
        "is_correct": false,
        "feedback": "Incorrecto. La MCI responde pobremente a esteroides."
      },
      {
        "text": "Bloqueo de conducción motor",
        "is_correct": false,
        "feedback": "Incorrecto. Eso sugiere NMM."
      },
      {
        "text": "Ahorro del sural",
        "is_correct": false,
        "feedback": "Incorrecto. Es un hallazgo de AIDP."
      }
    ],
    "difficulty": 2,
    "is_critical": false,
    "pearl": "MCI afecta cuádriceps y flexores de los dedos.",
    "source_reference": "Selva O’Callaghan & Trallero Araguás (2008). Miopatías inflamatorias.",
    "tags": [
      "Miopatías inflamatorias",
      "EMG",
      "intermedio"
    ],
    "status": "PUBLISHED",
    "created_at": "2026-09-12T00:00:00Z",
    "updated_at": "2026-09-12T00:00:00Z"
  },
  {
    "id": "emg-fallback-034",
    "island_name": "EMG",
    "module_id": "pathologies",
    "topic_name": "Miopatías inflamatorias",
    "stem": "El anticuerpo anti-Jo1 se asocia clásicamente con:",
    "findings": [],
    "options": [
      {
        "text": "Síndrome antisintetasa (miositis, EPI, manos de mecánico)",
        "is_correct": true,
        "feedback": "Correcto. Es el marcador clásico del síndrome antisintetasa."
      },
      {
        "text": "Dermatomiositis asociada a cáncer (anti-p155/140)",
        "is_correct": false,
        "feedback": "Incorrecto. Ese es anti-p155/140."
      },
      {
        "text": "Miopatía necrotizante grave (anti-SRP)",
        "is_correct": false,
        "feedback": "Incorrecto. Ese es anti-SRP."
      },
      {
        "text": "Miastenia gravis (anti-AChR)",
        "is_correct": false,
        "feedback": "Incorrecto. Anti-AChR es de MG."
      }
    ],
    "difficulty": 2,
    "is_critical": false,
    "pearl": "Anti-Jo1 se asocia a síndrome antisintetasa.",
    "source_reference": "Selva O’Callaghan & Trallero Araguás (2008). Miopatías inflamatorias.",
    "tags": [
      "Miopatías inflamatorias",
      "EMG",
      "intermedio"
    ],
    "status": "PUBLISHED",
    "created_at": "2026-09-12T00:00:00Z",
    "updated_at": "2026-09-12T00:00:00Z"
  },
  {
    "id": "emg-fallback-035",
    "island_name": "EMG",
    "module_id": "pathologies",
    "topic_name": "Miopatías inflamatorias",
    "stem": "El anticuerpo anti-Mi2 se asocia principalmente con:",
    "findings": [],
    "options": [
      {
        "text": "Dermatomiositis clásica con buen pronóstico",
        "is_correct": true,
        "feedback": "Correcto. Anti-Mi2 se relaciona con dermatomiositis clásica."
      },
      {
        "text": "Miositis por cuerpos de inclusión",
        "is_correct": false,
        "feedback": "Incorrecto. No es el marcador típico."
      },
      {
        "text": "Miopatía necrotizante resistente a esteroides",
        "is_correct": false,
        "feedback": "Incorrecto. Eso se asocia a anti-SRP."
      },
      {
        "text": "Síndrome de Miller Fisher",
        "is_correct": false,
        "feedback": "Incorrecto. Miller Fisher se asocia a anti-GQ1b."
      }
    ],
    "difficulty": 1,
    "is_critical": false,
    "pearl": "Anti-Mi2 se asocia a dermatomiositis clásica y buen pronóstico.",
    "source_reference": "Selva O’Callaghan & Trallero Araguás (2008). Miopatías inflamatorias.",
    "tags": [
      "Miopatías inflamatorias",
      "EMG",
      "basico"
    ],
    "status": "PUBLISHED",
    "created_at": "2026-09-12T00:00:00Z",
    "updated_at": "2026-09-12T00:00:00Z"
  },
  {
    "id": "emg-fallback-036",
    "island_name": "EMG",
    "module_id": "pathologies",
    "topic_name": "Miopatías inflamatorias",
    "stem": "El anticuerpo anti-SRP se asocia a:",
    "findings": [],
    "options": [
      {
        "text": "Miopatía necrotizante grave y resistencia a esteroides",
        "is_correct": true,
        "feedback": "Correcto. Es un marcador de miopatía necrotizante."
      },
      {
        "text": "Dermatomiositis asociada a cáncer",
        "is_correct": false,
        "feedback": "Incorrecto. Eso es anti-p155/140."
      },
      {
        "text": "Síndrome antisintetasa",
        "is_correct": false,
        "feedback": "Incorrecto. Ese es anti-Jo1."
      },
      {
        "text": "Miastenia gravis",
        "is_correct": false,
        "feedback": "Incorrecto. MG se asocia a anti-AChR o anti-MuSK."
      }
    ],
    "difficulty": 1,
    "is_critical": false,
    "pearl": "Anti-SRP sugiere miopatía necrotizante grave.",
    "source_reference": "Selva O’Callaghan & Trallero Araguás (2008). Miopatías inflamatorias.",
    "tags": [
      "Miopatías inflamatorias",
      "EMG",
      "basico"
    ],
    "status": "PUBLISHED",
    "created_at": "2026-09-12T00:00:00Z",
    "updated_at": "2026-09-12T00:00:00Z"
  },
  {
    "id": "emg-fallback-037",
    "island_name": "EMG",
    "module_id": "pathologies",
    "topic_name": "Miopatías inflamatorias",
    "stem": "¿Qué anticuerpo se asocia a dermatomiositis vinculada a cáncer?",
    "findings": [],
    "options": [
      {
        "text": "Anti-p155/140",
        "is_correct": true,
        "feedback": "Correcto. Es un marcador de riesgo oncológico."
      },
      {
        "text": "Anti-Mi2",
        "is_correct": false,
        "feedback": "Incorrecto. Anti-Mi2 se asocia a dermatomiositis clásica."
      },
      {
        "text": "Anti-GQ1b",
        "is_correct": false,
        "feedback": "Incorrecto. Se relaciona con Miller Fisher."
      },
      {
        "text": "Anti-AChR",
        "is_correct": false,
        "feedback": "Incorrecto. Se asocia a MG."
      }
    ],
    "difficulty": 1,
    "is_critical": false,
    "pearl": "Anti-p155/140 se asocia a malignidad en dermatomiositis.",
    "source_reference": "Selva O’Callaghan & Trallero Araguás (2008). Miopatías inflamatorias.",
    "tags": [
      "Miopatías inflamatorias",
      "EMG",
      "basico"
    ],
    "status": "PUBLISHED",
    "created_at": "2026-09-12T00:00:00Z",
    "updated_at": "2026-09-12T00:00:00Z"
  },
  {
    "id": "emg-fallback-038",
    "island_name": "EMG",
    "module_id": "pathologies",
    "topic_name": "Miopatías inflamatorias",
    "stem": "En miopatías inflamatorias, ¿por qué se recomienda realizar EMG y biopsia en músculos contralaterales?",
    "findings": [],
    "options": [
      {
        "text": "Para evitar artefactos inflamatorios inducidos por la aguja",
        "is_correct": true,
        "feedback": "Correcto. La aguja puede causar cambios inflamatorios locales."
      },
      {
        "text": "Porque la EMG debe siempre preceder a la biopsia",
        "is_correct": false,
        "feedback": "Incorrecto. Lo importante es no biopsiar el mismo sitio pinchado."
      },
      {
        "text": "Para aumentar la amplitud del CMAP",
        "is_correct": false,
        "feedback": "Incorrecto. No afecta el CMAP."
      },
      {
        "text": "Para medir la conducción sensitiva de dos nervios",
        "is_correct": false,
        "feedback": "Incorrecto. Esa no es la razón."
      }
    ],
    "difficulty": 2,
    "is_critical": false,
    "pearl": "EMG y biopsia deben hacerse en lados contralaterales.",
    "source_reference": "Manual de operaciones de electromiografía (INR, 2020).",
    "tags": [
      "Miopatías inflamatorias",
      "EMG",
      "intermedio"
    ],
    "status": "PUBLISHED",
    "created_at": "2026-09-12T00:00:00Z",
    "updated_at": "2026-09-12T00:00:00Z"
  },
  {
    "id": "emg-fallback-039",
    "island_name": "EMG",
    "module_id": "evoked-potentials",
    "topic_name": "Potenciales evocados",
    "stem": "En el sistema 10-20, el punto Cz (vértex) se localiza:",
    "findings": [],
    "options": [
      {
        "text": "En la línea media entre T3 y T4",
        "is_correct": true,
        "feedback": "Correcto. Cz corresponde al vértex en la línea media."
      },
      {
        "text": "En la línea media entre Fp1 y Fp2",
        "is_correct": false,
        "feedback": "Incorrecto. Ese punto corresponde a Fpz."
      },
      {
        "text": "En el punto medio entre O1 y O2",
        "is_correct": false,
        "feedback": "Incorrecto. Ese punto es Oz."
      },
      {
        "text": "Por delante del vértex en la región frontal",
        "is_correct": false,
        "feedback": "Incorrecto. Cz es vértex en línea media."
      }
    ],
    "difficulty": 1,
    "is_critical": false,
    "pearl": "En el sistema 10-20, Cz está en la línea media entre T3 y T4.",
    "source_reference": "Manual de operaciones de electromiografía (INR, 2020).",
    "tags": [
      "Potenciales evocados",
      "EMG",
      "basico"
    ],
    "status": "PUBLISHED",
    "created_at": "2026-09-12T00:00:00Z",
    "updated_at": "2026-09-12T00:00:00Z"
  },
  {
    "id": "emg-fallback-040",
    "island_name": "EMG",
    "module_id": "fundamentals",
    "topic_name": "Principios básicos",
    "stem": "¿Cuál es el efecto del frío en estudios de conducción nerviosa?",
    "findings": [],
    "options": [
      {
        "text": "Aumenta latencia y amplitud, y disminuye velocidad",
        "is_correct": true,
        "feedback": "Correcto. La temperatura baja enlentece la conducción."
      },
      {
        "text": "Disminuye latencia y aumenta velocidad",
        "is_correct": false,
        "feedback": "Incorrecto. Ocurre lo contrario."
      },
      {
        "text": "No tiene efecto sobre la conducción",
        "is_correct": false,
        "feedback": "Incorrecto. La temperatura es un factor crítico."
      },
      {
        "text": "Solo reduce amplitud sin cambiar latencia",
        "is_correct": false,
        "feedback": "Incorrecto. La latencia aumenta con el frío."
      }
    ],
    "difficulty": 2,
    "is_critical": true,
    "pearl": "Temperatura baja aumenta latencia y reduce velocidad.",
    "source_reference": "Chen et al. (2016). Electrodiagnostic reference values.",
    "tags": [
      "Principios básicos",
      "EMG",
      "intermedio"
    ],
    "status": "PUBLISHED",
    "created_at": "2026-09-12T00:00:00Z",
    "updated_at": "2026-09-12T00:00:00Z"
  },
  {
    "id": "emg-fallback-041",
    "island_name": "EMG",
    "module_id": "fundamentals",
    "topic_name": "Principios básicos",
    "stem": "Temperaturas recomendadas para estudios de conducción nerviosa son:",
    "findings": [],
    "options": [
      {
        "text": ">32°C en miembros superiores y >31°C en inferiores",
        "is_correct": true,
        "feedback": "Correcto. Garantiza valores comparables y evita falsos positivos."
      },
      {
        "text": ">28°C en miembros superiores y >26°C en inferiores",
        "is_correct": false,
        "feedback": "Incorrecto. Son demasiado bajas."
      },
      {
        "text": "No se requiere control de temperatura",
        "is_correct": false,
        "feedback": "Incorrecto. La temperatura afecta la conducción."
      },
      {
        "text": ">35°C en todos los casos",
        "is_correct": false,
        "feedback": "Incorrecto. No es un requisito estándar."
      }
    ],
    "difficulty": 2,
    "is_critical": true,
    "pearl": "Extremidades deben mantenerse templadas para interpretaciones válidas.",
    "source_reference": "Chen et al. (2016). Electrodiagnostic reference values.",
    "tags": [
      "Principios básicos",
      "EMG",
      "intermedio"
    ],
    "status": "PUBLISHED",
    "created_at": "2026-09-12T00:00:00Z",
    "updated_at": "2026-09-12T00:00:00Z"
  },
  {
    "id": "emg-fallback-042",
    "island_name": "EMG",
    "module_id": "late-responses",
    "topic_name": "Reflejo H",
    "stem": "¿Qué diferencia interlado de latencia del reflejo H es considerada significativa?",
    "findings": [],
    "options": [
      {
        "text": "Mayor a 1.2–1.5 ms",
        "is_correct": true,
        "feedback": "Correcto. Esa diferencia sugiere alteración relevante."
      },
      {
        "text": "Mayor a 0.2 ms",
        "is_correct": false,
        "feedback": "Incorrecto. Ese valor es demasiado bajo."
      },
      {
        "text": "Mayor a 3.5 ms",
        "is_correct": false,
        "feedback": "Incorrecto. Es un umbral excesivo para interlado."
      },
      {
        "text": "No se evalúa interlado en el reflejo H",
        "is_correct": false,
        "feedback": "Incorrecto. La comparación interlado es útil."
      }
    ],
    "difficulty": 2,
    "is_critical": false,
    "pearl": "Diferencia interlado del reflejo H >1.2-1.5 ms es significativa.",
    "source_reference": "Manual de operaciones de electromiografía (INR, 2020).",
    "tags": [
      "Reflejo H",
      "EMG",
      "intermedio"
    ],
    "status": "PUBLISHED",
    "created_at": "2026-09-12T00:00:00Z",
    "updated_at": "2026-09-12T00:00:00Z"
  },
  {
    "id": "emg-fallback-043",
    "island_name": "EMG",
    "module_id": "late-responses",
    "topic_name": "Onda F",
    "stem": "¿Qué evalúa principalmente la onda F en estudios de conducción nerviosa?",
    "findings": [],
    "options": [
      {
        "text": "Conducción proximal y raíces",
        "is_correct": true,
        "feedback": "Correcto. La onda F explora segmentos proximales."
      },
      {
        "text": "Unión neuromuscular postsináptica",
        "is_correct": false,
        "feedback": "Incorrecto. Eso se evalúa con RNS o SFEMG."
      },
      {
        "text": "Conducción sensitiva distal exclusiva",
        "is_correct": false,
        "feedback": "Incorrecto. La onda F es motor y proximal."
      },
      {
        "text": "Solo la integridad del músculo estudiado",
        "is_correct": false,
        "feedback": "Incorrecto. No es una prueba miopática."
      }
    ],
    "difficulty": 2,
    "is_critical": false,
    "pearl": "La onda F evalúa conducción proximal (raíces).",
    "source_reference": "Manual de operaciones de electromiografía (INR, 2020).",
    "tags": [
      "Onda F",
      "EMG",
      "intermedio"
    ],
    "status": "PUBLISHED",
    "created_at": "2026-09-12T00:00:00Z",
    "updated_at": "2026-09-12T00:00:00Z"
  },
  {
    "id": "emg-fallback-044",
    "island_name": "EMG",
    "module_id": "nerve-conduction",
    "topic_name": "Neuropatia del Mediano",
    "stem": "El signo de Bactrian (doble pico en comparativa radial/mediano sensitiva en dedo 4) sugiere:",
    "findings": [],
    "options": [
      {
        "text": "Enlentecimiento focal del nervio mediano en túnel del carpo",
        "is_correct": true,
        "feedback": "Correcto. La diferencia significativa suele ser >0.4–0.5 ms."
      },
      {
        "text": "Neuropatía cubital en canal de Guyón",
        "is_correct": false,
        "feedback": "Incorrecto. El signo se describe para el mediano."
      },
      {
        "text": "Radiculopatía C8-T1",
        "is_correct": false,
        "feedback": "Incorrecto. Es un hallazgo de atrapamiento distal."
      },
      {
        "text": "Bloqueo de conducción motor multifocal",
        "is_correct": false,
        "feedback": "Incorrecto. Eso corresponde a NMM."
      }
    ],
    "difficulty": 2,
    "is_critical": false,
    "pearl": "El signo de Bactrian sugiere enlentecimiento focal del mediano.",
    "source_reference": "Manual de operaciones de electromiografía (INR, 2020).",
    "tags": [
      "Neuropatia del Mediano",
      "EMG",
      "intermedio"
    ],
    "status": "PUBLISHED",
    "created_at": "2026-09-12T00:00:00Z",
    "updated_at": "2026-09-12T00:00:00Z"
  },
  {
    "id": "emg-fallback-045",
    "island_name": "EMG",
    "module_id": "nerve-conduction",
    "topic_name": "Neuropatía cubital",
    "stem": "En el canal de Guyón, un hallazgo electrofisiológico típico es:",
    "findings": [],
    "options": [
      {
        "text": "Latencia motora distal cubital prolongada con velocidad antebraquial normal",
        "is_correct": true,
        "feedback": "Correcto. Suele acompañarse de disminución de amplitud."
      },
      {
        "text": "SNAPs normales en radiculopatía",
        "is_correct": false,
        "feedback": "Incorrecto. Ese hallazgo no define canal de Guyón."
      },
      {
        "text": "Incremento >100% del CMAP post-ejercicio",
        "is_correct": false,
        "feedback": "Incorrecto. Es de LEMS."
      },
      {
        "text": "Decremento >10% en RNS a 3 Hz",
        "is_correct": false,
        "feedback": "Incorrecto. Es de MG."
      }
    ],
    "difficulty": 2,
    "is_critical": true,
    "pearl": "En canal de Guyón hay latencia motora distal cubital prolongada.",
    "source_reference": "Manual de operaciones de electromiografía (INR, 2020).",
    "tags": [
      "Neuropatía cubital",
      "EMG",
      "intermedio"
    ],
    "status": "PUBLISHED",
    "created_at": "2026-09-12T00:00:00Z",
    "updated_at": "2026-09-12T00:00:00Z"
  },
  {
    "id": "emg-fallback-046",
    "island_name": "EMG",
    "module_id": "fundamentals",
    "topic_name": "Principios básicos",
    "stem": "En neuroconducción, la conducción ortodrómica es:",
    "findings": [],
    "options": [
      {
        "text": "El impulso viaja en el sentido fisiológico natural",
        "is_correct": true,
        "feedback": "Correcto. La señal progresa en la dirección normal del sistema."
      },
      {
        "text": "El impulso viaja en sentido contrario al fisiológico",
        "is_correct": false,
        "feedback": "Incorrecto. Eso describe conducción antidrómica."
      },
      {
        "text": "Un reflejo monosináptico",
        "is_correct": false,
        "feedback": "Incorrecto. Eso describe el reflejo H."
      },
      {
        "text": "Una descarga recurrente de motoneuronas",
        "is_correct": false,
        "feedback": "Incorrecto. Eso corresponde a la onda F."
      }
    ],
    "difficulty": 1,
    "is_critical": true,
    "pearl": "Ortodrómico sigue la dirección fisiológica natural.",
    "source_reference": "Manual de operaciones de electromiografía (INR, 2020).",
    "tags": [
      "Principios básicos",
      "EMG",
      "basico"
    ],
    "status": "PUBLISHED",
    "created_at": "2026-09-12T00:00:00Z",
    "updated_at": "2026-09-12T00:00:00Z"
  },
  {
    "id": "emg-fallback-047",
    "island_name": "EMG",
    "module_id": "fundamentals",
    "topic_name": "Principios básicos",
    "stem": "La conducción antidrómica se define como:",
    "findings": [],
    "options": [
      {
        "text": "Propagación opuesta a la conducción fisiológica",
        "is_correct": true,
        "feedback": "Correcto. La señal viaja en sentido inverso al habitual."
      },
      {
        "text": "Propagación exclusiva por fibras sensitivas Ia",
        "is_correct": false,
        "feedback": "Incorrecto. No se limita a fibras Ia."
      },
      {
        "text": "Respuesta monosináptica constante",
        "is_correct": false,
        "feedback": "Incorrecto. Eso describe el reflejo H."
      },
      {
        "text": "Respuesta tardía agotable",
        "is_correct": false,
        "feedback": "Incorrecto. La onda F no es agotable."
      }
    ],
    "difficulty": 1,
    "is_critical": true,
    "pearl": "Antidrómico va en sentido opuesto a la conducción fisiológica.",
    "source_reference": "Manual de operaciones de electromiografía (INR, 2020).",
    "tags": [
      "Principios básicos",
      "EMG",
      "basico"
    ],
    "status": "PUBLISHED",
    "created_at": "2026-09-12T00:00:00Z",
    "updated_at": "2026-09-12T00:00:00Z"
  },
  {
    "id": "emg-fallback-048",
    "island_name": "EMG",
    "module_id": "late-responses",
    "topic_name": "Onda F",
    "stem": "Para obtener una onda F confiable se requiere un estímulo:",
    "findings": [],
    "options": [
      {
        "text": "Supramáximo",
        "is_correct": true,
        "feedback": "Correcto. Se busca activar todas las fibras motoras posibles."
      },
      {
        "text": "Submáximo",
        "is_correct": false,
        "feedback": "Incorrecto. El estímulo submáximo se usa para reflejo H."
      },
      {
        "text": "Solo sensitivo",
        "is_correct": false,
        "feedback": "Incorrecto. La onda F es una respuesta motora."
      },
      {
        "text": "Inhibitorio",
        "is_correct": false,
        "feedback": "Incorrecto. No aplica a la técnica."
      }
    ],
    "difficulty": 2,
    "is_critical": true,
    "pearl": "La onda F requiere estímulo supramáximo.",
    "source_reference": "AANEM (2023). Recommended Policy for Electrodiagnostic Medicine.",
    "tags": [
      "Onda F",
      "EMG",
      "intermedio"
    ],
    "status": "PUBLISHED",
    "created_at": "2026-09-12T00:00:00Z",
    "updated_at": "2026-09-12T00:00:00Z"
  },
  {
    "id": "emg-fallback-049",
    "island_name": "EMG",
    "module_id": "late-responses",
    "topic_name": "Onda F",
    "stem": "La onda F se genera por activación de:",
    "findings": [],
    "options": [
      {
        "text": "Fibras alfa motoras",
        "is_correct": true,
        "feedback": "Correcto. Es una descarga recurrente de motoneuronas alfa."
      },
      {
        "text": "Fibras Ia sensitivas",
        "is_correct": false,
        "feedback": "Incorrecto. Esas fibras participan en el reflejo H."
      },
      {
        "text": "Fibras Ib del Golgi",
        "is_correct": false,
        "feedback": "Incorrecto. No son la vía principal de la onda F."
      },
      {
        "text": "Fibras gamma motoras",
        "is_correct": false,
        "feedback": "Incorrecto. Las gamma modulan el huso muscular."
      }
    ],
    "difficulty": 2,
    "is_critical": true,
    "pearl": "La onda F involucra fibras alfa motoras.",
    "source_reference": "Manual de operaciones de electromiografía (INR, 2020).",
    "tags": [
      "Onda F",
      "EMG",
      "intermedio"
    ],
    "status": "PUBLISHED",
    "created_at": "2026-09-12T00:00:00Z",
    "updated_at": "2026-09-12T00:00:00Z"
  },
  {
    "id": "emg-fallback-050",
    "island_name": "EMG",
    "module_id": "late-responses",
    "topic_name": "Onda F",
    "stem": "En condiciones normales, la persistencia de la onda F es:",
    "findings": [],
    "options": [
      {
        "text": "Variable, depende de la excitabilidad del pool de motoneuronas",
        "is_correct": true,
        "feedback": "Correcto. Por eso no aparece en todos los estímulos."
      },
      {
        "text": "Constante, siempre aparece en cada estímulo",
        "is_correct": false,
        "feedback": "Incorrecto. Esa constancia es más propia del reflejo H."
      },
      {
        "text": "Ausente en sujetos sanos",
        "is_correct": false,
        "feedback": "Incorrecto. La onda F es una respuesta normal."
      },
      {
        "text": "Igual a la del reflejo H",
        "is_correct": false,
        "feedback": "Incorrecto. La onda F es menos persistente."
      }
    ],
    "difficulty": 2,
    "is_critical": false,
    "pearl": "La persistencia de la onda F es variable.",
    "source_reference": "Manual de operaciones de electromiografía (INR, 2020).",
    "tags": [
      "Onda F",
      "EMG",
      "intermedio"
    ],
    "status": "PUBLISHED",
    "created_at": "2026-09-12T00:00:00Z",
    "updated_at": "2026-09-12T00:00:00Z"
  },
  {
    "id": "emg-fallback-051",
    "island_name": "EMG",
    "module_id": "late-responses",
    "topic_name": "Onda F",
    "stem": "La amplitud típica de la onda F es aproximadamente:",
    "findings": [],
    "options": [
      {
        "text": "5% del CMAP",
        "is_correct": true,
        "feedback": "Correcto. Es una respuesta pequeña y variable."
      },
      {
        "text": "50-100% del CMAP",
        "is_correct": false,
        "feedback": "Incorrecto. Esa amplitud corresponde al reflejo H."
      },
      {
        "text": "Igual al CMAP basal",
        "is_correct": false,
        "feedback": "Incorrecto. La onda F es de menor amplitud."
      },
      {
        "text": ">150% del CMAP",
        "is_correct": false,
        "feedback": "Incorrecto. No es un hallazgo fisiológico."
      }
    ],
    "difficulty": 2,
    "is_critical": false,
    "pearl": "La onda F suele medir ~5% del CMAP.",
    "source_reference": "Chen et al. (2016). Electrodiagnostic reference values.",
    "tags": [
      "Onda F",
      "EMG",
      "intermedio"
    ],
    "status": "PUBLISHED",
    "created_at": "2026-09-12T00:00:00Z",
    "updated_at": "2026-09-12T00:00:00Z"
  },
  {
    "id": "emg-fallback-052",
    "island_name": "EMG",
    "module_id": "late-responses",
    "topic_name": "Onda F vs Reflejo H",
    "stem": "En la comparación Onda F vs Reflejo H, el agotamiento es:",
    "findings": [],
    "options": [
      {
        "text": "Onda F no agotable; Reflejo H agotable",
        "is_correct": true,
        "feedback": "Correcto. Es una diferencia fisiológica clave."
      },
      {
        "text": "Onda F agotable; Reflejo H no agotable",
        "is_correct": false,
        "feedback": "Incorrecto. Es al revés."
      },
      {
        "text": "Ambas no agotables",
        "is_correct": false,
        "feedback": "Incorrecto. El reflejo H sí puede agotarse."
      },
      {
        "text": "Ambas agotables",
        "is_correct": false,
        "feedback": "Incorrecto. La onda F no es agotable."
      }
    ],
    "difficulty": 2,
    "is_critical": false,
    "pearl": "El reflejo H es agotable; la onda F no.",
    "source_reference": "Manual de operaciones de electromiografía (INR, 2020).",
    "tags": [
      "Onda F vs Reflejo H",
      "EMG",
      "intermedio"
    ],
    "status": "PUBLISHED",
    "created_at": "2026-09-12T00:00:00Z",
    "updated_at": "2026-09-12T00:00:00Z"
  },
  {
    "id": "emg-fallback-053",
    "island_name": "EMG",
    "module_id": "late-responses",
    "topic_name": "Reflejo H",
    "stem": "El reflejo H corresponde a:",
    "findings": [],
    "options": [
      {
        "text": "Un arco reflejo monosináptico",
        "is_correct": true,
        "feedback": "Correcto. Es el análogo eléctrico del reflejo miotático."
      },
      {
        "text": "Una descarga recurrente motora",
        "is_correct": false,
        "feedback": "Incorrecto. Eso describe la onda F."
      },
      {
        "text": "Un potencial sensitivo distal",
        "is_correct": false,
        "feedback": "Incorrecto. No es un SNAP."
      },
      {
        "text": "Un potencial evocado visual",
        "is_correct": false,
        "feedback": "Incorrecto. No pertenece a PE."
      }
    ],
    "difficulty": 2,
    "is_critical": true,
    "pearl": "El reflejo H es un arco monosináptico.",
    "source_reference": "Manual de operaciones de electromiografía (INR, 2020).",
    "tags": [
      "Reflejo H",
      "EMG",
      "intermedio"
    ],
    "status": "PUBLISHED",
    "created_at": "2026-09-12T00:00:00Z",
    "updated_at": "2026-09-12T00:00:00Z"
  },
  {
    "id": "emg-fallback-054",
    "island_name": "EMG",
    "module_id": "late-responses",
    "topic_name": "Reflejo H",
    "stem": "La vía aferente principal del reflejo H es:",
    "findings": [],
    "options": [
      {
        "text": "Fibras Ia sensitivas",
        "is_correct": true,
        "feedback": "Correcto. Hacen sinapsis directa con motoneuronas alfa."
      },
      {
        "text": "Fibras Ib del Golgi",
        "is_correct": false,
        "feedback": "Incorrecto. Esas fibras no median el reflejo H."
      },
      {
        "text": "Fibras A-delta",
        "is_correct": false,
        "feedback": "Incorrecto. No participan en este reflejo."
      },
      {
        "text": "Fibras C",
        "is_correct": false,
        "feedback": "Incorrecto. No median reflejos miotáticos."
      }
    ],
    "difficulty": 2,
    "is_critical": true,
    "pearl": "El reflejo H usa fibras aferentes Ia.",
    "source_reference": "Manual de operaciones de electromiografía (INR, 2020).",
    "tags": [
      "Reflejo H",
      "EMG",
      "intermedio"
    ],
    "status": "PUBLISHED",
    "created_at": "2026-09-12T00:00:00Z",
    "updated_at": "2026-09-12T00:00:00Z"
  },
  {
    "id": "emg-fallback-055",
    "island_name": "EMG",
    "module_id": "late-responses",
    "topic_name": "Reflejo H",
    "stem": "Para obtener un reflejo H, el estímulo debe ser:",
    "findings": [],
    "options": [
      {
        "text": "Submáximo",
        "is_correct": true,
        "feedback": "Correcto. Activa fibras Ia antes que motoras."
      },
      {
        "text": "Supramáximo",
        "is_correct": false,
        "feedback": "Incorrecto. Eso es típico de la onda F."
      },
      {
        "text": "Doloroso e intenso",
        "is_correct": false,
        "feedback": "Incorrecto. La intensidad busca selectividad."
      },
      {
        "text": "Sin estimulación eléctrica",
        "is_correct": false,
        "feedback": "Incorrecto. Es un reflejo inducido."
      }
    ],
    "difficulty": 2,
    "is_critical": true,
    "pearl": "El reflejo H se obtiene con estímulo submáximo.",
    "source_reference": "Manual de operaciones de electromiografía (INR, 2020).",
    "tags": [
      "Reflejo H",
      "EMG",
      "intermedio"
    ],
    "status": "PUBLISHED",
    "created_at": "2026-09-12T00:00:00Z",
    "updated_at": "2026-09-12T00:00:00Z"
  },
  {
    "id": "emg-fallback-056",
    "island_name": "EMG",
    "module_id": "late-responses",
    "topic_name": "Reflejo H",
    "stem": "Comparado con la onda F, el reflejo H se caracteriza por:",
    "findings": [],
    "options": [
      {
        "text": "Latencia y morfología más constantes",
        "is_correct": true,
        "feedback": "Correcto. El reflejo H es más estable."
      },
      {
        "text": "Mayor variabilidad de latencia",
        "is_correct": false,
        "feedback": "Incorrecto. La variabilidad es propia de la onda F."
      },
      {
        "text": "Amplitud siempre menor al 5% del CMAP",
        "is_correct": false,
        "feedback": "Incorrecto. El reflejo H es mayor que la onda F."
      },
      {
        "text": "No relacionarse con la raíz S1",
        "is_correct": false,
        "feedback": "Incorrecto. Es clásico para S1."
      }
    ],
    "difficulty": 2,
    "is_critical": false,
    "pearl": "El reflejo H tiene latencia y morfología constantes.",
    "source_reference": "Manual de operaciones de electromiografía (INR, 2020).",
    "tags": [
      "Reflejo H",
      "EMG",
      "intermedio"
    ],
    "status": "PUBLISHED",
    "created_at": "2026-09-12T00:00:00Z",
    "updated_at": "2026-09-12T00:00:00Z"
  },
  {
    "id": "emg-fallback-057",
    "island_name": "EMG",
    "module_id": "late-responses",
    "topic_name": "Reflejo H",
    "stem": "El reflejo H es el estándar para evaluar la raíz:",
    "findings": [],
    "options": [
      {
        "text": "S1 (sóleo/gastrocnemio)",
        "is_correct": true,
        "feedback": "Correcto. "
      },
      {
        "text": "L5 (Isquiotibiales)",
        "is_correct": false,
        "feedback": "Incorrecto. No es la raíz principal del reflejo H clásico."
      },
      {
        "text": "L4 (tibial anterior)",
        "is_correct": false,
        "feedback": "Incorrecto. El reflejo H clásico evalúa S1."
      },
      {
        "text": "S1 (Gluteos)",
        "is_correct": false,
        "feedback": "Incorrecto. No aplica."
      }
    ],
    "difficulty": 1,
    "is_critical": true,
    "pearl": "El reflejo H evalúa principalmente la raíz S1.",
    "source_reference": "American Association of Neuromuscular & Electrodiagnostic Medicine (AANEM). (2023) ",
    "tags": [
      "Reflejo H",
      "EMG",
      "basico"
    ],
    "status": "PUBLISHED",
    "created_at": "2026-09-12T00:00:00Z",
    "updated_at": "2026-09-12T00:00:00Z"
  },
  {
    "id": "emg-fallback-058",
    "island_name": "EMG",
    "module_id": "late-responses",
    "topic_name": "Onda F vs Reflejo H",
    "stem": "En condiciones normales, la amplitud del reflejo H suele ser:",
    "findings": [],
    "options": [
      {
        "text": "50-100% del CMAP",
        "is_correct": true,
        "feedback": "Correcto. Es más grande que la onda F."
      },
      {
        "text": "~5% del CMAP",
        "is_correct": false,
        "feedback": "Incorrecto. Ese valor corresponde a la onda F."
      },
      {
        "text": "Menor al 1% del CMAP",
        "is_correct": false,
        "feedback": "Incorrecto. Sería demasiado pequeña."
      },
      {
        "text": "Igual al CMAP basal",
        "is_correct": false,
        "feedback": "Incorrecto. Puede variar, pero no es igual al CMAP."
      }
    ],
    "difficulty": 2,
    "is_critical": false,
    "pearl": "La amplitud del reflejo H puede alcanzar 50-100% del CMAP.",
    "source_reference": "Chen et al. (2016). Electrodiagnostic reference values.",
    "tags": [
      "Onda F vs Reflejo H",
      "EMG",
      "intermedio"
    ],
    "status": "PUBLISHED",
    "created_at": "2026-09-12T00:00:00Z",
    "updated_at": "2026-09-12T00:00:00Z"
  },
  {
    "id": "emg-fallback-059",
    "island_name": "EMG",
    "module_id": "nerve-conduction",
    "topic_name": "Técnicas de neuroconducción",
    "stem": "En respuestas tardías, una diferencia interlado patológica se considera cuando es >1.5 ms en miembros superiores o >2 ms en miembros inferiores. Este parámetro se denomina:",
    "findings": [],
    "options": [
      {
        "text": "Regla de latencia interlado",
        "is_correct": true,
        "feedback": "Correcto. Es el parámetro más robusto para comparar lados."
      },
      {
        "text": "Regla de amplitud basal",
        "is_correct": false,
        "feedback": "Incorrecto. La amplitud es menos robusta que la latencia."
      },
      {
        "text": "Regla de velocidad terminal",
        "is_correct": false,
        "feedback": "Incorrecto. Se refiere a otro parámetro."
      },
      {
        "text": "Regla de conducción sensitiva",
        "is_correct": false,
        "feedback": "Incorrecto. Aquí hablamos de latencia interlado."
      }
    ],
    "difficulty": 3,
    "is_critical": true,
    "pearl": "La diferencia interlado es el parámetro más robusto.",
    "source_reference": "Chen et al. (2016). Electrodiagnostic reference values.",
    "tags": [
      "Técnicas de neuroconducción",
      "EMG",
      "avanzado"
    ],
    "status": "PUBLISHED",
    "created_at": "2026-09-12T00:00:00Z",
    "updated_at": "2026-09-12T00:00:00Z"
  },
  {
    "id": "emg-fallback-060",
    "island_name": "EMG",
    "module_id": "late-responses",
    "topic_name": "Onda F",
    "stem": "Una persistencia de onda F <50% sugiere:",
    "findings": [],
    "options": [
      {
        "text": "Pérdida de unidades motoras funcionales o bloqueo proximal",
        "is_correct": true,
        "feedback": "Correcto. Indica compromiso proximal o pérdida de unidades."
      },
      {
        "text": "Reflejo H normal",
        "is_correct": false,
        "feedback": "Incorrecto. La persistencia baja es anormal."
      },
      {
        "text": "Miopatía inflamatoria pura",
        "is_correct": false,
        "feedback": "Incorrecto. Es más indicativo de patología proximal motor."
      },
      {
        "text": "Normalidad del estudio",
        "is_correct": false,
        "feedback": "Incorrecto. Es un dato patológico."
      }
    ],
    "difficulty": 2,
    "is_critical": false,
    "pearl": "Persistencia <50% en onda F sugiere pérdida de unidades motoras o bloqueo proximal.",
    "source_reference": "Manual de operaciones de electromiografía (INR, 2020).",
    "tags": [
      "Onda F",
      "EMG",
      "intermedio"
    ],
    "status": "PUBLISHED",
    "created_at": "2026-09-12T00:00:00Z",
    "updated_at": "2026-09-12T00:00:00Z"
  },
  {
    "id": "emg-fallback-061",
    "island_name": "EMG",
    "module_id": "fundamentals",
    "topic_name": "Principios básicos",
    "stem": "¿Qué umbrales sugieren un proceso desmielinizante en neuroconducción?",
    "findings": [],
    "options": [
      {
        "text": "Latencia distal >130% del límite superior o VCN <75% del límite inferior",
        "is_correct": true,
        "feedback": "Correcto. Son umbrales clásicos para desmielinización."
      },
      {
        "text": "Latencia distal <80% del límite inferior",
        "is_correct": false,
        "feedback": "Incorrecto. No sugiere desmielinización."
      },
      {
        "text": "VCN >120% del límite superior",
        "is_correct": false,
        "feedback": "Incorrecto. No es criterio patológico."
      },
      {
        "text": "Amplitud del CMAP >150% del límite superior",
        "is_correct": false,
        "feedback": "Incorrecto. No define desmielinización."
      }
    ],
    "difficulty": 3,
    "is_critical": true,
    "pearl": "Latencia distal >130% o VCN <75% sugieren desmielinización.",
    "source_reference": "Chen et al. (2016). Electrodiagnostic reference values.",
    "tags": [
      "Principios básicos",
      "EMG",
      "avanzado"
    ],
    "status": "PUBLISHED",
    "created_at": "2026-09-12T00:00:00Z",
    "updated_at": "2026-09-12T00:00:00Z"
  },
  {
    "id": "emg-fallback-062",
    "island_name": "EMG",
    "module_id": "topographic-anatomy",
    "topic_name": "Radiculopatía",
    "stem": "En sospecha de radiculopatía S1 con conducción distal normal, ¿qué respuesta tardía es más confirmatoria?",
    "findings": [],
    "options": [
      {
        "text": "Reflejo H ausente o prolongado",
        "is_correct": true,
        "feedback": "Correcto. Es el estándar de oro para S1."
      },
      {
        "text": "PEV con latencia P100 retrasada",
        "is_correct": false,
        "feedback": "Incorrecto. PEV evalúa vía visual."
      },
      {
        "text": "SNAP sural ausente",
        "is_correct": false,
        "feedback": "Incorrecto. En radiculopatía el SNAP puede ser normal."
      },
      {
        "text": "CMAP con incremento post-ejercicio",
        "is_correct": false,
        "feedback": "Incorrecto. Eso es LEMS."
      }
    ],
    "difficulty": 2,
    "is_critical": true,
    "pearl": "El reflejo H confirma radiculopatía S1.",
    "source_reference": "Manual de operaciones de electromiografía (INR, 2020).",
    "tags": [
      "Radiculopatía",
      "EMG",
      "intermedio"
    ],
    "status": "PUBLISHED",
    "created_at": "2026-09-12T00:00:00Z",
    "updated_at": "2026-09-12T00:00:00Z"
  },
  {
    "id": "emg-fallback-063",
    "island_name": "EMG",
    "module_id": "fundamentals",
    "topic_name": "Neurofisiología básica",
    "stem": "El potencial de acción se define como:",
    "findings": [],
    "options": [
      {
        "text": "Cambio rápido de potencial con retorno inmediato al reposo",
        "is_correct": true,
        "feedback": "Correcto. Es la base eléctrica de la conducción."
      },
      {
        "text": "Liberación de neurotransmisor en la sinapsis",
        "is_correct": false,
        "feedback": "Incorrecto. Eso es un proceso químico."
      },
      {
        "text": "Contracción sostenida del músculo",
        "is_correct": false,
        "feedback": "Incorrecto. No define un potencial de acción."
      },
      {
        "text": "Bloqueo de conducción por desmielinización",
        "is_correct": false,
        "feedback": "Incorrecto. Es un fenómeno patológico."
      }
    ],
    "difficulty": 1,
    "is_critical": false,
    "pearl": "El potencial de acción es un cambio rápido seguido de retorno al reposo.",
    "source_reference": "Manual de operaciones de electromiografía (INR, 2020).",
    "tags": [
      "Neurofisiología básica",
      "EMG",
      "basico"
    ],
    "status": "PUBLISHED",
    "created_at": "2026-09-12T00:00:00Z",
    "updated_at": "2026-09-12T00:00:00Z"
  },
  {
    "id": "emg-fallback-064",
    "island_name": "EMG",
    "module_id": "fundamentals",
    "topic_name": "Neurofisiología básica",
    "stem": "El proceso funcional neuronal se describe como tripartito, integrando:",
    "findings": [],
    "options": [
      {
        "text": "Procesos metabólicos, eléctricos y energéticos",
        "is_correct": true,
        "feedback": "Correcto. El potencial de acción es el componente eléctrico."
      },
      {
        "text": "Solo procesos eléctricos y químicos",
        "is_correct": false,
        "feedback": "Incorrecto. Falta el componente energético."
      },
      {
        "text": "Procesos mecánicos y vasculares",
        "is_correct": false,
        "feedback": "Incorrecto. No corresponde a la definición."
      },
      {
        "text": "Procesos térmicos y osmóticos",
        "is_correct": false,
        "feedback": "Incorrecto. No es la clasificación clásica."
      }
    ],
    "difficulty": 2,
    "is_critical": false,
    "pearl": "El proceso neuronal integra componentes metabólicos, eléctricos y energéticos.",
    "source_reference": "Manual de operaciones de electromiografía (INR, 2020).",
    "tags": [
      "Neurofisiología básica",
      "EMG",
      "intermedio"
    ],
    "status": "PUBLISHED",
    "created_at": "2026-09-12T00:00:00Z",
    "updated_at": "2026-09-12T00:00:00Z"
  },
  {
    "id": "emg-fallback-065",
    "island_name": "EMG",
    "module_id": "emg-needle",
    "topic_name": "Electromiografía",
    "stem": "En el análisis del patrón de reclutamiento, la densidad se refiere a:",
    "findings": [],
    "options": [
      {
        "text": "El número de espigas o actividad presente",
        "is_correct": true,
        "feedback": "Correcto. Es un indicador del número de unidades activas."
      },
      {
        "text": "El voltaje total de la contracción",
        "is_correct": false,
        "feedback": "Incorrecto. Eso describe el promedio de amplitud."
      },
      {
        "text": "La velocidad de conducción",
        "is_correct": false,
        "feedback": "Incorrecto. No es un parámetro de reclutamiento."
      },
      {
        "text": "La latencia de la onda F",
        "is_correct": false,
        "feedback": "Incorrecto. No aplica."
      }
    ],
    "difficulty": 2,
    "is_critical": false,
    "pearl": "El patrón de reclutamiento integra densidad y amplitud promedio.",
    "source_reference": "Manual de operaciones de electromiografía (INR, 2020).",
    "tags": [
      "Electromiografía",
      "EMG",
      "intermedio"
    ],
    "status": "PUBLISHED",
    "created_at": "2026-09-12T00:00:00Z",
    "updated_at": "2026-09-12T00:00:00Z"
  },
  {
    "id": "emg-fallback-066",
    "island_name": "EMG",
    "module_id": "evoked-potentials",
    "topic_name": "Potenciales evocados",
    "stem": "El sistema internacional 10-20 se basa en:",
    "findings": [],
    "options": [
      {
        "text": "Distancias del 10% y 20% entre puntos anatómicos",
        "is_correct": true,
        "feedback": "Correcto. Garantiza proporciones reproducibles."
      },
      {
        "text": "Distancias fijas de 2 cm entre electrodos",
        "is_correct": false,
        "feedback": "Incorrecto. Se usan proporciones, no centímetros fijos."
      },
      {
        "text": "La distancia entre Fp1 y Fp2 exclusivamente",
        "is_correct": false,
        "feedback": "Incorrecto. Usa varios puntos de referencia."
      },
      {
        "text": "Solo puntos preauriculares",
        "is_correct": false,
        "feedback": "Incorrecto. Incluye nasion e inion."
      }
    ],
    "difficulty": 2,
    "is_critical": false,
    "pearl": "El sistema 10-20 usa proporciones 10% y 20%.",
    "source_reference": "Manual de operaciones de electromiografía (INR, 2020).",
    "tags": [
      "Potenciales evocados",
      "EMG",
      "intermedio"
    ],
    "status": "PUBLISHED",
    "created_at": "2026-09-12T00:00:00Z",
    "updated_at": "2026-09-12T00:00:00Z"
  },
  {
    "id": "emg-fallback-067",
    "island_name": "EMG",
    "module_id": "evoked-potentials",
    "topic_name": "Potenciales evocados",
    "stem": "En el sistema 10-20, Nasion e Inion se utilizan como:",
    "findings": [],
    "options": [
      {
        "text": "Puntos de referencia longitudinales para el mapa",
        "is_correct": true,
        "feedback": "Correcto. Son polos anatómicos para la medición."
      },
      {
        "text": "Puntos de referencia exclusivamente laterales",
        "is_correct": false,
        "feedback": "Incorrecto. Los puntos laterales son preauriculares."
      },
      {
        "text": "Sitios de estimulación eléctrica",
        "is_correct": false,
        "feedback": "Incorrecto. Se usan para ubicación, no para estimular."
      },
      {
        "text": "Referencias para la conducción nerviosa periférica",
        "is_correct": false,
        "feedback": "Incorrecto. Son referencias craneales."
      }
    ],
    "difficulty": 2,
    "is_critical": false,
    "pearl": "Nasion e inion son polos del mapa 10-20.",
    "source_reference": "Manual de operaciones de electromiografía (INR, 2020).",
    "tags": [
      "Potenciales evocados",
      "EMG",
      "intermedio"
    ],
    "status": "PUBLISHED",
    "created_at": "2026-09-12T00:00:00Z",
    "updated_at": "2026-09-12T00:00:00Z"
  },
  {
    "id": "emg-fallback-068",
    "island_name": "EMG",
    "module_id": "evoked-potentials",
    "topic_name": "Potenciales evocados",
    "stem": "En la nomenclatura 10-20, ¿qué indican los números impares?",
    "findings": [],
    "options": [
      {
        "text": "Hemisferio izquierdo",
        "is_correct": true,
        "feedback": "Correcto. Los pares corresponden al hemisferio derecho."
      },
      {
        "text": "Hemisferio derecho",
        "is_correct": false,
        "feedback": "Incorrecto. Los pares indican el derecho."
      },
      {
        "text": "Línea media",
        "is_correct": false,
        "feedback": "Incorrecto. La línea media se marca con \"z\"."
      },
      {
        "text": "Zona occipital exclusivamente",
        "is_correct": false,
        "feedback": "Incorrecto. Los números no indican región."
      }
    ],
    "difficulty": 1,
    "is_critical": false,
    "pearl": "En la nomenclatura 10-20, números impares son izquierdos.",
    "source_reference": "Manual de operaciones de electromiografía (INR, 2020).",
    "tags": [
      "Potenciales evocados",
      "EMG",
      "basico"
    ],
    "status": "PUBLISHED",
    "created_at": "2026-09-12T00:00:00Z",
    "updated_at": "2026-09-12T00:00:00Z"
  },
  {
    "id": "emg-fallback-069",
    "island_name": "EMG",
    "module_id": "fundamentals",
    "topic_name": "Principios básicos",
    "stem": "El huso muscular responde a cambios de longitud e integra aferencias:",
    "findings": [],
    "options": [
      {
        "text": "Ia y II, con eferencias gamma",
        "is_correct": true,
        "feedback": "Correcto. Es la base del reflejo miotático."
      },
      {
        "text": "Ib exclusivamente",
        "is_correct": false,
        "feedback": "Incorrecto. Ib corresponde al órgano tendinoso de Golgi."
      },
      {
        "text": "Fibras C",
        "is_correct": false,
        "feedback": "Incorrecto. No participan en propiocepción rápida."
      },
      {
        "text": "Fibras motoras alfa exclusivamente",
        "is_correct": false,
        "feedback": "Incorrecto. Las alfa inervan músculo extrafusal."
      }
    ],
    "difficulty": 2,
    "is_critical": false,
    "pearl": "El huso muscular se inerva por fibras Ia y II.",
    "source_reference": "Manual de operaciones de electromiografía (INR, 2020).",
    "tags": [
      "Principios básicos",
      "EMG",
      "intermedio"
    ],
    "status": "PUBLISHED",
    "created_at": "2026-09-12T00:00:00Z",
    "updated_at": "2026-09-12T00:00:00Z"
  },
  {
    "id": "emg-fallback-070",
    "island_name": "EMG",
    "module_id": "fundamentals",
    "topic_name": "Principios básicos",
    "stem": "El órgano tendinoso de Golgi informa sobre tensión muscular mediante fibras:",
    "findings": [],
    "options": [
      {
        "text": "Ib",
        "is_correct": true,
        "feedback": "Correcto. Se ubica en la unión musculotendinosa."
      },
      {
        "text": "Ia",
        "is_correct": false,
        "feedback": "Incorrecto. Ia es del huso muscular."
      },
      {
        "text": "II",
        "is_correct": false,
        "feedback": "Incorrecto. II también es del huso muscular."
      },
      {
        "text": "C",
        "is_correct": false,
        "feedback": "Incorrecto. No es la vía principal."
      }
    ],
    "difficulty": 2,
    "is_critical": false,
    "pearl": "El órgano tendinoso de Golgi usa aferencias Ib.",
    "source_reference": "Manual de operaciones de electromiografía (INR, 2020).",
    "tags": [
      "Principios básicos",
      "EMG",
      "intermedio"
    ],
    "status": "PUBLISHED",
    "created_at": "2026-09-12T00:00:00Z",
    "updated_at": "2026-09-12T00:00:00Z"
  },
  {
    "id": "emg-fallback-071",
    "island_name": "EMG",
    "module_id": "emg-needle",
    "topic_name": "Actividad espontánea",
    "stem": "Las fibrilaciones/ondas puntiagudas positivas en EMG suelen describirse con sonido de:",
    "findings": [],
    "options": [
      {
        "text": "\"Lluvia en techo\" o \"golpeteo sordo\"",
        "is_correct": true,
        "feedback": "Correcto. Es una descripción clásica de denervación activa."
      },
      {
        "text": "\"Avión en picada\"",
        "is_correct": false,
        "feedback": "Incorrecto. Eso describe descargas miotónicas."
      },
      {
        "text": "\"Máquina\" de inicio y fin súbito",
        "is_correct": false,
        "feedback": "Incorrecto. Eso corresponde a descargas repetitivas complejas."
      },
      {
        "text": "\"Marcha de soldados\"",
        "is_correct": false,
        "feedback": "Incorrecto. Ese sonido es típico de miocimias."
      }
    ],
    "difficulty": 2,
    "is_critical": false,
    "pearl": "Fibrilaciones suenan como \"lluvia en techo\".",
    "source_reference": "Manual de operaciones de electromiografía (INR, 2020).",
    "tags": [
      "Actividad espontánea",
      "EMG",
      "intermedio"
    ],
    "status": "PUBLISHED",
    "created_at": "2026-09-12T00:00:00Z",
    "updated_at": "2026-09-12T00:00:00Z"
  },
  {
    "id": "emg-fallback-072",
    "island_name": "EMG",
    "module_id": "emg-needle",
    "topic_name": "Actividad espontánea",
    "stem": "Las miocimias en EMG se describen típicamente como sonido de:",
    "findings": [],
    "options": [
      {
        "text": "\"Marcha de soldados\"",
        "is_correct": true,
        "feedback": "Correcto. Son descargas en ráfaga características."
      },
      {
        "text": "\"Avión en picada\"",
        "is_correct": false,
        "feedback": "Incorrecto. Ese sonido es de miotonía."
      },
      {
        "text": "\"Lluvia en techo\"",
        "is_correct": false,
        "feedback": "Incorrecto. Eso es de fibrilaciones."
      },
      {
        "text": "\"Máquina\" con inicio y fin súbito",
        "is_correct": false,
        "feedback": "Incorrecto. Eso es de descargas repetitivas complejas."
      }
    ],
    "difficulty": 2,
    "is_critical": false,
    "pearl": "Miocimias suenan como \"marcha de soldados\".\nLas mioquimias son contracciones involuntarias, rítmicas o semirrítmicas, de pequeñas fibras musculares, frecuentemente observadas en párpados o cara. Electromiográficamente (EMG), se caracterizan por descargas agrupadas de unidades motoras de alta frecuencia (\\(5\\) a \\(150\\) Hz), con episodios repetitivos separados por silencios breves. Generalmente benignas, indican irritación nerviosa o fatiga. ",
    "source_reference": "Manual de operaciones de electromiografía (INR, 2020).",
    "tags": [
      "Actividad espontánea",
      "EMG",
      "intermedio"
    ],
    "status": "PUBLISHED",
    "created_at": "2026-09-12T00:00:00Z",
    "updated_at": "2026-09-12T00:00:00Z"
  },
  {
    "id": "emg-fallback-073",
    "island_name": "EMG",
    "module_id": "fundamentals",
    "topic_name": "Lesión nerviosa",
    "stem": "Según Sunderland, la neuropraxia (tipo 1) se caracteriza por:",
    "findings": [],
    "options": [
      {
        "text": "Bloqueo de conducción focal por lesión de mielina",
        "is_correct": true,
        "feedback": "Correcto. La recuperación suele ser en semanas o meses."
      },
      {
        "text": "Sección completa del nervio",
        "is_correct": false,
        "feedback": "Incorrecto. Eso corresponde a neurotmesis."
      },
      {
        "text": "Interrupción axonal con degeneración walleriana",
        "is_correct": false,
        "feedback": "Incorrecto. Eso es axonotmesis."
      },
      {
        "text": "Necrosis muscular primaria",
        "is_correct": false,
        "feedback": "Incorrecto. No es una lesión muscular."
      }
    ],
    "difficulty": 2,
    "is_critical": false,
    "pearl": "Neuropraxia es bloqueo por lesión de mielina, con recuperación en semanas/meses.",
    "source_reference": "Jiménez-Domínguez et al. (2016). Abordaje clínico y electrofisiológico del paciente con polineuropatía.",
    "tags": [
      "Lesión nerviosa",
      "EMG",
      "intermedio"
    ],
    "status": "PUBLISHED",
    "created_at": "2026-09-12T00:00:00Z",
    "updated_at": "2026-09-12T00:00:00Z"
  },
  {
    "id": "emg-fallback-074",
    "island_name": "EMG",
    "module_id": "fundamentals",
    "topic_name": "Lesión nerviosa",
    "stem": "La neurotmesis (tipo 5 de Sunderland) se define como:",
    "findings": [],
    "options": [
      {
        "text": "Sección completa del nervio con necesidad de reparación quirúrgica",
        "is_correct": true,
        "feedback": "Correcto. Es la lesión más grave en la clasificación."
      },
      {
        "text": "Bloqueo de conducción por desmielinización",
        "is_correct": false,
        "feedback": "Incorrecto. Eso es neuropraxia."
      },
      {
        "text": "Interrupción axonal con endoneuro intacto",
        "is_correct": false,
        "feedback": "Incorrecto. Eso es axonotmesis leve."
      },
      {
        "text": "Lesión reversible en días",
        "is_correct": false,
        "feedback": "Incorrecto. Es una lesión grave."
      }
    ],
    "difficulty": 2,
    "is_critical": false,
    "pearl": "Neurotmesis (tipo 5) implica sección completa del nervio.",
    "source_reference": "Jiménez-Domínguez et al. (2016). Abordaje clínico y electrofisiológico del paciente con polineuropatía.",
    "tags": [
      "Lesión nerviosa",
      "EMG",
      "intermedio"
    ],
    "status": "PUBLISHED",
    "created_at": "2026-09-12T00:00:00Z",
    "updated_at": "2026-09-12T00:00:00Z"
  },
  {
    "id": "emg-fallback-075",
    "island_name": "EMG",
    "module_id": "diagnostic-criteria",
    "topic_name": "CIDP y autoanticuerpos",
    "stem": "En CIDP, la presencia de autoanticuerpos IgG4 anti-NF155 suele asociarse con:",
    "findings": [],
    "options": [
      {
        "text": "Pobre respuesta a IgIV y temblor",
        "is_correct": true,
        "feedback": "Correcto. Es un fenotipo descrito en guías recientes."
      },
      {
        "text": "Respuesta excelente y rápida a IgIV",
        "is_correct": false,
        "feedback": "Incorrecto. Suele responder peor."
      },
      {
        "text": "Ausencia total de síntomas sensitivos y motores",
        "is_correct": false,
        "feedback": "Incorrecto. No describe el fenotipo."
      },
      {
        "text": "Incremento >100% del CMAP tras ejercicio",
        "is_correct": false,
        "feedback": "Incorrecto. Eso es típico de LEMS."
      }
    ],
    "difficulty": 3,
    "is_critical": false,
    "pearl": "Anti-NF155 (IgG4) se asocia a pobre respuesta a IgIV y temblor.",
    "source_reference": "EAN/PNS (2021) guideline on CIDP.",
    "tags": [
      "CIDP y autoanticuerpos",
      "EMG",
      "avanzado"
    ],
    "status": "PUBLISHED",
    "created_at": "2026-09-12T00:00:00Z",
    "updated_at": "2026-09-12T00:00:00Z"
  },
  {
    "id": "emg-fallback-076",
    "island_name": "EMG",
    "module_id": "evoked-potentials",
    "topic_name": "Potenciales evocados",
    "stem": "Los potenciales evocados auditivos de tronco (PEAT) evalúan típicamente las ondas:",
    "findings": [],
    "options": [
      {
        "text": "I, III y V",
        "is_correct": true,
        "feedback": "Correcto. Son los picos clásicos en PEAT."
      },
      {
        "text": "N75, P100 y N145",
        "is_correct": false,
        "feedback": "Incorrecto. Esas son de potenciales evocados visuales."
      },
      {
        "text": "N9 y N13",
        "is_correct": false,
        "feedback": "Incorrecto. Esos son somatosensoriales."
      },
      {
        "text": "P300 y N400",
        "is_correct": false,
        "feedback": "Incorrecto. Son componentes cognitivos."
      }
    ],
    "difficulty": 2,
    "is_critical": false,
    "pearl": "PEAT evalúa ondas I, III y V.",
    "source_reference": "AANEM (2023). Recommended Policy for Electrodiagnostic Medicine.",
    "tags": [
      "Potenciales evocados",
      "EMG",
      "intermedio"
    ],
    "status": "PUBLISHED",
    "created_at": "2026-09-12T00:00:00Z",
    "updated_at": "2026-09-12T00:00:00Z"
  },
  {
    "id": "emg-fallback-077",
    "island_name": "EMG",
    "module_id": "evoked-potentials",
    "topic_name": "Potenciales evocados",
    "stem": "En los potenciales evocados visuales (PEV), las ondas clásicas incluyen:",
    "findings": [],
    "options": [
      {
        "text": "N75, P100 y N145",
        "is_correct": true,
        "feedback": "Correcto. Son componentes típicos del PEV."
      },
      {
        "text": "I, III y V",
        "is_correct": false,
        "feedback": "Incorrecto. Esas ondas corresponden a PEAT."
      },
      {
        "text": "M y H",
        "is_correct": false,
        "feedback": "Incorrecto. Esas son respuestas de neuroconducción."
      },
      {
        "text": "P50 y N100",
        "is_correct": false,
        "feedback": "Incorrecto. No son componentes estándar del PEV."
      }
    ],
    "difficulty": 2,
    "is_critical": false,
    "pearl": "PEV evalúa la vía visual con N75, P100 y N145.",
    "source_reference": "AANEM (2023). Recommended Policy for Electrodiagnostic Medicine.",
    "tags": [
      "Potenciales evocados",
      "EMG",
      "intermedio"
    ],
    "status": "PUBLISHED",
    "created_at": "2026-09-12T00:00:00Z",
    "updated_at": "2026-09-12T00:00:00Z"
  },
  {
    "id": "emg-fallback-078",
    "island_name": "EMG",
    "module_id": "evoked-potentials",
    "topic_name": "Potenciales evocados",
    "stem": "Los potenciales evocados somatosensoriales (PESS) se utilizan especialmente en nervios:",
    "findings": [],
    "options": [
      {
        "text": "Mediano, ulnar, peroneo y tibial",
        "is_correct": true,
        "feedback": "Correcto. Evalúan la vía sensorial ascendente."
      },
      {
        "text": "Óptico y acústico",
        "is_correct": false,
        "feedback": "Incorrecto. Esos corresponden a PEV y PEAT."
      },
      {
        "text": "Frénico y facial",
        "is_correct": false,
        "feedback": "Incorrecto. No son nervios típicos para PESS."
      },
      {
        "text": "Vago y glosofaríngeo",
        "is_correct": false,
        "feedback": "Incorrecto. No son usados en PESS."
      }
    ],
    "difficulty": 2,
    "is_critical": false,
    "pearl": "PESS evalúan vías ascendentes, útil en mediano, ulnar, peroneo y tibial.",
    "source_reference": "AANEM (2023). Recommended Policy for Electrodiagnostic Medicine.",
    "tags": [
      "Potenciales evocados",
      "EMG",
      "intermedio"
    ],
    "status": "PUBLISHED",
    "created_at": "2026-09-12T00:00:00Z",
    "updated_at": "2026-09-12T00:00:00Z"
  },
  {
    "id": "emg-fallback-079",
    "island_name": "EMG",
    "module_id": "fundamentals",
    "topic_name": "Principios básicos",
    "stem": "Según AANEM, la EMG debe ser realizada e interpretada por:",
    "findings": [],
    "options": [
      {
        "text": "Médicos capacitados (neurólogos o fisiatras)",
        "is_correct": true,
        "feedback": "Correcto. La EMG requiere síntesis clínica en tiempo real."
      },
      {
        "text": "Técnicos sin supervisión médica",
        "is_correct": false,
        "feedback": "Incorrecto. No cumple con estándares profesionales."
      },
      {
        "text": "Personal administrativo entrenado",
        "is_correct": false,
        "feedback": "Incorrecto. No es un acto administrativo."
      },
      {
        "text": "Cualquier profesional de salud sin formación específica",
        "is_correct": false,
        "feedback": "Incorrecto. Se requiere formación especializada."
      }
    ],
    "difficulty": 2,
    "is_critical": true,
    "pearl": "La EMG es un acto médico con interpretación dinámica.",
    "source_reference": "AANEM (2023). Recommended Policy for Electrodiagnostic Medicine.",
    "tags": [
      "Principios básicos",
      "EMG",
      "intermedio"
    ],
    "status": "PUBLISHED",
    "created_at": "2026-09-12T00:00:00Z",
    "updated_at": "2026-09-12T00:00:00Z"
  },
  {
    "id": "emg-fallback-080",
    "island_name": "EMG",
    "module_id": "topographic-anatomy",
    "topic_name": "Radiculopatía",
    "stem": "De acuerdo con AANEM, un límite razonable de nervios estudiados en radiculopatía es:",
    "findings": [],
    "options": [
      {
        "text": "7 nervios",
        "is_correct": true,
        "feedback": "Correcto. Para polineuropatía el límite sugerido es mayor."
      },
      {
        "text": "2 nervios",
        "is_correct": false,
        "feedback": "Incorrecto. Es insuficiente para un estudio completo."
      },
      {
        "text": "20 nervios",
        "is_correct": false,
        "feedback": "Incorrecto. Excede los límites razonables."
      },
      {
        "text": "No hay límites sugeridos",
        "is_correct": false,
        "feedback": "Incorrecto. AANEM sí propone límites."
      }
    ],
    "difficulty": 2,
    "is_critical": true,
    "pearl": "AANEM recomienda límites razonables de nervios por categoría diagnóstica.",
    "source_reference": "AANEM (2023). Recommended Policy for Electrodiagnostic Medicine.",
    "tags": [
      "Radiculopatía",
      "EMG",
      "intermedio"
    ],
    "status": "PUBLISHED",
    "created_at": "2026-09-12T00:00:00Z",
    "updated_at": "2026-09-12T00:00:00Z"
  },
  {
    "id": "emg-fallback-081",
    "island_name": "EMG",
    "module_id": "nerve-conduction",
    "topic_name": "Polineuropatia",
    "stem": "Según AANEM, el número razonable de nervios estudiados en polineuropatía es:",
    "findings": [],
    "options": [
      {
        "text": "10 nervios",
        "is_correct": true,
        "feedback": "Correcto. Evita la sobreutilización."
      },
      {
        "text": "4 nervios",
        "is_correct": false,
        "feedback": "Incorrecto. Suele ser insuficiente."
      },
      {
        "text": "15 nervios",
        "is_correct": false,
        "feedback": "Incorrecto. Supera el límite sugerido."
      },
      {
        "text": "Sin límite establecido",
        "is_correct": false,
        "feedback": "Incorrecto. Hay límites recomendados."
      }
    ],
    "difficulty": 2,
    "is_critical": true,
    "pearl": "Para polineuropatía, AANEM sugiere hasta 10 nervios.",
    "source_reference": "AANEM (2023). Recommended Policy for Electrodiagnostic Medicine.",
    "tags": [
      "Polineuropatia",
      "EMG",
      "intermedio"
    ],
    "status": "PUBLISHED",
    "created_at": "2026-09-12T00:00:00Z",
    "updated_at": "2026-09-12T00:00:00Z"
  },
  {
    "id": "emg-fallback-082",
    "island_name": "EMG",
    "module_id": "emg-needle",
    "topic_name": "Electromiografía",
    "stem": "Tras una lesión nerviosa, la EMG de aguja es más informativa después de:",
    "findings": [],
    "options": [
      {
        "text": "21 días",
        "is_correct": true,
        "feedback": "Correcto. Es el tiempo típico para aparición de fibrilaciones."
      },
      {
        "text": "24 horas",
        "is_correct": false,
        "feedback": "Incorrecto. Es demasiado temprano para denervación activa."
      },
      {
        "text": "5 días",
        "is_correct": false,
        "feedback": "Incorrecto. Aún puede no haber fibrilaciones."
      },
      {
        "text": "2 horas",
        "is_correct": false,
        "feedback": "Incorrecto. No es útil tan temprano."
      }
    ],
    "difficulty": 2,
    "is_critical": false,
    "pearl": "La EMG es más informativa después de 21 días de lesión.",
    "source_reference": "AANEM (2023). Recommended Policy for Electrodiagnostic Medicine.",
    "tags": [
      "Electromiografía",
      "EMG",
      "intermedio"
    ],
    "status": "PUBLISHED",
    "created_at": "2026-09-12T00:00:00Z",
    "updated_at": "2026-09-12T00:00:00Z"
  },
  {
    "id": "emg-fallback-083",
    "island_name": "EMG",
    "module_id": "nerve-conduction",
    "topic_name": "Neuroconducción pediátrica",
    "stem": "En niños, las velocidades de conducción alcanzan valores de adulto aproximadamente a los:",
    "findings": [],
    "options": [
      {
        "text": "5 años",
        "is_correct": true,
        "feedback": "Correcto. Es una referencia importante en neuroconducción pediátrica."
      },
      {
        "text": "6 meses",
        "is_correct": false,
        "feedback": "Incorrecto. Es demasiado temprano."
      },
      {
        "text": "12 años",
        "is_correct": false,
        "feedback": "Incorrecto. Ocurre antes."
      },
      {
        "text": "18 años",
        "is_correct": false,
        "feedback": "Incorrecto. No requiere llegar a la adultez."
      }
    ],
    "difficulty": 2,
    "is_critical": false,
    "pearl": "Las velocidades de conducción alcanzan valores de adulto a los 5 años.",
    "source_reference": "Chen et al. (2016). Electrodiagnostic reference values.",
    "tags": [
      "Neuroconducción pediátrica",
      "EMG",
      "intermedio"
    ],
    "status": "PUBLISHED",
    "created_at": "2026-09-12T00:00:00Z",
    "updated_at": "2026-09-12T00:00:00Z"
  },
  {
    "id": "emg-fallback-084",
    "island_name": "EMG",
    "module_id": "fundamentals",
    "topic_name": "Principios básicos",
    "stem": "En un estudio de conducción nerviosa, se aplica un estímulo eléctrico submáximo. ¿Qué representa fisiológicamente la aparición de la onda H?",
    "findings": [],
    "options": [
      {
        "text": "La activación antidrómica de las fibras Ia y su descarga sináptica sobre las motoneuronas.",
        "is_correct": true,
        "feedback": "La onda H es el equivalente electrofisiológico del reflejo miotático y depende de la integridad del arco reflejo medular."
      },
      {
        "text": "La contracción muscular directa producida por el estímulo del axón motor.",
        "is_correct": false,
        "feedback": ""
      },
      {
        "text": "La descarga repetitiva de las motoneuronas gamma.",
        "is_correct": false,
        "feedback": ""
      },
      {
        "text": "El tiempo de conducción exclusiva a través de los ganglios basales.",
        "is_correct": false,
        "feedback": ""
      }
    ],
    "difficulty": 3,
    "is_critical": false,
    "pearl": "La onda M es la respuesta directa del nervio motor; la onda H es la respuesta refleja tras pasar por la médula.",
    "source_reference": "Arbat i Plana (2016)",
    "tags": [
      "Principios básicos",
      "EMG",
      "avanzado"
    ],
    "status": "PUBLISHED",
    "created_at": "2026-09-12T00:00:00Z",
    "updated_at": "2026-09-12T00:00:00Z"
  },
  {
    "id": "emg-fallback-085",
    "island_name": "EMG",
    "module_id": "fundamentals",
    "topic_name": "Principios básicos",
    "stem": "¿Cómo se define el periodo de latencia en la fisiología de los reflejos?",
    "findings": [],
    "options": [
      {
        "text": "El tiempo que transcurre desde la aplicación del estímulo hasta el inicio de la respuesta.",
        "is_correct": true,
        "feedback": "La latencia incluye el tiempo de transducción, conducción y procesamiento sináptico."
      },
      {
        "text": "La intensidad mínima necesaria para generar un potencial de acción.",
        "is_correct": false,
        "feedback": ""
      },
      {
        "text": "La duración total de la contracción muscular resultante.",
        "is_correct": false,
        "feedback": ""
      },
      {
        "text": "El tiempo que tarda el neurotransmisor en degradarse en la hendidura.",
        "is_correct": false,
        "feedback": ""
      }
    ],
    "difficulty": 2,
    "is_critical": false,
    "pearl": "La latencia es el tiempo entre el estímulo y la respuesta; a mayor estímulo, menor latencia.",
    "source_reference": "Costa et al. (2020)",
    "tags": [
      "Principios básicos",
      "EMG",
      "intermedio"
    ],
    "status": "PUBLISHED",
    "created_at": "2026-09-12T00:00:00Z",
    "updated_at": "2026-09-12T00:00:00Z"
  }
];

/** Agrupa preguntas por nombre de tema */
export const QUESTIONS_BY_TOPIC: Record<string, ExamQuestion[]> = EMG_QUESTIONS_FALLBACK.reduce(
  (acc, q) => {
    if (!acc[q.topic_name]) acc[q.topic_name] = [];
    acc[q.topic_name].push(q);
    return acc;
  },
  {} as Record<string, ExamQuestion[]>
);

/** Agrupa preguntas por módulo */
export const QUESTIONS_BY_MODULE: Record<string, ExamQuestion[]> = EMG_QUESTIONS_FALLBACK.reduce(
  (acc, q) => {
    if (!acc[q.module_id]) acc[q.module_id] = [];
    acc[q.module_id].push(q);
    return acc;
  },
  {} as Record<string, ExamQuestion[]>
);

/** Lista de todos los temas disponibles con su conteo */
export const AVAILABLE_TOPICS: Array<{ name: string; count: number; module_id: string; critical_count: number }> =
  Object.entries(QUESTIONS_BY_TOPIC).map(([name, qs]) => ({
    name,
    count: qs.length,
    module_id: qs[0].module_id,
    critical_count: qs.filter(q => q.is_critical).length,
  })).sort((a, b) => b.count - a.count);
