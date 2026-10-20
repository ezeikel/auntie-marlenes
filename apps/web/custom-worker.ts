import type {
  Response as CfResponse,
  ExportedHandler,
} from '@cloudflare/workers-types';
// @ts-ignore OpenNext generates this module during build.
import handler from './.open-next/worker.js';

// @ts-ignore OpenNext generates these exports during build.
export { DOQueueHandler } from './.open-next/worker.js';

import { runScheduledCron } from './lib/cron-schedule';

export default {
  fetch(request, env, ctx) {
    // www is canonical, as it was on Vercel.
    const url = new URL(request.url);
    if (url.hostname === 'auntiemarlenes.com') {
      url.hostname = 'www.auntiemarlenes.com';
      // The global Response is the DOM type; workerd's runtime object is the same.
      return Response.redirect(url.toString(), 308) as unknown as CfResponse;
    }
    return handler.fetch(request, env, ctx);
  },
  scheduled(controller, env, ctx) {
    ctx.waitUntil(
      runScheduledCron(controller.cron, env.CRON_SECRET, (request) =>
        handler.fetch(request, env, ctx),
      ),
    );
  },
} satisfies ExportedHandler<{ CRON_SECRET?: string }>;
