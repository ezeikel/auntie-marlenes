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
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || 'https://auntiemarlenes.com',
  ),
  title: {
    default: "Auntie Marlene's | Black Beauty Supply Store Online",
    template: "%s | Auntie Marlene's",
  },
  description:
    'Your modern Black beauty supply store. Shop braiding hair, wigs, hair extensions, treatments & styling essentials. Premium products, fast shipping, trusted service. Family-run & Black-owned.',
  robots: {
    follow: true,
    index: true,
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: '/',
    siteName: "Auntie Marlene's",
    title: "Auntie Marlene's | Black Beauty Supply Store Online",
    description:
      'Your modern Black beauty supply store. Shop braiding hair, wigs, hair extensions, treatments & styling essentials. Premium products, fast shipping, trusted service. Family-run & Black-owned.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: "Auntie Marlene's - Black Beauty Supply Store Online",
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: "Auntie Marlene's | Black Beauty Supply Store Online",
    description:
      'Your modern Black beauty supply store. Shop braiding hair, wigs, hair extensions & more. Family-run & Black-owned.',
    images: ['/og-image.png'],
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
  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: "Auntie Marlene's",
    description:
      'Modern Black beauty supply store offering premium braiding hair, wigs, hair extensions, treatments and styling essentials.',
    url: process.env.NEXT_PUBLIC_SITE_URL || 'https://auntiemarlenes.com',
    logo: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://auntiemarlenes.com'}/logo.png`,
    email: 'hello@auntiemarlenes.com',
    foundingDate: '2024',
    slogan: 'Where Beautiful Skin Meets Gorgeous Hair',
    sameAs: [
      // Add social media URLs when available
      // 'https://www.instagram.com/auntiemarlenes',
      // 'https://www.tiktok.com/@auntiemarlenes',
      // 'https://www.facebook.com/auntiemarlenes',
      // 'https://www.youtube.com/@auntiemarlenes',
    ],
  };

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationSchema),
          }}
        />
      </head>
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
