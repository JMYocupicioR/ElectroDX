import { mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const root = dirname(fileURLToPath(import.meta.url));
const outDir = join(root, 'screenshots');
mkdirSync(outDir, { recursive: true });

const shots = [
  { name: '01-landing', path: '/' },
  { name: '02-temario', path: '/temario' },
  { name: '03-login', path: '/auth/login' },
  { name: '04-portal', path: '/portal' },
  { name: '05-modulo', path: '/modulo/fundamentals' },
  { name: '06-admin', path: '/admin' },
  { name: '07-calendario', path: '/admin/calendario' },
  { name: '08-alumnos', path: '/admin/alumnos' },
  { name: '09-talleres', path: '/admin/talleres' },
  { name: '10-temario-admin', path: '/admin/temario' },
  { name: '11-quizzes', path: '/admin/quizzes' },
  { name: '12-ejercicios', path: '/admin/ejercicios' },
];

const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
const context = browser.contexts()[0] || (await browser.newContext({ viewport: { width: 1440, height: 900 } }));
const page = context.pages()[0] || (await context.newPage());
await page.setViewportSize({ width: 1440, height: 900 });

for (const item of shots) {
  try {
    await page.goto(`http://localhost:5173${item.path}`, { waitUntil: 'domcontentloaded', timeout: 25000 });
    await page.waitForTimeout(1800);
    await page.screenshot({ path: join(outDir, `${item.name}.png`), fullPage: false });
    console.log(`ok ${item.name} → ${page.url()}`);
  } catch (error) {
    console.warn(`fail ${item.name}:`, error instanceof Error ? error.message : error);
  }
}

await browser.close();
