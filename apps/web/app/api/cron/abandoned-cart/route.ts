import { NextRequest, NextResponse } from 'next/server';
import { sendAbandonedCartEmail } from '@/lib/email';
import { logger } from '@/lib/logger';
import { db } from '@/lib/prisma';

/**
 * Cron job for abandoned cart recovery emails
 *
 * Runs hourly - the 1-4 hour window below still catches every cart with
 * hours of margin, and less frequent polling keeps the Neon database from
 * waking every 15 minutes. Sends recovery emails for checkouts that:
 * - Were created 1-4 hours ago
 * - Haven't been completed (no order placed)
 * - Haven't had an email sent yet
 *
 * Also cleans up records older than 7 days.
 */
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    const fourHoursAgo = new Date(now.getTime() - 4 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Find abandoned checkouts ready to email
    const abandonedCheckouts = await db.abandonedCheckout.findMany({
      where: {
        emailSent: false,
        completedAt: null,
        createdAt: {
          gte: fourHoursAgo,
          lte: oneHourAgo,
        },
      },
      take: 50,
    });

    logger.info('[Abandoned Cart Cron] Found abandoned checkouts to email', {
      count: abandonedCheckouts.length,
    });

    let sent = 0;
    for (const checkout of abandonedCheckouts) {
      try {
        await sendAbandonedCartEmail({
          email: checkout.email,
          checkoutUrl: checkout.checkoutUrl,
          lineItems: checkout.lineItems as any[],
          totalPrice: checkout.totalPrice,
          currency: checkout.currency,
        });

        await db.abandonedCheckout.update({
          where: { id: checkout.id },
          data: { emailSent: true },
        });

        sent++;
      } catch (err) {
        console.error(
          `[Abandoned Cart Cron] Failed to send email for checkout ${checkout.id}:`,
          err,
        );
      }
    }

    // Clean up old records
    const { count: cleaned } = await db.abandonedCheckout.deleteMany({
      where: {
        createdAt: { lt: sevenDaysAgo },
      },
    });

    if (cleaned > 0) {
      logger.info('[Abandoned Cart Cron] Cleaned up old records', { cleaned });
    }

    return NextResponse.json({
      success: true,
      found: abandonedCheckouts.length,
      sent,
      cleaned,
    });
  } catch (error) {
    console.error('[Abandoned Cart Cron] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
