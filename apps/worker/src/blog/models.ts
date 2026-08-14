import { anthropic } from '@ai-sdk/anthropic';
import { openai } from '@ai-sdk/openai';

// Model IDs, mirroring apps/web/lib/ai/models.ts. The worker's blog pipeline
// uses Claude Sonnet 5 for text and as the vision judge for Pexels candidates,
// plus gpt-image-2 for the featured-image fallback.
export const MODEL_IDS = {
  CLAUDE_SONNET_5: 'claude-sonnet-5', // Text generation + vision judge
  GPT_IMAGE_2: 'gpt-image-2', // Blog featured-image generation (fallback)
} as const;

export const models = {
  // Primary text model — complex tasks like full blog content generation.
  text: anthropic(MODEL_IDS.CLAUDE_SONNET_5),

  // Fast text model — metadata, image search terms, dynamic topics.
  textFast: anthropic(MODEL_IDS.CLAUDE_SONNET_5),

  // Sonnet 5 vision judge: evaluates blog featured-image relevance.
  judge: anthropic(MODEL_IDS.CLAUDE_SONNET_5),

  // gpt-image-2 generation — featured images when Pexels has no suitable photo.
  image: openai.image(MODEL_IDS.GPT_IMAGE_2),
};

export type ModelKey = keyof typeof models;
