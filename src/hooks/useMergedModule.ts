import { useEffect, useMemo, useState } from 'react';
import type { Module } from '../types/content';
import type { PublishedModule, PublishedTopic } from '../types/database';
import { isSupabaseConfigured } from '../lib/supabase';
import { getPublishedModules, getPublishedTopicsByModule } from '../services/editorialService';
import { mergeModuleTopics, applyLessonExpansions } from '../services/contentMerge';
import { applySyllabusTopicOverrides } from '../content/courseCatalog';
import { getMergedModuleById, resolveModuleId } from '../services/moduleMerge';
import { getSyllabusTopicOverrides } from '../services/courseService';
import type { SyllabusTopicOverride } from '../types/database';

export function useMergedModule(moduleId: string | undefined) {
  const canonicalId = useMemo(() => resolveModuleId(moduleId) ?? moduleId, [moduleId]);
  const [publishedModules, setPublishedModules] = useState<PublishedModule[]>([]);
  const [publishedTopics, setPublishedTopics] = useState<PublishedTopic[]>([]);
  const [topicOverrides, setTopicOverrides] = useState<SyllabusTopicOverride[]>([]);
  const [loading, setLoading] = useState(isSupabaseConfigured);

  const [refreshKey, setRefreshKey] = useState(0);

  const refresh = () => setRefreshKey((k) => k + 1);

  useEffect(() => {
    if (!canonicalId || !isSupabaseConfigured) {
      setPublishedModules([]);
      setPublishedTopics([]);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);

    Promise.all([
      getPublishedModules(),
      getPublishedTopicsByModule(canonicalId),
      getSyllabusTopicOverrides(),
    ])
      .then(([mods, topics, overrides]) => {
        if (!cancelled) {
          setPublishedModules(mods);
          setPublishedTopics(topics);
          setTopicOverrides(overrides.filter((o) => o.module_id === canonicalId));
        }
      })
      .catch(() => {
        if (!cancelled) {
          setPublishedModules([]);
          setPublishedTopics([]);
          setTopicOverrides([]);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [canonicalId, refreshKey]);

  const staticModule = useMemo(
    () => getMergedModuleById(canonicalId ?? moduleId ?? '', publishedModules),
    [canonicalId, moduleId, publishedModules]
  );

  const module: Module | undefined = useMemo(() => {
    if (!staticModule) return undefined;
    const merged = publishedTopics.length
      ? mergeModuleTopics(staticModule, publishedTopics)
      : applyLessonExpansions(staticModule);
    return applySyllabusTopicOverrides(merged, topicOverrides);
  }, [staticModule, publishedTopics, topicOverrides]);

  return {
    module,
    staticModule,
    published: publishedTopics,
    loading,
    refresh,
  };
}
