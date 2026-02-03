import { Controller, Get, Param, NotFoundException, Inject } from '@nestjs/common';
import { SecurityService, MerkleStep } from './common/security/security.service';

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
    const mockVotes = [
      this.securityService.hashSHA3('vote1'),
      this.securityService.hashSHA3('vote2'),
      this.securityService.hashSHA3('vote3'),
      this.securityService.hashSHA3('vote4'),
    ];

    const voteHash = this.securityService.hashSHA3(voteId);
    const index = mockVotes.indexOf(voteHash);

    if (index === -1) {
      throw new NotFoundException('Vote hash not found in current block');
    }

    const proof: MerkleStep[] = this.securityService.getMerkleProof(mockVotes, index);
    const root = this.securityService.generateMerkleRoot(mockVotes);

    return {
      voteId,
      hash: voteHash,
      proof,
      merkleRoot: root,
      algorithm: 'SHA3-512',
    };
  }
}
