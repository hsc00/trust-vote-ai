import { Injectable } from '@nestjs/common';
import { createHash } from 'node:crypto';

export interface MerkleStep {
  position: 'left' | 'right';
  hash: string;
}

@Injectable()
export class CryptographyService {
  hashSHA3(data: string | Buffer): string {
    return createHash('sha3-512').update(data).digest('hex');
  }

  generateMerkleRoot(hashes: string[]): string {
    if (hashes.length === 0) return '';
    if (hashes.length === 1) return hashes[0];

    const layer: string[] = [];
    for (let i = 0; i < hashes.length; i += 2) {
      const left = hashes[i];
      const right = hashes[i + 1] || left;
      layer.push(this.hashSHA3(left + right));
    }

    return this.generateMerkleRoot(layer);
  }

  getMerkleProof(hashes: string[], index: number): MerkleStep[] {
    const proof: MerkleStep[] = [];
    let currentLayer = hashes;
    let currentIndex = index;

    while (currentLayer.length > 1) {
      const isRightNode = currentIndex % 2 !== 0;
      const siblingIndex = isRightNode ? currentIndex - 1 : currentIndex + 1;
      const siblingHash = currentLayer[siblingIndex] ?? currentLayer[currentIndex];

      proof.push({
        position: isRightNode ? 'left' : 'right',
        hash: siblingHash,
      });

      const nextLayer = [];
      for (let i = 0; i < currentLayer.length; i += 2) {
        const left = currentLayer[i];
        const right = currentLayer[i + 1] || left;
        nextLayer.push(this.hashSHA3(left + right));
      }
      currentLayer = nextLayer;
      currentIndex = Math.floor(currentIndex / 2);
    }
    return proof;
  }

  verifyProof(leafHash: string, proof: MerkleStep[], root: string): boolean {
    let currentHash = leafHash;
    for (const step of proof) {
      currentHash =
        step.position === 'left'
          ? this.hashSHA3(step.hash + currentHash)
          : this.hashSHA3(currentHash + step.hash);
    }
    return currentHash === root;
  }
}
