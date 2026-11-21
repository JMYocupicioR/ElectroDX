import { isSupabaseConfigured, sb as supabase } from '../lib/supabase';
import { getCourseTeachers } from './editorialService';
import { sendAcademicPush } from './studentToolsService';
import { emitStudentNotificationsUpdated } from './assignmentSubmissionService';

export const DIRECT_CHAT_MODULE_ID = '__direct_chat__';
export const DIRECT_CHAT_PLACEHOLDER_BODY = 'Canal de comunicación directa con Dirección Académica';
export const DIRECT_CHAT_UPDATED_EVENT = 'electrodx:direct-chat-updated';
export const OPEN_STUDENT_DIRECT_CHAT_EVENT = 'electrodx:open-student-direct-chat';

const LOCAL_READ_PREFIX = 'electrodx_direct_chat_read_v1_';

export type DirectChatContextTag =
  | 'general'
  | 'at_risk'
  | 'waitlist'
  | 'retake'
  | 'submission'
  | 'course_gate';

export interface DirectChatStudentTarget {
  id: string;
  displayName: string;
  email?: string | null;
  institution?: string | null;
  specialty?: string | null;
  residencyYear?: string | null;
  cedulaProfesional?: string | null;
  cedulaVerified?: boolean | null;
  avatarUrl?: string | null;
  enrollmentStatus?: 'pending' | 'approved' | 'rejected' | string | null;
  courseTitle?: string | null;
  courseId?: string | null;
  complianceLabel?: string | null;
  riskReasons?: string[];
  contextTag?: DirectChatContextTag;
  initialDraft?: string;
}

export interface DirectChatMessage {
  id: string;
  threadId: string;
  authorId: string;
  authorName: string;
  authorAvatarUrl?: string | null;
  isFromStaff: boolean;
  body: string;
  createdAt: string;
}

export interface DirectChatConversation {
  threadId: string | null;
  studentId: string;
  contextTag: DirectChatContextTag;
  status: 'open' | 'answered' | 'closed';
  messages: DirectChatMessage[];
  needsTeacherReply: boolean;
  unreadForStudent: boolean;
}

export interface DirectChatThreadSummary {
  threadId: string;
  studentId: string;
  contextTag: DirectChatContextTag;
  title: string;
  lastMessageBody: string;
  lastMessageAt: string;
  lastSenderIsStaff: boolean;
  status: 'open' | 'answered' | 'closed';
  needsTeacherReply: boolean;
  unreadForStudent: boolean;
  messageCount: number;
}

export interface QuickMessageTemplate {
  id: string;
  label: string;
  text: string;
}

let cachedStaffDirectory: Map<string, { displayName: string; avatarUrl: string | null }> | null = null;
let cachedStaffDirectoryAt = 0;

function normalizeContextTag(raw?: string | null): DirectChatContextTag {
  if (
    raw === 'at_risk' ||
    raw === 'waitlist' ||
    raw === 'retake' ||
    raw === 'submission' ||
    raw === 'course_gate'
  ) {
    return raw;
  }
  return 'general';
}

export function emitDirectChatUpdated(): void {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(DIRECT_CHAT_UPDATED_EVENT));
  }
}

export function openStudentDirectChatModal(detail?: {
  contextTag?: DirectChatContextTag;
  courseTitle?: string;
  initialDraft?: string;
}): void {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(OPEN_STUDENT_DIRECT_CHAT_EVENT, { detail }));
  }
}

export function getLocalDirectChatReadAt(userId: string): number {
  if (typeof window === 'undefined' || !userId) return 0;
  try {
    const raw = window.localStorage.getItem(`${LOCAL_READ_PREFIX}${userId}`);
    const parsed = raw ? Number(raw) : 0;
    return Number.isFinite(parsed) ? parsed : 0;
  } catch {
    return 0;
  }
}

export function setLocalDirectChatReadAt(userId: string, timestampMs = Date.now()): void {
  if (typeof window === 'undefined' || !userId) return;
  try {
    window.localStorage.setItem(`${LOCAL_READ_PREFIX}${userId}`, String(timestampMs));
  } catch {
    // Ignore localStorage quota errors
  }
}

async function resolveStaffDirectory(): Promise<
  Map<string, { displayName: string; avatarUrl: string | null }>
