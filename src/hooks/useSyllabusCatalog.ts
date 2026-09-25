import { useCallback, useEffect, useMemo, useState } from 'react';
import { allModules } from '../content/modules';
import {
  applyOverridesToModules,
  DEFAULT_COURSE_MODULES,
  DEFAULT_COURSES,
  groupModulesByCourse,
} from '../content/courseCatalog';
import { getSyllabusCatalog } from '../services/courseService';
import { getAllPublishedTopics } from '../services/editorialService';
import { applyLessonExpansions, mergeModuleTopics } from '../services/contentMerge';
import { isSupabaseConfigured } from '../lib/supabase';
import type { Course, CourseModuleRow, PublishedTopic, SyllabusTopicOverride } from '../types/database';
import type { Module } from '../types/content';

export function useSyllabusCatalog() {
  const [courses, setCourses] = useState<Course[]>(DEFAULT_COURSES);
  const [assignments, setAssignments] = useState<CourseModuleRow[]>(DEFAULT_COURSE_MODULES);
  const [overrides, setOverrides] = useState<SyllabusTopicOverride[]>([]);
  const [publishedTopics, setPublishedTopics] = useState<PublishedTopic[]>([]);
  const [loading, setLoading] = useState(isSupabaseConfigured);

  const reload = useCallback(async () => {
    if (!isSupabaseConfigured) {
      setCourses(DEFAULT_COURSES);
      setAssignments(DEFAULT_COURSE_MODULES);
      setOverrides([]);
      setPublishedTopics([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const [catalog, pubTopics] = await Promise.all([
        getSyllabusCatalog(),
        getAllPublishedTopics().catch((err) => {
          console.warn('[useSyllabusCatalog] getAllPublishedTopics fallback:', err);
          return [] as PublishedTopic[];
        }),
      ]);
      setCourses(catalog.courses.length ? catalog.courses : DEFAULT_COURSES);
      setAssignments(catalog.assignments.length ? catalog.assignments : DEFAULT_COURSE_MODULES);
      setOverrides(catalog.overrides);
      setPublishedTopics(pubTopics ?? []);
    } catch (err) {
      console.warn('[useSyllabusCatalog]', err);
      setCourses(DEFAULT_COURSES);
      setAssignments(DEFAULT_COURSE_MODULES);
      setOverrides([]);
      setPublishedTopics([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void reload();
  }, [reload]);

  const mergedModules: Module[] = useMemo(() => {
    if (!publishedTopics.length) return allModules.map(applyLessonExpansions);
    return allModules.map((mod) => {
      const topicsForModule = publishedTopics.filter((pt) => pt.module_id === mod.id);
      return topicsForModule.length ? mergeModuleTopics(mod, topicsForModule) : applyLessonExpansions(mod);
    });
  }, [publishedTopics]);

  const modulesWithOverrides: Module[] = useMemo(
    () => applyOverridesToModules(mergedModules, overrides),
    [mergedModules, overrides]
  );

  const modulesForStaff: Module[] = useMemo(
    () => applyOverridesToModules(mergedModules, overrides, { includeHidden: true }),
    [mergedModules, overrides]
  );

  const { grouped, unassigned } = useMemo(
    () => groupModulesByCourse(modulesWithOverrides, courses, assignments),
    [modulesWithOverrides, courses, assignments]
  );

  const { grouped: groupedForStaff } = useMemo(
    () => groupModulesByCourse(modulesForStaff, courses, assignments),
    [modulesForStaff, courses, assignments]
  );

  const visibleModules = useMemo(
    () => grouped.flatMap((g) => g.modules),
    [grouped]
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
    publishedTopics,
    loading,
    reload,
  };
}
