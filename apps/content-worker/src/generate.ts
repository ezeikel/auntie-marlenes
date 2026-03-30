/**
 * AI image and headline generation.
 * - Gemini for image generation (only model that returns images)
 * - Claude for creative writing (headlines, copy)
 */

import { generateText } from 'ai';
import { google } from '@ai-sdk/google';
import { anthropic } from '@ai-sdk/anthropic';
import sharp from 'sharp';
import { buildImagePrompt, buildHeadlinePrompt } from './prompts';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const geminiImage: any = google('gemini-3-pro-image-preview');
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const claude: any = anthropic('claude-sonnet-4-20250514');

export interface GeneratedContent {
  sceneImage: Buffer;
  headline: string;
  subheading: string;
}

/**
 * Generate a product scene image using Gemini with reference product photo.
 */
export async function generateSceneImage(product: {
  name: string;
  brand: string;
  category: string;
  imageUrl?: string;
}): Promise<Buffer> {
  const prompt = buildImagePrompt(product);

  console.log(`[Generate] Creating scene for "${product.name}"...`);
  if (product.imageUrl) {
    console.log(`[Generate] Using reference image: ${product.imageUrl}`);
  }

  // Build message content — text prompt + optional reference image
  const content: any[] = [];

  if (product.imageUrl) {
    // Fetch the product image and include as reference
    try {
      const imgRes = await fetch(product.imageUrl);
      const imgBuffer = Buffer.from(await imgRes.arrayBuffer());
      const mimeType = imgRes.headers.get('content-type') || 'image/jpeg';

      content.push({
        type: 'image',
        image: imgBuffer,
        mimeType,
      });
      content.push({
        type: 'text',
        text: `This is the actual product photo. Use this EXACT product with its real packaging, labels, and text in the generated scene. The product packaging must be accurate and faithful to this reference image.\n\n${prompt}`,
      });
    } catch (err) {
      console.warn('[Generate] Failed to fetch reference image, using text-only prompt');
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
    model: claude,
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
  imageUrl?: string;
}): Promise<GeneratedContent> {
  const [sceneImage, { headline, subheading }] = await Promise.all([
    generateSceneImage(product),
    generateHeadline(product),
  ]);

  return { sceneImage, headline, subheading };
}
