import type { Metadata } from 'next';
import { Inter, Playfair_Display } from 'next/font/google';
import { Analytics } from '@vercel/analytics/react';
import '@fortawesome/fontawesome-svg-core/styles.css';
import cn from '@/utils/cn';
import Providers from './providers';
import { ThemeProvider } from '@/components/theme-provider';
import SavedItemsSync from '@/components/SavedItemsSync';
import { SavedProvider } from '@/contexts/SavedContext';
import { getSaved } from './actions';
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

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const savedItems = await getSaved();

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn(inter.variable, playfairDisplay.variable)}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          forcedTheme="light"
          disableTransitionOnChange
        >
          <Providers>
            <SavedProvider initialDbSaves={savedItems}>
              <SavedItemsSync />
              {children}
            </SavedProvider>
          </Providers>
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  );
}
