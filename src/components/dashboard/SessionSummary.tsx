import React from 'react';
import { X, Trophy } from 'lucide-react';
import type { SessionSummaryData } from '../../types/knowledge';

interface SessionSummaryProps {
  summary: SessionSummaryData;
  onClose: () => void;
}

/** End-of-session AI-generated summary modal. */
export function SessionSummary({ summary, onClose }: SessionSummaryProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
      <div className="w-full max-w-lg rounded-lg border border-neutral-700 bg-neutral-900 shadow-xl">
        <div className="flex items-center justify-between border-b border-neutral-800 px-5 py-3">
          <div className="flex items-center gap-2 text-sm font-medium text-neutral-100">
            <Trophy size={16} className="text-amber-400" />
            Session summary
          </div>
          <button onClick={onClose} className="text-neutral-500 hover:text-neutral-200" aria-label="Close">
            <X size={18} />
          </button>
        </div>

        <div className="space-y-4 px-5 py-4">
          <p className="text-sm text-neutral-300">{summary.summaryNote}</p>

          <div>
            <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-emerald-500">Learned</div>
            <ul className="list-disc space-y-1 pl-4 text-sm text-neutral-300">
              {summary.learnedConcepts.map((c, i) => <li key={i}>{c}</li>)}
            </ul>
          </div>

          {summary.needsWorkConcepts.length > 0 && (
            <div>
              <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-amber-500">Could use more practice</div>
              <ul className="list-disc space-y-1 pl-4 text-sm text-neutral-300">
                {summary.needsWorkConcepts.map((c, i) => <li key={i}>{c}</li>)}
              </ul>
            </div>
          )}

          <div>
            <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-neutral-500">Next up</div>
            <p className="text-sm text-neutral-300">{summary.recommendedNextTopic}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
