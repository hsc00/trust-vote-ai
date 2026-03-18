# Real-time Audit Dashboard (Frontend)

## Context

Phase 1 established the cryptographic audit proof pipeline: votes are hashed, chained into a Merkle tree, and the root plus inclusion proofs are exposed via the NestJS backend at `/audit/verify/:voteId`. Phase 2 closes the transparency loop by delivering a browser-accessible dashboard that lets any observer verify a vote's integrity without backend access or cryptographic tooling. This is a core requirement of the TrustVote AI auditability mandate.

## Decisions

1. **React Server Components as the default**: Data-fetching components (the dashboard page) are implemented as async server components. This avoids client-side hydration overhead and keeps the API URL and fetch logic server-side, which prevents `API_URL` from leaking into the browser bundle.

2. **`useTransition` for the verifier form**: The interactive UUID input uses `useTransition` to keep the form responsive during the Server Action round-trip. The `isPending` state drives a loading indicator without blocking the input field, following the Next.js App Router non-blocking async pattern.

3. **Server Actions as the API bridge**: Rather than exposing the backend URL to the client or writing a Next.js Route Handler, a Server Action (`verifyVoteAction`) wraps the fetch call. This keeps the backend origin entirely server-side and provides a typed, co-located call boundary with safe error surfacing.

4. **Feature-directory structure**: All audit-domain code is co-located under `features/audit/` with the sub-tree `api/`, `components/`, and `types/`. This matches the established frontend architecture and isolates the audit feature for independent testing and future iteration.

5. **Client-side UUID v4 validation before dispatch**: The verifier form validates the UUID format with a regex on the client before invoking the Server Action, preventing unnecessary round-trips for malformed identifiers.

## Implementation

### Types

- `features/audit/types/index.ts` — Declares `MerkleStep` and `AuditVerifyResponse`. Single source of truth for the audit API contract on the frontend.

### API Layer

- `features/audit/api/auditApi.ts` — Server-side fetch helper `fetchVoteAudit`. It reads `process.env.API_URL`, throws on non-OK responses, and returns a typed audit verification response.
- `features/audit/api/auditActions.ts` — Next.js Server Action `verifyVoteAction`. Wraps `fetchVoteAudit` with `try/catch`, normalising `Error` instances and non-Error throws into a `{ error: string }` discriminated return.

### Components

- `features/audit/components/AuditResult.tsx` — Pure display component. Renders Merkle root, the full proof chain with step indices, a pass/fail decision badge, and integrity metadata (vote ID, timestamp).
- `features/audit/components/VoteVerifier.tsx` — `'use client'` interactive form. Manages input state, UUID validation, `useTransition`, Server Action invocation, and renders `AuditResult` on success or an error message on failure.

### App Shell

-- `app/layout.tsx` — Root layout updated with TrustVote branding, dark zinc colour theme, and a footer.

- `app/page.tsx` — Dashboard page containing: hero section describing the audit system, `<VoteVerifier>` form, and a "How it works" explainer section.

### Environment & Config

- `app/env.d.ts` — Ambient `NodeJS.ProcessEnv` declaration adding `API_URL` to the TypeScript environment type.
- `.env.example` — Documents the required `API_URL` variable for local development and deployment.
- `features/audit/index.ts` — Barrel export for the audit feature.

## Testing

Test strategy followed the project's existing Vitest pattern and Google Testing Standards:

- **`features/audit/api/auditApi.spec.ts`** — 5 unit tests. Covers `fetchHealth` and `fetchVoteAudit` across: successful fetch with typed response, non-OK HTTP status (throws), response body parse error (throws), and missing body. Uses `vi.fn()` to mock global `fetch`.
- **`features/audit/api/auditActions.spec.ts`** — 3 unit tests. Covers `verifyVoteAction`: success path returning `AuditVerifyResponse`, `Error` instance propagated as `{ error: message }`, and non-Error throw normalised to a fallback string.

Frontend Vitest infrastructure was added in this session:

- `packages/frontend/vitest.config.ts` — Vitest config with `jsdom` environment and `@vitejs/plugin-react` for JSX transform support.
- Added to `packages/frontend/package.json`: `vitest`, `@vitejs/plugin-react`, `@testing-library/react`, `@testing-library/user-event`, `jsdom`.

All 8 tests pass. API and Server Action layers are the priority coverage targets for this phase; component rendering tests are deferred to Phase 3 when UI stabilises.

## Result

- **Tests:** 8/8 pass (`vitest run`)
- **Type check:** `tsc --noEmit` — 0 errors
- **Dependencies:** `npm install` — clean at workspace root
- **Dashboard:** Functional for Phase 2 transparency objective. Any observer can submit a vote UUID and receive a cryptographic proof chain rendered in the browser.
- **Open documentation debt:** None. ADR-12 (Frontend Framework) already ratifies Next.js App Router; no new ADR required.
