import React, { useState } from 'react';
import { ChevronRight, X, Lightbulb } from 'lucide-react';

export interface RevealStep {
  title: string;
  body: string;
  codeHint?: string;
}

export interface ProgressiveRevealProps {
  heading: string;
  steps: RevealStep[];
  /** Shown only after every step has been revealed. */
  finalLabel: string;
  finalContent: string;
  onClose: () => void;
}

/**
 * Generic progressive-reveal panel: click through steps one at a time, each a little more
 * specific, with the actual answer gated behind having stepped through all of them.
 * Reused for both debug hints and the guided "add a feature" mode — same shape, same UI.
 */
export function ProgressiveReveal({ heading, steps, finalLabel, finalContent, onClose }: ProgressiveRevealProps) {
  const [revealedCount, setRevealedCount] = useState(1);
  const [showFinal, setShowFinal] = useState(false);

  const canRevealMore = revealedCount < steps.length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
      <div className="w-full max-w-lg rounded-lg border border-neutral-700 bg-neutral-900 shadow-xl">
        <div className="flex items-center justify-between border-b border-neutral-800 px-5 py-3">
          <div className="flex items-center gap-2 text-sm font-medium text-neutral-100">
            <Lightbulb size={16} className="text-amber-400" />
            {heading}
          </div>
          <button onClick={onClose} className="text-neutral-500 hover:text-neutral-200" aria-label="Close">
            <X size={18} />
          </button>
        </div>

        <div className="max-h-[60vh] space-y-3 overflow-y-auto px-5 py-4">
          {steps.slice(0, revealedCount).map((step, i) => (
            <div key={i} className="rounded border border-neutral-800 bg-neutral-950 p-3">
              <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-neutral-500">
                Step {i + 1}: {step.title}
              </div>
              <p className="text-sm text-neutral-300">{step.body}</p>
              {step.codeHint && (
                <pre className="mt-2 overflow-x-auto rounded bg-black px-3 py-2 text-xs text-neutral-300">
                  {step.codeHint}
                </pre>
              )}
            </div>
          ))}

          {showFinal && (
            <div className="rounded border border-emerald-800/60 bg-emerald-950/30 p-3">
              <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-emerald-500">
                {finalLabel}
              </div>
              <pre className="overflow-x-auto whitespace-pre-wrap text-sm text-emerald-100">{finalContent}</pre>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2 border-t border-neutral-800 px-5 py-3">
          {canRevealMore && (
            <button
              onClick={() => setRevealedCount((c) => c + 1)}
              className="flex items-center gap-1 rounded bg-neutral-100 px-3 py-1.5 text-xs font-medium text-neutral-900 hover:bg-white"
            >
              Next hint <ChevronRight size={14} />
            </button>
          )}
          {!canRevealMore && !showFinal && (
            <button
              onClick={() => setShowFinal(true)}
              className="rounded bg-amber-500 px-3 py-1.5 text-xs font-medium text-neutral-900 hover:bg-amber-400"
            >
              Reveal {finalLabel.toLowerCase()}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
