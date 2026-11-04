import { Link } from 'react-router-dom';
import {
  AlertTriangle,
  Award,
  BarChart3,
  CheckCircle2,
  ChevronRight,
  ClipboardList,
  FileCheck,
  GraduationCap,
  UserCheck,
} from 'lucide-react';
import type { StudentKardexData, RubricKey } from '../../types/academicGradebook';
import type { calculateStudentMetrics, CertificationRequirements } from '../../services/studentService';
import { RUBRIC_TONE } from '../admin/calendar/calendarTheme';

const BAR: Record<RubricKey, string> = {
  exams: 'bg-indigo-500',
  assignments: 'bg-teal-500',
  attendance: 'bg-rose-500',
  curriculum: 'bg-violet-500',
};

const TAB_FOR_BUCKET: Record<RubricKey, 'quizzes' | 'assignments' | 'modules'> = {
  exams: 'quizzes',
  assignments: 'assignments',
  attendance: 'modules',
  curriculum: 'modules',
};

export function StudentPerformancePanel({
  kardex,
  minPassingGrade = 80,
  metrics,
  certRequirements,
  attemptsCount = 0,
  onOpenKardex,
  onSelectTab,
}: {
  kardex: StudentKardexData | null;
  minPassingGrade?: number;
  metrics?: ReturnType<typeof calculateStudentMetrics> | null;
  certRequirements?: CertificationRequirements | null;
  attemptsCount?: number;
  onOpenKardex: () => void;
  onSelectTab: (tab: 'quizzes' | 'assignments' | 'modules' | 'certificate') => void;
}) {
  if (!kardex) {
    return (
      <div className="py-16 text-center text-sm text-slate-500">
        Calculando tu promedio Capa A…
      </div>
    );
  }

  const missingNames = kardex.rubricBreakdown
    .filter((bucket) => kardex.missingBuckets.includes(bucket.rubricId))
    .map((bucket) => bucket.name);
  const pendingAssignments = kardex.assignmentDetails.filter(
    (item) => item.status === 'pending' || item.status === 'submitted' || item.status === 'needs_revision'
  ).length;
  const firstRiskReason = kardex.riskReasons?.[0];
  const unmarkedSessions = Math.max(
    0,
    kardex.attendanceSummary.totalSessions - kardex.attendanceSummary.sessions.length
  );

  return (
    <div className="space-y-6">
      {/* ─── Resumen Ejecutivo de Métricas (Reubicado en Desempeño para evitar fatiga en inicio) ─── */}
      {metrics && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
          {/* 1. Progreso Global */}
          <div className="p-3 sm:p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
            <div className="flex items-center justify-between gap-1 mb-1">
              <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 truncate">
                Progreso
              </span>
              <BarChart3 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-600 dark:text-blue-400 shrink-0" />
            </div>
            <div className="flex items-baseline gap-1 mb-1.5">
              <span className="text-xl sm:text-2xl font-extrabold font-mono tabular-nums text-slate-900 dark:text-white leading-none">
                {metrics?.overallProgressPct || 0}%
              </span>
              <span className="hidden sm:inline text-[11px] text-slate-500 dark:text-slate-400">
                del currículo
              </span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden mb-1">
              <div
                className="bg-blue-600 h-full rounded-full transition-all duration-500"
                style={{ width: `${metrics?.overallProgressPct || 0}%` }}
              />
            </div>
            <p className="text-[10px] sm:text-xs font-mono tabular-nums text-slate-500 dark:text-slate-400 truncate">
              {metrics?.totalCompletedCurriculumTopics || 0}/{metrics?.totalCurriculumTopics || 0} lecciones
            </p>
          </div>

          {/* 2. Horas CME */}
          <div className="p-3 sm:p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
            <div className="flex items-center justify-between gap-1 mb-1">
              <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 truncate">
                Horas CME
              </span>
              <Award className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
            </div>
            <div className="flex items-baseline gap-1 mb-1.5">
              <span className="text-xl sm:text-2xl font-extrabold font-mono tabular-nums text-indigo-600 dark:text-indigo-400 leading-none">
                {metrics?.cmeCreditsEarned || 0}
              </span>
              <span className="text-[10px] sm:text-xs font-mono tabular-nums text-slate-500 dark:text-slate-400">
                /{metrics?.maxCmeCredits || 40}
              </span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden mb-1">
              <div
                className="bg-indigo-600 h-full rounded-full transition-all duration-500"
                style={{
                  width: `${Math.min(100, Math.round(((metrics?.cmeCreditsEarned || 0) / (metrics?.maxCmeCredits || 40)) * 100))}%`,
                }}
              />
            </div>
            <p className="text-[10px] sm:text-xs font-mono tabular-nums text-slate-500 dark:text-slate-400 truncate">
              {metrics?.academicHoursEarned || 0}/{metrics?.maxAcademicHours || 80}h lectivas
            </p>
          </div>

          {/* 3. Evaluaciones Quizzes */}
          <div className="p-3 sm:p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
            <div className="flex items-center justify-between gap-1 mb-1">
              <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 truncate">
                Quizzes
              </span>
              <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            </div>
            <div className="flex items-baseline gap-1 mb-1.5">
              <span className="text-xl sm:text-2xl font-extrabold font-mono tabular-nums text-emerald-600 dark:text-emerald-400 leading-none">
                {certRequirements?.quizzesPassedCount || 0}
              </span>
              <span className="text-[10px] sm:text-xs font-mono tabular-nums text-slate-500 dark:text-slate-400 truncate">
                ({certRequirements?.averageScore || 0}%)
              </span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden mb-1">
              <div
                className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                style={{
                  width: `${Math.min(100, Math.round(((certRequirements?.quizzesPassedCount || 0) / Math.max(1, certRequirements?.totalQuizzesAvailable || 13)) * 100))}%`,
                }}
              />
            </div>
            <p className="text-[10px] sm:text-xs font-mono tabular-nums text-slate-500 dark:text-slate-400 truncate">
              {attemptsCount} intentos registrados
            </p>
          </div>

          {/* 4. Kardex Capa A */}
          <button
            type="button"
            onClick={onOpenKardex}
            className="p-3 sm:p-4 rounded-2xl border border-indigo-200 dark:border-indigo-800/80 bg-indigo-50/50 dark:bg-indigo-950/30 shadow-xs hover:border-indigo-400 transition text-left cursor-pointer"
          >
            <div className="flex items-center justify-between gap-1 mb-1">
              <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-indigo-700 dark:text-indigo-300 truncate">
                Kardex Capa A
              </span>
              <FileCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
            </div>
            <div className="flex items-baseline gap-1 mb-1.5">
              <span className="text-xl sm:text-2xl font-extrabold font-mono tabular-nums text-slate-900 dark:text-white leading-none">
                {kardex?.finalGrade ?? '—'}
              </span>
              <span className="text-xs text-slate-500 font-mono tabular-nums">/ 100</span>
            </div>
            <p className="text-[10px] sm:text-xs text-indigo-600 dark:text-indigo-300 font-semibold truncate flex items-center justify-between">
              <span>{kardex?.isPassing ? 'Acreditado' : 'En proceso'}</span>
              <ChevronRight className="w-3.5 h-3.5 inline" />
            </p>
          </button>
        </div>
      )}
      <section className="p-5 sm:p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <p className="text-[10px] font-black uppercase tracking-wider text-indigo-500">
              Cómo se evalúa tu diplomado
            </p>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-4xl sm:text-5xl font-black text-slate-900 dark:text-white">
                {kardex.finalGrade}
              </span>
              <span className="text-sm font-bold text-slate-400">/ 100 · {kardex.finalGradeScale10} de 10</span>
            </div>
            <p className="text-xs text-slate-500 mt-2 max-w-xl">
              Un solo número: exámenes 30 + tareas 30 + asistencia 20 + temario 20. Cada cubeta es el promedio de lo
              que ya calificaron; no hay pesos por evento.
            </p>
          </div>
          <div className="text-left sm:text-right space-y-2">
            <span
              className={`inline-flex px-2.5 py-1 rounded-full text-[11px] font-black ${
                kardex.isOfficial
                  ? kardex.isPassing
                    ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300'
                    : 'bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300'
                  : 'bg-amber-50 text-amber-800 dark:bg-amber-950/40 dark:text-amber-200'
              }`}
            >
              {kardex.isOfficial ? 'Dictamen oficial' : 'Promedio en curso'}
            </span>
            <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">
              {kardex.pointsToPass != null && kardex.pointsToPass > 0
                ? `Te faltan ${kardex.pointsToPass} puntos para acreditar (${minPassingGrade}).`
                : kardex.isOfficial
                  ? kardex.statusLabel
                  : `Ya alcanzas ${minPassingGrade} en lo calificado; falta el dictamen oficial.`}
            </p>
          </div>
        </div>

        {!kardex.isOfficial && missingNames.length > 0 ? (
          <p className="mt-4 text-xs font-medium text-amber-800 dark:text-amber-200 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-2xl px-3 py-2 inline-flex items-start gap-2">
            <AlertTriangle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
            Falta calificar {missingNames.join(' y ')} para el dictamen oficial. El número de arriba solo usa las
            cubetas con evidencia (pesos renormalizados a 100).
          </p>
        ) : null}
      </section>

      <section className="p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-4">
        <h2 className="text-sm font-black text-slate-900 dark:text-white">Cuánto vale cada calificación</h2>
        <ul className="space-y-4">
          {kardex.rubricBreakdown.map((bucket) => (
            <li key={bucket.rubricId}>
              <div className="flex items-center justify-between gap-3 text-xs">
                <span className={`font-bold ${RUBRIC_TONE[bucket.rubricId]}`}>{bucket.name}</span>
                <span className="font-black text-slate-900 dark:text-white">vale {bucket.weight} de 100</span>
              </div>
              <div className="mt-1.5 h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <div
                  className={`h-full rounded-full ${BAR[bucket.rubricId]} ${bucket.hasEvidence ? '' : 'opacity-30'}`}
                  style={{ width: `${bucket.hasEvidence ? Math.min(100, bucket.rawScore ?? 0) : 0}%` }}
                />
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                {bucket.hasEvidence && bucket.rawScore != null
                  ? `${bucket.rawScore} × ${bucket.weight}% = ${bucket.weightedScore} puntos de ${bucket.weight}. ${bucket.summary}`
                  : bucket.summary}
              </p>
              <button
                type="button"
                onClick={() => onSelectTab(TAB_FOR_BUCKET[bucket.rubricId])}
                className="mt-1 text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                Ver detalle
              </button>
            </li>
          ))}
        </ul>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-3">
          <h3 className="text-sm font-black text-slate-900 dark:text-white inline-flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-rose-500" />
            Asistencia (20%)
          </h3>
          {kardex.attendanceSummary.totalSessions === 0 ? (
            <p className="text-xs text-slate-500">Aún no hay clases que cuenten para el kárdex.</p>
          ) : (
            <>
              <p className="text-xs text-slate-600 dark:text-slate-300">
                {kardex.attendanceSummary.attendedSessions} presentes · {kardex.attendanceSummary.lateSessions} retardos
                · {kardex.attendanceSummary.absentSessions} faltas · {kardex.attendanceSummary.excusedSessions}{' '}
                justificadas. Un retardo vale 80% de esa sesión.
              </p>
              <ul className="space-y-1.5 max-h-48 overflow-y-auto">
                {kardex.attendanceSummary.sessions.map((session) => (
                  <li key={session.id} className="flex justify-between gap-2 text-[11px]">
                    <span className="truncate text-slate-700 dark:text-slate-200">{session.title}</span>
                    <span className="shrink-0 font-bold text-slate-500">
                      {session.status === 'present'
                        ? 'Presente'
                        : session.status === 'late'
                          ? 'Retardo'
                          : session.status === 'excused'
                            ? 'Justificada'
                            : 'Falta'}
                    </span>
                  </li>
                ))}
              </ul>
              <Link to="/talleres" className="text-[11px] font-bold text-indigo-600 hover:underline">
                Ver talleres
              </Link>
            </>
          )}
        </div>

        <div className="p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-3">
          <h3 className="text-sm font-black text-slate-900 dark:text-white">Qué falta para acreditar</h3>
          <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
            {pendingAssignments > 0 ? (
              <li className="flex items-start gap-2">
                <ClipboardList className="w-3.5 h-3.5 mt-0.5 text-teal-500" />
                <button type="button" className="text-left font-semibold hover:underline" onClick={() => onSelectTab('assignments')}>
                  {pendingAssignments} tarea(s) o caso(s) sin nota final.
                </button>
              </li>
            ) : null}
            {unmarkedSessions > 0 ? (
              <li className="flex items-start gap-2">
                <UserCheck className="w-3.5 h-3.5 mt-0.5 text-rose-500" />
                {unmarkedSessions} sesión(es) que cuentan y aún no tienen pase de lista.
              </li>
            ) : null}
            {firstRiskReason ? (
              <li className="flex items-start gap-2">
                <GraduationCap className="w-3.5 h-3.5 mt-0.5 text-violet-500" />
                <button type="button" className="text-left font-semibold hover:underline" onClick={() => onSelectTab('modules')}>
                  {firstRiskReason}
                </button>
              </li>
            ) : null}
            {kardex.missingBuckets.includes('exams') ? (
              <li className="flex items-start gap-2">
                <ClipboardList className="w-3.5 h-3.5 mt-0.5 text-indigo-500" />
                <button type="button" className="text-left font-semibold hover:underline" onClick={() => onSelectTab('quizzes')}>
                  Presenta al menos un quiz o examen para abrir la cubeta de 30%.
                </button>
              </li>
            ) : null}
            {kardex.missingBuckets.length === 0 && pendingAssignments === 0 && !firstRiskReason ? (
              <li className="inline-flex items-center gap-2 text-emerald-700 dark:text-emerald-300 font-semibold">
                <CheckCircle2 className="w-4 h-4" />
                No hay huecos operativos. El dictamen usa el promedio Capa A.
              </li>
            ) : null}
          </ul>
        </div>
      </section>

      <section className="p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <p className="text-sm font-black text-slate-900 dark:text-white">Constancia</p>
          <p className="text-xs text-slate-500 mt-0.5">
            Se emite solo con dictamen oficial acreditado y cédula verificada. El temario ya está dentro del 20%; no hay
            otro umbral de 95%.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={onSelectTab.bind(null, 'certificate')}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold"
          >
            <FileCheck className="w-3.5 h-3.5" />
            Ir a Constancia
          </button>
          <button
            type="button"
            onClick={onOpenKardex}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200"
          >
            Imprimir kárdex
          </button>
        </div>
      </section>
    </div>
  );
}
