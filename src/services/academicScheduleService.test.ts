import { describe, expect, it } from 'vitest';
import type { AcademicMilestone } from '../types/academicGradebook';
import {
  DEFAULT_ACADEMIC_MILESTONES,
  calendarDayKey,
  normalizeMilestone,
  pickAuthoritativeMilestones,
  toAcademicMilestoneRow,
  toMilestoneTimestamp,
  usableAdminSchedule,
} from './academicScheduleService';

function milestone(partial: Partial<AcademicMilestone>): AcademicMilestone {
  return {
    ...DEFAULT_ACADEMIC_MILESTONES[0],
    ...partial,
  };
}

describe('academicScheduleService dates', () => {
  it('does not send columns that the live academic_milestones table does not have', () => {
    const row = toAcademicMilestoneRow(DEFAULT_ACADEMIC_MILESTONES[0]);
    expect(row).not.toHaveProperty('target_quiz_ids');
    expect(row).not.toHaveProperty('target_assignment_ids');
    expect(row).not.toHaveProperty('created_at');
    expect(row).not.toHaveProperty('updated_at');
  });

  it('rejects the hardcoded August seed so the PDF cannot print placeholder dates', () => {
    expect(usableAdminSchedule(DEFAULT_ACADEMIC_MILESTONES)).toEqual([]);
    const edited = [
      normalizeMilestone({
        ...DEFAULT_ACADEMIC_MILESTONES[0],
        start_date: '2026-11-02',
        due_date: '2026-12-30',
      }),
    ];
    expect(usableAdminSchedule(edited)[0].start_date.startsWith('2026-11-02')).toBe(true);
  });

  it('keeps the calendar day the admin typed, from date inputs or ISO timestamps', () => {
    expect(calendarDayKey('2026-11-01')).toBe('2026-11-01');
    expect(calendarDayKey('2026-11-30T23:59:59.000Z')).toBe('2026-11-30');
    expect(toMilestoneTimestamp('2026-11-01', false)).toBe('2026-11-01T00:00:00.000Z');
    expect(toMilestoneTimestamp('2026-11-30', true)).toBe('2026-11-30T23:59:59.000Z');
  });

  it('normalizes admin date-input values so the brochure and calendar share the same day', () => {
    const normalized = normalizeMilestone(
      milestone({
        start_date: '2026-11-01',
        due_date: '2026-11-30',
      })
    );
    expect(normalized.start_date.startsWith('2026-11-01')).toBe(true);
    expect(normalized.due_date.startsWith('2026-11-30')).toBe(true);
  });

  it('prefers locally saved admin cortes over stale remote seed dates', () => {
    const remote = DEFAULT_ACADEMIC_MILESTONES;
    const local = DEFAULT_ACADEMIC_MILESTONES.map((item) =>
      normalizeMilestone({
        ...item,
        start_date: '2026-11-01',
        due_date: '2026-11-30',
        updated_at: '2026-09-21T18:00:00.000Z',
      })
    );
    const chosen = pickAuthoritativeMilestones(remote, local);
    expect(chosen[0].start_date.startsWith('2026-11-01')).toBe(true);
    expect(chosen[0].due_date.startsWith('2026-11-30')).toBe(true);
  });

  it('does not let seed updated_at dates in the future beat an admin save', () => {
    const remote = [
      milestone({
        start_date: '2026-08-01T00:00:00Z',
        due_date: '2026-09-15T23:59:59Z',
        updated_at: '2026-11-16T00:00:00Z',
      }),
    ];
    const local = [
      milestone({
        start_date: '2026-11-01',
        due_date: '2026-11-30',
        updated_at: '2026-09-21T18:00:00.000Z',
      }),
    ];
    const chosen = pickAuthoritativeMilestones(remote, local);
    expect(chosen[0].start_date.startsWith('2026-11-01')).toBe(true);
  });

  it('keeps admin calendar dates even if remote seed rows have a newer updated_at', () => {
    const remote = DEFAULT_ACADEMIC_MILESTONES.map((item) =>
      normalizeMilestone({
        ...item,
        updated_at: '2026-09-21T23:00:00.000Z',
      })
    );
    const local = DEFAULT_ACADEMIC_MILESTONES.map((item, index) =>
      normalizeMilestone({
        ...item,
        start_date: ['2026-11-01', '2026-11-30', '2026-12-28', '2026-12-31'][index],
        due_date: ['2026-11-30', '2027-01-31', '2027-02-28', '2027-03-31'][index],
        updated_at: '2026-09-21T12:00:00.000Z',
      })
    );
    const chosen = pickAuthoritativeMilestones(remote, local);
    expect(chosen[0].start_date.startsWith('2026-11-01')).toBe(true);
    expect(chosen[0].due_date.startsWith('2026-11-30')).toBe(true);
    expect(chosen[3].due_date.startsWith('2027-03-31')).toBe(true);
  });

  it('prefers remote cortes when they were updated after the local copy', () => {
    const local = DEFAULT_ACADEMIC_MILESTONES;
    const remote = DEFAULT_ACADEMIC_MILESTONES.map((item) =>
      normalizeMilestone({
        ...item,
        start_date: '2026-12-01',
        due_date: '2026-12-20',
        updated_at: '2026-09-21T20:00:00.000Z',
      })
    );
    const chosen = pickAuthoritativeMilestones(remote, local);
    expect(chosen[0].start_date.startsWith('2026-12-01')).toBe(true);
  });
});
