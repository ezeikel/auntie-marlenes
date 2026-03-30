import 'dotenv/config';

/**
 * Auntie Marlene's Content Worker
 *
 * Pipeline:
 * 1. Gemini → generate product scene image (with reference photo)
 * 2. Satori → composite brand text overlay → static IG post
 * 3. Veo 3.1 → animate scene image → ambient video
 * 4. Remotion → composite animated text onto video → final reel
 *
 * Uploads to R2 for review.
 */

import { Hono } from 'hono';
import { logger } from 'hono/logger';
import { readFile, writeFile } from 'fs/promises';
import { getAllProducts, getProductByHandle } from './shopify';
import { generateProductContent } from './generate';
import { compositePost } from './compositor';
import { animateScene } from './video-gen';
import { renderProductReel, generateOutputPath } from './video/render';
import { uploadProductPost, uploadProductReel, listContent, uploadFile } from './storage';

const app = new Hono();

app.use('*', logger());

// Serve temp files for Remotion — supports range requests for video seeking
app.get('/tmp/:filename', async (c) => {
  const filename = c.req.param('filename');
  try {
    const { stat } = await import('fs/promises');
    const filePath = `/tmp/${filename}`;
    const stats = await stat(filePath);
    const data = await readFile(filePath);
    const ext = filename.split('.').pop();
    const contentType = ext === 'mp4' ? 'video/mp4' : 'image/jpeg';

    // Handle range requests (required for Remotion video seeking)
    const range = c.req.header('range');
    if (range && ext === 'mp4') {
      const parts = range.replace(/bytes=/, '').split('-');
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : stats.size - 1;
      const chunk = data.subarray(start, end + 1);

      return new Response(chunk, {
        status: 206,
        headers: {
          'Content-Range': `bytes ${start}-${end}/${stats.size}`,
          'Accept-Ranges': 'bytes',
          'Content-Length': chunk.length.toString(),
          'Content-Type': contentType,
          'Access-Control-Allow-Origin': '*',
        },
      });
    }

    return new Response(data, {
      headers: {
        'Content-Type': contentType,
        'Content-Length': stats.size.toString(),
        'Accept-Ranges': 'bytes',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch {
    return c.json({ error: 'Not found' }, 404);
  }
});

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

  const productImageUrl = product.images.edges[0]?.node.url;

  // Step 1: Generate scene image + headline (Gemini + Claude)
  const content = await generateProductContent({
    name: product.title,
    brand: product.vendor,
    category: product.productType,
    imageUrl: productImageUrl,
  });

  const results: Record<string, string> = {};

  // Step 2: Static post via Satori
  if (types.includes('post')) {
    const postImage = await compositePost({
      sceneImage: content.sceneImage,
      headline: content.headline,
      subheading: content.subheading,
    });

    const upload = await uploadProductPost(handle, postImage);
    results.post = upload.url;
    console.log(`[API] Post uploaded: ${upload.url}`);
  }

  // Step 3 + 4: Reel via Veo + Remotion
  if (types.includes('reel')) {
    // Step 3: Animate scene with Veo
    console.log('[API] Animating scene with Veo...');
    const videoBuffer = await animateScene(
      content.sceneImage,
      product.productType,
    );

    // Save video to temp for Remotion
    const videoPath = `/tmp/veo-${Date.now()}.mp4`;
    await writeFile(videoPath, videoBuffer);
    const videoFilename = videoPath.split('/').pop();
    const sceneVideoUrl = `http://localhost:${port}/tmp/${videoFilename}`;

    // Step 4: Remotion composites text overlays onto video
    const reelOutputPath = generateOutputPath('reel');
    await renderProductReel(
      {
        sceneVideoUrl,
        headline: content.headline,
        subheading: content.subheading,
        durationInFrames: 240, // 8 seconds at 30fps
      },
      reelOutputPath,
    );

    const reelBuffer = await readFile(reelOutputPath);
    const upload = await uploadProductReel(handle, reelBuffer);
    results.reel = upload.url;
    console.log(`[API] Reel uploaded: ${upload.url}`);
  }

  // Upload raw scene image for reference
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
  const { types = ['post'] as ('post' | 'reel')[], delayMs = 5000 } =
    await c.req
      .json<{
        types?: ('post' | 'reel')[];
        delayMs?: number;
      }>()
      .catch(() => ({ types: ['post'] as ('post' | 'reel')[], delayMs: 5000 }));

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

      const productImageUrl = product.images.edges[0]?.node.url;

      const content = await generateProductContent({
        name: product.title,
        brand: product.vendor,
        category: product.productType,
        imageUrl: productImageUrl,
      });

      const urls: Record<string, string> = {};

      if (types.includes('post')) {
        const postImage = await compositePost({
          sceneImage: content.sceneImage,
          headline: content.headline,
          subheading: content.subheading,
        });
        const upload = await uploadProductPost(product.handle, postImage);
        urls.post = upload.url;
      }

      if (types.includes('reel')) {
        const videoBuffer = await animateScene(
          content.sceneImage,
          product.productType,
        );
        const videoPath = `/tmp/veo-${Date.now()}.mp4`;
        await writeFile(videoPath, videoBuffer);
        const videoFilename = videoPath.split('/').pop();
        const sceneVideoUrl = `http://localhost:${port}/tmp/${videoFilename}`;

        const reelOutputPath = generateOutputPath('reel');
        await renderProductReel(
          {
            sceneVideoUrl,
            headline: content.headline,
            subheading: content.subheading,
            durationInFrames: 240,
          },
          reelOutputPath,
        );
        const reelBuffer = await readFile(reelOutputPath);
        const upload = await uploadProductReel(product.handle, reelBuffer);
        urls.reel = upload.url;
      }

      results.push({
        handle: product.handle,
        name: product.title,
        success: true,
        urls,
      });

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

  return c.json({ total: products.length, succeeded, failed, results });
});

/**
 * List all generated content.
 */
app.get('/content/list', async (c) => {
  const urls = await listContent();
  return c.json({ count: urls.length, urls });
});

// Start server
import { serve } from '@hono/node-server';

const port = parseInt(process.env.PORT || '3020', 10);

serve({ fetch: app.fetch, port }, () => {
  console.log(`Content worker running on http://localhost:${port}`);
});
