import { readFileSync } from 'node:fs';
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  CRON_ROUTES,
  routesForCron,
  runScheduledCron,
  trackWaitUntil,
} from '../cron-schedule';

afterEach(() => vi.restoreAllMocks());
// A schedule with one route, for the background-work tests.
const CRON = '0 9 * * *';
const config = JSON.parse(
  readFileSync(new URL('../../wrangler.jsonc', import.meta.url), 'utf8'),
);
describe('Cloudflare crons', () => {
  it('matches all four unchanged Vercel schedules', () => {
    const vercel = JSON.parse(
      readFileSync(new URL('../../vercel.json', import.meta.url), 'utf8'),
    );
    expect(
      Object.entries(CRON_ROUTES).flatMap(([schedule, paths]) =>
        paths.map((path) => ({ path, schedule })),
      ),
    ).toEqual(vercel.crons);
    expect(config.triggers.crons).toEqual(Object.keys(CRON_ROUTES));
    expect(config.triggers.crons).toHaveLength(4);
  });
  it('keeps staging unscheduled and redeclares all bindings', () => {
    const staging = config.env.staging;
    expect(staging.triggers.crons).toEqual([]);
    for (const key of [
      'assets',
      'r2_buckets',
      'd1_databases',
      'durable_objects',
    ])
      expect(staging[key]).toEqual(config[key]);
    expect(staging.services).toEqual([
      { binding: 'WORKER_SELF_REFERENCE', service: staging.name },
    ]);
    expect(staging.ratelimits.map((x: { name: string }) => x.name)).toEqual(
      config.ratelimits.map((x: { name: string }) => x.name),
    );
    expect(
      staging.ratelimits.map((x: { namespace_id: string }) => x.namespace_id),
    ).not.toEqual(
      config.ratelimits.map((x: { namespace_id: string }) => x.namespace_id),
    );
  });
  it.each(Object.keys(CRON_ROUTES))(
    'dispatches %s through fetch with the test bearer',
    async (cron) => {
      vi.spyOn(console, 'info').mockImplementation(() => {});
      const fetch = vi.fn(async (_req: Request) => new Response('{}'));
      await runScheduledCron(cron, 'local-test', fetch);
      expect(fetch).toHaveBeenCalledTimes(1);
      const req = fetch.mock.calls[0][0];
      expect(new URL(req.url).pathname).toBe(routesForCron(cron)[0]);
      expect(req.headers.get('authorization')).toBe('Bearer local-test');
      expect(req.method).toBe('GET');
    },
  );
  it('rejects unknown schedules and missing secrets before dispatch', async () => {
    const fetch = vi.fn();
    await expect(runScheduledCron('unknown', 'test', fetch)).rejects.toThrow(
      'Unknown cron',
    );
    await expect(
      runScheduledCron('0 9 * * *', undefined, fetch),
    ).rejects.toThrow('CRON_SECRET');
    expect(fetch).not.toHaveBeenCalled();
  });
  it('propagates failed routes', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    await expect(
      runScheduledCron(
        '0 9 * * *',
        'test',
        async () => new Response(null, { status: 401 }),
      ),
    ).rejects.toThrow('failed');
  });
  it('awaits the Sentry flush a failing route registers before it throws', async () => {
    // What @sentry/nextjs does on a route error under OpenNext: capture, then
    // ctx.waitUntil(flush()). The send must finish inside the scheduled run,
    // before it rejects, or the event can be lost.
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const events: string[] = [];
    const realWaitUntil = vi.fn();
    const ctx = { waitUntil: realWaitUntil, props: { a: 1 } };
    const fetchRoute = vi.fn(
      async (_request: Request, routeCtx: typeof ctx) => {
        expect(routeCtx.props).toEqual({ a: 1 });
        routeCtx.waitUntil(
          new Promise<void>((resolve) =>
            setTimeout(() => {
              events.push('sentry event sent');
              resolve();
            }, 20),
          ),
        );
        return new Response('{}', { status: 500 });
      },
    );
    await runScheduledCron(CRON, 'secret', fetchRoute, ctx)
      .then(() => events.push('run resolved'))
      .catch(() => events.push('run threw'));
    expect(events).toEqual(['sentry event sent', 'run threw']);
    // The task is still handed to the runtime too.
    expect(realWaitUntil).toHaveBeenCalledOnce();
  });
  it('awaits background work registered by a route that succeeds', async () => {
    vi.spyOn(console, 'info').mockImplementation(() => {});
    let flushed = false;
    await runScheduledCron(
      CRON,
      'secret',
      async (_request, routeCtx) => {
        // A handled capture in a 200 route, and a task that itself registers
        // another one.
        routeCtx.waitUntil(
          Promise.resolve().then(() =>
            routeCtx.waitUntil(
              new Promise<void>((resolve) =>
                setTimeout(() => {
                  flushed = true;
                  resolve();
                }, 10),
              ),
            ),
          ),
        );
        return new Response('{}', { status: 200 });
      },
      { waitUntil: vi.fn() },
    );
    expect(flushed).toBe(true);
  });
  it('drains each route response instead of cancelling it', async () => {
    vi.spyOn(console, 'info').mockImplementation(() => {});
    const response = new Response('{"ok":true}');
    const cancel = vi.spyOn(response.body as ReadableStream, 'cancel');
    await runScheduledCron(CRON, 'secret', async () => response);
    expect(cancel).not.toHaveBeenCalled();
    expect(response.bodyUsed).toBe(true);
  });
  it('does not let a background task that never settles hold the run open', async () => {
    const tracked = trackWaitUntil({ waitUntil: vi.fn() });
    tracked.ctx.waitUntil(new Promise(() => {}));
    tracked.ctx.waitUntil(Promise.reject(new Error('flush failed')));
    const started = Date.now();
    await tracked.settle(50);
    expect(Date.now() - started).toBeLessThan(1000);
  });
});
