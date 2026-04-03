#!/usr/bin/env npx tsx
/**
 * Update product images with consistent studio shots.
 *
 * Usage:
 *   npx tsx --env-file=.env src/scripts/update-product-images.ts <handle>
 *   npx tsx --env-file=.env src/scripts/update-product-images.ts --all
 *   npx tsx --env-file=.env src/scripts/update-product-images.ts --all --dry-run
 *
 * Pipeline per product:
 *   1. Fetch product from Shopify Admin API
 *   2. Research best reference images via Perplexity
 *   3. Claude selects highest quality reference
 *   4. Gemini generates 4 studio shots (hero, 45°, back, top-down)
 *   5. Claude judges each shot (PASS/REDO/FALLBACK)
 *   6. Replace images in Shopify
 */

import 'dotenv/config';
import {
  getAllProducts,
  getProductByHandle,
  replaceProductImages,
  type AdminProduct,
} from '../shopify-admin';
import {
  findReferenceImages,
  selectBestReference,
  generateStudioShots,
} from '../product-images';

async function updateProductImages(product: AdminProduct, dryRun: boolean): Promise<void> {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`Processing: ${product.title} (${product.handle})`);
  console.log(`${'='.repeat(60)}`);

  // Step 1: Find reference images
  const refs = await findReferenceImages(product.title, product.vendor);

  // Also include existing Shopify images as reference candidates
  const existingImages = product.images.edges.map((e) => ({
    url: e.node.url,
    source: 'Shopify (existing)',
  }));
  const allRefs = [...refs, ...existingImages];

  if (allRefs.length === 0) {
    console.error(`[SKIP] No reference images found for ${product.handle}`);
    return;
  }

  // Step 2: Select best reference
  const bestRef = await selectBestReference(allRefs, product.title);
  if (!bestRef) {
    console.error(`[SKIP] Could not download any reference images for ${product.handle}`);
    return;
  }

  // Step 3: Generate 4 studio shots
  const shots = await generateStudioShots(bestRef, product.title, product.vendor);

  if (shots.length === 0) {
    console.error(`[SKIP] No shots generated for ${product.handle}`);
    return;
  }

  // Step 4: Upload to Shopify (or dry run)
  if (dryRun) {
    console.log(`[DRY RUN] Would replace ${product.images.edges.length} images with ${shots.length} new shots:`);
    for (const shot of shots) {
      console.log(`  - ${shot.name} (${shot.verdict}): ${shot.buffer.length} bytes`);
    }
    return;
  }

  const existingMediaIds = product.images.edges.map((e) => e.node.id);

  await replaceProductImages(
    product.id,
    existingMediaIds,
    shots.map((shot) => ({
      buffer: shot.buffer,
      filename: `${product.handle}-${shot.slug}.jpg`,
      alt: `${product.title} - ${shot.name}`,
    })),
  );

  const verdicts = shots.map((s) => `${s.name}: ${s.verdict}`).join(', ');
  console.log(`[DONE] ${product.handle} — ${verdicts}`);
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const isAll = args.includes('--all');
  const handle = args.find((a) => !a.startsWith('--'));

  if (!isAll && !handle) {
    console.error('Usage:');
    console.error('  npx tsx --env-file=.env src/scripts/update-product-images.ts <handle>');
    console.error('  npx tsx --env-file=.env src/scripts/update-product-images.ts --all');
    console.error('  npx tsx --env-file=.env src/scripts/update-product-images.ts --all --dry-run');
    process.exit(1);
  }

  if (isAll) {
    console.log('Fetching all products...');
    const products = await getAllProducts();
    console.log(`Found ${products.length} products\n`);

    let success = 0;
    let failed = 0;

    for (const product of products) {
      try {
        await updateProductImages(product, dryRun);
        success++;
      } catch (err) {
        console.error(`[ERROR] ${product.handle}:`, err);
        failed++;
      }
    }

    console.log(`\n${'='.repeat(60)}`);
    console.log(`Complete: ${success} success, ${failed} failed out of ${products.length} products`);
  } else {
    const product = await getProductByHandle(handle!);
    if (!product) {
      console.error(`Product not found: ${handle}`);
      process.exit(1);
    }
    await updateProductImages(product, dryRun);
  }
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
