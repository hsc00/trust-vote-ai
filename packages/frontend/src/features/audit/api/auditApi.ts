import type { AuditVerifyResponse } from '../types';

const API_BASE = process.env.API_URL ?? 'http://localhost:3000';

export async function fetchVoteAudit(voteId: string): Promise<AuditVerifyResponse> {
  const res = await fetch(`${API_BASE}/audit/verify/${voteId}`, { cache: 'no-store' });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const errorBody = body as { message?: string };
    throw new Error(errorBody.message ?? `Verification failed (${res.status})`);
  }
  return res.json() as Promise<AuditVerifyResponse>;
}
