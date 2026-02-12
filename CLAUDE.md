# Claude Code Context

## Project Structure

- **Monorepo** using Turborepo + pnpm workspaces
- `apps/web` - Next.js 16 e-commerce frontend (Auntie Marlene's)
- `apps/studio` - Sanity Studio (embedded at /studio route)
- `packages/db` - Prisma database client

## Database (Neon)

This project uses Neon PostgreSQL with Prisma.

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
- **Sanity CMS** - Blog content, auto-generated posts via cron
- **Analytics**: Sentry, PostHog, Plausible, Meta Pixel, Vercel Analytics
- **Auth**: NextAuth v5 beta with Prisma adapter
- **Email**: React Email + Resend
- **AI**: Vercel AI SDK (OpenAI + Google) for blog generation

## Blog Auto-Generation

Cron job at `/api/cron/blog` runs Tue/Thu/Sat at 9AM UTC. Generates blog posts using AI with Pexels images (AI Judge evaluates suitability). See `apps/web/app/actions/blog.ts`.

## Known Issues

- `pnpm --filter web lint` fails with "Invalid project directory" - run lint from within `apps/web` directory instead
- FontAwesome Pro (9 packages) adds ~300-500KB to bundle - this is intentional, do not replace

## GitHub CLI

Use `gh` CLI when referencing GitHub repos that I own or public repos (e.g., `gh repo view`, `gh issue list`, `gh pr list`).
