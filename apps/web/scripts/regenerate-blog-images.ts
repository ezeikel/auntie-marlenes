#!/usr/bin/env npx tsx
/**
 * Script to regenerate blog post images
 *
 * Usage:
 *   npx tsx scripts/regenerate-blog-images.ts              # Regenerate all images
 *   npx tsx scripts/regenerate-blog-images.ts --ai-only    # Only AI-generated images
 *   npx tsx scripts/regenerate-blog-images.ts --limit=5    # Limit to 5 posts
 *   npx tsx scripts/regenerate-blog-images.ts --post=<id>  # Single post by ID
 */

import { config } from 'dotenv';
import { resolve } from 'path';

// Load environment variables from .env.local
config({ path: resolve(process.cwd(), '.env.local') });

import {
  regenerateAllBlogImages,
  regenerateBlogImage,
} from '../app/actions/blog';

async function main() {
  const args = process.argv.slice(2);

  // Parse arguments
  const aiOnly = args.includes('--ai-only');
  const limitArg = args.find((a) => a.startsWith('--limit='));
  const limit = limitArg ? parseInt(limitArg.split('=')[1], 10) : undefined;
  const postArg = args.find((a) => a.startsWith('--post='));
  const postId = postArg ? postArg.split('=')[1] : undefined;

  console.log('🖼️  Blog Image Regeneration Script');
  console.log('==================================\n');

  if (postId) {
    // Single post mode
    console.log(`Regenerating image for post: ${postId}\n`);

    const result = await regenerateBlogImage(postId);

    if (result.success) {
      console.log(`✅ Success: ${result.title}`);
      console.log(`   Source: ${result.imageSource}`);
    } else {
      console.log(`❌ Failed: ${result.error}`);
    }
  } else {
    // Batch mode
    console.log('Options:');
    console.log(`  - AI-generated only: ${aiOnly}`);
    console.log(`  - Limit: ${limit ?? 'none'}`);
    console.log('');

    const result = await regenerateAllBlogImages({
      onlyAiGenerated: aiOnly,
      limit,
    });

    console.log('\n📊 Results:');
    console.log(`   Processed: ${result.processed}`);
    console.log(`   Succeeded: ${result.succeeded}`);
    console.log(`   Failed: ${result.failed}`);

    if (result.results.length > 0) {
      console.log('\n📝 Details:');
      for (const r of result.results) {
        const status = r.success ? '✅' : '❌';
        const source = r.imageSource ? ` (${r.imageSource})` : '';
        const error = r.error ? ` - ${r.error}` : '';
        console.log(`   ${status} ${r.title}${source}${error}`);
      }
    }
  }

  console.log('\n✨ Done!');
}

main().catch((error) => {
  console.error('Script failed:', error);
  process.exit(1);
});
