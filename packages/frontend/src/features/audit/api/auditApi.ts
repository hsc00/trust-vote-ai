import type { AuditVerifyResponse } from '../types';

export async function fetchVoteAudit(voteId: string): Promise<AuditVerifyResponse> {
  const API_BASE = process.env.API_URL;

  if (!API_BASE) {
    throw new Error('Missing required environment variable: API_URL');
  }

  const encodedId = encodeURIComponent(voteId);
  const res = await fetch(`${API_BASE}/audit/verify/${encodedId}`, { cache: 'no-store' });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const errorBody = body as { message?: string };
    throw new Error(errorBody.message ?? `Verification failed (${res.status})`);
  }
  return res.json() as Promise<AuditVerifyResponse>;
}
