/**
 * Kling 3.0 Pro image-to-video generation via fal.ai.
 * Best model for preserving text on product packaging labels.
 *
 * Animated scene with subtle ambient motion while keeping product text sharp.
 */

import { fal } from '@fal-ai/client';
import { uploadFile } from './storage';

// Configure fal.ai with API key
fal.config({
  credentials: process.env.FAL_KEY!,
});

/**
 * Video animation prompts per product category.
 * Focus on: subtle ambient motion, product stays still, calm atmosphere.
 * Kling-specific: be explicit about text preservation.
 */
const ANIMATION_PROMPTS: Record<string, string> = {
  'Hair Care':
    'Subtle ambient motion. Soft warm light shifts gently through a nearby window casting slow-moving shadows. A gentle steam wisps upward in the background. The product remains perfectly still with all packaging text and labels clearly readable. Camera remains completely static. Soft ambient bathroom tone.',
  'Wigs & Extensions':
    'Subtle ambient motion. Warm golden light slowly shifts across the scene. Soft dust particles drift gently through a sunbeam. The product remains perfectly still with all packaging text and labels clearly readable. Camera remains completely static. Quiet ambient salon atmosphere.',
  Skincare:
    'Subtle ambient motion. Soft morning light slowly brightens through a window creating gentle shifting highlights. A candle flame flickers softly in the background. The product remains perfectly still with all packaging text and labels clearly readable. Camera remains completely static. Peaceful ambient room tone.',
  Styling:
    'Subtle ambient motion. Warm golden hour light slowly moves across the scene. A sheer curtain barely shifts from a gentle breeze. The product remains perfectly still with all packaging text and labels clearly readable. Camera remains completely static. Soft ambient room tone.',
};

const DEFAULT_ANIMATION_PROMPT =
  'Subtle ambient motion. Soft natural light gently shifts across the scene. Background elements have the faintest movement. The product remains perfectly still with all packaging text, brand name, and labels clearly readable and sharp. Camera remains completely static. Soft calming ambient tone.';

function getAnimationPrompt(category: string): string {
  return ANIMATION_PROMPTS[category] || DEFAULT_ANIMATION_PROMPT;
}

/**
 * Animate a scene image using Kling 3.0 Pro via fal.ai.
 * Returns the video as a Buffer.
 */
export async function animateScene(
  sceneImage: Buffer,
  category: string,
): Promise<Buffer> {
  const prompt = getAnimationPrompt(category);

  console.log(`[Kling] Animating scene (category: ${category})...`);
  console.log(`[Kling] Prompt: ${prompt.substring(0, 80)}...`);

  // Upload scene image to R2 first so Kling can access it via URL
  const timestamp = Date.now();
  const imageUpload = await uploadFile(
    `content/tmp/scene-${timestamp}.jpg`,
    sceneImage,
    'image/jpeg',
  );

  console.log(`[Kling] Scene image uploaded to: ${imageUpload.url}`);

  // Generate video with Kling 3.0 Pro
  const result = await fal.subscribe(
    'fal-ai/kling-video/v3/pro/image-to-video',
    {
      input: {
        start_image_url: imageUpload.url,
        prompt,
        duration: '5',
        generate_audio: false,
        cfg_scale: 0.5,
        negative_prompt:
          'blur, distort, low quality, illegible text, garbled text, warped labels',
      },
      logs: true,
      onQueueUpdate: (update) => {
        if (update.status === 'IN_PROGRESS') {
          console.log(`[Kling] ${update.status}...`);
        }
      },
    },
  );

  // Get the video URL from the result
  const videoUrl = (result.data as any)?.video?.url;
  if (!videoUrl) {
    throw new Error('Kling did not return a video');
  }

  console.log(`[Kling] Video generated, downloading from: ${videoUrl}`);

  // Download the video
  const videoRes = await fetch(videoUrl);
  if (!videoRes.ok) {
    throw new Error(`Failed to download Kling video: ${videoRes.status}`);
  }

  const videoBuffer = Buffer.from(await videoRes.arrayBuffer());
  console.log(`[Kling] Video downloaded (${videoBuffer.length} bytes)`);

  return videoBuffer;
}
