import { db } from '@auntie-marlenes/db';
import type { AdapterUser } from '@auth/core/adapters';
import type { Account, Profile, Session, User } from '@auth/core/types';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { render } from '@react-email/render';
import { after } from 'next/server';
import NextAuth from 'next-auth';
import AppleProvider from 'next-auth/providers/apple';
import type { EmailConfig } from 'next-auth/providers/email';
import FacebookProvider from 'next-auth/providers/facebook';
import GoogleProvider from 'next-auth/providers/google';
import MagicLinkEmail from '@/components/emails/MagicLinkEmail';
import { generateAppleClientSecret } from '@/lib/apple';
import { sendEmail } from '@/lib/cloudflare-email';
import { sendWelcomeEmail } from '@/lib/email';
import { getFromAddress, isEmailConfigured } from '@/lib/email-config';

type AppleProfile = Profile & {
  user?: {
    firstName?: string;
    lastName?: string;
  };
};

// Resolve once per isolate, on the first auth request. A bad key disables only
// Apple, so other providers continue to work. Refresh before the JWT expires.
let appleSecret: { value: string; expiresAt: number } | undefined;
let appleSecretPromise: Promise<string> | undefined;
async function getAppleSecret(): Promise<string> {
  if (appleSecret && Date.now() < appleSecret.expiresAt)
    return appleSecret.value;
  if (appleSecretPromise) return appleSecretPromise;
  appleSecretPromise = (async () => {
    if (
      !process.env.APPLE_TEAM_ID ||
      !process.env.APPLE_KEY_ID ||
      !process.env.APPLE_CLIENT_ID ||
      !process.env.APPLE_PRIVATE_KEY
    )
      return '';
    try {
      const value = await generateAppleClientSecret({
        teamId: process.env.APPLE_TEAM_ID,
        keyId: process.env.APPLE_KEY_ID,
        clientId: process.env.APPLE_CLIENT_ID,
        privateKey: process.env.APPLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      });
      appleSecret = { value, expiresAt: Date.now() + 60 * 60 * 1000 };
      return value;
    } catch (error) {
      console.error(
        'Apple client secret generation failed; Apple sign-in disabled.',
        error,
      );
      return '';
    }
  })();
  try {
    return await appleSecretPromise;
  } finally {
    appleSecretPromise = undefined;
  }
}

const getConfig = async () => {
  const clientSecret = await getAppleSecret();
  return {
    trustHost: true,

    adapter: PrismaAdapter(db),
    session: {
      strategy: 'database' as const,
      maxAge: 30 * 24 * 60 * 60, // 30 days
      updateAge: 24 * 60 * 60, // 24 hours
    },
    pages: {
      signIn: '/sign-in',
    },
    providers: [
      GoogleProvider({
        clientId: process.env.GOOGLE_CLIENT_ID as string,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
        allowDangerousEmailAccountLinking: true,
      }),
      FacebookProvider({
        clientId: process.env.FACEBOOK_CLIENT_ID as string,
        clientSecret: process.env.FACEBOOK_CLIENT_SECRET as string,
        allowDangerousEmailAccountLinking: true,
        authorization: {
          params: {
            scope: 'public_profile email',
          },
        },
      }),
      // Only include Apple when its client secret generated successfully — a bad
      // APPLE_PRIVATE_KEY leaves clientSecret '' (see above) and Apple is omitted
      // rather than added with an unusable secret.
      ...(clientSecret
        ? [
            AppleProvider({
              clientId: process.env.APPLE_CLIENT_ID as string,
              clientSecret,
              allowDangerousEmailAccountLinking: true,
            }),
          ]
        : []),
      // Magic link through Cloudflare Email Sending; only offered when the
      // credential is present, so other providers keep working without it.
      ...(isEmailConfigured() ? [emailProvider] : []),
    ],
    callbacks: {
      async signIn({
        account,
        profile,
        email,
      }: {
        user: User;
        account: Account | null;
        profile?: Profile;
        email?: { verificationRequest?: boolean };
      }) {
        // handle magic link request
        if (email?.verificationRequest) {
          return true;
        }

        if (
          account?.provider === 'google' ||
          account?.provider === 'apple' ||
          account?.provider === 'facebook'
        ) {
          const appleProfile = profile as AppleProfile;
          const existingUser = profile?.email
            ? await db.user.findUnique({ where: { email: profile.email } })
            : null;

          if (existingUser) {
            return true;
          }

          let name: string | null | undefined;

          if (
            account?.provider === 'google' ||
            account?.provider === 'facebook'
          ) {
            name = profile?.name;
          } else if (account?.provider === 'apple' && appleProfile?.user) {
            // Apple only returns the user object this first time the user authorises the app - subsequent authorisations don't return the user object
            name = `${appleProfile.user.firstName} ${appleProfile.user.lastName}`;
          }

          await db.user.create({
            data: {
              email: profile?.email as string,
              name: name as string,
            },
          });

          // Send welcome email (non-blocking)
          after(async () => {
            await sendWelcomeEmail({
              email: profile?.email as string,
              name: name as string,
            }).catch((err) =>
              console.error('[Auth] Failed to send welcome email:', err),
            );
          });

          return true;
        }

        if (account?.provider === 'email') {
          const userEmail = account.providerAccountId;

          if (!userEmail) return false;

          const existingUser = await db.user.findUnique({
            where: { email: userEmail },
          });

          if (existingUser) {
            return true;
          }

          await db.user.create({
            data: {
              email: userEmail,
            },
          });

          // Send welcome email (non-blocking)
          after(async () => {
            await sendWelcomeEmail({ email: userEmail }).catch((err) =>
              console.error('[Auth] Failed to send welcome email:', err),
            );
          });

          return true;
        }

        return false;
      },
      async session({
        session,
        user,
      }: {
        session: Session;
        user: AdapterUser;
      }) {
        // Add user id to session
        if (session.user && user) {
          session.user.id = user.id;
        }
        return session;
      },
    },
    secret: process.env.NEXT_AUTH_SECRET,
  };
};

// Resolve environment bindings and the Apple secret inside the request.
// A plain Auth.js "email" provider (the shape next-auth/providers/resend
// returns) that delivers the magic link through Cloudflare Email Sending.
const emailProvider: EmailConfig = {
  id: 'email',
  type: 'email',
  name: 'Email',
  from: getFromAddress('no-reply'),
  maxAge: 24 * 60 * 60,
  options: {},
  async sendVerificationRequest({ identifier: email, url }) {
    const emailHtml = await render(MagicLinkEmail({ magicLink: url }));
    const result = await sendEmail({
      from: getFromAddress('no-reply'),
      to: email,
      subject: "Sign in to Auntie Marlene's",
      html: emailHtml,
      headers: { 'X-Email-Kind': 'magic_link' },
    });
    if (!result.ok) {
      console.error('Failed to send verification email', { email }, result);
      throw new Error(`Magic link email failed: ${result.code}`);
    }
  },
};

export const {
  handlers,
  auth,
  signIn,
  signOut,
  // @ts-expect-error - Type 'typeof import("next-auth")' has no call signatures
} = NextAuth(getConfig);
