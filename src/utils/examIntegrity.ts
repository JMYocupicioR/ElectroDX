/**
 * Integridad académica del simulador: las claves no deben vivir en el cliente
 * mientras el alumno contesta. El servidor las revela al calificar.
 */

import type { ExamAnswerReveal, ExamQuestion, ExamQuestionOption } from '../types/exam';

export type { ExamAnswerReveal };

export function stripExamOptionKeys(option: ExamQuestionOption): ExamQuestionOption {
  return {
    text: option.text,
    is_correct: false,
    feedback: '',
  };
}

/** Quita is_correct, feedback y perla. Idempotente. */
export function stripExamAnswerKeys(question: ExamQuestion): ExamQuestion {
  return {
    ...question,
    pearl: undefined,
    source_reference: undefined,
    options: (question.options ?? []).map(stripExamOptionKeys),
  };
}

export function questionsHaveAnswerKeys(questions: ExamQuestion[]): boolean {
  return questions.some(q =>
    (q.options ?? []).some(o => o.is_correct) || Boolean(q.pearl)
  );
}

export function parseExamAnswerReveal(raw: unknown): ExamAnswerReveal | null {
  if (!raw || typeof raw !== 'object') return null;
  const rec = raw as Record<string, unknown>;
  const questionId = String(rec.questionId ?? rec.question_id ?? '');
  if (!questionId) return null;
  const correctIndexRaw = rec.correctIndex ?? rec.correct_index;
  return {
    questionId,
    isCorrect: Boolean(rec.isCorrect ?? rec.is_correct),
    selectedIndex: Number(rec.selectedIndex ?? rec.selected_index ?? 0),
    correctIndex: correctIndexRaw === null || correctIndexRaw === undefined
      ? null
      : Number(correctIndexRaw),
    selectedFeedback: String(rec.selectedFeedback ?? rec.selected_feedback ?? ''),
    correctFeedback: String(rec.correctFeedback ?? rec.correct_feedback ?? ''),
    pearl: typeof rec.pearl === 'string' ? rec.pearl : null,
  };
}

export function parseExamAnswerRevealMap(raw: unknown): Record<string, ExamAnswerReveal> {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return {};
  const out: Record<string, ExamAnswerReveal> = {};
  for (const [key, value] of Object.entries(raw as Record<string, unknown>)) {
    const parsed = parseExamAnswerReveal(value) ?? parseExamAnswerReveal({
      ...(typeof value === 'object' && value ? value : {}),
      questionId: key,
    });
    if (parsed) out[parsed.questionId] = parsed;
  }
  return out;
}

/** Aplica la revelación del servidor a la pregunta para la pantalla de resultados. */
export function applyExamReveal(question: ExamQuestion, reveal: ExamAnswerReveal | undefined): ExamQuestion {
  if (!reveal || reveal.correctIndex === null || reveal.correctIndex < 0) return question;
  const options = question.options.map((opt, i) => ({
    ...opt,
    is_correct: i === reveal.correctIndex,
    feedback:
      i === reveal.correctIndex
        ? reveal.correctFeedback || opt.feedback
        : i === reveal.selectedIndex
          ? reveal.selectedFeedback || opt.feedback
          : opt.feedback,
  }));
  return {
    ...question,
    options,
    pearl: reveal.pearl ?? question.pearl,
  };
}

export function rpcLooksUnavailable(error: { message?: string; code?: string } | null | undefined): boolean {
  const code = error?.code || '';
  const message = (error?.message || '').toLowerCase();
  return (
    code === 'PGRST202' ||
    code === '42883' ||
    message.includes('could not find the function') ||
    message.includes('does not exist')
  );
}
