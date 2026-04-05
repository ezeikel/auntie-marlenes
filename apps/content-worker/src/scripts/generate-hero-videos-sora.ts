#!/usr/bin/env npx tsx
/**
 * Generate hero videos via Sora 2 on fal.ai with the v2 prompting recipe.
 *
 * Usage:
 *   pnpm gen:hero-videos-sora                      # all 6 scenes
 *   pnpm gen:hero-videos-sora --only=bonnet        # one scene
 *   pnpm gen:hero-videos-sora --only=2,3           # by 1-based index
 *   pnpm gen:hero-videos-sora --only=mother-daughter,kitchen-beautician
 *
 * Valid scene IDs:
 *   bonnet, mother-daughter, kitchen-beautician, locs-oil,
 *   barbershop-fade, dad-braids
 *
 * Cost: ~$2 per scene. 6 scenes = ~$12 clean run.
 * Time: ~6-12 min per scene sequentially (Sora queue latency).
 *
 * Prerequisites:
 *   - apps/web/public/images/hero/hero-XX-*.png must exist
 *   - FAL_KEY, R2_* env vars set
 *   - ffmpeg on PATH (for audio stripping)
 */

import 'dotenv/config';
import { generateAllHeroVideosSora } from '../hero-videos-sora';

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
    await generateAllHeroVideosSora(options);
    process.exit(0);
  } catch (err) {
    console.error('[Sora] Fatal error:', err);
    process.exit(1);
  }
}

main();
