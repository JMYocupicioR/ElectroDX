import { useEffect, useState, useMemo, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  FileCheck,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Check,
  Activity,
  Clock,
  RotateCcw,
  Calendar,
  AlertTriangle,
  FileQuestion,
  ChevronDown,
  UserCheck,
  ExternalLink,
  Pencil,
  GraduationCap,
  MessageCircle,
} from 'lucide-react';
import { AdminLayout } from './AdminLayout';
import {
  getAdminProfiles,
  getPendingRevisions,
  reviewRevision,
  verifyPhysicianEnrollment,
} from '../../services/editorialService';
import {
  getAdminCourseWaitlist,
  adminAdmitStudentAndApproveProfile,
} from '../../services/courseService';
import {
  getTeacherPendingReviewItems,
  approveExamRetake,
  rejectExamRetake,
} from '../../services/studentPlanService';
import {
  listQuizzesForValidation,
  setQuizValidationStatus,
} from '../../services/quizValidationService';
import { getAllQuizFlags } from '../../services/quizService';
import { useAllModules } from '../../hooks/useAllModules';
import { topTopicsMissingQuiz } from '../../utils/topicsMissingQuiz';
import { TopicsMissingQuizQueue } from './quiz/TopicsMissingQuizQueue';
import { findDuplicateStems } from '../../utils/quizDuplicates';
import { allModules } from '../../content/modules';
import { getCohortAcademicSummaries } from '../../services/gradebookService';
import { filterGradeableStudents } from '../../utils/adminUtils';
import { useAuth } from '../../contexts/AuthProvider';
import type { AdminProfileRow } from '../../types/admin';
import type { CourseWaitlistRow, ContentRevision } from '../../types/database';
import type { TeacherPendingReviewItem } from '../../types/studentPlan';
import type { QuizTopicFlag, QuizValidationItem } from '../../types/quiz';
import type { StudentCohortSummary } from '../../types/academicGradebook';
import type { CalendarItem } from '../../types/academicCalendar';
import { loadAcademicCalendarFeed } from '../../services/academicCalendarService';
import { calendarItemStartDate, itemsInRange, startOfWeekMonday, endOfWeekMonday } from '../../utils/academicCalendar';

// Teacher Modals
import TeacherQuickGradeModal from './TeacherQuickGradeModal';
import AssignExamModal from './AssignExamModal';
import { AssignClinicalCaseModal } from './AssignClinicalCaseModal';
import AttendanceTrackerModal from './AttendanceTrackerModal';
import StudentKardexModal from './StudentKardexModal';
import { AdminQuizEditorModal } from './quiz/AdminQuizEditorModal';
import { CreateLiveClassModal } from './CreateLiveClassModal';
import { TopicAdoptionInbox, type TopicAdoptionSummary } from './TopicAdoptionInbox';
import {
  getAutoOpenClassWizardPref,
  hasAutoOpenClassWizardBeenSeenThisSession,
  markAutoOpenClassWizardSessionSeen,
} from '../../utils/classWizardPreferences';
import { invalidateStaffInbox, useStaffInbox } from '../../hooks/useStaffInbox';
import {
  orderStaffInboxSections,
  sectionInboxLevel,
  type StaffInboxLevel,
} from '../../utils/staffInboxRank';

interface CollapsibleDashboardSectionProps {
  id: string;
  title: string;
  subtitle?: string;
  icon: React.ReactNode;
  iconBgClass: string;
  badgeContent: React.ReactNode;
  badgeVariant?: 'alarm' | 'success' | 'warning' | 'info' | 'neutral';
  headerAction?: React.ReactNode;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}

function CollapsibleDashboardSection({
  title,
  subtitle,
  icon,
  iconBgClass,
  badgeContent,
  badgeVariant = 'neutral',
  headerAction,
  isOpen,
  onToggle,
  children,
}: CollapsibleDashboardSectionProps) {
  const isAlarm = badgeVariant === 'alarm';
  const isWarning = badgeVariant === 'warning';
  const isInfo = badgeVariant === 'info';

  return (
    <section
      className={`rounded-2xl border transition-colors bg-white dark:bg-slate-900 overflow-hidden ${
        isAlarm
          ? 'border-rose-300 dark:border-rose-900/60 hover:border-rose-400 dark:hover:border-rose-700'
          : isWarning
            ? 'border-amber-300 dark:border-amber-900/60 hover:border-amber-400 dark:hover:border-amber-700'
            : isInfo
              ? 'border-sky-300 dark:border-sky-900/60 hover:border-sky-400 dark:hover:border-sky-700'
              : 'border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
      }`}
    >
      <div
        onClick={onToggle}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onToggle();
          }
        }}
        aria-expanded={isOpen}
        className="w-full px-3 py-2 flex items-start gap-2.5 text-left cursor-pointer hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition select-none"
      >
        <div
          className={`mt-0.5 w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${iconBgClass}`}
        >
          {icon}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 min-w-0">
            <h2 className="min-w-0 flex-1 truncate text-[13px] font-semibold leading-5 text-slate-900 dark:text-white">
              {title}
            </h2>
            <button
              type="button"
              className="shrink-0 p-1 -mr-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-700/60 transition"
              aria-label={isOpen ? 'Colapsar sección' : 'Expandir sección'}
            >
              <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
            </button>
          </div>
          <div className="mt-0.5 flex items-center gap-1.5 min-w-0">
            <div className="shrink-0 min-w-0 max-w-[70%] overflow-hidden">{badgeContent}</div>
            {subtitle && (
              <p className="min-w-0 flex-1 truncate text-[11px] leading-4 text-slate-500 dark:text-slate-400">
                {subtitle}
              </p>
            )}
            {headerAction && (
              <div className="ml-auto shrink-0" onClick={(e) => e.stopPropagation()}>
                {headerAction}
              </div>
            )}
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="px-3 py-2.5 border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/40 dark:bg-slate-950/25">
          {children}
        </div>
      )}
    </section>
  );
}

function badgeVariantFromLevel(
  level: StaffInboxLevel | null,
  empty: boolean
): 'alarm' | 'success' | 'warning' | 'info' | 'neutral' {
  if (empty || level == null) return 'success';
  if (level === 0) return 'alarm';
  if (level === 1) return 'warning';
  return 'info';
}

function sectionToneClass(level: StaffInboxLevel | null, empty: boolean): string {
  if (empty || level == null) return 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400';
  if (level === 0) return 'bg-rose-500/15 text-rose-600 dark:text-rose-400';
  if (level === 1) return 'bg-amber-500/15 text-amber-600 dark:text-amber-400';
  return 'bg-sky-500/15 text-sky-600 dark:text-sky-400';
}

