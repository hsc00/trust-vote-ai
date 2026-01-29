# Log 5: Testing Infrastructure Setup

**Date:** 2026-01-29

## Context

Implemented a centralized testing strategy to ensure the "Rating A" on SonarCloud and the long-term reliability of the voting engine.

## Actions Taken

1. **Centralization:** Installed `vitest`, `unplugin-swc`, and `@vitest/coverage-v8` at the monorepo root.
2. **Backend Configuration:** - Created `packages/backend/vitest.config.ts` using `unplugin-swc` to compile NestJS decorators.
   - Set `globals: false` to enforce explicit test imports, enhancing code clarity.
3. **Health Check:** Created the first integration test for `AppController` to validate the setup.
4. **Scripts:** Added `test` command to the root `package.json` to enable project-wide testing.
5. Integrated **Vitest** with **Husky** and **lint-staged**.
6. Commits are now blocked if tests related to the changed files do not pass (`vitest related --run`).

## Technical Resolution: Decorators in Vitest

The main challenge was making Vitest understand NestJS decorators without using the heavy `ts-jest`. This was resolved by using `unplugin-swc`, which is the 2026 standard for fast TS compilation.

## Status

- All tests passing.
- Test coverage reporting is ready for SonarCloud integration.
