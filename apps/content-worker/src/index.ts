/**
 * Auntie Marlene's Content Worker
 *
 * Generates branded social media content for products:
 * - AI-generated product scene images (Gemini)
 * - Branded post stills with text overlays (Remotion)
 * - Animated reels (Remotion)
 * - Uploads to R2 for review
 */

import { Hono } from 'hono';
import { logger } from 'hono/logger';
import { readFile } from 'fs/promises';
import { getAllProducts, getProductByHandle } from './shopify';
import { generateProductContent } from './generate';
import { renderProductPost, renderProductReel, generateOutputPath } from './video/render';
import { uploadProductPost, uploadProductReel, listContent, uploadFile } from './storage';

const app = new Hono();

app.use('*', logger());

// Health check
app.get('/health', (c) => {
  return c.json({ status: 'ok', service: 'content-worker' });
});

/**
 * Generate content for a single product.
 *
 * POST /generate/product
 * Body: { handle: string, types?: ('post' | 'reel')[] }
 */
app.post('/generate/product', async (c) => {
  const { handle, types = ['post'] } = await c.req.json<{
    handle: string;
    types?: ('post' | 'reel')[];
  }>();

  if (!handle) {
    return c.json({ error: 'handle is required' }, 400);
  }

  console.log(`[API] Generating content for: ${handle}`);

  // Fetch product from Shopify
  const product = await getProductByHandle(handle);
  if (!product) {
    return c.json({ error: `Product not found: ${handle}` }, 404);
  }

  // Generate scene image + headline
  const content = await generateProductContent({
    name: product.title,
    brand: product.vendor,
    category: product.productType,
  });

  // Save scene image to temp for Remotion to access
  const sceneImagePath = `/tmp/scene-${Date.now()}.jpg`;
  const { writeFile: fsWriteFile } = await import('fs/promises');
  await fsWriteFile(sceneImagePath, content.sceneImage);

  // Serve the scene image via a temp URL for Remotion
  // Remotion needs an HTTP URL, so we use a data URL for stills
  // or write to a file and use file:// for local rendering
  const sceneImageUrl = `file://${sceneImagePath}`;

  const results: Record<string, string> = {};

  // Generate post (static image)
  if (types.includes('post')) {
    const outputPath = generateOutputPath('post');

    await renderProductPost(
      {
        sceneImageUrl,
        headline: content.headline,
        subheading: content.subheading,
      },
      outputPath,
    );

    const imageBuffer = await readFile(outputPath);
    const upload = await uploadProductPost(handle, imageBuffer);
    results.post = upload.url;

    console.log(`[API] Post uploaded: ${upload.url}`);
  }

  // Generate reel (animated video)
  if (types.includes('reel')) {
    const outputPath = generateOutputPath('reel');

    await renderProductReel(
      {
        sceneImageUrl,
        headline: content.headline,
        subheading: content.subheading,
      },
      outputPath,
    );

    const videoBuffer = await readFile(outputPath);
    const upload = await uploadProductReel(handle, videoBuffer);
    results.reel = upload.url;

    console.log(`[API] Reel uploaded: ${upload.url}`);
  }

  // Also upload the raw scene image for reference
  const sceneUpload = await uploadFile(
    `content/products/${handle}/scene-${Date.now()}.jpg`,
    content.sceneImage,
    'image/jpeg',
  );

  return c.json({
    success: true,
    product: {
      handle: product.handle,
      name: product.title,
      brand: product.vendor,
      category: product.productType,
    },
    headline: content.headline,
    subheading: content.subheading,
    sceneImage: sceneUpload.url,
    content: results,
  });
});

/**
 * Generate content for all products.
 *
 * POST /generate/all
 * Body: { types?: ('post' | 'reel')[], delayMs?: number }
 */
app.post('/generate/all', async (c) => {
  const { types = ['post'] as ('post' | 'reel')[], delayMs = 5000 } = await c.req.json<{
    types?: ('post' | 'reel')[];
    delayMs?: number;
  }>().catch(() => ({ types: ['post'] as ('post' | 'reel')[], delayMs: 5000 }));

  console.log('[API] Generating content for all products...');

  const products = await getAllProducts();
  console.log(`[API] Found ${products.length} products`);

  const results: Array<{
    handle: string;
    name: string;
    success: boolean;
    urls?: Record<string, string>;
    error?: string;
  }> = [];

  for (const product of products) {
    try {
      console.log(`[API] Processing: ${product.title}`);

      const content = await generateProductContent({
        name: product.title,
        brand: product.vendor,
        category: product.productType,
      });

      const sceneImagePath = `/tmp/scene-${Date.now()}.jpg`;
      const { writeFile: fsWriteFile } = await import('fs/promises');
      await fsWriteFile(sceneImagePath, content.sceneImage);
      const sceneImageUrl = `file://${sceneImagePath}`;

      const urls: Record<string, string> = {};

      if (types.includes('post')) {
        const outputPath = generateOutputPath('post');
        await renderProductPost(
          { sceneImageUrl, headline: content.headline, subheading: content.subheading },
          outputPath,
        );
        const imageBuffer = await readFile(outputPath);
        const upload = await uploadProductPost(product.handle, imageBuffer);
        urls.post = upload.url;
      }

      if (types.includes('reel')) {
        const outputPath = generateOutputPath('reel');
        await renderProductReel(
          { sceneImageUrl, headline: content.headline, subheading: content.subheading },
          outputPath,
        );
        const videoBuffer = await readFile(outputPath);
        const upload = await uploadProductReel(product.handle, videoBuffer);
        urls.reel = upload.url;
      }

      results.push({
        handle: product.handle,
        name: product.title,
        success: true,
        urls,
      });

      // Delay between products to respect rate limits
      if (delayMs > 0) {
        await new Promise((r) => setTimeout(r, delayMs));
      }
    } catch (error) {
      console.error(`[API] Failed for ${product.handle}:`, error);
      results.push({
        handle: product.handle,
        name: product.title,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  const succeeded = results.filter((r) => r.success).length;
  const failed = results.filter((r) => !r.success).length;

  return c.json({
    total: products.length,
    succeeded,
    failed,
    results,
  });
});

/**
 * List all generated content.
 *
 * GET /content/list
 */
app.get('/content/list', async (c) => {
  const urls = await listContent();
  return c.json({ count: urls.length, urls });
});

// Start server
const port = parseInt(process.env.PORT || '3020', 10);
console.log(`Content worker starting on port ${port}...`);

export default {
  port,
  fetch: app.fetch,
};
