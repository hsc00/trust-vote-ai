import { Test, TestingModule } from '@nestjs/testing';
import { describe, expect, it, beforeEach, vi } from 'vitest';
import { SecurityService } from './security.service';
import { DRIZZLE } from '../../db/db.module';
import { CryptographyService } from './cryptography.service';
import { randomUUID } from 'node:crypto';
import { NotFoundException } from '@nestjs/common';

describe('SecurityService', () => {
  let service: SecurityService;
  let cryptoService: CryptographyService;

  const mockDb = {
    insert: vi.fn().mockReturnThis(),
    values: vi.fn().mockReturnThis(),
    returning: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    from: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    orderBy: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SecurityService,
        {
          provide: CryptographyService,
          useValue: {
            hashSHA3: vi.fn().mockReturnValue('mocked-hash'),
            generateMerkleRoot: vi.fn().mockReturnValue('root-hash'),
            getMerkleProof: vi.fn().mockReturnValue([{ position: 'left', hash: 'p' }]),
            verifyProof: vi.fn().mockReturnValue(true),
          },
        },
        { provide: DRIZZLE, useValue: mockDb },
      ],
    }).compile();

    service = module.get<SecurityService>(SecurityService);
    cryptoService = module.get<CryptographyService>(CryptographyService);
    vi.clearAllMocks();
  });

  describe('persistVote', () => {
    it('should persist a vote and return it', async () => {
      const mockNewVote = { id: 'v1', hash: 'h1' };
      mockDb.returning.mockResolvedValueOnce([mockNewVote]);

      const result = await service.persistVote(randomUUID(), randomUUID(), 'yes');

      expect(result).toEqual(mockNewVote);
      expect(cryptoService.hashSHA3).toHaveBeenCalled();
      expect(mockDb.insert).toHaveBeenCalled();
    });
  });

  describe('getHashesForDoc', () => {
    it('should return an array of hashes', async () => {
      const mockHashes = [{ hash: 'h1' }, { hash: 'h2' }];
      mockDb.orderBy.mockResolvedValueOnce(mockHashes);

      const result = await service.getHashesForDoc('doc1');

      expect(result).toEqual(['h1', 'h2']);
      expect(mockDb.select).toHaveBeenCalled();
    });
  });

  describe('getVoteById', () => {
    it('should return a vote if found', async () => {
      const mockVote = { id: 'v1' };
      mockDb.limit.mockResolvedValueOnce([mockVote]);

      const result = await service.getVoteById('v1');
      expect(result).toEqual(mockVote);
    });

    it('should throw NotFoundException if vote is missing', async () => {
      mockDb.limit.mockResolvedValueOnce([]);

      await expect(service.getVoteById('v1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('sealDocumentVotes', () => {
    it('should create a snapshot if votes exist', async () => {
      mockDb.orderBy.mockResolvedValueOnce([{ hash: 'h1' }]);
      const mockSnapshot = { id: 's1', docId: 'doc1', totalVotes: 1 };
      mockDb.returning.mockResolvedValueOnce([mockSnapshot]);

      const result = await service.sealDocumentVotes('doc1');

      expect(result).toEqual(mockSnapshot);
      expect(cryptoService.generateMerkleRoot).toHaveBeenCalled();
    });

    it('should throw error if no votes found to seal', async () => {
      mockDb.orderBy.mockResolvedValueOnce([]);

      await expect(service.sealDocumentVotes('doc1')).rejects.toThrow('No votes found');
    });
  });

  describe('Passthrough methods', () => {
    it('should wrap getMerkleProof', () => {
      const proof = service.getMerkleProof(['h1'], 0);
      expect(proof).toEqual([{ position: 'left', hash: 'p' }]);
      expect(cryptoService.getMerkleProof).toHaveBeenCalledWith(['h1'], 0);
    });

    it('should wrap generateMerkleRoot', () => {
      const root = service.generateMerkleRoot(['h1']);
      expect(root).toBe('root-hash');
      expect(cryptoService.generateMerkleRoot).toHaveBeenCalledWith(['h1']);
    });

    it('should wrap hashSHA3', () => {
      const hash = service.hashSHA3('data');
      expect(hash).toBe('mocked-hash');
      expect(cryptoService.hashSHA3).toHaveBeenCalledWith('data');
    });

    it('should wrap verifyProof', () => {
      const isValid = service.verifyProof('leaf', [], 'root');
      expect(isValid).toBe(true);
      expect(cryptoService.verifyProof).toHaveBeenCalledWith('leaf', [], 'root');
    });
  });
});
