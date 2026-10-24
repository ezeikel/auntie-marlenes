'use server';

import { unsubscribeNewsletterSubscriber } from '@/lib/newsletter-subscribers';
import { verifyUnsubscribeToken } from '@/lib/unsubscribe';

export type UnsubscribeState = {
  status: 'idle' | 'done' | 'invalid' | 'error';
};

/** The confirm button on /unsubscribe. Verifies the signed link before any change. */
export async function confirmUnsubscribe(
  _previous: UnsubscribeState,
  formData: FormData,
): Promise<UnsubscribeState> {
  const email = formData.get('e')?.toString() ?? '';
  const token = formData.get('t')?.toString() ?? '';
  if (!(await verifyUnsubscribeToken(email, token))) {
    return { status: 'invalid' };
  }
  const result = await unsubscribeNewsletterSubscriber(email);
  return { status: result.success ? 'done' : 'error' };
}
