import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SettingsStore {
  isDarkMode: boolean;
  language: 'es' | 'en';
  toggleDarkMode: () => void;
  setLanguage: (lang: 'es' | 'en') => void;
}

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      isDarkMode: false,
      language: 'es',
      toggleDarkMode: () => set((state) => ({ isDarkMode: !state.isDarkMode })),
      // Idioma temporalmente fijado a español ('es').
      // Se reactivará la traducción instantánea más adelante.
      setLanguage: (_lang) => set({ language: 'es' }),
    }),
    {
      name: 'settings-storage',
      partialize: (state) => ({ isDarkMode: state.isDarkMode, language: 'es' as const }),
      merge: (persistedState: any, currentState) => ({
        ...currentState,
        ...(persistedState || {}),
        language: 'es' as const, // Garantiza español como default absoluto aunque el navegador tuviera 'en' guardado
      }),
    }
  )
);