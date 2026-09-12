import { useLayoutEffect } from 'react';
import { useSettingsStore } from '../stores/settingsStore';

export function useTheme() {
  const { isDarkMode } = useSettingsStore();

  useLayoutEffect(() => {
    const root = document.documentElement;
    
    // Solo agregar la clase de transición una vez
    if (!root.classList.contains('theme-transition')) {
      root.classList.add('theme-transition');
    }
    
    if (isDarkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [isDarkMode]);

  return { isDarkMode };
}