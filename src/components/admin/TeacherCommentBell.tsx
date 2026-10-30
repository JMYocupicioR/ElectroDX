import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import { Bell, MessageCircle, X } from 'lucide-react';
import { useAuth } from '../../contexts/AuthProvider';
import { invalidateStaffInbox, useStaffInbox } from '../../hooks/useStaffInbox';
import { markCommentNotificationRead } from '../../services/studentToolsService';
import { useSettingsStore } from '../../stores/settingsStore';
import type { RankedStaffInboxItem, StaffInboxKind, StaffInboxLevel } from '../../utils/staffInboxRank';

type BellFilter = 'action' | 'urgent' | 'notices';
type BellPlacement = 'desktop' | 'mobile';

const KIND_LABEL: Record<StaffInboxKind, string> = {
  retake: 'Reintento',
  submission: 'Entrega',
  question: 'Duda',
  admission: 'Admisión',
  quiz: 'Quiz',
  editorial: 'Editorial',
  reply: 'Respuesta',
};

const LEVEL_LABEL: Record<StaffInboxLevel, string> = {
  0: 'Decisión',
  1: 'Respuesta',
  2: 'Revisión',
  3: 'Aviso',
};

export const teacherInboxMobilePanelClass =
  'fixed z-[70] inset-x-0 top-14 sm:top-16 max-h-[min(32rem,calc(100dvh-11rem))] overflow-y-auto overscroll-contain rounded-b-2xl border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-xl';

export const teacherInboxDesktopPanelClass =
  'absolute right-0 mt-2 w-[min(24rem,calc(100vw-2rem))] max-h-[70vh] overflow-y-auto overscroll-contain rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-xl z-50';

function formatWait(iso: string): string {
  const ms = Date.now() - new Date(iso).getTime();
  if (!Number.isFinite(ms) || ms < 60_000) return 'hace un momento';
  const hours = Math.floor(ms / 3_600_000);
  if (hours < 1) return 'hace minutos';
  if (hours < 24) return `hace ${hours} h`;
  const days = Math.floor(hours / 24);
  return days === 1 ? 'hace 1 día' : `hace ${days} días`;
}

function cardTone(item: RankedStaffInboxItem): string {
  if (item.level === 0) return 'bg-rose-50/80 dark:bg-rose-950/30';
  if (item.level === 1) return 'bg-amber-50/80 dark:bg-amber-950/25';
  if (item.level === 2) return 'bg-sky-50/80 dark:bg-sky-950/25';
  return 'bg-slate-50 dark:bg-slate-800/60';
}

function matchesFilter(item: RankedStaffInboxItem, filter: BellFilter): boolean {
  if (filter === 'urgent') return item.level === 0;
  if (filter === 'action') return item.level <= 1;
  return item.level >= 2;
}

const FILTERS = [
  ['action', 'Por atender'],
  ['urgent', 'Urgentes'],
  ['notices', 'Avisos'],
] as const;

