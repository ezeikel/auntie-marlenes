/**
 * Signed newsletter unsubscribe links.
 *
 * The token is HMAC-SHA256 over the lowercased address, keyed by
 * NEXT_AUTH_SECRET (an existing server secret), so a link can only
 * unsubscribe the address it was issued for. Web Crypto, so the same code runs
 * on the Worker and in Node. A missing secret fails closed: no link is issued
 * and nothing verifies, so an unverified request never unsubscribes anyone.
 */

import { SITE_URL } from '@/lib/site';

const SECRET_NAME = 'NEXT_AUTH_SECRET';
// Domain separation: the same secret also signs sessions and mobile JWTs.
const PURPOSE = 'newsletter-unsubscribe:';

const siteUrl = () => SITE_URL;

/** Where an unsigned request is pointed when no signed link can be issued. */
export const UNSUBSCRIBE_MAILTO =
  'mailto:hello@auntiemarlenes.com?subject=Unsubscribe';

export const normaliseEmail = (email: string) => email.trim().toLowerCase();

const readSecret = (): string | null =>
  process.env[SECRET_NAME]?.trim() || null;

const toBase64Url = (bytes: ArrayBuffer) => {
  let binary = '';
  for (const byte of new Uint8Array(bytes)) {
    binary += String.fromCharCode(byte);
  }
  return btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
};

const sign = async (email: string, secret: string) => {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const signature = await crypto.subtle.sign(
    'HMAC',
    key,
    encoder.encode(PURPOSE + normaliseEmail(email)),
  );
  return toBase64Url(signature);
};

const constantTimeEqual = (a: string, b: string) => {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
};

/** The token for an address, or null when the secret is not configured. */
export const createUnsubscribeToken = async (
  email: string,
  secret: string | null = readSecret(),
): Promise<string | null> => (secret ? sign(email, secret) : null);

/** True only for a token issued for this address with the configured secret. */
export const verifyUnsubscribeToken = async (
  email: string | null | undefined,
  token: string | null | undefined,
  secret: string | null = readSecret(),
): Promise<boolean> => {
  if (!secret || !email || !token) return false;
  return constantTimeEqual(await sign(email, secret), token);
};

const signedQuery = async (email: string) => {
  const token = await createUnsubscribeToken(email);
  if (!token) return null;
  return new URLSearchParams({ e: normaliseEmail(email), t: token }).toString();
};

/** `${SITE}/unsubscribe?e=..&t=..` for an email footer, or null without the secret. */
export const getUnsubscribeUrl = async (
  email: string,
): Promise<string | null> => {
  const query = await signedQuery(email);
  return query ? `${siteUrl()}/unsubscribe?${query}` : null;
};

/**
 * RFC 8058 one-click headers for a marketing email. Without the secret it
 * falls back to a mailto List-Unsubscribe (no one-click).
 */
export const getUnsubscribeHeaders = async (
  email: string,
): Promise<Record<string, string>> => {
  const query = await signedQuery(email);
  if (!query) return { 'List-Unsubscribe': `<${UNSUBSCRIBE_MAILTO}>` };
  return {
    'List-Unsubscribe': `<${siteUrl()}/api/unsubscribe?${query}>`,
    'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
  };
};
