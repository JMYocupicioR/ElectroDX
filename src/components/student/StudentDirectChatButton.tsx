import { useEffect, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useLocation, useSearchParams } from 'react-router-dom';
import { MessageCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthProvider';
import { useSettingsStore } from '../../stores/settingsStore';
import {
  loadDirectChatConversation,
  subscribeToDirectChat,
  DIRECT_CHAT_UPDATED_EVENT,
  OPEN_STUDENT_DIRECT_CHAT_EVENT,
  type DirectChatContextTag,
} from '../../services/directChatService';
import { StudentDirectChatPanel } from './StudentDirectChatPanel';

export function StudentDirectChatButton({ placement = 'desktop' }: { placement?: 'desktop' | 'mobile' }) {
  const { user, profile } = useAuth();
  const isDarkMode = useSettingsStore((s) => s.isDarkMode);
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();

  const [open, setOpen] = useState(false);
  const [hasUnread, setHasUnread] = useState(false);
  const [modalOptions, setModalOptions] = useState<{
    contextTag?: DirectChatContextTag;
    courseTitle?: string;
    initialDraft?: string;
  }>({});

  const checkUnreadStatus = useCallback(async () => {
    if (!user?.id) return;
    try {
      const conv = await loadDirectChatConversation(user.id, {
        studentDisplayName: profile?.display_name,
      });
      setHasUnread(conv.unreadForStudent);
    } catch {
      // Ignore silent check errors
    }
  }, [user?.id, profile?.display_name]);

  useEffect(() => {
    void checkUnreadStatus();
  }, [checkUnreadStatus]);

  // Listen to URL ?chat=1 only on desktop instance (or mobile if desktop hidden)
  useEffect(() => {
    if (searchParams.get('chat') === '1') {
      if (placement === 'desktop' || window.innerWidth < 1024) {
        setOpen(true);
      }
      const next = new URLSearchParams(searchParams);
      next.delete('chat');
      setSearchParams(next, { replace: true });
    }
  }, [searchParams, setSearchParams, placement, location.pathname]);

  // Listen to custom open event & realtime updates
  useEffect(() => {
    if (!user?.id) return;

    const onOpenEvent = (e: Event) => {
      const isDesktopViewport = typeof window !== 'undefined' ? window.innerWidth >= 1024 : true;
      if ((placement === 'desktop' && isDesktopViewport) || (placement === 'mobile' && !isDesktopViewport)) {
        const customEvent = e as CustomEvent<{
          contextTag?: DirectChatContextTag;
          courseTitle?: string;
          initialDraft?: string;
        }>;
        setModalOptions(customEvent.detail ?? {});
        setOpen(true);
      }
    };

    const onChatUpdated = () => {
      void checkUnreadStatus();
    };

    window.addEventListener(OPEN_STUDENT_DIRECT_CHAT_EVENT, onOpenEvent);
    window.addEventListener(DIRECT_CHAT_UPDATED_EVENT, onChatUpdated);
    const unsubRealtime = subscribeToDirectChat(user.id, () => {
      void checkUnreadStatus();
    });

    return () => {
      window.removeEventListener(OPEN_STUDENT_DIRECT_CHAT_EVENT, onOpenEvent);
      window.removeEventListener(DIRECT_CHAT_UPDATED_EVENT, onChatUpdated);
      unsubRealtime();
    };
  }, [user?.id, placement, checkUnreadStatus]);

  if (!user) return null;

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setOpen(true);
          setHasUnread(false);
        }}
        className={`relative inline-flex items-center justify-center rounded-xl border transition-all cursor-pointer ${
          hasUnread
            ? 'border-indigo-400 dark:border-indigo-500 bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-cyan-300 shadow-xs'
            : 'border-slate-200/80 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/60 hover:bg-white dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-cyan-400'
        } ${placement === 'mobile' ? 'p-2' : 'p-2'}`}
        aria-label="Chat directo con el Profesor"
        title="Chat privado con el Profesor / Dirección Académica"
      >
        <MessageCircle className="w-4 h-4" />
        {hasUnread && (
          <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5 items-center justify-center">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-indigo-600 dark:bg-cyan-400" />
          </span>
        )}
      </button>

      {open &&
        typeof document !== 'undefined' &&
        createPortal(
          <div className={isDarkMode ? 'dark' : ''}>
            <div
              className="fixed inset-0 z-[80] bg-slate-950/60 backdrop-blur-xs flex justify-end animate-fadeIn"
              onClick={() => setOpen(false)}
            >
              <div
                role="dialog"
                aria-modal="true"
                aria-label="Chat directo con Dirección Académica"
                className="w-full max-w-md h-full bg-white dark:bg-slate-900 shadow-2xl border-l border-slate-200 dark:border-slate-800 flex flex-col"
                onClick={(e) => e.stopPropagation()}
              >
                <StudentDirectChatPanel
                  variant="drawer"
                  contextTag={modalOptions.contextTag}
                  courseTitle={modalOptions.courseTitle}
                  initialDraft={modalOptions.initialDraft}
                  onClose={() => setOpen(false)}
                />
              </div>
            </div>
          </div>,
          document.body
        )}
    </>
  );
}
