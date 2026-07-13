/**
 * Hero video generation pipeline — Runway Gen-4.5 + ffmpeg slow-mo.
 *
 * Parallel to hero-videos.ts (Seedance) but using Runway Gen-4.5 via the
 * @runwayml/sdk, with a post-processing step that stretches 5s clips to ~7s
 * with frame interpolation for butter-smooth slow motion.
 *
 * Workflow per scene:
 *   1. Read the hero PNG from apps/web/public/images/hero/
 *   2. Upload to R2 for a public HTTPS URL (Runway requires it)
 *   3. Call Runway Gen-4.5 with a slow-motion prompt, poll until complete
 *   4. Download the 5s raw MP4
 *   5. Run ffmpeg with setpts=1.4*PTS + minterpolate → butter-smooth 7s MP4
 *   6. Extract first/middle/last frames, send to Claude for advisory judgment
 *   7. On REDO, retry with a new seed (up to 2 times)
 *   8. Save the final slow-mo MP4 to apps/web/public/videos/hero/
 *
 * Judge output is treated as ADVISORY — the human reviewing the final video
 * is the final arbiter. The judge has a documented blind spot for prop
 * morphing between adjacent frames (only samples 3 frames total).
 *
 * Run with: pnpm gen:hero-videos-runway
 */

import { execFile } from 'node:child_process';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';
import { anthropic } from '@ai-sdk/anthropic';
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

const _MAX_RETRIES = 2;
const RETRY_SEEDS = [42, 84, 1337];
const SLOWMO_FACTOR = 4.0; // 5s → 20s

// ─── Scene definitions ──────────────────────────────────────────────────────

interface HeroVideoScene {
  id: string;
  imageFilename: string;
  videoFilename: string;
  title: string;
  runwayPrompt: string;
}

const HERO_VIDEO_SCENES: HeroVideoScene[] = [
  {
    id: 'bonnet',
    imageFilename: 'hero-01-bonnet.png',
    videoFilename: 'hero-01-bonnet.mp4',
    title: 'The Bonnet Moment',
    runwayPrompt:
      'Extreme slow motion, dreamy slowed time, cinematic slow-mo footage. She gently finishes tying the satin bonnet, her fingers settling at the nape of her neck, then a soft self-knowing smile rises in the mirror. A single slow blink. Warm lamp light holds perfectly steady. Locked tripod camera, static frame, camera does not move at all. All background elements — the lamp, the bed, the bottles on the nightstand, the mirror — remain perfectly still and do not move, multiply, or change shape. Preserve all facial features, skin tone, and 4c hair texture from the input image exactly.',
  },
  {
    id: 'mother-daughter',
    imageFilename: 'hero-02-mother-daughter.png',
    videoFilename: 'hero-02-mother-daughter.mp4',
    title: 'Between Her Knees',
    runwayPrompt:
      "Extreme slow motion, dreamy slowed time, cinematic slow-mo footage. The mother's fingers slowly continue weaving the cornrow with gentle deliberate rhythm. The daughter watches patiently in the handheld mirror, a tiny smile forming slowly. The sheer curtain drifts almost imperceptibly. Locked tripod camera, static frame, camera does not move at all. All background elements — the sofa cushions, the wicker basket, the hair products, the window frame — remain perfectly still and do not move, multiply, or change shape. Preserve all facial features, skin tones, and hair textures from both subjects in the input image exactly.",
  },
  {
    id: 'kitchen-beautician',
    imageFilename: 'hero-03-kitchen-beautician.png',
    videoFilename: 'hero-03-kitchen-beautician.mp4',
    title: 'Kitchen Beautician',
    runwayPrompt:
      "Extreme slow motion, dreamy slowed time, cinematic slow-mo footage. The standing friend continues braiding with slow focused hands. The seated friend's laugh softens gradually into a warm smile as her eyes hold on her friend. Steam rises slowly from the tea mug. Locked tripod camera, static frame, camera does not move at all. All background elements — the kitchen cabinets, the houseplants, the tea mug, the hair products on the table — remain perfectly still and do not move, multiply, or change shape. Preserve all facial features, skin tones, and hair textures from both subjects in the input image exactly.",
  },
  {
    id: 'locs-oil',
    imageFilename: 'hero-04-locs-oil.png',
    videoFilename: 'hero-04-locs-oil.mp4',
    title: 'Anointing the Locs',
    runwayPrompt:
      'Extreme slow motion, dreamy slowed time, cinematic slow-mo footage. Her fingers slowly work the golden oil down the length of the loc she is holding. A calm slow breath, her shoulders rising almost imperceptibly. Golden sunlight holds perfectly steady through the window. Locked tripod camera, static frame, camera does not move at all. All background elements — the vanity, the oil jar, the wooden comb, the silk scarf, the mirror — remain perfectly still and do not move, multiply, or change shape. Preserve all facial features, skin tone, and loc texture from the input image exactly.',
  },
  {
    id: 'barbershop-fade',
    imageFilename: 'hero-05-barbershop-fade.png',
    videoFilename: 'hero-05-barbershop-fade.mp4',
    title: 'The Fade Moment',
    runwayPrompt:
      "Extreme slow motion, dreamy slowed time, cinematic slow-mo footage. The barber steadily runs the clippers along the fade line with slow precise focus. The client's expression remains calm, a single slow blink. Warm shop lights hold perfectly steady. Locked tripod camera, static frame, camera does not move at all. All background elements — the mirror wall, the shelves of tools, the second chair, the framed photos — remain perfectly still and do not move, multiply, or change shape. Preserve all facial features, skin tones, and hair textures from both subjects in the input image exactly.",
  },
  {
    id: 'dad-braids',
    imageFilename: 'hero-06-dad-braids.png',
    videoFilename: 'hero-06-dad-braids.mp4',
    title: "Dad's Saturday Hair Day",
    runwayPrompt:
      "Extreme slow motion, dreamy slowed time, cinematic slow-mo footage. The father gently continues parting her hair with the comb, his focused expression holding. The daughter's small fingertips slowly touch the hair oil bottle with soft curiosity. Warm morning light holds perfectly steady. Locked tripod camera, static frame, camera does not move at all. All background elements — the sofa, the rug, the wicker basket of hair products, the coffee mug on the side table — remain perfectly still and do not move, multiply, or change shape. Preserve all facial features, skin tones, and hair textures from both subjects in the input image exactly.",
  },
];

