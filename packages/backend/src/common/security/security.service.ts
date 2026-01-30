import { Injectable } from '@nestjs/common';
import { createHash } from 'node:crypto';

@Injectable()
export class SecurityService {
  hashSHA3(data: string | Buffer): string {
    return createHash('sha3-512').update(data).digest('hex');
  }

  // Ensures high-integrity auditing for blocks of data/votes.
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
}
