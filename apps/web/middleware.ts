import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import createIntlMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

// Create the next-intl middleware
const intlMiddleware = createIntlMiddleware(routing);

export default async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip i18n for Plausible analytics proxy routes
  if (pathname.startsWith('/js/') || pathname.startsWith('/proxy/')) {
    return NextResponse.next();
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
