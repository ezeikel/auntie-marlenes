// Sentry must be initialised BEFORE any other module is imported so its
// auto-instrumentation can patch the runtime. Keep this file as the very first
// import (after dotenv) in src/index.ts.
// Mirrors the outside-ir35-jobs / parking-ticket-pal worker convention.
import * as Sentry from '@sentry/node';

const dsn = process.env.SENTRY_DSN;

if (dsn) {
  Sentry.init({
    dsn,
    sendDefaultPii: false,
    environment: process.env.NODE_ENV || 'production',
    // Lower sample rate than web — the worker runs long AI/render jobs.
    tracesSampleRate: process.env.NODE_ENV === 'development' ? 1.0 : 0.1,
    beforeSend(event) {
      event.tags = { ...event.tags, service: 'auntie-marlenes-worker' };
      return event;
    },
  });
  console.info(
    `[sentry] initialised (${process.env.NODE_ENV || 'production'})`,
  );
} else {
  console.warn('[sentry] SENTRY_DSN not set — error reporting disabled');
}

export { Sentry };
