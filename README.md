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
- **Testing:** Vitest with 100% coverage.
- **Git Hooks:** Husky + lint-staged for pre-commit linting (ESLint 9 / Prettier).
- **CI/CD:** GitHub Actions for automated testing and documentation deployment.
- **Cryptographic Integrity:** SHA3-512 Hashing (NIST FIPS 202) for quantum-resistant data sealing and Merkle Tree inclusion proofs.

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

## Strategic Roadmap

### Phase 1: Foundation of Trust (Completed)

_Establishing the secure baseline and cryptographic core._

- [x] Initialize Documentation Stack (VitePress) & ADRs.
- [x] Security Hardening (NPM Audit Overrides, SonarCloud, GitGuardian).
- [x] CI/CD Pipeline Setup with Strict Quality Gates.
- [x] Backend Core Service Initialization (NestJS + Fastify).
- [x] Database Architecture (PostgreSQL + pgvector + Drizzle ORM).
- [x] Secure Voting Engine: Implementation of SHA3-512 Hashing & Merkle Tree Data Structure.

### Phase 2: Transparency (In Progress)

_Enabling public verification of the cryptographic proofs._

- [x] **Merkle Proof Generator:** Logic to extract and verify inclusion proofs.
- [x] **Public Audit API:** Endpoint for `GET /audit/verify/:voteId` (Validated with mock context).
- [ ] **Data Persistence:** Transition from mock contexts to Drizzle-backed Merkle sessions.
- [ ] **Real-time Dashboard:** Frontend integration to display the current Root Hash.

### Phase 3: Cognitive Intelligence (Next)

_AI-driven legislative analysis using the secure document store._

- [ ] **Document Ingestion Pipeline:** Parsing PDF legislation into raw text.
- [ ] **Vector Embeddings:** Generating embeddings for legislative context using `pgvector`.
- [ ] **RAG Implementation:** Retrieval-Augmented Generation service for answering citizen queries (e.g., "How does this bill affect privacy?").

### Phase 4: Privacy & Identity (Future)

_Ensuring anonymity without compromising integrity._

- [ ] **Zero-Knowledge Proofs (ZKP):** Proving voter eligibility without revealing identity.
- [ ] **Digital Identity Integration:** Connecting with Gov/OIDC providers anonymously.

---

_Note: This is an open-research project. Technical rigor precedes feature development._

## License

Copyright © 2026 TrustVote AI. All rights reserved.
This project is proprietary. Unauthorized use, reproduction, or distribution is strictly prohibited.
