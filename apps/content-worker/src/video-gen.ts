/**
 * Image-to-video generation via fal.ai.
 * Supports multiple models: Kling, PixVerse, Hailuo.
 * Uses dynamic AI-generated prompts based on scene analysis.
 */

import { fal } from '@fal-ai/client';
import { uploadFile } from './storage';
import { generateVeoPrompt } from './video-prompt';

// Configure fal.ai
fal.config({
  credentials: process.env.FAL_KEY!,
});

// All available fal.ai image-to-video models
const FAL_MODELS = {
  'kling-o3': 'fal-ai/kling-video/o3/standard/image-to-video',
  'kling-v3': 'fal-ai/kling-video/v3/pro/image-to-video',
  'pixverse': 'fal-ai/pixverse/v6/image-to-video',
  'hailuo': 'fal-ai/minimax/hailuo-02/standard/image-to-video',
} as const;

export type FalVideoModel = keyof typeof FAL_MODELS;

/**
 * Animate a scene image using a fal.ai video model.
 * Uses dynamic prompt generation (analyses scene → crafts bespoke prompt).
 */
export async function animateScene(
  sceneImage: Buffer,
  _category: string,
  model: FalVideoModel = 'kling-o3',
): Promise<Buffer> {
  // Generate dynamic prompt based on scene analysis
  const { prompt, negative_prompt } = await generateVeoPrompt(sceneImage);

  const modelId = FAL_MODELS[model];
  console.log(`[Video] Animating with ${model} (${modelId})...`);
  console.log(`[Video] Prompt: ${prompt.substring(0, 100)}...`);

  // Upload scene image to R2 for fal.ai access
  const imageUpload = await uploadFile(
    `content/tmp/scene-${Date.now()}.jpg`,
    sceneImage,
    'image/jpeg',
  );

  // Build model-specific input
  const input: Record<string, unknown> = { prompt };

  switch (model) {
    case 'kling-o3':
      input.image_url = imageUpload.url;
      input.duration = '5';
      input.generate_audio = false;
      break;

    case 'kling-v3':
      input.start_image_url = imageUpload.url;
      input.duration = '5';
      input.generate_audio = false;
      input.cfg_scale = 0.5;
      input.negative_prompt = negative_prompt;
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

  // Extract video URL — different models return it differently
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
