import { Test, TestingModule } from '@nestjs/testing';
import { describe, it, expect, beforeEach } from 'vitest';
import { AppController } from './app.controller';
import { SecurityService } from './common/security/security.service';
import { NotFoundException } from '@nestjs/common';

describe('AppController', () => {
  let appController: AppController;
  let securityService: SecurityService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [SecurityService],
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
      const voteId = 'vote1';
      const result = await appController.getVoteAudit(voteId);

      expect(result).toHaveProperty('voteId', voteId);
      expect(result).toHaveProperty('hash');
      expect(result).toHaveProperty('merkleRoot');
      expect(Array.isArray(result.proof)).toBe(true);
      expect(result.algorithm).toBe('SHA3-512');

      expect(result.proof.length).toBe(2);
    });

    it('should throw NotFoundException when vote does not exist', async () => {
      const fakeVoteId = 'inexistent_vote';

      await expect(appController.getVoteAudit(fakeVoteId)).rejects.toThrow(NotFoundException);
    });

    it('should generate a proof that reconstructs the correct root', async () => {
      const voteId = 'vote2';
      const result = await appController.getVoteAudit(voteId);

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
