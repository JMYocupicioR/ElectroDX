import { sb as supabase } from '../lib/supabase';
import type { ClinicalValidationStatus, QuizValidationItem } from '../types/quiz';

function throwIfError(error: { message: string } | null) {
  if (error) throw new Error(error.message);
}

export async function listQuizzesForValidation(options?: {
  status?: ClinicalValidationStatus | null;
  moduleId?: string | null;
}): Promise<QuizValidationItem[]> {
  const { data, error } = await supabase.rpc('admin_list_quizzes_for_validation', {
    p_status: options?.status ?? null,
    p_module_id: options?.moduleId ?? null,
  });
  throwIfError(error);
  return Array.isArray(data) ? (data as QuizValidationItem[]) : [];
}

export async function setQuizValidationStatus(
  quizIds: string[],
  status: ClinicalValidationStatus,
  notes?: string
): Promise<{ updated: number; status: ClinicalValidationStatus }> {
  const { data, error } = await supabase.rpc('admin_set_quiz_validation_status', {
    p_quiz_ids: quizIds,
    p_status: status,
    p_notes: notes ?? null,
  });
  throwIfError(error);
  return (data ?? { updated: 0, status }) as { updated: number; status: ClinicalValidationStatus };
}

export async function getQuestionStats(moduleId?: string | null): Promise<
  {
    question_id: string;
    quiz_id: string;
    topic_id: string;
    module_id: string;
    quiz_title: string | null;
    stem: string;
    difficulty: string | null;
    attempt_count: number;
    miss_count: number;
    miss_rate: number;
  }[]
> {
  const { data, error } = await supabase.rpc('admin_question_stats', {
    p_module_id: moduleId ?? null,
  });
  throwIfError(error);
  return Array.isArray(data) ? data : [];
}
