#!/usr/bin/env npx tsx
/**
 * Generate hero videos for the Auntie Marlene's homepage.
 *
 * Usage:
 *   pnpm gen:hero-videos                      # generate all 6 scenes
 *   pnpm gen:hero-videos --only=bonnet        # generate just one scene
 *   pnpm gen:hero-videos --only=1             # generate by 1-based index
 *   pnpm gen:hero-videos --only=bonnet,dad-braids
 *
 * Valid scene IDs:
 *   bonnet, mother-daughter, kitchen-beautician, locs-oil,
 *   barbershop-fade, dad-braids
 *
 * Prerequisites:
 *   - apps/web/public/images/hero/hero-XX-*.png must exist (run pnpm gen:hero)
 *   - FAL_KEY, ANTHROPIC_API_KEY, R2_* env vars set in .env
 *   - ffmpeg + ffprobe installed on PATH
 */

import 'dotenv/config';
import { generateAllHeroVideos } from '../hero-videos';

function parseArgs(argv: string[]): { only?: string[] } {
  const only: string[] = [];
  for (const arg of argv) {
    if (arg.startsWith('--only=')) {
      only.push(
        ...arg
          .slice('--only='.length)
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean),
      );
    }
  }
  return only.length > 0 ? { only } : {};
}

async function main() {
  try {
    const options = parseArgs(process.argv.slice(2));
    await generateAllHeroVideos(options);
    process.exit(0);
  } catch (err) {
    console.error('[Video] Fatal error:', err);
    process.exit(1);
  }
}

main();
