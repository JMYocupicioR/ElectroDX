import { lazy, ComponentType } from 'react';

const RETRY_KEY = 'neurosafe_chunk_reloaded';
const RETRY_COOLDOWN_MS = 15000;

export function lazyWithRetry<T extends ComponentType<any>>(
  componentImport: () => Promise<{ default: T }>
) {
  return lazy(async () => {
    try {
      const component = await componentImport();
      // En carga exitosa, limpiar el marcador para futuras navegaciones
      sessionStorage.removeItem(RETRY_KEY);
      return component;
    } catch (error: any) {
      const errorMessage = String(error?.message || '');
      const isChunkOrModuleError =
        errorMessage.includes('dynamically imported module') ||
        errorMessage.includes('Failed to fetch') ||
        errorMessage.includes('Loading chunk') ||
        errorMessage.includes('Expected a JavaScript') ||
        errorMessage.includes('MIME type') ||
        error?.name === 'ChunkLoadError';

      const lastReload = sessionStorage.getItem(RETRY_KEY);
      const now = Date.now();
      const hasRecentlyReloaded = lastReload && now - parseInt(lastReload, 10) < RETRY_COOLDOWN_MS;

      if (isChunkOrModuleError && !hasRecentlyReloaded) {
        console.warn('[Vite/NeuroSAFE] Error de módulo desactualizado por nuevo despliegue. Recargando automáticamente...', error);
        sessionStorage.setItem(RETRY_KEY, now.toString());

        // Actualizar registros de service worker si existen
        if ('serviceWorker' in navigator) {
          navigator.serviceWorker.getRegistrations().then((regs) => {
            regs.forEach((reg) => reg.update());
          }).catch(() => {});
        }

        window.location.reload();
        // Devolver una promesa pendiente mientras se recarga la página
        return new Promise<{ default: T }>(() => {});
      }

      // Si ya se recargó recientemente o es otro error, propagar al ErrorBoundary
      throw error;
    }
  });
}
