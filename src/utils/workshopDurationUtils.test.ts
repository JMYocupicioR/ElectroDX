import { describe, expect, it } from 'vitest';
import { formatVideoDuration, getWorkshopDurationInfo } from './workshopDurationUtils';
import type { LiveWorkshop } from '../types/database';

describe('workshopDurationUtils', () => {
  describe('formatVideoDuration', () => {
    it('formatea minutos correctamente (< 60 min)', () => {
      expect(formatVideoDuration(1945)).toBe('32 min');
      expect(formatVideoDuration(696)).toBe('12 min');
      expect(formatVideoDuration(1462)).toBe('24 min');
      expect(formatVideoDuration(undefined, 45)).toBe('45 min');
    });

    it('formatea horas y minutos (>= 60 min)', () => {
      expect(formatVideoDuration(5912)).toBe('1h 39m');
      expect(formatVideoDuration(3600)).toBe('1h');
      expect(formatVideoDuration(5400)).toBe('1h 30m');
      expect(formatVideoDuration(undefined, 90)).toBe('1h 30m');
      expect(formatVideoDuration(undefined, 120)).toBe('2h');
    });

    it('retorna valor por defecto para entradas nulas o cero', () => {
      expect(formatVideoDuration(null, null)).toBe('Clase');
      expect(formatVideoDuration(0, 0)).toBe('Clase');
    });
  });

  describe('getWorkshopDurationInfo', () => {
    it('prioriza la duración real guardada en clinical_case_json sobre la estimada', () => {
      const workshop: Partial<LiveWorkshop> = {
        title: 'Control de Temperatura',
        duration_minutes: 90, // programada estimada
        clinical_case_json: {
          actual_duration_seconds: 696,
          actual_duration_minutes: 12,
        },
      };

      const info = getWorkshopDurationInfo(workshop);
      expect(info.isReal).toBe(true);
      expect(info.minutes).toBe(12);
      expect(info.seconds).toBe(696);
      expect(info.display).toBe('12 min');
    });

    it('calcula minutos si solo viene actual_duration_seconds', () => {
      const workshop: Partial<LiveWorkshop> = {
        title: 'Electricidad',
        duration_minutes: 45,
        clinical_case_json: {
          actual_duration_seconds: 1945,
        },
      };

      const info = getWorkshopDurationInfo(workshop);
      expect(info.isReal).toBe(true);
      expect(info.minutes).toBe(32);
      expect(info.display).toBe('32 min');
    });

    it('hace fallback a duration_minutes si no hay metadatos reales', () => {
      const workshop: Partial<LiveWorkshop> = {
        title: 'Clase Futura',
        duration_minutes: 45,
        clinical_case_json: null,
      };

      const info = getWorkshopDurationInfo(workshop);
      expect(info.isReal).toBe(false);
      expect(info.minutes).toBe(45);
      expect(info.display).toBe('45 min');
    });
  });
});

