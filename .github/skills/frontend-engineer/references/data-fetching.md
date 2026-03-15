# Data Fetching

## PRIMARY PATTERN: useSuspenseQuery

- Use with Suspense boundaries
- Cache-first strategy (check grid cache before API)
- Replaces `isLoading` checks
- Type-safe with generics

## API Service Layer

- Create `features/{feature}/api/{feature}Api.ts`
- Use `apiClient` axios instance
- Centralized methods per feature
- Route format: `/feature/route` (NOT `/api/feature/route`)

## Examples

### 1. API Service File (`features/votes/api/votesApi.ts`)

```typescript
import apiClient from '@/lib/apiClient'; // axios instance
import type { Vote, CreateVotePayload } from '../types';

export const votesApi = {
  getVote: (id: number): Promise<Vote> => apiClient.get<Vote>(`/votes/${id}`).then((r) => r.data),

  listVotes: (): Promise<Vote[]> => apiClient.get<Vote[]>('/votes').then((r) => r.data),

  createVote: (payload: CreateVotePayload): Promise<Vote> =>
    apiClient.post<Vote>('/votes', payload).then((r) => r.data),
};
```

### 2. Component Using `useSuspenseQuery` (`features/votes/components/VoteDetail.tsx`)

```typescript
import React from 'react';
import { useSuspenseQuery } from '@tanstack/react-query';
import { Box, Typography } from '@mui/material';
import { votesApi } from '../api/votesApi';
import type { Vote } from '../types';

interface VoteDetailProps {
    voteId: number;
}

// No isLoading check needed — Suspense boundary handles it.
export const VoteDetail: React.FC<VoteDetailProps> = ({ voteId }) => {
    const { data: vote } = useSuspenseQuery<Vote>({
        queryKey: ['votes', voteId],
        queryFn: () => votesApi.getVote(voteId),
        staleTime: 5 * 60 * 1000, // 5 min cache
    });

    return (
        <Box sx={{ p: 2 }}>
            <Typography variant="h5">{vote.title}</Typography>
            <Typography variant="body2" color="text.secondary">
                {vote.description}
            </Typography>
        </Box>
    );
};

export default VoteDetail;
```

### 3. Route Page Wrapping the Component in a Suspense Boundary (`routes/votes/$voteId/index.tsx`)

```typescript
import React, { Suspense } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { SuspenseLoader } from '~components/SuspenseLoader';

// Lazy-load so the detail bundle is not included in the initial JS chunk.
const VoteDetail = React.lazy(
    () => import('~features/votes/components/VoteDetail'),
);

export const Route = createFileRoute('/votes/$voteId')({
    component: VoteDetailPage,
});

function VoteDetailPage() {
    const { voteId } = Route.useParams();
    const parsedId = Number(voteId);
    if (isNaN(parsedId)) {
        return <div>Invalid vote ID</div>;
    }
    return (
        // SuspenseLoader renders a fade-in skeleton while VoteDetail fetches.
        <SuspenseLoader>
            <VoteDetail voteId={parsedId} />
        </SuspenseLoader>
    );
}
```

### 4. Mutation After a `useSuspenseQuery` (invalidate & refetch pattern)

```typescript
import { useSuspenseQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { votesApi } from '../api/votesApi';

export const VoteList: React.FC = () => {
    const queryClient = useQueryClient();
    const { data: votes } = useSuspenseQuery({
        queryKey: ['votes'],
        queryFn: votesApi.listVotes,
    });

    const { mutate: createVote } = useMutation({
        mutationFn: votesApi.createVote,
        onSuccess: () => {
            // Invalidate so the list re-fetches with the new entry.
            queryClient.invalidateQueries({ queryKey: ['votes'] });
        },
    });

    return (
        <ul>
            {votes.map((v) => (
                <li key={v.id}>{v.title}</li>
            ))}
        </ul>
    );
};
```

## CRITICAL RULE: No Early Returns

```typescript
// ❌ NEVER - causes layout shift and useState reset
if (isLoading) {
    return <LoadingSpinner />;
}

// ✅ ALWAYS - consistent layout, Suspense handles the loading state
<SuspenseLoader>
    <VoteDetail voteId={id} />
</SuspenseLoader>
```

**Why:** Prevents Cumulative Layout Shift (CLS), better UX, and avoids resetting component state on each load.
