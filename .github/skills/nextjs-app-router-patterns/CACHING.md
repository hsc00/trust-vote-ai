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
  // Basic input validation (customize as needed)
  if (!id || typeof id !== 'string') {
    return { error: 'Invalid product ID' };
  }
  if (!data || typeof data !== 'object') {
    return { error: 'Invalid data object' };
  }
  // Example: check required fields (customize for your schema)
  if (!data.name || typeof data.name !== 'string' || data.name.length > 100) {
    return { error: 'Invalid or missing product name' };
  }
  // Add more field/type/length checks as needed

  try {
    const updated = await db.product.update({
      where: { id },
      data,
      select: { id: true, updatedAt: true },
    });

    if (!updated?.id) {
      return { error: 'Product not found or update failed' };
    }

    revalidateTag('products');
    revalidatePath('/products');
    revalidatePath(`/products/${id}`);
    return { success: true };
  } catch (err) {
    return {
      error: 'Exception during update',
      message: err instanceof Error ? err.message : String(err),
    };
  }
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

    // Assumption: updatedAt is auto-updated by the DB on every mutation.
    // If your schema does not guarantee this, use a version/rowVersion column or check the DB's affected-rows/returning count for reliable change detection.
    // The following check treats no-change updates as errors based on updatedAt:
    if (!after?.id || after.updatedAt.getTime() === before.updatedAt.getTime()) {
      return { error: 'No persisted change detected (updatedAt unchanged; see note above)' };
    }

    revalidateTag('products');
    revalidateTag(`product:${id}`);
    return { success: true };
  } catch (err) {
    console.error('safeUpdateProduct error:', err);
    return { error: 'Mutation failed', message: err instanceof Error ? err.message : String(err) };
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
  } catch (err) {
    if (err instanceof Error && err.message === 'NEGATIVE_STOCK') {
      return { error: 'NEGATIVE_STOCK' };
    }
    console.error('transferInventory error:', err);
    return {
      error: 'Transfer failed, transaction rolled back',
      cause: err instanceof Error ? err.message : String(err),
    };
  }
}
```

## Reference

- Pattern catalog: `./PATTERNS.md`
- Skill index: `./SKILL.md`
