import { describe, it, expect } from 'vitest';
import {
  mergeWatchedIntervals,
  calculateWatchedCoverage,
  formatVideoTime,
  type TimeInterval,
} from './videoProgressTracker';

describe('videoProgressTracker', () => {
  describe('mergeWatchedIntervals', () => {
    it('agrega un nuevo segmento a una lista vacía', () => {
      const result = mergeWatchedIntervals([], [0, 10]);
      expect(result).toEqual([[0, 10]]);
    });

    it('fusiona segmentos continuos y superpuestos', () => {
      let intervals: TimeInterval[] = [[0, 10]];
      intervals = mergeWatchedIntervals(intervals, [8, 20]);
      expect(intervals).toEqual([[0, 20]]);

      // Con pequeña tolerancia de 1 segundo (ej. [20.5, 30])
      intervals = mergeWatchedIntervals(intervals, [20.8, 30]);
      expect(intervals).toEqual([[0, 30]]);
    });

    it('mantiene segmentos disjuntos separados cuando el usuario salta (seek)', () => {
      let intervals: TimeInterval[] = [[0, 30]];
      intervals = mergeWatchedIntervals(intervals, [300, 330]);
      expect(intervals).toEqual([[0, 30], [300, 330]]);
    });

    it('rellena huecos intermedios correctamente', () => {
      const intervals: TimeInterval[] = [[0, 10], [50, 60]];
      const updated = mergeWatchedIntervals(intervals, [10, 52]);
      expect(updated).toEqual([[0, 60]]);
    });

    it('ignora segmentos invertidos o vacíos', () => {
      const intervals: TimeInterval[] = [[0, 10]];
      expect(mergeWatchedIntervals(intervals, [10, 10])).toEqual([[0, 10]]);
      expect(mergeWatchedIntervals(intervals, [15, 10])).toEqual([[0, 10]]);
    });
  });

  describe('calculateWatchedCoverage', () => {
    it('calcula el porcentaje exacto según intervalos acumulados', () => {
      const duration = 100;
      const intervals: TimeInterval[] = [[0, 20], [50, 70]]; // 40s total
      expect(calculateWatchedCoverage(intervals, duration)).toBe(40);
    });

    it('tope en 100%', () => {
      const duration = 50;
      const intervals: TimeInterval[] = [[0, 60]];
      expect(calculateWatchedCoverage(intervals, duration)).toBe(100);
    });

    it('maneja duración 0 sin división por cero', () => {
      expect(calculateWatchedCoverage([[0, 10]], 0)).toBe(0);
    });
  });

  describe('formatVideoTime', () => {
    it('formatea minutos y segundos', () => {
      expect(formatVideoTime(0)).toBe('00:00');
      expect(formatVideoTime(65)).toBe('01:05');
      expect(formatVideoTime(3599)).toBe('59:59');
    });

    it('formatea horas cuando aplica', () => {
      expect(formatVideoTime(3600)).toBe('1:00:00');
      expect(formatVideoTime(3665)).toBe('1:01:05');
    });
  });
});

