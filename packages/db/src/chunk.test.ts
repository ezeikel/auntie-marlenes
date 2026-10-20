import { describe, expect, it } from 'vitest';
import { chunkForD1 } from './chunk';

describe('D1 statement parameter budget', () => {
  it('splits 100 saved items using all four inserted columns including defaults', () => {
    const rows = Array.from({ length: 100 }, (_, productId) => ({
      userId: 'synthetic',
      productId: String(productId),
    }));
    const chunks = chunkForD1(rows, 4);
    expect(chunks.map((chunk) => chunk.length)).toEqual([24, 24, 24, 24, 4]);
    expect(chunks.flat()).toEqual(rows);
    for (const chunk of chunks) expect(chunk.length * 4).toBeLessThan(100);
  });

  it('reserves the userId parameter for IN lookups', () => {
    const rows = Array.from({ length: 100 }, (_, id) => id);
    const chunks = chunkForD1(rows, 1, 1);
    expect(chunks.map((chunk) => chunk.length)).toEqual([98, 2]);
    expect(chunks.flat()).toEqual(rows);
    for (const chunk of chunks) expect(chunk.length + 1).toBeLessThan(100);
    expect(chunkForD1([], 4)).toEqual([]);
  });

  it('rejects invalid budgets instead of looping or exceeding the limit', () => {
    for (const columns of [0, -1, 0.5, 100, NaN, Infinity]) {
      expect(() => chunkForD1([1], columns)).toThrow(RangeError);
    }
    for (const reserved of [-1, 0.5, 96, NaN, Infinity]) {
      expect(() => chunkForD1([1], 4, reserved)).toThrow(RangeError);
    }
  });
});
