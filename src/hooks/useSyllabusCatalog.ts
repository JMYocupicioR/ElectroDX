import { useCallback, useEffect, useMemo, useState } from 'react';
import { allModules } from '../content/modules';
import {
  applyOverridesToModules,
  DEFAULT_COURSE_MODULES,
  DEFAULT_COURSES,
  groupModulesByCourse,
} from '../content/courseCatalog';
import { getSyllabusCatalog } from '../services/courseService';
import { isSupabaseConfigured } from '../lib/supabase';
import type { Course, CourseModuleRow, SyllabusTopicOverride } from '../types/database';
import type { Module } from '../types/content';

export function useSyllabusCatalog() {
  const [courses, setCourses] = useState<Course[]>(DEFAULT_COURSES);
  const [assignments, setAssignments] = useState<CourseModuleRow[]>(DEFAULT_COURSE_MODULES);
  const [overrides, setOverrides] = useState<SyllabusTopicOverride[]>([]);
  const [loading, setLoading] = useState(isSupabaseConfigured);

  const reload = useCallback(async () => {
    if (!isSupabaseConfigured) {
      setCourses(DEFAULT_COURSES);
      setAssignments(DEFAULT_COURSE_MODULES);
      setOverrides([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const catalog = await getSyllabusCatalog();
      setCourses(catalog.courses.length ? catalog.courses : DEFAULT_COURSES);
      setAssignments(catalog.assignments.length ? catalog.assignments : DEFAULT_COURSE_MODULES);
      setOverrides(catalog.overrides);
    } catch (err) {
      console.warn('[useSyllabusCatalog]', err);
      setCourses(DEFAULT_COURSES);
      setAssignments(DEFAULT_COURSE_MODULES);
      setOverrides([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void reload();
  }, [reload]);

  const modulesWithOverrides: Module[] = useMemo(
    () => applyOverridesToModules(allModules, overrides),
    [overrides]
  );

  const { grouped, unassigned } = useMemo(
    () => groupModulesByCourse(modulesWithOverrides, courses, assignments),
    [modulesWithOverrides, courses, assignments]
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
    unassigned,
    modulesWithOverrides,
    visibleModules,
    loading,
    reload,
  };
}
