import { supabase } from '../lib/supabase';

export interface ExamConfig {
    topicIds?: string[];
    questionCount?: number | null;
    timeLimit?: number | null; // in seconds
    feedbackMode?: 'immediate' | 'end';
    assignedId?: string; // Add support for custom assigned exams
}

export interface ExamState {
    currentQuestionIndex: number;
    answers: Record<string, number>; // questionId -> optionIndex
    flagged: Record<string, boolean>;
    timeRemainingSeconds: number | null;
}

export interface ExamAttempt {
    id: string;
    user_id: string;
    mode: 'FULL_SIMULATION' | 'ISLAND_SPECIFIC' | 'CUSTOM';
    island_id: string | null;
    config: ExamConfig;
    question_ids: string[];
    current_question_index: number;
    answers: Record<string, number>;
    flagged: Record<string, boolean>;
    time_remaining_seconds: number | null;
    created_at: string;
    updated_at: string;
    status: 'IN_PROGRESS' | 'COMPLETED' | 'ABANDONED';
}

export const useExamAttempt = () => {
    /**
     * Check if user has a pending exam attempt
     */
    const checkPendingAttempt = async (userId: string): Promise<ExamAttempt | null> => {
        const { data, error } = await supabase
            .from('exam_attempts')
            .select('*')
            .eq('user_id', userId)
            .eq('status', 'IN_PROGRESS')
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();

        if (error) {
            console.error('Error checking pending attempt:', error);
            return null;
        }

        return data as ExamAttempt | null;
    };

    /**
     * Create a new exam attempt
     */
    const createAttempt = async (
        userId: string,
        mode: 'FULL_SIMULATION' | 'ISLAND_SPECIFIC' | 'CUSTOM',
        questionIds: string[],
        config: ExamConfig = {},
        islandId: string | null = null
    ): Promise<ExamAttempt | null> => {
        const { data, error } = await supabase
            .from('exam_attempts')
            .insert({
                user_id: userId,
                mode,
                island_id: islandId,
                config,
                question_ids: questionIds,
                current_question_index: 0,
                answers: {},
                flagged: {},
                time_remaining_seconds: config.timeLimit || null,
                status: 'IN_PROGRESS'
            })
            .select()
            .single();

        if (error) {
            console.error('Error creating attempt:', error);
            return null;
        }

        return data as ExamAttempt;
    };

    /**
     * Save current exam progress
     */
    const saveProgress = async (
        attemptId: string,
        state: Partial<ExamState>
    ): Promise<boolean> => {
        const updateData: any = {};

        if (state.currentQuestionIndex !== undefined) {
            updateData.current_question_index = state.currentQuestionIndex;
        }
        if (state.answers !== undefined) {
            updateData.answers = state.answers;
        }
        if (state.flagged !== undefined) {
            updateData.flagged = state.flagged;
        }
        if (state.timeRemainingSeconds !== undefined) {
            updateData.time_remaining_seconds = state.timeRemainingSeconds;
        }

        const { error } = await supabase
            .from('exam_attempts')
            .update(updateData)
            .eq('id', attemptId);

        if (error) {
            console.error('Error saving progress:', error);
            return false;
        }

        return true;
    };

    /**
     * Load exam attempt by ID
     */
    const loadAttempt = async (attemptId: string): Promise<ExamAttempt | null> => {
        const { data, error } = await supabase
            .from('exam_attempts')
            .select('*')
            .eq('id', attemptId)
            .single();

        if (error) {
            console.error('Error loading attempt:', error);
            return null;
        }

        return data as ExamAttempt;
    };

    /**
     * Mark attempt as completed
     */
    const completeAttempt = async (attemptId: string): Promise<boolean> => {
        const { error } = await supabase
            .from('exam_attempts')
            .update({ status: 'COMPLETED' })
            .eq('id', attemptId);

        if (error) {
            console.error('Error completing attempt:', error);
            return false;
        }

        return true;
    };

    /**
     * Mark attempt as abandoned (or delete)
     */
    const abandonAttempt = async (attemptId: string): Promise<boolean> => {
        const { error } = await supabase
            .from('exam_attempts')
            .update({ status: 'ABANDONED' })
            .eq('id', attemptId);

        if (error) {
            console.error('Error abandoning attempt:', error);
            return false;
        }

        return true;
    };

    /**
     * Delete a pending attempt (when user chooses to start new)
     */
    const deletePendingAttempt = async (attemptId: string): Promise<boolean> => {
        const { error } = await supabase
            .from('exam_attempts')
            .delete()
            .eq('id', attemptId);

        if (error) {
            console.error('Error deleting attempt:', error);
            return false;
        }

        return true;
    };

    return {
        checkPendingAttempt,
        createAttempt,
        saveProgress,
        loadAttempt,
        completeAttempt,
        abandonAttempt,
        deletePendingAttempt
    };
};
