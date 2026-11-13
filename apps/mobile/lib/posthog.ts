import PostHog from 'posthog-react-native';

/**
 * The app's one PostHog client, built at module load rather than inside
 * PostHogProvider so error autocapture is installed before the first render
 * (fleet rule, 13 Nov 2026: errors go to PostHog as well as Sentry, whose
 * quota runs out). Uncaught exceptions, unhandled rejections and native
 * crashes (through @posthog/react-native-plugin) are autocaptured, the plain
 * pattern from Executive Disorder: Sentry here runs no scrubber and the app
 * holds nothing more sensitive than a basket.
 *
 * Without EXPO_PUBLIC_POSTHOG_API_KEY the client is built with an empty key,
 * as the provider did before, and sends nothing.
 *
 * The app sends no custom events today, only autocaptured screens, touches
 * and lifecycle. When one is added, mirror it to EAS Observe with
 * `logObserveEvent` (lib/observe.ts).
 */
export const posthog = new PostHog(
  process.env.EXPO_PUBLIC_POSTHOG_API_KEY || '',
  {
    host: 'https://eu.i.posthog.com',
    enableSessionReplay: true,
    // posthog-react-native v4 moved lifecycle capture from the autocapture
    // options onto the client options.
    captureAppLifecycleEvents: true,
    errorTracking: {
      autocapture: {
        uncaughtExceptions: true,
        unhandledRejections: true,
        nativeCrashes: true,
      },
    },
  },
);
