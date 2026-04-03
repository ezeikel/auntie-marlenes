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

import { generateObject } from 'ai';
import { anthropic } from '@ai-sdk/anthropic';
import { z } from 'zod';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const claude: any = anthropic('claude-sonnet-4-20250514');

const captionSchema = z.object({
  instagram: z.object({
    text: z.string().describe('The main caption text (2-3 sentences, under 250 chars). Open with emotional hook. Warm auntie tone. End with CTA.'),
    hashtags: z.array(z.string()).max(4).describe('3-4 hashtags. Must include #blackowned. Pick tags people actually search for.'),
  }),
  facebook: z.object({
    text: z.string().describe('Facebook caption (2-4 sentences, up to 400 chars). Conversational, recommend to a friend. End with CTA to shop. No hashtags.'),
  }),
});

export type CaptionResult = z.infer<typeof captionSchema>;

const CAPTION_SYSTEM = `You write social media captions for "Auntie Marlene's" — a Black-owned hair and beauty store from South London.

Voice: warm, knowledgeable auntie. Conversational, not corporate. Like recommending to a niece.
Language: British English.

Rules:
- Open with the EMOTIONAL PROBLEM the product solves, not the product name
- 1-2 emojis only
- Never include pricing
- Never use "introducing" or "check out"
- Instagram CTA: "Tap to shop" or "Link in bio"
- Facebook CTA: "Shop at auntiemarlenes.com"`;

/**
 * Generate structured captions for both platforms.
 */
export async function generateCaptions(product: {
  name: string;
  brand: string;
  category: string;
}): Promise<CaptionResult> {
  // @ts-expect-error — model type mismatch from pnpm hoisting
  const result = await generateObject({
    model: claude,
    schema: captionSchema,
    system: CAPTION_SYSTEM,
    prompt: `Generate Instagram and Facebook captions for: ${product.name} by ${product.brand} (category: ${product.category})`,
  });

  const captions = result.object as CaptionResult;

  console.log(`[Caption] IG: ${captions.instagram.text.length} chars, ${captions.instagram.hashtags.length} tags`);
  console.log(`[Caption] FB: ${captions.facebook.text.length} chars`);

  return captions;
}

/**
 * Format the Instagram caption with hashtags on a new line.
 */
export function formatInstagramCaption(caption: CaptionResult['instagram']): string {
  const tags = caption.hashtags.map((t) => (t.startsWith('#') ? t : `#${t}`)).join(' ');
  return `${caption.text}\n\n${tags}`;
}
