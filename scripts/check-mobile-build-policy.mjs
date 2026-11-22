import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import process from 'node:process';

// Run in the repository root. The explicitly named :cloud shortcuts are opt-in.
const files = execFileSync('git', ['ls-files', '-z'], {
  encoding: 'utf8',
  maxBuffer: 32 * 1024 * 1024,
}).split('\0');
const violations = [];
for (const file of files) {
  if (/(^|\/)\.eas\/workflows\/.*\.ya?ml$/.test(file)) violations.push(file);
  if (/^\.github\/workflows\/.*\.ya?ml$/.test(file)) {
    const workflow = readFileSync(file, 'utf8').replace(/^\s*#.*$/gm, '');
    if (
      /\beas(?:-cli(?:@[^\s]+)?)?\s+(?:workflow:run\b|build(?=\s|$))|\b(?:eas:)?build:[\w:-]+:cloud\b/.test(
        workflow,
      )
    ) {
      violations.push(file);
    }
  }
  if (!/(^|\/)package\.json$/.test(file)) continue;
  const { scripts = {} } = JSON.parse(readFileSync(file, 'utf8'));
  for (const [name, command] of Object.entries(scripts)) {
    if (name.endsWith(':cloud')) continue;
    for (const part of command.split(/&&|[;|]/)) {
      if (
        /\beas(?:-cli(?:@[^\s]+)?)?\s+workflow:run\b/.test(part) ||
        (/\beas(?:-cli(?:@[^\s]+)?)?\s+build(?:\s|$)/.test(part) &&
          !/(?:^|\s)--local(?:\s|$)/.test(part))
      ) {
        violations.push(`${file}: ${name}`);
      }
    }
  }
}
if (violations.length) {
  console.error(
    'Use local mobile builds and remove EAS workflow triggers:',
    violations.join('\n'),
  );
  process.exitCode = 1;
}
