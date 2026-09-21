import { describe, expect, it } from 'vitest';
import { assertCreateableCourseId, isCourseId } from '../content/courseCatalog';

describe('course slug helpers', () => {
  it('accepts valid slugs', () => {
    expect(isCourseId('diplomado-2027')).toBe(true);
    expect(isCourseId('principiante')).toBe(true);
  });

  it('rejects invalid slugs', () => {
    expect(isCourseId('')).toBe(false);
    expect(isCourseId('Mayusculas')).toBe(false);
    expect(isCourseId('con espacios')).toBe(false);
  });

  it('blocks duplicate ids when creating', () => {
    expect(() => assertCreateableCourseId('principiante', ['principiante'])).toThrow(/Ya existe/);
  });
});
