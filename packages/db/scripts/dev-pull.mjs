// Refresh the local fallback copy of the dev database from the hosted one.
// `next dev` uses this copy when Cloudflare is unreachable (see the Next config
// in apps/web). Run it before going offline.
import { execFileSync } from 'node:child_process';
import { mkdirSync, rmSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const db = join(dirname(fileURLToPath(import.meta.url)), '..');
const persist = join(db, '.wrangler/state');
const dump = join(persist, 'dev-pull.sql');
const config = ['-c', join(db, '../../apps/web/wrangler.dev.jsonc')];
const wrangler = (...args) =>
  execFileSync('pnpm', ['exec', 'wrangler', ...args], {
    cwd: db,
    stdio: ['ignore', 'ignore', 'inherit'],
  });

mkdirSync(persist, { recursive: true, mode: 0o700 });
console.log('Exporting hosted auntie-marlenes-dev...');
wrangler(
  'd1',
  'export',
  'auntie-marlenes-dev',
  '--remote',
  '--output',
  dump,
  ...config,
);
rmSync(join(persist, 'v3', 'd1'), { recursive: true, force: true });
console.log('Loading the local copy...');
wrangler(
  'd1',
  'execute',
  'auntie-marlenes-dev',
  '--local',
  '--persist-to',
  persist,
  '--file',
  dump,
  '--yes',
  ...config,
);
rmSync(dump, { force: true });
console.log(`Local dev copy refreshed (${persist}).`);
