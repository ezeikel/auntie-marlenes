import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

describe('env validation', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('skips validation during build phase', async () => {
    process.env.NEXT_PHASE = 'phase-production-build';

    // Should not throw even with missing vars
    const { env } = await import('../env');
    expect(env).toBeDefined();
  });

  it('throws with clear errors for missing required vars', async () => {
    // Remove build phase flag and required vars
    delete process.env.NEXT_PHASE;
    delete process.env.SHOPIFY_STOREFRONT_API_ENDPOINT;
    delete process.env.NEXT_AUTH_SECRET;
    delete process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;

    await expect(import('../env')).rejects.toThrow(
      'Missing or invalid environment variables',
    );
  });
  it('treats blank optional local settings as unset', async () => {
    delete process.env.NEXT_PHASE;
    Object.assign(process.env, {
      SHOPIFY_STOREFRONT_API_ENDPOINT: 'https://shop.example.test/graphql',
      SHOPIFY_WEBHOOK_SECRET: 'test',
      NEXT_AUTH_SECRET: 'test',
      RESEND_API_KEY: 're_local_test',
      GOOGLE_CLIENT_ID: 'test',
      GOOGLE_CLIENT_SECRET: 'test',
      NEXT_PUBLIC_SANITY_PROJECT_ID: 'test',
      SANITY_API_TOKEN: '',
      PEXELS_API_KEY: '',
      NEXT_PUBLIC_POSTHOG_KEY: '',
      APP_ENV: '',
      NEXT_PUBLIC_APP_ENV: '',
    });
    const { env } = await import('../env');
    expect(env.server.SANITY_API_TOKEN).toBeUndefined();
    expect(env.client.NEXT_PUBLIC_POSTHOG_KEY).toBeUndefined();
  });
});
