#!/usr/bin/env npx tsx
/**
 * Generate hero images for the Auntie Marlene's homepage.
 *
 * Usage:
 *   pnpm gen:hero                       # generate all 6 scenes
 *   pnpm gen:hero --only=bonnet         # generate just the bonnet scene
 *   pnpm gen:hero --only=1              # generate by 1-based index
 *   pnpm gen:hero --only=bonnet,dad-braids   # generate multiple specific scenes
 *
 * Valid scene IDs:
 *   bonnet, mother-daughter, kitchen-beautician, locs-oil,
 *   barbershop-fade, dad-braids
 */

import 'dotenv/config';
import { generateAllHeroImages } from '../hero-images';

function parseArgs(argv: string[]): { only?: string[] } {
  const only: string[] = [];
  for (const arg of argv) {
    if (arg.startsWith('--only=')) {
      only.push(...arg.slice('--only='.length).split(',').map((s) => s.trim()).filter(Boolean));
    }
  }
  return only.length > 0 ? { only } : {};
}

async function main() {
  try {
    const options = parseArgs(process.argv.slice(2));
    await generateAllHeroImages(options);
    process.exit(0);
  } catch (err) {
    console.error('[Hero] Fatal error:', err);
    process.exit(1);
  }
}

main();