// ─── Runway Gen-4.5 call ────────────────────────────────────────────────────

async function generateRunwayVideo(
  scene: HeroVideoScene,
  promptImageUrl: string,
  seed: number,
): Promise<Buffer> {
  console.log(
    `[Runway] ${scene.videoFilename} — creating task (seed=${seed})...`,
  );

  const client = new RunwayML({
    apiKey: process.env.RUNWAYML_API_SECRET,
  });

  const task = await client.imageToVideo.create({
    model: 'gen4.5',
    promptImage: promptImageUrl,
    promptText: scene.runwayPrompt,
    ratio: '1280:720',
    duration: 5,
    seed,
  });

  console.log(`[Runway] ${scene.videoFilename} — task ${task.id}`);

  let taskResult = await client.tasks.retrieve(task.id);
  let attempts = 0;
  const maxAttempts = 90;

  while (taskResult.status !== 'SUCCEEDED' && taskResult.status !== 'FAILED') {
    attempts += 1;
    if (attempts > maxAttempts) {
      throw new Error(
        `[Runway] ${scene.videoFilename} — timed out after 15 min`,
      );
    }
    if (attempts % 3 === 0) {
      console.log(
        `[Runway] ${scene.videoFilename} — ${taskResult.status} (${attempts}/${maxAttempts})`,
      );
    }
    await new Promise((r) => setTimeout(r, 10_000));
    taskResult = await client.tasks.retrieve(task.id);
  }

  if (taskResult.status === 'FAILED') {
    throw new Error(
      `[Runway] ${scene.videoFilename} — FAILED: ${JSON.stringify(taskResult, null, 2)}`,
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const videoUrl = (taskResult as any)?.output?.[0];
  if (!videoUrl) {
    throw new Error(`[Runway] ${scene.videoFilename} — no video URL in result`);
  }

  console.log(`[Runway] ${scene.videoFilename} — downloading raw clip`);
  const res = await fetch(videoUrl);
  if (!res.ok) {
    throw new Error(
      `[Runway] ${scene.videoFilename} — download failed: ${res.status}`,
    );
  }

  return Buffer.from(await res.arrayBuffer());
}

// ─── ffmpeg slow-mo post-processing ─────────────────────────────────────────

/**
 * Stretch a video clip by `factor`× using the minterpolate filter for true
 * butter-smooth frame interpolation (not held frames).
 *
 * At factor=1.4, a 5s clip becomes 7s. At factor=2.0, it becomes 10s.
 */
async function applySlowMo(
  inputBuffer: Buffer,
  factor: number = SLOWMO_FACTOR,
): Promise<Buffer> {
  const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'hero-slowmo-'));
  const inputPath = path.join(tmpDir, 'input.mp4');
  const outputPath = path.join(tmpDir, 'output.mp4');

  try {
    await fs.writeFile(inputPath, inputBuffer);

    console.log(
      `[ffmpeg] Applying ${factor}× slow-mo with minterpolate (this takes ~30-60s)...`,
    );

    // setpts stretches presentation timestamps. minterpolate generates new
    // intermediate frames via motion-compensated interpolation at 30 fps so
    // the stretched motion looks silky rather than stuttery.
    await execFileAsync('ffmpeg', [
      '-y',
      '-loglevel',
      'error',
      '-i',
      inputPath,
      '-filter:v',
      `setpts=${factor}*PTS,minterpolate=fps=30:mi_mode=mci:mc_mode=aobmc:vsbmc=1:me_mode=bidir`,
      '-c:v',
      'libx264',
      '-preset',
      'medium',
      '-crf',
      '18',
      '-pix_fmt',
      'yuv420p',
      '-an',
      outputPath,
    ]);

    const outputBuffer = await fs.readFile(outputPath);
    console.log(
      `[ffmpeg] Slow-mo complete (${(outputBuffer.length / 1024 / 1024).toFixed(1)} MB)`,
    );
    return outputBuffer;
  } finally {
    await fs.rm(tmpDir, { recursive: true, force: true });
  }
}

