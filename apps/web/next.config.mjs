import { withSentryConfig } from '@sentry/nextjs';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./i18n/request.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
  cacheComponents: true,
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'cdn.shopify.com', pathname: '**' },
    ],
  },
  // Include Prisma binaries in serverless functions (moved from experimental in Next.js 16)
  serverExternalPackages: ['@prisma/client', '@prisma/engines'],
  async rewrites() {
    return [
      {
        source: '/relay-hyx5/static/:path*',
        destination: 'https://eu-assets.i.posthog.com/static/:path*',
      },
      {
        source: '/relay-hyx5/:path*',
        destination: 'https://eu.i.posthog.com/:path*',
      },
      {
        source: '/relay-hyx5/flags',
        destination: 'https://eu.i.posthog.com/flags',
      },
    ];    
  }
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

export default withSentryConfig(withNextIntl(nextConfig), sentryOptions);
