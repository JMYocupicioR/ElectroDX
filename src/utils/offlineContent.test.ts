import { describe, expect, it } from 'vitest';
import type { Topic } from '../types/content';
import { buildModuleCacheUrls, collectTopicPaths } from './offlineContent';

const tree: Topic[] = [
  {
    id: 'intro',
    title: 'Intro',
    children: [
      { id: 'history', title: 'History' },
      { id: 'ethics', title: 'Ethics' },
    ],
  },
  { id: 'leaf', title: 'Leaf' },
];

describe('collectTopicPaths', () => {
  it('includes parents and nested leaves', () => {
    expect(collectTopicPaths(tree)).toEqual([
      ['intro'],
      ['intro', 'history'],
      ['intro', 'ethics'],
      ['leaf'],
    ]);
  });
});

describe('buildModuleCacheUrls', () => {
  it('caches the module shell and every topic route', () => {
    const urls = buildModuleCacheUrls('fundamentals', tree);
    expect(urls).toContain('/modulo/fundamentals');
    expect(urls).toContain('/modulo/fundamentals/');
    expect(urls).toContain('/modulo/fundamentals/intro/history');
    expect(urls).toContain('/modulo/fundamentals/leaf');
  });
});
