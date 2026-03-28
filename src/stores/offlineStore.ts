import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { requestPersistentStorage, reCacheAppShell } from '../utils/pwaUtils';

export interface ModuleCacheStatus {
  cached: boolean;
  cachedAt: string | null;
}

interface OfflineStore {
  /** Track cache status per module ID */
  moduleStatus: Record<string, ModuleCacheStatus>;
  /** Current network status */
  isOnline: boolean;
  /** Whether the browser supports Service Workers */
  isSupported: boolean;
  /** Whether a cache operation is in progress */
  isCaching: string | null; // moduleId being cached, or null

  /** Cache a specific module (all its routes) */
  cacheModule: (moduleId: string) => Promise<void>;
  /** Remove a specific module from cache */
  removeModule: (moduleId: string) => Promise<void>;
  /** Cache all modules at once */
  cacheAllModules: (moduleIds: string[]) => Promise<void>;
  /** Set online/offline status */
  setOnline: (online: boolean) => void;
  /** Initialize: check SW support and restore status */
  initialize: () => void;
}

const CACHE_NAME = 'emg-modules-v1';

/**
 * Get all cacheable URLs for a given module.
 * Since our content is statically bundled into JS chunks (via Vite lazy loading),
 * we cache the module page route as an HTML navigation request + 
 * any JS chunk that gets loaded when visiting that module.
 */
function getModuleUrls(moduleId: string): string[] {
  return [
    `/modulo/${moduleId}`,
    `/modulo/${moduleId}/`, // trailing slash variant
  ];
}

export const useOfflineStore = create<OfflineStore>()(
  persist(
    (set, get) => ({
      moduleStatus: {},
      isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
      isSupported: typeof navigator !== 'undefined' && 'serviceWorker' in navigator,
      isCaching: null,

      initialize: () => {
        const isSupported = typeof navigator !== 'undefined' && 'serviceWorker' in navigator;
        set({ isSupported, isOnline: navigator.onLine });

        // Listen for online/offline events
        window.addEventListener('online', () => set({ isOnline: true }));
        window.addEventListener('offline', () => set({ isOnline: false }));

        // iOS 7-day eviction protection:
        // Request persistent storage and re-cache the App Shell on every launch
        if (isSupported) {
          requestPersistentStorage();
          reCacheAppShell();
        }
      },

      cacheModule: async (moduleId: string) => {
        if (!get().isSupported) return;

        set({ isCaching: moduleId });

        try {
          const cache = await caches.open(CACHE_NAME);
          const urls = getModuleUrls(moduleId);

          // Cache the module page routes
          // We use fetch + cache.put to handle SPA routing
          for (const url of urls) {
            try {
              const response = await fetch(url);
              if (response.ok) {
                await cache.put(url, response);
              }
            } catch {
              // If fetch fails for a specific URL, continue with others
              console.warn(`[Offline] Could not cache: ${url}`);
            }
          }

          // Also cache the root index.html (needed for SPA navigation offline)
          try {
            const rootResponse = await fetch('/');
            if (rootResponse.ok) {
              await cache.put('/', rootResponse);
            }
          } catch {
            // Root already cached by SW precache
          }

          set((state) => ({
            moduleStatus: {
              ...state.moduleStatus,
              [moduleId]: {
                cached: true,
                cachedAt: new Date().toISOString(),
              },
            },
            isCaching: null,
          }));
        } catch (error) {
          console.error(`[Offline] Failed to cache module ${moduleId}:`, error);
          set({ isCaching: null });
        }
      },

      removeModule: async (moduleId: string) => {
        try {
          const cache = await caches.open(CACHE_NAME);
          const urls = getModuleUrls(moduleId);

          for (const url of urls) {
            await cache.delete(url);
          }

          set((state) => ({
            moduleStatus: {
              ...state.moduleStatus,
              [moduleId]: { cached: false, cachedAt: null },
            },
          }));
        } catch (error) {
          console.error(`[Offline] Failed to remove module ${moduleId}:`, error);
        }
      },

      cacheAllModules: async (moduleIds: string[]) => {
        const { cacheModule } = get();
        for (const id of moduleIds) {
          await cacheModule(id);
        }
      },

      setOnline: (online: boolean) => set({ isOnline: online }),
    }),
    {
      name: 'offline-storage',
      partialize: (state) => ({
        moduleStatus: state.moduleStatus,
      }),
    }
  )
);
