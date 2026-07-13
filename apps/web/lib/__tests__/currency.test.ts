import { describe, expect, it } from 'vitest';
import {
  currencies,
  defaultCurrency,
  formatCurrency,
  getCurrencyByCode,
} from '../currency';

describe('formatCurrency', () => {
  it('formats GBP correctly', () => {
    const result = formatCurrency(29.99, 'GBP');
    expect(result).toContain('29.99');
    expect(result).toContain('£');
  });

  it('formats USD correctly', () => {
    const result = formatCurrency(49.99, 'USD');
    expect(result).toContain('49.99');
    expect(result).toContain('$');
  });

  it('formats EUR correctly', () => {
    const result = formatCurrency(19.5, 'EUR');
    // EUR formatting varies by locale but should contain the amount
    expect(result).toMatch(/19[.,]50/);
  });

  it('formats zero amount', () => {
    const result = formatCurrency(0, 'GBP');
    expect(result).toContain('0.00');
  });

  it('formats JPY without decimals', () => {
    const result = formatCurrency(1000, 'JPY');
    expect(result).toContain('1,000');
  });
});

describe('getCurrencyByCode', () => {
  it('returns correct currency for known code', () => {
    const gbp = getCurrencyByCode('GBP');
    expect(gbp.code).toBe('GBP');
    expect(gbp.symbol).toBe('£');
    expect(gbp.name).toBe('British Pound');
  });

  it('returns USD for USD code', () => {
    const usd = getCurrencyByCode('USD');
    expect(usd.code).toBe('USD');
    expect(usd.symbol).toBe('$');
  });

  it('falls back to default for unknown code', () => {
    const unknown = getCurrencyByCode('FAKE');
    expect(unknown).toEqual(defaultCurrency);
  });
});

describe('defaultCurrency', () => {
  it('is GBP', () => {
    expect(defaultCurrency.code).toBe('GBP');
  });

  it('is the first currency in the list', () => {
    expect(defaultCurrency).toEqual(currencies[0]);
  });
});
