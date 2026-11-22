// Next embeds absolute paths for its OG binaries and both Prisma WASM clients.
// Keep the specifiers relative to the generated handler so Wrangler can bundle
// the very same Worker in another checkout. Run from the web app directory.
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const output = path.resolve('.open-next/server-functions/default');
const handler = path.join(output, 'apps/web/handler.mjs');
const imports =
  /(["'])\/[^"'\n]*?\/\.open-next\/server-functions\/default\/([^"'?\n]+?\.(?:wasm|bin))(\?module)?\1/g;
const source = readFileSync(handler, 'utf8');
const portable = source.replace(imports, (_, quote, name, query = '') => {
  const file = path.resolve(output, name);
  if (!file.startsWith(output + path.sep) || !existsSync(file)) throw new Error(`Missing bundled binary: ${name}`);
  const relative = path.relative(path.dirname(handler), file);
  return quote + (relative.startsWith('.') ? relative : './' + relative) + query + quote;
});
if (portable !== source) writeFileSync(handler, portable);
