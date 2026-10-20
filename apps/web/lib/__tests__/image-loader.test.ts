import { describe, expect, it } from 'vitest';
import imageLoader from '../image-loader';

describe('source CDN images', () => {
  it('resizes Shopify while preserving version and crop', () => {
    const url = new URL(
      imageLoader({
        src: 'https://cdn.shopify.com/a.png?v=2&crop=center',
        width: 640,
      }),
    );
    expect(url.searchParams.get('width')).toBe('640');
    expect(url.searchParams.get('v')).toBe('2');
    expect(url.searchParams.get('crop')).toBe('center');
  });
  it('resizes Sanity and negotiates formats', () => {
    const url = new URL(
      imageLoader({
        src: 'https://cdn.sanity.io/a.png?fit=crop',
        width: 800,
        quality: 80,
      }),
    );
    expect(Object.fromEntries(url.searchParams)).toEqual({
      fit: 'crop',
      w: '800',
      q: '80',
      auto: 'format',
    });
  });
  it.each([
    '/images/a.png',
    'https://images.pexels.com/a.jpeg',
    'https://cdn.shopify.com.evil.test/a.png',
  ])('leaves %s unchanged', (src) => {
    expect(imageLoader({ src, width: 640 })).toBe(src);
  });
});
