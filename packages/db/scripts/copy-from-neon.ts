import {
  closeSync,
  openSync,
  readdirSync,
  readFileSync,
  rmSync,
  statSync,
  writeFileSync,
  writeSync,
} from 'node:fs';
import { join } from 'node:path';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import Database from 'better-sqlite3';
import { PrismaClient } from '../src/generated/prisma-node/client';
import {
  copyDirectory,
  createData,
  dbDirectory,
  delegate,
  differences,
  fail,
  identity,
  keys,
  loadModels,
  type Model,
  openSource,
  pageSize,
  preparePrivateDirectory,
  quote,
  type Row,
  reportError,
  rowKey,
  selfFields,
  sqlValue,
  table,
} from './migration-utils';

async function main() {
  preparePrivateDirectory();
  const models = await loadModels();
  const sqliteFile = join(copyDirectory, 'am.sqlite');
  for (const suffix of ['', '-wal', '-shm'])
    rmSync(sqliteFile + suffix, { force: true });
  // Never leave an old cutover export looking like a successful new copy.
  rmSync(join(copyDirectory, 'load.sql'), { force: true });
  const raw = new Database(sqliteFile);
  try {
    raw.pragma('foreign_keys = ON');
    for (const file of readdirSync(join(dbDirectory, 'migrations'))
      .filter((f) => f.endsWith('.sql'))
      .sort()) {
      raw.exec(readFileSync(join(dbDirectory, 'migrations', file), 'utf8'));
    }
  } finally {
    raw.close();
  }
  const target = new PrismaClient({
    adapter: new PrismaBetterSqlite3({ url: `file:${sqliteFile}` }),
    log: [],
    errorFormat: 'minimal',
  });
  const source = openSource();
  const counts: { table: string; source: number; sqlite: number }[] = [];
  const pending: { model: Model; row: Row }[] = [];
  let phase = 'opening source snapshot';
  try {
    // All source calls below are SELECTs in one consistent, read-only snapshot.
    await source.$transaction(
      async (snapshot) => {
        const [mode] = await snapshot.$queryRawUnsafe<{ read_only: string }[]>(
          "SELECT current_setting('transaction_read_only') AS read_only",
        );
        if (mode?.read_only !== 'on')
          fail('Source transaction is not read-only');
        for (const model of models) {
          phase = `copy ${table(model)}`;
          const from = delegate(snapshot, model);
          const to = delegate(target, model);
          const count = await from.count();
          const self = selfFields(model);
          for (let skip = 0; skip < count; skip += pageSize) {
            const rows = await from.findMany({
              skip,
              take: pageSize,
              orderBy: keys(model).map((k) => ({ [k]: 'asc' })),
            });
            if (!rows.length) fail(`Unexpected empty page: ${table(model)}`);
            const data = rows.map((row) => {
              const data = createData(model, row);
              for (const field of self) data[field] = null;
              if (self.some((field) => row[field] !== null))
                pending.push({ model, row });
              return data;
            });
            await to.createMany({ data });
            // Verify every copied scalar, not just the later random sample.
            const copied = await to.findMany({
              where: { OR: rows.map((row) => identity(model, row)) },
            });
            const byKey = new Map(
              copied.map((row) => [rowKey(model, row), row]),
            );
            for (const row of rows) {
              const result = byKey.get(rowKey(model, row));
              if (!result) fail(`Missing copied row: ${table(model)}`);
              const fields = differences(model, row, result, false, self);
              if (fields.length)
                fail(
                  `Round-trip mismatch: ${table(model)} [${fields.join(', ')}]`,
                );
            }
          }
          const sqlite = await to.count();
          counts.push({ table: table(model), source: count, sqlite });
          if (sqlite !== count) fail(`Count mismatch: ${table(model)}`);
        }
      },
      { isolationLevel: 'RepeatableRead', timeout: 900000, maxWait: 30000 },
    );
    for (const { model, row } of pending) {
      phase = `restore self FK ${table(model)}`;
      // Explicit updatedAt prevents Prisma @updatedAt from changing history.
      const data = Object.fromEntries(
        model.fields
          .filter((f) => selfFields(model).includes(f.name) || f.isUpdatedAt)
          .map((f) => [f.name, row[f.name]]),
      );
      const to = delegate(target, model);
      await to.updateMany({ where: identity(model, row), data });
      const [copied] = await to.findMany({ where: identity(model, row) });
      if (!copied || differences(model, row, copied).length)
        fail(`Self-FK round-trip mismatch: ${table(model)}`);
    }
  } catch (error) {
    console.error(`Copy phase: ${phase}`);
    throw error;
  } finally {
    await Promise.all([source.$disconnect(), target.$disconnect()]);
  }
  const sqlite = new Database(sqliteFile, { readonly: true });
  sqlite.defaultSafeIntegers(true);
  try {
    if ((sqlite.pragma('foreign_key_check') as Row[]).length)
      fail('SQLite foreign_key_check failed');
    if (sqlite.pragma('integrity_check', { simple: true }) !== 'ok')
      fail('SQLite integrity_check failed');
    // Export SQLite's stored representation, never hand-convert Prisma formats.
    const fd = openSync(join(copyDirectory, 'load.sql'), 'w', 0o600);
    try {
      writeSync(fd, 'PRAGMA defer_foreign_keys = true;\n');
      for (const model of [...models].reverse())
        writeSync(fd, `DELETE FROM ${quote(table(model))};\n`);
      for (const model of models) {
        const rows = sqlite
          .prepare(`SELECT * FROM ${quote(table(model))}`)
          .all() as Row[];
        // Emit self-referencing rows in parent-first order, including multiple
        // generations. Dangling references and cycles fail rather than loop.
        const self = selfFields(model);
        const relations = model.fields.filter(
          (f) => f.type === model.name && f.relationFromFields?.length,
        );
        const emitted = new Set<string>();
        const remaining = [...rows];
        while (remaining.length) {
          const index = remaining.findIndex((row) =>
            relations.every((r) => {
              const names = r.relationFromFields ?? [];
              if (names.every((n) => row[n] === null)) return true;
              const parent = Object.fromEntries(
                names.map((n, i) => [r.relationToFields?.[i] ?? '', row[n]]),
              );
              return emitted.has(rowKey(model, parent));
            }),
          );
          if (index < 0)
            fail(
              `Self-reference cycle in SQL export: ${table(model)} [${self.join(', ')}]`,
            );
          const [row] = remaining.splice(index, 1);
          const columns = Object.keys(row);
          writeSync(
            fd,
            `INSERT INTO ${quote(table(model))} (${columns.map(quote).join(',')}) VALUES (${columns.map((c) => sqlValue(row[c])).join(',')});\n`,
          );
          emitted.add(rowKey(model, row));
        }
      }
    } finally {
      closeSync(fd);
    }
  } finally {
    sqlite.close();
  }
  console.table(counts);
  console.info(
    `All ${models.length} tables and every scalar round-trip passed; ${pending.length} self references restored.`,
  );
  console.info(
    `load.sql: ${statSync(join(copyDirectory, 'load.sql')).size} bytes`,
  );
  const report = {
    counts,
    bytes: statSync(join(copyDirectory, 'load.sql')).size,
    fields: Object.fromEntries(
      ['Decimal', 'BigInt', 'Bytes', 'DateTime', 'Json'].map((type) => [
        type,
        models.flatMap((m) =>
          m.fields
            .filter((f) => f.type === type)
            .map((f) => `${m.name}.${f.name}`),
        ),
      ]),
    ),
  };
  writeFileSync(
    join(copyDirectory, 'copy-report.json'),
    JSON.stringify(report, null, 2),
  );
}
main().catch(reportError);
