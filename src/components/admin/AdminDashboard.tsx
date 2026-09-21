import { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  FileCheck,
  BookOpen,
  CheckCircle,
  CheckCircle2,
  AlertCircle,
  Video,
  Shield,
  Stethoscope,
  Lock,
  Unlock,
  GraduationCap,
  Sparkles,
  ArrowRight,
  ExternalLink,
  Check,
  Award,
  Activity,
  Layers,
  Clock,
  ClipboardList,
  RotateCcw,
  Sliders,
  Calendar,
  AlertTriangle,
  FileQuestion,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  MessageSquare,
  Search,
  UserCheck,
} from 'lucide-react';
import { AdminLayout } from './AdminLayout';
import {
  getAdminStats,
  getAuditLog,
  getProfilesByIds,
  getAdminProfiles,
  verifyPhysicianEnrollment,
} from '../../services/editorialService';
import { getModuleAccessMap } from '../../services/courseService';
import {
  getTeacherPendingReviewItems,
  approveExamRetake,
  rejectExamRetake,
} from '../../services/studentPlanService';
import { getCohortAcademicSummaries } from '../../services/gradebookService';
import { filterGradeableStudents } from '../../utils/adminUtils';
import { allModules } from '../../content/modules';
import { useAuth } from '../../contexts/AuthProvider';
import { BRAND } from '../../config/brand';
import type { AdminStats, AuditLogEntry, AdminProfileRow } from '../../types/admin';
import type { ModuleAccess } from '../../types/database';
import type { TeacherPendingReviewItem } from '../../types/studentPlan';
import type { StudentCohortSummary } from '../../types/academicGradebook';
import type { CalendarItem } from '../../types/academicCalendar';
import { loadAcademicCalendarFeed } from '../../services/academicCalendarService';
import { CalendarThisWeekStrip } from './calendar/CalendarThisWeekStrip';

// Teacher Modals
import TeacherQuickGradeModal from './TeacherQuickGradeModal';
import AssignExamModal from './AssignExamModal';
import { AssignClinicalCaseModal } from './AssignClinicalCaseModal';
import AttendanceTrackerModal from './AttendanceTrackerModal';
import GradebookConfigModal from './GradebookConfigModal';
import StudentKardexModal from './StudentKardexModal';
import { CreateLiveClassModal } from './CreateLiveClassModal';

