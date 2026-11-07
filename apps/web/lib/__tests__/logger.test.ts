import { afterEach, describe, expect, it, vi } from 'vitest';

const sentry = vi.hoisted(() => ({
  captureException: vi.fn(),
  captureMessage: vi.fn(),
  flush: vi.fn(async () => true),
  setContext: vi.fn(),
  setUser: vi.fn(),
}));
vi.mock('@sentry/nextjs', () => sentry);

import { logger } from '../logger';

const CONTEXT = Symbol.for('__cloudflare-context__');
const setContext = (value: unknown) =>
  Object.defineProperty(globalThis, CONTEXT, {
    value,
    configurable: true,
  });

afterEach(() => {
  delete (globalThis as Record<symbol, unknown>)[CONTEXT];
  vi.clearAllMocks();
  vi.restoreAllMocks();
});

describe('logger on Cloudflare Workers', () => {
  it('keeps the invocation alive until Sentry has flushed an error', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const waitUntil = vi.fn();
    setContext({ ctx: { waitUntil } });
    logger.error('Abandoned cart email failed', new Error('boom'), {
      cartId: 'c1',
    });
    expect(sentry.captureException).toHaveBeenCalledOnce();
    expect(sentry.flush).toHaveBeenCalledWith(2000);
    expect(waitUntil).toHaveBeenCalledOnce();
    expect(waitUntil.mock.calls[0]?.[0]).toBeInstanceOf(Promise);
  });

  it('does the same for a warning', () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    const waitUntil = vi.fn();
    setContext({ ctx: { waitUntil } });
    logger.warn('Restock reminder skipped');
    expect(sentry.captureMessage).toHaveBeenCalledWith(
      'Restock reminder skipped',
      expect.objectContaining({ level: 'warning' }),
    );
    expect(waitUntil).toHaveBeenCalledOnce();
  });

  it('does not flush when nothing was sent to Sentry', () => {
    vi.spyOn(console, 'info').mockImplementation(() => {});
    const waitUntil = vi.fn();
    setContext({ ctx: { waitUntil } });
    logger.info('Cron started');
    expect(sentry.flush).not.toHaveBeenCalled();
    expect(waitUntil).not.toHaveBeenCalled();
  });

  it('does not flush outside a Workers invocation (browser, Node, tests)', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    logger.error('no context', new Error('boom'));
    expect(sentry.captureException).toHaveBeenCalledOnce();
    expect(sentry.flush).not.toHaveBeenCalled();
  });
});
