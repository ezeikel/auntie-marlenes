/**
 * Hero video generation pipeline — Runway Gen-4.5 batch (no ffmpeg slow-mo).
 *
 * Companion to hero-videos-sora.ts. Generates two Runway variants per scene
 * so they can be compared directly against the Sora finals and against each
 * other:
 *
 *   Variant A — runway-5s
 *     Native 5s, no slow-motion language. Matches the earlier Runway A/B
 *     clip. Fast, known-quantity motion style. Output:
 *     hero-XX-<scene>-runway-5s.mp4
 *
 *   Variant B — runway-10s-slowmo
 *     Native 10s with "extreme slow motion, dreamy slowed time" language in
 *     the prompt. Lets Runway render slowed motion natively — no ffmpeg
 *     minterpolate, so no hand-morphing risk. Output:
 *     hero-XX-<scene>-runway-10s-slowmo.mp4
 *
 * Cost: 6 scenes × 2 variants × ~$0.25/clip = ~$3 total.
 * Time: ~30-60s per clip sequential, so ~10-15 min total.
 *
 * Run with: pnpm gen:hero-videos-runway-batch
 */

import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import RunwayML from '@runwayml/sdk';
import { uploadFile } from './storage';

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

// ─── Scene definitions ──────────────────────────────────────────────────────

interface SceneConfig {
  id: string;
  imageFilename: string;
  title: string;
  // Base motion description — same core beats as the Sora prompts, but we'll
  // prepend slow-motion language for variant B
  motionPrompt: string;
}

const SCENES: SceneConfig[] = [
  {
    id: 'bonnet',
    imageFilename: 'hero-01-bonnet.png',
    title: 'The Bonnet Moment',
    motionPrompt:
      'A Black woman in her mid-thirties tying an emerald satin bonnet over her hair at her bedroom mirror in warm tungsten lamplight. She finishes tying the knot at the nape of her neck, lowers her arms to her sides, looks at her own reflection, and a small private smile gradually rises on her face. She blinks slowly once. The camera is fixed on a tripod and does not pan or zoom. All background elements stay perfectly still and do not morph or change shape. Photorealistic.',
  },
  {
    id: 'mother-daughter',
    imageFilename: 'hero-02-mother-daughter.png',
    title: 'Between Her Knees',
    motionPrompt:
      "A Black mother weaving a cornrow into her young daughter's hair as the daughter sits between her knees holding a handheld mirror, in a warm lived-in living room. The mother's fingers continue weaving the cornrow with gentle rhythm, she gathers a new section of hair, the daughter watches in the mirror with a patient smile, and the sheer curtain drifts faintly in the afternoon light. The camera is fixed on a tripod and does not pan or zoom. All background elements stay perfectly still and do not morph or change shape. Photorealistic.",
  },
  {
    id: 'kitchen-beautician',
    imageFilename: 'hero-03-kitchen-beautician.png',
    title: 'Kitchen Beautician',
    // v3 — paired with the Gemini still v3 composition change. Standing friend
    // is now directly behind the seated friend with her active hands partially
    // obscured by the seated friend's head and braids. ALL motion on safe
    // visible zones only: seated friend's face (blink, smile), standing friend's
    // shoulders rising gently with breath, window light. NO steam — removed
    // entirely after v2 hallucinated steam from the product jar. Explicit
    // negative language about hand motion and steam.
    motionPrompt:
      "Motion begins immediately from frame one. Two Black women in a bright home kitchen during a calm moment in a braiding session. The seated friend breathes gently, her shoulders rising and falling slowly, a warm small smile holding on her face. She blinks slowly once. The standing friend behind her also breathes with a gentle shoulder rise and fall, her face holding a quiet focused expression. Warm morning daylight holds steady through the window. The standing friend's partially hidden hands do NOT move, pull, tug, weave, or manipulate any hair. There is NO steam in the scene — no steam from any mug, no steam from any product jar, no steam anywhere. The camera is fixed on a tripod and does not pan or zoom. All background elements stay perfectly still and do not morph or change shape. Photorealistic.",
  },
  {
    id: 'locs-oil',
    imageFilename: 'hero-04-locs-oil.png',
    title: 'Anointing the Locs',
    // v2 rewrite after the v1 Runway clip produced a hair-pulling hallucination.
    // Root cause: verbs "lifts" and "separates" were interpreted as pulling/tugging
    // gestures. Fix: replace all lift/separate verbs with "smooths" and "strokes",
    // add explicit negative framing "hands do not pull or tug any hair".
    motionPrompt:
      'Motion begins immediately from frame one, no pause at the start. A Black woman with shoulder-length locs wearing a cream cotton camisole stands at her bathroom vanity smoothing golden hair oil along one loc near her temple with gentle fingertip strokes. Her fingertips slide smoothly downward along the length of the loc applying oil, then her fingertips stroke a second loc on the other side in the same gentle downward motion. Her hands do NOT pull, tug, tear, or remove any hair — the motion is purely a soft smoothing stroke along the exterior of the loc. Warm morning sunlight holds steady through the side window. The camera is fixed on a tripod and does not pan or zoom. All background elements stay perfectly still and do not morph or change shape. Photorealistic.',
  },
  {
    id: 'barbershop-fade',
    imageFilename: 'hero-05-barbershop-fade.png',
    title: 'The Fade Moment',
    motionPrompt:
      "A Black barber running cordless clippers along the fade line on a young Black male client's head in a classic Black-owned barbershop. The barber's steady hands continue running the clippers in precise strokes along the fade, the client sits calmly with his eyes forward and blinks slowly once, the barber slightly tilts the client's head with his free hand to adjust the angle. The camera is fixed on a tripod and does not pan or zoom. All background elements stay perfectly still and do not morph or change shape. Photorealistic.",
  },
  {
    id: 'dad-braids',
    imageFilename: 'hero-06-dad-braids.png',
    title: "Dad's Saturday Hair Day",
    motionPrompt:
      "A Black father carefully parting his young daughter's 4c hair with a wide-tooth comb as the daughter sits on a floor cushion between his knees in pink pyjamas, in a cozy Saturday-morning living room. The father's large hands continue parting a new section of her hair, the daughter's small fingertips slowly touch the hair oil bottle on the sofa beside him with curiosity, the father briefly glances down at her with a gentle smile, warm morning light holds steady from the left window. The camera is fixed on a tripod and does not pan or zoom. All background elements stay perfectly still and do not morph or change shape. Photorealistic.",
  },
];

