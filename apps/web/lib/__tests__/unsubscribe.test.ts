import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// In-memory stand-in for the Prisma NewsletterSubscriber delegate, covering
// the calls lib/newsletter-subscribers.ts makes.
type Row = {
  id: string;
  email: string;
  source: string | null;
  subscribedAt: Date;
  unsubscribedAt: Date | null;
};
const rows = new Map<string, Row>();
const matches = (row: Row, where: Partial<Row>) =>
  Object.entries(where).every(
    ([key, value]) => row[key as keyof Row] === value,
  );

vi.mock('@/lib/prisma', () => ({
  db: {
    newsletterSubscriber: {
      findUnique: async ({ where }: { where: { email: string } }) =>
        rows.get(where.email) ?? null,
      findMany: async ({ where }: { where: Partial<Row> }) =>
        [...rows.values()].filter((row) => matches(row, where)),
      updateMany: async ({
        where,
        data,
      }: {
        where: Partial<Row>;
        data: Partial<Row>;
      }) => {
        const hits = [...rows.values()].filter((row) => matches(row, where));
        for (const row of hits) Object.assign(row, data);
        return { count: hits.length };
      },
      upsert: async ({
        where,
        create,
        update,
      }: {
        where: { email: string };
        create: Partial<Row> & { email: string };
        update: Partial<Row>;
      }) => {
        const existing = rows.get(where.email);
        if (existing) return Object.assign(existing, update);
        const row: Row = {
          id: `row-${rows.size + 1}`,
          source: null,
          subscribedAt: new Date(),
          unsubscribedAt: null,
          ...create,
        };
        rows.set(row.email, row);
        return row;
      },
    },
  },
}));

const { GET, POST } = await import('@/app/api/unsubscribe/route');
const { confirmUnsubscribe } = await import('@/app/actions/unsubscribe');
const { isUnsubscribed, listActiveNewsletterSubscribers } = await import(
  '@/lib/newsletter-subscribers'
);
const {
  createUnsubscribeToken,
  getUnsubscribeHeaders,
  getUnsubscribeUrl,
  verifyUnsubscribeToken,
} = await import('@/lib/unsubscribe');

const SECRET = 'test-secret-not-a-real-key';
const SITE = 'https://www.auntiemarlenes.com';

const subscribe = (email: string) =>
  rows.set(email, {
    id: email,
    email,
    source: 'web',
    subscribedAt: new Date('2026-10-01T00:00:00Z'),
    unsubscribedAt: null,
  });

