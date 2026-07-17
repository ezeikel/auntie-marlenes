/**
 * Veo 3.1 image-to-video generation via @google/genai SDK.
 * Uses dynamic AI-generated prompts based on scene analysis.
 */

import { GoogleGenAI } from '@google/genai';
import { generateVeoPrompt } from './video-prompt';

const ai = new GoogleGenAI({
  apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY!,
});

/**
 * Animate a scene image using Veo 3.1.
 * Step 1: Analyse scene with Gemini Flash to understand contents
 * Step 2: Generate bespoke 5-layer Veo prompt
 * Step 3: Animate with Veo 3.1
 */
export async function animateScene(
  sceneImage: Buffer,
  _category: string,
): Promise<Buffer> {
  // Generate dynamic prompt based on scene analysis
  const { prompt, negative_prompt } = await generateVeoPrompt(sceneImage);

  console.log(`[Veo] Animating scene...`);
  console.log(`[Veo] Prompt: ${prompt.substring(0, 120)}...`);
  console.log(`[Veo] Negative: ${negative_prompt.substring(0, 80)}...`);

  // Start video generation
  let operation = await ai.models.generateVideos({
    model: 'veo-3.1-generate-preview',
    prompt: `${prompt} Negative: ${negative_prompt}`,
    image: {
      imageBytes: sceneImage.toString('base64'),
      mimeType: 'image/jpeg',
    },
  });

  // Poll until complete
  let attempts = 0;
  const maxAttempts = 60;

  while (!operation.done) {
    attempts++;
    if (attempts > maxAttempts) {
      throw new Error('Veo video generation timed out');
    }

    console.log(
      `[Veo] Waiting for video generation... (attempt ${attempts}/${maxAttempts})`,
    );
    await new Promise((r) => setTimeout(r, 10_000));
    operation = await ai.operations.getVideosOperation({ operation });
  }

  const video = operation.response?.generatedVideos?.[0]?.video;
  if (!video) {
    throw new Error('Veo did not return a video');
  }

  const { readFile, unlink } = await import('fs/promises');
  const tempPath = `/tmp/veo-download-${Date.now()}.mp4`;
  await ai.files.download({ file: video, downloadPath: tempPath });

  const videoBuffer = await readFile(tempPath);
  await unlink(tempPath).catch(() => {});

  console.log(`[Veo] Video generated (${videoBuffer.length} bytes)`);

  return videoBuffer;
}
