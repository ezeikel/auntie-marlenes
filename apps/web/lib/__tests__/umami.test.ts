import { describe, expect, it } from 'vitest';
import {
  isUmamiCountablePath,
  readUmamiConfig,
  UMAMI_STRIPPED_HEADERS,
  umamiCampaignQuery,
  umamiPageview,
  umamiProxyTarget,
  umamiReferrer,
} from '../umami';

const ID = 'e24be54f-8d36-4d37-b2fc-a3a43bc60287';
const URL_OK = 'https://umami.chewybytes.com/script.js';

describe('readUmamiConfig', () => {
  it('is off unless both values are set and valid', () => {
    expect(readUmamiConfig({})).toBeNull();
    expect(
      readUmamiConfig({ NEXT_PUBLIC_UMAMI_SCRIPT_URL: URL_OK }),
    ).toBeNull();
    expect(readUmamiConfig({ NEXT_PUBLIC_UMAMI_WEBSITE_ID: ID })).toBeNull();
    expect(
      readUmamiConfig({
        NEXT_PUBLIC_UMAMI_SCRIPT_URL: URL_OK,
        NEXT_PUBLIC_UMAMI_WEBSITE_ID: 'nope',
      }),
    ).toBeNull();
  });
  it('reads a valid pair and lower-cases the id', () => {
    expect(
      readUmamiConfig({
        NEXT_PUBLIC_UMAMI_SCRIPT_URL: URL_OK,
        NEXT_PUBLIC_UMAMI_WEBSITE_ID: ID.toUpperCase(),
      }),
    ).toEqual({ scriptUrl: URL_OK, websiteId: ID });
  });
  it('accepts a path on our own domain and refuses an odd one', () => {
    expect(
      readUmamiConfig({
        NEXT_PUBLIC_UMAMI_SCRIPT_URL: '/m/s.js',
        NEXT_PUBLIC_UMAMI_WEBSITE_ID: ID,
      }),
    ).toEqual({ scriptUrl: '/m/s.js', websiteId: ID });
    for (const bad of [
      '//evil.example/s.js',
      '/m//s.js',
      '/m/s.js?x=1',
      '/m/s.js#x',
      '/ m/s.js',
      '/',
    ]) {
      expect(
        readUmamiConfig({
          NEXT_PUBLIC_UMAMI_SCRIPT_URL: bad,
          NEXT_PUBLIC_UMAMI_WEBSITE_ID: ID,
        }),
      ).toBeNull();
    }
  });
  it('refuses http, credentials, queries and fragments', () => {
    for (const bad of [
      'http://umami.chewybytes.com/script.js',
      'https://u:p@umami.chewybytes.com/script.js',
      `${URL_OK}?x=1`,
      `${URL_OK}#x`,
      'not a url',
    ]) {
      expect(
        readUmamiConfig({
          NEXT_PUBLIC_UMAMI_SCRIPT_URL: bad,
          NEXT_PUBLIC_UMAMI_WEBSITE_ID: ID,
        }),
      ).toBeNull();
    }
  });
});

describe('isUmamiCountablePath', () => {
  it('counts public pages, with or without a language prefix', () => {
    for (const path of [
      '/',
      '/fr',
      '/de',
      '/shop',
      '/fr/shop',
      '/sale',
      '/search',
      '/our-curation',
      '/hair-type',
      '/skin-type',
      '/about',
      '/faq',
      '/delivery-returns',
      '/privacy',
      '/sign-in',
      '/blog',
      '/blog/some-post',
      '/nl/blog/some-post',
      '/product/some-handle',
      '/es/product/some-handle',
      '/hair-care',
      '/wigs-extensions',
      '/de/skin-care',
    ]) {
      expect(isUmamiCountablePath(path), path).toBe(true);
    }
  });
  it('never counts the account, bag, saved items, orders, thank-you, unsubscribe, admin or the API', () => {
    for (const path of [
      '/account',
      '/account/orders',
      '/fr/account/orders',
      '/bag',
      '/de/bag',
      '/saved',
      '/thank-you',
      '/unsubscribe',
      '/og-preview',
      '/og-preview/products',
      '/admin',
      '/api/anything',
      '/hair-care/extra/segments',
    ]) {
      expect(isUmamiCountablePath(path), path).toBe(false);
    }
  });
  it('refuses a query, fragment, double slash or non-path', () => {
    for (const path of ['/shop?x=1', '/shop#x', '//shop', 'shop', '', null, undefined]) {
      expect(isUmamiCountablePath(path as string)).toBe(false);
    }
  });
});

