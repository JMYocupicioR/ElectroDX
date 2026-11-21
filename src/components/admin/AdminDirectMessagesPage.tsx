import { useEffect, useState, useMemo, useRef, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  MessageCircle,
  Search,
  Send,
  AlertTriangle,
  Clock,
  CheckCircle2,
  UserCheck,
  Sparkles,
  Bell,
  FileText,
  RefreshCw,
  Check,
  ExternalLink,
} from 'lucide-react';
import { AdminLayout } from './AdminLayout';
import { useAuth } from '../../contexts/AuthProvider';
import { getAdminProfiles } from '../../services/editorialService';
import { getAdminCourseWaitlist } from '../../services/courseService';
import { getCohortAcademicSummaries } from '../../services/gradebookService';
import { filterGradeableStudents } from '../../utils/adminUtils';
import {
  loadDirectChatConversation,
  sendDirectChatMessage,
  listAllDirectChatSummaries,
  markDirectChatResolvedByTeacher,
  subscribeToDirectChat,
  buildAtRiskMessageTemplates,
  buildWaitlistMessageTemplates,
  buildGeneralStudentTemplates,
  type DirectChatConversation,
  type DirectChatThreadSummary,
  type DirectChatStudentTarget,
  type DirectChatContextTag,
} from '../../services/directChatService';
import { invalidateStaffInbox } from '../../hooks/useStaffInbox';
import StudentKardexModal from './StudentKardexModal';
import DirectStudentChatModal from './DirectStudentChatModal';
import type { AdminProfileRow } from '../../types/admin';
import type { CourseWaitlistRow } from '../../types/database';
import type { StudentCohortSummary } from '../../types/academicGradebook';

type FilterTab = 'all' | 'unanswered' | 'at_risk' | 'waitlist' | 'active_chat';

interface DirectoryEntry {
  profile: AdminProfileRow;
  summary?: StudentCohortSummary;
  waitlistRow?: CourseWaitlistRow;
  chatSummary?: DirectChatThreadSummary;
  isAtRisk: boolean;
  isPendingOrWaitlist: boolean;
  isRejected: boolean;
  contextTag: DirectChatContextTag;
}

function formatShortTime(iso?: string | null): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const diffMs = Date.now() - d.getTime();
  if (diffMs < 60_000) return 'Ahora';
  if (diffMs < 3_600_000) return `${Math.floor(diffMs / 60_000)}m`;
  if (diffMs < 86_400_000) return `${Math.floor(diffMs / 3_600_000)}h`;
  return d.toLocaleDateString('es-MX', { day: 'numeric', month: 'short' });
}

