import { supabase } from '../lib/supabase';
import { allModules } from '../content/modules';
import { calculateStudentMetrics, fetchStudentCompletedTopics, getAllTopicIds } from './studentService';
import { getMyAttempts, getMyProgressByModule } from './quizService';
import { getStudentAssignments } from './studentPlanService';
import { calculateStudentAttendanceMetrics } from './attendanceService';
import { getWorkshops } from './courseService';
import { getStudentMilestoneAudits, getAcademicMilestones } from './academicScheduleService';
import { isTableMissingInSupabase, markTableAsMissingInSupabase } from './tableAvailability';
import type {
  GradebookRubricConfig,
  StudentKardexData,
  StudentCohortSummary,
  RubricScoreDetail,
  AcademicMilestone,
} from '../types/academicGradebook';
import type { AdminProfileRow } from '../types/admin';
import type { Profile } from '../types/database';

const KEY_LOCAL_RUBRICS = 'neurosafe_gradebook_rubric_config';

export const DEFAULT_RUBRIC_CONFIG: GradebookRubricConfig = {
  id: 'default_rubric_2026',
  title: 'Criterios de Evaluación Oficial COMEFYR 2026',
  minPassingGrade: 80,
  rubrics: [
    {
      id: 'exams',
      name: 'Exámenes y Quizzes Teóricos',
      weight: 30,
      description: 'Promedio de evaluaciones formativas y simulaciones clínicas',
      enabled: true,
    },
    {
      id: 'assignments',
      name: 'Tareas y Casos Prácticos',
      weight: 30,
      description: 'Reportes EMG, análisis de trazados y casos clínicos evaluados',
      enabled: true,
    },
    {
      id: 'attendance',
      name: 'Asistencia a Clases y Talleres',
      weight: 20,
      description: 'Puntualidad y asistencia a sesiones síncronas en vivo',
      enabled: true,
    },
    {
      id: 'curriculum',
      name: 'Avance Curricular en Plataforma',
      weight: 20,
      description: 'Checklist de temas vistos y completados en el temario general',
      enabled: true,
    },
  ],
  updated_at: new Date().toISOString(),
};

// ─── Configuración de Rúbricas (Personalizable por Maestro/Admin) ─────────────

export async function getGradebookRubrics(): Promise<GradebookRubricConfig> {
  // 1. Supabase (solo si la tabla no está marcada como ausente)
  if (!isTableMissingInSupabase('academic_rubric_configs')) {
    try {
      const { data, error, status } = await (supabase.from as any)('academic_rubric_configs')
        .select('*')
        .eq('id', 'default_rubric_2026')
        .maybeSingle();

      if (status === 404 || error) {
        markTableAsMissingInSupabase('academic_rubric_configs');
      } else if (data && data.rubrics) {
        return data as GradebookRubricConfig;
      }
    } catch {
      markTableAsMissingInSupabase('academic_rubric_configs');
    }
  }

  // 2. LocalStorage
  try {
    const raw = localStorage.getItem(KEY_LOCAL_RUBRICS);
    if (raw) {
      const parsed: GradebookRubricConfig = JSON.parse(raw);
      if (parsed.rubrics && parsed.rubrics.length > 0) return parsed;
    }
  } catch {}

  return DEFAULT_RUBRIC_CONFIG;
}

export async function saveGradebookRubrics(config: GradebookRubricConfig): Promise<void> {
  const updated: GradebookRubricConfig = {
    ...config,
    updated_at: new Date().toISOString(),
  };

  // 1. Local
  try {
    localStorage.setItem(KEY_LOCAL_RUBRICS, JSON.stringify(updated));
  } catch (e) {
    console.warn('[gradebookService] Error saving local rubrics:', e);
  }

  // 2. Supabase
  if (!isTableMissingInSupabase('academic_rubric_configs')) {
    try {
      const { error, status } = await (supabase.from as any)('academic_rubric_configs').upsert({
        id: updated.id,
        title: updated.title,
        min_passing_grade: updated.minPassingGrade,
        rubrics: updated.rubrics,
        updated_at: updated.updated_at,
      });
      if (status === 404 || error) {
        markTableAsMissingInSupabase('academic_rubric_configs');
      }
    } catch {
      markTableAsMissingInSupabase('academic_rubric_configs');
    }
  }
}

