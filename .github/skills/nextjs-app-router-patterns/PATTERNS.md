# Next.js App Router Detailed Patterns

## Layout with Metadata

```typescript
// app/layout.tsx
import { Inter } from 'next/font/google'
const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: { default: 'My App', template: '%s | My App' },
  description: 'Built with Next.js App Router',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
```

## Server Component Data Fetching

```typescript
// app/products/page.tsx
export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; sort?: 'price' | 'name' | 'date'; page?: string }>
}) {
  const params = await searchParams

  return (
    <div className="flex gap-8">
      <FilterSidebar />
      <Suspense key={JSON.stringify(params)} fallback={<ProductListSkeleton />}>
        <ProductList category={params.category} sort={params.sort} page={Number(params.page) || 1} />
      </Suspense>
    </div>
  )
}

export async function ProductList({ category, sort, page }: ProductFilters) {
  const res = await fetch(
    `${process.env.API_URL}/products?${new URLSearchParams({ category, sort, page })}`,
    { next: { tags: ['products'] } }
  )
  if (!res.ok) throw new Error('Failed to fetch products')
  const { products, totalPages } = await res.json()

  return (
    <div>
      <div className="grid grid-cols-3 gap-4">
        {products.map((product) => <ProductCard key={product.id} product={product} />)}
      </div>
      <Pagination currentPage={page} totalPages={totalPages} />
    </div>
  )
}
```

## Server Actions

```typescript
// app/actions/cart.ts
'use server';
import { revalidateTag } from 'next/cache';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export async function addToCart(productId: string) {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get('session')?.value;
  if (!sessionId) redirect('/login');

  try {
    const item = await db.cart.upsert({
      where: { sessionId_productId: { sessionId, productId } },
      update: { quantity: { increment: 1 } },
      create: { sessionId, productId, quantity: 1 },
      select: { id: true, quantity: true },
    });

    if (!item?.id || item.quantity < 1) {
      return { error: 'Cart write validation failed' };
    }

    const persisted = await db.cart.findUnique({
      where: { sessionId_productId: { sessionId, productId } },
      select: { id: true },
    });
    if (!persisted) return { error: 'Cart item not persisted' };

    revalidateTag('cart');
    return { success: true };
  } catch {
    return { error: 'Failed to add item to cart' };
  }
}

export async function checkoutWithRollback(formData: FormData) {
  const address = formData.get('address') as string;
  const payment = formData.get('payment') as string;
  if (!address || !payment) return { error: 'Missing required fields' };

  try {
    const order = await db.$transaction(async (tx) => {
      const createdOrder = await tx.order.create({
        data: { address, paymentStatus: 'pending' },
        select: { id: true },
      });

      const cartItems = await tx.cart.findMany({
        where: { sessionId: (await cookies()).get('session')?.value },
        select: { productId: true, quantity: true },
      });
      if (cartItems.length === 0) throw new Error('EMPTY_CART');

      const createdItems = await tx.orderItem.createMany({
        data: cartItems.map((i) => ({ orderId: createdOrder.id, ...i })),
      });

      if (createdItems.count !== cartItems.length) {
        throw new Error('ORDER_ITEMS_MISMATCH');
      }

      return createdOrder;
    });

    revalidateTag('cart');
    revalidateTag('orders');
    redirect(`/orders/${order.id}/confirmation`);
  } catch {
    return { error: 'Checkout failed, no changes were committed' };
  }
}

export async function checkout(formData: FormData) {
  const address = formData.get('address') as string;
  const payment = formData.get('payment') as string;
  if (!address || !payment) return { error: 'Missing required fields' };
  const order = await processOrder({ address, payment });
  redirect(`/orders/${order.id}/confirmation`);
}
```

## Client Component Calling Server Action

```typescript
// components/products/AddToCartButton.tsx
'use client'
import { useState, useTransition } from 'react'
import { addToCart } from '@/app/actions/cart'

export function AddToCartButton({ productId }: { productId: string }) {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const handleClick = () => {
    setError(null)
    startTransition(async () => {
      const result = await addToCart(productId)
      if (result.error) setError(result.error)
    })
  }

  return (
    <div>
      <button onClick={handleClick} disabled={isPending} className="btn-primary">
        {isPending ? 'Adding...' : 'Add to Cart'}
      </button>
      {error && <p className="text-red-500 text-sm">{error}</p>}
    </div>
  )
}
```

## Parallel Routes

```typescript
// app/dashboard/layout.tsx
export default function DashboardLayout({
  children, analytics, team,
}: {
  children: React.ReactNode
  analytics: React.ReactNode
  team: React.ReactNode
}) {
  return (
    <div className="dashboard-grid">
      <main>{children}</main>
      <aside className="analytics-panel">{analytics}</aside>
      <aside className="team-panel">{team}</aside>
    </div>
  )
}

// app/dashboard/@analytics/page.tsx
export default async function AnalyticsSlot() {
  return <AnalyticsChart data={await getAnalytics()} />
}

// app/dashboard/@analytics/loading.tsx
export default function AnalyticsLoading() {
  return <ChartSkeleton />
}
```

