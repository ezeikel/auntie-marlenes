/**
 * Social posting schedule — tracks which products have been posted.
 * State is stored as a JSON file in R2 for simplicity.
 *
 * Round-robin: cycles through all products in order. Once every product
 * has been posted in a cycle, resets and starts a new cycle.
 */

import {
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';

const SCHEDULE_KEY = 'content/social-schedule.json';

// ─── Types ──────────────────────────────────────────────────────────────────

interface PostRecord {
  handle: string;
  postedAt: string; // ISO timestamp
  cycle: number;
  postUrl?: string;
  reelUrl?: string;
  platforms: string[];
}

export interface ScheduleState {
  currentCycle: number;
  posts: PostRecord[];
}

// ─── R2 Client ──────────────────────────────────────────────────────────────

let r2Client: S3Client | null = null;

function getR2Client(): S3Client {
  if (!r2Client) {
    r2Client = new S3Client({
      region: 'auto',
      endpoint: process.env.R2_ENDPOINT!,
      credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID!,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
      },
    });
  }
  return r2Client;
}

function getBucket(): string {
  return process.env.R2_BUCKET!;
}

// ─── Read / Write ───────────────────────────────────────────────────────────

export async function loadSchedule(): Promise<ScheduleState> {
  try {
    const client = getR2Client();
    const result = await client.send(
      new GetObjectCommand({ Bucket: getBucket(), Key: SCHEDULE_KEY }),
    );
    const body = await result.Body?.transformToString();
    if (body) {
      const state = JSON.parse(body) as ScheduleState;
      console.log(
        `[Schedule] Loaded: cycle ${state.currentCycle}, ${state.posts.length} posts recorded`,
      );
      return state;
    }
  } catch (err: unknown) {
    const code = (err as { name?: string }).name;
    if (code === 'NoSuchKey' || code === 'NotFound') {
      console.log('[Schedule] No existing schedule — starting fresh');
    } else {
      console.error('[Schedule] Error loading schedule:', err);
    }
  }

  return { currentCycle: 1, posts: [] };
}

export async function saveSchedule(state: ScheduleState): Promise<void> {
  const client = getR2Client();
  await client.send(
    new PutObjectCommand({
      Bucket: getBucket(),
      Key: SCHEDULE_KEY,
      Body: JSON.stringify(state, null, 2),
      ContentType: 'application/json',
    }),
  );
  console.log(
    `[Schedule] Saved: cycle ${state.currentCycle}, ${state.posts.length} posts`,
  );
}

// ─── Selection Logic ────────────────────────────────────────────────────────

/**
 * Pick the next product handle to post.
 * Returns null only if allHandles is empty.
 */
export function pickNextProduct(
  allHandles: string[],
  state: ScheduleState,
): { handle: string; startNewCycle: boolean } | null {
  if (allHandles.length === 0) return null;

  // Which handles have been posted in the current cycle?
  const postedThisCycle = new Set(
    state.posts
      .filter((p) => p.cycle === state.currentCycle)
      .map((p) => p.handle),
  );

  // Find the first unposted handle (maintains consistent order)
  const next = allHandles.find((h) => !postedThisCycle.has(h));

  if (next) {
    return { handle: next, startNewCycle: false };
  }

  // All posted — start a new cycle with the first product
  return { handle: allHandles[0], startNewCycle: true };
}

/**
 * Record a successful post.
 */
export function recordPost(
  state: ScheduleState,
  handle: string,
  details: { postUrl?: string; reelUrl?: string; platforms: string[] },
): ScheduleState {
  return {
    ...state,
    posts: [
      ...state.posts,
      {
        handle,
        postedAt: new Date().toISOString(),
        cycle: state.currentCycle,
        postUrl: details.postUrl,
        reelUrl: details.reelUrl,
        platforms: details.platforms,
      },
    ],
  };
}
