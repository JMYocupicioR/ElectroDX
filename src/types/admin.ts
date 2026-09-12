import type { EnrollmentStatus } from './database';

export interface AdminProfileRow {
  id: string;
  email: string;
  display_name: string;
  credentials: string | null;
  institution: string | null;
  specialty: string | null;
  bio: string | null;
  avatar_url: string | null;
  is_public: boolean;
  cedula_profesional: string | null;
  residency_year?: string | null;
  comefyr_member_id?: string | null;
  verified_at: string | null;
  enrollment_status: EnrollmentStatus;
  enrollment_verified_at: string | null;
  enrollment_requested_at: string | null;
  created_at: string;
  roles: string[];
  has_premium: boolean;
}

export interface AdminStats {
  pending_users: number;
  verified_users: number;
  pending_enrollments: number;
  enrolled_physicians: number;
  premium_users: number;
  pending_revisions: number;
  published_topics: number;
  published_quizzes: number;
  quiz_attempts_total: number;
  approved_revisions: number;
  upcoming_workshops: number;
  total_workshops: number;
}

export interface AuditLogEntry {
  id: string;
  actor_id: string | null;
  action: string;
  entity_type: string;
  entity_id: string;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface AdminQuizAttemptRow {
  id: string;
  user_email: string;
  display_name: string;
  module_id: string;
  topic_id: string;
  score: number;
  passed: boolean;
  duration_seconds: number | null;
  completed_at: string;
}
