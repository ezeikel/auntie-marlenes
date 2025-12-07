import type { Metadata } from 'next';
import { Inter, Playfair_Display } from 'next/font/google';
import { Analytics } from '@vercel/analytics/react';
import '@fortawesome/fontawesome-svg-core/styles.css';
import cn from '@/utils/cn';
import './globals.css';
import Script from 'next/script';

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

const RootLayout = ({ children }: { children: React.ReactNode }) => {
  const pixelId = process.env.NEXT_PUBLIC_META_PIXEL_ID;

  return (
    <html suppressHydrationWarning>
      <body className={cn(inter.variable, playfairDisplay.variable)}>
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
                  fbq('init', '${pixelId}');
                  fbq('track', 'PageView');
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
        {children}
        <Analytics />
      </body>
    </html>
  );
};

export default RootLayout;
