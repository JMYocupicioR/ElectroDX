import { CheckCircle, CloudOff, Download, Loader2, WifiOff } from 'lucide-react';
import { useOfflineStore } from '../stores/offlineStore';

interface OfflineTopicBadgeProps {
  moduleId: string;
  lang?: 'es' | 'en';
  className?: string;
}

export function OfflineTopicBadge({
  moduleId,
  lang = 'es',
  className = '',
}: OfflineTopicBadgeProps) {
  const { moduleStatus, isCaching, isSupported, isOnline, cacheModule } = useOfflineStore();
  const isCached = moduleStatus[moduleId]?.cached ?? false;
  const isCurrentlyCaching = isCaching === moduleId;
  const es = lang === 'es';

  const chip = `inline-flex items-center gap-1 rounded-md font-medium px-2 py-0.5 text-xs ${className}`;

  if (!isSupported) {
    return (
      <span
        className={`${chip} bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400`}
        title={es ? 'Este navegador no permite guardar el temario offline' : 'This browser cannot store the syllabus offline'}
      >
        <CloudOff className="w-3.5 h-3.5" />
        {es ? 'Sin offline' : 'No offline'}
      </span>
    );
  }

  if (isCurrentlyCaching) {
    return (
      <span
        className={`${chip} bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300`}
        title={es ? 'Guardando el módulo para usarlo sin internet' : 'Saving this module for offline use'}
      >
        <Loader2 className="w-3.5 h-3.5 animate-spin" />
        {es ? 'Descargando…' : 'Downloading…'}
      </span>
    );
  }

  if (isCached) {
    return (
      <span
        className={`${chip} bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300`}
        title={es ? 'Temario disponible sin internet. El avance se guarda aquí y se sube al volver en línea.' : 'Syllabus available offline. Progress is stored here and synced when you are back online.'}
      >
        <CheckCircle className="w-3.5 h-3.5" />
        Offline
      </span>
    );
  }

  if (!isOnline) {
    return (
      <span
        className={`${chip} bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300`}
        title={es ? 'No hay copia en este dispositivo. Conéctate para descargarlo.' : 'No copy on this device. Connect to download it.'}
      >
        <WifiOff className="w-3.5 h-3.5" />
        {es ? 'No descargado' : 'Not downloaded'}
      </span>
    );
  }

  return (
    <button
      type="button"
      onClick={(event) => {
        event.stopPropagation();
        void cacheModule(moduleId);
      }}
      disabled={isCaching !== null}
      title={es ? 'Descargar este módulo para leerlo y completarlo sin internet' : 'Download this module to read and complete it offline'}
      className={`${chip} bg-sky-100 text-sky-800 dark:bg-sky-900/40 dark:text-sky-300 hover:bg-sky-200/80 dark:hover:bg-sky-900/70 transition-colors disabled:opacity-50 disabled:cursor-not-allowed`}
    >
      <Download className="w-3.5 h-3.5" />
      {es ? 'Descargar' : 'Download'}
    </button>
  );
}
