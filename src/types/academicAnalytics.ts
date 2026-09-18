import type { AttendanceStatus, SessionModality } from './academicGradebook';
import type { AssignmentStatus, AssignmentType, StudentAssignment } from './studentPlan';

export interface ExamAttemptAnalyticsRow {
  id: string;
  userId: string;
  studentName: string;
  studentEmail: string;
  moduleId: string;
  moduleLabel: string;
  topicId: string;
  topicTitle: string;
  score: number;
  passed: boolean;
  durationSeconds: number | null;
  completedAt: string;
}

export interface TopicExamSummary {
  topicId: string;
  topicTitle: string;
  moduleId: string;
  moduleLabel: string;
  attempts: number;
  uniqueStudents: number;
  avgScore: number;
  passRate: number;
  bestScore: number;
  worstScore: number;
}

export interface AssignmentAnalyticsRow extends StudentAssignment {
  studentName: string;
  studentEmail: string;
}

export interface AttendanceAnalyticsRow {
  id: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  sessionTitle: string;
  sessionDate: string;
  status: AttendanceStatus;
  modality: SessionModality;
  notes: string | null;
}

export interface DateRangeFilter {
  from: string;
  to: string;
}

export interface ExamAnalyticsFilters extends DateRangeFilter {
  studentId: string;
  moduleId: string;
  topicId: string;
  result: 'all' | 'passed' | 'failed';
  minScore: string;
  search: string;
}

export interface AssignmentAnalyticsFilters extends DateRangeFilter {
  studentId: string;
  type: 'all' | AssignmentType;
  status: 'all' | AssignmentStatus;
  search: string;
}

export interface AttendanceAnalyticsFilters extends DateRangeFilter {
  studentId: string;
  status: 'all' | AttendanceStatus;
  modality: 'all' | SessionModality;
  sessionTitle: string;
  search: string;
}
