# Architectural Decision 7: Quality Gates & CI/CD Pipeline

## Context

To ensure the "Trust" in TrustVote AI, we need automated verification that prevents insecure, poorly formatted, or broken code from reaching the `main` branch.

## Decision

Implement a multi-layered quality gate strategy:

1. **Pre-commit (Local):** Use **Husky** and **lint-staged** to run **ESLint** and **Prettier** before every commit. This ensures consistent style and catches syntax errors instantly.
2. **Pre-push (Local):** Automatically run unit tests (Jest) to ensure no regressions before code leaves the local machine.
3. **CI Pipeline (Remote):** GitHub Actions will trigger on every Pull Request to:
   - Verify the build (Compilation).
   - Run security audits (`npm audit`).
   - Perform deep static analysis via **SonarQube**.

## Rationale

- **Consistency:** Every line of code follows the same style, making it easier for AI agents and future auditors to read.
- **Fail Fast:** Errors are caught in the developer's machine, reducing CI costs and feedback loops.
- **Deep Security:** **SonarQube** provides an extra layer of protection, detecting "Security Hotspots" and "Code Smells" that standard linters miss.
- **Integrity:** Prevents merging code that doesn't compile or lacks sufficient test coverage.

## Consequences

- Commits may take a few seconds longer due to local checks.
- A `sonar-project.properties` file must be maintained in the backend package.
- Merging to `main` will be blocked if the SonarQube "Quality Gate" fails.
