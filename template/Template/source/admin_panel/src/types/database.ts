/**
 * Shared TypeScript interfaces for Supabase database tables.
 * Use these instead of inline `any` types across the codebase.
 */

// ─── Core content tables ────────────────────────────────────────

export interface Island {
    id: string;
    name: string;
    description?: string;
    order: number;
    color?: string;
    icon?: string;
    created_at: string;
}

export interface Topic {
    id: string;
    name: string;
    island_id: string;
    description?: string;
    order?: number;
    question_count?: number;
    created_at: string;
    island?: Island;
}

export interface QuestionOption {
    text: string;
    is_correct: boolean;
    feedback_clinical?: string;
}

export interface QuestionFinding {
    type: string;
    label: string;
    value: string;
}

export interface QuestionContent {
    stem: string;
    findings?: QuestionFinding[];
    image_url?: string;
    options?: QuestionOption[];
}

export interface Question {
    id: string;
    topic_id: string;
    content: QuestionContent;
    difficulty: number;
    type: 'CASE' | 'CONCEPT';
    status: 'DRAFT' | 'PUBLISHED';
    is_critical: boolean;
    pearl?: string;
    source_reference?: string;
    created_at: string;
    topic?: Topic;
}

// ─── User / Auth ────────────────────────────────────────────────

export interface UserProfile {
    id: string;
    user_id: string;
    full_name: string;
    email: string;
    residency_year?: string;
    institution?: string;
    created_at: string;
}

export type UserRole = 'student' | 'admin' | 'superadmin';

export interface UserRoleRecord {
    id: string;
    user_id: string;
    role: UserRole;
    created_at: string;
}

// ─── Exams ──────────────────────────────────────────────────────

export type ExamStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'EXPIRED';

export interface AssignedExam {
    id: string;
    student_id: string;
    title: string;
    description?: string;
    islands: string[];
    topics: string[];
    config?: {
        difficulty_min?: number;
        difficulty_max?: number;
        question_count?: number;
        time_limit_minutes?: number;
    };
    question_count: number;
    time_limit_minutes?: number;
    status: ExamStatus;
    score_percentage: number | null;
    completed_at: string | null;
    created_at: string;
}

export interface ExamSession {
    id: string;
    user_id: string;
    mode: string;
    island_id?: string;
    topics?: string[];
    total_questions: number;
    correct_answers: number;
    score_percentage: number;
    time_spent_seconds?: number;
    feedback_mode?: string;
    created_at: string;
    completed_at?: string;
}

export interface ExamAttempt {
    id: string;
    session_id: string;
    question_id: string;
    selected_option: number;
    is_correct: boolean;
    time_spent_seconds?: number;
}

// ─── Analytics / Mastery ────────────────────────────────────────

export interface MasteryScore {
    id: string;
    user_id: string;
    island_id: string;
    topic_id?: string;
    score: number;
    total_attempts: number;
    correct_attempts: number;
    last_attempt_at: string;
}

export interface UserProgress {
    id: string;
    user_id: string;
    question_id: string;
    is_mastered: boolean;
    consecutive_correct: number;
    last_attempt_at: string;
}

// ─── UI helpers ─────────────────────────────────────────────────

/** Generic loading + error state for data hooks */
export interface DataFetchState<T> {
    data: T;
    loading: boolean;
    error: string | null;
}
