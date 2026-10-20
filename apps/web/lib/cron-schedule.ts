export const CRON_ROUTES = {
  '0 9 * * *': ['/api/cron/blog'],
  '0 * * * *': ['/api/cron/abandoned-cart'],
  '0 10 * * *': ['/api/cron/restock-reminder'],
  '0 12 * * *': ['/api/cron/publish-next'],
} as const;

export function routesForCron(cron: string): readonly string[] {
  return CRON_ROUTES[cron as keyof typeof CRON_ROUTES] ?? [];
}

/** Keep dispatch testable without loading the generated Next Worker. */
export async function runScheduledCron(
  cron: string,
  secret: string | undefined,
  fetchRoute: (request: Request) => Promise<Response>,
): Promise<void> {
  const routes = routesForCron(cron);
  if (routes.length === 0) throw new Error(`Unknown cron schedule: ${cron}`);
  if (!secret) throw new Error('CRON_SECRET not set');

  const results = await Promise.allSettled(
    routes.map(async (route) => {
      try {
        // The generated handler receives this request directly; no public
        // network request or production hostname is involved.
        const response = await fetchRoute(
          new Request(`https://cron.internal${route}`, {
            headers: { Authorization: `Bearer ${secret}` },
          }),
        );
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
        await response.body?.cancel();
      } catch (error) {
        console.error('[cron] Route error', { route, error });
        throw error;
      }
    }),
  );
  const failures = results.filter((result) => result.status === 'rejected');
  if (failures.length > 0) {
    throw new AggregateError(
      failures.map((failure) => failure.reason),
      `Cron ${cron} failed`,
    );
  }
}
