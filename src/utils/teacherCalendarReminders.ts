import type { CalendarItem } from '../types/academicCalendar';
import type { AcademicMilestone } from '../types/academicGradebook';
import type { WorkshopAttendanceSummary } from '../types/academicAnalytics';
import type { LiveWorkshop } from '../types/database';
import type { StudentAssignment, TeacherPendingReviewItem } from '../types/studentPlan';
import { dueDayKey, isMilestoneClosed, corteShortTitle } from './academicRisk';
import { addDays, CALENDAR_TYPE_LABELS, toLocalDateKey } from './academicCalendar';

export const TEACHER_REMINDER_HORIZON_DAYS = 14;
export const TEACHER_REMINDER_ROW_LIMIT = 5;

export type TeacherReminderAction = 'select' | 'grade' | 'attendance';
export type TeacherReminderUrgency = 'overdue' | 'now' | 'soon';

export interface TeacherReminderRow {
  id: string;
  title: string;
  detail: string;
  dateKey: string;
  urgency: TeacherReminderUrgency;
  action: TeacherReminderAction;
  calendarItemId?: string;
  workshopId?: string | null;
  review?: TeacherPendingReviewItem;
}

export interface TeacherCalendarReminders {
  upcoming: TeacherReminderRow[];
  toGrade: TeacherReminderRow[];
  classes: TeacherReminderRow[];
  cortes: TeacherReminderRow[];
}

const ASSIGNMENT_TYPES = new Set<CalendarItem['type']>([
  'exam',
  'clinical_case',
  'reading',
  'emg_report',
  'practical_task',
]);

function itemDayKey(item: CalendarItem): string {
  if (item.type === 'milestone') return dueDayKey(item.endsAt || item.startsAt);
  if (item.allDay && /^\d{4}-\d{2}-\d{2}/.test(item.startsAt)) return item.startsAt.slice(0, 10);
  return toLocalDateKey(item.startsAt);
}

function assignmentDayKey(assignment: StudentAssignment): string {
  return dueDayKey(assignment.due_date) || toLocalDateKey(assignment.due_date);
}

function inWindow(dayKey: string, startKey: string, endKey: string): boolean {
  if (!dayKey) return false;
  if (startKey && dayKey < startKey) return false;
  if (endKey && dayKey > endKey) return false;
  return true;
}

function coveringMilestones(milestones: AcademicMilestone[], dayKey: string): AcademicMilestone[] {
  return milestones.filter((milestone) =>
    inWindow(dayKey, dueDayKey(milestone.start_date), dueDayKey(milestone.due_date))
  );
}

function urgencyForDay(dayKey: string, todayKey: string): TeacherReminderUrgency {
  if (dayKey && dayKey < todayKey) return 'overdue';
  if (dayKey === todayKey) return 'now';
  return 'soon';
}

function ungradedCount(item: CalendarItem): number {
  return Math.max(0, item.submittedCount - item.approvedCount);
}

function isFullyGraded(item: CalendarItem): boolean {
  if (!ASSIGNMENT_TYPES.has(item.type)) return false;
  if (item.studentCount <= 0) return false;
  return item.approvedCount >= item.studentCount && ungradedCount(item) === 0 && item.pendingCount === 0;
}

function calendarItemForAssignment(items: CalendarItem[], assignment: StudentAssignment): CalendarItem | undefined {
  return items.find((item) => item.assignmentIds.includes(assignment.id));
}

function calendarItemForWorkshop(items: CalendarItem[], workshopId: string): CalendarItem | undefined {
  return items.find((item) => item.workshopId === workshopId);
}

function calendarItemForMilestone(items: CalendarItem[], milestoneId: string): CalendarItem | undefined {
  return items.find((item) => item.milestoneId === milestoneId);
}

function attendanceMap(
  summaries: WorkshopAttendanceSummary[] | Map<string, WorkshopAttendanceSummary>
): Map<string, WorkshopAttendanceSummary> {
  if (summaries instanceof Map) return summaries;
  return new Map(summaries.map((row) => [row.workshopId, row]));
}

function assignmentTypeLabel(assignment: StudentAssignment): string {
  if (assignment.type === 'exam') return 'Examen';
  if (assignment.type === 'clinical_case') return 'Caso EMG';
  if (assignment.type === 'emg_report') return 'Informe EMG';
  if (assignment.type === 'reading') return 'Lectura';
  return 'Tarea';
}

