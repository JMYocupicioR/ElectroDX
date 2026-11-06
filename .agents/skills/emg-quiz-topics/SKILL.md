---
name: emg-quiz-topics
description: Creates, enriches, and audits topic quizzes (evaluaciones de lección) and system exam bank questions (exam_questions). Use when adding cuestionarios, enriquecer quiz, preguntas con imagen/trazo EMG, bibliografía/citas por reactivo, o ampliar el banco de preguntas del sistema y de los temas.
---

# EMG Quiz Topics & Exam Bank — Augmented Authoring Pipeline

This skill governs **augmented question authoring** across both evaluation engines in NeuroSAFE:

1. **Topic Quizzes (`published_quizzes` + `quiz_questions`)** — Formative evaluations at the bottom of leaf lessons (`QuizGate` on `TopicPage`).
2. **System Exam Simulator Bank (`exam_questions`)** — Board-style clinical vignettes (`FULL_SIMULATION`, `CRITICAL_ONLY`, `FAILED_REVIEW`, and assigned final exams in `AdminFinalExamsManager`).

For lesson theory content, use `emg-content-modules`. For interactive Exercise Mode templates, use `emg-exercise-templates`.

---

## Architecture Overview

```
src/
├── types/quiz.ts                       ← QuizQuestionDraft, QuizCitation, QuizOption
├── types/exam.ts                       ← ExamQuestion, ExamQuestionFinding, ExamQuestionOption
├── types/database.ts                   ← RevisionPayload (quiz fields)
├── content/topicReferences.ts          ← Verified bibliographic references per module/topic
├── components/simulator/traceEngine/   ← Calibrated EMG/NCS waveform presets (CLINICAL_PRESETS)
├── utils/
│   ├── quizScoring.ts                  ← Scoring rules + defaultOptionsForType
│   ├── quizDuplicates.ts               ← Stem normalization & duplicate detection
│   ├── topicsMissingQuiz.ts            ← Curriculum-ordered missing quiz queue
│   └── mediaValidation.ts              ← Allowed image/video hosts (course-images, emg-trace-images)
└── components/admin/
    ├── ClinicalQuizValidationPanel.tsx ← Batch human clinical approval queue
    └── quiz/
        ├── AdminQuizCatalog.tsx        ← Coverage & topic quiz catalog
        ├── AdminQuizEditor.tsx         ← Direct/editorial quiz editor
        └── AdminFinalExamsManager.tsx  ← Assigned exams manager

mcp/neurosafe-quiz/
├── server.ts                           ← Stdio MCP server (@modelcontextprotocol JSON-RPC 2.0)
├── cli.ts                              ← Direct CLI runner (npm run quiz:tool -- <tool> '<json>')
├── tools.ts                            ← Core tools: coverage, authoring pack, validation, SVG trace, staging
└── traceSvgRenderer.ts                 ← Generates calibrated oscilloscope SVGs for image_choice
```

---

## Dual-Bank Model: Topic Quiz vs. System Exam Bank

When enriching a topic, generate **both** or the one requested by the user:

| Dimension | 1. Topic Quiz (`quiz_questions`) | 2. System Exam Bank (`exam_questions`) |
|-----------|----------------------------------|----------------------------------------|
| **Purpose** | Lesson comprehension & accreditation (`QuizGate`) | Board simulator (COMEFYR) & cohort final exams |
| **Question types** | `'single' \| 'multiple' \| 'true_false' \| 'image_choice'` | Clinical vignette (`single` best answer by index) |
| **Difficulty** | `'basic' \| 'intermediate' \| 'advanced'` | `1` (Básico) \| `2` (Intermedio) \| `3` (Avanzado) |
| **Options format** | `{ id, text, textEn?, isCorrect }` | `{ text, is_correct, feedback }` (**feedback per option required**) |
| **Structured data** | `imageUrl`, `imageAlt` | `findings: [{ type: 'LAT'\|'AMPL'\|'VCN'\|'EMG', label, value }]`, `pearl`, `is_critical` |
| **Citations** | `📚 Referencia: ...` in `explanation` + `citations[]` in draft | `source_reference` column + `pearl` |
| **Human review gate** | `clinical_validation_status = 'pending_review'` or `content_revisions` | `status = 'DRAFT'` until human approval |

