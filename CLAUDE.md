# Claude Code Context

## Current AI models
Use the latest model ids from `~/Development/Personal/scripts/model-registry/LATEST-MODELS.md`
(live provider snapshot — supersedes training data). Fleet defaults: text = claude-sonnet-5,
vision judge = claude-opus-4-8, image gen = gpt-image-2 (gpt-image-1.5 where speed matters),
search = sonar. Regenerate: `tsx ~/Development/Personal/scripts/model-registry/fetch-models.ts`.

## Project Structure

- **Monorepo** using Turborepo + pnpm workspaces
- `apps/web` - Next.js 16 e-commerce frontend (Auntie Marlene's)
- `apps/studio` - Sanity Studio (embedded at /studio route)
- `packages/db` - Prisma database client

## Database (Neon)

This project uses Neon PostgreSQL with Prisma.

### Cost rule

Compute is 0.25–1 CU (autosuspend 300s = the plan floor). Neon bills a **5-min minimum per wake**, so
what costs money is how often something touches Postgres, not how much work it does. Two things here were
waking it around the clock and must not regress: `abandoned-cart` is **hourly, not `*/15`** (its email
window is "checkout created 1–4h ago", so hourly catches every cart with hours of margin), and the
product page's save count is cached (`'use cache'` + `cacheLife('save-count')`) so bot crawls don't hit
`savedItem.count()` per request. Any new sub-hourly cron needs a DB-free early exit before the first
query. Rationale: `~/Development/CLAUDE.md` → Neon cost playbook.

### Migrations

**CRITICAL: Never use `prisma db push`** - it causes schema drift between the database and migration history.

#### Workflow

1. **Make schema changes** in `packages/db/prisma/schema.prisma`
2. **Create migration locally**: `cd packages/db && pnpm db:migrate`
3. **Build the db package**: `pnpm build` (compiles TypeScript after Prisma generates client)
4. **Commit & push** migration files to `main` branch

#### Commands (run from `packages/db`)

| Command            | Purpose                   | When to Use                     |
| ------------------ | ------------------------- | ------------------------------- |
| `pnpm db:migrate`  | Create + apply migration  | After schema changes            |
| `pnpm build`       | Compile TypeScript        | After db:migrate or db:generate |
| `pnpm db:deploy`   | Apply existing migrations | CI/CD only                      |
| `pnpm db:generate` | Regenerate Prisma client  | After pulling changes           |
| `pnpm db:push`     | **NEVER USE**             | Causes drift                    |
| `pnpm db:studio`   | Database GUI              | Debugging                       |

**Important**: Always run `pnpm build` after `db:migrate` or `db:generate` to compile the updated Prisma client.

## Vercel Deployment

The web app is deployed via Vercel. **Important**: The Vercel project is linked in `apps/web`, not the repo root.

- **Vercel CLI**: Always run from `apps/web` directory when managing env vars or deployments
- **Env vars**: Use `cd apps/web && vercel env ls` to list/manage environment variables

### Monorepo Constraints

**React version must stay in sync** across all apps and packages. pnpm's strict dependency isolation means version mismatches cause multiple React instances, leading to "Invalid hook call" errors. When upgrading React, update all workspaces together.

## Next.js 16 Specifics

- App Router with `middleware.ts` (not yet migrated to `proxy.ts`)
- `'use cache'` directive with `cacheLife()` / `cacheTag()` for ISR
- PPR (Partial Pre-rendering) with dynamic slots for prices/save counts
- `after()` from `next/server` for non-blocking analytics in server actions

## Translations

Uses `next-intl` with 5 locales (en, fr, de, nl, es). Translation files are in `apps/web/messages/`.

## Commits

Use semantic commit style (`type(scope): message`). Keep messages as one-liners, succinct but covering work done. Do not attribute Claude in commit messages. Never include Co-Authored-By lines.

## Key Integrations

- **Shopify Storefront API** (GraphQL) - Product catalog, cart, checkout
- **Shopify Admin API** (GraphQL + REST) - Product management, webhooks, inventory
- **Sanity CMS** - Blog content, auto-generated posts via cron
- **Analytics**: Sentry, PostHog, Plausible, Meta Pixel, Vercel Analytics
- **Auth**: NextAuth v5 beta with Prisma adapter
- **Email**: React Email + Resend
- **AI**: Vercel AI SDK (OpenAI + Google) for blog generation

## Shopify Configuration

- **Store domain**: `afro-hair-and-beauty.myshopify.com`
- **Admin API**: Use env vars `SHOPIFY_ADMIN_API_ACCESS_TOKEN` and `SHOPIFY_ADMIN_API_ENDPOINT` from `.env.local`
- **API version**: `2026-01`

### Sales Channels (Publications)

Products must be published to **both** channels to appear on the site:

| Channel | Publication ID | Purpose |
|---|---|---|
| Online Store | `gid://shopify/Publication/204073959741` | Shopify-hosted checkout |
| Auntie Marlene's API | `gid://shopify/Publication/204294357309` | **Storefront API** — powers the website |

**CRITICAL**: If a product is only on "Online Store" but not on "Auntie Marlene's API", it will be invisible to the site. Always publish to both.

### Webhooks

Registered webhooks pointing to `https://auntiemarlenes.com/api/webhooks/shopify`:
- `products/create`, `products/update`, `products/delete` — trigger `revalidateTag()` for all product cache tags
- `orders/create`, `orders/paid`, `orders/updated`, `orders/cancelled` — analytics + email
- `checkouts/create`, `checkouts/update` — abandoned cart tracking

### Cache Tags (for webhook revalidation)

All product webhooks revalidate: `shop-products`, `featured-products`, `bundle-deals`, `category-products`, `sale-products`, `new-arrivals`

## Adding New Products

When asked to add a new product, follow this complete workflow:

### 1. Research the Product
- Use **Perplexity API** (`sonar-deep-research`) to research the product — get accurate description, ingredients/features, retail price, product type, vendor/brand
- Identify the correct category: Hair Care, Skin Care, Body Care, Wigs & Extensions, Kids, Men's, Accessories, Styling

### 2. Get a Product Image
- If the user supplies a reference image, use the **AI image pipeline** (Gemini 3 Pro Image) to generate a consistent studio-style product image
- If no image supplied, use Perplexity/web search to find a suitable product image, then run it through the image pipeline for consistency
- Claude judges image quality before upload

### 3. Set Pricing
- **Business model**: Currently retail reselling (no wholesale). Products are bought at retail price from high street shops (Boots, Superdrug, Sainsbury's, independent hair/beauty shops) and shipped to customers
- **Goal**: Minimize loss, not maximize profit. This is a demand validation phase
- Research the typical UK retail price, then set the selling price to cover as much of the cost as possible while remaining competitive
- Factor in: retail purchase price + shipping cost + packaging. Accept small losses but don't lose significantly on any product
- Typical markup has been ~23-29% but this may result in a loss after fulfilment costs

### 4. Create the Product via Shopify Admin API
- Use the Admin API (GraphQL mutation `productCreate` or REST endpoint)
- Set all required fields: title, description (HTML), vendor, product type, tags, price, compare-at price (if on sale), images
- **Inventory**: Set `tracked: true`, quantity of **10** units (virtual stock — we don't hold physical inventory)
- Set `status: "active"` so it's immediately available

### 5. Publish to Sales Channels
**CRITICAL** — this step was previously missed and caused products to not appear on the site:
```
mutation {
  publishablePublish(id: "gid://shopify/Product/{ID}", input: [
    {publicationId: "gid://shopify/Publication/204073959741"},
    {publicationId: "gid://shopify/Publication/204294357309"}
  ]) { userErrors { field message } }
}
```

### 6. Add to Collection(s)
- Add the product to the appropriate Shopify collection(s) matching its category
- Products can belong to multiple collections (e.g., a kids product might be in "Kids" and "Hair Care")

### 7. Verify
- Confirm the product appears in the Storefront API: query with the product title/handle
- The `products/create` webhook will automatically revalidate the site cache

## Blog Auto-Generation

Cron job at `/api/cron/blog` runs daily at 9AM UTC. Generates blog posts using AI with Pexels images (AI Judge evaluates suitability), auto-publishing them (`status: 'published'`). The fixed topic list (`lib/blog/topics.ts`) falls back to a never-dry dynamic topic generator (`lib/blog/dynamic-topics.ts`) once exhausted, so the pipeline never runs out. See `apps/web/app/actions/blog.ts`.

## Known Issues

- `pnpm --filter web lint` fails with "Invalid project directory" - run lint from within `apps/web` directory instead
- FontAwesome Pro (9 packages) adds ~300-500KB to bundle - this is intentional, do not replace

## GitHub CLI

Use `gh` CLI when referencing GitHub repos that I own or public repos (e.g., `gh repo view`, `gh issue list`, `gh pr list`).

## Hetzner Worker Deploy

The `apps/worker` package runs as a systemd service (`content-worker.service`) on a shared Hetzner box at `157.90.168.197`, alongside PTP's workers. The box is managed as part of a Chewy Bytes umbrella setup, with conventions for directory naming, port allocation, systemd units, and deploy workflows shared across all projects hosting workers there.

> The app directory was renamed `apps/content-worker` → `apps/worker` in the 2026-07 estate alignment. The **systemd service name (`content-worker`), the env var names (`CONTENT_WORKER_URL` / `CONTENT_WORKER_SECRET`) and the workflow filename were deliberately left unchanged** so the live box didn't need a rename; only the directory moved (the deploy workflow migrates the box `.env` and re-installs the unit idempotently).

**Before touching the worker deploy, SSHing into the box, or adding a new project to the host:** read [`chewy-bytes-docs/HETZNER_BOX.md`](https://github.com/ezeikel/chewy-bytes-docs/blob/main/HETZNER_BOX.md) (local: `~/Development/docs/HETZNER_BOX.md`). It is the canonical runbook and now has exactly one home — it used to be copied into every box-deploying repo and kept "byte-identical" by hand, but the copies drifted. Covers current inhabitants, SSH access, port allocation, systemd unit templates, the deploy workflow pattern, a step-by-step guide for adding a new project, common operations, capacity, and known gotchas.

Auto-deploy is wired via `.github/workflows/deploy-content-worker.yml` — every push to `main` that touches `apps/worker/**` triggers an SSH deploy that pulls, installs, and restarts the service on the box. Requires `HETZNER_HOST`, `HETZNER_USER`, `HETZNER_SSH_KEY` secrets on the repo (already set).