// ─── Motor de Cálculo de Kardex Académico Oficial por Alumno ──────────────────

export async function calculateStudentKardex(
  studentId: string,
  providedProfile?: Profile | AdminProfileRow | null,
  providedRubrics?: GradebookRubricConfig,
  providedMilestones?: AcademicMilestone[]
): Promise<StudentKardexData> {
  const rubricConfig = providedRubrics || (await getGradebookRubrics());

  // 1. Perfil del Alumno
  let profile = providedProfile as any;
  if (!profile) {
    try {
      const { data } = await supabase.from('profiles').select('*').eq('id', studentId).single();
      profile = data;
    } catch {}
  }

  const studentName = profile?.display_name || 'Médico Cursista';
  const email = profile?.email || '';
  const institution = profile?.institution || 'Sede no registrada';
  const residencyYear = profile?.residency_year || 'Residente';
  const specialty = profile?.specialty || 'Medicina de Rehabilitación';
  const cedula = profile?.cedula_profesional || 'Por registrar';
  const cedulaVerified = Boolean(profile?.cedula_verified);
  const avatarUrl = profile?.avatar_url || null;

  // 2. Temas Completados y Progreso Curricular
  const completedTopicsSet = await fetchStudentCompletedTopics(studentId).catch(() => new Set<string>());
  const moduleProgressList = await getMyProgressByModule(studentId).catch(() => []);
  const metrics = calculateStudentMetrics(studentId, moduleProgressList, completedTopicsSet);

  const modulesBreakdown = allModules.map((m) => {
    const tids = getAllTopicIds(m.topics);
    const completed = tids.filter((id) => completedTopicsSet.has(id)).length;
    return {
      moduleId: m.id,
      moduleTitle: m.title,
      total: tids.length,
      completed,
      pct: tids.length > 0 ? Math.round((completed / tids.length) * 100) : 0,
    };
  });

  // 3. Evaluaciones Teóricas (Exámenes y Quizzes)
  const rawAttempts = await getMyAttempts(studentId, 100).catch(() => []);
  const examDetails = rawAttempts.map((att) => ({
    attemptId: att.id,
    title: att.topic_id ? `Evaluación: ${att.topic_id}` : 'Examen de Módulo',
    date: att.completed_at ? att.completed_at.slice(0, 10) : new Date().toISOString().slice(0, 10),
    score: att.score,
    passed: att.passed,
    moduleId: att.module_id,
  }));

  const examAverage =
    examDetails.length > 0
      ? Math.round(examDetails.reduce((sum, e) => sum + e.score, 0) / examDetails.length)
      : 85; // Calificación base estimada si aún no completa quizzes para la cohorte

  // 4. Tareas y Casos Prácticos
  const rawAssignments = await getStudentAssignments(studentId).catch(() => []);
  const gradedAssignments = rawAssignments.filter((a) => a.status === 'approved' && typeof a.grade === 'number');

  const assignmentDetails = rawAssignments.map((a) => ({
    assignmentId: a.id,
    title: a.title,
    type: a.type,
    dueDate: a.due_date ? a.due_date.slice(0, 10) : '',
    submittedAt: a.submitted_at,
    grade: a.grade,
    feedback: a.feedback,
    status: a.status,
  }));

  let assignmentAverage = 90;
  if (gradedAssignments.length > 0) {
    const sumGrades = gradedAssignments.reduce((acc, a) => acc + (a.grade || 0), 0);
    assignmentAverage = Math.round(sumGrades / gradedAssignments.length);
  } else if (rawAssignments.length > 0) {
    const submittedCount = rawAssignments.filter((a) => a.status === 'submitted' || a.status === 'approved').length;
    assignmentAverage = Math.round((submittedCount / rawAssignments.length) * 100);
  }

  // 5. Asistencias a Clases y Talleres
  let eligibleSessionsCount = 0;
  try {
    const workshops = await getWorkshops();
    const nowStr = new Date().toISOString();
    eligibleSessionsCount = workshops.filter((w) =>
      (w.counts_for_kardex ?? true) &&
      (w.status === 'completed' || w.attendance_closed || (w.scheduled_at && w.scheduled_at <= nowStr))
    ).length;
  } catch {
    // fallback
  }

  const attendanceMetrics = await calculateStudentAttendanceMetrics(studentId, {
    eligibleSessionsCount,
  });

  // 6. Auditoría de Hitos de Calendarización
  const milestoneAudits = await getStudentMilestoneAudits(studentId, completedTopicsSet, providedMilestones);

  // 7. Cálculo Ponderado de Rubros según Configuración
  const rubricsMap = new Map(rubricConfig.rubrics.map((r) => [r.id, r]));

  // Raw scores por rubro (0 - 100)
  const examsRubric = rubricsMap.get('exams') || { weight: 30, name: 'Exámenes', enabled: true };
  const assignmentsRubric = rubricsMap.get('assignments') || { weight: 30, name: 'Tareas', enabled: true };
  const attendanceRubric = rubricsMap.get('attendance') || { weight: 20, name: 'Asistencia', enabled: true };
  const curriculumRubric = rubricsMap.get('curriculum') || { weight: 20, name: 'Avance Temario', enabled: true };

  const rawExamsScore = examAverage;
  const rawAssignmentsScore = assignmentAverage;
  const rawAttendanceScore = attendanceMetrics.attendancePct;
  const rawCurriculumScore = metrics.overallProgressPct;

  const weightedExams = Math.round(((rawExamsScore * examsRubric.weight) / 100) * 10) / 10;
  const weightedAssignments = Math.round(((rawAssignmentsScore * assignmentsRubric.weight) / 100) * 10) / 10;
  const weightedAttendance = Math.round(((rawAttendanceScore * attendanceRubric.weight) / 100) * 10) / 10;
  const weightedCurriculum = Math.round(((rawCurriculumScore * curriculumRubric.weight) / 100) * 10) / 10;

  const finalGrade = Math.min(
    100,
    Math.round((weightedExams + weightedAssignments + weightedAttendance + weightedCurriculum) * 10) / 10
  );
  const finalGradeScale10 = Math.round((finalGrade / 10) * 10) / 10;
  const isPassing = finalGrade >= rubricConfig.minPassingGrade;

  let status: 'accredited_honors' | 'accredited' | 'not_accredited' = 'not_accredited';
  let statusLabel = 'NO ACREDITADO (EN REGULARIZACIÓN)';

  if (isPassing) {
    if (finalGrade >= 95) {
      status = 'accredited_honors';
      statusLabel = 'ACREDITADO CON MENCIÓN HONORÍFICA';
    } else {
      status = 'accredited';
      statusLabel = 'ACREDITADO SATISFACTORIAMENTE';
    }
  }

  const rubricBreakdown: RubricScoreDetail[] = [
    {
      rubricId: 'exams',
      name: examsRubric.name,
      weight: examsRubric.weight,
      rawScore: rawExamsScore,
      weightedScore: weightedExams,
      itemCount: examDetails.length,
      summary: `${examDetails.length} evaluaciones realizadas (Promedio: ${rawExamsScore}%)`,
    },
    {
      rubricId: 'assignments',
      name: assignmentsRubric.name,
      weight: assignmentsRubric.weight,
      rawScore: rawAssignmentsScore,
      weightedScore: weightedAssignments,
      itemCount: rawAssignments.length,
      summary: `${rawAssignments.length} tareas asignadas (Promedio: ${rawAssignmentsScore}%)`,
    },
    {
      rubricId: 'attendance',
      name: attendanceRubric.name,
      weight: attendanceRubric.weight,
      rawScore: rawAttendanceScore,
      weightedScore: weightedAttendance,
      itemCount: attendanceMetrics.totalSessions,
      summary: attendanceMetrics.hasAuditedSessions
        ? `${attendanceMetrics.attendedSessions}/${attendanceMetrics.totalSessions} asistencias (${rawAttendanceScore}%)`
        : 'Sin sesiones auditadas a la fecha (100% neutro)',
    },
    {
      rubricId: 'curriculum',
      name: curriculumRubric.name,
      weight: curriculumRubric.weight,
      rawScore: rawCurriculumScore,
      weightedScore: weightedCurriculum,
      itemCount: metrics.totalCompletedCurriculumTopics,
      summary: `${metrics.totalCompletedCurriculumTopics}/${metrics.totalCurriculumTopics} temas completados (${rawCurriculumScore}%)`,
    },
  ];

  const folio = `KDX-COMEFYR-2026-${studentId.replace(/-/g, '').slice(0, 8).toUpperCase()}`;

  return {
    studentId,
    studentName,
    email,
    institution,
    residencyYear,
    specialty,
    cedula,
    cedulaVerified,
    avatarUrl,
    folio,
    generationDate: new Date().toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }),
    finalGrade,
    finalGradeScale10,
    isPassing,
    status,
    statusLabel,
    cmeCreditsEarned: metrics.cmeCreditsEarned,
    maxCmeCredits: metrics.maxCmeCredits,
    academicHoursEarned: metrics.academicHoursEarned,
    maxAcademicHours: metrics.maxAcademicHours,
    rubricBreakdown,
    examDetails,
    assignmentDetails,
    attendanceSummary: {
      totalSessions: attendanceMetrics.totalSessions,
      attendedSessions: attendanceMetrics.attendedSessions,
      lateSessions: attendanceMetrics.lateSessions,
      absentSessions: attendanceMetrics.absentSessions,
      excusedSessions: attendanceMetrics.excusedSessions,
      attendancePct: attendanceMetrics.attendancePct,
      sessions: attendanceMetrics.records.map((r) => ({
        id: r.id,
        title: r.session_title,
        date: r.session_date,
        status: r.status,
        notes: r.notes,
      })),
    },
    curriculumSummary: {
      totalTopics: metrics.totalCurriculumTopics,
      completedTopics: metrics.totalCompletedCurriculumTopics,
      progressPct: metrics.overallProgressPct,
      modulesBreakdown,
    },
    milestoneAudits,
  };
}

