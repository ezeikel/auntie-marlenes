/**
 * AI-generated product copy for Shopify listings.
 * Uses Claude to write title, description, SEO meta, and tags.
 */

import { anthropic } from '@ai-sdk/anthropic';
import { generateObject } from 'ai';
import { z } from 'zod';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const claude: any = anthropic('claude-sonnet-4-20250514');

const productCopySchema = z.object({
  title: z
    .string()
    .describe(
      'Clean Shopify product title. Format: "Brand Name Product Name Size" e.g. "Mielle Rosemary Mint Scalp & Hair Strengthening Oil 59ml"',
    ),
  descriptionHtml: z
    .string()
    .describe(
      "HTML product description. Include: what it does, key ingredients, who it's for, how to use. 150-300 words. Use <p>, <ul>, <li> tags. British English.",
    ),
  seoTitle: z
    .string()
    .describe(
      'SEO meta title, max 60 chars. Include brand + product type + key benefit.',
    ),
  seoDescription: z
    .string()
    .describe(
      'SEO meta description, max 155 chars. Compelling, includes key search terms.',
    ),
  productType: z
    .string()
    .describe(
      "Shopify product type. One of: Hair Care, Skin Care, Body Care, Wigs & Extensions, Braiding Hair, Styling, Accessories, Kids, Men's",
    ),
  tags: z
    .array(z.string())
    .describe(
      'Shopify tags for collections and filtering. Include: brand name, category, hair type, key ingredients. 5-10 tags.',
    ),
});

export type ProductCopy = z.infer<typeof productCopySchema>;

const SYSTEM_PROMPT = `You write product listings for "Auntie Marlene's" — a Black-owned hair and beauty e-commerce store from South London (auntiemarlenes.com).

Voice: warm, confident, knowing. Like someone in your community who genuinely knows their stuff recommending a product. Not corporate, not try-hard familiar.
Language: British English.

Rules:
- No terms of endearment (honey, babe, queen, girl, hun, sis)
- Focus on specific ingredients and what they do
- Mention hair/skin types the product suits
- Include practical "how to use" guidance
- Be honest about what the product does — no miracle claims
- Tags should be lowercase, no hashtags`;

/**
 * Generate complete product copy for a Shopify listing.
 */
export async function generateProductCopy(product: {
  name: string;
  brand: string;
  category: string;
}): Promise<ProductCopy> {
  console.log(`[Copy] Generating product copy for: ${product.name}...`);

  const result = await generateObject({
    model: claude,
    schema: productCopySchema,
    system: SYSTEM_PROMPT,
    prompt: `Generate a complete Shopify product listing for: "${product.name}" by ${product.brand} (category: ${product.category}).

Research this product and include accurate information about its ingredients, benefits, and usage. If you're unsure about specific details, focus on the brand's general formulation approach and the product category's typical benefits.`,
  });

  const copy = result.object as ProductCopy;

  console.log(`[Copy] Title: ${copy.title}`);
  console.log(`[Copy] Type: ${copy.productType}`);
  console.log(`[Copy] Tags: ${copy.tags.join(', ')}`);
  console.log(`[Copy] SEO: ${copy.seoTitle}`);

  return copy;
}
