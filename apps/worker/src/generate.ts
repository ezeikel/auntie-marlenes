/**
 * AI image and headline generation.
 * - Gemini for image generation
 * - Claude for creative writing (headlines, copy)
 */

import { anthropic } from '@ai-sdk/anthropic';
import { google } from '@ai-sdk/google';
import { generateText } from 'ai';
import sharp from 'sharp';
import { sonnet5NoThinking } from './model-options';
import { buildHeadlinePrompt, buildImagePrompt } from './prompts';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const geminiImage: any = google('gemini-3-pro-image-preview');
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const claude: any = anthropic('claude-sonnet-5');

export const IMAGE_MODELS = ['gemini'] as const;
export type ImageModel = (typeof IMAGE_MODELS)[number];

export const isImageModel = (value: unknown): value is ImageModel =>
  (IMAGE_MODELS as readonly unknown[]).includes(value);

export interface GeneratedContent {
  sceneImage: Buffer;
  headline: string;
  subheading: string;
}

/**
 * Generate scene image using Gemini.
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

  if (!isImageModel(model)) {
    throw new Error(`Unsupported image model: ${String(model)}`);
  }

  const buffer = await generateWithGemini(prompt, product.imageUrl);

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
    providerOptions: sonnet5NoThinking,
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
