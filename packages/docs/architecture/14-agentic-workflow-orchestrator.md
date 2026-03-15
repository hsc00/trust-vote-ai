# Agentic Workflow & Orchestrator Model

## Context

As TrustVote AI scaled in complexity, the need for a robust, auditable, and production-safe delivery process became critical. Traditional single-agent or ad-hoc workflows led to bottlenecks and inconsistent quality. To address this, we adopted an **agentic workflow** centered on a dedicated **Orchestrator** agent.

## Decision

Adopt a multi-agent workflow where a central Orchestrator agent owns end-to-end feature delivery, delegating work to specialist agents for each domain:

- **Backend Engineer** (NestJS/Fastify, API, services)
- **Frontend Engineer** (Next.js, UI, dashboard)
- **Data and AI Engineer** (schema, migrations, embeddings, RAG)
- **QA and Quality Engineer** (testing, coverage, regression)
- **DevSecOps Engineer** (CI/CD, Docker, dependency security)
- **Security Engineer** (threat modeling, cryptography, auth hardening)
- **Docs and ADR Engineer** (docs, ADRs, engineering logs)
- **Research Engineer** (library evaluation, RAG strategy, technical research)

The Orchestrator triages requests, routes work, and integrates all changes, enforcing quality, security, and documentation standards before completion.

## Rationale

- **Separation of Concerns:** Each agent brings deep expertise to its domain, reducing errors and increasing delivery speed.
- **End-to-End Ownership:** The Orchestrator ensures no step is skipped, integrating outputs and running validation before completion.
- **Auditability:** Every change is traceable, with logs and ADRs updated as part of the workflow.
- **Quality & Security:** Automated enforcement of lint, test, and SonarCloud gates, plus built-in security review.

## Consequences

- **Consistent, production-safe delivery** across all packages.
- **Clear handoff and review sequence** for multi-domain changes.
- **Documentation and logs** are always updated in sync with code.
- **Increased transparency** for all engineering decisions and changes.

This model is now the foundation for all engineering work in TrustVote AI.
