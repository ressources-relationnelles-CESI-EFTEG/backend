/**
 * Applies Prisma migrations against the test database.
 * Usage: node test/run-migrate.js
 */
const { execSync } = require('child_process');
const { readFileSync } = require('fs');
const { resolve } = require('path');

const envPath = resolve(process.cwd(), '.env.test');
let dbUrl;

try {
  const content = readFileSync(envPath, 'utf8');
  const match = content.match(/DATABASE_URL="([^"]+)"/);
  if (!match) throw new Error('DATABASE_URL not found in .env.test');
  dbUrl = match[1];
} catch (err) {
  console.error('Error reading .env.test:', err.message);
  process.exit(1);
}

console.log('Applying migrations to test DB…');
execSync('npx prisma migrate deploy', {
  env: { ...process.env, DATABASE_URL: dbUrl },
  stdio: 'inherit',
});
console.log('✓ Migrations applied.');
