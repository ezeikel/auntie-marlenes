# Auntie Marlene's database

The application client targets Cloudflare D1 through Prisma 7.8. A1 prepares the
DB layer locally; production remains on Neon until the later cutover gate. Only
`apps/web` consumes this package. Use Node 22.12+ or 24+ for the migration tools.

`src/client.ts` resolves `getCloudflareContext().env.DB` lazily, caches clients
in a WeakMap per binding, and exposes `db`, `getDb`, and `setD1BindingGetter` for
local tests. No binding is read on import, including `PrismaAdapter(db)` setup.
The application generator uses `runtime = "workerd"`; Node copy/test scripts use
the separate `prisma-node` generator. `db:generate` also generates the preserved
Postgres client to ignored `.copy/pg-client`. Run `pnpm build` after generation,
because consumers resolve compiled `dist/` exports. The build also copies the
generated workerd query-compiler JavaScript and WASM files that `tsc` does not emit.

## Development database

`next dev` uses the shared hosted D1 database **`auntie-marlenes-dev`** (a copy of production
data, made 21 October 2026), so every machine sees the same dev data. The
bindings live in `apps/web/wrangler.dev.jsonc`, which is never deployed.

- At startup the Next config runs `wrangler d1 info auntie-marlenes-dev`. If it succeeds it binds
  the hosted database (log line `[dev db] hosted auntie-marlenes-dev`). The first requests can
  fail for a few seconds while the remote connection opens.
- If it fails (offline, or wrangler not logged in) it falls back to a **local
  copy** in `packages/db/.wrangler/state` and logs why. `D1_LOCAL=1 pnpm dev` forces the local copy.
- `pnpm db:dev:pull` (repo root) refreshes the local copy from the hosted one. Run
  it before going offline. Local writes stay local and are lost on the next pull.
- Each machine needs `pnpm exec wrangler login` once (or `CLOUDFLARE_API_TOKEN`).
- Apply new migrations to production (`db:migrate:remote`), the hosted dev database
  (`pnpm db:migrate:dev`) and the local copy (`db:migrate:local`).


## Database migrations

**Never `prisma db push`. Never hand-write migration SQL.** Wrangler owns D1
migrations; Prisma generates clients and SQL diffs. The historical Postgres
migration files are archived unchanged in `prisma/migrations-postgres-archive/`.

Before editing the schema, save its last applied Git revision to a temporary
file. From `packages/db`, generate a numbered migration:

```sh
git show <last-applied-revision>:packages/db/prisma/schema.prisma > /tmp/am-before.prisma
pnpm exec prisma migrate diff --from-schema /tmp/am-before.prisma --to-schema prisma/schema.prisma --script --output migrations/0002_description.sql
pnpm db:generate
pnpm build
pnpm db:migrate:local
pnpm db:check-drift
```

For the empty baseline only, use `--from-empty` instead of `--from-schema`.
Review generated tables, columns, defaults, indexes and foreign keys before
applying. Drift checking replays every numbered migration into fresh local D1,
then compares its SQLite file with the schema; an unapplied schema edit fails.
`prisma.config.ts` has an offline dummy SQLite URL solely for generate/diff.
The Wrangler database ID is deliberately a placeholder in A1.

`db:migrate:remote` is available for the later authorized cutover/deploy workflow;
A1 never invokes it. The database workflow currently validates and checks local
drift without Cloudflare credentials. A6 must wire production migrations before
deployment behind the cutover gate. Do not deploy this intermediate card.

## Copy and parity

`scripts/pg-schema.prisma` preserves `HEAD:packages/db/prisma/schema.prisma` from
before A1; only the generator output/runtime change. The source URL is read at
runtime from `~/Development/docs/keys/am-neon-prod.env`. Never put it in command
arguments, logs, this repo or a host-only config. The source connection enforces
read-only mode and verifies a repeatable-read snapshot. All data queries are
SELECTs. Run one copy and at most one parity against production for this card.

```sh
pnpm --filter @auntie-marlenes/db db:copy-from-neon
```

The copy recreates `.copy/am.sqlite` from generated D1 migrations, copies all
seven models in FK order through separate Postgres and Node SQLite Prisma
clients, and verifies every scalar on every row. It exports SQLite's stored
representation as `.copy/load.sql`, without hand-converting dates or Json.
The SQL defers FKs, deletes app tables in reverse dependency order, then inserts
in FK order; it includes all auth tables and excludes schema/bookkeeping tables.
It has no transaction wrapper. Self-FK support is retained from the pilot.

`.copy/` is gitignored and mode 700; files are private. It contains production
auth/session data, the export and reports. Treat imported local D1 state as
private production data too. Never print raw rows or provider errors, which may
include secrets. `better-sqlite3` native install is allowed by the root
`package.json` `pnpm.onlyBuiltDependencies`; never override that list in
`pnpm-workspace.yaml`.

From `packages/db`, use a fresh absolute persist path:

```sh
pnpm exec wrangler d1 migrations apply auntie-marlenes --local --persist-to /tmp/am-copy-d1
pnpm exec wrangler d1 execute auntie-marlenes --local --persist-to /tmp/am-copy-d1 --file .copy/load.sql
pnpm db:parity -- --target local:/tmp/am-copy-d1
```

Parity takes one further read-only snapshot: every table count and up to 20
random rows per table, comparing every scalar field. Dates preserve milliseconds,
Json compares deeply and SQLite booleans normalize from integers. The unique
`VerificationToken.token` identifies that model, which has no primary key.
Neon disconnects before Wrangler reads the target. Remote parity support uses
`--command` to return each result set; remote operations belong to a later card.
Any failed parity means **stop the migration**, per the tracker.

`copy-report.json` and `parity-report.json` record counts and results without row
values. Local tests exercise field fidelity and the generated migration offline.
`chunkForD1` keeps statements below 100 parameters: saved inserts budget all four
columns (including generated id/date), and lookups reserve the userId parameter.
