import { create } from 'zustand';
import { DEFAULT_COURSE_MODULES, DEFAULT_COURSES } from '../content/courseCatalog';
import { isSupabaseConfigured } from '../lib/supabase';
import { getSyllabusCatalog } from '../services/courseService';
import { getAllPublishedTopics, getPublishedModules } from '../services/editorialService';
import type {
  Course,
  CourseModuleRow,
  PublishedModule,
  PublishedTopic,
  SyllabusTopicOverride,
} from '../types/database';

interface SyllabusStoreState {
  courses: Course[];
  assignments: CourseModuleRow[];
  overrides: SyllabusTopicOverride[];
  publishedModules: PublishedModule[];
  publishedTopics: PublishedTopic[];
  loading: boolean;
  initialized: boolean;
  version: number;
  ensureLoaded: () => Promise<void>;
  reload: () => Promise<void>;
}

let inflightLoad: Promise<void> | null = null;

async function fetchCatalogSnapshot() {
  const [catalog, pubModules, pubTopics] = await Promise.all([
    getSyllabusCatalog(),
    getPublishedModules().catch((err) => {
      console.warn('[syllabusStore] getPublishedModules fallback:', err);
      return [] as PublishedModule[];
    }),
    getAllPublishedTopics().catch((err) => {
      console.warn('[syllabusStore] getAllPublishedTopics fallback:', err);
      return [] as PublishedTopic[];
    }),
  ]);
  return {
    courses: catalog.courses.length ? catalog.courses : DEFAULT_COURSES,
    assignments: catalog.assignments.length ? catalog.assignments : DEFAULT_COURSE_MODULES,
    overrides: catalog.overrides,
    publishedModules: pubModules ?? [],
    publishedTopics: pubTopics ?? [],
  };
}

export const useSyllabusStore = create<SyllabusStoreState>((set, get) => ({
  courses: DEFAULT_COURSES,
  assignments: DEFAULT_COURSE_MODULES,
  overrides: [],
  publishedModules: [],
  publishedTopics: [],
  loading: false,
  initialized: false,
  version: 0,

  ensureLoaded: async () => {
    if (!isSupabaseConfigured) {
      if (!get().initialized) {
        set({
          courses: DEFAULT_COURSES,
          assignments: DEFAULT_COURSE_MODULES,
          overrides: [],
          publishedModules: [],
          publishedTopics: [],
          loading: false,
          initialized: true,
        });
      }
      return;
    }

    if (get().initialized) return;
    if (inflightLoad) return inflightLoad;

    set({ loading: true });
    inflightLoad = fetchCatalogSnapshot()
      .then((snap) => {
        set((state) => ({
          ...snap,
          loading: false,
          initialized: true,
          version: state.version + 1,
        }));
      })
      .catch((err) => {
        console.warn('[syllabusStore]', err);
        set({
          courses: DEFAULT_COURSES,
          assignments: DEFAULT_COURSE_MODULES,
          overrides: [],
          publishedModules: [],
          publishedTopics: [],
          loading: false,
          initialized: true,
        });
      })
      .finally(() => {
        inflightLoad = null;
      });

    return inflightLoad;
  },

  reload: async () => {
    if (!isSupabaseConfigured) {
      set((state) => ({
        courses: DEFAULT_COURSES,
        assignments: DEFAULT_COURSE_MODULES,
        overrides: [],
        publishedModules: [],
        publishedTopics: [],
        loading: false,
        initialized: true,
        version: state.version + 1,
      }));
      return;
    }

    set({ loading: true });
    const promise = fetchCatalogSnapshot()
      .then((snap) => {
        set((state) => ({
          ...snap,
          loading: false,
          initialized: true,
          version: state.version + 1,
        }));
      })
      .catch((err) => {
        console.warn('[syllabusStore] reload fallback:', err);
        set({ loading: false, initialized: true });
      })
      .finally(() => {
        if (inflightLoad === promise) inflightLoad = null;
      });

    inflightLoad = promise;
    return promise;
  },
}));

/** Fuerza la recarga global e invalidación reactiva del temario en todas las vistas activas. */
export function invalidateSyllabusCatalog(): Promise<void> {
  return useSyllabusStore.getState().reload();
}
