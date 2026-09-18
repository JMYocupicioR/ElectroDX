import { Moon, Sun } from 'lucide-react';
import { useSettingsStore } from '../stores/settingsStore';

export function Settings() {
  const { isDarkMode, toggleDarkMode } = useSettingsStore();

  return (
    <div className="flex items-center space-x-4">
      <button
        onClick={toggleDarkMode}
        className={`p-2 rounded-lg ${
          isDarkMode
            ? 'bg-gray-700 text-yellow-400 hover:bg-gray-600'
            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
        }`}
        title={isDarkMode ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
      >
        {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
      </button>
    </div>
  );
}