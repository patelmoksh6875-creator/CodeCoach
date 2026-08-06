import React from 'react';
import { X, BookOpen } from 'lucide-react';
import type { ExplanationResult } from '../../types/coach';

interface ExplainDrawerProps {
  snippet: string;
  result: ExplanationResult;
  onClose: () => void;
}

/** Non-blocking slide-in drawer (NOT a modal) showing a highlighted snippet's explanation. */
export function ExplainDrawer({ snippet, result, onClose }: ExplainDrawerProps) {
  return (
    <div className="fixed right-0 top-0 z-40 h-full w-full max-w-sm border-l border-neutral-800 bg-neutral-950 shadow-2xl">
      <div className="flex items-center justify-between border-b border-neutral-800 px-4 py-3">
        <div className="flex items-center gap-2 text-sm font-medium text-neutral-100">
          <BookOpen size={16} className="text-blue-400" />
          Explanation
        </div>
        <button onClick={onClose} className="text-neutral-500 hover:text-neutral-200" aria-label="Close">
          <X size={18} />
        </button>
      </div>

      <div className="h-[calc(100%-49px)] overflow-y-auto px-4 py-4 space-y-4">
        <pre className="overflow-x-auto rounded bg-black px-3 py-2 text-xs text-neutral-300">{snippet}</pre>

        <Section label="Purpose" text={result.purpose} />
        <Section label="Inputs & outputs" text={result.inputsAndOutputs} />
        <Section label="Where it's used" text={result.whereUsed} />

        <div>
          <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-neutral-500">Common mistakes</div>
          <ul className="list-disc space-y-1 pl-4 text-sm text-neutral-300">
            {result.commonMistakes.map((m, i) => (
              <li key={i}>{m}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

function Section({ label, text }: { label: string; text: string }) {
  return (
    <div>
      <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-neutral-500">{label}</div>
      <p className="text-sm text-neutral-300">{text}</p>
    </div>
  );
}
