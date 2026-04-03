/**
 * Image-to-video generation via fal.ai.
 *
 * Default: Kling 3.0 Pro — best for smooth, stable product photography video.
 * Uses dynamic scene analysis to craft model-specific prompts.
 */

import { fal } from '@fal-ai/client';
import { uploadFile } from './storage';
import { generateText } from 'ai';
import { google } from '@ai-sdk/google';

// Configure fal.ai
fal.config({
  credentials: process.env.FAL_KEY!,
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const geminiFlash: any = google('gemini-3-flash-preview');

// Available fal.ai image-to-video models
const FAL_MODELS = {
  'kling-v3': 'fal-ai/kling-video/v3/pro/image-to-video',
  'kling-o3': 'fal-ai/kling-video/o3/standard/image-to-video',
  'seedance': 'fal-ai/bytedance/seedance/v1.5/pro/image-to-video',
  'pixverse': 'fal-ai/pixverse/v6/image-to-video',
  'hailuo': 'fal-ai/minimax/hailuo-02/standard/image-to-video',
} as const;

export type FalVideoModel = keyof typeof FAL_MODELS;

/**
 * Analyse scene and generate a Kling-optimised prompt.
 * Kling responds best to: precise descriptive phrasing, stability keywords,
 * and ONE clear ambient motion instruction.
 */
async function generateKlingPrompt(sceneImage: Buffer): Promise<{
  prompt: string;
  negative_prompt: string;
}> {
  console.log('[Video] Analysing scene for Kling prompt...');

  const result = await generateText({
    model: geminiFlash,
    messages: [
      {
        role: 'user',
        content: [
          { type: 'image', image: sceneImage } as any,
          {
            type: 'text',
            text: `Describe ONLY the product and the surface it sits on in one short sentence. Mention the lighting direction. Do NOT mention any other objects in the scene (no towels, plants, accessories — ignore them completely).

Example: "A hair cream jar sits on a marble counter in warm side lighting."

Respond with ONLY the one-sentence description.`,
          },
        ],
      },
    ],
  });

  const sceneDesc = result.text.trim();
  console.log(`[Video] Scene: ${sceneDesc}`);

  const prompt = [
    `Ultra-stable cinematic product shot.`,
    `${sceneDesc}`,
    `Everything in the scene is completely still and motionless. Nothing moves except a very subtle, slow shift in ambient light across the surfaces.`,
    `Rock-steady camera, buttery smooth, zero jitter, hyper-realistic, professional lighting, 5 seconds.`,
  ].join(' ');

  const negative_prompt =
    'motion, shake, jitter, blur, wobble, camera pan, zoom, dolly, distortion, flicker, unstable, moving objects, moving towel, moving fabric, wind, breeze, falling particles, powder, rain, snow';

  return { prompt, negative_prompt };
}

/**
 * Animate a scene image using a fal.ai video model.
 * Default: Kling 3.0 Pro (smoothest for product photography).
 */
export async function animateScene(
  sceneImage: Buffer,
  _category: string,
  model: FalVideoModel = 'kling-v3',
): Promise<Buffer> {
  const { prompt, negative_prompt } = await generateKlingPrompt(sceneImage);

  const modelId = FAL_MODELS[model];
  console.log(`[Video] Animating with ${model} (${modelId})...`);
  console.log(`[Video] Prompt: ${prompt.substring(0, 120)}...`);
  console.log(`[Video] Negative: ${negative_prompt.substring(0, 80)}...`);

  // Upload scene image to R2 for fal.ai access
  const imageUpload = await uploadFile(
    `content/tmp/scene-${Date.now()}.jpg`,
    sceneImage,
    'image/jpeg',
  );

  // Build model-specific input
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

  // Extract video URL
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
