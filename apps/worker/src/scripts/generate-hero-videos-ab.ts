#!/usr/bin/env npx tsx
/**
 * Run the hero video A/B harness on Scene 1 (bonnet).
 *
 * Generates two videos using the same Scene 1 still and motion prompt:
 *   1. Runway Gen-4.5 → hero-01-bonnet-runway.mp4
 *   2. Sora 2 via fal.ai → hero-01-bonnet-sora.mp4
 *
 * Leaves the existing Seedance 1.5 Pro hero-01-bonnet.mp4 untouched so all
 * three can be compared side by side in Finder / QuickTime.
 *
 * Usage:
 *   pnpm gen:hero-videos-ab
 *
 * Prerequisites:
 *   - apps/web/public/images/hero/hero-01-bonnet.png must exist
 *   - FAL_KEY, RUNWAYML_API_SECRET, ANTHROPIC_API_KEY, R2_* env vars set
 *   - ffmpeg + ffprobe on PATH
 */

import 'dotenv/config';
import { runHeroVideoAB } from '../hero-videos-ab';

async function main() {
  try {
    await runHeroVideoAB();
    process.exit(0);
  } catch (err) {
    console.error('[AB] Fatal error:', err);
    process.exit(1);
  }
}

main();
