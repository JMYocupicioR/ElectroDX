import { describe, expect, it } from 'vitest';
import type { Profile, PublishedTopic } from '../../types/database';
import {
  buildTextbookContributors,
  contributorsForModule,
  formatContributorLabel,
  seedsFromPublishedTopics,
} from './textbookCredits';

function published(partial: Partial<PublishedTopic> & Pick<PublishedTopic, 'id' | 'module_id'>): PublishedTopic {
  return {
    parent_id: null,
    slug: partial.id,
    title: partial.id,
    title_en: null,
    description: null,
    description_en: null,
    content: null,
    content_en: null,
    media: { imageUrls: [], pdfUrls: [], youtubeUrls: [], vimeoUrls: [], videoUrls: [], embedUrls: [] },
    clinical_pearls: [],
    clinical_pearls_en: [],
    key_points: [],
    key_points_en: [],
    tags: [],
    key_terms: [],
    sort_order: 0,
    version: 1,
    published_at: '2026-09-01T00:00:00.000Z',
    published_by: null,
    last_edited_by: null,
    source_revision_id: null,
    video_url: null,
    ...partial,
  };
}

describe('textbookCredits', () => {
  it('formats names with optional credentials', () => {
    expect(formatContributorLabel('Ana López', 'M.N.', true)).toBe('Ana López, M.N.');
    expect(formatContributorLabel('Ana López', 'M.N.', false)).toBe('Ana López');
  });

  it('merges published editors and lets you hide one person', () => {
    const seeds = seedsFromPublishedTopics([
      published({ id: 'history', module_id: 'fundamentals', last_edited_by: 'u1', published_by: 'u2' }),
      published({ id: 'ethics', module_id: 'fundamentals', last_edited_by: 'u1' }),
    ]);
    const profiles = new Map<string, Profile>([
      ['u1', { id: 'u1', display_name: 'Ana López', credentials: 'M.N.' } as Profile],
      ['u2', { id: 'u2', display_name: 'Luis Pérez', credentials: null } as Profile],
    ]);
    const people = buildTextbookContributors(seeds, profiles, true);
    expect(people.map((person) => person.label)).toEqual(['Ana López, M.N.', 'Luis Pérez']);
    expect(contributorsForModule(people, 'fundamentals', ['u2']).map((person) => person.id)).toEqual(['u1']);
  });
});