// ─── Frame extraction for Claude judge ──────────────────────────────────────

async function extractKeyFrames(
  videoBuffer: Buffer,
): Promise<{ first: Buffer; middle: Buffer; last: Buffer }> {
  const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'hero-video-runway-'));
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

// ─── Claude judge (advisory) ────────────────────────────────────────────────

type Verdict = 'PASS' | 'REDO';

const videoJudgeSchema = z.object({
  identityMatch: z.number().min(1).max(5),
  motionSubtlety: z.number().min(1).max(5),
  cameraStillness: z.number().min(1).max(5),
  textureIntegrity: z.number().min(1).max(5),
  compositionStability: z.number().min(1).max(5),
  feedback: z.string(),
});

interface VideoJudgeResult {
  verdict: Verdict;
  scores: Omit<z.infer<typeof videoJudgeSchema>, 'feedback'>;
  feedback: string;
}

async function judgeVideo(
  scene: HeroVideoScene,
  originalStill: Buffer,
  frames: { first: Buffer; middle: Buffer; last: Buffer },
): Promise<VideoJudgeResult> {
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
            text: `You are a representation-focused creative director reviewing a cinematic hero video loop for Auntie Marlene's, a Black-owned afro hair and beauty e-commerce brand. The video is intended to play as a subtle looping background on the homepage, so we are going for Apple-ad-style restraint with butter-smooth slow motion.

Scene: "${scene.title}"
Motion prompt given to Runway Gen-4.5: "${scene.runwayPrompt}"

You will see FOUR images in order:
1. The original still image (the target — everything in the video should match this)
2. The FIRST frame of the generated video
3. The MIDDLE frame of the generated video
4. The LAST frame of the generated video

IMPORTANT: You are only seeing 3 sampled frames out of ~150, so you CANNOT reliably detect prop morphing between adjacent frames. Do not penalise a scene for "multiplying" or "shifting" props unless the change is extreme and clearly present in a still comparison against the original. Subtle position shifts are almost certainly just different sample moments of the same prop.

Score on five 1-5 axes. Any of the following forces a low score on the relevant axis:
- identityMatch: the person in any frame looks like a different person than the still, skin tone has lightened, or hair texture has changed
- motionSubtlety: invented dramatic motion beyond what the prompt asked for (walking, turning around, radical expression changes). Slow motion being present is GOOD, not bad — the prompt explicitly asks for it.
- cameraStillness: the camera has clearly panned, zoomed, or dollied — we asked for a tripod shot
- textureIntegrity: hair looks rubbery/jello/plastic; skin looks waxy or smeared
- compositionStability: background has OBVIOUSLY morphed (e.g. a chair becomes a lamp, a mirror disappears). Do NOT flag this for subtle position shifts or lighting changes on props.

Verdict rule: PASS if all axes are 4 or 5. REDO otherwise. In feedback, explain what specifically failed.`,
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

  const minScore = Math.min(...Object.values(scores));
  const verdict: Verdict = minScore >= 4 ? 'PASS' : 'REDO';

  return { verdict, scores, feedback: result.object.feedback };
}

// ─── Orchestration ──────────────────────────────────────────────────────────

