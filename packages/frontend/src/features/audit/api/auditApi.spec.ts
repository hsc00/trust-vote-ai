import { beforeAll, beforeEach, afterAll, describe, expect, it, vi } from 'vitest';
import { fetchVoteAudit } from './auditApi';

const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

beforeAll(() => {
  process.env.API_URL = 'http://localhost:3000';
});

describe('fetchVoteAudit', () => {
  const voteId = '550e8400-e29b-41d4-a716-446655440000';

  const successPayload = {
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
    mockFetch.mockReset();
  });

  afterAll(() => {
    vi.unstubAllGlobals();
    delete process.env.API_URL;
  });

  it('returns audit data on success', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: vi.fn().mockResolvedValueOnce(successPayload),
    });

    const result = await fetchVoteAudit(voteId);

    expect(result).toEqual(successPayload);
    expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining(`/audit/verify/${voteId}`), {
      cache: 'no-store',
    });
  });

  it('throws with server message when response is not ok and body has message', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 404,
      json: vi.fn().mockResolvedValueOnce({ message: 'Vote not found' }),
    });

    await expect(fetchVoteAudit(voteId)).rejects.toThrow('Vote not found');
  });

  it('throws generic status message when response body is not valid JSON', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: vi.fn().mockRejectedValueOnce(new SyntaxError('Unexpected token')),
    });

    await expect(fetchVoteAudit(voteId)).rejects.toThrow('Verification failed (500)');
  });
});
