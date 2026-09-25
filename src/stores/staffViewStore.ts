import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

type StaffView = 'admin' | 'student';

interface StaffViewStore {
  view: StaffView;
  hydrated: boolean;
  enterStudentMode: () => void;
  exitStudentMode: () => void;
}

/** Vista del administrador. Cada pestaña empieza en el panel; el modo estudiante dura solo esa sesión. */
export const useStaffViewStore = create<StaffViewStore>()(
  persist(
    (set) => ({
      view: 'admin',
      hydrated: false,
      enterStudentMode: () => set({ view: 'student' }),
      exitStudentMode: () => set({ view: 'admin' }),
    }),
    {
      name: 'staff-view-mode',
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state) => ({ view: state.view }),
      onRehydrateStorage: () => () => {
        useStaffViewStore.setState({ hydrated: true });
      },
    }
  )
);

function markStaffViewHydrated() {
  if (!useStaffViewStore.getState().hydrated) {
    useStaffViewStore.setState({ hydrated: true });
  }
}

useStaffViewStore.persist.onFinishHydration(markStaffViewHydrated);

if (useStaffViewStore.persist.hasHydrated()) {
  markStaffViewHydrated();
}

if (typeof window !== 'undefined') {
  window.setTimeout(markStaffViewHydrated, 0);
}
