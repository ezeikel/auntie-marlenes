'use client';

import posthog from 'posthog-js';
import { track as vercelTrack } from '@vercel/analytics';

type EventProperties = Record<string, string | number | boolean | undefined>;

/**
 * Check if PostHog is initialized
 * PostHog is initialized in instrumentation-client.ts
 */
const isPostHogInitialized = () => {
  return typeof window !== 'undefined' && posthog.__loaded;
};

/**
 * Identify a user for tracking in PostHog only
 * For combined identification (PostHog + Sentry), use identifyUserComplete
 * @param userId - Unique identifier for the user
 * @param properties - Additional user properties
 */
export const identifyUser = (
  userId: string,
  properties?: Record<string, string | number | boolean>,
) => {
  if (!isPostHogInitialized()) return;

  posthog.identify(userId, properties);
};

/**
 * Identify a user across all analytics platforms (PostHog + Sentry)
 * This is the recommended function to call on login
 * @param user - User object with id, email, and optional name
 * @param additionalProperties - Additional user properties for PostHog
 */
export const identifyUserComplete = async (
  user: {
    id: string;
    email?: string | null;
    name?: string | null;
  },
  additionalProperties?: Record<string, string | number | boolean>,
) => {
  // Identify in PostHog
  if (isPostHogInitialized()) {
    posthog.identify(user.id, {
      email: user.email || undefined,
      name: user.name || undefined,
      ...additionalProperties,
    });
  }

  // Identify in Sentry
  try {
    const { setUser } = await import('@/lib/logger');
    setUser({
      id: user.id,
      email: user.email || undefined,
      name: user.name || undefined,
      ...additionalProperties,
    });
  } catch (error) {
    console.warn('Failed to identify user in Sentry:', error);
  }
};

/**
 * Reset user identification across all platforms (e.g., on logout)
 * This is the recommended function to call on logout
 */
export const resetUserComplete = async () => {
  // Reset PostHog
  if (isPostHogInitialized()) {
    posthog.reset();
  }

  // Reset Sentry
  try {
    const { clearUser } = await import('@/lib/logger');
    clearUser();
  } catch (error) {
    console.warn('Failed to clear user in Sentry:', error);
  }
};

/**
 * Reset user identification (e.g., on logout)
 * For complete reset (PostHog + Sentry), use resetUserComplete
 */
export const resetUser = () => {
  if (!isPostHogInitialized()) return;

  posthog.reset();
};

/**
 * Track custom events with both PostHog and Vercel Analytics
 * @param eventName - Name of the event to track
 * @param properties - Event properties
 */
export const track = (eventName: string, properties?: EventProperties) => {
  // Track with PostHog
  if (isPostHogInitialized()) {
    posthog.capture(eventName, properties);
  }

  // Track with Vercel Analytics - filter out undefined values
  if (properties) {
    const filteredProperties = Object.entries(properties).reduce(
      (acc, [key, value]) => {
        if (value !== undefined) {
          acc[key] = value;
        }
        return acc;
      },
      {} as Record<string, string | number | boolean>,
    );
    vercelTrack(eventName, filteredProperties);
  } else {
    vercelTrack(eventName);
  }
};

/**
 * Track page views
 * @param url - URL of the page being viewed
 * @param properties - Additional page properties
 */
export const trackPageView = (url?: string, properties?: EventProperties) => {
  if (!isPostHogInitialized()) return;

  posthog.capture('$pageview', {
    $current_url: url || window.location.href,
    ...properties,
  });
};

/**
 * Set user properties
 * @param properties - User properties to set
 */
export const setUserProperties = (
  properties: Record<string, string | number | boolean>,
) => {
  if (!isPostHogInitialized()) return;

  posthog.setPersonProperties(properties);
};

/**
 * Track feature flag viewed
 * @param flagKey - Feature flag key
 */
export const trackFeatureFlag = (flagKey: string, value: boolean | string) => {
  track('Feature Flag Viewed', {
    flag_key: flagKey,
    flag_value: value,
  });
};

/**
 * Get PostHog instance for advanced usage
 * @returns PostHog instance or null if not initialized
 */
export const getPostHog = () => {
  return isPostHogInitialized() ? posthog : null;
};

export default {
  identify: identifyUser,
  identifyComplete: identifyUserComplete,
  reset: resetUser,
  resetComplete: resetUserComplete,
  track,
  trackPageView,
  setUserProperties,
  trackFeatureFlag,
  getPostHog,
};
