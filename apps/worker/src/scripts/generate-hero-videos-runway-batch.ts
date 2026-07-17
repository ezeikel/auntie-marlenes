#!/usr/bin/env npx tsx
/**
 * Batch generate hero videos via Runway Gen-4.5 — two variants per scene.
 *
 * Variants:
 *   5s          — native 5s clip, no slow-mo language (baseline)
 *   10s-slowmo  — native 10s clip with "extreme slow motion" in prompt
 *                 (no ffmpeg post-processing — avoids minterpolate
 *                 hand-morphing risk)
 *
 * Output files:
 *   hero-XX-<scene>-runway-5s.mp4
 *   hero-XX-<scene>-runway-10s-slowmo.mp4
 *
 * Existing Sora finals (hero-XX-<scene>.mp4) are NOT touched.
 *
 * Usage:
 *   pnpm gen:hero-videos-runway-batch                      # all 6 scenes × both variants = 12 clips
 *   pnpm gen:hero-videos-runway-batch --only=bonnet        # one scene, both variants
 *   pnpm gen:hero-videos-runway-batch --variants=5s        # all scenes, 5s variant only
 *   pnpm gen:hero-videos-runway-batch --only=2,3 --variants=10s-slowmo
 *
 * Cost: ~$0.25 per clip.
 *   Full run (12 clips) = ~$3
 * Time: ~30-60s per clip sequentially, so ~10-15 min for full run.
 *
 * Prerequisites:
 *   - apps/web/public/images/hero/hero-XX-*.png must exist
 *   - RUNWAYML_API_SECRET, R2_* env vars set
 */

import 'dotenv/config';
import {
  type GenerateHeroVideosRunwayBatchOptions,
  generateAllHeroVideosRunwayBatch,
} from '../hero-videos-runway-batch';

function parseArgs(argv: string[]): GenerateHeroVideosRunwayBatchOptions {
  const opts: GenerateHeroVideosRunwayBatchOptions = {};

  for (const arg of argv) {
    if (arg.startsWith('--only=')) {
      opts.only = arg
        .slice('--only='.length)
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
    }
    if (arg.startsWith('--variants=')) {
      const raw = arg
        .slice('--variants='.length)
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
      const valid = raw.filter(
        (v): v is '5s' | '10s-slowmo' => v === '5s' || v === '10s-slowmo',
      );
      if (valid.length !== raw.length) {
        throw new Error(
          `Invalid variant(s). Valid: 5s, 10s-slowmo. Got: ${raw.join(', ')}`,
        );
      }
      opts.variants = valid;
    }
    if (arg.startsWith('--seed=')) {
      const n = Number.parseInt(arg.slice('--seed='.length), 10);
      if (!Number.isFinite(n)) {
        throw new Error(`Invalid --seed value. Must be an integer.`);
      }
      opts.seed = n;
    }
  }

  return opts;
}

async function main() {
  try {
    const options = parseArgs(process.argv.slice(2));
    await generateAllHeroVideosRunwayBatch(options);
    process.exit(0);
  } catch (err) {
    console.error('[Runway] Fatal error:', err);
    process.exit(1);
  }
}

main();
