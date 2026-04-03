/**
 * Image-to-video generation via fal.ai.
 *
 * Each model gets its own optimised prompt template.
 * Scene analysis via Claude (precise, controlled descriptions).
 */

import { fal } from '@fal-ai/client';
import { uploadFile } from './storage';
import { generateText } from 'ai';
import { anthropic } from '@ai-sdk/anthropic';

// Configure fal.ai
fal.config({
  credentials: process.env.FAL_KEY!,
});

// Claude for scene analysis
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const claude: any = anthropic('claude-sonnet-4-20250514');

// Available models
const FAL_MODELS = {
  'kling-v3': 'fal-ai/kling-video/v3/pro/image-to-video',
  'kling-o3': 'fal-ai/kling-video/o3/standard/image-to-video',
  'seedance': 'fal-ai/bytedance/seedance/v1.5/pro/image-to-video',
  'sora': 'fal-ai/sora-2/image-to-video',
  'sora-pro': 'fal-ai/sora-2/image-to-video/pro',
  'pixverse': 'fal-ai/pixverse/v6/image-to-video',
  'hailuo': 'fal-ai/minimax/hailuo-02/standard/image-to-video',
} as const;

export type FalVideoModel = keyof typeof FAL_MODELS;

// ─── Scene Analysis ──────────────────────────────────────────────────────────

interface SceneAnalysis {
  product: string;
  surface: string;
  lighting: string;
}

async function analyseScene(sceneImage: Buffer): Promise<SceneAnalysis> {
  console.log('[Video] Analysing scene with Claude...');

  const result = await generateText({
    model: claude,
    messages: [
      {
        role: 'user',
        content: [
          { type: 'image', image: sceneImage } as any,
          {
            type: 'text',
            text: `Describe this product photo in exactly 3 short phrases separated by |

Format: product description | surface it sits on | lighting description

Example: "A hair cream jar with orange lid | rustic wooden shelf | warm golden side light from a window"

Rules:
- Describe ONLY the product and its immediate surface
- Do NOT mention any other objects (towels, plants, accessories)
- Keep each phrase under 10 words
- Respond with ONLY the 3 phrases separated by |`,
          },
        ],
      },
    ],
  });

  const parts = result.text.trim().split('|').map((s) => s.trim());

  const analysis = {
    product: parts[0] || 'beauty product',
    surface: parts[1] || 'counter',
    lighting: parts[2] || 'soft natural light',
  };

  console.log(`[Video] Scene: ${analysis.product} | ${analysis.surface} | ${analysis.lighting}`);
  return analysis;
}

// ─── Model-Specific Prompt Templates ─────────────────────────────────────────

function buildKlingPrompt(scene: SceneAnalysis): {
  prompt: string;
  negative_prompt: string;
} {
  return {
    prompt: `Ultra-stable cinematic product shot. ${scene.product} on ${scene.surface}. Product completely motionless, locked in place. ${scene.lighting} gradually shifts across the surface. Everything perfectly still except subtle light movement. Rock-steady camera, buttery smooth 30fps, zero jitter, hyper-realistic, professional lighting, 5 seconds.`,
    negative_prompt: 'motion, shake, jitter, blur, wobble, camera pan, zoom, dolly, distortion, flicker, unstable, moving objects, moving towel, moving fabric, wind, breeze, falling particles, powder, rain, snow',
  };
}

function buildSeedancePrompt(scene: SceneAnalysis): {
  prompt: string;
  negative_prompt: string;
} {
  return {
    prompt: `Cinematic product photography. ${scene.product} sits perfectly still on ${scene.surface}. ${scene.lighting}. Only the ambient light shifts very slowly and subtly across the scene. All objects remain completely motionless. Smooth, premium, luxury beauty aesthetic.`,
    negative_prompt: 'shake, jitter, wobble, moving objects, wind, breeze, falling, particles, powder, fast motion',
  };
}

function buildPixversePrompt(scene: SceneAnalysis): {
  prompt: string;
  negative_prompt: string;
} {
  return {
    prompt: `Static product shot with subtle ambient light animation. ${scene.product} on ${scene.surface} in ${scene.lighting}. Product and all objects stay perfectly still. Only gentle light shifts across surfaces. Cinematic, smooth, premium quality.`,
    negative_prompt: 'blur, distort, low quality, shake, jitter, moving objects, wind, particles',
  };
}

