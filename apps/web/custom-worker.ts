import type { ExportedHandler } from '@cloudflare/workers-types';
// @ts-ignore OpenNext generates this module during build.
import handler from './.open-next/worker.js';

// @ts-ignore OpenNext generates these exports during build.
export { DOQueueHandler } from './.open-next/worker.js';

import { runScheduledCron } from './lib/cron-schedule';

export default {
  fetch: handler.fetch,
  scheduled(controller, env, ctx) {
    ctx.waitUntil(
      runScheduledCron(controller.cron, env.CRON_SECRET, (request) =>
        handler.fetch(request, env, ctx),
      ),
    );
  },
} satisfies ExportedHandler<{ CRON_SECRET?: string }>;
