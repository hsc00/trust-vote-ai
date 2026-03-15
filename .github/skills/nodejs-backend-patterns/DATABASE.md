# Database Patterns

## PostgreSQL — Connection Pool

```typescript
// config/database.ts
import { Pool } from 'pg';

export const pool = new Pool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT ?? 5432),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  max: 20,
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 2_000,
});

let dbHealthy = true;
function markPoolUnhealthy() {
  dbHealthy = false;
  // Optionally emit a shutdown event or call a graceful shutdown function
  if (typeof gracefulShutdown === 'function') gracefulShutdown();
}

pool.on('error', (err) => {
  console.error('DB pool error', err);
  markPoolUnhealthy();
  // Do not exit immediately; allow for graceful draining and possible recovery
});

export const closeDatabase = () => pool.end();
```

## Repository Pattern (pg)

```typescript
// repositories/user.repository.ts
import { Pool } from 'pg';

export class UserRepository {
  constructor(private readonly db: Pool) {}

  async create(data: { name: string; email: string; password: string }) {
    const { rows } = await this.db.query(
      `INSERT INTO users (name, email, password)
       VALUES ($1, $2, $3)
       RETURNING id, name, email, created_at`,
      [data.name, data.email, data.password],
    );
    return rows[0];
  }

  async findById(id: string) {
    const { rows } = await this.db.query('SELECT * FROM users WHERE id = $1', [id]);
    return rows[0] ?? null;
  }

  async findByEmail(email: string) {
    const { rows } = await this.db.query('SELECT * FROM users WHERE email = $1', [email]);
    return rows[0] ?? null;
  }

  async update(id: string, updates: Record<string, unknown>) {
    const ALLOWED = ['name', 'email', 'password']; // Add permitted columns only
    const fields = Object.keys(updates);
    for (const key of fields) {
      if (!ALLOWED.includes(key)) {
        throw new Error(`Invalid update field: ${key}`);
      }
    }
    const values = fields.map((f) => updates[f]);
    const set = fields.map((f, i) => `${f} = $${i + 2}`).join(', ');
    const { rows } = await this.db.query(
      `UPDATE users SET ${set}, updated_at = NOW() WHERE id = $1 RETURNING *`,
      [id, ...values],
    );
    return rows[0] ?? null;
  }

  async delete(id: string): Promise<boolean> {
    const { rowCount } = await this.db.query('DELETE FROM users WHERE id = $1', [id]);
    return (rowCount ?? 0) > 0;
  }
}
```

## Transaction Pattern

```typescript
async createOrder(userId: string, items: OrderItem[]) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const { rows } = await client.query(
      'INSERT INTO orders (user_id, total) VALUES ($1, $2) RETURNING id',
      [userId, items.reduce((s, i) => s + i.price * i.quantity, 0)],
    );
    const orderId = rows[0].id;

    for (const item of items) {
      await client.query(
        'INSERT INTO order_items (order_id, product_id, quantity, price) VALUES ($1,$2,$3,$4)',
        [orderId, item.productId, item.quantity, item.price],
      );
      const result = await client.query(
        'UPDATE products SET stock = stock - $1 WHERE id = $2 AND stock >= $1',
        [item.quantity, item.productId],
      );
      if (result.rowCount === 0) {
        throw new Error('Insufficient stock for product ' + item.productId);
      }
    }

    await client.query('COMMIT');
    return orderId;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}
```

## MongoDB — Mongoose

```typescript
// config/mongoose.ts
import mongoose from 'mongoose';

export const connectDB = async () => {
  await mongoose.connect(process.env.MONGODB_URI!, {
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 5_000,
    socketTimeoutMS: 45_000,
  });
};

mongoose.connection.on('error', (err) => console.error('MongoDB error:', err));

// Schema example
import { Schema, model, Document } from 'mongoose';

interface IUser extends Document {
  name: string;
  email: string;
  password: string;
}

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
  },
  { timestamps: true },
);
userSchema.index({ email: 1 });

export const User = model<IUser>('User', userSchema);
```

## Redis Cache

```typescript
// utils/cache.ts
import Redis from 'ioredis';

const redis = new Redis({
  host: process.env.REDIS_HOST,
  port: Number(process.env.REDIS_PORT ?? 6379),
  retryStrategy: (times) => Math.min(times * 50, 2_000),
});

export class CacheService {
  async get<T>(key: string): Promise<T | null> {
    const raw = await redis.get(key);
    return raw ? (JSON.parse(raw) as T) : null;
  }

  async set(key: string, value: unknown, ttl?: number) {
    const s = JSON.stringify(value);
    ttl ? await redis.setex(key, ttl, s) : await redis.set(key, s);
  }

  async delete(key: string) {
    await redis.del(key);
  }

  async invalidatePattern(pattern: string) {
    let cursor = '0';
    const batchSize = 500;
    do {
      const [nextCursor, keys] = await redis.scan(cursor, 'MATCH', pattern, 'COUNT', batchSize);
      cursor = nextCursor;
      if (keys.length) {
        for (let i = 0; i < keys.length; i += batchSize) {
          const batch = keys.slice(i, i + batchSize);
          await redis.del(...batch);
        }
      }
    } while (cursor !== '0');
  }
}

// Cache decorator
export function Cacheable(ttl = 300) {
  return (_target: unknown, key: string, descriptor: PropertyDescriptor) => {
    const original = descriptor.value;
    descriptor.value = async function (...args: unknown[]) {
      const cache = new CacheService();
      const cacheKey = `${key}:${JSON.stringify(args)}`;
      const cached = await cache.get(cacheKey);
      if (cached != null) return cached;
      const result = await original.apply(this, args);
      await cache.set(cacheKey, result, ttl);
      return result;
    };
    return descriptor;
  };
}
```
