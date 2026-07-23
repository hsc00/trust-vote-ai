# Middleware Patterns

## Validation (Zod)

```typescript
// middleware/validation.middleware.ts
import { Request, Response, NextFunction } from 'express';
import { AnyZodObject, ZodError } from 'zod';
import { ValidationError } from '../utils/errors';

export const validate =
  (schema: AnyZodObject) => async (req: Request, _res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync({ body: req.body, query: req.query, params: req.params });
      next();
    } catch (err) {
      if (err instanceof ZodError)
        return next(
          new ValidationError(
            'Validation failed',
            err.errors.map((e) => ({ field: e.path.join('.'), message: e.message })),
          ),
        );
      next(err);
    }
  };

// Usage
import { z } from 'zod';
const createUserSchema = z.object({
  body: z.object({
    name: z.string().min(1),
    email: z.string().email(),
    password: z.string().min(8),
  }),
});
router.post('/users', validate(createUserSchema), userController.createUser);
```

## Rate Limiting (Redis-backed)

```typescript
// middleware/rate-limit.middleware.ts
import rateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';
import Redis from 'ioredis';

const redis = new Redis({
  host: process.env.REDIS_HOST,
  port: Number(process.env.REDIS_PORT ?? 6379),
  // Configure retry/backoff strategy for production resilience
  retryStrategy(times) {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
  // maxRetriesPerRequest: 5, // Uncomment to limit retries
});

redis.on('connect', () => {
  console.log('Redis client connecting...');
});
redis.on('ready', () => {
  console.log('Redis client ready');
});
redis.on('error', (err) => {
  console.error('Redis connection error:', err);
});
const store = (prefix: string) => new RedisStore({ client: redis, prefix });

export const apiLimiter = rateLimit({
  store: store('rl:'),
  windowMs: 15 * 60 * 1_000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
});

export const authLimiter = rateLimit({
  store: store('rl:auth:'),
  windowMs: 15 * 60 * 1_000,
  max: 5,
  skipSuccessfulRequests: true,
});
```

## Request Logger (pino)

```typescript
// middleware/logger.middleware.ts
import { Request, Response, NextFunction } from 'express';
import pino from 'pino';

export const logger = pino({
  level: process.env.LOG_LEVEL ?? 'info',
  transport: { target: 'pino-pretty', options: { colorize: true } },
});

export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  res.on('finish', () =>
    logger.info({
      method: req.method,
      url: req.url,
      status: res.statusCode,
      ms: Date.now() - start,
      ip: req.ip,
    }),
  );
  next();
};
```

## Error Handling

```typescript
// utils/errors.ts
export class AppError extends Error {
  constructor(
    message: string,
    public statusCode = 500,
    public isOperational = true,
  ) {
    super(message);
    Object.setPrototypeOf(this, new.target.prototype);
    Error.captureStackTrace(this, this.constructor);
  }
}
export class ValidationError extends AppError {
  constructor(
    msg: string,
    public errors?: unknown[],
  ) {
    super(msg, 400);
  }
}
export class NotFoundError extends AppError {
  constructor(msg = 'Not found') {
    super(msg, 404);
  }
}
export class UnauthorizedError extends AppError {
  constructor(msg = 'Unauthorized') {
    super(msg, 401);
  }
}
export class ForbiddenError extends AppError {
  constructor(msg = 'Forbidden') {
    super(msg, 403);
  }
}
export class ConflictError extends AppError {
  constructor(msg: string) {
    super(msg, 409);
  }
}

// middleware/error-handler.ts
import { Request, Response, NextFunction } from 'express';
import { logger } from './logger.middleware';

export const errorHandler = (err: Error, req: Request, res: Response, _next: NextFunction) => {
  if (err instanceof AppError)
    return res.status(err.statusCode).json({
      status: 'error',
      message: err.message,
      ...(err instanceof ValidationError && { errors: err.errors }),
    });

  logger.error({ error: err.message, stack: err.stack, url: req.url });
  res.status(500).json({
    status: 'error',
    message: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message,
  });
};

// Async route wrapper
export const asyncHandler =
  (fn: (req: Request, res: Response, next: NextFunction) => Promise<unknown>) =>
  (req: Request, res: Response, next: NextFunction) =>
    Promise.resolve(fn(req, res, next)).catch(next);
```

## Standardised API Response

```typescript
// utils/response.ts
import { Response } from 'express';

export class ApiResponse {
  static success<T>(res: Response, data: T, message?: string, statusCode = 200) {
    return res.status(statusCode).json({ status: 'success', message, data });
  }

  static error(res: Response, message: string, statusCode = 500, errors?: unknown) {
    return res.status(statusCode).json({ status: 'error', message, ...(errors && { errors }) });
  }

  static paginated<T>(res: Response, data: T[], page: number, limit: number, total: number) {
    return res.json({
      status: 'success',
      data,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  }
}
```
