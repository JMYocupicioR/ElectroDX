import { useEffect, useMemo, useState } from 'react';
import type { Module } from '../types/content';
import type { PublishedModule, PublishedTopic } from '../types/database';
import { isSupabaseConfigured } from '../lib/supabase';
import { getPublishedModules, getPublishedTopicsByModule } from '../services/editorialService';
import { mergeModuleTopics } from '../services/contentMerge';
import { getMergedModuleById } from '../services/moduleMerge';

export function useMergedModule(moduleId: string | undefined) {
  const [publishedModules, setPublishedModules] = useState<PublishedModule[]>([]);
  const [publishedTopics, setPublishedTopics] = useState<PublishedTopic[]>([]);
  const [loading, setLoading] = useState(isSupabaseConfigured);

  useEffect(() => {
    if (!moduleId || !isSupabaseConfigured) {
      setPublishedModules([]);
      setPublishedTopics([]);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);

    Promise.all([getPublishedModules(), getPublishedTopicsByModule(moduleId)])
      .then(([mods, topics]) => {
        if (!cancelled) {
          setPublishedModules(mods);
          setPublishedTopics(topics);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setPublishedModules([]);
          setPublishedTopics([]);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [moduleId]);

  const staticModule = useMemo(
    () => getMergedModuleById(moduleId ?? '', publishedModules),
    [moduleId, publishedModules]
  );

  const module: Module | undefined = useMemo(() => {
    if (!staticModule) return undefined;
    if (!publishedTopics.length) return staticModule;
    return mergeModuleTopics(staticModule, publishedTopics);
  }, [staticModule, publishedTopics]);

  return {
    module,
    staticModule,
    published: publishedTopics,
    loading,
  };
}
