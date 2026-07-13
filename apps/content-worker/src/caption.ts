/**
 * AI-generated social media captions using Claude with structured output.
 *
 * Strategy based on Perplexity deep research (April 2026):
 * - 125-300 characters optimal for IG
 * - Open with emotional hook, not product specs
 * - 3-5 hashtags max (per Mosseri: hashtags don't drive reach)
 * - No pricing in captions
 * - Separate strategy for IG vs FB
 */

import { anthropic } from '@ai-sdk/anthropic';
import { generateObject } from 'ai';
import { z } from 'zod';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const claude: any = anthropic('claude-sonnet-4-20250514');

const captionSchema = z.object({
  instagram: z.object({
    post: z.object({
      text: z
        .string()
        .describe(
          'Static post caption (150-300 chars). Hook first line → specific product benefit → CTA. Mention an ingredient or result.',
        ),
      hashtags: z
        .array(z.string())
        .max(4)
        .describe(
          '3-4 hashtags. Must include #blackowned. Use searchable terms.',
        ),
    }),
    reel: z.object({
      text: z
        .string()
        .describe(
          'Reel caption (under 150 chars). Short hook that complements (not repeats) the video. End with CTA.',
        ),
      hashtags: z
        .array(z.string())
        .max(4)
        .describe(
          '3-4 hashtags. Must include #blackowned. Use searchable terms.',
        ),
    }),
  }),
  facebook: z.object({
    post: z
      .string()
      .describe(
        'FB post caption (200-400 chars). Educational — mention ingredients, what they do, who it\'s for. End with "Shop at auntiemarlenes.com". No hashtags.',
      ),
    reel: z
      .string()
      .describe(
        'FB reel caption (100-250 chars). Conversational recommendation. End with "Find it at auntiemarlenes.com". No hashtags.',
      ),
  }),
});

export type CaptionResult = z.infer<typeof captionSchema>;

const CAPTION_SYSTEM = `You write social media captions for "Auntie Marlene's" — a Black-owned hair and beauty brand from South London. UK-based e-commerce store (auntiemarlenes.com).

Voice: warm, confident, knowing. Like someone in your community who genuinely knows their stuff put you onto this product. Not corporate, not try-hard familiar.
Language: British English.

CRITICAL RULES:
- No terms of endearment (honey, babe, queen, girl, hun, sis, bestie)
- Never include pricing
- Never use "introducing" or "check out"
- 1-2 emojis MAX (emojis amplify good copy but don't replace it)

PLATFORM STRATEGY:

Instagram Post (static image):
- LONG caption converts better (150-300 chars). Strong hook in first line is essential (this is what shows before "more").
- Open with the specific PROBLEM the product solves, then the benefit, then CTA.
- Mention a specific product benefit or ingredient (e.g. "rosemary oil for scalp health" not just "great for your hair").
- CTA: "Shop now — link in bio" or "Tap to shop" (specific CTAs convert 350% better than generic ones).
- 3-4 hashtags including #blackowned. Use searchable keyword phrases in caption text too (IG now indexes caption text for search).

Instagram Reel:
- SHORT caption (under 150 chars). The video does the talking — caption should COMPLEMENT, not repeat.
- Hook-driven first line. Can be a question or bold statement.
- CTA: "Link in bio" or "Shop at auntiemarlenes.com".
- 3-4 hashtags. Use keyword terms people search for (e.g. "natural hair care", "wash day routine").

Facebook Post:
- LONGER and more educational (200-400 chars). FB audience responds to ingredient knowledge and product education.
- Can mention specific ingredients and what they do for the hair/skin.
- CTA: "Shop at auntiemarlenes.com" with the full URL.
- No hashtags on Facebook.

Facebook Reel:
- Medium length (100-250 chars). Conversational, like recommending to a friend.
- CTA: "Find it at auntiemarlenes.com".
- No hashtags on Facebook.`;

/**
 * Generate structured captions for both platforms.
 * Pass scene description for richer context.
 */
export async function generateCaptions(product: {
  name: string;
  brand: string;
  category: string;
  scene?: string;
}): Promise<CaptionResult> {
  const sceneContext = product.scene
    ? `\nThe product scene shows: ${product.scene}. Use this visual context to make captions feel specific and grounded.`
    : '';

  // @ts-expect-error — model type mismatch from pnpm hoisting
  const result = await generateObject({
    model: claude,
    schema: captionSchema,
    system: CAPTION_SYSTEM,
    prompt: `Generate Instagram and Facebook captions (post + reel for each platform) for: ${product.name} by ${product.brand} (category: ${product.category}).${sceneContext}`,
  });

  const captions = result.object as CaptionResult;

  console.log(
    `[Caption] IG post: ${captions.instagram.post.text.length} chars, reel: ${captions.instagram.reel.text.length} chars`,
  );
  console.log(
    `[Caption] FB post: ${captions.facebook.post.length} chars, reel: ${captions.facebook.reel.length} chars`,
  );

  return captions;
}

/**
 * Format an Instagram caption with hashtags on a new line.
 */
export function formatInstagramCaption(caption: {
  text: string;
  hashtags: string[];
}): string {
  const tags = caption.hashtags
    .map((t) => (t.startsWith('#') ? t : `#${t}`))
    .join(' ');
  return `${caption.text}\n\n${tags}`;
}
