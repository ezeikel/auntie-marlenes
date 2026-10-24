// Opt-outs and list reads for the `newsletter_subscribers` table (D1 via
// Prisma). Sign-ups go through app/actions/newsletter.ts, which clears
// unsubscribedAt because signing up again is an explicit opt-in.
//
// Anything that sends to the list must read it through
// listActiveNewsletterSubscribers(), which leaves out unsubscribed rows, and
// unsolicited marketing (abandoned cart, restock reminders) checks
// isUnsubscribed() before sending.

import { db } from '@/lib/prisma';

const normalise = (email: string) => email.trim().toLowerCase();

/**
 * Marks an address unsubscribed. Callers verify the signed token first
 * (lib/unsubscribe.ts); this function trusts its input. An address that was
 * never on the list gets a row anyway, so the opt-out is remembered, and a
 * repeat keeps the first opt-out time.
 */
export async function unsubscribeNewsletterSubscriber(
  email: string,
): Promise<{ success: boolean }> {
  const normalised = normalise(email);
  const now = new Date();
  try {
    const { count } = await db.newsletterSubscriber.updateMany({
      where: { email: normalised, unsubscribedAt: null },
      data: { unsubscribedAt: now },
    });
    if (count === 0) {
      await db.newsletterSubscriber.upsert({
        where: { email: normalised },
        create: {
          email: normalised,
          source: 'unsubscribe',
          unsubscribedAt: now,
        },
        update: {},
      });
    }
    return { success: true };
  } catch (error) {
    console.error('[newsletter] Unsubscribe failed:', error);
    return { success: false };
  }
}

/** True when the address has opted out. Throws if the database cannot be read. */
export async function isUnsubscribed(email: string): Promise<boolean> {
  const row = await db.newsletterSubscriber.findUnique({
    where: { email: normalise(email) },
    select: { unsubscribedAt: true },
  });
  return Boolean(row?.unsubscribedAt);
}

/** Everyone who should receive a newsletter send: unsubscribed rows are left out. */
export async function listActiveNewsletterSubscribers() {
  return db.newsletterSubscriber.findMany({
    where: { unsubscribedAt: null },
    orderBy: { subscribedAt: 'asc' },
  });
}
