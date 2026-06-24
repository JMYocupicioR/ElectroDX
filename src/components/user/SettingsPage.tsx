import { Link } from 'react-router-dom';
import { ArrowLeft, Globe, Moon, Sun } from 'lucide-react';
import { useSettingsStore } from '../../stores/settingsStore';

export default function SettingsPage() {
  const { isDarkMode, toggleDarkMode, language, setLanguage } = useSettingsStore();

  return (
    <div className="pt-24 pb-16 px-4 max-w-2xl mx-auto">
      <Link
        to="/cuenta"
        className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-blue-600 mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Volver a mi cuenta
      </Link>

      <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Ajustes</h1>
      <p className="text-sm text-slate-500 mb-8">Preferencias de la aplicación</p>

      <section className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white/60 dark:bg-slate-900/30 divide-y divide-slate-100 dark:divide-slate-800">
        <SettingRow
          icon={isDarkMode ? Sun : Moon}
          title="Tema"
          description={isDarkMode ? 'Modo oscuro activo' : 'Modo claro activo'}
          action={
            <button
              type="button"
              onClick={toggleDarkMode}
              className="px-4 py-2 rounded-lg text-sm font-medium bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              Cambiar a {isDarkMode ? 'claro' : 'oscuro'}
            </button>
          }
        />
        <SettingRow
          icon={Globe}
          title="Idioma del curso"
          description={language === 'es' ? 'Español' : 'English'}
          action={
            <button
              type="button"
              onClick={() => setLanguage(language === 'es' ? 'en' : 'es')}
              className="px-4 py-2 rounded-lg text-sm font-medium bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              {language === 'es' ? 'English' : 'Español'}
            </button>
          }
        />
      </section>
    </div>
  );
}

function SettingRow({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: typeof Sun;
  title: string;
  description: string;
  action: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-4 p-5">
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800">
          <Icon className="w-4 h-4 text-slate-500" />
        </div>
        <div>
          <p className="font-medium text-slate-900 dark:text-white">{title}</p>
          <p className="text-sm text-slate-500">{description}</p>
        </div>
      </div>
      {action}
    </div>
  );
}
