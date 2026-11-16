import { useEffect, useMemo } from 'react';
import { allModules } from '../content/modules';
import {
  applyOverridesToModules,
  buildNumberedSyllabusGroups,
  orderModulesBySyllabus,
} from '../content/courseCatalog';
import { applyLessonExpansions, mergeModuleTopics } from '../services/contentMerge';
import { mergeModuleLists } from '../services/moduleMerge';
import { isSupabaseConfigured } from '../lib/supabase';
import { invalidateSyllabusCatalog, useSyllabusStore } from '../stores/syllabusStore';
import type { Module } from '../types/content';

export { invalidateSyllabusCatalog };

export function useSyllabusCatalog() {
  const courses = useSyllabusStore((s) => s.courses);
  const assignments = useSyllabusStore((s) => s.assignments);
  const overrides = useSyllabusStore((s) => s.overrides);
  const publishedModules = useSyllabusStore((s) => s.publishedModules);
  const publishedTopics = useSyllabusStore((s) => s.publishedTopics);
  const storeLoading = useSyllabusStore((s) => s.loading);
  const initialized = useSyllabusStore((s) => s.initialized);
  const version = useSyllabusStore((s) => s.version);
  const ensureLoaded = useSyllabusStore((s) => s.ensureLoaded);
  const reload = useSyllabusStore((s) => s.reload);

  useEffect(() => {
    void ensureLoaded();
  }, [ensureLoaded]);

  const baseModules: Module[] = useMemo(() => {
    if (!publishedModules.length) return allModules;
    return mergeModuleLists(publishedModules);
  }, [publishedModules]);

  const mergedModules: Module[] = useMemo(() => {
    if (!publishedTopics.length) return baseModules.map(applyLessonExpansions);
    return baseModules.map((mod) => {
      const topicsForModule = publishedTopics.filter((pt) => pt.module_id === mod.id);
      return topicsForModule.length ? mergeModuleTopics(mod, topicsForModule) : applyLessonExpansions(mod);
    });
  }, [baseModules, publishedTopics]);

  const studentModulesRaw: Module[] = useMemo(
    () => applyOverridesToModules(mergedModules, overrides),
    [mergedModules, overrides]
  );

  const staffModulesRaw: Module[] = useMemo(
    () => applyOverridesToModules(mergedModules, overrides, { includeHidden: true }),
    [mergedModules, overrides]
  );

  const { grouped, unassigned, visibleModules } = useMemo(
    () => buildNumberedSyllabusGroups(studentModulesRaw, courses, assignments),
    [studentModulesRaw, courses, assignments]
  );

  const { grouped: groupedForStaff } = useMemo(
    () =>
      buildNumberedSyllabusGroups(staffModulesRaw, courses, assignments, {
        includeHiddenInSequence: true,
      }),
    [staffModulesRaw, courses, assignments]
  );

  const modulesWithOverrides: Module[] = useMemo(
    () => orderModulesBySyllabus(studentModulesRaw, courses, assignments),
    [studentModulesRaw, courses, assignments]
  );

  const modulesForStaff: Module[] = useMemo(
    () => orderModulesBySyllabus(staffModulesRaw, courses, assignments),
    [staffModulesRaw, courses, assignments]
  );

  return {
    courses,
    assignments,
    overrides,
    grouped,
    groupedForStaff,
    unassigned,
    mergedModules,
    modulesWithOverrides,
    modulesForStaff,
    visibleModules,
    publishedModules,
    publishedTopics,
    loading: storeLoading || (!initialized && isSupabaseConfigured),
    version,
    reload,
  };
}
