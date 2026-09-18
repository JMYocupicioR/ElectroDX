import { supabase } from '../lib/supabase';
import { getAdminQuizAttempts, getAdminProfiles } from './editorialService';
import { getAllStudentAssignments } from './studentPlanService';
import { getCohortAttendance, normalizeSessionModality } from './attendanceService';
import { filterGradeableStudents, getModuleLabel, getTopicLabel } from '../utils/adminUtils';
import type { AdminProfileRow } from '../types/admin';
import type {
  AssignmentAnalyticsRow,
  AttendanceAnalyticsRow,
  ExamAttemptAnalyticsRow,
} from '../types/academicAnalytics';

export async function loadGradeableStudents(currentUserId?: string | null): Promise<AdminProfileRow[]> {
  const data = await getAdminProfiles(false, 'all');
  return filterGradeableStudents(data, currentUserId);
}

export async function getCohortExamAttempts(
  profiles: AdminProfileRow[]
): Promise<ExamAttemptAnalyticsRow[]> {
  const profileById = new Map(profiles.map((profile) => [profile.id, profile]));
  const profileByEmail = new Map(profiles.map((profile) => [profile.email.toLowerCase(), profile]));

  const mapRow = (row: {
    id: string;
    user_id?: string | null;
    user_email?: string | null;
    display_name?: string | null;
    module_id: string;
    topic_id: string;
    score: number;
    passed: boolean;
    duration_seconds: number | null;
    completed_at: string;
  }): ExamAttemptAnalyticsRow => {
    const profile =
      (row.user_id ? profileById.get(row.user_id) : undefined) ||
      (row.user_email ? profileByEmail.get(row.user_email.toLowerCase()) : undefined);
    const moduleId = row.module_id || '';
    const topicId = row.topic_id || '';
    return {
      id: row.id,
      userId: row.user_id || profile?.id || '',
      studentName: profile?.display_name || row.display_name || 'Médico cursista',
      studentEmail: profile?.email || row.user_email || '',
      moduleId,
      moduleLabel: getModuleLabel(moduleId),
      topicId,
      topicTitle: getTopicLabel(moduleId, topicId),
      score: row.score,
      passed: row.passed,
      durationSeconds: row.duration_seconds,
      completedAt: row.completed_at,
    };
  };

  try {
    const { data, error } = await supabase
      .from('quiz_attempts')
      .select('id, user_id, module_id, topic_id, score, passed, duration_seconds, completed_at')
      .order('completed_at', { ascending: false })
      .limit(2000);

    if (!error && data && data.length > 0) {
      return (data as Array<{
        id: string;
        user_id: string;
        module_id: string;
        topic_id: string;
        score: number;
        passed: boolean;
        duration_seconds: number | null;
        completed_at: string;
      }>).map((row) => mapRow(row));
    }
  } catch (e) {
    console.warn('[academicAnalytics] quiz_attempts client query failed:', e);
  }

  const rpcRows = await getAdminQuizAttempts(500);
  return rpcRows.map((row) => mapRow(row));
}

export async function getCohortAssignmentAnalytics(
  profiles: AdminProfileRow[]
): Promise<AssignmentAnalyticsRow[]> {
  const profileById = new Map(profiles.map((profile) => [profile.id, profile]));
  const assignments = await getAllStudentAssignments(profiles);
  return assignments.map((assignment) => {
    const profile = profileById.get(assignment.student_id);
    return {
      ...assignment,
      studentName: profile?.display_name || 'Médico cursista',
      studentEmail: profile?.email || '',
    };
  });
}

export async function getCohortAttendanceAnalytics(
  profiles: AdminProfileRow[]
): Promise<AttendanceAnalyticsRow[]> {
  const profileById = new Map(profiles.map((profile) => [profile.id, profile]));
  const records = await getCohortAttendance(profiles.map((profile) => profile.id));
  return records.map((record) => {
    const profile = profileById.get(record.student_id);
    return {
      id: record.id,
      studentId: record.student_id,
      studentName: profile?.display_name || 'Médico cursista',
      studentEmail: profile?.email || '',
      sessionTitle: record.session_title,
      sessionDate: record.session_date,
      status: record.status,
      modality: normalizeSessionModality(record.session_modality),
      notes: record.notes ?? null,
    };
  });
}
