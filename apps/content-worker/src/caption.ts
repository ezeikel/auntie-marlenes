/**
 * AI-generated social media captions using Claude.
 * Product-focused, short, punchy — different from blog captions.
 */

import { generateText } from 'ai';
import { anthropic } from '@ai-sdk/anthropic';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const claude: any = anthropic('claude-sonnet-4-20250514');

const CAPTION_PROMPT = `Generate an Instagram caption for a beauty product post by "Auntie Marlene's" — a Black-owned hair and beauty store from South London.

Product: {{PRODUCT_NAME}}
Brand: {{BRAND}}
Category: {{CATEGORY}}

Requirements:
- 2-4 short sentences, warm and relatable tone (like an auntie giving advice)
- Include 1-2 relevant emojis (not excessive)
- End with a clear CTA: "Tap to shop" or "Shop via link in bio"
- Include 8-12 relevant hashtags on a new line
- Must include: #blackowned #auntiemarlenes
- Add category-specific hashtags (#naturalhaircommunity #washday #curlyhair etc)
- British English

Respond with ONLY the caption text, no quotes or formatting.`;

/**
 * Generate an Instagram/Facebook caption for a product.
 */
export async function generateCaption(product: {
  name: string;
  brand: string;
  category: string;
}): Promise<string> {
  const prompt = CAPTION_PROMPT.replace('{{PRODUCT_NAME}}', product.name)
    .replace('{{BRAND}}', product.brand)
    .replace('{{CATEGORY}}', product.category);

  const result = await generateText({
    model: claude,
    prompt,
  });

  const caption = result.text.trim();
  console.log(`[Caption] Generated (${caption.length} chars)`);

  return caption;
}
