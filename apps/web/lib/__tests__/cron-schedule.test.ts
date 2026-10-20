import { readFileSync } from 'node:fs';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { CRON_ROUTES, routesForCron, runScheduledCron } from '../cron-schedule';

afterEach(() => vi.restoreAllMocks());
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
});
