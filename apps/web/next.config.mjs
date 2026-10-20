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

initOpenNextCloudflareForDev({
  remoteBindings: false,
  persist: { path: '../../packages/db/.wrangler/state/v3' },
});
