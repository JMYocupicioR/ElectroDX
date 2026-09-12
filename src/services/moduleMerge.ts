import { allModules } from '../content/modules';
import type { Module } from '../types/content';
import type { PublishedModule } from '../types/database';

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
  publishedModules: PublishedModule[]
): Module | undefined {
  const staticMod = allModules.find((m) => m.id === moduleId);
  if (staticMod) return staticMod;
  const published = publishedModules.find((m) => m.id === moduleId);
  return published ? publishedModuleToModule(published) : undefined;
}
