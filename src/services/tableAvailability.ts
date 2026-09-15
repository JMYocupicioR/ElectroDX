/**
 * Gestión inteligente de disponibilidad de tablas en Supabase.
 * Previene peticiones HTTP 404 en consola para tablas cuyas migraciones SQL
 * aún no han sido ejecutadas en la base de datos remota de Supabase.
 */

const KEY_MISSING_TABLES = 'neurosafe_missing_supabase_tables';

// Tablas de nuevas funcionalidades cuya migración SQL puede estar pendiente en Supabase
// Ahora que la migración ha sido ejecutada en Supabase, dejamos la lista vacía para usar Supabase
const DEFAULT_PENDING_TABLES: string[] = [];

// Conjunto en memoria para respuesta síncrona inmediata
const missingTablesSet = new Set<string>();

// Cargar estado inicial y limpiar caché previa si fue creada automáticamente
try {
  localStorage.removeItem(KEY_MISSING_TABLES);
} catch {}

/**
 * Retorna si una tabla no existe en Supabase y debe usarse fallback local
 */
export function isTableMissingInSupabase(tableName: string): boolean {
  return missingTablesSet.has(tableName);
}

/**
 * Marca una tabla como inexistente en Supabase para no volver a enviar GET requests
 */
export function markTableAsMissingInSupabase(tableName: string): void {
  missingTablesSet.add(tableName);
  try {
    localStorage.setItem(KEY_MISSING_TABLES, JSON.stringify(Array.from(missingTablesSet)));
  } catch {}
}

/**
 * Marca una tabla como disponible una vez que el usuario ha ejecutado la migración SQL
 */
export function markTableAsAvailableInSupabase(tableName: string): void {
  missingTablesSet.delete(tableName);
  try {
    localStorage.setItem(KEY_MISSING_TABLES, JSON.stringify(Array.from(missingTablesSet)));
  } catch {}
}

/**
 * Restablece la detección para volver a comprobar si las tablas ya existen en Supabase
 */
export function resetSupabaseTablesCache(): void {
  missingTablesSet.clear();
  try {
    localStorage.removeItem(KEY_MISSING_TABLES);
  } catch {}
}
