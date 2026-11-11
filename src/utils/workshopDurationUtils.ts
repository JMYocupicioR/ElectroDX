import type { LiveWorkshop } from '../types/database';

export interface WorkshopDurationInfo {
  minutes: number;
  seconds?: number;
  display: string;
  isReal: boolean;
}

/**
 * Formatea una duración en segundos o minutos a una representación clara para badges:
 * - Menos de 1 hora: ej. "32 min", "12 min"
 * - 1 hora o más: ej. "1h 39m", "1h 30m"
 */
export function formatVideoDuration(
  seconds?: number | null,
  fallbackMinutes?: number | null
): string {
  if (typeof seconds === 'number' && seconds > 0) {
    const totalSec = Math.round(seconds);
    const totalMinutes = Math.round(totalSec / 60);
    const hrs = Math.floor(totalMinutes / 60);
    const mins = totalMinutes % 60;

    if (hrs > 0) {
      return `${hrs}h${mins > 0 ? ` ${mins}m` : ''}`;
    }
    const roundedMins = Math.max(1, totalMinutes);
    return `${roundedMins} min`;
  }

  if (typeof fallbackMinutes === 'number' && fallbackMinutes > 0) {
    const hrs = Math.floor(fallbackMinutes / 60);
    const mins = Math.round(fallbackMinutes % 60);
    if (hrs > 0) {
      return `${hrs}h${mins > 0 ? ` ${mins}m` : ''}`;
    }
    return `${fallbackMinutes} min`;
  }

  return 'Clase';
}

/**
 * Obtiene la duración real de un taller grabado basándose en metadatos reales guardados
 * (actual_duration_seconds o actual_duration_minutes en clinical_case_json),
 * o usa la duración estimada programada como respaldo.
 */
export function getWorkshopDurationInfo(
  workshop?: Partial<LiveWorkshop> | null
): WorkshopDurationInfo {
  if (!workshop) {
    return {
      minutes: 90,
      display: '90 min',
      isReal: false,
    };
  }

  const meta = (workshop.clinical_case_json || {}) as Record<string, unknown>;

  const actualSeconds =
    typeof meta.actual_duration_seconds === 'number' && meta.actual_duration_seconds > 0
      ? meta.actual_duration_seconds
      : typeof meta.real_duration_seconds === 'number' && meta.real_duration_seconds > 0
      ? meta.real_duration_seconds
      : undefined;

  const actualMinutes =
    typeof meta.actual_duration_minutes === 'number' && meta.actual_duration_minutes > 0
      ? meta.actual_duration_minutes
      : actualSeconds
      ? Math.max(1, Math.round(actualSeconds / 60))
      : undefined;

  if (actualSeconds || actualMinutes) {
    const mins = actualMinutes ?? Math.round((actualSeconds ?? 0) / 60);
    return {
      minutes: mins,
      seconds: actualSeconds,
      display: formatVideoDuration(actualSeconds, mins),
      isReal: true,
    };
  }

  const fallbackMins = workshop.duration_minutes || 90;
  return {
    minutes: fallbackMins,
    display: formatVideoDuration(undefined, fallbackMins),
    isReal: false,
  };
}
