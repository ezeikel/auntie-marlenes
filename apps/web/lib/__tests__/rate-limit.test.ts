import { NextRequest } from 'next/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const bindings = vi.hoisted(() => ({
  RATE_LIMIT_10: { limit: vi.fn() },
  RATE_LIMIT_30: { limit: vi.fn() },
  RATE_LIMIT_60: { limit: vi.fn() },
}));
vi.mock('next/server', async (importOriginal) => ({
  ...(await importOriginal<typeof import('next/server')>()),
  connection: vi.fn(async () => {}),
}));
vi.mock('@opennextjs/cloudflare', () => ({
  getCloudflareContext: () => ({ env: bindings }),
}));

import { rateLimit } from '../rate-limit';

const request = (
  path = '/api/cart',
  headers = { 'x-forwarded-for': '10.0.0.1, 10.0.0.2' },
) => new NextRequest(`https://local.test${path}`, { headers });

describe('Workers rate limiting', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });
  it.each([10, 30, 60])(
    'selects the exact %s/minute binding',
    async (limit) => {
      const binding = bindings[`RATE_LIMIT_${limit}` as keyof typeof bindings];
      binding.limit.mockResolvedValue({ success: true });
      expect(
        await rateLimit(request(), { limit, windowMs: 60_000 }),
      ).toBeNull();
      expect(binding.limit).toHaveBeenCalledWith({ key: '10.0.0.1:/api/cart' });
    },
  );
  it('returns 429 and conservative retry headers when the binding denies', async () => {
    bindings.RATE_LIMIT_30.limit.mockResolvedValue({ success: false });
    const response = await rateLimit(request(), {
      limit: 30,
      windowMs: 60_000,
    });
    expect(response?.status).toBe(429);
    expect(response?.headers.get('Retry-After')).toBe('60');
    expect(response?.headers.get('X-RateLimit-Limit')).toBe('30');
    expect(response?.headers.get('X-RateLimit-Remaining')).toBe('0');
    expect(await response?.json()).toEqual({ error: 'Too many requests' });
  });
  it('uses the trusted connecting IP and keeps paths distinct', async () => {
    bindings.RATE_LIMIT_10.limit.mockResolvedValue({ success: true });
    for (const path of ['/api/saved', '/api/saved/sync']) {
      const req = new NextRequest(`https://local.test${path}`, {
        headers: {
          'cf-connecting-ip': '10.1.1.1',
          'x-forwarded-for': 'spoofed',
        },
      });
      await rateLimit(req, { limit: 10, windowMs: 60_000 });
      expect(bindings.RATE_LIMIT_10.limit).toHaveBeenLastCalledWith({
        key: `10.1.1.1:${path}`,
      });
    }
  });
  it('refuses silently approximating an unconfigured policy', async () => {
    await expect(
      rateLimit(request(), { limit: 5, windowMs: 60_000 }),
    ).rejects.toThrow('Unsupported');
  });
});