---

## Mandatory Augmented Authoring Pipeline (6 Steps)

Whenever triggered (*"agregar preguntas"*, *"enriquecer quiz"*, *"preguntas con imagen"*, *"ampliar catálogo"*):

### Step 1: Inspect Coverage & Load Topic Authoring Pack
Use the `neurosafe-quiz` MCP tools (or CLI `npm run quiz:tool -- <toolName> '<json>'`):
- `list_quiz_coverage`: Lists topics missing quizzes, quizzes containing generic boilerplate stems (*"En relación con..."*), topics lacking `image_choice`, and high `miss_rate` questions.
- `get_topic_authoring_pack`: Loads the full lesson (`content`, `clinicalPearls`, `keyPoints`), its curated `topicReferences`, current quiz questions, current `exam_questions`, and matching `traceEngine` presets in a single call.

### Step 2: Grounding & Bibliographic Verification (Zero Hallucinated DOIs)
Every question **must** be anchored in the lesson text and verified literature:
1. **Primary source:** Use the references returned by `get_topic_authoring_pack` (from `src/content/topicReferences.ts`).
2. **Secondary source:** Query the **NotebookLM MCP** (`notebook_query`) against the EMG manuals/textbooks notebook (Kimura, Preston & Shapiro, Dumitru, AANEM).
3. **External verification:** If citing a journal article not in `topicReferences.ts`, verify its exact title, year, and DOI/PMID via `pubmed-database` or `literature-search-openalex` skill. **Never invent a DOI or PMID from memory.**
4. **Formatting rule:**
   - In `QuizQuestionDraft.explanation`: Append `\n\n📚 Referencia: Autor(es). Título/Obra (Año). [DOI/URL si existe]`.
   - In `QuizQuestionDraft.citations`: Populate `[{ authors, title, journal, year, doi?, url? }]`.
   - In `ExamQuestion`: Populate `source_reference` (e.g., `"Preston & Shapiro (2021), Cap. 3; Muscle Nerve 2016; doi:10.1002/mus.25203"`).

### Step 3: Author Clinical Questions (No Generic Boilerplate)
- **Never** write generic stems that only swap the topic title (e.g., *"En relación con {Tema}, ¿cuál es la primera acción técnica...?"*).
- **Topic Quiz (3–6 questions):**
  - Mix difficulties (`basic`, `intermediate`, `advanced`).
  - Include at least **1 `image_choice`** when the topic involves waveforms, conduction studies, needle EMG patterns, or anatomic landmarks.
  - Include concrete neurophysiological values from the lesson (`ms`, `mV`, `µV`, `m/s`, `% decremento`).
- **System Exam Bank (1–3 questions for `exam_questions`):**
  - Write a realistic patient vignette in `stem`.
  - Populate `findings` array (`[{ type: 'LAT', label: 'Latencia distal mediano', value: '5.8 ms (VN < 4.0)' }]`).
  - Write specific `feedback` on **every** option explaining why it is right or why that distractor fails.
  - Include `pearl` (Perla COMEFYR) and mark `is_critical: true` for high-yield board concepts.

### Step 4: Generate or Upload Clinical Images (`image_choice`)
- Use `upload_or_render_quiz_image` (`mode: 'svg_trace'`) to render a calibrated oscilloscope SVG from `CLINICAL_PRESETS` or custom `TraceParameters` (`latencyMs`, `amplitude`, `durationMs`, `sweepMsPerDiv`, `gainPerDiv`, `needlePattern`, `conductionBlock`, `temporalDispersion`).
- Always keep `hideDiagnosis: true` on quiz trace SVGs so the image header shows technical settings (`2 ms/div · 2 mV/div`) without giving away the answer.
- Provide a descriptive clinical `imageAlt` (accessibility + fallback context, without stating the correct option letter).
- Allowed storage buckets: `emg-trace-images`, `course-images`, `/quiz-traces/*.svg`, Wikimedia Commons, or Google Drive (`isAllowedImageUrl` in `src/utils/mediaValidation.ts`).

