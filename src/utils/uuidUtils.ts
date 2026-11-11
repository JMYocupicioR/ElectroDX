/**
 * Utilidades seguras de validación y extracción de UUID v4 para rutas,
 * RPCs de Postgres y tablas relacionales de la plataforma.
 */

export const UUID_V4_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
export const UUID_GENERAL_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export const UUID_EXTRACT_REGEX = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i;

/**
 * Retorna true si la cadena recibida es un UUID válido.
 */
export function isValidUuid(value?: string | null): boolean {
  if (typeof value !== 'string') return false;
  return UUID_GENERAL_REGEX.test(value.trim());
}

/**
 * Extrae de forma segura el primer UUID válido presente en una cadena
 * (incluso si vino concatenado erróneamente con texto u otro fragmento de ID).
 * Retorna null si no se detecta ningún patrón de UUID.
 */
export function extractValidUuid(input?: string | null): string | null {
  if (!input || typeof input !== 'string') return null;
  const match = input.match(UUID_EXTRACT_REGEX);
  return match ? match[0].toLowerCase() : null;
}

/**
 * Normaliza y valida una ruta de acción relativa de notificación o taller:
 * - Asegura que inicie con barra `/`.
 * - Si es una ruta `/taller/<id>`, extrae y valida el UUID, corrigiendo URLs concatenadas.
 */
export function sanitizeActionUrl(url?: string | null, fallback = '/portal'): string {
  if (!url || typeof url !== 'string') return fallback;
  let trimmed = url.trim();
  if (!trimmed) return fallback;

  if (!trimmed.startsWith('/') && !trimmed.startsWith('http://') && !trimmed.startsWith('https://')) {
    trimmed = `/${trimmed}`;
  }

  // Si apunta a un taller (/taller/...)
  if (trimmed.startsWith('/taller/')) {
    const rawId = trimmed.slice('/taller/'.length).trim();
    const cleanId = extractValidUuid(rawId);
    if (cleanId) {
      return `/taller/${cleanId}`;
    }
    return '/talleres';
  }

  return trimmed;
}

