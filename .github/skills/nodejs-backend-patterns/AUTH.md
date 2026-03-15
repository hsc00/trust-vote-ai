# Authentication & Authorization

## JWT Middleware (Express)

```typescript
// middleware/auth.middleware.ts
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { UnauthorizedError } from '../utils/errors';

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('JWT_SECRET environment variable is not set');
  return secret;
}

interface JWTPayload {
  userId: string;
  email: string;
  roles?: string[];
}

declare global {
  namespace Express {
    interface Request {
      user?: JWTPayload;
    }
  }
}

export const authenticate = async (req: Request, _res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) throw new UnauthorizedError('No token provided');
    req.user = jwt.verify(token, getJwtSecret()) as JWTPayload;
    next();
  } catch {
    next(new UnauthorizedError('Invalid token'));
  }
};

export const authorize =
  (...roles: string[]) =>
  (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) return next(new UnauthorizedError('Not authenticated'));
    if (!roles.some((r) => req.user?.roles?.includes(r)))
      return next(new UnauthorizedError('Insufficient permissions'));
    next();
  };
```

## JWT Auth Service

```typescript
// services/auth.service.ts
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { UserRepository } from '../repositories/user.repository';
import { UnauthorizedError } from '../utils/errors';

export class AuthService {
  constructor(private readonly userRepository: UserRepository) {}

  async login(email: string, password: string) {
    const user = await this.userRepository.findByEmail(email);
    if (!user || !(await bcrypt.compare(password, user.password)))
      throw new UnauthorizedError('Invalid credentials');

    return {
      token: this.sign(
        { userId: user.id, email: user.email, roles: user.roles },
        getJwtSecret(),
        '15m',
      ),
      refreshToken: this.sign(
        { userId: user.id, roles: user.roles },
        process.env.REFRESH_TOKEN_SECRET!,
        '7d',
      ),
      user: { id: user.id, name: user.name, email: user.email, roles: user.roles },
    };
  }

  async refreshToken(refreshToken: string) {
    try {
      const { userId } = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET!) as {
        userId: string;
      };
      const user = await this.userRepository.findById(userId);
      if (!user) throw new UnauthorizedError('User not found');
      return {
        token: this.sign({ userId: user.id, email: user.email }, getJwtSecret(), '15m'),
      };
    } catch {
      throw new UnauthorizedError('Invalid refresh token');
    }
  }

  private sign(payload: object, secret: string, expiresIn: string): string {
    return jwt.sign(payload, secret, { expiresIn });
  }
}
```

## NestJS Guards (Passport / JWT)

```typescript
// guards/jwt-auth.guard.ts
import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private readonly reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>('isPublic', [
      context.getHandler(),
      context.getClass(),
    ]);
    return isPublic || super.canActivate(context);
  }
}

// guards/roles.guard.ts
import { Injectable, ExecutionContext, CanActivate } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const roles = this.reflector.getAllAndOverride<string[]>('roles', [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!roles?.length) return true;
    const user = context.switchToHttp().getRequest().user;
    const userRoles = Array.isArray(user?.roles) ? user.roles : [];
    return roles.some((role) => userRoles.includes(role));
  }
}

// decorators
import { SetMetadata, createParamDecorator, ExecutionContext } from '@nestjs/common';
export const Public = () => SetMetadata('isPublic', true);
export const Roles = (...roles: string[]) => SetMetadata('roles', roles);
export const CurrentUser = createParamDecorator(
  (_: unknown, ctx: ExecutionContext) => ctx.switchToHttp().getRequest().user,
);
```
