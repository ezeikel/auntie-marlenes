import { spawnSync } from 'node:child_process';
import {
  mkdtempSync,
  readFileSync,
  readdirSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import { fileURLToPath } from 'node:url';

const cwd = fileURLToPath(new URL('..', import.meta.url));
const state = mkdtempSync(join(tmpdir(), 'am-drift-'));
const run = (args, env = process.env) => {
  const result = spawnSync('pnpm', ['exec', ...args], {
    cwd,
    env,
    stdio: 'inherit',
  });
  if (result.error) throw result.error;
  return result.status ?? 1;
};
let exitCode = 1;
try {
  const migrationCode = run([
    'wrangler',
    'd1',
    'migrations',
    'apply',
    'auntie-marlenes',
    '--local',
    '--persist-to',
    state,
  ]);
  if (migrationCode !== 0) throw new Error('Local D1 migration replay failed');
  const directory = join(state, 'v3/d1/miniflare-D1DatabaseObject');
  const files = readdirSync(directory).filter(
    (name) => name.endsWith('.sqlite') && name !== 'metadata.sqlite',
  );
  if (files.length !== 1)
    throw new Error(`Expected one D1 SQLite file, found ${files.length}`);
  const databasePath = join(directory, files[0]);
  const database = new DatabaseSync(databasePath);
  // Exclude only Wrangler/Miniflare bookkeeping from this disposable database.
  // All application tables, indexes, defaults and foreign keys remain intact.
  database.exec('DROP TABLE d1_migrations; DROP TABLE _cf_METADATA;');
  database.close();
  // Prisma 7.8 introspects quoted JSON literals as @default("[]"), but
  // schema-to-SQL generation needs dbgenerated("'[]'") to quote them correctly.
  // Compare their equivalent literal form in a temporary schema; do not ignore
  // these columns or their defaults (a changed JSON value must still fail).
  const schema = readFileSync(join(cwd, 'prisma/schema.prisma'), 'utf8');
  const comparisonSchema = join(state, 'schema.prisma');
  writeFileSync(
    comparisonSchema,
    schema.replace(
      /(@default\()dbgenerated\(("(?:[^"\\]|\\.)*")\)(\))/g,
      (match, prefix, encoded, suffix) => {
        const sql = JSON.parse(encoded);
        if (!sql.startsWith("'") || !sql.endsWith("'")) return match;
        const literal = sql.slice(1, -1).replaceAll("''", "'");
        try {
          const value = JSON.parse(literal);
          if (
            !Array.isArray(value) &&
            (typeof value !== 'object' || value === null)
          )
            return match;
          return `${prefix}${JSON.stringify(literal)}${suffix}`;
        } catch {
          return match;
        }
      },
    ),
  );
  exitCode = run(
    [
      'prisma',
      'migrate',
      'diff',
      '--config',
      'prisma.drift.config.ts',
      '--from-config-datasource',
      '--to-schema',
      comparisonSchema,
      '--exit-code',
    ],
    { ...process.env, D1_DRIFT_DATABASE_URL: `file:${databasePath}` },
  );
  if (exitCode === 2) {
    console.error(
      '::error::Drift detected between schema.prisma and migrations/',
    );
    console.error(
      'schema.prisma no longer matches what applying migrations/ to fresh local D1 would produce.',
    );
    console.error('Either:');
    console.error(
      '  • schema.prisma was edited without generating a numbered D1 migration with prisma migrate diff, or',
    );
    console.error(
      "  • a migration was hand-written with SQL that doesn't match.",
    );
    console.error(
      'Fix: in packages/db, use the last-applied schema and prisma migrate diff --script --output migrations/<next-number>_<name>.sql, then replay locally.',
    );
    console.error(
      'NEVER hand-write migration SQL (see AGENTS.md and packages/db/README.md).',
    );
    exitCode = 1;
  } else if (exitCode === 0) {
    console.log('✓ schema.prisma and migrations/ are in sync');
  } else {
    console.error(
      `::error::prisma migrate diff failed with exit code ${exitCode}`,
    );
  }
} finally {
  rmSync(state, { recursive: true, force: true });
}
process.exitCode = exitCode;
