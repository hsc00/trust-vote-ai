# Repository Strategy

## Context

As the project expands to include a Backend (NestJS), Frontend, and Documentation (VitePress), we must decide between a single unified repository (Monorepo) or multiple specialized repositories (Polyrepo).

## Comparison Matrix (2026 Standards)

| Criteria                    | **Monorepo** (NPM Workspaces)            | **Polyrepo**               |
| :-------------------------- | :--------------------------------------- | :------------------------- |
| **Developer Velocity**      | **High** (One IDE window, easy refactor) | Low (Context switching)    |
| **Tooling Sync**            | **Automatic** (Shared ESLint/Sonar)      | Manual (Config drift)      |
| **Dependency Management**   | Centralized                              | Fragmented                 |
| **CI/CD Complexity**        | Initial setup effort                     | Ongoing maintenance effort |
| **AI Contextual Awareness** | **Maximum**                              | Minimum                    |

## Decision

**Monorepo** using **NPM Workspaces**.

## Rationale

1. **Context Integrity:** For a "Trust" platform, having the documentation, backend logic, and infrastructure living in the same version-controlled timeline is critical.
2. **Maintenance Efficiency:** As a solo developer, the overhead of managing multiple repositories (GH Actions, Secrets, Permissions) is prohibitive.
3. **Unified Quality Gate:** We can enforce the same SonarQube and Linting standards across the entire stack from a single root configuration.

## Consequences

- The project structure will shift to a `/packages` layout.
- Build times in CI may increase slightly (mitigated by caching).
