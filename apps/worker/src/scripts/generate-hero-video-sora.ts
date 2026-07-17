#!/usr/bin/env npx tsx
/**
 * One-off Sora 2 Pro test for Scene 1 (bonnet).
 *
 * Calls fal-ai/sora-2/image-to-video/pro with:
 *   - 1080p native resolution
 *   - 20s native duration (no ffmpeg slow-mo — Sora interprets "slow motion"
 *     semantically and distributes the motion across the full 20 seconds)
 *   - 16:9 aspect ratio
 *
 * No Claude judge, no retry loop — human eyes are the judge.
 * Cost: ~$10 (1080p Pro is $0.50/sec × 20s).
 *
 * Usage:
 *   pnpm gen:hero-video-sora
 *
 * Prerequisites:
 *   - apps/web/public/images/hero/hero-01-bonnet.png must exist
 *   - FAL_KEY, R2_* env vars set
 */

import 'dotenv/config';
import { execFile } from 'node:child_process';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';
import { fal } from '@fal-ai/client';
import { uploadFile } from '../storage';

const execFileAsync = promisify(execFile);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const HERO_IMAGES_DIR = path.resolve(
  __dirname,
  '../../../../apps/web/public/images/hero',
);
const HERO_VIDEOS_DIR = path.resolve(
  __dirname,
  '../../../../apps/web/public/videos/hero',
);

// fal.ai Sora 2 endpoints both max out at 720p in practice (the Pro endpoint's
// docs say 1080p is supported but the live API rejects it — confirmed by a
// 422 ValidationError: "Input should be 'auto' or '720p'"). So we use the
// cheaper standard endpoint at $0.10/s instead of Pro at $0.30/s.
const SORA_MODEL = 'fal-ai/sora-2/image-to-video';
// v3 — targeted fix after v2 rendered motion at normal tempo instead of slow-mo.
// Diagnosis: v2 had six named action beats which Sora used as a pace anchor,
// spreading them evenly across 20s at ~3s per beat (normal speed). v3 fixes this by:
//   (1) cutting to TWO beats so each one is stretched over ~10s = genuine slow-mo
//   (2) adding "extreme slow motion", "over the entire 20 seconds",
//       "quarter-speed playback" — playback-speed language Sora respects
//   (3) "Her body is almost completely still" — gives Sora permission for
//       minimal motion WITHOUT reading as "freeze"
//   (4) Camera-lock moved to the END so it doesn't lead and trigger the v1
//       "render a still image" failure mode
const SCENE_1 = {
  imageFilename: 'hero-01-bonnet.png',
  outputFilename: 'hero-01-bonnet-sora.mp4',
  prompt:
    'A Black woman in her mid-thirties stands at her bedroom mirror in warm tungsten lamplight, wearing an emerald green satin bonnet over her hair. In extreme slow motion, over the entire 20 seconds, she very slowly adjusts the edge of the bonnet at her temple with her fingertips, then a small private smile gradually begins to rise on her face. Her body is almost completely still. Cinematic slow motion, dreamlike slowed time, quarter-speed playback, natural realistic movement, warm amber tungsten lighting, photorealistic. The camera is fixed and does not pan or zoom.',
};

async function main() {
  await fs.mkdir(HERO_VIDEOS_DIR, { recursive: true });

  // 1. Load the source still
  const stillPath = path.join(HERO_IMAGES_DIR, SCENE_1.imageFilename);
  const stillBuffer = await fs.readFile(stillPath);

  // 2. Upload to R2 for a public URL
  const r2Key = `content/hero/stills/${SCENE_1.imageFilename}`;
  console.log('[Sora] Uploading Scene 1 still to R2...');
  const { url: imageUrl } = await uploadFile(r2Key, stillBuffer, 'image/png');
  console.log(`[Sora] Still URL: ${imageUrl}\n`);

  // 3. Call Sora 2 standard (720p max on fal.ai — see SORA_MODEL comment)
  console.log(`[Sora] Calling ${SORA_MODEL} (720p, 20s, 16:9)...`);
  console.log('[Sora] Cost: $0.10/s × 20s = $2.00');
  console.log('[Sora] This takes 3-8 minutes typically. Be patient.\n');

  let result;
  try {
    result = await fal.subscribe(SORA_MODEL, {
      input: {
        prompt: SCENE_1.prompt,
        image_url: imageUrl,
        aspect_ratio: '16:9',
        resolution: '720p',
        duration: 20,
        model: 'sora-2',
      },
      logs: true,
      onQueueUpdate: (update) => {
        if (update.status === 'IN_PROGRESS') {
          console.log('[Sora] IN_PROGRESS...');
        }
      },
    });
  } catch (err) {
    // Full error dump so 422 validation details don't get truncated to [Object]
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const e = err as any;
    console.error('\n[Sora] ERROR:', e?.message || e);
    if (e?.status) console.error('[Sora] HTTP status:', e.status);
    if (e?.body) {
      console.error('[Sora] Full response body:');
      console.error(JSON.stringify(e.body, null, 2));
    }
    if (e?.requestId) console.error('[Sora] Request ID:', e.requestId);
    throw err;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const data = result.data as any;
  const videoUrl = data?.video?.url;

  if (!videoUrl) {
    throw new Error(
      `[Sora] No video URL in response: ${JSON.stringify(data, null, 2)}`,
    );
  }

  console.log(`\n[Sora] Downloading ${videoUrl}`);
  const res = await fetch(videoUrl);
  if (!res.ok) {
    throw new Error(`[Sora] Download failed: ${res.status}`);
  }
  const videoBuffer = Buffer.from(await res.arrayBuffer());
  console.log(
    `[Sora] Raw download: ${(videoBuffer.length / 1024 / 1024).toFixed(1)} MB (includes unwanted ambient audio)`,
  );

  // 4. Strip audio track via ffmpeg. fal.ai's Sora endpoint doesn't expose an
  // audio flag, so Sora always generates ambient music we don't want on a
  // muted hero background. Copy the video stream losslessly and drop audio.
  console.log('[Sora] Stripping audio track via ffmpeg...');
  const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'sora-mute-'));
  const rawPath = path.join(tmpDir, 'raw.mp4');
  const mutedPath = path.join(tmpDir, 'muted.mp4');

  let finalBuffer: Buffer;
  try {
    await fs.writeFile(rawPath, videoBuffer);
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
    finalBuffer = await fs.readFile(mutedPath);
  } finally {
    await fs.rm(tmpDir, { recursive: true, force: true });
  }

  // 5. Save
  const outPath = path.join(HERO_VIDEOS_DIR, SCENE_1.outputFilename);
  await fs.writeFile(outPath, finalBuffer);
  console.log(
    `\n[Sora] ✅ Saved ${outPath} (${(finalBuffer.length / 1024 / 1024).toFixed(1)} MB, audio stripped)`,
  );
}

main().catch((err) => {
  console.error('[Sora] Fatal error:', err);
  process.exit(1);
});
