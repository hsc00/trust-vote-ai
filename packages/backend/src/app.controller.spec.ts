import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { SecurityService } from './common/security/security.service';
import { NotFoundException, UnprocessableEntityException } from '@nestjs/common';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { randomUUID } from 'node:crypto';

describe('AppController', () => {
  let appController: AppController;
  let securityService: SecurityService;

  const mockVoteId = randomUUID();
  const mockVote = {
    id: mockVoteId,
    userId: 'user-1',
    decision: 'yes' as const,
    hash: 'hash-1',
    docId: 'doc-1' as string | null,
    timestamp: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        {
          provide: SecurityService,
          useValue: {
            getVoteById: vi.fn(),
            getHashesForDoc: vi.fn(),
            getMerkleProof: vi.fn(),
            generateMerkleRoot: vi.fn(),
            hashSHA3: vi.fn(),
          },
        },
      ],
    }).compile();

    appController = module.get<AppController>(AppController);
    securityService = module.get<SecurityService>(SecurityService);
  });

  it('health check should return ok', () => {
    const health = appController.getHealth();
    expect(health.status).toBe('ok');
    expect(health.timestamp).toBeDefined();
  });

  describe('getVoteAudit', () => {
    it('should return full audit data (Success Case)', async () => {
      const mockProof = [{ position: 'left' as const, hash: 'sibling' }];

      vi.spyOn(securityService, 'getVoteById').mockResolvedValue(mockVote);
      vi.spyOn(securityService, 'getHashesForDoc').mockResolvedValue(['hash-1', 'hash-2']);
      vi.spyOn(securityService, 'getMerkleProof').mockReturnValue(mockProof);
      vi.spyOn(securityService, 'generateMerkleRoot').mockReturnValue('root-hash');

      const result = await appController.getVoteAudit(mockVoteId);

      expect(result.voteId).toBe(mockVoteId);
      expect(result.proof).toEqual(mockProof);
      expect(result.merkleRoot).toBe('root-hash');
    });

    it('should throw NotFoundException if vote is missing (Service relay)', async () => {
      vi.spyOn(securityService, 'getVoteById').mockRejectedValue(new NotFoundException());
      await expect(appController.getVoteAudit(mockVoteId)).rejects.toThrow(NotFoundException);
    });

    it('should throw UnprocessableEntityException if docId is null', async () => {
      const voteWithoutDoc = {
        ...mockVote,
        docId: null,
      };
      vi.spyOn(securityService, 'getVoteById').mockResolvedValue(voteWithoutDoc);

      await expect(appController.getVoteAudit(mockVoteId)).rejects.toThrow(
        new UnprocessableEntityException('Vote has no document associated.'),
      );
    });

    it('should throw UnprocessableEntityException if hash integrity fails', async () => {
      vi.spyOn(securityService, 'getVoteById').mockResolvedValue(mockVote);
      vi.spyOn(securityService, 'getHashesForDoc').mockResolvedValue(['wrong-hash']);

      const act = () => appController.getVoteAudit(mockVoteId);

      await expect(act).rejects.toThrow(UnprocessableEntityException);
      await expect(act).rejects.toThrow(/Data integrity error/);
    });
  });

  describe('getVoteAudit', () => {
    it('should return a valid Merkle Proof for a known vote', async () => {
      const voteId = mockVote.id;
      vi.spyOn(securityService, 'getVoteById').mockResolvedValue(mockVote);
      vi.spyOn(securityService, 'getHashesForDoc').mockResolvedValue(['hash-1', 'hash-2']);
      vi.spyOn(securityService, 'getMerkleProof').mockReturnValue([
        { position: 'left' as const, hash: 'sibling' },
        { position: 'right' as const, hash: 'sibling2' },
      ]);
      vi.spyOn(securityService, 'generateMerkleRoot').mockReturnValue('root-hash');

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
      vi.spyOn(securityService, 'getVoteById').mockRejectedValue(new NotFoundException());

      await expect(appController.getVoteAudit(fakeVoteId)).rejects.toThrow(NotFoundException);
    });

    it('should generate a proof that reconstructs the correct root', async () => {
      const voteId = mockVote.id;
      vi.spyOn(securityService, 'getVoteById').mockResolvedValue(mockVote);
      vi.spyOn(securityService, 'getHashesForDoc').mockResolvedValue(['hash-1', 'hash-2']);
      vi.spyOn(securityService, 'getMerkleProof').mockReturnValue([
        { position: 'left' as const, hash: 'sibling' },
      ]);
      vi.spyOn(securityService, 'generateMerkleRoot').mockReturnValue('combined-hash');
      vi.spyOn(securityService, 'hashSHA3').mockReturnValue('combined-hash');

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
