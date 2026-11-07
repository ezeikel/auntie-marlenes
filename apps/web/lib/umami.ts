/*
 * Optional Umami page-view counter. PostHog stays the product analytics sink; Umami is a
 * cookieless, self-hosted counter for the public pages, and is OFF unless the build sets BOTH:
 *
 *   NEXT_PUBLIC_UMAMI_SCRIPT_URL   https URL of the tracker script
 *   NEXT_PUBLIC_UMAMI_WEBSITE_ID   the Umami website id (a UUID)
 *
 * Neither is a credential: the tracker is public by design. They are NEXT_PUBLIC_ build-time
 * values (like NEXT_PUBLIC_APP_URL) so the root layout stays static.
 *
 * PRIVACY: the tracker is loaded with auto-track OFF and a page view is sent by us, only for
 * the public routes below, as a bare pathname with no query, no fragment and no title. The
 * account, the bag, saved items and order pages, and the Shopify checkout are never counted, and a referrer on
 * this site keeps its path only when that path is itself a public route.
 */

export type UmamiConfig = { scriptUrl: string; websiteId: string };

/** Where the middleware forwards /m/s.js and /m/api/send. */
export const UMAMI_UPSTREAM = 'https://umami.chewybytes.com';

const SITE_PATH = /^\/[A-Za-z0-9._~/-]{1,120}$/u;
const WEBSITE_ID =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/iu;

/** The tracker config, or null (render nothing) unless both values are valid. */
export function readUmamiConfig(
  env: Readonly<Record<string, string | undefined>> = {
    // Literal property reads: Next inlines NEXT_PUBLIC_ values only when written out like this.
    NEXT_PUBLIC_UMAMI_SCRIPT_URL: process.env.NEXT_PUBLIC_UMAMI_SCRIPT_URL,
    NEXT_PUBLIC_UMAMI_WEBSITE_ID: process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID,
  },
): UmamiConfig | null {
  const rawUrl = env.NEXT_PUBLIC_UMAMI_SCRIPT_URL?.trim();
  const websiteId = env.NEXT_PUBLIC_UMAMI_WEBSITE_ID?.trim();
  if (!rawUrl || !websiteId || !WEBSITE_ID.test(websiteId)) return null;
  // A path on our own domain (served by the middleware proxy, so a content blocker that refuses a
  // third-party tracker does not drop it), or an https URL with no credentials, query or fragment.
  if (rawUrl.startsWith('/')) {
    return SITE_PATH.test(rawUrl) && !rawUrl.includes('//')
      ? { scriptUrl: rawUrl, websiteId: websiteId.toLowerCase() }
      : null;
  }
  try {
    const url = new URL(rawUrl);
    if (
      url.protocol !== 'https:' ||
      url.username ||
      url.password ||
      url.search ||
      url.hash
    ) {
      return null;
    }
    return { scriptUrl: url.href, websiteId: websiteId.toLowerCase() };
  } catch {
    return null;
  }
}

const LOCALES = ['en', 'fr', 'de', 'nl', 'es'] as const;
const SEG = '[A-Za-z0-9._~-]+';

/**
 * Public routes that may be counted, after the optional language prefix (/fr, /de...; English has none) is
 * removed. Not counted: the account and its orders, the bag, saved items, the thank-you page, unsubscribe,
 * the preview and admin pages, and /api. A single segment is a shop category (they come from Shopify), so
 * any segment is allowed except those private page names.
 */
const PRIVATE_PAGES = 'account|bag|saved|thank-you|unsubscribe|og-preview|studio|admin|api';
const COUNTABLE_PATHS: readonly RegExp[] = [
  /^\/?$/u,
  /^\/(?:shop|sale|search|our-curation|hair-type|skin-type|about|contact|cookie-policy|delivery-returns|faq|privacy|terms|sign-in|blog)$/u,
  new RegExp(`^/(?:product|blog)/${SEG}$`, 'u'),
  new RegExp(`^/(?!(?:${PRIVATE_PAGES})(?:/|$))${SEG}$`, 'u'),
];

/** The path without its optional language prefix. */
function withoutLocale(pathname: string): string {
  for (const locale of LOCALES) {
    if (pathname === `/${locale}`) return '';
    if (pathname.startsWith(`/${locale}/`)) return pathname.slice(locale.length + 1);
  }
  return pathname;
}

