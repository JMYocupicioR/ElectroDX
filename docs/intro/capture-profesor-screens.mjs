/**
 * Captura pantallas reales de ElectroDx para la presentación del profesor.
 * Uso (con `npm run dev` en 5173):
 *   node docs/intro/capture-profesor-screens.mjs
 * Con sesión de profesor (después de iniciar sesión una vez en Chromium):
 *   se guarda docs/intro/screenshots/.auth.json
 */
import { mkdirSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const root = dirname(fileURLToPath(import.meta.url));
const outDir = join(root, 'screenshots');
const authFile = join(outDir, '.auth.json');
const base = process.env.ELECTODX_URL || 'http://localhost:5173';

mkdirSync(outDir, { recursive: true });

const shots = [
  { name: '01-landing', path: '/', wait: 1200 },
  { name: '02-temario', path: '/temario', wait: 1500 },
  { name: '03-login', path: '/auth/login', wait: 800 },
  { name: '04-portal', path: '/portal', wait: 1500 },
  { name: '05-modulo', path: '/modulo/fundamentals', wait: 1500 },
  { name: '06-admin', path: '/admin', wait: 1800 },
  { name: '07-calendario', path: '/admin/calendario', wait: 1800 },
  { name: '08-alumnos', path: '/admin/alumnos', wait: 1800 },
  { name: '09-talleres', path: '/admin/talleres', wait: 1500 },
  { name: '10-temario-admin', path: '/admin/temario', wait: 1500 },
  { name: '11-quizzes', path: '/admin/quizzes', wait: 1500 },
  { name: '12-ejercicios', path: '/admin/ejercicios', wait: 1500 },
];

async function shot(page, name, path, wait) {
  await page.goto(`${base}${path}`, { waitUntil: 'domcontentloaded', timeout: 25000 });
  await page.waitForTimeout(wait);
  await page.screenshot({
    path: join(outDir, `${name}.png`),
    fullPage: false,
  });
}

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({
  viewport: { width: 1440, height: 900 },
  locale: 'es-MX',
  storageState: existsSync(authFile) ? authFile : undefined,
});
const page = await context.newPage();

for (const item of shots) {
  try {
    await shot(page, item.name, item.path, item.wait);
    const url = page.url();
    console.log(`ok ${item.name} → ${url}`);
  } catch (error) {
    console.warn(`fail ${item.name}:`, error instanceof Error ? error.message : error);
  }
}

const url = page.url();
if (url.includes('/admin') && !url.includes('/auth')) {
  await context.storageState({ path: authFile });
  console.log('sesión admin guardada');
}

await browser.close();
