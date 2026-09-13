import { allModules, resolveModuleId } from '../content/modules';
import type { Module } from '../types/content';
import type { PublishedModule } from '../types/database';

export { resolveModuleId };

export function publishedModuleToModule(pm: PublishedModule): Module {
  return {
    id: pm.id,
    number: pm.number,
    title: pm.title,
    titleEn: pm.title_en ?? '',
    emoji: pm.emoji,
    description: pm.description ?? '',
    descriptionEn: pm.description_en ?? '',
    color: pm.color,
    icon: pm.icon,
    topics: [],
  };
}

export function mergeModuleLists(published: PublishedModule[]): Module[] {
  const byId = new Map<string, Module>();
  for (const mod of allModules) byId.set(mod.id, mod);
  for (const pm of published) {
    if (!byId.has(pm.id)) {
      byId.set(pm.id, publishedModuleToModule(pm));
    }
  }
  return [...byId.values()].sort((a, b) => a.number - b.number || a.title.localeCompare(b.title));
}

export function getMergedModuleById(
  moduleId: string,
  publishedModules: PublishedModule[] = []
): Module | undefined {
  if (!moduleId) return undefined;

  // 1. Resolve canonical ID from static modules
  const canonicalId = resolveModuleId(moduleId);
  if (canonicalId) {
    const staticMod = allModules.find((m) => m.id === canonicalId);
    if (staticMod) return staticMod;
  }

  // 2. Direct static match fallback
  const staticMod = allModules.find((m) => m.id.toLowerCase() === moduleId.trim().toLowerCase());
  if (staticMod) return staticMod;

  // 3. Published modules match (by id, number, canonicalId, or slug)
  const clean = moduleId.trim().toLowerCase();
  const published = publishedModules.find(
    (m) =>
      m.id.toLowerCase() === clean ||
      (canonicalId && m.id.toLowerCase() === canonicalId.toLowerCase()) ||
      String(m.number) === clean ||
      (m.slug && m.slug.toLowerCase() === clean)
  );
  return published ? publishedModuleToModule(published) : undefined;
}

