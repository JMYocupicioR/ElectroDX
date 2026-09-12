export type AppRole = 'contributor' | 'editor' | 'admin' | 'student';
export type RevisionStatus =
  | 'draft'
  | 'pending_review'
  | 'approved'
  | 'rejected'
  | 'changes_requested';
export type RevisionAction = 'create' | 'update' | 'delete';
export type EnrollmentStatus = 'none' | 'pending' | 'approved' | 'rejected';
export type AccessTier = 'free' | 'premium';
export type WorkshopStatus = 'draft' | 'scheduled' | 'live' | 'completed' | 'cancelled';

export interface Profile {
  id: string;
  display_name: string;
  credentials: string | null;
  institution: string | null;
  academic_institution?: string | null;
  specialty: string | null;
  residency_year: string | null;
  cedula_profesional: string | null;
  comefyr_member_id: string | null;
  avatar_url: string | null;
  bio: string | null;
  is_public: boolean;
  verified_at: string | null;
  enrollment_status: EnrollmentStatus;
  enrollment_verified_at: string | null;
  enrollment_requested_at: string | null;
  cedula_verified?: boolean | null;
  cedula_data?: Record<string, any> | null;
  created_at: string;
  updated_at: string;
}

export interface UserRole {
  id: string;
  user_id: string;
  role: AppRole;
  granted_by: string | null;
  granted_at: string;
}

export interface TopicMedia {
  videoUrls?: { title: string; driveId: string }[];
  youtubeUrls?: { title: string; videoId: string; startTime?: number }[];
  vimeoUrls?: { title: string; videoId: string }[];
  embedUrls?: { title: string; embedUrl: string }[];
  imageUrls?: { src: string; alt: string; caption?: string }[];
}

import type { QuizQuestionDraft } from './quiz';

export interface RevisionPayload {
  revisionType?: 'topic' | 'module' | 'quiz' | 'clinical_case';
  id?: string;
  slug?: string;
  title: string;
  titleEn?: string;
  description?: string;
  descriptionEn?: string;
  content?: string;
  contentEn?: string;
  /** Module-only fields */
  emoji?: string;
  color?: string;
  icon?: string;
  number?: number;
  sortOrder?: number;
  videoUrls?: { title: string; driveId: string }[];
  youtubeUrls?: { title: string; videoId: string; startTime?: number }[];
  vimeoUrls?: { title: string; videoId: string }[];
  embedUrls?: { title: string; embedUrl: string }[];
  imageUrls?: { src: string; alt: string; caption?: string }[];
  clinicalPearls?: string[];
  clinicalPearlsEn?: string[];
  keyPoints?: string[];
  keyPointsEn?: string[];
  tags?: string[];
  keyTerms?: string[];
  /** Raw video list for editing; normalized to typed arrays on save */
  externalVideos?: { title: string; url: string }[];
  /** Quiz-only fields */
  quizTopicId?: string;
  passScore?: number;
  maxAttempts?: number | null;
  shuffleQuestions?: boolean;
  shuffleOptions?: boolean;
  questions?: QuizQuestionDraft[];
  /** Clinical Case only fields */
  clinicalCaseJson?: any;
  clinicalDiagnosis?: string;
  clinicalQuestions?: string[];
}

