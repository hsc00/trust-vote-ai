# Log 6: Database Persistence & Vector Engine Setup

**Date:** 2026-01-30

## Context

After establishing the CI/CD pipeline, the focus shifted to building the data foundation. The goal was to implement a schema capable of handling both traditional relational data (votes, documents) and high-dimensional vectors for AI-powered semantic analysis.

## Actions Taken

1. **Infrastructure as Code (IaC):**
   - Deployed a **Docker Compose** environment featuring **PostgreSQL 17** with the `pgvector` extension and **Redis 7** for caching.
   - Implemented a health check mechanism to ensure database availability before application startup.

2. **Persistence Layer (Drizzle ORM):**
   - Integrated **Drizzle ORM** as a lightweight, type-safe alternative to Prisma, optimized for the NestJS/Fastify engine.
   - Configured `drizzle-kit` for automated schema synchronization and migrations.

3. **Core Schema Materialization:**
   - **`legislative_docs`**: Central storage for law proposals.
   - **`doc_chunks_embeddings`**: Dedicated table for RAG (Retrieval-Augmented Generation), featuring a 1536 dimension vector column compatible with standard embedding models.
   - **`votes`**: High-integrity table with SHA-256 hash support to ensure record immutability.

4. **Environment Security:**
   - Established a strict `.env` / `.env.example` strategy to protect database credentials, ensuring no sensitive data is committed to the repository.

## Technical Resolution: The "Vector" Type Error

During the initial schema push, an error occurred because PostgreSQL did not recognize the `vector` type.

- **Root Cause:** The `pgvector` extension was present in the Docker image but not activated in the specific database instance.
- **Fix:** Manually executed `CREATE EXTENSION IF NOT EXISTS vector;`. For long-term reliability, a persistent initialization script was added to the Docker setup to automate this process in fresh environments.

## Status

- **Database Engine:** Operational (Docker).
- **Schema:** Synced and verified via `drizzle-kit push`.
- **Persistence:** Global `DbModule` ready for injection into NestJS services.
