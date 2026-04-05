#!/usr/bin/env npx tsx
/**
 * One-off: upload all 5 Scene 1 hero video candidates to R2 so they can be
 * watched from any device (e.g. phone). Returns public URLs.
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

const CANDIDATES = [
  {
    filename: 'hero-01-bonnet-sora.mp4',
    r2Key: 'content/hero/candidates/hero-01-bonnet-sora-v3-slowmo.mp4',
    label: 'Sora 2 v3 — two-beats slow-mo (THE NEW ONE — watch this)',
  },
  {
    filename: 'hero-01-bonnet-sora-v2-fast.mp4',
    r2Key: 'content/hero/candidates/hero-01-bonnet-sora-v2-fast.mp4',
    label: 'Sora 2 v2 — six beats, normal tempo (reference)',
  },
  {
    filename: 'hero-01-bonnet-sora-v1-still.mp4',
    r2Key: 'content/hero/candidates/hero-01-bonnet-sora-v1-still.mp4',
    label: 'Sora 2 v1 — near-still image failure (reference)',
  },
  {
    filename: 'hero-01-bonnet-runway-slowmo.mp4',
    r2Key: 'content/hero/candidates/hero-01-bonnet-runway-slowmo.mp4',
    label: 'Runway Gen-4.5 + ffmpeg 4× minterpolate — 20s (reference)',
  },
  {
    filename: 'hero-01-bonnet-seedance.mp4',
    r2Key: 'content/hero/candidates/hero-01-bonnet-seedance.mp4',
    label: 'Seedance 1.5 Pro — 5s baseline (reference)',
  },
];

async function main() {
  console.log(`[Upload] Uploading ${CANDIDATES.length} Scene 1 candidates to R2...\n`);

  const urls: Array<{ label: string; url: string; size: string }> = [];

  for (const c of CANDIDATES) {
    const localPath = path.join(HERO_VIDEOS_DIR, c.filename);
    try {
      const buffer = await fs.readFile(localPath);
      const sizeMb = (buffer.length / 1024 / 1024).toFixed(1);
      const { url } = await uploadFile(c.r2Key, buffer, 'video/mp4');
      urls.push({ label: c.label, url, size: `${sizeMb} MB` });
    } catch (err) {
      console.error(`[Upload] Skipping ${c.filename}:`, err);
    }
  }

  console.log('\n═══ Scene 1 candidates — public URLs ═══\n');
  for (const { label, url, size } of urls) {
    console.log(`${label}`);
    console.log(`  ${url}  (${size})\n`);
  }
}

main().catch((err) => {
  console.error('[Upload] Fatal error:', err);
  process.exit(1);
});