export interface ContentRevision {
  id: string;
  target_topic_id: string | null;
  module_id: string;
  parent_id: string | null;
  action: RevisionAction;
  payload: RevisionPayload;
  status: RevisionStatus;
  author_id: string;
  reviewer_id: string | null;
  review_notes: string | null;
  submitted_at: string | null;
  reviewed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface PublishedModule {
  id: string;
  number: number;
  title: string;
  title_en: string | null;
  emoji: string;
  description: string | null;
  description_en: string | null;
  color: string;
  icon: string;
  sort_order: number;
  version: number;
  published_at: string;
  published_by: string | null;
  last_edited_by: string | null;
  source_revision_id: string | null;
}

export interface PublishedTopic {
  id: string;
  module_id: string;
  parent_id: string | null;
  slug: string;
  title: string;
  title_en: string | null;
  description: string | null;
  description_en: string | null;
  content: string | null;
  content_en: string | null;
  media: TopicMedia;
  clinical_pearls: string[];
  clinical_pearls_en: string[];
  key_points: string[];
  key_points_en: string[];
  tags: string[];
  key_terms: string[];
  sort_order: number;
  version: number;
  published_at: string;
  published_by: string | null;
  last_edited_by: string | null;
  source_revision_id: string | null;
  video_url: string | null;
}

export interface Subscription {
  id: string;
  user_id: string;
  tier: AccessTier;
  starts_at: string;
  expires_at: string | null;
  payment_method: string | null;
  payment_reference: string | null;
  notes: string | null;
  granted_by: string | null;
  is_active: boolean;
  created_at: string;
}

export interface ModuleAccess {
  module_id: string;
  required_tier: AccessTier;
  preview_topic_ids: string[];
  updated_at: string;
  updated_by: string | null;
}

export interface LiveWorkshop {
  id: string;
  module_id: string;
  topic_id: string | null;
  title: string;
  description: string | null;
  scheduled_at: string;
  duration_minutes: number;
  stream_url: string | null;
  recording_url: string | null;
  max_capacity: number | null;
  clinical_case_revision_id: string | null;
  clinical_case_json: Record<string, unknown> | null;
  status: WorkshopStatus;
  created_by: string;
  updated_at: string;
  created_at: string;
}

export interface WorkshopRegistration {
  id: string;
  workshop_id: string;
  user_id: string;
  registered_at: string;
  attended: boolean;
}

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Partial<Profile> & { id: string; display_name: string };
        Update: Partial<Profile>;
      };
      user_roles: {
        Row: UserRole;
        Insert: { user_id: string; role: AppRole; granted_by?: string };
        Update: Partial<UserRole>;
      };
      content_revisions: {
        Row: ContentRevision;
        Insert: Omit<ContentRevision, 'id' | 'created_at' | 'updated_at' | 'reviewer_id' | 'review_notes' | 'submitted_at' | 'reviewed_at'> & {
          id?: string;
        };
        Update: Partial<ContentRevision>;
      };
      published_topics: {
        Row: PublishedTopic;
        Insert: Partial<PublishedTopic> & { id: string; module_id: string; slug: string; title: string };
        Update: Partial<PublishedTopic>;
      };
      published_modules: {
        Row: PublishedModule;
        Insert: Partial<PublishedModule> & { id: string; title: string };
        Update: Partial<PublishedModule>;
      };
      audit_log: {
        Row: {
          id: string;
          actor_id: string | null;
          action: string;
          entity_type: string;
          entity_id: string;
          metadata: Record<string, unknown>;
          created_at: string;
        };
      };
      published_quizzes: {
        Row: import('./quiz').PublishedQuiz;
        Insert: Partial<import('./quiz').PublishedQuiz> & { topic_id: string; module_id: string };
        Update: Partial<import('./quiz').PublishedQuiz>;
      };
      quiz_questions: {
        Row: import('./quiz').QuizQuestion;
        Insert: Partial<import('./quiz').QuizQuestion> & { quiz_id: string; stem: string; type: import('./quiz').QuizQuestionType };
        Update: Partial<import('./quiz').QuizQuestion>;
      };
      quiz_attempts: {
        Row: import('./quiz').QuizAttempt;
        Insert: Partial<import('./quiz').QuizAttempt> & {
          quiz_id: string;
          quiz_version: number;
          topic_id: string;
          module_id: string;
          user_id: string;
          score: number;
          passed: boolean;
        };
        Update: Partial<import('./quiz').QuizAttempt>;
      };
      quiz_topic_flags: {
        Row: import('./quiz').QuizTopicFlag;
        Insert: never;
        Update: never;
      };
    };
    Functions: {
      is_admin: { Args: { check_user_id?: string }; Returns: boolean };
      is_editor: { Args: { check_user_id?: string }; Returns: boolean };
      is_student: { Args: { check_user_id?: string }; Returns: boolean };
      has_role: { Args: { required_role: AppRole; check_user_id?: string }; Returns: boolean };
      is_verified_contributor: { Args: { check_user_id?: string }; Returns: boolean };
      grant_user_role: { Args: { target_user_id: string; target_role: AppRole }; Returns: void };
      revoke_user_role: { Args: { target_user_id: string; target_role: AppRole }; Returns: void };
      verify_contributor: { Args: { target_user_id: string }; Returns: void };
      submit_revision: { Args: { revision_id: string }; Returns: void };
      review_revision: {
        Args: { revision_id: string; new_status: RevisionStatus; notes?: string };
        Returns: void;
      };
      is_enrolled_physician: { Args: { check_user_id?: string }; Returns: boolean };
      verify_physician_enrollment: { Args: { target_user_id: string }; Returns: void };
      reject_physician_enrollment: { Args: { target_user_id: string; notes?: string }; Returns: void };
      revoke_physician_enrollment: { Args: { target_user_id: string }; Returns: void };
      admin_list_profiles: {
        Args: { pending_only?: boolean; enrollment_filter?: string | null };
        Returns: import('./admin').AdminProfileRow[];
      };
      admin_get_stats: { Args: Record<string, never>; Returns: import('./admin').AdminStats };
      admin_list_quiz_attempts: {
        Args: { p_limit?: number };
        Returns: import('./admin').AdminQuizAttemptRow[];
      };
      submit_quiz_attempt: {
        Args: {
          p_topic_id: string;
          p_answers: { questionId: string; selectedIds: string[] }[];
          p_duration_seconds?: number | null;
        };
        Returns: import('./quiz').QuizAttempt;
      };
      revoke_contributor: { Args: { target_user_id: string }; Returns: void };
      bootstrap_admin_available: { Args: Record<string, never>; Returns: boolean };
      claim_bootstrap_admin: { Args: Record<string, never>; Returns: { success: boolean; user_id: string } };
      get_my_auth_context: {
        Args: Record<string, never>;
        Returns: {
          profile: Profile | null;
          roles: AppRole[];
          bootstrap_available: boolean;
          has_premium: boolean;
          subscription: Subscription | null;
        } | null;
      };
      has_premium_access: { Args: { check_user_id?: string }; Returns: boolean };
      can_access_module: { Args: { p_module_id: string; check_user_id?: string }; Returns: boolean };
      grant_premium_access: {
        Args: {
          target_user_id: string;
          p_method?: string;
          p_reference?: string | null;
          p_notes?: string | null;
          p_expires_at?: string | null;
        };
        Returns: void;
      };
      revoke_premium_access: { Args: { target_user_id: string }; Returns: void };
    };
  };
}
