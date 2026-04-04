import { NextRequest, NextResponse } from 'next/server';

export const maxDuration = 300;

/**
 * Daily cron — picks the next product in the rotation and publishes an
 * image post + reel to Instagram and Facebook.
 *
 * Triggers the content worker on Hetzner (which handles scene generation,
 * video rendering, caption generation, and Meta Graph API publishing).
 *
 * Schedule: daily at 12:00 UTC (noon — catches the UK lunchtime scroll).
 */
export async function GET(request: NextRequest) {
  // Verify the request is from Vercel Cron
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret) {
    console.error('[cron/publish-next] CRON_SECRET not set');
    return NextResponse.json(
      { error: 'Server configuration error' },
      { status: 500 },
    );
  }

  if (authHeader !== `Bearer ${cronSecret}`) {
    console.error('[cron/publish-next] Unauthorized request');
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const workerUrl = process.env.CONTENT_WORKER_URL;
  const workerSecret = process.env.CONTENT_WORKER_SECRET;

  if (!workerUrl || !workerSecret) {
    console.error(
      '[cron/publish-next] CONTENT_WORKER_URL or CONTENT_WORKER_SECRET not set',
    );
    return NextResponse.json(
      { error: 'Worker not configured' },
      { status: 500 },
    );
  }

  try {
    console.log('[cron/publish-next] Triggering content worker');

    const res = await fetch(`${workerUrl}/publish/next`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${workerSecret}`,
      },
      body: JSON.stringify({
        dry_run: false,
        platforms: ['instagram', 'facebook'],
      }),
    });

    const data = await res.json();

    if (!res.ok || !data.success) {
      console.error('[cron/publish-next] Worker returned error:', data);
      return NextResponse.json(
        {
          success: false,
          error: data.error || `Worker returned HTTP ${res.status}`,
          data,
        },
        { status: 500 },
      );
    }

    console.log('[cron/publish-next] Published successfully', {
      product: data.product?.handle,
      cycle: data.cycle,
    });

    return NextResponse.json({
      success: true,
      product: data.product,
      cycle: data.cycle,
      headline: data.headline,
      publishing: data.publishing,
    });
  } catch (error) {
    console.error('[cron/publish-next] Failed to reach worker:', error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : 'Failed to connect to content worker',
      },
      { status: 500 },
    );
  }
}
