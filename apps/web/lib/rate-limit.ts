import { getCloudflareContext } from '@opennextjs/cloudflare';
import { connection, type NextRequest } from 'next/server';

type Limiter = {
  limit(options: { key: string }): Promise<{ success: boolean }>;
};
type RateLimitEnv = {
  RATE_LIMIT_10: Limiter;
  RATE_LIMIT_30: Limiter;
  RATE_LIMIT_60: Limiter;
};

/** Native, per-location counters persist across isolates. Keep IP:path keys. */
export async function rateLimit(
  request: NextRequest,
  { limit, windowMs }: { limit: number; windowMs: number },
): Promise<Response | null> {
  if (windowMs !== 60_000 || ![10, 30, 60].includes(limit)) {
    throw new Error(`Unsupported rate limit: ${limit}/${windowMs}`);
  }
  await connection(); // Never consume rate-limit tokens during prerendering.
  const env = getCloudflareContext().env as unknown as RateLimitEnv;
  const binding = env[`RATE_LIMIT_${limit}` as keyof RateLimitEnv];
  const ip =
    request.headers.get('cf-connecting-ip') ||
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    'unknown';
  const { success } = await binding.limit({
    key: `${ip}:${request.nextUrl.pathname}`,
  });
  if (success) return null;
  // The binding doesn't expose its reset time; advertise a conservative window.
  return Response.json(
    { error: 'Too many requests' },
    {
      status: 429,
      headers: {
        'Retry-After': '60',
        'X-RateLimit-Limit': String(limit),
        'X-RateLimit-Remaining': '0',
        'X-RateLimit-Reset': String(Math.ceil(Date.now() / 1000) + 60),
      },
    },
  );
}