export default function AdminDashboard() {
  const { user, profile, isAdmin, isEditor, isLoading } = useAuth();
  const { modules: syllabusModules } = useAllModules();
  const inbox = useStaffInbox();
  const openedPriority = useRef(false);

  // State for data
  const [waitlistItems, setWaitlistItems] = useState<CourseWaitlistRow[]>([]);
  const [profilePending, setProfilePending] = useState<AdminProfileRow[]>([]);
  const [pendingSubmissions, setPendingSubmissions] = useState<TeacherPendingReviewItem[]>([]);
  const [pendingTopicRevisions, setPendingTopicRevisions] = useState<ContentRevision[]>([]);
  const [pendingQuizzes, setPendingQuizzes] = useState<QuizValidationItem[]>([]);
  const [quizTopicIdsWithQuestions, setQuizTopicIdsWithQuestions] = useState<Set<string> | null>(null);
  const [pendingRetakes, setPendingRetakes] = useState<TeacherPendingReviewItem[]>([]);
  const [allProfiles, setAllProfiles] = useState<AdminProfileRow[]>([]);
  const [cohortSummaries, setCohortSummaries] = useState<Map<string, StudentCohortSummary>>(new Map());
  const [weekItems, setWeekItems] = useState<CalendarItem[]>([]);

  // Topic Adoption summary & collapsible sections state (all collapsed by default)
  const [, setTopicSummary] = useState<TopicAdoptionSummary | null>(null);
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});

  const toggleSection = (id: string) => {
    setOpenSections((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const allSectionIds = ['retakes', 'submissions', 'questions', 'waitlist', 'quizzes', 'editorial', 'atRisk', 'calendar', 'topics'];
  const areAllOpen = allSectionIds.every((id) => openSections[id]);
  const toggleAllSections = () => {
    if (areAllOpen) {
      setOpenSections({});
    } else {
      const all: Record<string, boolean> = {};
      allSectionIds.forEach((id) => { all[id] = true; });
      setOpenSections(all);
    }
  };

  // Action busy states
  const [admittingId, setAdmittingId] = useState<string | null>(null);
  const [approvingRevId, setApprovingRevId] = useState<string | null>(null);
  const [approvingQuizId, setApprovingQuizId] = useState<string | null>(null);
  const [retakeActionId, setRetakeActionId] = useState<string | null>(null);
  const [showAllQuizzes, setShowAllQuizzes] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [waitlistError, setWaitlistError] = useState<string | null>(null);
  const [_loading, setLoading] = useState(true);

  // Modals state
  const [gradingItem, setGradingItem] = useState<TeacherPendingReviewItem | null>(null);
  const [kardexStudent, setKardexStudent] = useState<AdminProfileRow | null>(null);
  const [showAttendanceModal, setShowAttendanceModal] = useState(false);
  const [showAssignDropdown, setShowAssignDropdown] = useState(false);
  const [showAssignExamModal, setShowAssignExamModal] = useState(false);
  const [showAssignCaseModal, setShowAssignCaseModal] = useState(false);
  const [showCreateLiveClassModal, setShowCreateLiveClassModal] = useState(false);
  const [quizEditorModal, setQuizEditorModal] = useState<{
    isOpen: boolean;
    topicId?: string;
    moduleId?: string;
  }>({ isOpen: false });

  const assignDropdownRef = useRef<HTMLDivElement>(null);

  // Close Assign dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (assignDropdownRef.current && !assignDropdownRef.current.contains(e.target as Node)) {
        setShowAssignDropdown(false);
      }
    }
    if (showAssignDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showAssignDropdown]);

  // Abre el panel de clase en vivo al iniciar sesión si el docente dejó esa preferencia activa.
  useEffect(() => {
    if (isLoading || !user) return;
    if (!isAdmin && !isEditor) return;

    const shouldAutoOpen = getAutoOpenClassWizardPref();
    if (!shouldAutoOpen) return;

    if (!hasAutoOpenClassWizardBeenSeenThisSession()) {
      markAutoOpenClassWizardSessionSeen();
      setShowCreateLiveClassModal(true);
    }
  }, [isLoading, user, isAdmin, isEditor]);

  const loadData = async () => {
    try {
      const [allActiveProfiles, waitlistData, revisionsData, quizzesData, quizFlags] = await Promise.all([
        getAdminProfiles(false, 'all').catch(() => [] as AdminProfileRow[]),
        getAdminCourseWaitlist(null, 'pending')
          .then((rows) => {
            setWaitlistError(null);
            return rows;
          })
          .catch((err: unknown) => {
            const message = err instanceof Error ? err.message : 'No se pudo leer la lista de espera';
            setWaitlistError(message);
            return [] as CourseWaitlistRow[];
          }),
        getPendingRevisions().catch(() => []),
        listQuizzesForValidation().catch(() => []),
        getAllQuizFlags().catch(() => [] as QuizTopicFlag[]),
      ]);

      setWaitlistItems(waitlistData);
      const queuedIds = new Set(waitlistData.map((row) => row.user_id));
      setProfilePending(
        allActiveProfiles.filter(
          (profile) => profile.enrollment_status === 'pending' && !queuedIds.has(profile.id)
        )
      );
      setPendingTopicRevisions(revisionsData);

      // Quizzes pendientes de validación clínica
      const pendingQ = (quizzesData as QuizValidationItem[]).filter(
        (q) => (q.clinical_validation_status ?? 'pending_review') === 'pending_review'
      );
      setPendingQuizzes(pendingQ);
      setQuizTopicIdsWithQuestions(
        new Set(quizFlags.filter((flag) => flag.question_count > 0).map((flag) => flag.topic_id)),
      );

      // Filter only real students
      const studentsOnly = filterGradeableStudents(allActiveProfiles, user?.id);
      setAllProfiles(studentsOnly);

      // Calendar feed
      const calendarFeed = await loadAcademicCalendarFeed(studentsOnly).catch(() => ({
        items: [] as CalendarItem[],
        warnings: [],
      }));
      setWeekItems(calendarFeed.items);

      // Teacher inbox: Submissions & Exam retakes
      const { pendingSubmissions: subs, pendingRetakes: rets } =
        await getTeacherPendingReviewItems(studentsOnly);
      setPendingSubmissions(subs);
      setPendingRetakes(rets);

      // Summaries for at-risk students
      const summaries = await getCohortAcademicSummaries(studentsOnly);
      setCohortSummaries(summaries);
    } catch (e) {
      console.error('[AdminDashboard] Error loading data:', e);
    } finally {
      setLoading(false);
      invalidateStaffInbox();
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const admissionCount = waitlistItems.length + profilePending.length;

  const handleApproveProfile = async (profile: AdminProfileRow) => {
    setAdmittingId(profile.id);
    try {
      await verifyPhysicianEnrollment(profile.id);
      setSuccessMessage(`¡Dr(a). ${profile.display_name} quedó aprobado(a)!`);
      await loadData();
    } catch (err: any) {
      console.error(err);
      alert(`Error al aprobar al médico: ${err?.message || 'Error inesperado'}`);
    } finally {
      setAdmittingId(null);
      setTimeout(() => setSuccessMessage(null), 4000);
    }
  };

  // 1. Quick Admit for Waitlist row
  const handleQuickAdmit = async (item: CourseWaitlistRow) => {
    setAdmittingId(item.enrollment_id);
    try {
      await adminAdmitStudentAndApproveProfile(item.user_id, item.course_id, {
        method: 'transferencia',
        notes: 'Admitido directamente desde la Bandeja del profesor',
      });
      setSuccessMessage(`¡Dr(a). ${item.display_name} ha sido admitido(a) a ${item.course_title}!`);
      await loadData();
    } catch (err: any) {
      console.error(err);
      alert(`Error al admitir al médico: ${err?.message || 'Error inesperado'}`);
    } finally {
      setAdmittingId(null);
      setTimeout(() => setSuccessMessage(null), 4000);
    }
  };

  // 2. Quick Approve topic revision
  const handleQuickApproveTopic = async (revId: string, title?: string) => {
    setApprovingRevId(revId);
    try {
      await reviewRevision(revId, 'approved', 'Aprobado directamente desde la Bandeja docente.');
      setSuccessMessage(`¡Tema "${title || 'propuesta'}" aprobado exitosamente!`);
      await loadData();
    } catch (err: any) {
      console.error(err);
      alert(`Error al aprobar tema: ${err?.message || 'Error inesperado'}`);
    } finally {
      setApprovingRevId(null);
      setTimeout(() => setSuccessMessage(null), 4000);
    }
  };

  // 3. Quick Approve Quiz Clinical Validation
  const handleApproveQuiz = async (quiz: QuizValidationItem) => {
    setApprovingQuizId(quiz.id);
    try {
      await setQuizValidationStatus([quiz.id], 'approved', 'Aprobado directamente desde la Bandeja docente.');
      setSuccessMessage(`¡Evaluación "${quiz.title || quiz.topic_id}" aprobada exitosamente!`);
      await loadData();
    } catch (err: any) {
      console.error(err);
      alert(`Error al aprobar evaluación: ${err?.message || 'Error inesperado'}`);
    } finally {
      setApprovingQuizId(null);
      setTimeout(() => setSuccessMessage(null), 4000);
    }
  };

  // 4. Quick Reject Quiz Clinical Validation
  const handleRejectQuiz = async (quiz: QuizValidationItem) => {
    const reason = window.prompt(
      `Indica el motivo del rechazo para la evaluación "${quiz.title || quiz.topic_id}":`,
      'Requiere ajuste de reactivos o claves de respuesta.'
    );
    if (!reason) return;

    setApprovingQuizId(quiz.id);
    try {
      await setQuizValidationStatus([quiz.id], 'rejected', reason);
      setSuccessMessage(`Evaluación "${quiz.title || quiz.topic_id}" marcada como rechazada.`);
      await loadData();
    } catch (err: any) {
      console.error(err);
      alert(`Error al rechazar evaluación: ${err?.message || 'Error inesperado'}`);
    } finally {
      setApprovingQuizId(null);
      setTimeout(() => setSuccessMessage(null), 4000);
    }
  };

  // 5. Approve retake
  const handleApproveRetake = async (item: TeacherPendingReviewItem) => {
    setRetakeActionId(item.assignment.id);
    try {
      await approveExamRetake(
        item.assignment.id,
        item.assignment.student_id,
        profile?.id,
        1,
        `Reintento autorizado por ${profile?.display_name || 'Profesor Titular'}.`
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

  // 6. Reject retake
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

  // Submissions sorted OLDEST first (la más antigua arriba)
  const sortedSubmissions = useMemo(() => {
    return [...pendingSubmissions].sort((a, b) => {
      const da = a.assignment.submitted_at || a.assignment.updated_at;
      const db = b.assignment.submitted_at || b.assignment.updated_at;
      return new Date(da).getTime() - new Date(db).getTime();
    });
  }, [pendingSubmissions]);

  // Quizzes sorted by module sequence and title
  const sortedPendingQuizzes = useMemo(() => {
    const moduleOrder = new Map(allModules.map((mod, index) => [mod.id, mod.number || index + 1]));
    return [...pendingQuizzes].sort((a, b) => {
      const orderA = moduleOrder.get(a.module_id) ?? 99;
      const orderB = moduleOrder.get(b.module_id) ?? 99;
      if (orderA !== orderB) return orderA - orderB;
      return (a.title ?? a.topic_id).localeCompare(b.title ?? b.topic_id, 'es');
    });
  }, [pendingQuizzes]);

  // Duplicate questions detection for quizzes
  const duplicateQuizIds = useMemo(() => {
    const rows = pendingQuizzes.flatMap((quiz) =>
      (quiz.questions ?? []).map((q) => ({
        quizId: quiz.id,
        topicId: quiz.topic_id,
        stem: q.stem,
      }))
    );
    const hits = findDuplicateStems(rows);
    const set = new Set<string>();
    for (const hit of hits.values()) {
      for (const qId of hit.quizIds) {
        set.add(qId);
      }
    }
    return set;
  }, [pendingQuizzes]);

  const displayedQuizzes = useMemo(() => {
    return showAllQuizzes ? sortedPendingQuizzes : sortedPendingQuizzes.slice(0, 6);
  }, [sortedPendingQuizzes, showAllQuizzes]);

  const topicsMissingQuiz = useMemo(() => {
    if (!quizTopicIdsWithQuestions) return { topics: [], total: 0 };
    return topTopicsMissingQuiz(syllabusModules, quizTopicIdsWithQuestions);
  }, [quizTopicIdsWithQuestions, syllabusModules]);

  const missingQuizPreview = topicsMissingQuiz.topics
    .map((topic) => `Tema ${topic.curriculumIndex}: ${topic.title}`)
    .join(' · ');

  const revealedQuizGaps = useRef(false);
  useEffect(() => {
    if (revealedQuizGaps.current || !quizTopicIdsWithQuestions) return;
    revealedQuizGaps.current = true;
    if (topicsMissingQuiz.total === 0) return;
    setOpenSections((prev) => (prev.quizzes ? prev : { ...prev, quizzes: true }));
  }, [quizTopicIdsWithQuestions, topicsMissingQuiz.total]);

  // Alumnos en riesgo
  const atRiskStudents = useMemo(() => {
    return allProfiles
      .map((p) => {
        const summary = cohortSummaries.get(p.id);
        return { profile: p, summary };
      })
      .filter(({ summary }) => {
        if (!summary) return false;
        return summary.complianceStatus === 'at_risk' || summary.complianceStatus === 'lagging';
      });
  }, [allProfiles, cohortSummaries]);

  // Next class this week (single line)
  const thisWeekClass = useMemo(() => {
    const now = new Date();
    const currentWeekItems = itemsInRange(weekItems, startOfWeekMonday(now), endOfWeekMonday(now));
    const liveWorkshop = currentWeekItems.find((i) => i.type === 'session');
    return liveWorkshop || currentWeekItems[0] || null;
  }, [weekItems]);

  const questionItems = useMemo(
    () => inbox.items.filter((item) => item.kind === 'question'),
    [inbox.items]
  );
  const submissionLevel = sectionInboxLevel(inbox.items, ['submission']);
  const retakeLevel = sectionInboxLevel(inbox.items, ['retake']);
  const questionLevel = sectionInboxLevel(inbox.items, ['question']);
  const admissionLevel = sectionInboxLevel(inbox.items, ['admission']);
  const quizInboxLevel = sectionInboxLevel(inbox.items, ['quiz']);
  const editorialLevel = sectionInboxLevel(inbox.items, ['editorial']);
  const sectionOrder = useMemo(
    () => orderStaffInboxSections(inbox.items, { atRiskCount: atRiskStudents.length }),
    [inbox.items, atRiskStudents.length]
  );
  const sectionStyle = (id: string) => ({ order: Math.max(sectionOrder.indexOf(id), 0) + 1 });

  useEffect(() => {
    if (openedPriority.current) return;
    const firstP0 = ['retakes', 'submissions', 'questions', 'waitlist', 'quizzes', 'editorial'].find(
      (id) => {
        const kinds: Record<string, Array<'retake' | 'submission' | 'question' | 'admission' | 'quiz' | 'editorial'>> = {
          retakes: ['retake'],
          submissions: ['submission'],
          questions: ['question'],
          waitlist: ['admission'],
          quizzes: ['quiz'],
          editorial: ['editorial'],
        };
        return inbox.items.some((item) => kinds[id].includes(item.kind as never) && item.level === 0);
      }
    );
    if (!firstP0) return;
    openedPriority.current = true;
    setOpenSections((prev) => (prev[firstP0] ? prev : { ...prev, [firstP0]: true }));
  }, [inbox.items]);

  const totalPendingAlarms = inbox.counts.totalPending;

  return (
    <AdminLayout
      title="Bandeja"
      subtitle="Decisiones que esperan tu firma y gestión directa de la cohorte."
      headerActions={
        <div className="flex items-center gap-2 flex-wrap">
          {/* 1. Pase de lista */}
          <button
            type="button"
            onClick={() => setShowAttendanceModal(true)}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200/90 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-[11px] font-semibold transition cursor-pointer"
          >
            <UserCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Pase de lista</span>
          </button>

          {/* 2. Asignar (menú con Examen y Caso EMG) */}
          <div className="relative" ref={assignDropdownRef}>
            <button
              type="button"
              onClick={() => setShowAssignDropdown(!showAssignDropdown)}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/60 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 text-[11px] font-semibold transition border border-indigo-200/80 dark:border-indigo-800/80 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              <span>Asignar</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showAssignDropdown ? 'rotate-180' : ''}`} />
            </button>

            {showAssignDropdown && (
              <div className="absolute right-0 mt-2 w-48 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl p-1.5 z-30 space-y-1">
                <button
                  type="button"
                  onClick={() => {
                    setShowAssignDropdown(false);
                    setShowAssignExamModal(true);
                  }}
                  className="w-full text-left flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 hover:text-indigo-600 dark:hover:text-indigo-400 transition cursor-pointer"
                >
                  <FileQuestion className="w-4 h-4 text-indigo-500" />
                  <span>Examen</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowAssignDropdown(false);
                    setShowAssignCaseModal(true);
                  }}
                  className="w-full text-left flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-teal-50 dark:hover:bg-teal-950/50 hover:text-teal-600 dark:hover:text-teal-400 transition cursor-pointer"
                >
                  <Activity className="w-4 h-4 text-teal-500" />
                  <span>Caso EMG</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowAssignDropdown(false);
                    setQuizEditorModal({ isOpen: true });
                  }}
                  className="w-full text-left flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 hover:text-indigo-600 dark:hover:text-indigo-400 transition cursor-pointer"
                >
                  <FileQuestion className="w-4 h-4 text-indigo-500" />
                  <span>Editor de Quiz</span>
                </button>
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={() => setShowCreateLiveClassModal(true)}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-semibold transition cursor-pointer"
            title="Abrir el panel para crear una clase en vivo"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Crear clase en vivo</span>
          </button>
        </div>
      }
    >

      {/* Success Notification Alert */}
      {successMessage && (
        <div className="mb-2 px-3 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
          <span className="font-semibold">{successMessage}</span>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════════
          BANDEJA: GUÍA VISUAL Y SECCIONES COLAPSABLES
          ══════════════════════════════════════════════════════════════════════════ */}
      
      {/* ── Barra de Guía Visual y Resumen de Pendientes ── */}
      <div className="mb-1.5 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-2 flex items-start gap-2.5">
        <div
          className={`mt-0.5 w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
            totalPendingAlarms > 0
              ? 'bg-rose-500/15 text-rose-600 dark:text-rose-400'
              : 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
          }`}
        >
          {totalPendingAlarms > 0 ? (
            <AlertTriangle className="w-4 h-4" />
          ) : (
            <CheckCircle2 className="w-4 h-4" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 min-w-0">
            <h3 className="min-w-0 flex-1 truncate text-[13px] font-semibold leading-5 text-slate-900 dark:text-white">
              Guía de pendientes
            </h3>
            <button
              type="button"
              onClick={toggleAllSections}
              title={areAllOpen ? 'Colapsar todas las secciones' : 'Expandir todas las secciones'}
              className="shrink-0 px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-[11px] font-semibold leading-none transition cursor-pointer"
            >
              {areAllOpen ? 'Colapsar' : 'Expandir'}
            </button>
          </div>
          <p className="mt-0.5 flex items-center gap-1.5 min-w-0 text-[10px] leading-4 overflow-x-auto scrollbar-none">
            {totalPendingAlarms > 0 && (
              <span className="shrink-0 px-1.5 py-px rounded-full font-semibold border inline-flex items-center gap-1 bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-200 border-rose-300 dark:border-rose-800">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                {totalPendingAlarms} {totalPendingAlarms === 1 ? 'pendiente' : 'pendientes'}
              </span>
            )}
            <span className="inline-flex items-center gap-1 shrink-0 text-rose-700 dark:text-rose-400">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
              Decisión
            </span>
            <span className="inline-flex items-center gap-1 shrink-0 text-amber-700 dark:text-amber-400">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
              Respuesta
            </span>
            <span className="inline-flex items-center gap-1 shrink-0 text-sky-700 dark:text-sky-400">
              <span className="w-1.5 h-1.5 rounded-full bg-sky-500" />
              Revisión
            </span>
            <span className="inline-flex items-center gap-1 shrink-0 text-emerald-700 dark:text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              Al día
            </span>
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <div style={sectionStyle('topics')}>
        <TopicAdoptionInbox
          onChanged={loadData}
          isOpen={openSections['topics'] ?? false}
          onToggle={() => toggleSection('topics')}
          onSummaryChange={setTopicSummary}
          onOpenQuizEditor={(topicId, moduleId) =>
            setQuizEditorModal({ isOpen: true, topicId, moduleId })
          }
        />
        </div>

        <div style={sectionStyle('submissions')}>
        <CollapsibleDashboardSection
          id="submissions"
          title="Entregas por calificar"
          subtitle="Tareas y casos clínicos que esperan tu evaluación"
          icon={<FileCheck className="w-4 h-4" />}
          iconBgClass={sectionToneClass(submissionLevel, sortedSubmissions.length === 0)}
          badgeVariant={badgeVariantFromLevel(submissionLevel, sortedSubmissions.length === 0)}
          badgeContent={
            sortedSubmissions.length > 0 ? (
              <span className="px-1.5 py-px rounded-full text-[10px] leading-4 font-semibold bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-200 border border-rose-300 dark:border-rose-800 inline-flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                {sortedSubmissions.length} por calificar
              </span>
            ) : (
              <span className="px-1.5 py-px rounded-full text-[10px] leading-4 font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 inline-flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                Al día
              </span>
            )
          }
          headerAction={
            <Link
              to="/admin/alumnos/tareas?nueva=1"
              className="inline-flex items-center px-2 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-semibold leading-none transition"
            >
              Nueva tarea
            </Link>
          }
          isOpen={openSections['submissions'] ?? false}
          onToggle={() => toggleSection('submissions')}
        >
          {sortedSubmissions.length === 0 ? (
            <div className="px-3 py-2 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 bg-white/40 dark:bg-slate-900/40 text-[11px] leading-4 text-slate-500 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>Al día: no hay tareas ni casos clínicos pendientes de calificación en este momento.</span>
            </div>
          ) : (
            <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden divide-y divide-slate-100 dark:divide-slate-800 shadow-2xs">
              {sortedSubmissions.map((item) => {
                const { assignment, studentProfile } = item;
                const submittedDate = assignment.submitted_at
                  ? new Date(assignment.submitted_at).toLocaleDateString('es-MX', {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })
                  : 'Reciente';

                return (
                  <div
                    key={assignment.id}
                    className="px-3 py-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition text-xs"
                  >
                    <div className="flex items-start sm:items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5 sm:mt-0">
                        {studentProfile?.display_name?.charAt(0) || 'M'}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-bold text-slate-900 dark:text-white truncate">
                            {studentProfile?.display_name || 'Médico Cursista'}
                          </p>
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 shrink-0">
                            {assignment.type === 'clinical_case'
                              ? 'Caso EMG'
                              : assignment.type === 'emg_report'
                              ? 'Reporte de Trazos'
                              : 'Tarea Práctica'}
                          </span>
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
                            Pendiente
                          </span>
                        </div>
                        <p className="font-medium text-slate-700 dark:text-slate-300 truncate mt-0.5">
                          {assignment.title}
                        </p>
                        {assignment.student_notes && (
                          <p className="text-[11px] text-slate-500 italic truncate">
                            "{assignment.student_notes}"
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-800">
                      <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                        <Clock className="w-3 h-3" />
                        <span>{submittedDate}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setGradingItem(item)}
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-bold text-xs shadow-2xs transition cursor-pointer"
                      >
                        <FileCheck className="w-3.5 h-3.5" />
                        <span>Calificar</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CollapsibleDashboardSection>
        </div>

        <div style={sectionStyle('questions')}>
        <CollapsibleDashboardSection
          id="questions"
          title="Dudas por responder"
          subtitle="Hilos de la cohorte que siguen abiertos"
          icon={<MessageCircle className="w-4 h-4" />}
          iconBgClass={sectionToneClass(questionLevel, questionItems.length === 0)}
          badgeVariant={badgeVariantFromLevel(questionLevel, questionItems.length === 0)}
          badgeContent={
            questionItems.length > 0 ? (
              <span className="px-1.5 py-px rounded-full text-[10px] leading-4 font-semibold bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-200 border border-amber-300 dark:border-amber-800 inline-flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                {questionItems.length} {questionItems.length === 1 ? 'duda' : 'dudas'}
              </span>
            ) : (
              <span className="px-1.5 py-px rounded-full text-[10px] leading-4 font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 inline-flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                Al día
              </span>
            )
          }
          isOpen={openSections['questions'] ?? false}
          onToggle={() => toggleSection('questions')}
        >
          {questionItems.length === 0 ? (
            <div className="px-3 py-2 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 bg-white/40 dark:bg-slate-900/40 text-[11px] leading-4 text-slate-500 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>No hay dudas abiertas de la cohorte.</span>
            </div>
          ) : (
            <div className="space-y-2">
              {questionItems.map((item) => (
                <Link
                  key={item.source_key}
                  to={item.link_url || '/admin'}
                  className="block p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
                >
                  <p className="text-xs font-bold text-slate-900 dark:text-white">
                    {item.actor_name || 'Médico cursista'}
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5">{item.context_label}</p>
                  <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-1 line-clamp-2">
                    {item.message}
                  </p>
                </Link>
              ))}
            </div>
          )}
        </CollapsibleDashboardSection>
        </div>

        <div style={sectionStyle('waitlist')}>
        <CollapsibleDashboardSection
          id="waitlist"
          title="Médicos en lista de espera"
          subtitle="Solicitudes de acceso y admisión pendientes de aprobación"
          icon={<Clock className="w-4 h-4" />}
          iconBgClass={
            waitlistError
              ? 'bg-rose-500/15 text-rose-600 dark:text-rose-400'
              : sectionToneClass(admissionLevel, admissionCount === 0)
          }
          badgeVariant={
            waitlistError ? 'alarm' : badgeVariantFromLevel(admissionLevel, admissionCount === 0)
          }
          badgeContent={
            waitlistError ? (
              <span className="px-1.5 py-px rounded-full text-[10px] leading-4 font-bold bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300 border border-rose-300 dark:border-rose-800">
                Sin lectura
              </span>
            ) : admissionCount > 0 ? (
              <span className="px-1.5 py-px rounded-full text-[10px] leading-4 font-semibold bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-200 border border-rose-300 dark:border-rose-800 inline-flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                {admissionCount} por admitir
              </span>
            ) : (
              <span className="px-1.5 py-px rounded-full text-[10px] leading-4 font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 inline-flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                Al día
              </span>
            )
          }
          headerAction={
            <Link
              to="/admin/admisiones"
              className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline whitespace-nowrap"
              title="Ver todas las admisiones"
            >
              Admisiones
            </Link>
          }
          isOpen={openSections['waitlist'] ?? false}
          onToggle={() => toggleSection('waitlist')}
        >
          {waitlistError ? (
            <div className="p-4 rounded-2xl border border-rose-200 dark:border-rose-900/60 bg-rose-50/70 dark:bg-rose-950/30 text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>No se pudo leer la lista de espera: {waitlistError}</span>
            </div>
          ) : admissionCount === 0 ? (
            <div className="px-3 py-2 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 bg-white/40 dark:bg-slate-900/40 text-[11px] leading-4 text-slate-500 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>Al día: no hay solicitudes de médicos en lista de espera pendientes de admisión.</span>
            </div>
          ) : (
            <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden divide-y divide-slate-100 dark:divide-slate-800 shadow-2xs">
              {profilePending.map((profile) => (
                <div
                  key={profile.id}
                  className="px-3 py-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition text-xs"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-amber-500/15 text-amber-700 dark:text-amber-300 flex items-center justify-center font-bold text-xs shrink-0">
                      {(profile.display_name || 'M').charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-bold text-slate-900 dark:text-white truncate">
                          {profile.display_name || 'Médico sin nombre'}
                        </p>
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
                          Perfil por aprobar
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 truncate mt-0.5">
                        {profile.specialty || profile.institution || profile.email}
                        {profile.cedula_profesional ? ` · Cédula: ${profile.cedula_profesional}` : ''}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-end gap-3 shrink-0">
                    <button
                      type="button"
                      disabled={admittingId === profile.id}
                      onClick={() => handleApproveProfile(profile)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-2xs transition disabled:opacity-50 cursor-pointer"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>{admittingId === profile.id ? 'Aprobando...' : 'Aprobar'}</span>
                    </button>
                  </div>
                </div>
              ))}
              {waitlistItems.map((item) => (
                <div
                  key={item.enrollment_id}
                  className="px-3 py-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition text-xs"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-amber-500/15 text-amber-700 dark:text-amber-300 flex items-center justify-center font-bold text-xs shrink-0">
                      {item.display_name.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-bold text-slate-900 dark:text-white truncate">
                          {item.display_name}
                        </p>
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                          {item.course_title}
                        </span>
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
                          Por admitir
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 truncate mt-0.5">
                        {item.specialty || item.institution || item.email}
                        {item.cedula_profesional ? ` · Cédula: ${item.cedula_profesional}` : ''}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-800">
                    <span className="text-[11px] text-slate-400">
                      {new Date(item.requested_at).toLocaleDateString('es-MX')}
                    </span>
                    <button
                      type="button"
                      disabled={admittingId === item.enrollment_id}
                      onClick={() => handleQuickAdmit(item)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-2xs transition disabled:opacity-50 cursor-pointer"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>{admittingId === item.enrollment_id ? 'Admitiendo...' : 'Admitir'}</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CollapsibleDashboardSection>
        </div>

        <div style={sectionStyle('quizzes')}>
        <CollapsibleDashboardSection
          id="quizzes"
          title="Cola de revisión de quizzes"
          subtitle={
            pendingQuizzes.length > 0 && topicsMissingQuiz.total > 0
              ? `${topicsMissingQuiz.total} temas sin cuestionario`
              : pendingQuizzes.length > 0
                ? 'Validación clínica de reactivos'
                : topicsMissingQuiz.total > 0
                  ? 'Temas del temario sin evaluación'
                  : missingQuizPreview || 'Cuestionarios del temario'
          }
          icon={<GraduationCap className="w-4 h-4" />}
          iconBgClass={
            pendingQuizzes.length > 0
              ? sectionToneClass(quizInboxLevel, false)
              : topicsMissingQuiz.total > 0
                ? 'bg-amber-500/15 text-amber-700 dark:text-amber-300'
                : 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
          }
          badgeVariant={
            pendingQuizzes.length > 0
              ? badgeVariantFromLevel(quizInboxLevel, false)
              : topicsMissingQuiz.total > 0
                ? 'warning'
                : quizTopicIdsWithQuestions
                  ? 'success'
                  : 'neutral'
          }
          badgeContent={
            <span className="inline-flex items-center gap-1">
              {pendingQuizzes.length > 0 ? (
                <span className="px-1.5 py-px rounded-full text-[10px] leading-4 font-semibold bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-200 border border-rose-300 dark:border-rose-800 inline-flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                  {pendingQuizzes.length} por validar
                </span>
              ) : topicsMissingQuiz.total === 0 && quizTopicIdsWithQuestions ? (
                <span className="px-1.5 py-px rounded-full text-[10px] leading-4 font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 inline-flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  Al día
                </span>
              ) : topicsMissingQuiz.total === 0 ? (
                <span className="px-1.5 py-px rounded-full text-[10px] leading-4 font-bold bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                  Revisando temas…
                </span>
              ) : null}
              {topicsMissingQuiz.total > 0 && pendingQuizzes.length === 0 && (
                <span className="px-1.5 py-px rounded-full text-[10px] leading-4 font-bold bg-amber-50 text-amber-800 dark:bg-amber-950/60 dark:text-amber-200 border border-amber-200 dark:border-amber-800 inline-flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" />
                  {topicsMissingQuiz.total} sin cuestionario
                </span>
              )}
            </span>
          }
          headerAction={
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setQuizEditorModal({ isOpen: true })}
                className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-[11px] leading-none transition cursor-pointer"
                title="Abrir editor de quizzes"
              >
                <FileQuestion className="w-3 h-3" />
                <span>Editor</span>
              </button>
              {pendingQuizzes.length > 0 && (
                <Link
                  to="/admin/revisiones?tab=clinical"
                  className="hidden sm:inline text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline whitespace-nowrap"
                >
                  Validar
                </Link>
              )}
            </div>
          }
          isOpen={openSections['quizzes'] ?? false}
          onToggle={() => toggleSection('quizzes')}
        >
          <div className="space-y-2">
          {pendingQuizzes.length === 0 && topicsMissingQuiz.total === 0 ? (
            <div className="px-3 py-2 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 bg-white/40 dark:bg-slate-900/40 text-[11px] leading-4 text-slate-500 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>
                  {quizTopicIdsWithQuestions
                    ? 'Al día: no hay exámenes pendientes de revisión clínica y cada tema del temario ya tiene cuestionario.'
                    : 'Revisando qué temas no tienen cuestionario…'}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setQuizEditorModal({ isOpen: true })}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-indigo-200 dark:border-indigo-800 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/60 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 font-bold text-xs transition cursor-pointer self-start sm:self-auto shrink-0 shadow-2xs"
              >
                <Pencil className="w-3.5 h-3.5" />
                <span>Editar o crear quizzes de temas</span>
              </button>
            </div>
          ) : pendingQuizzes.length > 0 ? (
            <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden divide-y divide-slate-100 dark:divide-slate-800 shadow-2xs">
              {displayedQuizzes.map((quiz) => {
                const title = quiz.title || `Evaluación: ${quiz.topic_id}`;
                const mod = allModules.find((m) => m.id === quiz.module_id);
                const modLabel = mod ? `Módulo ${mod.number}: ${mod.title}` : `Módulo ${quiz.module_id}`;
                const isDuplicate = duplicateQuizIds.has(quiz.id);

                return (
                  <div
                    key={quiz.id}
                    className="px-3 py-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition text-xs"
                  >
                    <div className="flex items-start sm:items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5 sm:mt-0">
                        Q
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-bold text-slate-900 dark:text-white truncate">
                            {title}
                          </p>
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
                            Pendiente
                          </span>
                          {isDuplicate && (
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30">
                              Duplicado
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500 truncate mt-0.5">
                          <span className="font-medium text-slate-600 dark:text-slate-400">{modLabel}</span>
                          {' · '}
                          <span>{quiz.topic_id}</span>
                          {' · '}
                          <span>{quiz.question_count ?? (quiz.questions?.length || 0)} reactivos</span>
                          {' · '}
                          <span>{quiz.attempt_count ?? 0} intentos</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-800 flex-wrap">
                      <button
                        type="button"
                        onClick={() =>
                          setQuizEditorModal({
                            isOpen: true,
                            topicId: quiz.topic_id,
                            moduleId: quiz.module_id,
                          })
                        }
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 font-semibold text-indigo-700 dark:text-indigo-300 transition text-[11px] cursor-pointer"
                        title="Corregir quiz en modal rápido"
                      >
                        <Pencil className="w-3 h-3 text-indigo-500" />
                        <span>Corregir quiz</span>
                      </button>
                      <Link
                        to={`/tema/${quiz.topic_id}`}
                        target="_blank"
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold text-slate-700 dark:text-slate-300 transition text-[11px]"
                      >
                        <ExternalLink className="w-3 h-3 text-slate-400" />
                        <span>Ver tema</span>
                      </Link>
                      <button
                        type="button"
                        disabled={approvingQuizId === quiz.id}
                        onClick={() => handleRejectQuiz(quiz)}
                        className="px-2.5 py-1.5 rounded-xl border border-rose-300 dark:border-rose-800 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-700 dark:text-rose-300 font-semibold transition disabled:opacity-50 cursor-pointer text-[11px]"
                      >
                        Rechazar
                      </button>
                      <button
                        type="button"
                        disabled={approvingQuizId === quiz.id}
                        onClick={() => handleApproveQuiz(quiz)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-2xs transition disabled:opacity-50 cursor-pointer"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>{approvingQuizId === quiz.id ? 'Aprobando...' : 'Aprobar'}</span>
                      </button>
                    </div>
                  </div>
                );
              })}

              {pendingQuizzes.length > 6 && (
                <div className="p-3 bg-slate-50/70 dark:bg-slate-800/40 text-center flex items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => setShowAllQuizzes(!showAllQuizzes)}
                    className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                  >
                    {showAllQuizzes
                      ? 'Mostrar menos'
                      : `Ver los ${pendingQuizzes.length} exámenes pendientes en esta lista (${pendingQuizzes.length - 6} más)`}
                  </button>
                  <span className="text-slate-300 dark:text-slate-600">|</span>
                  <Link
                    to="/admin/revisiones?tab=clinical"
                    className="text-xs font-semibold text-slate-600 dark:text-slate-400 hover:underline inline-flex items-center gap-1"
                  >
                    <span>Ir a panel de validación clínica</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              )}
            </div>
          ) : null}
          <TopicsMissingQuizQueue
            topics={topicsMissingQuiz.topics}
            total={topicsMissingQuiz.total}
            onAddQuiz={(topic) =>
              setQuizEditorModal({
                isOpen: true,
                topicId: topic.topicId,
                moduleId: topic.moduleId,
              })
            }
          />
          </div>
        </CollapsibleDashboardSection>
        </div>

        <div style={sectionStyle('editorial')}>
        <CollapsibleDashboardSection
          id="editorial"
          title="Temas pendientes de aprobación"
          subtitle="Propuestas curriculares y lecciones por aprobar en el temario"
          icon={<FileCheck className="w-4 h-4" />}
          iconBgClass={sectionToneClass(editorialLevel, pendingTopicRevisions.length === 0)}
          badgeVariant={badgeVariantFromLevel(editorialLevel, pendingTopicRevisions.length === 0)}
          badgeContent={
            pendingTopicRevisions.length > 0 ? (
              <span className="px-1.5 py-px rounded-full text-[10px] leading-4 font-semibold bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-200 border border-rose-300 dark:border-rose-800 inline-flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                {pendingTopicRevisions.length} propuestas por aprobar
              </span>
            ) : (
              <span className="px-1.5 py-px rounded-full text-[10px] leading-4 font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 inline-flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                Al día
              </span>
            )
          }
          headerAction={
            pendingTopicRevisions.length > 0 ? (
              <Link
                to="/admin/revisiones"
                className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline whitespace-nowrap"
                title="Abrir la cola editorial"
              >
                Revisar
              </Link>
            ) : undefined
          }
          isOpen={openSections['editorial'] ?? false}
          onToggle={() => toggleSection('editorial')}
        >
          {pendingTopicRevisions.length === 0 ? (
            <div className="px-3 py-2 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 bg-white/40 dark:bg-slate-900/40 text-[11px] leading-4 text-slate-500 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>Al día: no hay temas ni propuestas editoriales pendientes de aprobación en el temario.</span>
            </div>
          ) : (
            <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden divide-y divide-slate-100 dark:divide-slate-800 shadow-2xs">
              {pendingTopicRevisions.map((rev) => {
                const title = rev.payload?.title || rev.target_topic_id || 'Tema en revisión';
                const isQuiz = rev.payload?.revisionType === 'quiz';
                return (
                  <div
                    key={rev.id}
                    className="px-3 py-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition text-xs"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-purple-500/15 text-purple-700 dark:text-purple-300 flex items-center justify-center font-bold text-xs shrink-0">
                        {isQuiz ? 'Q' : 'T'}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-slate-900 dark:text-white truncate">
                            {title}
                          </p>
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300">
                            {isQuiz ? 'Evaluación' : `Módulo ${rev.module_id}`}
                          </span>
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
                            Por aprobar
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 truncate mt-0.5">
                          Acción: {rev.action === 'create' ? 'Nuevo tema' : 'Modificación curricular'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-2.5 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-800">
                      <Link
                        to="/admin/revisiones"
                        className="px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold text-slate-700 dark:text-slate-300 transition text-[11px]"
                      >
                        Revisar
                      </Link>
                      <button
                        type="button"
                        disabled={approvingRevId === rev.id}
                        onClick={() => handleQuickApproveTopic(rev.id, title)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-2xs transition disabled:opacity-50 cursor-pointer"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>{approvingRevId === rev.id ? 'Aprobando...' : 'Aprobar Tema'}</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CollapsibleDashboardSection>
        </div>

        <div style={sectionStyle('retakes')}>
        <CollapsibleDashboardSection
          id="retakes"
          title="Reintentos de examen"
          subtitle="Solicitudes de alumnos que requieren aprobación o rechazo"
          icon={<RotateCcw className="w-4 h-4" />}
          iconBgClass={sectionToneClass(retakeLevel, pendingRetakes.length === 0)}
          badgeVariant={badgeVariantFromLevel(retakeLevel, pendingRetakes.length === 0)}
          badgeContent={
            pendingRetakes.length > 0 ? (
              <span className="px-1.5 py-px rounded-full text-[10px] leading-4 font-semibold bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-200 border border-rose-300 dark:border-rose-800 inline-flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                {pendingRetakes.length} solicitudes
              </span>
            ) : (
              <span className="px-1.5 py-px rounded-full text-[10px] leading-4 font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 inline-flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                Al día
              </span>
            )
          }
          isOpen={openSections['retakes'] ?? false}
          onToggle={() => toggleSection('retakes')}
        >
          {pendingRetakes.length === 0 ? (
            <div className="px-3 py-2 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 bg-white/40 dark:bg-slate-900/40 text-[11px] leading-4 text-slate-500 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>Sin solicitudes de reintento de examen pendientes.</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {pendingRetakes.map((ret) => (
                <div
                  key={ret.assignment.id}
                  className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex flex-col justify-between gap-2 text-xs"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <div>
                        <p className="font-bold text-slate-900 dark:text-white text-sm">
                          {ret.studentProfile?.display_name || 'Médico Cursista'}
                        </p>
                        <p className="text-slate-400 text-[11px]">{ret.studentProfile?.email}</p>
                      </div>
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
                        Reintento Solicitado
                      </span>
                    </div>

                    <div className="mt-2 text-slate-600 dark:text-slate-300 space-y-1">
                      <p>
                        <strong className="text-slate-700 dark:text-slate-200">Examen:</strong> {ret.assignment.title}
                      </p>
                      {ret.assignment.target_exam_config?.retakeReason && (
                        <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60 text-slate-600 dark:text-slate-300 text-[11px] italic">
                          "{ret.assignment.target_exam_config.retakeReason}"
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
                    <button
                      type="button"
                      disabled={retakeActionId === ret.assignment.id}
                      onClick={() => handleRejectRetake(ret)}
                      className="px-3 py-1.5 rounded-xl border border-rose-300 dark:border-rose-800 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-700 dark:text-rose-300 font-semibold transition disabled:opacity-50 cursor-pointer text-xs"
                    >
                      Rechazar
                    </button>
                    <button
                      type="button"
                      disabled={retakeActionId === ret.assignment.id}
                      onClick={() => handleApproveRetake(ret)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold transition shadow-2xs disabled:opacity-50 cursor-pointer text-xs"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Aprobar (+1 Intento)</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CollapsibleDashboardSection>
        </div>

        <div style={sectionStyle('atRisk')}>
        <CollapsibleDashboardSection
          id="atRisk"
          title="Alumnos en riesgo"
          subtitle="Obligaciones ya vencidas: corte, examen, tarea o falta"
          icon={<AlertTriangle className="w-4 h-4" />}
          iconBgClass={
            atRiskStudents.length > 0
              ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400'
              : 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
          }
          badgeVariant={atRiskStudents.length > 0 ? 'warning' : 'success'}
          badgeContent={
            atRiskStudents.length > 0 ? (
              <span className="px-1.5 py-px rounded-full text-[10px] leading-4 font-semibold bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-200 border border-rose-300 dark:border-rose-800 inline-flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                {atRiskStudents.length} en alerta académica
              </span>
            ) : (
              <span className="px-1.5 py-px rounded-full text-[10px] leading-4 font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 inline-flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                Al día
              </span>
            )
          }
          headerAction={
            <Link
              to="/admin/alumnos?cumplimiento=riesgo"
              className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline whitespace-nowrap"
              title="Ver todos los alumnos"
            >
              Alumnos
            </Link>
          }
          isOpen={openSections['atRisk'] ?? false}
          onToggle={() => toggleSection('atRisk')}
        >
          {atRiskStudents.length === 0 ? (
            <div className="px-3 py-2 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 bg-white/40 dark:bg-slate-900/40 text-[11px] leading-4 text-slate-500 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>Excelente: ningún alumno de la cohorte se encuentra en estado de riesgo o rezago académico.</span>
            </div>
          ) : (
            <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden divide-y divide-slate-100 dark:divide-slate-800 shadow-2xs">
              {atRiskStudents.map(({ profile: std, summary }) => {
                const reason = summary?.riskReasons?.[0] || summary?.complianceLabel || 'En riesgo';
                const extra = (summary?.riskReasons?.length ?? 0) > 1
                  ? ` +${(summary?.riskReasons.length ?? 1) - 1}`
                  : '';
                return (
                <div
                  key={std.id}
                  className="px-3 py-2 flex items-center justify-between gap-2 text-xs hover:bg-slate-50 dark:hover:bg-slate-800/40 transition"
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
                    <span
                      className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300 border border-rose-200 dark:border-rose-900 max-w-[16rem] truncate"
                      title={summary?.riskReasons?.join(' · ') || reason}
                    >
                      {reason}{extra}
                    </span>
                    <button
                      type="button"
                      onClick={() => setKardexStudent(std)}
                      className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold text-slate-700 dark:text-slate-300 transition text-[11px] cursor-pointer"
                    >
                      Ver Kárdex
                    </button>
                  </div>
                </div>
                );
              })}
            </div>
          )}
        </CollapsibleDashboardSection>
        </div>

        <div style={sectionStyle('calendar')}>
        <CollapsibleDashboardSection
          id="calendar"
          title="La clase de esta semana"
          subtitle="Próxima sesión en vivo o evento agendado en el calendario"
          icon={<Calendar className="w-4 h-4" />}
          iconBgClass="bg-indigo-500/15 text-indigo-600 dark:text-indigo-400"
          badgeVariant={thisWeekClass ? 'info' : 'neutral'}
          badgeContent={
            thisWeekClass ? (
              <span className="px-1.5 py-px rounded-full text-[10px] leading-4 font-bold bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                {calendarItemStartDate(thisWeekClass.startsAt, thisWeekClass.allDay).toLocaleDateString('es-MX', {
                  weekday: 'short',
                  day: 'numeric',
                  month: 'short',
                })}
              </span>
            ) : (
              <span className="px-1.5 py-px rounded-full text-[10px] leading-4 font-semibold bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                Sin clase programada
              </span>
            )
          }
          headerAction={
            <Link
              to="/admin/calendario"
              className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline whitespace-nowrap"
              title={thisWeekClass ? 'Abrir calendario' : 'Programar en el calendario'}
            >
              <span>Calendario</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          }
          isOpen={openSections['calendar'] ?? false}
          onToggle={() => toggleSection('calendar')}
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                <Calendar className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                {thisWeekClass ? (
                  <div>
                    <p className="text-slate-800 dark:text-slate-200 font-semibold text-sm">
                      {thisWeekClass.title}
                    </p>
                    <p className="text-slate-500 dark:text-slate-400 text-xs mt-0.5">
                      Fecha:{' '}
                      <span className="text-indigo-600 dark:text-cyan-400 font-bold">
                        {calendarItemStartDate(thisWeekClass.startsAt, thisWeekClass.allDay).toLocaleDateString('es-MX', {
                          weekday: 'long',
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                        })}
                      </span>
                    </p>
                  </div>
                ) : (
                  <p className="text-slate-500 dark:text-slate-400">
                    No hay ninguna clase en vivo o evento programado para esta semana.
                  </p>
                )}
              </div>
            </div>

            {thisWeekClass ? (
              <Link
                to="/admin/calendario"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-indigo-200 dark:border-indigo-800 font-bold text-xs text-indigo-600 dark:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 transition shrink-0"
              >
                <span>Ver en calendario</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            ) : (
              <button
                type="button"
                onClick={() => setShowCreateLiveClassModal(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-indigo-200 dark:border-indigo-800 font-bold text-xs text-indigo-600 dark:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 transition shrink-0 cursor-pointer"
              >
                <span>Programar clase</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </CollapsibleDashboardSection>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════════════
          MODALES DE DOCENCIA Y ACCIONES
          ══════════════════════════════════════════════════════════════════════════ */}
      {/* 1. Modal Rápido de Calificación */}
      <TeacherQuickGradeModal
        isOpen={Boolean(gradingItem)}
        onClose={() => setGradingItem(null)}
        item={gradingItem}
        onGraded={() => {
          setSuccessMessage('¡Calificación y retroalimentación guardadas con éxito!');
          invalidateStaffInbox();
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

      {/* 5. Kárdex del Alumno */}
      {kardexStudent && (
        <StudentKardexModal
          isOpen={Boolean(kardexStudent)}
          onClose={() => setKardexStudent(null)}
          studentId={kardexStudent.id}
          profile={kardexStudent}
        />
      )}

      {/* 6. Crear Clase en Vivo */}
      <CreateLiveClassModal
        isOpen={showCreateLiveClassModal}
        onClose={() => setShowCreateLiveClassModal(false)}
        onSuccess={async () => {
          await loadData();
          setSuccessMessage('¡Clase programada / grabación actualizada correctamente!');
          setTimeout(() => setSuccessMessage(null), 4000);
          return true;
        }}
      />

      {/* 7. Modal Editor de Quizzes de Temas */}
      <AdminQuizEditorModal
        isOpen={quizEditorModal.isOpen}
        initialTopicId={quizEditorModal.topicId}
        initialModuleId={quizEditorModal.moduleId}
        onClose={() => setQuizEditorModal({ isOpen: false })}
        onSaved={() => {
          setSuccessMessage('¡Cuestionario guardado o publicado exitosamente!');
          void loadData();
          setTimeout(() => setSuccessMessage(null), 4000);
        }}
      />
    </AdminLayout>
  );
}
