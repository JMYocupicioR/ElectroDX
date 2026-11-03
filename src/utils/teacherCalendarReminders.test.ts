import { describe, expect, it } from 'vitest';
import type { CalendarItem } from '../types/academicCalendar';
import type { AcademicMilestone } from '../types/academicGradebook';
import type { WorkshopAttendanceSummary } from '../types/academicAnalytics';
import type { LiveWorkshop } from '../types/database';
import type { StudentAssignment, TeacherPendingReviewItem } from '../types/studentPlan';
import { milestoneToCalendarItem, workshopToCalendarItem } from './academicCalendar';
import { buildTeacherCalendarReminders } from './teacherCalendarReminders';

const NOW = new Date(2026, 10, 3, 12, 0, 0);

function assignment(partial: Partial<StudentAssignment> & Pick<StudentAssignment, 'id' | 'student_id' | 'title' | 'type'>): StudentAssignment {
  return {
    description: '',
    due_date: '2026-11-10T23:59:00.000Z',
    status: 'submitted',
    priority: 'normal',
    created_at: '2026-10-01T00:00:00.000Z',
    updated_at: '2026-10-01T00:00:00.000Z',
    submitted_at: '2026-11-01T12:00:00.000Z',
    ...partial,
  };
}

function review(asg: StudentAssignment, name = 'Dra. Pérez'): TeacherPendingReviewItem {
  return {
    assignment: asg,
    studentProfile: { id: asg.student_id, display_name: name, email: 'p@test.com' },
  };
}

function milestone(partial: Partial<AcademicMilestone> & Pick<AcademicMilestone, 'id' | 'title' | 'due_date'>): AcademicMilestone {
  return {
    cohort_id: 'default',
    description: '',
    start_date: '2026-08-01',
    target_topic_ids: [],
    passing_grade: 80,
    order_index: 1,
    created_at: '2026-01-01T00:00:00.000Z',
    updated_at: '2026-01-01T00:00:00.000Z',
    ...partial,
  };
}

function workshop(partial: Partial<LiveWorkshop> & Pick<LiveWorkshop, 'id' | 'title' | 'scheduled_at'>): LiveWorkshop {
  return {
    module_id: 'emg-needle',
    topic_id: null,
    description: null,
    duration_minutes: 90,
    stream_url: null,
    recording_url: null,
    max_capacity: 30,
    clinical_case_revision_id: null,
    clinical_case_json: null,
    status: 'scheduled',
    counts_for_kardex: true,
    created_by: 'admin',
    updated_at: '2026-01-01T00:00:00.000Z',
    created_at: '2026-01-01T00:00:00.000Z',
    ...partial,
  };
}

function summary(workshopId: string, rollCallStatus: WorkshopAttendanceSummary['rollCallStatus'], pendingCount = 2): WorkshopAttendanceSummary {
  return {
    workshopId,
    title: 'Clase',
    scheduledAt: '2026-11-01T19:00:00.000Z',
    modality: 'online',
    status: 'completed',
    attendanceClosed: false,
    countsForKardex: true,
    totalExpected: 10,
    presentCount: 0,
    lateCount: 0,
    excusedCount: 0,
    absentCount: 0,
    pendingCount,
    attendancePct: 0,
    rollCallStatus,
  };
}

function assignmentItem(partial: Partial<CalendarItem> & Pick<CalendarItem, 'id' | 'title' | 'startsAt'>): CalendarItem {
  return {
    type: 'practical_task',
    allDay: true,
    rubricKey: 'assignments',
    countsForKardex: true,
    sourceIds: [partial.id],
    assignmentIds: [partial.id],
    studentIds: ['s1'],
    studentCount: 1,
    submittedCount: 1,
    approvedCount: 0,
    pendingCount: 0,
    endsAt: partial.startsAt,
    ...partial,
  };
}

