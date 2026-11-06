# Quiz & Exam Authoring Templates

Copy and adapt. Option `id` values must be unique within each question. Every question must include a verified bibliographic reference (`📚 Referencia:` in `explanation` + `citations[]`).

## Complete Authoring Bundle (`drafts/{topic-id}.json`)

A single draft file in `.agents/skills/emg-quiz-topics/drafts/{topic-id}.json` can hold:
1. The **`RevisionPayload`** fields for the Topic Quiz (`published_quizzes` + `quiz_questions`).
2. An optional **`examQuestions`** array for the System Exam Simulator Bank (`exam_questions` staged with `status: "DRAFT"`).

```json
{
  "moduleId": "nerve-conduction",
  "revisionType": "quiz",
  "title": "Evaluación: Anastomosis de Martin-Gruber",
  "quizTopicId": "martin-gruber",
  "passScore": 70,
  "maxAttempts": null,
  "shuffleQuestions": true,
  "shuffleOptions": true,
  "questions": [
    {
      "id": "mg-q1",
      "sortOrder": 0,
      "type": "single",
      "stem": "Durante un estudio de conducción motora del nervio mediano registrando en APB, usted observa una amplitud distal en muñeca de 3.2 mV y una amplitud proximal en pliegue del codo de 8.5 mV. ¿Cuál es la explicación electrofisiológica más probable?",
      "difficulty": "intermediate",
      "options": [
        {
          "id": "mg-q1-a",
          "text": "Bloqueo de conducción verdadero del nervio mediano en el antebrazo",
          "isCorrect": false
        },
        {
          "id": "mg-q1-b",
          "text": "Anastomosis de Martin-Gruber con fibras cruzadas del mediano hacia el ulnar en antebrazo",
          "isCorrect": true
        },
        {
          "id": "mg-q1-c",
          "text": "Estimulación supramáxima excesiva en la muñeca con coestimulación radial",
          "isCorrect": false
        },
        {
          "id": "mg-q1-d",
          "text": "Degeneración walleriana aguda distal a la muñeca",
          "isCorrect": false
        }
      ],
      "explanation": "Un CMAP del mediano con amplitud mayor al estimular en codo que en muñeca (o un pseudo-bloqueo en el nervio cubital entre muñeca y bajo codo) es el sello clásico de la anastomosis de Martin-Gruber.\n\n📚 Referencia: Preston DC, Shapiro BE. Electromyography and Neuromuscular Disorders (4th ed.), Elsevier, 2021, Cap. 7 (Anomalous Innervations).",
      "citations": [
        {
          "authors": "Preston DC, Shapiro BE",
          "title": "Electromyography and Neuromuscular Disorders: Clinical-Electrophysiologic Correlations (4th ed)",
          "journal": "Elsevier",
          "year": 2021,
          "url": "https://www.elsevier.com/books/electromyography-and-neuromuscular-disorders/preston/978-0-323-66180-5"
        }
      ]
    },
    {
      "id": "mg-q2",
      "sortOrder": 1,
      "type": "image_choice",
      "stem": "Analice el siguiente trazo calibrado (barrido 2 ms/div, sensibilidad 2 mV/div) registrado en el músculo FDI al estimular muñeca (trazo superior) y bajo codo (trazo inferior). Si al estimular el nervio mediano en el codo aparece una respuesta en FDI equivalente a la diferencia de amplitud, ¿qué entidad se confirma?",
      "imageUrl": "/quiz-traces/martin-gruber-fdi.svg",
      "imageAlt": "Trazado comparativo de potencial motor en FDI mostrando caída aparente de amplitud entre muñeca (9.5 mV) y bajo codo (4.2 mV) sin dispersión temporal",
      "difficulty": "advanced",
      "options": [
        {
          "id": "mg-q2-a",
          "text": "Anastomosis de Martin-Gruber tipo II (hacia el primer interóseo dorsal) que simula bloqueo cubital en antebrazo",
          "isCorrect": true
        },
        {
          "id": "mg-q2-b",
          "text": "Neuropatía motora multifocal con bloqueo verdadero en canal de Guyon",
          "isCorrect": false
        },
        {
          "id": "mg-q2-c",
          "text": "Anastomosis de Marinacci (inversa ulnar a mediano)",
          "isCorrect": false
        },
        {
          "id": "mg-q2-d",
          "text": "Artefacto por temperatura cutánea menor a 30 °C",
          "isCorrect": false
        }
      ],
      "explanation": "La anastomosis de Martin-Gruber tipo II (la más frecuente) inerva al FDI; en el estudio rutinario del ulnar simula un bloqueo de conducción entre muñeca y bajo codo porque las fibras anómalas aún viajaban con el nervio mediano a nivel proximal.\n\n📚 Referencia: Kimura J. Electrodiagnosis in Diseases of Nerve and Muscle (4th ed.), Oxford University Press, 2013, Cap. 7.",
      "citations": [
        {
          "authors": "Kimura J",
          "title": "Electrodiagnosis in Diseases of Nerve and Muscle: Principles and Practice",
          "journal": "Oxford University Press",
          "year": 2013,
          "url": "https://global.oup.com/academic/product/electrodiagnosis-in-diseases-of-nerve-and-muscle-9780199738687"
        }
      ]
    },
    {
      "id": "mg-q3",
      "sortOrder": 2,
      "type": "multiple",
      "stem": "En un paciente con síndrome del túnel carpiano coexistente con anastomosis de Martin-Gruber (mediano-a-tenar), ¿qué hallazgos electrofisiológicos característicos se presentan? (Seleccione todas las correctas)",
      "difficulty": "advanced",
      "options": [
        {
          "id": "mg-q3-a",
          "text": "Deflexión positiva inicial (hacia abajo) en el CMAP de APB al estimular el mediano en el codo",
          "isCorrect": true
        },
        {
          "id": "mg-q3-b",
          "text": "Velocidad de conducción motora aparentemente hiperrápida (> 70 m/s) en el segmento antebrazo del mediano",
          "isCorrect": true
        },
        {
          "id": "mg-q3-c",
          "text": "Ausencia obligatoria del potencial sensitivo antidrómico del nervio cubital en quinto dedo",
          "isCorrect": false
        },
        {
          "id": "mg-q3-d",
          "text": "Latencia distal motora del mediano prolongada en muñeca con latencia proximal desproporcionadamente corta en codo",
          "isCorrect": true
        }
      ],
      "explanation": "Cuando coexisten STC y AMG tenar, el estímulo en muñeca se retrasa por el túnel carpiano, pero el estímulo en codo viaja por las fibras cruzadas hacia el nervio cubital (que esquiva el túnel carpiano), generando una deflexión positiva inicial en APB y una velocidad calculada falsamente supranormal.\n\n📚 Referencia: Gutmann L. AAEM Minimonograph #2: Important anomalous innervations of the extremities. Muscle & Nerve, 1993.",
      "citations": [
        {
          "authors": "Gutmann L",
          "title": "AAEM Minimonograph #2: Important anomalous innervations of the extremities",
          "journal": "Muscle & Nerve",
          "year": 1993
        }
      ]
    }
  ],
  "examQuestions": [
    {
      "island_name": "EMG",
      "module_id": "nerve-conduction",
      "topic_name": "Anastomosis de Martin-Gruber",
      "topic_id": "martin-gruber",
      "stem": "Mujer de 48 años con parestesias nocturnas en los tres primeros dedos de la mano derecha. En la conducción motora del nervio mediano (registro en APB) se obtiene latencia distal en muñeca de 5.4 ms (amplitud 4.8 mV) y al estimular en pliegue del codo se registra una latencia de 6.2 ms (con deflexión positiva inicial y amplitud de 7.9 mV) para una distancia de 210 mm.",
      "findings": [
        { "type": "LAT", "label": "Latencia distal Mediano (Muñeca-APB)", "value": "5.4 ms (VN < 4.0 ms)" },
        { "type": "LAT", "label": "Latencia proximal Mediano (Codo-APB)", "value": "6.2 ms (deflexión positiva inicial)" },
        { "type": "VCN", "label": "VCM aparente en antebrazo", "value": "262 m/s (artefactual)" },
        { "type": "AMPL", "label": "Amplitud CMAP Muñeca vs. Codo", "value": "4.8 mV → 7.9 mV" }
      ],
      "options": [
        {
          "text": "Síndrome del túnel carpiano asociado a anastomosis de Martin-Gruber",
          "is_correct": true,
          "feedback": "Las fibras anastomóticas estimuladas en el codo viajan por el nervio cubital (evitando el túnel carpiano enlentecido) y despolarizan la eminencia tenar antes que las fibras del mediano, produciendo deflexión positiva inicial y VCM falsamente elevada."
        },
        {
          "text": "Error de medición de distancia con sobreestimulación del nervio radial",
          "is_correct": false,
          "feedback": "Incluso un error de medición no explica una diferencia de latencia de solo 0.8 ms en 21 cm junto con el incremento de amplitud proximal y la onda positiva inicial."
        },
        {
          "text": "Anastomosis de Riche-Cannieu aislada sin atrapamiento carpiano",
          "is_correct": false,
          "feedback": "Riche-Cannieu es una conexión intrínseca en la palma entre las ramas profunda del ulnar y recurrente del mediano; no explica la diferencia entre muñeca y codo en el antebrazo."
        },
        {
          "text": "Neuropatía motora multifocal con bloqueo de conducción distal",
          "is_correct": false,
          "feedback": "En un bloqueo distal la amplitud en codo sería igual o menor que en muñeca, nunca mayor."
        }
      ],
      "difficulty": 3,
      "is_critical": true,
      "pearl": "Una VCM falsamente > 70 m/s en antebrazo con deflexión positiva inicial en el codo en un paciente con STC es patognomónica de anastomosis de Martin-Gruber coexistente.",
      "source_reference": "Preston DC, Shapiro BE. Electromyography and Neuromuscular Disorders (4th ed.), 2021, Cap. 7.",
      "tags": ["Martin-Gruber", "túnel del carpo", "pitfall", "neuroconducción"],
      "status": "DRAFT"
    }
  ]
}
```
