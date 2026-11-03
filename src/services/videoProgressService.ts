import { supabase } from '../lib/supabase';
import type { WorkshopVideoProgress } from '../types/database';
import type { TimeInterval } from '../utils/videoProgressTracker';
import { calculateWatchedCoverage } from '../utils/videoProgressTracker';

const LOCAL_STORAGE_PROGRESS_PREFIX = 'neurosafe_ws_progress_';

export interface HeartbeatResult {
  watched_percentage: number;
  is_fully_watched: boolean;
  min_required: number;
  accredited: boolean;
}

/**
 * Obtiene el registro de progreso del alumno para un taller específico.
 */
export async function getWorkshopVideoProgress(
  workshopId: string,
  userId: string
): Promise<WorkshopVideoProgress | null> {
  if (!workshopId || !userId) return null;

  try {
    const { data, error } = await (supabase as any)
      .from('workshop_video_progress')
      .select('*')
      .eq('workshop_id', workshopId)
      .eq('user_id', userId)
      .maybeSingle();

    if (!error && data) {
      return data as WorkshopVideoProgress;
    }
  } catch (err) {
    console.warn('[videoProgressService] Error fetching progress from Supabase:', err);
  }

  // Fallback cache local si hubo error de red o la tabla aún se está sincronizando
  try {
    const key = `${LOCAL_STORAGE_PROGRESS_PREFIX}${userId}_${workshopId}`;
    const cached = localStorage.getItem(key);
    if (cached) {
      return JSON.parse(cached) as WorkshopVideoProgress;
    }
  } catch {
    // Ignore cache parse error
  }

  return null;
}

/**
 * Envía el latido (heartbeat) de progreso del alumno al servidor.
 * La RPC de Supabase valida los intervalos y acredita asistencia automáticamente.
 */
export async function logVideoWatchHeartbeat(params: {
  workshopId: string;
  userId: string;
  currentTime: number;
  duration: number;
  segments: TimeInterval[];
  minWatchPercent?: number;
}): Promise<HeartbeatResult> {
  const { workshopId, userId, currentTime, duration, segments, minWatchPercent = 85 } = params;

  const localCoverage = calculateWatchedCoverage(segments, duration);
  const localIsFullyWatched = localCoverage >= minWatchPercent;

  // 1. Guardar en caché local inmediatamente
  try {
    const localProgress: Partial<WorkshopVideoProgress> = {
      user_id: userId,
      workshop_id: workshopId,
      watched_percentage: localCoverage,
      last_position_seconds: currentTime,
      total_duration_seconds: duration,
      watched_segments: segments,
      is_fully_watched: localIsFullyWatched,
      updated_at: new Date().toISOString(),
    };
    localStorage.setItem(
      `${LOCAL_STORAGE_PROGRESS_PREFIX}${userId}_${workshopId}`,
      JSON.stringify(localProgress)
    );
  } catch {
    // Ignore storage quota error
  }

  // 2. Enviar a RPC de Supabase
  try {
    const { data, error } = await (supabase as any).rpc('log_video_watch_heartbeat', {
      p_workshop_id: workshopId,
      p_current_time: Math.round(currentTime * 10) / 10,
      p_duration: Math.round(duration * 10) / 10,
      p_new_segments: segments,
    });

    if (error) {
      console.warn('[videoProgressService] RPC error, using local fallback:', error.message);
      return {
        watched_percentage: localCoverage,
        is_fully_watched: localIsFullyWatched,
        min_required: minWatchPercent,
        accredited: false,
      };
    }

    if (data && typeof data === 'object') {
      const d = data as Record<string, any>;
      return {
        watched_percentage: Number(d.watched_percentage ?? localCoverage),
        is_fully_watched: Boolean(d.is_fully_watched ?? localIsFullyWatched),
        min_required: Number(d.min_required ?? minWatchPercent),
        accredited: Boolean(d.accredited ?? false),
      };
    }
  } catch (err) {
    console.warn('[videoProgressService] Network error during heartbeat:', err);
  }

  return {
    watched_percentage: localCoverage,
    is_fully_watched: localIsFullyWatched,
    min_required: minWatchPercent,
    accredited: false,
  };
}
