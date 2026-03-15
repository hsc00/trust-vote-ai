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
    const user = await this.userService.createUser(req.body as CreateUserDTO);
    ApiResponse.success(res, user, 'User created', 201);
  });

  getUser = asyncHandler(async (req, res) => {
    const user = await this.userService.getUserById(req.params.id);
    ApiResponse.success(res, user);
  });

  updateUser = asyncHandler(async (req, res) => {
    const user = await this.userService.updateUser(req.params.id, req.body as UpdateUserDTO);
    ApiResponse.success(res, user);
  });

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
    const user = await this.userRepository.update(id, updates);
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
class Container {
  private readonly registry = new Map<string, () => unknown>();

  register<T>(key: string, factory: () => T): void {
    this.registry.set(key, factory);
  }

  singleton<T>(key: string, factory: () => T): void {
    let instance: T;
    this.registry.set(key, () => (instance ??= factory()));
  }

  resolve<T>(key: string): T {
    const factory = this.registry.get(key);
    if (!factory) throw new Error(`Nothing registered for "${key}"`);
    return factory() as T;
  }
}

export const container = new Container();

container.singleton(
  'db',
  () =>
    new Pool({
      /* pg config */
    }),
);
container.singleton('userRepository', () => new UserRepository(container.resolve('db')));
container.singleton('userService', () => new UserService(container.resolve('userRepository')));
container.singleton('authService', () => new AuthService(container.resolve('userRepository')));
container.register('userController', () => new UserController(container.resolve('userService')));
```
