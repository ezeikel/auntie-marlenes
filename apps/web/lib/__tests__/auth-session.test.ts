import { expect, test, vi } from 'vitest';

type SessionCallback = (params: {
  session: unknown;
  user: unknown;
}) => Promise<unknown>;

const mocks = vi.hoisted(() => ({
  config: null as
    | null
    | (() => Promise<{ callbacks?: { session?: SessionCallback } }>),
}));

// Capture the real NextAuth configuration auth.ts builds, without starting
// Auth.js, Prisma or any provider SDK.
vi.mock('next-auth', () => ({
  default: (config: typeof mocks.config) => {
    mocks.config = config;
    return { handlers: {}, auth: vi.fn(), signIn: vi.fn(), signOut: vi.fn() };
  },
}));
vi.mock('next-auth/providers/apple', () => ({ default: vi.fn(() => ({})) }));
vi.mock('next-auth/providers/facebook', () => ({ default: vi.fn(() => ({})) }));
vi.mock('next-auth/providers/google', () => ({ default: vi.fn(() => ({})) }));
vi.mock('next/server', () => ({ after: vi.fn() }));
vi.mock('@auth/prisma-adapter', () => ({ PrismaAdapter: vi.fn(() => ({})) }));
vi.mock('@auntie-marlenes/db', () => ({ db: {} }));
vi.mock('@react-email/render', () => ({ render: vi.fn() }));
vi.mock('@/components/emails/MagicLinkEmail', () => ({ default: vi.fn() }));
vi.mock('@/lib/apple', () => ({ generateAppleClientSecret: vi.fn() }));
vi.mock('@/lib/cloudflare-email', () => ({ sendEmail: vi.fn() }));
vi.mock('@/lib/email', () => ({ sendWelcomeEmail: vi.fn() }));
vi.mock('@/lib/email-config', () => ({
  getFromAddress: vi.fn(() => "Auntie Marlene's <no-reply@example.test>"),
  isEmailConfigured: vi.fn(() => false),
}));

import '@/auth';

test('database session callback never exposes the session token or private user columns', async () => {
  const callback = (await mocks.config?.())?.callbacks?.session;
  if (!callback) throw new Error('auth.ts registered no session callback');
  // The exact shape @auth/core passes for database sessions:
  // `session: { ...adapterSession, user }` alongside the full user row.
  const user = {
    id: 'user_synthetic',
    name: 'Synthetic Shopper',
    email: 'synthetic@example.test',
    emailVerified: new Date('2030-01-01'),
    image: 'https://example.test/avatar.png',
    createdAt: new Date('2029-01-01'),
    updatedAt: new Date('2029-06-01'),
  };
  const result = await callback({
    session: {
      id: 'session_row_synthetic',
      sessionToken: 'synthetic-session-token',
      userId: 'user_synthetic',
      expires: new Date('2030-02-01'),
      user,
    },
    user,
  });
  expect(result).toEqual({
    expires: new Date('2030-02-01'),
    user: {
      id: 'user_synthetic',
      name: 'Synthetic Shopper',
      email: 'synthetic@example.test',
      image: 'https://example.test/avatar.png',
    },
  });
  const body = JSON.stringify(result);
  for (const secret of [
    'synthetic-session-token',
    'session_row_synthetic',
    'sessionToken',
    'userId',
    'emailVerified',
    'createdAt',
    'updatedAt',
  ]) {
    expect(body).not.toContain(secret);
  }
});
