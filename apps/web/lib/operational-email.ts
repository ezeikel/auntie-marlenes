import { runAfterResponse } from '@/lib/after-response';
import { type SendEmailInput, sendEmail } from '@/lib/cloudflare-email';
import { REPLY_TO } from '@/lib/email-config';
import { postToSlack } from '@/lib/slack-alert';

const routine = new Set([
  'abandoned_cart',
  'restock_reminder',
  'welcome',
  'magic_link',
]);

export async function sendOperationalEmail(input: SendEmailInput) {
  const result = await sendEmail(input);
  const kind = input.headers?.['X-Email-Kind'] ?? 'transactional';
  const recipients = typeof input.to === 'string' ? [input.to] : input.to;
  const internal = recipients.every(
    (to) => to.trim().toLowerCase() === REPLY_TO,
  );
  if (!result.ok || result.suppressed.length > 0) {
    runAfterResponse(() =>
      postToSlack('emails', `Email not delivered · ${kind}`),
    );
  } else if (!routine.has(kind) && !internal) {
    runAfterResponse(() => postToSlack('emails', `Email accepted · ${kind}`));
  }
  return result;
}
