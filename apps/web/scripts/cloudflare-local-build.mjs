import { readFileSync } from 'node:fs';
import { spawn } from 'node:child_process';
import { createRequire } from 'node:module';
const require = createRequire(process.cwd() + '/package.json');
const { parse } = require('dotenv');
const original = parse(readFileSync('.env.local'));
const fixture = parse(readFileSync('.dev.vars'));
// Next and OpenNext copy dotenv into build output: explicitly blank every
// original value first; retain only public/read-only build settings for QA.
const env = { ...process.env };
for (const key of Object.keys(original)) env[key] = '';
for (const [key, value] of Object.entries(original)) {
  if (key.startsWith('NEXT_PUBLIC_') && !/SENTRY|POSTHOG|META_PIXEL/.test(key))
    env[key] = value;
}
Object.assign(env, fixture, {
  SENTRY_AUTH_TOKEN: '',
  NEXT_TELEMETRY_DISABLED: '1',
});
const child = spawn('pnpm', ['exec', 'opennextjs-cloudflare', 'build'], {
  env,
  stdio: 'inherit',
});
child.on('exit', (code) => process.exit(code ?? 1));
