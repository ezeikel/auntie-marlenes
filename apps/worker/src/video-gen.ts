/**
 * Image-to-video generation via Runway Gen-4.5.
 *
 * Scene analysis via Claude (precise, controlled descriptions).
 */

import { anthropic } from '@ai-sdk/anthropic';
import RunwayML from '@runwayml/sdk';
import { generateText } from 'ai';
import { uploadFile } from './storage';

// Claude for scene analysis
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const claude: any = anthropic('claude-sonnet-5');

// Available models. Veo has its own module (video-gen-veo.ts).
export const VIDEO_MODELS = ['runway'] as const;
export type VideoModel = (typeof VIDEO_MODELS)[number];

export const isVideoModel = (value: unknown): value is VideoModel =>
  (VIDEO_MODELS as readonly unknown[]).includes(value);

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

// ─── Prompt Template ─────────────────────────────────────────────────────────

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
 * Animate a scene image with Runway Gen-4.5.
 * Returns video buffer + scene analysis (for audio generation).
 */
export async function animateScene(
  sceneImage: Buffer,
  _category: string,
  model: VideoModel = 'runway',
): Promise<{ video: Buffer; scene: SceneAnalysis }> {
  if (!isVideoModel(model)) {
    throw new Error(`Unsupported video model: ${String(model)}`);
  }

  // Analyse scene with Claude
  const scene = await analyseScene(sceneImage);

  const { prompt } = buildRunwayPrompt(scene);
  const video = await animateWithRunway(sceneImage, prompt);
  return { video, scene };
}
