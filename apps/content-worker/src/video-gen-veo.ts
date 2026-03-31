/**
 * Veo 3.1 image-to-video generation via @google/genai SDK.
 * Animates product scene images with subtle ambient motion.
 */

import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({
  apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY!,
});

/**
 * Video animation prompts per product category.
 * Focus on: subtle ambient motion, product stays still, calm atmosphere.
 */
const ANIMATION_PROMPTS: Record<string, string> = {
  'Hair Care':
    'Subtle ambient motion. Soft warm light shifts gently through a nearby window, casting slow-moving shadows across the scene. A gentle steam wisps upward in the background. The product remains perfectly still and in sharp focus. Camera remains static. Soft ambient bathroom tone.',
  'Wigs & Extensions':
    'Subtle ambient motion. Warm golden light slowly shifts across the salon scene. Soft dust particles drift gently through a sunbeam. The product remains perfectly still and in sharp focus. Camera remains static. Quiet ambient salon atmosphere.',
  Skincare:
    'Subtle ambient motion. Soft morning light slowly brightens through a window, creating gentle shifting highlights on surfaces. A candle flame flickers softly in the background. The product remains perfectly still and in sharp focus. Camera remains static. Peaceful ambient room tone.',
  Styling:
    'Subtle ambient motion. Warm golden hour light slowly moves across the scene. A sheer curtain barely shifts from a gentle breeze. The product remains perfectly still and in sharp focus. Camera remains static. Soft ambient room tone.',
};

const DEFAULT_ANIMATION_PROMPT =
  'Subtle ambient motion. Soft natural light gently shifts across the scene over time. Background elements have the faintest movement — a plant leaf, fabric edge, or light flicker. The product remains perfectly still and in sharp focus. Camera remains completely static. Soft, calming ambient tone.';

function getAnimationPrompt(category: string): string {
  return ANIMATION_PROMPTS[category] || DEFAULT_ANIMATION_PROMPT;
}

/**
 * Animate a scene image using Veo 3.1.
 * Returns the video as a Buffer.
 */
export async function animateScene(
  sceneImage: Buffer,
  category: string,
): Promise<Buffer> {
  const prompt = getAnimationPrompt(category);

  console.log(`[Veo] Animating scene (category: ${category})...`);
  console.log(`[Veo] Prompt: ${prompt.substring(0, 80)}...`);

  // Start video generation
  let operation = await ai.models.generateVideos({
    model: 'veo-3.1-generate-preview',
    prompt,
    image: {
      imageBytes: sceneImage.toString('base64'),
      mimeType: 'image/jpeg',
    },
  });

  // Poll until complete
  let attempts = 0;
  const maxAttempts = 60; // 10 minutes max (10s intervals)

  while (!operation.done) {
    attempts++;
    if (attempts > maxAttempts) {
      throw new Error('Veo video generation timed out');
    }

    console.log(
      `[Veo] Waiting for video generation... (attempt ${attempts}/${maxAttempts})`,
    );
    await new Promise((r) => setTimeout(r, 10_000));
    operation = await ai.operations.getVideosOperation({
      operation,
    });
  }

  // Get the video
  const video = operation.response?.generatedVideos?.[0]?.video;
  if (!video) {
    throw new Error('Veo did not return a video');
  }

  // Download video to temp file
  const { readFile, unlink } = await import('fs/promises');
  const tempPath = `/tmp/veo-download-${Date.now()}.mp4`;
  await ai.files.download({ file: video, downloadPath: tempPath });

  const videoBuffer = await readFile(tempPath);
  await unlink(tempPath).catch(() => {});

  console.log(`[Veo] Video generated (${videoBuffer.length} bytes)`);

  return videoBuffer;
}
