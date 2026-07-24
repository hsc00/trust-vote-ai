# Component Patterns

Modern React components use:

- Declare function components with explicit prop types (e.g., `function MyComponent(props: Props)` or `const MyComponent: (props: Props) => JSX.Element`) for type safety
- Using `React.FC<Props>` is optional and acceptable if you want implicit children typing or other React.FC conveniences
- `React.lazy()` for code splitting
- SuspenseLoader for loading states
- Named const + default export pattern

## Key Concepts

- Lazy load heavy components (DataGrid, charts, editors)
- Always wrap lazy components in Suspense
- Use SuspenseLoader component (with fade animation)
- Component structure: Props → Hooks → Handlers → Render → Export

## Examples

### 1. Full Component with `useSuspenseQuery` and `SuspenseLoader`

```typescript
// features/dashboard/components/StatCard.tsx
import React, { useCallback } from 'react';
import { Box, Paper, Typography } from '@mui/material';
import { useSuspenseQuery } from '@tanstack/react-query';
import { dashboardApi } from '../api/dashboardApi';
import type { Stat } from '../types';

interface StatCardProps {
    statId: number;
    onRefresh?: () => void;
}

// Props → hooks → handlers → render → export
export const StatCard: React.FC<StatCardProps> = ({ statId, onRefresh }) => {
    const { data } = useSuspenseQuery<Stat>({
        queryKey: ['stat', statId],
        queryFn: () => dashboardApi.getStat(statId),
    });

    const handleRefresh = useCallback(() => {
        onRefresh?.();
    }, [onRefresh]);

    return (
        <Paper sx={{ p: 3 }}>
            <Typography variant="h6">{data.label}</Typography>
            <Typography variant="h3">{data.value}</Typography>
            <Box component="button" onClick={handleRefresh} sx={{ mt: 1 }}>
                Refresh
            </Box>
        </Paper>
    );
};

export default StatCard;
```

### 2. `React.lazy` — Lazy Loading a Heavy Component

```typescript
// routes/dashboard/index.tsx
import React, { Suspense } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { SuspenseLoader } from '~components/SuspenseLoader';

// The chart bundle is NOT included in the initial JS payload.
// It is downloaded only when this route is first visited.
const AnalyticsChart = React.lazy(
    () => import('~features/analytics/components/AnalyticsChart'),
);

export const Route = createFileRoute('/dashboard')({
    component: DashboardPage,
});

function DashboardPage() {
    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h4">Dashboard</Typography>

            {/*
             * SuspenseLoader shows a fade-in skeleton while the lazy
             * chunk loads AND while useSuspenseQuery inside AnalyticsChart
             * fetches its data — both in a single boundary.
             */}
            <SuspenseLoader>
                <AnalyticsChart />
            </SuspenseLoader>
        </Box>
    );
}
```

### 3. `SuspenseLoader` — Multiple Independent Boundaries

When sections of a page load independently, give each its own boundary so
one slow fetch doesn't block the rest of the UI:

```typescript
import React, { Suspense } from 'react';
import { SuspenseLoader } from '~components/SuspenseLoader';

const StatCard = React.lazy(() => import('~features/dashboard/components/StatCard'));
const RecentActivity = React.lazy(() => import('~features/activity/components/RecentActivity'));

export const OverviewPage: React.FC = () => (
    <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
        {/* Each boundary resolves independently */}
        <SuspenseLoader>
            <StatCard statId={1} />
        </SuspenseLoader>

        <SuspenseLoader>
            <RecentActivity limit={5} />
        </SuspenseLoader>
    </Box>
);

export default OverviewPage;
```

### 4. `SuspenseLoader` — Inline Fallback Override

`SuspenseLoader` wraps `<Suspense>` and provides a default fade-in skeleton.
Pass a custom `fallback` when a section requires a different loading treatment:

```typescript
import { SuspenseLoader } from '~components/SuspenseLoader';
import { Skeleton } from '@mui/material';

// Use default fade skeleton (most common)
<SuspenseLoader>
    <HeavyTable />
</SuspenseLoader>

// Override with a table-shaped skeleton for better perceived performance
<SuspenseLoader fallback={<Skeleton variant="rectangular" height={300} />}>
    <HeavyTable />
</SuspenseLoader>
```
