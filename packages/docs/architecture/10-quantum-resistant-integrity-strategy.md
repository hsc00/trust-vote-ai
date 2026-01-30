# Quantum Resistant Integrity Strategy

## Context

The integrity of the voting engine and legislative records is the core value proposition of **TrustVote AI**. While SHA-256 is the current industry standard, it faces significant security degradation due to **Grover's Algorithm** as quantum computing advances. To fulfill our promise of a "Decadal-Scale" high integrity system, we must implement a hashing strategy that remains robust in a post-quantum (PQ) landscape.

## Comparison (Integrity Standards)

| Algorithm    | Digest Size  | Quantum Resistance            | Performance        | Standard        |
| :----------- | :----------- | :---------------------------- | :----------------- | :-------------- |
| **SHA-256**  | 256 bits     | Medium (128 bits effective)   | High               | Legacy Standard |
| **SHA-512**  | 512 bits     | **High (256 bits effective)** | High (64-bit arch) | Modern Standard |
| **SHA3-512** | 512 bits     | **High (256 bits effective)** | Medium             | NIST (FIPS 202) |
| **BLAKE3**   | 256/512 bits | **High**                      | **Extreme**        | Emerging        |

## Decision

We will implement **SHA3-512** for all document and vote hashing. Furthermore, we will architect the voting engine to utilize a **Merkle Tree** structure for block-level integrity verification.

## Rationale

1. **SHA3-512 (NIST FIPS 202):** Unlike the SHA-2 family, SHA-3 is based on the "Sponge" construction. It is structurally immune to certain classical attacks (like length extension) and provides a superior security margin against quantum-enabled collision searches.
2. **Standardization vs. Performance (Why not BLAKE3?):** While **BLAKE3** offers superior performance, **SHA3-512** was chosen because it is an official **NIST Standard**. For a project centered on "Trust" and government grade auditing, using a FIPS compliant algorithm provides higher institutional credibility and easier regulatory approval than an emerging (though secure) alternative.
3. **256-bit Post-Quantum Security:** By utilizing a 512-bit digest, even when halved by Grover's Algorithm, we maintain 256 bits of effective security—making brute-force attacks computationally infeasible for the foreseeable future.
4. **Merkle Tree Integration:** Transitioning from isolated hashes to an interconnected tree structure ensures that any modification to a single vote will invalidate the "Root Hash" of the entire ledger. This allows for rapid, lightweight auditing of massive datasets.

## Consequences

- **Storage Expansion:** The `hash` field in our database must be expanded to **128 characters (Hex)** or **64 bytes (Binary)**.
- **DB Schema Update:** The `votes` and `legislative_docs` tables must be updated to accommodate the larger digest size.
- **Node.js Integration:** We will leverage the native `node:crypto` module, ensuring zero external dependencies for our core security logic.
- **CPU Overhead:** While SHA-3 is slightly more CPU-intensive than SHA-256, the high-throughput nature of the **Fastify** engine and modern server hardware renders the latency impact negligible.

---

## Next Steps

- Refactor `schema.ts` to support 512-bit hashes.
- Implement `SecurityService` for SHA3-512 generation.
- Design the Merkle Tree chaining logic for the voting engine.
