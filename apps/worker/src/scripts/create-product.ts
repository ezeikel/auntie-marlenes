#!/usr/bin/env npx tsx
/**
 * Create a new product in Shopify with AI-generated copy and studio images.
 *
 * Usage:
 *   npx tsx --env-file=.env src/scripts/create-product.ts "Product Name" --brand "Brand" --category "Hair Care"
 *   npx tsx --env-file=.env src/scripts/create-product.ts "Mielle Rosemary Oil" --brand "Mielle" --category "Hair Care" --dry-run
 *
 * Pipeline:
 *   1. Research best reference images via Perplexity
 *   2. Claude selects highest quality reference
 *   3. Claude writes product title, description, SEO meta, tags
 *   4. Gemini generates 4 studio shots
 *   5. Claude judges each shot (PASS/REDO/FALLBACK)
 *   6. Create product in Shopify with copy + images
 *   7. Assign to collections + publish to Online Store
 */

import 'dotenv/config';
import { readFileSync } from 'fs';
import { generateProductCopy } from '../product-copy';
import {
  findReferenceImages,
  generateStudioShots,
  selectBestReference,
} from '../product-images';
import {
  assignToCollections,
  createProduct,
  publishToOnlineStore,
  uploadImageToProduct,
} from '../shopify-admin';

function parseArgs(args: string[]): {
  name: string;
  brand: string;
  category: string;
  price: string;
  refImage: string;
  extraCollections: string[];
  dryRun: boolean;
} {
  const dryRun = args.includes('--dry-run');

  let name = '';
  let brand = '';
  let category = '';
  let price = '';
  let refImage = '';
  const extraCollections: string[] = [];

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--brand' && args[i + 1]) {
      brand = args[++i];
    } else if (args[i] === '--category' && args[i + 1]) {
      category = args[++i];
    } else if (args[i] === '--price' && args[i + 1]) {
      price = args[++i];
    } else if (args[i] === '--ref-image' && args[i + 1]) {
      refImage = args[++i];
    } else if (args[i] === '--collection' && args[i + 1]) {
      extraCollections.push(args[++i]);
    } else if (args[i] === '--dry-run') {
      continue;
    } else if (!args[i].startsWith('--')) {
      name = args[i];
    }
  }

  return { name, brand, category, price, refImage, extraCollections, dryRun };
}

async function main(): Promise<void> {
  const { name, brand, category, price, refImage, extraCollections, dryRun } =
    parseArgs(process.argv.slice(2));

  if (!name || !brand || !category) {
    console.error('Usage:');
    console.error(
      '  npx tsx --env-file=.env src/scripts/create-product.ts "Product Name" --brand "Brand" --category "Kids" --price "7.49"',
    );
    console.error('');
    console.error('Options:');
    console.error('  --brand        Product brand name (required)');
    console.error('  --category     Product category (required)');
    console.error('  --price        Product price in GBP (optional)');
    console.error(
      '  --ref-image    Path to local reference image (skips image search)',
    );
    console.error('  --collection   Extra collection to add to (repeatable)');
    console.error('  --dry-run      Preview without creating in Shopify');
    process.exit(1);
  }

  console.log(`\n${'='.repeat(60)}`);
  console.log(`Creating product: ${name} by ${brand} (${category})`);
  console.log(`${'='.repeat(60)}\n`);

  let bestRef: Buffer | null = null;

  if (refImage) {
    // Use provided local reference image
    console.log(`Step 1-2: Using local reference image: ${refImage}`);
    bestRef = readFileSync(refImage);
    console.log(`  Loaded ${bestRef.length} bytes`);
  } else {
    // Step 1: Find reference images
    console.log('Step 1: Searching for reference images...');
    const refs = await findReferenceImages(name, brand);

    if (refs.length === 0) {
      console.error(
        'No reference images found. Use --ref-image to provide a local reference.',
      );
      process.exit(1);
    }

    // Step 2: Select best reference
    console.log('\nStep 2: Selecting best reference image...');
    bestRef = await selectBestReference(refs, name);
  }

  if (!bestRef) {
    console.error('Could not load reference image.');
    process.exit(1);
  }

  // Step 3: Generate product copy
  console.log('\nStep 3: Generating product copy...');
  const copy = await generateProductCopy({ name, brand, category });

  // Step 4: Generate studio shots
  console.log('\nStep 4: Generating 4 studio shots...');
  const shots = await generateStudioShots(bestRef, name, brand, category);

  if (shots.length === 0) {
    console.error('No studio shots generated.');
    process.exit(1);
  }

  // Preview
  console.log(`\n${'─'.repeat(40)}`);
  console.log('Preview:');
  console.log(`  Title: ${copy.title}`);
  console.log(`  Type: ${copy.productType}`);
  if (price) console.log(`  Price: £${price}`);
  console.log(`  Tags: ${copy.tags.join(', ')}`);
  console.log(`  SEO Title: ${copy.seoTitle}`);
  console.log(`  SEO Desc: ${copy.seoDescription}`);
  console.log(
    `  Images: ${shots.map((s) => `${s.name} (${s.verdict})`).join(', ')}`,
  );
  if (extraCollections.length > 0)
    console.log(`  Extra collections: ${extraCollections.join(', ')}`);
  console.log(`${'─'.repeat(40)}\n`);

  if (dryRun) {
    console.log('[DRY RUN] Would create product with above details.');
    console.log(`  Description (${copy.descriptionHtml.length} chars HTML)`);
    return;
  }

  // Step 5: Create product in Shopify
  console.log('Step 5: Creating product in Shopify...');
  const product = await createProduct({
    title: copy.title,
    vendor: brand,
    productType: copy.productType,
    descriptionHtml: copy.descriptionHtml,
    tags: copy.tags,
    status: 'ACTIVE',
    ...(price ? { price } : {}),
  });

  // Step 6: Upload images
  console.log('\nStep 6: Uploading studio shots...');
  for (const shot of shots) {
    await uploadImageToProduct(
      product.id,
      shot.buffer,
      `${product.handle}-${shot.slug}.jpg`,
      `${copy.title} - ${shot.name}`,
    );
  }

  // Step 7: Assign to collections + publish
  console.log('\nStep 7: Assigning to collections...');
  await assignToCollections(product.id, copy.productType, extraCollections);
  await publishToOnlineStore(product.id);

  console.log(`\n${'='.repeat(60)}`);
  console.log(`Product created successfully!`);
  console.log(`  Handle: ${product.handle}`);
  console.log(`  ID: ${product.id}`);
  console.log(`  Images: ${shots.length} studio shots uploaded`);
  console.log(
    `  URL: https://afro-hair-and-beauty.myshopify.com/admin/products/${product.id.split('/').pop()}`,
  );
  console.log(`${'='.repeat(60)}`);
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
