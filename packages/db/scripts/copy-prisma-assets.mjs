import { cp, mkdir, readdir } from 'node:fs/promises';
// tsc emits TypeScript only. workerd needs the generated JS and WASM too.
const source = new URL('../src/generated/prisma/internal/', import.meta.url);
const destination = new URL(
  '../dist/generated/prisma/internal/',
  import.meta.url,
);
await mkdir(destination, { recursive: true });
for (const file of await readdir(source)) {
  if (file.endsWith('.js') || file.endsWith('.wasm')) {
    await cp(new URL(file, source), new URL(file, destination));
  }
}
