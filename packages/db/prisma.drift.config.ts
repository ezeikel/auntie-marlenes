import { defineConfig } from 'prisma/config';

// Only scripts/check-drift.mjs sets this URL, pointing at a fresh LOCAL D1.
export default defineConfig({
  schema: './prisma/schema.prisma',
  datasource: { url: process.env.D1_DRIFT_DATABASE_URL },
});
