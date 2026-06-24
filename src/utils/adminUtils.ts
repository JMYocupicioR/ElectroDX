import { getModuleById } from '../content/modules';
import { findTopicPathInTree } from '../services/contentMerge';

export function getModuleLabel(moduleId: string): string {
  const mod = getModuleById(moduleId);
  return mod ? `Módulo ${mod.number}: ${mod.title}` : moduleId;
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
      user.institution?.trim() &&
      user.cedula_profesional?.trim()
  );
}

export const REVISION_STATUS_LABELS: Record<string, string> = {
  draft: 'Borrador',
  pending_review: 'En revisión',
  approved: 'Aprobada',
  rejected: 'Rechazada',
  changes_requested: 'Cambios solicitados',
};
