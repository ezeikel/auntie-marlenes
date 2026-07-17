/**
 * Hero video generation pipeline.
 *
 * Generates 6 subtle cinematic hero loops for the Auntie Marlene's homepage
 * using Seedance 1.5 Pro image-to-video via @fal-ai/client, with a Claude
 * video judge loop for identity preservation and motion subtlety.
 *
 * Workflow per scene:
 *   1. Read the hero PNG from apps/web/public/images/hero/
 *   2. Upload it to R2 to get a public URL (Seedance requires image_url)
 *   3. Call fal-ai/bytedance/seedance/v1.5/pro/image-to-video with the
 *      scene's motion prompt, camera_fixed=true, generate_audio=false
 *   4. Download the output MP4
 *   5. Extract first/middle/last frames via ffmpeg
 *   6. Send frames + original still to Claude for PASS/REDO judgment
 *   7. On REDO, retry with a new seed up to 2 times before falling back
 *   8. Save final MP4 to apps/web/public/videos/hero/
 *
 * Run with: pnpm gen:hero-videos (from apps/worker)
 */

import { execFile } from 'node:child_process';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';
import { anthropic } from '@ai-sdk/anthropic';
import { fal } from '@fal-ai/client';
import { generateObject } from 'ai';
import { z } from 'zod';
import { uploadFile } from './storage';

const execFileAsync = promisify(execFile);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const claude: any = anthropic('claude-sonnet-5');

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

const SEEDANCE_MODEL = 'fal-ai/bytedance/seedance/v1.5/pro/image-to-video';

const _MAX_RETRIES = 2;
const RETRY_SEEDS = [42, 84, 1337]; // initial + 2 retries

// ─── Scene Definitions ──────────────────────────────────────────────────────

interface HeroVideoScene {
  id: string;
  imageFilename: string;
  videoFilename: string;
  title: string;
  motionPrompt: string;
}

const HERO_VIDEO_SCENES: HeroVideoScene[] = [
  {
    id: 'bonnet',
    imageFilename: 'hero-01-bonnet.png',
    videoFilename: 'hero-01-bonnet.mp4',
    title: 'The Bonnet Moment',
    motionPrompt:
      'She slowly finishes tying the satin bonnet, her hands settling as she gives a small self-knowing smile in the mirror. A gentle blink. Warm lamp light holds steady. Static camera, no camera movement, tripod shot. Preserve all facial features, skin tone, and 4c hair texture from the input image exactly.',
  },
  {
    id: 'mother-daughter',
    imageFilename: 'hero-02-mother-daughter.png',
    videoFilename: 'hero-02-mother-daughter.mp4',
    title: 'Between Her Knees',
    motionPrompt:
      "The mother's fingers continue weaving the cornrow with slow steady rhythm. The daughter watches patiently in the handheld mirror, a tiny smile. Sheer curtain drifts faintly in the background. Static camera, no camera movement, tripod shot. Preserve all facial features, skin tones, and hair textures from the input image exactly.",
  },
  {
    id: 'kitchen-beautician',
    imageFilename: 'hero-03-kitchen-beautician.png',
    videoFilename: 'hero-03-kitchen-beautician.mp4',
    title: 'Kitchen Beautician',
    motionPrompt:
      "The standing friend continues braiding with focused hands. The seated friend's laugh softens into a warm smile as her eyes stay on her friend. Steam rises gently from the tea mug. Static camera, no camera movement, tripod shot. Preserve all facial features, skin tones, and hair textures from the input image exactly.",
  },
  {
    id: 'locs-oil',
    imageFilename: 'hero-04-locs-oil.png',
    videoFilename: 'hero-04-locs-oil.mp4',
    title: 'Anointing the Locs',
    motionPrompt:
      "Her fingers slowly work the oil down the length of the loc she's holding. A calm slow breath. Golden sunlight holds steady through the window. Static camera, no camera movement, tripod shot. Preserve all facial features, skin tone, and loc texture from the input image exactly.",
  },
  {
    id: 'barbershop-fade',
    imageFilename: 'hero-05-barbershop-fade.png',
    videoFilename: 'hero-05-barbershop-fade.mp4',
    title: 'The Fade Moment',
    motionPrompt:
      'The barber steadily runs the clippers along the fade line, his focused hands holding precise. The client blinks slowly, expression calm. Warm shop lights hold steady. Static camera, no camera movement, tripod shot. Preserve all facial features, skin tones, and hair textures from the input image exactly.',
  },
  {
    id: 'dad-braids',
    imageFilename: 'hero-06-dad-braids.png',
    videoFilename: 'hero-06-dad-braids.mp4',
    title: "Dad's Saturday Hair Day",
    motionPrompt:
      "The father gently continues parting her hair with the comb, his focused expression holding. The daughter's hand slowly touches the hair oil bottle with soft curiosity. Warm morning light holds steady. Static camera, no camera movement, tripod shot. Preserve all facial features, skin tones, and hair textures from the input image exactly.",
  },
];

