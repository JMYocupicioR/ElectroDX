import { supabase } from '../lib/supabase';
import type { ModuleAccess, LiveWorkshop, WorkshopRegistration, AccessTier } from '../types/database';

// ─── Module Access ──────────────────────────────────────────────────────────

export async function getModuleAccessMap(): Promise<Map<string, ModuleAccess>> {
  const { data, error } = await supabase
    .from('module_access')
    .select('*');
  if (error) throw error;
  const map = new Map<string, ModuleAccess>();
  for (const row of (data ?? []) as ModuleAccess[]) {
    map.set(row.module_id, row);
  }
  return map;
}

export async function setModuleAccess(
  moduleId: string,
  tier: AccessTier,
  previewTopicIds: string[] = []
) {
  const { error } = await supabase
    .from('module_access')
    .upsert(
      {
        module_id: moduleId,
        required_tier: tier,
        preview_topic_ids: previewTopicIds,
      },
      { onConflict: 'module_id' }
    );
  if (error) throw error;
}

// ─── Live Workshops ─────────────────────────────────────────────────────────

export async function getWorkshops(options?: {
  moduleId?: string;
  status?: string[];
  limit?: number;
}): Promise<LiveWorkshop[]> {
  let query = supabase
    .from('live_workshops')
    .select('*')
    .order('scheduled_at', { ascending: false });

  if (options?.moduleId) {
    query = query.eq('module_id', options.moduleId);
  }
  if (options?.status?.length) {
    query = query.in('status', options.status);
  }
  if (options?.limit) {
    query = query.limit(options.limit);
  }

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as LiveWorkshop[];
}

export async function getUpcomingWorkshops(limit = 5): Promise<LiveWorkshop[]> {
  const { data, error } = await supabase
    .from('live_workshops')
    .select('*')
    .in('status', ['scheduled', 'live'])
    .gte('scheduled_at', new Date().toISOString())
    .order('scheduled_at', { ascending: true })
    .limit(limit);
  if (error) throw error;
  return (data ?? []) as LiveWorkshop[];
}

export async function getWorkshopById(id: string): Promise<LiveWorkshop | null> {
  const { data, error } = await supabase
    .from('live_workshops')
    .select('*')
    .eq('id', id)
    .maybeSingle();
  if (error) throw error;
  return (data as LiveWorkshop | null) ?? null;
}

export async function createWorkshop(
  workshop: Omit<LiveWorkshop, 'id' | 'created_at' | 'updated_at'>
): Promise<LiveWorkshop> {
  const { data, error } = await supabase
    .from('live_workshops')
    .insert(workshop as any)
    .select('*')
    .single();
  if (error) throw error;
  return data as LiveWorkshop;
}

export async function updateWorkshop(
  id: string,
  updates: Partial<LiveWorkshop>
): Promise<LiveWorkshop> {
  const { data, error } = await supabase
    .from('live_workshops')
    .update(updates as any)
    .eq('id', id)
    .select('*')
    .single();
  if (error) throw error;
  return data as LiveWorkshop;
}

// ─── Workshop Registrations ─────────────────────────────────────────────────

export async function registerForWorkshop(workshopId: string, userId: string) {
  const { error } = await supabase
    .from('workshop_registrations')
    .insert({ workshop_id: workshopId, user_id: userId } as any);
  if (error) throw error;
}

export async function getWorkshopRegistrations(workshopId: string): Promise<WorkshopRegistration[]> {
  const { data, error } = await supabase
    .from('workshop_registrations')
    .select('*')
    .eq('workshop_id', workshopId)
    .order('registered_at');
  if (error) throw error;
  return (data ?? []) as WorkshopRegistration[];
}

export async function getMyRegistrations(userId: string): Promise<WorkshopRegistration[]> {
  const { data, error } = await supabase
    .from('workshop_registrations')
    .select('*')
    .eq('user_id', userId)
    .order('registered_at', { ascending: false });
  if (error) throw error;
  return (data ?? []) as WorkshopRegistration[];
}

export async function markAttendance(workshopId: string, userId: string, attended: boolean) {
  const { error } = await supabase
    .from('workshop_registrations')
    .update({ attended })
    .eq('workshop_id', workshopId)
    .eq('user_id', userId);
  if (error) throw error;
}
