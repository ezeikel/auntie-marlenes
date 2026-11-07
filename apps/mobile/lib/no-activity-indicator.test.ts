import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

// Fleet rule: every loading state spins FontAwesome's faSpinnerThird through
// the shared Spinner component, never React Native's ActivityIndicator.
const ROOT = fileURLToPath(new URL('..', import.meta.url));
const SKIP_DIRS = new Set([
  'node_modules',
  'ios',
  'android',
  'dist',
  '.expo',
  'store-assets',
  'assets',
]);
const SOURCE = /\.(ts|tsx|js|jsx)$/;
const TEST = /\.test\.(ts|tsx|js|jsx)$/;

const sourceFiles = (dir: string): string[] =>
  readdirSync(dir).flatMap((name) => {
    if (SKIP_DIRS.has(name) || name.startsWith('.')) return [];
    const path = join(dir, name);
    if (statSync(path).isDirectory()) return sourceFiles(path);
    return SOURCE.test(name) && !TEST.test(name) ? [path] : [];
  });

const RN_IMPORT =
  /import\s*(?:type\s*)?\{([^}]*)\}\s*from\s*['"]react-native['"]/g;

const offences = (source: string): string[] => {
  const found: string[] = [];
  for (const [, names] of source.matchAll(RN_IMPORT)) {
    if (/\bActivityIndicator\b/.test(names))
      found.push('imports ActivityIndicator');
  }
  if (/<ActivityIndicator\b/.test(source))
    found.push('renders <ActivityIndicator>');
  if (/\.ActivityIndicator\b/.test(source))
    found.push('uses RN.ActivityIndicator');
  return found;
};

describe('loading indicators', () => {
  it('finds the app source it guards', () => {
    expect(sourceFiles(ROOT).length).toBeGreaterThan(10);
  });

  it('never uses React Native ActivityIndicator (use the Spinner component)', () => {
    const bad = sourceFiles(ROOT).flatMap((path) =>
      offences(readFileSync(path, 'utf8')).map(
        (why) => `${relative(ROOT, path)}: ${why}`,
      ),
    );
    expect(bad).toEqual([]);
  });

  it('catches an ActivityIndicator import', () => {
    expect(
      offences("import { ActivityIndicator, View } from 'react-native';"),
    ).not.toEqual([]);
  });
});
