'use server';

import { fetchVoteAudit } from './auditApi';
import type { AuditVerifyResponse } from '../types';

export async function verifyVoteAction(
  voteId: string,
): Promise<{ data: AuditVerifyResponse } | { error: string }> {
  try {
    const data = await fetchVoteAudit(voteId);
    return { data };
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Verification failed.' };
  }
}
