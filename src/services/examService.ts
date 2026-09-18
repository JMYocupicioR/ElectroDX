/**
 * Servicio de Exámenes para NeuroSAFEMX.
 * Híbrido: prioriza Supabase; si falla, usa datos locales (emgQuestionsFallback).
 */

import { sb, supabase, supabaseAnonKey, supabaseUrl } from '../lib/supabase';
import type {
  ExamQuestion,
  ExamConfig,
  ExamAttemptRecord,
  ExamAttemptState,
  ExamSession,
  ExamAnswerRecord,
  ExamGapAnalysis,
} from '../types/exam';
import {
  EMG_QUESTIONS_FALLBACK,
  QUESTIONS_BY_TOPIC,
} from '../data/emgQuestionsFallback';
import type { ExamOptionOrder } from '../utils/examQuestionOrder';

export {
  applyOptionOrder,
  prepareExamQuestions,
  restoreExamQuestions,
  shuffleArray,
  withRandomOptionOrder,
} from '../utils/examQuestionOrder';
export type { ExamOptionOrder } from '../utils/examQuestionOrder';

/** Antigüedad máxima de un intento para ofrecerlo como reanudable */
export const PENDING_ATTEMPT_MAX_AGE_HOURS = 24;

// ─── Carga de Preguntas ───────────────────────────────────────────────────────

/** Carga todas las preguntas publicadas. Fallback a datos locales si Supabase falla. */
export async function loadExamQuestions(
  config?: Partial<Pick<ExamConfig, 'topicNames' | 'moduleId'>>
): Promise<{ questions: ExamQuestion[]; source: 'supabase' | 'fallback' }> {
  try {
    let query = supabase
      .from('exam_questions')
      .select('*')
      .eq('status', 'PUBLISHED');

    if (config?.moduleId) {
      query = query.eq('module_id', config.moduleId);
    }
    if (config?.topicNames && config.topicNames.length > 0) {
      query = query.in('topic_name', config.topicNames);
    }

    const { data, error } = await query.order('topic_name').order('difficulty');

    if (error) throw error;
    if (!data || data.length === 0) throw new Error('No questions found in Supabase');

    return { questions: data as ExamQuestion[], source: 'supabase' };
  } catch (err) {
    console.warn('[examService] Supabase failed, using fallback data:', err);

    let questions = EMG_QUESTIONS_FALLBACK;
    if (config?.topicNames && config.topicNames.length > 0) {
      questions = questions.filter(q => config.topicNames!.includes(q.topic_name));
    }
    if (config?.moduleId) {
      questions = questions.filter(q => q.module_id === config.moduleId);
    }
    return { questions, source: 'fallback' };
  }
}

/** Carga preguntas solo de los temas fallados por el usuario */
export async function loadFailedQuestions(userId: string): Promise<{ questions: ExamQuestion[]; source: 'supabase' | 'fallback' }> {
  try {
    // Obtener IDs de preguntas con más fallos que aciertos
    const { data: progress, error } = await sb
      .from('user_question_progress')
      .select('question_id, attempts, successes')
      .eq('user_id', userId)
      .gt('attempts', 0);

    if (error) throw error;

    const failedIds = ((progress || []) as Array<{ question_id: string; attempts: number; successes: number }>)
      .filter(p => p.successes < p.attempts)
      .map(p => p.question_id);

    if (failedIds.length === 0) {
      // Sin historial: devolver preguntas críticas
      const { data, error: qErr } = await sb
        .from('exam_questions')
        .select('*')
        .eq('is_critical', true)
        .eq('status', 'PUBLISHED');
      if (qErr) throw qErr;
      return { questions: (data as ExamQuestion[]) || [], source: 'supabase' };
    }

    const { data: failedQs, error: fErr } = await sb
      .from('exam_questions')
      .select('*')
      .in('id', failedIds)
      .eq('status', 'PUBLISHED');

    if (fErr) throw fErr;
    return { questions: (failedQs as ExamQuestion[]) || [], source: 'supabase' };
  } catch {
    // Fallback: preguntas críticas del banco local
    const questions = EMG_QUESTIONS_FALLBACK.filter(q => q.is_critical);
    return { questions, source: 'fallback' };
  }
}

