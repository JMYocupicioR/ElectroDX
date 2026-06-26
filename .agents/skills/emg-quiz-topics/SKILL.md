---
name: emg-quiz-topics
description: Creates or edits topic quizzes (evaluaciones) for enrolled physicians. Use when adding cuestionarios, preguntas de evaluación, quiz questions, or quiz revisions linked to leaf topics in the EMG educational platform.
---

# EMG Quiz Topics — Evaluation Authoring

This skill covers **topic quizzes** shown at the bottom of leaf lessons (`QuizGate` on `TopicPage`). For lesson content (modules/topics), use `emg-content-modules`. For clinical cases, use `emg-exercise-templates`.

## Architecture Overview

```
src/
├── types/quiz.ts                       ← QuizQuestionDraft, QuizOption, types
├── types/database.ts                   ← RevisionPayload (quiz fields)
├── services/
│   ├── quizService.ts                ← flags, load quiz, submit attempts (client)
│   └── editorialService.ts           ← saveRevision, getPublishedQuizForTopic
├── utils/quizScoring.ts              ← scoring rules + defaultOptionsForType
├── utils/quizScoring.test.ts         ← unit tests for scoring
└── components/quiz/
    ├── QuizEditorPage.tsx            ← /colaborador/cuestionario
    ├── QuizGate.tsx                  ← enrollment gate on TopicPage
    ├── QuizPlayer.tsx                ← interactive quiz UI
    └── QuizResults.tsx               ← score + explanations

supabase/
├── published_quizzes                 ← one row per topic_id (metadata)
├── quiz_questions                    ← questions for each quiz
├── quiz_topic_flags                  ← VIEW: quizzes with question_count > 0
├── quiz_attempts                     ← physician attempt history
└── review_revision()                 ← publishes approved quiz revisions
```

**Visibility:** `quiz_topic_flags` only lists topics where `question_count > 0`. Until a quiz is approved with questions, no evaluation badge appears.

**Access:** Questions and attempts require `is_enrolled_physician()` (approved enrollment or verified contributor). Metadata flags are public.

## Prerequisites

Before creating a quiz:

1. **Leaf topic exists** in static modules (`src/content/modules/`) with stable `topic.id`.
2. Topic has `content` or `description` (QuizEditorPage filters leaf topics this way).
3. Know `moduleId` and `topicId` (grep `id: 'topic-id'` in module files).

Cross-reference pending work in [../emg-content-modules/BACKLOG.md](../emg-content-modules/BACKLOG.md).

## Decision Tree

```
What do you need?

A) Draft quiz for editorial submission     → prepare RevisionPayload JSON (see template)
B) User submits via app UI                 → guide to /colaborador/cuestionario?moduleId=&topicId=
C) Edit existing published quiz            → action 'update' in editor or new revision
D) Fix scoring logic                       → quizScoring.ts (not quiz content)
```

Agents typically **draft questions** as JSON matching `RevisionPayload`, then the user pastes into the editor or submits via the app.

## RevisionPayload (quiz)

```typescript
{
  revisionType: 'quiz',
  title: 'Evaluación: Título del tema',
  quizTopicId: 'leaf-topic-id',      // must match Topic.id
  passScore: 70,                     // 0–100, default 70
  maxAttempts: null,                 // null = unlimited
  shuffleQuestions: true,
  shuffleOptions: true,
  questions: [ /* QuizQuestionDraft[] */ ],
}
```

Full question examples: [quiz-template.md](quiz-template.md).

## Question Types

| `type` | Label | Correct answers | Options |
|--------|-------|-----------------|---------|
| `single` | Opción única | Exactly 1 `isCorrect: true` | 2+ custom options |
| `multiple` | Opción múltiple | All correct must be selected, none incorrect | 2+ options |
| `true_false` | V/F | Exactly 1 correct | Auto: Verdadero / Falso |
| `image_choice` | Imagen clínica | Like `single` | + `imageUrl`, `imageAlt` |

