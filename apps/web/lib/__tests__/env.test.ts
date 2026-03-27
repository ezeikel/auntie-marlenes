import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

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
    delete process.env.DATABASE_URL;
    delete process.env.NEXT_AUTH_SECRET;
    delete process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;

    await expect(import('../env')).rejects.toThrow(
      'Missing or invalid environment variables',
    );
  });
});
