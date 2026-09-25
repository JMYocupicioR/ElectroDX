import type { CourseId, Subscription } from '../types/database';

/** Suscripción premium pagada. El rol de administrador o editor no cuenta como matrícula. */
export function hasActivePremiumSubscription(
  subscription: Subscription | null | undefined,
  now = new Date(),
): boolean {
  if (!subscription || subscription.tier !== 'premium' || !subscription.is_active) return false;
  if (!subscription.expires_at) return true;
  return new Date(subscription.expires_at) > now;
}

/**
 * Matrícula de estudiante: filas activas en course_enrollments, o premium de pago.
 * El acceso de revisión del personal (admin/editor) no marca el curso como cursando.
 */
export function isEnrolledInCourse(
  courseId: CourseId,
  courseIds: readonly CourseId[],
  options?: { premiumSubscription?: boolean; legacyStudentUnlock?: boolean },
): boolean {
  if (options?.premiumSubscription || options?.legacyStudentUnlock) return true;
  if (courseId === 'referencia') return courseIds.some((id) => id !== 'referencia');
  return courseIds.includes(courseId);
}
