import { describe, expect, it } from 'vitest';
import { pickNextProduct, recordPost, type ScheduleState } from './schedule';

const state = (
  currentCycle: number,
  posts: Array<{ handle: string; cycle: number }>,
): ScheduleState => ({
  currentCycle,
  posts: posts.map((p) => ({
    handle: p.handle,
    cycle: p.cycle,
    postedAt: '2026-01-01T00:00:00.000Z',
    platforms: ['instagram'],
  })),
});

describe('pickNextProduct', () => {
  it('returns null when there are no products', () => {
    expect(pickNextProduct([], state(1, []))).toBeNull();
  });

  it('picks the first product on a fresh schedule', () => {
    expect(pickNextProduct(['a', 'b', 'c'], state(1, []))).toEqual({
      handle: 'a',
      startNewCycle: false,
    });
  });

  it('picks the first handle not yet posted this cycle, in catalog order', () => {
    const s = state(1, [
      { handle: 'a', cycle: 1 },
      { handle: 'c', cycle: 1 },
    ]);
    expect(pickNextProduct(['a', 'b', 'c'], s)).toEqual({
      handle: 'b',
      startNewCycle: false,
    });
  });

  it('ignores posts from previous cycles', () => {
    const s = state(2, [
      { handle: 'a', cycle: 1 },
      { handle: 'b', cycle: 1 },
    ]);
    expect(pickNextProduct(['a', 'b'], s)).toEqual({
      handle: 'a',
      startNewCycle: false,
    });
  });

  it('wraps to the first product and flags a new cycle when all are posted', () => {
    const s = state(1, [
      { handle: 'a', cycle: 1 },
      { handle: 'b', cycle: 1 },
    ]);
    expect(pickNextProduct(['a', 'b'], s)).toEqual({
      handle: 'a',
      startNewCycle: true,
    });
  });
});

describe('recordPost', () => {
  it('appends a post for the current cycle without mutating the input', () => {
    const before = state(3, [{ handle: 'a', cycle: 3 }]);
    const after = recordPost(before, 'b', {
      postUrl: 'https://example.com/post',
      platforms: ['instagram', 'facebook'],
    });

    expect(before.posts).toHaveLength(1);
    expect(after.posts).toHaveLength(2);
    expect(after.currentCycle).toBe(3);

    const added = after.posts[1];
    expect(added.handle).toBe('b');
    expect(added.cycle).toBe(3);
    expect(added.postUrl).toBe('https://example.com/post');
    expect(added.platforms).toEqual(['instagram', 'facebook']);
    // postedAt is a parseable ISO timestamp
    expect(Number.isNaN(Date.parse(added.postedAt))).toBe(false);
  });

  it('feeds pickNextProduct so the rotation advances', () => {
    let s = state(1, []);
    const handles = ['a', 'b'];

    const first = pickNextProduct(handles, s);
    expect(first?.handle).toBe('a');
    s = recordPost(s, 'a', { platforms: ['instagram'] });

    const second = pickNextProduct(handles, s);
    expect(second?.handle).toBe('b');
    s = recordPost(s, 'b', { platforms: ['instagram'] });

    expect(pickNextProduct(handles, s)).toEqual({
      handle: 'a',
      startNewCycle: true,
    });
  });
});
