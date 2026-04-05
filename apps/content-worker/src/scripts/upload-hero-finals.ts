#!/usr/bin/env npx tsx
/**
 * Upload all 6 final hero videos (hero-01 through hero-06) to R2 under
 * content/hero/final/ so they can be reviewed from any device.
 *
 * Run AFTER the Sora batch completes. Prints public URLs at the end.
 *
 * Usage:
 *   npx tsx --env-file=.env src/scripts/upload-hero-finals.ts
 */

import 'dotenv/config';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { uploadFile } from '../storage';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const HERO_VIDEOS_DIR = path.resolve(
  __dirname,
  '../../../../apps/web/public/videos/hero',
);

const FINALS = [
  { filename: 'hero-01-bonnet.mp4', title: 'Scene 1 — The Bonnet Moment' },
  { filename: 'hero-02-mother-daughter.mp4', title: 'Scene 2 — Between Her Knees' },
  { filename: 'hero-03-kitchen-beautician.mp4', title: 'Scene 3 — Kitchen Beautician' },
  { filename: 'hero-04-locs-oil.mp4', title: 'Scene 4 — Anointing the Locs' },
  { filename: 'hero-05-barbershop-fade.mp4', title: 'Scene 5 — The Fade Moment' },
  { filename: 'hero-06-dad-braids.mp4', title: "Scene 6 — Dad's Saturday Hair Day" },
];

async function main() {
  console.log(`[Finals] Uploading ${FINALS.length} hero videos to R2...\n`);

  const results: Array<{ title: string; url: string; size: string }> = [];
  const missing: string[] = [];

  for (const f of FINALS) {
    const localPath = path.join(HERO_VIDEOS_DIR, f.filename);
    try {
      const buffer = await fs.readFile(localPath);
      const sizeMb = (buffer.length / 1024 / 1024).toFixed(1);
      const r2Key = `content/hero/final/${f.filename}`;
      const { url } = await uploadFile(r2Key, buffer, 'video/mp4');
      results.push({ title: f.title, url, size: `${sizeMb} MB` });
    } catch (err) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const e = err as any;
      if (e?.code === 'ENOENT') {
        console.warn(`[Finals] ⚠️  Missing: ${f.filename}`);
        missing.push(f.filename);
      } else {
        console.error(`[Finals] Error uploading ${f.filename}:`, err);
        missing.push(f.filename);
      }
    }
  }

  console.log(`\n═══ Final hero videos (${results.length}/${FINALS.length}) ═══\n`);
  for (const { title, url, size } of results) {
    console.log(`${title}`);
    console.log(`  ${url}  (${size})\n`);
  }

  if (missing.length > 0) {
    console.log(`\n⚠️  ${missing.length} file(s) missing on disk:`);
    for (const m of missing) console.log(`  - ${m}`);
    console.log(
      '\nRun the batch generator first: pnpm gen:hero-videos-sora --only=<ids>',
    );
    process.exit(1);
  }
}

main().catch((err) => {
  console.error('[Finals] Fatal error:', err);
  process.exit(1);
});
