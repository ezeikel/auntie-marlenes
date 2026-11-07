export const CRON_ROUTES = {
  '0 9 * * *': ['/api/cron/blog'],
  '0 * * * *': ['/api/cron/abandoned-cart'],
  '0 10 * * *': ['/api/cron/restock-reminder'],
  '0 12 * * *': ['/api/cron/publish-next'],
} as const;

export function routesForCron(cron: string): readonly string[] {
  return CRON_ROUTES[cron as keyof typeof CRON_ROUTES] ?? [];
}

/** The part of a Workers ExecutionContext the cron dispatch relies on. */
export type WaitUntilContext = { waitUntil(promise: Promise<unknown>): void };

/** How long a scheduled run waits for its routes' background work (Sentry
 * flushes, cache writes) before it returns or throws. Sentry caps its own
 * flush at 2 s; the rest keeps running under the real ctx.waitUntil. */
export const BACKGROUND_SETTLE_MS = 10_000;

/**
 * Wrap a Workers ctx so every waitUntil a route registers is also collected
 * here, and `settle()` can await it inside the scheduled run.
 *
 * Sentry on Workers sends nothing by itself: captureRequestError (and any
 * handled capture that keeps the invocation alive) only reaches Sentry through
 * ctx.waitUntil(flush()). Awaiting those flushes before the run returns or
 * throws means a failing cron route's event is delivered whatever the runtime
 * does with background work once the scheduled invocation has ended.
 */
export function trackWaitUntil<C extends object>(
  ctx: C | undefined,
): { ctx: C & WaitUntilContext; settle(timeoutMs?: number): Promise<void> } {
  const pending: Promise<unknown>[] = [];
  const base = (ctx ?? {}) as C & Partial<WaitUntilContext>;
  const waitUntil = (promise: Promise<unknown>) => {
    pending.push(Promise.resolve(promise).catch(() => undefined));
    base.waitUntil?.call(base, promise);
  };
  // A Proxy, not a copy: native ctx methods need their own receiver.
  const tracked = new Proxy(base, {
    get(target, prop) {
      if (prop === 'waitUntil') return waitUntil;
      const value = Reflect.get(target, prop, target);
      return typeof value === 'function' ? value.bind(target) : value;
    },
  }) as C & WaitUntilContext;
  const drain = async () => {
    // A settling task can register more (a flush after an after() callback).
    while (pending.length) await Promise.all(pending.splice(0));
  };
  return {
    ctx: tracked,
    async settle(timeoutMs = BACKGROUND_SETTLE_MS) {
      let timer: ReturnType<typeof setTimeout> | undefined;
      await Promise.race([
        drain(),
        new Promise<void>((resolve) => {
          timer = setTimeout(resolve, timeoutMs);
        }),
      ]);
      clearTimeout(timer);
    },
  };
}

/** Keep dispatch testable without loading the generated Next Worker. */
export async function runScheduledCron<C extends object = WaitUntilContext>(
  cron: string,
  secret: string | undefined,
  fetchRoute: (
    request: Request,
    ctx: C & WaitUntilContext,
  ) => Promise<Response>,
  ctx?: C,
): Promise<void> {
  const routes = routesForCron(cron);
  if (routes.length === 0) throw new Error(`Unknown cron schedule: ${cron}`);
  if (!secret) throw new Error('CRON_SECRET not set');
  const background = trackWaitUntil(ctx);

  const results = await Promise.allSettled(
    routes.map(async (route) => {
      try {
        // The generated handler receives this request directly; no public
        // network request or production hostname is involved.
        const response = await fetchRoute(
          new Request(`https://cron.internal${route}`, {
            headers: { Authorization: `Bearer ${secret}` },
          }),
          background.ctx,
        );
        // Drain rather than cancel: cancelling while OpenNext is still
        // writing the body raised "This ReadableStream is closed" as an
        // uncaught error, and draining means the route has fully finished.
        await response.arrayBuffer().catch(() => undefined);
        if (!response.ok) {
          console.error('[cron] Route failed', {
            route,
            status: response.status,
          });
          throw new Error(`Cron route ${route} returned ${response.status}`);
        }
        console.info('[cron] Route completed', {
          route,
          status: response.status,
        });
      } catch (error) {
        console.error('[cron] Route error', { route, error });
        throw error;
      }
    }),
  );
  // Deliver what the routes reported (Sentry events) before ending the run.
  await background.settle();
  const failures = results.filter((result) => result.status === 'rejected');
  if (failures.length > 0) {
    throw new AggregateError(
      failures.map((failure) => failure.reason),
      `Cron ${cron} failed`,
    );
  }
}
