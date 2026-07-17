/**
 * Hero video A/B harness.
 *
 * One-off module for comparing Runway Gen-4.5 and Sora 2 against the existing
 * Seedance 1.5 Pro Scene 1 output. Reuses the same motion prompt and R2-hosted
 * still, runs each output through the same Claude judge, and saves provider-
 * tagged MP4s alongside the Seedance version so they can be eyeballed side by
 * side in Finder / QuickTime.
 *
 * Not intended for batch generation. Once we pick a winner from this A/B,
 * we'll either stay with hero-videos.ts (Seedance) or fork a new batch module
 * for the winning provider.
 *
 * Run with: pnpm gen:hero-videos-ab
 */

import { execFile } from 'node:child_process';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';
import { anthropic } from '@ai-sdk/anthropic';
import { fal } from '@fal-ai/client';
import RunwayML from '@runwayml/sdk';
import { generateObject } from 'ai';
import { z } from 'zod';
import { uploadFile } from './storage';

const execFileAsync = promisify(execFile);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const claude: any = anthropic('claude-sonnet-4-20250514');

// ─── Paths ──────────────────────────────────────────────────────────────────

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const HERO_IMAGES_DIR = path.resolve(
  __dirname,
  '../../../apps/web/public/images/hero',
);
const HERO_VIDEOS_DIR = path.resolve(
  __dirname,
  '../../../apps/web/public/videos/hero',
);

// ─── Scene 1 config (single scene for the A/B) ──────────────────────────────

const SCENE_1 = {
  title: 'The Bonnet Moment',
  imageFilename: 'hero-01-bonnet.png',
  motionPrompt:
    'She slowly finishes tying the satin bonnet, her hands settling as she gives a small self-knowing smile in the mirror. A gentle blink. Warm lamp light holds steady. Static camera, no camera movement, tripod shot. Preserve all facial features, skin tone, and 4c hair texture from the input image exactly.',
};

// ─── Runway Gen-4.5 ─────────────────────────────────────────────────────────

