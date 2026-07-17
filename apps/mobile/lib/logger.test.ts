import { afterEach, describe, expect, it, vi } from 'vitest';
import { debug, error, info, warn } from './logger';

describe('logger', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('suppresses debug output outside dev builds', () => {
    vi.stubGlobal('__DEV__', false);
    const spy = vi.spyOn(console, 'debug').mockImplementation(() => undefined);
    debug('hidden');
    expect(spy).not.toHaveBeenCalled();
  });

  it('emits debug output in dev builds', () => {
    vi.stubGlobal('__DEV__', true);
    const spy = vi.spyOn(console, 'debug').mockImplementation(() => undefined);
    debug('visible', { a: 1 });
    expect(spy).toHaveBeenCalledWith('visible', { a: 1 });
  });

  it('always emits info, warn and error regardless of __DEV__', () => {
    vi.stubGlobal('__DEV__', false);
    const infoSpy = vi
      .spyOn(console, 'info')
      .mockImplementation(() => undefined);
    const warnSpy = vi
      .spyOn(console, 'warn')
      .mockImplementation(() => undefined);
    const errorSpy = vi
      .spyOn(console, 'error')
      .mockImplementation(() => undefined);

    info('i');
    warn('w');
    error('e');

    expect(infoSpy).toHaveBeenCalledWith('i');
    expect(warnSpy).toHaveBeenCalledWith('w');
    expect(errorSpy).toHaveBeenCalledWith('e');
  });
});
