import type { AuditVerifyResponse } from '../types';

interface Props {
  readonly result: AuditVerifyResponse;
}

const DECISION_CONFIG: Record<
  AuditVerifyResponse['decision'],
  { phrase: string; icon: string; colors: string }
> = {
  yes: {
    phrase: 'You voted YES',
    icon: '✓',
    colors: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400',
  },
  no: {
    phrase: 'You voted NO',
    icon: '✕',
    colors: 'border-amber-500/30 bg-amber-500/10 text-amber-400',
  },
  abstain: {
    phrase: 'You chose to abstain',
    icon: 'ℹ',
    colors: 'border-zinc-600/30 bg-zinc-700/10 text-zinc-400',
  },
};

function formatVoteDate(timestamp: string): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(timestamp));
}

export default function AuditResult({ result }: Props) {
  const cfg = DECISION_CONFIG[result.decision];

  return (
    <section
      aria-label="Vote confirmation"
      className="rounded-xl border border-zinc-800 bg-zinc-900 p-6 space-y-5"
    >
      {/* Hero status */}
      <div className={`flex items-center gap-4 rounded-lg border p-4 ${cfg.colors}`}>
        <span
          aria-hidden="true"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-current/10 text-xl font-bold"
        >
          {cfg.icon}
        </span>
        <div>
          <h2 className="font-semibold text-zinc-100">{cfg.phrase}</h2>
          <p className="mt-0.5 text-sm text-zinc-400">Voted on {formatVoteDate(result.timestamp)}</p>
        </div>
      </div>

      <p className="text-xs text-zinc-500 text-center">
        Your vote has been saved permanently. No one can change it.
      </p>
    </section>
  );
}
