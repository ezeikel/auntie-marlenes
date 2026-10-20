import { mkdir, realpath, symlink } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
const target = new URL(
  '../../../packages/db/.wrangler/state/',
  import.meta.url,
);
const local = new URL('../.wrangler/state', import.meta.url);
// OpenNext 1.20.1 populates local cache in Wrangler's default directory even
// when --persist-to is forwarded to dev. Point both at the same binding state.
await mkdir(target, { recursive: true });
await mkdir(new URL('../.wrangler/', import.meta.url), { recursive: true });
try {
  if ((await realpath(local)) !== (await realpath(target))) {
    throw new Error(
      'apps/web/.wrangler/state already exists separately; move that local cache aside before linking shared DB/cache state.',
    );
  }
} catch (error) {
  if (error.code !== 'ENOENT') throw error;
  await symlink(fileURLToPath(target), fileURLToPath(local), 'dir');
}
