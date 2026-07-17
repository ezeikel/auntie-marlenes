/**
 * Image-to-video generation via fal.ai.
 *
 * Each model gets its own optimised prompt template.
 * Scene analysis via Claude (precise, controlled descriptions).
 */

import { anthropic } from '@ai-sdk/anthropic';
import { fal } from '@fal-ai/client';
import RunwayML from '@runwayml/sdk';
import { generateText } from 'ai';
import { uploadFile } from './storage';

// Configure fal.ai
fal.config({
  credentials: process.env.FAL_KEY!,
});

// Claude for scene analysis
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const claude: any = anthropic('claude-sonnet-5');

// Available models
const FAL_MODELS = {
  'kling-v3': 'fal-ai/kling-video/v3/pro/image-to-video',
  'kling-o3': 'fal-ai/kling-video/o3/standard/image-to-video',
  seedance: 'fal-ai/bytedance/seedance/v1.5/pro/image-to-video',
  sora: 'fal-ai/sora-2/image-to-video',
  'sora-pro': 'fal-ai/sora-2/image-to-video/pro',
  pixverse: 'fal-ai/pixverse/v6/image-to-video',
  hailuo: 'fal-ai/minimax/hailuo-02/standard/image-to-video',
} as const;

export type FalVideoModel = keyof typeof FAL_MODELS;
export type VideoModel = FalVideoModel | 'runway';

// ─── ElevenLabs Audio ────────────────────────────────────────────────────────

/**
 * Generate lofi background music for a product scene via ElevenLabs Music API.
 * Uses scene analysis for mood context, always soft/warm/lofi instrumental.
 */
