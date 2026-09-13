import { useEffect, useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  GraduationCap,
  BookOpen,
  Award,
  Clock,
  CheckCircle2,
  AlertCircle,
  Play,
  Calendar,
  Bell,
  FileCheck,
  ChevronRight,
  Sparkles,
  BarChart3,
  Search,
  Stethoscope,
  Activity,
  Layers,
  ArrowRight,
  ShieldCheck,
  ShieldAlert,
  Building2,
  Video,
  FileText,
  Brain,
  Zap,
  Flame,
  Target,
  Send,
  Check,
  Lock,
  AlertTriangle,
  Edit3,
  RotateCcw,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthProvider';
import { getMyAttempts, getMyProgressByModule } from '../../services/quizService';
import { getUpcomingWorkshops } from '../../services/courseService';
import {
  calculateStudentMetrics,
  checkCertificationEligibility,
  getLastVisitedTopic,
  getStudentNotifications,
  markAllNotificationsAsRead,
  markNotificationAsRead,
  isTopicCompleted,
  toggleTopicCompleted,
  getCompletedTopics,
  fetchStudentCompletedTopics,
  TOPIC_PROGRESS_EVENT,
  type LastVisitedTopic,
  type StudentNotification,
} from '../../services/studentService';
import {
  getStudentAssignments,
  submitAssignment,
  getStudentActivityAndStreak,
  getActiveExamLock,
  startAssignedExam,
  requestExamRetake,
} from '../../services/studentPlanService';
import type { StudentAssignment, StudentStreakInfo, ActiveExamLock } from '../../types/studentPlan';
import { allModules } from '../../content/modules';
import { getModuleLabel, getTopicPublicUrl } from '../../utils/adminUtils';
import type { ModuleQuizProgress, QuizAttempt } from '../../types/quiz';
import type { LiveWorkshop } from '../../types/database';
import StudentKardexModal from '../admin/StudentKardexModal';

function formatRemainingExamTime(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

export default function StudentDashboard() {
  const navigate = useNavigate();
  const { user, profile, hasPremiumAccess, isAdmin, isEditor } = useAuth();
  const isPremiumUser = hasPremiumAccess || isAdmin || isEditor;

  const [activeTab, setActiveTab] = useState<'summary' | 'modules' | 'quizzes' | 'assignments' | 'notifications' | 'certificate'>('summary');
  const [showKardexModal, setShowKardexModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [attempts, setAttempts] = useState<QuizAttempt[]>([]);
  const [moduleProgress, setModuleProgress] = useState<ModuleQuizProgress[]>([]);
  const [workshops, setWorkshops] = useState<LiveWorkshop[]>([]);
  const [notifications, setNotifications] = useState<StudentNotification[]>([]);
  const [assignments, setAssignments] = useState<StudentAssignment[]>([]);
  const [streak, setStreak] = useState<StudentStreakInfo | null>(null);
  const [submittingAsg, setSubmittingAsg] = useState<StudentAssignment | null>(null);
  const [submitNotes, setSubmitNotes] = useState('');
  const [savingSubmission, setSavingSubmission] = useState(false);
  const [lastVisited, setLastVisited] = useState<LastVisitedTopic | null>(null);

  // Estados para examen asignado y candado estricto
  const [activeExamLock, setActiveExamLock] = useState<ActiveExamLock | null>(null);
  const [selectedExamForModal, setSelectedExamForModal] = useState<StudentAssignment | null>(null);
  const [acceptedExamRules, setAcceptedExamRules] = useState<boolean>(false);
  const [remainingActiveSeconds, setRemainingActiveSeconds] = useState<number | null>(null);
  const [startingExam, setStartingExam] = useState<boolean>(false);

  // Estado para solicitud de reintento de examen
  const [retakeModalAssignment, setRetakeModalAssignment] = useState<StudentAssignment | null>(null);
  const [retakeReason, setRetakeReason] = useState('');
  const [sendingRetake, setSendingRetake] = useState(false);
  const [searchModuleQuery, setSearchModuleQuery] = useState('');
  const [expandedModuleId, setExpandedModuleId] = useState<string | null>(null);
  const [quizFilter, setQuizFilter] = useState<'all' | 'pending' | 'passed'>('all');
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [completedTopicsSet, setCompletedTopicsSet] = useState<Set<string>>(() =>
    user ? getCompletedTopics(user.id) : new Set()
  );

  // Load user data & sync cloud topics
  useEffect(() => {
    if (!user) return;

    setLoading(true);
    Promise.all([
      getMyAttempts(user.id),
      getMyProgressByModule(user.id),
      getUpcomingWorkshops(5),
      getStudentAssignments(user.id),
      getStudentActivityAndStreak(user.id),
      fetchStudentCompletedTopics(user.id),
    ])
      .then(([att, modProg, ws, asgs, stk, syncedTopics]) => {
        setAttempts(att);
        setModuleProgress(modProg);
        setWorkshops(ws);
        setAssignments(asgs);
        setStreak(stk);
        if (syncedTopics) {
          setCompletedTopicsSet(syncedTopics);
        }

        // Notifications
        const notifs = getStudentNotifications(user.id, profile, ws);
        setNotifications(notifs);

        // Last visited
        const last = getLastVisitedTopic(user.id);
        setLastVisited(last);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user, profile, refreshTrigger]);

  // Derived metrics
  const metrics = useMemo(() => {
    if (!user) return null;
    return calculateStudentMetrics(user.id, moduleProgress, completedTopicsSet);
  }, [user, moduleProgress, completedTopicsSet, refreshTrigger]);

  const certRequirements = useMemo(() => {
    if (!metrics) return null;
    return checkCertificationEligibility(profile, metrics.overallProgressPct, moduleProgress);
  }, [profile, metrics, moduleProgress]);

  // Quizzes list with status
  const quizzesList = useMemo(() => {
    return moduleProgress.flatMap((mp) => {
      return (mp.bestScores || []).map((scoreItem) => {
        return {
          moduleId: mp.moduleId,
          moduleTitle: mp.moduleTitle,
          topicId: scoreItem.topicId,
          topicTitle: scoreItem.topicTitle,
          score: scoreItem.score,
          passed: scoreItem.passed,
          topicUrl: getTopicPublicUrl(mp.moduleId, scoreItem.topicId),
        };
      });
    });
  }, [moduleProgress]);

  const unreadCount = useMemo(() => {
    return notifications.filter((n) => !n.isRead).length;
  }, [notifications]);

  const pendingAssignmentsCount = useMemo(() => {
    return assignments.filter((a) => a.status === 'pending').length;
  }, [assignments]);

  const handleSubmitAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!submittingAsg || !user) return;
    setSavingSubmission(true);
    try {
      await submitAssignment(submittingAsg.id, user.id, submitNotes);
      setSubmittingAsg(null);
      setSubmitNotes('');
      setRefreshTrigger((prev) => prev + 1);
    } catch {
      alert('Error al enviar la tarea');
    } finally {
      setSavingSubmission(false);
    }
  };

  const handleSendRetakeRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!retakeModalAssignment || !user || !retakeReason.trim()) return;
    try {
      setSendingRetake(true);
      await requestExamRetake(retakeModalAssignment.id, user.id, retakeReason.trim());
      const updated = await getStudentAssignments(user.id);
      setAssignments(updated);
      setRetakeModalAssignment(null);
      setRetakeReason('');
      alert('Tu solicitud de reintento ha sido enviada al profesor. Recibirás respuesta en cuanto el docente revise tu justificación.');
    } catch (err: any) {
      console.error('Error al solicitar reintento:', err);
      alert('Hubo un error al enviar la solicitud: ' + (err?.message || 'Intenta de nuevo'));
    } finally {
      setSendingRetake(false);
    }
  };

  const handleStartStrictExam = async () => {
    if (!selectedExamForModal || !user) return;
    setStartingExam(true);
    try {
      const timeLimitMinutes = selectedExamForModal.target_exam_config?.timeLimitMinutes || 20;
      const lock = await startAssignedExam(selectedExamForModal.id, user.id, timeLimitMinutes);
      setActiveExamLock(lock);
      const targetConfig = selectedExamForModal.target_exam_config || {
        mode: 'FULL_SIMULATION',
        feedbackMode: 'end',
        timeLimitMinutes,
      };
      const examAssignment = selectedExamForModal;
      setSelectedExamForModal(null);
      setAcceptedExamRules(false);
      navigate('/examenes/sesion', {
        state: {
          assignmentId: examAssignment.id,
          config: {
            ...targetConfig,
            timeLimitMinutes,
            strictLock: true,
            expiresAt: lock.expiresAt,
            selectedQuestionIds: targetConfig.selectedQuestionIds,
          },
          expiresAt: lock.expiresAt,
          strictLock: true,
          selectedQuestionIds: targetConfig.selectedQuestionIds,
          assignmentTitle: examAssignment.title,
        },
      });
    } catch (err) {
      console.error('Error starting strict exam:', err);
      alert('No se pudo iniciar el examen. Por favor intenta de nuevo.');
    } finally {
      setStartingExam(false);
    }
  };

  useEffect(() => {
    const handleProgress = () => {
      setRefreshTrigger((prev) => prev + 1);
    };
    window.addEventListener(TOPIC_PROGRESS_EVENT, handleProgress);
    return () => window.removeEventListener(TOPIC_PROGRESS_EVENT, handleProgress);
  }, []);

  // Monitoreo de examen asignado en curso (tiempo continuo)
  useEffect(() => {
    if (!user) return;
    const checkLock = () => {
      const lock = getActiveExamLock(user.id);
      if (lock) {
        const ms = new Date(lock.expiresAt).getTime();
        const diff = Math.max(0, Math.floor((ms - Date.now()) / 1000));
        if (diff > 0) {
          setActiveExamLock(lock);
          setRemainingActiveSeconds(diff);
        } else {
          setActiveExamLock(null);
          setRemainingActiveSeconds(0);
        }
      } else {
        setActiveExamLock(null);
        setRemainingActiveSeconds(null);
      }
    };
    checkLock();
    const interval = setInterval(checkLock, 1000);
    return () => clearInterval(interval);
  }, [user]);

  const handleToggleTopic = (topicId: string, e: React.MouseEvent, childIds?: string[]) => {
    e.stopPropagation();
    if (!user) return;
    toggleTopicCompleted(user.id, topicId, childIds);
    setRefreshTrigger((prev) => prev + 1);
  };

  const handleMarkNotifRead = (id: string) => {
    if (!user) return;
    markNotificationAsRead(user.id, id);
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
  };

  const handleMarkAllNotifsRead = () => {
    if (!user) return;
    markAllNotificationsAsRead(
      user.id,
      notifications.map((n) => n.id)
    );
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-28 pb-16 px-4 flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-slate-600 dark:text-slate-300 font-medium">
            Cargando expediente y progreso académico…
          </p>
        </div>
      </div>
    );
  }

  const displayName = profile?.display_name || user?.email?.split('@')[0] || 'Médico Residente';

  return (
    <div className="min-h-screen pt-20 pb-20 px-4 sm:px-6 max-w-7xl mx-auto">
      {/* ─── Hero Header ─── */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-blue-950 text-white p-6 sm:p-8 md:p-10 shadow-2xl border border-indigo-500/20 mb-8">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-72 h-72 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-12 w-96 h-96 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-300 border border-blue-400/30">
                <GraduationCap className="w-3.5 h-3.5 text-blue-400" />
                Portal Académico del Alumno
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                Aval COMEFYR
              </span>
              {profile?.cedula_verified && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-cyan-500/20 text-cyan-300 border border-cyan-400/30">
                  <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
                  Cédula Verificada SEP
                </span>
              )}
              {streak && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-orange-500/25 text-orange-300 border border-orange-400/40 shadow-xs">
                  <Flame className="w-3.5 h-3.5 text-orange-400 fill-orange-400 animate-pulse" />
                  Racha: {streak.currentStreak} {streak.currentStreak === 1 ? 'día' : 'días'}
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white">
              Bienvenido, Dr(a). {displayName}
            </h1>

            <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs sm:text-sm text-slate-300">
              {profile?.specialty && (
                <span className="flex items-center gap-1.5">
                  <Stethoscope className="w-4 h-4 text-blue-400" />
                  {profile.specialty}
                </span>
              )}
              {profile?.institution && (
                <span className="flex items-center gap-1.5">
                  <Building2 className="w-4 h-4 text-indigo-400" />
                  {profile.institution}
                </span>
              )}
              {profile?.residency_year && (
                <span className="flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-cyan-400" />
                  {profile.residency_year}
                </span>
              )}
              {profile?.cedula_profesional && (
                <span className="flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-amber-400" />
                  Cédula: {profile.cedula_profesional}
                </span>
              )}
            </div>
          </div>

          {/* Quick Resume Card */}
          <div className="shrink-0 bg-white/10 dark:bg-slate-900/60 backdrop-blur-md rounded-2xl p-4 sm:p-5 border border-white/15 max-w-sm w-full">
            <p className="text-xs font-semibold uppercase tracking-wider text-blue-300 mb-1 flex items-center gap-1.5">
              <Play className="w-3 h-3 text-blue-400 fill-blue-400" />
              Continuar donde te quedaste
            </p>
            {lastVisited ? (
              <div>
                <p className="text-sm font-bold text-white line-clamp-1">{lastVisited.topicTitle}</p>
                <p className="text-xs text-slate-300 line-clamp-1 mb-3">{lastVisited.moduleTitle}</p>
                <Link
                  to={lastVisited.url}
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white shadow-md shadow-blue-500/20 transition-all"
                >
                  Continuar lección
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            ) : (
              <div>
                <p className="text-sm font-bold text-white">Módulo 1: Fundamentos Biofísicos</p>
                <p className="text-xs text-slate-300 mb-3">Inicia tu formación en electromiografía</p>
                <Link
                  to="/modulo/fundamentals"
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white shadow-md shadow-blue-500/20 transition-all"
                >
                  Empezar curso
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ─── BANNER DE EXAMEN ASIGNADO EN CURSO (TIEMPO CONTINUO) ─── */}
      {activeExamLock && remainingActiveSeconds !== null && remainingActiveSeconds > 0 && (
        <div className="mb-6 p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-amber-500/15 via-red-500/15 to-indigo-500/15 border-2 border-amber-500/60 dark:border-amber-500/50 backdrop-blur-md flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-lg shadow-amber-500/30">
              <Clock className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-red-600 text-white animate-pulse">
                  Evaluación Activa
                </span>
                <span className="text-sm font-bold text-slate-900 dark:text-white">
                  {activeExamLock.assignmentTitle}
                </span>
              </div>
              <p className="text-xs text-slate-700 dark:text-slate-300 mt-1">
                Tiempo restante:{' '}
                <strong className="text-red-600 dark:text-red-400 font-mono font-black text-sm tracking-wide">
                  {formatRemainingExamTime(remainingActiveSeconds)}
                </strong>
                . El cronómetro corre de forma continua en tiempo real.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              navigate('/examenes/sesion', {
                state: {
                  assignmentId: activeExamLock.assignmentId,
                  config: activeExamLock.config,
                  expiresAt: activeExamLock.expiresAt,
                  strictLock: true,
                  selectedQuestionIds: activeExamLock.selectedQuestionIds,
                  assignmentTitle: activeExamLock.assignmentTitle,
                },
              });
            }}
            className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-700 hover:to-amber-700 text-white text-xs font-black shadow-lg shadow-red-600/30 transition cursor-pointer text-center whitespace-nowrap"
          >
            Reanudar Examen Ahora →
          </button>
        </div>
      )}

      {/* ─── 4 Academic KPI Cards ─── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 mb-8">
        {/* 1. Progreso Global */}
        <div className="p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Progreso Global
            </span>
            <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
              <BarChart3 className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2 mb-2">
            <span className="text-3xl font-extrabold text-slate-900 dark:text-white">
              {metrics?.overallProgressPct || 0}%
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">del currículo</span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden mb-2">
            <div
              className="bg-gradient-to-r from-blue-600 to-cyan-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${metrics?.overallProgressPct || 0}%` }}
            />
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {metrics?.totalCompletedCurriculumTopics || 0} de {metrics?.totalCurriculumTopics || 0} lecciones completadas
          </p>
        </div>

        {/* 2. Créditos CME / Horas Académicas */}
        <div className="p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Créditos CME / Horas
            </span>
            <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
              <Award className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2 mb-2">
            <span className="text-3xl font-extrabold text-indigo-600 dark:text-indigo-400">
              {metrics?.cmeCreditsEarned || 0}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              / {metrics?.maxCmeCredits || 40} pts CME
            </span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden mb-2">
            <div
              className="bg-gradient-to-r from-indigo-600 to-purple-600 h-full rounded-full transition-all duration-500"
              style={{
                width: `${Math.min(100, Math.round(((metrics?.cmeCreditsEarned || 0) / (metrics?.maxCmeCredits || 40)) * 100))}%`,
              }}
            />
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-indigo-500" />
            {metrics?.academicHoursEarned || 0} de {metrics?.maxAcademicHours || 80} horas lectivas
          </p>
        </div>

        {/* 3. Evaluaciones Aprobadas */}
        <div className="p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Evaluaciones
            </span>
            <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2 mb-2">
            <span className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">
              {certRequirements?.quizzesPassedCount || 0}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              aprobadas ({certRequirements?.averageScore || 0}% prom.)
            </span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden mb-2">
            <div
              className="bg-gradient-to-r from-emerald-500 to-teal-500 h-full rounded-full transition-all duration-500"
              style={{
                width: `${Math.min(100, Math.round(((certRequirements?.quizzesPassedCount || 0) / Math.max(1, certRequirements?.totalQuizzesAvailable || 13)) * 100))}%`,
              }}
            />
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {attempts.length} intentos totales registrados
          </p>
        </div>

        {/* 4. Estado de Certificación */}
        <div className="p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Certificación COMEFYR
            </span>
            <div className={`p-2 rounded-xl ${certRequirements?.isEligible ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600' : 'bg-amber-50 dark:bg-amber-950/60 text-amber-600'}`}>
              <FileCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2 mb-2">
            <span className={`text-xl font-bold ${certRequirements?.isEligible ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`}>
              {certRequirements?.isEligible ? 'Listo para Emisión' : 'En Formación'}
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
            {profile?.cedula_verified
              ? 'Cédula profesional validada'
              : 'Requiere validación de cédula'}
          </p>
          <div className="flex items-center gap-3 pt-1">
            <button
              onClick={() => setActiveTab('certificate')}
              className="text-xs font-semibold text-blue-600 dark:text-cyan-400 hover:underline flex items-center gap-1 cursor-pointer"
            >
              Requisitos y Diploma <ChevronRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setShowKardexModal(true)}
              className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <FileCheck className="w-3.5 h-3.5" /> Mi Kardex Oficial
            </button>
          </div>
        </div>
      </div>

      {/* ─── Tabs Navigation ─── */}
      <div className="flex items-center gap-2 overflow-x-auto border-b border-slate-200 dark:border-slate-800 pb-2 mb-8">
        <button
          onClick={() => setActiveTab('summary')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all whitespace-nowrap ${
            activeTab === 'summary'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Activity className="w-4 h-4" />
          Resumen General
        </button>

        <button
          onClick={() => setActiveTab('modules')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all whitespace-nowrap ${
            activeTab === 'modules'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          Mis Clases y Módulos ({allModules.length})
        </button>

        <button
          onClick={() => setActiveTab('quizzes')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all whitespace-nowrap ${
            activeTab === 'quizzes'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <CheckCircle2 className="w-4 h-4" />
          Quizzes del Curso ({quizzesList.length})
        </button>

        <button
          onClick={() => setActiveTab('assignments')}
          className={`relative flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all whitespace-nowrap ${
            activeTab === 'assignments'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Calendar className="w-4 h-4" />
          Tareas Asignadas
          {pendingAssignmentsCount > 0 && (
            <span className="px-1.5 py-0.5 rounded-full text-[10px] font-extrabold bg-indigo-500 text-white">
              {pendingAssignmentsCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('notifications')}
          className={`relative flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all whitespace-nowrap ${
            activeTab === 'notifications'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Bell className="w-4 h-4" />
          Notificaciones
          {unreadCount > 0 && (
            <span className="px-1.5 py-0.5 rounded-full text-[10px] font-extrabold bg-red-500 text-white">
              {unreadCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('certificate')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all whitespace-nowrap ${
            activeTab === 'certificate'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Award className="w-4 h-4" />
          Constancia COMEFYR
        </button>
      </div>

      {/* ─── TAB 1: Resumen General ─── */}
      {activeTab === 'summary' && (
        <div className="space-y-8">
          {/* Two-column layout: Left Tasks & Next classes, Right: Workshops & Tools */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
            {/* Left 2 Cols: Tareas pendientes & Clases en curso */}
            <div className="lg:col-span-2 space-y-6">
              {/* Tareas y Evaluaciones Pendientes Card */}
              <div className="p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
                      <Clock className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="text-base font-bold text-slate-900 dark:text-white">
                        Tareas y Evaluaciones Pendientes
                      </h2>
                      <p className="text-xs text-slate-500">
                        Cuestionarios requeridos para acreditar los módulos curriculares
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setActiveTab('quizzes')}
                    className="text-xs font-semibold text-blue-600 dark:text-cyan-400 hover:underline"
                  >
                    Ver todas
                  </button>
                </div>

                {quizzesList.filter((q) => !q.passed).length === 0 ? (
                  <div className="py-8 text-center bg-slate-50 dark:bg-slate-800/40 rounded-xl">
                    <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                      ¡Excelente! No tienes evaluaciones pendientes en este momento
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      Has aprobado todas las evaluaciones de los módulos cursados hasta ahora.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {quizzesList
                      .filter((q) => !q.passed)
                      .slice(0, 4)
                      .map((quiz) => (
                        <div
                          key={quiz.topicId}
                          className="flex items-center justify-between p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 hover:border-blue-300 dark:hover:border-blue-700 transition"
                        >
                          <div className="space-y-1 pr-3">
                            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                              {quiz.moduleTitle}
                            </span>
                            <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 line-clamp-1">
                              {quiz.topicTitle}
                            </p>
                            {quiz.score != null ? (
                              <p className="text-xs text-amber-600 dark:text-amber-400 font-medium">
                                Último intento: {quiz.score}% (Mínimo aprobatorio: 70%)
                              </p>
                            ) : (
                              <p className="text-xs text-slate-400">Sin intentos realizados aún</p>
                            )}
                          </div>
                          <Link
                            to={quiz.topicUrl || `/modulo/${quiz.moduleId}`}
                            className="shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition"
                          >
                            Presentar <ArrowRight className="w-3 h-3" />
                          </Link>
                        </div>
                      ))}
                  </div>
                )}
              </div>

              {/* Módulos en Curso (Vista rápida) */}
              <div className="p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
                      <Layers className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="text-base font-bold text-slate-900 dark:text-white">
                        Módulos Curriculares
                      </h2>
                      <p className="text-xs text-slate-500">
                        Currículo oficial COMEFYR en Electrodiagnóstico y EMG
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setActiveTab('modules')}
                    className="text-xs font-semibold text-blue-600 dark:text-cyan-400 hover:underline"
                  >
                    Ver los 13 módulos
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {metrics?.moduleStats.slice(0, 4).map((mod) => (
                    <div
                      key={mod.moduleId}
                      className="p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 hover:shadow-sm transition flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-lg">{mod.emoji}</span>
                          <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                            {mod.progressPct}%
                          </span>
                        </div>
                        <p className="text-sm font-bold text-slate-900 dark:text-white line-clamp-1 mb-1">
                          {mod.title}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
                          {mod.completedTopics} de {mod.totalTopics} lecciones leídas
                        </p>
                      </div>
                      <div className="space-y-2">
                        <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-1.5 overflow-hidden">
                          <div
                            className="bg-blue-600 h-full rounded-full transition-all"
                            style={{ width: `${mod.progressPct}%` }}
                          />
                        </div>
                        <Link
                          to={`/modulo/${mod.moduleId}`}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 dark:text-cyan-400 hover:underline"
                        >
                          Abrir módulo <ChevronRight className="w-3 h-3" />
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column: Talleres en vivo & Herramientas Clínicas */}
            <div className="space-y-6">
              {/* Talleres en Vivo COMEFYR */}
              <div className="p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Video className="w-5 h-5 text-indigo-500" />
                    <h2 className="text-base font-bold text-slate-900 dark:text-white">
                      Talleres en Vivo
                    </h2>
                  </div>
                  <Link
                    to="/talleres"
                    className="text-xs font-semibold text-blue-600 dark:text-cyan-400 hover:underline"
                  >
                    Ver calendario
                  </Link>
                </div>

                {workshops.length === 0 ? (
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 text-center">
                    <Calendar className="w-6 h-6 text-slate-400 mx-auto mb-1.5" />
                    <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Sin sesiones programadas hoy
                    </p>
                    <p className="text-[11px] text-slate-500 mt-1">
                      Las convocatorias a webinars y talleres clínicos se publican en este panel.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {workshops.map((w) => (
                      <div
                        key={w.id}
                        className="p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30"
                      >
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                          {new Date(w.scheduled_at).toLocaleDateString('es-MX', {
                            day: 'numeric',
                            month: 'short',
                          })}
                        </span>
                        <p className="text-sm font-bold text-slate-900 dark:text-white mt-1.5 line-clamp-1">
                          {w.title}
                        </p>
                        <p className="text-xs text-slate-500 line-clamp-2 mt-0.5 mb-2">
                          {w.description || 'Discusión de casos clínicos y electromiografía en vivo.'}
                        </p>
                        <Link
                          to={`/taller/${w.id}`}
                          className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                        >
                          Ver detalles del taller <ChevronRight className="w-3 h-3" />
                        </Link>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Herramientas de Práctica y Simulación */}
              <div className="p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-gradient-to-br from-indigo-50/50 to-blue-50/50 dark:from-indigo-950/20 dark:to-blue-950/20 shadow-sm">
                <h2 className="text-base font-bold text-slate-900 dark:text-white mb-1 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  Simuladores y Herramientas
                </h2>
                <p className="text-xs text-slate-500 mb-4">
                  Complementa tu aprendizaje con motores de cálculo clínico
                </p>

                <div className="space-y-2.5">
                  <Link
                    to="/herramientas/plexo-braquial"
                    className="flex items-center justify-between p-3 rounded-xl bg-white dark:bg-slate-900 border border-indigo-100 dark:border-indigo-900/60 hover:shadow-md transition group"
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <p className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition">
                          Calculadora de Plexo Braquial
                        </p>
                        <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold ${
                          isPremiumUser
                            ? 'bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300 border border-amber-300/40'
                            : 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20'
                        }`}>
                          {isPremiumUser ? <Sparkles className="w-2.5 h-2.5 text-amber-500" /> : <Lock className="w-2.5 h-2.5 text-amber-500" />}
                          Premium
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500">
                        Algoritmo ponderado de 5 pasos raíces/cordones
                      </p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition" />
                  </Link>

                  <Link
                    to="/ejercicios"
                    className="flex items-center justify-between p-3 rounded-xl bg-white dark:bg-slate-900 border border-blue-100 dark:border-blue-900/60 hover:shadow-md transition group"
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <p className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-cyan-400 transition">
                          Simulador de Casos Clínicos EMG
                        </p>
                        <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold ${
                          isPremiumUser
                            ? 'bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300 border border-amber-300/40'
                            : 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20'
                        }`}>
                          {isPremiumUser ? <Sparkles className="w-2.5 h-2.5 text-amber-500" /> : <Lock className="w-2.5 h-2.5 text-amber-500" />}
                          Premium
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500">
                        Ejercicios prácticos interactivos con trazos
                      </p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition" />
                  </Link>

                  {/* Simulador de Examen COMEFYR — nuevo */}
                  <Link
                    to="/examenes"
                    className="flex items-center justify-between p-3.5 rounded-xl bg-gradient-to-r from-cyan-950/60 to-indigo-950/60 border border-cyan-700/30 hover:border-cyan-500/40 hover:shadow-lg hover:shadow-cyan-900/20 transition group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-cyan-500 to-indigo-500 flex items-center justify-center shadow-md shadow-cyan-500/20 group-hover:scale-105 transition">
                        <Brain className="w-4 h-4 text-white" />
                      </div>
                      <div className="space-y-0.5">
                        <p className="text-xs font-bold text-white group-hover:text-cyan-300 transition">
                          Simulador de Examen COMEFYR
                        </p>
                        <p className="text-[10px] text-slate-400">
                          85 preguntas · Modo Tutor / Examen Real
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-500/10 border border-amber-500/20 text-amber-400 font-bold">⚡ NUEVO</span>
                      <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 group-hover:translate-x-0.5 transition" />
                    </div>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── TAB 2: Mis Clases y Módulos ─── */}
      {activeTab === 'modules' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                Plan de Estudios: Currículo ElectoDX Diplomado
              </h2>
              <p className="text-sm text-slate-500">
                13 módulos formativos avalados por el Colegio Mexicano de Medicina de Rehabilitación
              </p>
            </div>
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchModuleQuery}
                onChange={(e) => setSearchModuleQuery(e.target.value)}
                placeholder="Buscar módulo o tema…"
                className="w-full pl-9 pr-3 py-2 rounded-xl text-xs border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {metrics?.moduleStats
              .filter(
                (m) =>
                  !searchModuleQuery ||
                  m.title.toLowerCase().includes(searchModuleQuery.toLowerCase()) ||
                  m.moduleId.toLowerCase().includes(searchModuleQuery.toLowerCase())
              )
              .map((mod) => {
                const isExpanded = expandedModuleId === mod.moduleId;
                const fullModule = allModules.find((m) => m.id === mod.moduleId);

                return (
                  <div
                    key={mod.moduleId}
                    className="flex flex-col justify-between p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 shadow-sm hover:shadow-md transition"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-2xl p-2 rounded-xl bg-slate-100 dark:bg-slate-800">
                          {mod.emoji}
                        </span>
                        <span
                          className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                            mod.progressPct === 100
                              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-300'
                              : mod.progressPct > 0
                              ? 'bg-blue-100 text-blue-700 dark:bg-blue-950/80 dark:text-blue-300'
                              : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                          }`}
                        >
                          {mod.progressPct === 100
                            ? 'Completado'
                            : mod.progressPct > 0
                            ? `${mod.progressPct}% en progreso`
                            : 'Por iniciar'}
                        </span>
                      </div>

                      <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1.5">
                        {mod.title}
                      </h3>

                      <p className="text-xs text-slate-500 mb-3">
                        {mod.completedTopics} de {mod.totalTopics} temas completados
                        {mod.quizPassed && ' · Evaluación aprobada'}
                      </p>

                      <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden mb-4">
                        <div
                          className={`h-full rounded-full transition-all duration-300 ${
                            mod.progressPct === 100 ? 'bg-emerald-500' : 'bg-blue-600'
                          }`}
                          style={{ width: `${mod.progressPct}%` }}
                        />
                      </div>

                      {/* Temario desplegable del módulo */}
                      {isExpanded && fullModule && (
                        <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2 mb-4">
                          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                            Lecciones del módulo:
                          </p>
                          <ul className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                            {fullModule.topics.map((t) => {
                              const childIds = t.children?.map((c) => c.id) || [];
                              const done = user ? isTopicCompleted(user.id, t.id) || (childIds.length > 0 && childIds.every((cid) => isTopicCompleted(user.id, cid))) : false;
                              return (
                                <React.Fragment key={t.id}>
                                  <li
                                    className="flex items-center justify-between text-xs p-1.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 font-medium"
                                  >
                                    <Link
                                      to={`/modulo/${mod.moduleId}/${t.id}`}
                                      className="flex-1 text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-cyan-400 line-clamp-1 pr-2"
                                    >
                                      {t.title}
                                    </Link>
                                    <button
                                      onClick={(e) => handleToggleTopic(t.id, e, childIds.length > 0 ? childIds : undefined)}
                                      className={`shrink-0 p-1 rounded-md transition ${
                                        done
                                          ? 'text-emerald-500 hover:text-emerald-600'
                                          : 'text-slate-300 hover:text-slate-500 dark:text-slate-600'
                                      }`}
                                      title={done ? 'Lección completada' : 'Marcar lección como completada'}
                                    >
                                      <CheckCircle2
                                        className={`w-4 h-4 ${done ? 'fill-emerald-500 text-white' : ''}`}
                                      />
                                    </button>
                                  </li>
                                  {t.children && t.children.length > 0 && (
                                    <ul className="pl-4 space-y-1 border-l border-slate-200/60 dark:border-slate-700/40 ml-2 my-1">
                                      {t.children.map((sub) => {
                                        const subDone = user ? isTopicCompleted(user.id, sub.id) : false;
                                        return (
                                          <li
                                            key={sub.id}
                                            className="flex items-center justify-between text-[11px] p-1 rounded-md hover:bg-slate-50 dark:hover:bg-slate-800/40"
                                          >
                                            <Link
                                              to={`/modulo/${mod.moduleId}/${t.id}/${sub.id}`}
                                              className="flex-1 text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-cyan-400 line-clamp-1 pr-2"
                                            >
                                              {sub.title}
                                            </Link>
                                            <button
                                              onClick={(e) => handleToggleTopic(sub.id, e)}
                                              className={`shrink-0 p-0.5 rounded transition ${
                                                subDone
                                                  ? 'text-emerald-500 hover:text-emerald-600'
                                                  : 'text-slate-300 hover:text-slate-500 dark:text-slate-600'
                                              }`}
                                              title={subDone ? 'Subtema completado' : 'Marcar subtema como completado'}
                                            >
                                              <CheckCircle2
                                                className={`w-3.5 h-3.5 ${subDone ? 'fill-emerald-500 text-white' : ''}`}
                                              />
                                            </button>
                                          </li>
                                        );
                                      })}
                                    </ul>
                                  )}
                                </React.Fragment>
                              );
                            })}
                          </ul>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                      <Link
                        to={`/modulo/${mod.moduleId}`}
                        className="flex-1 inline-flex items-center justify-center gap-1 px-3 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition"
                      >
                        Ir al módulo <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                      <button
                        onClick={() => setExpandedModuleId(isExpanded ? null : mod.moduleId)}
                        className="px-3 py-2 rounded-xl text-xs font-semibold border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition"
                      >
                        {isExpanded ? 'Ocultar' : 'Ver temas'}
                      </button>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* ─── TAB 3: Tareas y Evaluaciones ─── */}
      {activeTab === 'quizzes' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                Evaluaciones de Educación Médica Continua
              </h2>
              <p className="text-sm text-slate-500">
                Aprobación mínima de 70%-80% en cada cuestionario para acreditar horas curriculares
              </p>
            </div>

            {/* Filter buttons */}
            <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
              <button
                onClick={() => setQuizFilter('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                  quizFilter === 'all'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Todas ({quizzesList.length})
              </button>
              <button
                onClick={() => setQuizFilter('pending')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                  quizFilter === 'pending'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Pendientes ({quizzesList.filter((q) => !q.passed).length})
              </button>
              <button
                onClick={() => setQuizFilter('passed')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                  quizFilter === 'passed'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Aprobadas ({quizzesList.filter((q) => q.passed).length})
              </button>
            </div>
          </div>

          <div className="space-y-3">
            {quizzesList
              .filter((q) => {
                if (quizFilter === 'pending') return !q.passed;
                if (quizFilter === 'passed') return q.passed;
                return true;
              })
              .map((quiz) => (
                <div
                  key={quiz.topicId}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 shadow-sm"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                        {quiz.moduleTitle}
                      </span>
                      {quiz.passed ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Aprobado ({quiz.score}%)
                        </span>
                      ) : quiz.score != null ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" /> Intento no superado ({quiz.score}%)
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                          Sin presentar
                        </span>
                      )}
                    </div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                      {quiz.topicTitle}
                    </h3>
                  </div>

                  <div className="flex items-center gap-3">
                    <Link
                      to={quiz.topicUrl || `/modulo/${quiz.moduleId}`}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition"
                    >
                      {quiz.passed ? 'Repasar / Volver a intentar' : 'Presentar evaluación'}
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              ))}
          </div>

          {/* Historial detallado de intentos */}
          {attempts.length > 0 && (
            <div className="mt-8 pt-8 border-t border-slate-200 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-3">
                Historial cronológico de intentos
              </h3>
              <div className="space-y-2">
                {attempts.slice(0, 5).map((att) => (
                  <div
                    key={att.id}
                    className="flex items-center justify-between p-3 rounded-xl bg-slate-50/50 dark:bg-slate-800/30 text-xs border border-slate-100 dark:border-slate-800"
                  >
                    <div>
                      <p className="font-semibold text-slate-800 dark:text-slate-200">
                        {getModuleLabel(att.module_id)}
                      </p>
                      <p className="text-slate-400">
                        {new Date(att.completed_at).toLocaleString('es-MX', {
                          day: 'numeric',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span
                        className={`font-bold text-sm ${
                          att.passed ? 'text-emerald-600' : 'text-amber-600'
                        }`}
                      >
                        {att.score}%
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          att.passed
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                            : 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                        }`}
                      >
                        {att.passed ? 'Aprobado' : 'No aprobado'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ─── TAB: Tareas y Evaluaciones Asignadas ─── */}
      {activeTab === 'assignments' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Calendar className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                <span>Tareas y Exámenes Personalizados Asignados</span>
              </h2>
              <p className="text-sm text-slate-500">
                Actividades clínicas y exámenes calendarizados por tus profesores y directores académicos
              </p>
            </div>
            <span className="text-xs px-3 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-bold border border-indigo-200 dark:border-indigo-800 w-fit">
              {assignments.length} actividades asignadas
            </span>
          </div>

          {assignments.length === 0 ? (
            <div className="p-12 text-center rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 space-y-3 bg-white/40 dark:bg-slate-900/20">
              <Calendar className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto" />
              <h3 className="text-base font-bold text-slate-700 dark:text-slate-300">
                ¡Estás al día! No tienes tareas pendientes
              </h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Tus profesores te asignarán lecturas dirigidas, casos clínicos o exámenes de refuerzo conforme avances en los módulos.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {assignments.map((asg) => {
                const dueTime = new Date(asg.due_date).getTime();
                const now = Date.now();
                const isOverdue = dueTime < now && asg.status === 'pending';
                const daysRemaining = Math.ceil((dueTime - now) / 86400000);

                const isExam = asg.type === 'exam';
                const maxAttempts = asg.target_exam_config?.maxAttempts ?? 1;
                const attemptsCount = asg.target_exam_config?.attemptsCount ?? (asg.submitted_at || asg.status === 'submitted' || asg.status === 'approved' ? 1 : 0);
                const isAttemptsLimited = maxAttempts > 0;
                const attemptsExhausted = isAttemptsLimited && attemptsCount >= maxAttempts;
                const retakeStatus = asg.target_exam_config?.retakeStatus || 'none';

                return (
                  <div
                    key={asg.id}
                    className={`p-5 rounded-3xl border transition-all flex flex-col justify-between space-y-4 ${
                      asg.status === 'approved'
                        ? 'border-emerald-200/80 dark:border-emerald-900/50 bg-emerald-50/20 dark:bg-emerald-950/10'
                        : asg.status === 'submitted'
                        ? 'border-indigo-200/80 dark:border-indigo-900/50 bg-indigo-50/20 dark:bg-indigo-950/10'
                        : isOverdue
                        ? 'border-red-200 dark:border-red-900/60 bg-red-50/20 dark:bg-red-950/10'
                        : 'border-slate-200/80 dark:border-slate-800 bg-white/80 dark:bg-slate-900/60 shadow-xs'
                    }`}
                  >
                    <div className="space-y-2.5">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span
                          className={`px-2.5 py-0.5 rounded-lg text-[10px] font-bold uppercase tracking-wider ${
                            asg.type === 'exam'
                              ? 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300'
                              : asg.type === 'clinical_case'
                              ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                              : asg.type === 'emg_report'
                              ? 'bg-cyan-100 text-cyan-800 dark:bg-cyan-950 dark:text-cyan-300'
                              : 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300'
                          }`}
                        >
                          {asg.type === 'exam'
                            ? 'Examen Asignado'
                            : asg.type === 'clinical_case'
                            ? 'Caso Clínico'
                            : asg.type === 'emg_report'
                            ? 'Reporte de Trazo EMG'
                            : 'Tarea de Lectura'}
                        </span>

                        <span
                          className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                            isExam && retakeStatus === 'requested'
                              ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                              : isExam && retakeStatus === 'approved'
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                              : isExam && retakeStatus === 'rejected'
                              ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                              : asg.status === 'approved'
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                              : asg.status === 'submitted'
                              ? (isExam && attemptsExhausted ? 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300' : 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300')
                              : isOverdue
                              ? 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300'
                              : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                          }`}
                        >
                          {isExam && retakeStatus === 'requested'
                            ? 'Reintento Solicitado ⏳'
                            : isExam && retakeStatus === 'approved'
                            ? 'Reintento Autorizado ✓'
                            : isExam && retakeStatus === 'rejected'
                            ? 'Reintento Denegado'
                            : asg.status === 'approved'
                            ? 'Aprobada ✓'
                            : asg.status === 'submitted'
                            ? (isExam && attemptsExhausted ? 'Examen Finalizado' : 'Entregada (En revisión)')
                            : isOverdue
                            ? 'Entrega Vencida'
                            : 'Pendiente de Entrega'}
                        </span>
                      </div>

                      <h3 className="text-base font-bold text-slate-900 dark:text-white">
                        {asg.title}
                      </h3>

                      <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                        {asg.description}
                      </p>

                      {/* Tags de configuración del examen */}
                      {asg.type === 'exam' && (
                        <div className="flex flex-wrap items-center gap-1.5 pt-1">
                          {asg.target_exam_config?.subtopicTitle && (
                            <span className="px-2 py-0.5 rounded-lg bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 text-[10px] font-bold border border-purple-200 dark:border-purple-800">
                              Subtema: {asg.target_exam_config.subtopicTitle}
                            </span>
                          )}
                          {asg.target_exam_config?.questionCount && (
                            <span className="px-2 py-0.5 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 text-[10px] font-bold border border-blue-200 dark:border-blue-800">
                              {asg.target_exam_config.questionCount} reactivos
                            </span>
                          )}
                          {asg.target_exam_config?.timeLimitMinutes && (
                            <span className="px-2 py-0.5 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 text-[10px] font-bold border border-amber-200 dark:border-amber-800 flex items-center gap-1">
                              <Clock className="w-2.5 h-2.5" /> {asg.target_exam_config.timeLimitMinutes} min
                            </span>
                          )}
                          <span className="px-2 py-0.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold border border-emerald-200 dark:border-emerald-800">
                            Mínimo: {asg.min_score || 70}%
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded-lg text-[10px] font-bold border ${
                              attemptsExhausted
                                ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800'
                                : 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800'
                            }`}
                          >
                            Intentos: {attemptsCount} / {maxAttempts > 0 ? maxAttempts : 'Ilimitados'}
                          </span>
                        </div>
                      )}

                      <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 text-xs space-y-1">
                        <p className="font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-indigo-500" />
                          Fecha de entrega:{' '}
                          <span className="font-bold">
                            {new Date(asg.due_date).toLocaleString('es-MX', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </p>

                        <p className="text-[11px] text-slate-500">
                          {asg.status === 'approved' || asg.status === 'submitted' ? (
                            <span className="text-emerald-600 font-medium">
                              Entregada el {asg.submitted_at ? new Date(asg.submitted_at).toLocaleDateString('es-MX') : 'recientemente'}
                            </span>
                          ) : isOverdue ? (
                            <span className="text-red-500 font-bold">
                              ⚠️ Plazo límite expirado. Puedes entregarla con retraso.
                            </span>
                          ) : daysRemaining <= 1 ? (
                            <span className="text-amber-600 font-bold">
                              ⏰ ¡Vence hoy o en menos de 24 horas!
                            </span>
                          ) : (
                            <span className="text-slate-500 font-medium">
                              Quedan {daysRemaining} días para la entrega.
                            </span>
                          )}
                        </p>
                      </div>

                      {/* Grade & Teacher Feedback Display */}
                      {asg.feedback && (
                        <div className="p-3 rounded-2xl bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-xs space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-emerald-900 dark:text-emerald-200 flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              Evaluación del Profesor:
                            </span>
                            {asg.grade != null && (
                              <span className="px-2 py-0.5 rounded-lg bg-emerald-600 text-white font-extrabold text-[11px]">
                                {asg.grade}/100 pts
                              </span>
                            )}
                          </div>
                          <p className="text-slate-700 dark:text-slate-200 italic">
                            "{asg.feedback}"
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Action Button */}
                    <div className="pt-2">
                      {asg.type === 'exam' ? (
                        activeExamLock && activeExamLock.assignmentId === asg.id ? (
                          <button
                            type="button"
                            onClick={() => {
                              navigate('/examenes/sesion', {
                                state: {
                                  assignmentId: asg.id,
                                  config: asg.target_exam_config || { mode: 'FULL_SIMULATION', feedbackMode: 'end' },
                                  expiresAt: activeExamLock.expiresAt,
                                  strictLock: true,
                                  selectedQuestionIds: asg.target_exam_config?.selectedQuestionIds,
                                  assignmentTitle: asg.title,
                                },
                              });
                            }}
                            className="w-full inline-flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-700 hover:to-amber-700 text-white text-xs font-bold transition shadow-xs cursor-pointer animate-pulse"
                          >
                            <Play className="w-3.5 h-3.5 fill-white" />
                            <span>
                              Continuar Examen en Curso ({formatRemainingExamTime(remainingActiveSeconds || 0)})
                            </span>
                          </button>
                        ) : attemptsExhausted && retakeStatus === 'requested' ? (
                          <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-center space-y-1">
                            <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-amber-800 dark:text-amber-200">
                              <Clock className="w-3.5 h-3.5 text-amber-600 animate-spin" />
                              <span>Solicitud de Reintento en Revisión</span>
                            </div>
                            <p className="text-[11px] text-amber-700 dark:text-amber-300">
                              Has solicitado permiso para repetir esta evaluación ({attemptsCount}/{maxAttempts} intentos). El docente revisará tu justificación académica.
                            </p>
                          </div>
                        ) : attemptsExhausted && retakeStatus === 'rejected' ? (
                          <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-center space-y-1.5">
                            <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-rose-800 dark:text-rose-200">
                              <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
                              <span>Reintento No Autorizado</span>
                            </div>
                            <p className="text-[11px] text-rose-700 dark:text-rose-300">
                              {asg.target_exam_config?.retakeReviewNotes
                                ? `Motivo: ${asg.target_exam_config.retakeReviewNotes}`
                                : 'El cuerpo docente ha determinado no otorgar intentos adicionales para este examen.'}
                            </p>
                            {asg.target_exam_config?.allowRetakeRequest !== false && (
                              <button
                                type="button"
                                onClick={() => {
                                  setRetakeModalAssignment(asg);
                                  setRetakeReason('');
                                }}
                                className="inline-flex items-center gap-1 text-[11px] text-rose-700 dark:text-rose-300 font-bold underline hover:opacity-80 cursor-pointer"
                              >
                                Reenviar solicitud con nueva justificación
                              </button>
                            )}
                          </div>
                        ) : attemptsExhausted ? (
                          <div className="space-y-2">
                            <div className="w-full py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-semibold text-center flex items-center justify-center gap-1.5">
                              <Lock className="w-3.5 h-3.5 text-slate-400" />
                              <span>
                                {asg.status === 'approved' ? 'Evaluación Aprobada ✓' : 'Intentos Agotados'}{' '}
                                ({attemptsCount}/{maxAttempts})
                              </span>
                            </div>
                            {asg.target_exam_config?.allowRetakeRequest !== false ? (
                              <button
                                type="button"
                                onClick={() => {
                                  setRetakeModalAssignment(asg);
                                  setRetakeReason('');
                                }}
                                className="w-full inline-flex items-center justify-center gap-2 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold transition shadow-xs cursor-pointer"
                              >
                                <RotateCcw className="w-3.5 h-3.5" />
                                <span>Solicitar Permiso para Repetir Examen</span>
                              </button>
                            ) : (
                              <p className="text-[10px] text-center text-slate-400">
                                Esta evaluación oficial no admite solicitudes de reintento.
                              </p>
                            )}
                          </div>
                        ) : (
                          <div className="space-y-1.5">
                            {retakeStatus === 'approved' && (
                              <div className="px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-[11px] text-emerald-700 dark:text-emerald-300 font-semibold flex items-center gap-1.5 justify-center">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                <span>Reintento concedido por el profesor ({attemptsCount}/{maxAttempts})</span>
                              </div>
                            )}
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedExamForModal(asg);
                                setAcceptedExamRules(false);
                              }}
                              className="w-full inline-flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white text-xs font-bold transition shadow-xs cursor-pointer"
                            >
                              <Play className="w-3.5 h-3.5" />
                              <span>
                                {attemptsCount > 0
                                  ? `Realizar Reintento (${attemptsCount + 1}/${maxAttempts > 0 ? maxAttempts : '∞'})`
                                  : 'Realizar Examen Asignado'}
                              </span>
                            </button>
                          </div>
                        )
                      ) : asg.type === 'clinical_case' ? (
                        asg.status === 'approved' ? (
                          <div className="space-y-2">
                            <div className="w-full py-2.5 rounded-xl bg-emerald-100/70 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 text-xs font-bold text-center flex items-center justify-center gap-1.5 border border-emerald-300 dark:border-emerald-800">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              <span>Caso Clínico Aprobado ({asg.grade ?? 100}/100)</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                navigate('/ejercicios', {
                                  state: {
                                    assignmentId: asg.id,
                                    patternId: (asg.target_exam_config as any)?.patternId,
                                    title: asg.title,
                                    studentId: user?.id,
                                  },
                                });
                              }}
                              className="w-full inline-flex items-center justify-center gap-1.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold transition cursor-pointer"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                              <span>Volver a practicar caso</span>
                            </button>
                          </div>
                        ) : asg.status === 'submitted' ? (
                          <div className="space-y-2">
                            <div className="w-full py-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 text-xs font-semibold text-center border border-indigo-200 dark:border-indigo-800">
                              Caso Entregado · En revisión docente
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                navigate('/ejercicios', {
                                  state: {
                                    assignmentId: asg.id,
                                    patternId: (asg.target_exam_config as any)?.patternId,
                                    title: asg.title,
                                    studentId: user?.id,
                                  },
                                });
                              }}
                              className="w-full inline-flex items-center justify-center gap-2 py-2 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white text-xs font-bold transition shadow-xs cursor-pointer"
                            >
                              <Activity className="w-3.5 h-3.5" />
                              <span>Repetir / Revisar Caso en Simulador</span>
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => {
                              navigate('/ejercicios', {
                                state: {
                                  assignmentId: asg.id,
                                  patternId: (asg.target_exam_config as any)?.patternId,
                                  title: asg.title,
                                  studentId: user?.id,
                                },
                              });
                            }}
                            className="w-full inline-flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white text-xs font-bold transition shadow-xs cursor-pointer"
                          >
                            <Activity className="w-3.5 h-3.5" />
                            <span>Resolver Caso Clínico Asignado</span>
                          </button>
                        )
                      ) : asg.status === 'approved' ? (
                        <div className="w-full py-2 rounded-xl bg-emerald-100/60 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 text-xs font-bold text-center">
                          Actividad Aprobada
                        </div>
                      ) : asg.status === 'submitted' ? (
                        <button
                          type="button"
                          onClick={() => {
                            setSubmittingAsg(asg);
                            setSubmitNotes(asg.student_notes || '');
                          }}
                          className="w-full inline-flex items-center justify-center gap-2 py-2 rounded-xl border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 text-indigo-600 dark:text-indigo-300 text-xs font-semibold transition cursor-pointer"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>Modificar Entrega Enviada</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            setSubmittingAsg(asg);
                            setSubmitNotes('');
                          }}
                          className="w-full inline-flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-bold transition shadow-xs cursor-pointer"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>Entregar Tarea / Conclusiones</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Modal para que el Alumno entregue su Tarea */}
          {submittingAsg && (
            <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
              <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 space-y-4 shadow-xl">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Send className="w-4 h-4 text-blue-600" />
                    <span>Entregar Tarea: {submittingAsg.title}</span>
                  </h3>
                  <button
                    type="button"
                    onClick={() => setSubmittingAsg(null)}
                    className="text-slate-400 hover:text-slate-600"
                  >
                    ✕
                  </button>
                </div>

                <p className="text-xs text-slate-500">
                  {submittingAsg.description}
                </p>

                <form onSubmit={handleSubmitAssignment} className="space-y-4 text-xs">
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Conclusiones, Respuesta o Enlace del Caso Clínico
                    </label>
                    <textarea
                      rows={6}
                      required
                      value={submitNotes}
                      onChange={(e) => setSubmitNotes(e.target.value)}
                      placeholder="Escribe tus hallazgos neurofisiológicos, diagnóstico topográfico o pega el enlace a tu reporte de trazo..."
                      className="w-full p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs focus:ring-2 focus:ring-blue-500/40 focus:outline-none"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setSubmittingAsg(null)}
                      className="px-4 py-2 rounded-xl text-slate-500 hover:bg-slate-100 text-xs font-semibold"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={savingSubmission}
                      className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition disabled:opacity-50"
                    >
                      {savingSubmission ? 'Enviando...' : 'Confirmar Entrega'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Modal para que el Alumno solicite permiso de repetición de examen */}
          {retakeModalAssignment && (
            <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
              <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 space-y-4 shadow-xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                      <RotateCcw className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-900 dark:text-white">
                        Solicitar Permiso para Repetir Examen
                      </h3>
                      <p className="text-xs text-slate-500 truncate max-w-xs">
                        {retakeModalAssignment.title}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      if (!sendingRetake) {
                        setRetakeModalAssignment(null);
                        setRetakeReason('');
                      }
                    }}
                    className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 text-base font-bold"
                  >
                    ✕
                  </button>
                </div>

                {/* Información del examen e intentos */}
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 text-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Intentos realizados:</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">
                      {retakeModalAssignment.target_exam_config?.attemptsCount ?? (retakeModalAssignment.status === 'submitted' || retakeModalAssignment.status === 'approved' ? 1 : 0)} de {retakeModalAssignment.target_exam_config?.maxAttempts ?? 1} reglamentarios
                    </span>
                  </div>
                  {retakeModalAssignment.grade != null && (
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Última calificación:</span>
                      <span className="font-bold text-amber-600 dark:text-amber-400">
                        {retakeModalAssignment.grade} / 100 pts
                      </span>
                    </div>
                  )}
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 pt-1 border-t border-slate-200 dark:border-slate-700">
                    Para mantener la integridad académica del curso COMEFYR, debes enviar una justificación a tu profesor explicando por qué requieres una oportunidad adicional (ej. falla técnica comprobable, profundización de estudio, etc.).
                  </p>
                </div>

                <form onSubmit={handleSendRetakeRequest} className="space-y-4 text-xs">
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Justificación Académica para el Profesor <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      rows={4}
                      required
                      minLength={15}
                      value={retakeReason}
                      onChange={(e) => setRetakeReason(e.target.value)}
                      placeholder="Estimado profesor: Solicito la oportunidad de repetir esta evaluación debido a que..."
                      className="w-full p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs focus:ring-2 focus:ring-amber-500/40 focus:outline-none"
                    />
                    <span className="text-[10px] text-slate-400">Mínimo 15 caracteres. Sé claro y conciso.</span>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2">
                    <button
                      type="button"
                      disabled={sendingRetake}
                      onClick={() => {
                        setRetakeModalAssignment(null);
                        setRetakeReason('');
                      }}
                      className="px-4 py-2 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold disabled:opacity-50"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={sendingRetake || retakeReason.trim().length < 15}
                      className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white text-xs font-bold transition disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
                    >
                      {sendingRetake ? (
                        <>
                          <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>Enviando solicitud...</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-3.5 h-3.5" />
                          <span>Enviar Solicitud al Profesor</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Modal de Advertencia y Confirmación de Examen Asignado (Candado Estricto) */}
          {selectedExamForModal && (
            <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="w-full max-w-xl bg-white dark:bg-slate-900 rounded-3xl border-2 border-indigo-500/40 dark:border-indigo-500/30 p-6 sm:p-7 space-y-5 shadow-2xl">
                {/* Header */}
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/30">
                      <AlertTriangle className="w-6 h-6 animate-pulse" />
                    </div>
                    <div>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30">
                        Protocolo de Evaluación Oficial
                      </span>
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">
                        {selectedExamForModal.title}
                      </h3>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      if (!startingExam) {
                        setSelectedExamForModal(null);
                        setAcceptedExamRules(false);
                      }
                    }}
                    className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 text-lg font-bold"
                  >
                    ✕
                  </button>
                </div>

                {/* Scope & parameters */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 text-center">
                  <div className="p-2">
                    <p className="text-[10px] uppercase font-bold text-slate-400">Tema Evaluado</p>
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate mt-0.5" title={selectedExamForModal.target_topic_title || 'General'}>
                      {selectedExamForModal.target_topic_title || 'General'}
                    </p>
                  </div>
                  <div className="p-2">
                    <p className="text-[10px] uppercase font-bold text-slate-400">Preguntas</p>
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-0.5">
                      {selectedExamForModal.target_exam_config?.selectedQuestionIds?.length ||
                       selectedExamForModal.target_exam_config?.numberOfQuestions ||
                       10} reactivos
                    </p>
                  </div>
                  <div className="p-2">
                    <p className="text-[10px] uppercase font-bold text-slate-400">Tiempo Límite</p>
                    <p className="text-xs font-bold text-amber-600 dark:text-amber-400 mt-0.5">
                      {selectedExamForModal.target_exam_config?.timeLimitMinutes || 20} min
                    </p>
                  </div>
                  <div className="p-2">
                    <p className="text-[10px] uppercase font-bold text-slate-400">Aprobatoria</p>
                    <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
                      {selectedExamForModal.min_score || 80}%
                    </p>
                  </div>
                </div>

                {selectedExamForModal.target_subtopic_title && (
                  <div className="px-3.5 py-2 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60 flex items-center gap-2 text-xs text-blue-800 dark:text-blue-300">
                    <Layers className="w-4 h-4 shrink-0 text-blue-500" />
                    <span>
                      <strong>Subtema enfocado:</strong> {selectedExamForModal.target_subtopic_title}
                    </span>
                  </div>
                )}

                {/* Important Strict Timing Warning Box */}
                <div className="p-4 rounded-2xl bg-gradient-to-br from-red-500/10 via-amber-500/10 to-red-500/5 border-2 border-red-500/40 dark:border-red-500/30 space-y-2">
                  <div className="flex items-center gap-2 text-red-600 dark:text-red-400 font-bold text-xs uppercase tracking-wide">
                    <ShieldAlert className="w-4 h-4 shrink-0" />
                    <span>Advertencia de Candado Estricto de Tiempo</span>
                  </div>
                  <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                    Al hacer clic en <strong className="text-slate-900 dark:text-white">"Comenzar Evaluación Oficial"</strong>, el temporizador iniciará de forma <strong>ininterrumpida e irreversible</strong>.
                  </p>
                  <ul className="text-xs text-slate-600 dark:text-slate-400 space-y-1.5 list-disc pl-4">
                    <li>
                      <strong>El tiempo no se detiene:</strong> Incluso si cierras la plataforma, apagas la computadora o se desconecta la red, el reloj continuará corriendo en tiempo real.
                    </li>
                    <li>
                      <strong>Cierre automático forzado:</strong> Al expirar los {selectedExamForModal.target_exam_config?.timeLimitMinutes || 20} minutos reglamentarios, el examen se enviará y calificará con tus respuestas registradas.
                    </li>
                    <li>
                      <strong>Registro académico:</strong> Tu puntaje quedará asentado en el Kardex y será visible para el cuerpo docente y COMEFYR.
                    </li>
                  </ul>
                </div>

                {/* Checkbox of rule acceptance */}
                <label className="flex items-start gap-3 p-3 rounded-xl bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200/70 dark:hover:bg-slate-800 cursor-pointer transition select-none">
                  <input
                    type="checkbox"
                    checked={acceptedExamRules}
                    onChange={(e) => setAcceptedExamRules(e.target.checked)}
                    className="mt-0.5 h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 leading-snug">
                    He leído y acepto las condiciones. Entiendo que debo responder en una sola sesión continua y que el tiempo continuará corriendo si salgo de la plataforma.
                  </span>
                </label>

                {/* Actions */}
                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    disabled={startingExam}
                    onClick={() => {
                      setSelectedExamForModal(null);
                      setAcceptedExamRules(false);
                    }}
                    className="px-4 py-2.5 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold transition disabled:opacity-50"
                  >
                    Cancelar / Volver Luego
                  </button>
                  <button
                    type="button"
                    disabled={!acceptedExamRules || startingExam}
                    onClick={handleStartStrictExam}
                    className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-indigo-600 hover:from-red-700 hover:to-indigo-700 text-white text-xs font-black shadow-lg shadow-indigo-600/30 transition disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                  >
                    {startingExam ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Iniciando examen...</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-3.5 h-3.5 fill-white" />
                        <span>Comenzar Evaluación Oficial</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ─── TAB 4: Centro de Notificaciones ─── */}
      {activeTab === 'notifications' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                Bandeja de Notificaciones y Avisos
              </h2>
              <p className="text-sm text-slate-500">
                Avisos académicos, confirmación de cédula y convocatorias COMEFYR
              </p>
            </div>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllNotifsRead}
                className="text-xs font-bold text-blue-600 dark:text-cyan-400 hover:underline"
              >
                Marcar todas como leídas
              </button>
            )}
          </div>

          <div className="space-y-3">
            {notifications.map((notif) => (
              <div
                key={notif.id}
                onClick={() => handleMarkNotifRead(notif.id)}
                className={`p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer ${
                  notif.isRead
                    ? 'border-slate-200/60 dark:border-slate-800 bg-white/50 dark:bg-slate-900/40 opacity-80'
                    : 'border-blue-200 dark:border-blue-900/60 bg-blue-50/40 dark:bg-blue-950/20 shadow-sm'
                }`}
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        notif.isRead ? 'bg-transparent' : 'bg-blue-600 dark:bg-cyan-400'
                      }`}
                    />
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                        notif.type === 'cedula'
                          ? 'bg-cyan-100 text-cyan-800 dark:bg-cyan-950 dark:text-cyan-300'
                          : notif.type === 'workshop'
                          ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300'
                          : 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                      }`}
                    >
                      {notif.type}
                    </span>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                      {notif.title}
                    </h3>
                  </div>
                  <span className="text-[11px] text-slate-400 shrink-0">
                    {new Date(notif.createdAt).toLocaleDateString('es-MX', {
                      day: 'numeric',
                      month: 'short',
                    })}
                  </span>
                </div>

                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed pl-4 mb-3">
                  {notif.message}
                </p>

                {notif.linkUrl && (
                  <div className="pl-4">
                    <Link
                      to={notif.linkUrl}
                      className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 dark:text-cyan-400 hover:underline"
                    >
                      Ir a la sección <ChevronRight className="w-3 h-3" />
                    </Link>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ─── TAB 5: Constancia y Certificación COMEFYR ─── */}
      {activeTab === 'certificate' && (
        <div className="space-y-8">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              Acreditación y Certificado de Educación Médica Continua
            </h2>
            <p className="text-sm text-slate-500">
              Colegio Mexicano de Medicina de Rehabilitación (COMEFYR)
            </p>
          </div>

          {/* Requisitos Checklist */}
          <div className="p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">
              Requisitos reglamentarios para emisión del diploma:
            </h3>

            <div className="space-y-3">
              {/* Req 1: Cédula Profesional */}
              <div className="flex items-center justify-between p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
                <div className="flex items-center gap-3">
                  {certRequirements?.cedulaVerified ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 fill-emerald-500 text-white" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-amber-500" />
                  )}
                  <div>
                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                      1. Cédula Profesional Verificada ante SEP/DGP
                    </p>
                    <p className="text-xs text-slate-500">
                      {certRequirements?.cedulaVerified
                        ? `Acreditada: ${profile?.cedula_profesional}`
                        : 'Obligatorio para otorgar validez legal a las horas curriculares en México.'}
                    </p>
                  </div>
                </div>
                {!certRequirements?.cedulaVerified && (
                  <Link
                    to="/cuenta"
                    className="px-3 py-1.5 rounded-lg text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white transition"
                  >
                    Validar Cédula
                  </Link>
                )}
              </div>

              {/* Req 2: Avance Curricular */}
              <div className="flex items-center justify-between p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
                <div className="flex items-center gap-3">
                  {certRequirements && certRequirements.modulesCompletedPct >= 95 ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 fill-emerald-500 text-white" />
                  ) : (
                    <Clock className="w-5 h-5 text-slate-400" />
                  )}
                  <div>
                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                      2. Revisión de los 13 Módulos Curriculares
                    </p>
                    <p className="text-xs text-slate-500">
                      Avance actual: {certRequirements?.modulesCompletedPct}% (Requerido: ≥ 95%)
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setActiveTab('modules')}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                >
                  Continuar temario
                </button>
              </div>

              {/* Req 3: Calificación Aprobatoria */}
              <div className="flex items-center justify-between p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
                <div className="flex items-center gap-3">
                  {certRequirements && certRequirements.averageScore >= 80 ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 fill-emerald-500 text-white" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-slate-400" />
                  )}
                  <div>
                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                      3. Promedio Aprobatorio en Evaluaciones Médicas
                    </p>
                    <p className="text-xs text-slate-500">
                      Promedio actual: {certRequirements?.averageScore}% (Mínimo exigido por COMEFYR: 80%)
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setActiveTab('quizzes')}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                >
                  Ver evaluaciones
                </button>
              </div>
            </div>
          </div>

          {/* Previsualización del Certificado Oficial */}
          <div className="relative overflow-hidden rounded-3xl border-4 border-double border-amber-600/40 bg-gradient-to-br from-amber-50/60 via-white to-slate-50 dark:from-slate-900 dark:via-slate-950 dark:to-indigo-950 p-8 sm:p-12 text-center shadow-xl">
            <div className="space-y-4 max-w-2xl mx-auto">
              <div className="flex items-center justify-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white font-black text-xl shadow-md">
                  NS
                </div>
                <div>
                  <h3 className="text-base font-extrabold tracking-tight text-slate-900 dark:text-white uppercase">
                    Colegio Mexicano de Medicina de Rehabilitación
                  </h3>
                  <p className="text-xs font-bold text-blue-600 dark:text-cyan-400">
                    COMEFYR · Comité de Electrodiagnóstico y Neurofisiología Clínica
                  </p>
                </div>
              </div>

              <p className="text-xs tracking-widest uppercase font-semibold text-slate-500 pt-3">
                Otorga la presente constancia con valor curricular a:
              </p>

              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white border-b border-amber-500/30 pb-3">
                Dr(a). {displayName}
              </h2>

              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Por haber completado satisfactoriamente el programa académico de{' '}
                <strong className="text-slate-900 dark:text-white">
                  Electrodiagnóstico Integral y Electromiografía Clínica (ElectoDX Diplomado)
                </strong>
                , con un total de <strong>80 horas curriculares</strong> y{' '}
                <strong>40 créditos de Educación Médica Continua (CME)</strong>.
              </p>

              <div className="pt-6 flex flex-wrap items-center justify-between gap-4 text-left border-t border-slate-200 dark:border-slate-800 text-xs text-slate-500">
                <div>
                  <p className="font-bold text-slate-800 dark:text-slate-200">
                    Folio Digital Oficial:
                  </p>
                  <p className="font-mono text-indigo-600 dark:text-indigo-400">
                    {certRequirements?.certificateFolio}
                  </p>
                </div>
                <div>
                  <p className="font-bold text-slate-800 dark:text-slate-200">
                    Cédula Profesional:
                  </p>
                  <p className="font-mono">
                    {profile?.cedula_profesional || 'Pendiente de registrar'}
                  </p>
                </div>
                <div>
                  <p className="font-bold text-slate-800 dark:text-slate-200">
                    Fecha de Acreditación:
                  </p>
                  <p>{new Date().toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {user?.id && (
        <StudentKardexModal
          isOpen={showKardexModal}
          onClose={() => setShowKardexModal(false)}
          studentId={user.id}
          profile={profile}
        />
      )}
    </div>
  );
}
