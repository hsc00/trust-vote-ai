---
name: nodejs-backend-patterns
description: Build production-ready Node.js backend services with Express/Fastify, implementing middleware patterns, error handling, authentication, database integration, and API design best practices. Use when creating Node.js servers, REST APIs, GraphQL backends, or microservices architectures.
---

# Node.js Backend Patterns

## Quick Start

**Express:**

```typescript
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import { requestLogger } from './middleware/logger.middleware';
import { errorHandler } from './middleware/error-handler';
import { apiLimiter } from './middleware/rate-limit.middleware';
import { router } from './routes';

const app = express();
app.use(helmet());
app.use(cors({ origin: process.env.ALLOWED_ORIGINS?.split(',') }));
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(apiLimiter);
app.use(requestLogger);
app.use('/api', router);
app.use(errorHandler);
app.listen(process.env.PORT ?? 3000);
```

**Fastify:**

```typescript
import Fastify from 'fastify';

const fastify = Fastify({ logger: { level: process.env.LOG_LEVEL ?? 'info' } });
await fastify.register(import('@fastify/helmet'));
await fastify.register(import('@fastify/cors'), {
  origin: process.env.ALLOWED_ORIGINS?.split(','),
});
await fastify.register(import('@fastify/compress'));
await fastify.register(import('@fastify/rate-limit'), { max: 100, timeWindow: '15 minutes' });

fastify.post<{ Body: { name: string; email: string } }>(
  '/users',
  {
    schema: {
      body: {
        type: 'object',
        required: ['name', 'email'],
        properties: {
          name: { type: 'string', minLength: 1 },
          email: { type: 'string', format: 'email' },
        },
      },
    },
  },
  // Add at the top of your file:
  // import { randomUUID } from 'node:crypto';
  async (req) => ({ id: randomUUID(), name: req.body.name }),
);

await fastify.listen({ port: +(process.env.PORT ?? 3000), host: '0.0.0.0' });
```

## Reference

| Topic                                                                   | File                                 |
| ----------------------------------------------------------------------- | ------------------------------------ |
| Layered architecture, controller/service/repository, DI container       | [ARCHITECTURE.md](./ARCHITECTURE.md) |
| JWT middleware, auth service, NestJS guards & decorators                | [AUTH.md](./AUTH.md)                 |
| Validation (Zod), rate limiting, request logging, error handling        | [MIDDLEWARE.md](./MIDDLEWARE.md)     |
| PostgreSQL pool, repository pattern, transactions, MongoDB, Redis cache | [DATABASE.md](./DATABASE.md)         |
