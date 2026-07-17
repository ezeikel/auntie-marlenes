import { anthropic } from '@ai-sdk/anthropic';
import { openai } from '@ai-sdk/openai';

// Model IDs — mirror apps/web/lib/ai/models.ts. The worker's blog pipeline uses
// OpenAI for text (gpt-4o / gpt-4o-mini) + gpt-image-2 for the featured-image
// fallback, and Claude Opus 4.8 as the vision judge for Pexels candidates.
export const MODEL_IDS = {
  GPT_4O: 'gpt-4o',
  GPT_4O_MINI: 'gpt-4o-mini',
  GPT_IMAGE_2: 'gpt-image-2', // Blog featured-image generation (fallback)
  CLAUDE_OPUS_4_8: 'claude-opus-4-8', // Opus 4.8 vision judge
} as const;

export const models = {
  // Primary text model — complex tasks like full blog content generation.
  text: openai(MODEL_IDS.GPT_4O),

  // Fast text model — metadata, image search terms, dynamic topics.
  textFast: openai(MODEL_IDS.GPT_4O_MINI),

  // Opus 4.8 vision judge — evaluates blog featured-image relevance.
  judge: anthropic(MODEL_IDS.CLAUDE_OPUS_4_8),

  // gpt-image-2 generation — featured images when Pexels has no suitable photo.
  image: openai.image(MODEL_IDS.GPT_IMAGE_2),
};

export type ModelKey = keyof typeof models;
