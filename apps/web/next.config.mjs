import { withSentryConfig } from '@sentry/nextjs';
import createNextIntlPlugin from 'next-intl/plugin';
import { withPlausibleProxy } from 'next-plausible';

const withNextIntl = createNextIntlPlugin('./i18n/request.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
  cacheComponents: true,
  cacheLife: {
    // Blog list - updates when new posts are added
    'blog-list': {
      stale: 60 * 60, // 1 hour - serve stale while revalidating
      revalidate: 60 * 60 * 24, // 24 hours - daily background revalidation
      expire: 60 * 60 * 24 * 30, // 30 days max
    },
    // Individual blog posts - rarely change after publishing
    'blog-post': {
      stale: 60 * 60 * 24, // 1 day - serve stale while revalidating
      revalidate: 60 * 60 * 24 * 7, // 7 days - weekly background revalidation
      expire: 60 * 60 * 24 * 90, // 90 days max
    },
    // Product save counts - short cache so crawler traffic doesn't wake Neon
    'save-count': {
      stale: 60 * 5, // 5 minutes - serve stale while revalidating
      revalidate: 60 * 5, // 5 minutes - background revalidation
      expire: 60 * 60, // 1 hour max
    },
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'cdn.shopify.com', pathname: '/**' },
      { protocol: 'https', hostname: 'cdn.sanity.io', pathname: '/**' },
    ],
  },
  // Include Prisma binaries in serverless functions (moved from experimental in Next.js 16)
  serverExternalPackages: ['@prisma/client', '@prisma/engines'],
  skipTrailingSlashRedirect: true,
  async headers() {
    const csp = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' connect.facebook.net va.vercel-scripts.com",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob: cdn.shopify.com cdn.sanity.io www.facebook.com images.pexels.com",
      "font-src 'self' fonts.gstatic.com",
      "connect-src 'self' vitals.vercel-insights.com *.sentry.io eu.i.posthog.com eu-assets.i.posthog.com",
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
  widenClientFileUpload: true,
  transpileClientSDK: true,
  tunnelRoute: true,
  hideSourceMaps: true,
  disableLogger: true,
  automaticVercelMonitors: true,
  reactComponentAnnotation: { enabled: true },
};

export default withPlausibleProxy()(
  withSentryConfig(withNextIntl(nextConfig), sentryOptions),
);
