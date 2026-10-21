import type {
  Response as CfResponse,
  ExportedHandler,
} from '@cloudflare/workers-types';
// @ts-ignore OpenNext generates this module during build.
import handler from './.open-next/worker.js';

// @ts-ignore OpenNext generates these exports during build.
export { DOQueueHandler } from './.open-next/worker.js';

import { injectWebAnalytics } from './lib/cf-web-analytics';
import { runScheduledCron } from './lib/cron-schedule';

export default {
  async fetch(request, env, ctx) {
    // www is canonical, as it was on Vercel.
    const url = new URL(request.url);
    if (url.hostname === 'auntiemarlenes.com') {
      url.hostname = 'www.auntiemarlenes.com';
      // The global Response is the DOM type; workerd's runtime object is the same.
      return Response.redirect(url.toString(), 308) as unknown as CfResponse;
    }
    const response = await handler.fetch(request, env, ctx);
    return injectWebAnalytics(request, response, env.CF_WEB_ANALYTICS_TOKEN);
  },
  scheduled(controller, env, ctx) {
    ctx.waitUntil(
      runScheduledCron(controller.cron, env.CRON_SECRET, (request) =>
        handler.fetch(request, env, ctx),
      ),
    );
  },
} satisfies ExportedHandler<{
  CRON_SECRET?: string;
  CF_WEB_ANALYTICS_TOKEN?: string;
}>;
