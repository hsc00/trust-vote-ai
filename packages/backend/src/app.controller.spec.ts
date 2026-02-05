import { Test, TestingModule } from '@nestjs/testing';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AppController } from './app.controller';
import { SecurityService } from './common/security/security.service';
import { CryptographyService } from './common/security/cryptography.service';
import { NotFoundException } from '@nestjs/common';
import { DbModule } from './db/db.module';
import * as dotenv from 'dotenv';
import { resolve } from 'node:path';
import { randomUUID } from 'node:crypto';
import * as schema from './db/schema';

dotenv.config({ path: resolve(process.cwd(), '.env') });

describe('AppController', () => {
  let appController: AppController;
  let securityService: SecurityService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [DbModule],
      controllers: [AppController],
      providers: [SecurityService, CryptographyService],
    }).compile();

    appController = module.get<AppController>(AppController);
    securityService = module.get<SecurityService>(SecurityService);
  });

  describe('health', () => {
    it('should return status "ok"', () => {
      const result = appController.getHealth();
      expect(result.status).toBe('ok');
      expect(result).toHaveProperty('timestamp');
    });
  });

  describe('getVoteAudit', () => {
    it('should return a valid Merkle Proof for a known vote', async () => {
      const docId = randomUUID();

      await securityService['db'].insert(schema.legislativeDocs).values({
        id: docId,
        title: 'Test Doc',
        content: 'Content',
        contentHash: 'hash',
      });

      const vote = await securityService.persistVote(docId, randomUUID(), 'yes');
      const result = await appController.getVoteAudit(vote.id);

      expect(result).toHaveProperty('voteId', vote.id);
      expect(result).toHaveProperty('merkleRoot');
      expect(Array.isArray(result.proof)).toBe(true);
    });

    it('should throw NotFoundException when vote does not exist', async () => {
      const fakeVoteId = randomUUID();
      await expect(appController.getVoteAudit(fakeVoteId)).rejects.toThrow(NotFoundException);
    });

    it('should throw Error when vote has no document associated', async () => {
      const voteId = randomUUID();

      const spy = vi.spyOn(securityService, 'getVoteById').mockResolvedValue({
        id: voteId,
        docId: null,
        userId: randomUUID(),
        decision: 'yes',
        hash: 'mock-hash',
        timestamp: new Date(),
      } as any);

      await expect(appController.getVoteAudit(voteId)).rejects.toThrow(
        'Vote has no document associated.',
      );

      spy.mockRestore();
    });

    it('should generate a proof that reconstructs the correct root', async () => {
      const docId = randomUUID();

      await securityService['db'].insert(schema.legislativeDocs).values({
        id: docId,
        title: 'Test Doc 2',
        content: 'Content 2',
        contentHash: 'hash-v2',
      });

      const vote = await securityService.persistVote(docId, randomUUID(), 'no');
      const result = await appController.getVoteAudit(vote.id);

      let currentHash = result.hash;
      for (const step of result.proof) {
        currentHash =
          step.position === 'left'
            ? securityService.hashSHA3(step.hash + currentHash)
            : securityService.hashSHA3(currentHash + step.hash);
      }

      expect(currentHash).toBe(result.merkleRoot);
    });
  });
});