const oneClick = (query: string) =>
  POST(
    new Request(`${SITE}/api/unsubscribe?${query}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: 'List-Unsubscribe=One-Click',
    }),
  );

const signedQuery = async (email: string) =>
  new URLSearchParams({
    e: email,
    t: (await createUnsubscribeToken(email)) as string,
  }).toString();

beforeEach(() => {
  vi.stubEnv('NEXT_AUTH_SECRET', SECRET);
  rows.clear();
});

afterEach(() => {
  vi.unstubAllEnvs();
});

describe('unsubscribe tokens', () => {
  it('verifies a token for the address it was issued for, in any case', async () => {
    const token = await createUnsubscribeToken('Shopper@Example.com');
    expect(token).toMatch(/^[A-Za-z0-9_-]{43}$/);
    expect(await verifyUnsubscribeToken('shopper@example.com', token)).toBe(
      true,
    );
  });

  it('rejects a token for a different address', async () => {
    const token = await createUnsubscribeToken('shopper@example.com');
    expect(await verifyUnsubscribeToken('other@example.com', token)).toBe(
      false,
    );
  });

  it('rejects a tampered token', async () => {
    const token = (await createUnsubscribeToken(
      'shopper@example.com',
    )) as string;
    const flipped = `${token[0] === 'A' ? 'B' : 'A'}${token.slice(1)}`;
    expect(await verifyUnsubscribeToken('shopper@example.com', flipped)).toBe(
      false,
    );
    expect(
      await verifyUnsubscribeToken('shopper@example.com', `${token}x`),
    ).toBe(false);
  });

  it('rejects a token signed with another secret', async () => {
    const token = await createUnsubscribeToken('shopper@example.com', 'other');
    expect(await verifyUnsubscribeToken('shopper@example.com', token)).toBe(
      false,
    );
  });

  it('fails closed without the secret', async () => {
    const token = await createUnsubscribeToken('shopper@example.com');
    vi.stubEnv('NEXT_AUTH_SECRET', '');
    expect(await verifyUnsubscribeToken('shopper@example.com', token)).toBe(
      false,
    );
    expect(await getUnsubscribeUrl('shopper@example.com')).toBeNull();
    expect(await getUnsubscribeHeaders('shopper@example.com')).toEqual({
      'List-Unsubscribe':
        '<mailto:hello@auntiemarlenes.com?subject=Unsubscribe>',
    });
  });

  it('builds the page link and the one-click headers', async () => {
    const query = await signedQuery('shopper+hair@example.com');
    expect(await getUnsubscribeUrl('Shopper+Hair@example.com')).toBe(
      `${SITE}/unsubscribe?${query}`,
    );
    expect(await getUnsubscribeHeaders('shopper+hair@example.com')).toEqual({
      'List-Unsubscribe': `<${SITE}/api/unsubscribe?${query}>`,
      'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
    });
  });
});

describe('POST /api/unsubscribe (RFC 8058 one-click)', () => {
  it('unsubscribes an existing subscriber', async () => {
    subscribe('shopper@example.com');
    const header = (await getUnsubscribeHeaders('shopper@example.com'))[
      'List-Unsubscribe'
    ];

    const response = await oneClick(
      new URL(header.slice(1, -1)).search.slice(1),
    );

    expect(response.status).toBe(200);
    expect(await isUnsubscribed('shopper@example.com')).toBe(true);
    expect(rows.get('shopper@example.com')?.source).toBe('web');
    expect(await listActiveNewsletterSubscribers()).toEqual([]);
  });

  it('remembers an opt-out for an address that was never on the list', async () => {
    const response = await oneClick(await signedQuery('buyer@example.com'));

    expect(response.status).toBe(200);
    expect(rows.get('buyer@example.com')).toMatchObject({
      source: 'unsubscribe',
    });
    expect(await isUnsubscribed('buyer@example.com')).toBe(true);
  });

  it('keeps the first opt-out time on a repeat click', async () => {
    subscribe('shopper@example.com');
    const query = await signedQuery('shopper@example.com');
    await oneClick(query);
    const first = rows.get('shopper@example.com')?.unsubscribedAt;
    await new Promise((resolve) => setTimeout(resolve, 5));
    await oneClick(query);
    expect(rows.get('shopper@example.com')?.unsubscribedAt).toBe(first);
  });

  it('does nothing for an invalid token', async () => {
    subscribe('shopper@example.com');
    const token = await createUnsubscribeToken('someone-else@example.com');

    const response = await oneClick(
      new URLSearchParams({
        e: 'shopper@example.com',
        t: token as string,
      }).toString(),
    );

    expect(response.status).toBe(400);
    expect(await isUnsubscribed('shopper@example.com')).toBe(false);
    expect(await listActiveNewsletterSubscribers()).toHaveLength(1);
  });

  it('does nothing without the secret', async () => {
    subscribe('shopper@example.com');
    const query = await signedQuery('shopper@example.com');
    vi.stubEnv('NEXT_AUTH_SECRET', '');

    const response = await oneClick(query);

    expect(response.status).toBe(400);
    expect(await isUnsubscribed('shopper@example.com')).toBe(false);
  });

  it('sends a GET to the confirm page without unsubscribing', async () => {
    subscribe('shopper@example.com');
    const response = GET(
      new Request(`${SITE}/api/unsubscribe?e=shopper%40example.com&t=abc`),
    );
    expect(response.status).toBe(303);
    expect(response.headers.get('location')).toBe(
      `${SITE}/unsubscribe?e=shopper%40example.com&t=abc`,
    );
    expect(await isUnsubscribed('shopper@example.com')).toBe(false);
  });
});

describe('confirm button (server action)', () => {
  const form = (email: string, token: string) => {
    const data = new FormData();
    data.set('e', email);
    data.set('t', token);
    return data;
  };

  it('unsubscribes with a valid token', async () => {
    subscribe('shopper@example.com');
    const token = (await createUnsubscribeToken(
      'shopper@example.com',
    )) as string;
    expect(
      await confirmUnsubscribe(
        { status: 'idle' },
        form('shopper@example.com', token),
      ),
    ).toEqual({ status: 'done' });
    expect(await isUnsubscribed('shopper@example.com')).toBe(true);
  });

  it('rejects a forged token', async () => {
    subscribe('shopper@example.com');
    expect(
      await confirmUnsubscribe(
        { status: 'idle' },
        form('shopper@example.com', 'forged'),
      ),
    ).toEqual({ status: 'invalid' });
    expect(await isUnsubscribed('shopper@example.com')).toBe(false);
  });
});
