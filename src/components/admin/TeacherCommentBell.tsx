import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Bell, MessageCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthProvider';
import {
  listMyCommentNotifications,
  listOpenCohortThreads,
  markCommentNotificationRead,
  subscribeToMyCommentNotifications,
  type QaThread,
  type TopicCommentNotification,
} from '../../services/studentToolsService';
import { getTopicLabel, getTopicPublicUrl } from '../../utils/adminUtils';

function formatWhen(iso: string): string {
  return new Date(iso).toLocaleString('es-MX', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function threadHref(thread: QaThread): string {
  if (thread.page_url) return thread.page_url;
  return getTopicPublicUrl(thread.module_id ?? '', thread.topic_id) ?? '/portal';
}

export function TeacherCommentBell() {
  const { user, isAdmin, isEditor } = useAuth();
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<TopicCommentNotification[]>([]);
  const [openThreads, setOpenThreads] = useState<QaThread[]>([]);
  const menuRef = useRef<HTMLDivElement>(null);

  const staff = Boolean(user && (isAdmin || isEditor));

  useEffect(() => {
    if (!staff || !user?.id) return;
    let cancelled = false;
    void Promise.all([listMyCommentNotifications(), listOpenCohortThreads()])
      .then(([rows, threads]) => {
        if (cancelled) return;
        setNotifications(rows);
        setOpenThreads(threads);
      })
      .catch(() => undefined);
    const unsubscribe = subscribeToMyCommentNotifications(user.id, (row) => {
      setNotifications((prev) => {
        const without = prev.filter((item) => item.id !== row.id);
        return [row, ...without].slice(0, 40);
      });
      void listOpenCohortThreads()
        .then(setOpenThreads)
        .catch(() => undefined);
    });
    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, [staff, user?.id]);

  useEffect(() => {
    if (!open) return;
    const onClick = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
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

  const unread = useMemo(() => notifications.filter((row) => !row.is_read).length, [notifications]);

  const groupedOpen = useMemo(() => {
    const groups = new Map<string, { label: string; href: string; items: QaThread[] }>();
    for (const thread of openThreads) {
      const key = `${thread.module_id ?? ''}:${thread.topic_id ?? ''}`;
      const current = groups.get(key);
      if (current) {
        current.items.push(thread);
        continue;
      }
      groups.set(key, {
        label: getTopicLabel(thread.module_id ?? '', thread.topic_id),
        href: threadHref(thread),
        items: [thread],
      });
    }
    return [...groups.values()];
  }, [openThreads]);

  if (!staff) return null;

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="relative p-2 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/60 hover:bg-white dark:hover:bg-slate-800 text-slate-500 hover:text-blue-600 dark:hover:text-cyan-400 transition-all"
        aria-label="Dudas de los temas"
        aria-expanded={open}
      >
        <Bell className="w-4 h-4" />
        {unread > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[1.1rem] h-[1.1rem] px-1 rounded-full bg-red-500 text-white text-[10px] font-bold leading-none flex items-center justify-center">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-[min(24rem,calc(100vw-2rem))] max-h-[70vh] overflow-y-auto rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-xl z-50">
          <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800">
            <p className="text-sm font-bold flex items-center gap-2">
              <MessageCircle className="w-4 h-4" />
              Comentarios de temas
            </p>
            <p className="text-xs text-slate-500 mt-0.5">Avisos nuevos y dudas abiertas de la cohorte.</p>
          </div>

          <div className="p-3 space-y-2">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Avisos</p>
            {notifications.length === 0 ? (
              <p className="text-xs text-slate-500">Sin avisos de comentarios.</p>
            ) : (
              notifications.slice(0, 8).map((row) => (
                <Link
                  key={row.id}
                  to={row.link_url || '/portal'}
                  onClick={() => {
                    if (!row.is_read) {
                      void markCommentNotificationRead(row.id);
                      setNotifications((prev) =>
                        prev.map((item) => (item.id === row.id ? { ...item, is_read: true } : item))
                      );
                    }
                    setOpen(false);
                  }}
                  className={`block p-2.5 rounded-xl text-left ${
                    row.is_read
                      ? 'bg-slate-50 dark:bg-slate-800/60'
                      : 'bg-blue-50/80 dark:bg-blue-950/30'
                  }`}
                >
                  <p className="text-xs font-semibold">{row.title}</p>
                  <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-2">{row.message}</p>
                  <p className="text-[10px] text-slate-400 mt-1">{formatWhen(row.created_at)}</p>
                </Link>
              ))
            )}
          </div>

          <div className="p-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Dudas abiertas</p>
            {groupedOpen.length === 0 ? (
              <p className="text-xs text-slate-500">No hay dudas abiertas.</p>
            ) : (
              groupedOpen.map((group) => (
                <div key={group.href + group.label} className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60">
                  <Link
                    to={group.href}
                    onClick={() => setOpen(false)}
                    className="text-xs font-semibold text-blue-600 dark:text-cyan-400"
                  >
                    {group.label}
                  </Link>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    {group.items.length} {group.items.length === 1 ? 'duda abierta' : 'dudas abiertas'}
                  </p>
                  <ul className="mt-1 space-y-1">
                    {group.items.slice(0, 3).map((thread) => (
                      <li key={thread.id}>
                        <Link
                          to={threadHref(thread)}
                          onClick={() => setOpen(false)}
                          className="text-[11px] text-slate-600 dark:text-slate-300 line-clamp-2 hover:underline"
                        >
                          {thread.body}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
