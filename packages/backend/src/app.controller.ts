import { Controller, Get, Param, NotFoundException, Inject } from '@nestjs/common';
import { SecurityService } from './common/security/security.service';

@Controller('audit')
export class AppController {
  constructor(
    @Inject(SecurityService)
    private readonly securityService: SecurityService,
  ) {}

  @Get('health')
  getHealth() {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }

  @Get('verify/:voteId')
  async getVoteAudit(@Param('voteId') voteId: string) {
    const vote = await this.securityService.getVoteById(voteId);

    if (!vote) {
      throw new NotFoundException('Vote not found in database.');
    }

    if (!vote.docId) {
      throw new Error('Vote has no document associated.');
    }

    const allHashes = await this.securityService.getHashesForDoc(vote.docId);
    const index = allHashes.indexOf(vote.hash);

    const proof = this.securityService.getMerkleProof(allHashes, index);
    const root = this.securityService.generateMerkleRoot(allHashes);

    return {
      voteId: vote.id,
      userId: vote.userId,
      decision: vote.decision,
      hash: vote.hash,
      proof,
      merkleRoot: root,
      timestamp: vote.timestamp,
      algorithm: 'SHA3-512',
    };
  }
}
