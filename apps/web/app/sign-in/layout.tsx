import { generatePageMetadata } from '@/lib/metadata';
import type { Metadata } from 'next';

export const metadata: Metadata = generatePageMetadata({
  title: 'Sign In',
  description:
    "Sign in to your Auntie Marlene's account to access your orders, saved items, and preferences.",
  path: '/sign-in',
  noIndex: true, // Auth pages should not be indexed
});

export default function SignInLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
