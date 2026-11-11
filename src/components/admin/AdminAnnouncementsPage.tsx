import { useEffect, useMemo, useState } from 'react';
import {
  Bell,
  Send,
  Sparkles,
  Video,
  CheckCircle2,
  AlertTriangle,
  Trash2,
  RefreshCw,
  Smartphone,
  Eye,
  Search,
  Calendar,
  Copy,
  Megaphone,
  GraduationCap,
} from 'lucide-react';
import { AdminLayout } from './AdminLayout';
import { useAuth } from '../../contexts/AuthProvider';
import { getCourses, getWorkshops } from '../../services/courseService';
import { loadGradeableStudents } from '../../services/academicAnalyticsService';
import {
  publishPlatformAnnouncement,
  listPlatformAnnouncements,
  deletePlatformAnnouncement,
  resendAnnouncementPush,
  getPushSubscriptionStats,
  type AnnouncementCategory,
  type AnnouncementSeverity,
  type AnnouncementTargetScope,
  type PlatformAnnouncementWithStats,
  type PushSubscriptionStats,
} from '../../services/announcementService';
import {
  getNotificationPermission,
  requestNotificationPermission,
  registerWebPushSubscription,
  sendTestNotification,
} from '../../services/deviceNotificationService';
import type { Course, LiveWorkshop } from '../../types/database';
import type { AdminProfileRow } from '../../types/admin';

const CATEGORY_OPTIONS: Array<{
  value: AnnouncementCategory;
  label: string;
  badgeClass: string;
}> = [
  {
    value: 'taller',
    label: 'Clase en Vivo / Taller',
    badgeClass: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300',
  },
  {
    value: 'evaluacion',
    label: 'Evaluación / Tarea / Caso',
    badgeClass: 'bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300',
  },
  {
    value: 'recordatorio',
    label: 'Recordatorio Académico',
    badgeClass: 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300',
  },
  {
    value: 'aviso',
    label: 'Aviso Oficial',
    badgeClass: 'bg-sky-100 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300',
  },
  {
    value: 'general',
    label: 'General',
    badgeClass: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
  },
];

const SEVERITY_OPTIONS: Array<{
  value: AnnouncementSeverity;
  label: string;
  description: string;
  pillClass: string;
}> = [
  {
    value: 'info',
    label: 'Informativo',
    description: 'Azul · Aviso estándar o nueva sesión',
    pillClass: 'border-sky-300 bg-sky-50 text-sky-800 dark:border-sky-800 dark:bg-sky-950/50 dark:text-sky-300',
  },
  {
    value: 'success',
    label: 'Disponible / Positivo',
    description: 'Verde · Grabación subida o material listo',
    pillClass: 'border-emerald-300 bg-emerald-50 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300',
  },
  {
    value: 'warning',
    label: 'Importante',
    description: 'Ámbar · Cambio de horario o entrega próxima',
    pillClass: 'border-amber-300 bg-amber-50 text-amber-800 dark:border-amber-800 dark:bg-amber-950/50 dark:text-amber-300',
  },
  {
    value: 'urgent',
    label: 'Urgente',
    description: 'Rojo · Sala en vivo ahora o aviso crítico',
    pillClass: 'border-rose-300 bg-rose-50 text-rose-800 dark:border-rose-800 dark:bg-rose-950/50 dark:text-rose-300',
  },
];

const QUICK_ROUTES = [
  { label: 'Bandeja de avisos del alumno', url: '/portal?tab=notifications' },
  { label: 'Panel principal del alumno', url: '/portal' },
  { label: 'Cartelera de Clases en Vivo', url: '/talleres' },
  { label: 'Tareas y Casos Clínicos', url: '/portal?tab=assignments' },
  { label: 'Evaluaciones y Exámenes', url: '/portal?tab=quizzes' },
  { label: 'Calendario Académico', url: '/portal?tab=agenda' },
];

