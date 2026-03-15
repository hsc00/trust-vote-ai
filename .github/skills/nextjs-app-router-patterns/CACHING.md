# Next.js App Router Caching Strategies

## Fetch Cache Modes

```typescript
fetch(url, { cache: 'no-store' });
fetch(url, { cache: 'force-cache' });
fetch(url, { next: { revalidate: 60 } });
fetch(url, { next: { tags: ['products'] } });
```

## On-demand Invalidation from Server Actions

```typescript
'use server';
import { revalidatePath, revalidateTag } from 'next/cache';

export async function updateProduct(id: string, data: ProductData) {
  const updated = await db.product.update({
    where: { id },
    data,
    select: { id: true, updatedAt: true },
  });

  if (!updated?.id) {
    return { error: 'Update failed' };
  }

  revalidateTag('products');
  revalidatePath('/products');
  revalidatePath(`/products/${id}`);
  return { success: true };
}
```

## Tag Design Pattern

```typescript
// List queries
await fetch(`${API_URL}/products`, { next: { tags: ['products'] } });

// Item queries
await fetch(`${API_URL}/products/${id}`, {
  next: { tags: [`product:${id}`, 'products'] },
});

// Invalidation after mutation
revalidateTag('products');
revalidateTag(`product:${id}`);
```

## Read and Write Checkpoints

```typescript
'use server';

export async function safeUpdateProduct(id: string, data: ProductData) {
  try {
    const before = await db.product.findUnique({
      where: { id },
      select: { id: true, updatedAt: true },
    });
    if (!before) return { error: 'Product not found' };

    const after = await db.product.update({
      where: { id },
      data,
      select: { id: true, updatedAt: true },
    });

    if (!after?.id || after.updatedAt.getTime() === before.updatedAt.getTime()) {
      return { error: 'No persisted change detected' };
    }

    revalidateTag('products');
    revalidateTag(`product:${id}`);
    return { success: true };
  } catch {
    return { error: 'Mutation failed' };
  }
}
```

## Transaction + Rollback for Multi-step Mutations

```typescript
'use server';

export async function transferInventory(fromId: string, toId: string, quantity: number) {
  if (quantity <= 0) return { error: 'Invalid quantity' };

  try {
    await db.$transaction(async (tx) => {
      const source = await tx.inventory.update({
        where: { productId: fromId },
        data: { count: { decrement: quantity } },
        select: { count: true },
      });

      if (source.count < 0) {
        throw new Error('NEGATIVE_STOCK');
      }

      await tx.inventory.update({
        where: { productId: toId },
        data: { count: { increment: quantity } },
      });
    });

    revalidateTag(`product:${fromId}`);
    revalidateTag(`product:${toId}`);
    return { success: true };
  } catch {
    return { error: 'Transfer failed, transaction rolled back' };
  }
}
```

## Reference

- Pattern catalog: `./PATTERNS.md`
- Skill index: `./SKILL.md`
