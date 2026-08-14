import * as Sentry from '@sentry/nextjs';

const SENTRY_DSN = process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN;

Sentry.init({
  dsn: SENTRY_DSN,
  sendDefaultPii: true,
  // Must be the NEXT_PUBLIC_ variable: Next.js only inlines NEXT_PUBLIC_* into
  // the browser bundle, so a bare VERCEL_ENV would be undefined here and
  // @sentry/nextjs would fall back to a `vercel-` prefixed environment.
  environment:
    process.env.NEXT_PUBLIC_VERCEL_ENV || process.env.NODE_ENV || 'development',
  // Local dev browsers should not burn quota or pollute triage.
  enabled: process.env.NODE_ENV === 'production',
  integrations: [Sentry.replayIntegration()],
  tracesSampleRate: 1,
  enableLogs: true,
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
});

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
