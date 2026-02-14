# Frontend Framework Selection

## Context

The **Trust Vote AI** system requires a frontend interface capable of providing real-time auditability. The core requirement is **Client-Side Verification**: the user’s browser must be able to independently verify Merkle Proofs to ensure the server has not manipulated results. This requires a stack that balances high-performance SEO for legislative text with reactive cryptographic computing.

## Comparison (Market 2026)

| Feature             | **Next.js (App Router)** | **Remix**      | **Vite (SPA)**   | **Astro**         |
| :------------------ | :----------------------- | :------------- | :--------------- | :---------------- |
| **Hybrid Strategy** | **Excellent (SSR/CSR)**  | High (SSR)     | None (CSR)       | Partial (Islands) |
| **Verification**    | **Client-side Ready**    | Server-leaning | Client-side only | Complex for logic |
| **Ecosystem**       | **Vast (Shadcn/UI)**     | Growing        | Large            | Minimalist        |
| **Learning Curve**  | Medium                   | Medium         | **Low**          | Low               |

## Decision

**Next.js (React)** using the **App Router**, styled with **Tailwind CSS** and **Shadcn/UI**, and **TanStack Query** for data synchronization and state management.

## Rationale

Next.js was selected to bridge the gap between a content-heavy legislative platform and a high-security cryptographic dashboard:

1. **Client-Side Verification:** By utilizing Client Components, we can perform SHA3-512 hashing directly in the browser using cryptographic libraries like **noble-hashes**. This removes the need to "trust" the server's proof results.
2. **React Compiler Integration:** We will use the **React Compiler** to ensure optimal performance without manual memoization (`useMemo`/`useCallback`). This is critical when re-rendering complex Merkle Tree visualizations and processing cryptographic proofs.
3. **SEO & Legislative Context:** Legislative documents are rendered using **Server-Side Rendering (SSR)**, ensuring they are searchable and load instantly, while the voting dashboard remains highly interactive.
4. **Type Safety (Monorepo):** Being in a TypeScript monorepo, we can share the exact same `MerkleProof` and `Vote` interfaces between the NestJS backend and the Next.js frontend, preventing contract mismatches.
5. **Component Standards:** **Shadcn/UI** allows for the rapid development of an accessible and "authoritative" interface, crucial for building user trust.

### Pros

- **"Don't Trust, Verify":** Moves the hashing logic to the edge (user's device), allowing for true public auditability.
- **Seamless Performance:** The React Compiler eliminates common performance bottlenecks in the UI without adding "hook noise" to the codebase.
- **Unified Developer Experience:** Full-stack TypeScript simplifies the development of complex cryptographic data flows across the monorepo.
- **Modern Tooling:** Access to the best-in-class UI libraries (Radix UI/Shadcn) to ensure accessibility and professional design.

### Cons

- **Architectural Complexity:** Managing the boundary between Server and Client components requires careful planning to avoid leaking secrets or bloating the client bundle.
- **Hydration Cost:** React's hydration process adds a small initial overhead compared to pure static generators like Astro.
- **Monorepo Maintenance:** Requires robust tooling (TurboRepo/Nx) to manage shared dependencies between the NestJS and Next.js environments.

## Consequences

- **Verification Hook:** We must implement a custom React Hook to handle the Merkle Proof verification using the browser's native subtle crypto.
- **Shared Package:** We should create a `@trustvote/shared` package to house the cryptographic types and validation logic used by both frontend and backend.
- **Client Bundling:** We must be careful to only import cryptographic libraries (like `noble-hashes` if needed) in Client Components to keep the Server Components light.
- **Compiler Configuration:** The `next.config.ts` must be updated to enable `reactCompiler: true`.
