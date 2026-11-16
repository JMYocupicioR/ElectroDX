import { getVideoDedupKey, parseVideoUrl } from './mediaValidation';

export type LibraryVideoPick = {
  id: string;
  title: string;
  url: string;
  dedupKey: string;
  kind: 'workshop' | 'lesson';
  sourceLabel: string;
  moduleTitle?: string;
  topicTitle?: string;
  durationMinutes?: number;
  authorId?: string;
  workshopId?: string;
  date?: string;
};

/**
 * Une talleres grabados y videos de lección en una sola lista.
 * Si el mismo enlace existe como clase grabada y como video de tema, queda la clase:
 * vincularla evita una segunda copia en la biblioteca.
 */
export function buildLibraryVideoPicks(sources: LibraryVideoPick[]): LibraryVideoPick[] {
  const byKey = new Map<string, LibraryVideoPick>();

  for (const source of sources) {
    const title = source.title?.trim();
    const url = source.url?.trim();
    if (!title || !url) continue;
    if (!parseVideoUrl(url) && !getVideoDedupKey(url)) continue;

    const dedupKey = getVideoDedupKey(url) ?? `raw:${url}`;
    const pick: LibraryVideoPick = {
      ...source,
      title,
      url,
      dedupKey,
    };
    const existing = byKey.get(dedupKey);
    if (!existing) {
      byKey.set(dedupKey, pick);
      continue;
    }
    if (existing.kind !== 'workshop' && pick.kind === 'workshop') {
      byKey.set(dedupKey, pick);
      continue;
    }
    if (existing.kind === 'lesson' && pick.kind === 'lesson') {
      byKey.set(dedupKey, {
        ...existing,
        durationMinutes: pick.durationMinutes ?? existing.durationMinutes,
        authorId: pick.authorId ?? existing.authorId,
        topicTitle: pick.topicTitle ?? existing.topicTitle,
        moduleTitle: pick.moduleTitle ?? existing.moduleTitle,
      });
    }
  }

  return [...byKey.values()].sort((a, b) => {
    if (a.kind !== b.kind) return a.kind === 'workshop' ? -1 : 1;
    return a.title.localeCompare(b.title, 'es');
  });
}
