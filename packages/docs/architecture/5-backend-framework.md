# ADR 5: Backend Framework Selection

## Context

Having decided on **Node.js/TypeScript**, we need a framework to orchestrate the API, AI services, and database interactions. The framework must support modularity, high testability, and a clear separation of concerns to maintain the project's integrity.

## Comparison (Market 2026)

| Feature            | **NestJS**              | **Fastify**   | **Express**  | **Elysia (Bun)** |
| :----------------- | :---------------------- | :------------ | :----------- | :--------------- |
| **Architecture**   | **Highly Modular (DI)** | Plugin-based  | Unstructured | Minimalist       |
| **Integrity**      | **High (Opinionated)**  | Medium        | Low          | Medium           |
| **Scalability**    | Excellent               | **Excellent** | Medium       | High             |
| **Learning Curve** | High                    | Low           | **Lowest**   | Medium           |

## Decision

**NestJS** using the **Fastify** underlying HTTP engine.

## Rationale

NestJS was chosen as the backbone of TrustVote AI, leveraging the **Fastify adapter** for optimal performance:

1. **Dependency Injection (DI):** Essential for mocking AI services and databases during testing, ensuring the core logic can be audited without side effects.
2. **Architecture:** It forces a modular structure (Modules, Controllers, Services). This is critical for a "Trust" project where we need to isolate the "Voting Engine" from the "AI Analysis Engine".
3. **Performance (Fastify Engine):** By opting for Fastify as the underlying platform instead of the default Express engine, we achieve significantly higher throughput and lower latency, which is vital for high-integrity, real-time voting scenarios.
4. **Ecosystem:** Native support for Microservices and WebSockets, which will be needed when we implement real-time voting updates.
5. **Documentation:** Being the most used enterprise framework for TS, finding solutions for complex security patterns is much faster.

## Consequences

- **Boilerplate:** NestJS requires more files initially compared to Express.
- **Strictness:** We must follow the NestJS way (decorators, modules), which adds a small overhead in development time but saves weeks of refactoring later.
- **Fastify Compatibility:** While Fastify is faster, we must ensure that any third-party plugins used are compatible with the NestJS Fastify adapter.
