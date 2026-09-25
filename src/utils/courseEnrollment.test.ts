import { describe, expect, it } from 'vitest';
import type { Subscription } from '../types/database';
import { hasActivePremiumSubscription, isEnrolledInCourse } from './courseEnrollment';

const premium = {
  tier: 'premium',
  is_active: true,
  expires_at: null,
} as Subscription;

describe('isEnrolledInCourse', () => {
  it('does not treat an empty enrollment list as active courses', () => {
    expect(isEnrolledInCourse('principiante', [])).toBe(false);
    expect(isEnrolledInCourse('intermedio', [])).toBe(false);
    expect(isEnrolledInCourse('avanzado', [])).toBe(false);
    expect(isEnrolledInCourse('potenciales-evocados', [])).toBe(false);
  });

  it('marks only the courses that were granted', () => {
    const owned = ['principiante'] as const;
    expect(isEnrolledInCourse('principiante', owned)).toBe(true);
    expect(isEnrolledInCourse('intermedio', owned)).toBe(false);
    expect(isEnrolledInCourse('referencia', owned)).toBe(true);
  });

  it('unlocks every course when a paid premium subscription is active', () => {
    expect(hasActivePremiumSubscription(premium)).toBe(true);
    expect(isEnrolledInCourse('avanzado', [], { premiumSubscription: true })).toBe(true);
  });

  it('ignores an expired premium subscription', () => {
    expect(
      hasActivePremiumSubscription({
        ...premium,
        expires_at: '2020-01-01T00:00:00.000Z',
      }),
    ).toBe(false);
  });
});
