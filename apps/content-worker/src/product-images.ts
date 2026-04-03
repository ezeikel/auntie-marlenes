/**
 * Product image generation pipeline.
 *
 * 1. Research best reference images via Perplexity
 * 2. Claude selects the highest quality reference
 * 3. Gemini generates 4 consistent studio shots
 * 4. Claude judges each shot quality (PASS/REDO/FALLBACK)
 */

import { generateText, generateObject } from 'ai';
import { google } from '@ai-sdk/google';
import { anthropic } from '@ai-sdk/anthropic';
import { z } from 'zod';
import sharp from 'sharp';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const geminiImage: any = google('gemini-3-pro-image-preview');
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const claude: any = anthropic('claude-sonnet-4-20250514');

// ─── Studio Style Guide ─────────────────────────────────────────────────────

const STUDIO_STYLE = {
  size: 2048,
  background: 'Pure white (#FFFFFF) seamless background',
  lighting: 'Soft, even studio lighting with subtle shadow underneath',
  colourTemp: 'Consistent warm-neutral colour temperature',
  rules: 'No props, no hands, no text overlays, no lifestyle context',
};

interface ShotConfig {
  name: string;
  slug: string;
  prompt: string;
}

function getShotConfigs(productName: string, brand: string): ShotConfig[] {
  const base = `Professional studio product photograph on a ${STUDIO_STYLE.background}. ${STUDIO_STYLE.lighting}. ${STUDIO_STYLE.colourTemp}. ${STUDIO_STYLE.rules}. The product should be instantly recognizable as ${productName} by ${brand}.`;

  return [
    {
      name: 'Hero (Front-Facing)',
      slug: 'hero',
      prompt: `${base} Straight-on front view at eye level. Product label centered and perfectly straight, facing the camera. Product fills 80-85% of the frame. This is a clean e-commerce hero product shot.`,
    },
    {
      name: 'Three-Quarter (45°)',
      slug: '45-degree',
      prompt: `${base} Product rotated approximately 45 degrees to show depth and three-dimensional form. Shows the shape and form factor clearly. Product fills 75-80% of the frame.`,
    },
    {
      name: 'Back / Ingredients',
      slug: 'back',
      prompt: `${base} Rear view of the product showing the back label with ingredients list and usage instructions. Product fills 80% of the frame. The text on the back should be as legible as possible.`,
    },
    {
      name: 'Top-Down',
      slug: 'top-down',
      prompt: `${base} Bird's-eye view looking directly down at the product from above. Shows the cap, lid, or top of the product and its overall shape from above. Product fills 70-75% of the frame.`,
    },
  ];
}

// ─── Reference Image Research ───────────────────────────────────────────────

interface ReferenceImage {
  url: string;
  source: string;
}

/**
 * Use Perplexity to find high-quality reference images of a product.
 */
