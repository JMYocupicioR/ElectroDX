/**
 * Utilidades matemáticas y lógicas para el tracking anti-trampas de visualización de video.
 *
 * Utiliza fusión de intervalos disjuntos [start, end] para computar el tiempo
 * neto reproducido por el alumno, evitando que saltar hacia adelante compute como visto.
 */

export type TimeInterval = [number, number];

/** Intervalo rutinario de sync a Supabase mientras reproduce (antes de acreditar). */
export const VIDEO_SYNC_INTERVAL_MS = 20_000;
/** Intervalo más lento tras acreditar asistencia (solo resume / cobertura extra). */
export const VIDEO_SYNC_INTERVAL_AFTER_ACCREDITED_MS = 45_000;
/** Delta mínimo de cobertura (%) para justificar un heartbeat no forzado. */
export const VIDEO_SYNC_MIN_COVERAGE_DELTA = 0.5;
/** Delta mínimo de posición (s) para justificar un heartbeat no forzado. */
export const VIDEO_SYNC_MIN_POSITION_DELTA = 5;

/**
 * Fusiona un nuevo segmento continuo [start, end] con la lista previa de intervalos.
 * Tolera pequeñas discontinuidades de hasta 1.5 segundos (jitter de red / frame drop).
 */
export function mergeWatchedIntervals(
  intervals: TimeInterval[],
  newSegment: TimeInterval
): TimeInterval[] {
  const [newStart, newEnd] = newSegment;
  if (newEnd <= newStart) return intervals;

  const sanitizedNew: TimeInterval = [
    Math.max(0, Math.round(newStart * 10) / 10),
    Math.max(0, Math.round(newEnd * 10) / 10),
  ];

  if (sanitizedNew[1] <= sanitizedNew[0]) return intervals;

  return mergeIntervalLists(intervals, [sanitizedNew]);
}

/**
 * Fusiona dos listas de intervalos en una sola lista disjunta ordenada.
 */
export function mergeIntervalLists(
  a: TimeInterval[],
  b: TimeInterval[]
): TimeInterval[] {
  const all = [...a, ...b]
    .map(([start, end]): TimeInterval => [
      Math.max(0, Math.round(start * 10) / 10),
      Math.max(0, Math.round(end * 10) / 10),
    ])
    .filter(([start, end]) => end > start)
    .sort((x, y) => x[0] - y[0]);

  const merged: TimeInterval[] = [];

  for (const current of all) {
    if (merged.length === 0) {
      merged.push([current[0], current[1]]);
      continue;
    }

    const prev = merged[merged.length - 1];
    if (current[0] <= prev[1] + 1.5) {
      prev[1] = Math.max(prev[1], current[1]);
    } else {
      merged.push([current[0], current[1]]);
    }
  }

  return merged;
}

/**
 * Calcula la cobertura de visualización (porcentaje entre 0 y 100).
 */
export function calculateWatchedCoverage(
  intervals: TimeInterval[],
  totalDurationSeconds: number
): number {
  if (!totalDurationSeconds || totalDurationSeconds <= 0) return 0;

  const totalWatchedSeconds = intervals.reduce((acc, [start, end]) => {
    return acc + Math.max(0, end - start);
  }, 0);

  const percentage = (totalWatchedSeconds / totalDurationSeconds) * 100;
  return Math.min(100, Math.max(0, Math.round(percentage * 10) / 10));
}

/**
 * ¿Vale la pena un heartbeat? Evita writes inútiles a Supabase.
 */
export function hasMeaningfulWatchDelta(params: {
  coverage: number;
  position: number;
  lastCoverage: number;
  lastPosition: number;
  minCoverageDelta?: number;
  minPositionDelta?: number;
}): boolean {
  const {
    coverage,
    position,
    lastCoverage,
    lastPosition,
    minCoverageDelta = VIDEO_SYNC_MIN_COVERAGE_DELTA,
    minPositionDelta = VIDEO_SYNC_MIN_POSITION_DELTA,
  } = params;

  return (
    Math.abs(coverage - lastCoverage) >= minCoverageDelta ||
    Math.abs(position - lastPosition) >= minPositionDelta
  );
}

/**
 * Formatea segundos a mm:ss o hh:mm:ss
 */
export function formatVideoTime(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) return '00:00';
  const total = Math.floor(seconds);
  const hrs = Math.floor(total / 3600);
  const mins = Math.floor((total % 3600) / 60);
  const secs = total % 60;

  const pad = (n: number) => n.toString().padStart(2, '0');

  if (hrs > 0) {
    return `${hrs}:${pad(mins)}:${pad(secs)}`;
  }
  return `${pad(mins)}:${pad(secs)}`;
}

