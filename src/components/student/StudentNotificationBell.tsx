import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Link, useNavigate } from 'react-router-dom';
import {
  Bell,
  BellRing,
  Check,
  CheckCheck,
  ChevronRight,
  ExternalLink,
  Smartphone,
  Sparkles,
  Video,
  ClipboardList,
  X,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthProvider';
import { useSettingsStore } from '../../stores/settingsStore';
import {
  getStudentNotifications,
  isNotificationReadLocally,
  markAllNotificationsAsRead,
  markNotificationAsRead,
  type StudentNotification,
} from '../../services/studentService';
import {
  fetchServerNotifications,
  markAllServerNotificationsRead,
  markServerNotificationRead,
  mergeServerNotifications,
  STUDENT_NOTIFICATIONS_UPDATED_EVENT,
  emitStudentNotificationsUpdated,
} from '../../services/assignmentSubmissionService';
import { getUpcomingWorkshops } from '../../services/courseService';
import { getStudentAssignments } from '../../services/studentPlanService';
import {
  getNotificationPermission,
  requestNotificationPermission,
  registerWebPushSubscription,
  subscribeToRealtimeStudentNotifications,
  type NotificationPermissionStatus,
} from '../../services/deviceNotificationService';
import {
  getNotificationTypeLabel,
  getNotificationVisualStyle,
} from './StudentQuickControlHub';

type BellPlacement = 'desktop' | 'mobile';
type StudentBellFilter = 'all' | 'unread' | 'workshop' | 'academic';

const studentInboxMobilePanelClass =
  'fixed z-[70] inset-x-0 top-14 sm:top-16 max-h-[min(34rem,calc(100dvh-9rem))] overflow-y-auto overscroll-contain rounded-b-2xl border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-2xl';

const studentInboxDesktopPanelClass =
  'absolute right-0 mt-2 w-[min(26rem,calc(100vw-2rem))] max-h-[75vh] overflow-y-auto overscroll-contain rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-2xl z-50';

function formatRelativeTime(iso: string): string {
  const ms = Date.now() - new Date(iso).getTime();
  if (!Number.isFinite(ms) || ms < 60_000) return 'Hace un momento';
  const minutes = Math.floor(ms / 60_000);
  if (minutes < 60) return `Hace ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `Hace ${hours} h`;
  const days = Math.floor(hours / 24);
  if (days === 1) return 'Ayer';
  if (days < 7) return `Hace ${days} días`;
  return new Date(iso).toLocaleDateString('es-MX', {
    day: 'numeric',
    month: 'short',
  });
}

export function StudentNotificationBell({ placement = 'desktop' }: { placement?: BellPlacement }) {
  const { user, profile } = useAuth();
  const isDarkMode = useSettingsStore((state) => state.isDarkMode);
  const navigate = useNavigate();

  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState<StudentBellFilter>('all');
  const [notifications, setNotifications] = useState<StudentNotification[]>([]);
  const [loading, setLoading] = useState(false);
  const [pushPermission, setPushPermission] = useState<NotificationPermissionStatus>('default');
  const [activatingPush, setActivatingPush] = useState(false);
  const [pushFeedback, setPushFeedback] = useState<string | null>(null);

  const menuRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const loadNotifications = useCallback(
    async (silent = false) => {
      if (!user?.id) return;
      if (!silent) setLoading(true);
      try {
        const [serverNotifs, workshops, assignments] = await Promise.all([
          fetchServerNotifications(user.id),
          getUpcomingWorkshops(5).catch(() => []),
          getStudentAssignments(user.id).catch(() => []),
        ]);
        const localNotifs = getStudentNotifications(user.id, profile, workshops, assignments);
        const merged = mergeServerNotifications(localNotifs, serverNotifs).map((n) =>
          isNotificationReadLocally(user.id, n.id) ? { ...n, isRead: true } : n
        );
        setNotifications(merged);
      } catch (err) {
        console.warn('[StudentNotificationBell] Error loading notifications:', err);
      } finally {
        if (!silent) setLoading(false);
      }
    },
    [user?.id, profile]
  );

  useEffect(() => {
    setPushPermission(getNotificationPermission());
    void loadNotifications();
  }, [loadNotifications]);

  // Ensure existing push permission has an active subscription saved in DB
  useEffect(() => {
    if (!user?.id) return;
    if (getNotificationPermission() === 'granted') {
      void registerWebPushSubscription(user.id);
    }
  }, [user?.id]);

  // Listen to Realtime DB notifications and cross-component update events
  useEffect(() => {
    if (!user?.id) return;

    const onLocalSync = () => {
      void loadNotifications(true);
    };
    window.addEventListener(STUDENT_NOTIFICATIONS_UPDATED_EVENT, onLocalSync);

    const unsubscribeRealtime = subscribeToRealtimeStudentNotifications(user.id, () => {
      void loadNotifications(true);
    });

    return () => {
      window.removeEventListener(STUDENT_NOTIFICATIONS_UPDATED_EVENT, onLocalSync);
      unsubscribeRealtime();
    };
  }, [user?.id, loadNotifications]);

  // Close on click outside or Escape
  useEffect(() => {
    if (!open) return;
    const onClick = (event: MouseEvent) => {
      const target = event.target as Node;
      if (menuRef.current?.contains(target)) return;
      if (panelRef.current?.contains(target)) return;
      setOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  useEffect(() => {
    if (!open || placement !== 'mobile') return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    panelRef.current?.focus();
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open, placement]);

  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.isRead).length,
    [notifications]
  );

  const filteredNotifications = useMemo(() => {
    return notifications.filter((n) => {
      if (filter === 'unread') return !n.isRead;
      if (filter === 'workshop') return n.type === 'workshop';
      if (filter === 'academic') return n.type === 'academic' || n.type === 'quiz';
      return true;
    });
  }, [notifications, filter]);

  const handleMarkOneRead = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!user?.id) return;
    markNotificationAsRead(user.id, id);
    void markServerNotificationRead(id);
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
    emitStudentNotificationsUpdated();
  };

  const handleMarkAllRead = () => {
    if (!user?.id || unreadCount === 0) return;
    markAllNotificationsAsRead(
      user.id,
      notifications.map((n) => n.id)
    );
    void markAllServerNotificationsRead(user.id);
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    emitStudentNotificationsUpdated();
  };

  const handleSelectNotification = (notif: StudentNotification) => {
    handleMarkOneRead(notif.id);
    setOpen(false);
    if (notif.linkUrl) {
      navigate(notif.linkUrl);
    } else {
      navigate('/portal?tab=notifications');
    }
  };

  const handleEnablePush = async () => {
    if (!user?.id) return;
    setActivatingPush(true);
    setPushFeedback(null);
    try {
      const status = await requestNotificationPermission(user.id);
      setPushPermission(status);
      if (status === 'granted') {
        const subOk = await registerWebPushSubscription(user.id);
        setPushFeedback(
          subOk
            ? 'Notificaciones Push activadas en este dispositivo.'
            : 'Permiso concedido en el navegador.'
        );
      } else if (status === 'denied') {
        setPushFeedback('Permiso bloqueado en el navegador. Habilítalo en el icono del candado de la barra de direcciones.');
      }
    } catch {
      setPushFeedback('No se pudo activar Push en este navegador.');
    } finally {
      setActivatingPush(false);
    }
  };

  if (!user) return null;

  const panelContent = (
    <>
      {/* Header */}
      <div className="px-4 py-3.5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/80">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <BellRing className="w-4 h-4 text-indigo-600 dark:text-cyan-400 shrink-0" />
              <p className="text-sm font-bold text-slate-900 dark:text-white">
                Centro de Notificaciones
              </p>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-500 text-white">
                  {unreadCount} sin leer
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              Avisos de clases en vivo, grabaciones, tareas y evaluaciones.
            </p>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAllRead}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold text-indigo-600 dark:text-cyan-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 transition cursor-pointer"
                title="Marcar todas como leídas"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span>Leer todas</span>
              </button>
            )}
            {placement === 'mobile' && (
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="inline-flex items-center justify-center w-8 h-8 rounded-xl text-slate-500 hover:bg-slate-200/70 dark:hover:bg-slate-800"
                aria-label="Cerrar notificaciones"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Device Push Status Bar */}
        {pushPermission !== 'unsupported' && (
          <div className="mt-2.5 flex items-center justify-between gap-2 px-3 py-2 rounded-xl bg-white dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/80">
            <div className="flex items-center gap-2 min-w-0">
              <Smartphone
                className={`w-4 h-4 shrink-0 ${
                  pushPermission === 'granted'
                    ? 'text-emerald-500'
                    : pushPermission === 'denied'
                    ? 'text-rose-500'
                    : 'text-amber-500'
                }`}
              />
              <span className="text-[11px] font-medium text-slate-700 dark:text-slate-200 truncate">
                {pushPermission === 'granted'
                  ? 'Alertas Push activas en este dispositivo'
                  : pushPermission === 'denied'
                  ? 'Alertas Push bloqueadas en el navegador'
                  : 'Recibe alertas en vivo en tu celular/PC'}
              </span>
            </div>
            {pushPermission !== 'granted' ? (
              <button
                type="button"
                disabled={activatingPush}
                onClick={() => void handleEnablePush()}
                className="shrink-0 px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-bold transition cursor-pointer disabled:opacity-50"
              >
                {activatingPush ? 'Activando…' : 'Activar Push'}
              </button>
            ) : (
              <span className="shrink-0 inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                <Check className="w-3 h-3" /> Activo
              </span>
            )}
          </div>
        )}
        {pushFeedback && (
          <p className="mt-1.5 text-[11px] text-indigo-600 dark:text-cyan-300 font-medium">
            {pushFeedback}
          </p>
        )}

        {/* Filter Tabs */}
        <div className="mt-3 grid grid-cols-4 gap-1" role="group" aria-label="Filtrar notificaciones">
          {(
            [
              ['all', 'Todas'],
              ['unread', 'No leídas'],
              ['workshop', 'Clases'],
              ['academic', 'Tareas'],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => setFilter(id)}
              className={`py-1.5 px-2 rounded-lg text-[11px] font-bold transition cursor-pointer ${
                filter === id
                  ? 'bg-indigo-600 text-white shadow-2xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200/70 dark:hover:bg-slate-700'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Notifications List */}
      <div className="p-3 space-y-2 max-h-[22rem] overflow-y-auto">
        {loading && notifications.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-500 dark:text-slate-400">
            Cargando notificaciones…
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="py-8 px-4 text-center space-y-1.5">
            <Sparkles className="w-6 h-6 text-slate-400 mx-auto" />
            <p className="text-xs font-semibold text-slate-700 dark:text-slate-200">
              {filter === 'unread'
                ? 'Estás al día: no tienes notificaciones pendientes por leer'
                : 'No hay notificaciones en esta categoría'}
            </p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Aquí aparecerán los avisos de nuevas clases en vivo, grabaciones subidas y tareas asignadas.
            </p>
          </div>
        ) : (
          filteredNotifications.slice(0, 20).map((notif) => {
            const style = getNotificationVisualStyle(notif);
            const isWorkshop = notif.type === 'workshop';
            const isAcademic = notif.type === 'academic' || notif.type === 'quiz';

            return (
              <div
                key={notif.id}
                onClick={() => handleSelectNotification(notif)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleSelectNotification(notif);
                  }
                }}
                className={`group relative rounded-xl p-3 border transition-all text-left cursor-pointer ${
                  notif.isRead
                    ? 'border-slate-200/70 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 hover:bg-slate-100/80 dark:hover:bg-slate-800/80'
                    : style.cardUnread
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {!notif.isRead && (
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${style.statusBadge}`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${style.statusDot}`} />
                        Nuevo
                      </span>
                    )}
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                        notif.isRead
                          ? 'bg-slate-200/70 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                          : style.typeBadgeUnread
                      }`}
                    >
                      {isWorkshop ? (
                        <Video className="w-3 h-3" />
                      ) : isAcademic ? (
                        <ClipboardList className="w-3 h-3" />
                      ) : (
                        <Bell className="w-3 h-3" />
                      )}
                      {getNotificationTypeLabel(notif.type)}
                    </span>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">
                      {formatRelativeTime(notif.createdAt)}
                    </span>
                  </div>

                  {!notif.isRead && (
                    <button
                      type="button"
                      onClick={(e) => handleMarkOneRead(notif.id, e)}
                      className="shrink-0 p-1 rounded-lg text-slate-400 hover:text-indigo-600 dark:hover:text-cyan-400 hover:bg-white/80 dark:hover:bg-slate-800 transition"
                      title="Marcar como leída"
                      aria-label="Marcar como leída"
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <p
                  className={`text-xs sm:text-sm font-bold mt-1.5 leading-snug ${
                    notif.isRead ? 'text-slate-700 dark:text-slate-200' : style.titleUnread
                  }`}
                >
                  {notif.title}
                </p>
                <p
                  className={`text-xs mt-1 line-clamp-2 leading-relaxed ${
                    notif.isRead ? 'text-slate-500 dark:text-slate-400' : style.messageUnread
                  }`}
                >
                  {notif.message}
                </p>

                {notif.linkUrl && (
                  <div className="mt-2 flex items-center justify-between">
                    <span
                      className={`inline-flex items-center gap-1 text-[11px] font-bold ${
                        notif.isRead
                          ? 'text-indigo-600 dark:text-cyan-400'
                          : style.actionLinkUnread
                      }`}
                    >
                      <span>Abrir recurso</span>
                      <ExternalLink className="w-3 h-3" />
                    </span>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Footer */}
      <div className="px-4 py-2.5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/90 flex items-center justify-between">
        <Link
          to="/portal?tab=notifications"
          onClick={() => setOpen(false)}
          className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 dark:text-cyan-400 hover:underline"
        >
          <span>Abrir bandeja completa en el Portal</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </>
  );

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className={`relative inline-flex items-center justify-center rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/60 hover:bg-white dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-cyan-400 transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-700 ${
          placement === 'mobile' ? 'min-h-10 min-w-10 p-2' : 'p-2'
        }`}
        aria-label="Centro de notificaciones"
        aria-expanded={open}
        title="Notificaciones y avisos del curso"
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[1.1rem] h-[1.1rem] px-1 rounded-full bg-rose-500 text-white text-[10px] font-bold leading-none flex items-center justify-center shadow-xs">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && placement === 'desktop' && (
        <div ref={panelRef} className={studentInboxDesktopPanelClass}>
          {panelContent}
        </div>
      )}

      {open &&
        placement === 'mobile' &&
        createPortal(
          <div className={isDarkMode ? 'dark' : undefined}>
            <button
              type="button"
              className="fixed inset-x-0 bottom-0 top-14 sm:top-16 z-[60] bg-slate-950/50"
              aria-label="Cerrar centro de notificaciones"
              onMouseDown={(event) => {
                event.preventDefault();
                event.stopPropagation();
                setOpen(false);
              }}
            />
            <div
              ref={panelRef}
              role="dialog"
              aria-modal="true"
              aria-label="Centro de notificaciones"
              tabIndex={-1}
              className={studentInboxMobilePanelClass}
            >
              {panelContent}
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}