function InboxMenu({
  filter,
  onFilter,
  loading,
  error,
  hasItems,
  filtered,
  emptyCopy,
  showClose,
  onClose,
  onOpenItem,
}: {
  filter: BellFilter;
  onFilter: (next: BellFilter) => void;
  loading: boolean;
  error: string | null;
  hasItems: boolean;
  filtered: RankedStaffInboxItem[];
  emptyCopy: string;
  showClose: boolean;
  onClose: () => void;
  onOpenItem: (item: RankedStaffInboxItem) => void;
}) {
  return (
    <>
      <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="text-sm font-bold flex items-center gap-2 text-slate-900 dark:text-slate-100">
              <MessageCircle className="w-4 h-4 shrink-0" />
              Bandeja docente
            </p>
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
              Primero lo que detiene a un alumno. Leer un aviso no califica una entrega.
            </p>
          </div>
          {showClose && (
            <button
              type="button"
              onClick={onClose}
              className="shrink-0 inline-flex items-center justify-center min-h-11 min-w-11 -mr-2 -mt-1 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-700"
              aria-label="Cerrar bandeja docente"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        <div className="mt-3 grid grid-cols-3 gap-1.5" role="group" aria-label="Filtrar bandeja">
          {FILTERS.map(([id, label]) => (
            <button
              key={id}
              type="button"
              aria-pressed={filter === id}
              onClick={() => onFilter(id)}
              className={`min-h-11 px-1 rounded-lg text-xs font-semibold cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-700 ${
                filter === id
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                  : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="p-3 space-y-2">
        {loading && !hasItems ? (
          <p className="text-xs text-slate-600 dark:text-slate-300">Cargando bandeja…</p>
        ) : error && !hasItems ? (
          <p className="text-xs text-rose-700 dark:text-rose-300">{error}</p>
        ) : filtered.length === 0 ? (
          <p className="text-xs text-slate-600 dark:text-slate-300">{emptyCopy}</p>
        ) : (
          filtered.map((item) => (
            <Link
              key={item.source_key}
              to={item.link_url || '/admin'}
              onClick={() => onOpenItem(item)}
              className={`block p-3 rounded-xl text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-700 ${cardTone(item)}`}
            >
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[11px] font-bold uppercase tracking-wide text-slate-600 dark:text-slate-300">
                  {KIND_LABEL[item.kind]}
                </span>
                <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                  {LEVEL_LABEL[item.level]}
                </span>
              </div>
              <p className="text-sm font-semibold mt-1 text-slate-900 dark:text-slate-100 break-words">{item.title}</p>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 line-clamp-2 break-words">
                {[item.actor_name, item.context_label].filter(Boolean).join(' · ')}
                {item.message ? ` · ${item.message}` : ''}
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">{formatWait(item.waiting_since)}</p>
            </Link>
          ))
        )}
      </div>
    </>
  );
}

export function TeacherCommentBell({ placement = 'desktop' }: { placement?: BellPlacement }) {
  const { user, isAdmin, isEditor } = useAuth();
  const isDarkMode = useSettingsStore((state) => state.isDarkMode);
  const { items, counts, loading, error } = useStaffInbox();
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState<BellFilter>('action');
  const [hiddenIds, setHiddenIds] = useState<Set<string>>(new Set());
  const menuRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const staff = Boolean(user && (isAdmin || isEditor));

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

  const visibleItems = useMemo(
    () => items.filter((item) => !hiddenIds.has(item.source_key)),
    [items, hiddenIds]
  );
  const filtered = visibleItems.filter((item) => matchesFilter(item, filter));
  const badge = counts.totalPending;

  const emptyCopy =
    filter === 'urgent' ? 'Sin urgentes' : filter === 'action' ? 'Nada por atender' : 'Sin avisos';

  const openItem = (item: RankedStaffInboxItem) => {
    if (item.kind === 'reply' && item.notification_id) {
      void markCommentNotificationRead(item.notification_id);
      setHiddenIds((prev) => new Set(prev).add(item.source_key));
      invalidateStaffInbox();
    }
    setOpen(false);
  };

  if (!staff) return null;

  const menu = (
    <InboxMenu
      filter={filter}
      onFilter={setFilter}
      loading={loading}
      error={error}
      hasItems={items.length > 0}
      filtered={filtered}
      emptyCopy={emptyCopy}
      showClose={placement === 'mobile'}
      onClose={() => setOpen(false)}
      onOpenItem={openItem}
    />
  );

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className={`relative inline-flex items-center justify-center rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/60 hover:bg-white dark:hover:bg-slate-800 text-slate-500 hover:text-blue-600 dark:hover:text-cyan-400 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-700 ${
          placement === 'mobile' ? 'min-h-11 min-w-11' : 'p-2'
        }`}
        aria-label="Bandeja del profesor"
        aria-expanded={open}
        aria-controls="teacher-inbox-panel"
      >
        <Bell className="w-4 h-4" />
        {badge > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[1.1rem] h-[1.1rem] px-1 rounded-full bg-red-500 text-white text-[10px] font-bold leading-none flex items-center justify-center">
            {badge > 9 ? '9+' : badge}
          </span>
        )}
      </button>

      {open && placement === 'desktop' && (
        <div id="teacher-inbox-panel" ref={panelRef} className={teacherInboxDesktopPanelClass}>
          {menu}
        </div>
      )}

      {open &&
        placement === 'mobile' &&
        createPortal(
          <div className={isDarkMode ? 'dark' : undefined}>
            <button
              type="button"
              className="fixed inset-x-0 bottom-0 top-14 sm:top-16 z-[60] bg-slate-950/50"
              aria-label="Cerrar bandeja docente"
              onMouseDown={(event) => {
                event.preventDefault();
                event.stopPropagation();
                setOpen(false);
              }}
            />
            <div
              id="teacher-inbox-panel"
              ref={panelRef}
              role="dialog"
              aria-modal="true"
              aria-label="Bandeja docente"
              tabIndex={-1}
              className={`${teacherInboxMobilePanelClass} focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-700`}
            >
              {menu}
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}
