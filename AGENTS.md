# TrustVote AI Agent Instructions

This repository uses a structured agentic workflow. The root `AGENTS.md` file is a concise entry point for AI coding agents. It summarizes package ownership, quality expectations, and the main agent routing model.

## Use this file when

- deciding which specialist agent should own a task
- validating package boundaries before editing code
- checking repository-level test and lint commands
- linking to existing project documentation instead of duplicating it

## Key repository facts

- Monorepo with `npm` workspaces: packages are under `packages/*`
- Backend: `packages/backend` — NestJS + Fastify + TypeScript
- Frontend: `packages/frontend` — Next.js App Router + React Compiler
- Docs / ADRs: `packages/docs` — VitePress documentation site
- Data stack: PostgreSQL 17 + `pgvector` + Drizzle ORM
- Quality stack: ESLint, Prettier, Vitest, SonarCloud, Husky + lint-staged

## Important root commands

- `npm run lint` — lint entire repo and auto-fix issues
- `npm run test` — run Vitest tests for all packages
- `npm run test:backend` — run backend tests with coverage
- `npm run test:frontend` — run frontend tests in the workspace package
- `npm run docs:build` — build the docs site
- `npm run validate:branch` — enforce branch naming conventions

## Branch and commit conventions

Follow conventions from `CONTRIBUTING.md`:

- Branch prefix rules: `feat/`, `fix/`, `ci/`, `chore/`, `test/`, `docs/`, `refactor/`
- Commit format: Conventional Commits: `<type>(<scope>): <description>`

## Quality expectations

- Do not merge code until lint passes and tests pass for touched packages
- Keep new logic covered by Vitest tests
- Preserve or improve integrity and security posture
- Update ADRs or docs when behavior, architecture, or security posture changes
- Prefer linking to docs in `packages/docs` instead of rewriting the same content here

## Existing agent definitions

Specialized agents are already defined in `.github/agents`:

- `trust-orchestrator.agent.md`
- `backend-engineer.agent.md`
- `frontend-engineer.agent.md`
- `data-ai-engineer.agent.md`
- `qa-quality-engineer.agent.md`
- `devsecops-engineer.agent.md`
- `security-engineer.agent.md`
- `docs-adr-engineer.agent.md`
- `research-engineer.agent.md`
- `uiux-designer.agent.md`

Use the `TrustVote Orchestrator` agent as the primary owner for cross-domain changes and delegation.

## Agent routing guidance

- `TrustVote Orchestrator` owns end-to-end delivery and delegates work to specialists.
- `Backend Engineer` owns `packages/backend` implementation, APIs, controllers, and backend tests.
- `Frontend Engineer` owns `packages/frontend` UI, pages, components, and frontend tests.
- `Data and AI Engineer` owns schema, migrations, embeddings, RAG, and persistence logic.
- `QA and Quality Engineer` owns test strategy, coverage checks, regression analysis, and validation.
- `DevSecOps Engineer` owns CI/CD, Docker, dependency security, and release hardening.
- `Security Engineer` owns threat modeling, auth hardening, and cryptographic integrity reviews.
- `Docs and ADR Engineer` owns documentation updates, ADRs, and engineering logs.
- `UI/UX Designer` owns UX review, accessibility, and front-end design guidance.
- `Research Engineer` owns tradeoff analysis, library evaluation, and architecture research.

## Useful documentation links

- `README.md` — project overview, architecture, and strategic roadmap
- `CONTRIBUTING.md` — branch/commit naming, PR process, testing standards, local development
- `packages/docs/architecture/14-agentic-workflow-orchestrator.md` — agent workflow model and delegation rules
- `packages/docs/architecture/11-dependency-management-vulnerability-scanning.md` — dependency and security expectations
- `packages/docs/architecture/9-testing-framework-selection.md` — testing decisions and patterns

## Notes for AI agents

- Do not invent or assume hidden workflows beyond what is documented
- Keep changes scoped to the package(s) affected and consult the orchestrator if work crosses domains
- Prefer small, incremental, test-backed changes
- Link to docs rather than embedding long policy explanations in the final answer

---

## Recommended next customization

If you want to further improve AI productivity, add a `.github/copilot-instructions.md` or package-level `AGENTS.md` files for: backend, frontend, docs, and QA. These can capture package-specific commands, validation scripts, and code organization rules.
