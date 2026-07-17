/**
 * Hero video generation pipeline — Sora 2 via fal.ai, v2 prompting recipe.
 *
 * Parallel to hero-videos.ts (Seedance) and hero-videos-runway.ts (Runway).
 * Uses the Sora 2 v2 action-first prompting recipe that worked for Scene 1:
 *   - Opening subject description (identity anchor)
 *   - 4-6 named motion beats in sequence
 *   - One camera-lock sentence at the END (not the start — v1 failure mode)
 *   - "Cinematic slow motion, natural realistic movement, <lighting>, photorealistic"
 *   - NO "extreme slow motion" (triggers freeze)
 *   - NO "quarter-speed playback" (doesn't help on v3)
 *   - NO "preserve facial features exactly" (pushes toward still)
 *
 * Workflow per scene:
 *   1. Read the hero PNG from apps/web/public/images/hero/
 *   2. Upload to R2 for a public HTTPS URL
 *   3. Call fal-ai/sora-2/image-to-video (20s, 720p, 16:9)
 *   4. Download the raw MP4 (includes unwanted ambient audio)
 *   5. Strip audio via ffmpeg (-c:v copy -an)
 *   6. Save final muted MP4 to apps/web/public/videos/hero/
 *
 * Cost: $0.10/s × 20s = $2.00 per scene. 6 scenes = $12 for a clean batch,
 * up to ~$20 if any need retries.
 *
 * No Claude judge — human eyes are the final arbiter and the judge has
 * limited value on video anyway (can't detect hand morphing between frames).
 *
 * Run with: pnpm gen:hero-videos-sora
 */

import { execFile } from 'node:child_process';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';
import { fal } from '@fal-ai/client';
import { uploadFile } from './storage';

const execFileAsync = promisify(execFile);

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

const SORA_MODEL = 'fal-ai/sora-2/image-to-video';

// ─── Scene Definitions ──────────────────────────────────────────────────────

interface HeroVideoScene {
  id: string;
  imageFilename: string;
  videoFilename: string;
  title: string;
  prompt: string;
}

