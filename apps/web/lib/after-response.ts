import { after } from 'next/server';

/**
 * Starts work that must finish but must not hold the response up: a welcome email, a conversion event, a
 * prefetch. On Workers a promise nobody awaits is cancelled when the request ends, so a bare
 * `send(...).catch(() => {})` silently drops the work. `after()` hands it to the platform (`waitUntil` on
 * Workers, the same on Vercel), which keeps the invocation alive until the work settles.
 *
 * `after()` only exists inside a request (route handler, server action, middleware). Elsewhere (a unit test,
 * a script) it throws, and the work just starts as it used to. A rejection is swallowed either way: callers
 * already log their own failures, and an unhandled rejection must never take a request down.
 */
export const runAfterResponse = (
  work: () => Promise<unknown> | unknown,
): void => {
  const guarded = async () => {
    try {
      await work();
    } catch {
      // the work reports its own failure
    }
  };
  try {
    after(guarded);
  } catch {
    void guarded();
  }
};
