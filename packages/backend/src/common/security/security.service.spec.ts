import { describe, expect, it } from 'vitest';
import { SecurityService } from './security.service';

describe('SecurityService', () => {
  const service = new SecurityService();

  it('should generate a 128-character SHA3-512 hash', () => {
    const hash = service.hashSHA3('test');
    expect(hash.length).toBe(128);
  });

  it('should generate a consistent Merkle Root', () => {
    const votes = ['vote1', 'vote2', 'vote3'];
    const root1 = service.generateMerkleRoot(votes);
    const root2 = service.generateMerkleRoot(votes);
    expect(root1).toBe(root2);
    expect(root1.length).toBe(128);
  });

  it('should return an empty string when hashes array is empty', () => {
    const root = service.generateMerkleRoot([]);
    expect(root).toBe('');
  });
});
