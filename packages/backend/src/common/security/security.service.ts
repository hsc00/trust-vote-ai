import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { DRIZZLE } from '../../db/db.module';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '../../db/schema';
import { eq } from 'drizzle-orm';
import { CryptographyService } from './cryptography.service';

@Injectable()
export class SecurityService {
  constructor(
    @Inject(DRIZZLE) private readonly db: NodePgDatabase<typeof schema>,
    @Inject(forwardRef(() => CryptographyService))
    private readonly crypto: CryptographyService,
  ) {}

  async persistVote(docId: string, userId: string, decision: 'yes' | 'no' | 'abstain') {
    const payload = `${docId}-${userId}-${decision}-${Date.now()}`;
    const voteHash = this.crypto.hashSHA3(payload);

    const [newVote] = await this.db
      .insert(schema.votes)
      .values({ docId, userId, decision, hash: voteHash })
      .returning();

    return newVote;
  }

  async getHashesForDoc(docId: string): Promise<string[]> {
    const allVotes = await this.db
      .select({ hash: schema.votes.hash })
      .from(schema.votes)
      .where(eq(schema.votes.docId, docId))
      .orderBy(schema.votes.timestamp);

    return allVotes.map((v) => v.hash);
  }

  async getVoteById(id: string) {
    const [vote] = await this.db
      .select()
      .from(schema.votes)
      .where(eq(schema.votes.id, id))
      .limit(1);
    return vote;
  }

  async sealDocumentVotes(docId: string) {
    const hashes = await this.getHashesForDoc(docId);
    if (hashes.length === 0) throw new Error('No votes found');

    const rootHash = this.crypto.generateMerkleRoot(hashes);

    const [snapshot] = await this.db
      .insert(schema.merkleSnapshots)
      .values({
        docId,
        rootHash,
        totalVotes: hashes.length,
        algorithm: 'SHA3-512',
      })
      .returning();

    return snapshot;
  }

  getMerkleProof(hashes: string[], index: number) {
    return this.crypto.getMerkleProof(hashes, index);
  }

  generateMerkleRoot(hashes: string[]) {
    return this.crypto.generateMerkleRoot(hashes);
  }

  hashSHA3(data: string | Buffer) {
    return this.crypto.hashSHA3(data);
  }

  verifyProof(leaf: string, proof: any[], root: string) {
    return this.crypto.verifyProof(leaf, proof, root);
  }
}
