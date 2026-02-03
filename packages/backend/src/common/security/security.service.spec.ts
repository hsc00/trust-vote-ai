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

  it('should return the hash itself when hashes array has one element', () => {
    const hash = service.hashSHA3('singleVote');
    const root = service.generateMerkleRoot([hash]);
    expect(root).toBe(hash);
  });

  it('should correctly generate Merkle Root for an odd number of hashes', () => {
    const h1 = service.hashSHA3('vote1');
    const h2 = service.hashSHA3('vote2');
    const h3 = service.hashSHA3('vote3');
    const h4 = service.hashSHA3('vote4');
    const h5 = service.hashSHA3('vote5');
    const hashes = [h1, h2, h3, h4, h5];

    const root = service.generateMerkleRoot(hashes);
    expect(root.length).toBe(128);

    const l1_1 = service.hashSHA3(h1 + h2);
    const l1_2 = service.hashSHA3(h3 + h4);
    const l1_3 = service.hashSHA3(h5 + h5); // Padding for odd number of elements

    const l2_1 = service.hashSHA3(l1_1 + l1_2);
    const l2_2 = service.hashSHA3(l1_3 + l1_3); // Padding for odd number of elements in the next layer

    const expectedRoot = service.hashSHA3(l2_1 + l2_2);
    expect(root).toBe(expectedRoot);
  });

  it('should return an empty array if hashes array is empty for Merkle proof', () => {
    const proof = service.getMerkleProof([], 0);
    expect(proof).toEqual([]);
  });

  it('should return an empty array if hashes array has one element for Merkle proof', () => {
    const hash = service.hashSHA3('single');
    const proof = service.getMerkleProof([hash], 0);
    expect(proof).toEqual([]);
  });

  it('should generate a correct Merkle proof for the first element (even index) in a 2-element array', () => {
    const h0 = service.hashSHA3('vote0');
    const h1 = service.hashSHA3('vote1');
    const hashes = [h0, h1];

    const proof = service.getMerkleProof(hashes, 0);
    expect(proof.length).toBe(1);
    expect(proof[0]).toEqual({ position: 'right', hash: h1 });
  });

  it('should generate a correct Merkle proof for the second element (odd index) in a 2-element array', () => {
    const h0 = service.hashSHA3('vote0');
    const h1 = service.hashSHA3('vote1');
    const hashes = [h0, h1];

    const proof = service.getMerkleProof(hashes, 1);
    expect(proof.length).toBe(1);
    expect(proof[0]).toEqual({ position: 'left', hash: h0 });
  });

  it('should generate a correct Merkle proof for an element at index 0 in a 4-element array', () => {
    const h0 = service.hashSHA3('vote0');
    const h1 = service.hashSHA3('vote1');
    const h2 = service.hashSHA3('vote2');
    const h3 = service.hashSHA3('vote3');
    const hashes = [h0, h1, h2, h3];

    const proof = service.getMerkleProof(hashes, 0);
    expect(proof.length).toBe(2);
    expect(proof[0]).toEqual({ position: 'right', hash: h1 });
    expect(proof[1]).toEqual({ position: 'right', hash: service.hashSHA3(h2 + h3) });
  });

  it('should generate a correct Merkle proof for an element at index 1 in a 4-element array', () => {
    const h0 = service.hashSHA3('vote0');
    const h1 = service.hashSHA3('vote1');
    const h2 = service.hashSHA3('vote2');
    const h3 = service.hashSHA3('vote3');
    const hashes = [h0, h1, h2, h3];

    const proof = service.getMerkleProof(hashes, 1);
    expect(proof.length).toBe(2);
    expect(proof[0]).toEqual({ position: 'left', hash: h0 });
    expect(proof[1]).toEqual({ position: 'right', hash: service.hashSHA3(h2 + h3) });
  });

  it('should generate a correct Merkle proof for an element at index 2 in a 4-element array', () => {
    const h0 = service.hashSHA3('vote0');
    const h1 = service.hashSHA3('vote1');
    const h2 = service.hashSHA3('vote2');
    const h3 = service.hashSHA3('vote3');
    const hashes = [h0, h1, h2, h3];

    const proof = service.getMerkleProof(hashes, 2);
    expect(proof.length).toBe(2);
    expect(proof[0]).toEqual({ position: 'right', hash: h3 });
    expect(proof[1]).toEqual({ position: 'left', hash: service.hashSHA3(h0 + h1) });
  });

  it('should generate a correct Merkle proof for an element at index 3 in a 4-element array', () => {
    const h0 = service.hashSHA3('vote0');
    const h1 = service.hashSHA3('vote1');
    const h2 = service.hashSHA3('vote2');
    const h3 = service.hashSHA3('vote3');
    const hashes = [h0, h1, h2, h3];

    const proof = service.getMerkleProof(hashes, 3);
    expect(proof.length).toBe(2);
    expect(proof[0]).toEqual({ position: 'left', hash: h2 });
    expect(proof[1]).toEqual({ position: 'left', hash: service.hashSHA3(h0 + h1) });
  });

  it('should generate a correct Merkle proof for an element at index 0 in a 3-element array', () => {
    const h0 = service.hashSHA3('vote0');
    const h1 = service.hashSHA3('vote1');
    const h2 = service.hashSHA3('vote2');
    const hashes = [h0, h1, h2];

    const proof = service.getMerkleProof(hashes, 0);
    expect(proof.length).toBe(2);
    expect(proof[0]).toEqual({ position: 'right', hash: h1 });
    expect(proof[1]).toEqual({ position: 'right', hash: service.hashSHA3(h2 + h2) });
  });

  it('should generate a correct Merkle proof for an element at index 1 in a 3-element array', () => {
    const h0 = service.hashSHA3('vote0');
    const h1 = service.hashSHA3('vote1');
    const h2 = service.hashSHA3('vote2');
    const hashes = [h0, h1, h2];

    const proof = service.getMerkleProof(hashes, 1);
    expect(proof.length).toBe(2);
    expect(proof[0]).toEqual({ position: 'left', hash: h0 });
    expect(proof[1]).toEqual({ position: 'right', hash: service.hashSHA3(h2 + h2) });
  });

  it('should generate a correct Merkle proof for the last element (index 2) in a 3-element array, handling padding', () => {
    const h0 = service.hashSHA3('vote0');
    const h1 = service.hashSHA3('vote1');
    const h2 = service.hashSHA3('vote2');
    const hashes = [h0, h1, h2];

    const proof = service.getMerkleProof(hashes, 2);
    expect(proof.length).toBe(2);
    expect(proof[0]).toEqual({ position: 'right', hash: h2 });
    expect(proof[1]).toEqual({ position: 'left', hash: service.hashSHA3(h0 + h1) });
  });

  it('should handle buffer input for hashSHA3', () => {
    const bufferData = Buffer.from('bufferTest');
    const hash = service.hashSHA3(bufferData);
    expect(hash.length).toBe(128);
    expect(hash).toBe(service.hashSHA3('bufferTest'));
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
});
