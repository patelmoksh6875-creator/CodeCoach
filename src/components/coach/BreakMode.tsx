import React, { useState } from 'react';
import { Zap, X } from 'lucide-react';
import type { BreakModeChallenge } from '../../types/coach';

interface BreakModeProps {
  challenge: BreakModeChallenge;
  onResolve: (wasCorrect: boolean) => void;
}

/** "Predict what happens if you change X" quiz modal. */
export function BreakMode({ challenge, onResolve }: BreakModeProps) {
  const [selected, setSelected] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const isCorrect = selected === challenge.correctOptionIndex;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
      <div className="w-full max-w-lg rounded-lg border border-neutral-700 bg-neutral-900 shadow-xl">
        <div className="flex items-center justify-between border-b border-neutral-800 px-5 py-3">
          <div className="flex items-center gap-2 text-sm font-medium text-neutral-100">
            <Zap size={16} className="text-amber-400" />
            Break Mode
          </div>
          <button onClick={() => onResolve(false)} className="text-neutral-500 hover:text-neutral-200" aria-label="Close">
            <X size={18} />
          </button>
        </div>

        <div className="px-5 py-4">
          <p className="mb-4 text-sm text-neutral-200">{challenge.question}</p>

          <div className="space-y-2">
            {challenge.options.map((opt, i) => {
              const isSelected = selected === i;
              const showCorrectness = submitted && (i === challenge.correctOptionIndex || isSelected);
              return (
                <button
                  key={i}
                  disabled={submitted}
                  onClick={() => setSelected(i)}
                  className={`w-full rounded border px-3 py-2 text-left text-sm transition-colors ${
                    showCorrectness
                      ? i === challenge.correctOptionIndex
                        ? 'border-emerald-600 bg-emerald-950/40 text-emerald-200'
                        : 'border-red-600 bg-red-950/40 text-red-200'
                      : isSelected
                      ? 'border-neutral-400 bg-neutral-800 text-neutral-100'
                      : 'border-neutral-800 bg-neutral-950 text-neutral-300 hover:border-neutral-600'
                  }`}
                >
                  {opt}
                </button>
              );
            })}
          </div>

          {submitted && (
            <p className="mt-4 rounded border border-neutral-800 bg-neutral-950 p-3 text-sm text-neutral-300">
              {challenge.explanation}
            </p>
          )}
        </div>

        <div className="flex justify-end gap-2 border-t border-neutral-800 px-5 py-3">
          {!submitted ? (
            <button
              disabled={selected === null}
              onClick={() => setSubmitted(true)}
              className="rounded bg-neutral-100 px-3 py-1.5 text-xs font-medium text-neutral-900 disabled:opacity-40 hover:bg-white"
            >
              Submit prediction
            </button>
          ) : (
            <button
              onClick={() => onResolve(isCorrect)}
              className="rounded bg-neutral-100 px-3 py-1.5 text-xs font-medium text-neutral-900 hover:bg-white"
            >
              Continue
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