async function generateSceneWithJudge(
  scene: HeroVideoScene,
  imageUrl: string,
  originalStill: Buffer,
): Promise<Buffer> {
  let bestAttempt: { buffer: Buffer; minScore: number } | null = null;
  let lastFeedback = '';

  for (let attempt = 0; attempt < RETRY_SEEDS.length; attempt++) {
    const seed = RETRY_SEEDS[attempt];
    console.log(
      `\n[Runway] ${scene.videoFilename} — attempt ${attempt + 1}/${RETRY_SEEDS.length} (seed=${seed})`,
    );

    try {
      const rawBuffer = await generateRunwayVideo(scene, imageUrl, seed);
      const slowMoBuffer = await applySlowMo(rawBuffer, SLOWMO_FACTOR);

      console.log(`[Runway] ${scene.videoFilename} — extracting frames...`);
      const frames = await extractKeyFrames(slowMoBuffer);

      console.log(`[Runway] ${scene.videoFilename} — judging (advisory)...`);
      const judgment = await judgeVideo(scene, originalStill, frames);
      const minScore = Math.min(...Object.values(judgment.scores));

      console.log(
        `[Runway] ${scene.videoFilename} — ${judgment.verdict} (advisory) — scores:`,
        judgment.scores,
      );
      if (judgment.feedback) {
        console.log(
          `[Runway] ${scene.videoFilename} — feedback: ${judgment.feedback}`,
        );
      }

      if (judgment.verdict === 'PASS') {
        return slowMoBuffer;
      }

      if (!bestAttempt || minScore > bestAttempt.minScore) {
        bestAttempt = { buffer: slowMoBuffer, minScore };
      }
      lastFeedback = judgment.feedback;
    } catch (err) {
      console.error(
        `[Runway] ${scene.videoFilename} — attempt ${attempt + 1} failed:`,
        err,
      );
    }
  }

  if (bestAttempt) {
    console.warn(
      `[Runway] ${scene.videoFilename} — all attempts REDO, using best (minScore=${bestAttempt.minScore}). Last feedback: ${lastFeedback}`,
    );
    return bestAttempt.buffer;
  }

  throw new Error(
    `[Runway] ${scene.videoFilename} — failed all attempts with no output`,
  );
}

// ─── Scene selection ────────────────────────────────────────────────────────

export interface GenerateHeroVideosRunwayOptions {
  /** Restrict generation to specific scene IDs or 1-based indices. */
  only?: string[];
}

function resolveScenes(only?: string[]): HeroVideoScene[] {
  if (!only || only.length === 0) return HERO_VIDEO_SCENES;

  const resolved: HeroVideoScene[] = [];
  for (const token of only) {
    const asIndex = Number.parseInt(token, 10);
    const match = Number.isFinite(asIndex)
      ? HERO_VIDEO_SCENES[asIndex - 1]
      : HERO_VIDEO_SCENES.find((s) => s.id === token);
    if (!match) {
      throw new Error(
        `[Runway] Unknown scene "${token}". Valid IDs: ${HERO_VIDEO_SCENES.map((s) => s.id).join(', ')}`,
      );
    }
    if (!resolved.includes(match)) resolved.push(match);
  }
  return resolved;
}

// ─── Main entry point ───────────────────────────────────────────────────────

export async function generateAllHeroVideosRunway(
  options: GenerateHeroVideosRunwayOptions = {},
): Promise<void> {
  await fs.mkdir(HERO_VIDEOS_DIR, { recursive: true });
  console.log(`[Runway] Output directory: ${HERO_VIDEOS_DIR}`);
  console.log(
    `[Runway] Slow-mo factor: ${SLOWMO_FACTOR}× (5s → ${5 * SLOWMO_FACTOR}s)`,
  );

  const targets = resolveScenes(options.only);
  console.log(
    `[Runway] Generating ${targets.length} scene(s): ${targets.map((s) => s.id).join(', ')}`,
  );

  for (const scene of targets) {
    console.log(`\n[Runway] ═══ ${scene.title} ═══`);

    const stillPath = path.join(HERO_IMAGES_DIR, scene.imageFilename);
    let stillBuffer: Buffer;
    try {
      stillBuffer = await fs.readFile(stillPath);
    } catch {
      throw new Error(
        `[Runway] Missing source still: ${stillPath}. Run 'pnpm gen:hero' first.`,
      );
    }

    const r2Key = `content/hero/stills/${scene.imageFilename}`;
    console.log(`[Runway] ${scene.videoFilename} — uploading still to R2...`);
    const { url: imageUrl } = await uploadFile(r2Key, stillBuffer, 'image/png');

    const videoBuffer = await generateSceneWithJudge(
      scene,
      imageUrl,
      stillBuffer,
    );

    const outPath = path.join(HERO_VIDEOS_DIR, scene.videoFilename);
    await fs.writeFile(outPath, videoBuffer);
    console.log(
      `[Runway] ✓ Saved ${outPath} (${(videoBuffer.length / 1024 / 1024).toFixed(1)} MB)`,
    );
  }

  console.log(`\n[Runway] ✅ ${targets.length} scene(s) generated.`);
}
