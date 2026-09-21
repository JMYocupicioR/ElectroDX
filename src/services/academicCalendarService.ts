import { getAcademicMilestones, hasCustomAdminDates, rememberAdminMilestones } from './academicScheduleService';
import { getGradebookRubrics } from './gradebookService';
import { getWorkshops } from './courseService';
import { getAllStudentAssignments } from './studentPlanService';
import {
  buildRubricSnapshot,
  groupAssignmentsIntoEvents,
  milestoneToCalendarItem,
  workshopToCalendarItem,
} from '../utils/academicCalendar';
import type { AcademicCalendarFeed } from '../types/academicCalendar';
import type { AdminProfileRow } from '../types/admin';

function errorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error && error.message) return error.message;
  if (error && typeof error === 'object' && 'message' in error) {
    const message = (error as { message?: unknown }).message;
    if (typeof message === 'string' && message.trim()) return message;
  }
  return fallback;
}

export async function loadAcademicCalendarFeed(
  profiles: AdminProfileRow[] = []
): Promise<AcademicCalendarFeed> {
  const warnings: string[] = [];

  const [workshopResult, assignmentResult, milestoneResult, rubricConfig] = await Promise.all([
    getWorkshops()
      .then((data) => ({ data }))
      .catch((error) => {
        warnings.push(`No se pudieron cargar los talleres: ${errorMessage(error, 'error de red o permisos')}`);
        return { data: [] as Awaited<ReturnType<typeof getWorkshops>> };
      }),
    getAllStudentAssignments(profiles)
      .then((data) => ({ data }))
      .catch((error) => {
        warnings.push(`No se pudieron cargar exámenes y tareas: ${errorMessage(error, 'error de red o permisos')}`);
        return { data: [] as Awaited<ReturnType<typeof getAllStudentAssignments>> };
      }),
    getAcademicMilestones()
      .then((data) => ({ data }))
      .catch((error) => {
        warnings.push(`No se pudieron cargar los cortes: ${errorMessage(error, 'error de red o permisos')}`);
        return { data: [] as Awaited<ReturnType<typeof getAcademicMilestones>> };
      }),
    getGradebookRubrics(),
  ]);

  const items = [
    ...workshopResult.data.map(workshopToCalendarItem),
    ...groupAssignmentsIntoEvents(assignmentResult.data),
    ...milestoneResult.data.map(milestoneToCalendarItem),
  ].sort((a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime());

  if (hasCustomAdminDates(milestoneResult.data)) {
    rememberAdminMilestones(milestoneResult.data);
  }

  return {
    items,
    rubric: buildRubricSnapshot(rubricConfig, items),
    milestones: milestoneResult.data,
    workshops: workshopResult.data,
    warnings,
  };
}
