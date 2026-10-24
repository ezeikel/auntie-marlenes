import { describe, expect, it } from 'vitest';
import { isValidEmail } from '../email-format';

describe('isValidEmail', () => {
  it('accepts a normal address with a plus tag and a multi-part domain', () => {
    expect(isValidEmail('a.b+tag@example.co.uk')).toBe(true);
  });

  it.each([
    'ben..x@gmail.com',
    'x@email',
    '.a@b.com',
    'a.@b.com',
    'a@b',
    'a b@c.com',
  ])('rejects %s', (value) => {
    expect(isValidEmail(value)).toBe(false);
  });
});
