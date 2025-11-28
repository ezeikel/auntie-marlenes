'use client';

import { SessionProvider } from 'next-auth/react';
import { ThemeProvider } from 'next-themes';
import { NextIntlClientProvider } from 'next-intl';
import type { AbstractIntlMessages } from 'next-intl';
import { UIContextProvider } from '@/contexts/ui';
import { SavedProvider } from '@/contexts/saved';
import { LocationProvider } from '@/contexts/LocationContext';
import { PostHogProvider } from '@/components/PostHogProvider';
import { UserIdentifier } from '@/components/UserIdentifier';

type ProvidersProps = {
  children: React.ReactNode;
  messages?: AbstractIntlMessages;
  locale: string;
};

const Providers = ({ children, messages, locale }: ProvidersProps) => {
  return (
    <NextIntlClientProvider messages={messages} locale={locale}>
      <ThemeProvider
        attribute="class"
        defaultTheme="light"
        forcedTheme="light"
        disableTransitionOnChange
      >
        <SessionProvider>
          <PostHogProvider>
            <UserIdentifier />
            <LocationProvider>
              <UIContextProvider>
                <SavedProvider>{children}</SavedProvider>
              </UIContextProvider>
            </LocationProvider>
          </PostHogProvider>
        </SessionProvider>
      </ThemeProvider>
    </NextIntlClientProvider>
  );
};

export default Providers;
