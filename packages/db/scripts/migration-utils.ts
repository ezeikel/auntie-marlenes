import { spawnSync } from 'node:child_process';
import {
  chmodSync,
  mkdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { isDeepStrictEqual, parseEnv } from 'node:util';
import { PrismaPg } from '@prisma/adapter-pg';
import internals from '@prisma/internals';

import { PrismaClient as PgClient } from '../.copy/pg-client/client';
import { Prisma } from '../src/generated/prisma-node/client';

const { getDMMF } = internals;

export const dbDirectory = fileURLToPath(new URL('..', import.meta.url));
export const copyDirectory = join(dbDirectory, '.copy');
export const pageSize = 500;
export type Row = Record<string, unknown>;
export type Model = Awaited<
  ReturnType<typeof getDMMF>
>['datamodel']['models'][number];
export type Field = Model['fields'][number];
// The delegates share this small API across separately generated clients. Keep
// untyped dispatch here rather than weakening the application clients' types.
export interface Delegate {
  count(): Promise<number>;
  findMany(args?: Record<string, unknown>): Promise<Row[]>;
  createMany(args: { data: Row[] }): Promise<unknown>;
  updateMany(args: { where: Row; data: Row }): Promise<unknown>;
}
export function delegate(client: unknown, model: Model): Delegate {
  const name = model.name[0].toLowerCase() + model.name.slice(1);
  return (client as Record<string, Delegate>)[name];
}
export class MigrationError extends Error {}
export function fail(message: string): never {
  throw new MigrationError(message);
}
export function reportError(error: unknown) {
  // Prisma validation and connection errors can embed credentials or row data.
  // Never print arbitrary provider errors, query parameters, PKs or auth tokens.
  const safe =
    error instanceof MigrationError
      ? error.message
      : `${error instanceof Error ? error.name : 'Unknown error'}${typeof error === 'object' && error && 'code' in error ? ` (${String(error.code)})` : ''}; provider details withheld`;
  console.error(`FAILED: ${safe}`);
  process.exitCode = 1;
}
export function preparePrivateDirectory() {
  process.umask(0o077);
  mkdirSync(copyDirectory, { recursive: true, mode: 0o700 });
  chmodSync(copyDirectory, 0o700);
}
export async function loadModels() {
  const [source, target] = await Promise.all([
    getDMMF({
      datamodel: readFileSync(
        join(dbDirectory, 'scripts/pg-schema.prisma'),
        'utf8',
      ),
    }),
    getDMMF({
      datamodel: readFileSync(
        join(dbDirectory, 'prisma/schema.prisma'),
        'utf8',
      ),
    }),
  ]);
  const models = target.datamodel.models;
  if (source.datamodel.models.length !== models.length)
    fail('Source/target model counts differ');
  for (const model of models) {
    const old = source.datamodel.models.find((m) => m.name === model.name);
    if (!old || old.dbName !== model.dbName)
      fail(`Schema table mismatch: ${model.name}`);
    const fields = scalars(model);
    if (scalars(old).length !== fields.length)
      fail(`Schema column count mismatch: ${model.name}`);
    for (const field of fields) {
      const previous = scalars(old).find((f) => f.name === field.name);
      if (
        !previous ||
        previous.dbName !== field.dbName ||
        previous.type !== field.type ||
        previous.isList !== field.isList
      ) {
        fail(`Schema field mismatch: ${model.name}.${field.name}`);
      }
    }
    keys(model); // Ensure each table has a stable primary or unique key offline.
  }
  // Kahn's algorithm includes every model; nullable self FKs use a second pass.
  const ordered: Model[] = [];
  const remaining = [...models];
  while (remaining.length) {
    const index = remaining.findIndex((m) =>
      m.fields
        .filter(
          (f) =>
            f.kind === 'object' &&
            f.relationFromFields?.length &&
            f.type !== m.name,
        )
        .every((f) => ordered.some((done) => done.name === f.type)),
    );
    if (index === -1)
      fail('Cross-table FK cycle: add an explicit nullable-FK second pass');
    const [model] = remaining.splice(index, 1);
    for (const name of selfFields(model)) {
      if (model.fields.find((f) => f.name === name)?.isRequired)
        fail(`Required self FK: ${model.name}.${name}`);
    }
    ordered.push(model);
  }
  return ordered;
}
export function scalars(model: Model) {
  return model.fields.filter((f) => f.kind !== 'object');
}
export function table(model: Model) {
  return model.dbName ?? model.name;
}
export function column(field: Field) {
  return field.dbName ?? field.name;
}
export function quote(name: string) {
  return `"${name.replaceAll('"', '""')}"`;
}
export function keys(model: Model): string[] {
  const primary =
    model.primaryKey?.fields ??
    model.fields.filter((f) => f.isId).map((f) => f.name);
  if (primary.length) return [...primary];
  // NextAuth VerificationToken has no PK: token is a non-null unique identity.
  const unique = model.fields.find((f) => f.isUnique && f.isRequired);
  if (unique) return [unique.name];
  if (model.uniqueFields[0]?.length) return [...model.uniqueFields[0]];
  return fail(`No unique identity: ${model.name}`);
}
export function identity(model: Model, row: Row) {
  return Object.fromEntries(keys(model).map((k) => [k, row[k]]));
}
export function rowKey(model: Model, row: Row) {
  return JSON.stringify(identity(model, row));
}
export function selfFields(model: Model) {
  return model.fields
    .filter((f) => f.kind === 'object' && f.type === model.name)
    .flatMap((f) => f.relationFromFields ?? []);
}
export function createData(model: Model, row: Row) {
  return Object.fromEntries(
    scalars(model).map((f) => [
      f.name,
      f.type === 'Json' && row[f.name] === null ? Prisma.JsonNull : row[f.name],
    ]),
  );
}
export function normalize(field: Field, value: unknown, raw = false): unknown {
  if (value === null || value === undefined) return value;
  switch (field.type) {
    case 'DateTime':
      return new Date(value as string | number | Date).toISOString();
    case 'Json':
      return raw && typeof value === 'string' ? JSON.parse(value) : value;
    case 'Boolean':
      return value === true || value === 1 || value === 1n;
    case 'BigInt':
      return BigInt(value as string | number | bigint).toString();
    case 'Decimal':
      return new Prisma.Decimal(String(value)).toString();
    case 'Bytes':
      return raw && typeof value === 'string'
        ? value.toLowerCase()
        : Buffer.from(value as Uint8Array).toString('hex');
    default:
      return value;
  }
}
export function differences(
  model: Model,
  source: Row,
  target: Row,
  raw = false,
  omit: string[] = [],
) {
  return scalars(model)
    .filter(
      (f) =>
        !omit.includes(f.name) &&
        !isDeepStrictEqual(
          normalize(f, source[f.name]),
          normalize(f, target[raw ? column(f) : f.name], raw),
        ),
    )
    .map((f) => f.name);
}
export function openSource() {
  const envFile = join(homedir(), 'Development/docs/keys/am-neon-prod.env');
  const connectionString = parseEnv(
    readFileSync(envFile, 'utf8'),
  ).NEON_PROD_DATABASE_URL;
  if (!connectionString)
    fail('NEON_PROD_DATABASE_URL missing from the external key file');
  // Enforce read-only at connection startup, even if a future script regresses.
  // Override URL options too: pg otherwise gives connectionString precedence.
  const url = new URL(connectionString);
  url.searchParams.set('options', '-c default_transaction_read_only=on');
  return new PgClient({
    adapter: new PrismaPg({
      connectionString: url.toString(),
      max: 1,
      idleTimeoutMillis: 1000,
      connectionTimeoutMillis: 30000,
    }),
    log: [],
    errorFormat: 'minimal',
  });
}
export function sqlValue(value: unknown): string {
  if (value === null) return 'NULL';
  if (typeof value === 'string') {
    if (value.includes('\0'))
      return `CAST(X'${Buffer.from(value).toString('hex')}' AS TEXT)`;
    return `'${value.replaceAll("'", "''")}'`;
  }
  if (value instanceof Uint8Array)
    return `X'${Buffer.from(value).toString('hex')}'`;
  if (typeof value === 'bigint') return value.toString();
  if (typeof value === 'number' && Number.isFinite(value)) return String(value);
  return fail('Unsupported raw SQLite value');
}
export function wranglerJson(sql: string, target: string): Row[][] {
  const flags =
    target === 'remote'
      ? ['--remote']
      : ['--local', '--persist-to', target.slice(6)];
  const sqlFile = join(copyDirectory, 'parity-read.sql');
  writeFileSync(sqlFile, sql, { mode: 0o600 });
  const run = spawnSync(
    'pnpm',
    [
      'exec',
      'wrangler',
      'd1',
      'execute',
      'auntie-marlenes',
      ...flags,
      '--json',
      // Remote --file uses D1's import API, which returns one summary instead
      // of a result set per statement; --command returns every result set.
      ...(target === 'remote' ? ['--command', sql] : ['--file', sqlFile]),
    ],
    {
      cwd: dbDirectory,
      encoding: 'utf8',
      maxBuffer: 64 * 1024 * 1024,
      env: { ...process.env, WRANGLER_SEND_METRICS: 'false' },
    },
  );
  rmSync(sqlFile, { force: true });
  if (run.status !== 0)
    fail('Wrangler SELECT failed (output withheld to protect row data)');
  let results: { success: boolean; results: Row[] }[];
  try {
    // `--remote --file` goes through D1's import flow, which prints progress
    // lines before the JSON array. Parse from the first line that opens it.
    const start = run.stdout.search(/^\[/m);
    results = JSON.parse(start >= 0 ? run.stdout.slice(start) : run.stdout);
  } catch {
    return fail('Wrangler returned invalid JSON');
  }
  if (results.some((r) => !r.success)) fail('Wrangler SELECT unsuccessful');
  return results.map((r) => r.results);
}
