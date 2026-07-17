#!/usr/bin/env npx tsx
/**
 * Generate hero videos via Runway Gen-4.5 + ffmpeg slow-mo.
 *
 * Usage:
 *   pnpm gen:hero-videos-runway                      # all 6 scenes
 *   pnpm gen:hero-videos-runway --only=bonnet        # one scene
 *   pnpm gen:hero-videos-runway --only=1             # by 1-based index
 *   pnpm gen:hero-videos-runway --only=bonnet,dad-braids
 *
 * Valid scene IDs:
 *   bonnet, mother-daughter, kitchen-beautician, locs-oil,
 *   barbershop-fade, dad-braids
 *
 * Each Runway 5s generation is stretched to ~7s via ffmpeg minterpolate
 * for butter-smooth slow motion. The existing Seedance-generated MP4s
 * will be OVERWRITTEN (same filenames).
 *
 * Prerequisites:
 *   - apps/web/public/images/hero/hero-XX-*.png must exist
 *   - RUNWAYML_API_SECRET, ANTHROPIC_API_KEY, R2_* env vars set
 *   - ffmpeg + ffprobe on PATH
 */

import 'dotenv/config';
import { generateAllHeroVideosRunway } from '../hero-videos-runway';

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
    await generateAllHeroVideosRunway(options);
    process.exit(0);
  } catch (err) {
    console.error('[Runway] Fatal error:', err);
    process.exit(1);
  }
}

main();
