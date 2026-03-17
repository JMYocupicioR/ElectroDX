// src/hooks/useLocalizedContent.ts
// Resolves content fields based on the current language setting.
// Falls back gracefully to Spanish if no English translation exists.

import { useSettingsStore } from '../stores/settingsStore';
import { Topic, Module } from '../types/content';

/** Returns localized scalar fields for a Topic */
export function useLocalizedTopic(topic: Topic) {
  const lang = useSettingsStore((s) => s.language);
  const en = lang === 'en';
  return {
    title: (en && topic.titleEn) || topic.title,
    content: (en && topic.contentEn) || topic.content,
    description: (en && topic.descriptionEn) || topic.description,
    clinicalPearls: (en && topic.clinicalPearlsEn) || topic.clinicalPearls,
    keyPoints: (en && topic.keyPointsEn) || topic.keyPoints,
  };
}

/** Returns localized scalar fields for a Module */
export function useLocalizedModule(mod: Module) {
  const lang = useSettingsStore((s) => s.language);
  const en = lang === 'en';
  return {
    title: (en && mod.titleEn) || mod.title,
    description: (en && mod.descriptionEn) || mod.description,
  };
}

/** Non-hook helper for use inside loops / map callbacks */
export function localizedTopic(topic: Topic, lang: string) {
  const en = lang === 'en';
  return {
    title: (en && topic.titleEn) || topic.title,
    content: (en && topic.contentEn) || topic.content,
    description: (en && topic.descriptionEn) || topic.description,
    clinicalPearls: (en && topic.clinicalPearlsEn) || topic.clinicalPearls,
    keyPoints: (en && topic.keyPointsEn) || topic.keyPoints,
  };
}
