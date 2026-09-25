import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import {
  deleteTextbookPreset,
  emptyTextbookDraft,
  loadTextbookPresets,
  normalizeTextbookDraft,
  saveTextbookPreset,
} from './textbookPresets';

const memory = new Map<string, string>();
const store = {
  getItem: (key: string) => memory.get(key) ?? null,
  setItem: (key: string, value: string) => { memory.set(key, value); },
  removeItem: (key: string) => { memory.delete(key); },
};

beforeEach(() => {
  memory.clear();
  Object.defineProperty(globalThis, 'localStorage', { configurable: true, value: store });
});

describe('textbookPresets', () => {
  afterEach(() => {
    memory.clear();
  });

  it('normalizes a partial draft', () => {
    const draft = normalizeTextbookDraft({ lang: 'en', selectedModuleIds: ['fundamentals'] });
    expect(draft.lang).toBe('en');
    expect(draft.cover.title.length).toBeGreaterThan(0);
    expect(draft.inclusion.body).toBe(true);
    expect(draft.theme.bodyPt).toBeGreaterThan(0);
    expect(draft.creditOptions.showChapterCredits).toBe(true);
    expect(draft.topicOverrides).toEqual({});
  });

  it('saves and deletes a named configuration', () => {
    const draft = emptyTextbookDraft();
    draft.cover.title = 'Libro de práctica';
    const saved = saveTextbookPreset('Cohorte 2026', draft);
    expect(saved).toHaveLength(1);
    expect(loadTextbookPresets()[0].name).toBe('Cohorte 2026');
    expect(loadTextbookPresets()[0].draft.cover.title).toBe('Libro de práctica');
    expect(deleteTextbookPreset(saved[0].id)).toHaveLength(0);
  });
});
