# Cloudflare Workers preparation (A2, local only)

Production remains on Vercel/Neon until the migration cutover gate. Do not deploy
this intermediate branch. `vercel.json` is unchanged. Resource IDs remain local
placeholders, including the DB ID copied from `packages/db/wrangler.jsonc`.

## Build and local data

Use Node 22.12+ (validated with 22.23.2), pnpm, and OpenNext **1.20.1**.
The DB package build copies Prisma's generated JS/WASM as well as compiling TS;
otherwise workerd's query compiler imports are missing from `dist/`.

```sh
pnpm --filter @auntie-marlenes/db db:generate
pnpm --filter @auntie-marlenes/db build
pnpm --filter @auntie-marlenes/db db:migrate:local
cd apps/web
pnpm preview
```

`preview` builds and populates local cache bindings before starting Wrangler,
using `../../packages/db/.wrangler/state` shared with the DB migrations.
`next dev` uses the corresponding `state/v3` directory (cadem's setup).
The local prepare helper links web's default `.wrangler/state` to that shared
state: OpenNext 1.20.1's cache population does not forward `--persist-to`, while
Wrangler dev does. This keeps pre-populated R2 and the tag table visible too.
It refuses to replace a pre-existing separate cache directory.
Neither command needs remote binding access. `cf-typegen` creates an ignored
`cloudflare-env.d.ts`; exclude its global runtime declarations from Next's TS
program, as cadem does, to avoid overriding DOM `Response.json()` types.

For isolated migration QA, copy `.dev.vars.example` to private `.dev.vars`, add
only read-only storefront settings, then use `pnpm preview:local`. Its build
helper clears all original `.env.local` server values before loading the local
fixture, so the generated OpenNext env fallback cannot retain production keys.
Public variables are compiled into browser assets; set `NEXT_PUBLIC_APP_ENV`
when building staging/production, not only when launching the Worker.
`deploy` exists for the later approved cutover; it is not part of A2.

## Caching

Cache Components were disabled after the local concurrency test reproduced
missing dynamic HTML and product 500/timeouts (consistent with upstream #1115,
#1225/#1369 and #1450). Every former `'use cache'` scope now caches JSON data
with `unstable_cache`, preserving all tags and per-country/query keys. Revalidate
intervals remain: products 86400s, blog lists 86400s, blog posts 604800s,
save counts 300s, copyright 2592000s. `unstable_cache` has no equivalent to
Cache Components' separate client `stale` and hard `expire` settings; it uses
Next's ordinary stale-while-revalidate behavior at those same intervals.

R2 `auntie-marlenes-cache` stores the incremental/data cache. D1
`auntie-marlenes-cache` stores tag revalidation timestamps; the SQLite Durable
Object queue handles time-based revalidation. OpenNext preview initializes the
`revalidations` table and seeds the build cache. Both environments redeclare
all bindings. Staging has separate rate-limit namespaces and no cron triggers.

The [OpenNext caching guide](https://opennext.js.org/cloudflare/caching) says
cache interception does not support PPR; `enableCacheInterception` is explicitly
false. In installed 1.20.1, the bundled OpenNext AWS server installs its
composable cache handler automatically, routing `'use cache'` through the same
incremental cache and tag cache. No custom application cache handler is needed.
No regional cache is enabled, so no Cloudflare Cache API purge token is needed.
The correctly initialized control also failed with `Failed to parse postponed
state`: Next supplied zlib `maxOutputLength=524288000`, while workerd accepts
at most 134217728. Missing streamed content persisted across both rounds.

## Runtime decisions

- Images use `lib/image-loader.ts`: Shopify preserves query parameters and sets
  `width`; Sanity sets `w`, `q`, and `auto=format`. Pexels/local images retain
  their original URLs. There is no Images binding or native image processor.
- OG fonts fetch lazily inside handlers through `getOgFont`, cache immutable
  bytes per isolate, and evict failed loads. Apple web secrets resolve lazily
  with shared in-flight generation, refresh after one hour, and isolate key
  failures to the Apple provider.
- Mobile Google verifies the same `GOOGLE_WEB_CLIENT_ID`, using Google's remote
  JWKS, both Google issuers and RS256. Apple previously only decoded its token
  (there was no issuer/audience verification); it now verifies Apple's JWKS,
  issuer `https://appleid.apple.com`, RS256 and required token expiry, against
  `APPLE_MOBILE_CLIENT_ID` (the native app bundle ID, separate from the web
  Service ID). Set the correct variant ID in each runtime environment.
  Session and magic-link minting already use jose and remain unchanged.
- Native Workers rate limiting exactly expresses the existing 10/30/60 calls
  per 60 seconds and retains IP:path keys. Trusted `cf-connecting-ip` takes
  precedence. Counters are per Cloudflare location and eventually consistent,
  per [Cloudflare's binding docs](https://developers.cloudflare.com/workers/runtime-apis/bindings/rate-limit/).
  The binding exposes success only: 429 retry/reset headers conservatively use
  60 seconds rather than pretending to know the counter's precise reset time.
- Sentry remains installed. `APP_ENV` / `NEXT_PUBLIC_APP_ENV` explicitly name
  production/staging; unset/empty means development, with reporting disabled.
  Development builds never report, preserving commit `2067874`'s intent.
  Local builds disable source-map uploads. Auth welcome-email work uses `after()`.
- `app/actions/blog.ts` is retained: `scripts/regenerate-blog-images.ts:21`
  imports `generateBlogImage` and `uploadImageToSanity`. It is not dead code.
- Studio initially measured **10,390.83 KiB gzip**, above 10 MiB, with only
  the asset-directory override needed to get past oversized videos for this
  measurement. Both embedded Studio route files were removed. `sanity.cli.ts`
  prepares standalone `sanity deploy`; no deployment was run.
- Three public showcase videos exceeded Workers' 25 MiB per-asset limit. They
  were recompressed at their original dimensions/durations, audio stream copied,
  faststart enabled; final sizes are below the cap. No scene content was changed.
- Runtime routes contain no filesystem reads, `sharp`, or `child_process` calls.
  Filesystem uses in scripts/tests/config are Node-only. `publish-next`'s
  `maxDuration` was removed: it only posts an HTTP job, now with a 10s ack timeout.
  `limits.cpu_ms = 300000` allows the Workers Paid five-minute CPU maximum;
  generation/rendering stays on Hetzner and HTTP waiting is not CPU work.

## Scheduled work and worker hostname

The scheduled entry calls OpenNext's fetch handler directly with a CRON_SECRET
bearer; no production origin or public HTTP round-trip is involved.

| UTC schedule | Route | Work |
| --- | --- | --- |
| `0 9 * * *` | `/api/cron/blog` | POST `/generate/blog` with `{}` |
| `0 * * * *` | `/api/cron/abandoned-cart` | Local DB email eligibility/cleanup |
| `0 10 * * *` | `/api/cron/restock-reminder` | Local DB reminder eligibility |
| `0 12 * * *` | `/api/cron/publish-next` | POST `/jobs/publish/next` with `{dry_run:false, platforms:['instagram','facebook']}` |

Scheduled GET handoffs acknowledge with HTTP 200 for this card's acceptance;
manual blog POST retains HTTP 202. Unit tests compare all schedules against the
unchanged Vercel configuration. Unknown schedules/missing secrets fail closed.

`CONTENT_WORKER_URL` call sites:

1. `lib/worker.ts` reads the URL and optional CONTENT_WORKER_SECRET; it POSTs JSON
   with a 10s timeout. Its only callers are the blog cron's GET and POST, both
   sending `{}` to `/generate/blog`. No provider keys are sent in the body.
2. `app/api/cron/publish-next/route.ts` reads URL and required worker secret,
   POSTing the publishing job above with bearer authentication and a 10s timeout.
3. `lib/env.ts` validates the optional URL; this is not an HTTP call.

There are no `WORKER_URL` call sites in web. Both URL constructions are env-only,
with trailing slashes removed and no IP fallback. **Production needs a public
hostname for the content worker**, since Workers generally refuse fetches to raw
IPs with `global_fetch_strictly_public`. Production uses
`CONTENT_WORKER_URL=http://content-worker.auntiemarlenes.com:3020`, a DNS-only A
record to the box (created 20 Oct 2026). A probe Worker got 200 from
`/health` on that hostname and 403 on the raw IP.

## Media

Videos are not in `public/`: Workers static assets cap each file at 25 MiB.
They live in the R2 bucket `auntie-marlenes-prod` under `videos/`, served at
`https://assets.auntiemarlenes.com/videos/...` (see `lib/media.ts`). Add a new
video with `wrangler r2 object put auntie-marlenes-prod/videos/<path> --file
<file> --content-type video/mp4 --remote`. `apps/worker/src/hero-videos-ab.ts`
still writes hero candidates to `apps/web/public/videos/hero` locally; upload
any keeper to R2 rather than committing it.

For local scheduled checks, run a no-op worker on localhost:3029, verify both
email tables are empty, and start preview with `--test-scheduled`. Invoke
`/cdn-cgi/local/scheduled?cron=...` for each schedule; inspect `[cron] Route completed`
messages for actual route status. Check direct unauthenticated routes separately.
The mock must validate path, bearer and job body without generating/publishing.

## A2 acceptance (20 October 2026)

Final OpenNext build passed. Both token-free `wrangler deploy --dry-run --env=''`
and `--env staging` passed: **33,596.32 KiB upload / 7,889.71 KiB gzip**, including
all Worker modules. All public assets are below 25 MiB. Wrangler's
`unstable_readConfig` resolves the same configurations: default has four schedules,
staging has `crons: []`; checked-in evidence is in `docs/cloudflare-a2/`.

Root `pnpm check-types`, `pnpm test` (92 tests / 16 files), and `pnpm lint` pass.
The forbidden dependency/env grep returns no matches outside lockfiles/docs.
`apps/mobile`, `apps/worker`, and `apps/web/vercel.json` have no diff.

Preview uses migrated local D1 plus one synthetic `a2@example.test` user. No
production data was read for A2. Both email-cron tables were verified empty.

| curl route | Status |
| --- | --- |
| `/` | 200 |
| `/en` | 307 to `/`, then 200 with `-L` (existing as-needed locale policy) |
| `/product/nalas-baby-kids-tropical-blast-curl-defining-jelly-150ml` | 200 |
| `/blog/90s-natural-hair-styles-are-back-retro-trends-revived` | 200 |
| `/opengraph-image` | 200 `image/png` |
| `/api/auth/session` | 200 |
| `/api/auth/mobile/me` without token | 401 |
| `/relay-hyx5/decide?v=3` | 200, PostHog JSON |
| `/js/script.js` | 200 JavaScript |
| `/proxy/api/event` GET | 404 from Plausible (proxied Plausible HTML, no locale redirect) |
| all four cron routes with test bearer | 200 each |
| all four cron routes without bearer | 401 each |

All four scheduled invocations also returned 200, and `[cron] Route completed`
reported status 200 for each actual route. Local no-op worker validated the blog
and publishing payloads/authentication. No email, generation, or publishing ran.

After fallback, two rounds of 20 concurrent requests per type (160 requests)
returned **200 in every case with all 20/20 full-content checks passing per case**:
`/about` (cached page), `/bag` (dynamic page), the product above, and `/` (former
`'use cache'` holes). Checks exclude Flight scripts and require the actual header
plus route-specific HTML; homepage also requires real product links and both
Featured Products/Bundle Deals. Re-run with:

```sh
RUN_LABEL=fallback node scripts/cloudflare-concurrency-smoke.mjs
```

The local signed Sanity webhook returned 200. Before revalidation no blog tag
rows existed (effective timestamp zero); after it, `blog-list`, `blog-posts` and
`blog-post-90s-natural-hair-styles-are-back-retro-trends-revived` all had
`revalidatedAt = expire = 1792486220719` in local D1. No Sanity document was edited.

Cache Components control results are retained separately from the first run
whose cache persist directories differed. The corrected control had an initialized
D1 tag table and 612 populated cache entries, yet still reproduced the failure.
The final fallback results are in `docs/cloudflare-a2/fallback.json`.
