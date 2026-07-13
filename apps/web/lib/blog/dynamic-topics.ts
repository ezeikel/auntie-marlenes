/**
 * Dynamic blog topic generation (never-dry guarantee)
 *
 * When the fixed BLOG_TOPICS list is exhausted, this asks the model for a
 * fresh batch of on-brand, long-tail, deduped hair and beauty topics so the
 * auto-publishing pipeline never runs dry and never throws.
 */

import { generateObject } from 'ai';
import { z } from 'zod';
import { models } from '@/lib/ai/models';
import { BLOG_CATEGORIES, type BlogCategory, type BlogTopic } from './topics';

// Schema for a batch of dynamically generated topics
const dynamicTopicsSchema = z.object({
  topics: z
    .array(
      z.object({
        topic: z
          .string()
          .describe('A specific, long-tail blog post title (not a category)'),
        category: z
          .enum(BLOG_CATEGORIES)
          .describe('The best-fitting blog category for this topic'),
        keywords: z
          .array(z.string())
          .describe('3-5 relevant search keywords for the topic'),
      }),
    )
    .describe('A batch of fresh, deduped blog topics'),
});

type RawGeneratedTopic = {
  topic: string;
  category: BlogCategory;
  keywords: string[];
};

const DYNAMIC_TOPICS_SYSTEM = `You are a content strategist for "Auntie Marlene's", a Black-owned hair and beauty supply store in South London serving the UK and worldwide.

You generate fresh, specific, long-tail blog topic ideas about Afro and textured hair care, protective styling, hair growth, melanin-rich skincare, beauty, and wellness for a UK audience.

Rules for every topic you produce:
- Be specific and long-tail, not a broad category (e.g. "How to Refresh a Wash and Go on Day Three" not "Wash and Go").
- Write in British English (favour, colour, moisturiser).
- Stay strictly on-brand: textured/afro hair care, protective styles, hair growth, melanin-rich skincare, beauty, wellness, trends, hair types.
- Never frame dark or melanin-rich skin as needing to be "brightened", "lightened", "corrected" or "fixed". Celebrate melanin; frame benefits as enhancing natural beauty, never changing skin tone.
- Do not fabricate statistics, studies, percentages, or research findings in topic titles.
- Do not use em dashes anywhere.
- Topics must be educational and practical, not medical advice.
- Each topic must be genuinely distinct from the others in the batch and from any topics already listed as covered.`;

/**
 * Generate a batch of fresh, deduped blog topics.
 *
 * Filters out anything already covered (by topic title) or in the seed list,
 * and returns valid BlogTopic entries. Returns an empty array on failure so
 * callers can degrade gracefully.
 */
export async function generateDynamicTopics(
  covered: Set<string>,
  seedSlugs: Set<string>,
  count = 5,
): Promise<BlogTopic[]> {
  const avoidList = Array.from(new Set([...covered, ...seedSlugs]));
  // Keep the prompt bounded; the most recent covered topics matter most.
  const avoidSample = avoidList.slice(-60);

  const prompt = `Generate ${count} brand-new blog topics for Auntie Marlene's.

Do NOT repeat, paraphrase, or closely overlap with any of these already-covered or planned topics:
${avoidSample.length > 0 ? `- ${avoidSample.join('\n- ')}` : 'None yet.'}

Return exactly ${count} distinct topics, each with a fitting category and 3-5 keywords.`;

  try {
    const { object } = await generateObject({
      model: models.textFast,
      schema: dynamicTopicsSchema,
      system: DYNAMIC_TOPICS_SYSTEM,
      prompt,
      temperature: 0.9,
    });

    const seen = new Set<string>();

    return object.topics
      .map(
        (t: RawGeneratedTopic): BlogTopic => ({
          topic: t.topic.trim(),
          category: t.category,
          keywords: t.keywords,
        }),
      )
      .filter((t: BlogTopic) => {
        if (!t.topic) return false;

        const key = t.topic.toLowerCase();

        // Skip anything already covered, in the seed list, or duplicated in-batch
        if (covered.has(t.topic) || seedSlugs.has(t.topic)) return false;
        if (seen.has(key)) return false;

        seen.add(key);
        return true;
      });
  } catch (error) {
    console.error('Dynamic topic generation failed:', error);
    return [];
  }
}
