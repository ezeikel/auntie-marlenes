import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import type {
  Request as CfRequest,
  Response as CfResponse,
} from '@cloudflare/workers-types';
import ts from 'typescript';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { injectWebAnalytics } from '../cf-web-analytics';

// Wrangler already supplies Miniflare: exercise workerd's real HTMLRewriter
// without adding a dependency or approximating its parser in a mock.
const require = createRequire(import.meta.url);
const { Miniflare, convertV4MiniflareOptions } = createRequire(
  require.resolve('wrangler/package.json'),
)('miniflare') as {
  Miniflare: new (
    options: unknown,
  ) => {
    ready: Promise<URL>;
    dispatchFetch(url: string, init?: RequestInit): Promise<Response>;
    dispose(): Promise<void>;
  };
  convertV4MiniflareOptions(options: unknown): unknown;
};
const token = '5f95be76a48a47399417761d1a19824b';
const source = ts.transpileModule(
  readFileSync(new URL('../cf-web-analytics.ts', import.meta.url), 'utf8'),
  {
    compilerOptions: {
      target: ts.ScriptTarget.ES2022,
      module: ts.ModuleKind.ESNext,
    },
  },
).outputText;
let mf: InstanceType<typeof Miniflare>;

beforeAll(async () => {
  mf = new Miniflare(
    convertV4MiniflareOptions({
      name: 'beacon-test',
      modules: true,
      compatibilityDate: '2026-10-19',
      script: `${source}
      export default { async fetch(request) {
        if (new URL(request.url).pathname === '/stream') {
          const body = new ReadableStream({ start(controller) {
            controller.enqueue(new TextEncoder().encode('<html><body>streaming' + 'x'.repeat(128 * 1024)));
            setTimeout(() => {
              controller.enqueue(new TextEncoder().encode('</body></html>'));
              controller.close();
            }, 500);
          } });
          return injectWebAnalytics(request, new Response(body, {
            headers: { 'content-type': 'text/html' },
          }), '${token}');
        }
        const input = await request.json();
        const incoming = new Request('https://local.test/', {
          method: input.method || 'GET', headers: input.requestHeaders,
        });
        const response = new Response(input.html, {
          status: input.status || 200, statusText: 'Fixture',
          headers: { 'content-type': 'text/html; charset=utf-8',
            'cache-control': 'private, no-store', 'x-test': 'preserved',
            'set-cookie': 'test=1; HttpOnly', ...input.headers },
        });
        const result = injectWebAnalytics(incoming, response, input.token);
        return Response.json({ html: await result.text(), status: result.status,
          statusText: result.statusText, headers: [...result.headers],
          identical: result === response });
      } }`,
    }),
  );
  await mf.ready;
}, 30_000);
afterAll(async () => {
  await mf?.dispose();
});

type Fixture = {
  html?: string | null;
  token?: string;
  status?: number;
  method?: string;
  headers?: Record<string, string>;
  requestHeaders?: Record<string, string>;
};
async function rewrite(input: Fixture = {}) {
  const response = await mf.dispatchFetch('https://local.test/', {
    method: 'POST',
    body: JSON.stringify({
      html: '<html><body>hello</body></html>',
      token,
      ...input,
    }),
  });
  return response.json() as Promise<{
    html: string;
    status: number;
    statusText: string;
    headers: [string, string][];
    identical: boolean;
  }>;
}
const count = (html: string) =>
  (
    html.match(
      /src="https:\/\/static\.cloudflareinsights\.com\/beacon.min.js"/g,
    ) || []
  ).length;

