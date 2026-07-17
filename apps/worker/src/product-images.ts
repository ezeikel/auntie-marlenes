/**
 * Product image generation pipeline.
 *
 * 1. Research best reference images via Perplexity
 * 2. Claude selects the highest quality reference
 * 3. Gemini generates 4 consistent studio shots
 * 4. Claude judges each shot quality (PASS/REDO/FALLBACK)
 */

import { anthropic } from '@ai-sdk/anthropic';
import { google } from '@ai-sdk/google';
import { generateObject, generateText } from 'ai';
import sharp from 'sharp';
import { z } from 'zod';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const geminiImage: any = google('gemini-3-pro-image-preview');
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const claude: any = anthropic('claude-sonnet-4-20250514');

// ─── Studio Style Guide ─────────────────────────────────────────────────────

const STUDIO_STYLE = {
  size: 2048,
  background:
    'Clean, warm off-white seamless studio background with a soft gradient. NOT harsh pure white — slightly warm cream/ivory tone',
  lighting:
    'Soft diffused studio key light from the upper left, gentle fill light from the right. Creates a natural soft shadow underneath and behind the product that gives depth and grounding. Slight shallow depth of field for premium feel',
  colourTemp:
    'Warm-neutral colour temperature, slightly warm like high-end beauty photography',
  rules:
    'No props, no hands, no text overlays, no lifestyle context. The product must look three-dimensional and physically present, NOT like a flat cutout pasted onto a background',
};

interface ShotConfig {
  name: string;
  slug: string;
  prompt: string;
}

// Product types that don't have ingredients labels
const NO_INGREDIENTS_TYPES = [
  'Accessories',
  'Wigs & Extensions',
  'Braiding Hair',
];

function getShotConfigs(
  productName: string,
  brand: string,
  productType?: string,
): ShotConfig[] {
  const hasIngredients = !NO_INGREDIENTS_TYPES.includes(productType || '');

  // Accessories/wigs/hair don't have labels — tell Gemini NOT to add text
  const textRule = hasIngredients
    ? `The product should be instantly recognizable as ${productName} by ${brand}.`
    : `The product should be instantly recognizable as ${productName} by ${brand}. CRITICAL: This product does NOT have any printed text, labels, ingredients lists, or stickers on it. Do NOT add any text, writing, labels, or branding to the product surface. Show the product exactly as it is — a clean physical object with no printed text.`;

  const base = `High-end studio product photograph. ${STUDIO_STYLE.background}. ${STUDIO_STYLE.lighting}. ${STUDIO_STYLE.colourTemp}. ${STUDIO_STYLE.rules}. ${textRule} Shot with a professional medium-format camera, 85mm lens, f/4 aperture for slight bokeh.`;

  const shot3 = hasIngredients
    ? {
        name: 'Back / Ingredients',
        slug: 'back',
        prompt: `${base} Rear view of the product showing the back label with ingredients list and usage instructions. Product fills 80% of the frame. The text on the back should be as legible as possible. Same lighting setup as the hero shot for consistency.`,
      }
    : {
        name: 'Detail / Texture',
        slug: 'detail',
        prompt: `${base} Close-up detail shot showing the product's texture, material quality, and craftsmanship. For brushes/combs: show the bristles, teeth, or grip detail. For wigs/hair: show the hair texture, lace detail, or fibre quality. For fabric items: show the weave, sheen, or stitching. Product fills 85-90% of the frame. Macro-style photography emphasising tactile quality.`,
      };

  return [
    {
      name: 'Hero (Front-Facing)',
      slug: 'hero',
      prompt: `${base} Straight-on front view at eye level, shot slightly from below (about 5-10 degrees) to give the product presence and authority. Product label centered and perfectly straight, facing the camera. Product fills 80-85% of the frame. Soft shadow visible underneath grounding the product on the surface.`,
    },
    {
      name: 'Three-Quarter (45°)',
      slug: '45-degree',
      prompt: `${base} Product rotated approximately 45 degrees to show depth and three-dimensional form. Shows the shape, curvature, and form factor clearly. Product fills 75-80% of the frame. The angle reveals the label wrapping around the bottle/jar, showing dimensionality.`,
    },
    shot3,
    {
      name: 'Top-Down',
      slug: 'top-down',
      prompt: `${base} Bird's-eye view looking directly down at the product from above. Shows the cap, lid, or top of the product and its overall shape from above. Product fills 70-75% of the frame. Soft circular shadow visible around the base of the product.`,
    },
  ];
}

// ─── Reference Image Research ───────────────────────────────────────────────

interface ReferenceImage {
  url: string;
  source: string;
}

/**
 * Search for high-quality reference images using multiple strategies:
 * 1. Perplexity (sonar) for web-searched image URLs
 * 2. Google Custom Search API (if configured) — TODO: replace with AM-specific key
 * 3. Direct retailer URL construction as fallback
 */
