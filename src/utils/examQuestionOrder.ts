/**
 * Orden determinista de preguntas y opciones para el simulador de exámenes.
 *
 * Las respuestas del alumno se guardan como índice de la opción tal como se le
 * mostró (`answers[questionId] = displayIndex`). Por eso la permutación de
 * opciones debe persistirse junto al intento: al reanudar hay que reconstruir
 * exactamente la misma pantalla o los índices apuntarían a otra opción.
 */

import type { ExamConfig, ExamQuestion } from '../types/exam';

/** questionId → [índiceOriginal, ...] en el orden en que se mostraron las opciones */
export type ExamOptionOrder = Record<string, number[]>;

/** Mezcla aleatoria de elementos de un arreglo usando Fisher-Yates */
export function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/** Permutación aleatoria de los índices 0..length-1 */
export function randomOptionOrder(length: number): number[] {
  return shuffleArray(Array.from({ length }, (_, i) => i));
}

/**
 * Aplica una permutación guardada a una pregunta recién traída del banco.
 * Si la permutación es inválida (banco editado, longitud distinta) devuelve la
 * pregunta intacta para no perder opciones.
 */
export function applyOptionOrder(question: ExamQuestion, order?: number[]): ExamQuestion {
  if (!order || order.length !== question.options.length) return question;

  const seen = new Set<number>();
  for (const idx of order) {
    if (!Number.isInteger(idx) || idx < 0 || idx >= question.options.length || seen.has(idx)) {
      return question;
    }
    seen.add(idx);
  }

  return { ...question, options: order.map(i => question.options[i]) };
}

/** Reconstruye el examen completo (orden de preguntas + de opciones) de un intento guardado */
export function restoreExamQuestions(
  questionIds: string[],
  allQuestions: ExamQuestion[],
  optionOrder?: ExamOptionOrder | null
): ExamQuestion[] {
  const byId = new Map(allQuestions.map(q => [q.id, q]));
  return questionIds
    .map(id => {
      const question = byId.get(id);
      return question ? applyOptionOrder(question, optionOrder?.[id]) : null;
    })
    .filter((q): q is ExamQuestion => q !== null);
}

/**
 * Construye la lista de preguntas según configuración y devuelve la permutación
 * de opciones aplicada, para poder persistirla en el intento.
 */
export function prepareExamQuestions(
  allQuestions: ExamQuestion[],
  config: ExamConfig
): { questions: ExamQuestion[]; optionOrder: ExamOptionOrder } {
  let pool = [...allQuestions];

  if (config.criticalOnly) {
    pool = pool.filter(q => q.is_critical);
  }
  if (config.topicNames && config.topicNames.length > 0) {
    pool = pool.filter(q => config.topicNames!.includes(q.topic_name));
  }

  pool = shuffleArray(pool);

  if (config.questionCount && config.questionCount > 0) {
    pool = pool.slice(0, config.questionCount);
  }

  return withRandomOptionOrder(pool);
}

/** Mezcla las opciones de cada pregunta registrando la permutación usada */
export function withRandomOptionOrder(
  questions: ExamQuestion[]
): { questions: ExamQuestion[]; optionOrder: ExamOptionOrder } {
  const optionOrder: ExamOptionOrder = {};

  const prepared = questions.map(question => {
    const order = randomOptionOrder(question.options.length);
    optionOrder[question.id] = order;
    return applyOptionOrder(question, order);
  });

  return { questions: prepared, optionOrder };
}