const HERO_VIDEO_SCENES: HeroVideoScene[] = [
  {
    id: 'bonnet',
    imageFilename: 'hero-01-bonnet.png',
    videoFilename: 'hero-01-bonnet.mp4',
    title: 'The Bonnet Moment',
    // This is the v2 prompt that worked for Scene 1 — kept for completeness
    // and so re-running the full batch regenerates Scene 1 too if desired.
    prompt:
      'A Black woman in her mid-thirties stands at her bedroom mirror in warm tungsten lamplight, tying an emerald green satin bonnet over her hair. She slowly finishes tying the knot at the nape of her neck, lowers her arms to her sides, looks at her own reflection, and a small private smile gradually rises on her face. She blinks slowly once. Her shoulders rise and fall with a quiet breath. The camera is fixed and does not pan or zoom. Cinematic slow motion, natural realistic movement, warm amber tungsten lighting, photorealistic.',
  },
  {
    id: 'mother-daughter',
    imageFilename: 'hero-02-mother-daughter.png',
    videoFilename: 'hero-02-mother-daughter.mp4',
    title: 'Between Her Knees',
    prompt:
      "A Black mother in her early forties sits on a floor cushion in her lived-in living room, weaving a cornrow into her young daughter's hair, her daughter sitting cross-legged between her knees holding a small handheld mirror. The mother's fingers continue weaving the cornrow with gentle rhythm, she gathers a new section of hair and parts it carefully, the daughter watches her mother's reflection in the mirror with a patient smile, the daughter blinks slowly, and the sheer curtain behind them drifts faintly in the afternoon light. The camera is fixed and does not pan or zoom. Cinematic slow motion, natural realistic movement, warm golden afternoon window light, photorealistic.",
  },
  {
    id: 'kitchen-beautician',
    imageFilename: 'hero-03-kitchen-beautician.png',
    videoFilename: 'hero-03-kitchen-beautician.mp4',
    title: 'Kitchen Beautician',
    // v2 rewrite — the v1 clip had ~5s of frozen opening before motion started.
    // Fix: lead with a concrete motion verb ("The standing friend's fingers
    // weave a section...") instead of the subject description, AND add
    // "motion begins immediately from frame one, no pause at the start" to
    // explicitly prevent Sora from holding the first frame.
    prompt:
      "Motion begins immediately from frame one, no pause at the start. The standing friend's fingers weave a fresh section of knotless box braid as the seated friend's laugh softens into a warm smile. Two Black women in their late twenties in a bright home kitchen, the standing friend behind the seated friend with hands in her hair. As the clip continues, the standing friend gathers another section of hair and begins plaiting it, the seated friend glances down at her phone then back over her shoulder, steam rises gently from the ceramic tea mug on the kitchen table, and the standing friend brushes a loose strand back at her friend's hairline. The camera is fixed and does not pan or zoom. Cinematic slow motion, natural realistic movement, soft natural morning window light, photorealistic.",
  },
  {
    id: 'locs-oil',
    imageFilename: 'hero-04-locs-oil.png',
    videoFilename: 'hero-04-locs-oil.mp4',
    title: 'Anointing the Locs',
    // v3 — rewritten to (1) lead with motion ("Motion begins immediately")
    // to prevent the frozen-opening failure mode seen in Scene 3, (2) match
    // the new v2 still (cream cotton camisole, not bare shoulders), and
    // (3) use the v2 still which should not re-trigger Sora's content
    // classifier.
    prompt:
      'Motion begins immediately from frame one, no pause at the start. A Black woman with shoulder-length locs works a small amount of golden hair oil along one loc near her temple with her fingertips as she stands at her bathroom vanity in morning light, wearing a cream cotton camisole. As the clip continues, her fingertips smooth the oiled loc with a gentle downward stroke, her free hand gently separates another loc to reveal underneath, she lifts one more loc to examine it in the mirror, and warm morning sunlight holds steady through the side window. The camera is fixed and does not pan or zoom. Cinematic slow motion, natural realistic hand movement, warm golden hour bathroom lighting, photorealistic.',
  },
  {
    id: 'barbershop-fade',
    imageFilename: 'hero-05-barbershop-fade.png',
    videoFilename: 'hero-05-barbershop-fade.mp4',
    title: 'The Fade Moment',
    prompt:
      "A Black barber in his forties in a fitted black barber smock stands behind a young Black male client in his early twenties in a classic Black-owned barbershop, running cordless clippers along the fade line on the side of the client's head. The barber's steady hands continue running the clippers in slow precise strokes along the fade, the client sits calmly with his eyes forward, the client blinks slowly once, the barber slightly tilts the client's head with his free hand to adjust the angle, and the warm shop lights reflect off the mirror wall behind them. The camera is fixed and does not pan or zoom. Cinematic slow motion, natural realistic movement, warm tungsten barbershop lighting, photorealistic.",
  },
  {
    id: 'dad-braids',
    imageFilename: 'hero-06-dad-braids.png',
    videoFilename: 'hero-06-dad-braids.mp4',
    title: "Dad's Saturday Hair Day",
    prompt:
      "A Black father in his mid-thirties sits on the edge of a low sofa in his cozy Saturday-morning living room, carefully parting his young daughter's 4c hair with a wide-tooth comb. His daughter sits on a small floor cushion between his knees in pink flannel pyjamas, one hand reaching back toward a bottle of hair oil on the sofa beside him. The father's large hands continue parting a new section of her hair with focused concentration, the daughter's small fingertips slowly touch the hair oil bottle with soft curiosity, the daughter looks up at her father, the father briefly glances down at her with a gentle smile, and warm morning light holds steady from the left window. The camera is fixed and does not pan or zoom. Cinematic slow motion, natural realistic movement, warm morning daylight, photorealistic.",
  },
];

// ─── Sora 2 call + audio strip ──────────────────────────────────────────────

