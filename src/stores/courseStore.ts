import { create } from 'zustand';
import { getModuleAccessMap, getUpcomingWorkshops } from '../services/courseService';
import type { ModuleAccess, LiveWorkshop } from '../types/database';

interface CourseState {
  moduleAccess: Map<string, ModuleAccess>;
  upcomingWorkshops: LiveWorkshop[];
  isLoading: boolean;
  error: string | null;
  load: () => Promise<void>;
}

export const useCourseStore = create<CourseState>((set) => ({
  moduleAccess: new Map(),
  upcomingWorkshops: [],
  isLoading: false,
  error: null,
  load: async () => {
    set({ isLoading: true, error: null });
    try {
      const [accessMap, workshops] = await Promise.all([
        getModuleAccessMap(),
        getUpcomingWorkshops(5)
      ]);
      set({ moduleAccess: accessMap, upcomingWorkshops: workshops, isLoading: false });
    } catch (e) {
      set({ 
        error: e instanceof Error ? e.message : 'Error al cargar datos del curso',
        isLoading: false 
      });
    }
  }
}));
