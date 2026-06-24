import type {
  QuizAnswerRecord,
  QuizOption,
  QuizQuestion,
  QuizQuestionType,
} from '../types/quiz';

function shuffleArray<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export function shuffleQuestions<T extends { sort_order: number }>(
  questions: T[],
  enabled: boolean
): T[] {
  if (!enabled) return [...questions].sort((a, b) => a.sort_order - b.sort_order);
  return shuffleArray(questions);
}

export function shuffleOptions(options: QuizOption[], enabled: boolean): QuizOption[] {
  if (!enabled) return options;
  return shuffleArray(options);
}

function normalizeSelected(selectedIds: string[]): string[] {
  return [...new Set(selectedIds)].sort();
}

function correctOptionIds(options: QuizOption[]): string[] {
  return options.filter((o) => o.isCorrect).map((o) => o.id).sort();
}

export function isQuestionCorrect(
  question: Pick<QuizQuestion, 'type' | 'options'>,
  selectedIds: string[]
): boolean {
  const selected = normalizeSelected(selectedIds);
  const correct = correctOptionIds(question.options);

  if (question.type === 'multiple') {
    return selected.length > 0 && selected.join('|') === correct.join('|');
  }

  if (question.type === 'true_false' || question.type === 'single' || question.type === 'image_choice') {
    return selected.length === 1 && correct.length === 1 && selected[0] === correct[0];
  }

  return false;
}

export function scoreQuiz(
  questions: QuizQuestion[],
  responses: Record<string, string[]>
): { score: number; passed: boolean; answers: QuizAnswerRecord[] } {
  if (questions.length === 0) {
    return { score: 0, passed: false, answers: [] };
  }

  const answers: QuizAnswerRecord[] = questions.map((q) => {
    const selectedIds = responses[q.id] ?? [];
    return {
      questionId: q.id,
      selectedIds,
      correct: isQuestionCorrect(q, selectedIds),
    };
  });

  const correctCount = answers.filter((a) => a.correct).length;
  const score = Math.round((correctCount / questions.length) * 100);

  return { score, passed: false, answers };
}

export function withPassResult(
  score: number,
  passScore: number,
  answers: QuizAnswerRecord[]
): { score: number; passed: boolean; answers: QuizAnswerRecord[] } {
  return { score, passed: score >= passScore, answers };
}

export function defaultOptionsForType(type: QuizQuestionType): QuizOption[] {
  if (type === 'true_false') {
    return [
      { id: crypto.randomUUID(), text: 'Verdadero', isCorrect: true },
      { id: crypto.randomUUID(), text: 'Falso', isCorrect: false },
    ];
  }
  return [
    { id: crypto.randomUUID(), text: '', isCorrect: true },
    { id: crypto.randomUUID(), text: '', isCorrect: false },
  ];
}

export function publishedQuestionsToDraft(
  questions: QuizQuestion[]
): import('../types/quiz').QuizQuestionDraft[] {
  return questions.map((q) => ({
    id: q.id,
    sortOrder: q.sort_order,
    type: q.type,
    stem: q.stem,
    stemEn: q.stem_en ?? undefined,
    imageUrl: q.image_url ?? undefined,
    imageAlt: q.image_alt ?? undefined,
    options: q.options,
    explanation: q.explanation ?? undefined,
    explanationEn: q.explanation_en ?? undefined,
    difficulty: q.difficulty ?? undefined,
  }));
}
