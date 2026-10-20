import { afterEach, expect, it, vi } from 'vitest';

afterEach(() => {
  vi.unstubAllGlobals();
  vi.resetModules();
});
it('does no I/O on import, memoises successful font bytes, and retries failures', async () => {
  const fetch = vi.fn();
  vi.stubGlobal('fetch', fetch);
  const { getOgFont } = await import('../og-fonts');
  expect(fetch).not.toHaveBeenCalled();
  fetch.mockRejectedValueOnce(new Error('offline'));
  await expect(getOgFont('Inter', 400)).rejects.toThrow('offline');
  fetch.mockResolvedValueOnce(
    new Response('src: url(https://fonts.test/inter.ttf)'),
  );
  fetch.mockResolvedValueOnce(new Response(new Uint8Array([1, 2, 3])));
  const a = getOgFont('Inter', 400);
  const b = getOgFont('Inter', 400);
  expect(a).toBe(b);
  expect(new Uint8Array(await a)).toEqual(new Uint8Array([1, 2, 3]));
  expect(await getOgFont('Inter', 400)).toBe(await a);
  expect(fetch).toHaveBeenCalledTimes(3);
});
