import { describe, expect, it } from 'vitest';
import { isFilePathFormPost } from '../probe-request';

describe('file-path form POST probes', () => {
  it('matches a POST to a file-like path that falls through to a page', () => {
    expect(isFilePathFormPost('POST', '/RSC/abc123.txt')).toBe(true);
    expect(isFilePathFormPost('post', '/upload.php')).toBe(true);
    expect(isFilePathFormPost('POST', '/fr/wp-content/shell.PHP')).toBe(true);
    expect(isFilePathFormPost('POST', '/robots.txt')).toBe(true);
  });

  it('leaves server-action POSTs to real pages alone', () => {
    for (const path of [
      '/',
      '/fr',
      '/hair-care',
      '/de/product/shea-butter-curl-cream',
      '/blog/protective-styles-guide',
      '/contact',
      '/bag',
    ]) {
      expect(isFilePathFormPost('POST', path)).toBe(false);
    }
  });

  it('leaves API routes and the analytics proxies alone', () => {
    expect(isFilePathFormPost('POST', '/api/webhooks/shopify')).toBe(false);
    expect(isFilePathFormPost('POST', '/api/upload/file.json')).toBe(false);
    expect(isFilePathFormPost('POST', '/m/api/send')).toBe(false);
    expect(isFilePathFormPost('POST', '/relay-hyx5/e/')).toBe(false);
    expect(isFilePathFormPost('POST', '/relay-hyx5/static/array.js')).toBe(
      false,
    );
  });

  it('never matches another method or a dot outside the last segment', () => {
    expect(isFilePathFormPost('GET', '/robots.txt')).toBe(false);
    expect(isFilePathFormPost('HEAD', '/sitemap.xml')).toBe(false);
    expect(isFilePathFormPost('OPTIONS', '/RSC/abc123.txt')).toBe(false);
    expect(isFilePathFormPost('POST', '/v1.2/hair-care')).toBe(false);
  });
});
