import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const unsubscribed = new Set<string>();
const send = vi.hoisted(() =>
  vi.fn().mockResolvedValue({ ok: true, messageId: 'stub', suppressed: [] }),
);

vi.mock('@/lib/prisma', () => ({
  db: {
    newsletterSubscriber: {
      findUnique: async ({ where }: { where: { email: string } }) =>
        unsubscribed.has(where.email)
          ? { unsubscribedAt: new Date('2026-10-24T00:00:00Z') }
          : null,
    },
  },
}));
vi.mock('@/lib/cloudflare-email', () => ({
  sendEmail: send,
  readEmailCredentials: () => null,
}));

const { sendAbandonedCartEmail, sendOrderCancellationEmail } = await import(
  '@/lib/email'
);
const { getUnsubscribeUrl } = await import('@/lib/unsubscribe');

const checkout = {
  email: 'shopper@example.com',
  checkoutUrl: 'https://checkout.example/abc',
  lineItems: [{ title: 'Shea butter', price: '5.00', quantity: 1 }],
  totalPrice: '5.00',
  currency: 'GBP',
};

beforeEach(() => {
  vi.stubEnv('NEXT_AUTH_SECRET', 'test-secret-not-a-real-key');
  unsubscribed.clear();
  send.mockClear();
});

afterEach(() => {
  vi.unstubAllEnvs();
});

describe('marketing email unsubscribe', () => {
  it('carries the signed footer link and one-click headers', async () => {
    await sendAbandonedCartEmail(checkout);

    expect(send).toHaveBeenCalledOnce();
    const message = send.mock.calls[0][0];
    const url = (await getUnsubscribeUrl('shopper@example.com')) as string;
    expect(message.html).toContain(`href="${url.replace('&', '&amp;')}"`);
    expect(message.headers).toMatchObject({
      'X-Email-Kind': 'abandoned_cart',
      'List-Unsubscribe': `<${url.replace('/unsubscribe?', '/api/unsubscribe?')}>`,
      'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
    });
  });

  it('skips an abandoned cart email to an address that opted out', async () => {
    unsubscribed.add('shopper@example.com');
    await sendAbandonedCartEmail(checkout);
    expect(send).not.toHaveBeenCalled();
  });

  it('keeps order emails free of unsubscribe links and headers', async () => {
    await sendOrderCancellationEmail({
      email: 'shopper@example.com',
      order_number: 1001,
    });

    const message = send.mock.calls[0][0];
    expect(message.headers).toEqual({ 'X-Email-Kind': 'order_cancellation' });
    expect(message.html).not.toContain('/unsubscribe');
  });
});
