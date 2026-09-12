import type { AppRole, EnrollmentStatus } from '../types/database';

export const ROLE_META: Record<
  AppRole,
  { label: string; description: string; badgeClass: string }
> = {
  admin: {
    label: 'Administrador',
    description: 'Gestión de usuarios, roles y auditoría',
    badgeClass: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300',
  },
  editor: {
    label: 'Editor',
    description: 'Revisión y publicación de contenido',
    badgeClass: 'bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300',
  },
  contributor: {
    label: 'Colaborador',
    description: 'Propuesta de temas y cuestionarios',
    badgeClass: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  },
  student: {
    label: 'Estudiante Médico',
    description: 'Acceso a casos clínicos, temarios y simuladores',
    badgeClass: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
  },
};

export const ENROLLMENT_META: Record<
  EnrollmentStatus,
  { label: string; badgeClass: string }
> = {
  none: {
    label: 'Sin inscripción médica',
    badgeClass: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
  },
  pending: {
    label: 'Inscripción en revisión',
    badgeClass: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
  },
  approved: {
    label: 'Médico inscrito',
    badgeClass: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
  },
  rejected: {
    label: 'Inscripción rechazada',
    badgeClass: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
  },
};

export function getPermissionSummary(input: {
  roles: AppRole[];
  verifiedAt: string | null;
  enrollmentStatus: EnrollmentStatus;
  canProposeContent: boolean;
  isEnrolledPhysician: boolean;
  isAdmin: boolean;
}): string[] {
  const items: string[] = [];

  if (input.isAdmin) items.push('Panel de administración');
  if (input.roles.includes('editor')) items.push('Revisión editorial');
  if (input.canProposeContent) items.push('Crear propuestas de contenido');
  if (input.isEnrolledPhysician) items.push('Evaluaciones y progreso');
  if (input.roles.includes('contributor') && input.verifiedAt) {
    items.push('Perfil verificado como colaborador');
  } else if (input.verifiedAt) {
    items.push('Expediente profesional verificado');
  }
  if (input.enrollmentStatus === 'pending') items.push('Solicitud de inscripción enviada');

  if (!items.length) items.push('Acceso básico de lectura');

  return items;
}