export default function AdminDashboard() {
  const { user, profile, isAdmin } = useAuth();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [audit, setAudit] = useState<AuditLogEntry[]>([]);
  const [actorNames, setActorNames] = useState<Map<string, string>>(new Map());
  const [pendingDoctors, setPendingDoctors] = useState<AdminProfileRow[]>([]);
  const [allProfiles, setAllProfiles] = useState<AdminProfileRow[]>([]);
  const [cohortSummaries, setCohortSummaries] = useState<Map<string, StudentCohortSummary>>(new Map());
  const [moduleAccessMap, setModuleAccessMap] = useState<Map<string, ModuleAccess>>(new Map());

  // Teacher Inbox & Retakes
  const [pendingSubmissions, setPendingSubmissions] = useState<TeacherPendingReviewItem[]>([]);
  const [pendingRetakes, setPendingRetakes] = useState<TeacherPendingReviewItem[]>([]);
  const [gradingItem, setGradingItem] = useState<TeacherPendingReviewItem | null>(null);

  // Modals state
  const [showAssignExamModal, setShowAssignExamModal] = useState(false);
  const [showAssignCaseModal, setShowAssignCaseModal] = useState(false);
  const [showAttendanceModal, setShowAttendanceModal] = useState(false);
  const [showRubricsModal, setShowRubricsModal] = useState(false);
  const [showCreateLiveClassModal, setShowCreateLiveClassModal] = useState(false);
  const [kardexStudent, setKardexStudent] = useState<AdminProfileRow | null>(null);
  const [weekItems, setWeekItems] = useState<CalendarItem[]>([]);
  const [calendarWarning, setCalendarWarning] = useState<string | null>(null);

  // Operation states
  const [activeTab, setActiveTab] = useState<'teacher' | 'operations'>('teacher');
  const [isAuditExpanded, setIsAuditExpanded] = useState(false); // Colapsado por default
  const [approvingId, setApprovingId] = useState<string | null>(null);
  const [retakeActionId, setRetakeActionId] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const loadData = async (): Promise<{ calendarWarning: string | null }> => {
    let nextCalendarWarning: string | null = null;
    try {
      const [statsData, accessMap, pendingUsers, allActiveProfiles] = await Promise.all([
        getAdminStats().catch(() => null),
        getModuleAccessMap().catch(() => new Map()),
        getAdminProfiles(false, 'enrollment_pending').catch(() => []),
        getAdminProfiles(false, 'all').catch(() => []),
      ]);
      setStats(statsData);
      setModuleAccessMap(accessMap);
      setPendingDoctors(pendingUsers.slice(0, 4));

      // Filtrar únicamente médicos cursistas/alumnos (excluyendo profesores, comités y directores)
      const studentsOnly = filterGradeableStudents(allActiveProfiles, user?.id);
      setAllProfiles(studentsOnly);

      const calendarFeed = await loadAcademicCalendarFeed(studentsOnly).catch((error) => ({
        items: [] as CalendarItem[],
        warnings: [
          error instanceof Error && error.message
            ? error.message
            : 'No se pudieron cargar los talleres',
        ],
      }));
      setWeekItems(calendarFeed.items);
      nextCalendarWarning =
        calendarFeed.warnings.find((warning) => warning.toLowerCase().includes('talleres')) ??
        calendarFeed.warnings[0] ??
        null;
      setCalendarWarning(nextCalendarWarning);

      // Cargar bandeja docente de entregas y solicitudes de reintento de los alumnos
      const { pendingSubmissions: subs, pendingRetakes: rets } =
        await getTeacherPendingReviewItems(studentsOnly);
      setPendingSubmissions(subs);
      setPendingRetakes(rets);

      // Cargar resúmenes académicos para alertas de riesgo (únicamente alumnos reales)
      const summaries = await getCohortAcademicSummaries(studentsOnly);
      setCohortSummaries(summaries);

      // Bitácora de auditoría
      const entries = await getAuditLog(8);
      setAudit(entries);
      const ids = entries.map((e) => e.actor_id).filter(Boolean) as string[];
      if (ids.length > 0) {
        const profs = await getProfilesByIds(ids);
        const names = new Map<string, string>();
        profs.forEach((p, id) => names.set(id, p.display_name));
        setActorNames(names);
      }
    } catch (e) {
      console.error('[AdminDashboard] Error loading dashboard:', e);
    } finally {
      setLoading(false);
    }
    return { calendarWarning: nextCalendarWarning };
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleQuickApprove = async (physicianId: string) => {
    setApprovingId(physicianId);
    setSuccessMessage(null);
    try {
      await verifyPhysicianEnrollment(physicianId);
      setSuccessMessage('¡Médico aprobado y acreditado exitosamente!');
      await loadData();
    } catch (err) {
      console.error(err);
      alert('Error al aprobar médico');
    } finally {
      setApprovingId(null);
      setTimeout(() => setSuccessMessage(null), 4000);
    }
  };

  const handleApproveRetake = async (item: TeacherPendingReviewItem) => {
    setRetakeActionId(item.assignment.id);
    try {
      await approveExamRetake(
        item.assignment.id,
        item.assignment.student_id,
        profile?.display_name || 'Profesor Titular',
        'Reintento autorizado por el Profesor Titular.'
      );
      setSuccessMessage('¡Solicitud de reintento aprobada! El alumno cuenta con 1 nuevo intento.');
      await loadData();
    } catch (err) {
      console.error(err);
      alert('Error al aprobar el reintento.');
    } finally {
      setRetakeActionId(null);
      setTimeout(() => setSuccessMessage(null), 4000);
    }
  };

  const handleRejectRetake = async (item: TeacherPendingReviewItem) => {
    const reason = window.prompt(
      'Indica el motivo del rechazo para notificar al médico cursista:',
      'Periodo de evaluaciones concluido o cupo de intentos alcanzado.'
    );
    if (!reason) return;

    setRetakeActionId(item.assignment.id);
    try {
      await rejectExamRetake(
        item.assignment.id,
        item.assignment.student_id,
        profile?.display_name || 'Profesor Titular',
        reason
      );
      setSuccessMessage('Solicitud de reintento rechazada con notificación al alumno.');
      await loadData();
    } catch (err) {
      console.error(err);
      alert('Error al rechazar el reintento.');
    } finally {
      setRetakeActionId(null);
      setTimeout(() => setSuccessMessage(null), 4000);
    }
  };

  // Alumnos que requieren atención o están en riesgo
  const atRiskStudents = useMemo(() => {
    return allProfiles
      .map((p) => {
        const summary = cohortSummaries.get(p.id);
        return { profile: p, summary };
      })
      .filter(({ summary }) => {
        if (!summary) return false;
        return (
          summary.complianceStatus === 'at_risk' ||
          summary.complianceStatus === 'lagging' ||
          summary.finalWeightedGrade < 70
        );
      });
  }, [allProfiles, cohortSummaries]);

  // Métricas agregadas de la cohorte
  const cohortGlobalStats = useMemo(() => {
    if (allProfiles.length === 0 || cohortSummaries.size === 0) {
      return { avgFinalGrade: 0, avgExamScore: 0, totalCasesSubmitted: 0 };
    }
    let totalGrade = 0;
    let totalExam = 0;
    let totalCases = 0;
    let count = 0;

    cohortSummaries.forEach((s) => {
      totalGrade += s.finalWeightedGrade;
      totalExam += s.examAverage ?? 0;
      totalCases += s.assignmentsSubmitted;
      count++;
    });

    return {
      avgFinalGrade: count > 0 ? Math.round(totalGrade / count) : 0,
      avgExamScore: count > 0 ? Math.round(totalExam / count) : 0,
      totalCasesSubmitted: totalCases,
    };
  }, [allProfiles, cohortSummaries]);

  const displayName = profile?.display_name || 'Prof. Dr. Marcos Yocupicio';

  return (
    <AdminLayout
      title="Panel de Dirección Académica"
      subtitle={`Supervisión docente, evaluación continua y gestión de la cohorte ${BRAND.name}.`}
    >
      {/* ── Executive Welcome Hero Banner ── */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-950 via-slate-900 to-blue-950 p-6 sm:p-8 text-white shadow-xl shadow-indigo-950/20 mb-6 border border-indigo-500/20">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              {BRAND.enableAccreditation ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-300 border border-blue-400/30">
                  <Award className="w-3.5 h-3.5" /> Avalado COMEFYR
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-300 border border-blue-400/30">
                  <Award className="w-3.5 h-3.5" /> Dirección Docente de Posgrado
                </span>
              )}
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                <Activity className="w-3.5 h-3.5" /> Ciclo Académico Activo
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight">
              Bienvenido, {displayName}
            </h2>
            <p className="text-sm text-indigo-200/80 max-w-xl mt-1 leading-relaxed">
              Panel unificado para el profesor titular: revisa tareas entregadas, autoriza reintentos de exámenes y asigna casos clínicos con un clic.
            </p>
          </div>

          {/* Teacher Duty Stats pill */}
          <div className="flex flex-wrap gap-2.5 shrink-0">
            <div className="p-3.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 flex items-center gap-4 text-left">
              <div>
                <span className="text-[10px] uppercase font-bold text-indigo-200 block">
                  Por Calificar
                </span>
                <span className="text-2xl font-black text-amber-300">
                  {pendingSubmissions.length}
                </span>
              </div>
              <div className="h-8 w-px bg-white/15" />
              <div>
                <span className="text-[10px] uppercase font-bold text-indigo-200 block">
                  Reintentos
                </span>
                <span className="text-2xl font-black text-cyan-300">
                  {pendingRetakes.length}
                </span>
              </div>
              <div className="h-8 w-px bg-white/15" />
              <div>
                <span className="text-[10px] uppercase font-bold text-indigo-200 block">
                  En Riesgo
                </span>
                <span className="text-2xl font-black text-rose-300">
                  {atRiskStudents.length}
                </span>
              </div>
              {isAdmin && (stats?.pending_course_enrollments ?? 0) > 0 && (
                <>
                  <div className="h-8 w-px bg-white/15" />
                  <Link to="/admin/admisiones" className="hover:opacity-85 transition">
                    <span className="text-[10px] uppercase font-bold text-amber-200 block flex items-center gap-1">
                      <Clock className="w-3 h-3 text-amber-300 animate-pulse" />
                      Lista Espera
                    </span>
                    <span className="text-2xl font-black text-amber-300">
                      {stats?.pending_course_enrollments}
                    </span>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Waitlist Alert Banner ── */}
      {isAdmin && (stats?.pending_course_enrollments ?? 0) > 0 && (
        <div className="mb-6 p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-amber-500/15 via-amber-500/5 to-transparent border border-amber-400/50 dark:border-amber-500/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-md shadow-amber-500/20">
              <Clock className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span>
                  {stats?.pending_course_enrollments}{' '}
                  {stats?.pending_course_enrollments === 1
                    ? 'médico en lista de espera de cursos'
                    : 'médicos en lista de espera de cursos'}
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-200 text-amber-900 dark:bg-amber-950 dark:text-amber-200">
                  Revisión requerida
                </span>
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                Hay solicitudes de admisión por orden cronológico pendientes de revisión y admisión por el profesor titular.
              </p>
            </div>
          </div>
          <Link
            to="/admin/admisiones"
            className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition shadow-sm shrink-0"
          >
            <span>Gestionar Admisiones</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}

      {/* ── Dual-Mode Navigation Tabs ── */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div className="inline-flex items-center p-1 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80">
          <button
            type="button"
            onClick={() => setActiveTab('teacher')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              activeTab === 'teacher'
                ? 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-md shadow-indigo-500/20'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <GraduationCap className="w-4 h-4" />
            <span>Panel Docente & Calificación</span>
            {(pendingSubmissions.length > 0 || pendingRetakes.length > 0) && (
              <span className="px-1.5 py-0.5 rounded-full text-[10px] font-black bg-amber-400 text-slate-950">
                {pendingSubmissions.length + pendingRetakes.length}
              </span>
            )}
          </button>

          {isAdmin ? (
          <button
            type="button"
            onClick={() => setActiveTab('operations')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              activeTab === 'operations'
                ? 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-md shadow-indigo-500/20'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Sliders className="w-4 h-4" />
            <span>Gestión Operativa del Sistema</span>
            {(pendingDoctors.length > 0 || (stats?.pending_course_enrollments ?? 0) > 0) && (
              <span className="px-1.5 py-0.5 rounded-full text-[10px] font-black bg-rose-500 text-white">
                {pendingDoctors.length + (stats?.pending_course_enrollments ?? 0)}
              </span>
            )}
          </button>
          ) : null}
        </div>

        {/* Global Link to Full Gradebook */}
        <Link
          to="/admin/alumnos"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
        >
          <ClipboardList className="w-3.5 h-3.5" />
          <span>Ver Libro de Calificaciones Completo (Gradebook) →</span>
        </Link>
      </div>

      {/* Success Notification Alert */}
      {successMessage && (
        <div className="mb-6 p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-sm flex items-center gap-2 shadow-xs">
          <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0" />
          <span className="font-medium">{successMessage}</span>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════════
          VISTA 1: PANEL DOCENTE & CALIFICACIÓN (MODO PROFESOR)
          ══════════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'teacher' && (
        <div className="space-y-8">
          <CalendarThisWeekStrip items={weekItems} warning={calendarWarning} />

          {/* Teacher Fast Action Bar */}
          <section className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-indigo-500" />
                  Acciones Rápidas del Profesor
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Asigna ejercicios clínicos, programa exámenes o registra asistencia con un solo clic.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">
              <Link
                to="/admin/calendario"
                className="flex flex-col items-center justify-center gap-2 p-3.5 rounded-2xl bg-violet-50 dark:bg-violet-950/40 border border-violet-200/80 dark:border-violet-900/60 hover:bg-violet-100 dark:hover:bg-violet-900/50 text-violet-800 dark:text-violet-200 transition group text-center cursor-pointer shadow-xs"
              >
                <div className="w-9 h-9 rounded-xl bg-violet-600 text-white flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                  <Calendar className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold leading-tight">Calendario académico</span>
              </Link>
              <button
                type="button"
                onClick={() => setShowCreateLiveClassModal(true)}
                className="flex flex-col items-center justify-center gap-2 p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200/80 dark:border-rose-900/60 hover:bg-rose-100 dark:hover:bg-rose-900/50 text-rose-800 dark:text-rose-200 transition group text-center cursor-pointer shadow-xs"
              >
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-rose-600 to-red-600 text-white flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                  <Video className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold leading-tight">Clase en Vivo / Grabación</span>
              </button>

              <button
                type="button"
                onClick={() => setShowAssignExamModal(true)}
                className="flex flex-col items-center justify-center gap-2 p-3.5 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200/80 dark:border-indigo-900/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 text-indigo-800 dark:text-indigo-200 transition group text-center cursor-pointer shadow-xs"
              >
                <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                  <FileQuestion className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold leading-tight">Asignar Examen</span>
              </button>

              <button
                type="button"
                onClick={() => setShowAssignCaseModal(true)}
                className="flex flex-col items-center justify-center gap-2 p-3.5 rounded-2xl bg-teal-50 dark:bg-teal-950/40 border border-teal-200/80 dark:border-teal-900/60 hover:bg-teal-100 dark:hover:bg-teal-900/50 text-teal-800 dark:text-teal-200 transition group text-center cursor-pointer shadow-xs"
              >
                <div className="w-9 h-9 rounded-xl bg-teal-600 text-white flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                  <Activity className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold leading-tight">Asignar Caso EMG</span>
              </button>

              <button
                type="button"
                onClick={() => setShowAttendanceModal(true)}
                className="flex flex-col items-center justify-center gap-2 p-3.5 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200/80 dark:border-blue-900/60 hover:bg-blue-100 dark:hover:bg-blue-900/50 text-blue-800 dark:text-blue-200 transition group text-center cursor-pointer shadow-xs"
              >
                <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                  <Calendar className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold leading-tight">Pase de Asistencia</span>
              </button>

              <button
                type="button"
                onClick={() => setShowRubricsModal(true)}
                className="flex flex-col items-center justify-center gap-2 p-3.5 rounded-2xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200/80 dark:border-purple-900/60 hover:bg-purple-100 dark:hover:bg-purple-900/50 text-purple-800 dark:text-purple-200 transition group text-center cursor-pointer shadow-xs"
              >
                <div className="w-9 h-9 rounded-xl bg-purple-600 text-white flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                  <Sliders className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold leading-tight">Rúbricas & Ponderación</span>
              </button>

              <Link
                to="/admin/alumnos"
                className="flex flex-col items-center justify-center gap-2 p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-900/60 hover:bg-amber-100 dark:hover:bg-amber-900/50 text-amber-800 dark:text-amber-200 transition group text-center cursor-pointer shadow-xs"
              >
                <div className="w-9 h-9 rounded-xl bg-amber-600 text-white flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                  <ClipboardList className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold leading-tight">Libro de Calificaciones</span>
              </Link>
            </div>
          </section>

          {/* Pending Exam Retake Requests (Critical Priority) */}
          {pendingRetakes.length > 0 && (
            <section className="p-5 rounded-3xl bg-gradient-to-r from-cyan-950/80 via-slate-900 to-indigo-950/80 border border-cyan-500/30 text-white shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-cyan-500/20 text-cyan-300 flex items-center justify-center shrink-0 border border-cyan-400/30">
                    <RotateCcw className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm sm:text-base text-white">
                      Solicitudes de Reintento de Examen ({pendingRetakes.length})
                    </h3>
                    <p className="text-xs text-cyan-200/80">
                      Médicos cursistas que solicitan permiso para repetir una evaluación médica asignada.
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {pendingRetakes.map((ret) => (
                  <div
                    key={ret.assignment.id}
                    className="p-4 rounded-2xl bg-white/5 border border-white/10 flex flex-col justify-between gap-3 text-xs"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <div>
                          <p className="font-bold text-white text-sm">
                            {ret.studentProfile?.display_name || 'Médico Cursista'}
                          </p>
                          <p className="text-slate-400 text-[11px]">{ret.studentProfile?.email}</p>
                        </div>
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-400/30">
                          Reintento Solicitado
                        </span>
                      </div>

                      <div className="mt-2 text-slate-300 space-y-1">
                        <p>
                          <strong className="text-slate-200">Examen:</strong> {ret.assignment.title}
                        </p>
                        {ret.assignment.target_exam_config?.retakeReason && (
                          <div className="p-2.5 rounded-xl bg-black/30 border border-white/5 text-cyan-100 text-[11px] italic">
                            "{ret.assignment.target_exam_config.retakeReason}"
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="pt-2 border-t border-white/10 flex items-center justify-end gap-2">
                      <button
                        type="button"
                        disabled={retakeActionId === ret.assignment.id}
                        onClick={() => handleRejectRetake(ret)}
                        className="px-3 py-1.5 rounded-xl border border-rose-500/40 hover:bg-rose-500/20 text-rose-300 font-semibold transition disabled:opacity-50"
                      >
                        Rechazar
                      </button>
                      <button
                        type="button"
                        disabled={retakeActionId === ret.assignment.id}
                        onClick={() => handleApproveRetake(ret)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold transition shadow-xs disabled:opacity-50"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Aprobar (+1 Intento)</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Fast Grading Inbox: Assignments & EMG Reports to Grade */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <FileCheck className="w-5 h-5 text-indigo-500" />
                  Bandeja de Entregas por Calificar ({pendingSubmissions.length})
                </h2>
                <p className="text-xs text-slate-500">
                  Casos clínicos de electromiografía, análisis de trazos y tareas entregadas esperando tu dictamen.
                </p>
              </div>
            </div>

            {pendingSubmissions.length === 0 ? (
              <div className="p-8 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 text-center">
                <CheckCircle className="w-10 h-10 text-emerald-500 mx-auto mb-2 opacity-80" />
                <h4 className="font-bold text-slate-800 dark:text-slate-200 text-sm">
                  ¡Bandeja de calificación al día!
                </h4>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                  No hay tareas ni casos clínicos pendientes de calificación en este momento. Los nuevos envíos de tus residentes aparecerán aquí.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {pendingSubmissions.map((item) => {
                  const { assignment, studentProfile } = item;
                  return (
                    <div
                      key={assignment.id}
                      className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between gap-3 hover:border-indigo-400 dark:hover:border-indigo-500 transition-all group"
                    >
                      <div>
                        {/* Student Badge */}
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-xl bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-xs shrink-0">
                              {studentProfile?.display_name?.charAt(0) || 'M'}
                            </div>
                            <div className="min-w-0">
                              <p className="font-bold text-slate-900 dark:text-white text-xs truncate">
                                {studentProfile?.display_name || 'Médico Cursista'}
                              </p>
                              <p className="text-[10px] text-slate-400 truncate">
                                {studentProfile?.institution || 'Sede médica'}
                              </p>
                            </div>
                          </div>
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 shrink-0">
                            Entregado
                          </span>
                        </div>

                        {/* Title & Notes */}
                        <h4 className="font-bold text-slate-900 dark:text-white text-sm group-hover:text-indigo-600 dark:group-hover:text-cyan-400 transition-colors">
                          {assignment.title}
                        </h4>

                        {assignment.student_notes && (
                          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 line-clamp-2 bg-slate-50 dark:bg-slate-800/50 p-2 rounded-xl border border-slate-100 dark:border-slate-800">
                            "{assignment.student_notes}"
                          </p>
                        )}

                        <div className="mt-2.5 flex items-center gap-2 text-[11px] text-slate-400">
                          <Clock className="w-3 h-3" />
                          <span>
                            {assignment.submitted_at
                              ? new Date(assignment.submitted_at).toLocaleDateString('es-MX', {
                                  month: 'short',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })
                              : 'Reciente'}
                          </span>
                        </div>
                      </div>

                      {/* Action Button */}
                      <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                        <span className="text-[10px] font-mono text-slate-400 uppercase">
                          {assignment.type.replace('_', ' ')}
                        </span>
                        <button
                          type="button"
                          onClick={() => setGradingItem(item)}
                          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white text-xs font-bold shadow-sm shadow-indigo-600/20 transition"
                        >
                          <FileCheck className="w-3.5 h-3.5" />
                          <span>Calificar Ahora</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {/* Cohort Academic Snapshot & Alert Radar */}
          <section className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* Cohort Performance Cards */}
            <div className="lg:col-span-1 space-y-3">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                <Activity className="w-4 h-4 text-indigo-500" />
                Rendimiento de la Cohorte
              </h3>

              <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">
                    Promedio General de la Cohorte
                  </span>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-3xl font-black text-indigo-600 dark:text-cyan-400">
                      {cohortGlobalStats.avgFinalGrade}
                    </span>
                    <span className="text-xs font-semibold text-slate-500">/ 100 pts</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                  <span className="text-slate-500">Promedio en Exámenes:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    {cohortGlobalStats.avgExamScore} pts
                  </span>
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                  <span className="text-slate-500">Casos EMG Entregados:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    {cohortGlobalStats.totalCasesSubmitted} entregas
                  </span>
                </div>
              </div>
            </div>

            {/* At-Risk Students Radar */}
            <div className="lg:col-span-2 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-500" />
                  Alumnos en Riesgo o Rezagados ({atRiskStudents.length})
                </h3>
                <Link
                  to="/admin/alumnos"
                  className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  Ver toda la cohorte →
                </Link>
              </div>

              {atRiskStudents.length === 0 ? (
                <div className="p-6 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 bg-white/40 dark:bg-slate-900/40 text-center">
                  <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-1 opacity-80" />
                  <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Ningún alumno en estado de alerta
                  </p>
                  <p className="text-[11px] text-slate-400">
                    Todos los médicos cursistas mantienen promedio aprobatorio y cumplimiento de calendario.
                  </p>
                </div>
              ) : (
                <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden divide-y divide-slate-100 dark:divide-slate-800 shadow-sm">
                  {atRiskStudents.slice(0, 5).map(({ profile: std, summary }) => (
                    <div
                      key={std.id}
                      className="p-3.5 sm:px-4 flex items-center justify-between gap-3 text-xs hover:bg-slate-50 dark:hover:bg-slate-800/40 transition"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-8 h-8 rounded-xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center font-bold text-xs shrink-0">
                          {std.display_name.charAt(0)}
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-slate-900 dark:text-white truncate">
                            {std.display_name}
                          </p>
                          <p className="text-[11px] text-slate-400 truncate">
                            {std.institution || std.email}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300 border border-rose-200 dark:border-rose-900">
                          {summary?.finalWeightedGrade ?? 0} pts · {summary?.complianceLabel || 'En riesgo'}
                        </span>
                        <button
                          type="button"
                          onClick={() => setKardexStudent(std)}
                          className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold text-slate-700 dark:text-slate-300 transition text-[11px]"
                        >
                          Ver Kárdex
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════════
          VISTA 2: GESTIÓN OPERATIVA DEL SISTEMA (MODO ADMINISTRADOR TÉCNICO)
          ══════════════════════════════════════════════════════════════════════════ */}
      {isAdmin && activeTab === 'operations' && (
        <div className="space-y-8">
          {/* Primary Operational KPI Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Link
              to="/admin/usuarios"
              className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-blue-500 shadow-sm transition-all"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-400 uppercase">Médicos Acreditados</span>
                <Stethoscope className="w-5 h-5 text-blue-500" />
              </div>
              <div className="text-3xl font-black text-slate-900 dark:text-white">
                {stats?.enrolled_physicians ?? 0}
              </div>
              <p className="text-xs text-amber-600 dark:text-amber-400 font-semibold mt-2">
                {stats?.pending_enrollments ?? 0} pendientes de aprobación
              </p>
            </Link>

            <Link
              to="/admin/revisiones"
              className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-emerald-500 shadow-sm transition-all"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-400 uppercase">Cola Editorial</span>
                <FileCheck className="w-5 h-5 text-emerald-500" />
              </div>
              <div className="text-3xl font-black text-slate-900 dark:text-white">
                {stats?.pending_revisions ?? 0}
              </div>
              <p className="text-xs text-slate-500 mt-2">
                {stats?.approved_revisions ?? 0} propuestas aprobadas
              </p>
            </Link>

            <Link
              to="/admin/talleres"
              className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-orange-500 shadow-sm transition-all"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-400 uppercase">Talleres en Vivo</span>
                <Video className="w-5 h-5 text-orange-500" />
              </div>
              <div className="text-3xl font-black text-slate-900 dark:text-white">
                {stats?.upcoming_workshops ?? 0}
              </div>
              <p className="text-xs text-slate-500 mt-2">
                {stats?.total_workshops ?? 0} webinars registrados
              </p>
            </Link>
          </div>

          {/* Pending Doctor Enrollments */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Stethoscope className="w-5 h-5 text-indigo-500" />
                  Validación Inmediata de Médicos Residentes y Especialistas
                </h2>
                <p className="text-xs text-slate-500">
                  Acredita con 1 clic para darles acceso formal al programa formativo.
                </p>
              </div>
              <Link
                to="/admin/usuarios"
                className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                Ver todos los usuarios →
              </Link>
            </div>

            {pendingDoctors.length === 0 ? (
              <div className="p-6 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 bg-white/40 dark:bg-slate-900/40 text-center">
                <CheckCircle className="w-8 h-8 text-emerald-500 mx-auto mb-2 opacity-80" />
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  No hay solicitudes de médicos pendientes
                </p>
                <p className="text-xs text-slate-400 mt-0.5">
                  Todas las inscripciones han sido procesadas correctamente.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {pendingDoctors.map((doc) => (
                  <div
                    key={doc.id}
                    className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                            {doc.display_name}
                          </h4>
                          <p className="text-xs text-slate-500">{doc.email}</p>
                        </div>
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">
                          Pendiente
                        </span>
                      </div>

                      <div className="mt-2.5 space-y-1 text-xs text-slate-600 dark:text-slate-400">
                        {doc.institution && (
                          <p><strong>Sede:</strong> {doc.institution}</p>
                        )}
                        {doc.cedula_profesional && (
                          <p><strong>Cédula:</strong> {doc.cedula_profesional}</p>
                        )}
                        {doc.specialty && (
                          <p><strong>Especialidad:</strong> {doc.specialty}</p>
                        )}
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                      <span className="text-[11px] text-slate-400">
                        {new Date(doc.created_at).toLocaleDateString('es-MX')}
                      </span>
                      <button
                        type="button"
                        disabled={approvingId === doc.id}
                        onClick={() => handleQuickApprove(doc.id)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs disabled:opacity-50 transition"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>{approvingId === doc.id ? 'Aprobando…' : 'Aprobar Médico'}</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Module Access Quick Explorer */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-indigo-500" />
                  Gestión de Módulos y Políticas de Acceso
                </h2>
                <p className="text-xs text-slate-500">
                  Configura si los temas son de libre acceso o requieren suscripción de estudiante.
                </p>
              </div>
              <Link
                to="/admin/acceso"
                className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                Control de acceso completo →
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {allModules.slice(0, 6).map((mod) => {
                const access = moduleAccessMap.get(mod.id);
                const isFree = access?.required_tier === 'free';
                return (
                  <div
                    key={mod.id}
                    className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between gap-3 shadow-xs"
                  >
                    <div className="min-w-0">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        Módulo {mod.id}
                      </span>
                      <h4 className="font-semibold text-slate-900 dark:text-white text-xs sm:text-sm truncate">
                        {mod.title}
                      </h4>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        {mod.topics?.length ?? 0} temas estructurados
                      </p>
                    </div>

                    <div className="shrink-0 flex items-center gap-2">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold ${
                          isFree
                            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                            : 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                        }`}
                      >
                        {isFree ? <Unlock className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
                        <span>{isFree ? 'Gratis' : 'Premium'}</span>
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Audit Log Feed - Colapsada por default y desplegable con clic */}
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => setIsAuditExpanded(!isAuditExpanded)}
                className="flex items-center gap-2 group text-left cursor-pointer focus:outline-none"
                aria-expanded={isAuditExpanded}
              >
                <CheckCircle className="w-5 h-5 text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition" />
                <h2 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition flex items-center gap-2">
                  <span>Actividad Reciente del Sistema</span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 font-medium">
                    {audit.length}
                  </span>
                </h2>
                <span className="p-1 rounded-lg text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-200 group-hover:bg-slate-100 dark:group-hover:bg-slate-800 transition">
                  {isAuditExpanded ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </span>
              </button>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setIsAuditExpanded(!isAuditExpanded)}
                  className="text-xs font-semibold text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition cursor-pointer"
                >
                  {isAuditExpanded ? 'Colapsar ▲' : 'Desplegar ▼'}
                </button>
                <span className="text-slate-200 dark:text-slate-700">|</span>
                <Link
                  to="/admin/auditoria"
                  className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  Auditoría completa →
                </Link>
              </div>
            </div>

            {!isAuditExpanded ? (
              /* Tarjeta colapsada por default interactiva */
              <button
                type="button"
                onClick={() => setIsAuditExpanded(true)}
                className="w-full text-left p-3.5 sm:p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/60 shadow-sm transition group flex items-center justify-between cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                    <Shield className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition">
                      {audit.length > 0
                        ? `${audit.length} eventos recientes registrados en el sistema`
                        : 'Sin eventos recientes'}
                    </p>
                    <p className="text-[11px] text-slate-400">
                      Sección colapsada por default • Haz clic para desplegar y revisar la actividad
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400 group-hover:translate-x-0.5 transition">
                  <span>Desplegar</span>
                  <ChevronDown className="w-4 h-4" />
                </div>
              </button>
            ) : audit.length === 0 ? (
              <div className="py-8 text-center rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 text-sm text-slate-400 bg-white/30 dark:bg-slate-900/30">
                Sin eventos recientes registrados en la bitácora.
              </div>
            ) : (
              /* Lista desplegada completa */
              <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden divide-y divide-slate-100 dark:divide-slate-800 shadow-sm">
                {audit.map((entry) => {
                  const act = entry.action.toLowerCase();
                  const isVerify = act.includes('verify') || act.includes('approve');
                  const isDelete = act.includes('delete') || act.includes('revoke');
                  return (
                    <div
                      key={entry.id}
                      className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3.5 sm:px-4 text-xs sm:text-sm hover:bg-slate-50 dark:hover:bg-slate-800/40 transition"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                            isVerify
                              ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400'
                              : isDelete
                              ? 'bg-purple-50 text-purple-600 dark:bg-purple-950/60 dark:text-purple-400'
                              : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
                          }`}
                        >
                          {isVerify ? <Check className="w-3.5 h-3.5" /> : <Shield className="w-3.5 h-3.5" />}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-800 dark:text-slate-200">
                            {entry.action.replace(/_/g, ' ')}
                          </p>
                          <p className="text-[11px] text-slate-400">
                            Entidad: {entry.entity_type} {entry.entity_id ? `(#${entry.entity_id.slice(0, 8)})` : ''}
                          </p>
                        </div>
                      </div>

                      <div className="text-right text-[11px] text-slate-400">
                        <span>{entry.actor_id ? actorNames.get(entry.actor_id) ?? 'Sistema' : 'Sistema'}</span>
                        <span className="mx-1.5">•</span>
                        <span>{new Date(entry.created_at).toLocaleString('es-MX')}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════════
          MODALES DE DOCENCIA Y CALIFICACIÓN
          ══════════════════════════════════════════════════════════════════════════ */}
      {/* 1. Modal Rápido de Calificación */}
      <TeacherQuickGradeModal
        isOpen={Boolean(gradingItem)}
        onClose={() => setGradingItem(null)}
        item={gradingItem}
        onGraded={() => {
          setSuccessMessage('¡Calificación y retroalimentación guardadas con éxito!');
          loadData();
          setTimeout(() => setSuccessMessage(null), 4000);
        }}
      />

      {/* 2. Asignar Examen */}
      <AssignExamModal
        isOpen={showAssignExamModal}
        onClose={() => setShowAssignExamModal(false)}
        profiles={allProfiles}
        onAssigned={() => {
          setSuccessMessage('¡Examen asignado exitosamente al grupo!');
          loadData();
          setTimeout(() => setSuccessMessage(null), 4000);
        }}
      />

      {/* 3. Asignar Caso Clínico EMG */}
      <AssignClinicalCaseModal
        isOpen={showAssignCaseModal}
        onClose={() => setShowAssignCaseModal(false)}
        profiles={allProfiles}
        onAssigned={() => {
          setSuccessMessage('¡Caso clínico EMG asignado exitosamente!');
          loadData();
          setTimeout(() => setSuccessMessage(null), 4000);
        }}
      />

      {/* 4. Pase de Lista / Asistencia */}
      <AttendanceTrackerModal
        isOpen={showAttendanceModal}
        onClose={() => setShowAttendanceModal(false)}
        profiles={allProfiles}
        onSaved={() => {
          setSuccessMessage('¡Asistencia registrada correctamente!');
          loadData();
          setTimeout(() => setSuccessMessage(null), 4000);
        }}
      />

      {/* 5. Rúbricas y Ponderación */}
      <GradebookConfigModal
        isOpen={showRubricsModal}
        onClose={() => setShowRubricsModal(false)}
        onSaved={() => {
          setSuccessMessage('¡Rúbricas oficiales actualizadas!');
          loadData();
          setTimeout(() => setSuccessMessage(null), 4000);
        }}
      />

      {/* 6. Kárdex del Alumno */}
      {kardexStudent && (
        <StudentKardexModal
          isOpen={Boolean(kardexStudent)}
          onClose={() => setKardexStudent(null)}
          studentId={kardexStudent.id}
          profile={kardexStudent}
        />
      )}

      {/* 7. Crear Clase en Vivo y Grabaciones */}
      <CreateLiveClassModal
        isOpen={showCreateLiveClassModal}
        onClose={() => setShowCreateLiveClassModal(false)}
        onSuccess={async () => {
          const result = await loadData();
          if (result.calendarWarning) {
            setSuccessMessage('La clase se guardó, pero Esta semana no pudo recargar los talleres.');
            setTimeout(() => setSuccessMessage(null), 5000);
            return false;
          }
          setSuccessMessage('¡Clase programada / grabación actualizada correctamente!');
          setTimeout(() => setSuccessMessage(null), 4000);
          return true;
        }}
      />
    </AdminLayout>
  );
}