export async function generateSceneAudio(
  scene: SceneAnalysis,
  durationSeconds: number = 5,
): Promise<Buffer> {
  console.log('[Audio] Generating lofi background music via ElevenLabs...');

  // Map scene lighting/surface to a mood modifier
  const warmth = scene.lighting.toLowerCase().includes('warm')
    ? 'warm golden'
    : 'soft dreamy';
  const prompt = `Soft ${warmth} lo-fi instrumental, gentle piano chords over ambient synth pads, vinyl crackle texture, 70 BPM in C major, cozy beauty product showcase background music`;

  console.log(`[Audio] Prompt: ${prompt}`);

  // Generate 15s so we can skip the intro and use the middle section
  const res = await fetch('https://api.elevenlabs.io/v1/music', {
    method: 'POST',
    headers: {
      'xi-api-key': process.env.ELEVENLABS_API_KEY!,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      prompt,
      duration_ms: 15_000,
      force_instrumental: true,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(
      `ElevenLabs music generation failed (${res.status}): ${err}`,
    );
  }

  const audioBuffer = Buffer.from(await res.arrayBuffer());
  console.log(`[Audio] Generated music (${audioBuffer.length} bytes)`);
  return audioBuffer;
}

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

  const parts = result.text
    .trim()
    .split('|')
    .map((s) => s.trim());

  const analysis = {
    product: parts[0] || 'beauty product',
    surface: parts[1] || 'counter',
    lighting: parts[2] || 'soft natural light',
  };

  console.log(
    `[Video] Scene: ${analysis.product} | ${analysis.surface} | ${analysis.lighting}`,
  );
  return analysis;
}

// ─── Model-Specific Prompt Templates ─────────────────────────────────────────

function buildKlingPrompt(scene: SceneAnalysis): {
  prompt: string;
  negative_prompt: string;
} {
  return {
    prompt: `Ultra-stable cinematic product shot. ${scene.product} on ${scene.surface}. Product completely motionless, locked in place. ${scene.lighting} gradually shifts across the surface. Everything perfectly still except subtle light movement. Rock-steady camera, buttery smooth 30fps, zero jitter, hyper-realistic, professional lighting, 5 seconds.`,
    negative_prompt:
      'motion, shake, jitter, blur, wobble, camera pan, zoom, dolly, distortion, flicker, unstable, moving objects, moving towel, moving fabric, wind, breeze, falling particles, powder, rain, snow',
  };
}

function buildSeedancePrompt(scene: SceneAnalysis): {
  prompt: string;
  negative_prompt: string;
} {
  return {
    prompt: `Static, locked-off product photograph. ${scene.product} on ${scene.surface}. ${scene.lighting}. Absolutely nothing moves. Completely frozen scene like a photograph. No light shifts, no motion of any kind. Still life. Premium beauty product.`,
    negative_prompt:
      'camera movement, pan, zoom, dolly, motion, shake, jitter, wobble, moving objects, wind, breeze, light shift, animation, particles',
  };
}

function buildPixversePrompt(scene: SceneAnalysis): {
  prompt: string;
  negative_prompt: string;
} {
  return {
    prompt: `Static product shot with subtle ambient light animation. ${scene.product} on ${scene.surface} in ${scene.lighting}. Product and all objects stay perfectly still. Only gentle light shifts across surfaces. Cinematic, smooth, premium quality.`,
    negative_prompt:
      'blur, distort, low quality, shake, jitter, moving objects, wind, particles',
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
  model: VideoModel,
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
    case 'runway':
      return buildRunwayPrompt(scene);
    default:
      return buildKlingPrompt(scene);
  }
}

function buildRunwayPrompt(scene: SceneAnalysis): {
  prompt: string;
  negative_prompt: string;
} {
  return {
    prompt: `Static, tight frame. ${scene.product} on ${scene.surface}. ${scene.lighting}. The camera holds perfectly still on a tripod. All objects remain completely still. The only motion is a gentle, slow shift of natural light across the surfaces and soft bokeh shimmer in the background. Premium beauty product advertisement. Photorealistic.`,
    negative_prompt: '',
  };
}

// ─── Runway Gen-4.5 ──────────────────────────────────────────────────────────

async function animateWithRunway(
  sceneImage: Buffer,
  prompt: string,
): Promise<Buffer> {
  console.log('[Video] Animating with Runway Gen-4.5...');

  const client = new RunwayML({
    apiKey: process.env.RUNWAYML_API_SECRET,
  });

  // Upload to R2 for public URL
  const imageUpload = await uploadFile(
    `content/tmp/scene-${Date.now()}.jpg`,
    sceneImage,
    'image/jpeg',
  );

  const task = await client.imageToVideo.create({
    model: 'gen4.5',
    promptImage: imageUpload.url,
    promptText: prompt,
    ratio: '720:1280', // 9:16 portrait — only valid 9:16 ratio in Runway API
    duration: 5,
  });

  console.log(`[Video] Runway task created: ${task.id}`);

  // Poll for completion
  let taskResult = await client.tasks.retrieve(task.id);
  let attempts = 0;
  const maxAttempts = 60;

  while (taskResult.status !== 'SUCCEEDED' && taskResult.status !== 'FAILED') {
    attempts++;
    if (attempts > maxAttempts) throw new Error('Runway task timed out');
    console.log(
      `[Video] Runway: ${taskResult.status} (${attempts}/${maxAttempts})...`,
    );
    await new Promise((r) => setTimeout(r, 10_000));
    taskResult = await client.tasks.retrieve(task.id);
  }

  if (taskResult.status === 'FAILED') {
    throw new Error(`Runway task failed: ${JSON.stringify(taskResult)}`);
  }

  const videoUrl = (taskResult as any)?.output?.[0];
  if (!videoUrl) {
    throw new Error(
      `Runway did not return a video: ${JSON.stringify(taskResult)}`,
    );
  }

  console.log(`[Video] Runway video generated, downloading...`);

  const videoRes = await fetch(videoUrl);
  if (!videoRes.ok) {
    throw new Error(`Failed to download Runway video: ${videoRes.status}`);
  }

  const videoBuffer = Buffer.from(await videoRes.arrayBuffer());
  console.log(`[Video] Runway video downloaded (${videoBuffer.length} bytes)`);

  return videoBuffer;
}

// ─── Main ────────────────────────────────────────────────────────────────────

export { type SceneAnalysis };

/**
 * Animate a scene image.
 * Supports fal.ai models + Runway Gen-4.5.
 * Default: Seedance 1.5 Pro (best stability with camera_fixed).
 * Returns video buffer + scene analysis (for audio generation).
 */
export async function animateScene(
  sceneImage: Buffer,
  _category: string,
  model: VideoModel = 'seedance',
): Promise<{ video: Buffer; scene: SceneAnalysis }> {
  // Analyse scene with Claude
  const scene = await analyseScene(sceneImage);

  // Build model-specific prompt
  const { prompt, negative_prompt } = buildPromptForModel(model, scene);

  // Runway uses its own SDK, not fal.ai
  if (model === 'runway') {
    const video = await animateWithRunway(sceneImage, prompt);
    return { video, scene };
  }

  const modelId = FAL_MODELS[model as FalVideoModel];
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
    // input is assembled per-model above; fal's generated per-endpoint input
    // unions can't narrow a dynamic record — runtime shape is correct.
    input: input as never,
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
  console.log(
    `[Video] ${model} video downloaded (${videoBuffer.length} bytes)`,
  );

  return { video: videoBuffer, scene };
}