> {
  if (cachedStaffDirectory && Date.now() - cachedStaffDirectoryAt < 60_000) {
    return cachedStaffDirectory;
  }
  const map = new Map<string, { displayName: string; avatarUrl: string | null }>();
  if (!isSupabaseConfigured) return map;
  try {
    const teachers = await getCourseTeachers();
    for (const t of teachers) {
      if (t.id && t.display_name) {
        map.set(t.id, {
          displayName: t.display_name,
          avatarUrl: t.avatar_url ?? null,
        });
      }
    }
    cachedStaffDirectory = map;
    cachedStaffDirectoryAt = Date.now();
  } catch {
    // Ignore errors for pending users if network fails
  }
  return map;
}

/**
 * Generates contextual quick message templates for At-Risk students
 */
export function buildAtRiskMessageTemplates(
  studentName: string,
  riskReasons: string[] = []
): QuickMessageTemplate[] {
  const firstName = (studentName || 'Dr(a).').trim();
  const reasonsSummary =
    riskReasons.length > 0
      ? riskReasons.join('; ')
      : 'obligaciones académicas vencidas en el calendario del diplomado';

  return [
    {
      id: 'at_risk_overdue',
      label: '⚠️ Recordar obligaciones vencidas',
      text: `Hola ${firstName}, te escribo de la Dirección Académica de ElectroDx. Notamos que en tu expediente aparece pendiente: ${reasonsSummary}. ¿Tienes alguna duda o inconveniente con el que podamos apoyarte para ponerte al corriente esta semana?`,
    },
    {
      id: 'at_risk_support',
      label: '🤝 Ofrecer apoyo y seguimiento',
      text: `Hola ${firstName}, queremos dar seguimiento a tu avance en el curso. Sabemos que la carga clínica puede ser alta; cuéntanos cómo vas y si necesitas apoyo con las lecturas, clases o evaluaciones pendientes.`,
    },
    {
      id: 'at_risk_cutoff',
      label: '📅 Aviso de corte académico',
      text: `Hola ${firstName}, te recordamos que estamos próximos al corte de evaluación del diplomado y cuentas con actividades vencidas (${reasonsSummary}). Por favor ingresa a tu Portal del Alumno para completarlas a la brevedad.`,
    },
  ];
}

/**
 * Generates contextual quick message templates for Waitlist / Unaccepted applicants
 */
export function buildWaitlistMessageTemplates(
  studentName: string,
  options?: {
    courseTitle?: string | null;
    isProfilePending?: boolean;
    isRejected?: boolean;
  }
): QuickMessageTemplate[] {
  const firstName = (studentName || 'Dr(a).').trim();
  const courseLabel = options?.courseTitle || 'el curso de ElectroDx';

  if (options?.isRejected) {
    return [
      {
        id: 'waitlist_rejected_info',
        label: '📋 Explicar motivo / requisitos faltantes',
        text: `Hola ${firstName}, respecto a tu solicitud de admisión a ${courseLabel}, necesitamos validar algunos datos de tu expediente antes de poder activar tu acceso. ¿Podrías confirmarnos tu información por este medio?`,
      },
      {
        id: 'waitlist_reopen',
        label: '🔄 Invitar a actualizar datos',
        text: `Hola ${firstName}, si ya cuentas con tu comprobante o los datos solicitados para ${courseLabel}, escríbenos por este chat directo para revisar nuevamente tu admisión.`,
      },
    ];
  }

  return [
    {
      id: 'waitlist_payment',
      label: '💳 Solicitar referencia o comprobante',
      text: `Hola ${firstName}, recibimos tu solicitud de ingreso a ${courseLabel}. Para aprobar y activar tu acceso de inmediato, ¿podrías compartirnos por este chat tu folio/referencia de pago o código de beca?`,
    },
    {
      id: 'waitlist_cedula',
      label: '🪪 Confirmar Cédula Profesional / Sede',
      text: `Hola ${firstName}, estamos revisando tu solicitud en la lista de espera de ${courseLabel}. ¿Podrías confirmarnos por aquí tu número de Cédula Profesional o tu hospital sede de residencia para completar tu validación?`,
    },
    {
      id: 'waitlist_welcome_soon',
      label: '⏳ Confirmar recepción en revisión',
      text: `Hola ${firstName}, te confirmamos que tu solicitud para ${courseLabel} ya está en revisión por la Dirección Académica. Si tienes cualquier duda mientras activamos tu cuenta, puedes escribirnos directamente en este chat.`,
    },
  ];
}

