/**
 * Servicio de Exámenes para NeuroSAFEMX.
 * Híbrido: prioriza Supabase; si falla, usa datos locales (emgQuestionsFallback).
 */

import { supabase } from '../lib/supabase';
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
    const { data: progress, error } = await supabase
      .from('user_question_progress')
      .select('question_id, attempts, successes')
      .eq('user_id', userId)
      .gt('attempts', 0);

    if (error) throw error;

    const failedIds = (progress || [])
      .filter(p => p.successes < p.attempts)
      .map(p => p.question_id);

    if (failedIds.length === 0) {
      // Sin historial: devolver preguntas críticas
      const { data, error: qErr } = await supabase
        .from('exam_questions')
        .select('*')
        .eq('is_critical', true)
        .eq('status', 'PUBLISHED');
      if (qErr) throw qErr;
      return { questions: (data as ExamQuestion[]) || [], source: 'supabase' };
    }

    const { data: failedQs, error: fErr } = await supabase
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

/** Construye la lista de preguntas según configuración (filtra, mezcla, limita) */
export function buildExamQuestions(
  allQuestions: ExamQuestion[],
  config: ExamConfig
): ExamQuestion[] {
  let pool = [...allQuestions];

  // Filtro por modo
  if (config.criticalOnly) {
    pool = pool.filter(q => q.is_critical);
  }
  if (config.topicNames && config.topicNames.length > 0) {
    pool = pool.filter(q => config.topicNames!.includes(q.topic_name));
  }

  // Mezcla aleatoria (Fisher-Yates)
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }

  // Limitar cantidad
  if (config.questionCount && config.questionCount > 0) {
    pool = pool.slice(0, config.questionCount);
  }

  return pool;
}

// ─── Gestión de Intentos en Curso ─────────────────────────────────────────────

/** Crea un nuevo intento de examen en Supabase */
export async function createExamAttempt(
  userId: string,
  config: ExamConfig,
  questionIds: string[]
): Promise<ExamAttemptRecord | null> {
  try {
    const { data, error } = await supabase
      .from('exam_attempts')
      .insert({
        user_id: userId,
        mode: config.mode,
        config,
        question_ids: questionIds,
        current_question_index: 0,
        answers: {},
        flagged: {},
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

/** Guarda el estado actual del examen (auto-guardado) */
export async function saveExamProgress(
  attemptId: string,
  state: Partial<ExamAttemptState>
): Promise<boolean> {
  try {
    const updateData: Record<string, unknown> = {};
    if (state.currentQuestionIndex !== undefined) updateData.current_question_index = state.currentQuestionIndex;
    if (state.answers !== undefined) updateData.answers = state.answers;
    if (state.flagged !== undefined) updateData.flagged = state.flagged;
    if (state.timeRemainingSeconds !== undefined) updateData.time_remaining_seconds = state.timeRemainingSeconds;

    const { error } = await supabase
      .from('exam_attempts')
      .update(updateData)
      .eq('id', attemptId);

    return !error;
  } catch {
    return false;
  }
}

/** Obtiene el intento en curso del usuario (si existe) */
export async function getPendingExamAttempt(userId: string): Promise<ExamAttemptRecord | null> {
  try {
    const { data, error } = await supabase
      .from('exam_attempts')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'IN_PROGRESS')
      .order('created_at', { ascending: false })
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
    const { data, error } = await supabase
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
): Promise<void> {
  await supabase.from('exam_attempts').update({ status }).eq('id', attemptId);
}

/** Elimina un intento (para empezar uno nuevo) */
export async function deleteExamAttempt(attemptId: string): Promise<void> {
  await supabase.from('exam_attempts').delete().eq('id', attemptId);
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
    const { data: sessionData, error: sessionError } = await supabase
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
      await supabase.from('exam_answers').insert(withSession);
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
      supabase.from('exam_sessions').select('*').eq('id', sessionId).single(),
      supabase.from('exam_answers').select('*').eq('session_id', sessionId),
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
    const { data, error } = await supabase.rpc('get_exam_gap_analysis', { p_user_id: userId });
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
