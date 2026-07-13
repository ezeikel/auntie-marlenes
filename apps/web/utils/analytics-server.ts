import 'server-only';

import { track as vercelTrackServer } from '@vercel/analytics/server';
import { createPostHogClient } from '@/lib/posthog-server';
import type { EventProperties, TrackingEvent } from '@/types';
import { cleanVercelProperties } from '@/utils/analytics';
import { getCurrentUser, getUserId } from '@/utils/user';

type TrackOptions = {
  /** Explicit distinct ID (e.g. customer email from a webhook). Skips session lookup. */
  distinctId?: string;
};

/**
 *
 * @param event - The name of the event to track (use TRACKING_EVENTS constants)
 * @param properties - The properties associated with the event (type-safe)
 * @param userIdOrOptions - Optional user ID string (legacy) or options object
 *
 * @example
 * ```typescript
 * // In server actions (auto-resolves user from session)
 * await track(TRACKING_EVENTS.CART_CREATED, {
 *   cart_id: cart.id,
 *   product_variant_id: variantId,
 *   country_code: 'GB',
 *   source: 'web'
 * });
 *
 * // When called from cached components, pass userId
 * await track(TRACKING_EVENTS.PRODUCT_SEARCH, properties, userId);
 *
 * // From webhooks (no session available)
 * await track(TRACKING_EVENTS.ORDER_PAID, properties, { distinctId: order.email });
 * ```
 */
export const track = async <TEvent extends TrackingEvent>(
  event: TEvent,
  properties: EventProperties[TEvent],
  userIdOrOptions?: string | null | TrackOptions,
) => {
  try {
    // Skip tracking during pre-rendering/static generation
    if (process.env.NEXT_PHASE === 'phase-production-build') {
      return;
    }

    // Parse the third argument — either a legacy userId string or options object
    const options: TrackOptions | undefined =
      typeof userIdOrOptions === 'object' && userIdOrOptions !== null
        ? userIdOrOptions
        : undefined;
    const legacyUserId =
      typeof userIdOrOptions === 'string' ? userIdOrOptions : null;

    let finalUserId: string | null = options?.distinctId ?? legacyUserId;
    let userProperties:
      | { email: string | null; name: string | null }
      | undefined;

    // Only attempt session lookup if no explicit distinctId was provided
    if (!options?.distinctId && finalUserId === null) {
      try {
        finalUserId = await getUserId('track analytics event');
        const user = finalUserId ? await getCurrentUser() : null;
        userProperties = user
          ? { email: user.email, name: user.name }
          : undefined;
      } catch (error) {
        // If we're in a cache scope, headers() will throw
        if (error instanceof Error && error.message.includes('use cache')) {
          // Continue tracking without user context
        } else {
          throw error;
        }
      }
    } else if (finalUserId && !options?.distinctId) {
      // Legacy userId was provided, try to get user details
      try {
        const user = await getCurrentUser();
        userProperties = user
          ? { email: user.email, name: user.name }
          : undefined;
      } catch {
        // User lookup failed, continue without user details
      }
    }

    const enrichedProperties = {
      ...properties,
      userId: finalUserId || undefined,
      environment: 'server',
    };

    // Create a fresh PostHog client per request (serverless best practice).
    // Call shutdown() to flush events before the function freezes.
    const posthog = createPostHogClient();
    if (posthog) {
      if (userProperties && finalUserId) {
        posthog.identify({
          distinctId: finalUserId,
          properties: userProperties,
        });
      }
      posthog.capture({
        distinctId: finalUserId || 'anonymous',
        event,
        properties: enrichedProperties,
      });
      await posthog.shutdown();
    }

    await vercelTrackServer(event, cleanVercelProperties(enrichedProperties));

    if (process.env.NODE_ENV === 'development') {
      console.log('[Analytics Server]', event, enrichedProperties);
    }
  } catch (error) {
    console.error('Server-side analytics tracking error:', error);
  }
};
