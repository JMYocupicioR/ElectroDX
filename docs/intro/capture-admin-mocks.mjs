import { mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { chromium } from 'playwright';

const root = dirname(fileURLToPath(import.meta.url));
const outDir = join(root, 'screenshots');
mkdirSync(outDir, { recursive: true });
const html = pathToFileURL(join(root, 'admin-mocks.html')).href;

const pages = [
  ['admin', '06-admin'],
  ['cal', '07-calendario'],
  ['alumnos', '08-alumnos'],
  ['talleres', '09-talleres'],
  ['temario', '10-temario-admin'],
  ['quizzes', '11-quizzes'],
  ['ejercicios', '12-ejercicios'],
];

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
for (const [p, name] of pages) {
  await page.goto(`${html}?p=${p}`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(400);
  await page.screenshot({ path: join(outDir, `${name}.png`), fullPage: false });
  console.log('ok', name);
}
await browser.close();
