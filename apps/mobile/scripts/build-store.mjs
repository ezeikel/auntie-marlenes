import { execFileSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, statSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';
import process from 'node:process';
import { pathToFileURL } from 'node:url';

// Keep the signed artifact available after a failed upload, outside the Git tree.
export function buildStore(platform, buildArgs, submitProfile) {
  if (!buildArgs.includes('--local'))
    throw new Error('Store builds require --local');
  const directory = join(homedir(), 'eas-builds');
  mkdirSync(directory, { recursive: true });
  const run = mkdtempSync(join(directory, 'release-'));
  const output = join(run, platform === 'ios' ? 'release.ipa' : 'release.aab');
  process.stdout.write(`Local build output: ${output}\n`);
  execFileSync('eas', [...buildArgs, '--output', output], { stdio: 'inherit' });
  if (!statSync(output).size)
    throw new Error(`Empty build artifact: ${output}`);
  if (submitProfile) {
    const submit = [
      'submit',
      '--platform',
      platform,
      '--profile',
      submitProfile,
      '--path',
      output,
    ];
    if (buildArgs.includes('--non-interactive'))
      submit.push('--non-interactive');
    execFileSync('eas', submit, { stdio: 'inherit' });
  }
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  const [platform, profile] = process.argv.slice(2);
  if (!['android', 'ios'].includes(platform) || !profile) {
    throw new Error('Expected a platform and a submission profile');
  }
  buildStore(
    platform,
    ['build', '--local', '--profile', 'production', '--platform', platform],
    profile,
  );
}
