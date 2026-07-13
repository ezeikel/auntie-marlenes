import { NextResponse } from 'next/server';
import { postToWorker } from '@/lib/worker';

/**
 * Daily blog-generation cron.
 *
 * Blog generation now runs on the Hetzner content worker (flat-cost box)
 * instead of Vercel compute. This route stays thin: authenticate the cron
 * caller, hand off to the worker's guarded /generate/blog (which drafts +
 * auto-publishes one post into Sanity), and return immediately. Vercel
 * auto-sends CRON_SECRET as a bearer on scheduled invocations.
 *
 * Schedule: daily at 09:00 UTC (see vercel.json).
 */
export async function GET(request: Request) {
  const cronSecret = process.env.CRON_SECRET;
  const auth = request.headers.get('authorization');

  if (!cronSecret) {
    console.error('CRON_SECRET environment variable not set');
    return NextResponse.json(
      { error: 'Server configuration error' },
      { status: 500 },
    );
  }

  if (auth !== `Bearer ${cronSecret}`) {
    console.error('Unauthorized cron request');
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const res = await postToWorker('/generate/blog', {});
    if (!res.ok) {
      return NextResponse.json(
        { error: 'worker rejected', status: res.status },
        { status: 502 },
      );
    }
    return NextResponse.json(
      { success: true, accepted: true, message: 'blog cron handed off' },
      { status: 202 },
    );
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'worker unreachable',
      },
      { status: 502 },
    );
  }
}

/**
 * Manual trigger — same handoff to the worker, useful for kicking a generation
 * outside the schedule. Guarded by CRON_SECRET.
 */
export async function POST(request: Request) {
  const cronSecret = process.env.CRON_SECRET;
  const auth = request.headers.get('authorization');

  if (!cronSecret) {
    return NextResponse.json(
      { error: 'Server configuration error' },
      { status: 500 },
    );
  }

  if (auth !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const res = await postToWorker('/generate/blog', {});
    if (!res.ok) {
      return NextResponse.json(
        { error: 'worker rejected', status: res.status },
        { status: 502 },
      );
    }
    return NextResponse.json(
      { success: true, accepted: true, message: 'blog generation handed off' },
      { status: 202 },
    );
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'worker unreachable',
      },
      { status: 502 },
    );
  }
}
