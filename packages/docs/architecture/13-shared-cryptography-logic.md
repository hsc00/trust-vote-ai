# Shared Cryptographic Logic

## Context

To achieve 100% cryptographic parity between the **NestJS Backend** and **Next.js Frontend**, we need a shared source of truth for SHA3-512 hashing and Merkle Tree logic. While a separate package offers isolation, it adds significant complexity to the build pipeline and dependency management. We need a secure solution that follows the KISS principle: maximum security with minimum moving parts.

## Comparison (Code Sharing Strategies)

| Strategy         | **Separate Package**               | **Path Mapping (Source Sharing)** |
| :--------------- | :--------------------------------- | :-------------------------------- |
| **Complexity**   | High (Build scripts, package.json) | **Low (Direct TS Import)**        |
| **Security**     | High (Isolated)                    | **High (Identical Logic)**        |
| **Auditability** | Medium (Needs build review)        | **Excellent (Raw Source Review)** |
| **Developer DX** | Medium (Symlink issues)            | **High (Instant Feedback)**       |

## Decision

We will use **TypeScript Path Mapping** to share a raw source directory located at `/packages/core-crypto`. This directory will contain pure logic and types, shared directly between apps without a dedicated build step or `package.json`.

## Rationale

1. **Direct Integrity:** By importing the exact same `.ts` files, we eliminate any risk of "Version Drift" or build-time discrepancies. $SHA3_{backend}(x) \equiv SHA3_{frontend}(x)$ is guaranteed at the source level.
2. **KISS Principle:** No `npm link`, no workspace publishing, and no complex `tsconfig` inheritance. It's just a folder that both applications treat as their own.
3. **Audit-Friendly:** A security auditor only needs to inspect a single folder of raw TypeScript files to understand the entire trust model of the application.
4. **Performance:** Next.js (via Turbopack) and NestJS (via SWC/TS-Node) will compile the shared code using their own optimized pipelines, ensuring the best performance for their respective runtimes.

## Security Constraints

To prevent the shared folder from becoming a security liability, the following rules are strictly enforced:

- **Leaf Node Only:** The `core-crypto` folder cannot import anything from the rest of the monorepo. It is a "provider," never a "consumer."
- **Pure Functions:** Only deterministic, side-effect-free functions are allowed.
- **Primitive Types:** Only platform-agnostic types (like `Uint8Array` and `string`) are used to ensure compatibility between Node.js and the Browser's V8.
- **Dependency Restriction:** The only allowed external dependency is `@noble/hashes` (audited/zero-dependency).
