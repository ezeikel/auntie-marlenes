'use server';

import { headers } from 'next/headers';
import { sendWelcomeEmail } from '@/lib/email';
import { isValidEmail } from '@/lib/email-format';
import { logger } from '@/lib/logger';
import { db } from '@/lib/prisma';
import { verifyTurnstile } from '@/lib/turnstile';

type NewsletterResult = {
  success: boolean;
  message: string;
};

// Subscribers live in our own `newsletter_subscribers` table (D1), not a
// third-party audience. Nothing sends to this list automatically yet; it is
// the list a future campaign would read.
export async function subscribeToNewsletter(
  email: string,
  turnstileToken?: string | null,
): Promise<NewsletterResult> {
  const normalised = email.trim().toLowerCase();
  if (!normalised || !isValidEmail(normalised)) {
    return { success: false, message: 'Please enter a valid email address.' };
  }

  const headersList = await headers();
  const ip =
    headersList.get('cf-connecting-ip') ??
    headersList.get('x-forwarded-for')?.split(',')[0]?.trim();
  if (!(await verifyTurnstile(turnstileToken, ip))) {
    return {
      success: false,
      message: "Please confirm you're not a robot and try again.",
    };
  }

  try {
    const existing = await db.newsletterSubscriber.findUnique({
      where: { email: normalised },
    });
    if (existing && !existing.unsubscribedAt) {
      return {
        success: true,
        message:
          "You're already on the list. Watch your inbox for new arrivals.",
      };
    }
    if (existing) {
      await db.newsletterSubscriber.update({
        where: { email: normalised },
        data: { unsubscribedAt: null, subscribedAt: new Date() },
      });
    } else {
      await db.newsletterSubscriber.create({
        data: { email: normalised, source: 'web' },
      });
    }

    // Best-effort welcome; the subscription stands even if the email fails.
    try {
      await sendWelcomeEmail({ email: normalised });
    } catch (error) {
      logger.error(
        '[newsletter] welcome email failed',
        error instanceof Error ? error : undefined,
      );
    }

    return {
      success: true,
      message:
        "You're in! You'll be the first to hear about new arrivals and offers.",
    };
  } catch (error) {
    console.error('[newsletter] Subscribe error:', error);
    return {
      success: false,
      message: 'Something went wrong. Please try again later.',
    };
  }
}