/**
 * Generates general templates for active students
 */
export function buildGeneralStudentTemplates(studentName: string): QuickMessageTemplate[] {
  const firstName = (studentName || 'Dr(a).').trim();
  return [
    {
      id: 'general_check',
      label: '👋 Seguimiento académico',
      text: `Hola ${firstName}, te escribo de la coordinación académica de ElectroDx para saber cómo vas con los módulos del curso y si tienes alguna duda clínica o técnica.`,
    },
    {
      id: 'general_feedback',
      label: '📝 Aviso sobre entrega / examen',
      text: `Hola ${firstName}, revisamos tu actividad reciente en la plataforma y queríamos dejarte un comentario directo por aquí. Quedamos atentos a tus dudas.`,
    },
  ];
}

/**
 * Generates quick templates for the Student / Unaccepted Applicant on the waiting screen
 */
export function buildStudentApplicantTemplates(courseTitle?: string | null): QuickMessageTemplate[] {
  const label = courseTitle ? `al curso ${courseTitle}` : 'al programa formativo';
  return [
    {
      id: 'student_waitlist_status',
      label: '⏳ Consultar estado de mi aprobación',
      text: `Hola Profesor, completé mi registro para ingresar ${label} y me encuentro en la pantalla de espera de aprobación. Quedo atento(a) por si requieren algún dato adicional de mi expediente.`,
    },
    {
      id: 'student_waitlist_payment',
      label: '💳 Informar pago o referencia',
      text: `Hola Profesor, ya realicé mi pago / transferencia para la inscripción ${label}. Mi referencia o detalle de comprobante es: `,
    },
    {
      id: 'student_waitlist_scholarship',
      label: '🎟️ Consulta sobre beca / residente',
      text: `Hola Profesor, soy médico residente y solicité admisión ${label}. ¿Me podrían orientar con la activación de mi acceso o convenio de beca?`,
    },
  ];
}

/**
 * Loads the complete 1:1 private chat conversation for a student
 */
