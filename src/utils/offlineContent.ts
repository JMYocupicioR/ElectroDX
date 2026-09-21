import type { Topic } from '../types/content';
import { getModuleById } from '../content/modules';

/** Nested topic id paths for a module tree (parents and leaves). */
export function collectTopicPaths(topics: Topic[], prefix: string[] = []): string[][] {
  const paths: string[][] = [];
  for (const topic of topics) {
    const path = [...prefix, topic.id];
    paths.push(path);
    if (topic.children?.length) {
      paths.push(...collectTopicPaths(topic.children, path));
    }
  }
  return paths;
}

/** SPA routes that must be in Cache API so a module can open offline. */
export function buildModuleCacheUrls(moduleId: string, topics: Topic[]): string[] {
  const urls = [`/modulo/${moduleId}`, `/modulo/${moduleId}/`];
  for (const path of collectTopicPaths(topics)) {
    urls.push(`/modulo/${moduleId}/${path.join('/')}`);
  }
  return urls;
}

export function getModuleCacheUrls(moduleId: string): string[] {
  const mod = getModuleById(moduleId);
  return buildModuleCacheUrls(moduleId, mod?.topics ?? []);
}

export function getDocumentAssetUrls(): string[] {
  if (typeof document === 'undefined') return [];
  const urls = new Set<string>();
  document.querySelectorAll('script[src]').forEach((el) => {
    const src = (el as HTMLScriptElement).src;
    if (src) urls.add(src);
  });
  document.querySelectorAll('link[rel="stylesheet"]').forEach((el) => {
    const href = (el as HTMLLinkElement).href;
    if (href) urls.add(href);
  });
  return [...urls];
}

export async function putCacheUrls(cache: Cache, urls: string[]): Promise<number> {
  let stored = 0;
  for (const url of urls) {
    try {
      const response = await fetch(url, { credentials: 'same-origin' });
      if (response.ok) {
        await cache.put(url, response.clone());
        stored += 1;
      }
    } catch {
      console.warn(`[Offline] Could not cache: ${url}`);
    }
  }
  return stored;
}