export async function findReferenceImages(
  productName: string,
  brand: string,
): Promise<ReferenceImage[]> {
  console.log(`[Images] Searching for reference images: ${productName} by ${brand}...`);

  const apiKey = process.env.PERPLEXITY_API_KEY;
  if (!apiKey) throw new Error('PERPLEXITY_API_KEY is required');

  const res = await fetch('https://api.perplexity.ai/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'sonar',
      messages: [
        {
          role: 'user',
          content: `Find the highest quality product photos of "${productName}" by ${brand}. I need direct image URLs (ending in .jpg, .png, .webp) from the brand's official website, Amazon UK, Amazon US, Boots, Superdrug, or major beauty retailers.

Return ONLY a JSON array of objects with "url" and "source" fields. Example:
[{"url": "https://example.com/product.jpg", "source": "Amazon UK"}]

Requirements:
- Only include direct image URLs that will load as images
- Prefer high-resolution images (product photography, not lifestyle)
- Include images showing the front label clearly
- 3-5 images maximum`,
        },
      ],
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Perplexity API error (${res.status}): ${err}`);
  }

  const data = await res.json();
  const content = data.choices?.[0]?.message?.content || '';

  // Extract JSON array from response
  const jsonMatch = content.match(/\[[\s\S]*?\]/);
  if (!jsonMatch) {
    console.warn('[Images] Could not parse Perplexity response, falling back to empty');
    return [];
  }

  try {
    const images = JSON.parse(jsonMatch[0]) as ReferenceImage[];
    console.log(`[Images] Found ${images.length} reference images`);
    return images;
  } catch {
    console.warn('[Images] Failed to parse reference image JSON');
    return [];
  }
}

/**
 * Claude selects the best reference image from candidates.
 */
export async function selectBestReference(
  images: ReferenceImage[],
  productName: string,
): Promise<Buffer | null> {
  if (images.length === 0) return null;

  // Download all images
  const downloaded: Array<{ buffer: Buffer; url: string; source: string }> = [];
  for (const img of images) {
    try {
      const res = await fetch(img.url);
      if (!res.ok) continue;
      const contentType = res.headers.get('content-type') || '';
      if (!contentType.includes('image')) continue;
      const buffer = Buffer.from(await res.arrayBuffer());
      if (buffer.length < 5000) continue; // Skip tiny images
      downloaded.push({ buffer, url: img.url, source: img.source });
    } catch {
      continue;
    }
  }

  if (downloaded.length === 0) return null;
  if (downloaded.length === 1) return downloaded[0].buffer;

  console.log(`[Images] Claude evaluating ${downloaded.length} reference images...`);

  // Have Claude pick the best one
  const imageContents: any[] = [];
  for (let i = 0; i < downloaded.length; i++) {
    imageContents.push({ type: 'image', image: downloaded[i].buffer });
    imageContents.push({
      type: 'text',
      text: `Image ${i + 1} (from ${downloaded[i].source})`,
    });
  }
  imageContents.push({
    type: 'text',
    text: `Which image is the best reference photo of "${productName}" for generating studio product shots? Pick the one that is:
1. Highest resolution and sharpest
2. Shows the full product with packaging clearly visible
3. Has the most legible label text
4. Best represents the actual product appearance

Respond with ONLY the number (e.g. "1" or "3").`,
  });

  const result = await generateText({
    model: claude,
    messages: [{ role: 'user', content: imageContents }],
  });

  const pick = parseInt(result.text.trim().replace(/\D/g, ''), 10);
  const selected = downloaded[(pick || 1) - 1] || downloaded[0];

  console.log(`[Images] Selected reference: Image ${pick} from ${selected.source}`);
  return selected.buffer;
}

// ─── Studio Shot Generation ─────────────────────────────────────────────────

/**
 * Generate a single studio shot using Gemini with a reference image.
 */
async function generateSingleShot(
  referenceImage: Buffer,
  shotConfig: ShotConfig,
): Promise<Buffer> {
  const result = await generateText({
    model: geminiImage,
    messages: [
      {
        role: 'user',
        content: [
          { type: 'image', image: referenceImage } as any,
          {
            type: 'text',
            text: `This is the actual product photo. Generate a new studio photograph of THIS EXACT product using this reference. The product packaging, colours, labels, and text must match the reference image faithfully.\n\n${shotConfig.prompt}\n\nOutput a square image (1:1 aspect ratio).`,
          },
        ],
      },
    ],
  });

  const imageFile = result.files?.find((f: any) =>
    (f.mediaType || f.mimeType)?.startsWith('image/'),
  );

  if (!imageFile) {
    throw new Error(`Gemini did not return an image for ${shotConfig.name}`);
  }

  return sharp(Buffer.from(imageFile.uint8Array))
    .resize(STUDIO_STYLE.size, STUDIO_STYLE.size, { fit: 'cover' })
    .jpeg({ quality: 95 })
    .toBuffer();
}

// ─── Quality Judging ────────────────────────────────────────────────────────

type Verdict = 'PASS' | 'REDO' | 'FALLBACK';

interface JudgeResult {
  verdict: Verdict;
  scores: {
    recognition: number;
    labelLegibility: number;
    aiArtifacts: number;
    styleConsistency: number;
    lightingMatch: number;
  };
  feedback: string;
}

const judgeSchema = z.object({
  recognition: z.number().min(1).max(5).describe('Would a customer recognize this as the real product?'),
  labelLegibility: z.number().min(1).max(5).describe('Can you read the brand name and product name?'),
  aiArtifacts: z.number().min(1).max(5).describe('5 = no AI artifacts, 1 = obviously AI-generated'),
  styleConsistency: z.number().min(1).max(5).describe('Matches studio style guide? White bg, centered, correct fill'),
  lightingMatch: z.number().min(1).max(5).describe('Consistent studio lighting'),
  feedback: z.string().describe('Brief feedback on what to fix if REDO'),
});

/**
 * Claude judges the quality of a generated studio shot.
 */
async function judgeShot(
  generatedImage: Buffer,
  referenceImage: Buffer,
  shotConfig: ShotConfig,
  productName: string,
): Promise<JudgeResult> {
  // @ts-expect-error — model type mismatch from pnpm hoisting
  const result = await generateObject({
    model: claude,
    schema: judgeSchema,
    messages: [
      {
        role: 'user',
        content: [
          { type: 'image', image: referenceImage } as any,
          { type: 'text', text: 'This is the REFERENCE photo of the real product.' },
          { type: 'image', image: generatedImage } as any,
          {
            type: 'text',
            text: `This is an AI-generated studio shot ("${shotConfig.name}") of "${productName}".

Score each criterion 1-5:
1. Product recognition — would a customer recognize this as the real product?
2. Label legibility — can you read the brand name and product name?
3. AI artifacts — 5 = no artifacts, 1 = obviously fake (weird text, melted shapes, wrong colours)
4. Style consistency — white background, centered, correct framing?
5. Lighting match — soft even studio lighting with subtle shadow?

Also provide brief feedback on what needs fixing.`,
          },
        ],
      },
    ],
  });

  const scores = result.object;
  const avg =
    (scores.recognition +
      scores.labelLegibility +
      scores.aiArtifacts +
      scores.styleConsistency +
      scores.lightingMatch) /
    5;

  let verdict: Verdict;
  if (avg >= 3.5) verdict = 'PASS';
  else if (avg >= 2) verdict = 'REDO';
  else verdict = 'FALLBACK';

  console.log(
    `[Images] Judge ${shotConfig.name}: ${verdict} (avg: ${avg.toFixed(1)}) — ${scores.feedback}`,
  );

  return {
    verdict,
    scores: {
      recognition: scores.recognition,
      labelLegibility: scores.labelLegibility,
      aiArtifacts: scores.aiArtifacts,
      styleConsistency: scores.styleConsistency,
      lightingMatch: scores.lightingMatch,
    },
    feedback: scores.feedback,
  };
}

// ─── Main Pipeline ──────────────────────────────────────────────────────────

export interface StudioShot {
  name: string;
  slug: string;
  buffer: Buffer;
  verdict: Verdict;
}

/**
 * Generate all 4 studio shots for a product.
 * Uses reference image + Gemini generation + Claude quality judging.
 * Retries up to 3 times per shot on REDO verdict.
 */
export async function generateStudioShots(
  referenceImage: Buffer,
  productName: string,
  brand: string,
  maxRetries: number = 3,
): Promise<StudioShot[]> {
  const configs = getShotConfigs(productName, brand);
  const results: StudioShot[] = [];

  for (const config of configs) {
    console.log(`[Images] Generating ${config.name}...`);

    let bestShot: Buffer | null = null;
    let bestVerdict: Verdict = 'FALLBACK';

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const shot = await generateSingleShot(referenceImage, config);
        const judge = await judgeShot(shot, referenceImage, config, productName);

        if (judge.verdict === 'PASS') {
          bestShot = shot;
          bestVerdict = 'PASS';
          break;
        }

        if (judge.verdict === 'REDO' && attempt < maxRetries) {
          console.log(`[Images] Retrying ${config.name} (attempt ${attempt + 1}/${maxRetries})...`);
          // Keep the best REDO in case we don't get a PASS
          if (!bestShot || bestVerdict === 'FALLBACK') {
            bestShot = shot;
            bestVerdict = 'REDO';
          }
          continue;
        }

        // Last attempt or FALLBACK — use what we have
        if (!bestShot) {
          bestShot = shot;
          bestVerdict = judge.verdict;
        }
      } catch (err) {
        console.error(`[Images] Error generating ${config.name} (attempt ${attempt}):`, err);
        if (attempt === maxRetries && !bestShot) {
          // Use reference image as fallback, processed to studio style
          console.log(`[Images] Using reference image as fallback for ${config.name}`);
          bestShot = await sharp(referenceImage)
            .resize(STUDIO_STYLE.size, STUDIO_STYLE.size, {
              fit: 'contain',
              background: { r: 255, g: 255, b: 255 },
            })
            .jpeg({ quality: 95 })
            .toBuffer();
          bestVerdict = 'FALLBACK';
        }
      }
    }

    if (bestShot) {
      results.push({
        name: config.name,
        slug: config.slug,
        buffer: bestShot,
        verdict: bestVerdict,
      });
    }
  }

  const passed = results.filter((r) => r.verdict === 'PASS').length;
  const redone = results.filter((r) => r.verdict === 'REDO').length;
  const fallen = results.filter((r) => r.verdict === 'FALLBACK').length;
  console.log(`[Images] Complete: ${passed} PASS, ${redone} REDO, ${fallen} FALLBACK`);

  return results;
}