async function generateRunwayVideo(
  promptImageUrl: string,
  promptText: string,
): Promise<Buffer> {
  console.log('[AB/Runway] Creating Gen-4.5 task...');

  const client = new RunwayML({
    apiKey: process.env.RUNWAYML_API_SECRET,
  });

  const task = await client.imageToVideo.create({
    model: 'gen4.5',
    promptImage: promptImageUrl,
    promptText,
    ratio: '1280:720',
    duration: 5,
  });

  console.log(`[AB/Runway] Task created: ${task.id}`);

  let taskResult = await client.tasks.retrieve(task.id);
  let attempts = 0;
  const maxAttempts = 90;

  while (taskResult.status !== 'SUCCEEDED' && taskResult.status !== 'FAILED') {
    attempts += 1;
    if (attempts > maxAttempts) {
      throw new Error('[AB/Runway] Task timed out after 15 minutes');
    }
    console.log(
      `[AB/Runway] Status: ${taskResult.status} (${attempts}/${maxAttempts})`,
    );
    await new Promise((r) => setTimeout(r, 10_000));
    taskResult = await client.tasks.retrieve(task.id);
  }

  if (taskResult.status === 'FAILED') {
    throw new Error(
      `[AB/Runway] Task failed: ${JSON.stringify(taskResult, null, 2)}`,
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const videoUrl = (taskResult as any)?.output?.[0];
  if (!videoUrl) {
    throw new Error(
      `[AB/Runway] No video URL in task result: ${JSON.stringify(taskResult, null, 2)}`,
    );
  }

  console.log(`[AB/Runway] Downloading ${videoUrl}`);
  const res = await fetch(videoUrl);
  if (!res.ok) {
    throw new Error(`[AB/Runway] Download failed: ${res.status}`);
  }

  return Buffer.from(await res.arrayBuffer());
}

// ─── Sora 2 via fal.ai ──────────────────────────────────────────────────────

async function generateSoraVideo(
  promptImageUrl: string,
  promptText: string,
): Promise<Buffer> {
  console.log('[AB/Sora] Calling Sora 2 (4s, 1080p, 16:9)...');

  const result = await fal.subscribe('fal-ai/sora-2/image-to-video', {
    input: {
      prompt: promptText,
      image_url: promptImageUrl,
      aspect_ratio: '16:9',
      resolution: '1080p',
      duration: 4,
    },
    logs: true,
    onQueueUpdate: (update) => {
      if (update.status === 'IN_PROGRESS') {
        console.log(`[AB/Sora] ${update.status}`);
      }
    },
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const data = result.data as any;
  const videoUrl = data?.video?.url;

  if (!videoUrl) {
    throw new Error(
      `[AB/Sora] No video URL in response: ${JSON.stringify(data, null, 2)}`,
    );
  }

  console.log(`[AB/Sora] Downloading ${videoUrl}`);
  const res = await fetch(videoUrl);
  if (!res.ok) {
    throw new Error(`[AB/Sora] Download failed: ${res.status}`);
  }

  return Buffer.from(await res.arrayBuffer());
}

// ─── Frame extraction (shared with hero-videos.ts) ──────────────────────────

async function extractKeyFrames(
  videoBuffer: Buffer,
): Promise<{ first: Buffer; middle: Buffer; last: Buffer }> {
  const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'hero-video-ab-'));
  const videoPath = path.join(tmpDir, 'clip.mp4');
  const firstPath = path.join(tmpDir, 'first.png');
  const middlePath = path.join(tmpDir, 'middle.png');
  const lastPath = path.join(tmpDir, 'last.png');

  try {
    await fs.writeFile(videoPath, videoBuffer);

    const { stdout: durationStr } = await execFileAsync('ffprobe', [
      '-v',
      'error',
      '-show_entries',
      'format=duration',
      '-of',
      'default=noprint_wrappers=1:nokey=1',
      videoPath,
    ]);
    const duration = Number.parseFloat(durationStr.trim()) || 5;
    const middleTs = (duration / 2).toFixed(2);
    const lastTs = Math.max(0, duration - 0.1).toFixed(2);

    await execFileAsync('ffmpeg', [
      '-y',
      '-loglevel',
      'error',
      '-ss',
      '0',
      '-i',
      videoPath,
      '-vframes',
      '1',
      firstPath,
    ]);
    await execFileAsync('ffmpeg', [
      '-y',
      '-loglevel',
      'error',
      '-ss',
      middleTs,
      '-i',
      videoPath,
      '-vframes',
      '1',
      middlePath,
    ]);
    await execFileAsync('ffmpeg', [
      '-y',
      '-loglevel',
      'error',
      '-ss',
      lastTs,
      '-i',
      videoPath,
      '-vframes',
      '1',
      lastPath,
    ]);

    const [first, middle, last] = await Promise.all([
      fs.readFile(firstPath),
      fs.readFile(middlePath),
      fs.readFile(lastPath),
    ]);

    return { first, middle, last };
  } finally {
    await fs.rm(tmpDir, { recursive: true, force: true });
  }
}

// ─── Claude judge (shared rubric with hero-videos.ts) ───────────────────────

const videoJudgeSchema = z.object({
  identityMatch: z.number().min(1).max(5),
  motionSubtlety: z.number().min(1).max(5),
  cameraStillness: z.number().min(1).max(5),
  textureIntegrity: z.number().min(1).max(5),
  compositionStability: z.number().min(1).max(5),
  feedback: z.string(),
});

interface JudgeOutcome {
  provider: string;
  scores: Omit<z.infer<typeof videoJudgeSchema>, 'feedback'>;
  minScore: number;
  feedback: string;
}

async function judgeVideo(
  provider: string,
  originalStill: Buffer,
  frames: { first: Buffer; middle: Buffer; last: Buffer },
): Promise<JudgeOutcome> {
  // @ts-expect-error — model type mismatch from pnpm hoisting
  const result = await generateObject({
    model: claude,
    schema: videoJudgeSchema,
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text: `You are a representation-focused creative director reviewing a cinematic hero video loop for Auntie Marlene's, a Black-owned afro hair and beauty e-commerce brand.

Scene: "The Bonnet Moment"
Provider under test: ${provider}
Motion prompt given to the model: "${SCENE_1.motionPrompt}"

You will see FOUR images in order:
1. The original still image (the target — everything in the video should match this)
2. The FIRST frame of the generated video
3. The MIDDLE frame of the generated video
4. The LAST frame of the generated video

Score strictly on five 1-5 axes. Any of the following forces a low score on the relevant axis:
- identityMatch: the person in any frame looks like a different person, or skin tone has lightened, or hair texture has changed
- motionSubtlety: invented dramatic motion beyond what the prompt asked for
- cameraStillness: camera has panned, zoomed, or dollied — we asked for a tripod shot
- textureIntegrity: hair looks rubbery/jello/plastic; skin looks waxy or smeared
- compositionStability: background props have moved, morphed, or disappeared

Feedback should be specific and comparative — these scores will be used to pick a winning provider for a 6-scene batch generation.`,
          },
          { type: 'image', image: originalStill },
          { type: 'image', image: frames.first },
          { type: 'image', image: frames.middle },
          { type: 'image', image: frames.last },
        ],
      },
    ],
  });

  const scores = {
    identityMatch: result.object.identityMatch,
    motionSubtlety: result.object.motionSubtlety,
    cameraStillness: result.object.cameraStillness,
    textureIntegrity: result.object.textureIntegrity,
    compositionStability: result.object.compositionStability,
  };

  return {
    provider,
    scores,
    minScore: Math.min(...Object.values(scores)),
    feedback: result.object.feedback,
  };
}

