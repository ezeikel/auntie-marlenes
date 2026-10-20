import { writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import {
  column,
  copyDirectory,
  delegate,
  differences,
  fail,
  identity,
  keys,
  loadModels,
  openSource,
  preparePrivateDirectory,
  quote,
  type Row,
  reportError,
  scalars,
  sqlValue,
  table,
  wranglerJson,
} from './migration-utils';

async function main() {
  preparePrivateDirectory();
  const args = process.argv.slice(2).filter((a) => a !== '--');
  if (
    args.length !== 2 ||
    args[0] !== '--target' ||
    !(
      args[1] === 'remote' ||
      (args[1].startsWith('local:') && args[1].length > 6)
    )
  ) {
    fail('Usage: db:parity -- --target local:<persist-dir>|remote');
  }
  const target =
    args[1] === 'remote' ? 'remote' : `local:${resolve(args[1].slice(6))}`;
  const models = await loadModels();
  const source = openSource();
  const samples = new Map<string, { count: number; rows: Row[] }>();
  try {
    // Take counts and random identities in one read-only consistent snapshot,
    // disconnect before starting Wrangler, and never log identity/token values.
    await source.$transaction(
      async (snapshot) => {
        const [mode] = await snapshot.$queryRawUnsafe<{ read_only: string }[]>(
          "SELECT current_setting('transaction_read_only') AS read_only",
        );
        if (mode?.read_only !== 'on')
          fail('Source transaction is not read-only');
        for (const model of models) {
          const from = delegate(snapshot, model);
          const count = await from.count();
          const selected = await snapshot.$queryRawUnsafe<Row[]>(
            `SELECT ${keys(model)
              .map((k) =>
                quote(column(scalars(model).find((f) => f.name === k)!)),
              )
              .join(
                ',',
              )} FROM ${quote(table(model))} ORDER BY random() LIMIT 20`,
          );
          const rows = selected.length
            ? await from.findMany({
                where: { OR: selected.map((row) => identity(model, row)) },
              })
            : [];
          if (rows.length !== Math.min(20, count))
            fail(`Source sample count incomplete: ${table(model)}`);
          samples.set(model.name, { count, rows });
        }
      },
      { isolationLevel: 'RepeatableRead', timeout: 300000, maxWait: 30000 },
    );
  } finally {
    await source.$disconnect();
  }
  const report: {
    table: string;
    neon: number;
    target: number;
    sampled: number;
    mismatches: number;
    result: string;
  }[] = [];
  // Batch SELECTs to avoid starting one local Wrangler server per table. Each
  // model gets two result sets: count, then the precise sampled identities.
  for (let offset = 0; offset < models.length; offset += 5) {
    const batch = models.slice(offset, offset + 5);
    const statements = batch.flatMap((model) => {
      const sample = samples.get(model.name)!;
      const where =
        sample.rows
          .map(
            (row) =>
              `(${Object.entries(identity(model, row))
                .map(
                  ([name, value]) =>
                    `${quote(column(scalars(model).find((f) => f.name === name)!))} = ${sqlValue(value)}`,
                )
                .join(' AND ')})`,
          )
          .join(' OR ') || '0';
      const projection = scalars(model)
        .map((f) => {
          const name = quote(column(f));
          if (f.type === 'BigInt' || f.type === 'Decimal')
            return `CAST(${name} AS TEXT) AS ${name}`;
          if (f.type === 'Bytes')
            return `CASE WHEN ${name} IS NULL THEN NULL ELSE hex(${name}) END AS ${name}`;
          return name;
        })
        .join(',');
      return [
        `SELECT count(*) AS count FROM ${quote(table(model))};`,
        `SELECT ${projection} FROM ${quote(table(model))} WHERE ${where};`,
      ];
    });
    const results = wranglerJson(statements.join('\n'), target);
    if (results.length !== batch.length * 2)
      fail('Wrangler result set count incomplete');
    batch.forEach((model, index) => {
      const sample = samples.get(model.name)!;
      const count = Number(results[index * 2][0]?.count);
      const rows = results[index * 2 + 1];
      let mismatches = 0;
      if (rows.length !== sample.rows.length) mismatches++;
      for (const expected of sample.rows) {
        const found = rows.find((row) =>
          keys(model).every(
            (k) =>
              row[column(scalars(model).find((f) => f.name === k)!)] ===
              expected[k],
          ),
        );
        if (!found) {
          mismatches++;
          continue;
        }
        const fields = differences(model, expected, found, true);
        if (fields.length) {
          mismatches++;
          console.error(
            `Field mismatch: ${table(model)} [${fields.join(', ')}]`,
          );
        }
      }
      report.push({
        table: table(model),
        neon: sample.count,
        target: count,
        sampled: sample.rows.length,
        mismatches,
        result: sample.count === count && !mismatches ? 'PASS' : 'FAIL',
      });
    });
  }
  console.table(report);
  writeFileSync(
    join(copyDirectory, 'parity-report.json'),
    JSON.stringify({ target, report }, null, 2),
  );
  if (report.some((row) => row.result !== 'PASS'))
    fail('Parity mismatch; STOP migration per tracker');
  console.info(
    `PASS: ${models.length} table counts; ${report.reduce((sum, r) => sum + r.sampled, 0)} random rows; every scalar field.`,
  );
}
main().catch(reportError);
