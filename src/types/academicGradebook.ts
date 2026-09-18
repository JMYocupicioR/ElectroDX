export type RubricKey = 'exams' | 'assignments' | 'attendance' | 'curriculum';

export interface RubricItemConfig {
  id: RubricKey;
  name: string;
  weight: number; // Porcentaje (0 - 100)
  description: string;
  enabled: boolean;
}

export interface GradebookRubricConfig {
  id: string;
  title: string;
  minPassingGrade: number; // e.g. 80 para acreditar ante COMEFYR
  rubrics: RubricItemConfig[];
  updated_at: string;
  updated_by?: string | null;
}

export interface AcademicMilestone {
  id: string;
  cohort_id: string;
  title: string;
  description: string;
  start_date: string; // ISO string
  due_date: string; // Fecha límite de corte
  target_topic_ids: string[]; // Lista de IDs de temas de los módulos obligatorios para esta fecha
  target_quiz_ids?: string[];
  target_assignment_ids?: string[];
  passing_grade: number; // Mínimo requerido en las evaluaciones del periodo
  order_index: number;
  created_at: string;
  updated_at: string;
}

export interface MilestoneTopicCheckItem {
  topicId: string;
  topicTitle: string;
  moduleId: string;
  moduleTitle: string;
  completed: boolean;
  completedAt?: string;
  status: 'on_time' | 'late' | 'pending';
}

export interface StudentMilestoneAudit {
  milestoneId: string;
  milestoneTitle: string;
  dueDate: string;
  totalTopics: number;
  completedTopics: number;
  progressPct: number;
  isOnTrack: boolean;
  topics: MilestoneTopicCheckItem[];
}

export type AttendanceStatus = 'present' | 'late' | 'excused' | 'absent';
export type SessionModality = 'in_person' | 'online';

export interface ClassAttendanceRecord {
  id: string;
  session_title: string;
  session_date: string; // YYYY-MM-DD
  workshop_id?: string | null;
  student_id: string;
  status: AttendanceStatus;
  session_modality?: SessionModality | null;
  minutes_attended?: number | null;
  notes?: string | null;
  created_at: string;
  updated_at?: string;
}

export interface RubricScoreDetail {
  rubricId: RubricKey;
  name: string;
  weight: number; // Ej. 30 (%)
  rawScore: number; // 0 - 100
  weightedScore: number; // Ej. 88 * 0.30 = 26.4
  itemCount: number;
  summary: string;
}

export interface StudentKardexData {
  studentId: string;
  studentName: string;
  email: string;
  institution?: string | null;
  residencyYear?: string | null;
  specialty?: string | null;
  cedula?: string | null;
  cedulaVerified: boolean;
  avatarUrl?: string | null;
  folio: string; // Folio de registro institucional oficial
  generationDate: string;
  finalGrade: number; // 0 - 100
  finalGradeScale10: number; // 0.0 - 10.0
  isPassing: boolean;
  status: 'accredited_honors' | 'accredited' | 'not_accredited';
  statusLabel: string;
  cmeCreditsEarned: number;
  maxCmeCredits: number;
  academicHoursEarned: number;
  maxAcademicHours: number;
  rubricBreakdown: RubricScoreDetail[];
  examDetails: {
    attemptId: string;
    title: string;
    date: string;
    score: number;
    passed: boolean;
    moduleId: string;
  }[];
  assignmentDetails: {
    assignmentId: string;
    title: string;
    type: string;
    dueDate: string;
    submittedAt?: string | null;
    grade?: number | null;
    feedback?: string | null;
    status: string;
  }[];
  attendanceSummary: {
    totalSessions: number;
    attendedSessions: number;
    lateSessions: number;
    absentSessions: number;
    excusedSessions: number;
    attendancePct: number;
    sessions: {
      id: string;
      title: string;
      date: string;
      status: AttendanceStatus;
      notes?: string | null;
    }[];
  };
  curriculumSummary: {
    totalTopics: number;
    completedTopics: number;
    progressPct: number;
    modulesBreakdown: {
      moduleId: string;
      moduleTitle: string;
      total: number;
      completed: number;
      pct: number;
    }[];
  };
  milestoneAudits: StudentMilestoneAudit[];
}

export interface StudentCohortSummary {
  studentId: string;
  overallProgressPct: number;
  completedTopicsCount: number;
  totalTopicsCount: number;
  examAverage: number;
  examCount: number;
  assignmentsSubmitted: number;
  assignmentsTotal: number;
  assignmentsAvgGrade: number;
  attendancePct: number;
  attendedSessions: number;
  totalSessions: number;
  finalWeightedGrade: number;
  complianceStatus: 'on_track' | 'at_risk' | 'lagging';
  complianceLabel: string;
}
