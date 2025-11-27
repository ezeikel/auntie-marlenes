// Only import and initialize Sentry at runtime, not during build
// Sentry uses crypto.randomUUID() internally which conflicts with Next.js 16's static prerendering
export async function register() {
  // Skip Sentry initialization during build phase to avoid crypto.randomUUID() errors
  if (process.env.NEXT_PHASE === 'phase-production-build') {
    return;
  }

  if (process.env.NODE_ENV === 'production') {
    if (process.env.NEXT_RUNTIME === 'nodejs') {
      await import('./sentry.server.config');
    }
    if (process.env.NEXT_RUNTIME === 'edge') {
      await import('./sentry.edge.config');
    }
  }
}

// Export onRequestError handler for Sentry
// Using require() for synchronous module-level export
export const onRequestError =
  process.env.NODE_ENV === 'production' &&
  process.env.NEXT_PHASE !== 'phase-production-build'
    ? // eslint-disable-next-line @typescript-eslint/no-require-imports
      require('@sentry/nextjs').captureRequestError
    : () => {};
