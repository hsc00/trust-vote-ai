---
name: vkc-drizzle-schema-migration
description: Standardize Drizzle schema/migration/seed workflow for Viet K-Connect. Use when adding or changing DB tables, especially DB-driven visa rulesets and document templates (no hardcoding). Concrete actions include: create migration files via `npm run db:generate`, generate seed data with `npm run db:seed`, and update schema definitions in `src/lib/db/schema.ts`.
metadata:
  short-description: Drizzle schema + migration workflow
---

# VKC Drizzle Schema & Migration

## When to use

- Adding/updating DB tables/enums/indexes
- Introducing DB-driven configuration (visa rulesets, doc templates, regulation snapshots)

## Hard rules

- DB schema lives in `src/lib/db/schema.ts`.
- Migrations are generated/applied via `drizzle-kit` (`npm run db:generate`, `npm run db:migrate`).
- **Visa rulesets and doc templates MUST be DB tables**, not hardcoded TS objects.
- Coordinate ownership: `src/lib/db/schema.ts` and `src/lib/db/migrations/**` should not be modified concurrently by multiple agents.

## Workflow

1. Update `src/lib/db/schema.ts`

- Add table(s), enum(s), indexes.
- Prefer explicit indexes for `(userId, createdAt)` where rate limits depend on time windows.

2. Generate migration

- `npm run db:generate`
- ✔ Verify: open the generated file in `src/lib/db/migrations/` and confirm the SQL matches the intended schema change (correct columns, types, indexes, no unintended drops).

3. Apply migration locally (if DB configured)

- `npm run db:migrate`
- ✔ Verify: run `SELECT * FROM drizzle.__drizzle_migrations ORDER BY created_at DESC LIMIT 5;` and confirm the new migration appears with a non-null `created_at`.

4. Seed (if needed)

- Use `npm run db:seed` or project seed scripts.
- ✔ Verify: query the seeded table and confirm expected row count and column values.

## Error recovery

**Migration conflict — `db:generate` produces unexpected DROP or ALTER**

- Cause: local schema diverged from the last migration (e.g., column renamed manually in DB).
- Fix: do NOT apply. Delete the generated file, restore the DB column to match `schema.ts`, then re-run `npm run db:generate`.

**`db:migrate` fails mid-run (partial apply)**

- Cause: SQL error inside a migration (constraint violation, missing extension, etc.).
- Fix:
  1. Identify the failing statement from the error output.
  2. Connect to the DB and manually roll back any partial changes (DROP the half-created table/column).
  3. Delete the offending migration file, fix `schema.ts`, and regenerate.
  4. Never edit an already-applied migration file — create a new one instead.

**Migration already recorded but schema not applied (journal / DB out of sync)**

- Symptom: `__drizzle_migrations` has the entry but the table/column is missing.
- Fix: delete the stale journal entry (`DELETE FROM drizzle.__drizzle_migrations WHERE hash = '<hash>';`), then re-run `npm run db:migrate`.

**`db:seed` fails with unique-constraint violation**

- Cause: seed script re-runs on a DB that already has data.
- Fix: add an `ON CONFLICT DO NOTHING` clause to seed inserts, or truncate the target table before seeding in local/dev environments only.

## Schema example — visa ruleset table

```typescript
// src/lib/db/schema.ts
import { pgTable, uuid, text, jsonb, timestamp, index, pgEnum } from 'drizzle-orm/pg-core';

export const rulesetStatusEnum = pgEnum('ruleset_status', ['draft', 'active', 'archived']);

export const visaTransitionRules = pgTable(
  'visa_transition_rules',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    fromVisa: text('from_visa').notNull(),
    toVisa: text('to_visa').notNull(),
    ruleset: jsonb('ruleset').notNull(), // structured eligibility rules
    version: text('version').notNull(),
    effectiveFrom: timestamp('effective_from', { withTimezone: true }).notNull(),
    status: rulesetStatusEnum('status').notNull().default('draft'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index('idx_vtr_from_to').on(t.fromVisa, t.toVisa),
    index('idx_vtr_status_effective').on(t.status, t.effectiveFrom),
  ],
);
```

## References

- Rules & examples: `.codex/skills/vkc-drizzle-schema-migration/references/drizzle-rules.md`
