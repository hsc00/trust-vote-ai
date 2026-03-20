'use client';

import { useState, useTransition } from 'react';
import { verifyVoteAction } from '../api/auditActions';
import type { AuditVerifyResponse } from '../types';
import AuditResult from './AuditResult';

const UUID_V4_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export default function VoteVerifier() {
  const [voteId, setVoteId] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);
  const [result, setResult] = useState<AuditVerifyResponse | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setValidationError(null);
    setServerError(null);
    setResult(null);

    if (!UUID_V4_RE.test(voteId.trim())) {
      setValidationError(
        'Please enter a valid UUID v4 (e.g. 550e8400-e29b-41d4-a716-446655440000)',
      );
      return;
    }

    startTransition(async () => {
      const response = await verifyVoteAction(voteId.trim());
      if ('error' in response) {
        setServerError(response.error);
      } else {
        setResult(response.data);
      }
    });
  }

  const errorMessage = validationError ?? serverError;

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <input
            type="text"
            value={voteId}
            onChange={(e) => setVoteId(e.target.value)}
            placeholder="Enter Vote ID (UUID v4)"
            disabled={isPending}
            aria-label="Vote ID"
            aria-describedby={errorMessage ? 'verify-error' : undefined}
            className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-3 font-mono text-sm text-zinc-100 placeholder:text-zinc-600 focus:border-zinc-600 focus:outline-none focus:ring-1 focus:ring-zinc-600 disabled:opacity-50"
          />
          {errorMessage && (
            <p id="verify-error" role="alert" className="mt-2 text-xs text-red-400">
              {errorMessage}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={isPending || voteId.trim() === ''}
          className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isPending && (
            <svg className="size-4 animate-spin" fill="none" viewBox="0 0 24 24" aria-hidden="true">
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
          )}
          {isPending ? 'Verifying…' : 'Verify'}
        </button>
      </form>

      {result && <AuditResult result={result} />}
    </div>
  );
}
