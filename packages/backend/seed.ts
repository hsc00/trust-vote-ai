import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as dotenv from 'dotenv';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as schema from './src/db/schema.js';
import { randomUUID, createHash } from 'node:crypto';
import { CryptographyService } from './src/common/security/cryptography.service.js';

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
      contentHash: createHash('sha3-512')
        .update(
          'A comprehensive bill to address climate change through renewable energy incentives.',
        )
        .digest('hex'),
      status: 'active' as const,
    },
    {
      id: randomUUID(),
      title: 'Education Reform Act',
      content: 'Reforms to improve public education funding and standards.',
      url: 'https://example.com/education-act',
      contentHash: createHash('sha3-512')
        .update('Reforms to improve public education funding and standards.')
        .digest('hex'),
      status: 'draft' as const,
    },
  ];

  const vote1UserId = randomUUID();
  const vote2UserId = randomUUID();
  const vote3UserId = randomUUID();

  const votes = [
    {
      id: randomUUID(),
      docId: docs[0].id,
      userId: vote1UserId,
      decision: 'yes' as const,
      hash: createHash('sha3-512').update(`${docs[0].id}-${vote1UserId}-yes`).digest('hex'),
    },
    {
      id: randomUUID(),
      docId: docs[0].id,
      userId: vote2UserId,
      decision: 'no' as const,
      hash: createHash('sha3-512').update(`${docs[0].id}-${vote2UserId}-no`).digest('hex'),
    },
    {
      id: randomUUID(),
      docId: docs[1].id,
      userId: vote3UserId,
      decision: 'abstain' as const,
      hash: createHash('sha3-512').update(`${docs[1].id}-${vote3UserId}-abstain`).digest('hex'),
    },
  ];

  const cryptoService = new CryptographyService();
  const docHashes = votes.filter((vote) => vote.docId === docs[0].id).map((vote) => vote.hash);

  const snapshot = {
    id: randomUUID(),
    docId: docs[0].id,
    rootHash: cryptoService.generateMerkleRoot(docHashes),
    totalVotes: docHashes.length,
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
  await pool.end();
  process.exit(0);
}

try {
  await seed();
} catch (err) {
  console.error('Seeding failed:', err);
  await pool.end();
  process.exit(1);
}
