import 'server-only';

import { track as vercelTrackServer } from '@vercel/analytics/server';
import type { EventProperties, TrackingEvent } from '@/types';
import { posthogServer } from '@/lib/posthog-server';
import { cleanVercelProperties } from '@/utils/analytics';
import { getUserId, getCurrentUser } from '@/utils/user';

/**
 *
 * @param event - The name of the event to track (use TRACKING_EVENTS constants)
 * @param properties - The properties associated with the event (type-safe)
 *
 * @example
 * ```typescript
 * // In server actions
 * await track(TRACKING_EVENTS.CART_CREATED, {
 *   cart_id: cart.id,
 *   product_variant_id: variantId,
 *   country_code: 'GB',
 *   source: 'web'
 * });
 * ```
 */
export const track = async <TEvent extends TrackingEvent>(
  event: TEvent,
  properties: EventProperties[TEvent],
) => {
  try {
    // Skip tracking during pre-rendering/static generation
    // During static generation, dynamic APIs like headers() aren't available
    if (process.env.NEXT_PHASE === 'phase-production-build') {
      return;
    }

    // Automatically get user info from server session
    const userId = await getUserId('track analytics event');
    const user = userId ? await getCurrentUser() : null;

    const userProperties = user
      ? {
          email: user.email,
          name: user.name,
        }
      : undefined;

    const enrichedProperties = {
      ...properties,
      userId: userId || undefined,
      environment: 'server',
    };

    if (posthogServer) {
      if (userProperties && userId) {
        posthogServer.identify({
          distinctId: userId,
          properties: userProperties,
        });
      }
      posthogServer.capture({
        distinctId: userId || 'anonymous',
        event,
        properties: enrichedProperties,
      });
      await posthogServer.shutdown();
    }

    await vercelTrackServer(event, cleanVercelProperties(enrichedProperties));

    if (process.env.NODE_ENV === 'development') {
      console.log('[Analytics Server]', event, enrichedProperties);
    }
  } catch (error) {
    console.error('Server-side analytics tracking error:', error);
  }
};
