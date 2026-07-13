import { NextRequest, NextResponse } from 'next/server';
import { sendRestockReminderEmail } from '@/lib/email';
import { logger } from '@/lib/logger';
import { db } from '@/lib/prisma';

/**
 * Cron job for restock reminder emails
 *
 * Runs daily at 10AM UTC. Sends reminders for orders delivered 30+ days ago.
 */
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const deliveredOrders = await db.deliveredOrder.findMany({
      where: {
        reminderSent: false,
        deliveredAt: { lte: thirtyDaysAgo },
      },
      take: 50,
    });

    logger.info('[Restock Cron] Found orders for restock reminders', {
      count: deliveredOrders.length,
    });

    let sent = 0;
    for (const order of deliveredOrders) {
      try {
        await sendRestockReminderEmail({
          email: order.email,
          lineItems: order.lineItems as Array<{
            title: string;
            handle?: string;
            image?: string;
          }>,
        });

        await db.deliveredOrder.update({
          where: { id: order.id },
          data: { reminderSent: true },
        });

        sent++;
      } catch (err) {
        console.error(
          `[Restock Cron] Failed to send reminder for order ${order.id}:`,
          err,
        );
      }
    }

    return NextResponse.json({
      success: true,
      found: deliveredOrders.length,
      sent,
    });
  } catch (error) {
    console.error('[Restock Cron] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
