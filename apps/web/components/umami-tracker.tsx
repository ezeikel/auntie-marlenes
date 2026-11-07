'use client';

import { usePathname } from 'next/navigation';
import Script from 'next/script';
import { useEffect, useState } from 'react';
import { umamiPageview } from '@/lib/umami';

type UmamiWindow = {
  umami?: {
    track?: (
      payload: (defaults: Record<string, unknown>) => Record<string, unknown>,
    ) => void;
  };
};

/**
 * Loads the tracker with auto-track off and sends a page view ourselves, for public routes
 * only (see lib/umami.ts for why). Client-side navigations are counted by the pathname effect.
 */
export function UmamiTracker({
  scriptUrl,
  websiteId,
}: {
  scriptUrl: string;
  websiteId: string;
}) {
  const pathname = usePathname();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!ready) return;
    const pageview = umamiPageview(
      pathname,
      document.referrer,
      window.location.origin,
      window.location.search,
    );
    if (!pageview) return;
    try {
      (window as unknown as UmamiWindow).umami?.track?.((defaults) => ({
        ...defaults,
        ...pageview,
      }));
    } catch {
      // Analytics must never interrupt a shopper.
    }
  }, [pathname, ready]);

  return (
    <Script
      src={scriptUrl}
      strategy="afterInteractive"
      data-website-id={websiteId}
      data-domains="auntiemarlenes.com,www.auntiemarlenes.com"
      data-auto-track="false"
      data-do-not-track="true"
      data-exclude-search="true"
      onLoad={() => setReady(true)}
      onReady={() => setReady(true)}
    />
  );
}
