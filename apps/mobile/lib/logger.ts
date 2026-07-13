/**
 * Lightweight mobile logger.
 *
 * Routes through the console (the single sanctioned sink) so the rest of the
 * app never calls `console.*` directly. Debug is suppressed in production to
 * avoid noise; info/warn/error always emit. The signatures are variadic and
 * mirror `console.*` exactly, so routing a call site is a behaviour-neutral
 * swap. Richer Sentry/PostHog routing can be layered on later without
 * touching call sites.
 */

export const debug = (...args: unknown[]) => {
  if (!__DEV__) return;
  // biome-ignore lint/suspicious/noConsole: logger is the single sanctioned console sink
  console.debug(...args);
};

export const info = (...args: unknown[]) => {
  console.info(...args);
};

export const warn = (...args: unknown[]) => {
  console.warn(...args);
};

export const error = (...args: unknown[]) => {
  console.error(...args);
};
