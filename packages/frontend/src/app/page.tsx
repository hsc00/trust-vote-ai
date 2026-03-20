import type { Metadata } from 'next';
import { VoteVerifier } from '@/features/audit';

export const metadata: Metadata = {
  title: 'Verify your vote | TrustVote AI',
};

const HOW_IT_WORKS = [
  {
    step: 1,
    heading: 'Your vote is locked',
    text: 'When you vote, we create a unique digital lock for it. No one can change your vote without breaking that lock.',
  },
  {
    step: 2,
    heading: 'Every lock is connected',
    text: 'All votes are linked together in a chain. If any single vote were altered, the whole chain would show it.',
  },
  {
    step: 3,
    heading: 'You hold the key',
    text: 'Your Vote ID lets you check the chain at any time. Only you can look up your own vote.',
  },
] as const;

export default async function Page() {
  return (
    <div className="space-y-12">
      {/* Hero */}
      <div className="space-y-3">
        <h1 className="text-3xl font-semibold tracking-tight text-zinc-100">Verify your vote</h1>
        <p className="max-w-2xl text-zinc-400">
          Your vote is protected by a tamper-proof digital lock. Enter your Vote ID to confirm it
          was received and recorded exactly as you intended.
        </p>
      </div>

      <VoteVerifier />

      {/* Section divider */}
      <hr className="border-zinc-800" />

      {/* How your vote is protected */}
      <div className="space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-zinc-500">
          How your vote is protected
        </h2>
        <ol className="space-y-6">
          {HOW_IT_WORKS.map(({ step, heading, text }) => (
            <li key={step} className="flex items-start gap-4">
              <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-zinc-800 text-xs font-medium text-zinc-400">
                {step}
              </span>
              <div className="pt-0.5">
                <p className="text-sm font-semibold text-zinc-300 mb-1">{heading}</p>
                <p className="text-sm text-zinc-400">{text}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
