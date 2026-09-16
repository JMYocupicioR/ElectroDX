import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import path from 'path';

function sepCedulaProxyPlugin(): Plugin {
  let cachedToken: string | null = null;
  let tokenExpiresAt = 0;

  async function getSepToken() {
    if (cachedToken && Date.now() < tokenExpiresAt) {
      return cachedToken;
    }
    const tokenRes = await fetch('https://cedulaprofesional.sep.gob.mx/api/auth/token', {
      method: 'GET',
      headers: {
        'X-Client-Id': 'rnp-angular-app-prod',
        'X-API-Key': '65da8s675f8s75fda675s8d76as87d5as675da',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      },
    });
    if (!tokenRes.ok) {
      throw new Error(`Error al autenticar con SEP: ${tokenRes.statusText}`);
    }
    const tokenData = (await tokenRes.json()) as { access_token?: string };
    if (!tokenData.access_token) {
      throw new Error('No se recibió access_token de la SEP');
    }
    cachedToken = tokenData.access_token;
    tokenExpiresAt = Date.now() + 50 * 60 * 1000;
    return cachedToken;
  }

  return {
    name: 'sep-cedula-proxy',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url?.startsWith('/api/verify-cedula')) {
          return next();
        }
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');

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

          const cleanCedula = cedula.replace(/\D/g, '');
          if (cleanCedula.length < 5 || cleanCedula.length > 10) {
            res.statusCode = 400;
            res.setHeader('Content-Type', 'application/json; charset=utf-8');
            res.end(JSON.stringify({ success: false, error: 'Formato de cédula no válido' }));
            return;
          }

          const token = await getSepToken();
          const queryRes = await fetch(
            'https://cedulaprofesional.sep.gob.mx/api/rnp/solr/profesionista/consultar/byDetalle',
            {
              method: 'POST',
              headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
              },
              body: JSON.stringify({ numCedula: cleanCedula }),
            }
          );

          if (!queryRes.ok) {
            res.statusCode = queryRes.status;
            res.setHeader('Content-Type', 'application/json; charset=utf-8');
            res.end(JSON.stringify({ success: false, error: `Error en servicio SEP: ${queryRes.status}` }));
            return;
          }

          const items = (await queryRes.json()) as any[];
          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json; charset=utf-8');
          res.end(JSON.stringify({ success: true, items }));
        } catch (err: any) {
          res.statusCode = 500;
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
      registerType: 'autoUpdate',
      devOptions: { enabled: false },
      includeAssets: ['icons/*.png', 'icons/splash/*.png'],
      manifest: false, // Use the manifest.json in /public
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff,woff2,json}'],
        // iOS Safari aggressively caches sw.js — these ensure instant updates
        cleanupOutdatedCaches: true,
        skipWaiting: true,
        clientsClaim: true,
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
    },
  },
  test: {
    globals: true,
    environment: 'node',
  },
});