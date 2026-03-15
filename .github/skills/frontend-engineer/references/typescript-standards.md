# TypeScript Standards

## Standards

- Strict mode, no `any` type
- Explicit return types on functions
- Type imports: `import type { User } from '~types/user'`
- Component prop interfaces with JSDoc

## Example

```typescript
import type { FC } from 'react';
import type { User } from '~types/user';

interface MyComponentProps {
  /** User ID to display */
  userId: number;
  /** Optional callback */
  onAction?: () => void;
}

// Note: Using React.FC is optional. The following are alternative ways to define a component—choose one or the other; do not export both MyComponent variants in the same module.
export const MyComponent: FC<MyComponentProps> = ({ userId, onAction }) => {
  // Implementation
};

// You can define the component without React.FC by typing the props directly, which avoids the implicit children prop and is slightly more concise:
export function MyComponent({ userId, onAction }: MyComponentProps) {
  // Implementation
}

// Both forms are acceptable, but the prop-typed function signature is recommended as the simpler alternative.
```
