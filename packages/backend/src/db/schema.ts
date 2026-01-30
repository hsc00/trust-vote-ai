import {
  pgTable,
  uuid,
  text,
  timestamp,
  pgEnum,
  vector,
  jsonb,
  varchar,
} from 'drizzle-orm/pg-core';

export const statusEnum = pgEnum('status', ['draft', 'active', 'revoked']);
export const decisionEnum = pgEnum('decision', ['yes', 'no', 'abstain']);

export const legislativeDocs = pgTable('legislative_docs', {
  id: uuid('id').defaultRandom().primaryKey(),
  title: varchar('title', { length: 255 }).notNull(),
  content: text('content').notNull(),
  url: text('url'),
  status: statusEnum('status').default('draft'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const docChunksEmbeddings = pgTable('doc_chunks_embeddings', {
  id: uuid('id').defaultRandom().primaryKey(),
  docId: uuid('doc_id').references(() => legislativeDocs.id, { onDelete: 'cascade' }),
  chunkContent: text('chunk_content').notNull(),
  embedding: vector('embedding', { dimensions: 1536 }),
  metadata: jsonb('metadata'),
});

export const votes = pgTable('votes', {
  id: uuid('id').defaultRandom().primaryKey(),
  docId: uuid('doc_id').references(() => legislativeDocs.id),
  userId: uuid('user_id').notNull(),
  decision: decisionEnum('decision').notNull(),
  hash: text('hash').notNull(),
  timestamp: timestamp('timestamp').defaultNow().notNull(),
});
