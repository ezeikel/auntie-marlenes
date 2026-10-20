import type { D1Database } from '@cloudflare/workers-types';
import { getCloudflareContext } from '@opennextjs/cloudflare';
import { PrismaD1 } from '@prisma/adapter-d1';
import { PrismaClient } from './generated/prisma/client';

declare global {
  interface CloudflareEnv {
    DB: D1Database;
  }
}

type D1BindingGetter = () => D1Database | undefined;

const defaultBindingGetter: D1BindingGetter = () =>
  getCloudflareContext().env.DB;
let bindingGetter = defaultBindingGetter;
const clients = new WeakMap<D1Database, PrismaClient>();

/** Inject a local/test binding getter, or reset to the request's OpenNext context. */
export function setD1BindingGetter(
  getter: D1BindingGetter = defaultBindingGetter,
) {
  bindingGetter = getter;
}

export function isDatabaseConfigured(): boolean {
  try {
    return Boolean(bindingGetter());
  } catch {
    // Outside a Worker request (e.g. at build time) there is no context.
    return false;
  }
}

/** Reuse a client for this binding without retaining bindings after their lifetime. */
export function getDb(): PrismaClient {
  const binding = bindingGetter();
  if (!binding) {
    throw new Error('D1 binding DB is not configured');
  }
  let client = clients.get(binding);
  if (!client) {
    client = new PrismaClient({ adapter: new PrismaD1(binding) });
    clients.set(binding, client);
  }
  return client;
}

/** Lazy proxy preserves PrismaAdapter(db) and never resolves a binding on import. */
export const db: PrismaClient = new Proxy({} as PrismaClient, {
  get(_target, prop) {
    const client = getDb();
    const value = Reflect.get(client, prop, client);
    return typeof value === 'function' ? value.bind(client) : value;
  },
});

export type { Prisma, User as DbUserType } from './generated/prisma/client';
