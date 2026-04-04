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
import { uploadFile } from '../storage';

async function updateProductImages(product: AdminProduct, dryRun: boolean, refUrl?: string): Promise<void> {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`Processing: ${product.title} (${product.handle})`);
  console.log(`${'='.repeat(60)}`);

  // If a manual reference URL or file path is provided, use it directly
  if (refUrl) {
    console.log(`[Images] Using provided reference: ${refUrl}`);
    let bestRef: Buffer;
    if (refUrl.startsWith('http')) {
      const res = await fetch(refUrl);
      if (!res.ok) {
        console.error(`[SKIP] Failed to download reference image: ${res.status}`);
        return;
      }
      bestRef = Buffer.from(await res.arrayBuffer());
    } else {
      const { readFile } = await import('fs/promises');
      bestRef = await readFile(refUrl);
    }
    const shots = await generateStudioShots(bestRef, product.title, product.vendor);
    if (shots.length === 0) {
      console.error(`[SKIP] No shots generated for ${product.handle}`);
      return;
    }
    if (dryRun) {
      const ts = Date.now();
      console.log(`[DRY RUN] Would replace ${product.media.edges.length} images with ${shots.length} new shots:\n\nPreview images (uploaded to R2):`);
      for (const shot of shots) {
        const preview = await uploadFile(
          `content/products/${product.handle}/studio-preview-${shot.slug}-${ts}.jpg`,
          shot.buffer,
          'image/jpeg',
        );
        console.log(`  - ${shot.name} (${shot.verdict}): ${preview.url}`);
      }
      return;
    }
    const existingMediaIds = product.media.edges.map((e) => e.node.id);
    await replaceProductImages(product.id, existingMediaIds, shots.map((shot) => ({
      buffer: shot.buffer,
      filename: `${product.handle}-${shot.slug}.jpg`,
      alt: `${product.title} - ${shot.name}`,
    })));
    console.log(`[DONE] ${product.handle}`);
    return;
  }

  // Step 1: Find reference images via search
  const refs = await findReferenceImages(product.title, product.vendor);

  // Also include existing Shopify images as reference candidates
  const existingImages = product.media.edges
    .filter((e) => e.node.image?.url)
    .map((e) => ({
      url: e.node.image!.url,
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

  // Step 4: Upload to Shopify (or dry run with R2 preview)
  if (dryRun) {
    const ts = Date.now();
    console.log(`[DRY RUN] Would replace ${product.media.edges.length} images with ${shots.length} new shots:`);
    console.log(`\nPreview images (uploaded to R2):`);
    for (const shot of shots) {
      const preview = await uploadFile(
        `content/products/${product.handle}/studio-preview-${shot.slug}-${ts}.jpg`,
        shot.buffer,
        'image/jpeg',
      );
      console.log(`  - ${shot.name} (${shot.verdict}): ${preview.url}`);
    }
    return;
  }

  const existingMediaIds = product.media.edges.map((e) => e.node.id);

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
  const refIndex = args.indexOf('--ref');
  const refUrl = refIndex !== -1 ? args[refIndex + 1] : undefined;
  const handle = args.find((a) => !a.startsWith('--') && a !== refUrl);

  if (!isAll && !handle) {
    console.error('Usage:');
    console.error('  npx tsx --env-file=.env src/scripts/update-product-images.ts <handle>');
    console.error('  npx tsx --env-file=.env src/scripts/update-product-images.ts <handle> --ref <image-url>');
    console.error('  npx tsx --env-file=.env src/scripts/update-product-images.ts --all');
    console.error('  npx tsx --env-file=.env src/scripts/update-product-images.ts --all --dry-run');
    process.exit(1);
  }

  if (isAll) {
    const force = args.includes('--force');
    console.log('Fetching all products...');
    const products = await getAllProducts();
    console.log(`Found ${products.length} products\n`);

    let success = 0;
    let failed = 0;
    let skipped = 0;

    for (const product of products) {
      // Skip products that already have exactly 4 images (already processed)
      const imageCount = product.media.edges.filter((e) => e.node.image?.url).length;
      if (imageCount === 4 && !force) {
        console.log(`[SKIP] ${product.handle} — already has 4 images (use --force to regenerate)`);
        skipped++;
        continue;
      }

      try {
        await updateProductImages(product, dryRun);
        success++;
      } catch (err) {
        console.error(`[ERROR] ${product.handle}:`, err);
        failed++;
      }
    }

    console.log(`\n${'='.repeat(60)}`);
    console.log(`Complete: ${success} success, ${failed} failed, ${skipped} skipped out of ${products.length} products`);
  } else {
    const product = await getProductByHandle(handle!);
    if (!product) {
      console.error(`Product not found: ${handle}`);
      process.exit(1);
    }
    await updateProductImages(product, dryRun, refUrl);
  }
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
