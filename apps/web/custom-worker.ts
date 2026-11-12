import type {
  Response as CfResponse,
  D1Database,
  ExportedHandler,
} from '@cloudflare/workers-types';
// @ts-ignore OpenNext generates this module during build.
import handler from './.open-next/worker.js';

// @ts-ignore OpenNext generates these exports during build.
export { DOQueueHandler } from './.open-next/worker.js';

import { injectWebAnalytics } from './lib/cf-web-analytics';
import { runScheduledCron } from './lib/cron-schedule';
import { postToSlack } from './lib/slack-alert';

async function postDailySummary(db: D1Database, token: string) {
  const [users, subscribers] = await Promise.allSettled([
    db.prepare('SELECT COUNT(*) AS count FROM users').first<number>('count'),
    db
      .prepare(
        'SELECT COUNT(*) AS count FROM newsletter_subscribers WHERE unsubscribedAt IS NULL',
      )
      .first<number>('count'),
  ]);
  const count = (result: PromiseSettledResult<number | null>) =>
    result.status === 'fulfilled'
      ? (result.value ?? 'unavailable')
      : 'unavailable';
  await postToSlack(
    'daily',
    'Daily summary',
    [
      `Accounts: ${count(users)}`,
      `Active newsletter subscriptions: ${count(subscribers)}`,
    ],
    token,
  );
}

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
    if (
      controller.cron === '0 9 * * *' &&
      env.APP_ENV === 'production' &&
      env.SLACK_BOT_TOKEN
    ) {
      ctx.waitUntil(
        postDailySummary(env.DB, env.SLACK_BOT_TOKEN).catch(() => {
          console.warn('[slack] Daily summary failed');
        }),
      );
    }
    // The routes get a ctx whose waitUntil work (Sentry flushes) the dispatch
    // awaits before it resolves or rejects.
    ctx.waitUntil(
      runScheduledCron(
        controller.cron,
        env.CRON_SECRET,
        (request, routeCtx) => handler.fetch(request, env, routeCtx),
        ctx,
      ),
    );
  },
} satisfies ExportedHandler<{
  APP_ENV?: string;
  CRON_SECRET?: string;
  DB: D1Database;
  SLACK_BOT_TOKEN?: string;
  CF_WEB_ANALYTICS_TOKEN?: string;
}>;
