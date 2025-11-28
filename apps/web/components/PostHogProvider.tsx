'use client';

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { trackPageView } from '@/utils/analytics-client';

type PostHogProviderProps = {
  children: React.ReactNode;
};

/**
 * PostHog Provider Component
 *
 * Tracks page views automatically on route changes.
 * PostHog is initialized in instrumentation-client.ts.
 * Should be included high in the component tree, typically in the root layout.
 */
export const PostHogProvider = ({ children }: PostHogProviderProps) => {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Track page views on route changes
  useEffect(() => {
    if (pathname) {
      const url = window.location.href;

      // Capture UTM parameters for marketing attribution
      const utmSource = searchParams?.get('utm_source');
      const utmMedium = searchParams?.get('utm_medium');
      const utmCampaign = searchParams?.get('utm_campaign');
      const utmContent = searchParams?.get('utm_content');
      const utmTerm = searchParams?.get('utm_term');

      trackPageView(url, {
        pathname,
        search: searchParams?.toString(),
        // Include UTM params if present
        ...(utmSource && { utm_source: utmSource }),
        ...(utmMedium && { utm_medium: utmMedium }),
        ...(utmCampaign && { utm_campaign: utmCampaign }),
        ...(utmContent && { utm_content: utmContent }),
        ...(utmTerm && { utm_term: utmTerm }),
      });
    }
  }, [pathname, searchParams]);

  return <>{children}</>;
};

export default PostHogProvider;
