import { google } from '@ai-sdk/google';
import { openai } from '@ai-sdk/openai';

// Model IDs
export const MODEL_IDS = {
  // OpenAI models
  GPT_4O: 'gpt-4o',
  GPT_4O_MINI: 'gpt-4o-mini',

  // Google Gemini models (Latest Jan 2026)
  GEMINI_3_FLASH: 'gemini-3-flash-preview', // Fast vision/analytics
  GEMINI_3_PRO: 'gemini-3-pro-preview', // Most intelligent (AI Judge)
  GEMINI_3_PRO_IMAGE: 'gemini-3-pro-image-preview', // Image generation
} as const;

// Configured model instances
export const models = {
  // Primary text model - for complex tasks like blog content generation
  text: openai(MODEL_IDS.GPT_4O),

  // Fast text model - for metadata, search terms, simple tasks
  textFast: openai(MODEL_IDS.GPT_4O_MINI),

  // Balanced vision model for analytics
  // Best for: image analysis, categorization, structured extraction
  analytics: google(MODEL_IDS.GEMINI_3_FLASH),

  // Most intelligent vision model for evaluation (AI Judge)
  // Best for: evaluating image relevance, quality assessment
  vision: google(MODEL_IDS.GEMINI_3_PRO),

  // Gemini image generation model
  // Best for: blog featured images when Pexels doesn't have suitable photos
  geminiImage: google(MODEL_IDS.GEMINI_3_PRO_IMAGE),
};

export type ModelKey = keyof typeof models;
