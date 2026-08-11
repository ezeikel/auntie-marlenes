import { describe, expect, it } from 'vitest';
import { BlogRunState } from './run-state';

describe('BlogRunState', () => {
  it('prevents overlap and records the published slug', () => {
    const state = new BlogRunState();
    expect(state.begin(new Date('2026-08-11T09:00:00Z'))).toBe(true);
    expect(state.begin()).toBe(false);
    state.succeed('source-checked-wash-day', new Date('2026-08-11T09:03:00Z'));
    expect(state.read()).toMatchObject({
      status: 'succeeded',
      lastSlug: 'source-checked-wash-day',
    });
  });
});
