import fs from 'node:fs';
import path from 'node:path';

const forbidden = [
  /TempMed2026/,
  /65da8s675f8s75fda675s8d76as87d5as675da/,
  /sb_publishable_[A-Za-z0-9_-]+/,
];

const roots = ['src', 'supabase', 'vite.config.ts', '.env.example'];
const skip = /node_modules|dist|lessonExpansions|topic_quizzes_pending|legacy_local_quizzes/;

function walk(p) {
  const st = fs.statSync(p);
  if (st.isDirectory()) {
    for (const name of fs.readdirSync(p)) {
      if (skip.test(name)) continue;
      walk(path.join(p, name));
    }
    return;
  }
  if (!/\.(ts|tsx|js|mjs|sql|md|example)$/.test(p)) return;
  if (skip.test(p)) return;
  const text = fs.readFileSync(p, 'utf8');
  for (const re of forbidden) {
    if (re.test(text)) {
      console.error(`Possible secret in ${p}`);
      process.exitCode = 1;
    }
  }
}

for (const root of roots) {
  if (fs.existsSync(root)) walk(root);
}

if (process.exitCode) {
  console.error('Secret check failed');
  process.exit(1);
}
console.log('Secret check passed');
