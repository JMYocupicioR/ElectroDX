import { getAcademicMilestones } from './academicScheduleService';
import { getWorkshops } from './courseService';
import { getStudentAssignments } from './studentPlanService';
import type { CalendarItem } from '../types/academicCalendar';
import {
  groupAssignmentsIntoEvents,
  milestoneToCalendarItem,
  workshopToCalendarItem,
} from '../utils/academicCalendar';

export async function loadStudentAgenda(studentId: string | null): Promise<CalendarItem[]> {
  const [workshops, assignments, milestones] = await Promise.all([
    getWorkshops().catch(() => []),
    studentId ? getStudentAssignments(studentId).catch(() => []) : Promise.resolve([]),
    getAcademicMilestones().catch(() => []),
  ]);

  const sessions = workshops
    .filter((workshop) => workshop.status !== 'draft' && workshop.status !== 'cancelled')
    .map(workshopToCalendarItem);
  const tasks = groupAssignmentsIntoEvents(assignments);
  const cuts = milestones.map(milestoneToCalendarItem);

  return [...sessions, ...tasks, ...cuts].sort(
    (a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime(),
  );
}