// ─── Resumen Agregado para la Lista General de Alumnos ────────────────────────

export async function getCohortAcademicSummaries(
  profiles: AdminProfileRow[]
): Promise<Map<string, StudentCohortSummary>> {
  const map = new Map<string, StudentCohortSummary>();
  const [rubrics, milestones] = await Promise.all([
    getGradebookRubrics(),
    getAcademicMilestones(),
  ]);

  await Promise.all(
    profiles.map(async (p) => {
      try {
        const kardex = await calculateStudentKardex(p.id, p, rubrics, milestones);

        // Evaluar estado de cumplimiento con el calendario
        const now = new Date();
        const overdueMilestones = kardex.milestoneAudits.filter(
          (m) => new Date(m.dueDate) < now && m.progressPct < 70
        );

        let complianceStatus: 'on_track' | 'at_risk' | 'lagging' = 'on_track';
        let complianceLabel = 'Al corriente';

        if (overdueMilestones.length >= 2) {
          complianceStatus = 'lagging';
          complianceLabel = 'Rezagado en calendario';
        } else if (overdueMilestones.length === 1) {
          complianceStatus = 'at_risk';
          complianceLabel = 'En riesgo de retraso';
        }

        const summary: StudentCohortSummary = {
          studentId: p.id,
          overallProgressPct: kardex.curriculumSummary.progressPct,
          completedTopicsCount: kardex.curriculumSummary.completedTopics,
          totalTopicsCount: kardex.curriculumSummary.totalTopics,
          examAverage: kardex.rubricBreakdown.find((r) => r.rubricId === 'exams')?.rawScore ?? 0,
          examCount: kardex.examDetails.length,
          assignmentsSubmitted: kardex.assignmentDetails.filter((a) => a.status === 'submitted' || a.status === 'approved').length,
          assignmentsTotal: kardex.assignmentDetails.length,
          assignmentsAvgGrade: kardex.rubricBreakdown.find((r) => r.rubricId === 'assignments')?.rawScore ?? 0,
          attendancePct: kardex.attendanceSummary.attendancePct,
          attendedSessions: kardex.attendanceSummary.attendedSessions,
          totalSessions: kardex.attendanceSummary.totalSessions,
          finalWeightedGrade: kardex.finalGrade,
          complianceStatus,
          complianceLabel,
        };

        map.set(p.id, summary);
      } catch (e) {
        console.warn(`[gradebookService] Error summarizing student ${p.id}:`, e);
      }
    })
  );

  return map;
}