export async function loadDirectChatConversation(
  studentId: string,
  options?: {
    studentDisplayName?: string;
    studentAvatarUrl?: string | null;
  }
): Promise<DirectChatConversation> {
  if (!isSupabaseConfigured || !studentId) {
    return {
      threadId: null,
      studentId,
      contextTag: 'general',
      status: 'answered',
      messages: [],
      needsTeacherReply: false,
      unreadForStudent: false,
    };
  }

  const [threadsRes, staffDir] = await Promise.all([
    supabase
      .from('student_qa_threads')
      .select('*')
      .eq('student_id', studentId)
      .eq('module_id', DIRECT_CHAT_MODULE_ID)
      .order('created_at', { ascending: true }),
    resolveStaffDirectory(),
  ]);

  if (threadsRes.error) {
    throw new Error(threadsRes.error.message);
  }

  const threads = threadsRes.data ?? [];
  if (threads.length === 0) {
    return {
      threadId: null,
      studentId,
      contextTag: 'general',
      status: 'answered',
      messages: [],
      needsTeacherReply: false,
      unreadForStudent: false,
    };
  }

  const primaryThread = threads[threads.length - 1];
  const threadIds = threads.map((t) => t.id);

  const { data: repliesData, error: repliesError } = await supabase
    .from('student_qa_replies')
    .select('*')
    .in('thread_id', threadIds)
    .order('created_at', { ascending: true });

  if (repliesError) {
    throw new Error(repliesError.message);
  }

  const replies = repliesData ?? [];
  const studentLabel = options?.studentDisplayName?.trim() || 'Médico';

  const messages: DirectChatMessage[] = replies.map((r) => {
    const isFromStaff = r.author_id !== studentId;
    const staffInfo = isFromStaff ? staffDir.get(r.author_id) : undefined;
    return {
      id: r.id,
      threadId: r.thread_id,
      authorId: r.author_id,
      authorName: isFromStaff
        ? staffInfo?.displayName || 'Dirección Académica · Profesor'
        : studentLabel,
      authorAvatarUrl: isFromStaff ? staffInfo?.avatarUrl ?? null : options?.studentAvatarUrl ?? null,
      isFromStaff,
      body: r.body,
      createdAt: r.created_at,
    };
  });

  // Fallback if a thread was created with a non-placeholder body and 0 replies
  if (
    messages.length === 0 &&
    primaryThread.body &&
    primaryThread.body.trim() !== '' &&
    primaryThread.body.trim() !== DIRECT_CHAT_PLACEHOLDER_BODY
  ) {
    const isFromStaff = primaryThread.status === 'answered';
    messages.push({
      id: primaryThread.id,
      threadId: primaryThread.id,
      authorId: isFromStaff ? 'staff' : studentId,
      authorName: isFromStaff ? 'Dirección Académica · Profesor' : studentLabel,
      authorAvatarUrl: null,
      isFromStaff,
      body: primaryThread.body,
      createdAt: primaryThread.created_at,
    });
  }

  const lastMsg = messages[messages.length - 1];
  const lastSenderIsStaff = lastMsg ? lastMsg.isFromStaff : primaryThread.status === 'answered';
  const needsTeacherReply = Boolean(messages.length > 0 && !lastSenderIsStaff && primaryThread.status === 'open');

  const localReadAt = getLocalDirectChatReadAt(studentId);
  const lastStaffMsgTime = lastMsg && lastMsg.isFromStaff ? new Date(lastMsg.createdAt).getTime() : 0;
  const unreadForStudent = Boolean(lastStaffMsgTime > 0 && lastStaffMsgTime > localReadAt);

  return {
    threadId: primaryThread.id,
    studentId,
    contextTag: normalizeContextTag(primaryThread.topic_id),
    status: primaryThread.status,
    messages,
    needsTeacherReply,
    unreadForStudent,
  };
}

/**
 * Gets or creates the primary 1:1 direct chat thread container for a student
 */
export async function getOrCreateDirectChatThread(
  studentId: string,
  options?: {
    contextTag?: DirectChatContextTag;
    title?: string;
    initialStatus?: 'open' | 'answered';
    previewBody?: string;
  }
): Promise<{ id: string; student_id: string; topic_id: string | null; status: 'open' | 'answered' | 'closed' }> {
  const { data: existing, error: selectErr } = await supabase
    .from('student_qa_threads')
    .select('id, student_id, topic_id, status')
    .eq('student_id', studentId)
    .eq('module_id', DIRECT_CHAT_MODULE_ID)
    .order('created_at', { ascending: false })
    .limit(1);

  if (selectErr) {
    throw new Error(selectErr.message);
  }

  if (existing && existing.length > 0) {
    return existing[0];
  }

  const cleanPreview = options?.previewBody?.trim().slice(0, 240) || DIRECT_CHAT_PLACEHOLDER_BODY;
  const { data: created, error: insertErr } = await (supabase.from('student_qa_threads') as any)
    .insert({
      student_id: studentId,
      module_id: DIRECT_CHAT_MODULE_ID,
      topic_id: options?.contextTag ?? 'general',
      title: options?.title ?? 'Canal directo con Dirección Académica',
      body: cleanPreview,
      visibility: 'private',
      status: options?.initialStatus ?? 'open',
      page_url: '/portal?chat=1',
    })
    .select('id, student_id, topic_id, status')
    .single();

  if (insertErr || !created) {
    throw new Error(insertErr?.message || 'No se pudo iniciar el canal de chat directo.');
  }

  return created;
}

/**
 * Sends a 1:1 direct private message between teacher and student (or applicant)
 */
