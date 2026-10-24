import Database from 'better-sqlite3';
import { describe, expect, it } from 'vitest';
import {
  differences,
  type Field,
  keys,
  loadModels,
  normalize,
  quote,
  selfFields,
  sqlValue,
} from './migration-utils';

const models = await loadModels();
const field = (type: string) => ({ type }) as Field;

describe('migration field fidelity', () => {
  it('preserves milliseconds, JSON arrays, booleans and precise scalar representations', () => {
    expect(
      normalize(field('DateTime'), '2026-10-20T12:34:56.789+00:00', true),
    ).toBe('2026-10-20T12:34:56.789Z');
    const checkout = models.find((m) => m.name === 'AbandonedCheckout')!;
    expect(
      differences(
        checkout,
        { lineItems: ['item-a', 'item-b'] },
        { lineItems: '["item-a","item-b"]' },
        true,
      ),
    ).toEqual([]);
    expect(
      differences(
        checkout,
        { lineItems: ['item-a', 'item-b'] },
        { lineItems: '["item-b","item-a"]' },
        true,
      ),
    ).toEqual(['lineItems']);
    expect(normalize(field('Boolean'), 0, true)).toBe(false);
    expect(normalize(field('Boolean'), 1, true)).toBe(true);
    expect(normalize(field('Decimal'), '1.2300')).toBe('1.23');
    expect(normalize(field('BigInt'), '9007199254740993')).toBe(
      '9007199254740993',
    );
    expect(normalize(field('Bytes'), new Uint8Array([0, 255]))).toBe('00ff');
    expect(normalize(field('Bytes'), '00FF', true)).toBe('00ff');
  });

  it('exports SQLite values including quotes, newlines, NULs, blobs and large integers', () => {
    const db = new Database(':memory:');
    db.defaultSafeIntegers(true);
    try {
      for (const value of [
        null,
        "parent's\nkit",
        'a\0b',
        Buffer.from([0, 255]),
        9007199254740993n,
        1.25,
      ]) {
        const row = db.prepare(`SELECT ${sqlValue(value)} AS value`).get() as {
          value: unknown;
        };
        expect(row.value).toEqual(value);
      }
      expect(quote('a"b')).toBe('"a""b"');
    } finally {
      db.close();
    }
  });

  it('orders every model before its FK dependants and includes all four auth tables', () => {
    expect(models).toHaveLength(8);
    expect(
      models.filter((m) =>
        ['User', 'Account', 'Session', 'VerificationToken'].includes(m.name),
      ),
    ).toHaveLength(4);
    for (const [index, model] of models.entries()) {
      for (const relation of model.fields.filter(
        (f) =>
          f.kind === 'object' &&
          f.relationFromFields?.length &&
          f.type !== model.name,
      )) {
        expect(models.findIndex((m) => m.name === relation.type)).toBeLessThan(
          index,
        );
      }
    }
    expect(keys(models.find((m) => m.name === 'VerificationToken')!)).toEqual([
      'token',
    ]);
    expect(
      models.filter((m) => selfFields(m).length).map((m) => m.name),
    ).toEqual([]);
  });
});

it('round-trips Node Prisma DateTimes, JSON arrays and auth rows through generated migrations', async () => {
  const { mkdtempSync, readFileSync, readdirSync, rmSync } = await import(
    'node:fs'
  );
  const { tmpdir } = await import('node:os');
  const { join } = await import('node:path');
  const { PrismaBetterSqlite3 } = await import(
    '@prisma/adapter-better-sqlite3'
  );
  const { PrismaClient } = await import('../src/generated/prisma-node/client');
  const { dbDirectory } = await import('./migration-utils');
  const directory = mkdtempSync(join(tmpdir(), 'am-copy-offline-'));
  const file = join(directory, 'test.sqlite');
  const raw = new Database(file);
  try {
    for (const migration of readdirSync(join(dbDirectory, 'migrations'))
      .filter((f) => f.endsWith('.sql'))
      .sort()) {
      raw.exec(
        readFileSync(join(dbDirectory, 'migrations', migration), 'utf8'),
      );
    }
  } finally {
    raw.close();
  }
  const client = new PrismaClient({
    adapter: new PrismaBetterSqlite3({ url: `file:${file}` }),
  });
  try {
    const date = new Date('2026-10-20T12:34:56.789Z');
    await client.user.createMany({
      data: [
        {
          id: 'offline-test',
          email: 'offline@example.invalid',
          createdAt: date,
          updatedAt: date,
          emailVerified: date,
        },
      ],
    });
    const user = await client.user.findUniqueOrThrow({
      where: { id: 'offline-test' },
    });
    expect(user.emailVerified).toEqual(date);
    expect(user.createdAt).toEqual(date);
    expect(user.updatedAt).toEqual(date);
    await client.session.createMany({
      data: [
        {
          id: 'session',
          sessionToken: 'synthetic',
          userId: user.id,
          expires: date,
        },
      ],
    });
    expect(
      (await client.session.findUniqueOrThrow({ where: { id: 'session' } }))
        .expires,
    ).toEqual(date);
    await client.abandonedCheckout.createMany({
      data: [
        {
          id: 'checkout',
          checkoutToken: 'synthetic-checkout',
          email: 'offline@example.invalid',
          checkoutUrl: 'https://example.invalid/checkout',
          lineItems: [{ title: "O'Neil\nTest", quantity: 2 }],
          totalPrice: '12.50',
          currency: 'GBP',
          emailSent: true,
          completedAt: date,
          createdAt: date,
          updatedAt: date,
        },
      ],
    });
    const checkout = await client.abandonedCheckout.findUniqueOrThrow({
      where: { id: 'checkout' },
    });
    expect(checkout.lineItems).toEqual([
      { title: "O'Neil\nTest", quantity: 2 },
    ]);
    expect(checkout.completedAt).toEqual(date);
    expect(checkout.updatedAt).toEqual(date);
    expect(checkout.emailSent).toBe(true);
  } finally {
    await client.$disconnect();
    rmSync(directory, { recursive: true, force: true });
  }
});
