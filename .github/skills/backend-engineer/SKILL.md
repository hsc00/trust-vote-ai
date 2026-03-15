---
name: backend-engineer
description: Build robust backend systems with modern technologies (Node.js, Python, Go, Rust), frameworks (NestJS, FastAPI, Django), databases (PostgreSQL, MongoDB, Redis), APIs (REST, GraphQL, gRPC), authentication (OAuth 2.1, JWT), testing strategies, security best practices (OWASP Top 10), performance optimization, scalability patterns (microservices, caching, sharding), DevOps practices (Docker, Kubernetes, CI/CD), and monitoring. Use when designing APIs, implementing authentication, optimizing database queries, setting up CI/CD pipelines, handling security vulnerabilities, building microservices, or developing production-ready backend systems.
license: MIT
---

# Backend Engineer

Production-ready backend development with modern technologies, best practices, and proven patterns.

## When to Use

- Designing RESTful, GraphQL, or gRPC APIs
- Building authentication/authorization systems
- Optimizing database queries and schemas
- Implementing caching and performance optimization
- OWASP Top 10 security mitigation
- Designing scalable microservices
- Testing strategies (unit, integration, E2E)
- CI/CD pipelines and deployment
- Monitoring and debugging production systems

## Technology Selection Guide

**Languages:** Node.js/TypeScript (full-stack), Python (data/ML), Go (concurrency), Rust (performance)
**Frameworks:** NestJS, FastAPI, Django, Express, Gin
**Databases:** PostgreSQL (ACID), MongoDB (flexible schema), Redis (caching)
**APIs:** REST (simple), GraphQL (flexible), gRPC (performance)

See: `references/technologies.md` for detailed comparisons

## Reference Navigation

**Core Technologies:**

- `references/technologies.md` - Languages, frameworks, databases, message queues, ORMs
- `references/api-design.md` - REST, GraphQL, gRPC patterns and best practices

**Security & Authentication:**

- `references/security.md` - OWASP Top 10, security best practices, input validation
- `references/authentication.md` - OAuth 2.1, JWT, RBAC, MFA, session management

**Performance & Architecture:**

- `references/performance.md` - Caching, query optimization, load balancing, scaling
- `references/architecture.md` - Microservices, event-driven, CQRS, saga patterns

**Quality & Operations:**

- `references/testing.md` - Testing strategies, frameworks, tools, CI/CD testing
- `references/devops.md` - Docker, Kubernetes, deployment strategies, monitoring
- `references/implementation-workflow.md` - Unified implementation workflow

## Key Best Practices

**Security:** Argon2id passwords, parameterized queries, OAuth 2.1 + PKCE, rate limiting, security headers

**Performance:** Redis caching (90% DB load reduction), database indexing, CDN, connection pooling

**Testing:** 70-20-10 pyramid (unit-integration-E2E), contract testing for microservices

**DevOps:** Blue-green/canary deployments, feature flags, Kubernetes, Prometheus/Grafana monitoring, OpenTelemetry tracing

## Quick Decision Matrix

| Need                | Choose           |
| ------------------- | ---------------- |
| Fast development    | Node.js + NestJS |
| Data/ML integration | Python + FastAPI |
| High concurrency    | Go + Gin         |
| Max performance     | Rust + Axum      |
| ACID transactions   | PostgreSQL       |
| Flexible schema     | MongoDB          |
| Caching             | Redis            |
| Internal services   | gRPC             |
| Public APIs         | GraphQL/REST     |
| Real-time events    | Kafka            |

## Executable Examples

- [FastAPI bearer-token authentication](references/authentication.md) - see "FastAPI JWT Authentication Endpoint (Runnable Example)"
- [PostgreSQL parameterized queries with psycopg](references/security.md) - see "Parameterized PostgreSQL Query (Runnable Example)"

## Implementation Checklist

**API:** Choose style → Design schema → Validate input → Add auth → Verify success and failure responses → Add rate limiting → Generate documentation → Exercise endpoint examples → Finalize error handling

**Database:** Choose DB → Design schema → Validate with test data → Create indexes → Verify query plans → Configure connection pooling → Define migration strategy → Rehearse migration failure recovery → Test backup/restore → Measure performance regressions

**Security:** Review OWASP Top 10 risks → Enforce parameterized queries → Implement OAuth 2.1 + JWT → Add security headers → Configure rate limiting → Validate and sanitize input → Hash passwords with Argon2id → Verify audit logging and failure paths

**Testing:** Add unit coverage for core logic → Add integration coverage for boundaries → Add E2E coverage for critical paths → Run load tests for hotspots → Verify migrations on realistic fixtures → Add contract tests for microservices → Check failure cases, not only happy paths

**Deployment:** Package with Docker → Automate CI/CD → Rehearse blue-green or canary rollout → Validate feature flags → Confirm monitoring and alerts → Verify structured logging → Exercise health checks and rollback path

## Implementation Workflow

When implementing backend code, follow unified implementation workflow patterns. See `references/implementation-workflow.md` for details, including migration failure recovery.
