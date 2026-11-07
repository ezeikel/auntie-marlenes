import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import createIntlMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';
import {
  UMAMI_STRIPPED_HEADERS,
  UMAMI_UPSTREAM,
  umamiProxyTarget,
} from './lib/umami';

// Create the next-intl middleware
const intlMiddleware = createIntlMiddleware(routing);

export default async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Umami through our own domain: the tracker script and its collect endpoint, so a content blocker that
  // refuses a third-party tracker does not drop it (see lib/umami.ts). Cookies, credentials and the
  // Referer are stripped before anything reaches the analytics server.
  const umamiTarget = umamiProxyTarget(pathname, request.method);
  if (umamiTarget) {
    const upstream = new URL(umamiTarget, UMAMI_UPSTREAM);
    const upstreamHeaders = new Headers(request.headers);
    upstreamHeaders.set('host', upstream.hostname);
    for (const name of UMAMI_STRIPPED_HEADERS) upstreamHeaders.delete(name);
    return NextResponse.rewrite(upstream, {
      request: { headers: upstreamHeaders },
    });
  }

  // PostHog reverse proxy
  if (pathname.startsWith('/relay-hyx5')) {
    const url = request.nextUrl.clone();

    // Determine if this is a static asset request
    const isStaticAsset = pathname.includes('/static/');

    // Set the appropriate PostHog host (EU region)
    url.host = isStaticAsset ? 'eu-assets.i.posthog.com' : 'eu.i.posthog.com';
    url.protocol = 'https';
    url.port = '';

    // Remove the /relay-hyx5 prefix from the pathname
    url.pathname = pathname.replace('/relay-hyx5', '');

    // Set headers for the proxied request
    const headers = new Headers(request.headers);
    headers.set('host', url.host);

    return NextResponse.rewrite(url, {
      request: {
        headers,
      },
    });
  }

  // Skip proxy for API routes, images, static files, and specific assets
  if (
    pathname.startsWith('/api') ||
    pathname.startsWith('/images') ||
    pathname.startsWith('/_next/static') ||
    pathname.startsWith('/_next/image') ||
    pathname.startsWith('/_vercel') ||
    pathname === '/favicon.ico' ||
    pathname === '/opengraph-image' ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // Handle internationalization routing
  return intlMiddleware(request);
}

export const config = {
  // Match only internationalized pathnames
  matcher: [
    // Match all pathnames except for:
    // - API routes
    // - _next static files
    // - _next image optimization files
    // - favicon.ico
    // - public folder files (images, etc.)
    '/((?!api|_next|_vercel|.*\\..*).*)',
  ],
};