// ─── Gestión de Intentos en Curso ─────────────────────────────────────────────

export interface CreateExamAttemptOptions {
  optionOrder?: ExamOptionOrder;
  expiresAt?: string | null;
  assignmentId?: string | null;
}

/** Marca ABANDONED los intentos en curso del usuario. Retorna cuántos cerró. */
export async function abandonInProgressAttempts(
  userId: string,
  exceptAttemptId?: string | null
): Promise<number> {
  try {
    let query = sb
      .from('exam_attempts')
      .update({ status: 'ABANDONED' })
      .eq('user_id', userId)
      .eq('status', 'IN_PROGRESS');

    if (exceptAttemptId) query = query.neq('id', exceptAttemptId);

    const { data, error } = await query.select('id');
    if (error) throw error;
    return (data ?? []).length;
  } catch (err) {
    console.warn('[examService] abandonInProgressAttempts failed:', err);
    return 0;
  }
}

/**
 * Crea un nuevo intento de examen en Supabase.
 * Cierra primero cualquier intento en curso del usuario: solo puede haber uno
 * vivo a la vez (índice único parcial `uq_exam_attempts_one_in_progress`).
 */
export async function createExamAttempt(
  userId: string,
  config: ExamConfig,
  questionIds: string[],
  options: CreateExamAttemptOptions = {}
): Promise<ExamAttemptRecord | null> {
  try {
    await abandonInProgressAttempts(userId);

    const { data, error } = await sb
      .from('exam_attempts')
      .insert({
        user_id: userId,
        mode: config.mode,
        config,
        question_ids: questionIds,
        current_question_index: 0,
        answers: {},
        flagged: {},
        option_order: options.optionOrder ?? {},
        expires_at: options.expiresAt ?? null,
        assignment_id: options.assignmentId ?? null,
        time_remaining_seconds: config.timeLimitSeconds ?? null,
        status: 'IN_PROGRESS',
      })
      .select()
      .single();

    if (error) throw error;
    return data as ExamAttemptRecord;
  } catch (err) {
    console.error('[examService] createExamAttempt failed:', err);
    return null;
  }
}

function toAttemptUpdate(state: Partial<ExamAttemptState>): Record<string, unknown> {
  const updateData: Record<string, unknown> = {};
  if (state.currentQuestionIndex !== undefined) updateData.current_question_index = state.currentQuestionIndex;
  if (state.answers !== undefined) updateData.answers = state.answers;
  if (state.flagged !== undefined) updateData.flagged = state.flagged;
  if (state.timeRemainingSeconds !== undefined) updateData.time_remaining_seconds = state.timeRemainingSeconds;
  return updateData;
}

/** Guarda el estado actual del examen (auto-guardado) */
export async function saveExamProgress(
  attemptId: string,
  state: Partial<ExamAttemptState>
): Promise<boolean> {
  try {
    const { error } = await sb
      .from('exam_attempts')
      .update(toAttemptUpdate(state))
      .eq('id', attemptId);

    return !error;
  } catch {
    return false;
  }
}

/**
 * Guardado de último instante al cerrar/ocultar la pestaña.
 * Usa `fetch` con `keepalive` porque una petición normal se cancela cuando el
 * documento se descarga; `sendBeacon` no sirve aquí (solo hace POST y no acepta
 * las cabeceras de autorización que exige PostgREST).
 */
