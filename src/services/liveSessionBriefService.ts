import { supabase } from '../lib/supabase';
import { foldSessionBriefRows, type SessionBrief, type SessionBriefRow } from '../utils/liveSessionBrief';

export async function fetchSessionBriefs(workshopIds: string[]): Promise<Map<string, SessionBrief>> {
  const ids = [...new Set(workshopIds.filter(Boolean))].slice(0, 200);
  if (!ids.length) return new Map();
  const { data, error } = await supabase.rpc('get_published_session_briefs', {
    p_workshop_ids: ids,
  });
  if (error || !data) {
    if (error) console.warn('[fetchSessionBriefs]', error.message);
    return new Map();
  }
  return foldSessionBriefRows(data as SessionBriefRow[]);
}
