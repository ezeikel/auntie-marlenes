import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

const base = process.env.PREVIEW_URL || 'http://localhost:8787';
if (!['localhost', '127.0.0.1'].includes(new URL(base).hostname)) {
  throw new Error('This smoke test only targets local preview');
}
const timeout = Number(process.env.SMOKE_TIMEOUT_MS || 15000);
const label = process.env.RUN_LABEL || 'preview';
const output = process.env.SMOKE_RESULTS_DIR || '/tmp/am-cloudflare-smoke';
await mkdir(output, { recursive: true });
const productResponse = await fetch(`${base}/api/products/search?first=1`);
if (!productResponse.ok)
  throw new Error(`Catalog discovery: ${productResponse.status}`);
const [product] = await productResponse.json();
if (!product?.handle || !product?.name) throw new Error('No product available');
const escapeHtml = (value) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
const cases = [
  {
    type: 'cached-page',
    route: '/about',
    content: (html) => /For us, by us\. The hair and beauty store/.test(html),
  },
  {
    type: 'dynamic-page',
    route: '/bag',
    content: (html) => /Your bag is empty/.test(html),
  },
  {
    type: 'product-page',
    route: `/product/${product.handle}`,
    content: (html) =>
      html.includes(escapeHtml(product.name)) && /<h1\b/.test(html),
  },
  {
    type: 'former-use-cache-holes',
    route: '/',
    content: (html) =>
      /Featured Products/.test(html) &&
      /Bundle Deals/.test(html) &&
      html.includes(`/product/${product.handle}`),
  },
];
const results = [];
for (let round = 1; round <= 2; round++) {
  for (const item of cases) {
    const samples = await Promise.all(
      Array.from({ length: 20 }, async (_, index) => {
        try {
          const response = await fetch(base + item.route, {
            signal: AbortSignal.timeout(timeout),
          });
          const html = await response.text();
          if (index === 0)
            await writeFile(
              path.join(output, `${label}-${round}-${item.type}.html`),
              html,
            );
          // A title inside Flight scripts/metadata cannot prove the stream resumed.
          const markup = html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/g, '');
          return {
            status: response.status,
            full: item.content(markup) && /<header\b/.test(markup),
            bytes: Buffer.byteLength(html),
          };
        } catch (error) {
          return { status: 0, full: false, bytes: 0, error: String(error) };
        }
      }),
    );
    const result = {
      round,
      type: item.type,
      path: item.route,
      statuses: samples.reduce((counts, sample) => {
        counts[sample.status] = (counts[sample.status] || 0) + 1;
        return counts;
      }, {}),
      full: samples.filter((sample) => sample.full).length,
      errors: samples.filter((sample) => sample.error).length,
      minBytes: Math.min(...samples.map((sample) => sample.bytes)),
      maxBytes: Math.max(...samples.map((sample) => sample.bytes)),
    };
    results.push(result);
    console.log(JSON.stringify(result));
  }
}
await writeFile(
  path.join(output, `${label}.json`),
  JSON.stringify(results, null, 2) + '\n',
);
if (results.some((result) => result.full !== 20 || result.statuses[200] !== 20))
  process.exitCode = 1;
