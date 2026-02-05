import { Test, TestingModule } from '@nestjs/testing';
import { describe, expect, it, beforeAll } from 'vitest';
import { SecurityService } from './security.service';
import { DbModule } from '../../db/db.module';
import { randomUUID } from 'node:crypto';
import { CryptographyService } from './cryptography.service';
import * as dotenv from 'dotenv';
import * as path from 'node:path';
import * as schema from '../../db/schema';

dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

describe('SecurityService', () => {
  let service: SecurityService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [DbModule],
      providers: [SecurityService, CryptographyService],
    }).compile();

    service = module.get<SecurityService>(SecurityService);
  });

  it('should persist a vote in the database and verify it with Merkle logic', async () => {
    const docId = randomUUID();
    const userId = randomUUID();

    await service['db'].insert(schema.legislativeDocs).values({
      id: docId,
      title: 'Test Document',
      content: 'Proposal Content',
      contentHash: service.hashSHA3('Proposal Content'),
    });

    const vote = await service.persistVote(docId, userId, 'yes');

    expect(vote.id).toBeDefined();
    expect(vote.hash.length).toBe(128);

    const hashes = await service.getHashesForDoc(docId);
    expect(hashes.length).toBeGreaterThan(0);

    const root = service.generateMerkleRoot(hashes);
    const index = hashes.indexOf(vote.hash);
    const proof = service.getMerkleProof(hashes, index);

    const isValid = service.verifyProof(vote.hash, proof, root);
    expect(isValid).toBe(true);
  });

  it('should seal document votes and create a merkle snapshot', async () => {
    const docId = randomUUID();

    await service['db'].insert(schema.legislativeDocs).values({
      id: docId,
      title: 'Test Document for Sealing',
      content: 'Final Content',
      contentHash: service.hashSHA3('Final Content'),
    });

    await expect(service.sealDocumentVotes(docId)).rejects.toThrow('No votes found');

    await service.persistVote(docId, randomUUID(), 'yes');
    await service.persistVote(docId, randomUUID(), 'no');

    const snapshot = await service.sealDocumentVotes(docId);

    expect(snapshot.id).toBeDefined();
    expect(snapshot.docId).toBe(docId);
    expect(snapshot.totalVotes).toBe(2);
    expect(snapshot.rootHash.length).toBe(128);
    expect(snapshot.algorithm).toBe('SHA3-512');
  });
});