describe('umamiReferrer', () => {
  const own = 'https://www.auntiemarlenes.com';
  it('keeps another site origin and path, never query or fragment', () => {
    expect(umamiReferrer('https://news.ycombinator.com/item?id=1#c', own)).toBe(
      'https://news.ycombinator.com/item',
    );
  });
  it('keeps our own public path but only the origin for a share link', () => {
    expect(umamiReferrer('https://www.auntiemarlenes.com/shop', own)).toBe(
      'https://www.auntiemarlenes.com/shop',
    );
    expect(
      umamiReferrer('https://auntiemarlenes.com/account/orders', own),
    ).toBe('https://auntiemarlenes.com');
  });
  it('drops the path when our own origin is unknown, and non-http referrers', () => {
    expect(
      umamiReferrer('https://www.auntiemarlenes.com/account/x', null),
    ).toBe('https://www.auntiemarlenes.com');
    expect(umamiReferrer('android-app://com.x', own)).toBe('');
    expect(umamiReferrer('', own)).toBe('');
  });
});

describe('umamiPageview', () => {
  it('sends a bare path with an empty title, or nothing', () => {
    expect(
      umamiPageview(
        '/sale',
        'https://google.com/search?q=x',
        'https://www.auntiemarlenes.com',
      ),
    ).toEqual({
      url: '/sale',
      title: '',
      referrer: 'https://google.com/search',
    });
    expect(
      umamiPageview('/account/abc', '', 'https://www.auntiemarlenes.com'),
    ).toBeNull();
  });
});

describe('the proxy through our own domain', () => {
  it('forwards the tracker script and the collect endpoint', () => {
    expect(umamiProxyTarget('/m/s', 'GET')).toBe('/script.js');
    expect(umamiProxyTarget('/m/s', 'HEAD')).toBe('/script.js');
    expect(umamiProxyTarget('/m/api/send', 'POST')).toBe('/api/send');
    expect(umamiProxyTarget('/m/api/send', 'OPTIONS')).toBe('/api/send');
  });
  it('forwards nothing else under /m or with the wrong method', () => {
    for (const [path, method] of [
      ['/m/api/send', 'GET'],
      ['/m/s', 'POST'],
      ['/m/s.js', 'GET'],
      ['/m/other', 'GET'],
      ['/m/api/other', 'POST'],
      ['/m/s/extra', 'GET'],
      ['/en/m/s', 'GET'],
    ] as const) {
      expect(umamiProxyTarget(path, method), `${method} ${path}`).toBeNull();
    }
  });
  it('never forwards cookies, credentials, identity headers or the Referer', () => {
    expect(UMAMI_STRIPPED_HEADERS).toEqual(
      expect.arrayContaining([
        'cookie',
        'authorization',
        'referer',
        'x-user-id',
        'x-profile-id',
        'x-device-id',
      ]),
    );
  });
});

describe('advertising campaign tags', () => {
  it('keeps only the five utm tags, as plain short words', () => {
    expect(umamiCampaignQuery('?utm_source=meta&utm_medium=paid&utm_campaign=trex&utm_content=a1&utm_term=dinosaurs')).toBe(
      '?utm_source=meta&utm_medium=paid&utm_campaign=trex&utm_content=a1&utm_term=dinosaurs',
    );
    expect(umamiCampaignQuery('utm_campaign=spring sale')).toBe('?utm_campaign=spring%20sale');
  });
  it('drops everything else: searches, tokens, click ids, emails, odd values', () => {
    expect(umamiCampaignQuery('?search=my+child&fbclid=abc&gclid=def&token=secret&email=a@b.co')).toBe('');
    expect(umamiCampaignQuery('?utm_source=a@b.co')).toBe('');
    expect(umamiCampaignQuery('?utm_source=<script>')).toBe('');
    expect(umamiCampaignQuery(`?utm_source=${'x'.repeat(101)}`)).toBe('');
    expect(umamiCampaignQuery('?utm_source=meta&fbclid=abc&q=child')).toBe('?utm_source=meta');
  });
  it('handles missing or huge input', () => {
    for (const input of ['', null, undefined, `?${'a=b&'.repeat(1000)}`]) {
      expect(umamiCampaignQuery(input as string)).toBe('');
    }
  });
  it('adds the campaign tags to a counted page view and nothing else', () => {
    expect(umamiPageview('/shop', '', 'https://www.auntiemarlenes.com', '?utm_campaign=trex&child=Amy')).toEqual({
      url: '/shop?utm_campaign=trex',
      title: '',
      referrer: '',
    });
    expect(umamiPageview('/account/settings', '', 'https://www.auntiemarlenes.com', '?utm_campaign=trex')).toBeNull();
  });
});
