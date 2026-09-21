import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from './Button';

interface ErrorFallbackProps {
  error: Error;
  resetErrorBoundary: () => void;
}

export function ErrorFallback({ error, resetErrorBoundary }: ErrorFallbackProps) {
  const isChunkOrVersionError =
    /dynamically imported module|failed to fetch|loading chunk|failed to load module script|mime type/i.test(
      error?.message || ''
    );

  const handleAction = async () => {
    if (isChunkOrVersionError) {
      // Limpiar caches de la CacheStorage API para asegurar descarga de nuevos bundles
      if ('caches' in window) {
        try {
          const keys = await caches.keys();
          await Promise.all(keys.map((k) => caches.delete(k)));
        } catch (e) {
          console.warn('[ErrorFallback] Error al limpiar caches:', e);
        }
      }

      // Actualizar registros del Service Worker
      if ('serviceWorker' in navigator) {
        try {
          const regs = await navigator.serviceWorker.getRegistrations();
          for (const reg of regs) {
            await reg.update();
          }
        } catch (e) {
          console.warn('[ErrorFallback] Error al actualizar SW:', e);
        }
      }

      sessionStorage.removeItem('neurosafe_chunk_reloaded');
      window.location.reload();
    } else {
      resetErrorBoundary();
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 p-4">
      <div className="max-w-md w-full p-6 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 text-center">
        <div
          className={`w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center ${
            isChunkOrVersionError
              ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400'
              : 'bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400'
          }`}
        >
          {isChunkOrVersionError ? (
            <RefreshCw className="w-7 h-7 animate-spin-reverse" />
          ) : (
            <AlertCircle className="w-7 h-7" />
          )}
        </div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
          {isChunkOrVersionError ? 'Actualización de la plataforma' : 'Algo salió mal'}
        </h2>
        <p className="text-sm text-slate-600 dark:text-slate-300 mb-6 leading-relaxed">
          {isChunkOrVersionError
            ? 'Se ha detectado una versión actualizada de ElectroDx Diplomado. Por favor, pulsa el botón para recargar y sincronizar con los últimos módulos.'
            : error.message}
        </p>
        <Button
          onClick={handleAction}
          className="w-full justify-center py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl shadow-md transition-all"
        >
          {isChunkOrVersionError ? 'Actualizar y recargar' : 'Intentar de nuevo'}
        </Button>
      </div>
    </div>
  );
}