import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as dotenv from 'dotenv';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as schema from './src/db/schema.js';
import { randomUUID } from 'node:crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '.env') });

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error('DATABASE_URL is not set');
}

const pool = new Pool({
  connectionString: databaseUrl,
});

const db = drizzle(pool, { schema });

async function seed() {
  console.log('Seeding database...');

  const docs = [
    {
      id: randomUUID(),
      title: 'Climate Change Bill 2026',
      content:
        'A comprehensive bill to address climate change through renewable energy incentives.',
      url: 'https://example.com/climate-bill',
      contentHash: 'hash1',
      status: 'active' as const,
    },
    {
      id: randomUUID(),
      title: 'Education Reform Act',
      content: 'Reforms to improve public education funding and standards.',
      url: 'https://example.com/education-act',
      contentHash: 'hash2',
      status: 'draft' as const,
    },
  ];

  const votes = [
    {
      id: randomUUID(),
      docId: docs[0].id,
      userId: randomUUID(),
      decision: 'yes' as const,
      hash: 'votehash1',
    },
    {
      id: randomUUID(),
      docId: docs[0].id,
      userId: randomUUID(),
      decision: 'no' as const,
      hash: 'votehash2',
    },
    {
      id: randomUUID(),
      docId: docs[1].id,
      userId: randomUUID(),
      decision: 'abstain' as const,
      hash: 'votehash3',
    },
  ];

  const snapshot = {
    id: randomUUID(),
    docId: docs[0].id,
    rootHash: 'merkleroot1',
    totalVotes: 2,
    algorithm: 'SHA3-512',
  };

  await db.transaction(async (tx) => {
    await tx.insert(schema.legislativeDocs).values(docs);
    console.log('Inserted legislative docs');

    await tx.insert(schema.votes).values(votes);
    console.log('Inserted votes');

    await tx.insert(schema.merkleSnapshots).values(snapshot);
    console.log('Inserted merkle snapshot');
  });

  console.log('Seeding complete!');
  process.exit(0);
}

try {
  await seed();
} catch (err) {
  console.error('Seeding failed:', err);
  process.exit(1);
}
