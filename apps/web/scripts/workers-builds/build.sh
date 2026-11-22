#!/usr/bin/env bash
set -euo pipefail
unset RELEASE_UPLOAD_URL CLOUDFLARE_API_TOKEN
pnpm install --frozen-lockfile
pnpm --filter @auntie-marlenes/db db:generate
pnpm test --filter=@auntie-marlenes/web...
pnpm --filter @auntie-marlenes/web exec node scripts/assert-no-env-files.mjs && pnpm --filter @auntie-marlenes/web exec opennextjs-cloudflare build
cd apps/web
node scripts/workers-builds/portable-binaries.mjs
pnpm exec wrangler deploy --dry-run
