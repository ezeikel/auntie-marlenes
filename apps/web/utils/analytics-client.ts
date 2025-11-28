'use client';

import posthog from 'posthog-js';
import { track as vercelTrack } from '@vercel/analytics';

type EventProperties = Record<string, string | number | boolean | undefined>;

let posthogInitialized = false;

/**
 * Initialize PostHog client-side tracking
 * Should be called once in a client component (e.g., PostHogProvider)
 */
export const initPostHog = () => {
  if (typeof window === 'undefined' || posthogInitialized) return;

  const apiKey = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  const apiHost = process.env.NEXT_PUBLIC_POSTHOG_HOST;

  if (!apiKey) {
    console.warn('PostHog API key not found. Analytics will be disabled.');
    return;
  }

  posthog.init(apiKey, {
    api_host: apiHost || 'https://us.i.posthog.com',
    person_profiles: 'identified_only',
    capture_pageview: false, // We'll manually capture pageviews
    capture_pageleave: true,
    autocapture: false, // Disable autocapture to have more control
    loaded: (ph) => {
      if (process.env.NODE_ENV === 'development') {
        ph.debug();
      }
    },
  });

  posthogInitialized = true;
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
  if (!posthogInitialized) return;

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
  if (posthogInitialized) {
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
  if (posthogInitialized) {
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
  if (!posthogInitialized) return;

  posthog.reset();
};

/**
 * Track custom events with both PostHog and Vercel Analytics
 * @param eventName - Name of the event to track
 * @param properties - Event properties
 */
export const track = (eventName: string, properties?: EventProperties) => {
  // Track with PostHog
  if (posthogInitialized) {
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
  if (!posthogInitialized) return;

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
  if (!posthogInitialized) return;

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
  return posthogInitialized ? posthog : null;
};

export default {
  init: initPostHog,
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
