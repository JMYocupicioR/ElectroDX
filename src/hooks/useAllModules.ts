import { useSyllabusCatalog } from './useSyllabusCatalog';

export interface UseAllModulesOptions {
  /** Si es false, excluye módulos y temas ocultos (ideal para vistas de alumno/públicas). Por defecto true para herramientas docentes. */
  includeHidden?: boolean;
}

/**
 * Fuente unificada y ordenada del temario (respetando cursos, sort_order de módulos,
 * temas publicados en Supabase y overrides de orden/visibilidad).
 */
export function useAllModules(options?: UseAllModulesOptions) {
  const {
    modulesForStaff,
    visibleModules,
    publishedModules,
    loading,
  } = useSyllabusCatalog();

  const includeHidden = options?.includeHidden ?? true;

  return {
    modules: includeHidden ? modulesForStaff : visibleModules,
    published: publishedModules,
    loading,
  };
}
