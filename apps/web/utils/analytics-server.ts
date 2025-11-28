import { PostHog } from 'posthog-node';
import { headers } from 'next/headers';

type EventProperties = Record<
  string,
  string | number | boolean | string[] | undefined
>;

let posthogClient: PostHog | null = null;

/**
 * Get or initialize PostHog server client
 */
const getPostHogClient = () => {
  if (posthogClient) return posthogClient;

  const apiKey = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  const apiHost = process.env.NEXT_PUBLIC_POSTHOG_HOST;

  if (!apiKey) {
    console.warn(
      'PostHog API key not found. Server-side analytics will be disabled.',
    );
    return null;
  }

  posthogClient = new PostHog(apiKey, {
    host: apiHost || 'https://us.i.posthog.com',
    flushAt: 1, // Flush events immediately in serverless environments
    flushInterval: 0,
  });

  return posthogClient;
};

/**
 * Get user ID from headers or session
 * This can be extended to use NextAuth or other auth systems
 */
const getUserId = async (): Promise<string | null> => {
  // For now, we'll use a distinct_id from cookies or headers
  // This can be extended to use NextAuth session
  const headersList = await headers();
  const userId = headersList.get('x-user-id');

  return userId || null;
};

/**
 * Get common properties from request headers
 */
const getCommonProperties = async () => {
  const headersList = await headers();

  return {
    $ip: headersList.get('x-forwarded-for') || headersList.get('x-real-ip'),
    $user_agent: headersList.get('user-agent'),
    $referrer: headersList.get('referer'),
  };
};

/**
 * Track server-side events
 * @param eventName - Name of the event to track
 * @param properties - Event properties
 * @param distinctId - Optional distinct ID (user ID). If not provided, will attempt to get from session
 */
export const trackServer = async (
  eventName: string,
  properties?: EventProperties,
  distinctId?: string,
) => {
  const client = getPostHogClient();
  if (!client) return;

  try {
    const userId = distinctId || (await getUserId());
    const commonProps = await getCommonProperties();

    // If no user ID, use anonymous ID from cookie or generate one
    const id = userId || `anonymous_${Date.now()}_${Math.random()}`;

    client.capture({
      distinctId: id,
      event: eventName,
      properties: {
        ...commonProps,
        ...properties,
      },
    });

    // In serverless environments, we need to flush immediately
    await client.flush();
  } catch (error) {
    console.error('Error tracking server event:', error);
  }
};

/**
 * Identify a user on the server
 * @param userId - Unique identifier for the user
 * @param properties - User properties
 */
export const identifyUserServer = async (
  userId: string,
  properties?: Record<string, string | number | boolean>,
) => {
  const client = getPostHogClient();
  if (!client) return;

  try {
    client.identify({
      distinctId: userId,
      properties,
    });

    await client.flush();
  } catch (error) {
    console.error('Error identifying user on server:', error);
  }
};

/**
 * Track page view on server
 * @param url - URL of the page
 * @param properties - Additional properties
 * @param distinctId - Optional distinct ID
 */
export const trackPageViewServer = async (
  url: string,
  properties?: EventProperties,
  distinctId?: string,
) => {
  await trackServer(
    '$pageview',
    {
      $current_url: url,
      ...properties,
    },
    distinctId,
  );
};

/**
 * Shutdown PostHog client (for cleanup)
 * Useful in API routes or server actions
 */
export const shutdownPostHog = async () => {
  if (posthogClient) {
    await posthogClient.shutdown();
    posthogClient = null;
  }
};

export default {
  track: trackServer,
  identify: identifyUserServer,
  trackPageView: trackPageViewServer,
  shutdown: shutdownPostHog,
};
