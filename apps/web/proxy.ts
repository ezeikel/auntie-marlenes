import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export const proxy = async (request: NextRequest) => {
  const { pathname } = request.nextUrl;

  // skip middleware for API routes, images, static files, and specific assets
  if (
    pathname.startsWith('/api') ||
    pathname.startsWith('/images') ||
    pathname.startsWith('/_next/static') ||
    pathname.startsWith('/_next/image') ||
    pathname === '/favicon.ico'
  ) {
    return NextResponse.next();
  }

  // Note: Auth check removed from middleware to avoid Edge Runtime compatibility issues
  // with Prisma Client. The redirect for authenticated users is now handled in the
  // sign-in page component itself.

  return NextResponse.next();
};
