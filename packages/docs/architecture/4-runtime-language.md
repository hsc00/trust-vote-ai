# Backend Technology Selection

## Context

The "TrustVote AI" requires a backend that ensures data integrity, handles complex AI orchestration (RAG), and remains maintainable by a solo developer.

## Comparison

| Feature               | TypeScript (Node/Bun)     | Rust (Axum/Actix)          | Python (FastAPI)      |
| :-------------------- | :------------------------ | :------------------------- | :-------------------- |
| **Integrity**         | High (with Strict TS)     | **Highest (Native)**       | Medium                |
| **Development Speed** | **Fastest**               | Slow                       | Fast                  |
| **AI Ecosystem**      | Excellent (TS-First SDKs) | Growing (Native ML)        | Leader (Data Science) |
| **Memory Safety**     | Garbage Collected         | **Zero-cost Abstractions** | Garbage Collected     |
| **Type System**       | Structural (Flexible)     | **Nominal/Strict**         | Dynamic (Hints only)  |

## Decision

**TypeScript (Node.js LTS)**

## Rationale

Although **Rust** offers the highest level of technical integrity and performance, **TypeScript** was chosen as the primary candidate for the MVP phase due to:

1. **Orchestration Power:** Most AI providers (OpenAI, Anthropic) and RAG frameworks release updates for TypeScript first.
2. **Solo Productivity:** The "Borrow Checker" in Rust would significantly delay the project's time-to-market.
3. **Type Safety:** With `strict: true`, TypeScript provides sufficient integrity for the business logic layer, while remaining agile.

## Alternative (The "Hybrid" Path)

If specific engine components (e.g., the voting encryption or massive law indexing) require extreme performance, we will implement them in **Rust** as WebAssembly (WASM) modules or separate microservices, keeping the main orchestration in TypeScript.
