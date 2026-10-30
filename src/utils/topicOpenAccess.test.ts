import { describe, expect, it } from 'vitest';
import {
  accessWriteForOpenTopics,
  currentOpenTopicIds,
  isTopicOpenToRegistered,
  moduleHasRegisteredTopics,
  nextOpenTopicIds,
} from './topicOpenAccess';

const allIds = ['intro', 'bases', 'etica'];

describe('topic open access for registered students', () => {
  it('keeps a topic closed when the module has no access row', () => {
    expect(isTopicOpenToRegistered(undefined, ['intro'])).toBe(false);
    expect(moduleHasRegisteredTopics(undefined)).toBe(false);
  });

  it('opens every topic when the module is marked free', () => {
    const access = { required_tier: 'free' as const, preview_topic_ids: [] };
    expect(isTopicOpenToRegistered(access, ['bases'])).toBe(true);
    expect(currentOpenTopicIds(access, allIds)).toEqual(allIds);
  });

  it('opens only the listed topics, including a child reached through its parent', () => {
    const access = { required_tier: 'premium' as const, preview_topic_ids: ['intro'] };
    expect(isTopicOpenToRegistered(access, ['intro', 'intro-lab'])).toBe(true);
    expect(isTopicOpenToRegistered(access, ['bases'])).toBe(false);
    expect(moduleHasRegisteredTopics(access)).toBe(true);
  });

  it('opens one topic and its children without opening the rest of the module', () => {
    const withChild = ['intro', 'intro-lab', 'bases', 'etica'];
    const openIds = nextOpenTopicIds(undefined, withChild, ['intro', 'intro-lab'], true);
    expect(openIds).toEqual(['intro', 'intro-lab']);
    expect(accessWriteForOpenTopics(openIds, withChild)).toEqual({
      tier: 'premium',
      previewTopicIds: ['intro', 'intro-lab'],
    });
  });

  it('reserves a single topic when the whole module was free', () => {
    const access = { required_tier: 'free' as const, preview_topic_ids: [] };
    const openIds = nextOpenTopicIds(access, allIds, ['bases'], false);
    expect(openIds).toEqual(['intro', 'etica']);
    expect(accessWriteForOpenTopics(openIds, allIds)).toEqual({
      tier: 'premium',
      previewTopicIds: ['intro', 'etica'],
    });
  });

  it('stores a fully open module as free', () => {
    const access = { required_tier: 'premium' as const, preview_topic_ids: ['intro', 'bases'] };
    const openIds = nextOpenTopicIds(access, allIds, ['etica'], true);
    expect(accessWriteForOpenTopics(openIds, allIds)).toEqual({
      tier: 'free',
      previewTopicIds: [],
    });
  });
});