## Scoring Rules (`quizScoring.ts`)

- Score = `round(correctCount / totalQuestions * 100)`.
- **Passed** when `score >= passScore`.
- **Single / true_false / image_choice:** exactly one selected id must match the one correct option.
- **Multiple:** selected set must equal correct set exactly (no partial credit).
- Empty selection on multiple → incorrect.

Run tests after scoring changes: `npm run test -- src/utils/quizScoring.test.ts`.

## Option IDs

Each `QuizOption` needs a unique `id` (use `crypto.randomUUID()` in editor). IDs are stored in attempt `answers` — do not change option ids on published quizzes without a new revision.

```typescript
{ id: 'unique-id', text: 'Opción A', textEn?: '...', isCorrect: true }
```

## Editorial Workflow (production path)

1. **Contributor** (verified): open `/colaborador/cuestionario?moduleId={id}&topicId={id}` or click "Proponer cuestionario" on a leaf topic.
2. Configure pass score, attempts, shuffle; add questions with stems and explanations.
3. **Guardar borrador** → `content_revisions` draft.
4. **Enviar a revisión** → status `pending_review`.
5. **Editor/Admin**: `/admin/revisiones` → review diff (`QuizRevisionDiff`) → approve.
6. `review_revision()` upserts `published_quizzes`, replaces `quiz_questions`, updates `question_count`.
7. Leaf topic page shows `QuizGate` for enrolled physicians.

## Agent Workflow: Draft a Quiz

1. Read the leaf topic content in `src/content/modules/` to align questions with lesson.
2. Choose 3–8 questions mixing difficulties (`basic`, `intermediate`, `advanced`).
3. Write `stem` + `explanation` (shown after completion in `QuizResults`).
4. Build `RevisionPayload` per [quiz-template.md](quiz-template.md).
5. Optionally save draft as `.agents/skills/emg-quiz-topics/drafts/{topic-id}.json` for tracking.
6. Tell user to open editor URL with pre-filled module/topic or copy questions manually.
7. After approval, verify flag: topic shows evaluation on `/modulo/{moduleId}/.../{topicId}`.

## Question Quality Guidelines

- Stem: one clear clinical question; avoid double negatives.
- Distractors: plausible, based on common pitfalls from the lesson.
- Explanation: cite the key rule (1–3 sentences); reference values when relevant.
- **Image_choice:** use allowed image hosts (same as content — Drive, Wikimedia, etc.).
- Avoid "all of the above" unless pedagogically necessary.
- For `multiple`, mark every correct option; scoring requires full match.

## Database Tables (reference)

| Table | Key | Notes |
|-------|-----|-------|
| `published_quizzes` | `topic_id` UNIQUE | Links to static topic id |
| `quiz_questions` | `quiz_id` | `options` JSONB array |
| `quiz_attempts` | user + topic | via RPC `submit_quiz_attempt` |
| `quiz_topic_flags` | view | `question_count > 0` only |

Do not insert directly into production without migration/RPC unless explicitly requested — use editorial flow.

## Verification Checklist

- [ ] `quizTopicId` matches existing leaf `topic.id`
- [ ] `moduleId` correct for revision save
- [ ] Each question has non-empty `stem`
- [ ] Correct answer pattern valid per `type` (see scoring rules)
- [ ] `multiple` questions: all correct options marked
- [ ] `image_choice` has `imageUrl` + `imageAlt`
- [ ] Explanations provided for learning feedback
- [ ] Revision submitted and approved (or user informed to approve)
- [ ] `quiz_topic_flags` shows `question_count > 0` for topic
- [ ] Enrolled test user can complete quiz on TopicPage

## Related Skills

- Content tree: [emg-content-modules](../emg-content-modules/SKILL.md)
- Pending topics/quizzes backlog: [BACKLOG.md](../emg-content-modules/BACKLOG.md)
