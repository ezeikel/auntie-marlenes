import { anthropic } from '@ai-sdk/anthropic';
import { google } from '@ai-sdk/google';

// Model IDs
export const MODEL_IDS = {
  // Anthropic text model — estate default for text generation
  CLAUDE_SONNET_5: 'claude-sonnet-5',

  // Google Gemini models
  GEMINI_FLASH_LITE: 'gemini-3.1-flash-lite', // Fast vision/analytics
  GEMINI_PRO: 'gemini-3.1-pro-preview', // Most intelligent (AI Judge)
  GEMINI_PRO_IMAGE: 'gemini-3-pro-image-preview', // Image generation (no 3.1 pro-image exists)
} as const;

// Configured model instances
export const models = {
  // Primary text model - for complex tasks like blog content generation
  text: anthropic(MODEL_IDS.CLAUDE_SONNET_5),

  // Fast text model - for metadata, search terms, simple tasks
  textFast: anthropic(MODEL_IDS.CLAUDE_SONNET_5),

  // Balanced vision model for analytics
  // Best for: image analysis, categorization, structured extraction
  analytics: google(MODEL_IDS.GEMINI_FLASH_LITE),

  // Most intelligent vision model for evaluation (AI Judge)
  // Best for: evaluating image relevance, quality assessment
  vision: google(MODEL_IDS.GEMINI_PRO),

  // Gemini image generation model
  // Best for: blog featured images when Pexels doesn't have suitable photos
  geminiImage: google(MODEL_IDS.GEMINI_PRO_IMAGE),
};

export type ModelKey = keyof typeof models;