export default function AdminAnnouncementsPage() {
  const { user } = useAuth();

  const [announcements, setAnnouncements] = useState<PlatformAnnouncementWithStats[]>([]);
  const [workshops, setWorkshops] = useState<LiveWorkshop[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [students, setStudents] = useState<AdminProfileRow[]>([]);
  const [pushStats, setPushStats] = useState<PushSubscriptionStats>({
    total_devices: 0,
    unique_users: 0,
    student_users: 0,
  });
  const [loading, setLoading] = useState(true);

  // Estado del formulario de emisión
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [category, setCategory] = useState<AnnouncementCategory>('taller');
  const [severity, setSeverity] = useState<AnnouncementSeverity>('info');
  const [targetScope, setTargetScope] = useState<AnnouncementTargetScope>('all_students');
  const [targetCourseId, setTargetCourseId] = useState('');
  const [targetWorkshopId, setTargetWorkshopId] = useState('');
  const [targetUserId, setTargetUserId] = useState('');
  const [actionUrl, setActionUrl] = useState('/portal?tab=notifications');
  const [actionRequired, setActionRequired] = useState(false);
  const [sendPush, setSendPush] = useState(true);

  // Selector de clase para autocompletar plantilla
  const [templateWorkshopId, setTemplateWorkshopId] = useState('');

  // Estados de envío y feedback
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedbackBanner, setFeedbackBanner] = useState<{
    tone: 'success' | 'warning' | 'error';
    text: string;
  } | null>(null);
  const [resendingId, setResendingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Filtros de historial
  const [searchQ, setSearchQ] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'all' | AnnouncementCategory>('all');

  // Permiso de este dispositivo
  const [myDevicePerm, setMyDevicePerm] = useState(getNotificationPermission());
  const [testingMyPush, setTestingMyPush] = useState(false);

  const loadAll = async () => {
    setLoading(true);
    try {
      const [annList, wsList, courseList, studList, pStats] = await Promise.all([
        listPlatformAnnouncements(60),
        getWorkshops(),
        getCourses(),
        loadGradeableStudents(user?.id),
        getPushSubscriptionStats(),
      ]);
      setAnnouncements(annList);
      setWorkshops(wsList);
      setCourses(courseList);
      setStudents(studList);
      setPushStats(pStats);
      if (wsList.length > 0 && !templateWorkshopId) {
        setTemplateWorkshopId(wsList[0].id);
      }
      if (courseList.length > 0 && !targetCourseId) {
        setTargetCourseId(courseList[0].id);
      }
    } catch (err) {
      console.error('[AdminAnnouncementsPage] Error loading data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadAll();
  }, [user?.id]);

  // Plantillas rápidas
  const applyNewLiveClassTemplate = (ws?: LiveWorkshop) => {
    const chosen = ws ?? workshops.find((w) => w.id === templateWorkshopId) ?? workshops[0];
    setCategory('taller');
    setSeverity('info');
    setActionRequired(true);
    if (chosen) {
      const dateObj = new Date(chosen.scheduled_at);
      const dateStr = dateObj.toLocaleDateString('es-MX', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
      });
      const timeStr = dateObj.toLocaleTimeString('es-MX', {
        hour: '2-digit',
        minute: '2-digit',
      });
      setTitle(`🎥 Clase en vivo: ${chosen.title}`);
      setMessage(
        `Se ha programado la sesión «${chosen.title}» para el ${dateStr} a las ${timeStr}. Ingresa puntualmente desde el aula virtual.`
      );
      setActionUrl(`/taller/${chosen.id}`);
      setTargetWorkshopId(chosen.id);
    } else {
      setTitle('🎥 Nueva clase en vivo programada');
      setMessage('Se ha programado una nueva sesión en vivo en el calendario académico. Revisa el horario y enlace de acceso.');
      setActionUrl('/talleres');
    }
  };

  const applyRecordingReadyTemplate = (ws?: LiveWorkshop) => {
    const recordedList = workshops.filter((w) => Boolean(w.recording_url?.trim()));
    const chosen =
      ws ??
      recordedList.find((w) => w.id === templateWorkshopId) ??
      recordedList[0] ??
      workshops[0];
    setCategory('taller');
    setSeverity('success');
    setActionRequired(false);
    if (chosen) {
      setTitle(`🎬 Grabación disponible: ${chosen.title}`);
      setMessage(
        `Ya está disponible el video de la clase «${chosen.title}». Puedes reproducirlo desde el temario o el aula virtual para acreditar tu asistencia (${chosen.min_watch_percent || 85}% requerido).`
      );
      setActionUrl(`/taller/${chosen.id}`);
      setTargetWorkshopId(chosen.id);
    } else {
      setTitle('🎬 Nueva grabación de clase disponible');
      setMessage('Ya puedes consultar la grabación de la última sesión en el aula virtual.');
      setActionUrl('/talleres');
    }
  };

  const applyLiveNowUrgentTemplate = (ws?: LiveWorkshop) => {
    const chosen = ws ?? workshops.find((w) => w.id === templateWorkshopId) ?? workshops[0];
    setCategory('taller');
    setSeverity('urgent');
    setActionRequired(true);
    if (chosen) {
      setTitle(`🔴 ¡Estamos en vivo! ${chosen.title}`);
      setMessage(
        `La sala de transmisión para «${chosen.title}» ya está abierta. Haz clic en esta notificación para entrar ahora mismo.`
      );
      setActionUrl(`/taller/${chosen.id}`);
      setTargetWorkshopId(chosen.id);
    } else {
      setTitle('🔴 ¡Clase en vivo iniciando ahora!');
      setMessage('La sala de transmisión ya está abierta. Conéctate ahora mismo.');
      setActionUrl('/talleres');
    }
  };

  const applyEvaluationReminderTemplate = () => {
    setCategory('evaluacion');
    setSeverity('warning');
    setActionRequired(true);
    setTitle('📋 Recordatorio de evaluación y entregas pendientes');
    setMessage(
      'Te recordamos revisar tu bandeja de tareas, casos clínicos y cuestionarios del módulo en curso antes de la fecha límite establecida.'
    );
    setActionUrl('/portal?tab=assignments');
  };

  const handlePublish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) return;

    setIsSubmitting(true);
    setFeedbackBanner(null);

    try {
      const result = await publishPlatformAnnouncement({
        title: title.trim(),
        message: message.trim(),
        category,
        severity,
        targetScope,
        targetCourseId: targetScope === 'course' ? targetCourseId : null,
        targetWorkshopId: targetScope === 'workshop' ? targetWorkshopId || null : targetWorkshopId || null,
        targetUserId: targetScope === 'individual' ? targetUserId : null,
        actionUrl: actionUrl.trim() || '/portal',
        actionRequired,
        sendPush,
      });

      const pushSummary = sendPush
        ? result.pushQueued > 0
          ? ` · Push enviados: ${result.pushSent}/${result.pushQueued} dispositivos.`
          : ' · Sin dispositivos Web Push suscritos en ese segmento (entregado en bandeja in-app y Realtime).'
        : ' · Solo bandeja in-app.';

      setFeedbackBanner({
        tone: 'success',
        text: `¡Anuncio publicado con éxito! Entregado en bandeja a ${result.recipientsCount} ${
          result.recipientsCount === 1 ? 'destinatario' : 'destinatarios'
        }${pushSummary}`,
      });

      setTitle('');
      setMessage('');
      await loadAll();
    } catch (err) {
      setFeedbackBanner({
        tone: 'error',
        text: err instanceof Error ? err.message : 'Error al publicar el anuncio.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendPush = async (ann: PlatformAnnouncementWithStats) => {
    setResendingId(ann.id);
    setFeedbackBanner(null);
    try {
      const res = await resendAnnouncementPush(ann);
      setFeedbackBanner({
        tone: res.sent > 0 ? 'success' : 'warning',
        text:
          res.queued === 0
            ? 'No se encontraron dispositivos con suscripción Web Push activa para este anuncio.'
            : `Notificación push reenviada: ${res.sent} de ${res.queued} dispositivos alcanzados.`,
      });
      await loadAll();
    } catch (err) {
      setFeedbackBanner({
        tone: 'error',
        text: err instanceof Error ? err.message : 'Error al reenviar notificación push.',
      });
    } finally {
      setResendingId(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (
      !window.confirm(
        '¿Eliminar este anuncio? También se retirará de la bandeja de notificaciones de los alumnos.'
      )
    ) {
      return;
    }
    setDeletingId(id);
    try {
      await deletePlatformAnnouncement(id);
      setAnnouncements((prev) => prev.filter((a) => a.id !== id));
    } catch (err) {
      alert(err instanceof Error ? err.message : 'No se pudo eliminar el anuncio');
    } finally {
      setDeletingId(null);
    }
  };

  const handleEnableMyDevicePush = async () => {
    setTestingMyPush(true);
    try {
      const perm = await requestNotificationPermission(user?.id, 'admin');
      setMyDevicePerm(perm);
      if (perm === 'granted') {
        await registerWebPushSubscription(user?.id);
        await sendTestNotification('admin');
        const stats = await getPushSubscriptionStats();
        setPushStats(stats);
      }
    } finally {
      setTestingMyPush(false);
    }
  };

  // Métricas globales
  const globalStats = useMemo(() => {
    const totalAnnouncements = announcements.length;
    let totalDelivered = 0;
    let totalRead = 0;
    for (const a of announcements) {
      totalDelivered += a.recipients_count || 0;
      totalRead += a.read_count || 0;
    }
    const readRate = totalDelivered > 0 ? Math.round((totalRead / totalDelivered) * 100) : 0;
    return {
      totalAnnouncements,
      totalDelivered,
      totalRead,
      readRate,
    };
  }, [announcements]);

  const filteredAnnouncements = useMemo(() => {
    const q = searchQ.trim().toLowerCase();
    return announcements.filter((a) => {
      if (categoryFilter !== 'all' && a.category !== categoryFilter) return false;
      if (q) {
        const hay = `${a.title} ${a.message} ${a.author_name} ${a.workshop_title ?? ''}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [announcements, searchQ, categoryFilter]);

  return (
    <AdminLayout
      title="Anuncios y Alertas Push"
      subtitle="Centro de emisión de avisos oficiales, alertas de clases en vivo, grabaciones y seguimiento de lecturas"
    >
      {/* ─── KPIs Superiores ─── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Anuncios Emitidos
            </span>
            <Megaphone className="w-4 h-4 text-indigo-500" />
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-white">
            {globalStats.totalAnnouncements}
          </p>
          <p className="text-[11px] text-slate-500 mt-0.5">
            {globalStats.totalDelivered} entregas en bandeja in-app
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Tasa de Lectura
            </span>
            <Eye className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
            {globalStats.readRate}%
          </p>
          <p className="text-[11px] text-slate-500 mt-0.5">
            {globalStats.totalRead} de {globalStats.totalDelivered} avisos leídos
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Dispositivos Web Push
            </span>
            <Smartphone className="w-4 h-4 text-sky-500" />
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-white">
            {pushStats.total_devices}
          </p>
          <p className="text-[11px] text-slate-500 mt-0.5">
            {pushStats.unique_users} usuarios con alertas de sistema activas
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Mi Dispositivo
            </span>
            <Bell className="w-4 h-4 text-amber-500" />
          </div>
          <div className="flex items-center justify-between gap-2 mt-1">
            <span
              className={`text-xs font-bold ${
                myDevicePerm === 'granted'
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : 'text-amber-600 dark:text-amber-400'
              }`}
            >
              {myDevicePerm === 'granted' ? '✓ Push activo' : 'Sin activar'}
            </span>
            <button
              type="button"
              onClick={handleEnableMyDevicePush}
              disabled={testingMyPush}
              className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-[11px] font-bold transition cursor-pointer"
            >
              {testingMyPush
                ? 'Sincronizando...'
                : myDevicePerm === 'granted'
                ? 'Probar Push'
                : 'Activar aquí'}
            </button>
          </div>
        </div>
      </div>

      {feedbackBanner && (
        <div
          className={`mb-6 p-4 rounded-2xl border flex items-center justify-between gap-3 text-xs font-semibold ${
            feedbackBanner.tone === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-950/40 dark:border-emerald-800/60 dark:text-emerald-200'
              : feedbackBanner.tone === 'warning'
              ? 'bg-amber-50 border-amber-200 text-amber-800 dark:bg-amber-950/40 dark:border-amber-800/60 dark:text-amber-200'
              : 'bg-rose-50 border-rose-200 text-rose-800 dark:bg-rose-950/40 dark:border-rose-800/60 dark:text-rose-200'
          }`}
        >
          <div className="flex items-center gap-2.5">
            {feedbackBanner.tone === 'success' ? (
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
            ) : (
              <AlertTriangle className="w-4 h-4 shrink-0" />
            )}
            <span>{feedbackBanner.text}</span>
          </div>
          <button
            type="button"
            onClick={() => setFeedbackBanner(null)}
            className="text-[11px] underline opacity-80 hover:opacity-100"
          >
            Cerrar
          </button>
        </div>
      )}

      {/* ─── Grid Principal: Emisor + Vista Previa ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">
        {/* Columna Izquierda: Formulario de Emisión */}
        <div className="lg:col-span-8 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xs">
          <div className="flex flex-wrap items-center justify-between gap-2 pb-4 mb-5 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Send className="w-4 h-4 text-indigo-600" />
                Redactar Nuevo Anuncio o Alerta
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Se entrega al instante en la campana y bandeja de cada alumno (Realtime) y mediante Web Push.
              </p>
            </div>
          </div>

          {/* Barra de Plantillas Rápidas con selector de Clase */}
          <div className="mb-5 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/70 dark:border-slate-700/60 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                Plantillas rápidas (Autocompletado inteligente)
              </span>
              {workshops.length > 0 && (
                <select
                  value={templateWorkshopId}
                  onChange={(e) => setTemplateWorkshopId(e.target.value)}
                  className="text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-2.5 py-1.5 text-slate-700 dark:text-slate-200 max-w-xs truncate"
                  aria-label="Seleccionar clase para plantilla"
                >
                  {workshops.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.title} ({new Date(w.scheduled_at).toLocaleDateString('es-MX', { day: '2-digit', month: 'short' })})
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => applyNewLiveClassTemplate()}
                className="px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/60 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200/80 dark:border-indigo-800/60 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
              >
                <Calendar className="w-3.5 h-3.5" />
                Nueva clase programada
              </button>
              <button
                type="button"
                onClick={() => applyLiveNowUrgentTemplate()}
                className="px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/60 dark:hover:bg-rose-900/60 text-rose-700 dark:text-rose-300 border border-rose-200/80 dark:border-rose-800/60 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
              >
                <Video className="w-3.5 h-3.5" />
                ¡Estamos en vivo ahora!
              </button>
              <button
                type="button"
                onClick={() => applyRecordingReadyTemplate()}
                className="px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:hover:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/60 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                Grabación ya disponible
              </button>
              <button
                type="button"
                onClick={applyEvaluationReminderTemplate}
                className="px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/60 dark:hover:bg-amber-900/60 text-amber-800 dark:text-amber-300 border border-amber-200/80 dark:border-amber-800/60 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
              >
                <GraduationCap className="w-3.5 h-3.5" />
                Recordatorio de evaluación
              </button>
            </div>
          </div>

          <form onSubmit={handlePublish} className="space-y-4">
            {/* Segmentación y Categoría */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Destinatarios (Segmentación)
                </label>
                <select
                  value={targetScope}
                  onChange={(e) => setTargetScope(e.target.value as AnnouncementTargetScope)}
                  className="w-full min-h-[40px] rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 text-xs font-semibold text-slate-800 dark:text-slate-100"
                >
                  <option value="all_students">
                    🎓 Toda la cohorte de alumnos ({students.length} médicos)
                  </option>
                  <option value="course">📚 Alumnos de un Nivel / Curso específico</option>
                  <option value="workshop">🎥 Inscritos a una Clase / Taller específico</option>
                  <option value="individual">👤 Médico cursista individual</option>
                  <option value="staff">🩺 Comité docente y administradores</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Categoría del Aviso
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as AnnouncementCategory)}
                  className="w-full min-h-[40px] rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 text-xs font-semibold text-slate-800 dark:text-slate-100"
                >
                  {CATEGORY_OPTIONS.map((c) => (
                    <option key={c.value} value={c.value}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Sub-selector condicional según segmentación */}
            {targetScope === 'course' && (
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Seleccionar Curso / Nivel
                </label>
                <select
                  value={targetCourseId}
                  onChange={(e) => setTargetCourseId(e.target.value)}
                  className="w-full min-h-[40px] rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 text-xs font-semibold"
                  required
                >
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.title} ({c.id})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {targetScope === 'workshop' && (
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Seleccionar Clase / Taller
                </label>
                <select
                  value={targetWorkshopId}
                  onChange={(e) => {
                    setTargetWorkshopId(e.target.value);
                    if (e.target.value) setActionUrl(`/taller/${e.target.value}`);
                  }}
                  className="w-full min-h-[40px] rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 text-xs font-semibold"
                  required
                >
                  <option value="">Selecciona una clase...</option>
                  {workshops.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.title}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {targetScope === 'individual' && (
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Seleccionar Médico Cursista
                </label>
                <select
                  value={targetUserId}
                  onChange={(e) => setTargetUserId(e.target.value)}
                  className="w-full min-h-[40px] rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 text-xs font-semibold"
                  required
                >
                  <option value="">Selecciona un alumno...</option>
                  {students.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.display_name} ({s.email})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Severidad / Tono visual */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Prioridad Visual
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {SEVERITY_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setSeverity(opt.value)}
                    className={`p-2.5 rounded-xl border text-left transition cursor-pointer ${
                      severity === opt.value
                        ? `${opt.pillClass} ring-2 ring-indigo-500/30 font-bold`
                        : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/60 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <p className="text-xs font-bold">{opt.label}</p>
                    <p className="text-[10px] opacity-80 line-clamp-1 mt-0.5">{opt.description}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Título y Mensaje */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Título del Anuncio *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ej. 🎥 Nueva clase en vivo: Neuroanatomía Funcional"
                required
                disabled={isSubmitting}
                className="w-full min-h-[42px] rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Mensaje detallado *
              </label>
              <textarea
                rows={3}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Escribe los detalles de la sesión, horario, indicaciones o enlaces relevantes..."
                required
                disabled={isSubmitting}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2.5 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
              />
            </div>

            {/* URL de Acción al hacer clic */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Destino rápido al tocar el aviso
                </label>
                <select
                  value={
                    QUICK_ROUTES.some((r) => r.url === actionUrl) ? actionUrl : '__custom__'
                  }
                  onChange={(e) => {
                    if (e.target.value !== '__custom__') {
                      setActionUrl(e.target.value);
                    }
                  }}
                  className="w-full min-h-[40px] rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 text-xs font-medium"
                >
                  {QUICK_ROUTES.map((r) => (
                    <option key={r.url} value={r.url}>
                      {r.label} ({r.url})
                    </option>
                  ))}
                  <option value="__custom__">🔗 Ruta específica de clase o tema...</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  URL o Ruta destino
                </label>
                <input
                  type="text"
                  value={actionUrl}
                  onChange={(e) => setActionUrl(e.target.value)}
                  placeholder="/taller/..."
                  className="w-full min-h-[40px] rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 text-xs font-mono text-slate-700 dark:text-slate-200"
                />
              </div>
            </div>

            {/* Switches de configuración */}
            <div className="flex flex-wrap items-center gap-5 pt-2">
              <label className="inline-flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={sendPush}
                  onChange={(e) => setSendPush(e.target.checked)}
                  className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span>Enviar notificación Web Push a dispositivos</span>
              </label>

              <label className="inline-flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={actionRequired}
                  onChange={(e) => setActionRequired(e.target.checked)}
                  className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span>Destacar como pendiente por atender</span>
              </label>
            </div>

            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                type="submit"
                disabled={isSubmitting || !title.trim() || !message.trim()}
                className="min-h-[42px] px-6 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-bold transition shadow-sm flex items-center gap-2 cursor-pointer"
              >
                <Send className="w-4 h-4" />
                {isSubmitting ? 'Publicando y enviando alertas...' : 'Publicar Anuncio y Enviar Alertas'}
              </button>
            </div>
          </form>
        </div>

        {/* Columna Derecha: Vista Previa en Tiempo Real */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-5 shadow-xs">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
              <Smartphone className="w-3.5 h-3.5 text-indigo-500" />
              Vista Previa Notificación Push (Móvil / Escritorio)
            </h3>

            <div className="p-3.5 rounded-2xl bg-slate-900 text-white shadow-md border border-slate-800">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center shrink-0 font-black text-xs">
                  ⚡
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-300">
                      ElectroDx Diplomado
                    </span>
                    <span className="text-[10px] text-slate-400">ahora</span>
                  </div>
                  <p className="text-xs font-bold text-white mt-0.5 line-clamp-1">
                    {title.trim() || '🎥 Título del anuncio académico'}
                  </p>
                  <p className="text-[11px] text-slate-300 mt-1 line-clamp-3 leading-relaxed">
                    {message.trim() ||
                      'Aquí se mostrará el cuerpo del mensaje en la pantalla de bloqueo o barra de estado del alumno.'}
                  </p>
                </div>
              </div>
            </div>

            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mt-5 mb-3 flex items-center gap-1.5">
              <Bell className="w-3.5 h-3.5 text-emerald-500" />
              Vista Previa en Campana y Bandeja del Alumno
            </h3>

            <div
              className={`p-4 rounded-2xl border ${
                severity === 'urgent'
                  ? 'border-rose-300 bg-rose-50/70 dark:border-rose-800 dark:bg-rose-950/30'
                  : severity === 'warning'
                  ? 'border-amber-300 bg-amber-50/70 dark:border-amber-800 dark:bg-amber-950/30'
                  : severity === 'success'
                  ? 'border-emerald-300 bg-emerald-50/70 dark:border-emerald-800 dark:bg-emerald-950/30'
                  : 'border-sky-200 bg-sky-50/60 dark:border-sky-800/70 dark:bg-sky-950/25'
              }`}
            >
              <div className="flex items-center gap-1.5 mb-1.5">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-white/80 dark:bg-slate-900/70 text-slate-700 dark:text-slate-200">
                  {CATEGORY_OPTIONS.find((c) => c.value === category)?.label}
                </span>
                <span className="text-[10px] font-semibold text-slate-500">Hace un momento</span>
              </div>
              <p className="text-xs font-bold text-slate-900 dark:text-white">
                {title.trim() || 'Título del anuncio'}
              </p>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                {message.trim() || 'Contenido detallado que verá el médico cursista en su portal.'}
              </p>
              <p className="text-[10px] font-mono text-indigo-600 dark:text-indigo-400 mt-2 truncate">
                Destino: {actionUrl || '/portal'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Historial de Anuncios Emitidos y Métricas ─── */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 mb-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Historial de Anuncios y Confirmación de Lectura
            </h3>
            <p className="text-xs text-slate-500">
              Seguimiento en tiempo real de cuántos alumnos han abierto cada aviso.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQ}
                onChange={(e) => setSearchQ(e.target.value)}
                placeholder="Buscar anuncio..."
                className="pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs"
              />
            </div>

            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value as any)}
              className="py-1.5 px-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-medium"
            >
              <option value="all">Todas las categorías</option>
              {CATEGORY_OPTIONS.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={() => void loadAll()}
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition cursor-pointer"
              title="Actualizar métricas"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {loading ? (
          <p className="text-xs text-slate-500 text-center py-10">Cargando historial de anuncios...</p>
        ) : filteredAnnouncements.length === 0 ? (
          <div className="text-center py-10 text-slate-500">
            <Megaphone className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-semibold">Aún no hay anuncios registrados con este filtro</p>
            <p className="text-xs text-slate-400 mt-1">
              Usa las plantillas rápidas de arriba para emitir tu primer aviso a la cohorte.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredAnnouncements.map((ann) => {
              const catMeta =
                CATEGORY_OPTIONS.find((c) => c.value === ann.category) ?? CATEGORY_OPTIONS[4];
              const readPct =
                ann.recipients_count > 0
                  ? Math.min(100, Math.round((ann.read_count / ann.recipients_count) * 100))
                  : 0;

              const scopeLabel =
                ann.target_scope === 'all_students'
                  ? 'Toda la cohorte'
                  : ann.target_scope === 'course'
                  ? `Curso: ${ann.target_course_id}`
                  : ann.target_scope === 'workshop'
                  ? `Taller: ${ann.workshop_title || 'Sesión en vivo'}`
                  : ann.target_scope === 'individual'
                  ? `Alumno: ${ann.target_user_name || 'Individual'}`
                  : 'Personal docente';

              return (
                <div
                  key={ann.id}
                  className="p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex flex-col lg:flex-row lg:items-center justify-between gap-4"
                >
                  <div className="min-w-0 flex-1 space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase ${catMeta.badgeClass}`}
                      >
                        {catMeta.label}
                      </span>
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-200/70 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                        {scopeLabel}
                      </span>
                      <span className="text-[11px] text-slate-400">
                        {new Date(ann.created_at).toLocaleDateString('es-MX', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}{' '}
                        · Por {ann.author_name}
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                      {ann.title}
                    </h4>
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                      {ann.message}
                    </p>
                    {ann.action_url && (
                      <p className="text-[11px] font-mono text-indigo-600 dark:text-indigo-400">
                        Destino: {ann.action_url}
                      </p>
                    )}
                  </div>

                  {/* Métricas de entrega y lectura */}
                  <div className="flex flex-col sm:flex-row lg:flex-col items-start sm:items-center lg:items-end justify-between gap-3 shrink-0 lg:w-64 pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-200/60 dark:border-slate-800">
                    <div className="w-full space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-500 font-medium">Lecturas en plataforma:</span>
                        <span className="font-bold text-slate-900 dark:text-white">
                          {ann.read_count} / {ann.recipients_count} ({readPct}%)
                        </span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                        <div
                          className="h-full bg-emerald-500 transition-all"
                          style={{ width: `${readPct}%` }}
                        />
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-slate-500">
                        <span>Push enviados: {ann.push_sent_count}</span>
                        {ann.push_failed_count > 0 && (
                          <span className="text-amber-600">Fallidos: {ann.push_failed_count}</span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 self-end">
                      <button
                        type="button"
                        onClick={() => {
                          setTitle(ann.title);
                          setMessage(ann.message);
                          setCategory(ann.category);
                          setSeverity(ann.severity);
                          setActionUrl(ann.action_url || '/portal');
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                        className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-300 flex items-center gap-1 transition cursor-pointer"
                        title="Copiar datos al formulario para reenviar o editar"
                      >
                        <Copy className="w-3.5 h-3.5" />
                        <span>Reutilizar</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => void handleResendPush(ann)}
                        disabled={resendingId === ann.id}
                        className="px-2.5 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/60 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 text-xs font-bold flex items-center gap-1 transition cursor-pointer"
                        title="Reenviar alerta Web Push a dispositivos suscritos"
                      >
                        <Bell className="w-3.5 h-3.5" />
                        <span>{resendingId === ann.id ? 'Enviando...' : 'Reenviar Push'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => void handleDelete(ann.id)}
                        disabled={deletingId === ann.id}
                        className="p-1.5 rounded-lg border border-rose-200 dark:border-rose-900/60 hover:bg-rose-50 dark:hover:bg-rose-950/50 text-rose-500 transition cursor-pointer"
                        title="Eliminar anuncio"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

