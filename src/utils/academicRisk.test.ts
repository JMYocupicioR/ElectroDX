import { describe, expect, it } from 'vitest';
import type { AcademicMilestone } from '../types/academicGradebook';
import type { StudentAssignment } from '../types/studentPlan';
import {
  DEFAULT_ACADEMIC_MILESTONES,
  isDefaultSeedMilestone,
  usableAdminSchedule,
} from '../services/academicScheduleService';
import {
  auditMilestoneProgress,
  evaluateAcademicRisk,
  mexicoDateKey,
} from './academicRisk';

const NOW = new Date('2026-10-29T20:00:00-06:00');

function corte(partial: Partial<AcademicMilestone> = {}): AcademicMilestone {
  return {
    id: 'mls_custom_1',
    cohort_id: '2026-general',
    title: 'Corte 1: Evaluación',
    description: '',
    start_date: '2026-08-01T00:00:00.000Z',
    due_date: '2026-10-28T23:59:59.000Z',
    target_topic_ids: ['history', 'clinical-role'],
    passing_grade: 80,
    order_index: 1,
    created_at: '2026-01-01T00:00:00.000Z',
    updated_at: '2026-10-01T00:00:00.000Z',
    ...partial,
  };
}

function assignment(
  partial: Partial<StudentAssignment> & Pick<StudentAssignment, 'type' | 'due_date' | 'status'>
): StudentAssignment {
  return {
    id: partial.id ?? `asg_${partial.type}`,
    student_id: 'stu_1',
    title: partial.title ?? partial.type,
    description: '',
    priority: 'normal',
    created_at: '2026-10-01T00:00:00.000Z',
    updated_at: '2026-10-01T00:00:00.000Z',
    ...partial,
  };
}

describe('mexicoDateKey', () => {
  it('uses America/Mexico_City, not UTC midnight', () => {
    expect(mexicoDateKey(new Date('2026-10-16T05:00:00.000Z'))).toBe('2026-10-15');
    expect(mexicoDateKey(new Date('2026-10-16T06:00:00.000Z'))).toBe('2026-10-16');
  });
});

