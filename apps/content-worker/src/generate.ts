/**
 * AI image and headline generation.
 * - Flux 2 Pro / Flux Kontext / Gemini for image generation
 * - Claude for creative writing (headlines, copy)
 */

import { anthropic } from '@ai-sdk/anthropic';
import { google } from '@ai-sdk/google';
import { fal } from '@fal-ai/client';
import { generateText } from 'ai';
import sharp from 'sharp';
import { buildHeadlinePrompt, buildImagePrompt } from './prompts';
import { uploadFile } from './storage';

// Configure fal.ai
fal.config({ credentials: process.env.FAL_KEY! });

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const geminiImage: any = google('gemini-3-pro-image-preview');
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const claude: any = anthropic('claude-sonnet-4-20250514');

export type ImageModel = 'flux-kontext' | 'flux-2-pro' | 'gemini';

export interface GeneratedContent {
  sceneImage: Buffer;
  headline: string;
  subheading: string;
}

/**
 * Generate scene image using Flux Pro Kontext (reference image + prompt).
 * Best for: preserving product packaging text via reference image input.
 */
async function generateWithFluxKontext(
  prompt: string,
  imageUrl: string,
): Promise<Buffer> {
  console.log('[Flux Kontext] Generating scene with reference image...');

  // Upload reference image to R2 so Flux can access it
  const imgRes = await fetch(imageUrl);
  const imgBuffer = Buffer.from(await imgRes.arrayBuffer());
  const upload = await uploadFile(
    `content/tmp/ref-${Date.now()}.jpg`,
    imgBuffer,
    'image/jpeg',
  );

  const result = await fal.subscribe('fal-ai/flux-pro/kontext', {
    input: {
      prompt: `Place this exact product in the following scene, keeping the product packaging, labels, and all text perfectly sharp and accurate. ${prompt}`,
      image_url: upload.url,
      aspect_ratio: '3:4',
      output_format: 'jpeg',
      safety_tolerance: '5',
    },
    logs: true,
  });

  const outputUrl = (result.data as any)?.images?.[0]?.url;
  if (!outputUrl) throw new Error('Flux Kontext did not return an image');

  const outputRes = await fetch(outputUrl);
  const outputBuffer = Buffer.from(await outputRes.arrayBuffer());

  return sharp(outputBuffer)
    .resize(1080, 1350, { fit: 'cover' })
    .jpeg({ quality: 95 })
    .toBuffer();
}

/**
 * Generate scene image using Flux 2 Pro edit endpoint (reference images + prompt).
 * Best for: newest model with highest quality.
 */
async function generateWithFlux2Pro(
  prompt: string,
  imageUrl: string,
): Promise<Buffer> {
  console.log('[Flux 2 Pro] Generating scene with reference image...');

  // Upload reference image to R2
  const imgRes = await fetch(imageUrl);
  const imgBuffer = Buffer.from(await imgRes.arrayBuffer());
  const upload = await uploadFile(
    `content/tmp/ref-${Date.now()}.jpg`,
    imgBuffer,
    'image/jpeg',
  );

  const result = await fal.subscribe('fal-ai/flux-2-pro/edit', {
    input: {
      prompt: `Place this exact product in the following scene, keeping the product packaging, labels, and all text perfectly sharp and accurate. ${prompt}`,
      image_urls: [upload.url],
      image_size: { width: 1080, height: 1350 },
      output_format: 'jpeg',
      safety_tolerance: '5',
    },
    logs: true,
  });

  const outputUrl = (result.data as any)?.images?.[0]?.url;
  if (!outputUrl) throw new Error('Flux 2 Pro did not return an image');

  const outputRes = await fetch(outputUrl);
  const outputBuffer = Buffer.from(await outputRes.arrayBuffer());

  return sharp(outputBuffer)
    .resize(1080, 1350, { fit: 'cover' })
    .jpeg({ quality: 95 })
    .toBuffer();
}