// ─── Orchestration ──────────────────────────────────────────────────────────

export async function runHeroVideoAB(): Promise<void> {
  await fs.mkdir(HERO_VIDEOS_DIR, { recursive: true });

  // 1. Load the source still
  const stillPath = path.join(HERO_IMAGES_DIR, SCENE_1.imageFilename);
  const stillBuffer = await fs.readFile(stillPath);

  // 2. Upload to R2 once, reuse URL for both providers
  const r2Key = `content/hero/stills/${SCENE_1.imageFilename}`;
  console.log('[AB] Uploading Scene 1 still to R2...');
  const { url: imageUrl } = await uploadFile(r2Key, stillBuffer, 'image/png');
  console.log(`[AB] Still URL: ${imageUrl}\n`);

  const outcomes: JudgeOutcome[] = [];

  // 3. Runway Gen-4.5
  console.log('═══ Runway Gen-4.5 ═══');
  try {
    const runwayBuffer = await generateRunwayVideo(
      imageUrl,
      SCENE_1.motionPrompt,
    );
    const runwayPath = path.join(HERO_VIDEOS_DIR, 'hero-01-bonnet-runway.mp4');
    await fs.writeFile(runwayPath, runwayBuffer);
    console.log(
      `[AB/Runway] ✓ Saved ${runwayPath} (${runwayBuffer.length} bytes)`,
    );

    const runwayFrames = await extractKeyFrames(runwayBuffer);
    const runwayOutcome = await judgeVideo(
      'Runway Gen-4.5',
      stillBuffer,
      runwayFrames,
    );
    console.log('[AB/Runway] Scores:', runwayOutcome.scores);
    console.log(`[AB/Runway] Feedback: ${runwayOutcome.feedback}\n`);
    outcomes.push(runwayOutcome);
  } catch (err) {
    console.error('[AB/Runway] ERROR:', err);
  }

  // 4. Sora 2
  console.log('═══ Sora 2 (fal.ai, 1080p, 4s) ═══');
  try {
    const soraBuffer = await generateSoraVideo(imageUrl, SCENE_1.motionPrompt);
    const soraPath = path.join(HERO_VIDEOS_DIR, 'hero-01-bonnet-sora.mp4');
    await fs.writeFile(soraPath, soraBuffer);
    console.log(`[AB/Sora] ✓ Saved ${soraPath} (${soraBuffer.length} bytes)`);

    const soraFrames = await extractKeyFrames(soraBuffer);
    const soraOutcome = await judgeVideo('Sora 2', stillBuffer, soraFrames);
    console.log('[AB/Sora] Scores:', soraOutcome.scores);
    console.log(`[AB/Sora] Feedback: ${soraOutcome.feedback}\n`);
    outcomes.push(soraOutcome);
  } catch (err) {
    console.error('[AB/Sora] ERROR:', err);
  }

  // 5. Print final comparison table
  console.log('═══ A/B SUMMARY ═══');
  console.log(
    'Reference: Seedance 1.5 Pro Scene 1 already scored 5/4/5/5/5 (min=4).\n',
  );
  for (const o of outcomes) {
    console.log(`${o.provider}:`);
    console.log(`  identityMatch:        ${o.scores.identityMatch}`);
    console.log(`  motionSubtlety:       ${o.scores.motionSubtlety}`);
    console.log(`  cameraStillness:      ${o.scores.cameraStillness}`);
    console.log(`  textureIntegrity:     ${o.scores.textureIntegrity}`);
    console.log(`  compositionStability: ${o.scores.compositionStability}`);
    console.log(`  MIN SCORE:            ${o.minScore}`);
    console.log();
  }
}
