import { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import {
  MessageCircle,
  Send,
  Sparkles,
  CheckCircle2,
  ShieldCheck,
  RefreshCw,
  X,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthProvider';
import {
  loadDirectChatConversation,
  sendDirectChatMessage,
  markDirectChatReadByStudent,
  subscribeToDirectChat,
  buildStudentApplicantTemplates,
  type DirectChatConversation,
  type DirectChatContextTag,
} from '../../services/directChatService';

interface StudentDirectChatPanelProps {
  variant?: 'embedded' | 'drawer';
  courseTitle?: string | null;
  contextTag?: DirectChatContextTag;
  initialDraft?: string;
  onClose?: () => void;
}

function formatChatTime(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleString('es-MX', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function StudentDirectChatPanel({
  variant = 'embedded',
  courseTitle,
  contextTag,
  initialDraft,
  onClose,
}: StudentDirectChatPanelProps) {
  const { user, profile, isPendingApproval, isRejected } = useAuth();
  const [conversation, setConversation] = useState<DirectChatConversation | null>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [draft, setDraft] = useState(initialDraft ?? '');
  const [error, setError] = useState<string | null>(null);
  const [sentNotice, setSentNotice] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const studentDisplayName =
    profile?.display_name ||
    user?.user_metadata?.full_name ||
    user?.email?.split('@')[0] ||
    'Médico';

  const resolvedContextTag: DirectChatContextTag =
    contextTag ?? (isPendingApproval || isRejected ? 'waitlist' : 'general');

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 60);
  };

  const fetchChat = useCallback(
    async (silent = false) => {
      if (!user?.id) {
        setLoading(false);
        return;
      }
      if (!silent) setLoading(true);
      setError(null);
      try {
        const conv = await loadDirectChatConversation(user.id, {
          studentDisplayName,
          studentAvatarUrl: profile?.avatar_url,
        });
        setConversation(conv);
        if (conv.messages.length > 0) {
          void markDirectChatReadByStudent(user.id);
        }
        if (!silent) scrollToBottom();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'No se pudo cargar el chat directo.');
      } finally {
        if (!silent) setLoading(false);
      }
    },
    [user?.id, studentDisplayName, profile?.avatar_url]
  );

  useEffect(() => {
    if (initialDraft) {
      setDraft(initialDraft);
    }
  }, [initialDraft]);

  useEffect(() => {
    void fetchChat(false);
  }, [fetchChat]);

  useEffect(() => {
    if (!user?.id) return;
    const unsubscribe = subscribeToDirectChat(user.id, () => {
      void fetchChat(true);
      scrollToBottom();
    });
    return () => unsubscribe();
  }, [user?.id, fetchChat]);

  const quickTemplates = useMemo(() => {
    if (isPendingApproval || isRejected || resolvedContextTag === 'waitlist' || resolvedContextTag === 'course_gate') {
      return buildStudentApplicantTemplates(courseTitle);
    }
    return [
      {
        id: 'student_support',
        label: '📚 Duda sobre actividades o lecturas',
        text: 'Hola Profesor, tengo una consulta respecto a mis actividades y lecturas asignadas en el curso: ',
      },
      {
        id: 'student_schedule',
        label: '🩺 Solicitar orientación académica',
        text: 'Hola Profesor, me gustaría solicitar orientación sobre mi avance académico en el diplomado.',
      },
    ];
  }, [isPendingApproval, isRejected, resolvedContextTag, courseTitle]);

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!user?.id || !draft.trim() || sending) return;

    setSending(true);
    setError(null);
    try {
      await sendDirectChatMessage({
        studentId: user.id,
        body: draft,
        senderId: user.id,
        senderName: studentDisplayName,
        isStaffSender: false,
        contextTag: resolvedContextTag,
      });
      setDraft('');
      setSentNotice('Mensaje enviado al Profesor / Dirección Académica.');
      setTimeout(() => setSentNotice(null), 3500);
      await fetchChat(true);
      scrollToBottom();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo enviar el mensaje.');
    } finally {
      setSending(false);
    }
  };

  if (!user) return null;

  const hasStaffMessages = Boolean(conversation?.messages.some((m) => m.isFromStaff));

  return (
    <div
      className={`rounded-2xl border overflow-hidden flex flex-col transition-all ${
        variant === 'drawer'
          ? 'h-full border-0 rounded-none bg-white dark:bg-slate-900'
          : hasStaffMessages
          ? 'border-indigo-400/80 dark:border-indigo-500/60 bg-white/95 dark:bg-slate-900/95 shadow-lg shadow-indigo-500/10'
          : 'border-slate-200/90 dark:border-slate-700/80 bg-white/90 dark:bg-slate-900/90 shadow-sm'
      }`}
    >
      {/* Header */}
      <div className="px-4 py-3.5 border-b border-slate-200/70 dark:border-slate-800 bg-gradient-to-r from-indigo-600/10 via-blue-600/5 to-transparent dark:from-indigo-950/70 dark:via-slate-900 dark:to-slate-900 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-600 to-blue-600 text-white flex items-center justify-center shadow-xs shrink-0">
            <MessageCircle className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white">
                Chat Directo con Dirección Académica
              </h3>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
                <ShieldCheck className="w-3 h-3" /> Privado 1:1
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
              {isPendingApproval || isRejected
                ? 'Comunícate directamente con el profesor mientras se aprueba tu ingreso al curso.'
                : 'Canal directo con tu profesor titular y coordinación académica.'}
            </p>
          </div>
        </div>

        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition cursor-pointer"
            aria-label="Cerrar chat directo"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Messages area */}
      <div
        className={`p-3.5 sm:p-4 overflow-y-auto space-y-2.5 bg-slate-50/60 dark:bg-slate-950/40 ${
          variant === 'drawer' ? 'flex-1 min-h-[260px]' : 'max-h-72 min-h-[160px]'
        }`}
      >
        {loading && (!conversation || conversation.messages.length === 0) ? (
          <div className="py-10 text-center text-xs text-slate-400 flex flex-col items-center gap-2">
            <RefreshCw className="w-4 h-4 animate-spin text-indigo-500" />
            <span>Conectando con Dirección Académica…</span>
          </div>
        ) : !conversation || conversation.messages.length === 0 ? (
          <div className="py-6 px-3 text-center space-y-1.5">
            <p className="text-xs font-bold text-slate-700 dark:text-slate-200">
              {isPendingApproval || isRejected
                ? '¿Tienes dudas sobre tu admisión, beca o comprobante de pago?'
                : '¿Necesitas apoyo del profesor o tienes alguna duda académica?'}
            </p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 max-w-md mx-auto">
              Escribe un mensaje aquí abajo o selecciona una opción rápida. El profesor lo recibirá directamente en su bandeja y verás su respuesta en esta misma pantalla.
            </p>
          </div>
        ) : (
          conversation.messages.map((msg) => {
            const isMine = !msg.isFromStaff;
            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isMine ? 'items-end' : 'items-start'}`}
              >
                <div className="flex items-center gap-1.5 mb-0.5 px-1">
                  <span
                    className={`text-[10px] font-bold ${
                      msg.isFromStaff
                        ? 'text-indigo-600 dark:text-cyan-400'
                        : 'text-slate-500 dark:text-slate-400'
                    }`}
                  >
                    {msg.isFromStaff ? `🩺 ${msg.authorName}` : 'Tú'}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    · {formatChatTime(msg.createdAt)}
                  </span>
                </div>
                <div
                  className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed shadow-2xs whitespace-pre-wrap break-words ${
                    isMine
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-br-xs'
                      : 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-indigo-200/80 dark:border-indigo-800/70 rounded-bl-xs'
                  }`}
                >
                  {msg.body}
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompts */}
      <div className="px-3.5 py-2 border-t border-slate-200/60 dark:border-slate-800 bg-white dark:bg-slate-900">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 scrollbar-none">
          <Sparkles className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
          {quickTemplates.map((tpl) => (
            <button
              key={tpl.id}
              type="button"
              onClick={() => {
                setDraft(tpl.text);
                textareaRef.current?.focus();
              }}
              className="shrink-0 px-2.5 py-1 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 hover:border-indigo-300 text-slate-700 dark:text-slate-300 text-[11px] font-semibold transition cursor-pointer"
            >
              {tpl.label}
            </button>
          ))}
        </div>
      </div>

      {/* Input form */}
      <form
        onSubmit={handleSend}
        className="p-3.5 border-t border-slate-200/70 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-2"
      >
        {error && (
          <div className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-[11px] text-rose-700 dark:text-rose-300">
            {error}
          </div>
        )}
        {sentNotice && (
          <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-[11px] font-semibold text-emerald-700 dark:text-emerald-300 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
            <span>{sentNotice}</span>
          </div>
        )}

        <div className="flex items-end gap-2">
          <textarea
            ref={textareaRef}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                void handleSend();
              }
            }}
            rows={2}
            placeholder="Escribe tu mensaje privado al profesor..."
            className="flex-1 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          />
          <button
            type="submit"
            disabled={sending || !draft.trim()}
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold shadow-sm transition disabled:opacity-50 cursor-pointer shrink-0"
          >
            <Send className="w-3.5 h-3.5" />
            <span>{sending ? 'Enviando…' : 'Enviar'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
