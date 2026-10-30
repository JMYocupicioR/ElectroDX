import type { AcademicMilestone, AttendanceStatus } from '../types/academicGradebook';
import type { AssignmentType, StudentAssignment } from '../types/studentPlan';
import { describeReadingAssignment } from './readingAssignments';

export const MEXICO_TIME_ZONE = 'America/Mexico_City';
export const DEFAULT_CORTE_PASSING_GRADE = 80;
export const DEFAULT_EXAM_MIN_SCORE = 70;

export type AcademicComplianceStatus = 'on_track' | 'at_risk' | 'lagging';

export const COMPLIANCE_LABEL: Record<AcademicComplianceStatus, string> = {
  on_track: 'Al corriente',
  at_risk: 'En riesgo',
  lagging: 'Rezagado',
};

export interface AcademicRiskResult {
  status: AcademicComplianceStatus;
  label: string;
  reasons: string[];
  groupCount: number;
}

export interface AcademicRiskInput {
  now?: Date;
  milestones: AcademicMilestone[];
  completedTopics: Set<string>;
  completedAtByTopic?: Map<string, string | null | undefined>;
  assignments?: Array<
    Pick<
      StudentAssignment,
      | 'id'
      | 'title'
      | 'type'
      | 'due_date'
      | 'status'
      | 'grade'
      | 'min_score'
      | 'requires_delivery'
      | 'reading_topic_ids'
      | 'reading_done_ids'
      | 'reading_completed_at'
    >
  >;
  attendance?: Array<{ session_date: string; status: AttendanceStatus }>;
}

export interface MilestoneProgressAudit {
  dueDayKey: string;
  isClosed: boolean;
  totalTopics: number;
  completedOnTime: number;
  progressPct: number;
  passingGrade: number;
  topicFailure: boolean;
  isOnTrack: boolean;
  statusByTopic: Map<string, 'on_time' | 'late' | 'pending'>;
}

/** Admin-typed calendar day (`YYYY-MM-DD`), without converting through Date. */
export function dueDayKey(iso: string | null | undefined): string {
  const key = (iso ?? '').slice(0, 10);
  return /^\d{4}-\d{2}-\d{2}$/.test(key) ? key : '';
}

export function mexicoDateKey(now: Date): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: MEXICO_TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(now);
}

export function isMilestoneClosed(milestone: AcademicMilestone, todayKey: string): boolean {
  const due = dueDayKey(milestone.due_date);
  return Boolean(todayKey && due && todayKey > due);
}

function completedDayKey(iso: string | null | undefined): string {
  if (!iso) return '';
  const sliced = dueDayKey(iso);
  const parsed = Date.parse(iso);
  if (!Number.isFinite(parsed)) return sliced;
  return mexicoDateKey(new Date(parsed));
}

function passingGradeOf(milestone: AcademicMilestone): number {
  const value = Number(milestone.passing_grade);
  return Number.isFinite(value) && value > 0 ? value : DEFAULT_CORTE_PASSING_GRADE;
}

export function auditMilestoneProgress(
  milestone: AcademicMilestone,
  completedTopics: Set<string>,
  completedAtByTopic: Map<string, string | null | undefined> | undefined,
  todayKey: string
): MilestoneProgressAudit {
  const due = dueDayKey(milestone.due_date);
  const isClosed = isMilestoneClosed(milestone, todayKey);
  const topicIds = milestone.target_topic_ids ?? [];
  const statusByTopic = new Map<string, 'on_time' | 'late' | 'pending'>();
  let completedOnTime = 0;

  for (const topicId of topicIds) {
    if (!completedTopics.has(topicId)) {
      statusByTopic.set(topicId, isClosed ? 'late' : 'pending');
      continue;
    }
    const completedAt = completedAtByTopic?.get(topicId);
    const completedKey = completedDayKey(completedAt ?? null);
    const onTime = !completedKey || !due || completedKey <= due;
    if (onTime) {
      completedOnTime += 1;
      statusByTopic.set(topicId, 'on_time');
    } else {
      statusByTopic.set(topicId, 'late');
    }
  }

  const totalTopics = topicIds.length;
  const progressPct = totalTopics > 0 ? Math.round((completedOnTime / totalTopics) * 100) : 0;
  const passingGrade = passingGradeOf(milestone);
  const topicFailure = isClosed && totalTopics > 0 && progressPct < passingGrade;

  return {
    dueDayKey: due,
    isClosed,
    totalTopics,
    completedOnTime,
    progressPct,
    passingGrade,
    topicFailure,
    isOnTrack: !topicFailure,
    statusByTopic,
  };
}

export function corteShortTitle(milestone: AcademicMilestone, fallbackIndex = 1): string {
  const match = milestone.title.trim().match(/^Corte\s+\d+/i);
  if (match) return match[0];
  return `Corte ${milestone.order_index || fallbackIndex}`;
}

function dueTimestamp(iso: string): number {
  const value = Date.parse(iso);
  return Number.isFinite(value) ? value : Number.NaN;
}

function isDuePassed(iso: string, now: Date): boolean {
  const due = dueTimestamp(iso);
  return Number.isFinite(due) && due < now.getTime();
}