export async function findReferenceImages(
  productName: string,
  brand: string,
): Promise<ReferenceImage[]> {
  console.log(
    `[Images] Searching for reference images: ${productName} by ${brand}...`,
  );

  const results: ReferenceImage[] = [];

  // Strategy 1: Perplexity
  try {
    const perplexityImages = await searchWithPerplexity(productName, brand);
    results.push(...perplexityImages);
  } catch (err) {
    console.warn('[Images] Perplexity search failed:', err);
  }

  // Strategy 2: Google Custom Search (if key available)
  // TODO: Replace with Auntie Marlene's own Google CSE key
  const googleKey = process.env.GOOGLE_CUSTOM_SEARCH_KEY;
  const googleCx = process.env.GOOGLE_CUSTOM_SEARCH_CX;
  if (googleKey && googleCx) {
    try {
      const googleImages = await searchWithGoogle(
        productName,
        brand,
        googleKey,
        googleCx,
      );
      results.push(...googleImages);
    } catch (err) {
      console.warn('[Images] Google search failed:', err);
    }
  }

  console.log(`[Images] Found ${results.length} reference images total`);
  return results;
}

async function searchWithPerplexity(
  productName: string,
  brand: string,
): Promise<ReferenceImage[]> {
  const apiKey = process.env.PERPLEXITY_API_KEY;
  if (!apiKey) return [];

  const allImages: ReferenceImage[] = [];

  // Search for front image
  const frontImages = await perplexityImageSearch(
    apiKey,
    `Find a high quality product image of solely the front of "${productName}" by ${brand}. I need a clear photo showing the front label of the product only, on a white or plain background. Give me the direct image URL.`,
    'front',
  );
  allImages.push(...frontImages);

  // Search for back image
  const backImages = await perplexityImageSearch(
    apiKey,
    `Find a high quality product image of the back of "${productName}" by ${brand} showing the ingredients list. I need a clear photo of the back label only. Give me the direct image URL.`,
    'back',
  );
  allImages.push(...backImages);

  console.log(`[Images] Perplexity found ${allImages.length} images total`);
  return allImages;
}

async function perplexityImageSearch(
  apiKey: string,
  query: string,
  label: string,
): Promise<ReferenceImage[]> {
  try {
    const res = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'sonar-pro',
        messages: [
          {
            role: 'user',
            content: `${query}

Respond with ONLY the direct image URL(s) — one per line. No other text, no markdown, no explanation. Just the raw URL(s) that end in .jpg, .png, .webp, or similar image extensions. If the URL has query params that's fine.`,
          },
        ],
      }),
    });

    if (!res.ok) return [];

    const data = await res.json();
    const content = data.choices?.[0]?.message?.content || '';

    // Extract all URLs from the response
    const urlRegex =
      /https?:\/\/[^\s"'<>)\]]+\.(jpg|jpeg|png|webp)(\?[^\s"'<>)\]]*)?/gi;
    const urls = content.match(urlRegex) || [];

    const images = urls.map((url: string) => ({
      url: url.trim(),
      source: `Perplexity (${label})`,
    }));

    if (images.length > 0) {
      console.log(`[Images] Perplexity ${label}: found ${images.length} URLs`);
    }
    return images;
  } catch (err) {
    console.warn(`[Images] Perplexity ${label} search failed:`, err);
    return [];
  }
}

async function searchWithGoogle(
  productName: string,
  brand: string,
  apiKey: string,
  cx: string,
): Promise<ReferenceImage[]> {
  const query = encodeURIComponent(`${brand} ${productName} product photo`);
  const url = `https://www.googleapis.com/customsearch/v1?key=${apiKey}&cx=${cx}&q=${query}&searchType=image&num=5&imgSize=large`;

  const res = await fetch(url);
  if (!res.ok) return [];

  const data = await res.json();
  const items = data.items || [];

  const images = items.map((item: any) => ({
    url: item.link,
    source: new URL(item.image?.contextLink || item.link).hostname,
  }));

  console.log(`[Images] Google found ${images.length} images`);
  return images;
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

  console.log(
    `[Images] Claude evaluating ${downloaded.length} reference images...`,
  );

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

  console.log(
    `[Images] Selected reference: Image ${pick} from ${selected.source}`,
  );
  return selected.buffer;
}

// ─── Studio Shot Generation ─────────────────────────────────────────────────

// Style reference image — a known good studio shot from our catalog.
// Used as Image 2 in the two-image technique to show Gemini
// what lighting/environment we want (product from Image 1, style from Image 2).
// Permanent style reference stored in R2 — a known good studio shot with the
// warm off-white background, soft shadows, and depth we want across all products.
// This is a snapshot that won't change even if Shopify product images are updated.
const STYLE_REFERENCE_URL =
  'https://assets.auntiemarlenes.com/content/style-reference/studio-product-style.jpg';

let styleReferenceCache: Buffer | null = null;

async function getStyleReference(): Promise<Buffer | null> {
  if (styleReferenceCache) return styleReferenceCache;
  try {
    const res = await fetch(STYLE_REFERENCE_URL);
    if (!res.ok) return null;
    styleReferenceCache = Buffer.from(await res.arrayBuffer());
    console.log('[Images] Loaded style reference image');
    return styleReferenceCache;
  } catch {
    return null;
  }
}

