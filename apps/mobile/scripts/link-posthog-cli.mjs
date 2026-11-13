#!/usr/bin/env node
/**
 * Puts `posthog-cli` where PostHog's iOS bundle phase looks for it, run on every install
 * (postinstall), so local Release builds and EAS builds both find it.
 *
 * posthog-react-native/expo wraps the Xcode bundle phase in
 * `posthog-xcode.sh`, which uploads the Hermes source maps and fails the build
 * when it cannot find the CLI. It looks in `~/.posthog`, the global npm
 * prefix and `$(npm root)/.bin`, which from `ios/` is
 * `apps/mobile/node_modules/.bin`. This workspace installs hoisted
 * (`.npmrc`), so `@posthog/cli` and its bin live in the repository root's
 * `node_modules` and that directory has no `posthog-cli`. Android resolves the
 * CLI with `require.resolve` and needs nothing.
 */
import { mkdirSync, rmSync, symlinkSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const appRoot = fileURLToPath(new URL('../', import.meta.url));
const require = createRequire(join(appRoot, 'package.json'));

const target = join(
  dirname(require.resolve('@posthog/cli/package.json')),
  'run-posthog-cli.js',
);
const binDir = join(appRoot, 'node_modules', '.bin');
const link = join(binDir, 'posthog-cli');

if (dirname(target) !== join(appRoot, 'node_modules', '@posthog', 'cli')) {
  mkdirSync(binDir, { recursive: true });
  rmSync(link, { force: true });
  symlinkSync(relative(binDir, target), link);
  console.log(`posthog-cli linked: ${link} -> ${target}`);
}
