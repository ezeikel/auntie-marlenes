import { withSentryConfig } from '@sentry/nextjs';
import { withPlausibleProxy } from 'next-plausible';
import createNextIntlPlugin from 'next-intl/plugin';

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
  withSentryConfig(withNextIntl(nextConfig), sentryOptions)
);
