import fs from 'node:fs';

const srcPath = 'src/services/localQuizzesFallback.ts';
const src = fs.readFileSync(srcPath, 'utf8');
const start = src.indexOf('export const LOCAL_PUBLISHED_QUIZZES');
if (start < 0) {
  console.log('LOCAL_PUBLISHED_QUIZZES not found; skipping');
  process.exit(0);
}
const eq = src.indexOf('=', start);
const objStart = src.indexOf('{', eq);
let depth = 0;
let end = -1;
for (let i = objStart; i < src.length; i++) {
  const ch = src[i];
  if (ch === '{') depth++;
  else if (ch === '}') {
    depth--;
    if (depth === 0) {
      end = i;
      break;
    }
  }
}
if (end < 0) throw new Error('Could not find object end');
const data = JSON.parse(src.slice(objStart, end + 1));
fs.mkdirSync('supabase/seeds', { recursive: true });
fs.writeFileSync('supabase/seeds/legacy_local_quizzes.json', JSON.stringify(data, null, 2));
const flags = Object.values(data).map((q) => ({
  topic_id: q.topic_id,
  module_id: q.module_id,
  title: q.title,
  pass_score: q.pass_score,
  max_attempts: q.max_attempts,
  version: q.version,
  question_count: q.question_count,
}));
const out = `// Metadatos de evaluaciones locales (SIN respuestas). El banco completo vive en supabase/seeds y se califica en el servidor.
import type { QuizTopicFlag, QuizWithQuestions } from '../types/quiz';

export const LOCAL_QUIZ_FLAGS: QuizTopicFlag[] = ${JSON.stringify(flags, null, 2)};

/** @deprecated No se exportan preguntas ni isCorrect al bundle del alumno. */
export const LOCAL_PUBLISHED_QUIZZES: Record<string, QuizWithQuestions> = {};

export function getLocalQuizForTopic(_topicId: string): QuizWithQuestions | null {
  return null;
}

export function getLocalQuizFlagForTopic(topicId: string): QuizTopicFlag | null {
  return LOCAL_QUIZ_FLAGS.find((f) => f.topic_id === topicId) ?? null;
}

export function getAllLocalQuizFlags(): QuizTopicFlag[] {
  return LOCAL_QUIZ_FLAGS.filter((f) => f.question_count > 0);
}
`;
fs.writeFileSync(srcPath, out);
console.log(`Wrote flags for ${flags.length} quizzes`);
