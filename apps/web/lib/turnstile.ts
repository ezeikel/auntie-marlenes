// Cloudflare Turnstile. The site key is public (it ships in the page), so it lives here.
export const TURNSTILE_SITE_KEY = '0x4AAAAAAFjsbiYZJUTaGuWO';

const VERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';

/**
 * True when the token is valid. With no TURNSTILE_SECRET_KEY configured (local dev, tests,
 * CI) it allows the request and warns, so nothing breaks before the secret is set. Production
 * has the secret. Never throws: a network failure counts as a failed check.
 */
export async function verifyTurnstile(
  token: string | null | undefined,
  ip?: string | null,
): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY?.trim();
  if (!secret) {
    console.warn(
      '[turnstile] TURNSTILE_SECRET_KEY not set; skipping bot check',
    );
    return true;
  }
  if (!token) return false;
  try {
    const body = new URLSearchParams({ secret, response: token });
    if (ip) body.set('remoteip', ip);
    const res = await fetch(VERIFY_URL, {
      method: 'POST',
      body,
      signal: AbortSignal.timeout(8000),
    });
    const data = (await res.json()) as { success?: boolean };
    return data.success === true;
  } catch {
    return false;
  }
}
