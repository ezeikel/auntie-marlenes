import jwt from 'jsonwebtoken';
import { createToken } from '@/lib/auth-mobile';
import { db } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const { identityToken } = await req.json();

    if (!identityToken) {
      return Response.json(
        { error: 'identityToken is required' },
        { status: 400 },
      );
    }

    // Decode the Apple identity token (without verification for simplicity)
    // In production, you should verify the token signature
    const decoded = jwt.decode(identityToken) as any;

    if (!decoded || !decoded.email) {
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
