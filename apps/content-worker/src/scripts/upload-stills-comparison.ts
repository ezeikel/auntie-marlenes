#!/usr/bin/env npx tsx
/**
 * Upload all 6 v1 and v2 stills to R2 for side-by-side comparison from any
 * device. v1 = original polished Gemini 3 output. v2 = documentary-realistic
 * rewrite.
 */

import 'dotenv/config';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { uploadFile } from '../storage';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const HERO_IMAGES_DIR = path.resolve(
  __dirname,
  '../../../../apps/web/public/images/hero',
);

interface Pair {
  scene: string;
  title: string;
  v1Local: string;
  v2Local: string;
}

const PAIRS: Pair[] = [
  {
    scene: '01',
    title: 'The Bonnet Moment',
    v1Local: 'hero-01-bonnet-v1-gleam.png',
    v2Local: 'hero-01-bonnet.png',
  },
  {
    scene: '02',
    title: 'Between Her Knees',
    v1Local: 'hero-02-mother-daughter-v1-gleam.png',
    v2Local: 'hero-02-mother-daughter.png',
  },
  {
    scene: '03',
    title: 'Kitchen Beautician',
    v1Local: 'hero-03-kitchen-beautician-v1-gleam.png',
    v2Local: 'hero-03-kitchen-beautician.png',
  },
  {
    scene: '04',
    title: 'Anointing the Locs',
    v1Local: 'hero-04-locs-oil-v1-bareshoulders.png',
    v2Local: 'hero-04-locs-oil.png',
  },
  {
    scene: '05',
    title: 'The Fade Moment',
    v1Local: 'hero-05-barbershop-fade-v1-gleam.png',
    v2Local: 'hero-05-barbershop-fade.png',
  },
  {
    scene: '06',
    title: "Dad's Saturday Hair Day",
    v1Local: 'hero-06-dad-braids-v1-gleam.png',
    v2Local: 'hero-06-dad-braids.png',
  },
];

async function main() {
  console.log('[Upload] Uploading 6 v1 + 6 v2 stills to R2...\n');

  const rows: Array<{ scene: string; title: string; v1: string; v2: string }> =
    [];

  for (const p of PAIRS) {
    const v1Buffer = await fs.readFile(path.join(HERO_IMAGES_DIR, p.v1Local));
    const v2Buffer = await fs.readFile(path.join(HERO_IMAGES_DIR, p.v2Local));

    const { url: v1Url } = await uploadFile(
      `content/hero/stills-comparison/hero-${p.scene}-${p.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-v1-gleam.png`,
      v1Buffer,
      'image/png',
    );
    const { url: v2Url } = await uploadFile(
      `content/hero/stills-comparison/hero-${p.scene}-${p.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-v2-documentary.png`,
      v2Buffer,
      'image/png',
    );

    rows.push({ scene: p.scene, title: p.title, v1: v1Url, v2: v2Url });
  }

  console.log('\n═══ Side-by-side stills for review ═══\n');
  for (const r of rows) {
    console.log(`Scene ${r.scene} — ${r.title}`);
    console.log(`  v1 (polished):   ${r.v1}`);
    console.log(`  v2 (documentary): ${r.v2}\n`);
  }
}

main().catch((err) => {
  console.error('[Upload] Fatal error:', err);
  process.exit(1);
});
