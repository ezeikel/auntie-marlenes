'use client';

import { useCallback } from 'react';
import { track as vercelTrackClient } from '@vercel/analytics';
import { useSession } from 'next-auth/react';
import posthog from 'posthog-js';
import type { EventProperties, TrackingEvent } from '@/types';
import { cleanVercelProperties } from '@/utils/analytics';
import {
  trackAddToCart,
  trackInitiateCheckout,
  trackViewContent,
  trackSearch,
  trackFacebookPixelCustomEvent,
} from '@/utils/facebook-pixel';
import { TRACKING_EVENTS } from '@/constants/events';

type SessionUser = {
  dbId?: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
  id?: string;
};

/**
 * Map custom tracking events to Facebook Pixel standard events
 */
const trackFacebookPixelEvent = <TEvent extends TrackingEvent>(
  event: TEvent,
  properties: EventProperties[TEvent],
): void => {
  try {
    switch (event) {
      case TRACKING_EVENTS.PRODUCT_ADDED_TO_CART:
      case TRACKING_EVENTS.PRODUCT_ADDED_TO_BAG: {
        const props =
          properties as EventProperties[typeof TRACKING_EVENTS.PRODUCT_ADDED_TO_CART];
        trackAddToCart({
          content_ids: [
            props.product_variant_id || (properties as any).variant_id,
          ],
          content_type: 'product',
          value: (properties as any).product_price,
          currency: 'GBP', // Default, should be dynamic based on cart
        });
        break;
      }

      case TRACKING_EVENTS.CHECKOUT_STARTED: {
        const props =
          properties as EventProperties[typeof TRACKING_EVENTS.CHECKOUT_STARTED];
        trackInitiateCheckout({
          value: props.cart_value,
          currency: props.currency || 'GBP',
          num_items: props.item_count,
        });
        break;
      }

      case TRACKING_EVENTS.PRODUCT_VIEWED: {
        const props =
          properties as EventProperties[typeof TRACKING_EVENTS.PRODUCT_VIEWED];
        trackViewContent({
          content_ids: [props.product_id],
          content_name: props.product_name,
          content_type: 'product',
          value: props.product_price,
          currency: 'GBP', // Default, should be dynamic
        });
        break;
      }

      case TRACKING_EVENTS.SEARCH_SUBMITTED:
      case TRACKING_EVENTS.PRODUCT_SEARCH: {
        const props =
          properties as EventProperties[typeof TRACKING_EVENTS.SEARCH_SUBMITTED];
        trackSearch({
          search_string: (props as any).search_query || (props as any).query,
          content_type: 'product',
        });
        break;
      }

      case TRACKING_EVENTS.CART_VIEWED: {
        const props =
          properties as EventProperties[typeof TRACKING_EVENTS.CART_VIEWED];
        trackFacebookPixelCustomEvent('ViewCart', {
          content_ids: [props.cart_id],
          value: props.cart_value,
          currency: props.currency,
          num_items: props.item_count,
        });
        break;
      }

      // Track other events as custom events
      default:
        trackFacebookPixelCustomEvent(
          event,
          properties as Record<string, unknown>,
        );
        break;
    }
  } catch (error) {
    console.error('[Analytics Client] Facebook Pixel tracking error:', error);
  }
};

export const useAnalytics = () => {
  const { data: session } = useSession();

  const track = useCallback(
    <TEvent extends TrackingEvent>(
      event: TEvent,
      properties: EventProperties[TEvent],
    ) => {
      try {
        const sessionUser = session?.user as SessionUser;
        const userId = sessionUser?.dbId;
        const userProperties = sessionUser
          ? {
              email: sessionUser.email,
              name: sessionUser.name,
            }
          : undefined;

        const enrichedProperties = {
          ...properties,
          userId,
          url: typeof window !== 'undefined' ? window.location.href : undefined,
          environment: 'client',
        };

        if (typeof window !== 'undefined' && posthog && posthog.capture) {
          if (userProperties && userId) {
            posthog.identify(userId, userProperties);
          }
          posthog.capture(event, enrichedProperties);
        }

        vercelTrackClient(event, cleanVercelProperties(enrichedProperties));

        // Track Facebook Pixel events
        trackFacebookPixelEvent(event, properties);

        if (process.env.NODE_ENV === 'development') {
          console.log('[Analytics Client]', event, enrichedProperties);
        }
      } catch (error) {
        console.error('Client-side analytics tracking error:', error);
      }
    },
    [session],
  );

  return { track };
};
