import { useEffect, useMemo, useState } from 'react';
import { allModules } from '../content/modules';
import type { Module } from '../types/content';
import type { PublishedModule } from '../types/database';
import { isSupabaseConfigured } from '../lib/supabase';
import { getPublishedModules } from '../services/editorialService';
import { mergeModuleLists } from '../services/moduleMerge';

export function useAllModules() {
  const [published, setPublished] = useState<PublishedModule[]>([]);
  const [loading, setLoading] = useState(isSupabaseConfigured);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setPublished([]);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    getPublishedModules()
      .then((data) => {
        if (!cancelled) setPublished(data);
      })
      .catch(() => {
        if (!cancelled) setPublished([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const modules: Module[] = useMemo(() => {
    if (!published.length) return allModules;
    return mergeModuleLists(published);
  }, [published]);

  return { modules, published, loading };
}
