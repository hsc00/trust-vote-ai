import { execSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

const types = ['feat', 'fix', 'ci', 'chore', 'test', 'docs', 'refactor'];
const typesRegex = types.join('|');

// 1. Branch Validation
try {
  const branch = execSync('git rev-parse --abbrev-ref HEAD', {
    stdio: ['ignore', 'pipe', 'ignore'],
  })
    .toString()
    .trim();

  const branchRegex = new RegExp(String.raw`^(${typesRegex})\/[a-z0-9._-]+$`);

  const isProtectedBranch = branch === 'main' || branch === 'develop' || branch === 'agents';

  if (!isProtectedBranch && !branchRegex.test(branch)) {
    console.error(`Error: Invalid branch name -> '${branch}'`);
    console.error(`Allowed prefixes: ${types.join(', ')}/`);
    process.exit(1);
  }
} catch (error) {
  console.error('Error validating branch:', error.message);
  process.exit(1);
}

// 2. Commit Message Validation
const msgPath = process.argv[2];
if (msgPath) {
  try {
    const commitMsg = readFileSync(msgPath, 'utf8').trim();
    const msgRegex = new RegExp(String.raw`^(${typesRegex})(\([a-z0-9_-]+\))?: .+$`);

    if (!msgRegex.test(commitMsg)) {
      console.error('Error: Invalid commit message format.');
      console.error('Expected pattern: type(scope): description');
      process.exit(1);
    }
  } catch (error) {
    console.error('Error reading commit message file:', error.message);
    process.exit(1);
  }
}
