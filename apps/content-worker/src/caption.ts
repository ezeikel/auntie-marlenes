/**
 * AI-generated social media captions using Claude.
 *
 * Strategy based on Perplexity deep research (April 2026):
 * - 125-300 characters optimal (mobile-first, most won't tap "more")
 * - Open with a micro-story / emotional hook, not product specs
 * - 3-5 hashtags max (hashtags don't drive reach per Mosseri, only discovery)
 * - Keywords woven naturally into caption beat hashtags for algorithm
 * - CTA should match buyer readiness: "Tap to shop" or "Link in bio"
 * - Authentic auntie voice > corporate copy
 * - No pricing in captions (drives more clicks to find out)
 */

import { generateText } from 'ai';
import { anthropic } from '@ai-sdk/anthropic';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const claude: any = anthropic('claude-sonnet-4-20250514');

const IG_CAPTION_PROMPT = `Write an Instagram caption for a product post by "Auntie Marlene's" — a Black-owned hair and beauty store from South London.

Product: {{PRODUCT_NAME}}
Brand: {{BRAND}}
Category: {{CATEGORY}}

RULES (follow exactly):
- 2-3 short sentences MAXIMUM. Keep it under 250 characters
- Open with the EMOTIONAL PROBLEM this product solves (not product name)
- Write as a warm, knowledgeable auntie — conversational, not corporate
- Weave keywords naturally (e.g. "natural hair", "moisture", "curls") — don't list them
- 1-2 emojis only. Not excessive
- End with ONE clear CTA: "Tap to shop" or "Link in bio"
- Only 3-4 hashtags on a new line. Must include #blackowned. Pick 2-3 that someone would actually SEARCH for
- British English
- Do NOT include pricing
- Do NOT use "introducing" or "check out"

GOOD EXAMPLE:
"Dry ends that won't cooperate? This is the deep moisture your curls have been begging for 💛 Link in bio

#blackowned #naturalhaircommunity #washdaytips"

Respond with ONLY the caption text.`;

const FB_CAPTION_PROMPT = `Write a Facebook post caption for a product by "Auntie Marlene's" — a Black-owned hair and beauty store from South London.

Product: {{PRODUCT_NAME}}
Brand: {{BRAND}}
Category: {{CATEGORY}}

RULES:
- 2-4 sentences. Can be slightly longer than Instagram (up to 400 chars)
- Conversational, warm auntie tone — like you're recommending to a friend
- Include the product benefit and who it's for
- End with CTA: "Shop at auntiemarlenes.com" or "Visit our shop — link in bio"
- 1-2 emojis
- No hashtags (they don't work on Facebook)
- British English
- Do NOT include pricing

Respond with ONLY the caption text.`;

/**
 * Generate an Instagram caption for a product.
 */
export async function generateInstagramCaption(product: {
  name: string;
  brand: string;
  category: string;
}): Promise<string> {
  const prompt = IG_CAPTION_PROMPT
    .replace('{{PRODUCT_NAME}}', product.name)
    .replace('{{BRAND}}', product.brand)
    .replace('{{CATEGORY}}', product.category);

  const result = await generateText({ model: claude, prompt });
  const caption = result.text.trim();
  console.log(`[Caption] IG caption generated (${caption.length} chars)`);
  return caption;
}

/**
 * Generate a Facebook caption for a product.
 */
export async function generateFacebookCaption(product: {
  name: string;
  brand: string;
  category: string;
}): Promise<string> {
  const prompt = FB_CAPTION_PROMPT
    .replace('{{PRODUCT_NAME}}', product.name)
    .replace('{{BRAND}}', product.brand)
    .replace('{{CATEGORY}}', product.category);

  const result = await generateText({ model: claude, prompt });
  const caption = result.text.trim();
  console.log(`[Caption] FB caption generated (${caption.length} chars)`);
  return caption;
}

/**
 * Generate captions for both platforms.
 */
export async function generateCaptions(product: {
  name: string;
  brand: string;
  category: string;
}): Promise<{ instagram: string; facebook: string }> {
  const [instagram, facebook] = await Promise.all([
    generateInstagramCaption(product),
    generateFacebookCaption(product),
  ]);
  return { instagram, facebook };
}
