// This file configures the initialization of Sentry on the server.
// The config you add here will be used whenever the server handles a request.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from '@sentry/nextjs';

const SENTRY_DSN = process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN;

Sentry.init({
  dsn: SENTRY_DSN,
  sendDefaultPii: true,

  // Disable Sentry during build and development to avoid crypto.randomUUID() errors
  // Sentry uses crypto internally which conflicts with Next.js 16's static prerendering
  enabled: process.env.NODE_ENV === 'production',
});