function buildHailuoPrompt(scene: SceneAnalysis): {
  prompt: string;
  negative_prompt: string;
} {
  return {
    prompt: `Premium product photography with subtle cinematic motion. ${scene.product} on ${scene.surface}. ${scene.lighting} shifts gently. Product remains perfectly still. Smooth, stable, luxury beauty brand aesthetic.`,
    negative_prompt: '',
  };
}

function buildSoraPrompt(scene: SceneAnalysis): {
  prompt: string;
  negative_prompt: string;
} {
  return {
    prompt: `A perfectly still ${scene.product} sits on ${scene.surface}. ${scene.lighting}. The camera is completely locked in place and does not move at all. The only motion in the entire scene is an extremely subtle, slow shift of ambient light across the surfaces. Everything else — the product, the surface, all objects — remain perfectly motionless. Cinematic, photorealistic, premium beauty product advertisement. 4 seconds.`,
    negative_prompt: '',
  };
}

function buildPromptForModel(
  model: FalVideoModel,
  scene: SceneAnalysis,
): { prompt: string; negative_prompt: string } {
  switch (model) {
    case 'kling-v3':
    case 'kling-o3':
      return buildKlingPrompt(scene);
    case 'seedance':
      return buildSeedancePrompt(scene);
    case 'sora':
    case 'sora-pro':
      return buildSoraPrompt(scene);
    case 'pixverse':
      return buildPixversePrompt(scene);
    case 'hailuo':
      return buildHailuoPrompt(scene);
    default:
      return buildKlingPrompt(scene);
  }
}

// ─── Main ────────────────────────────────────────────────────────────────────

/**
 * Animate a scene image using a fal.ai video model.
 * Default: Seedance 1.5 Pro (best stability with camera_fixed).
 */
export async function animateScene(
  sceneImage: Buffer,
  _category: string,
  model: FalVideoModel = 'seedance',
): Promise<Buffer> {
  // Analyse scene with Claude
  const scene = await analyseScene(sceneImage);

  // Build model-specific prompt
  const { prompt, negative_prompt } = buildPromptForModel(model, scene);

  const modelId = FAL_MODELS[model];
  console.log(`[Video] Animating with ${model} (${modelId})...`);
  console.log(`[Video] Prompt: ${prompt.substring(0, 120)}...`);

  // Upload scene image to R2
  const imageUpload = await uploadFile(
    `content/tmp/scene-${Date.now()}.jpg`,
    sceneImage,
    'image/jpeg',
  );

  // Build model-specific input params
  const input: Record<string, unknown> = { prompt };

  switch (model) {
    case 'kling-v3':
      input.start_image_url = imageUpload.url;
      input.duration = '5';
      input.generate_audio = false;
      input.cfg_scale = 0.8;
      input.negative_prompt = negative_prompt;
      break;

    case 'kling-o3':
      input.image_url = imageUpload.url;
      input.duration = '5';
      input.generate_audio = false;
      break;

    case 'seedance':
      input.image_url = imageUpload.url;
      input.duration = '5';
      input.resolution = '1080p';
      input.aspect_ratio = '9:16';
      input.camera_fixed = true;
      input.generate_audio = false;
      break;

    case 'pixverse':
      input.image_url = imageUpload.url;
      input.duration = 5;
      input.resolution = '1080p';
      input.negative_prompt = negative_prompt;
      input.thinking_type = 'enabled';
      break;

    case 'sora':
    case 'sora-pro':
      input.image_url = imageUpload.url;
      input.duration = 4;
      input.resolution = '720p';
      input.aspect_ratio = '9:16';
      break;

    case 'hailuo':
      input.image_url = imageUpload.url;
      input.duration = '6';
      input.resolution = '768P';
      input.prompt_optimizer = true;
      break;
  }

  const result = await fal.subscribe(modelId, {
    input,
    logs: true,
    onQueueUpdate: (update) => {
      if (update.status === 'IN_PROGRESS') {
        console.log(`[Video] ${model}: ${update.status}...`);
      }
    },
  });

  const data = result.data as any;
  const videoUrl = data?.video?.url || data?.output?.url;

  if (!videoUrl) {
    throw new Error(`${model} did not return a video`);
  }

  console.log(`[Video] ${model} video generated, downloading...`);

  const videoRes = await fetch(videoUrl);
  if (!videoRes.ok) {
    throw new Error(`Failed to download video: ${videoRes.status}`);
  }

  const videoBuffer = Buffer.from(await videoRes.arrayBuffer());
  console.log(`[Video] ${model} video downloaded (${videoBuffer.length} bytes)`);

  return videoBuffer;
}
