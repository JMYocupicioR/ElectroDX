import { describe, expect, it } from 'vitest';
import {
  attendanceStatusLabelEs,
  attendanceStatusSatisfiesSession,
} from './attendanceService';

describe('attendanceStatusSatisfiesSession', () => {
  it('acepta presente, retardo y justificada', () => {
    expect(attendanceStatusSatisfiesSession('present')).toBe(true);
    expect(attendanceStatusSatisfiesSession('late')).toBe(true);
    expect(attendanceStatusSatisfiesSession('excused')).toBe(true);
  });

  it('rechaza falta o vacío', () => {
    expect(attendanceStatusSatisfiesSession('absent')).toBe(false);
    expect(attendanceStatusSatisfiesSession(null)).toBe(false);
    expect(attendanceStatusSatisfiesSession(undefined)).toBe(false);
  });
});

describe('attendanceStatusLabelEs', () => {
  it('traduce estados del pase de lista', () => {
    expect(attendanceStatusLabelEs('present')).toBe('Presente');
    expect(attendanceStatusLabelEs('late')).toBe('Retardo');
    expect(attendanceStatusLabelEs('excused')).toBe('Justificada');
    expect(attendanceStatusLabelEs('absent')).toBe('Falta');
  });
});
