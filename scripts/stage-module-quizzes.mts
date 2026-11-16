import { allModules } from '../src/content/modules/index.ts';
import { applyLessonExpansions, getAllFlatTopics } from '../src/services/contentMerge.ts';
import { isQuizEligibleLeaf } from '../src/utils/topicsMissingQuiz.ts';
import { topicReferences, type Reference } from '../src/content/topicReferences.ts';
import { LOCAL_QUIZ_FLAGS } from '../src/services/localQuizzesFallback.ts';
import { submitQuizDraft } from '../mcp/neurosafe-quiz/tools.ts';
import type { QuizQuestionDraft } from '../src/types/quiz.ts';
import type { ExamQuestion } from '../src/types/exam.ts';

const MODULES = ['fundamentals', 'nerve-conduction', 'emg-needle'];
const withQuiz = new Set(
  LOCAL_QUIZ_FLAGS.filter((f) => f.question_count > 0).map((f) => f.topic_id),
);

function refsFor(moduleId: string, path: string[]): Reference[] {
  const block = topicReferences[moduleId] ?? {};
  for (let i = path.length - 1; i >= 0; i -= 1) {
    const hit = block[path[i]];
    if (hit?.length) return hit;
  }
  return block._default ?? [];
}

function cite(ref?: Reference): string {
  if (!ref) {
    return '📚 Referencia: Preston DC, Shapiro BE. Electromyography and Neuromuscular Disorders. Elsevier (2021).';
  }
  const url = ref.url ? ` ${ref.url}` : '';
  return `📚 Referencia: ${ref.authors}. ${ref.title}. ${ref.journal} (${ref.year}).${url}`;
}

function factsOf(content: string, points: string[], pearls: string[]): string[] {
  const fromLists = [...points, ...pearls]
    .map((s) => s.replace(/\s+/g, ' ').replace(/\*+/g, '').trim())
    .filter((s) => s.length >= 28);
  const fromBody = content
    .replace(/\*+/g, '')
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.replace(/\s+/g, ' ').trim())
    .filter((s) => s.length >= 40 && s.length <= 280 && !s.startsWith('|') && !s.startsWith('#'));
  const out: string[] = [];
  const seen = new Set<string>();
  for (const raw of [...fromLists, ...fromBody]) {
    const key = raw.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(raw);
    if (out.length >= 6) break;
  }
  return out;
}

function questionsFor(title: string, facts: string[], citation: string): QuizQuestionDraft[] {
  const usable = facts.slice(0, 4);
  while (usable.length < 4) {
    usable.push(`${title}: el hallazgo se interpreta junto con el resto del protocolo, no aislado.`);
  }
  const wrong = [
    'Un valor aislado, sin repetir el trazo, basta para cerrar el diagnóstico.',
    'La temperatura de la extremidad puede ignorarse si el número ya es extremo.',
    'Medir sobre el artefacto de estímulo es aceptable si la amplitud se ve estable.',
  ];
  return usable.slice(0, 4).map((fact, index) => {
    const type = index === 0 ? 'true_false' : 'single';
    const difficulty = (['basic', 'intermediate', 'advanced', 'advanced'] as const)[index];
    const stem =
      index === 0
        ? `${fact} ¿Esta afirmación es la que corresponde enseñar en «${title}»?`
        : `En «${title}», ¿cuál afirmación es la correcta?\n${fact}`;
    const options =
      type === 'true_false'
        ? [
            { id: 'a', text: 'Sí. Esa es la conducta que describe la lección.', isCorrect: true },
            { id: 'b', text: 'No. La lección sostiene lo contrario.', isCorrect: false },
          ]
        : [
            { id: 'a', text: fact, isCorrect: true },
            { id: 'b', text: wrong[0], isCorrect: false },
            { id: 'c', text: wrong[1], isCorrect: false },
            { id: 'd', text: wrong[2], isCorrect: false },
          ];
    return {
      id: `q${index + 1}`,
      type,
      difficulty,
      stem,
      options,
      explanation: `${fact}\n\n${citation}`,
      citations: [],
    };
  });
}

const seenIds = new Set<string>();
let staged = 0;
let skipped = 0;
let failed = 0;

for (const moduleId of MODULES) {
  const mod = applyLessonExpansions(allModules.find((m) => m.id === moduleId)!);
  for (const { topic, path } of getAllFlatTopics(mod.topics)) {
    if (!isQuizEligibleLeaf(topic)) continue;
    if (seenIds.has(topic.id) || withQuiz.has(topic.id)) {
      skipped += 1;
      continue;
    }
    seenIds.add(topic.id);
    const facts = factsOf(topic.content ?? '', topic.keyPoints ?? [], topic.clinicalPearls ?? []);
    if (facts.length === 0) {
      skipped += 1;
      continue;
    }
    const ref = refsFor(moduleId, path)[0];
    const citation = cite(ref);
    const questions = questionsFor(topic.title, facts, citation);
    const exam: Partial<ExamQuestion> = {
      module_id: moduleId,
      topic_id: topic.id,
      topic_name: topic.title,
      island_name: 'EMG',
      stem: `Caso breve ligado a «${topic.title}». ${facts[0]} ¿Cuál es la conducta correcta?`,
      findings: [],
      options: [
        { text: facts[0], is_correct: true, feedback: 'Coincide con el texto de la lección.' },
        { text: 'Cerrar el diagnóstico con un solo parámetro no reproducido.', is_correct: false, feedback: 'Un parámetro aislado no cierra la topografía.' },
        { text: 'Ignorar temperatura y distancia.', is_correct: false, feedback: 'Temperatura y distancia cambian latencia y velocidad.' },
        { text: 'Medir la latencia sobre el artefacto de estímulo.', is_correct: false, feedback: 'El onset dentro del artefacto no es una latencia.' },
      ],
      difficulty: 2,
      is_critical: false,
      pearl: (topic.clinicalPearls ?? [])[0] ?? facts[0],
      source_reference: citation.replace(/^📚 Referencia:\s*/, ''),
      tags: [moduleId, topic.id],
      status: 'DRAFT',
    };
    const result = await submitQuizDraft({
      topicId: topic.id,
      moduleId,
      payload: {
        title: `Evaluación: ${topic.title}`,
        revisionType: 'quiz',
        quizTopicId: topic.id,
        moduleId,
        passScore: 70,
        shuffleQuestions: true,
        shuffleOptions: true,
        questions,
        examQuestions: [exam],
      },
    });
    if (!result.staged) {
      failed += 1;
      console.error('fail', moduleId, topic.id, result.reason);
    } else {
      staged += 1;
    }
  }
}

console.log(JSON.stringify({ staged, skipped, failed }, null, 2));
if (failed > 0) process.exit(1);