/**
 * Generate a single studio shot using Gemini with TWO reference images:
 * - Image 1: Product cutout (for subject fidelity — shape, colours, labels)
 * - Image 2: Style reference (for lighting, shadows, background, depth)
 * This prevents Gemini from copying the flat white look of the product cutout.
 */
async function generateSingleShot(
  referenceImage: Buffer,
  shotConfig: ShotConfig,
): Promise<Buffer> {
  const styleRef = await getStyleReference();

  const content: any[] = [
    { type: 'image', image: referenceImage },
    {
      type: 'text',
      text: "IMAGE 1 (above): This is the product I want you to photograph. Use this for the product's exact appearance — shape, colours, label design, packaging text.",
    },
  ];

  if (styleRef) {
    content.push({ type: 'image', image: styleRef });
    content.push({
      type: 'text',
      text: 'IMAGE 2 (above): This is the PHOTOGRAPHIC STYLE I want. Match this studio lighting, warm off-white background, soft shadows underneath, and three-dimensional depth. The product should look physically present on a surface, not like a flat cutout.',
    });
  }

  content.push({
    type: 'text',
    text: `Now generate a NEW studio photograph of the product from Image 1, using the photographic style and studio environment from Image 2.

${shotConfig.prompt}

CRITICAL lighting details: Warm directional light from the upper left illuminates the product, creating soft graduated shadows on the right side. A gentle fill light from the right prevents deep blacks. The product sits on a smooth cream-coloured surface, casting a soft diffused shadow beneath it that grounds it in the scene. Slight specular highlights on the product edges reveal its three-dimensional form.

Output a square image (1:1 aspect ratio).`,
  });

  const result = await generateText({
    model: geminiImage,
    messages: [{ role: 'user', content }],
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
  recognition: z
    .number()
    .min(1)
    .max(5)
    .describe('Would a customer recognize this as the real product?'),
  labelLegibility: z
    .number()
    .min(1)
    .max(5)
    .describe('Can you read the brand name and product name?'),
  aiArtifacts: z
    .number()
    .min(1)
    .max(5)
    .describe('5 = no AI artifacts, 1 = obviously AI-generated'),
  styleConsistency: z
    .number()
    .min(1)
    .max(5)
    .describe('Matches studio style guide? White bg, centered, correct fill'),
  lightingMatch: z
    .number()
    .min(1)
    .max(5)
    .describe('Consistent studio lighting'),
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
  productType?: string,
): Promise<JudgeResult> {
  const result = await generateObject({
    model: claude,
    schema: judgeSchema,
    messages: [
      {
        role: 'user',
        content: [
          { type: 'image', image: referenceImage } as any,
          {
            type: 'text',
            text: 'This is the REFERENCE photo of the real product.',
          },
          { type: 'image', image: generatedImage } as any,
          {
            type: 'text',
            text: `This is an AI-generated studio shot ("${shotConfig.name}") of "${productName}".

Score each criterion 1-5:
1. Product recognition — would a customer recognize this as the real product?
2. Label legibility — can you read the brand name and product name?
3. AI artifacts — 5 = no artifacts, 1 = obviously fake (weird text, melted shapes, wrong colours)
4. Style consistency — warm off-white/cream background (NOT harsh pure white), product centered, correct framing, product looks 3D and physically present?
5. Lighting & depth — soft directional lighting with visible shadows underneath grounding the product? Product has three-dimensional depth, not a flat cutout look?

IMPORTANT: We WANT a warm off-white/cream background with visible soft shadows. Do NOT penalise for cream/beige tones or shadows — those are CORRECT. Penalise flat white backgrounds with no shadows.

${NO_INGREDIENTS_TYPES.includes(productType || '') ? 'CRITICAL: This is an accessory/wig/hair product. It should NOT have any printed text, ingredients labels, usage instructions, or stickers on it. If the generated image has hallucinated text or fake labels on the product, score AI artifacts as 1 and verdict should be REDO.' : ''}

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
  productType?: string,
  maxRetries: number = 3,
): Promise<StudioShot[]> {
  const configs = getShotConfigs(productName, brand, productType);
  const results: StudioShot[] = [];

  for (const config of configs) {
    console.log(`[Images] Generating ${config.name}...`);

    let bestShot: Buffer | null = null;
    let bestVerdict: Verdict = 'FALLBACK';

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const shot = await generateSingleShot(referenceImage, config);
        const judge = await judgeShot(
          shot,
          referenceImage,
          config,
          productName,
          productType,
        );

        if (judge.verdict === 'PASS') {
          bestShot = shot;
          bestVerdict = 'PASS';
          break;
        }

        if (judge.verdict === 'REDO' && attempt < maxRetries) {
          console.log(
            `[Images] Retrying ${config.name} (attempt ${attempt + 1}/${maxRetries})...`,
          );
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
        console.error(
          `[Images] Error generating ${config.name} (attempt ${attempt}):`,
          err,
        );
        if (attempt === maxRetries && !bestShot) {
          // Use reference image as fallback, processed to studio style
          console.log(
            `[Images] Using reference image as fallback for ${config.name}`,
          );
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
  console.log(
    `[Images] Complete: ${passed} PASS, ${redone} REDO, ${fallen} FALLBACK`,
  );

  return results;
}
