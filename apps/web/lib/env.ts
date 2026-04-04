import { z } from 'zod';

/**
 * Server-side environment variables — validated at import time.
 * If any required var is missing, the app fails fast with a clear message.
 */
const serverSchema = z.object({
  // Shopify
  SHOPIFY_STOREFRONT_API_ENDPOINT: z.string().url(),
  SHOPIFY_WEBHOOK_SECRET: z.string().min(1),

  // Auth
  NEXT_AUTH_SECRET: z.string().min(1),
  GOOGLE_CLIENT_ID: z.string().min(1),
  GOOGLE_CLIENT_SECRET: z.string().min(1),

  // Database
  DATABASE_URL: z.string().url(),

  // Sanity
  SANITY_API_TOKEN: z.string().min(1).optional(),
  SANITY_REVALIDATE_SECRET: z.string().min(1).optional(),

  // Email
  RESEND_API_KEY: z.string().min(1),
  RESEND_AUDIENCE_ID: z.string().min(1).optional(),

  // Cron
  CRON_SECRET: z.string().min(1).optional(),

  // Content worker (Hetzner) — triggered by daily social posting cron
  CONTENT_WORKER_URL: z.string().url().optional(),
  CONTENT_WORKER_SECRET: z.string().min(1).optional(),

  // AI / Blog generation
  PEXELS_API_KEY: z.string().min(1).optional(),

  // Monitoring
  SENTRY_DSN: z.string().optional(),
  SENTRY_AUTH_TOKEN: z.string().optional(),

  // Mobile auth
  GOOGLE_WEB_CLIENT_ID: z.string().min(1).optional(),
});

/**
 * Client-side environment variables (NEXT_PUBLIC_*).
 * These are inlined at build time by Next.js.
 */
const clientSchema = z.object({
  NEXT_PUBLIC_SITE_URL: z.string().url().default('https://auntiemarlenes.com'),
  NEXT_PUBLIC_SANITY_PROJECT_ID: z.string().min(1),
  NEXT_PUBLIC_SANITY_DATASET: z.string().default('production'),
  NEXT_PUBLIC_SANITY_API_VERSION: z.string().default('2025-02-19'),
  NEXT_PUBLIC_POSTHOG_KEY: z.string().min(1).optional(),
  NEXT_PUBLIC_POSTHOG_HOST: z.string().optional(),
  NEXT_PUBLIC_META_PIXEL_ID: z.string().optional(),
  NEXT_PUBLIC_SENTRY_DSN: z.string().optional(),
});

function validateEnv() {
  // Skip validation during build phase (env vars may not be available)
  if (process.env.NEXT_PHASE === 'phase-production-build') {
    return {
      server: process.env as unknown as z.infer<typeof serverSchema>,
      client: process.env as unknown as z.infer<typeof clientSchema>,
    };
  }

  const serverResult = serverSchema.safeParse(process.env);
  const clientResult = clientSchema.safeParse(process.env);

  const errors: string[] = [];

  if (!serverResult.success) {
    for (const issue of serverResult.error.issues) {
      errors.push(`  ${issue.path.join('.')}: ${issue.message}`);
    }
  }

  if (!clientResult.success) {
    for (const issue of clientResult.error.issues) {
      errors.push(`  ${issue.path.join('.')}: ${issue.message}`);
    }
  }

  if (errors.length > 0) {
    throw new Error(
      `Missing or invalid environment variables:\n${errors.join('\n')}\n\n` +
        'See apps/web/lib/env.ts for the full schema.',
    );
  }

  return {
    server: serverResult.data!,
    client: clientResult.data!,
  };
}

export const env = validateEnv();
