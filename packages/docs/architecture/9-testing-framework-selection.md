# Testing Framework Selection

## Context

We need a testing framework that supports both Backend (NestJS/Node.js) and Future Frontend (React/Web) within a monorepo structure. The tool must handle ESM (ES Modules) natively and provide high performance.

## Comparison (2026 Landscape)

| Feature         | **Vitest**                  | **Jest**                     | **Bun Test** |
| :-------------- | :-------------------------- | :--------------------------- | :----------- |
| **ESM Support** | **Native (Excellent)**      | Complex/Requires Workarounds | Native       |
| **Performance** | **Ultra-fast (Vite-based)** | Slower (Process overhead)    | Fastest      |
| **Ecosystem**   | Compatible with Jest API    | Industry Standard            | Limited      |
| **DX**          | Instant Watch Mode          | Slower re-runs               | Instant      |

## Decision

**Vitest**.

## Rationale

1. **ESM Native:** Unlike Jest, Vitest doesn't struggle with `type: module` and Top-level await, which are core to our project.
2. **Monorepo Efficiency:** By installing it at the root, we maintain a single version for all packages while allowing specific configurations (e.g., SWC for NestJS decorators).
3. **Speed:** Leveraging `esbuild`/`swc` ensures that tests don't become a bottleneck as the project grows.
4. **Compatibility:** It supports the same `describe/it/expect` syntax as Jest, making it easy for contributors.

## Consequences

- Specific plugins (like `unplugin-swc`) are required to handle NestJS decorators.
