import { Observe, ObserveRoot } from 'expo-observe';

/**
 * EAS Observe: launch, time-to-interactive and per-route timings (pattern
 * from Executive Disorder's lib/observe.ts). PostHog owns the funnel and,
 * with Sentry, errors; Observe owns the numbers neither can see.
 *
 * Titrra's and Prayer Pew's scrubbed global error handler is not copied: it
 * exists because their error messages can carry a user's prayer or
 * medication. A shop's carry product handles.
 *
 * Debug builds never dispatch (`dispatchInDebug` stays false), so verify from
 * a preview or production build.
 */

export { ObserveRoot };

/**
 * Route params kept out of navigation metrics. `token` is the magic-link
 * credential a sign-in deep link carries; the not-found pair hold whatever
 * path an unmatched deep link carried.
 */
export const OBSERVE_FILTERED_PARAMS = ['token', 'not-found', '+not-found'];

/**
 * Configure Observe. Call at module scope before the first render:
 * `configure()` throws after mount.
 */
export const initObserve = () => {
  try {
    Observe.configure({
      environment: process.env.EXPO_PUBLIC_ENVIRONMENT || 'development',
      integrations: {
        'expo-router': { filteredParams: OBSERVE_FILTERED_PARAMS },
      },
    });
  } catch {
    // A timing metric is never worth a failed launch.
  }
};

/**
 * App-level time to interactive. The module call, not `useObserve()`, which
 * records nothing from the root layout (see Prayer Pew's lib/observe.ts).
 * Only the first call in a session counts.
 */
export const markAppInteractive = () => {
  try {
    Observe.markInteractive();
  } catch {
    // As above.
  }
};

/** Mirror one product event. Never throws. */
export const logObserveEvent = (
  event: string,
  attributes?: Record<string, string | number | boolean>,
) => {
  try {
    Observe.logEvent(event, attributes ? { attributes } : undefined);
  } catch {
    // As above.
  }
};
