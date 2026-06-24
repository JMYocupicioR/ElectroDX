export type EnrollmentStatus = 'none' | 'pending' | 'approved' | 'rejected';

export type QuizQuestionType = 'single' | 'multiple' | 'true_false' | 'image_choice';

export type QuizDifficulty = 'basic' | 'intermediate' | 'advanced';

export interface QuizOption {
  id: string;
  text: string;
  textEn?: string;
  isCorrect: boolean;
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
}

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
  source_revision_id: string | null;
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
}

export interface QuizTopicFlag {
  topic_id: string;
  module_id: string;
  title: string | null;
  pass_score: number;
  max_attempts: number | null;
  version: number;
  question_count: number;
}

export interface QuizWithQuestions extends PublishedQuiz {
  questions: QuizQuestion[];
}

export interface QuizAnswerRecord {
  questionId: string;
  selectedIds: string[];
  correct: boolean;
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
}

export interface QuizAttemptInput {
  quizId: string;
  quizVersion: number;
  topicId: string;
  moduleId: string;
  score: number;
  passed: boolean;
  answers: QuizAnswerRecord[];
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