export function buildTeacherCalendarReminders(input: {
  items: CalendarItem[];
  milestones: AcademicMilestone[];
  workshops: LiveWorkshop[];
  pendingSubmissions: TeacherPendingReviewItem[];
  pendingRetakes: TeacherPendingReviewItem[];
  attendanceSummaries: WorkshopAttendanceSummary[] | Map<string, WorkshopAttendanceSummary>;
  now?: Date;
}): TeacherCalendarReminders {
  const now = input.now ?? new Date();
  const todayKey = toLocalDateKey(now);
  const horizonKey = toLocalDateKey(addDays(now, TEACHER_REMINDER_HORIZON_DAYS));
  const summaries = attendanceMap(input.attendanceSummaries);
  const milestones = [...input.milestones].sort(
    (a, b) => a.order_index - b.order_index || dueDayKey(a.due_date).localeCompare(dueDayKey(b.due_date))
  );

  const upcoming: TeacherReminderRow[] = [];
  for (const item of input.items) {
    if (item.workshopStatus === 'cancelled') continue;
    const dayKey = itemDayKey(item);
    if (!dayKey || dayKey < todayKey || dayKey > horizonKey) continue;
    if (item.type === 'session' && new Date(item.startsAt).getTime() < now.getTime()) continue;
    if (isFullyGraded(item)) continue;

    const typeLabel = CALENDAR_TYPE_LABELS[item.type];
    let detail = typeLabel;
    if (ASSIGNMENT_TYPES.has(item.type) && ungradedCount(item) > 0) {
      detail = `${typeLabel} · ${ungradedCount(item)} por calificar`;
    } else if (item.type === 'session') {
      const time = new Date(item.startsAt).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });
      detail = `${typeLabel} · ${time}`;
    } else if (item.type === 'milestone') {
      detail = `Corte · vence ${dayKey}`;
    }

    upcoming.push({
      id: `up_${item.id}`,
      title: item.title,
      detail,
      dateKey: dayKey,
      urgency: urgencyForDay(dayKey, todayKey),
      action: 'select',
      calendarItemId: item.id,
      workshopId: item.workshopId,
    });
  }
  upcoming.sort((a, b) => a.dateKey.localeCompare(b.dateKey) || a.title.localeCompare(b.title, 'es'));

  const toGrade: TeacherReminderRow[] = [];
  const gradePriority = (assignment: StudentAssignment): number => {
    const dayKey = assignmentDayKey(assignment);
    const covering = coveringMilestones(milestones, dayKey);
    if (dayKey && dayKey < todayKey) return 0;
    if (covering.some((milestone) => isMilestoneClosed(milestone, todayKey))) return 0;
    if (covering.some((milestone) => !isMilestoneClosed(milestone, todayKey))) return 1;
    return 2;
  };

  const pushReview = (review: TeacherPendingReviewItem, kind: 'submission' | 'retake') => {
    const assignment = review.assignment;
    const dayKey = assignmentDayKey(assignment);
    const student = review.studentProfile?.display_name || 'Médico cursista';
    const typeLabel = assignmentTypeLabel(assignment);
    const covering = coveringMilestones(milestones, dayKey);
    const corte = covering[0] ? corteShortTitle(covering[0], covering[0].order_index || 1) : null;
    const detailParts = [
      kind === 'retake' ? 'Retoma solicitada' : typeLabel,
      student,
      corte,
    ].filter(Boolean);

    toGrade.push({
      id: `${kind}_${assignment.id}_${assignment.student_id}`,
      title: assignment.title,
      detail: detailParts.join(' · '),
      dateKey: dayKey || todayKey,
      urgency: urgencyForDay(dayKey || todayKey, todayKey),
      action: 'grade',
      calendarItemId: calendarItemForAssignment(input.items, assignment)?.id,
      review,
    });
  };

  for (const review of input.pendingSubmissions) pushReview(review, 'submission');
  for (const review of input.pendingRetakes) {
    if (toGrade.some((row) => row.review?.assignment.id === review.assignment.id)) continue;
    pushReview(review, 'retake');
  }

  toGrade.sort((a, b) => {
    const pa = gradePriority(a.review!.assignment);
    const pb = gradePriority(b.review!.assignment);
    if (pa !== pb) return pa - pb;
    const da = a.review!.assignment.submitted_at || a.review!.assignment.updated_at;
    const db = b.review!.assignment.submitted_at || b.review!.assignment.updated_at;
    return new Date(da).getTime() - new Date(db).getTime();
  });

  const classes: TeacherReminderRow[] = [];
  for (const workshop of input.workshops) {
    if (workshop.status === 'cancelled' || workshop.status === 'draft') continue;
    const summary = summaries.get(workshop.id);
    const rollCall = summary?.rollCallStatus ?? 'not_started';
    if (rollCall === 'completed') continue;

    const scheduled = new Date(workshop.scheduled_at);
    const dayKey = toLocalDateKey(workshop.scheduled_at);
    const started = scheduled.getTime() <= now.getTime();
    const upcomingClass = !started && dayKey >= todayKey && dayKey <= horizonKey;
    if (!started && !upcomingClass) continue;

    const pending = summary?.pendingCount ?? 0;
    const rollLabel =
      rollCall === 'incomplete'
        ? `Lista incompleta · ${pending} sin marcar`
        : started
          ? 'Sin pase de lista'
          : 'Preparar asistencia';

    classes.push({
      id: `cls_${workshop.id}`,
      title: workshop.title,
      detail: rollLabel,
      dateKey: dayKey,
      urgency: started && dayKey < todayKey ? 'overdue' : urgencyForDay(dayKey, todayKey),
      action: 'attendance',
      calendarItemId: calendarItemForWorkshop(input.items, workshop.id)?.id,
      workshopId: workshop.id,
    });
  }
  classes.sort((a, b) => {
    const rank = (row: TeacherReminderRow) => (row.urgency === 'overdue' ? 0 : row.urgency === 'now' ? 1 : 2);
    const diff = rank(a) - rank(b);
    if (diff !== 0) return diff;
    if (a.urgency === 'overdue') return b.dateKey.localeCompare(a.dateKey);
    return a.dateKey.localeCompare(b.dateKey);
  });

  const cortes: TeacherReminderRow[] = [];
  milestones.forEach((milestone, index) => {
    const due = dueDayKey(milestone.due_date);
    const start = dueDayKey(milestone.start_date);
    if (!due) return;
    const closed = isMilestoneClosed(milestone, todayKey);
    const upcomingCorte = due >= todayKey && due <= horizonKey;
    const active = Boolean(start && start <= todayKey && due >= todayKey);

    const windowItems = input.items.filter(
      (item) => ASSIGNMENT_TYPES.has(item.type) && inWindow(itemDayKey(item), start, due)
    );
    const ungraded = windowItems.reduce((sum, item) => sum + ungradedCount(item), 0);
    const pendingStudent = windowItems.reduce((sum, item) => sum + item.pendingCount, 0);
    const reviewsInWindow = toGrade.filter((row) => inWindow(row.dateKey, start, due)).length;
    const hasTeacherWork = ungraded > 0 || reviewsInWindow > 0;
    const hasClosedGaps = closed && (hasTeacherWork || pendingStudent > 0);

    if (!upcomingCorte && !active && !hasClosedGaps) return;
    if (closed && !hasClosedGaps) return;

    const parts: string[] = [];
    if (ungraded > 0) parts.push(`${ungraded} por calificar`);
    else if (reviewsInWindow > 0) parts.push(`${reviewsInWindow} por calificar`);
    if (closed && pendingStudent > 0) parts.push(`${pendingStudent} sin entregar`);
    if (parts.length === 0) parts.push(closed ? 'Corte cerrado' : `Vence ${due}`);

    cortes.push({
      id: `corte_${milestone.id}`,
      title: corteShortTitle(milestone, index + 1),
      detail: parts.join(' · '),
      dateKey: due,
      urgency: closed ? 'overdue' : urgencyForDay(due, todayKey),
      action: 'select',
      calendarItemId: calendarItemForMilestone(input.items, milestone.id)?.id,
    });
  });
  cortes.sort((a, b) => {
    if (a.urgency === 'overdue' && b.urgency !== 'overdue') return -1;
    if (b.urgency === 'overdue' && a.urgency !== 'overdue') return 1;
    return a.dateKey.localeCompare(b.dateKey);
  });

  return { upcoming, toGrade, classes, cortes };
}
