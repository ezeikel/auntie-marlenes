import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import { generatePageMetadata } from '@/lib/metadata';

export const metadata: Metadata = generatePageMetadata({
  title: 'Sign In',
  description:
    "Sign in to your Auntie Marlene's account to access your orders, saved items, and preferences.",
  path: '/sign-in',
  noIndex: true, // Auth pages should not be indexed
});

type SignInLayoutProps = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export default async function SignInLayout({
  children,
  params,
}: SignInLayoutProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <>{children}</>;
}