export default function AdminDirectMessagesPage() {
  const { user, profile: staffProfile } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const requestedStudentId = searchParams.get('student');

  const [allProfiles, setAllProfiles] = useState<AdminProfileRow[]>([]);
  const [waitlistRows, setWaitlistRows] = useState<CourseWaitlistRow[]>([]);
  const [cohortSummaries, setCohortSummaries] = useState<Map<string, StudentCohortSummary>>(new Map());
  const [chatSummaries, setChatSummaries] = useState<Map<string, DirectChatThreadSummary>>(new Map());
  const [loadingDirectory, setLoadingDirectory] = useState(true);

  const [filterTab, setFilterTab] = useState<FilterTab>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(requestedStudentId);

  // Active conversation state
  const [conversation, setConversation] = useState<DirectChatConversation | null>(null);
  const [loadingChat, setLoadingChat] = useState(false);
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const [sendPush, setSendPush] = useState(true);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Modals
  const [kardexStudent, setKardexStudent] = useState<AdminProfileRow | null>(null);
  const [showBatchAtRiskModal, setShowBatchAtRiskModal] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const teacherName =
    staffProfile?.display_name || user?.user_metadata?.full_name || 'Dirección Académica';

  const loadDirectoryData = useCallback(async (silent = false) => {
    if (!silent) setLoadingDirectory(true);
    try {
      const [profilesData, waitlistData, chatsMap] = await Promise.all([
        getAdminProfiles(false, 'all').catch(() => [] as AdminProfileRow[]),
        getAdminCourseWaitlist(null, 'all').catch(() => [] as CourseWaitlistRow[]),
        listAllDirectChatSummaries().catch(() => new Map<string, DirectChatThreadSummary>()),
      ]);

      // Filter out staff accounts (except keep all students and pending/rejected applicants)
      const nonStaff = profilesData.filter(
        (p) => p.id !== user?.id && !p.roles?.includes('admin') && !p.roles?.includes('editor')
      );
      setAllProfiles(nonStaff);
      setWaitlistRows(waitlistData);
      setChatSummaries(chatsMap);

      const gradeable = filterGradeableStudents(profilesData, user?.id);
      const summaries = await getCohortAcademicSummaries(gradeable).catch(
        () => new Map<string, StudentCohortSummary>()
      );
      setCohortSummaries(summaries);
    } finally {
      if (!silent) setLoadingDirectory(false);
    }
  }, [user?.id]);

  useEffect(() => {
    void loadDirectoryData(false);
  }, [loadDirectoryData]);

  useEffect(() => {
    if (requestedStudentId && requestedStudentId !== selectedStudentId) {
      setSelectedStudentId(requestedStudentId);
    }
  }, [requestedStudentId, selectedStudentId]);

  const entries: DirectoryEntry[] = useMemo(() => {
    const waitlistByUser = new Map<string, CourseWaitlistRow>();
    for (const w of waitlistRows) {
      const existing = waitlistByUser.get(w.user_id);
      if (!existing || w.status === 'pending') {
        waitlistByUser.set(w.user_id, w);
      }
    }

    const list: DirectoryEntry[] = allProfiles.map((p) => {
      const summary = cohortSummaries.get(p.id);
      const waitlistRow = waitlistByUser.get(p.id);
      const chatSummary = chatSummaries.get(p.id);
      const isAtRisk =
        summary?.complianceStatus === 'at_risk' || summary?.complianceStatus === 'lagging';
      const isPendingOrWaitlist =
        p.enrollment_status === 'pending' || waitlistRow?.status === 'pending';
      const isRejected =
        p.enrollment_status === 'rejected' ||
        (waitlistRow?.status === 'rejected' && p.enrollment_status !== 'approved');

      const contextTag: DirectChatContextTag = isAtRisk
        ? 'at_risk'
        : isPendingOrWaitlist || isRejected
        ? 'waitlist'
        : 'general';

      return {
        profile: p,
        summary,
        waitlistRow,
        chatSummary,
        isAtRisk,
        isPendingOrWaitlist,
        isRejected,
        contextTag,
      };
    });

    return list.sort((a, b) => {
      // 1. Unanswered messages first
      const aNeeds = a.chatSummary?.needsTeacherReply ? 1 : 0;
      const bNeeds = b.chatSummary?.needsTeacherReply ? 1 : 0;
      if (aNeeds !== bNeeds) return bNeeds - aNeeds;

      // 2. Active conversation by latest timestamp
      const aTime = a.chatSummary?.lastMessageAt
        ? new Date(a.chatSummary.lastMessageAt).getTime()
        : 0;
      const bTime = b.chatSummary?.lastMessageAt
        ? new Date(b.chatSummary.lastMessageAt).getTime()
        : 0;
      if (aTime !== bTime) return bTime - aTime;

      // 3. At-risk students
      if (a.isAtRisk !== b.isAtRisk) return a.isAtRisk ? -1 : 1;

      // 4. Pending / Waitlist applicants
      if (a.isPendingOrWaitlist !== b.isPendingOrWaitlist) return a.isPendingOrWaitlist ? -1 : 1;

      return (a.profile.display_name || '').localeCompare(b.profile.display_name || '');
    });
  }, [allProfiles, cohortSummaries, waitlistRows, chatSummaries]);

  const counts = useMemo(() => {
    let unanswered = 0;
    let atRisk = 0;
    let waitlist = 0;
    let activeChat = 0;
    for (const e of entries) {
      if (e.chatSummary?.needsTeacherReply) unanswered += 1;
      if (e.isAtRisk) atRisk += 1;
      if (e.isPendingOrWaitlist || e.isRejected) waitlist += 1;
      if (e.chatSummary && e.chatSummary.messageCount > 0) activeChat += 1;
    }
    return { total: entries.length, unanswered, atRisk, waitlist, activeChat };
  }, [entries]);

  const filteredEntries = useMemo(() => {
    return entries.filter((e) => {
      if (filterTab === 'unanswered' && !e.chatSummary?.needsTeacherReply) return false;
      if (filterTab === 'at_risk' && !e.isAtRisk) return false;
      if (filterTab === 'waitlist' && !e.isPendingOrWaitlist && !e.isRejected) return false;
      if (filterTab === 'active_chat' && (!e.chatSummary || e.chatSummary.messageCount === 0))
        return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = e.profile.display_name?.toLowerCase().includes(q);
        const matchEmail = e.profile.email?.toLowerCase().includes(q);
        const matchInst = e.profile.institution?.toLowerCase().includes(q);
        const matchCedula = e.profile.cedula_profesional?.toLowerCase().includes(q);
        const matchMsg = e.chatSummary?.lastMessageBody?.toLowerCase().includes(q);
        return Boolean(matchName || matchEmail || matchInst || matchCedula || matchMsg);
      }
      return true;
    });
  }, [entries, filterTab, searchQuery]);

  // Auto-select first entry if none selected
  useEffect(() => {
    if (!selectedStudentId && filteredEntries.length > 0) {
      setSelectedStudentId(filteredEntries[0].profile.id);
    }
  }, [selectedStudentId, filteredEntries]);

  const selectedEntry = useMemo(
    () => entries.find((e) => e.profile.id === selectedStudentId) ?? null,
    [entries, selectedStudentId]
  );

  const loadSelectedChat = useCallback(
    async (silent = false) => {
      if (!selectedEntry) {
        setConversation(null);
        return;
      }
      if (!silent) setLoadingChat(true);
      setError(null);
      try {
        const conv = await loadDirectChatConversation(selectedEntry.profile.id, {
          studentDisplayName: selectedEntry.profile.display_name,
          studentAvatarUrl: selectedEntry.profile.avatar_url,
        });
        setConversation(conv);
        setTimeout(() => {
          messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 50);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al cargar mensajes.');
      } finally {
        if (!silent) setLoadingChat(false);
      }
    },
    [selectedEntry]
  );

  useEffect(() => {
    void loadSelectedChat(false);
  }, [loadSelectedChat]);

  useEffect(() => {
    const unsubscribe = subscribeToDirectChat(null, () => {
      void loadDirectoryData(true);
      void loadSelectedChat(true);
    });
    return () => unsubscribe();
  }, [loadDirectoryData, loadSelectedChat]);

  const templates = useMemo(() => {
    if (!selectedEntry) return [];
    if (selectedEntry.isAtRisk) {
      return buildAtRiskMessageTemplates(
        selectedEntry.profile.display_name,
        selectedEntry.summary?.riskReasons ?? []
      );
    }
    if (selectedEntry.isPendingOrWaitlist || selectedEntry.isRejected) {
      return buildWaitlistMessageTemplates(selectedEntry.profile.display_name, {
        courseTitle: selectedEntry.waitlistRow?.course_title,
        isProfilePending: selectedEntry.profile.enrollment_status === 'pending',
        isRejected: selectedEntry.isRejected,
      });
    }
    return buildGeneralStudentTemplates(selectedEntry.profile.display_name);
  }, [selectedEntry]);

  const atRiskBatchTargets: DirectChatStudentTarget[] = useMemo(() => {
    return entries
      .filter((e) => e.isAtRisk)
      .map((e) => ({
        id: e.profile.id,
        displayName: e.profile.display_name,
        email: e.profile.email,
        institution: e.profile.institution,
        specialty: e.profile.specialty,
        complianceLabel: e.summary?.complianceLabel || 'En riesgo',
        riskReasons: e.summary?.riskReasons ?? [],
        contextTag: 'at_risk',
      }));
  }, [entries]);

  const handleSelectStudent = (studentId: string) => {
    setSelectedStudentId(studentId);
    setSearchParams({ student: studentId }, { replace: true });
    setFeedback(null);
    setError(null);
  };

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!selectedEntry || !user?.id || !draft.trim() || sending) return;

    setSending(true);
    setError(null);
    try {
      await sendDirectChatMessage({
        studentId: selectedEntry.profile.id,
        body: draft,
        senderId: user.id,
        senderName: teacherName,
        isStaffSender: true,
        contextTag: selectedEntry.contextTag,
        sendPush,
      });
      setDraft('');
      setFeedback('Mensaje enviado correctamente.');
      setTimeout(() => setFeedback(null), 3000);
      await Promise.all([loadSelectedChat(true), loadDirectoryData(true)]);
      invalidateStaffInbox();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo enviar el mensaje.');
    } finally {
      setSending(false);
    }
  };

  const handleMarkResolved = async () => {
    if (!conversation?.threadId) return;
    try {
      await markDirectChatResolvedByTeacher(conversation.threadId, user?.id);
      await Promise.all([loadSelectedChat(true), loadDirectoryData(true)]);
      invalidateStaffInbox();
      setFeedback('Marcado como atendido.');
      setTimeout(() => setFeedback(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo marcar como atendido.');
    }
  };

  return (
    <AdminLayout
      title="Canal de Comunicación Directa (Chat Privado)"
      subtitle="Mensajería 1:1 en tiempo real con alumnos activos, alumnos en riesgo académico y aspirantes en pantalla de espera de aprobación."
      headerActions={
        atRiskBatchTargets.length > 0 ? (
          <button
            type="button"
            onClick={() => setShowBatchAtRiskModal(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-xs transition cursor-pointer"
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Mensaje a los {atRiskBatchTargets.length} alumnos en riesgo</span>
          </button>
        ) : undefined
      }
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch min-h-[680px]">
        {/* ─── LEFT PANE: STUDENT / APPLICANT CONVERSATION LIST ─── */}
        <div className="lg:col-span-5 xl:col-span-4 rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col overflow-hidden shadow-xs">
          {/* Search & Filters */}
          <div className="p-3.5 border-b border-slate-100 dark:border-slate-800 space-y-2.5 bg-slate-50/50 dark:bg-slate-900/80">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar alumno o aspirante en espera..."
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="flex flex-wrap gap-1">
              {(
                [
                  ['all', `Todos (${counts.total})`],
                  ['unanswered', `Sin responder (${counts.unanswered})`],
                  ['at_risk', `En riesgo (${counts.atRisk})`],
                  ['waitlist', `En espera / No aceptados (${counts.waitlist})`],
                  ['active_chat', `Con chat (${counts.activeChat})`],
                ] as const
              ).map(([id, label]) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setFilterTab(id)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition cursor-pointer ${
                    filterTab === id
                      ? 'bg-indigo-600 text-white shadow-2xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200/70 dark:hover:bg-slate-700'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/80 max-h-[560px]">
            {loadingDirectory ? (
              <div className="py-16 text-center text-xs text-slate-400">
                <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-indigo-500" />
                Cargando directorio y conversaciones…
              </div>
            ) : filteredEntries.length === 0 ? (
              <div className="py-12 px-4 text-center text-xs text-slate-400">
                No hay alumnos o aspirantes que coincidan con este filtro.
              </div>
            ) : (
              filteredEntries.map((entry) => {
                const { profile: std, chatSummary, isAtRisk, isPendingOrWaitlist, isRejected } = entry;
                const isSelected = std.id === selectedStudentId;
                const needsReply = Boolean(chatSummary?.needsTeacherReply);

                return (
                  <button
                    key={std.id}
                    type="button"
                    onClick={() => handleSelectStudent(std.id)}
                    className={`w-full p-3.5 text-left transition flex items-start gap-3 cursor-pointer ${
                      isSelected
                        ? 'bg-indigo-50/90 dark:bg-indigo-950/50 border-l-4 border-l-indigo-600'
                        : needsReply
                        ? 'bg-amber-50/40 dark:bg-amber-950/20 hover:bg-amber-50/70'
                        : 'hover:bg-slate-50 dark:hover:bg-slate-800/40'
                    }`}
                  >
                    <div
                      className={`relative w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                        isAtRisk
                          ? 'bg-rose-100 dark:bg-rose-950/70 text-rose-700 dark:text-rose-300'
                          : isPendingOrWaitlist
                          ? 'bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300'
                          : isRejected
                          ? 'bg-red-100 dark:bg-red-950/70 text-red-700 dark:text-red-300'
                          : 'bg-indigo-100 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300'
                      }`}
                    >
                      {(std.display_name || 'M').charAt(0).toUpperCase()}
                      {needsReply && (
                        <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-rose-500 ring-2 ring-white dark:ring-slate-900 animate-pulse" />
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-xs font-extrabold text-slate-900 dark:text-white truncate">
                          {std.display_name || std.email}
                        </p>
                        {chatSummary?.lastMessageAt && (
                          <span className="text-[10px] font-semibold text-slate-400 shrink-0">
                            {formatShortTime(chatSummary.lastMessageAt)}
                          </span>
                        )}
                      </div>

                      {/* Status Badges */}
                      <div className="flex items-center gap-1.5 flex-wrap mt-1">
                        {needsReply && (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-extrabold bg-rose-500 text-white">
                            Por responder
                          </span>
                        )}
                        {isAtRisk && (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
                            {entry.summary?.complianceLabel || 'En riesgo'}
                          </span>
                        )}
                        {isPendingOrWaitlist && (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                            {entry.waitlistRow?.course_title
                              ? `Espera: ${entry.waitlistRow.course_title}`
                              : 'Pendiente aprobación'}
                          </span>
                        )}
                        {isRejected && (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-red-100 text-red-700 dark:bg-red-950/80 dark:text-red-300">
                            No aceptado
                          </span>
                        )}
                      </div>

                      {chatSummary?.lastMessageBody ? (
                        <p className="text-[11px] text-slate-600 dark:text-slate-300 truncate mt-1">
                          {chatSummary.lastSenderIsStaff ? 'Tú: ' : ''}
                          {chatSummary.lastMessageBody}
                        </p>
                      ) : (
                        <p className="text-[11px] text-slate-400 truncate mt-1">
                          {std.institution || std.specialty || std.email}
                        </p>
                      )}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* ─── RIGHT PANE: ACTIVE 1:1 CONVERSATION ─── */}
        <div className="lg:col-span-7 xl:col-span-8 rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col overflow-hidden shadow-xs">
          {!selectedEntry ? (
            <div className="flex-1 flex flex-col items-center justify-center p-12 text-center text-slate-400">
              <MessageCircle className="w-10 h-10 mb-3 text-slate-300 dark:text-slate-700" />
              <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
                Selecciona un alumno o aspirante
              </p>
              <p className="text-xs text-slate-400 mt-1">
                Elige un médico de la lista izquierda para abrir el canal de comunicación directa.
              </p>
            </div>
          ) : (
            <>
              {/* Active Header */}
              <div className="p-4 sm:px-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/90 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-11 h-11 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-black text-sm shrink-0">
                    {(selectedEntry.profile.display_name || 'M').charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h2 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white truncate">
                        {selectedEntry.profile.display_name}
                      </h2>
                      {selectedEntry.isAtRisk && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
                          {selectedEntry.summary?.complianceLabel || 'En riesgo'}
                        </span>
                      )}
                      {selectedEntry.isPendingOrWaitlist && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                          En espera de aprobación
                        </span>
                      )}
                      {selectedEntry.isRejected && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-700 dark:bg-red-950/80 dark:text-red-300">
                          No aceptado
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
                      {[
                        selectedEntry.profile.email,
                        selectedEntry.profile.institution,
                        selectedEntry.profile.specialty,
                      ]
                        .filter(Boolean)
                        .join(' · ')}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-wrap shrink-0">
                  {conversation?.needsTeacherReply && (
                    <button
                      type="button"
                      onClick={handleMarkResolved}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-xs font-bold transition cursor-pointer"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Marcar atendido</span>
                    </button>
                  )}

                  {selectedEntry.isPendingOrWaitlist || selectedEntry.isRejected ? (
                    <Link
                      to="/admin/admisiones"
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-amber-300 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 text-xs font-bold hover:bg-amber-100 transition"
                    >
                      <UserCheck className="w-3.5 h-3.5" />
                      <span>Ir a Admisiones</span>
                    </Link>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={() => setKardexStudent(selectedEntry.profile)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold transition cursor-pointer"
                      >
                        <FileText className="w-3.5 h-3.5 text-indigo-500" />
                        <span>Ver Kárdex</span>
                      </button>
                      <Link
                        to={`/admin/alumnos/${selectedEntry.profile.id}`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold transition"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Expediente</span>
                      </Link>
                    </>
                  )}
                </div>
              </div>

              {/* Risk or Waitlist Context Bar */}
              {selectedEntry.isAtRisk && (selectedEntry.summary?.riskReasons?.length ?? 0) > 0 && (
                <div className="px-5 py-2.5 bg-rose-50/90 dark:bg-rose-950/35 border-b border-rose-200/80 dark:border-rose-900/50 flex flex-wrap items-center gap-1.5">
                  <span className="text-[11px] font-bold text-rose-800 dark:text-rose-200">
                    Obligaciones vencidas:
                  </span>
                  {selectedEntry.summary?.riskReasons?.map((r, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-white dark:bg-rose-950 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800"
                    >
                      <AlertTriangle className="w-3 h-3 text-rose-500 shrink-0" />
                      {r}
                    </span>
                  ))}
                </div>
              )}

              {(selectedEntry.isPendingOrWaitlist || selectedEntry.isRejected) && (
                <div className="px-5 py-2.5 bg-amber-50/90 dark:bg-amber-950/30 border-b border-amber-200/80 dark:border-amber-900/50 text-[11px] text-amber-900 dark:text-amber-200 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>
                    Este médico aún no tiene acceso aprobado. Tus mensajes le aparecen directamente en su{' '}
                    <strong>pantalla de espera de aprobación del curso</strong>.
                  </span>
                </div>
              )}

              {/* Messages Stream */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3 bg-slate-50/40 dark:bg-slate-950/30 min-h-[300px] max-h-[420px]">
                {loadingChat ? (
                  <div className="py-16 text-center text-xs text-slate-400">
                    <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-indigo-500" />
                    Cargando mensajes…
                  </div>
                ) : !conversation || conversation.messages.length === 0 ? (
                  <div className="py-12 px-4 text-center rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/40 space-y-2">
                    <MessageCircle className="w-7 h-7 text-indigo-500 mx-auto" />
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      Aún no hay mensajes con {selectedEntry.profile.display_name}
                    </p>
                    <p className="text-[11px] text-slate-500 max-w-md mx-auto">
                      Usa una de las plantillas rápidas de abajo o escribe un mensaje directo para iniciar la conversación privada.
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
                          <span className="text-[10px] text-slate-400">
                            · {formatShortTime(msg.createdAt)}
                          </span>
                        </div>
                        <div
                          className={`max-w-[82%] rounded-2xl px-4 py-2.5 text-xs leading-relaxed shadow-2xs whitespace-pre-wrap break-words ${
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

              {/* Templates */}
              {templates.length > 0 && (
                <div className="px-4 py-2.5 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                      Mensajes sugeridos:
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
                        className="shrink-0 px-2.5 py-1 rounded-xl border border-indigo-200/80 dark:border-indigo-800 bg-indigo-50/60 dark:bg-indigo-950/40 hover:bg-indigo-100 text-indigo-700 dark:text-indigo-300 text-[11px] font-semibold transition cursor-pointer"
                      >
                        {tpl.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Composer */}
              <form
                onSubmit={handleSend}
                className="p-4 border-t border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-2"
              >
                {error && (
                  <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs text-rose-700 dark:text-rose-300">
                    {error}
                  </div>
                )}
                {feedback && (
                  <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs font-bold text-emerald-700 dark:text-emerald-300 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>{feedback}</span>
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
                        void handleSend();
                      }
                    }}
                    rows={2}
                    placeholder={`Escribe un mensaje privado para ${selectedEntry.profile.display_name}...`}
                    className="flex-1 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3.5 py-2.5 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                  />
                  <button
                    type="submit"
                    disabled={sending || !draft.trim()}
                    className="inline-flex items-center gap-1.5 px-4 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white text-xs font-bold shadow-md transition disabled:opacity-50 cursor-pointer shrink-0"
                  >
                    <Send className="w-4 h-4" />
                    <span>{sending ? 'Enviando…' : 'Enviar'}</span>
                  </button>
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-500">
                  <label className="inline-flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={sendPush}
                      onChange={(e) => setSendPush(e.target.checked)}
                      className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <Bell className="w-3 h-3 text-indigo-500" />
                    <span>Enviar alerta Push e In-App al dispositivo</span>
                  </label>
                  <span className="hidden sm:inline text-[10px] text-slate-400">
                    Ctrl + Enter para enviar
                  </span>
                </div>
              </form>
            </>
          )}
        </div>
      </div>

      {kardexStudent && (
        <StudentKardexModal
          isOpen={Boolean(kardexStudent)}
          onClose={() => setKardexStudent(null)}
          studentId={kardexStudent.id}
          profile={kardexStudent}
        />
      )}

      {showBatchAtRiskModal && (
        <DirectStudentChatModal
          isOpen={showBatchAtRiskModal}
          onClose={() => setShowBatchAtRiskModal(false)}
          target={null}
          batchTargets={atRiskBatchTargets}
          onMessageSent={() => {
            void loadDirectoryData(true);
            void loadSelectedChat(true);
          }}
          onSelectSingleTarget={(single) => {
            setShowBatchAtRiskModal(false);
            handleSelectStudent(single.id);
          }}
        />
      )}
    </AdminLayout>
  );
}
