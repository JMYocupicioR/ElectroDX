# Quiz RevisionPayload Template

Copy and adapt. Option `id` values must be unique within each question.

## Minimal quiz (3 single-choice questions)

```json
{
  "revisionType": "quiz",
  "title": "Evaluación: Rol del electrodiagnóstico",
  "quizTopicId": "clinical-role",
  "passScore": 70,
  "maxAttempts": null,
  "shuffleQuestions": true,
  "shuffleOptions": true,
  "questions": [
    {
      "id": "q1-uuid",
      "sortOrder": 0,
      "type": "single",
      "stem": "¿Cuál es la función principal del electrodiagnóstico en la práctica clínica?",
      "difficulty": "basic",
      "options": [
        { "id": "opt-a", "text": "Sustituir el examen neurológico", "isCorrect": false },
        { "id": "opt-b", "text": "Proporcionar datos objetivos sobre la función del SNP", "isCorrect": true },
        { "id": "opt-c", "text": "Confirmar siempre el diagnóstico definitivo sin clínica", "isCorrect": false },
        { "id": "opt-d", "text": "Limitarse a estudios de rutina sin hipótesis", "isCorrect": false }
      ],
      "explanation": "El EDx extiende el examen neurológico con datos objetivos y cuantitativos; siempre se interpreta en contexto clínico."
    },
    {
      "id": "q2-uuid",
      "sortOrder": 1,
      "type": "true_false",
      "stem": "Un estudio electrodiagnóstico normal es un resultado válido que puede descartar patologías graves.",
      "difficulty": "basic",
      "options": [
        { "id": "tf-true", "text": "Verdadero", "isCorrect": true },
        { "id": "tf-false", "text": "Falso", "isCorrect": false }
      ],
      "explanation": "Un estudio normal reorienta el diagnóstico y descarta muchas patologías del SNP."
    },
    {
      "id": "q3-uuid",
      "sortOrder": 2,
      "type": "multiple",
      "stem": "Seleccione los componentes principales del electrodiagnóstico (marque todas las correctas):",
      "difficulty": "intermediate",
      "options": [
        { "id": "m-a", "text": "Estudios de conducción nerviosa (NCS)", "isCorrect": true },
        { "id": "m-b", "text": "Electromiografía de aguja (EMG)", "isCorrect": true },
        { "id": "m-c", "text": "Resonancia magnética de cerebro", "isCorrect": false },
        { "id": "m-d", "text": "Pruebas especiales (ENR, SFEMG, PE)", "isCorrect": true }
      ],
      "explanation": "NCS, EMG y pruebas especiales son componentes del EDx. La RM cerebral no es parte del estudio electrodiagnóstico periférico."
    }
  ]
}
```

## Image choice question

```json
{
  "id": "q-img-uuid",
  "sortOrder": 3,
  "type": "image_choice",
  "stem": "¿Qué hallazgo EMG es más compatible con denervación activa aguda?",
  "imageUrl": "https://upload.wikimedia.org/wikipedia/commons/example.png",
  "imageAlt": "Trazado EMG con fibrilaciones",
  "difficulty": "advanced",
  "options": [
    { "id": "img-a", "text": "Fibrilaciones y PSW", "isCorrect": true },
    { "id": "img-b", "text": "MUPs de larga duración y alta amplitud", "isCorrect": false },
    { "id": "img-c", "text": "Actividad insertional normal", "isCorrect": false }
  ],
  "explanation": "Fibrilaciones y potenciales positivos agudos indican denervación activa; MUPs largos sugieren reinervación crónica."
}
```

## Editor deep link

After drafting, open:

```
/colaborador/cuestionario?moduleId=fundamentals&topicId=clinical-role
```

Replace `moduleId` and `topicId` with your targets.

## Draft file location (optional)

Save agent drafts for tracking:

```
.agents/skills/emg-quiz-topics/drafts/{topic-id}.json
```

Add `drafts/` to `.gitignore` if drafts should stay local.
