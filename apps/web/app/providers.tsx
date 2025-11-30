'use client';

import { SessionProvider } from 'next-auth/react';
import { ThemeProvider } from 'next-themes';
import { NextIntlClientProvider } from 'next-intl';
import type { AbstractIntlMessages } from 'next-intl';
import { UIContextProvider } from '@/contexts/ui';
import { SavedProvider } from '@/contexts/saved';
import { LocationProvider } from '@/contexts/LocationContext';
import { PostHogProvider } from '@/components/PostHogProvider';

type ProvidersProps = {
  children: React.ReactNode;
  messages?: AbstractIntlMessages;
  locale: string;
};

const Providers = ({ children, messages, locale }: ProvidersProps) => {
  return (
    <PostHogProvider>
      <NextIntlClientProvider messages={messages} locale={locale}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          forcedTheme="light"
          disableTransitionOnChange
        >
          <SessionProvider>
            <LocationProvider>
              <UIContextProvider>
                <SavedProvider>{children}</SavedProvider>
              </UIContextProvider>
            </LocationProvider>
          </SessionProvider>
        </ThemeProvider>
      </NextIntlClientProvider>
    </PostHogProvider>
  );
};

export default Providers;
