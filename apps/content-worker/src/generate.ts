/**
 * AI image and headline generation using Gemini via Vercel AI SDK.
 */

import { generateText } from 'ai';
import { google } from '@ai-sdk/google';
import sharp from 'sharp';
import { buildImagePrompt, buildHeadlinePrompt } from './prompts';

// Models — cast needed due to pnpm hoisting resolving different provider type versions
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const geminiImage: any = google('gemini-3-pro-image-preview');
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const geminiText: any = google('gemini-2.0-flash');

export interface GeneratedContent {
  sceneImage: Buffer;
  headline: string;
  subheading: string;
}

/**
 * Generate a product scene image using Gemini.
 */
export async function generateSceneImage(product: {
  name: string;
  brand: string;
  category: string;
}): Promise<Buffer> {
  const prompt = buildImagePrompt(product);

  console.log(`[Generate] Creating scene for "${product.name}"...`);

  const result = await generateText({
    model: geminiImage,
    prompt,
  });

  const imageFile = result.files?.find((f: any) =>
    (f.mediaType || f.mimeType)?.startsWith('image/'),
  );

  if (!imageFile) {
    throw new Error('Gemini did not return an image');
  }

  // Resize to exactly 1080x1350 (4:5 IG feed ratio)
  const resized = await sharp(Buffer.from(imageFile.uint8Array))
    .resize(1080, 1350, { fit: 'cover' })
    .jpeg({ quality: 95 })
    .toBuffer();

  console.log(`[Generate] Scene image created (${resized.length} bytes)`);

  return resized;
}

/**
 * Generate a catchy headline and subheading for a product.
 */
export async function generateHeadline(product: {
  name: string;
  brand: string;
  category: string;
}): Promise<{ headline: string; subheading: string }> {
  const prompt = buildHeadlinePrompt(product);

  const result = await generateText({
    model: geminiText,
    prompt,
  });

  try {
    // Extract JSON from the response (handle markdown code blocks)
    const text = result.text.replace(/```json?\n?/g, '').replace(/```/g, '').trim();
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
export async function generateProductContent(product: {
  name: string;
  brand: string;
  category: string;
}): Promise<GeneratedContent> {
  const [sceneImage, { headline, subheading }] = await Promise.all([
    generateSceneImage(product),
    generateHeadline(product),
  ]);

  return { sceneImage, headline, subheading };
}
