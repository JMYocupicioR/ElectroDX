/**
 * Script para aplicar la migración del motor de exámenes a Supabase
 * usando el cliente JS y llamadas a la Management API.
 * 
 * Requiere SUPABASE_SERVICE_ROLE_KEY en el entorno.
 * Instrucciones: 
 *   1. Añade SUPABASE_SERVICE_ROLE_KEY=<tu-service-key> al .env
 *   2. Ejecuta: node scripts/apply_exam_migration.js
 */

require('dotenv').config({ path: '.env.local' });
const fs = require('fs');
const https = require('https');

const PROJECT_REF = 'pubodzfmiqmawrfnmrce';
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SERVICE_KEY) {
  console.error('ERROR: SUPABASE_SERVICE_ROLE_KEY not found in environment.');
  console.error('Please add it to .env.local: SUPABASE_SERVICE_ROLE_KEY=eyJ...');
  process.exit(1);
}

const migrationSQL = fs.readFileSync('supabase/migrations/20260912100000_custom_exams_and_questions.sql', 'utf8');
const seedSQL = fs.readFileSync('supabase/seed_emg_questions.sql', 'utf8');

async function executeSQL(sql, label) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({ query: sql });
    const options = {
      hostname: `${PROJECT_REF}.supabase.co`,
      path: '/rest/v1/rpc/exec_sql',
      method: 'POST',
      headers: {
        'apikey': SERVICE_KEY,
        'Authorization': `Bearer ${SERVICE_KEY}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body),
        'Prefer': 'return=minimal'
      }
    };
    
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', d => data += d);
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          console.log(`✅ ${label}: OK (${res.statusCode})`);
          resolve(data);
        } else {
          console.error(`❌ ${label}: FAILED (${res.statusCode}): ${data.slice(0, 300)}`);
          reject(new Error(`HTTP ${res.statusCode}: ${data}`));
        }
      });
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

// Split migration into individual statements (simple split on semicolons)
function splitStatements(sql) {
  // Split by semicolons but be careful with functions
  return sql
    .split(/;\s*\n/)
    .map(s => s.trim())
    .filter(s => s.length > 0 && !s.startsWith('--'));
}

async function main() {
  console.log('\n🚀 Applying exam system migration to Supabase...\n');
  
  try {
    console.log('📋 Step 1: Running migration schema...');
    await executeSQL(migrationSQL, 'Schema Migration');
    
    console.log('\n📋 Step 2: Seeding 85 EMG questions...');
    await executeSQL(seedSQL, 'EMG Questions Seed');
    
    console.log('\n✅ All done! Database is ready.');
  } catch (err) {
    console.error('\n❌ Migration failed:', err.message);
    process.exit(1);
  }
}

main();
