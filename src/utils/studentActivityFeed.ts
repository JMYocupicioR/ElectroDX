import { allModules } from '../content/modules';
import type { Topic } from '../types/content';
import { canonicalTopicId } from './topicIdAliases';

export type StudentActivityKind = 'reading' | 'quiz' | 'exam' | 'comment' | 'reply';

export type StudentActivityFilter = 'all' | 'reading' | 'quiz' | 'exam' | 'comment';

export interface StudentActivityRow {
  occurred_at: string;
  actor_id: string;
  kind: StudentActivityKind;
  topic_id: string | null;
  module_id: string | null;
  score: number | null;
  passed: boolean | null;
  excerpt: string | null;
  entity_id: string;
  detail: string | null;
}

const EXAM_MODE_LABEL: Record<string, string> = {
  FULL_SIMULATION: 'un simulacro completo',
  TOPIC_SPECIFIC: 'un examen por tema',
  CUSTOM: 'un examen personalizado',
  FAILED_REVIEW: 'un repaso de fallos',
  CRITICAL_ONLY: 'un examen de preguntas críticas',
};

const KIND_LABEL: Record<StudentActivityKind, string> = {
  reading: 'Lectura',
  quiz: 'Evaluación',
  exam: 'Simulacro',
  comment: 'Comentario',
  reply: 'Respuesta',
};

export function studentActivityKindLabel(kind: string): string {
  return KIND_LABEL[kind as StudentActivityKind] ?? 'Actividad';
}

export function formatActivityScore(score: number | null): string {
  if (score == null || !Number.isFinite(score)) return '—';
  const rounded = Math.round(score * 10) / 10;
  return Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(1);
}

function topicPlace(topicId: string | null): { parentTitle: string | null; topicTitle: string | null } {
  if (!topicId) return { parentTitle: null, topicTitle: null };
  const resolved = canonicalTopicId(topicId);

  const walk = (
    topics: Topic[],
    parentTitle: string | null,
  ): { parentTitle: string | null; topicTitle: string } | null => {
    for (const topic of topics) {
      if (topic.id === resolved) return { parentTitle, topicTitle: topic.title };
      if (topic.children?.length) {
        const found = walk(topic.children, topic.title);
        if (found) return found;
      }
    }
    return null;
  };

  for (const mod of allModules) {
    const found = walk(mod.topics, null);
    if (found) return found;
  }
  return { parentTitle: null, topicTitle: null };
}

function moduleTitle(moduleId: string | null): string | null {
  if (!moduleId) return null;
  return allModules.find((mod) => mod.id === moduleId)?.title ?? null;
}

function placeLabel(topicId: string | null): string | null {
  const place = topicPlace(topicId);
  const label = [place.parentTitle, place.topicTitle].filter(Boolean).join(' › ');
  return label || null;
}

function actorLabel(name: string | null | undefined): string {
  const trimmed = name?.trim();
  return trimmed ? trimmed : 'Un alumno';
}

export function describeStudentActivity(
  row: Pick<StudentActivityRow, 'kind' | 'topic_id' | 'module_id' | 'score' | 'excerpt' | 'detail'>,
  actorName: string | null | undefined,
): string {
  const who = actorLabel(actorName);
  const place = placeLabel(row.topic_id) ?? row.topic_id;
  const excerpt = row.excerpt?.trim() || null;

  if (row.kind === 'reading') {
    return place
      ? `${who} completó la lectura de ${place}`
      : `${who} completó la lectura de un tema`;
  }

  if (row.kind === 'quiz') {
    const score = formatActivityScore(row.score);
    return place
      ? `${who} completó la evaluación de ${place} y obtuvo ${score}`
      : `${who} completó una evaluación y obtuvo ${score}`;
  }

  if (row.kind === 'exam') {
    const mode = EXAM_MODE_LABEL[row.detail ?? ''] ?? 'un examen';
    const subject = excerpt || place || moduleTitle(row.module_id);
    const score = formatActivityScore(row.score);
    return subject
      ? `${who} completó ${mode} de ${subject} y obtuvo ${score}`
      : `${who} completó ${mode} y obtuvo ${score}`;
  }

  if (row.kind === 'reply') {
    if (place && excerpt) return `${who} respondió en ${place}: ${excerpt}`;
    if (place) return `${who} respondió en ${place}`;
    if (excerpt) return `${who} respondió: ${excerpt}`;
    return `${who} respondió en un tema`;
  }

  if (place && excerpt) return `${who} comentó en ${place}: ${excerpt}`;
  if (place) return `${who} comentó en ${place}`;
  if (excerpt) return `${who} comentó: ${excerpt}`;
  return `${who} comentó en un tema`;
}

function errorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === 'object' && error && 'message' in error) {
    return String((error as { message?: unknown }).message ?? '');
  }
  return '';
}

export function studentActivityErrorText(error: unknown): string {
  const message = errorMessage(error);
  const code =
    typeof error === 'object' && error && 'code' in error
      ? String((error as { code?: unknown }).code ?? '')
      : '';

  if (/administrador|no autorizado/i.test(message)) {
    return 'Solo un administrador puede ver la actividad de los alumnos.';
  }
  if (
    code === 'PGRST202' ||
    /admin_platform_activity|does not exist|schema cache|could not find the function/i.test(message)
  ) {
    return 'Falta publicar la función de actividad en Supabase. Aplica la migración 20261030120000_admin_platform_activity.';
  }
  return 'No se pudo cargar la actividad.';
}

export function normalizeStudentActivityRow(raw: {
  occurred_at: string;
  actor_id: string;
  kind: string;
  topic_id: string | null;
  module_id: string | null;
  score: number | string | null;
  passed: boolean | null;
  excerpt: string | null;
  entity_id: string;
  detail: string | null;
}): StudentActivityRow | null {
  const kind = raw.kind;
  if (
    kind !== 'reading' &&
    kind !== 'quiz' &&
    kind !== 'exam' &&
    kind !== 'comment' &&
    kind !== 'reply'
  ) {
    return null;
  }

  const score =
    raw.score == null || raw.score === ''
      ? null
      : Number(raw.score);

  return {
    occurred_at: raw.occurred_at,
    actor_id: raw.actor_id,
    kind,
    topic_id: raw.topic_id,
    module_id: raw.module_id,
    score: score != null && Number.isFinite(score) ? score : null,
    passed: raw.passed,
    excerpt: raw.excerpt,
    entity_id: raw.entity_id,
    detail: raw.detail,
  };
}