/**
 * Generate scene image using Gemini (existing approach).
 */
async function generateWithGemini(
  prompt: string,
  imageUrl?: string,
): Promise<Buffer> {
  console.log('[Gemini] Generating scene...');

  const content: any[] = [];

  if (imageUrl) {
    try {
      const imgRes = await fetch(imageUrl);
      const imgBuffer = Buffer.from(await imgRes.arrayBuffer());
      const mimeType = imgRes.headers.get('content-type') || 'image/jpeg';

      content.push({ type: 'image', image: imgBuffer, mimeType });
      content.push({
        type: 'text',
        text: `This is the actual product photo. Use this EXACT product with its real packaging, labels, and text in the generated scene. The product packaging must be accurate and faithful to this reference image.\n\n${prompt}`,
      });
    } catch {
      content.push({ type: 'text', text: prompt });
    }
  } else {
    content.push({ type: 'text', text: prompt });
  }

  const result = await generateText({
    model: geminiImage,
    messages: [{ role: 'user', content }],
  });

  const imageFile = result.files?.find((f: any) =>
    (f.mediaType || f.mimeType)?.startsWith('image/'),
  );

  if (!imageFile) throw new Error('Gemini did not return an image');

  return sharp(Buffer.from(imageFile.uint8Array))
    .resize(1080, 1350, { fit: 'cover' })
    .jpeg({ quality: 95 })
    .toBuffer();
}

/**
 * Generate a product scene image using the specified model.
 */
export async function generateSceneImage(
  product: {
    name: string;
    brand: string;
    category: string;
    imageUrl?: string;
  },
  model: ImageModel = 'gemini',
): Promise<Buffer> {
  const prompt = buildImagePrompt(product);

  console.log(
    `[Generate] Creating scene for "${product.name}" using ${model}...`,
  );
  if (product.imageUrl) {
    console.log(`[Generate] Reference image: ${product.imageUrl}`);
  }

  let buffer: Buffer;

  switch (model) {
    case 'flux-kontext':
      if (!product.imageUrl)
        throw new Error('Flux Kontext requires a reference image');
      buffer = await generateWithFluxKontext(prompt, product.imageUrl);
      break;
    case 'flux-2-pro':
      if (!product.imageUrl)
        throw new Error('Flux 2 Pro edit requires a reference image');
      buffer = await generateWithFlux2Pro(prompt, product.imageUrl);
      break;
    case 'gemini':
    default:
      buffer = await generateWithGemini(prompt, product.imageUrl);
      break;
  }

  console.log(`[Generate] Scene image created (${buffer.length} bytes)`);
  return buffer;
}

/**
 * Generate a catchy headline and subheading for a product using Claude.
 */
export async function generateHeadline(product: {
  name: string;
  brand: string;
  category: string;
}): Promise<{ headline: string; subheading: string }> {
  const prompt = buildHeadlinePrompt(product);

  const result = await generateText({
    model: claude,
    prompt,
  });

  try {
    const text = result.text
      .replace(/```json?\n?/g, '')
      .replace(/```/g, '')
      .trim();
    const parsed = JSON.parse(text);
    return {
      headline: parsed.headline || 'Your beauty essentials',
      subheading: parsed.subheading || `Shop at Auntie Marlene's`,
    };
  } catch {
    console.warn('[Generate] Failed to parse headline, using defaults');
    return {
      headline: 'Your beauty essentials',
      subheading: `Shop ${product.brand} at Auntie Marlene's`,
    };
  }
}

/**
 * Generate all content for a product (scene image + headline).
 */
export async function generateProductContent(
  product: {
    name: string;
    brand: string;
    category: string;
    imageUrl?: string;
  },
  imageModel: ImageModel = 'gemini',
): Promise<GeneratedContent> {
  const [sceneImage, { headline, subheading }] = await Promise.all([
    generateSceneImage(product, imageModel),
    generateHeadline(product),
  ]);

  return { sceneImage, headline, subheading };
}
