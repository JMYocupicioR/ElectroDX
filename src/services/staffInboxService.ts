import { supabase } from '../lib/supabase';
import {
  rankStaffInboxItem,
  sortStaffInboxItems,
  type RankedStaffInboxItem,
  type StaffInboxKind,
  type StaffInboxRow,
} from '../utils/staffInboxRank';

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

export async function listStaffInbox(nowMs = Date.now()): Promise<RankedStaffInboxItem[]> {
  const { data, error } = await supabase.rpc('list_staff_inbox');
  if (error) throw new Error(error.message);
  const rows = (data ?? [])
    .map((item) => mapRow(item as Record<string, unknown>))
    .filter((item): item is StaffInboxRow => item !== null)
    .map((item) => rankStaffInboxItem(item, nowMs));
  return sortStaffInboxItems(rows);
}
