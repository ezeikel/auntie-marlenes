import { execFileSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import { initOpenNextCloudflareForDev } from '@opennextjs/cloudflare';
import { withSentryConfig } from '@sentry/nextjs';
import createNextIntlPlugin from 'next-intl/plugin';
import { withPlausibleProxy } from 'next-plausible';

const withNextIntl = createNextIntlPlugin('./i18n/request.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
  cacheComponents: false,
  images: {
    loader: 'custom',
    loaderFile: './lib/image-loader.ts',
    remotePatterns: [
      { protocol: 'https', hostname: 'cdn.shopify.com', pathname: '/**' },
      { protocol: 'https', hostname: 'cdn.sanity.io', pathname: '/**' },
    ],
  },
  skipTrailingSlashRedirect: true,
  async headers() {
    const csp = [
      "default-src 'self'",
      "media-src 'self' assets.auntiemarlenes.com",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' connect.facebook.net",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob: cdn.shopify.com cdn.sanity.io www.facebook.com images.pexels.com",
      "font-src 'self' fonts.gstatic.com",
      "connect-src 'self' *.sentry.io eu.i.posthog.com eu-assets.i.posthog.com",
      "frame-src 'self'",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'none'",
    ].join('; ');

    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: csp,
          },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
    ];
  },
};

const sentryOptions = {
  silent: !process.env.CI,
  org: 'chewybytes',
  project: 'auntie-marlenes-web',
  authToken: process.env.SENTRY_AUTH_TOKEN,
  // Uploads belong to the later release workflow, never a local migration build.
  sourcemaps: { disable: !process.env.CI },
  widenClientFileUpload: true,
  transpileClientSDK: true,
  tunnelRoute: true,
  hideSourceMaps: true,
  disableLogger: true,
  automaticVercelMonitors: false,
  reactComponentAnnotation: { enabled: true },
};

export default withPlausibleProxy()(
  withSentryConfig(withNextIntl(nextConfig), sentryOptions),
);

// `next dev` uses the shared hosted dev database (wrangler.dev.jsonc) when
// `wrangler d1 info` can reach it, else the local copy (refresh with
// `pnpm db:dev:pull`). D1_LOCAL=1 forces the local copy. The choice is made
// once and inherited by Next's child processes through DEV_DB_MODE.
const devDatabase = () => {
  const decided = process.env.DEV_DB_MODE;
  if (decided === 'hosted' || decided === 'local') return decided;
  let mode = 'local';
  let reason = 'D1_LOCAL=1';
  if (process.env.D1_LOCAL !== '1') {
    try {
      // `whoami` rejects account API tokens; `d1 info` proves real access.
      const cli = createRequire(import.meta.url).resolve('wrangler');
      const wrangler = join(dirname(cli), '..', 'bin', 'wrangler.js');
      execFileSync(
        process.execPath,
        [
          wrangler,
          'd1',
          'info',
          'auntie-marlenes-dev',
          '-c',
          'wrangler.dev.jsonc',
          '--json',
        ],
        { stdio: 'ignore', timeout: 15_000 },
      );
      mode = 'hosted';
    } catch {
      reason =
        'Cloudflare unreachable or wrangler not logged in (run `pnpm exec wrangler login`)';
    }
  }
  console.log(
    mode === 'hosted'
      ? '[dev db] hosted auntie-marlenes-dev'
      : `[dev db] LOCAL copy: ${reason}`,
  );
  process.env.DEV_DB_MODE = mode;
  return mode;
};

// Called unconditionally (a no-op outside `next dev`): Next's render workers
// load this file before NODE_ENV is set. Production builds skip the probe.
initOpenNextCloudflareForDev({
  configPath: 'wrangler.dev.jsonc',
  remoteBindings:
    process.env.NODE_ENV !== 'production' && devDatabase() === 'hosted',
  persist: { path: '../../packages/db/.wrangler/state/v3' },
});
