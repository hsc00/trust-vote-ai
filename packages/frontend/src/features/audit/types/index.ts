export interface HealthResponse {
  status: string;
  timestamp: string;
}

export interface MerkleStep {
  position: 'left' | 'right';
  hash: string;
}

export interface AuditVerifyResponse {
  voteId: string;
  userId: string;
  decision: 'yes' | 'no' | 'abstain';
  hash: string;
  proof: MerkleStep[];
  merkleRoot: string;
  timestamp: string;
  algorithm: string;
}
