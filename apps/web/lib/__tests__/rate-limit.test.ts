import { describe, it, expect, beforeEach, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { rateLimit } from '../rate-limit';

function createRequest(path: string, ip: string = '127.0.0.1'): NextRequest {
  const req = new NextRequest(`http://localhost:3000${path}`, {
    headers: { 'x-forwarded-for': ip },
  });
  return req;
}

describe('rateLimit', () => {
  beforeEach(() => {
    // Reset the internal store between tests by importing fresh
    vi.resetModules();
  });

  it('allows requests under the limit', async () => {
    const { rateLimit } = await import('../rate-limit');
    const req = createRequest('/api/cart', '10.0.0.1');
    const result = rateLimit(req, { limit: 5, windowMs: 60_000 });
    expect(result).toBeNull();
  });

  it('returns 429 when limit is exceeded', async () => {
    const { rateLimit } = await import('../rate-limit');
    const ip = '10.0.0.2';

    for (let i = 0; i < 3; i++) {
      rateLimit(createRequest('/api/cart', ip), {
        limit: 3,
        windowMs: 60_000,
      });
    }

    const result = rateLimit(createRequest('/api/cart', ip), {
      limit: 3,
      windowMs: 60_000,
    });

    expect(result).not.toBeNull();
    expect(result!.status).toBe(429);

    const body = await result!.json();
    expect(body.error).toBe('Too many requests');
  });

  it('returns Retry-After header when rate limited', async () => {
    const { rateLimit } = await import('../rate-limit');
    const ip = '10.0.0.3';

    for (let i = 0; i < 2; i++) {
      rateLimit(createRequest('/api/test', ip), {
        limit: 2,
        windowMs: 60_000,
      });
    }

    const result = rateLimit(createRequest('/api/test', ip), {
      limit: 2,
      windowMs: 60_000,
    });

    expect(result!.headers.get('Retry-After')).toBeTruthy();
    expect(result!.headers.get('X-RateLimit-Remaining')).toBe('0');
  });

  it('tracks different IPs separately', async () => {
    const { rateLimit } = await import('../rate-limit');

    // Exhaust limit for IP A
    for (let i = 0; i < 2; i++) {
      rateLimit(createRequest('/api/cart', '10.0.0.4'), {
        limit: 2,
        windowMs: 60_000,
      });
    }

    // IP B should still be allowed
    const result = rateLimit(createRequest('/api/cart', '10.0.0.5'), {
      limit: 2,
      windowMs: 60_000,
    });
    expect(result).toBeNull();
  });

  it('tracks different paths separately', async () => {
    const { rateLimit } = await import('../rate-limit');
    const ip = '10.0.0.6';

    // Exhaust limit for /api/cart
    for (let i = 0; i < 2; i++) {
      rateLimit(createRequest('/api/cart', ip), {
        limit: 2,
        windowMs: 60_000,
      });
    }

    // /api/saved should still be allowed
    const result = rateLimit(createRequest('/api/saved', ip), {
      limit: 2,
      windowMs: 60_000,
    });
    expect(result).toBeNull();
  });
});
