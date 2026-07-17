import { beforeEach, describe, expect, it, vi } from 'vitest';

// In-memory AsyncStorage double — pure mobile lib logic runs in plain Node.
const { store, mockAsyncStorage } = vi.hoisted(() => {
  const store = new Map<string, string>();
  return {
    store,
    mockAsyncStorage: {
      getItem: vi.fn(async (key: string) => store.get(key) ?? null),
      setItem: vi.fn(async (key: string, value: string) => {
        store.set(key, value);
      }),
      removeItem: vi.fn(async (key: string) => {
        store.delete(key);
      }),
    },
  };
});

vi.mock('@react-native-async-storage/async-storage', () => ({
  default: mockAsyncStorage,
}));

import {
  addLocalSave,
  clearLocalSaves,
  getLocalSaves,
  isLocalSaved,
  removeLocalSave,
} from './saved';

describe('asyncStorage saved items', () => {
  beforeEach(() => {
    store.clear();
    vi.clearAllMocks();
  });

  it('returns an empty list when nothing has been saved', async () => {
    expect(await getLocalSaves()).toEqual([]);
  });

  it('adds saves and preserves insertion order', async () => {
    await addLocalSave('gid://shopify/Product/1');
    await addLocalSave('gid://shopify/Product/2');
    expect(await getLocalSaves()).toEqual([
      'gid://shopify/Product/1',
      'gid://shopify/Product/2',
    ]);
  });

  it('does not add duplicate product ids', async () => {
    await addLocalSave('p1');
    await addLocalSave('p1');
    expect(await getLocalSaves()).toEqual(['p1']);
    // Second add short-circuits before writing
    expect(mockAsyncStorage.setItem).toHaveBeenCalledTimes(1);
  });

  it('removes only the requested id', async () => {
    await addLocalSave('p1');
    await addLocalSave('p2');
    await removeLocalSave('p1');
    expect(await getLocalSaves()).toEqual(['p2']);
    expect(await isLocalSaved('p1')).toBe(false);
    expect(await isLocalSaved('p2')).toBe(true);
  });

  it('clears all saves', async () => {
    await addLocalSave('p1');
    await clearLocalSaves();
    expect(await getLocalSaves()).toEqual([]);
  });

  it('swallows storage failures and returns an empty list', async () => {
    mockAsyncStorage.getItem.mockRejectedValueOnce(new Error('disk full'));
    const consoleSpy = vi
      .spyOn(console, 'error')
      .mockImplementation(() => undefined);
    expect(await getLocalSaves()).toEqual([]);
    expect(consoleSpy).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });
});
