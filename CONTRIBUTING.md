# Contributing to TrustVote

To maintain high code quality and consistency, please follow these guidelines.

## Branch Naming Convention

We use a prefix-based naming system for branches. Always create a branch before starting any work.

| Prefix      | Purpose                                                | Example                        |
| :---------- | :----------------------------------------------------- | :----------------------------- |
| `feat/`     | New features or functionality                          | `feat/pinecone-integration`    |
| `fix/`      | Bug fixes                                              | `fix/db-connection-leak`       |
| `ci/`       | CI/CD configuration, GitHub Actions, Husky, SonarCloud | `ci/setup-quality-gate`        |
| `chore/`    | Maintenance, CI/CD, dependencies                       | `chore/update-sonar-config`    |
| `test/`     | Adding or refactoring tests                            | `test/vote-integrity-logic`    |
| `docs/`     | Documentation changes only                             | `docs/api-endpoints`           |
| `refactor/` | Code changes that neither fix a bug nor add a feature  | `refactor/schema-optimization` |

## Commit Message Format

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification. This helps in generating automated changelogs and tracking progress.

**Format:** `<type>(<scope>): <description>`

- **type**: One of the branch prefixes (feat, fix, chore, etc.)
- **scope**: (Optional) The module affected (e.g., `api`, `db`, `ai`, `docs`)
- **description**: A short, imperative-tense description of the change.

**Examples:**

- `feat(ai): implement RAG analysis for legislative docs`
- `ci(github): add coverage reporting to sonar workflow`
- `fix(db): correct foreign key reference in votes table`
- `test(backend): ensure 100% coverage for schema relations`

## Pull Request Process

1.  **Sync**: Ensure your branch is up to date with `develop` or `main`.
2.  **Template**: Complete the repository PR template in full. Do not leave placeholders or sections blank; use `N/A` when needed.
3.  **Quality Gate**: Our CI/CD pipeline runs automatically on every PR.
    - **Linting**: Code must pass the linting rules.
    - **Tests**: All tests must pass.
    - **SonarCloud**: The Quality Gate **requires at least 80% code coverage** on new code.
4.  **Feedback**: SonarCloud will comment directly on your PR with metrics and issues. Please resolve all comments before requesting a final review.

## Testing Standards

- **Unit Tests**: Mandatory for all new logic.
- **Coverage**: We aim for high integrity. New schema definitions or business logic should strive for **100% coverage** whenever possible.
- **Commands**:
  - Run tests: `npm run test`
  - Run coverage: `npm run test:coverage`

---

_“In cryptography and democracy, we trust. In code quality, we verify.”_

## Local Development

- Backend dev server: `http://localhost:3000` (default NestJS port). Start from `packages/backend`.
- Frontend dev server: `http://localhost:3001` (default Next.js dev port used in this repo). Start from `packages/frontend`.

If you change ports, update `packages/frontend/.env.example` and the `dev` scripts accordingly.