export function flushExamProgress(
  attemptId: string,
  state: Partial<ExamAttemptState>,
  accessToken: string | null
): void {
  if (!supabaseUrl || !supabaseAnonKey || !accessToken) return;

  const payload = toAttemptUpdate(state);
  if (Object.keys(payload).length === 0) return;

  try {
    void fetch(`${supabaseUrl}/rest/v1/exam_attempts?id=eq.${encodeURIComponent(attemptId)}`, {
      method: 'PATCH',
      keepalive: true,
      headers: {
        'Content-Type': 'application/json',
        Prefer: 'return=minimal',
        apikey: supabaseAnonKey,
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(payload),
    });
  } catch {
    // Último recurso: si el navegador ya bloqueó la petición no hay nada que hacer.
  }
}

/**
 * Obtiene el intento en curso del usuario, si existe y sigue siendo reciente.
 * Los intentos sin actividad en las últimas horas se consideran abandonados y
 * no se ofrecen para reanudar (además `abandon_stale_exam_attempts` los cierra).
 */
export async function getPendingExamAttempt(
  userId: string,
  maxAgeHours: number = PENDING_ATTEMPT_MAX_AGE_HOURS
): Promise<ExamAttemptRecord | null> {
  try {
    const cutoff = new Date(Date.now() - maxAgeHours * 3_600_000).toISOString();

    const { data, error } = await sb
      .from('exam_attempts')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'IN_PROGRESS')
      .gte('updated_at', cutoff)
      .order('updated_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) throw error;
    return data as ExamAttemptRecord | null;
  } catch {
    return null;
  }
}

/** Carga un intento específico por ID */
export async function loadExamAttempt(attemptId: string): Promise<ExamAttemptRecord | null> {
  try {
    const { data, error } = await sb
      .from('exam_attempts')
      .select('*')
      .eq('id', attemptId)
      .single();

    if (error) throw error;
    return data as ExamAttemptRecord;
  } catch {
    return null;
  }
}

/** Marca el intento como completado o abandonado */
export async function finalizeExamAttempt(
  attemptId: string,
  status: 'COMPLETED' | 'ABANDONED'
): Promise<boolean> {
  const { error } = await sb.from('exam_attempts').update({ status }).eq('id', attemptId);
  if (error) console.warn('[examService] finalizeExamAttempt failed:', error);
  return !error;
}

/**
 * Borra la caché local asociada a un intento.
 * Sin esto quedaban llaves `neurosafe_exam_qs_*` huérfanas que podían devolver
 * un examen viejo al alumno.
 */
export function clearExamAttemptCaches(attemptId?: string | null, assignmentId?: string | null): void {
  const keys = [
    attemptId ? `neurosafe_exam_qs_att_${attemptId}` : null,
    assignmentId ? `neurosafe_exam_qs_asg_${assignmentId}` : null,
    assignmentId ? `neurosafe_asg_answers_${assignmentId}` : null,
  ].filter((k): k is string => Boolean(k));

  keys.forEach(key => {
    try {
      localStorage.removeItem(key);
    } catch {}
  });
}

// ─── Guardar Resultados del Examen ────────────────────────────────────────────

export interface SubmitExamPayload {
  userId: string;
  config: ExamConfig;
  questions: ExamQuestion[];
  answers: Record<string, number>; // questionId → selectedOptionIndex
  durationSeconds: number;
  attemptId?: string | null;
}

/** Guarda la sesión completa y todas las respuestas en Supabase. Retorna el sessionId. */
export async function submitExam(payload: SubmitExamPayload): Promise<string | null> {
  const { userId, config, questions, answers, durationSeconds, attemptId } = payload;

  // Calcular resultados
  let correctCount = 0;
  const answerRecords: Omit<ExamAnswerRecord, 'id' | 'session_id'>[] = [];

  questions.forEach(q => {
    const selectedIdx = answers[q.id];
    const isAnswered = selectedIdx !== undefined;
    const isCorrect = isAnswered
      ? (q.options[selectedIdx]?.is_correct ?? false)
      : false;

    if (isCorrect) correctCount++;

    if (isAnswered) {
      answerRecords.push({
        question_id: q.id,
        topic_name: q.topic_name,
        module_id: q.module_id,
        is_critical: q.is_critical,
        difficulty: q.difficulty,
        selected_option_index: selectedIdx,
        is_correct: isCorrect,
        time_spent_seconds: 0,
      });
    }
  });

  const scorePercentage = questions.length > 0
    ? Math.round((correctCount / questions.length) * 100)
    : 0;

  try {
    // 1. Crear sesión
    const { data: sessionData, error: sessionError } = await sb
      .from('exam_sessions')
      .insert({
        user_id: userId,
        mode: config.mode,
        module_id: config.moduleId ?? null,
        selected_topics: config.topicNames ?? [],
        question_count_config: config.questionCount ?? null,
        feedback_mode: config.feedbackMode,
        time_limit_seconds: config.timeLimitSeconds ?? null,
        total_questions: questions.length,
        correct_answers: correctCount,
        score_percentage: scorePercentage,
        duration_seconds: durationSeconds,
        status: 'COMPLETED',
        completed_at: new Date().toISOString(),
      })
      .select('id')
      .single();

    if (sessionError) throw sessionError;
    const sessionId = sessionData.id;

    // 2. Guardar respuestas
    if (answerRecords.length > 0) {
      const withSession = answerRecords.map(a => ({ ...a, session_id: sessionId }));
      await sb.from('exam_answers').insert(withSession);
    }

    // 3. Marcar intento como completado
    if (attemptId) {
      await finalizeExamAttempt(attemptId, 'COMPLETED');
    }

    return sessionId;
  } catch (err) {
    console.error('[examService] submitExam failed:', err);
    return null;
  }
}

// ─── Carga de Resultados ──────────────────────────────────────────────────────

export interface ExamResultsData {
  session: ExamSession;
  answers: Array<ExamAnswerRecord & { question: ExamQuestion }>;
}

export async function loadExamResults(
  sessionId: string,
  allQuestions: ExamQuestion[]
): Promise<ExamResultsData | null> {
  try {
    const [sessionRes, answersRes] = await Promise.all([
      sb.from('exam_sessions').select('*').eq('id', sessionId).single(),
      sb.from('exam_answers').select('*').eq('session_id', sessionId),
    ]);

    if (sessionRes.error) throw sessionRes.error;

    const session = sessionRes.data as ExamSession;
    const rawAnswers = (answersRes.data ?? []) as ExamAnswerRecord[];

    // Crear mapa de preguntas para lookup rápido
    const questionsMap = new Map(allQuestions.map(q => [q.id, q]));

    // También buscar en fallback
    EMG_QUESTIONS_FALLBACK.forEach(q => {
      if (!questionsMap.has(q.id)) questionsMap.set(q.id, q);
    });

    const answers = rawAnswers.map(a => ({
      ...a,
      question: questionsMap.get(a.question_id) ?? ({
        id: a.question_id,
        stem: 'Pregunta no disponible',
        options: [],
        topic_name: a.topic_name ?? 'Desconocido',
      } as unknown as ExamQuestion),
    }));

    return { session, answers };
  } catch (err) {
    console.error('[examService] loadExamResults failed:', err);
    return null;
  }
}

// ─── Analítica de Brechas ─────────────────────────────────────────────────────

export async function loadGapAnalysis(userId: string): Promise<ExamGapAnalysis[]> {
  try {
    const { data, error } = await sb.rpc('get_exam_gap_analysis', { p_user_id: userId });
    if (error) throw error;
    return (data ?? []) as ExamGapAnalysis[];
  } catch {
    return [];
  }
}

/** Lista los temas disponibles con sus conteos directamente de Supabase */
export async function loadAvailableTopics(): Promise<Array<{
  topic_name: string;
  module_id: string;
  count: number;
  critical_count: number;
}>> {
  try {
    const { data, error } = await supabase
      .from('exam_questions')
      .select('topic_name, module_id, is_critical')
      .eq('status', 'PUBLISHED');

    if (error) throw error;

    const topicMap = new Map<string, { module_id: string; count: number; critical_count: number }>();
    (data ?? []).forEach((q: { topic_name: string; module_id: string; is_critical: boolean }) => {
      const existing = topicMap.get(q.topic_name) ?? { module_id: q.module_id, count: 0, critical_count: 0 };
      existing.count++;
      if (q.is_critical) existing.critical_count++;
      topicMap.set(q.topic_name, existing);
    });

    return Array.from(topicMap.entries())
      .map(([topic_name, stats]) => ({ topic_name, ...stats }))
      .sort((a, b) => b.count - a.count);
  } catch {
    // Fallback desde datos locales
    return Object.entries(QUESTIONS_BY_TOPIC).map(([topic_name, qs]) => ({
      topic_name,
      module_id: qs[0].module_id,
      count: qs.length,
      critical_count: qs.filter(q => q.is_critical).length,
    })).sort((a, b) => b.count - a.count);
  }
}