### Step 5: Validate Quality & Check Duplicate Stems
Run `validate_quiz_draft`:
- Verifies `quizTopicId` is a valid leaf topic in `allModules`.
- Checks scoring rules (`single`/`true_false`/`image_choice` = 1 correct; `multiple` ≥ 2 correct).
- Runs `findDuplicateStems` against all existing quizzes, `exam_questions`, and seeds.
- Rejects boilerplate stems and missing `📚 Referencia:` blocks.

### Step 6: Stage Draft for Human Clinical Review (Never Auto-Publish to Students)
Run `submit_quiz_draft`:
1. Writes `.agents/skills/emg-quiz-topics/drafts/{topic-id}.json` (full `RevisionPayload` + `examQuestions` + citations).
2. Writes `.agents/skills/emg-quiz-topics/drafts/{topic-id}.sql` (idempotent SQL staging script that sets `clinical_validation_status = 'pending_review'` on `published_quizzes` and `status = 'DRAFT'` on `exam_questions`).
3. If `target: 'pending_validation_rpc'` is used with Supabase credentials, stages the records in `pending_review` / `DRAFT`.
4. Always provide the human reviewer with the action links:
   - Admin Quiz Editor: `/admin/quizzes?topicId={topicId}&moduleId={moduleId}`
   - Contributor Editor: `/colaborador/cuestionario?moduleId={moduleId}&topicId={topicId}`
   - Clinical Validation Queue: `/admin/revisiones` (`ClinicalQuizValidationPanel`)

---

## Prohibitions (Hard Guardrails)

- **NO direct live publishing:** Never set `clinical_validation_status = 'approved'` or `exam_questions.status = 'PUBLISHED'` automatically from an AI agent without explicit user instruction.
- **NO fabricated citations:** Never invent DOIs, PMIDs, or guideline numbers.
- **NO boilerplate stems:** Never reuse template stems across different topics.
- **NO copyrighted clinical photos** from unknown web domains (`isAllowedImageUrl` enforces approved hosts).

---

## MCP Tools & CLI Quick Reference

All tools are exposed both via the **`neurosafe-quiz` MCP server** (`mcp/neurosafe-quiz/server.ts`) and via CLI (`npm run quiz:tool -- <toolName> '<jsonArgs>'`):

| Tool | Purpose | Example CLI invocation |
|------|---------|------------------------|
| `list_quiz_coverage` | Coverage, missing quizzes, boilerplate detection, duplicate stems | `npm run quiz:tool -- list_quiz_coverage '{"moduleId":"nerve-conduction"}'` |
| `get_topic_authoring_pack` | Lesson content + pearls + `topicReferences` + existing quiz/exam questions + trace presets | `npm run quiz:tool -- get_topic_authoring_pack '{"topicId":"martin-gruber"}'` |
| `validate_quiz_draft` | Structural, scoring, citation, image URL, and duplicate stem check | `npm run quiz:tool -- validate_quiz_draft '{"topicId":"martin-gruber","draftPath":".agents/skills/emg-quiz-topics/drafts/martin-gruber.json"}'` |
| `upload_or_render_quiz_image` | Render calibrated oscilloscope SVG or upload image to `emg-trace-images` | `npm run quiz:tool -- upload_or_render_quiz_image '{"topicId":"martin-gruber","mode":"svg_trace","tracePresetId":"median-cts","variant":"pathologic","alt":"Trazo motor mediano con latencia prolongada"}'` |
| `submit_quiz_draft` | Validate + save `.json` & `.sql` draft + optionally stage in Supabase (`pending_review` / `DRAFT`) | `npm run quiz:tool -- submit_quiz_draft '{"topicId":"martin-gruber","moduleId":"nerve-conduction","draftPath":".agents/skills/emg-quiz-topics/drafts/martin-gruber.json"}'` |

Full payload examples: [quiz-template.md](quiz-template.md).
