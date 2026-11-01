import { describe, it, expect } from 'vitest';
import { publishedTopicToTopic } from './contentMerge';
import type { PublishedTopic } from '../types/database';

describe('publishedTopicToTopic', () => {
  it('preserves both Google Drive and YouTube videos when published topic has both', () => {
    const pt: PublishedTopic = {
      id: 'history',
      module_id: 'fundamentals',
      parent_id: 'intro-neurodiagnostics',
      slug: 'history',
      title: 'Historia de la electrofisiología clínica',
      title_en: 'History of clinical electrophysiology',
      description: null,
      description_en: null,
      content: 'Contenido del tema',
      content_en: null,
      sort_order: 1,
      version: 1,
      published_at: new Date().toISOString(),
      published_by: null,
      last_edited_by: null,
      source_revision_id: null,
      video_url: 'cAkUG2gtHic',
      clinical_pearls: [],
      clinical_pearls_en: [],
      key_points: [],
      key_points_en: [],
      tags: [],
      key_terms: [],
      media: {
        videoUrls: [
          {
            title: 'Breve historia de la EMG',
            driveId: '1Cu1ooAh5GbRyXiIOxCftyaqFUljK6kzK',
          },
        ],
        youtubeUrls: [
          {
            title: 'INTRODUCCION Y FUNDAMENTOS',
            videoId: 'cAkUG2gtHic',
          },
        ],
      },
    };

    const topic = publishedTopicToTopic(pt);

    expect(topic.videoUrls).toBeDefined();
    expect(topic.videoUrls).toHaveLength(1);
    expect(topic.videoUrls![0].title).toBe('Breve historia de la EMG');
    expect(topic.videoUrls![0].driveId).toBe('1Cu1ooAh5GbRyXiIOxCftyaqFUljK6kzK');

    expect(topic.youtubeUrls).toBeDefined();
    expect(topic.youtubeUrls).toHaveLength(1);
    expect(topic.youtubeUrls![0].title).toBe('INTRODUCCION Y FUNDAMENTOS');
    expect(topic.youtubeUrls![0].videoId).toBe('cAkUG2gtHic');
  });

  it('preserves multiple videos added without dropping any', () => {
    const pt: PublishedTopic = {
      id: 'electrodes',
      module_id: 'fundamentals',
      parent_id: null,
      slug: 'electrodes',
      title: 'Tipos de Electrodos',
      title_en: null,
      description: null,
      description_en: null,
      content: null,
      content_en: null,
      sort_order: 2,
      version: 1,
      published_at: new Date().toISOString(),
      published_by: null,
      last_edited_by: null,
      source_revision_id: null,
      video_url: null,
      clinical_pearls: [],
      clinical_pearls_en: [],
      key_points: [],
      key_points_en: [],
      tags: [],
      key_terms: [],
      media: {
        videoUrls: [
          {
            title: 'Drive Demostración',
            driveId: '1WxSGYJRL-KbEV1u8rdyuW4FJk1mC5zrO',
          },
        ],
        youtubeUrls: [
          {
            title: 'YouTube Clase',
            videoId: 'dQw4w9WgXcQ',
          },
        ],
        vimeoUrls: [
          {
            title: 'Vimeo Procedimiento',
            videoId: '76979871',
          },
        ],
      },
    };

    const topic = publishedTopicToTopic(pt);
    expect(topic.videoUrls).toHaveLength(1);
    expect(topic.youtubeUrls).toHaveLength(1);
    expect(topic.vimeoUrls).toHaveLength(1);
  });
});
