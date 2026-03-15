# TypeScript Standards

## Standards

- Strict mode, no `any` type
- Explicit return types on functions
- Type imports: `import type { User } from '~types/user'`
- Component prop interfaces with JSDoc

## Example

```typescript
import type { User } from '~types/user';

interface MyComponentProps {
  /** User ID to display */
  userId: number;
  /** Optional callback */
  onAction?: () => void;
}


# Note: Using React.FC is optional. Instead of the following:
export const MyComponent: React.FC<MyComponentProps> = ({ userId, onAction }) => {
  // Implementation
};

# You can define the component without React.FC by typing the props directly, which avoids the implicit children prop and is slightly more concise:
export function MyComponent({ userId, onAction }: MyComponentProps) {
  // Implementation
}

# Both forms are acceptable, but the prop-typed function signature is recommended as the simpler alternative.
```
