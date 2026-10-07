import { describe, it, expect } from 'vitest';
import {
  extractVideosFromContent,
  resolveAllTopicVideos,
} from './mediaValidation';

describe('extractVideosFromContent', () => {
  it('extracts youtube links from markdown syntax', () => {
    const text = 'Revisa este enlace: [Demostración de Fibrilaciones](https://www.youtube.com/watch?v=dQw4w9WgXcQ) en el examen.';
    const videos = extractVideosFromContent(text);
    expect(videos).toHaveLength(1);
    expect(videos[0].title).toBe('Demostración de Fibrilaciones');
    expect(videos[0].url).toBe('https://www.youtube.com/watch?v=dQw4w9WgXcQ');
  });

  it('extracts google drive links from markdown syntax', () => {
    const text = 'Mira la grabación: [Descarga Miotónica en Drive](https://drive.google.com/file/d/1WxSGYJRL-KbEV1u8rdyuW4FJk1mC5zrO/view)';
    const videos = extractVideosFromContent(text);
    expect(videos).toHaveLength(1);
    expect(videos[0].title).toBe('Descarga Miotónica en Drive');
    expect(videos[0].url).toBe('https://drive.google.com/file/d/1WxSGYJRL-KbEV1u8rdyuW4FJk1mC5zrO/view');
  });

  it('extracts iframes with title', () => {
    const text = '<iframe src="https://www.youtube.com/embed/dQw4w9WgXcQ" title="PAUM en Miopatía" width="560"></iframe>';
    const videos = extractVideosFromContent(text);
    expect(videos).toHaveLength(1);
    expect(videos[0].title).toBe('PAUM en Miopatía');
    expect(videos[0].url).toBe('https://www.youtube.com/embed/dQw4w9WgXcQ');
  });

  it('extracts raw youtube and vimeo URLs without markdown syntax', () => {
    const text = `
      Aquí hay un video explicativo:
      https://youtu.be/dQw4w9WgXcQ
      Y otro video en Vimeo:
      https://vimeo.com/76979871
    `;
    const videos = extractVideosFromContent(text);
    expect(videos).toHaveLength(2);
    expect(videos[0].url).toBe('https://youtu.be/dQw4w9WgXcQ');
    expect(videos[1].url).toBe('https://vimeo.com/76979871');
  });

  it('handles null or empty content gracefully', () => {
    expect(extractVideosFromContent(null)).toEqual([]);
    expect(extractVideosFromContent('')).toEqual([]);
    expect(extractVideosFromContent('Texto plano sin ningún video')).toEqual([]);
  });
});

describe('resolveAllTopicVideos', () => {
  it('resolves and merges structured youtubeUrls and drive videoUrls', () => {
    const topic = {
      title: 'Principios de EMG',
      youtubeUrls: [{ title: 'Historia EMG', videoId: 'dPHnBPXRQxc' }],
      videoUrls: [{ title: 'Interferencia 60 Hz', driveId: '1WxSGYJRL-KbEV1u8rdyuW4FJk1mC5zrO' }],
    };

    const result = resolveAllTopicVideos(topic);
    expect(result).toHaveLength(2);
    const driveItem = result.find((r) => r.sourceKind === 'drive');
    const ytItem = result.find((r) => r.sourceKind === 'youtube');

    expect(ytItem?.title).toBe('Historia EMG');
    expect(ytItem?.embedSrc).toContain('youtube.com/embed/dPHnBPXRQxc');

    expect(driveItem?.title).toBe('Interferencia 60 Hz');
    expect(driveItem?.embedSrc).toContain('drive.google.com/file/d/1WxSGYJRL-KbEV1u8rdyuW4FJk1mC5zrO/preview');
  });

  it('deduplicates videos present in both structured media and content text', () => {
    const topic = {
      title: 'Técnica de Aguja',
      youtubeUrls: [{ title: 'Video Oficial de YouTube', videoId: 'dQw4w9WgXcQ' }],
      content: 'Ver también el video aquí: [Enlace duplicado](https://www.youtube.com/watch?v=dQw4w9WgXcQ)',
    };

    const result = resolveAllTopicVideos(topic);
    expect(result).toHaveLength(1);
    expect(result[0].title).toBe('Video Oficial de YouTube');
  });

  it('includes direct video_url and content videos', () => {
    const topic = {
      title: 'Taller de Paraespinales',
      video_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      content: '[Video Extra](https://vimeo.com/76979871)',
    };

    const result = resolveAllTopicVideos(topic);
    expect(result).toHaveLength(2);
    expect(result[0].title).toBe('Video: Taller de Paraespinales');
    expect(result[1].title).toBe('Video Extra');
    expect(result[1].sourceKind).toBe('vimeo');
  });
});
