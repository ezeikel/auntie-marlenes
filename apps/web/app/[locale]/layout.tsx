import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { setRequestLocale, getMessages } from 'next-intl/server';
import { Suspense } from 'react';
import { Inter, Playfair_Display } from 'next/font/google';
import { Analytics } from '@vercel/analytics/react';
import Script from 'next/script';
import '@fortawesome/fontawesome-svg-core/styles.css';
import cn from '@/utils/cn';
import '../globals.css';
import Providers from '../providers';
import SavedItemsSync from '@/components/SavedItemsSync';
import AnnouncementBanner from '@/components/AnnouncementBanner';
import Header from '@/components/HeaderWrapper';
import Footer from '@/components/Footer';
import { locales, type Locale } from '@/i18n/config';

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
        url: '/opengraph-image',
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
    images: ['/opengraph-image'],
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

type LocaleLayoutProps = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export const generateStaticParams = () => {
  return locales.map((locale) => ({ locale }));
};

const isValidLocale = (locale: string): locale is Locale => {
  return locales.includes(locale as Locale);
};

const LocaleLayout = async ({ children, params }: LocaleLayoutProps) => {
  const { locale } = await params;

  // Validate that the incoming `locale` parameter is valid
  if (!isValidLocale(locale)) {
    notFound();
  }

  // Enable static rendering
  setRequestLocale(locale);

  // Fetch messages for the current locale
  const messages = await getMessages();

  const pixelId = process.env.NEXT_PUBLIC_META_PIXEL_ID;

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
    sameAs: [],
  };

  return (
    <html lang={locale} suppressHydrationWarning>
      <body className={cn(inter.variable, playfairDisplay.variable)}>
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:z-[100] focus:p-4 focus:bg-white focus:text-cocoa focus:underline"
        >
          Skip to main content
        </a>
        {pixelId && (
          <>
            <Script
              id="facebook-pixel"
              strategy="afterInteractive"
              dangerouslySetInnerHTML={{
                __html: `
                  !function(f,b,e,v,n,t,s)
                  {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
                  n.callMethod.apply(n,arguments):n.queue.push(arguments)};
                  if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
                  n.queue=[];t=b.createElement(e);t.async=!0;
                  t.src=v;s=b.getElementsByTagName(e)[0];
                  s.parentNode.insertBefore(t,s)}(window, document,'script',
                  'https://connect.facebook.net/en_US/fbevents.js');

                  // Check if pixel is already initialized
                  if (!window.fbq.initialized) {
                    window.fbq.initialized = true;
                    fbq('init', '${pixelId}');
                    ${process.env.NODE_ENV === 'development' ? "fbq('set', 'debug', true);" : ''}
                    fbq('track', 'PageView');
                  }
                `,
              }}
            />
            <noscript>
              <img
                height="1"
                width="1"
                style={{ display: 'none' }}
                src={`https://www.facebook.com/tr?id=${pixelId}&ev=PageView&noscript=1`}
                alt=""
              />
            </noscript>
          </>
        )}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationSchema),
          }}
        />
        <Suspense fallback={null}>
          <Providers
            messages={messages}
            locale={locale}
            timeZone="Europe/London"
          >
            <SavedItemsSync />
            <Suspense fallback={<div className="h-8 bg-deep-earth" />}>
              <AnnouncementBanner />
            </Suspense>
            <Suspense fallback={<div className="h-20" />}>
              <Header />
            </Suspense>
            <main id="main-content" lang={locale}>
              {children}
            </main>
            <Suspense fallback={<div className="h-64 bg-deep-earth" />}>
              <Footer />
            </Suspense>
          </Providers>
        </Suspense>
        <Analytics />
      </body>
    </html>
  );
};

export default LocaleLayout;