export async function sendDirectChatMessage(input: {
  studentId: string;
  body: string;
  senderId: string;
  senderName?: string;
  isStaffSender: boolean;
  contextTag?: DirectChatContextTag;
  sendPush?: boolean;
}): Promise<DirectChatMessage> {
  const cleanBody = input.body.trim();
  if (!cleanBody) {
    throw new Error('Escribe un mensaje antes de enviar.');
  }
  if (!input.studentId || !input.senderId) {
    throw new Error('Sesión inválida para enviar el mensaje.');
  }

  const nextStatus: 'open' | 'answered' = input.isStaffSender ? 'answered' : 'open';
  const thread = await getOrCreateDirectChatThread(input.studentId, {
    contextTag: input.contextTag,
    initialStatus: nextStatus,
    previewBody: cleanBody,
  });

  const { data: reply, error: replyErr } = await supabase
    .from('student_qa_replies')
    .insert({
      thread_id: thread.id,
      author_id: input.senderId,
      body: cleanBody,
    })
    .select('*')
    .single();

  if (replyErr || !reply) {
    throw new Error(replyErr?.message || 'No se pudo enviar el mensaje.');
  }

  // Update thread summary & status
  await (supabase.from('student_qa_threads') as any)
    .update({
      body: cleanBody.slice(0, 240),
      status: nextStatus,
      topic_id: input.contextTag ?? thread.topic_id ?? 'general',
      updated_at: new Date().toISOString(),
    })
    .eq('id', thread.id);

  if (input.isStaffSender) {
    const teacherLabel = input.senderName?.trim() || 'Dirección Académica';
    // Ensure in-app notification is created even if DB trigger migration hasn't been executed yet
    try {
      await (supabase.from('student_notifications') as any).upsert(
        {
          user_id: input.studentId,
          title: `💬 Mensaje de ${teacherLabel}`,
          message: cleanBody.slice(0, 180),
          type: 'direct_message',
          severity: input.contextTag === 'at_risk' ? 'warning' : 'info',
          link_url: '/portal?chat=1',
          source_key: `direct_chat:${reply.id}`,
          is_read: false,
          action_required: true,
        },
        { onConflict: 'user_id,source_key' }
      );
    } catch {
      // Trigger or RLS may handle this; ignore duplicate warning
    }

    if (input.sendPush !== false) {
      void sendAcademicPush({
        title: `💬 Mensaje directo de ${teacherLabel}`,
        body: cleanBody.slice(0, 160),
        userId: input.studentId,
        url: '/portal?chat=1',
        tag: `direct-chat-${input.studentId}`,
      }).catch(() => {
        // Non-blocking if push is not configured on device
      });
    }
  } else {
    // Student sent a message -> mark their own local read timestamp up to date
    setLocalDirectChatReadAt(input.studentId, Date.now() + 1000);
  }

  emitDirectChatUpdated();
  emitStudentNotificationsUpdated();

  return {
    id: reply.id,
    threadId: reply.thread_id,
    authorId: reply.author_id,
    authorName: input.senderName?.trim() || (input.isStaffSender ? 'Dirección Académica' : 'Tú'),
    authorAvatarUrl: null,
    isFromStaff: input.isStaffSender,
    body: reply.body,
    createdAt: reply.created_at,
  };
}

/**
 * Sends individualized 1:1 private chat messages to multiple students at once (e.g. Alumnos en riesgo)
 */
export async function sendBatchDirectChatMessages(input: {
  recipients: Array<{
    studentId: string;
    studentName: string;
    customBody: string;
  }>;
  senderId: string;
  senderName?: string;
  contextTag?: DirectChatContextTag;
  sendPush?: boolean;
}): Promise<{ sentCount: number; failedCount: number }> {
  let sentCount = 0;
  let failedCount = 0;

  for (const rec of input.recipients) {
    try {
      await sendDirectChatMessage({
        studentId: rec.studentId,
        body: rec.customBody,
        senderId: input.senderId,
        senderName: input.senderName,
        isStaffSender: true,
        contextTag: input.contextTag ?? 'at_risk',
        sendPush: input.sendPush,
      });
      sentCount += 1;
    } catch (err) {
      console.warn(`[sendBatchDirectChatMessages] Failed for ${rec.studentId}:`, err);
      failedCount += 1;
    }
  }

  emitDirectChatUpdated();
  return { sentCount, failedCount };
}

/**
 * Lists summaries of all direct chat threads for the teacher / admin views
 */
