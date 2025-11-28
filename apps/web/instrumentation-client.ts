import posthog from 'posthog-js';
import * as Sentry from '@sentry/nextjs';

const SENTRY_DSN = process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN;

Sentry.init({
  dsn: SENTRY_DSN,
  sendDefaultPii: true,
  integrations: [Sentry.replayIntegration()],
  tracesSampleRate: 1,
  enableLogs: true,
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
});

posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
  api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
  ui_host: 'https://eu.posthog.com', // EU region for toolbar links
  person_profiles: 'identified_only', // Only create profiles for identified users
  capture_pageview: false, // Disable - we manually track in PostHogProvider with UTM params
  capture_pageleave: true, // Track when users leave pages (for time-on-page metrics)
  autocapture: {
    // Selective autocapture for Next.js App Router
    dom_event_allowlist: ['click', 'submit', 'change'], // Track clicks, form submits, input changes
    url_allowlist: [], // Track all URLs (default)
    element_allowlist: ['button', 'a', 'form', 'input', 'select', 'textarea'], // Track interactive elements
    css_selector_allowlist: [], // No specific CSS selectors
    capture_copied_text: true, // Track text copying (useful for content engagement)
  },
  // Performance and data quality
  session_recording: {
    maskAllInputs: true, // Privacy: mask all input values in session recordings
    maskTextSelector: '[data-private]', // Mask elements with data-private attribute
  },
  // Development mode
  loaded: (ph) => {
    if (process.env.NODE_ENV === 'development') {
      ph.debug(); // Enable debug logging in development
    }
  },
});

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
