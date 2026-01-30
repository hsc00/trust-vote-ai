# TrustVote AI

**High-Integrity Decision Engine.** Infrastructure for transparent voting and AI-powered legislative analysis.

[![CI/CD & Quality](https://github.com/hsc00/trust-vote-ai/actions/workflows/deploy.yml/badge.svg)](https://github.com/hsc00/trust-vote-ai/actions/workflows/deploy.yml)
[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=hsc00_trust-vote-ai&metric=alert_status)](https://sonarcloud.io/summary/new_code?id=hsc00_trust-vote-ai)
[![Security Rating](https://sonarcloud.io/api/project_badges/measure?project=hsc00_trust-vote-ai&metric=security_rating)](https://sonarcloud.io/summary/new_code?id=hsc00_trust-vote-ai)
[![Docs](https://img.shields.io/github/actions/workflow/status/hsc00/trust-vote-ai/deploy.yml?label=docs&logo=github)](https://hsc00.github.io/trust-vote-ai/)

---

## Architecture & Infrastructure

The project follows a **Monorepo** pattern using **NPM Workspaces**, ensuring consistency across the entire ecosystem.

- `packages/docs`: Technical documentation and Architectural Decision Records (VitePress).
- `packages/backend`: NestJS API Core (In progress).

### Security & Quality Stack

- **Static Analysis:** SonarCloud Integration (Quality Gates enforced).
- **Secret Scanning:** GitGuardian protection.
- **Git Hooks:** Husky + lint-staged for pre-commit linting (ESLint 9 / Prettier).
- **CI/CD:** GitHub Actions for automated testing and documentation deployment.
- **Branch Protection:** Strict Rulesets requiring successful status checks before merging.

### Infrastructure & Persistence

- **Runtime:** Node.js 22 (LTS) / NestJS (Fastify adapter).
- **Database:** PostgreSQL 17 + `pgvector` for AI-powered semantic search.
- **ORM:** Drizzle ORM (Type-safe, high-performance SQL operations).
- **Caching:** Redis 7 (Alpine-based) for session management and rate-limiting.
- **Containerization:** Docker Compose for reproducible development environments.

## Engineering Logs

We maintain a rigorous record of the project's evolution:

- **[Architectural Decision Records (ADRs)](https://hsc00.github.io/trust-vote-ai/architecture/1-documentation-stack):** Core stack and design decisions.
- **[Engineering Journals](https://hsc00.github.io/trust-vote-ai/logs/1-dependency-security):** Detailed logs of infrastructure setup and incident resolution.

## Initial Roadmap

- [x] Initialize Documentation Stack (VitePress)
- [x] Resolve initial security vulnerabilities (Audit/Overrides)
- [x] ADR 1-5: Stack Core defined (VitePress, License, Branching, TS/Node, NestJS).
- [x] Setup CI/CD Pipeline and Quality Gates (SonarCloud & GitGuardian)
- [x] Initialize Backend Core Service (NestJS)
- [x] Database Schema & PostgreSQL Docker Setup (pgvector)
- [ ] Implement RAG (Retrieval-Augmented Generation) for Legislative Analysis
- [ ] Secure Voting Engine Implementation (Hash-based integrity)

---

_Note: This is an open-research project. Technical rigor precedes feature development._

## License

Copyright © 2026 TrustVote AI. All rights reserved.
This project is proprietary. Unauthorized use, reproduction, or distribution is strictly prohibited.
