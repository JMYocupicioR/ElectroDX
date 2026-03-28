import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import {
  requestPersistentStorage,
  reCacheAppShell,
  isIOSStandalone,
} from './utils/pwaUtils';

// ── PWA iOS Hardening ──
// Request persistent storage + re-cache App Shell on every launch
// This combats the iOS 7-day cache eviction policy
if ('serviceWorker' in navigator) {
  requestPersistentStorage();
  reCacheAppShell();

  if (isIOSStandalone()) {
    console.log('[PWA] Running in iOS standalone mode');
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
