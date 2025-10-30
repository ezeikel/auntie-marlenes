'use client';

import { SessionProvider } from 'next-auth/react';
import { ThemeProvider } from 'next-themes';
import { UIContextProvider } from '@/contexts/ui';
import { SavedProvider } from '@/contexts/SavedContext';

const Providers = ({ children }: { children: React.ReactNode }) => {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="light"
      forcedTheme="light"
      disableTransitionOnChange
    >
      <SessionProvider>
        <UIContextProvider>
          <SavedProvider>{children}</SavedProvider>
        </UIContextProvider>
      </SessionProvider>
    </ThemeProvider>
  );
};

export default Providers;
