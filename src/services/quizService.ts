import { supabase } from '../lib/supabase';
import { allModules } from '../content/modules';
import type {
  ModuleQuizProgress,
  QuizAttempt,
  QuizAttemptInput,
  QuizTopicFlag,
  QuizWithQuestions,
} from '../types/quiz';

function mapQuestion(row: Record<string, unknown>) {
  return {
    ...row,
    options: (row.options as unknown[]) ?? [],
  };
}

export async function getQuizFlagForTopic(topicId: string): Promise<QuizTopicFlag | null> {
  const { data, error } = await supabase
    .from('quiz_topic_flags')
    .select('*')
    .eq('topic_id', topicId)
    .maybeSingle();
  if (error) throw error;
  return (data as QuizTopicFlag | null) ?? null;
}

export async function getAllQuizFlags(): Promise<QuizTopicFlag[]> {
  const { data, error } = await supabase.from('quiz_topic_flags').select('*');
  if (error) throw error;
  return ((data ?? []) as QuizTopicFlag[]).filter((f) => f.question_count > 0);
}

export async function getQuizWithQuestions(topicId: string): Promise<QuizWithQuestions | null> {
  const { data: quiz, error: quizError } = await supabase
    .from('published_quizzes')
    .select('*')
    .eq('topic_id', topicId)
    .maybeSingle();
  if (quizError) throw quizError;
  if (!quiz) return null;

  const { data: questions, error: qError } = await supabase
    .from('quiz_questions')
    .select('*')
    .eq('quiz_id', quiz.id)
    .order('sort_order');
  if (qError) throw qError;

  return {
    ...(quiz as QuizWithQuestions),
    questions: (questions ?? []).map((q) => mapQuestion(q as Record<string, unknown>)) as QuizWithQuestions['questions'],
  };
}

export interface QuizAttemptSubmitInput {
  topicId: string;
  durationSeconds: number;
  answers: { questionId: string; selectedIds: string[] }[];
}

export async function submitQuizAttempt(input: QuizAttemptSubmitInput): Promise<QuizAttempt> {
  const { data, error } = await supabase.rpc('submit_quiz_attempt', {
    p_topic_id: input.topicId,
    p_answers: input.answers,
    p_duration_seconds: input.durationSeconds,
  });
  if (error) throw error;
  return data as QuizAttempt;
}

export async function getMyAttempts(userId: string, limit = 100): Promise<QuizAttempt[]> {
  const { data, error } = await supabase
    .from('quiz_attempts')
    .select('*')
    .eq('user_id', userId)
    .order('completed_at', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data ?? []) as QuizAttempt[];
}

export async function getAttemptCountForQuiz(quizId: string, userId: string): Promise<number> {
  const { count, error } = await supabase
    .from('quiz_attempts')
    .select('*', { count: 'exact', head: true })
    .eq('quiz_id', quizId)
    .eq('user_id', userId);
  if (error) throw error;
  return count ?? 0;
}

export async function getBestAttempt(topicId: string, userId: string): Promise<QuizAttempt | null> {
  const { data, error } = await supabase
    .from('quiz_attempts')
    .select('*')
    .eq('topic_id', topicId)
    .eq('user_id', userId)
    .order('score', { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return (data as QuizAttempt | null) ?? null;
}

export async function getMyProgressByModule(userId: string): Promise<ModuleQuizProgress[]> {
  const [{ data: flags, error: flagsError }, { data: attempts, error: attemptsError }] = await Promise.all([
    supabase.from('quiz_topic_flags').select('*'),
    supabase.from('quiz_attempts').select('*').eq('user_id', userId),
  ]);
  if (flagsError) throw flagsError;
  if (attemptsError) throw attemptsError;

  const quizFlags = (flags ?? []) as QuizTopicFlag[];
  const userAttempts = (attempts ?? []) as QuizAttempt[];

  const bestByTopic = new Map<string, QuizAttempt>();
  for (const attempt of userAttempts) {
    const prev = bestByTopic.get(attempt.topic_id);
    if (!prev || attempt.score > prev.score) bestByTopic.set(attempt.topic_id, attempt);
  }

  const moduleIds = [...new Set(quizFlags.map((f) => f.module_id))];

  return moduleIds.map((moduleId) => {
    const mod = allModules.find((m) => m.id === moduleId);
    const moduleFlags = quizFlags.filter((f) => f.module_id === moduleId);
    const attempted = moduleFlags.filter((f) => bestByTopic.has(f.topic_id));
    const scores = attempted
      .map((f) => bestByTopic.get(f.topic_id)?.score)
      .filter((s): s is number => s != null);
    const averageScore =
      scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : null;

    return {
      moduleId,
      moduleTitle: mod?.title ?? moduleId,
      quizzesAvailable: moduleFlags.length,
      quizzesAttempted: attempted.length,
      averageScore,
      bestScores: attempted.map((f) => {
        const best = bestByTopic.get(f.topic_id)!;
        return {
          topicId: f.topic_id,
          topicTitle: f.title ?? f.topic_id,
          score: best.score,
          passed: best.passed,
        };
      }),
    };
  });
}
