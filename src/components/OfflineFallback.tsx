import { WifiOff, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';

/**
 * OfflineFallback
 * Shown when the user navigates to a non-cached page while offline.
 * Provides a retry button and information about offline capabilities.
 */
export default function OfflineFallback() {
  const handleRetry = () => {
    window.location.reload();
  };

  return (
    <div className="flex items-center justify-center min-h-[60vh] px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="text-center max-w-sm"
      >
        {/* Icon */}
        <div className="mx-auto w-20 h-20 rounded-2xl bg-gray-100 dark:bg-gray-800 
                        flex items-center justify-center mb-6 shadow-inner">
          <WifiOff className="w-10 h-10 text-gray-400 dark:text-gray-500" />
        </div>

        {/* Title */}
        <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-2">
          Sin conexión
        </h2>

        {/* Description */}
        <p className="text-gray-500 dark:text-gray-400 text-sm mb-6 leading-relaxed">
          No hay conexión a internet. Los módulos que descargaste previamente siguen disponibles.
        </p>

        {/* Retry button */}
        <button
          onClick={handleRetry}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl
                     bg-blue-500 hover:bg-blue-600 active:scale-95
                     text-white font-medium text-sm transition-all shadow-lg shadow-blue-500/25"
        >
          <RefreshCw className="w-4 h-4" />
          Reintentar conexión
        </button>

        {/* Tip */}
        <p className="mt-6 text-xs text-gray-400 dark:text-gray-500">
          💡 Puedes descargar módulos para uso sin conexión desde el menú de cada módulo.
        </p>
      </motion.div>
    </div>
  );
}