async function generateSoraVideo(
  scene: HeroVideoScene,
  imageUrl: string,
): Promise<Buffer> {
  console.log(
    `[Sora] ${scene.videoFilename} — calling ${SORA_MODEL} (720p, 20s, 16:9)...`,
  );
  console.log(
    `[Sora] ${scene.videoFilename} — cost: $2.00, expect ~3-10 min queue`,
  );

  let result;
  try {
    result = await fal.subscribe(SORA_MODEL, {
      input: {
        prompt: scene.prompt,
        image_url: imageUrl,
        aspect_ratio: '16:9',
        resolution: '720p',
        // fal typings cap sora duration at 4/8/12; the API accepts 20s.
        duration: 20 as never,
        ...({ model: 'sora-2' } as unknown as Record<string, never>),
      },
      logs: true,
      onQueueUpdate: (update) => {
        if (update.status === 'IN_PROGRESS') {
          // Silent — too noisy for batch logs; the single-scene script logs these
        }
      },
    });
  } catch (err) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const e = err as any;
    console.error(`\n[Sora] ${scene.videoFilename} — ERROR:`, e?.message || e);
    if (e?.status) console.error(`[Sora] HTTP status:`, e.status);
    if (e?.body) {
      console.error(`[Sora] Full response body:`);
      console.error(JSON.stringify(e.body, null, 2));
    }
    if (e?.requestId) console.error(`[Sora] Request ID:`, e.requestId);
    throw err;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const data = result.data as any;
  const videoUrl = data?.video?.url;

  if (!videoUrl) {
    throw new Error(
      `[Sora] ${scene.videoFilename} — no video URL in response: ${JSON.stringify(data, null, 2)}`,
    );
  }

  console.log(`[Sora] ${scene.videoFilename} — downloading ${videoUrl}`);
  const res = await fetch(videoUrl);
  if (!res.ok) {
    throw new Error(
      `[Sora] ${scene.videoFilename} — download failed: ${res.status}`,
    );
  }
  const rawBuffer = Buffer.from(await res.arrayBuffer());
  console.log(
    `[Sora] ${scene.videoFilename} — raw download: ${(rawBuffer.length / 1024 / 1024).toFixed(1)} MB (stripping audio)`,
  );

  // Strip audio via ffmpeg — fal.ai's Sora endpoint has no audio flag
  const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'sora-mute-'));
  const rawPath = path.join(tmpDir, 'raw.mp4');
  const mutedPath = path.join(tmpDir, 'muted.mp4');

  try {
    await fs.writeFile(rawPath, rawBuffer);
    await execFileAsync('ffmpeg', [
      '-y',
      '-loglevel',
      'error',
      '-i',
      rawPath,
      '-c:v',
      'copy',
      '-an',
      mutedPath,
    ]);
    return await fs.readFile(mutedPath);
  } finally {
    await fs.rm(tmpDir, { recursive: true, force: true });
  }
}

// ─── Scene selection ────────────────────────────────────────────────────────

export interface GenerateHeroVideosSoraOptions {
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
        `[Sora] Unknown scene "${token}". Valid IDs: ${HERO_VIDEO_SCENES.map((s) => s.id).join(', ')}`,
      );
    }
    if (!resolved.includes(match)) resolved.push(match);
  }
  return resolved;
}

// ─── Main entry point ───────────────────────────────────────────────────────

export async function generateAllHeroVideosSora(
  options: GenerateHeroVideosSoraOptions = {},
): Promise<void> {
  await fs.mkdir(HERO_VIDEOS_DIR, { recursive: true });
  console.log(`[Sora] Output directory: ${HERO_VIDEOS_DIR}`);

  const targets = resolveScenes(options.only);
  console.log(
    `[Sora] Generating ${targets.length} scene(s): ${targets.map((s) => s.id).join(', ')}`,
  );
  console.log(`[Sora] Estimated cost: $${(targets.length * 2).toFixed(2)}`);
  console.log(
    `[Sora] Estimated time: ${targets.length * 6}-${targets.length * 12} min (sequential, no parallelism)\n`,
  );

  const startedAt = Date.now();
  const failed: string[] = [];

  for (let i = 0; i < targets.length; i++) {
    const scene = targets[i];
    console.log(`\n[Sora] ═══ [${i + 1}/${targets.length}] ${scene.title} ═══`);

    try {
      // 1. Load the source still
      const stillPath = path.join(HERO_IMAGES_DIR, scene.imageFilename);
      let stillBuffer: Buffer;
      try {
        stillBuffer = await fs.readFile(stillPath);
      } catch {
        throw new Error(
          `Missing source still: ${stillPath}. Run 'pnpm gen:hero' first.`,
        );
      }

      // 2. Upload to R2 for a public URL
      const r2Key = `content/hero/stills/${scene.imageFilename}`;
      console.log(`[Sora] ${scene.videoFilename} — uploading still to R2...`);
      const { url: imageUrl } = await uploadFile(
        r2Key,
        stillBuffer,
        'image/png',
      );

      // 3. Generate + strip audio
      const videoBuffer = await generateSoraVideo(scene, imageUrl);

      // 4. Save
      const outPath = path.join(HERO_VIDEOS_DIR, scene.videoFilename);
      await fs.writeFile(outPath, videoBuffer);
      console.log(
        `[Sora] ✓ Saved ${outPath} (${(videoBuffer.length / 1024 / 1024).toFixed(1)} MB)`,
      );
    } catch (err) {
      console.error(`[Sora] ${scene.videoFilename} — FAILED:`, err);
      failed.push(scene.id);
    }
  }

  const elapsed = ((Date.now() - startedAt) / 60_000).toFixed(1);
  console.log(
    `\n[Sora] ✅ ${targets.length - failed.length}/${targets.length} scene(s) generated in ${elapsed} min.`,
  );
  if (failed.length > 0) {
    console.log(`[Sora] ⚠️  Failed scenes: ${failed.join(', ')}`);
    console.log(
      `[Sora] ⚠️  Re-run with: pnpm gen:hero-videos-sora --only=${failed.join(',')}`,
    );
  }
}
