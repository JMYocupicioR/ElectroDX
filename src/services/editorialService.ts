import { supabase } from '../lib/supabase';
import type {
  AppRole,
  ContentRevision,
  Profile,
  PublishedModule,
  PublishedTopic,
  RevisionAction,
  RevisionPayload,
  RevisionStatus,
} from '../types/database';

export async function getPublicProfiles(): Promise<Profile[]> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('is_public', true)
    .not('verified_at', 'is', null)
    .order('display_name');
  if (error) throw error;
  return (data ?? []) as Profile[];
}

export async function getProfileById(id: string): Promise<Profile | null> {
  const { data, error } = await supabase.from('profiles').select('*').eq('id', id).maybeSingle();
  if (error) throw error;
  return (data as Profile | null) ?? null;
}

export async function getPendingProfiles(): Promise<Profile[]> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .is('verified_at', null)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []) as Profile[];
}

export async function getAdminProfiles(
  pendingOnly = false,
  enrollmentFilter?: 'enrollment_pending' | 'enrolled' | 'contributor_pending' | 'contributors'
) {
  const { data, error } = await supabase.rpc('admin_list_profiles', {
    pending_only: pendingOnly,
    enrollment_filter: enrollmentFilter ?? null,
  });
  if (error) throw error;
  return (data ?? []) as import('../types/admin').AdminProfileRow[];
}

export async function getAdminStats() {
  const { data, error } = await supabase.rpc('admin_get_stats');
  if (error) throw error;
  return data as import('../types/admin').AdminStats;
}

export async function getAdminQuizAttempts(limit = 100) {
  const { data, error } = await supabase.rpc('admin_list_quiz_attempts', { p_limit: limit });
  if (error) throw error;
  return (data ?? []) as import('../types/admin').AdminQuizAttemptRow[];
}

export async function revokeContributor(userId: string) {
  const { error } = await supabase.rpc('revoke_contributor', { target_user_id: userId });
  if (error) throw error;
}

export async function grantPremiumAccess(
  userId: string,
  method = 'manual',
  reference?: string,
  notes?: string,
  expiresAt?: string
) {
  const { error } = await supabase.rpc('grant_premium_access', {
    target_user_id: userId,
    p_method: method,
    p_reference: reference ?? null,
    p_notes: notes ?? null,
    p_expires_at: expiresAt ?? null,
  });
  if (error) throw error;
}

export async function revokePremiumAccess(userId: string) {
  const { error } = await supabase.rpc('revoke_premium_access', { target_user_id: userId });
  if (error) throw error;
}

export async function getAuditLog(limit = 20) {
  const { data, error } = await supabase
    .from('audit_log')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data ?? []) as import('../types/admin').AuditLogEntry[];
}

export async function getRevisionsByStatus(
  statuses: RevisionStatus[],
  limit = 50
): Promise<ContentRevision[]> {
  const { data, error } = await supabase
    .from('content_revisions')
    .select('*')
    .in('status', statuses)
    .order('updated_at', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data ?? []) as ContentRevision[];
}

export async function getProfilesByIds(ids: string[]): Promise<Map<string, Profile>> {
  if (!ids.length) return new Map();
  const unique = [...new Set(ids)];
  const { data, error } = await supabase.from('profiles').select('*').in('id', unique);
  if (error) throw error;
  const map = new Map<string, Profile>();
  for (const p of (data ?? []) as Profile[]) map.set(p.id, p);
  return map;
}

export async function verifyContributor(userId: string) {
  const { error } = await supabase.rpc('verify_contributor', { target_user_id: userId });
  if (error) throw error;
}

export async function verifyPhysicianEnrollment(userId: string) {
  const { error } = await supabase.rpc('verify_physician_enrollment', { target_user_id: userId });
  if (error) throw error;
}

export async function rejectPhysicianEnrollment(userId: string, notes?: string) {
  const { error } = await supabase.rpc('reject_physician_enrollment', {
    target_user_id: userId,
    notes: notes ?? null,
  });
  if (error) throw error;
}

export async function revokePhysicianEnrollment(userId: string) {
  const { error } = await supabase.rpc('revoke_physician_enrollment', { target_user_id: userId });
  if (error) throw error;
}