/** Whether a page is a public route that may be counted. */
export function isUmamiCountablePath(
  pathname: string | null | undefined,
): boolean {
  if (typeof pathname !== 'string' || !pathname.startsWith('/')) return false;
  if (pathname.includes('//') || /[?#]/u.test(pathname)) return false;
  const rest = withoutLocale(pathname);
  return COUNTABLE_PATHS.some((pattern) => pattern.test(rest));
}

const withoutWww = (host: string) => host.replace(/^www\./u, '');

/**
 * A referrer reduced to what is safe to send, or '' when it is not a plain http(s) URL.
 * Another site keeps origin and path with no query or fragment. A referrer on THIS site keeps
 * its path only when it is a public route; otherwise it is the bare origin, so a share token
 * never reaches Umami. When our own origin is not known the path is dropped, never guessed.
 */
export function umamiReferrer(
  referrer: string | null | undefined,
  ownOrigin: string | null | undefined,
): string {
  if (!referrer) return '';
  try {
    const url = new URL(referrer);
    if (url.protocol !== 'https:' && url.protocol !== 'http:') return '';
    let ownHost: string | null = null;
    try {
      ownHost = ownOrigin ? new URL(ownOrigin).hostname : null;
    } catch {
      ownHost = null;
    }
    if (ownHost === null) return url.origin;
    const sameSite = withoutWww(url.hostname) === withoutWww(ownHost);
    if (sameSite && !isUmamiCountablePath(url.pathname)) return url.origin;
    return `${url.origin}${url.pathname}`;
  } catch {
    return '';
  }
}

const CAMPAIGN_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'] as const;
const CAMPAIGN_VALUE = /^[\w .~+:/-]{1,100}$/u;

/**
 * The advertising campaign tags of a query string, and nothing else: utm_source, utm_medium, utm_campaign,
 * utm_content and utm_term, each a short plain word. Every other parameter (a search, a token, a click id,
 * an email) is dropped, so an ad landing page can be attributed without sending anything personal.
 */
export function umamiCampaignQuery(search: string | null | undefined): string {
  if (typeof search !== 'string' || search.length === 0 || search.length > 2000) return '';
  let params: URLSearchParams;
  try {
    params = new URLSearchParams(search);
  } catch {
    return '';
  }
  const kept: string[] = [];
  for (const key of CAMPAIGN_KEYS) {
    const value = params.get(key)?.trim();
    if (value && CAMPAIGN_VALUE.test(value)) kept.push(`${key}=${encodeURIComponent(value)}`);
  }
  return kept.length > 0 ? `?${kept.join('&')}` : '';
}

/**
 * The page view to send for this route, or null to send nothing. Merged over the tracker's own
 * defaults, so it names every field that could carry private text: url, title, referrer. The url is
 * the bare path, plus only the advertising campaign tags (see umamiCampaignQuery).
 */
export function umamiPageview(
  pathname: string | null | undefined,
  referrer: string | null | undefined,
  ownOrigin: string | null | undefined,
  search?: string | null,
): { url: string; title: string; referrer: string } | null {
  if (!isUmamiCountablePath(pathname)) return null;
  return {
    url: `${pathname as string}${umamiCampaignQuery(search)}`,
    title: '',
    referrer: umamiReferrer(referrer, ownOrigin),
  };
}

/** Headers that must never be forwarded to Umami: our visitors' cookies, credentials, the Referer and identity headers. */
export const UMAMI_STRIPPED_HEADERS = [
  'cookie',
  'authorization',
  // The Referer is the page's whole address, query string included; Umami gets the path in the page view.
  'referer',
  'x-user-id',
  'x-profile-id',
  'x-device-id',
] as const;

/**
 * Where the middleware forwards a request for /m/s (the tracker script) or /m/api/send (the collect
 * endpoint), or null for anything else. The script has no extension on purpose: the middleware matcher
 * skips any path with a dot.
 */
export function umamiProxyTarget(
  pathname: string,
  method: string,
): '/script.js' | '/api/send' | null {
  if (pathname === '/m/s' && (method === 'GET' || method === 'HEAD'))
    return '/script.js';
  if (pathname === '/m/api/send' && (method === 'POST' || method === 'OPTIONS'))
    return '/api/send';
  return null;
}
