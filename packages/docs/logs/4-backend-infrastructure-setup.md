# Log 4: Backend Infrastructure Setup (2026-01-29)

**Date:** 2026-01-29

## Context

Initial setup of the `@trust-vote/backend` package within the monorepo, focusing on modern Node.js 24 standards and high-performance execution.

## Decisions & Technical Choices

1. **Framework:** NestJS with **Fastify** adapter for superior throughput compared to Express.
2. **Runtime:** Switched from `ts-node` to **`tsx`** to handle Pure ESM (ES Modules) compatibility issues with Node 24.
3. **Architecture:** Implemented **Top-level await** in `main.ts` for a cleaner entry point.
4. **TypeScript Configuration:**
   - Set `moduleResolution` to `Bundler` to allow clean imports (without `.js` extensions) while maintaining ESM integrity.
   - Set `target` to `ES2022` to support modern JS features.

## Challenges Overcome

- **ERR_MODULE_NOT_FOUND:** Resolved by moving to `tsx` and adjusting `tsconfig.json` to use `Bundler` resolution, avoiding the need for forced `.js` extensions in TypeScript source files.
- **Top-level await:** Configured `package.json` with `"type": "module"` to allow asynchronous bootstrapping of the NestJS application.

## Current Status

- Backend is active and running at `http://localhost:3000`.
- NestJS successfully initialized with the Fastify engine.
