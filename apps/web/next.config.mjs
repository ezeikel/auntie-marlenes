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
};

const sentryOptions = {
  silent: !process.env.CI,
  org: 'chewybytes',
  project: 'auntie-marlenes',
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
