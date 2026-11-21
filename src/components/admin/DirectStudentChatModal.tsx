import { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import {
  X,
  Send,
  MessageCircle,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Sparkles,
  UserCheck,
  Building2,
  GraduationCap,
  Bell,
  Users,
  RefreshCw,
  Check,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthProvider';
import {
  loadDirectChatConversation,
  sendDirectChatMessage,
  sendBatchDirectChatMessages,
  markDirectChatResolvedByTeacher,
  subscribeToDirectChat,
  buildAtRiskMessageTemplates,
  buildWaitlistMessageTemplates,
  buildGeneralStudentTemplates,
  type DirectChatStudentTarget,
  type DirectChatConversation,
} from '../../services/directChatService';
import { invalidateStaffInbox } from '../../hooks/useStaffInbox';

interface DirectStudentChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  target: DirectChatStudentTarget | null;
  batchTargets?: DirectChatStudentTarget[] | null;
  onMessageSent?: () => void;
  onSelectSingleTarget?: (target: DirectChatStudentTarget) => void;
}

function formatMessageTime(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleString('es-MX', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function DirectStudentChatModal({
  isOpen,
  onClose,
  target,
  batchTargets,
  onMessageSent,
  onSelectSingleTarget,
}: DirectStudentChatModalProps) {
  const { user, profile } = useAuth();
  const [conversation, setConversation] = useState<DirectChatConversation | null>(null);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [resolving, setResolving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [draft, setDraft] = useState('');
  const [sendPush, setSendPush] = useState(true);
  const [feedbackToast, setFeedbackToast] = useState<string | null>(null);

  // Batch mode state (e.g., send personalized private messages to all At-Risk students)
  const isBatchMode = Boolean(batchTargets && batchTargets.length > 0 && !target);
  const [batchTemplateMode, setBatchTemplateMode] = useState<'personalized_overdue' | 'support' | 'custom'>(
    'personalized_overdue'
  );
  const [batchCustomText, setBatchCustomText] = useState(
    'Hola {nombre}, te escribimos de la Dirección Académica de ElectroDx porque en tu expediente aparecen obligaciones vencidas ({motivos}). ¿Cómo podemos apoyarte para ponerte al corriente esta semana?'
  );

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const teacherName =
    profile?.display_name || user?.user_metadata?.full_name || 'Dirección Académica';

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 60);
  };

  const fetchConversation = useCallback(
    async (silent = false) => {
      if (!target?.id) return;
      if (!silent) setLoading(true);
      setError(null);
      try {
        const conv = await loadDirectChatConversation(target.id, {
          studentDisplayName: target.displayName,
          studentAvatarUrl: target.avatarUrl,
        });
        setConversation(conv);
        if (!silent) scrollToBottom();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'No se pudo cargar la conversación.');
      } finally {
        if (!silent) setLoading(false);
      }
    },
    [target?.id, target?.displayName, target?.avatarUrl]
  );

  useEffect(() => {
    if (!isOpen) return;
    setError(null);
    setFeedbackToast(null);
    if (target) {
      setDraft(target.initialDraft ?? '');
      void fetchConversation(false);
    } else {
      setConversation(null);
    }
  }, [isOpen, target, fetchConversation]);

  // Realtime updates for active target
  useEffect(() => {
    if (!isOpen || !target?.id) return;
    const unsubscribe = subscribeToDirectChat(target.id, () => {
      void fetchConversation(true);
      scrollToBottom();
    });
    return () => unsubscribe();
  }, [isOpen, target?.id, fetchConversation]);

  const templates = useMemo(() => {
    if (!target) return [];
    const isWaitlist =
      target.contextTag === 'waitlist' ||
      target.enrollmentStatus === 'pending' ||
      target.enrollmentStatus === 'rejected';
    const isAtRisk =
      target.contextTag === 'at_risk' || (target.riskReasons && target.riskReasons.length > 0);

    if (isAtRisk) {
      return buildAtRiskMessageTemplates(target.displayName, target.riskReasons);
    }
    if (isWaitlist) {
      return buildWaitlistMessageTemplates(target.displayName, {
        courseTitle: target.courseTitle,
        isProfilePending: target.enrollmentStatus === 'pending',
        isRejected: target.enrollmentStatus === 'rejected',
      });
    }
    return buildGeneralStudentTemplates(target.displayName);
  }, [target]);

  if (!isOpen || (!target && !isBatchMode)) return null;

  const handleSendSingle = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!target || !user?.id || !draft.trim() || sending) return;

    setSending(true);
    setError(null);
    try {
      await sendDirectChatMessage({
        studentId: target.id,
        body: draft,
        senderId: user.id,
        senderName: teacherName,
        isStaffSender: true,
        contextTag: target.contextTag ?? 'general',
        sendPush,
      });
      setDraft('');
      setFeedbackToast('Mensaje enviado al canal privado del alumno.');
      setTimeout(() => setFeedbackToast(null), 3500);
      await fetchConversation(true);
      scrollToBottom();
      invalidateStaffInbox();
      onMessageSent?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al enviar el mensaje.');
    } finally {
      setSending(false);
    }
  };

  const handleMarkResolved = async () => {
    if (!conversation?.threadId || resolving) return;
    setResolving(true);
    try {
      await markDirectChatResolvedByTeacher(conversation.threadId, user?.id);
      await fetchConversation(true);
      invalidateStaffInbox();
      onMessageSent?.();
      setFeedbackToast('Conversación marcada como atendida.');
      setTimeout(() => setFeedbackToast(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo actualizar el estado.');
    } finally {
      setResolving(false);
    }
  };

  const buildPersonalizedBatchBody = (std: DirectChatStudentTarget): string => {
    const reasons =
      std.riskReasons && std.riskReasons.length > 0
        ? std.riskReasons.join('; ')
        : 'obligaciones académicas vencidas en el calendario';
    if (batchTemplateMode === 'personalized_overdue') {
      return `Hola ${std.displayName}, te escribo de la Dirección Académica de ElectroDx. Notamos que en tu expediente aparece pendiente: ${reasons}. ¿Tienes alguna duda o inconveniente con el que podamos apoyarte para ponerte al corriente esta semana?`;
    }
    if (batchTemplateMode === 'support') {
      return `Hola ${std.displayName}, queremos dar seguimiento a tu avance en el curso. Vemos pendiente: ${reasons}. Cuéntanos por este chat privado cómo podemos apoyarte.`;
    }
    return batchCustomText
      .replace(/\{nombre\}/gi, std.displayName)
      .replace(/\{motivos\}/gi, reasons);
  };

  const handleSendBatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!batchTargets || batchTargets.length === 0 || !user?.id || sending) return;

    setSending(true);
    setError(null);
    try {
      const recipients = batchTargets.map((std) => ({
        studentId: std.id,
        studentName: std.displayName,
        customBody: buildPersonalizedBatchBody(std),
      }));

      const res = await sendBatchDirectChatMessages({
        recipients,
        senderId: user.id,
        senderName: teacherName,
        contextTag: 'at_risk',
        sendPush,
      });

      invalidateStaffInbox();
      onMessageSent?.();
      setFeedbackToast(
        `¡Se enviaron ${res.sentCount} mensajes privados personalizados a los alumnos en riesgo!`
      );
      setTimeout(() => {
        onClose();
      }, 1600);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al enviar mensajes en lote.');
    } finally {
      setSending(false);
    }
  };

  const isPendingApplicant =
    target?.enrollmentStatus === 'pending' || target?.contextTag === 'waitlist';
  const isRejectedApplicant = target?.enrollmentStatus === 'rejected';
  const isAtRiskStudent =
    target?.contextTag === 'at_risk' || Boolean(target?.riskReasons && target.riskReasons.length > 0);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/75 backdrop-blur-xs animate-fadeIn"
      role="dialog"
      aria-modal="true"
      aria-label={
        isBatchMode
          ? 'Enviar mensaje privado a alumnos en riesgo'
          : `Chat privado con ${target?.displayName}`
      }
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ─── HEADER ─── */}
        <div className="px-5 py-4 border-b border-slate-200/80 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/90 flex items-start justify-between gap-3 shrink-0">
          {isBatchMode ? (
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-11 h-11 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
                <Users className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white">
                    Mensaje Directo a Alumnos en Riesgo ({batchTargets?.length})
                  </h2>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300 border border-rose-300 dark:border-rose-800">
                    Chat 1:1 Individualizado
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Cada alumno recibirá su propio mensaje privado con sus obligaciones vencidas específicas.
                </p>
              </div>
            </div>
          ) : (
            <div className="flex items-start gap-3 min-w-0">
              <div
                className={`w-11 h-11 rounded-2xl flex items-center justify-center font-black text-sm shrink-0 overflow-hidden border ${
                  isAtRiskStudent
                    ? 'bg-rose-100 dark:bg-rose-950/70 text-rose-700 dark:text-rose-300 border-rose-300 dark:border-rose-800'
                    : isPendingApplicant
                    ? 'bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-800'
                    : 'bg-indigo-100 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800'
                }`}
              >
                {target?.avatarUrl ? (
                  <img src={target.avatarUrl} alt="" className="w-full h-full object-cover" />
                ) : (
                  (target?.displayName || 'M').charAt(0).toUpperCase()
                )}
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white truncate">
                    {target?.displayName}
                  </h2>

                  {isAtRiskStudent && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300 border border-rose-300 dark:border-rose-800">
                      <AlertTriangle className="w-3 h-3 text-rose-500" />
                      {target?.complianceLabel || 'En riesgo'}
                    </span>
                  )}

                  {isPendingApplicant && !isRejectedApplicant && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
                      <Clock className="w-3 h-3 text-amber-600" />
                      {target?.courseTitle
                        ? `Lista de espera · ${target.courseTitle}`
                        : 'En espera de aprobación'}
                    </span>
                  )}

                  {isRejectedApplicant && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-800 dark:bg-red-950/80 dark:text-red-300 border border-red-300 dark:border-red-800">
                      No aceptado / Rechazado
                    </span>
                  )}

                  {!isAtRiskStudent && !isPendingApplicant && !isRejectedApplicant && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                      <UserCheck className="w-3 h-3" />
                      Canal Privado Directo
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-x-2.5 gap-y-0.5 text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  {target?.email && <span>{target.email}</span>}
                  {target?.institution && (
                    <span className="inline-flex items-center gap-1">
                      <Building2 className="w-3 h-3 text-slate-400" />
                      {target.institution}
                    </span>
                  )}
                  {target?.specialty && (
                    <span className="inline-flex items-center gap-1">
                      <GraduationCap className="w-3 h-3 text-slate-400" />
                      {target.specialty}
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}

          <div className="flex items-center gap-1.5 shrink-0">
            {!isBatchMode && conversation?.needsTeacherReply && (
              <button
                type="button"
                disabled={resolving}
                onClick={handleMarkResolved}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-[11px] font-bold transition cursor-pointer"
                title="Marcar mensaje del alumno como atendido"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Marcar atendido</span>
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition cursor-pointer"
              aria-label="Cerrar chat"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* ─── CONTEXT BANNER FOR AT-RISK OR WAITLIST ─── */}
        {!isBatchMode && target?.riskReasons && target.riskReasons.length > 0 && (
          <div className="px-5 py-2.5 bg-rose-50/90 dark:bg-rose-950/35 border-b border-rose-200/80 dark:border-rose-900/60 flex flex-wrap items-center gap-1.5 shrink-0">
            <span className="text-[11px] font-bold text-rose-800 dark:text-rose-200 mr-1">
              Motivos de alerta académica:
            </span>
            {target.riskReasons.map((reason, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-white dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800"
              >
                <AlertTriangle className="w-3 h-3 text-rose-500 shrink-0" />
                {reason}
              </span>
            ))}
          </div>
        )}

        {!isBatchMode && (isPendingApplicant || isRejectedApplicant) && (
          <div className="px-5 py-2.5 bg-amber-50/90 dark:bg-amber-950/30 border-b border-amber-200/80 dark:border-amber-900/50 text-[11px] text-amber-900 dark:text-amber-200 flex items-center gap-2 shrink-0">
            <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
            <span>
              <strong>Visible en pantalla de espera:</strong> El aspirante verá tu mensaje de inmediato en su pantalla de espera de aprobación y podrá responderte desde ahí.
            </span>
          </div>
        )}

        {/* ─── BODY: BATCH MODE VS 1:1 CHAT ─── */}
        {isBatchMode ? (
          <form onSubmit={handleSendBatch} className="p-5 overflow-y-auto space-y-4 flex-1">
            <div>
              <p className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                1. Selecciona el tipo de mensaje personalizado:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {(
                  [
                    ['personalized_overdue', '⚠️ Recordar obligaciones vencidas'],
                    ['support', '🤝 Ofrecer apoyo académico'],
                    ['custom', '✏️ Plantilla personalizada'],
                  ] as const
                ).map(([id, label]) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setBatchTemplateMode(id)}
                    className={`p-2.5 rounded-xl border text-left text-xs font-bold transition cursor-pointer ${
                      batchTemplateMode === id
                        ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300'
                        : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {batchTemplateMode === 'custom' && (
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Texto del mensaje (usa <code className="text-indigo-600 dark:text-cyan-400">{'{nombre}'}</code> y{' '}
                  <code className="text-indigo-600 dark:text-cyan-400">{'{motivos}'}</code>):
                </label>
                <textarea
                  rows={3}
                  value={batchCustomText}
                  onChange={(e) => setBatchCustomText(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-3 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>
            )}

            <div>
              <p className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                2. Vista previa por alumno ({batchTargets?.length} destinatarios):
              </p>
              <div className="max-h-56 overflow-y-auto space-y-2 pr-1">
                {batchTargets?.map((std) => (
                  <div
                    key={std.id}
                    className="p-3 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 text-xs space-y-1.5"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="font-bold text-slate-900 dark:text-white truncate">
                          {std.displayName}
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300">
                          {std.complianceLabel || 'En riesgo'}
                        </span>
                      </div>
                      {onSelectSingleTarget && (
                        <button
                          type="button"
                          onClick={() => onSelectSingleTarget(std)}
                          className="text-[11px] font-bold text-indigo-600 dark:text-cyan-400 hover:underline shrink-0 cursor-pointer"
                        >
                          Abrir chat 1:1 →
                        </button>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-200/60 dark:border-slate-800">
                      {buildPersonalizedBatchBody(std)}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs text-rose-700 dark:text-rose-300">
                {error}
              </div>
            )}

            {feedbackToast && (
              <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs font-bold text-emerald-700 dark:text-emerald-300 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{feedbackToast}</span>
              </div>
            )}

            <div className="pt-2 border-t border-slate-200/80 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <label className="inline-flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={sendPush}
                  onChange={(e) => setSendPush(e.target.checked)}
                  className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                />
                <Bell className="w-3.5 h-3.5 text-indigo-500" />
                <span>Enviar notificación Push e In-App a cada alumno</span>
              </label>

              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={sending}
                  className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white text-xs font-bold shadow-md transition disabled:opacity-50 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>
                    {sending
                      ? 'Enviando mensajes…'
                      : `Enviar a los ${batchTargets?.length} alumnos en riesgo`}
                  </span>
                </button>
              </div>
            </div>
          </form>
        ) : (
          <>
            {/* ─── 1:1 MESSAGES LIST ─── */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3 bg-slate-50/50 dark:bg-slate-950/40 min-h-[240px] max-h-[420px]">
              {loading && (!conversation || conversation.messages.length === 0) ? (
                <div className="py-14 text-center text-xs text-slate-400 flex flex-col items-center gap-2">
                  <RefreshCw className="w-5 h-5 animate-spin text-indigo-500" />
                  <span>Cargando historial de conversación privada…</span>
                </div>
              ) : !conversation || conversation.messages.length === 0 ? (
                <div className="py-10 px-4 text-center space-y-2 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-900/50">
                  <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto">
                    <MessageCircle className="w-5 h-5" />
                  </div>
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    Inicia una conversación privada con {target?.displayName}
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                    {isPendingApplicant || isRejectedApplicant
                      ? 'El mensaje aparecerá directamente en su pantalla de espera de aprobación del curso y recibirá una notificación para responderte.'
                      : 'El alumno recibirá tu mensaje en su chat privado del portal y una alerta en su dispositivo.'}
                  </p>
                </div>
              ) : (
                conversation.messages.map((msg) => {
                  const isStaff = msg.isFromStaff;
                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${isStaff ? 'items-end' : 'items-start'}`}
                    >
                      <div className="flex items-center gap-1.5 mb-1 px-1">
                        <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">
                          {isStaff ? `${msg.authorName} (Docente)` : msg.authorName}
                        </span>
                        <span className="text-[10px] text-slate-400 dark:text-slate-500">
                          · {formatMessageTime(msg.createdAt)}
                        </span>
                      </div>
                      <div
                        className={`max-w-[85%] sm:max-w-[78%] rounded-2xl px-4 py-2.5 text-xs leading-relaxed shadow-2xs whitespace-pre-wrap break-words ${
                          isStaff
                            ? 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-br-xs'
                            : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-200/80 dark:border-slate-700 rounded-bl-xs'
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

            {/* ─── QUICK TEMPLATES BAR ─── */}
            {templates.length > 0 && (
              <div className="px-4 py-2.5 border-t border-slate-200/70 dark:border-slate-800 bg-white dark:bg-slate-900 shrink-0">
                <div className="flex items-center gap-1.5 mb-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                    Plantillas rápidas (clic para usar):
                  </span>
                </div>
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                  {templates.map((tpl) => (
                    <button
                      key={tpl.id}
                      type="button"
                      onClick={() => {
                        setDraft(tpl.text);
                        textareaRef.current?.focus();
                      }}
                      className="shrink-0 px-2.5 py-1 rounded-xl border border-indigo-200/80 dark:border-indigo-800/80 bg-indigo-50/60 dark:bg-indigo-950/40 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 text-[11px] font-semibold transition cursor-pointer"
                    >
                      {tpl.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* ─── COMPOSER ─── */}
            <form
              onSubmit={handleSendSingle}
              className="p-4 border-t border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-2.5 shrink-0"
            >
              {error && (
                <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs text-rose-700 dark:text-rose-300">
                  {error}
                </div>
              )}

              {feedbackToast && (
                <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs font-bold text-emerald-700 dark:text-emerald-300 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{feedbackToast}</span>
                </div>
              )}

              <div className="flex items-end gap-2">
                <textarea
                  ref={textareaRef}
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                      e.preventDefault();
                      void handleSendSingle();
                    }
                  }}
                  rows={3}
                  placeholder={`Escribe un mensaje privado para ${target?.displayName}...`}
                  className="flex-1 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/90 px-3.5 py-2.5 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                />
                <button
                  type="submit"
                  disabled={sending || !draft.trim()}
                  className="inline-flex items-center justify-center gap-1.5 px-4 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white text-xs font-bold shadow-md transition disabled:opacity-50 cursor-pointer shrink-0"
                >
                  <Send className="w-4 h-4" />
                  <span>{sending ? 'Enviando…' : 'Enviar'}</span>
                </button>
              </div>

              <div className="flex items-center justify-between gap-2 text-[11px] text-slate-500 dark:text-slate-400">
                <label className="inline-flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={sendPush}
                    onChange={(e) => setSendPush(e.target.checked)}
                    className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <Bell className="w-3 h-3 text-indigo-500" />
                  <span>Notificar al dispositivo (In-App + Web Push)</span>
                </label>
                <span className="hidden sm:inline text-[10px] text-slate-400">
                  Ctrl + Enter para enviar rápido
                </span>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
