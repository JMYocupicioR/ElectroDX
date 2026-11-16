import type { AppRole } from '../types/database';

export type DirectoryPerson = {
  roles: readonly (AppRole | string)[];
  show_in_editorial_committee?: boolean;
  is_public?: boolean;
};

/** Quien imparte docencia. Es la lista para el contrato y el reparto por actividad. */
export function isTeachingCollaborator(user: Pick<DirectoryPerson, 'roles'>): boolean {
  return (user.roles as readonly string[]).includes('contributor');
}

/**
 * Quien puede decidir si su ficha sale en la lista pública del diplomado.
 * El alumno no elige eso: solo docencia, comité editorial y dirección.
 */
export function canChoosePublicSpecialistListing(user: Pick<DirectoryPerson, 'roles'>): boolean {
  return (user.roles as readonly string[]).some(
    (role) => role === 'contributor' || role === 'editor' || role === 'admin'
  );
}

/**
 * Comité y directorio de especialistas. Revisan exámenes y contenidos;
 * ese rol no implica docencia ni participación en el reparto docente.
 */
export function isEditorialOrSpecialist(user: DirectoryPerson): boolean {
  return (
    Boolean(user.show_in_editorial_committee) ||
    Boolean(user.is_public) ||
    user.roles.some((role) => role === 'editor' || role === 'admin')
  );
}
