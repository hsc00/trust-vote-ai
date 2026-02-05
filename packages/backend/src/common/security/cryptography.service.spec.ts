import { Test, TestingModule } from '@nestjs/testing';
import { describe, expect, it, beforeEach } from 'vitest';
import { CryptographyService } from './cryptography.service';

describe('CryptographyService', () => {
  let service: CryptographyService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CryptographyService],
    }).compile();

    service = module.get<CryptographyService>(CryptographyService);
  });

  it('should generate a 128-character SHA3-512 hash', () => {
    expect(service.hashSHA3('test').length).toBe(128);
  });

  it('should enforce bounds check for index', () => {
    const hashes = ['h1', 'h2'];

    expect(() => service.getMerkleProof(hashes, -1)).toThrow('Index out of bounds');
    expect(() => service.getMerkleProof(hashes, 2)).toThrow('Index out of bounds');
  });

  it('should handle padding in getMerkleProof for odd number of hashes', () => {
    const h0 = service.hashSHA3('0');
    const h1 = service.hashSHA3('1');
    const h2 = service.hashSHA3('2');
    const hashes = [h0, h1, h2];
    const proof = service.getMerkleProof(hashes, 2);
    expect(proof[0].hash).toBe(h2);
    expect(service.verifyProof(h2, proof, service.generateMerkleRoot(hashes))).toBe(true);
  });

  it('should return an empty string when hashes array is empty', () => {
    const root = service.generateMerkleRoot([]);
    expect(root).toBe('');
  });

  it('should correctly generate Merkle Root for an odd number of hashes', () => {
    const h1 = service.hashSHA3('vote1');
    const h2 = service.hashSHA3('vote2');
    const h3 = service.hashSHA3('vote3');
    const hashes = [h1, h2, h3];

    const root = service.generateMerkleRoot(hashes);
    expect(root.length).toBe(128);

    const l1_1 = service.hashSHA3(h1 + h2);
    const l1_2 = service.hashSHA3(h3 + h3);
    const expectedRoot = service.hashSHA3(l1_1 + l1_2);
    expect(root).toBe(expectedRoot);
  });

  it('should generate a correct Merkle proof for a 2 element array', () => {
    const h0 = service.hashSHA3('vote0');
    const h1 = service.hashSHA3('vote1');
    const hashes = [h0, h1];

    const proof = service.getMerkleProof(hashes, 0);
    expect(proof[0]).toEqual({ position: 'right', hash: h1 });
  });

  it('should verify a valid proof', () => {
    const votes = ['v1', 'v2', 'v3', 'v4'].map((v) => service.hashSHA3(v));
    const root = service.generateMerkleRoot(votes);
    const proof = service.getMerkleProof(votes, 2);

    const isValid = service.verifyProof(votes[2], proof, root);
    expect(isValid).toBe(true);
  });

  it('should reject an invalid proof', () => {
    const votes = ['v1', 'v2'].map((v) => service.hashSHA3(v));
    const root = service.generateMerkleRoot(votes);
    const proof = service.getMerkleProof(votes, 0);

    const isInvalid = service.verifyProof(service.hashSHA3('fake-vote'), proof, root);
    expect(isInvalid).toBe(false);
  });

  it('should handle buffer input for hashSHA3', () => {
    const bufferData = Buffer.from('bufferTest');
    const hash = service.hashSHA3(bufferData);
    expect(hash).toBe(service.hashSHA3('bufferTest'));
  });

  it('should verify proof correctly when the node is in an odd position', () => {
    const hashes = ['a', 'b', 'c', 'd', 'e'].map((v) => service.hashSHA3(v));
    const root = service.generateMerkleRoot(hashes);

    const proof = service.getMerkleProof(hashes, 1);

    expect(proof[0].position).toBe('left');
    expect(service.verifyProof(hashes[1], proof, root)).toBe(true);
  });
});
