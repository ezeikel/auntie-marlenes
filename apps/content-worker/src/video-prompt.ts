/**
 * Dynamic Veo prompt generation.
 *
 * Analyses the generated scene image with Gemini Flash to understand
 * what's in the scene, then crafts a bespoke 5-layer Veo prompt
 * optimised for subtle ambient motion with perfect text preservation.
 *
 * Based on Perplexity deep research on Veo 3.1 prompting best practices.
 */

import { generateText } from 'ai';
import { google } from '@ai-sdk/google';

// Gemini Flash for fast image analysis (not image generation)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const geminiFlash: any = google('gemini-3-flash-preview');

const ANALYSIS_PROMPT = `You are analysing a product photography image for an Instagram reel video.

Describe the scene in detail. I need:
1. PRODUCT: What product is shown? Where is it positioned? What surface is it on?
2. BACKGROUND ELEMENTS: What objects/textures are in the background? (towels, plants, shelves, mirrors, etc.)
3. LIGHTING: What type of lighting is present? (morning light, golden hour, soft diffused, etc.) What direction?
4. ATMOSPHERE: What mood does the scene convey? (calm bathroom, professional salon, cozy vanity, etc.)
5. ANIMATABLE ELEMENTS: Which background elements could have subtle natural motion? (fabric, leaves, steam, light shifts, dust particles, candle flames, curtains, water reflections)

Respond in JSON format:
{
  "product_description": "brief description of the product and its position",
  "surface": "what the product sits on",
  "background_elements": ["list", "of", "elements"],
  "lighting_type": "description of lighting",
  "lighting_direction": "where light comes from",
  "mood": "one word mood descriptor",
  "animatable_elements": ["list of things that could subtly move"],
  "scene_type": "bathroom | salon | vanity | kitchen | shelf | outdoor | other"
}`;

interface SceneAnalysis {
  product_description: string;
  surface: string;
  background_elements: string[];
  lighting_type: string;
  lighting_direction: string;
  mood: string;
  animatable_elements: string[];
  scene_type: string;
}

/**
 * Analyse a scene image using Gemini Flash to understand its contents.
 */
async function analyseScene(sceneImage: Buffer): Promise<SceneAnalysis> {
  console.log('[VideoPrompt] Analysing scene image...');

  const result = await generateText({
    model: geminiFlash,
    messages: [
      {
        role: 'user',
        content: [
          { type: 'image', image: sceneImage } as any,
          { type: 'text', text: ANALYSIS_PROMPT },
        ],
      },
    ],
  });

  try {
    const text = result.text.replace(/```json?\n?/g, '').replace(/```/g, '').trim();
    const analysis = JSON.parse(text) as SceneAnalysis;
    console.log(`[VideoPrompt] Scene analysis: ${analysis.scene_type}, ${analysis.mood}, ${analysis.animatable_elements.length} animatable elements`);
    return analysis;
  } catch {
    console.warn('[VideoPrompt] Failed to parse scene analysis, using defaults');
    return {
      product_description: 'beauty product',
      surface: 'surface',
      background_elements: [],
      lighting_type: 'soft natural light',
      lighting_direction: 'from window',
      mood: 'calm',
      animatable_elements: ['light'],
      scene_type: 'bathroom',
    };
  }
}

/**
 * Build a bespoke Veo prompt from scene analysis.
 *
 * Key learnings from research:
 * - Shorter prompts = better adherence
 * - Only ONE environmental animation (multiple cause jitter)
 * - 4 seconds not 6 (reduces cumulative drift)
 * - "buttery smooth", "rock steady", "zero jitter" = magic keywords
 * - 1080p for better edge tracking
 */
function buildVeoPrompt(analysis: SceneAnalysis): {
  prompt: string;
  negative_prompt: string;
} {
  // Pick the BEST single environmental animation (only one — multiple cause jitter)
  let envAnimation = `${analysis.lighting_type} gradually shifts across surfaces`;

  for (const element of analysis.animatable_elements) {
    const lower = element.toLowerCase();
    if (lower.includes('steam') || lower.includes('mist')) {
      envAnimation = 'soft steam wisps drift slowly upward in background';
      break;
    } else if (lower.includes('candle') || lower.includes('flame')) {
      envAnimation = 'candle flame flickers softly in background';
      break;
    } else if (lower.includes('dust') || lower.includes('particle')) {
      envAnimation = 'subtle dust particles float gently through light rays';
      break;
    } else if (lower.includes('curtain') || lower.includes('fabric')) {
      envAnimation = 'fabric barely sways with an imperceptible breeze';
      break;
    }
  }

  const prompt = [
    // Camera + stability (most important — first)
    'Static locked-off camera, rock steady, perfectly stable, zero jitter, buttery smooth motion.',
    // Product lock
    `Product on ${analysis.surface} remains completely motionless, fixed in place.`,
    // ONE subtle environmental animation
    `${envAnimation}.`,
    // Text preservation
    'Product text remains sharp and legible.',
    // Technical
    '4 second clip, 1080p, cinematic lighting, premium beauty aesthetic.',
  ].join(' ');

  const negative_prompt =
    'camera movement, zoom, pan, wobble, shake, jitter, flicker, product movement, product rotation, text distortion, label blur, fast motion, dynamic motion, parallax';

  return { prompt, negative_prompt };
}

/**
 * Generate a dynamic Veo prompt by analysing the scene image.
 * Returns the optimised prompt and negative prompt.
 */
export async function generateVeoPrompt(sceneImage: Buffer): Promise<{
  prompt: string;
  negative_prompt: string;
}> {
  const analysis = await analyseScene(sceneImage);
  const veoPrompt = buildVeoPrompt(analysis);

  console.log(`[VideoPrompt] Generated prompt (${veoPrompt.prompt.length} chars)`);
  console.log(`[VideoPrompt] Preview: ${veoPrompt.prompt.substring(0, 120)}...`);

  return veoPrompt;
}
