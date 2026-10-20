// OpenNext copies every .env* file it finds into the Worker bundle
// (.open-next/cloudflare/next-env.mjs), so a deploy built beside a dev
// .env.local ships those values. Deploy builds take env from CI or `op run`.
import { readdirSync } from 'node:fs';

const allowed = new Set(['.env.example', '.env.op']);
const found = readdirSync(new URL('..', import.meta.url)).filter(
  (name) => name.startsWith('.env') && !allowed.has(name),
);
if (found.length > 0) {
  console.error(
    `Refusing to build a deployable bundle: move ${found.join(', ')} aside first.`,
  );
  process.exit(1);
}