export async function getPublishedQuizForTopic(topicId: string) {
  const { data: quiz, error: quizError } = await supabase
    .from('published_quizzes')
    .select('*')
    .eq('topic_id', topicId)
    .maybeSingle();
  if (quizError) throw quizError;
  if (!quiz) return null;

  const { data: questions, error: qError } = await supabase
    .from('quiz_questions')
    .select('*')
    .eq('quiz_id', quiz.id)
    .order('sort_order');
  if (qError) throw qError;

  return { quiz, questions: questions ?? [] };
}

export async function grantRole(userId: string, role: AppRole) {
  const { error } = await supabase.rpc('grant_user_role', {
    target_user_id: userId,
    target_role: role,
  });
  if (error) throw error;
}

export async function getMyRevisions(authorId: string): Promise<ContentRevision[]> {
  const { data, error } = await supabase
    .from('content_revisions')
    .select('*')
    .eq('author_id', authorId)
    .order('updated_at', { ascending: false });
  if (error) throw error;
  return (data ?? []) as ContentRevision[];
}

export async function getPendingRevisions(): Promise<ContentRevision[]> {
  const { data, error } = await supabase
    .from('content_revisions')
    .select('*')
    .eq('status', 'pending_review')
    .order('submitted_at', { ascending: true });
  if (error) throw error;
  return (data ?? []) as ContentRevision[];
}

export async function getRevisionById(id: string): Promise<ContentRevision | null> {
  const { data, error } = await supabase
    .from('content_revisions')
    .select('*')
    .eq('id', id)
    .maybeSingle();
  if (error) throw error;
  return (data as ContentRevision | null) ?? null;
}

export async function saveRevision(input: {
  id?: string;
  targetTopicId?: string | null;
  moduleId: string;
  parentId?: string | null;
  action: RevisionAction;
  payload: RevisionPayload;
  authorId: string;
}): Promise<ContentRevision> {
  const row = {
    target_topic_id: input.targetTopicId ?? null,
    module_id: input.moduleId,
    parent_id: input.parentId ?? null,
    action: input.action,
    payload: input.payload,
    author_id: input.authorId,
    status: 'draft' as RevisionStatus,
  };

  if (input.id) {
    const { data, error } = await supabase
      .from('content_revisions')
      .update({
        payload: input.payload,
        module_id: input.moduleId,
        parent_id: input.parentId ?? null,
        target_topic_id: input.targetTopicId ?? null,
        action: input.action,
      })
      .eq('id', input.id)
      .eq('author_id', input.authorId)
      .select('*')
      .single();
    if (error) throw error;
    return data as ContentRevision;
  }

  const { data, error } = await supabase.from('content_revisions').insert(row).select('*').single();
  if (error) throw error;
  return data as ContentRevision;
}

export async function submitRevision(revisionId: string) {
  const { error } = await supabase.rpc('submit_revision', { revision_id: revisionId });
  if (error) throw error;
}

export async function reviewRevision(
  revisionId: string,
  status: Extract<RevisionStatus, 'approved' | 'rejected' | 'changes_requested'>,
  notes?: string
) {
  const { error } = await supabase.rpc('review_revision', {
    revision_id: revisionId,
    new_status: status,
    notes: notes ?? null,
  });
  if (error) throw error;
}

export async function getPublishedModules(): Promise<PublishedModule[]> {
  const { data, error } = await supabase
    .from('published_modules')
    .select('*')
    .order('sort_order');
  if (error) throw error;
  return (data ?? []) as PublishedModule[];
}

export async function getPublishedModule(id: string): Promise<PublishedModule | null> {
  const { data, error } = await supabase
    .from('published_modules')
    .select('*')
    .eq('id', id)
    .maybeSingle();
  if (error) throw error;
  return (data as PublishedModule | null) ?? null;
}

export async function getPublishedTopicsByModule(moduleId: string): Promise<PublishedTopic[]> {
  const { data, error } = await supabase
    .from('published_topics')
    .select('*')
    .eq('module_id', moduleId)
    .order('sort_order');
  if (error) throw error;
  return (data ?? []) as PublishedTopic[];
}

export async function getPublishedTopic(id: string): Promise<PublishedTopic | null> {
  const { data, error } = await supabase
    .from('published_topics')
    .select('*')
    .eq('id', id)
    .maybeSingle();
  if (error) throw error;
  return (data as PublishedTopic | null) ?? null;
}
