# File Organization

## features/ vs components/

- `features/`: Domain-specific (posts, comments, auth)
- `components/`: Truly reusable (SuspenseLoader, CustomAppBar)

## Feature Subdirectories

```plaintext
features/
  my-feature/
    api/          # API service layer
    components/   # Feature components
    hooks/        # Custom hooks
    helpers/      # Utility functions
    types/        # TypeScript types
```

## Complete Feature Example: `votes`

Below is the full file tree and sample code for a new `votes` feature, following every convention in this skill.

### File Tree

```plaintext
src/
├── features/
│   └── votes/
│       ├── index.ts                          # Public API — only export from here
│       ├── api/
│       │   └── votesApi.ts                   # Axios calls for this domain
│       ├── components/
│       │   ├── VoteList.tsx                  # List view (lazy-loaded by route)
│       │   └── VoteDetail.tsx                # Detail view (lazy-loaded by route)
│       ├── hooks/
│       │   └── useVoteFilters.ts             # Feature-specific hook
│       ├── helpers/
│       │   └── formatVote.ts                 # Pure utility — no React
│       └── types/
│           └── index.ts                      # All TypeScript types for votes
└── routes/
    └── votes/
        ├── index.tsx                         # /votes  → VoteList
        └── $voteId/
            └── index.tsx                     # /votes/:voteId → VoteDetail
```

---

### `features/votes/types/index.ts`

```typescript
export interface Vote {
  id: number;
  title: string;
  description: string;
  status: 'open' | 'closed' | 'pending';
  createdAt: string;
}

export interface CreateVotePayload {
  title: string;
  description: string;
}
```

---

### `features/votes/api/votesApi.ts`

```typescript
import apiClient from '@/lib/apiClient';
import type { Vote, CreateVotePayload } from '../types';

export const votesApi = {
  list: (): Promise<Vote[]> => apiClient.get<Vote[]>('/votes').then((r) => r.data),

  getById: (id: number): Promise<Vote> => apiClient.get<Vote>(`/votes/${id}`).then((r) => r.data),

  create: (payload: CreateVotePayload): Promise<Vote> =>
    apiClient.post<Vote>('/votes', payload).then((r) => r.data),
};
```

---

### `features/votes/helpers/formatVote.ts`

```typescript
import type { Vote } from '../types';

export function formatVoteStatus(vote: Vote): string {
  const labels: Record<Vote['status'], string> = {
    open: 'Open for voting',
    closed: 'Voting closed',
    pending: 'Awaiting approval',
  };
  return labels[vote.status];
}
```

---

### `features/votes/hooks/useVoteFilters.ts`

```typescript
import { useState, useMemo } from 'react';
import type { Vote } from '../types';

export function useVoteFilters(votes: Vote[]) {
  const [search, setSearch] = useState('');

  const filtered = useMemo(
    () => votes.filter((v) => v.title.toLowerCase().includes(search.toLowerCase())),
    [votes, search],
  );

  return { search, setSearch, filtered };
}
```

---

### `features/votes/components/VoteList.tsx`

```typescript
import React from 'react';
import { useSuspenseQuery } from '@tanstack/react-query';
import { Box, List, ListItem, ListItemText, TextField, Typography } from '@mui/material';
import { votesApi } from '../api/votesApi';
import { useVoteFilters } from '../hooks/useVoteFilters';
import { formatVoteStatus } from '../helpers/formatVote';

// No isLoading guard — Suspense boundary in the route handles it.
export const VoteList: React.FC = () => {
    const { data: votes } = useSuspenseQuery({
        queryKey: ['votes'],
        queryFn: votesApi.list,
    });

    const { search, setSearch, filtered } = useVoteFilters(votes);

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h4" gutterBottom>
                Votes
            </Typography>
            <TextField
                label="Search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                sx={{ mb: 2 }}
            />
            <List>
                {filtered.map((vote) => (
                    <ListItem key={vote.id} divider>
                        <ListItemText
                            primary={vote.title}
                            secondary={formatVoteStatus(vote)}
                        />
                    </ListItem>
                ))}
            </List>
        </Box>
    );
};

export default VoteList;
```

---

### `features/votes/components/VoteDetail.tsx`

```typescript
import React from 'react';
import { useSuspenseQuery } from '@tanstack/react-query';
import { Box, Chip, Typography } from '@mui/material';
import { votesApi } from '../api/votesApi';
import { formatVoteStatus } from '../helpers/formatVote';

interface VoteDetailProps {
    voteId: number;
}

export const VoteDetail: React.FC<VoteDetailProps> = ({ voteId }) => {
    const { data: vote } = useSuspenseQuery({
        queryKey: ['votes', voteId],
        queryFn: () => votesApi.getById(voteId),
        staleTime: 5 * 60 * 1000,
    });

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h4">{vote.title}</Typography>
            <Chip label={formatVoteStatus(vote)} sx={{ my: 1 }} />
            <Typography variant="body1">{vote.description}</Typography>
        </Box>
    );
};

export default VoteDetail;
```

---

### `features/votes/index.ts` — Public API

Only symbols exported here are importable outside the feature:

```typescript
export { votesApi } from './api/votesApi';
export { VoteList } from './components/VoteList';
export { VoteDetail } from './components/VoteDetail';
export { useVoteFilters } from './hooks/useVoteFilters';
export type { Vote, CreateVotePayload } from './types';
```

---

### `routes/votes/index.tsx` — List Route

```typescript
import React from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { SuspenseLoader } from '~components/SuspenseLoader';

const VoteList = React.lazy(() => import('~features/votes/components/VoteList'));

export const Route = createFileRoute('/votes')({
    component: VotesRoute,
});

function VotesRoute() {
    return (
        <SuspenseLoader>
            <VoteList />
        </SuspenseLoader>
    );
}
```

---

### `routes/votes/$voteId/index.tsx` — Detail Route

```typescript
import React from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { SuspenseLoader } from '~components/SuspenseLoader';

const VoteDetail = React.lazy(
    () => import('~features/votes/components/VoteDetail'),
);

export const Route = createFileRoute('/votes/$voteId')({
    component: VoteDetailRoute,
});

function VoteDetailRoute() {
    const { voteId } = Route.useParams();

    return (
        <SuspenseLoader>
            <VoteDetail voteId={Number(voteId)} />
        </SuspenseLoader>
    );
}
```

---

## Import Aliases

| Alias         | Resolves To      | Example                                                       |
| ------------- | ---------------- | ------------------------------------------------------------- |
| `@/`          | `src/`           | `import { apiClient } from '@/lib/apiClient'`                 |
| `~types`      | `src/types`      | `import type { User } from '~types/user'`                     |
| `~components` | `src/components` | `import { SuspenseLoader } from '~components/SuspenseLoader'` |
| `~features`   | `src/features`   | `import { votesApi } from '~features/votes'`                  |
