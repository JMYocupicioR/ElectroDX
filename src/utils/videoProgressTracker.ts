/**
 * Utilidades matemáticas y lógicas para el tracking anti-trampas de visualización de video.
 *
 * Utiliza fusión de intervalos disjuntos [start, end] para computar el tiempo
 * neto reproducido por el alumno, evitando que saltar hacia adelante compute como visto.
 */

export type TimeInterval = [number, number];

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

  const all = [...intervals, sanitizedNew].sort((a, b) => a[0] - b[0]);
  const merged: TimeInterval[] = [];

  for (const current of all) {
    if (merged.length === 0) {
      merged.push([current[0], current[1]]);
      continue;
    }

    const prev = merged[merged.length - 1];
    // Si se tocan o superponen con 1.5 s de tolerancia
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