describe('buildTeacherCalendarReminders', () => {
  it('lists upcoming teacher work inside 14 days and skips far or finished items', () => {
    const nearClass = workshop({ id: 'w-near', title: 'Clase de aguja', scheduled_at: new Date(2026, 10, 4, 19, 0, 0).toISOString() });
    const farClass = workshop({ id: 'w-far', title: 'Clase lejana', scheduled_at: new Date(2026, 11, 1, 19, 0, 0).toISOString() });
    const openTask = assignmentItem({
      id: 'asg_open',
      title: 'Protocolo mediano',
      startsAt: '2026-11-10',
      submittedCount: 1,
      approvedCount: 0,
    });
    const doneTask = assignmentItem({
      id: 'asg_done',
      title: 'Ya calificada',
      startsAt: '2026-11-10',
      submittedCount: 1,
      approvedCount: 1,
      pendingCount: 0,
      studentCount: 1,
    });
    const corte = milestone({ id: 'm-soon', title: 'Corte 2', start_date: '2026-11-01', due_date: '2026-11-15', order_index: 2 });

    const result = buildTeacherCalendarReminders({
      items: [
        workshopToCalendarItem(nearClass),
        workshopToCalendarItem(farClass),
        openTask,
        doneTask,
        milestoneToCalendarItem(corte),
      ],
      milestones: [corte],
      workshops: [nearClass, farClass],
      pendingSubmissions: [],
      pendingRetakes: [],
      attendanceSummaries: [summary('w-near', 'not_started', 10)],
      now: NOW,
    });

    expect(result.upcoming.map((row) => row.title)).toEqual(['Clase de aguja', 'Protocolo mediano', 'Corte 2']);
    expect(result.upcoming.every((row) => row.action === 'select')).toBe(true);
  });

  it('puts overdue or closed-corte submissions ahead of later grading', () => {
    const closed = milestone({ id: 'm1', title: 'Corte 1', start_date: '2026-08-01', due_date: '2026-09-15', order_index: 1 });
    const later = assignment({
      id: 'a-later',
      student_id: 's2',
      title: 'Tarea futura',
      type: 'practical_task',
      due_date: '2026-11-20T23:59:00.000Z',
      submitted_at: '2026-10-01T00:00:00.000Z',
    });
    const overdue = assignment({
      id: 'a-over',
      student_id: 's1',
      title: 'Tarea del corte',
      type: 'practical_task',
      due_date: '2026-09-10T23:59:00.000Z',
      submitted_at: '2026-11-02T00:00:00.000Z',
    });

    const result = buildTeacherCalendarReminders({
      items: [],
      milestones: [closed],
      workshops: [],
      pendingSubmissions: [review(later, 'Dra. Tardía'), review(overdue, 'Dr. Corte')],
      pendingRetakes: [],
      attendanceSummaries: [],
      now: NOW,
    });

    expect(result.toGrade.map((row) => row.title)).toEqual(['Tarea del corte', 'Tarea futura']);
    expect(result.toGrade[0].action).toBe('grade');
    expect(result.toGrade[0].urgency).toBe('overdue');
  });

  it('flags started classes without a completed roll call', () => {
    const past = workshop({
      id: 'w-past',
      title: 'Clase del lunes',
      scheduled_at: new Date(2026, 10, 2, 19, 0, 0).toISOString(),
      status: 'completed',
    });
    const done = workshop({
      id: 'w-done',
      title: 'Clase cerrada',
      scheduled_at: new Date(2026, 10, 1, 19, 0, 0).toISOString(),
      status: 'completed',
    });

    const result = buildTeacherCalendarReminders({
      items: [workshopToCalendarItem(past), workshopToCalendarItem(done)],
      milestones: [],
      workshops: [past, done],
      pendingSubmissions: [],
      pendingRetakes: [],
      attendanceSummaries: [summary('w-past', 'incomplete', 4), summary('w-done', 'completed', 0)],
      now: NOW,
    });

    expect(result.classes).toHaveLength(1);
    expect(result.classes[0].title).toBe('Clase del lunes');
    expect(result.classes[0].action).toBe('attendance');
    expect(result.classes[0].workshopId).toBe('w-past');
  });

  it('keeps upcoming or open cortes and closed ones that still need grading', () => {
    const closedDirty = milestone({
      id: 'm-dirty',
      title: 'Corte 1',
      start_date: '2026-08-01',
      due_date: '2026-09-15',
      order_index: 1,
    });
    const closedClean = milestone({
      id: 'm-clean',
      title: 'Corte extra',
      start_date: '2026-06-01',
      due_date: '2026-07-01',
      order_index: 0,
    });
    const soon = milestone({
      id: 'm-soon',
      title: 'Corte 2',
      start_date: '2026-11-01',
      due_date: '2026-11-15',
      order_index: 2,
    });

    const result = buildTeacherCalendarReminders({
      items: [
        milestoneToCalendarItem(closedDirty),
        milestoneToCalendarItem(closedClean),
        milestoneToCalendarItem(soon),
        assignmentItem({
          id: 'asg_old',
          title: 'Caso del corte 1',
          type: 'clinical_case',
          startsAt: '2026-09-10',
          submittedCount: 3,
          approvedCount: 1,
          studentCount: 3,
        }),
      ],
      milestones: [closedDirty, closedClean, soon],
      workshops: [],
      pendingSubmissions: [],
      pendingRetakes: [],
      attendanceSummaries: [],
      now: NOW,
    });

    expect(result.cortes.map((row) => row.title)).toEqual(['Corte 1', 'Corte 2']);
    expect(result.cortes[0].urgency).toBe('overdue');
    expect(result.cortes[0].detail).toContain('por calificar');
  });
});
