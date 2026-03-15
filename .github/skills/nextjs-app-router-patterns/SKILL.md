---
name: nextjs-app-router-patterns
description: Master Next.js 14+ App Router with Server Components, streaming, parallel routes, and advanced data fetching. Use when building Next.js applications, implementing SSR/SSG, or optimizing React Server Components.
---

# Next.js App Router Patterns

## Quick Start

```typescript
// app/layout.tsx
export const metadata = {
  title: { default: 'My App', template: '%s | My App' },
  description: 'Built with Next.js App Router',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}

// app/page.tsx
export default async function Page() {
  const data = await fetch('https://api.example.com/data', {
    next: { revalidate: 300 },
  }).then((r) => r.json())

  return <pre>{JSON.stringify(data, null, 2)}</pre>
}
```

## Pattern Summaries

1. `Layout + Metadata`: Define route metadata in `layout.tsx` and keep global wrappers minimal.
2. `Server Component Data Fetching`: Await/resolve `searchParams` (Promise in Next.js 15), colocate fetches, and wrap slow segments in `Suspense`.
3. `Server Actions`: Run mutation checkpoints, verify persistence, and use transactions for rollback-safe flows.
4. `Client Component -> Server Action`: Trigger actions with `useTransition` and return typed success/error payloads.
5. `Parallel Routes`: Use slot props in layout and isolated `loading.tsx` files for independent streams.
6. `Intercepting Routes`: Combine `(.)` modal routes with a full-page fallback and render both `children` and `modal` in layout.
7. `Streaming with Suspense`: Load critical shell first, stream expensive subtrees in separate boundaries.
8. `Route Handlers`: Keep API handlers in `route.ts`; return explicit status codes for not-found and create flows.
9. `Dynamic Metadata + Static Params`: Pair `generateMetadata` and `generateStaticParams` for SEO + prebuild.

## Troubleshooting

1. `Hydration mismatch`: Ensure initial server and client render output are deterministic; move browser-only logic to `useEffect` in client components.
2. `Server/Client serialization boundary`: Only pass serializable props from Server Components to Client Components (no functions, class instances, symbols, or non-POJO objects).
3. `Date/Map/Set props issues`: Convert values before crossing boundary (`date.toISOString()`, `Array.from(map.entries())`, `Array.from(set)`).
4. `Boundary import leaks`: Do not import server-only modules (`fs`, DB clients, secrets) into files marked `'use client'`.

## Detailed References

- Detailed pattern code: `./PATTERNS.md`
- Caching and invalidation strategies: `./CACHING.md`
