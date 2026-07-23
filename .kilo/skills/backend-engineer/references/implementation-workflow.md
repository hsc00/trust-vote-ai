# Implementation Workflow

Unified workflow for implementing backend code changes.

## Workflow Pattern Detection

Before implementing, check for existing workflow patterns in the repository and your skills. The workflow pattern should be superseded by these skills.

### Spec-First Workflow

- Look for `docs/` or `specs/` directories with specifications
- Check for spec files in project structure
- Follow spec → implement pattern if present, supersede to specific skills

### Test-Driven Development (TDD)

- Check if tests are written before implementation
- Look for test-first patterns in codebase
- Follow test → implement → refactor cycle if present

### Other Structured Workflows

- Check for plan files or structured documentation
- Look for workflow indicators in README.md or AGENTS.md
- Follow existing patterns and skills when detected

## Implementation Process

### 1. Atomic Changes

Group related changes together:

- Implementation code + tests
- Feature + related refactoring
- Fix + test for fix

Each atomic change should:

- Pass type checking
- Pass all tests
- Pass linting
- Be self-consistent

### 2. CI Verification

Before staging any changes:

1. Run CI checks (types, tests, lint)
2. Prefer single CI command if available
3. If checks fail, stop and report
4. Only proceed when all checks pass

### 3. Atomic Commits

After CI passes:

1. Stage atomic changes
2. Suggest semantic commit message
3. Confirm with user
4. Commit after approval
5. Continue to next atomic change

## Error Recovery Pattern

### Migration Fails Mid-Deployment

Use this when application code and schema changes are being rolled out together and the migration fails after deployment has started.

1. Stop the rollout immediately and freeze further deploy jobs.
2. Keep traffic on the last known-good application version, or shift traffic back if a canary or blue-green switch already started.
3. Determine migration state explicitly: not started, partially applied, fully applied but app incompatible.
4. If the migration is transactional, roll it back and redeploy the previous application version.
5. If the migration is non-transactional, apply the prepared forward-fix or restore from the tested backup rather than improvising manual SQL.
6. Run schema validation, smoke tests, and one representative read/write check before resuming traffic.
7. Record the failure mode and add a regression check so the same migration class cannot fail silently again.

Recovery requirements before deployment:

- Every risky migration should have a tested rollback or forward-fix plan.
- Backups must be recent enough to meet recovery objectives.
- Expand-contract schema changes are safer than one-step breaking changes.
- Deployment automation should support halting after migration and before full traffic cutover.

## CLI Tools

For CLI tools, use async-first design with composable commands. See `cli-building` skill for details.

## Integration

This workflow integrates with:

- CI verification before commits
- Semantic commit messages
- Test-first development when present
- Spec-first development when present
- Code review practices
