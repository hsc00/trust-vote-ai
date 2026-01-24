# Architectural Decision 3: Branching Strategy

## Context

Even as a solo developer, the project requires a structured way to integrate code to ensure that the `main` branch remains stable, secure, and always deployable.

## Decision

I will use a **Feature Branch Workflow** with self-reviewed Pull Requests.

## Strategy Details

1. **`main` branch:** Protected. Represents the production-ready state.
2. **Feature branches (`feat/`, `fix/`, `docs/`):** All new work is done in isolated branches.
3. **Pull Requests (PRs):** Merging to `main` happens only via PRs.
4. **Automation:** PRs will trigger CI/CD pipelines (Linting, Tests, Security Audits) before merging.

## Rationale

- **Traceability:** Each change is linked to a specific PR, providing a history of _why_ and _how_ something was implemented.
- **Safety Gate:** Prevents accidental "broken" code from being deployed to GitHub Pages.
- **Future-Proofing:** If the team grows, the workflow is already established.
