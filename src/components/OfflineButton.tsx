import { useState } from 'react';
import { Download, CheckCircle, Trash2, Loader2, WifiOff, CloudOff } from 'lucide-react';
import { useOfflineStore } from '../stores/offlineStore';

interface OfflineButtonProps {
  moduleId: string;
  /** Compact mode for card views */
  compact?: boolean;
  className?: string;
}

export function OfflineButton({ moduleId, compact = false, className = '' }: OfflineButtonProps) {
  const { moduleStatus, isCaching, isSupported, cacheModule, removeModule } = useOfflineStore();
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  const status = moduleStatus[moduleId];
  const isCached = status?.cached ?? false;
  const isCurrentlyCaching = isCaching === moduleId;

  if (!isSupported) {
    return compact ? null : (
      <div className={`flex items-center gap-1.5 text-xs text-slate-400 dark:text-slate-500 ${className}`}>
        <CloudOff size={14} />
        <span>Offline no disponible</span>
      </div>
    );
  }

  // Currently downloading
  if (isCurrentlyCaching) {
    return (
      <button
        disabled
        className={`
          inline-flex items-center gap-2 rounded-lg font-medium transition-all
          bg-blue-500/10 text-blue-400 border border-blue-500/20 cursor-wait
          ${compact ? 'px-2.5 py-1.5 text-xs' : 'px-4 py-2 text-sm'}
          ${className}
        `}
      >
        <Loader2 size={compact ? 14 : 16} className="animate-spin" />
        <span>{compact ? 'Descargando…' : 'Descargando módulo…'}</span>
      </button>
    );
  }

  // Already cached
  if (isCached) {
    if (showConfirmDelete) {
      return (
        <div className={`inline-flex items-center gap-1.5 ${className}`}>
          <button
            onClick={() => {
              removeModule(moduleId);
              setShowConfirmDelete(false);
            }}
            className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium
              bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition-all"
          >
            <Trash2 size={12} />
            Eliminar
          </button>
          <button
            onClick={() => setShowConfirmDelete(false)}
            className="rounded-lg px-2.5 py-1.5 text-xs font-medium
              bg-slate-500/10 text-slate-400 border border-slate-500/20 hover:bg-slate-500/20 transition-all"
          >
            Cancelar
          </button>
        </div>
      );
    }

    return (
      <button
        onClick={() => setShowConfirmDelete(true)}
        title="Disponible offline — clic para opciones"
        className={`
          group inline-flex items-center gap-2 rounded-lg font-medium transition-all
          bg-emerald-500/10 text-emerald-400 border border-emerald-500/20
          hover:bg-emerald-500/15
          ${compact ? 'px-2.5 py-1.5 text-xs' : 'px-4 py-2 text-sm'}
          ${className}
        `}
      >
        <CheckCircle size={compact ? 14 : 16} />
        <span>{compact ? 'Offline ✓' : 'Disponible offline'}</span>
      </button>
    );
  }

  // Not cached — show download button
  return (
    <button
      onClick={() => cacheModule(moduleId)}
      disabled={isCaching !== null}
      title="Descargar para acceso sin internet"
      className={`
        group inline-flex items-center gap-2 rounded-lg font-medium transition-all
        bg-blue-500/10 text-blue-400 border border-blue-500/20
        hover:bg-blue-500/20 hover:border-blue-400/40 hover:shadow-lg hover:shadow-blue-500/10
        disabled:opacity-50 disabled:cursor-not-allowed
        ${compact ? 'px-2.5 py-1.5 text-xs' : 'px-4 py-2 text-sm'}
        ${className}
      `}
    >
      <Download size={compact ? 14 : 16} className="group-hover:animate-bounce" />
      <span>{compact ? 'Descargar' : 'Descargar offline'}</span>
    </button>
  );
}

/** Offline indicator badge for the header */
export function OfflineIndicator() {
  const { isOnline } = useOfflineStore();

  if (isOnline) return null;

  return (
    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full 
      bg-amber-500/15 text-amber-400 border border-amber-500/20 text-xs font-medium
      animate-pulse">
      <WifiOff size={12} />
      <span>Sin conexión</span>
    </div>
  );
}

/** Button to download ALL modules */
export function DownloadAllButton({ moduleIds }: { moduleIds: string[] }) {
  const { moduleStatus, isCaching, isSupported, cacheAllModules } = useOfflineStore();
  
  if (!isSupported) return null;

  const allCached = moduleIds.every(id => moduleStatus[id]?.cached);
  const cachedCount = moduleIds.filter(id => moduleStatus[id]?.cached).length;
  const isDownloading = isCaching !== null;

  if (allCached) {
    return (
      <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium
        bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
        <CheckCircle size={16} />
        <span>Todo el contenido disponible offline</span>
      </div>
    );
  }

  return (
    <button
      onClick={() => cacheAllModules(moduleIds)}
      disabled={isDownloading}
      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold
        bg-gradient-to-r from-blue-500 to-indigo-500 text-white
        hover:from-blue-400 hover:to-indigo-400
        shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40
        disabled:opacity-50 disabled:cursor-wait
        transition-all duration-200"
    >
      {isDownloading ? (
        <>
          <Loader2 size={16} className="animate-spin" />
          <span>Descargando… ({cachedCount}/{moduleIds.length})</span>
        </>
      ) : (
        <>
          <Download size={16} />
          <span>Descargar todo ({cachedCount}/{moduleIds.length})</span>
        </>
      )}
    </button>
  );
}