## Intercepting Routes (Modal Pattern)

```text
app/
├── @modal/
│   ├── (.)photos/[id]/page.tsx
│   └── default.tsx
├── photos/[id]/page.tsx
└── layout.tsx
```

```typescript
// app/@modal/(.)photos/[id]/page.tsx
export default async function PhotoModal({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return <Modal><PhotoDetail photo={await getPhoto(id)} /></Modal>
}

// app/layout.tsx
export default function RootLayout({
  children, modal,
}: {
  children: React.ReactNode
  modal: React.ReactNode
}) {
  return <html><body>{children}{modal}</body></html>
}
```

## Streaming with Suspense

```typescript
// app/product/[id]/page.tsx
export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const product = await getProduct(id)

  return (
    <div>
      <ProductHeader product={product} />
      <Suspense fallback={<ReviewsSkeleton />}>
        <Reviews productId={id} />
      </Suspense>
      <Suspense fallback={<RecommendationsSkeleton />}>
        <Recommendations productId={id} />
      </Suspense>
    </div>
  )
}
```

## Route Handlers

```typescript
// app/api/products/route.ts
export async function GET(request: NextRequest) {
  const category = request.nextUrl.searchParams.get('category');
  const products = await db.product.findMany({
    where: category ? { category } : undefined,
    take: 20,
  });
  return NextResponse.json(products);
}

export async function POST(request: NextRequest) {
  const product = await db.product.create({ data: await request.json() });
  return NextResponse.json(product, { status: 201 });
}

// app/api/products/[id]/route.ts
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = await db.product.findUnique({ where: { id } });
  if (!product) return NextResponse.json({ error: 'Product not found' }, { status: 404 });
  return NextResponse.json(product);
}
```

## Dynamic Metadata + Static Params

```typescript
// app/products/[slug]/page.tsx
type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const product = await getProduct(slug)
  if (!product) return {}
  return {
    title: product.name,
    description: product.description,
    openGraph: { images: [{ url: product.image, width: 1200, height: 630 }] },
    twitter: { card: 'summary_large_image', images: [product.image] },
  }
}

export async function generateStaticParams() {
  const products = await db.product.findMany({ select: { slug: true } })
  return products.map((p) => ({ slug: p.slug }))
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params
  const product = await getProduct(slug)
  if (!product) notFound()
  return <ProductDetail product={product} />
}
```

## More

- Caching and invalidation patterns: `./CACHING.md`

## Troubleshooting

### Hydration Mismatch

Common trigger patterns:

- Rendering `Date.now()`, `Math.random()`, locale-sensitive formatting, or browser-only values during SSR.
- Conditional markup based on `window`, `localStorage`, or media queries before mount.

Fix pattern:

```typescript
'use client'
import { useEffect, useState } from 'react'

export function ClientTime() {
  const [time, setTime] = useState<string>('')

  useEffect(() => {
    setTime(new Date().toLocaleTimeString())
  }, [])

  return <span>{time || '...'}</span>
}
```

Server-safe deterministic render:

```typescript
// Server Component
export default async function Page() {
  const nowIso = new Date().toISOString()
  return <ClientTime initialIso={nowIso} />
}

// Client Component
'use client'
export function ClientTime({ initialIso }: { initialIso: string }) {
  return <time dateTime={initialIso}>{initialIso}</time>
}
```

### Serialization Errors at Server -> Client Boundary

Do not pass these directly as client props:

- Functions and closures
- Class instances
- `Map`, `Set`, `BigInt`, symbols
- DB model instances with custom prototypes

Normalize before boundary crossing:

```typescript
// Server Component
const user = await db.user.findUnique({ where: { id } })

const clientUser = {
  id: user.id,
  name: user.name,
  createdAt: user.createdAt.toISOString(),
  roles: [...new Set(user.roles)],
}

return <UserCard user={clientUser} />
```

```typescript
// Client Component
'use client'
type ClientUser = {
  id: string
  name: string
  createdAt: string
  roles: string[]
}

export function UserCard({ user }: { user: ClientUser }) {
  return <div>{user.name}</div>
}
```

### Quick Debug Checklist

1. Compare first server HTML vs first client render; remove non-deterministic expressions from render paths.
2. Confirm `'use client'` files import only client-safe modules.
3. Validate prop shapes crossing the boundary with plain-object DTOs.
4. Convert `Date`, `Map`, `Set`, and numeric edge types before passing to client components.
5. Re-run after clearing Next.js cache if stale build artifacts are suspected.
