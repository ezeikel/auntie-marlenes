import { NextRequest } from 'next/server';
import { Resend } from 'resend';
import { createMagicLinkToken } from '@/lib/auth-mobile';
import { logger } from '@/lib/logger';
import { db } from '@/lib/prisma';

const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * POST /api/auth/mobile/magic-link - Send magic link email
 * Body: { email: string }
 *
 * Sends a magic link email with a short-lived token (15 minutes)
 * User clicks link → mobile app deep link → verify token → get session token
 */
export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email || !email.includes('@')) {
      return Response.json(
        { error: 'Valid email is required' },
        { status: 400 },
      );
    }

    // Generate magic link token (15 minute expiration)
    const token = await createMagicLinkToken(email);

    // Create deep link URL for mobile app
    // Format: auntiemarlenes://magic-link?token=xxx
    const magicLinkUrl = `auntiemarlenes://magic-link?token=${token}`;

    // Send email via Resend
    try {
      await resend.emails.send({
        from: 'Auntie Marlenes <noreply@auntiemarlenes.com>',
        to: email,
        subject: 'Sign in to Auntie Marlenes',
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h1 style="color: #5D4037; font-family: serif;">Auntie Marlenes</h1>
            <h2>Sign in to your account</h2>
            <p>Click the button below to sign in to your Auntie Marlenes account. This link will expire in 15 minutes.</p>
            <a href="${magicLinkUrl}" style="display: inline-block; background-color: #5D4037; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; margin: 20px 0;">
              Sign In
            </a>
            <p style="color: #666; font-size: 14px;">If you didn't request this email, you can safely ignore it.</p>
          </div>
        `,
      });

      logger.info('[Auth] Magic link email sent', { email });
    } catch (emailError) {
      console.error('[Auth] Error sending magic link email:', emailError);
      return Response.json({ error: 'Failed to send email' }, { status: 500 });
    }

    return Response.json(
      { success: true, message: 'Magic link sent to your email' },
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
    console.error('[Auth] Magic link error:', error);
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
