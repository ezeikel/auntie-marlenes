'use client';

/**
 * Facebook Pixel utility functions
 * Provides type-safe methods for tracking Facebook Pixel events
 */

declare global {
  interface Window {
    fbq?: (
      action: 'init' | 'track' | 'trackCustom',
      eventName: string,
      params?: Record<string, unknown>,
    ) => void;
  }
}

/**
 * Check if Facebook Pixel is loaded and available
 */
export const isFacebookPixelLoaded = (): boolean => {
  return typeof window !== 'undefined' && typeof window.fbq === 'function';
};

/**
 * Initialize Facebook Pixel (usually done in layout.tsx)
 * This is a helper function for reference, but initialization
 * should be done via Script component in layout.tsx
 */
export const initFacebookPixel = (pixelId: string): void => {
  if (typeof window === 'undefined' || window.fbq) {
    return;
  }

  // This is handled by the Script component in layout.tsx
  // Included here for reference only
  console.warn(
    'Facebook Pixel initialization should be done via Next.js Script component',
  );
};

/**
 * Track a standard Facebook Pixel event
 */
export const trackFacebookPixelEvent = (
  eventName: string,
  params?: Record<string, unknown>,
): void => {
  if (!isFacebookPixelLoaded()) {
    if (process.env.NODE_ENV === 'development') {
      console.warn(
        '[Facebook Pixel] Pixel not loaded, skipping event:',
        eventName,
      );
    }
    return;
  }

  try {
    window.fbq?.('track', eventName, params);
    if (process.env.NODE_ENV === 'development') {
      console.log('[Facebook Pixel] Tracked:', eventName, params);
    }
  } catch (error) {
    console.error('[Facebook Pixel] Error tracking event:', error);
  }
};

/**
 * Track a custom Facebook Pixel event
 */
export const trackFacebookPixelCustomEvent = (
  eventName: string,
  params?: Record<string, unknown>,
): void => {
  if (!isFacebookPixelLoaded()) {
    if (process.env.NODE_ENV === 'development') {
      console.warn(
        '[Facebook Pixel] Pixel not loaded, skipping custom event:',
        eventName,
      );
    }
    return;
  }

  try {
    window.fbq?.('trackCustom', eventName, params);
    if (process.env.NODE_ENV === 'development') {
      console.log('[Facebook Pixel] Tracked custom:', eventName, params);
    }
  } catch (error) {
    console.error('[Facebook Pixel] Error tracking custom event:', error);
  }
};

/**
 * Standard Facebook Pixel e-commerce events
 */
export const FacebookPixelEvents = {
  // Standard Events
  PageView: 'PageView',
  ViewContent: 'ViewContent',
  Search: 'Search',
  AddToCart: 'AddToCart',
  InitiateCheckout: 'InitiateCheckout',
  AddPaymentInfo: 'AddPaymentInfo',
  Purchase: 'Purchase',
  Lead: 'Lead',
  CompleteRegistration: 'CompleteRegistration',
} as const;

/**
 * Track AddToCart event with product information
 */
export const trackAddToCart = (params: {
  content_name?: string;
  content_ids?: string[];
  content_type?: string;
  value?: number;
  currency?: string;
  num_items?: number;
}): void => {
  trackFacebookPixelEvent(FacebookPixelEvents.AddToCart, params);
};

/**
 * Track InitiateCheckout event
 */
export const trackInitiateCheckout = (params: {
  content_name?: string;
  content_ids?: string[];
  content_type?: string;
  value?: number;
  currency?: string;
  num_items?: number;
}): void => {
  trackFacebookPixelEvent(FacebookPixelEvents.InitiateCheckout, params);
};

/**
 * Track Purchase event
 *
 * IMPORTANT: For Shopify hosted checkout, you should track Purchase events on a thank you page.
 *
 * Setup instructions:
 * 1. In Shopify Admin, go to Settings > Checkout
 * 2. Under "Order processing", set "Additional scripts" or use "Thank you page" redirect URL
 * 3. Create a thank you page at /[locale]/thank-you that reads order data from URL params
 * 4. Call trackPurchase() on that page with order details
 *
 * Example thank you page implementation:
 * ```tsx
 * // app/[locale]/thank-you/page.tsx
 * 'use client';
 * import { useEffect } from 'react';
 * import { useSearchParams } from 'next/navigation';
 * import { trackPurchase } from '@/utils/facebook-pixel';
 *
 * export default function ThankYouPage() {
 *   const searchParams = useSearchParams();
 *
 *   useEffect(() => {
 *     const orderId = searchParams.get('order_id');
 *     const total = searchParams.get('total');
 *     const currency = searchParams.get('currency');
 *
 *     if (orderId && total) {
 *       trackPurchase({
 *         value: parseFloat(total),
 *         currency: currency || 'GBP',
 *         order_id: orderId,
 *         content_type: 'product',
 *       });
 *     }
 *   }, [searchParams]);
 *
 *   return <div>Thank you for your order!</div>;
 * }
 * ```
 */
export const trackPurchase = (params: {
  content_name?: string;
  content_ids?: string[];
  content_type?: string;
  value: number;
  currency: string;
  num_items?: number;
  order_id?: string;
}): void => {
  trackFacebookPixelEvent(FacebookPixelEvents.Purchase, params);
};

/**
 * Track ViewContent event (product view)
 */
export const trackViewContent = (params: {
  content_name?: string;
  content_ids?: string[];
  content_type?: string;
  value?: number;
  currency?: string;
}): void => {
  trackFacebookPixelEvent(FacebookPixelEvents.ViewContent, params);
};

/**
 * Track Search event
 */
export const trackSearch = (params: {
  search_string?: string;
  content_ids?: string[];
  content_type?: string;
}): void => {
  trackFacebookPixelEvent(FacebookPixelEvents.Search, params);
};
