import { supabase, supabaseAnonKey, supabaseUrl } from '../lib/supabase';
import type { WorkshopVideoProgress } from '../types/database';
import type { TimeInterval } from '../utils/videoProgressTracker';
import { calculateWatchedCoverage } from '../utils/videoProgressTracker';

const LOCAL_STORAGE_PROGRESS_PREFIX = 'neurosafe_ws_progress_';

export interface HeartbeatResult {
  watched_percentage: number;
  is_fully_watched: boolean;
  min_required: number;
  accredited: boolean;
  skipped?: boolean;
}

export type HeartbeatSyncReason =
  | 'periodic'
  | 'pause'
  | 'ended'
  | 'visibility'
  | 'unload'
  | 'threshold'
  | 'manual';

function localProgressKey(userId: string, workshopId: string): string {
  return `${LOCAL_STORAGE_PROGRESS_PREFIX}${userId}_${workshopId}`;
}

function cacheLocalProgress(params: {
  userId: string;
  workshopId: string;
  currentTime: number;
  duration: number;
  segments: TimeInterval[];
  localCoverage: number;
  localIsFullyWatched: boolean;
}): void {
  const {
    userId,
    workshopId,
    currentTime,
    duration,
    segments,
    localCoverage,
    localIsFullyWatched,
  } = params;

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
    localStorage.setItem(localProgressKey(userId, workshopId), JSON.stringify(localProgress));
  } catch {
    // Ignore storage quota error
  }
}

function localFallbackResult(
  localCoverage: number,
  localIsFullyWatched: boolean,
  minWatchPercent: number
): HeartbeatResult {
  return {
    watched_percentage: localCoverage,
    is_fully_watched: localIsFullyWatched,
    min_required: minWatchPercent,
    accredited: false,
  };
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

  try {
    const cached = localStorage.getItem(localProgressKey(userId, workshopId));
    if (cached) {
      return JSON.parse(cached) as WorkshopVideoProgress;
    }
  } catch {
    // Ignore cache parse error
  }

  return null;
}

/** Progreso de grabaciones del alumno (para badges del temario). */
export async function listMyWorkshopVideoProgress(
  userId: string
): Promise<WorkshopVideoProgress[]> {
  if (!userId) return [];

  try {
    const { data, error } = await (supabase as any)
      .from('workshop_video_progress')
      .select('*')
      .eq('user_id', userId);
    if (!error && Array.isArray(data)) {
      return data as WorkshopVideoProgress[];
    }
  } catch (err) {
    console.warn('[videoProgressService] Error listing progress from Supabase:', err);
  }

  const fromCache: WorkshopVideoProgress[] = [];
  try {
    const prefix = `${LOCAL_STORAGE_PROGRESS_PREFIX}${userId}_`;
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key?.startsWith(prefix)) continue;
      const raw = localStorage.getItem(key);
      if (!raw) continue;
      try {
        fromCache.push(JSON.parse(raw) as WorkshopVideoProgress);
      } catch {
        // ignore bad cache row
      }
    }
  } catch {
    // ignore storage errors
  }
  return fromCache;
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

  cacheLocalProgress({
    userId,
    workshopId,
    currentTime,
    duration,
    segments,
    localCoverage,
    localIsFullyWatched,
  });

  try {
    const { data, error } = await (supabase as any).rpc('log_video_watch_heartbeat', {
      p_workshop_id: workshopId,
      p_current_time: Math.round(currentTime * 10) / 10,
      p_duration: Math.round(duration * 10) / 10,
      p_new_segments: segments,
    });

    if (error) {
      console.warn(
        '[videoProgressService] RPC log_video_watch_heartbeat falló; progreso solo local:',
        error.message,
        error
      );
      return localFallbackResult(localCoverage, localIsFullyWatched, minWatchPercent);
    }

    if (data && typeof data === 'object') {
      const d = data as Record<string, any>;
      const accredited = Boolean(d.accredited ?? false);
      if (localIsFullyWatched && !accredited && d.skipped !== true) {
        console.warn(
          '[videoProgressService] Umbral de video alcanzado pero la RPC no acreditó asistencia:',
          d
        );
      }
      return {
        watched_percentage: Number(d.watched_percentage ?? localCoverage),
        is_fully_watched: Boolean(d.is_fully_watched ?? localIsFullyWatched),
        min_required: Number(d.min_required ?? minWatchPercent),
        accredited,
        skipped: Boolean(d.skipped ?? false),
      };
    }
  } catch (err) {
    console.warn('[videoProgressService] Network error during heartbeat:', err);
  }

  return localFallbackResult(localCoverage, localIsFullyWatched, minWatchPercent);
}

