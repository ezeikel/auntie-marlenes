import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import createIntlMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

// Create the next-intl middleware
const intlMiddleware = createIntlMiddleware(routing);

export const proxy = async (request: NextRequest) => {
  const { pathname } = request.nextUrl;

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
};

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
