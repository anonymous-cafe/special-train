import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const middleware = path.join(root, 'src', 'middleware.ts');
const middlewareJs = path.join(root, 'src', 'middleware.js');
const proxy = path.join(root, 'src', 'proxy.ts');
const proxyJs = path.join(root, 'src', 'proxy.js');
const hasMiddleware = fs.existsSync(middleware) || fs.existsSync(middlewareJs);
const hasProxy = fs.existsSync(proxy) || fs.existsSync(proxyJs);

let failed = false;
if (hasMiddleware && hasProxy) {
  failed = true;
  console.error('\n[GrowthSprint365 doctor] ERROR: Both src/middleware.* and src/proxy.* exist.');
  console.error('Next.js 16 uses proxy.ts for this project. Remove the legacy src/middleware.ts file.');
  console.error('This usually happens when a new release is copied over an older project folder.\n');
}

const envPath = path.join(root, '.env.local');
if (fs.existsSync(envPath)) {
  const lines = fs.readFileSync(envPath, 'utf8').split(/\r?\n/);
  const seen = new Map();
  const duplicates = new Set();
  const placeholders = [];
  for (const raw of lines) {
    const line = raw.trim();
    if (!line || line.startsWith('#') || !line.includes('=')) continue;
    const idx = line.indexOf('=');
    const key = line.slice(0, idx).trim();
    const value = line.slice(idx + 1).trim();
    if (seen.has(key)) duplicates.add(key);
    seen.set(key, value);
    if (/YOUR_|REPLACE_|CHANGE_ME|your-|your_|example|placeholder/i.test(value)) placeholders.push(key);
  }
  if (duplicates.size) {
    console.warn(`[GrowthSprint365 doctor] WARNING: duplicate keys in .env.local: ${[...duplicates].join(', ')}`);
    console.warn('The last occurrence wins. Keep each environment variable only once.');
  }
  if (placeholders.length) {
    console.warn(`[GrowthSprint365 doctor] WARNING: placeholder values remain in .env.local: ${[...new Set(placeholders)].join(', ')}`);
  }
} else {
  console.warn('[GrowthSprint365 doctor] WARNING: .env.local not found. Copy .env.local.example and add your real local values.');
}

if (failed) process.exit(1);
console.log('[GrowthSprint365 doctor] Project structure check passed.');