function examPassed(
  assignment: NonNullable<AcademicRiskInput['assignments']>[number]
): boolean {
  if (assignment.status === 'approved') return true;
  const min = assignment.min_score ?? DEFAULT_EXAM_MIN_SCORE;
  return typeof assignment.grade === 'number' && assignment.grade >= min;
}

function examFailure(
  assignment: NonNullable<AcademicRiskInput['assignments']>[number],
  now: Date
): boolean {
  if (assignment.type !== 'exam') return false;
  if (!isDuePassed(assignment.due_date, now)) return false;
  return !examPassed(assignment);
}

function homeworkFailure(
  assignment: NonNullable<AcademicRiskInput['assignments']>[number],
  now: Date
): boolean {
  if (assignment.type === 'exam') return false;
  if (!isDuePassed(assignment.due_date, now)) return false;
  if (assignment.status === 'submitted' || assignment.status === 'approved') return false;

  const reading = describeReadingAssignment(
    {
      type: assignment.type,
      status: assignment.status,
      due_date: assignment.due_date,
      requires_delivery: assignment.requires_delivery,
      reading_topic_ids: assignment.reading_topic_ids,
      reading_done_ids: assignment.reading_done_ids,
      reading_completed_at: assignment.reading_completed_at,
    },
    now.getTime()
  );

  if (reading.readingOnly) {
    if (reading.complete) return false;
    return reading.statusLabel === 'Lectura vencida' || assignment.status === 'overdue';
  }

  return (
    assignment.status === 'pending' ||
    assignment.status === 'overdue' ||
    assignment.status === 'needs_revision'
  );
}

function assignmentFailureLabel(type: AssignmentType): string {
  switch (type) {
    case 'exam':
      return 'Examen modular sin aprobar';
    case 'clinical_case':
      return 'Caso EMG sin entrega';
    case 'reading':
      return 'Lectura vencida';
    case 'emg_report':
      return 'Informe EMG sin entrega';
    case 'practical_task':
      return 'Tarea práctica sin entrega';
    default:
      return 'Tarea vencida';
  }
}

function fallsWithinMilestone(dayKey: string, milestone: AcademicMilestone): boolean {
  const start = dueDayKey(milestone.start_date) || dueDayKey(milestone.due_date);
  const due = dueDayKey(milestone.due_date);
  return Boolean(dayKey && start && due && dayKey >= start && dayKey <= due);
}

function assignmentDayKey(iso: string): string {
  return dueDayKey(iso) || completedDayKey(iso);
}

function findCoveringMilestone(
  dayKey: string,
  milestones: AcademicMilestone[]
): AcademicMilestone | undefined {
  const hits = milestones.filter((milestone) => fallsWithinMilestone(dayKey, milestone));
  if (hits.length <= 1) return hits[0];
  return [...hits].sort(
    (a, b) => a.order_index - b.order_index || a.due_date.localeCompare(b.due_date)
  )[0];
}

function statusFromGroupCount(groupCount: number): AcademicComplianceStatus {
  if (groupCount >= 2) return 'lagging';
  if (groupCount === 1) return 'at_risk';
  return 'on_track';
}

export function evaluateAcademicRisk(input: AcademicRiskInput): AcademicRiskResult {
  const now = input.now ?? new Date();
  const todayKey = mexicoDateKey(now);
  const milestones = [...input.milestones].sort(
    (a, b) => a.order_index - b.order_index || a.due_date.localeCompare(b.due_date)
  );
  const assignments = input.assignments ?? [];
  const attendance = input.attendance ?? [];

  const failedAssignments = assignments.filter(
    (assignment) => examFailure(assignment, now) || homeworkFailure(assignment, now)
  );
  const usedAssignmentIds = new Set<string>();
  const groups: string[][] = [];

  milestones.forEach((milestone, index) => {
    const progress = auditMilestoneProgress(
      milestone,
      input.completedTopics,
      input.completedAtByTopic,
      todayKey
    );
    if (!progress.isClosed) return;

    const short = corteShortTitle(milestone, index + 1);
    const reasons: string[] = [];

    if (progress.topicFailure) {
      reasons.push(`${short}: ${progress.completedOnTime}/${progress.totalTopics} temas`);
    }

    for (const assignment of failedAssignments) {
      const day = assignmentDayKey(assignment.due_date);
      if (findCoveringMilestone(day, milestones)?.id !== milestone.id) continue;
      usedAssignmentIds.add(assignment.id);
      reasons.push(`${short}: ${assignmentFailureLabel(assignment.type)}`);
    }

    const absences = attendance.filter(
      (row) =>
        row.status === 'absent' && fallsWithinMilestone(dueDayKey(row.session_date), milestone)
    );
    if (absences.length === 1) reasons.push(`${short}: 1 falta`);
    else if (absences.length > 1) reasons.push(`${short}: ${absences.length} faltas`);

    if (reasons.length > 0) groups.push(reasons);
  });

  for (const assignment of failedAssignments) {
    if (usedAssignmentIds.has(assignment.id)) continue;
    groups.push([assignmentFailureLabel(assignment.type)]);
  }

  const status = statusFromGroupCount(groups.length);
  return {
    status,
    label: COMPLIANCE_LABEL[status],
    reasons: groups.flat(),
    groupCount: groups.length,
  };
}
