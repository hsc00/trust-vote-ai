# Performance Optimization

## Optimization Patterns

- `useMemo`: Expensive computations (filter, sort, map)
- `useCallback`: Event handlers passed to children
- `React.memo`: Expensive components
- Debounced search (300-500ms)
- Memory leak prevention (cleanup in useEffect)

## Code Splitting

- Split code by route or feature
- Lazy load components and assets
- Use dynamic imports

### Pattern: Route-Level Lazy Loading

Each route gets its own lazy boundary, so the page's JS is only fetched when the user navigates there.

```typescript
// routes/reports/index.tsx
import React, { Suspense } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { SuspenseLoader } from '~components/SuspenseLoader';

// Heavy DataGrid + chart bundle — excluded from the initial JS.
const ReportsPage = React.lazy(
    () => import('~features/reports/components/ReportsPage'),
);

export const Route = createFileRoute('/reports')({
    component: ReportsRoute,
});

function ReportsRoute() {
    return (
        <SuspenseLoader>
            <ReportsPage />
        </SuspenseLoader>
    );
}
```

### Pattern: Component-Level Lazy Loading

For heavy components nested inside a page that is itself already loaded:

```typescript
// features/reports/components/ReportsPage.tsx
import React, { Suspense } from 'react';
import { Box, Typography } from '@mui/material';
import { Skeleton } from '@mui/material';
import { SuspenseLoader } from '~components/SuspenseLoader';

// Lazily import the heavy data grid — only fetched when ReportsPage mounts.
const HeavyDataGrid = React.lazy(
    () => import('./HeavyDataGrid'),
);

// Also lazily import a charting library (e.g. recharts bundle).
const TrendChart = React.lazy(
    () => import('./TrendChart'),
);

export const ReportsPage: React.FC = () => (
    <Box sx={{ p: 3 }}>
        <Typography variant="h4">Reports</Typography>

        {/* Each boundary resolves independently — chart doesn't block table */}
        <SuspenseLoader fallback={<Skeleton variant="rectangular" height={400} />}>
            <HeavyDataGrid />
        </SuspenseLoader>

        <SuspenseLoader fallback={<Skeleton variant="rectangular" height={250} />}>
            <TrendChart />
        </SuspenseLoader>
    </Box>
);

export default ReportsPage;
```

### Quick Reference

| What to lazy-load                | Reason                               |
| -------------------------------- | ------------------------------------ |
| Route page components            | Largest chunks; never needed upfront |
| DataGrid / AG Grid               | Heavy dependency                     |
| Chart libraries (recharts, visx) | Large bundle                         |
| Rich text editors                | Rarely needed on first load          |
| Admin-only panels                | Conditional audience                 |
