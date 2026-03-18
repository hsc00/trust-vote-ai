import { beforeEach, describe, expect, it, vi } from 'vitest';
import * as auditApi from './auditApi';
import { verifyVoteAction } from './auditActions';

vi.mock('./auditApi');

const mockFetchVoteAudit = vi.mocked(auditApi.fetchVoteAudit);

describe('verifyVoteAction', () => {
  const voteId = '550e8400-e29b-41d4-a716-446655440000';
  const mockData = {
    voteId,
    userId: 'user-1',
    decision: 'yes' as const,
    hash: 'abc123',
    proof: [{ position: 'left' as const, hash: 'sibling-hash' }],
    merkleRoot: 'root-hash',
    timestamp: '2024-01-01T00:00:00.000Z',
    algorithm: 'sha3-256',
  };

  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('returns { data } on successful fetch', async () => {
    mockFetchVoteAudit.mockResolvedValueOnce(mockData);

    const result = await verifyVoteAction(voteId);

    expect(result).toEqual({ data: mockData });
    expect(mockFetchVoteAudit).toHaveBeenCalledWith(voteId);
  });

  it('returns { error } with message when fetchVoteAudit throws an Error', async () => {
    mockFetchVoteAudit.mockRejectedValueOnce(new Error('Vote not found'));

    const result = await verifyVoteAction(voteId);

    expect(result).toEqual({ error: 'Vote not found' });
  });

  it('returns generic error string when a non-Error is thrown', async () => {
    mockFetchVoteAudit.mockRejectedValueOnce('unexpected string error');

    const result = await verifyVoteAction(voteId);

    expect(result).toEqual({ error: 'Verification failed.' });
  });
});