export async function listAllDirectChatSummaries(): Promise<Map<string, DirectChatThreadSummary>> {
  const map = new Map<string, DirectChatThreadSummary>();
  if (!isSupabaseConfigured) return map;

  const { data: threads, error: threadsErr } = await supabase
    .from('student_qa_threads')
    .select('*')
    .eq('module_id', DIRECT_CHAT_MODULE_ID)
    .order('created_at', { ascending: true });

  if (threadsErr || !threads || threads.length === 0) {
    return map;
  }

  const threadIds = threads.map((t) => t.id);
  const { data: replies } = await supabase
    .from('student_qa_replies')
    .select('*')
    .in('thread_id', threadIds)
    .order('created_at', { ascending: true });

  const repliesByThread = new Map<string, Array<{ id: string; author_id: string; body: string; created_at: string }>>();
  for (const r of replies ?? []) {
    const arr = repliesByThread.get(r.thread_id) ?? [];
    arr.push(r);
    repliesByThread.set(r.thread_id, arr);
  }

  for (const t of threads) {
    const threadReplies = repliesByThread.get(t.id) ?? [];
    const lastReply = threadReplies[threadReplies.length - 1];
    const prevSummary = map.get(t.student_id);

    const lastMessageBody =
      lastReply?.body ||
      (t.body && t.body !== DIRECT_CHAT_PLACEHOLDER_BODY ? t.body : '');
    const lastMessageAt = lastReply?.created_at || t.created_at;
    const lastSenderIsStaff = lastReply
      ? lastReply.author_id !== t.student_id
      : t.status === 'answered';
    const messageCount = (prevSummary?.messageCount ?? 0) + threadReplies.length;
    const needsTeacherReply = Boolean(
      threadReplies.length > 0 && !lastSenderIsStaff && t.status === 'open'
    );

    if (!lastMessageBody && threadReplies.length === 0) {
      continue;
    }

    map.set(t.student_id, {
      threadId: t.id,
      studentId: t.student_id,
      contextTag: normalizeContextTag(t.topic_id),
      title: t.title,
      lastMessageBody,
      lastMessageAt,
      lastSenderIsStaff,
      status: t.status,
      needsTeacherReply,
      unreadForStudent: lastSenderIsStaff,
      messageCount,
    });
  }

  return map;
}

/**
 * Marks all direct chat messages as read by the student
 */
export async function markDirectChatReadByStudent(studentId: string): Promise<void> {
  if (!studentId) return;
  setLocalDirectChatReadAt(studentId, Date.now() + 1000);

  if (isSupabaseConfigured) {
    try {
      await supabase
        .from('student_notifications')
        .update({ is_read: true })
        .eq('user_id', studentId)
        .eq('type', 'direct_message')
        .eq('is_read', false);
    } catch {
      // Ignore notification update errors
    }
  }

  emitDirectChatUpdated();
  emitStudentNotificationsUpdated();
}

/**
 * Marks a student's direct chat thread as answered/handled by the teacher
 */
export async function markDirectChatResolvedByTeacher(
  threadId: string,
  staffUserId?: string
): Promise<void> {
  if (!isSupabaseConfigured || !threadId) return;

  await supabase
    .from('student_qa_threads')
    .update({
      status: 'answered',
      updated_at: new Date().toISOString(),
    })
    .eq('id', threadId);

  if (staffUserId) {
    try {
      await supabase
        .from('student_notifications')
        .update({ is_read: true })
        .eq('user_id', staffUserId)
        .eq('type', 'direct_message')
        .eq('is_read', false);
    } catch {
      // Ignore
    }
  }

  emitDirectChatUpdated();
}

/**
 * Subscribes to Realtime changes on direct chat threads & replies
 */
export function subscribeToDirectChat(
  studentId: string | null,
  onUpdate: () => void
): () => void {
  if (!isSupabaseConfigured) return () => {};

  const channelName = `direct-chat-${studentId || 'all'}-${Math.random().toString(36).slice(2, 7)}`;
  const channel = supabase
    .channel(channelName)
    .on(
      'postgres_changes',
      studentId
        ? {
            event: '*',
            schema: 'public',
            table: 'student_qa_threads',
            filter: `student_id=eq.${studentId}`,
          }
        : {
            event: '*',
            schema: 'public',
            table: 'student_qa_threads',
          },
      () => onUpdate()
    )
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'student_qa_replies',
      },
      () => onUpdate()
    )
    .subscribe();

  return () => {
    void supabase.removeChannel(channel);
  };
}
