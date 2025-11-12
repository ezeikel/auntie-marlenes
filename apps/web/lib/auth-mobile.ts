/**
 * Mobile authentication utilities
 * Handles Bearer token validation and user extraction for mobile API endpoints
 */

import { headers } from 'next/headers';
import { db } from '@/lib/prisma';
import { jwtVerify, SignJWT } from 'jose';

// Ensure NEXT_AUTH_SECRET is set (no insecure fallback)
if (!process.env.NEXT_AUTH_SECRET) {
  throw new Error('NEXT_AUTH_SECRET environment variable must be set');
}

const JWT_SECRET = new TextEncoder().encode(process.env.NEXT_AUTH_SECRET);

export type TokenPayload = {
  email: string;
  id: string;
};

/**
 * Create a JWT token for mobile authentication
 * Session tokens expire in 7 days
 */
export async function createToken(payload: TokenPayload): Promise<string> {
  return await new SignJWT(payload as any)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(JWT_SECRET);
}

/**
 * Create a short-lived magic link token
 * Magic link tokens expire in 15 minutes
 */
export async function createMagicLinkToken(email: string): Promise<string> {
  return await new SignJWT({ email } as any)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('15m')
    .sign(JWT_SECRET);
}

/**
 * Verify and decode a JWT token
 */
export async function verifyToken(token: string): Promise<TokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as TokenPayload;
  } catch (error) {
    console.error('[Auth] Token verification failed:', error);
    return null;
  }
}

/**
 * Extract user ID from Bearer token in request headers
 * Returns null if no token or invalid token
 */
export async function getUserIdFromToken(): Promise<string | null> {
  try {
    const headersList = await headers();
    const authorization = headersList.get('authorization');

    if (!authorization?.startsWith('Bearer ')) {
      return null;
    }

    const token = authorization.substring(7);
    const payload = await verifyToken(token);

    return payload?.id || null;
  } catch (error) {
    console.error('[Auth] Error extracting user from token:', error);
    return null;
  }
}

/**
 * Extract user email from Bearer token
 */
export async function getUserEmailFromToken(): Promise<string | null> {
  try {
    const headersList = await headers();
    const authorization = headersList.get('authorization');

    if (!authorization?.startsWith('Bearer ')) {
      return null;
    }

    const token = authorization.substring(7);
    const payload = await verifyToken(token);

    return payload?.email || null;
  } catch (error) {
    console.error('[Auth] Error extracting email from token:', error);
    return null;
  }
}

/**
 * Get current user from Bearer token (for mobile endpoints)
 * Returns full user object or null
 */
export async function getCurrentUserFromToken() {
  const userId = await getUserIdFromToken();

  if (!userId) {
    return null;
  }

  const user = await db.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      emailVerified: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return user;
}
