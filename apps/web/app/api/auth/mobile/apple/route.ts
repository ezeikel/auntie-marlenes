import { createRemoteJWKSet, jwtVerify } from 'jose';
import { createToken } from '@/lib/auth-mobile';
import { db } from '@/lib/prisma';

const APPLE_JWKS = createRemoteJWKSet(
  new URL('https://appleid.apple.com/auth/keys'),
);

export async function POST(req: Request) {
  try {
    const { identityToken } = await req.json();

    if (!identityToken || typeof identityToken !== 'string') {
      return Response.json(
        { error: 'identityToken is required' },
        { status: 400 },
      );
    }

    // Comma-separated bundle ids: production, preview and dev builds each sign
    // in with their own, and Apple puts the bundle id in the token's `aud`.
    const audience = (process.env.APPLE_MOBILE_CLIENT_ID ?? '')
      .split(',')
      .map((id) => id.trim())
      .filter(Boolean);
    if (audience.length === 0)
      throw new Error('APPLE_MOBILE_CLIENT_ID not set');
    const { payload: decoded } = await jwtVerify(identityToken, APPLE_JWKS, {
      issuer: 'https://appleid.apple.com',
      audience,
      algorithms: ['RS256'],
      requiredClaims: ['sub', 'iat', 'exp'],
    });
    if (typeof decoded.email !== 'string' || !decoded.email) {
      return Response.json({ error: 'Invalid Apple token' }, { status: 400 });
    }

    // Find or create user
    let user = await db.user.findUnique({
      where: { email: decoded.email },
    });

    if (!user) {
      user = await db.user.create({
        data: {
          email: decoded.email,
          name: decoded.email.split('@')[0], // Apple might not provide a name
        },
      });
    }

    // Generate session token for mobile app
    const sessionToken = await createToken({
      email: user.email,
      id: user.id,
    });

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
    console.error('[Auth] Apple sign-in error:', error);
    return Response.json({ error: 'Bad request' }, { status: 400 });
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
