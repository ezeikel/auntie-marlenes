import { db } from '@/lib/prisma';
import { createToken } from '@/lib/auth-mobile';

export async function POST(req: Request) {
  try {
    const { accessToken } = await req.json();

    if (!accessToken) {
      return Response.json(
        { error: 'accessToken is required' },
        { status: 400 },
      );
    }

    // Verify Facebook access token and get user info
    const response = await fetch(
      `https://graph.facebook.com/me?fields=id,name,email&access_token=${accessToken}`,
    );

    if (!response.ok) {
      return Response.json(
        { error: 'Invalid Facebook token' },
        { status: 400 },
      );
    }

    const fbUser = await response.json();

    if (!fbUser.email) {
      return Response.json(
        { error: 'Email not provided by Facebook' },
        { status: 400 },
      );
    }

    // Find or create user
    let user = await db.user.findUnique({
      where: { email: fbUser.email },
    });

    if (!user) {
      user = await db.user.create({
        data: {
          email: fbUser.email,
          name: fbUser.name || fbUser.email.split('@')[0],
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
    console.error('[Auth] Facebook sign-in error:', error);
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
