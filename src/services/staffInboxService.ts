import { supabase } from '../lib/supabase';
import {
  rankStaffInboxItem,
  sortStaffInboxItems,
  type RankedStaffInboxItem,
  type StaffInboxKind,
  type StaffInboxRow,
} from '../utils/staffInboxRank';
import { DIRECT_CHAT_MODULE_ID, DIRECT_CHAT_PLACEHOLDER_BODY } from './directChatService';

function asKind(value: string): StaffInboxKind | null {
  if (
    value === 'retake' ||
    value === 'submission' ||
    value === 'question' ||
    value === 'admission' ||
    value === 'quiz' ||
    value === 'editorial' ||
    value === 'reply'
  ) {
    return value;
  }
  return null;
}

function mapRow(raw: Record<string, unknown>): StaffInboxRow | null {
  const kind = asKind(String(raw.kind ?? ''));
  const sourceKey = typeof raw.source_key === 'string' ? raw.source_key : '';
  const waitingSince = typeof raw.waiting_since === 'string' ? raw.waiting_since : '';
  if (!kind || !sourceKey || !waitingSince) return null;
  return {
    source_key: sourceKey,
    kind,
    title: typeof raw.title === 'string' ? raw.title : kind,
    message: typeof raw.message === 'string' ? raw.message : '',
    actor_name: typeof raw.actor_name === 'string' ? raw.actor_name : null,
    context_label: typeof raw.context_label === 'string' ? raw.context_label : null,
    link_url: typeof raw.link_url === 'string' ? raw.link_url : '/admin',
    action_required: Boolean(raw.action_required),
    waiting_since: waitingSince,
    due_at: typeof raw.due_at === 'string' ? raw.due_at : null,
    assignment_priority: typeof raw.assignment_priority === 'string' ? raw.assignment_priority : null,
    is_resubmission: Boolean(raw.is_resubmission),
    topic_has_session_soon: Boolean(raw.topic_has_session_soon),
    is_read: Boolean(raw.is_read),
    notification_id: typeof raw.notification_id === 'string' ? raw.notification_id : null,
  };
}

async function fetchOpenDirectChatFallbackRows(): Promise<StaffInboxRow[]> {
  try {
    const { data: openThreads, error } = await supabase
      .from('student_qa_threads')
      .select('id, student_id, topic_id, body, status, created_at')
      .eq('module_id', DIRECT_CHAT_MODULE_ID)
      .eq('status', 'open')
      .order('created_at', { ascending: false })
      .limit(30);

    if (error || !openThreads || openThreads.length === 0) return [];

    const studentIds = [...new Set(openThreads.map((t) => t.student_id))];
    const threadIds = openThreads.map((t) => t.id);

    const [profilesRes, repliesRes] = await Promise.all([
      supabase
        .from('profiles')
        .select('id, display_name, enrollment_status')
        .in('id', studentIds),
      supabase
        .from('student_qa_replies')
        .select('id, thread_id, author_id, body, created_at')
        .in('thread_id', threadIds)
        .order('created_at', { ascending: false }),
    ]);

    const profileMap = new Map<string, { display_name: string | null; enrollment_status: string | null }>();
    for (const p of (profilesRes.data ?? []) as Array<{
      id: string;
      display_name: string | null;
      enrollment_status: string | null;
    }>) {
      profileMap.set(p.id, p);
    }

    const latestReplyByThread = new Map<
      string,
      { id: string; author_id: string; body: string; created_at: string }
    >();
    for (const r of (repliesRes.data ?? []) as Array<{
      id: string;
      thread_id: string;
      author_id: string;
      body: string;
      created_at: string;
    }>) {
      if (!latestReplyByThread.has(r.thread_id)) {
        latestReplyByThread.set(r.thread_id, r);
      }
    }

    const rows: StaffInboxRow[] = [];
    const seenStudents = new Set<string>();

    for (const t of openThreads) {
      if (seenStudents.has(t.student_id)) continue;
      const latestReply = latestReplyByThread.get(t.id);
      if (latestReply && latestReply.author_id !== t.student_id) {
        // Last message was already sent by staff
        continue;
      }
      const messageBody =
        latestReply?.body ||
        (t.body && t.body !== DIRECT_CHAT_PLACEHOLDER_BODY ? t.body : '');
      if (!messageBody) continue;

      seenStudents.add(t.student_id);
      const prof = profileMap.get(t.student_id);
      const isPending = prof?.enrollment_status && prof.enrollment_status !== 'approved';
      const contextLabel = isPending
        ? 'En espera de admisión'
        : t.topic_id === 'at_risk'
        ? 'Alumno en seguimiento'
        : 'Chat directo privado';

      rows.push({
        source_key: `direct_chat:${t.student_id}`,
        kind: 'question',
        title: 'Mensaje privado directo',
        message: messageBody.slice(0, 160),
        actor_name: prof?.display_name || 'Médico / Aspirante',
        context_label: contextLabel,
        link_url: `/admin/mensajes?student=${t.student_id}`,
        action_required: true,
        waiting_since: latestReply?.created_at || t.created_at,
        due_at: null,
        assignment_priority: null,
        is_resubmission: false,
        topic_has_session_soon: false,
        is_read: false,
        notification_id: null,
      });
    }

    return rows;
  } catch {
    return [];
  }
}

export async function listStaffInbox(nowMs = Date.now()): Promise<RankedStaffInboxItem[]> {
  const [{ data, error }, directChatRows] = await Promise.all([
    supabase.rpc('list_staff_inbox'),
    fetchOpenDirectChatFallbackRows(),
  ]);
  if (error) throw new Error(error.message);

  const rpcRows = (data ?? [])
    .map((item) => mapRow(item as Record<string, unknown>))
    .filter((item): item is StaffInboxRow => item !== null);

  const existingKeys = new Set(rpcRows.map((r) => r.source_key));
  for (const dcRow of directChatRows) {
    if (!existingKeys.has(dcRow.source_key)) {
      rpcRows.push(dcRow);
      existingKeys.add(dcRow.source_key);
    }
  }

  const ranked = rpcRows.map((item) => rankStaffInboxItem(item, nowMs));
  return sortStaffInboxItems(ranked);
}
