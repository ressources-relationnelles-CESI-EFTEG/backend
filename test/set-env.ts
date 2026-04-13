/**
 * Jest setupFile — loads .env.test before each test worker boots.
 * Overrides any DATABASE_URL already set so tests always hit the test DB.
 */
import { readFileSync } from 'fs';
import { resolve } from 'path';

const envPath = resolve(process.cwd(), '.env.test');

try {
  const content = readFileSync(envPath, 'utf8');
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx === -1) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    const raw = trimmed.slice(eqIdx + 1).trim();
    process.env[key] = raw.replace(/^"(.*)"$/, '$1');
  }
} catch {
  // .env.test absent → tests fall back to .env (dev DB)
}