// ─── Seedance Generation ────────────────────────────────────────────────────

interface SeedanceOutput {
  videoBuffer: Buffer;
  seed: number;
}

async function generateSeedanceVideo(
  scene: HeroVideoScene,
  imageUrl: string,
  seed: number,
): Promise<SeedanceOutput> {
  console.log(
    `[Video] ${scene.videoFilename} — calling Seedance (seed=${seed})...`,
  );

  const result = await fal.subscribe(SEEDANCE_MODEL, {
    input: {
      prompt: scene.motionPrompt,
      image_url: imageUrl,
      aspect_ratio: '16:9',
      resolution: '720p',
      duration: '5',
      generate_audio: false,
      camera_fixed: true,
      seed,
    },
    logs: true,
    onQueueUpdate: (update) => {
      if (update.status === 'IN_PROGRESS') {
        console.log(`[Video] ${scene.videoFilename} — ${update.status}...`);
      }
    },
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const data = result.data as any;
  const videoUrl = data?.video?.url;

  if (!videoUrl) {
    throw new Error(
      `[Video] ${scene.videoFilename} — Seedance did not return a video URL`,
    );
  }

  console.log(`[Video] ${scene.videoFilename} — downloading ${videoUrl}`);
  const videoRes = await fetch(videoUrl);
  if (!videoRes.ok) {
    throw new Error(
      `[Video] ${scene.videoFilename} — download failed: ${videoRes.status}`,
    );
  }

  const videoBuffer = Buffer.from(await videoRes.arrayBuffer());
  return { videoBuffer, seed: data?.seed ?? seed };
}

// ─── Frame Extraction (ffmpeg) ──────────────────────────────────────────────

/**
 * Extract first, middle, and last frames from an MP4 buffer using ffmpeg.
 * Returns three PNG buffers.
 */
async function extractKeyFrames(
  videoBuffer: Buffer,
): Promise<{ first: Buffer; middle: Buffer; last: Buffer }> {
  const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'hero-video-'));
  const videoPath = path.join(tmpDir, 'clip.mp4');
  const firstPath = path.join(tmpDir, 'first.png');
  const middlePath = path.join(tmpDir, 'middle.png');
  const lastPath = path.join(tmpDir, 'last.png');

  try {
    await fs.writeFile(videoPath, videoBuffer);

    // Probe duration so we can target the middle frame accurately
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
    // Grab the last frame just before the end to avoid empty-frame edge cases
    const lastTs = Math.max(0, duration - 0.1).toFixed(2);

    // Extract three frames. -ss before -i is fast-seek; good enough for stills.
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

// ─── Claude Video Judge ─────────────────────────────────────────────────────

type Verdict = 'PASS' | 'REDO';

const videoJudgeSchema = z.object({
  identityMatch: z
    .number()
    .min(1)
    .max(5)
    .describe(
      '5 = faces, skin tones, and hair textures in every extracted frame match the original still exactly. 1 = clear drift, different person, or lightened skin.',
    ),
  motionSubtlety: z
    .number()
    .min(1)
    .max(5)
    .describe(
      '5 = subtle Apple-ad-like restraint, believable tiny motion. 1 = dramatic / flashy / TikTok-effect motion.',
    ),
  cameraStillness: z
    .number()
    .min(1)
    .max(5)
    .describe(
      '5 = camera is perfectly locked, no perceptible movement between frames. 1 = obvious pan, zoom, or dolly.',
    ),
  textureIntegrity: z
    .number()
    .min(1)
    .max(5)
    .describe(
      '5 = skin pores and hair texture stay photoreal across all frames. 1 = jello/rubber/plastic artifacts on hair or skin.',
    ),
  compositionStability: z
    .number()
    .min(1)
    .max(5)
    .describe(
      '5 = background elements (mirrors, shelves, props) stay in place. 1 = morphing, warping, or disappearing scene elements.',
    ),
  feedback: z.string().describe('Brief feedback on what went wrong if REDO.'),
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

Scene: "${scene.title}"
Motion prompt we gave the video model: "${scene.motionPrompt}"

You will see FOUR images in order:
1. The original still image (the target — everything in the video should match this)
2. The FIRST frame of the generated video
3. The MIDDLE frame of the generated video
4. The LAST frame of the generated video

Score strictly on five 1-5 axes. Any of the following forces a low score on the relevant axis:

- identityMatch: the person(s) in any frame look like a different person than the still, or skin tone has lightened, or hair texture has changed
- motionSubtlety: the video has invented dramatic motion beyond what the prompt asked for (e.g. the subject turning fully around, walking, radical expression changes)
- cameraStillness: the camera has panned, zoomed, or dollied — we asked for a tripod shot
- textureIntegrity: hair looks rubbery, jello, or plastic; skin looks waxy or smeared
- compositionStability: background props have moved, morphed, or disappeared

Verdict rule: if ANY axis scores below 4, return REDO. Only PASS if all axes are 4 or 5. In feedback, explain what specifically failed so we can tune the prompt on the next retry.`,
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
      `\n[Video] ${scene.videoFilename} — attempt ${attempt + 1}/${RETRY_SEEDS.length} (seed=${seed})`,
    );

    try {
      const { videoBuffer } = await generateSeedanceVideo(
        scene,
        imageUrl,
        seed,
      );
      console.log(
        `[Video] ${scene.videoFilename} — generated, extracting frames...`,
      );

      const frames = await extractKeyFrames(videoBuffer);
      console.log(`[Video] ${scene.videoFilename} — judging...`);

      const judgment = await judgeVideo(scene, originalStill, frames);
      const minScore = Math.min(...Object.values(judgment.scores));

      console.log(
        `[Video] ${scene.videoFilename} — ${judgment.verdict} — scores:`,
        judgment.scores,
      );
      if (judgment.feedback) {
        console.log(
          `[Video] ${scene.videoFilename} — feedback: ${judgment.feedback}`,
        );
      }

      if (judgment.verdict === 'PASS') {
        return videoBuffer;
      }

      // REDO — keep as fallback if this is our best attempt
      if (!bestAttempt || minScore > bestAttempt.minScore) {
        bestAttempt = { buffer: videoBuffer, minScore };
      }
      lastFeedback = judgment.feedback;
    } catch (err) {
      console.error(
        `[Video] ${scene.videoFilename} — attempt ${attempt + 1} failed:`,
        err,
      );
    }
  }

  if (bestAttempt) {
    console.warn(
      `[Video] ${scene.videoFilename} — all attempts REDO, using best attempt (minScore=${bestAttempt.minScore}). Last feedback: ${lastFeedback}`,
    );
    return bestAttempt.buffer;
  }

  throw new Error(
    `[Video] ${scene.videoFilename} — failed all attempts with no output`,
  );
}

// ─── Scene selection ────────────────────────────────────────────────────────

export interface GenerateHeroVideosOptions {
  /**
   * Restrict generation to specific scenes. Accepts scene IDs (e.g. "bonnet")
   * or 1-based indices as strings (e.g. "1"). If omitted, generates all 6.
   */
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
        `[Video] Unknown scene "${token}". Valid IDs: ${HERO_VIDEO_SCENES.map((s) => s.id).join(', ')}`,
      );
    }
    if (!resolved.includes(match)) resolved.push(match);
  }
  return resolved;
}

// ─── Main entry point ───────────────────────────────────────────────────────

export async function generateAllHeroVideos(
  options: GenerateHeroVideosOptions = {},
): Promise<void> {
  await fs.mkdir(HERO_VIDEOS_DIR, { recursive: true });
  console.log(`[Video] Output directory: ${HERO_VIDEOS_DIR}`);

  const targets = resolveScenes(options.only);
  console.log(
    `[Video] Generating ${targets.length} scene(s): ${targets.map((s) => s.id).join(', ')}`,
  );

  for (const scene of targets) {
    console.log(`\n[Video] ═══ ${scene.title} ═══`);

    // 1. Load the source still
    const stillPath = path.join(HERO_IMAGES_DIR, scene.imageFilename);
    let stillBuffer: Buffer;
    try {
      stillBuffer = await fs.readFile(stillPath);
    } catch {
      throw new Error(
        `[Video] Missing source still: ${stillPath}. Run 'pnpm gen:hero' first.`,
      );
    }

    // 2. Upload to R2 so Seedance can fetch it via URL
    const r2Key = `content/hero/stills/${scene.imageFilename}`;
    console.log(`[Video] ${scene.videoFilename} — uploading still to R2...`);
    const { url: imageUrl } = await uploadFile(r2Key, stillBuffer, 'image/png');

    // 3. Generate + judge + retry
    const videoBuffer = await generateSceneWithJudge(
      scene,
      imageUrl,
      stillBuffer,
    );

    // 4. Save final MP4
    const outPath = path.join(HERO_VIDEOS_DIR, scene.videoFilename);
    await fs.writeFile(outPath, videoBuffer);
    console.log(`[Video] ✓ Saved ${outPath} (${videoBuffer.length} bytes)`);
  }

  console.log(`\n[Video] ✅ ${targets.length} scene(s) generated.`);
}
