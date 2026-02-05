import {
  pgTable,
  uuid,
  text,
  timestamp,
  pgEnum,
  vector,
  jsonb,
  varchar,
  integer,
} from 'drizzle-orm/pg-core';

export const statusEnum = pgEnum('status', ['draft', 'active', 'revoked']);
export const decisionEnum = pgEnum('decision', ['yes', 'no', 'abstain']);

export const legislativeDocs = pgTable('legislative_docs', {
  id: uuid('id').defaultRandom().primaryKey(),
  title: varchar('title', { length: 255 }).notNull(),
  content: text('content').notNull(),
  url: text('url'),
  contentHash: varchar('content_hash', { length: 128 }).notNull(),
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

export const merkleSnapshots = pgTable('merkle_snapshots', {
  id: uuid('id').defaultRandom().primaryKey(),
  docId: uuid('doc_id').references(() => legislativeDocs.id),
  rootHash: varchar('root_hash', { length: 128 }).notNull(),
  totalVotes: integer('total_votes').notNull(),
  algorithm: varchar('algorithm', { length: 20 }).default('SHA3-512'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const votes = pgTable('votes', {
  id: uuid('id').defaultRandom().primaryKey(),
  docId: uuid('doc_id').references(() => legislativeDocs.id),
  userId: uuid('user_id').notNull(),
  decision: decisionEnum('decision').notNull(),
  hash: varchar('hash', { length: 128 }).notNull(),
  timestamp: timestamp('timestamp').defaultNow().notNull(),
});
