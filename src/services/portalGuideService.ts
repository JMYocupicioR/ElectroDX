import { supabase } from '../lib/supabase';
import type { Profile } from '../types/database';

export const PORTAL_GUIDE_VERSION = 1;

export function shouldShowPortalGuide(profile: Profile | null | undefined): boolean {
  const version = profile?.portal_guide_version ?? 0;
  return version < PORTAL_GUIDE_VERSION;
}

export async function markPortalGuideSeen(): Promise<{ error: string | null }> {
  try {
    const { error } = await (supabase as any).rpc('mark_portal_guide_seen', {
      p_version: PORTAL_GUIDE_VERSION,
    });
    if (error) {
      return { error: error.message };
    }
    return { error: null };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error al guardar la guía del portal';
    return { error: message };
  }
}