describe('Cloudflare Web Analytics streaming injection', () => {
  it('delivers HTML before the source stream closes', async () => {
    const response = await mf.dispatchFetch('https://local.test/stream');
    const reader = response.body!.getReader();
    const first = await reader.read();
    const opening = new TextDecoder().decode(first.value);
    expect(opening).toContain('streaming');
    expect(opening).not.toContain('</body>');
    expect(first.done).toBe(false);
    let tail = '';
    for (;;) {
      const chunk = await reader.read();
      if (chunk.done) break;
      tail += new TextDecoder().decode(chunk.value);
    }
    expect(count(tail)).toBe(1);
    expect(tail).toContain('</script></body></html>');
  });
  it.each([200, 404, 500])(
    'injects once before the body end on HTML %s',
    async (status) => {
      const result = await rewrite({ status });
      expect(count(result.html)).toBe(1);
      expect(result.html).toContain(
        `data-cf-beacon='{"token":"${token}"}'></script></body>`,
      );
      expect(result.status).toBe(status);
      expect(result.statusText).toBe('Fixture');
      expect(Object.fromEntries(result.headers)).toMatchObject({
        'content-type': 'text/html; charset=utf-8',
        'cache-control': 'private, no-store',
        'x-test': 'preserved',
        'set-cookie': 'test=1; HttpOnly',
      });
    },
  );
  it.each([
    '<head><script src="https://static.cloudflareinsights.com/beacon.min.js"></script></head><body>hello</body>',
    '<body>hello<script src="https://static.cloudflareinsights.com/beacon.min.js" data-cf-beacon=\'{"token":"existing"}\'></script></body>',
    '<body><script src="//static.cloudflareinsights.com/other.js"></script></body>',
  ])(
    'does not duplicate an existing beacon (including late in body)',
    async (html) => {
      expect((await rewrite({ html })).html).toBe(html);
    },
  );
  it('ignores script-looking text inside comments', async () => {
    const result = await rewrite({
      html: '<body><!-- <script src="https://static.cloudflareinsights.com/beacon.min.js"></script> --></body>',
    });
    expect(result.html).toContain(`data-cf-beacon='{"token":"${token}"}'`);
  });
  it.each(['<div>Not found</div></body></html>', '<p>HTML fragment</p>'])(
    'covers HTML with no opening body element: %s',
    async (html) => {
      const result = await rewrite({ html, status: 404 });
      expect(result.html.startsWith(html)).toBe(true);
      expect(count(result.html)).toBe(1);
      expect(result.status).toBe(404);
    },
  );
  it('does not duplicate a beacon in a fragment', async () => {
    const html =
      '<script src="https://static.cloudflareinsights.com/beacon.min.js"></script>';
    expect((await rewrite({ html })).html).toBe(html);
  });
  it.each([
    'application/json',
    'text/x-component',
    'application/javascript',
    'image/svg+xml',
    'text/plain',
  ])('leaves %s byte-identical', async (type) => {
    const result = await rewrite({ headers: { 'content-type': type } });
    expect(result.identical).toBe(true);
    expect(result.html).toBe('<html><body>hello</body></html>');
  });
  it.each(['', '   ', undefined])(
    'leaves an unconfigured token untouched',
    async (token) => {
      expect((await rewrite({ token })).identical).toBe(true);
    },
  );
  it.each(['HEAD', 'POST'])('leaves %s untouched', async (method) => {
    expect((await rewrite({ method })).identical).toBe(true);
  });
  it.each([
    { requestHeaders: { range: 'bytes=0-20' } },
    { status: 206 },
    { headers: { 'content-range': 'bytes 0-20/100' } },
    { status: 302, headers: { location: '/other' } },
    { html: null },
  ] as Fixture[])(
    'leaves Range, redirects and bodyless responses untouched: %j',
    async (input) => {
      expect((await rewrite(input)).identical).toBe(true);
    },
  );
  it('escapes the token inside the HTML attribute', async () => {
    const result = await rewrite({ token: "x'&<script>" });
    expect(result.html).toContain('x&#39;&amp;&lt;script&gt;');
    expect(count(result.html)).toBe(1);
  });
  it('returns the same Response and unread stream when injection is disabled', () => {
    const response = new Response('data', {
      headers: { 'x-test': 'unchanged' },
    });
    expect(
      injectWebAnalytics(
        new Request('https://local.test') as unknown as CfRequest,
        response as unknown as CfResponse,
      ),
    ).toBe(response);
    expect(response.bodyUsed).toBe(false);
  });
});