/**
 * Heartbeat fire-and-forget con fetch keepalive (pagehide / beforeunload).
 * No depende de que la promesa de supabase-js termine antes de cerrar la pestaña.
 */
/**
 * Auto-declaración de asistencia para grabaciones en Google Drive
 * (Drive no expone API de progreso de reproducción).
 */
export async function attestDriveRecordingAttendance(params: {
  workshopId: string;
  userId: string;
  durationSeconds?: number;
  minWatchPercent?: number;
}): Promise<HeartbeatResult> {
  const { workshopId, userId, durationSeconds = 0, minWatchPercent = 85 } = params;

  cacheLocalProgress({
    userId,
    workshopId,
    currentTime: durationSeconds,
    duration: durationSeconds || 1,
    segments: durationSeconds > 0 ? [[0, durationSeconds]] : [],
    localCoverage: 100,
    localIsFullyWatched: true,
  });

  try {
    const { data, error } = await (supabase as any).rpc('attest_drive_recording_attendance', {
      p_workshop_id: workshopId,
    });

    if (error) {
      console.warn(
        '[videoProgressService] RPC attest_drive_recording_attendance falló:',
        error.message,
        error
      );
      throw new Error(error.message || 'No se pudo acreditar la asistencia');
    }

    if (data && typeof data === 'object') {
      const d = data as Record<string, any>;
      return {
        watched_percentage: Number(d.watched_percentage ?? 100),
        is_fully_watched: Boolean(d.is_fully_watched ?? true),
        min_required: Number(d.min_required ?? minWatchPercent),
        accredited: Boolean(d.accredited ?? false),
        skipped: Boolean(d.skipped ?? false),
      };
    }
  } catch (err) {
    if (err instanceof Error && err.message && !err.message.includes('Network')) {
      throw err;
    }
    console.warn('[videoProgressService] Network error during Drive attest:', err);
    throw new Error('Error de red al acreditar la asistencia');
  }

  return {
    watched_percentage: 100,
    is_fully_watched: true,
    min_required: minWatchPercent,
    accredited: false,
  };
}

export function logVideoWatchHeartbeatKeepalive(params: {
  workshopId: string;
  userId: string;
  currentTime: number;
  duration: number;
  segments: TimeInterval[];
  minWatchPercent?: number;
  accessToken?: string | null;
}): void {
  const {
    workshopId,
    userId,
    currentTime,
    duration,
    segments,
    minWatchPercent = 85,
    accessToken,
  } = params;

  const localCoverage = calculateWatchedCoverage(segments, duration);
  const localIsFullyWatched = localCoverage >= minWatchPercent;

  cacheLocalProgress({
    userId,
    workshopId,
    currentTime,
    duration,
    segments,
    localCoverage,
    localIsFullyWatched,
  });

  if (!supabaseUrl || !supabaseAnonKey || !accessToken || duration <= 0) return;

  try {
    void fetch(`${supabaseUrl}/rest/v1/rpc/log_video_watch_heartbeat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: supabaseAnonKey,
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        p_workshop_id: workshopId,
        p_current_time: Math.round(currentTime * 10) / 10,
        p_duration: Math.round(duration * 10) / 10,
        p_new_segments: segments,
      }),
      keepalive: true,
    });
  } catch (err) {
    console.warn('[videoProgressService] Keepalive heartbeat failed:', err);
  }
}
