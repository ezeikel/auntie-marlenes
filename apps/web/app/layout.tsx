import type { Metadata } from 'next';
import { Inter, Playfair_Display } from 'next/font/google';
import { Analytics } from '@vercel/analytics/react';
import '@fortawesome/fontawesome-svg-core/styles.css';
import cn from '@/utils/cn';
import Header from '@/components/Header/Header';
import Providers from './providers';
import './globals.css';

export const metadata: Metadata = {
  title: 'Afro Hair and Beauty Shop: Premium Black Hair & Beauty Products',
  description:
    'Discover a wide range of premium black hair and beauty products at Afro Hair and Beauty Shop. Natural, organic, and specially curated for you. Shop now!',
  keywords:
    'Afro Hair, Black Beauty, Natural Hair Care, Organic Beauty Products',
  robots: {
    follow: true,
    index: true,
  },
};

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

const playfairDisplay = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  weight: ['400', '700'],
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={cn(inter.variable, playfairDisplay.variable)}>
        <Providers>
          <Header className="mb-12" />
          <main className="min-h-screen bg-background font-inter antialiased">
            {children}
          </main>
        </Providers>
        <Analytics />
      </body>
    </html>
  );
}
