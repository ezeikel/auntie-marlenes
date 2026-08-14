// This file configures the initialization of Sentry on the server.
// The config you add here will be used whenever the server handles a request.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN,
  sendDefaultPii: true,
  // Without this, @sentry/nextjs derives a `vercel-` prefixed value, so prod
  // errors land under `vercel-production` and an `environment:production`
  // filter never matches them.
  environment: process.env.VERCEL_ENV || process.env.NODE_ENV || 'development',
  // Local dev servers should not burn quota or pollute triage.
  enabled: process.env.NODE_ENV === 'production',
  // Next.js throws these two as control flow, not as bugs.
  ignoreErrors: ['NEXT_NOT_FOUND', 'NEXT_REDIRECT'],
});
