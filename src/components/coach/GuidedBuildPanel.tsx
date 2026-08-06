import React, { useEffect, useState } from 'react';
import { X, Wand2, Compass, Sparkles, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import type { GuidedBuildPlan } from '../../types/coach';
import type { GuidedBuildMode } from '../../hooks/useLiveCoach';

interface GuidedBuildPanelProps {
  plan: GuidedBuildPlan;
  mode: GuidedBuildMode;
  isApplying: boolean;
  onApply: () => void;
  onStartTutor: () => void;
  onClose: () => void;
  /** Called whenever the tutor should point at a location in the live editor. */
  onHighlightAnchor: (anchor: string) => void;
}

/**
 * Two-mode panel for a ready guided-build plan:
 *  - "choice": push the change straight into the code, or walk through it yourself
 *  - "tutor": a second-tutor stepper that highlights the relevant spot in the live
 *    editor for each step, one at a time, instead of dumping all hints at once
 */
export function GuidedBuildPanel({
  plan,
  mode,
  isApplying,
  onApply,
  onStartTutor,
  onClose,
  onHighlightAnchor,
}: GuidedBuildPanelProps) {
  if (mode === 'tutor') {
    return (
      <TutorStepper plan={plan} onClose={onClose} onHighlightAnchor={onHighlightAnchor} />
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
      <div className="w-full max-w-lg rounded-lg border border-neutral-700 bg-neutral-900 shadow-xl">
        <div className="flex items-center justify-between border-b border-neutral-800 px-5 py-3">
          <div className="flex items-center gap-2 text-sm font-medium text-neutral-100">
            <Wand2 size={16} className="text-amber-400" />
            Guided plan ready
          </div>
          <button onClick={onClose} className="text-neutral-500 hover:text-neutral-200" aria-label="Close">
            <X size={18} />
          </button>
        </div>

        <div className="px-5 py-4">
          <p className="mb-4 text-sm text-neutral-300">{plan.featureSummary}</p>
          <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-neutral-500">
            {plan.steps.length} steps
          </p>
          <p className="text-xs text-neutral-500">How do you want to do this?</p>
        </div>

        <div className="flex flex-col gap-2 border-t border-neutral-800 px-5 py-4 sm:flex-row">
          <button
            onClick={onStartTutor}
            className="flex flex-1 items-center justify-center gap-2 rounded border border-neutral-700 bg-neutral-950 px-3 py-2.5 text-xs font-medium text-neutral-100 hover:border-neutral-500"
          >
            <Compass size={14} className="text-blue-400" />
            Walk me through it
          </button>
          <button
            onClick={onApply}
            disabled={isApplying}
            className="flex flex-1 items-center justify-center gap-2 rounded bg-neutral-100 px-3 py-2.5 text-xs font-medium text-neutral-900 hover:bg-white disabled:opacity-40"
          >
            {isApplying ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
            {isApplying ? 'Applying…' : 'Push the change for me'}
          </button>
        </div>
      </div>
    </div>
  );
}

function TutorStepper({
  plan,
  onClose,
  onHighlightAnchor,
}: {
  plan: GuidedBuildPlan;
  onClose: () => void;
  onHighlightAnchor: (anchor: string) => void;
}) {
  const [index, setIndex] = useState(0);
  const [showFinal, setShowFinal] = useState(false);
  const step = plan.steps[index];
  const isLast = index === plan.steps.length - 1;

  useEffect(() => {
    if (step?.targetAnchor) onHighlightAnchor(step.targetAnchor);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index]);

  return (
    <div className="fixed bottom-6 right-6 z-50 w-full max-w-sm rounded-lg border border-neutral-700 bg-neutral-900 shadow-2xl">
      <div className="flex items-center justify-between border-b border-neutral-800 px-4 py-2.5">
        <div className="flex items-center gap-2 text-xs font-medium text-neutral-100">
          <Compass size={14} className="text-blue-400" />
          Tutor · step {index + 1} of {plan.steps.length}
        </div>
        <button onClick={onClose} className="text-neutral-500 hover:text-neutral-200" aria-label="Close">
          <X size={16} />
        </button>
      </div>

      <div className="px-4 py-3">
        {!showFinal ? (
          <>
            <div className="mb-1 text-xs font-semibold text-neutral-200">{step.title}</div>
            <p className="text-sm text-neutral-300">{step.guidance}</p>
            {step.codeHint && (
              <pre className="mt-2 overflow-x-auto rounded bg-black px-3 py-2 text-xs text-neutral-300">
                {step.codeHint}
              </pre>
            )}
            {step.targetAnchor && (
              <button
                onClick={() => onHighlightAnchor(step.targetAnchor!)}
                className="mt-2 text-xs text-blue-400 hover:text-blue-300"
              >
                Show me where in the editor
              </button>
            )}
          </>
        ) : (
          <div className="rounded border border-emerald-800/60 bg-emerald-950/30 p-3">
            <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-emerald-500">
              What the finished feature looks like
            </div>
            <p className="text-sm text-emerald-100">{plan.finalSolutionNote}</p>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between border-t border-neutral-800 px-4 py-2.5">
        <button
          onClick={() => setIndex((i) => Math.max(0, i - 1))}
          disabled={index === 0 || showFinal}
          className="flex items-center gap-1 rounded px-2 py-1 text-xs text-neutral-400 hover:text-neutral-100 disabled:opacity-30"
        >
          <ChevronLeft size={14} /> Back
        </button>

        {!showFinal ? (
          <button
            onClick={() => (isLast ? setShowFinal(true) : setIndex((i) => i + 1))}
            className="flex items-center gap-1 rounded bg-neutral-100 px-3 py-1.5 text-xs font-medium text-neutral-900 hover:bg-white"
          >
            {isLast ? 'Finish' : 'Next step'} <ChevronRight size={14} />
          </button>
        ) : (
          <button
            onClick={onClose}
            className="rounded bg-neutral-100 px-3 py-1.5 text-xs font-medium text-neutral-900 hover:bg-white"
          >
            Done
          </button>
        )}
      </div>
    </div>
  );
}