describe('evaluateAcademicRisk', () => {
  it('keeps an empty kárdex (0% temario, no cortes, no tareas) on track', () => {
    const result = evaluateAcademicRisk({
      now: NOW,
      milestones: [],
      completedTopics: new Set(),
    });
    expect(result.status).toBe('on_track');
    expect(result.label).toBe('Al corriente');
    expect(result.reasons).toEqual([]);
    expect(result.groupCount).toBe(0);
  });

  it('ignores August–December seed cortes that are already due', () => {
    expect(usableAdminSchedule(DEFAULT_ACADEMIC_MILESTONES)).toEqual([]);
    expect(DEFAULT_ACADEMIC_MILESTONES.every(isDefaultSeedMilestone)).toBe(true);
    const result = evaluateAcademicRisk({
      now: NOW,
      milestones: usableAdminSchedule(DEFAULT_ACADEMIC_MILESTONES),
      completedTopics: new Set(),
    });
    expect(result.status).toBe('on_track');
  });

  it('keeps a future corte with 0 topics on track', () => {
    const result = evaluateAcademicRisk({
      now: NOW,
      milestones: [
        corte({
          due_date: '2026-11-30T23:59:59.000Z',
          start_date: '2026-11-01T00:00:00.000Z',
          target_topic_ids: [],
        }),
      ],
      completedTopics: new Set(),
    });
    expect(result.status).toBe('on_track');
    expect(
      auditMilestoneProgress(
        corte({
          due_date: '2026-11-30T23:59:59.000Z',
          target_topic_ids: [],
        }),
        new Set(),
        undefined,
        mexicoDateKey(NOW)
      ).isOnTrack
    ).toBe(true);
  });

  it('stays on track on the corte due day and alerts the day after if topics are below passing_grade', () => {
    const closed = corte({
      due_date: '2026-10-28T23:59:59.000Z',
      target_topic_ids: ['history', 'clinical-role', 'ethical-aspects', 'safety-patient', 'resting-potential'],
    });
    const dueDay = evaluateAcademicRisk({
      now: new Date('2026-10-28T20:00:00-06:00'),
      milestones: [closed],
      completedTopics: new Set(),
    });
    expect(dueDay.status).toBe('on_track');

    const nextDay = evaluateAcademicRisk({
      now: new Date('2026-10-29T08:00:00-06:00'),
      milestones: [closed],
      completedTopics: new Set(['history']),
    });
    expect(nextDay.status).toBe('at_risk');
    expect(nextDay.reasons[0]).toBe('Corte 1: 1/5 temas');
  });

  it('marks lagging when two closed cortes have incomplete topics', () => {
    const result = evaluateAcademicRisk({
      now: NOW,
      milestones: [
        corte({
          id: 'mls_custom_1',
          title: 'Corte 1: A',
          due_date: '2026-09-15T23:59:59.000Z',
          order_index: 1,
        }),
        corte({
          id: 'mls_custom_2',
          title: 'Corte 2: B',
          start_date: '2026-09-16T00:00:00.000Z',
          due_date: '2026-10-15T23:59:59.000Z',
          order_index: 2,
          target_topic_ids: ['f-waves', 'h-reflex'],
        }),
      ],
      completedTopics: new Set(),
    });
    expect(result.status).toBe('lagging');
    expect(result.groupCount).toBe(2);
  });

  it('does not alert a pending homework before its due date, and does after', () => {
    const task = assignment({
      type: 'practical_task',
      status: 'pending',
      due_date: '2026-11-05T18:00:00.000Z',
    });
    expect(
      evaluateAcademicRisk({
        now: NOW,
        milestones: [],
        completedTopics: new Set(),
        assignments: [task],
      }).status
    ).toBe('on_track');

    expect(
      evaluateAcademicRisk({
        now: NOW,
        milestones: [],
        completedTopics: new Set(),
        assignments: [{ ...task, due_date: '2026-10-20T18:00:00.000Z' }],
      }).status
    ).toBe('at_risk');
  });

  it('does not alert a failed modular exam while its window is open', () => {
    const exam = assignment({
      type: 'exam',
      status: 'submitted',
      due_date: '2026-11-05T18:00:00.000Z',
      grade: 40,
      min_score: 70,
    });
    expect(
      evaluateAcademicRisk({
        now: NOW,
        milestones: [],
        completedTopics: new Set(),
        assignments: [exam],
      }).status
    ).toBe('on_track');

    const closed = evaluateAcademicRisk({
      now: NOW,
      milestones: [],
      completedTopics: new Set(),
      assignments: [{ ...exam, due_date: '2026-10-20T18:00:00.000Z' }],
    });
    expect(closed.status).toBe('at_risk');
    expect(closed.reasons).toEqual(['Examen modular sin aprobar']);
  });

  it('does not alert a submitted delivery that the teacher has not graded', () => {
    const result = evaluateAcademicRisk({
      now: NOW,
      milestones: [],
      completedTopics: new Set(),
      assignments: [
        assignment({
          type: 'clinical_case',
          status: 'submitted',
          due_date: '2026-10-20T18:00:00.000Z',
          grade: null,
        }),
      ],
    });
    expect(result.status).toBe('on_track');
  });

  it('ignores an excused absence and adds a captured absent to a closed corte', () => {
    const closedCorte = corte({ target_topic_ids: ['history', 'clinical-role'] });
    const excused = evaluateAcademicRisk({
      now: NOW,
      milestones: [closedCorte],
      completedTopics: new Set(['history', 'clinical-role']),
      attendance: [{ session_date: '2026-10-10', status: 'excused' }],
    });
    expect(excused.status).toBe('on_track');

    const absent = evaluateAcademicRisk({
      now: NOW,
      milestones: [closedCorte],
      completedTopics: new Set(['history', 'clinical-role']),
      attendance: [{ session_date: '2026-10-10', status: 'absent' }],
    });
    expect(absent.status).toBe('at_risk');
    expect(absent.reasons).toEqual(['Corte 1: 1 falta']);
  });

  it('merges an overdue exam into a closed corte instead of opening a second group', () => {
    const result = evaluateAcademicRisk({
      now: NOW,
      milestones: [corte({ target_topic_ids: ['history', 'clinical-role'] })],
      completedTopics: new Set(),
      assignments: [
        assignment({
          type: 'exam',
          status: 'submitted',
          due_date: '2026-10-20T18:00:00.000Z',
          grade: 50,
          min_score: 70,
        }),
      ],
    });
    expect(result.groupCount).toBe(1);
    expect(result.status).toBe('at_risk');
    expect(result.reasons).toEqual([
      'Corte 1: 0/2 temas',
      'Corte 1: Examen modular sin aprobar',
    ]);
  });

  it('accepts a completed topic without completed_at as on time', () => {
    const result = evaluateAcademicRisk({
      now: NOW,
      milestones: [corte({ passing_grade: 80, target_topic_ids: ['history', 'clinical-role'] })],
      completedTopics: new Set(['history', 'clinical-role']),
      completedAtByTopic: new Map(),
    });
    expect(result.status).toBe('on_track');
  });

  it('does not count a topic completed after the due day', () => {
    const result = evaluateAcademicRisk({
      now: NOW,
      milestones: [corte({ passing_grade: 100, target_topic_ids: ['history'] })],
      completedTopics: new Set(['history']),
      completedAtByTopic: new Map([['history', '2026-10-29T12:00:00.000Z']]),
    });
    expect(result.status).toBe('at_risk');
  });

  it('treats needs_revision after the due date as unmet homework', () => {
    const result = evaluateAcademicRisk({
      now: NOW,
      milestones: [],
      completedTopics: new Set(),
      assignments: [
        assignment({
          type: 'emg_report',
          status: 'needs_revision',
          due_date: '2026-10-20T18:00:00.000Z',
        }),
      ],
    });
    expect(result.status).toBe('at_risk');
    expect(result.reasons).toEqual(['Informe EMG sin entrega']);
  });

  it('marks a pending reading overdue only after its due date', () => {
    const reading = assignment({
      type: 'reading',
      status: 'pending',
      due_date: '2026-10-20T18:00:00.000Z',
      requires_delivery: false,
      reading_topic_ids: ['history', 'clinical-role'],
      reading_done_ids: ['history'],
    });
    const result = evaluateAcademicRisk({
      now: NOW,
      milestones: [],
      completedTopics: new Set(),
      assignments: [reading],
    });
    expect(result.status).toBe('at_risk');
    expect(result.reasons).toEqual(['Lectura vencida']);
  });
});
