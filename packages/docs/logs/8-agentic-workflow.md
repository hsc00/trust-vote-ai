# Agentic Workflow

**Date:** 2026-03-15

## Summary

Implemented the orchestrator-specialist agent model in the codebase, enabling structured, cross-domain delivery with clear technical boundaries and skill invocation. All agents and skills are now codified and available for orchestrated feature delivery.

## Agents Added

- **TrustVote Orchestrator**: Owns end-to-end delivery, delegates to specialists, enforces one-problem-per-log rule.
- **Backend Engineer**: Handles backend API, NestJS, Fastify, and service logic.
- **Frontend Engineer**: Manages Next.js App Router, React, and dashboard UI.
- **Data and AI Engineer**: Responsible for PostgreSQL, Drizzle ORM, pgvector, embeddings, and RAG.
- **Security Engineer**: Performs threat modeling, cryptography, authn/authz, and security reviews.
- **QA and Quality Engineer**: Drives test strategy, coverage, regression analysis, and quality gates.
- **DevSecOps Engineer**: Manages CI/CD, Docker, dependency security, and release hardening.
- **Docs and ADR Engineer**: Maintains documentation, VitePress, ADRs, and engineering logs.
- **Research Engineer**: Explores design options, RAG strategies, and technical tradeoffs.

## Skills Integrated

- **frontend-engineer**: Modern React/TypeScript, Suspense, TanStack Router, MUI v7, performance, file structure.
- **backend-engineer**: Node.js, NestJS, Fastify, REST/GraphQL/gRPC, security, CI/CD, testing, microservices.
- **qa-expert**: Google Testing Standards, OWASP, test plans, bug tracking, coverage, autonomous QA.
- **shadcn-ui**: Install/configure shadcn/ui components, forms, tables, navigation, modals.
- **pgvector-search**: Hybrid semantic+keyword search, BM25, metadata filtering, performance.
- **rag-implementation**: RAG for LLMs, vector DBs, semantic search, Q&A, chatbots, source citation.
- **nestjs-expert**: Modular NestJS, DI, DTOs, guards, interceptors, TypeORM/Prisma.
- **nextjs-app-router-patterns**: Next.js 14+ App Router, SSR/SSG, streaming, server components.
- **dependency-resolver**: Diagnoses/fixes dependency conflicts (npm, pip, Maven, Cargo).
- **attack-tree-construction**: Visualizes attack paths, defense gaps, risk communication.
- **vkc-drizzle-schema-migration**: Drizzle schema/migration/seed workflow, DB-driven rulesets.
- **validating-database-integrity**: Enforces DB integrity, validation, referential/business rules.
- **vitest**: Vite-native testing, coverage, mocking, parallel tests.
- **vitepress**: Static docs, config, theme, markdown+Vue.
- **tailwind**: Utility-first CSS, responsive design, theming.
- **nodejs-backend-patterns**: Express/Fastify, middleware, error handling, API best practices.
- **postgres-pro**: PostgreSQL optimization, EXPLAIN, JSONB, replication, VACUUM, monitoring.
- **regression-root-cause-analyzer**: Traces regressions to commits/changes, bisect, bug localization.

## Technical Implementation

- All agents and skills are defined in `.github/agents/` and `.github/skills/`.
- The orchestrator agent enforces strict one-problem-per-log chronology.
- Each agent is invoked only for its domain; orchestrator coordinates multi-domain delivery.
- Skills are invoked by agents as needed for implementation, review, or validation.
- Engineering logs are created for each distinct problem solved, never combining multiple issues.

## Outcome

- Agentic workflow is now fully implemented and enforced in the codebase.
- All technical boundaries, skills, and agent roles are codified and operational.
- Logging and delivery are now orchestrated, auditable, and modular.
