export type EnrollmentStatus = 'none' | 'pending' | 'approved' | 'rejected';

export type QuizQuestionType = 'single' | 'multiple' | 'true_false' | 'image_choice';

export type QuizDifficulty = 'basic' | 'intermediate' | 'advanced';

export interface QuizCitation {
  authors: string;
  title: string;
  journal: string;
  year: number | string;
  doi?: string;
  url?: string;
}

export interface QuizOption {
  id: string;
  text: string;
  textEn?: string;
  isCorrect?: boolean;
  feedback?: string;
}

export interface QuizQuestionDraft {
  id?: string;
  sortOrder?: number;
  type: QuizQuestionType;
  stem: string;
  stemEn?: string;
  imageUrl?: string;
  imageAlt?: string;
  options: QuizOption[];
  explanation?: string;
  explanationEn?: string;
  difficulty?: QuizDifficulty;
  citations?: QuizCitation[];
  authorId?: string | null;
}

export type ClinicalValidationStatus = 'pending_review' | 'approved' | 'rejected';

export interface PublishedQuiz {
  id: string;
  topic_id: string;
  module_id: string;
  title: string | null;
  pass_score: number;
  max_attempts: number | null;
  shuffle_questions: boolean;
  shuffle_options: boolean;
  question_count: number;
  version: number;
  published_at: string;
  published_by: string | null;
  last_edited_by: string | null;
  last_reviewed_by?: string | null;
  source_revision_id: string | null;
  clinical_validation_status?: ClinicalValidationStatus;
  validated_by?: string | null;
  validated_at?: string | null;
  validation_notes?: string | null;
}

export interface QuizQuestion {
  id: string;
  quiz_id: string;
  sort_order: number;
  type: QuizQuestionType;
  stem: string;
  stem_en: string | null;
  image_url: string | null;
  image_alt: string | null;
  options: QuizOption[];
  explanation: string | null;
  explanation_en: string | null;
  difficulty: QuizDifficulty | null;
  citations?: QuizCitation[] | null;
  stable_question_key?: string | null;
  author_id?: string | null;
  last_edited_by?: string | null;
  is_system_baseline?: boolean;
}

export interface QuizTopicFlag {
  topic_id: string;
  module_id: string;
  title: string | null;
  pass_score: number;
  max_attempts: number | null;
  version: number;
  question_count: number;
  clinical_validation_status?: ClinicalValidationStatus;
  user_has_passed?: boolean;
  user_attempt_count?: number;
}

export interface QuizValidationItem extends PublishedQuiz {
  attempt_count: number;
  questions: QuizQuestion[];
}

export interface QuizWithQuestions extends PublishedQuiz {
  questions: QuizQuestion[];
}

export interface QuizAnswerRecord {
  questionId: string;
  selectedIds: string[];
  correct: boolean;
  correctIds?: string[];
}

export interface QuizAttempt {
  id: string;
  quiz_id: string;
  quiz_version: number;
  topic_id: string;
  module_id: string;
  user_id: string;
  score: number;
  passed: boolean;
  answers: QuizAnswerRecord[];
  duration_seconds: number | null;
  completed_at: string;
  revealed_questions?: QuizQuestion[];
}

export interface QuizAttemptInput {
  quizId?: string;
  quizVersion?: number;
  topicId: string;
  moduleId?: string;
  score?: number;
  passed?: boolean;
  answers: { questionId: string; selectedIds: string[] }[];
  durationSeconds: number;
}

export interface ModuleQuizProgress {
  moduleId: string;
  moduleTitle: string;
  quizzesAvailable: number;
  quizzesAttempted: number;
  averageScore: number | null;
  bestScores: { topicId: string; topicTitle: string; score: number; passed: boolean }[];
}
