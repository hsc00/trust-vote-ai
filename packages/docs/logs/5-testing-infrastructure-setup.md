# Testing & Quality Infrastructure (CI/CD)

## Context

Implemented a centralized testing and automated quality strategy to ensure "Rating A" on SonarCloud and the long-term reliability of the TrustVote AI voting engine.

## Actions Taken

1. **Centralization:** Installed `vitest`, `unplugin-swc`, and `@vitest/coverage-v8` at the monorepo root to maintain a single source of truth for testing tools.
2. **Unified Configuration:**
   - Implemented a root `vitest.config.ts` using `mergeConfig` to resolve TypeScript conflicts between Vite and Vitest.
   - Configured `unplugin-swc` to handle NestJS decorators with high-performance compilation, replacing the slower `ts-jest`.
   - Set `reportsDirectory: './coverage'` at the root to ensure consistent report ingestion by external tools.
3. **CI/CD Pipeline (GitHub Actions):**
   - Developed a secure workflow using `npm ci --ignore-scripts` followed by a controlled `npm rebuild` for trusted binaries (`esbuild`, `swc`).
   - Integrated **SonarCloud Scan** with precise path mapping (`-Dsonar.sources=packages/backend/src`) to link coverage reports with monorepo structure.
4. **Git Hooks:** Integrated **Husky** and **lint-staged** to enforce a "no-broken-tests" policy at the commit level using `vitest related --run`.

## Technical Resolution: Path Mapping & Coverage

The main challenge was the "Zero Coverage" reporting in the SonarCloud dashboard. This was resolved by:

- Executing tests from the root context (`vitest run packages/backend`) instead of the workspace context.
- Adjusting `sonar-project.properties` to map the `lcov.info` file correctly to the monorepo source paths.
- Resolving TypeScript `defineConfig` overloads by using `vitest/config` explicit typing.

## Status

- **CI/CD:** Fully operational and secure.
- **Tests:** All integration tests passing.
- **Quality Gate:** Reporting pipeline active; metrics will scale as domain logic grows.
- **Next Step:** Infrastructure deployment via Docker Compose.
