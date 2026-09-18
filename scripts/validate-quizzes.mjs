import fs from 'node:fs';

const seedPath = 'supabase/seeds/topic_quizzes_pending_validation.json';
if (!fs.existsSync(seedPath)) {
  console.error('Missing quiz seed:', seedPath);
  process.exit(1);
}

const seed = JSON.parse(fs.readFileSync(seedPath, 'utf8'));
const quizzes = seed.quizzes ?? [];
const ids = new Set();
let errors = 0;

if (quizzes.length < 1) {
  console.error('Quiz seed is empty');
  process.exit(1);
}

for (const quiz of quizzes) {
  if (!quiz.topic_id) {
    console.error('Quiz without topic_id');
    errors += 1;
    continue;
  }
  if (ids.has(quiz.topic_id)) {
    console.error('Duplicate topic_id in seed:', quiz.topic_id);
    errors += 1;
  }
  ids.add(quiz.topic_id);
  const count = quiz.questions?.length ?? 0;
  if (count < 3 || count > 8) {
    console.error(`${quiz.topic_id}: expected 3–8 questions, got ${count}`);
    errors += 1;
  }
  if (quiz.clinical_validation_status !== 'pending_review') {
    console.error(`${quiz.topic_id}: quizzes must remain pending_review until human approval`);
    errors += 1;
  }
  for (const q of quiz.questions ?? []) {
    const correct = (q.options ?? []).filter((o) => o.isCorrect === true || o.is_correct === true).length;
    if (correct < 1) {
      console.error(`${quiz.topic_id}/${q.id}: missing correct option`);
      errors += 1;
    }
    if (q.type === 'multiple' && correct < 2) {
      console.error(`${quiz.topic_id}/${q.id}: multiple-choice needs ≥2 correct options`);
      errors += 1;
    }
  }
}

const clientFallback = fs.readFileSync('src/services/localQuizzesFallback.ts', 'utf8');
if (clientFallback.includes('isCorrect: true') || clientFallback.includes('"isCorrect": true')) {
  console.error('Client quiz fallback still contains answers');
  errors += 1;
}

if (errors) {
  console.error(`Quiz validation failed with ${errors} issue(s)`);
  process.exit(1);
}

console.log(`Quiz seed OK: ${quizzes.length} pending_review questionnaires`);