const SLOWMO_PREFIX =
  'Extreme slow motion, dreamy slowed time, cinematic slow-mo footage, deliberate slowed tempo. ';

// ─── Runway Gen-4.5 call ────────────────────────────────────────────────────

interface RunwayGenOptions {
  promptImageUrl: string;
  promptText: string;
  duration: number;
  seed: number;
}

async function generateRunwayClip(
  scene: SceneConfig,
  variantLabel: string,
  opts: RunwayGenOptions,
): Promise<Buffer> {
  console.log(
    `[Runway] ${scene.id}/${variantLabel} — creating task (${opts.duration}s, seed=${opts.seed})...`,
  );

  const client = new RunwayML({
    apiKey: process.env.RUNWAYML_API_SECRET,
  });

  const task = await client.imageToVideo.create({
    model: 'gen4.5',
    promptImage: opts.promptImageUrl,
    promptText: opts.promptText,
    ratio: '1280:720',
    duration: opts.duration,
    seed: opts.seed,
  });

  console.log(`[Runway] ${scene.id}/${variantLabel} — task ${task.id}`);

  let taskResult = await client.tasks.retrieve(task.id);
  let attempts = 0;
  const maxAttempts = 90;

  while (taskResult.status !== 'SUCCEEDED' && taskResult.status !== 'FAILED') {
    attempts += 1;
    if (attempts > maxAttempts) {
      throw new Error(
        `[Runway] ${scene.id}/${variantLabel} — timed out after 15 min`,
      );
    }
    if (attempts % 3 === 0) {
      console.log(
        `[Runway] ${scene.id}/${variantLabel} — ${taskResult.status} (${attempts}/${maxAttempts})`,
      );
    }
    await new Promise((r) => setTimeout(r, 10_000));
    taskResult = await client.tasks.retrieve(task.id);
  }

  if (taskResult.status === 'FAILED') {
    throw new Error(
      `[Runway] ${scene.id}/${variantLabel} — FAILED: ${JSON.stringify(taskResult, null, 2)}`,
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const videoUrl = (taskResult as any)?.output?.[0];
  if (!videoUrl) {
    throw new Error(
      `[Runway] ${scene.id}/${variantLabel} — no video URL in result`,
    );
  }

  console.log(`[Runway] ${scene.id}/${variantLabel} — downloading`);
  const res = await fetch(videoUrl);
  if (!res.ok) {
    throw new Error(
      `[Runway] ${scene.id}/${variantLabel} — download failed: ${res.status}`,
    );
  }
  return Buffer.from(await res.arrayBuffer());
}

// ─── Scene selection ────────────────────────────────────────────────────────

export interface GenerateHeroVideosRunwayBatchOptions {
  /** Restrict to specific scene IDs or 1-based indices. */
  only?: string[];
  /** Restrict to specific variants: "5s" (5s native) or "10s-slowmo" (10s native with slow-mo prompt). Default both. */
  variants?: Array<'5s' | '10s-slowmo'>;
  /** Override the Runway generation seed. Default 42. Use a different seed to roll a different generation for the same prompt. */
  seed?: number;
}

function resolveScenes(only?: string[]): SceneConfig[] {
  if (!only || only.length === 0) return SCENES;

  const resolved: SceneConfig[] = [];
  for (const token of only) {
    const asIndex = Number.parseInt(token, 10);
    const match = Number.isFinite(asIndex)
      ? SCENES[asIndex - 1]
      : SCENES.find((s) => s.id === token);
    if (!match) {
      throw new Error(
        `[Runway] Unknown scene "${token}". Valid IDs: ${SCENES.map((s) => s.id).join(', ')}`,
      );
    }
    if (!resolved.includes(match)) resolved.push(match);
  }
  return resolved;
}

// ─── Main entry point ───────────────────────────────────────────────────────

export async function generateAllHeroVideosRunwayBatch(
  options: GenerateHeroVideosRunwayBatchOptions = {},
): Promise<void> {
  await fs.mkdir(HERO_VIDEOS_DIR, { recursive: true });
  console.log(`[Runway] Output directory: ${HERO_VIDEOS_DIR}`);

  const targets = resolveScenes(options.only);
  const variants: Array<'5s' | '10s-slowmo'> =
    options.variants && options.variants.length > 0
      ? options.variants
      : ['5s', '10s-slowmo'];
  const seed = options.seed ?? 42;

  const totalClips = targets.length * variants.length;
  const estCost = (totalClips * 0.25).toFixed(2);
  console.log(
    `[Runway] Generating ${totalClips} clip(s): ${targets.length} scene(s) × ${variants.length} variant(s)`,
  );
  console.log(`[Runway] Variants: ${variants.join(', ')}`);
  console.log(`[Runway] Scenes: ${targets.map((s) => s.id).join(', ')}`);
  console.log(`[Runway] Seed: ${seed}`);
  console.log(`[Runway] Estimated cost: ~$${estCost}\n`);

  const startedAt = Date.now();
  const failed: string[] = [];

  for (let i = 0; i < targets.length; i++) {
    const scene = targets[i];
    console.log(
      `\n[Runway] ═══ [${i + 1}/${targets.length}] ${scene.title} ═══`,
    );

    // Load still once, upload to R2 once, reuse URL for both variants
    const stillPath = path.join(HERO_IMAGES_DIR, scene.imageFilename);
    let stillBuffer: Buffer;
    try {
      stillBuffer = await fs.readFile(stillPath);
    } catch {
      console.error(
        `[Runway] ${scene.id} — missing still at ${stillPath}, skipping both variants`,
      );
      for (const v of variants) failed.push(`${scene.id}/${v}`);
      continue;
    }

    // Upload with a content-hash-suffixed key so Cloudflare edge cache can't
    // serve stale v1 bytes to Runway. Earlier batches hit this exact bug:
    // Runway fetched content/hero/stills/hero-01-bonnet.png and got stale v1
    // bytes from Cloudflare edge cache, generating videos against v1 subjects
    // even though R2 origin held the v2 bytes. Using a unique key per
    // content version sidesteps the cache entirely.
    const contentHash = crypto
      .createHash('md5')
      .update(stillBuffer)
      .digest('hex')
      .slice(0, 12);
    const extname = path.extname(scene.imageFilename);
    const basename = path.basename(scene.imageFilename, extname);
    const r2Key = `content/hero/stills/${basename}-${contentHash}${extname}`;
    console.log(
      `[Runway] ${scene.id} — uploading still to R2 (key: ${r2Key})...`,
    );
    const { url: imageUrl } = await uploadFile(r2Key, stillBuffer, 'image/png');

    // When exactly ONE variant is selected, write to canonical filename
    // (hero-XX-<scene>.mp4) so the Hero component, upload:hero-finals script,
    // and Next.js public/videos/hero/ paths all pick it up automatically.
    // When multiple variants are selected, use suffixed names to avoid
    // overwriting each other.
    const singleVariant = variants.length === 1;
    const canonicalIndex = SCENES.findIndex((s) => s.id === scene.id);

    // Run each variant sequentially for this scene
    for (const variant of variants) {
      const isSlowMo = variant === '10s-slowmo';
      const duration = isSlowMo ? 10 : 5;
      const promptText = isSlowMo
        ? SLOWMO_PREFIX + scene.motionPrompt
        : scene.motionPrompt;
      const paddedIndex = String(canonicalIndex + 1).padStart(2, '0');
      const outFilename = singleVariant
        ? `hero-${paddedIndex}-${scene.id}.mp4`
        : `hero-${paddedIndex}-${scene.id}-runway-${variant}.mp4`;

      try {
        const videoBuffer = await generateRunwayClip(scene, variant, {
          promptImageUrl: imageUrl,
          promptText,
          duration,
          seed,
        });

        const outPath = path.join(HERO_VIDEOS_DIR, outFilename);
        await fs.writeFile(outPath, videoBuffer);
        console.log(
          `[Runway] ✓ Saved ${outFilename} (${(videoBuffer.length / 1024 / 1024).toFixed(1)} MB)`,
        );
      } catch (err) {
        console.error(`[Runway] ${scene.id}/${variant} — FAILED:`, err);
        failed.push(`${scene.id}/${variant}`);
      }
    }
  }

  const elapsed = ((Date.now() - startedAt) / 60_000).toFixed(1);
  console.log(
    `\n[Runway] ✅ ${totalClips - failed.length}/${totalClips} clip(s) generated in ${elapsed} min.`,
  );
  if (failed.length > 0) {
    console.log(`[Runway] ⚠️  Failed clips: ${failed.join(', ')}`);
  }
}
