import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { ErrorBoundary } from 'react-error-boundary';
import App from './App.tsx';
import { AuthProvider } from './contexts/AuthProvider';
import { ErrorFallback } from './components/ErrorFallback';
import './index.css';
import {
  requestPersistentStorage,
  reCacheAppShell,
  isIOSStandalone,
} from './utils/pwaUtils';

// Stale service workers from preview/production builds can intercept Vite dev
// requests and leave a blank page on localhost.
if (import.meta.env.DEV && 'serviceWorker' in navigator) {
  void navigator.serviceWorker.getRegistrations().then((registrations) => {
    for (const registration of registrations) {
      void registration.unregister();
    }
  });
}

// ── Auto-recuperación de módulos diferidos ante nuevos despliegues de Vite ──
window.addEventListener('vite:preloadError', (event) => {
  console.warn('[Vite] Error de precarga de módulo diferido. Recargando para obtener la versión más reciente...', event);
  const reloadKey = 'neurosafe_chunk_reloaded';
  const lastReload = sessionStorage.getItem(reloadKey);
  const now = Date.now();
  if (!lastReload || now - parseInt(lastReload, 10) > 15000) {
    sessionStorage.setItem(reloadKey, now.toString());
    window.location.reload();
  }
});

// ── PWA iOS Hardening (production / installed app only) ──
if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  requestPersistentStorage();
  reCacheAppShell();

  if (isIOSStandalone()) {
    console.log('[PWA] Running in iOS standalone mode');
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <AuthProvider>
        <App />
      </AuthProvider>
    </ErrorBoundary>
  </StrictMode>
);
