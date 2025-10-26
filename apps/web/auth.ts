import NextAuth from 'next-auth';
import type { Profile, Account, User } from '@auth/core/types';
import GoogleProvider from 'next-auth/providers/google';
import FacebookProvider from 'next-auth/providers/facebook';
import AppleProvider from 'next-auth/providers/apple';
import Resend from 'next-auth/providers/resend';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { db } from '@auntie-marlenes/db';
import { render } from '@react-email/render';
import MagicLinkEmail from '@/components/emails/MagicLinkEmail';
import resendClient from '@/lib/resend';
import { generateAppleClientSecret } from '@/lib/apple';

type AppleProfile = Profile & {
  user?: {
    firstName?: string;
    lastName?: string;
  };
};

// const clientSecret = await generateAppleClientSecret({
//   teamId: process.env.APPLE_TEAM_ID as string,
//   keyId: process.env.APPLE_KEY_ID as string,
//   clientId: process.env.APPLE_CLIENT_ID as string,
//   privateKey: (process.env.APPLE_PRIVATE_KEY as string).replace(/\\n/g, '\n'),
// });

const config = {
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
    // FacebookProvider({
    //   clientId: process.env.FACEBOOK_CLIENT_ID as string,
    //   clientSecret: process.env.FACEBOOK_CLIENT_SECRET as string,
    //   allowDangerousEmailAccountLinking: true,
    //   authorization: {
    //     params: {
    //       scope: 'public_profile email',
    //     },
    //   },
    // }),
    // AppleProvider({
    //   clientId: process.env.APPLE_CLIENT_ID as string,
    //   clientSecret,
    //   allowDangerousEmailAccountLinking: true,
    // }),
    // Resend({
    //   apiKey: process.env.RESEND_API_KEY as string,
    //   from: process.env.EMAIL_FROM || 'no-reply@auntiemarlenes.com',
    //   async sendVerificationRequest({ identifier: email, url }) {
    //     try {
    //       const emailHtml = await render(MagicLinkEmail({ magicLink: url }));

    //       await resendClient.emails.send({
    //         from: process.env.EMAIL_FROM || 'no-reply@auntiemarlenes.com',
    //         to: email,
    //         subject: "Sign in to Auntie Marlene's",
    //         html: emailHtml,
    //       });
    //     } catch (error) {
    //       console.error('Failed to send verification email', { email }, error);
    //       throw error;
    //     }
    //   },
    // }),
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
      console.log('account', account);
      console.log('profile', profile);
      console.log('email', email);

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

        let name;

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

        return true;
      }

      if (account?.provider === 'resend') {
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

        return true;
      }

      return false;
    },
  },
  secret: process.env.NEXT_AUTH_SECRET,
};

// pass the config to NextAuth
export const {
  handlers,
  auth,
  signIn,
  signOut,
  // @ts-expect-error - Type 'typeof import("next-auth")' has no call signatures
} = NextAuth(config);
