# Cryptographic Integrity & Persistence

## Context & Objectives

The goal was to consolidate the backend's cryptographic core, eliminate technical debt (orphaned database records), and ensure 100% code coverage across security and schema definitions. We focused on making the testing infrastructure (`Vitest`) robust enough to handle NestJS and Fastify bootstrapping without infrastructure dependencies like a live database during unit tests.

## Technical Implementations

### Cryptographic Core (SecurityService & CryptographyService)

We finalized the Merkle Tree implementation using **SHA3-512** (FIPS 202), ensuring quantum-resistant integrity for the voting process.

- **Root Generation:** Recursive implementation supporting odd-numbered leaf sets via sibling promotion.
- **Merkle Proofs with Bounds Checking:** Added strict index validation to `getMerkleProof`. The service now throws an error if an out-of-range index is requested, preventing the generation of misleading proofs for non-existent nodes.
- **Proof Verification:** The `verifyProof` method allows auditors to reconstruct the root using only the vote hash and the provided proof steps.

### Database Integrity (Drizzle ORM)

Enforced referential integrity at the database level to maintain a clean audit trail.

- **Schema Constraints:** Updated `merkle_snapshots` to make `docId` non-nullable and implemented an `onDelete: 'cascade'` policy. This prevents orphaned audit records when a legislative document is deleted.
- **Environment Reset:** Performed a full database "nuke" and reset (dropping volumes and legacy migrations) to synchronize the Docker environment with the new schema using `drizzle-kit push`.

### Testing Infrastructure (Vitest + NestJS)

- **Security Service Isolation:** Implemented robust mocking for Drizzle’s fluent interface (chaining methods like `select().from().where()`), allowing tests to run without a Postgres connection.
- **Schema Structural Testing:** Created specialized tests for `schema.ts` that force the execution of Drizzle's "lazy functions" (like `.reference()`). This ensures that even declarative code is fully validated by the coverage reporter.
- **Assertion Consolidation:** Optimized controller tests to validate both exception types and error messages in a single execution cycle, improving CI efficiency.

## Public Audit API (Contract Validation)

The API contract for the public audit endpoint is now reinforced by a data integrity check. It returns a complete cryptographic package:

- `voteId`: Unique identifier for the vote.
- `hash`: The leaf hash generated via SHA3-512.
- `proof`: An array of steps (`MerkleStep`) required to reconstruct the path to the root.
- `merkleRoot`: The current session root for validation.
- `algorithm`: Explicitly defined as SHA3-512 for transparency.
