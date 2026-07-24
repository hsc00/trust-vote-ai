# Layered Architecture & Dependency Injection

## Folder Structure

```
src/
├── controllers/
├── services/
├── repositories/
├── middleware/
├── routes/
├── config/
└── types/
```

## Controller Layer

```typescript
// controllers/user.controller.ts
export class UserController {
  constructor(private readonly userService: UserService) {}


  createUser = asyncHandler(async (req, res) => {
    // Validate and sanitize input
    const result = validateDto(CreateUserDTO, req.body);
    if (!result.valid) {
      return ApiResponse.error(res, result.errors, 400);
    }
    const user = await this.userService.createUser(result.value);
    ApiResponse.success(res, user, 'User created', 201);
  });

  getUser = asyncHandler(async (req, res) => {
    const user = await this.userService.getUserById(req.params.id);
    ApiResponse.success(res, user);
  });


  updateUser = asyncHandler(async (req, res) => {
    // Validate and sanitize input
    const result = validateDto(UpdateUserDTO, req.body);
    if (!result.valid) {
      return ApiResponse.error(res, result.errors, 400);
    }
    const user = await this.userService.updateUser(req.params.id, result.value);
    ApiResponse.success(res, user);
  });
// ...
// Example validateDto utility (implementation depends on chosen validation library)
function validateDto(DtoClass, data) {
  // Use class-validator, joi, zod, or custom logic
  // Return { valid: boolean, value: sanitized, errors?: any }
  // This is a placeholder for illustration.
  return { valid: true, value: data };
}

  deleteUser = asyncHandler(async (req, res) => {
    await this.userService.deleteUser(req.params.id);
    res.status(204).send();
  });
}
```

## Service Layer

```typescript
// services/user.service.ts
export class UserService {
  constructor(private readonly userRepository: UserRepository) {}

  async createUser(data: CreateUserDTO): Promise<User> {
    if (await this.userRepository.findByEmail(data.email))
      throw new ConflictError('Email already exists');

    const hashed = await bcrypt.hash(data.password, 10);
    const { password: _, ...user } = await this.userRepository.create({
      ...data,
      password: hashed,
    });
    return user as User;
  }

  async getUserById(id: string): Promise<User> {
    const user = await this.userRepository.findById(id);
    if (!user) throw new NotFoundError('User not found');
    const { password: _, ...safe } = user;
    return safe as User;
  }

  async updateUser(id: string, updates: UpdateUserDTO): Promise<User> {
    // Hash password if present
    let updatesToSave = { ...updates };
    if (updates.password) {
      updatesToSave.password = await bcrypt.hash(updates.password, 10);
    }
    const user = await this.userRepository.update(id, updatesToSave);
    if (!user) throw new NotFoundError('User not found');
    const { password: _, ...safe } = user;
    return safe as User;
  }

  async deleteUser(id: string): Promise<void> {
    if (!(await this.userRepository.delete(id))) throw new NotFoundError('User not found');
  }
}
```

## DI Container

```typescript
// di-container.ts
type Token<T> = symbol & { _type?: T };

class Container {
  private readonly registry = new Map<Token<any>, () => any>();

  register<T>(key: Token<T>, factory: () => T): void {
    this.registry.set(key, factory);
  }

  singleton<T>(key: Token<T>, factory: () => T): void {
    let instance: T;
    this.registry.set(key, () => (instance ??= factory()));
  }

  resolve<T>(key: Token<T>): T {
    const factory = this.registry.get(key);
    if (!factory) throw new Error(`Nothing registered for token`);
    return factory();
  }
}

// Token definitions
export const TOKENS = {
  db: Symbol('db') as Token<Pool>,
  userRepository: Symbol('userRepository') as Token<UserRepository>,
  userService: Symbol('userService') as Token<UserService>,
  authService: Symbol('authService') as Token<AuthService>,
  userController: Symbol('userController') as Token<UserController>,
};

export const container = new Container();

container.singleton(TOKENS.db, () => new Pool({/* pg config */}));
container.singleton(TOKENS.userRepository, () => new UserRepository(container.resolve(TOKENS.db)));
container.singleton(
  TOKENS.userService,
  () => new UserService(container.resolve(TOKENS.userRepository)),
);
container.singleton(
  TOKENS.authService,
  () => new AuthService(container.resolve(TOKENS.userRepository)),
);
container.register(
  TOKENS.userController,
  () => new UserController(container.resolve(TOKENS.userService)),
);
```
