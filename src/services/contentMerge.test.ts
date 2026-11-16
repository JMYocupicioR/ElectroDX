import { describe, it, expect } from 'vitest';
import { findTopicInTree, publishedTopicToTopic, topicAsShownToStudents } from './contentMerge';
import { getModuleById } from '../content/modules';
import type { PublishedTopic } from '../types/database';
import type { Topic } from '../types/content';

function publishedFrom(topic: Topic, content: string | null, extras?: Partial<PublishedTopic>): PublishedTopic {
  return {
    id: topic.id,
    module_id: 'emg-needle',
    parent_id: 'upper-limb-muscles',
    slug: topic.id,
    title: topic.title,
    title_en: null,
    description: null,
    description_en: null,
    content,
    content_en: extras?.content_en ?? null,
    media: extras?.media ?? {},
    clinical_pearls: extras?.clinical_pearls ?? topic.clinicalPearls ?? [],
    clinical_pearls_en: extras?.clinical_pearls_en ?? [],
    key_points: extras?.key_points ?? topic.keyPoints ?? [],
    key_points_en: extras?.key_points_en ?? [],
    tags: [],
    key_terms: [],
    sort_order: 0,
    version: 1,
    published_at: new Date().toISOString(),
    published_by: null,
    last_edited_by: null,
    source_revision_id: null,
    video_url: null,
  };
}

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

describe('topicAsShownToStudents', () => {
  const staticApb = findTopicInTree(getModuleById('emg-needle')!.topics, 'apb')!;

  it('loads the same teaching text the public topic shows, once', () => {
    const shown = topicAsShownToStudents(staticApb, null)!;

    expect(shown.content).toContain('**Inervación:** Nervio mediano');
    expect(shown.content).toContain('## Objetivos');
    expect(shown.content).toContain('abductor corto del pulgar');
    expect(shown.content).toContain('## Técnica');
    expect(shown.content!.match(/## Objetivos/g)).toHaveLength(1);
    expect(shown.clinicalPearls!.length).toBeGreaterThan(staticApb.clinicalPearls!.length);

    const again = topicAsShownToStudents(shown, null)!;
    expect(again.content).toBe(shown.content);
    expect(again.clinicalPearls).toEqual(shown.clinicalPearls);
    expect(again.keyPoints).toEqual(shown.keyPoints);
    expect(again.imageUrls).toEqual(shown.imageUrls);
  });

  it('keeps the expansion on a published short sheet and does not append it after the full text is stored', () => {
    const shown = topicAsShownToStudents(
      staticApb,
      publishedFrom(staticApb, staticApb.content ?? null),
    )!;

    expect(shown.content).toContain('**Punto de inserción anatómico:**');
    expect(shown.content).toContain('## Explicación clínica');
    expect(shown.content!.match(/## Técnica/g)).toHaveLength(1);

    const stored = topicAsShownToStudents(
      staticApb,
      publishedFrom(staticApb, shown.content ?? null, {
        content_en: shown.contentEn ?? null,
        clinical_pearls: shown.clinicalPearls ?? [],
        clinical_pearls_en: shown.clinicalPearlsEn ?? [],
        key_points: shown.keyPoints ?? [],
        key_points_en: shown.keyPointsEn ?? [],
        media: { imageUrls: shown.imageUrls ?? [] },
      }),
    )!;

    expect(stored.content).toBe(shown.content);
    expect(stored.clinicalPearls).toEqual(shown.clinicalPearls);
    expect(stored.imageUrls).toEqual(shown.imageUrls);
  });
});
