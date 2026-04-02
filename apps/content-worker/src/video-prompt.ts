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
 * Build a bespoke 5-layer Veo prompt from scene analysis.
 *
 * Layer 1: Camera lock (most important — comes first)
 * Layer 2: Product immobility
 * Layer 3: Environmental animation (dynamic, based on scene)
 * Layer 4: Lighting and text preservation
 * Layer 5: Technical and sensory
 */
function buildVeoPrompt(analysis: SceneAnalysis): {
  prompt: string;
  negative_prompt: string;
} {
  // Layer 1: Camera lock
  const cameraLock =
    'Static locked-off camera position held completely stationary throughout the entire clip with zero camera movement in any direction.';

  // Layer 2: Product immobility
  const productLock = `${analysis.product_description} on ${analysis.surface} remains perfectly motionless and completely static with zero movement, no rotation, no shifting position.`;

  // Layer 3: Environmental animation — dynamic based on what's actually in the scene
  const envAnimations: string[] = [];

  for (const element of analysis.animatable_elements) {
    const lower = element.toLowerCase();
    if (lower.includes('light') || lower.includes('sun') || lower.includes('shadow')) {
      envAnimations.push(
        `${analysis.lighting_type} gradually shifts subtly across ${analysis.surface} revealing product details while product stays in exact same position`,
      );
    } else if (lower.includes('steam') || lower.includes('mist') || lower.includes('vapor')) {
      envAnimations.push(
        'gentle steam wisps drift softly upward in background air without approaching product',
      );
    } else if (lower.includes('plant') || lower.includes('leaf') || lower.includes('leaves')) {
      envAnimations.push(
        'green plant leaves shift subtly with minimal barely perceptible motion creating living atmosphere',
      );
    } else if (lower.includes('fabric') || lower.includes('towel') || lower.includes('curtain') || lower.includes('cloth')) {
      envAnimations.push(
        `${lower} barely moves with gentle unseen air current creating subtle texture`,
      );
    } else if (lower.includes('dust') || lower.includes('particle')) {
      envAnimations.push(
        'subtle dust particles float gently in light rays without disturbing product',
      );
    } else if (lower.includes('candle') || lower.includes('flame')) {
      envAnimations.push(
        'candle flame flickers softly casting gentle dancing shadows in background',
      );
    } else if (lower.includes('water') || lower.includes('reflection') || lower.includes('ripple')) {
      envAnimations.push(
        'subtle water reflections ripple gently creating soft ambient movement in background',
      );
    } else {
      envAnimations.push(
        `${lower} exhibits the faintest subtle natural motion`,
      );
    }
  }

  // Take max 3 animations to keep prompt focused
  const environmentLayer = envAnimations.slice(0, 3).join('. ') + '.';

  // Layer 4: Lighting and text preservation
  const textPreservation = `Product packaging text and labels remain perfectly sharp and legible throughout animation. ${analysis.lighting_type} maintains consistent illumination on product typography ensuring crisp definition and detail visibility.`;

  // Layer 5: Technical and sensory
  const moodMap: Record<string, string> = {
    calm: 'serene peaceful premium',
    warm: 'warm inviting luxurious',
    cozy: 'intimate warm welcoming',
    professional: 'professional sophisticated clean',
    luxurious: 'luxurious prestige elegant',
    natural: 'natural organic authentic',
    fresh: 'fresh clean invigorating',
  };
  const moodDesc = moodMap[analysis.mood] || 'premium luxury beauty';

  const technical = `6 second duration. ${moodDesc} beauty brand aesthetic. Cinematic colour grading with warm tones.`;

  // Combine all layers
  const prompt = [cameraLock, productLock, environmentLayer, textPreservation, technical].join(' ');

  // Negative prompt — comprehensive protection
  const negative_prompt = [
    'camera movement',
    'zoom in',
    'zoom out',
    'pan',
    'camera rotation',
    'camera tilt',
    'product movement',
    'product rotation',
    'product shift',
    'text distortion',
    'label blur',
    'packaging warp',
    'perspective change',
    'parallax motion',
    'depth shifts',
    'dynamic motion',
    'fast movement',
  ].join(', ');

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
