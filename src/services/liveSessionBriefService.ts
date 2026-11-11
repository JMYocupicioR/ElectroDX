import { supabase } from '../lib/supabase';
import { foldSessionBriefRows, type SessionBrief, type SessionBriefRow } from '../utils/liveSessionBrief';
import { extractValidUuid } from '../utils/uuidUtils';

export async function fetchSessionBriefs(workshopIds: string[]): Promise<Map<string, SessionBrief>> {
  // Extrae y valida estrictamente UUIDs para blindar el RPC contra errores 22P02 de Postgres
  const validIds = [
    ...new Set(
      workshopIds
        .map((id) => extractValidUuid(id))
        .filter((id): id is string => Boolean(id))
    ),
  ].slice(0, 200);

  if (!validIds.length) return new Map();

  const { data, error } = await supabase.rpc('get_published_session_briefs', {
    p_workshop_ids: validIds,
  });
  if (error || !data) {
    if (error) console.warn('[fetchSessionBriefs]', error.message);
    return new Map();
  }
  return foldSessionBriefRows(data as SessionBriefRow[]);
}
