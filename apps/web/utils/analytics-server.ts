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
 * @param userId - Optional user ID to use for tracking (pass from outside cache scopes)
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
 *
 * // When called from cached components, pass userId
 * await track(TRACKING_EVENTS.PRODUCT_SEARCH, properties, userId);
 * ```
 */
export const track = async <TEvent extends TrackingEvent>(
  event: TEvent,
  properties: EventProperties[TEvent],
  userId?: string | null,
) => {
  try {
    // Skip tracking during pre-rendering/static generation
    // During static generation, dynamic APIs like headers() aren't available
    if (process.env.NEXT_PHASE === 'phase-production-build') {
      return;
    }

    // Use provided userId if available (from outside cache scopes)
    // Otherwise, try to get it dynamically (will fail in cached contexts)
    let finalUserId: string | null = userId ?? null;
    let user: any = null;

    // Only attempt to get userId dynamically if not provided
    if (finalUserId === null) {
      try {
        finalUserId = await getUserId('track analytics event');
        user = finalUserId ? await getCurrentUser() : null;
      } catch (error) {
        // If we're in a cache scope, headers() will throw
        // Silently skip user identification and continue without it
        if (error instanceof Error && error.message.includes('use cache')) {
          // Continue tracking without user context
        } else {
          // Re-throw other errors
          throw error;
        }
      }
    } else if (finalUserId) {
      // If userId was provided, try to get user details
      try {
        user = await getCurrentUser();
      } catch {
        // User lookup failed, continue without user details
      }
    }

    const userProperties = user
      ? {
          email: user.email,
          name: user.name,
        }
      : undefined;

    const enrichedProperties = {
      ...properties,
      userId: finalUserId || undefined,
      environment: 'server',
    };

    if (posthogServer) {
      if (userProperties && finalUserId) {
        posthogServer.identify({
          distinctId: finalUserId,
          properties: userProperties,
        });
      }
      posthogServer.capture({
        distinctId: finalUserId || 'anonymous',
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
