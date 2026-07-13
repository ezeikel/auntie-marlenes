import { NextRequest } from 'next/server';
import { createToken, verifyToken } from '@/lib/auth-mobile';
import { db } from '@/lib/prisma';

/**
 * POST /api/auth/mobile/magic-link/verify - Verify magic link token
 * Body: { token: string }
 *
 * Verifies the short-lived magic link token and returns a session token
 * Magic link tokens expire in 15 minutes
 * Session tokens expire in 7 days
 */
export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json();

    if (!token) {
      return Response.json({ error: 'Token is required' }, { status: 400 });
    }

    // Verify magic link token
    const payload = await verifyToken(token);

    if (!payload?.email) {
      return Response.json(
        { error: 'Invalid or expired token' },
        { status: 401 },
      );
    }

    // Find or create user
    let user = await db.user.findUnique({
      where: { email: payload.email },
    });

    if (!user) {
      user = await db.user.create({
        data: {
          email: payload.email,
          name: payload.email.split('@')[0],
        },
      });
    }

    // Generate session token (7 day expiration)
    const sessionToken = await createToken({
      email: user.email,
      id: user.id,
    });

    console.log('[Auth] Magic link verified for:', user.email);

    return Response.json(
      { sessionToken },
      {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          'Content-Type': 'application/json',
        },
        status: 200,
      },
    );
  } catch (error) {
    console.error('[Auth] Magic link verification error:', error);
    return Response.json(
      { error: 'Invalid or expired token' },
      { status: 401 },
    );
  }
}

export async function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
