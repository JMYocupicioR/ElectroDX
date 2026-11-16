import { useEffect, useMemo, useState } from 'react';
import type { Module } from '../types/content';
import type { PublishedModule, PublishedTopic, SyllabusTopicOverride } from '../types/database';
import { isSupabaseConfigured } from '../lib/supabase';
import { allModules } from '../content/modules';
import { getPublishedModules, getPublishedTopicsByModule } from '../services/editorialService';
import { mergeModuleTopics, applyLessonExpansions } from '../services/contentMerge';
import {
  applySyllabusTopicOverrides,
  buildNumberedSyllabusGroups,
  orderModulesBySyllabus,
} from '../content/courseCatalog';
import { getMergedModuleById, mergeModuleLists, resolveModuleId } from '../services/moduleMerge';
import { getSyllabusTopicOverrides } from '../services/courseService';
import { useSyllabusStore } from '../stores/syllabusStore';

export interface UseMergedModuleOptions {
  /** Si es true, incluye temas ocultos (`is_visible = false`) manteniendo su orden vigente. */
  includeHidden?: boolean;
}

export function useMergedModule(
  moduleId: string | undefined,
  options?: UseMergedModuleOptions
) {
  const canonicalId = useMemo(() => resolveModuleId(moduleId) ?? moduleId, [moduleId]);
  const catalogVersion = useSyllabusStore((s) => s.version);
  const courses = useSyllabusStore((s) => s.courses);
  const assignments = useSyllabusStore((s) => s.assignments);
  const storePublishedModules = useSyllabusStore((s) => s.publishedModules);
  const ensureLoaded = useSyllabusStore((s) => s.ensureLoaded);
  const [publishedModules, setPublishedModules] = useState<PublishedModule[]>([]);
  const [publishedTopics, setPublishedTopics] = useState<PublishedTopic[]>([]);
  const [topicOverrides, setTopicOverrides] = useState<SyllabusTopicOverride[]>([]);
  const [loading, setLoading] = useState(isSupabaseConfigured);

  const [refreshKey, setRefreshKey] = useState(0);

  const refresh = () => setRefreshKey((k) => k + 1);

  useEffect(() => {
    void ensureLoaded();
  }, [ensureLoaded]);

  useEffect(() => {
    if (!canonicalId || !isSupabaseConfigured) {
      setPublishedModules([]);
      setPublishedTopics([]);
      setTopicOverrides([]);
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
  }, [canonicalId, refreshKey, catalogVersion]);

  const staticModule = useMemo(
    () => getMergedModuleById(canonicalId ?? moduleId ?? '', publishedModules),
    [canonicalId, moduleId, publishedModules]
  );

  const includeHidden = options?.includeHidden ?? false;

  const candidatePublished = publishedModules.length ? publishedModules : storePublishedModules;

  const dynamicNumber = useMemo(() => {
    if (!staticModule) return undefined;
    const baseList = candidatePublished.length ? mergeModuleLists(candidatePublished) : allModules;
    if (includeHidden) {
      const ordered = orderModulesBySyllabus(baseList, courses, assignments);
      return ordered.find((m) => m.id === staticModule.id)?.number ?? staticModule.number;
    }
    const { numberById } = buildNumberedSyllabusGroups(baseList, courses, assignments);
    return numberById.get(staticModule.id) ?? staticModule.number;
  }, [staticModule, candidatePublished, courses, assignments, includeHidden]);

  const module: Module | undefined = useMemo(() => {
    if (!staticModule) return undefined;
    const merged = publishedTopics.length
      ? mergeModuleTopics(staticModule, publishedTopics)
      : applyLessonExpansions(staticModule);
    const overridden = applySyllabusTopicOverrides(merged, topicOverrides, { includeHidden });
    return dynamicNumber !== undefined && overridden.number !== dynamicNumber
      ? { ...overridden, number: dynamicNumber }
      : overridden;
  }, [staticModule, publishedTopics, topicOverrides, includeHidden, dynamicNumber]);

  return {
    module,
    staticModule,
    published: publishedTopics,
    loading,
    refresh,
  };
}
