import { Link } from 'react-router-dom';
import { Brain, Stethoscope, ClipboardList, Activity, ArrowRight } from 'lucide-react';
import { portalCopy } from '../../i18n/portal';
import { useSettingsStore } from '../../stores/settingsStore';

export default function SimulatorsHubPage() {
  const lang = useSettingsStore((s) => s.language);
  const copy = lang === 'en' ? portalCopy.en : portalCopy.es;

  const items = [
    {
      to: '/herramientas/plexo-braquial',
      title: lang === 'en' ? 'Brachial plexus mapper' : 'Mapa del plexo braquial',
      desc: lang === 'en' ? 'Localize plexus lesions with a structured algorithm.' : 'Localice lesiones de plexo con un algoritmo estructurado.',
      icon: Brain,
    },
    {
      to: '/ejercicios',
      title: lang === 'en' ? 'EMG clinical cases' : 'Casos clínicos EMG',
      desc: lang === 'en' ? 'Guided cases with findings and differential diagnosis.' : 'Casos guiados con hallazgos y diferencial.',
      icon: Stethoscope,
    },
    {
      to: '/simuladores/trazos',
      title: lang === 'en' ? 'Clinical traces' : 'Simulador de trazos',
      desc: lang === 'en'
        ? 'Compare normal vs pathologic CMAP/SNAP morphology.'
        : 'Compare morfología normal vs patológica de CMAP/SNAP.',
      icon: Activity,
    },
    {
      to: '/examenes',
      title: lang === 'en' ? 'Board-style exam' : 'Examen tipo consejo',
      desc: lang === 'en' ? 'Timed simulator with gap analysis.' : 'Simulador cronometrado con análisis de brechas.',
      icon: ClipboardList,
    },
  ];

  return (
    <main id="contenido-principal" className="max-w-4xl mx-auto px-4 pt-24 pb-16">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">{copy.simulators}</h1>
      <p className="text-sm text-slate-500 mb-8">
        {lang === 'en'
          ? 'All premium simulators in one place.'
          : 'Todos los simuladores premium en un solo lugar.'}
      </p>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((item) => (
          <Link
            key={item.to}
            to={item.to}
            className="min-h-[44px] p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-blue-400 transition"
          >
            <item.icon className="w-6 h-6 text-blue-600 mb-3" />
            <h2 className="font-bold text-slate-900 dark:text-white mb-1">{item.title}</h2>
            <p className="text-xs text-slate-500 mb-3">{item.desc}</p>
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600">
              {copy.continue} <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </Link>
        ))}
      </div>
    </main>
  );
}
