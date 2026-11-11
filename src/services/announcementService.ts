import { sb as supabase } from '../lib/supabase';
import { sendAcademicPush } from './studentToolsService';

export type AnnouncementCategory = 'general' | 'taller' | 'evaluacion' | 'aviso' | 'recordatorio';
export type AnnouncementSeverity = 'info' | 'success' | 'warning' | 'urgent';
export type AnnouncementTargetScope = 'all_students' | 'course' | 'workshop' | 'individual' | 'staff';

export interface PublishAnnouncementInput {
  title: string;
  message: string;
  category: AnnouncementCategory;
  severity: AnnouncementSeverity;
  targetScope: AnnouncementTargetScope;
  targetCourseId?: string | null;
  targetWorkshopId?: string | null;
  targetUserId?: string | null;
  actionUrl?: string;
  actionRequired?: boolean;
  sendPush?: boolean;
}

export interface PublishAnnouncementResult {
  announcementId: string;
  recipientsCount: number;
  pushQueued: number;
  pushSent: number;
  pushFailed: number;
  pushError?: string | null;
}

export interface PlatformAnnouncementWithStats {
  id: string;
  title: string;
  message: string;
  category: AnnouncementCategory;
  severity: AnnouncementSeverity;
  target_scope: AnnouncementTargetScope;
  target_course_id: string | null;
  target_workshop_id: string | null;
  workshop_title: string | null;
  target_user_id: string | null;
  target_user_name: string | null;
  action_url: string;
  action_required: boolean;
  send_push: boolean;
  recipients_count: number;
  read_count: number;
  push_sent_count: number;
  push_failed_count: number;
  created_by: string | null;
  author_name: string;
  created_at: string;
}

export interface PushSubscriptionStats {
  total_devices: number;
  unique_users: number;
  student_users: number;
}

export async function publishPlatformAnnouncement(
  input: PublishAnnouncementInput
): Promise<PublishAnnouncementResult> {
  const cleanTitle = input.title.trim();
  const cleanMessage = input.message.trim();
  const cleanUrl = (input.actionUrl ?? '/portal').trim() || '/portal';
  const sendPush = input.sendPush !== false;

  const { data, error } = await supabase.rpc('publish_platform_announcement', {
    p_title: cleanTitle,
    p_message: cleanMessage,
    p_category: input.category,
    p_severity: input.severity,
    p_target_scope: input.targetScope,
    p_target_course_id: input.targetScope === 'course' ? input.targetCourseId ?? null : null,
    p_target_workshop_id: input.targetScope === 'workshop' ? input.targetWorkshopId ?? null : null,
    p_target_user_id: input.targetScope === 'individual' ? input.targetUserId ?? null : null,
    p_action_url: cleanUrl,
    p_action_required: Boolean(input.actionRequired),
    p_send_push: sendPush,
  });

  if (error) {
    throw new Error(error.message || 'No se pudo publicar el anuncio.');
  }

  const rpcResult = (data ?? {}) as {
    announcement_id?: string;
    recipients_count?: number;
    recipient_ids?: string[];
  };

  const announcementId = rpcResult.announcement_id ?? '';
  const recipientsCount = Number(rpcResult.recipients_count ?? 0);
  const recipientIds = Array.isArray(rpcResult.recipient_ids) ? rpcResult.recipient_ids : [];

  let pushQueued = 0;
  let pushSent = 0;
  let pushFailed = 0;
  let pushError: string | null = null;

  if (sendPush && announcementId) {
    try {
      const pushRes = await sendAcademicPush({
        title: cleanTitle,
        body: cleanMessage,
        url: cleanUrl,
        userIds: recipientIds.length > 0 ? recipientIds : undefined,
        announcementId,
        tag: `announcement-${announcementId}`,
      });
      pushQueued = pushRes.queued;
      pushSent = pushRes.sent;
      pushFailed = pushRes.failed;
    } catch (err) {
      pushError = err instanceof Error ? err.message : 'No se pudo despachar Web Push';
      console.warn('[publishPlatformAnnouncement] Web Push warning:', pushError);
    }
  }

  return {
    announcementId,
    recipientsCount,
    pushQueued,
    pushSent,
    pushFailed,
    pushError,
  };
}

export async function listPlatformAnnouncements(
  limit = 50
): Promise<PlatformAnnouncementWithStats[]> {
  const { data, error } = await supabase.rpc('list_platform_announcements_with_stats', {
    p_limit: limit,
  });

  if (error) {
    console.warn('[listPlatformAnnouncements] RPC error, falling back:', error.message);
    const { data: rows, error: tableErr } = await supabase
      .from('platform_announcements')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);
    if (tableErr) throw new Error(tableErr.message);
    return ((rows ?? []) as any[]).map((r) => ({
      ...r,
      workshop_title: null,
      target_user_name: null,
      read_count: 0,
      author_name: 'Dirección Académica',
    }));
  }

  return (data ?? []) as PlatformAnnouncementWithStats[];
}

export async function deletePlatformAnnouncement(announcementId: string): Promise<void> {
  const { error } = await supabase.rpc('delete_platform_announcement', {
    p_announcement_id: announcementId,
  });
  if (error) {
    throw new Error(error.message || 'No se pudo eliminar el anuncio.');
  }
}

export async function resendAnnouncementPush(
  announcement: Pick<
    PlatformAnnouncementWithStats,
    'id' | 'title' | 'message' | 'action_url' | 'target_scope' | 'target_user_id'
  >
): Promise<{ sent: number; failed: number; queued: number }> {
  return sendAcademicPush({
    title: announcement.title,
    body: announcement.message,
    url: announcement.action_url || '/portal',
    userId: announcement.target_scope === 'individual' && announcement.target_user_id ? announcement.target_user_id : undefined,
    announcementId: announcement.id,
    tag: `announcement-${announcement.id}-${Date.now()}`,
  });
}

export async function getPushSubscriptionStats(): Promise<PushSubscriptionStats> {
  const { data, error } = await supabase.rpc('get_push_subscription_stats');
  if (error || !data) {
    return { total_devices: 0, unique_users: 0, student_users: 0 };
  }
  return data as PushSubscriptionStats;
}

