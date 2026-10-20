import { createRemoteJWKSet, jwtVerify } from 'jose';
import { createToken } from '@/lib/auth-mobile';
import { db } from '@/lib/prisma';

const GOOGLE_JWKS = createRemoteJWKSet(
  new URL('https://www.googleapis.com/oauth2/v3/certs'),
);

export async function POST(req: Request) {
  try {
    const { idToken } = await req.json();

    if (!idToken || typeof idToken !== 'string') {
      return Response.json({ error: 'idToken is required' }, { status: 400 });
    }

    const audience = process.env.GOOGLE_WEB_CLIENT_ID;
    if (!audience) throw new Error('GOOGLE_WEB_CLIENT_ID not set');
    const { payload } = await jwtVerify(idToken, GOOGLE_JWKS, {
      issuer: ['accounts.google.com', 'https://accounts.google.com'],
      audience,
      algorithms: ['RS256'],
      requiredClaims: ['sub', 'iat', 'exp'],
      clockTolerance: 300,
    });
    if (typeof payload.email !== 'string' || !payload.email) {
      return Response.json({ error: 'Invalid token' }, { status: 400 });
    }

    // Find or create user
    let user = await db.user.findUnique({
      where: { email: payload.email },
    });

    if (!user) {
      user = await db.user.create({
        data: {
          email: payload.email,
          name:
            (typeof payload.name === 'string' ? payload.name : '') ||
            payload.email.split('@')[0],
        },
      });
    }

    // Generate session token (JWT)
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
    console.error('[Auth] Google sign-in error:', error);
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
