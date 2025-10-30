import type { Metadata } from 'next';
import { Inter, Playfair_Display } from 'next/font/google';
import { Analytics } from '@vercel/analytics/react';
import '@fortawesome/fontawesome-svg-core/styles.css';
import cn from '@/utils/cn';
import Providers from './providers';
import SavedItemsSync from '@/components/SavedItemsSync';
import AnnouncementBanner from '@/components/AnnouncementBanner';
import Header from '@/components/HeaderWrapper';
import Footer from '@/components/Footer';
import './globals.css';
import { Suspense } from 'react';

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

const RootLayout = async ({ children }: { children: React.ReactNode }) => {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn(inter.variable, playfairDisplay.variable)}>
        <Providers>
          <SavedItemsSync />
          <AnnouncementBanner />
          <Suspense fallback={<div className="h-20" />}>
            <Header />
          </Suspense>
          <main>{children}</main>
          <Suspense fallback={<div className="h-64 bg-deep-earth" />}>
            <Footer />
          </Suspense>
        </Providers>
        <Analytics />
      </body>
    </html>
  );
};

export default RootLayout;
