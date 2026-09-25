import { describe, expect, it } from 'vitest';
import { DEFAULT_TEXTBOOK_INCLUSION } from './buildTextbookModel';
import {
  isTopicIncluded,
  patchTopicOverride,
  resolveTopicInclusion,
  toggleAuthorDisabled,
} from './textbookOptions';

describe('textbookOptions', () => {
  it('excludes a topic and its descendants', () => {
    const overrides = { parent: { included: false } };
    expect(isTopicIncluded('parent', ['parent'], overrides)).toBe(false);
    expect(isTopicIncluded('child', ['parent', 'child'], overrides)).toBe(false);
    expect(isTopicIncluded('other', ['other'], overrides)).toBe(true);
  });

  it('outline-only keeps description and drops the lesson body', () => {
    const inclusion = resolveTopicInclusion(DEFAULT_TEXTBOOK_INCLUSION, { outlineOnly: true });
    expect(inclusion.description).toBe(true);
    expect(inclusion.body).toBe(false);
    expect(inclusion.pearls).toBe(false);
    expect(inclusion.images).toBe(false);
    expect(inclusion.outlineOnly).toBe(true);
  });

  it('toggles authors and prunes empty topic overrides', () => {
    expect(toggleAuthorDisabled(['a'], 'a')).toEqual([]);
    expect(toggleAuthorDisabled([], 'b')).toEqual(['b']);
    const next = patchTopicOverride({}, 'history', { included: false });
    expect(next.history?.included).toBe(false);
    expect(patchTopicOverride(next, 'history', { included: undefined })).toEqual({});
  });
});
