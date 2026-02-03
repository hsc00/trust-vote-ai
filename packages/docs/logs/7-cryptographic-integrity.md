# Cryptographic Integrity

**Date:** 2026-02-03

## Context & Objectives

The goal was to consolidate the backend's cryptographic core and ensure the testing infrastructure (`Vitest`) was robust enough to handle NestJS and Fastify bootstrapping without memory leaks or module cache collisions.

## Technical Implementations

### Cryptographic Core (SecurityService)

We finalized the Merkle Tree implementation using **SHA3-512** (FIPS 202), ensuring quantum-resistant integrity and high collision immunity for the voting process.

- **Root Generation:** Recursive implementation with support for odd-numbered leaf sets (balanced via sibling promotion).
- **Merkle Proofs:** Logic to extract inclusion paths (`MerkleSteps`) for any specific vote index.
- **Proof Verification:** Implementation of the `verifyProof` method. This allows third-party auditors to validate a vote using only the vote hash, the proof steps, and the public Merkle Root.

### Testing Infrastructure (Vitest + NestJS)

We overcame the technical challenge of testing `main.ts` with total isolation.

- **Module Isolation:** Resolved the `Object.is` equality error (caused by `vi.resetModules()`) by migrating from memory reference checks to **Structural Validation**.
- **Fastify Mocking:** Comprehensive mocking of the `FastifyAdapter` and the application's listen lifecycle.

### Public Audit API (Contract Validation)

The API contract for the public audit endpoint was defined. The payload now returns a complete cryptographic package:

- `voteId`: Unique identifier for the vote.
- `hash`: The leaf hash generated via SHA3-512.
- `proof`: An array of steps (hash + position) required to reconstruct the path to the root.
- `merkleRoot`: The current session root for validation.
- `algorithm`: Explicitly defined as SHA3-512 for transparency.
