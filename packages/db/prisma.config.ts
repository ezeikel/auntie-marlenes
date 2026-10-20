import { defineConfig } from 'prisma/config';

// Generate/diff are offline; Wrangler owns D1 migrations. Prisma 7.8 diff
// requires a datasource URL even for schema-to-schema diffs; it never opens it.
export default defineConfig({
  schema: './prisma/schema.prisma',
  datasource: { url: 'file:./unused-diff-only.db' },
});
