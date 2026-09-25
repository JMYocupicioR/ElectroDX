import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import path from 'path';
import { lookupSepCedula, normalizeCedula } from './server/sepCedulaLookup.js';

function sepCedulaProxyPlugin(): Plugin {
  return {
    name: 'sep-cedula-proxy',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url?.startsWith('/api/verify-cedula')) {
          return next();
        }
        res.setHeader('Access-Control-Allow-Origin', 'http://localhost:5173');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
        res.setHeader('Vary', 'Origin');

        if (req.method === 'OPTIONS') {
          res.statusCode = 204;
          res.end();
          return;
        }

        try {
          const url = new URL(req.url, 'http://localhost');
          let cedula = url.searchParams.get('cedula');

          if (!cedula && req.method === 'POST') {
            const body = await new Promise<string>((resolve) => {
              let data = '';
              req.on('data', (chunk) => (data += chunk));
              req.on('end', () => resolve(data));
            });
            try {
              const parsed = JSON.parse(body);
              cedula = parsed.cedula;
            } catch {}
          }

          if (!cedula || typeof cedula !== 'string') {
            res.statusCode = 400;
            res.setHeader('Content-Type', 'application/json; charset=utf-8');
            res.end(JSON.stringify({ success: false, error: 'Número de cédula requerido' }));
            return;
          }

          const cleanCedula = normalizeCedula(cedula);
          if (cleanCedula.length < 5 || cleanCedula.length > 10) {
            res.statusCode = 400;
            res.setHeader('Content-Type', 'application/json; charset=utf-8');
            res.end(JSON.stringify({ success: false, error: 'Formato de cédula no válido' }));
            return;
          }

          const items = await lookupSepCedula(cleanCedula);
          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json; charset=utf-8');
          res.end(JSON.stringify({ success: true, items }));
        } catch (err: any) {
          res.statusCode = typeof err?.status === 'number' ? err.status : 500;
          res.setHeader('Content-Type', 'application/json; charset=utf-8');
          res.end(JSON.stringify({ success: false, error: err?.message || 'Error interno al consultar SEP' }));
        }
      });
    },
  };
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    sepCedulaProxyPlugin(),
    VitePWA({
      registerType: 'prompt',
      devOptions: { enabled: false },
      includeAssets: ['icons/*.png', 'icons/splash/*.png'],
      manifest: false, // Use the manifest.json in /public
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff,woff2,json}'],
        // iOS Safari aggressively caches sw.js — these ensure instant updates
        cleanupOutdatedCaches: true,
        skipWaiting: false,
        clientsClaim: false,
        importScripts: ['/custom-sw.js'],
        // SPA offline fallback — serves index.html for any navigation request
        navigateFallback: '/index.html',
        navigateFallbackDenylist: [/^\/api/, /^\/icons\/splash\//],
        runtimeCaching: [
          {
            // Google Fonts stylesheets
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'google-fonts-stylesheets',
              expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 },
            },
          },
          {
            // Google Fonts webfont files
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-webfonts',
              expiration: { maxEntries: 30, maxAgeSeconds: 60 * 60 * 24 * 365 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            // External images
            urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp)$/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'images-cache',
              expiration: { maxEntries: 100, maxAgeSeconds: 60 * 60 * 24 * 30 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
      },
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      pagedjs: path.resolve(__dirname, './node_modules/pagedjs/src/index.js'),
    },
    // Emitted .js siblings must not shadow the .ts/.tsx source (duplicate Auth context).
    extensions: ['.mjs', '.mts', '.ts', '.tsx', '.jsx', '.js', '.json'],
  },
  optimizeDeps: {
    include: ['@react-pdf/renderer', 'qrcode'],
  },
  test: {
    globals: true,
    environment: 'node',
  },
});