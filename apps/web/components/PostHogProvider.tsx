'use client';

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { initPostHog, trackPageView } from '@/utils/analytics-client';

type PostHogProviderProps = {
  children: React.ReactNode;
};

/**
 * PostHog Provider Component
 *
 * Initializes PostHog and tracks page views automatically.
 * Should be included high in the component tree, typically in the root layout.
 */
export const PostHogProvider = ({ children }: PostHogProviderProps) => {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Initialize PostHog on mount
  useEffect(() => {
    initPostHog();
  }, []);

  // Track page views on route changes
  useEffect(() => {
    if (pathname) {
      const url = window.location.href;
      trackPageView(url, {
        pathname,
        search: searchParams?.toString(),
      });
    }
  }, [pathname, searchParams]);

  return <>{children}</>;
};

export default PostHogProvider;
