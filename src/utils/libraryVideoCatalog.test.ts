import { describe, expect, it } from 'vitest';
import { buildLibraryVideoPicks, type LibraryVideoPick } from './libraryVideoCatalog';

function pick(partial: Partial<LibraryVideoPick> & Pick<LibraryVideoPick, 'id' | 'title' | 'url' | 'kind'>): LibraryVideoPick {
  return {
    dedupKey: '',
    sourceLabel: partial.kind === 'workshop' ? 'Taller grabado' : 'YouTube',
    ...partial,
  };
}

describe('buildLibraryVideoPicks', () => {
  it('keeps the recorded class when the same url is also a lesson video', () => {
    const url = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';
    const result = buildLibraryVideoPicks([
      pick({
        id: 'lesson-1',
        title: 'Copia en el tema',
        url,
        kind: 'lesson',
        topicTitle: 'Artefactos',
      }),
      pick({
        id: 'ws-1',
        title: 'Clase de artefactos',
        url,
        kind: 'workshop',
        workshopId: 'ws-1',
      }),
    ]);

    expect(result).toHaveLength(1);
    expect(result[0].kind).toBe('workshop');
    expect(result[0].workshopId).toBe('ws-1');
    expect(result[0].title).toBe('Clase de artefactos');
  });

  it('keeps one lesson entry when the same video is on several topics', () => {
    const url = 'https://drive.google.com/file/d/1WxSGYJRL-KbEV1u8rdyuW4FJk1mC5zrO/view';
    const result = buildLibraryVideoPicks([
      pick({ id: 'a', title: 'Interferencia 60 Hz', url, kind: 'lesson', sourceLabel: 'Google Drive' }),
      pick({
        id: 'b',
        title: 'Interferencia 60 Hz',
        url,
        kind: 'lesson',
        sourceLabel: 'Google Drive',
        durationMinutes: 18,
        authorId: 'author-2',
      }),
    ]);

    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('a');
    expect(result[0].durationMinutes).toBe(18);
    expect(result[0].authorId).toBe('author-2');
  });

  it('drops entries without a playable url and sorts classes before lessons', () => {
    const result = buildLibraryVideoPicks([
      pick({ id: 'bad', title: 'Sin enlace', url: 'esto no es un enlace', kind: 'lesson' }),
      pick({
        id: 'lesson',
        title: 'Ácido',
        url: 'https://vimeo.com/76979871',
        kind: 'lesson',
        sourceLabel: 'Vimeo',
      }),
      pick({
        id: 'ws',
        title: 'Bloqueo de conducción',
        url: 'https://youtu.be/abcdefghijk',
        kind: 'workshop',
        workshopId: 'ws',
      }),
    ]);

    expect(result.map((item) => item.id)).toEqual(['ws', 'lesson']);
  });
});
