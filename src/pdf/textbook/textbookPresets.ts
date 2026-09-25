import {
  DEFAULT_TEXTBOOK_INCLUSION,
  defaultTextbookCover,
  type TextbookCover,
  type TextbookInclusion,
  type TextbookLang,
} from './buildTextbookModel';
import { DEFAULT_CREDIT_OPTIONS, type TextbookCreditOptions, type TopicPrintOverride } from './textbookOptions';
import { DEFAULT_TEXTBOOK_THEME, resolveTextbookTheme, type TextbookTheme } from './textbookTheme';

export const TEXTBOOK_DRAFT_KEY = 'neurosafe.textbook-export.v2';
export const TEXTBOOK_PRESETS_KEY = 'neurosafe.textbook-presets.v1';

export interface TextbookDraft {
  cover: TextbookCover;
  inclusion: TextbookInclusion;
  lang: TextbookLang;
  selectedModuleIds: string[];
  includeHidden: boolean;
  skipEmptyContainers: boolean;
  previewModuleId?: string;
  theme: TextbookTheme;
  creditOptions: TextbookCreditOptions;
  topicOverrides: Record<string, TopicPrintOverride>;
}

export interface TextbookPreset {
  id: string;
  name: string;
  savedAt: string;
  draft: TextbookDraft;
}

function safeParse<T>(raw: string | null, fallback: T): T {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function emptyTextbookDraft(): TextbookDraft {
  return {
    cover: defaultTextbookCover(),
    inclusion: { ...DEFAULT_TEXTBOOK_INCLUSION },
    lang: 'es',
    selectedModuleIds: [],
    includeHidden: false,
    skipEmptyContainers: false,
    theme: { ...DEFAULT_TEXTBOOK_THEME },
    creditOptions: { ...DEFAULT_CREDIT_OPTIONS, disabledAuthorIds: [] },
    topicOverrides: {},
  };
}

export function normalizeTextbookDraft(raw: Partial<TextbookDraft> | undefined): TextbookDraft {
  const base = emptyTextbookDraft();
  if (!raw) return base;
  return {
    cover: { ...base.cover, ...raw.cover },
    inclusion: { ...base.inclusion, ...raw.inclusion },
    lang: raw.lang === 'en' ? 'en' : 'es',
    selectedModuleIds: Array.isArray(raw.selectedModuleIds) ? raw.selectedModuleIds : [],
    includeHidden: Boolean(raw.includeHidden),
    skipEmptyContainers: Boolean(raw.skipEmptyContainers),
    previewModuleId: raw.previewModuleId,
    theme: resolveTextbookTheme(raw.theme),
    creditOptions: {
      ...DEFAULT_CREDIT_OPTIONS,
      ...raw.creditOptions,
      disabledAuthorIds: Array.isArray(raw.creditOptions?.disabledAuthorIds)
        ? raw.creditOptions.disabledAuthorIds
        : [],
    },
    topicOverrides: raw.topicOverrides && typeof raw.topicOverrides === 'object' ? raw.topicOverrides : {},
  };
}

export function loadTextbookDraft(): TextbookDraft {
  if (typeof localStorage === 'undefined') return emptyTextbookDraft();
  const v2 = localStorage.getItem(TEXTBOOK_DRAFT_KEY);
  if (v2) return normalizeTextbookDraft(safeParse(v2, {}));
  const legacy = localStorage.getItem('neurosafe.textbook-export.v1');
  return normalizeTextbookDraft(safeParse(legacy, {}));
}

export function saveTextbookDraft(draft: TextbookDraft) {
  if (typeof localStorage === 'undefined') return;
  try {
    localStorage.setItem(TEXTBOOK_DRAFT_KEY, JSON.stringify(draft));
  } catch {
    /* quota */
  }
}

export function loadTextbookPresets(): TextbookPreset[] {
  if (typeof localStorage === 'undefined') return [];
  const list = safeParse<TextbookPreset[]>(localStorage.getItem(TEXTBOOK_PRESETS_KEY), []);
  return list
    .filter((item) => item && item.id && item.name && item.draft)
    .map((item) => ({
      ...item,
      draft: normalizeTextbookDraft(item.draft),
    }));
}

function writePresets(presets: TextbookPreset[]) {
  localStorage.setItem(TEXTBOOK_PRESETS_KEY, JSON.stringify(presets));
}

export function saveTextbookPreset(name: string, draft: TextbookDraft, existingId?: string): TextbookPreset[] {
  const trimmed = name.trim();
  if (!trimmed) return loadTextbookPresets();
  const presets = loadTextbookPresets();
  const now = new Date().toISOString();
  if (existingId) {
    const next = presets.map((preset) =>
      preset.id === existingId
        ? { ...preset, name: trimmed, savedAt: now, draft: normalizeTextbookDraft(draft) }
        : preset
    );
    writePresets(next);
    return next;
  }
  const created: TextbookPreset = {
    id: `preset-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`,
    name: trimmed,
    savedAt: now,
    draft: normalizeTextbookDraft(draft),
  };
  const next = [created, ...presets];
  writePresets(next);
  return next;
}

export function deleteTextbookPreset(id: string): TextbookPreset[] {
  const next = loadTextbookPresets().filter((preset) => preset.id !== id);
  writePresets(next);
  return next;
}
