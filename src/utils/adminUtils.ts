import { getModuleById } from '../content/modules';
import { findTopicInTree, findTopicPathInTree } from '../services/contentMerge';

export function getModuleLabel(moduleId: string): string {
  const mod = getModuleById(moduleId);
  return mod ? `Módulo ${mod.number}: ${mod.title}` : moduleId;
}

export function getTopicLabel(moduleId: string, topicId: string | null | undefined): string {
  if (!topicId) return 'Tema no especificado';
  const mod = getModuleById(moduleId);
  if (!mod) return topicId;
  const topic = findTopicInTree(mod.topics, topicId);
  return topic?.title || topicId;
}

export function getTopicPublicUrl(
  moduleId: string,
  topicId: string | null | undefined
): string | null {
  if (!topicId) return null;
  const mod = getModuleById(moduleId);
  if (!mod) return `/modulo/${moduleId}/${topicId}`;
  const path = findTopicPathInTree(mod.topics, topicId);
  return path ? `/modulo/${moduleId}/${path.join('/')}` : `/modulo/${moduleId}/${topicId}`;
}

export function isProfileComplete(user: {
  display_name?: string | null;
  credentials?: string | null;
  institution?: string | null;
}): boolean {
  return Boolean(
    user.display_name?.trim() &&
      user.credentials?.trim() &&
      user.institution?.trim()
  );
}

export function isEnrollmentProfileComplete(user: {
  display_name?: string | null;
  credentials?: string | null;
  institution?: string | null;
  cedula_profesional?: string | null;
}): boolean {
  return Boolean(
    user.display_name?.trim() &&
      user.credentials?.trim() &&
      user.institution?.trim()
  );
}

export const REVISION_STATUS_LABELS: Record<string, string> = {
  draft: 'Borrador',
  pending_review: 'En revisión',
  approved: 'Aprobada',
  rejected: 'Rechazada',
  changes_requested: 'Cambios solicitados',
};

/**
 * Determina si un perfil corresponde a personal directivo, docente o administrativo
 * (SuperAdmin, Admin, Editor, etc.) y no a un alumno médico a ser calificado.
 */
export function isStaffOrAdminProfile(profile: { roles?: string[] | null } | null | undefined): boolean {
  if (!profile || !profile.roles || !Array.isArray(profile.roles)) return false;
  return profile.roles.some((r) =>
    ['admin', 'superadmin', 'editor', 'committee_chair'].includes(r.toLowerCase())
  );
}

/**
 * Filtra únicamente a los médicos cursistas/alumnos que deben ser evaluados y calificados,
 * excluyendo a profesores, administradores y comités directivos.
 */
export function filterGradeableStudents<T extends { roles?: string[] | null; id?: string }>(
  profiles: T[],
  currentUserId?: string | null
): T[] {
  return profiles.filter((p) => {
    if (currentUserId && p.id === currentUserId) return false;
    return !isStaffOrAdminProfile(p);
  });
}

